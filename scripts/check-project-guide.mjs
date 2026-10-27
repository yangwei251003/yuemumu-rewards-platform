/* global document, window */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('docs/site'),prefix='/yuemumu-rewards-platform/';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);if(!path.startsWith(prefix))throw Error('prefix');const file=resolve(root,path.slice(prefix.length)||'index.html');if(file!==root&&!file.startsWith(root+sep))throw Error('path');const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],bad=[],external=[];
page.on('pageerror',error=>errors.push(error.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url());});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:')&&!r.url().startsWith('data:'))external.push(r.url());});
try{const response=await page.goto(`http://127.0.0.1:${server.address().port}${prefix}`,{waitUntil:'networkidle'});assert.equal(response.status(),200);const tabs=page.locator('.gallery-tab');assert.equal(await tabs.count(),3);for(let i=0;i<3;i++){await tabs.nth(i).click();await page.waitForFunction(()=>{const image=document.querySelector('#gallery-image');return image.complete&&image.naturalWidth>0;});assert.equal(await tabs.nth(i).getAttribute('aria-pressed'),'true');}
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);const result={scope:'Static guide only; no backend or fabricated business operations',prefix,desktop1440:true,mobile390:true,galleryTabs:3,pageErrors:errors,httpFailures:bad,externalRequests:external};await writeFile('../guide-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));}finally{await browser.close();server.close();}
