import {seedScope} from '../../scripts/seed-scope';
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool,rows,transaction} from '../../packages/db/src/client';
import {appendLedger,assertWallet} from '../../packages/domain/src/commands';
import {ApiError,type Schemas} from '../../packages/sdk/src';
import {fixture,migration,prefix,key} from '../integration/fixtures';

type Person=Awaited<ReturnType<typeof fixture>>;
type Create=Schemas['AccessRequestCreate'];
const denied=(code:string)=>(e:unknown)=>e instanceof ApiError&&e.problem.code===code;
const forbidden=(e:unknown)=>e instanceof ApiError&&e.status===403;
const site=prefix+'_access_site';
async function person(suffix:string,roles:string[],personId?:string,org=prefix,local=true){
 const p=await fixture('access_'+suffix,roles,roles.includes('STUDENT')?'student':'staff',personId,org);
 // Only these newly created isolated fixtures are reset. The production API never deletes scopes.
 await migration.execute('DELETE FROM role_scopes WHERE user_id=?',[p.id]);
 await migration.execute('UPDATE users SET demo_only=? WHERE id=?',[local,p.id]);return p;
}
async function scope(p:Person,type:string,id=prefix){await migration.execute('INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,?,?)',[p.id,type,id]);}
after(async()=>{await migration.end();await pool.end();});

test('ACCESS real HTTP and MySQL independently approved local staff roles and scopes',async t=>{
 const admin=await person('admin',['SYSTEM_ADMIN']),one=await person('one',['REVIEWER']),two=await person('two',['REVIEWER']),three=await person('three',['REVIEWER']);
 for(const p of [one,two,three])await scope(p,'ACCESS_APPROVAL');
 await migration.execute('INSERT INTO inventory(reward_id,site_id,organization_id,on_hand) VALUES (?,?,?,20)',['R001',site,prefix]);
 const state=async(p:Person)=>{const found=(await admin.client.call('listAccessStaff',undefined,{limit:100})).items.find(s=>s.id===p.id);assert.ok(found);return found;};
 const create=async(p:Person,action:Create['action'],role:Create['role'],scopeType:Create['scopeType']=null,scopeId:string|null=null)=>admin.client.call('createAccessRequest',{targetId:p.id,action,role,scopeType,scopeId,expectedSubjectVersion:(await state(p)).subjectVersion,reason:'隔离模拟职员的明确授权依据；立即有效直至明确撤销'},{},key());
 const decide=async(p:Person,r:Schemas['AccessRequest'],decision:'APPROVE'|'REJECT'='APPROVE')=>p.client.call('decideAccessRequest',{expectedVersion:r.version,decision,reason:'独立自然人核验目标、原范围、变更依据与职责分离'},{requestId:r.id},key());
 const approve=async(r:Schemas['AccessRequest'])=>decide(two,await decide(one,r));

 await t.test('grant and revoke explicit pickup scope: dual approval, immutable events, same old session lists and cached write lose access',async()=>{
  const operator=await person('operator',['REWARD_OPERATOR']),student=await person('buyer',['STUDENT']);
  assert.equal((await operator.client.call('listInventory')).items.length,0);
  const body:Create={targetId:operator.id,action:'GRANT_SCOPE',role:'REWARD_OPERATOR',scopeType:'PICKUP',scopeId:site,expectedSubjectVersion:0,reason:'授予模拟领取点，双人复核'},k=key();let r=await admin.client.call('createAccessRequest',body,{},k);
  assert.equal((await admin.client.call('createAccessRequest',body,{},k)).id,r.id);
  await assert.rejects(admin.client.call('createAccessRequest',body,{},key()),denied('ACCESS_REQUEST_PENDING'));
  r=await decide(one,r);assert.equal(r.status,'PARTIAL_APPROVAL');assert.equal((await operator.client.call('listInventory')).items.length,0);
  r=await decide(two,r);assert.equal(r.status,'APPROVED');assert.equal((await state(operator)).subjectVersion,1);assert.equal((await operator.client.call('listInventory')).items[0].siteId,site);
  await transaction(async cx=>{await assertWallet(cx,student.id);const entry=await appendLedger(cx,{actorId:one.id,key:randomUUID(),requestId:randomUUID()},{userId:student.id,businessKey:randomUUID(),kind:'EARN',available:30,growth:30,sourceType:'TEST_FIXTURE',sourceId:student.id,reason:'隔离授权测试的模拟权益'});await cx.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at) VALUES (?,?,30,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 30 DAY))',[entry,student.id]);});
  let order=await student.client.call('createOrder',{rewardId:'R001',quantity:1,expectedRewardVersion:1,pickupSiteId:site},{},key());const readyBody={expectedVersion:order.version},readyKey=key();order=await operator.client.call('markOrderReady',readyBody,{orderId:order.id},readyKey);assert.ok((await operator.client.call('listStaffOrders')).items.some(o=>o.id===order.id));
  const before=(await rows<{n:number}>(pool,'SELECT COUNT(*) n FROM role_scopes WHERE user_id=?',[operator.id]))[0].n;
  r=await approve(await create(operator,'REVOKE_SCOPE','REWARD_OPERATOR','PICKUP',site));assert.equal(r.status,'APPROVED');
  assert.equal((await operator.client.call('listInventory')).items.length,0);assert.equal((await operator.client.call('listStaffOrders')).items.length,0);await assert.rejects(operator.client.call('markOrderReady',readyBody,{orderId:order.id},readyKey),denied('SCOPE_FORBIDDEN'));
  const projected=await rows<{scope_type:string;scope_id:string}>(pool,'SELECT scope_type,scope_id FROM role_scopes WHERE user_id=?',[operator.id]);assert.equal(projected.length,before);assert.equal(projected[0].scope_type,'ACCESS_REVOKED');await seedScope(operator.id,'PICKUP',site);assert.equal((await operator.client.call('listInventory')).items.length,0);assert.equal((await rows(pool,"SELECT user_id FROM role_scopes WHERE user_id=? AND scope_type='PICKUP'",[operator.id])).length,0);
  const events=(await admin.client.call('listAccessEvents',undefined,{limit:100})).items.filter(e=>e.targetId===operator.id);assert.equal(events.length,2);assert.equal(events.find(e=>e.action==='REVOKE_SCOPE')?.scopeId,site);assert.equal(events.find(e=>e.action==='REVOKE_SCOPE')?.id,projected[0].scope_id);assert.equal((await state(operator)).scopes.length,0);
  await student.client.call('cancelOrder',{expectedVersion:order.version,reason:'隔离授权测试取消预占'},{orderId:order.id},key());
 });

 await t.test('role removal retires only unsupported scopes, restores empty original staff safely, and never revives tombstones',async()=>{
  const p=await person('roles',['MENTOR']);await scope(p,'GROWTH_REVIEW');
  await approve(await create(p,'GRANT_ROLE','REWARD_OPERATOR'));await approve(await create(p,'GRANT_SCOPE','REWARD_OPERATOR','PICKUP',site));assert.equal((await p.client.call('listInventory')).items.length,1);
  await approve(await create(p,'REVOKE_ROLE','REWARD_OPERATOR'));assert.deepEqual((await state(p)).roles,['MENTOR']);assert.deepEqual((await state(p)).scopes,[{scopeType:'GROWTH_REVIEW',scopeId:prefix}]);await assert.rejects(p.client.call('listInventory'),forbidden);
  await approve(await create(p,'GRANT_ROLE','REWARD_OPERATOR'));assert.equal((await p.client.call('listInventory')).items.length,0);
  await approve(await create(p,'GRANT_SCOPE','REWARD_OPERATOR','PICKUP',site));assert.equal((await p.client.call('listInventory')).items.length,1);
  await approve(await create(p,'REVOKE_ROLE','MENTOR'));assert.deepEqual((await state(p)).scopes,[{scopeType:'PICKUP',scopeId:site}]);
  await approve(await create(p,'REVOKE_ROLE','REWARD_OPERATOR'));assert.deepEqual((await state(p)).roles,[]);assert.equal((await state(p)).scopes.length,0);await assert.rejects(p.client.call('listInventory'),forbidden);
  await approve(await create(p,'GRANT_ROLE','REWARD_OPERATOR'));assert.equal((await p.client.call('listInventory')).items.length,0);
  assert.equal((await rows(pool,'SELECT * FROM access_staff_registry WHERE user_id=?',[p.id])).length,1);
 });

 await t.test('student, non-demo, cross organization, technical account and same natural person grants are rejected',async()=>{
  const student=await person('protected_student',['STUDENT']),real=await person('protected_real',['REWARD_OPERATOR'],undefined,prefix,false),other=await person('protected_org',['REWARD_OPERATOR'],undefined,prefix+'_other'),alias=await person('protected_alias',['REWARD_OPERATOR'],admin.id);
  const body=(id:string):Create=>({targetId:id,action:'GRANT_SCOPE',role:'REWARD_OPERATOR',scopeType:'PICKUP',scopeId:site,expectedSubjectVersion:0,reason:'权限边界测试'});
  for(const p of [student,real])await assert.rejects(admin.client.call('createAccessRequest',body(p.id),{},key()),denied('LOCAL_STAFF_ONLY'));
  await assert.rejects(admin.client.call('createAccessRequest',body(other.id),{},key()),denied('NOT_FOUND'));await assert.rejects(admin.client.call('createAccessRequest',body(admin.id),{},key()),denied('TECHNICAL_ACCOUNT_PROTECTED'));await assert.rejects(admin.client.call('createAccessRequest',body(alias.id),{},key()),denied('TECHNICAL_ACCOUNT_PROTECTED'));
  const visible=(await admin.client.call('listAccessStaff',undefined,{limit:100})).items;assert.equal(visible.some(p=>[student.id,real.id,other.id].includes(p.id)),false);assert.equal(visible.find(p=>p.id===admin.id)?.protectedTechnicalAccount,true);
  await assert.rejects(admin.client.call('listInventory'),forbidden);await assert.rejects(real.client.call('listAccessStaff'),denied('LOCAL_STAFF_ONLY'));
 });

 await t.test('fixed roles, explicit resources and bootstrap approval boundary block arbitrary or wildcard expansion',async()=>{
  const p=await person('scope_guard',['REVIEWER']);await scope(p,'PROJECT','*');
  await assert.rejects(create(p,'GRANT_SCOPE','REVIEWER','PICKUP','*'),denied('WILDCARD_NOT_ALLOWED'));await assert.rejects(create(p,'GRANT_ROLE','REWARD_OPERATOR'),denied('WILDCARD_CLEANUP_REQUIRED'));await assert.rejects(create(p,'GRANT_SCOPE','REVIEWER','ACCESS_APPROVAL',prefix),denied('APPROVAL_SCOPE_PROTECTED'));await assert.rejects(create(p,'GRANT_SCOPE','REVIEWER','REVIEW',prefix+'_other'),denied('SCOPE_OUTSIDE_ORGANIZATION'));await assert.rejects(create(p,'GRANT_SCOPE','REVIEWER','PICKUP',prefix+'_missing'),denied('SCOPE_NOT_FOUND'));
  await approve(await create(p,'REVOKE_SCOPE','REVIEWER','PROJECT','*'));await approve(await create(p,'GRANT_ROLE','REWARD_OPERATOR'));assert.equal((await state(p)).scopes.length,0);
  const b:Create={targetId:p.id,action:'GRANT_ROLE',role:'SYSTEM_ADMIN' as Create['role'],scopeType:null,scopeId:null,expectedSubjectVersion:2,reason:'试图提交固定枚举之外的技术角色'};await assert.rejects(admin.client.call('createAccessRequest',b,{},key()),e=>e instanceof ApiError&&e.status===422);
 });

 await t.test('two accounts of one person do not count twice; target and requester are recused; approval replay is idempotent',async()=>{
  const p=await person('recusal',['REVIEWER']);await scope(p,'ACCESS_APPROVAL');const alias=await person('review_alias',['REVIEWER'],one.id);await scope(alias,'ACCESS_APPROVAL');
  let r=await create(p,'GRANT_SCOPE','REVIEWER','PICKUP',site);await assert.rejects(decide(p,r),denied('RECUSAL_REQUIRED'));await assert.rejects(decide(admin,r),forbidden);
  const b={expectedVersion:r.version,decision:'APPROVE' as const,reason:'第一位独立自然人'},k=key();r=await one.client.call('decideAccessRequest',b,{requestId:r.id},k);assert.equal((await one.client.call('decideAccessRequest',b,{requestId:r.id},k)).version,r.version);await assert.rejects(decide(alias,r),denied('DUPLICATE_PERSON'));r=await decide(two,r);assert.equal(r.completedApprovers,2);assert.equal(r.status,'APPROVED');
 });

 await t.test('pending snapshot drift prevents application and second-decision insert rolls back; explicit rejection closes request',async()=>{
  const p=await person('snapshot',['REWARD_OPERATOR']);let r=await decide(one,await create(p,'GRANT_SCOPE','REWARD_OPERATOR','PICKUP',site));await scope(p,'AUDIT');
  await assert.rejects(decide(two,r),denied('ACCESS_TARGET_CHANGED'));assert.equal((await rows(pool,'SELECT actor_id FROM access_decisions WHERE request_id=?',[r.id])).length,1);assert.equal((await state(p)).subjectVersion,0);assert.equal((await p.client.call('listInventory')).items.length,0);r=await decide(two,r,'REJECT');assert.equal(r.status,'REJECTED');assert.equal((await rows(pool,'SELECT id FROM access_events WHERE request_id=?',[r.id])).length,0);
 });

 await t.test('approval scope revocation invalidates old reviewer session and cached decision; old approval no longer counts',async()=>{
  const reviewer=await person('revocable',['REVIEWER']);await scope(reviewer,'ACCESS_APPROVAL');const p=await person('pending_after_revoke',['REWARD_OPERATOR']);let r=await create(p,'GRANT_SCOPE','REWARD_OPERATOR','PICKUP',site);const b={expectedVersion:r.version,decision:'APPROVE' as const,reason:'撤权前的独立审批'},k=key();r=await reviewer.client.call('decideAccessRequest',b,{requestId:r.id},k);
  await approve(await create(reviewer,'REVOKE_SCOPE','REVIEWER','ACCESS_APPROVAL',prefix));await assert.rejects(reviewer.client.call('listAccessStaff'),denied('SCOPE_FORBIDDEN'));await assert.rejects(reviewer.client.call('decideAccessRequest',b,{requestId:r.id},k),denied('SCOPE_FORBIDDEN'));
  r=await decide(two,r);assert.equal(r.status,'PARTIAL_APPROVAL');assert.equal((await p.client.call('listInventory')).items.length,0);r=await decide(three,r);assert.equal(r.status,'APPROVED');assert.equal((await p.client.call('listInventory')).items.length,1);
 });

 await t.test('concurrent duplicate requests and final approval attempts do not duplicate grants or audit events',async()=>{
  const p=await person('race',['REWARD_OPERATOR']);const input:Create={targetId:p.id,action:'GRANT_SCOPE',role:'REWARD_OPERATOR',scopeType:'PICKUP',scopeId:site,expectedSubjectVersion:0,reason:'隔离并发授权测试'};const results=await Promise.allSettled([admin.client.call('createAccessRequest',input,{},key()),admin.client.call('createAccessRequest',input,{},key())]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);let r=(results.find(r=>r.status==='fulfilled') as PromiseFulfilledResult<Schemas['AccessRequest']>).value;r=await decide(one,r);
  const approvals=await Promise.allSettled([decide(two,r),decide(three,r)]);assert.equal(approvals.filter(a=>a.status==='fulfilled').length,1);assert.equal((await rows(pool,'SELECT id FROM access_events WHERE request_id=?',[r.id])).length,1);assert.equal((await state(p)).subjectVersion,1);
 });
});
