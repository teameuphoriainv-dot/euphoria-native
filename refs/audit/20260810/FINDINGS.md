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
`hookOpener` is in 100% of lessons (300 of 300 — the 98% first measured was the helper-call form only, and missed the five object-form lessons that write their steps as raw literals).

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

## AUTH · ONBOARDING · START — audited

Comparator onboarding metrics, from `search_apps` intelligence rather than screens (these are counts,
not visuals, so the screen-reading rule does not apply):

| App | $/mo | steps | quiz | value before sign-up? |
|---|---|---|---|---|
| Duolingo | $48M | 13 | 5 | **YES — first lesson precedes account creation** |
| Learna | $5M | 13 | 8 | no — sign-up wall |
| Speak | $3.25M | 13 | 4 | no — one required sign-up |
| Babbel | $3M | 11 | 4 | no — no lesson until after the paywall |
| Quizlet | $2.25M | 6 | 0 | no — gated behind sign-up and paywall |
| **Euphoria** | — | **15** | **10** | **no — welcome → onboarding → AUTH → start** |

### AUTH — the screen promises something the architecture cannot do

> **"Create your free profile"**
> **"Save your streak, XP, and learning plan."**

**Nothing is saved anywhere.** Traced end to end:

- `enter()` (`auth.tsx:66`) writes name/handle/email to the LOCAL zustand profile, calls `signIn()`
  which flips a local boolean, and navigates. No network call.
- The Apple and Google buttons DO run a real OAuth flow — `runProvider` → `signInWithApple()` /
  `signInWithGoogle()` → `enterWith(identity)` — and then write that identity to the same local
  profile. The user genuinely authenticates and nothing is registered anywhere.
- `AUTH_ENABLED` is false. `currentUserId()` returns a hardcoded `null` (`auth.ts:60`).
- §22 C99 states the consequence plainly: *"data does not follow a user to a new phone, deleting the
  app destroys their streak and XP, there is no cross-device sync and no account recovery."*

So "Save your streak, XP, and learning plan" is **false**, and it is false on the one screen where a
user decides whether to trust the product. §0.4 forbids a claim the app cannot back; this is that
rule applied to a sentence rather than a number. **"Existing user? Sign in" is worse** — it implies
account recovery that does not exist, and a returning user on a new phone gets an empty account.

Signing in with Apple makes it sharper still: a user who authenticates with their Apple ID
reasonably believes their progress is now tied to it. It is not.

### AUTH — the friction is paid for, and buys the user nothing

**4/5 comparators gate value behind sign-up.** Only Duolingo — the $48M one — delivers the first
lesson first. So Euphoria gating is NOT the outlier and this is explicitly not a "copy Duolingo"
finding; four of five successful apps do what Euphoria does.

The problem is different. Those four charge sign-up friction and deliver an ACCOUNT for it: sync,
recovery, a profile that survives a reinstall. Euphoria charges the same friction — a full screen
between the quiz and the first lesson, three fields or an OAuth round trip — and delivers a local
JSON blob. **It pays the cost of the pattern and collects none of the benefit.**

Two coherent resolutions, and they point opposite ways:
- **Make it true** — wire Supabase, which `lib/auth.ts` is already scaffolded for and which the web
  app already runs on. The promise becomes accurate and the friction starts earning.
- **Make it honest** — until then, stop claiming persistence. The screen can ask for a name because
  a follow graph needs one (which is what `enter()`'s own comment says it is for) without saying
  "save".

Not resolvable by design. §0.7 puts the copy with the user and the backend is a Unit-scale decision.

### ONBOARDING — strong, and closer to the 4/5 pattern than it looks

15 steps, 10 quiz questions. That is the long end of the mainstream cluster but well inside it —
Loora runs 26/12 and Solid Starts 44/22. **Already present and matching convergence:**

| Mechanism | Comparators | Euphoria |
|---|---|---|
| Deep personalisation quiz | 5/5 | 10 questions |
| "Building your plan" moment | 4/5 | `{ kind: 'loader' }` |
| Personalised plan reveal | 3/5 | `{ kind: 'reveal' }`, from `recommendPathDetailed` |
| Notification warm-up before the OS prompt | 4/5 | "Want a daily nudge?" as a QUESTION |
| Attribution question | 2/5 | "Where did you hear about us?" |

**The one gap, 4/5: the quiz is a CONVERSATION with a character.** Duolingo runs it as a chat with
Duo (uniqueness 8), Speak as a chat with its AI tutor (9), Learna the same (8), Solid Starts as a
consultation with named experts (9). Euphoria renders a static heading above radio cards.

**And Euphoria is most of the way there already.** Every step carries a `face:` — Atlas is
`watching` for the experience question, `whoa` for the 20%-drop question, `thinking` for blockers.
The mascot already REACTS per question; he just does not ASK. The gap is framing, not assets, and
the expression work is done.

### START — already audited

§22 C109 covers it: the guided first action is now a real lesson rather than the generic digest
guide, verified on screen, including the hardcoded "LESSON 1" caught by reading the device.

---

## LEAGUE — audited. The comparators solve the cold-start problem WITHOUT inventing anyone.

Euphoria's league shows six ranked people — Maya R. 520, Devin K. 430, Priya S. 365, Jordan L. 300,
Sam T. 245, Alex P. 190 — with initial avatars, XP bars, a PROMOTION ZONE divider and "Top 3 advance
· 6 days left". **All ten people in `lib/people.ts` are fabricated**, and the file says so in its own
header: *"⚠️ EVERY PERSON IN THIS FILE IS FABRICATED. There is no backend, no accounts, and no real
users."* §22 C99 records it as an App Review risk. This audit's contribution is not the risk — it is
that **the comparators already solved it, and none of their answers require a fake human.**

### Duolingo does not show a new user a leaderboard at all — 112781, 112782

> **"Finish 7 lessons to start competing on Leaderboards!"**

The $48M app whose league mechanic everyone copies GATES it behind seven lessons, and the locked
state is not an empty list: it is a mockup of three podium avatars whose names are **placeholder
bars**. No names, real or invented, are ever shown to a user who has not earned a place among them.

That is the whole cold-start problem solved by declining to have it. Euphoria populates a full league
of named strangers for a user who may have completed zero lessons.

### Where social comparison DOES appear, it is anonymous and statistical — 3/3

```
Duolingo  112745  "You extended your streak before 70.1% of learners!"
Impulse   142049  "You outperformed 99% of your peers at this difficulty level."
Impulse   142131  Rankings by PERCENTILE — Memory 9% — over grids of anonymous person icons
Learna            no leaderboard at all; streak, call time and vocabulary dashboards only
```

Not one of them puts an individual stranger's name in front of you. They compare you to a
DISTRIBUTION. That is cheaper to be honest about, impossible to libel, and works from user one.

**Euphoria cannot use the percentile pattern either, and the HOME audit already said so:** with no
backend there is no distribution to measure, and "you beat 70% of learners" would be inventing a
number (§0.4). The point is not that percentiles are available — it is that **every comparator's
solution costs no fabricated people, and Euphoria's costs ten.**

### The options this evidence opens, none of which need a backend

1. **Gate it, as Duolingo does.** Show the crest, the league name and a locked state until the user
   has some real standing. Costs nothing, ships today, and is the highest-revenue app's own answer.
2. **Name it what it is.** If the league stays populated, stop presenting invented rivals as users —
   "Atlas's practice league" with clearly non-human pacers is honest and keeps the mechanic.
3. **Remove it until accounts exist.** The most conservative, and the only one that also removes the
   §0.4 exposure on `friends` and any social-proof surface fed by the same file.

All three are product decisions and all three are the user's call. §0.7 covers the copy in options 1
and 2.

### Worth verifying, not asserted

The green **PROMOTION ZONE** rule sits BETWEEN rank 3 and rank 4 while the pill says "Top 3 advance".
Read as a label for the region above it, that is correct; read as a heading for the rows beneath it,
it is exactly inverted. Duolingo's own treatment puts the line under the qualifying group. **Not
confirmed either way from a static capture** — it needs the code read or a second opinion, and a
promotion rule the user can read backwards is worth ten minutes.

**STILL UNAUDITED: `you`.** The retention pair was `you` and `league`; only `league` is done here.

---

## YOU — audited. Every tile counts backwards; nothing on the screen is a goal.

Comparators, read as SCREENS from the pull made for LEAGUE (no new fetch): Impulse `142130` and
`142140` (profile), `142141` (share sheet), and Duolingo `112783` (feed). Impulse is $1M/mo and
Duolingo $48M. **Two apps, not four — this is below the bar and the hit rates say so.**

Euphoria's screen: profile card with Level 1 and "210 XP total · 290 to level 2"; a trial card
reading "Day 2 of 3" with per-feature metering (All open LESSONS · 0 left ATLAS · 2 left OPTIONS)
and "See Euphoria Pro"; the league crest with "290 XP to Investor"; then four tiles — 3 Day streak,
2 Lessons, 210 XP, 1 Guides read.

### The finding: counters, not goals — 2/2

```
Impulse 142130   Badges 1/20 unlocked · "Hard worker — Train for 10 min · 8/10"
Impulse 142140   Sherlock Holmes, Walking encyclopedia, Math genius, Busy bee
                 — each a named badge over a PROGRESS BAR toward a stated task
Euphoria         3 Day streak · 2 Lessons · 210 XP · 1 Guides read
```

Every one of Euphoria's four tiles is a **record of what already happened**. Impulse's profile is
built almost entirely from **unfinished things with a bar under them** — 8/10, 1/20 — so the screen
gives a reason to open the app rather than a receipt for having opened it. Duolingo's feed does the
same with its streak card ("Complete a lesson every day to maintain your streak!" + START A LESSON).

**Euphoria is not empty of forward motion — it is just all in the CARDS and none of it in the
tiles.** "290 to level 2" and "290 XP to Investor" are both goals, and both are good. The four tiles
beneath them are the largest block on the screen and the only part that points backwards.

### 2/2 — a BEST streak beside the current one

Impulse `142130` shows CURRENT STREAK and BEST STREAK side by side. Euphoria shows only current
(`3 Day streak`). A personal best is the one number that survives a broken streak, and it is the
reason to start again rather than the reason to feel the loss.

Cheap: the store already persists `streak`; a `bestStreak` is a max on the same write.

### 2/2, and DELIBERATELY NOT RECOMMENDED — invite/share

Impulse `142140` carries "Invite friends and train your brains together" with a button, and `142141`
is the share sheet it opens. Duolingo `112783` leads its feed with "Celebrate achievements with
friends! ADD FRIENDS".

**Recorded as correctly absent, for now.** An invite CTA is the one mechanic here that would create
REAL users — but it lands them in a friends system whose population is fabricated (`lib/people.ts`),
and there is no backend to attach an invited person to (C99). Shipping "invite a friend" into that
is worse than not having it. It becomes the right feature the moment accounts are real, and it
belongs with the LEAGUE decision rather than ahead of it.

### Where Euphoria is ahead, and should not be flattened

**The trial card meters PER FEATURE and says so** — "All open · 0 left · 2 left" across lessons,
Atlas and options. Neither comparator does anything like it; both meter invisibly or not at all.
That card tells a user exactly what they have spent and what remains, on the screen where they
decide whether to pay. It is the honest version of a paywall's job and it is doing it well.

### Worth verifying

`0 left ATLAS` on a Day-2-of-3 trial means the free Atlas allowance is exhausted before the trial
is. Whether that is intended pacing or an unbalanced allowance is a 17g question, not an audit one —
but the two numbers sit two inches apart and a user will read them together.

---

## TODO — 17 captured screens still unaudited

26 of 31 routes are CAPTURED; 9 are audited. The 18 below have screenshots on disk and no findings written.
The five uncaptured routes are a separate list, in `UNCAPTURED.md`.

Priority order for the next pass, money and retention first:

1. `lesson` EXERCISE STEPS (2-20) — uncaptured; needs a seeded run. The lesson INTRO is done.
2. `trade` is DONE (above). Its lesson: the Finance peer group does not exist at $500k.
3. `auth` · `start` · `onboarding` are DONE (above).
4. `you` and `league` are DONE (above).
5. `digest` · `chat` · `options` · `stock` — depth surfaces
6. the rest

Per-screen method: `app_screens(app_id, query="<screen type>")` → `screen_detail(include_image)` for
the two or three closest → compare against `refs/audit/20260810/<screen>.png` → record convergence
as **hit rate across ≥4 apps** and state transferability. `find_similar_screens` accepts a reference
image if visual (rather than mechanical) similarity is the question — it costs roughly 14k tokens per
screen, so use it deliberately.
