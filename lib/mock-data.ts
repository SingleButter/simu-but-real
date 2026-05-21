import type { ProgressMetric, PullRequestStatus, TrainingTask } from "@/lib/types";

export const currentTask: TrainingTask = {
  id: "SBR-JAVA-TEST-005",
  title: "补充状态更新字段保留测试",
  summary:
    "当前 updateTaskStatus 会返回更新后的 TaskItem。本任务只需要新增一个测试，证明状态更新只改变 status，不会改变原任务的 title、dueDate 和 priority。",
  repository: "SingleButter/sbr-java-task-api-singlebutter",
  branch: "task/add-status-update-preserves-fields-test",
  stack: ["Java 21", "Spring Boot", "Maven", "JUnit 5"],
  status: "claimed",
  acceptanceCriteria: [
    "只新增 1 个 JUnit 测试",
    "测试覆盖 updateTaskStatus 会把 TODO 改为 IN_PROGRESS",
    "测试同时断言 title、dueDate 和 priority 保持不变",
    "不修改 src/main 下的生产代码",
    "本地运行 mvn test 通过"
  ],
  editableScope: ["src/test/java/com/simubutreal/taskapi/TaskServiceTest.java"],
  mentorHint:
    "只在 TaskServiceTest 中新增一个测试：找到一个 TODO 任务，记录 title、dueDate、priority，调用 updateTaskStatus 改为 IN_PROGRESS，然后断言这些字段保持不变。",
  commands: {
    clone:
      "git clone git@github.com:SingleButter/sbr-java-task-api-singlebutter.git",
    test: "mvn test",
    devContainer: "VS Code / Cursor: Reopen in Container"
  },
  pipeline: [
    { label: "已领取", state: "active" },
    { label: "本地开发", state: "pending" },
    { label: "CI 待运行", state: "pending" },
    { label: "Review 待完成", state: "pending" },
    { label: "PR 待通过", state: "pending" }
  ]
};

export const pullRequestStatus: PullRequestStatus = {
  number: null,
  title: "补充状态更新字段保留测试",
  githubUrl: null,
  state: "not_created",
  ciState: "waiting",
  reviewSummary:
    "新任务已分配。提交分支并创建 PR 后，平台会通过 webhook 同步 CI，并可运行 DeepSeek Review。",
  checkRuns: [
    { name: "mvn test", status: "waiting", duration: "--" },
    { name: "branch protection", status: "waiting", duration: "--" },
    { name: "ai-review-gate", status: "waiting", duration: "--" }
  ],
  comments: [
    {
      file: "TaskServiceTest.java",
      line: 1,
      severity: "info",
      message: "本任务只允许新增测试，不需要修改生产代码。"
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
