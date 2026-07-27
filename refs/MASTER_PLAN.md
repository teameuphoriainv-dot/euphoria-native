# Euphoria — Master Redesign Plan (Brilliant + Duolingo grade)

> Single source of truth for the visual/motion redesign. Grounded in a live 23-screen audit on the
> iPhone 17 sim (2026-07-24) + a mechanism-level teardown of the user's 3 reference recordings
> (2 Brilliant, 1 Duolingo) and 21 Brilliant screenshots. Companion: `docs/status/TASKLIST.md` (phases),
> `docs/status/PROGRESS.md` (log), `docs/specs/ATLAS_ANIM_SPEC.md`, `docs/specs/ONBOARDING_ANIM_SPEC.md`, `refs/BRILLIANT_REFERENCE.md`.
> Adaptation constant: **violet not green · Atlas not Koji · finance not math · EB Garamond serif + Nunito.**

## 0. Status (what's true right now)
- App runs newest code on the sim (standalone dev-client `com.euphoria.native`, Metro `:8082`).
- **Two real crashes found and FIXED + sim-verified + committed (`e3d31a7`, pushed):**
  1. Onboarding card-select → native stack overflow (`onboarding-parts.tsx`, nested `withSpring`-in-callback) → `withSequence`.
  2. You/profile → infinite render loop (`levelProgress()` unstable zustand selector) → read via `getState()`.
- **Full 23-screen audit done** (reality table §2). No other crashes on the core journey. Deep-link red-boxes
  were entry artifacts (screens render fine in-flow) — **audit only via execbro/Maestro tap-through, never deep-link.**
- The app is **more complete than "everything's flat"** — several strong screens. The real, consistent gap vs
  both references is **illustration + motion depth on the teaching + card surfaces.**

## 1. Why Brilliant & Duolingo feel so good (the essence to breathe)
1. **A mascot accountable to every action.** Koji/the Duo coaches *breathe* (squash-preserve ±3% ~1.4s), blink
   (3–5s), **peek over cards + eye-track the selection**, hop onto the active node, react happy/oops. Our Atlas
   breathes+blinks+has 9 expressions but has **no body and no eye-track** — it can't peek or react to picks.
2. **Choreography, never simultaneity.** Lists cascade at **60ms** (translateY+24→0, opacity 0→1, scale 0.96→1);
   one *hero* overshoots (`bouncy 500/18`) while the rest ease-out (`Ease.out bezier(.16,1,.3,1)`) — focal hierarchy every frame.
3. **Signature transitions carry brand.** The **violet light-tunnel dive** between steps / into a lesson (mascot
   falls through a top→bottom gradient beam w/ speed-bars, ~0.9s) — the single most brand-defining moment. We have none.
4. **Illustrations are scenes, not glyphs.** Each unit = one concrete metaphor *toy*, semi-isometric (tilt 15–25°),
   single top-light, **soft colored contact shadow** (the premium "weight"), 2–3-stop gradients on near-black.
   Ours are flat monochrome icon bubbles.
5. **Blend the two philosophies:** **Brilliant restraint on the teaching surface** (concept/chart reveals: `gentle`,
   `Ease.out`, diagrammatic) + **Duolingo bounce on the reward/feedback layer** (correct-flash, combo-bolt, geyser
   wipe, results-stagger, streak-flame, path-node bounce: `bouncy/snappy`, particles).

Damping band 18–32: entrances overshoot (bouncy 500/18), state-changes snappy (420/32), containers/sheets smooth
(260/30, no bounce), secondary gentle (180/26). **Palette:** references are green/lime/blue/gold; **keep the measured
timing/shape, remap color to violet `#7C5CFF`**, gold `#FFC800` only for XP/streak.

## 2. Reality Table (23 screens, live sim audit — score = matches-reference 1–5)
| Screen | Shot | State | vs Brilliant/Duolingo — gap | Score |
|---|---|---|---|---|
| Welcome | euph_welcome | ✅ | Atlas = eyes only, no body/trail (Koji + Duo owl have bodies) | 2.5 |
| Onboarding 1–2 | ob1 / fix_verify | ✅ **crash fixed** | flat icon-bubbles (9045=3D tiles); no card stagger; Atlas no eye-track | 3 |
| Onboarding 3 grow | 03_onboard3 | ✅ | violet/grey growth chart (verify draw-on); "4×"/Atlas static | 3 |
| Onboarding 4 social | 04_onboard4 | ✅ | text testimonials (9051=photo-cards+logos); no Atlas; 50k/stars static | 2.5 |
| Onboarding 5 path | 05_onboard5 | ✅ | numbered path + $10k goal; plain rows, no stagger/Atlas | 3 |
| Onboarding 6 paywall | 06_paywall | ✅ | Unlock Pro, 4 props; checks could RewardPop, Atlas flat | 3.5 |
| Home | home4 | ✅ | strong (streak, goal ring, chart draw-on); flat tab bar; delta/streak not roll-up | 4 |
| Learn | learn | ✅ | monochrome glyph nodes (9063 rich art; Duo f460 bouncing node+ring); no scroll stagger | 3.5 |
| Lesson intro | lesson | ✅ | generic Atlas hero (9060=per-topic 3D hero); no tunnel-in | 3 |
| **Lesson teach** | 41_lesson_teach | ✅ | 🔴 **text-only points, NO diagram/illustration, NO Atlas** — biggest gap | 2 |
| Lesson widget | 42_lesson_step | ✅ | genuine estimate slider + Check; no live preview/number-roll | 3.5 |
| Trade | 20_trade | ✅ | strong ($104k green chart, segs, positions); prices static; rows no stagger | 4 |
| Stock/[sym] | 21_stock_nvda | ✅ | NVDA detail, green chart, ABOUT, CTA; price static; sparse below | 3.5 |
| Digest | 30_digest | ✅ | serif feed + filter pills; card icons flat; no filter transition | 3.5 |
| **Digest/[slug]** | 31_digest_article | ✅ | 🟠 **content-STUB** (headline+lead+1 generic ¶); no drop-cap/imagery | 2.5 |
| You | 10_you | ✅ **crash fixed** | renders clean; static Atlas avatar, XP bar no fill, no streak calendar, flat certs | 3 |
| Courses | 60_courses | ✅ | compact flat cards (9063=large illustrated cards + spine line) | 3 |
| Games hub | 51_games | ✅ | 2-col grid, flat glyph icons, PRO locks; cards no press-pop | 3 |
| Term Match | 52_termmatch | ✅ | match + countdown; no correct-flash/haptic/combo (Duo combo-bolt) | 3 |
| League | 53_league | ✅ | strong Diamond League + promo/demo zones, You highlighted; static (no rank-up/XP-roll) | 4 |
| Explore/compound | 50_compound | ✅ | strong explorable ($104,185/20yr + curve + steppers); number no roll on change | 4 |
| Settings/[section] | 54_settings_account | ✅ | designed "coming soon" + Atlas (no dead end) but not functional | 2.5 |
| Auth | (real entry TBD) | ⬜ | reach via logout/sign-in (not deep-link); 9059 = social + email | — |
| Full lesson reward | ⬜ | ⬜ | walk a Learn lesson to done → Duo results-stagger/combo/XP-roll comparison | — |

Shots in `/tmp/walk/` + `/tmp/euph_welcome.png,home4.png,learn.png,lesson.png,ob1.png,fix_verify.png`.

**Prioritized findings:** (1) 🔴 lesson teach = text-only, no illustration/Atlas; (2) 🟠 digest articles are stubs;
(3) 🟡 flat icons on every card surface; (4) 🟡 Atlas has no body; (5) 🟡 static numbers, no tunnel, flat tab bar;
(6) 🟢 strong bones: Home/Trade/League/Compound/estimate-widget/empty-states.

## 3. Reference Index — every animation traces to the user's footage
V1 = Brilliant onboarding (`…10-50-24`, 444×960, 30fps 108s) · V2 = Brilliant lesson+league (`…13-12-29`, 122s) ·
V3 = Duolingo lesson (`…14-17-49`, 296×640, 268s). 2fps frames at `/tmp/bf/v{1,2,3}`.
**Measure method (at execution, not invention):** `ffmpeg -ss <t> -t <d> -i <vid> -vf fps=30 /tmp/fbf/<n>/f%03d.jpg`
→ read 8–16 frames → track position/scale → compute ms (`frames/30·1000`), overshoot, easing → map to a token.

| Animation → Euphoria screen | Src | Window | Recipe feel |
|---|---|---|---|
| Tunnel transition (step→step / into lesson) | V1 | 14.5–17.5s, 24–35s | beam `scaleY withTiming 400 Ease.out`; speed-bars loop; incoming `withDelay(400)` |
| Card-select pop + mascot react | V1 | 60–63s | `card-pop` withSequence(→1.035 bouncy,→1 smooth); Atlas eye-track |
| Segmented progress fill | V1 | 15/25/35s | `width withTiming(pct, base, Ease.out)` + leading glow |
| Mascot idle breathe + blink | V1 | 22–24s | squash-preserve `withRepeat(1.03,1400)`; blink `withSequence(→.1@70,→1@90)` |
| Correct/Incorrect feedback | V2/V1 | ~40s / f125 | violet ripple + border glow / red border + shake ×3 |
| Feedback sheet slide-up (bg recede .94) | V2 | ~40s | `translateY withSpring gentle`; backdrop opacity; bg `scale .94` |
| Coach idle + per-question character swap | V3 | 90–120s | sine idle loop; spring pop-in 0.85→1 |
| Owl idle drop-in (trailing legs) | V3 | 98.5s | `bouncy`, legs `withDelay(60)` (secondary anim) |
| **COMBO lightning-bolt burst** | V3 | 97.5–98s | text `withSequence(→1.3,bouncy)`; bolt `strokeDashoffset` |
| Progress states green→gold-combo→cyan-hard | V3 | 90–130s | `withTiming(pct, slow, Ease.out)` + recolor |
| **Geyser burst-up** lesson→results wipe | V3 | 131s | `scaleY withSpring bouncy` bottom-anchored + foam stagger |
| **Results stagger** XP/COMBO/BLAZING + count-up | V3 | 135–137.5s | `ZoomIn.delay(i*60).springify()` + `NumberRollup` |
| **"Streak is born" flame** + weekday dots | V3 | 149.5–150.5s | bubble `gentle`; "1" `bouncy`; flame `withRepeat` jitter |
| **Learn-path bouncing node + pulsing ring** | V3 | 230s | node bob loop; ring `scale1→1.15 opacity1→0` loop |
| Two-tier wrong ("So close" amber vs red) | V3 | 96s | kinder near-miss correction |
| Tile-select → answer-row travel + Check-enable | V3 | ~115s | shared-element `withSpring snappy`; ghost slot; button color `fast` |

**Static screenshot layout targets (`refs/images/IMG_90xx`):** welcome=9043 · mascot=9044/9062 · quiz=9045/9052 ·
tile-demo=9047 · subjects=9048/9053 · testimonial=**9051** · constellation=9054/**9055** · timer-dial=**9056** ·
sun/moon=**9057** · notif=**9058** · auth=**9059** · LEVEL-hero=**9060** · tunnel=**9061** · courses=**9063**.

## 4. Foundation Decisions (resolved with user)
- **Illustration = hybrid:** Atlas → **enhanced SVG** (give it a soft violet blob body; Rive stays parked).
  Per-unit/lesson hero art → **Lottie** (`lottie-react-native`, one native rebuild). `<HeroArt name>` renders
  Lottie when present, else an enhanced-SVG isometric composition (EUPHORIA_ICON + gradient + contact shadow) —
  never blank. UI glyphs stay on `src/lib/euphoria-icons.ts`.
- **Bottom nav = floating pill** (rebuild `components/tab-bar.tsx`).
- **Build on repo specs:** `docs/specs/ATLAS_ANIM_SPEC.md` (10 expressions + B1–B10 behaviors, exact SVG coords) and
  `docs/specs/ONBOARDING_ANIM_SPEC.md` (per-step table + 10-item checklist) are ground-truthed — follow them.

## 5. Motion Kit (`src/shared/motion/`)
**Reuse:** `tokens.ts` (Spring.{smooth260/30,gentle180/26,bouncy500/18,snappy420/32}, Duration.{fast150,base280,
slow400,count900}, Ease.out, STAGGER_GAP=60 — **never inline literals; that caused the crash**) · `rise-in` ·
`reward-pop` · `number-rollup` · `spring-pressable` · `animated-chart` (draw-on) · `confetti`/`pulse-halo`/`daily-goal-ring`.
**New:** `tunnel-transition` · `slide-swap` (onboarding H-slide) · `ripple-feedback` (violet correct / red incorrect) ·
`card-pop` (safe select-pop) · `stagger` (index→delay helper) · `idle-pulse` (CTA) · **Duolingo-derived:**
`combo-burst` · `geyser-wipe` · `results-stagger` (ZoomIn+count-up) · `streak-flame`.

## 6. Atlas Mascot Spec (enhanced SVG)
`atlas.tsx` = pinwheel mark + eyes, 9 expressions, idle blink/breathe, celebrate/shake/bounce/spin (uses
`withSequence` safely at :81/96/111). **Add a soft body** (rounded superellipse, violet→magenta gradient, contact
shadow) behind the eyes, then complete: **eye-track/peek** (body translateY -20 gentle + slot offsetX toward
selection), hop-on-select, wave entrance, happy/proud, oops, watching, celebrate, **tunnel-dive**. Add
`ATLAS_ANIM_SPEC §2` expressions (curious/wink…) as capacity allows; all guard `if (reduced) return`.

## 7. Per-Screen Specs (ref frame · gap · files · motion)
- **Welcome (9043):** Atlas body + breathe on beam + descending violet trail (reuse `AtlasComet`). `atlas.tsx`, `welcome.tsx`.
- **Onboarding ×6 (9045/9051/9057):** 56px illustrated tiles + `card-pop` + `stagger`; Atlas watching→eye-track→hop;
  `slide-swap` between steps, `tunnel-transition` into app; NumberRollup 50k/$10k; star RewardPop; CTA `idle-pulse`.
  `onboarding.tsx`, `onboarding-parts.tsx`, new primitives, `HeroArt`.
- **Home (strong):** time-of-day Atlas greeting; NumberRollup delta/streak; week-ticks animate; floating pill. `home.tsx`, `tab-bar.tsx`.
- **Learn (9063/Duo f460):** colorful gradient nodes (icon+ring+3D lip+shadow); scroll `stagger`; connector draws on;
  Atlas hop onto active node + PulseHalo. `learn.tsx`.
- **Lesson (9060 + Duo):** 🔴 **teach steps get a diagram/`HeroArt` + Atlas present** (top gap); per-topic 3D hero;
  `tunnel-transition` on Continue; `ripple-feedback` correct/incorrect; verify reward cascade (`lesson.tsx:319`). `lesson.tsx`, `HeroArt`, `ripple-feedback`.
- **Bottom nav (9060/9063):** inset floating pill, 5 items, animated selection blob (snappy). `(tabs)/_layout.tsx`, `tab-bar.tsx`.
- **Digest:** real article body (fix stubs) + drop-cap + filter transition. `digest.tsx`, `digest/[slug].tsx`.
- **Long tail:** Trade/Stock (NumberRollup prices, sparkline draw-on) · You (bodied avatar, XP spring-fill, streak
  heatmap) · Courses (large illustrated cards + spine, 9063) · Games/Term-Match (press-pop, correct=violet+combo) ·
  League (rank-up + XP roll) · Explore (number roll on stepper).

## 8. Signature "missing Brilliant" screens (onboarding value-props)
Timer-dial goal (9056) · sun/moon time (9057) · topic constellation (9055, finance labels) · testimonial photo-cards +
CFA/CFP/Wharton/Booth/NYSE logos (9051) · notification-permission fake level-up card (9058) · **finance illustration
set** (Compounding=snowball, Diversification=basket, Inflation=balloon/bill, Credit=card+ladder, Options=fork,
Stocks=candlesticks, Risk=scale) for HeroArt + unit art.

## 9. Build Order (impact ÷ effort — ship + Gate-2 verify + commit each)
0. ✅ **Audit + crash triage** — DONE (both crashes fixed+verified+committed; 23-screen reality table).
1. **Native + kit:** `expo run:ios` rebuild (link Lottie) + add motion primitives + `HeroArt` (SVG fallback).
2. **Mascot body (C)** + Welcome (brand-defining).
3. **Lesson teach illustration + Atlas** (🔴 highest-value gap) + ripple feedback + tunnel-in.
4. **Onboarding** illustrated cards + Atlas eye-track + slide + tunnel across all 6.
5. **Nav pill + Home** polish + number roll-ups.
6. **Learn** colorful nodes + **Digest** real content + drop-cap.
7. **Signature onboarding screens** (E) + finance art set.
8. **Long tail:** Trade/Stock/You/Courses/Games/League/Explore polish; reward-moment Duo parity.

## 10. Verification Protocol — physically prove motion (two gates)
- **Gate 1 layout:** `simctl io screenshot` → `sips -Z 850` → Read → compare to named ref frame.
- **Gate 2 MOTION (the real proof):** `simctl io recordVideo /tmp/verify/<x>.mov &` → trigger (execbro `tap`,
  `burst=true` for transient pops) → stop → `ffmpeg -vf fps=30` → **lay sim frames beside the §3 reference frames**;
  pass = same shape/direction/overshoot/duration (±1–2 frames), not just end state. Fail → fix → re-record.
- **Then:** `tsc --noEmit` clean → commit+push → tick `docs/status/TASKLIST.md` → update `docs/status/PROGRESS.md`.
- **Infra:** Metro `:8082` alive (`curl :8082/status`); hard reload = terminate→launch→openurl LAN `192.168.1.69`;
  land on a screen via temp `app/index.tsx` Redirect flip → **revert to `/welcome`**; audit **via execbro/Maestro
  tap-through only** (deep-linking tab/param routes red-boxes them out of context). execbro CDP=401 → use OCR/coord taps.

## 11. Risks / Open Questions
- **Lottie rebuild** (~10 min) + hero-art asset files — `HeroArt` SVG fallback means nothing blocks; **confirm rebuild.**
- **Hero-art source:** designer / AI-gen / commissioned? Gates batches 6–7.
- **Digest article content:** who writes the real bodies (currently stubs)?
- **Auth entry point + paywall monetization + auth provider** — deferred until the visual pass lands.
