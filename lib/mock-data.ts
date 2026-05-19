import type { ProgressMetric, PullRequestStatus, TrainingTask } from "@/lib/types";

export const currentTask: TrainingTask = {
  id: "SBR-JAVA-373192",
  title: "补全任务状态校验逻辑",
  summary:
    "任务 API 当前允许把已完成任务重新改回待处理状态。你需要在 service 层补充状态流转校验，并用测试覆盖非法流转。",
  repository: "SingleButter/sbr-java-task-api-singlebutter",
  branch: "task/validate-task-status",
  stack: ["Java 21", "Spring Boot", "Maven", "JUnit 5"],
  status: "complete",
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
  mentorHint:
    "先从测试入手，写出“已完成任务不能回退到待处理”的失败用例，再实现最小范围的 service 层校验。",
  commands: {
    clone:
      "git clone git@github.com:SingleButter/sbr-java-task-api-singlebutter.git",
    test: "mvn test",
    devContainer: "VS Code / Cursor: Reopen in Container"
  },
  pipeline: [
    { label: "已领取", state: "done" },
    { label: "本地开发", state: "done" },
    { label: "CI 已通过", state: "done" },
    { label: "已合并", state: "done" }
  ]
};

export const pullRequestStatus: PullRequestStatus = {
  number: 1,
  title: "fix: validate completed task status transitions",
  githubUrl: "https://github.com/SingleButter/sbr-java-task-api-singlebutter/pull/1",
  state: "merged",
  ciState: "passed",
  reviewSummary: "PR 已合并，任务完成。",
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
