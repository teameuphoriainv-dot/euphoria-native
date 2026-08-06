# Euphoria motion & visual craft — session B plan

A previous session ran `refs/HANDOFF_MOTION.md`. **You are the session after that one.**

Your job is to finish the engagement and assemble the final document. But first:

> ⚠️ **Do not trust the previous session's completion claims. Verify them.**
> Agents routinely report work as done that was partially applied, applied to the wrong file, or
> left uncompiled. Every branch below depends on what you actually find on disk, not on what any
> summary says.

**Stack:** Expo SDK 57, RN 0.86, **Reanimated 4.5.0**, react-native-svg 15.15.4, expo-router,
expo-haptics. Dark theme only. Mascot "Atlas" = four violet rings + large eyes.

---

## STEP 0 — Verification gate (run this before reading anything)

```bash
cd ~/euphoria-native
echo "=== 1.1 LinearTransition shipped? (expect >0) ==="
grep -rn "LinearTransition\|layout=" src/components/order-steps.tsx src/components/sort-buckets.tsx
echo "=== 1.2 tokens.ts updated? (expect earned/exit/screen/press/reward) ==="
grep -n "earned\|exit\|screen\|press\|reward" src/shared/motion/tokens.ts
echo "=== 1.3 exits added? (FadeOut should be well above 4) ==="
grep -roh "FadeIn\|FadeOut\|SlideOut" src | sort | uniq -c
echo "=== does it compile? ==="
npx tsc --noEmit 2>&1 | tail -5
echo "=== what did session A leave behind? ==="
ls -la refs/*.md && git status --short 2>/dev/null | head -20
```

**Branch on the result:**

| Finding | Action |
|---|---|
| `LinearTransition` still 0 | Phase 1.1 did NOT ship. Do it first — it is the single highest-ROI change in the repo |
| `tokens.ts` lacks `earned` | Phase 1.2 did NOT ship. Apply the block from `MOTION_RESEARCH_V2.md` §4 |
| `FadeOut` count still ≈4 | Phase 1.3 did NOT ship |
| `tsc` errors | **Fix before anything else.** A broken build blocks every acceptance test below |
| A reaction-map table exists in `refs/` | Phase 2 done — validate it against §2 below, don't rewrite it |

Then read, in order: **`refs/MOTION_RESEARCH_V2.md`** (ground truth), then `refs/HANDOFF_MOTION.md`
(what A was told to do). Skip `BRILLIANT_REFERENCE.md`, `BRILLIANT_VISUAL_ANALYSIS.md` and
`README.md` — they contain stale claims and will cost you context for nothing.

**Install if absent (free):**
```
/plugin marketplace add software-mansion-labs/skills
/plugin install skills@swmansion
```

---

## SETTLED — never re-derive or re-measure

Brilliant step transition **467ms**, flash peaks 67ms in, overshoot=spring · Duolingo streak ignite
**3200ms two-stage** · motion density Brilliant 34.7/39.3%, Duolingo 31.8%, Euphoria **2%**
(scroll-inflated) · `theme.ts` surface ramp **already fixed** (4/9/14/19/22%) · haptics **already
wired app-wide**, only timing is open · `STAGGER_GAP` already correctly 60 · video 3 is **Duolingo**
not Brilliant · **Rive is paid** (export needs Cadet $9/mo + the $250 animator).

Full detail and the five corrections to older docs: `MOTION_RESEARCH_V2.md` §2, §3, §5.

---

## 1 — Close out Phase 1 if the gate found gaps

Details in `HANDOFF_MOTION.md`. **Acceptance test that actually matters** — do not skip it:

```bash
# capture the drag-sort step for ~6s, then:
python3 scripts/motion_energy.py <clip.mov>
```
**Frames-animating must exceed 15%**, up from the measured 2%. If it doesn't, the fix didn't land —
debug it rather than declaring victory. Judge in a **release build**; debug over Metro is not
representative.

---

## 2 — Atlas reaction map (finish or validate)

Read `src/components/atlas.tsx` (500 ln) and `src/components/onboarding-parts.tsx` (637 ln) —
~1,137 lines, budget context accordingly and **write the table to disk incrementally.**

Table shape, **no empty cells**:
`trigger → beat → duration(ms) → displacement(px/pt) → spring preset → deform-or-translate`

Required rows: **idle, press, acknowledge, correct, incorrect, lesson complete, streak extended,
level up, streak lost.**

Non-negotiables:
- **Earned moments are ~3200ms and two-stage** (measured, Duolingo): anticipation → burst → flash →
  resolve. Nothing in the app currently exceeds 400ms. `Duration.earned` exists for this.
- **Acknowledge ≠ celebrate.** Taps nod (2px); reveal hops (426→406→412px). Missing entirely:
  lean-in, press anticipation, **distinct success vs error**.
- **Resolve problem 4:** `AtlasStage` translates Atlas by `ATLAS_RISE` on every step change,
  competing with its own reactions. Pick one — stage moves *or* mascot reacts, never both at once.
- Every row cites a measurement, a spec, or is labelled an engineering guess. **No row may be true
  of every app ever built.**

---

## 3 — The remaining research agenda

Each answer needs **number + source + tier + confidence + falsification condition.**

**Mascot (A2–A5).** 12 principles filtered for a 6" screen at 60fps, as parameter *ranges* — and
which principles actively hurt on mobile. Follow-through lag in ms for a secondary mass (cite
Thomas & Johnston *and* a modern implementation). **Reaction budgeting** — how top apps stop a
mascot reacting to everything until it means nothing; escalation tiers. Motion tied to narrative
state (streak at risk, comeback, personal best).

**Interaction (B1, B2, B4, B5).**
⚠️ **B1 press timing CANNOT be measured from the clips** — 30fps means a ~100ms press is 3 frames.
Use Tier 1 (Apple HIG) plus the `Spring.press` preset and **say it is not measured.**
B2 selection: verify the gradient-wash claim against `refs/images/`, specify colours/stops/motion.
B4 funnel transitions: cross-fade vs slide vs shared-element vs staggered children.
B5 correct/incorrect: the full beat — colour, motion, haptic, timing, and how long the verdict holds
before Continue becomes available. Brilliant's "Incorrect" sheet is at **~66s in `10-50-24`** and
Duolingo's green "Awesome!" bar at **~75s in `14-17-49`** — both measurable.

**Timing (C3, C4).** Perceptual thresholds with real numbers (Doherty, Nielsen). 120Hz ProMotion —
the Software Mansion 120fps skill covers this.

**Visual craft (D2, D3, D4) — this is the "bland and squished" complaint. Skip D1, ramp is fixed.**
D2: state the brand-colour-for-system-signals rule precisely enough to apply mechanically.
D3: type scale, spacing rhythm, corner radii — numbers. `theme.ts` already has `Spacing` and
`Radius`; audit them rather than inventing a new scale.
D4: what separates clean from sparse — density, contrast ratio, focal hierarchy, negative-space
distribution. **The measured answer is likely illustration density**, not layout: Brilliant uses
rich semi-3D art everywhere. Open-source path is Blender + Poly Haven (CC0), already noted in
`MOTION_RESEARCH_V2.md` §6.

**Tooling (E2, E3).** E1 is **already answered** — the open-source `Claude Code → Lottie JSON →
<Skottie/> in react-native-skia` pipeline. E2: Instruments Animation Hitches, Xcode frame tools,
Reanimated devtools — is anything better than `scripts/motion_energy.py` + `measure.py`?
E3: per-beat Reduce Motion policy — what degrades vs disappears, citing Apple guidance.

---

## 4 — Assemble the final document

`refs/MOTION_FINAL.md`, containing:

1. **Executive summary** — the 5 highest perceived-quality-to-effort changes, ranked and
   opinionated, each with the expected user-visible difference.
2. Answers to every agenda item, numbered.
3. The Atlas reaction map.
4. **Ranked implementation backlog** — effort S/M/L, files touched, acceptance test per item.
5. **Sources**, tiered, explicitly listing everything that could not be verified.

Do **not** restate `MOTION_RESEARCH_V2.md` — link to it. Padding costs context and adds nothing.

---

## METHOD

```bash
python3 scripts/motion_energy.py refs/videos/*.mov          # whole-clip burst finder
python3 scripts/measure.py "path|start|end|label"           # per-window + overshoot classification
```

**Hard limits — violating these produces defects:**
- Clips are **30fps**, downscaled (444×960 / 296×640). Every duration is **±33ms**.
- **Never claim a press timing from these clips.**
- **Pixels are authoritative.** The point conversion assumes 390pt logical width and is **unverified**.
- Never present an estimate as an observation. A labelled guess is fine; a fake measurement is a defect.

**Unmeasured, worth doing:** Brilliant's Streak Charge at **~41–50s** in `13-12-29` (starburst →
bolt). A prior attempt at 51.6–54.2s was mis-targeted and returned nothing.

---

## CONSTRAINTS

- **Reanimated v4 only.** A v3 answer will not compile — that is a defect.
- **Zero budget.** Rive, Polymation, EAS, the $250 animator are all out. Atlas order of evaluation:
  (1) Claude-generated Lottie → Skia Skottie, (2) extend hand-coded `atlas.tsx`, (3) Rive if funded.
- Design tooling **open source only**: Blender + Poly Haven, Radix Colors, Iconify (already wired via
  `ecc:ios-icon-gen`), one icon set only — mixing sets is a generic-UI tell.
- The four `ecc:motion-*` skills are Framer Motion (**web**). They do not apply. Ignore them.

## DISCIPLINE

Session A's predecessor cost **~$30** and died of context exhaustion. What burned it: **web search.**
What was cheap and produced every real number: **local ffmpeg + grep.**

Batch tool calls. Prefer local measurement. **Write to disk as you go** — everything that survived
did so only because it was persisted before compaction. Ship code before reading large files.

## DONE MEANS

- [ ] Verification gate run; Phase 1 confirmed shipped **by measurement**, not by assertion
- [ ] `npx tsc --noEmit` clean
- [ ] Drag-sort re-measured **above 15%** frames-animating
- [ ] Reaction map complete — nine rows minimum, no empty cells
- [ ] `refs/MOTION_FINAL.md` written with all five sections
- [ ] Every recommendation carries a number; every number a source + tier, or UNVERIFIED
- [ ] Every Reanimated API named is v4-correct
- [ ] At least three things explicitly stated as unverified

---

## APPENDIX — the systematic sweep (NOT done, explicitly assigned to you)

Coverage so far is thin and you should know exactly how thin: **only ~6 windows across the 3 clips
have been frame-measured, and the 21 stills in `refs/images/` have never been systematically read.**
Everything measured to date is listed in `MOTION_RESEARCH_V2.md` §2 and `MOTION_FINDINGS_REWARD.md`.

### A. Sweep the stills — cheaply

`refs/images/IMG_9043–9063.PNG` (21 files). **Do NOT read them one at a time** — that is ~21 image
reads and will exhaust your context. Instead build contact sheets and read 2–3 images total:

```bash
cd ~/euphoria-native
python3 - <<'PY'
import subprocess, glob
f = sorted(glob.glob('refs/images/*.PNG'))
for i in range(0, len(f), 8):
    ins = sum([['-i', p] for p in f[i:i+8]], [])
    n = len(f[i:i+8])
    subprocess.run(['ffmpeg','-v','error',*ins,'-filter_complex',
        ''.join(f'[{j}:v]scale=200:-1[s{j}];' for j in range(n))
        + ''.join(f'[s{j}]' for j in range(n)) + f'hstack=inputs={n}' if n>1 else '[s0]null',
        '-frames:v','1','-y',f'/tmp/sheet_{i//8}.png'])
    print('wrote', f'/tmp/sheet_{i//8}.png', f[i:i+8])
PY
```
Then read the 3 sheets. Extract: **surface lightness values** (sample the dark greys — this
validates our 4/9/14/19/22% ramp against a shipped dark app), **corner radii**, **spacing rhythm**,
**icon style consistency**, and **illustration density** — which is the measured answer to D4
("bland vs sparse"), not layout.

### B. Sweep the clips — you already have the tool

```bash
python3 scripts/motion_energy.py refs/videos/*.mov   # ranks every burst by energy
```
It reports the top 28 bursts per clip; **185 bursts exist in `14-17-49` alone and 4 have been
measured.** Work down the energy ranking with `scripts/measure.py`, prioritising bursts of
**200–800ms** (discrete UI reactions) over multi-second ones (those are scrolls and inflate the
density figures). Named unexplained target: `13-12-29` @ **51.77–52.90s**, peak 43.5, the
highest-energy moment in that clip.

### C. Correct the record as you go

`refs/README.md` still mislabels video 3 as Brilliant — **it is Duolingo**. Fix it. Also merge
`MOTION_FINDINGS_REWARD.md` into `MOTION_RESEARCH_V2.md` §2 once session A has stopped writing to
that file (two agents were editing it concurrently — check `git status` before you trust it).

### Added to DONE MEANS

- [ ] All 21 stills reviewed via contact sheets, with surface/radius/spacing values extracted
- [ ] At least 15 further motion windows measured, prioritised by the energy ranking
- [ ] `README.md` video mislabel corrected
- [ ] `MOTION_FINDINGS_REWARD.md` merged and deleted
