import type {
  AxisDef,
  BlockQuestion,
  FrequencyQuestion,
  NeutralAxisQuestion,
  PairQuestion,
} from "./types";

export const AXES: AxisDef[] = [
  { id: "cleanliness", label: "Cleanliness Standard", poles: [{ letter: "N", word: "Neat" }, { letter: "C", word: "Casual" }] },
  { id: "social", label: "Social Intensity", poles: [{ letter: "P", word: "Private" }, { letter: "O", word: "Open" }] },
  { id: "conflict", label: "Conflict Style", poles: [{ letter: "D", word: "Direct" }, { letter: "H", word: "Harmonious" }] },
  { id: "structure", label: "Structure Preference", poles: [{ letter: "S", word: "Structured" }, { letter: "F", word: "Flexible" }] },
];

// FORMAT 1 — concrete Likert items (with magnitudes, so they discriminate),
// American English, symmetric axes only. Cleanliness excluded by design.
export const NEUTRAL_AXIS_QUESTIONS: NeutralAxisQuestion[] = [
  // Social — Private (P)
  { id: "so-p-01", kind: "axis", axis: "social", pole: "P", text: "After a long day, you need an hour or two of quiet before you're up for company" },
  { id: "so-p-02", kind: "axis", axis: "social", pole: "P", text: "You'd want at least a day's notice before a roommate has people over" },
  { id: "so-p-03", kind: "axis", axis: "social", pole: "P", text: "If the common areas are loud, you'll retreat to your room to unwind" },
  { id: "so-p-04", kind: "axis", axis: "social", pole: "P", text: "A whole weekend at home with no plans sounds restful, not lonely" },
  { id: "so-p-05", kind: "axis", axis: "social", pole: "P", text: "You're happy to pass a roommate with just a quick hello" },
  { id: "so-p-06", kind: "axis", axis: "social", pole: "P", text: "You're happy with roommates who are friendly but give each other space" },
  { id: "so-p-07", kind: "axis", axis: "social", pole: "P", text: "You'd want parties at home kept to a minimum" },
  { id: "so-p-08", kind: "axis", axis: "social", pole: "P", text: "You keep your comings and goings mostly to yourself" },
  // Social — Open (O)
  { id: "so-o-01", kind: "axis", axis: "social", pole: "O", text: "You're glad when a roommate's friends end up staying for dinner" },
  { id: "so-o-02", kind: "axis", axis: "social", pole: "O", text: "An impromptu shared dinner a couple nights a week sounds great" },
  { id: "so-o-03", kind: "axis", axis: "social", pole: "O", text: "You'd happily hang out in the common areas even when they're full of people" },
  { id: "so-o-04", kind: "axis", axis: "social", pole: "O", text: "Having people over two or three nights a week feels energizing" },
  { id: "so-o-05", kind: "axis", axis: "social", pole: "O", text: "You'd happily share meals with a roommate most weeknights" },
  { id: "so-o-06", kind: "axis", axis: "social", pole: "O", text: "You'd love it if your roommates became real friends" },
  { id: "so-o-07", kind: "axis", axis: "social", pole: "O", text: "You're happy to host a party at your place now and then" },
  { id: "so-o-08", kind: "axis", axis: "social", pole: "O", text: "You'd happily join a roommate watching TV in the common area" },
  // Conflict — Direct (D)
  { id: "co-d-01", kind: "axis", axis: "conflict", pole: "D", text: "If something bugs you, you'd bring it up within a day or two" },
  { id: "co-d-02", kind: "axis", axis: "conflict", pole: "D", text: "You'd sort an issue out with a quick face-to-face chat" },
  { id: "co-d-03", kind: "axis", axis: "conflict", pole: "D", text: "You're fine sitting down to agree on house rules in the first week" },
  { id: "co-d-04", kind: "axis", axis: "conflict", pole: "D", text: "If a roommate owed you money, you'd bring it up that day" },
  { id: "co-d-05", kind: "axis", axis: "conflict", pole: "D", text: "After agreeing on something, you'd check a week later that it stuck" },
  { id: "co-d-06", kind: "axis", axis: "conflict", pole: "D", text: "You'd ask a roommate to quiet down if they kept you up" },
  { id: "co-d-07", kind: "axis", axis: "conflict", pole: "D", text: "You'd speak up if a roommate threw a party without asking" },
  { id: "co-d-08", kind: "axis", axis: "conflict", pole: "D", text: "You'd bring up a chore that keeps getting skipped" },
  // Conflict — Harmonious (H)
  { id: "co-h-01", kind: "axis", axis: "conflict", pole: "H", text: "You'd let a small annoyance go three or four times before saying anything" },
  { id: "co-h-02", kind: "axis", axis: "conflict", pole: "H", text: "You'd wait days for the right moment to bring something up" },
  { id: "co-h-03", kind: "axis", axis: "conflict", pole: "H", text: "If a roommate slips up once, you'd assume it won't happen again" },
  { id: "co-h-04", kind: "axis", axis: "conflict", pole: "H", text: "You'd drop a point to keep the peace at home" },
  { id: "co-h-05", kind: "axis", axis: "conflict", pole: "H", text: "You'd quietly change your own routine to avoid a confrontation" },
  { id: "co-h-06", kind: "axis", axis: "conflict", pole: "H", text: "You'd wear earplugs before asking a roommate to be quieter at night" },
  { id: "co-h-07", kind: "axis", axis: "conflict", pole: "H", text: "You'd go along with a roommate's party even if you weren't up for it" },
  { id: "co-h-08", kind: "axis", axis: "conflict", pole: "H", text: "You'd quietly pick up a skipped chore instead of nagging" },
  // Structure — Structured (S)
  { id: "st-s-01", kind: "axis", axis: "structure", pole: "S", text: "You'd want a written chore schedule up in the first week" },
  { id: "st-s-02", kind: "axis", axis: "structure", pole: "S", text: "You'd want it spelled out which food and items are shared or off-limits" },
  { id: "st-s-03", kind: "axis", axis: "structure", pole: "S", text: "You'd want each person assigned specific chores, not just 'pitch in'" },
  { id: "st-s-04", kind: "axis", axis: "structure", pole: "S", text: "You'd want shared costs agreed in writing before move-in" },
  { id: "st-s-05", kind: "axis", axis: "structure", pole: "S", text: "Not knowing whose turn it is to buy toilet paper would bug you" },
  { id: "st-s-06", kind: "axis", axis: "structure", pole: "S", text: "You'd want parties planned ahead, not sprung on you" },
  { id: "st-s-07", kind: "axis", axis: "structure", pole: "S", text: "You'd want quiet hours set on weeknights" },
  { id: "st-s-08", kind: "axis", axis: "structure", pole: "S", text: "You'd want guests cleared with each other first" },
  // Structure — Flexible (F)
  { id: "st-f-01", kind: "axis", axis: "structure", pole: "F", text: "You'd clean when it looks like it needs it, on no set schedule" },
  { id: "st-f-02", kind: "axis", axis: "structure", pole: "F", text: "You're fine figuring out house rules as situations come up" },
  { id: "st-f-03", kind: "axis", axis: "structure", pole: "F", text: "You're easy about sharing food and stuff without keeping track" },
  { id: "st-f-04", kind: "axis", axis: "structure", pole: "F", text: "You're happy keeping chores and money casual and flexible" },
  { id: "st-f-05", kind: "axis", axis: "structure", pole: "F", text: "You'd sort who-does-what with a quick text, not a system" },
  { id: "st-f-06", kind: "axis", axis: "structure", pole: "F", text: "You'd keep parties and late nights spontaneous" },
  { id: "st-f-07", kind: "axis", axis: "structure", pole: "F", text: "You'd handle noise and sleep differences case by case" },
  { id: "st-f-08", kind: "axis", axis: "structure", pole: "F", text: "You'd let guests come and go without checking in" },
];

// FORMAT 2 — A/B pairs (symmetric axes only), concrete + American English.
export const PAIR_QUESTIONS: PairQuestion[] = [
  { id: "pr-so-01", kind: "pair", options: [
    { id: "pr-so-01a", axis: "social", pole: "P", text: "I unwind best on my own" },
    { id: "pr-so-01b", axis: "social", pole: "O", text: "I unwind best around people" },
  ] },
  { id: "pr-so-02", kind: "pair", options: [
    { id: "pr-so-02a", axis: "social", pole: "P", text: "My ideal Friday is a quiet night in" },
    { id: "pr-so-02b", axis: "social", pole: "O", text: "My ideal Friday is the place full of friends" },
  ] },
  { id: "pr-so-03", kind: "pair", options: [
    { id: "pr-so-03a", axis: "social", pole: "P", text: "I keep to myself on weeknights" },
    { id: "pr-so-03b", axis: "social", pole: "O", text: "I'm up for company on weeknights" },
  ] },
  { id: "pr-st-01", kind: "pair", options: [
    { id: "pr-st-01a", axis: "structure", pole: "S", text: "I want a written cleaning rota" },
    { id: "pr-st-01b", axis: "structure", pole: "F", text: "We can clean when it's needed" },
  ] },
  { id: "pr-st-02", kind: "pair", options: [
    { id: "pr-st-02a", axis: "structure", pole: "S", text: "I want a system for buying shared supplies" },
    { id: "pr-st-02b", axis: "structure", pole: "F", text: "We can grab supplies whenever and split later" },
  ] },
  { id: "pr-st-03", kind: "pair", options: [
    { id: "pr-st-03a", axis: "structure", pole: "S", text: "I want chores assigned to each person" },
    { id: "pr-st-03b", axis: "structure", pole: "F", text: "We can both just pitch in" },
  ] },
  { id: "pr-co-01", kind: "pair", options: [
    { id: "pr-co-01a", axis: "conflict", pole: "D", text: "I'd address tension right away" },
    { id: "pr-co-01b", axis: "conflict", pole: "H", text: "I'd give tension time to pass" },
  ] },
  { id: "pr-co-02", kind: "pair", options: [
    { id: "pr-co-02a", axis: "conflict", pole: "D", text: "I'd speak up if a guest overstayed" },
    { id: "pr-co-02b", axis: "conflict", pole: "H", text: "I'd put up with an overstaying guest" },
  ] },
  { id: "pr-co-03", kind: "pair", options: [
    { id: "pr-co-03a", axis: "conflict", pole: "D", text: "I'd hash it out instead of stewing" },
    { id: "pr-co-03b", axis: "conflict", pole: "H", text: "I'd let it go instead of bringing it up" },
  ] },
  { id: "pr-so-04", kind: "pair", options: [
    { id: "pr-so-04a", axis: "social", pole: "O", text: "I'd love to be close friends with my roommates" },
    { id: "pr-so-04b", axis: "social", pole: "P", text: "I'd be happy with friendly but independent roommates" },
  ] },
  { id: "pr-so-05", kind: "pair", options: [
    { id: "pr-so-05a", axis: "social", pole: "O", text: "I'm up for parties at our place" },
    { id: "pr-so-05b", axis: "social", pole: "P", text: "I'd keep our place party-free" },
  ] },
  { id: "pr-so-06", kind: "pair", options: [
    { id: "pr-so-06a", axis: "social", pole: "P", text: "I keep my room private" },
    { id: "pr-so-06b", axis: "social", pole: "O", text: "I keep my door open to roommates" },
  ] },
  { id: "pr-st-04", kind: "pair", options: [
    { id: "pr-st-04a", axis: "structure", pole: "S", text: "I'd want quiet hours we both agree on" },
    { id: "pr-st-04b", axis: "structure", pole: "F", text: "We can just be considerate about noise" },
  ] },
  { id: "pr-st-05", kind: "pair", options: [
    { id: "pr-st-05a", axis: "structure", pole: "S", text: "I'd want a shared calendar for chores and plans" },
    { id: "pr-st-05b", axis: "structure", pole: "F", text: "We can keep track of stuff in our heads" },
  ] },
  { id: "pr-co-04", kind: "pair", options: [
    { id: "pr-co-04a", axis: "conflict", pole: "D", text: "I'd speak up if a party got out of hand" },
    { id: "pr-co-04b", axis: "conflict", pole: "H", text: "I'd ride out a wild party night" },
  ] },
  { id: "pr-co-05", kind: "pair", options: [
    { id: "pr-co-05a", axis: "conflict", pole: "D", text: "I'd tell a roommate if their things crept into my space" },
    { id: "pr-co-05b", axis: "conflict", pole: "H", text: "I'd just move a roommate's things aside without a word" },
  ] },
];

// FORMAT 3 — most/least blocks. The ONLY place cleanliness is scored; it appears
// in every block (4 Neat / 4 Casual). Kept short for ranking; American English.
export const BLOCK_QUESTIONS: BlockQuestion[] = [
  { id: "bl-01", kind: "block", options: [
    { id: "bl-01-cl", axis: "cleanliness", pole: "N", text: "I love walking into a clean place" },
    { id: "bl-01-so", axis: "social", pole: "O", text: "I'm glad when a roommate's friends stay for dinner" },
    { id: "bl-01-co", axis: "conflict", pole: "D", text: "I'd ask a roommate to use headphones for late-night gaming" },
    { id: "bl-01-st", axis: "structure", pole: "F", text: "I keep house stuff casual" },
  ] },
  { id: "bl-02", kind: "block", options: [
    { id: "bl-02-cl", axis: "cleanliness", pole: "C", text: "A little mess doesn't bother me" },
    { id: "bl-02-so", axis: "social", pole: "P", text: "I recharge with quiet nights in" },
    { id: "bl-02-co", axis: "conflict", pole: "H", text: "I'd put up with a roommate's noisy hobby" },
    { id: "bl-02-st", axis: "structure", pole: "S", text: "I want us on the same page about the temperature" },
  ] },
  { id: "bl-03", kind: "block", options: [
    { id: "bl-03-cl", axis: "cleanliness", pole: "N", text: "I do the dishes right after eating" },
    { id: "bl-03-so", axis: "social", pole: "P", text: "I'd want overnight guests kept rare" },
    { id: "bl-03-co", axis: "conflict", pole: "D", text: "I'd say something if a roommate ate my food" },
    { id: "bl-03-st", axis: "structure", pole: "S", text: "I want quiet hours set for different sleep schedules" },
  ] },
  { id: "bl-04", kind: "block", options: [
    { id: "bl-04-cl", axis: "cleanliness", pole: "C", text: "Strong smells don't bother me" },
    { id: "bl-04-so", axis: "social", pole: "O", text: "I'm fine with a roommate's partner staying over often" },
    { id: "bl-04-co", axis: "conflict", pole: "H", text: "I'd put up with a roommate's loud music" },
    { id: "bl-04-st", axis: "structure", pole: "F", text: "I'm flexible about who does what" },
  ] },
  { id: "bl-05", kind: "block", options: [
    { id: "bl-05-cl", axis: "cleanliness", pole: "N", text: "I clean the bathroom on a regular schedule" },
    { id: "bl-05-so", axis: "social", pole: "O", text: "A lively home energizes me" },
    { id: "bl-05-co", axis: "conflict", pole: "H", text: "I'd let it slide if a roommate borrowed my stuff" },
    { id: "bl-05-st", axis: "structure", pole: "S", text: "I want a morning bathroom schedule" },
  ] },
  { id: "bl-06", kind: "block", options: [
    { id: "bl-06-cl", axis: "cleanliness", pole: "C", text: "A lived-in place feels cozy to me" },
    { id: "bl-06-so", axis: "social", pole: "P", text: "I treasure a calm home" },
    { id: "bl-06-co", axis: "conflict", pole: "D", text: "I'd speak up if the place was too cold for me" },
    { id: "bl-06-st", axis: "structure", pole: "F", text: "We can just deal with the temperature as it comes" },
  ] },
  { id: "bl-07", kind: "block", options: [
    { id: "bl-07-cl", axis: "cleanliness", pole: "N", text: "I keep my room tidy and bed made" },
    { id: "bl-07-so", axis: "social", pole: "O", text: "I'd host friends often" },
    { id: "bl-07-co", axis: "conflict", pole: "H", text: "I'd put up with the occasional late-night noise" },
    { id: "bl-07-st", axis: "structure", pole: "S", text: "I want a shelf or space that's just mine" },
  ] },
  { id: "bl-08", kind: "block", options: [
    { id: "bl-08-cl", axis: "cleanliness", pole: "C", text: "I clean up when I get around to it" },
    { id: "bl-08-so", axis: "social", pole: "P", text: "I need solo downtime" },
    { id: "bl-08-co", axis: "conflict", pole: "D", text: "I'd flag it if daytime noise made it hard to focus" },
    { id: "bl-08-st", axis: "structure", pole: "F", text: "We can share the common space freely" },
  ] },
  { id: "bl-09", kind: "block", options: [
    { id: "bl-09-cl", axis: "cleanliness", pole: "N", text: "I take the trash out before it overflows" },
    { id: "bl-09-so", axis: "social", pole: "P", text: "I'd want roommates to knock before coming in" },
    { id: "bl-09-co", axis: "conflict", pole: "D", text: "I'd point out if I was always the one cleaning up" },
    { id: "bl-09-st", axis: "structure", pole: "S", text: "I'd want a clear way to track who paid for what" },
  ] },
  { id: "bl-10", kind: "block", options: [
    { id: "bl-10-cl", axis: "cleanliness", pole: "C", text: "I'm fine with shoes on indoors" },
    { id: "bl-10-so", axis: "social", pole: "O", text: "I'd happily join roommates hanging out" },
    { id: "bl-10-co", axis: "conflict", pole: "H", text: "I'd do extra chores myself to avoid friction" },
    { id: "bl-10-st", axis: "structure", pole: "F", text: "I'd track shared costs loosely and settle up later" },
  ] },
  { id: "bl-11", kind: "block", options: [
    { id: "bl-11-cl", axis: "cleanliness", pole: "N", text: "I rinse my dishes before they pile up" },
    { id: "bl-11-so", axis: "social", pole: "O", text: "I'd want us to do things together, not just share a space" },
    { id: "bl-11-co", axis: "conflict", pole: "D", text: "I'd speak up if a party ran really late" },
    { id: "bl-11-st", axis: "structure", pole: "S", text: "I'd want a heads-up before someone throws a party" },
  ] },
  { id: "bl-12", kind: "block", options: [
    { id: "bl-12-cl", axis: "cleanliness", pole: "C", text: "I'm relaxed if the place looks lived-in" },
    { id: "bl-12-so", axis: "social", pole: "P", text: "I'm fine if we mostly do our own thing" },
    { id: "bl-12-co", axis: "conflict", pole: "H", text: "I'd let a loud night go without comment" },
    { id: "bl-12-st", axis: "structure", pole: "F", text: "We can sort house stuff out as we go" },
  ] },
];

// FORMAT 4 — frequency / count items. Ask "how often do you actually X?" rather
// than "would you X?" Concrete counts are harder to inflate than self-descriptions,
// making this the strongest format for asymmetric axes. Primary use: cleanliness
// (which can't appear in Likert or pairs). Options are ordered from one pole to the
// other; middle options carry pole: null (no score). See docs/question-neutrality-research.md.
export const FREQUENCY_QUESTIONS: FrequencyQuestion[] = [
  // Cleanliness — frequency bypasses the desirability tilt on this axis.
  { id: "fq-cl-01", kind: "frequency",
    text: "How long do dishes typically sit in the sink at your place?",
    options: [
      { id: "fq-cl-01a", label: "Same day — I wash them before the end of the day", axis: "cleanliness", pole: "N" },
      { id: "fq-cl-01b", label: "A day or two",                                      axis: "cleanliness", pole: null },
      { id: "fq-cl-01c", label: "A few days",                                         axis: "cleanliness", pole: null },
      { id: "fq-cl-01d", label: "Whenever I get to them — sometimes a week or more",  axis: "cleanliness", pole: "C" },
    ],
  },
  { id: "fq-cl-02", kind: "frequency",
    text: "How soon after cooking do you usually clean up?",
    options: [
      { id: "fq-cl-02a", label: "Right away, before leaving the kitchen",  axis: "cleanliness", pole: "N" },
      { id: "fq-cl-02b", label: "Later that day",                           axis: "cleanliness", pole: null },
      { id: "fq-cl-02c", label: "Next day or whenever I get to it",         axis: "cleanliness", pole: "C" },
    ],
  },
  { id: "fq-cl-03", kind: "frequency",
    text: "How often does clutter build up in the common areas?",
    options: [
      { id: "fq-cl-03a", label: "Rarely — I tidy as I go",             axis: "cleanliness", pole: "N" },
      { id: "fq-cl-03b", label: "Once a week or so",                    axis: "cleanliness", pole: null },
      { id: "fq-cl-03c", label: "A few times a week",                   axis: "cleanliness", pole: null },
      { id: "fq-cl-03d", label: "There's usually something out",        axis: "cleanliness", pole: "C" },
    ],
  },
  { id: "fq-cl-04", kind: "frequency",
    text: "How far would a mess have to go before you'd stop to clean it up?",
    options: [
      { id: "fq-cl-04a", label: "Any visible mess — I'd deal with it right away",  axis: "cleanliness", pole: "N" },
      { id: "fq-cl-04b", label: "Noticeable clutter",                               axis: "cleanliness", pole: null },
      { id: "fq-cl-04c", label: "It has to be pretty bad before it bothers me",     axis: "cleanliness", pole: "C" },
    ],
  },
  { id: "fq-cl-05", kind: "frequency",
    text: "How often do you clean shared spaces on your own, before anyone asks?",
    options: [
      { id: "fq-cl-05a", label: "On a regular schedule, whether it looks dirty or not",  axis: "cleanliness", pole: "N" },
      { id: "fq-cl-05b", label: "When it starts to look dirty",                           axis: "cleanliness", pole: null },
      { id: "fq-cl-05c", label: "When a roommate brings it up",                           axis: "cleanliness", pole: "C" },
    ],
  },
  { id: "fq-cl-06", kind: "frequency",
    text: "After a few friends hang out at your place, how much cleaning is left?",
    options: [
      { id: "fq-cl-06a", label: "Nothing — I clean as we go",      axis: "cleanliness", pole: "N" },
      { id: "fq-cl-06b", label: "A quick tidy, about 10 minutes",   axis: "cleanliness", pole: null },
      { id: "fq-cl-06c", label: "An hour or more of work",           axis: "cleanliness", pole: "C" },
    ],
  },
  // Social — frequency pairs naturally with this axis.
  { id: "fq-so-01", kind: "frequency",
    text: "How many nights a week do you typically have someone over?",
    options: [
      { id: "fq-so-01a", label: "Rarely — less than once a week",  axis: "social", pole: "P" },
      { id: "fq-so-01b", label: "Once or twice a week",             axis: "social", pole: null },
      { id: "fq-so-01c", label: "Three or four nights",             axis: "social", pole: null },
      { id: "fq-so-01d", label: "Most nights",                      axis: "social", pole: "O" },
    ],
  },
  { id: "fq-so-02", kind: "frequency",
    text: "When you have people over, how late do they usually stay?",
    options: [
      { id: "fq-so-02a", label: "An hour or two — I like early evenings",   axis: "social", pole: "P" },
      { id: "fq-so-02b", label: "Until midnight or so",                      axis: "social", pole: null },
      { id: "fq-so-02c", label: "They often end up spending the night",       axis: "social", pole: "O" },
    ],
  },
];
