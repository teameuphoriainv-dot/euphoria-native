# Euphoria Native — Autonomous Build Roadmap

Durable build queue for the autonomous loop. **This file is the source of truth for "what's next"**,
because the session TaskList dies on compaction/restart. Each loop cycle: read this → build ONE
unchecked item → `tsc` + expo lint clean → verify on sim (screenshot) → commit → check the box here → re-arm.

Rules: Expo SDK **57** (verify APIs at docs.expo.dev/versions/v57.0.0 before writing Expo code).
Brand: violet (not green), Atlas mascot, finance/investing. Nunito in-app, EB Garamond marketing.
Branch: `feat/foundation-first-slice` (local only). Metro `:8082`. Sim: iPhone 17 `F448825D-AF20-48D2-890A-516C12012CA7`.

## ✅ Shipped
- Lesson viewer (intro→teach→predict-reveal→celebration) + 4 widgets: TileBuilder, SliderPredict, SortBuckets, TapReveal
- Atlas celebrate-jump, NumberRollup, RewardPop reward cascade
- Daily-goal ring (Home), League (/league), Courses grid, Welcome spotlight, 6-step onboarding
- Games hub (/games) + TermMatch game
- `src/lib/courses.ts` — 277 lessons across 12 courses

## 🔨 Build queue (ordered: sim-verifiable + highest value first)

### A. Lesson widget library → 12+ interactive step types (finish #9)
- [ ] MultipleChoice (canonical single-select w/ reveal)
- [ ] MultiSelect (choose-all-that-apply)
- [ ] NumberLine (place value on a line)
- [ ] MatchingPairs (connect left↔right)
- [ ] OrderSteps (drag/tap to sequence)
- [ ] BeforeAfterSlider (compare two states)
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

### E. Atlas reactivity system
- [ ] Expression per lesson event (happy/whoa/watching/sad) wired across all widgets
- [ ] Additional celebratory poses beyond the jump

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
