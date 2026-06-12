"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { CompatibilityResult, Persona } from "@/concepts/personas";
import { getAvatarPublicPath } from "@/concepts/personas";
import { getPersonaMetaV2 } from "@/concepts/personas/meta-v2";
import { Button, Card, Input, RuleLabel, cn } from "@/components/ui";

function SaveResultCard({ flowId }: { flowId: string }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`/api/flows/${flowId}/send-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Could not send. Try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="p-6">
      <RuleLabel>Don&apos;t lose this</RuleLabel>
      {sent ? (
        <p className="mt-3 text-sm text-ink-soft">
          Sent ✓ Check your inbox — the link reopens this page anytime.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink-soft">
            Email yourself a link to this page so you can come back to it.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Button type="submit" variant="solid" disabled={sending || !email} className="shrink-0">
              {sending ? "Sending…" : "Email me"}
            </Button>
          </form>
          {error ? (
            <p className="mt-2 text-sm text-accent-ink" role="alert">
              {error}
            </p>
          ) : null}
        </>
      )}
    </Card>
  );
}

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
  const meta = getPersonaMetaV2(persona.code);
  const traits = persona.axes.map((axis) => axis.chosen === "left" ? axis.left : axis.right);
  return (
    <div className="flex-1 rounded-xl border border-line bg-surface p-4 space-y-3">
      <p className="eyebrow">{label}</p>
      <div className="flex items-center gap-3">
        <Image
          src={avatarSrc}
          alt={persona.title}
          width={48}
          height={48}
          className="rounded-full object-cover shrink-0"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="min-w-0">
          <p className="font-display text-base font-bold leading-tight text-ink">{persona.title}</p>
          <p className="mt-0.5 font-display text-xs font-semibold tracking-widest text-accent tnum">{persona.code}</p>
        </div>
      </div>
      <p className="text-[11px] text-ink-faint">{traits.join(" · ")}</p>
      {meta && <p className="text-xs italic leading-relaxed text-ink-soft">{meta.miniBio}</p>}
      <p className="text-xs leading-relaxed text-ink">{persona.description}</p>
      {meta && (
        <div className="space-y-2 pt-1 border-t border-line">
          <div><p className="eyebrow mb-0.5">Roommate superpower</p><p className="text-xs text-ink-soft">{meta.roommateSuperpower}</p></div>
          <div><p className="eyebrow mb-0.5">Danger zone</p><p className="text-xs text-ink-soft">{meta.dangerZone}</p></div>
          <div><p className="eyebrow mb-0.5">Household energy</p><p className="text-xs italic text-ink-faint">{meta.householdEnergy}</p></div>
          <div>
            <p className="eyebrow mb-1">Connects best with</p>
            <div className="flex flex-wrap gap-1">
              {meta.bestMatches.map((code) => (
                <span key={code} className="rounded-full border border-line bg-paper px-2 py-0.5 font-display text-[10px] font-semibold text-ink tnum">{code}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function RiskAssessmentUpsellCard({ flowId }: { flowId: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-6 pt-6 pb-5">
        <RuleLabel>You&apos;ve been warned</RuleLabel>
        <h2 className="mt-4 font-display text-xl font-bold text-ink">
          Roommate hell is just normal life with the wrong person.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          It&apos;s not the big things that break it. It&apos;s whose turn it
          is to buy toilet roll. It&apos;s the 1am kitchen noise. It&apos;s
          finding out their &ldquo;tidy&rdquo; and your &ldquo;tidy&rdquo;
          aren&apos;t the same thing. The Risk Assessment maps the financial,
          practical, and uncomfortable gaps — before the contract locks you in.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <Link
            href={`/risk-assessment/new?from=${flowId}`}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              "bg-accent text-white hover:bg-accent-ink",
            )}
          >
            Get the full picture
          </Link>
          <span className="font-display text-sm font-semibold text-ink tnum">$19</span>
        </div>
      </div>
    </Card>
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

  const { score, summary, aiSummary, dealbreakers, practicalFlags, personalityInteractions, conversationList } = state.result;
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

      {/* Practical flags — paid layer */}
      {practicalFlags && practicalFlags.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-6 pt-6 pb-2"><span className="eyebrow">Friction points</span></div>
          {practicalFlags.map((flag) => (
            <div key={flag.id} className="border-t border-line px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-sm font-semibold text-ink">{flag.title}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${flag.severity === "high" ? "bg-accent/15 text-accent-ink" : flag.severity === "medium" ? "bg-ink/10 text-ink-soft" : "bg-line text-ink-faint"}`}>{flag.severity}</span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{flag.detail}</p>
              <p className="mt-2 text-xs font-medium text-ink"><span className="text-ink-faint">Talk about: </span>{flag.talkAbout}</p>
            </div>
          ))}
        </Card>
      )}

      {/* Personality-interaction analysis — paid layer */}
      {personalityInteractions && personalityInteractions.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-6 pt-6 pb-2"><span className="eyebrow">How you&apos;ll rub against each other</span></div>
          {personalityInteractions.map((interaction) => (
            <div key={interaction.axisName} className="border-t border-line px-6 py-5">
              <div className="flex items-center gap-2">
                <p className="eyebrow">{interaction.axisName}</p>
                <span className="text-ink-faint text-xs">{interaction.traitA} · {interaction.traitB}</span>
              </div>
              <p className="mt-2 text-sm text-ink">{interaction.dynamic}</p>
              <ul className="mt-3 space-y-1.5">
                {interaction.advice.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Card>
      )}

      {/* Pre-move-in conversation list — paid layer */}
      {conversationList && conversationList.length > 0 && (
        <Card className="p-6">
          <span className="eyebrow">Before you sign</span>
          <ol className="mt-4 space-y-2">
            {conversationList.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink">
                <span className="font-display text-xs font-bold text-accent tnum mt-0.5 w-4 shrink-0">{i + 1}.</span>{item}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Paid CTA when practical layer not done */}
      {!practicalFlags && (
        <Card className="p-6">
          <p className="eyebrow text-accent">Practical report</p>
          <p className="mt-2 text-sm font-medium text-ink">Get the full picture before move-in</p>
          <p className="mt-1 text-sm text-ink-soft">The practical assessment covers logistics, conflict style, and flags exactly where you'll clash.</p>
          <a href={`/paid/${flowId}`} className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.04]">
            Take the practical assessment →
          </a>
        </Card>
      )}

      {/* Dealbreakers — paid layer only */}
      {practicalFlags && dealbreakers && dealbreakers.length > 0 && (
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


      <SaveResultCard flowId={flowId} />
    </div>
  );
}
