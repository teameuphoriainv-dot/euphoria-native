# Euphoria Native — Autonomous Build Roadmap

Durable build queue for the autonomous loop. **This file is the source of truth for "what's next"**,
because the session TaskList dies on compaction/restart. Each loop cycle: read this → build ONE
unchecked item → `tsc` + expo lint clean → verify on sim (screenshot) → commit → check the box here → re-arm.

Rules: Expo SDK **57** (verify APIs at docs.expo.dev/versions/v57.0.0 before writing Expo code).
Brand: violet (not green), Atlas mascot, finance/investing. Nunito in-app, EB Garamond marketing.
Branch: `feat/foundation-first-slice` (local only). Metro `:8082`. Sim: iPhone 17 `F448825D-AF20-48D2-890A-516C12012CA7`.

**⚠️ Visual QA is MANDATORY every cycle** (tsc alone is NOT enough — actually SEE the thing render before checking the box):
- Lesson widgets: register the step name in `lesson.tsx` STEPS, then `xcrun simctl terminate <udid> host.exp.Exponent; sleep 1; xcrun simctl openurl <udid> "exp://127.0.0.1:8082/--/lesson?step=<stepName>"; sleep 9` → `ios_screenshot`. (Cold restart forces a fresh mount so the dev-only `?step=` jump in lesson.tsx applies — navigating to an already-mounted route does NOT re-read the param.)
- Games: openurl `exp://127.0.0.1:8082/--/games/<route>` → screenshot.
- Screens (home/league/you/etc.): openurl `exp://127.0.0.1:8082/--/<route>` → screenshot.
- `~/.maestro/bin/maestro` is available for tap-through interaction flows (execbro RN tap is blocked by Expo Go 401; idb absent).

## ✅ Shipped
- Lesson viewer (intro→teach→predict-reveal→celebration) + 4 widgets: TileBuilder, SliderPredict, SortBuckets, TapReveal
- Atlas celebrate-jump, NumberRollup, RewardPop reward cascade
- Daily-goal ring (Home), League (/league), Courses grid, Welcome spotlight, 6-step onboarding
- Games hub (/games) + TermMatch game
- `src/lib/courses.ts` — 277 lessons across 12 courses

## 🔨 Build queue (ordered: sim-verifiable + highest value first)

### A. Lesson widget library → 12+ interactive step types (finish #9)
- [x] MultipleChoice — covered by inline lesson `quiz` step (single-select + reveal)
- [x] MultiSelect (choose-all-that-apply) — `src/components/multi-select.tsx`, wired as `multi` step
- [x] NumberLine (place value on a line) — `src/components/number-line.tsx`, wired as `line` step
- [x] MatchingPairs (connect left↔right) — `src/components/matching-pairs.tsx`, wired as `match` step
- [x] OrderSteps (tap-two-to-swap) — `src/components/order-steps.tsx`, wired as `order` step ✓visually verified
- [x] BeforeAfterSlider (drag-to-reveal comparison) — `src/components/before-after-slider.tsx`, wired as `compare` step ✓visually verified
- [ ] GraphPointDrag (drag a point to a target on a chart)

### B. Explorables → 11 interactive labs (#10 first; names provisional, refine per cycle)
- [ ] CompoundGrowthLab (principal/rate/years sliders → live curve)
- [ ] InflationEroder (purchasing power over time)
- [ ] BudgetSplitter (50/30/20 interactive)
- [ ] RuleOf72 (rate → doubling time)
- [ ] DollarCostAveraging (lump vs DCA)
- [ ] DiversificationMixer (allocation → risk/return)
- [ ] RiskReturnScatter (asset classes)
- [ ] LoanAmortizer (payment schedule)
- [ ] RetirementProjector (contributions → nest egg)
- [ ] TaxBracketExplorer (marginal vs effective)
- [ ] OptionPayoff (call/put payoff plot)

### C. Games hub → 14 mini-games (1/14; names provisional)
- [x] TermMatch
- [ ] BudgetBlitz  - [ ] MarketDash  - [ ] CompoundQuest  - [ ] FraudSpotter  - [ ] BullOrBear
- [ ] PortfolioPuzzle  - [ ] CashFlowRun  - [ ] RateHike  - [ ] DiversifyDrop  - [ ] TickerType
- [ ] SavingsSprint  - [ ] RiskRoulette  - [ ] OptionsOracle

### D. Gamification depth
- [ ] Streak system (counter + freeze + week calendar)
- [ ] XP levels (level curve + level-up celebration screen)

### E. Atlas reactivity system  (implement from ATLAS_ANIM_SPEC.md — reference-driven)
- [ ] Expression per lesson event (happy/whoa/watching/sad) wired across all widgets
- [ ] Additional celebratory poses beyond the jump
- [ ] New Atlas expressions from ATLAS_ANIM_SPEC.md (extend the 6 — one per cycle)
- [ ] New Atlas motion behaviors from ATLAS_ANIM_SPEC.md (idle bob, anticipation, shake-on-wrong, bounce-in, etc.)

### F. Onboarding enrichment (toward ~15-step Brilliant spec)
- [ ] MascotSpotlight (light-beam entrance)
- [ ] Motivation 2×2 illustrated cards
- [ ] Investing-level cards w/ mini finance visuals
- [ ] Daily-goal timer-dial cards (10/20/30/60)
- [ ] Schedule cards (gradient sun/moon icons)
- [ ] Notifications fake-card screen
- [ ] Social-proof testimonials screen
- [ ] Topic constellation "we have everything you need"

### G. System / polish
- [ ] #13 Sound — expo-audio (SDK57) + useSound hook
- [ ] #14 Skeleton loaders / loading states
- [ ] #16 Certificate unlock overlay
- [ ] #19 Illustration set (EUPHORIA_ICONS)
- [ ] #20 Auth (Google / Apple / email)
- [ ] #21 A11y pass (labels, roles, contrast, dynamic type)
