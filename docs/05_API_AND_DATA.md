# API与数据合同

## 权威来源和范围
`packages/contracts/openapi.json` 是本包提供的初始可解析合同，当前DRAFT_G0；包含身份、钱包、活动、审批、奖励和订单主路径。A在G0前校验、补充并冻结首批可用接口；项目、比赛、审计等完整模块按PRD增量扩展，不得把初始合同误称全量成品。
OpenAPI是唯一跨端业务形状来源；从它生成TS DTO及运行时验证器，不能维护第二套不受测试约束的Zod/Swagger真相。Nest Swagger输出如使用，只能作派生核验，不倒向覆盖已冻结合同。[R08,R09]
TS类型不能替代运行时验证；请求、文件、路径和响应关键字段必须实际校验。SDK提供`transport`接口；Web与Taro实现各自transport，统一错误与重试规则。

## 公共规则
API `/api/v1`；JSON字段camelCase，数据库snake_case；ID为字符串；金额`...Cents`整数、积分非负整数、比例basisPoints（10000=100%）。所有日期ISO8601含时区。业务归属日期在Asia/Shanghai计算，持久化UTC。
成功读取返回资源；分页返回`{items,nextCursor}`；写操作返回最新资源，响应头X-Request-ID提供请求追踪号；错误统一`{code,message,requestId,details?}`，对用户脱敏。401未登录、403无权、404不存在或隐藏他人对象、409状态冲突、422验证失败、429限流、503依赖不可用。
所有有副作用POST要求Idempotency-Key（登录等例外须在合同写明）；幂等键按主体+操作隔离，同时保存请求hash，不同请求体复用键返回409。幂等日志保留策略独立，核心业务唯一键长期存在。
乐观并发使用version/If-Match或条件更新；前端不传“奖励50”让后端照收，只传申请和证据，服务端按规则快照算分。

## 身份会话
H5学生与后台人员需可同时演示：使用独立的学生/职员会话上下文，互不覆盖。staff优先HttpOnly cookie+CSRF，学生H5可使用独立HttpOnly cookie；微信端token只走Authorization。专属路由按合同限定学生或职员会话；少量共享路由要求X-Session-Audience，只选择已验证的对应会话，绝不是客户端授予角色。不得因为同时存在两种cookie而随机合并角色。A/B实例须使用不同Cookie名或host：Cookie不会按TCP端口隔离。
角色选择页仅在demo且演示访问口令验证后签发真实后端会话。不能接受客户端role字段即授予管理员。生产无demo路由；会话过期、注销、刷新和撤权必须服务端生效。

## 关键数据实体
| 领域 | 表/实体 |
|---|---|
| 身份权限 | users, external_identities, memberships, roles, permissions, role_assignments, sessions |
| 规则 | rule_sets, rule_versions, earning_rules, source_artifacts, eligibility_candidates |
| 活动 | activities, registrations, checkin_sessions, attendance, submissions, training_assessments |
| 审批 | approval_requests, approval_steps, approval_decisions, recusal_records |
| 积分 | wallets, point_lots, ledger_transactions, ledger_entries, reservations, recovery_cases, growth_ledger |
| 项目比赛 | projects, project_members, milestones, contribution_versions, competitions, competition_entries, award_entitlements |
| 奖品库存 | rewards, reward_variants, inventory_batches, inventory_movements, service_slots, budget_periods |
| 订单 | redemption_orders, order_items, order_reservations, pickup_credentials, pickup_events, returns |
| 治理 | violation_cases, sanctions, appeals, audit_events, audit_samples |
| 文件通知 | files, asset_licenses, notifications, outbox_events, worker_runs |

字段审计至少含createdAt、actorId、organizationId、ruleVersion或snapshot、requestId、source；不要在meta里无结构堆放所有业务。
业务唯一键分别定义：首次身份/安全学习(user,rule)；活动(user,activity,ruleComponent)；项目(user,milestone,allocationVersion/目标权益族)；比赛(series,edition,artifact,member,awardTrack)。规则换版不能自动把同一已完成事项再领一遍。

## 余额、批次与负值
可用、订单冻结、调查冻结、待追缴分开。待审核和待资格结算不是钱包余额；成长里程也不混入。
同批次额度分为available/reserved/consumed/expired/reversed；每种转移有独立账本项。有效期内批次按最近到期优先（FEFO），同日再按创建时间和ID排序。撤销冻结、退款按原分配记录反向，不使用“当前余额加N”模拟。
已消费虚假积分：未用余额可逆部分冲正，剩余进入recoveryDue；之后清偿过程单独事件，避免负可用数和双重追偿。

## 订单状态机
实物：PREPARING→READY→FULFILLED；PREPARING/READY可按规则→CANCELLED或EXPIRED；已完成仅走RETURN_REQUESTED→RETURN_APPROVED→RETURNED/REJECTED。不允许已完成直接CANCELLED。
创建操作在同一事务里检查资格、限购、钱包、批次、stockAvailable，写入订单价格快照、预占、账本和outbox。持久化草稿不是一次成功兑换。
领取凭证为高熵随机一次性opaque token，服务端只存hash、订单、有效期/版本；二维码不含姓名学号。备用码较短必须限流、锁定和本站点绑定。扫码预览是无副作用POST /pickup/preview，凭证放请求体避免进入URL日志，不核销，工作人员明确确认POST才核销；分享链接/聊天预览不能领取。
重复核销返回同一履行结果或明确alreadyFulfilled而不再扣库存。取消与核销/到期并发，只有一个状态转换胜出。真实库存onHand、reserved、quarantine、available分别定义，入库/出库都有库存流水。

## 文件及安全
上传先限制MIME、魔数、大小、文件数量，再放私有隔离路径；不给路径穿越、SVG脚本、任意URL抓取成为SSRF机会。SVG需净化/光栅化，证据文件读取必须鉴权。内容安全服务无密钥时可在演示中用人工审核，不谎称官方审核通过。日志屏蔽令牌、密码、完整学号；脱敏不是可逆加密的替代。
