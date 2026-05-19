import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { githubId: "154373192" },
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
        githubOwner: "SingleButter",
        githubName: "sbr-java-task-api-singlebutter"
      }
    },
    update: {
      userId: user.id,
      templateId: template.id,
      cloneUrl: "git@github.com:SingleButter/sbr-java-task-api-singlebutter.git"
    },
    create: {
      userId: user.id,
      templateId: template.id,
      githubOwner: "SingleButter",
      githubName: "sbr-java-task-api-singlebutter",
      cloneUrl: "git@github.com:SingleButter/sbr-java-task-api-singlebutter.git"
    }
  });

  const task = await prisma.taskTicket.upsert({
    where: { publicId: "SBR-JAVA-373192" },
    update: {
      userId: user.id,
      repositoryId: repository.id,
      title: "补全任务状态校验逻辑",
      description:
        "任务 API 当前允许把已完成任务重新改回待处理状态。你需要在 service 层补充状态流转校验，并用测试覆盖非法流转。",
      status: "COMPLETE",
      branchName: "task/validate-task-status",
      mentorHint:
        "先从测试入手，写出“已完成任务不能回退到待处理”的失败用例，再实现最小范围的 service 层校验。",
      acceptanceCriteria: [
        "已完成任务不能被改回 TODO 或 IN_PROGRESS",
        "非法状态流转返回清晰的业务错误",
        "新增至少 2 个状态流转相关测试",
        "不修改任务创建接口和响应字段结构"
      ],
      editableScope: [
        "src/main/java/com/simubutreal/taskapi/service/TaskService.java",
        "src/main/java/com/simubutreal/taskapi/model/TaskStatus.java",
        "src/test/java/com/simubutreal/taskapi/TaskServiceTest.java"
      ],
      commands: {
        clone: "git clone git@github.com:SingleButter/sbr-java-task-api-singlebutter.git",
        test: "mvn test",
        devContainer: "VS Code / Cursor: Reopen in Container"
      },
      pipeline: [
        { label: "已领取", state: "done" },
        { label: "本地开发", state: "done" },
        { label: "CI 已通过", state: "done" },
        { label: "已合并", state: "done" }
      ]
    },
    create: {
      publicId: "SBR-JAVA-373192",
      userId: user.id,
      repositoryId: repository.id,
      title: "补全任务状态校验逻辑",
      description:
        "任务 API 当前允许把已完成任务重新改回待处理状态。你需要在 service 层补充状态流转校验，并用测试覆盖非法流转。",
      status: "COMPLETE",
      branchName: "task/validate-task-status",
      mentorHint:
        "先从测试入手，写出“已完成任务不能回退到待处理”的失败用例，再实现最小范围的 service 层校验。",
      acceptanceCriteria: [
        "已完成任务不能被改回 TODO 或 IN_PROGRESS",
        "非法状态流转返回清晰的业务错误",
        "新增至少 2 个状态流转相关测试",
        "不修改任务创建接口和响应字段结构"
      ],
      editableScope: [
        "src/main/java/com/simubutreal/taskapi/service/TaskService.java",
        "src/main/java/com/simubutreal/taskapi/model/TaskStatus.java",
        "src/test/java/com/simubutreal/taskapi/TaskServiceTest.java"
      ],
      commands: {
        clone: "git clone git@github.com:SingleButter/sbr-java-task-api-singlebutter.git",
        test: "mvn test",
        devContainer: "VS Code / Cursor: Reopen in Container"
      },
      pipeline: [
        { label: "已领取", state: "done" },
        { label: "本地开发", state: "done" },
        { label: "CI 已通过", state: "done" },
        { label: "已合并", state: "done" }
      ]
    }
  });

  await prisma.pullRequestRecord.upsert({
    where: { taskId: task.id },
    update: {
      githubNumber: 1,
      title: "fix: validate completed task status transitions",
      githubUrl: "https://github.com/SingleButter/sbr-java-task-api-singlebutter/pull/1",
      state: "MERGED",
      ciState: "PASSED",
      reviewSummary: "PR 已合并，任务完成。",
      lastSyncedAt: new Date("2026-05-19T04:35:48.000Z"),
      checkRuns: [
        { name: "Java Task API CI", status: "passed", duration: "--" },
        { name: "mvn test", status: "passed", duration: "--" },
        { name: "branch protection", status: "passed", duration: "--" }
      ],
      comments: [
        {
          file: "TaskService.java",
          line: 1,
          severity: "info",
          message: "首个真实 PR 已完成并合并。下一步接入 GitHub webhook 自动同步状态。"
        }
      ]
    },
    create: {
      taskId: task.id,
      githubNumber: 1,
      title: "fix: validate completed task status transitions",
      githubUrl: "https://github.com/SingleButter/sbr-java-task-api-singlebutter/pull/1",
      state: "MERGED",
      ciState: "PASSED",
      reviewSummary: "PR 已合并，任务完成。",
      lastSyncedAt: new Date("2026-05-19T04:35:48.000Z"),
      checkRuns: [
        { name: "Java Task API CI", status: "passed", duration: "--" },
        { name: "mvn test", status: "passed", duration: "--" },
        { name: "branch protection", status: "passed", duration: "--" }
      ],
      comments: [
        {
          file: "TaskService.java",
          line: 1,
          severity: "info",
          message: "首个真实 PR 已完成并合并。下一步接入 GitHub webhook 自动同步状态。"
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
