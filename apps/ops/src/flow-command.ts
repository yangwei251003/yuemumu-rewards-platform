import {useEffect, useRef, useState} from 'react';
import {ApiError, StaleClientRequest, type createClient, type Schemas} from '@ymm/sdk';
export type Client = ReturnType<typeof createClient>;
export type FlowProps = {client: Client; user: Schemas['User']; onExpired: () => void};
export type CommandOptions = {idempotencyKey: string};
const intents = new Map<string, string>();
export function clearCommandIntents() {intents.clear();}
export function hasRole(user: Schemas['User'], roles: Schemas['User']['roles']) {return roles.some(role => user.roles.includes(role));}
export function flowError(error: unknown): string {
 if (error instanceof ApiError) {
  const hints: Record<number, string> = {401: '登录已过期，请重新登录。', 403: '当前操作未获授权，请核对角色、范围或回避要求。', 409: '请刷新最新记录后核对状态再操作。', 422: '请修正填写内容后重新提交。', 429: '请求过于频繁，请稍后重试。', 503: '服务暂不可用，请稍后重试。'};
  return `${error.message} ${hints[error.status] ?? ''}${error.problem.requestId ? `（请求编号 ${error.problem.requestId}）` : ''}`;
 }
 return navigator.onLine ? '连接未完成。写入结果尚不确定，请使用原操作重试，不要重复创建记录。' : '网络已断开。请恢复网络后重试原操作。';
}
export async function allPages<T>(read: (params: Record<string, string | number>) => Promise<{items: T[]; nextCursor: string | null}>) {
 const items: T[] = []; const seen = new Set<string>(); let cursor: string | null = null;
 do {const result = await read(cursor ? {cursor, limit: 100} : {limit: 100}); items.push(...result.items); cursor = result.nextCursor; if (cursor) {if (seen.has(cursor)) throw new Error('分页游标重复'); seen.add(cursor);}} while (cursor);
 return items;
}
export function useFlowCommand({user, onExpired}: FlowProps) {
 const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
 const inFlight = useRef(false); const alive = useRef(true);
 useEffect(() => {alive.current = true; return () => {alive.current = false;};}, []);
 function handleError(e: unknown) {if (!alive.current || e instanceof StaleClientRequest) return; if (e instanceof ApiError && e.status === 401) onExpired(); else setError(flowError(e));}
 async function submit<T>(intent: unknown, run: (options: CommandOptions) => Promise<T>): Promise<T | undefined> {
  if (inFlight.current) return; inFlight.current = true; setBusy(true); setError(''); setNotice('');
  const fingerprint = JSON.stringify({userId: user.id, intent});
  let key = intents.get(fingerprint); if (!key) {key = `ops:${crypto.randomUUID()}`; intents.set(fingerprint, key);}
  try {const result = await run({idempotencyKey: key}); intents.delete(fingerprint); return alive.current ? result : undefined;}
  catch (e) {handleError(e); return undefined;}
  finally {inFlight.current = false; if (alive.current) setBusy(false);}
 }
 return {busy, error, notice, setNotice, setError, handleError, submit, alive};
}
export const activityStatus: Record<Schemas['Activity']['status'], string> = {DRAFT: '草稿', PENDING_REVIEW: '待审核', PUBLISHED: '已发布', IN_PROGRESS: '进行中', COMPLETED: '已结束', CANCELLED: '已取消'};
export const submissionStatus: Record<Schemas['Submission']['status'], string> = {DRAFT: '草稿', SUBMITTED: '待验收', NEEDS_CHANGES: '需补充', APPROVED: '已通过', REJECTED: '已拒绝'};
export const approvalStatus: Record<Schemas['Approval']['status'], string> = {PENDING: '待审批', PARTIAL_APPROVAL: '部分通过', APPROVED: '已通过', REJECTED: '已拒绝', CANCELLED: '已结束 / 要求补充'};
export function dateLabel(value: string | null) {return value ? new Date(value).toLocaleString('zh-CN', {hour12: false, timeZone: 'Asia/Shanghai'}) : '时间待确认';}
