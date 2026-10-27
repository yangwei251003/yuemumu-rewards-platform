import {createHash,randomUUID} from 'node:crypto';
import {pool,rows,type Executor} from '../../db/src/client';
import {actor,type Actor} from './ledger';
import {command,fail,type Context} from './commands';
import type {Schemas} from '../../sdk/src';
type FileRow={id:string;owner_id:string;organization_id:string;filename:string;mime_type:Schemas['PrivateFile']['mimeType'];byte_size:number;sha256:string;purpose:Schemas['PrivateFile']['purpose'];created_at:Date;content:Buffer};
const metadata=(f:FileRow):Schemas['PrivateFile']=>({id:f.id,ownerId:f.owner_id,filename:f.filename,mimeType:f.mime_type,byteSize:f.byte_size,sha256:f.sha256,purpose:f.purpose,visibility:'PRIVATE',createdAt:f.created_at.toISOString()});
export async function validateFiles(cx:Executor,u:Actor,ids:string[]){
 if(new Set(ids).size!==ids.length||ids.length>10)fail('INVALID_FILES','文件数量或重复引用不符合要求',422);
 for(const id of ids){const[f]=await rows<FileRow>(cx,'SELECT id,owner_id,organization_id FROM private_files WHERE id=?',[id]);if(!f||f.owner_id!==u.id||f.organization_id!==u.organization_id)fail('FILE_NOT_OWNED','只能提交本人上传的私有文件',403);}
}
export async function linkFiles(cx:Executor,ids:string[],type:'ACTIVITY'|'AWARD'|'CASE'|'STATEMENT'|'APPEAL'|'MEETING'|'ADJUSTMENT',resourceId:string){for(const id of ids)await cx.execute('INSERT IGNORE INTO file_links(file_id,resource_type,resource_id) VALUES (?,?,?)',[id,type,resourceId]);}
async function hasScope(cx:Executor,u:Actor,type:string,id:string){return !!(await rows(cx,'SELECT user_id FROM role_scopes WHERE user_id=? AND scope_type=? AND scope_id IN (?,?)',[u.id,type,id,'*'])).length;}
async function authorized(cx:Executor,u:Actor,id:string){
 const[f]=await rows<FileRow>(cx,'SELECT * FROM private_files WHERE id=?',[id]);if(!f||f.organization_id!==u.organization_id)fail('NOT_FOUND','文件不存在或没有读取权限',404);if(f.owner_id===u.id)return f;
 const links=await rows<{resource_type:string;resource_id:string}>(cx,'SELECT * FROM file_links WHERE file_id=?',[id]);
 for(const link of links){
  if(link.resource_type==='ADJUSTMENT'){
   const[a]=await rows<{beneficiary_id:string;organization_id:string}>(cx,'SELECT beneficiary_id,organization_id FROM point_adjustment_requests WHERE id=?',[link.resource_id]);
   if(a&&a.organization_id===u.organization_id&&(a.beneficiary_id===u.id||(u.roles.some(r=>['MENTOR','REVIEWER','OPS_MANAGER'].includes(r))&&await hasScope(cx,u,'REVIEW',u.organization_id))||(u.roles.includes('AUDITOR')&&await hasScope(cx,u,'AUDIT',u.organization_id))))return f;
  }
  if(link.resource_type==='ACTIVITY'){
   const[s]=await rows<{source_id:string;user_id:string}>(cx,'SELECT source_id,user_id FROM submissions WHERE id=?',[link.resource_id]);if(!s)continue;
   if(u.roles.some(r=>['REVIEWER','OPS_MANAGER'].includes(r))&&await hasScope(cx,u,'REVIEW',u.organization_id))return f;
   if(u.roles.some(r=>['MENTOR','OPS_MANAGER','STUDENT_ORGANIZER'].includes(r))&&await hasScope(cx,u,'ACTIVITY',s.source_id))return f;
  }
  if(link.resource_type==='MEETING'){const[c]=await rows<{activity_id:string}>(cx,'SELECT m.activity_id FROM meeting_claims c JOIN meetings m ON m.id=c.meeting_id WHERE c.id=?',[link.resource_id]);if(c&&u.roles.some(r=>['REVIEWER','MENTOR','OPS_MANAGER'].includes(r))&&await hasScope(cx,u,'ACTIVITY',c.activity_id))return f;}
  if(link.resource_type==='AWARD'){
   const[a]=await rows<{kind:string;source_id:string;targets:Record<string,number>}>(cx,'SELECT kind,source_id,targets FROM award_requests WHERE id=?',[link.resource_id]);if(!a)continue;
   if(Object.hasOwn(a.targets,u.id))return f;
   if(u.roles.some(r=>['REVIEWER','MENTOR','OPS_MANAGER'].includes(r))&&await hasScope(cx,u,'GROWTH_REVIEW',u.organization_id)&&(a.kind!=='PROJECT_STAGE'||await hasScope(cx,u,'PROJECT',a.source_id)))return f;
   if(u.roles.includes('AUDITOR')&&await hasScope(cx,u,'AUDIT',u.organization_id)&&(a.kind!=='PROJECT_STAGE'||await hasScope(cx,u,'PROJECT',a.source_id)))return f;
  }
  if(['CASE','STATEMENT','APPEAL'].includes(link.resource_type)){
   const caseQuery=link.resource_type==='CASE'?'SELECT subject_id FROM governance_cases WHERE id=?':link.resource_type==='STATEMENT'?'SELECT c.subject_id FROM case_statements s JOIN governance_cases c ON c.id=s.case_id WHERE s.id=?':'SELECT user_id subject_id FROM appeals WHERE id=?';const[c]=await rows<{subject_id:string}>(cx,caseQuery,[link.resource_id]);if(c&&(c.subject_id===u.id||(u.roles.some(r=>['REVIEWER','MENTOR','OPS_MANAGER','AUDITOR'].includes(r))&&await hasScope(cx,u,'GOVERNANCE',u.organization_id))))return f;
  }
 }
 fail('NOT_FOUND','文件不存在或没有读取权限',404);
}
function verifyContent(name:string,mime:string,content:Buffer){
 if(!content.length||content.length>512*1024)fail('FILE_SIZE','单个模拟证据需小于512KiB',422);
 if([...name].some(c=>c.charCodeAt(0)<32||c.charCodeAt(0)===127)||/[\\/:*?"<>|]/.test(name)||name.includes('..')||name.startsWith('.'))fail('INVALID_FILENAME','文件名不得包含路径或控制字符',422);
 if(mime==='image/png'){
  if(!/\.png$/i.test(name)||content.length<45||content.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||content.subarray(12,16).toString()!=='IHDR')fail('MIME_MISMATCH','内容不是PNG图片',422);
  const width=content.readUInt32BE(16),height=content.readUInt32BE(20);if(!width||!height||width*height>8000000||width>4096||height>4096)fail('IMAGE_DIMENSIONS','图片尺寸超出限制',422);
  let offset=8,ended=false;while(offset+12<=content.length){const length=content.readUInt32BE(offset);if(length>content.length-offset-12)fail('INVALID_IMAGE','PNG结构损坏',422);const type=content.subarray(offset+4,offset+8).toString();offset+=length+12;if(type==='IEND'){ended=length===0&&offset===content.length;break;}}if(!ended)fail('INVALID_IMAGE','PNG结构或尾部无效',422);
 }else if(mime==='image/jpeg'){
  if(!/\.jpe?g$/i.test(name)||content.length<10||content.subarray(0,3).toString('hex')!=='ffd8ff'||content.subarray(-2).toString('hex')!=='ffd9')fail('MIME_MISMATCH','内容不是JPEG图片',422);
  let offset=2,dimensions=false,scan=false;while(offset+4<=content.length){if(content[offset++]!==255)fail('INVALID_IMAGE','JPEG标记损坏',422);while(content[offset]===255)offset++;const marker=content[offset++];if(marker===0xda){scan=true;break;}const length=content.readUInt16BE(offset);if(length<2||offset+length>content.length)fail('INVALID_IMAGE','JPEG片段损坏',422);if([0xc0,0xc1,0xc2].includes(marker)){if(length<8)fail('INVALID_IMAGE','JPEG尺寸损坏',422);const h=content.readUInt16BE(offset+3),w=content.readUInt16BE(offset+5);if(!w||!h||w>4096||h>4096||w*h>8000000)fail('IMAGE_DIMENSIONS','图片尺寸超出限制',422);dimensions=true;}offset+=length;}if(!dimensions||!scan)fail('INVALID_IMAGE','JPEG缺少图像数据',422);
 }else if(mime==='text/plain'){
  const text=content.toString('utf8');if(!/\.txt$/i.test(name)||text.includes('\uFFFD')||text.includes('\0')||/<\s*(script|svg|html|iframe|object)\b/i.test(text))fail('UNSAFE_TEXT','只支持普通UTF-8文字说明',422);
 }else fail('UNSUPPORTED_MIME','支持PNG、JPEG和纯文本模拟证据',422);
}
export async function fileRead(name:string,userId:string,params:Record<string,string>,query:Record<string,unknown>):Promise<unknown>{
 if(!['listMyFiles','getFile'].includes(name))return undefined;const u=await actor(pool,userId);
 if(name==='getFile')return metadata(await authorized(pool,u,params.fileId));const limit=Number(query.limit||20),cursor=String(query.cursor||'');const list=await rows<FileRow>(pool,`SELECT id,owner_id,organization_id,filename,mime_type,byte_size,sha256,purpose,created_at FROM private_files WHERE owner_id=? AND id>? ORDER BY id LIMIT ${limit+1}`,[u.id,cursor]);return {items:list.slice(0,limit).map(metadata),nextCursor:list.length>limit?list[limit-1].id:null};
}
export async function fileWrite(name:string,ctx:Context,params:Record<string,string>,body:unknown):Promise<unknown>{
 if(name==='readFileContent'){const f=await authorized(pool,await actor(pool,ctx.actorId),params.fileId);return {file:metadata(f),base64Data:f.content.toString('base64')};}
 if(name==='uploadFile')return command(ctx,name,body,['STUDENT','STUDENT_ORGANIZER','MENTOR','REVIEWER','OPS_MANAGER','REWARD_OPERATOR','AUDITOR','SYSTEM_ADMIN'],async(cx,u)=>{
  const b=body as Schemas['FileUploadRequest'];if(b.base64Data.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(b.base64Data))fail('INVALID_BASE64','文件编码不正确',422);const data=Buffer.from(b.base64Data,'base64');if(data.toString('base64')!==b.base64Data)fail('INVALID_BASE64','文件编码不规范',422);verifyContent(b.filename,b.mimeType,data);const hash=createHash('sha256').update(data).digest('hex');const[existing]=await rows<FileRow>(cx,'SELECT * FROM private_files WHERE owner_id=? AND sha256=? AND purpose=?',[u.id,hash,b.purpose]);if(existing)return metadata(existing);
  const[quota]=await rows<{size:number}>(cx,'SELECT COALESCE(SUM(byte_size),0) size FROM private_files WHERE owner_id=?',[u.id]);if(Number(quota.size)+data.length>20*1024*1024)fail('FILE_QUOTA','本地模拟证据容量已达20MiB',422);
  const id=randomUUID();await cx.execute('INSERT INTO private_files(id,owner_id,organization_id,filename,mime_type,byte_size,sha256,purpose,content) VALUES (?,?,?,?,?,?,?,?,?)',[id,u.id,u.organization_id,b.filename,b.mimeType,data.length,hash,b.purpose,data]);return metadata((await rows<FileRow>(cx,'SELECT * FROM private_files WHERE id=?',[id]))[0]);
 });return undefined;
}
