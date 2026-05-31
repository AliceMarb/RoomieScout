"use client";

import { useEffect, useState } from "react";
import type { CompatibilityResult } from "@/lib/business-logic";

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
    return <p className="text-sm text-red-600">This matching flow was not found.</p>;
  }

  if (state.status !== "completed" || !state.result) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        <p className="text-sm text-slate-600">Crunching your compatibility…</p>
      </div>
    );
  }

  const { score, categories, summary } = state.result;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500">Compatibility score</p>
        <p className="text-5xl font-bold text-slate-900">{score}%</p>
        <p className="mt-2 text-sm text-slate-600">{summary}</p>
      </div>

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.name}>
            <div className="flex justify-between text-sm text-slate-700">
              <span>{c.name}</span>
              <span>{c.score}%</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${c.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
