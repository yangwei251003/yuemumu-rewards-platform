import {unitBody,type UnitRow} from './management';
import {validateFiles,linkFiles} from './files';
import {randomUUID} from 'node:crypto';
import {pool,rows,type Executor} from '../../db/src/client';
import {actor,sha,revokeLotEntitlement,type Actor} from './ledger';
import {command,fail,scoped,requireRole,audit,notify,assertWallet,appendLedger,type Context} from './commands';
import {allocate,projectTargets,competitionTargets,type MemberShare} from './allocation';
import type {Schemas} from '../../sdk/src';
import {calendarMonths} from './business-time';
type ProjectRow={id:string;organization_id:string;title:string;tier:Schemas['Project']['tier'];pool_points:number;status:Schemas['Project']['status'];creator_id:string;allocation_version:number;completed_stage:number;version:number};
type AllocationRow={members:MemberShare[];paid_anchor:Record<string,number>};
type CompetitionRow={id:string;organization_id:string;title:string;series:string;edition:string;award_track:string;allowed_levels:Schemas['Competition']['allowedLevels'];description:string;version:number};
type AwardRow={id:string;organization_id:string;kind:Schemas['AwardRequest']['kind'];source_id:string;family_id:string;artifact_id:string;applicant_id:string;interested_people:string[];targets:Record<string,number>;details:Schemas['AwardDetails'];evidence_file_ids:string[];description:string;status:Schemas['AwardRequest']['status'];required_approvers:number;version:number};
const verifierRoles=['REVIEWER','MENTOR','OPS_MANAGER'];
async function project(cx:Executor,u:Actor,id:string,lock=false){const[p]=await rows<ProjectRow>(cx,'SELECT * FROM projects WHERE id=?'+(lock?' FOR UPDATE':''),[id]);if(!p||p.organization_id!==u.organization_id)fail('NOT_FOUND','项目不存在',404);return p;}
async function allocation(cx:Executor,p:ProjectRow){return(await rows<AllocationRow>(cx,'SELECT * FROM project_allocations WHERE project_id=? AND version=?',[p.id,p.allocation_version]))[0];}
async function currentTargets(cx:Executor,familyId:string){return Object.fromEntries((await rows<{user_id:string;target_points:number}>(cx,'SELECT * FROM entitlements WHERE family_id=?',[familyId])).map(t=>[t.user_id,t.target_points]));}
async function projectBody(cx:Executor,p:ProjectRow):Promise<Schemas['Project']>{const a=await allocation(cx,p);const confirms=await rows<{user_id:string}>(cx,'SELECT user_id FROM project_confirmations WHERE project_id=? AND allocation_version=?',[p.id,p.allocation_version]);return {id:p.id,title:p.title,tier:p.tier,poolPoints:p.pool_points,status:p.status,creatorId:p.creator_id,allocationVersion:p.allocation_version,completedStage:p.completed_stage,version:p.version,members:a.members,confirmedMemberIds:confirms.map(c=>c.user_id),paidTargets:await currentTargets(cx,'PROJECT:'+p.id)};}
const competitionBody=(c:CompetitionRow):Schemas['Competition']=>({id:c.id,title:c.title,series:c.series,edition:c.edition,awardTrack:c.award_track,allowedLevels:c.allowed_levels,description:c.description,version:c.version});
async function awardBody(cx:Executor,a:AwardRow):Promise<Schemas['AwardRequest']>{const[n]=await rows<{n:number}>(cx,"SELECT COUNT(*) n FROM award_decisions WHERE request_id=? AND decision='APPROVE'",[a.id]);return {id:a.id,kind:a.kind,sourceId:a.source_id,artifactId:a.artifact_id,applicantId:a.applicant_id,targets:a.targets,details:a.details,description:a.description,evidenceFileIds:a.evidence_file_ids,status:a.status,requiredDistinctApprovers:a.required_approvers,completedApprovers:n.n,version:a.version,ruleVersion:'DRAFT_FOR_DEMO:v1'};}
export async function registerArtifact(cx:Executor,u:Actor,artifact:string,category:string,family:string){
 const [prior]=await rows<{category:string;family_id:string}>(cx,'SELECT category,family_id FROM artifact_registry WHERE organization_id=? AND artifact_id=?',[u.organization_id,artifact]);
 if(prior&&(prior.category!==category||prior.family_id!==family))fail('ARTIFACT_CATEGORY_CONFLICT','同一作品只能选择一个主奖励类别');
 await cx.execute('INSERT IGNORE INTO artifact_registry(organization_id,artifact_id,category,family_id,owner_id) VALUES (?,?,?,?,?)',[u.organization_id,artifact,category,family,u.id]);
 // Concurrent INSERT IGNORE must recheck the winning registry entry.
 const[current]=await rows<{category:string;family_id:string}>(cx,'SELECT category,family_id FROM artifact_registry WHERE organization_id=? AND artifact_id=?',[u.organization_id,artifact]);if(current.category!==category||current.family_id!==family)fail('ARTIFACT_CATEGORY_CONFLICT','同一作品已经登记为其他类别');
}
async function membersValid(cx:Executor,u:Actor,members:{userId:string}[]){for(const m of members){const person=await actor(cx,m.userId);if(person.organization_id!==u.organization_id||!person.roles.includes('STUDENT'))fail('INVALID_MEMBER','成员必须为本组织有效学生',422);}}
async function submitAward(cx:Executor,ctx:Context,u:Actor,data:{kind:AwardRow['kind'];sourceId:string;familyId:string;artifactId:string;targets:Record<string,number>;details:Schemas['AwardDetails'];description:string;evidenceFileIds:string[];interestedIds:string[];required?:number}){
 await validateFiles(cx,u,data.evidenceFileIds);
 if((await rows(cx,"SELECT id FROM award_requests WHERE family_id=? AND status IN ('PENDING','PARTIAL_APPROVAL')",[data.familyId])).length)fail('PENDING_REQUEST_EXISTS','同一权益已有待审申请，不能拆分重复提交');
 await registerArtifact(cx,u,data.artifactId,data.kind==='PROJECT_STAGE'?'PROJECT':data.kind,data.familyId);
 const interested=new Set<string>([u.person_id]);for(const id of [...Object.keys(data.targets),...data.interestedIds])interested.add((await actor(cx,id)).person_id);
 const id=randomUUID();await cx.execute('INSERT INTO award_requests(id,organization_id,kind,source_id,family_id,artifact_id,applicant_id,interested_people,targets,details,evidence_file_ids,description,status,required_approvers) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,u.organization_id,data.kind,data.sourceId,data.familyId,data.artifactId,u.id,JSON.stringify([...interested]),JSON.stringify(data.targets),JSON.stringify(data.details),JSON.stringify(data.evidenceFileIds),data.description,'PENDING',data.required||2]);await linkFiles(cx,data.evidenceFileIds,'AWARD',id);await audit(cx,ctx,'AWARD_REQUESTED',id);return awardBody(cx,(await rows<AwardRow>(cx,'SELECT * FROM award_requests WHERE id=?',[id]))[0]);
}
async function applyTargets(cx:Executor,ctx:Context,a:AwardRow){
 for(const [userId,target]of Object.entries(a.targets).sort(([x],[y])=>x<y?-1:1)){
  await assertWallet(cx,userId);await cx.execute('INSERT IGNORE INTO entitlements(family_id,user_id,target_points) VALUES (?,?,0)',[a.family_id,userId]);const[prior]=await rows<{target_points:number;recovery_recorded:number}>(cx,'SELECT target_points,recovery_recorded FROM entitlements WHERE family_id=? AND user_id=? FOR UPDATE',[a.family_id,userId]);const delta=target-prior.target_points;if(!delta)continue;
  if(delta>0){const entry=await appendLedger(cx,ctx,{userId,businessKey:'AWARD:'+a.id+':'+userId,kind:'EARN',available:delta,growth:delta,sourceType:a.kind,sourceId:a.source_id,reason:a.kind+'累计权益补差额 '+delta});await cx.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at) VALUES (?,?,?,?)',[entry,userId,delta,calendarMonths(new Date(),18)]);await cx.execute('INSERT INTO entitlement_lots(family_id,user_id,entry_id) VALUES (?,?,?)',[a.family_id,userId,entry]);}
  else{
   const roots=await rows<{entry_id:string}>(cx,'SELECT entry_id FROM entitlement_lots WHERE family_id=? AND user_id=? ORDER BY entry_id',[a.family_id,userId]);
   const {recovered,recovery}=await revokeLotEntitlement(cx,userId,roots.map(l=>l.entry_id),-delta);
   await appendLedger(cx,ctx,{userId,businessKey:'AWARD:'+a.id+':'+userId,kind:'REVERSE',available:-recovered,growth:delta,recovery,sourceType:a.kind,sourceId:a.source_id,reason:'双人复核调整累计权益；已消费部分登记追缴，合法无关成长保留'});
   await cx.execute('UPDATE entitlements SET recovery_recorded=recovery_recorded+? WHERE family_id=? AND user_id=?',[recovery,a.family_id,userId]);
  }
  await cx.execute('UPDATE entitlements SET target_points=? WHERE family_id=? AND user_id=?',[target,a.family_id,userId]);await notify(cx,userId,'AWARD_'+a.kind,a.id,{message:'成果权益已更新，本次差额 '+delta});
 }
}
export async function growthRead(name:string,userId:string,params:Record<string,string>,query:Record<string,unknown>,audience:string):Promise<unknown>{
 if(!['listRoster','listProjects','getProject','listCompetitions','listAwardRequests','listLearningUnits','listMyBadges'].includes(name))return undefined;
 const u=await actor(pool,userId),limit=Number(query.limit||20),cursor=String(query.cursor||'');
 if(name==='listRoster'){requireRole(u,['OPS_MANAGER','REVIEWER','MENTOR']);const list=await rows<{id:string;display_name:string;roles:string[];membership_status:string;demo_only:number}>(pool,`SELECT id,display_name,roles,membership_status,demo_only FROM users WHERE organization_id=? AND active=TRUE AND demo_only=TRUE AND id>? ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor]);return {items:list.slice(0,limit).map(v=>({id:v.id,displayName:v.display_name,roles:v.roles,membershipStatus:v.membership_status,demoOnly:!!v.demo_only})),nextCursor:list.length>limit?list[limit-1].id:null};}
 if(name==='listProjects'||name==='getProject'){
  if(audience==='staff'){requireRole(u,verifierRoles);if(name==='getProject')await scoped(pool,u,'PROJECT',params.projectId);}
  if(name==='getProject'){const p=await project(pool,u,params.projectId);if(audience==='student'&&!(await allocation(pool,p)).members.some(m=>m.userId===u.id))fail('NOT_FOUND','项目不存在',404);return projectBody(pool,p);}
  const list=await rows<ProjectRow>(pool,`SELECT p.* FROM projects p WHERE p.organization_id=? AND p.id>? ${audience==='student'?"AND EXISTS(SELECT 1 FROM project_allocations a WHERE a.project_id=p.id AND a.version=p.allocation_version AND JSON_CONTAINS(a.members,JSON_OBJECT('userId',?)))":"AND EXISTS(SELECT 1 FROM role_scopes r WHERE r.user_id=? AND r.scope_type='PROJECT' AND r.scope_id IN (p.id,'*'))"} ORDER BY p.id LIMIT ${limit+1}`,[u.organization_id,cursor,u.id]);return {items:await Promise.all(list.slice(0,limit).map(p=>projectBody(pool,p))),nextCursor:list.length>limit?list[limit-1].id:null};
 }
 if(name==='listCompetitions'){const list=await rows<CompetitionRow>(pool,`SELECT * FROM competitions WHERE organization_id=? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor]);return {items:list.slice(0,limit).map(competitionBody),nextCursor:list.length>limit?list[limit-1].id:null};}
 if(name==='listAwardRequests'){
  if(audience==='staff'){requireRole(u,[...verifierRoles,'AUDITOR']);if(u.roles.includes('AUDITOR'))await scoped(pool,u,'AUDIT',u.organization_id);else await scoped(pool,u,'GROWTH_REVIEW',u.organization_id);}
  const list=await rows<AwardRow>(pool,`SELECT * FROM award_requests WHERE organization_id=? AND id>? ${audience==='student'?'AND (applicant_id=? OR JSON_CONTAINS(JSON_KEYS(targets),JSON_QUOTE(?)))':"AND (kind<>'PROJECT_STAGE' OR EXISTS(SELECT 1 FROM role_scopes r WHERE r.user_id=? AND r.scope_type='PROJECT' AND r.scope_id IN (award_requests.source_id,'*')))"} ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor,...(audience==='student'?[u.id,u.id]:[u.id])]);return {items:await Promise.all(list.slice(0,limit).map(a=>awardBody(pool,a))),nextCursor:list.length>limit?list[limit-1].id:null};
 }
 if(name==='listLearningUnits'){if(audience==='staff'){requireRole(u,verifierRoles);await scoped(pool,u,'GROWTH_REVIEW',u.organization_id);}const list=await rows<UnitRow>(pool,`SELECT * FROM learning_units l WHERE organization_id=? AND id>? ${audience==='student'?"AND (status='PUBLISHED' OR (status='RETIRED' AND (EXISTS(SELECT 1 FROM unit_claims c WHERE c.unit_id=l.id AND c.user_id=?) OR EXISTS(SELECT 1 FROM award_requests a WHERE a.source_id=l.id AND a.applicant_id=?) OR EXISTS(SELECT 1 FROM learning_attempts t WHERE t.unit_id=l.id AND t.user_id=?))))":''} ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor,...(audience==='student'?[u.id,u.id,u.id]:[])]);return {items:list.slice(0,limit).map(unitBody),nextCursor:list.length>limit?list[limit-1].id:null};}
 if(name==='listMyBadges'){const list=await rows<{badge_code:string;request_id:string;status:string;created_at:Date}>(pool,`SELECT * FROM skill_badges WHERE user_id=? AND badge_code>? ORDER BY badge_code LIMIT ${limit+1}`,[u.id,cursor]);return {items:list.slice(0,limit).map(v=>({badgeCode:v.badge_code,requestId:v.request_id,status:v.status,awardedAt:v.created_at.toISOString()})),nextCursor:list.length>limit?list[limit-1].badge_code:null};}
 return undefined;
}
export async function growthWrite(name:string,inputContext:Context,params:Record<string,string>,body:unknown):Promise<unknown>{
 const ctx:Context={...inputContext,authorize:async(cx,u)=>{
  if(['createProject','updateProjectAllocation','stopProject'].includes(name))await scoped(cx,u,'PROJECT',params.projectId||'*');
  if(name==='createCompetition')await scoped(cx,u,'GROWTH_REVIEW',u.organization_id);
  if(name==='requestLearningRevocation'){if(u.roles.includes('AUDITOR'))await scoped(cx,u,'AUDIT',u.organization_id);else await scoped(cx,u,'GROWTH_REVIEW',u.organization_id);}
  if(name==='decideAwardRequest'){const[a]=await rows<AwardRow>(cx,'SELECT * FROM award_requests WHERE id=?',[params.awardId]);if(!a||a.organization_id!==u.organization_id)fail('NOT_FOUND','申请不存在',404);await scoped(cx,u,'GROWTH_REVIEW',a.organization_id);if(a.kind==='PROJECT_STAGE')await scoped(cx,u,'PROJECT',a.source_id);}
 }};
 if(name==='requestLearningRevocation')return command(ctx,name,{params,body},[...verifierRoles,'AUDITOR'],async(cx,u)=>{
  const[original]=await rows<AwardRow>(cx,'SELECT * FROM award_requests WHERE id=? AND organization_id=? FOR UPDATE',[params.awardId,u.organization_id]);if(!original)fail('NOT_FOUND','原始成果不存在',404);const b=body as Schemas['LearningRevocationRequest'];
  if(original.version!==b.expectedVersion)fail('VERSION_CONFLICT','原始成果已更新');if(original.status!=='APPROVED'||!['TRAINING','CONTENT','ASSESSMENT'].includes(original.kind)||original.details.revokesAwardId)fail('INVALID_REVOCATION_SOURCE','仅学习、宣传、独立考核的原验收可走此流程；项目或竞赛须走专门更正',422);
  if(!b.evidenceFileIds.length)fail('EVIDENCE_REQUIRED','撤销需新的复核凭证',422);await validateFiles(cx,u,b.evidenceFileIds);
  const previous=await currentTargets(cx,original.family_id),badgeCode=original.details.badgeCode;
  const activeBadges=badgeCode?await rows(cx,"SELECT user_id FROM skill_badges WHERE request_id=? AND badge_code=? AND status='ACTIVE'",[original.id,badgeCode]):[];
  if(b.mode==='BADGE_ONLY'&&!activeBadges.length)fail('BADGE_NOT_ACTIVE','此原成果没有可独立撤回的有效翼章');
  if((b.mode==='POINTS_ONLY'||!activeBadges.length)&&!Object.values(previous).some(p=>p>0))fail('NO_ENTITLEMENT_CHANGE','原成果相关权益已经撤回，无需重复');
  const hashes:string[]=[];for(const id of b.evidenceFileIds)hashes.push((await rows<{sha256:string}>(cx,'SELECT sha256 FROM private_files WHERE id=?',[id]))[0].sha256);const hash=sha(JSON.stringify([...new Set(hashes)].sort()));
  const[prior]=await rows<{revocation_award_id:string}>(cx,'SELECT revocation_award_id FROM learning_revocations WHERE original_award_id=? AND mode=? AND evidence_hash=?',[original.id,b.mode,hash]);if(prior)fail('DUPLICATE_REVOCATION','相同证据和撤销范围已经提交，不能换键重复申请');
  const[unit]=await rows<UnitRow>(cx,'SELECT * FROM learning_units WHERE id=?',[original.source_id]);if(!unit)fail('NOT_FOUND','原课程或宣传任务不存在',404);
  const targets=b.mode==='BADGE_ONLY'?previous:Object.fromEntries(Object.keys(previous).map(id=>[id,0]));
  const result=await submitAward(cx,ctx,u,{kind:original.kind,sourceId:original.source_id,familyId:original.family_id,artifactId:original.artifact_id,targets,details:{...original.details,correction:true,revokesAwardId:original.id,revocationMode:b.mode},description:b.reason,evidenceFileIds:b.evidenceFileIds,interestedIds:[original.applicant_id,unit.creator_id],required:2});
  await cx.execute('INSERT INTO learning_revocations(original_award_id,revocation_award_id,mode,evidence_hash) VALUES (?,?,?,?)',[original.id,result.id,b.mode,hash]);await audit(cx,ctx,'LEARNING_REVOCATION_REQUESTED',result.id);return result;
 });
 if(name==='createProject')return command(ctx,name,body,['OPS_MANAGER'],async(cx,u)=>{
  const b=body as Schemas['ProjectCreateRequest'];const bounds={P0:[100,250],P1:[300,600],P2:[800,2000],P3:[2500,6000]}[b.tier];if(b.poolPoints<bounds[0]||b.poolPoints>bounds[1])fail('INVALID_POOL','团队池超出所选项目等级范围',422);allocate(b.poolPoints,b.members);if(b.members.length>=4&&b.members.some(m=>m.basisPoints>4000))fail('MEMBER_CAP','四人以上团队单人比例不得超过40%',422);await membersValid(cx,u,b.members);
  const id=randomUUID();await cx.execute('INSERT INTO projects(id,organization_id,title,tier,pool_points,status,creator_id) VALUES (?,?,?,?,?,?,?)',[id,u.organization_id,b.title,b.tier,b.poolPoints,'ACTIVE',u.id]);await cx.execute('INSERT INTO project_allocations(project_id,version,members,paid_anchor,reason,actor_id) VALUES (?,1,?,?,?,?)',[id,JSON.stringify(b.members),'{}','初始分配，待成员确认及阶段双审',u.id]);await audit(cx,ctx,'PROJECT_CREATED',id);return projectBody(cx,await project(cx,u,id));
 });
 if(name==='updateProjectAllocation'||name==='stopProject')return command(ctx,name,{params,body},['OPS_MANAGER'],async(cx,u)=>{
  const p=await project(cx,u,params.projectId,true);const b=body as Schemas['AllocationRequest'];if(p.version!==b.expectedVersion)fail('VERSION_CONFLICT','项目已更新');if(p.status!=='ACTIVE')fail('INVALID_STATE','项目已结束');if((await rows(cx,"SELECT id FROM award_requests WHERE family_id=? AND status IN ('PENDING','PARTIAL_APPROVAL')",['PROJECT:'+p.id])).length)fail('PENDING_REQUEST_EXISTS','请先完成现有阶段审核');
  if(name==='stopProject'){await cx.execute("UPDATE projects SET status='STOPPED',version=version+1 WHERE id=?",[p.id]);}
  else{allocate(p.pool_points,b.members);if(b.members.length>=4&&b.members.some(m=>m.basisPoints>4000))fail('MEMBER_CAP','四人以上团队单人比例不得超过40%',422);await membersValid(cx,u,b.members);const anchor=await currentTargets(cx,'PROJECT:'+p.id);await cx.execute('INSERT INTO project_allocations(project_id,version,members,paid_anchor,reason,actor_id) VALUES (?,?,?,?,?,?)',[p.id,p.allocation_version+1,JSON.stringify(b.members),JSON.stringify(anchor),b.reason,u.id]);await cx.execute('UPDATE projects SET allocation_version=allocation_version+1,version=version+1 WHERE id=?',[p.id]);}
  await audit(cx,ctx,name,p.id);return projectBody(cx,await project(cx,u,p.id));
 });
 if(name==='confirmProjectAllocation')return command(ctx,name,{params,body},['STUDENT'],async(cx,u)=>{
  const p=await project(cx,u,params.projectId,true),a=await allocation(cx,p);if(p.status!=='ACTIVE'||p.allocation_version!==(body as Schemas['ConfirmAllocationRequest']).allocationVersion)fail('VERSION_CONFLICT','分配方案已更新或项目已结束');if(!a.members.some(m=>m.userId===u.id))fail('FORBIDDEN','只有当前成员可确认贡献',403);await cx.execute('INSERT IGNORE INTO project_confirmations(project_id,allocation_version,user_id) VALUES (?,?,?)',[p.id,p.allocation_version,u.id]);await audit(cx,ctx,'ALLOCATION_CONFIRMED',p.id);return projectBody(cx,p);
 });
 if(name==='submitProjectStage')return command(ctx,name,{params,body},['STUDENT'],async(cx,u)=>{
  const p=await project(cx,u,params.projectId,true),a=await allocation(cx,p),b=body as Schemas['ProjectStageRequest'];if(p.version!==b.expectedVersion)fail('VERSION_CONFLICT','项目已更新');if(p.status!=='ACTIVE'||p.completed_stage+1!==b.stage)fail('INVALID_STAGE','必须按阶段顺序提交');if(!a.members.some(m=>m.userId===u.id))fail('FORBIDDEN','只允许团队成员提交',403);const confirmed=await rows<{user_id:string}>(cx,'SELECT user_id FROM project_confirmations WHERE project_id=? AND allocation_version=?',[p.id,p.allocation_version]);if(a.members.some(m=>!confirmed.some(c=>c.user_id===m.userId)))fail('MEMBERS_NOT_CONFIRMED','需要所有当前成员确认分配');
  return submitAward(cx,ctx,u,{kind:'PROJECT_STAGE',sourceId:p.id,familyId:'PROJECT:'+p.id,artifactId:b.artifactId,targets:projectTargets(p.pool_points,b.stage,a.members,a.paid_anchor),details:{stage:b.stage,allocationVersion:p.allocation_version},description:b.description,evidenceFileIds:b.evidenceFileIds,interestedIds:[p.creator_id]});
 });
 if(name==='createCompetition')return command(ctx,name,body,['OPS_MANAGER'],async(cx,u)=>{
  const b=body as Schemas['CompetitionCreateRequest'];if(new Set(b.allowedLevels).size!==b.allowedLevels.length)fail('INVALID_LEVELS','赛级不能重复',422);if((await rows(cx,'SELECT id FROM competitions WHERE organization_id=? AND series=? AND edition=? AND award_track=?',[u.organization_id,b.series,b.edition,b.awardTrack])).length)fail('DUPLICATE_COMPETITION','此赛事届次和赛道已登记');const id=randomUUID();await cx.execute('INSERT INTO competitions(id,organization_id,title,series,edition,award_track,allowed_levels,description) VALUES (?,?,?,?,?,?,?,?)',[id,u.organization_id,b.title,b.series,b.edition,b.awardTrack,JSON.stringify(b.allowedLevels),b.description]);await audit(cx,ctx,'DEMO_COMPETITION_WHITELIST',id);return competitionBody((await rows<CompetitionRow>(cx,'SELECT * FROM competitions WHERE id=?',[id]))[0]);
 });
 if(name==='submitCompetitionAward')return command(ctx,name,body,['STUDENT'],async(cx,u)=>{
  const b=body as Schemas['CompetitionAwardRequest'];const[c]=await rows<CompetitionRow>(cx,'SELECT * FROM competitions WHERE id=? FOR UPDATE',[b.competitionId]);if(!c||c.organization_id!==u.organization_id)fail('NOT_FOUND','赛事不在本组织白名单',404);if(!c.allowed_levels.includes(b.level))fail('LEVEL_NOT_RECOGNIZED','该赛级不在已登记名单内',422);await membersValid(cx,u,b.members);if(!b.members.some(m=>m.userId===u.id))fail('FORBIDDEN','只允许参赛成员提交',403);
  const family='COMP:'+sha(JSON.stringify([u.organization_id,c.series,c.edition,b.artifactId,c.award_track]));const targets=competitionTargets(b.level,b.rank,b.members),previous=await currentTargets(cx,family);
  if(b.rank===-1&&!b.correction)fail('CORRECTION_REQUIRED','撤奖必须走双审更正',422);
  const[priorAward]=await rows<AwardRow>(cx,"SELECT * FROM award_requests WHERE family_id=? AND status='APPROVED' ORDER BY created_at DESC,id DESC LIMIT 1",[family]);
  const normalized=(members:Schemas['CompetitionMember'][])=>JSON.stringify([...members].sort((a,b)=>a.userId<b.userId?-1:1));if(priorAward?.details.members&&!b.correction&&normalized(priorAward.details.members)!==normalized(b.members))fail('CORRECTION_REQUIRED','成员或系数改变需要明确更正，不能作为普通晋级',422);
  if(!b.correction){for(const[id,points]of Object.entries(previous))targets[id]=Math.max(points,targets[id]||0);}else for(const id of Object.keys(previous))targets[id]??=0;
  if(Object.keys(previous).length&&Object.keys(targets).every(id=>(previous[id]||0)===targets[id]))fail('NO_ENTITLEMENT_CHANGE','目标权益未增加或更正，无需重复申领');
  return submitAward(cx,ctx,u,{kind:'COMPETITION',sourceId:c.id,familyId:family,artifactId:b.artifactId,targets,details:{level:b.level,rank:b.rank,correction:b.correction,members:b.members},description:b.description,evidenceFileIds:b.evidenceFileIds,interestedIds:[]});
 });
 if(name==='submitLearning')return command(ctx,name,body,['STUDENT'],async(cx,u)=>{
  const b=body as Schemas['LearningSubmissionRequest'];const[unit]=await rows<UnitRow>(cx,'SELECT * FROM learning_units WHERE id=?',[b.unitId]);if(!unit||unit.organization_id!==u.organization_id)fail('NOT_FOUND','课程或任务不存在',404);if(unit.status!=='PUBLISHED')fail('INVALID_STATE','课程未发布或已结束');if(unit.managed){if(b.unitVersion!==unit.version)fail('VERSION_CONFLICT','课程已更新，请刷新后提交');if(!(await rows(cx,'SELECT id FROM unit_claims WHERE unit_id=? AND user_id=?',[unit.id,u.id])).length)fail('CLAIM_REQUIRED','请先报名课程或认领任务');if(unit.kind==='CONTENT'&&(!b.publicationUrl||!b.roleContribution||!b.evidenceFileIds.length))fail('CONTENT_EVIDENCE_REQUIRED','宣传任务需源文件、授权、发布链接及角色贡献',422);}if(unit.questions.length!==b.answers.length)fail('INVALID_ANSWERS','请完成所有题目',422);
  if(unit.kind==='CONTENT'&&!b.authorizationConfirmed)fail('AUTHORIZATION_REQUIRED','请确认原创及使用授权后提交',422);
  const score=unit.answer_keys.length?Math.floor(100*unit.answer_keys.filter((key,i)=>key===b.answers[i]).length/unit.answer_keys.length):100;const id=randomUUID(),passed=score>=80;await cx.execute('INSERT INTO learning_attempts(id,unit_id,user_id,answers,score,passed) VALUES (?,?,?,?,?,?)',[id,unit.id,u.id,JSON.stringify(b.answers),score,passed]);if(!passed)return {id,unitId:unit.id,score,passed,awardRequestId:null};
  const family='LEARN:'+unit.id+':'+u.id;if(Object.keys(await currentTargets(cx,family)).length)fail('ALREADY_COMPLETED','该课程或独立考核已验收，不能重复领分');
  const award=await submitAward(cx,ctx,u,{kind:unit.kind,sourceId:unit.id,familyId:family,artifactId:b.artifactId,targets:{[u.id]:unit.points},details:{unitId:unit.id,score,badgeCode:unit.badge_code,...(unit.managed?{unitVersion:unit.version,publicationUrl:b.publicationUrl||null,roleContribution:b.roleContribution||null}:{})},description:b.description,evidenceFileIds:b.evidenceFileIds,interestedIds:[unit.creator_id],required:unit.points>300?2:1});return {id,unitId:unit.id,score,passed,awardRequestId:award.id};
 });
 if(name==='decideAwardRequest')return command(ctx,name,{params,body},verifierRoles,async(cx,u)=>{
  const[a]=await rows<AwardRow>(cx,'SELECT * FROM award_requests WHERE id=? FOR UPDATE',[params.awardId]);if(a.interested_people.includes(u.person_id))fail('RECUSAL_REQUIRED','发起人、受益人及关联人员必须回避',403);const b=body as Schemas['DecisionRequest'];if(a.version!==b.expectedVersion)fail('VERSION_CONFLICT','申请已更新');if(!['PENDING','PARTIAL_APPROVAL'].includes(a.status))fail('INVALID_STATE','申请已结束');if((await rows(cx,'SELECT person_id FROM award_decisions WHERE request_id=? AND person_id=?',[a.id,u.person_id])).length)fail('DUPLICATE_PERSON','同一自然人不能重复审批');
  await cx.execute('INSERT INTO award_decisions(request_id,person_id,actor_id,decision,reason) VALUES (?,?,?,?,?)',[a.id,u.person_id,u.id,b.decision==='APPROVE'?'APPROVE':'REJECT',b.reason]);const[n]=await rows<{n:number}>(cx,"SELECT COUNT(*) n FROM award_decisions WHERE request_id=? AND decision='APPROVE'",[a.id]);const approved=b.decision==='APPROVE'&&n.n>=a.required_approvers;const status=b.decision!=='APPROVE'?'REJECTED':approved?'APPROVED':'PARTIAL_APPROVAL';
  if(approved){
   if(a.kind==='PROJECT_STAGE'){const p=await project(cx,u,a.source_id,true);if(p.status!=='ACTIVE'||p.completed_stage+1!==a.details.stage||p.allocation_version!==a.details.allocationVersion)fail('STALE_PROJECT_REQUEST','项目状态或分配已更新');await applyTargets(cx,ctx,a);await cx.execute('UPDATE projects SET completed_stage=?,status=?,version=version+1 WHERE id=?',[a.details.stage,a.details.stage===4?'COMPLETED':'ACTIVE',p.id]);}
   else{if(a.kind==='COMPETITION')await rows(cx,'SELECT id FROM competitions WHERE id=? FOR UPDATE',[a.source_id]);await applyTargets(cx,ctx,a);}
   if(a.details.revokesAwardId){
    if(a.details.badgeCode&&a.details.revocationMode!=='POINTS_ONLY')for(const userId of Object.keys(a.targets))await cx.execute("UPDATE skill_badges SET status='REVOKED' WHERE user_id=? AND badge_code=? AND request_id=? AND status='ACTIVE'",[userId,a.details.badgeCode,a.details.revokesAwardId]);
   }else if(a.details.badgeCode)for(const userId of Object.keys(a.targets)){
    // applyTargets already holds the beneficiary wallet lock. Preserve the existing
    // one-row-per-user/code boundary, including revoked records, without a SQL 503.
    if((await rows(cx,'SELECT request_id FROM skill_badges WHERE user_id=? AND badge_code=? FOR UPDATE',[userId,a.details.badgeCode])).length)fail('BADGE_ALREADY_RECORDED','该技能翼章已有历史记录，当前版本不支持重复颁发；请核对原记录并由独立审核员处理。');
    await cx.execute('INSERT INTO skill_badges(user_id,badge_code,request_id,status) VALUES (?,?,?,?)',[userId,a.details.badgeCode,a.id,'ACTIVE']);
   }
  }
  await cx.execute('UPDATE award_requests SET status=?,version=version+1 WHERE id=?',[status,a.id]);await audit(cx,ctx,'AWARD_'+b.decision,a.id);await notify(cx,a.applicant_id,'AWARD_REVIEW_'+status,a.id,{message:b.reason});return awardBody(cx,(await rows<AwardRow>(cx,'SELECT * FROM award_requests WHERE id=?',[a.id]))[0]);
 });
 return undefined;
}
