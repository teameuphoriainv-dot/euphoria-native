# FEEDBACK LOG — cofounder round 1
Source docs (2026-08-22):
- **prompt** — design direction + 6 reference screenshots  `docs.google.com/document/d/1lfSL03UgYqFkasLfkOck0EJ3vtXkVGmKZAG7RX8xiuc`
- **notes**  — Euphoria App Feedback & Bug List, 23 items  `docs.google.com/document/d/1rZtQoNcUrMipOmdaixF1um3h0-b8-ME8dWOMUmBwBx0`

29 items after dedupe. `verified` is set by the OWNER on his phone only (§1.3). Mine is `ready-for-verification`.

Status: `open` -> `fixing` -> `ready-for-verification` -> `verified` | `wontfix (real reason)`

---
## SCOREBOARD — reconciled 2026-08-23

**`ready-for-verification` means I fixed it and confirmed it on the simulator. It does NOT mean
done.** Only the owner sets `verified`, on his own phone (§1.3). Nothing below is verified yet.

| state | count | which |
|---|---|---|
| ready-for-verification | 20 | N1 N2 N3 N4 N6 N7 N8 N9 N10 N11 N12 N13 N14 N15 N17 N18 N20 N21 N22 N23 + all of BATCH A |
| partial | 1 | N16 — the 3-lesson gate ships, the discounted annual rate does not |
| open | 1 | N5 — widened to every lesson; needs the curriculum re-sync, not a code fix |
| blocked | 1 | N19 — not reproducible, needs a repro from the reporter |

**The status column was wrong before this pass.** Eleven rows still read `open` for work that had
already shipped, because the table was never updated after the fixes landed. If you are reading
this file to decide what to work on, that is the failure mode it had — check the commit named in
each row rather than trusting a bare status word.

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
| N1 | "Em dash after the coach on the first screen — decide if we're keeping it; reads a little rough." | copy | P3 | ready-for-verification | welcome.tsx rewritten; `em-dash-prose-pin`|
| N2 | "Back arrow doesn't work on the 'How much do you already know?' screen. (Also: do we even need a back button here?)" | broken-flow | P1 | ready-for-verification | entry-aware `back()`, `entryStep` ref|
| N3 | "Age range starts at 18 — needs to be expanded to include younger/older users." | wrong-data | P1 | ready-for-verification | "Under 13" offered AND blocks; `age-floor-pin` guards both paths|
| N4 | "tapping the free trial banner takes you to the subscription screen; hitting back from there sends you to onboarding instead of back to Home." | broken-flow | P1 | ready-for-verification | same fix as N2|

## BATCH C — Lessons
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N5 | "the 'Americans can't cover a $1,000 emergency expense' question shows up more than once in the first personal finance lesson." | wrong-data | P1 | **open** | WIDENED by the rewritten audit from "the first lesson" to every lesson. Needs the curriculum re-sync, not a code fix|
| N6 | "it looks like the app measures time based on the lesson's listed duration, not actual time spent in-app. After finishing a lesson it shows 5 minutes even if you were on the app much longer" | wrong-data | P1 | ready-for-verification | real elapsed minutes, clamped 1-30; `goal-minutes-pin`|
| N7 | "the drag-to-order steps sometimes load with answers already in the correct position... None of them should ever start in the correct spot. Confirmed happening across every lesson" | **crash-class bug** | **P0** | ready-for-verification | DERANGED, not merely unsolved; `order-derangement-pin`|

## BATCH D — Home
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N8 | "'Saver League' (rank) is at the bottom of the page — should be moved up near the top; it's a key status indicator." | visual | P2 | ready-for-verification | league moved to the top of Home|
| N9 | "'Your Path' section feels crowded/redundant — Lessons, Trade, and Digest already have their own full tabs... Consider simplifying/compressing the bottom half" | visual | P2 | ready-for-verification | duplicate Trade/Digest cards deleted|

## BATCH E — You / Profile
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N10 | "Top half is too compressed: profile, free trial days left, league, and rank are all crammed together" | visual | P1 | ready-for-verification | (= P5)|
| N11 | "Tab is scope-confused: right now it reads like Settings... but also holds Friends and Games, which are gamified/social features and feel out of place here." | confusion | P2 | ready-for-verification | You split into PLAY & PEOPLE / SETTINGS|
| N12 | "Games are buried — currently only discoverable by clicking into Profile. Should be a bigger, more visible part of the app." | confusion | P2 | ready-for-verification | Games is a top-level TAB now — confirmed on the simulator 2026-08-23|
| N13 | "suggested friends (e.g., 'Priya S,' 'Chris M') appear to be bots, not real users — needs a real content/design decision here." | wrong-data | P1 | ready-for-verification | no fabricated follow relationships; DISCOVER discloses practice profiles|

## BATCH F — Subscription & Monetization
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N14 | "Post-lesson 'open the present' reward currently offers 'Start your free trial' even to users who are already on the free trial — confirmed bug." | broken-flow | **P0** | ready-for-verification | `trial-offer-pin`|
| N15 | "Same bug on Home: tapping the arrow next to the trial banner says 'Start your free trial to continue' even when already enrolled." | broken-flow | **P0** | ready-for-verification | `trial-offer-pin`|
| N16 | "instead of prompting after every single lesson, consider triggering the 'present' after a few lessons and offering a discounted annual rate" | confusion | P2 | **partial** | `OFFER_MIN_LESSONS = 3` gates the sheet. The DISCOUNTED ANNUAL RATE is not built|
| N17 | "Subscription screen needs a features list — right now it's just an image; users can't tell what premium actually includes." | visual | P1 | ready-for-verification | (= P6); chart moved below the plan cards so both prices stay above the fold|

## BATCH G — Digest / Trading / AI / Rewards / Settings / Copy
| # | verbatim | class | sev | status |
|---|---|---|---|---|
| N18 | "replace the current dropdown-oval categories... with distinct sections/rectangles stacked down the screen (similar to the Euphoria web app)" | visual | P2 | ready-for-verification | stacked sections, refined 2026-08-23 to a two-column grid at owner request|
| N19 | "Trade tab is bugged — expected, since no data/content has been added yet." | broken-flow | P1 | **open — BLOCKED** | not reproducible; Trade works against live data. Needs a repro from the reporter|
| N20 | "AI feature not working — expected to be non-functional right now." | broken-flow | P1 | ready-for-verification | root cause was EXPO_PUBLIC_API_URL unset in all 3 envs. API deployed, var set, build 14|
| N21 | "Add an in-app currency for completing achievements... a separate game-style currency (like the web app has)" | feature | P3 | ready-for-verification | Euphorium: 29-item shop, league week payout, tier-up bonus, equipped cosmetics on profile|
| N22 | "Add Light Mode / Dark Mode + other color preferences, housed under the Preferences section." | feature | P3 | ready-for-verification | light/dark + `PIXEL_PALETTE_LIGHT`; DARK is the default (owner call), v3 migration|
| N23 | "Em dashes throughout the app flagged as feeling rough/off — needs a broader copy pass" | copy | P2 | ready-for-verification | 5 prose em dashes; ranges and empty-value placeholders deliberately left|

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

---
# SESSION STATE — 2026-08-23

## Ready for the owner to verify on a phone (20 of 29)
| # | what shipped |
|---|---|
| P2/P3 | `SlabButton` — solid face, hard-cut slab, no glow. 19 call sites, one component. |
| P5/N10 | Profile spacing. The identity card and plan card were rendering FLUSH. |
| P4 | `TabGlyph` — 3pt lift on the focused tab. A lift, not a scale-pop (invariant). |
| P1 | Lesson intro staggers 40/120/190/260ms instead of one simultaneous fade. |
| P6/N17 | Premium colourway `#E0409B -> #F5842B` + Free-vs-Pro chart. Chart replaced the trial timeline (owner's variant A). |
| N7 | Order steps DERANGED, not merely unsolved. Was handing out ~1 correct answer per question. **pinned** |
| N14/N15 | Paywall no longer offers a trial to someone on one — or to a Pro subscriber. **pinned** |
| N6 | Daily goal counts REAL elapsed minutes; quests count lessons directly. **pinned** |
| N2/N4 | Onboarding back respects the entry step; no more dead chevron on step 0. |
| N8/N9 | League moved to the top; duplicate Trade/Digest cards deleted. |
| N13 | No fabricated follower relationships; DISCOVER now discloses practice profiles. |
| N11/N12 | You tab split into PLAY & PEOPLE / SETTINGS; Games surfaced on Home. |
| N18 | Digest categories are stacked sections with their own tints, not oval chips. |

## Open
- **N20** — FIXED but needs build 14. API deployed to `https://euphoria-native.expo.app`,
  `/api/chat` verified returning real answers, `EXPO_PUBLIC_API_URL` set in all 3 environments.
  `EXPO_PUBLIC_*` inlines at BUILD time, so no OTA can deliver it.
- **N19** — NOT REPRODUCIBLE. Trade tab renders with live portfolio, live market news and an ideas
  rail. Needs a specific repro from the cofounder.
- **N5** — deferred to the curriculum re-sync, owner's decision.
- **N1 / N23** — em-dash copy pass. ~50 candidates across 30 files; needs per-string judgement
  because en dashes in ranges (`18–24`) are correct typography and must stay.
- **N16** — reward pacing. **N21** — in-app currency (web has a Shop tab). **N22** — light/dark.
- **N3** — age floor to 13+. Owner: DO THIS LAST. Everything except copy is now done.

## Shipping state
Builds 13 and 14. Build 13 is VALID and attached to Internal Testers + Cofounders (verified from
the relationship endpoint, not from the attach script's own claim). Build 14 has an attach poller
waiting on it. 6 OTAs published on `production`.

## Two things that cost me time today, recorded so they do not again
1. **Fast Refresh does not reliably mount a NEWLY ADDED component.** A screenshot after an edit
   showed empty space where the Games card was; the source was correct and a COLD LAUNCH rendered
   it fine. Only a cold launch proves a new component.
2. **`idb ui swipe` silently no-ops without `--duration`.** It exits 0 and changes nothing, which
   reads exactly like "the app did not scroll". `--duration 0.6` works.

---
# DOC REWRITTEN 2026-08-23 — "notes" is now "Euphoria Audit"
Re-read in full. Same doc id, flat prose now, no [tags]. Most items map to the existing N-numbers.
THREE DELTAS that change what is already shipped or add work:

### N24 — NEW, not in the previous version
> "On the 'habit that makes it stick' screen, the x-axis 'time' label needs to move — it's
> currently under the words and looks weird. It should be on the right side of the axis instead.
> <- first lesson"

Never reported before. A chart axis label in the first lesson. Not started.

### N5 — WIDENED
Previous: the $1,000 question repeats "in the first personal finance lesson".
Now: **"this needs to be fixed for every lesson, not just that one."**
So it is not one bad lesson, it is a de-duplication pass over the whole corpus. Still deferred to
the curriculum re-sync per the owner, but the SCOPE is now every lesson.

### N11 / N12 — ESCALATED, and my shipped fix does NOT satisfy this
> "Friends and Games should be moved **out of the You tab** and made a bigger, more visible part
> of the app overall."

What I shipped groups them INSIDE the You tab (PLAY & PEOPLE / SETTINGS) and adds a Games card to
Home. He is now asking for them to LEAVE the You tab. That is the web app's structure — Games is a
top-level tab there, and there is no You tab at all.

**This reopens the navigation-restructure question the owner previously answered "fix them
individually".** The doc has since been rewritten to ask for the structural change explicitly.
NEEDS THE OWNER'S CALL — do not restructure the tab bar on my own reading of a reworded sentence.

### Also worth noting
The audit still says "Assuming AI isn't supposed to work right now" and "Assuming Trade is bugged
since no data has been added yet." Both assumptions are wrong and both are now disproven:
Trade renders with live data, and Atlas works — build 14 carries the API origin.

---
# N21 DELIVERED IN FULL — 2026-08-23

Owner chose "match the web Shop fully" after being shown the two blockers. Both are now cleared.

## What shipped
| layer | what |
|---|---|
| catalogue | `src/lib/shop-items.ts` — the web's 21 items VERBATIM, 3 tabs, award rates |
| economy | coins / inventory / doubleXpUntil / streakFreezes / hints / hearts / equipped, all persisted |
| earning | lessons `min(100, 50+xp)`, streak +25 **only when it advances**, quests +30, game win +10 |
| shop | `src/app/shop.tsx` — 3 tabs, rarity tags, shortfall pill, device-local disclosure |
| pixel art | `src/lib/pixel/*` — **86 sprites, 5 files copied byte-for-byte**, 1 new renderer |
| hearts | lost on a wrong answer, refill at read time on a new day, shown only in a lesson |
| hints | button appears only when owned, reveals the correct option |
| avatar | crown / top hat / wizard hat / shades / monocle / ring, worn by Atlas |
| profile | 3 themes tint the identity card, 3 frames ring the avatar, 2 badges sit with the plan chip |
| reactions | coin and flame play ONCE on real events, never idle-loop |

## The two things that would have been wrong without looking
1. **The padlocked second price is `item.price - coins`** — how many MORE you need. It reads
   unmistakably as a discounted Pro tier (every gap was exactly -10). Confirmed at
   `CoinShop.tsx:224`. Inferring it from pixels would have shipped a pricing tier that does not
   exist.
2. **The pixel renderer must NOT loop.** My first version defaulted to `animate: true`. The bolt
   came out white on iOS and gold on web because `bolt`'s frame 0 is deliberately blown out. The
   web states the rule in its props: "Animation, off by default... no idle loops." On an app with
   an open idle-render investigation (§4.1, 4-5 commits/sec at rest), 21 shop cards each holding a
   60ms interval would have been that bug authored on purpose.

Both were found by RENDERING BOTH APPS AND COMPARING, not by reading either one alone.

## Deviations, stated
- **Hats go on Atlas.** The web dresses a separate user avatar; iOS has none, because Atlas is a
  mascot rather than a player character. Inventing a second character to hang hats on would be
  worse than the deviation.
- **The wallet is device-local and says so on screen.** The web wallet is Supabase behind an
  account. Owner approved on condition it is stated, not hidden.
- **Shop has no tab.** Games took the last slot. Entry is the wallet pill in the Home header.

## Still not done
- `streakFreezes` is counted and purchasable but nothing CONSUMES it yet — the streak logic does
  not check it on a missed day. The item banks, it does not yet protect.
- Running out of hearts does not gate anything. Hearts count down and floor at 0.
