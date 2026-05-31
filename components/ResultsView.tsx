"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CompatibilityResult, Persona } from "@/lib/business-logic";
import { getAvatarPublicPath } from "@/lib/avatar-paths";
import { Card } from "@/components/ui";

type FlowState = {
  status: "created" | "processing" | "completed" | "not_found";
  result?: CompatibilityResult & { aiSummary?: string };
  initiatorPersona?: Persona;
  roommatePersona?: Persona;
  initiatorName?: string;
  roommateName?: string;
};

function PersonaCard({ persona, label }: { persona: Persona; label: string }) {
  const avatarSrc = getAvatarPublicPath(persona.code);
  return (
    <div className="flex-1 rounded-xl border border-line bg-surface p-4">
      <p className="eyebrow">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <Image
          src={avatarSrc}
          alt={persona.title}
          width={52}
          height={52}
          className="rounded-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div>
          <p className="font-display text-lg font-bold text-ink">{persona.code}</p>
          <p className="text-xs font-medium text-ink-soft">{persona.title}</p>
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">{persona.description}</p>
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
        // Keep polling until completed AND aiSummary is ready (generated async in background)
        const summaryReady = data.status === "completed" && !!data.result?.aiSummary;
        if (data.status !== "completed" || !summaryReady) {
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

  const { score, categories, summary, aiSummary, dealbreakers } = state.result;
  const nameA = state.initiatorName?.trim() || "Person 1";
  const nameB = state.roommateName?.trim() || "Person 2";
  const matchBand =
    score >= 85 ? "Excellent Match" :
    score >= 70 ? "Strong Match" :
    score >= 55 ? "Moderate Match" :
    score >= 40 ? "Risky Match" : "Poor Match";

  return (
    <div className="space-y-6">
      {state.initiatorPersona && state.roommatePersona && (
        <div className="flex gap-4">
          <PersonaCard persona={state.initiatorPersona} label={nameA} />
          <PersonaCard persona={state.roommatePersona} label={nameB} />
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
          {/* AI-generated specific summary */}
          {aiSummary ? (
            <p className="mt-3 text-sm leading-relaxed text-ink">{aiSummary}</p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{summary}</p>
          )}
        </div>

        {/* Per-category breakdown with both people's axis positions */}
        {state.initiatorPersona && state.roommatePersona && (
          <div className="mt-6 border-t border-line">
            <div className="flex items-center gap-4 px-6 py-2 text-[10px] text-ink-soft">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-ink" /> {nameA}</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" /> {nameB}</span>
            </div>
            {state.initiatorPersona.axes.map((axisA, i) => {
              const axisB = state.roommatePersona!.axes[i];
              const match = axisA.chosen === axisB.chosen;
              const dotA = axisA.chosen === "left" ? 100 - axisA.strength : axisA.strength;
              const dotB = axisB.chosen === "left" ? 100 - axisB.strength : axisB.strength;
              return (
                <div key={axisA.name} className="px-6 py-4 border-t border-line">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">{axisA.name}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${match ? "text-green-600" : "text-accent-ink"}`}>
                      {match ? "aligned" : "different"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-ink-soft">
                    <span className="w-14 text-right">{axisA.left}</span>
                    <div className="relative flex-1 h-1.5 rounded-full bg-line">
                      <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-ink ring-2 ring-surface" style={{ left: `calc(${dotA}% - 6px)` }} />
                      <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-accent ring-2 ring-surface" style={{ left: `calc(${dotB}% - 6px)` }} />
                    </div>
                    <span className="w-14">{axisA.right}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Dealbreakers alignment table */}
      {dealbreakers && dealbreakers.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <span className="eyebrow">Dealbreakers</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-6 py-2 text-xs font-semibold text-ink-soft w-1/3">Topic</th>
                <th className="px-4 py-2 text-xs font-semibold text-ink-soft w-1/3">{nameA}</th>
                <th className="px-4 py-2 text-xs font-semibold text-ink-soft w-1/3">{nameB}</th>
                <th className="px-4 py-2 text-xs font-semibold text-ink-soft text-right"></th>
              </tr>
            </thead>
            <tbody>
              {dealbreakers.map((row, i) => (
                <tr key={i} className="border-b border-line last:border-b-0">
                  <td className="px-6 py-3 font-medium text-ink">{row.topic}</td>
                  <td className="px-4 py-3 text-ink-soft">{row.personA}</td>
                  <td className="px-4 py-3 text-ink-soft">{row.personB}</td>
                  <td className="px-4 py-3 text-right text-base">
                    {row.compatible ? "✅" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

    </div>
  );
}
