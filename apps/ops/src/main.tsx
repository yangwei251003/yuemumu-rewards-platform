import WorkReturn from './WorkReturn';
import React, {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Alert, Button, ConfigProvider, Empty, Spin, Tag} from 'antd';
import {BrowserRouter, NavLink, useLocation} from 'react-router-dom';
import {ApiError, createClient, webTransport, type Schemas} from '@ymm/sdk';
import {artwork} from './assets';
import {visual} from './assets/visual';
import './style.css';
import {clearCommandIntents} from './flow-command';
import RouteBoundary from './RouteBoundary';
import WorkspaceNavigation,{sections} from './WorkspaceNavigation';
import './workspace.css';
import './v3.css';
import {domainFor} from './work-domains';

const FlowActivities=lazy(()=>import('./FlowActivities'));
const FlowApprovals=lazy(()=>import('./FlowApprovals'));
const TodayWork=lazy(()=>import('./TodayWork'));
const FlowOrders=lazy(()=>import('./FlowOrders'));
const FlowPickup=lazy(()=>import('./FlowPickup'));
const GovCases=lazy(()=>import('./GovCases'));
const GovAudit=lazy(()=>import('./GovAudit'));
const Reporting=lazy(()=>import('./Reporting'));
const DataTools=lazy(()=>import('./DataTools'));
const RuntimeHealth=lazy(()=>import('./RuntimeHealth'));
const CommerceResources=lazy(()=>import('./CommerceResources'));
const CommerceRequests=lazy(()=>import('./CommerceRequests'));
const CommerceStock=lazy(()=>import('./CommerceStock'));
const CommerceReturns=lazy(()=>import('./CommerceReturns'));
const CommerceWishes=lazy(()=>import('./CommerceWishes'));
const ConversionApprovals=lazy(()=>import('./ConversionApprovals'));
const PointAdjustments=lazy(()=>import('./PointAdjustments'));
const AccessManagement=lazy(()=>import('./AccessManagement'));
const GovNotifications=lazy(()=>import('./GovNotifications'));
const GrowthProjects=lazy(()=>import('./GrowthProjects'));
const GrowthCompetitions=lazy(()=>import('./GrowthCompetitions'));
const GrowthApprovals=lazy(()=>import('./GrowthApprovals'));
const MeetingManagement=lazy(()=>import('./MeetingManagement'));
const MeetingApprovals=lazy(()=>import('./MeetingApprovals'));
const ManagementRecruitments=lazy(()=>import('./ManagementRecruitments'));
const ManagementMembership=lazy(()=>import('./ManagementMembership'));
const GrowthLearning=lazy(()=>import('./GrowthLearning'));
const RewardsCatalog=lazy(()=>import('./RewardsCatalog'));
const RewardDetail=lazy(()=>import('./RewardDetail'));
const FlowInventory=lazy(()=>import('./FlowOrders').then(module=>({default:module.FlowInventory})));
const StaffLogin=lazy(()=>import('./StaffLogin'));
const client = createClient(webTransport(), 'staff');
type Reward = Schemas['Reward'];
const roleLabels: Record<string, string> = {STUDENT: '学生', STUDENT_ORGANIZER: '学生组织者', MENTOR: '教员导师', REVIEWER: '审核员', OPS_MANAGER: '运营管理员', REWARD_OPERATOR: '领取人员', AUDITOR: '监察员', SYSTEM_ADMIN: '系统管理员'};

const pending: Record<string, {title: string; description: string; steps: string[]}> = {
 activities: {title: '活动与课程', description: '从活动发布到参与验收，让每一份成长都有依据。', steps: ['活动名额与报名名单', '签到记录与完成证据', '课程考核与技能翼章']},
 tasks: {title: '内容任务', description: '集中查看任务交付、原创说明与使用授权。', steps: ['任务认领与交付', '内容证据与授权', '贡献验收与结果通知']},
 projects: {title: '项目与比赛', description: '按阶段追踪团队贡献，核对比赛结果与晋级差额。', steps: ['项目里程碑与团队', '贡献分配与独立复核', '赛事作品与奖项更正']},
 approvals: {title: '积分审批', description: '审批时核对规则、证据和前序审核，利益相关人员回避。', steps: ['规则快照与拟发差额', '证据与前序审核者', '批准、退回及原因']},
 appeals: {title: '违规与申诉', description: '以事实和证据审查决定，为学生保留陈述和复核路径。', steps: ['决定与证据记录', '学生陈述与申诉', '独立复核与处理结果']},
 reports: {title: '监察报表', description: '追溯积分、库存与订单，核对每项指标的统计口径。', steps: ['追加账本与冲正记录', '抽查与异常复核', '预算与库存报表']},
};
function describeError(error: unknown): string {
 if (error instanceof ApiError) {
  const advice: Record<number, string> = {401: '登录已过期，请重新登录。', 403: '当前身份无权执行此操作，请使用已获授权的职员账号。', 409: '记录状态已变化，请刷新后重试。', 503: '服务暂时不可用，请稍后重试。'};
  return `${advice[error.status] ?? error.message}${error.problem.requestId ? `（请求编号 ${error.problem.requestId}）` : ''}`;
 }
 return navigator.onLine ? '无法连接服务，请检查本地服务是否运行后重试。' : '网络已断开，请恢复网络后重试。';
}
function App() {
 const location = useLocation();
 const route = location.pathname.split('/').filter(Boolean)[0] ?? '';
 const [user, setUser] = useState<Schemas['User'] | null>(null);
 const [rewards, setRewards] = useState<Reward[]>([]);
 const [initializing, setInitializing] = useState(true);
 const [busy, setBusy] = useState(false);
 const [catalogBusy, setCatalogBusy] = useState(false);
 const [catalogLoaded, setCatalogLoaded] = useState(false);
 const [error, setError] = useState('');
 const [catalogError, setCatalogError] = useState('');
 const [notice, setNotice] = useState('');
 const [online, setOnline] = useState(navigator.onLine);
 const [detailId, setDetailId] = useState<string | null>(null);
 const [detail, setDetail] = useState<Reward | null>(null);
 const [detailBusy, setDetailBusy] = useState(false);
 const [detailError, setDetailError] = useState('');
 const epoch = useRef(0);
 const detailSequence = useRef(0);
 function clearIdentity() {
  epoch.current++; detailSequence.current++; client.clear(); clearCommandIntents(); setUser(null); setRewards([]); setCatalogLoaded(false);
  setDetail(null); setDetailId(null); setDetailError(''); setDetailBusy(false); setCatalogError(''); setCatalogBusy(false);
  setNotice('');
 }
 function fail(e: unknown, target: (value: string) => void = setError) {
  if (e instanceof ApiError && e.status === 401) { clearIdentity(); setError(describeError(e)); }
  else target(describeError(e));
 }
 async function loadCatalog() {
  const current = epoch.current;
  setCatalogBusy(true); setCatalogError('');
  try {
   const items: Reward[] = []; const seenCursors = new Set<string>(); let cursor: string | null = null;
   do {
    const result: Schemas['RewardPage'] = await client.call('listRewards', undefined, cursor ? {limit: 100, cursor} : {limit: 100});
    if (current !== epoch.current) return;
    items.push(...result.items); cursor = result.nextCursor;
    if (cursor && seenCursors.has(cursor)) throw new Error('Repeated pagination cursor');
    if (cursor) seenCursors.add(cursor);
   } while (cursor);
   setRewards(items); setCatalogLoaded(true);
  } catch (e) { if (current === epoch.current) fail(e, setCatalogError); }
  finally { if (current === epoch.current) setCatalogBusy(false); }
 }
 async function restore() {
  const current = epoch.current; setInitializing(true); setError('');
  try {
   await client.call('getSession'); const me = await client.call('getMe');
   if (current === epoch.current) { setUser(me); await loadCatalog(); }
  } catch (e) {
   if (current === epoch.current) {
    if (e instanceof ApiError && e.status === 401) clearIdentity(); else fail(e);
   }
  } finally { setInitializing(false); }
 }
 useEffect(() => { void restore(); const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => {epoch.current++; window.removeEventListener('online', update); window.removeEventListener('offline', update);}; }, []);
 async function login(values: {login: string; password: string}) {
  clearIdentity(); const current = epoch.current; setBusy(true); setError('');
  try {await client.call('createStaffSession', values); const me = await client.call('getMe'); if (current !== epoch.current) return; setUser(me); setNotice('登录成功，已载入当前职员身份。'); await loadCatalog();}
  catch (e) {if (current === epoch.current) fail(e);}
  finally {setBusy(false);}
 }
 async function logout() {
  setBusy(true); setError('');
  try {await client.call('logout', {audience: 'staff'}); clearIdentity(); setNotice('已退出职员账号。');}
  catch (e) {fail(e);}
  finally {setBusy(false);}
 }
 async function openDetail(id: string) {
  const current = epoch.current; const sequence = ++detailSequence.current;
  setDetailId(id); setDetail(null); setDetailError(''); setDetailBusy(true);
  try {const result = await client.call('getReward', undefined, {rewardId: id}); if (current === epoch.current && sequence === detailSequence.current) setDetail(result);}
  catch (e) {if (current === epoch.current && sequence === detailSequence.current) fail(e, setDetailError);}
  finally {if (current === epoch.current && sequence === detailSequence.current) setDetailBusy(false);}
 }
 const workDomain=domainFor(`/${route}${route ? '/' : ''}`);
 const title = sections.find(s => s.path === `/${route}${route ? '/' : ''}`)?.label ?? '页面未找到';

 return <ConfigProvider theme={{token: {colorPrimary: '#b84324', colorText: '#252e28', colorTextSecondary:'#626960', colorTextPlaceholder:'#697063', colorBorder:'#bdc4b5', colorSuccess:'#23734b', colorWarning:'#98621a', borderRadius: 8, controlHeight: 40, motionDurationMid:'0.18s', motionDurationSlow:'0.22s', fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'}}}>
  <a className="skip-link" href="#main-content">跳到主要内容</a>
  <div className="notice"><span className="notice-dot"/>模拟数据 / 内部演示<span className="notice-extra"> · 本地运行 · 奖励尚未采购</span></div>
  <div className="workspace"><WorkspaceNavigation user={user}/>
  <main id="main-content"><header><div><p className="eyebrow">粤木木工作空间 / {workDomain??'页面导航'}</p><h1>{title}</h1></div><div className="header-actions">{user && <><span className="user-chip">{user.displayName}</span><Button loading={busy} onClick={() => void logout()}>退出登录</Button></>}</div></header>
  <WorkReturn/>
  {!online && <Alert showIcon type="warning" message="网络已断开" description="当前内容可能不是最新记录。恢复网络后，请刷新再操作。"/>}
  {error && <Alert showIcon type="error" message={error} closable onClose={() => setError('')}/>}
  {notice && <Alert showIcon type="success" message={notice} closable onClose={() => setNotice('')}/>}
  {user && new URLSearchParams(location.search).has('record') && <Alert className="v3-record-link" type="info" showIcon message="从待办定位业务记录" description="仅自动打开当前授权列表中存在的记录。若未打开详情，请刷新本页列表；记录可能已处理、不可见或链接已失效，不会自动执行任何审核。" action={<NavLink state={location.state} to={location.pathname}>清除定位</NavLink>}/>}
  {initializing ? <div className="loading-area" role="status"><Spin/><p>正在核验职员会话…</p></div> : !user ? <RouteBoundary><Suspense fallback={<div className="loading-area" role="status"><Spin/><p>正在载入登录页…</p></div>}><StaffLogin busy={busy} online={online} onLogin={login}/></Suspense></RouteBoundary> : <RouteBoundary><Suspense fallback={<div className="loading-area" role="status"><Spin/><p>正在载入工作页面…</p></div>}>
   {route === '' && <TodayWork key={user.id} client={client} user={user} onExpired={() => {clearIdentity(); setError('登录已过期，请重新登录。');}}/>}
   {route === 'rewards' && <RewardsCatalog key={user.id} rewards={rewards} catalogBusy={catalogBusy} catalogLoaded={catalogLoaded} catalogError={catalogError} loadCatalog={loadCatalog} openDetail={openDetail}/>}
   {route === 'activities' && <FlowActivities key={user.id+location.search} client={client} user={user} onExpired={() => {clearIdentity(); setError('登录已过期，请重新登录。');}}/>}
   {route === 'approvals' && <FlowApprovals key={user.id+location.search} client={client} user={user} onExpired={() => {clearIdentity(); setError('登录已过期，请重新登录。');}}/>}
   {route === 'orders' && <FlowOrders key={user.id+location.search} client={client} user={user} onExpired={() => {clearIdentity(); setError('登录已过期，请重新登录。');}}/>}
   {route === 'inventory' && <FlowInventory key={user.id+location.search} client={client} user={user} onExpired={() => {clearIdentity(); setError('登录已过期，请重新登录。');}}/>}
   {route === 'pickup' && <FlowPickup key={user.id+location.search} client={client} user={user} onExpired={() => {clearIdentity(); setError('登录已过期，请重新登录。');}}/>}
   {route==='projects'&&<GrowthProjects key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='competitions'&&<GrowthCompetitions key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='growth-approvals'&&<GrowthApprovals key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='meetings'&&<MeetingManagement key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='meeting-approvals'&&<MeetingApprovals key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='recruitments'&&<ManagementRecruitments key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='memberships'&&<ManagementMembership key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='learning'&&<GrowthLearning key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='tasks'&&<GrowthLearning contentOnly key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='appeals'&&<GovCases key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='reports'&&<GovAudit key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='reporting'&&<Reporting key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='data-tools'&&<DataTools key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='runtime'&&<RuntimeHealth key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='commerce-resources'&&<CommerceResources key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='commerce-requests'&&<CommerceRequests key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='commerce-stock'&&<CommerceStock key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='commerce-returns'&&<CommerceReturns key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='commerce-wishes'&&<CommerceWishes key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='conversion-approvals'&&<ConversionApprovals key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='point-adjustments'&&<PointAdjustments key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='access'&&<AccessManagement key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {route==='notifications'&&<GovNotifications key={user.id+location.search} client={client} user={user} onExpired={()=>{clearIdentity();setError('登录已过期，请重新登录。');}}/>}
   {pending[route] && !['activities', 'approvals', 'projects', 'tasks', 'appeals', 'reports'].includes(route) && <section className="panel pending"><div className="section-heading"><div><Tag color="orange">待接通</Tag><h2>{pending[route].title}</h2><p>{pending[route].description}</p></div></div><div className="pending-layout"><img src={artwork['empty-1']} alt="等待工作记录的原创示意图"/><div><h3>此模块的数据与操作暂未开放</h3><p>真实服务接通后，将提供以下工作内容。当前没有提交审批、创建记录或修改积分。</p><ul>{pending[route].steps.map(s => <li key={s}>{s}</li>)}</ul><NavLink to="/rewards/">先查看已接通的奖励目录 →</NavLink></div></div></section>}
   {route === 'settings' && <section className="panel settings"><Tag color="blue">职员身份</Tag><h2>{user.displayName}</h2><dl><dt>用户编号</dt><dd>{user.id}</dd><dt>职员角色</dt><dd>{user.roles.map(role => roleLabels[role] ?? role).join(' / ')}</dd><dt>成员状态</dt><dd>{{VISITOR: '访客', PENDING: '待审核', ACTIVE: '有效成员', RESTRICTED: '受限成员'}[user.membershipStatus]}</dd><dt>数据环境</dt><dd>{user.demoOnly ? '虚构身份 / 模拟数据' : '非演示身份'}</dd><dt>权限调整</dt><dd>此页展示当前身份；角色与范围变更由专门权限流程独立审核。</dd></dl></section>}
   {!sections.some(s => s.path === `/${route}${route ? '/' : ''}`) && <section className="panel"><Empty description="未找到此工作页面"/><NavLink to="/">返回工作台</NavLink></section>}
  </Suspense></RouteBoundary>}
  <footer><div className="footer-identity"><img src={visual.school} alt="广州科技职业技术大学"/><span>粤木木 · 木能量成长系统</span></div><span>模拟规则仅用于本地演示，未批准用于真实运营。</span></footer></main></div>
  <RouteBoundary><Suspense fallback={<div role="status" className="loading-area">正在载入奖励详情…</div>}>{detailId!==null&&<RewardDetail detail={detail} detailBusy={detailBusy} detailError={detailError} onClose={()=>{detailSequence.current++;setDetailId(null);setDetail(null);setDetailBusy(false);}} onRetry={()=>{if(detailId)void openDetail(detailId);}}/>}</Suspense></RouteBoundary>
 </ConfigProvider>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter basename="/admin"><App/></BrowserRouter></React.StrictMode>);
