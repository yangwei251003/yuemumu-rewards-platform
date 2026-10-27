import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertConfig,identifier,encode,decode,rowDigest,sha,validateTable} from './backup-restore.mjs';

test('recovery profile guard refuses development databases, external hosts, ports and production APP_MODE',()=>{
 const previous=process.env.APP_MODE;delete process.env.APP_MODE;
 try{
  const c={profile:'integration',database:'ym_integration',dbHost:'127.0.0.1',dbPort:3310,appMode:'demo',rootPassword:'x'.repeat(32)};
  assert.doesNotThrow(()=>assertConfig(c));
  for(const patch of [{profile:'a'},{database:'ym_dev_b'},{dbHost:'localhost'},{dbHost:'203.0.113.1'},{dbPort:3306},{appMode:'production'},{rootPassword:''}])assert.throws(()=>assertConfig({...c,...patch}));
  process.env.APP_MODE='production';assert.throws(()=>assertConfig(c));
 }finally{if(previous===undefined)delete process.env.APP_MODE;else process.env.APP_MODE=previous;}
});
test('database identifiers cannot inject SQL or escape a schema boundary',()=>{
 assert.equal(identifier('ym_restore_20260101000000_abcdefabcdef'),'`ym_restore_20260101000000_abcdefabcdef`');
 for(const value of ['ym_integration.users','x`','../users','a;DROP TABLE users','',null,'x'.repeat(65)])assert.throws(()=>identifier(value));
});
test('BLOB round trip keeps every byte including NUL, high bytes, and empty content',()=>{
 for(const b of [Buffer.alloc(0),Buffer.from(Array.from({length:256},(_,i)=>i)),Buffer.alloc(524288,253)])assert.deepEqual(decode(encode(b,252)),b);
 assert.throws(()=>decode({type:'bytes',data:'%%%'}));assert.throws(()=>decode({type:'bytes',data:'YQ'}));
});
test('JSON null differs from SQL NULL and large JSON integers stay exact',()=>{
 for(const json of ['null','"hello"','{"n":900719925474099312345,"nested":[null,true]}'])assert.equal(decode(encode(json,245)),json);
 assert.equal(decode(encode(null,245)),null);
 assert.notDeepEqual(encode('null',245),encode(null,245));
 assert.throws(()=>decode({type:'json',data:'broken'}));
});
test('digest ignores SELECT row order but detects duplicates, edits and BLOB changes',()=>{
 const a=[[1,'a'],[2,encode(Buffer.from('hi'),252)]];
 assert.equal(rowDigest(a),rowDigest([...a].reverse()));
 assert.notEqual(rowDigest(a),rowDigest([...a,a[0]]));
 assert.notEqual(rowDigest(a),rowDigest([[1,'a'],[2,encode(Buffer.from('ho'),252)]]));
});
function fixture(){const ddl='CREATE TABLE `example` (\n  `id` int NOT NULL,\n  PRIMARY KEY (`id`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';const rows=[[1],[2]];return {name:'example',ddl,columns:['id'],rows,rowCount:2,rowSha256:rowDigest(rows),schemaSha256:sha(ddl)};}
test('archive schema and rows reject corruption before any database is created',()=>{
 assert.doesNotThrow(()=>validateTable(fixture()));
 for(const patch of [{name:'other'},{rowCount:1},{rows:[[1,2],[2]]},{rows:[[1],[3]]},{columns:['id','id']},{rowSha256:'0'.repeat(64)},{schemaSha256:'0'.repeat(64)}])assert.throws(()=>validateTable({...fixture(),...patch}));
});
test('archive restores only InnoDB table definitions with no external storage or schema reference',()=>{
 for(const ddl of ['CREATE TABLE `example` LIKE `users`',fixture().ddl.replace('InnoDB','MyISAM'),fixture().ddl+' DATA DIRECTORY="C:/temp"',fixture().ddl.replace('PRIMARY KEY (`id`)','FOREIGN KEY (`id`) REFERENCES `ym_integration`.`users` (`id`)')])assert.throws(()=>validateTable({...fixture(),ddl,schemaSha256:sha(ddl)}));
});
test('archive values reject unsupported tags and hidden metadata',()=>{
 for(const value of [{type:'unknown',data:'x'},{type:'bytes',data:'YQ==',extra:true},{data:'x'},[],{type:'json',data:0}])assert.throws(()=>decode(value));
});
