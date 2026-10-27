import type {components,operations as OperationTypes} from './generated';
import {operations} from './operations';
export type Schemas=components['schemas'];
export type Audience='student'|'staff';
export type Transport=(method:string,path:string,body:unknown,headers:Record<string,string>)=>Promise<{status:number;body:unknown}>;
export class ApiError extends Error {constructor(public status:number,public problem:Schemas['Problem']){super(problem.message);}}
export class StaleClientRequest extends Error {constructor(){super('Request belongs to an earlier session');}}
export function webTransport(base='/api/v1',fetcher:typeof fetch=fetch):Transport{return async(method,path,body,headers)=>{
 const response=await fetcher(base+path,{method,credentials:'include',headers,body:body===undefined?undefined:JSON.stringify(body)});
 return {status:response.status,body:await response.json()};
};}
export interface TaroRequestOptions {url:string;method:'GET'|'POST';data?:unknown;header:Record<string,string>;credentials:'include';}
export type TaroRequester=(options:TaroRequestOptions)=>Promise<{statusCode:number;data:unknown}>;
export function taroTransport(request:TaroRequester,base='/api/v1'):Transport{return async(method,path,body,headers)=>{
 const result=await request({url:base+path,method:method as 'GET'|'POST',data:body,header:headers,credentials:'include'});
 return {status:result.statusCode,body:result.data};
};}
type Input<K extends keyof OperationTypes>=OperationTypes[K] extends {requestBody:{content:{'application/json':infer B}}}?B:undefined;
type Output<K extends keyof OperationTypes>=OperationTypes[K] extends {responses:{200:{content:{'application/json':infer B}}}}?B:never;
export function createClient(transport:Transport,audience:Audience){
 let csrf='';let token='';let generation=0;
 const clear=()=>{generation++;csrf='';token='';};
 async function call<K extends keyof OperationTypes>(operation:K,body?:Input<K>,params:Record<string,string|number>={ },options:{idempotencyKey?:string}={}):Promise<Output<K>>{
  if(['createDemoSession','createStaffSession','logout'].includes(operation))generation++;
  const requestGeneration=generation;
  const op=operations[operation];let path:string=op.path;const query:string[]=[];
  for(const [k,v]of Object.entries(params)){if(path.includes('{'+k+'}'))path=path.replace('{'+k+'}',encodeURIComponent(v));else query.push(encodeURIComponent(k)+'='+encodeURIComponent(v));}
  if(query.length)path+='?'+query.join('&');
  const headers:Record<string,string>={'Content-Type':'application/json','X-Session-Audience':audience};
  if(options.idempotencyKey)headers['Idempotency-Key']=options.idempotencyKey;
  if(csrf)headers['X-CSRF-Token']=csrf;if(token)headers.Authorization='Bearer '+token;
  const r=await transport(op.method,path,body,headers);
  if(requestGeneration!==generation)throw new StaleClientRequest();
  if(r.status>=400){if(r.status===401)clear();throw new ApiError(r.status,r.body as Schemas['Problem']);}
  if(['createDemoSession','createStaffSession','getSession'].includes(operation)){const s=r.body as Schemas['Session'];csrf=s.csrfToken;if(s.accessToken)token=s.accessToken;}
  if(operation==='logout'){csrf='';token='';}
  return r.body as Output<K>;
 }
 return {call,clear};
}
