import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const root='evidence/v3';
const selected=[
 'closing/v3-regression-report.json','closing/keyboard-report.json','closing/v3-audit-report.json',
 ...['student','ops','navigation','flow01','flow02','evidence-revision01','reporting01','access01'].map(n=>'business/'+n+'-report.json'),
 'growth-fresh/grow01-report.json','resilience-funded/resilience01-report.json','commerce-fresh/commerce01-report.json',
 ...['gov01','membership01','conversion01','untrusted-display01'].map(n=>'extended/'+n+'-report.json'),
 'meetings-fresh/meetings01-report.json','govext-fresh/govext01-report.json','badge-conflict-fixed/v3-badge-boundary-report.json'
];
const reports=selected.map(file=>{const r=JSON.parse(fs.readFileSync(root+'/'+file,'utf8'));return {file,at:r.at,passed:r.results.filter(v=>v.status==='PASS').length,failed:r.results.filter(v=>v.status!=='PASS').length,errors:r.errors||[]};});
if(reports.some(r=>r.failed||r.errors.length))throw new Error('Selected evidence is not fully passing');
const commands=['checks-final/checks-commands.json','build-final-context/build-commands.json','closing/closing-commands.json'].flatMap(file=>JSON.parse(fs.readFileSync(root+'/'+file,'utf8')).map(r=>({...r,evidence:file})));
if(commands.some(c=>c.exitCode!==0))throw new Error('Final command failed');
const current=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const status=execFileSync('git',['status','--short'],{encoding:'utf8'});
const images=fs.readdirSync(root+'/closing').filter(n=>n.endsWith('.png'));
const apiLog=fs.readFileSync(root+'/checks-final/api-db.log','utf8');
if(!/tests 147/.test(apiLog)||!/pass 147/.test(apiLog)||!/fail 0/.test(apiLog)||!/skipped 0/.test(apiLog))throw new Error('API test summary no longer matches the receipt');
const receipt={generatedAt:new Date().toISOString(),baselineSha:'16f50543680efcced1eeaf85e55a5c58e8a393e5',headSha:current,commit:'Uncommitted V3 worktree changes; no push or deployment',contractSha256:fs.readFileSync('packages/contracts/sha256.txt','utf8').trim(),apiTests:{passed:147,failed:0,skipped:0,evidence:'checks-final/api-db.log'},browserChecks:reports.reduce((n,r)=>n+r.passed,0),browserSuites:reports.length,reports,commands,finalScreenshotCount:images.length,screenshots:images.map(n=>'closing/'+n),worktreeStatus:status,limitations:['Web local demo verified; weapp build verified; WeChat DevTools and real devices NOT verified','No production authorization, approved school policy or cloud release','Historical failed attempts retained separately and explained in docs/V3-CHANGELOG.md','Real regression tests append fictional business records; no database reset']};
fs.writeFileSync(root+'/receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({apiTests:receipt.apiTests,browserChecks:receipt.browserChecks,browserSuites:receipt.browserSuites,finalScreenshotCount:images.length},null,2));
