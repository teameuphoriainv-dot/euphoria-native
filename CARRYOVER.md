Continue work on ~/euphoria-native (Euphoria mobile — Expo SDK 57 / expo-router / RN, finance-education app, mascot "Atlas").

TRUST SOURCE OVER THIS DOC. A previous carryover was found actively lying. Read the file before believing a claim about it.

## REPOS — all pushed, nothing outstanding
- `~/euphoria-native` → github.com/teameuphoriainv-dot/euphoria-native, branch `main`. 0 unpushed.
- `~/euphoriaweb-current` → NEW private repo `euphoriaweb-mobile-source`, branch `master`. 0 unpushed.
  This is the SOURCE OF TRUTH for Digest content; `scripts/sync-digest.sh` generates the app's
  digest-*.ts from it and defaults to this path.
- DO NOT MERGE the original `euphoriaweb` repo. Its master diverged to a DIFFERENT SCHEMA: `excerpt`
  removed, `keyPoints[]` added, hero keys renamed (`cover-credit-score` → `credit-card`), new `>>>`
  callout syntax. Merging + re-syncing breaks mobile three ways — no excerpts on Digest cards,
  hero lookups resolving to blank art, `>>>` rendering as literal text. Our work is also parked on
  its `digest-mobile-source` branch as a backup.
- `~/euphoriaweb-current` WAS a shallow clone; it has been `--unshallow`ed. fsck clean.

## HARD INVARIANTS — breaking any of these is silent
- Anything added to store state MUST go in `partialize` or it does not persist.
- Every XP award funnels through `applyXp()` in store.ts. Never write `xp` directly.
- If you stamp `lastActiveDay`, you MUST also roll `minutesToday` — `minutesDoneToday()` gates on
  `lastActiveDay === today`, so stamping over a stale tally reports yesterday's minutes as today's.
- NEVER select a zustand getter that builds an object/array: `useApp(s => s.friendIds())` returns a
  fresh array → unstable snapshot → "Maximum update depth exceeded". A getter returning a NUMBER is safe.
- `Icon` name is an UNTYPED string; getIconSvg falls back silently (euphoria-icons.ts:138). `UIcon` is typed.
- Generated, never hand-edit: `src/lib/curriculum/**`, `src/lib/digest-{content,bodies,heroes}.ts`.
- `src/lib/league.ts` tier colours deliberately override violet-only WITH USER APPROVAL.
- LeagueCrest renders at 104px AND 38px. 104 can look right while 38 is mush.
- Digest figures live in the WEB repo (`scripts/gen-digest-covers.mjs`), not here. Edit there, re-sync.
- sync-digest.sh REJECTS em dashes in post bodies. It also validates readMinutes against word count.
- The Digest renderer supports ONLY `##`, `>`, `- `, `**bold**`, `![alt](heroKey)`. Single-asterisk
  italics render as literal asterisks.

## SHIPPED 2026-08-03/04 (13 commits, all verified on device)
- Onboarding: removed the unsubstantiated "4× faster" efficacy claim.
- Digest tab rebuilt: honest "done for today" completion state (derived from dailyPick + readPosts,
  no new persisted field), category chips replacing the accordion, illustrated cards at 62px.
- `markPostRead` now advances the streak (+ rolls minutesToday — see invariant above).
- Smart Brevity renderer: section labels ("Why it matters", "The catch", "The bottom line") render as
  violet uppercase ANCHORS not headings; opening line renders as a 21px lead; prose 16.5→18/29.
- 5 new guides written punchline-first (20 → 25 posts), mapped in GUIDE_LESSONS, check script passes.
- 5 original cover figures composed from the generator's primitives.
- Per-category accents: teal Markets, rose Credit, emerald Investing; violet elsewhere and always
  for structure. LIT/MID/HI are `let`, reassigned per figure by the writer — a whole-library recolour
  costs zero builder edits.
- Digest finish beat + the filter cascade (the filter previously had NO feedback at all).

## DEV TOOLING BUILT — use these, they are the point
- `euphorianative://dev-gallery` — EVERY art system on one screen: 54 digest figures, 108 icons,
  7 crests held+locked, Atlas at every shipping size/expression, lesson art. It has caught three
  real defects that were invisible screen-by-screen. Judge palette here, change at source.
- `euphorianative://dev-beat` — replays the Digest finish beat in isolation with a Replay button
  (~201,821pt). Tuning through the real reader is impossible: the reward only fires on a FIRST read.
- Filmstrip method: `xcrun simctl io $U recordVideo --codec h264 out.mp4`, then
  `ffmpeg -ss <t> -t <d> -i out.mp4 -vf "fps=60,scale=210:-1,tile=4x3" strip.png`.
  A STILL FRAME CANNOT JUDGE MOTION. Sampling at 8-11fps is too coarse — use fps=60.

## THE MOTION ANSWER (researched, sourced — refs/MOTION_RESEARCH.md)
Brilliant and Duolingo BOTH author motion in Rive. Brilliant's Rive drives their streak celebration
and explicitly replaced Lottie, After Effects, native code and GIFs. NEITHER publishes a motion token
system — their system IS the state machine. So the gap is not mistuned springs, it is that we express
motion in code at all.
- We already own the runtime: `rive-react-native` installed, `atlas-rive.tsx` fires state-machine
  inputs, contract is artboard `Atlas` / `State Machine 1` / trigger `celebrate`.
- ONLY THE ASSET IS WRONG: `assets/atlas.riv` wraps the raster atlas-logo.png the app replaced.
  Brief ready at `refs/ATLAS_RIVE_BRIEF.md`; riveanimator.com publishes mascot from $250.
- JUDGE MOTION IN RELEASE, NOT DEBUG. Debug builds are laggy at 120fps. Every animation assessed on
  2026-08-03 ran in a debug dev client, which is not representative.
- Apple springs → Reanimated (mass 1): reward pop = stiffness 322 / damping 19.7. Our finish beat
  uses stiffness 82 — roughly 4× too soft.
- Unused Reanimated capability, ranked: Layout Animations (`entering`/`exiting`/`layout` — gives
  EXIT and REFLOW animations we have none of), interruptibility (`withSequence` SNAPS when retargeted
  mid-flight and our reward pops lean on it), haptics fired at the animation APEX, Perf Monitor's
  UI-vs-JS FPS split. SKIP Shared Element Transitions (experimental behind a build flag).

## BIGGEST OPEN ITEM
`lesson.tsx` renders HARDCODED demo content. Every lesson in every course opens
"FOUNDATIONS · LESSON 9 · What is a stock?" — verified on device. Meanwhile `src/lib/curriculum/`
holds 12 courses / 300 lessons / **5,341 real steps** across 24 step types, lazily loadable, unused.
Decisions already made for this build: use the data's `lesson.xp` (30, not the hardcoded 50), and
FIX unrendered step types rather than skipping them. Coverage math: static/text types = 41% of steps,
single-choice family (quiz/microCheck/fillBlank/scenario) = 25%, reuse-existing-components = 23%.

## ALSO OPEN
- `cover-glide-path` was strengthened but the whole figure set still leans on stacks-and-blocks.
- No backend at all. No fetch anywhere in src. `auth.tsx signIn()` flips a local boolean.
  Every person in `src/lib/people.ts` is FABRICATED — nothing user-facing may call them real.
- No IAP wiring, so the paywall cannot take payment.
- Home's portfolio ($104,237.55) is mock; no portfolio state exists.
- Legal links reachable only from the paywall, not Settings/You.
- Friend Streak deferred; the follow graph it needs exists.
- You still reads as a settings list; Duolingo puts settings behind a gear.
- Digest reader is PAGINATED (tap-through cards) — structurally like a lesson, which may be wrong
  for a reading surface. Unresolved design question.
- `theme.ts` carries FIVE violets and the Digest composer's `#C89CF5`/`#5B21B6` appear in none of
  them. Palette unification at source is the outstanding systemic fix; /dev-gallery verifies it in
  one screenshot.

## ENVIRONMENT
- Dev-client build installed on sim F448825D-AF20-48D2-890A-516C12012CA7.
- Metro on :8082; the app defaults to :8081, so redirect with:
  `xcrun simctl openurl $U "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082"`
- idb at `~/.idb-venv/bin/idb`. Screenshot coords are POINTS = px / 3.
- The floating gear top-right is the EXPO DEV CLIENT button. It does not ship. Do not fix it.
- Two GitHub accounts are authed; `teameuphoriainv-dot` must be the ACTIVE one or pushes 404.

## HOW TO WORK (the user's stated rhythm)
- ONE thing per cycle, done perfectly. Plan first, then build.
- STOP AND ASK at every judgement call: copy, pricing, naming, taste.
- VERIFY BEHAVIOUR ON DEVICE. Open every screenshot. Never infer a screen from an exit code.
- BEFORE reaching for a library or an external tool for a visual problem, SEARCH THIS CODEBASE.
  This was true FIVE times in one session: multicolour icons + Card tint (You page), DIGEST_CATEGORIES
  (chips), rive-react-native (mascot), gen-digest-covers.mjs (illustrations), and the primitive library
  (figure redesign). ChatGPT Images was tried for covers and returned glossy 3D clay twice, ignoring
  both an explicit flat-vector instruction and an attached reference of the real artwork.
- COST MATTERS AND WAS NOT CONTROLLED. The 2026-08-03/04 session cost ~$256. Flag it early, give
  estimates before expensive sequences, and prefer one question over ten tool calls.
