import {commerceRead,commerceWrite} from '../../../packages/domain/src/commerce';
import {studentPracticeFeed} from '../../../packages/domain/src/practice';
import {conversionRead,conversionWrite} from '../../../packages/domain/src/conversion';
import {adjustmentsRead,adjustmentsWrite} from '../../../packages/domain/src/adjustments';
import {accessRead,accessWrite} from '../../../packages/domain/src/access-management';
import {reportingRead,reportingWrite} from '../../../packages/domain/src/reporting';
import {meetingRead,meetingWrite} from '../../../packages/domain/src/meetings';
import {pendingPoints} from '../../../packages/domain/src/passive';
import {managementRead,managementWrite} from '../../../packages/domain/src/management';
import 'reflect-metadata';
import {All,Controller,Module,Req,Res,Catch,ArgumentsHost,HttpException,ExceptionFilter} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {json,type Request,type Response} from 'express';
import {fileRead,fileWrite} from '../../../packages/domain/src/files';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual} from 'node:crypto';
import {eq} from 'drizzle-orm';
import {pool,db,rows,transaction} from '../../../packages/db/src/client';
import {users} from '../../../packages/db/src/schema';
import {config} from '../../../packages/db/src/config';
import {sha,DomainError,type LedgerRow} from '../../../packages/domain/src/ledger';
import {activityRead,activityWrite} from '../../../packages/domain/src/activities';
import {orderRead,orderWrite} from '../../../packages/domain/src/orders';
import {growthRead,growthWrite} from '../../../packages/domain/src/growth';
import {governanceRead,governanceWrite} from '../../../packages/domain/src/governance';
import {operationsRead,operationsWrite,startWorker} from '../../../packages/domain/src/operations';
import type {Schemas} from '../../../packages/sdk/src';
import {contract,contractHash,matchOperation,validators,compile,type Operation} from './contracts';
const c=config();const random=()=>randomBytes(32).toString('hex');
const safeEqual=(a:string,b:string)=>timingSafeEqual(Buffer.from(sha(a),'hex'),Buffer.from(sha(b),'hex'));
type User=typeof users.$inferSelect;
type SessionRow={token_hash:string;user_id:string;audience:'student'|'staff';csrf_token:string;expires_at:Date};
const publicUser=(u:User):Schemas['User']=>({id:u.id,displayName:u.displayName,roles:u.roles as Schemas['User']['roles'],membershipStatus:u.membershipStatus as Schemas['User']['membershipStatus'],demoOnly:u.demoOnly});
async function findUser(id:string){return(await db.select().from(users).where(eq(users.id,id)))[0];}
function cookieToken(req:Request,audience:string){const value=req.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith(c.cookiePrefix+'_'+audience+'='));return value?.slice(value.indexOf('=')+1);}
async function authenticate(req:Request,audience:string){
 if(req.headers.authorization&&!/^Bearer [a-f0-9]{64}$/.test(req.headers.authorization))throw new DomainError(403,'INVALID_AUTHORIZATION','不支持的授权凭证');
 const token=req.headers.authorization?.startsWith('Bearer ')?req.headers.authorization.slice(7):cookieToken(req,audience);
 if(!token)throw new DomainError(401,'UNAUTHENTICATED','请先登录');
 const [s]=await rows<SessionRow>(pool,'SELECT * FROM sessions WHERE token_hash=? AND audience=? AND expires_at>UTC_TIMESTAMP(3)',[sha(token),audience]);
 if(!s)throw new DomainError(401,'SESSION_EXPIRED','会话已过期，请重新登录');
 const u=await findUser(s.user_id);if(!u||!u.active)throw new DomainError(403,'FORBIDDEN','身份已停用');
 if(audience==='student'&&!u.roles.includes('STUDENT'))throw new DomainError(403,'FORBIDDEN','学生角色已撤销');
 if(audience==='staff'&&!u.roles.some(r=>r!=='STUDENT'))throw new DomainError(403,'FORBIDDEN','职员角色已撤销');
 return {s,u,bearer:!!req.headers.authorization};
}
function sessionBody(u:User,s:SessionRow,requestId:string,accessToken:string|null=null):Schemas['Session']{return {user:publicUser(u),audience:s.audience,expiresAt:s.expires_at.toISOString(),requestId,csrfToken:s.csrf_token,accessToken};}
const attempts=new Map<string,{count:number;until:number}>();
function limitLogin(ip:string){const now=Date.now();for(const[k,v]of attempts)if(v.until<now)attempts.delete(k);const v=attempts.get(ip)||{count:0,until:now+60000};v.count++;attempts.set(ip,v);if(v.count>30)throw new DomainError(429,'RATE_LIMITED','登录尝试过多，请稍后重试');}
function checkOrigin(req:Request){if(req.headers.origin&&!['http://127.0.0.1:'+c.gatewayPort,'http://localhost:'+c.gatewayPort].includes(req.headers.origin))throw new DomainError(403,'ORIGIN_REJECTED','请求来源不受信任');}
function validateRequest(req:Request,op:Operation,params:Record<string,string>){
 const allowedQueries=new Set((op.parameters||[]).filter(p=>p.in==='query').map(p=>p.name));
 for(const key of Object.keys(req.query))if(!allowedQueries.has(key))throw new DomainError(422,'INVALID_QUERY','不支持的查询字段');
 for(let parameter of op.parameters||[]){
  if(parameter.$ref)parameter=contract.components.parameters[parameter.$ref.split('/').pop()!];
  let value:unknown=parameter.in==='header'?req.get(parameter.name):parameter.in==='query'?req.query[parameter.name]:params[parameter.name];
  if(value===undefined){if(parameter.required)throw new DomainError(422,'INVALID_PARAMETER','缺少参数 '+parameter.name);continue;}
  if(parameter.schema.type==='integer'&&typeof value==='string'&&/^\d+$/.test(value))value=Number(value);
  if(!compile(parameter.schema)(value))throw new DomainError(422,'INVALID_PARAMETER','参数无效 '+parameter.name);
 }
 const validate=validators.get(op.operationId)!.body;if(validate&&!validate(req.body))throw new DomainError(422,'INVALID_BODY','请求字段不符合接口合同');
}
@Controller('api/v1')
class ApiController {
 @All('{*path}') async handle(@Req()req:Request,@Res()res:Response){
  const requestId=randomUUID();res.setHeader('X-Request-ID',requestId);res.setHeader('X-Instance-ID',c.cookiePrefix);res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  try{
   const found=matchOperation(req.method,req.path.replace(/^\/api\/v1/,'')||'/health');
   if(!found)throw new DomainError(404,'NOT_FOUND','接口不存在');
   const {op,params}=found;
   if(op['x-capability-status']==='DRAFT_NOT_IMPLEMENTED')throw new DomainError(503,'CAPABILITY_NOT_IMPLEMENTED','此功能尚未实现，请等待后续交付');
   validateRequest(req,op,params);
   const data=await this.execute(req,res,op,params,requestId);
   if(!validators.get(op.operationId)!.response(data))throw new Error('RESPONSE_CONTRACT_VIOLATION:'+op.operationId);
   res.status(200).json(data);
  }catch(error){
   const known=error instanceof DomainError;const status=known?error.status:503;
   if(!known)console.error(JSON.stringify({requestId,event:'dependency_or_contract_failure',code:(error as {code?:string}).code||'INTERNAL'}));
   res.status(status).json({code:known?error.code:'SERVICE_UNAVAILABLE',message:known?error.message:'服务暂不可用，请稍后重试',requestId});
  }
 }
 async execute(req:Request,res:Response,op:Operation,params:Record<string,string>,requestId:string):Promise<unknown>{
  const name=op.operationId;
  if(name==='getHealth'){await pool.query('SELECT 1');return {status:'ok',appMode:c.appMode,version:contract.info.version,contractSha256:contractHash,databaseReady:true};}
  if(['createDemoSession','createStaffSession'].includes(name)){
   checkOrigin(req);limitLogin(req.ip||'loopback');let u:User|undefined;let audience:'student'|'staff';let bearer=false;
   if(name==='createDemoSession'){
    const b=req.body as Schemas['DemoLoginRequest'];
    if(!safeEqual(b.accessCode,c.demoAccessCode))throw new DomainError(401,'INVALID_CREDENTIALS','演示口令不正确');
    u=await findUser(b.demoUserId);audience=b.audience;bearer=b.transport==='bearer';
    if(!u?.demoOnly||(audience==='student'&&!u.roles.includes('STUDENT'))||(audience==='staff'&&!u.id.startsWith('DEMO_T'))||(bearer&&audience==='staff'))throw new DomainError(403,'AUDIENCE_MISMATCH','身份与会话用途不匹配');
   }else{
    const b=req.body as Schemas['StaffLoginRequest'];u=await findUser(b.login);audience='staff';
    const [salt,stored]=u?.passwordHash?.split(':')||['invalid',scryptSync('invalid','invalid',64).toString('hex')];
    const passwordHash=scryptSync(b.password,salt,64).toString('hex');
    if(!safeEqual(passwordHash,stored)||!u?.passwordHash)throw new DomainError(401,'INVALID_CREDENTIALS','账号或密码不正确');
   }
   if(!u?.active)throw new DomainError(403,'FORBIDDEN','账号已停用');
   const old=cookieToken(req,audience);if(old)await pool.execute('UPDATE sessions SET expires_at=UTC_TIMESTAMP(3) WHERE token_hash=? AND audience=?',[sha(old),audience]);
   const token=random();const s:SessionRow={token_hash:sha(token),user_id:u.id,audience,csrf_token:random(),expires_at:new Date(Date.now()+2*60*60*1000)};
   await pool.execute('INSERT INTO sessions(token_hash,user_id,audience,csrf_token,expires_at) VALUES (?,?,?,?,?)',[s.token_hash,s.user_id,s.audience,s.csrf_token,s.expires_at]);
   if(!bearer)res.cookie(c.cookiePrefix+'_'+audience,token,{httpOnly:true,sameSite:'strict',path:'/api/v1',maxAge:2*60*60*1000});
   return sessionBody(u,s,requestId,bearer?token:null);
  }
  const audience=op['x-audience']==='any'?req.get('X-Session-Audience'):op['x-audience'];
  if(!audience||!['student','staff'].includes(audience))throw new DomainError(422,'AUDIENCE_REQUIRED','请选择会话用途');
  const {s,u,bearer}=await authenticate(req,audience);
  if(req.method!=='GET'){checkOrigin(req);if(!bearer&&!safeEqual(req.get('X-CSRF-Token')||'',s.csrf_token))throw new DomainError(403,'CSRF_REJECTED','页面已过期，请刷新后重试');}
  if(name==='getMe')return publicUser(u);
  if(name==='getStudentPracticeFeed')return studentPracticeFeed(u.id,req.query);
  if(name==='getSession')return sessionBody(u,s,requestId);
  if(name==='logout'){
   if(req.body.audience!==audience)throw new DomainError(403,'AUDIENCE_MISMATCH','会话用途不匹配');
   await pool.execute('UPDATE sessions SET expires_at=UTC_TIMESTAMP(3) WHERE token_hash=?',[s.token_hash]);
   res.clearCookie(c.cookiePrefix+'_'+audience,{path:'/api/v1'});return {ok:true,requestId};
  }
  if(name==='getMyWallet')return transaction(async cx=>{const[w]=await rows<Omit<Schemas['Wallet'],'pendingApprovalPoints'|'pendingEligibilityPoints'>>(cx,'SELECT available_points availablePoints,frozen_points frozenPoints,investigation_frozen_points investigationFrozenPoints,growth_mileage growthMileage,recovery_due recoveryDue,version FROM wallets WHERE user_id=? FOR UPDATE',[u.id]);if(!w)throw new DomainError(404,'NOT_FOUND','钱包不存在');return {...w,...await pendingPoints(cx,u.id)};});
  if(name==='listMyLedger'){
   const limit=Number(req.query.limit||20);const cursor=String(req.query.cursor||'');
   const records=await rows<LedgerRow>(pool,`SELECT * FROM ledger_entries WHERE user_id=? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.id,cursor]);
   const items=records.slice(0,limit).map(v=>({id:v.id,transactionId:v.id,kind:v.kind,deltaAvailable:v.delta_available,deltaReserved:v.delta_reserved,sourceType:v.source_type,sourceId:v.source_id,ruleVersion:v.rule_version,createdAt:v.created_at.toISOString(),reason:v.reason}));return {items,nextCursor:records.length>limit?items.at(-1)!.id:null};
  }
  if(name==='listRewards'){
   const limit=Number(req.query.limit||20);const records=await rows<{id:string;body:Schemas['Reward']}>(pool,`SELECT id,body FROM rewards WHERE id>? ORDER BY id LIMIT ${limit+1}`,[String(req.query.cursor||'')]);
   const inventory=await rows<{reward_id:string;available:number}>(pool,'SELECT reward_id,SUM(on_hand-reserved-quarantine) available FROM inventory WHERE organization_id=? GROUP BY reward_id',[u.organizationId]);const available=new Map(inventory.map(i=>[i.reward_id,Number(i.available)]));
   return {items:records.slice(0,limit).map(r=>({...r.body,availableQuantity:available.get(r.id)??0})),nextCursor:records.length>limit?records[limit-1].id:null};
  }
  if(name==='getReward'){const[r]=await rows<{body:Schemas['Reward']}>(pool,'SELECT body FROM rewards WHERE id=?',[params.rewardId]);if(!r)throw new DomainError(404,'NOT_FOUND','奖励不存在');const[i]=await rows<{available:number|null}>(pool,'SELECT SUM(on_hand-reserved-quarantine) available FROM inventory WHERE reward_id=? AND organization_id=?',[params.rewardId,u.organizationId]);return {...r.body,availableQuantity:i.available===null?0:Number(i.available)};}
  const activityResult=req.method==='GET'?await activityRead(name,u.id,params,req.query,audience):await activityWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(activityResult!==undefined)return activityResult;
  const orderResult=req.method==='GET'?await orderRead(name,u.id,params,req.query,audience):await orderWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(orderResult!==undefined)return orderResult;
  const growthResult=req.method==='GET'?await growthRead(name,u.id,params,req.query,audience):await growthWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(growthResult!==undefined)return growthResult;
  const govResult=req.method==='GET'?await governanceRead(name,u.id,params,req.query,audience):await governanceWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(govResult!==undefined)return govResult;
  const opsResult=req.method==='GET'?await operationsRead(name,u.id,req.query):await operationsWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(opsResult!==undefined)return opsResult;
  const accessResult=req.method==='GET'?await accessRead(name,u.id,req.query):await accessWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(accessResult!==undefined)return accessResult;
  const adjustmentResult=req.method==='GET'?await adjustmentsRead(name,u.id,params,req.query,audience):await adjustmentsWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body,audience);
  if(adjustmentResult!==undefined)return adjustmentResult;
  const conversionResult=req.method==='GET'?await conversionRead(name,u.id,req.query,audience):await conversionWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(conversionResult!==undefined)return conversionResult;
  const commerceResult=req.method==='GET'?await commerceRead(name,u.id,params,req.query,audience):await commerceWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(commerceResult!==undefined)return commerceResult;
  const reportingResult=req.method==='GET'?await reportingRead(name,u.id,req.query):await reportingWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(reportingResult!==undefined)return reportingResult;
  const meetingResult=req.method==='GET'?await meetingRead(name,u.id,params,req.query,audience):await meetingWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(meetingResult!==undefined)return meetingResult;
  const managementResult=req.method==='GET'?await managementRead(name,u.id,params,req.query,audience):await managementWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(managementResult!==undefined)return managementResult;
  const fileResult=req.method==='GET'?await fileRead(name,u.id,params,req.query):await fileWrite(name,{actorId:u.id,requestId,key:req.get('Idempotency-Key')||''},params,req.body);
  if(fileResult!==undefined)return fileResult;
  throw new DomainError(404,'NOT_FOUND','接口不存在');
 }
}
@Module({controllers:[ApiController]})class AppModule{}
@Catch()class BoundaryFilter implements ExceptionFilter {
 catch(error:unknown,host:ArgumentsHost){const response=host.switchToHttp().getResponse<Response>();const requestId=randomUUID();const parser=error as {type?:string};const original=error instanceof HttpException?error.getStatus():['entity.parse.failed','entity.too.large'].includes(parser.type||'')?422:503;const status=original===400||original===413?422:original;response.setHeader('X-Request-ID',requestId);response.status(status).json({code:status===422?'INVALID_BODY':status===404?'NOT_FOUND':'SERVICE_UNAVAILABLE',message:status===422?'请求格式或大小不符合要求':'请求无法完成',requestId});}
}
async function bootstrap(){const app=await NestFactory.create(AppModule,{logger:['error','warn'],bodyParser:false});app.use(json({limit:'1mb'}));app.useGlobalFilters(new BoundaryFilter());await app.listen(c.apiPort,'127.0.0.1');startWorker();console.log(`API ready on loopback:${c.apiPort}`);}
bootstrap().catch(()=>{console.error('API startup refused; check local configuration and database.');process.exitCode=1;});
