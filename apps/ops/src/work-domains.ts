import type {Schemas} from '@ymm/sdk';
type Role=Schemas['User']['roles'][number];
const teaching:Role[]=['MENTOR','REVIEWER','OPS_MANAGER'];
const review:Role[]=['REVIEWER','OPS_MANAGER'];
const commerce:Role[]=['OPS_MANAGER','REWARD_OPERATOR','REVIEWER','AUDITOR'];
export const workDomains=[
 {name:'今日工作',paths:['/','/notifications/']},
 {name:'教学活动',paths:['/activities/','/meetings/','/learning/','/tasks/']},
 {name:'项目竞赛',paths:['/projects/','/recruitments/','/competitions/']},
 {name:'审核中心',paths:['/approvals/','/growth-approvals/','/meeting-approvals/','/conversion-approvals/','/memberships/','/point-adjustments/','/appeals/']},
 {name:'奖励服务',paths:['/rewards/','/orders/','/inventory/','/pickup/','/commerce-resources/','/commerce-requests/','/commerce-stock/','/commerce-returns/','/commerce-wishes/']},
 {name:'运营设置',paths:['/reports/','/reporting/','/data-tools/','/runtime/','/access/','/settings/']}
];
const rolesByPath:Record<string,Role[]>={
 '/meetings/':[...teaching,'STUDENT_ORGANIZER'],'/learning/':teaching,'/tasks/':teaching,'/projects/':teaching,'/recruitments/':['OPS_MANAGER'],
 '/approvals/':review,'/growth-approvals/':[...teaching,'AUDITOR'],'/meeting-approvals/':[...teaching,'STUDENT_ORGANIZER'],'/conversion-approvals/':[...teaching,'AUDITOR'],'/memberships/':review,'/point-adjustments/':[...teaching,'AUDITOR'],'/appeals/':[...teaching,'AUDITOR'],
 '/orders/':['OPS_MANAGER','REWARD_OPERATOR'],'/pickup/':['OPS_MANAGER','REWARD_OPERATOR'],'/inventory/':['OPS_MANAGER','REWARD_OPERATOR','AUDITOR'],
 '/commerce-resources/':commerce,'/commerce-requests/':commerce,'/commerce-stock/':commerce,'/commerce-returns/':commerce,'/commerce-wishes/':['OPS_MANAGER'],
 '/reports/':['AUDITOR'],'/reporting/':['OPS_MANAGER','AUDITOR'],'/data-tools/':['OPS_MANAGER','AUDITOR'],'/access/':['SYSTEM_ADMIN','REVIEWER']
};
export function visibleModule(path:string,user:Schemas['User']|null){return !!user&&(!rolesByPath[path]||rolesByPath[path].some(r=>user.roles.includes(r)));}
export function domainFor(path:string){return workDomains.find(g=>g.paths.includes(path==='/'?'/':path.replace(/\/$/,'')+'/'))?.name;}
