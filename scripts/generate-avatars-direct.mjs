/**
 * Generate HMTI avatar PNGs by calling OpenAI directly (no dev server needed).
 *
 * Usage:
 *   node scripts/generate-avatars-direct.mjs [--force] [--out=DIR] [CODE ...]
 *     --force      overwrite existing files
 *     --out=DIR    output subfolder under public/avatars (default: previews)
 *     CODE ...     only generate specific codes (e.g. NPDS NOHS)
 *
 * Cost controls (env vars):
 *   OPENAI_IMAGE_MODEL   default "gpt-image-1-mini"  (~$0.005/img)
 *   IMAGE_QUALITY        default "medium"            (low | medium | high)
 *
 * Examples:
 *   # test 2 avatars into public/avatars/previews/ (won't overwrite production)
 *   node scripts/generate-avatars-direct.mjs --force NPDS NOHS
 *   # full model + medium quality
 *   OPENAI_IMAGE_MODEL=gpt-image-1 IMAGE_QUALITY=medium node scripts/generate-avatars-direct.mjs --force NPDS
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync, createReadStream } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import OpenAI, { toFile } from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Load .env.local — try the worktree root first, then fall back to the main repo
// checkout (../../../.env.local from a .claude/worktrees/<name> worktree), since
// .env.local is gitignored and won't be copied into a worktree.
const envCandidates = [
  resolve(root, ".env.local"),
  resolve(root, "..", "..", "..", ".env.local"),
];
for (const envPath of envCandidates) {
  if (!existsSync(envPath)) continue;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
  break;
}

const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1-mini";
const QUALITY = process.env.IMAGE_QUALITY ?? "medium";

// Rough per-image cost estimate for the console summary (1024x1024).
const COST_TABLE = {
  "gpt-image-1-mini": { low: 0.004, medium: 0.005, high: 0.012 },
  "gpt-image-1": { low: 0.02, medium: 0.07, high: 0.19 },
};
const estCost = COST_TABLE[MODEL]?.[QUALITY];

const ALL_CODES = [
  "NPDS","NPDF","NPHS","NPHF",
  "NODS","NODF","NOHS","NOHF",
  "CPDS","CPDF","CPHS","CPHF",
  "CODS","CODF","COHS","COHF",
];

const args = process.argv.slice(2);
const force = args.includes("--force");
const outArg = args.find(a => a.startsWith("--out="));
const outSub = outArg ? outArg.slice("--out=".length) : "previews";
const refArg = args.find(a => a.startsWith("--ref="));
const refImagePath = refArg ? resolve(root, refArg.slice("--ref=".length)) : null;
const requestedCodes = args
  .filter(a => a !== "--force" && !a.startsWith("--out=") && !a.startsWith("--ref="))
  .map(a => a.toUpperCase());
const CODES = requestedCodes.length ? requestedCodes : ALL_CODES;

const avatarsDir = resolve(root, "public", "avatars", outSub);
mkdirSync(avatarsDir, { recursive: true });

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set (looked in .env.local of the worktree and main repo)");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── VERSION LOG ──────────────────────────────────────────────────────────────
// previews/       (v1) — over-softened; "NO outlines NO hard linework" + blurred
//                        background → formless, no detail, lost personality
// previews/v2     — smooth polished clay (not rough), "not sleepy/tired" added
//                   to P expression, background "visible and recognisable"
// previews/v3     — portrait crop (no legs), bright well-lit room, character uses
//                   natural animal colours (palette = background only), NPDS scene
//                   changed from "cool" to "warm" lamp, expression more alert/awake
// previews/v4     — all 16 scenes rebuilt with personality details from data.ts;
//                   character contrasts with background (not natural colours only)
// previews/v5     — new premium STYLE block (collectible figurine / app mascot);
//                   FUNKY_ACCESSORIES added per persona (v2 codes); accessories
//                   included in buildPrompt
// previews/v6     — mascot/expression/personality first in prompt (subject before
//                   style); palette → "Scene and accent palette" + bgTo added as
//                   warm contrast tone so model avoids monochrome
// previews/v7     — stripped STYLE back to ~1 line (original approach);
//                   per-persona data (scene, pose, accessories, expression) does
//                   the work; elaborate style instructions were making it worse
// previews/v8     — restored missing original style elements: gentle rounded forms,
//                   NO outlines/hard linework, chest-up framing, soft ambient lighting,
//                   NO bold outlines/comic/sticker, full gender-neutral list with
//                   eyelashes/jewellery + "androgynous and cute"; smooth + not grainy
// ─────────────────────────────────────────────────────────────────────────────

// ── AVATAR DESIGN DECISIONS ──────────────────────────────────────────────────
//
// STYLE
//   Soft 3D claymation. Smooth matte clay, rounded forms, no hard outlines.
//   Pixar-adjacent warmth — NOT bold/graphic, NOT realistic wildlife.
//   Loved reference: the COSL bear and NPSD/NPSL owls from earlier runs.
//
// EXPRESSION (most important thing)
//   Hard floor: never unhappy, sad, stern, furrowed, or sulky for any persona.
//   The early NPDF/NPDS batches looked angry; NOHS looked too unhappy.
//   P/O axis (second letter) drives warmth:
//     P (Private) → calm and content, soft peaceful smile — quietly at ease
//     O (Open)    → warm and genuinely happy, bright open smile, welcoming
//   Fix: lead with positive direction, not just rules about what to avoid.
//
// ONE CHARACTER ONLY
//   The animal mascot only — no other people or animals in the scene.
//   Party-in-progress backgrounds are fine; other characters are not.
//
// BACKGROUND / SCENE
//   Derived from the HMTI axes, not a literal prop list:
//     N/C  Neat vs Casual  →  tidy/clean vs lived-in/comfortable space
//     P/O  Private vs Open →  desk/bedroom vs kitchen/living room
//     S/F  Structured vs Flexible → visible systems (chore chart, calendar,
//          labelled shelf) vs informal, things-where-they-landed feel
//     D/H  Direct vs Harmonious  → posture/energy, not really a scene thing
//   Each persona varies HOW it expresses its axes — NODS (Structured) gets a
//   chore chart, NPDS (Structured) gets a wall calendar, CPDS gets labelled
//   shelves. Same axis, different signature detail. One specific story prop is
//   fine (CPHF's fridge glow, CODS's dinner table); full prop lists are not.
//
// COLOUR
//   Palette specified as colour words + hex — both signal types together.
//   Each persona has a distinct palette from data.ts.
//
// NO TEXT
//   Absolutely no text, words, labels or numbers anywhere in the image,
//   including on props. (No top-third rule — text overlay is separate in UI.)
//
// GENDER-NEUTRAL
//   No makeup, pearls, bows, ties or other masculine/feminine markers.
//
// ─────────────────────────────────────────────────────────────────────────────

// Per-persona flavour. Scene is derived from the HMTI axes:
//   N/C (Neat/Casual) → tidy vs lived-in space
//   P/O (Private/Open) → desk/bedroom vs kitchen/living room
//   D/H (Direct/Harmonious) → posture/energy, not scene
//   S/F (Structured/Flexible) → visible systems vs informal feel
// One signature detail is added where it defines the character.
// Palette uses colour words + hex so the model gets both signal types.
const PROMPTS = {
  // ── NEAT × PRIVATE ───────────────────────────────────────────────────────
  NPDS: { animal: "owl",             pose: "seated at desk, glancing at their planner with quiet satisfaction",                                                   accessories: "matte round glasses, slim planner, neat desk organizer",                                                       scene: "warm study — alphabetized bookshelf, spotless desk, one tidy succulent, small wall calendar (no visible text), warm desk lamp casting a soft glow",         note: "composed curator: orderly, proud of their systems, calm authority. Not fussy — elegant and precise",             palette: "cool blues with warm cream — #e8f0fa, #6b9fd4, #faf6ee" },
  NPDF: { animal: "fox",             pose: "leaning back at desk, headphones on, reviewing something on the laptop with focused energy",                         accessories: "over-ear headphones, neon sticky notes, laptop glow, packed tote bag by the chair",                             scene: "private desk at odd hours — laptop open, sticky notes around the monitor, packed bag by the chair, dim focused lamp",   note: "sharp independent: organized, low-drama, handles things. Stylish fox — clever and capable, not cuddly",          palette: "soft violets with warm blush — #ede8f5, #7c6bc4, #f5ebe8" },
  NPHS: { animal: "cat",             pose: "curled up reading, fully at ease, one paw resting on the open book",                                                 accessories: "minimal wire-frame glasses, single book, do-not-disturb sign",                                                 scene: "serene bedroom — perfectly minimal belongings, small pinboard on wall, sparkling surfaces, single plant by window, soft morning light",   note: "quiet confidence: minimal, elegant, self-contained. Cool solitude — content and graceful, not shy",              palette: "soft sage greens with warm linen — #e8f0e8, #7a9e78, #f5f2eb" },
  NPHF: { animal: "ferret",          pose: "padding quietly through, laundry basket tucked under one arm, glancing back with a small knowing smile",             accessories: "hoodie half-on, low-profile cap, laundry basket",                                                              scene: "gleaming kitchen at dawn — sparkle trail left behind, empty sink, folded towels appearing as if by magic, half-open bedroom door",             note: "low-key legend: barely seen, always responsible. Ethereal clean ghost — quietly magical, not timid",              palette: "soft aqua teals with warm peach — #e8faf5, #6bc4b8, #faf0e8" },
  // ── NEAT × OPEN ──────────────────────────────────────────────────────────
  NODS: { animal: "golden retriever", pose: "clipboard held up, mid-cheerful-announcement, warm and in charge",                                                  accessories: "clipboard, bandana, fresh cookies out — friendly leader energy",                                              scene: "bright kitchen — blank chart on the fridge, fresh snacks out, clipboard in hand, phone face-down on the counter, everything organised",     note: "friendly captain: runs the house with systems and warmth. Leader energy — welcoming and direct, not hyper",      palette: "warm sunny yellows with soft sky — #fff8e0, #e8b848, #e8f4ff" },
  NODF: { animal: "parrot",           pose: "mid-gesture, one arm out, turning to say something vivid and direct",                                              accessories: "colourful scarf, music playing in the background — vivid and social",                             scene: "living room mid-party-prep — surfaces already spotless, group text going out, energy everywhere, fairy lights just going up",                  note: "main-character roommate: big social energy, clean counters, says what's off. Expressive parrot — joyful and direct, not chaotic",             palette: "bright sky blues with soft pink — #e8f8ff, #48b8d4, #fff0f5" },
  NOHS: { animal: "corgi",            pose: "watering a plant with one hand, snack bowl nearby, softly content and busy",                                        accessories: "bandana, watering can, snack bowl, plants nearby",                                                            scene: "cosy kitchen evening — tea on the stove, bins by the door, everything in its place, warm amber light, plants cared for",                      note: "neighbourhood favourite: warm, tidy, quietly attentive. Gentle corgi — caring without being over-the-top",       palette: "warm peachy tones with soft sage — #fff0e8, #e8a078, #f0f5e8" },
  NOHF: { animal: "red panda",        pose: "lounging back with a warm drink, effortlessly at home, completely unbothered",                                      accessories: "cosy sweater, warm drink in hand, plants all around",                                                         scene: "sunny living room — tidy without trying, soft light, relaxed hangout energy, spontaneous-ready, plants everywhere",                            note: "effortless sunshine: clean habits, warm vibe, allergic to drama. Red panda ease — bright and natural, not performative",       palette: "warm coral reds with cool mint — #ffe8e8, #e87868, #e8f5f5" },
  // ── CASUAL × PRIVATE ─────────────────────────────────────────────────────
  CPDS: { animal: "turtle",           pose: "standing in their doorway, calm and unhurried, one hand resting on the door frame",                                 accessories: "door-knock sign, labelled shelf, firm calm posture — grounded and clear",                                     scene: "bedroom doorway — lived-in personal space, labelled shelf, a few things on the floor but deliberately placed, please-knock sign, warm lamp",                    note: "boundary anchor: grounded, relaxed about mess, crystal clear on expectations. Unflappable turtle — respectful firmness, not aggressive",      palette: "earthy sage greens with warm sand — #e8f0e8, #5a8a5a, #f5f0e8" },
  CPDF: { animal: "hedgehog",         pose: "hunched slightly over the laptop, focused, coffee cup close, completely in their own world",                        accessories: "dark hoodie, coffee cup, dim desk lamp — self-contained night-owl setup",                                     scene: "private bedroom desk, late at night — laptop open, coffee cup nearby, dim lamp, midnight snack, minimal and functional",                         note: "night-owl maverick: own schedule, clear lines, refreshingly blunt. Compact hedgehog — focused and direct, not prickly-cute",                  palette: "soft muted purples with warm sand — #ede8f8, #8a6ab8, #f5f0e8" },
  CPHS: { animal: "panda",            pose: "settled deep into the beanbag, headphones on, snack in reach, going absolutely nowhere",                           accessories: "headphones, beanbag, snack bowl — same spot every time",                                                     scene: "lived-in beanbag corner — headphones on, snacks and a couple of empty wrappers nearby, spare hoodie draped over the side, soft lamp, comfortable chaos",                       note: "chill independent: zero drama, steady routine, nothing rattles them. Unbothered panda — neutral cool, at peace",                              palette: "soft pale lavender with warm cream — #f0ebfa, #c4a8e8, #f5f2eb" },
  CPHF: { animal: "sasquatch",        pose: "reaching into the open fridge, snack in hand, glancing sideways with calm amusement",                              accessories: "worn hoodie, sleep mask pushed up on forehead, snack in hand",                                                scene: "dark kitchen at 2am — fridge door open, same worn hoodie as always, soft cold glow, legendary elusive presence",                              note: "true ghost: rare sightings, zero friction, legendary rent payments. Lovably unkempt sasquatch — amused and elusive, not helpless",                           palette: "muted blues with pale lavender — #e8e8f5, #5a6ab8, #f0f0f8" },
  // ── CASUAL × OPEN ────────────────────────────────────────────────────────
  CODS: { animal: "capybara",         pose: "standing at the head of the table, calm and welcoming, gesturing for everyone to sit",                              accessories: "apron, blank whiteboard nearby, open welcoming posture",                                                      scene: "Sunday dinner table — communal spread, blank whiteboard on the wall, mismatched plates, big warm welcoming table",                      note: "communal anchor: fair, warm, responsible. Calm capybara host — grounded leader who surfaces problems before they fester",                     palette: "warm amber golds with soft sage — #fff5e8, #c49050, #f0f5e8" },
  CODF: { animal: "raccoon",          pose: "mid-string-of-fairy-lights, one arm raised, grinning like they just had a great idea",                             accessories: "fairy lights in hand, snack tray, mid-plan mischievous energy",                                               scene: "living room mid-transformation — fairy lights just strung, taco spread on the table, blank whiteboard on the wall, mid-plan chaos energy",    note: "social ringleader: spontaneous, names issues, makes the fix fun. Clever raccoon — playful smirk, persuasive, not chaotic mess",               palette: "soft blues with pale sky — #e8f0ff, #5090d4, #f0f8ff" },
  COHS: { animal: "bear",             pose: "cradling a mug with both hands, settled into the couch, fully present and warm",                                   accessories: "soft sweater, tea mug in hand, blanket nearby",                                                              scene: "cosy living room sofa corner — mismatched mugs on the coffee table, growing blanket pile, comfort show on TV, warm soft light",                    note: "emotional comfort: cozy, social, steady. Gentle bear warmth — welcoming and reliable, not childish soft",                                     palette: "warm amber with soft rose — #fff5e8, #d4a050, #ffeef0" },
  COHF: { animal: "otter",            pose: "mid-groove, one arm up, pizza slice in the other hand, completely in their element",                               accessories: "party shades pushed up on head, pizza slice, mini disco ball catching light",                                 scene: "living room as venue — speaker charged and blasting, disco ball in the corner, string lights, pizza nearby, rolling with all of it",          note: "party-compatible: living room is the vibe. Otter hype — spontaneous fun, cool roommate energy, never holds a grudge",                         palette: "bright teals with soft pink — #e8f8ff, #5ab8d4, #fff0f8" },
};

const STYLE = `Style: stylized animal mascot roommate card (no humans). COOL + FUNKY — soft 3D clay, confident silhouette, subtle attitude, expressive mature mascot design.
NOT baby-cute, NOT chibi, NOT kawaii, NOT plush-toy, NOT oversized sparkly eyes, NOT infant proportions. NO bold outlines, NO hard linework, NO sticker-style black borders.
Pastel base with punchy accent colors. Modern app-friendly square composition.
Cozy apartment background (bedroom, kitchen, living room) with scene props visible.
No text, letters, logos, or watermarks anywhere in the image including on props.
Gender-neutral: no pearls, jewellery, eyelashes, makeup, bows, ties or other masculine/feminine markers. Keep the character androgynous.`;

// P/O axis (second letter) drives expression warmth.
// Hard floor for all: never unhappy, sad, stern or frowning.
const EXPRESSION = {
  P: "calm and content — bright alert eyes wide open, a clear warm smile. Awake and at ease, not sleepy or tired.",
  O: "warm and genuinely happy — open smile, friendly and welcoming. Eyes natural-sized, not oversized or cartoon-round.",
};

const LOCKED_RULES = `Gender-neutral: no pearls, jewellery, eyelashes, makeup, bows, ties or other masculine/feminine markers. Keep the character androgynous — no gendered features whatsoever.
No text, letters, words, numbers, signs, labels or logos anywhere in the image including on any props.
No grey, drab, or washed-out colours — the palette should feel warm, vibrant and distinct.`;

function buildPrompt(code, { refMode = false } = {}) {
  const p = PROMPTS[code] ?? { animal: "animal", pose: "relaxed", accessories: "none", scene: "cosy apartment", note: "friendly roommate", palette: "soft pastels" };
  const article = /^[aeiou]/i.test(p.animal) ? "an" : "a";
  const expression = EXPRESSION[code[1]] ?? EXPRESSION.P;
  const styleBlock = refMode ? "" : `\n${STYLE}\n`;
  return `Create a single square shareable avatar illustration for a roommate personality card.
${styleBlock}
${LOCKED_RULES}

Animal mascot: ${article} ${p.animal}.
Character direction: ${p.note}.
Expression: ${expression}
Pose: ${p.pose}.
Accessories: ${p.accessories}.
Scene: ${p.scene}.
Colour palette (3 main colours): ${p.palette}. Stick to these as the primary scheme — props and accessories can have their own natural colours on top.

Center the ${p.animal} as the hero with a pose that matches the character direction. Prioritize character attitude and roommate personality. Cool, fun, shareable — like a personality result you'd happily post.`.trim();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const results = { ok: [], skipped: [], failed: [] };
console.log(`Generating ${CODES.length} avatar(s) via ${refImagePath ? `gpt-image-1 (edit mode, ref: ${refImagePath})` : `${MODEL} @ quality="${QUALITY}"${estCost ? ` (~$${estCost.toFixed(3)}/img, est ~$${(estCost * CODES.length).toFixed(2)} total)` : ""}`}` +
  `\nOutput: public/avatars/${outSub}/\n`);

for (let i = 0; i < CODES.length; i++) {
  const code = CODES[i];
  const outPath = resolve(avatarsDir, `${code}.png`);

  if (!force && existsSync(outPath)) {
    console.log(`[${i+1}/${CODES.length}] ${code} — skipped (exists)`);
    results.skipped.push(code);
    continue;
  }

  process.stdout.write(`[${i+1}/${CODES.length}] ${code} (${PROMPTS[code]?.animal}) — generating...`);

  try {
    const prompt = buildPrompt(code, { refMode: !!refImagePath });
    const response = refImagePath
      ? await openai.images.edit({
          model: MODEL,
          image: await toFile(createReadStream(refImagePath), "reference.png", { type: "image/png" }),
          prompt: `The attached image shows a bear avatar in a smooth 3D clay style. Copy ONLY the rendering style: smooth rounded 3D clay forms, soft depth and volume, warm ambient lighting, clean matte surfaces. Do NOT copy the bear character, its pose, or its brown/amber colours — the new character must use its own specified colour palette. Create a completely new character: ${prompt}`,
          n: 1,
          size: "1024x1024",
        })
      : await openai.images.generate({
          model: MODEL,
          prompt,
          n: 1,
          size: "1024x1024",
          quality: QUALITY,
          output_format: "png",
        });

    const item = response.data?.[0];
    let b64 = item?.b64_json;
    if (!b64 && item?.url) {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
      b64 = Buffer.from(await res.arrayBuffer()).toString("base64");
    }
    if (!b64) throw new Error("No image data in response");

    writeFileSync(outPath, Buffer.from(b64, "base64"));
    console.log(` done → /avatars/${outSub}/${code}.png`);
    results.ok.push(code);
  } catch (err) {
    console.log(` FAILED: ${err.message}`);
    results.failed.push({ code, error: err.message });
  }

  if (i < CODES.length - 1) await sleep(1500);
}

console.log("\n--- Summary ---");
console.log(`Model:     ${MODEL} @ ${QUALITY}`);
console.log(`Generated: ${results.ok.length}${results.ok.length ? ` (${results.ok.join(", ")})` : ""}`);
console.log(`Skipped:   ${results.skipped.length}${results.skipped.length ? ` (${results.skipped.join(", ")})` : ""}`);
console.log(`Failed:    ${results.failed.length}`);
for (const f of results.failed) console.log(`  ${f.code}: ${f.error}`);
process.exit(results.failed.length > 0 ? 1 : 0);
