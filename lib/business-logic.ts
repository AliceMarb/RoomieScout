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
  NPSD: { title: "The Peaceful Planner", emoji: "🦉", description: "Tidy, private, and routine-driven with clear house rules." },
  NPSL: { title: "The Quiet Minimalist", emoji: "🐱", description: "Clean, private, and low-drama — keeps to themselves." },
  NPFD: { title: "The Independent Organizer", emoji: "🦊", description: "Organized space, flexible schedule, strong boundaries." },
  NPFL: { title: "The Clean Ghost", emoji: "✨", description: "Barely seen but keeps shared spaces spotless." },
  NOSD: { title: "The House Captain", emoji: "🐕", description: "Friendly leader who runs the home with snacks and systems." },
  NOSL: { title: "The Friendly Maintainer", emoji: "🐶", description: "Warm, tidy, and easygoing — everyone likes them." },
  NOFD: { title: "The Social Organizer", emoji: "🐼", description: "Social and clean — spontaneous plans, scheduled responsibly." },
  NOFL: { title: "The Clean Free Spirit", emoji: "🦜", description: "Playful energy with surprisingly clean counters." },
  CPSD: { title: "The Boundary Keeper", emoji: "🐢", description: "Private and steady — clear boundaries, calm energy." },
  CPSL: { title: "The Easygoing Independent", emoji: "🐼", description: "Chill, private, and low-pressure — no drama." },
  CPFD: { title: "The Flexible Boundary Setter", emoji: "🦔", description: "Night owl with flexible routine and clear lines." },
  CPFL: { title: "The True Ghost Roommate", emoji: "🦇", description: "Seen once a week — pays rent, barely interferes." },
  COSD: { title: "The Communal Manager", emoji: "🫶", description: "Warm communal living with fair shared expectations." },
  COSL: { title: "The Warm Housemate", emoji: "🐻", description: "Emotionally cozy — makes the apartment feel like home." },
  COFD: { title: "The Social Negotiator", emoji: "🦝", description: "Brings energy and group-chat etiquette to flexible living." },
  COFL: { title: "The Party-Compatible Roommate", emoji: "🦦", description: "The living room is a lifestyle — fun and spontaneous." },
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
