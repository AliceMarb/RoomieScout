"use client";

import { useState } from "react";
import { Button, Card, Input, Field, PageShell, RuleLabel, Wordmark, cn } from "@/components/ui";
import {
  AXIS_QUESTIONS,
  DEALBREAKER_QUESTIONS,
} from "@/concepts/risk-assessment/quiz-questions";
import {
  chunk,
  computeAxisResults,
  dealbreakerTopics,
  shuffle,
} from "@/concepts/risk-assessment/quiz-algorithm";
import type { AxisResult, QuizQuestion } from "@/concepts/risk-assessment/quiz-types";

/* ── Axis result bar ────────────────────────────────────────────────────── */

function AxisBar({ result }: { result: AxisResult }) {
  const { score, primaryPoleLabel, secondaryPoleLabel } = result;
  const leaning =
    score > 60 ? primaryPoleLabel : score < 40 ? secondaryPoleLabel : "Balanced";
  const dot = Math.max(4, Math.min(96, score));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-sm font-semibold text-ink">{result.axisLabel}</span>
        <span className="font-display text-xs font-semibold text-accent tnum">{leaning}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-14 text-right font-display text-[11px] font-semibold text-ink-soft">
          {primaryPoleLabel}
        </span>
        <div className="relative h-1.5 flex-1 rounded-full bg-line">
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent ring-2 ring-surface"
            style={{ left: `calc(${dot}% - 6px)` }}
          />
        </div>
        <span className="w-14 font-display text-[11px] font-semibold text-ink-soft">
          {secondaryPoleLabel}
        </span>
      </div>
    </div>
  );
}

/* ── Results view ───────────────────────────────────────────────────────── */

function Results({
  questions,
  answers,
  email,
  onRetake,
}: {
  questions: QuizQuestion[];
  answers: Record<string, boolean>;
  email: string;
  onRetake: () => void;
}) {
  const axisResults = computeAxisResults(questions, answers);
  const flagged = dealbreakerTopics(questions, answers);

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Your profile</span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          Risk Assessment
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Results for <span className="font-medium text-ink">{email}</span>
        </p>
      </div>

      <Card className="space-y-6 p-6">
        <RuleLabel>Personality axes</RuleLabel>
        <div className="space-y-5">
          {axisResults.map((r) => (
            <AxisBar key={r.axis} result={r} />
          ))}
        </div>
        <p className="text-xs text-ink-faint">
          Each bar shows where you sit between two poles. The marker position reflects
          your balance of answers across both sides of the axis.
        </p>
      </Card>

      {flagged.length > 0 && (
        <Card className="p-6">
          <RuleLabel>Your dealbreakers</RuleLabel>
          <p className="mt-3 text-sm text-ink-soft">
            These were flagged as dealbreakers for you:
          </p>
          <ul className="mt-3 space-y-1.5">
            {flagged.map((topic) => (
              <li key={topic} className="flex items-center gap-2 text-sm text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {topic}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {flagged.length === 0 && (
        <Card className="p-6">
          <RuleLabel>Dealbreakers</RuleLabel>
          <p className="mt-3 text-sm text-ink-soft">
            You didn&apos;t flag anything as a hard dealbreaker.
          </p>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onRetake}>
          Retake
        </Button>
      </div>
    </div>
  );
}

/* ── Question card ──────────────────────────────────────────────────────── */

function QuestionItem({
  q,
  answer,
  onAnswer,
}: {
  q: QuizQuestion;
  answer: boolean | undefined;
  onAnswer: (id: string, val: boolean) => void;
}) {
  return (
    <div className="space-y-3 border-b border-line pb-5 last:border-0 last:pb-0">
      <p className="text-sm leading-relaxed text-ink">{q.text}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onAnswer(q.id, true)}
          className={cn(
            "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
            answer === true
              ? "border-accent bg-accent text-white"
              : "border-line bg-surface text-ink-soft hover:border-accent/50 hover:text-ink",
          )}
        >
          Yes
        </button>
        <button
          onClick={() => onAnswer(q.id, false)}
          className={cn(
            "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
            answer === false
              ? "border-ink bg-ink text-paper"
              : "border-line bg-surface text-ink-soft hover:border-ink/30 hover:text-ink",
          )}
        >
          No
        </button>
      </div>
    </div>
  );
}

/* ── Progress bar ───────────────────────────────────────────────────────── */

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="font-display text-[11px] text-ink-faint tnum">
          {current} of {total}
        </span>
        <span className="font-display text-[11px] text-ink-faint tnum">{pct}%</span>
      </div>
      <div className="h-0.5 rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */

export default function RiskAssessmentPage() {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [questionPage, setQuestionPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);

  // Dealbreakers first, then axis questions in a randomised order.
  const [allQuestions] = useState<QuizQuestion[]>(() => [
    ...DEALBREAKER_QUESTIONS,
    ...shuffle(AXIS_QUESTIONS),
  ]);

  const pages = chunk(allQuestions, 5);
  const totalPages = pages.length;

  const currentPage = pages[questionPage] ?? [];
  const allAnswered = currentPage.every((q) => answers[q.id] !== undefined);
  const answeredSoFar = questionPage * 5 + currentPage.filter((q) => answers[q.id] !== undefined).length;

  function handleAnswer(id: string, val: boolean) {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }

  function handleNext() {
    if (questionPage < totalPages - 1) {
      setQuestionPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    if (questionPage > 0) {
      setQuestionPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError("");
    setEmailSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRetake() {
    setEmailSubmitted(false);
    setQuestionPage(0);
    setAnswers({});
    setDone(false);
    setEmail("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <PageShell>
      <div className="space-y-8">
        <Wordmark />

        {/* Email gate */}
        {!emailSubmitted && (
          <div className="space-y-6">
            <div>
              <span className="eyebrow">Risk Assessment</span>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
                Know before you sign.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                55 questions. About 8 minutes. You&apos;ll get a breakdown of your
                dealbreakers and personality profile — the things that actually determine
                whether a shared living arrangement works.
              </p>
            </div>
            <Card className="p-6">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Field label="Your email" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                {emailError && (
                  <p className="text-sm text-accent-ink" role="alert">
                    {emailError}
                  </p>
                )}
                <Button type="submit" variant="accent" className="w-full">
                  Start assessment
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Results */}
        {emailSubmitted && done && (
          <Results
            questions={allQuestions}
            answers={answers}
            email={email}
            onRetake={handleRetake}
          />
        )}

        {/* Questions */}
        {emailSubmitted && !done && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
                Agree or disagree?
              </h1>
            </div>

            <ProgressBar current={answeredSoFar} total={allQuestions.length} />

            <Card className="space-y-5 p-6">
              {currentPage.map((q) => (
                <QuestionItem
                  key={q.id}
                  q={q}
                  answer={answers[q.id]}
                  onAnswer={handleAnswer}
                />
              ))}
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={questionPage === 0}
              >
                Back
              </Button>
              <Button
                variant="accent"
                onClick={handleNext}
                disabled={!allAnswered}
              >
                {questionPage < totalPages - 1 ? "Next" : "See my results"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
