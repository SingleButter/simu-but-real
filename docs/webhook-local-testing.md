# GitHub Webhook 本地验证

本文档记录 Phase 5 第一版 webhook 状态同步的本地验证流程。

## 目标

本地复现 GitHub 的关键事件，确认平台能把真实工程流程同步到数据库和页面：

- PR 创建后，`PullRequestRecord` 写入 PR 编号、标题、URL 和 `OPEN` 状态。
- CI 通过后，`ciState` 更新为 `PASSED`。
- PR 合并后，`PullRequestRecord.state` 更新为 `MERGED`，`TaskTicket.status` 更新为 `COMPLETE`。

## 准备

确保本地平台服务和数据库可用：

```bash
docker compose up -d postgres
cp .env.example .env.local
npm run db:seed
npm run dev
```

如果 `.env.local` 中设置了 `GITHUB_WEBHOOK_SECRET`，replay 脚本会自动用同一个 secret 生成 `x-hub-signature-256`。

## 回放事件

默认按顺序回放：

1. `pull_request.opened.json`
2. `check_run.completed-success.json`
3. `pull_request.closed-merged.json`

```bash
npm run webhook:replay
```

也可以只回放一个 fixture：

```bash
npm run webhook:replay -- pull_request.opened.json
```

默认请求地址是：

```text
http://localhost:3000/api/github/webhook
```

如果本地服务不是 3000 端口，可以覆盖：

```bash
WEBHOOK_REPLAY_URL=http://localhost:3001/api/github/webhook npm run webhook:replay
```

## 真实 GitHub 接入

本地回放通过后，再接真实 GitHub 事件：

1. 用 ngrok 或其他隧道工具暴露本地服务。
2. 在训练仓库设置 webhook URL：

```text
https://<your-tunnel>/api/github/webhook
```

3. 配置 secret，和 `.env.local` 的 `GITHUB_WEBHOOK_SECRET` 保持一致。
4. 勾选事件：
   - `Pull requests`
   - `Check runs`
   - `Check suites`
   - `Workflow runs`
5. 创建或更新一个 PR，确认平台页面状态自动变化。
