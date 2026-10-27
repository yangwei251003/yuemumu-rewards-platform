/* global document, window */
import fs from 'node:fs';
import {harness} from './closure-harness.mjs';
const h=await harness('v3-audit');
const inventory=[];
async function record(s,name){
 await s.page.waitForTimeout(400);
 const text=await s.page.locator('body').innerText();
 inventory.push({name,url:s.page.url(),headings:await s.page.locator('h1,h2,.title,.section-title').allTextContents(),buttons:await s.page.getByRole('button').allTextContents(),overflow:await s.page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),excerpt:text.slice(0,14000)});
 await h.shot(s.page,name);
}
try{
 const s=await h.surface(390);await h.login(s,1);await record(s,'student-home');
 for(const tab of ['活动','项目','奖励','我的']){await s.page.locator('.nav-item').filter({hasText:tab}).click();await record(s,'student-'+tab);if(tab==='活动'&&await s.page.locator('.activity-card').count()){await s.page.locator('.activity-card').first().getByText('查看活动与参与',{exact:true}).click();await record(s,'student-activity-detail');}if(tab==='项目'&&await s.page.locator('.project-card').count()){await s.page.locator('.project-card').first().getByText('查看团队与阶段',{exact:true}).click();await record(s,'student-project-detail');}if(tab==='奖励'){await s.page.locator('.reward-card').first().click();await record(s,'student-reward-detail');}}
 for(const item of ['账本','技能','订单','待结算','通知与申诉','预约与专项','质量退货','积分核对','转化核查','入社申请']){await h.profile(s,item);await record(s,'student-'+item);}
 const o=await h.surface();await h.staff(o,'DEMO_T004');
 const src=fs.readFileSync('apps/ops/src/WorkspaceNavigation.tsx','utf8');
 const paths=[...src.matchAll(/path: '([^']+)'/g)].map(m=>m[1]);
 for(const path of paths){await o.page.goto(h.base+'/admin'+(path==='/'?'/':path));await o.page.getByRole('button',{name:'退出登录',exact:true}).waitFor();await record(o,'ops-'+(path.replaceAll('/','')||'home'));}
 for(const id of ['DEMO_T002','DEMO_T003','DEMO_T004','DEMO_T005','DEMO_T007']){const r=await h.surface();await h.staff(r,id);await record(r,'role-'+id);await r.context.close();}
 fs.writeFileSync(h.out+'/inventory.json',JSON.stringify(inventory,null,2));h.pass('现有学生主次级页面、31后台入口及6角色实际浏览','read-only-audit');
 await h.finish();
}catch(e){fs.writeFileSync(h.out+'/inventory.json',JSON.stringify(inventory,null,2));await h.finish(e);}
