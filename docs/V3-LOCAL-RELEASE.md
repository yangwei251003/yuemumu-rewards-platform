# V3 教员本机演示版交付

- 发布标识：`v3-teacher-demo-20260906`，对应本地 Git 同名标签。基线 `16f50543680efcced1eeaf85e55a5c58e8a393e5`。
- 实际交付目录：`[PROJECT_ROOT]`。这是原系统的指导书和本机快捷入口，不是独立安装包。
- HTML、V3 PDF、学生首页截图、启动说明与启动器已同步；10个交付文件逐一通过 SHA-256 比对，见 `docs/design/teacher-guide/release-manifest.json`。
- 旧 PDF 被占用，未强行关闭阅读器或删除文件。当前请使用 `粤木木系统使用指导书-V3.pdf`；不带 V3 的旧 PDF 不再分发。最初完整旧包备份位于同级 `.backup-2026-09-06T12-56-38-461Z` 目录。
- 启动器恢复已有 MySQL/API/网关，不重新安装、运行种子或清库。此次最初健康检查遇到 API 503，恢复既有 MySQL 后8项健康检查全部通过（exit 0）。
- `node scripts/v3-teacher-package.mjs`：exit 0；Chrome 打开外部交付目录的指南，检查8个章节、图像加载、V3内容及后台链接；PDF生成成功。未安装额外 PDF 解析库；独立 PDF 解析尝试因本机缺少 fitz 未执行成功，不计为通过。
- `node scripts/check-secrets.mjs`：exit 0；`pnpm lint`：exit 0。完整功能证据仍为 `evidence/v3/receipt.json` 的147项 API/数据库与130项浏览器检查。
- 原 `receipt.json` 是提交前验收快照，其中“未提交”描述只对应生成时点；本次交付以 Git 标签解析出的提交为准。
- 项目资料中的 GitHub 仓库 `yangwei251003/ymm` 已核实为空白公开仓库，当前没有 Git remote。公开上传源码/历史需单独确认，本次本机交付不声称已推送远端或上线公网/微信。
- 恢复：先关闭占用的阅读器，再按需从上述备份复制单个指南文件；代码通过审阅后反向提交恢复，不删除真实数据库或重置工作树。
