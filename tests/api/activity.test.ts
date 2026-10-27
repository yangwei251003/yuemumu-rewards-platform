import test,{after} from 'node:test';import assert from 'node:assert/strict';
import {migration,fixture,key,prefix} from '../integration/fixtures';
import {pool,rows} from '../../packages/db/src/client';
import {reconcile} from '../../packages/domain/src/ledger';
import {ApiError} from '../../packages/sdk/src';
after(async()=>{await migration.end();await pool.end();});
const rejects=(code:string)=>(e:unknown)=>e instanceof ApiError&&e.problem.code===code;
test('FLOW-01 real HTTP/MySQL isolated activity lifecycle',async t=>{
 const ops=await fixture('ops',['OPS_MANAGER']),mentor=await fixture('mentor',['MENTOR']),review=await fixture('review',['REVIEWER']);
 const student=await fixture('student',['STUDENT'],'student'),second=await fixture('second',['STUDENT'],'student');
 const b={title:'测试装调四小时',startsAt:new Date(Date.now()-4*3600000).toISOString(),endsAt:new Date().toISOString(),capacity:1,ruleCode:'TRAINING_4H' as const,completionRequirements:'起止签到与实操作品验收'};
 let a=await ops.client.call('createActivity',b,{},key());
 await t.test('draft hidden from students, capacity and accepted rule/version enforced',async()=>{
  await assert.rejects(student.client.call('getActivity',undefined,{activityId:a.id}),rejects('NOT_FOUND'));
  await assert.rejects(ops.client.call('createActivity',{...b,endsAt:b.startsAt},{},key()),rejects('INVALID_DURATION'));
  a=await ops.client.call('publishActivity',{expectedVersion:a.version},{activityId:a.id},key());
  await assert.rejects(student.client.call('registerActivity',{activityVersion:a.version,acceptedRuleVersion:'unapproved'},{activityId:a.id},key()),rejects('RULE_VERSION_CONFLICT'));
 });
 const regBody={activityVersion:a.version,acceptedRuleVersion:'DRAFT_FOR_DEMO:v1'};
 const requestKey=key();const registrations=await Promise.all(Array.from({length:20},()=>student.client.call('registerActivity',regBody,{activityId:a.id},requestKey)));
 const reg=registrations[0];assert.equal(new Set(registrations.map(r=>r.id)).size,1);
 await t.test('concurrent duplicate signup one row; full capacity waitlist promotes atomically',async()=>{
  const waiting=await second.client.call('registerActivity',regBody,{activityId:a.id},key());assert.equal(waiting.status,'WAITLISTED');
  await assert.rejects(second.client.call('cancelRegistration',{expectedVersion:reg.version,reason:'不能取消他人'},{registrationId:reg.id},key()),rejects('NOT_FOUND'));
  await second.client.call('cancelRegistration',{expectedVersion:waiting.version,reason:'取消候补'},{registrationId:waiting.id},key());
  const third=await fixture('third',['STUDENT'],'student');const wait=await third.client.call('registerActivity',regBody,{activityId:a.id},key());assert.equal(wait.status,'WAITLISTED');
  // Keep the main participant for the full flow; a separate one-seat activity exercises promotion.
  let other=await ops.client.call('createActivity',{...b,title:'候补测试'},{},key());other=await ops.client.call('publishActivity',{expectedVersion:other.version},{activityId:other.id},key());
  const r1=await second.client.call('registerActivity',{...regBody,activityVersion:other.version},{activityId:other.id},key());const r2=await third.client.call('registerActivity',{...regBody,activityVersion:other.version},{activityId:other.id},key());assert.equal(r2.status,'WAITLISTED');
  await second.client.call('cancelRegistration',{expectedVersion:r1.version,reason:'合理取消'},{registrationId:r1.id},key());assert.equal((await third.client.call('listMyRegistrations')).items.find(r=>r.id===r2.id)?.status,'REGISTERED');
 });
 const start=await mentor.client.call('issueAttendanceCode',{phase:'START'},{activityId:a.id},key());const end=await mentor.client.call('issueAttendanceCode',{phase:'END'},{activityId:a.id},key());
 await t.test('end-before-start rejected; scans alone never credit points',async()=>{
  await assert.rejects(student.client.call('recordAttendance',{activityId:a.id,phase:'END',token:end.token},{},key()),rejects('START_REQUIRED'));
  await student.client.call('recordAttendance',{activityId:a.id,phase:'START',token:start.token},{},key());
  await student.client.call('recordAttendance',{activityId:a.id,phase:'END',token:end.token},{},key());assert.equal((await student.client.call('getMyWallet')).availablePoints,0);
 });
 const submitBody={sourceType:'ACTIVITY' as const,sourceId:a.id,artifactId:prefix+'-artifact',evidenceFileIds:[],description:'完成装调接线与实操检查'};
 let s=await student.client.call('submitEvidence',submitBody,{},key());
 await t.test('artifact/source cannot repeat with a new key; approval requires completed activity and facts',async()=>{
  await assert.rejects(student.client.call('submitEvidence',submitBody,{},key()),rejects('DUPLICATE_ARTIFACT'));
  const ap=(await review.client.call('listApprovals')).items.find(p=>p.id===s.approvalId)!;
  await assert.rejects(review.client.call('decideApproval',{decision:'APPROVE',reason:'未核事实',expectedVersion:ap.version},{approvalId:ap.id},key()),rejects('FACT_VERIFICATION_REQUIRED'));
  await assert.rejects(mentor.client.call('verifySubmission',{expectedVersion:s.version,reason:'事实签认'},{submissionId:s.id},key()),rejects('ACTIVITY_NOT_COMPLETED'));
  a=await ops.client.call('completeActivity',{expectedVersion:a.version},{activityId:a.id},key());
  s=await mentor.client.call('verifySubmission',{expectedVersion:s.version,reason:'已核验起止签到及装调成果'},{submissionId:s.id},key());assert.equal(s.factVerified,true);
 });
 await t.test('self/creator recusal, role isolation; approval atomically awards once and reconciles',async()=>{
  const ap=(await review.client.call('listApprovals')).items.find(p=>p.id===s.approvalId)!;
  const decision={decision:'APPROVE' as const,reason:'独立验收通过',expectedVersion:ap.version};
  await assert.rejects(ops.client.call('decideApproval',decision,{approvalId:ap.id},key()),rejects('RECUSAL_REQUIRED'));
  const alias=await fixture('self-review',['REVIEWER'],'staff',student.id);await assert.rejects(alias.client.call('decideApproval',decision,{approvalId:ap.id},key()),rejects('RECUSAL_REQUIRED'));
  const outsider=await fixture('outsider',['REVIEWER'],'staff',undefined,'OUTSIDE');await assert.rejects(outsider.client.call('decideApproval',decision,{approvalId:ap.id},key()),rejects('NOT_FOUND'));
  const once=key();const result=await Promise.all(Array.from({length:20},()=>review.client.call('decideApproval',decision,{approvalId:ap.id},once)));assert.ok(result.every(r=>r.status==='APPROVED'));
  await assert.rejects(review.client.call('decideApproval',{...decision,reason:'改变请求体'},{approvalId:ap.id},once),rejects('IDEMPOTENCY_CONFLICT'));
  await assert.rejects(review.client.call('decideApproval',decision,{approvalId:ap.id},key()),rejects('VERSION_CONFLICT'));
  const w=await student.client.call('getMyWallet');assert.equal(w.availablePoints,50);assert.equal(w.growthMileage,50);assert.equal((await reconcile(student.id)).matches,true);
  assert.equal((await rows(pool,'SELECT id FROM ledger_entries WHERE user_id=?',[student.id])).length,1);assert.equal((await rows(pool,"SELECT id FROM outbox_events WHERE user_id=? AND event_type='APPROVAL_APPROVED'",[student.id])).length,1);
 });
});
