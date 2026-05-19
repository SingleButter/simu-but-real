import {
  CheckCircle2,
  Clock3,
  Container,
  GitBranch,
  GitPullRequest,
  Lightbulb,
  PlayCircle,
  ShieldCheck
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommandBlock, IconLabel, Section, SectionHeader } from "@/components/ui";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { metricClass, workflowClass } from "@/lib/status";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const { currentTask, progressMetrics, pullRequestStatus } =
    await getDashboardData(session?.user?.githubId);

  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
        <div className="space-y-5">
          <Section className="soft-grid">
            <SectionHeader
              eyebrow="当前任务"
              title={currentTask.title}
              action={
                <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800">
                  {currentTask.id}
                </span>
              }
            />
            <p className="max-w-3xl text-sm leading-6 text-slate-700">
              {currentTask.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {currentTask.stack.map((item) => (
                <span
                  className="rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {currentTask.pipeline.map((step) => (
                <div
                  className={`rounded-md border px-3 py-3 text-sm font-medium ${workflowClass(step.state)}`}
                  key={step.label}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </Section>

          <section className="grid gap-5 lg:grid-cols-2">
            <Section>
              <SectionHeader eyebrow="Repository" title="项目仓库" />
              <IconLabel
                detail={currentTask.repository}
                icon={GitBranch}
                label="平台托管私有仓库"
              />
              <div className="mt-4">
                <CommandBlock>{currentTask.commands.clone}</CommandBlock>
              </div>
            </Section>

            <Section>
              <SectionHeader eyebrow="Environment" title="开发环境" />
              <div className="space-y-4">
                <IconLabel
                  detail="VS Code / Cursor 可一键进入一致环境"
                  icon={Container}
                  label="推荐 Dev Container"
                />
                <IconLabel
                  detail="IntelliJ IDEA、Eclipse、Vim 或本地 Maven 都可以"
                  icon={ShieldCheck}
                  label="允许本地 IDE"
                />
              </div>
            </Section>
          </section>

          <Section>
            <SectionHeader eyebrow="Mentor Hint" title="下一步建议" />
            <div className="flex gap-3">
              <span className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-700">
                <Lightbulb className="h-5 w-5" />
              </span>
              <p className="text-sm leading-6 text-slate-700">
                {currentTask.mentorHint}
              </p>
            </div>
          </Section>
        </div>

        <aside className="space-y-5">
          <Section>
            <SectionHeader eyebrow="Pull Request" title="PR 状态" />
            <div className="space-y-4">
              <IconLabel
                detail={currentTask.branch}
                icon={GitPullRequest}
                label="分支"
              />
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-md border border-line bg-slate-50 p-2 text-slate-600">
                  <Clock3 className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">
                    {pullRequestLabel(pullRequestStatus.state, pullRequestStatus.number)}
                  </span>
                  {pullRequestStatus.githubUrl ? (
                    <a
                      className="mt-0.5 block text-sm leading-5 text-blue-700 hover:text-blue-900"
                      href={pullRequestStatus.githubUrl}
                    >
                      {pullRequestStatus.githubUrl}
                    </a>
                  ) : (
                    <span className="mt-0.5 block text-sm leading-5 text-muted">
                      {pullRequestStatus.reviewSummary}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </Section>

          <Section>
            <SectionHeader eyebrow="GitHub Actions" title="CI 状态" />
            <div className="space-y-3">
              {pullRequestStatus.checkRuns.map((check) => (
                <div
                  className="flex items-center justify-between border-b border-line pb-3 last:border-b-0 last:pb-0"
                  key={check.name}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {check.status === "passed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-slate-400" />
                    )}
                    {check.name}
                  </span>
                  <span className="text-xs text-muted">{check.duration}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section>
            <SectionHeader eyebrow="Progress" title="工程行为指标" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {progressMetrics.map((metric) => (
                <div
                  className={`rounded-md border px-3 py-3 ${metricClass(metric.tone)}`}
                  key={metric.label}
                >
                  <div className="text-2xl font-semibold">{metric.value}</div>
                  <div className="mt-1 text-sm font-medium">{metric.label}</div>
                  <div className="mt-1 text-xs leading-5 opacity-80">
                    {metric.detail}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </aside>
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
