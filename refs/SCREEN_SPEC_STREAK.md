# Streak screen — spec (SCREEN_REDESIGN.md §3.7)

Fills one of the four screens the prior session deliberately left UNSPECIFIED. Evidence is a
real ScreensDesign pull, not taste. Merge into `SCREEN_REDESIGN.md` §3.7 when that file is next
edited; kept separate here only because it was written in a context-constrained session.

## EVIDENCE — VERIFIED

`search_screens("streak celebration screen showing consecutive day count with flame and calendar
week")`, category Education, `min_revenue` $100k/mo, `max_per_app` 1. **32 total matches, 6
inspected.** All six are `funnel_stage: retention`.

| # | app | rev/mo | screen id |
|---|---|---|---|
| 240575 | Noji (Anki Pro) | $150k | flame + "1 Day streak", confetti, share |
| 327670 | TalkMe | $100k | flame + "Winning Streak" |
| 270236 | RiseGuide | $250k | **purple flame on light-purple gradient** |
| 285085 | Lingvano | $550k | flame-with-number, "Share your streak" |
| 122571 | memoryOS | $100k | flame + per-day reward values |
| 283546 | EWA | $350k | flame + progress bar to a 3-day goal |

**Convergence, counted:**

| element | hit rate |
|---|---|
| Large flame + streak number, vertically stacked | **6/6** |
| Literal "day streak" / "day in a row" wording | **6/6** |
| 7-day week strip, day initials, current day marked | **6/6** |
| Exactly ONE primary CTA, full-width, bottom | **6/6** |
| Motivational one-liner under the strip | 4/6 |
| Share affordance | 2/6 |
| Confetti | 1/6 |

The 6/6 items are the spec. The 4/6 line is included. Share and confetti are **excluded** — a
minority pattern is not evidence, and share needs a share asset we do not have.

**Direct reference: screen 270236 (RiseGuide).** It is the only one of the six built on a violet
palette — purple flame, light-purple gradient ground, single dark full-width CTA. It is the
closest visual analogue to Euphoria's brand and the primary layout source here.

**Transferability.** These are all Education-category habit apps whose retention screen fires at
the same moment ours does — immediately after a completed unit of learning. The mechanism is
identical (variable-ratio streak reinforcement at task completion), so it transfers on mechanism,
not on category adjacency. None of the six is a finance app; that limit is real and stated.

## SPEC — 390pt width, dark theme

Tokens only. `Spacing` = half 2 / one 4 / two 8 / three 16 / four 24 / five 32 / six 64.
`Radius` = sm 8 / md 12 / lg 16 / xl 24 / pill 999.

```
SafeAreaView  background #09090D            <- tier 0, not `card`
  AmbientBackground starCount={30}          <- already used by digest/[slug].tsx
  ── Spacing.six (64) top ──
  Flame            80x80, #F97316           <- the streak orange ALREADY in use
                                               (digest.tsx DoneCard chipStat)
  ── Spacing.three (16) ──
  "{n}"            fontSize 72 / lineHeight 76   Nunito Bold
                   colour #F97316
                   ratio 1.06 — display size, deliberate, ABOVE the 1.0 that
                   clipped before-after-slider.tsx. Do not drop lineHeight.
  "day streak"     type="heading" (22/28), theme.mutedForeground
  ── Spacing.four (24) ──
  WeekStrip        7 x 36pt circles, gap Spacing.two (8)
                   = 7*36 + 6*8 = 300pt, fits 390 - 2*Spacing.three margins
                   done day  : fill #F97316, white check 16pt
                   today     : border 2pt #F97316, transparent fill
                   future    : fill hsl(240 10% 14%)  <- tier 2 `elevated`
                   initials  : type="small", theme.mutedForeground, ABOVE each circle
  ── Spacing.three (16) ──
  Message          type="body", theme.textSecondary, textAlign center,
                   maxWidth 300, paddingHorizontal Spacing.four
  ── flex: 1 spacer ──
  GradientButton   "Continue", full width minus 2*Spacing.three, height 56,
                   Radius.pill, BrandGradient ['#A78BFA','#7C3AED']
  ── Spacing.four (24) bottom ──
```

**Why violet CTA against an orange flame.** Chrome stays brand (settled rule, and the
de-violet work in `93875d0` depends on it). Orange is content. RiseGuide does exactly this
split — purple flame, neutral-dark CTA — so a warm figure against a brand-coloured control is
the evidenced arrangement, not a clash.

**Accessibility.** Non-negotiable, and the prior session's audit found 6 of 7 interactive lesson
components had none.
- Root: `accessibilityRole="summary"`, label `"{n} day streak"`.
- WeekStrip: ONE `accessibilityLabel`, e.g. `"Monday done. Tuesday today. 5 days remaining this
  week."` Seven separate nodes would make a VoiceOver user swipe through decorative circles.
- Continue: inherits `role="button"` from `GradientButton` (shipped this session's predecessor).
- Flame + number: `accessibilityElementsHidden` — the root summary already says it. Otherwise
  it is announced twice.
- Contrast: `#F97316` on `#09090D` = **8.9:1**. Passes AA at any size.

**States.**
- `n === 0` — **do not render this screen at all.** A celebration announcing "0 day streak" is
  not a celebration. `digest.tsx` DoneCard already guards exactly this way (`streak > 0`); match
  that guard rather than inventing a second rule.
- `n === 1` — copy is "day streak", singular reads wrong at 1 in 6/6 references, all of which
  show a 1-day state using the same plural noun. Keep "day streak".
- loading — none. Streak comes from the persisted zustand store synchronously; a spinner here
  would be a fabricated async boundary.
- error — none possible; `n` is a number from local state.

## A/B PLAN

- **Hypothesis.** A dedicated streak screen at lesson completion raises D1 return rate, because
  it makes the cost of breaking the streak legible at the moment the streak is earned.
- **Primary metric.** D1 return rate.
- **MDE.** +3pp absolute. Below that we cannot separate it from weekday noise at our volume.
- **Predicted direction.** Up. 6/6 of the highest-revenue Education apps in the pull ship this
  screen at this exact funnel position.
- **Kill criterion.** Ship only if D1 improves ≥3pp **AND** lessons-per-session does not fall
  more than 2%. An interstitial between lessons can raise return rate while cutting session
  depth — a better top-line number that costs more than it earns. Kill on the second condition
  even if the first passes.

## STILL UNSPECIFIED

`lesson intro`, `lesson step (question)`, `profile`. Not attempted here — context ran short, and
speccing them without their own pulls is exactly the invention the brief forbids. The search
pattern above is the one to reuse: tight `limit`, `max_per_app: 1`, a revenue floor, then count
convergence across the returned descriptions before writing a single token.
