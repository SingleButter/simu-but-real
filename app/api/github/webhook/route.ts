import { NextResponse } from "next/server";

type GitHubWebhookBody = {
  action?: string;
  repository?: {
    full_name?: string;
  };
  pull_request?: {
    number?: number;
    head?: {
      sha?: string;
    };
  };
  workflow_run?: {
    conclusion?: string | null;
    status?: string;
  };
};

export async function POST(request: Request) {
  const event = request.headers.get("x-github-event") ?? "unknown";
  const body = (await request.json()) as GitHubWebhookBody;

  return NextResponse.json({
    received: true,
    event,
    action: body.action ?? null,
    repository: body.repository?.full_name ?? null,
    pullRequest: body.pull_request?.number ?? null,
    nextStep: "enqueue_for_worker_processing"
  });
}
