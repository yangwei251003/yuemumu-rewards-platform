import {fail} from './commands';
export type MemberShare={userId:string;basisPoints:number};
export function allocate(total:number,members:MemberShare[]):Record<string,number>{
 if(!Number.isSafeInteger(total)||total<0||members.length<1||members.length>30||new Set(members.map(m=>m.userId)).size!==members.length||members.some(m=>!Number.isInteger(m.basisPoints)||m.basisPoints<=0||m.basisPoints>10000)||members.reduce((s,m)=>s+m.basisPoints,0)!==10000)fail('INVALID_ALLOCATION','分配成员唯一、比例为正整数且合计10000基点',422);
 const parts=members.map(m=>({id:m.userId,points:Math.floor(total*m.basisPoints/10000),remainder:(total*m.basisPoints)%10000})).sort((a,b)=>b.remainder-a.remainder||(a.id<b.id?-1:a.id>b.id?1:0));
 const remaining=total-parts.reduce((s,p)=>s+p.points,0);for(let i=0;i<remaining;i++)parts[i].points++;
 return Object.fromEntries(parts.map(p=>[p.id,p.points]));
}
export function projectTargets(pool:number,stage:number,members:MemberShare[],paidAnchor:Record<string,number>){
 if(![1,2,3,4].includes(stage))fail('INVALID_STAGE','里程碑必须按1至4顺序推进',422);
 const cumulative=Math.floor(pool*[0,1000,3500,6000,10000][stage]/10000),paid=Object.values(paidAnchor).reduce((a,b)=>a+b,0);if(cumulative<paid)fail('INVALID_STAGE','累计目标低于既有合法成果');
 const newlyAllocated=allocate(cumulative-paid,members),targets={...paidAnchor};for(const [id,points]of Object.entries(newlyAllocated))targets[id]=(targets[id]||0)+points;return targets;
}
const awardTable:Record<string,number[]>={SCHOOL:[50,80,120,180,250],CITY:[50,150,250,350,500],PROVINCE:[50,300,500,700,1000],NATIONAL:[50,600,1000,1500,2500],INTERNATIONAL:[50,1000,1600,2500,3500]};
export function competitionTargets(level:string,rank:number,members:{userId:string;coefficientBasisPoints:number}[]){
 const base=rank===-1&&awardTable[level]?0:awardTable[level]?.[rank];if(base===undefined||!members.length||members.length>30||new Set(members.map(m=>m.userId)).size!==members.length||members.some(m=>![10000,8000,6000,4000,3000,2000].includes(m.coefficientBasisPoints)))fail('INVALID_COMPETITION','赛级、奖项或成员系数无效',422);
 const weight=members.reduce((n,m)=>n+m.coefficientBasisPoints,0),denominator=Math.max(10000,Math.ceil(weight/4));const targetTotal=Math.floor(base*weight/denominator);
 const parts=members.map(m=>({id:m.userId,points:Math.floor(base*m.coefficientBasisPoints/denominator),remainder:(base*m.coefficientBasisPoints)%denominator})).sort((a,b)=>b.remainder-a.remainder||(a.id<b.id?-1:1));const remaining=targetTotal-parts.reduce((n,p)=>n+p.points,0);for(let i=0;i<remaining;i++)parts[i].points++;
 return Object.fromEntries(parts.map(p=>[p.id,p.points]));
}
