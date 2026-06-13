// Mixed-format quiz (v2) — public surface.
//
// Self-contained and conflict-minimal: nothing here imports from the original
// quiz files, so it can land alongside the in-flight refactor and be merged in
// deliberately later. See docs/question-neutrality-research.md for the why.
export * from "./types";
export {
  AXES,
  NEUTRAL_AXIS_QUESTIONS,
  PAIR_QUESTIONS,
  BLOCK_QUESTIONS,
  FREQUENCY_QUESTIONS,
} from "./questions";
export { tallyPoles, computeAxisResults, hmtiCode } from "./scoring";
