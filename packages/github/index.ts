export type GitHubRepositoryRequest = {
  userId: string;
  templateId: string;
  organization: string;
  repositoryName: string;
};

export type PullRequestEvent = {
  repository: string;
  number: number;
  action: "opened" | "synchronize" | "closed" | "reopened";
  headSha: string;
};

export async function createTrainingRepository(
  request: GitHubRepositoryRequest
) {
  return {
    repository: `${request.organization}/${request.repositoryName}`,
    cloneUrl: `git@github.com:${request.organization}/${request.repositoryName}.git`,
    defaultBranch: "main",
    templateId: request.templateId
  };
}

export async function submitAiReview() {
  return {
    state: "commented",
    body: "AI review summary will be posted to the pull request."
  };
}

export { fetchPullRequestDiff } from "./pull-request";
