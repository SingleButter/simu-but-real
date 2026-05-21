import type { ReviewAgentInput } from "./types";

export const REVIEW_PROMPT_VERSION = "review-agent-v1";

export function buildReviewPrompt(input: ReviewAgentInput) {
  const acceptanceCriteria = input.task.acceptanceCriteria
    .map((criterion) => `- ${criterion}`)
    .join("\n");
  const editableScope = input.task.editableScope
    .map((path) => `- ${path}`)
    .join("\n");

  return [
    `You are the Simu but Real reviewer for a junior Java backend training task.`,
    `Return strict json only. Do not wrap the json in markdown.`,
    `The json must match this shape:`,
    `{"decision":"approved|changes_requested|blocked|waiting","summary":"string","comments":[{"file":"string","line":1,"severity":"info|warning|required","message":"string"}]}`,
    `Use Chinese for summary and comments.`,
    `Review decision rules: approved means the PR satisfies the task; changes_requested means code changes are needed; blocked means review cannot proceed; waiting means CI or PR state is not ready.`,
    `Focus on correctness, task acceptance criteria, editable scope, regression risk, test coverage, and overengineering.`,
    `Return at most 8 comments.`,
    ``,
    `Task`,
    `ID: ${input.task.id}`,
    `Title: ${input.task.title}`,
    `Summary: ${input.task.summary}`,
    ``,
    `Acceptance criteria`,
    acceptanceCriteria,
    ``,
    `Editable scope`,
    editableScope,
    ``,
    `Pull request`,
    `Title: ${input.pullRequest.title}`,
    `State: ${input.pullRequest.state}`,
    `CI: ${input.pullRequest.ciState}`,
    ``,
    `CI log summary`,
    input.ciLogSummary,
    ``,
    `Diff source: ${input.diff.source}`,
    `Diff truncated: ${String(input.diff.truncated)}`,
    ``,
    `Diff`,
    input.diff.text || "No diff is available."
  ].join("\n");
}
