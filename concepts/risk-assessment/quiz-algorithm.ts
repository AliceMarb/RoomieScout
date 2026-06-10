import type { AxisResult, QuizQuestion } from "./quiz-types";
import { AXES } from "./quiz-questions";

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Compute per-axis scores from yes/no answers.
 *
 * Score is 0–100: 100 = fully primary pole (N/P/D/S), 0 = fully secondary (C/O/H/F).
 * Derived from: (primaryYes/5 - secondaryYes/5 + 1) / 2 * 100
 */
export function computeAxisResults(
  questions: QuizQuestion[],
  answers: Record<string, boolean>,
): AxisResult[] {
  return AXES.map((axis) => {
    const [primaryPole, secondaryPole] = axis.poles;
    const axisQs = questions.filter((q) => q.kind === "axis" && q.axis === axis.id);
    const primaryQs = axisQs.filter((q) => q.pole === primaryPole.letter);
    const secondaryQs = axisQs.filter((q) => q.pole === secondaryPole.letter);

    const primaryYes = primaryQs.filter((q) => answers[q.id] === true).length;
    const secondaryYes = secondaryQs.filter((q) => answers[q.id] === true).length;

    const primaryCount = primaryQs.length || 1;
    const secondaryCount = secondaryQs.length || 1;
    const raw = primaryYes / primaryCount - secondaryYes / secondaryCount;
    const score = Math.round(((raw + 1) / 2) * 100);

    return {
      axis: axis.id,
      axisLabel: axis.label,
      score,
      primaryPole: primaryPole.letter,
      primaryPoleLabel: primaryPole.word,
      secondaryPole: secondaryPole.letter,
      secondaryPoleLabel: secondaryPole.word,
    };
  });
}

export function dealbreakerTopics(
  questions: QuizQuestion[],
  answers: Record<string, boolean>,
): string[] {
  return questions
    .filter((q) => q.kind === "dealbreaker" && answers[q.id] === true && q.topic)
    .map((q) => q.topic!);
}
