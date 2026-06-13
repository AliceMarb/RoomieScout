// Mixed-format quiz (v2) — self-contained, conflict-minimal module.
//
// A gameability-resistant question set that mixes THREE formats:
//   1. neutral single-statement (Likert yes/no) axis items, worded so each pole
//      names a trade-off (no obvious "good" answer);
//   2. A/B forced-choice pairs, for axes whose poles are equally flattering;
//   3. most/least blocks, where desirability-asymmetric axes (e.g. cleanliness)
//      are measured against equally-attractive items from other axes.
//
// It deliberately re-declares its own base types instead of importing from
// ../quiz-types, so it can be merged independently of the in-flight refactor of
// the original quiz files. Rationale + citations: docs/question-neutrality-research.md.

export type AxisId = "cleanliness" | "social" | "conflict" | "structure";
export type Pole = "N" | "C" | "P" | "O" | "D" | "H" | "S" | "F";

export interface PoleDef {
  letter: Pole;
  word: string;
}

export interface AxisDef {
  id: AxisId;
  label: string;
  poles: [PoleDef, PoleDef]; // [primary, secondary]
}

// The two poles of every axis are mirror images. Used by scoring: picking a
// statement as "least like me" is evidence for the OPPOSITE pole.
export const OPPOSITE_POLE: Record<Pole, Pole> = {
  N: "C",
  C: "N",
  P: "O",
  O: "P",
  D: "H",
  H: "D",
  S: "F",
  F: "S",
};

// Format 1 — neutral single-statement (Likert yes/no) item, keyed to one pole.
export interface NeutralAxisQuestion {
  id: string;
  kind: "axis";
  axis: AxisId;
  pole: Pole; // a "yes" scores for this pole
  text: string;
}

// One selectable statement inside a forced-choice question. Keyed to a single
// pole on a single axis — that's how a choice becomes a score.
export interface ChoiceOption {
  id: string; // unique within its question
  text: string;
  axis: AxisId;
  pole: Pole;
}

// Format 2 — A/B forced choice. Two equally-desirable statements (the two poles
// of ONE axis, only safe when those poles are equally flattering: social,
// structure, conflict). The respondent picks the one more like them.
export interface PairQuestion {
  id: string;
  kind: "pair";
  prompt?: string; // defaults to "Which is more you?"
  options: [ChoiceOption, ChoiceOption];
}

// Format 3 — most/least block. 3–4 statements from DIFFERENT axes, matched for
// desirability, so there's no "good person" answer. Used where the two poles of
// one axis aren't equally flattering (e.g. cleanliness). The respondent marks
// one statement most-like-them and one least-like-them.
export interface BlockQuestion {
  id: string;
  kind: "block";
  prompt?: string; // defaults to "Most like you / least like you"
  options: ChoiceOption[];
}

// Format 4 — frequency / count item. Instead of predicting a behaviour ("you'd
// clean up right away"), it asks for a concrete, countable frequency ("how soon
// do you usually clean up?"). Options ordered from one pole to the other; middle
// options carry pole: null (midpoint — no signal). Hardest format to inflate
// because specific counts are more honest than self-descriptions. Primary use:
// cleanliness (the asymmetric axis). Scoring: chosen option's pole → +1.
export interface FrequencyOption {
  id: string;
  label: string;
  axis: AxisId;
  pole: Pole | null; // null = midpoint, scores nothing
}

export interface FrequencyQuestion {
  id: string;
  kind: "frequency";
  text: string;
  options: FrequencyOption[];
}

export type QuizV2Question =
  | NeutralAxisQuestion
  | PairQuestion
  | BlockQuestion
  | FrequencyQuestion;

// Answer shapes, keyed by question id:
//   axis      -> boolean (yes/no)
//   pair      -> string  (chosen ChoiceOption.id)
//   frequency -> string  (chosen FrequencyOption.id)
//   block     -> { most, least } (two ChoiceOption.ids)
export type BlockAnswer = { most: string; least: string };
export type AnswerValue = boolean | string | BlockAnswer;
export type Answers = Record<string, AnswerValue>;

export interface AxisResult {
  axis: AxisId;
  axisLabel: string;
  score: number; // 0–100; 100 = primary pole, 0 = secondary, 50 = neutral
  primaryPole: Pole;
  primaryPoleLabel: string;
  secondaryPole: Pole;
  secondaryPoleLabel: string;
}
