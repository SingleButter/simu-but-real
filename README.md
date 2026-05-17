# Simu but Real

Simu but Real 是一个面向 Java 后端求职新人的企业开发流程模拟平台。它不把 AI 当成“替你写完代码”的工具，而是模拟真实公司里的 mentor、planner、reviewer 和 CI 守门员，让用户通过 GitHub PR、CI 和 review 完成新人级工程任务。

## MVP Scope

- Next.js + TypeScript 主平台
- 工作台、入门测评、任务详情、PR Review、成长记录
- GitHub App / Webhook / Agent 服务边界
- Prisma 数据模型
- Java 21 + Spring Boot + Maven 训练项目模板
- Dev Container 推荐开发环境
- GitHub Actions CI 模板

## Local Development

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## Project Structure

```text
app/                    Next.js App Router pages and API routes
components/             Shared UI shell and primitives
lib/                    MVP mock data and shared types
packages/agents/        Agent orchestration boundary
packages/github/        GitHub App integration boundary
prisma/                 Database schema
templates/java-task-api Java Spring Boot training repository template
```

## Development Strategy

平台主体用 TypeScript 快速迭代，训练项目用 Java 模拟真实后端新人工作。MVP 当前以 mock 数据展示完整产品闭环，后续阶段接入真实 GitHub App、PostgreSQL、BullMQ worker 和 LLM API。

## Secrets

不要提交 `.env`、GitHub App private key、OAuth secret 或 LLM API key。请复制 `.env.example` 到 `.env.local` 后在本地填写。
