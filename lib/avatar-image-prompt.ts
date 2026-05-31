import { getHmtiAvatarMeta } from "@/lib/hmti-avatars";

export type AvatarPromptStyle = "classic" | "cool";

/** Funky accessories — character-specific, not overly sweet. */
const FUNKY_ACCESSORIES: Record<string, string> = {
  NPSD: "matte round glasses, slim tie, clipboard, organized desk setup",
  NPSL: "minimal wire-frame glasses, single book, clean lines, closed-door energy",
  NPFD: "over-ear headphones, neon sticky notes, laptop glow, planner — night-owl organizer",
  NPFL: "hoodie half-on, laundry basket, quiet hallway vibe, low-profile cap",
  NOSD: "captain clipboard, bandana, fresh cookies, chore chart — friendly leader not mascot plush",
  NOSL: "bandana, watering can, neat living room, approachable host energy",
  NOFD: "phone with group chat, snack checklist, fairy lights, lanyard with keys — social coordinator",
  NOFL: "headphones around neck, party shades on head, vinyl pin, clean but lively space",
  CPSD: "door knock sign, labeled snack bin, firm calm posture, boundary energy",
  CPSL: "headphones, beanbag, snack bowl — unbothered chill",
  CPFD: "hoodie blanket, laptop, quiet-zone sign, late-night focus",
  CPFL: "sleep mask on forehead, hoodie, snack stash — ghost roommate vibe",
  COSD: "apron, shared dinner spread, house whiteboard — communal manager",
  COSL: "blanket scarf, tea tray, warm couch hangout",
  COFD: "snack bandolier, guest-rules board, mischievous confident grin energy",
  COFL: "party shades, pizza slice, mini disco ball, speaker — hype but not childish",
};

/** How each type should read on the card — attitude over cuteness. */
const CHARACTER_DIRECTION: Record<string, string> = {
  NPSD:
    "Calm authority: tidy, private, rule-minded. Focused planner energy — proud and peaceful, not bubbly.",
  NPSL:
    "Quiet confidence: minimal, elegant, self-contained. Cool solitude — content alone, not shy-cute.",
  NPFD:
    "Sharp independent: organized chaos, night desk, capable loner. Stylish fox energy — clever, not cuddly.",
  NPFL:
    "Low-key legend: barely seen, always responsible. Mysterious clean ghost — subtle, not timid.",
  NOSD:
    "Friendly captain: runs the house with systems and warmth. Leader energy — welcoming, not hyper.",
  NOSL:
    "Neighborhood favorite: tidy, social, balanced. Warm host — relaxed smile, not cartoon cheer.",
  NOFD:
    "Social architect: plans hangouts, sets boundaries, group-chat energy. Charismatic organizer — cool and in control.",
  NOFL:
    "Main-character roommate: fun, clean counters, spontaneous. Expressive parrot vibe — joyful but stylish.",
  CPSD:
    "Boundary boss: calm, firm, protective of space. Grounded turtle — respectful tension, not aggressive.",
  CPSL:
    "Chill independent: low drama, private, steady. Unbothered panda — neutral cool, not lazy-cute.",
  CPFD:
    "Night-owl with rules: flexible schedule, clear lines. Cozy but guarded hedgehog — focused, not scared.",
  CPFL:
    "True ghost: rare sightings, pays rent, zero friction. Sleepy bat energy — amused, not helpless.",
  COSD:
    "Communal anchor: fair, warm, responsible shared living. Calm capybara host — grounded leader.",
  COSL:
    "Emotional comfort: cozy, social, steady. Gentle bear warmth — welcoming, not childish soft.",
  COFD:
    "Social negotiator: brings energy + etiquette. Clever raccoon — playful smirk, persuasive, not chaotic mess.",
  COFL:
    "Party-compatible: living room is the vibe. Otter hype — spontaneous fun, cool roommate not toddler energy.",
};

const STYLE_CLASSIC = `
Style: rounded animal mascot only (no humans), soft 3D clay / polished vector sticker, cozy apartment, pastel colors, Spotify Wrapped card vibe.
NOT realistic wildlife. Leave clean space at top third. No text or logos.
`.trim();

const STYLE_COOL = `
Style: stylized animal mascot roommate card (no humans). COOL + FUNKY — Spotify Wrapped meets streetwear sticker pack meets cozy apartment editorial.
NOT baby-cute, NOT chibi, NOT kawaii, NOT plush-toy, NOT oversized sparkly eyes, NOT infant proportions.
Soft 3D clay OR bold vector-sticker hybrid: confident silhouette, subtle attitude, expressive mature mascot design.
Pastel base with punchy accent colors. Modern app-friendly square composition.
Cozy apartment background (bedroom, kitchen, living room) with scene props, softly blurred.
Clean negative space at top third for text overlay. No text, letters, logos, or watermarks.
`.trim();

export function buildAvatarImagePrompt(
  code: string,
  style: AvatarPromptStyle = "cool",
): string {
  const meta = getHmtiAvatarMeta(code);
  const accessories = FUNKY_ACCESSORIES[code] ?? "funky accessories matching the personality";
  const direction = CHARACTER_DIRECTION[code] ?? meta.expression;
  const props = [...meta.props, accessories].join(", ");
  const styleBlock = style === "cool" ? STYLE_COOL : STYLE_CLASSIC;

  const toneLine =
    style === "cool"
      ? "Prioritize character attitude and roommate personality over cuteness. Cool, fun, shareable — like a personality result you'd post."
      : "Cute, fun, cool, lovable.";

  return `
Create a single square shareable avatar illustration for a roommate personality card.

${styleBlock}

HMTI type: ${code}
Persona: ${meta.title}
Animal mascot: ${meta.animal}
Tagline mood: "${meta.tagline}"
Character direction: ${direction}
Scene: ${meta.scene}
Expression: ${meta.expression}
Household vibe: ${meta.householdEnergy}
Color palette: pastels + accents inspired by ${meta.palette.bgFrom}, ${meta.palette.accent}, ${meta.palette.soft}

Props and accessories: ${props}

Center the ${meta.animal} mascot as the hero with a pose that matches the character direction. ${toneLine}
`.trim();
}
