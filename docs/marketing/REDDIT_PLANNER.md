# Reddit posting planner

What can actually be posted, per subreddit, per account. Companion to
[REDDIT.md](REDDIT.md), which holds the reasoning.

## The two accounts have different jobs

They are not two ways of doing the same thing. Used identically they read as one operator with
two logins, which is what Reddit's spam detection looks for.

| | **Founder account** (personal) | **Euphoria account** (brand) |
|---|---|---|
| Identity | A person who is building this | The company, openly |
| Where | Audience + habit + student subs | Showcase and launch subs only |
| Posts | Answers, experience, no links | Product posts where permitted |
| Discloses | "I'm building an app for this" — only when directly relevant | Always obvious from the name |
| Cadence | Daily comments, weekly at most a post | 1–2 posts a week, max |

**They must never post about the same thing in the same window.** No replying to each other, no
voting on each other, no cross-posting the other's content. If both accounts want to be in one
subreddit, only one goes in.

## Post format — short, always

The audience skims. One to two paragraphs, **under 500 words, ideally under 250.**

```text
  line 1     a specific, concrete hook. no product name.
  para 1     the value. a real thing you learned or measured.
  para 2     optional. the mechanism or the caveat.
  last line  the product, only where rules permit, only if it fits.
```

Long posts are for r/EntrepreneurRideAlong and r/SideProject, where people read journeys.
Everywhere else, short wins.

---

## A · App discovery

| Subreddit | Weekly | Founder acct | Euphoria acct | Constraint |
|---|--:|---|---|---|
| **r/iosapps** | 54K | — | ✅ **Post the app.** Showcases explicitly welcome | Follow their post format exactly |
| **r/apps** | 47K | — | ✅ Post the app | "Universal" sub, low friction |
| **r/IPhoneApps** | 19K | ✅ Comment first | ⚠️ Only after contributing | Rule: *"not a place to drop a link and vanish"* |
| **r/ProductivityApps** | 94K | ✅ Recommend in threads | ⚠️ Check rules | App discussion is the topic |
| **r/productivity** | 382K | ✅ Answer, no link | ❌ | Large, promo-sensitive |
| **r/GetStudying** | 134K | ✅ *"a study app for money"* | ⚠️ Ask mods | Best framing fit on the whole list |

## B · Habits and self-improvement

Your Home screen says *"Build a money habit."* That is the post, not the app.

| Subreddit | Weekly | Founder acct | Euphoria acct | Constraint |
|---|--:|---|---|---|
| **r/selfimprovement** | 547K | ✅ Experience posts | ❌ | Largest audience available |
| **r/getdisciplined** | 236K | ✅ Streak/habit posts | ❌ | Streaks and daily goals are the topic |
| **r/DecidingToBeBetter** | 218K | ✅ Comment | ❌ | Read rules before posting |
| **r/GetMotivated** | 160K | ✅ Story format | ❌ | Image/story heavy |
| **r/MotivationalThoughts** | 112K | ✅ | ❌ | |
| **r/Habits** | 87K | ✅ Direct topical fit | ❌ | Habit formation is literally the sub |
| **r/motivation** | 21K | ✅ Comment only | ❌ | **Bans self-promotion in its description** |

**Angle that works here:** the honest version of building a money habit — what actually made it
stick, what a streak does to behaviour, why most people quit in week two. You have the data from
your own product. Do not link.

## C · Students

| Subreddit | Weekly | Founder acct | Euphoria acct | Constraint |
|---|--:|---|---|---|
| **r/ApplyingToCollege** | 382K | ✅ Answer money questions | ❌ | 11K contribs/wk — most active found |
| **r/college** | 344K | ✅ | ❌ | Money posts must earn their place |
| **r/APStudents** | 94K | ✅ | ❌ | Reaches the 13+ end. Extra care: minors |
| **r/studytips** | 63K | ✅ | ❌ | |
| **r/study** | 41K | ✅ | ❌ | |
| **r/CollegeRant** | 76K | ⚠️ Vent space | ❌ | Selling into a vent sub reads badly |
| **r/Student** | 18K | ✅ | ❌ | |

## D · Launch and showcase — the Euphoria account's home

Promotion is the purpose. Direct links fine.

| Subreddit | Weekly | Notes |
|---|--:|---|
| **r/SideProject** | 309K | **Zero subreddit rules** (`rules: []`, verified 2026-09-02) — only Reddit sitewide rules apply. Lowest-friction venue on this list. Once, at launch. |
| **r/startups** | 113K | Routes posts into specific threads — read first |
| **r/EntrepreneurRideAlong** | 44K | Long-form belongs here |
| **r/Startup_Ideas** | 27K | |
| **r/sideprojects** | 18K | |
| **r/StartupSoloFounder** | 8.7K | |
| **r/alphaandbetausers** | 8.7K | Early users |
| **r/TestMyApp** | 4.4K | *"Showcase Apps Here!"* |
| **r/ShowYourApp** | 2.9K | |
| **r/startups_promotion** | 2.2K | Promotion is the premise |
| **r/betatests** | 1.9K | |
| **r/ShowMeYourApps** | 1.6K | |
| **r/TestFlight** | 3.2K | Betas |
| **r/LaunchMyStartup** | 258 | Tiny, zero competition |
| **r/iOSProgramming** | — | Technical angle: the parity harness |
| **r/apphookup** | — | Only with a real discount |

## E · Finance audience — founder account, no links, indefinitely

r/investingforbeginners · r/Bogleheads · r/IWantToLearn · r/Fire · r/investing · r/stocks ·
r/financialindependence · r/Money · r/FinancialPlanning · r/BeginnerInvesting ·
r/TheCollegeInvestor · r/FluentInFinance · r/personalfinance

**r/investingforbeginners Rule 2 bans soliciting paid services**, explicitly including content
that forwards to one. Assume the same across this group until each sub's `rules.json` says
otherwise.

## Before the first post in any sub

```
https://www.reddit.com/r/<name>/about/rules.json      (must be logged in)
```

Then check: does it have a **weekly self-promo thread**? Many do, and that is a free, sanctioned
slot most people never use. Does it require **flair**? An unflaired post is auto-removed in
several of these.

## Never

- Both accounts in the same thread, or on the same topic in the same week
- Voting on your own content from the other account
- The same text pasted across subs — tailor or do not post
- Claiming Euphoria is free without saying a paid tier exists
