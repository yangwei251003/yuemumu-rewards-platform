import {useListScrollMemory} from '../scroll-memory';
import {useEffect,useState,type PropsWithChildren} from 'react';
import Taro,{useDidShow,useDidHide} from '@tarojs/taro';
import {Button,Input,Text,View,Image} from '@tarojs/components';
import {BrandHeader,BrandFooter} from './Brand';
import Picker from './Choice';
import {scenes} from '../assets/v3';
import {navigate,goBack,registerVisiblePage,useStudentSession,usePageCommand,type Section} from '../session';
import {installH5Keyboard} from '../h5-keyboard';

const tabs=[['发现','◈'],['我的实践','↗'],['奖励','◇'],['我的','○']] as const;
function Login(){
 const session=useStudentSession(),[identity,setIdentity]=useState(0),[code,setCode]=useState('');
 const identities=[...Array.from({length:15},(_,i)=>'模拟学生'+String(i+1).padStart(2,'0')),'模拟访客 · 木小新'];
 return <><View className='field-login'><Text className='eyebrow'>YUEMUMU / FIELD NOTES</Text><Text className='title'>热爱，落到实处。</Text><Text className='description'>从第一次装调，到一次认真完成的飞行实践。{ '\n'}你的下一步，从这里开始。</Text><Image src={scenes.engineering} mode='aspectFill' className='login-hero-image' aria-label='装调工作台，AI场景示意'/><Text className='image-credit'>AI 场景示意</Text></View><View className='panel login'><Text className='section-title'>进入学生演示</Text><Text className='label'>模拟身份</Text><Picker mode='selector' range={identities} value={identity} disabled={session.loading?true:undefined} onChange={e=>setIdentity(Number(e.detail.value))}><View className='input picker'>{identities[identity]}<Text>⌄</Text></View></Picker><Text className='label'>演示访问口令</Text><Input className='input' password value={code} onInput={e=>setCode(e.detail.value)} placeholder='输入本机生成的演示口令'/><Button className='primary' loading={session.loading} disabled={session.loading||!code.trim()?true:undefined} onClick={()=>{const value=code;setCode('');void session.login(identity,value);}}>进入我的成长空间</Button>{session.logoutPending&&<Button className='secondary-button' disabled={session.loading?true:undefined} onClick={()=>void session.logout()}>重试退出服务器会话</Button>}<Text className='hint'>虚构身份 · 本地演示。口令不保存在设备中。</Text></View></>;
}
export default function StudentShell({section,children,detail=false}:PropsWithChildren<{section:Section;detail?:boolean}>){
 const session=useStudentSession(),account=usePageCommand(),[visible,setVisible]=useState(true);useListScrollMemory(section,visible);
 useEffect(()=>visible?installH5Keyboard():undefined,[visible]);
 useEffect(()=>visible?registerVisiblePage(setVisible):undefined,[visible]);
 useDidShow(()=>{setVisible(true);void Taro.setNavigationBarTitle({title:section==='发现'?'粤木木 · 飞行实践':section});});
 useDidHide(()=>setVisible(false));
 if(!visible)return <View/>;
 const selected=['发现','我的实践','奖励','我的'].includes(section)?section:['订单','预约与专项','质量退货','奖励心愿'].includes(section)?'奖励':['活动','技能','项目'].includes(section)?'我的实践':'我的';
 return <View className={'page field-guide '+(!session.user?'is-login':'')}>
  <View className='notice'>模拟数据 / 内部演示 · 制度待教员批准</View><BrandHeader/>
  {(session.error||account.error)&&<View className='error' role='alert'><Text>{session.error||account.error}</Text></View>}
  {session.loading&&<View className='loading' role='status'>正在读取当前身份…</View>}
  {!session.user?<Login/>:<>
   <View className='identity'><Text>你好，{session.user.displayName}</Text>{detail&&<Button className='text-button' disabled={account.busy?true:undefined} onClick={()=>account.run(session.refresh)}>刷新记录</Button>}<Button className='icon-button' aria-label='查看通知与申诉' onClick={()=>void navigate('通知与申诉')}>◌</Button></View>
   {detail&&<View className='subpage-nav'><Button className='text-button' onClick={()=>void goBack()}>← 返回</Button><Text>{section}</Text></View>}
   <View className='page-content'>{children}</View>
   <View className='bottom-nav'>{tabs.map(([label,icon])=><Button className={'nav-item '+(selected===label?'active':'')} key={label} aria-label={label} aria-current={selected===label?'page':undefined} onClick={()=>void navigate(label)}><Text className='field-nav-symbol'>{icon}</Text><Text>{label}</Text></Button>)}</View>
  </>}
  <BrandFooter/>
 </View>;
}
