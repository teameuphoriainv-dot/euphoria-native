# Getting karma fast on a fresh account, then promoting without getting banned

Deep version. Written 2026-09-03, grounded in what we measured today rather than generic advice.

---

## Part 1 — How karma actually works

**Comment karma and post karma are separate, and almost every gate checks comment karma.**
Post karma is easier to farm (one lucky image post can be thousands) but most automod rules read
comment karma specifically. Farming post karma in meme subs does not open finance subs.

**Karma is not 1:1 with upvotes.** Reddit applies diminishing returns above roughly 10 upvotes, so a
1,000-upvote comment does not grant 1,000 karma. This matters less than people think, because the
gates we care about are 10-50, and any decent comment clears that range quickly once it is *seen*.

**The formula that governs everything:**

> karma ≈ (people who open the thread) × (probability they read your comment) × (fraction who vote)

The middle term is the one you control, and it collapses fast with position. Top comment gets read by
most openers. Tenth gets read by almost nobody. **This is why position beats quality once quality is
adequate.**

---

## Part 2 — What we measured today

Five comments from a clean 1-karma account:

| Sub | Weekly | Result |
|---|--:|---|
| r/personalfinance | 2M | ✅ survived |
| r/stocks | 781K | ❌ removed, low comment karma |
| r/Money | 322K | ❌ removed, low comment karma |
| r/personalfinance (2nd) | 2M | ✅ survived |
| r/NoStupidQuestions | 9.3M | ✅ survived |

**Finding 1: the gate is by topic, not by size.** Finance and money subs gate because they are spam
magnets for crypto and investment scams. General-knowledge subs do not. The 9.3M sub let us in; the
322K money sub did not.

**Finding 2: AutoModerator tells you.** Removals appear in `reddit.com/notifications` with the
reason stated. This is the only reliable, immediate detection signal, and it is free. Check it after
every comment.

**Finding 3: karma did not move at all.** Five comments, karma still 1. Every comment sat at 1 view.
**Being un-gated is necessary but not sufficient — you also have to be seen.**

---

## Part 3 — The fastest legitimate karma, ranked

### Tier 1: Early comments on rising threads in huge ask-subs

The single highest-yield play available. Not "new posts" — posts that are **young and gaining**.

**How to find them:** sort `/new` in a large sub. Note the posts already at 20+ upvotes within an
hour when typical new posts sit at 1-3. That velocity gap means the post is about to hit the sub's
front page and pull thousands of readers. Get in before comment 10.

**Where:** r/NoStupidQuestions (9.3M) · r/explainlikeimfive (3.5M) · r/AskReddit · r/OutOfTheLoop ·
r/answers

**Realistic yield:** most attempts earn 1-5. One in ten catches a thread that takes off and earns
50-300 in a day. **The outliers are where essentially all the karma comes from.** This is why volume
of comments matters far less than volume of *attempts at good position*.

### Tier 2: Answering questions where you have genuine domain expertise

Lower ceiling, much higher hit rate. Money questions in general subs are the sweet spot for us,
because the competition is people guessing and we can state mechanisms.

**The pattern that works, proven twice today:** answer the question that was actually asked, not the
one everyone else answered. On the Cash App scam thread, the top comment described an overpayment
scam; the real mechanism was money-mule recruitment. On the Schwab rollover, everyone named a fund;
nobody noticed the money was at a different brokerage.

### Tier 3: Being genuinely useful in small topical subs

Slow karma, but it builds the thing karma alone cannot buy: **being a recognised participant in the
sub you eventually want to promote in.** See Part 5.

### ❌ Not worth it

- **Meme and image subs.** Fastest raw karma, wrong account profile. An account with 5,000 karma
  entirely from r/aww that suddenly posts about an investing app reads as bought. Topical coherence
  matters for the promotion phase even though karma itself is fungible.
- **r/FreeKarma4U and equivalents.** They do not ban you, they **mark** you. Accounts built there get
  shadowbanned the moment they post something real. We are already dealing with one shadowbanned
  account; this is not a risk worth any amount of speed.
- **Reposting known-viral content.** Detectable, and it is exactly what a bot farm does.

---

## Part 4 — Realistic timeline

| Target | Effort | What it opens |
|--:|---|---|
| 10-20 | 3-7 days, 5-10 comments/day | Most automod minimums, including r/stocks |
| 50 | 1-2 weeks | Comfortable in nearly every finance sub |
| **200-500** | **2-4 weeks** | **Account reads as an ordinary participant. This is the finish line.** |
| 1,000+ | 2+ months | No additional benefit for our purposes |

**One caught rising thread can compress weeks into a day.** Plan for the slow path, take the fast one
if it appears.

---

## Part 5 — The part nobody tells you: karma is not what lets you promote

This is the most important section.

**Karma clears automod. It does not clear the rules.** Almost every sub worth promoting in bans
self-promotion outright, at any karma level. 500 karma does not grant permission to post your app in
r/personalfinance. It never will.

**What actually determines whether promotion survives:**

1. **Which sub.** Promotion is allowed in the LAUNCH tier (r/SideProject, r/startups,
   r/alphaandbetausers) and nowhere else. See `REDDIT_SUB_TAXONOMY.md`. This is a rules question, not
   a karma question.
2. **Whether you are a known participant there.** A person who has been answering questions in a sub
   for a month and then mentions what they built is tolerated. A person who arrives with 500 karma
   from elsewhere and posts a link is not. **Reputation is sub-specific and does not transfer.**
3. **Whether someone asked.** The single safest promotion on Reddit is answering "does anyone know an
   app that does X" in a thread where that was the actual question. It is not promotion, it is an
   answer. This is worth more than any post.

**The old 9:1 guidance still holds directionally:** roughly nine genuinely useful contributions for
every one that mentions your thing. Not a rule Reddit enforces mechanically any more, but it
describes the profile that survives.

### The sequence, concretely

1. **Weeks 1-3.** Comment only, in ungated general subs. No mention of Euphoria, ever. Target 200+
   karma. Run the modmail health check weekly.
2. **Week 3+.** Start participating regularly in **two or three specific subs** you intend to
   promote in later. Same rule: no mention. You are building recognition, not karma, at this stage.
3. **First promotion:** one post to **r/SideProject**, where it is the native content type.
4. **Ongoing:** answer app-recommendation questions in CONVERTS-tier subs when they genuinely arise.
   That is the channel that produces installs.
5. **Never:** links in AUDIENCE subs. Not at 500 karma, not at 5,000.

---

## Part 6 — The daily routine

**20-30 minutes. 5-10 comments.**

1. Open `/new` in r/NoStupidQuestions, r/explainlikeimfive, r/personalfinance.
2. Filter for **under 30 minutes old, under 5 comments, answerable with something specific.**
3. Scan for the velocity gap: anything already at 20+ upvotes inside an hour is the priority target.
4. Answer the literal question. Lead with the mechanism. No hedging, no throat-clearing.
5. **Check notifications.** AutoMod removal means that sub is gated; note it and stop commenting
   there until karma is higher.
6. Weekly: `reddit.com/message/compose?to=r%2Ftest&subject=test&message=test`. If it fails to send,
   stop everything and diagnose a shadowban.
