import {randomUUID} from 'node:crypto';
import {pool,rows,type Executor} from '../../db/src/client';
import {actor,sha,postSourceInTransaction,type Actor,type LedgerRow} from './ledger';
import {command,requireRole,scoped,fail,audit,notify,type Context} from './commands';
import {validateFiles,linkFiles} from './files';
import type {Schemas} from '../../sdk/src';
type AdjustmentRow={id:string;organization_id:string;beneficiary_id:string;creator_id:string;kind:'EARN'|'REVERSE';original_reference:string;source_id:string;original_entry_id:string|null;points:number;reason:string;evidence_file_ids:string[];request_hash:string;status:Schemas['PointAdjustment']['status'];version:number;entry_id:string|null;created_at:Date};
async function access(cx:Executor,u:Actor,read=false){
 requireRole(u,read?['MENTOR','REVIEWER','OPS_MANAGER','AUDITOR']:['MENTOR','REVIEWER','OPS_MANAGER']);
 if(u.roles.some(r=>['MENTOR','REVIEWER','OPS_MANAGER'].includes(r))&&(await rows(cx,"SELECT user_id FROM role_scopes WHERE user_id=? AND scope_type='REVIEW' AND scope_id IN (?,'*')",[u.id,u.organization_id])).length)return;
 if(read&&u.roles.includes('AUDITOR')){await scoped(cx,u,'AUDIT',u.organization_id);return;}fail('SCOPE_FORBIDDEN','不在已分配人工调整范围内',403);
}
async function adjustmentBody(cx:Executor,a:AdjustmentRow):Promise<Schemas['PointAdjustment']>{const[n]=await rows<{n:number}>(cx,"SELECT COUNT(*) n FROM point_adjustment_decisions WHERE adjustment_id=? AND decision='APPROVE'",[a.id]);return {id:a.id,beneficiaryId:a.beneficiary_id,creatorId:a.creator_id,kind:a.kind,originalReference:a.original_reference,originalEntryId:a.original_entry_id,points:a.points,reason:a.reason,evidenceFileIds:a.evidence_file_ids,status:a.status,version:a.version,entryId:a.entry_id,requiredDistinctApprovers:2,completedApprovers:n.n,createdAt:a.created_at.toISOString()};}
export async function adjustmentsRead(name:string,userId:string,params:Record<string,string>,query:Record<string,unknown>,audience:string):Promise<unknown>{
 if(!['listPointAdjustments','getWalletReconciliation'].includes(name))return undefined;
 const cx=await pool.getConnection();try{
  await cx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await cx.beginTransaction();const u=await actor(cx,userId);if(audience==='staff')await access(cx,u,true);let result:unknown;
  if(name==='listPointAdjustments'){const limit=Number(query.limit||20),cursor=String(query.cursor||'');const list=await rows<AdjustmentRow>(cx,`SELECT * FROM point_adjustment_requests WHERE organization_id=? AND id>? ${audience==='student'?'AND beneficiary_id=?':''} ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor,...(audience==='student'?[u.id]:[])]);result={items:await Promise.all(list.slice(0,limit).map(a=>adjustmentBody(cx,a))),nextCursor:list.length>limit?list[limit-1].id:null};}
  else{
   const id=params.userId;if(audience==='student'&&id!==u.id)fail('NOT_FOUND','只能查看本人对账',404);const[target]=await rows<{organization_id:string}>(cx,'SELECT organization_id FROM users WHERE id=?',[id]);if(!target||target.organization_id!==u.organization_id)fail('NOT_FOUND','对账对象不存在',404);
   const[w]=await rows<{available_points:number;frozen_points:number;growth_mileage:number;recovery_due:number}>(cx,'SELECT * FROM wallets WHERE user_id=?',[id]);if(!w)fail('NOT_FOUND','钱包不存在',404);
   const[l]=await rows<{a:string;f:string;g:string;r:string}>(cx,'SELECT COALESCE(SUM(delta_available),0) a,COALESCE(SUM(delta_reserved),0) f,COALESCE(SUM(delta_growth),0) g,COALESCE(SUM(delta_recovery),0) r FROM ledger_entries WHERE user_id=?',[id]);const[p]=await rows<{a:string;f:string}>(cx,'SELECT COALESCE(SUM(available),0) a,COALESCE(SUM(reserved),0) f FROM point_lots WHERE user_id=?',[id]);
   const ledger={availablePoints:Number(l.a),frozenPoints:Number(l.f),growthMileage:Number(l.g),recoveryDue:Number(l.r)},projection={availablePoints:w.available_points,frozenPoints:w.frozen_points,growthMileage:w.growth_mileage,recoveryDue:w.recovery_due},lots={availablePoints:Number(p.a),frozenPoints:Number(p.f)};
   result={userId:id,matches:JSON.stringify(ledger)===JSON.stringify(projection)&&ledger.availablePoints===lots.availablePoints&&ledger.frozenPoints===lots.frozenPoints,ledger,projection,lots,checkedAt:new Date().toISOString()} satisfies Schemas['WalletReconciliation'];
  }
  await cx.commit();return result;
 }catch(e){await cx.rollback();throw e;}finally{cx.release();}
}
export async function adjustmentsWrite(name:string,inputContext:Context,params:Record<string,string>,body:unknown,audience:string):Promise<unknown>{
 if(!['createPointAdjustment','decidePointAdjustment'].includes(name))return undefined;
 const ctx:Context={...inputContext,authorize:async(cx,u)=>{if(name==='decidePointAdjustment'||audience==='staff')await access(cx,u);}};
 if(name==='createPointAdjustment')return command(ctx,name,body,['STUDENT','MENTOR','REVIEWER','OPS_MANAGER'],async(cx,u)=>{
  const b=body as Schemas['PointAdjustmentCreateRequest'];if(audience==='student'&&b.beneficiaryId!==u.id)fail('FORBIDDEN','学生只能申请本人调整',403);
  const beneficiary=await actor(cx,b.beneficiaryId);if(beneficiary.organization_id!==u.organization_id||!beneficiary.roles.includes('STUDENT'))fail('NOT_FOUND','受益学生不存在',404);
  if(!b.evidenceFileIds.length)fail('EVIDENCE_REQUIRED','人工补分和冲正必须附原始凭证',422);await validateFiles(cx,u,b.evidenceFileIds);
  await rows(cx,'SELECT user_id FROM wallets WHERE user_id=? FOR UPDATE',[beneficiary.id]);
  let points:number,growth:number,original:LedgerRow|undefined,reference:string;
  if(b.kind==='EARN'){
   if(!b.originalReference||!/^SIM_REF_[A-Z0-9_:-]{1,80}$/.test(b.originalReference)||b.originalEntryId!==null||b.points===null||!Number.isSafeInteger(b.points)||b.points<=0||b.points>6000)fail('INVALID_ADJUSTMENT','补分需唯一模拟原始业务参考、1至6000整数分，不可填写原入账ID',422);
   reference=b.originalReference;points=b.points;growth=points;
  }else{
   if(b.kind!=='REVERSE'||!b.originalEntryId||b.points!==null||b.originalReference!==null)fail('INVALID_ADJUSTMENT','冲正只接受原始入账ID，分数由服务器确定',422);
   [original]=await rows<LedgerRow>(cx,"SELECT * FROM ledger_entries WHERE id=? AND user_id=? AND kind='EARN'",[b.originalEntryId,beneficiary.id]);if(!original)fail('NOT_FOUND','原始入账不存在',404);
   if((await rows(cx,'SELECT entry_id FROM entitlement_lots WHERE entry_id=?',[original.id])).length)fail('ENTITLEMENT_CORRECTION_REQUIRED','项目、竞赛和学习权益须通过原成果的更正或撤销流程');
   reference='REVERSE_ENTRY:'+original.id;points=original.delta_available;growth=original.delta_growth;if(points<=0)fail('INVALID_REVERSAL','原入账没有可冲正权益',422);
  }
  const hashes:string[]=[];for(const id of b.evidenceFileIds)hashes.push((await rows<{sha256:string}>(cx,'SELECT sha256 FROM private_files WHERE id=?',[id]))[0].sha256);const uniqueHashes=[...new Set(hashes)].sort();
  const hash=sha(JSON.stringify({kind:b.kind,beneficiaryId:beneficiary.id,reference,points,reason:b.reason.trim(),hashes:uniqueHashes}));
  const[existing]=await rows<AdjustmentRow>(cx,'SELECT * FROM point_adjustment_requests WHERE organization_id=? AND beneficiary_id=? AND original_reference=?',[u.organization_id,beneficiary.id,reference]);if(existing){if(existing.request_hash!==hash)fail('ORIGINAL_REFERENCE_CONFLICT','原始业务参考已有不同申请，不可换键重复补分');return adjustmentBody(cx,existing);}
  if(original&&(await rows(cx,'SELECT id FROM ledger_entries WHERE reverse_entry_id=?',[original.id])).length)fail('ALREADY_REVERSED','原始入账已冲正');
  if(b.kind==='EARN')for(const h of uniqueHashes)if((await rows(cx,'SELECT adjustment_id FROM point_adjustment_evidence_keys WHERE organization_id=? AND beneficiary_id=? AND file_sha256=?',[u.organization_id,beneficiary.id,h])).length)fail('EVIDENCE_ALREADY_CLAIMED','相同原始凭证已有补分申请，不能更换业务参考重复申领');
  const id=randomUUID(),sourceId='MANUAL:'+id;
  await cx.execute('INSERT INTO earning_sources(id,beneficiary_id,organization_id,applicant_person_id,interested_person_ids,kind,points,growth,reverse_entry_id,reason,rule_version) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[sourceId,beneficiary.id,u.organization_id,u.person_id,JSON.stringify([beneficiary.person_id]),b.kind,points,growth,original?.id||null,b.reason,'DRAFT_FOR_DEMO:v1']);
  await cx.execute('INSERT INTO point_adjustment_requests(id,organization_id,beneficiary_id,creator_id,kind,original_reference,source_id,original_entry_id,points,reason,evidence_file_ids,request_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',[id,u.organization_id,beneficiary.id,u.id,b.kind,reference,sourceId,original?.id||null,points,b.reason,JSON.stringify(b.evidenceFileIds),hash]);
  if(b.kind==='EARN')for(const h of uniqueHashes)await cx.execute('INSERT INTO point_adjustment_evidence_keys(organization_id,beneficiary_id,file_sha256,adjustment_id) VALUES (?,?,?,?)',[u.organization_id,beneficiary.id,h,id]);
  await linkFiles(cx,b.evidenceFileIds,'ADJUSTMENT',id);await audit(cx,ctx,'POINT_ADJUSTMENT_REQUESTED',id);await notify(cx,beneficiary.id,'POINT_ADJUSTMENT_REQUESTED',id,{message:'人工调整已提交，原始凭证将由两位独立自然人审核，当前余额未变'});return adjustmentBody(cx,(await rows<AdjustmentRow>(cx,'SELECT * FROM point_adjustment_requests WHERE id=?',[id]))[0]);
 });
 return command(ctx,name,{params,body},['REVIEWER','OPS_MANAGER'],async(cx,u)=>{
  const[a]=await rows<AdjustmentRow>(cx,'SELECT * FROM point_adjustment_requests WHERE id=? AND organization_id=? FOR UPDATE',[params.adjustmentId,u.organization_id]);if(!a)fail('NOT_FOUND','调整申请不存在',404);const b=body as Schemas['PointAdjustmentDecisionRequest'];
  const applicant=await actor(cx,a.creator_id),beneficiary=await actor(cx,a.beneficiary_id);if([applicant.person_id,beneficiary.person_id].includes(u.person_id))fail('RECUSAL_REQUIRED','申请人、受益人及同一自然人别名必须回避',403);
  if(a.version!==b.expectedVersion)fail('VERSION_CONFLICT','调整申请已更新');if(!['PENDING','PARTIAL_APPROVAL'].includes(a.status))fail('INVALID_STATE','调整申请已结束');
  if((await rows(cx,'SELECT actor_id FROM point_adjustment_decisions WHERE adjustment_id=? AND person_id=?',[a.id,u.person_id])).length)fail('DUPLICATE_PERSON','同一自然人不能重复计票');
  await cx.execute('INSERT INTO point_adjustment_decisions(adjustment_id,person_id,actor_id,decision,reason) VALUES (?,?,?,?,?)',[a.id,u.person_id,u.id,b.decision,b.reason]);
  if(b.decision==='APPROVE')await cx.execute('INSERT INTO approval_decisions(source_id,person_id,actor_id,representative) VALUES (?,?,?,TRUE)',[a.source_id,u.person_id,u.id]);
  const[count]=await rows<{n:number}>(cx,"SELECT COUNT(*) n FROM point_adjustment_decisions WHERE adjustment_id=? AND decision='APPROVE'",[a.id]);const status=b.decision==='REJECT'?'REJECTED':count.n>=2?'APPROVED':'PARTIAL_APPROVAL';
  const entry=status==='APPROVED'?await postSourceInTransaction(cx,u.id,a.source_id,'ADJUSTMENT:'+a.id):null;
  await cx.execute('UPDATE point_adjustment_requests SET status=?,version=version+1,entry_id=? WHERE id=?',[status,entry?.id||null,a.id]);await audit(cx,ctx,'POINT_ADJUSTMENT_'+status,a.id);await notify(cx,a.beneficiary_id,'POINT_ADJUSTMENT_'+status,a.id,{message:b.reason});return adjustmentBody(cx,(await rows<AdjustmentRow>(cx,'SELECT * FROM point_adjustment_requests WHERE id=?',[a.id]))[0]);
 });
}
