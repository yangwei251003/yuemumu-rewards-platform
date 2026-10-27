/* global document */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const config=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
assert.ok((config.profile==='b'&&config.database==='ym_dev_b')||(config.profile==='integration'&&config.database==='ym_integration'));
const base=`http://127.0.0.1:${config.gatewayPort}`,output=process.env.E2E_OUTPUT_DIR||'tests/visual/evidence';
const results=[],errors=[],businessWrites=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();page.setDefaultTimeout(15000);
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{const path=new URL(r.url()).pathname;if(path.startsWith('/api/v1/')&&r.method()!=='GET'&&!path.startsWith('/api/v1/auth/'))businessWrites.push({path,method:r.method()});});
const pass=(name,mode='real-server-keyboard')=>{results.push({name,status:'PASS',mode});console.log('PASS '+name);};
async function focused(locator){await page.waitForFunction(e=>e===document.activeElement,await locator.elementHandle(),{timeout:3000});}
async function tabTo(locator){for(let i=0;i<70;i++){if(await locator.evaluate(e=>e===document.activeElement))return;await page.keyboard.press('Tab');}throw new Error('Tab未到达目标控件');}
let releaseDelay;
try{
 await page.goto(base);
 const trigger=page.locator('.selector-trigger');await trigger.waitFor();await page.waitForFunction(()=>document.querySelector('.selector-trigger')?.getAttribute('aria-disabled')==='false');
 const login=page.getByRole('button',{name:'进入我的成长空间',exact:true});assert.equal(await login.getAttribute('tabindex'),'-1');assert.equal(await login.getAttribute('aria-disabled'),'true');
 await tabTo(trigger);await page.keyboard.press('Enter');const dialog=page.getByRole('dialog',{name:'选择选项'});await dialog.waitFor();
 const close=dialog.getByRole('button',{name:'关闭选择',exact:true}),options=dialog.locator('.selection-option');await focused(close);
 await page.keyboard.press('Shift+Tab');await focused(options.last());await page.keyboard.press('Tab');await focused(close);
 await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await focused(trigger);
 pass('登录选择框Enter打开、Tab首尾循环、Escape关闭并恢复焦点');
 await page.keyboard.press('Space');await dialog.waitFor();await focused(close);await page.keyboard.press('Tab');await focused(options.first());await page.keyboard.press('Enter');await dialog.waitFor({state:'hidden'});await focused(trigger);
 pass('选择框Space打开，键盘选择身份后恢复焦点');
 await page.keyboard.press('Tab');const password=page.locator('input[type=password]');await focused(password);await password.fill(config.demoAccessCode);await tabTo(login);await page.keyboard.press('Enter');await page.getByText('已安全登录，正在查看本人的成长记录。',{exact:true}).waitFor();
 const nav=label=>page.locator('.nav-item').filter({hasText:label});await tabTo(nav('奖励'));await page.keyboard.press('Enter');await page.getByText('奖励目录',{exact:true}).waitFor();await tabTo(nav('我的'));await page.keyboard.press('Space');await page.getByText('我的成长档案',{exact:true}).waitFor();await tabTo(nav('成长'));await page.keyboard.press('Enter');await page.locator('.v3-hero').waitFor();
 pass('学生登录及导航支持真实Enter和Space切换');
 let entered;const waiting=new Promise(resolve=>{entered=resolve;});const delay=new Promise(resolve=>{releaseDelay=resolve;});let walletReads=0;
 await page.route('**/api/v1/wallet',async route=>{walletReads++;entered();await delay;await route.continue();});
 const refresh=page.getByRole('button',{name:'刷新记录',exact:true});await tabTo(refresh);await page.keyboard.press('Enter');await waiting;await page.waitForFunction(()=>document.querySelector('.nav-item')?.getAttribute('aria-disabled')==='true');
 assert.equal(await nav('活动').getAttribute('tabindex'),'-1');await page.keyboard.press('Enter');await page.keyboard.press('Space');
 // Preserve focus explicitly to exercise the disabled host's keyboard guard as well as normal Tab exclusion.
 await nav('活动').focus();await page.keyboard.press('Enter');await page.keyboard.press('Space');assert.equal(await page.locator('.v3-hero').isVisible(),true);assert.equal(walletReads,1);
 await page.keyboard.press('Tab');assert.equal(await nav('活动').evaluate(e=>e===document.activeElement),false);
 pass('延迟只读请求期间disabled按钮排除Tab且Enter/Space不触发导航或重复请求','read-latency-injection');
 releaseDelay();await page.getByText('已刷新为服务器最新记录。',{exact:true}).waitFor();await page.unroute('**/api/v1/wallet');await tabTo(nav('活动'));const read=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/v1/activities');await page.keyboard.press('Enter');assert.equal((await read).status(),200);
 pass('请求恢复后键盘入口恢复并完成真实活动读取');assert.deepEqual(businessWrites,[]);assert.deepEqual(errors,[]);pass('零业务写请求且无未捕获浏览器异常','verification');
}catch(error){results.push({name:error.message,status:'FAIL'});console.error(error.stack);process.exitCode=1;}
finally{releaseDelay?.();fs.mkdirSync(output,{recursive:true});fs.writeFileSync(`${output}/keyboard-report.json`,JSON.stringify({at:new Date().toISOString(),base,browser:await browser.version(),results,businessWrites,errors,screenshots:'None; credentials never captured.'},null,2));await browser.close();}



