# Euphoria — The Build Loop (single source of truth)

**This is an automatic, always-running loop.** Take the app phase by phase to production-ready polish
that beats Duolingo + Brilliant. Slow and steady — one item at a time.

## Loop rules (every phase, every item)
1. Do the work in the **smallest verifiable increment**.
2. **ALWAYS launch the iOS simulator and LOOK.** Go screen by screen, screenshot, verify it actually
   renders + animates + feels right. Never check an item off on "should work" — only on *seen working*.
3. Reference **`refs/`** (Brilliant videos + screenshots) for the quality/motion bar. Aim for beautiful.
4. Make the mascot alive through **Rive** where it belongs; use the code motion system elsewhere.
5. **Commit + push** each working increment (clear message). Never commit broken code.
6. Check the item off here. Update `PROGRESS.md`. Move to the next item, then the next phase.
7. If blocked after real effort: log it in `PROGRESS.md` → move to the next unblocked item. Keep looping.
8. Keep going. Add phases as needed (target ≥24). The app should get better every phase, every loop.

Sim: iPhone 17 `F448825D-AF20-48D2-890A-516C12012CA7` · Metro `:8082 --dev-client` · verify via execbro.

---

## Phase 1 — Stability
- [x] Restore normal boot; fix OrderSteps hang; fix Trade dead segments; guard dev route (`f32aaff`)
- [x] Remove dead code / orphan assets / unused deps; verify boot (`e138e15`)
- [~] Walk EVERY screen on the sim (screenshot each) — fix any broken/janky state
  - [x] welcome + onboarding (all 6: intro→level→growth→social→path→paywall) + home — all render+interact, Atlas reacts, 0 bugs. Notes: verify growth-chart line-draws on mount; paywall already real (not a stub → helps Phase 19)
  - [x] learn (pathway trail 8/12, node states ✓) + trade (portfolio chart, positions; **dead-segment fix VERIFIED on device** — Research/Compete now show designed "coming soon" cards)
  - [x] digest (serif editorial feed, filter pills) + you (profile: level/XP bar, stat grid, certs, settings) — all 5 TABS now verified clean, 0 bugs
  - [x] lesson viewer opens (Lesson 9 "What is a stock?") — intro + teach steps render clean (full 10-widget walk deferred to Phase 9). UX note (Phase 7): Home "Continue" routes to /learn pathway, not directly into the lesson
  - [ ] remaining: courses + games + term-match + league
- [ ] `/games` + `/league` are unreachable in prod → link into nav (or mark dev-only)
- [ ] Add a `chevronRight` icon (courses row uses a left chevron as a forward affordance)
- [ ] Run `expo lint`, triage results

## Phase 2 — Rive Atlas: fix animation rendering (the parked blocker)
- [ ] Add `onPlay`/`onStateChanged`/`onError` to `<Rive>`, read logs via execbro → find why idle/celebrate don't play
- [ ] Get idle breathe+blink visibly looping + `celebrate` pop firing on `/atlas-test` (verify on sim)
- [ ] Document the working pipeline recipe in `RIVE_STATUS.md`

## Phase 3 — Rive Atlas: full reaction vocabulary
- [ ] Build happy · oops · watching · proud · wave-in · thinking into ONE `.riv` via the headless pipeline
- [ ] Trigger-button test each on `/atlas-test`; verify each plays + returns to idle (sim, burst screenshot)

## Phase 4 — Rive Atlas: integrate (welcome + onboarding first)
- [ ] Swap SVG `<Atlas>`→`<AtlasRive>` behind fallback; map events→triggers (correct→happy, wrong→oops, etc.)
- [ ] Reference Brilliant onboarding refs; verify Atlas reacts on each step on the sim

## Phase 5 — Motion foundation  ✅
- [x] tokens.ts audited — Brilliant-caliber (Spring smooth/gentle/bouncy/snappy + Duration + Ease); no hand-tuned one-offs needed
- [x] All screen pressables already use SpringPressable. Only plain Pressables: atlas.tsx (mascot, own spring), number-line.tsx (hit-area), atlas-test (dev) — no upgrades required
- [ ] (ongoing) success/error/loading micro-states added per-screen as later phases touch them

## Phase 6 — Welcome + Onboarding polish
- [ ] Segmented progress, card stagger, Atlas reaction per step, entrance/exit transitions (match Brilliant)
- [ ] Verify the full onboarding flow tap-through on the sim

## Phase 7 — Home dashboard polish
- [ ] Daily-goal ring, streak flame, Atlas time-of-day greeting, continue-lesson hero, number roll-ups — verify

## Phase 8 — Learn / pathway polish
- [ ] Illustrated trail, node states (locked/active-pulse/done), Atlas checkpoints — verify

## Phase 9 — Lesson viewer polish
- [ ] Smooth step→step transitions; per-step Atlas reactions; micro-feedback on all 10 widgets — verify each

## Phase 10 — Lesson-complete reward moment  ✅
- [x] Staggered cascade: Confetti + proud Atlas (bounce) + "+50 XP" chip + "🔥 13 day streak" chip (RewardPop delays 280/460/640). Verified on sim (commit 34e05ac).

## Phase 11 — Trade screen polish  ✅
- [x] Rows → real stock detail (stock/[sym].tsx: price, day-change, chart, position card, blurb, CTA); lib/stocks.ts shared data. Research/Compete designed states (Phase 1). Verified on sim NVDA (commit 19eea28).

## Phase 12 — Digest screen polish
- [x] Post rows now open a real article reader (`digest/[slug].tsx`) — serif headline, category/read-time meta, excerpt lead, "Practice this in a lesson" CTA. VERIFIED on sim (deep-link first-paycheck-guide).
- [ ] Category filter transitions, list post-open shared animation — later

## Phase 13 — You / profile polish
- [x] Wired dead buttons: settings rows → settings/[section].tsx detail (titled designed state, no dead ends); "Log out" → /welcome. Games/League already linked. (commit 79f1397)
- [ ] Streak calendar, achievements detail, real account/notifications/preferences screens — verify

## Phase 14 — Courses + Games + League polish
- [ ] Illustrated course pathway, game-card press, leaderboard rank-up/promotion animation — verify

## Phase 15 — State + persistence
- [ ] zustand + AsyncStorage: XP/level, streak, lesson progress, paper-trading portfolio persist across restart — verify by relaunch

## Phase 16 — Wire real data
- [ ] Replace mock with the persisted store across home/learn/trade/you/league/lesson; lesson completion writes progress — verify

## Phase 17 — Auth + account creation
- [ ] Sign-up/sign-in (email → Google/Apple); wire onboarding's final step — verify

## Phase 18 — Splash + app-open
- [ ] Branded splash → welcome light-beam, no white flash — verify cold start

## Phase 19 — Paywall
- [ ] Beautiful subscription screen: value props, plan cards, Atlas, social proof, restore — verify

## Phase 20 — Explorables  ✅
- [x] Compound Growth Lab (explore/compound.tsx): interactive steppers (monthly/years/rate) + live future-value NumberRollup + growth curve. Linked from You. Verified on sim ($104,185/20yr). (commit 3f33273)
- [ ] More labs (inflation, diversification) — future

## Phase 21 — More mini-games
- [ ] Build toward 12 playable games at Term Match quality (correct=green+haptic, timer, XP, Atlas) — verify each

## Phase 22 — Empty / error / loading states
- [ ] Designed states everywhere (no RN defaults); force each state and verify

## Phase 23 — Performance
- [ ] Profile animation-heavy screens (lesson, learn, trade); fix frame drops; confirm smooth 60fps on sim

## Phase 24 — Edge cases + Final QA
- [ ] Slow/offline/interrupted network; empty/long/extreme data
- [ ] Full-journey walkthrough on the sim; design-system consistency (spacing/color/type); final PROGRESS summary

---
_The in-tool task tracker is retired — THIS file is the one list. Completed history lives in git + PROGRESS.md._
