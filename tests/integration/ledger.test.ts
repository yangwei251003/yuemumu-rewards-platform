import test,{after} from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import mysql from 'mysql2/promise';
import {config} from '../../packages/db/src/config';import {pool,rows} from '../../packages/db/src/client';
import {approveSource,postSource,reconcile,DomainError} from '../../packages/domain/src/ledger';
const c=config();const migration=mysql.createPool({host:c.dbHost,port:c.dbPort,user:c.migrationUser,password:c.migrationPassword,database:c.database});
const prefix='TEST_'+randomUUID().slice(0,8);const beneficiary=prefix+'_student';
async function user(id:string,person=id,org='ORG_DEMO',roles=['STUDENT']){await migration.execute('INSERT INTO users(id,person_id,organization_id,display_name,roles,membership_status,demo_only) VALUES (?,?,?,?,?,?,?)',[id,person,org,'隔离测试夹具',JSON.stringify(roles),'ACTIVE',false]);await migration.execute('INSERT INTO wallets(user_id) VALUES (?)',[id]);}
async function source(suffix:string,options:{beneficiary?:string;kind?:string;points?:number;growth?:number;reverse?:string;interested?:string[]}={}){
 const id=(options.kind==='SPEND'?'SEED:':'')+prefix+':'+suffix;const person=options.beneficiary||beneficiary;
 await migration.execute('INSERT INTO earning_sources(id,beneficiary_id,organization_id,applicant_person_id,interested_person_ids,kind,points,growth,reverse_entry_id,reason,rule_version) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[id,person,'ORG_DEMO',person,JSON.stringify(options.interested||[]),options.kind||'EARN',options.points||50,options.growth??50,options.reverse||null,'隔离集成测试，非实际奖励','DRAFT_FOR_DEMO:v1']);return id;
}
async function approve(id:string){await approveSource('DEMO_T003',id);await approveSource('DEMO_T004',id);}
after(async()=>{await migration.end();await pool.end();});
test('real MySQL ledger invariants',async t=>{
 await user(beneficiary);
 await t.test('T01 same request key replayed 100 times concurrently posts once',async()=>{
  const s=await source('same-request');await approve(s);const result=await Promise.all(Array.from({length:100},()=>postSource('DEMO_T003',s,'same-'+prefix)));assert.equal(new Set(result.map(v=>v.id)).size,1);
  assert.equal((await reconcile(beneficiary)).rebuilt.availablePoints,50);
 });
 await t.test('T02 same business with 100 different keys still posts once',async()=>{
  const s=await source('same-business');await approve(s);const result=await Promise.all(Array.from({length:100},(_,i)=>postSource('DEMO_T003',s,prefix+'key'+i)));assert.equal(new Set(result.map(v=>v.id)).size,1);assert.equal((await reconcile(beneficiary)).rebuilt.availablePoints,100);
 });
 await t.test('T03 same request key different source rejects 409 without side effects',async()=>{
  const s=await source('body-conflict');await approve(s);await assert.rejects(postSource('DEMO_T003',s,'same-'+prefix),(e:unknown)=>e instanceof DomainError&&e.status===409);assert.equal((await rows(pool,'SELECT id FROM ledger_entries WHERE source_id=?',[s])).length,0);
 });
 await t.test('T14 same natural person using another account cannot satisfy dual approval',async()=>{
  const alias=prefix+'_alias';await user(alias,'DEMO_T003','ORG_DEMO',['REVIEWER','OPS_MANAGER']);const s=await source('dual');await approveSource('DEMO_T003',s);await assert.rejects(approveSource(alias,s),(e:unknown)=>e instanceof DomainError&&e.code==='DUPLICATE_PERSON');await assert.rejects(postSource('DEMO_T003',s,prefix+'dual'),(e:unknown)=>e instanceof DomainError&&e.code==='APPROVAL_REQUIRED');
 });
 await t.test('T15 applicant/beneficiary and directly interested reviewer are recused and audited',async()=>{
  const self=prefix+'_self';await user(self,self,'ORG_DEMO',['REVIEWER']);const s=await source('self',{beneficiary:self});await assert.rejects(approveSource(self,s),(e:unknown)=>e instanceof DomainError&&e.code==='RECUSAL_REQUIRED');
  const related=await source('related',{interested:['DEMO_T003']});await assert.rejects(approveSource('DEMO_T003',related),(e:unknown)=>e instanceof DomainError&&e.code==='RECUSAL_REQUIRED');
  assert.equal((await rows(pool,'SELECT id FROM audit_events WHERE resource_id IN (?,?) AND action=?',[s,related,'RECUSAL_REQUIRED'])).length,2);
 });
 await t.test('resource scope, student and SYSTEM_ADMIN cannot post or approve',async()=>{
  const other=prefix+'_other';await user(other,other,'OTHER_ORG',['REVIEWER']);const s=await source('scope');
  for(const who of [other,'DEMO_S001','DEMO_T007']){await assert.rejects(approveSource(who,s),(e:unknown)=>e instanceof DomainError&&e.status===403);await assert.rejects(postSource(who,s,prefix+'scope'),(e:unknown)=>e instanceof DomainError&&e.status===403);}
 });
 await t.test('T10 injected failure after ledger insert rolls back ledger, lot, wallet, idempotency and audit',async()=>{
  const s=await source('rollback');await approve(s);const before=await reconcile(beneficiary);await assert.rejects(postSource('DEMO_T003',s,prefix+'failure',{failAfterLedger:true}),/INJECTED_TRANSACTION_FAILURE/);
  assert.deepEqual(await reconcile(beneficiary),before);assert.equal((await rows(pool,'SELECT id FROM ledger_entries WHERE source_id=?',[s])).length,0);assert.equal((await rows(pool,'SELECT result_id FROM idempotency WHERE request_key=?',[prefix+'failure'])).length,0);
  await postSource('DEMO_T003',s,prefix+'failure');assert.equal((await reconcile(beneficiary)).rebuilt.availablePoints,before.rebuilt.availablePoints+50);
 });
 await t.test('approved reversal appends once, original immutable, projection rebuild agrees',async()=>{
  const s=await source('reverse-origin');await approve(s);const original=await postSource('DEMO_T003',s,prefix+'original');const reversal=await source('reverse',{kind:'REVERSE',reverse:original.id});await approve(reversal);
  const result=await postSource('DEMO_T003',reversal,prefix+'reverse');assert.equal(result.delta_available,-50);assert.equal((await postSource('DEMO_T003',reversal,prefix+'reverse-again')).id,result.id);
  assert.equal((await rows<{delta_available:number}>(pool,'SELECT delta_available FROM ledger_entries WHERE id=?',[original.id]))[0].delta_available,50);assert.equal((await reconcile(beneficiary)).matches,true);
  const duplicate=await source('second-reversal',{kind:'REVERSE',reverse:original.id});await approve(duplicate);await assert.rejects(postSource('DEMO_T003',duplicate,prefix+'second-reversal'),(e:unknown)=>e instanceof DomainError&&e.code==='ALREADY_REVERSED');
 });
 await t.test('T13 tampered projection is detected without altering immutable ledger',async()=>{
  const s=await source('tamper-guard');await approve(s);const before=await reconcile(beneficiary);await migration.execute('UPDATE wallets SET available_points=available_points+1 WHERE user_id=?',[beneficiary]);
  try{const check=await reconcile(beneficiary);assert.equal(check.matches,false);assert.deepEqual(check.rebuilt,before.rebuilt);await assert.rejects(postSource('DEMO_T003',s,prefix+'tamper'),(e:unknown)=>e instanceof DomainError&&e.code==='PROJECTION_MISMATCH');}finally{await migration.execute('UPDATE wallets SET available_points=available_points-1 WHERE user_id=?',[beneficiary]);}assert.equal((await reconcile(beneficiary)).matches,true);
 });
 await t.test('T12 spent points reversal records recovery due, never negative available or double recovery',async()=>{
  const recipient=prefix+'_recovery';await user(recipient);const earned=await source('recover-earned',{beneficiary:recipient,points:100,growth:100});await approve(earned);const original=await postSource('DEMO_T003',earned,prefix+'recover-earned');
  const spent=await source('recover-spent',{beneficiary:recipient,kind:'SPEND',points:40,growth:0});await approve(spent);await postSource('DEMO_T003',spent,prefix+'recover-spent');
  const reverse=await source('recover-reverse',{beneficiary:recipient,kind:'REVERSE',points:100,growth:100,reverse:original.id});await approve(reverse);await postSource('DEMO_T003',reverse,prefix+'recover-reverse');await postSource('DEMO_T003',reverse,prefix+'recover-replay');
  assert.deepEqual(await reconcile(recipient),{rebuilt:{availablePoints:0,growthMileage:0,recoveryDue:40},matches:true});
  const check=await source('recovery-tamper',{beneficiary:recipient});await approve(check);await migration.execute('UPDATE wallets SET recovery_due=recovery_due+1 WHERE user_id=?',[recipient]);
  try{assert.equal((await reconcile(recipient)).matches,false);await assert.rejects(postSource('DEMO_T003',check,prefix+'recovery-tamper'),(e:unknown)=>e instanceof DomainError&&e.code==='PROJECTION_MISMATCH');}finally{await migration.execute('UPDATE wallets SET recovery_due=recovery_due-1 WHERE user_id=?',[recipient]);}
 });
 await t.test('database application grants prohibit ledger rewriting and audit deletion',async()=>{
  await assert.rejects(pool.execute('UPDATE ledger_entries SET reason=reason WHERE user_id=?',[beneficiary]),(e:unknown)=>(e as {code:string}).code==='ER_TABLEACCESS_DENIED_ERROR');
  await assert.rejects(pool.execute('DELETE FROM audit_events WHERE actor_id=?',[prefix]),(e:unknown)=>(e as {code:string}).code==='ER_TABLEACCESS_DENIED_ERROR');
 });
 await t.test('seed history remains immutable 1240 earned/380 spent; current demo wallet reconciles after legitimate use',async()=>{const seed=await rows<{source_id:string;delta_available:number;delta_growth:number}>(pool,"SELECT source_id,delta_available,delta_growth FROM ledger_entries WHERE user_id='DEMO_S001' AND source_id IN ('SEED:history-earned','SEED:history-spent') ORDER BY source_id");assert.deepEqual(seed,[{source_id:'SEED:history-earned',delta_available:1240,delta_growth:1240},{source_id:'SEED:history-spent',delta_available:-380,delta_growth:0}]);assert.equal((await reconcile('DEMO_S001')).matches,true);});
});
