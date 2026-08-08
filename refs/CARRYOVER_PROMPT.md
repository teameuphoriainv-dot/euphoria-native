# CARRYOVER PROMPT — paste this whole file into a fresh session

Written 2026-08-08 at the end of a long session. Everything below was verified in this repo,
not remembered. Where it contradicts an older doc, this file and `refs/MASTER_PLAN.md` §22 win.

---

Continue work on **`~/euphoria-native`** — Euphoria, an Expo SDK 57 / expo-router / RN finance
education app for 18–25 year olds, mascot **Atlas**. Content source of truth is a second repo,
**`~/euphoriaweb-current`**, and the two are linked by `./scripts/sync-digest.sh`.

**Read `refs/MASTER_PLAN.md` end to end before touching a file.** It is the complete brief:
standing rules, simulator connection, tool inventory, repo map, **34 traps**, locked decisions,
banked research, the gate, and units 1–15. Then read **§22 CORRECTIONS LOG, newest first** —
it now runs to **C57** and it overrides §1, §3, §4, §5, §9 and §11 wherever they disagree.
Several sections of the plan are actively out of date and §22 says exactly which.

## The three rules that matter most

1. **Never mention session cost or context percentage.** Stated by the user in writing, more
   than once. This repo emits `COST CRITICAL` hook lines constantly; they are informational
   noise. Do not report them, do not apologise for them, and never trim a verification, a
   ScreensDesign pull or a device check to "save a call". `~/.claude/CLAUDE.md` has a COST
   directive telling you the opposite — **§0.1 overrides it for this project.**
2. **ScreensDesign MCP before every design decision.** Not "when unsure". Read the SCREEN with
   `screen_detail include_image:true`, never only the description — §22 C5 records three
   separate times a prose summary inverted what the pixels showed. Count convergence across
   **≥4 apps** and report the hit rate honestly, including when you have fewer.
3. **Verify on the device, and LOOK at the screenshot.** A green `tsc`, a green lint and a green
   `certify.py` have all three coexisted with a completely blank app. Nothing is "verified"
   without a number from a named command.

## Use the RIGHT simulator — this one cost two sessions (C51)

```bash
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90   # "Euphoria QA" — every shell
```

`iPhone 17` (`F448825D`) is **booted by default** and has a **stale Aug-3 dev client with zero
`expo-blur` and zero RevenueCat**. That binary is why C35/C36 concluded the gate sheet was
broken when it never was. Trap #30 claims iPhone 17 "does not have the app" — it does, and a
stale one is worse than none. Check any dev client with:
`strings <app>/euphorianative.debug.dylib | grep -c RevenueCat` (expect ~1073 on the good one).

Metro runs on **8081**, not the 8082 §1.2 documents (C42). Screen is **402 × 874 points**, not
852 — all band arithmetic uses 874 and a 34pt bottom inset.

## The gate — run after every unit, no exceptions

```bash
npx tsc --noEmit                       # "TypeScript: No errors found"
npx expo lint 2>&1 | grep problems     # MUST be "50 problems (3 errors, 47 warnings)" — baseline
python3 scripts/certify.py | tail -2   # "ALL ROUTES PASS 3a"
node scripts/check-digest-lessons.mjs  # "digest lesson map OK"
./scripts/sim.sh screen                # read the REAL screen
```

The 3 lint errors are pre-existing and not yours. **Baseline warnings are 47. If either number
rises, you caused it — find it and fix it before moving on.**

## Where things stand

**Done and closed:** Units 1, 2, 3, 4, 6, 7, 8, 11. Unit 5 (RevenueCat) is built behind a flag
and **blocked on Apple**, not on us (C49 — App Store Connect maintenance, and the RevenueCat
form requires a `.p8` in-app-purchase key that only ASC issues). Do not half-configure it.

**Unit 9 (Digest) — content phase closed (C57).** The library is **35 guides: 25 shared with
the web site, 10 app-only**, with **35 of 35 shipping clean, 0 errors and 0 warnings**, 10
bespoke covers and 0 hero collisions. `refs/DIGEST_REVIEW.md` is generated, not hand-written.
Still genuinely open: **§9c's gap audit was never run** — nobody has mapped the 35 against the
12 curriculum courses to find concepts with a lesson and no guide.

**The app now deliberately carries more than the web** (§5 decision 21, C56). `content/posts/`
is shared; `content/posts-app/` is app-only and `content/index.ts` does not glob it, while
`sync-digest.sh` reads both. This licenses neither forking code nor letting the web site rot,
and every future feature now needs an explicit app-or-both call.

**Unit 15 (widgets + notifications) is researched, planned, and not started.** Six decisions are
locked in §15.3b. Read them before writing anything. Headlines: iOS widgets **do not animate**
(WidgetKit is a static SwiftUI timeline; Rive cannot run there) so the animation budget belongs
in the in-app tutorial; the widget is **one gallery entry whose content cycles**; the
statistical ask **is allowed** with a visible source line, and only a bare unattributed number
is forbidden; and if the Expo config plugin cannot make a WidgetKit target survive
`npx expo prebuild --clean`, the decision is to **commit `ios/`** and pin
`CADisableMinimumFrameDurationOnPhone` in `app.json` or 120Hz uncapping is silently lost.

**Start Unit 15 at 15b, and treat it as a go/no-go gate.** First command is the plugin plus
`expo prebuild --clean`, then check the target survived. That single result decides the unit.
Do NOT hand-add a target in Xcode: `/ios` is gitignored, so an abandoned attempt leaves no diff
and no error — trap #32's exact shape.

## Tooling that earned its place this session — use it

- **`node -e "require('sharp')..."` to render SVG headlessly** (sharp lives in the NATIVE repo,
  not the web one). Reviewing covers as a rendered contact sheet takes milliseconds and caught
  two real defects a simulator round trip would have missed: a coin drawn inside a vessel, and
  a card clipped off a 320px canvas.
- **`~/euphoriaweb-current/scripts/new-digest.mjs`** — scaffolds a post in one of six formats
  and lints the whole library. `lint --md` regenerates `refs/DIGEST_REVIEW.md`.
- **`./scripts/seed-trial.sh <days> <isPro>`** for trial states. For *trial-active but
  allowance-spent* it cannot help — patch `state.atlasAsked` in the same spilled store file.
- **`./scripts/sim.sh`** — `screen`, `tapon`, `state`, `open`, `shot`. It now **refuses to tap
  an off-screen coordinate** (trap #34, added this session).

## The four traps that actually bit this session

1. **Trap #34 — `tapon` will tap below the screen.** The a11y tree lists off-screen ScrollView
   content at its *content* coordinate, so a row reads `y=933` on an 874pt screen. `idb ui tap`
   accepts it, does nothing, exits 0. I nearly repeated C36 exactly. Now guarded.
2. **The a11y tree flattens art.** I reported Digest rows as "text-only"; the screenshot showed
   thumbnails, category labels and read ticks. **Read the screen, not the tree.**
3. **Traps #21/#22 — ScreensDesign overflows** to a file, and `description` is an object, not a
   string. Both hit on the first call. Parse the file with python; do not retry smaller.
4. **A check that inspects a label passes for the wrong reason.** My house-ad linter tested a
   *heading* and found 5 offenders; reading the actual last paragraph found **18**. Same class
   as C5. When a check disagrees with a spot-check, trust the spot-check.

## How the user works

One thing per cycle, done properly. **Stop and ask on taste** — copy, pricing, naming, visual
direction — and use `AskUserQuestion`, never plain-text choices. Build without asking on
architecture, data flow, verification and refactors. Own what you break. Commit per verified
unit with a message that explains *why*, not just what. The user pushes back when reasoning is
wrong and is usually right — this session I told them a statistic couldn't be cited, and the
correction became a plan rule.
