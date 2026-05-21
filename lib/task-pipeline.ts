import { CiState, PullRequestState, TaskStatus } from "@prisma/client";
import type { PipelineStep } from "@/lib/types";

type PipelineInput = {
  taskStatus: TaskStatus | string;
  ciState: CiState | string;
  pullRequestState: PullRequestState | string;
};

export function buildTaskPipeline({
  taskStatus,
  ciState,
  pullRequestState
}: PipelineInput): PipelineStep[] {
  if (
    taskStatus === TaskStatus.COMPLETE ||
    pullRequestState === PullRequestState.MERGED
  ) {
    return [
      { label: "已领取", state: "done" },
      { label: "本地开发", state: "done" },
      { label: "CI 已通过", state: "done" },
      { label: "Review 已通过", state: "done" },
      { label: "PR 已通过", state: "done" }
    ];
  }

  return [
    { label: "已领取", state: taskStatus === TaskStatus.CLAIMED ? "active" : "done" },
    { label: "本地开发", state: buildDevelopmentState(taskStatus) },
    buildCiStep(ciState),
    buildReviewStep(pullRequestState),
    buildPullRequestStep(pullRequestState)
  ];
}

function buildDevelopmentState(taskStatus: TaskStatus | string): PipelineStep["state"] {
  if (taskStatus === TaskStatus.CLAIMED) {
    return "pending";
  }

  if (taskStatus === TaskStatus.IN_PROGRESS) {
    return "active";
  }

  return "done";
}

function buildCiStep(ciState: CiState | string): PipelineStep {
  if (ciState === CiState.PASSED) {
    return { label: "CI 已通过", state: "done" };
  }

  if (ciState === CiState.FAILED) {
    return { label: "CI 失败", state: "blocked" };
  }

  if (ciState === CiState.RUNNING) {
    return { label: "CI 运行中", state: "active" };
  }

  return { label: "CI 待运行", state: "pending" };
}

function buildReviewStep(pullRequestState: PullRequestState | string): PipelineStep {
  if (pullRequestState === PullRequestState.APPROVED) {
    return { label: "Review 已通过", state: "done" };
  }

  if (pullRequestState === PullRequestState.CHANGES_REQUESTED) {
    return { label: "Review 需修改", state: "blocked" };
  }

  return { label: "Review 待完成", state: "pending" };
}

function buildPullRequestStep(pullRequestState: PullRequestState | string): PipelineStep {
  if (pullRequestState === PullRequestState.APPROVED) {
    return { label: "PR 待合并", state: "active" };
  }

  if (pullRequestState === PullRequestState.CHANGES_REQUESTED) {
    return { label: "PR 未通过", state: "blocked" };
  }

  return { label: "PR 待通过", state: "pending" };
}
