import fs from 'node:fs';
import {seedScope} from './seed-scope';
import {randomBytes,scryptSync} from 'node:crypto';
import {pool,rows} from '../packages/db/src/client';
import {config} from '../packages/db/src/config';
import {approveSource,postSource} from '../packages/domain/src/ledger';
import {seedGrowth} from './seed-growth';
const c=config();
async function main(){
 const seed=JSON.parse(fs.readFileSync('data/demo/scenarios.json','utf8')) as {users:{id:string;displayName:string;roles:string[];membershipStatus?:'VISITOR'|'ACTIVE'}[]};
 for(const u of seed.users){
  const salt=randomBytes(16).toString('hex');const hash=salt+':'+scryptSync(c.staffPassword,salt,64).toString('hex');
  await pool.execute('INSERT IGNORE INTO users(id,person_id,organization_id,display_name,roles,membership_status,demo_only,password_hash) VALUES (?,?,?,?,?,?,?,?)',[u.id,u.id,'ORG_DEMO',u.displayName,JSON.stringify(u.roles),u.membershipStatus||'ACTIVE',true,u.id.startsWith('DEMO_T')?hash:null]);
  await pool.execute('INSERT IGNORE INTO wallets(user_id) VALUES (?)',[u.id]);
 }
 const rewards=JSON.parse(fs.readFileSync('data/catalog/rewards.json','utf8')).items as {id:string;name:string;category:string;kind:string;pointsRequired:number;pointsMode:string;demoQuantity:number;requiresDualApproval:boolean}[];
 for(const [id,type,scope]of [['DEMO_T003','ACCESS_APPROVAL','ORG_DEMO'],['DEMO_T008','ACCESS_APPROVAL','ORG_DEMO'],['DEMO_T003','PICKUP','SITE_DEMO'],['DEMO_T008','PICKUP','SITE_DEMO'],['DEMO_T008','REVIEW','ORG_DEMO'],['DEMO_T004','REPORTING','ORG_DEMO'],['DEMO_T001','ACTIVITY','*'],['DEMO_T002','ACTIVITY','*'],['DEMO_T003','ACTIVITY','*'],['DEMO_T004','ACTIVITY','*'],['DEMO_T003','REVIEW','ORG_DEMO'],['DEMO_T004','REVIEW','ORG_DEMO'],['DEMO_T005','PICKUP','SITE_DEMO'],['DEMO_T004','PICKUP','SITE_DEMO']])await seedScope(id,type,scope);
 await pool.execute("INSERT IGNORE INTO activities(id,organization_id,title,status,starts_at,ends_at,capacity,rule_code,points,requirements,creator_id) VALUES ('ACT_DEMO_4H','ORG_DEMO','无人机装调实训 · 4小时','PUBLISHED',?, ?,30,'TRAINING_4H',50,'起止签到、完成装调成果说明、教员独立事实签认、审核员验收','DEMO_T004')",[new Date(Date.now()-4*3600000),new Date()]);
 for(const r of rewards){const body={id:r.id,name:r.name,category:r.category,kind:r.kind,pointsRequired:r.pointsRequired,pointsMode:r.pointsMode,availableQuantity:r.demoQuantity,imageUrl:null,isIllustration:true,demoOnly:true,requiresApproval:r.requiresDualApproval||r.kind==='application',version:1};await pool.execute('INSERT IGNORE INTO rewards(id,body) VALUES (?,?)',[r.id,JSON.stringify(body)]);}
 for(const r of rewards){await pool.execute('INSERT IGNORE INTO inventory(reward_id,site_id,organization_id,on_hand) VALUES (?,?,?,?)',[r.id,'SITE_DEMO','ORG_DEMO',r.demoQuantity]);await pool.execute('INSERT IGNORE INTO inventory_movements(id,reward_id,site_id,kind,delta_on_hand,delta_reserved,actor_id,request_id) VALUES (?,?,?,?,?,0,?,?)',['SEED_STOCK_'+r.id,r.id,'SITE_DEMO','SEED',r.demoQuantity,'DEMO_T004','SEED_STOCK_'+r.id]);}
 for(const [id,kind,points,growth]of [['SEED:history-earned','EARN',1240,1240],['SEED:history-spent','SPEND',380,0]] as const){
  await pool.execute('INSERT IGNORE INTO earning_sources(id,beneficiary_id,organization_id,applicant_person_id,interested_person_ids,kind,points,growth,reason,rule_version) VALUES (?,?,?,?,?,?,?,?,?,?)',[id,'DEMO_S001','ORG_DEMO','DEMO_S001','[]',kind,points,growth,'模拟历史领域事件；不代表实际活动或已采购奖励','DRAFT_FOR_DEMO:v1']);
  for(const actor of ['DEMO_T003','DEMO_T004'])if(!(await rows(pool,'SELECT actor_id FROM approval_decisions WHERE source_id=? AND actor_id=?',[id,actor])).length)await approveSource(actor,id);
  await postSource('DEMO_T003',id,id);
 }
 await seedGrowth();
 console.log('Retained/seeded fictional identities, rewards, approved history and growth catalog. No clearing or repeat rewards.');
}
main().catch(e=>{console.error(e instanceof Error?e.message:'Seed failed');process.exitCode=1;}).finally(()=>pool.end());
