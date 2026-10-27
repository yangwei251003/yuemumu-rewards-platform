# 本地运行与恢复（实际命令）

本版本使用真实 MySQL、API、学生 H5 和管理网页，仅监听本机。演示身份、库存和附件全部虚构。正式认证、微信真机和腾讯云发布属于后续独立阶段。

## 当前电脑启动

在原项目主目录运行：

```powershell
& .\scripts\start-integration.ps1
```

脚本按锁文件检查依赖，保留本地配置及业务数据，停止本项目旧 API 后迁移、追加式初始化、构建、启动及健康检测，最后打开已登录的 Chrome 学生页和教员页。密码只从本机忽略文件读取，不需要粘贴到对话或 URL。

学生：http://127.0.0.1:28080/ ；管理：http://127.0.0.1:28080/admin/ ；移动领取：http://127.0.0.1:28080/admin/pickup/ 。

已有构建只需恢复运行时，在主目录依次运行 `pnpm db:start`、`pnpm demo`、`pnpm health`、`pnpm demo:open`。代码升级后使用完整启动脚本，避免旧 API 继续运行。

## 工作树

| 用途 | 绝对路径 / 分支 | 启动方式 | 数据库 / 网关 |
|---|---|---|---|
| A | `[PROJECT_ROOT]` / `feat/platform-g1` | `& .\scripts\start-local.ps1 -Profile a` | `ym_dev_a` / 8080 |
| B | `[PROJECT_ROOT]` / `feat/frontend-g1` | `& .\scripts\start-local.ps1 -Profile b` | `ym_dev_b` / 18080 |
| 主集成 | 原项目目录 / `main` | `& .\scripts\start-integration.ps1` | `ym_integration` / 28080 |

B 已在指定任务启动，无须另建窗口。各工作树的 `.runtime/config.json` 包含独立密码、端口及 Cookie 命名空间，不能互相复制或提交。Profile 不符时脚本拒绝覆盖。

## 数据保留与实际检查

`pnpm demo:stop` 只停止核实属于本项目的 API / 网关，保留数据库。重复迁移检查内容哈希；重复 seed 不再发积分、不重置订单、不复活已撤销的权限范围。演示操作会真实改变模拟余额，因此不能假定 S001 每次都是 860 分。

可运行 `pnpm health`、`pnpm contract:check`、`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm build:weapp` 和 `node scripts/check-secrets.mjs`。测试追加隔离虚构身份，只能用于本地模拟数据库。实际证据保存在 `evidence/`，各阶段状态见 `coordination/gates/`。

## 备份与恢复演练

仅在主集成目录执行：

```powershell
node scripts/backup-restore.mjs
node scripts/restart-check.mjs
```

第一条读取一致快照（全部表、结构、行哈希和私有 BLOB），保存到 Git 忽略的 `.runtime/backups/`，再恢复到随机命名的全新 `ym_restore_*` 库，逐表核对和检查业务不变量。不会覆盖或删除当前库。日志给出编号，可用 `node scripts/backup-restore.mjs --restore <备份编号>` 再恢复到另一个新库。私有备份不能上传或提交。

第二条停止当前演示应用并实际重启独立 MySQL 3310，重复迁移及两次 seed，比较已提交数据后恢复应用；演练期间本机服务短暂不可用。不要在 A/B 配置中执行这两条主集成专用演练命令。

没有数据库删除/重置或公网隧道入口。恢复失败时保留原库、备份和新恢复库，依据真实报告诊断，不清空数据。

## 发布边界

微信目标编译不代替开发者工具和真机身份、扫码、上传验证。当前只交付同机演示，不产生云资源费用，不接受 APP_MODE=production 运行，不能称作生产发布包。
