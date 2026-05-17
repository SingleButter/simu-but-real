import type { PullRequestStatus, TrainingTask } from "@/lib/types";

export type ReviewDecision = "approved" | "changes_requested" | "waiting";

export type ReviewAgentInput = {
  task: TrainingTask;
  pullRequest: PullRequestStatus;
  diffSummary: string;
  ciLogSummary: string;
};

export function planNextTask() {
  return {
    taskId: "SBR-JAVA-004",
    reason:
      "任务范围集中在 service/controller/test，风险低，不阻塞主线功能演进。"
  };
}

export function reviewPullRequest(input: ReviewAgentInput): {
  decision: ReviewDecision;
  summary: string;
} {
  if (input.pullRequest.ciState !== "passed") {
    return {
      decision: "waiting",
      summary: "等待 CI 通过后再进行完整代码 review。"
    };
  }

  return {
    decision: "changes_requested",
    summary:
      "实现方向基本正确，但需要确认分页参数在排序路径下没有被重新初始化。"
  };
}
