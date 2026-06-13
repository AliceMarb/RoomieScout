/**
 * Free personality quiz: 12 structured questions mapping to the 4 HMTI v2 axes.
 * Scoring is deterministic — no LLM required.
 *
 * Axes: Cleanliness (N/C), Social intensity (P/O), Conflict style (D/H), Structure preference (S/F)
 */

export type QuizOption = {
  label: string;
  score: number; // negative = left pole, positive = right pole
};

export type QuizQuestion = {
  id: string;
  axis: 0 | 1 | 2 | 3;
  text: string;
  options: [QuizOption, QuizOption, QuizOption, QuizOption];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ── Axis 0: Cleanliness ──────────────────────────────────────────────────────
  {
    id: "clean_dishes", axis: 0,
    text: "After cooking dinner, the dishes go…",
    options: [
      { label: "Washed before I go to bed — always", score: -2 },
      { label: "Done sometime that evening", score: -1 },
      { label: "I'll get to them tomorrow", score: 1 },
      { label: "When the pile gets big enough to deal with", score: 2 },
    ],
  },
  {
    id: "clean_common", axis: 0,
    text: "Common areas in a shared home should be…",
    options: [
      { label: "Always clean — everyone tidies before leaving", score: -2 },
      { label: "Generally clean, small messes are fine", score: -1 },
      { label: "Lived-in is okay, we clean for guests", score: 1 },
      { label: "Someone's always making a mess — fine by me", score: 2 },
    ],
  },
  {
    id: "clean_vacuum", axis: 0,
    text: "How often should shared floors be vacuumed or swept?",
    options: [
      { label: "A few times a week", score: -2 },
      { label: "Once a week", score: -1 },
      { label: "Every couple of weeks", score: 1 },
      { label: "When it visibly needs it", score: 2 },
    ],
  },

  // ── Axis 1: Social Intensity ─────────────────────────────────────────────────
  {
    id: "social_homecoming", axis: 1,
    text: "After a long day, you most want to…",
    options: [
      { label: "Decompress alone — quiet time in my room", score: -2 },
      { label: "A bit of both — some downtime then maybe a chat", score: -1 },
      { label: "Hang out in common areas with whoever's around", score: 1 },
      { label: "People! Energy! Tell me about your day.", score: 2 },
    ],
  },
  {
    id: "social_guests", axis: 1,
    text: "Guests at the apartment…",
    options: [
      { label: "Rare — I prefer meeting people at neutral spots", score: -2 },
      { label: "Occasionally, with some notice", score: -1 },
      { label: "Regularly — my home is a social space", score: 1 },
      { label: "The more the merrier, any time", score: 2 },
    ],
  },
  {
    id: "social_home_as", axis: 1,
    text: "Home is mainly…",
    options: [
      { label: "My retreat — a place to recharge away from people", score: -2 },
      { label: "Mostly private, but I like some social energy", score: -1 },
      { label: "A shared space I enjoy spending time in together", score: 1 },
      { label: "A hub — I love when it feels lively and full", score: 2 },
    ],
  },

  // ── Axis 2: Conflict Style ────────────────────────────────────────────────────
  {
    id: "conflict_raise", axis: 2,
    text: "If something a housemate did bothered you, you'd…",
    options: [
      { label: "Raise it within a day — said once, fixed, done", score: -2 },
      { label: "Bring it up when it happens a second time", score: -1 },
      { label: "Mention it casually when the moment feels right", score: 1 },
      { label: "Absorb it and hope it resolves on its own", score: 2 },
    ],
  },
  {
    id: "conflict_approach", axis: 2,
    text: "When there's tension in the house, your instinct is to…",
    options: [
      { label: "Name it directly so it doesn't fester", score: -2 },
      { label: "Give it a day then bring it up calmly", score: -1 },
      { label: "Keep the mood light and hope it passes", score: 1 },
      { label: "Stay out of it and let people sort themselves out", score: 2 },
    ],
  },
  {
    id: "conflict_receive", axis: 2,
    text: "If you've done the annoying thing, you'd rather your housemate…",
    options: [
      { label: "Tell me directly — I'd rather know immediately", score: -2 },
      { label: "Bring it up when they're ready, but soon", score: -1 },
      { label: "Drop a hint or mention it lightly", score: 1 },
      { label: "Let it go if they can — I find conflict stressful", score: 2 },
    ],
  },

  // ── Axis 3: Structure Preference ─────────────────────────────────────────────
  {
    id: "structure_chores", axis: 3,
    text: "For chores in a shared home, you'd prefer…",
    options: [
      { label: "A clear rota — everyone knows their job and when", score: -2 },
      { label: "Some basic agreements about who does what", score: -1 },
      { label: "Whoever notices does it — keep it informal", score: 1 },
      { label: "Just go with it — I don't need rules for that", score: 2 },
    ],
  },
  {
    id: "structure_movein", axis: 3,
    text: "Before moving in with someone, you'd want to discuss…",
    options: [
      { label: "Everything — guests, noise, cleaning, money, all of it", score: -2 },
      { label: "The main things — a few ground rules to avoid issues", score: -1 },
      { label: "Just the basics and figure the rest out as we go", score: 1 },
      { label: "Nothing specific — I'd rather not over-plan it", score: 2 },
    ],
  },
  {
    id: "structure_routines", axis: 3,
    text: "When it comes to shared routines (cleaning days, grocery runs, etc.)…",
    options: [
      { label: "I like them scheduled — it means nobody has to ask", score: -2 },
      { label: "A loose plan is helpful, even if it shifts", score: -1 },
      { label: "I'd rather keep things spontaneous and see what's needed", score: 1 },
      { label: "Routines stress me out — let's just deal with things as they come", score: 2 },
    ],
  },
];

export type QuizAnswers = Record<string, number>;

/**
 * Score a completed quiz into 4 axis inputs for buildPersonaFromAxes.
 * Each axis has 3 questions; score range: -6 (strong left) to +6 (strong right).
 */
export function scoreQuiz(
  answers: QuizAnswers,
): Array<{ chosen: "left" | "right"; strength: number }> {
  const axisSums = [0, 0, 0, 0];
  for (const q of QUIZ_QUESTIONS) {
    axisSums[q.axis] += answers[q.id] ?? 0;
  }
  return axisSums.map((sum) => ({
    chosen: (sum <= 0 ? "left" : "right") as "left" | "right",
    strength: Math.round(55 + (Math.min(Math.abs(sum), 6) / 6) * 40),
  }));
}
