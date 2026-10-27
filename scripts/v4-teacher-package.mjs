import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const target=path.resolve(process.argv[2]||'output/teacher-guide-v4'),source=path.resolve('docs/design/teacher-guide-v4'),demo=path.resolve(process.env.YUEMUMU_PROJECT_ROOT||process.cwd());
const contract=fs.readFileSync('packages/contracts/sha256.txt','utf8').trim(),code=execFileSync('git',['rev-parse','HEAD'],{cwd:demo,encoding:'utf8'}).trim();
assert.ok(fs.statSync(target).isDirectory());
const backup=target+'.backup-'+new Date().toISOString().replace(/[:.]/g,'-');
fs.cpSync(target,backup,{recursive:true,errorOnExist:true,force:false});fs.mkdirSync(source,{recursive:true});
const write=(name,text)=>fs.writeFileSync(path.join(source,name),text,'utf8');
for(const [from,to]of [['evidence/v4/after/student-home-390.png','student-home.png'],['evidence/v4/after/student-practice-390.png','student-practice.png'],['evidence/v4/after/ops-workspace.png','ops-workspace.png'],['docs/design/teacher-guide/school-logo.png','school-logo.png'],['docs/design/teacher-guide/club-logo.png','club-logo.png']])fs.copyFileSync(from,path.join(source,to));
write('start-demo.ps1',`param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$projectPath = '${demo}'
$demoNode = 'C:/Program Files/nodejs/node.exe'
if (!(Test-Path -LiteralPath $projectPath) -or !(Test-Path -LiteralPath $demoNode)) { throw '此包依赖原电脑上的V4展示环境，不能在另一台电脑独立安装。' }
Set-Location -LiteralPath $projectPath
$settings = Get-Content -Raw -LiteralPath '.runtime/config.json' | ConvertFrom-Json
if ($settings.profile -ne 'a' -or $settings.database -ne 'ym_dev_a' -or $settings.dbPort -ne 3311 -or $settings.apiPort -ne 3103 -or $settings.gatewayPort -ne 38080) { throw '展示环境身份不符，已停止。' }
function Test-DemoHealth {
 try {
  $response = Invoke-WebRequest -Uri 'http://127.0.0.1:38080/api/v1/health' -TimeoutSec 5
  $health = $response.Content | ConvertFrom-Json
  return ($response.Headers['x-instance-id'] -eq $settings.cookiePrefix -and $health.databaseReady -and $health.contractSha256 -eq '${contract}')
 } catch { return $false }
}
if (!(Test-DemoHealth)) {
 if ($CheckOnly) { throw 'V4展示服务未就绪。' }
 $env:PATH = 'C:/Program Files/nodejs;' + $env:PATH
 & $demoNode './scripts/mysql.mjs'
 if ($LASTEXITCODE -ne 0) { throw '数据库启动失败，请保留错误信息。' }
 & $demoNode './scripts/demo.mjs'
 if ($LASTEXITCODE -ne 0 -or !(Test-DemoHealth)) { throw '展示启动或身份核验失败。' }
}
Write-Host 'V4展示环境核验通过。仅模拟资料；不会重置或清空数据库。'
if (!$CheckOnly) {
 Start-Process 'http://127.0.0.1:38080/'
 Start-Process 'http://127.0.0.1:38080/admin/'
}
`);
let accounts=fs.readFileSync('docs/design/teacher-guide/show-accounts.ps1','utf8');
accounts='param([switch]$CheckOnly)\n'+accounts.replace(/\$configPath = .*\r?\n/,`$configPath = '${demo}/.runtime/config.json'\n`).replaceAll("'integration'","'a'").replaceAll('28080','38080').replaceAll('主系统','V4展示环境');
accounts=accounts.replace("Write-Host '粤木木", "if ($CheckOnly) { if (!$demoSettings.demoAccessCode -or !$demoSettings.staffPassword) { throw '口令配置缺失。' }; Write-Host 'PASS V4本机口令配置可读（未显示口令）'; return }\nWrite-Host '粤木木");
write('show-accounts.ps1',accounts);
for(const [name,script]of [['01-启动演示.cmd','start-demo.ps1'],['02-查看测试口令.cmd','show-accounts.ps1']])write(name,`@echo off\r\n"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -NoProfile -File "%~dp0${script}"\r\npause\r\n`);
write('00-先看这里.txt',`粤木木系统教员演示包 · V4 · 2026-09-07

1. 双击 index.html 阅读新版指导书；打印或发送教员使用“粤木木系统使用指导书-V4.pdf”。不带版本的PDF内容也已同步为V4。
2. 在当前电脑双击“01-启动演示.cmd”，打开学生端和教员后台。
3. 双击“02-查看测试口令.cmd”，关闭投屏后查看；输入1/2复制口令，Q退出。包内不保存实际密码。
4. 学生选“模拟学生01”；教员审核 DEMO_T003，运营 DEMO_T004，导师 DEMO_T002，领取 DEMO_T005。职员使用本机生成的职员密码。
5. 先按指导书完成10分钟只读演示；提交、审批、取消和核销会真实改变模拟记录，不是可反复点击的静态样板。
6. 学生：http://127.0.0.1:38080/；教员：http://127.0.0.1:38080/admin/。
7. 重要：本包是本机快捷入口和指导书，不是独立安装包。拷到教员另一台电脑，只能阅读PDF/HTML；不能独立启动系统。异机演示需要另行准备运行环境。
8. 微信编译通过，但开发者工具连接、AppID权限及真机体验未验收；未公网发布。
9. 本包不含数据库、真实学生资料和运行密码；原包已备份在同级backup目录。历史V3指导书移入“历史版本-勿用于本轮演示”。
10. 本轮应用 ${code}；合同0.15.0。文件哈希见 release-manifest.json。
`);
const pages=[
['start','01 / 开始演示',`<h1>粤木木 · 飞行实践手册</h1><p class="lead">V4 教员本机演示版 · 2026年9月7日</p><div class="callout">先打开本机系统，再看学生的下一步。所有身份、库存与成果均为模拟资料；制度尚待教员批准。</div><ol><li>双击 <b>01-启动演示.cmd</b>，等待展示环境核验通过。</li><li>双击 <b>02-查看测试口令.cmd</b>。关闭投屏后复制口令，回到登录页面粘贴。</li><li>学生选择“模拟学生01”；教员按下表选择角色。</li></ol><table><tr><th>角色</th><th>账号</th><th>演示用途</th></tr><tr><td>审核教员</td><td>DEMO_T003</td><td>本人待办、独立审核</td></tr><tr><td>运营</td><td>DEMO_T004</td><td>活动、订单、备货与报告</td></tr><tr><td>导师</td><td>DEMO_T002</td><td>项目、事实签认</td></tr><tr><td>领取人员</td><td>DEMO_T005</td><td>订单预览与核销</td></tr></table><p>角色菜单并不代表拥有全部权限；对象范围、自然人回避和服务器决定仍然生效。</p><p class="screen"><a href="http://127.0.0.1:38080/">打开学生端</a> <a href="http://127.0.0.1:38080/admin/">打开教员后台</a></p><div class="callout">这不是独立安装包。复制到另一台电脑只能阅读本指导书；运行仍依赖当前电脑的 V4 展示环境。</div>`],
['student','02 / 学生四个入口',`<div class="tour"><img class="phone" src="student-home.png" alt="V4学生首页实际运行截图"><div><h2>下一步，继续向前。</h2><p>首页突出本人正在参与的真实事项，不用先翻找业务菜单。</p><table><tr><th>入口</th><th>看什么</th></tr><tr><td>发现</td><td>开放训练、学习、工程实践、招募；已有记录时展示“继续你的实践”</td></tr><tr><td>我的实践</td><td>进行中、待我处理、已结束；当前状态与下一步</td></tr><tr><td>奖励</td><td>目录、兑换订单、预约及专项服务</td></tr><tr><td>我的</td><td>成长、翼章、账本、入社、通知与申诉</td></tr></table><p>新访客看到可参与的实践与要求；普通未读通知独立展示，不挤占最紧急的本人待办。</p></div></div>`],
['tour','03 / 十分钟只读演示',`<h2>先演示体验，不消耗准备好的记录</h2><ol><li><b>学生01 → 发现：</b>查看“继续你的实践”，说明每项都有真实状态和下一步。</li><li><b>点击“装调笔记 · 第一次接线检查”：</b>一次定位本人补证材料。先查看，不提交；返回首页。</li><li><b>点击校园航拍地图申请：</b>查看等待录取，说明尚未成队也能追踪进度。</li><li><b>我的实践：</b>切换三个状态。奖励列表向下滚动，打开详情再返回，观察位置保留。</li><li><b>我的：</b>打开木能量明细、翼章、通知与申诉，说明三类权益分离。</li><li><b>教员后台：</b>用运营账号搜索待领取订单，打开详情，再进入移动核销。返回时筛选仍保留；不要确认核销。</li><li><b>退出后选择“模拟访客 · 木小新”：</b>查看新成员首页及参与条件。</li></ol><div class="callout">记录会随真正操作变化。找不到首页示例时，从“我的实践”、订单或教员待办查找最新状态。不要修改余额或重置数据来恢复画面。</div><p>准备好的学生01记录包含待领取、待补证、招募申请。领取期限及活动开放时间以当前页面为准；过期不会被强行绕过。</p>`],
['earn','04 / 活动、补证与独立审核',`<h2>一次实践留下可追溯的记录</h2><ol><li>学生查看参与要求并报名；按真实活动窗口完成起止签到。</li><li>学生提交成果说明与允许的私有附件。</li><li>负责人员完成现场事实签认；签认不等于最终审批。</li><li>独立审核员查看案卷、证据引用、事实签认与前序决定。</li><li>需要补证时，学生从“继续你的实践”直达原成果，补充并重新提交。</li><li>新轮重新签认与独立审核；旧轮仍可读取当时材料。</li><li>通过后查看账本；重复提交不得多次发放。</li></ol><div class="callout">本人、利益相关者必须回避；不同角色不等于不同自然人。服务器会明确说明当前可操作项和回避原因。</div><p>木能量、成长里程、技能翼章分别记录。前端显示不能替代后端判分；不能直接修改余额。</p><p>附件预览逐次鉴权。证据正文、私有预览与领取凭证不应出现在网址、讲义或投屏中。</p>`],
['redeem','05 / 兑换、备货与领取',`<h2>先预览核对，再确认核销</h2><ol><li>学生在奖励目录查看条件，确认兑换；成功后直接打开该订单。</li><li>运营核对订单并备货。库存与本人余额不足时，以服务器提示为准。</li><li>学生在本人订单中展示有效领取凭证，不将凭证发入群聊。</li><li>领取人员扫描二维码或手输凭证，先查看订单与领取点。</li><li>核对无误后显式确认核销；预览本身不会消费订单。</li><li>响应丢失时等系统读取最新状态，或复用原请求重试；没有确定结果不能当作成功。</li></ol><div class="callout">现场确认核销会真实改变这笔模拟订单。只读演示到预览为止；完整流程请事先约定专用模拟订单。</div><p>取消、到期、退货均使用现有受约束流程。质量退货需要实物收齐与独立质检；兑换不降低合法成长记录。</p><p>相机权限不足时使用手输；本轮验证了本地合成相机流和二维码解码，尚未完成手机物理相机实测。</p>`],
['ops','06 / 教员工作台',`<h2>从待办进入具体对象</h2><img class="wide" src="ops-workspace.png" alt="V4教员工作台实际运行截图"><p>先按自己的角色与范围筛选待办。数量为零可能表示该角色暂无事项，不代表系统遗漏或应改用更高权限。</p><ul><li><b>成果签认：</b>从待办定位成果，不靠口头说明猜测对象。</li><li><b>审核详情：</b>查看对应轮次案卷、事实签认、历史决定与可操作项。</li><li><b>订单：</b>从订单进入移动核销，仅携带订单编号；返回恢复筛选。</li><li><b>冲突与权限撤销：</b>刷新读取最新状态，不能反复点击绕过。</li></ul><p>演示独立审批时使用不同虚构自然人账号；不得让同一人换角色完成两次独立审核。</p>`],
['more','07 / 其他完整业务路径',`<h2>按需展开，不必一次演示所有业务</h2><table><tr><th>路径</th><th>演示重点</th></tr><tr><td>学习 → 考核 → 验收 → 翼章</td><td>服务器判卷；未通过不发放；独立验收后查看翼章</td></tr><tr><td>招募 → 录取 → 团队分配 → 阶段验收</td><td>成员确认贡献比例；版本冲突须刷新处理</td></tr><tr><td>赛事 → 成果验收 → 晋级或更正</td><td>沿用原作品、成员与系数；同作品只补差额</td></tr><tr><td>奖励 → 预约与专项</td><td>条件、时段、独立审批与履约；不承诺现金支付</td></tr><tr><td>我的 → 入社申请</td><td>模拟访客申请、教员审批后查看资格变化</td></tr><tr><td>我的 → 通知与申诉</td><td>本人陈述、回避与独立复核</td></tr><tr><td>奖励 → 质量退货</td><td>凭证、审批、实物收齐、另一人质检与返还</td></tr></table><div class="callout">服务窗口、资格、库存、限次和审核人数都是真实限制。遇到拒绝先阅读原因，不使用改余额、改日期或删历史的方法继续演示。</div>`],
['support','08 / 验证与遇到问题时',`<h2>本轮已验证与尚未验证</h2><p>本轮107项接口检查通过；14组浏览器测试共87个断言组通过；最终学生体验17项检查通过。覆盖两端主要流程、权限、重复提交、响应丢失、私有材料及导航修正。</p><p>H5与教员网页已在本机运行。微信构建通过；开发者工具连接、账号/AppID权限和真机体验尚未验收。本包不能作为正式上线或微信真机通过的证明。</p><table><tr><th>现象</th><th>处理</th></tr><tr><td>地址打不开</td><td>在原电脑双击启动入口；保留窗口错误信息，不删除数据库</td></tr><tr><td>登录失败</td><td>重新从本机口令查看器复制；学生口令与职员密码不可混用</td></tr><tr><td>操作显示等待或冲突</td><td>先刷新核对服务器状态；结果未知时不宣称完成</td></tr><tr><td>账号看不到对象</td><td>检查角色、对象范围及回避原因，不申请关闭权限校验</td></tr><tr><td>拷到别的电脑不能运行</td><td>这是本机快捷包；可阅读指导书，异机运行需另行部署</td></tr></table><p>展示环境：38080；回归环境：38081；原系统入口28080不用于本轮。启动器只接入V4展示库，不执行种子、清库或业务重置。</p><p>应用版本 <code>${code}</code><br>合同版本0.15.0。完整文件校验见包内 release-manifest.json。</p>`]
];
write('index.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>粤木木 V4 教员演示指导书</title><style>*{box-sizing:border-box}body{margin:0;background:#e9e6df;color:#252e28;font:15px/1.7 'Microsoft YaHei',sans-serif}a{color:#b84324}nav{max-width:880px;margin:20px auto;display:flex;flex-wrap:wrap;gap:18px}.sheet{max-width:880px;background:#fffef9;margin:24px auto;padding:36px 42px}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #d6d7ca;padding-bottom:14px;margin-bottom:24px}header img{width:180px}header img:last-child{width:140px;background:#252e28;padding:5px}h1{font-size:32px}h2{font-size:25px}h1,h2{line-height:1.4}h3{color:#b84324}.kicker{color:#b84324;font-weight:bold}.lead{font-size:20px}.callout{background:#f5f2ea;border-left:4px solid #b84324;padding:14px 18px;margin:20px 0}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;padding:10px;border-bottom:1px solid #d6d7ca;vertical-align:top}th{background:#f5f2ea}li{margin:12px 0}.tour{display:grid;grid-template-columns:220px 1fr;gap:26px}.phone{width:220px;max-width:100%}.wide{width:100%;max-height:320px;object-fit:contain}footer{border-top:1px solid #d6d7ca;font-size:11px;margin-top:24px;padding-top:10px;color:#626960}code{overflow-wrap:anywhere}@media(max-width:650px){.sheet{margin:10px;padding:22px}.tour{grid-template-columns:1fr}header img{width:50%}header img:last-child{width:35%}}@page{size:A4;margin:14mm}@media print{body{background:white;font-size:10.5pt;line-height:1.6}nav,.screen{display:none}.sheet{margin:0;padding:0;break-after:page}.sheet:last-child{break-after:auto}h1{font-size:25pt}h2{font-size:20pt}table{font-size:10pt}th,td{padding:8px}li{margin:10px 0}.wide{max-height:260px}.callout{padding:10px 14px}header{margin-bottom:18px}footer{font-size:8pt}tr,.callout{break-inside:avoid}}</style><nav>${pages.map(([id,title])=>`<a href="#${id}">${title}</a>`).join('')}</nav>${pages.map(([id,title,body],i)=>`<section class="sheet" id="${id}"><header><img src="school-logo.png" alt="学校标识"><img src="club-logo.png" alt="俱乐部标识"></header><p class="kicker">${title}</p>${body}<footer>粤木木 V4 · 本机模拟演示 · 制度待批准 ｜ ${i+1} / 8</footer></section>`).join('')}</html>`);
const browser=await chromium.launch({channel:'chrome'});
try{const p=await browser.newPage();await p.goto(pathToFileURL(path.join(source,'index.html')).href);await p.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));assert.equal(await p.locator('.sheet').count(),8);await p.pdf({path:path.join(source,'粤木木系统使用指导书-V4.pdf'),preferCSSPageSize:true,printBackground:true});fs.copyFileSync(path.join(source,'粤木木系统使用指导书-V4.pdf'),path.join(source,'粤木木系统使用指导书.pdf'));await p.screenshot({path:path.join(source,'guide-preview.png')});}finally{await browser.close();}
const names=fs.readdirSync(source).filter(n=>n!=='release-manifest.json');const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest={version:'v4-teacher-demo-20260907',createdAt:new Date().toISOString(),kind:'local-guide-and-shortcuts-not-standalone-installer',applicationSha:code,contractVersion:'0.15.0',contractSha256:contract,baseUrl:'http://127.0.0.1:38080',files:names.map(name=>({name,sha256:hash(path.join(source,name))}))};write('release-manifest.json',JSON.stringify(manifest,null,2));
const oldPdf=path.join(target,'粤木木系统使用指导书-V3.pdf');if(fs.existsSync(oldPdf)){const archive=path.join(target,'历史版本-勿用于本轮演示');fs.mkdirSync(archive,{recursive:true});fs.renameSync(oldPdf,path.join(archive,'粤木木系统使用指导书-V3.pdf'));}
for(const name of [...names,'release-manifest.json'])fs.copyFileSync(path.join(source,name),path.join(target,name));for(const item of manifest.files)assert.equal(hash(path.join(target,item.name)),item.sha256);
console.log(JSON.stringify({status:'PASS',target,backup,files:names.length,applicationSha:code},null,2));
