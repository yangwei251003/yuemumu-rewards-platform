/* global document, getComputedStyle, window */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {harness} from './closure-harness.mjs';
const h=await harness('visual-v2');
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE||'sharp');
const writes=[];
async function watch(s){s.page.setDefaultTimeout(15000);s.page.on('request',r=>{const path=new URL(r.url()).pathname;if(path.startsWith('/api/v1/')&&r.method()!=='GET'&&!path.startsWith('/api/v1/auth/'))writes.push({path,method:r.method()});});}
async function settledImages(page,selector){await page.waitForFunction(selector=>[...document.querySelectorAll(selector)].every(img=>img.complete&&img.naturalWidth>0),selector);}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);}
async function imageBoxes(page,selector){
 await settledImages(page,selector.split(',').map(s=>s.trim()+' img').join(','));
 const clipped=await page.locator(selector).evaluateAll(list=>list.flatMap(e=>{const box=e.getBoundingClientRect(),img=e.querySelector('img');if(!img)return[];const inner=img.getBoundingClientRect();return inner.left<box.left-1||inner.right>box.right+1||inner.top<box.top-1||inner.bottom>box.bottom+1?[e.className]:[];}));
 assert.deepEqual(clipped,[],'logo and icon bitmaps stay entirely within their boxes');
}
async function warm(page){const end=await page.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<end;y+=600){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(120);}await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(250);}
async function capture(s,label){
 const p=s.page,scroller=p.locator('.taro_page_show');
 if(!await scroller.count()){await warm(p);await h.shot(p,label);return;}
 const dimensions=await scroller.evaluate(e=>({height:e.scrollHeight,viewport:e.clientHeight,width:e.clientWidth}));
 for(let y=0;y<dimensions.height;y+=600){await scroller.evaluate((e,y)=>{e.scrollTop=y;},y);await p.waitForTimeout(150);}
 await scroller.evaluate(e=>{e.scrollTop=0;});await p.waitForTimeout(300);
 const nav=p.locator('.bottom-nav'),navBox=await nav.count()?await nav.boundingBox():null,visible=Math.floor(dimensions.viewport-(navBox?.height??0));
 await p.screenshot({path:`${h.out}/visual-v2-${label}-viewport.png`,mask:[p.locator('input[type=password]').filter({visible:true})],maskColor:'#e8eef7'});
 const layers=[];let total=0,previous=-1;
 for(let y=0;y<dimensions.height;y+=visible){
  const top=await scroller.evaluate((e,y)=>{e.scrollTop=y;return e.scrollTop;},y);if(top===previous)break;previous=top;
  await p.waitForTimeout(2000);
  const input=await p.screenshot({clip:{x:0,y:0,width:dimensions.width,height:visible},mask:[p.locator('input[type=password]')],maskColor:'#e8eef7'});
  layers.push({input,top:Math.round(top),left:0});total=Math.max(total,Math.round(top)+visible);
 }
 await sharp({create:{width:dimensions.width,height:total,channels:4,background:'#f5f7fb'}}).composite(layers).png().toFile(`${h.out}/visual-v2-${label}.png`);
 await scroller.evaluate(e=>{e.scrollTop=0;});
}
const luminance=c=>c.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
async function contrast(page,selector){const c=await page.locator(selector).first().evaluate(e=>{let bg=getComputedStyle(e).backgroundColor,p=e;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {fg:getComputedStyle(e).color,bg};});const values=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),a=luminance(values(c.fg)),b=luminance(values(c.bg)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5,`${selector} contrast ${ratio}`);return {selector,...c,ratio};}
try{
 const manifest=JSON.parse(fs.readFileSync('assets/visual-v2/manifest.json','utf8'));
 for(const a of manifest.assets){const b=fs.readFileSync('assets/visual-v2/'+a.file);assert.ok(b.length<=160*1024);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);for(const app of ['student','ops'])assert.equal(Buffer.compare(b,fs.readFileSync(`apps/${app}/src/assets/visual-v2/${a.file}`)),0);}
 h.pass('三张 imagegen 图和两张原始品牌标识的哈希、双端副本及单图160KiB预算');
 const s=await h.surface(390);await watch(s);const p=s.page;
 await p.goto(h.base);await p.getByText('进入学生演示',{exact:true}).waitFor();await imageBoxes(p,'.school-brand,.club-brand taro-image-core');await capture(s,'student-login-390');
 await p.locator('.selector-trigger').click();await p.getByRole('dialog',{name:'选择选项'}).waitFor();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');await h.shot(p,'student-selection-sheet');await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});assert.notEqual(await p.evaluate(()=>document.body.style.overflow),'hidden');
 await p.locator('input[type=password]').fill(h.config.demoAccessCode);await p.getByText('进入我的成长空间',{exact:true}).click();await p.getByText('你好，模拟学生01',{exact:true}).waitFor();s.audience='student';await p.getByRole('button',{name:'关闭提示',exact:true}).click();
 const wallet=await h.wallet(s);assert.equal(Number(await p.locator('.number').textContent()),wallet.availablePoints);assert.equal(Number(await p.locator('.mileage-number').textContent()),wallet.growthMileage);
 await p.getByRole('button',{name:'展开或收起钱包状态',exact:true}).click();assert.equal(await p.locator('.wallet-details').count(),1);await p.getByRole('button',{name:'展开或收起钱包状态',exact:true}).click();assert.equal(await p.locator('.wallet-details').count(),0);
 await imageBoxes(p,'.ui-icon,.school-brand,.v3-hero-image');h.pass('真实钱包数字保持一致；状态按需展开；选项面板锁背景滚动且可Escape退出');
 const contrastResults=[];for(const selector of ['.identity','.v3-hero-cta','.number','.quick-action','.section-note','.footer','.light-button'])contrastResults.push(await contrast(p,selector));
 fs.writeFileSync(`${h.out}/visual-v2-contrast.json`,JSON.stringify(contrastResults,null,2));h.pass('首页主要正文、辅助文字和行动按钮实测对比度至少4.5:1');
 for(const width of [360,390,430,768,1366]){await p.setViewportSize({width,height:844});await fits(p);await capture(s,'student-home-'+width);await imageBoxes(p,'.ui-icon,.school-brand');}
 h.pass('学生首页360/390/430/768/1366无横向溢出，校标与图标完整显示');
 await p.setViewportSize({width:390,height:844});await p.locator('.quick-action').filter({hasText:'我的订单'}).click();await p.locator('.loading').waitFor({state:'hidden'});await p.getByText('我的兑换与领取',{exact:true}).waitFor();await p.getByText('← 返回奖励',{exact:true}).click();await p.getByText('奖励目录',{exact:true}).waitFor();
 const rewards=(await h.read(s,'rewards?limit=100')).items;
 await p.getByRole('button',{name:'木能量范围内',exact:true}).click();assert.equal(await p.locator('.reward-card').count(),rewards.filter(r=>r.pointsRequired<=wallet.availablePoints).length);
 await p.getByRole('button',{name:'有模拟余量',exact:true}).click();assert.equal(await p.locator('.reward-card').count(),rewards.filter(r=>r.pointsRequired<=wallet.availablePoints&&r.availableQuantity>0).length);
 await p.getByRole('button',{name:'排序 ↕',exact:true}).click();await p.locator('.selection-option').filter({hasText:'木能量从高到低'}).click();const points=await p.locator('.reward-copy .price').allTextContents();assert.deepEqual(points.map(x=>Number(x.match(/^\d+/)[0])),points.map(x=>Number(x.match(/^\d+/)[0])).sort((a,b)=>b-a));
 await p.getByText('重置筛选',{exact:true}).click();assert.equal(await p.locator('.reward-card').count(),rewards.length);
 await p.getByRole('textbox',{name:'搜索奖励名称或编号'}).fill('R001');await p.locator('.reward-card').click();await p.locator('.detail .section-title').waitFor();await p.getByText('← 返回奖励列表',{exact:true}).click();assert.equal(await p.getByRole('textbox',{name:'搜索奖励名称或编号'}).inputValue(),'R001');assert.equal(await p.locator('.reward-card').count(),1);await p.getByRole('button',{name:'清空奖励搜索',exact:true}).click();assert.equal(await p.locator('.reward-card').count(),rewards.length);
 h.pass('奖励按真实木能量/余量组合筛选和排序，详情返回保留搜索，清空与重置可恢复');
 await capture(s,'student-rewards-390');
 for(const tab of ['活动','项目','我的']){await p.locator('.nav-item').filter({hasText:tab}).click();await p.locator('.loading').waitFor({state:'hidden'});await capture(s,'student-'+tab+'-390');await fits(p);}
 assert.equal(await p.locator('.profile-link').count(),14);await p.locator('.profile-link').filter({hasText:/^技能/}).click();await p.locator('.loading').waitFor({state:'hidden'});await capture(s,'student-learning-390');await p.getByText('← 返回成长',{exact:true}).click();await p.locator('.v3-hero').waitFor();
 h.pass('五个主入口与14个个人功能保持可达，二级页面有明确返回和所属底部导航');
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.nav-indicator').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');await p.getByRole('button',{name:'展开或收起钱包状态',exact:true}).click();assert.equal(await p.locator('.wallet-details').evaluate(e=>getComputedStyle(e).animationName),'none');await p.getByRole('button',{name:'展开或收起钱包状态',exact:true}).click();await h.shot(p,'student-reduced-motion');h.pass('系统减少动态效果时导航滑块和展开动效关闭，内容与操作仍可用');
 const o=await h.surface(1440);await watch(o);await h.staff(o,'DEMO_T003');await o.page.locator('.v3-work-list').waitFor();await capture(o,'ops-dashboard-1440');
 await o.page.getByLabel('搜索工作模块',{exact:true}).fill('核销');assert.equal(await o.page.getByRole('navigation',{name:'运营导航'}).getByRole('link',{name:'移动核销',exact:true}).count(),0);await o.page.goto(h.base+'/admin/pickup/');await o.page.getByText('当前身份没有核销权限',{exact:true}).waitFor();assert.equal(await o.page.locator('#pickup-token').count(),0);
 await o.page.setViewportSize({width:390,height:844});await o.page.getByRole('button',{name:'展开工作模块',exact:true}).click();await o.page.locator('.navigation-drawer').getByLabel('搜索工作模块',{exact:true}).fill('活动');await o.page.locator('.navigation-drawer').getByRole('link',{name:'活动与课程',exact:true}).click();await o.page.locator('.navigation-drawer').waitFor({state:'hidden'});await o.page.locator('main h1').getByText('活动与课程',{exact:true}).waitFor();await fits(o.page);await capture(o,'ops-mobile-activity');
 await o.page.getByRole('button',{name:'展开工作模块',exact:true}).click();await o.page.locator('.navigation-drawer').getByLabel('搜索工作模块',{exact:true}).fill('核销');await h.shot(o.page,'ops-module-search-390');await o.page.keyboard.press('Escape');await o.page.locator('.navigation-drawer').waitFor({state:'hidden'});await o.page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='展开工作模块');h.pass('后台分组搜索与手机抽屉可导航，Escape恢复焦点；无核销权限仍由真实API限制');
 const pickup=await h.surface(390);await watch(pickup);await h.staff(pickup,'DEMO_T005');await pickup.page.goto(h.base+'/admin/pickup/');await pickup.page.locator('#pickup-token').waitFor();await capture(pickup,'ops-pickup-390');await fits(pickup.page);h.pass('领取角色实际进入移动核销，保留扫描、备用码与预览确认流程');
 assert.deepEqual(writes,[]);assert.deepEqual(h.errors,[]);h.pass('视觉与导航验收零业务写入、无未捕获浏览器异常');
 await h.finish();
}catch(error){await h.finish(error);}
