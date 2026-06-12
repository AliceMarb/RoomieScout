/**
 * Rich card copy for all 16 HMTI v2 types: mini bio, tagline, superpower,
 * danger zone, best matches, household energy.
 *
 * The visual data (palette, animal, scene) lives in data.ts alongside the
 * full PersonaMeta catalogue. This file is card-copy only.
 */

export type PersonaMetaV2 = {
  code: string;
  miniBio: string;
  tagline: string;
  roommateSuperpower: string;
  dangerZone: string;
  bestMatches: string[];
  householdEnergy: string;
};

export const PERSONA_META_V2: Record<string, PersonaMetaV2> = {
  NPDS: {
    code: "NPDS",
    miniBio: "\"Yes, my spice rack is alphabetized, and no, I'm not sorry. If something's bugging me you'll hear it within a day — said once, fixed, done. I'll give you a spotless kitchen and total respect for your closed door; I just ask for the same.\"",
    tagline: "Quiet hours are my love language.",
    roommateSuperpower: "Spotless shared spaces, respected closed doors, zero passive aggression — issues raised once, kindly, and solved.",
    dangerZone: "Passive-aggressive notes, shared spaces left in chaos, housemates who don't follow through.",
    bestMatches: ["NPDF", "NPHS", "NODS"],
    householdEnergy: "Spice rack alphabetized. Counter spotless. Issue raised once, kindly, done.",
  },
  NPDF: {
    code: "NPDF",
    miniBio: "\"You won't find a chore chart here because you won't need one — the dishes are already done. My hours are weird, my space is clean, and if there's a problem I'll just tell you. Low drama, high competence.\"",
    tagline: "My schedule is chaos, but my space is not.",
    roommateSuperpower: "Handles things without being asked. If something's off, says so plainly and moves on.",
    dangerZone: "Housemates who mistake directness for coldness or need constant social reassurance.",
    bestMatches: ["NPDS", "NPHF", "NODF"],
    householdEnergy: "Dishes already done. Hours unknowable. Zero drama, high competence.",
  },
  NPHS: {
    code: "NPHS",
    miniBio: "\"I own exactly enough things and all of them are clean. I love a good rota because it means we never have to have An Awkward Talk. You'll forget I'm home, and your kitchen will sparkle anyway.\"",
    tagline: "Good systems mean no awkward conversations.",
    roommateSuperpower: "Creates a calm, orderly home without any drama. Good systems replace the need for uncomfortable chats.",
    dangerZone: "Surprise changes to the routine, messy common spaces, and housemates who expect regular emotional processing.",
    bestMatches: ["NPHF", "NPDS", "NOHS"],
    householdEnergy: "Kitchen sparkling. Door closed. Rota on the wall. No conversation needed.",
  },
  NPHF: {
    code: "NPHF",
    miniBio: "\"The sink is always empty and you'll never figure out when I did it. I don't need rules, meetings, or bonding nights — just a quiet hello in the hallway. The cleanest roommate you'll never see.\"",
    tagline: "You'll know I live here because everything is clean.",
    roommateSuperpower: "The most frictionless roommate in the system — clean, quiet, completely drama-free.",
    dangerZone: "Housemates who need a lot of social energy, expect bonding nights, or interpret silence as coldness.",
    bestMatches: ["NPHS", "NPDF", "NOHS"],
    householdEnergy: "Sink always empty. Timing unknown. Quiet hello in the hallway.",
  },
  NODS: {
    code: "NODS",
    miniBio: "\"Yes I made the group chat, yes there's a chore chart, yes there are snacks. I'll say the hard thing so nobody has to stew, then we're back to movie night. This house runs, and it runs happy.\"",
    tagline: "I run this house with snacks and systems.",
    roommateSuperpower: "Turns the apartment into a clean, connected household with warmth and actual systems.",
    dangerZone: "Housemates who ignore the chore chart, avoid the group chat, or treat structure as controlling.",
    bestMatches: ["NODF", "NOHS", "NPDS"],
    householdEnergy: "Chore chart on the fridge. Group chat active. Movie night confirmed.",
  },
  NODF: {
    code: "NODF",
    miniBio: "\"Dinner party in two hours, decided ten minutes ago — and the counters will still be clean before bed. I'll tell you to your face if something's off, then hug it out. Life's too short for a quiet apartment and a passive-aggressive note.\"",
    tagline: "Direct, clean, and always up for a plan.",
    roommateSuperpower: "Spontaneous plans and surprisingly clean counters. Names issues warmly and directly, then moves on.",
    dangerZone: "Housemates who take directness personally or need strict quiet and predictability at home.",
    bestMatches: ["NODS", "NOHF", "NPDF"],
    householdEnergy: "Dinner party started 10 minutes ago. Counters still clean. Front door open.",
  },
  NOHS: {
    code: "NOHS",
    miniBio: "\"I'll remember your exam, your interview, and how you take your tea. The kitchen stays clean, the vibe stays soft, and the drama stays at zero. People say living with me feels like the apartment got warmer.\"",
    tagline: "The apartment is warmer because I'm in it.",
    roommateSuperpower: "The home genuinely feels nicer with them in it. Warm, tidy, reliable, and zero drama.",
    dangerZone: "Direct confrontation, unpredictable messes, and housemates who bring chaotic energy home.",
    bestMatches: ["NOHF", "NODS", "NPHS"],
    householdEnergy: "Tea on. Your exam remembered. Vibe: soft and safe.",
  },
  NOHF: {
    code: "NOHF",
    miniBio: "\"Plans? Sure. No plans? Also great. I keep things clean without making it a thing, and I genuinely cannot remember our last argument because there wasn't one. Good mood included with the lease.\"",
    tagline: "Good mood included with the lease.",
    roommateSuperpower: "Easygoing warmth with clean habits. Up for anything, allergic to drama, somehow always tidy.",
    dangerZone: "Heavy ongoing drama, rigid routines enforced on others, housemates who hold grudges.",
    bestMatches: ["NOHS", "NODF", "NPHF"],
    householdEnergy: "Plans: sure. No plans: also great. Apartment somehow always tidy.",
  },
  CPDS: {
    code: "CPDS",
    miniBio: "\"I won't count your dishes and I won't touch your stuff — and I expect the same energy back. I say what I mean the first time, so you'll never have to guess where you stand. Steady as they come.\"",
    tagline: "Clear expectations. Zero surprises.",
    roommateSuperpower: "Crystal clear about space and expectations. You always know exactly where you stand.",
    dangerZone: "Housemates who leave shared spaces in chaos, ignore agreements, or don't respect clear boundaries.",
    bestMatches: ["CPDF", "CPHS", "CODS"],
    householdEnergy: "Steady presence. Clear expectations. Zero performance required.",
  },
  CPDF: {
    code: "CPDF",
    miniBio: "\"My schedule makes no sense and neither does my sleep, but my rent clears and my problems are my own. I won't bother you over small stuff — if I'm knocking on your door, it actually matters. Refreshingly blunt, impressively low-maintenance.\"",
    tagline: "Refreshingly blunt. Impressively low-maintenance.",
    roommateSuperpower: "Refreshingly blunt and completely self-sufficient. Won't bother you unless it actually matters.",
    dangerZone: "Needy roommates, forced bonding, housemates who over-share or need constant availability.",
    bestMatches: ["CPDS", "CPHF", "CODF"],
    householdEnergy: "Schedule: unknowable. Rent: cleared. Problems: handled directly.",
  },
  CPHS: {
    code: "CPHS",
    miniBio: "\"Same routine every day, zero opinions about yours. Nothing rattles me — not your blender at 7am, not your friends on the couch. I'm not avoiding you, I'm just extremely at peace.\"",
    tagline: "Peak chill. Zero opinions about your life.",
    roommateSuperpower: "Peak chill with a steady rhythm. Nothing rattles them. Completely respects your space and expects the same.",
    dangerZone: "Unavoidable conflict situations, forced social time, environments where things escalate.",
    bestMatches: ["CPHF", "CPDS", "COHS"],
    householdEnergy: "Same routine. Zero opinions about yours. Extremely at peace.",
  },
  CPHF: {
    code: "CPHF",
    miniBio: "\"Last confirmed sighting: the fridge, 2:14am, brief nod exchanged. Rent arrives on time from somewhere. I want nothing, I bother no one, I may or may not be real.\"",
    tagline: "May or may not be real.",
    roommateSuperpower: "Pays rent on time, bothers no one, asks nothing. The ultimate low-friction housemate.",
    dangerZone: "Housemates who need connection, check-ins, or want to know where you are at all times.",
    bestMatches: ["CPHS", "CPDF", "COHF"],
    householdEnergy: "Fridge at 2am. Brief nod. Rent from somewhere. May or may not be real.",
  },
  CODS: {
    code: "CODS",
    miniBio: "\"Sunday dinner is at mine, the bills are split fair, and nobody eats alone unless they want to. I'll bring up the hard stuff at the table so it never festers in the group chat. A little mess is fine — people matter more than counters.\"",
    tagline: "People matter more than counters.",
    roommateSuperpower: "Holds the household together — communal dinners, fair splits, real talk before things fester.",
    dangerZone: "Housemates who shut down, avoid the group dynamic, or let issues quietly build.",
    bestMatches: ["CODF", "COHS", "CPDS"],
    householdEnergy: "Sunday dinner. Bills split fair. Nobody eats alone unless they want to.",
  },
  CODF: {
    code: "CODF",
    miniBio: "\"I'm why Tuesday became taco night and why the hallway has fairy lights now. If there's an issue I'll name it out loud — and somehow the house meeting ends in everyone laughing. Chaos, but the kind you'll miss when you move out.\"",
    tagline: "The chaos you'll miss when you move out.",
    roommateSuperpower: "Names the problem, then turns the house meeting into something everyone laughs about.",
    dangerZone: "Housemates who find spontaneity exhausting or who are deeply uncomfortable with direct conflict.",
    bestMatches: ["CODS", "COHF", "CPDF"],
    householdEnergy: "Tuesday became taco night. Hallway has fairy lights. House meeting: actually fun.",
  },
  COHS: {
    code: "COHS",
    miniBio: "\"There's soup on the stove and a blanket with your name on it. I'm home most evenings, mad at exactly no one, and I will absolutely watch your comfort show with you again. Living here feels like a hug.\"",
    tagline: "Living here feels like a hug.",
    roommateSuperpower: "Makes the apartment feel like home. Cozy, warm, reliable, and genuinely never a harsh word.",
    dangerZone: "Confrontational housemates, cold apartments, and rigid rule-enforcement with no warmth.",
    bestMatches: ["COHF", "CODS", "CPHS"],
    householdEnergy: "Soup on the stove. Blanket with your name on it. Drama: zero.",
  },
  COHF: {
    code: "COHF",
    miniBio: "\"The living room is a venue, the speaker is charged, and yes you can bring your friends. I've never held a grudge longer than a song. Whatever's happening tonight — I'm in.\"",
    tagline: "Whatever's happening tonight — I'm in.",
    roommateSuperpower: "The living room is a lifestyle. Brings the energy and rolls with absolutely everything.",
    dangerZone: "Housemates who need strict quiet, rigid routines, or zero social spontaneity at home.",
    bestMatches: ["COHS", "CODF", "CPHF"],
    householdEnergy: "Speaker charged. Friends welcome. Never held a grudge longer than a song.",
  },
};

export function getPersonaMetaV2(code: string): PersonaMetaV2 | undefined {
  return PERSONA_META_V2[code.toUpperCase()];
}
