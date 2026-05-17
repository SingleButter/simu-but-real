import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { githubId: "local-singlebutter" },
    update: {
      githubLogin: "SingleButter",
      displayName: "Zuning Wang",
      level: "Java 入门 II"
    },
    create: {
      githubId: "local-singlebutter",
      githubLogin: "SingleButter",
      displayName: "Zuning Wang",
      level: "Java 入门 II"
    }
  });

  await prisma.assessment.create({
    data: {
      userId: user.id,
      level: "Java 入门 II",
      score: 72,
      summary: "Java 基础稳定，Git 和测试流程需要通过 PR 任务继续训练。"
    }
  });

  const template = await prisma.projectTemplate.upsert({
    where: { name: "template-java-spring-task-api" },
    update: {
      stack: "Java 21, Spring Boot, Maven, JUnit 5",
      sourcePath: "templates/java-task-api",
      description: "任务管理 API 训练模板，适合新人级 bug fix、测试补充和小范围接口改造。"
    },
    create: {
      name: "template-java-spring-task-api",
      stack: "Java 21, Spring Boot, Maven, JUnit 5",
      sourcePath: "templates/java-task-api",
      description: "任务管理 API 训练模板，适合新人级 bug fix、测试补充和小范围接口改造。"
    }
  });

  const repository = await prisma.trainingRepo.upsert({
    where: {
      githubOwner_githubName: {
        githubOwner: "company-simu-dev",
        githubName: "u_001_task-api-training"
      }
    },
    update: {
      userId: user.id,
      templateId: template.id,
      cloneUrl: "git@github.com:company-simu-dev/u_001_task-api-training.git"
    },
    create: {
      userId: user.id,
      templateId: template.id,
      githubOwner: "company-simu-dev",
      githubName: "u_001_task-api-training",
      cloneUrl: "git@github.com:company-simu-dev/u_001_task-api-training.git"
    }
  });

  const task = await prisma.taskTicket.upsert({
    where: { publicId: "SBR-JAVA-004" },
    update: {
      userId: user.id,
      repositoryId: repository.id,
      title: "修复任务分页排序问题",
      description:
        "任务列表接口在按截止时间排序时会忽略分页参数。你需要修复 service 层排序逻辑，并补充分页排序测试。",
      status: "IN_PROGRESS",
      branchName: "task/fix-task-pagination",
      mentorHint:
        "先阅读 TaskService 和 TaskController，确认分页对象在哪里创建，再补一个失败测试让问题暴露出来。",
      acceptanceCriteria: [
        "GET /api/tasks 支持按 dueDate 升序和降序排序",
        "分页参数 page 和 size 在排序场景下仍然生效",
        "新增至少 2 个覆盖分页排序的 service 或 controller 测试",
        "不修改任务创建、状态流转和错误响应格式"
      ],
      editableScope: [
        "src/main/java/com/simubutreal/taskapi/service/TaskService.java",
        "src/main/java/com/simubutreal/taskapi/controller/TaskController.java",
        "src/test/java/com/simubutreal/taskapi/TaskServiceTest.java"
      ],
      commands: {
        clone: "git clone git@github.com:company-simu-dev/u_001_task-api-training.git",
        test: "mvn test",
        devContainer: "VS Code / Cursor: Reopen in Container"
      },
      pipeline: [
        { label: "已领取", state: "done" },
        { label: "开发中", state: "active" },
        { label: "CI 待运行", state: "pending" },
        { label: "Review 待提交", state: "pending" }
      ]
    },
    create: {
      publicId: "SBR-JAVA-004",
      userId: user.id,
      repositoryId: repository.id,
      title: "修复任务分页排序问题",
      description:
        "任务列表接口在按截止时间排序时会忽略分页参数。你需要修复 service 层排序逻辑，并补充分页排序测试。",
      status: "IN_PROGRESS",
      branchName: "task/fix-task-pagination",
      mentorHint:
        "先阅读 TaskService 和 TaskController，确认分页对象在哪里创建，再补一个失败测试让问题暴露出来。",
      acceptanceCriteria: [
        "GET /api/tasks 支持按 dueDate 升序和降序排序",
        "分页参数 page 和 size 在排序场景下仍然生效",
        "新增至少 2 个覆盖分页排序的 service 或 controller 测试",
        "不修改任务创建、状态流转和错误响应格式"
      ],
      editableScope: [
        "src/main/java/com/simubutreal/taskapi/service/TaskService.java",
        "src/main/java/com/simubutreal/taskapi/controller/TaskController.java",
        "src/test/java/com/simubutreal/taskapi/TaskServiceTest.java"
      ],
      commands: {
        clone: "git clone git@github.com:company-simu-dev/u_001_task-api-training.git",
        test: "mvn test",
        devContainer: "VS Code / Cursor: Reopen in Container"
      },
      pipeline: [
        { label: "已领取", state: "done" },
        { label: "开发中", state: "active" },
        { label: "CI 待运行", state: "pending" },
        { label: "Review 待提交", state: "pending" }
      ]
    }
  });

  await prisma.pullRequestRecord.upsert({
    where: { taskId: task.id },
    update: {
      title: "修复任务分页排序问题",
      state: "NOT_CREATED",
      ciState: "WAITING",
      reviewSummary:
        "还没有检测到 PR。提交分支后，平台会同步 GitHub Actions 结果并启动 AI review。",
      checkRuns: [
        { name: "mvn test", status: "waiting", duration: "--" },
        { name: "branch protection", status: "waiting", duration: "--" },
        { name: "ai-review-gate", status: "waiting", duration: "--" }
      ],
      comments: [
        {
          file: "TaskService.java",
          line: 42,
          severity: "info",
          message: "PR 创建后，Review Agent 会优先检查分页参数是否在排序分支中保留。"
        }
      ]
    },
    create: {
      taskId: task.id,
      title: "修复任务分页排序问题",
      state: "NOT_CREATED",
      ciState: "WAITING",
      reviewSummary:
        "还没有检测到 PR。提交分支后，平台会同步 GitHub Actions 结果并启动 AI review。",
      checkRuns: [
        { name: "mvn test", status: "waiting", duration: "--" },
        { name: "branch protection", status: "waiting", duration: "--" },
        { name: "ai-review-gate", status: "waiting", duration: "--" }
      ],
      comments: [
        {
          file: "TaskService.java",
          line: 42,
          severity: "info",
          message: "PR 创建后，Review Agent 会优先检查分页参数是否在排序分支中保留。"
        }
      ]
    }
  });

  await prisma.progressRecord.deleteMany({
    where: { userId: user.id }
  });

  await prisma.progressRecord.createMany({
    data: [
      {
        userId: user.id,
        metric: "已完成任务",
        value: "3",
        detail: "2 个 bug fix，1 个测试补充",
        tone: "green"
      },
      {
        userId: user.id,
        metric: "CI 修复",
        value: "2",
        detail: "最近问题集中在断言和参数校验",
        tone: "amber"
      },
      {
        userId: user.id,
        metric: "Review 修改",
        value: "4",
        detail: "命名、边界条件、测试覆盖",
        tone: "blue"
      },
      {
        userId: user.id,
        metric: "PR 通过率",
        value: "75%",
        detail: "当前等级：Java 入门 II",
        tone: "green"
      }
    ]
  });

  await prisma.assessmentQuestion.deleteMany();
  await prisma.assessmentQuestion.createMany({
    data: [
      {
        position: 1,
        question: "Spring Boot 中 Controller 层最应该负责什么？",
        answer: "接收请求、做轻量参数绑定和返回响应，不承载核心业务逻辑。"
      },
      {
        position: 2,
        question: "为什么企业 PR 通常要求先写或补测试？",
        answer: "测试让需求边界可验证，也让 review 和 CI 能判断改动是否破坏现有行为。"
      },
      {
        position: 3,
        question: "当 GitHub Actions 失败时，第一步应该看什么？",
        answer: "先看失败 job、失败命令和第一段有效错误日志，再回到本地复现。"
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
