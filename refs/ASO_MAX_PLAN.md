# ASO — maximum-reach plan for app 6761808087

> ## SUPERSEDED IN PART, 2026-09-14. READ THIS BOX FIRST.
>
> This file is a PLAN. It was executed, and execution changed four of its recommendations. Where
> this box and the sections below disagree, this box is right, and the live state of record is
> `refs/ASO_KEYWORDS.json`, which `scripts/aso-keyword-truth.mjs` checks against App Store Connect.
>
> 1. **`isa`, `tfsa`, `super` and `asx` were REJECTED and never shipped.** The plan recommends them
>    below. They measure 0, 0, 28 and 0 whole-word occurrences in the twelve course files, and all
>    28 hits for `super` are "Super Bowl" or "super-priority" in a bankruptcy lesson. Ranking for a
>    word the app never says is a Guideline 2.3.7 problem and draws users who bounce. The rule is
>    now mechanical: a keyword that is not evidenced fails `npm run check`.
> 2. **The en-GB and en-AU keyword fields below are out of date.** Round 2 dropped `money` and
>    `teen` from both, because the subtitle `Investing & Money for Teens` already indexes them, and
>    spent the freed characters on `compound` (621) and `tax` (5,485). Both fields are now 100/100.
> 3. **"Roughly quadruples the indexed token surface" is wrong.** A storefront with no localization
>    already falls back to en-US metadata and indexes those keywords there, so adding en-GB
>    REPLACES what the UK store indexes rather than adding to it. The real gain is narrower and
>    still worth having: per-storefront wording and correct local pricing in the description.
> 4. **"The app already has a genuine recurring event: the weekly league" needs care.** The league
>    standings are fabricated (`src/lib/people.ts`) and the app itself says so on screen
>    (`src/app/league.tsx:150`, "A practice league. Real rivals arrive when accounts do."). The
>    in-app event that was actually created is the **Weekly XP Challenge**, which is about the XP
>    target in `src/lib/league-week.ts` and claims nothing about other people. Do not write event or
>    listing copy that implies real rivals.
>
> Current live and staged state is in `refs/ASO_EXECUTION_LOG.md`. What follows is the original
> plan, left intact because its reasoning about levers is still useful.

Live listing read from the App Store Connect API on 2026-09-14. Every count below is computed,
not estimated. App is `Euphoria: Learn to Invest`, v1.0, READY_FOR_SALE since 2026-09-12,
0 ratings, Education primary / Finance secondary, free with IAP.

## What is actually limiting reach right now

| Lever | Live state | Ceiling |
|---|---|---|
| Localizations | ~~en-US only~~ **4 staged on 1.0.1** | Each extra locale = its own 100-char keyword field + 30-char subtitle |
| In-app events | **0** | 5 active, indexed in App Store Search, reviewed WITHOUT a new binary |
| Custom product pages | **0** | 35, each with its own screenshots + promo text |
| App Preview video | **none** | 3 per locale; the single biggest conversion lever on the page |
| Keyword field | 97/100 live, **100/100 staged in all 4 locales** | 100/100 |
| Screenshot sets | 1 (APP_IPHONE_67) | +APP_IPAD_PRO_3GEN_129 if iPad is supported |
| Ratings prompt | 0 ratings after 2 days | Rating count is a ranking input; nothing is asking |

Indexed token surface today is 20 tokens: euphoria, learn, invest, personal, finance,
beginners + the 14 keywords. Adding three English locales roughly quadruples it.

## Field-by-field

### App Name — 25/30, KEEP
```
Euphoria: Learn to Invest
```
Brand first, then the phrase to rank for. The 5 spare characters have no high-value word that
fits, and the name is the field with the most ranking history to lose.

### Subtitle en-US — 30/30, KEEP
```
Personal Finance for Beginners
```
Already maxed and already carrying three tokens the name does not.

### Keywords en-US — 97 -> 100/100
```
stock,market,trading,simulator,paper,money,portfolio,budget,ai,teen,student,literacy,etf,game,course
```
Changed from live: dropped `practice`, added `game` and `course`.
Both additions are truthful — the app ships Money 2048, Trend Master and Term Match, and twelve
named courses. `practice` is the weakest term in the live set and the description carries it anyway.
No word repeats the name or subtitle. No spaces after commas.

### Added locales — the single biggest lever, all English, zero accuracy risk
The app has **no i18n** (no `locales` key, no translation files, no `getLocales` call), so the
listing language must stay English. These three storefronts are English and get their own fields.

en-GB — subtitle 27/30, keywords 96/100 — **NOT WHAT SHIPPED, see the box at the top**
```
Investing & Money for Teens
```
```
shares,stock,market,trading,simulator,money,portfolio,budget,ai,teen,student,isa,etf,game,course
```
Actually staged, 100/100, with `isa` refused and the subtitle overlap removed:
```
shares,stock,market,trading,simulator,portfolio,budget,ai,student,index,etf,game,course,compound,tax
```

en-CA — subtitle 30/30, keywords 96/100 — **NOT WHAT SHIPPED, see the box at the top**
```
Personal Finance for Beginners
```
```
stock,market,trading,simulator,paper,money,portfolio,budget,ai,teen,student,tfsa,etf,game,course
```
Actually staged, 100/100, with `tfsa` refused and `literacy` kept in its place:
```
stock,market,trading,simulator,paper,money,portfolio,budget,ai,teen,student,literacy,etf,game,course
```

en-AU — subtitle 27/30, keywords 96/100 — **NOT WHAT SHIPPED, see the box at the top**
```
Investing & Money for Teens
```
```
shares,asx,market,trading,simulator,money,portfolio,budget,ai,teen,student,super,etf,game,course
```
Actually staged, 100/100, with `asx` and `super` refused and the subtitle overlap removed:
```
shares,index,market,trading,simulator,portfolio,budget,ai,student,bonds,etf,game,course,compound,tax
```
~~`isa`, `tfsa`, `super` and `asx` are the local tax-wrapper and exchange terms people actually
search in those storefronts, and are worthless in en-US.~~

**REFUSED.** They are the terms people search, and the app does not contain any of them. Measured
whole-word across the twelve course files: `isa` 0, `tfsa` 0, `asx` 0, `super` 28 and every one of
those 28 is a Super Bowl advertising lesson or bankruptcy "super-priority". Against `roth` 708 and
`401` 582, the corpus is entirely US-centric. Revisit when there is local content to rank for, not
before. Enforced by `scripts/aso-keyword-truth.mjs`.

### NOT recommended: es-MX
Adding Spanish metadata would add a second fully indexed keyword field **inside the US storefront**,
which is the largest single gain available. It is rejected here because the app is English-only,
so Spanish-language metadata misrepresents the product under Guideline 2.3.7 and invites
one-star "no está en español" reviews on an app that currently has zero ratings to absorb them.
Revisit the moment the app ships Spanish strings.

## What can land WITHOUT a new version

1. **In-app events** — indexed in search, reviewed on their own. One exists as a DRAFT: the
   **Weekly XP Challenge**, built on the real XP targets in `src/lib/league-week.ts`. It is
   deliberately not called a league against other people: the standings are fabricated and the app
   says so on screen. A second event fits each new course drop.
2. **Custom product pages** — own review, own screenshots, own promo text; the right landing page
   for any paid or social traffic.
3. **Promotional text** — the only listing field editable on a live version with no review at all.

## What requires version 1.0.1
Name, subtitle, keywords, description, the three new locales, screenshots, App Preview video.
That is the same submission the paywall fix needs, so they should ride together.
