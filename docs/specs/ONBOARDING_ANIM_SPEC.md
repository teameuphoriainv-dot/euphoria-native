# Onboarding Animation Spec — Euphoria Native
> Implementation-ready animation spec for Euphoria onboarding.
> Grounded in Duolingo reference video frames + current Euphoria codebase audit.
> All primitives referenced exist in `src/shared/motion/` unless noted.

---

## 1. Duolingo Onboarding — Observed Screen-by-Screen

### Launch / splash
- Dark screen → Duo owl appears dead-center with a **bounce-in entrance**: scale 0→1.15→0.97→1.0, opacity 0→1 in ~80ms; overshoots, settles with damped spring (~350ms total).
- Logo wordmark fades in 200ms AFTER owl lands (delay ~300ms).
- No progress bar yet — clean empty header.

### Onboarding question screens (language-selection, goal, level, daily-goal, motivation, etc.)
**Screen entrance (every screen transition):**
- Outgoing screen **slides left** off-screen (`translateX: 0 → -screenWidth`) simultaneously as incoming slides in from the right (`translateX: +screenWidth → 0`). Duration ~320ms, ease-out-cubic feel (not a pure linear slide).
- Header progress bar segment fills BEFORE content arrives — fills over ~250ms with spring easing, slight overshoot.

**Within-screen element stagger (content appears after slide completes):**
- Duo owl: arrives first — instant or 0ms delay from transition end.
- Question headline: `FadeInDown` — 0ms delay, ~300ms, translateY +16→0.
- Option cards/pill rows: staggered `FadeInDown`, 50ms gap between each card, starting ~80ms after headline. Cards 1–4 appear over ~240ms total.

**Option card selection feedback:**
- Tap down: card **scales to 0.97**, background fill washes in (green tint) — simultaneous with scale, ~100ms.
- Tap up / selection confirmed: spring back to 1.0 (~120ms, stiffness 400 feel). Border swaps from muted → bright green with ~80ms `withTiming`.
- Radio dot: inner fill circle `RewardPop`-style scale 0→1, `withSpring(stiffness 460, damping 16)`, ~120ms.
- **Sound + haptic**: light tap haptic on every selection (Duo uses sound; Euphoria uses haptic).

**Continue button:**
- Disabled state: 40% opacity, no press feedback.
- Enabled: full opacity, `SpringPressable` scale 0.97→1 on press. If tap unlocks it, button scales in from 0.95→1 with `withSpring(stiffness 300, damping 22)`.

### Owl mascot behavior per screen
- **Idle**: gentle bob up/down ±3–4px, period ~2.2s (sinusoidal). Blink every 3–5s, 130ms.
- **Question screen appears**: owl expression neutral/curious (`watching` equiv) — pupils track slightly toward the option list.
- **User makes selection**: owl transitions to happy/pleased expression (brow lift, happy eyes). In Duo: mouth curves up. Transition takes ~180ms.
- **Wrong answer / back navigation**: owl expression shifts to `sad`/`oops` briefly (~600ms), then resets.
- **Celebration / streak screen**: owl **jumps** — `translateY: 0 → -24px → 0` (spring, stiffness 320, damping 9), expression "happy" → "proud", arms-up body rotation if 3D. Duration ~500ms.

### Progress bar (segmented, 3 chunks)
- Current step fill uses **spring** not linear: `withSpring(stiffness 200, damping 24)` — small overshoot past fill end, bounces back.
- On back navigation: partial unfill also springs backward.
- Each chunk has rounded caps, thin height (~7px), gap 6px between chunks.

### Multi-select/pill screens (language source, topics)
- Pills animate in with `FadeInDown` stagger, 40ms gap.
- Selected pill: background fills green (`withTiming` 120ms) + checkmark icon `RewardPop`-scales in (stiffness 500, damping 16).
- Multiple selections can be active; each deselect reverses the fill (~80ms).

### Pathway-build / loading screen
- Owl sits atop a light-beam shaft (vertical gradient, top-to-bottom, green→transparent).
- Dim pathway nodes appear sequentially from top (stagger 80ms each), then pulse once.
- Owl bobs while "building" — no additional entrance, already on screen.

### Social proof / testimonial screen
- Testimonial cards `FadeInDown` stagger: 100ms, 180ms, 260ms after screen arrives.
- Star rating `RewardPop`: scale 0.6→1, stagger each star 30ms.

### Paywall / subscription CTA screen
- Owl appears with `entrance="bounce"` (scale 0→1.12→0.96→1.0, ~350ms).
- Perks list items: `FadeInDown` stagger 60ms each.
- Primary CTA button: full-width gradient, `SpringPressable` scale 0.97 on press, `impactAsync Light` haptic.
- "No thanks" / "Maybe later" text: smaller, `FadeIn` at end of list stagger + 80ms.

### Screen-to-screen transition detail
- Type: **horizontal page slide**, custom transition (not default RN stack push).
- Duration: 300–340ms.
- Easing: ease-out-cubic (`Easing.bezier(0.16, 1, 0.3, 1)` — same as Euphoria's `Ease.out`).
- Back gesture: standard iOS swipe-back with interactive drag on a `Stack` navigator.

### Celebration / reward beats
- On completing a question section or streak milestone: confetti burst (particle emitter) from top + owl jump.
- XP chip (`+10 XP`) animates up from the bottom with `RewardPop` spring + 200ms translate-up.
- Streak number rolls up with `NumberRollup`-style count.

---

## 2. Euphoria Mapping — Concrete RN Implementation

### 2.1 Screen entrance / transition
**What Duo does**: horizontal slide-in, ~320ms, ease-out-cubic.
**Current Euphoria**: `RiseIn` (single `FadeInDown` wrapping the whole step) — no horizontal slide, no exit animation, step swap is instant.

**Implementation**: Replace `setState(step+1)` + `key={sN}` pattern with an animated scroll via `Animated.FlatList` or a manual `translateX` approach.

```ts
// In onboarding.tsx — replace RiseIn key-based remount with:
const slideX = useSharedValue(0);
const goNext = () => {
  if (reduced) { setStep(s => s+1); return; }
  slideX.set(withTiming(-screenWidth, { duration: 300, easing: Ease.out }, () => {
    runOnJS(setStep)(s => s+1);
    slideX.set(screenWidth);
    slideX.set(withTiming(0, { duration: 300, easing: Ease.out }));
  }));
};
// Wrap ScrollView content in Animated.View with translateX: slideX
```

### 2.2 Progress bar spring fill
**What Duo does**: spring fill with slight overshoot on each step advance.
**Current Euphoria**: `segFill` width is set via `{ width: \`\${fill * 100}%\` }` — static, no animation.

**Implementation** (`src/components/onboarding-parts.tsx` → `ProgressHeader`):
```ts
// Replace static width with animated shared value:
const fillWidth = useSharedValue(0);
useEffect(() => {
  fillWidth.set(withSpring(fill, { stiffness: 200, damping: 24 }));
}, [fill]);
const animStyle = useAnimatedStyle(() => ({ width: `${fillWidth.get() * 100}%` }));
// <Animated.View style={[styles.segFill, animStyle, { backgroundColor: theme.primary }]} />
```

### 2.3 Atlas entrance per step — expression + behavior map
**What Duo does**: owl arrives with bounce entrance on splash; expression reacts to each screen type; jump on celebration.
**Current Euphoria**: Atlas expression is set per step but never changes mid-step; no entrance animation on step changes; `celebrate` prop exists but is never triggered.

| Step | Atlas expression | entrance | celebrate | notes |
|------|-----------------|----------|-----------|-------|
| 0 — Goal select | `default` | `"bounce"` | false | First appearance; spin on tap as easter egg |
| 1 — Level select | `watching` | none | false | Atlas watches the option list |
| 2 — Growth chart | `happy` | none | true (on mount) | Jump triggers as chart line animates in |
| 3 — Social proof | `proud` | none | false | Proud posture while testimonials appear |
| 4 — Path ready | `happy` | `"bounce"` | true | Jump as each path item reveals |
| 5 — Paywall | `default` (then `celebrate` on CTA tap) | `"bounce"` | false→true on CTA | Celebrate jump on trial start tap |

```tsx
// Step 2 example — trigger celebrate with delay after chart draws:
const [doJump, setDoJump] = useState(false);
useEffect(() => {
  if (step === 2) setTimeout(() => setDoJump(true), 800);
}, [step]);
<Atlas size={78} expression="happy" celebrate={doJump} />
```

### 2.4 OptionCard selection spring
**What Duo does**: scale 0.97 on press-in, spring back; fill wash + border ring in 120ms; radio dot RewardPop.
**Current Euphoria**: `SpringPressable` wraps `OptionCard` (scale 0.97 — ✓ already correct). Border color change is static (no transition). RadioDot fills instantly.

**Implementation** (`onboarding-parts.tsx` → `RadioDot`):
```tsx
// Animate the inner fill circle scale:
const innerScale = useSharedValue(selected ? 1 : 0);
useEffect(() => {
  innerScale.set(withSpring(selected ? 1 : 0, { stiffness: 460, damping: 16 }));
}, [selected]);
// Replace static <Circle r={5.5}> with Animated circle scaled by innerScale
```

**OptionCard border**:
```tsx
const borderAnim = useSharedValue(selected ? 1 : 0);
useEffect(() => { borderAnim.set(withTiming(selected ? 1 : 0, { duration: 120 })); }, [selected]);
// Interpolate borderColor: theme.border → theme.primary
// Interpolate backgroundColor alpha: 0 → 0x14
```

### 2.5 OptionCard content stagger
**What Duo does**: cards stagger in 50ms apart after screen arrives.
**Current Euphoria**: Cards render without individual stagger.

**Implementation** (`onboarding.tsx`):
```tsx
{GOALS.map((g, i) => (
  <RiseIn key={g.key} delay={i * 50}>   // add delay prop — already supported
    <OptionCard ... />
  </RiseIn>
))}
```
(Same pattern for LEVELS on step 1.)

### 2.6 GrowthChart animated line draw
**What Duo does**: momentum/stats charts animate their line drawing on entrance.
**Current Euphoria**: `GrowthChart` is a static SVG — line is fully drawn on mount.

**Implementation** (`onboarding-parts.tsx` → `GrowthChart`):
```tsx
// Use react-native-svg AnimatedPath + strokeDashoffset trick:
const progress = useSharedValue(0);
useEffect(() => {
  progress.set(withTiming(1, { duration: 1200, easing: Ease.out }));
}, []);
// strokeDasharray={[pathLength, pathLength]} strokeDashoffset={progress * pathLength * -1}
// Atlas celebrate triggers at ~800ms into this animation
```

### 2.7 Social proof — staggered testimonial cards + star pop
**What Duo does**: testimonial cards stagger in 80ms apart; star rating uses RewardPop per star.
**Current Euphoria**: Step 3 already uses `<RiseIn delay={100 + i * 80}>` for cards — ✓ CORRECT.
Stars render statically.

**Implementation** (`onboarding.tsx` step 3):
```tsx
// Replace <Stars /> with animated variant:
<View style={{ flexDirection: 'row', gap: 3 }}>
  {Array.from({ length: 5 }).map((_, i) => (
    <RewardPop key={i} delay={i * 40}>
      <Svg ...><Path ... fill="#FBBF24" /></Svg>
    </RewardPop>
  ))}
</View>
// NumberRollup for the "50,000+" user count:
<NumberRollup value={50000} suffix="+" type="display"
  style={{ color: theme.primary }} />
```

### 2.8 Path-ready reveal — number dots + target chip entrance
**What Duo does**: path items reveal sequentially after mascot bounce; each item pops in.
**Current Euphoria**: All path items render simultaneously inside one `RiseIn`.

**Implementation** (`onboarding.tsx` step 4):
```tsx
// Stagger path items:
{['Foundations…', 'Risk & psychology', 'Trading…'].map((item, i) => (
  <RiseIn key={item} delay={i * 120}>
    <View style={styles.pathRow}>
      <RewardPop delay={i * 120 + 60}>  // numDot pops AFTER row appears
        <View style={[styles.numDot, ...]}>
          <ThemedText ...>{i + 1}</ThemedText>
        </View>
      </RewardPop>
      <ThemedText type="bodyMedium">{item}</ThemedText>
    </View>
  </RiseIn>
))}
// Target chip entrance delayed after all path items:
<RiseIn delay={3 * 120 + 80}>
  <View style={[styles.targetChip, ...]}>...</View>
</RiseIn>
```

### 2.9 Paywall perks — stagger + CTA pulse
**What Duo does**: perks stagger in; CTA button has a subtle attention pulse (scale 1→1.03→1) every few seconds when idle.
**Current Euphoria**: Perks render in one RiseIn; CTA has no idle pulse.

**Implementation** (`onboarding.tsx` step 5):
```tsx
// Stagger perks:
{PRO_PERKS.map((perk, i) => (
  <RiseIn key={perk} delay={i * 70}>
    <View style={styles.pathRow}>...</View>
  </RiseIn>
))}
// CTA idle pulse (in GradientButton or wrapper):
const pulse = useSharedValue(1);
useEffect(() => {
  if (step === 5) {
    const id = setInterval(() => {
      pulse.set(withSequence(
        withSpring(1.025, Spring.gentle),
        withSpring(1, Spring.gentle),
      ));
    }, 3200);
    return () => clearInterval(id);
  }
}, [step]);
```

### 2.10 "Maybe later" link entrance
**What Duo does**: secondary skip link fades in ~200ms after the primary CTA fully appears.
**Current Euphoria**: Renders immediately with CTA. No separate delay.

```tsx
// In footer:
{step === 5 && (
  <RiseIn delay={PRO_PERKS.length * 70 + 200} variant="fadeIn">
    <SpringPressable haptic={false} onPress={...}>
      <ThemedText type="small" themeColor="mutedForeground">Maybe later</ThemedText>
    </SpringPressable>
  </RiseIn>
)}
```

### 2.11 Back-navigation progress bar spring reverse
**What Duo does**: pressing back un-fills the progress bar with the same spring.
**Current Euphoria**: `back()` calls `setStep(step - 1)`, bar re-renders but `segFill` width changes instantly (no spring reverse since width is not animated at all currently).
Addressed as part of upgrade #2 (animated progress bar).

### 2.12 Button enabled-state transition
**What Duo does**: when first selection is made, Continue transitions from disabled→enabled with a scale-in + color fill.
**Current Euphoria**: `disabled={!canContinue}` changes opacity but no animated transition.

```tsx
const btnScale = useSharedValue(0.95);
useEffect(() => {
  btnScale.set(withSpring(canContinue ? 1 : 0.95, Spring.snappy));
}, [canContinue]);
// Also animate opacity: 0.4 → 1 with withTiming(150ms)
```

---

## 3. Build Plan — Ordered Upgrade Checklist

Each item = one loop-cycle deliverable. Ranked by impact-per-effort.

### [1] ⬛ Animated progress bar spring fill
- **File**: `src/components/onboarding-parts.tsx` → `ProgressHeader` / `SegFill`
- **Change**: Convert `segFill` static width to `useSharedValue` + `withSpring(stiffness:200, damping:24)` on step change.
- **Impact**: Visible on every step transition — transforms the bar from static to alive.
- **Effort**: ~30 lines.
- **Reduced motion**: skip spring, set width directly.

### [2] ⬛ Atlas entrance="bounce" on first step + expression-per-step map
- **File**: `src/app/onboarding.tsx`
- **Change**: Add `entrance="bounce"` to step 0 and step 4 Atlas. Set `celebrate` prop on step 2 (delayed 800ms). Map all expressions per the table in §2.3.
- **Impact**: Atlas goes from decorative to reactive mascot; feels alive from frame 1.
- **Effort**: ~20 lines.
- **Reduced motion**: `entrance` prop already short-circuits in `atlas.tsx`.

### [3] ⬛ Option card stagger + animated border/radio
- **Files**: `src/app/onboarding.tsx` (add `delay={i * 50}` to `RiseIn` wrappers around OptionCard), `src/components/onboarding-parts.tsx` (animate `RadioDot` fill + `OptionCard` border color).
- **Change**: Stagger card appearance; animate border color swap with `withTiming(120ms)`; animate radio inner fill with `withSpring(stiffness:460, damping:16)`.
- **Impact**: Selection feels satisfying — the biggest perceived-quality gap vs Duo.
- **Effort**: ~50 lines.
- **Reduced motion**: omit stagger delays, instant border/fill changes.

### [4] ⬛ GrowthChart animated line draw
- **File**: `src/components/onboarding-parts.tsx` → `GrowthChart`
- **Change**: Import `AnimatedPath` from `react-native-svg`; compute path length; animate `strokeDashoffset` 0→1 over 1200ms `Ease.out`. Trigger Atlas `celebrate` callback at 800ms.
- **Impact**: Step 2 goes from static chart → feels like a live demo of Euphoria's value.
- **Effort**: ~40 lines.
- **Reduced motion**: render fully drawn instantly.

### [5] ⬛ Staggered star pop + NumberRollup for social proof (step 3)
- **File**: `src/app/onboarding.tsx` step 3
- **Change**: Replace `<Stars />` with `RewardPop`-staggered per-star render (40ms gap). Replace "50,000+" static text with `<NumberRollup value={50000} suffix="+" type="display" style={{ color: theme.primary }} />`.
- **Impact**: High-emotion screen becomes a micro-celebration moment.
- **Effort**: ~25 lines.
- **Reduced motion**: instant via existing `RewardPop` + `NumberRollup` reduced-motion handling.

### [6] ⬛ Path-ready sequential reveal (step 4)
- **File**: `src/app/onboarding.tsx` step 4
- **Change**: Wrap each path item in `RiseIn delay={i * 120}`, wrap numDot in `RewardPop delay={i*120+60}`. Wrap target chip in `RiseIn delay={460}`.
- **Impact**: Step 4 "Your path is ready" becomes a reveal sequence — highest emotional beat in onboarding.
- **Effort**: ~20 lines.
- **Reduced motion**: render instantly.

### [7] ⬛ Button enabled-state transition + paywall perk stagger
- **File**: `src/app/onboarding.tsx`
- **Change**: Animate `GradientButton` scale + opacity when `canContinue` changes (§2.12). Stagger paywall perks with `RiseIn delay={i * 70}` (step 5).
- **Impact**: Goal/level screens — first selection "unlocks" CTA visually; paywall reveals feel premium.
- **Effort**: ~30 lines.
- **Reduced motion**: instant transitions.

### [8] ⬛ Horizontal slide screen transition
- **File**: `src/app/onboarding.tsx`
- **Change**: Replace key-based `RiseIn` remount with a shared `translateX` slide (see §2.1). Outgoing: `0 → -screenWidth`; incoming: `+screenWidth → 0`; both over 300ms `Ease.out`. Back gesture slides right.
- **Impact**: Elevates the entire flow from "tab switching" to a real onboarding journey.
- **Effort**: ~60 lines (most complex change — implement last to avoid disrupting earlier upgrades).
- **Reduced motion**: instant step swap (existing behavior).

### [9] ⬛ CTA idle pulse on paywall step
- **File**: `src/app/onboarding.tsx` step 5 footer
- **Change**: `withSequence(withSpring(1.025, Spring.gentle), withSpring(1, Spring.gentle))` on 3.2s interval while step === 5.
- **Impact**: Attention direction for undecided users.
- **Effort**: ~15 lines.
- **Reduced motion**: skip entirely.

### [10] ⬛ "Maybe later" delayed entrance
- **File**: `src/app/onboarding.tsx` step 5 footer
- **Change**: Wrap in `RiseIn delay={PRO_PERKS.length * 70 + 200} variant="fadeIn"` (§2.10).
- **Impact**: Avoids the skip link competing visually with the CTA.
- **Effort**: ~5 lines.

---

## 4. "Even Better Than Duo" Notes

### A. Atlas > Owl — richer mascot vocabulary
Duo's owl has 2 expression states visible in onboarding (neutral/happy). Atlas has 9 named expressions. Use them:
- `thinking` expression while user deliberates (after 3s of no selection, switch to `thinking`; switch back on tap).
- `whoa` briefly (200ms) on first selection, then `happy` — a micro-reaction flash.
- `proud` on the path-ready screen (not just happy) — feels more personalized.
- `glasses` prop on the level-select screen for the "experienced" level card hover/select.

### B. NumberRollup everywhere Duo uses static numbers
- "50,000+ investors" (step 3) — roll up on first render (implemented in #5 above).
- "$10k paper portfolio" target on step 4 — `NumberRollup value={10000} prefix="$"`.
- Future: XP and streak numbers everywhere in the app.

### C. Violet gradient > flat green
Duo uses flat green fills. Euphoria's violet gradient (`gradientFrom: hsl(274 76% 61%)` → `gradientTo: hsl(278 76% 66%)`) adds depth. Apply as:
- Selected OptionCard background: gradient tint instead of flat `primary + '14'`.
- ProgressBar fill: linear gradient instead of solid `theme.primary`.
- Paywall CTA: already uses `GradientButton` — carry this into the enabled-state pulse.

### D. AtlasComet entrance on paywall step
`AtlasComet` already exists (`src/components/atlas.tsx`). Use it instead of plain `Atlas` on step 5 for the paywall — Atlas arriving on a violet comet trail signals "premium arrival" vs Duo's static owl.

```tsx
// Step 5:
<AtlasComet size={100} />  // already built; zero new code
```

### E. Finance-specific social proof metrics
Replace Duo-style "X million learners" with finance credibility signals: animate the star rating (`4.9`) as a `NumberRollup value={4.9} prefix="" suffix=" ★"` — subtle but unique.

### F. Haptic choreography
Duo uses sound; Euphoria should use haptics as the audio equivalent:
- Card selection: `ImpactFeedbackStyle.Light` (already in `SpringPressable` when `haptic=true`).
- CTA press: `ImpactFeedbackStyle.Medium`.
- Atlas celebrate jump: `NotificationFeedbackType.Success` from `expo-haptics`.
- Progress bar segment fill completion: `ImpactFeedbackStyle.Rigid` (brief, crisp).

### G. Mascot tooltip / speech bubble (future)
Duo shows owl speech bubbles mid-flow. Euphoria can add an Atlas speech bubble that fades in after a 1.5s pause on the goal screen: "I'll build your plan around this." — slide-in from behind Atlas with `FadeInDown delay={1500}`. This creates a conversational feel unique to a finance coach persona.

---

## Appendix: File Reference

| File | Role |
|------|------|
| `src/app/onboarding.tsx` | Main onboarding screen — 6 steps, all animation changes land here |
| `src/components/onboarding-parts.tsx` | `ProgressHeader`, `OptionCard`, `RadioDot`, `GrowthChart`, `Stars` — component-level animation upgrades |
| `src/components/atlas.tsx` | Mascot — `entrance`, `celebrate`, `shake`, `expression`, `glasses` props already implemented |
| `src/shared/motion/rise-in.tsx` | `RiseIn` — `FadeInDown` spring entrance; supports `delay` + `variant` |
| `src/shared/motion/spring-pressable.tsx` | `SpringPressable` — tap scale feedback; use on all interactive elements |
| `src/shared/motion/reward-pop.tsx` | `RewardPop` — bouncy scale-in for badges, stars, dots |
| `src/shared/motion/number-rollup.tsx` | `NumberRollup` — count-up for XP/money/stats |
| `src/shared/motion/tokens.ts` | `Spring.*`, `Duration.*`, `Ease.*`, `STAGGER_GAP` — all spring configs |
| `src/constants/theme.ts` | `Colors.dark.primary = '#A855EB'`, `BrandGradient`, `Spacing`, `Radius` |
