import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
const phase=process.argv[2],out=process.env.E2E_OUTPUT_DIR||'evidence/v3/final';
fs.mkdirSync(out,{recursive:true});
const pnpm=path.join(path.dirname(process.execPath),'node_modules/corepack/dist/pnpm.js');
const stages={
 extended:['commerce01','gov01','membership01','meetings01','conversion01','govext01','untrusted-display01'].map(name=>[name,['tests/e2e/'+name+'.mjs']]),
 closing:['v3-regression','keyboard','v3-audit'].map(name=>[name,['tests/e2e/'+name+'.mjs']]),
 checks:[['contract',[pnpm,'contract:check']],['typecheck',[pnpm,'typecheck']],['lint',[pnpm,'lint']],['api-db',[pnpm,'test']],['weapp',[pnpm,'build:weapp']]],
 build:[['h5',[pnpm,'--filter','@ymm/student','build:h5']],['ops-build',[pnpm,'--filter','@ymm/ops','build']]],
 browser:['v3-regression','student','ops','navigation','flow01','flow02','grow01','evidence-revision01','reporting01','access01','resilience01','v3-audit'].map(name=>[name,['tests/e2e/'+name+'.mjs']]),
};
if(!stages[phase])throw new Error('Choose checks, build or browser');
const results=[];
for(const [name,args] of stages[phase]){
 const start=new Date().toISOString(),log=fs.createWriteStream(path.join(out,name+'.log'));
 console.log('START '+name);
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{windowsHide:true,env:{...process.env,E2E_OUTPUT_DIR:out,PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH}});child.stdout.on('data',b=>log.write(b));child.stderr.on('data',b=>log.write(b));child.on('error',reject);child.on('close',resolve);});
 await new Promise(resolve=>log.end(resolve));
 results.push({name,command:[process.execPath,...args].join(' '),start,end:new Date().toISOString(),exitCode:code});
 fs.writeFileSync(path.join(out,phase+'-commands.json'),JSON.stringify(results,null,2)+'\n');
 console.log('END '+name+' exit='+code);
 if(code!==0)process.exitCode=1;
}
