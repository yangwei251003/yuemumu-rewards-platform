# V4 本轮验证索引

最终代码：`7eb322d16efc3ee4615c866928c3b4ad58b75dcd`。合同0.15.0：`ce177a7b0e142081c8be4064071f1354690d9971baeb1be7e922a7bbe392321e`。Node v24.15.0。两环境构建内容哈希一致。

| 验证组 | 退出码 | 浏览器断言组 | 本轮命令与完整证据 |
|---|---:|---:|---|
| api-final | 0 | — | [2026-09-06T15-41-56-760Z-api-final.json]([PROJECT_ROOT]) |
| flow01-fixed | 0 | 8 | [2026-09-06T14-48-11-938Z-flow01-fixed.json]([PROJECT_ROOT]) |
| flow02-opencv | 0 | 7 | [2026-09-06T14-51-31-719Z-flow02-opencv.json]([PROJECT_ROOT]) |
| grow01 | 0 | 7 | [2026-09-06T14-37-19-171Z-grow01.json]([PROJECT_ROOT]) |
| evidence-flow-r2 | 0 | 3 | [2026-09-06T14-30-48-224Z-evidence-flow-r2.json]([PROJECT_ROOT]) |
| pickup-race-r3 | 0 | 3 | [2026-09-06T15-04-07-491Z-pickup-race-r3.json]([PROJECT_ROOT]) |
| resilience-r3 | 0 | 8 | [2026-09-06T15-10-11-857Z-resilience-r3.json]([PROJECT_ROOT]) |
| membership-r2 | 0 | 4 | [2026-09-06T15-12-55-321Z-membership-r2.json]([PROJECT_ROOT]) |
| management | 0 | 9 | [2026-09-06T15-14-54-064Z-management.json]([PROJECT_ROOT]) |
| meetings | 0 | 6 | [2026-09-06T15-19-01-945Z-meetings.json]([PROJECT_ROOT]) |
| gov | 0 | 8 | [2026-09-06T15-30-40-923Z-gov.json]([PROJECT_ROOT]) |
| commerce-r3 | 0 | 9 | [2026-09-06T15-32-25-223Z-commerce-r3.json]([PROJECT_ROOT]) |
| private-files-r2 | 0 | 9 | [2026-09-06T15-44-08-713Z-private-files-r2.json]([PROJECT_ROOT]) |
| navigation-review-r5 | 0 | 3 | [2026-09-06T15-24-04-704Z-navigation-review-r5.json]([PROJECT_ROOT]) |
| scroll-accepted | 0 | 3 | [2026-09-06T16-28-11-448Z-scroll-accepted.json]([PROJECT_ROOT]) |
| h5-keyboard-r2 | 0 | — | [2026-09-06T16-26-30-962Z-h5-keyboard-r2.json]([PROJECT_ROOT]) |
| checks-accepted | 0 | — | [2026-09-06T15-54-20-899Z-checks-accepted.json]([PROJECT_ROOT]) |
| lint-accepted | 0 | — | [2026-09-06T15-54-39-069Z-lint-accepted.json]([PROJECT_ROOT]) |
| weapp-accepted | 0 | — | [2026-09-06T16-28-21-701Z-weapp-accepted.json]([PROJECT_ROOT]) |

API最终合并执行107项通过；不要与早期95项及12项结果重复累加。浏览器数字为对应报告的断言组，包含流程、失败和布局检查，不能解读为独立用户数。

运行JSON保存命令和退出码，同名.log保存输出，-screens目录保存截图及浏览器报告。更早失败全部保留；早期轮次未记录逐次源码SHA，不能宣称所有早期浏览器流程在最终提交上重跑。新增导航/隐私修正由后续专项复测及最终展示审查验证。