import React,{useEffect,useState} from 'react';
import {Alert,Button,Empty,Input,Select,Table,Tag} from 'antd';
import type {Schemas} from '@ymm/sdk';
import {artwork} from './assets';
import {RewardImage,kindLabels} from './RewardImage';
type Reward=Schemas['Reward'];
type Props={rewards:Reward[];catalogBusy:boolean;catalogLoaded:boolean;catalogError:string;loadCatalog:()=>Promise<void>;openDetail:(id:string)=>Promise<void>};
export default function RewardsCatalog({rewards,catalogBusy,catalogLoaded,catalogError,loadCatalog,openDetail}:Props){
const[search,setSearch]=useState(''),[category,setCategory]=useState('all'),[kind,setKind]=useState('all'),[page,setPage]=useState(1);
useEffect(()=>{setPage(1);},[search,category,kind]);
 const filtered = rewards.filter(r => (category === 'all' || r.category === category) && (kind === 'all' || r.kind === kind) && `${r.id} ${r.name}`.toLowerCase().includes(search.trim().toLowerCase()));
 const categories = [...new Set(rewards.map(r => r.category))];
 return <section className="panel catalog">
  <div className="section-heading"><div><h2>奖励候选目录</h2><p>库存来自模拟库，图片为原创示意图；尚未采购。</p></div><Button onClick={() => void loadCatalog()} loading={catalogBusy}>刷新目录</Button></div>
  {catalogError && <Alert type="error" showIcon message={catalogError} action={<Button onClick={() => void loadCatalog()}>重试</Button>}/>}
  <div className="filters"><Input aria-label="搜索奖励" placeholder="搜索奖励名称或编号" value={search} allowClear onChange={e => setSearch(e.target.value)}/><Select aria-label="筛选奖励分类" value={category} onChange={setCategory} options={[{value: 'all', label: '全部分类'}, ...categories.map(c => ({value: c, label: c}))]}/><Select aria-label="筛选奖励类型" value={kind} onChange={setKind} options={[{value: 'all', label: '全部类型'}, ...Object.entries(kindLabels).map(([value, label]) => ({value, label}))]}/></div>
  <div className="result-count">{catalogLoaded ? `共 ${filtered.length} 项${search || category !== 'all' || kind !== 'all' ? '筛选结果' : '候选奖励'}` : '目录尚未加载'}</div>
  <Table<Reward> size="middle" rowKey="id" loading={catalogBusy} dataSource={filtered} pagination={{current: page, onChange: setPage, pageSize: 8, showSizeChanger: false, simple: true, hideOnSinglePage: true}} scroll={{x: 720}} locale={{emptyText: <Empty description={catalogError ? '暂时无法读取目录' : '没有匹配的奖励'} image={artwork['empty-2']}/>}} columns={[
   {title: '奖励 / 分类', dataIndex: 'name', width: 310, render: (_: string, r: Reward) => <div className="reward-cell"><RewardImage reward={r}/><div><Button type="link" className="name-link" onClick={() => void openDetail(r.id)}>{r.name}</Button><small>{r.id} · {r.category} · 示意图</small></div></div>},
   {title: '所需木能量', dataIndex: 'pointsRequired', width: 140, sorter: (a, b) => a.pointsRequired - b.pointsRequired, render: (n: number, r: Reward) => <div className="points">{n.toLocaleString()}<small>{r.pointsMode === 'THRESHOLD_ONLY' ? '资格门槛 / 不扣分' : '履行时消耗'}</small></div>},
   {title: '模拟库存', dataIndex: 'availableQuantity', width: 100, render: (n: number) => <Tag color={n > 0 ? 'green' : 'default'}>{n > 0 ? `${n} 可用` : '暂无库存'}</Tag>},
   {title: '履行方式', dataIndex: 'kind', width: 120, render: (v: Reward['kind']) => kindLabels[v]},
   {title: '操作', key: 'action', width: 70, render: (_: unknown, r: Reward) => <Button type="link" onClick={() => void openDetail(r.id)} aria-label={`查看${r.name}`}>详情</Button>},
  ]}/>
 </section>; 
}
