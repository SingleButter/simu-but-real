# 开发阶段计划

本文档用于记录 Simu but Real 从 MVP 到完整平台的阶段拆分。每个阶段都应该能形成一次可验证的提交或部署。

## Phase 0: 项目地基

状态：已完成

目标：

- 确定产品名和仓库名。
- 初始化 Next.js + TypeScript 项目。
- 建立 Java 训练模板。
- 推送平台代码到 GitHub。

已完成内容：

- 产品名：`Simu but Real`
- 平台仓库：`SingleButter/simu-but-real`
- 工程目录：`/Users/wzuning/Develop/simu-but-real`
- Java 模板：`templates/java-task-api`

## Phase 1: MVP 平台界面

状态：已完成

目标：

- 搭建平台工作台。
- 展示任务、PR 状态、CI 状态、成长记录。
- 用 mock 数据快速验证产品体验。

已完成页面：

- 首页工作台。
- 入门测评。
- 任务详情。
- Review。
- Progress。
- Settings。

## Phase 2: 数据库和登录

状态：已完成

目标：

- 用 PostgreSQL 保存用户、任务、仓库、PR 和进度数据。
- 接入 GitHub OAuth。
- 为真实登录用户分配 starter task。

已完成内容：

- Prisma schema。
- PostgreSQL Docker 环境。
- seed 数据。
- GitHub OAuth 登录。
- 登录后自动创建用户。
- 登录用户首次任务分配。

## Phase 3: 真实训练仓库

状态：已完成手动版，未完成自动化版

目标：

- 创建真实 GitHub 训练仓库。
- 推送 Java 模板。
- 创建任务分支。
- 配置 GitHub Actions。

当前已完成：

- 手动创建私有训练仓库：

```text
SingleButter/sbr-java-task-api-singlebutter
```

- 推送 `main` 和 `task/validate-task-status`。
- GitHub Actions 已通过。

后续自动化目标：

- 平台通过 GitHub App 创建仓库。
- 平台自动复制模板并推送初始 commit。
- 平台自动创建任务分支。
- 数据库记录真实 GitHub 仓库、分支和 PR URL。

## Phase 4: 用户完成第一轮真实任务

状态：已完成

目标：

- 用户 clone 真实训练仓库。
- 用户在任务分支上本地开发。
- 用户补测试并实现代码。
- 用户 push 分支并创建 PR。
- GitHub Actions 跑 CI。

验收标准：

- 用户能完整执行：

```bash
git clone git@github.com:SingleButter/sbr-java-task-api-singlebutter.git
cd sbr-java-task-api-singlebutter
git checkout task/validate-task-status
mvn test
```

- 用户提交的 PR 能触发 GitHub Actions。
- CI 状态可以被人工或平台读取。

完成记录：

- PR：`https://github.com/SingleButter/sbr-java-task-api-singlebutter/pull/1`
- 标题：`fix: validate completed task status transitions`
- 合并时间：`2026-05-19 12:35:48 Asia/Shanghai`
- 用户本地训练仓库 `main` 已同步。

## Phase 5: GitHub Webhook 状态同步

状态：进行中

目标：

- 接收 GitHub webhook。
- 同步 PR 创建、push、CI 状态变化。
- 将 PR 状态展示在平台页面。

需要实现：

- GitHub App 或 webhook secret。第一版 secret 校验已实现。
- 本地开发临时公网地址。
- `app/api/github/webhook/route.ts` 的真实事件处理。第一版已支持 PR 和 CI 事件。
- PullRequestRecord 状态更新。第一版已实现 PR 编号、URL、状态、CI 状态和同步时间更新。
- 本地 fixture replay。已支持 `opened -> CI passed -> merged` 流程回放。
- 真实 webhook 连接。已通过 Cloudflare Tunnel 配置训练仓库 webhook，并确认 GitHub `ping` delivery 返回 `200`。
- 平台侧实现已通过 `https://github.com/SingleButter/simu-but-real/pull/1` 合并到 `main`，合并提交为 `bccce4a`。

关键事件：

- `pull_request`
- `check_suite`
- `check_run`
- `workflow_run`

## Phase 6: AI Review Agent

状态：未开始

目标：

- 读取 PR diff。
- 结合任务验收标准、允许修改范围和测试要求做 Review。
- 给出通过、需要修改或阻塞的结论。
- 将 Review 结果写回平台，后续可写回 GitHub PR comment。

需要实现：

- LLM API 调用层。
- Review prompt 模板。
- PR diff 获取。
- ReviewResult 入库。
- Review 页面展示真实结果。

Review 重点：

- 是否满足验收标准。
- 是否补充测试。
- 是否修改了不允许范围。
- 是否引入回归。
- 是否过度实现。

## Phase 7: 自动任务分配和能力画像

状态：未开始

目标：

- 根据用户完成情况动态调整任务难度。
- 记录 CI 失败、Review 修改、PR 通过率。
- 生成下一任务。

需要实现：

- 能力指标模型。
- 任务模板库。
- 分配策略。
- 任务完成后的等级更新。

## Phase 8: 多人协作和冲突训练

状态：未开始

目标：

- 模拟多人协作中的 main 更新、分支落后和冲突解决。
- 训练用户同步 main、rebase、解决冲突、重新跑测试。

训练场景：

- 别人的 PR 先合并导致接口变化。
- 用户分支 rebase 后出现冲突。
- CI 因 main 更新后规则变化而失败。
- Review Agent 检查冲突解决是否误删代码。

## Phase 9: 组织级托管和产品化

状态：未开始

目标：

- 使用 GitHub Organization 托管训练仓库。
- 建立权限隔离。
- 支持多个用户并发训练。
- 支持部署和长期运行。

需要实现：

- GitHub Organization 配置。
- GitHub App 安装流程。
- 队列和 worker。
- 生产数据库。
- 日志、监控和失败重试。
