"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";

export function ReviewRunButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runReview() {
    setError(null);
    setIsRunning(true);

    try {
      const response = await fetch("/api/agents/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ taskId })
      });

      if (!response.ok) {
        setError("Review 启动失败");
        return;
      }

      router.refresh();
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isRunning}
        onClick={runReview}
        type="button"
      >
        {isRunning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
        运行 Review
      </button>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}
