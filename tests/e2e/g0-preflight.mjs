import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const gate=JSON.parse(git('show','integration/g0:coordination/gates/G0.json'));
assert.equal(gate.ready,true);assert.equal(gate.status,'PASS_LOCAL_G0');
const head=git('rev-parse','HEAD'),tag=git('rev-parse','integration/g0^{commit}');
git('merge-base','--is-ancestor',gate.baselineCommit,tag);git('merge-base','--is-ancestor',tag,head);
const raw=execFileSync('git',['show','integration/g0:packages/contracts/openapi.json']);
assert.equal(createHash('sha256').update(raw).digest('hex'),gate.contractSha256);
for(const command of gate.commands){assert.equal(command.exitCode,0);assert.ok(fs.existsSync(command.log),command.log);assert.ok(fs.statSync(command.log).size>0);}
const c=JSON.parse(fs.readFileSync('.runtime/config.json'));assert.equal(c.profile,'b');assert.equal(c.database,gate.frontendDatabaseSchema);assert.equal(c.apiPort,3101);assert.equal(c.gatewayPort,18080);
const report={at:new Date().toISOString(),gate:'G0',status:'PASS_COMMITTED_EVIDENCE',head,tag,testedSource:gate.baselineCommit,contractSha256:gate.contractSha256,commandsWithEvidence:gate.commands.length,verifiedEndpoints:gate.verifiedEndpoints,environment:{profile:c.profile,database:c.database,apiPort:c.apiPort,gatewayPort:c.gatewayPort},note:'Confirms immutable G0 evidence and B isolation; new client verification is reported separately.'};
fs.mkdirSync('tests/visual/evidence',{recursive:true});fs.writeFileSync('tests/visual/evidence/g0-preflight.json',JSON.stringify(report,null,2));console.log(`PASS committed G0, baseline ancestry, contract SHA, ${gate.commands.length} non-empty command logs and isolated B profile`);
