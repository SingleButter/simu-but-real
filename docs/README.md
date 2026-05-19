# Simu but Real 文档中心

这个目录用于沉淀 Simu but Real 的产品需求、企业开发流程、开发进度和阶段计划。后续每次完成一个阶段，都优先更新这里，再同步 README 或页面文案。

## 文档索引

- [产品需求文档](./product-requirements.md)
  - 项目背景、目标用户、核心价值、MVP 范围、关键产品决策。
- [企业开发流程](./enterprise-workflow.md)
  - 平台要模拟的真实企业协作流程：任务分配、开发、测试、PR、CI、Review、合并。
- [当前开发进度](./development-progress.md)
  - 已完成能力、真实仓库状态、验证结果、已知限制。
- [开发阶段计划](./development-roadmap.md)
  - 从 MVP 到 GitHub App、AI Review、多人协作训练的阶段拆分。
- [GitHub Webhook 本地验证](./webhook-local-testing.md)
  - Phase 5 第一版 webhook 状态同步的 fixture 回放和真实 GitHub 接入步骤。

## 维护原则

- 已实现能力和计划中能力要分开写，不把设想写成既成事实。
- 涉及外部服务的状态要写明具体仓库、分支和日期。
- 文档以中文为主，代码、命令、路径和 GitHub 标识保持英文原文。
- 每次阶段性提交前，更新 `development-progress.md`。
