import {createContext,useContext,useEffect,useRef,useState,type PropsWithChildren} from 'react';
import Taro from '@tarojs/taro';
import {ApiError,StaleClientRequest,createClient,taroTransport,type Schemas} from '@ymm/sdk';
import {platform} from './platform';

export type Section='发现'|'我的实践'|'奖励'|'我的'|'成长'|'活动'|'项目'|'技能'|'账本'|'订单'|'通知与申诉'|'入社申请'|'待结算'|'隐私说明'|'预约与专项'|'质量退货'|'奖励心愿'|'转化核查'|'积分核对';
const mainRoutes:Partial<Record<Section,string>>={'发现':'/pages/index/index','成长':'/pages/index/index','我的实践':'/pages/practice/index','奖励':'/pages/rewards/index','我的':'/pages/profile/index'};
const visiblePages=new Set<(visible:boolean)=>void>();
let changingPage=false;
export function isChangingPage(){return changingPage;}
export function registerVisiblePage(setVisible:(visible:boolean)=>void){visiblePages.add(setVisible);return()=>{visiblePages.delete(setVisible);};}
async function changePage(action:()=>Promise<unknown>){if(changingPage)return;changingPage=true;const previous=[...visiblePages];previous.forEach(hide=>hide(false));try{await action();}catch{previous.forEach(show=>show(true));await Taro.showToast({title:'页面未能打开，请重试',icon:'none'});}finally{changingPage=false;}}
export function navigate(section:Section,target?:{id?:string;tab?:string|null;focus?:string|null}){
 const main=target?.id?undefined:mainRoutes[section];
 const url=main||'/pages/service/index?section='+encodeURIComponent(section)+Object.entries(target||{}).filter(([,v])=>v).map(([k,v])=>'&'+k+'='+encodeURIComponent(v!)).join('');
 return changePage(()=>main?Taro.reLaunch({url}):Taro.getCurrentPages().length>=9?Taro.redirectTo({url}):Taro.navigateTo({url}));
}
export function goBack(){return Taro.getCurrentPages().length>1?changePage(()=>Taro.navigateBack()):navigate('发现');}
export function openPractice(target:Schemas['PracticeTarget']){return navigate(target.section,{id:target.entityId,tab:target.tab,focus:target.focusId});}
const base=process.env.TARO_ENV==='weapp'?process.env.TARO_APP_API_BASE:'/api/v1';
export const studentClient=createClient(taroTransport(options=>{
 if(!base)return Promise.reject(new Error('请配置小程序 API 地址后重新构建。'));
 return Taro.request(options);
},base||'/api/v1'),'student');
export const viewMemory=new Map<string,unknown>();
export const orderIntents=new Map<string,string>();
const logoutMarker='ymm-logout-pending';
function pendingLogout(){try{return Taro.getStorageSync(logoutMarker)===true;}catch{return false;}}
function storeLogoutPending(value:boolean){try{if(value)Taro.setStorageSync(logoutMarker,true);else Taro.removeStorageSync(logoutMarker);}catch{/* Memory remains authoritative when device storage is unavailable. */}}
async function allPages<T>(read:(cursor?:string)=>Promise<{items:T[];nextCursor:string|null}>){const result:T[]=[],seen=new Set<string>();let cursor:string|undefined;do{const page=await read(cursor);result.push(...page.items);cursor=page.nextCursor||undefined;if(cursor&&seen.has(cursor))throw Error('Repeated pagination cursor');if(cursor)seen.add(cursor);}while(cursor);return result;}
export function useViewMemory<T>(key:string,initial:T){
 const session=useStudentSession(),name=session.user?.id+':'+key;
 const [value,setValue]=useState<T>(()=>viewMemory.has(name)?viewMemory.get(name) as T:initial);
 useEffect(()=>{viewMemory.set(name,value);},[name,value]);return [value,setValue] as const;
}
export function errorText(e:unknown){
 if(e instanceof ApiError)return `${e.message}${e.status===401?' 请重新登录。':e.status===409?' 请核对最新记录后重试。':''}${e.problem.requestId?' 参考号：'+e.problem.requestId:''}`;
 return e instanceof Error&&e.message.includes('小程序 API')?e.message:'连接未完成。请核对服务器记录后重试，不要重复创建同一业务。';
}
function useSessionState(){
 const [logoutPending,setLogoutPending]=useState(pendingLogout);
 const [user,setUser]=useState<Schemas['User']|null>(null),[wallet,setWallet]=useState<Schemas['Wallet']|null>(null),[rewards,setRewards]=useState<Schemas['Reward'][]>([]),[ledger,setLedger]=useState<Schemas['LedgerEntry'][]>([]),[badges,setBadges]=useState<Schemas['SkillBadge'][]>([]),[cursor,setCursor]=useState<string|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const epoch=useRef(0),sequence=useRef(0),authLock=useRef(false);
 function clear(clearClient=true){epoch.current++;sequence.current++;if(clearClient)studentClient.clear();viewMemory.clear();orderIntents.clear();setUser(null);setWallet(null);setRewards([]);setLedger([]);setBadges([]);setCursor(null);setLoading(false);}
 async function refresh(){
  const current=epoch.current,seq=++sequence.current;
  const me=await studentClient.call('getMe');
  const [w,r,l,b]=await Promise.all([studentClient.call('getMyWallet'),allPages(cursor=>studentClient.call('listRewards',undefined,{limit:100,...(cursor?{cursor}:{})})),studentClient.call('listMyLedger',undefined,{limit:20}),allPages(cursor=>studentClient.call('listMyBadges',undefined,{limit:100,...(cursor?{cursor}:{})}))]);
  if(current!==epoch.current||seq!==sequence.current)throw new StaleClientRequest();
  setUser(me);setWallet(w);setRewards(r);setLedger(l.items);setBadges(b);setCursor(l.nextCursor);
 }
 useEffect(()=>{if(logoutPending){setLoading(false);setError('本机内容已清除，服务器退出尚未确认。请重试退出或重新登录。');return;}const current=epoch.current;void studentClient.call('getSession').then(refresh).catch(e=>{if(current!==epoch.current||e instanceof StaleClientRequest)return;if(e instanceof ApiError&&e.status===401)clear();else setError(errorText(e));}).finally(()=>setLoading(false));},[]);
 async function login(identity:number,accessCode:string){
  if(authLock.current)return;authLock.current=true;clear();const current=epoch.current;setLoading(true);setError('');
  try{await studentClient.call('createDemoSession',{demoUserId:`DEMO_S${String(identity+1).padStart(3,'0')}`,audience:'student',accessCode,transport:platform.sessionTransport});storeLogoutPending(false);setLogoutPending(false);await refresh();}
  catch(e){if(current===epoch.current&&!(e instanceof StaleClientRequest))setError(errorText(e));}
  finally{authLock.current=false;setLoading(false);}
 }
 async function logout(){
  if(authLock.current)return;authLock.current=true;storeLogoutPending(true);setLogoutPending(true);clear(false);setLoading(true);setError('');let confirmed=false;
  try{await studentClient.call('getSession');await studentClient.call('logout',{audience:'student'});confirmed=true;}catch(e){if(e instanceof ApiError&&e.status===401)confirmed=true;}
  finally{clear();if(confirmed){storeLogoutPending(false);setLogoutPending(false);}else setError('本机内容已清除，服务器退出尚未确认。请重试退出或重新登录。');authLock.current=false;await navigate('发现');}
 }
 return {client:studentClient,user,wallet,rewards,ledger,badges,cursor,setLedger,setCursor,loading,error,setError,epoch,refresh,clear,login,logout,logoutPending};
}
const SessionContext=createContext<ReturnType<typeof useSessionState>|null>(null);
export function StudentSessionProvider({children}:PropsWithChildren){const state=useSessionState();return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>;}
export function useStudentSession(){const state=useContext(SessionContext);if(!state)throw Error('Student session missing');return state;}
/** Each mounted page owns its command lock; a previous hidden page cannot swallow a new page's load. */
export function usePageCommand(){
 const session=useStudentSession(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),lock=useRef(false),live=useRef(true);
 useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
 async function run(action:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setError('');const epoch=session.epoch.current;try{await action();}catch(e){if(live.current&&epoch===session.epoch.current&&!(e instanceof StaleClientRequest)){if(e instanceof ApiError&&e.status===401)session.clear();setError(errorText(e));}}finally{lock.current=false;if(live.current)setBusy(false);}}
 return {...session,busy,error,notice,setError,setNotice,run,onChanged:session.refresh};
}
