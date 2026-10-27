import fs from 'node:fs';const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
const base=`http://127.0.0.1:${c.gatewayPort}`;
for(const path of ['/','/pages/index/index','/admin/','/admin/pickup/','/api/v1/','/api/v1/health']){
 const r=await fetch(base+path,{signal:AbortSignal.timeout(5000)});if(r.status!==200)throw new Error(path+' HTTP '+r.status);console.log('PASS '+path+' HTTP '+r.status);
 if(path.includes('/api/v1')){const h=await r.json();if(!h.databaseReady||h.contractSha256!==fs.readFileSync('packages/contracts/sha256.txt','utf8').trim())throw new Error('Unhealthy database/contract');}else if(!(await r.text()).length)throw new Error(path+' empty built client');
}
for(const path of ['/api/v1/not-real','/api/not-real']){const r=await fetch(base+path);if(r.status!==404||!r.headers.get('content-type')?.includes('application/json'))throw new Error('API fallback swallowed error');const problem=await r.json();if(problem.code!=='NOT_FOUND')throw new Error('Unexpected API error body');console.log('PASS '+path+' JSON 404');}
