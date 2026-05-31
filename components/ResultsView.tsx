"use client";

import { useEffect, useState } from "react";
import type { CompatibilityResult, Persona } from "@/lib/business-logic";
import { Card } from "@/components/ui";

type FlowState = {
  status: "created" | "processing" | "completed" | "not_found";
  result?: CompatibilityResult;
  initiatorPersona?: Persona;
  roommatePersona?: Persona;
};

function PersonaCard({ persona, label }: { persona: Persona; label: string }) {
  return (
    <div className="flex-1 rounded-xl border border-line bg-surface p-4">
      <p className="eyebrow">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-2xl">{persona.emoji}</span>
        <div>
          <p className="font-display text-lg font-bold text-ink">{persona.code}</p>
          <p className="text-xs font-medium text-ink-soft">{persona.title}</p>
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">{persona.description}</p>
    </div>
  );
}

function AxisComparison({ personaA, personaB }: { personaA: Persona; personaB: Persona }) {
  return (
    <div className="divide-y divide-line">
      {personaA.axes.map((axisA, i) => {
        const axisB = personaB.axes[i];
        const match = axisA.chosen === axisB.chosen;
        return (
          <div key={axisA.name} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{axisA.name}</span>
              <span className={`text-[10px] font-semibold uppercase ${match ? "text-green-600" : "text-accent-ink"}`}>
                {match ? "Match" : "Different"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="w-16 text-right font-medium text-ink-soft">{axisA.left}</span>
              <div className="relative flex-1 h-2 rounded-full bg-line">
                <div
                  className="absolute top-0 h-2 w-2 rounded-full bg-ink ring-2 ring-surface"
                  style={{ left: `${axisA.chosen === "left" ? 100 - axisA.strength : axisA.strength}%` }}
                  title="Person 1"
                />
                <div
                  className="absolute top-0 h-2 w-2 rounded-full bg-accent ring-2 ring-surface"
                  style={{ left: `${axisB.chosen === "left" ? 100 - axisB.strength : axisB.strength}%` }}
                  title="Person 2"
                />
              </div>
              <span className="w-16 font-medium text-ink-soft">{axisA.right}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
  const matchBand =
    score >= 85 ? "Excellent Match" :
    score >= 70 ? "Strong Match" :
    score >= 55 ? "Moderate Match" :
    score >= 40 ? "Risky Match" : "Poor Match";

  return (
    <div className="space-y-6">
      {state.initiatorPersona && state.roommatePersona && (
        <div className="flex gap-4">
          <PersonaCard persona={state.initiatorPersona} label="Person 1" />
          <PersonaCard persona={state.roommatePersona} label="Person 2" />
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="px-6 pt-6">
          <div className="rule-label">
            <span className="eyebrow">Compatibility</span>
          </div>
          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-6xl font-bold leading-none text-ink tnum">
              {score}
            </span>
            <div className="mb-1">
              <span className="font-display text-2xl font-semibold text-accent">/100</span>
              <p className="mt-0.5 text-xs font-medium text-ink-soft">{matchBand}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{summary}</p>
        </div>

        <div className="mt-6 border-t border-line">
          {categories.map((c) => (
            <div key={c.name} className="px-6 py-4 border-b border-line last:border-b-0">
              <div className="flex items-center justify-between">
                <span className="eyebrow">{c.name}</span>
                <span className="text-xs font-medium text-ink tnum">{c.score > 0 ? `+${c.score}` : "0"}</span>
              </div>
              <div className="mt-3 h-px w-full bg-line">
                <div className="h-px bg-accent" style={{ width: `${c.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {state.initiatorPersona && state.roommatePersona && (
        <Card className="overflow-hidden">
          <div className="px-6 pt-4">
            <div className="rule-label">
              <span className="eyebrow">Axis comparison</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-ink-soft">
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-ink" /> Person 1</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-accent" /> Person 2</span>
            </div>
          </div>
          <div className="mt-2">
            <AxisComparison personaA={state.initiatorPersona} personaB={state.roommatePersona} />
          </div>
        </Card>
      )}
    </div>
  );
}
