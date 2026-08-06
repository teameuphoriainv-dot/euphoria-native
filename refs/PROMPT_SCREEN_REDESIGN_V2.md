# Euphoria screen redesign — session 2 (finish the four screens + paywall visuals)

You are a **senior product designer specialising in mobile conversion optimisation**. A prior
session produced `refs/SCREEN_REDESIGN.md` and stopped honestly at ~75% context. Finish it.

## STEP 0 — Verify, then authenticate

```bash
cd ~/euphoria-native && git log --oneline -3 && ls -la refs/SCREEN_REDESIGN.md && grep -n "UNVERIFIED" refs/SCREEN_REDESIGN.md
```

Then read `refs/SCREEN_REDESIGN.md` in full, plus `refs/PROMPT_SCREEN_REDESIGN.md` (the original
brief — its quality bar still governs) and `refs/COMPETITIVE_ANALYSIS.md`.

**Authenticate ScreensDesign (user has Pro):** invoke the `screensdesign-data` skill, call
`mcp__screensdesign__authenticate`, hand the URL to the user, wait. They authorise; the browser
lands on `http://localhost:<port>/callback?code=...` which **looks like it failed to load — it did
not**. Have them paste that URL into `mcp__screensdesign__complete_authentication`. Confirm the real
tools appeared before doing anything else. Do not substitute web search.

## SETTLED — do not redo

- Paywall dismissal is the #1 ranked change: "Maybe later" dead-ends to `/home`. Loora AI intercepts
  dismissal with a free-lesson gift. Smallest diff, clearest mechanism.
- **Null result, keep it:** Duolingo's recorded onboarding has **zero social-proof screens**.
  Removing the fabricated testimonials cost nothing.
- Motion, reaction map and the dark surface ramp are finished and shipped. Design within
  `src/constants/theme.ts` (tiers 4/9/14/19/22% lightness). Never invent a hex value.

## ⚠️ THE DATASET PROBLEM — read this before planning research

**Zogo, Stash, Greenlight and NGPF are NOT in ScreensDesign.** Those are Euphoria's actual Tier-1
and Tier-3 competitors. ScreensDesign's coverage skews to large consumer apps, so what you can pull
is **adjacent** (Loora AI, Duolingo, Brilliant, Headspace, Calm), not direct.

Handle this explicitly rather than papering over it:

1. For every adjacent-app pattern you propose, **state why the mechanism transfers** to a
   finance-education buyer. "Loora makes $1M/mo" is not evidence about this category — the
   *dismissal-interception mechanism* is what transfers, and you must say so.
2. For direct competitors, get evidence another way: **App Store screenshots and listing copy** are
   public and are the most A/B-tested surface in mobile. Pull them for Zogo, Stash, Greenlight,
   Blossom, Finimize.
3. **Update `COMPETITIVE_ANALYSIS.md` §6** — its revenue/pricing gaps are still open and it says so.
   Close what you can; leave the rest marked UNVERIFIED.

## THE WORK

### 1. The four unspecified screens
`lesson intro` · `lesson step (question)` · `streak` · `profile`.

The prior session correctly refused to invent these without evidence. **Get the evidence, then
spec them.** Pull the best-in-class equivalent of each from what ScreensDesign *does* cover.
If a screen genuinely has no comparable in the dataset, say so and spec it from Apple HIG plus the
existing token system — labelled as such. Do not silently fall back to taste.

Each spec needs: exact `theme.ts` tokens, layout at 390pt width, type sizes from the loaded families
(Nunito / DM Sans), spacing from `Spacing`, radii from `Radius`, touch targets, and the
empty/loading/error state.

### 2. Paywall visuals
`SCREEN_REDESIGN.md` §3.1 rests on **sequence metadata, not inspected screens** — no paywall images
were retrieved. Retrieve them. If image retrieval is not supported by the tools available, state
that plainly and downgrade §3.1's confidence rather than leaving it reading as visual analysis.

### 3. Finish the A/B plan
Every proposal carries: hypothesis · primary metric · minimum detectable effect · predicted
direction · **kill criterion**. Rank by expected value ÷ effort. The dismissal fix stays #1 unless
you find something with a better ratio.

## QUALITY BAR

Rejected: *"Modernise the streak screen with clear hierarchy and a prominent CTA."* No number, no
source, no hypothesis, true of every app ever built.

Accepted: a spec naming `#A855EB`, 56pt, `Radius.lg`, citing a named ScreensDesign pull, with a
kill criterion where a better top-line number still loses if a downstream metric degrades.

## ANTI-GOALS
- No inventing competitor behaviour. Not in the dataset → **UNVERIFIED**.
- No redesign of surface ramp, type families or brand colour — settled.
- Nothing requiring libraries outside Expo 57 / RN 0.86 / Reanimated 4.5.0 / react-native-svg
  / expo-linear-gradient / @expo/ui without pricing the migration.
- Do not restate the existing docs. Link them.

## DONE MEANS
- [ ] ScreensDesign authenticated, real tools confirmed
- [ ] All eight screens specced, or the gap named with a reason
- [ ] Paywall §3.1 either upgraded with real visuals or explicitly downgraded
- [ ] Every adjacent-app pattern carries a transferability argument
- [ ] `COMPETITIVE_ANALYSIS.md` §6 updated
- [ ] At least three things marked UNVERIFIED
