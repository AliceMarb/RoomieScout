/**
 * Rich card copy for all 16 HMTI v2 types.
 *
 * Purpose-built fields, each doing one job:
 *   - tagline            → the shareable headline (social/share card)
 *   - miniBio            → first-person identity, the voice
 *   - roommateSuperpower → what you bring (flattering, true)
 *   - growthEdge         → the mirror: a gentle, self-aware blind spot, second person
 *   - whatYouNeed        → the reciprocal: the home/roommate that actually suits you
 *   - dangerZone         → who clashes (pairing signal; will migrate to the roommate file)
 *   - bestMatches        → top-3 matching codes (pairing signal)
 *
 * Dropped vs. the old shape: `householdEnergy` (it was the miniBio in fragments).
 * The visual data (palette, animal, scene) lives in data.ts alongside the full
 * PersonaMeta catalogue. This file is card-copy only.
 */

export type PersonaMetaV2 = {
  code: string;
  tagline: string;
  miniBio: string;
  roommateSuperpower: string;
  growthEdge: string;
  whatYouNeed: string;
  dangerZone: string;
  bestMatches: string[];
};

export const PERSONA_META_V2: Record<string, PersonaMetaV2> = {
  NPDS: {
    code: "NPDS",
    tagline: "Quiet hours are my love language.",
    miniBio: "\"Yes, my spice rack is alphabetized, and no, I'm not sorry. If something's bugging me you'll hear it within a day — said once, fixed, done. I'll give you a spotless kitchen and total respect for your closed door; I just ask for the same.\"",
    roommateSuperpower: "Spotless shared spaces, respected closed doors, zero passive aggression — issues get raised once, kindly, and solved.",
    growthEdge: "\"Said once, fixed, done\" works for you — but the people you live with may need a softer on-ramp than a same-day correction. Your standards are real; so is the warmth it takes to make them land.",
    whatYouNeed: "Roommates who keep shared spaces genuinely clean and can take a direct note without flinching — and who won't need you to be chatty to feel liked.",
    dangerZone: "Mess left in shared spaces, vague house agreements, and housemates who passive-aggressively ignore problems.",
    bestMatches: ["NPDF", "NPHS", "NODS"],
  },
  NPDF: {
    code: "NPDF",
    tagline: "My schedule is chaos, but my space is not.",
    miniBio: "\"You won't find a chore chart here because you won't need one — the dishes are already done. My hours are weird, my space is clean, and if there's a problem I'll just tell you. Low drama, high competence.\"",
    roommateSuperpower: "Handles things without being asked. If something's off, says so plainly and moves on. No charts, no drama.",
    growthEdge: "You read as low-maintenance because you ask for so little — but that same self-sufficiency can look like a closed door. The occasional \"how's your week\" costs you nothing and tells people they're not an imposition.",
    whatYouNeed: "People who don't mistake your directness for coldness or your quiet for a problem, and who run their own lives without needing yours narrated.",
    dangerZone: "Housemates who mistake directness for coldness, or who need constant social reassurance.",
    bestMatches: ["NPDS", "NPHF", "NODF"],
  },
  NPHS: {
    code: "NPHS",
    tagline: "Good systems mean no awkward conversations.",
    miniBio: "\"I own exactly enough things and all of them are clean. I love a good rota because it means we never have to have An Awkward Talk. You'll forget I'm home, and your kitchen will sparkle anyway.\"",
    roommateSuperpower: "Creates a calm, orderly home without any drama. Good systems replace the need for uncomfortable chats.",
    growthEdge: "Systems are brilliant until something falls outside the rota — and that's exactly when you tend to go quiet instead of speaking up. Not every friction has a chart; some just need a sentence.",
    whatYouNeed: "Roommates who respect the routine and handle their own emotional weather, so the home stays as calm as you keep it.",
    dangerZone: "Surprise changes to the routine, messy common spaces, and housemates who expect regular emotional processing.",
    bestMatches: ["NPHF", "NPDS", "NOHS"],
  },
  NPHF: {
    code: "NPHF",
    tagline: "You'll know I live here because everything is clean.",
    miniBio: "\"The sink is always empty and you'll never figure out when I did it. I don't need rules, meetings, or bonding nights — just a quiet hello in the hallway. The cleanest roommate you'll never see.\"",
    roommateSuperpower: "The most frictionless roommate in the system — clean, quiet, completely drama-free.",
    growthEdge: "Being frictionless is a gift, but invisibility has a cost: people can't appreciate — or reciprocate — what they never see. Letting a roommate catch you mid-clean once in a while turns a ghost into a person.",
    whatYouNeed: "A low-key household that won't read your quiet as coldness or expect bonding nights you didn't sign up for.",
    dangerZone: "Housemates who need a lot of social energy, expect bonding nights, or interpret silence as coldness.",
    bestMatches: ["NPHS", "NPDF", "NOHS"],
  },
  NODS: {
    code: "NODS",
    tagline: "I run this house with snacks and systems.",
    miniBio: "\"Yes I made the group chat, yes there's a chore chart, yes there are snacks. I'll say the hard thing so nobody has to stew, then we're back to movie night. This house runs, and it runs happy.\"",
    roommateSuperpower: "Turns the apartment into a clean, connected household with warmth and actual systems.",
    growthEdge: "You make the house run — but a household isn't a project, and not everyone wants to be managed in their own home. Leave room for the parts that don't need optimizing.",
    whatYouNeed: "Roommates who actually engage — chip in, answer the group chat, and don't treat your structure as control.",
    dangerZone: "Housemates who ignore the chore chart, avoid the group chat, or treat structure as controlling.",
    bestMatches: ["NODF", "NOHS", "NPDS"],
  },
  NODF: {
    code: "NODF",
    tagline: "Direct, clean, and always up for a plan.",
    miniBio: "\"Dinner party in two hours, decided ten minutes ago — and the counters will still be clean before bed. I'll tell you to your face if something's off, then hug it out. Life's too short for a quiet apartment and a passive-aggressive note.\"",
    roommateSuperpower: "Spontaneous plans and surprisingly clean counters. Names issues warmly and directly, then moves on.",
    growthEdge: "\"Hug it out\" works because you bounce back fast — give the people who don't a beat between the hard thing and the hug. Spontaneity is fun until someone needed a warning.",
    whatYouNeed: "People who can take a face-to-face conversation without it stinging, and who like a home that's open and a little unpredictable.",
    dangerZone: "Housemates who take directness personally or need strict quiet and predictability at home.",
    bestMatches: ["NODS", "NOHF", "NPDF"],
  },
  NOHS: {
    code: "NOHS",
    tagline: "The apartment is warmer because I'm in it.",
    miniBio: "\"I'll remember your exam, your interview, and how you take your tea. The kitchen stays clean, the vibe stays soft, and the drama stays at zero. People say living with me feels like the apartment got warmer.\"",
    roommateSuperpower: "The home genuinely feels nicer with them in it. Warm, tidy, reliable, and zero drama.",
    growthEdge: "You remember everyone's exam and swallow your own bad days to keep the vibe soft — but care has to flow both ways or it quietly drains you. Let people show up for you too.",
    whatYouNeed: "Roommates who match your warmth and won't bring chaotic, confrontational energy into the home you work to keep gentle.",
    dangerZone: "Direct confrontation, unpredictable messes, and housemates who bring chaotic energy home.",
    bestMatches: ["NOHF", "NODS", "NPHS"],
  },
  NOHF: {
    code: "NOHF",
    tagline: "Good mood included with the lease.",
    miniBio: "\"Plans? Sure. No plans? Also great. I keep things clean without making it a thing, and I genuinely cannot remember our last argument because there wasn't one. Good mood included with the lease.\"",
    roommateSuperpower: "Easygoing warmth with clean habits. Up for anything, allergic to drama, somehow always tidy.",
    growthEdge: "Forgetting the last argument is lovely — until \"I'm fine\" becomes a reflex and a real problem never gets aired. Easygoing is a strength; so is occasionally not letting it go.",
    whatYouNeed: "A drama-light home with people who don't hold grudges or impose rigid routines on your flexible streak.",
    dangerZone: "Heavy ongoing drama, rigid routines enforced on others, housemates who hold grudges.",
    bestMatches: ["NOHS", "NODF", "NPHF"],
  },
  CPDS: {
    code: "CPDS",
    tagline: "Clear expectations, zero surprises.",
    miniBio: "\"I won't count your dishes and I won't touch your stuff — and I expect the same energy back. I say what I mean the first time, so you'll never have to guess where you stand. Steady as they come.\"",
    roommateSuperpower: "Crystal clear about space and expectations. You always know exactly where you stand.",
    growthEdge: "You're crystal clear about your own boundaries — make sure you're as generous hearing other people's. \"Same energy back\" only works if you also notice when someone needs something different from you.",
    whatYouNeed: "Roommates who respect stated boundaries and stay out of your stuff, and who won't need a spotless home to feel settled.",
    dangerZone: "Housemates who leave shared spaces in chaos, ignore agreements, or don't respect clear boundaries.",
    bestMatches: ["CPDF", "CPHS", "CODS"],
  },
  CPDF: {
    code: "CPDF",
    tagline: "Refreshingly blunt. Impressively low-maintenance.",
    miniBio: "\"My schedule makes no sense and neither does my sleep, but my rent clears and my problems are my own. I won't bother you over small stuff — if I'm knocking on your door, it actually matters. Refreshingly blunt, impressively low-maintenance.\"",
    roommateSuperpower: "Refreshingly blunt and completely self-sufficient. Won't bother you unless it actually matters.",
    growthEdge: "\"If I'm knocking it actually matters\" keeps things low-friction — but people can't read the line between low-maintenance and uninterested. A small check-in now and then keeps you from disappearing entirely.",
    whatYouNeed: "People who don't need constant availability or bonding, and who can take blunt honesty in the spirit it's meant.",
    dangerZone: "Needy roommates, forced bonding, housemates who over-share or need constant availability.",
    bestMatches: ["CPDS", "CPHF", "CODF"],
  },
  CPHS: {
    code: "CPHS",
    tagline: "Peak chill. Zero opinions about your life.",
    miniBio: "\"Same routine every day, zero opinions about yours. Nothing rattles me — not your blender at 7am, not your friends on the couch. I'm not avoiding you, I'm just extremely at peace.\"",
    roommateSuperpower: "Peak chill with a steady rhythm. Nothing rattles them. Completely respects your space and expects the same.",
    growthEdge: "Nothing rattling you is a gift to live with — but \"no opinions\" can tip into never advocating for yourself, and the 7am blender you tolerate today is a resentment you're saving for later. It's okay to have a preference out loud.",
    whatYouNeed: "A low-conflict home where things don't escalate, with roommates who won't drag you into drama or force the social dial up.",
    dangerZone: "Unavoidable conflict situations, forced social time, environments where things escalate.",
    bestMatches: ["CPHF", "CPDS", "COHS"],
  },
  CPHF: {
    code: "CPHF",
    tagline: "May or may not be real.",
    miniBio: "\"Last confirmed sighting: the fridge, 2:14am, brief nod exchanged. Rent arrives on time from somewhere. I want nothing, I bother no one, I may or may not be real.\"",
    roommateSuperpower: "Pays rent on time, bothers no one, asks nothing. The ultimate low-friction housemate.",
    growthEdge: "Asking for nothing makes you easy to live with and easy to overlook — and one day you'll want something from the house and find you never built the standing to ask. A little presence is an investment, not a cost.",
    whatYouNeed: "Roommates who don't need check-ins or to know where you are, and who'll take a 2am fridge nod as a complete and meaningful interaction.",
    dangerZone: "Housemates who need connection, check-ins, or want to know where you are at all times.",
    bestMatches: ["CPHS", "CPDF", "COHF"],
  },
  CODS: {
    code: "CODS",
    tagline: "People matter more than counters.",
    miniBio: "\"Sunday dinner is at mine, the bills are split fair, and nobody eats alone unless they want to. I'll bring up the hard stuff at the table so it never festers in the group chat. A little mess is fine — people matter more than counters.\"",
    roommateSuperpower: "Holds the household together — communal dinners, fair splits, real talk before things fester.",
    growthEdge: "You bring the hard stuff to the table so it never festers — just check that the \"we\" decisions are actually shared, not you deciding what's best for the house. Holding everyone together can shade into holding the reins.",
    whatYouNeed: "Roommates who show up for the communal stuff and won't shut down when you raise something real.",
    dangerZone: "Housemates who shut down, avoid the group dynamic, or let issues quietly build.",
    bestMatches: ["CODF", "COHS", "CPDS"],
  },
  CODF: {
    code: "CODF",
    tagline: "The chaos you'll miss when you move out.",
    miniBio: "\"I'm why Tuesday became taco night and why the hallway has fairy lights now. If there's an issue I'll name it out loud — and somehow the house meeting ends in everyone laughing. Chaos, but the kind you'll miss when you move out.\"",
    roommateSuperpower: "Names the problem, then turns the house meeting into something everyone laughs about.",
    growthEdge: "Your \"let's just talk about it\" is a gift — but not everyone resets as fast as you do. Give the quieter ones a beat to catch up to your honesty.",
    whatYouNeed: "People who can take a direct conversation without it turning into a cold war, and who don't need the place silent by nine.",
    dangerZone: "Housemates who find spontaneity exhausting or who are deeply uncomfortable with direct conflict.",
    bestMatches: ["CODS", "COHF", "CPDF"],
  },
  COHS: {
    code: "COHS",
    tagline: "Living here feels like a hug.",
    miniBio: "\"There's soup on the stove and a blanket with your name on it. I'm home most evenings, mad at exactly no one, and I will absolutely watch your comfort show with you again. Living here feels like a hug.\"",
    roommateSuperpower: "Makes the apartment feel like home. Cozy, warm, reliable, and genuinely never a harsh word.",
    growthEdge: "You keep the peace by absorbing friction — but what you swallow doesn't disappear, it waits. Naming a small annoyance early is kinder to you than a quiet grudge.",
    whatYouNeed: "People who handle their own conflicts gently and won't mistake your warmth for a doormat.",
    dangerZone: "Confrontational housemates, cold apartments, and rigid rule-enforcement with no warmth.",
    bestMatches: ["COHF", "CODS", "CPHS"],
  },
  COHF: {
    code: "COHF",
    tagline: "Whatever's happening tonight — I'm in.",
    miniBio: "\"The living room is a venue, the speaker is charged, and yes you can bring your friends. I've never held a grudge longer than a song. Whatever's happening tonight — I'm in.\"",
    roommateSuperpower: "The living room is a lifestyle. Brings the energy and rolls with absolutely everything.",
    growthEdge: "You roll with everything — which is great until \"I don't mind\" means your own preferences never make it into the room. It's okay to want something specific sometimes.",
    whatYouNeed: "People who don't need a quiet, rule-bound home and won't read your easygoing nature as not caring.",
    dangerZone: "Housemates who need strict quiet, rigid routines, or zero social spontaneity at home.",
    bestMatches: ["COHS", "CODF", "CPHF"],
  },
};

export function getPersonaMetaV2(code: string): PersonaMetaV2 | undefined {
  return PERSONA_META_V2[code];
}
