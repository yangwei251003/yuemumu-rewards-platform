import fs from 'node:fs';
import path from 'node:path';
import {createHash, randomBytes} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import mysql from 'mysql2/promise';

// A local demo recovery drill. Source data is read in one consistent InnoDB snapshot.
// Credentials stay in memory; archives contain private rows and remain under .runtime.
const FORMAT='ymm-local-backup-v1';
const MAX_ROWS=100_000;
const MAX_TABLE_BYTES=128*1024*1024;
export const sha=value=>createHash('sha256').update(value).digest('hex');
class RecoveryError extends Error {}
function ensure(ok, message){if(!ok)throw new RecoveryError(message);}
export function identifier(value){ensure(typeof value==='string'&&/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(value),'Unsafe SQL identifier');return '`'+value+'`';}
export function assertConfig(c){
 ensure(c.profile==='integration'&&c.database==='ym_integration'&&c.dbHost==='127.0.0.1'&&c.dbPort===3310,'Recovery drill requires the isolated integration profile on loopback:3310');
 ensure((process.env.APP_MODE||c.appMode)==='demo','Recovery drill is demo-only');
 ensure(typeof c.rootPassword==='string'&&c.rootPassword.length>=32,'Missing local recovery credentials');
}
export function encode(value, fieldType){
 if(value===null)return null;
 if(Buffer.isBuffer(value))return {type:'bytes',data:value.toString('base64')};
 // jsonStrings preserves JSON null separately from SQL NULL and large JSON integers verbatim.
 if(fieldType===245){ensure(typeof value==='string','Expected raw JSON text');JSON.parse(value);return {type:'json',data:value};}
 ensure(typeof value==='string'||typeof value==='number'||typeof value==='boolean','Unsupported database value');
 return value;
}
export function decode(value){
 if(value===null||typeof value==='string'||typeof value==='number'||typeof value==='boolean')return value;
 ensure(value&&Object.keys(value).length===2&&typeof value.data==='string','Malformed archived value');
 if(value.type==='bytes'){
  const bytes=Buffer.from(value.data,'base64');ensure(bytes.toString('base64')===value.data,'Malformed archived bytes');return bytes;
 }
 ensure(value.type==='json','Unsupported archived value');JSON.parse(value.data);return value.data;
}
export function rowDigest(rows){return sha(rows.map(row=>sha(JSON.stringify(row))).sort().join('\n'));}
function normalizedDdl(ddl){return ddl.replace(/ AUTO_INCREMENT=\d+/g,'');}
export function validateTable(table){
 const name=identifier(table.name);
 ensure(typeof table.ddl==='string'&&table.ddl.startsWith(`CREATE TABLE ${name} (`)&&/\) ENGINE=InnoDB\b/.test(table.ddl),'Unsupported table definition');
 ensure(!/\b(?:DATA DIRECTORY|INDEX DIRECTORY|TABLESPACE|ENCRYPTION)\b/i.test(table.ddl),'External table storage is not supported');
 ensure(!/REFERENCES\s+`[^`]+`\s*\./i.test(table.ddl),'Cross-database references are not supported');
 ensure(Array.isArray(table.columns)&&table.columns.length>0&&new Set(table.columns).size===table.columns.length,'Invalid archived columns');
 table.columns.forEach(identifier);
 ensure(Array.isArray(table.rows)&&table.rows.length<=MAX_ROWS,'Invalid archive row count');
 for(const row of table.rows){ensure(Array.isArray(row)&&row.length===table.columns.length,'Invalid archived row width');row.forEach(decode);}
 ensure(table.rowCount===table.rows.length&&table.rowSha256===rowDigest(table.rows),'Archived row digest mismatch');
 ensure(table.schemaSha256===sha(normalizedDdl(table.ddl)),'Archived schema digest mismatch');
 return table;
}
function writePrivate(file,body){fs.writeFileSync(file,body,{encoding:'utf8',mode:0o600,flag:'wx'});}
function safeRunId(id){ensure(/^run_\d{14}_[a-f0-9]{12}$/.test(id),'Invalid backup run identifier');return id;}
function runId(){return safeRunId('run_'+new Date().toISOString().replace(/\D/g,'').slice(0,14)+'_'+randomBytes(6).toString('hex'));}
function assertArchiveDirectory(root,id){
 safeRunId(id);const dir=path.join(root,id);
 ensure(fs.realpathSync(dir)===path.resolve(dir),'Backup directory must not redirect outside the workspace');
 return dir;
}
function connection(c,database){return mysql.createConnection({host:c.dbHost,port:c.dbPort,user:'root',password:c.rootPassword,database,dateStrings:true,timezone:'Z',supportBigNumbers:true,bigNumberStrings:true,jsonStrings:true,multipleStatements:false});}
async function readTable(cx,name){
 const [create]=await cx.query(`SHOW CREATE TABLE ${identifier(name)}`);
 const [count]=await cx.query(`SELECT COUNT(*) AS count FROM ${identifier(name)}`);
 ensure(Number(count[0].count)<=MAX_ROWS,'Demo backup row limit exceeded');
 const [columnInfo]=await cx.query(`SHOW COLUMNS FROM ${identifier(name)}`);
 const byteExpression=columnInfo.map(c=>`COALESCE(OCTET_LENGTH(${identifier(c.Field)}),0)`).join('+');
 const [size]=await cx.query(`SELECT COALESCE(SUM(${byteExpression}),0) AS bytes FROM ${identifier(name)}`);
 // Bound raw payload before loading it into memory; base64 and JSON add overhead.
 ensure(Number(size[0].bytes)<=MAX_TABLE_BYTES/3,'Demo backup raw table size limit exceeded');
 const [rows,fields]=await cx.query({sql:`SELECT * FROM ${identifier(name)}`,rowsAsArray:true});
 const encoded=rows.map(row=>row.map((value,index)=>encode(value,fields[index].columnType)));
 const ddl=create[0]['Create Table'];
 return validateTable({name,ddl,columns:fields.map(f=>f.name),rows:encoded,rowCount:encoded.length,rowSha256:rowDigest(encoded),schemaSha256:sha(normalizedDdl(ddl))});
}
// Keep the SQL public so offline fixtures execute these exact checks. These are
// additional business checks; all tables, including new commerce tables, remain
// covered by the generic schema/row/BLOB digests above.
export const BUSINESS_CHECKS=Object.freeze({
  walletLedger:`SELECT COUNT(*) AS failures FROM wallets w LEFT JOIN (SELECT user_id,SUM(delta_available) a,SUM(delta_reserved) f,SUM(delta_growth) g,SUM(delta_recovery) r FROM ledger_entries GROUP BY user_id) l ON l.user_id=w.user_id WHERE w.available_points<>COALESCE(l.a,0) OR w.frozen_points<>COALESCE(l.f,0) OR w.growth_mileage<>COALESCE(l.g,0) OR w.recovery_due<>COALESCE(l.r,0)`,
  walletLots:`SELECT COUNT(*) AS failures FROM wallets w LEFT JOIN (SELECT user_id,SUM(available) a,SUM(reserved) f FROM point_lots GROUP BY user_id) p ON p.user_id=w.user_id WHERE w.available_points<>COALESCE(p.a,0) OR w.frozen_points<>COALESCE(p.f,0)`,
  inventoryReservations:`SELECT COUNT(*) AS failures FROM inventory i LEFT JOIN (SELECT reward_id,site_id,SUM(quantity) q FROM (SELECT reward_id,site_id,quantity FROM redemption_orders WHERE status IN ('PREPARING','READY') UNION ALL SELECT reward_id,site_id,1 quantity FROM commerce_requests WHERE kind='HIGH_VALUE' AND status IN ('PENDING','PARTIAL_APPROVAL','APPROVED','READY')) reservations GROUP BY reward_id,site_id) o ON o.reward_id=i.reward_id AND o.site_id=i.site_id WHERE i.reserved<>COALESCE(o.q,0) OR i.on_hand<i.reserved+i.quarantine`,
  orderReservations:`SELECT COUNT(*) AS failures FROM redemption_orders o LEFT JOIN (SELECT order_id,SUM(points) p FROM order_reservations GROUP BY order_id) r ON r.order_id=o.id WHERE o.total_points<>COALESCE(r.p,0)`,
  lotReservations:`SELECT COUNT(*) AS failures FROM point_lots l LEFT JOIN (SELECT lot_id,SUM(points) points FROM (SELECT a.lot_id,a.points FROM order_reservations a JOIN redemption_orders o ON o.id=a.order_id WHERE o.status IN ('PREPARING','READY') UNION ALL SELECT a.lot_id,a.points FROM commerce_allocations a JOIN commerce_requests r ON r.id=a.request_id WHERE r.status IN ('PENDING','PARTIAL_APPROVAL','APPROVED','READY')) allocations GROUP BY lot_id) held ON held.lot_id=l.entry_id WHERE l.reserved<>COALESCE(held.points,0)`,
  commerceAllocations:`SELECT COUNT(*) AS failures FROM commerce_requests r LEFT JOIN (SELECT request_id,SUM(points) points FROM commerce_allocations GROUP BY request_id) a ON a.request_id=r.id WHERE r.debit_points<>COALESCE(a.points,0) OR (r.kind='APPLICATION' AND r.debit_points<>0)`,
  commerceServiceCapacity:`SELECT COUNT(*) AS failures FROM commerce_slots s LEFT JOIN (SELECT slot_id,SUM(CASE WHEN status IN ('PENDING','PARTIAL_APPROVAL','APPROVED','READY') THEN 1 ELSE 0 END) held,SUM(CASE WHEN status='FULFILLED' THEN 1 ELSE 0 END) used FROM commerce_requests WHERE kind='SERVICE' GROUP BY slot_id) r ON r.slot_id=s.id WHERE s.reserved<>COALESCE(r.held,0) OR s.fulfilled<>COALESCE(r.used,0) OR s.capacity<s.reserved+s.fulfilled`,
  commerceProgramCapacity:`SELECT COUNT(*) AS failures FROM commerce_programs p LEFT JOIN (SELECT program_id,SUM(CASE WHEN status IN ('PENDING','PARTIAL_APPROVAL','APPROVED','READY') THEN 1 ELSE 0 END) held,SUM(CASE WHEN status='FULFILLED' THEN 1 ELSE 0 END) used FROM commerce_requests WHERE kind='APPLICATION' GROUP BY program_id) r ON r.program_id=p.id WHERE p.reserved<>COALESCE(r.held,0) OR p.fulfilled<>COALESCE(r.used,0) OR p.capacity<p.reserved+p.fulfilled`,
  commerceThresholdLedger:`SELECT COUNT(*) AS failures FROM commerce_requests r JOIN ledger_entries l ON l.source_type='COMMERCE' AND l.source_id=r.id WHERE r.kind='APPLICATION' AND (l.delta_available<>0 OR l.delta_reserved<>0 OR l.delta_growth<>0 OR l.delta_recovery<>0)`,
  returnAllocations:`SELECT COUNT(*) AS failures FROM commerce_returns r LEFT JOIN (SELECT return_id,SUM(points) points,SUM(refund_points) refunded,SUM(recovery_settled_points) settled FROM commerce_return_allocations GROUP BY return_id) a ON a.return_id=r.id WHERE (r.status IN ('QUARANTINED','RESTOCKED','DISPOSED') AND (r.total_points<>COALESCE(a.points,0) OR r.refund_points<>COALESCE(a.refunded,0) OR r.recovery_settled_points<>COALESCE(a.settled,0))) OR (r.status NOT IN ('QUARANTINED','RESTOCKED','DISPOSED') AND (COALESCE(a.points,0)<>0 OR r.refund_points<>0 OR r.recovery_settled_points<>0))`,
  returnLedger:`SELECT COUNT(*) AS failures FROM commerce_returns r LEFT JOIN (SELECT source_id,SUM(delta_available) a,SUM(delta_reserved) f,SUM(delta_growth) g,SUM(delta_recovery) d FROM ledger_entries WHERE source_type='RETURN' GROUP BY source_id) l ON l.source_id=r.id WHERE r.refund_points<>COALESCE(l.a,0) OR COALESCE(l.f,0)<>0 OR COALESCE(l.g,0)<>0 OR r.recovery_settled_points<>-COALESCE(l.d,0)`,
  quarantineReturns:`SELECT COUNT(*) AS failures FROM inventory i LEFT JOIN (SELECT reward_id,site_id,SUM(quantity) q FROM commerce_returns WHERE status='QUARANTINED' GROUP BY reward_id,site_id) r ON r.reward_id=i.reward_id AND r.site_id=i.site_id WHERE i.quarantine<>COALESCE(r.q,0)`,
  recoveryLots:`SELECT COUNT(*) AS failures FROM wallets w LEFT JOIN (SELECT user_id,SUM(consumed_revoked-recovery_settled) due FROM point_lots GROUP BY user_id) l ON l.user_id=w.user_id WHERE w.recovery_due<>COALESCE(l.due,0)`,
  lotProvenance:`SELECT COUNT(*) AS failures FROM point_lots l LEFT JOIN point_lots p ON p.entry_id=l.parent_entry_id LEFT JOIN point_lots root ON root.entry_id=l.root_entry_id WHERE l.transferred>l.expired OR l.expired_revoked>l.expired-l.transferred OR l.consumed_revoked>l.consumed OR l.recovery_settled>l.consumed_revoked OR (l.parent_entry_id IS NOT NULL AND (p.entry_id IS NULL OR p.user_id<>l.user_id OR l.root_entry_id IS NULL OR l.root_entry_id<>COALESCE(p.root_entry_id,p.entry_id))) OR (l.root_entry_id IS NOT NULL AND (root.entry_id IS NULL OR root.user_id<>l.user_id OR root.parent_entry_id IS NOT NULL))`,
  entitlementLots:`SELECT COUNT(*) AS failures FROM entitlements e LEFT JOIN (SELECT el.family_id,el.user_id,SUM(l.available+l.reserved+l.consumed-l.consumed_revoked+l.expired-l.transferred-l.expired_revoked) entitlement,SUM(l.consumed_revoked) revoked FROM entitlement_lots el JOIN point_lots l ON l.user_id=el.user_id AND COALESCE(l.root_entry_id,l.entry_id)=el.entry_id GROUP BY el.family_id,el.user_id) p ON p.family_id=e.family_id AND p.user_id=e.user_id WHERE e.target_points<>COALESCE(p.entitlement,0) OR e.recovery_recorded<>COALESCE(p.revoked,0)`,
  attachmentBytes:`SELECT COUNT(*) AS failures FROM private_files WHERE byte_size<>OCTET_LENGTH(content) OR sha256<>SHA2(content,256)`
});
export async function invariants(cx){
 const result={};for(const [name,sql]of Object.entries(BUSINESS_CHECKS)){const [rows]=await cx.query(sql);result[name]=Number(rows[0].failures);}
 return result;
}
async function snapshot(c,root,id){
 const dir=path.join(root,id);fs.mkdirSync(dir,{recursive:false,mode:0o700});
 const cx=await connection(c,c.database);let locked=false;let transaction=false;
 try{
  const [lock]=await cx.execute('SELECT GET_LOCK(?, 60) AS acquired',[`ymm:schema:${c.database}`]);
  ensure(Number(lock[0]?.acquired)===1,'Schema lock unavailable');locked=true;
  await cx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
  await cx.query('START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY');transaction=true;
  const [tables]=await cx.execute('SELECT TABLE_NAME AS name,TABLE_TYPE AS type,ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME',[c.database]);
  ensure(tables.length>0&&tables.every(t=>t.type==='BASE TABLE'&&t.engine==='InnoDB'),'Backup supports nonempty InnoDB-only schemas');
  const [triggers]=await cx.execute('SELECT COUNT(*) AS count FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=?',[c.database]);
  const [routines]=await cx.execute('SELECT COUNT(*) AS count FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=?',[c.database]);
  const [events]=await cx.execute('SELECT COUNT(*) AS count FROM information_schema.EVENTS WHERE EVENT_SCHEMA=?',[c.database]);
  ensure([triggers,routines,events].every(r=>Number(r[0].count)===0),'Stored routines, triggers and events require a different backup format');
  const manifest={format:FORMAT,runId:id,at:new Date().toISOString(),sourceDatabase:c.database,sourceProfile:c.profile,sourceSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),contractSha256:fs.readFileSync('packages/contracts/sha256.txt','utf8').trim(),tables:[],invariants:await invariants(cx)};
  for(const {name}of tables){
   const table=await readTable(cx,name);const data=JSON.stringify(table);
   ensure(Buffer.byteLength(data)<=MAX_TABLE_BYTES,'Demo backup table size limit exceeded');
   writePrivate(path.join(dir,name+'.json'),data);
   manifest.tables.push({name,file:name+'.json',fileSha256:sha(data),rowCount:table.rowCount,rowSha256:table.rowSha256,schemaSha256:table.schemaSha256});
  }
  await cx.commit();transaction=false;
  const serialized=JSON.stringify(manifest,null,2);writePrivate(path.join(dir,'manifest.json'),serialized);writePrivate(path.join(dir,'manifest.sha256'),sha(serialized)+'\n');
  return manifest;
 }finally{
  try{if(transaction)await cx.rollback();}finally{try{if(locked)await cx.execute('SELECT RELEASE_LOCK(?)',[`ymm:schema:${c.database}`]);}finally{await cx.end();}}
 }
}
function readArchive(root,id){
 const dir=assertArchiveDirectory(root,id);
 for(const name of ['manifest.json','manifest.sha256'])ensure(fs.realpathSync(path.join(dir,name))===path.resolve(dir,name),'Backup manifest path boundary failed');
 const data=fs.readFileSync(path.join(dir,'manifest.json'),'utf8');
 ensure(sha(data)===fs.readFileSync(path.join(dir,'manifest.sha256'),'utf8').trim(),'Backup manifest checksum mismatch');
 const manifest=JSON.parse(data);
 ensure(manifest.format===FORMAT&&manifest.runId===id&&manifest.sourceDatabase==='ym_integration'&&manifest.sourceProfile==='integration','Incompatible backup manifest');
 ensure(Array.isArray(manifest.tables)&&manifest.tables.length>0&&new Set(manifest.tables.map(t=>t.name)).size===manifest.tables.length,'Invalid backup table list');
 const tables=manifest.tables.map(entry=>{
  identifier(entry.name);ensure(entry.file===entry.name+'.json','Invalid backup table filename');const file=path.join(dir,entry.file);
  ensure(fs.realpathSync(file)===path.resolve(file)&&fs.statSync(file).size<=MAX_TABLE_BYTES,'Backup table path/size boundary failed');
  const text=fs.readFileSync(file,'utf8');ensure(sha(text)===entry.fileSha256,'Backup table checksum mismatch');
  const table=validateTable(JSON.parse(text));ensure(table.name===entry.name&&table.rowCount===entry.rowCount&&table.rowSha256===entry.rowSha256&&table.schemaSha256===entry.schemaSha256,'Backup table manifest mismatch');return table;
 });
 return {manifest,tables};
}
async function restore(c,root,id,report){
 // Validate every archived byte before creating a new database. No target override or DROP exists.
 const {manifest,tables}=readArchive(root,id);
 const clone='ym_restore_'+new Date().toISOString().replace(/\D/g,'').slice(0,14)+'_'+randomBytes(6).toString('hex');
 ensure(/^ym_restore_\d{14}_[a-f0-9]{12}$/.test(clone)&&clone!==c.database,'Clone boundary failed');
 const cx=await connection(c);let transaction=false;
 try{
  report.step='CREATE_FRESH_CLONE';await cx.query(`CREATE DATABASE ${identifier(clone)} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
  report.cloneDatabase=clone;report.cloneRetained=true;
  await cx.changeUser({database:clone});
  const [active]=await cx.query('SELECT DATABASE() AS name');ensure(active[0].name===clone,'Restore connection is not in the new clone');
  await cx.query('SET SESSION FOREIGN_KEY_CHECKS=0');
  for(const table of tables){report.step='RESTORE_SCHEMA:'+table.name;await cx.query(table.ddl);}
  await cx.beginTransaction();transaction=true;
  for(const table of tables){
   report.step='RESTORE_ROWS:'+table.name;
   const sql=`INSERT INTO ${identifier(table.name)} (${table.columns.map(identifier).join(',')}) VALUES (${table.columns.map(()=>'?').join(',')})`;
   for(const row of table.rows)await cx.execute(sql,row.map(decode));
  }
  await cx.commit();transaction=false;await cx.query('SET SESSION FOREIGN_KEY_CHECKS=1');
  const verification=[];report.tables=verification;
  for(const expected of tables){
   report.step='VERIFY_TABLE:'+expected.name;
   const actual=await readTable(cx,expected.name);
   ensure(actual.rowCount===expected.rowCount&&actual.rowSha256===expected.rowSha256&&actual.schemaSha256===expected.schemaSha256,'Restored table differs from backup');
   verification.push({name:actual.name,rowCount:actual.rowCount,rowSha256:actual.rowSha256,schemaSha256:actual.schemaSha256,status:'PASS'});
  }
  report.step='VERIFY_BUSINESS_INVARIANTS';const restoredInvariants=await invariants(cx);
  ensure(JSON.stringify(restoredInvariants)===JSON.stringify(manifest.invariants),'Restored business invariants differ from source snapshot');
  report.sourceSha=manifest.sourceSha;report.contractSha256=manifest.contractSha256;report.sourceDatabase=manifest.sourceDatabase;
  report.snapshotAt=manifest.at;report.tables=verification;report.invariants=restoredInvariants;
  report.attachmentBlobRows=verification.find(t=>t.name==='private_files')?.rowCount||0;
  report.attachmentCoverage=report.attachmentBlobRows>0?'VERIFIED':'NO_ATTACHMENTS_IN_SNAPSHOT';
  ensure(Object.values(restoredInvariants).every(n=>n===0),'Backup restores accurately but source business invariants contain failures');
  ensure(report.attachmentBlobRows>0,'Backup restores accurately but an uploaded fictional attachment is required to verify BLOB recovery');
  return manifest;
 }finally{try{if(transaction)await cx.rollback();}finally{await cx.end();}}
}
async function main(){
 const args=process.argv.slice(2);ensure(args.length===0||(args.length===2&&args[0]==='--restore'),'Usage: node scripts/backup-restore.mjs [--restore run_YYYYMMDDHHMMSS_hex]');
 const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));assertConfig(c);
 const root=path.resolve('.runtime/backups');fs.mkdirSync(root,{recursive:true,mode:0o700});ensure(fs.realpathSync(root)===root,'Backup root must not redirect outside the workspace');
 const id=args.length?safeRunId(args[1]):runId();
 const report={at:new Date().toISOString(),status:'RUNNING',step:'PREFLIGHT',mode:args.length?'RESTORE_EXISTING':'BACKUP_AND_RESTORE',backupRunId:id,backupDirectory:path.join(root,id),sourceWrites:false,originalDatabaseReplaced:false,connectionSecretsInReport:false,archiveContainsPrivateData:true};
 fs.mkdirSync('evidence/g2',{recursive:true});
 const reportPath=path.join('evidence/g2',`backup-restore-${id}-${randomBytes(3).toString('hex')}.json`);
 try{
  if(!args.length){report.step='READ_CONSISTENT_SNAPSHOT';await snapshot(c,root,id);}
  report.step='VALIDATE_ARCHIVE';await restore(c,root,id,report);report.status='PASS';report.step='COMPLETE';report.exitCode=0;
  console.log(`PASS: consistent backup restored into ${report.cloneDatabase}; ${report.tables.length} tables match, all business and attachment checks pass.`);
  console.log(`Private backup retained: .runtime/backups/${id}`);
  console.log(`Safe repeat restore: node scripts/backup-restore.mjs --restore ${id}`);
 }catch(error){
  report.status='FAIL';report.exitCode=1;report.failure='Recovery drill failed; original database retained. Any created clone and private backup are retained for local diagnosis.';
  if(error instanceof RecoveryError)report.failureReason=error.message;
  if(error&&typeof error.code==='string'&&/^[A-Z_0-9]+$/.test(error.code))report.failureCode=error.code;
  console.error(report.failure);process.exitCode=1;
 }finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(`Evidence: ${reportPath}`);}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){main().catch(()=>{console.error('Recovery preflight failed; no original database was changed. Check the integration demo configuration and backup identifier.');process.exitCode=1;});}
