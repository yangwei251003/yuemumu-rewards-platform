import React,{useEffect,useRef,useState} from 'react';
import {Alert,Button,Form,Input,Select} from 'antd';
import type {Schemas} from '@ymm/sdk';
import {useRecordLink} from './use-record-link';
import {allPages,dateLabel,useFlowCommand,type FlowProps} from './flow-command';
export const commerceReaders:Schemas['User']['roles']=['OPS_MANAGER','REWARD_OPERATOR','REVIEWER','AUDITOR'];
export const commerceOperators:Schemas['User']['roles']=['OPS_MANAGER','REWARD_OPERATOR'];
export const commerceReviewers:Schemas['User']['roles']=['OPS_MANAGER','REVIEWER'];
export const commerceStatus:Record<string,string>={PENDING:'待独立审核',PARTIAL_APPROVAL:'部分通过',APPROVED:'审核通过',READY:'已备货',FULFILLED:'已实际履约',CANCELLED:'已取消',REJECTED:'已拒绝',EXPIRED:'已到期',QUARANTINED:'已实收 · 隔离待检',RESTOCKED:'质检后恢复可售',DISPOSED:'质检后退出库存',SUBMITTED:'待阅评',REVIEWED:'已阅评',PLANNED:'列入意向',DECLINED:'暂不考虑'};
export function requestStatus(r:Schemas['CommerceRequest']){return r.kind==='APPLICATION'&&r.status==='FULFILLED'?'审核归档 · 未支付现金':commerceStatus[r.status];}
export function useCommerceList<T extends {id:string;version:number}>(props:FlowProps,authorized:boolean,read:(p:Record<string,string|number>)=>Promise<{items:T[];nextCursor:string|null}>){
 const command=useFlowCommand(props),[items,setItems]=useState<T[]>([]),[loading,setLoading]=useState(false),[selected,setSelected]=useState<T|null>(null),[search,setSearch]=useState('');const sequence=useRef(0);
 async function refresh(){if(!authorized)return;const seq=++sequence.current;setLoading(true);command.setError('');try{const values=await allPages<T>(read);if(command.alive.current&&seq===sequence.current)setItems(values);}catch(e){if(command.alive.current&&seq===sequence.current){setItems([]);command.handleError(e);}}finally{if(command.alive.current&&seq===sequence.current)setLoading(false);}}
 useEffect(()=>{void refresh();return()=>{sequence.current++;};},[props.user.id,authorized]);
 const latest=selected?items.find(i=>i.id===selected.id):undefined,stale=!!selected&&(!latest||latest.version!==selected.version);
 useRecordLink(items,setSelected);
 function accept(value:T){setItems(old=>[value,...old.filter(i=>i.id!==value.id)]);setSelected(value);}
 return {command,items,loading,selected,setSelected,search,setSearch,refresh,latest,stale,accept};
}
export function VersionNotice({stale,version,disabled,reload}:{stale:boolean;version:number;disabled:boolean;reload:()=>void}){return <><p className="muted">当前编辑基线版本 {version}；刷新不会把新版本套入旧表单。</p>{stale&&<Alert type="warning" message="记录版本已变化，请重新载入后操作" action={<Button aria-label="重新载入商务记录" disabled={disabled} onClick={reload}>重新载入</Button>}/>}</>;}
export function CommerceHistory({items}:{items:Schemas['CommerceReviewRecord'][]}){return <section className="flow-section"><h3>独立审核与事实记录</h3>{items.length?items.map((r,i)=><article key={i} className="submission-card"><strong>{r.action} · {r.actorId}</strong><p className="preserve-text">{r.details}</p><small>{dateLabel(r.createdAt)}</small></article>):<p className="muted">尚无审核或履约记录。</p>}</section>;}
export function DecisionForm({prefix,busy,disabled,onSubmit}:{prefix:string;busy:boolean;disabled:boolean;onSubmit:(v:Omit<Schemas['CommerceDecision'],'expectedVersion'>)=>Promise<void>}){return <Form layout="vertical" disabled={disabled} initialValues={{decision:'APPROVE'}} onFinish={v=>void onSubmit(v)}><Form.Item label={`${prefix}决定`} name="decision" rules={[{required:true}]}><Select options={[{value:'APPROVE',label:'批准'},{value:'REJECT',label:'拒绝'}]}/></Form.Item><Form.Item label={`${prefix}理由`} name="reason" rules={[{required:true,whitespace:true}]}><Input.TextArea maxLength={2000} rows={3}/></Form.Item><Button type="primary" htmlType="submit" aria-label={`提交${prefix}`} aria-busy={busy} loading={busy} disabled={disabled}>提交{prefix}</Button></Form>;}
