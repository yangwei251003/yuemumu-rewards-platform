import {pool,rows,transaction,type Executor} from '../../db/src/client';
import {sha} from './ledger';

type Totals={availablePoints:number;frozenPoints:number;growthMileage:number;recoveryDue:number};
type LotTotals=Omit<Totals,'growthMileage'>;
export type ReconciliationFinding={userId:string;matches:boolean;ledger:Totals;wallet:Totals|null;lots:LotTotals;alertId:string|null};
type Options={cursor?:string;limit?:number;organizationId?:string;userId?:string};
const eventType='RECONCILIATION_MISMATCH';
// SHA-derived UUID-shaped ids fit both 36- and 64-character event projections.
function stableId(value:string){const h=sha(value);return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;}
async function inspect(cx:Executor,userId:string):Promise<ReconciliationFinding|null>{
 const[u]=await rows<{id:string;organization_id:string;demo_only:number}>(cx,'SELECT id,organization_id,demo_only FROM users WHERE id=?',[userId]);
 if(!u?.demo_only)return null;
 // Existing domain writers serialize on this wallet too. Read all three views
 // under the same lock, so an in-flight legal earning/reservation is not an alarm.
 const[w]=await rows<{available_points:number;frozen_points:number;growth_mileage:number;recovery_due:number}>(cx,'SELECT available_points,frozen_points,growth_mileage,recovery_due FROM wallets WHERE user_id=? FOR UPDATE',[userId]);
 const[l]=await rows<{a:string;f:string;g:string;r:string}>(cx,'SELECT COALESCE(SUM(delta_available),0) a,COALESCE(SUM(delta_reserved),0) f,COALESCE(SUM(delta_growth),0) g,COALESCE(SUM(delta_recovery),0) r FROM ledger_entries WHERE user_id=?',[userId]);
 const[p]=await rows<{a:string;f:string;r:string}>(cx,'SELECT COALESCE(SUM(available),0) a,COALESCE(SUM(reserved),0) f,COALESCE(SUM(consumed_revoked-recovery_settled),0) r FROM point_lots WHERE user_id=?',[userId]);
 const ledger:Totals={availablePoints:Number(l.a),frozenPoints:Number(l.f),growthMileage:Number(l.g),recoveryDue:Number(l.r)};
 const wallet:Totals|null=w?{availablePoints:w.available_points,frozenPoints:w.frozen_points,growthMileage:w.growth_mileage,recoveryDue:w.recovery_due}:null;
 const lots:LotTotals={availablePoints:Number(p.a),frozenPoints:Number(p.f),recoveryDue:Number(p.r)};
 const matches=wallet!==null&&JSON.stringify(ledger)===JSON.stringify(wallet)&&ledger.availablePoints===lots.availablePoints&&ledger.frozenPoints===lots.frozenPoints&&ledger.recoveryDue===lots.recoveryDue;
 if(matches)return {userId,matches,ledger,wallet,lots,alertId:null};
 const alertId=stableId(JSON.stringify({organizationId:u.organization_id,userId,ledger,wallet,lots}));
 await cx.execute('INSERT IGNORE INTO audit_events(id,actor_id,action,resource_id,request_id) VALUES (?,\'SYSTEM_WORKER\',?,?,?)',[alertId,eventType,userId,alertId]);
 const recipients=await rows<{id:string}>(cx,`SELECT u.id FROM users u WHERE u.organization_id=? AND u.active=TRUE AND u.demo_only=TRUE AND JSON_CONTAINS(u.roles,'"AUDITOR"') AND NOT JSON_CONTAINS(u.roles,'"SYSTEM_ADMIN"') AND EXISTS(SELECT 1 FROM role_scopes s WHERE s.user_id=u.id AND s.scope_type='AUDIT' AND s.scope_id IN (u.organization_id,'*')) ORDER BY u.id`,[u.organization_id]);
 // No student identity, points, evidence, or mismatch totals enter notifications.
 // The opaque resource links to the durable audit event for authorized local review.
 for(const recipient of recipients)await cx.execute('INSERT IGNORE INTO outbox_events(id,user_id,event_type,resource_id,payload) VALUES (?,?,?,?,?)',[stableId(alertId+':'+recipient.id),recipient.id,eventType,alertId,JSON.stringify({message:'本组织发现积分投影不一致。请由有审计权限的人员核验对账报告，暂停相关危险写入；本检查没有改写余额或账本。'})]);
 return {userId,matches,ledger,wallet,lots,alertId};
}

/** Local operational entry only; not an unscoped HTTP route. Each invocation has
 * bounded work and only selects DB-marked fictional identities. An unchanged
 * mismatch has one persistent audit fingerprint, even after process restart.
 * Restoring a healthy projection does not clear or rewrite its earlier audit. */
export async function checkReconciliationPage(options:Options={}){
 const limit=options.limit??25;if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('RECONCILIATION_LIMIT_MUST_BE_1_TO_100');
 const conditions=['demo_only=TRUE','id>?'],params:(string|number)[]=[options.cursor||''];
 if(options.organizationId){conditions.push('organization_id=?');params.push(options.organizationId);}
 if(options.userId){conditions.push('id=?');params.push(options.userId);}
 const users=await rows<{id:string}>(pool,`SELECT id FROM users WHERE ${conditions.join(' AND ')} ORDER BY id LIMIT ${limit+1}`,params);
 const findings:ReconciliationFinding[]=[];for(const u of users.slice(0,limit)){const finding=await transaction(cx=>inspect(cx,u.id));if(finding)findings.push(finding);}
 return {checked:findings.length,mismatches:findings.filter(f=>!f.matches).length,nextCursor:users.length>limit?users[limit-1].id:null,findings};
}

let nextAt=0,cursor='';
/** 25 users per 60 seconds, continuing rather than restarting at the first page.
 * Failed pages keep their cursor and propagate; the next 60-second tick retries. */
export async function reconciliationTick(now=new Date()){
 if(now.getTime()<nextAt)return null;nextAt=now.getTime()+60000;
 const result=await checkReconciliationPage({cursor,limit:25});cursor=result.nextCursor||'';return result;
}
