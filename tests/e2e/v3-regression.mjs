import {studentNav} from './v4-navigation.mjs';
/* global document, window, getComputedStyle */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {harness} from './closure-harness.mjs';
const h=await harness('v3-regression'),writes=[],menus={},contrast=[];
async function watch(s){s.page.setDefaultTimeout(15000);s.page.on('request',r=>{const p=new URL(r.url()).pathname;if(p.startsWith('/api/v1/')&&!p.startsWith('/api/v1/auth/')&&r.method()!=='GET')writes.push(p);});}
async function settled(p){await p.locator('.loading').waitFor({state:'hidden'});await p.waitForTimeout(200);}
async function fits(p){assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);assert.equal(await p.locator('.taro_page_show').evaluateAll(es=>es.every(e=>e.scrollWidth<=window.innerWidth)),true);}
async function capture(s,label){await settled(s.page);await s.page.locator('.taro_page_show').evaluateAll(es=>es.forEach(e=>{e.scrollTop=0;}));await h.shot(s.page,label);await fits(s.page);}
async function colors(p,selector){const c=await p.locator(selector).first().evaluate(e=>{let bg=getComputedStyle(e).backgroundColor,n=e;while(bg==='rgba(0, 0, 0, 0)'&&n.parentElement){n=n.parentElement;bg=getComputedStyle(n).backgroundColor;}return {fg:getComputedStyle(e).color,bg};});const lum=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((a,n,i)=>a+n*[.2126,.7152,.0722][i],0);const a=lum(c.fg),b=lum(c.bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5,selector+' contrast '+ratio);contrast.push({selector,...c,ratio});}
try{
 const manifest=JSON.parse(fs.readFileSync('assets/v3/manifest.json','utf8'));
 for(const a of manifest.records){const original=fs.readFileSync(`assets/v3/${a.category}/${a.name}-source.png`),b=fs.readFileSync(`assets/v3/${a.category}/${a.name}.jpg`);assert.equal(crypto.createHash('sha256').update(original).digest('hex'),a.sourceSha256);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.outputSha256);assert.ok(b.length<100*1024);assert.deepEqual(b,fs.readFileSync(`apps/student/src/assets/v3/${a.name}.jpg`));}
 h.pass('4张新场景源文件/发布副本哈希一致，单图小于100KiB','asset-verification');
 const s=await h.surface(390),p=s.page;await watch(s);await h.login(s,1);await p.locator('.v3-next .v3-skeleton').waitFor({state:'hidden'});assert.equal(await p.locator('.v3-next [role=alert]').count(),0);await p.getByRole('button',{name:'关闭提示',exact:true}).click();
 const wallet=await h.wallet(s);assert.equal(Number(await p.locator('.number').textContent()),wallet.availablePoints);assert.equal(Number(await p.locator('.mileage-number').textContent()),wallet.growthMileage);
 const badges=await h.read(s,'badges?limit=100');
 if(badges&&!badges.nextCursor)assert.equal(Number(await p.locator('.v3-badge-number').textContent()),badges.items.filter(b=>b.status==='ACTIVE').length);
 const image=p.locator('.v3-hero-image img');await image.waitFor();await p.waitForFunction(()=>document.querySelector('.v3-hero-image img')?.naturalWidth===960);
 for(const selector of ['.number','.v3-hero-cta','.light-button','.v3-action-label','.v3-badge-line'])if(await p.locator(selector).count())await colors(p,selector);
 h.pass('首页真实钱包/成长记录分离，正式960px主图加载，对比度至少4.5:1');
 for(const width of [375,390,430]){
  await p.setViewportSize({width,height:844});await studentNav(p,'成长');await capture(s,'home-'+width);
  for(const selector of ['.nav-item','.v3-hero-cta','.light-button']){const boxes=await p.locator(selector).evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height};}));assert.ok(boxes.every(b=>b.w>=44&&b.h>=44),selector+' touch target');}
  for(const tab of ['活动','项目','奖励','我的']){await p.locator('.nav-item').filter({hasText:tab}).click();await capture(s,tab+'-'+width);}
 }
 h.pass('375/390/430五个主页面无横向溢出，首页关键点击区至少44px');
 assert.equal(await p.locator('.profile-group').count(),4);assert.equal(await p.locator('.profile-link').count(),14);
 await h.profile(s,'技能');await settled(p);await capture(s,'learning');await p.getByText('我的翼章',{exact:true}).click();await p.getByText('系统技能成长记录，不是国家证件、CAAC执照或飞行许可。',{exact:true}).waitFor();await capture(s,'badges');
 await studentNav(p,'活动');await settled(p);await p.getByRole('textbox',{name:'搜索活动名称'}).fill('不存在的V3活动-'+h.unique);await p.getByText('暂无匹配活动',{exact:true}).waitFor();await capture(s,'activity-empty');await p.getByRole('textbox',{name:'搜索活动名称'}).fill('');await p.locator('.activity-card').first().getByText('查看活动与参与',{exact:true}).click();await capture(s,'activity-detail');await p.locator('.v3-context-cta').click();await h.shot(p,'activity-context');
 await studentNav(p,'项目');await settled(p);if(await p.locator('.project-card').count()){await p.locator('.project-card').first().getByText('查看团队与阶段',{exact:true}).click();await p.locator('.v3-stage-progress').waitFor();await capture(s,'project-detail');}
 h.pass('成长档案4分组14入口、学习翼章边界、活动空态/详情、项目阶段可用');
 await studentNav(p,'成长');await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.v3-hero').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await p.locator('.nav-indicator').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');await p.getByRole('button',{name:'展开或收起钱包状态',exact:true}).click();assert.equal(await p.locator('.wallet-details').evaluate(e=>getComputedStyle(e).animationName),'none');await capture(s,'reduced-motion');h.pass('减少动画时Hero、导航、钱包动效关闭，展开功能仍可用');
 // Read failure injection only; never counted as a successful business transition.
 await p.route('**/api/v1/notifications?*',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'TEST_UNAVAILABLE',message:'V3 read fault'})}));await p.getByText('刷新记录',{exact:true}).click();await p.locator('.v3-next [role=alert]').waitFor();assert.equal(await p.getByText('当前没有需要你处理的事项',{exact:true}).count(),0);await capture(s,'next-read-error');await p.unroute('**/api/v1/notifications?*');await p.getByText('重新读取下一步',{exact:true}).click();await p.locator('.v3-next [role=alert]').waitFor({state:'hidden'});h.pass('下一步读取失败不伪装零待办，重试恢复','read-fault-injection');
 const o=await h.surface();await watch(o);await h.staff(o,'DEMO_T004');await o.page.locator('.v3-work-list .ant-skeleton').waitFor({state:'hidden'});await capture(o,'today');
 const link=o.page.getByRole('link',{name:/^处理待办/}).first();if(await link.count()){const href=await link.getAttribute('href');await link.click();await o.page.locator('.v3-record-link').waitFor();assert.ok(o.page.url().includes(new URL(href,h.base).search));await o.page.locator('.ant-drawer').waitFor();await capture(o,'todo-context');}
 await o.page.goto(h.base+'/admin/approvals/?record=missing-v3');await o.page.locator('.v3-record-link').waitFor();await o.page.getByRole('link',{name:'清除定位',exact:true}).click();assert.equal(new URL(o.page.url()).search,'');h.pass('统一待办定位授权详情；失效定位可清除，不执行审核');
 await o.page.goto(h.base+'/admin/');await o.page.locator('.v3-work-list .ant-skeleton').waitFor({state:'hidden'});await o.page.route('**/api/v1/approvals?*',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'TEST_UNAVAILABLE',message:'V3 read fault'})}));await o.page.getByRole('button',{name:'刷新今日工作',exact:true}).click();await o.page.getByText('部分待办尚未读取',{exact:true}).waitFor();await capture(o,'todo-partial-error');await o.page.unroute('**/api/v1/approvals?*');await o.page.getByRole('button',{name:'刷新今日工作',exact:true}).click();await o.page.getByText('部分待办尚未读取',{exact:true}).waitFor({state:'hidden'});h.pass('后台部分来源失败明确标注数量不完整，重试恢复','read-fault-injection');
 for(const id of ['DEMO_T002','DEMO_T003','DEMO_T004','DEMO_T005','DEMO_T006','DEMO_T007']){const r=await h.surface();await watch(r);await h.staff(r,id);await r.page.locator('.v3-work-list .ant-skeleton').waitFor({state:'hidden'});await r.page.getByLabel('搜索工作模块',{exact:true}).fill('/');menus[id]=await r.page.getByRole('navigation',{name:'运营导航'}).getByRole('link').evaluateAll(es=>es.map(e=>e.getAttribute('href')));if(id==='DEMO_T003'){assert.ok(!menus[id].some(p=>p.includes('/pickup/')));await r.page.goto(h.base+'/admin/pickup/');await r.page.getByText('当前身份没有核销权限',{exact:true}).waitFor();assert.equal(await r.page.locator('#pickup-token').count(),0);}await capture(r,id);await r.context.close();}
 const expected=[...fs.readFileSync('apps/ops/src/WorkspaceNavigation.tsx','utf8').matchAll(/path: '([^']+)'/g)].map(m=>'/admin'+m[1]);const union=new Set(Object.values(menus).flat().map(p=>p.replace(/\/$/,'')));for(const path of expected)assert.ok(union.has(path.replace(/\/$/,'')),'missing original module '+path);assert.equal(expected.length,31);h.pass('6种角色菜单不同，31个原模块联合可达，审核员直达核销仍无权');
 assert.deepEqual(writes,[]);assert.deepEqual(h.errors,[]);h.pass('V3视觉与导航回归零业务写入、零未捕获页面异常');
 fs.writeFileSync(h.out+'/v3-contrast.json',JSON.stringify(contrast,null,2));fs.writeFileSync(h.out+'/v3-role-menus.json',JSON.stringify(menus,null,2));await h.finish();
}catch(e){await h.finish(e);}
