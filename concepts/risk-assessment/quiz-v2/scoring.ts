import type {
  Answers,
  AxisResult,
  BlockQuestion,
  FrequencyQuestion,
  NeutralAxisQuestion,
  PairQuestion,
  Pole,
} from "./types";
import { OPPOSITE_POLE } from "./types";
import { AXES } from "./questions";

type PoleTally = Record<Pole, number>;

function emptyTally(): PoleTally {
  return { N: 0, C: 0, P: 0, O: 0, D: 0, H: 0, S: 0, F: 0 };
}

/**
 * Turn every answer into "points" for a pole — one common currency, three formats:
 *
 *   axis (yes/no)  a "yes" scores +1 for the question's pole.
 *   pair (A/B)     the chosen option scores +1 for its pole.
 *   block          the "most like me" pick scores +1 for its pole; the
 *                  "least like me" pick scores +1 for the OPPOSITE pole
 *                  (disliking a Neat statement is evidence you're Casual).
 *
 * Pairs and blocks are the faking-resistant formats: because their options are
 * matched for desirability, a respondent can't inflate every trait at once —
 * spending a pick on one pole necessarily withholds it from another.
 */
export function tallyPoles(
  axisQuestions: NeutralAxisQuestion[],
  answers: Answers,
  pairs: PairQuestion[] = [],
  blocks: BlockQuestion[] = [],
  frequencies: FrequencyQuestion[] = [],
): PoleTally {
  const tally = emptyTally();

  for (const q of axisQuestions) {
    if (answers[q.id] === true) {
      tally[q.pole] += 1;
    }
  }

  for (const p of pairs) {
    const chosen = answers[p.id];
    if (typeof chosen === "string") {
      const opt = p.options.find((o) => o.id === chosen);
      if (opt) tally[opt.pole] += 1;
    }
  }

  for (const b of blocks) {
    const ans = answers[b.id];
    if (ans && typeof ans === "object" && "most" in ans) {
      const most = b.options.find((o) => o.id === ans.most);
      const least = b.options.find((o) => o.id === ans.least);
      if (most) tally[most.pole] += 1;
      if (least) tally[OPPOSITE_POLE[least.pole]] += 1;
    }
  }

  for (const f of frequencies) {
    const chosen = answers[f.id];
    if (typeof chosen === "string") {
      const opt = f.options.find((o) => o.id === chosen);
      if (opt && opt.pole !== null) tally[opt.pole] += 1;
    }
  }

  return tally;
}

/**
 * Compute per-axis scores from any mix of yes/no, A/B-pair, and most/least-block
 * answers. Score is 0–100: 100 = fully primary pole (N/P/D/S), 0 = fully
 * secondary (C/O/H/F), 50 = balanced or unanswered.
 *
 * Each axis score is the share of that axis's points landing on the primary
 * pole: primary / (primary + secondary) * 100.
 */
export function computeAxisResults(
  axisQuestions: NeutralAxisQuestion[],
  answers: Answers,
  pairs: PairQuestion[] = [],
  blocks: BlockQuestion[] = [],
  frequencies: FrequencyQuestion[] = [],
): AxisResult[] {
  const tally = tallyPoles(axisQuestions, answers, pairs, blocks, frequencies);

  return AXES.map((axis) => {
    const [primaryPole, secondaryPole] = axis.poles;
    const primary = tally[primaryPole.letter];
    const secondary = tally[secondaryPole.letter];
    const total = primary + secondary;
    const score = total === 0 ? 50 : Math.round((primary / total) * 100);

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

/** Four-letter HMTI code from axis results, e.g. "NODS". Tie -> primary pole. */
export function hmtiCode(results: AxisResult[]): string {
  return results
    .map((r) => (r.score >= 50 ? r.primaryPole : r.secondaryPole))
    .join("");
}
