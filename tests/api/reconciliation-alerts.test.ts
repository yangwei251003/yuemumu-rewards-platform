import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {fixture,migration,prefix,key} from '../integration/fixtures';
import {pool,rows,transaction} from '../../packages/db/src/client';
import {appendLedger,assertWallet} from '../../packages/domain/src/commands';
import {checkReconciliationPage} from '../../packages/domain/src/reconciliation-alerts';
import {deliverOutbox} from '../../packages/domain/src/operations';
import {ApiError} from '../../packages/sdk/src';

after(async()=>{await migration.end();await pool.end();});
test('T13 actual local reconciliation detects tampering and appends one scoped durable alarm without repairing business data',async t=>{
 const student=await fixture('alarm_student',['STUDENT'],'student'),auditor=await fixture('alarm_auditor',['AUDITOR']),unscoped=await fixture('alarm_unscoped',['AUDITOR']),admin=await fixture('alarm_admin',['SYSTEM_ADMIN','AUDITOR']),other=await fixture('alarm_other',['STUDENT'],'student'),foreign=await fixture('alarm_foreign',['AUDITOR'],'staff',undefined,prefix+'_FOREIGN');
 for(const p of [student,auditor,unscoped,admin,other,foreign])await migration.execute('UPDATE users SET demo_only=TRUE WHERE id=?',[p.id]);
 await migration.execute("DELETE FROM role_scopes WHERE user_id=? AND scope_type='AUDIT'",[unscoped.id]);
 const site=prefix+'_alarm_site';await migration.execute('INSERT INTO inventory(reward_id,site_id,organization_id,on_hand) VALUES (?,?,?,2)',['R001',site,prefix]);
 const root=await transaction(async cx=>{await assertWallet(cx,student.id);const entry=await appendLedger(cx,{actorId:auditor.id,key:randomUUID(),requestId:randomUUID()},{userId:student.id,businessKey:randomUUID(),kind:'EARN',available:60,growth:60,sourceType:'TEST_FIXTURE',sourceId:student.id,reason:'T13隔离虚构用户的合法初始权益'});await cx.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at) VALUES (?,?,60,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 30 DAY))',[entry,student.id]);return entry;});
 const ledger=()=>rows(pool,'SELECT * FROM ledger_entries WHERE user_id=? ORDER BY id',[student.id]);
 const audits=()=>rows<{id:string;resource_id:string}>(pool,"SELECT id,resource_id FROM audit_events WHERE action='RECONCILIATION_MISMATCH' AND resource_id=? ORDER BY id",[student.id]);
 const scan=()=>checkReconciliationPage({userId:student.id});
 const sourceBefore=await ledger();

 await t.test('healthy checks and non-demo identities create neither audit alarms nor notification events',async()=>{
  const before=await audits();assert.equal((await scan()).mismatches,0);assert.deepEqual(await audits(),before);assert.deepEqual(await ledger(),sourceBefore);
  const realFlag=await fixture('alarm_not_demo',['STUDENT'],'student');const r=await checkReconciliationPage({userId:realFlag.id});assert.equal(r.checked,0);assert.equal(r.mismatches,0);
 });
 await t.test('wallet drift repeated concurrently produces one durable audit and one visible in-scope notification; dangerous write is rejected',async()=>{
  await migration.execute('UPDATE wallets SET available_points=available_points+1 WHERE user_id=?',[student.id]);
  try{
   const results=await Promise.all([scan(),scan(),scan()]);assert.ok(results.every(r=>r.mismatches===1));const alarm=results[0].findings[0];assert.equal(alarm.ledger.availablePoints,60);assert.equal(alarm.wallet?.availablePoints,61);assert.equal(new Set(results.map(r=>r.findings[0].alertId)).size,1);assert.match(alarm.alertId!,/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
   assert.deepEqual(await audits(),[{id:alarm.alertId,resource_id:student.id}]);const events=await rows<{id:string;user_id:string;payload:unknown}>(pool,"SELECT id,user_id,payload FROM outbox_events WHERE event_type='RECONCILIATION_MISMATCH' AND resource_id=?",[alarm.alertId]);assert.equal(events.length,1);assert.equal(events[0].user_id,auditor.id);assert.ok(!JSON.stringify(events[0].payload).includes(student.id));assert.ok(!JSON.stringify(events[0].payload).includes('61'));
   await transaction(cx=>deliverOutbox(cx,new Date(),10000));const notifications=(await auditor.client.call('listNotifications',undefined,{limit:100})).items.filter(n=>n.resourceId===alarm.alertId);assert.equal(notifications.length,1);assert.equal(notifications[0].eventType,'RECONCILIATION_MISMATCH');assert.match(notifications[0].message,/投影不一致/);
   for(const p of [unscoped,admin,other,foreign])assert.equal((await p.client.call('listNotifications',undefined,{limit:100})).items.some(n=>n.resourceId===alarm.alertId),false);
   await assert.rejects(other.client.call('readNotification',undefined,{notificationId:notifications[0].id},key()),e=>e instanceof ApiError&&e.problem.code==='NOT_FOUND');
   await assert.rejects(student.client.call('createOrder',{rewardId:'R001',quantity:1,expectedRewardVersion:1,pickupSiteId:site},{},key()),e=>e instanceof ApiError&&e.problem.code==='PROJECTION_MISMATCH');assert.equal((await rows(pool,'SELECT id FROM redemption_orders WHERE user_id=?',[student.id])).length,0);
   await scan();await transaction(cx=>deliverOutbox(cx,new Date(),10000));assert.equal((await auditor.client.call('listNotifications',undefined,{limit:100})).items.filter(n=>n.resourceId===alarm.alertId).length,1);assert.deepEqual(await ledger(),sourceBefore);assert.equal((await rows<{available_points:number}>(pool,'SELECT available_points FROM wallets WHERE user_id=?',[student.id]))[0].available_points,61);
  }finally{await migration.execute('UPDATE wallets SET available_points=available_points-1 WHERE user_id=?',[student.id]);}
  const count=(await audits()).length;assert.equal((await scan()).mismatches,0);assert.equal((await audits()).length,count);assert.deepEqual(await ledger(),sourceBefore);
 });
 await t.test('lot-only drift is detected even when wallet and ledger agree; restoring fixture ends alerts and preserves original audit',async()=>{
  await migration.execute('UPDATE point_lots SET available=available+1 WHERE entry_id=?',[root]);
  try{const r=await scan();assert.equal(r.mismatches,1);assert.deepEqual(r.findings[0].ledger,r.findings[0].wallet);assert.equal(r.findings[0].lots.availablePoints,61);const before=await audits();await scan();assert.deepEqual(await audits(),before);assert.equal((await rows<{available:number}>(pool,'SELECT available FROM point_lots WHERE entry_id=?',[root]))[0].available,61);assert.deepEqual(await ledger(),sourceBefore);}
  finally{await migration.execute('UPDATE point_lots SET available=available-1 WHERE entry_id=?',[root]);}
  const before=await audits();assert.equal((await scan()).mismatches,0);assert.deepEqual(await audits(),before);assert.deepEqual(await ledger(),sourceBefore);
 });
 await t.test('bounded cursor pages visit local fictional identities once and normal scan does not change any source ledger',async()=>{
  let cursor:string|undefined;const seen:string[]=[];do{const r=await checkReconciliationPage({organizationId:prefix,cursor,limit:2});assert.ok(r.checked<=2);seen.push(...r.findings.map(f=>f.userId));cursor=r.nextCursor||undefined;}while(cursor);
  assert.equal(new Set(seen).size,seen.length);assert.ok(seen.includes(student.id));assert.ok(seen.includes(auditor.id));assert.ok(!seen.includes(foreign.id));await assert.rejects(checkReconciliationPage({limit:101}),/RECONCILIATION_LIMIT/);assert.deepEqual(await ledger(),sourceBefore);
 });
});
