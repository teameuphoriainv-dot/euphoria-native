# How X actually distributes a reply

Researched 2026-09-02. The reply mechanic is different from the post mechanic, and it is the one
that matters for us because we have no following yet.

## The single number that decides everything

> A reply, followed by the original author replying back, is scored at **150x the value of a like**.

That is the highest-weighted engagement signal on the platform. Not likes. Not reposts. A
**conversation**.

Which means the goal of a reply is not to be seen. It is to be **answered**. A reply the author
responds to gets pulled into the conversation ranking and shown to their audience; a reply they
scroll past dies at ~20 views no matter how good it is.

```text
  how a reply reaches 5-10k views
  ─────────────────────────────────────────────────
  reply early on a mid-size account's post
        ↓
  reply says something the author WANTS to answer
        ↓
  author replies back            ← the 150x moment
        ↓
  thread surfaces to their followers
        ↓
  views compound from THEIR audience, not ours
```

## Phoenix

The For You feed runs on **Phoenix**, a transformer ranking model X rebuilt and open-sourced in
January 2026, replacing the old HeavyRanker. It weights conversation over passive engagement far
more aggressively than its predecessor.

## Timing

**The first 30 minutes carry most of the weight; the first two hours decide the outcome.** If a
post does not pull replies or conversation quickly, the model marks it a dud and stops
distributing it.

For replying, that means: **reply while the post is young.** A reply added to a two-day-old post
is invisible. A reply added in the first few minutes rides the post's own distribution.

## Links kill reach

**A URL in the main tweet tanks it.** Every link goes in the first reply instead, never the post
itself. This applies to euphoriainv.com without exception.

For replies to other people's posts: no link at all. A link in a reply to a stranger's post is
the fastest way to read as spam — and we have just watched exactly that pattern destroy nine
Reddit posts.

## What a reply that earns an answer looks like

1. **Match their register.** If they write in lowercase fragments, do not reply in paragraphs. If
   they are being precise and technical, do not be breezy. Mismatched voice is the tell that
   reads as a bot.
2. **Add one specific thing they do not already know.** A number from our own build, a
   counter-case, a mechanism. Agreement adds nothing and gets no answer.
3. **Leave them something to push back on.** The author replies when there is a reason to. End on
   a real question or a claim worth disputing.
4. **Never pitch.** Not in the reply, not in a follow-up. If someone asks what we are building,
   answer then. That is a different thing from posting in order to be asked.

## The cadence

- Reply to **mid-size accounts (roughly 10k-100k followers)**. Big accounts get thousands of
  replies and ours drowns; small accounts have no audience to reach.
- Reply **early**, in the first minutes.
- **Answer every reply to our own posts within the first 30 minutes** — same 150x rule, pointed
  the other way.

---

Sources: [SocialPilot](https://www.socialpilot.co/blog/twitter-algorithm) ·
[OpenTweet](https://opentweet.io/blog/how-twitter-x-algorithm-works-2026) ·
[SocialBee](https://socialbee.com/blog/twitter-algorithm/) ·
[Sprout Social](https://sproutsocial.com/insights/twitter-algorithm/)
