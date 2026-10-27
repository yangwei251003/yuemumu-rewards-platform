import {seedScope} from './seed-scope';
import {pool} from '../packages/db/src/client';
export async function seedGrowth(){
 for(const id of ['DEMO_T002','DEMO_T003','DEMO_T004','DEMO_T006','DEMO_T008','DEMO_T009'])await seedScope(id,'GOVERNANCE','ORG_DEMO');
 await seedScope('DEMO_T006','AUDIT','ORG_DEMO');
 for(const id of ['DEMO_T002','DEMO_T003','DEMO_T004'])for(const [type,scope]of [['PROJECT','*'],['GROWTH_REVIEW','ORG_DEMO']])await seedScope(id,type,scope);
 await pool.execute("INSERT IGNORE INTO projects(id,organization_id,title,tier,pool_points,status,creator_id) VALUES ('P003','ORG_DEMO','校园无人机巡检原型','P2',1600,'ACTIVE','DEMO_T004')");
 const members=['DEMO_S008','DEMO_S009','DEMO_S010','DEMO_S011'].map(userId=>({userId,basisPoints:2500}));await pool.execute("INSERT IGNORE INTO project_allocations(project_id,version,members,paid_anchor,reason,actor_id) VALUES ('P003',1,?,'{}','模拟项目初始分配，须成员确认和阶段双审','DEMO_T004')",[JSON.stringify(members)]);
 await pool.execute("INSERT IGNORE INTO competitions(id,organization_id,title,series,edition,award_track,allowed_levels,description) VALUES ('C_DEMO','ORG_DEMO','无人机创新挑战赛（虚构演示）','DEMO_DRONE','2026','INNOVATION',?,'虚构赛事，仅演示校级250→省级1000→国家级2500累计差额，非真实白名单认定')",[JSON.stringify(['SCHOOL','PROVINCE','NATIONAL'])]);
 const questions=[{id:'Q1',prompt:'装调前应先做什么？',options:['断电并检查接线','直接通电']},{id:'Q2',prompt:'未经许可可以在人群上方试飞吗？',options:['可以','不可以']},{id:'Q3',prompt:'技能翼章可以替代现场飞行许可吗？',options:['不可以','可以']},{id:'Q4',prompt:'发现受损电池应如何处理？',options:['隔离并报告教员','继续使用']},{id:'Q5',prompt:'模拟积分能够出售提现吗？',options:['不能','可以']}];
 const units=[{id:'L_ONBOARD',title:'身份与入门确认',kind:'TRAINING',code:'ONB_ID',points:10,badge:null},{id:'L_SAFE',title:'安全微课与测试',kind:'TRAINING',code:'SAFE_BASIC',points:30,badge:null},{id:'L_TRAIN_2H',title:'两小时基础装调模块',kind:'TRAINING',code:'TRAINING_MODULE_2H',points:20,badge:null},{id:'L_SKILL_I',title:'技能翼章 I · 独立装调考核',kind:'ASSESSMENT',code:'SKILL_I',points:80,badge:'WING_I'},{id:'L_CONTENT_POSTER',title:'原创招新海报任务',kind:'CONTENT',code:'CONTENT_POSTER',points:30,badge:null}];
 for(const unit of units)await pool.execute('INSERT IGNORE INTO learning_units(id,organization_id,title,kind,rule_code,points,description,requirements,questions,answer_keys,badge_code,creator_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',[unit.id,'ORG_DEMO',unit.title,unit.kind,unit.code,unit.points,'模拟规则：'+unit.points+'点；积分、成长与技能考核独立。','完成测验≥80分、说明独立成果、教员验收；宣传任务须原创并确认使用授权。',JSON.stringify(unit.kind==='CONTENT'?[]:questions),JSON.stringify(unit.kind==='CONTENT'?[]:[0,1,0,0,0]),unit.badge,'DEMO_T004']);
}
