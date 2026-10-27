# 依赖安全范围（本轮实测）

生产依赖`pnpm audit --prod`为0项；完整开发工具审计仍有11项（2critical/5high/4moderate）。不以生产依赖结果覆盖开发工具的剩余风险。

本轮修补了可验证的网络/序列化/路径解析依赖，学生与管理构建采用Vite6.4.5。保留Taro4.2.1业务代码并为旧Sass importer显式选择兼容API；Taro框架插件仍声明Vite4 peer，因此仅将本轮实际构建/浏览器与微信编译作为有界兼容证据。

| 依赖 | 影响与实际路径 | 公告 |
|---|---|---|
| decompress | Taro CLI → download-git-repo → download → decompress；远程模板压缩包解压可能路径穿越。当前项目构建不调用模板下载；此旧包公告无补丁版本。 | [GHSA-h39j-r5qq-r9mm](https://github.com/advisories/GHSA-h39j-r5qq-r9mm), [GHSA-hrh2-vp3x-79xf](https://github.com/advisories/GHSA-hrh2-vp3x-79xf), [GHSA-jwp9-9v96-94mx](https://github.com/advisories/GHSA-jwp9-9v96-94mx), [GHSA-mp2f-45pm-3cg9](https://github.com/advisories/GHSA-mp2f-45pm-3cg9) |
| git-clone | Taro CLI模板创建/克隆链；不可信仓库参数可能命令注入。未用于本轮应用构建。 | [GHSA-8jmw-wjr8-2x66](https://github.com/advisories/GHSA-8jmw-wjr8-2x66) |
| got | 旧模板下载HTTP客户端的跨主版本遗留链，非应用API依赖。未以强行替换下载器来宣称修复。 | [GHSA-pfrx-2q88-qq97](https://github.com/advisories/GHSA-pfrx-2q88-qq97) |
| html-minifier | Taro构建HTML压缩环节，未维护包存在ReDoS；本轮只处理自有源码HTML，不接收远端用户HTML。 | [GHSA-pfq8-rq6v-vf5m](https://github.com/advisories/GHSA-pfq8-rq6v-vf5m) |
| http-cache-semantics | 旧模板下载客户端的共享缓存链；包含尚无上游修补的公告。当前应用运行不提供该缓存服务。 | [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp), [GHSA-rc47-6667-2j5j](https://github.com/advisories/GHSA-rc47-6667-2j5j) |

不要通过该旧CLI获取不可信模板，不将构建/开发服务开放给其他用户。完整解决应在独立升级中维护Taro/下载及压缩工具链，并重新跑现有业务与微信构建门禁；当前不宣称所有安全检查通过。

实际服务本轮只绑定loopback，使用新创建的模拟数据库；没有连接原数据库、真实学生、支付或云账号。
