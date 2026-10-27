import React from 'react';
import {NavLink,useLocation} from 'react-router-dom';
export function safeWorkReturn(state:unknown):string|null{
 if(!state||typeof state!=='object'||!('returnTo' in state)||typeof state.returnTo!=='string'||state.returnTo.length>1200)return null;
 try{const url=new URL(state.returnTo,'https://local.invalid');if(url.origin!=='https://local.invalid'||url.pathname!=='/'||url.hash||[...url.searchParams.keys()].some(k=>!['q','kind','page'].includes(k)))return null;return '/'+url.search;}catch{return null;}
}
export default function WorkReturn(){const location=useLocation(),path=safeWorkReturn(location.state);return path&&location.pathname!=='/'?<NavLink className="work-return" to={path}>← 返回我的待办（保留筛选）</NavLink>:null;}
