import type { ProgressMetric, PullRequestStatus, TrainingTask } from "@/lib/types";

export const currentTask: TrainingTask = {
  id: "SBR-JAVA-004",
  title: "修复任务分页排序问题",
  summary:
    "任务列表接口在按截止时间排序时会忽略分页参数。你需要修复 service 层排序逻辑，并补充分页排序测试。",
  repository: "company-simu-dev/u_001_task-api-training",
  branch: "task/fix-task-pagination",
  stack: ["Java 21", "Spring Boot", "Maven", "JUnit 5"],
  status: "in_progress",
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
  mentorHint:
    "先阅读 TaskService 和 TaskController，确认分页对象在哪里创建，再补一个失败测试让问题暴露出来。",
  commands: {
    clone:
      "git clone git@github.com:company-simu-dev/u_001_task-api-training.git",
    test: "mvn test",
    devContainer: "VS Code / Cursor: Reopen in Container"
  },
  pipeline: [
    { label: "已领取", state: "done" },
    { label: "开发中", state: "active" },
    { label: "CI 待运行", state: "pending" },
    { label: "Review 待提交", state: "pending" }
  ]
};

export const pullRequestStatus: PullRequestStatus = {
  number: null,
  title: "修复任务分页排序问题",
  state: "not_created",
  ciState: "waiting",
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
};

export const progressMetrics: ProgressMetric[] = [
  {
    label: "已完成任务",
    value: "3",
    detail: "2 个 bug fix，1 个测试补充",
    tone: "green"
  },
  {
    label: "CI 修复",
    value: "2",
    detail: "最近问题集中在断言和参数校验",
    tone: "amber"
  },
  {
    label: "Review 修改",
    value: "4",
    detail: "命名、边界条件、测试覆盖",
    tone: "blue"
  },
  {
    label: "PR 通过率",
    value: "75%",
    detail: "当前等级：Java 入门 II",
    tone: "green"
  }
];

export const assessmentQuestions = [
  {
    question: "Spring Boot 中 Controller 层最应该负责什么？",
    answer: "接收请求、做轻量参数绑定和返回响应，不承载核心业务逻辑。"
  },
  {
    question: "为什么企业 PR 通常要求先写或补测试？",
    answer: "测试让需求边界可验证，也让 review 和 CI 能判断改动是否破坏现有行为。"
  },
  {
    question: "当 GitHub Actions 失败时，第一步应该看什么？",
    answer: "先看失败 job、失败命令和第一段有效错误日志，再回到本地复现。"
  }
];
