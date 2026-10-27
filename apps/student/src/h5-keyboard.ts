// Browser-only accessibility adapter; shared screens and the WeChat build stay on Taro.
export function installH5Keyboard(){
 if(process.env.TARO_ENV!=='h5')return()=>{};
 let dialog:HTMLElement|null=null,previous:HTMLElement|null=null,focusAttempts=0;
 const disabled=(element:HTMLElement)=>element.hasAttribute('disabled')&&element.getAttribute('disabled')!=='false';
 const buttons=(root:ParentNode)=>Array.from(root.querySelectorAll<HTMLElement>('taro-button-core')).filter(e=>!disabled(e));
 function focusDialog(){if(!dialog||dialog.contains(document.activeElement))return;buttons(dialog)[0]?.focus();if(!dialog.contains(document.activeElement)&&focusAttempts++<20)requestAnimationFrame(focusDialog);}
 function update(){
  document.querySelectorAll<HTMLElement>('taro-button-core').forEach(element=>{element.tabIndex=disabled(element)?-1:0;element.setAttribute('role','button');element.setAttribute('aria-disabled',String(disabled(element)));});
  document.querySelectorAll<HTMLElement>('.title,.section-title').forEach(element=>{element.setAttribute('role','heading');element.setAttribute('aria-level',element.classList.contains('title')?'1':'2');});
  document.querySelectorAll<HTMLElement>('taro-image-core').forEach(element=>{const img=element.querySelector('img');if(img)img.alt='';if(element.hasAttribute('aria-label'))element.setAttribute('role','img');});
  const next=document.querySelector<HTMLElement>('.selection-dialog');
  if(next&&!dialog){previous=document.activeElement instanceof HTMLElement?document.activeElement:null;dialog=next;focusAttempts=0;requestAnimationFrame(focusDialog);}
  else if(!next&&dialog){dialog=null;if(previous?.isConnected)previous.focus();previous=null;}
 }
 function key(event:KeyboardEvent){
  const active=document.activeElement;if(!(active instanceof HTMLElement))return;
  if(dialog&&event.key==='Escape'){event.preventDefault();dialog.querySelector<HTMLElement>('.text-button')?.click();return;}
  if(dialog&&event.key==='Tab'){const options=buttons(dialog),first=options[0],last=options[options.length-1];if(event.shiftKey&&active===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&active===last){event.preventDefault();first?.focus();}return;}
  if(active.tagName==='TARO-BUTTON-CORE'&&!disabled(active)&&['Enter',' '].includes(event.key)){event.preventDefault();if(!event.repeat)active.click();}
 }
 const observer=new MutationObserver(update);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});document.addEventListener('keydown',key);update();
 return()=>{observer.disconnect();document.removeEventListener('keydown',key);};
}
