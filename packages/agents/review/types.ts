import type { PullRequestStatus, TrainingTask } from "@/lib/types";

export type ReviewDecision = "approved" | "changes_requested" | "blocked" | "waiting";

export type ReviewComment = {
  file: string;
  line: number;
  severity: "info" | "warning" | "required";
  message: string;
};

export type ReviewDiff = {
  source: "github" | "unavailable";
  text: string;
  truncated: boolean;
};

export type ReviewAgentInput = {
  task: TrainingTask;
  pullRequest: PullRequestStatus;
  diff: ReviewDiff;
  ciLogSummary: string;
};

export type ReviewAgentResult = {
  decision: ReviewDecision;
  summary: string;
  comments: ReviewComment[];
  prompt: string;
  reviewer: "local-rules" | "deepseek";
  reviewedAt: string;
};
