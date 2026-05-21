import type {
  ReviewAgentInput,
  ReviewAgentResult,
  ReviewComment,
  ReviewDecision
} from "./types";
import { buildReviewPrompt } from "./prompt";

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-pro";

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type DeepSeekReviewJson = {
  decision?: unknown;
  summary?: unknown;
  comments?: unknown;
};

export function isDeepSeekConfigured() {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

export async function reviewWithDeepSeek(
  input: ReviewAgentInput
): Promise<ReviewAgentResult> {
  const prompt = buildReviewPrompt(input);
  const response = await fetch(`${baseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a senior Java backend reviewer. You must output valid json only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_object"
      },
      stream: false,
      temperature: 0.2,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek review failed with status ${response.status}`);
  }

  const payload = (await response.json()) as DeepSeekChatResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("DeepSeek review returned empty content");
  }

  return {
    ...parseDeepSeekReview(content),
    prompt,
    reviewer: "deepseek",
    reviewedAt: new Date().toISOString()
  };
}

function baseUrl() {
  return (process.env.DEEPSEEK_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

function parseDeepSeekReview(content: string): Pick<
  ReviewAgentResult,
  "decision" | "summary" | "comments"
> {
  const parsed = JSON.parse(content) as DeepSeekReviewJson;
  const decision = normalizeDecision(parsed.decision);
  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : "DeepSeek 已完成 review，但没有返回摘要。";

  return {
    decision,
    summary,
    comments: normalizeComments(parsed.comments)
  };
}

function normalizeDecision(value: unknown): ReviewDecision {
  if (
    value === "approved" ||
    value === "changes_requested" ||
    value === "blocked" ||
    value === "waiting"
  ) {
    return value;
  }

  return "changes_requested";
}

function normalizeComments(value: unknown): ReviewComment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, 8).map((comment) => {
    const record =
      comment && typeof comment === "object"
        ? (comment as Record<string, unknown>)
        : {};

    return {
      file: typeof record.file === "string" && record.file ? record.file : "Pull Request",
      line:
        typeof record.line === "number" && Number.isFinite(record.line)
          ? Math.max(1, Math.floor(record.line))
          : 1,
      severity: normalizeSeverity(record.severity),
      message:
        typeof record.message === "string" && record.message.trim()
          ? record.message.trim()
          : "Review Agent 返回了一条需要人工确认的评论。"
    };
  });
}

function normalizeSeverity(value: unknown): ReviewComment["severity"] {
  if (value === "info" || value === "warning" || value === "required") {
    return value;
  }

  return "warning";
}
