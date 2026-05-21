import type { ReviewAgentInput, ReviewAgentResult } from "./types";
import { buildReviewPrompt } from "./prompt";

export function reviewWithLocalRules(input: ReviewAgentInput): ReviewAgentResult {
  const comments = [];
  const prompt = buildReviewPrompt(input);

  if (input.pullRequest.state === "not_created") {
    return {
      decision: "waiting",
      summary: "还没有检测到 PR。创建 PR 并等待 CI 后再启动 review。",
      comments: [],
      prompt,
      reviewer: "local-rules",
      reviewedAt: new Date().toISOString()
    };
  }

  if (input.pullRequest.ciState === "failed") {
    return {
      decision: "blocked",
      summary: "CI 当前失败。先修复 GitHub Actions 中的失败测试，再进行完整代码 review。",
      comments: [
        {
          file: "GitHub Actions",
          line: 1,
          severity: "required",
          message: "CI 未通过时暂不批准 PR。请先根据失败日志本地复现并修复。"
        }
      ],
      prompt,
      reviewer: "local-rules",
      reviewedAt: new Date().toISOString()
    };
  }

  if (input.pullRequest.ciState !== "passed") {
    return {
      decision: "waiting",
      summary: "等待 CI 完成并通过后再进行完整代码 review。",
      comments: [],
      prompt,
      reviewer: "local-rules",
      reviewedAt: new Date().toISOString()
    };
  }

  if (input.diff.source === "unavailable") {
    return {
      decision: "blocked",
      summary: "CI 已通过，但当前无法读取 PR diff。请配置 GitHub token 或稍后重试 review。",
      comments: [
        {
          file: "Pull Request",
          line: 1,
          severity: "required",
          message: "Review Agent 需要读取 PR diff 才能判断是否满足验收标准和允许修改范围。"
        }
      ],
      prompt,
      reviewer: "local-rules",
      reviewedAt: new Date().toISOString()
    };
  }

  comments.push(...findOutOfScopeChanges(input));

  if (!containsAny(input.diff.text, ["src/test/", "Test.java", "@Test"])) {
    comments.push({
      file: "tests",
      line: 1,
      severity: "required" as const,
      message: "本任务要求补充状态流转相关测试，但 diff 中没有看到测试文件改动。"
    });
  }

  const decision = comments.some((comment) => comment.severity === "required")
    ? "changes_requested"
    : "approved";

  return {
    decision,
    summary:
      decision === "approved"
        ? "CI 已通过，diff 未发现超出允许范围的修改，第一版规则 review 通过。"
        : "CI 已通过，但 review 发现需要修改的问题。",
    comments,
    prompt,
    reviewer: "local-rules",
    reviewedAt: new Date().toISOString()
  };
}

function findOutOfScopeChanges(input: ReviewAgentInput) {
  const changedFiles = extractChangedFiles(input.diff.text);
  const editableScope = new Set(input.task.editableScope);

  return changedFiles
    .filter((file) => !editableScope.has(file))
    .map((file) => ({
      file,
      line: 1,
      severity: "required" as const,
      message: "该文件不在任务允许修改范围内，请确认是否必须修改。"
    }));
}

function extractChangedFiles(diff: string) {
  return Array.from(diff.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm))
    .map((match) => match[2])
    .filter(Boolean);
}

function containsAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}
