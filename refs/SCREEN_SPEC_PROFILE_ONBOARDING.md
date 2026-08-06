# Profile + onboarding — spec and findings (SCREEN_REDESIGN.md §3.8, §2)

Completes the four screens `PROMPT_SCREEN_REDESIGN_V2.md` left UNSPECIFIED, and opens onboarding.

---

# §3.8 PROFILE

## EVIDENCE — VERIFIED

`search_screens("user profile screen with avatar, stats grid, achievements and settings list")`,
Education, `min_revenue` $200k/mo, `max_per_app` 1. **6 total matches, 4 inspected.**
All four `screen_type: profile`.

| screen | app | rev/mo |
|---|---|---|
| 209601 | Ling | $250k |
| 111759 | Elevate | $750k |
| 247186 | Deepstash | $450k |
| 147612 | **Quizlet** | **$2.25M** |

**Convergence, counted:**

| element | hit rate |
|---|---|
| Identity block at top (avatar and/or display name) | **4/4** |
| Stats surfaced as explicit numbers | **4/4** |
| Achievements section | **4/4** |
| **Streak called out as a first-class stat** | **4/4** |
| Progress bar on each locked achievement | 3/4 |
| Settings entry point on the profile itself | 3/4 |
| "See all / View all" on achievements | 3/4 |
| Email address shown | 1/4 → **EXCLUDED** |
| Followers / social graph | 1/4 → **EXCLUDED** |
| Weekly calendar embedded in profile | 1/4 → **EXCLUDED** |

**The 4/4 on streak is the load-bearing result.** Every one of the four surfaces streak as a
headline stat, under four different names (max streak, current streak, reading streak, 1-week
streak). Profile is where streak *lives*; the celebration screen in `SCREEN_SPEC_STREAK.md` is
where it is *earned*. Both, not one.

**Quizlet's embedded weekly calendar is excluded deliberately** — 1/4, and it would duplicate
the week strip already specced on the streak screen. Two week strips in one app is a drift risk.

## SPEC — 390pt, dark

```
SafeAreaView   background #09090D
  ScrollView, contentContainerStyle paddingHorizontal Spacing.three
  ── Identity, Spacing.four (24) top ──
  Avatar        72pt circle, Radius.pill, background hsl(240 10% 14%)
                initial in type="title", theme.iconLilac #C89CF5
  ── Spacing.two (8) ──
  DisplayName   type="title" 24/30
  ── Spacing.four (24) ──
  ── Stats, 2x2 grid, gap Spacing.two (8) ──
  StatCard x4   width (390 - 2*16 - 8)/2 = 175pt, minHeight 84, Radius.lg (16)
                background hsl(240 10% 9%)  <- tier 1 `card`
                border 1pt hsl(240 10% 22%)
                icon 20pt + value type="title" + label type="small" mutedForeground
     1 Streak    #F97316 flame        <- same orange as the streak screen, one token
     2 Total XP  theme.primary
     3 Lessons   theme.success #22C55E
     4 Minutes   theme.iconLilac
  ── Spacing.four (24) ──
  "Achievements"  type="heading" + "See all" type="smallBold" theme.iconLilac, row, spaceBetween
  ── Spacing.two ──
  AchievementRow x3   minHeight 64, Radius.md (12), background tier 1
                      icon 40pt circle · title type="bodyMedium" · requirement type="small"
                      progress bar height 6, Radius.pill,
                        track hsl(240 10% 14%), fill COURSE_ACCENTS or theme.primary
  ── Spacing.four ──
  SettingsRow     chevron right, minHeight 56       <- 3/4 put settings on profile
  ── BottomTabInset (84 iOS) ──
```

**Accessibility.** StatCard: ONE label each — `"Streak, 3 days"`, not icon + value + label as
three nodes. AchievementRow: label = `"{title}. {requirement}. {n} of {m}."` — the progress bar
must be spoken, not seen. `See all` and `SettingsRow`: `role="button"`.

**States.**
- Zero state is the common one at install and it must not read as failure. All four stats render
  `0` with normal styling — no empty illustration, no "you haven't started" copy. Elevate
  (111759) ships exactly this: `Current streak 0 days`, `Workouts 0`, plain.
- Achievements with 0 progress still render, with the requirement text visible. That text is the
  product: it tells a new user what the game is.
- No loading, no error — all values come from the persisted zustand store synchronously.

---

# §2 ONBOARDING — FINDING, NOT YET A SPEC

## ⚠️ DATASET LIMIT — READ BEFORE USING THIS

`search_screens("onboarding question asking the user to choose their goal or motivation from a
list of options")`, **Finance**, `min_revenue` $100k/mo returned **1 total match.** One. Not one
inspected out of many — one in the entire filtered set.

That is not a convergence base and **no onboarding spec should be written from it.** It is
recorded here as a single directly-relevant data point plus a hypothesis to test, nothing more.
Everything in this section is **UNVERIFIED** as design guidance.

## The one match — and it is uncomfortably close to ours

**Screen 239304, YNAB ($350k/mo, Finance, 4.8★).** First onboarding question:

> **"What brings you to YNAB today?"** — 7 selectable cards, each an emoji plus a label:
> Get out of debt · Simplify my finances · Create more breathing room · Feel more in control ·
> Manage money with my partner · Make the most of my money · **Other**
> Back arrow top-left. Progress bar at top. No Continue button in `visible_text`.

Euphoria's onboarding step 1, read off the simulator a11y tree this session:

> **"What brings you to Euphoria?"** — 4 cards, each a title plus a subtitle:
> Grow my wealth / Build long-term investing habits · Learn how investing works / Start from the
> fundamentals · Trade with confidence / Practice without real risk · Understand the economy /
> Make sense of money & markets
> **Plus a `Continue` button at y=788.**

Same question, near-identical phrasing, same funnel position. We are already on the pattern.

## Four findings, and what to do about each

1. **We require a second tap on every single-select step. VERIFIED in source.**

   YNAB's cards carry no visible Continue — the card *is* the commit. We render a separate
   Continue, gated by `canContinue` (`onboarding.tsx:319`) and disabled until a selection
   exists (`:491`).

   `STEPS` composition, counted from the array rather than eyeballed:

   | kind | count |
   |---|---|
   | `single` | **8** |
   | `multi` | 2 |
   | `statement` | 2 |
   | `loader` / `reveal` / `paywall` | 1 each |
   | **total** | **15** |

   This also confirms the handoff's correction: **15 steps, not the 6 claimed in
   `PROMPT_SCREEN_REDESIGN.md`.**

   `next()` at `:296` is the only advance function, and no `setStep`/`next()` call appears in
   any option press handler — the only `onPress` handlers on cards are paywall plan selection
   (`:415`, `:424`). **There is no auto-advance.**

   So the 8 `single` steps each cost **two taps where one would do — 8 redundant taps.** The
   other 7 steps legitimately need Continue: multi-select has no natural commit point, and
   statement/loader/reveal/paywall have nothing to select.

   → **Highest-leverage onboarding change available, and nearly free:** auto-advance on
   `kind: 'single'` only. Leave the other 7 alone. Keep a back affordance, since removing the
   confirm step makes a mis-tap unrecoverable otherwise — YNAB ships a back arrow for exactly
   this reason.

2. **The paywall dismissal dead-end is real, and it is here. VERIFIED in source.**
   `onboarding.tsx:503` — "Maybe later" is a `SpringPressable` whose entire handler is
   `router.replace('/home')`. No offer, no interception, no state written. This is backlog #2
   in the handoff and `SCREEN_REDESIGN.md` §1/§4 T1, now confirmed at an exact line rather
   than inferred.

3. **No "Other".** YNAB offers one. Ours has four fixed options with no escape hatch. A user
   whose goal is none of the four must pick a wrong answer, and that answer is what we
   personalise on.

3. **No "Other" escape hatch** is difference 2 above; **they use emoji, we use subtitles.** Ours is arguably better — a subtitle explains the
   option, an emoji decorates it. Not a change; noting it so nobody "fixes" it later.

## What to run next for a real onboarding spec

Finance is too thin. Re-run against **Education + Health & Fitness** (the two categories with the
densest onboarding-quiz coverage), and use `search_flows` for whole `Complete Onboarding`
journeys rather than single screens — YNAB's own flow `49488` covers 35s→171s and is the right
shape of object. Also pull App Store screenshots for Zogo, Stash, Greenlight, Blossom and
Finimize, which the brief already notes are absent from the recorded-screen dataset.

---

## STATUS AFTER THIS FILE

Four UNSPECIFIED screens: **all four now specced** — streak, lesson intro, lesson step, profile.
Onboarding: opened, one data point, honestly short of a spec.

Still open from the brief: paywall visuals (§3.1 still rests on sequence metadata — no images
retrieved) and `COMPETITIVE_ANALYSIS.md` §6.
