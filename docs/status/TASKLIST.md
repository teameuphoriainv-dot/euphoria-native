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
6. Check the item off here. Update `docs/status/PROGRESS.md`. Move to the next item, then the next phase.
7. If blocked after real effort: log it in `docs/status/PROGRESS.md` → move to the next unblocked item. Keep looping.
8. Keep going. Add phases as needed (target ≥24). The app should get better every phase, every loop.

The definitive per-lesson visual execution board is now:

- [LESSONS_PARITY_VISUAL_TASKLIST.md](LESSONS_PARITY_VISUAL_TASKLIST.md)
- [x] Create/check visual parity evidence before every phase boundary

Sim: iPhone 17 `F448825D-AF20-48D2-890A-516C12012CA7` · Metro `:8082 --dev-client` · verify via execbro.

---

## P0 recovery gate — restore trust before release work

Nothing below is "done" from source inspection alone. A checkbox requires the named Release-simulator
evidence and, where parity is claimed, a matching live-web recording.

### 1. Restore the known-good lesson shell

- [x] Keep the quiet pre-regression `AmbientBackground`; the unused moving-orb lesson background must
      not be mounted. Preserve the graph, raw-SVG, keyboard, lesson-exit, back-navigation, hearts,
      Atlas, accessibility, and content fixes already in the runner.
- [x] Remove the invented mood primer. Production `49e9149` uses deterministic recall from completed
      earlier lessons; lesson 1 shows the canonical flame/title/Start lesson state with no halo.
- [x] Mount that warmup directly in the post-header viewport so it owns its own insets, and honor
      Reduced Motion with an instant entrance.
- [ ] Record first-lesson warmup → hook and later-lesson recall → hook on live web and Release iOS at
      the same phone-sized viewport. Acceptance: no clipping, no overlap, no invented copy, identical
      ordering, controls, answer states, and transition behavior.

### 2. Restore the circular saga pathway

- [x] Replace the rectangular lesson-directory treatment on Learn with the staggered circular saga:
      compact 56pt nodes / 64pt current node, visible connecting trail, full two-line labels, level
      header, and current/completed/locked/challenge/capstone states. All 12 courses and 25 lessons
      per course remain addressable. Verified on the Euphoria QA simulator 2026-08-31.
- [ ] Verify node state, course switching, lesson deep links, scroll restoration, small iPhone,
      maximum Dynamic Type, VoiceOver order/labels, and Reduced Motion on a Release build.
- [ ] Capture one approved visual comparison against the supplied saga reference before closing.

### 3. Rebuild lesson scene families instead of flattening them

- [x] Pin generated curriculum to the deployed production SHA `49e91490e19318f9be5919ab604346a9fa4d04d9`
      and prove semantic equality: 12 courses, 300 lessons, 4,050 raw steps, 1,485 challenges.
- [ ] Expand the sync contract beyond data. Inventory and port the production viewer, dispatcher,
      template renderers, animated visual system, lesson visuals, Atlas conversation runtime,
      explorables, interactives, motion tokens, and responsive rules. A data-only sync is not parity.
- [ ] Eliminate every lossy normalization mapping. Each of the 20 live authored step types needs an
      explicit native scene contract; no unrelated web types may share a generic native renderer
      unless an audited allowlist proves their UI, state machine, feedback, and motion are identical.
- [x] **Atlas vocabulary conversation — 186 steps / 2,331 beats.** Replace generic reveal cards with
      the production teach→quiz conversation, deterministic option order, 46 cps typewriter,
      tap-to-finish, progress, expressions, wrong-answer copy, pass threshold, and Reduced Motion.

- [x] **Stakes cards — 300 lesson corpus.** Preserve the web scene title, red/green semantic panels,
      authored visuals, labels/details, panel entrance directions, and inline Continue. Stack panels
      responsively on phones; do not reduce them to generic prose cards.
- [~] **Interactive graphs — 289 screens / 665 controls.** All graphs and controls now reach the UI;
      continuous drag, authored ranges/defaults/steps, compound-growth sensitivity, DALBAR semantics,
      and Reduced Motion are regression-pinned. Remaining gate: live before/after recordings for
      every control and visual-family motion comparison.
- [x] **Teaching slides — 432 screens.** Synchronize the authored payload first, then restore inline
      clickable terms, one definition popup, examples, diagrams, Atlas callouts, visual order, and
      the web transition. Corpus regression covers 1,445 terms, 427 animated visuals, 5 SVGs, 250
      hints, and 250 recaps; live 300-lesson visual adjudication remains a separate gate.
- [x] **Progressive calculations — 44 scenes / 170 rounds.** Keep each authored calculation as one
      outer lesson scene with production quiz/walkthrough state, transitions, 800ms advance,
      explanations, pass threshold, Previous restoration, VoiceOver, and Reduced Motion.
- [~] **Remaining interaction families.** Drag-sort now matches all 231 production adjacent-pair
      flows / 1,023 rounds; true/false, scenario feedback, graphs, explorables, raw SVG, keyboard,
      and Previous-state regressions pass. Still verify and align the remaining generic choice,
      build-it, calculator, matching, slider, and decision-tree visual details live.
- [ ] Replace generic `LessonProse` fallback use with an explicit renderer per canonical web scene
      family. A newly introduced curriculum type must fail the audit rather than silently render as
      text.

### 4. Synchronize authored content

- [ ] Generate a field-level web/native manifest for all 300 lessons and 4,050 authored steps:
      type, order, copy, formulas, labels, term definitions, examples, SVGs, animated visuals,
      controls, answers, explanations, and timing metadata.
- [ ] Resolve every manifest mismatch from the canonical web source; preserve intentional native-only
      accessibility semantics in a separately documented allowlist.
- [ ] Keep renderer accounting strict: 1,321 `AnimatedVisual` objects, 11 raw SVGs, 289 interactive
      graphs, and 665 graph controls must all reach the UI after every sync.

### 5. Prove 300/300 live parity

- [ ] Record every full lesson on the live website and the same Release iOS build. No debug-only
      fixtures or source-count substitutes.
- [ ] Produce one machine-readable verdict per lesson covering every screen, copy block, control,
      gesture, animation, Atlas state, feedback state, typography, spacing, color, radius, safe area,
      Dynamic Type, VoiceOver, and Reduced Motion behavior.
- [ ] Current accepted evidence remains **2/300 native, 0/300 live-web adjudications**. Rejected,
      interrupted, stale-source, or incomplete recordings never increment the count.
- [ ] Zero unresolved severity-1/2 parity defects and zero unclassified renderer fallbacks before
      source freeze.

### 6. Release qualification after parity source freeze

- [ ] Clean TypeScript, lint/check suite, Release build/export, cold install/update, and migration.
- [ ] Successful RevenueCat sandbox purchase and restore; subscriptions attached to the same app
      submission with review screenshot, notes, and a working reviewer account.
- [ ] Student/educator/admin/parent auth, Google/Apple/email, consent delivery/token lifecycle,
      Canvas sandbox/JWKS/grade passback, and Stripe sandbox evidence.
- [ ] Offline/poor-network/upstream-outage, small iPhone, maximum Dynamic Type, VoiceOver, Reduced
      Motion, contrast, exception capture, alerts, rollback/source maps, and documented backup posture.
- [ ] Regenerate all five Goldie screenshots from the frozen Release build, recompute hashes, visually
      review every asset, attach the correct build/IAPs, and only then submit for App Review.

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
- [ ] Document the working pipeline recipe in `docs/status/RIVE_STATUS.md`

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

## Phase 25 — Lesson parity evidence + App Store presentation
- [~] **Verify all 300 lessons one by one: live web vs. iOS.** Every lesson needs accepted web and
      native recordings, every authored step completed, interaction/control coverage, animation and
      design-token comparison, and a recorded pass/fail adjudication. A corpus count or source audit
      is supporting evidence, not completion. Current evidence: Investing Fundamentals lessons 1
      and 2 have accepted native recordings (2/300); 298 native recordings and all 300 live-web
      recordings/adjudications remain pending. Lesson 2 independently validates all six authored
      interaction families and both graph controls. The shared renderer now preserves all 1,321
      `AnimatedVisual` entries plus all 11 authored raw SVGs, and all 300 hook openers use the
      web-timed title/visual/outcome staging with their inline `Begin` CTA. A Release-simulator
      check confirms the new hook and Quantitative Analysis lesson 24 SVG paths render; the latter's
      authored bottom annotations overlap at phone width and remain a visual-fidelity follow-up.
- [~] **Produce the App Store screenshot set with Goldie.** A 2026-08-31 current-Release run passes
      doctor, capture, framing and verification for all five 1320×2868 English 6.9-inch assets.
      Human review found no clipping or stale lesson UI; the paper-trade fixture timestamp must be
      rechecked at source freeze. Regenerate after the final user-facing change, then confirm the
      approved device sizes/locales, copy, account data, status bars, crop and ordering; archive the
      Goldie project/export alongside the submission manifest. Current hashes and review verdicts:
      [`GOLDIE_EVIDENCE_2026-08-31.md`](GOLDIE_EVIDENCE_2026-08-31.md).
- [~] **Refresh the repository README as the professional project front door.** Counts, repository
      map, runtime data-flow diagram, Goldie workflow, release gates, and evidence-honest status
      are refreshed against the current tree. Add representative release-candidate screenshots
      after the UI stabilizes. The repository currently has 888 commits at `2b2408e`; derive the
      number when updating instead of hard-coding an estimate.

---
_The in-tool task tracker is retired — THIS file is the one list. Completed history lives in git + `docs/status/PROGRESS.md`._
