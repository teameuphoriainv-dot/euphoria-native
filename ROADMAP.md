# Euphoria Native — Build Roadmap (USER-JOURNEY FLOW)

The app redesigned **start → end** to EXCEED Duolingo + Brilliant. Read `AI_CONTEXT.md` first.
Every screen: heavy tasteful motion + Atlas reactions + violet brand. Work in **BIG BATCHES**
(finish a whole screen, verified — never dribble one tiny widget). **VISUAL-VERIFY every build**
on the sim (cold-restart + screenshot + actually look) before proceeding.

Verify recipe — lesson steps: `xcrun simctl terminate <udid> host.exp.Exponent; sleep 1; xcrun simctl openurl <udid> "exp://127.0.0.1:8082/--/lesson?step=<name>"; sleep 9` → ios_screenshot. Screens: openurl `exp://127.0.0.1:8082/--/<route>` → screenshot. maestro (`~/.maestro/bin/maestro`) for tap-through flows.

---

## 🗺️ THE JOURNEY — build in this order, each screen to above-Duo quality

### 1. Launch / Splash — [ ] NEW
Branded splash → Atlas comet/beam entrance into Welcome. Smooth, no white flash.

### 2. Welcome / Atlas spotlight — 🟡 exists (`welcome.tsx`), polish to above-Duo
Light-beam entrance, Atlas `entrance="bounce"`, staggered copy rise, gradient CTA press spring.

### 3. Onboarding (12–15 steps, Duo-motion) — 🟡 6 steps exist; 0/10 motion upgrades
`onboarding.tsx` + `onboarding-parts.tsx`. Implement ALL of `ONBOARDING_ANIM_SPEC.md`:
progress-bar spring fill, Atlas expression-per-step, OptionCard stagger + animated radio, GrowthChart
line-draw, path reveal sequence, screen transitions. Expand toward the ~15-step Brilliant flow.

### 4. Paywall — [ ] NEW (post-onboarding)  ⚠️ needs monetization model from user
Beautiful subscription offer: value props, plan cards, Atlas, social proof, "restore". Above-Duo.

### 5. Auth / account create — [ ] (Google / Apple / email)

### 6. Home dashboard — 🟡 ring + NumberRollup exist; full redesign
Daily-goal ring, streak flame, "continue lesson" hero, Atlas greeting w/ time-of-day expression, XP/level.

### 7. Learn / Pathway trail — 🟡 exists; redesign
Illustrated vertical unit pathway, node states (locked/active pulse/done), Atlas checkpoints, course chips.

### 8. Lesson viewer — ✅ 13 step types built; polish transitions + reward cascade between steps

### 9. Lesson complete / rewards moment — 🟡 basic; make it a MOMENT
Confetti + Atlas celebrate + XP roll-up + streak bump + coin toast, staggered.

### 10. Games hub + 14 mini-games — 🟡 1/14 (TermMatch)

### 11. Explorables — [ ] 0/11 interactive finance labs (CompoundGrowthLab first)

### 12. League / leaderboard — 🟡 exists; polish (promotion animations, rank-up)

### 13. Profile / You — [ ] streak calendar, achievements, XP levels, settings

## ↔️ Cross-cutting (touch every screen)
- **Atlas mascot system** — 🟡 6/20 anims (`ATLAS_ANIM_SPEC.md`). THE mascot — keep enhancing.
- Motion system, sound (expo-audio), skeletons/loading, a11y pass.

## ✅ Shipped
- Lesson widget library — 13 interactive step types (TileBuilder, SliderPredict, SortBuckets,
  TapReveal, quiz, MultiSelect, NumberLine, MatchingPairs, OrderSteps, BeforeAfterSlider, GraphPointDrag)
- Atlas: idle breathing bob, `thinking`/`proud`/`oops` expressions, shake-on-wrong, bounce-in entrance
- daily-goal ring, League, Courses grid, Games hub + TermMatch, `src/lib/courses.ts` (277 lessons)
- Dev `?step=` deep-link for per-widget visual QA
