"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, Wordmark, Button, Card, cn } from "@/components/ui";
import {
  NEUTRAL_AXIS_QUESTIONS,
  PAIR_QUESTIONS,
  BLOCK_QUESTIONS,
  type Answers,
  type BlockAnswer,
  type QuizV2Question,
  type NeutralAxisQuestion,
  type PairQuestion,
  type BlockQuestion,
} from "@/concepts/risk-assessment/quiz-v2";
import type { Persona } from "@/concepts/personas";
import ShareableAvatarCard from "@/components/ShareableAvatarCard";
import SharePanel from "@/components/SharePanel";

// ── question grouping ─────────────────────────────────────────────────────────
// Rules (docs/quiz-question-guidance.md §8):
//   - Same format type stays on one page — never mix types within a page.
//   - Within each type page, axes are shuffled so no fixed axis order leaks through.
//   - The order of type pages is fixed: axis → pair → block.

type QuizGroup = {
  kind: QuizV2Question["kind"];
  label: string;
  instruction: string;
  disclaimer?: string;
  questions: QuizV2Question[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildGroups(): QuizGroup[] {
  return [
    {
      kind: "axis",
      label: "Preferences",
      instruction: "Tap everything that sounds like you",
      disclaimer: "Pick whatever feels closest — it doesn't need to be a perfect match",
      questions: shuffle(NEUTRAL_AXIS_QUESTIONS),
    },
    {
      kind: "pair",
      label: "This or that",
      instruction: "For each pair, pick the one that's more like you",
      questions: shuffle(PAIR_QUESTIONS),
    },
    {
      kind: "block",
      label: "Rankings",
      instruction: "Tap one to mark the most like you, then tap another for the least",
      questions: shuffle(BLOCK_QUESTIONS),
    },
  ];
}

// ── block draft state ─────────────────────────────────────────────────────────

type BlockDraft = { most: string | null; least: string | null };

function updatedBlockDraft(draft: BlockDraft, optId: string): BlockDraft {
  if (optId === draft.most) return { most: null, least: null };
  if (optId === draft.least) return { ...draft, least: null };
  if (!draft.most) return { most: optId, least: null };
  return { ...draft, least: optId };
}

// ── group completeness ────────────────────────────────────────────────────────

function isGroupComplete(group: QuizGroup, answers: Answers): boolean {
  if (group.kind === "axis") return true;
  return group.questions.every((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (group.kind === "block") return typeof a === "object" && "most" in a && !!(a as BlockAnswer).most && !!(a as BlockAnswer).least;
    return true;
  });
}

// ── page renderers ────────────────────────────────────────────────────────────

function AxisPage({
  questions, answers, onAnswer,
}: {
  questions: NeutralAxisQuestion[];
  answers: Answers;
  onAnswer: (qId: string, value: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      {questions.map((q) => {
        const ans = answers[q.id] as boolean | undefined;
        return (
          <div key={q.id} className="flex items-start justify-between gap-4 rounded-lg border border-line bg-surface px-4 py-3">
            <p className="text-sm text-ink leading-snug flex-1 pt-0.5">{q.text}</p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onAnswer(q.id, true)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  ans === true
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line bg-paper text-ink hover:border-accent/50",
                )}
              >
                That's me
              </button>
              <button
                onClick={() => onAnswer(q.id, false)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  ans === false
                    ? "border-ink/40 bg-ink/10 text-ink-soft"
                    : "border-line bg-paper text-ink-soft hover:border-ink/30 hover:bg-ink/5",
                )}
              >
                Not me
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PairPage({
  questions, answers, onAnswer,
}: {
  questions: PairQuestion[];
  answers: Answers;
  onAnswer: (qId: string, optId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {questions.map((q) => {
        const ans = answers[q.id] as string | undefined;
        const [a, b] = q.options;
        const aSelected = ans === a.id;
        const bSelected = ans === b.id;
        return (
          <div key={q.id} className="overflow-hidden rounded-lg border border-line flex">
            <button
              onClick={() => onAnswer(q.id, a.id)}
              className={cn(
                "flex-1 border-r border-line px-4 py-4 text-left text-sm font-medium transition-all leading-snug",
                aSelected && "bg-accent/10 text-ink border-accent",
                bSelected && "bg-paper text-ink-faint",
                !ans && "text-ink hover:bg-accent/5",
              )}
            >
              {a.text}
            </button>
            <button
              onClick={() => onAnswer(q.id, b.id)}
              className={cn(
                "flex-1 px-4 py-4 text-left text-sm font-medium transition-all leading-snug",
                bSelected && "bg-accent/10 text-ink",
                aSelected && "bg-paper text-ink-faint",
                !ans && "text-ink hover:bg-accent/5",
              )}
            >
              {b.text}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function BlockPage({
  questions, drafts, answers, onPick,
}: {
  questions: BlockQuestion[];
  drafts: Record<string, BlockDraft>;
  answers: Answers;
  onPick: (qId: string, optId: string) => void;
}) {
  return (
    <div className="space-y-5">
      {questions.map((q) => {
        const draft = drafts[q.id] ?? { most: null, least: null };
        const done = !!(draft.most && draft.least);
        const waitingForLeast = !!draft.most && !draft.least;

        return (
          <div key={q.id} className={cn(
            "rounded-lg border p-4 transition-colors",
            done ? "border-accent/40" : "border-line",
          )}>
            <p className={cn(
              "eyebrow mb-3 transition-colors",
              done ? "text-accent" : waitingForLeast ? "text-ink-soft" : "invisible",
            )}>
              {done ? "✓ Done" : "Now tap the least like you"}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const isMost = draft.most === opt.id;
                const isLeast = draft.least === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onPick(q.id, opt.id)}
                    className={cn(
                      "w-full rounded-md border px-4 py-3 text-left text-sm font-medium transition-all",
                      isMost && "border-accent bg-accent/10 text-ink",
                      isLeast && "border-ink/40 bg-ink/10 text-ink",
                      !isMost && !isLeast && "border-line bg-paper text-ink hover:border-accent/40 hover:bg-accent/5 active:scale-[0.99]",
                    )}
                  >
                    <span className={cn(
                      "font-display text-xs mr-2",
                      isMost && "text-accent",
                      isLeast && "text-ink-soft",
                      !isMost && !isLeast && "invisible",
                    )}>
                      {isMost ? "Most ↑" : isLeast ? "Least ↓" : "Most ↑"}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function PersonalityQuiz({ flowId, skipIntro }: { flowId?: string; skipIntro?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<"intro" | "quiz" | "submitting" | "done">(
    flowId || skipIntro ? "quiz" : "intro",
  );

  const [groups] = useState(() => buildGroups());
  const [groupIdx, setGroupIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [blockDrafts, setBlockDrafts] = useState<Record<string, BlockDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ persona: Persona; flowId: string } | null>(null);

  const group = groups[groupIdx];
  const canContinue = isGroupComplete(group, answers);

  function handleAxisAnswer(qId: string, value: boolean) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  function handlePairAnswer(qId: string, optId: string) {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  }

  function handleBlockPick(qId: string, optId: string) {
    setBlockDrafts((prev) => {
      const next = updatedBlockDraft(prev[qId] ?? { most: null, least: null }, optId);
      if (next.most && next.least) {
        const blockAnswer: BlockAnswer = { most: next.most, least: next.least };
        setAnswers((a) => ({ ...a, [qId]: blockAnswer }));
      } else {
        setAnswers((a) => {
          const updated = { ...a };
          delete updated[qId];
          return updated;
        });
      }
      return { ...prev, [qId]: next };
    });
  }

  function handleContinue() {
    if (groupIdx < groups.length - 1) {
      setGroupIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submitQuiz(answers);
    }
  }

  async function submitQuiz(finalAnswers: Answers) {
    setStep("submitting");
    setError(null);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, flowId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { redirectTo: string; persona: Persona; flowId: string };

      if (flowId) {
        router.push(data.redirectTo);
        return;
      }
      setResult({ persona: data.persona, flowId: data.flowId });
      setStep("done");
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Please try again.");
      setStep("quiz");
    }
  }

  // ── screens ──────────────────────────────────────────────────────────────────

  if (step === "intro") {
    return (
      <PageShell>
        <Wordmark />
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="eyebrow text-accent">Free · 2 minutes</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Find your Housemate Type
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-soft">
            A short mix of questions about how you actually live. Get your Housemate Type card to share.
          </p>
          <Button variant="accent" className="mt-10 px-8 py-3 text-base" onClick={() => setStep("quiz")}>
            Start →
          </Button>
        </div>
      </PageShell>
    );
  }

  if (step === "submitting") {
    return (
      <PageShell>
        <Wordmark />
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="mt-4 text-sm text-ink-soft">Working out your Housemate Type…</p>
        </div>
      </PageShell>
    );
  }

  if (step === "done" && result) {
    return (
      <PageShell>
        <Wordmark />
        <header className="mt-8">
          <span className="eyebrow">Your result</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
            Meet your Housemate Type
          </h1>
        </header>
        <div className="mt-8 space-y-6">
          <ShareableAvatarCard persona={result.persona} />
          <Card className="p-6">
            <SharePanel flowId={result.flowId} />
          </Card>
        </div>
      </PageShell>
    );
  }

  // ── quiz screen ───────────────────────────────────────────────────────────────

  const progress = Math.round((groupIdx / groups.length) * 100);

  return (
    <PageShell>
      <Wordmark />
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow text-ink-faint">{group.label}</span>
          <span className="font-display text-xs text-ink-faint tnum">{groupIdx + 1} / {groups.length}</span>
        </div>
        <div className="h-px w-full bg-line">
          <div className="h-px bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-xs text-ink-soft">{group.instruction}</p>
        {group.disclaimer && <p className="mt-1 text-xs text-ink-faint">{group.disclaimer}</p>}
      </div>

      <div className="mt-6">
        {group.kind === "axis" && (
          <AxisPage
            questions={group.questions as NeutralAxisQuestion[]}
            answers={answers}
            onAnswer={handleAxisAnswer}
          />
        )}
        {group.kind === "pair" && (
          <PairPage
            questions={group.questions as PairQuestion[]}
            answers={answers}
            onAnswer={handlePairAnswer}
          />
        )}
        {group.kind === "block" && (
          <BlockPage
            questions={group.questions as BlockQuestion[]}
            drafts={blockDrafts}
            answers={answers}
            onPick={handleBlockPick}
          />
        )}
      </div>

      <div className="mt-8">
        <Button
          variant={canContinue ? "accent" : "outline"}
          className="w-full py-3"
          onClick={handleContinue}
          disabled={!canContinue && group.kind !== "axis"}
        >
          {groupIdx < groups.length - 1 ? "Continue →" : "See my Housemate Type →"}
        </Button>
        {error && <p className="mt-3 text-sm text-accent-ink">{error}</p>}
      </div>
    </PageShell>
  );
}
