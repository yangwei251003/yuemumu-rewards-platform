import {studentNav} from './v4-navigation.mjs';
/* global document, window */
import assert from 'node:assert/strict';
import {harness} from './closure-harness.mjs';
const h=await harness('v3-samples');
try{
 const s=await h.surface(390);await h.login(s,1);await s.page.locator('.v3-next .v3-skeleton').waitFor({state:'hidden'});await s.page.locator('.v3-hero').waitFor();await h.shot(s.page,'home-390');assert.equal(await s.page.locator('.v3-next [role=alert]').count(),0);h.pass('学生首页真实下一步加载');
 await studentNav(s.page,'活动');await s.page.locator('.activity-card').first().getByText('查看活动与参与',{exact:true}).click();await h.shot(s.page,'activity-detail-390');await s.page.locator('.v3-context-cta').click();await h.shot(s.page,'activity-context-390');h.pass('活动详情封面、步骤与上下文CTA');
 const o=await h.surface();await h.staff(o,'DEMO_T004');await o.page.locator('.v3-work-list .ant-skeleton').waitFor({state:'hidden'});await h.shot(o.page,'today-1440');assert.equal(await o.page.locator('.welcome-banner').count(),0);assert.equal(await o.page.locator('.catalog').count(),0);h.pass('今日工作替代宣传与奖励目录');
 for(const surface of [s,o])assert.equal(await surface.page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
 assert.deepEqual(h.errors,[]);h.pass('样板没有页面异常或根横向溢出');await h.finish();
}catch(e){await h.finish(e);}
