import { Bot, GitPullRequest, MessageSquareWarning } from "lucide-react";
import { getServerSession } from "next-auth";
import { AppShell } from "@/components/app-shell";
import { Section, SectionHeader } from "@/components/ui";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  const { pullRequestStatus } = await getDashboardData(session?.user?.githubId);
  const label = pullRequestLabel(pullRequestStatus.state, pullRequestStatus.number);

  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <Section>
          <SectionHeader eyebrow="AI Review" title="Review 摘要" />
          <div className="flex gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <Bot className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6">{pullRequestStatus.reviewSummary}</p>
          </div>
          <div className="mt-5 space-y-3">
            {pullRequestStatus.comments.map((comment) => (
              <div className="rounded-md border border-line bg-white p-4" key={`${comment.file}-${comment.line}`}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquareWarning className="h-4 w-4 text-amber-600" />
                  {comment.file}:{comment.line}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{comment.message}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <SectionHeader eyebrow="Pull Request" title="GitHub 状态" />
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-md border border-line bg-slate-50 p-3">
              <GitPullRequest className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            {pullRequestStatus.githubUrl ? (
              <a
                className="block rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
                href={pullRequestStatus.githubUrl}
              >
                打开 GitHub PR
              </a>
            ) : null}
            <p className="text-sm leading-6 text-muted">
              创建 PR 后，平台会通过 GitHub webhook 同步 diff、CI 和 review 状态，并在 GitHub 行内评论具体问题。
            </p>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function pullRequestLabel(
  state: "not_created" | "open" | "changes_requested" | "approved" | "merged",
  number: number | null
) {
  const prefix = number ? `PR #${number}` : "PR";
  const labels = {
    not_created: "未创建",
    open: "已创建",
    changes_requested: "需修改",
    approved: "已通过",
    merged: "已合并"
  };

  return `${prefix} ${labels[state]}`;
}
