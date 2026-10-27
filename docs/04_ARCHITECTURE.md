# 技术架构与约束

## 默认选型（A在G0做版本兼容烟测并锁定）
| 部分 | 选型 | 原因 |
|---|---|---|
| 学生端 | Taro + React + TypeScript + Sass | 同一业务目标H5/weapp，浏览器与微信能力做适配 |
| 管理与核销 | React + Vite + Ant Design/ProComponents + React Router | 没有SEO/SSR需求，减少Next服务、子路径和部署复杂度 |
| API | NestJS + TypeScript | 模块化单体，统一验证、鉴权、日志 |
| 数据 | MySQL 8.4 LTS系列候选 + Drizzle/mysql2 | 真实关系事务；启动时锁定可用补丁版本和镜像digest |
| 合同 | OpenAPI 3.x + 生成TS类型 + 自建小型transport | Taro.request与Web fetch分别适配，不假设fetch客户端能直接跑小程序 |
| 存储 | 本地受控目录 + 元数据表 | 不先引入MinIO，减少Docker进程和维护；后续对象存储适配 |
| 任务 | MySQL outbox + 同代码包worker | 到期/通知/对账可重试，不以浏览器定时器执行业务 |
| 本地入口 | Caddy或等效固定反向代理 | `/`、`/admin/`、`/api/v1/`共享来源 |
| 工具 | pnpm workspace；Vitest/后端测试框架+Playwright | 版本固定、冻结安装；不强制额外Turborepo/Redis/K8s |

本轮把Next.js后台简化为Vite，不牺牲后台功能。若发现已有可运行Next项目，不为换框架而推倒：A写ADR维持已有实现和basePath约定。不得同时安装两套后台UI体系。
Taro多端支持有官方说明，但扫码、相机、文件、通知、登录、路由并非天然同等可用，必须分别适配并验证。[R05]

## 目录
`apps/api`；`apps/student`；`apps/ops`；`packages/contracts`；`packages/sdk`；`packages/db`；`packages/domain`；`packages/design-tokens`；`infra/local`；`infra/tencent`；`tests/api`；`tests/integration`；`tests/e2e`；`tests/visual`。
共享的是契约、领域纯函数和设计令牌，不共享依赖DOM的组件给Taro。

## 开发与演示运行
开发可用源码服务器；教员演示必须使用已构建H5/后台静态文件和API运行包，避免把HMR、源码地图、开发插件暴露公网。网关路径：
- `/api/v1/*`原样转发API，不剥掉前缀；`/api/docs`默认本机且需权限。
- `/admin/*`映射后台静态目录，Vite base=`/admin/`，Router basename=`/admin`。
- `/`映射学生H5。禁止其history fallback吞掉/api的404/401。
- `/media/public/*`仅审核过的公开素材；`/api/v1/files/{id}/download`走授权验证。
分别测试带尾斜线、刷新深路由、图片路径、下载、错误页和移动端分享链接。

默认监听127.0.0.1；局域网分享需授权并仅开放网关。MySQL不暴露0.0.0.0；Docker仅必要时映射到127.0.0.1。应用使用最小权限DB用户，迁移单独凭据。

## Provider与模式
Auth拆开：学生demo/wechat，职员local密码/MFA预留。微信只负责证明外部身份，后端会话与业务userId保持自有映射。H5演示不能假装已通过微信真机认证。
Storage接口至少put/get/delete/stat/createAuthorizedRead；数据库保存storageKey而非临时签名URL。公开奖品图和私有证据分桶/分目录、分权限。
Notification的站内消息先写入数据库；外部微信消息通过outbox异步发送，失败不回滚已发积分。
StudentIdentity分别demo/CSV/未来学校SSO。SSO缺失不阻塞演示；正式CSV由授权人导入。
`APP_MODE=demo|pilot|production`与`NODE_ENV`独立。Demo的production构建可以演示；APP_MODE=production发现Demo provider、弱secret、demo数据标记必须拒绝启动。

## 本地与云端数据库
本地始终使用真实MySQL，不用SQLite/内存数组代替事务验证。Docker不可用时优先现有MySQL服务或官方原生MySQL；不能以自动降级数据库掩盖阻塞。Node/mysql2必须兼容目标认证和TLS。
腾讯云目标引擎、直连方式、版本、数据库权限、迁移DDL限制未在本账号确认，不宣称与本地完全一致。上线前跑兼容性、备份恢复、字符集/排序、UTC、SQL mode、事务隔离测试；必要时采用腾讯云托管MySQL与云托管组合，并经费用批准。

## 事务与任务
核心业务在同一MySQL事务内写订单/钱包/批次/库存/审计/待发通知。统一锁顺序，必要时用行锁及条件更新；死锁有有界重试。外部网络调用不放在事务内。outbox采用至少一次投递+幂等消费，不能宣称跨系统绝对exactly-once。
余额投影仅在事务中更新；定期重算只检查差异，发现差异报警并阻断危险写入，修复必须审计而不是覆盖账本。
