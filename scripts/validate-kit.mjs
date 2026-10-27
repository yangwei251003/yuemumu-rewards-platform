#!/usr/bin/env node
/** Read-only, zero-dependency consistency checks for the MATERIALS, not the app. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const errors=[]; const notes=[];
const check=(condition,message)=>{if(!condition) errors.push(message);};
const read=(p)=>{try{return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));}catch(e){errors.push(`${p}: ${e.message}`);return null;}};
const required=['AGENTS.md','intake/project-input.json','prompts/A_START.md','prompts/B_START.md','docs/01_PRD.md','docs/02_RULES_AND_GOVERNANCE.md','docs/06_TWO_WINDOW_WORKFLOW.md','docs/08_ACCEPTANCE_TESTS.md','packages/contracts/openapi.json'];
for(const p of required) check(fs.existsSync(path.join(root,p)),`缺文件: ${p}`);
let parsed=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git','.local','.runtime','private','dist','dist-weapp','evidence'].includes(e.name))continue; const p=path.join(dir,e.name); if(e.isDirectory())walk(p); else if(e.name.endsWith('.json')){if(read(path.relative(root,p))!==null)parsed++;}}}
walk(root);
const input=read('intake/project-input.json');
if(input){check(input.schemaVersion==='2.0','资料schemaVersion应为2.0');check(input.stage?.target==='local_teacher_demo','当前包目标必须是local_teacher_demo');check(input.stage?.cloudSpendAllowed===false,'当前阶段不允许云付费');check(input.stage?.realPersonalDataAllowed===false,'本阶段不应导入真人资料');for(const k of ['project','stage','machine','demo','operations','assets','accounts'])check(typeof input[k]==='object'&&input[k]!==null,`缺资料分组${k}`);}
const policy=read('data/policies/rules.v1.demo.json');
const activities=read('data/catalog/activities.json');
const projects=read('data/catalog/projects.json');
const rewards=read('data/catalog/rewards.json');
const comps=read('data/catalog/competitions.json');
const permissions=read('data/policies/permissions.json');
const scenarios=read('data/demo/scenarios.json');
const rules=policy?.earningRules||[];
const unique=(items,key,label)=>{const a=items.map(x=>x[key]);check(a.every(x=>typeof x==='string'&&x.length>0),`${label}: 缺${key}`);check(new Set(a).size===a.length,`${label}: ${key}重复`);};
if(policy){check(policy.approvedForRealUse===false,'规则不能冒称生产已批准');check(policy.status==='DRAFT_FOR_DEMO','规则状态应为DRAFT_FOR_DEMO');check(rules.length>=40,'earningRules规则数量异常');unique(rules,'code','积分规则');}
if(activities){unique(activities.items,'id','活动');const c=new Set(rules.map(x=>x.code));for(const a of activities.items){check(c.has(a.earningRuleCode),`${a.id}规则引用不存在`);check(a.approvedForRealUse===false,`${a.id}不能伪装正式活动`);}}
if(projects)unique(projects.items,'id','项目');
if(rewards){check(rewards.items.length===27,'奖励候选数应为27');unique(rewards.items,'id','奖品');for(const a of rewards.items){check(a.productionStock===0,`${a.id}真实库存必须初始为0`);check(a.imageUrl===null||typeof a.imageUrl==='string',`${a.id}图片类型异常`);}}
if(comps)unique(comps.items,'id','赛事');
if(permissions){check(permissions.roles.length===8,'预置角色应为8');unique(permissions.roles,'code','角色');}
if(scenarios){check(scenarios.demoOnly===true,'种子必须标记demoOnly');const expected=[...Array.from({length:16},(_,i)=>'DEMO_S'+String(i+1).padStart(3,'0')),...Array.from({length:9},(_,i)=>'DEMO_T'+String(i+1).padStart(3,'0'))];check(JSON.stringify(scenarios.users.map(u=>u.id).sort())===JSON.stringify(expected.sort()),'模拟账号须为16个学生/访客及9个独立职员，不得混入其他身份');unique(scenarios.users,'id','账号');for(const u of scenarios.users){check(u.demoOnly===true,`账号${u.id}须显式标记demoOnly`);check(!u.realStudentNo,`账号${u.id}不得带真实学号`);}}
const spec=read('packages/contracts/openapi.json');
if(spec){check(spec.openapi==='3.0.3','本草案按OpenAPI 3.0.3');const ids=[];for(const v of Object.values(spec.paths||{})){for(const [verb,op]of Object.entries(v)){if(['get','post','put','patch','delete'].includes(verb))ids.push(op.operationId);}}check(ids.every(Boolean),'API缺operationId');check(new Set(ids).size===ids.length,'operationId重复');function refs(x){if(!x||typeof x!=='object')return;if(x.$ref){check(x.$ref.startsWith('#/'),'初始合同仅应包含内部引用');let dest=spec;for(const k of x.$ref.slice(2).split('/'))dest=dest?.[k.replace(/~1/g,'/').replace(/~0/g,'~')];check(dest!==undefined,`无效$ref ${x.$ref}`);}for(const v of Object.values(x))refs(v);}refs(spec);notes.push(`${Object.keys(spec.paths).length}个路径，${ids.length}个操作，内部引用无断链`);}
const gate=read('coordination/gates/G0.example.json');if(gate)check(gate.ready===false,'G0模板不能预设ready=true');
console.log(`资料包JSON读取: ${parsed}个文件`);for(const n of notes)console.log(n);
if(errors.length){console.error('资料检查失败:\n'+errors.map(x=>' - '+x).join('\n'));process.exitCode=1;}else{console.log('PASS：资料结构、编号、交叉引用与演示边界检查通过。');console.log('这不是产品测试，不代表G0、接口、数据库、页面或上线验收已通过。');}
