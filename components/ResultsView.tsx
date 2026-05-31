"use client";

import { useEffect, useState } from "react";
import type { CompatibilityResult } from "@/lib/business-logic";
import { Card } from "@/components/ui";

type FlowState = {
  status: "created" | "processing" | "completed" | "not_found";
  result?: CompatibilityResult;
};

export default function ResultsView({ flowId }: { flowId: string }) {
  const [state, setState] = useState<FlowState>({ status: "processing" });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`/api/flows/${flowId}`);
        if (res.status === 404) {
          if (!cancelled) setState({ status: "not_found" });
          return;
        }
        const data = (await res.json()) as FlowState;
        if (cancelled) return;
        setState(data);
        if (data.status !== "completed") {
          timer = setTimeout(poll, 1000);
        }
      } catch {
        if (!cancelled) timer = setTimeout(poll, 1000);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [flowId]);

  if (state.status === "not_found") {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-ink-soft">This compatibility test was not found.</p>
      </Card>
    );
  }

  if (state.status !== "completed" || !state.result) {
    return (
      <Card className="p-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
          <div>
            <p className="eyebrow">Processing</p>
            <p className="mt-1 text-sm text-ink-soft">Crunching your compatibility…</p>
          </div>
        </div>
      </Card>
    );
  }

  const { score, categories, summary } = state.result;

  return (
    <Card className="overflow-hidden">
      {/* Score */}
      <div className="px-6 pt-6">
        <div className="rule-label">
          <span className="eyebrow">Compatibility</span>
        </div>
        <div className="mt-5 flex items-end gap-2">
          <span className="font-display text-6xl font-bold leading-none text-ink tnum">
            {score}
          </span>
          <span className="mb-1 font-display text-2xl font-semibold text-accent">%</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{summary}</p>
      </div>

      {/* Category breakdown */}
      <div className="mt-6 divide-y divide-line border-t border-line">
        {categories.map((c) => (
          <div key={c.name} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{c.name}</span>
              <span className="text-xs font-medium text-ink tnum">{c.score}%</span>
            </div>
            <div className="mt-3 h-px w-full bg-line">
              <div className="h-px bg-accent" style={{ width: `${c.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
