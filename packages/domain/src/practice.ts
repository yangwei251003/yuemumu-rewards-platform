import {pool,rows} from '../../db/src/client';
import {actor} from './ledger';
import {fail,requireRole} from './commands';
import {activityRead} from './activities';
import {growthRead} from './growth';
import {managementRead} from './management';
import {meetingRead} from './meetings';
import {orderRead} from './orders';
import {commerceRead} from './commerce';
import type {Schemas} from '../../sdk/src';

type Item=Schemas['PracticeItem'];
type Read=(name:string,userId:string,params:Record<string,string>,query:Record<string,unknown>,audience:string)=>Promise<unknown>;
async function collect<T>(read:Read,name:string,userId:string):Promise<T[]>{
 const result:T[]=[],seen=new Set<string>();let cursor='';
 do{const page=await read(name,userId,{}, {limit:100,...(cursor?{cursor}:{})},'student') as {items:T[];nextCursor:string|null};result.push(...page.items);cursor=page.nextCursor||'';if(cursor&&seen.has(cursor))throw Error('Repeated source cursor');seen.add(cursor);}while(cursor);
 return result;
}
const pending=(a:Schemas['AwardRequest'])=>['PENDING','PARTIAL_APPROVAL'].includes(a.status);
const rank=(i:Item)=>i.bucket==='ACTION'?0:i.bucket==='WAITING'?1:2;
const key=(i:Item)=>`${rank(i)}|${i.dueAt||'9999'}|${i.id}`;
const compare=(a:Item,b:Item)=>key(a)<key(b)?-1:key(a)>key(b)?1:0;

/** A navigation read model. Every mutation still checks the original domain command. */
export async function studentPracticeFeed(userId:string,query:Record<string,unknown>):Promise<Schemas['PracticeFeed']>{
 const u=await actor(pool,userId);requireRole(u,['STUDENT']);
 const now=new Date(),limit=Number(query.limit||20),bucket=String(query.bucket||'all');
 let after='';
 if(query.cursor){try{after=Buffer.from(String(query.cursor),'base64url').toString('utf8');if(!/^[012]\|[^|]+\|[A-Z]+:[\w-]+$/.test(after)||Buffer.from(after).toString('base64url')!==query.cursor)throw Error();}catch{fail('INVALID_CURSOR','实践记录游标无效',422);}}
 const [activities,registrations,submissions,projects,awards,claims,units,orders,meetings,meetingClaims,applications,recruitments,returns]=await Promise.all([
  collect<Schemas['Activity']>(activityRead,'listActivities',userId),collect<Schemas['Registration']>(activityRead,'listMyRegistrations',userId),collect<Schemas['Submission']>(activityRead,'listSubmissions',userId),
  collect<Schemas['Project']>(growthRead,'listProjects',userId),collect<Schemas['AwardRequest']>(growthRead,'listAwardRequests',userId),
  collect<Schemas['UnitClaim']>(managementRead,'listLearningClaims',userId),collect<Schemas['LearningUnit']>(growthRead,'listLearningUnits',userId),
  collect<Schemas['Order']>(orderRead,'listMyOrders',userId),collect<Schemas['Meeting']>(meetingRead,'listMeetings',userId),collect<Schemas['MeetingClaim']>(meetingRead,'listMeetingClaims',userId),collect<Schemas['ProjectApplication']>(managementRead,'listProjectApplications',userId),collect<Schemas['ProjectRecruitment']>(managementRead,'listProjectRecruitments',userId),collect<Schemas['CommerceReturn']>(commerceRead,'listCommerceReturns',userId)
 ]);
 const [entitlements,attendance,member,unread,attempts]=await Promise.all([
  rows<{family_id:string}>(pool,'SELECT family_id FROM entitlements WHERE user_id=?',[userId]),
  rows<{activity_id:string;phase:string}>(pool,'SELECT r.activity_id,r.phase FROM attendance_records r JOIN activities a ON a.id=r.activity_id WHERE r.user_id=? AND a.organization_id=?',[userId,u.organization_id]),
  rows<{membership_status:string}>(pool,'SELECT membership_status FROM users WHERE id=?',[userId]),
  rows<{n:number}>(pool,'SELECT COUNT(*) n FROM notifications WHERE user_id=? AND read_at IS NULL',[userId]),
  rows<{unit_id:string}>(pool,'SELECT DISTINCT a.unit_id FROM learning_attempts a JOIN learning_units l ON l.id=a.unit_id WHERE a.user_id=? AND l.organization_id=?',[userId,u.organization_id])
 ]);
 const activeMember=member[0].membership_status==='ACTIVE',items:Item[]=[];
 const target=(section:Schemas['PracticeTarget']['section'],entityId:string,tab:string|null=null,focusId:string|null=null)=>({section,entityId,tab,focusId});
 for(const r of registrations){
  const a=activities.find(v=>v.id===r.activityId);if(!a)continue;
  const s=submissions.find(v=>v.sourceType==='ACTIVITY'&&v.sourceId===a.id),m=meetings.find(v=>v.activity.id===a.id),claim=m?meetingClaims.find(v=>v.meetingId===m.id):undefined;
  let state:Item['bucket']='WAITING',nextStep='等待活动开始，查看参与要求',label='查看实践';
  const closed=['CANCELLED','NO_SHOW'].includes(r.status)||a.status==='CANCELLED';
  const both=['START','END'].every(phase=>attendance.some(v=>v.activity_id===a.id&&v.phase===phase));
  if(closed){state='COMPLETE';nextStep='参与已结束，原记录保留';}
  else if(r.status==='WAITLISTED'){nextStep='正在候补，获得名额后再参加';}
  else if(m){
   if(claim){state=claim.status==='SUBMITTED'?'WAITING':'COMPLETE';nextStep=claim.status==='APPROVED'?'合并贡献已审核；实际入账与待解锁请查看待结算':claim.status==='REJECTED'?'本次贡献未通过，查看审核意见':'等待独立审核会议合并贡献';}
   else if(a.status==='COMPLETED'&&both){state='ACTION';nextStep='提交本场会议合并贡献，避免重复申领';label='提交会议贡献';}
   else{nextStep=both?'签到已记录，等待活动结束':'按现场要求完成开始与结束签到';}
  }else if(s){
   state=s.status==='NEEDS_CHANGES'?'ACTION':['APPROVED','REJECTED'].includes(s.status)?'COMPLETE':'WAITING';
   nextStep=s.status==='NEEDS_CHANGES'?'按审核意见补充原成果；新一轮重新签认':s.status==='APPROVED'?'成果已通过，查看成长记录与原始材料':s.status==='REJECTED'?'本次未通过，查看原审核意见':'材料已提交，等待事实签认与独立审核';label=s.status==='NEEDS_CHANGES'?'补充材料':'查看成果';
  }else if(both){state='ACTION';nextStep='签到已记录，补上本次实践成果';label='提交成果';}
  else if(['PUBLISHED','IN_PROGRESS'].includes(a.status)&&Date.parse(a.startsAt||'')<=now.getTime()&&Date.parse(a.endsAt||'')>=now.getTime()){state='ACTION';nextStep='活动正在进行，按现场要求完成签到';label='查看签到';}
  else if(a.status==='COMPLETED'||Date.parse(a.endsAt||'')<now.getTime()){nextStep='查看出勤与成果要求；签到不会直接发分';}
  items.push({id:`${m?'MEETING':'ACTIVITY'}:${r.id}`,kind:m?'MEETING':'ACTIVITY',title:a.title,status:claim?.status||s?.status||r.status,bucket:state,nextStep,actionLabel:label,dueAt:null,target:target('活动',a.id,null,s?.id||null)});
 }
 const learningIds=new Set([...claims.map(c=>c.unitId),...awards.filter(a=>['TRAINING','ASSESSMENT','CONTENT'].includes(a.kind)).map(a=>a.sourceId),...attempts.map(a=>a.unit_id)]);
 for(const unitId of learningIds){
  const unit=units.find(v=>v.id===unitId);if(!unit)continue;
  const related=awards.filter(v=>v.sourceId===unit.id&&['TRAINING','ASSESSMENT','CONTENT'].includes(v.kind)),waiting=related.find(pending),settled=entitlements.some(v=>v.family_id===`LEARN:${unit.id}:${userId}`);
  const state:Item['bucket']=waiting?'WAITING':settled?'COMPLETE':unit.status==='PUBLISHED'?'ACTION':'COMPLETE';
  items.push({id:'LEARNING:'+unit.id,kind:'LEARNING',title:unit.title,status:waiting?.status||(settled?'REVIEWED':unit.status),bucket:state,nextStep:waiting?(waiting.details.revokesAwardId?'学习权益撤销正在独立复核，原记录保持可追溯':'等待独立验收，作答通过不代表已获翼章'):settled?'验收记录已形成；积分和翼章分别查看':unit.status==='PUBLISHED'?'继续学习并按要求提交成果':'课程已停止开放，保留本人记录',actionLabel:state==='ACTION'?'继续学习':'查看学习记录',dueAt:null,target:target('技能',unit.id)});
 }
 for(const a of applications){const r=recruitments.find(r=>r.id===a.recruitmentId);if(!r||(r.projectId&&projects.some(p=>p.id===r.projectId)&&a.status==='ACCEPTED'))continue;const ended=a.status==='REJECTED'||r.status==='CLOSED'||r.status==='FORMED';items.push({id:'PROJECT:'+a.id,kind:'PROJECT',title:r.title,status:a.status,bucket:ended?'COMPLETE':'WAITING',nextStep:a.status==='REJECTED'?'本次未录取，查看负责人意见':r.status==='CLOSED'?'招募已关闭，保留本人申请':a.status==='ACCEPTED'?'已录取，等待负责人建立团队':'申请已提交，等待负责人核对',actionLabel:'查看招募与本人申请',dueAt:null,target:target('项目',r.id,'招募',a.id)});}
 for(const p of projects){
  const waiting=awards.find(a=>a.kind==='PROJECT_STAGE'&&a.sourceId===p.id&&pending(a)),confirmed=p.confirmedMemberIds.includes(userId),all=p.members.every(m=>p.confirmedMemberIds.includes(m.userId));
  const state:Item['bucket']=p.status!=='ACTIVE'||p.completedStage>=4?'COMPLETE':!confirmed?'ACTION':waiting||!all?'WAITING':'ACTION';
  items.push({id:'PROJECT:'+p.id,kind:'PROJECT',title:p.title,status:p.status,bucket:state,nextStep:state==='COMPLETE'?'项目已结束，查看各阶段验收记录':!confirmed?'核对当前版本的本人贡献分配':waiting?'本阶段成果已提交，等待独立验收':!all?'等待其他成员确认当前分配版本':`准备阶段 ${p.completedStage+1} 的团队成果`,actionLabel:!confirmed&&p.status==='ACTIVE'?'确认贡献分配':'查看项目阶段',dueAt:null,target:target('项目',p.id,'项目')});
 }
 for(const a of awards.filter(v=>v.kind==='COMPETITION'))items.push({id:'COMPETITION:'+a.id,kind:'COMPETITION',title:a.artifactId,status:a.status,bucket:pending(a)?'WAITING':'COMPLETE',nextStep:pending(a)?'赛事成果等待独立核验':'查看本作品审核结果；晋级沿用原作品标识',actionLabel:'查看赛事记录',dueAt:null,target:target('项目',a.sourceId,'验收记录',a.id)});
 for(const o of orders){
  const returning=returns.find(r=>r.sourceType==='ORDER'&&r.orderId===o.id&&['PENDING','PARTIAL_APPROVAL','APPROVED'].includes(r.status));
  const expired=o.status==='READY'&&!!o.expiresAt&&Date.parse(o.expiresAt)<=now.getTime(),ready=o.status==='READY'&&!expired;
  items.push({id:'ORDER:'+o.id,kind:'ORDER',title:o.rewardNameSnapshot,status:o.status,bucket:returning?'WAITING':ready?'ACTION':['PREPARING','READY','RETURN_REQUESTED'].includes(o.status)?'WAITING':'COMPLETE',nextStep:returning?(returning.status==='APPROVED'?'退货已获批，等待实物收齐后按规则退回积分':'质量退货等待独立审核，原领取记录保留'):ready?'已备货，在领取期限内出示本人凭证':expired?'已过领取时间，等待服务器更新状态':o.status==='PREPARING'?'等待备货，当前尚不能领取':o.status==='RETURN_REQUESTED'?'退货处理中，查看独立审核与实收进度':'查看订单和权益变更记录',actionLabel:ready?'查看领取凭证':'查看订单',dueAt:ready?o.expiresAt:null,target:target('订单',o.id)});
 }
 // Membership changes may prevent participation; do not claim eligibility from a task label.
 if(!activeMember)for(const item of items)if(item.bucket==='ACTION'&&['提交会议贡献','提交成果','继续学习','查看项目阶段'].includes(item.actionLabel)){item.bucket='WAITING';item.nextStep='当前成员资格受限，可查看原记录与申诉；操作以服务器核验为准';item.actionLabel='查看原记录';}
 const filtered=items.filter(i=>(bucket==='all'||bucket==='action'&&i.bucket==='ACTION'||bucket==='active'&&i.bucket!=='COMPLETE'||bucket==='history'&&i.bucket==='COMPLETE')&&(!after||key(i)>after)).sort(compare);
 const page=filtered.slice(0,limit);
 return {items:page,nextCursor:filtered.length>limit?Buffer.from(key(page.at(-1)!)).toString('base64url'):null,unreadCount:Number(unread[0].n),generatedAt:now.toISOString()};
}
