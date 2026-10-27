# G0 实施决定与实测边界

## 资料定位

用户指定当前目录起初为空，无 Git、无 prompts。实际找到 `[PROJECT_ROOT]`，完整复制到当前项目；使用 `[PROJECT_ROOT]` 替换资料包示例。保留原送审资料。已填写的协会名为竞野穿越机俱乐部，领取地点为学院粤木木企业二楼前台；旧上下文差异按最新填写资料处理。

## ADR-001：复用本机原生 MySQL，独立实例

实际环境为 Windows、Node 24.15.0、pnpm 10.33.2、Git 2.55.0、MySQL Community 8.0.41，内存约15.3GB，磁盘剩余约173GB。未检测到 Docker CLI；现有 MySQL80 服务运行于3306。复用既有官方 mysqld 程序，创建用户级专用数据目录与3308/3309实例；无需安装系统级组件或读取现有数据库凭据。MySQL 8.4候选调整为已可用的8.0.41，未来云迁移须单独验证。

初始化文件移到 ASCII 用户运行目录，解决 MySQL Windows 对中文路径引导文件的读取失败。初始化时网络尚未启动，首次服务启动通过 init-file 设置随机 root 密码，成功后删除引导文件。应用与迁移账号分离，应用无 DDL/DELETE，UPDATE 只允许 sessions/wallets/point_lots；账本、审核决定和审计只追加。

## ADR-002：数据库与领域边界

Drizzle 提供类型化用户/钱包查询及表映射，mysql2 同一连接执行显式锁和事务。迁移为顺序 SQL＋数据库 SHA256 台账，发现已应用迁移漂移即拒绝；不静默重建数据库。MySQL DDL非全事务，第一次迁移若被中断须检查台账和表状态后人工/工程恢复，脚本不擅自DROP现有表。

真实并发测试发现 REPEATABLE READ 的旧快照会与等待后的锁定钱包不一致。因此领域事务采用 READ COMMITTED＋单用户钱包行锁＋业务唯一约束＋请求主体/操作/键唯一约束；死锁/锁超时/并发重复键最多重试2次。相同请求键不同来源409，同成果不同键不重复入账。积分数值来自数据库中已双审的来源，前端不传分数；追加与冲正目前仅作为受控领域函数，没有开放手工改余额API。

人工来源和冲正均需两位独立自然人批准；发起人、受益人和直接利益人回避。同人不同角色/账号不能重复计数。冲正保留原始账，未使用批次回退，已使用部分登记recoveryDue。合法成长与消费分离。种子先追加1240分/里程，再追加380分历史消费，形成860/1240，不直接写余额。测试夹具使用独立 TEST_ 标识，不能通过 Demo 登录；不会改动模拟学生01的历史基线。

## ADR-003：统一合同和会话

OpenAPI 3.0.3 是字段唯一来源；openapi-typescript生成DTO，操作映射自动生成，Ajv按同一合同校验请求/分页和关键响应。补齐CSRF字段与会话恢复接口。健康和登录不要求已有会话。不同浏览器用途选择不同HttpOnly/SameSite=Strict Cookie；名字含A/B及工作树标识。学生bearer用于Taro transport边界烟测，不代表微信认证完成。

Cookie写入须CSRF，登录及写入检查Origin，拒绝非Bearer授权头，防止无关Authorization头绕过CSRF。会话在MySQL中持久化，注销/到期/账号停用与角色撤销服务端生效。密码用随机盐scrypt；密钥和口令仅在忽略的本机配置，不放日志。当前只有demo provider，APP_MODE非demo直接拒绝，包含production；NODE_ENV=production允许运行已构建的本地demo。

## ADR-004：客户端与安全修复版本

Taro4.2.1＋React18学生端，Vite/AntD后台。Taro按官方配置保留H5与weapp构建；Vite runner要求显式shared/Babel插件依赖，已通过真实构建验证。后台router升级到已修复的7.x，所用BrowserRouter接口保持兼容。依赖审计驱动更新Nest11、mysql2、Drizzle、Ajv及路由，并对Taro传递依赖中swiper、esbuild和Babel等使用已修复锁定版本；最终以lock和真实构建/测试为准。未使用swiper页面不等于可以忽略可更新的关键漏洞。

使用本地固定网关服务构建产物，API前缀独立，未知API返回JSON错误而非首页；深路由返回对应客户端壳。后台首次包体较大，报告构建警告，G1/B可按路由拆包；本轮无公网开发服务器，不把G0称为生产性能验收。

## 范围

G0已验范围以gate与日志为准。活动、审批工作流、订单、核销、项目、竞赛、申诉、文件与图片等后续模块仍在能力表标DRAFT。小程序只验构建与transport适配边界，不宣称微信真机、合法主体或云上线成功。原规则的50/300、团队4倍及DRAFT_FOR_DEMO状态保持不变。

官方参考（开发时读取）：[Nest环境要求](https://docs.nestjs.com/first-steps)、[Taro构建配置](https://docs.taro.zone/docs/config-detail/)、[Taro H5](https://docs.taro.zone/docs/h5)、[Drizzle MySQL连接](https://orm.drizzle.team/docs/mysql/get-started-mysql)。
