# What we're doing wrong on Reddit

Written after 10 failed submissions, 3 successful comments, and one very expensive night.

## The single root cause

**The account was born promotional and has never been anything else.**

Look at its entire history from Reddit's side:

```
5 months ago   posted to r/povertyfinance: "free financial literacy platform built by..."
               (a promo post — the account's FIRST action)
2 months ago   one comment, four words: "OpenPeeps? Looks great!"
tonight        nine promotional link posts in under two hours
```

That is 1 karma and one real comment across five months, with promotion at both ends. No
automated system looks at that and sees a person. It sees a billboard that occasionally logs in.

Everything else we blamed was a symptom:

| What we blamed | Was it the cause? |
|---|---|
| The euphoriainv.com link | **No.** A comment carrying the link went live and stayed live. |
| Missing flair | **No.** A correctly-flaired post was removed; an unflaired comment survived. |
| Posting too fast | Contributing, but a single post hours apart was also removed. |
| Bad subreddit fit | **No.** A post with no link and no promotion, in a fresh sub, was still removed. |

## Three specific mistakes

### 1. We treated Reddit as a broadcast channel

The whole evening was spent trying to *announce* something. The transcript that started this — the
founder who went 0 to 17k MRR on Reddit — did the opposite. He **answered questions.** He was
useful in other people's threads until people asked what he was building.

Posts were never the channel. Comments were, and we spent nine attempts proving it the hard way.

### 2. We went to promo subs first, which are the most hostile

Counterintuitive but consistent with the data. r/startups_promotion and r/ShowMeYourApps exist for
promotion, which makes them spam magnets, which means their automod is *tuned hardest* against
low-karma accounts. Ordinary project subs (r/sideprojects, r/iOSProgramming) let posts through
further before the account-level filter caught them.

Promotion-friendly rules do not mean promotion-friendly filters.

### 3. We optimised the content when the account was the problem

Five different posts, all genuinely good, all rewritten to fit each sub's rules. Zero survived.
Meanwhile a comment written in three minutes is still up with a point on it. Effort was going into
the variable that did not matter.

## What is actually working

Three comments live, none removed:

- r/investingforbeginners — the IRA early-withdrawal education exception
- r/investingforbeginners — the "best investing app" megathread, **carrying the link**
- r/investingforbeginners — ATR-based stops and position sizing

All three answer a question with something specific and true. None of them announce anything.

## The rules going forward

1. **Never submit a post from this account until karma is real.** Ten for ten. It is not close.
2. **Comment only, and answer questions.** That is the entire channel.
3. **Never name another subreddit in a comment** — that is what tripped automod on the megathread,
   not our link.
4. **Expect ~1 comment per 7 minutes.** Server-side throttle on low-karma accounts. Roughly 8/hour
   is the ceiling, 3-5 is realistic. Use the gaps for X.
5. **r/explainlikeimfive and r/NoStupidQuestions are the karma engines** and they are full of money
   questions. Authentic, on-topic, and it builds exactly the reputation the eventual post needs.
6. **No free-karma subs.** They don't ban you, they mark you — and accounts built that way get
   shadowbanned the moment they post something real, which is the only thing we actually want.

## The honest timeline

Comment karma at a realistic pace is ~100/week. The submission filter starts easing somewhere
around 50+. So Reddit posts become viable in **one to two weeks of daily commenting**, not tonight,
and not by finding a better subreddit.

The good news is the comments themselves have value while that happens. The megathread comment is
in front of 103K weekly visitors right now, with the link in it, and nobody had to wait for karma
for that to be true.
