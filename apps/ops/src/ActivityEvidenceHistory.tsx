import React,{useEffect,useRef,useState} from 'react';
import {Alert,Button,Tag} from 'antd';
import type {Schemas} from '@ymm/sdk';
import {allPages,dateLabel,useFlowCommand,type FlowProps} from './flow-command';
import PrivateEvidence from './PrivateEvidence';
export default function ActivityEvidenceHistory(props:FlowProps&{submissionId:string}){
 const command=useFlowCommand(props),[items,setItems]=useState<Schemas['ActivityEvidenceRevision'][]>([]),[open,setOpen]=useState(false),[loading,setLoading]=useState(false),sequence=useRef(0);
 useEffect(()=>()=>{sequence.current++;},[props.submissionId,props.user.id]);
 async function read(){const seq=++sequence.current;setOpen(true);setLoading(true);command.setError('');try{const values=await allPages<Schemas['ActivityEvidenceRevision']>(p=>props.client.call('listActivityEvidenceRevisions',undefined,{...p,submissionId:props.submissionId}));if(command.alive.current&&seq===sequence.current)setItems(values);}catch(e){if(seq===sequence.current)command.handleError(e);}finally{if(command.alive.current&&seq===sequence.current)setLoading(false);}}
 return <section className="flow-section"><Button aria-label={`查看补证历史${props.submissionId}`} aria-busy={loading} loading={loading} disabled={loading} onClick={()=>void read()}>查看补证历史</Button>{open&&<>{command.error&&<Alert type="error" message={command.error}/>}<p>以下保留每轮说明、证据与审批编号。当前新轮需重新现场签认，不继承历史签认。</p>{items.map(v=><article className="submission-card" key={v.round}><Tag>第 {v.round} 轮</Tag><small className="flow-id">{v.approvalId} · {dateLabel(v.createdAt)}</small><p className="preserve-text">{v.description}</p><PrivateEvidence {...props} ids={v.evidenceFileIds}/></article>)}{!items.length&&!loading&&<p>暂无已保存的补证历史。</p>}<Button aria-label={`关闭补证历史${props.submissionId}`} onClick={()=>{sequence.current++;setOpen(false);setItems([]);setLoading(false);}}>关闭补证历史</Button></>}</section>;
}
