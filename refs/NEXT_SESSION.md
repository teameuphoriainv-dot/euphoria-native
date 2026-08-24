# NEXT SESSION

**Read this whole file before you touch anything. It is the contract for the session.**

> ## ⚠️ ORIENTATION — READ THIS BOX FIRST
>
> **The cofounder feedback session this file was written FOR has happened.** It ran 2026-08-22/23.
> Do not run §0's brief again: the feedback document is already processed, logged in
> `refs/FEEDBACK_LOG.md`, and 20 of 23 items are `ready-for-verification`.
>
> **§6 (tooling), §3 (the hard-won rules) and §6.10 (the gate protocol) are still live and still
> correct — that is why this file was updated in place rather than rewritten.** §0, §1, §4 and §5
> have been brought up to date. Anything else predates 2026-08-23; check it against the repo before
> you rely on it.
>
> **Start at §0.4 STATE AS OF 2026-08-23.**

Written 2026-08-21 at the end of a long shipping session, by the model that did that work, for the
model that will do the next one. Updated 2026-08-23 at the end of the session it was written for. Everything in here is either a decision the owner made explicitly,
or a fact that was *measured* rather than assumed. Where something is unverified it says so in
those words. Treat unlabelled claims as verified and labelled ones as open.

---

## 0. THE ONE-PARAGRAPH BRIEF

Two or three cofounders are going through Euphoria on TestFlight and writing down everything wrong
with it, in detail, as raw human prose. The owner will paste that document into chat as a single
dump. Your job for the entire session is to turn that document into a visible task list and then
drive every item to a fix that a human has confirmed on a real phone. This is a debugging session
from start to end. It is not a feature session, not a refactor session, and not an exploration
session. The measure of success is that the owner and his cofounders cannot find, on a TestFlight
build, any of the problems they wrote down.

---

## 0.4 STATE AS OF 2026-08-23 — WHAT THE APP IS NOW

The session this file briefed is done. What changed, and what it means for you:

### Shipped
- **TestFlight build 16** is live. 15 OTA updates on `production` after it; a JS fix reaches
  existing installs in ~2 minutes (§6.1b) and you almost never need a new build.
- **34 gates** in `npm run check`, up from 26. Eight were added in that session and **every one was
  proven to fail before being wired in** (§3.3). If you add a gate, do the same.
- **The Euphorium economy is real and closed**: league week resolves against a fixed XP bar and
  pays, a tier crossing pays once and celebrates, the shop sells 29 items, and equipped cosmetics
  render on the profile. `league-week.ts`, `shop-items-extra.ts`, `item-art.ts`.
- **The app is pixel art now.** League crests, currency marks, quest marks, all 12 course marks,
  the 5 profile stats and all 40 lesson metaphors are sprites. ~1,900 lines of hand-authored SVG
  were deleted in the process.
- **Light mode exists** (N22) and **dark is the default** — that is an owner decision, not an
  oversight. `themePref` is `'system' | 'light' | 'dark'`, persisted, with a v3 migration that
  rewrote an earlier `'system'` default back to `'dark'`.
- **Zero blurred shadows in `src`** (`no-glow-pin`). The design direction is hard-cut.

### The three rules that earned their place in that session
1. **RULE ZERO — look at the web app before deciding what iOS should do.** It repeatedly changed
   the answer. Web's leagues are four emoji divisions, so iOS's seven-tier ladder was AHEAD and
   matching web would have been a downgrade. Web has no lesson-art system at all. See §6.8.
2. **Verify on the simulator before claiming anything.** Five defects that session got past green
   gates and were caught only by looking: an age gate bypassed by auto-advance, a staircase seam in
   a sprite, a two-badge ternary that would have made every new badge invisible, `hsl()` + alpha
   string concatenation rendering at full opacity, and a pin whose own sanity floor masked the
   failure it existed for.
3. **A second art catalogue is the recurring mistake in this repo.** It has now been made and
   removed three times (shop art, course marks, lesson art). Before drawing anything, check
   `src/lib/pixel/sprites.ts` — it has 86 sprites and is a byte-for-byte copy of web's.

### Where art lives, and why it is split
| file | what | rule |
|---|---|---|
| `src/lib/pixel/sprites.ts` | 86 sprites | **byte-for-byte copy of web's. Never edit.** Re-sync by copying |
| `sprites-additions.ts` | 6 shop cosmetics + `targetGoal` | iOS-authored, pending upstream contribution |
| `sprites-crests.ts` | 7 league crests | iOS-original; web has only emoji divisions |
| `sprites-lesson.ts` | 7 lesson metaphors | iOS-original; web has no lesson art |
| `item-art.ts` | THE id -> sprite map | one map, three readers. Was three copies, and a missed copy failed silently |

### Not touched, deliberately
- **The 64 digest hero figures.** `digest-heroes.ts`, `digest-content.ts` and `digest-bodies.ts`
  all open `AUTO-SYNCED FROM THE WEB REPO — DO NOT EDIT THIS FILE`. They are the last vibe-coded
  surface in the app — 3D scenes with radial blooms — but they are web's art. Converting them on
  iOS would be erased by the next `sync-digest.sh` and would put the two apps on different pictures
  for the same guide. **Owner's standing call: iOS-side pixel art only.**
- **`lesson-marks/`** — ~300 authored per-lesson marks on the Learn path. Stroke-only line art,
  no gradient anywhere. Not the vibe-coded surface, and good work. Leave it.

---

## 0.5 PRE-FLIGHT — RUN THIS FIRST, FIX EVERYTHING RED, THEN START

**Do not read the feedback, do not open a file, do not fix anything until every line below is
green.** Starting with a broken connection means discovering it mid-investigation, and half the
wasted time in the previous session came from exactly that. This takes two minutes.

### The checks

```bash
# 1. repo clean and synced
cd ~/euphoria-native && git status --porcelain && git fetch -q origin \
  && echo "unpushed: $(git rev-list --count origin/main..HEAD)"

# 2. toolchain green BEFORE you change anything, so a later failure is provably yours
npx tsc --noEmit && npm run check

# 3. simulator booted
xcrun simctl list devices booted | grep -i booted

# 4. Metro up (only needed for simulator/dev-client work, NOT for eas update)
curl -s -m 3 http://localhost:8081/status >/dev/null && echo "metro ok" || echo "metro DOWN"

# 5. the app is attached to Metro
curl -s -m 3 http://localhost:8081/json/list | grep -c euphoria

# 6. App Store Connect API reachable
node -e 'import("./scratchpad/asc.mjs").then(async({api})=>{
  const a=await api("apps/6761808087"); console.log("ASC ok:", a.data.attributes.name);})'
```

Then, via MCP:
- `mcp__metro-mcp__list_devices` — must return the app, not `[]`
- `mcp__metro-mcp__get_current_route` — must return a route
- `mcp__claude-in-chrome__list_connected_browsers` — must NOT return `[]`
- `mcp__XcodeBuildMCP__session_show_defaults` — required before your first build/run/test call

### The four things ONLY THE OWNER can fix, so ask at the very start

1. **Chrome connected.** `list_connected_browsers` returning `[]` means the extension is down. You
   cannot reconnect it. He must run Chrome with the Claude extension enabled and signed into the
   same account, possibly restarting Chrome.
2. **Logged into the web app.** `euphoriainv.com` is a marketing page; the real product is behind
   Log in and you can never enter a password. Without this, §6.9 and §6.9b are impossible.
3. **Metro in HIS terminal**, not started by you — `cd ~/euphoria-native && npx expo start`. Started
   from inside a session it gets killed by task reaping; it died four times in one session.
4. **He is on build 12 or later.** Builds 8-11 cannot receive OTA updates, so every `eas update` you
   ship will silently never reach him and you will both be confused about why a fix "did not work."

**Ask for all four in one message at the start.** Do not discover them one at a time.

### Open and keep open for the whole session

| what | why |
|---|---|
| Chrome, logged into the web app | the reference implementation, consulted per item |
| the simulator, app running | where you reproduce and re-verify |
| `refs/NEXT_SESSION.md` | this contract |
| `refs/FEEDBACK_LOG.md` | the spine — created in your first action |
| `refs/webapp/WALKTHROUGH.md` | the web/iOS comparison, built as you go |

**If any of the four owner-items cannot be resolved, say so explicitly and state which parts of the
protocol you are therefore unable to run.** Do not silently downgrade. A session that quietly stops
doing web comparison because Chrome died is worse than one that stops and says so.

---

## 1. BINDING DECISIONS — THE OWNER ANSWERED THESE, DO NOT RE-ASK

These were settled by explicit question and answer at the end of the previous session. They are not
suggestions and they are not defaults you may reinterpret. If you find yourself wanting to deviate,
that is a signal to re-read this section, not to improvise.

**1.1 — Feedback arrives as a DOCUMENT CONTAINING SCREENSHOTS plus detailed written notes.**
Updated 2026-08-22, superseding the earlier "pasted prose" plan. A cofounder has assembled a doc
with annotated screenshots and specific written critique.

**The screenshots are primary evidence, not decoration.** You must LOOK at every one. A caption
saying "this looks wrong" is worthless next to the image showing which pixel is wrong. Three
separate findings in this project's history were fabrications produced by reasoning from a
description instead of looking, and `AGENTS.md` opens with a whole section about a paywall redesign
that was built, shipped and reverted because a flow DESCRIPTION was treated as evidence. Do not
repeat it with your own cofounders' notes.

Getting the doc in, by format:
- **Google Doc** — authenticate the Google Drive MCP and read it directly; that preserves the
  inline images.
- **PDF** — `Read` with the `pages` parameter, max 20 pages per call. It renders images.
- **Loose screenshots plus text** — have them dropped in `refs/feedback/` and `Read` each one.
  `.heic` needs converting first: `sips -s format png in.heic --out out.png`.
- **A video walkthrough** — extract frames with ffmpeg at 1fps and build a contact sheet; that
  worked well on a 28-second recording in the previous session and is far cheaper than reading
  frames one at a time.

Your very first action is to parse the whole thing into a numbered, deduplicated task list in
`refs/FEEDBACK_LOG.md`, **with the relevant screenshot saved and referenced per row**. Do that
before fixing anything: the shape of the list determines the batching, and it is the only way the
owner can see progress.

**1.2 — Triage and rank, but fix everything.** The owner's words: *"you actually fix everything.
There's no reason to defer anything without an actual proper reason."* You may and should order the
work by severity so that crashes and broken flows land before cosmetic nits. You may **not** quietly
drop an item. If something genuinely cannot be fixed this session, it needs an explicit written
reason in the log, surfaced to the owner, not buried. "Low priority" is not a reason. "This requires
an Apple review cycle that takes 24h" is a reason. "This needs a design decision only you can make"
is a reason. "I ran out of enthusiasm" is not.

**1.3 — Verification means the OWNER confirms on his phone.** This is the strictest option available
and he chose it deliberately. Your simulator screenshot is *evidence that a fix is ready to ship*,
not proof that it works. Nothing is closed until it is in a TestFlight build and a human has looked
at it on a physical device and said so. Plan the session around this: it means batching, it means
builds, and it means you must never write "fixed" in the log for something the owner has not seen.
Write "ready for verification" and move it to "fixed" only on his word.

**1.4 — Batch builds, work on `main`.** No feature branches, no PRs. Push every verified unit
directly to `main` as you go. Cut a TestFlight build when a batch of fixes is ready or when the owner
asks. A build is roughly 20 minutes plus about a minute of Apple processing, so batching is what
makes the cadence tolerable; building per-item would waste hours.

**1.5 — Reviews: specialist agents per batch, and the owner runs `/code-review ultra` at the very
end.** His words: *"#4 at the complete end though."* So: run `ecc:code-reviewer`,
`ecc:security-reviewer` and `ecc:react-reviewer` over each batch's diff before that batch ships, and
tell the owner when the whole session's work is ready for his own deep multi-agent pass. **This
selection is your standing authorisation to launch those agents** — the global `CLAUDE.md` normally
forbids launching agents unless explicitly asked, and this is that explicit ask, valid for the whole
session. You cannot trigger `/code-review ultra` yourself; it is user-triggered and billed. Tell him
when to run it; do not attempt it.

**1.6 — Trust the tester, always.** The owner chose this over "push back with evidence." If a human
found something confusing, **that is the bug**, even when the code is technically correct and even
when you can prove the current behaviour is intentional. Do not argue with a tester's report. If the
logic is right but a person misread it, the defect is in the clarity — change the copy, the
affordance, the timing, the layout, whatever made a real human wrong. The only thing you may not do
is silently decide they were mistaken and move on. If two cofounders contradict each other, satisfy
both where possible; where genuinely impossible, present both and ask.

**1.7 — Ignore cost. Do not interrupt.** This session explicitly overrides the cost rule in the
global `CLAUDE.md`. Do not batch calls to save credits, do not skip an investigation because it is
expensive, do not prefer asking over verifying. Proceed on stated assumptions and record them in the
log rather than stopping to check. Stop only for things that are genuinely the owner's to decide:
money, account access, irreversible actions, and design calls where two reasonable answers exist.
If a real cost warning appears in the harness, report it and stop that turn — never push through
one silently.

**1.8 — Scope is: the feedback list first, plus the idle-render lag, plus the paywall gaps.** The
feedback document is the priority and is worked top-down. The two known-open engineering problems in
§4 are also in scope. Transferable lessons go into the **global `~/.claude/CLAUDE.md`**, not just
this repo's `AGENTS.md`, so future projects on this account inherit them.

**1.9 — Model and effort: Opus 5, maximum effort, one session only.** No other session is working
this repo concurrently. The previous session had a hard constraint against editing
`src/components/atlas.tsx`, `src/app/lesson.tsx`, `scripts/anim/*`, `refs/ANIMATION_*.md`,
`refs/CARRYOVER.md` and `refs/LOOP_LEDGER.md` because a second session owned them. **That constraint
is lifted.** The owner confirmed: *"No other session is currently working, debug in this session."*
Every file is yours. You should still `git pull --rebase` before pushing, out of ordinary hygiene.

---

## 1.1 DECISIONS ADDED 2026-08-23 — ALSO DO NOT RE-ASK

| decision | the owner's words / the call | consequence |
|---|---|---|
| **Dark is the default** | seen on his own screen: "why is it light the entire screen switch it back" | `themePref` defaults to `'dark'`, not `'system'`. Light stays SELECTABLE. A v3 migration rewrites an earlier persisted `'system'` back to `'dark'` — changing the default alone would never have reached installs that already ran the first light-mode OTA |
| **iOS-side pixel art only** | "Only do the pixel art things for iOS side only" | do NOT edit the web repo, and do NOT convert the 64 auto-synced digest figures |
| **Atlas stays vector** | shown a 24x24 pixel Atlas and asked; chose "Keep the vector Atlas" | the proposal was deleted rather than left as dead code. Do not redraw him without being asked |
| **The weekly payout is measured against the USER, not the rivals** | "Make the payout independent of rivals" | a fixed XP bar, not a leaderboard position. `people.ts` opens "EVERY PERSON IN THIS FILE IS FABRICATED" — paying real currency for beating invented people makes the reward rest on the fabrication, and its meaning would change silently the day real accounts land. `league-week-pin` asserts the module never references PEOPLE again |
| **Navigation chrome stays vector** | my call, applied consistently | back chevrons, checks, close, search. A pixel-art back arrow is a worse back arrow. Pixel art goes where art is CONTENT |
| **Digest categories are a two-column grid** | "I just hate it right now" about the stacked rows | five full-width ~100pt rows put 1.5 categories on screen. Now 2x2 + Markets. N18's decision — sections, not oval chips — is unchanged; only the arrangement moved |

---

## 1.2 THE QUEUE — WHAT WAS NOT DONE, IN THE OWNER'S OWN ORDER

**Do these in this order. The last one is explicitly last, at his instruction.**

1. **Light-mode sweep.** Verified in light: Home, Preferences, Shop, Digest. **Unverified: Lesson,
   Trade, Games, You.** Plus 37 hardcoded hex literals still in `src/app` and `src/components`.
   Build 16 is live, so a broken light screen is findable by a cofounder right now.
2. **Pixel art on Trade and Games** — the two tabs still entirely on vector icons. Both iOS-owned.
3. **N5** — the duplicate lesson question. Widened by the rewritten audit from "the first lesson" to
   every lesson. This needs the curriculum re-sync, not a code fix.
4. **Real StoreKit prices** (`pkg.product.priceString`). The owner said "not yet". Until then an
   Indian user sees "$79.99" where they will be charged ₹7,900.
5. **`PixelSprite.tsx` lint** — two react-hooks errors (`refs`, `set-state-in-effect`) present at
   HEAD, not introduced by the feedback session, in the component every sprite renders through.
6. **LAST, at his instruction:** write more Digest articles, with new categories, each with its own
   pixel art. "do this after everything else is done".

**Blocked, needs someone else:**
- **N19** (Trade tab bugged) — not reproducible; Trade works against live data. Needs a repro.
- **A sandbox purchase** — the only unproven step in the paywall chain. Needs a device.

---

## 2. HOW TO ACTUALLY RUN THIS SESSION

### 2.1 The opening move

When the feedback dump arrives, do not start fixing. Do this instead, in order:

1. **Parse it into a numbered list.** One row per distinct defect. Prose from a human talking while
   using an app contains multiple defects per sentence and the same defect restated three times
   twenty minutes apart. Split the former and merge the latter.
2. **Deduplicate across cofounders.** If two people hit the same thing, that is one item with a
   count of two, and the count is signal — it raises priority.
3. **Classify each item** as: `crash` / `broken-flow` / `wrong-data` / `visual` / `copy` /
   `performance` / `confusion`. The classification determines the verification method, not just the
   priority. A `visual` item needs a screenshot; a `performance` item needs a measurement; a
   `confusion` item needs a rewritten affordance.
4. **Write the list to `refs/FEEDBACK_LOG.md`** and commit it before fixing anything. This is the
   session's spine. It must survive context compaction, and it will — a 300-item conversation will
   not fit in context but a file will.
5. **Create a TodoWrite list** mirroring the batches, so the owner sees live progress in his
   terminal.
6. **Show the owner the parsed list** and start work. Do not wait for approval of the list — he
   asked you not to interrupt. Flag anything ambiguous inline as you reach it.

### 2.2 The log format

`refs/FEEDBACK_LOG.md` is the single source of truth. Every row carries:

| # | reporter | verbatim quote | classification | severity | status | fix commit | verified |
|---|----------|----------------|----------------|----------|--------|------------|----------|

Keep the **verbatim quote**. Not your paraphrase. When you fix something three hours later you will
have drifted from what they actually said, and the quote is the only thing that keeps you honest
about whether you fixed *their* problem or a nearby one you found more interesting.

`status` is one of: `open` → `fixing` → `ready-for-verification` → `verified` → `wontfix (reason)`.
Only the owner moves anything to `verified`. Only an explicit written reason moves anything to
`wontfix`, and per §1.2 that reason must be real.

### 2.3 Batching

Batch by **screen or subsystem**, not by severity. Fixing six things on the lesson screen in one pass
means one context load of that file, one build, one verification sweep by the owner on one screen.
Fixing six unrelated things across six screens means six context loads and a scattered verification
pass that a human will get wrong.

A good batch is 5–15 items on one surface. After each batch: `tsc --noEmit`, `npm run check`,
specialist review agents, commit, push. After every two or three batches, or when the owner asks:
build and submit.

### 2.4 Reporting to the owner

He is a founder shipping under pressure and he reads fast. Every report should let him answer "what
can I test now?" in five seconds.

- Lead with what changed and what he should look at on his phone.
- Use tables for status. He has responded well to them all night.
- State what you did **not** fix and why, in the same message. Never let a gap be discovered later.
- When you were wrong about something, say so plainly in one sentence and move on. Do not
  self-flagellate and do not bury it.
- Never write "should work." Either you verified it or you did not, and if you did not, say which.

---

## 3. THE HARD-WON RULES OF THIS CODEBASE

This section is the most valuable thing in this document. Every rule here was bought with a mistake,
usually an expensive one, usually one that produced *confident wrong output* rather than an error.
The dominant failure mode of this project is not crashing — it is looking fine while being wrong.

### 3.1 Every failure mode here produces plausible output, not an error

Deep links silently no-op and leave you on the previous screen while your script reports success. A
guessed screen rectangle yields a perfectly quotable wrong number. H.264 compression ghosting looks
exactly like animation jank. A profiler that failed to attach reports zero commits, which reads as
"no problem found." A paywall renders correct-looking prices from hardcoded constants while the
store behind it has nothing to sell. **Assume any clean result is wrong until you have a second,
independent signal.**

### 3.2 Verify navigation before trusting any capture

Three separate findings in the previous sessions were fabrications caused by capturing a screen the
app was never on. 249 frames were scored as the digest screen; they were the home screen. A stock
screen was reported as showing no prices; the deep link had silently failed. Two "multi-peak bounce"
animation defects were reported; neither screen had been reached.

The fix is enforced in code: `scripts/anim/capture.py` has `record_transition(path, seconds,
trigger, *, reset=..., expect_change=20, settle=3.0)` which **refuses to film unless the trigger
provably changed the accessibility label set**. Use it. Do not hand-roll a capture. And note the
second bug that helper itself had: it originally ran the trigger twice, so for an idempotent action
like a tab switch, the second invocation was a no-op and it filmed a resting screen. `reset` is
required for that reason.

For anything with metro-mcp, call `get_current_route` and confirm the route name **before** you
trust a screenshot or a profile.

### 3.3 A test that cannot fail proves nothing

The `npm ci` clean-clone test that "proved" the lockfile was fine ran the **same npm 11** that
generated the lockfile. It was structurally incapable of reproducing the failure, which happened
under EAS's npm 10.9. It passed, it looked like rigorous verification, and it sent the investigation
in the wrong direction for four builds. Before you run a check, ask what result would falsify your
hypothesis. If nothing would, the check is theatre.

### 3.4 When a change measures as no-change, "stale build" and "second code path" look identical

This cost three rounds on the NativeWind investigation. Two attempts changed one thing, measured no
difference, and concluded the bundle was stale. The bundle was fine. NativeWind wires itself into the
app in **three** independent places and any one surviving hook re-wrapped every component, so a
single-hook change was genuinely indistinguishable from a no-op. Running `expo start --clear`
properly and *still* seeing no movement is what finally ruled out staleness. Prove which one you are
looking at before acting.

### 3.5 Pagination is not a detail

A confident "created 50/50 — success" was reported for the App Store trial rollout. It had covered
only the alphabetically first page of territories, `ARE` through `FIN`, and **left the USA, UK, India
and Canada without a free trial** — on a paywall that promises "No payment due now." Users would have
been charged $79.99 immediately. The API returned 50 because the default page size is 50, not because
there were 50. There were 175. Always page to exhaustion, and always spot-check for a specific
expected member (`USA`) rather than trusting a count.

### 3.6 Never infer absence from a paginated pull

Documented in `AGENTS.md` for ScreensDesign and it generalises: `app_screens` with an offset returned
positions 12, 14, 15, 18, skipping 13. That gap was read as "the screen does not exist" and correct
work was reverted on the strength of it. A missing item in a paginated response is pagination, not
evidence.

### 3.7 Check `Content-Encoding` before decoding anything

EAS build logs are served **brotli-encoded** (`content-encoding: br`). `curl` + `gunzip` produces
binary garbage that looks like a corrupt file, and chasing that cost hours across four failed builds
while the actual error sat in plain text one header-check away. Node's `fetch()` decodes brotli
natively. See §6.2 for the working recipe.

### 3.8 Profiler `actualDuration` is cumulative and is not reliably zeroed

When attributing render cost by walking the fiber tree: `actualDuration` on a parent **includes all
children**, so any deep re-render lights up every ancestor and makes the root look guilty. Worse,
React does not reliably reset `actualDuration` on fibers that bail out, so a naive self-time
calculation reports stale values and can tell you that every component in the app re-renders on every
commit — which is not plausible and is an artifact, not a finding. The previous session hit exactly
this and stopped rather than shipping a third fix built on a broken instrument. If you resume the lag
hunt (§4.1), find a sounder instrument first.

### 3.9 Ship on verified-safe; never claim verified-faster without the measurement

A NativeWind babel change was committed as a performance win **before being measured**. It turned out
to be worthless *and* actively unsafe — `nativewind/doctor.js` throws when `jsxImportSource` is
missing, and Metro died with exit code 7 during static web rendering while it was applied. It had to
be reverted. Two other fixes this session (`blink` off React state, `ringProps` memoisation) were
real defects that measurably changed **nothing** in aggregate, and their commit message says so
explicitly. Copy that discipline: a commit may say "verified safe" on a `tsc` and `check` pass, but it
may only say "faster" if you have the before and after numbers in the message.

### 3.10 Restart Metro with `--clear` after any babel or metro config change

Metro caches transforms keyed on the babel config. A config change appears to do nothing because the
old bundle is still being served. The tell is the **ratio**, not the count: 8,976 wrapped views over
66 commits is 136 per commit; 6,987 over 51 is 137. Unchanged ratio means the old bundle. Also verify
directly — `curl "http://localhost:8081/src/components/<file>.bundle?platform=ios&dev=true" | grep -c
"<a marker string you just added>"` will tell you in one call whether your edit is actually being
served.

### 3.11 The simulator is the owner's screen

Restore anything you change — route, app state, settings — and verify the restore in the same call.
If you kill Metro, bring it back. If you deep-link somewhere, navigate back. He is working on that
machine.

### 3.12 Correct the record when you are wrong, in one sentence

Several claims in the previous sessions had to be retracted: that TSLA was a genuine coverage gap
(it was a rate limit mislabelled as a 404); that ASC API access would take days of Apple review (it
was instant); that an App Manager key could not manage users (it could); that a byte cache was
delivering a win (the route module re-evaluates per request, so it was a no-op). Each was corrected
plainly and the work moved on. Do that. Do not hide a retraction and do not write three paragraphs
about it.

---

## 4. WHAT IS ALREADY KNOWN BROKEN — IN SCOPE, NOT YET FIXED

### 4.1 The idle re-render lag — CAUSE FOUND 2026-08-23, ~64% cut. Residual still open.

**FOUND: Atlas's idle motion, and the mechanism is `useAnimatedProps` on react-native-svg.**

Both earlier hypotheses failed because they targeted Atlas's REACT STATE. There was never any to
find: Atlas has exactly one `useState` and it is interaction-only, and all its idle animation writes
SHARED VALUES. The cost is not the write, it is what the value feeds — `useAnimatedProps` on an SVG
element. RNSVG cannot natively animate most SVG attributes, so each of these crosses into JS every
frame: a path `d` STRING interpolated for the happy mouth, a `rotation` on the head group, `x`/`y`
on the pupil group.

Measured with a root `<Profiler>` counting commits plus a `useApp.subscribe` log of changed keys,
Home idle and untouched, every build marker-verified so no reading came from a stale bundle:

| build | state | commits | span | rate |
|---|---|---|---|---|
| — | as shipped | 7 | 1973ms | **3.04/s** |
| b2 | Atlas removed entirely | 3 | 1225ms | 1.63/s |
| b3 | Atlas restored (control) | 6 | 1741ms | 2.87/s |
| b4 | Atlas rendered, 3 timers stopped | 3 | 1189ms | 1.68/s |
| b5 | saccade only stopped | 6 | 2002ms | 2.50/s |
| FIX2 | idle motion gated on size | 3 | 1856ms | **1.10/s** |

`writes: none` in every window — **zustand is not involved at all**. b4 ≡ b2 is the finding:
stopping the timers is worth exactly as much as deleting the component. b5 shows no single timer
dominates (saccade ~18%), so it is the mechanism, not one bad timer.

**The fix:** idle motion requires `focused && size >= 72`. Atlas's viewBox is 96 units, so at Home's
`size={46}` (scale 0.48) the blink, the pupil saccade and the smile-flex are all SUB-PIXEL — the app
was paying commits forever to draw nothing. The three `withRepeat(..., -1, true)` loops (breath,
sway, rock) were the bigger prize and are gated too. Verified by pixel-diffing the mascot's head
across six frames: Home 4856 -> **28** changed px (still), lesson at 110pt **24,459** (fully alive).

**STILL OPEN:** ~1.1/s remained at the FIX2 measurement, which was taken BEFORE the breath/sway/rock
loops were gated, so the true residual is lower and unmeasured. Whatever is left is NOT Atlas and
NOT the store. Next instrument: the same root Profiler, bisecting the other always-mounted trees.

---

#### Original entry, kept for the record

**This is very likely the single root cause behind a large fraction of the feedback you are about to
receive.** Anything a cofounder describes as laggy, sluggish, slow to appear, stuttery, or
janky is a candidate symptom of this one problem. Expect it to be reported many times in many
disguises.

**What is measured and certain:**

- The app performs **~4–5 React commits per second while completely idle**, on every screen, with
  zero user interaction. Measured repeatedly: 32, 33, 35, 41 commits per 8-second window.
- The tree is **7,025 fibers**. Every commit walks it.
- On the lesson screen there are **5 `Atlas` instances**, **6 `AmbientBackgroundInner` instances**,
  and the lesson screen itself is mounted **twice** (`Lesson(./lesson.tsx): 2`, `Route(lesson): 2`).
  That duplicate mount is itself suspicious and was never explained.
- In 6 idle seconds there were **260–320 `setTimeout` calls**. Breakdown by delay: 39× at 300ms
  (Atlas arc-flex), 30× at 130ms (Atlas blink), 15× at 260ms (Atlas saccade double-dart).
- The owner's specific complaint: **Atlas takes about 1.5 seconds to appear** on the lesson intro.

**What the maths says, and it matters:** the entrance animation is *not* slow. `Spring.smooth` with
`damping: 24` is stiffness 158, mass 1, giving ζ = 24/(2√158) ≈ **0.955** — near-critically damped,
settling in roughly **420ms**, with a 150ms opacity fade. The animation is fine. It is being
**starved of frames** by the idle commit churn. Fixing the churn is what fixes the perceived lag;
retuning the spring would be treating the symptom.

**Two hypotheses tested, both fixed, neither moved the number:**

1. `blink` was React state — `setBlink(true)` then `setBlink(false)`, two commits per blink, 30
   blinks per 6 idle seconds across 5 Atlas instances. Now a shared value crossfaded on the UI
   thread. Commits went 97 → 88. Within noise.
2. `ringProps` was rebuilt as a **new array every render** and passed to the `memo`-wrapped
   `AtlasMarkBody`, so its shallow compare never once hit and the entire mark — four
   `LinearGradient`s, a `ClipPath`, `Defs`, eight `Circle`s — re-rendered on every commit. Now
   memoised with stable shared values. Commits stayed ~32/8s. Also within noise.

Both fixes are correct and are committed with messages that state plainly that they changed nothing
measurable. Keep them.

**Where to go next.** The previous session's last instrument reported that every component,
including memo-wrapped ones, re-rendered on every commit — which per §3.8 is an artifact of
`actualDuration`, not a finding. Do not build on it. Better next moves, roughly in order of expected
value:

- **Profile a release build.** `reactCompiler: true` is on and this was all measured on a *dev*
  bundle with Fast Refresh. If idle commits drop to zero in release, this costs users nothing and the
  lag is a dev-only phantom. This is the cheapest possible falsification and it has never been run.
  **Do this first.**
- Bisect the four `useEffect`s and the `ThemeProvider` in `src/app/_layout.tsx` — it has no
  `useState`, so the root itself is not the setter, but something beneath it is.
- Investigate the **duplicate lesson mount**. Two live copies of a heavy screen doubles every timer
  and every subscription in it.
- Check whether Reanimated's `useAnimatedProps` on `react-native-svg` elements is falling back to JS
  re-renders. `AnimatedComponent(G)` and `AnimatedComponent(View)` appeared prominently in every
  self-time profile, and `breath`, `sway` and `rock` are all `withRepeat(..., -1, true)` — infinite,
  continuous, and never idle.
- Consider whether 5 Atlas and 6 AmbientBackground instances should exist simultaneously at all.

### 4.2 The paywall — configuration verified, ONE step still unproven

**Updated 2026-08-23.** RevenueCat's offering was verified correct through the public SDK key, the
$79.99 annual price was written to **175/175 territories with 0 failures**, and the trial-offer
logic is pinned (`trial-offer-pin`) against all four states including the one originally missed —
a Pro subscriber being told to start a trial.

**What is still unproven: a real sandbox purchase.** Nobody has completed one. `[iap] NO packages`
in the simulator is a SIMULATOR ARTIFACT and is not evidence of a broken paywall — that mistake was
made repeatedly before it was corrected. Do not re-diagnose it from the simulator; it needs a device.

The original text of this section follows, for the parts still accurate:

#### (original) The paywall — App Store side fixed, app side untested

**Fixed in the previous session, verified via the ASC API:**

- Both products moved `MISSING_METADATA` → **`READY_TO_SUBMIT`**. They were unfetchable by StoreKit,
  which is why RevenueCat reported "no packages" and the paywall was functionally dead.
- Subscription group localization created (it had none, which blocks every product in the group).
- `euphoria_pro_yearly` localization created (it had none). Note Apple caps the description at **55
  characters** — a longer one 409s.
- App Store review screenshots uploaded to both products, using a real capture of the app's own
  paywall.
- A **3-day `FREE_TRIAL` introductory offer created in 175/175 territories** on both products.
  Verified `USA`, `GBR`, `IND`, `CAN` explicitly. Before this, the paywall advertised a free trial
  that **did not exist** and would have charged users immediately.

**Still open and in scope:**

- `src/app/onboarding.tsx:73-74` hardcodes `monthly: '$9.99'` and `annual: '$79.99'`. The paywall
  renders those regardless of what the store returns, so **a completely broken purchase path looks
  perfectly healthy**. This is the exact failure class in §3.1 and it is the reason nobody noticed
  the paywall was dead. Decide whether to render real StoreKit prices, or to fail loudly when the
  offering is empty. Do not leave it silently lying.
- RevenueCat's offering → package → product mapping has never been verified end to end against the
  now-valid products.
- **No purchase has ever been completed.** Not in sandbox, not anywhere. Until someone taps buy and
  gets an entitlement, the paywall is unproven.
- There is a stray empty subscription group named **"Monthly"** (id `22020910`) with nothing in it,
  alongside the real group "Euphoria Pro" (`22020937`). Clutter that can confuse product mapping.

### 4.3 There is no account system — expect reports about it

`src/app/auth.tsx` (route `/auth`) has a "Sign up" button and a "Signed out? Sign back in" line. A
comment in that file is explicit:

> "Existing user? Sign in" implied ACCOUNT RECOVERY. There is none — a returning user on a new phone
> signs in and gets an empty account, because there was never an account.

The screen is reached from exactly two places: `onboarding.tsx:372` (`router.replace('/auth')`) at
the end of onboarding, and `you.tsx:430` after sign-out. So it appears **once** and most testers will
never see it again. Expect "I lost my progress," "why did it not remember me," and "I could not find
sign in." Per §1.6 those are real bugs even though the behaviour is intentional.

### 4.4 The App Store submission is REJECTED

Both the app info and version 1.0 are in state **`REJECTED`**, with a review submission from
2026-04-08 in state `UNRESOLVED_ISSUES`. This is *not* a TestFlight blocker and does not affect the
feedback session, but the owner should know before he plans a public launch. The rejection reason was
not retrieved. Review contact on file is Sriyan Bodla, `team.euphoriainv@gmail.com`, 469-937-0299,
with a demo account `Applereview@gmail.com`. Only `APP_IPHONE_65` screenshots exist; modern
submissions generally want 6.9-inch too.

### 4.5 Smaller known-open items

- Build archives upload at ~158MB and only ~15MB of that is tracked files. The remaining ~143MB was
  never explained. `.easignore` exists and excludes `refs/`, `screenshots/`, `scripts/anim/`, the
  native dirs and all credential patterns.
- `npm run lint` exits non-zero on **8 known-benign `react-hooks/set-state-in-effect` errors**. Each
  was read individually and none is a cascading render; the analysis is in `refs/TASK_QUEUE.md`. A
  permanently red gate is one nobody reads — either downgrade the rule to `warn` with the reasoning,
  or add targeted disables. It is a project decision and was deliberately not taken unilaterally.
- ~85MB retained across 50 navigations, roughly 1.4MB per navigation. GC reclaims ~35MB on idle so it
  is not a runaway, but the floor moved from 72.7MB to 142.7MB. Dev-build confound was never closed.

---

## 5. WHAT IS ALREADY FIXED — DO NOT REDO THESE

| area | what changed | evidence |
|---|---|---|
| **NativeWind** | Fully unwired — all three hooks: `withNativeWind` in `metro.config.js`, `jsxImportSource` in babel, the `global.css` import. `babel.config.js` deleted. | `CssInterop.View` 4,672 → **0** commits. App visually identical by screenshot. |
| **Atlas blink** | React state → Reanimated shared value, crossfaded by opacity | correct fix, **no measurable aggregate change** |
| **Atlas `ringProps`** | new-array-per-render → memoised, so `AtlasMarkBody`'s `memo` works | correct fix, **no measurable aggregate change** |
| **AmbientBackground** | memoised | 131 → 0 commits |
| **SVG components** | memoised across the set | −55% commits, −29% duration on Learn |
| **NumberRollup** | stored the string, capped at 24fps | ~70% fewer renders (54 → 13 for XP) |
| **Course loader** | promise cache with rejection eviction | 20 → 2 fetches |
| **News images** | | 831KB → 10.6KB |
| **Logo bundle** | | 3.48MB → 0.79MB |
| **`[store] rehydrate failed`** | log severity only — behaviour was already correct; the error fired on an *expected* static-render rejection and read like a production defect | guarded on `typeof window` |
| **EAS node** | pinned `24.14.1` to match the npm 11 resolver that writes the lockfile | fixed 5 consecutive build failures |
| **`.easignore`** | added; excludes `refs/`, `screenshots/`, `scripts/anim/`, `/ios`, `/android`, all credential patterns | 304MB → 158MB |
| **App icon** | happy Atlas on `#09090D`, composed from the app's own geometry | shipped in build 11 |
| **App Store Connect** | API enabled, team key, widget bundle id, app group, distribution cert, 2 profiles, tester groups, subscription metadata, 3-day trial in 175 territories | all verified via API |

### 5.1 Added 2026-08-22/23 — the feedback session

| area | what changed | evidence |
|---|---|---|
| **The CTA** | `GradientButton` -> `SlabButton`: solid face over a hard-cut slab, zero blur | 19 call sites, `press-feedback-pin` |
| **Order steps (N7)** | DERANGED, not merely "not fully solved". A uniform permutation has ONE fixed point on average regardless of n, so it was handing out ~1 correct answer per question | `order-derangement-pin`, 20,000 orderings |
| **Trial offer (N14/N15)** | one bug, two reports — both routes push `?step=paywall`, which only knew `spent`. A FOURTH state was found: Pro subscribers told to start a trial | `trial-offer-pin` |
| **Daily goal (N6)** | real elapsed minutes, clamped 1–30 | `goal-minutes-pin` |
| **Age floor (N3)** | "Under 13" is OFFERED and BLOCKS. First version guarded only the CTA while single-select AUTO-ADVANCED past it | `age-floor-pin` guards both paths |
| **Em dashes (N1/N23)** | 5 prose instances. Ranges (13–17) and empty-value `'—'` deliberately kept — a blind sweep would have broken 20 correct strings to fix 5 rough ones | `em-dash-prose-pin` |
| **The glow** | last survivor was Home's hero: `shadowColor: accent` at `shadowRadius: 30` | `no-glow-pin`, zero blurred shadows in `src` |
| **League week** | `applyXp` carried ZERO forward at the week boundary, so a finished week was discarded, not resolved. The PROMOTION ZONE line paid nothing | `league-week-pin` |
| **Light mode (N22)** | + `PIXEL_PALETTE_LIGHT`; `compileSprite` is now keyed by sprite AND palette | `theme-alpha-pin` |
| **`hsl()` + alpha** | 88 sites do `theme.x + '30'`. 23 light values were `hsl(...)`; concatenating gives an unparseable string that RN renders at FULL OPACITY, silently | `theme-alpha-pin` scans the call sites |
| **Art maps** | three private id->sprite copies collapsed into `item-art.ts`. `you.tsx`'s was a ternary naming exactly two badges | `shop-catalogue-pin` |
| **Lesson art** | 1030 -> 337 lines. It was also LESS varied than its size implied: keys match on title, titles repeat across courses, so three courses drew one scene in three tints | `lesson-art-pin` |

---

## 6. TOOLING — EXACT RECIPES THAT WORK

### 6.1 Shipping to TestFlight

```bash
./scripts/ship-testflight.sh 86cf89c1-ed5f-441d-9ae4-575aa7433937
```

Builds and submits with no prompts. The issuer id is the only argument; the key id is read from the
filename in `.secrets/`.

| thing | value |
|---|---|
| ASC API key | `NJ4H5Q7248`, App Manager, Team Key, at `.secrets/AuthKey_NJ4H5Q7248.p8` (gitignored) |
| Issuer ID | `86cf89c1-ed5f-441d-9ae4-575aa7433937` |
| Apple Team | `9SS423KXF5` — RAMYA SMITHA CHILAMANTULA (Individual) |
| ASC app id | `6761808087` |
| EAS account | `s-k-28` (`app.json` hard-codes `owner`) |
| Bundle ids | `com.euphoriainv.euphoria`, `com.euphoriainv.euphoria.widget` |
| App group | `group.com.euphoriainv.euphoria` |
| Current build | **12** — the first OTA-capable build. 8-11 can never receive updates. |

**AFTER EVERY SUCCESSFUL SUBMIT YOU MUST ATTACH THE BUILD TO THE TESTER GROUPS.** A build that is
`VALID` but in no group is installable by **nobody**. This is exactly what left builds 6, 7 and 8
processed and invisible for months, and it is the single easiest way to waste a whole build.

```
POST /v1/betaGroups/{groupId}/relationships/builds   body: {data:[{type:'builds', id: buildId}]}
  "Internal Testers"  b0a6793e-891f-4751-aee1-fb013212116a   (internal, no Apple review)
  "Cofounders"        cd11088f-5f96-495a-a766-38bff3d2fc9e   (external, needs Beta App Review)
```

A watcher that polls until the build is `VALID` then attaches it lives at
`scratchpad/watch-latest.mjs` — **but note its bug**: it attaches the *newest* build, and if an older
build is already `VALID` it fires immediately on the wrong one. Filter by the expected version.

### 6.1b DO NOT REBUILD FOR A JS FIX — SHIP IT OVER THE AIR IN ~2 MINUTES

Set up 2026-08-22. **Read this before you cut a single build.** A full build is ~20-25 minutes;
an over-the-air update is ~1-2. Almost every fix in a feedback-driven debug session is JavaScript.

```bash
npx eas update --branch production --environment production --message "what you fixed"
```

Testers force-quit and reopen; the update is live. `--environment` is REQUIRED in
`--non-interactive` mode or the command errors.

| channel | branch | who is on it |
|---|---|---|
| `production` | `production` | everyone on TestFlight |
| `preview` | `preview` | internal-distribution builds |
| `development` | `development` | dev-client builds |

**What OTA CANNOT ship — these still need a real build:** any native module added or removed,
anything in `app.json` that affects the native project (icon, splash, permissions, entitlements,
plugins, bundle identifiers), and any change to `runtimeVersion`. If you are unsure whether a change
is native, it is safer to build.

**runtimeVersion policy is `appVersion`.** An update only reaches builds whose app version matches.
Bump `version` in `app.json` and every existing install stops receiving updates until it is
replaced. Do not bump it casually mid-session.

**Builds 8-11 can NEVER receive updates.** A binary only listens if it was compiled with a channel,
and `expo-updates` did not exist before build 12. **Build 12 is the first OTA-capable build** and
everyone must install it once.

**A bug that WILL bite you if this ever regresses:** `eas update` publishes iOS and Android in ONE
manifest. An invalid Android config rejects the iOS update too. `android.package` was
`com.euphoria.native` and `native` is a reserved Java keyword, so every update failed with an
Android validation error on an iOS-only app. Fixed to `com.euphoriainv.euphoria`. If an update ever
fails for a reason that makes no sense, check the Android half of the manifest.

**Verify the pipeline before you depend on it.** The above was found by publishing a deliberate
no-op update as a test rather than discovering it on the first real fix.

### 6.1c INSTANT ITERATION WITH THE DEV CLIENT

For anyone with a development build installed:

```bash
npx expo start --tunnel      # public URL: phones do NOT need to be on this Wi-Fi
```

Every save appears on every connected phone in under a second, no command and no build. This is the
fastest possible loop and the right default when working live with the owner.

`eas.json` profiles: `development` is the **physical device** build (`developmentClient: true`,
`distribution: internal`, and it must NOT set `ios.simulator`). `development-simulator` is the
simulator variant. The original profile set `ios.simulator: true`, which builds a simulator-only
binary that can never install on a phone.

**Device registration.** `npx eas device:create` prints a QR and a shareable link; one link
registers the whole team. **UDIDs are baked into the binary at build time** — anyone registering
after a build needs a rebuild with `--refresh-ad-hoc-provisioning-profile`. Expo captures the UDID
at registration and syncs it to Apple during the build, so Apple's device list legitimately lags
Expo's; that is not a fault.

**Ad-hoc credentials cannot be created non-interactively.** `eas build --profile development
--non-interactive` fails with "couldn't find any credentials suitable for internal distribution."
The owner must run it interactively **once**; after that the profile is stored on EAS and every
later dev build is non-interactive. Same shape as the distribution-certificate wall.

**Check env vars per environment.** The first dev build warned "No environment variables found for
the development environment" and would have launched with no RevenueCat key, no PostHog and no
Google client ID — an app broken in ways that look exactly like new bugs. All 7 vars now cover
`production`, `preview` and `development`. Add new ones to all three with
`eas env:update --variable-name X --variable-environment production --environment production
--environment preview --environment development`, which never reads or reprints the secret.

### 6.1d STOP PIPING BUILD OUTPUT THROUGH `tail`

`npx eas build ... | tail -30` reports **exit code 0 even when the build failed**, because `tail`'s
status is what the shell sees. This masked two separate failures in one session and cost real time
both times. Grep for the outcome instead:

```bash
grep -aiE "Build failed|Submitted your app|successfully uploaded|Error:" "$LOGFILE" | tail -8
```

### 6.2 Reading an EAS build log — the recipe that actually works

```js
const b = JSON.parse(execSync(`npx eas build:view ${id} --json`).toString());
const t = await (await fetch(b.logFiles[0])).text();   // node fetch decodes brotli natively
const recs = t.split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l));
recs.filter(r => r.phase === 'INSTALL_DEPENDENCIES').forEach(r => console.log(r.msg));
```

`logFiles[0]` is a **short-lived pre-signed URL** served with `content-encoding: br`. Fetch it fresh
each time; it expires. **Do not use `curl` + `gunzip`** — it yields binary garbage and sends you into
a format-archaeology rabbit hole. The log is JSON-lines with `phase` and `msg` fields. A healthy iOS
build walks: `SPIN_UP_BUILDER → INSTALL_CUSTOM_TOOLS → PREPARE_PROJECT → READ_EAS_JSON →
READ_PACKAGE_JSON → INSTALL_DEPENDENCIES → READ_APP_CONFIG → RUN_EXPO_DOCTOR → PREPARE_CREDENTIALS →
PREBUILD → INSTALL_PODS → CONFIGURE_XCODE_PROJECT → EAGER_BUNDLE → RUN_FASTLANE →
UPLOAD_APPLICATION_ARCHIVE`.

**If a build fails, read the log BEFORE changing anything.** Four builds were burned eliminating
candidates because the log was unreadable.

### 6.3 The App Store Connect API helper

`scratchpad/asc.mjs` mints an ES256 JWT and exports `api(path, {method, body})`. Notes learned the
hard way:

- The JWT must be signed with `dsaEncoding: 'ieee-p1363'` — node's default DER is rejected.
- `exp` must be ≤ 20 minutes out. Mint a fresh token per long-running loop iteration.
- Relationship endpoints return **204 with an empty body**; calling `.json()` blindly throws.
- Some relationships forbid `GET_RELATED` (e.g. `builds/{id}/betaGroups`) — query from the other side.
- **App Manager can create bundle ids, certificates, profiles AND manage users.** A previous session
  predicted a 403 on user management and was wrong.

### 6.4 metro-mcp — runtime truth

Always `get_current_route` before trusting a screenshot or profile. `start_profiling` /
`stop_profiling` use the fiber commit hook and work everywhere except lesson navigation, which breaks
them. `evaluate_js` is the sharpest tool available for this codebase — it is how the idle-commit
instrumentation was built. `get_network_requests`, `get_console_logs`, `find_components`,
`get_component_tree` all work.

The console is worth reading unprompted. It is how the dead paywall was discovered — RevenueCat was
logging `None of the products registered ... could be fetched from App Store Connect` on every
launch and nobody had looked.

### 6.5 Project checks

```bash
npx tsc --noEmit            # must exit 0
npm run check               # must pass: motion invariants + market-marks + reduced-motion audit
node scripts/motion-invariants.mjs --selftest    # 11 invariants, asserts 11 caught / 11 ignored
python3 scripts/reduced_motion_audit.py --selftest
```

`npm run check` currently reports **11 motion invariants across 172 files**. Keep it green. Both
selftests exist because a previous session's invariant silently stopped matching after someone
changed an anchor string, and two invariants had zero coverage for a while without anyone noticing.

### 6.6 Simulator

Device `755B55D9-8E4B-431C-9D1D-A635F38CFF5F` (iPhone 17 Pro). URL scheme `euphorianative`.

```bash
xcrun simctl openurl <DEV> "euphorianative:///onboarding?step=paywall"
xcrun simctl io <DEV> screenshot out.png
xcrun simctl terminate <DEV> com.euphoriainv.euphoria && xcrun simctl launch <DEV> com.euphoriainv.euphoria
```

Foreground `sleep` is blocked by the harness. Use `end=$((SECONDS+8)); until [ $SECONDS -ge $end ];
do sleep 1; done` or `run_in_background`.

---

## 6.7 THE TESTER ROSTER, AND HOW TESTFLIGHT ONBOARDING ACTUALLY WORKS

State as of 2026-08-22. Check it with the API before assuming; people install between sessions.

| person | ASC role | TestFlight | note |
|---|---|---|---|
| `siddarthakodithyala28@gmail.com` | ADMIN | **INSTALLED** | the owner |
| `bodlasriyan@gmail.com` | DEVELOPER | **INSTALLED** | cofounder, working |
| `deon.yesudas@icloud.com` | DEVELOPER | INVITED | cofounder, provisioned correctly, had not opened it |
| `zapatoshake@gmail.com` | ACCOUNT_HOLDER, ADMIN | INVITED | never installed |
| `deony.joey@gmail.com` | pending, DEAD | — | **no Apple Account at this address**, see below |

Groups: `Internal Testers` b0a6793e-891f-4751-aee1-fb013212116a (internal, no Apple review) and
`Cofounders` cd11088f-5f96-495a-a766-38bff3d2fc9e (external, needs Beta App Review, unused).

**Hours were lost to this. The rules, learned the hard way:**

1. **An internal tester MUST be an ACCEPTED App Store Connect team member first.** Adding a pending
   invitee to an internal group returns `409 Tester(s) cannot be assigned`. There is no override.
2. **Apple matches invitations to the APPLE ID, not the inbox.** An invite to an address with no
   Apple Account cannot ever be accepted. `deony.joey@gmail.com` had none: Apple offered "Create
   Your Apple Account", the cofounder signed in with his real account instead, and Apple looped him
   back to "Sign in to accept your invitation" forever. Diagnosed from a screen recording. The fix
   was inviting `deon.yesudas@icloud.com`, his actual Apple ID, which worked immediately.
   **ASK FOR THE APPLE ID, NOT "YOUR EMAIL".**
3. **TestFlight uses the Media & Purchases Apple ID, which is a DIFFERENT setting from iCloud.**
   `Settings -> tap your name -> Media & Purchases`. If that differs from the invited address,
   TestFlight shows "Ready To Test" with no apps and nothing will ever fix it but inviting the
   right address.
4. **There is NO redeem code for internal testers.** The "Redeem Code" box in TestFlight is for
   public promo codes. A cofounder tried to type an App Store Connect API key ID into it because it
   appeared in a message that got forwarded. **Never put key ids, issuer ids or any credential in
   text the owner might forward.**
5. **Internal testers do not need the email at all.** Once they are in the group, opening TestFlight
   signed in as the invited Apple ID shows the app automatically. If it does not, the signed-in
   identity is wrong — that is the diagnostic, not a delivery problem.
6. **What this App Manager key CANNOT do:** delete a user invitation (`403 FORBIDDEN`) or create a
   second invite to an address that already has one pending (`409 The email is already being
   used`). A DIFFERENT address has no conflict and works fine. Revoking requires the owner in the
   ASC UI at `appstoreconnect.apple.com/access/users`.
7. `state=INVITED` vs `INSTALLED` is entirely about whether that human tapped the link. You cannot
   move it. `appDevices: []` confirms TestFlight has never seen a device for them.

**If onboarding friction recurs, stop doing it per-person.** Enable a public link on the external
`Cofounders` group: no Apple ID matching, no team membership, anyone installs from one URL. It costs
one Beta App Review (~24h) and needs `betaAppReviewDetail` plus `betaAppLocalizations` filled in.
That is the permanent fix and it was recommended twice.

---

## 6.8 THE WEB APP IS THE DESIGN REFERENCE — LOOK AT IT, REPEATEDLY

**The owner's instruction, verbatim in intent:** connect Claude in Chrome, go through the
euphoriainv.com web app, *see it visually many many times*, and apply the same logic to the iOS app.
Treat the web product as the reference implementation. When a cofounder reports that something in
iOS feels wrong, **the web app is very often the thing they are unconsciously comparing it against.**

**Do this before you start fixing, not after.** Walk the web flows first so you have the reference
in mind, then walk the same flows in the simulator. A large share of "this feels off" feedback
resolves to "this does not match the web app," and you cannot see that without having looked.

### The constraint you must plan around

`euphoriainv.com` is a **MARKETING LANDING PAGE**, not the running product. Verified 2026-08-22.

Public and fetchable with no auth:
`/` `/pricing` `/digest` `/digest/faq` `/digest/support` `/ferpa` `/privacy` `/terms` `/legal`
Nav labels: Features, Courses, Pricing, Digest, Log in, Get started

The lessons, paper-trading simulator, portfolio and Atlas coach are **described** on that page, not
runnable. The real application is behind **"Log in"**.

**You cannot sign in.** Entering a password is prohibited in every session regardless of
authorisation. So:

- **Public pages**: browse freely, screenshot freely, no help needed. Copy, pricing, positioning,
  FERPA and legal wording all live here and are directly comparable to in-app copy.
- **The authenticated app**: the OWNER must log in once in the connected Chrome and leave the
  session alive. Ask for that at the START of the session, not when you hit the wall — an expired
  session mid-flow wastes a whole investigation.

### How to use Chrome well here

Load the tools in ONE ToolSearch call — `tabs_context_mcp,navigate,computer,read_page,
tabs_create_mcp,tabs_close_mcp` — never one per call. Then use `browser_batch` to chain
navigate/wait/screenshot in a single round trip; separate calls are dramatically slower and this is
a workflow where you will take dozens of screenshots.

Known failure modes hit in the previous session:
- **The extension disconnects.** `list_connected_browsers` returning `[]` means Chrome must be
  running with the Claude extension enabled and signed into the same account. You cannot reconnect
  it yourself; ask.
- **Screenshots can be permission-blocked per domain** even when navigation works. `get_page_text`
  sometimes still succeeds where `computer:screenshot` is refused — try it before giving up.
- Screenshot coordinates go stale if the window resizes between the screenshot and the click. A
  batch that resizes mid-sequence will click the wrong place; re-screenshot after any resize.
- Decline cookie/consent banners (most privacy-preserving option) rather than accepting.

### Building the comparison

For each surface you touch, capture the web version and the iOS version and put them side by side
before deciding what "correct" means. Save them under `refs/webapp/` so the comparison survives
context compaction and the owner can check your reasoning. Where they differ, the web app wins
unless there is a platform reason it should not — and if you deviate, write down why.

---

## 6.9 THE SIMULTANEOUS WEB / iOS COMPARISON — RUN THIS PER ITEM

The owner's explicit instruction: hold the web app and the iOS app open **at the same time** and
work item by item across both. Not a one-off tour at the start — a continuous side-by-side for the
whole session. Cost and context are explicitly not a constraint here; he said so directly.

**The standing setup, established once at session start:**

1. Chrome connected, owner logged into the web app (he must do the login; you cannot).
2. Metro running and the iOS app live in the simulator, or the dev client on a device.
3. `refs/webapp/` created for captures.

**Then, for every single feedback item:**

| step | what |
|---|---|
| 1 | Read the cofounder's screenshot. Do not skip to the caption. |
| 2 | Reproduce it on **iOS**. Verify the route with `get_current_route` before trusting any capture. |
| 3 | Open the **same surface on the web app** and capture it. |
| 4 | Put the two side by side and decide what "correct" actually is. |
| 5 | Fix, then re-capture iOS and compare against the web capture again. |
| 6 | Save both into `refs/webapp/<item-number>-{web,ios}-{before,after}.png`. |

**Why this ordering matters.** A cofounder saying "this feels off" is usually comparing against the
web product without realising it. If you fix iOS in isolation you will produce something that is
merely *different* rather than *consistent*, and the same person will report it again next round.
The web capture is what turns a vague complaint into a specific, checkable target.

**Where they disagree, the web app wins** — unless there is a genuine platform reason (touch
targets, safe areas, native navigation idiom, iOS HIG). When you deviate, write the reason into the
log row. An undocumented deviation is indistinguishable from an oversight to the next reader.

**Build the comparison sheet as you go, not at the end.** Context will compact during a session
this size; the files in `refs/webapp/` are what survive, and they are also how the owner audits
your judgement without re-testing everything himself.

---

## 6.9b THE OPENING RITUAL — WALK THE WEB LESSONS BEFORE YOU FIX ANYTHING

**The owner's instruction, and the reason for it:** the cofounders reference the web app constantly.
When they say a lesson "should work like this" or "feels different," they mean the web product. You
cannot interpret their feedback correctly without having seen what they saw. **Chrome stays open for
the entire session, positioned beside the simulator, not opened ad hoc when you get stuck.**

**Do this before touching the feedback list. It is not optional and it is not a shortcut you may
skip because the list looks urgent.** An hour spent here makes every subsequent item faster, because
half of "this feels off" resolves instantly once you have the reference in your head.

### The walkthrough

Ask the owner to log in first — you cannot (§6.8). Then walk, capturing every screen into
`refs/webapp/` with names that say what they are:

1. **A full course, end to end.** Not one lesson — a whole course. Course list → course detail →
   lesson intro → every step type → completion → reward. The iOS lesson runner has 25-step lessons
   with comprehension checks, explorable content, type-the-number calculator steps and reward
   sequences. **Find each of those on the web and capture it.** These step types are exactly where
   "it works differently" reports come from.
2. **The lesson intro screen** specifically. Atlas, the speech bubble, the title, "N steps · N XP",
   "YOU'LL LEARN", the Continue button. The owner already reported Atlas taking ~1.5s to appear on
   iOS. Time the web equivalent — if it is instant there, that is your target and your proof.
3. **Wrong-answer and right-answer paths.** Deliberately fail a check. Capture what the web does:
   copy, timing, whether it advances, what Atlas does. This is high-frequency feedback territory.
4. **Progress, streak and XP surfaces.** Anything numeric is where "the number is wrong" reports live.
5. **The paywall and pricing.** `/pricing` is public so you can capture it with no login at all.
   Compare the tiers, the copy, the trial terms and the prices against the iOS paywall — iOS
   hardcodes `$9.99` / `$79.99` at `onboarding.tsx:73-74`, so a web/iOS price divergence is possible
   and would be a serious bug nobody has checked.
6. **Sign in / sign up.** The web has real accounts. iOS has none — `auth.tsx` says so outright.
   That gap will generate feedback; understand the web version before you respond to it.
7. **Digest.** `/digest`, `/digest/faq`, `/digest/support` are public.

### What to record while walking

Keep a running `refs/webapp/WALKTHROUGH.md` as you go, one row per screen: web capture path, the
matching iOS route, and any difference you notice **before** anyone reports it. Differences you spot
proactively are worth more than the ones in the doc, because they are the reports you have not
received yet.

**Do not summarise a screen you did not open.** `AGENTS.md` opens with a paywall redesign that was
built, shipped and reverted because a flow *description* was treated as evidence. The same failure
is available here and it is the single most expensive mistake this project has made.

---

## 6.10 THE VERIFICATION PROTOCOL — NO ITEM CLOSES WITHOUT ALL OF IT

The owner asked for a heavy, explicit verification process. This is it. **Every gate applies to
every item.** An item that skips a gate is `ready-for-verification`, never `verified`.

### Gate 0 — Reproduce it first

**You may not fix what you have not seen fail.** Reproduce on the simulator, capture the broken
state, and attach it to the log row. If you cannot reproduce, that is a finding to report, not a
licence to fix speculatively. Per §1.6 you still believe the tester — but "cannot reproduce" changes
the fix from a code change to a "why did this happen for them and not me" investigation
(device vs simulator, build 12 vs older, account state, network).

### Gate 1 — Route verification before ANY capture

Call `get_current_route` and confirm the route name before trusting a screenshot or a profile.
Three findings in this project were fabrications from capturing a screen the app was never on.
Non-negotiable, every time.

### Gate 2 — The fix compiles and the suite is green

```bash
npx tsc --noEmit                              # must exit 0
npm run check                                 # motion invariants + market-marks + reduced-motion
node scripts/motion-invariants.mjs --selftest # 11 caught / 11 ignored
python3 scripts/reduced_motion_audit.py --selftest
```

### Gate 3 — Visual proof, after

Re-capture the same surface, same route, and put before/after side by side. For anything animated a
still frame is insufficient — record it. `scripts/anim/capture.py::record_transition()` refuses to
film unless the trigger provably navigated; use it rather than hand-rolling.

### Gate 4 — Web parity

Capture the equivalent web surface (§6.9) and confirm the fix moved iOS **towards** it. If you
deliberately diverged, the reason goes in the log row.

### Gate 5 — Regression sweep

Ask what else touches the code you changed. `grep` every caller. A fix that repairs one screen and
breaks its sibling is a net loss, and this codebase has produced exactly that: a `STAGGER_CAP`
import missed in three files, and a partial patch that left `belowFold` undefined — both broke the
build immediately.

### Gate 6 — Review agents

`ecc:code-reviewer`, `ecc:security-reviewer`, `ecc:react-reviewer` over the batch diff before it
ships. Authorised standing for the session (§1.5).

### Gate 7 — Shipped and reachable

`eas update` for JS, a build for native. **Then confirm the tester can actually receive it** — a
`VALID` build attached to no group is installable by nobody, and OTA only reaches build 12+.

### Gate 8 — THE OWNER CONFIRMS ON HIS PHONE

Only he moves a row to `verified`. Your screenshot is evidence the fix is ready, never proof it
works. Batch items and tell him precisely what to look at and where.

### Gate 9 — Per-batch integrity check

Before any batch ships, in one pass:

```bash
npx tsc --noEmit && npm run check
node scripts/motion-invariants.mjs --selftest
python3 scripts/reduced_motion_audit.py --selftest
git status --porcelain          # nothing unexpected, no stray files
git log --oneline origin/main..HEAD   # every commit intentional
```

Then re-read your own diff (`git diff origin/main`) line by line before pushing. Not the summary —
the diff. Two build breaks this session came from partial patches that read fine in summary.

### Gate 10 — End-of-session full sweep

Before declaring the session done:

1. Every row in `refs/FEEDBACK_LOG.md` is `verified` or `wontfix` with a real reason.
2. Re-walk the **whole app** on the simulator, screen by screen, looking for anything the fixes
   broke. Not the fixed screens — the ones you never touched.
3. Re-walk the **web app** and diff against iOS one final time.
4. A final TestFlight build, attached to both tester groups, confirmed installable.
5. Tell the owner to run `/code-review ultra`, and address what it finds.
6. Update this file and write the transferable lessons into the global `~/.claude/CLAUDE.md`.

### The three lies this protocol exists to catch

1. **"It looks right"** — you captured the wrong screen. Gate 1.
2. **"The test passed"** — the test could not have failed. A clean-clone `npm ci` ran the same npm
   that wrote the lockfile and "proved" it healthy while EAS rejected it four times.
3. **"It's faster now"** — you did not measure. Two Atlas fixes this session were correct defects
   and changed the aggregate by nothing; their commit says so.

---

## 6.11 DRIVING THE SIMULATOR — TWO TOOLCHAINS, USE THE RIGHT ONE

The simulator is **iPhone 17 Pro, `755B55D9-8E4B-431C-9D1D-A635F38CFF5F`**, currently booted.

**metro-mcp — the JS runtime.** Route, component tree, console, network, storage, profiling,
`evaluate_js`. This is the sharper instrument for anything about *behaviour* and it is how the
idle-commit measurements were built. Always `get_current_route` before trusting a capture.

**XcodeBuildMCP — the device and UI layer.** Screenshots, `snapshot_ui`, taps/swipes/typing,
hardware buttons, boot/erase, appearance, log capture, LLDB. Use it for interaction automation and
native-level work.

**Its own rule, from the server instructions:** call `session_show_defaults` **before your first
build/run/test call in the session.** Do not assume defaults are configured. If project/workspace +
scheme + simulator are set, `build_run_sim` can be called with empty arguments; only run
`discover_projs` if defaults are missing or wrong.

**Note `ios/` is gitignored** — it is generated by `expo prebuild` (CNG). There is no checked-in
`.xcworkspace`. UI automation and screenshots against the already-installed app need no workspace;
a native *build* through Xcode does, so run a prebuild first if you need one.

**Plain `xcrun simctl` still works and is often fastest:**
```bash
xcrun simctl io <DEV> screenshot out.png
xcrun simctl openurl <DEV> "euphorianative:///onboarding?step=paywall"
xcrun simctl terminate <DEV> com.euphoriainv.euphoria && xcrun simctl launch <DEV> com.euphoriainv.euphoria
```

**The simulator is the owner's screen.** Restore any route or state you change, in the same call,
and verify the restore.

**Metro is fragile from inside a session.** It was killed four times by task reaping. If it dies,
ask the owner to run `npx expo start` in his own terminal rather than fighting it. Nothing about
`eas update` or TestFlight needs Metro — only the simulator and dev client do.

---

## 6.12 WHICH OF THE 61 DOCS IN refs/ TO ACTUALLY READ

`refs/` holds **204,000 words across 61 files**. You cannot read it and must not try. This file is
the entry point. Read others only on demand:

| read | when |
|---|---|
| **this file** | always, first, in full |
| `AGENTS.md` (repo root) | always — Expo 57 docs rule, ScreensDesign rules, the reverted-paywall cautionary tale |
| `refs/SHIPPING.md` | before any build or submit |
| `refs/TASK_QUEUE.md` | before touching performance; has the corrected item 10 |
| `refs/MOTION_RUBRIC.md` | before changing any animation |
| `refs/VISUAL_VERIFICATION.md` | what looking at the screen caught that nothing else did |
| `refs/MASTER_PLAN.md` (62k) | only to answer a specific product-intent question. Never front to back. |
| `refs/LOOP_LEDGER.md` (34k) | another session's ledger. Historical. Skip unless archaeology is needed. |
| everything else | only if this file names it |

**Do not add another carryover document.** There are already six files with "CARRYOVER" or "HANDOFF"
in the name and their existence is itself a problem. Update **this** file.

---

## 7. ARCHITECTURE ORIENTATION

React Native 0.86.2, React 19.2.3, Expo ~57.0.13, expo-router, reanimated 4.5.1, react-native-svg,
zustand with `persist` over AsyncStorage. React Compiler enabled via `app.json` experiments.
**NativeWind is installed but fully unwired** — there is no `babel.config.js` and `className` does
nothing. Do not reintroduce it without restoring all three hooks together; fewer than all three is a
broken setup because `nativewind/doctor.js` throws.

| file | why it matters |
|---|---|
| `src/app/_layout.tsx` | root. 4 `useEffect`s, `ThemeProvider`, no state. Prime suspect region for §4.1. |
| `src/app/index.tsx` | the hydration gate. Routes only after `hasHydrated`. |
| `src/lib/store.ts` | the zustand store, `persist`, `partialize`, `migrate`, `onRehydrateStorage`. Read the comments — they encode real incidents. |
| `src/components/atlas.tsx` | the mascot. 9 expressions, blink/saccade/arc-flex/breath/sway/rock. Heavily commented with measured reasoning. |
| `src/components/atlas-mark.tsx` | the four-ring vector mark, geometry fitted to the old PNG at IoU 0.951. |
| `src/app/onboarding.tsx` | onboarding **and** the paywall (`?step=paywall`). Hardcoded prices at lines 73-74. |
| `src/app/auth.tsx` | sign up / sign back in. No real account system. |
| `src/app/lesson.tsx` | the lesson runner. Mounted twice at runtime — unexplained. |
| `src/shared/motion/tokens.ts` | `Spring.press/snappy/smooth/bouncy/reward/gentle`, `Duration.*`. Every spring has a documented damping ratio. |
| `src/constants/theme.ts` | `colors.background` is `#09090D`, the same as the splash and now the app icon. |
| `refs/SHIPPING.md` | the shipping runbook written this session. |
| `refs/TASK_QUEUE.md` | the performance investigation log, including the corrected item 10. |

**The comments in this codebase are unusually load-bearing.** They record incidents, measurements and
decisions with dates. Read them before changing the code they sit on; several of them exist
specifically to stop you making a change that was already tried and reverted.

---

## 7.5 PRE-MORTEM — HOW THIS SESSION FAILS, AND WHAT PREVENTS IT

Written before the session, assuming it went badly. Each of these has already happened in some form.

**1. You read the feedback doc's captions instead of its screenshots.** The single most likely
failure, because it is the cheapest path and feels like progress. Every fabricated finding in this
project came from reasoning off a description. *Prevention: Gate 0. Open every image. If you cannot
open one, say so rather than working around it.*

**2. Chrome disconnects and you quietly stop doing web comparison.** The extension dropped mid-
session in the previous run and could not be reconnected from inside. The temptation is to carry on
iOS-only and stop mentioning it. *Prevention: if Chrome dies, SAY SO IMMEDIATELY and ask for a
restart. Do not silently downgrade the workflow the owner explicitly asked for.*

**3. The owner's web login expires and half the reference disappears.** *Prevention: capture the
lesson walkthrough into `refs/webapp/` EARLY, at full coverage. Files survive an expired session;
a live tab does not.*

**4. Context compacts and you lose the thread.** A session with hundreds of screenshots will
compact repeatedly. *Prevention: `refs/FEEDBACK_LOG.md` and `refs/webapp/` are the memory. Update
them after every item, not at the end. If it is not in a file, it does not exist.*

**5. You batch too large and the owner cannot verify.** Twenty fixes in one build is a verification
task he will not complete, so nothing gets marked verified and the log rots. *Prevention: batch by
SCREEN, 5-15 items, and tell him exactly what to look at and where. Make verification cheap for him
or it will not happen.*

**6. You fix symptoms of the idle-render lag one at a time.** Many "feels slow / laggy / delayed"
items share one unsolved root cause (§4.1). Fixing them individually is endless. *Prevention: when
an item smells like it, tag it `perf-root` in the log and group them. Solve the cause once.*

**7. You claim something is fixed that the owner has not seen.** *Prevention: `verified` is his word
only. Yours is `ready-for-verification`. This is the rule he chose deliberately.*

**8. You break something you were not asked to touch.** Two build breaks this session came from
partial patches. *Prevention: Gate 5 and Gate 9. Read the actual diff, grep every caller.*

**9. You spend the session on tooling instead of bugs.** Tonight lost real time to Metro dying four
times, an extension dropping, and a `setsid` that does not exist on macOS. *Prevention: tooling is
not the job. If something fights you twice, route around it or hand it to the owner and move on.*

**10. You go quiet during long work.** *Prevention: report after every batch — what shipped, what he
should test, what you found that nobody reported.*

### What "quality" means for this specific session

Not the number of items closed. It is: **the cofounders re-test and cannot find what they wrote
down**, and they do not find three new things you introduced. A session that closes 40 items and
creates 5 regressions is worse than one that closes 25 cleanly.

---

## 8. DEFINITION OF DONE

The session is complete when **all** of the following hold:

1. Every item in `refs/FEEDBACK_LOG.md` is `verified` or `wontfix` with a real written reason.
2. The owner has confirmed each fix on his phone from a TestFlight build.
3. `npx tsc --noEmit` exits 0 and `npm run check` is green.
4. Specialist review agents have passed over every batch's diff.
5. The owner has run `/code-review ultra` at the very end and its findings are addressed.
6. Transferable lessons are written into the global `~/.claude/CLAUDE.md`.
7. A final TestFlight build is live and attached to both tester groups.
8. `refs/NEXT_SESSION.md` — this file — is updated for whatever comes after.

---

## 9. A NOTE ON WORKING AT MAXIMUM EFFORT

Max effort is not "think longer about everything." It is spending disproportionate care at the small
number of points where being wrong is expensive, and moving fast everywhere else.

For this session the expensive points are: **parsing the feedback correctly** (a misparsed item gets
fixed wrong and nobody notices until the owner re-tests), **not introducing regressions** (this
codebase has a documented history of confident wrong fixes), and **not claiming something is fixed
when it is not** (the owner chose phone-verification precisely because he does not trust
screenshot-verification, and he is right not to).

Everything else — file reads, greps, routine edits — should be fast and batched. Do not deliberate
over which grep to run. Run several.

The single highest-leverage habit from the previous sessions: **when a result looks clean, spend one
more call trying to falsify it.** Nearly every serious error in this project came from accepting a
plausible result. Nearly every real finding came from a second look that contradicted the first.
