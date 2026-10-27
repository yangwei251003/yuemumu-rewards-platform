import React, {useEffect, useState} from 'react';
import {Alert, Button, Tag} from 'antd';
import {NavLink} from 'react-router-dom';
import type {Schemas} from '@ymm/sdk';
import {allPages, hasRole, useFlowCommand, type FlowProps} from './flow-command';
export default function FlowOverview(props: FlowProps) {
 const command = useFlowCommand(props); const canReview = hasRole(props.user, ['REVIEWER', 'OPS_MANAGER']);
 const [stats, setStats] = useState<{activities: number; pending: number | null} | null>(null); const [loading, setLoading] = useState(false);
 async function refresh() {setLoading(true); command.setError(''); try {
  const [activities, approvals] = await Promise.all([allPages<Schemas['Activity']>(params => props.client.call('listActivities', undefined, params)), canReview ? allPages<Schemas['Approval']>(params => props.client.call('listApprovals', undefined, params)) : Promise.resolve(null)]);
  if (command.alive.current) setStats({activities: activities.filter(a => ['PUBLISHED', 'IN_PROGRESS'].includes(a.status)).length, pending: approvals?.filter(a => ['PENDING', 'PARTIAL_APPROVAL'].includes(a.status)).length ?? null});
 } catch (e) {command.handleError(e);} finally {if (command.alive.current) setLoading(false);}}
 useEffect(() => {void refresh();}, [props.user.id]);
 return <section className="panel work-status"><div><Tag color="blue">当前工作状态</Tag><h2>活动与独立审批</h2>{command.error ? <Alert type="error" showIcon message={command.error}/> : <p>{stats ? `开放活动 ${stats.activities} 项${stats.pending === null ? ' · 当前角色不读取审批待办' : ` · 待审批 ${stats.pending} 项`}` : '正在读取当前组织的真实活动记录…'}</p>}<p>待办数量来自当前组织的真实记录。核对私有证据后作出决定；申请人及利益相关人员需回避。</p><div className="flow-actions overview-links"><NavLink to="/activities/">管理活动 →</NavLink>{canReview && <NavLink to="/approvals/">处理审批 →</NavLink>}<NavLink to="/orders/">查看兑换履行 →</NavLink><NavLink to="/notifications/">查看本人通知 →</NavLink></div></div><Button loading={loading} onClick={() => void refresh()}>刷新工作台</Button></section>;
}
