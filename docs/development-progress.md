# 当前开发进度

更新时间：2026-05-19

## 当前阶段

项目处于 MVP 原型阶段。平台主应用、数据库基础、GitHub OAuth 登录、首次任务分配、Java 模板、真实训练仓库和第一轮真实 PR 训练闭环已经打通。GitHub Webhook 状态同步已完成第一版代码竖切，后续需要配置真实 webhook 地址并继续完善事件覆盖。GitHub App 自动化和 AI Review 仍在后续阶段。

## 已完成

### 项目初始化

- 本地工程目录已统一为：

```text
/Users/wzuning/Develop/simu-but-real
```

- 平台 GitHub 仓库：

```text
git@github.com:SingleButter/simu-but-real.git
```

- 主分支已推送到 GitHub。

### 平台主应用

技术栈：

- Next.js App Router。
- TypeScript。
- Tailwind CSS。
- React Server Components。
- NextAuth。
- Prisma。
- PostgreSQL。

已实现页面：

- `/` 工作台。
- `/assessment` 入门测评。
- `/tasks` 任务详情。
- `/review` PR Review。
- `/progress` 成长记录。
- `/settings` 设置占位页。

已实现组件：

- `components/app-shell.tsx`
- `components/auth-actions.tsx`
- `components/ui.tsx`

### 数据库

本地数据库使用 Docker PostgreSQL：

```text
container: simu-but-real-postgres
database: simu_but_real
```

已实现：

- `docker-compose.yml`
- `prisma/schema.prisma`
- `prisma/migrations/20260517123000_init/migration.sql`
- `prisma/seed.ts`
- `lib/prisma.ts`
- `lib/data.ts`

页面会优先读取 PostgreSQL 数据。没有配置 `DATABASE_URL` 或数据库不可用时，会回退到 `lib/mock-data.ts`。

### GitHub 登录

已接入 GitHub OAuth：

- `lib/auth.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `types/next-auth.d.ts`

真实 GitHub 用户已登录成功：

```text
githubLogin: SingleButter
githubId: 154373192
```

### 首次任务分配

已实现登录用户首次进入后自动分配 starter task：

- `lib/onboarding.ts`
- `lib/auth.ts`
- `lib/data.ts`

真实用户当前任务：

```text
task id: SBR-JAVA-373192
title: 补全任务状态校验逻辑
branch: task/validate-task-status
repository: SingleButter/sbr-java-task-api-singlebutter
```

### Java 训练模板

模板路径：

```text
templates/java-task-api
```

技术栈：

- Java 21。
- Spring Boot。
- Maven。
- JUnit 5。
- Dev Container。
- GitHub Actions。

模板测试已通过：

```text
mvn test
Tests run: 4, Failures: 0, Errors: 0
BUILD SUCCESS
```

### 真实训练仓库

已创建真实 GitHub 私有训练仓库：

```text
https://github.com/SingleButter/sbr-java-task-api-singlebutter
git@github.com:SingleButter/sbr-java-task-api-singlebutter.git
```

已推送分支：

```text
main
task/validate-task-status
```

GitHub Actions 状态：

```text
Java Task API CI: completed success
```

### 第一轮真实训练任务

已完成第一轮真实任务闭环：

```text
task id: SBR-JAVA-373192
title: 补全任务状态校验逻辑
repository: SingleButter/sbr-java-task-api-singlebutter
branch: task/validate-task-status
pull request: https://github.com/SingleButter/sbr-java-task-api-singlebutter/pull/1
merged at: 2026-05-19 12:35:48 Asia/Shanghai
```

用户已完成：

- 本地同步训练仓库。
- 在 `task/validate-task-status` 分支补充失败测试。
- 实现已完成任务不能回退到 `TODO` 或 `IN_PROGRESS` 的状态校验。
- 本地运行 `mvn test`。
- commit、push 并创建 PR。
- GitHub Actions 通过。
- PR 合并到 `main`。
- 本地训练仓库 `main` 已同步。

### GitHub Webhook 状态同步

已实现第一版 webhook 处理：

```text
platform PR: https://github.com/SingleButter/simu-but-real/pull/1
merged commit: bccce4a
branch: codex/github-webhook-sync
```

- `app/api/github/webhook/route.ts`
- `scripts/replay-github-webhook.ts`
- `scripts/github-webhook-fixtures`
- `docs/webhook-local-testing.md`
- 支持 `GITHUB_WEBHOOK_SECRET` 存在时校验 `x-hub-signature-256`。
- 支持 `pull_request` 事件同步 PR 编号、标题、URL、状态和任务状态。
- 支持 `check_run`、`check_suite`、`workflow_run` 事件同步 CI 状态。
- PR merged 时将任务状态更新为 `COMPLETE`，并更新 pipeline。
- 首页和 `/review` 页面已展示真实 PR 编号、状态和链接。
- `lib/mock-data.ts` 和 `prisma/seed.ts` 已更新为第一轮任务完成状态。
- 已用 fixture 回放验证 `opened -> CI passed -> merged` 流程，数据库最终状态为 `COMPLETE / MERGED / PASSED`。
- 已用 Cloudflare Tunnel 配置真实 GitHub webhook，GitHub `ping` delivery 返回 `200`，确认真实外部请求可以到达本地平台。
- 平台侧 PR 已合并到 `main`，主工作区和 Codex worktree 均已同步到 `bccce4a`。

### 本地工具

已完成：

- Docker Desktop 安装和 PostgreSQL 启动。
- SSH key 添加到 GitHub。
- GitHub CLI 安装和登录。
- Maven 安装。

当前 Maven：

```text
Apache Maven 3.9.15
```

注意：Homebrew 安装 Maven 时同时安装了 OpenJDK 25，因此 `mvn -version` 当前默认显示 Java 25。项目目标仍是 Java 21，当前模板测试可以正常通过。后续可将 `JAVA_HOME` 固定到 Java 21。

## 已验证

平台验证：

- `npm run typecheck` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。
- `npm run webhook:replay` 已对本地 3001 服务回放成功。
- GitHub webhook `ping` delivery 已通过 Cloudflare Tunnel 连接到本地 3001 服务。
- 平台仓库 `main` 已同步到合并提交 `bccce4a`。
- 本地开发服务可在 `http://localhost:3000` 访问。

训练仓库验证：

- `main` 和 `task/validate-task-status` 分支已存在。
- PR `#1` 已从 `task/validate-task-status` 合并到 `main`。
- GitHub Actions 已对 PR 运行并通过。
- 本地训练仓库 `main` 已同步。
- 本地模板 `mvn test` 已通过。

## 已知限制

### Prisma migration 问题

本机执行 `prisma migrate dev`、`prisma migrate deploy` 或 `prisma db push` 时曾出现空的 `Schema engine error`。当前数据库初始化是通过容器内 `psql` 手动执行 migration SQL 完成。

后续需要：

- 继续排查 Prisma schema engine 问题；或
- 在本地开发文档中明确使用 SQL migration + `psql` 的替代流程。

### GitHub 自动化仍是手动模拟

当前训练仓库是通过 GitHub CLI 手动创建并推送模板，不是平台自动完成。

后续需要用 GitHub App 实现：

- 自动创建仓库。
- 自动推送模板。
- 自动创建任务分支。
- 自动创建 PR。
- 监听 GitHub Actions 和 Review 状态。

### AI Review 尚未接入真实 LLM

当前 Review 页面和 API 仍是 MVP 边界和演示状态。后续需要接入 LLM API 和 GitHub PR diff。

### 多人协作和冲突训练尚未实现

当前采用每个用户一个独立训练仓库、一次一个任务的方式。多人协作、分支落后、冲突解决会放到后续阶段。

## 当前建议下一步

继续推进 Phase 5：用真实 PR/CI 事件验证完整自动同步。

优先目标：

1. 创建第二个训练任务或临时测试 PR。
2. 用真实 `pull_request`、`check_run` 和 merge 事件验证 `PullRequestRecord.state`、`PullRequestRecord.ciState` 和 `lastSyncedAt` 更新。
3. 将 webhook URL 从临时 tunnel 迁移到稳定部署地址。
4. 补充 webhook 自动化测试，覆盖 open、synchronize、CI failed、CI passed、merged。
