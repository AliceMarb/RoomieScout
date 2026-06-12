/** Shared persona / avatar types. */

export type DealbreakersRow = {
  topic: string;
  personA: string;
  personB: string;
  compatible: boolean;
};

/** Prompt tone for avatar image generation. */
export type AvatarPromptStyle = "classic" | "cool";

/**
 * Everything we know about one of the 16 HMTI housemate types — copy,
 * avatar visuals, and the image-generation direction — in a single record.
 * This is the source of truth; nothing about a persona lives elsewhere.
 */
export type PersonaMeta = {
  /** 4-letter HMTI code, e.g. "NPSD". */
  code: string;
  /** Display name, e.g. "The Peaceful Planner". */
  title: string;
  /** Emoji avatar shorthand. */
  emoji: string;
  /** One-line description of the type. */
  description: string;

  // --- Avatar visuals (card art + generated image) ---
  animal: string;
  scene: string;
  expression: string;
  props: string[];
  /** Character-specific accessories for image generation. */
  accessories: string;
  /** Attitude/direction guidance for image generation. */
  characterDirection: string;
  palette: {
    bgFrom: string;
    bgTo: string;
    accent: string;
    soft: string;
    badge: string;
    badgeText: string;
  };

  // --- Card copy ---
  tagline: string;
  traitBadges: [string, string, string];
  roommateSuperpower: string;
  dangerZone: string;
  bestMatches: string[];
  householdEnergy: string;
};

/** Back-compat alias — prefer {@link PersonaMeta}. */
export type HmtiAvatarMeta = PersonaMeta;

/** One of the four binary axes that build a persona code. */
export type PersonaAxis = {
  name: string; // e.g. "Cleanliness"
  left: string; // left-pole trait label, e.g. "Neat"
  right: string; // right-pole trait label, e.g. "Casual"
  chosen: "left" | "right"; // which pole this person leans toward
  strength: number; // 55-95: how strongly they lean toward the chosen pole
};

/** A classified housemate persona for one participant. */
export type Persona = {
  code: string; // 4-letter HMTI code, e.g. "NPSD"
  title: string; // e.g. "The Peaceful Planner"
  emoji: string; // avatar emoji for the persona
  description: string;
  axes: PersonaAxis[]; // exactly 4 spectrum axes
};

/** A situational friction flag produced by the paid practical layer. */
export type PracticalFlag = {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  talkAbout: string;
};

/** One axis's personality-interaction analysis: dynamic + actionable advice. */
export type PersonalityInteraction = {
  axisName: string;
  traitA: string;
  traitB: string;
  dynamic: string;
  advice: string[];
};

/** Result of comparing two personas. */
export type CompatibilityResult = {
  score: number; // 0-100 overall compatibility
  categories: { name: string; score: number }[];
  summary: string;
  aiSummary?: string;
  dealbreakers?: DealbreakersRow[];
  // Paid layer — present only when both participants completed the practical form
  practicalFlags?: PracticalFlag[];
  personalityInteractions?: PersonalityInteraction[];
  conversationList?: string[];
};
