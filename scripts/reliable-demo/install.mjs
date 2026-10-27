// One-time local installation only. Never called by the teacher launcher.
import fs from 'node:fs';import path from 'node:path';import net from 'node:net';import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';import {spawn,spawnSync} from 'node:child_process';import mysql from 'mysql2/promise';
const source=path.resolve(process.env.YUEMUMU_SOURCE_ROOT||process.cwd()),target=path.resolve(process.env.YUEMUMU_TARGET_ROOT||'.runtime/review-install'),home=path.join(target,'.runtime','installation');
assert.notEqual(source,target,'Source and installation target must differ');
assert.ok(!fs.existsSync(home),'Install target already exists; never overwrite a database');
const old=JSON.parse(fs.readFileSync(source+'/.runtime/config.json'));assert.equal(old.dbPort,3311);assert.equal(old.database,'ym_dev_a');
for(const port of [3312,3105,38082]){const busy=await new Promise(r=>{const s=net.connect(port,'127.0.0.1');s.once('connect',()=>{s.destroy();r(true);});s.once('error',()=>r(false));});assert.ok(!busy,'Install port busy');}
fs.mkdirSync(home,{recursive:true});fs.mkdirSync(target+'/.runtime',{recursive:true});
run(process.execPath,['C:/Program Files/nodejs/node_modules/corepack/dist/pnpm.js','install','--offline','--frozen-lockfile','--ignore-scripts'],{cwd:target,timeout:300000});
for(const dir of ['dist','apps/student/dist','apps/ops/dist'])fs.cpSync(source+'/'+dir,target+'/'+dir,{recursive:true});
const c={...old,dbPort:3312,apiPort:3105,gatewayPort:38082,mysqlData:home+'/mysql',rootPassword:randomBytes(32).toString('hex'),dbPassword:randomBytes(32).toString('hex'),migrationPassword:randomBytes(32).toString('hex'),cookiePrefix:'ymm_teacher_'+randomBytes(8).toString('hex')};
fs.writeFileSync(target+'/.runtime/config.json',JSON.stringify(c,null,2));
const bin=path.dirname(c.mysqlBinary),dump=home+'/initial-snapshot.sql',clientFile=home+'/client-private.cnf';
function clientConfig(port,password){fs.writeFileSync(clientFile,`[client]\nhost=127.0.0.1\nport=${port}\nuser=root\npassword=${password}\n`);}
function run(program,args,options={}){const r=spawnSync(program,args,{windowsHide:true,encoding:'utf8',...options});if(r.status!==0)throw Error('Installation command failed: '+path.basename(program)+' exit '+r.status);}
const src=await mysql.createConnection({host:old.dbHost,port:old.dbPort,user:'root',password:old.rootPassword,database:old.database,dateStrings:true});
const critical=['users','wallets','ledger_entries','point_lots','redemption_orders','submissions','flow_approvals','private_files'];
async function summaries(db){const result={};for(const name of critical){const[rows]=await db.query('SELECT * FROM `'+name+'`');const values=rows.map(r=>JSON.stringify(r)).sort();result[name]={count:rows.length,sha256:createHash('sha256').update(values.join('\n')).digest('hex')};}return result;}
const before=await summaries(src);clientConfig(old.dbPort,old.rootPassword);
const fd=fs.openSync(dump,'wx');try{run(bin+'/mysqldump.exe',['--defaults-extra-file='+clientFile,'--single-transaction','--hex-blob','--set-gtid-purged=OFF','--no-tablespaces','--skip-add-drop-table','--databases',old.database],{stdio:['ignore',fd,'pipe']});}finally{fs.closeSync(fd);fs.unlinkSync(clientFile);}
assert.deepEqual(await summaries(src),before,'Source business records changed during export; stop rather than claim matching snapshot');await src.end();
fs.mkdirSync(c.mysqlData);run(c.mysqlBinary,['--no-defaults','--basedir='+path.dirname(bin),'--datadir='+c.mysqlData,'--initialize-insecure','--console']);
const log=fs.openSync(home+'/install-mysql.log','a');const child=spawn(c.mysqlBinary,['--no-defaults','--basedir='+path.dirname(bin),'--datadir='+c.mysqlData,'--port=3312','--bind-address=127.0.0.1','--mysqlx=OFF','--default-time-zone=+00:00','--innodb-buffer-pool-size=134217728','--console'],{windowsHide:true,stdio:['ignore',log,log]});
let db;try{for(let i=0;i<60;i++){try{db=await mysql.createConnection({host:'127.0.0.1',port:3312,user:'root',database:'mysql',dateStrings:true});break;}catch{await new Promise(r=>setTimeout(r,500));}}assert.ok(db,'Fresh MySQL startup failed');
 await db.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?",[c.rootPassword]);
 const[identity]=await db.query('SELECT @@server_uuid uuid,@@datadir datadir');assert.equal(identity[0].datadir.replaceAll('\\','/').replace(/\/$/,''),c.mysqlData);
 clientConfig(3312,c.rootPassword);const input=fs.openSync(dump,'r');try{run(bin+'/mysql.exe',['--defaults-extra-file='+clientFile,'--binary-mode=1'],{stdio:[input,'pipe','pipe']});}finally{fs.closeSync(input);fs.unlinkSync(clientFile);}
 await db.query('USE ym_dev_a');assert.deepEqual(await summaries(db),before,'Imported business records differ');
 for(const[user,password,grants]of [[c.dbUser,c.dbPassword,'SELECT, INSERT'],[c.migrationUser,c.migrationPassword,'SELECT, INSERT, UPDATE, DELETE, CREATE, CREATE TEMPORARY TABLES, ALTER, INDEX, REFERENCES']]){await db.query("CREATE USER ?@'127.0.0.1' IDENTIFIED BY ?",[user,password]);await db.query(`GRANT ${grants} ON ym_dev_a.* TO ?@'127.0.0.1'`,[user]);}
 run(process.execPath,['scripts/harden-db.mjs'],{cwd:target});
 const[tables]=await db.query('SHOW TABLES');
 fs.writeFileSync(target+'/.runtime/install-identity.json',JSON.stringify({serverUuid:identity[0].uuid,dataDirectory:c.mysqlData,tables:tables.map(r=>Object.values(r)[0]).sort(),installedAt:new Date().toISOString()},null,2));
 fs.mkdirSync('evidence/startup-20260909',{recursive:true});fs.writeFileSync('evidence/startup-20260909/migration.json',JSON.stringify({sourcePort:3311,targetPort:3312,sourceUntouched:true,checks:before,status:'PASS',snapshotSha256:createHash('sha256').update(fs.readFileSync(dump)).digest('hex'),tables:tables.length},null,2));
 console.log('PASS independent database installed; '+tables.length+' tables, eight business-table fingerprints match. Source database unchanged.');
}finally{if(db){await db.query('SHUTDOWN').catch(()=>{});await db.end();}await new Promise(r=>{if(child.exitCode!==null)r();else child.once('exit',r);});fs.closeSync(log);}
