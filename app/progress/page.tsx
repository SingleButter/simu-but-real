import { Activity, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Section, SectionHeader } from "@/components/ui";
import { progressMetrics } from "@/lib/mock-data";
import { metricClass } from "@/lib/status";

export default function ProgressPage() {
  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <Section>
          <SectionHeader eyebrow="Progress" title="成长记录" />
          <div className="grid gap-4 md:grid-cols-2">
            {progressMetrics.map((metric) => (
              <div className={`rounded-md border p-4 ${metricClass(metric.tone)}`} key={metric.label}>
                <p className="text-sm font-medium">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 opacity-80">{metric.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <SectionHeader eyebrow="Leveling" title="动态难度调整" />
          <div className="space-y-4 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <TrendingUp className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              连续 2 个 PR 一次通过后，任务难度提升到“小功能改造”。
            </div>
            <div className="flex gap-3">
              <Activity className="mt-1 h-4 w-4 shrink-0 text-amber-600" />
              如果 CI 失败集中在同一类型，Mentor Agent 会分配针对性练习任务。
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
