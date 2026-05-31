export type CompatibilityResult = {
  score: number; // 0-100 overall compatibility
  categories: { name: string; score: number }[];
  summary: string;
};

const CATEGORIES = ["Cleanliness", "Schedule", "Social", "Budget"];

// Simple deterministic string hash so the same inputs always yield the same score.
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Compute the compatibility result between the two participants.
 *
 * TODO: replace this deterministic placeholder with the real AI compatibility
 * assessment that reasons over both participants' answers.
 */
export function computeCompatibility(
  initiatorInput: string,
  roommateInput: string,
): CompatibilityResult {
  const categories = CATEGORIES.map((name) => ({
    name,
    score: 50 + (hash(name + initiatorInput + roommateInput) % 51), // 50-100
  }));
  const score = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  );
  const summary =
    score >= 80
      ? "You two look like a great match!"
      : score >= 65
        ? "Solid potential — worth a conversation."
        : "Some differences to talk through before moving in.";
  return { score, categories, summary };
}
