/** Compatibility scoring between two personas. */

import { AXIS_WEIGHTS } from "./data";
import type { CompatibilityResult, Persona } from "./types";

/**
 * Compute HMTI compatibility between two personas.
 * Same axis pole = full weight. Different = 0.
 */
export function computeCompatibility(
  personaA: Persona,
  personaB: Persona,
): CompatibilityResult {
  const categories = personaA.axes.map((axisA, i) => {
    const axisB = personaB.axes[i];
    const match = axisA.chosen === axisB.chosen;
    return {
      name: axisA.name,
      score: match ? AXIS_WEIGHTS[i] : 0,
    };
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
