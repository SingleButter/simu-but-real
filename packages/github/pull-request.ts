import type { ReviewDiff } from "@/packages/agents";

const MAX_DIFF_LENGTH = 60_000;

type PullRequestLocation = {
  owner: string;
  repo: string;
  number: number;
};

export async function fetchPullRequestDiff(
  githubUrl: string | null,
  fallbackTitle: string
): Promise<ReviewDiff> {
  const location = parsePullRequestUrl(githubUrl);

  if (!location) {
    return unavailableDiff(`Cannot parse PR URL for ${fallbackTitle}.`);
  }

  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;

  if (!token) {
    return unavailableDiff("GITHUB_TOKEN is not configured.");
  }

  let response: Response;

  try {
    response = await fetch(
      `https://api.github.com/repos/${location.owner}/${location.repo}/pulls/${location.number}`,
      {
        headers: {
          Accept: "application/vnd.github.v3.diff",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28"
        },
        next: { revalidate: 0 }
      }
    );
  } catch {
    return unavailableDiff("GitHub diff request failed before receiving a response.");
  }

  if (!response.ok) {
    return unavailableDiff(`GitHub diff request failed with ${response.status}.`);
  }

  const text = await response.text();
  const truncated = text.length > MAX_DIFF_LENGTH;

  return {
    source: "github",
    text: truncated ? text.slice(0, MAX_DIFF_LENGTH) : text,
    truncated
  };
}

function parsePullRequestUrl(githubUrl: string | null): PullRequestLocation | null {
  if (!githubUrl) {
    return null;
  }

  try {
    const url = new URL(githubUrl);
    const [owner, repo, pullSegment, number] = url.pathname.split("/").filter(Boolean);

    if (url.hostname !== "github.com" || !owner || !repo || pullSegment !== "pull") {
      return null;
    }

    const parsedNumber = Number(number);

    if (!Number.isInteger(parsedNumber)) {
      return null;
    }

    return { owner, repo, number: parsedNumber };
  } catch {
    return null;
  }
}

function unavailableDiff(reason: string): ReviewDiff {
  return {
    source: "unavailable",
    text: reason,
    truncated: false
  };
}
