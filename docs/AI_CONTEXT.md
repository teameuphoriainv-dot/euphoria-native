# AI_CONTEXT — Euphoria Master Reference (READ FIRST, ALWAYS)

The single doc I (the AI) load to understand what we're building, the quality bar, the
references, and the rules. Everything else (ROADMAP, specs) hangs off this.

## 🎯 The bar
Build screens that are **above and beyond Duolingo + Brilliant** in polish — motion, delight,
cohesion, personality. Current state is NOT there yet; treat every screen as a redesign toward
that bar. Every screen must feel alive: entrance animations, element stagger, Atlas reactions,
spring physics, reward moments, violet gradients, tasteful depth.

## 🐙 Atlas = the mascot (CENTRAL)
Atlas is THE identity of Euphoria. It must be reactive and present everywhere: an expression per
event, idle life (breathing), celebration beats, spring entrances. Never a static logo. Spec:
`docs/specs/ATLAS_ANIM_SPEC.md` (10 expressions + 10 behaviors; 6 shipped, 14 queued).

## 📚 References the user provided (ALWAYS take into account)
| Reference | Source | Captured to | Status |
|-----------|--------|-------------|--------|
| Brilliant app (25 screenshots) | user | `refs/BRILLIANT_REFERENCE.md` | ✓ analyzed |
| Atlas animation (2 videos: Brilliant 3D character + green bot) | Messages | `docs/specs/ATLAS_ANIM_SPEC.md` | ✓ analyzed |
| Duolingo onboarding (1 video, 4.5min) | Messages | `docs/specs/ONBOARDING_ANIM_SPEC.md` | ✓ analyzed |
| Brilliant stills (21 imgs, IMG_9043–9063) | Messages | — | ⚠️ **TCC-BLOCKED** |

⚠️ **ACTION FOR USER:** the 21 still images sit behind macOS privacy (Messages dir); I can't read
them. Copy them into `~/euphoria-native/refs/` (or grant Full Disk Access) and I'll fold them in.
Add any NEW references to this table when provided.

## 🎬 Animation tooling — RIVE IS THE PATH FOR ATLAS (decided 2026-07-21)
Hand-coded Reanimated springs did NOT hit the bar — the Atlas jump/entrance/breathing looked bad and
was reverted. **Atlas + hero mascot animations go through Rive**, not code.

- **Rive MCP:** added + connected at `http://127.0.0.1:9791/mcp` — BUT its tools only load at Claude Code
  STARTUP. They are NOT callable mid-session. **→ AFTER A RESTART, `mcp__rive__*` tools become available.**
- **▶️ DO THIS AFTER RESTART:**
  1. Verify Rive tools loaded: `ToolSearch "rive"` — expect `mcp__rive__*` tools.
  2. `npx expo install rive-react-native` (+ native runtime / prebuild if needed).
  3. Drive the Rive MCP to author the Atlas `.riv` state machine — one artboard, one state machine with
     inputs per state: idle-breathe (loop), happy, celebrate, watching, proud, oops, wave/entrance.
  4. Build `<AtlasRive>` (rive-react-native) mapping expression/celebrate props → Rive SM inputs; swap it
     in where `<Atlas>` renders. Keep the SVG `Atlas` as fallback until the .riv is solid.
  5. VISUAL-VERIFY on sim (Metro must be running — `npx expo start --port 8082`) before committing.
- **Reanimated code motion:** OK for simple UI only (progress bars, card press, list stagger) — NOT the mascot.
- **Committed code Atlas motion (d3d2cab):** breathing bob + bounce entrance + shake are still in
  `atlas.tsx`. Strip/replace once the Rive Atlas lands.
- **Metro note:** the dev server died mid-session on 2026-07-21; restart with `npx expo start --port 8082`
  and confirm `curl http://127.0.0.1:8082/status` → `packager-status:running` before verifying anything.

## 🔒 Hard rules (non-negotiable)
1. **VISUAL-VERIFY every build** on the sim (cold-restart → screenshot → actually LOOK) BEFORE moving on.
2. **Work in BIG BATCHES** — finish a whole screen/feature, not one tiny widget per cycle.
3. Expo **SDK 57** (verify docs.expo.dev/versions/v57.0.0). Respect `useReducedMotion`.
4. Brand: **violet** (not green), **Atlas** everywhere, Nunito in-app / EB Garamond marketing.
5. Durable state in git + these markdown files (session memory dies on compaction).

## 🗺️ Durable docs
- `docs/ROADMAP.md` — the user-journey task list (start → end)
- `docs/specs/ATLAS_ANIM_SPEC.md` · `docs/specs/ONBOARDING_ANIM_SPEC.md` · `refs/BRILLIANT_REFERENCE.md` — reference specs
- Branch `feat/foundation-first-slice` · Sim iPhone 17 `F448825D-AF20-48D2-890A-516C12012CA7` · Metro `:8082`
