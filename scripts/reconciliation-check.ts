import {pool} from '../packages/db/src/client';
import {checkReconciliationPage} from '../packages/domain/src/reconciliation-alerts';

// Uses the existing local-demo config guard and application DB credentials. Never
// reads the migration/root secret or changes a balance. Default is one bounded page.
async function main(){
 const flags=process.argv.slice(2),options:{cursor?:string;limit?:number;organizationId?:string}={};
 for(let i=0;i<flags.length;i+=2){const value=flags[i+1];if(!value||!['--cursor','--limit','--organization'].includes(flags[i]))throw new Error('Usage: pnpm exec tsx scripts/reconciliation-check.ts [--cursor ID] [--limit 1..100] [--organization ID]');if(flags[i]==='--cursor')options.cursor=value;else if(flags[i]==='--organization')options.organizationId=value;else options.limit=Number(value);}
 const r=await checkReconciliationPage(options);
 console.log(JSON.stringify({at:new Date().toISOString(),status:r.mismatches?'ALERT':'PASS',checked:r.checked,mismatches:r.mismatches,nextCursor:r.nextCursor,findings:r.findings.filter(f=>!f.matches)},null,2));
 if(r.mismatches)process.exitCode=2;
}
main().catch(e=>{console.error(JSON.stringify({status:'ERROR',code:e instanceof Error?e.message:'RECONCILIATION_FAILED'}));process.exitCode=1;}).finally(()=>pool.end());
