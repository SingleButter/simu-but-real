import type {
  ProgressMetric,
  PullRequestStatus,
  TrainingTask,
  WorkflowState
} from "@/lib/types";
import {
  assessmentQuestions as fallbackAssessmentQuestions,
  currentTask as fallbackCurrentTask,
  progressMetrics as fallbackProgressMetrics,
  pullRequestStatus as fallbackPullRequestStatus
} from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

type DashboardData = {
  currentTask: TrainingTask;
  pullRequestStatus: PullRequestStatus;
  progressMetrics: ProgressMetric[];
  assessmentQuestions: Array<{
    question: string;
    answer: string;
  }>;
};

type CommandJson = {
  clone: string;
  test: string;
  devContainer: string;
};

type PipelineJson = Array<{
  label: string;
  state: WorkflowState;
}>;

type CheckRunJson = PullRequestStatus["checkRuns"];
type ReviewCommentJson = PullRequestStatus["comments"];

export async function getDashboardData(githubId?: string): Promise<DashboardData> {
  if (!process.env.DATABASE_URL) {
    return fallbackDashboardData();
  }

  try {
    const [task, progressRecords, questions] = await Promise.all([
      prisma.taskTicket.findFirst({
        where: githubId
          ? {
              user: {
                githubId
              }
            }
          : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          repository: {
            include: {
              template: true
            }
          },
          pullRequest: true
        }
      }),
      prisma.progressRecord.findMany({
        where: githubId
          ? {
              user: {
                githubId
              }
            }
          : undefined,
        orderBy: { createdAt: "asc" },
        take: 8
      }),
      prisma.assessmentQuestion.findMany({
        orderBy: { position: "asc" }
      })
    ]);

    if (!task || !task.pullRequest) {
      return fallbackDashboardData();
    }

    return {
      currentTask: {
        id: task.publicId,
        title: task.title,
        summary: task.description,
        repository: `${task.repository.githubOwner}/${task.repository.githubName}`,
        branch: task.branchName,
        stack: task.repository.template.stack.split(",").map((item) => item.trim()),
        status: mapTaskStatus(task.status),
        acceptanceCriteria: asStringArray(task.acceptanceCriteria),
        editableScope: asStringArray(task.editableScope),
        mentorHint: task.mentorHint,
        commands: asCommands(task.commands, task.repository.cloneUrl),
        pipeline: asPipeline(task.pipeline)
      },
      pullRequestStatus: {
        number: task.pullRequest.githubNumber,
        title: task.pullRequest.title,
        state: mapPullRequestState(task.pullRequest.state),
        ciState: mapCiState(task.pullRequest.ciState),
        reviewSummary:
          task.pullRequest.reviewSummary ??
          "还没有检测到 PR。提交分支后，平台会同步 GitHub Actions 结果并启动 AI review。",
        checkRuns: asCheckRuns(task.pullRequest.checkRuns),
        comments: asReviewComments(task.pullRequest.comments)
      },
      progressMetrics: progressRecords.length
        ? progressRecords.map((record) => ({
            label: record.metric,
            value: record.value,
            detail: record.detail,
            tone: asMetricTone(record.tone)
          }))
        : fallbackProgressMetrics,
      assessmentQuestions: questions.length
        ? questions.map((question) => ({
            question: question.question,
            answer: question.answer
          }))
        : fallbackAssessmentQuestions
    };
  } catch (error) {
    console.warn("Falling back to mock dashboard data", error);
    return fallbackDashboardData();
  }
}

function fallbackDashboardData(): DashboardData {
  return {
    currentTask: fallbackCurrentTask,
    pullRequestStatus: fallbackPullRequestStatus,
    progressMetrics: fallbackProgressMetrics,
    assessmentQuestions: fallbackAssessmentQuestions
  };
}

function mapTaskStatus(status: string): TrainingTask["status"] {
  const map: Record<string, TrainingTask["status"]> = {
    CLAIMED: "claimed",
    IN_PROGRESS: "in_progress",
    REVIEW: "review",
    COMPLETE: "complete"
  };

  return map[status] ?? "claimed";
}

function mapPullRequestState(state: string): PullRequestStatus["state"] {
  const map: Record<string, PullRequestStatus["state"]> = {
    NOT_CREATED: "not_created",
    OPEN: "open",
    CHANGES_REQUESTED: "changes_requested",
    APPROVED: "approved",
    MERGED: "merged"
  };

  return map[state] ?? "not_created";
}

function mapCiState(state: string): PullRequestStatus["ciState"] {
  const map: Record<string, PullRequestStatus["ciState"]> = {
    WAITING: "waiting",
    RUNNING: "running",
    FAILED: "failed",
    PASSED: "passed"
  };

  return map[state] ?? "waiting";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function asCommands(value: unknown, cloneUrl: string): CommandJson {
  if (
    value &&
    typeof value === "object" &&
    "clone" in value &&
    "test" in value &&
    "devContainer" in value
  ) {
    const commands = value as Record<string, unknown>;

    return {
      clone: String(commands.clone),
      test: String(commands.test),
      devContainer: String(commands.devContainer)
    };
  }

  return {
    clone: `git clone ${cloneUrl}`,
    test: "mvn test",
    devContainer: "VS Code / Cursor: Reopen in Container"
  };
}

function asPipeline(value: unknown): PipelineJson {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is { label: string; state: WorkflowState } =>
          item &&
          typeof item === "object" &&
          "label" in item &&
          "state" in item &&
          typeof item.label === "string" &&
          isWorkflowState(item.state)
      )
      .map((item) => ({ label: item.label, state: item.state }));
  }

  return fallbackCurrentTask.pipeline;
}

function asCheckRuns(value: unknown): CheckRunJson {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is CheckRunJson[number] =>
          item &&
          typeof item === "object" &&
          "name" in item &&
          "status" in item &&
          "duration" in item &&
          typeof item.name === "string" &&
          isCheckStatus(item.status) &&
          typeof item.duration === "string"
      )
      .map((item) => ({
        name: item.name,
        status: item.status,
        duration: item.duration
      }));
  }

  return fallbackPullRequestStatus.checkRuns;
}

function asReviewComments(value: unknown): ReviewCommentJson {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is ReviewCommentJson[number] =>
          item &&
          typeof item === "object" &&
          "file" in item &&
          "line" in item &&
          "message" in item &&
          "severity" in item &&
          typeof item.file === "string" &&
          typeof item.line === "number" &&
          typeof item.message === "string" &&
          isSeverity(item.severity)
      )
      .map((item) => ({
        file: item.file,
        line: item.line,
        message: item.message,
        severity: item.severity
      }));
  }

  return fallbackPullRequestStatus.comments;
}

function asMetricTone(value: string): ProgressMetric["tone"] {
  return value === "green" || value === "amber" || value === "blue" || value === "red"
    ? value
    : "blue";
}

function isWorkflowState(value: unknown): value is WorkflowState {
  return value === "done" || value === "active" || value === "pending" || value === "blocked";
}

function isCheckStatus(
  value: unknown
): value is PullRequestStatus["checkRuns"][number]["status"] {
  return value === "waiting" || value === "passed" || value === "failed";
}

function isSeverity(
  value: unknown
): value is PullRequestStatus["comments"][number]["severity"] {
  return value === "info" || value === "warning" || value === "required";
}
