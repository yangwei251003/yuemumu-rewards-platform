import fs from 'node:fs';
export interface LocalConfig {
 profile: 'a'|'b'|'integration'; appMode: string; dbPort: number; apiPort: number; gatewayPort: number;
 database: string; dbHost: string; dbUser: string; dbPassword: string; migrationUser: string;
 migrationPassword: string; rootPassword: string; demoAccessCode: string; staffPassword: string; cookiePrefix: string;
}
export function config(): LocalConfig {
 const c: LocalConfig=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
 c.appMode=process.env.APP_MODE||c.appMode;
 if(c.appMode!=='demo')throw new Error('G0 supports isolated demo only; production identity provider not configured');
 if(c.dbHost!=='127.0.0.1'||!/^ym_(dev_[ab]|integration)$/.test(c.database))throw new Error('Local demo database boundary failed');
 if([c.demoAccessCode,c.staffPassword,c.dbPassword].some(v=>v.length<32))throw new Error('Weak local secret rejected');
 return c;
}
