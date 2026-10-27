import {useEffect,useRef,useState} from 'react';
import {View,Text,Button,Textarea} from '@tarojs/components';
import type {Schemas} from '@ymm/sdk';
import {pages,useIntent,type StudentFlowProps} from './GrowthShared';
const statuses={SUBMITTED:'入社申请待审核',ACCEPTED:'入社申请已通过',REJECTED:'本次入社申请未通过'};
export default function Membership({client,user,busy,run,onChanged}:StudentFlowProps){
 const[items,setItems]=useState<Schemas['MembershipApplication'][]>([]),[statement,setStatement]=useState(''),[loaded,setLoaded]=useState(false);const live=useRef(true),intent=useIntent();
 async function load(){const values=await pages(cursor=>client.call('listMembershipApplications',undefined,{limit:100,...(cursor?{cursor}:{})}));if(live.current){setItems(values);setLoaded(true);}}
 useEffect(()=>{live.current=true;void run(load);return()=>{live.current=false;};},[]);
 async function apply(){const body={statement:statement.trim()};await run(async()=>{await client.call('applyMembership',body,{}, {idempotencyKey:intent.key(body)});intent.done(body);await load();await onChanged();});}
 return <View className='membership'><Text className='title'>入社申请</Text><Text className='description'>介绍你的兴趣与参与计划，身份由独立负责人审核。提交申请和身份通过都不会发放积分。</Text>{!loaded?<Text className='hint'>{busy?'正在读取本人申请…':'读取未完成，请刷新重试。'}</Text>:items.length?items.map(a=><View className='panel membership-card' key={a.id}><Text className='section-title'>{statuses[a.status]}</Text><Text className='description'>{a.statement}</Text><Text className='hint'>审核说明：{a.decisionReason||'等待独立审核'}</Text><Text className='hint'>申请编号 {a.id}</Text>{a.status==='REJECTED'&&<Text className='hint'>当前版本未开放重复申请，请按审核说明联系负责人。</Text>}</View>):user.membershipStatus==='VISITOR'?<View className='panel'><Textarea className='input evidence-textarea' maxlength={2000} placeholder='介绍你的入社意愿、兴趣方向和参与计划' value={statement} onInput={e=>setStatement(e.detail.value)}/><Button className='primary' disabled={busy||!statement.trim()?true:undefined} onClick={apply}>提交本人入社申请</Button></View>:<View className='panel'><Text>{user.membershipStatus==='ACTIVE'?'当前已是认证成员，无需重复申请。':user.membershipStatus==='PENDING'?'身份待审核，请刷新查看本人申请。':'当前身份需要先完成复核，请查看通知与申诉。'}</Text></View>}<Button className='secondary-button' disabled={busy?true:undefined} onClick={()=>run(async()=>{await load();await onChanged();})}>刷新入社申请与身份</Button></View>;
}
