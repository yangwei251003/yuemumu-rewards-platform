import PrivateEvidence from './PrivateEvidence';
import {useRecordLink} from './use-record-link';
import {NavLink,useLocation} from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import {Alert, Button, Drawer, Empty, Input, Select, Table, Tag} from 'antd';
import type {Schemas} from '@ymm/sdk';
import {allPages, approvalStatus, hasRole, useFlowCommand, type FlowProps} from './flow-command';
type Approval = Schemas['Approval'];
export default function FlowApprovals(props: FlowProps) {
 const location=useLocation();
 const {client, user} = props; const command = useFlowCommand(props);
 const authorized = hasRole(user, ['REVIEWER', 'OPS_MANAGER']);
 const [items, setItems] = useState<Approval[]>([]);
 const [dossier,setDossier]=useState<Schemas['ApprovalDetail']|null>(null); const [dossierLoading,setDossierLoading]=useState(false); const [reloadDetail,setReloadDetail]=useState(0);
 const [loading, setLoading] = useState(false); const [selected, setSelected] = useState<Approval | null>(null);
 const [search, setSearch] = useState(''); const [status, setStatus] = useState('all');

 useRecordLink(items,setSelected);
 const [reason, setReason] = useState(''); const [decision, setDecision] = useState<Schemas['DecisionRequest']['decision']>('APPROVE');
 async function refresh() {
  if (!authorized) return; setLoading(true); command.setError('');
  try {const approvals=await allPages<Approval>(params => client.call('listApprovals', undefined, params));
   if (!command.alive.current) return; setItems(approvals);setReloadDetail(n=>n+1); setSelected(previous => previous ? approvals.find(a => a.id === previous.id) ?? null : null);
  } catch (e) {command.handleError(e);} finally {if (command.alive.current) setLoading(false);}
 }
 useEffect(() => {void refresh();}, [user.id, authorized]);
 useEffect(()=>{let live=true;setDossier(null);if(!selected)return;setDossierLoading(true);client.call('getApprovalDetail',undefined,{approvalId:selected.id}).then(detail=>{if(live){setDossier(detail);}}).catch(e=>{if(live)command.handleError(e);}).finally(()=>{if(live)setDossierLoading(false);});return()=>{live=false;};},[selected?.id,selected?.version,reloadDetail]);
 async function decide() {
  if (!selected || dossier?.approval.id!==selected.id || !dossier?.decisionOptions.find(o=>o.decision===decision)?.enabled) return;
  const body: Schemas['DecisionRequest'] = {decision, reason: reason.trim(), expectedVersion: dossier.approval.version}; const params = {approvalId: selected.id};
  const result = await command.submit({operation: 'decideApproval', body, params}, options => client.call('decideApproval', body, params, options));
  if (result) {setSelected(result); setReason(''); command.setNotice(result.status === 'APPROVED' ? '服务端确认审批通过，积分已按统一账本规则入账。' : `审批结果已保存：${approvalStatus[result.status]}。`); await refresh();}
 }
 const currentApproval=dossier&&dossier.approval.id===selected?.id?dossier.approval:null;
 const evidence=dossier&&dossier.approval.id===selected?.id?dossier.evidenceRevision:null;
 const filtered = items.filter(a => (status === 'all' || a.status === status) && `${a.id} ${a.applicantId} ${a.sourceId}`.toLowerCase().includes(search.toLowerCase().trim()));
 if (!authorized) return <section className="panel"><Alert type="info" showIcon message="当前身份没有积分审批权限" description="请使用已获审核权限的职员账号。教员可在活动页完成事实签认。"/></section>;
 return <>
  {command.error && <Alert type="error" showIcon message={command.error} action={<Button disabled={loading || command.busy} onClick={() => void refresh()}>刷新审批</Button>}/>}{command.notice && <Alert type="success" showIcon message={command.notice}/>}
  <section className="panel flow-panel"><div className="section-heading"><div><h2>独立积分审批</h2><p>拟发分、规则版本和独立人数均来自服务端；本人及活动发起人应回避。</p></div><Button loading={loading} disabled={command.busy} onClick={() => void refresh()}>刷新审批</Button></div><div className="flow-filters"><Input aria-label="搜索审批" placeholder="搜索审批编号、申请人或活动编号" value={search} allowClear onChange={e => setSearch(e.target.value)}/><Select aria-label="审批状态筛选" value={status} onChange={setStatus} options={[{value: 'all', label: '全部状态'}, ...Object.entries(approvalStatus).map(([value, label]) => ({value, label}))]}/></div>
   <Table<Approval> rowKey="id" loading={loading} dataSource={filtered} scroll={{x: 800}} pagination={{pageSize: 8, simple: true, showSizeChanger: false}} locale={{emptyText: <Empty description={command.error ? '审批未能读取，请重试' : '暂无匹配审批'}/>}} columns={[
    {title: '申请人 / 活动', key: 'person', width: 270, render: (_: unknown, a) => <div><strong>{a.applicantId}</strong><small className="flow-id">{a.sourceId}</small></div>},
    {title: '审批状态', dataIndex: 'status', width: 140, render: (value: Approval['status']) => <Tag color={value === 'APPROVED' ? 'green' : 'default'}>{approvalStatus[value]}</Tag>},
    {title: '服务端拟发分', dataIndex: 'proposedPoints', width: 130, render: (value: number) => `${value} 木能量`},
    {title: '独立审核人数', key: 'approvers', width: 130, render: (_: unknown, a) => `${a.completedApprovers} / ${a.requiredDistinctApprovers}`},
    {title: '事实签认', dataIndex: 'factVerified', width: 110, render: (value: boolean) => <Tag color={value ? 'green' : 'orange'}>{value ? '已签认' : '未签认'}</Tag>},
    {title: '操作', key: 'open', width: 110, render: (_: unknown, a) => <Button type="link" aria-label={`审查审批${a.id}`} onClick={() => {setSelected(a); setReason(''); setDecision('APPROVE'); command.setError(''); command.setNotice('');}}>审查详情</Button>},
   ]}/>
  </section>
  <Drawer title="审批证据与决定" open={selected !== null} width={720} maskClosable={!command.busy} closable={!command.busy} onClose={() => setSelected(null)}>
   {command.error && <Alert type="error" showIcon message={command.error} action={<Button disabled={loading || command.busy} onClick={() => void refresh()}>刷新记录</Button>}/>}{command.notice && <Alert type="success" showIcon message={command.notice}/>}
   {selected && <><Tag color="blue">{approvalStatus[(currentApproval??selected).status]}</Tag><h2 className="flow-detail-title">{dossier?.applicantName??selected.applicantId} 的活动成果</h2><dl className="detail-facts"><dt>审批编号</dt><dd>{selected.id}</dd><dt>活动编号</dt><dd>{selected.sourceId}</dd><dt>拟发木能量</dt><dd>{selected.proposedPoints}（服务端计算）</dd><dt>规则版本</dt><dd>{selected.ruleVersion}</dd><dt>独立审批人数</dt><dd>{(currentApproval??selected).completedApprovers} / {(currentApproval??selected).requiredDistinctApprovers} 位自然人</dd><dt>现场事实</dt><dd>{(currentApproval??selected).factVerified ? '已由现场人员签认' : '尚未签认，不能批准发分'}</dd><dt>审批版本</dt><dd>{(currentApproval??selected).version}</dd></dl>
    {dossierLoading&&<p role="status">正在读取本轮案卷…</p>}
    {dossier&&<><section className="flow-section case-summary"><span className="eyebrow">CASE FILE / 第 {dossier.round} 轮</span><h3>{dossier.activityTitle}</h3><p className="preserve-text">{dossier.completionRequirements}</p><p>事实签认：{dossier.factVerifier?.name??'尚未签认'} · {(currentApproval??selected).factVerified?'待独立核对证据后决定':'批准前须由现场人员签认'}</p><NavLink state={location.state} to={'/activities/?activityId='+encodeURIComponent(selected.sourceId)+'&submissionId='+encodeURIComponent(dossier.submissionId)}>查看对应成果与事实签认 →</NavLink></section>
    <section className="flow-section"><h3>第 {dossier.round} 轮提交材料</h3>{evidence?<><p className="muted">成果编号：{dossier.artifactId} · 本轮材料快照</p><div className="evidence-text preserve-text">{evidence.description}</div><PrivateEvidence key={selected.id} {...props} ids={evidence.evidenceFileIds}/></>:<Alert showIcon type="warning" message="本轮材料尚未取得，请刷新案卷后决定"/>}</section>
    <section className="flow-section"><h3>本轮前序决定</h3>{dossier.decisions.length?dossier.decisions.map((d,i)=><article className="case-decision" key={i}><strong>{d.actorName}</strong><Tag>{({APPROVE:'批准',REJECT:'拒绝',REQUEST_CHANGES:'要求补充'})[d.decision]}</Tag><time>{new Date(d.createdAt).toLocaleString('zh-CN')}</time><p className="preserve-text">{d.reason}</p></article>):<p>本轮尚无决定。补证会重新开始独立审核，旧轮决定与材料保持可追溯。</p>}</section>
    <section className="flow-section"><h3>你的可操作项</h3>{dossier.decisionOptions.map(o=><p key={o.decision}><Tag color={o.enabled?'green':'default'}>{({APPROVE:'批准',REJECT:'拒绝',REQUEST_CHANGES:'要求补充'})[o.decision]}</Tag>{o.enabled?'可选择，提交时服务端再次核验':o.reason}</p>)}</section></>}
    {['PENDING', 'PARTIAL_APPROVAL'].includes((currentApproval??selected).status) ? <section className="flow-section"><label htmlFor="approval-decision" className="field-label">审批决定</label><Select id="approval-decision" value={decision} disabled={command.busy||dossierLoading} onChange={setDecision} style={{width: '100%'}} options={dossier?.decisionOptions.map(o=>({value:o.decision,label:({APPROVE:'批准',REJECT:'拒绝',REQUEST_CHANGES:'要求补充'})[o.decision],disabled:!o.enabled}))??[]}/>{decision === 'REQUEST_CHANGES' && <Alert type="warning" showIcon message="要求补充将结束本次审批" description="学生可补充材料发起新一轮，原材料与意见保留，新一轮重新事实签认。"/>}<label htmlFor="approval-reason" className="field-label">审批理由</label><Input.TextArea id="approval-reason" value={reason} disabled={command.busy} onChange={e => setReason(e.target.value)} rows={4} maxLength={2000} placeholder="说明证据核对结果和决定依据"/><Button type="primary" loading={command.busy} disabled={loading || dossierLoading || !evidence || !reason.trim() || !dossier?.decisionOptions.find(o=>o.decision===decision)?.enabled} onClick={() => void decide()}>提交审批决定</Button>{decision === 'APPROVE' && !(currentApproval??selected).factVerified && <p className="muted">请先由现场教员完成事实签认，再刷新本记录。</p>}</section> : <Alert showIcon type="info" message="此审批已结束或已满足审批人数，不能重复提交决定"/>}
   </>}
  </Drawer>
 </>;
}
