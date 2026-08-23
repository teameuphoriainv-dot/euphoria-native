# WEB vs iOS — walkthrough, 2026-08-22
Captured live in Chrome, signed in as the owner. The web app is the design reference (§6.8).
**These are observations from screens I actually opened, not from the marketing page.**

## The apps are not the same shape

| | web (`euphoriainv.com/app`) | iOS |
|---|---|---|
| bottom nav | Home · Trade · **Games** · **Shop** · **Classes** | Home · Learn · Trade · Digest · **You** |
| home body | streak card, **Daily Challenge** (Day 234, countdown, +15 XP), course progress bar, **Duolingo-style serpentine level path** | greeting, week dots, trial banner, single course card, Today's Quests, Your Path |
| classroom | "In a class? Join Class" with teacher class codes | **does not exist** |
| currency | **Shop** tab | **does not exist** |
| digest | not in bottom nav | own tab |
| profile | hamburger menu | own tab |

### What this settles about the feedback

- **N12 "Games are buried — should be a bigger, more visible part of the app."**
  The web already does it: Games is a top-level tab. The fix is to match web, not to invent.
- **N21 "Add an in-app currency... like the web app has."**
  The web's **Shop** tab is where that currency is spent. Confirmed, not inferred.
- **N9 "Your Path feels crowded/redundant."**
  Web replaces it with ONE vertical path: current node + locked nodes. Much less to look at.
- **N11 "You tab is scope-confused — reads like Settings but holds Friends and Games."**
  Web has no You tab at all; profile lives in the hamburger and Games is promoted out. The
  cofounder is describing the web structure without naming it.

## Premium branding — CONFIRMED, not guessed
The signed-in web app shows a **"Go Pro. Unlimited lessons, all games, and Atlas coaching."**
banner with an **Upgrade** button rendered in the pink→orange ramp. This independently confirms
`premiumFrom #E0409B` / `premiumTo #F5842B` as the real Premium colourway rather than my reading
of a static screenshot.

## Buttons — CONFIRMED
The web onboarding modal's **"Show me around"** and the lesson's **"Warm up →"** are both solid
purple pills with a hard-cut darker slab and no glow. This is the same construction now shipped
as `SlabButton`. The reference screenshots in the prompt doc were not cherry-picked; it is the
system.

## THE LESSON RUNNER DIVERGES SHARPLY

Same lesson, `Investing Fundamentals` → `Introduction to Investing`:

| | web | iOS |
|---|---|---|
| step count | **1/10** | **27 steps · 30 XP** |
| listed duration | **"4 min · Beginner"** | not shown on the card |
| intro screen | phase badge (**"Warmup"**, flame), title, then a **learning objective**: "By the end of this lesson you will know what investing actually is, why time matters more than picking well, and what you are really being paid for when you take risk." | Atlas 132pt + speech bubble "Ready? Let's get into it.", then COURSE · LESSON, title, step count, "YOU'LL LEARN: Asset · Return · Inflation" |
| Atlas on intro | **absent** | dominant |
| structure | named phases (Warmup → …) | flat step counter |

**27 steps vs 10 for the same titled lesson is a content divergence, not a styling one**, and it
is the most likely explanation for **N5** ("the '$1,000 emergency expense' question shows up more
than once in the first personal finance lesson") — a longer generated iOS sequence has more room
to repeat itself. UNVERIFIED: I have not yet diffed the two step lists.

**N6** ("goal tracking measures the lesson's listed duration, not actual time"): the web surfaces
a listed duration ("4 min") on the lesson card. If iOS credits that number to the daily goal
instead of measuring real elapsed time, this is where the wrong number comes from.

## Not yet walked
Trade, Games, Shop, Classes, the wrong/right answer paths, lesson completion and reward.
Stopped here deliberately — the divergence above is large enough to need a decision before
more comparison is useful.

---
# WEB TABS WALKED 2026-08-23 — Games and Shop
Captured live, signed in. These two answer feedback items outright.

## Games — a 14-game library, not a feature
Header: **"Game Library · 14 interactive finance games"**, with search.
Gating banner: **"5 of 14 games available on Free"** with an Upgrade link.

FLAGSHIP GAMES seen:
| game | tag | note |
|---|---|---|
| Trading Duel | **Live Multiplayer** | "Create a room, share the code, and outtrade your friends on the same server-run market in a five minute round." Real-time rooms. |
| Trend Master | Featured | "Master 20+ real chart patterns from uptrends to head-and-shoulders." |
| Invest Life | Epic · **locked** | "Live an entire financial life from 18 to retirement and beyond." |
| Black Swan | Strategy · **locked** | "Navigate your economy through 10 rounds of unpredictable crises." |

**iOS has ONE game — `src/app/games/term-match.tsx`.**

This reframes **N12**. "Games are buried — only discoverable by clicking into Profile" is true, but
the deeper fact is that iOS has ~1 of the 14 games that exist on web. Surfacing the entry (done,
2026-08-23) makes the door visible; it does not put anything behind it. Games are also a PAID
surface on web (9 of 14 locked), so this is monetisation, not just engagement.

## Shop — the in-app currency, fully specified. This IS N21.
**"Euphorium Shop — Spend your coins on boosts and looks."** Balance shown top-right.

HOW TO EARN EUPHORIUM (four tiles, verbatim):
| action | award |
|---|---|
| Complete lessons | **+50–100** |
| Daily streaks | **+25** |
| Win games | **+10–50** |
| Daily challenges | **+30** |

Three catalogue tabs: **Power-Ups · Avatar Items · Profile**.
Items carry RARITY tags (Common / Uncommon / Rare / Epic) and two prices — a coin price and a
second lower number beside a padlock, which is very likely the Pro price.

Seen: "Double XP (1 Hour)" Uncommon **200** (190) · "Double XP (3 Hours)" Rare **450** (440).

**N21 said "a separate game-style currency (like the web app has)". This is it, named and priced.**
Do not invent a parallel economy for iOS — the award rates above are the spec, and iOS already has
the four earn events (lessons, streaks, games, daily quests) wired.

## Still not walked
Trade, Classes.
