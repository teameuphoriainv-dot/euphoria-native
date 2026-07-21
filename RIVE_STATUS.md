# Rive Atlas — Pipeline Status (2026-07-21, autonomous run)

Durable record of the Rive migration so far. Read with `AI_CONTEXT.md` (§🎬 Rive is the path for Atlas).

## ✅ Done this session
- **Rive MCP connected** (127.0.0.1:9791) — read+write verified. NOTE: **no export tool** — exporting `.riv` is a human-only action in the Rive editor.
- **Atlas rig authored in the Rive file** (artboard `Atlas` id `0-2`, 500×500):
  - Body = imported `atlas-logo.png` (asset `0-66`, instance `0-68`), scaled 1.2146, sent to back.
  - Eyes (native vectors, viewBox 100×104 mapped ×3, centered at 250,250):
    - EyeWhiteL `0-14`, EyeWhiteR `0-24`, PupilL `0-34`, PupilR `0-42`, HighlightL `0-50`, HighlightR `0-58`.
  - **Idle loop** on timeline `Timeline 1` (`0-6`), 144 frames @ ~60fps, `loop=1`: breathing (body sx/sy 1.2146↔1.251) + blink (all eyes sy 1→0.08→1 @ frames 108–116).
  - Default state machine `State Machine 1` (`0-7`), layer `0-8` — Entry→Timeline1 (not yet expanded with reactions).
- **React Native integration (managed→dev-client):**
  - Installed `expo-dev-client` + `rive-react-native@9.8.5` (iOS 14+, no config plugin needed).
  - `metro.config.js` — added `riv` to `assetExts`.
  - `app.json` — added `ios.bundleIdentifier` + `android.package` = `com.euphoria.native` (prebuild requires it).
  - `src/components/atlas-rive.tsx` — `<AtlasRive>` loads `@/assets/atlas.riv` via Expo asset `url`, exposes `fire(trigger)` / `setInput(name,value)` ref handle (RiveRef.fireState/setInputState).
  - `src/app/atlas-test.tsx` — smoke-test route: `exp://127.0.0.1:8082/--/atlas-test`.
  - `npx expo prebuild -p ios` ✅ + `npx expo run:ios` ✅ — native build compiled `rive-react-native`, app installed on sim `com.euphoria.native`.
- **🎉 PIPELINE VALIDATED END-TO-END (2026-07-21 16:17):** dev client boots → runs real app → `/atlas-test` route → `<Rive>` view **renders + animates** the `.riv` on the sim (confirmed: teal van from `vehicles.riv` on pink bg). The `url`-via-expo-asset load approach WORKS — no native asset surgery needed. `<AtlasRive>` component is correct as written.
- **✅ REAL ATLAS RENDERS ON-DEVICE (2026-07-21 16:55):** exported `untitled.riv` (32KB, from `~/developer/lyra/assets/lumi/`) → `assets/atlas.riv` → renders on sim: purple pinwheel body (embedded PNG) + googly eyes on the crown, Idle SM autoplaying (breathe+blink). Backup at `assets/atlas-backup.riv`.
  - ✅ Transparent artboard bg (deleted fill `0-3`).
- **Celebrate reaction wired (2026-07-21):** timeline `Celebrate` (0-114, elastic scale-pop 42f, oneShot) · ViewModel `AtlasVM` (0-115) trigger `celebrate` (0-117) bound to artboard (instance 0-116) · SM state `Celebrate` (0-132) · transitions: `Any(0-9)→Celebrate` [cond: triggerFired celebrate] + `Celebrate→Idle(0-12)` [enableExitTime, exitTime 100%]. RN: `<AtlasRive>` fires via `rive.trigger('celebrate')` + `dataBinding={AutoBind(true)}`; `/atlas-test` has a Celebrate button.
  - ✅ **VERIFIED ON SIM (2026-07-21 17:10):** re-exported `atlas.riv` (32227B) in place; tapping the Celebrate button fires the trigger → scale-pop plays → auto-returns to Idle. Atlas floats on transparent bg. Full loop (RN → VM data-binding → Rive SM → on-device animation) confirmed.
- (Placeholder was Rive's `vehicles.riv` sample — used to prove the pipeline before the real export.)
- **Scheme caveat**: Expo Go (`host.exp.Exponent`) is also installed on the sim → `euphorianative://` deep links prompt/route ambiguously. To view `/atlas-test`: temporarily point `src/app/index.tsx` `<Redirect>` at `/atlas-test`, or terminate Expo Go first. (index.tsx is back to `/welcome`.)

## 👉 USER NEXT STEPS (when back)
1. In the Rive editor: menu/File → **Export → Runtime (.riv) → Download**, save as `assets/atlas.riv` (overwrite the placeholder).
2. Reload the app (fast refresh) → Atlas should breathe + blink at `/atlas-test`.
3. Then (WITH device verification — expressions must be seen, not built blind): wire the reaction states.

## ⏭️ Remaining Rive rig work (do with device verification)
- Reactions: `happy · celebrate · watching · proud · oops · wave-in` as timelines.
  - Celebrate = body (`0-68`) rotation 0→360 + scale pop (geometrically safe).
  - Expressions (happy/oops/…) = pupil translate + eyelid/brow shapes → MUST verify at size on sim (this is what sank the Reanimated attempt).
- State machine: expand `State Machine 1` with Idle⇄reactions. Rive MCP conditions are **ViewModel-property based** → drive from RN via data binding (`setInputStateAtPath`/`dataBinding` prop) OR classic inputs if available. Confirm which the exported file exposes.
- Once solid: swap `<Atlas>` → `<AtlasRive>` where the mascot renders (welcome/onboarding/lesson), keep SVG `<Atlas>` as fallback.

## Refs
Coord mapping: `world_x = 250 + (designX-50)*3`, `world_y = 250 + (designY-52)*3`. Eye geometry from `ATLAS_ANIM_SPEC.md` §2 (viewBox 100×104).
Sim iPhone 17 `F448825D-AF20-48D2-890A-516C12012CA7` · Metro `:8082` · Expo Go can't run Rive — must use the dev-client build.
