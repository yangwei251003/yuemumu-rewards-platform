import Taro from '@tarojs/taro';
import type {Schemas} from '@ymm/sdk';
type Upload=Schemas['FileUploadRequest'];
const mime=(name:string):Upload['mimeType']=>{const ext=name.toLowerCase().split('.').pop();if(ext==='png')return'image/png';if(ext==='jpg'||ext==='jpeg')return'image/jpeg';if(ext==='txt')return'text/plain';throw new Error('请选择 PNG、JPEG 或 TXT 文件。');};
const validate=(name:string,size:number)=>{if(!size||size>524288)throw new Error('文件须为1字节至512KiB。');if(name.length>120)throw new Error('文件名最多120字，请先改名。');return mime(name);};
export async function chooseEvidence():Promise<Upload|null>{
 if(process.env.TARO_ENV==='h5')return new Promise((resolve,reject)=>{const input=document.createElement('input');input.type='file';input.accept='.png,.jpg,.jpeg,.txt';input.setAttribute('aria-label','选择模拟证据文件');const clear=()=>input.remove();input.addEventListener('cancel',()=>{clear();resolve(null);},{once:true});input.addEventListener('change',()=>{const file=input.files?.[0];if(!file){clear();resolve(null);return;}try{const mimeType=validate(file.name,file.size),reader=new FileReader();reader.onerror=()=>{clear();reject(new Error('文件读取失败，请重新选择。'));};reader.onload=()=>{clear();resolve({filename:file.name,mimeType,base64Data:String(reader.result).split(',')[1],purpose:'EVIDENCE',simulatedOnly:true});};reader.readAsDataURL(file);}catch(e){clear();reject(e);}},{once:true});input.style.display='none';document.body.appendChild(input);input.click();});
 const selected=await Taro.chooseMessageFile({count:1,type:'file',extension:['png','jpg','jpeg','txt']});const file=selected.tempFiles[0];if(!file)return null;const mimeType=validate(file.name,file.size);const data=await new Promise<string>((resolve,reject)=>Taro.getFileSystemManager().readFile({filePath:file.path,encoding:'base64',success:r=>typeof r.data==='string'?resolve(r.data):reject(new Error('文件读取失败。')),fail:()=>reject(new Error('文件读取失败。'))}));return {filename:file.name,mimeType,base64Data:data,purpose:'EVIDENCE',simulatedOnly:true};
}
export type MemoryPreview={source:string;text:string;close:()=>void};
export function evidencePreview(content:Schemas['FileContent']):MemoryPreview{
 const bytes=new Uint8Array(Taro.base64ToArrayBuffer(content.base64Data));
 if(content.file.mimeType==='text/plain'){const text=decodeURIComponent(Array.from(bytes,b=>'%'+b.toString(16).padStart(2,'0')).join(''));return {source:'',text,close:()=>{}};}
 if(process.env.TARO_ENV==='h5'){const source=URL.createObjectURL(new Blob([bytes],{type:content.file.mimeType}));return{source,text:'',close:()=>URL.revokeObjectURL(source)};}
 return{source:'',text:'本小程序构建暂不提供私有图片预览，请在H5内授权查看。',close:()=>{}};
}
export function downloadEvidence(content:Schemas['FileContent']){
 if(process.env.TARO_ENV!=='h5')throw new Error('请在H5内授权下载。');
 const bytes=new Uint8Array(Taro.base64ToArrayBuffer(content.base64Data)),url=URL.createObjectURL(new Blob([bytes],{type:content.file.mimeType})),link=document.createElement('a');link.href=url;link.download=content.file.filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
