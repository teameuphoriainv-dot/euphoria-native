# Euphoria — Build Progress Log

Multi-session memory for the Autonomous Build Directive (production-ready polish, Duolingo/Brilliant
feel). Update EVERY session: what I did, tried, failed, next. Companion: `TASKLIST.md` (checkable phases),
`AI_CONTEXT.md` (master ref), `RIVE_STATUS.md` (Rive detail), `refs/README.md` (reference assets).

---

## Current app state (grounded, verified 2026-07-21 via codebase analysis)
- **~85% screen-complete.** Stack: Expo SDK 57, RN 0.86, expo-router, Reanimated 4.5, **no state manager, no persistence** (all local `useState` + intentional mock, flagged `ponytail: mock until Phase X`).
- **Flow:** `index → welcome → onboarding (6 steps) → (tabs)`. Tabs: **home · learn · trade · digest · you** (trade = paper-trading dash, digest = serif news feed — both polished).
- **Polished screens:** welcome, onboarding, home, learn (Duolingo trail), trade, digest, you, lesson (15-step, 10 interactive widgets), courses, games/term-match.
- **Functional-but-plain:** games hub, league, tab bar.
- **Motion system (Brilliant-caliber, works):** `src/components/shared/motion/` — `tokens.ts` (spring presets), `RiseIn`, `RewardPop`, `NumberRollup`, `SpringPressable`, plus `Confetti`, `PulseHalo`, `DailyGoalRing`. All reduced-motion aware.
- **Atlas mascot (PRODUCTION = SVG, works):** `src/components/atlas.tsx` — pinwheel + googly eyes, 9 expressions (default/watching/happy/whoa/silly/sad/thinking/proud/oops), idle blink, celebrate jump, shake, bounce entrance. Used in 13 sites (welcome, onboarding ×5, home, learn, you, lesson ×3, term-match).
- **Data:** `src/lib/courses.ts` (12 courses / 303 lessons), `digest-content.ts` (10 posts), `euphoria-icons.ts` (96 SVG icons).
- **Dev build:** dev-client installed (`com.euphoria.native`), iPhone 17 sim `F448825D-AF20-48D2-890A-516C12012CA7`, Metro `:8082 --dev-client`. Verify via **execbro** (ios_screenshot/tap/get_logs) — NOT Expo Go (native modules).

## Done this session
- Built a **headless `.riv` generation pipeline** via `rivemcp`/Polymation (authorized closed-source binary, npm dep): `scripts/rive/build-atlas.mjs` drives it over stdio MCP to author + `export_riv` an Atlas `.riv` from a spec — **no editor, no manual export**. Produced `assets/atlas.riv` headlessly (35.7K). `validate_riv_structural` + `lint_animations` + dry-run export all PASS.
- Wired `<AtlasRive>` (`src/components/atlas-rive.tsx`) to load via expo-asset `url` + fire classic trigger via `fireState`. Test route `/atlas-test`.
- Restored normal boot (index → /welcome).
- Created `refs/` + `refs/README.md` (reference-asset manifest).

## 🚧 BLOCKED (parked — resume after Phases 1–3)
**Rive Atlas animations don't play on the sim.** The `.riv` renders (static pose correct, transparent bg) but Idle breathe/blink is not visible and the `celebrate` `fireState` barely moves it (~0.5% pixel change on sim).
- Root cause NOT yet confirmed. `inspect_riv_interface` shows the `.riv` HAS: 2 animations (Idle loop144, Celebrate oneShot42), 1 SM "State Machine 1" with trigger "celebrate". (`keyframes:[]`/`layers:[]` in the summary are likely just interface-summary artifacts — `lint_animations` confirmed "every animation has motion".)
- **Ground-truth QA is blocked:** `render_riv` / `simulate_state_machine` / `validate_riv_runtime` need Playwright Chromium, and the rivemcp SEA binary can't find it even after `npx playwright install chromium` (cache has chromium-1223/1228) and even with `PLAYWRIGHT_BROWSERS_PATH` set. Vendor SEA/browser-discovery issue.
- **Hypotheses to test on resume:** (1) rive-react-native isn't auto-entering the Idle state from the rivemcp SM (default-state/entry-transition playback); (2) breathing is just too subtle (3% scale) + blink too fast (66ms) to notice, and only `celebrate` truly fails; (3) SEA export dropped SM layer/state wiring. **Fastest next diagnostic (no Chromium): add `onPlay`/`onStateChanged`/`onError` callbacks to `<Rive>` and read RN logs via execbro to see if the SM plays Idle + whether fireState transitions.**
- **Decision:** production uses the working SVG `<Atlas>`. Rive is experimental at `/atlas-test`. Free-trial exports: 2 left (license needed for scale — cost approved by user). Playwright Chromium installed.

## Reference material (user-provided) — see `refs/README.md`
- ~3-4 Brilliant screen-recordings + ~30-40 Brilliant screenshots (Koji mascot, onboarding). **TCC-blocked** — I can't copy them from `~/Library/Messages/Attachments` (`Operation not permitted`). Analysis already captured in `BRILLIANT_REFERENCE.md` / `ATLAS_ANIM_SPEC.md` / `ONBOARDING_ANIM_SPEC.md`. To persist raw files: user grants Full Disk Access OR drags them into `refs/`.

## Phase 1 progress
- ✅ Boot clean (welcome renders, 0 bundle errors). NOTE: execbro CDP attach fails (401 — a stray `:8081` Metro beside `:8082 --dev-client`), so runtime `get_logs` is unavailable that way. Minor infra, not an app bug. Verify visually via `ios_screenshot`/`tap`.
- ✅ Code-level stability audit (agent) — code is very defensive (no console.error/throw/TODO). Findings: 1 latent hang, 1 dead-state UI, a pile of dead code/assets.
- ✅ Commit `f32aaff`: OrderSteps `n<=1` hang fix; Trade dead-segment fix (branch on `seg` + designed "coming soon" states); atlas-test `__DEV__` guard. tsc clean.
- ⬜ **NEXT — dead-code/asset cleanup** (grep-verify 0 importers, then delete): `src/lib/courses.ts`, `src/components/stub-screen.tsx`, `src/components/ui/badge.tsx`, `src/components/themed-view.tsx`, `src/hooks/use-color-scheme*.ts`, `src/shared/motion/use-reduced-motion-safe.ts`; orphan assets (`assets/images/react-logo*`, `expo-logo*`, `expo-badge*`, `tutorial-web.png`, `assets/images/tabIcons/`); prune deps (`expo-glass-effect`/`symbols`/`image`/`device`/`web-browser`). **KEEP** `assets/expo.icon` (app.json icon) + `splash-icon.png`.
- ⬜ Cosmetic: `courses.tsx:92` chevronLeft→right; matching-pairs keys (append index); `/games` + `/league` are unreachable in prod (link in or mark dev-only).
- Then **Phase 2** (interaction polish) per TASKLIST.md.

## Git
Branch **`main`** → **`origin`** = `github.com/teameuphoriainv-dot/euphoria-native` (PRIVATE). Loop = commit **and `git push`** each working increment. `node_modules` gitignored (rivemcp binary not pushed). Never commit broken code.
