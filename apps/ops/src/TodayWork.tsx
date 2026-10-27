import React,{useEffect,useRef,useState} from 'react';
import {Alert,Button,Empty,Input,Select,Skeleton,Table,Tag} from 'antd';
import {NavLink,useSearchParams,useLocation} from 'react-router-dom';
import {ApiError} from '@ymm/sdk';
import {type FlowProps} from './flow-command';
import {workSources,type WorkItem} from './work-items';
import {visibleModule,workDomains} from './work-domains';
import {sections} from './WorkspaceNavigation';
export default function TodayWork(props:FlowProps){
 const location=useLocation();
 const [params,setParams]=useSearchParams();const query=params.get('q')||'',kind=params.get('kind')||'全部';const setQuery=(q:string)=>setParams(p=>{p.delete('page');if(q)p.set('q',q);else p.delete('q');return p;},{replace:true});const setKind=(kind:string)=>setParams(p=>{p.delete('page');if(kind==='全部')p.delete('kind');else p.set('kind',kind);return p;},{replace:true});
 const [items,setItems]=useState<WorkItem[]>([]),[loading,setLoading]=useState(true),[issues,setIssues]=useState<string[]>([]),[readAt,setReadAt]=useState('');const sequence=useRef(0);
 async function refresh(){const seq=++sequence.current;setLoading(true);setItems([]);setIssues([]);setReadAt('');const sources=workSources(props);const results=await Promise.allSettled(sources.map(s=>s.read()));if(sequence.current!==seq)return;const rows:WorkItem[]=[],errors:string[]=[];let expired=false;results.forEach((r,i)=>{if(r.status==='fulfilled')rows.push(...r.value);else if(r.reason instanceof ApiError&&r.reason.status===401)expired=true;else errors.push(sources[i].name+(r.reason instanceof ApiError&&r.reason.status===403?'：当前范围未开放':'：读取失败，请重试'));});if(expired){setLoading(false);props.onExpired();return;}setItems(rows);setIssues(errors);setReadAt(new Date().toLocaleTimeString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}));setLoading(false);}
 useEffect(()=>{void refresh();return()=>{sequence.current++;};},[props.user.id,props.user.roles.join(',')]);
 const filtered=items.filter(r=>(kind==='全部'||r.type===kind)&&`${r.title} ${r.id} ${r.person} ${r.type}`.toLowerCase().includes(query.trim().toLowerCase()));
 const quick=props.user.roles.includes('REWARD_OPERATOR')?['/orders/','/pickup/','/inventory/']:props.user.roles.includes('AUDITOR')?['/reports/','/reporting/','/appeals/']:props.user.roles.includes('SYSTEM_ADMIN')?['/runtime/','/access/','/settings/']:props.user.roles.includes('MENTOR')?['/activities/','/learning/','/projects/']:['/approvals/','/activities/','/orders/','/reporting/'];
 return <><section className="v3-work-intro"><div><p className="eyebrow">TODAY / 先处理需要你的事</p><h2>{props.user.displayName}，今天从这里开始</h2><p>待办按当前角色和已授权记录整理，进入详情核对后再作出决定。</p></div><Button loading={loading} onClick={()=>void refresh()}>刷新今日工作</Button></section>
 <div className="v3-work-shortcuts">{quick.filter(p=>visibleModule(p,props.user)).map(p=><NavLink key={p} to={p}>{sections.find(s=>s.path===p)?.label}<span aria-hidden>↗</span></NavLink>)}</div>
 <section className="panel v3-work-list"><div className="section-heading"><div><h2>我的待办 <span className="v3-count">{loading?'—':items.length}</span></h2><p>{loading?'正在核对最新记录…':`北京时间 ${readAt} 更新${issues.length?' · 部分来源不可用，数量不完整':''}`}</p></div><Tag>保留独立审核与回避</Tag></div>{issues.length>0&&<Alert type="warning" showIcon message="部分待办尚未读取" description={issues.join('；')} action={<Button onClick={()=>void refresh()}>重试</Button>}/>}
 <div className="flow-filters"><Input aria-label="搜索我的待办" placeholder="搜索学生编号、内容或业务编号" value={query} allowClear onChange={e=>setQuery(e.target.value)}/><Select aria-label="待办类型" value={kind} onChange={setKind} options={['全部',...new Set(items.map(i=>i.type))].map(value=>({value,label:value}))}/></div>
 {loading?<Skeleton active title paragraph={{rows:5}}/>:<Table<WorkItem> rowKey={r=>r.type+':'+r.id} dataSource={filtered} scroll={{x:880}} pagination={{current:Math.max(1,Number(params.get('page'))||1),onChange:page=>setParams(p=>{p.set('page',String(page));return p;},{replace:true}),pageSize:8,showSizeChanger:false,hideOnSinglePage:true}} locale={{emptyText:<Empty description={issues.length?'已读取来源中暂无匹配事项；请重试不可用来源':query||kind!=='全部'?'没有匹配待办，请调整筛选':'当前角色暂无待处理事项'}/>}} columns={[
 {title:'类型 / 状态',width:150,render:(_,r)=><><strong>{r.type}</strong><div><Tag color={r.state==='待领取'?'green':'blue'}>{r.state}</Tag></div></>},
 {title:'学生 / 对象',dataIndex:'person',width:155},
 {title:'内容',width:260,render:(_,r)=><><p className="v3-work-title">{r.title}</p><small className="flow-id">{r.id}</small></>},
 {title:'当前步骤',dataIndex:'step',width:180},
 {title:'时间 / 时限',width:145,render:(_,r)=>r.time?new Date(r.time).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}):'未提供'},
 {title:'操作',width:115,render:(_,r)=><NavLink aria-label={'处理待办'+r.id} to={r.path} state={{returnTo:location.pathname+location.search}}>查看并处理 →</NavLink>}
 ]}/>}<p className="muted">已排除记录中可识别的本人申请。自然人别名、创建者及利益关系由服务端最终核验；不可处理时请交由其他独立职员。</p></section>
 <section className="v3-domain-index"><h2>按工作域查找历史与设置</h2><div>{workDomains.slice(1).map(g=>{const links=sections.filter(s=>g.paths.includes(s.path)&&visibleModule(s.path,props.user));return links.length?<details key={g.name}><summary>{g.name}<span>{links.length} 个入口</span></summary><nav aria-label={g.name+'入口'}>{links.map(s=><NavLink key={s.path} to={s.path}>{s.label} →</NavLink>)}</nav></details>:null;})}</div></section></>;
}
