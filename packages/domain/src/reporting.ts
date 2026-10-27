import {randomUUID} from 'node:crypto';
import {pool,rows,transaction,type Executor} from '../../db/src/client';
import {config} from '../../db/src/config';
import {actor,sha,type Actor} from './ledger';
import {command,requireRole,scoped,fail,audit,notify,type Context} from './commands';
import {businessDate} from './business-time';
import type {Schemas} from '../../sdk/src';

type BudgetRow={id:string;month:string;version:number;budget_cents:number;reason:string;actor_id:string;created_at:Date};
type CostRow={id:string;organization_id:string;business_key:string;kind:Schemas['ReportingCost']['kind'];amount_cents:number;description:string;occurred_at:Date;created_at:Date;actor_id:string;reversed_cost_id:string|null};
type ImportRow={id:string;organization_id:string;source_hash:string;status:Schemas['DemoRosterBatch']['status'];safe_rows:Schemas['DemoRosterRow'][];issues:Schemas['DemoRosterIssue'][];created_count:number;existing_count:number;created_user_ids:string[];created_at:Date};
type ImportIdentity={external_key:string;user_id:string;display_name:string};
const budgetBody=(r:BudgetRow):Schemas['ReportingBudget']=>({id:r.id,month:r.month,version:r.version,budgetCents:r.budget_cents,reason:r.reason,actorId:r.actor_id,createdAt:r.created_at.toISOString(),demoOnly:true});
const costBody=(r:CostRow):Schemas['ReportingCost']=>({id:r.id,businessKey:r.business_key,kind:r.kind,amountCents:r.amount_cents,description:r.description,occurredAt:r.occurred_at.toISOString(),createdAt:r.created_at.toISOString(),actorId:r.actor_id,reversedCostId:r.reversed_cost_id,demoOnly:true});
const importBody=(r:ImportRow):Schemas['DemoRosterBatch']=>({id:r.id,sourceHash:r.source_hash,status:r.status,rows:r.safe_rows,issues:r.issues,createdCount:r.created_count,existingCount:r.existing_count,createdUserIds:r.created_user_ids,createdAt:r.created_at.toISOString(),demoOnly:true});
function demoOnly(value:boolean){if(value!==true)fail('DEMO_CONFIRMATION_REQUIRED','仅允许明确确认的虚构演示数据',422);config();}
function integer(value:unknown,min=0,max=Number.MAX_SAFE_INTEGER){const n=Number(value);if(!Number.isSafeInteger(n)||n<min||n>max)fail('INVALID_INTEGER','积分与金额必须使用范围内整数',422);return n;}
export function reportingMonthBounds(month:string){
 if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))fail('INVALID_MONTH','月份必须是2000—2099年的YYYY-MM',422);
 const [year,m]=month.split('-').map(Number);return {start:new Date(Date.UTC(year,m-1,1)-8*3600000),end:new Date(Date.UTC(year,m,1)-8*3600000)};
}
async function authorize(cx:Executor,u:Actor,read=false){
 requireRole(u,read?['OPS_MANAGER','AUDITOR']:['OPS_MANAGER']);
 if(!read){await scoped(cx,u,'REPORTING',u.organization_id);return;}
 if(u.roles.includes('OPS_MANAGER')&&(await rows(cx,"SELECT user_id FROM role_scopes WHERE user_id=? AND scope_type='REPORTING' AND scope_id IN (?,'*')",[u.id,u.organization_id])).length)return;
 if(u.roles.includes('AUDITOR')){await scoped(cx,u,'AUDIT',u.organization_id);return;}fail('SCOPE_FORBIDDEN','不在已分配报表范围内',403);
}
async function lockOrganization(cx:Executor,org:string){
 await cx.execute('INSERT IGNORE INTO reporting_org_locks(organization_id) VALUES (?)',[org]);
 await rows(cx,'SELECT organization_id FROM reporting_org_locks WHERE organization_id=? FOR UPDATE',[org]);
}
async function monthReport(cx:Executor,org:string,month:string):Promise<Schemas['ReportingMonth']>{
 const {start,end}=reportingMonthBounds(month);
 // One SQL statement gives exports the same snapshot even inside a READ COMMITTED command.
 const [r]=await rows<Record<string,string|number|null>>(cx,`SELECT totals.*,costs.amount,budget.budget_cents,budget.version FROM (SELECT
 COALESCE(SUM(CASE WHEN in_period AND kind='EARN' THEN GREATEST(delta_available,0) ELSE 0 END),0) issued,
 COALESCE(SUM(CASE WHEN in_period AND kind='SPEND' THEN GREATEST(-delta_available-delta_reserved,0) ELSE 0 END),0) spent,
 COALESCE(SUM(CASE WHEN in_period AND kind='RESERVE' THEN GREATEST(delta_reserved,0) ELSE 0 END),0) reserved,
 COALESCE(SUM(CASE WHEN in_period AND kind='RELEASE' THEN GREATEST(-delta_reserved,0) ELSE 0 END),0) released,
 COALESCE(SUM(CASE WHEN in_period AND kind='EXPIRE' THEN GREATEST(-delta_available,0) ELSE 0 END),0) expired,
 COALESCE(SUM(CASE WHEN in_period AND kind='REVERSE' THEN GREATEST(-delta_growth,0) ELSE 0 END),0) reversed,
 COALESCE(SUM(CASE WHEN in_period THEN delta_growth ELSE 0 END),0) growth,
 COALESCE(SUM(delta_available),0) available,COALESCE(SUM(delta_reserved),0) frozen
 FROM (SELECT l.*,l.created_at>=? AS in_period FROM ledger_entries l JOIN users u ON u.id=l.user_id WHERE u.organization_id=? AND l.created_at<?) events) totals
 CROSS JOIN (SELECT COALESCE(SUM(amount_cents),0) amount FROM reporting_cost_events WHERE organization_id=? AND occurred_at>=? AND occurred_at<?) costs
 LEFT JOIN (SELECT budget_cents,version FROM reporting_budget_versions WHERE organization_id=? AND month=? ORDER BY version DESC LIMIT 1) budget ON TRUE`,[start,org,end,org,start,end,org,month]);
 const costCents=integer(r.amount,-Number.MAX_SAFE_INTEGER),budgetCents=r.budget_cents===null?null:integer(r.budget_cents);
 return {month,timezone:'Asia/Shanghai',currency:'CNY',issuedPoints:integer(r.issued),spentPoints:integer(r.spent),reservedPoints:integer(r.reserved),releasedPoints:integer(r.released),expiredPoints:integer(r.expired),reversedPoints:integer(r.reversed),netGrowthChange:integer(r.growth,-Number.MAX_SAFE_INTEGER),closingAvailablePoints:integer(r.available,-Number.MAX_SAFE_INTEGER),closingFrozenPoints:integer(r.frozen,-Number.MAX_SAFE_INTEGER),costCents,budgetCents,budgetVersion:integer(r.version||0),remainingBudgetCents:budgetCents===null?null:budgetCents-costCents,budgetStatus:budgetCents===null?'NOT_SET':costCents>budgetCents?'EXCEEDED':'WITHIN_BUDGET',asOf:new Date().toISOString(),demoOnly:true};
}
export async function reportingRead(name:string,userId:string,query:Record<string,unknown>):Promise<unknown>{
 if(!['getReportingMonth','listReportingBudgets','listReportingCosts'].includes(name))return undefined;
 const cx=await pool.getConnection();
 try{
  await cx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await cx.beginTransaction();const u=await actor(cx,userId);await authorize(cx,u,true);const month=String(query.month||''),bounds=reportingMonthBounds(month);let result:unknown;
  if(name==='getReportingMonth')result=await monthReport(cx,u.organization_id,month);
  else{
   const limit=integer(query.limit||20,1,100),cursor=String(query.cursor||'');
   if(name==='listReportingBudgets'){const list=await rows<BudgetRow>(cx,`SELECT * FROM reporting_budget_versions WHERE organization_id=? AND month=? AND version>? ORDER BY version LIMIT ${limit+1}`,[u.organization_id,month,cursor?integer(cursor,0):0]);result={items:list.slice(0,limit).map(budgetBody),nextCursor:list.length>limit?String(list[limit-1].version):null};}
   else{const list=await rows<CostRow>(cx,`SELECT * FROM reporting_cost_events WHERE organization_id=? AND occurred_at>=? AND occurred_at<? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.organization_id,bounds.start,bounds.end,cursor]);result={items:list.slice(0,limit).map(costBody),nextCursor:list.length>limit?list[limit-1].id:null};}
  }
  await cx.commit();return result;
 }
 catch(e){await cx.rollback();throw e;}finally{cx.release();}
}

export type ReportingCostInput={businessKey:string;kind:'DEMO_EXPENSE'|'STOCK_RECEIPT';amountCents:number;description:string;occurredAt:Date};
export async function recordCost(cx:Executor,ctx:Context,organizationId:string,input:ReportingCostInput):Promise<Schemas['ReportingCost']>{
 const u=await actor(cx,ctx.actorId);if(u.organization_id!==organizationId)fail('SCOPE_FORBIDDEN','费用不属于当前组织',403);
 integer(input.amountCents,1,1_000_000_000);
 if(!/^[A-Z0-9_:-]{1,128}$/i.test(input.businessKey)||!['DEMO_EXPENSE','STOCK_RECEIPT'].includes(input.kind)||!input.description.trim()||input.description.length>300||!Number.isFinite(input.occurredAt.getTime())||input.occurredAt>new Date())fail('INVALID_COST','费用业务键、说明或发生时间无效',422);
 await lockOrganization(cx,organizationId);
 const [existing]=await rows<CostRow>(cx,'SELECT * FROM reporting_cost_events WHERE organization_id=? AND business_key=?',[organizationId,input.businessKey]);
 if(existing){if(existing.kind!==input.kind||existing.amount_cents!==input.amountCents||existing.description!==input.description||existing.occurred_at.getTime()!==input.occurredAt.getTime())fail('COST_BUSINESS_CONFLICT','该费用业务键已有不同记录');return costBody(existing);}
 const id=randomUUID();await cx.execute('INSERT INTO reporting_cost_events(id,organization_id,business_key,kind,amount_cents,description,occurred_at,actor_id) VALUES (?,?,?,?,?,?,?,?)',[id,organizationId,input.businessKey,input.kind,input.amountCents,input.description,input.occurredAt,u.id]);
 await audit(cx,ctx,'REPORTING_COST_RECORDED',id);return costBody((await rows<CostRow>(cx,'SELECT * FROM reporting_cost_events WHERE id=?',[id]))[0]);
}

export function safeCsvCell(value:string|number){
 if(typeof value==='number'){integer(value,-Number.MAX_SAFE_INTEGER);return String(value);}
 const safe=/^[\s\uFEFF]*[=+@-]/u.test(value)||/^[\t\r\n]/u.test(value)?"'"+value:value;
 return '"'+safe.replace(/"/g,'""')+'"';
}
export function csvDocument(columns:string[],data:(string|number)[][]){return '\uFEFF'+[columns,...data].map(row=>row.map(safeCsvCell).join(',')).join('\r\n')+'\r\n';}
async function exportCsv(cx:Executor,org:string,b:Schemas['ReportingCsvRequest']):Promise<Schemas['ReportingCsv']>{
 const {start,end}=reportingMonthBounds(b.month);let columns:string[],data:(string|number)[][];
 if(b.dataset==='LEDGER'){
  columns=['entryId','memberReference','kind','sourceType','availableDelta','frozenDelta','growthDelta','recoveryDelta','businessDate'];
  const records=await rows<{id:string;user_id:string;kind:string;source_type:string;delta_available:number;delta_reserved:number;delta_growth:number;delta_recovery:number;created_at:Date}>(cx,'SELECT l.id,l.user_id,l.kind,l.source_type,l.delta_available,l.delta_reserved,l.delta_growth,l.delta_recovery,l.created_at FROM ledger_entries l JOIN users u ON u.id=l.user_id WHERE u.organization_id=? AND l.created_at>=? AND l.created_at<? ORDER BY l.created_at,l.id LIMIT 5001',[org,start,end]);
  data=records.map(r=>[r.id,'member_'+sha(org+':'+r.user_id).slice(0,16),r.kind,r.source_type,r.delta_available,r.delta_reserved,r.delta_growth,r.delta_recovery,businessDate(r.created_at)]);
 }else if(b.dataset==='COSTS'){
  columns=['eventId','businessKey','kind','amountCents','description','businessDate'];const records=await rows<CostRow>(cx,'SELECT * FROM reporting_cost_events WHERE organization_id=? AND occurred_at>=? AND occurred_at<? ORDER BY occurred_at,id LIMIT 5001',[org,start,end]);data=records.map(r=>[r.id,r.business_key,r.kind,r.amount_cents,r.description,businessDate(r.occurred_at)]);
 }else{
  if(b.dataset!=='MONTHLY')fail('INVALID_DATASET','未知报表类型',422);const r=await monthReport(cx,org,b.month);columns=['month','issuedPoints','spentPoints','reservedPoints','releasedPoints','expiredPoints','reversedPoints','closingAvailablePoints','closingFrozenPoints','costCents','budgetCents','budgetStatus'];data=[[r.month,r.issuedPoints,r.spentPoints,r.reservedPoints,r.releasedPoints,r.expiredPoints,r.reversedPoints,r.closingAvailablePoints,r.closingFrozenPoints,r.costCents,r.budgetCents??'NOT_SET',r.budgetStatus]];
 }
 if(data.length>5000)fail('EXPORT_TOO_LARGE','该月数据超过5000行，请使用专门审计归档；不会静默截断',422);
 const csvText=csvDocument(columns,data);return {filename:`demo-${b.dataset.toLowerCase()}-${b.month}.csv`,contentType:'text/csv;charset=utf-8',csvText,rowCount:data.length,columns,sha256:sha(csvText),truncated:false};
}

// Strict RFC4180-style parser: delimiters/newlines in quoted cells are supported;
// invalid quote placement is rejected. No raw rejected content is persisted or echoed.
export function parseRosterCsv(text:string):string[][]{
 if(text.length>20000)fail('CSV_TOO_LARGE','名单最多20000字符',422);
 if(text.startsWith('\uFEFF'))text=text.slice(1);
 const result:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
 const pushRow=()=>{row.push(cell);result.push(row);row=[];cell='';closed=false;if(result.length>101)fail('CSV_TOO_MANY_ROWS','一次最多100名虚构学员',422);};
 for(let i=0;i<text.length;i++){
  const ch=text[i];if(quoted){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=ch;continue;}
  if(ch==='"'){if(cell||closed)fail('CSV_SYNTAX','引号位置无效',422);quoted=true;continue;}
  if(ch===','){row.push(cell);cell='';closed=false;continue;}
  if(ch==='\r'||ch==='\n'){if(ch==='\r'&&text[i+1]==='\n')i++;pushRow();continue;}
  if(closed)fail('CSV_SYNTAX','闭合引号之后只能有分隔符',422);cell+=ch;
 }
 if(quoted)fail('CSV_SYNTAX','名单引号未闭合',422);
 if(cell||row.length||closed)pushRow();return result;
}
async function previewImport(cx:Executor,ctx:Context,u:Actor,b:Schemas['DemoRosterPreviewRequest']){
 demoOnly(b.demoOnly);const sourceHash=sha(b.csvText);await lockOrganization(cx,u.organization_id);
 const [cached]=await rows<ImportRow>(cx,'SELECT * FROM reporting_import_batches WHERE organization_id=? AND source_hash=?',[u.organization_id,sourceHash]);if(cached)return importBody(cached);
 let parsed:string[][]=[];const issues:Schemas['DemoRosterIssue'][]=[];const safeRows:Schemas['DemoRosterRow'][]=[];
 try{parsed=parseRosterCsv(b.csvText);}catch{issues.push({row:0,code:'CSV_SYNTAX',message:'CSV结构无效或超过100人；不保存原始内容'});}
 if(!issues.length){
  if(JSON.stringify(parsed[0])!==JSON.stringify(['externalKey','displayName']))issues.push({row:1,code:'HEADERS_FORBIDDEN',message:'仅允许 externalKey,displayName 两列，不能导入角色、余额或个人信息'});
  else if(parsed.length<2)issues.push({row:1,code:'EMPTY_ROSTER',message:'需要至少一名虚构学员'});
  else{
   const seen=new Set<string>();for(let i=1;i<parsed.length;i++){
    const r=parsed[i];if(r.length!==2||!/^SIM_[A-Z0-9_]{1,32}$/.test(r[0])||!/^模拟学员-[A-Z][A-Z0-9]{0,15}$/.test(r[1])){issues.push({row:i+1,code:'FICTIONAL_FORMAT_REQUIRED',message:'仅允许SIM_虚构业务键与模拟学员-A001格式昵称'});continue;}
    if(seen.has(r[0])){issues.push({row:i+1,code:'DUPLICATE_ROW',message:'同一名单业务键重复'});continue;}seen.add(r[0]);
    const [existing]=await rows<ImportIdentity>(cx,'SELECT * FROM reporting_import_identities WHERE organization_id=? AND external_key=?',[u.organization_id,r[0]]);
    if(existing&&existing.display_name!==r[1]){issues.push({row:i+1,code:'IDENTITY_CONFLICT',message:'业务键已关联其他模拟昵称，不能借导入覆盖'});continue;}
    safeRows.push({externalKey:r[0],displayName:r[1],action:existing?'EXISTS':'CREATE'});
   }
  }
 }
 const id=randomUUID();await cx.execute('INSERT INTO reporting_import_batches(id,organization_id,source_hash,status,safe_rows,issues,created_user_ids,actor_id) VALUES (?,?,?,?,?,?,?,?)',[id,u.organization_id,sourceHash,issues.length?'INVALID':'READY',JSON.stringify(safeRows),JSON.stringify(issues),'[]',u.id]);await audit(cx,ctx,'ROSTER_DRY_RUN',id);
 return importBody((await rows<ImportRow>(cx,'SELECT * FROM reporting_import_batches WHERE id=?',[id]))[0]);
}

export async function reportingWrite(name:string,inputContext:Context,params:Record<string,string>,body:unknown):Promise<unknown>{
 const names=['setReportingBudget','recordReportingCost','reverseReportingCost','exportReportingCsv','previewDemoRosterImport','confirmDemoRosterImport'];if(!names.includes(name))return undefined;
 const read=name==='exportReportingCsv',ctx:Context={...inputContext,authorize:(cx,u)=>authorize(cx,u,read)};
 return command(ctx,name,{params,body},read?['OPS_MANAGER','AUDITOR']:['OPS_MANAGER'],async(cx,u)=>{
  if(name==='setReportingBudget'){
   const b=body as Schemas['ReportingBudgetRequest'];demoOnly(b.demoOnly);reportingMonthBounds(b.month);integer(b.budgetCents,0,1_000_000_000);await lockOrganization(cx,u.organization_id);
   const [prior]=await rows<BudgetRow>(cx,'SELECT * FROM reporting_budget_versions WHERE organization_id=? AND month=? ORDER BY version DESC LIMIT 1',[u.organization_id,b.month]);if((prior?.version||0)!==b.expectedVersion)fail('VERSION_CONFLICT','预算版本已更新');
   const id=randomUUID();await cx.execute('INSERT INTO reporting_budget_versions(id,organization_id,month,version,budget_cents,reason,actor_id) VALUES (?,?,?,?,?,?,?)',[id,u.organization_id,b.month,b.expectedVersion+1,b.budgetCents,b.reason,u.id]);await audit(cx,ctx,'BUDGET_VERSION_APPENDED',id);return budgetBody((await rows<BudgetRow>(cx,'SELECT * FROM reporting_budget_versions WHERE id=?',[id]))[0]);
  }
  if(name==='recordReportingCost'){const b=body as Schemas['ReportingCostRequest'];demoOnly(b.demoOnly);return recordCost(cx,ctx,u.organization_id,{businessKey:b.businessKey,kind:'DEMO_EXPENSE',amountCents:b.amountCents,description:b.description,occurredAt:new Date(b.occurredAt)});}
  if(name==='reverseReportingCost'){
   const b=body as Schemas['ReportingCostReverseRequest'];demoOnly(b.demoOnly);await lockOrganization(cx,u.organization_id);
   const [original]=await rows<CostRow>(cx,'SELECT * FROM reporting_cost_events WHERE id=? AND organization_id=?',[params.costId,u.organization_id]);if(!original)fail('NOT_FOUND','费用不存在',404);if(original.kind==='REVERSAL')fail('INVALID_COST_STATE','不能再次冲正冲正记录');
   const [prior]=await rows<CostRow>(cx,'SELECT * FROM reporting_cost_events WHERE reversed_cost_id=?',[original.id]);if(prior)return costBody(prior);
   const id=randomUUID();await cx.execute('INSERT INTO reporting_cost_events(id,organization_id,business_key,kind,amount_cents,description,occurred_at,actor_id,reversed_cost_id) VALUES (?,?,?,\'REVERSAL\',?,?,?,?,?)',[id,u.organization_id,'REVERSE:'+original.id,-original.amount_cents,b.reason,new Date(),u.id,original.id]);await audit(cx,ctx,'REPORTING_COST_REVERSED',id);return costBody((await rows<CostRow>(cx,'SELECT * FROM reporting_cost_events WHERE id=?',[id]))[0]);
  }
  if(name==='exportReportingCsv'){const result=await exportCsv(cx,u.organization_id,body as Schemas['ReportingCsvRequest']);await audit(cx,ctx,'REPORTING_CSV_EXPORTED',result.filename);return result;}
  if(name==='previewDemoRosterImport')return previewImport(cx,ctx,u,body as Schemas['DemoRosterPreviewRequest']);
  const b=body as Schemas['DemoRosterConfirmRequest'];demoOnly(b.demoOnly);await lockOrganization(cx,u.organization_id);
  const [batch]=await rows<ImportRow>(cx,'SELECT * FROM reporting_import_batches WHERE id=? AND organization_id=? FOR UPDATE',[params.batchId,u.organization_id]);if(!batch)fail('NOT_FOUND','名单预检不存在',404);if(batch.source_hash!==b.expectedHash)fail('IMPORT_HASH_CONFLICT','名单预检内容已变化');if(batch.status==='INVALID')fail('IMPORT_INVALID','先修复预检问题，再重新提交');if(batch.status==='CONFIRMED')return importBody(batch);
  const created:string[]=[];let existingCount=0;
  for(const item of batch.safe_rows){
   const [existing]=await rows<ImportIdentity>(cx,'SELECT * FROM reporting_import_identities WHERE organization_id=? AND external_key=?',[u.organization_id,item.externalKey]);
   if(existing){if(existing.display_name!==item.displayName)fail('IDENTITY_CONFLICT','预检后业务键被其他模拟昵称使用');existingCount++;continue;}
   const id='DEMO_IMPORT_'+sha(u.organization_id+':'+item.externalKey).slice(0,32);
   if((await rows(cx,'SELECT id FROM users WHERE id=?',[id])).length)fail('IDENTITY_CONFLICT','保留身份键已存在，不能覆盖');
   await cx.execute('INSERT INTO users(id,person_id,organization_id,display_name,roles,membership_status,demo_only,active) VALUES (?,?,?,?,?,\'VISITOR\',TRUE,TRUE)',[id,id,u.organization_id,item.displayName,'["STUDENT"]']);await cx.execute('INSERT INTO wallets(user_id) VALUES (?)',[id]);await cx.execute('INSERT INTO reporting_import_identities(organization_id,external_key,user_id,display_name,batch_id) VALUES (?,?,?,?,?)',[u.organization_id,item.externalKey,id,item.displayName,batch.id]);created.push(id);
  }
  await cx.execute("UPDATE reporting_import_batches SET status='CONFIRMED',created_count=?,existing_count=?,created_user_ids=? WHERE id=?",[created.length,existingCount,JSON.stringify(created),batch.id]);await audit(cx,ctx,'DEMO_ROSTER_CONFIRMED',batch.id);return importBody((await rows<ImportRow>(cx,'SELECT * FROM reporting_import_batches WHERE id=?',[batch.id]))[0]);
 });
}

export async function reportingWorker(now=new Date(),testOrganizationId?:string){
 config();return transaction(async cx=>{
  const days="DATEDIFF(DATE_ADD(p.expires_at,INTERVAL 8 HOUR),?)";
  const phase=`CASE WHEN ${days}<=7 THEN 7 WHEN ${days}<=30 THEN 30 ELSE 60 END`;
  const resource="CONCAT(p.entry_id,':',DATE_FORMAT(DATE_ADD(p.expires_at,INTERVAL 8 HOUR),'%Y-%m-%d'))";
  const candidates=await rows<{entry_id:string;user_id:string;available:number;expires_at:Date}>(cx,`SELECT p.entry_id,p.user_id,p.available,p.expires_at FROM point_lots p WHERE p.available>0 AND p.expires_at>? AND DATEDIFF(DATE_ADD(p.expires_at,INTERVAL 8 HOUR),?)<=60 AND NOT EXISTS(SELECT 1 FROM outbox_events e WHERE e.user_id=p.user_id AND e.event_type=CONCAT('POINTS_EXPIRY_',${phase}) AND e.resource_id=${resource}) AND (? IS NULL OR p.user_id IN (SELECT id FROM users WHERE organization_id=?)) ORDER BY p.expires_at,p.entry_id LIMIT 100`,[now,businessDate(now),businessDate(now),businessDate(now),testOrganizationId||null,testOrganizationId||null]);
  for(const lot of candidates){const dayCount=Math.ceil((new Date(businessDate(lot.expires_at)+'T00:00:00Z').getTime()-new Date(businessDate(now)+'T00:00:00Z').getTime())/86400000),threshold=dayCount<=7?7:dayCount<=30?30:60;await notify(cx,lot.user_id,'POINTS_EXPIRY_'+threshold,lot.entry_id+':'+businessDate(lot.expires_at),{message:`模拟积分批次 ${lot.available} 分将在 ${businessDate(lot.expires_at)} 到期，请查看账本有效期；不影响合法成长记录`});}
  const delayed=await rows<{id:string;user_id:string;organization_id:string;site_id:string}>(cx,"SELECT o.id,o.user_id,o.organization_id,o.site_id FROM redemption_orders o WHERE o.status='PREPARING' AND o.created_at<? AND NOT EXISTS(SELECT 1 FROM outbox_events e WHERE e.user_id=o.user_id AND e.event_type='ORDER_PREPARING_DELAY' AND e.resource_id=o.id) AND (? IS NULL OR o.organization_id=?) ORDER BY o.created_at,o.id LIMIT 100",[new Date(now.getTime()-2*86400000),testOrganizationId||null,testOrganizationId||null]);
  for(const order of delayed){await notify(cx,order.user_id,'ORDER_PREPARING_DELAY',order.id,{message:'订单备货已超过2天，已提醒领取点核实；领取期限仅在备货完成后开始'});const staff=await rows<{id:string}>(cx,"SELECT DISTINCT u.id FROM users u JOIN role_scopes s ON s.user_id=u.id WHERE u.organization_id=? AND u.active=TRUE AND (JSON_CONTAINS(u.roles,'\"OPS_MANAGER\"') OR JSON_CONTAINS(u.roles,'\"REWARD_OPERATOR\"')) AND s.scope_type='PICKUP' AND s.scope_id IN (?,'*')",[order.organization_id,order.site_id]);for(const person of staff)await notify(cx,person.id,'ORDER_PREPARING_DELAY',order.id,{message:'领取点有订单备货超过2天，请核实库存并处理备货或取消'});}
  return {expiryReminders:candidates.length,delayedOrders:delayed.length};
 });
}
