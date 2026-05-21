# 当前开发进度

更新时间：2026-05-21

## 当前阶段

项目处于 MVP 原型阶段。平台主应用、数据库基础、GitHub OAuth 登录、首次任务分配、Java 模板、真实训练仓库和真实 PR 训练闭环已经打通。GitHub Webhook 状态同步已通过真实 PR 全流程验证，平台页面能够根据 GitHub webhook 更新数据。AI Review Agent 第一版已接入 DeepSeek，能够读取真实 PR diff、生成结构化 review 并更新平台状态。GitHub App 自动化仍在后续阶段。

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

已完成 webhook 状态同步第一版：

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
- 已在第三个真实任务中验证 PR 创建、提交更新、CI 状态变化和 PR 完成流程，平台页面能够跟随 GitHub webhook 更新任务、PR 和 CI 数据。
- 已将本地测试 webhook 迁移到固定 Cloudflare Tunnel URL：

```text
https://webhook.simu-but-real.com/api/github/webhook
```

- Cloudflare Tunnel 已固定使用 `http2` 协议，避免默认 QUIC 连接不稳定导致 delivery 失败。
- GitHub webhook `ping` delivery 已重新验证返回 `200 OK`。
- 平台侧 PR 已合并到 `main`，主工作区和 Codex worktree 均已同步到 `bccce4a`。

### AI Review Agent

已开始 Phase 6 第一版 review 竖切：

- `packages/agents/review/`：Review Agent 输入、输出、prompt 模板和本地规则 reviewer。
- `packages/github/pull-request.ts`：通过 GitHub API 读取 PR diff，依赖 `GITHUB_TOKEN`。
- `app/api/agents/review/route.ts`：读取当前任务和 PR，运行 review，并写入 `ReviewResult`、`PullRequestRecord.reviewSummary` 和 `comments`。
- `components/review-run-button.tsx`：Review 页面手动触发 review，并刷新页面展示结果。
- 已接入 DeepSeek provider，配置 `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL` 后优先使用 DeepSeek 生成结构化 review。
- 本地规则 reviewer 仍作为 CI 未通过、diff 不可用或 DeepSeek 调用失败时的兜底。
- 已通过真实 PR `#4` 验证 DeepSeek 调用链路：平台读取 PR diff，发送给 DeepSeek，成功接收 LLM 结构化 review，并在 `/review` 页面展示结果。
- AI Review 结果现在会同步更新工作台 pipeline：
  - `approved`：`Review 已通过`，PR 卡片进入 `PR 待合并`。
  - `changes_requested` / `blocked`：`Review 需修改`，PR 卡片显示 `PR 未通过`。
  - PR merge webhook 到达后，PR 卡片显示 `PR 已通过`。
- 工作台当前任务 pipeline 已扩展为 5 张卡片：

```text
已领取 -> 本地开发 -> CI -> Review -> PR
```

### 新一轮 Review Agent 测试任务

已新增一个 test-only 任务，用于验证 DeepSeek Review Agent：

```text
task id: SBR-JAVA-TEST-004
title: 补充 createTask 字段保留测试
branch: task/add-create-task-field-test
repository: SingleButter/sbr-java-task-api-singlebutter
```

任务要求：

- 只新增 1 个 JUnit 测试。
- 测试覆盖 `createTask` 会保留 `title`、`dueDate` 和 `priority`。
- 不修改 `src/main` 下的生产代码。
- 本地运行 `mvn test` 通过。

验证记录：

- PR：`https://github.com/SingleButter/sbr-java-task-api-singlebutter/pull/4`
- 标题：`test: cover create task field preservation`
- GitHub Actions：`Java Task API CI / test` 通过。
- 平台已显示 PR `#4` 和 CI 通过状态。
- `/review` 页面手动运行 Review 后，已成功收到 DeepSeek 返回的 LLM review。

### Phase 6 固定 Webhook 和第二轮 Agent 测试

已新增并验证第二个 test-only 任务，用于确认固定 webhook URL、GitHub PR 同步、CI 同步和 DeepSeek Review Agent 能稳定串起来：

```text
task id: SBR-JAVA-TEST-005
title: 补充状态更新字段保留测试
branch: task/add-status-update-preserves-fields-test
repository: SingleButter/sbr-java-task-api-singlebutter
webhook URL: https://webhook.simu-but-real.com/api/github/webhook
```

任务要求：

- 只新增 1 个 JUnit 测试。
- 测试覆盖 `updateTaskStatus` 会把 `TODO` 改为 `IN_PROGRESS`。
- 测试同时断言 `title`、`dueDate` 和 `priority` 保持不变。
- 不修改 `src/main` 下的生产代码。
- 本地运行 `mvn test` 通过。

验证记录：

- 远端任务分支已创建：`task/add-status-update-preserves-fields-test`。
- 用户已完成本地测试、提交 PR 和 Phase 6 全流程测试。
- 固定 GitHub webhook 成功同步 PR / CI 状态到平台。
- `/review` 页面运行 DeepSeek Review 后，平台成功读取 PR diff、接收 LLM 回复并更新工作台 Review / PR 卡片。

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
- 第三个真实任务已成功验证真实 PR webhook 全流程，页面状态随 GitHub 事件更新。
- DeepSeek Review Agent 已通过 PR `#4` 完成真实 diff review 验证，平台已成功接收并展示 LLM 回复。
- 固定 webhook URL `https://webhook.simu-but-real.com/api/github/webhook` 已验证 `ping` 返回 `200 OK`。
- `SBR-JAVA-TEST-005` 已完成 Phase 6 新任务测试，平台能够同步 webhook，并且 Review Agent 能读取真实 PR 信息和 diff。
- 工作台 5 卡片流程已验证：`CI`、`Review`、`PR` 三个阶段可以分别表达 CI 通过、LLM Review 通过和 PR 合并/待合并状态。
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

### AI Review 后续产品化

当前 DeepSeek Review Agent 第一版已能读取真实 PR diff、调用 LLM、展示结构化 review，并更新工作台 Review / PR pipeline 状态。后续需要自动在 CI 通过后触发 review，并将 review 评论写回 GitHub PR。

### 多人协作和冲突训练尚未实现

当前采用每个用户一个独立训练仓库、一次一个任务的方式。多人协作、分支落后、冲突解决会放到后续阶段。

## 当前建议下一步

继续推进 Phase 6 产品化：让 Review Agent 从手动触发走向 CI 通过后的自动触发，并补齐 GitHub PR 评论写回。

优先目标：

1. 在 `check_run` / `workflow_run` 同步到 `PASSED` 后自动触发 Review Agent。
2. 将 DeepSeek review 评论写回 GitHub PR comment。
3. 补充 review 自动化测试，覆盖 diff 不可用、CI failed、DeepSeek JSON 解析失败和 changes requested。
4. 为固定 Cloudflare Tunnel 增加本地启动说明和故障排查记录。
