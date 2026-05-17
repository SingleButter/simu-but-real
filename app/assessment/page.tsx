import { ClipboardCheck, Code2, GitBranch } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Section, SectionHeader } from "@/components/ui";
import { assessmentQuestions } from "@/lib/mock-data";

export default function AssessmentPage() {
  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <Section>
          <SectionHeader eyebrow="Assessment" title="入门测评" />
          <p className="max-w-3xl text-sm leading-6 text-slate-700">
            MVP 采用小测验 + 读代码题，用来判断 Java、Spring Boot、Git、测试和工程流程的基础理解。
          </p>
          <div className="mt-6 space-y-4">
            {assessmentQuestions.map((item, index) => (
              <div className="rounded-md border border-line bg-slate-50 p-4" key={item.question}>
                <p className="text-sm font-semibold">
                  {index + 1}. {item.question}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <SectionHeader eyebrow="Result" title="初始等级" />
          <div className="space-y-4">
            {[
              { icon: Code2, label: "Java 基础", value: "稳定" },
              { icon: ClipboardCheck, label: "测试意识", value: "需要训练" },
              { icon: GitBranch, label: "Git 流程", value: "入门" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="flex items-center justify-between border-b border-line pb-3 last:border-b-0" key={item.label}>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4 text-slate-500" />
                    {item.label}
                  </span>
                  <span className="text-sm text-muted">{item.value}</span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
