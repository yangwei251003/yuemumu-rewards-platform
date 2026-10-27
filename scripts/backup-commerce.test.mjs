import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {BUSINESS_CHECKS,invariants,encode,decode,rowDigest,sha,validateTable} from './backup-restore.mjs';

// Offline SQL verification: these exact ANSI SELECT checks execute against an
// in-memory SQLite fixture, not a mock query result. This is deliberately not a
// claim that the MySQL backup/restore drill has run.
function database(){
 const db=new DatabaseSync(':memory:');
 db.function('OCTET_LENGTH',value=>Buffer.byteLength(typeof value==='string'?value:Buffer.from(value)));
 db.function('SHA2',(value,bits)=>{assert.equal(bits,256);return sha(typeof value==='string'?value:Buffer.from(value));});
 db.exec(`
 CREATE TABLE wallets(user_id TEXT,available_points INTEGER,frozen_points INTEGER,growth_mileage INTEGER,recovery_due INTEGER);
 CREATE TABLE ledger_entries(id TEXT,user_id TEXT,delta_available INTEGER,delta_reserved INTEGER,delta_growth INTEGER,delta_recovery INTEGER,source_type TEXT,source_id TEXT);
 CREATE TABLE point_lots(entry_id TEXT,user_id TEXT,available INTEGER,reserved INTEGER,consumed INTEGER,reversed INTEGER,expired INTEGER,transferred INTEGER,consumed_revoked INTEGER,expired_revoked INTEGER,recovery_settled INTEGER,parent_entry_id TEXT,root_entry_id TEXT);
 CREATE TABLE inventory(reward_id TEXT,site_id TEXT,on_hand INTEGER,reserved INTEGER,quarantine INTEGER);
 CREATE TABLE redemption_orders(id TEXT,user_id TEXT,reward_id TEXT,site_id TEXT,quantity INTEGER,total_points INTEGER,status TEXT);
 CREATE TABLE order_reservations(order_id TEXT,lot_id TEXT,points INTEGER);
 CREATE TABLE commerce_requests(id TEXT,user_id TEXT,reward_id TEXT,site_id TEXT,kind TEXT,status TEXT,debit_points INTEGER,slot_id TEXT,program_id TEXT);
 CREATE TABLE commerce_allocations(request_id TEXT,lot_id TEXT,points INTEGER);
 CREATE TABLE commerce_slots(id TEXT,capacity INTEGER,reserved INTEGER,fulfilled INTEGER);
 CREATE TABLE commerce_programs(id TEXT,capacity INTEGER,reserved INTEGER,fulfilled INTEGER);
 CREATE TABLE commerce_returns(id TEXT,user_id TEXT,reward_id TEXT,site_id TEXT,quantity INTEGER,total_points INTEGER,status TEXT,refund_points INTEGER,recovery_settled_points INTEGER);
 CREATE TABLE commerce_return_allocations(return_id TEXT,lot_id TEXT,points INTEGER,refund_points INTEGER,recovery_settled_points INTEGER);
 CREATE TABLE entitlements(family_id TEXT,user_id TEXT,target_points INTEGER,recovery_recorded INTEGER);
 CREATE TABLE entitlement_lots(family_id TEXT,user_id TEXT,entry_id TEXT);
 CREATE TABLE private_files(id TEXT,byte_size INTEGER,sha256 TEXT,content BLOB);
 `);
 return db;
}
const check=(db,name)=>Number(db.prepare(BUSINESS_CHECKS[name]).get().failures);
const all=db=>Object.fromEntries(Object.keys(BUSINESS_CHECKS).map(name=>[name,check(db,name)]));
function clean(db){assert.deepEqual(all(db),Object.fromEntries(Object.keys(BUSINESS_CHECKS).map(name=>[name,0])));}
function addLot(db,id,available,reserved=0,consumed=0,parent=null,root=null){db.prepare('INSERT INTO point_lots VALUES (?,?, ?,?,?,0,0,0,0,0,0,?,?)').run(id,'student',available,reserved,consumed,parent,root);}
function ledger(db,id,available=0,reserved=0,growth=0,recovery=0,source='FIXTURE',sourceId=id){db.prepare('INSERT INTO ledger_entries VALUES (?, ?,?,?,?,?,?,?)').run(id,'student',available,reserved,growth,recovery,source,sourceId);}
function frozen(){
 const db=database();
 db.exec(`INSERT INTO wallets VALUES ('student',220,280,500,0);
 INSERT INTO inventory VALUES ('physical','site',10,2,0);
 INSERT INTO redemption_orders VALUES ('ordinary','student','physical','site',1,30,'PREPARING');
 INSERT INTO order_reservations VALUES ('ordinary','root',30);
 INSERT INTO commerce_requests VALUES ('high','student','physical','site','HIGH_VALUE','APPROVED',50,NULL,NULL),('service','student','R010','site','SERVICE','APPROVED',200,'slot',NULL),('application','student','R027','site','APPLICATION','PENDING',0,NULL,'program');
 INSERT INTO commerce_allocations VALUES ('high','root',50),('service','root',200);
 INSERT INTO commerce_slots VALUES ('slot',5,1,0);
 INSERT INTO commerce_programs VALUES ('program',3,1,0);
 INSERT INTO entitlements VALUES ('family','student',500,0);
 INSERT INTO entitlement_lots VALUES ('family','student','root');`);
 addLot(db,'root',220,280);ledger(db,'earn',500,0,500);ledger(db,'reserve',-280,280);return db;
}
function returned({revoked=false}={}){
 const db=database();
 db.exec(`INSERT INTO wallets VALUES ('student',${revoked?10:50},0,${revoked?10:50},0);
 INSERT INTO inventory VALUES ('physical','site',10,0,1);
 INSERT INTO redemption_orders VALUES ('ordinary','student','physical','site',1,30,'FULFILLED');
 INSERT INTO order_reservations VALUES ('ordinary','root',30);
 INSERT INTO commerce_returns VALUES ('return','student','physical','site',1,30,'QUARANTINED',${revoked?10:30},${revoked?20:0});
 INSERT INTO commerce_return_allocations VALUES ('return','root',30,${revoked?10:30},${revoked?20:0});
 INSERT INTO entitlements VALUES ('family','student',${revoked?10:50},0);
 INSERT INTO entitlement_lots VALUES ('family','student','root');`);
 addLot(db,'root',revoked?0:20);addLot(db,'refund',revoked?10:30,0,0,'root','root');
 db.exec(`UPDATE point_lots SET expired=${revoked?10:30},transferred=${revoked?10:30},reversed=${revoked?40:0} WHERE entry_id='root'`);
 ledger(db,'earn',50,0,50);ledger(db,'spend',-30);if(revoked)ledger(db,'reverse',-20,0,-40,20);ledger(db,'refund',revoked?10:30,0,0,revoked?-20:0,'RETURN','return');return db;
}

test('offline exact SQL accepts ordinary + high-value inventory and service frozen points together',async()=>{
 const db=frozen();try{clean(db);const adapter={query:async sql=>[db.prepare(sql).all()]};assert.deepEqual(await invariants(adapter),all(db));}finally{db.close();}
});
test('offline lot allocation mismatch is detected even when both wallet aggregate checks still reconcile',()=>{
 const db=frozen();try{addLot(db,'other',10);ledger(db,'other',10,0,10);db.exec("UPDATE wallets SET available_points=available_points+10,growth_mileage=growth_mileage+10");clean(db);
 db.exec("UPDATE point_lots SET available=available+10,reserved=reserved-10 WHERE entry_id='root';UPDATE point_lots SET available=0,reserved=10 WHERE entry_id='other'");
 assert.equal(check(db,'walletLedger'),0);assert.equal(check(db,'walletLots'),0);assert.equal(check(db,'lotReservations'),2);
 }finally{db.close();}
});
test('offline service and program counters distinguish waiting, completed and cancelled requests',()=>{
 const db=frozen();try{db.exec("UPDATE commerce_requests SET status='FULFILLED' WHERE id='service'");assert.equal(check(db,'commerceServiceCapacity'),1);db.exec("UPDATE commerce_slots SET reserved=0,fulfilled=1;UPDATE point_lots SET reserved=reserved-200,consumed=consumed+200;UPDATE wallets SET frozen_points=frozen_points-200");ledger(db,'service-done',0,-200,0,0,'COMMERCE','service');clean(db);
 db.exec("UPDATE commerce_requests SET status='CANCELLED' WHERE id='application'");assert.equal(check(db,'commerceProgramCapacity'),1);db.exec('UPDATE commerce_programs SET reserved=0');clean(db);
 }finally{db.close();}
});
test('offline application threshold never creates debit allocations or nonzero points ledger effects',()=>{
 const db=frozen();try{ledger(db,'illegal-threshold',-1,0,0,0,'COMMERCE','application');assert.equal(check(db,'commerceThresholdLedger'),1);db.exec("UPDATE commerce_requests SET debit_points=4000 WHERE id='application'");assert.equal(check(db,'commerceAllocations'),1);}finally{db.close();}
});
test('offline lawful refund keeps growth, original entitlement and quarantine consistent',()=>{
 const db=returned();try{clean(db);db.exec("UPDATE commerce_returns SET status='RESTOCKED'");assert.equal(check(db,'quarantineReturns'),1);db.exec('UPDATE inventory SET quarantine=0');clean(db);
 db.exec("UPDATE ledger_entries SET delta_growth=1 WHERE id='refund'");assert.equal(check(db,'returnLedger'),1);
 }finally{db.close();}
});
test('offline partial revoked spending returns only lawful remainder and settles matching debt once',()=>{
 const db=returned({revoked:true});try{clean(db);db.exec("UPDATE ledger_entries SET delta_recovery=-40 WHERE id='refund'");assert.equal(check(db,'returnLedger'),1);assert.equal(check(db,'walletLedger'),1);db.exec("UPDATE ledger_entries SET delta_recovery=-20 WHERE id='refund';UPDATE commerce_return_allocations SET recovery_settled_points=10");assert.equal(check(db,'returnAllocations'),1);}finally{db.close();}
});
test('offline prior approved recovery fulfillment preserves entitlement and leaves no outstanding debt',()=>{
 const db=database();try{db.exec("INSERT INTO wallets VALUES ('student',0,0,10,0);INSERT INTO entitlements VALUES ('family','student',10,20);INSERT INTO entitlement_lots VALUES ('family','student','root')");addLot(db,'root',0,0,30);db.exec("UPDATE point_lots SET reversed=20,consumed_revoked=20,recovery_settled=20");ledger(db,'earn',50,0,50);ledger(db,'spend',-30);ledger(db,'reverse',-20,0,-40,20);ledger(db,'settlement',0,0,0,-20,'RECOVERY','root');clean(db);db.exec('UPDATE wallets SET recovery_due=20');assert.equal(check(db,'recoveryLots'),1);db.exec('UPDATE wallets SET recovery_due=0;UPDATE point_lots SET recovery_settled=21');assert.equal(check(db,'lotProvenance'),1);}finally{db.close();}
});
test('offline inactive return has no refund allocations and descendant lot cannot lose its origin',()=>{
 const db=returned();try{db.exec("UPDATE commerce_returns SET status='APPROVED'");assert.equal(check(db,'returnAllocations'),1);db.exec("UPDATE commerce_returns SET status='QUARANTINED';UPDATE point_lots SET root_entry_id='missing' WHERE entry_id='refund'");assert.equal(check(db,'lotProvenance'),1);assert.equal(check(db,'entitlementLots'),1);}finally{db.close();}
});
test('offline private BLOB checks use exact bytes, including unicode and binary payload',()=>{
 const db=database();try{const content=Buffer.from('虚构凭证\0\xff');db.prepare('INSERT INTO private_files VALUES (?,?,?,?)').run('file',content.length,sha(content),content);clean(db);db.exec('UPDATE private_files SET byte_size=byte_size+1');assert.equal(check(db,'attachmentBytes'),1);}finally{db.close();}
});
test('generic archive roundtrip retains new commerce rows and detects altered refund or recovery metadata',()=>{
 for(const name of ['commerce_requests','commerce_return_allocations','point_recovery_settlements','commerce_action_notes','commerce_wishes']){
  const ddl=`CREATE TABLE \`${name}\` (\n  \`id\` varchar(64) NOT NULL,\n  \`payload\` json NOT NULL\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  const payload='{"refundPoints":10,"recoverySettledPoints":20,"title":"虚构心愿","large":900719925474099312345}',rows=[['fixture',encode(payload,245)]];
  const table={name,ddl,columns:['id','payload'],rows,rowCount:1,rowSha256:rowDigest(rows),schemaSha256:sha(ddl)};
  const decoded=validateTable(JSON.parse(JSON.stringify(table)));assert.equal(decode(decoded.rows[0][1]),payload);
  decoded.rows[0][1].data=payload.replace('"recoverySettledPoints":20','"recoverySettledPoints":0');assert.throws(()=>validateTable(decoded),/digest mismatch/);
 }
});
