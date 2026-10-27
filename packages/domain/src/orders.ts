import {createHmac,randomUUID} from 'node:crypto';
import {pool,rows,type Executor} from '../../db/src/client';
import {config} from '../../db/src/config';
import {actor,sha,type Actor} from './ledger';
import {command,fail,scoped,requireRole,audit,notify,assertWallet,appendLedger,type Context} from './commands';
import type {Schemas} from '../../sdk/src';
export type OrderRow={id:string;user_id:string;organization_id:string;reward_id:string;reward_name:string;quantity:number;total_points:number;status:Schemas['Order']['status'];site_id:string;ready_at:Date|null;expires_at:Date|null;version:number;request_id:string;credential_version:number};
type Stock={reward_id:string;site_id:string;organization_id:string;on_hand:number;reserved:number;quarantine:number;version:number};
type Lot={entry_id:string;available:number;reserved:number;expires_at:Date};
export const orderBody=(o:OrderRow):Schemas['Order']=>({id:o.id,userId:o.user_id,rewardId:o.reward_id,rewardNameSnapshot:o.reward_name,quantity:o.quantity,totalPoints:o.total_points,status:o.status,pickupSiteId:o.site_id,readyAt:o.ready_at?.toISOString()||null,expiresAt:o.expires_at?.toISOString()||null,version:o.version,requestId:o.request_id});
async function order(cx:Executor,u:Actor,id:string,lock=false){const[o]=await rows<OrderRow>(cx,'SELECT * FROM redemption_orders WHERE id=?'+(lock?' FOR UPDATE':''),[id]);if(!o||o.organization_id!==u.organization_id)fail('NOT_FOUND','订单不存在',404);return o;}
async function stock(cx:Executor,u:Actor,rewardId:string,siteId:string){const[s]=await rows<Stock>(cx,'SELECT * FROM inventory WHERE reward_id=? AND site_id=? FOR UPDATE',[rewardId,siteId]);if(!s||s.organization_id!==u.organization_id)fail('NOT_FOUND','奖励或领取点不可用',404);return s;}
async function staff(cx:Executor,u:Actor,siteId:string){requireRole(u,['OPS_MANAGER','REWARD_OPERATOR']);await scoped(cx,u,'PICKUP',siteId);}
async function movement(cx:Executor,ctx:Context,o:OrderRow,kind:string,onHand:number,reserved:number){await cx.execute('INSERT INTO inventory_movements(id,reward_id,site_id,order_id,kind,delta_on_hand,delta_reserved,actor_id,request_id) VALUES (?,?,?,?,?,?,?,?,?)',[randomUUID(),o.reward_id,o.site_id,o.id,kind,onHand,reserved,ctx.actorId,ctx.requestId]);}
export async function expireLots(cx:Executor,ctx:Context,userId:string,now=new Date()){
 const lots=await rows<Lot>(cx,'SELECT * FROM point_lots WHERE user_id=? AND available>0 AND expires_at<=? ORDER BY expires_at,entry_id FOR UPDATE',[userId,now]);
 for(const lot of lots){await appendLedger(cx,ctx,{userId,businessKey:'EXPIRE:'+lot.entry_id,kind:'EXPIRE',available:-lot.available,sourceType:'POINT_LOT',sourceId:lot.entry_id,reason:'原积分批次到期，成长里程保留'});await cx.execute('UPDATE point_lots SET expired=expired+available,available=0 WHERE entry_id=?',[lot.entry_id]);}
}
export async function releaseOrder(cx:Executor,ctx:Context,u:Actor,o:OrderRow,status:'CANCELLED'|'EXPIRED',now=new Date()){
 await assertWallet(cx,o.user_id);await stock(cx,u,o.reward_id,o.site_id);
 const allocations=await rows<{lot_id:string;points:number;expires_at:Date;root_entry_id:string|null}>(cx,'SELECT r.lot_id,r.points,l.expires_at,l.root_entry_id FROM order_reservations r JOIN point_lots l ON l.entry_id=r.lot_id WHERE r.order_id=? ORDER BY l.expires_at,l.entry_id',[o.id]);
 await appendLedger(cx,ctx,{userId:o.user_id,businessKey:'RELEASE:'+o.id,kind:'RELEASE',available:o.total_points,reserved:-o.total_points,sourceType:'ORDER',sourceId:o.id,reason:status==='EXPIRED'?'领取期限到期释放原批次':'本人取消，保留原批次期限'});
 let compensation=0;
 for(const lot of allocations){
  const expired=lot.expires_at<=now;
  await cx.execute('UPDATE point_lots SET reserved=reserved-?,available=available+?,expired=expired+?,transferred=transferred+? WHERE entry_id=?',[lot.points,expired?0:lot.points,expired?lot.points:0,expired?lot.points:0,lot.lot_id]);
  if(expired){
   compensation+=lot.points;
   // The aggregate RELEASE already changes the wallet. This zero-delta append
   // records a separate child lot for each origin, including repeated transfers.
   const child=await appendLedger(cx,ctx,{userId:o.user_id,businessKey:'COMPENSATE:'+o.id+':'+lot.lot_id,kind:'RELEASE',available:0,sourceType:'POINT_LOT',sourceId:lot.lot_id,reason:'原批次到期后转入7日补偿批次，继承原始成果，不新增成长或额外积分'});
   await cx.execute('INSERT INTO point_lots(entry_id,user_id,available,expires_at,parent_entry_id,root_entry_id) VALUES (?,?,?,?,?,?)',[child,o.user_id,lot.points,new Date(now.getTime()+7*86400000),lot.lot_id,lot.root_entry_id||lot.lot_id]);
  }
 }
 await cx.execute('UPDATE inventory SET reserved=reserved-?,version=version+1 WHERE reward_id=? AND site_id=?',[o.quantity,o.reward_id,o.site_id]);await movement(cx,ctx,o,'RELEASE',0,-o.quantity);
 await cx.execute('UPDATE redemption_orders SET status=?,version=version+1 WHERE id=?',[status,o.id]);await notify(cx,o.user_id,'ORDER_'+status,o.id,{message:compensation?'已释放；订单占用期间到期的批次按演示规则补偿7天':'已释放积分及库存，原积分有效期保留'});return orderBody(await order(cx,u,o.id));
}
async function credential(cx:Executor,u:Actor,token:string,now=new Date()){
 const[c]=await rows<{order_id:string;expires_at:Date;credential_version:number}>(cx,'SELECT * FROM pickup_credentials WHERE token_hash=?',[sha(token)]);if(!c)fail('INVALID_CREDENTIAL','领取码无效',404);
 const o=await order(cx,u,c.order_id);await staff(cx,u,o.site_id);
 if(c.credential_version!==o.credential_version)fail('STALE_CREDENTIAL','领取码已更换');if(c.expires_at<=now)fail('CREDENTIAL_EXPIRED','领取码已过期');return {c,o};
}
const previewAttempts=new Map<string,{count:number;until:number}>();
export async function orderRead(name:string,userId:string,params:Record<string,string>,query:Record<string,unknown>,audience:string):Promise<unknown>{
 if(!['listMyOrders','listStaffOrders','getOrder','listInventory'].includes(name))return undefined;
 const u=await actor(pool,userId);const limit=Number(query.limit||20),cursor=String(query.cursor||'');
 if(name==='getOrder'){const o=await order(pool,u,params.orderId);if(audience==='student'){if(o.user_id!==u.id)fail('NOT_FOUND','订单不存在',404);}else await staff(pool,u,o.site_id);return orderBody(o);}
 if(name==='listInventory'){requireRole(u,['OPS_MANAGER','REWARD_OPERATOR','AUDITOR']);const list=await rows<Stock>(pool,`SELECT i.* FROM inventory i WHERE organization_id=? AND reward_id>? AND EXISTS(SELECT 1 FROM role_scopes s WHERE s.user_id=? AND s.scope_type='PICKUP' AND s.scope_id IN (i.site_id,'*')) ORDER BY reward_id LIMIT ${limit+1}`,[u.organization_id,cursor,u.id]);return {items:list.slice(0,limit).map(s=>({rewardId:s.reward_id,siteId:s.site_id,onHand:s.on_hand,reserved:s.reserved,quarantine:s.quarantine,available:s.on_hand-s.reserved-s.quarantine,version:s.version,demoOnly:true})),nextCursor:list.length>limit?list[limit-1].reward_id:null};}
 if(name==='listStaffOrders')requireRole(u,['OPS_MANAGER','REWARD_OPERATOR']);
 const list=await rows<OrderRow>(pool,`SELECT o.* FROM redemption_orders o WHERE o.organization_id=? AND o.id>? AND ${name==='listMyOrders'?'o.user_id=?':"EXISTS(SELECT 1 FROM role_scopes s WHERE s.user_id=? AND s.scope_type='PICKUP' AND s.scope_id IN (o.site_id,'*'))"} ORDER BY o.id LIMIT ${limit+1}`,[u.organization_id,cursor,u.id]);return {items:list.slice(0,limit).map(orderBody),nextCursor:list.length>limit?list[limit-1].id:null};
}
export async function orderWrite(name:string,inputContext:Context,params:Record<string,string>,body:unknown,options:{failAfterReserve?:boolean;now?:Date}={}):Promise<unknown>{
 const ctx:Context={...inputContext,authorize:async(cx,u)=>{if(['markOrderReady','expireOrder','confirmPickup'].includes(name)){const id=name==='confirmPickup'?(body as Schemas['PickupConfirmRequest']).orderId:params.orderId;const o=await order(cx,u,id);await staff(cx,u,o.site_id);}}};
 const now=options.now||new Date();
 if(name==='createOrder')return command(ctx,name,body,['STUDENT'],async(cx,u)=>{
  const b=body as Schemas['OrderRequest'];const w=await assertWallet(cx,u.id);if(w.recovery_due||w.investigation_frozen_points)fail('RECOVERY_RESTRICTED','存在待处理追缴或调查，请先联系审核员');
  await expireLots(cx,ctx,u.id,now);const current=await assertWallet(cx,u.id);
  const[r]=await rows<{body:Schemas['Reward']}>(cx,'SELECT body FROM rewards WHERE id=?',[b.rewardId]);if(!r)fail('NOT_FOUND','奖励不存在',404);
  if(r.body.version!==b.expectedRewardVersion)fail('VERSION_CONFLICT','奖励信息已更新');
  if(r.body.kind!=='physical'||r.body.requiresApproval||b.serviceSlotId)fail('SPECIAL_APPLICATION_REQUIRED','此奖励需要专项申请或服务预约，不能直接实物兑换',422);
  const s=await stock(cx,u,b.rewardId,b.pickupSiteId);const total=r.body.pointsRequired*b.quantity;
  if(current.available_points<total)fail('INSUFFICIENT_POINTS','可用木能量不足');if(s.on_hand-s.reserved-s.quarantine<b.quantity)fail('OUT_OF_STOCK','模拟库存不足');
  if((await rows(cx,"SELECT id FROM redemption_orders WHERE user_id=? AND reward_id=? AND status IN ('PREPARING','READY')",[u.id,b.rewardId])).length)fail('ACTIVE_ORDER_EXISTS','该奖励已有待处理订单，请从订单页继续');
  const id=randomUUID();await cx.execute('INSERT INTO redemption_orders(id,user_id,organization_id,reward_id,reward_name,quantity,total_points,status,site_id,request_id) VALUES (?,?,?,?,?,?,?,?,?,?)',[id,u.id,u.organization_id,b.rewardId,r.body.name,b.quantity,total,'PREPARING',b.pickupSiteId,ctx.requestId]);
  const lots=await rows<Lot>(cx,'SELECT * FROM point_lots WHERE user_id=? AND available>0 AND expires_at>? ORDER BY expires_at,entry_id FOR UPDATE',[u.id,now]);let remaining=total;
  for(const lot of lots){const take=Math.min(remaining,lot.available);await cx.execute('INSERT INTO order_reservations(order_id,lot_id,points) VALUES (?,?,?)',[id,lot.entry_id,take]);await cx.execute('UPDATE point_lots SET available=available-?,reserved=reserved+? WHERE entry_id=?',[take,take,lot.entry_id]);remaining-=take;if(!remaining)break;}
  if(remaining)fail('PROJECTION_MISMATCH','积分批次与余额不一致');
  await appendLedger(cx,ctx,{userId:u.id,businessKey:'RESERVE:'+id,kind:'RESERVE',available:-total,reserved:total,sourceType:'ORDER',sourceId:id,reason:'兑换预占，交付前不消费，成长保留'});
  if(options.failAfterReserve)throw new Error('INJECTED_ORDER_TRANSACTION_FAILURE');
  await cx.execute('UPDATE inventory SET reserved=reserved+?,version=version+1 WHERE reward_id=? AND site_id=?',[b.quantity,b.rewardId,b.pickupSiteId]);const o=await order(cx,u,id);await movement(cx,ctx,o,'RESERVE',0,b.quantity);await notify(cx,u.id,'ORDER_PREPARING',id,{message:'兑换已预占，等待备货'});return orderBody(o);
 });
 if(name==='markOrderReady')return command(ctx,name,{params,body},['OPS_MANAGER','REWARD_OPERATOR'],async(cx,u)=>{
  const o=await order(cx,u,params.orderId,true);await staff(cx,u,o.site_id);if(o.version!==(body as Schemas['VersionRequest']).expectedVersion)fail('VERSION_CONFLICT','订单已更新');if(o.status!=='PREPARING')fail('INVALID_STATE','只能将备货订单设为待领取');
  await cx.execute("UPDATE redemption_orders SET status='READY',ready_at=?,expires_at=?,version=version+1 WHERE id=?",[now,new Date(now.getTime()+7*86400000),o.id]);await audit(cx,ctx,'ORDER_READY',o.id);await notify(cx,o.user_id,'ORDER_READY',o.id,{message:'已备货，请在7天内到指定领取点领取'});return orderBody(await order(cx,u,o.id));
 });
 if(name==='cancelOrder'||name==='expireOrder')return command(ctx,name,{params,body},name==='cancelOrder'?['STUDENT']:['OPS_MANAGER','REWARD_OPERATOR'],async(cx,u)=>{
  const o=await order(cx,u,params.orderId,true);if(name==='cancelOrder'){if(o.user_id!==u.id)fail('NOT_FOUND','订单不存在',404);}else await staff(cx,u,o.site_id);
  if(o.version!==(body as Schemas['VersionRequest']).expectedVersion)fail('VERSION_CONFLICT','订单已更新');if(!['PREPARING','READY'].includes(o.status))fail('INVALID_STATE','订单已经终结');
  if(name==='expireOrder'&&(!o.expires_at||o.expires_at>now))fail('NOT_EXPIRED','未到领取截止时间');return releaseOrder(cx,ctx,u,o,name==='cancelOrder'?'CANCELLED':'EXPIRED',now);
 });
 if(name==='issuePickupCredential'){
  const token=createHmac('sha256',config().dbPassword).update(name+ctx.actorId+ctx.key+params.orderId).digest('hex');
  const result=await command(ctx,name,{params,body},['STUDENT'],async(cx,u)=>{const o=await order(cx,u,params.orderId,true);if(o.user_id!==u.id)fail('NOT_FOUND','订单不存在',404);if(o.status!=='READY'||!o.expires_at||o.expires_at<=now)fail('NOT_READY','订单尚未备妥或已超期');const expires=new Date(Math.min(now.getTime()+10*60000,o.expires_at.getTime()));const next=o.credential_version+1;await cx.execute('UPDATE redemption_orders SET credential_version=? WHERE id=?',[next,o.id]);await cx.execute('INSERT INTO pickup_credentials(token_hash,order_id,expires_at,credential_version) VALUES (?,?,?,?)',[sha(token),o.id,expires,next]);await audit(cx,ctx,'ISSUE_PICKUP_CREDENTIAL',o.id);return {orderId:o.id,expiresAt:expires.toISOString()};});return {...result,token,displayCode:token};
 }
 if(name==='previewPickup'){
  for(const[k,v]of previewAttempts)if(v.until<now.getTime())previewAttempts.delete(k);const v=previewAttempts.get(ctx.actorId)||{count:0,until:now.getTime()+60000};v.count++;previewAttempts.set(ctx.actorId,v);if(v.count>60)fail('RATE_LIMITED','领取码尝试过多，请稍后重试',429);
  const u=await actor(pool,ctx.actorId);const{o}=await credential(pool,u,(body as Schemas['PreviewRequest']).token,now);return {orderId:o.id,rewardName:o.reward_name,quantity:o.quantity,maskedDisplayName:'本人领取 · '+o.user_id.slice(-4),siteId:o.site_id,status:o.status,version:o.version,eligible:o.status==='READY'&&!!o.expires_at&&o.expires_at>now};
 }
 if(name==='confirmPickup')return command(ctx,name,body,['OPS_MANAGER','REWARD_OPERATOR'],async(cx,u)=>{
  const b=body as Schemas['PickupConfirmRequest'];const found=await credential(cx,u,b.token,now);if(found.o.id!==b.orderId)fail('INVALID_CREDENTIAL','领取码与订单不匹配');const o=await order(cx,u,b.orderId,true);
  if(o.credential_version!==found.c.credential_version)fail('STALE_CREDENTIAL','领取码已更换');
  if(o.status==='FULFILLED')return orderBody(o);if(o.status!=='READY'||!o.expires_at||o.expires_at<=now)fail('INVALID_STATE','订单不能核销');if(o.version!==b.expectedVersion)fail('VERSION_CONFLICT','订单状态已更新');
  await assertWallet(cx,o.user_id);await stock(cx,u,o.reward_id,o.site_id);
  const allocations=await rows<{lot_id:string;points:number}>(cx,'SELECT lot_id,points FROM order_reservations WHERE order_id=? ORDER BY lot_id',[o.id]);for(const lot of allocations)await cx.execute('UPDATE point_lots SET reserved=reserved-?,consumed=consumed+? WHERE entry_id=?',[lot.points,lot.points,lot.lot_id]);
  await appendLedger(cx,ctx,{userId:o.user_id,businessKey:'SPEND:'+o.id,kind:'SPEND',available:0,reserved:-o.total_points,sourceType:'ORDER',sourceId:o.id,reason:'本人领取确认，消费预占积分，成长保留'});
  await cx.execute('UPDATE inventory SET on_hand=on_hand-?,reserved=reserved-?,version=version+1 WHERE reward_id=? AND site_id=?',[o.quantity,o.quantity,o.reward_id,o.site_id]);await movement(cx,ctx,o,'FULFILL',-o.quantity,-o.quantity);await cx.execute("UPDATE redemption_orders SET status='FULFILLED',version=version+1 WHERE id=?",[o.id]);await notify(cx,o.user_id,'ORDER_FULFILLED',o.id,{message:'本人领取已确认'});return orderBody(await order(cx,u,o.id));
 });
 return undefined;
}
