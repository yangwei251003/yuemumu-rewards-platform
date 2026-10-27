import LocalQrScanner from './LocalQrScanner';
import {useSearchParams} from 'react-router-dom';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, Input, Tag} from 'antd';
import {ApiError, type Schemas} from '@ymm/sdk';
import {hasRole, useFlowCommand, type FlowProps} from './flow-command';
import {orderStatus, siteLabel} from './FlowOrders';
export default function FlowPickup(props: FlowProps) {
 const [searchParams]=useSearchParams();const expectedOrderId=searchParams.get('orderId');
 const {client, user} = props; const command = useFlowCommand(props); const authorized = hasRole(user, ['OPS_MANAGER', 'REWARD_OPERATOR']);
 const [token, setToken] = useState(''); const [preview, setPreview] = useState<Schemas['PickupPreview'] | null>(null); const [result, setResult] = useState<Schemas['Order'] | null>(null);
 const [reading, setReading] = useState(false); const readLock = useRef(false); const sequence = useRef(0); const secretIntent = useRef(crypto.randomUUID());
 const confirmLock=useRef(false);const [confirming,setConfirming]=useState(false);
 const [online, setOnline] = useState(navigator.onLine);
 useEffect(() => {const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => {sequence.current++; window.removeEventListener('online', update); window.removeEventListener('offline', update);};}, []);
 const busy = reading || command.busy || confirming;
 function clear() {if(confirmLock.current)return;sequence.current++; setToken(''); setPreview(null); setResult(null); secretIntent.current = crypto.randomUUID(); command.setError(''); command.setNotice('');}
 function invalidCredential(error: unknown) {return error instanceof ApiError && ['CREDENTIAL_EXPIRED', 'STALE_CREDENTIAL', 'INVALID_CREDENTIAL'].includes(error.problem.code);}
 function acceptToken(value:string){if(confirmLock.current)return;sequence.current++;setToken(value);setPreview(null);setResult(null);secretIntent.current=crypto.randomUUID();command.setError('');}
 async function readPreview() {
  if (readLock.current || command.busy || !token.trim()) return; readLock.current = true; const current = ++sequence.current; setReading(true); setPreview(null); setResult(null); command.setError(''); command.setNotice('');
  try {const value = await client.call('previewPickup', {token: token.trim()}); if (command.alive.current && current === sequence.current) {if(expectedOrderId&&value.orderId!==expectedOrderId){command.setError('领取码对应另一笔订单。请核对当前订单并重新扫码，尚未核销。');setToken('');}else setPreview(value);}}
  catch (e) {if (command.alive.current && current === sequence.current) {if (invalidCredential(e)) {setToken(''); secretIntent.current = crypto.randomUUID();} if (e instanceof ApiError) command.handleError(e); else command.setError('无法连接核销服务，尚未进行交付确认。请恢复网络后重新预览。');}}
  finally {readLock.current = false; if (command.alive.current) setReading(false);}
 }
 async function confirm() {
  if(confirmLock.current||command.busy||!preview?.eligible||!token.trim()||reading)return;
  confirmLock.current=true;setConfirming(true);const current=sequence.current;
  const valid=()=>command.alive.current&&current===sequence.current;
  const body:Schemas['PickupConfirmRequest']={token:token.trim(),orderId:preview.orderId,expectedVersion:preview.version};
  try{
   const value=await command.submit({operation:'confirmPickup',secretIntent:secretIntent.current,orderId:body.orderId,expectedVersion:body.expectedVersion},options=>client.call('confirmPickup',body,{},options));
   if(!valid())return;
   if(value){setResult(value);setToken('');setPreview(null);secretIntent.current=crypto.randomUUID();return;}
   try{const latest=await client.call('getOrder',undefined,{orderId:body.orderId});if(valid()&&latest.status==='FULFILLED'){setResult(latest);setToken('');setPreview(null);secretIntent.current=crypto.randomUUID();command.setError('');command.setNotice('已重新读取订单，服务端确认已领取。请勿重复交付。');}}
   catch(e){if(valid())command.handleError(e);}
  }finally{confirmLock.current=false;if(command.alive.current)setConfirming(false);}
 }

 const step = result?.status === 'FULFILLED' ? 3 : preview ? 2 : 1;
 if (!authorized) return <section className="pickup panel"><Alert type="info" showIcon message="当前身份没有核销权限" description="请使用已获领取点授权的运营或领取人员账号。"/></section>;
 return <section className="pickup panel"><div className="pickup-heading"><Tag color="blue">企业移动工作页</Tag><h2>核对后，再交付</h2><p>本地演示领取点：人工智能与大数据学院粤木木无人机企业2楼前台（SITE_DEMO）。实际权限和订单领取点由服务端核验。</p></div>
  <ol aria-label="领取办理进度" className="pickup-steps">{['扫描 / 输码', '预览确认', '领取完成'].map((label, index) => <li key={label} aria-current={step===index+1?'step':undefined} className={step === index + 1 ? 'current' : step>index+1?'complete':''}><span>{step>index+1?'✓':index+1}</span>{label}</li>)}</ol>
  {!online && <Alert type="warning" showIcon message="网络已断开，请暂停现场交付" description="恢复网络后重试；不要凭旧预览判断核销已经成功。"/>}{command.error && <Alert type="error" showIcon message={command.error}/>} {command.notice&&<Alert type="info" showIcon message={command.notice}/>}
  {!result && <><div className="scan-area"><strong>扫描学生的当前领取码</strong>{expectedOrderId&&<p>正在核对订单：{expectedOrderId}</p>}<LocalQrScanner disabled={busy||!online} onRead={acceptToken}/></div><label className="field-label" htmlFor="pickup-token">手动输入领取码</label><div className="pickup-secret" data-secret="pickup-token"><Input.Password id="pickup-token" aria-label="手动输入领取码" value={token} disabled={busy} autoComplete="off" maxLength={256} placeholder="输入学生刚生成的完整领取码" onChange={e => acceptToken(e.target.value)}/></div><p className="muted">领取码默认隐藏，仅在当前页面内存中使用，不写入网址或浏览器存储。短效码过期或更换后，请学生重新生成。</p><div className="flow-actions"><Button type="primary" loading={reading} disabled={command.busy || confirming || !online || !token.trim()} onClick={() => void readPreview()}>预览领取信息</Button><Button disabled={busy} onClick={clear}>清空领取码</Button></div></>}
  {preview && <section className="pickup-preview flow-section"><Tag color={preview.eligible ? 'blue' : 'orange'}>{preview.eligible ? '可领取，待工作人员确认' : preview.status === 'FULFILLED' ? '此订单已经领取' : '当前不可领取'}</Tag><h3>{preview.rewardName}</h3><dl className="detail-facts"><dt>领取资格</dt><dd>{preview.eligible ? '服务端预览通过' : '当前不符合领取条件'}</dd><dt>领取人</dt><dd>{preview.maskedDisplayName}</dd><dt>数量</dt><dd>{preview.quantity} 件</dd><dt>领取点</dt><dd>{siteLabel(preview.siteId)}</dd><dt>订单编号</dt><dd>{preview.orderId}</dd><dt>订单状态</dt><dd>{orderStatus[preview.status as Schemas['Order']['status']] ?? preview.status}</dd></dl>{preview.eligible ? <><Alert type="info" showIcon message="此时仅完成预览，尚未核销" description="核对现场本人、奖品和数量后，点击下方按钮提交交付确认。提交前服务端会再次验证码有效性、库存、订单状态和权限。"/><Button block type="primary" aria-label="确认本人领取并核销" loading={command.busy||confirming} disabled={!online || reading||confirming} onClick={() => void confirm()}>确认本人领取并核销</Button><p className="muted">如连接中断，不确定是否成功，请保留当前页面重试同一确认。</p></> : <Alert type="warning" showIcon message={preview.status === 'FULFILLED' ? '已有领取记录，请勿再次交付' : '请核对订单是否备妥、取消或超过领取期限'} description="预览不修改积分或库存。需要重新核验时，请清码后由学生提供当前有效码。"/>}</section>}
  {result && <section className="pickup-result flow-section"><Alert type={result.status === 'FULFILLED' ? 'success' : 'info'} showIcon message={result.status === 'FULFILLED' ? '核销完成，服务端已确认领取' : '已收到服务端订单结果'}/><h3>{result.rewardNameSnapshot}</h3><dl className="detail-facts"><dt>订单编号</dt><dd>{result.id}</dd><dt>数量</dt><dd>{result.quantity} 件</dd><dt>订单状态</dt><dd>{orderStatus[result.status]}</dd><dt>木能量</dt><dd>{result.totalPoints}</dd><dt>领取点</dt><dd>{siteLabel(result.pickupSiteId)}</dd><dt>核对编号</dt><dd>{result.requestId}</dd></dl><p className="muted">领取码已从本页清除。请勿重复交付。</p><Button block type="primary" onClick={clear}>核验下一笔领取</Button></section>}
  <div className="pickup-footnote"><strong>现场核验提示</strong><p>本页办理普通实物领取。服务预约与专项申请请进入商务申请履约；退货请进入整单质量退货。</p></div>
 </section>;
}
