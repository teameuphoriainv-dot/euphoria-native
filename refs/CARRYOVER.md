# Euphoria iOS — carryover and backlog

Written at the end of a long session, at the owner's instruction, after his note that
**"you are not diligent enough."** That is fair and it is evidenced in §1.

This document is in two halves. §1–§4 are how to work here and what state things are in.
**§5 onward is the backlog** — every open item I could find or verify, with file:line, the
reason it matters, how to verify it, and what "done" means. Work from §5.

Read §1 first. It is not throat-clearing. Every failure in it produced a real defect that
reached the owner, and the failures were not knowledge gaps — they were verification gaps.
You will make the same ones unless you build against them deliberately.

---

# PART ONE — HOW TO WORK HERE

## 1. HOW I FAILED, SPECIFICALLY

### 1.1 I wrote three tests that could not fail

Each looked rigorous. Each proved nothing.

**The quests distinctness loop.** `src/lib/quests.ts` picks two rotating quests a day and the
two must never collide. I wrote a loop over 400 consecutive dates asserting they differ. The
pick was seeded from `dayKey()` — the *argument-less* overload, which reads the real system
clock — so all 400 iterations tested the same day. The check that existed to prove the
property proved nothing at all. Found by a review agent, not by me. Fixed: `questsForToday`
now derives `const today = dayKey(now)` once and every day computation uses it.

**The shared-rule pin.** `scripts/billing-retry-regression.mjs` asserts `_entitlement.ts` uses
the shared grace rule rather than restating it. I wrote `assert.ok(/withinRetryGrace/.test(server))`.
I then deleted the actual *call* to test the pin — **and it still passed**, because the import
line and my own explanatory comment both contain the identifier. It now strips comments first
and matches `withinRetryGrace\(`, and I re-ran the deletion to watch it fail.

**`course-mark-pin`** (an earlier session, same shape): its own sanity floor of `>= 12` masked
the exact failure it existed to catch. Lowered to `>= 1`.

> **The rule: after writing any check, break the thing it guards and watch it fail.** If you
> cannot make it fail, it is decoration. This is already the house culture —
> `order-derangement-pin` prints *"and the pre-fix shuffle is confirmed to fail this"* — I
> simply kept not doing it. `refs/NEXT_SESSION.md` §3.3 says the same thing. It is written
> down twice and I still shipped three of them in one day.

### 1.2 I worked around my own product instead of filing it

While testing navigation, my back-taps on `/you` did nothing. I used the iOS edge-swipe
gesture instead and carried on. Hours later the owner wrote: *"After I click my profile I
cant get out of it btw."*

`/you` had **no `router.back()` anywhere**. The Stack runs `headerShown: false`, so the only
exits were an undiscoverable edge-swipe or the **Log out** button — which is not a way back,
it is a way out of the account. It was survivable while `/you` sat behind one easily-missed
greeting tap. I then added a profile button to all five tab headers and turned a rarely-visited
dead end into a **one-tap trap**, without noticing, while personally experiencing it.

> **The rule: if you find yourself working around the app, that IS the bug.** Stop and write
> it down before continuing. A workaround you invent in ten seconds is a wall to someone else.

### 1.3 I nearly filed two false bug reports

**The D-pad.** After rewriting Money 2048's swipe handler I told the owner the accessible
D-pad had stopped registering taps. It had not. My tap coordinate (`x=200`) fell in the dead
gap between the ↓ key at `169` and the ↑ key at `233`. Verified working immediately after
recomputing: twelve taps produced score 13 with `$2` and `$5` merges. Had I not checked, the
next session would have burned time hunting a bug that did not exist.

**The banner gate.** I reported the "First Step" banner as unlocking without its achievement,
having read `completedLessons: []` off the simulator's filesystem. That was a **stale app
container**. The achievements screen in the running app said "3 of 26 earned" with "Getting
Going 1/10". The gate was correct; my measurement was wrong.

> **The rule: prove the measurement before reporting the defect.** Read the running app, not
> a file that merely looks like its state. Recompute button centres from the screenshot you
> are about to tap — never reuse coordinates across a layout change.

### 1.4 I chained a commit off `git add` instead of off the gate

`git add -A && git commit -q …` — so a commit landed carrying two motion defects that
`npm run check` catches and reports. I had to amend. The gates worked; my shell did not.

> **The rule:** `npm run check && npx tsc --noEmit && npx eslint <files> && git commit …`

### 1.5 What I did do right — keep doing these

- **Proved engines before building UI.** `money-2048.ts` had its full assertion suite written
  and *deliberately broken* (chain-merge rule disabled → three assertions failed) before a
  single line of screen existed. That caught nothing at the time and paid off within the hour:
  when the board appeared frozen after 24 swipes, I already knew the engine was right, so I
  looked at my test instead — and rule 3 was working exactly as designed.
- **Recorded honest ceilings.** The network rate-limit bucket's comment states plainly that it
  does not make the limiter global and that a proxy pool still defeats it. A control that
  overclaims is worse than no control.
- **Corrected my own numbers in writing.** I estimated 137 rects per sprite from the raw ASCII
  and claimed a 13x win; running the real compiler gave 29 and 8.0x. The commit message carries
  the correction so the next reader does not re-derive the wrong figure.

---

## 2. THE VERIFICATION PROTOCOL

This is the part I was not diligent about. Follow it literally.

### 2.1 Before every commit

```
npm run check && npx tsc --noEmit && npx eslint <the files you touched>
```

All three. `npm run check` runs 36 pins and **does not run eslint** (see §5.2). Chain the
commit off the conjunction, never off `git add`.

### 2.2 Before claiming any behaviour works

Tap it. Not a deep link — **tap it**, the way a user reaches it. Deep-linking to every screen
is precisely how a profile editor got built that nobody could navigate to, and how a Compound
Growth Lab sat orphaned in the routes for weeks.

To load the app:

```bash
xcrun simctl launch booted com.euphoria.native
xcrun simctl openurl booted "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F192.168.1.69%3A8081"
```

> **A bare `simctl launch` crashes** with `Assertion failed: (isNumber()), jsi.h:1937` before
> any JS runs. Reproduced at HEAD with a cleared Metro cache, so it is environmental, not a
> branch defect. Always go through the dev-client URL.

Coordinates: `displayed × 1.31 = original px`, `original px ÷ 3 = points`. Recompute from the
screenshot you are about to act on. A 48pt button is ~63 displayed px wide — the gaps between
adjacent buttons are wide enough to swallow a tap, which is exactly what happened in §1.3.

### 2.3 Before claiming a performance change

Measure it, twice, with a marker in the readout proving which build produced the number. In
this session I stamped `[b2]`, `[b3]`, `[b4]`, `[FIX2]` into an on-screen HUD precisely so a
stale bundle could not silently produce a reading. `refs/NEXT_SESSION.md` §3.4 exists because
"stale build" and "second code path" look identical from the outside.

`console.log` does **not** reach the iOS syslog in this dev-client setup. If you need runtime
numbers, render them on screen and screenshot them. Account for the observer: a HUD that sets
state every 2s adds exactly 0.5 commits/sec, and you must subtract it rather than ignore it.

### 2.4 Before trusting a subagent's finding

Two of the six review agents in this session produced findings that were **already fixed** or
**already documented as deliberate**, and one flagged three false positives (dynamic routes
`/digest/[slug]`, `/stock/[sym]`, `/settings/[section]` matched as "orphaned" because a literal
string search misses `` `/stock/${sym}` ``). Verify every claim against the code before acting
or reporting. They are extremely useful and they are not oracles.

### 2.5 Report failures the moment you find them

Including your own. Especially your own. The owner's trust in a report is worth more than the
appearance of a clean session, and a defect you conceal costs him a cofounder demo.

---

## 3. WHAT THIS APP IS

**Euphoria** — an Expo/React Native **iOS** financial-literacy app for teenagers.
Repo: `~/euphoria-native`.

| | |
|---|---|
| Stack | RN 0.86.2, React 19.2.3, Expo ~57, expo-router, Reanimated 4.5.1, react-native-svg |
| State | zustand 5 + `persist` over AsyncStorage, currently `version: 3` |
| Compiler | **React Compiler is ON** (`app.json`) — manual `useMemo` over stable values makes it *skip* the whole component |
| Simulator | UDID `755B55D9-8E4B-431C-9D1D-A635F38CFF5F`, bundle `com.euphoria.native` |
| Tabs | Home / Learn / Trade / Digest / Games |
| Deep links | `euphorianative://<route>` |

**Five tabs is the maximum.** A sixth makes iOS show a "More" overflow and the labels truncate
at accessibility sizes. A "You" tab existed and was **deliberately removed** — the cofounder
asked for Games to leave it and become "a bigger, more visible part of the app", and the web
reference has no You tab either. Profile lives behind a header button. Do not re-litigate this.

### Where the art lives

- `src/lib/pixel/{types,palette,compile,sprites,catalogue}.ts` are **byte-for-byte copies of
  the web repo's**. When a sprite changes on web, **re-copy; never re-draw.**
- `src/lib/pixel/PixelSprite.tsx` is the one file in that folder that was never the web's. iOS
  renderer optimisations belong there.
- iOS-owned additions live in separate files so the synced ones stay copyable:
  `sprites-additions.ts`, `sprites-crests.ts`, `sprites-characters.ts`, `sprites-lesson.ts`.
- `src/lib/curriculum/**` is **auto-synced from the web repo** and marked DO-NOT-EDIT. That
  includes the 64 digest hero figures.

### The gate

`npm run check` runs **36 pins**: 35 `scripts/*.mjs` plus `scripts/reduced_motion_audit.py`.
They are genuinely good — several exist to prove a specific bug *fails silently* — and they
are fast. Read `package.json`'s `check` script for the full list.

### Standing rules from the owner — do not re-ask

- **"Only do the pixel art things for iOS side only."** The web repo is hands-off.
- **No vibe-coded animations, icons, gradients or glows.** Deleted this session for that
  reason: `components/art/quest-mark.tsx`, `pulse-halo.tsx`, `CloudPuff`,
  `components/art/lesson-mark.tsx` and 12 files under `lesson-marks/`. When you find
  hand-drawn SVG the pixel system has superseded, delete it.
- **Atlas stays vector.** A pixel Atlas was proposed and explicitly rejected.
- **Games must be genuinely fun.** *"Learn how to make an enjoyable game."* He rejected three
  quiz-shaped proposals in one word — *"smn else ts all bung"* — and accepted Money 2048
  because it is an **arcade mechanic with finance as the art, not as the questions.**
- **Never print secrets.** `GEMINI_API_KEY`, `MARKETDATA_TOKEN`, the ASC key (gitignored at
  `.secrets/`). Never put key ids or issuer ids into text he might forward.
- **Cost discipline** (his global `CLAUDE.md`): batch aggressively, never launch agents or
  workflows unless explicitly asked, prefer one question over ten calls.
- **End every substantive turn with an `AskUserQuestion`** offering concrete options.

### The house engineering culture — match it, do not dilute it

Two independent review agents called this codebase *"unusually well-hardened"* and
*"unusually disciplined."* That is earned. Five patterns carry it:

1. **Pure logic separates from the screen and is proven first.** `money-2048.ts`,
   `trend-game.ts`, `_chain.ts`, `cost-basis.ts`, `billing-retry.ts`, `learner-phase.ts` are
   React-free and node-importable so pins load them directly with `node --experimental-strip-types`.
2. **Comments record the MEASUREMENT and the DEFECT, not the intent.** *"Measured on device:
   the greeting collapsed to two lines at default text size"* beats *"improves layout"*.
3. **Honest ceilings are stated.** See `_limit.ts`, which documents its own concurrency
   failure rather than implying a control it does not have.
4. **One rule, one place.** Duplicating a money rule is the recurring defect here.
   `ENTITLEMENT_ID` and the billing-retry grace period were each stated twice and each drifted.
5. **`0` is never a safe fallback on a money path.** `finiteNonNegative` returns 0, which is
   correct for an options greek that can legitimately be absent and *wrong* for a price. This
   app has shipped that bug class twice — NVDA at $1,184 against a real $217, and a portfolio
   value that disagreed with its own chart.

---

## 4. STATE AS OF THIS HANDOFF

Working tree clean at `3937f7b`. 36 gates green, `tsc` clean.

**Shipped this session** (12 commits, three OTAs, build 18 on TestFlight):

| Area | What |
|---|---|
| Games | Money 2048 (new), Trend Master made fun, Term Match made adaptive |
| Adaptive | `learner-phase.ts` (4 phases from `completedLessons`), `term-bank.ts` (60 terms × 12 courses × 3 tiers) |
| Perf | Sprites 2433 rects → **305 paths (8.0x fewer native views)**; `PixelSpriteView` memoised; Home off the whole-store subscription |
| §4.1 | **Idle React commits 3.04/s → ~1.1/s.** Cause found after two prior sessions failed |
| Profile | Earnable banners, editable display name, `ProfileButton` on all five tabs, back control on `/you` |
| Quests | 1 rotating quest → 6 in the pool, 3 shown |
| Security | Closed a free rate-limit bypass (proven 500 → 60), closed a `.gitignore` hole |
| Content | Compound Growth Lab wired into Investing Fundamentals lesson 1 step 7 |

**§4.1 is the headline.** `refs/NEXT_SESSION.md` called it *"THE BIG ONE, CAUSE UNKNOWN"* and
predicted it was behind a large fraction of incoming feedback. The cause is `useAnimatedProps`
on **react-native-svg**: RNSVG cannot natively animate most SVG attributes, so every frame of
such an animation crosses into JS and costs a React commit. Two prior sessions failed because
they hunted Atlas's *React state* — there is none worth finding; Atlas has one `useState` and
it is interaction-only. The fix gates idle motion on `focused && size >= 72` (at Home's
`size={46}` the entire excursion is sub-pixel), then applies the same gate to
`ambient-background.tsx`'s four infinite `withRepeat` loops. The six-build measurement table
is in `refs/NEXT_SESSION.md` §4.1.

**The single most valuable thing you can do first:** ask the owner whether the app actually
*feels* better on his device. Every number above is simulator-measured. His answer decides
whether the residual ~1.1 commits/sec is worth another session.

---

# PART TWO — THE BACKLOG

Ordered P0 → P4. Each item states **what**, **why it matters**, **where**, **how to verify**,
and **done means**. Sizes are rough: S = under an hour, M = a session block, L = a full session.

---

## 5. P0 — DO THESE FIRST

### 5.1 The App Store submission is REJECTED — and nobody knows why

**Status:** app info and version 1.0 are both in state `REJECTED`, with a review submission
from 2026-04-08 sitting in `UNRESOLVED_ISSUES`. Recorded in `refs/NEXT_SESSION.md` §4.4 and
`refs/APP_REVIEW_REJECTION.md`.

**Why it matters:** this is not a TestFlight blocker, which is why it has been ignored — but
it is an absolute blocker on public launch, and **the rejection reason was never retrieved.**
Everything else in this backlog is worthless if the app cannot ship.

**Where:** `refs/APP_REVIEW_REJECTION.md`, `refs/APPLE_REPLY_DRAFT.md`,
`refs/APPLE_2.1b_REPLY_DRAFT.md`, `refs/APPLE_SIGNIN_TRIAGE.md`. The ASC API helper recipe is
in `refs/NEXT_SESSION.md` §6.3.

**How to verify:** pull the actual rejection message through the App Store Connect API. Do not
guess from the draft replies — they were written against a *presumed* reason.

**Known context:** review contact is Sriyan Bodla, `team.euphoriainv@gmail.com`, with a demo
account on file. **Only `APP_IPHONE_65` screenshots exist**; modern submissions generally want
6.9-inch too, which is a likely metadata rejection all by itself. `2.1b` in one of the draft
filenames suggests a "app completeness / demo account" class of rejection.

**Done means:** the rejection reason is written down verbatim in
`refs/APP_REVIEW_REJECTION.md`, each cited guideline has a named remedy, and the owner has
been shown the list. **Do not submit a reply without his approval** — App Review correspondence
is outward-facing and permanent.

**Size:** M to diagnose, unknown to fix.

---

### 5.2 Make the lint gate green, then wire it into `npm run check`

**Status:** the owner picked this task explicitly at the end of the session and I had only
measured it when the session turned. **Here are the real numbers, freshly measured:**

```
ERRORS: 14        WARNINGS: 52

errors by rule                     warnings by rule
  7  react-hooks/set-state-in-effect    43  @typescript-eslint/no-unused-vars
  6  no-undef                            5  import/first
  1  react-hooks/purity                  2  @typescript-eslint/array-type
```

**Every error site:**

```
scripts/fetch-logos.mjs:78          no-undef
scripts/fetch-logos.mjs:92          no-undef
scripts/identity-regression.mjs:22  no-undef
scripts/make-icon.mjs:44            no-undef
scripts/store-shots.mjs:77          no-undef
scripts/store-shots.mjs:95          no-undef
src/app/(tabs)/learn.tsx:87         react-hooks/set-state-in-effect
src/app/games/term-match.tsx:71     react-hooks/set-state-in-effect
src/app/news.tsx:63                 react-hooks/set-state-in-effect
src/app/options.tsx:232             react-hooks/set-state-in-effect
src/app/stock/[sym].tsx:87          react-hooks/set-state-in-effect
src/app/stock/[sym].tsx:173         react-hooks/purity
src/components/atlas-speech.tsx:34  react-hooks/set-state-in-effect
src/shared/motion/number-rollup.tsx:29  react-hooks/set-state-in-effect
```

**Why it matters:** three real errors hid at HEAD *today* because `npm run check` never runs
eslint — a `set-state-in-effect` error in `term-match.tsx`, a React Compiler
`preserve-manual-memoization` error in `atlas.tsx` (which made the compiler **skip optimising
the whole component**), and one still open in `learn.tsx:87`. A gate that does not run is not
a gate.

**Read `refs/TASK_QUEUE.md` before touching the 7.** `NEXT_SESSION.md` §4.5 records that each
was individually read and judged benign, and that the decision of how to resolve them was
*deliberately not taken unilaterally*. It is a project decision. Respect that — bring the
owner an option list, do not silently add `// eslint-disable` lines across seven files.

**The 6 `no-undef` are not real defects.** They are all in `scripts/*.mjs` — Node scripts being
linted against a config that does not declare Node globals. Fixing the eslint config for
`scripts/**` removes all six with zero code change. Do this first; it is free and it shrinks
the problem from 14 to 8.

**Suggested plan, in order:**

1. Add a `scripts/**` override to `eslint.config.js` declaring Node globals. **-6 errors.**
2. Triage the 7 `set-state-in-effect` against `TASK_QUEUE.md`. For each, decide: real fix
   (`term-match.tsx:71` was fixable in ten minutes — the pattern is to resolve in the event
   handler, not the effect), or a targeted `// eslint-disable-next-line` **carrying the reason
   in a comment**, not a blanket rule downgrade.
3. `stock/[sym].tsx:173` `react-hooks/purity` is a different and more serious class — purity
   violations are what §3.1 of `NEXT_SESSION.md` calls "produces plausible output, not an
   error". Read it properly.
4. Only once errors are 0, add eslint to `check`. Use `--max-warnings` pinned at the current
   warning count so the 52 warnings do not block, but no *new* ones can land.

**How to verify:** `npx eslint src scripts -f json -o /tmp/l.json` and count severities. Then
deliberately introduce a `set-state-in-effect` and confirm `npm run check` now fails.

**Done means:** `npm run check` includes eslint, exits 0, and fails when a new error is
introduced — *demonstrated*, not assumed.

**Size:** M.

---

### 5.3 Rate limiting is still per-isolate — the live security exposure

**Status:** partially mitigated this session. `src/app/api/_limit.ts`.

**What is true today:** the limiter is `const buckets = new Map()` — in-memory, per Worker
isolate. The repo's own measurement, recorded in that file: **100 concurrent requests to
`/api/market` → 0 refused; 25 concurrent to `/api/chat` → 1 refused.**

I closed the *free* bypass: the bucket was keyed on `x-euphoria-install`, a **client-set
header**, so rotating it bought a fresh budget on every request forever. There is now a second
bucket keyed on `cf-connecting-ip` (EAS Hosting is managed Cloudflare Workers; that header is
set by the edge and cannot be spoofed by the caller). Proven: 500 rotating-header requests now
serve 60 instead of 500. Verified users (`u:` prefix) are exempt so a school does not throttle
its own classroom, and the network budget is 12× for carrier-grade NAT.

**What is still true:** it is not a global limiter. A caller with a proxy pool gets a fresh
address the same way they got a fresh header, and the concurrency gap above is untouched.

**Why it matters more than it looks:** `/api/chat` is a **billed Gemini proxy**, and
`_entitlement.ts` `decide()` fails open at every step — no `REVENUECAT_SECRET_KEY` → allow,
anonymous → allow, lookup failed → allow. `ATLAS_REQUIRE_AUTH` is off by default and correctly
so, because there is no sign-in UI yet and enabling it would refuse everyone. Net: **anyone who
finds the endpoint can spend the owner's Gemini budget.** That is the realistic attack on this
app — not data theft, of which there is very little.

**The fix is already scoped in the file.** `_limit.ts` records that Cloudflare Durable Objects
and Workers KV are *not available* on EAS Hosting (checked 2026-08-14: no `wrangler.toml`,
`eas deploy` exposes no binding flags), and names the real options: **Upstash Redis** (free
tier, REST, one token) or **Supabase** — which is already a dependency via `_identity.ts` and
therefore adds nothing new. Only `take()` changes; nothing else in the codebase moves.

> **Do not "fix" this with `caches.default`.** The file explains why: it is per-colo rather
> than global, and a read-modify-write over a cache has no atomicity, so it would undercount
> under exactly the burst that defeats the current limiter — while *looking* like a control.

**Blocked on the owner:** either option needs a credential he must create.

**Done means:** two isolates share one counter, demonstrated by a concurrent burst that gets
refused, and the honest-ceiling comment updated to match the new truth.

**Size:** M once the credential exists.

---

### 5.4 Confirm Supabase Row Level Security — owner-only, five minutes

**Status:** unverifiable from the repo.

**Why it matters:** `EXPO_PUBLIC_SUPABASE_ANON_KEY` ships in the client bundle and is readable
by anyone who downloads the IPA. That is **correct and by design** — the anon key is public and
safety comes entirely from RLS policies, not from hiding it. Research finding from this
session: **83% of Supabase data exposures are RLS misconfiguration.** Without RLS on a table,
that public key can read, modify and delete every row in it.

**What to do:** ask the owner to confirm, in the Supabase dashboard, that **RLS is enabled on
every table** the anon key can reach. Also flag that Supabase is retiring legacy
`anon`/`service_role` JWTs in late 2026 in favour of `sb_publishable_…` / `sb_secret_…`.

**Done means:** the owner has confirmed it and the answer is written into
`refs/SECURITY_REVIEW.md` with a date.

**Size:** S, but it is his five minutes, not yours.

---

## 6. P1 — THE OWNER'S OWN QUEUE

`refs/NEXT_SESSION.md` §1.2 records these **in his order**, with the last one explicitly last
at his instruction. Nothing below was done this session. Do not reorder without asking.

### 6.1 Light-mode sweep

**Status:** verified in light mode: **Home, Preferences, Shop, Digest**. Unverified:
**Lesson, Trade, Games, You** — and `You` has changed substantially this session (a new
`ProfileButton` on every tab, a new back control, a re-coloured title chip), so it needs
looking at regardless.

Plus **37 hardcoded hex literals** still in `src/app` and `src/components` that will not
respond to the theme at all.

**Why it matters:** build 18 is live. A cofounder can find a broken light screen right now.

**Two traps documented from the last sweep:**
- `theme.x + 'NN'` alpha-append **only works on hex**. An `hsl(...)` value concatenated with an
  alpha suffix produces an unparseable string that React Native renders at **full opacity,
  silently**. `theme-alpha-pin` scans the call sites; five light values were converted to hex
  for exactly this reason.
- Contrast must be *computed*, not eyeballed. This session found `you.tsx`'s worn-title chip at
  **4.08:1** against its own composited background — under the 4.5 AA minimum — and
  `digest.tsx` had already fixed the identical defect with a comment recording
  `primary 4.49 vs iconLilac 8.29`. The fix simply never reached the other file.

**How to verify:** set the simulator to light, walk **Lesson → Trade → Games → You** by
tapping, screenshot each, and compute contrast on anything that looks marginal. Then grep the
37 literals and decide per site whether it is deliberate art (a banner colour, a chosen
cosmetic) or a themable surface that was missed.

**Done means:** all four screens screenshotted in light, every failure fixed with a measured
ratio in the comment, and the literal count recorded.

**Size:** M.

---

### 6.2 Pixel art on Trade and Games

**Status:** these are **the two tabs still entirely on vector icons**. Both are iOS-owned, so
this is fully in scope — unlike the 64 digest hero figures, which are web-owned and synced.

**Why it matters:** the owner's standing direction is that the app should feel gamified and
that the pixel style should be integrated *properly*, not sprinkled. Two tabs on a different
visual system is exactly the inconsistency he keeps catching.

**Where to look:** `src/app/(tabs)/trade.tsx` and `src/app/(tabs)/games.tsx`. The Games grid
already uses `PixelSpriteView` for the twelve game tiles; what remains is the surrounding
chrome. Trade is the bigger job — position rows, the portfolio header, the search affordance,
the news rail.

**How to do it well:** reuse `src/lib/pixel/sprites.ts` first. It has 77 sprites and this
session found the right one already existed nearly every time (`stackCash`, `newspaper`,
`controller`, `scales`, `ladder`, `bolt`, `crack`, `globe`, `rocket`, `factory`, `chat`,
`stockTicker`). Only author into `sprites-additions.ts` when nothing fits — and remember that
authoring into `sprites.ts` breaks the re-copy contract with web.

**Done means:** both tabs screenshotted before and after, no new vector icon introduced, and
the `no-glow-pin` and `motion-invariants` gates still green.

**Size:** L.

---

### 6.3 N5 — the duplicate lesson question

**Status:** needs the **curriculum re-sync**, not a code fix.

**What is actually true, measured:** exactly **2** instances across 299 lessons — not "every
lesson" as the rewritten audit widened it to. In both, a checkpoint question repeats one from
the lesson body verbatim.

**Why it is not a code fix:** the lesson corpus is auto-synced from the web repo. Editing it in
`src/lib/curriculum/**` would be overwritten by the next `./scripts/sync-curriculum.sh`.

**Done means:** the two instances identified by course and lesson number, handed to whoever
owns the web curriculum, and a note in `refs/FEEDBACK_LOG.md` that the fix is upstream.

**Size:** S to document, blocked to fix.

---

### 6.4 Real StoreKit prices

**Status:** the owner said **"not yet."** Do not do this without re-asking.

**What is wrong:** prices are hardcoded strings. `pkg.product.priceString` from RevenueCat is
the localised, currency-correct value.

**Why it matters:** an Indian user currently sees **"$79.99"** where they will actually be
charged **₹7,900**. That is a price-misrepresentation issue, and it is the kind of thing App
Review notices — which is worth weighing against §5.1.

**Where:** `src/lib/purchases.ts`, the paywall in `src/app/onboarding.tsx?step=paywall`, and
`pricing-pin.mjs` guards the current claims.

**Done means:** every displayed price comes from `priceString`, `pricing-pin` updated to assert
that no hardcoded currency string reaches the paywall, and the pin proven to fail.

**Size:** M.

---

### 6.5 `PixelSprite.tsx` lint — partially overtaken

**Status:** §1.2 lists two react-hooks errors here. **The current measurement shows none in
that file** — the memo comparator work this session appears to have resolved them, and the
remaining seven `set-state-in-effect` errors are elsewhere (see §5.2 for the exact list).

**Action:** verify against §5.2's inventory and, if genuinely clear, strike this item from
`NEXT_SESSION.md` §1.2 rather than leaving a stale entry. **A queue that lists fixed work
trains people to skim it.** This session found the feedback log's status column actively wrong
on 11 rows for the same reason.

**Size:** S.

---

### 6.6 More Digest articles — explicitly LAST

**Status:** the owner said *"do this after everything else is done."* Honour that.

**What exists:** `src/lib/digest-extra.ts` holds **14 iOS-owned guides across 5 new
categories** (Earning, Housing, Staying safe, Insurance, Big purchases), each with pixel hero
art keyed `px-…`, exposed via `ALL_DIGEST_POSTS` / `ALL_DIGEST_CATEGORIES` / `allBodyFor` so
the synced web corpus stays untouched. `digest-extra-pin.mjs` guards it.

**When you get to it:** the pattern is established, the pin exists, and the constraint is that
new categories need pixel art from the existing catalogue. Watch the em-dash rule —
`em-dash-prose-pin` caught 13 in the last batch of digest bodies.

**Size:** M per batch.

---

## 7. P2 — BUILT BUT NEVER SURFACED

Three defects this session shared one shape: **the thing existed and nobody could reach it.**
That is now the first thing to look for, and these are the known remaining instances.

### 7.1 The `inflationEroder` widget does not exist

**Where:** `src/lib/curriculum/courses/investingFundamentals.ts:86` — Investing Fundamentals,
lesson 1, **step 1**. The comment above it reads *"Explorable Opener (interact before reading
anything)"*.

**What happens today:** `lesson-steps.ts`'s `explorable` case renders `prompt` + `insight` as
prose. So the *first interactive moment a brand-new user is ever offered* is a wall of text
that explicitly promises interaction.

**Why this is the best next feature:** the sibling `compoundGrowthLab` explorable at step 7 now
opens a real interactive lab, because the widget already existed at `/explore/compound` and was
merely orphaned. `inflationEroder` has no screen at all. `EXPLORABLE_LABS` in
`src/lib/lesson-steps.ts` takes **one more line** the moment one exists.

**The content is already written.** From the curriculum:
- prompt: *"Grandma's $100 birthday bill buys 8 movie tickets today. She says keep it somewhere
  safe. The drawer feels safe."*
- insight: *"Nobody touched the bill. It still says $100. But 3% inflation for 30 years ate 5
  of your 8 tickets."*
- params: `{ billAmount: 100, inflation: 3, years: 10, itemName: 'movie tickets', itemPrice: 12 }`

**The design that writes itself:** a $100 bill that never changes, a years slider, and the
count of movie tickets it buys visibly falling from 8 to 3. The bill staying identical while
the tickets vanish *is* the lesson.

**Model it on `src/app/explore/compound.tsx`** — steppers, a live figure, `router.back()` so it
returns to the lesson step, and a "Back" label (not "Explore", which names a section that does
not exist).

**Done means:** the screen exists, `EXPLORABLE_LABS` maps `inflationEroder` to it, and you have
**tapped through Learn → Investing Fundamentals → lesson 1 → step 1 → the lab → back**, not
deep-linked.

**Size:** M.

---

### 7.2 Your earned banner does not appear on your own profile

**Where:** `src/app/you.tsx` header card vs `src/components/profile-banner.tsx`.

**What is wrong:** you can earn banners from real achievements and choose one in
`/avatar` — and your actual profile shows a **plain card**. The banner renders only in the
picker. A cosmetic you cannot see is a cosmetic nobody works for.

**The catch to handle:** `ProfileBanner`'s `band` and `ink` are **literal hex, deliberately**,
because a banner is a chosen decoration that must look identical in both themes — like an
avatar. The `/you` card's existing text (`Level 1`, `125 XP total`, the FREE TRIAL chip) uses
*theme* colours. Compositing themed text over a fixed band is exactly how you get a contrast
failure. All 11 pairs measure 8.30:1–14.18:1 for the **banner's own ink**; that guarantee does
not extend to arbitrary theme tokens laid on top.

**Done means:** the profile header shows the worn banner, and every text colour on it is drawn
from the banner's own ink with a computed ratio in the comment.

**Size:** S–M.

---

### 7.3 Run an orphan sweep again after any navigation change

**What I did:** audited all 35 routes. Result: 6 tabs/root, 22 properly linked, 3 dev-only
(`/art-test`, `/dev-beat`, `/dev-gallery` — deliberately unlinked), 3 **false positives**
(dynamic routes pushed as templates), and **1 genuine orphan** (`/explore/compound`, now wired).

**The script that found it** is worth keeping: walk `src/app/**` into route paths, then search
all of `src/` for a literal reference to each. **Then verify every hit by hand** — the literal
search misses `` router.push(`/stock/${sym}`) `` entirely, which is how three routes were
wrongly flagged.

**Do this again** any time you add or move a screen. And extend it: a route being *linked* is
not the same as being *findable*. `/you` was linked from exactly one invisible greeting tap for
weeks.

**Size:** S.

---

## 8. P3 — THE TEN UNBUILT GAMES

`src/app/(tabs)/games.tsx` lists **twelve** games. **Three exist** — Term Match, Trend Master,
Money 2048. Nine are placeholder tiles that do nothing when tapped, four of them behind a Pro
lock. Every tile already has an assigned sprite and the pairings read the game, not its
category: *"Budget Balancer is `scales` because the game IS a balance, Credit Climb is `ladder`
because it is a climb, Black Swan is `crack` because the point of a black swan is the break,
not the bird."*

**The bar, in the owner's words:** he rejected three proposals in one word — *"smn else ts all
bung"* — when they were a swipe-sort, a resource-manager and a cash-out game. He accepted
Money 2048 immediately. The difference is that **2048 is a mechanic teenagers already play, and
the finance is the art rather than the questions.** Term Match is already the quiz slot. Do not
build a second one.

The three surviving design constraints, learned the hard way while making Trend Master fun:

1. **Skill must beat noise.** Trend Master's first version had `noise = 0.55 + difficulty*0.14`
   against a drift of `1.6`, so the random term routinely outvoted the trend and a correct read
   still lost. *"A walk where noise dominates is a coin flip wearing a chart, and a coin flip is
   not a game."*
2. **Time should be earnable.** A clock that only falls means every run is the same length. A
   correct call now buys 1.2s back, capped at the starting length.
3. **The reward needs a visible moment.** Score ticking silently in a corner is information; a
   `+30` that flies off the bar is a reward.

### The nine, with a brief each

**Budget Balancer** (`scales`) — the balance metaphor is right there. Avoid the chore-simulator
trap that got the sorting proposal rejected: this should be a *balancing* mechanic with physics
or tension, not a form you fill in. Consider: income on one pan, expenses landing on the other,
and you tilt.

**Credit Climb** (`ladder`) — a climb. Credit scores move slowly upward and fall fast, which is
naturally an ascent-with-falls mechanic. The real lesson (one missed payment costs months of
progress) is a *mechanic*, not a fact to state.

**Market Reaction** (`bolt`) — reflex. A headline appears, the market moves, you react. This is
the closest to Trend Master so be careful it is not a reskin; the differentiator should be
*reading the headline* rather than reading the chart.

**Bias Busted** (Pro, `magnifier`) — behavioural finance. High risk of becoming a quiz. If it
cannot be made arcade, consider cutting the tile rather than shipping a second Term Match.

**Black Swan** (Pro, `crack`) — the break is the point. A long calm you must prepare for,
punctuated by a rare catastrophic event. Genuinely teaches tail risk. Careful: this is
adjacent to gambling mechanics — keep the player's decisions about *preparation*, not betting.

**Trade War** (Pro, `globe`), **Invest Life** (Pro, `rocket`), **Startup Sim** (Pro, `factory`),
**AI Rival** (Pro, `chat`), **Candlesticks** (Pro, `stockTicker`) — all larger. `Invest Life`
and `Startup Sim` are full simulation games and are probably a session each on their own.

**Two arcade ideas already pitched and not built** (the owner picked Money 2048 over them, so
they are pre-vetted as on-brand):

- **Compound Tower** — the Stack game. A block slides, you tap to drop it; land clean and the
  tower compounds, miss and you shave the overhang and the next block is narrower. Pure timing,
  gets brutal, and each floor is a year of growth so the number climbing beside you is real
  compound interest.
- **Coin Run** — one-thumb endless runner. Hold to rise, release to fall, collect coins, dodge
  fees that shrink your stack, speed ramps until you die. Zero reading, pure reflex.

**How to build one properly**, following the pattern that worked:

1. Write the engine as a **React-free `src/lib/<game>.ts`** with a seeded PRNG (never
   `Math.random`, which makes a round unrepeatable and untestable).
2. Write its assertions **before any UI**, run them with
   `node --experimental-strip-types`, then **deliberately break a rule and confirm they fail.**
3. Only then build the screen.
4. **Make it accessible from the start.** A one-finger swipe *is* VoiceOver's navigation
   gesture — Money 2048 shipped unplayable for VoiceOver users because of exactly this, and
   needed a D-pad retrofitted. If your mechanic is a gesture, design the button alternative in
   the same pass.
5. Adapt it: `phaseIndex(phaseOf({ completedLessons }))` gives 0–3 and every existing game uses
   it to set a floor. Difficulty should change the *pressure*, never the *rules*.
6. Register it in `games.tsx` with a sprite from the existing catalogue.
7. Wire `recordGameScore(GAME_ID, score)` and `awardGameXp()` — and check the daily
   `lastGameDay` interaction, because the "Play a game" quest keys off it.

**Size:** M each for the arcade ones, L for the simulations.

---

## 9. P4 — INFRASTRUCTURE AND UNEXPLAINED NUMBERS

### 9.1 The build archive is 158MB and 143MB of it is unexplained

`refs/NEXT_SESSION.md` §4.5: archives upload at ~158MB, of which only ~15MB is tracked files.
`.easignore` already excludes `refs/`, `screenshots/`, `scripts/anim/`, the native dirs and all
credential patterns. **The remaining ~143MB was never explained.**

**Why it matters:** it is 3–4 minutes of every build, and an unexplained 143MB in an archive
that gets uploaded is also a mild disclosure question — nobody has enumerated what is in there.

**How to start:** `npx eas build --platform ios --profile production --dry-run` or inspect the
tarball EAS produces. Sort by size. Prime suspects: `node_modules` fragments, `.expo/`, iOS
build intermediates, or a large asset directory not covered by `.easignore`.

**Size:** S to diagnose.

### 9.2 Memory: the floor moved from 72.7MB to 142.7MB

~85MB retained across 50 navigations, roughly 1.4MB per navigation. GC reclaims ~35MB on idle
so it is **not a runaway**, but the floor doubled and **the dev-build confound was never
closed** — nobody has measured this on a release build.

**Do not chase this before §5.1 and the owner's queue.** It is the kind of number that looks
alarming and may be entirely a dev-build artefact.

### 9.3 Curriculum drift has no runtime validation

`src/lib/lesson-steps.ts` `normalizeStep()` casts to `Record<string, any>` and reads ~20 fields
across the case bodies — `s.question`, `s.options`, `s.correct`, `s.pairs`, `s.statements` — off
curriculum data that the file header itself says is *"AUTO-SYNCED FROM THE WEB REPO… can change
shape without warning."*

If the web repo renames a field, `tsc` reports nothing (the type is already erased) and at
runtime the field reads `undefined` and flows straight into rendered UI — a blank quiz prompt,
an `undefined` in an options array. **No throw, no dev warning.**

**The correct pattern already exists in this repo.** `src/lib/euphoria-icons.ts`'s
`asEuphoriaIcon` handles the identical curriculum-drift problem properly: warns loudly in
`__DEV__`, falls back safely in production. Copy it.

**Note:** `scripts/lesson-render-audit.mjs` already runs the real normaliser over all 5,341
steps — that is the harness to extend. It is how the `explorable` steps were found rendering as
an empty screen.

**Size:** M.

### 9.4 `isPro` is client-only

`src/lib/store.ts` — a plain zustand setter persisted to AsyncStorage. Flippable from an
attached JS debugger or by editing the persisted blob. **Low impact today** only because the
server routes do not check it; it unlocks client-rendered gates and nothing cost-bearing. It
becomes real the moment `REVENUECAT_SECRET_KEY` is set and server logic starts trusting it.
Worth a ticket, not an incident.

### 9.5 `noUncheckedIndexedAccess` is off

Confirmed absent from both `tsconfig.json` and `expo/tsconfig.base`. A TypeScript review traced
every indexed lookup it could find (`GLYPHS[n]`, `EUPHORIA_ICONS[name]`, `RANGES[range]`) and
found each individually guarded at its call site — **no live crash**. Recorded as a standing
gap, not a bug. Turning it on would be a large mechanical change; weigh it against the value.

---

## 10. THINGS THAT ARE FIXED — DO NOT REDO

`refs/NEXT_SESSION.md` §5 has the full table. From **this** session specifically:

- Sprites render one `<Path>` per colour, not one `<Rect>` per rect (2433 → 305 views)
- `PixelSpriteView` is memoised with a custom comparator that deliberately excludes
  `onAnimationEnd` (it is ref-latched, and including it would defeat the memo on every render)
- Home no longer subscribes to the whole store
- Atlas idle motion gates on `focused && size >= 72`
- `ambient-background.tsx`'s four twinkle loops gate on focus
- The rate limiter has a network bucket
- `.gitignore` covers plain `.env`
- `_entitlement.ts` shares one billing-grace rule with the client
- `market+api.ts` validates Polygon's `bar.c`/`bar.o` and **refuses** rather than zeroing
- Money 2048 has a VoiceOver D-pad
- `/you` has a back control
- `quests.ts` has one clock

And from earlier sessions, so you do not re-hunt them: NativeWind is fully unwired
(`CssInterop.View` 4,672 → 0 commits), the course loader has a promise cache (20 → 2 fetches),
news images went 831KB → 10.6KB, the logo bundle 3.48MB → 0.79MB.

---

## 11. FIRST FIVE MOVES

1. **Ask the owner how the app actually feels** after the perf and §4.1 work. Everything is
   simulator-measured. His answer decides whether §4.1's residual matters.
2. **Ask him to check Supabase RLS** (§5.4). Five minutes of his time, and it is the single
   highest-severity thing nobody can verify from here.
3. **Retrieve the App Store rejection reason** (§5.1). Nothing else in this backlog matters if
   the app cannot ship.
4. **Fix the eslint config for `scripts/**`** (§5.2 step 1) — six errors gone for free — then
   bring him the options for the remaining eight.
5. **Then §7.1**, the `inflationEroder` widget: it is the first interactive moment a new user
   is ever offered, the content is already written, and the pattern is proven.

And throughout: **tap through the app rather than deep-linking**, and **break every check you
write.** Those two habits would have prevented most of §1.

---

# PART THREE — APPENDICES

Expanded at the owner's request. Everything here is measured against the code as it stands at
`5520397`, not restated from older docs. Where an existing doc disagrees with what I measured,
both numbers are given and the disagreement is flagged rather than silently resolved.

---

## APPENDIX A — THE LIGHT-MODE SWEEP, SCREEN BY SCREEN

### A.1 A correction to the count

`refs/NEXT_SESSION.md` §1.2 says **37 hardcoded hex literals** remain in `src/app` and
`src/components`. My count, excluding the files where literal hex is *deliberate art*
(`banners.ts`, `sprites*`, `palette.ts`, everything under `pixel/`), is **59**.

I have not reconciled the difference and you should not assume either figure is authoritative.
The likely causes are a different exclusion set or drift since the count was taken. **Recount
before you start**, and record the exclusion rule you used alongside the number so the next
person can reproduce it:

```bash
grep -rn "#[0-9A-Fa-f]\{6\}\b" src/app src/components \
  | grep -v "banners.ts\|sprites\|palette\|pixel/"
```

### A.2 Where they are, ranked

```
 7  src/app/you.tsx
 6  src/components/atlas.tsx
 5  src/components/atlas-mark.tsx
 5  src/app/shop.tsx
 5  src/app/dev-gallery.tsx
 3  src/components/provider-button.tsx
 3  src/components/profile-avatar.tsx
 3  src/components/celebration-burst.tsx
 3  src/components/ambient-background.tsx
 3  src/app/welcome.tsx
 3  src/app/art-test.tsx
 2  src/app/games/money-2048.tsx
 2  src/app/chat.tsx
 1  each: ui-icon, tier-up-sheet, streak-ignite, onboarding-parts,
         lesson-feedback, course-rail-card, confetti, …
```

### A.3 Triage rule — most of these are not defects

Do **not** mechanically replace all 59. Sort each site into one of three buckets:

**Bucket 1 — deliberate, leave it.** A colour that must look identical in both themes because
it is *chosen decoration*, not a themed surface. `money-2048.tsx`'s `TILE`/`INK` arrays are the
clearest example: the tile ramp is a deliberate temperature progression (cool and quiet at the
bottom, warm and loud at the top, so the board's temperature tells you how the run is going
before you read a number) and inverting it per theme would destroy the design. `banners.ts` is
the same and is already excluded. **Add a one-line comment saying why**, so the next sweep does
not re-flag it.

**Bucket 2 — Atlas.** `atlas.tsx` and `atlas-mark.tsx` account for 11 of the 59. Atlas is a
brand mascot with a fixed palette (`LIT #DEA5F5 / DARK #A855EB` per `dev-gallery.tsx`). These
are almost certainly Bucket 1, but they are worth one deliberate look in light mode because
Atlas sits on a themed background.

**Bucket 3 — genuine misses.** A colour that *should* follow the theme and does not. These are
what the sweep is for. `you.tsx` (7 sites) is the highest-value file to check because it
changed substantially this session and is now one tap from every tab.

### A.4 The two traps, both previously shipped

**`hsl()` + alpha concatenation renders at FULL OPACITY, silently.** The codebase writes
`theme.x + '30'` in **88 places** to get a translucent tint. That works on hex. It does not
work on `hsl(...)` — the concatenation produces an unparseable string and React Native falls
back to fully opaque. Nothing errors. Five light-mode values were converted to hex for exactly
this reason and `theme-alpha-pin.mjs` now scans the call sites. **If you add a light-mode
colour, it must be hex.**

**Contrast must be computed.** This session found `you.tsx`'s worn-title chip at **4.08:1**
against its own composited background — under the 4.5 AA minimum — while `digest.tsx` had
*already fixed the identical defect*, with a comment recording `primary 4.49 vs iconLilac 8.29`.
The fix never reached the other file. Two more were found the same way: the Games Pro badge at
**~3.55:1** (because `opacity: 0.6` on the whole card dimmed the badge along with the art), and
`friends.tsx` dark-on-violet which scores 4.68 in light and 6.5 in dark — checked, and white
would have been *worse*.

When you composite, composite properly: `primary + '18'` is ~9.4% alpha over the card token,
and you must resolve that to a solid colour before measuring against the text.

### A.5 The screens

| Screen | Status | Notes |
|---|---|---|
| Home | verified light | re-check: the goal pill was removed and `ProfileButton` added |
| Preferences | verified light | |
| Shop | verified light | 5 hex sites, likely deliberate cosmetic art |
| Digest | verified light | already has the contrast fix others need |
| **Lesson** | **unverified** | the longest screen, most step types |
| **Trade** | **unverified** | live data, red/green semantics — check both directions |
| **Games** | **unverified** | Pro badge contrast was just changed |
| **You** | **unverified** | changed most this session |

Also unverified and reachable: `/avatar` (new banner list, 11 fixed-hex bands on a themed
page), `/achievements`, `/league`, `/friends`, `/explore/compound`, and the three game screens.

### A.6 Done means

All four §1.2 screens plus `/avatar` screenshotted in light mode; every failure fixed with the
**measured ratio written into the comment**; every remaining literal sorted into a bucket with
a one-line reason; and the literal count recorded with its exclusion rule.

---

## APPENDIX B — PIXEL ART ON TRADE AND GAMES: THE SCOPE IS SMALLER THAN IT SOUNDS

### B.1 A second correction

`§1.2` item 2 describes Trade and Games as *"the two tabs still entirely on vector icons."*
**That is not what the code shows.** Measured:

```
Trade:  UIcon name="arrowRight" ×1,  UIcon name="search" ×1
Games:  UIcon name="lock" ×1
```

**Three vector icons between them.** The Games grid already renders twelve `PixelSpriteView`
tiles, and the tab bar icons themselves are already pixel. So the framing is stale.

### B.2 And most remaining UIcons should STAY vector

The house rule, stated in the art files: **utility glyphs come from the library, identity art
is authored.** Across the whole app the UIcon usage is dominated by exactly the utility set:

```
16 check      15 chevronLeft   13 arrowRight   12 close
 4 sparkle     4 lock           3 search        2 flame
```

`check`, `chevronLeft`, `chevronRight`, `close`, `arrowRight`, `search` are navigation and
affordance chrome. Converting those to pixel art would be **wrong** — it would make every back
button a bespoke asset, and it is the kind of over-application the owner has pushed back on.

### B.3 So what is actually left

Not icons — **identity surfaces**. Ask of each: *is this a picture of something, or is it a
control?* Pictures become pixel; controls stay vector.

**On Trade:**
- Position rows — each holds a ticker. Company/sector identity art is a real candidate, and
  `sprites.ts` already has `bull`, `bear`, `stockTicker`, `chartUp`, `chartDown`, `dividend`,
  `briefcase`, `factory`, `bank`, `globe`.
- The portfolio header — currently a `NumberRollup`. Could carry `wallet` or `stackCash`.
- The news rail — `newspaper` exists and is already used for the Digest quest.
- The empty state, if there is one.

**On Games:**
- Largely done. The Pro lock badge is a *control*, so it stays.

**On Home** (not in §1.2 but the same question): the league crest is already pixel, the header
pills are already pixel, the quest marks are already pixel, the course rail art is already
pixel. Home is essentially complete.

### B.4 The rule for adding sprites

Reuse first. `sprites.ts` has **77** and this session found the right one already existed
nearly every time — `stackCash`, `newspaper`, `controller`, `scales`, `ladder`, `bolt`,
`crack`, `globe`, `rocket`, `factory`, `chat`, `stockTicker`, `book`, `target`, `crown`,
`diamondRing`, `gem`.

If nothing fits, author into **`sprites-additions.ts`**, never `sprites.ts` — that file is a
byte-for-byte copy of the web's and authoring into it breaks the re-copy contract.

Sprite format: ASCII rows, **one character per pixel**, character → hex via the palette. Width
and height derive from the rows, and `compile.ts` **rejects** a row of the wrong width — which
is how a generator that emitted two-character palette keys (`s1`, `h1`) was caught immediately.
A per-sprite `palette` override merges over the base (sprite wins).

### B.5 Done means

Trade screenshotted before and after; every added sprite drawn from the existing catalogue or
justified in `sprites-additions.ts`; no utility glyph converted; `no-glow-pin`,
`course-mark-pin` and `motion-invariants` still green.

---

## APPENDIX C — DESIGN BRIEFS FOR THE NINE UNBUILT GAMES

### C.1 The bar, and why three proposals were rejected

The owner rejected a swipe-sort ("scam or legit"), a budget resource-manager, and a
cash-out-before-the-crash game in **one word**: *"smn else ts all bung."* He accepted Money
2048 immediately. The difference is worth naming precisely, because it is the whole spec:

- **A swipe-sort is a multiple-choice question wearing a game costume.** Term Match already
  occupies the quiz slot. Do not build a second one.
- **A resource-manager is a form you fill in.** Filling a form is not a mechanic.
- **A cash-out game is a slot machine.** For a teen financial-literacy app that is not a taste
  issue, it is a duty-of-care issue. Do not build one, and say why if asked.

What worked: **a mechanic teenagers already play, with finance as the art rather than as the
questions.** 2048's ladder became the real US denomination ladder — $1 $2 $5 $10 $20 $50 $100 —
and that ladder is *why it teaches*: 2048's own ladder doubles every merge, but money does not.
Two $2 make $5 (2.5×) and two $20 make $50 (2.5×), while two $5 make $10 (2×). A player feels
that asymmetry long before they could name it. **That is the target: the finance should be in
the mechanic's shape, not in a question attached to it.**

### C.2 Three rules learned making Trend Master fun

**1. Skill must beat noise.** The first version had `noise = 0.55 + difficulty*0.14` against a
drift of `1.6`, so the random term routinely outvoted the trend and a correct read still lost.
*A walk where noise dominates is a coin flip wearing a chart, and a coin flip is not a game.*
Now `0.34 + min(difficulty,6)*0.11` against `2.6`.

**2. Time should be earnable.** A clock that only falls means every run is the same length no
matter how well it goes. A correct call buys back `TIME_BONUS` (1.2s), capped at the starting
length so a long streak cannot make a run endless and flatten the score curve for everyone else.

**3. The reward needs a visible moment.** Score ticking silently in a corner is information. A
`+30` that flies off the bar is a reward. Crossing a multiplier renders larger and in the
accent, because that is the moment the run got worth more and nothing else on screen said so.

A fourth, learned from a defect: **the reveal is the tension, but it must not be dead air.** At
620ms a 45-second run spent a third of itself waiting. `REVEAL_MS` is 340.

### C.3 The build recipe — follow it in this order

1. **Engine first, React-free.** `src/lib/<game>.ts`, no imports from `react` or
   `react-native`. Seeded PRNG only — `Math.random` makes a round unrepeatable and untestable,
   and `quests.ts`, `trend-game.ts`, `term-bank.ts` and `money-2048.ts` all say so in comments.
2. **Assertions before UI**, in a `__DEV__` block. Cover every rule that has a *wrong version*.
3. **Break a rule and watch them fail.** Non-negotiable — see §1.1. For Money 2048 I disabled
   the chain-merge guard and confirmed three assertions failed before writing any screen.
4. **Then the screen.**
5. **Accessibility in the same pass, not retrofitted.** A one-finger swipe **is** VoiceOver's
   navigation gesture; Money 2048 shipped unplayable and needed a D-pad added afterwards. If
   your mechanic is a gesture, design the button alternative now.
6. **Adapt it.** `phaseIndex(phaseOf({ completedLessons }))` returns 0–3. Change the
   *pressure*, never the *rules* — a harder start must not be a different game.
7. **Wire the economy.** `recordGameScore(GAME_ID, score)` and `awardGameXp()`. Note
   `awardGameXp` stamps `lastGameDay`, which the "Play a game" daily quest reads.
8. **Register** in `src/app/(tabs)/games.tsx` with a catalogue sprite.

### C.4 The nine

Each already has an assigned sprite, and the pairings read the game rather than its category.

---

**Budget Balancer** — sprite `scales`. *The game IS a balance.*

The metaphor is doing the work already, so build the balance rather than a budget form. Income
lands on one pan, expenses on the other, and the pan tilts; you act on the tilt. The failure
mode to avoid is the one that got the sorting proposal killed — if the player is *categorising*
things, it is a quiz. If the player is *reacting to physics*, it is a game.

The teachable thing is that fixed costs are hard to move and variable ones are not, which maps
to weight that is stuck versus weight you can slide.

**Size:** M. **Risk:** medium — easiest of the nine to accidentally turn into a form.

---

**Credit Climb** — sprite `ladder`. *It is a climb.*

Credit scores rise slowly and fall fast. That asymmetry is already a mechanic: a long patient
ascent punctuated by drops that cost far more than the last gain. One missed payment erasing
months of progress should be something the player *feels* in the climb, not a fact stated after.

Consider a tension mechanic — the higher you are, the more a fall costs — so the interesting
decision is when to consolidate versus push.

**Size:** M. **Risk:** low. Strong candidate for the next one built.

---

**Market Reaction** — sprite `bolt`. *Reflex.*

A headline lands, the market moves, you react before it settles. **The trap is that this is a
Trend Master reskin** — both are "call a direction under time pressure". The differentiator has
to be that you are reading the *headline*, not the chart: the same price action means different
things after "earnings beat" versus "CEO resigns".

If you cannot make the headline the actual skill, do not build it — ship Compound Tower instead.

**Size:** M. **Risk:** high — reskin risk is real.

---

**Bias Busted** — Pro, sprite `magnifier`. *Behavioural finance.*

**Highest quiz risk of the nine.** Cognitive biases are naturally quiz-shaped and Term Match
already exists. To justify building it, the bias has to be something the player *does* and then
gets shown, not something they identify from a list. A game that lets you fall for anchoring
and then reveals the anchor is a game; a game that asks "which bias is this?" is a flashcard.

**If it cannot be made arcade, cut the tile.** Twelve tiles with nine placeholders is already a
promise the app is not keeping; shipping a weak one to fill a slot makes it worse.

**Size:** M. **Risk:** high. **Consider cutting.**

---

**Black Swan** — Pro, sprite `crack`. *The break is the point, not the bird.*

Genuinely teaches tail risk, which almost nothing else in the app does. A long calm you must
spend *preparing* for, punctuated by a rare catastrophic event.

**One caution:** this sits adjacent to gambling mechanics. Keep every decision about
**preparation** (hedging, reserves, diversification) and never about **betting on when**. The
distinction matters for a teen audience and the app already refuses the cash-out genre for the
same reason.

**Size:** M–L. **Risk:** medium — needs care, not avoidance.

---

**Trade War** — Pro, sprite `globe`. Multi-actor, likely turn-based, macro. Large.

**Invest Life** — Pro, sprite `rocket`. A life simulation. **Probably a full session on its
own** and the most likely to sprawl. Scope hard before starting.

**Startup Sim** — Pro, sprite `factory`. Same class as Invest Life.

**AI Rival** — Pro, sprite `chat`. An opponent to play against. **Note:** if this routes through
`/api/chat` it inherits every constraint in §5.3 — a billed Gemini proxy behind a per-isolate
limiter. Do not ship a game that calls it until the shared store exists, or you have built a
free-to-abuse endpoint with a game-shaped front door.

**Candlesticks** — Pro, sprite `stockTicker`. Pattern reading. High quiz risk, same as Bias
Busted; the saving grace would be making it a *drawing* or *prediction* mechanic rather than
recognition.

---

### C.5 The two pre-vetted arcade ideas

Both were pitched alongside Money 2048 and the owner chose 2048 over them — so they are
**on-brand and already sighted**, which makes them lower-risk than anything in C.4.

**Compound Tower** — the Stack game. A block slides across, you tap to drop it. Land it clean
and the tower compounds; miss and the overhang is shaved off and the next block is narrower.
Pure timing, gets brutal fast, and **each floor is a year** so the number climbing beside you is
real compound growth. The mechanic *is* the lesson: early perfect drops make every later floor
wider, which is exactly why time beats contribution.

**Coin Run** — one-thumb endless runner. Hold to rise, release to fall. Collect coins, dodge
fees that shrink your stack, speed ramps until you die. Zero reading, pure reflex, closest to
the Subway Surfers/Flappy energy a teenager expects. The finance is thin here — fees eroding a
stack — but it is honest and it is *felt*.

**Recommendation:** if you build one game, build **Compound Tower**. It has the tightest
mechanic-to-lesson fit of anything on the list, it is a proven addictive genre, and it reinforces
the single most important concept in the whole curriculum.

---

## APPENDIX D — RECIPES THAT ACTUALLY WORK

### D.1 Run a pure-logic module's assertions outside the app

The pattern used to prove the 2048 engine, the rate limiter and the quest logic:

```bash
mkdir -p /tmp/x && cd ~/euphoria-native
sed 's/if (__DEV__)/const __DEV__=true;\nif (__DEV__)/' src/lib/<module>.ts > /tmp/x/m.ts
cd /tmp/x
# stub any import the module has, e.g.:
echo 'export const dayKey = (d = new Date()) => …' > stub.ts
python3 - <<'PY'
s=open('m.ts').read().replace("from './store'", "from './stub.ts'")
open('m.ts','w').write(s)
PY
cat > run.mjs <<'EOF'
let bad=0; const o=console.error; console.error=(...a)=>{bad++;o('  FAIL:',...a);};
await import('./m.ts');
console.error=o;
console.log(bad===0 ? 'PASS' : `${bad} FAILED`);
EOF
node run.mjs
```

**Node needs explicit `.ts` extensions on relative imports.** That is why the pins import
`../src/lib/billing-retry.ts` with the extension, and why `allowImportingTsExtensions` is now on
in `tsconfig.json` (type-check only; `noEmit` is set in `expo/tsconfig.base`).

**Then break the module and re-run.** A suite you have not seen fail is not evidence.

### D.2 Measure something at runtime

`console.log` does **not** reach the iOS syslog in this dev-client setup. Render it on screen
and screenshot it. Two rules learned doing this:

- **Stamp a build marker into the readout** (`[b2]`, `[b3]`, `[FIX2]`). Otherwise a stale bundle
  produces a number you will trust. `NEXT_SESSION.md` §3.4 exists because "stale build" and
  "second code path" are indistinguishable from outside.
- **Account for the observer.** A HUD that sets state every 2s adds exactly 0.5 commits/sec.
  Subtract it in the reading and say so, rather than pretending it is free.

### D.3 Prove a visual change without a video

Take N screenshots ~350ms apart, crop to the region you care about, and diff:

```python
from PIL import Image, ImageChops
box = (455, 940, 765, 1250)   # crop tightly — exclude the animated starfield
ims = [Image.open(f'f{i}.png').convert('RGB').crop(box) for i in range(1, 7)]
mx = max(sum(1 for p in list(ImageChops.difference(ims[0], im).getdata()) if sum(p) > 18)
         for im in ims[1:])
```

This is how the Atlas gate was verified: **Home @46pt went 4,856 → 28 changed pixels** (still),
while **Lesson @110pt stayed at 24,459** (fully alive). Crop tightly — a loose crop catches the
ambient starfield and proves nothing about the thing you changed.

### D.4 Ship

```bash
npx eas update --branch production --environment production --message "…"
```

`--environment` is **required** in non-interactive mode. Runtime is `1.0.0`; every JS change
this session went out this way in ~2 minutes. **Do not rebuild for a JS fix**
(`NEXT_SESSION.md` §6.1b). A native build is `npx eas build --platform ios --profile production
--non-interactive --no-wait`; `autoIncrement: true` assigns the number, and **you cannot reissue
a build number** — App Store Connect rejects a duplicate for the same version.

Build 18 finished in **8 minutes**.

### D.5 Navigate by tapping

```bash
idb ui tap  --udid $U <x> <y>
idb ui swipe --udid $U <x1> <y1> <x2> <y2> --duration 0.3   # --duration is REQUIRED
```

Tab bar sits at **y ≈ 831 points**; tabs at **x ≈ 40 / 120 / 200 / 281 / 361**. An iOS
edge-swipe back is `swipe 3 400 350 400 --duration 0.4` — and note that *needing* it is a
finding (§1.2).

**Recompute every other coordinate from the screenshot you are about to tap.** A 48pt button is
~63 displayed px wide and the gaps between adjacent buttons will swallow a tap — that is
exactly the false bug report in §1.3.

---

## APPENDIX E — FILE MAP

**Pure logic, React-free, node-importable** — extend this set rather than putting logic in
screens: `money-2048.ts`, `trend-game.ts`, `learner-phase.ts`, `term-bank.ts`, `quests.ts`,
`achievements.ts`, `banners.ts`, `league-week.ts`, `billing-retry.ts`, `cost-basis.ts`,
`item-art.ts`, `digest-extra.ts`, and under `api/`: `_chain.ts`, `_validate.ts`, `_advice.ts`,
`_limit.ts`, `_entitlement.ts`, `_identity.ts`.

**Synced from web — re-copy, never edit:** `src/lib/pixel/{types,palette,compile,sprites,
catalogue}.ts` and everything under `src/lib/curriculum/` except the hand-written `index.ts`.

**iOS-owned art:** `sprites-additions.ts`, `sprites-crests.ts`, `sprites-characters.ts`,
`sprites-lesson.ts`, `PixelSprite.tsx`, `league-crest.tsx`, `profile-banner.tsx`,
`profile-button.tsx`, `avatars.ts`.

**The server:** `src/app/api/*+api.ts` are the routes; the `_`-prefixed files are shared
helpers. `_entitlement.ts` must stay node-loadable — two pins import it directly.

**Where the reasoning lives:** `refs/NEXT_SESSION.md` is the master doc (§1.2 the owner's
queue, §3 the hard-won rules, §4 known-broken, §6 tooling recipes). `refs/TASK_QUEUE.md` has
the per-error lint analysis. `refs/FEEDBACK_LOG.md` is the cofounder feedback spine — **its
status column was found actively wrong on 11 rows**, so verify a row against the code before
trusting it.
