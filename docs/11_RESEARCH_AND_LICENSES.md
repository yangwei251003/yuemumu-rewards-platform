# 核验来源与依赖研究
检索日期：2026-09-05。本文是技术选型依据与待核验清单，不是对用户电脑、账号权限或第三方服务可用性的保证。

## 已核验的关键事实
- [R01] OpenAI公布GPT-6 Astra，逐步开放；官方帮助页提示Astra的Codex CLI需0.153.0或更新。实际模型以用户选择器和账号权限为准，不把模型名写死在项目运行代码。
- [R02] Codex worktree为同一Git仓库的隔离检出，线程不是共享聊天记忆；提交才形成可同步基线。
- [R03] Codex支持子代理，但更多代理消耗更多额度，官方建议从读密集任务开始，对并行写入谨慎。
- [R04] AGENTS.md由Codex读取，根目录应简洁，详细业务放文档按需读，不用把几十页全部塞入提示词。
- [R05] Taro提供H5与小程序构建目标，不意味着所有浏览器/微信原生API行为相同。
- [R06] Docker Desktop免费使用有主体和用途条件；学校/企业安装前须核对许可与Windows/WSL要求。
- [R07] Cloudflare Quick Tunnel面向测试，无SLA，当前200在途请求、不支持SSE，不能当正式托管。
- [R08] NestJS官方支持OpenAPI；本项目选择合同优先，不能同时维护两套彼此漂移的规范。
- [R09] openapi-typescript可从OpenAPI生成TypeScript类型；这不是运行时验证器。
- [R10] MySQL InnoDB提供锁定读能力；正确性还需事务、约束、锁顺序和实测。
- [R11] Git worktree是本地Git能力，不要求先购买GitHub或云服务。

## 原始来源
R01 https://openai.com/index/gpt-6-astra/ ; https://help.openai.com/en/articles/20001354
R02 https://developers.openai.com/codex/app/worktrees
R03 https://developers.openai.com/codex/multi-agent
R04 https://developers.openai.com/codex/guides/agents-md
R05 https://docs.taro.zone/docs/GETTING-STARTED ; https://github.com/NervJS/taro
R06 https://docs.docker.com/desktop/setup/install/windows-install/ ; https://docs.docker.com/subscription/desktop-license/
R07 https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/
R08 https://docs.nestjs.com/openapi/introduction
R09 https://openapi-ts.dev/introduction
R10 https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html
R11 https://git-scm.com/docs/git-worktree.html

## 开源参考的采用边界
| 参考 | 价值 | 本轮决定 |
|---|---|---|
| NervJS/taro（已读取官方README） | H5/小程序跨端骨架 | 默认学生框架，版本兼容由A实测 |
| ant-design/pro-components（已读取官方README） | 后台表格、表单、审批等组件 | 默认后台候选，按需使用，注意体积 |
| openapi-typescript（已读官方文档） | 契约生成类型 | 默认契约工具候选，不误当运行时验证 |
| taroify/taroify | 移动Taro组件 | 候选，必须先复核兼容版本/许可证，不强依赖 |
| trophyso/ui | 成就、成长等交互参考 | 候选，不直接将Web组件装入Taro |

本轮没有证明任何现成开源积分系统满足本校审批/追缴/线下核销规则，不直接fork整套商城后宣称安全。选择依赖时检查原仓库LICENSE、最近release/issues、安全公告和实际代码；README营销话术与Star数不是质量证明。需要复制的代码/图片分别核许可，保留NOTICE。候选的未核验部分保持待核验。

腾讯云具体MySQL引擎、连接方式和费用需在迁移阶段再次用官方文档及账户控制台验证；本轮访问部分旧链接失败，未将其作为已验证兼容性证据。不得拿其他产品如微搭私有部署的限制误当本系统CloudBase规格。
