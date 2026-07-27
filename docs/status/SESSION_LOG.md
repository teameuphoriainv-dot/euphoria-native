# Euphoria Native — Agent Session Log

**Date:** 2026-07-21 · **Project:** euphoria-native · **Branch:** `feat/foundation-first-slice` (local only)
**Sim:** iPhone 17 `F448825D-AF20-48D2-890A-516C12012CA7` · **Metro:** `:8082`
**Companion docs:** `docs/AI_CONTEXT.md` (master reference — read first), `docs/ROADMAP.md` (journey task list),
`docs/specs/ATLAS_ANIM_SPEC.md`, `docs/specs/ONBOARDING_ANIM_SPEC.md`, `refs/BRILLIANT_REFERENCE.md`.

---

## TL;DR
Built out the lesson widget library (done, verified), expanded Atlas with code animations, then
**pivoted the whole mascot/onboarding animation strategy to Rive** after hand-coded springs looked bad.
**Next session (after a Claude Code restart to load the Rive MCP tools): build the Atlas `.riv` via Rive.**

---

## What shipped this session (committed)
- **§A Lesson widget library — COMPLETE.** 13 interactive step types, each visually verified on sim:
  MultipleChoice (via quiz), MultiSelect, NumberLine, MatchingPairs, OrderSteps, BeforeAfterSlider,
  GraphPointDrag (+ pre-existing TileBuilder, SliderPredict, SortBuckets, TapReveal).
  Commits: `a7c83a0`, `bc4a1ca`, `3928463`, `3dd4f4d`, `bf5cb31`, `b89e7f4`.
- **Dev `?step=` deep-link** in `lesson.tsx` for per-widget visual QA (`6d25022`).
- **Atlas code animations** (`d3d2cab`): +3 expressions (thinking/proud/oops), idle breathing bob,
  shake-on-wrong, bounce-in entrance. ⚠️ See "Pivot" — the motion bits (breathing/entrance) looked bad;
  being replaced by Rive.
- **Durable docs:** `docs/AI_CONTEXT.md`, `docs/ROADMAP.md` (rewritten to user-journey flow), `docs/specs/ATLAS_ANIM_SPEC.md`,
  `docs/specs/ONBOARDING_ANIM_SPEC.md`.

## Reverted / not shipped
- **Onboarding Duo-motion attempt** (`onboarding.tsx` + `onboarding-parts.tsx`): built ~10 code
  animations, but the Atlas jump/entrance/comet looked horrible. **Reverted** (was never committed).
  These files are back to their last-committed pre-animation state.

---

## Key decisions
1. **Rive is the path for Atlas + hero animations** — not hand-coded Reanimated. (Reanimated stays for
   simple UI: progress bars, card press, list stagger.)
2. **Rive MCP** added + connected (`http://127.0.0.1:9791/mcp`) — tools load only on Claude Code **restart**.
   Workflow: I integrate `rive-react-native` + drive the Rive MCP to author `.riv`; user's Rive account (until Aug 6).
3. **Paywall model: freemium** — free tier + Pro unlock. Comes after onboarding in the journey.
4. **First big batch:** onboarding, done deeply (now via Rive).
5. **Work in BIG BATCHES** — finish a whole screen, not one tiny widget per cycle (user directive).
6. **VISUAL-VERIFY every build** on the sim before committing (cold-restart + screenshot + actually look). Mandatory.
7. Autonomous ScheduleWakeup loop + cron watchdog were used earlier, then **stopped** at user request.

## The quality bar
Above & beyond Duolingo + Brilliant. Violet brand, Atlas mascot central, Nunito in-app / EB Garamond marketing.

---

## References provided by user
| Ref | Captured to | Status |
|-----|-------------|--------|
| Brilliant app (25 screenshots) | `refs/BRILLIANT_REFERENCE.md` | ✓ analyzed |
| Atlas anim (2 videos) | `docs/specs/ATLAS_ANIM_SPEC.md` | ✓ analyzed (Brilliant.org 3D char + green bot) |
| Duolingo onboarding (1 video) | `docs/specs/ONBOARDING_ANIM_SPEC.md` | ✓ analyzed |
| Brilliant stills (21 imgs IMG_9043–9063) | — | ⚠️ TCC-BLOCKED — user to copy into `~/euphoria-native/refs/` |

---

## Current state
- Working tree: onboarding reverted; docs (`docs/AI_CONTEXT.md`, `docs/ROADMAP.md`, `docs/specs/ONBOARDING_ANIM_SPEC.md`, etc.) present.
- Metro was restarted this session (`npx expo start --port 8082`); may stop on Claude exit — re-run if so.
- Session cost was high (~$370+) — much of it early rapid micro-cycles on Opus; corrected to bigger batches.

## ▶️ NEXT SESSION — do this (also in `docs/AI_CONTEXT.md`)
1. **Restart happened → verify Rive tools:** `ToolSearch "rive"` → expect `mcp__rive__*`.
2. Ensure Metro up: `npx expo start --port 8082`; `curl http://127.0.0.1:8082/status` → `packager-status:running`.
3. `npx expo install rive-react-native` (+ native runtime / prebuild if needed).
4. Drive Rive MCP to author the Atlas `.riv` state machine (idle-breathe, happy, celebrate, watching,
   proud, oops, wave-in), then build `<AtlasRive>` and swap it in where `<Atlas>` renders.
5. Visual-verify on sim before committing. Then resume the journey (`docs/ROADMAP.md`): onboarding → paywall → …
