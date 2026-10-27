// Reproducible image processing only; no network, package installation or image API.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE||'sharp');
const source=process.argv[2];
if(!source)throw new Error('Pass the local generated image directory.');
const specs=[
 ['hero','campus-fpv','exec-446881dd-2433-4d3d-adaf-342d7e9d70d9.png','Four arms, four motors, four tri-blade propellers checked; rear-left rotor corrected before acceptance.'],
 ['engineering','safe-workbench','exec-6eedaf98-83eb-4392-b53f-265a8692d7ab.png','Four arms and four motors; all propellers removed; battery disconnected.'],
 ['project','campus-team','exec-770e61b8-fc40-4b5a-9392-de8913ea6270.png','Fictional adults, natural interaction; no complete aircraft or personal documents.'],
 ['learning','theory-desk','exec-6d1be834-31ed-47fd-a0d5-ceae307a6a46.png','Study still life; no certificate, license or qualification claim.'],
];
const records=[];
for(const [category,name,file,review] of specs){
 const bytes=await fs.readFile(path.join(source,file));
 const directory=path.join('assets/v3',category);await fs.mkdir(directory,{recursive:true});
 await fs.writeFile(path.join(directory,`${name}-source.png`),bytes);
 const appDirectory='apps/student/src/assets/v3';await fs.mkdir(appDirectory,{recursive:true});
 const output=await sharp(bytes).resize(960,640,{fit:'cover'}).jpeg({quality:79,mozjpeg:true}).toBuffer();
 await fs.writeFile(path.join(directory,`${name}.jpg`),output);
 await fs.writeFile(path.join(appDirectory,`${name}.jpg`),output);
 records.push({category,name,source:file,sourceSha256:createHash('sha256').update(bytes).digest('hex'),outputSha256:createHash('sha256').update(output).digest('hex'),width:960,height:640,bytes:output.length,review,provider:'Official built-in image generation',disclosure:'AI scene illustration, not a photo of this school or event'});
}
await fs.writeFile('assets/v3/manifest.json',JSON.stringify({version:3,records},null,2)+'\n');
console.log(records.map(r=>`${r.name}: ${r.bytes} bytes`).join('\n'));
