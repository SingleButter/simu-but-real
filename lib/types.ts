export type WorkflowState = "done" | "active" | "pending" | "blocked";

export type PipelineStep = {
  label: string;
  state: WorkflowState;
};

export type TrainingTask = {
  id: string;
  title: string;
  summary: string;
  repository: string;
  branch: string;
  stack: string[];
  status: "claimed" | "in_progress" | "review" | "complete";
  acceptanceCriteria: string[];
  editableScope: string[];
  mentorHint: string;
  commands: {
    clone: string;
    test: string;
    devContainer: string;
  };
  pipeline: PipelineStep[];
};

export type PullRequestStatus = {
  number: number | null;
  title: string;
  state: "not_created" | "open" | "changes_requested" | "approved" | "merged";
  ciState: "waiting" | "running" | "failed" | "passed";
  reviewSummary: string;
  checkRuns: Array<{
    name: string;
    status: "waiting" | "passed" | "failed";
    duration: string;
  }>;
  comments: Array<{
    file: string;
    line: number;
    message: string;
    severity: "info" | "warning" | "required";
  }>;
};

export type ProgressMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "green" | "amber" | "red";
};
