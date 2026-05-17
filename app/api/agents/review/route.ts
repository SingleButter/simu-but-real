import { NextResponse } from "next/server";
import { reviewPullRequest } from "@/packages/agents";
import { currentTask, pullRequestStatus } from "@/lib/mock-data";

export async function POST() {
  const result = reviewPullRequest({
    task: currentTask,
    pullRequest: pullRequestStatus,
    diffSummary: "No PR diff available in mock mode.",
    ciLogSummary: "CI has not run yet."
  });

  return NextResponse.json(result);
}
