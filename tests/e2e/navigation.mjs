import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {studentNav} from './v4-navigation.mjs';
const config=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
assert.ok((config.profile==='b'&&config.database==='ym_dev_b')||(config.profile==='integration'&&config.database==='ym_integration'),'Only isolated B or integration profiles are allowed');
const base=`http://127.0.0.1:${config.gatewayPort}`,out=process.env.E2E_OUTPUT_DIR||'tests/visual/evidence';fs.mkdirSync(out,{recursive:true});
const results=[],errors=[],writes=[],activityReads=[];let releaseDelay;
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();page.setDefaultTimeout(15000);
page.on('pageerror',error=>errors.push(error.message));
page.on('request',request=>{const path=new URL(request.url()).pathname;if(request.method()!=='GET'&&path.startsWith('/api/v1/')&&!path.startsWith('/api/v1/auth/'))writes.push({method:request.method(),path});});
page.on('response',response=>{if(new URL(response.url()).pathname==='/api/v1/activities')activityReads.push(response.status());});
const pass=name=>{results.push({name,status:'PASS'});console.log('PASS '+name);};
try{
 const health=await context.request.get(base+'/api/v1/health');assert.equal(health.status(),200);assert.equal(health.headers()['x-instance-id'],config.cookiePrefix);
 await page.goto(base);await page.locator('input[type=password]').fill(config.demoAccessCode);await page.getByText('进入我的成长空间',{exact:true}).click();await page.getByText('你好，模拟学生01',{exact:true}).waitFor();
 const me=await context.request.get(base+'/api/v1/me',{headers:{'X-Session-Audience':'student'}});assert.equal(me.status(),200);assert.equal((await me.json()).id,'DEMO_S001');
 await studentNav(page,'成长');await page.locator('.number').waitFor();pass('V4实际登录与本人钱包可读取');
 let entered;const pending=new Promise(resolve=>{entered=resolve;});const delay=new Promise(resolve=>{releaseDelay=resolve;});
 await page.route('**/api/v1/wallet',async route=>{entered();await delay;try{await route.continue();}catch(error){if(!/already handled|interception|aborted/i.test(error.message))throw error;}});
 await page.getByText('刷新记录',{exact:true}).click();await pending;
 // V4 uses per-page locks: a hidden old page must not block a new page load.
 const nextRead=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/v1/activities'&&response.status()===200);
 const entry=page.locator('.profile-link').filter({has:page.getByText('活动',{exact:true})});await entry.click();
 const activityResponse=await nextRead;const data=await activityResponse.json();
 if(data.items.length)await page.locator('.activity-card,.activity-detail').first().waitFor();else await page.getByText('暂无匹配活动',{exact:true}).waitFor();
 assert.equal(await page.locator('.profile-identity').count(),0);pass('钱包读取挂起时，新活动页面仍独立完成真实读取');
 releaseDelay();await page.unroute('**/api/v1/wallet');
 if(data.items.length)await page.locator('.activity-card,.activity-detail').first().waitFor();else await page.getByText('暂无匹配活动',{exact:true}).waitFor();
 assert.equal(await page.locator('.profile-identity').count(),0);pass('旧页读取返回后不会将当前页替换为旧钱包内容');
 assert.ok(activityReads.includes(200));assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);pass('导航验收无业务写入、无未捕获页面错误');
}catch(error){results.push({name:error.message,status:'FAIL'});console.error(error.message);process.exitCode=1;}
finally{releaseDelay?.();fs.writeFileSync(out+'/navigation-report.json',JSON.stringify({results,activityReads,businessWrites:writes,errors,scope:'V4 per-page command ownership with a delayed real wallet read; no fabricated API response.'},null,2));await browser.close();}
