import {useEffect,useRef} from 'react';
import Taro,{useDidShow,useDidHide,usePageScroll,useRouter} from '@tarojs/taro';
import {isChangingPage,useStudentSession,viewMemory} from './session';

/** Focus a server-provided object once, after its authorized content is mounted. */
export function useTargetFocus(ready:boolean,selector:string){
 const focused=useRef(false);
 useEffect(()=>{if(!ready||focused.current)return;const timer=setTimeout(()=>{focused.current=true;if(process.env.TARO_ENV==='h5'){document.querySelector(selector)?.scrollIntoView({block:'start',behavior:'instant'});}else{void Taro.pageScrollTo({selector,duration:0});}},100);return()=>clearTimeout(timer);},[ready,selector]);
}

/** Only a numeric list position is retained, scoped to this in-memory identity. */
export function useListScrollMemory(section:string,visible:boolean){
 const {user}=useStudentSession(),router=useRouter(),position=useRef(0),active=useRef(true),cancel=useRef<()=>void>(()=>{});
 active.current=visible;
 const owner=useRef<HTMLElement|null>(null);
 function ownPage(){if(owner.current?.isConnected)return owner.current;owner.current=document.getElementById(router.path)||Array.from(document.querySelectorAll<HTMLElement>('.taro_page')).reverse().find(el=>el.id.split('?')[0]===router.path.split('?')[0])||null;return owner.current;}
 const name=user&&!router.params.id?user.id+':scroll:'+section:null;
 usePageScroll(e=>{if(!active.current||isChangingPage())return;position.current=e.scrollTop;if(name)viewMemory.set(name,e.scrollTop);});
 function restore(){
  cancel.current();if(!name)return;const top=Number(viewMemory.get(name)||0);if(!top)return;
  if(process.env.TARO_ENV==='h5'){
   let live=true;const start=Date.now();const attempt=()=>{if(!live)return;const page=ownPage();if(page&&page.scrollHeight-page.clientHeight>=top){page.scrollTop=top;live=false;observer.disconnect();clearTimeout(timer);}else if(Date.now()-start>10000){live=false;observer.disconnect();}};
   const observer=new MutationObserver(attempt);observer.observe(document.body,{subtree:true,childList:true});const timer=setTimeout(()=>{live=false;observer.disconnect();},10000);requestAnimationFrame(attempt);cancel.current=()=>{live=false;observer.disconnect();clearTimeout(timer);};
  }else{const timer=setTimeout(()=>{void Taro.pageScrollTo({scrollTop:top,duration:0});},300);cancel.current=()=>clearTimeout(timer);}
 }
 useDidShow(()=>{active.current=true;restore();});useDidHide(()=>{active.current=false;cancel.current();});
 useEffect(()=>{restore();if(process.env.TARO_ENV!=='h5')return()=>cancel.current();ownPage();const save=(e:Event)=>{const el=e.target;if(active.current&&!isChangingPage()&&name&&el instanceof HTMLElement&&el===ownPage()&&el.classList.contains('taro_page_show')){position.current=el.scrollTop;viewMemory.set(name,el.scrollTop);}};document.addEventListener('scroll',save,true);return()=>{document.removeEventListener('scroll',save,true);cancel.current();};},[name]);
}
