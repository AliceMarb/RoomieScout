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

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

const AXIS_WEIGHTS = [35, 30, 15, 20]; // cleanliness, social, rhythm, rules

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
 * Build an HMTI Persona from axis choices (used by the AI classifier).
 */
export function buildPersonaFromAxes(
  choices: Array<{ chosen: "left" | "right"; strength: number }>,
): Persona {
  const axes: PersonaAxis[] = HMTI_AXES.map((axis, i) => ({
    name: axis.name,
    left: axis.a.trait,
    right: axis.b.trait,
    chosen: choices[i].chosen,
    strength: choices[i].strength,
  }));
  const code = HMTI_AXES.map((axis, i) =>
    choices[i].chosen === "left" ? axis.a.letter : axis.b.letter,
  ).join("");
  const { title, emoji, description } = HMTI_TYPES[code];
  return { code, title, emoji, description, axes };
}

/**
 * Build a Housemate Type Indicator (HMTI) persona from a participant's input.
 * Deterministic fallback — used when no AI classification is available.
 */
export function computePersona(input: string): Persona {
  const choices = HMTI_AXES.map((axis) => ({
    chosen: (hash(input + axis.salt) % 2 === 0 ? "left" : "right") as "left" | "right",
    strength: 55 + (hash(input + axis.salt + "s") % 41),
  }));
  return buildPersonaFromAxes(choices);
}
