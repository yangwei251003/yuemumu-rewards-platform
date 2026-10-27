import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import mysql from 'mysql2/promise';
import {config} from '../../packages/db/src/config';
import {pool,rows,transaction} from '../../packages/db/src/client';
import {approveSource,postSource,reconcile,revokeLotEntitlement,DomainError} from '../../packages/domain/src/ledger';
import {appendLedger,assertWallet} from '../../packages/domain/src/commands';
import {orderWrite,expireLots} from '../../packages/domain/src/orders';
import {growthWrite} from '../../packages/domain/src/growth';
import type {Schemas} from '../../packages/sdk/src';

// Only the parent runs this suite after integrating migration 0008. Every write
// below addresses fresh fictional users and inventory, never demo user balances.
const c=config(),migration=mysql.createPool({host:c.dbHost,port:c.dbPort,user:c.migrationUser,password:c.migrationPassword,database:c.database,timezone:'Z'});
const prefix='PROV_'+randomUUID().slice(0,8),site=prefix+'_site',ops=prefix+'_ops',reviewer=prefix+'_reviewer';
const clock=new Date(Date.now()+3600000),afterExpiry=new Date(clock.getTime()+1000);
const ctx=(actorId:string)=>({actorId,requestId:randomUUID(),key:randomUUID()});
const isError=(code:string)=>(e:unknown)=>e instanceof DomainError&&e.code===code;
async function user(suffix:string,roles=['STUDENT']){
 const id=prefix+'_'+suffix;
 await migration.execute('INSERT INTO users(id,person_id,organization_id,display_name,roles,membership_status,demo_only) VALUES (?,?,?,?,?,?,FALSE)',[id,id,prefix,'批次溯源隔离测试',JSON.stringify(roles),'ACTIVE']);
 await migration.execute('INSERT INTO wallets(user_id) VALUES (?)',[id]);
 for(const [type,scope]of [['PICKUP',site],['GROWTH_REVIEW',prefix]])await migration.execute('INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,?,?)',[id,type,scope]);
 return id;
}
async function grant(userId:string,points:number,expires=clock){
 const id=randomUUID();
 return transaction(async cx=>{await assertWallet(cx,userId);const entry=await appendLedger(cx,ctx(ops),{userId,businessKey:id,kind:'EARN',available:points,growth:points,sourceType:'TEST_FIXTURE',sourceId:id,reason:'隔离测试已批准权益'});await cx.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at) VALUES (?,?,?,?)',[entry,userId,points,expires]);return entry;});
}
async function reverse(userId:string,entry:string,points:number){
 const source=randomUUID();await migration.execute('INSERT INTO earning_sources(id,beneficiary_id,organization_id,applicant_person_id,interested_person_ids,kind,points,growth,reverse_entry_id,reason,rule_version) VALUES (?,?,?,?,?,\'REVERSE\',?,?,?,?,?)',[source,userId,prefix,userId,'[]',points,points,entry,'双独立自然人复核撤销模拟成果','DRAFT_FOR_DEMO:v1']);
 await approveSource(ops,source);await approveSource(reviewer,source);
 const key=randomUUID();return {source,key,result:await postSource(ops,source,key)};
}
async function create(userId:string,now=new Date()){
 return await orderWrite('createOrder',ctx(userId),{},{rewardId:'R001',quantity:1,expectedRewardVersion:1,pickupSiteId:site},{now}) as Schemas['Order'];
}
async function cancel(userId:string,order:Schemas['Order'],now=afterExpiry){
 return await orderWrite('cancelOrder',ctx(userId),{orderId:order.id},{expectedVersion:order.version,reason:'批次占用期间到期'},{now}) as Schemas['Order'];
}
async function fulfill(userId:string,order:Schemas['Order'],now=new Date()){
 order=await orderWrite('markOrderReady',ctx(ops),{orderId:order.id},{expectedVersion:order.version},{now}) as Schemas['Order'];
 const code=await orderWrite('issuePickupCredential',ctx(userId),{orderId:order.id},undefined,{now}) as Schemas['Credential'];
 await orderWrite('confirmPickup',ctx(ops),{},{orderId:order.id,token:code.token,expectedVersion:order.version},{now});
}
async function expire(userId:string,now=afterExpiry){await transaction(async cx=>{await assertWallet(cx,userId);await expireLots(cx,ctx(ops),userId,now);});}
async function wallet(userId:string){const[w]=await rows<{available_points:number;growth_mileage:number;recovery_due:number;frozen_points:number}>(pool,'SELECT * FROM wallets WHERE user_id=?',[userId]);assert.equal((await reconcile(userId)).matches,true);return w;}
after(async()=>{await migration.end();await pool.end();});

test('T11/T12/T19 real MySQL lot provenance and corrections',async t=>{
 await user('ops',['OPS_MANAGER']);await user('reviewer',['REVIEWER']);
 await migration.execute('INSERT INTO inventory(reward_id,site_id,organization_id,on_hand) VALUES (?,?,?,100)',['R001',site,prefix]);

 await t.test('expired unspent grant reversal creates no debt and preserves unrelated growth',async()=>{
  const u=await user('expired'),root=await grant(u,100);await grant(u,50,new Date(clock.getTime()+30*86400000));
  await expire(u);const r=await reverse(u,root,100);
  assert.equal(r.result.delta_available,0);assert.equal(r.result.delta_recovery,0);
  const w=await wallet(u);assert.equal(w.available_points,50);assert.equal(w.growth_mileage,50);assert.equal(w.recovery_due,0);
 });

 await t.test('mixed spent and naturally expired points charge only actual consumption',async()=>{
  const u=await user('spent'),root=await grant(u,100);await fulfill(u,await create(u));await expire(u);await reverse(u,root,100);
  const w=await wallet(u);assert.equal(w.available_points,0);assert.equal(w.growth_mileage,0);assert.equal(w.recovery_due,30);
 });

 await t.test('multi-origin cancellation keeps separate compensation roots and reverses only one origin',async()=>{
  const u=await user('mixed'),first=await grant(u,10),second=await grant(u,20);const order=await create(u);await cancel(u,order);
  const children=await rows<{entry_id:string;root_entry_id:string;available:number;expires_at:Date}>(pool,'SELECT * FROM point_lots WHERE user_id=? AND parent_entry_id IS NOT NULL ORDER BY available',[u]);
  assert.equal(children.length,2);assert.deepEqual(children.map(l=>l.available),[10,20]);assert.equal(children[0].root_entry_id,first);assert.equal(children[1].root_entry_id,second);
  assert.ok(children.every(l=>l.expires_at.getTime()===afterExpiry.getTime()+7*86400000));
  await reverse(u,first,10);const w=await wallet(u);assert.equal(w.available_points,20);assert.equal(w.growth_mileage,20);assert.equal(w.recovery_due,0);
  assert.equal((await rows<{available:number}>(pool,'SELECT available FROM point_lots WHERE entry_id=?',[children[1].entry_id]))[0].available,20);
 });

 await t.test('consumed compensation records recovery once; request replay and another reversal cannot double charge',async()=>{
  const u=await user('comp_spent'),root=await grant(u,30);await cancel(u,await create(u));await fulfill(u,await create(u,afterExpiry),afterExpiry);
  const r=await reverse(u,root,30);assert.equal(r.result.delta_recovery,30);assert.equal((await postSource(ops,r.source,r.key)).id,r.result.id);
  await assert.rejects(reverse(u,root,30),isError('ALREADY_REVERSED'));assert.equal((await wallet(u)).recovery_due,30);
 });

 await t.test('reserved compensation blocks the entire reversal, then a second transfer still retains root',async()=>{
  const u=await user('chain'),root=await grant(u,30);await cancel(u,await create(u));const order=await create(u,afterExpiry);
  await assert.rejects(reverse(u,root,30),isError('RESERVATIONS_EXIST'));assert.equal((await wallet(u)).frozen_points,30);
  const later=new Date(afterExpiry.getTime()+8*86400000);await cancel(u,order,later);
  const descendants=await rows<{parent_entry_id:string;root_entry_id:string}>(pool,'SELECT * FROM point_lots WHERE user_id=? AND parent_entry_id IS NOT NULL',[u]);assert.equal(descendants.length,2);assert.ok(descendants.every(l=>l.root_entry_id===root));
  await reverse(u,root,30);const w=await wallet(u);assert.equal(w.available_points,0);assert.equal(w.frozen_points,0);assert.equal(w.recovery_due,0);
 });

 await t.test('partial corrections consume expiry eligibility once before charging spent points; failure rolls back',async()=>{
  const u=await user('partial'),root=await grant(u,100);await fulfill(u,await create(u));await expire(u);
  const adjust=async(points:number)=>transaction(async cx=>{await assertWallet(cx,u);const r=await revokeLotEntitlement(cx,u,[root],points);await appendLedger(cx,ctx(ops),{userId:u,businessKey:randomUUID(),kind:'REVERSE',available:-r.recovered,growth:-points,recovery:r.recovery,sourceType:'TEST_FIXTURE',sourceId:root,reason:'隔离测试累计权益更正'});return r;});
  const untouched=await wallet(u);await assert.rejects(adjust(101),isError('PROVENANCE_MISMATCH'));assert.deepEqual(await wallet(u),untouched);
  const [rolledBack]=await rows<{consumed_revoked:number;expired_revoked:number}>(pool,'SELECT consumed_revoked,expired_revoked FROM point_lots WHERE entry_id=?',[root]);assert.deepEqual(rolledBack,{consumed_revoked:0,expired_revoked:0});
  assert.equal((await adjust(50)).recovery,0);assert.equal((await adjust(30)).recovery,10);assert.equal((await adjust(20)).recovery,20);
  const before=await wallet(u);await assert.rejects(adjust(1),isError('PROVENANCE_MISMATCH'));assert.deepEqual(await wallet(u),before);assert.equal(before.recovery_due,30);
 });

 await t.test('competition withdrawal finds compensated consumption, preserves other awards and re-award cannot re-charge old consumption',async()=>{
  const u=await user('competition');const competition=await growthWrite('createCompetition',ctx(ops),{},{title:'溯源模拟赛事',series:prefix,edition:'2026',awardTrack:'OPEN',allowedLevels:['SCHOOL'],description:'虚构比赛用于回归'}) as Schemas['Competition'];
  const body:Schemas['CompetitionAwardRequest']={competitionId:competition.id,artifactId:prefix+'_artifact',level:'SCHOOL',rank:1,members:[{userId:u,coefficientBasisPoints:10000}],correction:false,evidenceFileIds:[],description:'隔离比赛成果'};
  const decide=async(b:Schemas['CompetitionAwardRequest'])=>{let a=await growthWrite('submitCompetitionAward',ctx(u),{},b) as Schemas['AwardRequest'];a=await growthWrite('decideAwardRequest',ctx(reviewer),{awardId:a.id},{decision:'APPROVE',reason:'独立审查1',expectedVersion:a.version}) as Schemas['AwardRequest'];return await growthWrite('decideAwardRequest',ctx(ops),{awardId:a.id},{decision:'APPROVE',reason:'独立审查2',expectedVersion:a.version}) as Schemas['AwardRequest'];};
  await decide(body);await migration.execute("UPDATE point_lots l JOIN ledger_entries e ON e.id=l.entry_id SET l.expires_at=? WHERE l.user_id=? AND e.source_type='COMPETITION'",[clock,u]);
  await grant(u,50,new Date(clock.getTime()+30*86400000));await cancel(u,await create(u));await fulfill(u,await create(u,afterExpiry),afterExpiry);
  await decide({...body,rank:-1,correction:true});let w=await wallet(u);assert.equal(w.available_points,50);assert.equal(w.growth_mileage,50);assert.equal(w.recovery_due,30);
  await decide({...body,correction:true});await decide({...body,rank:-1,correction:true});w=await wallet(u);assert.equal(w.available_points,50);assert.equal(w.growth_mileage,50);assert.equal(w.recovery_due,30);
 });
});
