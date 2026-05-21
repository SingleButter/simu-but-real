# 产品需求文档

## 项目概述

Simu but Real 是一个面向 Java 后端求职新人和初级开发者的企业开发流程模拟平台。

项目的核心观点是：AI 可以承担大量代码生产工作，但初级程序员仍然需要通过真实工程流程训练基础代码能力、Git 协作能力、测试意识、CI 排错能力和 PR Review 沟通能力。平台不追求让 AI 替用户完成所有代码，而是让 AI 扮演企业里的 mentor、planner、reviewer 和 CI 守门员，让用户在受控任务中成长。

## 背景痛点

- AI 出现后，公司更倾向招聘能使用 AI 的中高级程序员，初级岗位机会减少。
- 初级开发者缺少进入企业后通过简单任务逐步成长的环境。
- 普通 vibe coding 流程中，用户给出目标后 AI 直接完成大部分代码，容易导致初级开发者过度依赖 AI。
- 很多新人没有经历过真实企业开发流程，不熟悉 Git 分支、PR、CI、Review、冲突解决等日常协作方式。

## 目标用户

- 准备求职的 Java 后端新人。
- 有基础语法能力，但缺少企业项目经验的初级开发者。
- 想训练 GitHub PR、CI、Review 流程的开发者。
- 想学习如何和 AI mentor 协作，而不是完全交给 AI 代写代码的人。

## 核心目标

1. 模拟真实企业开发流程，让用户体验从接任务到 PR 合并的完整闭环。
2. 让 AI 根据用户能力分配低风险、可控范围的任务。
3. 要求用户亲自完成一部分真实代码和测试，而不是只描述需求。
4. 用 GitHub 仓库、分支、PR、Actions CI 和 Review 作为主流程载体。
5. 通过任务结果、CI 失败、Review 修改记录更新用户能力画像。

## MVP 范围

当前 MVP 聚焦 Java 后端新人训练，范围包括：

- Next.js + TypeScript 平台主应用。
- GitHub OAuth 登录。
- PostgreSQL + Prisma 数据模型。
- 工作台、入门测评、任务详情、PR Review、成长记录页面。
- 登录用户首次进入后自动分配第一个 Java 任务。
- Java 21 + Spring Boot + Maven 训练项目模板。
- Dev Container 推荐开发环境。
- GitHub Actions CI 模板。
- 手动创建真实 GitHub 训练仓库，并推送 Java 模板。
- GitHub Webhook 第一版状态同步，支持真实 PR 和 CI 状态同步到平台。
- DeepSeek Review Agent 第一版，支持读取 PR diff、生成结构化 review 并展示在平台 `/review` 页面。
- 工作台 pipeline 拆分为 `已领取 -> 本地开发 -> CI -> Review -> PR`，能够区分 CI 通过、AI Review 通过和 PR 待合并/已通过。
- 固定 Cloudflare Tunnel webhook URL 已用于本地 MVP 测试：

```text
https://webhook.simu-but-real.com/api/github/webhook
```

## 非 MVP 范围

这些能力属于后续阶段：

- GitHub App 自动创建仓库、分支、PR。
- 正式稳定部署环境中的长期 webhook URL、失败重试和 delivery 审计。
- 自动在 CI 通过后触发 Review Agent。
- 将 Review Agent 评论自动写回 GitHub PR。
- 多用户共享训练仓库和冲突训练。
- 自动生成个性化任务序列。
- 组织级仓库托管和权限隔离。
- 在线 IDE 或浏览器内代码编辑器。

## 关键产品决策

### 用户可以使用任意 IDE

平台不强制用户使用特定 IDE。用户可以使用 VS Code、Cursor、IntelliJ IDEA、Eclipse、Vim 或其他本地开发环境。

平台提供 Dev Container 作为推荐环境，保证依赖、JDK、Maven 和命令一致，但用户可以选择不用。

### 第一版训练项目使用 Java

第一版用户项目使用 Java 21、Spring Boot、Maven 和 JUnit 5。原因是 Java 后端岗位流程稳定，企业开发习惯清晰，适合模拟新人任务。

### AI 不直接替用户完成全部工作

AI 负责：

- 拆分任务。
- 判断任务难度。
- 生成测试和 CI 要求。
- 提供 mentor hint。
- 执行 Review。
- 同步流程状态。

用户负责：

- 阅读任务。
- clone 仓库。
- 修改允许范围内的代码。
- 补充测试。
- 本地运行 `mvn test`。
- 提交 commit。
- 创建 PR 并根据 Review 修改。

### 仓库策略

长期目标是平台使用 GitHub Organization 托管训练仓库，并由 GitHub App 自动创建、配置和管理。

当前 MVP 使用用户账号 `SingleButter` 下的私有训练仓库来模拟平台未来的仓库生成动作：

```text
SingleButter/sbr-java-task-api-singlebutter
```

### 项目命名

- 产品展示名：`Simu but Real`
- 工程目录名：`simu-but-real`
- 平台仓库：`SingleButter/simu-but-real`

## 成功标准

MVP 的成功标准不是功能多，而是第一条真实闭环能跑通：

1. 用户通过 GitHub 登录平台。
2. 平台为真实用户分配 Java 任务。
3. 用户能 clone 真实训练仓库。
4. 用户能在任务分支上运行 `mvn test`。
5. 用户能修改代码、提交、push、创建 PR。
6. GitHub Actions 能运行 CI。
7. 平台能同步 PR 和 CI 状态。
8. Review Agent 能读取真实 PR diff，调用 LLM 并在平台展示 review 结果。
