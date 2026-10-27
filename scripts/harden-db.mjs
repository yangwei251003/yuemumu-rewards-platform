import fs from 'node:fs';import mysql from 'mysql2/promise';
const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
if(!/^ym_(dev_[ab]|integration)$/.test(c.database)||!/^ym_app_(a|b|integration)$/.test(c.dbUser))throw new Error('Unexpected local principal');
const cx=await mysql.createConnection({host:c.dbHost,port:c.dbPort,user:'root',password:c.rootPassword});
try{
 const [grants]=await cx.query('SHOW GRANTS FOR ?@\'127.0.0.1\'',[c.dbUser]);
 if(grants.some(row=>Object.values(row).some(v=>v.includes('UPDATE')&&v.includes('ON `'+c.database+'`.*'))))await cx.query(`REVOKE UPDATE ON \`${c.database}\`.* FROM ?@'127.0.0.1'`,[c.dbUser]);
 for(const table of ['wallets','point_lots','sessions','activities','registrations','submissions','flow_approvals','outbox_events','inventory','redemption_orders','projects','competitions','award_requests','entitlements','skill_badges','governance_cases','sanctions','appeals','notifications','learning_units','project_recruitments','project_applications','membership_applications','academic_org_locks','meeting_claims','passive_candidates','reporting_org_locks','reporting_import_batches','commerce_slots','commerce_programs','commerce_requests','commerce_stock_requests','commerce_returns','commerce_wishes','conversion_requests','point_adjustment_requests','case_review_rounds'])await cx.query(`GRANT UPDATE ON \`${c.database}\`.\`${table}\` TO ?@'127.0.0.1'`,[c.dbUser]);
 await cx.query(`GRANT UPDATE (membership_status,roles) ON \`${c.database}\`.\`users\` TO ?@'127.0.0.1'`,[c.dbUser]);
 for(const [table,columns]of [['role_scopes','scope_type,scope_id'],['access_subject_versions','version'],['access_requests','status,version,applied_at']])await cx.query(`GRANT UPDATE (${columns}) ON \`${c.database}\`.\`${table}\` TO ?@'127.0.0.1'`,[c.dbUser]);
 console.log('Application SELECT/INSERT; UPDATE only approved state projections. Ledger, audit and decisions remain append-only; no DELETE or DDL.');
}finally{await cx.end();}
