# V3 改动与验证日志

基线：16f50543680efcced1eeaf85e55a5c58e8a393e5。合同：0.14.0 / 72d571f3f5c7af3b21257b3fde15b370648e4900fd11a798d2006fb25329ae29。

## 阶段1 — 已完成审计，开始三个样板

- 检查仓库、项目入口/角色/契约/前端状态与素材；运行已有真实MySQL/API/H5/后台。
- 建立54场景只读浏览清单与基线截图，补充运营角色可操作视图。审计脚本 `tests/e2e/v3-audit.mjs`，没有业务POST。
- 新增审计、设计系统、31模块映射。未改变业务规则，未重置数据。
- 本轮运行 health exit0；上一阶段当前基线 typecheck、contract:check exit0。后续代码未验证部分不可引用这些结果。

## 阶段2 — 三个样板、素材和视觉复查

- 学生成长首页：真实近期活动、木能量/成长/有效翼章三份摘要、状态驱动下一步、实践矩阵、最近记录。待补材料优先，其次已备货、有效报名、未读通知；只展示最紧要的一项，不把读取失败显示为零待办。
- 活动详情：已验图的场景封面、四步引导、明确报名要求/签到/补材料定位；不伪造地点、技能门槛、等级或统计。
- 后台今日工作：15个现有授权来源的完整分页，独立失败提示、类型与编号搜索、直达记录、角色快捷入口；删除首页宣传Banner和奖励目录，但奖励业务仍在原路径。
- 先实际构建和检查样板，再推广。samples-running 为首轮；samples-assets-complete 为新图和首屏调整后4项PASS。
- 4张官方imagegen场景，960×640 JPEG为58,713—93,034 bytes。原图、提示词、逐图核验、哈希与13类用途映射在 assets/v3。FPV首图后左旋翼叶片数错误，已修正并复查；错误版本未发布。奖励27项、品牌、空态和翼章复用原项目素材，不新增虚构商品/证照。
- frontend-design技能用于先确立样板和深航蓝/科技蓝/冷白/少量品牌黄的规范，再推广；imagegen技能用于正式生成、验图和落地，不只交设计建议。

## 阶段3 — 相关页面推广

- 活动列表：场景图、名称搜索、全部/报名开放/我的参与、名额和真实服务端估算。保留规则勾选、候补、取消理由、起止签到及私有证据。
- 项目/竞赛：协作与工程场景、四阶段真实验收进度、团队人数及本人贡献比例、下一步提示。进度不代表前端自算积分；四人分配、版本确认、独立双审与赛事补差不变。
- 学习/翼章：分类场景、空态、独立考核记录样式、已撤销样式；WING_I 显示对应装调名称。明确不是CAAC执照或飞行许可。
- 奖励/订单：27项原目录与真实库存/积分门槛、申请资格说明、订单缩略图和领取流程；未把“积分够”写成必然能兑换。
- 我的：成长摘要，成长/参与/服务/账号四分组14入口；旧12入口全部保留，新增活动和项目快捷入口。
- 后台31原路径重组为6域：今日工作、教学活动、项目竞赛、审核中心、奖励服务、运营设置。角色菜单联合可达31项；无独立财务角色，不创造角色或员工CRUD。
- 审批上下文增加关联活动标题及完成要求；10类列表复用授权记录定位。更换记录参数重新挂载工作组件，避免携带上一条理由。私有证据、自然人回避、双审、版本守卫、预览、确认和质检保持原实现。
- 小动效：Hero 280ms进入、读取骨架；保留并统一按钮/Tab/展开反馈。prefers-reduced-motion关闭非必要动画。无新动画库、网络字体或依赖升级。

## 顺手修复与明确边界

1. 学习分类原来仅在全部目录为空时提示；现在按当前筛选结果显示空态。翼章未加载不会提前显示“没有翼章”。
2. 375px下新Hero CTA实测43px，改为至少44px后回归通过。
3. 活动步骤改为“成果提交”，不把已提交冒充已验收；取消报名不标记已完成报名。
4. 重复翼章原来触发skill_badges唯一键错误并返回503。当前仅将既有拒绝行为转为BADGE_ALREADY_RECORDED/409；仍保留(user_id,badge_code)唯一记录，不启用重获规则、不覆盖旧记录、不更改计分。检查在已锁定受益钱包的事务内进行，失败回滚拟入账和审核票。新增API测试覆盖ACTIVE/REVOKED两种记录；浏览器对原失败申请复验，钱包、成长、审核票、旧翼章均未变化。

## 最终验证（2026-09-06，本机真实运行）

| 检查 | 结果 / 证据 |
|---|---|
| contract:check、typecheck、lint | exit0，checks-final/checks-commands.json |
| API/MySQL | 147/147 PASS、0失败、0跳过；checks-final/api-db.log |
| 学生H5、后台构建 | exit0，build-final-context/build-commands.json |
| 小程序构建 | exit0，checks-final/weapp.log；不能等同开发者工具/真机验证 |
| V3页面、375/390/430、图片哈希、对比度、减少动画、角色/定位/故障 | 10项PASS，closing/v3-regression-report.json |
| 键盘、焦点、选择框、忙碌禁用 | 6项PASS，closing/keyboard-report.json |
| 学生目录/账本/断网/503/登录失效 | business/student-report.json PASS |
| 后台登录/目录/权限不足/断网/503/过期隔离 | business/ops-report.json PASS |
| 延迟期间导航禁用与恢复 | business/navigation-report.json PASS |
| 报名、签到、提交、发起人回避、独立发分50 | business/flow01-report.json PASS |
| R001兑换30、取消、独立二维码解码、核销、重复防护、对账 | business/flow02-report.json PASS；E2E_REWARD_ID=R001 |
| 四阶段1001、赛事250→1000只补750、撤奖、翼章、宣传 | growth-fresh/grow01-report.json PASS；E2E_STUDENT_START=9 |
| 补材料新轮、旧证据保留、重新签认、仅一次入账 | business/evidence-revision01-report.json PASS |
| 预算成本、监察、权限撤销/恢复双审 | business/reporting01-report.json、access01-report.json PASS |
| 响应丢失幂等重试、UTC/东京业务日期一致、迟到200不恢复旧身份 | resilience-funded/resilience01-report.json PASS；E2E_RESILIENCE_STUDENT=4 |
| 服务、三类专项门槛不扣点、不付现金、采购成本246、退货双审/独立质检、心愿 | commerce-fresh/commerce01-report.json PASS；E2E_COMMERCE_STUDENT=11 |
| 违规申诉、本人通知、独立撤销、抽样 | extended/gov01-report.json PASS |
| 入社身份与钱包不变、转化分阶段补差/冲正 | extended/membership01-report.json、conversion01-report.json PASS |
| 会议专用合并贡献、待比例、主动20释放参与5 | meetings-fresh/meetings01-report.json PASS；E2E_MEETING_STUDENT=14 |
| 积分核对、原裁决回避、新证据复核、翼章/积分独立撤回 | govext-fresh/govext01-report.json PASS；E2E_GOVEXT_STUDENT=13 |
| 恶意URL/HTML仅文本展示 | extended/untrusted-display01-report.json PASS（标明显示字段故障注入） |
| 原重复翼章失败记录复验 | badge-conflict-fixed/v3-badge-boundary-report.json PASS，真实409且无业务权益变化 |
| 31后台URL实际浏览及学生主次页面截图 | closing/inventory.json、v3-audit-report.json |

上述路径均相对 evidence/v3。receipt.json 为最终有效证据清单及逐项数量，不把旧失败或历史G2结果当成本轮通过。

最终汇总：147个API/数据库测试；21份选定浏览器报告共130项PASS；closing目录保存86张最终运行截图。git diff --check、8项health检查及本机密钥泄漏检查均exit0。日志中保留的CRLF换行提示不是测试失败。

主要按钮/数字/辅助文字实测对比度5.41—13.86:1；黄色CTA为9.08:1。图像尺寸及单图100KiB预算自动核验。截图来自构建后的运行页面，不是设计稿；示例和完整索引见 evidence/v3/README.md。页面不会自动标记通知已读。

### 保留的失败记录及原因

- samples-first：服务进程当时不可达；核验并重启已有进程后通过，未重置库。
- samples-assets：构建未完成时启动浏览检查，未取得登录页；构建结束后单独运行通过。
- expanded：43px触控区，已修复并通过。
- expanded-fixed / business首次v3-regression：React Router将/admin/规范化为/admin，测试比较未规范化；修复比较后31入口全通过，没有删除入口断言。
- business首次grow01：学生08已取得翼章；保留历史，核对并用尚未取得的学生09完成全链路。增加明确测试前置检查，不重置翼章。
- business首次resilience：学生15余额不足30；使用经正常成果流程取得积分的学生04完成测试，未补写余额。
- extended首次commerce：学生05本月R020等已有履约记录，月限额正确拒绝；学生11经真实四阶段双审取得资格后完成全链路，没有绕过月限。
- meetings的旧选择器仍访问折叠内容，更新为当前可见“待结算”快捷入口；复跑学生03存在历史待比例记录，主动积分先释放旧候选，不满足测试“本条优先结算”的前置假设。未改结算顺序；核对没有历史候选的学生14完成精确25分流程。
- extended/govext01旧撤销翼章重复颁发503：已按上述第4项修复并追加147项测试。独立撤回正常流程用学生13完整验收；原失败记录仍保留为PENDING，可由现有独立审核流程作出拒绝，未擅自替用户决定。

### 未验证与后续

- 微信开发者工具、真机身份/扫码/上传、iOS/Android真实浏览器未验证。仓库project.config.json仍为touristappid，不能沿用旧交接“已提供AppID”作为已集成事实。
- 正式学校身份、真实权限人员、制度批准、预算和采购库存、云部署/G4未验证；未公开本地服务、未创建云资源。
- 全库跨业务搜索为P2；当前是授权模块搜索+已加载待办搜索。未增加学生/订单敏感数据的全局查询API。
- 活动地点、技能前置、等级阈值、全量本周收益、前序审核人姓名等合同缺项保持明确，不编造。
- 历史翼章撤销后的重获制度尚无明确独立流程；本次只改善原拒绝结果，未来如要支持重获，需独立确定数据/审核规则。
- 个别低频页继续使用已有Drawer/Form；本轮统一视觉与导航，没有无关重写。菜单角色在会话重载后更新，API对象/范围权限每次即时校验。
- H5与weapp保留现有Taro构建的Sass legacy警告；未为消除警告升级核心依赖。

## 交付与恢复

- 基线SHA：16f50543680efcced1eeaf85e55a5c58e8a393e5；本轮提交SHA：未提交，保留工作区差异供审阅。没有推送、发布或创建第二窗口。
- 合同版本/哈希：0.14.0 / 72d571f3f5c7af3b21257b3fde15b370648e4900fd11a798d2006fb25329ae29，未改变合同、数据库结构、比例、积分制度或权限制度。
- 启动沿用node scripts/mysql.mjs、node scripts/demo.mjs；访问学生 http://127.0.0.1:28080/，后台 http://127.0.0.1:28080/admin/。本次只重启经路径/PID校验的本仓API一次以加载错误提示修复，数据库未停止或重置。
- 正式命令日志由scripts/v3-verify.mjs记录exitCode。二维码解码使用本机已有OpenCV4.13；无需安装或付费。
- 本轮真实测试追加了虚构活动、项目、课程、订单、审核和账本；保留这些可追溯记录。权限测试通过独立双审恢复其原范围；不把测试写入伪装成只读。
- 恢复方式：先保留完整差异/素材/证据，再按本日志涉及的文件逐项审阅回退并重建；不要reset --hard或删库。业务测试历史不能靠文件回退抹去；需要纠错时只能走现有取消、冲正或独立审核流程。
