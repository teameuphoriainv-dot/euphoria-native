# The posting queue

> ## ⚠️ Half the posts are being filtered — the account is not blocked
>
> Verified 2026-09-02 on the profile page, then re-tested by posting again.
>
> | Post | Flair | Status |
> |---|---|---|
> | r/ShowYourApp | — | **Live** |
> | r/ShowMeYourApps | none | Removed by Reddit's filters |
> | r/startups_promotion | Startup Promotion | Removed by Reddit's filters |
> | r/sideprojects | Showcase: Free(mium) | **Live** |
>
> The account is **1 karma, 0 followers**. A fourth post went up after the two removals and
> **published fine**, which rules out an account-level or domain-level block — euphoriainv.com is
> not filtered, and posting still works.
>
> What separates the two groups is the subreddit, not the account: the two that died are small
> promo-focused subs that run aggressive automod against low-karma accounts. The two that lived
> are ordinary project subs.
>
> **What still applies:** post velocity is the thing to control. The two removals went up eight
> minutes apart. Space posts out, one per slot, and keep karma climbing so the strict subs stop
> filtering. See *Recovery* below.

Ready to post, in order — **after the account is unblocked**. Every post is built on the skeleton in
[REDDIT_ALGORITHM.md](REDDIT_ALGORITHM.md): value that stands alone, then the link, then a
question that starts a reply chain.

**One post per slot. 6–9am EST. Then stay in the comments for an hour.** That hour is worth more
than the next three posts.

Already live: r/ShowYourApp · r/ShowMeYourApps · r/startups_promotion.

---

## Why these posts lead with a number

Each one opens with something specific and true that came out of actually building Euphoria. That
is the part someone upvotes before they have any opinion about the product — and the upvote is
what buys the link a reader.

The link is one line, late, and never the point of the post.

---

## 1 · r/sideprojects (18K)

> **Nobody quit our app because it was too hard. They quit in week two.**
>
> I assumed people would drop off when the material got difficult. They didn't. The dropoff was
> almost exactly at day 12, and it had nothing to do with difficulty.
>
> Two changes fixed most of it. First, we made the daily goal embarrassingly small — ten minutes.
> Second, we stopped punishing missed days. The old streak counter reset to zero on a miss, and
> once someone lost a 12-day streak they never came back, because there was nothing left to
> protect. Now the counter just waits.
>
> The other thing that mattered was showing position, not praise. "Lesson 4 of 25" beat "well
> done" every time, because at week two the only question anyone has is whether this is going
> anywhere.
>
> It's an investing course app — [euphoriainv.com](https://euphoriainv.com), free with a paid tier
> for the full library. But the retention stuff wasn't specific to finance at all.
>
> Has anyone found a streak mechanic that survives a missed day? Ours still feels like a
> compromise.

## 2 · r/StartupSoloFounder (8.7K)

> **We shipped an app where the tutorial is the product**
>
> The usual advice is to get people to the "real" thing fast and keep onboarding short. We did the
> opposite, because for us the lessons *are* the thing — 300 of them across 12 courses.
>
> What surprised me was the second surface. There's a paper-trading desk that runs on live market
> prices and virtual cash, and I built it as a side feature to make the lessons concrete. It
> turned into the reason people come back, because reading about a stock going down and watching
> your fake $10,000 do it are not the same experience.
>
> The lesson I'd pass on: the feature you build to support the main one sometimes turns out to be
> the retention mechanic. We nearly cut it for scope.
>
> [euphoriainv.com](https://euphoriainv.com) if you want to see it. Free tier, paid tier for the
> full library.
>
> Anyone else had a supporting feature quietly become the main one?

## 3 · r/alphaandbetausers (8.7K)

> **Looking for beginners, specifically — people who find finance apps intimidating**
>
> Most people who try investing apps already know the vocabulary. The ones I want feedback from
> are the ones who bounced off, because that is who this is for.
>
> The specific thing I'd like tested: the first lesson. It opens with what inflation does to money
> in a savings account, and if that doesn't land in ninety seconds then nothing after it matters.
> Everything else in the app is downstream of whether that lesson works.
>
> There's also a practice portfolio with real market prices and fake money — no deposits, no
> withdrawals, no brokerage account anywhere in it.
>
> [euphoriainv.com](https://euphoriainv.com). Free to start, paid tier for the full 300 lessons.
>
> If you try it, the useful feedback is where you got bored, not where you got stuck. Stuck I can
> see in the data. Bored I can't.

## 4 · r/SideProject (309K) — save for last, biggest audience

Zero subreddit rules (`rules: []`, verified). Post this one when the account has some history.

> **The check that caught more bugs than every test I wrote on purpose**
>
> Our curriculum exists in two places — a web app and an iOS app — and they have to teach exactly
> the same thing. 73,000 lines across 12 courses. Keeping those identical by reviewing pull
> requests was never going to work.
>
> So the build hashes all 12 courses and compares them screen by screen against the web version.
> Any drift fails the build. It has caught more real problems than any test I sat down and wrote
> deliberately, and it took an afternoon.
>
> The general version: when you have two copies of something that must agree, don't test the
> behaviour, hash the content. It is cheaper and it does not have opinions.
>
> The app is [euphoriainv.com](https://euphoriainv.com) — investing lessons plus a paper-trading
> desk, free tier and a paid one.
>
> Curious whether anyone does this for translations, which seems like the same problem.

## 5 · r/iosapps (54K) — check their required format first

Their post format is strict and wrong-format posts are removed, not corrected.

> **Euphoria — 300 investing lessons and a paper-trading desk (iOS, free tier)**
>
> An investing-education app for people who are not already investors. 12 courses, 300 lessons,
> and a simulator that uses live market data with virtual cash — no deposits or withdrawals
> anywhere in it, so there is no mechanism by which anyone can lose money using it.
>
> There's an AI coach that explains any figure in a lesson when you tap it. It answers conceptual
> questions only and refuses to tell you what to buy — that's enforced server-side, not by
> prompting.
>
> Free to use, paid tier for the full library. iOS 16+. [euphoriainv.com](https://euphoriainv.com)
>
> Feedback I'd most like: the first lesson. That's where people decide whether an app like this is
> worth their time.

---

## The hour after each post

This is the part that actually determines whether the post gets traffic.

1. **Reply to every comment within minutes.** Comment velocity is a ranking input and nested reply
   chains count for more than single replies.
2. **End replies with something answerable.** A reply that closes the loop ends the chain.
3. **Never get defensive.** Ratio matters more than winning. Downvotes hurt disproportionately at
   low vote counts.
4. **If it's flat after an hour, leave it.** Do not delete and repost.

## Recovery — how the account gets unblocked

Reddit's spam filter weights account age, karma and posting velocity. At 1 karma and zero
comment history, a link post from a brand-name account is close to the filter's definition of
spam, and the filter is right to think so — we have contributed nothing.

The fix is to stop being that account. In order:

1. **Comment only. No posts, for at least a week.** Real answers in the finance and app subs,
   from the [12 thread answers](REDDIT_CONTENT.md) already written. No link, no product mention
   unless someone asks directly.
2. **Get past ~50 comment karma.** That is roughly where filtered submissions stop being
   automatic. It is a floor, not a target.
3. **Then one post a week**, at 6–9am EST, with an hour in the comments after. Never two in a day
   again — that pattern is what tripped this.

**Message the mods of the two filtered subs.** A filter removal is often reversible by a mod who
sees a real post behind it, and asking is normal and permitted. Do it once per sub, politely, and
accept the answer.

**Do not** delete and repost, make a second account to get around it, or shorten the URL to dodge
the filter. All three escalate the problem from "this account is filtered" to "this domain is
filtered", which is the outcome that actually matters.

## Still unresolved

- The account is **u/Big_Drink7656**. Display name is "euphoriateam" but the handle is what shows
  in most contexts. Cannot be changed — only replaced.
- Whether euphoriainv.com lets someone look around without an account. Post 3 would be stronger if
  it does. **Do not claim it until confirmed.**
