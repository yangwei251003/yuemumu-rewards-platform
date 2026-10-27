import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {fixture,migration,key,prefix} from '../integration/fixtures';
import {pool,rows} from '../../packages/db/src/client';
import {ApiError,type Schemas} from '../../packages/sdk/src';
import {reportingMonthBounds,safeCsvCell,parseRosterCsv,reportingWorker} from '../../packages/domain/src/reporting';
import {sha} from '../../packages/domain/src/ledger';
after(async()=>{await migration.end();await pool.end();});
const rejects=(code:string)=>(e:unknown)=>e instanceof ApiError&&e.problem.code===code;
const month='2024-09';
async function reportingScope(id:string,org=prefix){await migration.execute("INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,'REPORTING',?)",[id,org]);}
async function credit(userId:string,points:number,expires:Date){
 const id=randomUUID(),cx=await migration.getConnection();
 try{await cx.beginTransaction();await cx.execute("INSERT INTO ledger_entries(id,user_id,business_key,kind,delta_available,delta_growth,source_type,source_id,rule_version,reason,actor_id,request_id) VALUES (?,?,?,'EARN',?,?,'TEST_FIXTURE',?,'DRAFT_FOR_DEMO:v1','模拟提醒边界夹具',?,?)",[id,userId,id,points,points,id,userId,id]);await cx.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at) VALUES (?,?,?,?)',[id,userId,points,expires]);await cx.execute('UPDATE wallets SET available_points=available_points+?,growth_mileage=growth_mileage+? WHERE user_id=?',[points,points,userId]);await cx.commit();return id;}catch(e){await cx.rollback();throw e;}finally{cx.release();}
}
test('REPORTING real API and MySQL monthly metrics, immutable budgets, private exports and safe roster import',async t=>{
 const ops=await fixture('report_ops',['OPS_MANAGER']),second=await fixture('report_second',['OPS_MANAGER']),auditor=await fixture('report_auditor',['AUDITOR']),student=await fixture('report_student',['STUDENT'],'student'),outsider=await fixture('report_outside',['OPS_MANAGER'],'staff',undefined,prefix+'_OTHER');
 await reportingScope(ops.id);await reportingScope(second.id);await reportingScope(outsider.id,prefix+'_OTHER');
 await t.test('T30 Shanghai month includes exact local midnight and excludes following month; metrics come from actual ledger',async()=>{
  const b=reportingMonthBounds(month);assert.equal(b.start.toISOString(),'2024-08-31T16:00:00.000Z');assert.equal(b.end.toISOString(),'2024-09-30T16:00:00.000Z');assert.throws(()=>reportingMonthBounds('2024-13'));
  const events:[string,number,number,number,string][]=[['EARN',100,0,100,'2024-08-31T15:59:59Z'],['EARN',200,0,200,'2024-08-31T16:00:00Z'],['SPEND',-30,0,0,'2024-09-01T01:00:00Z'],['RESERVE',-20,20,0,'2024-09-01T02:00:00Z'],['RELEASE',20,-20,0,'2024-09-01T03:00:00Z'],['EARN',50,0,50,'2024-09-30T15:59:59Z'],['EARN',400,0,400,'2024-09-30T16:00:00Z']];
  const cx=await migration.getConnection();try{await cx.beginTransaction();for(let i=0;i<events.length;i++){const [kind,a,f,g,at]=events[i],id=randomUUID();await cx.execute('INSERT INTO ledger_entries(id,user_id,business_key,kind,delta_available,delta_reserved,delta_growth,source_type,source_id,rule_version,reason,actor_id,request_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,student.id,id,kind,a,f,g,i===1?'=HYPERLINK("x")':'TEST_FIXTURE',id,'DRAFT_FOR_DEMO:v1','保留模拟历史边界',student.id,id,new Date(at)]);if(kind==='EARN')await cx.execute('INSERT INTO point_lots(entry_id,user_id,available,consumed,expires_at) VALUES (?,?,?,?,?)',[id,student.id,a-(i===0?30:0),i===0?30:0,new Date('2099-01-01T00:00:00Z')]);}await cx.execute('UPDATE wallets SET available_points=720,growth_mileage=750 WHERE user_id=?',[student.id]);await cx.commit();}catch(e){await cx.rollback();throw e;}finally{cx.release();}
  const report=await ops.client.call('getReportingMonth',undefined,{month});assert.equal(report.issuedPoints,250);assert.equal(report.spentPoints,30);assert.equal(report.reservedPoints,20);assert.equal(report.releasedPoints,20);assert.equal(report.closingAvailablePoints,320);assert.equal(report.closingFrozenPoints,0);assert.equal(report.netGrowthChange,250);assert.equal(report.budgetStatus,'NOT_SET');assert.equal((await outsider.client.call('getReportingMonth',undefined,{month})).issuedPoints,0);
  await assert.rejects(student.client.call('getReportingMonth',undefined,{month}),e=>e instanceof ApiError&&e.status===401);await student.client.call('getSession');
 });
 await t.test('two budget writers use expected version; only one immutable version and audit are appended',async()=>{
  const body:Schemas['ReportingBudgetRequest']={month,expectedVersion:0,budgetCents:2000,reason:'本地模拟月度成本预算，不是采购授权',demoOnly:true};
  const results=await Promise.allSettled([ops.client.call('setReportingBudget',body,{},key()),second.client.call('setReportingBudget',body,{},key())]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);for(const r of results)if(r.status==='rejected')assert.ok(rejects('VERSION_CONFLICT')(r.reason));
  assert.equal((await rows(pool,'SELECT id FROM reporting_budget_versions WHERE organization_id=? AND month=?',[prefix,month])).length,1);
  await assert.rejects(auditor.client.call('setReportingBudget',body,{},key()),rejects('FORBIDDEN'));
 });
 let cost:Schemas['ReportingCost'];
 await t.test('integer simulated cost has request and business idempotency, budget warning and append-only reversal',async()=>{
  const b:Schemas['ReportingCostRequest']={businessKey:'SIM_COST_'+prefix.toUpperCase()+'_ONE',amountCents:3000,description:'\t=HYPERLINK("https://invalid.example")',occurredAt:'2024-09-02T04:00:00.000Z',demoOnly:true},stable=key();
  cost=await ops.client.call('recordReportingCost',b,{},stable);assert.equal((await ops.client.call('recordReportingCost',b,{},stable)).id,cost.id);assert.equal((await second.client.call('recordReportingCost',b,{},key())).id,cost.id);
  await assert.rejects(ops.client.call('recordReportingCost',{...b,amountCents:3001},{},key()),rejects('COST_BUSINESS_CONFLICT'));
  let report=await ops.client.call('getReportingMonth',undefined,{month});assert.equal(report.costCents,3000);assert.equal(report.remainingBudgetCents,-1000);assert.equal(report.budgetStatus,'EXCEEDED');
  const budget=await ops.client.call('setReportingBudget',{month,expectedVersion:1,budgetCents:5000,reason:'模拟调整，保留先前预算版本',demoOnly:true},{},key());assert.equal(budget.version,2);report=await ops.client.call('getReportingMonth',undefined,{month});assert.equal(report.budgetStatus,'WITHIN_BUDGET');assert.equal((await rows(pool,'SELECT id FROM reporting_budget_versions WHERE organization_id=?',[prefix])).length,2);
  const budgetPage=await auditor.client.call('listReportingBudgets',undefined,{month,limit:1});assert.equal(budgetPage.items[0].version,1);assert.equal((await auditor.client.call('listReportingBudgets',undefined,{month,limit:1,cursor:budgetPage.nextCursor!})).items[0].version,2);assert.equal((await ops.client.call('listReportingCosts',undefined,{month})).items[0].id,cost.id);
  await assert.rejects(outsider.client.call('reverseReportingCost',{reason:'不能冲正另一组织费用',demoOnly:true},{costId:cost.id},key()),rejects('NOT_FOUND'));
  const reversed=await ops.client.call('reverseReportingCost',{reason:'模拟费用全额冲正，原记录不删除',demoOnly:true},{costId:cost.id},key());assert.equal(reversed.amountCents,-3000);assert.equal((await ops.client.call('reverseReportingCost',{reason:'重复操作仍只保留一次冲正',demoOnly:true},{costId:cost.id},key())).id,reversed.id);
  assert.equal(Number((await rows<{n:string}>(pool,'SELECT SUM(amount_cents) n FROM reporting_cost_events WHERE organization_id=?',[prefix]))[0].n),0);
 });
 await t.test('T25 export applies column allowlist, organization scope, RFC quoting and spreadsheet formula protection',async()=>{
  const e=await auditor.client.call('exportReportingCsv',{month,dataset:'LEDGER'},{},key());assert.equal(e.rowCount,5);assert.equal(e.sha256,sha(e.csvText));assert.equal(e.truncated,false);assert.ok(e.csvText.includes("\"'=HYPERLINK("));assert.ok(!e.csvText.includes(student.id));assert.ok(!e.columns.includes('reason'));assert.ok(!e.columns.includes('password_hash'));
  const costs=await ops.client.call('exportReportingCsv',{month,dataset:'COSTS'},{},key());assert.equal(costs.rowCount,1);assert.ok(costs.csvText.includes("\"'\t=HYPERLINK("));assert.equal((await outsider.client.call('exportReportingCsv',{month,dataset:'LEDGER'},{},key())).rowCount,0);
  for(const value of ['=1+1',' +1','-cmd','@SUM(A1)','\t=1','\r=1','\n=1'])assert.ok(safeCsvCell(value).startsWith('"\''));assert.equal(safeCsvCell(-10),'-10');assert.equal(safeCsvCell('a,"b"'),'"a,""b"""');
  await assert.rejects(student.client.call('exportReportingCsv',{month,dataset:'LEDGER'},{},key()),e=>e instanceof ApiError&&e.status===401);await student.client.call('getSession');
 });
 await t.test('dry-run rejects roles, balances, real-name shapes, formulas and duplicate business keys without persisting rejected content',async()=>{
  const before=(await rows<{n:number}>(pool,'SELECT COUNT(*) n FROM users WHERE organization_id=?',[prefix]))[0].n;
  const badCsv=['externalKey,displayName,roles,balance\nSIM_X,模拟学员-A001,SYSTEM_ADMIN,9999','externalKey,displayName\nSIM_X,张三13800138000','externalKey,displayName\n=HYPERLINK(x),模拟学员-A001','externalKey,displayName\nSIM_X,模拟学员-A001\nSIM_X,模拟学员-A001','externalKey,displayName\n"SIM_X,模拟学员-A001'];
  for(const csvText of badCsv){const batch=await ops.client.call('previewDemoRosterImport',{csvText,demoOnly:true},{},key());assert.equal(batch.status,'INVALID');assert.ok(batch.issues.length>0);const stored=(await rows<{safe_rows:unknown;issues:unknown}>(pool,'SELECT safe_rows,issues FROM reporting_import_batches WHERE id=?',[batch.id]))[0];assert.ok(!JSON.stringify(stored).includes('13800138000'));await assert.rejects(ops.client.call('confirmDemoRosterImport',{expectedHash:batch.sourceHash,demoOnly:true},{batchId:batch.id},key()),rejects('IMPORT_INVALID'));}
  assert.equal((await rows<{n:number}>(pool,'SELECT COUNT(*) n FROM users WHERE organization_id=?',[prefix]))[0].n,before);
  assert.deepEqual(parseRosterCsv('\uFEFFexternalKey,displayName\r\n"SIM_A","模拟学员-A001"\r\n'),[['externalKey','displayName'],['SIM_A','模拟学员-A001']]);assert.throws(()=>parseRosterCsv('"a"x,b'));assert.throws(()=>parseRosterCsv('"unclosed'));
 });
 await t.test('confirmation revalidates hash and uniqueness; concurrent retries create only VISITOR STUDENT identities and zero wallets',async()=>{
  const b={csvText:'externalKey,displayName\nSIM_SAFE_A,模拟学员-A001\nSIM_SAFE_B,模拟学员-B001',demoOnly:true as const},batch=await ops.client.call('previewDemoRosterImport',b,{},key());assert.equal(batch.status,'READY');assert.equal((await second.client.call('previewDemoRosterImport',b,{},key())).id,batch.id);
  await assert.rejects(ops.client.call('confirmDemoRosterImport',{expectedHash:'0'.repeat(64),demoOnly:true},{batchId:batch.id},key()),rejects('IMPORT_HASH_CONFLICT'));
  const result=await Promise.all([ops.client.call('confirmDemoRosterImport',{expectedHash:batch.sourceHash,demoOnly:true},{batchId:batch.id},key()),second.client.call('confirmDemoRosterImport',{expectedHash:batch.sourceHash,demoOnly:true},{batchId:batch.id},key())]);assert.equal(result[0].createdCount,2);assert.deepEqual(result[0].createdUserIds,result[1].createdUserIds);
  for(const id of result[0].createdUserIds){assert.match(id,/^DEMO_IMPORT_[a-f0-9]{32}$/);const [u]=await rows<{roles:string[];membership_status:string;demo_only:number;available_points:number;growth_mileage:number;password_hash:string|null}>(pool,'SELECT u.roles,u.membership_status,u.demo_only,u.password_hash,w.available_points,w.growth_mileage FROM users u JOIN wallets w ON w.user_id=u.id WHERE u.id=?',[id]);assert.deepEqual(u.roles,['STUDENT']);assert.equal(u.membership_status,'VISITOR');assert.equal(u.demo_only,1);assert.equal(u.password_hash,null);assert.equal(u.available_points,0);assert.equal(u.growth_mileage,0);}
  const reordered=await ops.client.call('previewDemoRosterImport',{csvText:'externalKey,displayName\nSIM_SAFE_B,模拟学员-B001\nSIM_SAFE_A,模拟学员-A001',demoOnly:true},{},key());assert.ok(reordered.rows.every(r=>r.action==='EXISTS'));assert.equal((await ops.client.call('confirmDemoRosterImport',{expectedHash:reordered.sourceHash,demoOnly:true},{batchId:reordered.id},key())).createdCount,0);
  await assert.rejects(outsider.client.call('confirmDemoRosterImport',{expectedHash:batch.sourceHash,demoOnly:true},{batchId:batch.id},key()),rejects('NOT_FOUND'));
 });
 await t.test('conflict introduced after preview rolls back the whole batch, including earlier rows',async()=>{
  const pending=await ops.client.call('previewDemoRosterImport',{csvText:'externalKey,displayName\nSIM_RACE_A,模拟学员-C001\nSIM_RACE_B,模拟学员-D001',demoOnly:true},{},key());
  const racer=await second.client.call('previewDemoRosterImport',{csvText:'externalKey,displayName\nSIM_RACE_B,模拟学员-E001',demoOnly:true},{},key());await second.client.call('confirmDemoRosterImport',{expectedHash:racer.sourceHash,demoOnly:true},{batchId:racer.id},key());
  await assert.rejects(ops.client.call('confirmDemoRosterImport',{expectedHash:pending.sourceHash,demoOnly:true},{batchId:pending.id},key()),rejects('IDENTITY_CONFLICT'));assert.equal((await rows(pool,"SELECT user_id FROM reporting_import_identities WHERE organization_id=? AND external_key='SIM_RACE_A'",[prefix])).length,0);assert.equal((await rows<{status:string}>(pool,'SELECT status FROM reporting_import_batches WHERE id=?',[pending.id]))[0].status,'READY');
 });
 await t.test('scope revocation is checked before a cached export response',async()=>{
  const stable=key(),b={month,dataset:'MONTHLY' as const};await ops.client.call('exportReportingCsv',b,{},stable);await migration.execute("DELETE FROM role_scopes WHERE user_id=? AND scope_type='REPORTING'",[ops.id]);
  try{await assert.rejects(ops.client.call('exportReportingCsv',b,{},stable),rejects('SCOPE_FORBIDDEN'));}finally{await reportingScope(ops.id);}
 });
 await t.test('T31 expiry 60/30/7-day and delayed preparation reminders retry without duplicate notifications or points',async()=>{
  const now=new Date('2030-05-01T16:00:00Z'),lots:string[]=[];
  const site=prefix+'_REPORT_SITE';await migration.execute('INSERT INTO inventory(reward_id,site_id,organization_id,on_hand) VALUES (?,?,?,?)',['R001',site,prefix,5]);await migration.execute("INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,'PICKUP',?)",[ops.id,site]);
  const order=await student.client.call('createOrder',{rewardId:'R001',quantity:1,expectedRewardVersion:1,pickupSiteId:site},{},key());await migration.execute('UPDATE redemption_orders SET created_at=? WHERE id=?',[new Date(now.getTime()-3*86400000),order.id]);
  for(const day of [60,30,7])lots.push(await credit(student.id,10,new Date(now.getTime()+day*86400000+23*3600000)));
  const before=await student.client.call('getMyWallet');await reportingWorker(now,prefix);await reportingWorker(now,prefix);assert.deepEqual(await student.client.call('getMyWallet'),before);
  for(let i=0;i<lots.length;i++)assert.equal((await rows(pool,'SELECT id FROM outbox_events WHERE user_id=? AND event_type=? AND resource_id LIKE ?',[student.id,'POINTS_EXPIRY_'+[60,30,7][i],lots[i]+':%'])).length,1);
  assert.equal((await rows(pool,"SELECT id FROM outbox_events WHERE user_id=? AND event_type='ORDER_PREPARING_DELAY' AND resource_id=?",[student.id,order.id])).length,1);assert.equal((await rows(pool,"SELECT id FROM outbox_events WHERE user_id=? AND event_type='ORDER_PREPARING_DELAY' AND resource_id=?",[ops.id,order.id])).length,1);
 });
});
