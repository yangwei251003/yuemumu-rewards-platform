import {randomBytes,randomUUID} from 'node:crypto';
import mysql from 'mysql2/promise';
import {config} from '../../packages/db/src/config';
import {sha} from '../../packages/domain/src/ledger';
import {createClient,webTransport,type Audience} from '../../packages/sdk/src';
export const c=config();
export const migration=mysql.createPool({host:c.dbHost,port:c.dbPort,user:c.migrationUser,password:c.migrationPassword,database:c.database,timezone:'Z'});
export const prefix='FLOW_'+randomUUID().slice(0,8);
export async function fixture(suffix:string,roles:string[],audience:Audience='staff',person?:string,org=prefix){
 const id=prefix+'_'+suffix;const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');
 await migration.execute('INSERT INTO users(id,person_id,organization_id,display_name,roles,membership_status,demo_only) VALUES (?,?,?,?,?,?,FALSE)',[id,person||id,org,'隔离流程测试',JSON.stringify(roles),'ACTIVE']);await migration.execute('INSERT INTO wallets(user_id) VALUES (?)',[id]);
 await migration.execute('INSERT INTO sessions(token_hash,user_id,audience,csrf_token,expires_at) VALUES (?,?,?,?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 1 HOUR))',[sha(token),id,audience,csrf]);
 for(const [type,scope]of [['ACTIVITY','*'],['REVIEW',org],['PICKUP','SITE_DEMO'],['PROJECT','*'],['GROWTH_REVIEW',org],['GOVERNANCE',org],['AUDIT',org]])await migration.execute('INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,?,?)',[id,type,scope]);
 const cookie=c.cookiePrefix+'_'+audience+'='+token;
 const client=createClient(webTransport(`http://127.0.0.1:${c.gatewayPort}/api/v1`,(input,init)=>fetch(input,{...init,headers:{...init?.headers,cookie}})),audience);await client.call('getSession');
 return {id,client,cookie,csrf};
}
export const key=()=>({idempotencyKey:randomUUID()});
