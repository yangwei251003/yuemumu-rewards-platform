import React,{useEffect,useRef,useState} from 'react';
import {Alert,Button,Empty,Tag} from 'antd';
import type {Schemas} from '@ymm/sdk';
import {dateLabel,useFlowCommand,type FlowProps} from './flow-command';
export default function RuntimeHealth(props:FlowProps){
 const command=useFlowCommand(props),[health,setHealth]=useState<Schemas['Health']|null>(null),[loading,setLoading]=useState(false),[readAt,setReadAt]=useState('');const sequence=useRef(0);
 async function refresh(){const seq=++sequence.current;setLoading(true);setHealth(null);setReadAt('');command.setError('');try{const value=await props.client.call('getHealth');if(command.alive.current&&seq===sequence.current){setHealth(value);setReadAt(new Date().toISOString());}}catch(e){if(seq===sequence.current)command.handleError(e);}finally{if(command.alive.current&&seq===sequence.current)setLoading(false);}}
 useEffect(()=>{void refresh();return()=>{sequence.current++;};},[props.user.id]);
 return <section className="panel flow-panel"><div className="section-heading"><div><h2>运行健康</h2><p>读取当前服务公布的健康状态，失败时不沿用上次健康结论。</p></div><Button aria-label="刷新运行健康" aria-busy={loading} loading={loading} disabled={loading} onClick={()=>void refresh()}>刷新运行健康</Button></div>{command.error&&<Alert type="error" showIcon message={command.error}/>} {health?<><Tag color={health.status==='ok'?'green':'orange'} data-testid="runtime-status">{health.status}</Tag><dl className="detail-facts"><dt>运行模式</dt><dd data-testid="runtime-appMode">{health.appMode}</dd><dt>服务版本</dt><dd data-testid="runtime-version">{health.version}</dd><dt>合同SHA256</dt><dd className="flow-id" data-testid="runtime-contractSha256">{health.contractSha256}</dd><dt>数据库就绪</dt><dd data-testid="runtime-databaseReady">{health.databaseReady?'是':'否'}</dd><dt>本次读取时间</dt><dd>{dateLabel(readAt)}</dd></dl></>:<Empty description={loading?'正在读取实时健康状态':'没有可用的健康结果，请重试'}/>}<p className="muted">此结果不代表已通过正式上线验收，也不表示备份、通知工作进程或全部业务流程已完成检查。</p></section>;
}
