import test,{after} from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {migration,fixture,key,prefix,c} from '../integration/fixtures';
import {pool,rows} from '../../packages/db/src/client';
import {orderWrite} from '../../packages/domain/src/orders';
import {ApiError,type Schemas} from '../../packages/sdk/src';
import {reconcile} from '../../packages/domain/src/ledger';
after(async()=>{await migration.end();await pool.end();});
const site=prefix+'_site';const rejects=(code:string)=>(e:unknown)=>e instanceof ApiError&&e.problem.code===code;
async function credit(userId:string,points:number,expires=new Date(Date.now()+86400000*30)){const id=randomUUID();await migration.execute('INSERT INTO ledger_entries(id,user_id,business_key,kind,delta_available,delta_growth,source_type,source_id,rule_version,reason,actor_id,request_id) VALUES (?,?,?,\'EARN\',?,?,\'TEST_FIXTURE\',?,\'DRAFT_FOR_DEMO:v1\',\'隔离模拟测试初始事件\',?,?)',[id,userId,id,points,points,id,userId,id]);await migration.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at) VALUES (?,?,?,?)',[id,userId,points,expires]);await migration.execute('UPDATE wallets SET available_points=available_points+?,growth_mileage=growth_mileage+? WHERE user_id=?',[points,points,userId]);return id;}
async function inventory(rewardId:string,onHand:number){await migration.execute('INSERT INTO inventory(reward_id,site_id,organization_id,on_hand) VALUES (?,?,?,?)',[rewardId,site,prefix,onHand]);}
const request=(rewardId:string):Schemas['OrderRequest']=>({rewardId,quantity:1,expectedRewardVersion:1,pickupSiteId:site});
test('FLOW-02 real HTTP/MySQL reservations and pickup invariants',async t=>{
 const ops=await fixture('ops',['OPS_MANAGER']),staff=await fixture('pickup',['REWARD_OPERATOR']);for(const u of [ops,staff])await migration.execute('INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,\'PICKUP\',?)',[u.id,site]);
 await inventory('R016',1);await inventory('R001',100);await inventory('R002',100);await inventory('R003',100);await inventory('R019',10);
 await t.test('T04 fifty users compete for last item: exactly one order and one stock reservation',async()=>{
  const people=[];for(let i=0;i<50;i++){const person=await fixture('race'+i,['STUDENT'],'student');await credit(person.id,650);people.push(person);}
  const results=await Promise.allSettled(people.map(p=>p.client.call('createOrder',request('R016'),{},key())));assert.equal(results.filter(r=>r.status==='fulfilled').length,1);for(const r of results)if(r.status==='rejected')assert.ok(rejects('OUT_OF_STOCK')(r.reason));
  const [s]=await rows<{on_hand:number;reserved:number}>(pool,'SELECT * FROM inventory WHERE reward_id=? AND site_id=?',['R016',site]);assert.equal(s.on_hand,1);assert.equal(s.reserved,1);
 });
 const student=await fixture('student',['STUDENT'],'student');await credit(student.id,910);
 let o:Schemas['Order'];let token:Schemas['Credential'];
 await t.test('T01 order replay, frozen points, FEFO, no growth reduction, ready starts seven-day clock',async()=>{
  const stable=key();const attempts=await Promise.all(Array.from({length:30},()=>student.client.call('createOrder',request('R019'),{},stable)));assert.equal(new Set(attempts.map(v=>v.id)).size,1);o=attempts[0];assert.equal(o.status,'PREPARING');assert.equal(o.expiresAt,null);
  const w=await student.client.call('getMyWallet');assert.equal(w.availablePoints,10);assert.equal(w.frozenPoints,900);assert.equal(w.growthMileage,910);
  await assert.rejects(student.client.call('createOrder',request('R001'),{},stable),rejects('IDEMPOTENCY_CONFLICT'));
  await assert.rejects(student.client.call('issuePickupCredential',undefined,{orderId:o.id},key()),rejects('NOT_READY'));
  o=await staff.client.call('markOrderReady',{expectedVersion:o.version},{orderId:o.id},key());assert.equal(Date.parse(o.expiresAt!)-Date.parse(o.readyAt!),7*86400000);
  token=await student.client.call('issuePickupCredential',undefined,{orderId:o.id},key());
 });
 await t.test('T08/09/22/23 read-only preview, owner/site isolation, rotation, no token persisted in receipts',async()=>{
  const before=await rows(pool,'SELECT * FROM redemption_orders WHERE id=?',[o.id]);const preview=await staff.client.call('previewPickup',{token:token.token});assert.equal(preview.eligible,true);assert.deepEqual(await rows(pool,'SELECT * FROM redemption_orders WHERE id=?',[o.id]),before);
  assert.equal((await fetch(`http://127.0.0.1:${c.gatewayPort}/api/v1/pickup/confirm?token=${'a'.repeat(64)}`)).status,404);
  const outsider=await fixture('outsider',['STUDENT'],'student');await assert.rejects(outsider.client.call('getOrder',undefined,{orderId:o.id}),rejects('NOT_FOUND'));
  await assert.rejects(outsider.client.call('issuePickupCredential',undefined,{orderId:o.id},key()),rejects('NOT_FOUND'));
  const wrongSite=await fixture('wrongSite',['REWARD_OPERATOR']);await assert.rejects(wrongSite.client.call('previewPickup',{token:token.token}),rejects('SCOPE_FORBIDDEN'));
  const old=token;token=await student.client.call('issuePickupCredential',undefined,{orderId:o.id},key());await assert.rejects(staff.client.call('previewPickup',{token:old.token}),rejects('STALE_CREDENTIAL'));
  const receipts=await rows<{response:unknown}>(pool,'SELECT response FROM command_receipts WHERE actor_id=? AND operation=?',[student.id,'issuePickupCredential']);assert.ok(receipts.every(r=>!JSON.stringify(r.response).includes(token.token)&&!JSON.stringify(r.response).includes(old.token)));
 });
 await t.test('T06 repeated pickup fulfills once, one consumption, growth preserved',async()=>{
  const b={token:token.token,orderId:o.id,expectedVersion:o.version};const results=await Promise.all(Array.from({length:30},()=>staff.client.call('confirmPickup',b,{},key())));assert.ok(results.every(r=>r.status==='FULFILLED'));
  const w=await student.client.call('getMyWallet');assert.equal(w.availablePoints,10);assert.equal(w.frozenPoints,0);assert.equal(w.growthMileage,910);assert.equal((await reconcile(student.id)).matches,true);
  assert.equal((await rows(pool,"SELECT id FROM inventory_movements WHERE order_id=? AND kind='FULFILL'",[o.id])).length,1);
  await assert.rejects(student.client.call('cancelOrder',{expectedVersion:results[0].version,reason:'已领取不能取消'},{orderId:o.id},key()),rejects('INVALID_STATE'));
  const stable=key();await staff.client.call('confirmPickup',b,{},stable);await migration.execute("DELETE FROM role_scopes WHERE user_id=? AND scope_type='PICKUP' AND scope_id=?",[staff.id,site]);
  try{await assert.rejects(staff.client.call('confirmPickup',b,{},stable),rejects('SCOPE_FORBIDDEN'));}finally{await migration.execute("INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,'PICKUP',?)",[staff.id,site]);}
 });
 await t.test('FEFO allocates earliest expiration first and cancel restores original deadlines',async()=>{
  const u=await fixture('fefo',['STUDENT'],'student');const later=new Date(Date.now()+20*86400000),earlier=new Date(Date.now()+10*86400000);const late=await credit(u.id,50,later),early=await credit(u.id,10,earlier);
  const r=await u.client.call('createOrder',request('R001'),{},key());const allocations=await rows<{lot_id:string;points:number}>(pool,'SELECT * FROM order_reservations WHERE order_id=?',[r.id]);assert.equal(allocations.find(a=>a.lot_id===early)?.points,10);assert.equal(allocations.find(a=>a.lot_id===late)?.points,20);
  await u.client.call('cancelOrder',{expectedVersion:r.version,reason:'保留期限'},{orderId:r.id},key());const lots=await rows<{entry_id:string;available:number;expires_at:Date}>(pool,'SELECT * FROM point_lots WHERE user_id=?',[u.id]);assert.equal(lots.find(l=>l.entry_id===early)?.expires_at.getTime(),earlier.getTime());assert.equal(lots.find(l=>l.entry_id===late)?.expires_at.getTime(),later.getTime());assert.equal(lots.find(l=>l.entry_id===early)?.available,10);
 });
 await t.test('T05 parallel products cannot exceed a single wallet',async()=>{
  const u=await fixture('budget',['STUDENT'],'student');await credit(u.id,60);const result=await Promise.allSettled(['R002','R003'].map(id=>u.client.call('createOrder',request(id),{},key())));assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.equal((await u.client.call('getMyWallet')).availablePoints,0);
 });
 await t.test('T10 injected failure rolls back order, reservations, stock, ledger, outbox and receipt',async()=>{
  const u=await fixture('rollback',['STUDENT'],'student');await credit(u.id,100);const ctx={actorId:u.id,requestId:randomUUID(),key:randomUUID()};
  await assert.rejects(orderWrite('createOrder',ctx,{},request('R001'),{failAfterReserve:true}),/INJECTED_ORDER_TRANSACTION_FAILURE/);
  assert.equal((await rows(pool,'SELECT id FROM redemption_orders WHERE user_id=?',[u.id])).length,0);assert.equal((await rows(pool,'SELECT id FROM outbox_events WHERE user_id=?',[u.id])).length,0);assert.equal((await rows(pool,'SELECT request_key FROM command_receipts WHERE actor_id=?',[u.id])).length,0);assert.equal((await u.client.call('getMyWallet')).availablePoints,100);
  const successful=await orderWrite('createOrder',ctx,{},request('R001')) as Schemas['Order'];assert.equal(successful.status,'PREPARING');
 });
 await t.test('T07 cancel/expire/fulfill race yields one terminal transition and conserved projections',async()=>{
  const u=await fixture('terminal',['STUDENT'],'student');await credit(u.id,60);let r=await u.client.call('createOrder',request('R001'),{},key());r=await staff.client.call('markOrderReady',{expectedVersion:r.version},{orderId:r.id},key());const credential=await u.client.call('issuePickupCredential',undefined,{orderId:r.id},key());
  await Promise.allSettled([u.client.call('cancelOrder',{expectedVersion:r.version,reason:'取消'},{orderId:r.id},key()),staff.client.call('confirmPickup',{token:credential.token,orderId:r.id,expectedVersion:r.version},{},key()),orderWrite('expireOrder',{actorId:ops.id,key:randomUUID(),requestId:randomUUID()},{orderId:r.id},{expectedVersion:r.version},{now:new Date(Date.parse(r.expiresAt!)+1)})]);
  const final=await u.client.call('getOrder',undefined,{orderId:r.id});assert.ok(['CANCELLED','EXPIRED','FULFILLED'].includes(final.status));const w=await u.client.call('getMyWallet');assert.equal(w.frozenPoints,0);assert.equal(w.availablePoints,final.status==='FULFILLED'?30:60);assert.equal(w.growthMileage,60);assert.equal((await reconcile(u.id)).matches,true);
  assert.equal((await rows(pool,"SELECT id FROM inventory_movements WHERE order_id=? AND kind IN ('RELEASE','FULFILL')",[r.id])).length,1);
 });
 await t.test('T11 expired reserved lot cancellation uses seven-day compensation; repeated cancel cannot renew it',async()=>{
  const u=await fixture('expiry',['STUDENT'],'student');const expires=new Date(Date.now()+60000);const lot=await credit(u.id,30,expires);const r=await u.client.call('createOrder',request('R001'),{},key());
  const future=new Date(expires.getTime()+1000),ctx={actorId:u.id,key:randomUUID(),requestId:randomUUID()};const b={expectedVersion:r.version,reason:'占用期间到期'};await orderWrite('cancelOrder',ctx,{orderId:r.id},b,{now:future});
  const [original]=await rows<{reserved:number;available:number;expired:number}>(pool,'SELECT * FROM point_lots WHERE entry_id=?',[lot]);assert.equal(original.reserved,0);assert.equal(original.available,0);assert.equal(original.expired,30);
  const [comp]=await rows<{expires_at:Date}>(pool,'SELECT * FROM point_lots WHERE user_id=? AND available>0',[u.id]);assert.equal(comp.expires_at.getTime(),future.getTime()+7*86400000);await orderWrite('cancelOrder',ctx,{orderId:r.id},b,{now:new Date(future.getTime()+300000)});assert.equal((await rows<{expires_at:Date}>(pool,'SELECT * FROM point_lots WHERE user_id=? AND available>0',[u.id]))[0].expires_at.getTime(),comp.expires_at.getTime());
 });
});
