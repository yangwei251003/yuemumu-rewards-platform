# 两窗口协作与交付门

## 分工
A=平台/后端/运行/集成，B=所有客户端/视觉/交互/E2E。不是把完整项目交给两个人各造一遍。代码归属见AGENTS；应用只有学生、运营网页、API，移动核销是运营网页一个路由。

## G0：A单独完成后才能开B
A检查宿主系统、工具与网络，创建/检查本地Git，解析资料，锁定依赖，启动真实MySQL，建立API和两端最小可构建壳。
必须完成真实demo登录（含访问保护）、RBAC、GET本人/wallet/ledger、GET奖励列表、追加/冲正基础函数及测试、数据库迁移、初始种子、安全配置、完整初始OpenAPI、两个transport至少烟测、合同校验/SDK生成、健康检测、网关路由。
`node scripts/validate-kit.mjs`通过只表示资料完整，不能冒充G0。A需新写 `coordination/gates/G0.json`，包含ready=true、真实基线SHA、合同SHA256、测试命令/退出码、运行入口和前端worktree绝对路径。模板始终ready=false。
在G0提交后生成不可变集成tag（如integration/g0）并建立B分支。A可继续后端独立模块，不能再编辑B拥有的UI目录。

## 工作树与同步（本地Git即可）
参考流程由A根据真实目录安全执行，不让用户手动猜：
1. 主目录为集成基线main；A开发在单独platform worktree/分支，B在frontend worktree/分支。主目录可以成为A运行集成命令的只写受控位置，不启动第三聊天窗口。
2. G0前检查未提交改动，先保存明确属于本任务的文件，不使用git add .盲收私密材料。
3. `git worktree add -b feat/frontend-g1 ../yuemumu-frontend integration/g0`；若已存在路径或分支则复用/报告，绝不强制覆盖。
4. 两个窗口的源文件不自动同步。B读取本地Git中A已提交的状态：`git show main:coordination/BOARD.md`，或远程origin/main；从已发布集成基线更新，不能读另一个窗口未提交的半成品。
5. A每次只合并一个已完成提交组，默认普通merge；不同时采用cherry-pick复制相同提交。B在干净工作树确认后合并新的integration tag；不擅自rebase另一个正在写的分支。
6. 公共锁文件/合同由A单写。B在交接请求中列需要的依赖/字段和理由；A在短合同变更PR处理。B先做不依赖该变更的页面/测试，不无限等待。
7. 根目录CODEOWNERS只是说明，不等于自动强制；A增加changed-path检查。只有GitHub计划与仓库权限支持时才启用相应保护，不把付费功能当必需。

## 环境隔离
A开发库`ym_dev_a`，B验证库`ym_dev_b`，最终集成库`ym_integration`。可共用一个本地MySQL服务但不是同一个schema，不能共享`DATABASE_URL`。A负责迁移，B基于已提交版本执行到自己的库，重置只影响自己的库。
默认A API 3100，B自己的验证API 3101；A演示网关8080，B预览18080；按占用检测调整并写本机.runtime配置。Docker project name、卷、上传路径、Cookie命名空间/host、seedName亦隔离；不同端口不会隔离Cookie。B无需永远依赖A电脑上的热重载服务；可以用已提交API构建运行自己的验收环境。

## G1—G4
| 门 | A | B | 合并与证据 |
|---|---|---|---|
| G1 首条闭环 | 活动/签到/审核/积分/实物订单/核销 | 对应三端页面，真实接口，第一套图片 | 报名→验收→得分→兑换→核销→对账E2E |
| G2 教员演示候选 | 项目/竞赛/违规/申诉/抽查/通知/数据、Demo脚本 | 全部承诺模块、27奖励图、管理交互、移动适配 | 完整演示脚本、并发/权限/恢复、截图、无P0/P1 |
| G3 生产化验证 | 移除Demo能力、正式认证适配、迁移审计、运维 | 微信构建及实际设备验证、无模拟文案误导 | 正式样式本地运行≠微信/真实身份已测试；缺凭据标阻塞 |
| G4 教员批准后云试运行 | 腾讯云预检、迁移、备份、部署、验收 | 云端域名/小程序能力、真实奖励验收 | 人工主体/费用/密钥/备案前置完成后才能执行 |

同一阶段可A/B并行，门与门不等于所有任务都串行。A提前一个接口小切片，B跟随已冻结接口开发，不等A写完全部后端。每个小切片都真实接通，不在末尾一次性联调。

## 内部子代理
默认每个窗口同一时刻至多2个短任务子代理；优先只读安全审查、测试规划、资料核验。写入子代理必须分离目录或worktree并明确父级owner，同一文件不能多写。模型额度、电脑资源不足就主动减少并行，不能循环重试消耗额度。两个主窗口均承担自身测试，相互交叉审查不是独立第三方安全认证。

## 消息模板
每次handoff写：任务ID、from/to、baseSHA、commitSHA、contractVersion+SHA、ownedPaths、testCommands/exitCodes、evidence、API运行模式、DB schema、数据重置影响、blockedCapabilities、下一步。A更新BOARD的接口能力表：DRAFT/IMPLEMENTED/VERIFIED；B不能把DRAFT接口当已部署。
会话中断后用 `prompts/RECOVER_SESSION.md`，从文件恢复，不依赖模型记得上一聊天。
