import test,{after} from 'node:test';import assert from 'node:assert/strict';
import {migration,fixture,key,prefix} from '../integration/fixtures';
import {pool,rows} from '../../packages/db/src/client';
import {reconcile} from '../../packages/domain/src/ledger';
import {allocate,competitionTargets} from '../../packages/domain/src/allocation';
import {ApiError,type Schemas} from '../../packages/sdk/src';
after(async()=>{await migration.end();await pool.end();});
const rejects=(code:string)=>(e:unknown)=>e instanceof ApiError&&e.problem.code===code;
test('GROW/COMP real API + MySQL target entitlements',async t=>{
 const ops=await fixture('ops',['OPS_MANAGER']),mentor=await fixture('mentor',['MENTOR']),review=await fixture('review',['REVIEWER']);const students:Awaited<ReturnType<typeof fixture>>[]=[];for(let i=0;i<5;i++)students.push(await fixture('s'+i,['STUDENT'],'student'));
 const members=students.slice(0,4).map(s=>({userId:s.id,basisPoints:2500}));
 let project:Schemas['Project'];
 const decide=async(r:Schemas['AwardRequest'],client=mentor.client)=>client.call('decideAwardRequest',{decision:'APPROVE',reason:'隔离测试独立验收',expectedVersion:r.version},{awardId:r.id},key());
 const dual=async(r:Schemas['AwardRequest'])=>decide(await decide(r),review.client);
 const confirm=async(p:Schemas['Project'])=>{for(const s of students)if(p.members.some(m=>m.userId===s.id))await s.client.call('confirmProjectAllocation',{allocationVersion:p.allocationVersion},{projectId:p.id},key());};
 await t.test('T17 invalid 9999/10001, duplicate member and four-member >40% rejected',async()=>{
  for(const adjustment of [-1,1])await assert.rejects(ops.client.call('createProject',{title:'无效分配',tier:'P2',poolPoints:1001,members:members.map((m,i)=>({...m,basisPoints:m.basisPoints+(i===0?adjustment:0)}))},{},key()),rejects('INVALID_ALLOCATION'));
  await assert.rejects(ops.client.call('createProject',{title:'超比例',tier:'P2',poolPoints:1001,members:members.map((m,i)=>({...m,basisPoints:[5000,2000,2000,1000][i]}))},{},key()),rejects('MEMBER_CAP'));
  const allocation=allocate(1001,[{userId:'a',basisPoints:3333},{userId:'b',basisPoints:3333},{userId:'c',basisPoints:3334}]);assert.equal(Object.values(allocation).reduce((a,b)=>a+b,0),1001);assert.deepEqual(allocation,allocate(1001,[{userId:'c',basisPoints:3334},{userId:'a',basisPoints:3333},{userId:'b',basisPoints:3333}]));
  project=await ops.client.call('createProject',{title:'1001分四人项目',tier:'P2',poolPoints:1001,members},{},key());
 });
 const stageBody=(stage:number)=>({expectedVersion:project.version,stage,artifactId:prefix+'_project_artifact',evidenceFileIds:[],description:'真实测试阶段成果，独立验收'});
 await t.test('T14/15 confirmations, self/creator recusal, same natural person alias cannot complete dual review',async()=>{
  await assert.rejects(students[0].client.call('submitProjectStage',stageBody(1),{projectId:project.id},key()),rejects('MEMBERS_NOT_CONFIRMED'));await confirm(project);
  let r=await students[0].client.call('submitProjectStage',stageBody(1),{projectId:project.id},key());assert.equal(Object.values(r.targets).reduce((a,b)=>a+b,0),100);assert.equal(r.requiredDistinctApprovers,2);
  await assert.rejects(decide(r,ops.client),rejects('RECUSAL_REQUIRED'));r=await decide(r);assert.equal(r.status,'PARTIAL_APPROVAL');assert.equal((await students[0].client.call('getMyWallet')).availablePoints,0);
  const alias=await fixture('mentorAlias',['REVIEWER'],'staff',mentor.id);await assert.rejects(decide(r,alias.client),rejects('DUPLICATE_PERSON'));
  r=await decide(r,review.client);assert.equal(r.status,'APPROVED');assert.equal((await students[0].client.call('getMyWallet')).availablePoints,25);project=await ops.client.call('getProject',undefined,{projectId:project.id});assert.equal(project.completedStage,1);
 });
 await t.test('project-scoped mentor can list assigned projects and cannot read unrelated award details',async()=>{
  const limited=await fixture('limited',['MENTOR']);await migration.execute("DELETE FROM role_scopes WHERE user_id=? AND scope_type='PROJECT'",[limited.id]);assert.equal((await limited.client.call('listProjects')).items.length,0);assert.equal((await limited.client.call('listAwardRequests')).items.length,0);
  const award=(await mentor.client.call('listAwardRequests')).items.find(a=>a.sourceId===project.id)!;
  const before=await rows(pool,'SELECT * FROM award_decisions WHERE request_id=?',[award.id]);
  await assert.rejects(decide(award,limited.client),rejects('SCOPE_FORBIDDEN'));
  assert.deepEqual(await rows(pool,'SELECT * FROM award_decisions WHERE request_id=?',[award.id]),before);
  await migration.execute("INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,'PROJECT',?)",[limited.id,project.id]);assert.equal((await limited.client.call('listProjects')).items[0].id,project.id);assert.equal((await limited.client.call('listAwardRequests')).items[0].sourceId,project.id);
 });
 await t.test('T18 changed allocation and exiting member preserve earned points and exact pool conservation',async()=>{
  const revised=members.map((m,i)=>({...m,basisPoints:[4000,3000,2000,1000][i]}));project=await ops.client.call('updateProjectAllocation',{expectedVersion:project.version,members:revised,reason:'版本2仅分配未验收部分'},{projectId:project.id},key());await confirm(project);
  let r=await students[0].client.call('submitProjectStage',stageBody(2),{projectId:project.id},key());await dual(r);project=await ops.client.call('getProject',undefined,{projectId:project.id});assert.equal(Object.values(project.paidTargets).reduce((a,b)=>a+b,0),350);const exitedPaid=project.paidTargets[students[3].id];
  project=await ops.client.call('updateProjectAllocation',{expectedVersion:project.version,members:[{userId:students[0].id,basisPoints:3333},{userId:students[1].id,basisPoints:3333},{userId:students[4].id,basisPoints:3334}],reason:'新成员加入，既有成员退出，冻结已验收权益'},{projectId:project.id},key());await confirm(project);
  for(const stage of [3,4]){r=await students[0].client.call('submitProjectStage',stageBody(stage),{projectId:project.id},key());await dual(r);project=await ops.client.call('getProject',undefined,{projectId:project.id});}
  assert.equal(project.status,'COMPLETED');assert.equal(Object.values(project.paidTargets).reduce((a,b)=>a+b,0),1001);assert.equal(project.paidTargets[students[3].id],exitedPaid);
  const [total]=await rows<{n:string}>(pool,"SELECT SUM(delta_available) n FROM ledger_entries WHERE source_type='PROJECT_STAGE' AND source_id=?",[project.id]);assert.equal(Number(total.n),1001);for(const s of students)assert.equal((await reconcile(s.id)).matches,true);
 });
 const comp=await ops.client.call('createCompetition',{title:'虚构积分赛事',series:prefix,edition:'2026',awardTrack:'OPEN',allowedLevels:['SCHOOL','PROVINCE','NATIONAL'],description:'模拟白名单，非真实赛事资质认定'},{},key());
 const contest=await fixture('contest',['STUDENT'],'student');const compBody={competitionId:comp.id,artifactId:prefix+'_competition',level:'SCHOOL' as const,rank:4,members:[{userId:contest.id,coefficientBasisPoints:10000 as const}],correction:false,evidenceFileIds:[],description:'隔离竞赛证明'};
 await t.test('T19 school→province→national target differences; duplicate submission/new keys cannot repeat points',async()=>{
  let r=await contest.client.call('submitCompetitionAward',compBody,{},key());await dual(r);assert.equal((await contest.client.call('getMyWallet')).availablePoints,250);
  await assert.rejects(contest.client.call('submitCompetitionAward',compBody,{},key()),rejects('NO_ENTITLEMENT_CHANGE'));
  r=await contest.client.call('submitCompetitionAward',{...compBody,level:'PROVINCE'},{},key());assert.equal(r.targets[contest.id],1000);await dual(r);assert.equal((await contest.client.call('getMyWallet')).availablePoints,1000);
  r=await contest.client.call('submitCompetitionAward',{...compBody,level:'NATIONAL'},{},key());await dual(r);assert.equal((await contest.client.call('getMyWallet')).availablePoints,2500);
  const entries=await rows<{delta_available:number}>(pool,"SELECT delta_available FROM ledger_entries WHERE user_id=? AND kind='EARN' ORDER BY delta_available",[contest.id]);assert.deepEqual(entries.map(e=>e.delta_available),[250,750,1500]);
 });
 await t.test('T19 withdrawal requires dual review, removes only related entitlement, no negative balance',async()=>{
  const site=prefix+'_site';await migration.execute('INSERT INTO inventory(reward_id,site_id,organization_id,on_hand) VALUES (?,?,?,10)',['R001',site,prefix]);await migration.execute("INSERT INTO role_scopes(user_id,scope_type,scope_id) VALUES (?,'PICKUP',?)",[ops.id,site]);
  let order=await contest.client.call('createOrder',{rewardId:'R001',quantity:1,expectedRewardVersion:1,pickupSiteId:site},{},key());order=await ops.client.call('markOrderReady',{expectedVersion:order.version},{orderId:order.id},key());const token=await contest.client.call('issuePickupCredential',undefined,{orderId:order.id},key());await ops.client.call('confirmPickup',{token:token.token,orderId:order.id,expectedVersion:order.version},{},key());
  const r=await contest.client.call('submitCompetitionAward',{...compBody,level:'NATIONAL',rank:-1,correction:true,description:'原证明撤回，双审撤奖'},{},key());await dual(r);const w=await contest.client.call('getMyWallet');assert.equal(w.availablePoints,0);assert.equal(w.growthMileage,0);assert.equal(w.recoveryDue,30);assert.equal((await reconcile(contest.id)).matches,true);
  await assert.rejects(contest.client.call('submitCompetitionAward',{...compBody,level:'NATIONAL',rank:-1,correction:true,description:'重复撤奖'},{},key()),rejects('NO_ENTITLEMENT_CHANGE'));
 });
 await t.test('team cap four times base and deterministic remainder, unrecognized level rejected',async()=>{
  const target=competitionTargets('SCHOOL',4,Array.from({length:7},(_,i)=>({userId:'member'+i,coefficientBasisPoints:10000})));assert.equal(Object.values(target).reduce((a,b)=>a+b,0),1000);assert.ok(Math.max(...Object.values(target))-Math.min(...Object.values(target))<=1);
  await assert.rejects(contest.client.call('submitCompetitionAward',{...compBody,level:'INTERNATIONAL'},{},key()),rejects('LEVEL_NOT_RECOGNIZED'));
 });
 const unit=prefix+'_skill',content=prefix+'_content';
 for(const [id,kind,questions,answers,badge]of [[unit,'ASSESSMENT',[{id:'q1',prompt:'可以无许可飞行吗？',options:['不可以','可以']}],[0],'TEST_WING'],[content,'CONTENT',[],[],null]] as const)await migration.execute('INSERT INTO learning_units(id,organization_id,title,kind,rule_code,points,description,requirements,questions,answer_keys,badge_code,creator_id) VALUES (?,?,?,?,?,80,?,?,?,?,?,?)',[id,prefix,'隔离学习任务',kind,id,'模拟学习说明','独立作品验收',JSON.stringify(questions),JSON.stringify(answers),badge,ops.id]);
 await t.test('server marks quiz, failed answers no points, badge only after independent technical approval',async()=>{
  const s=students[0],b={unitId:unit,artifactId:prefix+'_skill_artifact',answers:[1],evidenceFileIds:[],description:'独立技能实操说明',authorizationConfirmed:true};const failed=await s.client.call('submitLearning',b,{},key());assert.equal(failed.passed,false);assert.equal(failed.awardRequestId,null);
  const before=await s.client.call('getMyWallet');const good=await s.client.call('submitLearning',{...b,answers:[0]},{},key());assert.equal(good.score,100);assert.equal((await s.client.call('listMyBadges')).items.length,0);const r=(await mentor.client.call('listAwardRequests')).items.find(a=>a.id===good.awardRequestId)!;await decide(r);assert.equal((await s.client.call('getMyWallet')).availablePoints,before.availablePoints+80);assert.equal((await s.client.call('listMyBadges')).items[0].badgeCode,'TEST_WING');
 });
 await t.test('V3 duplicate active or revoked badge returns 409 and rolls back all award effects',async()=>{
  const s=students[0];
  for(const status of ['ACTIVE','REVOKED']){
   // Only this test's isolated badge fixture is changed, never a demo user's history.
   await migration.execute('UPDATE skill_badges SET status=? WHERE user_id=? AND badge_code=?',[status,s.id,'TEST_WING']);
   const id=prefix+'_duplicate_'+status;
   await migration.execute('INSERT INTO learning_units(id,organization_id,title,kind,rule_code,points,description,requirements,questions,answer_keys,badge_code,creator_id) VALUES (?,?,?,?,?,80,?,?,?,?,?,?)',[id,prefix,'重复翼章隔离考核','ASSESSMENT',id,'仅验证原唯一约束的友好错误','独立验收','[]','[]','TEST_WING',ops.id]);
   const attempt=await s.client.call('submitLearning',{unitId:id,artifactId:id,answers:[],evidenceFileIds:[],description:'测试重复历史翼章，不改变重复发章规则',authorizationConfirmed:true},{},key());
   const request=(await mentor.client.call('listAwardRequests',undefined,{limit:100})).items.find(a=>a.id===attempt.awardRequestId)!;
   const before=await s.client.call('getMyWallet'),badges=await s.client.call('listMyBadges');
   await assert.rejects(decide(request),(e:unknown)=>e instanceof ApiError&&e.status===409&&e.problem.code==='BADGE_ALREADY_RECORDED');
   assert.deepEqual(await s.client.call('getMyWallet'),before);assert.deepEqual(await s.client.call('listMyBadges'),badges);
   assert.equal((await rows(pool,'SELECT * FROM ledger_entries WHERE source_id=?',[id])).length,0);
   assert.equal((await rows(pool,'SELECT * FROM award_decisions WHERE request_id=?',[request.id])).length,0);
   assert.equal((await mentor.client.call('listAwardRequests',undefined,{limit:100})).items.find(a=>a.id===request.id)?.status,'PENDING');
  }
 });
 await t.test('T20 cross-category same artifact and missing content authorization fail, privacy scopes apply',async()=>{
  await assert.rejects(students[0].client.call('submitLearning',{unitId:content,artifactId:prefix+'_project_artifact',answers:[],evidenceFileIds:[],description:'重复项目成品',authorizationConfirmed:true},{},key()),rejects('ARTIFACT_CATEGORY_CONFLICT'));
  await assert.rejects(students[0].client.call('submitLearning',{unitId:content,artifactId:prefix+'_new_content',answers:[],evidenceFileIds:[],description:'尚无授权',authorizationConfirmed:false},{},key()),rejects('AUTHORIZATION_REQUIRED'));
  await assert.rejects(contest.client.call('getProject',undefined,{projectId:project.id}),rejects('NOT_FOUND'));
  const outsider=await fixture('unassigned',['MENTOR']);await migration.execute("DELETE FROM role_scopes WHERE user_id=? AND scope_type='PROJECT'",[outsider.id]);await assert.rejects(outsider.client.call('getProject',undefined,{projectId:project.id}),rejects('SCOPE_FORBIDDEN'));
 });
});
