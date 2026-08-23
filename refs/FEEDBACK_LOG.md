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
| P1 | prompt | "I see an initial screen with no animation or lesson start animation. Build a quick lesson start animation or some sort of transition from when you first click the start button to get into the lesson" | visual | P2 | ready-for-verification | `lesson.tsx` | stagger |
| P2 | prompt | "The biggest thing that we have to fix throughout the entire application is our buttons... I don't like the gradient look... I like a deep purple, brilliant, styled button that's super defined and hard cut... implement that on every purple button" | visual | **P0** | ready-for-verification | `ui/button.tsx` (+19 callers) | slab CTA |
| P3 | prompt | "we can't have the same type of gradient behind it because it looks extremely vibe-coded... similar buttons that are white, pushed up... they can't have the vibe-coded glow behind them" | visual | **P0** | ready-for-verification | `ui/button.tsx` | slab CTA |
| P4 | prompt | "The icons are currently completely static... I would love to see if we could have a small type of SVG animation every time you click a different page" | visual | P2 | ready-for-verification | `tab-bar.tsx` | TabGlyph |
| P5 | prompt | "On the profile page, the spacing between the 'Your Profile' and 'Free Trial' (along with 'Atlas' on the left and 'Your Profile Stats' and the 'Free Trial' button right under) is messed up. Let's add some padding" | visual | P1 | ready-for-verification | `(tabs)/you.tsx` | spacing |
| P6 | prompt | "take the screenshots, take the coloring, take the color scheme, font, and all of the things that we give in the screenshots design system, and apply them to the new pricing conversion page" + "on the free trial page, we want Atlas there, and we want it to be super beautiful" | visual | P1 | ready-for-verification | `onboarding.tsx`, `theme.ts` | premium chart |

## BATCH B — Onboarding
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N1 | "Em dash after the coach on the first screen — decide if we're keeping it; reads a little rough." | copy | P3 | open |
| N2 | "Back arrow doesn't work on the 'How much do you already know?' screen. (Also: do we even need a back button here?)" | broken-flow | P1 | open |
| N3 | "Age range starts at 18 — needs to be expanded to include younger/older users." | wrong-data | P1 | ready-for-verification |
| N4 | "tapping the free trial banner takes you to the subscription screen; hitting back from there sends you to onboarding instead of back to Home." | broken-flow | P1 | open |

## BATCH C — Lessons
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N5 | "the 'Americans can't cover a $1,000 emergency expense' question shows up more than once in the first personal finance lesson." | wrong-data | P1 | ready-for-verification |
| N6 | "it looks like the app measures time based on the lesson's listed duration, not actual time spent in-app. After finishing a lesson it shows 5 minutes even if you were on the app much longer" | wrong-data | P1 | ready-for-verification |
| N7 | "the drag-to-order steps sometimes load with answers already in the correct position... None of them should ever start in the correct spot. Confirmed happening across every lesson" | **crash-class bug** | **P0** | open |

## BATCH D — Home
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N8 | "'Saver League' (rank) is at the bottom of the page — should be moved up near the top; it's a key status indicator." | visual | P2 | open |
| N9 | "'Your Path' section feels crowded/redundant — Lessons, Trade, and Digest already have their own full tabs... Consider simplifying/compressing the bottom half" | visual | P2 | open |

## BATCH E — You / Profile
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N10 | "Top half is too compressed: profile, free trial days left, league, and rank are all crammed together" | visual | P1 | ready-for-verification (= P5) |
| N11 | "Tab is scope-confused: right now it reads like Settings... but also holds Friends and Games, which are gamified/social features and feel out of place here." | confusion | P2 | open |
| N12 | "Games are buried — currently only discoverable by clicking into Profile. Should be a bigger, more visible part of the app." | confusion | P2 | open |
| N13 | "suggested friends (e.g., 'Priya S,' 'Chris M') appear to be bots, not real users — needs a real content/design decision here." | wrong-data | P1 | ready-for-verification |

## BATCH F — Subscription & Monetization
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N14 | "Post-lesson 'open the present' reward currently offers 'Start your free trial' even to users who are already on the free trial — confirmed bug." | broken-flow | **P0** | ready-for-verification |
| N15 | "Same bug on Home: tapping the arrow next to the trial banner says 'Start your free trial to continue' even when already enrolled." | broken-flow | **P0** | ready-for-verification |
| N16 | "instead of prompting after every single lesson, consider triggering the 'present' after a few lessons and offering a discounted annual rate" | confusion | P2 | open |
| N17 | "Subscription screen needs a features list — right now it's just an image; users can't tell what premium actually includes." | visual | P1 | ready-for-verification (= P6) — NOTE: chart sits below the fold, see open question |

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
1. **PRICE DIVERGENCE.** Web `/pricing` (prompt doc IMG 5) says Premium **$9.99/mo, $99.99 billed yearly**. iOS `onboarding.tsx` PRICING says **$9.99 / $79.99**. `refs/PRICE_DESYNC.md` records an earlier app-vs-store mismatch. Three different annual numbers are in play and `pricing-pin.mjs` will fail the build if the derived badge/per-month lines are not updated together. **RESOLVED 2026-08-22 — owner: keep $79.99 on iOS, web will be changed instead. No iOS change. ~~Which annual price is real?~~**
2. **RESOLVED — owner: remove seeded profiles, real friends only.** ~~N13 fake friends.~~ "Priya S / Chris M" being seeded bots is a product/ethics call, not a styling one.
3. **RESOLVED — owner: my call = 13+ (COPPA line); and DO THIS LAST, after everything else.** ~~N3 age range.~~ Under-18 users change COPPA/FERPA posture. Needs an explicit floor.

---
## FOUND BY ME, NOT REPORTED (2026-08-22)
- **Paywall cannot fit everything above the fold on a 393pt phone.** Trial timeline (3 rows) +
  2 plan cards + benefits chart + pinned footer exceeds one viewport. The chart is currently
  BELOW the plan cards so the price stays at the fold, which means N17's "users can't tell what
  premium includes" still needs a scroll. Swapping the timeline out for the chart would fix that
  but deletes work measured from five competitor paywalls (C29/C31). **Owner decision.**
- **`[iap] configured but the current offering has NO packages`** fires on every launch. Confirms
  §4.2's open item — RevenueCat offering→package→product mapping still unverified. CAVEAT: seen on
  the SIMULATOR, where StoreKit does not fetch products without a config file. Unverified on device.
- The installed simulator app is a **dev-client build with no embedded bundle** — it cannot run
  without Metro. Worth knowing before anyone assumes the sim reflects a TestFlight build.

---
## N19 / N20 — INVESTIGATED 2026-08-22. Both reports are WRONG about the cause.

Both were filed as "expected, since no data/content has been added yet". Neither is that.

**N19 "Trade tab is bugged."** It is not. Captured on the simulator: portfolio $10,000.00, cash
available, News and Options entries, MARKET NEWS with live articles (Norwegian Cruise Line / Simply
Wall St, a Yahoo Finance item), and an IDEAS TO PRACTISE rail. The tab renders and has real data.
Whatever the cofounder hit, it was not an empty tab — needs a specific repro from him.

**N20 "AI feature not working."** Real, and fully diagnosed — the feature is BUILT, not missing.

  - `src/lib/atlas-chat.ts:49` throws `ChatError('no_api_origin')` when the API origin is absent.
  - `src/lib/api.ts:41` `apiOriginMissing()` is `Platform.OS !== 'web' && apiBase() === ''`.
  - `apiBase()` reads **`EXPO_PUBLIC_API_URL`**, and that variable is set in **ZERO** environments —
    production, preview and development all return 0 occurrences from `eas env:list`.
  - `atlas-chat.ts:46` predicted this in a comment: "Atlas is the most visible casualty of a
    missing origin."
  - `GEMINI_API_KEY` **is** configured, so the model side is ready. Only the host is missing.

**THE FIX IS NOT AN OTA.** `EXPO_PUBLIC_*` is inlined at BUILD time, so setting the variable does
nothing for an installed binary. It needs, in order:
  1. the API server deployed (Expo Router API routes need a host — EAS Hosting or equivalent),
  2. `EXPO_PUBLIC_API_URL` set to that origin in all three environments,
  3. a NEW BUILD. Build 13 and every OTA on top of it will still have no origin.

Deploying a server is an owner decision (it costs money and creates a public endpoint), so it is
flagged rather than done.

---
## N20 — API ORIGIN DEPLOYED AND WIRED, 2026-08-23

Owner authorised deploying to EAS Hosting.

- `npx expo export --platform web` + `npx eas deploy --prod` → **https://euphoria-native.expo.app**
- **VERIFIED the endpoint works before wiring anything to it.** `POST /api/chat` returned a real
  Gemini answer in Atlas's own voice: "Compound interest is earning interest on your interest...
  Does that make sense so far?" So the model, the key and the route are all good.
- `EXPO_PUBLIC_API_URL` created in **production, preview AND development** (verified 1 occurrence
  each). It was previously absent from all three, which is the entire cause of N20.

**STILL NEEDS A BUILD.** `EXPO_PUBLIC_*` is inlined at BUILD time. Build 13 was compiled before the
variable existed, so Atlas is still dark on it, and no OTA can change that. Build 14 will carry it.

Note `/api/market` answers 400 `bad_action` to a bare query — that is param validation, not a
failure. The route is up.
