import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {randomBytes,createHash} from 'node:crypto';
const profile=process.argv[2]||'a';
if(!['a','b','integration'].includes(profile))throw new Error('Choose a, b or integration');
fs.mkdirSync('.runtime',{recursive:true});
if(fs.existsSync('.runtime/config.json')){const existing=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));if(existing.profile!==profile)throw new Error('Existing profile differs; preserve it and choose the correct workspace before setup.');console.log('Existing local configuration retained.');process.exit(0);}
const secret=()=>randomBytes(32).toString('hex');
const suffix=createHash('sha256').update(process.cwd()+':'+profile).digest('hex').slice(0,8);
const ports={a:[3308,3100,8080],b:[3309,3101,18080],integration:[3310,3102,28080]}[profile];
const config={profile,appMode:'demo',dbPort:Number(process.env.YUEMUMU_DB_PORT||ports[0]),apiPort:Number(process.env.YUEMUMU_API_PORT||ports[1]),gatewayPort:Number(process.env.YUEMUMU_GATEWAY_PORT||ports[2]),database:profile==='integration'?'ym_integration':`ym_dev_${profile}`,dbHost:'127.0.0.1',dbUser:`ym_app_${profile}`,dbPassword:secret(),migrationUser:`ym_migrate_${profile}`,migrationPassword:secret(),rootPassword:secret(),demoAccessCode:secret(),staffPassword:secret(),cookiePrefix:`ymm_${profile}_${suffix}`,mysqlBinary:process.env.YUEMUMU_MYSQL_BINARY||'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqld.exe',mysqlData:process.env.YUEMUMU_MYSQL_DATA||path.join(process.env.LOCALAPPDATA||os.tmpdir(),'Yuemumu',suffix,'mysql')};
fs.writeFileSync('.runtime/config.json',JSON.stringify(config,null,2),{mode:0o600});
fs.writeFileSync('.env.local','# Secrets are generated in ignored .runtime/config.json. Never commit or share it.\nAPP_MODE=demo\n',{mode:0o600});
console.log(`Created isolated ${profile.toUpperCase()} configuration: ${config.database}, gateway ${config.gatewayPort}. Secrets stay local.`);
