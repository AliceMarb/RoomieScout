// Standalone scoring tests for the mixed-format quiz. No test runner needed:
//   npx tsx concepts/risk-assessment/quiz-v2/selftest.ts
import {
  NEUTRAL_AXIS_QUESTIONS,
  PAIR_QUESTIONS,
  BLOCK_QUESTIONS,
  FREQUENCY_QUESTIONS,
  computeAxisResults,
  tallyPoles,
  hmtiCode,
  type Answers,
} from "./index";

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("FAIL  " + name); }
}
function scoreOf(res: ReturnType<typeof computeAxisResults>, axis: string) {
  return res.find((r) => r.axis === axis)!.score;
}

// 1. Empty -> neutral.
const empty = computeAxisResults(NEUTRAL_AXIS_QUESTIONS, {}, PAIR_QUESTIONS, BLOCK_QUESTIONS, FREQUENCY_QUESTIONS);
check("empty -> all axes 50", empty.every((r) => r.score === 50));

// 2. Symmetric-axis Likert still scores.
check("Direct yes -> conflict 100", scoreOf(computeAxisResults(NEUTRAL_AXIS_QUESTIONS, { "co-d-01": true }), "conflict") === 100);

// 3. Pair choice scores its pole.
check("pair pick Open -> social 0", scoreOf(computeAxisResults(NEUTRAL_AXIS_QUESTIONS, { "pr-so-01": "pr-so-01b" }, PAIR_QUESTIONS), "social") === 0);

// 4. Cleanliness is reachable ONLY via blocks or frequency (not Likert/pairs).
const viaBlock = computeAxisResults(NEUTRAL_AXIS_QUESTIONS, { "bl-01": { most: "bl-01-cl", least: "bl-01-st" } }, PAIR_QUESTIONS, BLOCK_QUESTIONS);
check("block most=Neat -> cleanliness 100", scoreOf(viaBlock, "cleanliness") === 100);

// 5. KEY INVARIANT: no standalone axis item or pair can touch cleanliness.
const noCleanLikert = NEUTRAL_AXIS_QUESTIONS.every((q) => q.axis !== "cleanliness");
const noCleanPairs = PAIR_QUESTIONS.every((p) => p.options.every((o) => o.axis !== "cleanliness"));
check("no cleanliness in Likert", noCleanLikert);
check("no cleanliness in pairs", noCleanPairs);

// 6. Likert keying: cleanliness poles must not appear.
const pc: Record<string, number> = {};
for (const q of NEUTRAL_AXIS_QUESTIONS) pc[q.pole] = (pc[q.pole] ?? 0) + 1;
check("cleanliness has no Likert items", !pc.N && !pc.C);

// 7. Cleanliness appears in every block (enough data points).
check("cleanliness in every block", BLOCK_QUESTIONS.every((b) => b.options.some((o) => o.axis === "cleanliness")));

// 8. All ids unique across all four formats.
const ids: string[] = [];
for (const q of NEUTRAL_AXIS_QUESTIONS) ids.push(q.id);
for (const p of PAIR_QUESTIONS) { ids.push(p.id); p.options.forEach((o) => ids.push(o.id)); }
for (const b of BLOCK_QUESTIONS) { ids.push(b.id); b.options.forEach((o) => ids.push(o.id)); }
for (const f of FREQUENCY_QUESTIONS) { ids.push(f.id); f.options.forEach((o) => ids.push(o.id)); }
check("all ids unique", new Set(ids).size === ids.length);

// 9. tallyPoles: block 'least' bumps the opposite pole.
const t = tallyPoles(NEUTRAL_AXIS_QUESTIONS, { "bl-01": { most: "bl-01-so", least: "bl-01-st" } }, PAIR_QUESTIONS, BLOCK_QUESTIONS);
check("least=Flexible bumps Structured", t.S === 1 && t.F === 0);

// 10. Frequency endpoint scores its pole.
const freqNeat = computeAxisResults(NEUTRAL_AXIS_QUESTIONS, { "fq-cl-01": "fq-cl-01a" }, [], [], FREQUENCY_QUESTIONS);
check("frequency pick Neat -> cleanliness 100", scoreOf(freqNeat, "cleanliness") === 100);

const freqCasual = computeAxisResults(NEUTRAL_AXIS_QUESTIONS, { "fq-cl-01": "fq-cl-01d" }, [], [], FREQUENCY_QUESTIONS);
check("frequency pick Casual -> cleanliness 0", scoreOf(freqCasual, "cleanliness") === 0);

// 11. Frequency midpoint (null pole) scores nothing.
const freqMid = computeAxisResults(NEUTRAL_AXIS_QUESTIONS, { "fq-cl-01": "fq-cl-01b" }, [], [], FREQUENCY_QUESTIONS);
check("frequency midpoint -> cleanliness stays 50", scoreOf(freqMid, "cleanliness") === 50);

// 12. Frequency scores social.
const freqPrivate = computeAxisResults(NEUTRAL_AXIS_QUESTIONS, { "fq-so-01": "fq-so-01a" }, [], [], FREQUENCY_QUESTIONS);
check("frequency pick Private -> social 100", scoreOf(freqPrivate, "social") === 100);

// 13. Every frequency question has at least one non-null pole option per end (both poles present).
const freqBothPoles = FREQUENCY_QUESTIONS.every((f) => {
  const poles = f.options.map((o) => o.pole).filter((p) => p !== null);
  return poles.length >= 2;
});
check("every frequency question has options for both poles", freqBothPoles);

// 14. Frequency items can score cleanliness directly (not limited to blocks).
const freqClCount = FREQUENCY_QUESTIONS.filter((f) => f.options.some((o) => o.axis === "cleanliness")).length;
check("frequency has cleanliness questions", freqClCount >= 4);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
