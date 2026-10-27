import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

// Explicit local distribution target; never copies runtime configuration or database.
const source=path.resolve('docs/design/teacher-guide');
const target=path.resolve(process.argv[2]||'output/teacher-guide-v3');
assert.equal(path.basename(target),'粤木木系统演示包_2026-09-06');
assert.ok(fs.statSync(target).isDirectory());
const backup=target+'.backup-'+new Date().toISOString().replace(/[:.]/g,'-');
fs.cpSync(target,backup,{recursive:true,errorOnExist:true,force:false});
fs.copyFileSync('evidence/v3/closing/v3-audit-student-home.png',path.join(source,'student-home.png'));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.goto(pathToFileURL(path.join(source,'index.html')).href);
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
 assert.match(await page.locator('body').innerText(),/V3 教员本机演示版/);
 assert.equal(await page.locator('section.sheet').count(),8);
 await page.pdf({path:path.join(source,'粤木木系统使用指导书-V3.pdf'),preferCSSPageSize:true,printBackground:true});
 const names=['00-先看这里.txt','01-启动演示.cmd','02-查看测试口令.cmd','start-demo.ps1','show-accounts.ps1','index.html','student-home.png','school-logo.png','club-logo.png','粤木木系统使用指导书-V3.pdf'];
 const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 const manifest={version:'v3-teacher-demo-20260906',createdAt:new Date().toISOString(),kind:'local-guide-and-shortcuts-not-standalone-installer',contractVersion:'0.14.0',contractSha256:fs.readFileSync('packages/contracts/sha256.txt','utf8').trim(),evidence:'evidence/v3/receipt.json',files:names.map(name=>({name,sha256:hash(path.join(source,name))}))};
 fs.writeFileSync(path.join(source,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 for(const name of [...names,'release-manifest.json'])fs.copyFileSync(path.join(source,name),path.join(target,name));
 for(const item of manifest.files)assert.equal(hash(path.join(target,item.name)),item.sha256);
 await page.goto(pathToFileURL(path.join(target,'index.html')).href);
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
 assert.match(await page.locator('body').innerText(),/今日工作/);
 assert.equal(await page.locator('a[href="http://127.0.0.1:28080/admin/"]').count(),1);
 console.log(JSON.stringify({status:'PASS',target,backup,verifiedFiles:manifest.files.length,pdfBytes:fs.statSync(path.join(target,'粤木木系统使用指导书-V3.pdf')).size},null,2));
}finally{await browser.close();}
