import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {fixture,migration,key,prefix} from '../integration/fixtures';
import {pool,rows} from '../../packages/db/src/client';
import {orderWrite} from '../../packages/domain/src/orders';
import {ApiError} from '../../packages/sdk/src';

after(async()=>{await migration.end();await pool.end();});
const rejects=(code:string)=>(e:unknown)=>e instanceof ApiError&&e.problem.code===code;

test('T27 real API uses source dates, inclusive rolling 30 days and separate pickup history',async()=>{
 const ops=await fixture('boundary_ops',['OPS_MANAGER']),review=await fixture('boundary_review',['REVIEWER']),audit=await fixture('boundary_audit',['AUDITOR']),s=await fixture('boundary_s',['STUDENT'],'student');
 const base=new Date(Date.now()-2*86400000), registrations:string[]=[];
 // All registrations precede adjudication. Only fixture source timestamps are historical;
 // the machine clock, application clock and penalty expiry clock remain untouched.
 for(const [i,time] of [base.getTime()-30*86400000-1,base.getTime()-30*86400000,base.getTime(),base.getTime()+1].entries()){
  let a=await ops.client.call('createActivity',{title:'30天来源时间边界 '+i,startsAt:new Date(time-4*3600000).toISOString(),endsAt:new Date(time).toISOString(),capacity:2,ruleCode:'TRAINING_4H',completionRequirements:'起止签到及独立成果'},{},key());
  a=await ops.client.call('publishActivity',{expectedVersion:a.version},{activityId:a.id},key());
  const r=await s.client.call('registerActivity',{activityVersion:a.version,acceptedRuleVersion:'DRAFT_FOR_DEMO:v1'},{activityId:a.id},key());
  if(i===3)await s.client.call('cancelRegistration',{expectedVersion:r.version,reason:'合理提前取消，不应计入失约'},{registrationId:r.id},key());
  await ops.client.call('completeActivity',{expectedVersion:a.version},{activityId:a.id},key());registrations.push(r.id);
 }
 const request=(resourceId:string)=>({subjectId:s.id,caseType:'REGISTRATION_NO_SHOW' as const,resourceId,severity:1,description:'仅核对模拟来源事实与滚动窗口，不自动扣分',evidenceFileIds:[],occurredAt:new Date(Date.now()-1000).toISOString()});
 const cases=[];
 for(let i=0;i<3;i++){
  let c=await audit.client.call('createCase',request(registrations[i]),{},key());
  c=await review.client.call('decideCase',{expectedVersion:c.version,decision:'CONFIRM',reason:'独立核对来源截止时间及失约条件'},{caseId:c.id},key());cases.push(c);
 }
 assert.deepEqual(cases.map(c=>c.proposedDays),[0,7,7]);
 assert.equal(cases[2].occurredAt,base.toISOString());
 assert.equal(cases[2].restrictionScope,'REGISTRATION');
 await assert.rejects(audit.client.call('createCase',request(registrations[3]),{},key()),rejects('NOT_A_NO_SHOW'));
 await assert.rejects(audit.client.call('createCase',request(registrations[2]),{},key()),rejects('DUPLICATE_CASE'));
 // A normal immutable seed event belongs only to this isolated test identity.
 const entry=randomUUID(),site=prefix+'_BOUNDARY_SITE';
 await migration.execute("INSERT INTO ledger_entries(id,user_id,business_key,kind,delta_available,delta_growth,source_type,source_id,rule_version,reason,actor_id,request_id) VALUES (?,?,?,'EARN',60,60,'TEST_FIXTURE',?,'DRAFT_FOR_DEMO:v1','隔离失约测试的合法初始积分',?,?)",[entry,s.id,entry,entry,s.id,entry]);
 await migration.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at) VALUES (?,?,60,?)',[entry,s.id,new Date(Date.now()+30*86400000)]);
 await migration.execute('UPDATE wallets SET available_points=60,growth_mileage=60 WHERE user_id=?',[s.id]);
 await migration.execute('INSERT INTO inventory(reward_id,site_id,organization_id,on_hand) VALUES (?,?,?,3)',['R001',site,prefix]);
 await migration.execute("INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,'PICKUP',?)",[ops.id,site]);
 const body={rewardId:'R001',quantity:1,expectedRewardVersion:1,pickupSiteId:site};
 const order=await s.client.call('createOrder',body,{},key());
 const ready=await orderWrite('markOrderReady',{actorId:ops.id,key:randomUUID(),requestId:randomUUID()},{orderId:order.id},{expectedVersion:order.version},{now:new Date(Date.now()-8*86400000)});
 assert.ok(ready);
 let expired=await s.client.call('getOrder',undefined,{orderId:order.id});
 for(let i=0;i<20&&expired.status!=='EXPIRED';i++){await delay(300);expired=await s.client.call('getOrder',undefined,{orderId:order.id});}
 assert.equal(expired.status,'EXPIRED');
 let pickup=await audit.client.call('createCase',{...request(order.id),caseType:'PICKUP_NO_SHOW'},{},key());
 pickup=await review.client.call('decideCase',{expectedVersion:pickup.version,decision:'CONFIRM',reason:'实物订单确已到期未领取，与报名历史分开计次'},{caseId:pickup.id},key());
 assert.equal(pickup.proposedDays,0);assert.equal(pickup.restrictionScope,'REDEMPTION');assert.equal(pickup.occurredAt,expired.expiresAt);
 const cancel=await s.client.call('createOrder',body,{},key());
 await s.client.call('cancelOrder',{expectedVersion:cancel.version,reason:'在领取前合理取消'},{orderId:cancel.id},key());
 await assert.rejects(audit.client.call('createCase',{...request(cancel.id),caseType:'PICKUP_NO_SHOW'},{},key()),rejects('NOT_A_NO_SHOW'));
 const w=await s.client.call('getMyWallet');assert.equal(w.availablePoints,60);assert.equal(w.frozenPoints,0);assert.equal(w.growthMileage,60);
 assert.equal((await rows(pool,"SELECT id FROM governance_cases WHERE subject_id=? AND case_type='PICKUP_NO_SHOW'",[s.id])).length,1);
});
