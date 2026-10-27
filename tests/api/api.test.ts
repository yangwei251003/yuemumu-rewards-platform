import test,{after} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {spawnSync} from 'node:child_process';
import mysql from 'mysql2/promise';import {config} from '../../packages/db/src/config';
import {createClient,webTransport,taroTransport,type Schemas} from '../../packages/sdk/src';
const c=config();const base=`http://127.0.0.1:${c.gatewayPort}/api/v1`;
const migration=mysql.createPool({host:c.dbHost,port:c.dbPort,user:c.migrationUser,password:c.migrationPassword,database:c.database});
after(()=>migration.end());
async function login(user='DEMO_S001',audience:'student'|'staff'='student'){
 const r=await fetch(base+'/auth/demo-sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({demoUserId:user,audience,accessCode:c.demoAccessCode})});assert.equal(r.status,200);return {cookie:r.headers.get('set-cookie')!.split(';')[0],body:await r.json() as Schemas['Session']};
}
test('real API + DB + transport + gateway',async t=>{
 await t.test('health includes frozen contract hash and live database',async()=>{const r=await fetch(base+'/health');assert.equal(r.status,200);const b=await r.json();assert.equal(b.databaseReady,true);assert.equal(b.contractSha256,fs.readFileSync('packages/contracts/sha256.txt','utf8').trim());});
 await t.test('private demo access and runtime body validation fail closed',async()=>{
  const r=await fetch(base+'/auth/demo-sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({demoUserId:'DEMO_S001',audience:'student',accessCode:'wrong-code-123456'})});assert.equal(r.status,401);
  const bad=await fetch(base+'/auth/demo-sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({demoUserId:'DEMO_S001',audience:'student',accessCode:c.demoAccessCode,role:'SYSTEM_ADMIN'})});assert.equal(bad.status,422);
  assert.equal((await fetch(base+'/wallet')).status,401);
  const malformed=await fetch(base+'/auth/demo-sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{broken'});assert.equal(malformed.status,422);assert.equal((await malformed.json()).code,'INVALID_BODY');
  const oversized=await fetch(base+'/auth/demo-sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accessCode:'x'.repeat(1500000)})});assert.equal(oversized.status,422);assert.equal((await oversized.json()).code,'INVALID_BODY');
 });
 const student=await login();const staff=await login('DEMO_T003','staff');const cookie=student.cookie+'; '+staff.cookie;
 await t.test('T34 simultaneous student/staff cookie contexts do not merge',async()=>{
  for(const [audience,id]of [['student','DEMO_S001'],['staff','DEMO_T003']]){const r=await fetch(base+'/me',{headers:{cookie,'X-Session-Audience':audience}});assert.equal(r.status,200);assert.equal((await r.json()).id,id);}
  assert.equal((await fetch(base+'/wallet',{headers:{cookie:staff.cookie}})).status,401);
 });
 await t.test('T22 own wallet/ledger cannot be redirected with userId; pages validate limits',async()=>{
  const headers={cookie:student.cookie};assert.equal((await fetch(base+'/wallet?userId=DEMO_S002',{headers})).status,422);
  assert.equal((await fetch(base+'/ledger?limit=99999',{headers})).status,422);
  assert.equal((await fetch(base+'/ledger?limit=1%20OR%201=1',{headers})).status,422);
  const w=await(await fetch(base+'/wallet',{headers})).json();const [totals]=await migration.query<mysql.RowDataPacket[]>('SELECT SUM(delta_available) a,SUM(delta_growth) g FROM ledger_entries WHERE user_id=?',['DEMO_S001']);assert.equal(w.availablePoints,Number(totals[0].a));assert.equal(w.growthMileage,Number(totals[0].g));
  const second=await login('DEMO_S002');const own=await(await fetch(base+'/wallet',{headers:{cookie:second.cookie}})).json();const[other]=await migration.query<mysql.RowDataPacket[]>('SELECT COALESCE(SUM(delta_available),0) a FROM ledger_entries WHERE user_id=?',['DEMO_S002']);assert.equal(own.availablePoints,Number(other[0].a));
 });
 await t.test('Web SDK uses real cookie API, restores session and paginates 27 rewards',async()=>{
  const wrapped:typeof fetch=(input,init)=>fetch(input,{...init,headers:{...init?.headers,cookie:student.cookie}});
  const client=createClient(webTransport(base,wrapped),'student');await client.call('getSession');assert.equal((await client.call('getMe')).id,'DEMO_S001');
  const first=await client.call('listRewards',undefined,{limit:20});assert.equal(first.items.length,20);assert.ok(first.nextCursor);const next=await client.call('listRewards',undefined,{cursor:first.nextCursor,limit:20});assert.equal(next.items.length,7);assert.equal(next.nextCursor,null);
  assert.equal((await client.call('getReward',undefined,{rewardId:'R001'})).name,first.items[0].name);await assert.rejects(client.call('getReward',undefined,{rewardId:'MISSING'}),(e:unknown)=>(e as {status:number}).status===404);
 });
 await t.test('Taro transport real HTTP smoke including bearer session; no browser globals required',async()=>{
  let calls=0;const client=createClient(taroTransport(async options=>{calls++;const r=await fetch(options.url,{method:options.method,headers:options.header,body:options.data===undefined?undefined:JSON.stringify(options.data)});return {statusCode:r.status,data:await r.json()};},base),'student');
  const session=await client.call('createDemoSession',{demoUserId:'DEMO_S002',audience:'student',accessCode:c.demoAccessCode,transport:'bearer'});assert.ok(session.accessToken);const[other]=await migration.query<mysql.RowDataPacket[]>('SELECT COALESCE(SUM(delta_available),0) a FROM ledger_entries WHERE user_id=?',['DEMO_S002']);assert.equal((await client.call('getMyWallet')).availablePoints,Number(other[0].a));assert.equal(calls,2);await client.call('logout',{audience:'student'});
 });
 await t.test('staff local password login, wrong password and hostile origin',async()=>{
  for(const [password,expected]of [['wrong',401],[c.staffPassword,200]] as const){const r=await fetch(base+'/auth/staff-sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:'DEMO_T003',password})});assert.equal(r.status,expected);}
  const r=await fetch(base+'/auth/staff-sessions',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://untrusted.example'},body:JSON.stringify({login:'DEMO_T003',password:c.staffPassword})});assert.equal(r.status,403);
 });
 await t.test('T24 server role/active changes invalidate old session immediately',async()=>{
  const s=await login('DEMO_S015');await migration.execute('UPDATE users SET active=FALSE WHERE id=?',['DEMO_S015']);try{assert.equal((await fetch(base+'/wallet',{headers:{cookie:s.cookie}})).status,403);}finally{await migration.execute('UPDATE users SET active=TRUE WHERE id=?',['DEMO_S015']);}
 });
 await t.test('logout rejects missing/wrong CSRF, valid logout expires only chosen audience',async()=>{
  const headers={'Content-Type':'application/json','X-Session-Audience':'student',cookie};const body=JSON.stringify({audience:'student'});
  assert.equal((await fetch(base+'/auth/logout',{method:'POST',headers,body})).status,403);
  assert.equal((await fetch(base+'/auth/logout',{method:'POST',headers:{...headers,Authorization:'Basic x'},body})).status,403);
  assert.equal((await fetch(base+'/auth/logout',{method:'POST',headers:{...headers,'X-CSRF-Token':'0'.repeat(64)},body})).status,403);
  assert.equal((await fetch(base+'/auth/logout',{method:'POST',headers:{...headers,'X-CSRF-Token':student.body.csrfToken},body})).status,200);
  assert.equal((await fetch(base+'/wallet',{headers:{cookie}})).status,401);assert.equal((await fetch(base+'/me',{headers:{cookie,'X-Session-Audience':'staff'}})).status,200);
 });
 await t.test('T33 built-client deep routes, assets, unknown API and draft capabilities',async()=>{
  const origin=base.replace('/api/v1','');for(const path of ['/','/pages/index/index','/admin/','/admin/pickup/']){const r=await fetch(origin+path);assert.equal(r.status,200);assert.match(r.headers.get('content-type')||'',/text\/html/);}
  assert.equal((await fetch(origin+'/admin/missing-file.js')).status,404);const missing=await fetch(base+'/missing');assert.equal(missing.status,404);assert.match(missing.headers.get('content-type')||'',/application\/json/);
  const invalidAppeal=await fetch(base+'/appeals',{method:'POST',headers:{cookie,'Content-Type':'application/json','Idempotency-Key':'invalid-appeal-test-123'},body:'{}'});assert.equal(invalidAppeal.status,422);assert.equal((await invalidAppeal.json()).code,'INVALID_BODY');
  assert.equal((await fetch(base+'/orders',{headers:{cookie}})).status,401);
 });
 await t.test('T36 production mode refuses startup even with NODE_ENV production bundle',()=>{
  const result=spawnSync(process.execPath,['dist/apps/api/src/main.js'],{env:{...process.env,APP_MODE:'production'},encoding:'utf8',windowsHide:true,timeout:10000});assert.notEqual(result.status,0);assert.match(result.stderr,/G0 supports isolated demo only/);
 });
});
