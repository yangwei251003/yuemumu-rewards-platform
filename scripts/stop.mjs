import fs from 'node:fs';import path from 'node:path';
// Only stop PIDs recorded by this worktree; verify their executable command before stopping on Windows.
import {execFileSync} from 'node:child_process';
for(const name of ['gateway','api']){const file=`.runtime/${name}.process.json`;if(!fs.existsSync(file))continue;const record=JSON.parse(fs.readFileSync(file,'utf8'));const pid=record.pid;if(!Number.isSafeInteger(pid)||pid<=0)throw new Error('Invalid PID');
 const cmd=execFileSync('powershell.exe',['-NoProfile','-Command',`[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false); (Get-CimInstance Win32_Process -Filter "ProcessId=${pid}").CommandLine`],{encoding:'utf8',windowsHide:true});
 if(!cmd.trim()){console.log(name+' already stopped');continue;}
 const expected=path.resolve(name==='api'?'dist/apps/api/src/main.js':'scripts/gateway.mjs');if(record.script!==expected||!cmd.includes(expected))throw new Error('PID belongs to another worktree; refusing to stop');process.kill(pid);console.log('Stopped '+name);
}
