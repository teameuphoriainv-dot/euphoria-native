# Carryover prompt — Euphoria social marketing

Paste everything below into a fresh session. Self-contained. Covers only the Reddit/X marketing
work, nothing else about the app.

---

## Context

You are running social marketing for **Euphoria** (euphoriainv.com) — an investing education app.
300 lessons across 12 courses, from what inflation does to idle cash through to wealth management,
plus a paper-trading desk on live market prices with fake money. No deposits, no withdrawals, no
brokerage account. Free tier, paid tier for the full library. iOS build is in App Store review.
Founder is 16. Repo at ~/euphoria-native.

**Two accounts, both already logged in via the Chrome MCP:**

| | Handle | State |
|---|---|---|
| Reddit (brand) | `u/Big_Drink7656` (display "euphoriateam") | 1 karma, 5 months old, submissions filtered |
| X (founder) | `@sidd_k28` | 9 followers, 92 posts, real finance content |

Use `mcp__claude-in-chrome__*` tools. Call `tabs_context_mcp` first for live tab IDs.

---

## The playbook this is based on

Transcript of Starter Story interviewing Diego, who took AppAlchemy from 0 to **$17K MRR in
4 months, purely on Reddit, with under 100 X followers and $0 marketing spend.** 1M+ impressions,
20K signups, 1K+ paying customers.

### His five steps, verbatim in substance

**1. Become an active Reddit user first.**
> "If you're not using Reddit already, start using it daily. This has two different purposes. The
> first one is becoming familiar with the platform and seeing what kind of posts do well. The
> second one is **warming up your account, because any posts that come from a newly created
> account will be automatically filtered out by Reddit.**"

**2. Build a large list of subreddits.**
> "You need volume for this to work. The more the better, and you can go broad and narrow."

His method: open Reddit Ads, create a campaign, go to the targeting section, search a keyword
related to your product, and harvest the community recommendations. **You never pay for ads** —
you are only using the targeting tool as a subreddit discovery engine.

**3. Write a killer organic post.**
> "The reason that most people fail on Reddit is that their posts don't feel natural. They feel
> very pushy and they make it completely around their own product. What you want to do instead is
> **provide a little bit of value in your niche and then you can link your product in the middle
> of the post.**"

Structure of every post that worked for him:
- catchy, attention-grabbing headline — **never** announcing a product or a launch
- genuine value in the niche first (his best performer was a case study of another app)
- product plugged **after** the value, linked directly rather than just named
> "If you link your product directly, you're going to get a lot more traffic to your website
> instead of just mentioning it."

For subreddits that forbid direct links:
> "I would recommend linking an extra product beside yours. Plug a complementary product... that
> way your chances of getting banned or your post being removed for self-advertisement is a lot
> lower."

What not to do, in his words: plug the product in the headline, open with the product, list all
the features, link your Discord. Those posts get no engagement, "because people don't care. They
want to get some value first."

**4. Post the same piece across many subreddits.**
> "Volume here is super important because that increases the chances of one of your posts getting
> to the Reddit front page... let's say you post on 10 different subreddits and each gets on
> average around 10k views. That's a total of like 100k views already."

**5. Repeat, and vary the format.** Videos, case studies, other post types.
> "A good rule of thumb is posting **two to three times per week. I think that anything more than
> that will probably get you banned.**"

### Why this matters to us

**We skipped step 1 and violated step 5, and it cost us ten posts.**

Diego says plainly that posts from an un-warmed account are automatically filtered. That is
precisely, literally what happened. We then posted nine times in under two hours against his
explicit two-to-three-per-week ceiling.

The playbook was right. We ran steps 3 and 4 without step 1.

---

## What has been established the hard way

### Reddit

**Submissions are karma-gated. Comments are not.**

| Action | Attempts | Result |
|---|--:|---|
| Submissions | 10 | **10 removed** — 8 "Reddit's filters", 2 "content policy" |
| Comments | 4 | **4 live, 0 removed** |

The removals were not about the link, the flair, or the subreddit. A post with **no link, no
product mention, correct flair, in a subreddit we'd never touched** was still removed. Meanwhile a
comment **carrying euphoriainv.com** went live and stayed live.

Corroborated by research: low-karma and new accounts have submissions filtered until a track
record exists.

**Other hard-won facts:**
- **Rate limit ≈ 1 comment per 7 minutes.** Server-side. Ceiling is ~8/hour, realistic is 3-5.
- **Retrying into a rate limit extends it.** Observed 417s → 225s → 557s → 421s. When throttled,
  actually wait. Do not click Comment again.
- **Naming another subreddit in a comment trips automod.** Our megathread comment linked
  r/personalfinance as a helpful free alternative and got flagged for "spam promoting other subs".
  Name the resource, never with the `r/` prefix.
- **Promo-focused subs are the most hostile.** r/startups_promotion and r/ShowMeYourApps are spam
  magnets so their automod is tuned hardest against low-karma accounts. Ordinary project subs were
  more permissive.
- **The account has prior promo history** — its first-ever action, 5 months ago, was a promotional
  post to r/povertyfinance. It has never been anything but promotional. That is why the filter was
  already primed before we started.
- **Usernames can never be changed and deleting does not release them.** To get a brand handle you
  register a new account; you do not need to delete this one, and you should not, because it holds
  the karma.

**Karma engines that are on-topic for us:** r/explainlikeimfive (3.5M weekly) and
r/NoStupidQuestions both carry constant money questions. Authentic, and it builds exactly the
reputation the eventual post needs. **Avoid free-karma subs entirely** — they don't ban you, they
mark you, and accounts built that way get shadowbanned the moment they post something real.

### X

**A reply the original author replies back to is scored 150x a like** — the highest-weighted
engagement signal on the platform. With 9 followers our own posts reach nobody; replies borrow the
audience of whoever we reply to.

- The For You feed runs on **Phoenix**, a transformer ranking model open-sourced Jan 2026.
- **First 30 minutes carry most of the weight**; first two hours decide the outcome. Reply to
  posts that are minutes old, not hours.
- **Links in a main tweet tank reach.** Put every URL in the first reply instead.
- **280 char limit** on free accounts. Drafts get rejected silently over it — check the counter.
- X Premium advertises "boosted replies". Real lever, paid, founder's call.

**Search queries that surface good targets:**
```
("app store" OR "app review" OR testflight) (rejected OR review OR approved) min_faves:3   &f=live
#buildinpublic min_faves:3                                                                 &f=live
```
Finance queries ("learning to invest", "retention OR churn") return roleplay and crypto noise.
Don't bother.

---

## The rules

1. **Never submit a Reddit post from u/Big_Drink7656** until karma is real. Ten for ten.
2. **Comment only, and answer questions.** That is the entire Reddit channel right now.
3. **Every X reply carries one natural clause identifying us** — "our investing app", "we ran into
   this building an investing app". Not a pitch, a signature. Anonymous helpfulness builds nothing
   for Euphoria; that was a real mistake made early and corrected.
4. **Never name another subreddit** in a Reddit comment.
5. **When rate limited, wait. Do not retry.**
6. **Answer HOW things work, never what someone should do.** Individualised financial advice is
   what Euphoria's own server-side guard refuses to produce.
7. **Reply to posts under an hour old** on X. Under 30 minutes is better.
8. **2-3 Reddit posts per week maximum**, once posting is viable again. Diego's ceiling.

---

## Current state

**Reddit — 4 comments, all live, all in r/investingforbeginners or r/explainlikeimfive**
- IRA early-withdrawal education exception
- "best investing app" megathread — **carries the link**, 103K weekly visitors
- ATR-based stops and position sizing
- (queued, written, blocked behind rate limit) central bank rate explanation, r/explainlikeimfive

**X — 6 replies live, 1 author reply earned**

| Reply | Target | Result |
|---|---|---|
| App Store description gotcha | @solotechdev (7,008, verified) | **he replied back** |
| Follow-up on his template | @solotechdev | chain open |
| 3.1.2 description URLs | @SametNail (verified) | sent |
| Design tokens not screenshots | @kyleleung_io (verified) | sent |
| **What we're building, with link** | @profdui (verified) | live, preview card |
| QR deep-link + review warning | @WenyuShingi | live |

@profdui had asked "I'd love to see what you're building" — the only context where a link is not
promotion is when someone asks.

---

## Two things a human must do — automation cannot

**1. Set the X bio website field.** The Edit Profile modal hangs on a spinner every single time
(six attempts). This is the whole conversion path and it is one field:
```
x.com/settings/profile → Website → https://euphoriainv.com/?utm_source=x&utm_medium=bio
```
The UTM tag matters because PostHog is already installed on the site — it turns "we got views"
into "X sent 11 people and 3 started a lesson".

**2. Pin a post about Euphoria** so every profile visitor lands on the pitch. Draft, ready to
paste (link goes in the FIRST REPLY, not the post — links in the main tweet tank reach):

> i'm 16 and spent four months building the investing app i wanted when i started
>
> 300 lessons, 12 courses. starts at what inflation does to money sitting in a savings account,
> ends at wealth management
>
> plus a practice portfolio on live prices with fake money. no deposits, no brokerage account,
> nothing to lose
>
> iOS is in review now

First reply: `euphoriainv.com/?utm_source=x&utm_medium=pinned — free tier, paid one for the full library`

Until both are done, every reply drives people to a profile with nothing to click.

---

## What to do next

1. Land the queued r/explainlikeimfive comment once the rate limit clears.
2. Keep alternating: Reddit comment → X reply → Reddit comment. The 7-minute Reddit cooldown is
   exactly the right length for an X reply.
3. Watch X notifications. An author replying is the 150x event — always continue that chain.
4. Build the subreddit list via the Reddit Ads targeting tool (Diego's step 2). Never pay.
5. Reassess Reddit submissions at ~50 comment karma, roughly 1-2 weeks of daily commenting.

## Reference files in docs/marketing/

`OVERNIGHT_LOG.md` — full experiment record, every action and outcome
`REDDIT_DIAGNOSIS.md` — why ten posts failed
`REDDIT_ALGORITHM.md` · `X_ALGORITHM.md` — the ranking research
`REDDIT_20_POSTS.md` · `REDDIT_QUEUE.md` — written content, ready when karma allows
`REDDIT_CONTENT.md` · `REDDIT_PLANNER.md` — thread answers and per-sub plan

---

## Session update — 2026-09-03

### Comments now 6 for 6, still zero removals

5. **r/explainlikeimfive** — the queued central bank rate explanation landed. Answered *why borrowing
   and savings rates move together*: the policy rate is what a bank earns risk-free doing nothing,
   so it becomes the floor under lending and the ceiling over savings. Closed on why savings rates
   "rise like a feather and fall like a stone."
6. **r/NoStupidQuestions** — *"Are interest rates on investments much higher in the US somehow?"*
   (9.3M weekly visitors). Every other answer said "US stocks outperformed." Ours said the numbers
   people quote are **account balances, not returns** — contribution + employer match + market gain
   reported as one figure, where the match alone is an instant 50-100% on the matched portion.
   Plus the currency point nobody raised. **First comment to carry the Euphoria mention.**

### Promotion policy — founder's call, 2026-09-03

**Mention, never a link, until karma is real.** One clause that earns its place by explaining where
the knowledge comes from — "we build an investing course app and this is the most common mixup
people arrive with." It reads as credential, not pitch.

> "If we get removed and we have our link, there's really no point, but if we at least have a
> mention and we don't get removed, it's better than nothing."

Anonymous helpfulness builds nothing for Euphoria. Every comment from here carries the clause.
Revisit direct links at ~50 karma.

### ⚠️ Browser automation — the one that cost us this session

**Never click Reddit's comment box by coordinate. Click it by `ref` from `read_page`.**

Clicking the composer at its screen coordinates *expands* it but leaves focus on the document body.
Every character then fires as a Reddit keyboard shortcut. Typing a comment this way produced:
`t` opened the sidebar · `s` saved the post · `h` **hid the post** · navigation to `/submit/` ·
and **"Error: Too many requests."** Nothing was posted and no submission was made, but the account
took a burst of junk actions and tripped the rate limiter for nothing.

Working sequence:
1. `read_page` with `filter: "interactive"` → the composer textbox appears as a bare `textbox [ref_N]`
2. `computer` `left_click` with **`ref`**, not `coordinate`
3. Type four characters and screenshot to confirm they land *in the box* before typing the real comment
4. Submit via the `type="submit"` button ref, not a coordinate

The verify-with-four-characters step is cheap and would have caught this immediately.

### ⚠️ x.com is blocked in this session

`navigate` to x.com returns **"Navigation to this domain is not allowed."** The X half of the
alternating loop cannot run until x.com is granted in the Claude in Chrome extension's site
permissions. Reddit is unaffected.

### Still outstanding — unchanged, still human-only

Both conversion-path items from the section above remain undone: the **X bio website field** and
the **pinned post**. Reddit now has the same gap — u/Big_Drink7656's profile says nothing about
Euphoria, so the mention in a comment has nowhere to send a curious reader.

### ⚠️ There is a THIRD account the table above omits

**@TeamEuphoriaInv — "Euphoria Investing".** Discovered 2026-09-03 via the founder bio.

| Field | Value |
|---|---|
| Bio | financial literacy and investment education built for the future of youth · → app in review |
| Category | Education |
| Website | **euphoriainv.com — already set** |
| Joined | March 2026 |
| Audience | **1 follower**, 18 following |
| Content | **1 post, Apr 3.** Pure ad copy, link in the main tweet. **7 views.** |

That 7-view post is the X research proving itself: a link in a main tweet tanks reach, and a brand
account with no audience has nothing to amplify it.

**The strategic consequence.** The website field is not missing everywhere — it is set on the brand
account and missing on **@sidd_k28**, which is the account actually generating reach. That makes the
founder bio the highest-leverage unfixed item on X.

**Founder account is the engine, brand account is the destination.** @sidd_k28 borrows audience
through replies; @TeamEuphoriaInv is where a curious reader lands and finds a real company. Grown in
that order the two compound. Grown brand-first, neither moves — Diego cleared $17K MRR on under 100
X followers precisely because he never grew an account, he borrowed other people's.

Do not chase followers on @TeamEuphoriaInv. It needs occasional real content so it doesn't look
abandoned, not a follower campaign.

### Search query correction

`min_faves:3` **starves the live feed** — fresh posts have not accumulated likes yet, so the query
only surfaces posts 3+ hours old, well outside the 30-minute window that carries the ranking weight.
Drop the floor and filter by relevance manually:

```
#buildinpublic                                                      &f=live
("app store" OR "app review" OR testflight) (rejected OR approved)  &f=live
```

Run without `min_faves` and expect noise — a raw #buildinpublic live feed is mostly framework bug
rants and unrelated launches. A reply is only worth sending where the identifying clause is not
forced.

### ✅ RESOLVED — the X bio website field is set

Done 2026-09-03. **@sidd_k28 now shows `🔗 euphoriainv.com`** on the profile. Verified live: the link
renders next to "Writer · Joined July 2025", and the post count is unchanged at 92, so nothing was
published in the process.

**How, after six failed attempts.** Do not click "Edit profile" on the profile page — that is the
path that hangs on a spinner. Navigate straight to **`x.com/settings/profile`**. The same modal
opens through a different code path and loads immediately.

Then, inside it:
1. `find` the Website input — it comes back as `textbox "Website"`. Mouse-wheel scrolling does
   **not** move this modal, so do not try to scroll it into view; address it by `ref`.
2. `left_click` by **`ref`**, `cmd+a`, type the URL.
3. Save sits at the top-right of the modal header.

Founder's call: **plain `https://euphoriainv.com`, no UTM tag.** Note the tradeoff that was accepted
— without the tag PostHog cannot separate X traffic from any other source, so profile-driven signups
will not be attributable to X.

**Remaining human-only item: the pinned post.** Still undone. The draft is in the section above,
link goes in the FIRST REPLY, never the main tweet.

### ✅ Pinned post — POSTED (pin itself still manual)

Live 2026-09-03, `x.com/sidd_k28/status/2095652622770327936`. Post count went 92 → 94 (post + reply).

**The post** (267 chars — the draft in the section above is **332 and cannot be posted**; X rejects
over-length drafts silently, so that original was never going to work):

> i'm 16 and built the investing app i wanted when i started
>
> a practice portfolio on live market prices with fake money. no deposits, no brokerage account,
> nothing to lose
>
> hand-drawn pixel art, animated end to end. closer to a game than a course
>
> iOS is in review now

**First reply, carrying the link:** `euphoriainv.com — free to start`

Founder's steer: lead with the app and its feel, not the lesson count. The art is texture, not the
headline. Grounded in the repo — Skia 2.6, Reanimated 4.5, and `src/lib/pixel/` where every sprite
is ASCII art in a text file, 16×16 on a shared orchid palette.

**Unexpected win:** the link reply auto-generated a preview card showing the real dashboard —
$10,000 portfolio, AI Insights, Economic Calendar. The post gets a genuine visual without any media
upload, which matters because a post about how the app looks otherwise has nothing to look at.

**STILL TO DO, manually:** the pin. Profile → the **⋯** on that post → **Pin to your profile**.

### ⚠️⚠️ Do not automate the X post ⋯ menu — it nearly deleted the post twice

On a status page, `find` for "More options button on the post" returns a ref that **is the Delete
control**. Clicking it opens "Delete post? This can't be undone." Both times it was cancelled and
nothing was lost, but the margin was one click.

Compounding it: an earlier stray *coordinate* click had already opened the menu, so the first ref
click landed on a menu item rather than opening a menu.

**Rules for this menu:** pin by hand. If it ever must be automated, `read_page` the menu after
opening it and match the item by its literal text, never trust `find`'s description. And never mix
coordinate clicks with ref clicks in the same interaction — a menu left open silently changes what
the next click hits.

### Reply composers need TWO clicks

X reply boxes ignore the first `left_click` by ref — it expands the composer without taking focus,
exactly like Reddit's. Click the same ref twice, then type. A single click leaves the box empty and
the text goes nowhere.

### Comment #7 — r/explainlikeimfive, "how do these 'do X and get cash' apps work?"

Live 2026-09-03. Thread was 2h old with 14 comments — every existing answer said "it's a scam"
without answering the question actually asked, which was *where does the money come from*.

Ours traced the money: it originates in **other app companies' user-acquisition budgets**. A
developer pays a few dollars for an installed user; these apps are ad networks sitting between that
budget and the user, passing along the smallest slice they can. Then the part nobody had framed —
**breakage is the business model, not a side effect.** The network books revenue when the ad is
watched and only incurs cost if you cash out, so every design choice (high minimum, slow accrual,
expiring points, verification friction) exists to push cash-out further away. Also answered OP's
real fear directly: no bank access, it's advertising ID and location trace.

Mention landed as the closing line and doubles as the evidence for the whole comment:

> we build an app and get pitched by these networks constantly. the pitch is always "cheap installs"
> — and it's cheap because those users are, on average, worth nothing.

**Running total: 7 comments, 7 live, 0 removed. Two now carry the mention.**

### Reddit composer takes TWO separate interactions

Same shape as X. `read_page` will not show a comment textbox at all until the composer is expanded,
so the sequence is:

1. **Click the collapsed "Join the conversation" box** to instantiate the composer. A coordinate
   click is fine here — it is a click, and clicks are safe; only *typing* without focus is dangerous.
2. **`find` the textbox**, then `left_click` it **by ref**. The expansion click does not carry focus.
3. **Type four characters and screenshot.** If they appear in the box, focus is real. If the sidebar
   opens instead, focus never landed and the text is firing as shortcuts — stop.
4. `cmd+a`, type the real comment, then submit via the `type="submit"` button's ref.

## ⚠️ OPEN QUESTION — are the comments actually visible to anyone?

Raised 2026-09-03 and **not resolved**. This is the most important unknown in the project, because
everything downstream assumes the comment channel works.

**Measured on the profile:**

| Comment | Age | Score | Views |
|---|---|--:|--:|
| ELI5 — "do X and get cash" apps | 1 min | 1 | 1 |
| NSQ — US interest rates | 27 min | 1 | — |
| ELI5 — central bank rates | 55 min | 1 | — |
| r/investingforbeginners — stop orders | 10 hr | 1 | 1 |
| r/investingforbeginners — best investing app | 11 hr | 1 | — |

Karma: **1**, unchanged. Score 1 is the automatic self-upvote, so **nothing has been voted on by
anyone**. One view on an 11-hour-old comment in a sub with 103K weekly visitors.

**The reason this is a real worry, not pessimism:** a removed or filtered Reddit comment looks
completely normal to its author. It shows on your profile, it renders in the thread when you are
logged in, and the submit confirmation appears exactly as it does for a live comment. So "7 for 7
surviving" — a claim made repeatedly in this doc — is only evidence that the comments *posted*, not
that anyone else can see them. The view counts are consistent with the same filtering that killed
all ten submissions.

**Verification attempted and failed.** Anonymous `curl` of the thread `.json` returned an identical
189,908-byte body for three different URLs with zero `"author"` fields — Reddit served a block
interstitial, not JSON. `old.reddit.com` returned zero bytes. Both are anti-scraping blocks; neither
is evidence either way.

**The five-second test that actually settles it:** open a comment permalink in a **private/incognito
window** (or any logged-out browser). Logged out you see exactly what a stranger sees.
- Comment renders → the channel works, it is just slow, keep commenting.
- Comment missing or `[removed]` → 11 hours of writing reached nobody, and the Reddit strategy needs
  rethinking from the ground up rather than more comments.

**Do this before writing another Reddit comment.** Everything else is downstream of the answer.

## 🔴 THE REDDIT MISTAKE — diagnosed 2026-09-03

Everything above about Reddit tactics is probably answering the wrong question. Read this before
acting on any of it.

### The evidence

**One view in eleven hours is not low engagement. It is the author's own view.**

A comment in a 103K-weekly-visitor sub, in a thread carrying 14 other comments, collects dozens of
views in eleven hours from people simply reading the thread — even a mediocre comment nobody
upvotes. Exactly one view is not a popularity outcome. It is the signature of content that is not
being served to anyone. Karma has sat at 1 across five months and seven comments, and every comment
sits at score 1, which is the automatic self-upvote.

### Mistake 1 — a diagnostic error that produced a false green light

"Your comment was submitted", plus the comment rendering normally on our own profile, was treated as
proof the comment was live. **Reddit displays removed and filtered comments to their authors exactly
as though they were normal.** So the finding this entire strategy rests on —

> | Action | Attempts | Result |
> | Submissions | 10 | 10 removed |
> | Comments | 4 | **4 live, 0 removed** |

— was never tested. "4 live" only ever meant "4 posted". Every comment written since inherited that
unverified assumption. This is what turned one bad night into eleven hours of work into a hole.

### Mistake 2 — trying to rehabilitate an account that is already burnt

By this document's own account, u/Big_Drink7656's first-ever action five months ago was a
promotional post to r/povertyfinance, and it has never done anything that was not promotional. This
project then added nine posts in under two hours, most carrying a link. That is a textbook spam
signature.

**Reddit's site-wide filter acts on accounts, not posts.** That is why the ten submissions died
across completely unrelated subreddits — including one with no link, correct flair, and no product
mention at all. The common factor was never the post, the sub, the flair, or the velocity. It was
always the account. Every tactical theory in the sections above is downstream of missing this.

### What this does to Diego's playbook

The note above says "we skipped step 1." True but incomplete, and the incomplete version is
dangerous because it implies the fix is to start doing step 1 now.

Diego said warm up an account **before** posting anything promotional — a clean account building
genuine history. **You cannot warm up an account that is already flagged by adding good content to
it.** The filter sits upstream of anything you write. Which means the last eleven hours of careful,
genuinely good writing went into the one place where quality could not help.

### What follows

1. **Run the incognito test first.** It converts this diagnosis from high-confidence to certain, and
   it costs five seconds. Do not act on any of the below until it is done.
2. **If confirmed: stop writing comments from u/Big_Drink7656.** More good comments on a filtered
   account produce nothing. This is not a tone or targeting problem and cannot be fixed by writing
   better.
3. **A new account is the only route back to Reddit.** Usernames cannot be changed, and the note
   above is right that the old account should not be deleted. The new one needs real organic history
   — weeks of ordinary commenting with no link and no product mention — before anything promotional.
   That is Diego's step 1 as actually written.
4. **Meanwhile X is measurably working.** The pinned post took 13 views in 12 minutes from a
   9-follower account. The Reddit comment took 1 view in 11 hours. Put the effort where the
   distribution demonstrably exists.

### The transferable lesson

Never treat a platform's success confirmation as proof of visibility. Submission confirmations,
author-view rendering, and profile listings all report that *you* wrote something — not that anyone
can see it. Verify from logged out, early, before building a strategy on top of it.

### X reply #7 — @gt (Geoff Teehan), 2026-09-03

Best-positioned reply this account has sent. Target: `x.com/gt/status/2095650095043911979`

| | |
|---|---|
| Author | **Geoff Teehan** — verified, Design co-founder at Lightspark, **previously VP Design at Meta**, co-founder Teehan+Lax |
| Post | "Approved! The OG iPod (Player 2001 now)" — shipped to iOS via TestFlight, capped at 10,000 |
| Age when replied | 27 min — inside the window that decides reach |
| Views | 181 and climbing |
| Our position | **Only reply on the post** |

> testflight external only needs beta app review, which is a much lighter pass than full review — we're
> in the real one now with our investing app and the gap is bigger than i expected. is the 10k cap the
> plan, or does this go to the store proper eventually?

**Why this one was chosen over three other live results.** A mortgage-app review post had 2 views, a
GPT-6 article was off-topic, and a Shopify-reviews story would have forced the clause. Geoff's was
the only target where our standing is real — we are literally in App Store review right now — so the
identifying clause reads as the source of the knowledge rather than an advertisement.

**Construction, for repeating it:** open with a fact the author does not have (TestFlight external
clears Beta App Review, a genuinely lighter gate than full App Review), attach the clause as the
reason we would know it, close on a question only the author can answer. The question is the point —
an author reply is the 150x event, and the one author reply this account has ever earned came from
exactly this shape.

Deliberately left unsaid: a faithful iPod recreation on the real App Store runs into Apple's own
trademark and copycat guidelines. Asking "does this go to the store proper?" lets him raise it
himself, which is more useful than a stranger predicting his project will be rejected.

### Search fix that produced this

```
("app store" OR testflight OR "app review") (rejected OR approved OR waiting OR review) -filter:replies   &f=live
```

`-filter:replies` is the addition that matters — it strips reply noise so the live feed returns
original posts, which are the ones worth replying to. Still no `min_faves`.

### X reply #8 — @mae616_, 2026-09-03

`x.com/mae616_/status/2095656755489616185` — verified, Japanese web engineer, posting the #Shipaton
build-in-public series in English. Replied at **6 minutes old**, 34 views, **only reply on the post**.

Their Day 15: *"The overall design direction finally clicked. I can now view the prototype as one
consistent experience in Figma... I'd say it's about 80% there."* They also said a waitlist and first
proper look are coming tomorrow — worth watching for.

> the last 20% is where a prototype starts lying. figma lets you nudge a value without recording it,
> so a consistent file hides a dozen near-identical spacings. we only caught ours by grepping the
> code of our investing app. did yours survive screen production?

Chosen because this account already has traction in the design lane — the *"describe the system once,
not the screen every time"* reply is the one that earned a like today. Same three-part construction
as the @gt reply: a specific failure mode they don't have yet, the clause as the reason we'd know it,
a question only they can answer.

## Target-hunting: which veins actually work

**✅ `#shipaton -filter:replies &f=live` — the best vein found so far.** A live hackathon feed of
indie devs shipping apps *right now*. Posts 4-6 minutes old, verified accounts, genuinely on-topic,
and our standing is real because we are shipping too. Both good targets this session came from here
or from the App Store query.

**✅ App Store / TestFlight review queries** — reliable, but they surface fewer fresh posts. Add
`-filter:replies`.

**❌ Finance queries are confirmed dead.** This doc already warned about it and the warning holds.
`("financial literacy" OR "teach kids about money" OR "learning to invest" OR "personal finance")`
on the live feed returned a Medicaid nursing-home article at 4 views, two Japanese-language posts
about personal savings, and a "FACELESS YOUTUBE" post. **Stop running finance searches.** The people
worth reaching are found by what they are *building*, not by the topic they are building about.

**Freshness beats reach.** A 3-hour-old post with a perfect angle is worth less than a 6-minute-old
post with a decent one. First 30 minutes carry most of the ranking weight, and being the only reply
on a young post is a far better position than the tenth reply on a popular one — both replies this
session landed as the only reply.

## 🎯 SECOND AUTHOR REPLY EARNED — @gt (Geoff Teehan), 2026-09-03

**Four minutes after our reply, he answered:**

> This wouldn't pass full review IMO

Second author reply this account has ever earned, and from a considerably bigger account than the
first — verified, Design co-founder at Lightspark, previously VP Design at Meta. Parent post reached
224 views; our reply picked up a like.

**Why this one worked, and it is repeatable.** The reply deliberately withheld the interesting claim.
We knew a pixel-faithful iPod recreation would hit Apple's copycat and trademark guidelines, and we
did **not** say so. Instead we asked *"does this go to the store proper eventually?"* — and he raised
the objection himself, in his own words, which obliged a response.

**The lesson: ask the question whose answer you already know, rather than stating it.** A stranger
telling a design lead his project will be rejected gets ignored or resented. A stranger asking a
question he wants to answer starts a conversation. Same information, opposite outcome.

**Our follow-up, sent to his reply directly rather than the parent post:**

> that's the strange part — beta review passes what full review won't, so tribute software just lives
> on testflight forever and 10k becomes the real ceiling rather than a beta stage. is that the
> accepted outcome for these, or does anyone actually fight it?

Agrees with him first (he is right, and arguing App Store review with a design lead would be both
wrong and a bad look), extends into something he did not say, ends on another question. **No mention
in the follow-up** — it is already established upthread, and repeating it inside a live conversation
is exactly where a signature curdles into a pitch.

### Mechanics: replying to a reply, not the parent

Click the **reply icon on that specific comment** (find it as `button "0 Replies. Reply"` within
their article) rather than using the composer at the top of the thread. That opens a modal already
scoped to "Replying to @them" and keeps the chain nested. Composing at the top of the page attaches
to the parent post instead and breaks the thread.

### X reply #9 — @gabriel_sstech, 2026-09-03

`x.com/gabriel_sstech/status/2095658804134490225` — verified, AI-agents infrastructure (omnisiv.com).
Replied at 6 min old, 6 views, only reply. Small account, so this was a conversation bet rather than
a reach bet.

His post: *"First section is now your first 10 minutes after paying: join the circle, pick one path,
make one ugly attempt this week."* — post-purchase activation, which is the one subject where we hold
**measured data instead of opinion**.

> the ugly-attempt commitment is the right shape. the risk is the gap between minute 10 and the
> attempt — building our investing app the dropoff was never the hard part, it was day 12, and
> showing position beat praise. does the circle carry them through that week?

Sourced from the retention work already recorded in `REDDIT_QUEUE.md`: the dropoff was not at
difficulty, it landed near day 12, a streak that resets to zero on a miss kills returning users
because there is nothing left to protect, and "Lesson 4 of 25" outperformed "well done" because at
week two the only question anyone has is whether this is going anywhere. **That corpus is a reply
engine.** Any post about onboarding, activation, retention or streaks can be answered from it with
something specific and true that nobody else in the thread has.

### ⚠️ On X, the first `find` after a `navigate` is ALWAYS stale

Confirmed three times this session (@gt, @mae616_, @gabriel_sstech). The ref resolves, the click
reports success, and the text silently goes nowhere — the composer stays on its placeholder.

**The sequence that works every time:**
1. `navigate`, wait ~7s
2. `find` the reply box — **discard this result, it is stale**
3. `find` again — this handle is live
4. `left_click` the ref **twice** (the first click expands, the second focuses)
5. type, then screenshot to confirm the text is actually in the box
6. `find` the Reply button and click it by ref

Skipping the second `find` costs a full round trip every time. Budget for it.

### X reply #10 — @roywass_, 2026-09-03

`x.com/roywass_/status/2095662584120647754` — solo dev, unverified, **36 seconds old** when found.
Peak of the ranking window. 4 views, only reply.

His project "Blind": a photo app with no preview, no filters, no gallery — everyone's photos drop
together at reveal, like a disposable camera, for weddings and events.

> the disposable camera comparison does a lot of work — with film the wait was forced, so nobody
> resented it. here you're choosing it, so the reveal has to earn the delay. we hit that gating
> content in our investing app. what's the window for a wedding?

**What was deliberately NOT claimed.** Euphoria has tap-reveal cards, so there was a tempting line
about "the wait that worked was shorter than we assumed" — but tap-reveal is a tap interaction, not a
timed one, and we have never measured a wait duration. Inventing a finding to sound credible is
exactly what gets caught by the one person in the thread who actually knows. The observation used
instead (forced wait vs chosen wait) needs no data at all and is sharper anyway.

### ⚠️ Correction to the find-twice rule

Two `find` calls **inside the same batch** do not work — both execute before the page settles and
both hand back stale handles. Confirmed on @roywass_.

**The second `find` must be its own separate tool call**, after the batch containing the navigate has
already returned. Sequence:

1. Call 1: `navigate` + `wait 7s`
2. Call 2: `find` the reply box — **its own call**, and this is the handle that works
3. Call 3: `left_click` ref ×2 → type → screenshot
4. Call 4: `find` the Reply button, click by ref (or click its coordinate if clearly visible)

Roughly four round trips per reply. Budget accordingly.

## Session totals — 2026-09-03

**X — 4 replies sent, 1 author reply earned:**

| Target | Age | Views | Result |
|---|--:|--:|---|
| @gt Geoff Teehan (ex-VP Design, Meta) | 27m | 224 | **He replied.** Chain continued |
| @mae616_ | 6m | 34 | Only reply |
| @gabriel_sstech | 6m | 6 | Only reply |
| @roywass_ | 36s | 4 | Only reply |

Every one landed as the only reply on its post. Plus: bio website field fixed, pinned post live with
a preview card, 2 Reddit comments, the Reddit channel diagnosed, and the subreddit list built.

## 🎉 THREE AUTHOR REPLIES + FIRST NEW FOLLOWER — 2026-09-03

Before today this account had earned **one** author reply, ever. Today: four replies sent, **three
authors replied back**, and one of them followed.

| Target | Their reply | Status |
|---|---|---|
| **@gt** Geoff Teehan (verified, ex-VP Design at Meta) | *"This wouldn't pass full review IMO"* | We answered; open |
| **@roywass_** (solo dev, Blind) | *"creator sets it: reveal live, after the event or a custom delay. Main goal is just keeping people in the moment instead of heads-down comparing shots mid-party"* | **Followed us.** We answered; open |
| **@mae616_** (verified) | *"That's a good point... I'll definitely watch out for them. Thanks!"* + liked our reply | Natural endpoint |
| @gabriel_sstech (verified) | — | No reply yet |

**@roywass_ is the warmest contact this account has.** He replied substantively *and* followed —
the first follower gained from this work. His answer also handed over something better than his
original post: Blind is not really a delayed-reveal camera, it is a device for stopping people
checking their phones mid-event. Our follow-up named that back to him:

> that reframes it. the delay isn't the mechanic — the missing preview is. nobody checks a phone when
> there's nothing to check yet. we found the same removing our streak reset: taking feedback away
> moved behaviour more than adding anything.

### The pattern behind a ~75% author-reply rate

Every reply that earned one had the same three parts:

1. **A specific fact or reframe the author does not already have.** Not agreement, not praise.
   TestFlight clears a lighter review gate. Figma hides near-identical spacings. A forced wait and a
   chosen wait are different products.
2. **The identifying clause as the *source* of that knowledge**, never as a pitch — "we hit that
   building our investing app". It explains why we would know, which is why it survives.
3. **A question only the author can answer.** This is what converts a good reply into a conversation.
   Replies that merely inform get liked; replies that ask get answered.

And the meta-rule that produced the strongest result: **ask the question whose answer you already
know rather than stating it.** Geoff raised the App Store rejection risk himself because we asked
instead of telling.

**In a live chain, drop the clause.** It is established upthread, and repeating it inside a running
conversation is exactly where a signature turns into an advertisement.

## 15 X REPLIES COMPLETE — 2026-09-03

| # | Target | Result |
|--:|---|---|
| 1-2 | **@gt** Geoff Teehan (ex-VP Design, Meta) | **He replied.** Chain continued |
| 3 | **@mae616_** verified | **Replied + liked** |
| 4 | @gabriel_sstech verified | — |
| 5-6 | **@roywass_** | **Replied + FOLLOWED US** |
| 7 | @GogogojcG (copy-trading) | Only reply |
| 8 | @hugalves (Day 12, onboarding payoff) | Only reply |
| 9 | @henrypl_dev | Inside a **227K-view** @dabit3 thread |
| 10 | @amooanas (Day 149/400) | Only reply |
| 11 | @oscar_kotlin verified | Only reply |
| 12 | @gabztodaro verified | Replied **in Portuguese** to a Portuguese post |
| 13 | **@Momo_studytwt** G10 AP student | **Liked our reply within 28s** |
| 14 | @gideon_abe | Only reply |
| 15 | @naninav38990124 | Answered his direct "what should I improve first?" |

**3 author replies, 1 new follower, 2 likes.** This account had earned one author reply in its
entire history before today.

### Writing rules the founder set, mid-session

**No em dashes.** They are an AI tell and every reply was full of them. Write the way a person
types: short sentences, a lowercase opener like "nice one", ordinary words. Commas and full stops
do the work an em dash was doing.

**Say "commenting", not "posting".** The activity is replying to other people's posts. We are not
broadcasting.

### Two process mistakes worth not repeating

1. **Check whether the reply already sent before retyping it.** On @gideon_abe the first version
   posted, then a rewrite was typed into the box on top of it. Caught before it double-posted, but
   the fix is to screenshot and confirm the send landed before composing anything else.
2. **cmd+a does not select inside X's composer.** It selects the whole page. To clear a draft,
   click into the text and press Backspace with `repeat: 100` a few times. And note that a
   non-empty composer blocks navigation with a "Leave site?" dialog, so the draft has to be cleared
   before moving on.

### Highest-yield target types, ranked by what actually happened

1. **Someone explicitly asking for feedback** ("what should I improve first?") — an open invitation.
2. **A post under 10 minutes old with zero replies** — being the only reply is the whole game.
3. **A reply inside a large thread** — @henrypl_dev's post sat under a 227K-view parent.
4. **Small solo builders** — they follow back. Verified accounts with reach reply but rarely follow.
   @roywass_ had 4 views and followed; @gt had 224 and did not.
5. **Same-language replies.** The Portuguese reply to a Portuguese post is worth far more than an
   English one would have been.
