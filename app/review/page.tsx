import { Bot, GitPullRequest, MessageSquareWarning } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Section, SectionHeader } from "@/components/ui";
import { getDashboardData } from "@/lib/data";

export default async function ReviewPage() {
  const { pullRequestStatus } = await getDashboardData();

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
              <span className="text-sm font-medium">PR 未创建</span>
            </div>
            <p className="text-sm leading-6 text-muted">
              创建 PR 后，平台会通过 GitHub webhook 同步 diff、CI 和 review 状态，并在 GitHub 行内评论具体问题。
            </p>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
