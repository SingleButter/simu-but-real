import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/status";

export function Section({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-line bg-white p-5 shadow-panel",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  eyebrow,
  action
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-lg font-semibold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function IconLabel({
  icon: Icon,
  label,
  detail
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 rounded-md border border-line bg-slate-50 p-2 text-slate-600">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-sm leading-5 text-muted">{detail}</span>
      </span>
    </div>
  );
}

export function CommandBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="code-line overflow-hidden rounded-md border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100">
      {children}
    </pre>
  );
}
