import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool,rows,transaction} from '../../packages/db/src/client';
import {migration,prefix} from './fixtures';

after(async()=>{await migration.end();await pool.end();});

// Both first attempts cross each barrier once. Retried callbacks must skip them.
// A failed participant therefore cannot leave its peer waiting indefinitely.
function firstAttemptBarrier(){
 let arrivals=0,release!:()=>void,reject!:(reason:Error)=>void,timer:ReturnType<typeof setTimeout>|undefined;
 const ready=new Promise<void>((resolve,fail)=>{release=resolve;reject=fail;});
 return {
  async arrive(){
   arrivals++;assert.ok(arrivals<=2,'a retry must not enter the first-attempt barrier');
   if(arrivals===2){clearTimeout(timer);release();}
   else timer=setTimeout(()=>reject(new Error('two real transactions did not reach the barrier within five seconds')),5000);
   await ready;
  },
  close(){clearTimeout(timer);}
 };
}

test('real InnoDB deadlock retries the production transaction and rolls back every failed-attempt write',{timeout:20000},async t=>{
 const wallets=[prefix+'_deadlock_a',prefix+'_deadlock_b'];
 for(const id of wallets){
  await migration.execute('INSERT INTO users(id,person_id,organization_id,display_name,roles,membership_status,demo_only) VALUES (?,?,?,?,?,?,FALSE)',[id,id,prefix,'虚构死锁测试身份',JSON.stringify(['STUDENT']),'ACTIVE']);
  await migration.execute('INSERT INTO wallets(user_id) VALUES (?)',[id]);
 }
 const engines=await rows<{name:string;engine:string}>(pool,"SELECT TABLE_NAME name,ENGINE engine FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('wallets','audit_events')");
 assert.equal(engines.length,2);assert.ok(engines.every(table=>table.engine==='InnoDB'));
 const[server]=await rows<{enabled:number}>(pool,'SELECT @@GLOBAL.innodb_deadlock_detect enabled');
 assert.equal(Number(server.enabled),1,'this test needs real InnoDB deadlock detection, not a lock timeout');

 const locksHeld=firstAttemptBarrier(),firstWritesDone=firstAttemptBarrier();
 type Attempt={business:number;number:number;beforeId:string;afterId:string;errorCode:string|null};
 const attempts:Attempt[]=[],counts=[0,0],errors:{code:string;errno:number;sqlState:string}[]=[];
 const requestIds=[randomUUID(),randomUUID()];
 const business=(index:number)=>transaction(async cx=>{
  const attempt:Attempt={business:index,number:++counts[index],beforeId:randomUUID(),afterId:randomUUID(),errorCode:null};attempts.push(attempt);
  try{
   const first=await rows(cx,'SELECT user_id FROM wallets WHERE user_id=? FOR UPDATE',[wallets[index]]);assert.equal(first.length,1);
   if(attempt.number===1)await locksHeld.arrive();
   await cx.execute('INSERT INTO audit_events(id,actor_id,action,resource_id,request_id) VALUES (?,?,?,?,?)',[attempt.beforeId,wallets[index],'DEADLOCK_BEFORE',wallets[index],requestIds[index]]);
   if(attempt.number===1)await firstWritesDone.arrive();
   // A owns wallet A and waits for B; B owns wallet B and waits for A.
   // InnoDB must choose a victim. No mocked or manually thrown retry error is used.
   const second=await rows(cx,'SELECT user_id FROM wallets WHERE user_id=? FOR UPDATE',[wallets[1-index]]);assert.equal(second.length,1);
   await cx.execute('INSERT INTO audit_events(id,actor_id,action,resource_id,request_id) VALUES (?,?,?,?,?)',[attempt.afterId,wallets[index],'DEADLOCK_AFTER',wallets[index],requestIds[index]]);
   return attempt;
  }catch(error){
   const driver=error as {code?:string;errno?:number;sqlState?:string};attempt.errorCode=driver.code||'NON_MYSQL_ERROR';
   errors.push({code:driver.code||'NON_MYSQL_ERROR',errno:driver.errno||0,sqlState:driver.sqlState||''});throw error;
  }
 });
 try{
  // Await both outcomes even if one fails, so teardown never races a live peer.
  const outcomes=await Promise.allSettled([business(0),business(1)]);
  assert.deepEqual(outcomes.map(result=>result.status),['fulfilled','fulfilled']);
  assert.deepEqual(errors,[{code:'ER_LOCK_DEADLOCK',errno:1213,sqlState:'40001'}]);
  assert.deepEqual([...counts].sort((a,b)=>a-b),[1,2]);assert.ok(counts.every(n=>n<=3),'production transaction retries are bounded');
  const failed=attempts.filter(attempt=>attempt.errorCode!==null);assert.equal(failed.length,1);assert.equal(failed[0].number,1);
  const committed=await rows<{id:string;resource_id:string;action:string;request_id:string}>(pool,"SELECT id,resource_id,action,request_id FROM audit_events WHERE resource_id IN (?,?) AND action IN ('DEADLOCK_BEFORE','DEADLOCK_AFTER')",wallets);
  assert.equal(committed.length,4,'each logical business must commit exactly its two writes');
  for(const attempt of failed){assert.ok(!committed.some(row=>row.id===attempt.beforeId||row.id===attempt.afterId),'victim rollback must leave no partial record');}
  for(const outcome of outcomes){
   assert.equal(outcome.status,'fulfilled');if(outcome.status!=='fulfilled')throw new Error('a real transaction did not finish');
   const successful=outcome.value,records=committed.filter(row=>row.resource_id===wallets[successful.business]);
   assert.deepEqual(records.map(row=>row.id).sort(),[successful.beforeId,successful.afterId].sort());
   assert.deepEqual(records.map(row=>row.action).sort(),['DEADLOCK_AFTER','DEADLOCK_BEFORE']);
   assert.ok(records.every(row=>row.request_id===requestIds[successful.business]));
  }
  const balances=await rows<{available_points:number;frozen_points:number;growth_mileage:number;recovery_due:number}>(pool,'SELECT available_points,frozen_points,growth_mileage,recovery_due FROM wallets WHERE user_id IN (?,?)',wallets);
  assert.deepEqual(balances,[{available_points:0,frozen_points:0,growth_mileage:0,recovery_due:0},{available_points:0,frozen_points:0,growth_mileage:0,recovery_due:0}]);
  t.diagnostic(JSON.stringify({actualMysqlErrors:errors,attemptsByBusiness:counts,committedWrites:committed.length,rolledBackAttempts:failed.length}));
 }finally{locksHeld.close();firstWritesDone.close();}
});
