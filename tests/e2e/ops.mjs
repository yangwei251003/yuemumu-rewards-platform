import {studentNav} from './v4-navigation.mjs';
/* global document, window */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const config = JSON.parse(fs.readFileSync('.runtime/config.json', 'utf8'));
assert.ok((config.profile==='b'&&config.database==='ym_dev_b')||(config.profile==='integration'&&config.database==='ym_integration'),'Only isolated B or integration profiles are allowed');
const base = `http://127.0.0.1:${config.gatewayPort}`;
const output = process.env.E2E_OUTPUT_DIR || 'tests/visual/evidence';
fs.mkdirSync(output, {recursive: true});
const browser = await chromium.launch({channel: 'chrome', headless: true});
const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
context.setDefaultTimeout(15000);
const student = await context.newPage();
const admin = await context.newPage();
const errors = [];
const results = [];
const apiEvidence = [];
const unexpectedWrites = [];
for (const [surface, page] of [['student', student], ['ops', admin]]) {
 page.on('pageerror', e => errors.push({surface, message: e.message}));
 page.on('response', response => {
  const url = new URL(response.url());
  if (url.pathname.startsWith('/api/v1/')) apiEvidence.push({surface, method: response.request().method(), path: url.pathname, status: response.status()});
 });
 page.on('request', request => {
  const path = new URL(request.url()).pathname;
  if (request.method() === 'POST' && path.startsWith('/api/v1/') && !path.startsWith('/api/v1/auth/')) unexpectedWrites.push({surface, path});
 });
}
const passed = (name, mode = 'real-server') => {results.push({name, mode, status: 'PASS'}); console.log(`PASS ${name}`);};
async function screenshot(name) {
 await admin.screenshot({path: `${output}/ops-${name}.png`, fullPage: true, mask: [admin.locator('input[type=password]')]});
}
async function noOverflow() {
 assert.deepEqual(await admin.evaluate(() => ({width: window.innerWidth, contentWidth: document.documentElement.scrollWidth})), {width: admin.viewportSize().width, contentWidth: admin.viewportSize().width});
}
async function staffLogin() {
 await admin.getByLabel('职员账号', {exact: true}).fill('DEMO_T003');
 await admin.getByLabel('本地职员密码', {exact: true}).fill(config.staffPassword);
 await admin.getByRole('button', {name: '登录工作台', exact: true}).click();
 await admin.locator('.user-chip').getByText('模拟教员审核员', {exact: true}).waitFor();
}
try {
 const health = await context.request.get(`${base}/api/v1/health`);
 assert.equal(health.status(), 200);
 assert.equal(health.headers()['x-instance-id'], config.cookiePrefix);
 assert.equal((await health.json()).contractSha256, fs.readFileSync('packages/contracts/sha256.txt', 'utf8').trim());
 await student.goto(base);
 await student.getByText('进入学生演示', {exact: true}).waitFor();
 await student.locator('input[type=password]').fill(config.demoAccessCode);
 await student.getByText('进入我的成长空间', {exact: true}).click();
 await student.getByText('你好，模拟学生01', {exact: true}).waitFor();
 await admin.goto(`${base}/admin/`);
 await staffLogin();
 await admin.locator('.v3-work-list').waitFor();
 const [studentMe, staffMe] = await Promise.all(['student', 'staff'].map(audience => context.request.get(`${base}/api/v1/me`, {headers: {'X-Session-Audience': audience}})));
 assert.equal(studentMe.status(), 200); assert.equal(staffMe.status(), 200);
 assert.notEqual((await studentMe.json()).id, (await staffMe.json()).id);
 await student.reload();
 await student.getByText('你好，模拟学生01', {exact: true}).waitFor();
 passed('同一浏览器学生与职员登录，真实服务验证身份独立');
 await screenshot('dashboard-1440');
 await admin.goto(`${base}/admin/rewards/`);
 await admin.getByText('共 27 项候选奖励', {exact: true}).waitFor();
 const search = admin.getByPlaceholder('搜索奖励名称或编号');
 await search.pressSequentially('R025');
 await admin.getByText('共 1 项筛选结果', {exact: true}).waitFor();
 assert.equal(await search.inputValue(), 'R025');
 const [detailResponse] = await Promise.all([admin.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/rewards/R025'), admin.locator('.ant-table-row').getByRole('button', {name: /^查看/}).click()]);
 assert.equal(detailResponse.status(), 200);
 await admin.getByText('仅验证门槛，申请时不扣分', {exact: true}).waitFor();
 await admin.getByText('专项申请不会自动兑付现金', {exact: true}).waitFor();
 await screenshot('reward-detail-1440');
 await admin.locator('.ant-drawer-close').click();
 await search.fill('不存在的奖励');
 await admin.getByText('没有匹配的奖励', {exact: true}).waitFor();
 await screenshot('catalog-empty-1440');
 await search.fill('');
 await admin.getByText('共 27 项候选奖励', {exact: true}).waitFor();
 await admin.locator('div.ant-select[aria-label=筛选奖励类型]').click();
 await admin.getByTitle('专项申请', {exact: true}).click();
 await admin.getByText('共 3 项筛选结果', {exact: true}).waitFor();
 await admin.locator('div.ant-select[aria-label=筛选奖励类型]').click();
 await admin.getByTitle('全部类型', {exact: true}).click();
 await admin.getByText('共 27 项候选奖励', {exact: true}).waitFor();
 await admin.locator('.ant-select-dropdown').waitFor({state: 'hidden'});
 passed('职员目录分页、连续输入筛选、专项分类与真实奖励详情');
 for (const width of [360, 390, 430, 1366, 1440, 1920]) {
  await admin.setViewportSize({width, height: 960});
  await noOverflow();
  await screenshot(`catalog-${width}`);
 }
 passed('奖励页360/390/430/1366/1440/1920无页面横向溢出');
 await admin.goto(`${base}/admin/pickup/`);
 await admin.getByText('当前身份没有核销权限', {exact: true}).waitFor();
 await admin.reload();
 await admin.getByText('当前身份没有核销权限', {exact: true}).waitFor();
 assert.equal(await admin.locator('#pickup-token').count(), 0);
 assert.deepEqual(unexpectedWrites, []);
 for (const width of [360, 390, 430, 1366, 1440, 1920]) {
  await admin.setViewportSize({width, height: 960});
  await noOverflow();
  await screenshot(`pickup-${width}`);
 }
 passed('审核员刷新核销深路由仍无领取权限，六尺寸无溢出及业务写请求');
 await studentNav(student,'我的');
 await student.getByText('退出登录', {exact: true}).click();
 await student.getByText('进入学生演示', {exact: true}).waitFor();
 await admin.reload();
 await admin.locator('.user-chip').getByText('模拟教员审核员', {exact: true}).waitFor();
 passed('学生退出不影响职员会话');
 await admin.goto(`${base}/admin/rewards/`);
 await admin.getByText('共 27 项候选奖励', {exact: true}).waitFor();
 await admin.setViewportSize({width: 390, height: 844});
 await context.setOffline(true);
 await admin.locator('button').filter({hasText: '刷新目录'}).click();
 await admin.getByText('网络已断开，请恢复网络后重试。', {exact: true}).waitFor();
 await screenshot('offline-390');
 await context.setOffline(false);
 await admin.getByRole('button', {name: /^重\s*试$/}).click();
 await admin.getByText('共 27 项候选奖励', {exact: true}).waitFor();
 await admin.getByText('网络已断开，请恢复网络后重试。', {exact: true}).waitFor({state: 'hidden'});
 passed('浏览器断网故障注入后恢复真实奖励查询', 'fault-injection');
 // Only inject read errors. These checks are not a backend business-flow completion.
 await admin.route('**/api/v1/rewards?*', route => route.fulfill({status: 503, contentType: 'application/json', body: JSON.stringify({code: 'TEST_UNAVAILABLE', message: '测试故障', requestId: 'ops-fault-injection'})}));
 await admin.locator('button').filter({hasText: '刷新目录'}).click();
 await admin.getByText('服务暂时不可用，请稍后重试。', {exact: false}).waitFor();
 await screenshot('503-error-390');
 await admin.unroute('**/api/v1/rewards?*');
 await admin.getByRole('button', {name: /^重\s*试$/}).click();
 await admin.getByText('服务暂时不可用，请稍后重试。', {exact: false}).waitFor({state: 'hidden'});
 passed('503读请求故障注入显示可恢复错误', 'fault-injection');
 await context.clearCookies({name: `${config.cookiePrefix}_staff`});
 await Promise.all([admin.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/rewards' && r.status() === 401), admin.locator('button').filter({hasText: '刷新目录'}).click()]);
 await admin.getByText('登录已过期，请重新登录。', {exact: false}).waitFor();
 await admin.getByRole('button', {name: '登录工作台', exact: true}).waitFor();
 assert.equal(await admin.locator('.user-chip').count(), 0);
 assert.equal(await admin.locator('.ant-table-row').count(), 0);
 assert.equal(await admin.getByPlaceholder('搜索奖励名称或编号').count(), 0);
 await screenshot('session-expired-390');
 await staffLogin();
 await admin.getByText('共 27 项候选奖励', {exact: true}).waitFor();
 passed('移除职员会话后服务真实返回401，身份与目录清空，重新登录恢复', 'session-expiry-simulation');
 assert.deepEqual(unexpectedWrites, []);
 assert.deepEqual(errors, []);
 passed('无意外业务写请求、无未捕获浏览器异常');
} catch (error) {
 results.push({name: error.message, status: 'FAIL'});
 await screenshot('failure');
 process.exitCode = 1;
 console.error(error.message);
} finally {
 fs.writeFileSync(`${output}/ops-report.json`, JSON.stringify({at: new Date().toISOString(), base, browser: await browser.version(), contractSha256: fs.readFileSync('packages/contracts/sha256.txt', 'utf8').trim(), results, errors, unexpectedWrites, apiEvidence}, null, 2));
 await browser.close();
}
