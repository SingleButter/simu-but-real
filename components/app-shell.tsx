import Link from "next/link";
import {
  Activity,
  ClipboardCheck,
  GitPullRequest,
  GraduationCap,
  LayoutDashboard,
  Settings,
  TerminalSquare
} from "lucide-react";

const navItems = [
  { label: "工作台", href: "/", icon: LayoutDashboard },
  { label: "入门测评", href: "/assessment", icon: ClipboardCheck },
  { label: "我的任务", href: "/tasks", icon: TerminalSquare },
  { label: "PR Review", href: "/review", icon: GitPullRequest },
  { label: "成长记录", href: "/progress", icon: GraduationCap },
  { label: "项目设置", href: "/settings", icon: Settings }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white/88 px-4 py-5 backdrop-blur lg:block">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-sm font-semibold text-white">
            SR
          </span>
          <span>
            <span className="block text-base font-semibold">Simu but Real</span>
            <span className="block text-xs text-muted">Java 企业流程训练</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink"
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          <div className="flex items-center gap-2 font-medium">
            <Activity className="h-4 w-4" />
            Java 入门 II
          </div>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            当前建议任务：低风险 bug fix + 测试补充。
          </p>
        </div>
      </aside>

      <section className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/82 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Training Workspace
              </p>
              <h1 className="mt-1 text-xl font-semibold">今天的开发工作</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 sm:inline-flex">
                GitHub 已连接
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                W
              </span>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-6">{children}</div>
      </section>
    </main>
  );
}
