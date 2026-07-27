# Brilliant reference → Euphoria build spec

Captured from 25 Brilliant app screenshots (user-provided). Euphoria adaptation: **violet not green, Atlas not Koji, finance/investing not math**. Serif (EB Garamond) for marketing headlines, Nunito for in-app. Build these in the autonomous loop; each verified on sim.

## A. Landing / mascot intro
- **Landing:** serif headline "A world-class coach for every investor" over a video/demo card; primary CTA "I'm a learner" (violet), secondary "I'm a parent or teacher"; "Existing user? Sign in". (ours: onboarding already covers role; add a marketing landing later.)
- **Mascot spotlight:** Atlas descends on a light beam (vertical gradient shaft) with a violet trail, lands center, "Hi, I'm Atlas! I'll be your coach." → Continue. Build `<MascotSpotlight>` (light-beam Svg + Atlas drop-in spring + trail).

## B. Onboarding flow (port structure, ~12 steps) — top bar = **segmented 3-chunk progress** + back chevron + volume icon
1. Mascot intro (above)
2. "What motivates you to learn?" — 2×2 cards w/ illustration (Excelling / Professional growth / Staying sharp / Helping my child)
3. "What are your learning goals?" — pill list + optional free-text field
4. "What school level…?" — pill list (Middle/High/College/Graduate)
5. "What level of math are you at?" → **ours: investing level** — 2×2 cards each with a mini worked-example illustration (Arithmetic `5×½=?`, Basic Algebra `x−8=10 [+8][+8]`, etc.) → ours: Beginner/Basics/Intermediate/Advanced with mini finance visuals
6. "What do you want to learn first?" — Math vs CS cards → ours: Investing vs Personal Finance
7. "And where do you want to start?" — RECOMMENDED badge + 2 course cards w/ graph illustrations
8. "How do you want me to sound?" — Melodic/Deep cards + "Voice on" toggle (skip audio for now, keep the pattern)
9. "What's your daily learning goal?" — 10/20/30/60-min **timer-dial cards**; 60-min has a gradient-highlight (aspirational) treatment
10. "How will learning fit into your day?" — Morning/Afternoon/Nightly/Another-time cards with **gradient sun/moon icons**
11. Loading/pathway-build — Atlas on a light beam descending past dim nodes ("building your plan")
12. "We have everything you need" — Atlas + **topic constellation** (scattered labels w/ colored underlines: Exponents, Radicals… → ours: Compounding, Diversification, Inflation, Credit, Options…)
13. Notifications — "Reach your goal with reminders" + a **fake notification card** ("You're about to level up! One step from Level 4") + Allow / No thanks
14. "Built by the best minds" — testimonial photo cards + "World-class experts from Stanford/MIT/Harvard" logos → ours: CFP Board / finance credentials
15. Account create — Google + Apple + email + Sign up (Phase 2 auth)

Our current 6-step onboarding is good; expand toward this richer flow + segmented progress + more delightful cards.

## C. Interactive lesson mechanics (THE priority — direct manipulation)
- **Drag/tap-tile builder:** equation/statement with blank slots + a tray of term tiles; place tiles into slots, Check validates. Brilliant ex: `(x+4)(x+2)=x²+[ ]+[ ]+[ ]`, tiles `2x 4x 8x 2 4 8`.
  - Ours (finance): "Split a $3,000 paycheck (50/30/20)" → slots Needs/Wants/Save, tiles `$1,500 $900 $600` + distractors. Or "compound step: $100→+8%→$[108]→+8%→$[116.64]".
  - Build `<TileBuilder>`: tap-to-fill first (reliable), upgrade to drag (react-native-gesture-handler) later. Atlas reacts (happy/watching), reward cascade on correct.
- **Level intro screen:** title + "LEVEL 1" + big illustration + page dots + lesson-list card (Warm Up / …) + Start.
- Lesson viewer already has intro→teach→predict-reveal→celebration; add TileBuilder as a step type.

## D. Courses grid (new tab content behind Learn or a Courses screen)
- Horizontal course-category chips w/ distinct icons (Math/Basic Algebra/…) → ours course tiers.
- "Math Foundations" header + subtitle + brand illustration.
- **Vertical illustrated unit pathway:** cards (Fractions, Solving Equations w/ progress dot, Negative Numbers, Coordinate Plane) each with a rich illustration, connected by a thin vertical line. → ours: 12 finance courses w/ EUPHORIA_ICONS illustration.
- Floating rounded **bottom nav pill** (Home/Courses/Premium/You) — consider adopting the floating-pill tab bar style.

## E. Animation / juice inventory (Duolingo/Finch/Brilliant)
- Mascot: idle bob + blink (have), light-beam entrance, reactive expressions per lesson event, celebratory jump on level-up.
- Progress: segmented bar fill w/ spring; ring fills that overshoot.
- Reward cascade: confirm → confetti (have) → XP roll-up → coin toast → streak bump.
- Card press: spring (have). Tab press: bounce. Pulse halo on active node (have).
- Selection: fill-wash + ring spring (have). Number roll-ups on money/XP.

## F. Assets / decisions to ASK the user for (they invited this)
- Atlas expression set confirmation for lesson events (happy/whoa/watching/sad) — or bespoke lesson-specific Atlas poses.
- Whether to adopt the **floating-pill bottom nav** (Brilliant/Duolingo style) vs current bar.
- Real course list + lesson content per course (or keep mock).
- Sound/voice: in-scope or skip.
- Brand testimonials / credentials copy for the social-proof screen.

## Loop order (highest value first)
1. `<TileBuilder>` direct-manipulation lesson step (+ add to lesson viewer)  ← DOING NEXT
2. Courses grid screen (illustrated vertical pathway)
3. Onboarding enrichment (segmented progress + mascot spotlight + richer cards)
4. Reward cascade polish (XP roll-up + coin toast + streak bump) across app
5. Notifications + social-proof onboarding screens
