#!/usr/bin/env node
/** Zero-dependency non-destructive host diagnostics. Does not install anything. */
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import net from 'node:net';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cmds=[['git',['--version']],['pnpm',['--version']],['docker',['--version']],['mysql',['--version']]];
const commands=cmds.map(([command,args])=>{const p=spawnSync(command,args,{encoding:'utf8',timeout:5000,shell:process.platform==='win32',windowsHide:true});return {command:`${command} ${args.join(' ')}`,exitCode:p.status,available:!p.error&&p.status===0,summary:(p.stdout||p.stderr||p.error?.message||'').trim().slice(0,400)};});
const probe=port=>new Promise(resolve=>{const s=net.createConnection({port,host:'127.0.0.1'});let done=false;const end=busy=>{if(done)return;done=true;s.destroy();resolve({port,listenerDetected:busy});};s.setTimeout(700,()=>end(false));s.on('connect',()=>end(true));s.on('error',()=>end(false));});
const report={checkedAt:new Date().toISOString(),scope:'host_readonly_no_installs',platform:process.platform,arch:process.arch,osRelease:os.release(),node:process.version,totalRamGb:Math.round(os.totalmem()/1024**3*10)/10,freeRamGb:Math.round(os.freemem()/1024**3*10)/10,commands,ports:await Promise.all([8080,18080,3100,3101,3306].map(probe)),notes:['未读取环境变量或密钥，未连接数据库，未创建云资源。','Docker CLI存在不代表Docker服务正在运行；后续由A另做引擎健康检查。','端口探测仅对127.0.0.1建立TCP连接，不扫描外网。','依赖缺失是待处理信息，不允许以本报告宣称开发门已完成。']};
fs.mkdirSync(path.join(root,'.local'),{recursive:true});const target=path.join(root,'.local/preflight.json');fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
console.log(`OS: ${report.platform}/${report.arch}; Node: ${report.node}; RAM: ${report.totalRamGb}GB`);for(const c of commands)console.log(`${c.available?'OK':'待准备'} ${c.command}: ${c.summary}`);console.log('端口: '+report.ports.map(p=>`${p.port}=${p.listenerDetected?'占用':'未检测到监听'}`).join(', '));console.log('本机报告已保存 .local/preflight.json（已被.gitignore忽略）。');console.log('不会自动安装软件、提权、开放公网或使用付费资源。');
