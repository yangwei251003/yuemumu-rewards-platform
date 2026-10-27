import assert from 'node:assert/strict';
import {harness} from './closure-harness.mjs';
const h=await harness('v3-badge-boundary'),id=process.env.E2E_BADGE_AWARD_ID;
assert.match(id||'',/^[a-f0-9-]{36}$/,'Pass the existing isolated demo award that collided with its historical badge.');
try{
 const s=await h.surface(390),o=await h.surface();await h.login(s,7);await h.staff(o,'DEMO_T003');
 const before=await h.wallet(s),badges=await h.read(s,'badges?limit=100');
 const requests=await h.read(o,'award-requests?limit=100'),original=requests.items.find(r=>r.id===id);assert.ok(original);assert.equal(original.applicantId,'DEMO_S007');assert.equal(original.status,'PENDING');
 await o.page.goto(h.base+'/admin/growth-approvals/?record='+id);await o.page.getByLabel('权益审核理由',{exact:true}).fill('核对已有历史翼章，验证重复颁发被阻止且不改变积分或原记录。');
 const response=h.post(o.page,'/api/v1/award-requests/'+id+'/decisions');await o.page.getByRole('button',{name:'提交权益审核',exact:true}).click();const r=await response;assert.equal(r.status(),409);assert.equal((await r.json()).code,'BADGE_ALREADY_RECORDED');await o.page.getByText('该技能翼章已有历史记录，当前版本不支持重复颁发；请核对原记录并由独立审核员处理。',{exact:false}).first().waitFor();
 assert.deepEqual(await h.wallet(s),before);assert.deepEqual(await h.read(s,'badges?limit=100'),badges);const after=(await h.read(o,'award-requests?limit=100')).items.find(r=>r.id===id);assert.equal(after.status,'PENDING');assert.equal(after.completedApprovers,original.completedApprovers);await h.shot(o.page,'honest-conflict');assert.deepEqual(h.errors,[]);h.pass('既有撤销翼章重复颁发返回可读409；审核票、钱包、成长及旧翼章均不改变');await h.finish();
}catch(e){await h.finish(e);}
