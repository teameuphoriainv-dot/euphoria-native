# Atlas Animation Spec — Euphoria Native

_Ground-truth source: `src/components/atlas.tsx` (read 2026-07-21)_
_References: V1 (122s Brilliant app walkthrough), V2 (108s Brilliant onboarding flow), stills not accessible (Messages dir permission-gated — omitted from analysis)._

## ✅ Implemented (loop: skip these; build the next unchecked from §4 Priority Order)
- [x] B1 Idle Breathing Bob — global, all Atlas instances
- [x] `thinking` expression
- [x] B3 Shake on Wrong Answer (`shake` prop) — wired into lesson quiz wrong-answer
- [x] `oops` expression — wired into lesson quiz wrong-answer
- [x] B5 Bounce-In Entrance (`entrance="bounce"` prop) — wired into lesson `done`
- [x] `proud` expression — wired into lesson `done`
- [ ] NEXT: `curious` expression + B4 Head Tilt → then `wink`, B6 anticipation squash, B7 idle eye wander, `celebrate-eyes`, B8 confetti, `sleepy`, `love`, `focused`, B2 eye-track, `dizzy`, B10 tap ripple

---

## 1. What the References Actually Show

### V1 — Brilliant App Lesson Walkthrough (122s)

- **Lesson UI (0–55s):** Dark-mode algebra UI; balance-scale interactive problems with 3D yellow weight icons. Correct/incorrect states toggle red flash on the scale pan then a green "Correct!" overlay slides in from below (~0.25s ease-out). Wrong answer causes the scale to visually shake (≈3 rapid left-right nudges, ~80ms each).
- **Lightning bolt streak unlock (~60–76s):** A yellow 3D bolt icon pulses in — starts at ~0.6 scale, springs to 1.15 then settles at 1.0 (total ~400ms). Text "You sparked a new streak!" animates in with a fade+upward slide (translateY from +16→0, ~300ms). A white starburst flash (opacity 1→0 in ~120ms) fires on the beat.
- **Streak charge sequence (~68–76s):** Same bolt, repeated across 4–5 cells; each cell pops in with a staggered delay (~80ms between items) — clear "cascade" timing.
- **3D character entrance (~88–122s):** A fully 3D rendered human character (Brilliant mascot — jeans, backpack, casual shirt) enters from the right via a slide+scale combo (~350ms spring). He then loops through idle animations: subtle weight-shift bob (torso tilts ~3° left/right, ~1.8s period), thumbs-up gesture hold, then wave (arm lifts with anticipation dip then full arc, ~600ms).
- **Character expression beats:** Nodding head (pitch ~10°, down then back, ~300ms × 2), shrug pose (shoulders up + hands out, ~400ms hold, then drop), and a "talking" open/close mouth on text-reveal moments.
- **Screen transitions:** Modal sheets slide up with a spring (stiffness ~200, damping ~22 feel). Lesson complete overlays fade in at full opacity over ~200ms then the inner card scales from 0.9→1.0 with a spring.
- **Correct answer ripple:** Green ring radiates outward from the tap point (scale 0.5→1.8, opacity 1→0, ~350ms linear).
- **Premium upsell screens:** Shimmer/gradient sweep across plan cards (left-to-right, ~1.2s cycle, repeating). Icons for premium features bounce in sequentially (~60ms stagger, spring scale from 0→1).

### V2 — Brilliant Onboarding Flow (108s)

- **Green 3D bot mascot (0–30s):** A rounded green robot/character (smooth, friendly, Pixar-style) is the primary UI mascot throughout onboarding. It sits at mid-screen, ~30% of viewport height.
- **Idle breathing loop:** The bot's body gently scales up ~3% and back on a ~2.2s sine cycle — barely perceptible but alive-feeling. No rotation.
- **Greeting sequence (~0–8s):** Bot pops in with a spring bounce (scale 0→1.12→1.0, ~500ms), immediately followed by a small wave — right arm lifts 45° then returns, ~400ms, with an anticipation dip of ~−5° before the lift.
- **Question screen transitions (8–60s):** Each new question fades in; the bot stays persistent but shifts expression. When a goal is selected, the bot does a small hop (~−12% height, spring, ~300ms up + ~350ms down).
- **Loading / "thinking" idle (~28–35s):** Bot's eyes (two green circles) animate in a slow side-to-side pan — pupil drifts left, pauses ~0.6s, drifts right, ~0.8s period. No body movement.
- **Subject selection cards (~35–60s):** Pill cards bounce in with staggered spring (~50ms between, scale 0→1.05→1.0). Selected card gets a border highlight pulse (1px→3px stroke, then back, ~200ms).
- **Level/skill picker (~60–80s):** Horizontal scroll list; selected item scales 1.0→1.08 with a spring. A progress bar fills left-to-right with an easing curve (~0.6s, ease-in-out).
- **Sign-up / auth screens (~80–108s):** Standard slide-in transitions; no mascot visible. Progress dots pulse on active step (scale 1→1.3→1, ~200ms).
- **Overall easing character:** Spring-heavy throughout. Damping feels ~12–18 (slight overshoot). No linear easing seen on primary interactions. Stagger cascades used consistently for lists.

### Summary of Reference Character

The references are **Brilliant.org** (not Duolingo/Finch). Two mascots observed:
1. **V1:** A fully rigged 3D human character — complex poses, no direct SVG analogue for Atlas, but gesture/expression *timing* is highly transferable.
2. **V2:** A simple rounded green bot — much closer to Atlas's design language. Its idle breathing, eye pan, hop-on-select, and wave entrance are directly implementable in Atlas's SVG+Reanimated stack.

---

## 2. New Atlas Expressions to Add

Coordinate system: `viewBox="0 0 100 104"`. Eye whites: L=(34.8,26.5) r≈13, R=(61.2,25.0) r≈11.8. Ink: `#1A1523`. All shapes drop into the `switch(active)` block in `pupils()`.

### `thinking`
One pupil up-and-left (contemplating), other straight. Single curved brow arc on the "thinking" eye.
```svg
<!-- Left eye: pupil upper-left -->
<Circle cx={32} cy={22} r={6.6} fill={INK} />
<Circle cx={29.8} cy={20} r={2.2} fill="#fff" />
<!-- Right eye: pupil center-left, smaller -->
<Circle cx={59} cy={23.5} r={5.8} fill={INK} />
<Circle cx={57} cy={21.5} r={1.8} fill="#fff" />
<!-- Left brow: angled up-left -->
<Path d="M26 20 Q34.8 16.5 42 19.5" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
```

### `proud`
Eyes slightly squinted (crescent-bottom half), pupils centered-up, confident look.
```svg
<!-- Left: pupil center-up -->
<Circle cx={34.8} cy={22.5} r={6.6} fill={INK} />
<Circle cx={32.6} cy={20.5} r={2.2} fill="#fff" />
<!-- Right: pupil center-up -->
<Circle cx={61.2} cy={21.2} r={6} fill={INK} />
<Circle cx={59} cy={19.2} r={2} fill="#fff" />
<!-- Bottom eyelid squint lines — arcs below pupil center -->
<Path d="M24 28.5 Q34.8 33 45.6 28.5" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
<Path d="M51.4 27 Q61.2 31.2 71 27" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
```

### `wink`
Left eye normal open pupil; right eye closed as a short horizontal arc (wink line).
```svg
<!-- Left eye: default pupil -->
<Circle cx={36.5} cy={24.8} r={6.6} fill={INK} />
<Circle cx={34} cy={22.2} r={2.2} fill="#fff" />
<!-- Right eye: wink = single arc line -->
<Path d="M53.5 25.5 Q61.2 28.8 69 25.5" stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
```

### `curious`
Eyes wide-open (enlarged whites during this expression → use `whiteR=[15,14]`), pupils shifted to same side (both look left or right), one brow cocked.
```svg
<!-- Both pupils shifted right (+4 from center) -->
<Circle cx={38.8} cy={26.5} r={6.6} fill={INK} />
<Circle cx={36.5} cy={24} r={2.2} fill="#fff" />
<Circle cx={65.2} cy={25} r={6} fill={INK} />
<Circle cx={63} cy={22.8} r={2} fill="#fff" />
<!-- Left brow cocked (one side raised) -->
<Path d="M27 18.5 Q34.8 15 41 17.5" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
```
_Note: add `whiteR` case for `curious` → `[15, 14]` in the `whiteR` ternary._

### `love`
Hearts in place of pupils (approximated with two overlapping circles + Path wedge, or just large dots with pink fill as simplified hearts).
```svg
<!-- Left eye: heart approximation — two filled dots + wedge path -->
<Circle cx={32.5} cy={25.5} r={4.5} fill={INK} />
<Circle cx={37} cy={25.5} r={4.5} fill={INK} />
<Path d="M28.5 26.5 Q34.8 33.5 41 26.5" fill={INK} stroke="none" />
<!-- Right eye: same, scaled -->
<Circle cx={59} cy={24} r={4} fill={INK} />
<Circle cx={63.4} cy={24} r={4} fill={INK} />
<Path d="M55.4 25 Q61.2 31.5 67 25" fill={INK} stroke="none" />
```

### `dizzy`
Spiral eyes — approximate with two concentric partial arcs creating a spin illusion, or X marks.
```svg
<!-- Left eye: X pupils (two crossing short paths) -->
<Path d="M29.3 22 L40.3 31" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
<Path d="M40.3 22 L29.3 31" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
<!-- Right eye: X pupils -->
<Path d="M55.7 20.5 L66.7 29.5" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
<Path d="M66.7 20.5 L55.7 29.5" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
```

### `sleepy`
Half-closed eyelids (flat bottom on eye whites via Path over the lower half), pupils centered-low.
```svg
<!-- Left: pupil drops down -->
<Circle cx={34.8} cy={30} r={6.2} fill={INK} />
<Circle cx={32.8} cy={28} r={2} fill="#fff" />
<!-- Right: pupil drops down -->
<Circle cx={61.2} cy={28.5} r={5.6} fill={INK} />
<Circle cx={59.2} cy={26.8} r={1.8} fill="#fff" />
<!-- Drooping eyelid arcs over top half of whites -->
<Path d="M22.8 24.5 Q34.8 18 46.8 24.5" stroke={INK} strokeWidth={4} strokeLinecap="round" fill={INK} />
<Path d="M49.8 23 Q61.2 17 72.6 23" stroke={INK} strokeWidth={4} strokeLinecap="round" fill={INK} />
```
_The thick filled arc covers the upper portion of each eye white, simulating heavy lids._

### `oops` (error/surprised-downward)
Pupils drop to bottom of whites (looking down-ashamed), mouth-like downward curve brows.
```svg
<!-- Left: pupil low-center -->
<Circle cx={34.8} cy={32} r={6} fill={INK} />
<Circle cx={32.8} cy={30.2} r={1.8} fill="#fff" />
<!-- Right: pupil low-center -->
<Circle cx={61.2} cy={30.5} r={5.4} fill={INK} />
<Circle cx={59.3} cy={28.8} r={1.6} fill="#fff" />
<!-- Concerned brows — both angled downward-inward -->
<Path d="M25 19 Q34.8 23 43.5 20" stroke={INK} strokeWidth={2.8} strokeLinecap="round" fill="none" />
<Path d="M52 19 Q61.2 23 70.5 20" stroke={INK} strokeWidth={2.8} strokeLinecap="round" fill="none" />
```

### `celebrate-eyes`
Star-shaped pupils (simplified as multiple radiating short lines from center — ✦ effect).
```svg
<!-- Left eye: starburst pupil -->
<Circle cx={34.8} cy={26.5} r={3.5} fill={INK} />
<Path d="M34.8 19.5 L34.8 33.5 M27.8 26.5 L41.8 26.5 M29.9 21.6 L39.7 31.4 M39.7 21.6 L29.9 31.4" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
<!-- Right eye: starburst pupil -->
<Circle cx={61.2} cy={25} r={3.2} fill={INK} />
<Path d="M61.2 18.3 L61.2 31.7 M54.5 25 L67.9 25 M56.7 20.2 L65.7 29.8 M65.7 20.2 L56.7 29.8" stroke={INK} strokeWidth={2} strokeLinecap="round" fill="none" />
```

### `focused`
Squinted, determined look — small pupils, no highlight, brow arched aggressively.
```svg
<!-- Small tight pupils, no whites -->
<Circle cx={34.8} cy={27} r={4.2} fill={INK} />
<Circle cx={61.2} cy={25.5} r={3.8} fill={INK} />
<!-- Sharp V-brow -->
<Path d="M24 18 Q34.8 22.5 40 19" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
<Path d="M55 18 Q61.2 22.5 70 19" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
```

---

## 3. New Motion Behaviors to Add

All behaviors must check `if (reduced) return;` before animating. All shared values listed assume addition to the `Atlas` component.

### B1. Idle Breathing Bob
A gentle vertical float imitating the V2 bot's alive idle.

```ts
const breathY = useSharedValue(0);

useEffect(() => {
  if (reduced) return;
  breathY.set(
    withRepeat(
      withSequence(
        withTiming(-size * 0.025, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true
    )
  );
}, [reduced, size]);
```
Add `{ translateY: breathY.get() }` into `wrapStyle`. Period: 2.2s. Amplitude: 2.5% of size.

### B2. Eye-Tracking (pupil follows pointer/tilt)
On mobile use `DeviceMotion` to offset pupil position by ±3 units in the SVG coord space.

```ts
const eyeOffsetX = useSharedValue(0);
const eyeOffsetY = useSharedValue(0);

// DeviceMotion subscription (expo-sensors):
DeviceMotion.addListener(({ rotation }) => {
  const dx = clamp(rotation.gamma * 18, -3, 3);
  const dy = clamp(rotation.beta * 10, -2, 2);
  eyeOffsetX.set(withSpring(dx, { stiffness: 80, damping: 18 }));
  eyeOffsetY.set(withSpring(dy, { stiffness: 80, damping: 18 }));
});
```
Pass `eyeOffsetX`/`eyeOffsetY` as props into `pupils()`, apply as `cx={34.8 + eyeOX}` etc. Fallback to 0 when motion unavailable or `reduced`.

### B3. Shake on Wrong Answer (new prop: `shake`)
Rapid horizontal oscillation signaling error. Mirrors the balance-scale shake in V1.

```ts
// New prop: shake?: boolean
const shakeX = useSharedValue(0);

useEffect(() => {
  if (!shake || reduced) return;
  shakeX.set(
    withSequence(
      withTiming(-size * 0.06, { duration: 60 }),
      withTiming(size * 0.06, { duration: 60 }),
      withTiming(-size * 0.05, { duration: 55 }),
      withTiming(size * 0.05, { duration: 55 }),
      withTiming(-size * 0.025, { duration: 50 }),
      withSpring(0, { stiffness: 300, damping: 20 }),
    )
  );
}, [shake, reduced]);
```
Add `{ translateX: shakeX.get() }` to `wrapStyle`. Total duration: ~350ms.

### B4. Head Tilt on `curious` Expression
Slight counter-clockwise tilt to reinforce the curious expression.

```ts
const tiltAngle = useSharedValue(0);

useEffect(() => {
  if (reduced) return;
  const target = expression === 'curious' ? -8 : 0;
  tiltAngle.set(withSpring(target, { stiffness: 180, damping: 14 }));
}, [expression, reduced]);
```
Apply as `{ rotate: `${tiltAngle.get()}deg` }` in `wrapStyle` after translateY. (Note: uses `useAnimatedStyle` with `.get()` — same pattern as existing `wrapStyle`.)

### B5. Bounce-In Entrance (new exported component or prop: `entrance="bounce"`)
Atlas pops into existence — scale 0→1.1→0.95→1.0 with stagger.

```ts
const entranceScale = useSharedValue(0);
const entranceOpacity = useSharedValue(0);

useEffect(() => {
  entranceOpacity.set(withTiming(1, { duration: 80 }));
  entranceScale.set(
    withSequence(
      withSpring(1.12, { stiffness: 320, damping: 8 }),
      withSpring(0.96, { stiffness: 280, damping: 14 }),
      withSpring(1.0, { stiffness: 240, damping: 18 }),
    )
  );
}, []);
```
Merge into `wrapStyle`. Total time: ~550ms. Skip to scale=1, opacity=1 when `reduced`.

### B6. Anticipation Squash Before Jump
Add a downward squash+horizontal stretch frame ~100ms before the jump peak, mimicking the V1 character's body-weight anticipation.

Modify existing `celebrate` effect:
```ts
// Replace current jumpY effect with:
jumpY.set(withDelay(180,
  withSequence(
    withSpring(size * 0.06, { stiffness: 480, damping: 12 }),   // squash down
    withSpring(-size * 0.30, { stiffness: 340, damping: 8 }),   // jump up
    withSpring(0, { stiffness: 220, damping: 12 }),             // land
  )
));
// Add squashScale shared value:
squashScale.set(withDelay(180,
  withSequence(
    withSpring(0.88, { stiffness: 480, damping: 12 }),          // squash
    withSpring(1.08, { stiffness: 340, damping: 8 }),           // stretch
    withSpring(1.0, { stiffness: 220, damping: 12 }),
  )
));
```
Apply `{ scaleX: squashScale, scaleY: 2 - squashScale }` (reciprocal axes for squash-stretch).

### B7. Idle Eye Wander (when `expression === 'default'` and no blink)
Every 4–9s, pupils slowly drift to a random direction then return, mimicking the V2 bot's side-to-side pan.

```ts
const eyeWanderX = useSharedValue(0);

useEffect(() => {
  if (reduced) return;
  let alive = true;
  let t: ReturnType<typeof setTimeout>;
  const wander = () => {
    t = setTimeout(() => {
      if (!alive) return;
      const dir = (Math.random() - 0.5) * 4; // ±2 SVG units
      eyeWanderX.set(withSequence(
        withTiming(dir, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withDelay(700, withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) })),
      ));
      wander();
    }, 4000 + Math.random() * 5000);
  };
  wander();
  return () => { alive = false; clearTimeout(t); };
}, [reduced]);
```
Apply offset in `pupils()` default case: `cx={36.5 + eyeWanderX.get()}` etc. (requires `useAnimatedProps` on a `AnimatedCircle`).

### B8. Celebration Spin + Particle Combo
Enhanced celebrate — pairs the existing body spin with a burst of small circles radiating outward.

```ts
// New prop: confetti?: boolean (subset of celebrate)
// When confetti=true, render 6 Animated.View small colored circles around Atlas
// each flies outward at a random angle with withTiming(distance, {duration: 600}) + fade
const CONFETTI_COLORS = ['#B862ED', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
// Stagger each particle by 40ms; scale from 0→1 in 100ms then fade opacity 1→0 in 400ms
// Wrap in a View positioned at center of Atlas; each particle is a 6×6 circle
```
This is implemented outside the SVG, as a `View` overlay with `position: absolute`.

### B9. Ear/Body Wiggle on `silly` Expression (auto-triggered)
When expression changes to `silly`, do a quick double-shake of rotation (±6°).

```ts
const wiggle = useSharedValue(0);

useEffect(() => {
  if (expression !== 'silly' || reduced) return;
  wiggle.set(withSequence(
    withTiming(6, { duration: 80 }),
    withTiming(-6, { duration: 80 }),
    withTiming(4, { duration: 70 }),
    withTiming(-4, { duration: 70 }),
    withSpring(0, { stiffness: 300, damping: 20 }),
  ));
}, [expression, reduced]);
```
Apply as rotation on the `<AnimatedG>` wrapping just the eye layer, or on `wrapStyle` with `rotateZ`.

### B10. Tap Ripple Feedback
On `onPress`, emit a circular ripple ring from Atlas center (complement to current spin).

```ts
const rippleScale = useSharedValue(0);
const rippleOpacity = useSharedValue(0);

// In onPress / spin():
rippleScale.set(withTiming(2.4, { duration: 450, easing: Easing.out(Easing.quad) }));
rippleOpacity.set(withSequence(
  withTiming(0.35, { duration: 50 }),
  withTiming(0, { duration: 400 }),
));
```
Render as an `Animated.View` positioned absolute, centered on Atlas: a circle border `borderRadius: size/2`, `borderWidth: 2`, `borderColor: '#B862ED'`, sized `size × size` then scaled.

---

## 4. Priority Order

Ranked by **impact-per-effort** for a one-addition-per-build-cycle cadence:

| # | Addition | Type | Impact | Effort | Notes |
|---|----------|------|--------|--------|-------|
| 1 | **B1 Idle Breathing Bob** | Behavior | Very High | Very Low | 10 lines; makes Atlas feel alive at all times; V2 bot has this and it's the single biggest "alive" signal |
| 2 | **`thinking` expression** | Expression | High | Very Low | 3 SVG shapes; directly useful during loading/AI-response states |
| 3 | **B3 Shake on Wrong Answer** | Behavior | High | Low | Needs `shake` prop; critical for lesson feedback loop; V1 balance-scale reference confirms this pattern |
| 4 | **`oops` expression** | Expression | High | Very Low | Pairs with shake behavior; complete the wrong-answer beat |
| 5 | **B5 Bounce-In Entrance** | Behavior | High | Low | V2 bot entrance is the first thing users see; sets tone for whole app |
| 6 | **`proud` expression** | Expression | Medium-High | Very Low | Reward moment after correct answer; complements celebrate |
| 7 | **B4 Head Tilt on `curious`** | Behavior | Medium | Low | Expression + motion pair; uses `tiltAngle` shared value |
| 8 | **`curious` expression** | Expression | Medium | Very Low | Enables B4; useful for hint/question moments |
| 9 | **B6 Anticipation Squash** | Behavior | Medium | Low | Modify existing celebrate; squash-stretch principle; high polish |
| 10 | **`wink` expression** | Expression | Medium | Very Low | Charm moment; easy to trigger on streak achievements |
| 11 | **B7 Idle Eye Wander** | Behavior | Medium | Low | Adds depth to default idle; avoid if DeviceMotion adds too much complexity |
| 12 | **`celebrate-eyes` expression** | Expression | Medium | Low | Starburst pupils are complex to draw cleanly — verify at small sizes |
| 13 | **B8 Celebration Spin + Confetti** | Behavior | Medium | Medium | Requires View overlay + confetti particle logic outside SVG |
| 14 | **`sleepy` expression** | Expression | Low-Medium | Low | Nice for low-activity/late-night states |
| 15 | **B9 Silly Wiggle** | Behavior | Low | Low | Fun but niche; only fires on `silly` |
| 16 | **`love` expression** | Expression | Low-Medium | Low | Heart pupils have rendering edge cases; test at 80px size |
| 17 | **B2 Eye Tracking (DeviceMotion)** | Behavior | Low | High | Requires `expo-sensors` dep; fun novelty but accessibility concern — skip until core set done |
| 18 | **`dizzy` expression** | Expression | Low | Low | Situational; X-eyes pattern works but use-case limited |
| 19 | **`focused` expression** | Expression | Low | Very Low | Niche; maybe for timed quiz mode |
| 20 | **B10 Tap Ripple** | Behavior | Low | Low | Complements spin but redundant; polish pass item |

### Top 5 Highest-Impact Additions (in order)
1. **Idle Breathing Bob (B1)** — transforms Atlas from static icon to living character with 10 lines of code
2. **`thinking` expression** — most-needed missing state (AI loading, hint generation)
3. **Shake on Wrong Answer (B3)** — closes the most critical UX feedback gap
4. **`oops` expression** — paired with B3; expression + motion = complete wrong-answer beat
5. **Bounce-In Entrance (B5)** — first impression on every screen Atlas appears; reference shows this pattern drives engagement

---

## Implementation Notes

- **`useReducedMotion` contract:** Every `useEffect` driving animation must guard with `if (reduced) return;`. For expressions, no guard needed (they're static shapes). For entrance (B5), snap immediately to final state: `entranceScale.set(1); entranceOpacity.set(1);`.
- **`AtlasExpression` type update:** Add new string literals: `'thinking' | 'proud' | 'wink' | 'curious' | 'love' | 'dizzy' | 'sleepy' | 'oops' | 'celebrate-eyes' | 'focused'` to the union type.
- **`whiteR` cases:** `curious` → `[15, 14]`; `dizzy` → `[13, 11.8]` (default); `love` → `[14, 12.8]`; `celebrate-eyes` → `[14, 12.8]`.
- **SVG coordinate precision:** All coords above are derived from the existing `(34.8,26.5)` / `(61.2,25.0)` centers. Verify at `size=80` and `size=160` — the viewBox scales uniformly so proportions hold.
- **Easing imports:** B1/B7/B10 need `Easing` from `react-native-reanimated`. Add to existing import.
- **Confetti (B8):** Implement as a separate `AtlasConfetti` component wrapping `Atlas`, similar to the existing `AtlasComet` pattern — keeps `Atlas` prop surface clean.
