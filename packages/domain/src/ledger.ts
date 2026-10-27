import {settlePassive} from './passive';
import {createHash,randomUUID} from 'node:crypto';
import {pool,rows,transaction,type Executor} from '../../db/src/client';
import {calendarMonths} from './business-time';
export class DomainError extends Error {constructor(public status:number,public code:string,message:string){super(message);}}
export interface Actor {id:string;person_id:string;organization_id:string;roles:string[];active:number;}
interface Source {id:string;beneficiary_id:string;organization_id:string;applicant_person_id:string;interested_person_ids:string[];kind:'EARN'|'REVERSE'|'SPEND';points:number;growth:number;reverse_entry_id:string|null;reason:string;rule_version:string;}
export interface LedgerRow {id:string;user_id:string;kind:string;delta_available:number;delta_reserved:number;delta_growth:number;delta_recovery:number;source_type:string;source_id:string;rule_version:string;reason:string;created_at:Date;}
export const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
export async function actor(cx:Executor,id:string):Promise<Actor>{
 const [u]=await rows<Actor>(cx,'SELECT id,person_id,organization_id,roles,active FROM users WHERE id=?',[id]);
 if(!u||!u.active)throw new DomainError(403,'FORBIDDEN','身份不可用');return u;
}
export function canReview(u:Actor,org:string){return u.organization_id===org&&u.roles.some(r=>['REVIEWER','OPS_MANAGER'].includes(r));}
/** Caller holds the owner's wallet lock. Transfers preserve root identity and do not
 * count as natural expiry. Per-lot revocation counters prevent a later adjustment
 * from charging consumption that an earlier decision already recorded as debt. */
export async function revokeLotEntitlement(cx:Executor,userId:string,roots:string[],points:number){
 if(!Number.isSafeInteger(points)||points<=0||!roots.length)throw new DomainError(422,'INVALID_REVERSAL','冲正数量和原始批次必须有效');
 const marks=roots.map(()=>'?').join(',');
 const lots=await rows<{entry_id:string;available:number;reserved:number;consumed:number;expired:number;transferred:number;consumed_revoked:number;expired_revoked:number}>(cx,
  `SELECT * FROM point_lots WHERE user_id=? AND (entry_id IN (${marks}) OR root_entry_id IN (${marks})) ORDER BY expires_at DESC,entry_id FOR UPDATE`,[userId,...roots,...roots]);
 if(lots.some(l=>l.reserved))throw new DomainError(409,'RESERVATIONS_EXIST','请先取消该成果及补偿批次的关联预占，再冲正');
 let remaining=points,recovered=0,recovery=0,expiredRevoked=0;
 for(const lot of lots){const amount=Math.min(remaining,lot.available);if(amount){await cx.execute('UPDATE point_lots SET available=available-?,reversed=reversed+? WHERE entry_id=?',[amount,amount,lot.entry_id]);remaining-=amount;recovered+=amount;}}
 // Revoke unspent naturally expired entitlement before charging actual spending.
 for(const lot of lots){const amount=Math.min(remaining,Math.max(0,lot.expired-lot.transferred-lot.expired_revoked));if(amount){await cx.execute('UPDATE point_lots SET expired_revoked=expired_revoked+? WHERE entry_id=?',[amount,lot.entry_id]);remaining-=amount;expiredRevoked+=amount;}}
 for(const lot of lots){const amount=Math.min(remaining,lot.consumed-lot.consumed_revoked);if(amount){await cx.execute('UPDATE point_lots SET consumed_revoked=consumed_revoked+? WHERE entry_id=?',[amount,lot.entry_id]);remaining-=amount;recovery+=amount;}}
 if(remaining)throw new DomainError(409,'PROVENANCE_MISMATCH','原权益与批次溯源不一致，已阻止冲正');
 return {recovered,recovery,expiredRevoked};
}
async function source(cx:Executor,id:string):Promise<Source>{const[s]=await rows<Source>(cx,'SELECT * FROM earning_sources WHERE id=?',[id]);if(!s)throw new DomainError(404,'NOT_FOUND','来源不存在');return s;}
export async function approveSource(actorId:string,sourceId:string){
 try{return await transaction(async cx=>{
  const s=await source(cx,sourceId);const u=await actor(cx,actorId);const beneficiary=await actor(cx,s.beneficiary_id);
  if(!canReview(u,s.organization_id))throw new DomainError(403,'FORBIDDEN','无此组织审核权限');
  if([s.applicant_person_id,beneficiary.person_id,...s.interested_person_ids].includes(u.person_id))throw new DomainError(403,'RECUSAL_REQUIRED','本人及利益相关者必须回避');
  const existing=await rows(cx,'SELECT person_id FROM approval_decisions WHERE source_id=? AND person_id=?',[sourceId,u.person_id]);
  if(existing.length)throw new DomainError(409,'DUPLICATE_PERSON','同一自然人不能重复审批');
  await cx.execute('INSERT INTO approval_decisions(source_id,person_id,actor_id,representative) VALUES (?,?,?,?)',[sourceId,u.person_id,u.id,u.roles.some(r=>['REVIEWER','OPS_MANAGER'].includes(r))]);
 });}catch(e){if(e instanceof DomainError)await pool.execute('INSERT INTO audit_events(id,actor_id,action,resource_id,request_id) VALUES (?,?,?,?,?)',[randomUUID(),actorId,e.code,sourceId,randomUUID()]);throw e;}
}
export async function postSource(actorId:string,sourceId:string,key:string,options:{failAfterLedger?:boolean}={}){
 return transaction(cx=>postSourceInTransaction(cx,actorId,sourceId,key,options));
}
/** Reuse the same guarded posting within an already-open approval transaction. */
export async function postSourceInTransaction(cx:Executor,actorId:string,sourceId:string,key:string,options:{failAfterLedger?:boolean}={}){
 if(!/^[\w:-]{1,128}$/.test(key))throw new DomainError(422,'INVALID_KEY','幂等键格式无效');
  const u=await actor(cx,actorId);const s=await source(cx,sourceId);
  if(!canReview(u,s.organization_id))throw new DomainError(403,'FORBIDDEN','无记账权限');
  const [wallet]=await rows<{available_points:number;growth_mileage:number;recovery_due:number}>(cx,'SELECT * FROM wallets WHERE user_id=? FOR UPDATE',[s.beneficiary_id]);
  if(!wallet)throw new DomainError(404,'NOT_FOUND','钱包不存在');
  const hash=sha(JSON.stringify({sourceId}));
  const [cached]=await rows<{request_hash:string;result_id:string}>(cx,'SELECT request_hash,result_id FROM idempotency WHERE actor_id=? AND operation=? AND request_key=?',[actorId,'POST_SOURCE',key]);
  if(cached){if(cached.request_hash!==hash)throw new DomainError(409,'IDEMPOTENCY_CONFLICT','同一幂等键不能用于不同请求');return(await rows<LedgerRow>(cx,'SELECT * FROM ledger_entries WHERE id=?',[cached.result_id]))[0];}
  let [entry]=await rows<LedgerRow>(cx,'SELECT * FROM ledger_entries WHERE business_key=?',[sourceId]);
  if(!entry){
   const [totals]=await rows<{available:string;growth:string;recovery:string}>(cx,'SELECT COALESCE(SUM(delta_available),0) AS available,COALESCE(SUM(delta_growth),0) AS growth,COALESCE(SUM(delta_recovery),0) AS recovery FROM ledger_entries WHERE user_id=?',[s.beneficiary_id]);
   if(Number(totals.available)!==wallet.available_points||Number(totals.growth)!==wallet.growth_mileage||Number(totals.recovery)!==wallet.recovery_due)throw new DomainError(409,'PROJECTION_MISMATCH','账本投影不一致，已阻止记账');
   const decisions=await rows<{person_id:string;representative:number}>(cx,'SELECT person_id,representative FROM approval_decisions WHERE source_id=?',[sourceId]);
   const beneficiary=await actor(cx,s.beneficiary_id);
   const independent=decisions.filter(d=>![s.applicant_person_id,beneficiary.person_id,...s.interested_person_ids].includes(d.person_id));
   if(new Set(independent.map(d=>d.person_id)).size<2||!independent.some(d=>d.representative))throw new DomainError(409,'APPROVAL_REQUIRED','人工记账和冲正需要两位独立自然人批准');
   let delta=s.points,growth=s.growth,recovery=0;
   if(s.kind==='REVERSE'){
    const [original]=await rows<LedgerRow>(cx,'SELECT * FROM ledger_entries WHERE id=? AND user_id=? AND kind=\'EARN\'',[s.reverse_entry_id,s.beneficiary_id]);
    if(!original||original.delta_available!==s.points||original.delta_growth!==s.growth)throw new DomainError(422,'INVALID_REVERSAL','冲正必须对应原始入账及原始里程');
    if((await rows(cx,'SELECT id FROM ledger_entries WHERE reverse_entry_id=?',[s.reverse_entry_id])).length)throw new DomainError(409,'ALREADY_REVERSED','该入账已冲正');
    if((await rows(cx,'SELECT entry_id FROM entitlement_lots WHERE entry_id=?',[original.id])).length)throw new DomainError(409,'ENTITLEMENT_CORRECTION_REQUIRED','项目和比赛权益须通过原成果更正流程，不能绕过累计权益记录');
    const revoked=await revokeLotEntitlement(cx,s.beneficiary_id,[original.id],s.points);
    delta=-revoked.recovered;growth=-s.growth;recovery=revoked.recovery;
   }else if(s.kind==='SPEND'){
    // Historical demo consumption only; public redemption APIs remain unavailable until G1.
    if(!sourceId.startsWith('SEED:'))throw new DomainError(422,'G0_SCOPE','仅种子历史事件允许此类型');
    if(wallet.available_points<s.points)throw new DomainError(409,'INSUFFICIENT_POINTS','余额不足');
    delta=-s.points;growth=0;let remaining=s.points;
    const lots=await rows<{entry_id:string;available:number}>(cx,'SELECT entry_id,available FROM point_lots WHERE user_id=? AND available>0 ORDER BY expires_at,entry_id FOR UPDATE',[s.beneficiary_id]);
    for(const lot of lots){const take=Math.min(remaining,lot.available);await cx.execute('UPDATE point_lots SET available=available-?,consumed=consumed+? WHERE entry_id=?',[take,take,lot.entry_id]);remaining-=take;if(!remaining)break;}
    if(remaining)throw new DomainError(409,'PROJECTION_MISMATCH','积分批次不足');
   }
   if(wallet.available_points+delta<0||wallet.growth_mileage+growth<0)throw new DomainError(409,'PROJECTION_MISMATCH','账本投影不一致');
   const id=randomUUID();const requestId=randomUUID();
   await cx.execute('INSERT INTO ledger_entries(id,user_id,business_key,kind,delta_available,delta_growth,delta_recovery,source_type,source_id,rule_version,reason,actor_id,request_id,reverse_entry_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,s.beneficiary_id,s.id,s.kind,delta,growth,recovery,'APPROVED_SOURCE',s.id,s.rule_version,s.reason,actorId,requestId,s.kind==='REVERSE'?s.reverse_entry_id:null]);
   if(options.failAfterLedger)throw new Error('INJECTED_TRANSACTION_FAILURE');
   if(s.kind==='EARN')await cx.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at) VALUES (?,?,?,?)',[id,s.beneficiary_id,s.points,calendarMonths(new Date(),18)]);
   await cx.execute('UPDATE wallets SET available_points=available_points+?,growth_mileage=growth_mileage+?,recovery_due=recovery_due+?,version=version+1 WHERE user_id=?',[delta,growth,recovery,s.beneficiary_id]);
   await cx.execute('INSERT INTO audit_events(id,actor_id,action,resource_id,request_id) VALUES (?,?,?,?,?)',[randomUUID(),actorId,s.kind,id,requestId]);
   if(s.kind==='EARN')await settlePassive(cx,{actorId,requestId,key},s.beneficiary_id);
   [entry]=await rows<LedgerRow>(cx,'SELECT * FROM ledger_entries WHERE id=?',[id]);
  }
  await cx.execute('INSERT INTO idempotency(actor_id,operation,request_key,request_hash,result_id) VALUES (?,?,?,?,?)',[actorId,'POST_SOURCE',key,hash,entry.id]);
  return entry;
}
export async function reconcile(userId:string){
 const [v]=await rows<{available:string;growth:string;recovery:string;reserved:string}>(pool,'SELECT COALESCE(SUM(delta_available),0) AS available,COALESCE(SUM(delta_growth),0) AS growth,COALESCE(SUM(delta_recovery),0) AS recovery,COALESCE(SUM(delta_reserved),0) AS reserved FROM ledger_entries WHERE user_id=?',[userId]);
 const [w]=await rows<{available_points:number;growth_mileage:number;recovery_due:number;frozen_points:number}>(pool,'SELECT * FROM wallets WHERE user_id=?',[userId]);
 const rebuilt={availablePoints:Number(v.available),growthMileage:Number(v.growth),recoveryDue:Number(v.recovery)};
 return {rebuilt,matches:!!w&&w.available_points===rebuilt.availablePoints&&w.growth_mileage===rebuilt.growthMileage&&w.recovery_due===rebuilt.recoveryDue&&w.frozen_points===Number(v.reserved)};
}
