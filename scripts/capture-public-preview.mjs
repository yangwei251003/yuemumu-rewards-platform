/* global document, window, getComputedStyle */
import fs from 'node:fs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
assert.ok(c.appMode==='demo'&&c.dbHost==='127.0.0.1'&&((c.profile==='integration'&&c.database==='ym_integration')||(c.profile==='b'&&c.database==='ym_dev_b')),'Preview capture only accepts isolated synthetic demo profiles');
const base=`http://127.0.0.1:${c.gatewayPort}`,out='docs/site/assets';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],bad=[],external=[],expected401=[];
async function surface(width,height){const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();let loggedIn=false;
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400){const record={path:new URL(r.url()).pathname,status:r.status()};if(!loggedIn&&r.status()===401)expected401.push(record);else bad.push(record);}});page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 return {context,page,authenticated(){loggedIn=true;}};
}
const mask=page=>[page.locator('input[type=password]'),page.locator('[data-secret]'),page.locator('[data-private-content=true]'),page.locator('[data-private-answers=true]')];
try{
 const student=await surface(390,844),p=student.page;await p.goto(base);await p.locator('input[type=password]').fill(c.demoAccessCode);await p.getByText('进入我的成长空间',{exact:true}).click();await p.getByText('你好，模拟学生01',{exact:true}).waitFor();student.authenticated();await p.waitForLoadState('networkidle');await p.waitForFunction(()=>Array.from(document.images).filter(i=>{const b=i.getBoundingClientRect();return b.width>0&&b.height>0&&b.bottom>0&&b.top<window.innerHeight&&getComputedStyle(i).visibility!=='hidden';}).every(i=>i.complete&&i.naturalWidth>0));
 await p.evaluate(()=>{document.querySelectorAll('.taro_page_show').forEach(e=>{e.scrollTop=0;});window.scrollTo(0,0);});await p.screenshot({path:out+'/student-mobile.png',mask:mask(p)});await p.setViewportSize({width:1280,height:900});await p.screenshot({path:out+'/student-desktop.png',mask:mask(p)});
 await p.locator('.nav-item').filter({has:p.getByText('奖励',{exact:true})}).click();await p.locator('.reward-card').first().waitFor();await p.setViewportSize({width:390,height:844});await p.screenshot({path:out+'/rewards-mobile.png',mask:mask(p)});
 const staff=await surface(1440,1000),q=staff.page;await q.goto(base+'/admin/');await q.getByLabel('职员账号',{exact:true}).fill('DEMO_T003');await q.getByLabel('本地职员密码',{exact:true}).fill(c.staffPassword);await q.getByRole('button',{name:'登录工作台',exact:true}).click();await q.getByRole('button',{name:'退出登录',exact:true}).waitFor();staff.authenticated();await q.locator('.user-chip').waitFor();await q.waitForLoadState('networkidle');await q.screenshot({path:out+'/staff-desktop.png',mask:mask(q)});await q.setViewportSize({width:390,height:844});await q.screenshot({path:out+'/staff-mobile.png',mask:mask(q)});
 const overflow=await q.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);assert.equal(overflow,false);assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const report={scope:'Actual local Taro H5 and operations app backed by a new MySQL demo database. Every identity, point record, inventory item and action is synthetic. Only login/read actions captured; secrets/private panels masked.',pageErrors:errors,httpFailures:bad,externalRequests:external,expectedAnonymous401:expected401,mobileStaffNoOverflow:!overflow};fs.writeFileSync('docs/PREVIEW_CAPTURE.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
