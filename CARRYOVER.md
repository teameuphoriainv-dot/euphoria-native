**READ `refs/CARRYOVER_PROMPT.md` FIRST.** It is the current, verified handoff (2026-08-08).
This file is older and parts of it are stale by its own admission; the prompt supersedes it
wherever they disagree.

Continue work on ~/euphoria-native (Euphoria mobile — Expo SDK 57 / expo-router / RN, finance-education app, mascot "Atlas").

TRUST SOURCE OVER THIS DOC. A previous carryover was found actively lying. Read the file before believing any claim about it.

## FIRST FIVE MINUTES
1. `/mcp` → authenticate the **expo** server (installed, unauthenticated).
2. If you need Rive: **Rive.app must be RUNNING** on the desktop. The MCP fails
   `ConnectionRefused 127.0.0.1:9791` otherwise — restarting Claude Code is NOT enough.
3. Run `ecc:skill-stocktake` before reaching for any new tool. See WHY below.

## REPOS — everything pushed, 0 outstanding
- `~/euphoria-native` → `teameuphoriainv-dot/euphoria-native`, branch `main`.
- `~/euphoriaweb-current` → `teameuphoriainv-dot/euphoriaweb-mobile-source`, branch `master`.
  SOURCE OF TRUTH for Digest content. `scripts/sync-digest.sh` generates the app's digest-*.ts
  from it and defaults to this path.
- **DO NOT MERGE the original `euphoriaweb` repo.** Its master diverged to an INCOMPATIBLE SCHEMA:
  `excerpt` removed, `keyPoints[]` added, hero keys renamed (`cover-credit-score` → `credit-card`),
  new `>>>` callout syntax. Merging + re-syncing breaks mobile three ways — no excerpts on Digest
  cards, hero lookups resolving to blank art, `>>>` rendering as literal text. Our work is parked on
  its `digest-mobile-source` branch as backup.
- Two GitHub accounts are authed. **`teameuphoriainv-dot` must be ACTIVE** or pushes 404 with
  "Repository not found" (GitHub hides private repos from the wrong account).

## TOOLING INSTALLED 2026-08-04 — USE IT, IT REPLACES SLOW LOOPS
- **XcodeBuildMCP** ✔ connected. Has **`semantic-tap`** — taps ACCESSIBILITY ELEMENTS, not pixels.
  Three separate mis-taps by guessed coordinate wasted real money on 2026-08-03. Stop using raw
  `idb ui tap` with computed points. It also bundles AXe, so `~/.idb-venv/bin/idb` is now optional.
- **metro-mcp** ✔ connected. Console/network + **eval in the live JS runtime**, no browser.
- **context7** ✔ connected. Versioned docs — use it for Reanimated 4, react-native-svg, Expo 57
  rather than trusting model memory.
- **expo plugin** (22 official skills: expo-router, eas-simulator, expo-upgrade…). Needs `/mcp` auth.
- **sharp** — RENDER ANY SVG HEADLESSLY. This was the missing loop; every cover on 2026-08-04 was
  reviewed via a simulator round trip that this does in milliseconds:
  `node -e "require('sharp')('path/to.svg',{density:300}).png().toFile('/tmp/x.png')"`
- Also installed: **svgo** (normalise, `--pretty` keeps output diffable), **style-dictionary**
  (palette fix, see below), **odiff-bin** (screenshot diffing).
- `skillListingBudgetFraction` raised to **0.05** in ~/.claude/settings.json (backup `.bak`).
  With ~868 skills and a default ~1% budget, most skills were INVISIBLE unless named exactly.
  `everything-claude-code` was already disabled and was never the cause.

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
- sync-digest.sh REJECTS em dashes in post bodies and validates readMinutes against word count.
- The Digest renderer supports ONLY `##`, `>`, `- `, `**bold**`, `![alt](heroKey)`.
  Single-asterisk italics render as LITERAL ASTERISKS.

## DEV SURFACES BUILT — these exist, use them
- **`euphorianative://dev-gallery`** — EVERY art system on one screen: 54 digest figures, 108 icons,
  7 crests held+locked, Atlas at every shipping size/expression, lesson art. It caught three real
  defects invisible screen-by-screen (a washed-out cover, a failed amber accent, a regressed figure).
  Judge palette HERE, change at source.
- **`euphorianative://dev-beat`** — replays the Digest finish beat in isolation (Replay ~201,821pt).
  Tuning via the real reader is impossible: the reward only fires on a FIRST read.
- **Filmstrip method** — `xcrun simctl io $U recordVideo --codec h264 out.mp4`, then
  `ffmpeg -ss <t> -t <d> -i out.mp4 -vf "fps=60,scale=210:-1,tile=4x3" strip.png`.
  A STILL FRAME CANNOT JUDGE MOTION. **Use fps=60** — sampling at 8–11fps is too coarse to read a
  velocity curve and caused two misjudgements.

## MOTION — the researched answer (refs/MOTION_RESEARCH.md, sourced)
Brilliant and Duolingo BOTH author motion in **Rive**. Brilliant's Rive drives their streak
celebration and explicitly replaced Lottie, After Effects, native code and GIFs. NEITHER publishes a
motion token system — their system IS the state machine. The gap is not mistuned springs; it is that
we express motion in code at all.
- Runtime already owned: `rive-react-native` installed, `atlas-rive.tsx` fires state-machine inputs,
  contract is artboard `Atlas` / `State Machine 1` / trigger `celebrate`.
- **ONLY THE ASSET IS WRONG**: `assets/atlas.riv` wraps the raster atlas-logo.png the app replaced.
  Brief ready at `refs/ATLAS_RIVE_BRIEF.md`. riveanimator.com publishes mascot from **$250**.
- **JUDGE MOTION IN RELEASE, NOT DEBUG.** Debug builds are laggy at 120fps. Every animation assessed
  on 2026-08-03 ran in a debug dev client and is therefore unreliable evidence.
- Apple springs → Reanimated (mass 1): reward pop = **stiffness 322 / damping 19.7**. The finish beat
  uses stiffness 82 — roughly 4× too soft.
- Unused Reanimated capability, ranked: **Layout Animations** (`entering`/`exiting`/`layout` — gives
  EXIT and REFLOW animations we have none of), **interruptibility** (`withSequence` SNAPS when
  retargeted mid-flight; our reward pops lean on it), **haptics at the APEX** not the start,
  **Perf Monitor's UI-vs-JS FPS split**. SKIP Shared Element Transitions (experimental, build flag).

## BIGGEST OPEN ITEM — the lesson player
`lesson.tsx` renders HARDCODED demo content. Every lesson in every course opens
"FOUNDATIONS · LESSON 9 · What is a stock?" — verified on device. Meanwhile `src/lib/curriculum/`
holds 12 courses / 300 lessons / **5,341 real steps** across 24 step types, lazily loadable, unused.
Decisions already taken: use the data's `lesson.xp` (30, not the hardcoded 50); FIX unrendered step
types rather than skipping them. Coverage: static/text types 41% of steps, single-choice family
(quiz/microCheck/fillBlank/scenario) 25%, reuse-existing-components 23%.

## PALETTE — measured, and worse than it looked
Counted across `src/ assets/ scripts/`: **EIGHT violets over ~1,200 hex literals** —
`#5b21b6`×353, `#a855eb`×233, `#a451e6`×196, `#c89cf5`×145, `#b862ed`×143, `#e7d5fb`×53,
`#bb83f1`×48, `#332b4a`×35, plus two greens and two ambers. The Digest composer's `#C89CF5`/`#5B21B6`
appear NOWHERE in theme.ts. **style-dictionary is installed** — one `tokens.ts` feeding both the app
and the cover generator is the fix, and `/dev-gallery` verifies all 54 figures in one screenshot.

## ALSO OPEN
- Digest figures still lean on stacks-and-blocks; the two strongest (`cover-exchange`,
  `cover-credit-score`) are the two that are specific OBJECTS. Vocabulary, not execution.
- No backend at all. No fetch anywhere in src. `auth.tsx signIn()` flips a local boolean.
  Everyone in `src/lib/people.ts` is FABRICATED — nothing user-facing may call them real.
- No IAP wiring, so the paywall cannot take payment.
- Home's portfolio ($104,237.55) is mock; no portfolio state exists.
- Legal links reachable only from the paywall, not Settings/You. `Linking.openURL` throws the user
  out to Safari — `expo-web-browser` would keep it in-app (not installed).
- Friend Streak deferred; the follow graph it needs exists.
- You still reads as a settings list; Duolingo puts settings behind a gear.
- Digest reader is PAGINATED (tap-through cards) — structurally like a lesson, possibly wrong for a
  reading surface. Unresolved design question.
- No free tool exists for RN visual regression, bundle analysis, startup-time, or iOS a11y auditing.
  Searched and confirmed absent.

## ENVIRONMENT
- **USE `Euphoria QA` = 61F7E882-C226-4E97-9918-9BFF536B9A90. `export EUPHORIA_UDID` in every shell.**
  This line used to name F448825D (iPhone 17). That is a **STALE Aug-3 dev client with ZERO
  expo-blur and ZERO RevenueCat** — the exact binary that made the gate sheet render nothing and
  cost two sessions (MASTER_PLAN §22 C37, C51). It is also the sim that is booted by default, so
  without EUPHORIA_UDID `sim.sh` picks it silently. Euphoria QA is the Aug-7 build: 1073 RevenueCat
  strings, 11 ExpoBlur. Check any dev client with
  `strings <app>/euphorianative.debug.dylib | grep -c RevenueCat`.
- Metro on :8082; the app defaults to :8081, so redirect with:
  `xcrun simctl openurl $U "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082"`
- Screenshot coords are POINTS = px / 3 — but prefer XcodeBuildMCP's `semantic-tap` over coordinates.
- The floating gear top-right is the EXPO DEV CLIENT button. It does not ship. Do not fix it.
- `/ios` is gitignored and regenerated by prebuild. `CADisableMinimumFrameDurationOnPhone` is true
  there (from Expo's template, not our config) so 120Hz is not capped — pin it in app.json if paranoid.

## HOW TO WORK (the user's stated rhythm)
- ONE thing per cycle, done perfectly. Plan first, then build.
- STOP AND ASK at every judgement call: copy, pricing, naming, taste.
- VERIFY BEHAVIOUR ON DEVICE. Open every screenshot. Never infer a screen from an exit code, and
  never infer an animation from a still.
- **SEARCH THIS CODEBASE AND THE INSTALLED SKILLS BEFORE REACHING OUTWARD.** True SEVEN times in one
  session: multicolour icons + Card tint (You page), DIGEST_CATEGORIES (chips), rive-react-native
  (mascot), gen-digest-covers.mjs (illustrations), the primitive library (figure redesign), the
  configured rive + Figma MCP servers, and `ecc:skill-stocktake` itself — the tool for finding
  installed-and-forgotten things was installed and forgotten. ChatGPT Images was tried for covers and
  returned glossy 3D clay twice, ignoring both an explicit flat-vector instruction and an attached
  reference of the real artwork; the in-repo generator beat it outright.
- COST WAS NOT CONTROLLED. The 2026-08-03/04 session cost **~$285**. Flag it early, give an estimate
  before any expensive sequence, and prefer one question over ten tool calls.
