import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
const fd=fs.openSync('.runtime/browser-open.log','a');const child=spawn(process.execPath,[path.resolve('scripts/open-browser.mjs')],{cwd:process.cwd(),windowsHide:true,detached:true,stdio:['ignore',fd,fd]});child.unref();fs.closeSync(fd);console.log('Opening authenticated local demo in Chrome.');
