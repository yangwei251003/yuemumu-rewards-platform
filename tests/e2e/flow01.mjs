import {studentNav} from './v4-navigation.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const config=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
assert.ok((config.profile==='b'&&config.database==='ym_dev_b')||(config.profile==='integration'&&config.database==='ym_integration'),'Only isolated B or integration profiles are allowed');
const base=`http://127.0.0.1:${config.gatewayPort}`;
const out=process.env.E2E_OUTPUT_DIR||'tests/visual/evidence';fs.mkdirSync(out,{recursive:true});const records=[],errors=[],results=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
async function surface(viewport){const context=await browser.newContext({viewport});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{const url=new URL(r.url());if(url.pathname.startsWith('/api/v1/'))records.push({method:r.request().method(),path:url.pathname,status:r.status()});});return {context,page};}
const student=await surface({width:390,height:844}),ops=await surface({width:1440,height:1000}),mentor=await surface({width:1440,height:1000}),reviewer=await surface({width:1440,height:1000});
const pass=name=>{results.push({name,status:'PASS',mode:'real-api-mysql-ui'});console.log('PASS '+name);};
const response=(page,path)=>page.waitForResponse(r=>new URL(r.url()).pathname===path&&r.request().method()==='POST');
async function staffLogin(page,id){await page.goto(base+'/admin/');await page.getByLabel('职员账号',{exact:true}).fill(id);await page.getByLabel('本地职员密码',{exact:true}).fill(config.staffPassword);await page.getByRole('button',{name:'登录工作台',exact:true}).click();await page.getByRole('button',{name:'退出登录',exact:true}).waitFor();}
async function wallet(){const r=await student.context.request.get(base+'/api/v1/wallet',{headers:{'X-Session-Audience':'student'}});assert.equal(r.status(),200);return r.json();}
async function shot(page,name){await page.screenshot({path:`${out}/flow01-${name}.png`,fullPage:true});}
try{
 await student.page.goto(base);await student.page.locator('input[type=password]').fill(config.demoAccessCode);await student.page.getByText('进入我的成长空间',{exact:true}).click();await student.page.getByText('你好，模拟学生01',{exact:true}).waitFor();
 await Promise.all([staffLogin(ops.page,'DEMO_T004'),staffLogin(mentor.page,'DEMO_T002'),staffLogin(reviewer.page,'DEMO_T003')]);
 const before=await wallet();pass('四种真实身份登录，学生/运营/导师/审核员会话隔离');
 const title='自动验收装调-'+Date.now();
 await ops.page.goto(base+'/admin/activities/');await ops.page.getByRole('button',{name:'创建活动',exact:true}).click();
 await ops.page.getByLabel('活动标题',{exact:true}).fill(title);
 const localDate=d=>{const shifted=new Date(d.getTime()-d.getTimezoneOffset()*60000);return shifted.toISOString().slice(0,16);};
 await ops.page.getByLabel('开始时间',{exact:true}).fill(localDate(new Date(Date.now()-5*3600000)));await ops.page.getByLabel('结束时间',{exact:true}).fill(localDate(new Date()));
 await ops.page.getByLabel('活动名额',{exact:true}).fill('2');await ops.page.getByLabel('完成要求',{exact:true}).fill('完成起止签到、接线检查、四旋翼装调说明与独立验收。');
 const created=response(ops.page,'/api/v1/activities');await ops.page.getByRole('button',{name:'保存活动草稿',exact:true}).click();const createdResponse=await created;assert.equal(createdResponse.status(),200);const activity=await createdResponse.json();assert.equal(activity.pointsPreview,50);
 const publish=response(ops.page,`/api/v1/activities/${activity.id}/publish`);await ops.page.getByRole('button',{name:'发布活动',exact:true}).click();assert.equal((await publish).status(),200);pass('运营通过真实页面创建并发布50分装调活动');
 await shot(ops.page,'activity-published');
 await studentNav(student.page,'活动');await student.page.getByRole('textbox',{name:'搜索活动名称'}).fill(title);const card=student.page.locator('.activity-card').filter({hasText:title});await card.getByText('查看活动与参与',{exact:true}).click();
 await student.page.locator('.agreement').click();const registered=response(student.page,`/api/v1/activities/${activity.id}/registrations`);await student.page.getByText('确认报名',{exact:true}).click();const registration=await (await registered).json();assert.equal(registration.status,'REGISTERED');await student.page.getByText('报名成功',{exact:true}).first().waitFor();await shot(student.page,'student-registered-390');pass('学生阅读规则并通过真实页面报名');
 await mentor.page.goto(base+'/admin/activities/');await mentor.page.getByPlaceholder('搜索活动名称或编号').fill(title);await mentor.page.getByRole('button',{name:'查看活动'+title,exact:true}).click();
 for(const [phase,label] of [['START','开始'],['END','结束']]){
  const codeResponse=response(mentor.page,`/api/v1/activities/${activity.id}/attendance-codes`);await mentor.page.getByRole('button',{name:'生成'+label+'签到码',exact:true}).click();assert.equal((await codeResponse).status(),200);
  const token=await mentor.page.getByLabel('现场签到码',{exact:true}).inputValue();assert.ok(token.length>20);await mentor.page.getByRole('button',{name:'隐藏签到码',exact:true}).click();
  await student.page.locator('.chip').filter({hasText:label+'签到'}).click();await student.page.locator('input[placeholder="输入教员提供的签到码"]').fill(token);
  const attendance=response(student.page,'/api/v1/attendance');await student.page.getByText('提交'+label+'签到',{exact:true}).click();const attendanceResponse=await attendance;assert.equal(attendanceResponse.status(),200);assert.equal((await attendanceResponse.json()).phase,phase);
 }
 assert.equal((await wallet()).availablePoints,before.availablePoints);pass('导师起止码与学生签到完成，扫码不发积分');
 await student.page.getByRole('textbox',{name:'为这份成果填写唯一名称或编号'}).fill('artifact-'+activity.id);await student.page.getByRole('textbox',{name:'说明完成了哪些步骤、得到什么结果'}).fill('完成四机臂四电机检查、装调接线与安全流程说明。仅模拟验收。');
 const submitted=response(student.page,'/api/v1/submissions');await student.page.getByText('提交成果说明',{exact:true}).click();const submissionResponse=await submitted;assert.equal(submissionResponse.status(),200);const submission=await submissionResponse.json();assert.equal(submission.status,'SUBMITTED');await shot(student.page,'student-submitted-390');
 const completed=response(ops.page,`/api/v1/activities/${activity.id}/complete`);await ops.page.getByRole('button',{name:'确认活动已结束',exact:true}).click();assert.equal((await completed).status(),200);
 await mentor.page.getByRole('button',{name:'刷新成果',exact:true}).click();const evidence=mentor.page.locator('.submission-card').filter({hasText:'artifact-'+activity.id});await evidence.getByLabel('事实签认理由',{exact:true}).fill('已核验起止签到、接线及成果说明，确认完成。');const verified=response(mentor.page,`/api/v1/submissions/${submission.id}/verify`);await evidence.getByRole('button',{name:'确认事实签认',exact:true}).click();assert.equal((await verified).status(),200);await shot(mentor.page,'mentor-fact-verified');pass('学生成果提交，运营确认结束，导师独立事实签认');
 await ops.page.goto(base+'/admin/approvals/');await ops.page.getByPlaceholder('搜索审批编号、申请人或活动编号').fill(activity.id);await ops.page.getByRole('button',{name:'审查审批'+submission.approvalId,exact:true}).click();await ops.page.getByText('你的可操作项',{exact:true}).waitFor();assert.equal(await ops.page.getByRole('button',{name:'提交审批决定',exact:true}).isDisabled(),true);const sessionResponse=await ops.context.request.get(base+'/api/v1/auth/session',{headers:{'X-Session-Audience':'staff'}});const session=await sessionResponse.json();const denied=await ops.context.request.post(base+`/api/v1/approvals/${submission.approvalId}/decisions`,{headers:{'X-Session-Audience':'staff','X-CSRF-Token':session.csrfToken,'Idempotency-Key':'recusal:'+crypto.randomUUID()},data:{decision:'APPROVE',reason:'测试发起人回避',expectedVersion:1}});assert.equal(denied.status(),403);assert.equal((await denied.json()).code,'RECUSAL_REQUIRED');await shot(ops.page,'creator-recusal');assert.equal((await wallet()).availablePoints,before.availablePoints);pass('活动发起人自审被服务器拒绝，钱包没有改变');
 await reviewer.page.goto(base+'/admin/approvals/');await reviewer.page.getByPlaceholder('搜索审批编号、申请人或活动编号').fill(activity.id);await reviewer.page.getByRole('button',{name:'审查审批'+submission.approvalId,exact:true}).click();await reviewer.page.getByLabel('审批理由',{exact:true}).fill('核对独立事实签认及文字成果，批准本次模拟学习记录。');const approved=response(reviewer.page,`/api/v1/approvals/${submission.approvalId}/decisions`);await reviewer.page.getByRole('button',{name:'提交审批决定',exact:true}).click();const approvedResponse=await approved;assert.equal(approvedResponse.status(),200);assert.equal((await approvedResponse.json()).status,'APPROVED');await shot(reviewer.page,'independent-approval');
 await studentNav(student.page,'成长');await student.page.getByText('刷新记录',{exact:true}).click();const after=await wallet();assert.equal(after.availablePoints,before.availablePoints+50);assert.equal(after.growthMileage,before.growthMileage+50);await student.page.locator('.number').filter({hasText:String(after.availablePoints)}).waitFor();await shot(student.page,'student-credited-390');
 await studentNav(student.page,'账本');await student.page.getByText(title+'：独立验收通过',{exact:true}).waitFor();await shot(student.page,'ledger-evidence-390');pass('独立审核真实入账50，学生钱包与成长里程及账本一致');
 assert.deepEqual(errors,[]);pass('全程没有未捕获浏览器异常；无模拟成功响应');
}catch(e){results.push({name:e.message,status:'FAIL'});throw e;}
finally{fs.writeFileSync(`${out}/flow01-report.json`,JSON.stringify({at:new Date().toISOString(),base,contractSha256:fs.readFileSync('packages/contracts/sha256.txt','utf8').trim(),results,errors,apiEvidence:records},null,2));await browser.close();}
