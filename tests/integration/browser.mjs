/* global document, window */
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));const base=`http://127.0.0.1:${c.gatewayPort}`;
fs.mkdirSync('output/playwright',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results=[];function passed(name){results.push({name,status:'PASS',at:new Date().toISOString()});console.log('PASS '+name);}
try{
 await page.goto(base);await page.getByText('进入学生演示',{exact:true}).waitFor();
 await page.locator('input[type=password]').fill(c.demoAccessCode);await page.getByText('进入我的成长空间',{exact:true}).click();
 await page.getByText('你好，模拟学生01',{exact:true}).waitFor();await page.getByText('奖励目录 · 27 个候选',{exact:true}).waitFor();assert.equal(await page.getByText('860',{exact:true}).count(),1);assert.equal(await page.getByText('1240',{exact:true}).count(),1);passed('Student real Taro H5 login, wallet and 27 rewards');
 await page.screenshot({path:'output/playwright/g0-student-desktop.png',fullPage:false});
 await page.reload();await page.getByText('你好，模拟学生01',{exact:true}).waitFor();passed('Student deep-route refresh restores server session');
 const admin=await context.newPage();admin.on('pageerror',e=>errors.push(e.message));await admin.goto(base+'/admin/');await admin.getByLabel('职员账号').fill('DEMO_T003');await admin.getByLabel('本地职员密码').fill(c.staffPassword);await admin.getByRole('button',{name:'登录工作台',exact:true}).click();
 await admin.getByText('模拟教员审核员',{exact:true}).waitFor();await admin.getByRole('cell',{name:'R001',exact:true}).waitFor();passed('Staff local login and AntD catalog from real API');
 await admin.screenshot({path:'output/playwright/g0-admin-desktop.png',fullPage:true});await page.reload();await page.getByText('你好，模拟学生01',{exact:true}).waitFor();passed('Same browser preserves independent student and staff sessions');
 await admin.goto(base+'/admin/pickup/');await admin.getByText('核销功能将在 G1 交付',{exact:true}).waitFor();await admin.reload();await admin.getByText('核销功能将在 G1 交付',{exact:true}).waitFor();passed('Admin pickup deep-route refresh, honestly marked G1 pending');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'output/playwright/g0-student-mobile.png',fullPage:false});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);passed('390px student viewport has no horizontal overflow');
 await admin.setViewportSize({width:390,height:844});await admin.screenshot({path:'output/playwright/g0-pickup-mobile.png',fullPage:true});assert.equal(await admin.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);passed('390px pickup viewport has no horizontal overflow');
 await page.getByText('退出登录',{exact:true}).click();await page.getByText('进入学生演示',{exact:true}).waitFor();await admin.reload();await admin.getByText('模拟教员审核员',{exact:true}).waitFor();passed('Student logout does not end staff session');
 assert.deepEqual(errors,[]);passed('No uncaught browser runtime errors');
 fs.writeFileSync('output/playwright/g0-browser-report.json',JSON.stringify({at:new Date().toISOString(),browser:await browser.version(),base,results,uncaughtErrors:errors},null,2));
}finally{await browser.close();}
