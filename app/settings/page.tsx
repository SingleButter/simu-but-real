import { Github, KeyRound, Webhook } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Section, SectionHeader } from "@/components/ui";

export default function SettingsPage() {
  return (
    <AppShell>
      <Section>
        <SectionHeader eyebrow="Project Settings" title="集成配置占位" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Github,
              title: "GitHub Organization",
              detail: "company-simu-dev / 后续通过环境变量配置"
            },
            {
              icon: Github,
              title: "GitHub OAuth",
              detail: "已接入 NextAuth，使用 GitHub 登录识别真实用户"
            },
            {
              icon: KeyRound,
              title: "GitHub App",
              detail: "使用 installation token 操作训练仓库"
            },
            {
              icon: Webhook,
              title: "Webhook",
              detail: "监听 push、pull_request、check_run、workflow_run"
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div className="rounded-md border border-line bg-slate-50 p-4" key={item.title}>
                <Icon className="h-5 w-5 text-slate-600" />
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </Section>
    </AppShell>
  );
}
