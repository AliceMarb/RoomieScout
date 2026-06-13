# Quiz question guidance — running log

A living record of Alice's direction on the housemate-compatibility quiz questions
(`concepts/risk-assessment/quiz-v2`). Newest guidance at the top of the log. The
principles section is the current, reconciled rule set; the log is the dated trail.

## Current principles

### Format (the format is the safeguard, not the wording)
- No question may have an obvious "correct" answer. If one option is plainly the
  socially-better thing to say, the format is wrong — fix the format, not the words.
- "Faking is self-defeating" is NOT a safeguard. People still lie, and they
  self-deceive. Do not rely on honesty incentives.
- **Likert (agree/disagree single statements)** are allowed ONLY for axes where
  both poles are equally acceptable to admit. Keep them — don't drop them — but
  only for those symmetric axes.
- **A/B forced-choice pairs** for axes whose two poles are equally attractive.
- **Most/least blocks** for asymmetric axes, where the trait competes against
  equally-likeable items from other axes.

### Wording
- Keep questions simple and short.
- No "rather than" / comparison constructions — they read as too complex.
- Plain, natural statements.
- **American English** — "apartment" not "flat", plus roommate, living room, favorite, energizing.
- **Be concrete.** Anchor each item with a magnitude — how much notice, how long, how
  often, how much. Vague items everyone agrees with don't discriminate ("you need quiet
  time" is a yes for everyone; "an hour or two before you're up for company" separates people).

### Per-axis rules
- **Cleanliness is asymmetric** — "tidy" always sounds better than "messy", so no
  wording rescues a standalone cleanliness statement. Cleanliness is NEVER a lone
  Likert item or an A/B pair; it is measured ONLY inside the most/least blocks.
- **Structure = household coordination** (rotas, what's shared vs off-limits, who
  owns which space, costs agreed in writing) — NOT personal scheduling or routine.
- **Social, conflict, structure** are symmetric enough for Likert + pairs.

### Process / repo
- Build the new quiz as isolated, self-contained files so it does not conflict
  with the in-flight free-vs-paid worktree refactor.
- Branch off main; keep the change conflict-minimal so it merges cleanly later.

## Log

### 2026-06-12
- Mine the paid deep-dive's friction topics (thermostat, ate my food, late-night gaming,
  loud hobby, WFH calls, borrowed stuff, overnight guests, partner over, cooking smells,
  quiet hours, bathroom schedule, labeled fridge shelf) for distinct per-axis scenarios.
  Blocks must not reuse content — each statement is its own concrete situation.
- Items are too generic — need concrete detail/magnitudes (notice of a week? a day?
  5 minutes? how long to recharge? how many nights a week?). Broad generalizations
  don't work because almost everyone agrees with them.
- Use American English — "apartment", not "flat".
- Questions must be **simple and short**; "rather than" makes them too complex —
  removed it everywhere.
- Don't like "rather than" in the questions.
- Keep the Likert items, but only for the **more neutral/symmetric** axes; don't
  drop them wholesale.
- "Likert is ok for flattering ones where both options are fine."
- The neutral-worded single statements still had obvious "correct" answers
  (e.g. "You'd rather spend the few extra minutes cleaning up…") — pushed to fix
  it properly rather than keep polishing wording.
- **Structure** is about roommate coordination (rotas, designating what's shared,
  who has which space), not one's own schedule.
- Some axes work fine as A/B because both poles are equally attractive; cleanliness
  is the hard one.
- Wanted forced-choice (A/B) where single statements have an obvious answer; asked
  for examples and for the reasoning shown, with before/after.
- Don't trust "faking is self-defeating" — people still lie.
- Asked for psychological research on how to elicit real answers (social
  desirability bias, forced-choice/ipsative formats, etc.).
- Initial ask: the risk-assessment quiz questions were too gameable / had an
  obvious right answer; phrase them more neutrally.
