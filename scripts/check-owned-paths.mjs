import {execFileSync} from 'node:child_process';
const [owner,base]=process.argv.slice(2);if(!['A','B'].includes(owner)||!base)throw new Error('Usage: node scripts/check-owned-paths.mjs A|B <base-ref>');
execFileSync('git',['rev-parse','--verify',base],{stdio:'ignore'});
const paths=execFileSync('git',['diff','--name-only','-z',base,'HEAD'],{encoding:'utf8'}).split('\0').filter(Boolean);
const frontend=/^(apps\/(student|ops)\/|packages\/design-tokens\/|assets\/|tests\/(e2e|visual)\/|docs\/design\/|coordination\/handoffs\/B\/)/;
const rejected=paths.filter(p=>owner==='B'?!frontend.test(p):frontend.test(p));
if(rejected.length){console.error('Cross-owner changes require explicit handoff:\n'+rejected.join('\n'));process.exitCode=1;}else console.log('PASS '+owner+' changed-path ownership check');
