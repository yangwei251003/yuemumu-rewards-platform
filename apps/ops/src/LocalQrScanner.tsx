import React,{useEffect,useRef,useState} from 'react';
import {Alert,Button} from 'antd';
import jsQR from 'jsqr';

/** Camera frames and decoded credentials stay in memory; this component makes no requests. */
export default function LocalQrScanner({onRead,disabled}:{onRead:(value:string)=>void;disabled:boolean}){
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),epoch=useRef(0),frame=useRef(0),image=useRef<HTMLCanvasElement|null>(null);
 const [active,setActive]=useState(false),[starting,setStarting]=useState(false),[error,setError]=useState('');
 function stop(){epoch.current++;cancelAnimationFrame(frame.current);stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;if(video.current)video.current.srcObject=null;if(image.current){image.current.width=0;image.current.height=0;image.current=null;}setActive(false);setStarting(false);}
 useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>{epoch.current++;cancelAnimationFrame(frame.current);stream.current?.getTracks().forEach(t=>t.stop());document.removeEventListener('visibilitychange',hide);};},[]);
 useEffect(()=>{if(disabled)stop();},[disabled]);
 async function start(){if(starting||disabled)return;stop();const current=epoch.current;setStarting(true);setError('');
  try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('CAMERA_UNAVAILABLE');const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:960}},audio:false});if(current!==epoch.current){media.getTracks().forEach(t=>t.stop());return;}stream.current=media;media.getVideoTracks().forEach(t=>t.addEventListener('ended',()=>{if(current===epoch.current){stop();setError('相机已停止，请重新开启或手动输码。');}},{once:true}));setActive(true);const el=video.current;if(!el){stop();return;}el.srcObject=media;await el.play();if(current!==epoch.current)return;setStarting(false);const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('CANVAS_UNAVAILABLE');image.current=canvas;let last=0;
   const scan=(time:number)=>{if(current!==epoch.current||!ctx)return;try{if(time-last>180&&el.readyState>=2&&el.videoWidth){last=time;const scale=Math.min(1,720/el.videoWidth);canvas.width=Math.round(el.videoWidth*scale);canvas.height=Math.round(el.videoHeight*scale);ctx.drawImage(el,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);const code=jsQR(pixels.data,canvas.width,canvas.height);pixels.data.fill(0);if(code){stop();canvas.width=0;canvas.height=0;if(!code.data.trim()||code.data.length>256){setError('二维码不是有效领取码，请让学生打开订单中的当前领取码。');return;}onRead(code.data.trim());return;}}frame.current=requestAnimationFrame(scan);}catch{stop();setError('相机画面未能识别，请重新开启或手动输码。');}};frame.current=requestAnimationFrame(scan);
  }catch{if(current===epoch.current){stop();setError('相机未能开启。请检查浏览器相机权限，或使用下方手动输码；尚未提交核销。');}}
 }
 return <div className="local-scanner"><video ref={video} muted playsInline aria-label="领取码相机画面" style={{display:active?'block':'none'}}/>{error&&<Alert type="warning" showIcon message={error}/>}<Button disabled={disabled} loading={starting} onClick={()=>active||starting?stop():void start()}>{active||starting?'关闭相机':'打开相机扫码'}</Button><p>画面仅在本机识别。识别后仍需预览、核对本人并确认交付。</p></div>;
}
