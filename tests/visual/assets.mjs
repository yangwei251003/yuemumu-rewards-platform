import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync('assets/asset-manifest.json','utf8'));
const rewards=manifest.entries.filter(x=>x.rewardId);
assert.equal(rewards.length,27);assert.equal(new Set(rewards.map(x=>x.rewardId)).size,27);
for(const item of manifest.entries){const bytes=fs.readFileSync(item.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.ok(bytes.length<=160*1024);assert.equal(item.demoOnly,true);assert.ok(item.alt.includes('示意图'));const svg=fs.readFileSync(item.vectorPath,'utf8');assert.ok(!/<script|foreignObject|https?:\/\/[^w]|onload=/i.test(svg));for(const app of ['student','ops'])assert.deepEqual(fs.readFileSync(`apps/${app}/src/assets/${item.assetId}.png`),bytes);}
console.log(`PASS ${manifest.entries.length} asset hashes, 27 reward coverage, size, safe SVG, alt/demo labels and identical client copies`);
