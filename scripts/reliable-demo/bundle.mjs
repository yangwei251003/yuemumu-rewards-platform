import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';import {chromium} from 'playwright';
const runtime=path.resolve(process.env.YUEMUMU_PROJECT_ROOT||process.cwd()),source=path.resolve('docs/design/reliable-demo'),target=path.resolve(process.argv[2]||'output/teacher-demo');
fs.mkdirSync(source,{recursive:true});fs.mkdirSync(target,{recursive:true});const write=(name,value)=>fs.writeFileSync(source+'/'+name,value,'utf8');
write('launch.ps1',`param([ValidateSet('start','stop','check')][string]$Action = 'start')
$ErrorActionPreference = 'Stop'
$runtimeFolder = '${runtime}'
$nodeProgram = 'C:/Program Files/nodejs/node.exe'
$entryScript = $runtimeFolder + '/scripts/reliable-demo/control.mjs'
foreach ($required in @($nodeProgram,$entryScript,($runtimeFolder+'/.runtime/config.json'),($runtimeFolder+'/node_modules/mysql2/package.json'),($runtimeFolder+'/node_modules/playwright/package.json'))) {
 if (!(Test-Path -LiteralPath $required)) { throw '本机演示安装文件缺失。不要重新建库，请保留当前资料并联系维护人员。' }
}
$env:PATH = 'C:/Program Files/nodejs;' + $env:PATH
$logFolder = $runtimeFolder + '/.runtime/launcher'
New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
$stamp = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff')
$stdoutPath = $logFolder + '/' + $stamp + '-' + $Action + '.out.txt'
$stderrPath = $logFolder + '/' + $stamp + '-' + $Action + '.err.txt'
$startedAt = [DateTime]::UtcNow
Write-Host '正在核验专属演示环境，请稍候。无需填写账号密码。'
$child = Start-Process -FilePath $nodeProgram -ArgumentList @(('"' + $entryScript + '"'),$Action) -WorkingDirectory $runtimeFolder -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru
for ($attempt=0; $attempt -lt 480; $attempt++) {
 $child.Refresh()
 if ($child.HasExited) {
  $child.WaitForExit()
  if (Test-Path -LiteralPath $stdoutPath) { Get-Content -LiteralPath $stdoutPath -Encoding utf8 | Write-Host }
  if ($child.ExitCode -ne 0) { if (Test-Path -LiteralPath $stderrPath) { Get-Content -LiteralPath $stderrPath -Encoding utf8 | Write-Host }; throw '没有通过启动或停止检查。系统没有清库或重置账号。请保留上面的错误代码。' }
  exit 0
 }
 if ($Action -eq 'start') {
  $readyPath = $runtimeFolder + '/.runtime/controller/ready.json'
  if (Test-Path -LiteralPath $readyPath) {
   try { $ready = Get-Content -LiteralPath $readyPath -Raw -Encoding utf8 | ConvertFrom-Json } catch { $ready = $null }
   if ($ready -and $ready.status -eq 'PASS' -and $ready.pid -eq $child.Id -and (Get-Item -LiteralPath $readyPath).LastWriteTimeUtc -ge $startedAt) {
    Write-Host '可以开始演示：学生01和教员运营均已登录。Alt+Tab切换两个窗口。'
    Write-Host '服务在后台运行。演示结束请双击“02-安全结束演示.cmd”。'
    exit 0
   }
  }
 }
 Start-Sleep -Milliseconds 500
}
throw ('仍未完成，未将等待误报为成功。诊断位置：' + $logFolder)
`);
for(const [name,action]of [['01-一键开始演示.cmd','start'],['02-安全结束演示.cmd','stop'],['03-检查运行状态.cmd','check']])write(name,`@echo off\r\nchcp 65001 >nul\r\ntitle 粤木木 V4 演示\r\n"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -NoProfile -File "%~dp0launch.ps1" -Action ${action}\r\nif errorlevel 1 (pause & exit /b 1)\r\nexit /b 0\r\n`);
write('04-查看使用指导书.cmd','@echo off\r\nstart "" "%~dp0使用指导书.html"\r\n');
write('00-演示前先看.txt',`粤木木 V4 · 以后请用这个文件夹 · 2026-09-09

日常演示只做两步：
1. 双击“01-一键开始演示.cmd”。等显示“可以开始演示”，学生01与教员运营主页面会自动打开，不需要输入密码。
2. 演示结束，双击“02-安全结束演示.cmd”。它会先做本地备份，再正常停止专属数据库。请等提示结束后再关电脑。

怎么切换：Alt+Tab 切换两个Chrome窗口。首次打开可能需要几十秒。重复双击会复用服务，不会新建数据库；登录过期或浏览器被关闭后，再点01即可。
03用于检查当前运行状态；服务没启动时检查失败是正常的，请先点01。

演示中可以操作，但提交、审批、取消、核销会改变模拟记录。只想看体验，请按指导书“十分钟只读演示”进行。

请不要再用旧文件夹的启动入口。新版专属地址是 http://127.0.0.1:38082/ ，教员后台加 /admin/。旧38080、28080不用于这份入口。
本文件夹不保存密码或数据库；自动登录只在本机读取已有私有配置。后台服务窗口默认隐藏，关掉提示窗口不会关闭系统。

本机运行依赖：${runtime}
专属数据与备份：${runtime}
不要删除、移动这两个目录，也不要让同步/清理软件还原它们。运行依赖已独立安装，不依赖旧demo目录。

如果出现明确错误：不要删除数据库日志，不要执行初始化/种子/重置，不要重复尝试改密码。把错误代码交给维护人员。
诊断记录在运行目录 .runtime/launcher 和 .runtime/controller/events.jsonl，注意不要分享 .runtime/config.json。

已验证的是全进程冷启动、两端登录、并发启动和故障恢复；没有实际重启这台Windows电脑。无法保证断电、磁盘故障或文件被外部软件改写时永不出错；新版会检查并明确停下，保护记录。
这仍是当前电脑的演示入口，不是拷贝到其他电脑就能独立运行的安装包。
`);
for(const name of ['school-logo.png','club-logo.png','student-home.png','student-practice.png','ops-workspace.png'])fs.copyFileSync('docs/design/teacher-guide-v4/'+name,source+'/'+name);
let guide=fs.readFileSync('docs/design/teacher-guide-v4/index.html','utf8').replaceAll('2026年9月7日','2026年9月9日').replaceAll('2026-09-07','2026-09-09').replaceAll('38080','38082');
guide=guide.replace(/<section class="sheet" id="start">[\s\S]*?<\/section>/,`<section class="sheet" id="start"><header><img src="school-logo.png" alt="学校标识"><img src="club-logo.png" alt="俱乐部标识"></header><p class="kicker">01 / 一键开始</p><h1>粤木木 · 教员演示手册</h1><p class="lead">V4 稳定启动版 · 2026年9月9日</p><ol><li>双击 <b>01-一键开始演示.cmd</b>，等待“可以开始演示”。</li><li>学生01与教员运营主页面自动打开，不需要填写口令。</li><li>用 <b>Alt＋Tab</b> 切换两个Chrome窗口。</li><li>演示结束双击 <b>02-安全结束演示.cmd</b>，等待备份和停止完成。</li></ol><div class="callout">重复启动会复用服务。浏览器关闭或会话过期后，重新点01。启动未通过检查时，不会创建空库、重置账号或删除日志。</div><p class="screen"><a href="http://127.0.0.1:38082/">学生地址</a> <a href="http://127.0.0.1:38082/admin/">教员地址</a></p><p>请优先使用一键入口，它会自动核验并登录。手动打开地址不等于已登录。</p><p>本机仍需保留 yuemumu-v4-stable 运行目录与专属数据目录；本文件夹不是跨电脑安装包。</p><footer>粤木木 V4 · 模拟数据 · 1 / 8</footer></section>`);
guide=guide.replaceAll('release-manifest.json','文件校验.json').replace('本机口令查看器复制；学生口令与职员密码不可混用','重新双击01，让启动器重新核验并登录；无需改密码').replace('回归环境：38081；原系统入口28080不用于本轮','专属数据库3312；原共享3311与旧28080不用于本轮').replace('关闭投屏后复制口令','通过一键入口自动登录');
write('使用指导书.html',guide);
const browser=await chromium.launch({channel:'chrome'});try{const p=await browser.newPage();await p.goto(pathToFileURL(source+'/使用指导书.html').href);await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));await p.pdf({path:source+'/使用指导书.pdf',preferCSSPageSize:true,printBackground:true});}finally{await browser.close();}
const names=fs.readdirSync(source).filter(n=>n!=='文件校验.json');for(const name of names)fs.copyFileSync(source+'/'+name,target+'/'+name);
const manifest={version:'V4-stable-startup-20260909',runtime,baseUrl:'http://127.0.0.1:38082',kind:'local-shortcuts-not-portable-installer',files:names.map(name=>({name,sha256:createHash('sha256').update(fs.readFileSync(source+'/'+name)).digest('hex')}))};write('文件校验.json',JSON.stringify(manifest,null,2));fs.copyFileSync(source+'/文件校验.json',target+'/文件校验.json');console.log('PASS new teacher folder: '+target);
