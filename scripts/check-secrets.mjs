import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));const secrets=['rootPassword','dbPassword','migrationPassword','demoAccessCode','staffPassword'].map(k=>c[k]);
const files=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean))];let count=0;
for(const file of files){if(!fs.existsSync(file)||!fs.statSync(file).isFile())continue;if(file.startsWith('.runtime/')||file==='.env.local'||file.startsWith('.local/'))throw new Error('Private runtime file tracked: '+file);const bytes=fs.readFileSync(file);if(secrets.some(secret=>bytes.includes(Buffer.from(secret))))throw new Error('Local secret leaked to candidate file: '+file);count++;}
console.log(`PASS ${count} candidate files scanned: generated local secrets absent, runtime files excluded.`);
