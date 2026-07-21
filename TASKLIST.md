# Euphoria — Production-Ready Tasklist

Governed by the Autonomous Build Directive. **Definition of done per item: it works + it's tested (on sim) + it's committed + it's checked here.** Don't check something because it "should" work.

App is ~85% screen-complete (welcome, onboarding, 5 tabs [home/learn/trade/digest/you], lesson w/ 10 widgets, courses, games, league) with a Brilliant-caliber Reanimated motion system. Real gaps: no persistence/backend, some plain screens, missing surfaces. See PROGRESS.md for full state.

---

## Phase 1 — Stability
- [x] Restore normal app boot (index → /welcome; debug redirect removed)
- [ ] Cold-boot app on iPhone 17 sim; walk every route; capture console errors via execbro get_logs
- [ ] Fix any red-box errors / crashes / broken states surfaced
- [ ] `tsc --noEmit` clean
- [ ] Lint clean (if configured)
- [ ] Confirm every screen renders correctly (iPhone 17 + one smaller size)
- [ ] Remove dead code / unused assets / unused imports
- [ ] Decide fate of `/atlas-test` (keep as dev-only or remove from prod build)

## Phase 2 — Core interaction polish
- [ ] Audit every tap/swipe/transition for instant (un-animated) state changes
- [ ] Standardize timing/easing into shared tokens (extend `src/components/shared/motion/tokens.ts`)
- [ ] Ensure all pressables use SpringPressable (press state everywhere)
- [ ] Add success / error / loading states to every interactive element
- [ ] Tab-bar press bounce; selection fill-wash + ring spring consistency

## Phase 3 — Flow-level polish
- [ ] Smooth screen-to-screen transitions (not just within-screen)
- [ ] Reward moment after lesson: confetti + Atlas celebrate + XP roll-up + streak bump + coin toast, staggered
- [ ] Streak / progress celebration beats
- [ ] Designed empty states (no data) + error states (not defaults)

## Phase 4 — Performance & edge cases
- [ ] Profile animation-heavy screens (lesson, learn trail, trade) for jank; fix frame drops
- [ ] Slow-network / offline / interrupted states
- [ ] Data edge cases: empty lists, very long text, extreme numeric values

## Phase 5 — Final pass
- [ ] Full visual QA vs design system (spacing, color, type scale)
- [ ] Re-test all Phase 1–4 changes together (full journey walkthrough on sim)
- [ ] Final PROGRESS.md summary + known-issues list

---

## Parked / Blocked
- [ ] **Rive Atlas migration (experimental)** — rivemcp-generated `.riv` renders but animations don't play on sim; headless render/simulate QA blocked (Chromium not found by the SEA binary even w/ PLAYWRIGHT_BROWSERS_PATH). Production uses the working SVG `<Atlas>`. Full resume path + hypotheses in PROGRESS.md. Only revisit after Phases 1–3 land.
