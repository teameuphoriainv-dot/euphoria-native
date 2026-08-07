# Work order — Atlas everywhere + tab overhaul

Durable across compaction. Update the STATUS column as units land. User instruction: keep working
through this list one unit at a time; ScreensDesign research BEFORE implementing each unit.

## Standing rules for this work order

- ScreensDesign MCP is MANDATORY before any design change. Read the SCREEN (`screen_detail`,
  `include_image: true`), use `neighbor_count`, count convergence across >=4 apps and report the
  hit rate, state transferability. Never infer absence from a paginated pull.
- `search_screens` is BROKEN (pydantic `extra_forbidden` on `app_id`). Route via `search_apps` +
  `detected_patterns`, or feed the leaked app ids from the error payload to `app_screens`.
- Every unit ships a measured before -> after number and passes `tsc`, `expo lint`, `certify.py`.
- Anything not verified on device is marked UNVERIFIED and stays that way.

## Units

| # | unit | status |
|---|---|---|
| 1 | Chat API route (non-streaming), curl-verified | DONE `src/app/api/chat+api.ts` |
| 2 | Entitlement layer: `isPro`, `canAccessLesson`, `FREE_LESSON_LIMIT=5` | DONE, UNVERIFIED on device |
| 3 | Settings: real account/notifications/preferences + dev Pro toggle | DONE, device-verified |
| 4 | Chat streaming + rate limit + per-session cap | TODO |
| 5 | Atlas chat UI — `src/app/chat.tsx` + `src/lib/atlas-chat.ts` | DONE, UNVERIFIED on device |
| 6 | Atlas entry points: home mascot, learn/trade/digest headers, you row, digest article end, lesson wrong-answer | DONE, UNVERIFIED on device |
| 7 | Trade tab rebuild — real paper trading | DONE, device-verified |
| 8 | Digest tab — ASSESSED, no rebuild needed (already has the 3/3 mechanism) | DONE |
| 9 | You tab redesign (ScreensDesign first) | TODO |
| 10 | New-tab gap analysis vs FinTech/EdTech competition | TODO |
| 11 | Dead-button audit: every interactive element does something real | TODO |
| 12 | IAP wiring up to the App Store Connect boundary | TODO |

## Known state at time of writing

- `web.output` is now `"server"` (API routes require it; was `"static"`).
- `GEMINI_API_KEY` goes in `.env.local` (gitignored). Free key: aistudio.google.com/apikey.
  UNVERIFIED: no real completion has run yet.
- Paywall sells $59.99/yr, $9.99/mo but NO purchase SDK exists (`onboarding.tsx:341-345`).
  "Start my 7-day free trial" is `router.replace('/auth')` — a navigation button with a price tag.
- Lesson entry points: `home.tsx:195`, `learn.tsx:198`, `digest/[slug].tsx:194`. All land on
  `/lesson`, which is where the gate lives.
- 3 pre-existing lint errors, same `react-hooks/set-state-in-effect` rule, in files not yet
  touched: `games/term-match.tsx:71`, `atlas-speech.tsx:34`, `number-rollup.tsx:29`.

## Open taste questions for the user

- `FREE_LESSON_LIMIT = 5` — the offer. One constant in `store.ts`.
- Locked-screen copy: "You've used your 5 free lessons."
- Atlas system-prompt wording (voice rules are evidence-backed 3/3; sentences are not approved).

## ScreensDesign brief — Atlas chat UI (unit 5)

Apps pulled: Praktika 1816, Astra AI 2190, Promova 936, Answer.AI 1089, Solvely 826.
NONE is finance education (3 homework tutors, 2 language tutors). The TEXT-TUTOR SHELL transfers;
video avatars / photo-scan / model pickers do NOT.

| mechanism | hit rate | decision |
|---|---|---|
| Mascot present in the thread | 5/5 | ADOPT — Atlas already exists as SVG |
| Persistent bottom input, action-naming placeholder | 5/5 | ADOPT — "Ask Atlas..." |
| Header carries CONTEXT not a generic title | 4/5 | ADOPT — show the lesson/course you came from |
| Suggested follow-up chips under the reply | 3/5 (3/3 text tutors) | ADOPT — kills the blank-page problem |
| Feedback controls (thumbs/copy/regen) | 3/5 (3/3 text tutors) | DEFER — no telemetry to receive it yet |
| Usage meter in-thread + upgrade CTA | 3/5 | ADOPT — this IS the Pro gate |
| Explicit thinking state | 2/5 | ADOPT — Atlas has a `thinking` expression already |
| "All responses are A.I. generated" disclaimer | 1/5 | ADOPT ANYWAY — 1/5 is not convergence, but this is
  FINANCE. Justified by domain risk, not by the reference set. Said explicitly. |

Verbatim from the references, worth stealing the shape of:
- Answer.AI: "You're running out of lightning! Add more to solve a problem" + "+ Add"
- Astra AI: refuses inline in the thread, then offers upgrade (does NOT bounce to a paywall screen)
- Solvely: "Understanding your question..." / "Thought for 1s" as the pending state
- Astra AI empty state: "No messages yet. Start the conversation!"

## The revenue cohort — reference set for ALL remaining units

`search_apps` category=[Education, Finance], min_revenue=250000, max_revenue=750000 → **71 apps**.
This is the band Euphoria is aiming at, so every remaining unit benchmarks against THIS list, not
against whatever turns up in a generic search. Assignments:

| unit | benchmark against | app_id | rev/mo |
|---|---|---|---|
| Atlas chat, deepen | Gauth: AI Study Companion | 39 | $600k |
| Atlas chat, deepen | Astra AI: Study & Exam Prep | 2190 | $550k |
| Trade tab (7) | Investing.com: Stock Market | 1171 | $450k |
| Digest tab (8) | Bloomberg Business News | 1580 | $750k |
| Digest tab (8) | Deepstash: Smarter Every Day | 422 | $450k |
| Digest tab (8) | Nibble: Daily Learning & Quiz | 918 | $450k |
| You tab (9) | Elevate - Brain Training | 1395 | $750k |
| You tab (9) | Zutobi: Permit & Driving Prep | 105 | $550k |
| New tabs (10) | Kahoot! Play & Create Quizzes | 1544 | $550k |

Gauth ($600k) is the closest single comparable to Atlas and has NOT been pulled yet — do it first.

Note the shape of the cohort: of the 30 highest, **~20 are Education and only 1 is Finance**
(Investing.com). Euphoria sits in the gap between them, which is either the opportunity or the
reason nobody is there. Worth resolving before adding tabs.

## ScreensDesign brief — Gauth (app 39, $600k/mo), the closest comparable to Atlas

Pulled 24 screens. What a $600k AI tutor actually does, including where it CONTRADICTS what we built:

1. **TWO tabs. Home and Profile. That is the whole app.** Euphoria has five (home, learn, digest,
   trade, you). Before adding ANY tab in unit 10, resolve this — the cohort leader went the other way.
2. **"Ask again"** sits on every AI answer as a persistent regenerate control.
   -> We CUT regen as a dead control. Wrong call: regen does real work (re-request). Reinstate it.
   Thumbs stay cut — those need telemetry we do not have, and Gauth's thumbs go to their analytics.
3. **The upsell is an ESCALATION AT THE MOMENT OF FAILURE, not a counter.**
   Verbatim: "Still feeling stuck?" -> "Send to an expert" + "PLUS" badge + "For the toughest 5%".
   -> Our "you have used 10 of 10 messages" is the weak version. Gauth sells you a way FORWARD at
   the exact moment you are stuck. We have no human experts, so the transferable form is: when the
   user is still stuck, offer Pro as the way through — not as a toll gate.
4. **Answer FIRST, then numbered steps.** "(6,6)" / "10000" lead, working follows. Not prose.
5. **"Add to question bank" with failure-reason tags**: "Key point not mastered", "Don't understand
   at all", "Miscalculation", "Carelessness", "For next exam". Retention via self-diagnosis.
6. **Q&A history lives in Profile.** Threads persist and are revisitable. Ours are in-memory only.
7. **Share sheet on answers** (Message, Facebook, Instagram, Telegram, Copy link) — viral loop.

Transferability: Gauth is homework help, not finance. The MECHANISMS that transfer are 2, 3, 4, 6.
Not transferable: camera scanning (their core input), human expert marketplace.

## Settings brief + the UIcon type bug (both DONE)

ScreensDesign pull, $750k–$2.25M cohort (Elevate 1395, Praktika 1816, Meetup 107, Kling 1699,
Loora 1134): plan status in settings **5/5**, help+legal **5/5**, a preference that TUNES THE CORE
LOOP **3/5**, notifications with a stated time **3/5**, restore purchases **3/5**, sign out **3/5**.

`settings/[section].tsx` was a "coming soon" dead end for all three You rows. Now real:
- account: plan status + what's LEFT + upgrade + restore + name + support + sign out + version
- notifications: real `applyDailyNudge`, persists what the OS SCHEDULED, states 7:00 PM
- preferences: daily goal 5/10/20 → writes `profile.dailyMinutes`
  VERIFIED on device: 10 → 20 wrote to the store and Home changed to "5/20" / "15 min to keep
  your streak". Restored to 10.

### The UIcon bug — root cause, worth remembering
`const P: Record<string, React.ReactNode>` made `UIconName = keyof typeof P` collapse to `string`.
The file's own comment says "deliberately NOT `| string`" — the ANNOTATION defeated it. Every
unknown name type-checked and rendered as `?? P.sparkle`.
Shipped broken: `x` (chat close), `arrowUp` (send + 3 starter rows), `refresh` (Ask again).
Fix: `} satisfies Record<string, React.ReactNode>` + narrow the 6 `string`-typed call sites
(tab-bar TAB_ICONS, auth prop, Choice type, onboarding PROOF/TRIAL_STEPS, you ROWS).
LESSON: `satisfies`, never a widening annotation, on any lookup table whose keys are an API.

### Chat visual fixes (measured on device)
- header `10/10` -> `9 left`; caps everywhere -> sentence case (`label` token is an UPPERCASE
  eyebrow, 11pt — wrong token for conversational text)
- dead band above composer **313pt -> 184pt (-41%)**; starter pitch 51 -> 64-75pt
- starter trailing glyph REMOVED: identical on all three = decoration, same rule that killed the
  node-type badges
- WARN_AT=3 warn-before-the-wall banner + header CTA (Answer.AI runs both)

## Trade tab rebuild (unit 7) — DONE, device-verified

ScreensDesign: Investing.com (app 1171, $450k/mo) — the ONLY Finance app in the $250–750k cohort.
Adopted: value-summary card above everything; holdings and watchlist as separate labelled lists;
row = name+ticker left, price+change right; Buy/Sell on the stock detail screen.
NOT adopted: "Daily P/L" — they have price history, we have one static quote per ticker, so a daily
number would be fabricated. "Return since you started" is the honest equivalent.

### What was wrong (all of it shipped)
- `$104,237.55` portfolio + `+$1,284 (1.24%) today` — invented. home.tsx's own docblock records
  that this EXACT card was deleted from Home for being "entirely invented"; it survived on Trade.
- the "chart" was a hardcoded bezier `M0 50 C40 46 …` — decoration posing as data, on BOTH
  trade.tsx and stock/[sym].tsx
- position card read `stock.qty`/`stock.value` from the mock table, so it showed "12 sh" whether
  or not you held any
- "Practice a trade" button on the stock page → `router.push('/trade')` — a circular dead button
- 2 of 3 segments ("Research", "Compete") were "coming soon"

### Now
`cash` + `positions` in the store; `buy()`/`sell()` are the only writers. `portfolioValue()` =
cash + Σ shares×price. `STARTING_CASH = 10_000` (not the conventional $100k — this teaches
personal finance and a six-figure fantasy balance teaches the wrong instinct). Charts removed
until a series exists. Segments removed. Buy/Sell live on the stock detail.

### Device verification (idb, not inference)
| step | expected | actual |
|---|---|---|
| fresh | $10,000.00, "No trades yet" | ✅ |
| stepper 1→3 | "3 × $228.50", "Cash after this buy: $9,314.50" | ✅ |
| Buy 3 AAPL | cash 9314.5, positions {AAPL:3} | ✅ exact |
| Trade tab | Cash $9,314.50, YOUR POSITIONS "Apple, $685.50", AAPL out of watchlist | ✅ |
| Sell 3 | cash 10000, positions {} (key deleted) | ✅ |
| disabled Sell | states WHY: "Sell unavailable, you hold none" | ✅ |

### Bug caught ON DEVICE, not in review
"No trades yet" showed while holding 3 AAPL. The condition was `ret === 0`, but a buy AT MARKET
PRICE leaves return exactly 0 — correct maths, wrong sentence. Now keyed on `held.length > 0 ||
cash !== STARTING_CASH`, with "Even so far" for a genuine zero return.
LESSON: a derived-value condition is not a proxy for an activity condition.

## USER BRIEF — Trade tab, Robinhood-grade (unit 7b). VERBATIM REQUIREMENTS

The rebuild in unit 7 made Trade HONEST but the user's verdict is "very empty, not much of a feel,
seems literally vibe-coded in five minutes". Honest is not the same as good. Requirements:

1. **Robinhood-style layout.** "Right now Robinhood is leading in the UI space for trading."
2. **Portfolio graph with timeframes: 1H, 1D, 1W, 1M, 3M, YTD, 5Y.** Laid out like Robinhood.
3. **Search every NYSE stock.** "There can't only be five or ten stocks." A real search bar.
4. **Options and futures.** Pro-gated. Free/Pro members get a couple of trades, then RATE LIMITED,
   because real options/futures market data is a backend system requiring third-party providers.
   The rate limit is therefore an HONEST constraint, not an invented one — say so in the UI.
5. **News**, using the free API already used by the web app (see euphoriaweb-current / euphoriamobile).
6. **Charts** on stock detail.
7. Reconsider the starting amount.
8. "Practice with $10,000. No real money." is BLAND — rewrite.
9. Pull competitor FinTech apps via ScreensDesign and match their development quality.

## STANDING INSTRUCTION (user, repeated 4x — do not lose this)
Use the ScreensDesign MCP CONSISTENTLY, on every design task, in every future session.
Benchmark against the $250k–750k/mo cohort and above. The goal is a fully functional, seamless
app — no dead ends, no placeholder screens, no invented data.

## FOUND: the web app already has the entire market-data backend

`~/euphoriaweb-current/supabase/functions/` — 35 deployed edge functions. The relevant ones:

| function | provider | gives us |
|---|---|---|
| `polygon-market-data` | **Polygon.io** | `/v3/reference/tickers` = SEARCH ALL US TICKERS; `/v2/aggs/.../range/{mult}/{timespan}/{from}/{to}` = CHARTS AT ANY TIMEFRAME (1H/1D/1W/1M/3M/YTD/5Y); `/v2/snapshot` quotes; `/v2/reference/news`; gainers/losers; market status; SMA/RSI |
| `fetch-economic-news` | **Alpha Vantage** `NEWS_SENTIMENT` | the free news API the user remembered, 6h cache, has a FALLBACK_NEWS array |
| `execute-trade`, `fill-pending-orders`, `process-settlements`, `competition-trade` | — | a real paper-trading engine incl. pending orders and settlement |

**Every single item in the user's Trade brief is already backed by a working endpoint.** Do not
reinvent: proxy Polygon through an Expo API route (`src/app/api/market+api.ts`), the SAME pattern
as `api/chat+api.ts`, so the key stays server-side. The native app has NO supabase dependency and
does not need one for this.

NOTE: Digest is NOT a news feed — `src/lib/digest-content.ts` is AUTO-SYNCED from
`euphoriaweb-current/src/features/digest/content/` via `./scripts/sync-digest.sh`. It is authored
educational guides. Do not replace it with headlines; news belongs on Trade.

## BLOOM — the reference app for the WHOLE app (user instruction)

ScreensDesign app 2004, `bloom-learn-to-invest`, Contour Labs. 4.8 stars, 50k downloads/mo,
230 recorded screens, `latest_app_video_id: 2079`.
**Revenue: ScreensDesign has NO estimate (0 for every month of 2026). External reporting puts it
at ~$3.5M ARR ≈ $291k/mo, $15/mo or $120/yr, ~2M users, $4.4M raised.** Treat the external figure
as a signal, not verified — but it places Bloom INSIDE the $250–750k/mo cohort.

**PRICING FINDING, directly actionable:** Bloom charges $15/mo · $120/yr for financial-literacy
modules + fractional investing — Euphoria's Learn + Trade bundle. Euphoria asks $9.99/mo ·
$59.99/yr, roughly HALF, for a comparable scope. Revisit before IAP lands.

### Bloom's full flow map (from `app_detail`, use these to pull frame-by-frame)
Onboarding, 10 steps, 0–115s:
  ATT prompt -> value proposition -> welcome + PRESS MENTIONS (Forbes, Fox Business, Yahoo
  Finance) -> auto-scrolling FEATURE CAROUSEL (real investing, auto-portfolios, lessons, rewards)
  -> SOCIAL PROOF (1M+ users, 4.7 stars, testimonials from UC Berkeley / Harvard students) ->
  phone-number signup + SMS code -> "How did you hear about us?" -> name/email/DOB ->
  custom notification+biometric warm-up -> "You're in!"
Main flows (flow ids for `search_flows` / deep links):
  53302 Exploring Stocks (150–193s)  dashboard -> ETF -> chart -> TIMEFRAMES -> CHART TYPE toggle
  53303 Using AI Chat (193–215s)     ask about a specific stock  <- this is Atlas
  53307 Subscribing to Plan (353–363s)
  53304 Taking a Lesson & Quiz (406–532s)
  53305 Creating a Portfolio (580–663s)  "playlists" — named, curated baskets of stocks
  53308 Claiming a Reward (858–920s)     SCRATCH-CARD to reveal FREE STOCKS after passing a quiz
  53306 Inviting a Friend (1227–1282s)   contacts -> pre-populated SMS
Detected patterns: MascotCharacter, PressMentions, FeatureCarousel, UserTestimonials, StarRating,
DiscountOffer, RatingWarmup, NotificationWarmup, SignUpDuringOnboarding, HowDidYouHearAboutUs.

### The mechanism Euphoria is missing most
**Learning PAYS OUT into the trading sim.** Bloom: pass a quiz -> scratch card -> free stock.
Euphoria has XP and a paper portfolio and NOTHING connects them. That bridge is the single
highest-value idea in this pull.
Also missing: portfolio "playlists" (named baskets), chart-type toggle, friend invites.

## ROBINHOOD chart spec (web, not in ScreensDesign — `search_apps` returns total: 0)
Sources: robinhood.com/support/articles/using-the-charts, ixd.pratt design critique.
- Ranges: 1D 1W 1M 3M 1Y ALL. **No 1H and no YTD** — the user asked for both; 1H is ours alone.
- Intervals BY range: 1D -> 5–10 min, 1W -> 10–30 min, **1M -> 1 hour**, 3M -> varies.
- Selector sits DIRECTLY adjacent to the chart, never in settings — switching ranges is a core
  loop and any friction breaks it.
- Portfolio chart = a SINGLE LINE of total value. Simplicity over detail.
- Known weakness (do better): no custom range selector.
APPLIED: our `1M` was on daily bars (~22 points, blocky). Now hourly, matching Robinhood.

## Portfolio chart + derivatives (DONE, device-verified)

### Portfolio chart — `components/portfolio-chart.tsx`
Robinhood's portfolio view is ONE LINE of total value, ranges 1D 1W 1M 3M 1Y ALL. Copied exactly.
Plots `valueHistory` from the store, written on every trade.
**Deliberately NOT a back-test.** Polygon could project today's holdings backwards into a rich 5Y
curve, but that is what the basket WOULD have done, not what this account was worth. Same class of
lie as the $104,237.55 card. Empty state says "Your chart builds as you trade".
Window is anchored to the NEWEST SNAPSHOT, not wall-clock now: `Date.now()` in render is impure
(react-hooks/purity) and would differ between two renders of identical state.

### Derivatives — `app/derivatives.tsx` + `lib/options.ts`
Free -> locked. Pro -> `PRO_DERIVATIVE_PREVIEW = 3` contracts, then stop.
THE CAP IS HONEST AND SAYS SO on screen: "Live options and futures need a derivatives data
provider we haven't connected yet. Until then premiums here are estimated with Black-Scholes at
30% assumed volatility — a teaching model, not a market quote."
Premiums are REAL Black-Scholes (`lib/options.ts`), assumptions stated as named constants, with a
`__DEV__` self-check asserting OTM<ATM, longer>shorter, positive premiums, and put-call parity.

Device-verified premium behaviour (NVDA spot $1,184):
| contract | premium | check |
|---|---|---|
| ATM $1,184 / 30d call | $42.52 | matches 0.4·S·σ·√T ≈ $40.7 + rate term |
| OTM $1,302 / 30d call | $7.81  | further out costs less |
| OTM $1,302 / 90d call | $32.46 | more time costs more |
| ITM $1,302 / 90d put  | $137.68| C−P = −105.22 = S−Ke^(−rT) — parity to the cent |
Opening one: cash 6448 -> 5666.94 (−781.06 exact), `derivativeTrades: 1`, counter "2 of 3 left",
OPEN CONTRACTS row rendered.

### Two fixes found by testing on device
1. Trade watchlist rows were pushed BELOW THE FOLD (y=904 vs tab bar at 819) by the new chart and
   two nav rows — an a11y anchor is not a hit target. Tap a visible row or scroll first.
2. `idb ui tap` CANNOT actuate a React Native `Switch`, even dead-centre on its real frame. Fixed
   properly rather than worked around: the whole ToggleRow is now pressable (standard iOS, far
   bigger hit target, and testable). `accessibilityRole="switch"` on the row, Switch hidden from
   the a11y tree so VoiceOver does not announce the label twice.

## Bloom reward loop, options chain, news (DONE)

### Reward loop — `app/reward.tsx`, Bloom flow 53308 frame-for-frame
860.5s "Woohoo! You passed & earned 3 free stocks!" / 878.9s "NOW SCRATCH THE CARDS!" /
885.3s reveal w/ confetti + tilted card + ticker + $ / 902.5s "SCRATCH THE NEXT CARD".
`REWARD_CARDS_PER_LESSON = 3`, each a FRACTIONAL dollar amount ($0.25–$2.00) of a real ticker,
credited as fractional shares. Cards ride the SAME dedupe as `completeLesson`, so re-opening a
finished lesson cannot farm stock. `rewardsEarned` tracked separately so free stock does not
silently inflate what looks like trading skill.
Deliberate departures from Bloom: TAP not scratch (a drag is unreachable by VoiceOver); no
"Share +50" (we have no soft currency and no share destination — that is a dead control).

### Options — `app/options.tsx` + `api/options+api.ts`. FUTURES REMOVED ENTIRELY.
User verdict on the old screen was correct: "not really options its like nothing". It was a
Black-Scholes calculator with chip pickers — no contracts, no real expiries, no bid/ask, no greeks.
**PROVIDER: Tradier sandbox.** Free, delayed, full chain WITH greeks (IV/delta/gamma/theta/vega)
per strike and expiry. Chosen over Polygon because Polygon's options sit behind a paid plan;
Polygon rebranded to Massive in early 2026 (api.polygon.io still works). Env: `TRADIER_TOKEN`.
Falls back to Black-Scholes rows, LABELLED as a model, when no token.

ScreensDesign for the redesign: **NO STRONG MATCH.** Robinhood is not in the dataset (`total: 0`,
verified twice). Investing.com's "Contracts" tab is a FUTURES month table; TradingView's is an
options SEARCH list. Neither is a chain. Per AGENTS.md rule 7, said so rather than bending them.
What legitimately transferred:
| mechanism | hit | applied |
|---|---|---|
| tabbed sub-nav on the instrument | 2/2 | options belongs on the stock, as Robinhood does |
| persistent bottom Buy/Sell bar | 1/2 | order ticket kept at the foot of the flow |
| explicit delayed stamp ("Delayed. Currency in USD") | 1/2 | adopted verbatim in shape |
Robinhood's own, from docs: expiry row, strike list, ITM marker, and BREAK-EVEN per strike.
Break-even is the teaching number — device-verified: $1,066 strike costs $12,628 and needs +0.7%;
$1,302 strike costs $781 and needs +10.6%. Cheap is only cheap because the stock must travel.

### News — `app/news.tsx`
Bloomberg's row shape (source · time-ago, then bold headline). Two modes: `/news` wire and
`/news?sym=X` from a stock page (Investing.com scopes news to holdings, which is more useful).
Polygon `/v2/reference/news`. No key -> says so; never placeholder headlines.

### Bugs caught and fixed this pass
1. Reward reveal had a SpringPressable wrapping a GradientButton that BOTH called next() — one tap
   would burn two cards. Found by tracing the state machine before shipping.
2. Fractional shares rendered as `0.0008445945945945946 shares`. Added `shares()` to stocks.ts,
   verified: 0.000844594 -> 0.00084, 3 -> 3, 1.5 -> 1.5.
3. `Date.now()` during render in portfolio-chart (react-hooks/purity) — window now anchors to the
   newest snapshot.
4. Two `set-state-in-effect` errors I introduced (price-chart, search) — derived the loading state
   instead of flag-managing it.
5. news.tsx had duplicate expo-router imports + an unused View.
Repo lint is back to the exact baseline: 50 problems, 3 errors, 47 warnings. All 3 errors are
pre-existing and in files this session never touched.

## Options chain — SIDE-BY-SIDE rebuild (the real fix)

User: "it's still not an actual options layout." Correct. The single-column list was a price list.
From Robinhood's own docs (robinhood.com/us/en/support/articles/options-chain): they ship TWO
layouts — a "focused view" (one side, more metrics) and a **"side-by-side view" where "calls and
puts [are] organized side-by-side, and strike prices in the middle"**. The side-by-side spine is
what makes a chain read as a chain. Tapping the CALLS or PUTS heading collapses to focused view,
exactly as Robinhood does.

Device-verified, NVDA spot $1,184, and correct on BOTH sides:
| strike | call | put |
|---|---|---|
| $1,066 | $12,628.60 | $478.71 |
| $1,125 | $7,853.30 | $1,584.04 |
| $1,184 ATM | $4,251.90 | $3,863.28 |
| $1,243 | $1,973.44 | $7,465.46 |
| $1,302 | $781.06 | $12,153.71 |
Calls cheapen as strike rises, puts richen. ATM parity: C-P = $388.62 vs S-Ke^(-rT) = $388.50.
ITM shading verified visually: call side shaded below spot, put side above, neither at the money.

### BUG: blank screen, and what it teaches
After the rewrite the WHOLE APP went blank. Device log gave the exact cause:
`ReferenceError: Property 'StrikeRow' doesn't exist` — but grep found ZERO references in the file.
It was a STALE BUNDLE: Fast Refresh wedged on an intermediate edit where StrikeRow was used but no
longer defined, and never recovered even after the file was correct. `tsc` was clean throughout.
FIX: `simctl terminate` + re-open the dev-client URL.
LESSON: a green tsc does NOT mean the running app is green. When a screen renders blank, pull
`xcrun simctl spawn <udid> log show --last 3m --predicate 'processImagePath CONTAINS "euphoria"'`
and grep for ReferenceError — it named the cause in one line after guessing had failed.

## NYSE coverage — ALREADY SOLVED, do not rebuild
"Search up all the stocks in the NYSE" is done: Polygon `/v3/reference/tickers?search=&market=stocks
&active=true` covers NYSE, NASDAQ and AMEX. Wired in `api/market+api.ts` + `app/search.tsx`.
Needs POLYGON_API_KEY to return rows; without it the screen says so.

## News provider — the web app's own choice, confirmed
`euphoriaweb-current/supabase/functions/fetch-economic-news/index.ts` line 100:
`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro,finance&limit=10&apikey=`
Alpha Vantage NEWS_SENTIMENT — free tier, 25 req/day, which is why the web app caches 6h and keeps
a FALLBACK_NEWS array. Sentiment score per article is a genuine differentiator for a teaching app.

## OPEN BUG — OrderSteps last row sits under the pinned CTA

Found while driving investing-fundamentals:1 on device. A 6-row ordering step renders its last row
at top=717..bottom=796 while Continue occupies top=760..bottom=816. 36pt (~46%) of the row is
under the button, and the footer paints after the body so it eats the taps. Since the last row is
usually one you must move, the step can stall with Continue disabled and no hint to scroll.

`lesson.tsx:338` already documents this class of bug for MultiSelect ("the button looked dead").
The scroll fixed CLIPPING; this is OCCLUSION and is still open.

`FOOTER_CLEARANCE` raised 96 -> 170. What that does: guarantees the row can be SCROLLED clear.
What it does NOT do: change the default scroll position — the content already overflows, so
`justifyContent:'center'` is inert and paddingBottom only extends scrollable space BELOW.
REAL FIX: shorten OrderSteps' row height / vertical rhythm so six rows fit above the footer, or
top-anchor the step and let it scroll from the first row. Design change, not a constant.

METHOD NOTE: anchors lied here. Row-centre vs button-centre said "32pt clear"; real FRAMES said
36pt of overlap. Always `idb ui describe-all` and compare y..y+height.

## ANIMATION — Rive is ALREADY INSTALLED, do not add Lottie
`package.json` already has `rive-react-native ^9.8.5` and `rivemcp ^1.8.3`, plus
`src/components/atlas-rive.tsx`. Rive beats Lottie for this app: interactive state machines (drive
Atlas's expression from chat/lesson state at runtime), smaller files, and an MCP server is already
wired. Adding Lottie would mean TWO animation runtimes for one job — duplicate native weight and
two ways to express the same motion. Reanimated 4.5.0 covers the physics layer (RewardPop, RiseIn,
SpringPressable, Confetti, CelebrationRays) and is used throughout.
NEXT: use the existing Rive runtime for the reward reveal and Atlas expressions rather than a new dep.

## Trade tab — Bloom/Investing.com/TradingView/Yahoo convergence pass

Counted across the four:
| mechanism | hit | state |
|---|---|---|
| Follow / watchlist as a first-class action beside Buy | **3/4** | DONE |
| Key statistics block (52wk hi/lo, volume, day's range) | **3/4** | TODO |
| Market movers / trending | 2/4 | TODO — Polygon gainers/losers already in the proxy |
| Category browse (Bloom's 10 sectors) | 1/4 | not worth it at 7 tickers |

### FAKE WATCHLIST — removed
Trade rendered "Watchlist" as `ALL_SYMS minus what you hold` — a list nobody chose, labelled as
though they had. Bloom, Investing.com and TradingView all pair Follow with Buy and never show a
watchlist the user did not build. Now `watchlist: string[]` + `toggleWatch()`, persisted.
Empty state offers the seeded set as "Suggested", NAMED as suggestions.
Device-verified: Follow on TSLA wrote `watchlist: [] -> ["TSLA"]`, and the Trade tab's WATCHLIST
section appeared.

### BUG: options were invisible to the portfolio
`portfolioValue()` summed cash + equity only, so opening a $781 contract read as a straight
"-$781.06 (7.81%) since you started" — the cash left, the asset it bought was invisible.
FIXED: open contracts count, MARKED AT COST. Cost not mark-to-market because re-pricing needs a
live chain (spot moved, theta decayed, vol shifted) and we have none — an option therefore
contributes exactly zero return until priced. Understated, never invented. Becomes a mark against
the live bid once Tradier is connected.
Device-verified: "-$781.06 (7.81%)" -> "Even so far".

### Bloom mechanics NOT taken, and why
- Auto-Portfolios (Nancy Pelosi +31%, Bill Ackman, Ray Dalio w/ investor counts): needs real
  13F/holdings data and implies we track politicians' trades. Big claim, no source. NO.
- Playlists w/ public usernames + emoji reactions + "REACT FOR OINKS": a social graph and a soft
  currency, neither of which exists here. Would be dead controls on day one.
- "Bloom users earn around $6 per month from learning and playing" — a revenue claim we cannot make.

## Trade layout — "it looks vibecoded". Three specific causes, all fixed.

1. TWO CHANGE LINES stacked: the card printed a static "Even so far / since you started" while
   PortfolioChart printed a range-aware "+$0.00 (0.00%) all time" directly beneath it. The same
   fact twice, disagreeing about scope — the classic tell of two components each rendering their
   own status with no owner. The chart now owns it exclusively (it is the one that knows the
   selected range); the card's copy and its `traded`/`ret`/`retPct`/`up` computation are deleted.
2. "WATCHLIST" LABELLED THE WRONG CONTENT: three full-width nav pills (News / Options / Search)
   sat between the section label and its list, so the header described navigation and the real
   watchlist was pushed below the fold. Navigation is now ONE horizontal 3-up row above the
   sections; every section label again touches its own list.
3. FLAT SLAB: a dead-flat series (every trade at market price leaves total value unchanged) drew
   a centre line with a full-width gradient block beneath it — reads as a broken graphic, not as
   "flat". Fill is now suppressed when `delta.abs === 0`; flat gets the line alone. H 110 -> 96.

STILL NOT RIGHT (logged, not done): the portfolio card retains a tall void between the change line
and the plotted line, because `plot` centres a 96pt box around a flat line. Collapsing the plot
height when the series is flat would close it.

## Void closed + Key statistics (both DONE)

### The void
`plot` centred a 96pt box around a FLAT line, leaving ~45pt dead above and below — most of what
made the portfolio card read as filler. Flat/empty series now get `H_FLAT = 34`; a real curve
still earns the full 96. A curve deserves the height, a straight line does not.
MEASURED on device: "Cash available" y=465 -> y=367. **Card 98pt shorter**, and the whole tab
(portfolio, actions, positions, watchlist) now fits above the fold.

### Key statistics — the last 3/4 mechanism
`components/key-stats.tsx` + `?action=stats` on the market proxy.
Rows: Previous close · Open · Day's range · 52-week range · Volume · Avg volume · 1-year change.
Two Polygon calls because they answer different questions: `/prev` gives yesterday's real OHLCV
(day range, volume, previous close), and the 1y daily series gives the 52-week envelope and the
change. Every value is a REAL aggregate — nothing modelled.

Three deliberate choices:
- A row with a missing value is DROPPED, not rendered "—". A grid of dashes looks broken; a
  shorter grid just looks shorter.
- With no key the whole block RETURNS NULL and hides. Device-verified: `grep -ci "key statistics"`
  on AAPL returns 0 — no empty shell.
- Dividend yield NOT included though Bloom shows it: it needs a dividends endpoint we do not call,
  and "0.00%" on a stock that pays one is worse than absent.
`yearChangePct` is computed from the FIRST BAR RETURNED, not an assumed 365 days, so a recent
listing reports the window it actually has.

## REWARD LOOP — VERIFIED END TO END (finally)

Completed `investing-fundamentals:1` on device. Lesson completion -> "You earned 3 free stocks."
-> three face-down cards -> reveal one at a time -> "You earned $3.28 of stock."
Credits are EXACT:
| card | value | credited shares | check |
|---|---|---|---|
| MSFT | $1.48 | 0.0033217371787678147 | 1.48 / 445.55 |
| TSLA | $1.00 | 0.004098360655737705  | 1.00 / 244.00 |
| NVDA | $0.80 | 3.0006756756756756    | 3 bought + 0.80 / 1184 |
`rewardsEarned: 3.28`, `completedLessons` gained `investing-fundamentals:1`, xp 110.

## TWO SOFT-LOCKS FIXED ON THE WAY (both were blocking completion)

### 1. OrderSteps — last row under the CTA
6 two-line rows at 16pt padding + 12pt gaps ran ~620pt into ~620pt of space. Measured: row 6
top=717..bottom=796 vs Continue top=760 = **36pt overlap**, and the footer paints last so it ate
the taps. Padding the SCROLL CONTAINER could not help — it only adds room BELOW content.
FIX: density scales with item count (`spec.items.length >= 5` -> 10pt padding, 8pt gaps).
MEASURED AFTER: row 6 top=626..bottom=692 vs Continue top=760 = **+68pt clear**. 104pt swing.
Rows 79pt -> 66pt. Short steps keep the roomy treatment; only overflowing ones give anything up.

### 2. MultiSelect — TWO CTAs stacked, and this one was still live
MultiSelect ships its own "Check answer"; the footer rendered "Continue" on top of it.
Measured: Check top=738..bottom=782, Continue top=760..bottom=816 — **22pt, exactly HALF the
Check button**, under a control that paints after it. The step could not be submitted.
`lesson.tsx` ALREADY carried a comment describing this exact failure as fixed. It was not: the
earlier fix made the step SCROLL (fixing clipping), but two CTAs in the same place is a Z-ORDER
problem, not a scrolling one.
FIX: `ownsItsCta = norm?.kind === 'multi' && !solved` — the footer yields while the step owns its
own action, and returns once solved to carry the user forward.
VERIFIED: submitted, "Exactly — that's the full set."

## TOOLING FIXED: `sim.sh state` was silently returning null
AsyncStorage INLINES small values in manifest.json but SPILLS large ones to a file named md5(key),
leaving `null` inline. Once the store grew (positions, valueHistory, derivatives, pendingRewards,
watchlist) every `sim.sh state` call returned `null` for every field — which reads exactly like
"persistence is broken" and is not. Now falls back to the spill file. Without this fix every
future session loses the cheapest verification tool in the repo.

## The stacked-CTA fix, GENERALISED

`multi` was not the only step that owns its own validate control. `number-line` ships the same
trailing "Check your answer" and therefore the same collision — it had simply never been exercised.

Both render it as a **SpringPressable, not a GradientButton**, which is exactly why the bug stayed
invisible: grepping the step components for `GradientButton` returns 0 across all six, so the
collision looks impossible from the code. It is only visible by measuring frames on device.

Now `OWN_CTA_STEPS = new Set(['multi', 'line'])` and the footer yields for any member while
unsolved. Steps that only need "keep going" (reveal, order, match) keep the footer.
RULE: any future step that validates itself belongs in that set.

Audited all six gated kinds for a trailing control:
  multi -> "Check answer"        OWNS CTA  (fixed)
  line  -> "Check your answer"   OWNS CTA  (fixed, was latent)
  order, match, reveal, build -> no own control, footer is correct

## Movers + real logos (DONE) — Trade convergence set now COMPLETE

### Movers — `components/movers.tsx`, `?action=movers`
Investing.com runs "Daily Winners & Losers" with a toggle (2/4 of the set carry movers). Polygon
serves gainers and losers from one snapshot family. Placed BELOW holdings and watchlist on purpose:
what you own is why you opened the tab, the market is context. Investing.com leads with movers
because it is a market tracker; Euphoria is a portfolio you are learning to run.
Hides entirely with no key — an empty movers table implies a market where nothing moved, which is
never true and is a worse lie than silence. Device-verified: 0 occurrences without a key.

### Real logos — `components/ticker-logo.tsx`, `?action=logo`
Every reference app shows real marks: Bloom lists NVIDIA/Amazon/Microsoft with logos and puts the
Shopify bag on its reward card; Investing.com and TradingView do it in every watchlist row.
Four-letter text tiles are the tell that a trading screen was assembled rather than designed.

THE CONSTRAINT THAT SHAPED IT: Polygon's branding asset URLs require the API key APPENDED TO THE
IMAGE URL ITSELF, so the client cannot fetch them without shipping the key. The proxy fetches the
bytes and re-serves them with a 24h cache, so the app gets a plain cacheable URL and the key never
leaves the server.
Never renders broken or blank: the lettered badge draws FIRST and is never unmounted; the image
fades in over it only once decoded. No key, no logo for that ticker, dead network — the badge just
stays. A logo is an upgrade to something that already works.
Applied to Trade rows, Search results, and Movers.

### Known artifact, deliberately not "fixed"
`valueHistory` snapshots written BEFORE options were included in `portfolioValue` carry the old
formula, so the chart shows a historical dip that no longer reflects how value is computed. New
snapshots are correct. Rewriting stored history to match a later formula would be worse than the
artifact — it would make the chart a claim about the past that the past never made.
