# 本地运行和验证脚本

要求：本机已有受支持的Node.js。脚本无第三方依赖，不需要先`pnpm install`。

```sh
node scripts/validate-kit.mjs
node scripts/preflight.mjs
```

第一个检查资料及JSON引用，不能代替产品测试。第二个只读探测宿主机与本地端口，将报告写入被忽略的`.local/`。这两个资料脚本不会安装依赖、连接云、读取密钥、删除业务数据或开启公网。

产品脚本已经实现：主集成用 `start-integration.ps1`；A/B 分别用 `start-local.ps1 -Profile a|b`。它们需要现有 Node 24 / pnpm / 原生 MySQL，执行真实依赖检查、迁移、保留式 seed、构建、启动与健康检查。`pnpm demo:stop` 保留数据库。

`backup-restore.mjs` 把一致快照恢复到新库；`restart-check.mjs` 实际重启独立集成 MySQL；两者仅允许主集成配置。`performance.mjs` 测本机 20 会话和冷启动。`reconciliation-check.ts` 使用应用数据库权限分页检查模拟用户的账本、钱包及批次，正常 exit 0，差异 exit 2，执行失败 exit 1；检测不修余额。

详细步骤见 `docs/09_RUN_DEMO_AND_RECOVERY.md`。秘密只存在本机忽略文件，日志、截图与交接不得记录密码、会话码或完整领取凭证。
