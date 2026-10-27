import test,{after} from 'node:test';import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import {fixture,migration,key,c,prefix} from '../integration/fixtures';
import {pool,rows} from '../../packages/db/src/client';
import {ApiError,type Schemas} from '../../packages/sdk/src';
after(async()=>{await migration.end();await pool.end();});
const rejects=(code:string)=>(e:unknown)=>e instanceof ApiError&&e.problem.code===code;
test('ART real private binary storage, attachment permissions and hostile uploads',async t=>{
 const owner=await fixture('owner',['STUDENT'],'student'),other=await fixture('other',['STUDENT'],'student'),reviewer=await fixture('reviewer',['REVIEWER']),reporter=await fixture('reporter',['AUDITOR']),admin=await fixture('admin',['SYSTEM_ADMIN']),foreign=await fixture('foreign',['REVIEWER'],'staff',undefined,prefix+'_foreign');
 const body:Schemas['FileUploadRequest']={filename:'模拟成果.txt',mimeType:'text/plain',base64Data:Buffer.from('仅用于演示的虚构成果记录。').toString('base64'),purpose:'EVIDENCE',simulatedOnly:true};let file:Schemas['PrivateFile'];
 await t.test('upload receipt is idempotent, duplicate content has one immutable BLOB, no public path',async()=>{
  const options=key();file=await owner.client.call('uploadFile',body,{},options);assert.deepEqual(await owner.client.call('uploadFile',body,{},options),file);assert.equal((await owner.client.call('uploadFile',{...body,filename:'改名.txt'},{},key())).id,file.id);assert.equal(file.visibility,'PRIVATE');assert.equal((await rows(pool,'SELECT id FROM private_files WHERE owner_id=?',[owner.id])).length,1);assert.equal((await owner.client.call('readFileContent',undefined,{fileId:file.id})).base64Data,body.base64Data);assert.equal((await owner.client.call('listMyFiles')).items.length,1);assert.equal((await fetch(`http://127.0.0.1:${c.gatewayPort}/uploads/${file.id}`)).status,404);
  await assert.rejects(pool.execute('UPDATE private_files SET filename=? WHERE id=?',['modified.txt',file.id]),(e:unknown)=>(e as {code:string}).code==='ER_TABLEACCESS_DENIED_ERROR');
 });
 await t.test('unlinked private file is invisible to other students, reviewers, admin and other organizations',async()=>{
  for(const user of [other,reviewer,admin,foreign]){await assert.rejects(user.client.call('getFile',undefined,{fileId:file.id}),rejects('NOT_FOUND'));await assert.rejects(user.client.call('readFileContent',undefined,{fileId:file.id}),rejects('NOT_FOUND'));}
 });
 let activity:Schemas['Activity'];
 await t.test('attachment is accessible only after owner submits to a scoped review; revoked scope is rechecked',async()=>{
  const ops=await fixture('ops',['OPS_MANAGER']);activity=await ops.client.call('createActivity',{title:'带私有证据的活动',startsAt:new Date().toISOString(),endsAt:new Date(Date.now()+4*3600000).toISOString(),capacity:5,ruleCode:'TRAINING_4H',completionRequirements:'提交模拟文字或图片成果'},{},key());activity=await ops.client.call('publishActivity',{expectedVersion:activity.version},{activityId:activity.id},key());
  for(const u of [owner,other])await u.client.call('registerActivity',{activityVersion:activity.version,acceptedRuleVersion:'DRAFT_FOR_DEMO:v1'},{activityId:activity.id},key());
  const submission={sourceType:'ACTIVITY' as const,sourceId:activity.id,artifactId:prefix+'_artifact',description:'本次活动虚构成果与独立验收记录',evidenceFileIds:[file.id]};
  await assert.rejects(other.client.call('submitEvidence',submission,{},key()),rejects('FILE_NOT_OWNED'));assert.equal((await rows(pool,'SELECT id FROM submissions WHERE user_id=?',[other.id])).length,0);
  await owner.client.call('submitEvidence',submission,{},key());assert.equal((await reviewer.client.call('readFileContent',undefined,{fileId:file.id})).base64Data,body.base64Data);
  await migration.execute("DELETE FROM role_scopes WHERE user_id=? AND scope_type='REVIEW'",[reviewer.id]);await assert.rejects(reviewer.client.call('readFileContent',undefined,{fileId:file.id}),rejects('NOT_FOUND'));await migration.execute("INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,'REVIEW',?)",[reviewer.id,prefix]);
  for(const u of [other,admin,foreign])await assert.rejects(u.client.call('readFileContent',undefined,{fileId:file.id}),rejects('NOT_FOUND'));
 });
 await t.test('case subject can inspect reporter evidence for defense; unrelated students cannot',async()=>{
  const evidence=await reporter.client.call('uploadFile',{...body,filename:'事项说明.txt'},{},key());await reporter.client.call('createCase',{subjectId:owner.id,caseType:'OTHER',resourceId:prefix+'_case',severity:1,description:'模拟事项，向当事人展示所依据的完整证据',evidenceFileIds:[evidence.id],occurredAt:new Date(Date.now()-1000).toISOString()},{},key());assert.equal((await owner.client.call('getFile',undefined,{fileId:evidence.id})).id,evidence.id);await assert.rejects(other.client.call('getFile',undefined,{fileId:evidence.id}),rejects('NOT_FOUND'));
 });
 await t.test('T26 actual session deadline expires private content access without changing or publishing the file',async()=>{
  const expiring=await fixture('expiring_file',['STUDENT'],'student');
  const f=await expiring.client.call('uploadFile',{...body,filename:'限期读取.txt'},{},key());
  await migration.execute('UPDATE sessions SET expires_at=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 2 SECOND) WHERE user_id=?',[expiring.id]);
  assert.equal((await expiring.client.call('readFileContent',undefined,{fileId:f.id})).base64Data,body.base64Data);
  await delay(2200);
  await assert.rejects(expiring.client.call('readFileContent',undefined,{fileId:f.id}),rejects('SESSION_EXPIRED'));
  assert.equal((await rows(pool,'SELECT id FROM private_files WHERE id=?',[f.id])).length,1);
  assert.equal((await fetch(`http://127.0.0.1:${c.gatewayPort}/uploads/${f.id}`)).status,404);
 });
 await t.test('512KiB accepted; oversized, traversal, HTML and MIME spoof are rejected without inserting data',async()=>{
  const max={...body,filename:'边界.txt',base64Data:Buffer.alloc(512*1024,65).toString('base64')};assert.equal((await owner.client.call('uploadFile',max,{},key())).byteSize,512*1024);
  const cases:[Partial<Schemas['FileUploadRequest']>,string][]=[[{filename:'../证据.txt'},'INVALID_FILENAME'],[{filename:'证据.txt.exe'},'UNSAFE_TEXT'],[{base64Data:Buffer.from('<script>alert(1)</script>').toString('base64')},'UNSAFE_TEXT'],[{mimeType:'image/png',filename:'fake.png'},'MIME_MISMATCH'],[{mimeType:'image/jpeg',filename:'fake.jpg',base64Data:Buffer.from('ffd8ff00000000000000ffd9','hex').toString('base64')},'INVALID_IMAGE'],[{base64Data:'AA=A'},'INVALID_BASE64'],[{base64Data:'AB=='},'INVALID_BASE64'],[{base64Data:Buffer.alloc(512*1024+1,65).toString('base64')},'FILE_SIZE']];
  const before=(await rows(pool,'SELECT id FROM private_files WHERE owner_id=?',[owner.id])).length;for(const [change,code]of cases)await assert.rejects(owner.client.call('uploadFile',{...body,...change},{},key()),rejects(code));assert.equal((await rows(pool,'SELECT id FROM private_files WHERE owner_id=?',[owner.id])).length,before);
  const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8d8AAAAASUVORK5CYII=';assert.equal((await owner.client.call('uploadFile',{...body,filename:'像素.png',mimeType:'image/png',base64Data:png},{},key())).mimeType,'image/png');
 });
});
