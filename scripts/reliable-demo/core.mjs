import fs from 'node:fs';import path from 'node:path';import net from 'node:net';import {createHash} from 'node:crypto';import mysql from 'mysql2/promise';
export class DemoError extends Error {constructor(code){super(code);this.code=code;}}
export function requireThat(value,code){if(!value)throw new DemoError(code);}
export const normal=p=>path.resolve(p).replaceAll('\\','/').replace(/\/$/,'').toLowerCase();
export const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const delay=ms=>new Promise(r=>setTimeout(r,ms));
export const busy=port=>new Promise(r=>{const s=net.connect({port,host:'127.0.0.1'});s.setTimeout(1500);s.once('connect',()=>{s.destroy();r(true);});s.once('error',()=>r(false));s.once('timeout',()=>{s.destroy();r(true);});});
export function validateConfig(c,i){requireThat(c.profile==='a'&&c.database==='ym_dev_a'&&c.appMode==='demo'&&c.dbHost==='127.0.0.1'&&c.dbPort===3312&&c.apiPort===3105&&c.gatewayPort===38082,'CONFIG_BOUNDARY');requireThat(normal(c.mysqlData)===normal(i.dataDirectory)&&i.serverUuid&&i.tables.length>=90,'CONFIG_IDENTITY');}
export function validateIdentity(row,c,i){requireThat(row.port===c.dbPort&&row.database===c.database&&normal(row.datadir)===normal(i.dataDirectory)&&row.uuid===i.serverUuid,'DATABASE_IDENTITY');}
export function filesUnder(root,dir){const result=[];for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const name=dir+'/'+e.name;if(e.isDirectory())result.push(...filesUnder(root,name));else result.push(name);}return result;}
export function preflight(root){
 requireThat(fs.existsSync(root+'/.runtime/config.json')&&fs.existsSync(root+'/.runtime/install-identity.json')&&fs.existsSync(root+'/scripts/reliable-demo/release.json'),'INSTALLATION_MISSING');
 const c=JSON.parse(fs.readFileSync(root+'/.runtime/config.json')),i=JSON.parse(fs.readFileSync(root+'/.runtime/install-identity.json')),m=JSON.parse(fs.readFileSync(root+'/scripts/reliable-demo/release.json'));
 validateConfig(c,i);requireThat(process.versions.node.split('.')[0]==='24','NODE_VERSION');
 requireThat(fs.existsSync(c.mysqlBinary)&&hash(c.mysqlBinary)===m.mysqlBinarySha256,'MYSQL_BINARY');
 requireThat(fs.existsSync(c.mysqlData+'/mysql.ibd')&&fs.existsSync(c.mysqlData+'/auto.cnf')&&fs.existsSync(c.mysqlData+'/ym_dev_a/users.ibd'),'DATA_FILES_MISSING');
 const auto=fs.readFileSync(c.mysqlData+'/auto.cnf','utf8');requireThat(auto.includes(i.serverUuid),'DATABASE_IDENTITY');
 for(const [file,expected]of Object.entries(m.files)){requireThat(fs.existsSync(root+'/'+file)&&hash(root+'/'+file)===expected,'BUILD_CHANGED');}
 requireThat(hash(root+'/.runtime/config.json')===m.configSha256&&hash(root+'/.runtime/install-identity.json')===m.identitySha256,'CONFIG_CHANGED');
 return {c,i,m};
}
export async function connect(c,admin=false){return mysql.createConnection({host:c.dbHost,port:c.dbPort,user:admin?'root':c.dbUser,password:admin?c.rootPassword:c.dbPassword,database:c.database,connectTimeout:3000,dateStrings:true});}
export async function verifyDatabase(c,i,m){let db;try{
 db=await connect(c);const[id]=await db.query('SELECT @@server_uuid uuid,@@datadir datadir,@@port port,DATABASE() AS `database`');validateIdentity(id[0],c,i);
 const[rows]=await db.query('SHOW TABLES');const tables=rows.map(r=>Object.values(r)[0]);requireThat(i.tables.every(t=>tables.includes(t)),'DATABASE_TABLES');
 for(const name of i.tables)await db.query('SELECT 1 FROM `'+name+'` LIMIT 1');
 const[migrations]=await db.query('SELECT name,sha256 FROM schema_migrations');requireThat(migrations.length===Object.keys(m.migrations).length&&migrations.every(r=>m.migrations[r.name]===r.sha256),'DATABASE_MIGRATIONS');
 const[users]=await db.query("SELECT id,roles,membership_status,demo_only FROM users WHERE id IN ('DEMO_S001','DEMO_T004')");
 requireThat(users.length===2&&users.every(u=>u.demo_only===1),'DEMO_ACCOUNTS');
 const student=users.find(u=>u.id==='DEMO_S001'),staff=users.find(u=>u.id==='DEMO_T004');
 requireThat(JSON.stringify(student.roles).includes('STUDENT')&&student.membership_status==='ACTIVE'&&JSON.stringify(staff.roles).includes('OPS_MANAGER'),'DEMO_ACCOUNTS');
 return {tables:tables.length,migrations:migrations.length};
 }catch(e){if(e instanceof DemoError)throw e;throw new DemoError(['ER_NO_SUCH_TABLE','ER_BAD_DB_ERROR'].includes(e.code)?'DATABASE_TABLES':e.code==='ER_ACCESS_DENIED_ERROR'?'DATABASE_LOGIN':'DATABASE_UNAVAILABLE');}finally{await db?.end();}}
export async function verifyHttp(c,m){for(const port of [c.apiPort,c.gatewayPort]){const r=await fetch(`http://127.0.0.1:${port}/api/v1/health`,{signal:AbortSignal.timeout(3000)});requireThat(r.ok&&r.headers.get('x-instance-id')===c.cookiePrefix,'SERVICE_IDENTITY');const h=await r.json();requireThat(h.databaseReady&&h.contractSha256===m.contract,'SERVICE_NOT_READY');}}
export const explanations={INSTALLATION_MISSING:'演示安装文件缺失。请勿重新建库，请联系维护人员。',CONFIG_BOUNDARY:'配置指向的不是专属演示环境，已停止。',CONFIG_IDENTITY:'数据库目录或安装身份不一致，已停止。',CONFIG_CHANGED:'本机配置发生变化，需要维护人员核对。',NODE_VERSION:'需要本机已配置的 Node 24，当前运行程序不符。',MYSQL_BINARY:'MySQL程序缺失或版本发生变化，需要重新验收。',DATA_FILES_MISSING:'已有数据库文件缺失。未创建空库，也未重置记录。',BUILD_CHANGED:'系统文件发生变化或缺失，需要重新核验版本。',DATABASE_IDENTITY:'连接的数据库不是本次安装的专属实例，已停止。',DATABASE_TABLES:'实际业务表缺失或不可读，不能开始演示。',DATABASE_MIGRATIONS:'数据库版本与应用版本不匹配。',DEMO_ACCOUNTS:'演示账号或角色不符合要求，未自动修改账号。',DATABASE_LOGIN:'本机数据库登录失败，未重设密码。',DATABASE_UNAVAILABLE:'数据库未就绪或无法读取，请查看诊断文件。',MYSQL_START:'数据库启动失败。未删除日志、初始化或清空数据。',PORT_BUSY:'端口被其他程序占用，未停止或接管该程序。',SERVICE_IDENTITY:'端口上的服务不是本次演示版本。',SERVICE_NOT_READY:'服务尚未准备好，未将端口开放误报为成功。',BROWSER_LOGIN:'自动登录或主页读取失败，不能开始演示。',BROWSER_MISSING:'Chrome或浏览器控制组件不可用，请联系维护人员。',OWNER_UNKNOWN:'已有启动记录无法确认归属，未强行结束进程。',CONTROL_TIMEOUT:'启动仍未完成或控制器无响应，请查看诊断文件。',BACKUP_FAILED:'安全备份失败，记录未删除；请联系维护人员。'};
