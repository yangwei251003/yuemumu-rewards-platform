import {studentNav} from './v4-navigation.mjs';
/* global document, window */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const config=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
assert.ok((config.profile==='b'&&config.database==='ym_dev_b')||(config.profile==='integration'&&config.database==='ym_integration'),'Only isolated B or integration profiles are allowed');
const base=`http://127.0.0.1:${config.gatewayPort}`;
const out=process.env.E2E_OUTPUT_DIR||'tests/visual/evidence';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results=[];const passed=name=>{results.push({name,status:'PASS'});console.log('PASS '+name);};
async function snap(name){await page.screenshot({path:`${out}/${name}.png`,fullPage:true});}
async function noOverflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);}
try{
 await page.goto(base);await page.getByText('进入学生演示',{exact:true}).waitFor();await page.getByText('进入我的成长空间',{exact:true}).waitFor();await snap('student-login-390');
 await page.locator('input[type=password]').fill(config.demoAccessCode);await page.getByText('进入我的成长空间',{exact:true}).click();await page.getByText('你好，模拟学生01',{exact:true}).waitFor();
 await studentNav(page,'成长');
 const walletResponse=await context.request.get(base+'/api/v1/wallet',{headers:{'X-Session-Audience':'student'}});assert.equal(walletResponse.status(),200);const wallet=await walletResponse.json();assert.equal((await page.locator('.number').textContent()).trim(),String(wallet.availablePoints));assert.equal((await page.locator('.mileage-number').textContent()).trim(),String(wallet.growthMileage));passed('Real Taro H5 login and MySQL wallet');
 await snap('student-growth-390');await noOverflow();
 await page.reload();await page.locator('.profile-identity').getByText('模拟学生01',{exact:true}).waitFor();await studentNav(page,'成长');passed('Server session survives reload');
 await studentNav(page,'奖励');await page.getByText('27 个候选 · 模拟库存，尚未采购',{exact:true}).waitFor();assert.equal(await page.locator('.reward-card').count(),27);await snap('student-rewards-390');
 for(let i=0;i<27;i++){await page.locator('.reward-card').nth(i).scrollIntoViewIfNeeded();await page.waitForFunction(index=>{const img=document.querySelectorAll('.reward-card img')[index];return img&&img.complete&&img.naturalWidth>0;},i);}
 const imagePaths=await page.locator('.reward-card img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src')));
 assert.equal(imagePaths.length,27);for(const src of imagePaths){const response=await context.request.get(new URL(src,base).href);assert.equal(response.status(),200);assert.match(response.headers()['content-type'],/image\/png/);assert.ok((await response.body()).length<160*1024);}
 passed('All 27 reward PNGs return 200 and fit 160KB budget');
 await page.getByRole('textbox', {name:'搜索奖励名称或编号'}).fill('R025');assert.equal(await page.locator('.reward-card').count(),1);await page.locator('.reward-card').click();const plans=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/v1/commerce/programs'&&r.request().method()==='GET');await page.getByText('查看预约或专项方案',{exact:true}).click();assert.equal((await plans).status(),200);await page.getByText('刷新可用方案与时段',{exact:true}).waitFor();await page.getByText('此项为专项申请资格门槛，申请时不消耗积分，不自动兑付现金。',{exact:true}).waitFor();await snap('student-reward-application-390');passed('Reward detail comes from real API; threshold-only semantics preserved');
 await page.getByText('← 返回奖励列表',{exact:true}).click();await page.getByRole('textbox', {name:'搜索奖励名称或编号'}).fill('没有这项奖励');await page.getByText('没有找到匹配奖励',{exact:true}).waitFor();await snap('student-empty-390');await page.getByText('清除筛选',{exact:true}).click();assert.equal(await page.locator('.reward-card').count(),27);passed('Search and empty state recover without fake data');
 for(const width of [360,390,430,1366]){await page.setViewportSize({width,height:900});await noOverflow();await snap('student-catalog-'+width);}passed('Student catalog fits 360/390/430/1366 widths');
 await page.setViewportSize({width:390,height:844});await studentNav(page,'我的');await page.locator('.profile-link').filter({hasText:'账本'}).click();await page.getByText('木能量明细',{exact:true}).waitFor();await page.getByText('预占变化 0',{exact:false}).first().waitFor();await snap('student-ledger-390');passed('Real ledger separates available and reserved movements');
 await context.setOffline(true);await page.getByText('刷新记录',{exact:true}).click();await page.getByRole('alert').filter({hasText:'连接未完成'}).waitFor();await snap('student-offline-390');await context.setOffline(false);let recovered=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/v1/wallet'&&r.status()===200);await page.getByText('刷新记录',{exact:true}).click();await recovered;await page.waitForFunction(()=>document.querySelectorAll('[role=alert]').length===0);passed('Offline error and retry recover real server data');
 // Deliberate fault injection only: does not count as a real backend business transition.
 await page.route('**/api/v1/wallet',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'TEST_UNAVAILABLE',message:'Test-only service unavailable',requestId:'fault-injection'})}));const injected=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/v1/wallet'&&r.status()===503);await page.getByText('刷新记录',{exact:true}).click();await injected;await page.getByRole('alert').filter({hasText:'fault-injection'}).waitFor();await snap('student-service-error-390');await page.unroute('**/api/v1/wallet');recovered=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/v1/wallet'&&r.status()===200);await page.getByText('刷新记录',{exact:true}).click();await recovered;await page.waitForFunction(()=>document.querySelectorAll('[role=alert]').length===0);passed('503 fault injection displays honest error and recovers');
 await context.clearCookies();const expired=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/v1/me'&&r.status()===401);await page.getByText('刷新记录',{exact:true}).click();await expired;await page.getByText('进入学生演示',{exact:true}).waitFor();assert.equal(await page.locator('.field-profile-stats,.ledger-item').count(),0);await snap('student-session-expired-390');passed('Expired session removes prior user wallet and ledger');
 assert.deepEqual(errors,[]);passed('No uncaught browser errors');
} catch(e){results.push({name:e.message,status:'FAIL'});await snap('student-failure');throw e;}
finally{fs.writeFileSync(`${out}/student-report.json`,JSON.stringify({at:new Date().toISOString(),base,browser:await browser.version(),results,errors},null,2));await browser.close();}
