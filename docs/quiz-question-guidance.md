# Quiz question guidance

The standing rules for writing and revising the housemate-compatibility quiz
questions (`concepts/risk-assessment/quiz-v2`). Distilled from Alice's direction.
This is the reference; the dated log at the bottom is the trail. When in doubt,
the principles here win.

## 1. Goal

Measure where someone sits on four axes — **cleanliness (Neat/Casual)**,
**social (Private/Open)**, **conflict (Direct/Harmonious)**, **structure
(Structured/Flexible)** — without the answers being gameable or biased by what
sounds like the "good" thing to say.

## 2. The format is the safeguard, not the wording

- **No question may have an obvious "correct" answer.** If one option is plainly
  the socially-better thing to say, the format is wrong — fix the format, not the
  words.
- **Don't rely on "faking is self-defeating."** People still lie, and they
  self-deceive. The design has to work even when they do.
- **Match the format to the axis:**
  - **Neutral Likert (agree / pass)** — only for axes where *both poles are
    equally acceptable to admit*: social, conflict, structure. Keep them; don't
    drop them.
  - **A/B forced choice** — for those same symmetric axes; pick the one more like
    you.
  - **Most/least blocks** — for asymmetric axes, where the trait competes against
    equally-likeable items from other axes.

## 3. Per-axis rules

- **Cleanliness is asymmetric** — "tidy" always sounds better than "messy", so no
  wording rescues a standalone cleanliness statement. Cleanliness is **never** a
  lone Likert item or an A/B pair. It is measured **only inside the most/least
  blocks**, where it appears in every block (balanced Neat/Casual) and has to
  compete for the ranking.
- **Structure = household coordination** — rotas, what's shared vs off-limits, who
  owns which space, splitting costs, whose turn it is. **Not** personal scheduling
  or routine.
- **Social, conflict, structure** are symmetric enough for Likert + pairs.

## 4. Wording rules

- **Simple and short.** Plain statements.
- **No "rather than" / comparison constructions** — they read as too complex.
- **American English** — apartment (not flat), roommate, living room, favorite,
  energizing.
- **Be concrete — anchor each item with a magnitude.** How much notice, how long,
  how often, how much. Vague items everyone agrees with don't discriminate ("you
  need quiet time" is a yes for everyone; "an hour or two before you're up for
  company" separates people).
- **House-agnostic — don't assume infrastructure not everyone has.** Keep the
  *situation* (which is universal to shared living: noise, sleep, temperature,
  guests, sharing space and stuff, chores, money); swap the *narrow noun* for a
  universal one. The quiz must work for a dorm, an apartment, or a house — student
  or working.
  - work calls → daytime noise (covers study or work)
  - thermostat / utilities → temperature / shared costs
  - kitchen → common space
  - fridge shelf → a space that's just mine
  - cooking smells → strong smells
  - Concreteness comes from the situation, not the hardware — "on the same page
    about the temperature" discriminates as well as "thermostat" without assuming
    anyone controls the heat.

## 5. Content rules

- **No repeats.** Every statement is its own concrete situation — across blocks,
  pairs, and Likert. No two lines should restate the same idea.
- **Mine real friction topics** (from the paid deep-dive's dealbreaker list) for
  distinct per-axis scenarios: thermostat/temperature, eating my food, late-night
  noise, a loud hobby, daytime-call/focus noise, borrowing my stuff, overnight
  guests, a partner staying over, quiet hours for sleep schedules, a bathroom
  schedule, a space that's just mine, sharing supplies.
- **Keep each axis balanced** — equal items per pole (e.g. blocks are 4/4 on every
  axis), so an "agree with everything" responder is detectable.

## 6. Scoring (how answers become axis scores)

Every answer becomes points for a pole: a Likert "agree" = +1 to its pole; a pair
pick = +1 to the chosen pole; a block "most" = +1, and a block "least" = +1 to the
*opposite* pole. Each axis score = primary / (primary + secondary) × 100 (50 =
balanced or unanswered). Note: a Likert "pass" adds nothing by design — it means
"I don't endorse this," not "the opposite."

## 7. UI grouping rule

Questions of the same format type must stay together on one page — never mix
types within a page. Axes within each type are shuffled so no fixed ordering
leaks through.

- **Page 1 — Preferences (Likert):** tap "That's me" / "Pass" for each statement.
  Answers are optional — the Continue button is always active. ~10 items.
- **Page 2 — This or that (A/B pairs):** pick the one more like you. All must be
  answered before continuing. ~6 items.
- **Page 3 — Rankings (most/least blocks):** tap once to mark most like you, tap
  another to mark least. All blocks must be completed before continuing. ~4 items.
- **Page 4 — How often (frequency):** pick the closest to how you actually live.
  All must be answered before continuing. ~4 items.

The rationale: seeing all questions of one format at once removes task-switching
overhead, and keeping format groups separate means users adapt their mental model
once per type instead of re-reading instructions on every question. The axis shuffle
within each group prevents a fixed order from being gamed or predicted.

## 8. Log

### 2026-06-12
- **House-agnostic.** The concrete items assumed things not everyone has — a
  kitchen, utilities to pay (irrelevant to a dorm), a job (WFH/work calls). Avoid
  those assumptions while keeping the situation; the quiz should fit any living
  setup.
- Mine the paid deep-dive's friction topics for distinct per-axis scenarios; the
  blocks were still echoing content.
- The this-or-that and most/least items had repeats; make every statement distinct.
- Items were too generic — anchor them with concrete magnitudes (a day's notice?
  an hour? a couple nights a week?). Broad generalizations don't discriminate.
- American English — "apartment", not "flat".
- Questions must be simple and short; "rather than" makes them too complex.
- Keep the Likert items, but only for the symmetric axes; don't drop them wholesale.
  Likert is fine where both options are equally flattering.
- Neutral-worded single statements still had obvious "correct" answers — fix it
  properly (format), don't just keep polishing wording.
- Structure is about roommate coordination (rotas, shared items, who has which
  space), not one's own schedule.
- Some axes work as A/B because both poles are equally attractive; cleanliness is
  the hard one — measure it only inside the blocks.
- Wanted forced-choice where single statements have an obvious answer; asked for
  examples and the reasoning, with before/after.
- Don't trust "faking is self-defeating" — people still lie.
- Asked for the psychology of eliciting honest answers (social-desirability bias,
  forced-choice / ipsative formats).
- Original ask: the quiz questions were too gameable / had an obvious right answer;
  phrase them more neutrally.
