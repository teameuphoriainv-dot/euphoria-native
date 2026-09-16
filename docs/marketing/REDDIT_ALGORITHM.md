# How Reddit actually distributes a post

Researched 2026-09-02. This changes how the posts should be timed and worked, not what they say.

## The first hour is the whole game

Ranking is **logarithmic**: a post's first ~10 upvotes carry roughly the weight of the next 100.
And **velocity beats volume** — 20 upvotes in ten minutes outranks 200 spread over ten hours.

The practical consequence is blunt: a post's fate is decided in its first hour, and almost nothing
you do afterwards recovers it. A post that gets nothing for sixty minutes is finished, however
good it is.

```text
  the trajectory that works
  ─────────────────────────────────────────────────────────
  new     →  Rising  →  Hot  →  subreddit front page
           ↑
           velocity relative to age puts you here.
           Rising exposes you to a fresh wave of users,
           which compounds. Miss it and you stay in /new,
           which almost nobody reads.
```

## What this means we did wrong today

All three posts went up early afternoon, in a batch, and nobody was in the comments afterwards.
That is the opposite of the mechanic above.

| Did | Should have done |
|---|---|
| Posted around midday | Posted **6–9am EST, weekday** — the general peak window |
| Three posts in one hour | One post, then an hour of being present under it |
| Posted and left | Stayed in comments for the first 60 minutes |

## Comments matter more than upvotes

Two findings worth acting on:

- **Comment velocity** is a ranking input in its own right, and **nested reply chains** — real
  back-and-forth — are weighted more heavily than a pile of one-line replies.
- **Upvote ratio above ~90%** is a threshold worth protecting. A defensive or argumentative reply
  costs downvotes, and downvotes hurt disproportionately at low vote counts.

So the highest-leverage hour of Reddit marketing is not writing the post. It is answering every
single comment on it, quickly, in the first hour, in a way that invites a reply back.

**Ask a question in your last line.** Every one of our posts already does this — "happy to hear
what is confusing", "where we're stuck is distribution". That is not politeness, it is what
starts the reply chains the algorithm rewards.

## The value-then-link structure, and why it works mechanically

It is not only etiquette. A post that opens with a pitch gets scrolled past, and a scroll-past in
the first hour is a lost vote during the only window that counts.

```text
  hook       one concrete, specific line. no product name.
  value      something true the reader can use even if they never click.
  mechanism  why it is true. this is what earns the upvote.
  product    one line, late. the link.
  question   invites a reply. starts the chain.
```

The value section is doing real work: it is what makes someone upvote before they have any
opinion about your product. The link converts the people that value already persuaded.

## Reddit is also an AI-citation surface now

Reddit content is heavily cited by AI answer engines. A single well-structured, dominant comment
answering a specific question can end up quoted in AI overviews long after the thread dies.

That reframes the finance subs entirely. A genuinely good answer about compound interest in
r/investingforbeginners has a second life as a citation — no link required, and no rule broken.
The 12 thread answers in [REDDIT_CONTENT.md](REDDIT_CONTENT.md) are written for exactly this.

## The rules that follow

1. **Post 6–9am EST on a weekday.** Check each sub's own peak if you can.
2. **One post at a time.** Then stay under it for an hour.
3. **Reply to every comment**, fast, and end replies with something answerable.
4. **Never argue.** The ratio matters more than being right.
5. **If it is dead after an hour, let it go.** Do not delete and repost — that reads as
   manipulation. Write a better hook next time.

---

Sources: [Reddit algorithm 2026](https://redship.io/glossary/reddit-algorithm) ·
[ranking breakdown](https://www.mediafa.st/how-reddit-algorithm-works) ·
[upvote tactics](https://www.mediafa.st/how-to-get-more-upvotes-on-reddit) ·
[Reddit SEO and AI citations](https://www.verlua.com/blog/reddit-seo-ai-citations-guide)
