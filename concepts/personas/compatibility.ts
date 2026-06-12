/** Compatibility scoring between two personas. */

import { AXIS_WEIGHTS } from "./data";
import type { CompatibilityResult, Persona } from "./types";

/**
 * Compute HMTI v2 compatibility between two personas.
 *
 * Same pole: full axis weight.
 * Different poles: partial credit — a barely-leaning pair scores near-full;
 * strongly-opposite pairs score 0.
 * Formula: weight × max(0, 1 − (sA + sB) / 2)  where s = (strength−55) / 40
 */
export function computeCompatibility(
  personaA: Persona,
  personaB: Persona,
): CompatibilityResult {
  const categories = personaA.axes.map((axisA, i) => {
    const axisB = personaB.axes[i];
    const weight = AXIS_WEIGHTS[i];
    let axisScore: number;
    if (axisA.chosen === axisB.chosen) {
      axisScore = weight;
    } else {
      const sA = (axisA.strength - 55) / 40;
      const sB = (axisB.strength - 55) / 40;
      axisScore = Math.round(weight * Math.max(0, 1 - (sA + sB) / 2));
    }
    return { name: axisA.name, score: axisScore };
  });

  const score = categories.reduce((sum, c) => sum + c.score, 0);

  let summary: string;
  if (score >= 85) summary = "Excellent match — you two are very compatible housemates.";
  else if (score >= 70) summary = "Strong match — good compatibility with manageable differences.";
  else if (score >= 55) summary = "Moderate match — some areas to discuss before moving in.";
  else if (score >= 40) summary = "Risky match — several likely friction points to work through.";
  else summary = "Challenging match — significant lifestyle differences to navigate.";

  return { score, categories, summary };
}
