import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const runtime=process.env.V4_CAPTURE_CONFIG||'../yuemumu-v4-demo/.runtime/config.json';
const c=JSON.parse(fs.readFileSync(runtime,'utf8')),phase=process.argv[2]||'before';
assert.equal(c.profile,phase==='draft'?'b':'a');assert.equal(c.dbPort,3311);assert.equal(c.gatewayPort,phase==='draft'?38081:38080);
const base=`http://127.0.0.1:${c.gatewayPort}`,out=`evidence/v4/${phase}`;
fs.mkdirSync(out,{recursive:true});
const health=await fetch(base+'/api/v1/health');assert.equal(health.headers.get('x-instance-id'),c.cookiePrefix);
const browser=await chromium.launch({channel:'chrome',headless:true}),records=[],errors=[];
try{
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/v1/**',async route=>{const req=route.request(),p=new URL(req.url()).pathname;if(req.method()!=='GET'&&!['/api/v1/auth/demo-sessions','/api/v1/auth/staff-sessions'].includes(p)){errors.push('Unexpected business write '+p);await route.abort();}else await route.continue();});
  await page.goto(base);await page.locator('input[type=password]').fill(c.demoAccessCode);await page.getByText('进入我的成长空间',{exact:true}).click();await page.getByText('你好，模拟学生01',{exact:true}).waitFor();await page.waitForTimeout(800);
  for(const [label,url] of phase.startsWith('before')?[['home',null]]:[['home',null],['practice','/pages/practice/index'],['rewards','/pages/rewards/index'],['profile','/pages/profile/index']]){
   if(url){await page.goto(base+url);await page.waitForTimeout(650);}
   await page.screenshot({path:path.join(out,`student-${label}-${width}.png`),fullPage:true});records.push({surface:label,width,url:page.url()});
  }
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/admin/');await page.getByLabel('职员账号',{exact:true}).fill('DEMO_T003');await page.getByLabel('本地职员密码',{exact:true}).fill(c.staffPassword);await page.getByRole('button',{name:'登录工作台',exact:true}).click();await page.getByRole('button',{name:'退出登录',exact:true}).waitFor();await page.waitForTimeout(700);
 await page.screenshot({path:path.join(out,'ops-workspace.png'),fullPage:true});records.push({surface:'ops',width:1440,url:page.url()});await context.close();
 assert.deepEqual(errors,[]);console.log(`PASS ${records.length} actual ${phase} screenshots`);
}finally{await browser.close();fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify({at:new Date().toISOString(),phase,records,errors,note:'New isolated demo schema. Authentication creates sessions; student capture blocks business writes.'},null,2));}
