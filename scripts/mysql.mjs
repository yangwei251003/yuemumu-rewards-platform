import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {spawn,spawnSync} from 'node:child_process';
import mysql from 'mysql2/promise';
const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
const connect=()=>mysql.createConnection({host:c.dbHost,port:c.dbPort,user:'root',password:c.rootPassword});
let connection;
try{connection=await connect();}catch{
 const busy=await new Promise(r=>{const s=net.connect(c.dbPort,'127.0.0.1');s.once('connect',()=>{s.destroy();r(true);});s.once('error',()=>r(false));});
 if(busy)throw new Error('MySQL port belongs to another instance; refusing to replace it.');
 if(!fs.existsSync(c.mysqlBinary))throw new Error('Configured official MySQL binary missing');
 fs.mkdirSync(c.mysqlData,{recursive:true});
 const base=`--basedir=${path.dirname(path.dirname(c.mysqlBinary))}`;
 const data=`--datadir=${c.mysqlData}`;
 if(!fs.existsSync(path.join(c.mysqlData,'mysql'))){
  const result=spawnSync(c.mysqlBinary,['--no-defaults',base,data,'--initialize-insecure','--console'],{encoding:'utf8',windowsHide:true});
  fs.writeFileSync('.runtime/mysql-initialize.log',result.stdout+result.stderr);
  if(result.status!==0)throw new Error('MySQL initialization failed; see ignored local log');
 }
 const initPath=path.join(path.dirname(c.mysqlData),'mysql-init.sql');
 fs.writeFileSync(initPath,`ALTER USER 'root'@'localhost' IDENTIFIED BY '${c.rootPassword}';\n`,{mode:0o600});
 const log=fs.openSync('.runtime/mysql.log','a');
 const child=spawn(c.mysqlBinary,['--no-defaults',base,data,`--port=${c.dbPort}`,'--bind-address=127.0.0.1','--mysqlx=OFF','--default-time-zone=+00:00','--innodb-buffer-pool-size=134217728',`--init-file=${initPath}`,'--console'],{windowsHide:true,detached:true,stdio:['ignore',log,log]});child.unref();fs.closeSync(log);
 fs.writeFileSync('.runtime/mysql.pid',String(child.pid));
 for(let attempt=0;attempt<60;attempt++){try{connection=await connect();break;}catch{await new Promise(r=>setTimeout(r,500));}}
 if(!connection)throw new Error('MySQL did not become ready; see .runtime/mysql.log');
 fs.unlinkSync(initPath);
}
if(!/^ym_(dev_[ab]|integration)$/.test(c.database))throw new Error('Refusing unapproved schema');
await connection.query(`CREATE DATABASE IF NOT EXISTS \`${c.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
for(const [user,password,grants]of [[c.dbUser,c.dbPassword,'SELECT, INSERT'],[c.migrationUser,c.migrationPassword,'SELECT, INSERT, UPDATE, DELETE, CREATE, CREATE TEMPORARY TABLES, ALTER, INDEX, REFERENCES']]){
 await connection.query('CREATE USER IF NOT EXISTS ?@\'127.0.0.1\' IDENTIFIED BY ?',[user,password]);
 await connection.query(`GRANT ${grants} ON \`${c.database}\`.* TO ?@'127.0.0.1'`,[user]);
}
const [version]=await connection.query('SELECT VERSION() AS version');
await connection.end();console.log(`Real MySQL ${version[0].version} ready on loopback:${c.dbPort}; schema ${c.database}; separate application/migration credentials.`);
