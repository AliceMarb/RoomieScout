export type CompatibilityResult = {
  score: number; // 0-100 overall compatibility
  categories: { name: string; score: number }[];
  summary: string;
};

export type PersonaAxis = {
  name: string; // e.g. "Cleanliness"
  left: string; // left-pole trait label, e.g. "Neat"
  right: string; // right-pole trait label, e.g. "Casual"
  chosen: "left" | "right"; // which pole this person leans toward
  strength: number; // 55-95: how strongly they lean toward the chosen pole
};

export type Persona = {
  code: string; // 4-letter HMTI code, e.g. "NPSD"
  title: string; // e.g. "The Curator"
  emoji: string; // avatar emoji for the persona
  description: string;
  axes: PersonaAxis[]; // exactly 4 spectrum axes
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

// The Housemate Type Indicator (HMTI): four binary axes that most affect
// roommate compatibility. The chosen letter on each axis builds a four-letter
// type code (16 combinations total).
const HMTI_AXES = [
  {
    name: "Cleanliness",
    salt: "clean",
    a: { letter: "N", trait: "Neat", description: "Keeps shared spaces clean and orderly." },
    b: { letter: "C", trait: "Casual", description: "Relaxed about mess and chores." },
  },
  {
    name: "Privacy & social",
    salt: "social",
    a: { letter: "P", trait: "Private", description: "Values quiet and personal space." },
    b: { letter: "O", trait: "Open", description: "Enjoys shared time, hosting, and guests." },
  },
  {
    name: "Lifestyle rhythm",
    salt: "rhythm",
    a: { letter: "S", trait: "Stable", description: "Keeps a steady, predictable routine." },
    b: { letter: "F", trait: "Fluid", description: "Goes with the flow on schedules." },
  },
  {
    name: "Rules & boundaries",
    salt: "rules",
    a: { letter: "D", trait: "Defined", description: "Likes clear agreements and boundaries." },
    b: { letter: "L", trait: "Laid-back", description: "Prefers things flexible and informal." },
  },
] as const;

// The 16 HMTI types, keyed by their four-letter code.
const HMTI_TYPES: Record<string, { title: string; emoji: string; description: string }> = {
  NPSD: { title: "The Curator", emoji: "🗂️", description: "Tidy, low-key, and routine-driven, with clear house rules." },
  NPSL: { title: "The Quiet Keeper", emoji: "🧹", description: "Clean and steady, preferring calm over formal rules." },
  NPFD: { title: "The Minimalist", emoji: "🍃", description: "Orderly and independent — flexible day-to-day but values agreements." },
  NPFL: { title: "The Drifter", emoji: "🧘", description: "Tidy and self-contained, easygoing about schedules and rules." },
  NOSD: { title: "The Organizer", emoji: "📋", description: "Tidy and sociable, with a steady routine and clear expectations." },
  NOSL: { title: "The Welcoming Tidier", emoji: "🏡", description: "Clean, friendly, and routine-loving without the rulebook." },
  NOFD: { title: "The Social Architect", emoji: "🛠️", description: "Tidy and outgoing, spontaneous but likes clear boundaries." },
  NOFL: { title: "The Easy Host", emoji: "🎉", description: "Clean and social, going with the flow on schedules and rules." },
  CPSD: { title: "The Steady Solo", emoji: "🧱", description: "Relaxed about mess but private, routine-driven, and rule-oriented." },
  CPSL: { title: "The Homebody", emoji: "🛋️", description: "Easygoing and private, with a steady, low-pressure rhythm." },
  CPFD: { title: "The Independent", emoji: "🚪", description: "Laid-back and private, flexible day-to-day but values agreements." },
  CPFL: { title: "The Free Spirit", emoji: "🦋", description: "Relaxed, private, spontaneous, and allergic to strict rules." },
  COSD: { title: "The Connector", emoji: "🌐", description: "Easygoing and social, with a steady routine and clear boundaries." },
  COSL: { title: "The Nurturer", emoji: "🌱", description: "Warm, social, and steady, keeping things relaxed and flexible." },
  COFD: { title: "The Adventurer", emoji: "🧭", description: "Spontaneous and social, relaxed about mess but likes some ground rules." },
  COFL: { title: "The Free Roamer", emoji: "🎈", description: "Totally easygoing — relaxed, social, spontaneous, and rule-free." },
};

/**
 * Build a Housemate Type Indicator (HMTI) persona from a participant's input.
 *
 * TODO: replace this deterministic placeholder with a real AI-generated
 * assessment that reasons over the participant's answers.
 */
export function computePersona(input: string): Persona {
  const axes: PersonaAxis[] = HMTI_AXES.map((axis) => {
    const leansLeft = hash(input + axis.salt) % 2 === 0;
    return {
      name: axis.name,
      left: axis.a.trait,
      right: axis.b.trait,
      chosen: leansLeft ? "left" : "right",
      strength: 55 + (hash(input + axis.salt + "s") % 41), // 55-95
    };
  });
  const code = HMTI_AXES.map((axis, i) =>
    axes[i].chosen === "left" ? axis.a.letter : axis.b.letter,
  ).join("");
  const { title, emoji, description } = HMTI_TYPES[code];
  return { code, title, emoji, description, axes };
}
