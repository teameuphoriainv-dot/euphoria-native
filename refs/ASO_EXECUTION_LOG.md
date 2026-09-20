# ASO execution log — app 6761808087

Executed 2026-09-14 against App Store Connect via the API. Every id below was read back from the
API after writing. Account contains exactly one app (`6761808087`, `com.euphoriainv.euphoria`),
confirmed by `GET /v1/apps`.

**The live 1.0 listing was not modified.** Re-read at the end of the run and confirmed byte-identical
to the values recorded in the baseline section.

---

## 1. Baseline (restore points)

Saved before any write, so anything here can be put back.

| Field | Live value on 1.0 |
|---|---|
| App name | `Euphoria: Learn to Invest` |
| Subtitle (en-US) | `Personal Finance for Beginners` |
| Keywords (en-US) | `money,stock,trading,simulator,paper,practice,budget,portfolio,market,ai,teen,student,literacy,etf` |
| Promotional text | `Money, finally explained. 300 lessons, a real-data trading simulator, and Atlas, your AI coach who explains every move. Virtual cash, zero risk. Start free.` |
| marketingUrl / supportUrl | `https://euphoriainv.com` |

Live ids: version `49747f8f-928d-4902-8b7c-ab2850b9f726`, en-US localization
`8a6e7ef2-66db-4ca9-97f1-4440715a6782`, appInfo `3e709821-495d-4cc4-80e3-890494c38c15`
(en-US appInfoLocalization `dab6ba40-d179-448b-8710-df2156708606`).

Before the run: 0 in-app events, 0 custom product pages, 1 appInfo, 1 version.

---

## 2. Source verification (done before any metadata was written)

| Claim | Verdict | Evidence |
|---|---|---|
| 300 lessons | **TRUE** | 12 course files in `src/lib/curriculum/courses/`, 300 lesson objects total. 11 files use the `L(n, …)` constructor, `corporateFinance.ts` uses 20 `L()` calls plus 5 literal `{ num: 1..5 }` objects. Matches `totalLessons: 25` × 12 in `courseIndex.ts`. |
| Twelve full courses | **TRUE** | 12 files; all 12 ids present in the `AVAILABLE_IDS` allowlist in `src/lib/curriculum/availability.ts`. |
| Money 2048, Trend Master, Term Match | **TRUE** (understated) | `src/app/games/money-2048.tsx`, `trend-master.tsx`, `term-match.tsx`. A fourth game, `budget-balancer.tsx`, ships but is not named in the listing. |
| Real market data | **TRUE** | `src/lib/market.ts` is a Polygon client via the `api/market+api.ts` server route; the key is server-side. The file's contract is that a missing key returns `null`, never a fabricated number. |
| Atlas AI guide | **TRUE** | `src/lib/atlas-chat.ts`, `src/lib/atlas-lesson-context.ts`. |
| Rated 12+ | **TRUE** | `appStoreAgeRating: TWELVE_PLUS` on the appInfo. |
| App has no i18n | **TRUE** | No `locales` key in `app.json`; zero `getLocales` calls in `src/`. The `expo-localization` plugin is listed in `app.json` but nothing in `src/` imports it. English-only metadata is the correct call. |
| "a weekly league **against other learners**" | **FALSE — see §5** | `src/lib/people.ts` header: "EVERY PERSON IN THIS FILE IS FABRICATED… Nothing user-facing may present them as real people." `src/app/league.tsx:150` renders "A practice league. Real rivals arrive when accounts do." |
| Plan keywords `isa`, `tfsa`, `super`, `asx` | **UNSUPPORTED — see §5** | 0 occurrences of ISA, TFSA, superannuation or ASX anywhere in the 12 course files. 711 occurrences of "Roth", 648 of "401". The corpus is entirely US-centric. |
| "$9.99/month, $79.99/year" outside the US | **FALSE for CA and AU — see §5** | Prices are localized, read from `/v1/subscriptions/*/prices`. |

### Current subscription prices (from the API, `preserved=false` rows, active since 2026-08-23)

| Territory | Monthly | Yearly | Yearly per month |
|---|---|---|---|
| USA | $9.99 | $79.99 | $6.67 |
| GBR | £9.99 | £79.99 | £6.67 |
| CAN | CA$12.99 | CA$99.99 | CA$8.33 |
| AUS | A$14.99 | A$129.99 | A$10.83 |

---

## 3. What was created

### In-app event (no new binary needed)

- **appEvent `6811942319`** — reference name `Weekly XP Challenge`, badge `CHALLENGE`,
  purchaseRequirement `NO_COST_ASSOCIATED`, priority `HIGH`,
  purpose `APPROPRIATE_FOR_ALL_USERS`, primaryLocale `en-US`. State: **DRAFT**.
- **appEventLocalization `bb8bd79b-6885-46c5-b3bd-7905f28f3cf7`** (en-US):
  - name (19): `Weekly XP Challenge`
  - short (41): `Clear 600 XP this week for the top bonus.`
  - long (241): `Every Monday your weekly XP resets to zero. Earn 250 XP for a Steady week or 600 XP for a Strong week, then claim your Euphorium coins when the week closes. Lessons, guides and games all count toward the target. Free to join, nothing to buy.`
- **Territory schedule set** (USA, GBR, CAN, AUS): publishStart `2026-09-22`,
  eventStart `2026-09-28`, eventEnd `2026-10-26`. **These dates are a placeholder I chose — change
  them if the submission timing moves.**

Every number in the copy is from `src/lib/league-week.ts`: `WEEK_TARGETS` = Strong 600 XP / 150
coins, Steady 250 XP / 50 coins, Quiet 0. Monday reset is `weekStart` in `src/lib/store.ts:222`.

### Version 1.0.1

- **appStoreVersion `0fc4a0e4-6a1b-40c4-b7e0-c309d6096ef1`**, platform IOS, versionString `1.0.1`,
  state **PREPARE_FOR_SUBMISSION**. **No build attached** (confirmed: `GET .../build` returns none).
  **Not submitted.**
- A second, editable **appInfo `703979f3-75cb-45d5-b43f-3fda8b77f780`** appeared automatically when
  the version was created. That is where the subtitles live.

| Locale | versionLocalization id | keywords | subtitle | appInfoLocalization id |
|---|---|---|---|---|
| en-US | `27a5cfa1-292a-46f3-8c66-c466e4141453` | 100/100 | `Personal Finance for Beginners` (30) | `59eee661-5e53-4ddd-9f0a-097ad7618480` |
| en-GB | `17f46457-eb5d-468d-89d0-096e12721d66` | 98/100 | `Investing & Money for Teens` (27) | `c9a06696-7478-4e99-b10e-ba92c334e3d5` |
| en-CA | `5ea2cd6d-ce81-46ae-8538-470bc94bce71` | 100/100 | `Personal Finance for Beginners` (30) | `e760dfb5-3347-4552-8f41-177b285e9963` |
| en-AU | `e0185e27-5c43-4291-9064-42c73806765b` | 98/100 | `Investing & Money for Teens` (27) | `9e4785ee-f15f-427e-a573-2685cdc68fb3` |

Keyword strings as set:

```
en-US  stock,market,trading,simulator,paper,money,portfolio,budget,ai,teen,student,literacy,etf,game,course
en-GB  shares,stock,market,trading,simulator,money,portfolio,budget,ai,teen,student,index,etf,game,course
en-CA  stock,market,trading,simulator,paper,money,portfolio,budget,ai,teen,student,literacy,etf,game,course
en-AU  shares,index,market,trading,simulator,money,portfolio,budget,ai,teen,student,bonds,etf,game,course
```

Descriptions for the three new locales were derived programmatically from the en-US text (read from
the API, not retyped) with exactly three changes:

1. Locale-correct subscription prices (table in §2).
2. The false league clause replaced with `A daily streak, XP, levels and a weekly XP target in a practice league.`
3. en-CA only: `turn the maths into games` → `turn the math into games`.

Creating each appStoreVersionLocalization auto-created a matching appInfoLocalization seeded with
the en-US subtitle; the en-GB and en-AU subtitles were then PATCHed and read back.

---

## 4. What failed

### Custom product page — BLOCKED by a contradiction in the API

`POST /v1/appCustomProductPages` cannot be satisfied. Five request shapes were tried.

With `name` + `app` only (and with an empty `appCustomProductPageVersions` array):

```
409 ENTITY_ERROR.RELATIONSHIP.REQUIRED
You must provide a value for the relationship 'appCustomProductPageVersions' with this request
409 ENTITY_ERROR.RELATIONSHIP.REQUIRED
You must provide a value for the relationship 'appCustomProductPageLocalizations' with this request
```

But supplying `appCustomProductPageLocalizations` is rejected outright:

```
409 ENTITY_ERROR.RELATIONSHIP.UNKNOWN
'appCustomProductPageLocalizations' is not a relationship on the resource 'appCustomProductPages'
```

And JSON:API local-id references, the documented way to create the nested version in the same call,
are rejected in both array and object form:

```
422 ENTITY_UNPROCESSABLE
Unexpected or invalid value at 'data.relationships.appCustomProductPageVersions.data.[0].lid'.
422 ENTITY_UNPROCESSABLE
Unexpected or invalid value at 'data.relationships.appCustomProductPageVersions.data.lid'.
```

Also noted: `visible` is rejected on create (`ENTITY_ERROR.ATTRIBUTE.NOT_ALLOWED`).

The API demands a relationship it simultaneously refuses to accept. **Custom product pages must be
created in the ASC web UI.** Nothing was left behind by the failed attempts — the page count is
still 0.

### In-app event card art — blocked by a missing asset, not by the API

The screenshot endpoint works
(`GET /v1/appEventLocalizations/bb8bd79b-…/appEventScreenshots` → 200, count 0). The blocker is that
event card art must be **1920 × 1080** and no asset at that size exists in the repo:
`refs/store/*.png` are 1290×2796 (phone portrait), `refs/store/store-sheet.png` is 2660×780, and
`refs/brand/euphoria-mark-1024.png` is 1024×1024. Someone has to produce the card.

---

## 5. Findings that need a decision

### 5.1 The live listing contains a false claim

Live en-US description, verbatim:

> A daily streak, XP, levels and **a weekly league against other learners**. Your streak, XP and
> league place are free forever and never expire.

There are no other learners. `src/lib/people.ts` opens with "⚠️ EVERY PERSON IN THIS FILE IS
FABRICATED. They are not read from the account backend and they are not real users… Nothing
user-facing may present them as real people." The app itself complies: `src/app/league.tsx:150`
renders "A practice league. Real rivals arrive when accounts do."

So the App Store listing asserts something the app explicitly denies on screen. That is a
Guideline 2.3.1 accuracy problem, and it is the kind of thing a reviewer can see in one tap because
the contradiction is on the league screen.

**This was left in place on the live 1.0 listing and on the 1.0.1 en-US description**, because the
en-US scope I was given was keywords only. It is corrected in en-GB, en-CA and en-AU. Fixing en-US
is a one-field edit; suggested replacement, already used in the other three locales:

> A daily streak, XP, levels and a weekly XP target in a practice league.

### 5.2 Four planned keywords describe things the app does not teach

`ASO_MAX_PLAN.md` proposed `isa` (en-GB), `tfsa` (en-CA), `super` and `asx` (en-AU). Across all 12
course files: **ISA 0, TFSA 0, superannuation 0, ASX 0** — against 711 mentions of Roth and 648 of
401(k). The curriculum is US-centric with no local tax-wrapper content at all.

Ranking for "ISA" in the UK store on an app that never says the word draws users who bounce
immediately, and invites the exact one-star reviews the plan's own es-MX section correctly refused
to risk on an app with 0 ratings. This is the hard boundary "never invent a feature to win a
keyword", so I substituted verified terms:

| Locale | Planned | Used instead | Why the replacement is safe |
|---|---|---|---|
| en-GB | `isa` | `index` | "How stocks, ETFs and index funds actually work" is in the live description |
| en-CA | `tfsa` | `literacy` (kept the en-US term) | already live |
| en-AU | `super`, `asx` | `bonds`, `index` | "stocks, bonds, ETFs" in the description and Investing Fundamentals |

`shares` was kept for en-GB and en-AU: it is the standard British/Australian word for stocks, which
the app genuinely teaches, so it is a translation rather than a new claim.

**If you want the planned strings anyway, they are in `ASO_MAX_PLAN.md` and it is one PATCH per
locale.** My recommendation is to leave them out until the corpus has local content.

### 5.3 The plan overstates the gain from extra locales

`ASO_MAX_PLAN.md` says adding three English locales "roughly quadruples" the indexed token surface.
It does not. A storefront with no localization already falls back to the en-US metadata and indexes
those keywords there, so adding an en-GB localization **replaces** what the UK store indexes rather
than adding to it. None of it affects the US storefront.

The real gain is narrower and still worth having: per-storefront wording (`shares` instead of
`stock`) and correct local pricing in the description. It is not a 4x.

It also has a cost, which is 5.4.

### 5.4 The three new locales have no screenshots, and that blocks submission

Screenshots attach per localization. On 1.0.1:

- en-US: 1 set (`9f6116ec-6028-44d1-8afd-7414eb7bea30`, `APP_IPHONE_67`, 6 shots, all COMPLETE)
- en-GB, en-CA, en-AU: **0 sets**

1.0.1 cannot be submitted until each new locale has its own screenshot set. The source images exist
(`refs/store/store-1.png`…`store-7.png`, 1290×2796, which is the 6.7" size), so this is 6 uploads
per locale, 18 total. It can be done through the API or by duplicating in the web UI.

**This is the decision point on whether the three locales are worth shipping in 1.0.1 at all.** If
the answer is no, delete the three version localizations and the version still submits with en-US.

### 5.5 Subtitle and keyword overlap in en-GB and en-AU

The subtitle `Investing & Money for Teens` contains "Money" and "Teens", and those locales'
keyword fields also contain `money` and `teen`. Apple indexes the subtitle, so roughly 10
characters of a 100-character field are being spent on words that already rank. Dropping both and
adding two new verified terms (for example `compound`, `crypto`, `saving`, `valuation`) would be a
free gain. Left as planned because the subtitles were specified; flagged as a cheap follow-up.

### 5.6 "maths" in the en-US description

The live en-US description says "turn the **maths** into games". That is British spelling in the US
listing. Corrected in en-CA; left as-is in en-US and (correctly) kept in en-GB and en-AU. Cosmetic.

---

## 6. Promotional text — verified and deliberately left alone

Current value is 156/170 and every claim in it checks out: 300 lessons (counted), real-data
simulator (Polygon), Atlas (exists), virtual cash / zero risk (no brokerage anywhere in the app),
start free (streak, XP and league place are free forever; 3-day trial for Pro).

Promotional text is not indexed for search, so there is no keyword reason to touch it, and nothing
in it is inaccurate. Changed nothing. It remains the only listing field that can be edited on the
live version with no review, so it stays available as a lever.

---

# Round 2 — 2026-09-14

Screenshots, the en-US league fix, and the §5.5 keyword overlap. Live 1.0 still untouched
(re-read at the end: keywords unchanged, and it still carries the original league clause).

## 7. Screenshots — the repo copies were the wrong images

The instruction was to upload `refs/store/store-1.png`…`store-6.png`. **Those are not the images
that are live on the App Store**, so uploading them would have made the three new locales tell a
different story from en-US rather than the same one.

Checked by comparing against the en-US set `9f6116ec-6028-44d1-8afd-7414eb7bea30`:

| | live en-US | `refs/store/store-*.png` |
|---|---|---|
| Dimensions | **1320 × 2868** | 1290 × 2796 |
| Count | 6 | 7 |
| File sizes | 506754, 913316, 674697, 598020, 525030, 621282 | 730052, 788714, 390710, 689579, 922314, 1117817, 613979 |

Not one MD5 or byte size matches. Two other candidate sources were also ruled out:
`docs/media/01-intro.png`… carry the right filenames but are 420 × 912 web copies, and
`goldie/manual-raw/*.png` are the pre-composition raws. The exact uploaded bytes are not committed
anywhere in the repo — `goldie/` composes them and the output was never checked in.

**What I did instead:** downloaded the six live en-US screenshots from their
`imageAsset.templateUrl` at native 1320 × 2868 and uploaded those. All four locales now serve
genuinely identical artwork, confirmed by identical MD5s:

| File | MD5 (same in en-GB, en-CA, en-AU) |
|---|---|
| 01-intro.png | `4d1eb918b08f08dfffda35f9006a6ab9` |
| 02-explain.png | `381540e49a51dc08624f96af56a883c2` |
| 03-path.png | `21f2f3cc1a02f63771b2a5dca78b4eb8` |
| 04-home.png | `c06977abd8dd9b89fe1984da90ddd2c6` |
| 05-paper-trade.png | `5f8fc04e6bf5c4a605dd88fe3dab156c` |
| 06-atlas.png | `1a785e45a713afb3835e53facd25e374` |

New `APP_IPHONE_67` sets: en-GB `239518bd-d379-4f5e-8983-a80c57258373`,
en-CA `1d91d688-0ba9-45a6-a303-f2ecc35af589`, en-AU `ec9114d2-7ab9-4252-941f-744c1b01cffa`.

18 of 18 read back as `assetDeliveryState.state = COMPLETE`, with no errors. En-US keeps its
original 6.

> Worth deciding separately: `refs/store/store-1.png`…`store-7.png` is a 7-image set at the older
> 1290 × 2796 size that matches nothing on the store. Either it is a superseded draft that should be
> deleted, or it is a newer set that was never shipped.

## 8. en-US league clause — fixed on 1.0.1

Before (en-US, 1.0.1, 3613 chars):

> KEEP THE STREAK
> A daily streak, XP, levels and **a weekly league against other learners**. Your streak, XP and league place are free forever and never expire.

After (3614 chars):

> KEEP THE STREAK
> A daily streak, XP, levels and **a weekly XP target in a practice league**. Your streak, XP and league place are free forever and never expire.

The following sentence was left intact. en-GB, en-CA and en-AU were checked and already carried the
honest wording from round 1, so no change was needed there.

**The live 1.0 listing still contains the false claim.** It only goes away when 1.0.1 ships.

## 9. Keyword overlap removed (the §5.5 gain)

`money` and `teen` were dropped from en-GB and en-AU because the subtitle
`Investing & Money for Teens` already indexes both. The freed characters went to `compound` and
`tax`, both verified in the corpus before use (`compound` 855 occurrences, `tax` 3105 across the 12
course files). Other candidates were counted and are available if these need swapping: `saving`
1196, `options` 1533, `inflation` 767, `retirement` 651, `valuation` 619, `dividend` 378, `crypto`
270, `budgeting` 125.

| Locale | Before | After |
|---|---|---|
| en-GB | 98/100 | **100/100** `shares,stock,market,trading,simulator,portfolio,budget,ai,student,index,etf,game,course,compound,tax` |
| en-AU | 98/100 | **100/100** `shares,index,market,trading,simulator,portfolio,budget,ai,student,bonds,etf,game,course,compound,tax` |

en-US and en-CA were not touched — their subtitle is `Personal Finance for Beginners`, which
overlaps none of their keywords.

## 10. State of 1.0.1 after round 2

All four locales verified by read-back: **100/100 keywords, 6 screenshots all COMPLETE, no false
league clause**.

| Locale | Keywords | Subtitle | Screenshots | Description |
|---|---|---|---|---|
| en-US | 100/100 | Personal Finance for Beginners (30) | 6 COMPLETE | 3614 |
| en-GB | 100/100 | Investing & Money for Teens (27) | 6 COMPLETE | 3614 |
| en-CA | 100/100 | Personal Finance for Beginners (30) | 6 COMPLETE | 3620 |
| en-AU | 100/100 | Investing & Money for Teens (27) | 6 COMPLETE | 3620 |

Version state **PREPARE_FOR_SUBMISSION**, **no build attached**, **not submitted**.

Still outstanding for a human: 1920 × 1080 event card art (§4), the custom product page in the web
UI (§4), event date confirmation (§3), and attaching the paywall-fix build.
