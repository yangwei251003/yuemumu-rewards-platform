import {randomUUID} from 'node:crypto';
import {pool,rows,type Executor} from '../../db/src/client';
import {actor,sha,type Actor} from './ledger';
import {command,fail,requireRole,scoped,audit,notify,type Context} from './commands';
import type {Schemas} from '../../sdk/src';

type BusinessRole=Schemas['AccessRequestCreate']['role'];
type ScopeType=Schemas['AccessScope']['scopeType'];
type Staff=Actor&{display_name:string;demo_only:number};
type Scope={scope_type:ScopeType;scope_id:string};
type AccessRow={id:string;organization_id:string;target_id:string;action:Schemas['AccessRequest']['action'];role:BusinessRole;scope_type:ScopeType|null;scope_id:string|null;reason:string;requester_id:string;requester_person_id:string;expected_subject_version:number;snapshot_sha256:string;before_roles:Schemas['AccessStaff']['roles'];before_scopes:Schemas['AccessScope'][];status:Schemas['AccessRequest']['status'];version:number;created_at:Date;applied_at:Date|null};
type Event={id:string;request_id:string;target_id:string;action:string;role:BusinessRole|null;scope_type:ScopeType|null;scope_id:string|null;reason:string;actor_id:string;created_at:Date};
const scopeTypes:ScopeType[]=['ACTIVITY','PROJECT','LEARNING','REVIEW','GROWTH_REVIEW','GOVERNANCE','PICKUP','AUDIT','REPORTING','ACCESS_APPROVAL'];
const roleScopes:Record<BusinessRole,ScopeType[]>={
 STUDENT_ORGANIZER:['ACTIVITY','PROJECT'],
 MENTOR:['ACTIVITY','PROJECT','LEARNING','GROWTH_REVIEW','GOVERNANCE'],
 REVIEWER:['ACTIVITY','PROJECT','LEARNING','REVIEW','GROWTH_REVIEW','GOVERNANCE','PICKUP','ACCESS_APPROVAL'],
 OPS_MANAGER:['ACTIVITY','PROJECT','LEARNING','REVIEW','GROWTH_REVIEW','GOVERNANCE','PICKUP','REPORTING'],
 REWARD_OPERATOR:['PICKUP'],AUDITOR:['AUDIT','PICKUP','GOVERNANCE'],
};
const scopeBody=(s:Scope):Schemas['AccessScope']=>({scopeType:s.scope_type,scopeId:s.scope_id});
const eventBody=(e:Event):Schemas['AccessEvent']=>({id:e.id,requestId:e.request_id,targetId:e.target_id,action:e.action,role:e.role,scopeType:e.scope_type,scopeId:e.scope_id,reason:e.reason,actorId:e.actor_id,effectiveAt:e.created_at.toISOString()});
async function staff(cx:Executor,id:string){const[u]=await rows<Staff>(cx,'SELECT id,person_id,organization_id,display_name,roles,active,demo_only FROM users WHERE id=?',[id]);if(!u)fail('NOT_FOUND','职员不存在',404);return u;}
async function requireLocal(cx:Executor,u:Actor){const s=await staff(cx,u.id);if(!s.demo_only||s.roles.includes('STUDENT'))fail('LOCAL_STAFF_ONLY','此入口只管理数据库标记为模拟的职员',403);return s;}
async function mayRead(cx:Executor,u:Actor){await requireLocal(cx,u);if(u.roles.includes('SYSTEM_ADMIN'))return;requireRole(u,['REVIEWER']);await scoped(cx,u,'ACCESS_APPROVAL',u.organization_id);}
async function mayApprove(cx:Executor,u:Actor){await requireLocal(cx,u);if(u.roles.includes('SYSTEM_ADMIN'))fail('TECHNICAL_ACCOUNT_ONLY','技术管理员不能代替业务人员批准授权',403);requireRole(u,['REVIEWER']);await scoped(cx,u,'ACCESS_APPROVAL',u.organization_id);}
async function target(cx:Executor,u:Actor,id:string){
 const t=await staff(cx,id);if(t.organization_id!==u.organization_id)fail('NOT_FOUND','职员不在本组织',404);if(!t.demo_only||t.roles.includes('STUDENT'))fail('LOCAL_STAFF_ONLY','不能把学生或非模拟身份转为职员',403);if(t.roles.includes('SYSTEM_ADMIN')||(await rows(cx,"SELECT id FROM users WHERE person_id=? AND JSON_CONTAINS(roles,'\"SYSTEM_ADMIN\"')",[t.person_id])).length)fail('TECHNICAL_ACCOUNT_PROTECTED','技术管理员账号不能被授予或变更业务角色',403);if(!t.active)fail('TARGET_INACTIVE','停用账号须另走账号恢复流程',403);
 if(!t.roles.length&&!(await rows(cx,'SELECT user_id FROM access_staff_registry WHERE user_id=? AND organization_id=?',[t.id,t.organization_id])).length)fail('STAFF_ORIGIN_REQUIRED','没有可验证的原有职员记录',403);return t;
}
async function currentScopes(cx:Executor,userId:string){
 // Revocations retain the original projection row under an internal, ungrantable
 // scope type. Every existing permission/list query continues matching only its
 // fixed business type. No DELETE, view, or global query-filter migration is needed.
 const result=await rows<Scope>(cx,"SELECT scope_type,scope_id FROM role_scopes WHERE user_id=? AND scope_type<>'ACCESS_REVOKED' ORDER BY scope_type,scope_id",[userId]);
 if(result.some(s=>!scopeTypes.includes(s.scope_type)))fail('UNKNOWN_SCOPE_TYPE','存在未纳入本地授权方案的范围类型，需先更新明确规则');return result;
}
async function state(cx:Executor,t:Staff){const scopes=await currentScopes(cx,t.id),[v]=await rows<{version:number}>(cx,'SELECT version FROM access_subject_versions WHERE user_id=?',[t.id]);const roles=[...t.roles].sort() as Schemas['AccessStaff']['roles'];const hash=sha(JSON.stringify({organizationId:t.organization_id,personId:t.person_id,active:!!t.active,demoOnly:!!t.demo_only,roles,scopes}));return {scopes,roles,hash,version:v?.version||0};}
async function requestFor(cx:Executor,u:Actor,id:string,lock=false){const[r]=await rows<AccessRow>(cx,'SELECT * FROM access_requests WHERE id=?'+(lock?' FOR UPDATE':''),[id]);if(!r||r.organization_id!==u.organization_id)fail('NOT_FOUND','授权申请不存在',404);return r;}
async function body(cx:Executor,r:AccessRow):Promise<Schemas['AccessRequest']>{const decisions=await rows<{actor_id:string;decision:'APPROVE'|'REJECT';reason:string;created_at:Date}>(cx,'SELECT actor_id,decision,reason,created_at FROM access_decisions WHERE request_id=? ORDER BY created_at,actor_id',[r.id]);return {id:r.id,targetId:r.target_id,action:r.action,role:r.role,scopeType:r.scope_type,scopeId:r.scope_id,requesterId:r.requester_id,reason:r.reason,status:r.status,beforeRoles:r.before_roles,beforeScopes:r.before_scopes,expectedSubjectVersion:r.expected_subject_version,snapshotSha256:r.snapshot_sha256,requiredDistinctApprovers:2,completedApprovers:r.status==='APPROVED'?2:await currentApprovals(cx,r,await staff(cx,r.target_id)),decisionHistory:decisions.map(d=>({actorId:d.actor_id,decision:d.decision,reason:d.reason,createdAt:d.created_at.toISOString()})),version:r.version,createdAt:r.created_at.toISOString(),appliedAt:r.applied_at?.toISOString()||null,validity:'IMMEDIATE_UNTIL_REVOKED'};}
function expected(actual:number,wanted:number){if(actual!==wanted)fail('VERSION_CONFLICT','权限状态已变化，请重新载入后发起');}
async function validateScope(cx:Executor,u:Actor,type:ScopeType,id:string,grant:boolean){
 if(!scopeTypes.includes(type))fail('INVALID_SCOPE','不支持的授权范围',422);
 if(id==='*'){if(grant)fail('WILDCARD_NOT_ALLOWED','本地授权不允许新增通配范围',422);return;}
 if(type==='ACCESS_APPROVAL'&&grant)fail('APPROVAL_SCOPE_PROTECTED','授权审批资格属于本机明确建立的审核信任基线，不能从此入口扩展',403);
 if(['REVIEW','GROWTH_REVIEW','GOVERNANCE','AUDIT','REPORTING','ACCESS_APPROVAL'].includes(type)){if(id!==u.organization_id)fail('SCOPE_OUTSIDE_ORGANIZATION','组织范围必须是当前组织',403);return;}
 let found:unknown[]=[];
 if(type==='ACTIVITY')found=await rows(cx,'SELECT id FROM activities WHERE id=? AND organization_id=?',[id,u.organization_id]);
 else if(type==='PROJECT')found=await rows(cx,'SELECT id FROM projects WHERE id=? AND organization_id=?',[id,u.organization_id]);
 else if(type==='LEARNING')found=await rows(cx,'SELECT id FROM learning_units WHERE id=? AND organization_id=?',[id,u.organization_id]);
 else if(type==='PICKUP')found=await rows(cx,'SELECT site_id FROM inventory WHERE site_id=? AND organization_id=? UNION SELECT site_id FROM commerce_slots WHERE site_id=? AND organization_id=? UNION SELECT site_id FROM commerce_programs WHERE site_id=? AND organization_id=?',[id,u.organization_id,id,u.organization_id,id,u.organization_id]);
 if(!found.length)fail('SCOPE_NOT_FOUND','该活动、项目、课程或领取点不在当前组织',404);
}
async function validateChange(cx:Executor,u:Actor,t:Staff,b:Schemas['AccessRequestCreate'],snapshot:Awaited<ReturnType<typeof state>>){
 if(!Object.prototype.hasOwnProperty.call(roleScopes,b.role))fail('PROTECTED_ROLE','只允许固定业务角色，不能授予学生或技术管理员角色',403);
 if(!['GRANT_ROLE','REVOKE_ROLE','GRANT_SCOPE','REVOKE_SCOPE'].includes(b.action))fail('INVALID_ACTION','不支持的权限操作',422);
 if(b.action==='GRANT_ROLE'||b.action==='REVOKE_ROLE'){
  if(b.scopeType!==null||b.scopeId!==null)fail('SEPARATE_SCOPE_REQUEST','角色和范围须分别明确申请，不能混合扩大权限',422);
  const has=t.roles.includes(b.role);if((b.action==='GRANT_ROLE'&&has)||(b.action==='REVOKE_ROLE'&&!has))fail('NO_ACCESS_CHANGE','此角色状态无需重复变更');
  if(b.action==='GRANT_ROLE'&&snapshot.scopes.some(s=>s.scope_id==='*'))fail('WILDCARD_CLEANUP_REQUIRED','新增角色前须先明确撤销已有通配范围，不能隐式扩大权限');return;
 }
 if(!t.roles.includes(b.role))fail('ROLE_REQUIRED','目标职员尚未持有所选业务角色');if(!b.scopeType||!b.scopeId)fail('SCOPE_REQUIRED','请填写明确范围',422);
 if(b.action==='GRANT_SCOPE'&&!roleScopes[b.role].includes(b.scopeType))fail('ROLE_SCOPE_MISMATCH','此业务角色不适用于所选范围',422);
 await validateScope(cx,u,b.scopeType,b.scopeId,b.action==='GRANT_SCOPE');
 const has=snapshot.scopes.some(s=>s.scope_type===b.scopeType&&s.scope_id===b.scopeId);if((b.action==='GRANT_SCOPE'&&has)||(b.action==='REVOKE_SCOPE'&&!has))fail('NO_ACCESS_CHANGE','此范围状态无需重复变更');
 if(b.action==='GRANT_SCOPE'&&snapshot.scopes.some(s=>s.scope_type===b.scopeType&&s.scope_id==='*'))fail('WILDCARD_CLEANUP_REQUIRED','请先撤销该类型的旧通配范围，再授予具体对象');
}
async function appendEvent(cx:Executor,ctx:Context,r:AccessRow,action:string,scope:Scope|null,role:BusinessRole|null=r.role,id=randomUUID()){
 await cx.execute('INSERT INTO access_events(id,request_id,organization_id,target_id,action,role,scope_type,scope_id,reason,actor_id) VALUES (?,?,?,?,?,?,?,?,?,?)',[id,r.id,r.organization_id,r.target_id,action,role,scope?.scope_type||null,scope?.scope_id||null,r.reason,ctx.actorId]);return id;
}
async function retire(cx:Executor,ctx:Context,r:AccessRow,s:Scope,action='REVOKE_SCOPE'){
 const eventId=await appendEvent(cx,ctx,r,action,s);const[result]=await cx.execute('UPDATE role_scopes SET scope_type=\'ACCESS_REVOKED\',scope_id=? WHERE user_id=? AND scope_type=? AND scope_id=?',[eventId,r.target_id,s.scope_type,s.scope_id]);if((result as {affectedRows:number}).affectedRows!==1)fail('ACCESS_PROJECTION_CHANGED','原范围投影已变化，停止撤销');
}
async function currentApprovals(cx:Executor,r:AccessRow,t:Staff,lock=false){
 const decisions=await rows<{person_id:string;actor_id:string}>(cx,"SELECT person_id,actor_id FROM access_decisions WHERE request_id=? AND decision='APPROVE'",[r.id]);const people=new Set<string>();
 for(const d of decisions){if(lock)await rows(cx,'SELECT user_id FROM wallets WHERE user_id=? FOR UPDATE',[d.actor_id]);const a=await staff(cx,d.actor_id);if(!a.active||!a.demo_only||a.organization_id!==r.organization_id||a.person_id!==d.person_id||a.roles.includes('SYSTEM_ADMIN')||!a.roles.includes('REVIEWER')||[r.requester_person_id,t.person_id].includes(a.person_id))continue;if((await rows(cx,"SELECT user_id FROM role_scopes WHERE user_id=? AND scope_type='ACCESS_APPROVAL' AND scope_id IN (?,'*')",[a.id,r.organization_id])).length)people.add(a.person_id);}
 return people.size;
}

export async function accessRead(name:string,userId:string,query:Record<string,unknown>):Promise<unknown>{
 if(!['listAccessStaff','listAccessRequests','listAccessEvents'].includes(name))return undefined;const u=await actor(pool,userId);await mayRead(pool,u);const limit=Number(query.limit||20),cursor=String(query.cursor||'');
 if(name==='listAccessStaff'){
  const list=await rows<Staff>(pool,`SELECT u.id,u.person_id,u.organization_id,u.display_name,u.roles,u.active,u.demo_only FROM users u WHERE u.organization_id=? AND u.demo_only=TRUE AND NOT JSON_CONTAINS(u.roles,'"STUDENT"') AND (JSON_LENGTH(u.roles)>0 OR EXISTS(SELECT 1 FROM access_staff_registry r WHERE r.user_id=u.id AND r.organization_id=u.organization_id)) AND u.id>? ORDER BY u.id LIMIT ${limit+1}`,[u.organization_id,cursor]);return {items:await Promise.all(list.slice(0,limit).map(async t=>{const s=await state(pool,t);return {id:t.id,displayName:t.display_name,roles:s.roles,scopes:s.scopes.map(scopeBody),active:!!t.active,protectedTechnicalAccount:t.roles.includes('SYSTEM_ADMIN'),demoOnly:true,subjectVersion:s.version} satisfies Schemas['AccessStaff'];})),nextCursor:list.length>limit?list[limit-1].id:null};
 }
 if(name==='listAccessRequests'){const list=await rows<AccessRow>(pool,`SELECT * FROM access_requests WHERE organization_id=? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor]);return {items:await Promise.all(list.slice(0,limit).map(r=>body(pool,r))),nextCursor:list.length>limit?list[limit-1].id:null};}
 const list=await rows<Event>(pool,`SELECT * FROM access_events WHERE organization_id=? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor]);return {items:list.slice(0,limit).map(eventBody),nextCursor:list.length>limit?list[limit-1].id:null};
}
export async function accessWrite(name:string,inputContext:Context,params:Record<string,string>,input:unknown):Promise<unknown>{
 const ctx:Context={...inputContext,authorize:async(cx,u)=>{
  if(name==='createAccessRequest'){await requireLocal(cx,u);const t=await target(cx,u,(input as Schemas['AccessRequestCreate']).targetId);if(t.person_id===u.person_id)fail('SELF_GRANT_FORBIDDEN','不能为自己或同一自然人账号申请业务权限',403);}
  if(name==='decideAccessRequest'){await mayApprove(cx,u);const r=await requestFor(cx,u,params.requestId),t=await target(cx,u,r.target_id);if([r.requester_person_id,t.person_id].includes(u.person_id))fail('RECUSAL_REQUIRED','申请人、目标职员及同一自然人别名不能审批',403);}
 }};
 if(name==='createAccessRequest')return command(ctx,name,input,['SYSTEM_ADMIN'],async(cx,u)=>{
  const b=input as Schemas['AccessRequestCreate'];await target(cx,u,b.targetId);await rows(cx,'SELECT user_id FROM wallets WHERE user_id=? FOR UPDATE',[b.targetId]);const t=await target(cx,u,b.targetId);await cx.execute('INSERT IGNORE INTO access_subject_versions(user_id) VALUES (?)',[t.id]);const snapshot=await state(cx,t);expected(snapshot.version,b.expectedSubjectVersion);await validateChange(cx,u,t,b,snapshot);
  if((await rows(cx,"SELECT id FROM access_requests WHERE target_id=? AND status IN ('PENDING','PARTIAL_APPROVAL')",[t.id])).length)fail('ACCESS_REQUEST_PENDING','该职员已有待审权限申请，请先完成或拒绝旧申请');await cx.execute('INSERT IGNORE INTO access_staff_registry(user_id,organization_id) VALUES (?,?)',[t.id,t.organization_id]);const id=randomUUID();
  await cx.execute('INSERT INTO access_requests(id,organization_id,target_id,action,role,scope_type,scope_id,reason,requester_id,requester_person_id,expected_subject_version,snapshot_sha256,before_roles,before_scopes,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,\'PENDING\')',[id,u.organization_id,t.id,b.action,b.role,b.scopeType,b.scopeId,b.reason,u.id,u.person_id,snapshot.version,snapshot.hash,JSON.stringify(snapshot.roles),JSON.stringify(snapshot.scopes.map(scopeBody))]);await audit(cx,ctx,'ACCESS_REQUESTED',id);return body(cx,await requestFor(cx,u,id));
 });
 if(name==='decideAccessRequest')return command(ctx,name,{params,input},['REVIEWER'],async(cx,u)=>{
  const r=await requestFor(cx,u,params.requestId,true),b=input as Schemas['AccessDecisionCreate'];expected(r.version,b.expectedVersion);if(!['PENDING','PARTIAL_APPROVAL'].includes(r.status))fail('INVALID_STATE','授权申请已经结束');const t=await target(cx,u,r.target_id);
  if((await rows(cx,'SELECT actor_id FROM access_decisions WHERE request_id=? AND person_id=?',[r.id,u.person_id])).length)fail('DUPLICATE_PERSON','一个自然人只能审批一次');
  const requester=await staff(cx,r.requester_id);if(!requester.active||!requester.demo_only||requester.organization_id!==r.organization_id||!requester.roles.includes('SYSTEM_ADMIN')||requester.person_id!==r.requester_person_id)fail('REQUESTER_CHANGED','原申请人的技术管理身份已变化');
  await cx.execute('INSERT INTO access_decisions(request_id,person_id,actor_id,decision,reason) VALUES (?,?,?,?,?)',[r.id,u.person_id,u.id,b.decision,b.reason]);
  if(b.decision==='REJECT'){await cx.execute("UPDATE access_requests SET status='REJECTED',version=version+1 WHERE id=?",[r.id]);await audit(cx,ctx,'ACCESS_REJECTED',r.id);return body(cx,await requestFor(cx,u,r.id));}
  const approved=await currentApprovals(cx,r,t,true);
  if(approved<2){await cx.execute("UPDATE access_requests SET status='PARTIAL_APPROVAL',version=version+1 WHERE id=?",[r.id]);await audit(cx,ctx,'ACCESS_PARTIAL_APPROVAL',r.id);return body(cx,await requestFor(cx,u,r.id));}
  await rows(cx,'SELECT user_id FROM wallets WHERE user_id=? FOR UPDATE',[t.id]);const fresh=await target(cx,u,t.id),snapshot=await state(cx,fresh);if(snapshot.version!==r.expected_subject_version||snapshot.hash!==r.snapshot_sha256)fail('ACCESS_TARGET_CHANGED','职员角色或范围已变化，不能应用过期授权快照');
  await validateChange(cx,u,fresh,{targetId:fresh.id,action:r.action,role:r.role,scopeType:r.scope_type,scopeId:r.scope_id,expectedSubjectVersion:r.expected_subject_version,reason:r.reason},snapshot);
  if(r.action==='GRANT_ROLE'){await cx.execute('UPDATE users SET roles=? WHERE id=?',[JSON.stringify([...fresh.roles,r.role].sort()),fresh.id]);await appendEvent(cx,ctx,r,'GRANT_ROLE',null);}
  else if(r.action==='REVOKE_ROLE'){
   const remaining=fresh.roles.filter(role=>role!==r.role);await cx.execute('UPDATE users SET roles=? WHERE id=?',[JSON.stringify(remaining.sort()),fresh.id]);await appendEvent(cx,ctx,r,'REVOKE_ROLE',null);
   for(const s of snapshot.scopes)if(!remaining.some(role=>Object.prototype.hasOwnProperty.call(roleScopes,role)&&roleScopes[role as BusinessRole].includes(s.scope_type)))await retire(cx,ctx,r,s,'ROLE_SCOPE_REVOKED');
  }else if(r.action==='GRANT_SCOPE'){await cx.execute('INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,?,?)',[fresh.id,r.scope_type,r.scope_id]);await appendEvent(cx,ctx,r,'GRANT_SCOPE',{scope_type:r.scope_type!,scope_id:r.scope_id!});}
  else await retire(cx,ctx,r,{scope_type:r.scope_type!,scope_id:r.scope_id!});
  await cx.execute('UPDATE access_subject_versions SET version=version+1 WHERE user_id=?',[fresh.id]);await cx.execute("UPDATE access_requests SET status='APPROVED',applied_at=UTC_TIMESTAMP(3),version=version+1 WHERE id=?",[r.id]);await audit(cx,ctx,'ACCESS_APPLIED',r.id);await notify(cx,fresh.id,'ACCESS_CHANGED',r.id,{message:'模拟职员权限已由两位独立审核员批准变更，即刻生效；依据可由技术管理员和授权审核员查看'});return body(cx,await requestFor(cx,u,r.id));
 });return undefined;
}
