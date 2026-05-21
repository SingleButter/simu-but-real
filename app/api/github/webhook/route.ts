import { createHmac, timingSafeEqual } from "crypto";
import { CiState, PullRequestState, TaskStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildTaskPipeline } from "@/lib/task-pipeline";

export const runtime = "nodejs";

type GitHubRepository = {
  full_name?: string;
};

type GitHubPullRequestRef = {
  ref?: string;
  sha?: string;
};

type GitHubPullRequest = {
  number?: number;
  title?: string;
  html_url?: string;
  state?: string;
  merged?: boolean;
  head?: GitHubPullRequestRef;
  base?: GitHubPullRequestRef;
};

type GitHubCheckPullRequest = {
  number?: number;
  head?: GitHubPullRequestRef;
  base?: GitHubPullRequestRef;
};

type GitHubCheckPayload = {
  name?: string;
  status?: string;
  conclusion?: string | null;
  html_url?: string;
  pull_requests?: GitHubCheckPullRequest[];
};

type GitHubWebhookBody = {
  action?: string;
  repository?: GitHubRepository;
  pull_request?: GitHubPullRequest;
  check_run?: GitHubCheckPayload;
  check_suite?: GitHubCheckPayload;
  workflow_run?: GitHubCheckPayload;
};

type RepositoryParts = {
  owner: string;
  name: string;
};

type SyncResult = {
  synced: boolean;
  reason?: string;
  taskId?: string;
  pullRequestNumber?: number;
  state?: PullRequestState;
  ciState?: CiState;
};

export async function POST(request: Request) {
  const event = request.headers.get("x-github-event") ?? "unknown";
  const signature = request.headers.get("x-hub-signature-256");
  const rawBody = await request.text();

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json(
      { received: false, event, error: "invalid_signature" },
      { status: 401 }
    );
  }

  let body: GitHubWebhookBody;

  try {
    body = JSON.parse(rawBody) as GitHubWebhookBody;
  } catch {
    return NextResponse.json(
      { received: false, event, error: "invalid_json" },
      { status: 400 }
    );
  }

  const result = await syncWebhookEvent(event, body);

  return NextResponse.json({
    received: true,
    event,
    action: body.action ?? null,
    repository: body.repository?.full_name ?? null,
    ...result
  });
}

async function syncWebhookEvent(
  event: string,
  body: GitHubWebhookBody
): Promise<SyncResult> {
  if (event === "ping") {
    return { synced: true, reason: "ping" };
  }

  if (event === "pull_request") {
    return syncPullRequestEvent(body);
  }

  if (event === "check_run") {
    return syncCheckEvent(body, body.check_run, "check_run");
  }

  if (event === "check_suite") {
    return syncCheckEvent(body, body.check_suite, "check_suite");
  }

  if (event === "workflow_run") {
    return syncCheckEvent(body, body.workflow_run, "workflow_run");
  }

  return { synced: false, reason: "unsupported_event" };
}

async function syncPullRequestEvent(body: GitHubWebhookBody): Promise<SyncResult> {
  const repository = parseRepository(body.repository?.full_name);
  const pullRequest = body.pull_request;
  const branchName = pullRequest?.head?.ref;

  if (!repository || !pullRequest?.number || !branchName) {
    return { synced: false, reason: "missing_pull_request_fields" };
  }

  const task = await prisma.taskTicket.findFirst({
    where: {
      branchName,
      repository: {
        githubOwner: repository.owner,
        githubName: repository.name
      }
    },
    include: {
      pullRequest: true
    }
  });

  if (!task) {
    return { synced: false, reason: "task_not_found" };
  }

  const pullRequestState = mapPullRequestState(body.action, pullRequest);
  const taskStatus = pullRequestState === PullRequestState.MERGED
    ? TaskStatus.COMPLETE
    : TaskStatus.REVIEW;

  await prisma.$transaction([
    prisma.taskTicket.update({
      where: { id: task.id },
      data: {
        status: taskStatus,
        pipeline: buildTaskPipeline({
          taskStatus,
          ciState: task.pullRequest?.ciState ?? CiState.WAITING,
          pullRequestState
        })
      }
    }),
    prisma.pullRequestRecord.upsert({
      where: { taskId: task.id },
      update: {
        githubNumber: pullRequest.number,
        title: pullRequest.title ?? task.title,
        githubUrl: pullRequest.html_url ?? null,
        state: pullRequestState,
        reviewSummary: buildReviewSummary(pullRequestState),
        lastSyncedAt: new Date()
      },
      create: {
        taskId: task.id,
        githubNumber: pullRequest.number,
        title: pullRequest.title ?? task.title,
        githubUrl: pullRequest.html_url ?? null,
        state: pullRequestState,
        ciState: CiState.WAITING,
        reviewSummary: buildReviewSummary(pullRequestState),
        checkRuns: [
          { name: "mvn test", status: "waiting", duration: "--" },
          { name: "branch protection", status: "waiting", duration: "--" },
          { name: "ai-review-gate", status: "waiting", duration: "--" }
        ],
        comments: []
      }
    })
  ]);

  return {
    synced: true,
    taskId: task.publicId,
    pullRequestNumber: pullRequest.number,
    state: pullRequestState
  };
}

async function syncCheckEvent(
  body: GitHubWebhookBody,
  checkPayload: GitHubCheckPayload | undefined,
  checkType: string
): Promise<SyncResult> {
  const repository = parseRepository(body.repository?.full_name);
  const pullRequestNumber = checkPayload?.pull_requests?.[0]?.number;

  if (!repository || !pullRequestNumber) {
    return { synced: false, reason: "missing_check_fields" };
  }

  const pullRequestRecord = await prisma.pullRequestRecord.findFirst({
    where: {
      githubNumber: pullRequestNumber,
      task: {
        repository: {
          githubOwner: repository.owner,
          githubName: repository.name
        }
      }
    },
    include: {
      task: true
    }
  });

  if (!pullRequestRecord) {
    return { synced: false, reason: "pull_request_not_found" };
  }

  const ciState = mapCiState(checkPayload?.status, checkPayload?.conclusion);
  const checkRuns = upsertCheckRun(
    pullRequestRecord.checkRuns,
    checkPayload?.name ?? checkType,
    ciState
  );

  await prisma.$transaction([
    prisma.pullRequestRecord.update({
      where: { id: pullRequestRecord.id },
      data: {
        ciState,
        checkRuns,
        reviewSummary:
          ciState === CiState.PASSED
            ? "CI 已通过，等待 review 或合并。"
            : pullRequestRecord.reviewSummary,
        lastSyncedAt: new Date()
      }
    }),
    prisma.taskTicket.update({
      where: { id: pullRequestRecord.taskId },
      data: {
        pipeline: buildTaskPipeline({
          taskStatus: pullRequestRecord.task.status,
          ciState,
          pullRequestState: pullRequestRecord.state
        })
      }
    })
  ]);

  return {
    synced: true,
    taskId: pullRequestRecord.task.publicId,
    pullRequestNumber,
    ciState
  };
}

function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    return true;
  }

  if (!signature?.startsWith("sha256=")) {
    return false;
  }

  const expected = `sha256=${createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function parseRepository(fullName: string | undefined): RepositoryParts | null {
  const [owner, name] = fullName?.split("/") ?? [];

  if (!owner || !name) {
    return null;
  }

  return { owner, name };
}

function mapPullRequestState(
  action: string | undefined,
  pullRequest: GitHubPullRequest
): PullRequestState {
  if (action === "closed" && pullRequest.merged) {
    return PullRequestState.MERGED;
  }

  if (action === "closed") {
    return PullRequestState.NOT_CREATED;
  }

  return PullRequestState.OPEN;
}

function mapCiState(status: string | undefined, conclusion: string | null | undefined) {
  if (status && status !== "completed") {
    return CiState.RUNNING;
  }

  if (conclusion === "success") {
    return CiState.PASSED;
  }

  if (conclusion === "failure" || conclusion === "timed_out" || conclusion === "cancelled") {
    return CiState.FAILED;
  }

  return CiState.WAITING;
}

function buildReviewSummary(state: PullRequestState) {
  const summaries: Record<PullRequestState, string> = {
    NOT_CREATED: "PR 已关闭但未合并。",
    OPEN: "已检测到 PR，等待 CI 和 review。",
    CHANGES_REQUESTED: "Review 要求修改。",
    APPROVED: "Review 已通过，等待合并。",
    MERGED: "PR 已合并，任务完成。"
  };

  return summaries[state];
}

function upsertCheckRun(
  value: unknown,
  name: string,
  ciState: CiState
): Array<{ name: string; status: "waiting" | "passed" | "failed"; duration: string }> {
  const status = mapCheckRunStatus(ciState);
  const existing = Array.isArray(value)
    ? value.filter(isCheckRun)
    : [];
  const next = { name, status, duration: "--" };
  const index = existing.findIndex((check) => check.name === name);

  if (index === -1) {
    return [next, ...existing];
  }

  return existing.map((check, currentIndex) => (currentIndex === index ? next : check));
}

function mapCheckRunStatus(ciState: CiState): "waiting" | "passed" | "failed" {
  if (ciState === CiState.PASSED) {
    return "passed";
  }

  if (ciState === CiState.FAILED) {
    return "failed";
  }

  return "waiting";
}

function isCheckRun(
  value: unknown
): value is { name: string; status: "waiting" | "passed" | "failed"; duration: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "name" in value &&
    "status" in value &&
    "duration" in value &&
    typeof value.name === "string" &&
    (value.status === "waiting" || value.status === "passed" || value.status === "failed") &&
    typeof value.duration === "string"
  );
}
