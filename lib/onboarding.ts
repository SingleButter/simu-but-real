import { prisma } from "@/lib/prisma";

type StarterAssignmentInput = {
  userId: string;
  githubId: string;
  githubLogin: string;
};

export async function ensureStarterAssignment({
  userId,
  githubId,
  githubLogin
}: StarterAssignmentInput) {
  const existingTask = await prisma.taskTicket.findFirst({
    where: { userId },
    select: { id: true }
  });

  if (existingTask) {
    return;
  }

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

  const repoName = `sbr-java-task-api-${slugify(githubLogin)}`;
  const cloneUrl = `git@github.com:${githubLogin}/${repoName}.git`;

  const repository = await prisma.trainingRepo.upsert({
    where: {
      githubOwner_githubName: {
        githubOwner: githubLogin,
        githubName: repoName
      }
    },
    update: {
      userId,
      templateId: template.id,
      cloneUrl
    },
    create: {
      userId,
      templateId: template.id,
      githubOwner: githubLogin,
      githubName: repoName,
      cloneUrl
    }
  });

  const publicId = `SBR-JAVA-${githubId.slice(-6)}`;

  const task = await prisma.taskTicket.create({
    data: {
      publicId,
      userId,
      repositoryId: repository.id,
      title: "补全任务状态校验逻辑",
      description:
        "任务 API 当前允许把已完成任务重新改回待处理状态。你需要在 service 层补充状态流转校验，并用测试覆盖非法流转。",
      status: "CLAIMED",
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
        clone: `git clone ${cloneUrl}`,
        test: "mvn test",
        devContainer: "VS Code / Cursor: Reopen in Container"
      },
      pipeline: [
        { label: "已领取", state: "active" },
        { label: "本地开发", state: "pending" },
        { label: "CI 待运行", state: "pending" },
        { label: "Review 待提交", state: "pending" }
      ]
    }
  });

  await prisma.pullRequestRecord.create({
    data: {
      taskId: task.id,
      title: "补全任务状态校验逻辑",
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
          line: 1,
          severity: "info",
          message: "PR 创建后，Review Agent 会检查状态流转规则和测试覆盖。"
        }
      ]
    }
  });

  await prisma.progressRecord.createMany({
    data: [
      {
        userId,
        metric: "已领取任务",
        value: "1",
        detail: "第一个 Java 后端任务已分配",
        tone: "blue"
      },
      {
        userId,
        metric: "CI 修复",
        value: "0",
        detail: "提交 PR 后开始记录",
        tone: "amber"
      },
      {
        userId,
        metric: "Review 修改",
        value: "0",
        detail: "等待第一次代码审查",
        tone: "green"
      },
      {
        userId,
        metric: "PR 通过率",
        value: "--",
        detail: "完成首个 PR 后计算",
        tone: "blue"
      }
    ]
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
