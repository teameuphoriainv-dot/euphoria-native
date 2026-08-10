# Screen audit — 2026-08-10

**26 of 31 routes captured** by `scripts/capture-screens.sh` (rerun any time; it is diffable).
Uncaptured states are listed in `UNCAPTURED.md` — a route with no screenshot here is an **uncaptured
state, not a non-existent one** (trap #6).

## Method, and its honest limits

Comparator set: `search_apps` with `min_revenue: 500000`, categories Finance + Education → **43
apps**. Screens read with `app_screens` / `screen_detail`, per AGENTS.md rule 1 (**read the screen,
never only the description** — a paywall redesign was once built and reverted off a summary).

**Finding that reframes the whole comparison: of the top ten apps at $500k/mo+ in these categories,
only ONE is Finance (TradingView, $2.25M/mo). The rest are Education** — Duolingo $48M, PictureThis
$14M, Learna $5M, Speak $3.25M, Babbel $3M, Quizlet $2.25M. Euphoria's peer group for MECHANISM is
learning apps, not brokerages. Compare against Duolingo, not Robinhood.

**Not finished.** This session audited HOME in depth and established the comparator set. The other
25 captures are on disk and the method above is repeatable. Do not read absence of a screen below as
"it passed".

---

## HOME — audited

Compared against Duolingo `112710` / `112751` (path + home, $48M/mo).

### Already at parity, and worth not "fixing"

| Mechanism | Euphoria | Duolingo |
|---|---|---|
| Streak counter | flame · 3 | flame · 1 |
| Week strip | M–S, completion dots | same (`112724`) |
| Next-lesson hero | "Lesson 2 of 25 · 30 XP" + Continue | "Lesson 2 of 7 · START +20 XP" |
| Daily quests + reset timer | "Resets in 9h" | chest countdown "1d 23h" |

The hero is a **structural match** to the highest-revenue education app in the set. Euphoria also
carries the NAMED streak tier ("Determined · 3 of 14 days"), which Duolingo's own streak-commitment
step is flagged uniqueness 7 for and which Headway `128564` does with names. That is ahead, not
behind — do not flatten it to a bare number.

### Gaps against the comparator, in order of evidence

1. **No persistent currency in the header.** Duolingo shows a gem balance (55, 500) beside the
   streak on every screen. Euphoria's top-right chip is the daily-goal ring (`0/10`), which is a
   *goal*, not a *balance*. Euphoria already mints reward cards (free fractional stock) but never
   shows an accumulated total, so the reward loop has no visible ledger. **This is the largest
   single gap** — a balance is what makes an economy feel real between sessions.

2. **No timed return incentive on the path.** Duolingo's chest with "1d 23h" is a reason to come
   back tomorrow that is visible today. Euphoria's "Resets in 9h" is the same idea but attached to
   quests and rendered as text rather than as an object on the path.

3. **No inline social comparison.** Duolingo: *"You extended your streak before 70.1% of learners!"*
   Euphoria has a full league but nothing on Home. Caution: Euphoria's league population is
   FABRICATED (`lib/people.ts` says so in its own header), so a percentile stat would be inventing a
   number — **§0.4 forbids it until accounts are real.** Recorded as a gap that is currently
   *correctly* unfilled.

4. **No streak-projection moment.** Duolingo `112724` after a lesson: *"Can you make it to a 2 day
   streak?"* with the week strip and a tip. Euphoria ends a lesson on celebration + streak but does
   not ask the forward question.

### Verify before acting

The circular gear overlapping the `0/10` chip in `home.png` is the **expo-dev-client Tools button**,
not app chrome. It will not exist in a release build. Do not "fix" it — confirm on a release build
first. Flagged because it looks exactly like a real layout collision.

---

## TODO — the remaining 25 captures

Priority order for the next pass, money and retention first:

1. `learn` · `lesson` — the core loop, compare vs Duolingo path + lesson
2. `trade` — the only Finance comparator is TradingView `858`
3. `auth` · `start` · `onboarding` — activation, vs Duolingo (52 onboarding steps) and Learna
4. `you` · `league` — retention surfaces
5. `digest` · `chat` · `options` · `stock` — depth surfaces
6. the rest

Per-screen method: `app_screens(app_id, query="<screen type>")` → `screen_detail(include_image)` for
the two or three closest → compare against `refs/audit/20260810/<screen>.png` → record convergence
as **hit rate across ≥4 apps** and state transferability. `find_similar_screens` accepts a reference
image if visual (rather than mechanical) similarity is the question — it costs roughly 14k tokens per
screen, so use it deliberately.
