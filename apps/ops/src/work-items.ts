import type {Schemas} from '@ymm/sdk';
import {allPages,hasRole,type FlowProps} from './flow-command';
export type WorkItem={id:string;type:string;person:string;title:string;state:string;step:string;path:string;time?:string|null};
export type WorkSource={name:string;read:()=>Promise<WorkItem[]>};
const pending=(status:string)=>['PENDING','PARTIAL_APPROVAL'].includes(status);
const state=(s:string)=>({PENDING:'待审核',PARTIAL_APPROVAL:'待独立复核',SUBMITTED:'待处理',PREPARING:'待备货',READY:'待领取',APPROVED:'待履约',QUARANTINED:'待质检',OPEN:'待核查',UNDER_REVIEW:'复核中'}[s]||s);
export function workSources({client,user}:FlowProps):WorkSource[]{
 const result:WorkSource[]=[];
 function source<T>(name:string,roles:Schemas['User']['roles'],read:(p:Record<string,string|number>)=>Promise<{items:T[];nextCursor:string|null}>,map:(r:T)=>WorkItem|null){if(hasRole(user,roles))result.push({name,read:async()=>{const rows=await allPages(read);return rows.map(map).filter((r):r is WorkItem=>r!==null);}});}
 const item=(id:string,type:string,person:string,title:string,status:string,step:string,path:string,time?:string|null):WorkItem=>({id,type,person,title,state:state(status),step,path:`${path}?record=${encodeURIComponent(id)}`,time});
 const review:Schemas['User']['roles']=['REVIEWER','OPS_MANAGER'],growth:Schemas['User']['roles']=['MENTOR',...review],operate:Schemas['User']['roles']=['OPS_MANAGER','REWARD_OPERATOR'];
 source('现场成果签认',['MENTOR','OPS_MANAGER','STUDENT_ORGANIZER'],p=>client.call('listSubmissions',undefined,p),r=>r.sourceType==='ACTIVITY'&&r.status==='SUBMITTED'&&!r.factVerified&&r.applicantId!==user.id?{...item(r.id,'事实签认',r.applicantId,r.artifactId,r.status,'现场核对后签认','/activities/'),path:`/activities/?activityId=${encodeURIComponent(r.sourceId)}&submissionId=${encodeURIComponent(r.id)}`}:null);
 source('积分审批',review,p=>client.call('listApprovals',undefined,p),r=>pending(r.status)&&r.applicantId!==user.id?item(r.id,'积分审批',r.applicantId,r.sourceId,r.status,`${r.completedApprovers}/${r.requiredDistinctApprovers} 位独立审核`,'/approvals/'):null);
 source('成长权益',growth,p=>client.call('listAwardRequests',undefined,p),r=>pending(r.status)&&r.applicantId!==user.id&&!(user.id in r.targets)?item(r.id,'成长权益',r.applicantId,r.artifactId,r.status,`${r.completedApprovers}/${r.requiredDistinctApprovers} 位独立审核`,'/growth-approvals/'):null);
 source('会议贡献',growth,p=>client.call('listMeetingClaims',undefined,p),r=>r.status==='SUBMITTED'&&r.userId!==user.id?item(r.id,'会议贡献',r.userId,r.meetingId,r.status,'核对会议合并贡献','/meeting-approvals/'):null);
 source('入社申请',review,p=>client.call('listMembershipApplications',undefined,p),r=>r.status==='SUBMITTED'&&r.userId!==user.id?item(r.id,'入社申请',r.userId,r.statement,r.status,'独立核对入社资格','/memberships/'):null);
 source('转化核查',growth,p=>client.call('listConversionRequests',undefined,p),r=>pending(r.status)&&r.userId!==user.id?item(r.id,'转化核查',r.userId,r.description,r.status,`${r.completedApprovers}/2 位独立审核`,'/conversion-approvals/'):null);
 source('积分调整',review,p=>client.call('listPointAdjustments',undefined,p),r=>pending(r.status)&&r.creatorId!==user.id&&r.beneficiaryId!==user.id?item(r.id,'积分调整',r.beneficiaryId,r.reason,r.status,`${r.completedApprovers}/2 位独立审核`,'/point-adjustments/',r.createdAt):null);
 source('兑换履行',operate,p=>client.call('listStaffOrders',undefined,p),r=>['PREPARING','READY'].includes(r.status)?item(r.id,'兑换履行',r.userId,r.rewardNameSnapshot,r.status,r.status==='READY'?'核对凭证后确认领取':'核对库存后确认备货','/orders/',r.readyAt):null);
 source('服务履约',[...review,'REWARD_OPERATOR'],p=>client.call('listCommerceRequests',undefined,p),r=>((pending(r.status)&&hasRole(user,review)&&r.userId!==user.id&&!r.reviewHistory.some(h=>h.actorId===user.id&&h.action==='APPROVE'))||(['APPROVED','READY'].includes(r.status)&&hasRole(user,operate)))?item(r.id,'服务履约',r.userId,r.rewardName,r.status,pending(r.status)?'独立审核材料':'核对方案与履约条件','/commerce-requests/',r.readyAt):null);
 source('采购盘点',review,p=>client.call('listCommerceStockRequests',undefined,p),r=>pending(r.status)&&r.creatorId!==user.id?item(r.id,'采购盘点',r.creatorId,r.batchReference,r.status,`${r.completedApprovers}/2 位独立审核`,'/commerce-stock/'):null);
 source('质量退货',[...review,'REWARD_OPERATOR'],p=>client.call('listCommerceReturns',undefined,p),r=>((pending(r.status)&&hasRole(user,review)&&r.userId!==user.id)||(['APPROVED','QUARANTINED'].includes(r.status)&&hasRole(user,operate)))?item(r.id,'质量退货',r.userId,r.reason,r.status,r.status==='QUARANTINED'?'隔离实物质量检查':r.status==='APPROVED'?'确认退货实收':'独立审核退货材料','/commerce-returns/'):null);
 source('心愿阅评',['OPS_MANAGER'],p=>client.call('listCommerceWishes',undefined,p),r=>r.status==='SUBMITTED'?item(r.id,'心愿阅评',r.userId,r.title,r.status,'查看意向，不代表采购','/commerce-wishes/'):null);
 source('违规事项',growth,p=>client.call('listCases',undefined,p),r=>['OPEN','PARTIAL_APPROVAL'].includes(r.status)&&r.subjectId!==user.id?item(r.id,'违规事项',r.subjectId,r.description,r.status,'核对事实与回避','/appeals/',r.occurredAt):null);
 source('申诉复核',growth,p=>client.call('listAppeals',undefined,p),r=>['SUBMITTED','UNDER_REVIEW'].includes(r.status)&&r.userId!==user.id?item(r.id,'申诉复核',r.userId,r.reason,r.status,`${r.completedApprovers}/${r.requiredDistinctApprovers} 位独立复核`,'/appeals/',r.dueAt):null);
 if(!user.roles.includes('SYSTEM_ADMIN'))source('授权审核',['REVIEWER'],p=>client.call('listAccessRequests',undefined,p),r=>pending(r.status)&&r.targetId!==user.id&&r.requesterId!==user.id&&!r.decisionHistory.some(h=>h.actorId===user.id)?item(r.id,'授权审核',r.targetId,r.reason,r.status,`${r.completedApprovers}/2 位独立审核`,'/access/',r.createdAt):null);
 return result;
}
