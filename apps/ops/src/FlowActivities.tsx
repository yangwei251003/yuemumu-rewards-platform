import ActivityEvidenceHistory from './ActivityEvidenceHistory';
import {NavLink,useSearchParams} from 'react-router-dom';
import PrivateEvidence from './PrivateEvidence';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, Drawer, Empty, Form, Input, InputNumber, Select, Spin, Table, Tag} from 'antd';
import type {Schemas} from '@ymm/sdk';
import {activityStatus, allPages, dateLabel, hasRole, submissionStatus, useFlowCommand, type FlowProps} from './flow-command';
type Activity = Schemas['Activity'];
type Submission = Schemas['Submission'];
type CreateValues = Schemas['ActivityCreateRequest'];
const rules: {value: CreateValues['ruleCode']; label: string}[] = [{value: 'WORKSHOP_2H', label: 'WORKSHOP_2H · 工作坊至少2小时'}, {value: 'TRAINING_4H', label: 'TRAINING_4H · 实训至少4小时'}, {value: 'CAMP_8H', label: 'CAMP_8H · 训练营至少8小时'}, {value: 'CAMP_16H', label: 'CAMP_16H · 训练营至少16小时'}];
export default function FlowActivities(props: FlowProps) {
 const [searchParams]=useSearchParams(); const requestedActivityId=searchParams.get('activityId'); const requestedSubmissionId=searchParams.get('submissionId'); const handledLink=useRef<string|null>(null);
 const {client, user} = props; const command = useFlowCommand(props);
 const canManage = hasRole(user, ['OPS_MANAGER']);
 const canSign = hasRole(user, ['MENTOR', 'OPS_MANAGER', 'STUDENT_ORGANIZER']);
 const canReadSubmissions = hasRole(user, ['MENTOR', 'REVIEWER', 'OPS_MANAGER', 'STUDENT_ORGANIZER']);
 const [items, setItems] = useState<Activity[]>([]); const [submissions, setSubmissions] = useState<Submission[]>([]);
 const [loading, setLoading] = useState(true); const [search, setSearch] = useState(''); const [selected, setSelected] = useState<Activity | null>(null);
 const [detailLoading, setDetailLoading] = useState(false); const detailSequence = useRef(0);
 const [creating, setCreating] = useState(false); const [form] = Form.useForm<CreateValues>();
 const [factReasons, setFactReasons] = useState<Record<string, string>>({});
 const [credential, setCredential] = useState<Schemas['AttendanceCode'] | null>(null);
 async function refresh() {
  setLoading(true); command.setError('');
  try {
   const [activities, evidence] = await Promise.all([allPages<Activity>(params => client.call('listActivities', undefined, params)), canReadSubmissions ? allPages<Submission>(params => client.call('listSubmissions', undefined, params)) : Promise.resolve([])]);
   if (!command.alive.current) return; setItems(activities); setSubmissions(evidence);
   setSelected(previous => previous ? activities.find(a => a.id === previous.id) ?? null : null);
  } catch (e) {command.handleError(e);} finally {if (command.alive.current) setLoading(false);}
 }
 useEffect(() => {void refresh();}, [user.id]);
 useEffect(()=>{if(!requestedActivityId){handledLink.current=null;return;}if(loading||command.error||handledLink.current===requestedActivityId)return;const target=items.find(a=>a.id===requestedActivityId);handledLink.current=requestedActivityId;if(target)void openActivity(target);else command.setError('关联活动未在当前授权列表中，请核对会议或刷新列表。');},[requestedActivityId,items,loading]);
 useEffect(() => {if (!credential) return; const timer = window.setTimeout(() => setCredential(null), Math.max(0, new Date(credential.expiresAt).getTime() - Date.now())); return () => window.clearTimeout(timer);}, [credential]);
 async function openActivity(activity: Activity) {
  const sequence = ++detailSequence.current; setSelected(activity); setCredential(null); setDetailLoading(true); command.setError('');
  try {const result = await client.call('getActivity', undefined, {activityId: activity.id}); if (command.alive.current && sequence === detailSequence.current) setSelected(result);}
  catch (e) {command.handleError(e);} finally {if (command.alive.current && sequence === detailSequence.current) setDetailLoading(false);}
 }
 async function create(values: CreateValues) {
  const body: CreateValues = {...values, title: values.title.trim(), completionRequirements: values.completionRequirements.trim(), startsAt: new Date(values.startsAt).toISOString(), endsAt: new Date(values.endsAt).toISOString()};
  const result = await command.submit({operation: 'createActivity', body}, options => client.call('createActivity', body, {}, options));
  if (result) {setCreating(false); form.resetFields(); setSelected(result); command.setNotice('活动草稿已由服务端创建，请核对后发布。'); await refresh();}
 }
 async function transition(operation: 'publishActivity' | 'completeActivity', activity: Activity) {
  const body = {expectedVersion: activity.version}; const params = {activityId: activity.id};
  const result = await command.submit({operation, body, params}, options => client.call(operation, body, params, options));
  if (result) {setSelected(result); command.setNotice(operation === 'publishActivity' ? '活动已发布，学生可以报名。' : activity.ruleCode==='MEETING'?'会议已确认结束，请从会议合并成果入口提交与审核。':'活动已确认结束，可进行事实签认。'); await refresh();}
 }
 async function issue(phase: Schemas['AttendanceCode']['phase']) {
  if (!selected) return; const body = {phase}; const params = {activityId: selected.id};
  const result = await command.submit({operation: 'issueAttendanceCode', body, params}, options => client.call('issueAttendanceCode', body, params, options));
  if (result) {setCredential(result); command.setNotice('签到码已生成。请仅向现场参与者展示，勿放入公开链接或截图。');}
 }
 async function verify(submission: Submission) {
  const body = {expectedVersion: submission.version, reason: (factReasons[submission.id] ?? '').trim()}; const params = {submissionId: submission.id};
  const result = await command.submit({operation: 'verifySubmission', body, params}, options => client.call('verifySubmission', body, params, options));
  if (result) {command.setNotice('事实签认已保存，等待独立积分审批；本操作不会直接发分。'); await refresh();}
 }
 useEffect(()=>{if(!selected||!requestedSubmissionId||loading||detailLoading)return;const timer=window.setTimeout(()=>{document.getElementById('submission-'+requestedSubmissionId)?.scrollIntoView({block:'start'});},150);return()=>clearTimeout(timer);},[selected?.id,requestedSubmissionId,loading,detailLoading]);
 const filtered = items.filter(a => `${a.title} ${a.id}`.toLowerCase().includes(search.toLowerCase().trim()));
 const evidence = selected ? submissions.filter(s => s.sourceType === 'ACTIVITY' && s.sourceId === selected.id) : [];
 return <>
  {command.error && <Alert showIcon type="error" message={command.error} action={<Button onClick={() => void refresh()} disabled={loading || command.busy}>刷新记录</Button>}/>}
  {command.notice && <Alert showIcon type="success" message={command.notice}/>}
  <section className="panel flow-panel"><div className="section-heading"><div><h2>活动与课程</h2><p>发布活动 → 起止签到 → 成果签认 → 独立审批。扫码本身不发分。</p></div><div className="flow-actions"><Button onClick={() => void refresh()} loading={loading} disabled={command.busy}>刷新活动</Button>{canManage && <Button type="primary" onClick={() => setCreating(true)}>创建活动</Button>}</div></div>
   <Input aria-label="搜索活动" placeholder="搜索活动名称或编号" value={search} onChange={e => setSearch(e.target.value)} allowClear/>
   <Table<Activity> rowKey="id" loading={loading} dataSource={filtered} scroll={{x: 780}} pagination={{pageSize: 8, showSizeChanger: false, simple: true}} locale={{emptyText: <Empty description={command.error ? '活动未能读取，请重试' : '暂无匹配活动'}/>}} columns={[
    {title: '活动', dataIndex: 'title', width: 270, render: (_: string, a) => <div><Button type="link" className="name-link" onClick={() => void openActivity(a)}>{a.title}</Button><small className="flow-id">{a.id}</small></div>},
    {title: '状态', dataIndex: 'status', width: 100, render: (s: Activity['status']) => <Tag color={s === 'PUBLISHED' ? 'blue' : s === 'COMPLETED' ? 'green' : 'default'}>{activityStatus[s]}</Tag>},
    {title: '开始时间', dataIndex: 'startsAt', width: 180, render: dateLabel},
    {title: '正式报名 / 名额', key: 'capacity', width: 130, render: (_: unknown, a) => `${a.registeredCount} / ${a.capacity}`},
    {title: '服务端预计分', dataIndex: 'pointsPreview', width: 120, render: (n: number) => `${n} 木能量`},
    {title: '操作', key: 'open', width: 90, render: (_: unknown, a) => <Button type="link" aria-label={`查看活动${a.title}`} onClick={() => void openActivity(a)}>查看活动</Button>},
   ]}/>
   <p className="muted">活动使用固定模拟规则；成果支持文字与授权私有附件。学习与技能请前往对应页面。</p>
  </section>
  <Drawer title="创建活动草稿" open={creating} width={560} maskClosable={!command.busy} closable={!command.busy} onClose={() => setCreating(false)}>
   {command.error && <Alert type="error" showIcon message={command.error}/>}
   <Form form={form} layout="vertical" onFinish={values => void create(values)} initialValues={{capacity: 20, ruleCode: 'TRAINING_4H'}} disabled={command.busy}>
    <Form.Item name="title" label="活动标题" rules={[{required: true, whitespace: true, message: '请输入活动标题'}]}><Input maxLength={120}/></Form.Item>
    <Form.Item name="startsAt" label="开始时间" rules={[{required: true, message: '请选择开始时间'}]}><Input type="datetime-local"/></Form.Item>
    <Form.Item name="endsAt" label="结束时间" rules={[{required: true, message: '请选择结束时间'}]}><Input type="datetime-local"/></Form.Item>
    <Form.Item name="capacity" label="活动名额" rules={[{required: true, message: '请输入活动名额'}]}><InputNumber min={1} max={1000} precision={0} style={{width: '100%'}}/></Form.Item>
    <Form.Item name="ruleCode" label="活动规则" rules={[{required: true}]}><Select options={rules}/></Form.Item>
    <Form.Item name="completionRequirements" label="完成要求" rules={[{required: true, whitespace: true, message: '请输入可核验的完成要求'}]}><Input.TextArea rows={4} maxLength={2000} placeholder="说明起止签到、实操与文字成果要求"/></Form.Item>
    <Alert type="info" showIcon message="预计分由服务端在创建后返回" description="选择活动类别与时长，不可自行编辑分值。"/>
    <Button type="primary" htmlType="submit" aria-label="保存活动草稿" aria-busy={command.busy} loading={command.busy} disabled={command.busy} block>保存活动草稿</Button>
   </Form>
  </Drawer>
  <Drawer title="活动详情与成果验收" open={selected !== null} width={760} maskClosable={!command.busy} closable={!command.busy} onClose={() => {detailSequence.current++; setSelected(null); setCredential(null);}}>
   {command.error && <Alert showIcon type="error" message={command.error} action={<Button disabled={loading || command.busy} onClick={() => void refresh()}>刷新记录</Button>}/>}{command.notice && <Alert showIcon type="success" message={command.notice}/>}
   <Spin spinning={detailLoading}>{selected && <><Tag color="blue">{activityStatus[selected.status]}</Tag><h2 className="flow-detail-title">{selected.title}</h2><dl className="detail-facts"><dt>活动编号</dt><dd>{selected.id}</dd><dt>开始 / 结束</dt><dd>{dateLabel(selected.startsAt)}<br/>{dateLabel(selected.endsAt)}</dd><dt>报名 / 名额</dt><dd>{selected.registeredCount} / {selected.capacity}</dd><dt>服务端预计分</dt><dd>{selected.pointsPreview} 木能量</dd><dt>固定规则</dt><dd>{selected.ruleCode}</dd><dt>完成要求</dt><dd className="preserve-text">{selected.completionRequirements}</dd><dt>活动版本</dt><dd>{selected.version}</dd></dl>
    {canManage && <div className="flow-actions">{selected.status === 'DRAFT' && <Button type="primary" aria-label="发布活动" aria-busy={command.busy} loading={command.busy} disabled={command.busy||detailLoading||loading} onClick={() => void transition('publishActivity', selected)}>发布活动</Button>}{['PUBLISHED', 'IN_PROGRESS'].includes(selected.status) && <Button type="primary" aria-label="确认活动已结束" aria-busy={command.busy} loading={command.busy} disabled={command.busy||detailLoading||loading} onClick={() => void transition('completeActivity', selected)}>确认活动已结束</Button>}</div>}
    {canSign && ['PUBLISHED', 'IN_PROGRESS', 'COMPLETED'].includes(selected.status) && <section className="flow-section"><h3>现场起止签到</h3><p className="muted">两个阶段各生成独立签到码，学生先开始签到，再结束签到。有效期由服务端返回。</p><div className="flow-actions"><Button disabled={command.busy || loading} onClick={() => void issue('START')}>生成开始签到码</Button><Button disabled={command.busy || loading} onClick={() => void issue('END')}>生成结束签到码</Button></div>{credential && <div className="attendance-secret"><Tag>{credential.phase === 'START' ? '开始签到码' : '结束签到码'}</Tag><p>有效至 {dateLabel(credential.expiresAt)}</p><Input.Password data-secret="attendance-token" aria-label="现场签到码" value={credential.token} readOnly autoComplete="off"/><small>仅内存展示，关闭详情后清除；截图时请隐藏此区域。</small><Button onClick={() => setCredential(null)}>隐藏签到码</Button></div>}</section>}
    <section className="flow-section"><h3>学生成果与事实签认</h3>{selected.ruleCode==='MEETING'&&<Alert type="info" showIcon message="会议成果走专门的合并审核入口" description={<><p>这里仅复用活动发布与起止签到，不从普通活动成果重复申领会议贡献。</p><NavLink to="/meeting-approvals/">前往会议成果审核 →</NavLink></>}/>}<Button onClick={() => void refresh()} loading={loading} disabled={command.busy}>刷新成果</Button>{!canReadSubmissions ? <Alert showIcon type="info" message="当前身份没有成果查看权限"/> : evidence.length === 0 ? <Empty description="此活动暂未收到学生成果"/> : evidence.map(s => <article id={"submission-"+s.id} className={"submission-card "+(requestedSubmissionId===s.id?"case-target":"")} key={s.id} data-submission-id={s.id}><div className="flow-actions"><Tag>{submissionStatus[s.status]}</Tag><Tag color={s.factVerified ? 'green' : 'orange'}>{s.factVerified ? '事实已签认' : '待事实签认'}</Tag></div><dl className="detail-facts"><dt>申请人</dt><dd>{s.applicantId}</dd><dt>成果编号</dt><dd>{s.artifactId}</dd><dt>文字成果</dt><dd className="preserve-text">{s.description}</dd><dt>审批编号</dt><dd>{s.approvalId ?? '暂无'}</dd></dl><PrivateEvidence {...props} ids={s.evidenceFileIds}/><ActivityEvidenceHistory key={`${s.id}:${s.version}`} {...props} submissionId={s.id}/>{selected.ruleCode!=='MEETING' && canSign && s.status === 'SUBMITTED' && !s.factVerified && <><label className="field-label" htmlFor={`fact-${s.id}`}>事实签认理由</label><Input.TextArea id={`fact-${s.id}`} value={factReasons[s.id] ?? ''} maxLength={2000} onChange={e => setFactReasons(previous => ({...previous, [s.id]: e.target.value}))} placeholder="说明已核验的现场参与和实操作品"/><Button type="primary" loading={command.busy} disabled={loading || !(factReasons[s.id] ?? '').trim()} onClick={() => void verify(s)}>确认事实签认</Button><p className="muted">须先由运营确认活动结束，服务端同时核对起止签到与自然人回避。</p></>}</article>)}</section>
   </>}</Spin>
  </Drawer>
 </>;
}
