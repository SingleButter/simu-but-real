import { PullRequestState } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTaskPipeline } from "@/lib/task-pipeline";
import type { PullRequestStatus, TrainingTask } from "@/lib/types";
import { reviewPullRequest, type ReviewComment, type ReviewDecision } from "@/packages/agents";
import { fetchPullRequestDiff } from "@/packages/github";

export const runtime = "nodejs";

type ReviewRequestBody = {
  taskId?: string;
};

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "database_not_configured" },
      { status: 503 }
    );
  }

  const session = await getServerSession(authOptions);
  const body = await readBody(request);
  const task = await findReviewTarget(body.taskId, session?.user?.githubId);

  if (!task?.pullRequest) {
    return NextResponse.json(
      { ok: false, error: "review_target_not_found" },
      { status: 404 }
    );
  }

  const trainingTask = mapTrainingTask(task);
  const pullRequest = mapPullRequestStatus(task.pullRequest);
  const diff = await fetchPullRequestDiff(
    task.pullRequest.githubUrl,
    task.pullRequest.title
  );
  const result = await reviewPullRequest({
    task: trainingTask,
    pullRequest,
    diff,
    ciLogSummary: buildCiLogSummary(pullRequest)
  });
  const comments = result.comments.map(normalizeComment);
  const decision = mapReviewDecision(result.decision, task.pullRequest.state);

  await prisma.$transaction([
    prisma.reviewResult.create({
      data: {
        pullRequestId: task.pullRequest.id,
        decision,
        summary: result.summary,
        comments
      }
    }),
    prisma.pullRequestRecord.update({
      where: { id: task.pullRequest.id },
      data: {
        state: decision,
        reviewSummary: result.summary,
        comments,
        lastSyncedAt: new Date()
      }
    }),
    prisma.taskTicket.update({
      where: { id: task.id },
      data: {
        pipeline: buildTaskPipeline({
          taskStatus: task.status,
          ciState: task.pullRequest.ciState,
          pullRequestState: decision
        })
      }
    })
  ]);

  return NextResponse.json({
    ok: true,
    decision: result.decision,
    reviewer: result.reviewer,
    diffSource: diff.source,
    summary: result.summary,
    comments
  });
}

async function readBody(request: Request): Promise<ReviewRequestBody> {
  try {
    return (await request.json()) as ReviewRequestBody;
  } catch {
    return {};
  }
}

async function findReviewTarget(taskId: string | undefined, githubId: string | undefined) {
  return prisma.taskTicket.findFirst({
    where: {
      ...(taskId ? { publicId: taskId } : {}),
      ...(githubId
        ? {
            user: {
              githubId
            }
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      repository: {
        include: {
          template: true
        }
      },
      pullRequest: true
    }
  });
}

function mapTrainingTask(
  task: NonNullable<Awaited<ReturnType<typeof findReviewTarget>>>
): TrainingTask {
  return {
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
    commands: {
      clone: `git clone ${task.repository.cloneUrl}`,
      test: "mvn test",
      devContainer: "VS Code / Cursor: Reopen in Container"
    },
    pipeline: []
  };
}

function mapPullRequestStatus(
  pullRequest: NonNullable<
    NonNullable<Awaited<ReturnType<typeof findReviewTarget>>>["pullRequest"]
  >
): PullRequestStatus {
  return {
    number: pullRequest.githubNumber,
    title: pullRequest.title,
    githubUrl: pullRequest.githubUrl,
    state: mapPullRequestState(pullRequest.state),
    ciState: mapCiState(pullRequest.ciState),
    reviewSummary: pullRequest.reviewSummary ?? "",
    checkRuns: [],
    comments: []
  };
}

function mapReviewDecision(
  decision: ReviewDecision,
  currentState: PullRequestState
): PullRequestState {
  if (currentState === PullRequestState.MERGED) {
    return PullRequestState.MERGED;
  }

  const decisions: Record<ReviewDecision, PullRequestState> = {
    approved: PullRequestState.APPROVED,
    changes_requested: PullRequestState.CHANGES_REQUESTED,
    blocked: PullRequestState.CHANGES_REQUESTED,
    waiting: currentState
  };

  return decisions[decision];
}

function mapTaskStatus(status: string): TrainingTask["status"] {
  const statuses: Record<string, TrainingTask["status"]> = {
    CLAIMED: "claimed",
    IN_PROGRESS: "in_progress",
    REVIEW: "review",
    COMPLETE: "complete"
  };

  return statuses[status] ?? "claimed";
}

function mapPullRequestState(state: string): PullRequestStatus["state"] {
  const states: Record<string, PullRequestStatus["state"]> = {
    NOT_CREATED: "not_created",
    OPEN: "open",
    CHANGES_REQUESTED: "changes_requested",
    APPROVED: "approved",
    MERGED: "merged"
  };

  return states[state] ?? "not_created";
}

function mapCiState(state: string): PullRequestStatus["ciState"] {
  const states: Record<string, PullRequestStatus["ciState"]> = {
    WAITING: "waiting",
    RUNNING: "running",
    FAILED: "failed",
    PASSED: "passed"
  };

  return states[state] ?? "waiting";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function buildCiLogSummary(pullRequest: PullRequestStatus) {
  return `Current CI state: ${pullRequest.ciState}.`;
}

function normalizeComment(comment: ReviewComment) {
  return {
    file: comment.file,
    line: comment.line,
    severity: comment.severity,
    message: comment.message
  };
}
