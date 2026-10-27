import fs from 'node:fs';import {chromium} from 'playwright';
const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));const base=`http://127.0.0.1:${c.gatewayPort}`;
const context=await chromium.launchPersistentContext('.runtime/demo-browser',{channel:'chrome',headless:false,viewport:null});
const student=context.pages()[0]||await context.newPage();await student.goto(base);
await student.getByText('进入学生演示',{exact:true}).waitFor({timeout:5000}).catch(()=>{});
if(await student.locator('input[type=password]').count()){await student.locator('input[type=password]').fill(c.demoAccessCode);await student.getByText('进入我的成长空间',{exact:true}).click();await student.getByText('你好，模拟学生01',{exact:true}).waitFor();}
const staff=await context.newPage();await staff.goto(base+'/admin/');await staff.getByLabel('职员账号').waitFor({timeout:5000}).catch(()=>{});
if(await staff.getByLabel('职员账号').count()){await staff.getByLabel('职员账号').fill('DEMO_T003');await staff.getByLabel('本地职员密码').fill(c.staffPassword);await staff.getByRole('button',{name:'登录工作台',exact:true}).click();await staff.getByText('模拟教员审核员',{exact:true}).waitFor();}
await student.bringToFront();console.log('Opened local student and staff tabs with isolated authenticated sessions. No credentials printed.');
await new Promise(resolve=>context.on('close',resolve));
