import {validateFiles,linkFiles} from './files';
import {createHmac,randomUUID} from 'node:crypto';
import {pool,rows,type Executor} from '../../db/src/client';
import {config} from '../../db/src/config';
import {actor,sha,type Actor} from './ledger';
import {command,fail,requireRole,scoped,audit,notify,assertWallet,appendLedger,type Context} from './commands';
import type {Schemas} from '../../sdk/src';
import {registerArtifact} from './growth';
import {calendarMonths} from './business-time';
const rules={WORKSHOP_2H:{points:30,hours:2},TRAINING_4H:{points:50,hours:4},CAMP_8H:{points:80,hours:8},CAMP_16H:{points:120,hours:16}};
export type ActivityRow={id:string;organization_id:string;title:string;status:Schemas['Activity']['status'];starts_at:Date;ends_at:Date;capacity:number;rule_code:string;points:number;requirements:string;creator_id:string;version:number};
type RegistrationRow={id:string;activity_id:string;user_id:string;status:Schemas['Registration']['status'];version:number};
type SubmissionRow={id:string;source_type:string;source_id:string;user_id:string;artifact_id:string;evidence_file_ids:string[];description:string;status:Schemas['Submission']['status'];version:number};
type ApprovalRow={id:string;submission_id:string;organization_id:string;status:Schemas['Approval']['status'];points:number;required_approvers:number;fact_actor_id:string|null;rule_version:string;version:number;round:number};
const regBody=(r:RegistrationRow):Schemas['Registration']=>({id:r.id,activityId:r.activity_id,userId:r.user_id,status:r.status,version:r.version});
async function activity(cx:Executor,u:Actor,id:string,lock=false){const[a]=await rows<ActivityRow>(cx,'SELECT * FROM activities WHERE id=?'+(lock?' FOR UPDATE':''),[id]);if(!a||a.organization_id!==u.organization_id)fail('NOT_FOUND','活动不存在',404);return a;}
export async function activityBody(cx:Executor,a:ActivityRow):Promise<Schemas['Activity']>{const[n]=await rows<{n:number}>(cx,"SELECT COUNT(*) n FROM registrations WHERE activity_id=? AND status IN ('REGISTERED','ATTENDED')",[a.id]);return {id:a.id,title:a.title,status:a.status,startsAt:a.starts_at.toISOString(),endsAt:a.ends_at.toISOString(),capacity:a.capacity,registeredCount:n.n,ruleCode:a.rule_code,pointsPreview:a.points,completionRequirements:a.requirements,version:a.version};}
async function submissionBody(cx:Executor,s:SubmissionRow):Promise<Schemas['Submission']>{const[a]=await rows<ApprovalRow>(cx,'SELECT * FROM flow_approvals WHERE submission_id=? ORDER BY round DESC LIMIT 1',[s.id]);return {id:s.id,sourceType:s.source_type,sourceId:s.source_id,status:s.status,version:s.version,applicantId:s.user_id,artifactId:s.artifact_id,description:s.description,evidenceFileIds:s.evidence_file_ids,approvalId:a?.id||null,factVerified:!!a?.fact_actor_id};}
async function evidenceHash(cx:Executor,description:string,ids:string[]){const hashes:string[]=[];for(const id of ids)hashes.push((await rows<{sha256:string}>(cx,'SELECT sha256 FROM private_files WHERE id=?',[id]))[0].sha256);return sha(JSON.stringify({description:description.trim(),hashes:[...new Set(hashes)].sort()}));}
async function saveEvidenceRevision(cx:Executor,s:SubmissionRow,a:ApprovalRow){await cx.execute('INSERT IGNORE INTO activity_evidence_revisions(submission_id,round,approval_id,description,evidence_file_ids,evidence_hash) VALUES (?,?,?,?,?,?)',[s.id,a.round,a.id,s.description,JSON.stringify(s.evidence_file_ids),await evidenceHash(cx,s.description,s.evidence_file_ids)]);}
async function approvalBody(cx:Executor,a:ApprovalRow):Promise<Schemas['Approval']>{const[s]=await rows<SubmissionRow>(cx,'SELECT * FROM submissions WHERE id=?',[a.submission_id]);const[n]=await rows<{n:number}>(cx,"SELECT COUNT(*) n FROM flow_decisions WHERE approval_id=? AND decision='APPROVE'",[a.id]);return {id:a.id,sourceType:s.source_type,sourceId:s.source_id,applicantId:s.user_id,status:a.status,proposedPoints:a.points,requiredDistinctApprovers:a.required_approvers,completedApprovers:n.n,ruleVersion:a.rule_version,version:a.version,factVerified:!!a.fact_actor_id};}
function version(actual:number,expected:number){if(actual!==expected)fail('VERSION_CONFLICT','内容已更新，请刷新');}
export async function activityRead(name:string,userId:string,params:Record<string,string>,query:Record<string,unknown>,audience:string):Promise<unknown>{
 const u=await actor(pool,userId);const limit=Number(query.limit||20),cursor=String(query.cursor||'');
 if(name==='getApprovalDetail'){
  requireRole(u,['REVIEWER','OPS_MANAGER']);await scoped(pool,u,'REVIEW',u.organization_id);
  const [a]=await rows<ApprovalRow>(pool,'SELECT * FROM flow_approvals WHERE id=? AND organization_id=?',[params.approvalId,u.organization_id]);
  if(!a)fail('NOT_FOUND','审批不存在',404);
  const [s]=await rows<SubmissionRow>(pool,'SELECT * FROM submissions WHERE id=?',[a.submission_id]);
  const activityRecord=await activity(pool,u,s.source_id);
  const [applicant]=await rows<{display_name:string;person_id:string}>(pool,'SELECT display_name,person_id FROM users WHERE id=? AND organization_id=?',[s.user_id,u.organization_id]);
  const [creator]=await rows<{person_id:string}>(pool,'SELECT person_id FROM users WHERE id=? AND organization_id=?',[activityRecord.creator_id,u.organization_id]);
  const [revision]=await rows<{description:string;evidence_file_ids:string[];created_at:Date}>(pool,'SELECT description,evidence_file_ids,created_at FROM activity_evidence_revisions WHERE submission_id=? AND round=? AND approval_id=?',[s.id,a.round,a.id]);
  const decisions=await rows<{actor_id:string;display_name:string;person_id:string;decision:Schemas['DecisionRequest']['decision'];reason:string;created_at:Date}>(pool,'SELECT d.*,u.display_name FROM flow_decisions d JOIN users u ON u.id=d.actor_id WHERE d.approval_id=? ORDER BY d.created_at,d.actor_id',[a.id]);
  const [fact]=a.fact_actor_id?await rows<{id:string;display_name:string}>(pool,'SELECT id,display_name FROM users WHERE id=? AND organization_id=?',[a.fact_actor_id,u.organization_id]):[];
  const closed=!['PENDING','PARTIAL_APPROVAL'].includes(a.status);
  const reason=closed?'本轮审核已结束':applicant.person_id===u.person_id?'本人不能审核自己的收益':creator.person_id===u.person_id?'活动发起人须回避':decisions.some(d=>d.person_id===u.person_id)?'你已以同一自然人身份处理本轮审核':null;
  const decisionOptions=(['APPROVE','REJECT','REQUEST_CHANGES'] as const).map(decision=>{const why=reason||(decision==='APPROVE'&&!a.fact_actor_id?'等待现场事实签认':null)||(!revision?'本轮证据快照缺失，请核实原记录':null);return {decision,enabled:!why,reason:why};});
  const result:Schemas['ApprovalDetail']={approval:await approvalBody(pool,a),submissionId:s.id,artifactId:s.artifact_id,applicantName:applicant.display_name,activityTitle:activityRecord.title,completionRequirements:activityRecord.requirements,round:a.round,evidenceRevision:revision?{submissionId:s.id,round:a.round,approvalId:a.id,description:revision.description,evidenceFileIds:revision.evidence_file_ids,createdAt:revision.created_at.toISOString()}:null,factVerifier:fact?{id:fact.id,name:fact.display_name}:null,decisions:decisions.map(d=>({actorId:d.actor_id,actorName:d.display_name,decision:d.decision,reason:d.reason,createdAt:d.created_at.toISOString()})),decisionOptions};
  return result;
 }
 if(name==='listActivityEvidenceRevisions'){
  const[s]=await rows<SubmissionRow>(pool,'SELECT * FROM submissions WHERE id=?',[params.submissionId]);if(!s)fail('NOT_FOUND','成果不存在',404);await activity(pool,u,s.source_id);
  if(audience==='student'){if(s.user_id!==u.id)fail('NOT_FOUND','成果不存在',404);}else{requireRole(u,['MENTOR','REVIEWER','OPS_MANAGER','STUDENT_ORGANIZER']);if(u.roles.some(r=>['REVIEWER','OPS_MANAGER'].includes(r)))await scoped(pool,u,'REVIEW',u.organization_id);else await scoped(pool,u,'ACTIVITY',s.source_id);}
  const offset=cursor?Number(cursor):0;if(!Number.isSafeInteger(offset)||offset<0)fail('INVALID_CURSOR','历史游标无效',422);
  const list=await rows<{submission_id:string;round:number;approval_id:string;description:string;evidence_file_ids:string[];created_at:Date}>(pool,`SELECT * FROM activity_evidence_revisions WHERE submission_id=? AND round>? ORDER BY round LIMIT ${limit+1}`,[s.id,offset]);return {items:list.slice(0,limit).map(r=>({submissionId:r.submission_id,round:r.round,approvalId:r.approval_id,description:r.description,evidenceFileIds:r.evidence_file_ids,createdAt:r.created_at.toISOString()})),nextCursor:list.length>limit?String(list[limit-1].round):null};
 }
 if(name==='listActivities'){const list=await rows<ActivityRow>(pool,`SELECT * FROM activities WHERE organization_id=? AND id>? ${audience==='student'?"AND status NOT IN ('DRAFT','PENDING_REVIEW')":''} ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor]);return {items:await Promise.all(list.slice(0,limit).map(a=>activityBody(pool,a))),nextCursor:list.length>limit?list[limit-1].id:null};}
 if(name==='getActivity'){const a=await activity(pool,u,params.activityId);if(audience==='student'&&['DRAFT','PENDING_REVIEW'].includes(a.status))fail('NOT_FOUND','活动不存在',404);return activityBody(pool,a);}
 if(name==='listMyRegistrations'){const list=await rows<RegistrationRow>(pool,`SELECT * FROM registrations WHERE user_id=? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.id,cursor]);return {items:list.slice(0,limit).map(regBody),nextCursor:list.length>limit?list[limit-1].id:null};}
 if(name==='listSubmissions'){
  if(audience==='staff'){requireRole(u,['MENTOR','REVIEWER','OPS_MANAGER','STUDENT_ORGANIZER']);await scoped(pool,u,'ACTIVITY','*');}
  const list=await rows<SubmissionRow>(pool,`SELECT s.* FROM submissions s JOIN users u ON u.id=s.user_id WHERE u.organization_id=? AND s.id>? ${audience==='student'?'AND s.user_id=?':''} ORDER BY s.id LIMIT ${limit+1}`,[u.organization_id,cursor,...(audience==='student'?[u.id]:[])]);
  return {items:await Promise.all(list.slice(0,limit).map(s=>submissionBody(pool,s))),nextCursor:list.length>limit?list[limit-1].id:null};
 }
 if(name==='listApprovals'){requireRole(u,['REVIEWER','OPS_MANAGER']);await scoped(pool,u,'REVIEW',u.organization_id);const list=await rows<ApprovalRow>(pool,`SELECT * FROM flow_approvals WHERE organization_id=? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor]);return {items:await Promise.all(list.slice(0,limit).map(a=>approvalBody(pool,a))),nextCursor:list.length>limit?list[limit-1].id:null};}
 return undefined;
}
export async function activityWrite(name:string,inputContext:Context,params:Record<string,string>,body:unknown):Promise<unknown>{
 const ctx:Context={...inputContext,authorize:async(cx,u)=>{
  if(name==='createActivity')await scoped(cx,u,'ACTIVITY','*');
  if(['publishActivity','completeActivity','issueAttendanceCode'].includes(name)){const a=await activity(cx,u,params.activityId);await scoped(cx,u,'ACTIVITY',a.id);}
  if(name==='verifySubmission'){const[s]=await rows<SubmissionRow>(cx,'SELECT * FROM submissions WHERE id=?',[params.submissionId]);if(!s)fail('NOT_FOUND','成果不存在',404);const a=await activity(cx,u,s.source_id);await scoped(cx,u,'ACTIVITY',a.id);}
  if(name==='decideApproval'){const[a]=await rows<ApprovalRow>(cx,'SELECT * FROM flow_approvals WHERE id=?',[params.approvalId]);if(!a||a.organization_id!==u.organization_id)fail('NOT_FOUND','审批不存在',404);await scoped(cx,u,'REVIEW',a.organization_id);}
 }};
 if(name==='createActivity')return command(ctx,name,body,['OPS_MANAGER'],async(cx,u)=>{
  await scoped(cx,u,'ACTIVITY','*');const b=body as Schemas['ActivityCreateRequest'];const rule=rules[b.ruleCode];const start=new Date(b.startsAt),end=new Date(b.endsAt);
  if(end.getTime()-start.getTime()<rule.hours*3600000)fail('INVALID_DURATION','活动时长小于所选规则要求',422);
  const id=randomUUID();await cx.execute('INSERT INTO activities(id,organization_id,title,status,starts_at,ends_at,capacity,rule_code,points,requirements,creator_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[id,u.organization_id,b.title,'DRAFT',start,end,b.capacity,b.ruleCode,rule.points,b.completionRequirements,u.id]);await audit(cx,ctx,'ACTIVITY_DRAFT',id);return activityBody(cx,await activity(cx,u,id));
 });
 if(['publishActivity','completeActivity'].includes(name))return command(ctx,name,{params,body},['OPS_MANAGER'],async(cx,u)=>{
  const a=await activity(cx,u,params.activityId,true);await scoped(cx,u,'ACTIVITY',a.id);version(a.version,(body as Schemas['VersionRequest']).expectedVersion);
  if(name==='publishActivity'?a.status!=='DRAFT':!['PUBLISHED','IN_PROGRESS'].includes(a.status))fail('INVALID_STATE','活动状态不允许此操作');
  await cx.execute('UPDATE activities SET status=?,version=version+1 WHERE id=?',[name==='publishActivity'?'PUBLISHED':'COMPLETED',a.id]);await audit(cx,ctx,name,a.id);return activityBody(cx,await activity(cx,u,a.id));
 });
 if(name==='issueAttendanceCode'){
  const token=createHmac('sha256',config().dbPassword).update(name+ctx.actorId+ctx.key+params.activityId).digest('hex');
  const result=await command(ctx,name,{params,body},['MENTOR','OPS_MANAGER','STUDENT_ORGANIZER'],async(cx,u)=>{const a=await activity(cx,u,params.activityId,true);await scoped(cx,u,'ACTIVITY',a.id);if(!['PUBLISHED','IN_PROGRESS','COMPLETED'].includes(a.status))fail('INVALID_STATE','活动尚未发布');const b=body as Schemas['AttendanceCodeRequest'];const expires=new Date(Date.now()+15*60000);await cx.execute('INSERT INTO attendance_codes(token_hash,activity_id,phase,expires_at,issuer_id) VALUES (?,?,?,?,?)',[sha(token),a.id,b.phase,expires,u.id]);await audit(cx,ctx,'ISSUE_ATTENDANCE_CODE',a.id);return {activityId:a.id,phase:b.phase,expiresAt:expires.toISOString()};});return {...result,token};
 }
 if(name==='registerActivity')return command(ctx,name,{params,body},['STUDENT'],async(cx,u)=>{
  const a=await activity(cx,u,params.activityId,true);if(a.status!=='PUBLISHED')fail('REGISTRATION_CLOSED','活动已关闭报名');
  const b=body as Schemas['RegisterRequest'];version(a.version,b.activityVersion);if(b.acceptedRuleVersion!=='DRAFT_FOR_DEMO:v1')fail('RULE_VERSION_CONFLICT','请阅读当前演示规则');
  const[old]=await rows<RegistrationRow>(cx,'SELECT * FROM registrations WHERE activity_id=? AND user_id=?',[a.id,u.id]);if(old){if(old.status==='CANCELLED')fail('REGISTRATION_CANCELLED','已取消报名，请联系运营处理');return regBody(old);}
  const current=await activityBody(cx,a);const id=randomUUID(),status=current.registeredCount>=a.capacity?'WAITLISTED':'REGISTERED';
  await cx.execute('INSERT INTO registrations(id,activity_id,user_id,status) VALUES (?,?,?,?)',[id,a.id,u.id,status]);await audit(cx,ctx,'REGISTER_ACTIVITY',id);return regBody((await rows<RegistrationRow>(cx,'SELECT * FROM registrations WHERE id=?',[id]))[0]);
 });
 if(name==='cancelRegistration')return command(ctx,name,{params,body},['STUDENT'],async(cx,u)=>{
  const[r]=await rows<RegistrationRow>(cx,'SELECT * FROM registrations WHERE id=? AND user_id=?',[params.registrationId,u.id]);if(!r)fail('NOT_FOUND','报名不存在',404);await activity(cx,u,r.activity_id,true);const[current]=await rows<RegistrationRow>(cx,'SELECT * FROM registrations WHERE id=? FOR UPDATE',[r.id]);
  version(current.version,(body as Schemas['CancelRequest']).expectedVersion);if(!['REGISTERED','WAITLISTED'].includes(current.status))fail('INVALID_STATE','报名不能取消');
  await cx.execute("UPDATE registrations SET status='CANCELLED',version=version+1 WHERE id=?",[r.id]);
  if(current.status==='REGISTERED'){const[next]=await rows<RegistrationRow>(cx,"SELECT * FROM registrations WHERE activity_id=? AND status='WAITLISTED' ORDER BY created_at,id LIMIT 1 FOR UPDATE",[r.activity_id]);if(next){await cx.execute("UPDATE registrations SET status='REGISTERED',version=version+1 WHERE id=?",[next.id]);await notify(cx,next.user_id,'WAITLIST_PROMOTED',next.id,{message:'候补已转为正式报名'});}}
  await audit(cx,ctx,'CANCEL_REGISTRATION',r.id);return regBody({...current,status:'CANCELLED',version:current.version+1});
 });
 if(name==='recordAttendance')return command(ctx,name,body,['STUDENT'],async(cx,u)=>{
  const b=body as Schemas['AttendanceRequest'];const a=await activity(cx,u,b.activityId,true);const[r]=await rows<RegistrationRow>(cx,"SELECT * FROM registrations WHERE activity_id=? AND user_id=? AND status IN ('REGISTERED','ATTENDED')",[a.id,u.id]);if(!r)fail('REGISTRATION_REQUIRED','需要正式报名');
  const[code]=await rows(cx,'SELECT token_hash FROM attendance_codes WHERE token_hash=? AND activity_id=? AND phase=? AND expires_at>UTC_TIMESTAMP(3)',[sha(b.token),a.id,b.phase]);if(!code)fail('CODE_EXPIRED','签到码无效或已过期');
  if(b.phase==='END'&&!(await rows(cx,"SELECT phase FROM attendance_records WHERE activity_id=? AND user_id=? AND phase='START'",[a.id,u.id])).length)fail('START_REQUIRED','请先完成开始签到');
  await cx.execute('INSERT IGNORE INTO attendance_records(activity_id,user_id,phase) VALUES (?,?,?)',[a.id,u.id,b.phase]);const[record]=await rows<{recorded_at:Date}>(cx,'SELECT recorded_at FROM attendance_records WHERE activity_id=? AND user_id=? AND phase=?',[a.id,u.id,b.phase]);
  await audit(cx,ctx,'ATTENDANCE_'+b.phase,r.id);return {activityId:a.id,phase:b.phase,recordedAt:record.recorded_at.toISOString(),completionStatus:b.phase==='END'?'PENDING_VERIFICATION':'PARTIAL',requestId:ctx.requestId};
 });
 if(name==='submitEvidence')return command(ctx,name,body,['STUDENT'],async(cx,u)=>{
  const b=body as Schemas['SubmissionRequest'];if(b.sourceType!=='ACTIVITY')fail('CAPABILITY_NOT_IMPLEMENTED','此来源等待后续模块开放',503);
  const a=await activity(cx,u,b.sourceId,true);if(a.rule_code==='MEETING')fail('MEETING_CLAIM_REQUIRED','会议请提交合并角色成果，不能通过普通活动重复申领');if(!['PUBLISHED','IN_PROGRESS','COMPLETED'].includes(a.status))fail('INVALID_STATE','活动未开放成果提交');
  if(!(await rows(cx,"SELECT id FROM registrations WHERE activity_id=? AND user_id=? AND status IN ('REGISTERED','ATTENDED')",[a.id,u.id])).length)fail('REGISTRATION_REQUIRED','需要正式报名');
  if((await rows(cx,'SELECT id FROM submissions WHERE user_id=? AND (artifact_id=? OR (source_type=? AND source_id=?))',[u.id,b.artifactId,b.sourceType,b.sourceId])).length)fail('DUPLICATE_ARTIFACT','成果或活动已提交，不能重复申领');
  await validateFiles(cx,u,b.evidenceFileIds);
  await registerArtifact(cx,u,b.artifactId,'ACTIVITY','ACTIVITY:'+a.id);
  const id=randomUUID(),approvalId=randomUUID();await cx.execute('INSERT INTO submissions(id,source_type,source_id,user_id,artifact_id,evidence_file_ids,description,status) VALUES (?,?,?,?,?,?,?,?)',[id,b.sourceType,b.sourceId,u.id,b.artifactId,JSON.stringify(b.evidenceFileIds),b.description,'SUBMITTED']);
  await cx.execute('INSERT INTO flow_approvals(id,submission_id,organization_id,status,points,required_approvers,rule_version) VALUES (?,?,?,?,?,?,?)',[approvalId,id,u.organization_id,'PENDING',a.points,1,'DRAFT_FOR_DEMO:v1']);
  await saveEvidenceRevision(cx,(await rows<SubmissionRow>(cx,'SELECT * FROM submissions WHERE id=?',[id]))[0],(await rows<ApprovalRow>(cx,'SELECT * FROM flow_approvals WHERE id=?',[approvalId]))[0]);
  await linkFiles(cx,b.evidenceFileIds,'ACTIVITY',id);await audit(cx,ctx,'SUBMIT_EVIDENCE',id);return submissionBody(cx,(await rows<SubmissionRow>(cx,'SELECT * FROM submissions WHERE id=?',[id]))[0]);
 });
 if(name==='resubmitActivityEvidence')return command(ctx,name,{params,body},['STUDENT'],async(cx,u)=>{
  const[s]=await rows<SubmissionRow>(cx,'SELECT * FROM submissions WHERE id=? AND user_id=? FOR UPDATE',[params.submissionId,u.id]);if(!s)fail('NOT_FOUND','成果不存在',404);const a=await activity(cx,u,s.source_id);const b=body as Schemas['ActivityEvidenceResubmitRequest'];version(s.version,b.expectedVersion);
  if(s.source_type!=='ACTIVITY'||a.rule_code==='MEETING'||s.status!=='NEEDS_CHANGES')fail('INVALID_STATE','只有被要求补证的普通活动成果可以重提');
  if((await rows(cx,'SELECT id FROM ledger_entries WHERE business_key=?',['ACTIVITY:'+s.source_id+':'+s.user_id])).length)fail('ALREADY_CREDITED','已经入账的成果不能以补证再次申领');
  const[prior]=await rows<ApprovalRow>(cx,'SELECT * FROM flow_approvals WHERE submission_id=? ORDER BY round DESC LIMIT 1 FOR UPDATE',[s.id]);if(!prior||prior.status!=='CANCELLED')fail('INVALID_STATE','原审核尚未发出补证要求');await validateFiles(cx,u,b.evidenceFileIds);await saveEvidenceRevision(cx,s,prior);
  const hash=await evidenceHash(cx,b.description,b.evidenceFileIds);if((await rows(cx,'SELECT round FROM activity_evidence_revisions WHERE submission_id=? AND evidence_hash=?',[s.id,hash])).length)fail('EVIDENCE_UNCHANGED','补证内容与历史版本相同');
  const approvalId=randomUUID();await cx.execute('INSERT INTO flow_approvals(id,submission_id,organization_id,status,points,required_approvers,rule_version,round) VALUES (?,?,?,?,?,?,?,?)',[approvalId,s.id,u.organization_id,'PENDING',a.points,prior.required_approvers,prior.rule_version,prior.round+1]);
  await cx.execute("UPDATE submissions SET description=?,evidence_file_ids=?,status='SUBMITTED',version=version+1 WHERE id=?",[b.description,JSON.stringify(b.evidenceFileIds),s.id]);
  const updated=(await rows<SubmissionRow>(cx,'SELECT * FROM submissions WHERE id=?',[s.id]))[0];await saveEvidenceRevision(cx,updated,(await rows<ApprovalRow>(cx,'SELECT * FROM flow_approvals WHERE id=?',[approvalId]))[0]);await linkFiles(cx,b.evidenceFileIds,'ACTIVITY',s.id);await audit(cx,ctx,'ACTIVITY_EVIDENCE_RESUBMITTED',s.id);return submissionBody(cx,updated);
 });
 if(name==='verifySubmission')return command(ctx,name,{params,body},['MENTOR','OPS_MANAGER','STUDENT_ORGANIZER'],async(cx,u)=>{
  const[s]=await rows<SubmissionRow>(cx,'SELECT * FROM submissions WHERE id=? FOR UPDATE',[params.submissionId]);if(!s)fail('NOT_FOUND','成果不存在',404);const a=await activity(cx,u,s.source_id);await scoped(cx,u,'ACTIVITY',a.id);const beneficiary=await actor(cx,s.user_id);if(beneficiary.person_id===u.person_id)fail('RECUSAL_REQUIRED','本人不能签认本人事实',403);
  version(s.version,(body as Schemas['FactRequest']).expectedVersion);if(s.status!=='SUBMITTED')fail('INVALID_STATE','成果已结束审核');if(a.status!=='COMPLETED')fail('ACTIVITY_NOT_COMPLETED','先由运营确认活动结束');
  const records=await rows(cx,'SELECT phase FROM attendance_records WHERE activity_id=? AND user_id=?',[a.id,s.user_id]);if(records.length!==2)fail('ATTENDANCE_INCOMPLETE','需要起止签到及成果验收');
  const[current]=await rows<ApprovalRow>(cx,'SELECT * FROM flow_approvals WHERE submission_id=? ORDER BY round DESC LIMIT 1',[s.id]);if(!current||!['PENDING','PARTIAL_APPROVAL'].includes(current.status))fail('INVALID_STATE','当前审核轮次不可签认');await cx.execute('UPDATE flow_approvals SET fact_actor_id=?,version=version+1 WHERE id=? AND fact_actor_id IS NULL',[u.id,current.id]);await cx.execute('UPDATE submissions SET version=version+1 WHERE id=?',[s.id]);await cx.execute("UPDATE registrations SET status='ATTENDED',version=version+1 WHERE activity_id=? AND user_id=?",[a.id,s.user_id]);await audit(cx,ctx,'INDEPENDENT_FACT_VERIFIED',s.id);return submissionBody(cx,(await rows<SubmissionRow>(cx,'SELECT * FROM submissions WHERE id=?',[s.id]))[0]);
 });
 if(name==='decideApproval')return command(ctx,name,{params,body},['REVIEWER','OPS_MANAGER'],async(cx,u)=>{
  const[a]=await rows<ApprovalRow>(cx,'SELECT * FROM flow_approvals WHERE id=? FOR UPDATE',[params.approvalId]);if(!a||a.organization_id!==u.organization_id)fail('NOT_FOUND','审批不存在',404);await scoped(cx,u,'REVIEW',a.organization_id);const[s]=await rows<SubmissionRow>(cx,'SELECT * FROM submissions WHERE id=? FOR UPDATE',[a.submission_id]);const beneficiary=await actor(cx,s.user_id);
  if(beneficiary.person_id===u.person_id)fail('RECUSAL_REQUIRED','本人不能审批本人收益',403);
  const activityRecord=await activity(cx,u,s.source_id);const creator=await actor(cx,activityRecord.creator_id);if(creator.person_id===u.person_id)fail('RECUSAL_REQUIRED','活动发起人不能审批自己的活动',403);
  const b=body as Schemas['DecisionRequest'];version(a.version,b.expectedVersion);if(!['PENDING','PARTIAL_APPROVAL'].includes(a.status))fail('INVALID_STATE','审批已结束');if(!a.fact_actor_id&&b.decision==='APPROVE')fail('FACT_VERIFICATION_REQUIRED','需要独立现场事实签认');
  if((await rows(cx,'SELECT person_id FROM flow_decisions WHERE approval_id=? AND person_id=?',[a.id,u.person_id])).length)fail('DUPLICATE_PERSON','同一自然人不能重复审批');
  await cx.execute('INSERT INTO flow_decisions(approval_id,person_id,actor_id,decision,reason) VALUES (?,?,?,?,?)',[a.id,u.person_id,u.id,b.decision,b.reason]);
  const[n]=await rows<{n:number}>(cx,"SELECT COUNT(*) n FROM flow_decisions WHERE approval_id=? AND decision='APPROVE'",[a.id]);const approved=b.decision==='APPROVE'&&n.n>=a.required_approvers;const status=approved?'APPROVED':b.decision==='APPROVE'?'PARTIAL_APPROVAL':b.decision==='REJECT'?'REJECTED':'CANCELLED';
  if(approved){await assertWallet(cx,s.user_id);const id=await appendLedger(cx,ctx,{userId:s.user_id,businessKey:'ACTIVITY:'+s.source_id+':'+s.user_id,kind:'EARN',available:a.points,growth:a.points,sourceType:'ACTIVITY',sourceId:s.source_id,reason:activityRecord.title+'：独立验收通过'});await cx.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at) VALUES (?,?,?,?)',[id,s.user_id,a.points,calendarMonths(new Date(),18)]);}
  await cx.execute('UPDATE flow_approvals SET status=?,version=version+1 WHERE id=?',[status,a.id]);if(status!=='PARTIAL_APPROVAL')await cx.execute('UPDATE submissions SET status=?,version=version+1 WHERE id=?',[approved?'APPROVED':b.decision==='REJECT'?'REJECTED':'NEEDS_CHANGES',s.id]);await audit(cx,ctx,'APPROVAL_'+b.decision,a.id);await notify(cx,s.user_id,'APPROVAL_'+status,a.id,{message:b.reason});return approvalBody(cx,(await rows<ApprovalRow>(cx,'SELECT * FROM flow_approvals WHERE id=?',[a.id]))[0]);
 });
 return undefined;
}
