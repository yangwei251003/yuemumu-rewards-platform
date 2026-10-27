import {reportingWorker} from './reporting';
import {reconciliationTick} from './reconciliation-alerts';
import {commerceTick} from './commerce';
import {caseReviewWorker} from './governance';
import {randomUUID} from 'node:crypto';
import {pool,rows,transaction,type Executor} from '../../db/src/client';
import {actor,sha} from './ledger';
import {command,requireRole,scoped,fail,notify,assertWallet,type Context} from './commands';
import {expireLots,releaseOrder,type OrderRow} from './orders';
import type {Schemas} from '../../sdk/src';
type NotificationRow={id:string;user_id:string;event_type:string;resource_id:string;message:string;read_at:Date|null;created_at:Date};
type SampleRow={id:string;organization_id:string;month:string;seed:string;population:string[];selected:string[];high_risk:string[];created_at:Date};
const notificationBody=(n:NotificationRow):Schemas['Notification']=>({id:n.id,eventType:n.event_type,resourceId:n.resource_id,message:n.message,readAt:n.read_at?.toISOString()||null,createdAt:n.created_at.toISOString()});
const sampleBody=(s:SampleRow):Schemas['AuditSample']=>({id:s.id,month:s.month,seed:s.seed,population:s.population,selected:s.selected,highRisk:s.high_risk,createdAt:s.created_at.toISOString()});
export function selectSample(population:string[],seed:string){return [...population].sort((a,b)=>sha(seed+':'+a).localeCompare(sha(seed+':'+b))).slice(0,Math.ceil(population.length/10));}
export async function operationsRead(name:string,userId:string,query:Record<string,unknown>):Promise<unknown>{
 if(!['listNotifications','listAuditSamples'].includes(name))return undefined;
 const u=await actor(pool,userId),limit=Number(query.limit||20),cursor=String(query.cursor||'');
 if(name==='listNotifications'){const list=await rows<NotificationRow>(pool,`SELECT * FROM notifications WHERE user_id=? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.id,cursor]);return {items:list.slice(0,limit).map(notificationBody),nextCursor:list.length>limit?list[limit-1].id:null};}
 requireRole(u,['AUDITOR']);await scoped(pool,u,'AUDIT',u.organization_id);const list=await rows<SampleRow>(pool,`SELECT * FROM audit_samples WHERE organization_id=? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.organization_id,cursor]);return {items:list.slice(0,limit).map(sampleBody),nextCursor:list.length>limit?list[limit-1].id:null};
}
export async function operationsWrite(name:string,inputContext:Context,params:Record<string,string>,body:unknown):Promise<unknown>{
 const ctx:Context={...inputContext,authorize:async(cx,u)=>{if(name==='createAuditSample')await scoped(cx,u,'AUDIT',u.organization_id);}};
 if(name==='readNotification')return command(ctx,name,{params,body},['STUDENT','MENTOR','REVIEWER','OPS_MANAGER','AUDITOR','REWARD_OPERATOR','SYSTEM_ADMIN','STUDENT_ORGANIZER'],async(cx,u)=>{
  const[n]=await rows<NotificationRow>(cx,'SELECT * FROM notifications WHERE id=? AND user_id=?',[params.notificationId,u.id]);if(!n)fail('NOT_FOUND','通知不存在',404);await cx.execute('UPDATE notifications SET read_at=COALESCE(read_at,UTC_TIMESTAMP(3)) WHERE id=?',[n.id]);return notificationBody((await rows<NotificationRow>(cx,'SELECT * FROM notifications WHERE id=?',[n.id]))[0]);
 });
 if(name==='createAuditSample')return command(ctx,name,body,['AUDITOR'],async(cx,u)=>{
  const b=body as Schemas['AuditSampleRequest'];const [year,month]=b.month.split('-').map(Number),start=new Date(Date.UTC(year,month-1,1)-8*3600000),end=new Date(Date.UTC(year,month,1)-8*3600000);
  const records=await rows<{id:string;source_type:string;delta_available:number}>(cx,'SELECT l.id,l.source_type,l.delta_available FROM ledger_entries l JOIN users u ON u.id=l.user_id WHERE u.organization_id=? AND l.created_at>=? AND l.created_at<? ORDER BY l.id',[u.organization_id,start,end]);const high=records.filter(r=>['COMPETITION','PROJECT_STAGE','APPROVED_SOURCE'].includes(r.source_type)||Math.abs(r.delta_available)>300).map(r=>r.id),highSet=new Set(high),population=records.filter(r=>!highSet.has(r.id)).map(r=>r.id);const selected=[...selectSample(population,b.seed),...high].sort();const id=randomUUID();await cx.execute('INSERT INTO audit_samples(id,organization_id,month,seed,population,selected,high_risk,actor_id) VALUES (?,?,?,?,?,?,?,?)',[id,u.organization_id,b.month,b.seed,JSON.stringify(population),JSON.stringify(selected),JSON.stringify(high),u.id]);return sampleBody((await rows<SampleRow>(cx,'SELECT * FROM audit_samples WHERE id=?',[id]))[0]);
 });return undefined;
}
export async function deliverOutbox(cx:Executor,now:Date,limit=100){
 const events=await rows<{id:string;user_id:string;event_type:string;resource_id:string;payload:{message?:string}}>(cx,`SELECT * FROM outbox_events WHERE delivered_at IS NULL ORDER BY created_at,id LIMIT ${limit} FOR UPDATE SKIP LOCKED`);
 for(const e of events){await cx.execute('INSERT IGNORE INTO notifications(id,user_id,event_type,resource_id,message) VALUES (?,?,?,?,?)',[e.id,e.user_id,e.event_type,e.resource_id,(e.payload.message||e.event_type).slice(0,2000)]);await cx.execute('UPDATE outbox_events SET delivered_at=? WHERE id=?',[now,e.id]);}return events.length;
}
export async function workerTick(now=new Date()){
 await reconciliationTick(now);
 const delivered=await transaction(cx=>deliverOutbox(cx,now));
 const expired=await rows<OrderRow>(pool,"SELECT * FROM redemption_orders WHERE status='READY' AND expires_at<=? ORDER BY expires_at,id LIMIT 25",[now]);
 for(const candidate of expired)await transaction(async cx=>{const[o]=await rows<OrderRow>(cx,'SELECT * FROM redemption_orders WHERE id=? FOR UPDATE',[candidate.id]);if(o.status!=='READY'||!o.expires_at||o.expires_at>now)return;const u=await actor(cx,o.user_id);await releaseOrder(cx,{actorId:'SYSTEM_WORKER',requestId:randomUUID(),key:'AUTO_EXPIRE:'+o.id},u,o,'EXPIRED',now);});
 const owners=await rows<{user_id:string}>(pool,'SELECT DISTINCT user_id FROM point_lots WHERE available>0 AND expires_at<=? LIMIT 25',[now]);for(const owner of owners)await transaction(async cx=>{await assertWallet(cx,owner.user_id);await expireLots(cx,{actorId:'SYSTEM_WORKER',requestId:randomUUID(),key:'AUTO_EXPIRE_LOTS'},owner.user_id,now);});
 const overdue=await rows<{id:string;user_id:string}>(pool,"SELECT id,user_id FROM appeals WHERE status IN ('SUBMITTED','UNDER_REVIEW') AND due_at<? LIMIT 100",[now]);for(const a of overdue)await notify(pool,a.user_id,'APPEAL_OVERDUE',a.id,{message:'申诉处理已超目标时间，已提醒复核；不会自动判输'});
 await reportingWorker(now);
 await commerceTick(now);
 await caseReviewWorker(now);
 return {delivered,expiredCandidates:expired.length,expiredLotOwners:owners.length,overdueAppeals:overdue.length};
}
export function startWorker(){let busy=false;const timer=setInterval(()=>{if(busy)return;busy=true;workerTick().catch(e=>console.error(JSON.stringify({event:'worker_failure',code:(e as {code?:string}).code||'INTERNAL'}))).finally(()=>{busy=false;});},2000);timer.unref();return timer;}
