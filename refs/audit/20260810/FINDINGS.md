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

**Not finished.** HOME, LEARN, the LESSON INTRO and TRADE are audited in depth and both comparator
sets are established. The other 22 captures are on disk and the method above is repeatable. Do not read absence of a screen below as
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

## LEARN — audited

Compared against four apps, read as SCREENS (AGENTS.md rule 1), not descriptions:

| App | $/mo | Screen | What it is |
|---|---|---|---|
| Duolingo | $48M | `112703` | winding path, circular nodes, unit banner |
| Learna | $5M | `264998` | winding path, padlocked nodes, section rule |
| Speak | $3.25M | `167918` | Course tab, unit header + lesson cards |
| Babbel | $3M | `20450` | Today tab, unit header + lesson cards |

**Selection is not random and the hit rates below inherit that.** These are the four apps in the
Education $500k+ set whose recorded screens actually contain a course/path surface. Chosen for having
the screen, not sampled. All four are language-learning; see transferability at the end.

### The 4/4 findings

**1. EVERY ONE SCOPES THE VISIBLE LIST TO A UNIT. Euphoria shows all 25 lessons in one flat scroll.**

```
Duolingo   SECTION 1, UNIT 1  ·  "Learn Korean vowels"
Speak      UNIT 1 · 12 LESSONS ·  "Starting a Conversation"
Babbel     Newcomer I (A1.1) - Unit 1 · "Greet people and say goodbye"
Learna     "Beginner" as a section rule across the path
Euphoria   "Behavioral Finance · 4% complete · 25 lessons"   <- the COURSE, no unit
```

4/4 carry TWO levels: the course/level AND a named group of ~5-12 lessons the learner is inside
right now. Euphoria carries one. `learn.png` shows nine consecutive padlocked rows below the current
lesson with no break, no grouping and no theme — **none of the four ever shows more than about six
items before a divider or a unit boundary.** Duolingo breaks at six and teases the next unit name
("Learn Korean consonants") behind a rule.

This is a curriculum-shape finding, not a styling one. The 300 authored lessons (C17) are already
ordered; nothing about grouping them into named units requires new content.

**2. ALL FOUR PUT A STREAK COUNTER ON THE LEARNING SURFACE. Euphoria's Learn has no streak at all.**

```
Duolingo  flame 1 + gem 500, top strip     Speak   flame 1, top right
Babbel    flame 1, top right               Learna  flame 0, top right
Euphoria  "1/25" progress chip, top right — streak lives only on Home
```

This is the same defect the HOME audit recorded as gap 1, seen from the other side: **persistent
status does not travel between Euphoria's surfaces.** Home has the streak and no balance; Learn has
neither. In all four comparators the streak is chrome that follows you. A streak the user cannot see
while doing the thing that extends it is a weaker commitment device.

**3. LOCKED ITEMS ARE SHOWN RATHER THAN HIDDEN — 4/4, and Euphoria already does this.** Duolingo
greys the nodes, Learna badges them with padlocks, Speak and Babbel show what is ahead as cards.
**Parity. Do not "fix" it.** The gap is the RUN LENGTH, covered in finding 1, not the practice.

### The 3/4 finding

**4. THE NEXT ACTION IS A DISTINCT TAPPABLE OBJECT, not a caption.** Speak puts "Start" in a filled
blue button inside a NEXT UP card. Babbel gives "Review now" a full-width orange card. Duolingo makes
the active node bigger, bright green and ringed with an animated progress arc. Learna colours the
active node red but attaches no button — 3/4, so recorded as strong, not unanimous.

Euphoria's "START HERE" is a small pink caption under the lesson title, on a row that looks like
every other row. The tap target is the row.

### Excluded — below the evidence bar

- **Per-lesson content preview** (2/4). Speak shows a real example phrase per lesson
  ("Soy Gaby. ¡Mucho gusto!"), Babbel shows illustrations; Duolingo and Learna show icons only.
  2/4 is not evidence — excluded, per AGENTS.md rule 3.
- **Timed return object on the path** (1/4, Duolingo's chest at "1d 23h"). Already recorded as HOME
  gap 2. 1/4 is not evidence on its own.

### Transferability — what carries and what does not

**CARRIES: unit chunking and persistent status.** Both are properties of a long ordered curriculum
and of session commitment, not of language. Euphoria's 25-lesson courses are structurally the same
object as a Duolingo unit sequence.

**DOES NOT CARRY: the winding path.** Duolingo and Learna both use one, but their lesson labels are
one or two words ("Saludos", a star icon). Euphoria's are sentences — "Overconfidence & Illusion of
Control", "Building a Rational Investment Framework" — which cannot sit inside a circular node.
**The rail-and-list is the correct choice for this content and should not be converted to a path.**
Speak and Babbel, both list-based, are the right visual comparators; Duolingo and Learna are the
right MECHANISM comparators.

### Verify before acting

The gear overlapping the `1/25` chip in `learn.png` is the expo-dev-client Tools button, and the
white bar with the red badge over the tab bar is its LogBox overlay. Neither exists in a release
build. Same class as the HOME finding — confirm on a release build before treating either as a
layout bug.

---

## LESSON — audited, with two limits stated up front

**LIMIT 1: this audits the lesson INTRO, not the lesson body.** `capture-screens.sh` captures default
states, and the default state of `lesson` is step 1 of 20 — a mascot, a title, "20 steps · 30 XP" and
Continue. Steps 2-20 are UNCAPTURED. Nothing below says anything about the exercises themselves.

**LIMIT 2: three apps, not four. The ≥4 bar is NOT met.**

| App | $/mo | Screen | What it is |
|---|---|---|---|
| Duolingo | $48M | `112762` | "LET'S LEARN KOREAN!" pre-lesson teach + START LESSON |
| Speak | $3.25M | `167919` | "Starting a Conversation" objective + sample dialogue |
| Babbel | $3M | `20499` | "Greeting a neighbor" + two numbered steps + Start |

Learna `264973` was pulled as a candidate and **excluded after reading it**: it is a feature-highlight
carousel at 0:15 inside the onboarding flow ("Your Private Tutor"), not a lesson start. Bending it to
fit is the exact failure AGENTS.md rule 7 warns about. **This does NOT mean Learna has no lesson
intro** — absence cannot be inferred from a pull (trap #6). Closing this to 4/4 means going back for
Learna's or a fourth app's real lesson-start screen.

### The 3/3 pattern, reported as 3/3

**Every comparator's lesson-start screen answers "what will I be able to do, or what happens next" with
SPECIFICS. Euphoria's answers "how long, and how much XP."**

```
Duolingo  three real Korean letters with pronunciations and audio, before the lesson
Speak     "LEARN HOW TO — Greet someone, introduce yourself, and talk about
           language skills", then four real dialogue lines you will actually meet
Babbel    two numbered steps: "1 Listen — Listen to the conversation",
           "2 Speak your part — Say your part of the conversation"
Euphoria  "Ready? Let's get into it."  ·  "20 steps · 30 XP"
```

Duolingo and Speak preview the CONTENT. Babbel previews the SHAPE — what the app is about to ask you
to do. Euphoria previews neither. "20 steps" is a cost, and "30 XP" is a reward; between them the
screen never says what the twenty steps are about. On a finance app for 18-25s, where the fear is
"this will be boring or over my head", that is the question the screen is best placed to answer.

Reported at 3/3 rather than promoted to a rule, because three apps is below this audit's own bar.

### Where Euphoria differs with no evidence either way

**An XP reward on the lesson-start screen: 0/3.** None of the three shows one; Duolingo puts XP on the
path node, not here. Euphoria shows "30 XP" up front. **0/3 is absence of evidence, not evidence of
absence** — recorded as a difference, not a gap, and explicitly NOT a recommendation to remove it.

**Parity, 3/3:** an explicit close affordance. Duolingo X top-left, Babbel X top-right, Speak a back
chevron; Euphoria X top-left. Already correct.

### Why this one is cheap, and does NOT need new copy

Measured in `src/lib/curriculum/`:

```
PathwayLesson = { num, title, xp, steps, challenge }     <- no objective/summary field
                                                            so the intro already renders
                                                            everything the record carries

hookOpener      present in 300 of 300 lessons  (100%)
keyTermsCards   present in 186 of 300 lessons  (62%)
lessons with neither                        0
```

`keyTermsCards` carries `{ term, definition, example, sentence }` per term — **a direct structural
analogue of Duolingo's three preview cards**, and it already exists inside the lesson's own steps.
`hookOpener` is in 98% of lessons.

So closing the 3/3 gap means SURFACING content the curriculum already holds, not authoring any. **§0.7
does not block this** — no invented product copy is required. That is unusual among this audit's
findings and is the reason to rank it above cosmetic work.

**BUILT — see `lessonKeyTerms()` and the commit that added it.** The intro now carries a
"YOU'LL LEARN" line with up to three key terms taken from the lesson's own `keyTermsCards` step:

```
BEHAVIORAL FINANCE · LESSON 2
Cognitive Biases That Destroy Wealth
21 steps · 30 XP
YOU'LL LEARN
Confirmation Bias · Anchoring Bias · Recency Bias     <- verified on device
```

Coverage is **186 of 300 lessons (62%)**. The other 114 keep the screen they had.

**A 100%-coverage fallback was built, measured, and deleted.** `hookOpener` is present in all 300
lessons, so falling back to it looked free. It is not:

- `hookOpener.title` is IDENTICAL to the lesson title in **295 of 300** lessons. On device it
  rendered "Structuring Alternative Investment Vehicles" as the title and again immediately below
  it. A duplicate reads as a bug.
- `hookOpener.outcome` is the true objective and the right CONTENT — "By the end of this lesson,
  you'll understand what alternative investments are…" — but its median length is **241 characters**
  (max 405), six or seven lines on a 402pt screen. The mechanism the comparators converge on is
  short and scannable: Duolingo's items are three words, Speak's objective about seventy characters.
- Splitting `outcome` to its first clause was rejected: it mangles authored copy across 295 varied
  strings, and shipping a bad split is worse than showing nothing.

62% with a precise preview beats 100% where a third of it looks broken.

**GETTING THE COVERAGE NUMBER RIGHT TOOK FOUR MEASUREMENTS, AND THE SCREEN CAUGHT TWO OF THEM.**

1. A script matching only `L(` reports 295 lessons and makes `courseIndex` look wrong — the exact
   error §22 C17 already recorded once. corporateFinance declares its first five as `{ num: n }`
   objects.
2. The obvious cross-check is worse than useless: `grep -c "L("` returns 300 by COINCIDENCE, being
   295 real calls plus five matches inside quantitativeAnalysis's prose, where the maths reads
   `dL(t,T)`, `L(t,3M)` and `L(data|θ)`. Two errors cancelling to the right total.
3. Fixing both still under-reported, because those five object-form lessons author steps as raw
   literals — `{ type: 'hookOpener', ... }` — not helper calls. The script grepped the call;
   `lessonKeyTerms()` switches on `step.type` at runtime. **The doc said five lessons would show
   nothing; on device, corporate-finance lesson 1 rendered its preview.**
4. Only opening a lesson with no terms revealed the duplicated title, which no count could show.

`scripts/lesson-preview-coverage.mjs` now matches both lesson forms and both step-authoring forms,
and anchors on 25-per-course rather than a global count.

---

## TRADE — audited, and the comparator bar had to be lowered to do it

**THE FINANCE PEER GROUP AT $500k/mo DOES NOT EXIST.** `search_apps` with `category: Finance,
min_revenue: 500000` returns **four apps in total**, and three of them are not finance products:

| App | `category_primary` | $/mo | What it actually is |
|---|---|---|---|
| TradingView | Finance | $2.25M | charting + watchlists |
| Invoice2go | **Business** | $1M | invoicing |
| Invoice Maker Tofu | **Business** | $800k | invoicing |
| Bloomberg | **News** | $750k | news |

This is the same finding the HOME audit reported from the other side — only one Finance app in the
top ten — but seen at full strength. **There is exactly one app above $500k with anything resembling
a portfolio screen.** 1/1 is not evidence (rule 3).

**SO THE BAR WAS LOWERED, DELIBERATELY, FROM $500k TO $65k**, and every hit rate below inherits that.
Comparators, read as SCREENS:

| App | $/mo | Screen | What it is |
|---|---|---|---|
| TradingView | $2.25M | `185195` | **Paper Trading** dashboard — the only true analogue |
| Investing.com | $450k | `211291` | My Holdings, market value + P/L + one position |
| Seeking Alpha | $250k | `285918` | All Holdings, a symbol/price/change TABLE |
| Yahoo Finance | $65k | `97001` | portfolio total + chart + range selector |

**Three of the four are TRACKERS** — you type in positions you hold at a real broker. Only
TradingView Paper Trading shares Euphoria's actual mechanic, where the buying happens inside the app.
So the DISPLAY half has four comparators and the TRANSACTION half has one. Said plainly rather than
averaged away.

### The finding that reframes this screen: the chart is a MINORITY choice, 1/4

**Only Yahoo Finance shows a performance chart on its portfolio screen.** TradingView's Paper Trading
dashboard has none — it spends that space on seven account numbers and a Positions/Orders/History tab
bar. Investing.com has none. Seeking Alpha has none; it goes straight to a data table.

Euphoria gives roughly **40% of the screen** to a chart plus a `1D 1W 1M 3M 1Y ALL` range selector.

**This is NOT a recommendation to remove it.** Three of four comparators are trackers for people who
already invest; a chart that shows a beginner their portfolio moving over time is doing a teaching
job none of those apps has. The mechanism does not transfer because the AUDIENCE does not.

**What does need checking is the range selector.** `stocks.ts` is a hardcoded mock table and `priceOf`
parses a static string, so a paper portfolio cannot move except when the user trades. `valueHistory`
gains a point per trade, not per day. **1D, 1W, 1M and 3M are therefore offering time windows the
data cannot fill**, and on a fresh account most of them can only render flat or empty. Not verified —
it needs a seeded multi-day store — and it is listed in `UNCAPTURED.md` as exactly that kind of
state. **Verify before acting.**

### 3/4 — the total carries TWO gain figures, today and all-time

```
TradingView    Realized P&L        AND  Unrealized P&L
Investing.com  Daily P/L           AND  Open P/L      (+ a Daily|Open toggle)
Yahoo Finance  Day's Gain          AND  Total Gain
Seeking Alpha  one aggregate change, plus per-row Change and Change%
Euphoria       "+$3.28 (0.03%) all time"                      <- one figure
```

Three of four separate *what happened today* from *what happened since you bought*. Euphoria shows
only all-time, so a user cannot tell a good day from a good month.

**And the reason is the same mock table.** With static prices, "today" is always exactly $0.00 unless
the user traded, so the second figure would be honest but useless. **This is a data gap wearing a
design gap's clothes** — the same shape as C100, where a display bug turned out to be two formulas
for one number. Wiring live quotes (Phase 16) is the precondition, not a redesign.

### 3/4 — a position shows what you PAID, not just what it is worth

```
Investing.com  "BUY 100 @ 3,980.51"        <- quantity AND entry price
Seeking Alpha  Price column, plus after-hours "Post. 282.40"
Yahoo Finance  per-symbol price in the list
Euphoria       "NVIDIA · 3 shares · $3,552.80 · +3.1%"
```

Euphoria shows quantity, current value and percent — but never the price per share, and never the
cost basis. **For a product whose whole purpose is teaching, cost basis is the most educational
number on the screen**: it is the one that makes "+3.1%" mean something rather than being a coloured
number. This one is cheap and needs no new data — the store already holds the entry price it used to
compute the percentage.

### Excluded — below the bar

- **"Last updated" timestamp** (2/4: Investing.com, Yahoo). Also actively wrong for Euphoria today:
  a freshness stamp on prices that never change would advertise the mock table.
- **Hide-balance eye toggle** (2/4: Seeking Alpha, Yahoo).
- **Market-context strip** (2/4: Seeking Alpha's Dow/S&P, Yahoo's Bitcoin/XRP/FTSE/Nikkei).

### Where Euphoria is doing something none of the four does

The subtitle **"Build a real portfolio. Risk nothing."** None of the four says what its portfolio
screen is FOR, because their users already know. Euphoria's is the only one aimed at somebody who has
never held a share, and that line is the only sentence on any of the five screens that teaches. Worth
protecting, not flattening toward the trackers.

### Verify before acting

The gear top-right in `trade.png` is the expo-dev-client Tools button, and the white bar over the tab
bar is its LogBox overlay. Neither exists in a release build.

---

## TODO — the remaining 22 captures

Priority order for the next pass, money and retention first:

1. `lesson` EXERCISE STEPS (2-20) — uncaptured; needs a seeded run. The lesson INTRO is done.
2. `trade` is DONE (above). Its lesson: the Finance peer group does not exist at $500k.
3. `auth` · `start` · `onboarding` — activation, vs Duolingo (52 onboarding steps) and Learna
4. `you` · `league` — retention surfaces
5. `digest` · `chat` · `options` · `stock` — depth surfaces
6. the rest

Per-screen method: `app_screens(app_id, query="<screen type>")` → `screen_detail(include_image)` for
the two or three closest → compare against `refs/audit/20260810/<screen>.png` → record convergence
as **hit rate across ≥4 apps** and state transferability. `find_similar_screens` accepts a reference
image if visual (rather than mechanical) similarity is the question — it costs roughly 14k tokens per
screen, so use it deliberately.
