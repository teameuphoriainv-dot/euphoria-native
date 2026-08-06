# Lesson intro + lesson step — spec (SCREEN_REDESIGN.md §3.5, §3.6)

Fills two more of the four UNSPECIFIED screens. Same method as `SCREEN_SPEC_STREAK.md`:
count convergence across a real pull, exclude minority patterns, name only real tokens.

---

# §3.5 LESSON INTRO

## EVIDENCE — VERIFIED

`search_screens("lesson intro screen showing what you will learn with lesson title and start
button before the lesson begins")`, Education, `min_revenue` $150k/mo, `max_per_app` 1.
**31 total matches, 4 inspected.**

| screen | app | rev/mo |
|---|---|---|
| 132970 | Nibble | $450k |
| 280753 | SuperChinese | $200k |
| 138763 | Promova | $250k |
| 112762 | **Duolingo** | **$48M** |

**Convergence, counted:**

| element | hit rate |
|---|---|
| Dismiss control (X), top of screen | **4/4** |
| Lesson title as the dominant type element | **4/4** |
| Explicit "what you will learn" — prose, bullets, or preview cards | **4/4** |
| Exactly ONE full-width primary CTA, bottom, verb "Start" | **4/4** |
| Preview of the actual content items to come | 2/4 |
| Duration estimate | 1/4 |
| XP / points indicator | 1/4 |
| Step counter | 1/4 |

The 4/4 rows are the spec. **Duration, XP and step counter are excluded** — 1/4 each, and a
single occurrence is not evidence.

**Preview cards are the judgement call.** Only 2/4, which by the rule above would exclude them —
but the two are SuperChinese and **Duolingo at $48M/mo**, two orders of magnitude above every
other app in the pull. I am including a reduced form (a 3-item concept list, not interactive
cards) and flagging it as the weakest-evidenced element here. If it must be cut for effort, cut
this first.

## SPEC — 390pt, dark

```
SafeAreaView edges={['top']}   background #09090D
  AmbientBackground starCount={30}
  ── header, height 44 ──
  SpringPressable  close X, UIcon 22pt, theme.mutedForeground
                   hitSlop={10}          <- 30-32pt controls needed this; verified fix
                   scaleTo 0.85, haptic false
  ── Spacing.five (32) ──
  ScrollView                             <- NOT a plain View. A centred View is what put
                                            MultiSelect's Check button 70% under the footer.
                                            Top-aligned, contentContainerStyle flexGrow 1.
    CourseArt      132x132, tinted by COURSE_ACCENTS via the hero-tint mechanism (93875d0)
    ── Spacing.four (24) ──
    Eyebrow        type="label", colour = COURSE_ACCENTS[courseId]
                   e.g. "BEHAVIOURAL FINANCE · LESSON 1"
    ── Spacing.two (8) ──
    Title          type="title", Nunito Bold. fontSize 28 / lineHeight 34 (ratio 1.21)
                   ALWAYS pair lineHeight with fontSize — 11 defects came from omitting it
    ── Spacing.three (16) ──
    "In this lesson"   type="label", theme.mutedForeground
    ── Spacing.two (8) ──
    3 x ObjectiveRow   bullet dot 6pt in COURSE_ACCENTS + type="body" theme.textSecondary
                       gap Spacing.two, lineHeight 24
  ── flex spacer ──
  GradientButton  "Start lesson", full width - 2*Spacing.three, height 56, Radius.pill
  ── Spacing.four (24) ──
```

**Accessibility.** `header` X: `accessibilityLabel="Close lesson"`, `role="button"` (inherited
from SpringPressable). Objective rows: ONE combined label, not three — `"In this lesson: {a},
{b}, {c}"`. CourseArt: `accessibilityElementsHidden`, decorative.

**States.** No loading — curriculum is bundled, synchronous. No error. If a lesson has fewer
than 3 objectives, render what exists; do not pad.

---

# §3.6 LESSON STEP (QUESTION)

## EVIDENCE — VERIFIED

`search_screens("multiple choice question screen inside a lesson with answer options and
progress bar at top")`, Education, `min_revenue` $150k/mo, `max_per_app` 1.
**15 total matches, 4 inspected.** All four `funnel_stage: core_product`.

| screen | app | rev/mo | selection feedback |
|---|---|---|---|
| 279366 | Wellspoken | $150k | blue border + checkmark |
| 300363 | Gizmo | $150k | light-green fill |
| 304008 | Coursera | $150k | radio, "QUESTION 3/6", "1 point" |
| 270700 | TurboLearn | $150k | red border + X on a wrong pick |

**Convergence, counted:**

| element | hit rate |
|---|---|
| Progress bar / track pinned at top | **4/4** |
| Question text as dominant element | **4/4** |
| Options as discrete tappable cards | **4/4** |
| Exactly ONE primary CTA, bottom | **4/4** |
| Back or close control in the header | **4/4** |
| Selected state = border change **plus an icon** | 3/4 |
| In-place correctness colour (green right / red wrong) | 2/4 |
| Visible question counter | 2/4 |
| XP or points on the question screen | 2/4 |

**We already ship the 4/4 set.** `lesson.tsx` has the segmented top track, one gated Continue,
and a close control. This spec is therefore mostly a **confirmation that the current structure is
correct** — the change is narrower than "redesign".

**The one real change: selected state needs an icon, not just colour.** 3/4 references pair the
border/fill change with a checkmark or X. Colour alone fails for colour-blind users and is the
single most common a11y defect in quiz UIs.

## SPEC — deltas only, against current `lesson.tsx`

```
OptionCard (unselected)
  background   hsl(240 10% 14%)      tier 2 `elevated`
  border       1pt hsl(240 10% 22%)  `border` — must exceed the surface it outlines
  Radius.md (12), minHeight 56, paddingHorizontal Spacing.three

OptionCard (selected, pre-check)
  border       2pt theme.primary #A855EB
  background   theme.primary + '12'
  + UIcon "check" 18pt theme.primary, trailing, right-aligned     <- THE ADDITION

OptionCard (correct, post-check)
  border 2pt theme.success #22C55E, background success + '12'
  + UIcon "check" 18pt #22C55E

OptionCard (wrong, post-check)
  border 2pt theme.destructive, background destructive + '12'
  + UIcon "close" 18pt destructive                                <- icon, not colour alone

Continue   GradientButton, full width - 2*Spacing.three, height 56, Radius.pill
           disabled until a selection exists (gates() already enforces this)
```

**Touch targets.** OptionCard `minHeight: 56` — above the 44pt HIG floor with room for two
lines of option text. This is not negotiable: 7 controls were found at 30–32pt and needed
`hitSlop`. Cards are large enough not to need it.

**The wrapper must be a ScrollView.** Already fixed for all six interactive step wrappers, but
restated because it is the defect most likely to reappear: a 380pt prompt plus four ~190pt
options is roughly 2× the viewport, and a centred View spills symmetrically under the pinned
footer, which then wins hit-testing.

**Accessibility.** Each OptionCard: `role="button"`, `accessibilityState={{ selected }}`,
label = the option text. Post-check, append `", correct"` / `", incorrect"` to the label —
a screen reader must not depend on the border colour either.

## A/B PLAN — the icon change

- **Hypothesis.** Pairing selection colour with an icon reduces mis-taps and abandoned steps,
  because selection stops depending on a single visual channel.
- **Primary metric.** Lesson step completion rate.
- **MDE.** +2pp absolute.
- **Predicted direction.** Up, small. 3/4 references do this.
- **Kill criterion.** Ship only if step completion improves ≥2pp **AND** median time-per-step
  does not rise more than 5%. A trailing icon that makes people re-read every option has bought
  accuracy with speed, which on a 5-minute daily habit is a bad trade.

---

## STILL UNSPECIFIED AFTER THIS FILE

`profile` only. Plus the brief's other two open items: paywall visuals (§3.1 still rests on
sequence metadata, no images retrieved) and `COMPETITIVE_ANALYSIS.md` §6.
