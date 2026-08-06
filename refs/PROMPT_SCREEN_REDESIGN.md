# Euphoria — conversion-driven screen redesign research

## ROLE

You are a **senior product designer specialising in mobile conversion optimisation**. Not a
visual stylist. You are being hired because Euphoria's screens do not convert, and the founder
suspects they read as generic. Your output will be A/B tested against live traffic, so every
proposal must carry a **hypothesis and a metric**, not an aesthetic opinion.

## THE GOAL, STATED PRECISELY

Increase (a) **install → activation** and (b) **free → paid conversion** for Euphoria, a dark-theme
finance-education iOS app. Everything else is secondary. A screen that is beautiful and does not
move one of those two numbers is a failure.

---

## STEP 1 — Authenticate ScreensDesign FIRST (the user has a Pro subscription)

Do this before anything else. Nothing below works without it.

1. Invoke the project skill: **`screensdesign-data`**. It wraps this MCP and knows its tool surface.
2. Call **`mcp__screensdesign__authenticate`** — it returns an authorization URL. Give that URL to
   the user and stop.
3. The user authorises in their browser. They are redirected to
   `http://localhost:<port>/callback?code=...&state=...`. **That page will look like it failed to
   load — that is expected and fine.** The URL in the address bar is still valid.
4. Ask the user to paste that full URL, then call
   **`mcp__screensdesign__complete_authentication`** with it as `callback_url`.
5. The server's real tools appear automatically. **Confirm they loaded before proceeding** — if you
   only still see `authenticate`, the flow did not complete. Do not fake it and do not work around it.

⚠️ Do not attempt any research until authentication is confirmed. A ScreensDesign Pro subscription
is being paid for; using web search as a substitute wastes it and produces weaker evidence.

---

## STEP 2 — What to pull from ScreensDesign, specifically for Euphoria

ScreensDesign gives you **recorded real screens, onboarding flows, paywalls, App Store creatives,
and revenue/download evidence** — that last part is what makes this different from browsing
Dribbble. Use it.

Pull and analyse, in this order:

**A. Paywalls — highest revenue leverage.**
Pull paywall screens from apps that monetise the same psychology: **Duolingo (Super), Brilliant,
Zogo, Blossom, Finimize, Stash, Greenlight, Headspace, Calm**. For each capture: what is on screen
at the paywall moment, the plan-selection pattern (toggle vs cards vs single CTA), trial framing,
price anchoring, the benefits table format, dismissal affordance, and **what precedes the paywall**.
Cross-reference revenue/download data where ScreensDesign has it — prefer patterns used by apps
that actually earn.

**B. Onboarding → activation flows.**
Pull complete onboarding sequences for the same set. Count steps. Note where the paywall sits, where
account creation sits, and where the first "aha" moment lands relative to both. Euphoria's current
onboarding is 6 steps; Brilliant's is ~15. **Determine empirically whether longer onboarding
correlates with conversion in this category, or whether that is folklore.**

**C. The specific screens Euphoria needs redesigned.**
Home/learn path · lesson intro · lesson step (question) · correct/incorrect verdict · lesson
complete/reward · streak · paywall · profile. Pull the best-in-class equivalent of each.

**D. Visual similarity + App Store creatives.**
Run visual-similarity on Euphoria's closest comparables. Separately analyse App Store screenshot
creatives — those are the most A/B-tested surface in mobile and a free read on what messaging
converts in this category.

---

## STEP 3 — Ground in Euphoria's actual state. Do not start from a blank page.

**Read these first — they contain finished work. Re-deriving any of it is waste:**

- `refs/COMPETITIVE_ANALYSIS.md` — the real competitor set is **finance-education** (Zogo, NGPF,
  Greenlight, Stash, Blossom), *not* Duolingo/Brilliant, who are craft benchmarks only. Contains
  the market driver (30 US states now mandate personal finance to graduate; Ohio's class of 2026
  is the first cohort) and the key monetisation finding: **competitors reward with real money
  (stock, gift cards); Euphoria rewards with XP.** That is a conversion problem, not a design one.
- `refs/MOTION_RESEARCH_V2.md` — measured motion findings and the **already-fixed** dark surface
  ramp in `src/constants/theme.ts` (tiers at 4% / 9% / 14% / 19% / 22% lightness). **Do not
  redesign the surface ramp.** Design within it.
- `refs/MOTION_FINDINGS_REWARD.md` — measured verdict/reward timings. Notably: both Duolingo and
  Brilliant hold a verdict **~1000ms ±150ms** in complete stillness. Respect that in any redesign
  of the correct/incorrect screens.

**Hard technical constraints — a design that cannot ship is worthless:**
Expo SDK 57 · React Native 0.86 · Reanimated 4.5.0 · react-native-svg · expo-linear-gradient ·
`@expo/ui`. **Dark theme only**, near-black background. Brand violet `#A855EB`. Mascot **Atlas** —
four interlocking violet rings, large expressive eyes. Fonts already loaded: Nunito (display/
heading), DM Sans (UI/body), EB Garamond (marketing serif only). Spacing and Radius scales exist in
`theme.ts` — audit them, don't invent a parallel system.

---

## THE QUALITY BAR — this is the whole engagement

The failure mode is a redesign that looks like every AI-generated app: rounded cards, a gradient
CTA, stock line icons, generous padding, and nothing behind it.

**REJECTED:**
> Modernise the paywall with a clean card layout, clear hierarchy, and a prominent CTA. Use
> generous whitespace and a gradient button to draw the eye. Add social proof for trust.

Why it fails: no hypothesis, no metric, no source, no number, true of every app ever shipped.

**ACCEPTED:**
> **Paywall variant B — anchor on the mandate, not the features.**
> Replace the feature-comparison table with a single-line value claim above the plan cards:
> *"Your school requires personal finance. This is the part they don't teach — investing."*
> Plan selection becomes two cards, annual pre-selected, monthly de-emphasised at 60% opacity,
> annual showing per-month price (not total) with the total in 13px `mutedForeground` beneath.
> CTA is `#A855EB` at full width, 56pt tall, `Radius.lg`.
> **Hypothesis:** the category's buyers are students under a graduation mandate (30 states, 2026),
> so relevance framing beats feature enumeration. **Metric:** paywall view → trial start.
> **Predicted direction:** +15–30% relative. **Kill criterion:** if trial→paid drops more than
> 10%, the framing is attracting unqualified starts and the variant loses despite a better top line.
> **Evidence:** ScreensDesign paywall pull — Zogo/Stash/Duolingo Super all lead with a single
> value claim above plan selection; none lead with a comparison table.

Every proposal you make must carry: **a specific value or token, a source, a hypothesis, a metric,
a predicted direction, and a kill criterion.**

---

## DELIVERABLES → write to `refs/SCREEN_REDESIGN.md`

1. **Executive summary** — the 5 highest conversion-leverage screen changes, ranked, each with the
   expected numeric effect and which funnel step it targets.
2. **Funnel map** — Euphoria's current install → activation → paywall → paid path, with the drop-off
   point you believe is largest and *why you believe it*.
3. **Per-screen redesign specs** for the eight screens in Step 2C. Each spec gives: exact tokens
   from `theme.ts` (never invent hex), layout at 390pt width, type sizes, spacing from the `Spacing`
   scale, radii from `Radius`, touch-target sizes, and the empty/loading/error state.
4. **A/B test plan** — for each proposed change: variant A (current) vs B (proposed), hypothesis,
   primary metric, minimum detectable effect, and kill criterion. Rank by expected value ÷ effort.
5. **Evidence appendix** — the ScreensDesign pulls that justify each recommendation, named by app
   and screen. Anything you could not pull, say so explicitly.

---

## ANTI-GOALS

- No mood boards, no adjectives, no "modern and clean." Numbers and hypotheses or it doesn't ship.
- No redesign of the surface ramp, the type families, or the brand colour — those are settled.
- No proposals requiring libraries outside the stack above, unless you price the migration.
- No inventing competitor behaviour. If ScreensDesign didn't return it, mark it **UNVERIFIED**.
- Do not restate the three research docs. Link to them.
- Do not pad. A short document where every line is load-bearing beats a long one.

## SELF-CHECK BEFORE SUBMITTING

- [ ] ScreensDesign authenticated and real tools confirmed loaded
- [ ] Every recommendation has a hypothesis, a metric, and a kill criterion
- [ ] Every colour, size and spacing value cites an existing token from `theme.ts`
- [ ] Every competitor claim names the ScreensDesign pull it came from
- [ ] At least three things explicitly marked UNVERIFIED
- [ ] Nothing in the document is true of every app ever built
