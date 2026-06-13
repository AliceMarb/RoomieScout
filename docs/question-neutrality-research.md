# Writing quiz questions people can't game

Notes on phrasing the risk-assessment quiz (`concepts/risk-assessment/quiz-questions.ts`)
so answers reflect who someone actually is, not who they'd like to look like. Grounded in
the survey-methodology and personality-assessment literature; links throughout.

## The problem

The quiz infers a housemate profile from self-report. Self-report has two well-documented
enemies:

- **Social-desirability bias** — people skew answers toward the flattering option to
  protect their self-image, even with no audience. This is partly *self-deception*: people
  genuinely believe they're tidier, calmer, and better communicators than they are. See
  [Social-desirability bias (overview)](https://en.wikipedia.org/wiki/Social-desirability_bias).
- **Acquiescence bias** — the tendency to agree with any statement regardless of content
  ([overview](https://en.wikipedia.org/wiki/Acquiescence_bias)).

Our original items made the first problem worse: in the **cleanliness** and **conflict**
axes one pole was written as the responsible-adult answer ("you wipe down the stovetop even
for a quick meal") and the other as an excuse. Anyone — honest or not — drifts toward the
flattering pole.

## What does *not* fix it: "honesty is in their interest"

It's tempting to argue that faking a roommate quiz is self-defeating (lie your way into
looking easygoing, get matched with someone you'll hate). **Do not rely on this.** It
assumes respondents reason about long-term consequences and have accurate self-knowledge —
both often false. Self-deception alone defeats the incentive: someone who *believes* they're
neat will answer "neat" sincerely. Treat the honesty framing as a minor nudge, not a
control. The fixes below work regardless of the respondent's intent or self-awareness.

## Techniques, ranked by strength of evidence

### 1. Forced-choice / quasi-ipsative format — strongest

Instead of rating each statement on a scale, make the respondent **choose between two
equally desirable statements**. When both options look good, "faking good" has nowhere to go.

Meta-analyses bear this out: forced-choice scores barely move between honest and
instructed-to-fake conditions, whereas Likert scores shift significantly
([Cao & Drasgow / Frontiers meta-analysis](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/full);
[PMC meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC8511514/)).

Caveats:

- **Pure ipsative scoring is awkward** — scores become relative *within* one person and are
  hard to compare across people. The literature's sweet spot is **quasi-ipsative** (forced
  choice that isn't perfectly zero-sum), which keeps most of the faking resistance without
  the scoring pathology
  ([MDPI study](https://www.mdpi.com/2071-1050/13/8/4398)).
- It is **not** immune to faking, just far more resistant than Likert.

Recommendation: convert the **cleanliness** and **conflict** axes (our worst desirability
offenders) to quasi-ipsative pairs — e.g. pair a Neat statement against a Casual one and ask
"which is more you?". Keep Likert for social/structure where the poles are already similar
in appeal.

### 1b. The catch — pairing within one axis only works if the poles are equally desirable

Forced choice does **not** remove faking by itself. It only works when the two options are
**matched on social desirability** — i.e. pre-rated as equally flattering. Real forced-choice
instruments do exactly this: statements are rated for desirability during scale creation and
only paired (or blocked) with others at the same level ([Multivariate Behavioral Research on
TIRT block construction](https://www.tandfonline.com/doi/abs/10.1080/00273171.2023.2248979);
[TIRT inventory development, MDPI](https://www.mdpi.com/2076-328X/14/12/1118)).

This exposes an axis-specific problem: **some poles have no equally-desirable opposite.**

- **Cleanliness is asymmetric.** "Tidy" is near-universally praised; "messy" carries stigma
  no amount of "lived-in" reframing fully removes. A within-axis Neat-vs-Casual pair still
  tilts toward Neat.
- **Social and structure are roughly symmetric.** Introvert/extrovert, and
  organized/easygoing, are both socially acceptable, so within-axis A/B works well for them.
- **Conflict is nearly symmetric** — "clears the air" vs "easygoing/keeps the peace" are both
  liked — so A/B mostly holds with careful wording.

**The fix for asymmetric axes: compare *across* axes, not within.** Instead of pairing a
trait against its own opposite, pit it against an item from a *different* axis that is equally
desirable, and ask the respondent to rank ("most like me" / "least like me"). This is
**multidimensional forced choice (MFC)**: blocks mix statements from several traits, each
block desirability-balanced, so every option sounds good and the only thing that leaks out is
**genuine priority, not virtue** ([Frontiers/PMC metas, above]; block-construction guidance
in [TIRT references](https://www.tandfonline.com/doi/abs/10.1080/00273171.2023.2248979)).
Choosing "I love a clean space" as *most-you* now means ranking *sociable*, *direct*, or
*organized* below it — there is no free "good person" answer.

Scoring caveat: ranking data is ipsative, so naive scoring makes traits comparable only
*within* a person. Recovering absolute, between-person trait estimates from MFC blocks needs
a model — **Thurstonian IRT** is the standard ([Multivariate Behavioral
Research](https://www.tandfonline.com/doi/abs/10.1080/00273171.2023.2248979); [limitations
discussed in PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6713979/)). For a lightweight app,
a simpler tally is fine as long as you treat the output as relative leanings, not absolute
levels.

Residual honesty: even buried in a balanced block, a universally-praised item (e.g. the clean
one) still gets over-picked slightly. For an axis that asymmetric, the strongest fix is to
drop self-characterization entirely and ask a **specific, countable behaviour** ("How many
nights this week did you leave dishes overnight? 0 / 1–2 / 3–4 / 5+"), which is much harder to
inflate than a self-image statement.

### 2. Neutral, de-moralized wording — cheap, modest, inconsistent

Standard guidance ([Springer, forgiving-wording study](https://link.springer.com/article/10.1007/s11135-011-9469-2)):

- Drop moralistic adjectives ("responsible", "good", "considerate").
- Frame as **behaviour or preference**, not virtue.
- Add a **trade-off** so each pole costs something — the flattering answer should require
  giving up time, freedom, or comfort.
- Keep any preamble short (<~25 words) so you don't spotlight the sensitive thing.

Honest caveat: reviews repeatedly find the bias-reducing effect of wording *alone* is
**inconsistent** ([overview](https://en.wikipedia.org/wiki/Social-desirability_bias)).
It helps; it is not a control on its own.

Before / after from our file, with the reasoning:

> **Before:** "You wipe down the stovetop after cooking, even for a quick meal"
> **After:** "You'd rather spend the few extra minutes cleaning up as you go than save the time and leave it"

The "before" is free virtue with a diligence brag baked in ("even for a quick meal"). The
"after" makes you pay for it — you give up the saved time — so only someone who'd really make
that trade agrees.

> **Before:** "You'd rather have one awkward conversation than let an issue quietly build up"
> **After:** "If something a housemate did bothered you, you'd rather raise it early than sit with it, even at the risk of an awkward moment"

The "before" rigs the choice: "one awkward conversation" vs. "quietly build up" makes one
side obviously mature. Note the fix also rebalanced the *opposite* pole (Harmonious) so
keeping the peace reads as a real value, not cowardice — otherwise you just move the obvious
answer instead of removing it.

### 3. Balanced keying — catches the yea-sayer

Include roughly equal numbers of items keyed in opposite directions so an acquiescent
respondent (agrees with everything) reveals themselves by agreeing with both a trait item
and its reverse ([balanced-scale logic](https://en.wikipedia.org/wiki/Acquiescence_bias)).
Our axes already carry both poles (N/C, P/O, D/H, S/F), so we're half-set-up; the "rather X
than Y" trade-off wording reinforces it by forcing a direction even within one item.

Caveat: balanced keying has known limits — reverse-worded items can load on a separate
factor and don't always cancel the bias cleanly. Use it as a check, not a cure.

### 4. Indirect / third-person framing — probably overkill here

Asking "what would a good housemate do?" or "how do most people feel about..." distances the
respondent and reduces desirability bias **on sensitive topics**, but it adds noise (people
guess about the hypothetical third party) and does nothing on neutral traits
([Fisher, *Journal of Consumer Research*](https://academic.oup.com/jcr/article-abstract/20/2/303/1793106)).
For a roommate quiz the items aren't sensitive enough to justify the added noise — skip.

## Recommendation summary

1. Convert **cleanliness** and **conflict** to quasi-ipsative forced-choice pairs (the
   high-evidence structural fix, applied where desirability pressure is highest).
2. Keep the neutral, trade-off Likert wording everywhere else (already done in
   `quiz-questions.ts`).
3. Audit each axis for balanced keying so acquiescent responders are detectable.
4. Treat any "answer honestly" framing as a soft nudge only — do not depend on it.

## References

- [Cao & Drasgow — forced-choice faking resistance meta-analysis (Frontiers)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.732241/full)
- [Forced-choice faking resistance meta-analysis (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8511514/)
- [Quasi-ipsative forced-choice predictive validity (MDPI)](https://www.mdpi.com/2071-1050/13/8/4398)
- [Forgiving wording & question context (Springer)](https://link.springer.com/article/10.1007/s11135-011-9469-2)
- [Fisher — social desirability & indirect questioning (J. Consumer Research)](https://academic.oup.com/jcr/article-abstract/20/2/303/1793106)
- [Social-desirability bias (overview)](https://en.wikipedia.org/wiki/Social-desirability_bias)
- [Acquiescence bias (overview)](https://en.wikipedia.org/wiki/Acquiescence_bias)
