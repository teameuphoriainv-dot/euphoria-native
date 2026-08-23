# FEEDBACK LOG — cofounder round 1
Source docs (2026-08-22):
- **prompt** — design direction + 6 reference screenshots  `docs.google.com/document/d/1lfSL03UgYqFkasLfkOck0EJ3vtXkVGmKZAG7RX8xiuc`
- **notes**  — Euphoria App Feedback & Bug List, 23 items  `docs.google.com/document/d/1rZtQoNcUrMipOmdaixF1um3h0-b8-ME8dWOMUmBwBx0`

29 items after dedupe. `verified` is set by the OWNER on his phone only (§1.3). Mine is `ready-for-verification`.

Status: `open` -> `fixing` -> `ready-for-verification` -> `verified` | `wontfix (real reason)`

---
## REFERENCE DESIGN read from the prompt doc's 6 images
Saved: `refs/webapp/prompt-img{0..5}.md` (descriptions); images live in the Google Doc.

| img | what it shows | design facts extracted |
|---|---|---|
| 0 | "I'm a learner" | pill, SOLID purple face, **hard-cut darker-purple slab beneath** (~8-10px), no blur/glow, white bold label |
| 1 | "Start these lessons free" | same treatment, wider |
| 2 | "I'm an educator" | **off-white face**, light lavender-grey slab beneath, dark label — the non-purple variant |
| 3 | "Get started" | same purple treatment on a dark card |
| 4 | "Learn faster with Premium" | `Premium` wordmark in **pink->orange gradient**; "Free for students through schools" pill (purple->pink); Benefits table; Premium column w/ pink->orange gradient border; magenta gradient circular checks |
| 5 | pricing tiers | Basic **Free** / Premium **$9.99/mo, $99.99 billed yearly** / Schools & Districts **Custom**; "Go Premium" CTA = pink->orange gradient; Basic/Schools CTAs = off-white |

**The button ask, precisely:** kill the violet->orchid `LinearGradient` + `shadowOpacity:0.5/shadowRadius:16` glow in `GradientButton`. Replace with a solid face + hard-cut offset slab. Press = face travels down onto the slab.

---
## BATCH A — the prompt doc (design direction)  <-- STARTING HERE
| # | reporter | verbatim | class | sev | status | files | commit |
|---|---|---|---|---|---|---|---|
| P1 | prompt | "I see an initial screen with no animation or lesson start animation. Build a quick lesson start animation or some sort of transition from when you first click the start button to get into the lesson" | visual | P2 | open | `lesson.tsx`, `start.tsx` | |
| P2 | prompt | "The biggest thing that we have to fix throughout the entire application is our buttons... I don't like the gradient look... I like a deep purple, brilliant, styled button that's super defined and hard cut... implement that on every purple button" | visual | **P0** | open | `ui/button.tsx` (+19 callers) | |
| P3 | prompt | "we can't have the same type of gradient behind it because it looks extremely vibe-coded... similar buttons that are white, pushed up... they can't have the vibe-coded glow behind them" | visual | **P0** | open | `ui/button.tsx` | |
| P4 | prompt | "The icons are currently completely static... I would love to see if we could have a small type of SVG animation every time you click a different page" | visual | P2 | open | `tab-bar.tsx`, `ui-icon.tsx` | |
| P5 | prompt | "On the profile page, the spacing between the 'Your Profile' and 'Free Trial' (along with 'Atlas' on the left and 'Your Profile Stats' and the 'Free Trial' button right under) is messed up. Let's add some padding" | visual | P1 | open | `(tabs)/you.tsx` | |
| P6 | prompt | "take the screenshots, take the coloring, take the color scheme, font, and all of the things that we give in the screenshots design system, and apply them to the new pricing conversion page" + "on the free trial page, we want Atlas there, and we want it to be super beautiful" | visual | P1 | open | `onboarding.tsx`, `theme.ts` | |

## BATCH B — Onboarding
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N1 | "Em dash after the coach on the first screen — decide if we're keeping it; reads a little rough." | copy | P3 | open |
| N2 | "Back arrow doesn't work on the 'How much do you already know?' screen. (Also: do we even need a back button here?)" | broken-flow | P1 | open |
| N3 | "Age range starts at 18 — needs to be expanded to include younger/older users." | wrong-data | P1 | open |
| N4 | "tapping the free trial banner takes you to the subscription screen; hitting back from there sends you to onboarding instead of back to Home." | broken-flow | P1 | open |

## BATCH C — Lessons
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N5 | "the 'Americans can't cover a $1,000 emergency expense' question shows up more than once in the first personal finance lesson." | wrong-data | P1 | open |
| N6 | "it looks like the app measures time based on the lesson's listed duration, not actual time spent in-app. After finishing a lesson it shows 5 minutes even if you were on the app much longer" | wrong-data | P1 | open |
| N7 | "the drag-to-order steps sometimes load with answers already in the correct position... None of them should ever start in the correct spot. Confirmed happening across every lesson" | **crash-class bug** | **P0** | open |

## BATCH D — Home
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N8 | "'Saver League' (rank) is at the bottom of the page — should be moved up near the top; it's a key status indicator." | visual | P2 | open |
| N9 | "'Your Path' section feels crowded/redundant — Lessons, Trade, and Digest already have their own full tabs... Consider simplifying/compressing the bottom half" | visual | P2 | open |

## BATCH E — You / Profile
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N10 | "Top half is too compressed: profile, free trial days left, league, and rank are all crammed together" | visual | P1 | open (= P5) |
| N11 | "Tab is scope-confused: right now it reads like Settings... but also holds Friends and Games, which are gamified/social features and feel out of place here." | confusion | P2 | open |
| N12 | "Games are buried — currently only discoverable by clicking into Profile. Should be a bigger, more visible part of the app." | confusion | P2 | open |
| N13 | "suggested friends (e.g., 'Priya S,' 'Chris M') appear to be bots, not real users — needs a real content/design decision here." | wrong-data | P1 | open |

## BATCH F — Subscription & Monetization
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N14 | "Post-lesson 'open the present' reward currently offers 'Start your free trial' even to users who are already on the free trial — confirmed bug." | broken-flow | **P0** | open |
| N15 | "Same bug on Home: tapping the arrow next to the trial banner says 'Start your free trial to continue' even when already enrolled." | broken-flow | **P0** | open |
| N16 | "instead of prompting after every single lesson, consider triggering the 'present' after a few lessons and offering a discounted annual rate" | confusion | P2 | open |
| N17 | "Subscription screen needs a features list — right now it's just an image; users can't tell what premium actually includes." | visual | P1 | open (= P6) |

## BATCH G — Digest / Trading / AI / Rewards / Settings / Copy
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N18 | "replace the current dropdown-oval categories... with distinct sections/rectangles stacked down the screen (similar to the Euphoria web app)" | visual | P2 | open |
| N19 | "Trade tab is bugged — expected, since no data/content has been added yet." | broken-flow | P1 | open |
| N20 | "AI feature not working — expected to be non-functional right now." | broken-flow | P1 | open |
| N21 | "Add an in-app currency for completing achievements... a separate game-style currency (like the web app has)" | feature | P3 | open |
| N22 | "Add Light Mode / Dark Mode + other color preferences, housed under the Preferences section." | feature | P3 | open |
| N23 | "Em dashes throughout the app flagged as feeling rough/off — needs a broader copy pass" | copy | P2 | open (N1 is its first instance) |

---
## FLAGGED FOR THE OWNER — decisions I will not take alone
1. **PRICE DIVERGENCE.** Web `/pricing` (prompt doc IMG 5) says Premium **$9.99/mo, $99.99 billed yearly**. iOS `onboarding.tsx` PRICING says **$9.99 / $79.99**. `refs/PRICE_DESYNC.md` records an earlier app-vs-store mismatch. Three different annual numbers are in play and `pricing-pin.mjs` will fail the build if the derived badge/per-month lines are not updated together. **Which annual price is real?**
2. **N13 fake friends.** "Priya S / Chris M" being seeded bots is a product/ethics call, not a styling one.
3. **N3 age range.** Under-18 users change COPPA/FERPA posture. Needs an explicit floor.
