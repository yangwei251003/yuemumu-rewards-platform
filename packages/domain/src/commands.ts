import {settlePassive} from './passive';
import {randomUUID} from 'node:crypto';
import {pool,rows,transaction,type Executor} from '../../db/src/client';
import {actor,sha,DomainError,type Actor} from './ledger';
export type Context={actorId:string;requestId:string;key:string;authorize?:(cx:Executor,u:Actor)=>Promise<void>};
export function fail(code:string,message:string,status=409):never{throw new DomainError(status,code,message);}
export function requireRole(u:Actor,roles:string[]){if(!u.roles.some(r=>roles.includes(r)))fail('FORBIDDEN','没有此操作权限',403);}
export async function scoped(cx:Executor,u:Actor,type:string,id:string){
 if(!(await rows(cx,'SELECT user_id FROM role_scopes WHERE user_id=? AND scope_type=? AND scope_id IN (?,?)',[u.id,type,id,'*'])).length)fail('SCOPE_FORBIDDEN','不在已分配范围内',403);
}
export async function audit(cx:Executor,ctx:Context,action:string,resource:string){await cx.execute('INSERT INTO audit_events(id,actor_id,action,resource_id,request_id) VALUES (?,?,?,?,?)',[randomUUID(),ctx.actorId,action,resource,ctx.requestId]);}
export async function notify(cx:Executor,userId:string,type:string,resource:string,payload:unknown){await cx.execute('INSERT IGNORE INTO outbox_events(id,user_id,event_type,resource_id,payload) VALUES (?,?,?,?,?)',[randomUUID(),userId,type,resource,JSON.stringify(payload)]);}
export async function command<T>(ctx:Context,operation:string,input:unknown,roles:string[],fn:(cx:Executor,u:Actor)=>Promise<T>):Promise<T>{
 if(!/^[\w:-]{16,128}$/.test(ctx.key))fail('INVALID_KEY','需要16至128位幂等键',422);
 try{return await transaction(async cx=>{
  await rows(cx,'SELECT user_id FROM wallets WHERE user_id=? FOR UPDATE',[ctx.actorId]);
  const u=await actor(cx,ctx.actorId);requireRole(u,roles);
  if(['registerActivity','createOrder','submitLearning','submitEvidence','submitCompetitionAward','submitProjectStage','claimLearningUnit','applyProject','submitMeetingClaim'].includes(operation)){const[m]=await rows<{membership_status:string}>(cx,'SELECT membership_status FROM users WHERE id=?',[u.id]);if(m.membership_status!=='ACTIVE')fail('MEMBERSHIP_REQUIRED','当前身份尚不具备参与资格；仍可查看记录和申诉',403);}
  const restrictionScope=operation==='registerActivity'?'REGISTRATION':operation==='createOrder'?'REDEMPTION':null;
  if(restrictionScope&&(await rows(cx,"SELECT case_id FROM sanctions WHERE user_id=? AND scope IN (?, 'BOTH') AND status='ACTIVE' AND starts_at<=UTC_TIMESTAMP(3) AND ends_at>UTC_TIMESTAMP(3)",[u.id,restrictionScope])).length)fail('FUNCTION_RESTRICTED','此功能有待处理的限期决定，可查看通知并申诉',403);
  if(ctx.authorize)await ctx.authorize(cx,u);
  const hash=sha(JSON.stringify(input));const [cached]=await rows<{request_hash:string;response:T}>(cx,'SELECT request_hash,response FROM command_receipts WHERE actor_id=? AND operation=? AND request_key=?',[u.id,operation,ctx.key]);
  if(cached){if(cached.request_hash!==hash)fail('IDEMPOTENCY_CONFLICT','同一幂等键不能用于不同请求');return cached.response;}
  const result=await fn(cx,u);
  await cx.execute('INSERT INTO command_receipts(actor_id,operation,request_key,request_hash,response) VALUES (?,?,?,?,?)',[u.id,operation,ctx.key,hash,JSON.stringify(result)]);
  return result;
 });}catch(e){if(e instanceof DomainError)await audit(pool,ctx,e.code,operation);throw e;}
}
export async function assertWallet(cx:Executor,userId:string){
 const [w]=await rows<{available_points:number;frozen_points:number;investigation_frozen_points:number;growth_mileage:number;recovery_due:number}>(cx,'SELECT * FROM wallets WHERE user_id=? FOR UPDATE',[userId]);
 if(!w)fail('NOT_FOUND','钱包不存在',404);
 const [s]=await rows<{a:string;r:string;g:string;d:string}>(cx,'SELECT COALESCE(SUM(delta_available),0) a,COALESCE(SUM(delta_reserved),0) r,COALESCE(SUM(delta_growth),0) g,COALESCE(SUM(delta_recovery),0) d FROM ledger_entries WHERE user_id=?',[userId]);
 if(w.available_points!==Number(s.a)||w.frozen_points!==Number(s.r)||w.growth_mileage!==Number(s.g)||w.recovery_due!==Number(s.d))fail('PROJECTION_MISMATCH','账本投影不一致，已停止操作');
 return w;
}
export async function appendLedger(cx:Executor,ctx:Context,p:{userId:string;businessKey:string;kind:string;available:number;reserved?:number;growth?:number;recovery?:number;sourceType:string;sourceId:string;reason:string}){
 const id=randomUUID();
 await cx.execute('INSERT INTO ledger_entries(id,user_id,business_key,kind,delta_available,delta_reserved,delta_growth,delta_recovery,source_type,source_id,rule_version,reason,actor_id,request_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,p.userId,p.businessKey,p.kind,p.available,p.reserved||0,p.growth||0,p.recovery||0,p.sourceType,p.sourceId,'DRAFT_FOR_DEMO:v1',p.reason,ctx.actorId,ctx.requestId]);
 await cx.execute('UPDATE wallets SET available_points=available_points+?,frozen_points=frozen_points+?,growth_mileage=growth_mileage+?,recovery_due=recovery_due+?,version=version+1 WHERE user_id=?',[p.available,p.reserved||0,p.growth||0,p.recovery||0,p.userId]);
 await audit(cx,ctx,p.kind,id);if(p.kind==='EARN'&&(p.growth||0)>0)await settlePassive(cx,ctx,p.userId);return id;
}
