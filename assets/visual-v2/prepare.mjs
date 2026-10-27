// Packaging only: resize/compress the selected imagegen originals and exact supplied logos.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE||'sharp');
const root=process.cwd(), folder=path.join(root,'assets/visual-v2');
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
for(const item of manifest.assets){
 const source=path.join(root,item.source);
 const output=path.join(folder,item.file);
 const pipeline=sharp(source).rotate().resize({width:item.width,withoutEnlargement:true});
 if(item.file.endsWith('.jpg'))await pipeline.jpeg({quality:82,mozjpeg:true}).toFile(output);
 else await pipeline.png({palette:false,compressionLevel:9}).toFile(output);
 const body=fs.readFileSync(output);item.sha256=crypto.createHash('sha256').update(body).digest('hex');
 item.sourceSha256=crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');item.bytes=body.length;
 const {width,height}=await sharp(output).metadata();item.dimensions={width,height};
 for(const app of ['student','ops']){const dest=path.join(root,'apps',app,'src/assets/visual-v2');fs.mkdirSync(dest,{recursive:true});fs.copyFileSync(output,path.join(dest,item.file));}
}
// Original interface icons: preserve the editable SVG and package a 72px PNG for Taro/weapp.
manifest.icons=[];
for(const file of fs.readdirSync(path.join(folder,'icons')).filter(f=>f.endsWith('.svg')).sort()){
 const source=path.join(folder,'icons',file),output=path.join(root,'apps/student/src/assets/visual-v2',file.replace('.svg','.png'));
 const body=await sharp(source).resize(72,72).png().toBuffer();
 // Recompression is unnecessary when a byte-different PNG already has identical pixels.
 if(fs.existsSync(output)){
  const existing=await sharp(output).raw().toBuffer(),rendered=await sharp(body).raw().toBuffer();
  if(!existing.equals(rendered))throw new Error('Icon pixels changed: '+file);
 }else fs.writeFileSync(output,body);
 manifest.icons.push({source:'assets/visual-v2/icons/'+file,file:'apps/student/src/assets/visual-v2/'+path.basename(output),owner:'Original project UI artwork',license:'Created for this project; no external icon library',sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),sha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'),dimensions:{width:72,height:72}});
}
fs.writeFileSync(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(manifest.assets.map(a=>`${a.file}: ${a.bytes} bytes`).join('\n'));
