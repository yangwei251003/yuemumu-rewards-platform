import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient,StaleClientRequest,type Transport} from '../../packages/sdk/src';
type Response=Awaited<ReturnType<Transport>>;
function deferred(){let resolve!:(r:Response)=>void;const promise=new Promise<Response>(r=>{resolve=r;});return {promise,resolve};}
test('late unauthorized response cannot clear the newer bearer session',async()=>{
 const delayed=deferred();let calls=0;const headers:Record<string,string>[]=[];
 const client=createClient(async(_m,_p,_b,h)=>{headers.push(h);calls++;if(calls===1)return delayed.promise;if(calls===2)return {status:200,body:{csrfToken:'new-csrf',accessToken:'new-bearer'}};return {status:200,body:{}};},'student');
 const old=client.call('getMyWallet');const rejected=assert.rejects(old,StaleClientRequest);client.clear();await client.call('createDemoSession',{demoUserId:'DEMO_S001',audience:'student',accessCode:'simulation',transport:'bearer'});delayed.resolve({status:401,body:{code:'UNAUTHORIZED',message:'expired'}});await rejected;await client.call('getMe');assert.equal(headers.at(-1)?.Authorization,'Bearer new-bearer');assert.equal(headers.at(-1)?.['X-CSRF-Token'],'new-csrf');
});
test('clear invalidates delayed login credentials and stale session restoration',async()=>{
 for(const operation of ['createDemoSession','getSession'] as const){const delayed=deferred();let calls=0;let last:Record<string,string>={};const client=createClient(async(_m,_p,_b,h)=>{last=h;return ++calls===1?delayed.promise:{status:200,body:{}};},'student');const request=operation==='getSession'?client.call(operation):client.call(operation,{demoUserId:'DEMO_S001',audience:'student',accessCode:'simulation',transport:'bearer'});const rejected=assert.rejects(request,StaleClientRequest);client.clear();delayed.resolve({status:200,body:{csrfToken:'old',accessToken:'old'}});await rejected;await client.call('getMe');assert.equal(last.Authorization,undefined);assert.equal(last['X-CSRF-Token'],undefined);}
});
