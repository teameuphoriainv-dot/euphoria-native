# Euphoria — conversion-driven screen redesign

Session 2026-08-06. Evidence from **ScreensDesign** (recorded flows + revenue estimates) unless
marked otherwise. Grounded in `COMPETITIVE_ANALYSIS.md`, `MOTION_RESEARCH_V2.md`,
`MOTION_FINDINGS_REWARD.md` — not restated here.

Revenue figures are ScreensDesign **estimates** and are commercial-performance proxies. No
conversion metric is available for any competitor, so nothing below claims an app "converts
well" — only that high-revenue apps use a pattern.

---

## 0. Two corrections before anything else

**1. The brief says Euphoria's onboarding is 6 steps. It is 15.** Counted from the `STEPS`
array in `src/app/onboarding.tsx`: 11 questions + 2 statements + loader + reveal + paywall.
Every recommendation that followed from "ours is short, Brilliant's is 15" is inverted.

**2. Longer onboarding is not the pattern among apps that earn.** ScreensDesign, Education
category, ≥12 onboarding steps, ≥$50k/mo — **92 apps**. Ranked by revenue:

| App | Monthly revenue | Onboarding steps | Quiz Qs | Paywalls |
|---|---|---|---|---|
| Duolingo | **$48,000,000** | **13** | 5 | 1 |
| Speak & Learn English (Learna) | $5,000,000 | **13** | 8 | 1 |
| Speak | $3,250,000 | **13** | 4 | 1 |
| Pimsleur | $1,750,000 | **12** | 0 | 1 |
| Solid Starts | $1,250,000 | 44 | 22 | 1 |
| Impulse | $1,000,000 | 14 | 6 | 1 |
| Loora AI | $1,000,000 | 26 | 12 | 1 |
| Plant Parent | $1,000,000 | **13** | 5 | 1 |
| Headway | $850,000 | 35 | 9 | 2 |
| Vocabulary | $800,000 | 20 | 11 | 1 |

**Five of the top eight sit at 12–14 steps.** The 26–44 step flows earn 1–3% of Duolingo's.
That is not proof that short wins — revenue is confounded by brand, spend and age — but it
**removes any evidence-based case for lengthening**. Euphoria at 15 is already at the top of
the modal band.

> **Do not add onboarding steps. If anything, cut to 13.**

---

## 1. Executive summary — five ranked changes

| # | Change | Funnel step | Expected effect |
|---|---|---|---|
| 1 | **Paywall-dismissal offer.** "Maybe later" currently routes straight to Home with nothing. Loora AI ($1M/mo) shows a "free lesson" gift on dismissal | paywall → trial | Recovers a share of the ~majority who dismiss. Predicted **+8–15% relative** trial starts |
| 2 | **Make the reward convertible.** XP → something real. Zogo redeems points for gift cards; Stash awards stock (`COMPETITIVE_ANALYSIS.md` §2) | activation → D7 retention | Largest *strategic* lever; smallest design lever. **UNVERIFIED** magnitude |
| 3 | **Reinforcement screens after quiz answers.** Duolingo runs **3**; Euphoria runs **0** | onboarding completion | Predicted **+3–6%** onboarding completion |
| 4 | **Streak commitment during onboarding.** Duolingo asks users to *commit* to an N-day streak (uniqueness 7/10) | activation → D2 return | Predicted **+5–10%** D2 |
| 5 | **De-violet the content layer.** Content is **70.5%** brand hue vs Brilliant's **20.2%** (`MOTION_RESEARCH_V3.md` §D2) | install → activation | Addresses "generic". Effect on conversion **UNVERIFIED** |

---

## 2. Funnel map, and where I believe the drop is

```
install → onboarding (15 steps) → loader → plan reveal → PAYWALL → "Maybe later" → Home → lesson 1 → …
                                                            ↑
                                                   largest drop-off
```

**Why the paywall, specifically.** It is the only hard gate before value, it arrives *before*
the user has completed a single lesson, and its dismissal path is a dead end — `onboarding.tsx`
routes "Maybe later" straight to `/home` with no counter-offer. Every other step in the flow
has a next action; this one has an exit.

Note the ordering risk: Euphoria shows the paywall **before first lesson**. Duolingo's recorded
flow delivers the first lesson *before* account creation. **UNVERIFIED** whether moving the
paywall after lesson 1 helps here — it is the single highest-value experiment in §4.

---

## 3. Per-screen specs

All values are existing tokens. `Spacing` = half 2 / one 4 / two 8 / three 16 / four 24 /
five 32 / six 64. `Radius` = sm 8 / md 12 / lg 16 / xl 24 / pill 999. Type: display 32/40,
title 26/32, heading 19/25, body 16/23, small 13/18, label 11/14. Layout at 390pt.

### 3.1 Paywall — highest leverage

Keep: the trial timeline (Today / In 5 days / In 7 days). It is a **validated** pattern —
Learna, Vocabulary and Headway all ship a visual trial timeline, and all three are in the
revenue table above.

Change:
- **Add a dismissal offer.** Intercept "Maybe later": present one free lesson, `Radius.lg`
  card on `cardElevated`, CTA `primary` #A855EB full-width 56pt. Only then route to `/home`.
- **Single value claim above plan cards**, `type="title"` (26/32), replacing feature
  enumeration. Anchor on the mandate (30 states, 2026 — `COMPETITIVE_ANALYSIS.md` §1).
- Plan cards: annual pre-selected `backgroundSelected` (L19%) with `primary` border at 1.5pt;
  monthly on `card` (L9%) with `border` (L22%) hairline.
- Fine print `type="small"` in `mutedForeground` #A79DB5 — **7.07:1 on card**, verified AA.

Empty/loading: skeleton cards at `card`, no spinner. Error: keep plan cards, replace CTA with
retry; never blank the screen — a blank paywall is a lost session.

### 3.2 Lesson complete / reward

`MOTION_FINDINGS_REWARD.md`: both Duolingo and Brilliant hold a verdict **~1000ms ±150ms** in
complete stillness. Respect it — do not animate through the verdict.

The reward beat itself should run at `Duration.earned` **3200ms** two-stage (measured, V2 §2).
Nothing in the app currently exceeds 400ms. See `ATLAS_REACTION_MAP.md` rows 6–7.

### 3.3 Correct / incorrect verdict

Separate by **axis**, not intensity: correct = vertical pop, incorrect = horizontal shake
(`ATLAS_REACTION_MAP.md` rows 4–5). Verdict banner holds ~1000ms still before Continue enables.
Colours: `success` #22C55E, `warning` #F5B33F — both ≥7:1 on `card`.

### 3.4 Home / learn path

Already rebuilt around a continue-hero this session and it tests well structurally. The change
here is **chromatic**: course art must carry `COURSE_ACCENTS` (12 hues) rather than defaulting
violet. Target content brand-hue **≤35%**, ≥8 distinct hues.

### 3.5 Lesson intro · 3.6 lesson step · 3.7 streak · 3.8 profile

**NOT SPECIFIED — insufficient evidence pulled.** I did not retrieve competitor screens for
these four. Specifying them from taste would violate the brief's own quality bar. They are the
first thing to pull next session.

---

## 4. A/B test plan, ranked by expected value ÷ effort

| Test | A (current) | B (proposed) | Primary metric | MDE | Kill criterion |
|---|---|---|---|---|---|
| **T1** Paywall dismissal offer | "Maybe later" → Home | → one-free-lesson offer → Home | paywall view → trial start | +8% rel | trial→paid drops >10% |
| **T2** Paywall placement | before lesson 1 | after lesson 1 completes | install → trial start | +10% rel | D1 retention drops >5% |
| **T3** Onboarding length | 15 steps | 13 (cut `source`, `ageBand`) | onboarding completion | +4% rel | personalisation quality complaints rise |
| **T4** Streak commitment | none | commit to N-day streak at step 12 | D2 return | +5% rel | onboarding completion drops >3% |
| **T5** Reinforcement screens | 0 | 3 after key answers | onboarding completion | +3% rel | time-to-value >3min |

T1 first: smallest diff, clearest mechanism, no risk to the rest of the funnel.

---

## 5. Evidence appendix

**Pulled:** ScreensDesign `search_apps`, Education category, ≥12 onboarding steps, ≥$50k/mo —
92 apps, top 10 by revenue with full onboarding-sequence intelligence (step counts, quiz
counts, paywall counts, unique-pattern annotations). Named patterns cited above come from that
pull: Duolingo's streak-commitment and conversational quiz; Loora AI's post-dismissal free-gift;
Headway's pre-paywall commitment pact; Learna/Vocabulary/Headway trial timelines.

**Notable null result:** Duolingo's recorded onboarding contains **zero** social-proof screens —
no testimonials, no star ratings, no press mentions. Euphoria removed fabricated testimonials
earlier for legal reasons; this suggests nothing of conversion value was lost.

**NOT pulled — stated rather than glossed:**
1. **No paywall screen images were retrieved.** §3.1 is built on onboarding-sequence metadata
   and pattern annotations, not on inspected paywall visuals.
2. **Zogo, Stash, Greenlight, Blossom, NGPF were not located in ScreensDesign.** The revenue
   table is Education-category apps, not the finance-education competitor set. The competitor
   revenue gaps in `COMPETITIVE_ANALYSIS.md` §6 therefore **remain open**.
3. **No App Store creative research** (`search_store_screens` unused).
4. **No visual-similarity pass** on Euphoria's own screens.

**UNVERIFIED:** every predicted effect size in §1 and §4 is an engineering estimate, not a
measured lift. Revenue is a commercial proxy, not a conversion measurement — no ScreensDesign
field reports conversion. And whether moving the paywall after lesson 1 helps is genuinely
unknown; T2 is a real experiment, not a foregone conclusion.
