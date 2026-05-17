import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WorkflowState } from "@/lib/types";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export function workflowClass(state: WorkflowState) {
  return {
    done: "border-emerald-200 bg-emerald-50 text-emerald-700",
    active: "border-blue-200 bg-blue-50 text-blue-700",
    pending: "border-slate-200 bg-white text-slate-500",
    blocked: "border-rose-200 bg-rose-50 text-rose-700"
  }[state];
}

export function metricClass(tone: "blue" | "green" | "amber" | "red") {
  return {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-rose-200 bg-rose-50 text-rose-800"
  }[tone];
}
