import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

// Original local vector artwork. No remote images, fonts, trademarks or people.
const catalog=JSON.parse(fs.readFileSync('data/catalog/rewards.json','utf8')).items;
const ink='#163858',blue='#155eef',orange='#e87d28';
const rect=(x,y,w,h,fill=blue,r=12)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const line=(x,y,a,b,c=ink,w=8)=>`<path d="M${x} ${y}L${a} ${b}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const drone=()=>`<g transform="translate(96 88) scale(.62)">${line(150,150,350,350,ink,24)}${line(350,150,150,350,ink,24)}${rect(213,180,74,140,ink,16)}${rect(226,213,48,75,orange,7)}${rect(230,176,40,24,blue,6)}${[[150,150],[350,150],[150,350],[350,350]].map(([x,y])=>`${circle(x,y,60,'#d3e3ff')}<ellipse cx="${x}" cy="${y}" rx="53" ry="13" transform="rotate(-30 ${x} ${y})" fill="${blue}"/>${circle(x,y,11,ink)}`).join('')}${line(247,318,247,357,ink,5)}</g>`;
const book=()=>`${rect(158,130,202,250,blue)}${rect(169,141,179,226,'#fff5df')}${rect(168,143,22,224,orange,2)}${line(215,200,313,200)}${line(215,224,294,224)}${line(215,248,309,248)}`;
const cup=(cap=true)=>`${rect(194,158,128,212,'#c8dcfc',26)}${rect(202,216,112,74,blue,2)}${cap?rect(191,138,134,32,ink,8):''}${line(222,324,288,324,'#ffffff',6)}`;
const toolsIcon=()=>`${rect(130,150,256,219,ink,20)}${rect(198,127,119,37,blue,8)}${[175,224,273,322].map((x,i)=>`${rect(x,182,18,94,'#c1d8f5',4)}${rect(x-7,265,32,71,i%2?orange:blue,7)}`).join('')}`;
const screen=()=>`${rect(124,138,269,192,ink)}${rect(139,153,239,161,'#d9e8fe',3)}${line(259,330,259,371,ink,14)}${line(210,374,308,374,ink,13)}${circle(255,231,44,blue)}<path d="M245 209L276 231L245 253Z" fill="white"/>`;
const badge=(n=1)=>`<path d="M176 302L161 397L224 373L251 399L264 316M256 313L284 399L307 370L361 387L330 290" fill="${orange}"/><path d="M256 107L361 169V291L256 350L151 291V169Z" fill="${blue}"/><path d="M256 133L339 181V278L256 326L173 278V181Z" fill="#ecf3ff"/>${Array.from({length:n},(_,i)=>line(215,195+i*20,297,195+i*20,blue,9)).join('')}`;
const documentIcon=()=>`${rect(154,118,203,280,'#fff',16)}${rect(179,152,152,14,blue,3)}${line(182,208,326,208)}${line(182,240,292,240)}${line(182,270,308,270)}${circle(302,336,33,orange)}${line(287,336,298,348,'white',6)}${line(298,348,320,322,'white',6)}`;
const camera=()=>`${rect(140,190,239,154,ink,18)}${rect(177,164,72,39,blue,8)}${circle(262,267,61,blue)}${circle(262,267,44,'#b6d4ff')}${circle(262,267,25,ink)}${circle(350,213,7,orange)}`;
const icons=[
 `${rect(139,133,174,188,'white',16)}${rect(215,211,155,166,'#ffe0ba',16)}${circle(223,224,40,blue)}${line(265,274,317,326,orange,10)}`,
 badge(1),cup(),`${rect(147,164,113,202,orange)}${rect(266,204,102,167,blue)}${circle(202,255,31,'#fff0ce')}${line(159,184,245,184,'#fff0ce')}`,
 `${book()}${line(367,154,345,360,ink,13)}`,
 `<path d="M177 365L306 365L269 262L177 365Z" fill="${ink}"/>${rect(211,118,123,218,blue,16)}${rect(222,137,101,170,'#d8e8ff',5)}`,
 book(),`<path d="M182 157V305C182 402 330 394 330 305V193" fill="none" stroke="${blue}" stroke-width="18"/>${rect(155,121,54,65,ink,9)}${rect(306,147,48,62,ink,9)}`,
 `<path d="M179 195V159C179 91 329 91 329 159V195" fill="none" stroke="${ink}" stroke-width="15"/>${rect(141,184,228,216,'#fff1d6',17)}${line(210,262,301,262,blue,13)}${line(210,292,280,292,orange,13)}`,
 screen(),`<path d="M112 249C127 94 384 94 400 249Q352 218 304 249Q256 218 208 249Q160 218 112 249Z" fill="${blue}"/>${line(256,137,256,356,ink,9)}<path d="M256 355C256 408 201 404 201 366" fill="none" stroke="${ink}" stroke-width="10"/>`,camera(),
 `<path d="M209 135L154 161L103 246L164 277L186 242V386H327V242L348 276L409 245L359 161L303 135Q256 177 209 135Z" fill="${blue}"/>${line(226,237,287,237,'#fff',9)}${line(226,260,266,260,orange,9)}`,
 cup(),`${rect(211,113,92,95,'#a9bdd2',8)}${rect(196,192,122,198,blue,18)}${rect(225,130,18,38,ink,2)}${rect(270,130,18,38,ink,2)}`,
 `<rect x="172" y="122" width="170" height="271" rx="82" fill="${ink}"/>${line(257,131,257,247,'#d4e3fa',5)}${rect(247,167,20,45,orange,7)}`,
 `${rect(170,131,172,259,blue,23)}${rect(189,151,135,212,'#e2edff',12)}${rect(229,145,21,7,ink,2)}${rect(274,145,21,7,ink,2)}<path d="M266 208L225 272H260L245 321L296 250H262Z" fill="${orange}"/>`,
 toolsIcon(),toolsIcon(),drone(),drone(),screen(),documentIcon(),camera(),documentIcon(),
 `${rect(135,169,246,181,blue,22)}${rect(153,187,91,70,'#d4e5ff',8)}${rect(269,187,91,70,'#d4e5ff',8)}${circle(183,363,22,ink)}${circle(333,363,22,ink)}${line(161,302,192,302,'#fff',9)}${line(325,302,355,302,'#fff',9)}`,
 documentIcon()
];
const specs=catalog.map((r,i)=>({id:r.id+'-main',rewardId:r.id,label:r.name,art:icons[i],type:'reward'}));
['学习实训','动手装调','安全体验','创作表达','团队项目','专项申请'].forEach((label,i)=>specs.push({id:'category-'+(i+1),label,art:[book(),toolsIcon(),drone(),camera(),screen(),documentIcon()][i],type:'category'}));
for(let n=1;n<=5;n++)specs.push({id:'growth-'+n,label:`成长徽章样式 ${n} · 非已获等级`,art:badge(n),type:'growth'});
['安全知识','模拟飞行','设备装调','基础检修','影像创作','团队协作'].forEach((label,i)=>specs.push({id:'skill-'+(i+1),label:`${label} · 技能翼章设计样式`,art:[documentIcon(),screen(),drone(),toolsIcon(),camera(),book()][i],type:'skill'}));
['还没有记录','没有匹配结果','服务暂不可用'].forEach((label,i)=>specs.push({id:'empty-'+(i+1),label,art:[book(),documentIcon(),screen()][i],type:'empty'}));
specs.push({id:'campus-flight',label:'四旋翼穿越机原创概念插画',art:drone(),type:'banner'});
const output='assets/generated';fs.mkdirSync(output,{recursive:true});
for(const app of ['student','ops'])fs.mkdirSync(`apps/${app}/src/assets`,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:512,height:512},deviceScaleFactor:1});
const entries=[];
try {for(const [i,s] of specs.entries()){
 const escaped=s.label.replaceAll('&','&amp;').replaceAll('<','&lt;');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>${escaped} · 示意图</title>${rect(0,0,512,512,i%3===0?'#eaf1ff':i%3===1?'#f4f0e6':'#edf4f4',0)}<path d="M0 423L512 357V512H0Z" fill="#fff" opacity=".5"/>${circle(389,114,46,'#fff')}${line(52,94,106,94,'#acc4e9',2)}${line(52,106,82,106,'#acc4e9',2)}${s.art}<text x="30" y="475" fill="${ink}" font-size="17" font-family="Microsoft YaHei,sans-serif">示意图 / ${s.type==='reward'?'模拟奖品':'原创设计'}</text><text x="435" y="475" fill="${ink}" font-size="17" font-family="sans-serif">${String(i+1).padStart(2,'0')}</text></svg>`;
 const vector=`${output}/${s.id}.svg`,png=`${output}/${s.id}.png`;fs.writeFileSync(vector,svg);
 await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);await page.screenshot({path:png});
 const bytes=fs.readFileSync(png);if(bytes.length>160*1024)throw new Error('Image exceeds budget: '+s.id);
 for(const app of ['student','ops'])fs.copyFileSync(png,`apps/${app}/src/assets/${s.id}.png`);
 entries.push({assetId:s.id,...(s.rewardId?{rewardId:s.rewardId}:{}),path:png,vectorPath:vector,sourceUrl:null,owner:'本项目原创矢量设计（Codex 辅助制作）',license:'项目内演示使用；无第三方素材',useScope:'local_demo_only',retrievedAt:new Date().toISOString(),sha256:createHash('sha256').update(bytes).digest('hex'),vectorSha256:createHash('sha256').update(svg).digest('hex'),aiGenerated:true,generationMethod:'original SVG code + Chromium PNG rasterization',demoOnly:true,reviewStatus:'TECHNICAL_CHECKED_VISUAL_REVIEW_PENDING',alt:escaped+'（示意图／模拟用途）',width:512,height:512,bytes:bytes.length});
 }} finally {await browser.close();}
fs.writeFileSync('assets/asset-manifest.json',JSON.stringify({version:1,status:'DEMO_ONLY',entries},null,2)+'\n');
for(const app of ['student','ops'])fs.writeFileSync(`apps/${app}/src/assets/index.ts`,entries.map((s,i)=>`import image${i} from './${s.assetId}.png';`).join('\n')+'\nexport const artwork: Record<string, string> = {\n'+entries.map((s,i)=>`  '${s.assetId}': image${i},`).join('\n')+'\n};\n');
console.log(`Created ${entries.length} original SVG/PNG assets; all <=160KB. Both clients use identical PNGs.`);
