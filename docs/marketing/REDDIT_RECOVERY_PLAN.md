# Reddit: the diagnosis, and the fix

**Confirmed 2026-09-03. u/Big_Drink7656 is shadowbanned site-wide.**

This supersedes every tactical theory in `CARRYOVER_PROMPT.md`, `REDDIT_DIAGNOSIS.md`, and
`REDDIT_QUEUE.md`. None of them were right, and acting on them wastes more time.

---

## 1. The evidence

| Test | Result |
|---|---|
| Clean technical post, no link, no product mention, r/iOSProgramming | **"Removed by Reddit's filters"** |
| Submissions overall | 10 of 10 removed, across unrelated subreddits |
| Modmail → r/Shadowban | ❌ "You can't message that user." |
| Modmail → r/test (**control**) | ❌ Identical failure |
| Karma | 1, unchanged across five months and seven comments |
| Comment views | 1 view after 11 hours in a 9.3M-weekly-visitor subreddit |
| Inbox | Empty. No warning, no notice, no explanation |

The control test is what makes this conclusive. Failing to modmail r/Shadowban alone could mean that
subreddit disables modmail. Failing r/test **as well** means the account cannot message any
subreddit — and the r/Shadowban moderators name exactly this as the shadowban symptom:

> "If the link is broken or you are unable to message the moderators... then you are most likely
> shadowbanned, disabling this ability."

**The r/iOSProgramming post is the single most damning item.** It had no link, no product mention,
nothing to sell — a genuine technical writeup about React Native collapsing accessibility trees and
breaking Maestro assertions. Removed anyway, by Reddit's site-wide filter rather than any subreddit's
automod. No amount of better writing was ever going to fix this.

## 2. What this means for everything already written

- **The comments are almost certainly invisible.** "7 comments live, 0 removed" only ever meant they
  *posted*. Reddit renders removed and filtered content normally to its own author. The 1-view
  figures now have a confirmed mechanism behind them.
- **Every tactical theory was wrong.** Not the flair, not the link, not the subreddit choice, not the
  posting velocity, not the promotional tone. The account was already burnt before any of it.
- **Stop writing from this account.** Comments, posts, anything. It cannot be rehabilitated by
  behaving well, because the filter sits upstream of behaviour.

## 3. Track A — appeal (cheap, slow, low odds)

Official route: **https://www.reddit.com/appeal** (content blockers off)

Per the r/Shadowban wiki:
- Shadowbans are **permanent until an admin lifts them**
- They are **often applied by mistake** — worth appealing on those grounds
- Appeal **at most once per 24 hours**
- Expect **days to weeks** and multiple attempts
- ⚠️ An automated reply saying *"we have reviewed your account and lifted the restriction(s)"* is
  frequently **false**. Re-run the modmail check before believing it.

Worth doing because it costs nothing and five months of account age has real value. Do **not** wait
on it — one user's documented timeline was three months, and it resolved only after they stopped
appealing.

## 4. Track B — the real path

**A new account, warmed properly. This is Diego's step 1, which was skipped the first time.**

Non-negotiables, because repeating the old pattern gets the new account burnt the same way:

| Rule | Why |
|---|---|
| **No link, no product mention, for weeks** | The old account's *first ever action* was promotional. That is what primed the filter. |
| **Comment only at first** | Submissions from a young account are the highest-risk action. |
| **Participate in things unrelated to finance** | An account that only ever talks about one topic in one register reads as a bot. |
| **Normal pace** | Not nine posts in two hours. A few comments a day. |
| **Never reuse the same IP/browser session as the burnt account if avoidable** | Reddit associates accounts. A new account visibly tied to a shadowbanned one inherits the problem. ⚠️ Worth checking before creating it in this browser. |

Sequencing:
1. **Weeks 1–2** — ordinary commenting, no promotion whatsoever. Target real karma.
2. **Gate** — re-run the modmail check. If it sends, the account is clean.
3. **Week 3+** — first submission, to **r/SideProject** (largest and most tolerant; see
   `REDDIT_SUBREDDIT_LIST.md`).
4. **Then** fan out across Tier A. That is Diego's volume mechanism.
5. Finance subs (Tier B) only once karma is real, value-first, link late and small.

## 5. The thing worth deciding before any of this

`REDDIT_SUBREDDIT_LIST.md` documents the structural problem: **the subreddits that allow posting are
not the subreddits where Euphoria's users are.** Diego never faced this — he sold to developers, so
the promo-tolerant subs *were* his market.

Before spending weeks warming an account, decide what Reddit is actually **for**:
- **Acquisition?** Then the target is finance subs, and the warming has to be genuine enough to earn
  standing there — a much longer game than three weeks.
- **Attention, credibility, backlinks?** Then r/SideProject and Tier A are fine, and three weeks is
  realistic.

These need different accounts, different content and different timelines. Picking one now avoids
warming an account into the wrong strategy.

## 6. Meanwhile

**X is working and measurable.** Same day, from a 9-follower account: 224 views on a reply to a
verified ex-VP Design at Meta, who replied back. Four replies, each landing as the only reply on its
post. Reddit is a multi-week rebuild; X is producing today.

---

## APPEAL FILED — 2026-09-03

Submitted at `reddit.com/appeal` as u/Big_Drink7656. Reddit returned **"Appeal received"**.

Text sent (246/250 chars):

> Early posts from this account were too promotional and I've stopped that. Now everything is
> filtered, including a technical r/iOSProgramming post with no links. I also can't modmail any
> subreddit. Requesting a review of the site-wide restriction.

It opens by conceding the promotional history, which costs nothing — the admins can read the post
log — and makes the two evidence claims after it more credible.

Reddit's confirmation adds: *"suspensions which were correctly issued will not be reversed or lifted
prematurely."*

### Repeat cadence

**Re-file at most once every 24 hours** until there is a response. Per the r/Shadowban wiki this
routinely takes days to weeks and several attempts. One documented case ran three months and
resolved only after the user stopped appealing entirely.

⚠️ **Do not trust an automated reply.** A message from u/reddit reading *"We have reviewed your
account and lifted the restriction(s) on it"* is frequently automated and frequently wrong.

### The free health check — use this, not vibes

To test whether the shadowban is actually lifted, try to send modmail:

```
https://www.reddit.com/message/compose?to=r%2Ftest&subject=test&message=test
```

- ❌ **"You can't message that user."** → still shadowbanned. Ignore any message claiming otherwise.
- ✅ **Message sends** → the restriction is genuinely lifted.

This is the same control test that confirmed the diagnosis, and it is decisive because a shadowban
disables modmail account-wide. Run it before believing any good news, and before writing a single
further comment from this account.
