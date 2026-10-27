import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import net from 'node:net';
const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
for(const file of ['dist/apps/api/src/main.js','apps/student/dist/index.html','apps/ops/dist/index.html'])if(!fs.existsSync(file))throw new Error('Run pnpm build first: '+file);
const busy=port=>new Promise(r=>{const s=net.connect(port,'127.0.0.1');s.on('connect',()=>{s.destroy();r(true);});s.on('error',()=>r(false));});
for(const [name,script,port]of [['api','dist/apps/api/src/main.js',c.apiPort],['gateway','scripts/gateway.mjs',c.gatewayPort]]){
 if(await busy(port)){const r=await fetch(`http://127.0.0.1:${port}/api/v1/health`).catch(()=>null);const h=await r?.json().catch(()=>null);if(h?.contractSha256!==fs.readFileSync('packages/contracts/sha256.txt','utf8').trim()||r?.headers.get('X-Instance-ID')!==c.cookiePrefix)throw new Error('Occupied port is not this instance/contract: '+port);console.log(name+' already healthy');continue;}
 const absoluteScript=path.resolve(script);const fd=fs.openSync(`.runtime/${name}.log`,'a');const child=spawn(process.execPath,[absoluteScript],{cwd:process.cwd(),env:{...process.env,NODE_ENV:'production'},stdio:['ignore',fd,fd],windowsHide:true,detached:true});child.unref();fs.closeSync(fd);fs.writeFileSync(`.runtime/${name}.process.json`,JSON.stringify({pid:child.pid,script:absoluteScript,instance:c.cookiePrefix}));
 for(let i=0;i<60;i++){if(await busy(port))break;await new Promise(r=>setTimeout(r,300));}
 if(!(await busy(port)))throw new Error(name+' failed; inspect ignored runtime log');
}
console.log(`Local demo running at http://127.0.0.1:${c.gatewayPort}; passwords are in ignored .runtime/config.json.`);
