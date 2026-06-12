"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, Wordmark, Button, cn } from "@/components/ui";
import { QUIZ_QUESTIONS, type QuizAnswers } from "@/concepts/interview/quiz";

const AXIS_LABELS = ["Cleanliness", "Social intensity", "Conflict style", "Structure preference"];

export default function PersonalityQuiz({ flowId }: { flowId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"intro" | "quiz" | "submitting">(
    flowId ? "quiz" : "intro",
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [error, setError] = useState<string | null>(null);

  const total = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[currentQ];
  const progress = Math.round((currentQ / total) * 100);

  function selectAnswer(questionId: string, score: number) {
    const next = { ...answers, [questionId]: score };
    setAnswers(next);
    if (currentQ < total - 1) {
      setTimeout(() => setCurrentQ((q) => q + 1), 160);
    } else {
      submitQuiz(next);
    }
  }

  async function submitQuiz(finalAnswers: QuizAnswers) {
    setStep("submitting");
    setError(null);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, flowId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { redirectTo } = await res.json();
      router.push(redirectTo);
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Please try again.");
      setStep("quiz");
    }
  }

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
            12 quick questions about how you actually live. Tap your answers and get your
            Housemate Type card to share.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {AXIS_LABELS.map((l) => (
              <span key={l} className="rounded-full border border-line px-3 py-1 font-display text-xs text-ink-soft">
                {l}
              </span>
            ))}
          </div>
          <Button variant="accent" className="mt-10 px-8 py-3 text-base" onClick={() => setStep("quiz")}>
            Start quiz →
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

  return (
    <PageShell>
      <Wordmark />
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow text-ink-faint">{AXIS_LABELS[question.axis]}</span>
          <span className="font-display text-xs text-ink-faint tnum">{currentQ + 1} / {total}</span>
        </div>
        <div className="h-px w-full bg-line">
          <div className="h-px bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{question.text}</h2>
        <div className="mt-6 space-y-3">
          {question.options.map((opt) => {
            const selected = answers[question.id] === opt.score;
            return (
              <button
                key={opt.label}
                onClick={() => selectAnswer(question.id, opt.score)}
                className={cn(
                  "w-full rounded-lg border px-5 py-4 text-left text-sm font-medium transition-all",
                  selected
                    ? "border-accent bg-accent/10 text-ink"
                    : "border-line bg-surface text-ink hover:border-accent/40 hover:bg-accent/5 active:scale-[0.99]",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ((q) => q - 1)} className="mt-6 text-xs text-ink-faint hover:text-ink-soft">
            ← Back
          </button>
        )}
        {error && <p className="mt-4 text-sm text-accent-ink">{error}</p>}
      </div>
    </PageShell>
  );
}
