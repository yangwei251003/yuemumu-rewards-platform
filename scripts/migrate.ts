import fs from 'node:fs';
import {createHash} from 'node:crypto';
import mysql from 'mysql2/promise';
import {config} from '../packages/db/src/config';
const c=config();
async function main(){
 const cx=await mysql.createConnection({host:c.dbHost,port:c.dbPort,user:c.migrationUser,password:c.migrationPassword,database:c.database});
 const lockName=`ymm:schema:${c.database}`;let locked=false;
 try{
  // Backup snapshots use the same database-scoped lock; connection close also releases it.
  const [lock]=await cx.execute<mysql.RowDataPacket[]>('SELECT GET_LOCK(?, 60) AS acquired',[lockName]);
  if(Number(lock[0]?.acquired)!==1)throw new Error('Migration lock unavailable');
  locked=true;
  await cx.execute('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(100) PRIMARY KEY, sha256 CHAR(64) NOT NULL, applied_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3))');
  for(const name of fs.readdirSync('packages/db/migrations').filter(n=>n.endsWith('.sql')).sort()){
   const source=fs.readFileSync(`packages/db/migrations/${name}`,'utf8');const hash=createHash('sha256').update(source).digest('hex');
   const [rows]=await cx.execute<mysql.RowDataPacket[]>('SELECT sha256 FROM schema_migrations WHERE name=?',[name]);
   if(rows.length){if(rows[0].sha256!==hash)throw new Error('Applied migration drift: '+name);console.log('Retained migration '+name);continue;}
   for(const [index,sql] of source.split(';').map(s=>s.trim()).filter(Boolean).entries()){try{await cx.query(sql);}catch(error){console.error(JSON.stringify({migration:name,statement:index+1,code:(error as {code?:string}).code,message:(error as {sqlMessage?:string}).sqlMessage}));throw error;}}
   await cx.execute('INSERT INTO schema_migrations(name,sha256) VALUES (?,?)',[name,hash]);console.log('Applied migration '+name);
  }
 }finally{try{if(locked)await cx.execute('SELECT RELEASE_LOCK(?)',[lockName]);}finally{await cx.end();}}
}
main().catch(()=>{console.error('Migration failed. Existing data retained; inspect migration state before retrying.');process.exitCode=1;});
