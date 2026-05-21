import type { ReviewAgentInput } from "./types";
import { reviewWithLocalRules } from "./local-reviewer";
import { isDeepSeekConfigured, reviewWithDeepSeek } from "./deepseek-reviewer";

export async function reviewPullRequest(input: ReviewAgentInput) {
  if (shouldUseLocalRules(input)) {
    return reviewWithLocalRules(input);
  }

  if (isDeepSeekConfigured()) {
    try {
      return await reviewWithDeepSeek(input);
    } catch (error) {
      console.warn("DeepSeek review failed, falling back to local rules", error);
    }
  }

  return reviewWithLocalRules(input);
}

export type {
  ReviewAgentInput,
  ReviewAgentResult,
  ReviewComment,
  ReviewDecision,
  ReviewDiff
} from "./types";

function shouldUseLocalRules(input: ReviewAgentInput) {
  return input.pullRequest.ciState !== "passed" || input.diff.source === "unavailable";
}
