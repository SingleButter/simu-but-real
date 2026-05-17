import { NextResponse } from "next/server";
import { reviewPullRequest } from "@/packages/agents";
import { getDashboardData } from "@/lib/data";

export async function POST() {
  const { currentTask, pullRequestStatus } = await getDashboardData();

  const result = reviewPullRequest({
    task: currentTask,
    pullRequest: pullRequestStatus,
    diffSummary: "No PR diff available in mock mode.",
    ciLogSummary: "CI has not run yet."
  });

  return NextResponse.json(result);
}
