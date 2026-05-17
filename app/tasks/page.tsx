import { CheckCircle2, FileCode2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommandBlock, Section, SectionHeader } from "@/components/ui";
import { getDashboardData } from "@/lib/data";

export default async function TasksPage() {
  const { currentTask } = await getDashboardData();

  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <Section>
          <SectionHeader eyebrow={currentTask.id} title={currentTask.title} />
          <p className="text-sm leading-6 text-slate-700">{currentTask.summary}</p>
          <div className="mt-6">
            <h3 className="text-sm font-semibold">验收标准</h3>
            <ul className="mt-3 space-y-3">
              {currentTask.acceptanceCriteria.map((item) => (
                <li className="flex gap-3 text-sm leading-6 text-slate-700" key={item}>
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <div className="space-y-5">
          <Section>
            <SectionHeader eyebrow="Editable Scope" title="允许修改范围" />
            <div className="space-y-2">
              {currentTask.editableScope.map((file) => (
                <div className="flex gap-2 rounded-md border border-line bg-slate-50 px-3 py-2 text-sm text-slate-700" key={file}>
                  <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span className="code-line">{file}</span>
                </div>
              ))}
            </div>
          </Section>
          <Section>
            <SectionHeader eyebrow="Local Commands" title="本地命令" />
            <div className="space-y-3">
              <CommandBlock>{currentTask.commands.clone}</CommandBlock>
              <CommandBlock>{currentTask.commands.test}</CommandBlock>
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}
