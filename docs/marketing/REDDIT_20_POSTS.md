# 20 posts that will not get removed

10 for the Euphoria account, 10 for the founder account.

## The rule that makes them survive

All nine removed posts had one thing in common: **euphoriainv.com in the body**, from an account
with 1 karma. Different subs, different text, different flair, same outcome. The link is the
trigger.

So none of these have a link. Not one.

That is not a compromise, it is the actual play. A post with no link cannot be filtered as spam,
it earns karma, and karma is the thing that lets a link survive later. The brand still shows up
in the username on every post. You get seen either way, you just do not get removed.

Post one a day. Never two. Answer every comment inside the first hour.

---

# Euphoria account

## 1 — r/sideprojects
**nobody quit because it was too hard. they quit in week two**

i thought people dropped off when the material got hard. wrong. the dropoff was almost exactly
day 12 and difficulty had nothing to do with it.

two things fixed most of it. made the daily goal embarrassingly small, ten minutes. and stopped
resetting the streak on a missed day, because once someone loses a 12-day run there is nothing
left to protect and they never open it again.

has anyone found a streak mechanic that survives a missed day? ours still feels like a compromise.

## 2 — r/SideProject
**the check that caught more bugs than every test i wrote on purpose**

our curriculum lives in two places and both have to teach the same thing. 73,000 lines, 12
courses. keeping that in sync by reviewing PRs was never going to work.

so the build hashes all 12 courses and compares them screen by screen. any drift fails the build.
took an afternoon. it has caught more real problems than anything i sat down and wrote
deliberately.

general version: when two copies of something have to agree, do not test the behaviour, hash the
content. cheaper and it has no opinions.

does anyone do this for translations? feels like the same problem.

## 3 — r/iOSProgramming
**RN collapses your accessibility tree and it broke all my UI tests**

spent an evening on maestro assertions failing on text that was visibly on screen. "Annual",
"Sell", a placeholder in a text input. all there in the screenshot, none of them findable.

react native merges child text into one composite accessible element when the parent is
touchable. so the parent card exposes one blob and the individual strings disappear. placeholders
are never exposed at all.

fix was assert on the parent, not the children. the app was fine the whole time, my assertions
were wrong.

anyone got a cleaner pattern for this?

## 4 — r/reactnative
**the expo build failure that was actually a version-source problem**

lost a couple hours to builds that incremented locally but not remotely. turned out appVersionSource
was set to remote and autoIncrement was doing exactly what it was told, just not where i was
looking.

the tell: the build number in your local app.json stops matching what shows up in App Store
Connect. once you know that it is obvious. before you know it, it looks like the build is broken.

posting because i searched for this and found nothing useful.

## 5 — r/EntrepreneurRideAlong
**shipped an app where the tutorial is the product**

usual advice is get people past onboarding fast and into the real thing. we did the opposite,
because for us the lessons are the thing. 300 of them.

what surprised me was the second surface. built a practice mode to make the lessons concrete and
nearly cut it for scope. it became the reason people come back. reading that a stock can drop and
watching your own number do it are not the same experience.

the feature you build to support the main one sometimes turns out to be the retention mechanic.

anyone else had that happen?

## 6 — r/startups
**apple rejected us for something that was not in the app**

3.1.2. spent the first hour looking at the paywall, the subscription config, the entitlement
logic. all fine.

it was the app description. no URL in it. apple wants terms and privacy links in the description
text itself, not just in the app and not just in the privacy field of the console. we had them in
both of those places and none in the one that mattered.

if you are about to submit, go read your description as if you were the reviewer. that is the
only place they look for it.

## 7 — r/learnprogramming
**what a curriculum parity harness actually is, and why you might want one**

if you have the same content in two places and they have to match, reviewing the diff by hand
does not scale past about a hundred items.

what works: hash the content, compare the hashes, fail the build on drift. you are not testing
behaviour, you are asserting two things are byte-identical. it is much cheaper than it sounds and
it catches the class of bug where someone edits one copy and forgets the other.

ours covers 12 courses and it has been the highest-value hundred lines in the codebase.

## 8 — r/webdev
**the retention thing i got completely wrong**

built a learning product, assumed people quit because content was too hard. they quit at day 12,
and it was never about difficulty.

two changes moved the number. daily goal small enough to feel silly, ten minutes. and a streak
that waits through a missed day instead of resetting, because a reset streak is a reason to stop
opening the app entirely.

third thing: show position, not praise. "lesson 4 of 25" beats "well done" every time. at week
two the only question anyone has is whether this is going anywhere.

## 9 — r/androiddev
**cross-platform content parity, how do you handle it**

we ship the same curriculum on web and mobile and they have to be identical. we hash all the
content and fail the build on any drift.

works well but it is blunt. a legitimate platform-specific difference means an exception, and
exceptions accumulate.

how are people handling this? specifically curious whether anyone has something smarter than
whole-content hashing.

## 10 — r/SaaS
**where do you put the wall on an education product**

genuinely stuck on this. free tier that is actually useful, or free tier that is a teaser.

the argument for useful: nobody pays for something they have not felt the value of, and an
education product is all value-before-purchase.

the argument against: if the free thing teaches you what you needed, you are done. there is no
week four.

we keep moving it and cannot tell which side is right. anyone solved this for content products?

---

# Founder account

No product mention at all in these. If someone asks in the comments what you built, answer then.
That is a different thing from posting in order to be asked.

## 1 — r/getdisciplined
**the habit that stuck was not the one i planned**

spent months building a learning app and got the main thing wrong. i assumed people quit because
it got hard. they quit in week two, almost exactly, and difficulty had nothing to do with it.

what changed it was making the daily goal small enough to be embarrassing. ten minutes. and
counting the streak in days you showed up rather than days elapsed, so missing a tuesday does not
destroy anything.

the version that punished you for missing had people gone after the first miss. once a 12-day
streak is dead there is no reason to come back.

## 2 — r/selfimprovement
**"lesson 4 of 25" beats "well done" every single time**

learned this watching people quit something i built.

praise at the end of a session answers a question nobody is asking. position answers the only one
they actually have, which is whether this is going anywhere.

it sounds small. it was the difference between people finishing and people drifting off at week
two.

## 3 — r/Habits
**a streak that resets on a miss is worse than no streak**

counterintuitive but i have watched it happen in real usage data.

if the counter zeroes when you miss a day, the miss is not the problem. the aftermath is. someone
who had 12 days and now has 0 has nothing left to protect, so they stop entirely.

a counter that just waits keeps them. same mechanic, one rule changed, completely different
retention curve.

## 4 — r/investingforbeginners
*(answer threads here, do not post. example answer for a compound interest question:)*

the thing that makes it work is that the growth itself starts growing. $100 at 8% is $108 after a
year, but year two earns 8% on $108, not on $100.

that gap is tiny at first and ridiculous later. $100 left alone for 30 years at 8% is about
$1,000, and roughly $900 of that is growth on growth rather than your original money.

it is also why starting early beats saving more later. you cannot buy back the years.

## 5 — r/IWantToLearn
**how to actually learn finance when every resource assumes you already know the words**

the problem with most finance material is it starts three steps in. it asks whether you want a
roth or a traditional before explaining what either is.

what worked for me was going in the other direction. start with what inflation does to money
sitting in a savings account. that one concept makes almost everything downstream make sense,
because it explains why you would take any risk at all.

then compound interest. then diversification. in that order.

## 6 — r/college
**the money thing i wish someone had explained before freshman year**

not budgeting. everyone tells you to budget.

it is that money sitting still loses value. inflation is not an abstraction, it is a fee you pay
for holding cash, and nobody frames it that way when you are 18 and proud of having savings.

understanding that one thing is what made the rest of it click for me.

## 7 — r/ApplyingToCollege
**answering money questions is more useful than answering essay questions**

genuine observation from being on this sub a while. the essay advice is saturated. the financial
aid and cost-of-attendance questions get half the answers and they matter more.

if you know how this stuff works, that is where you are actually useful here.

## 8 — r/DecidingToBeBetter
**small enough to be embarrassing is the right size for a daily goal**

ten minutes. that is the number that worked.

not because ten minutes is enough to learn anything meaningful, but because the goal is not
learning on any given day. the goal is opening the thing. once it is open people usually stay
longer.

a 30-minute goal gets skipped on a bad day. a 10-minute goal does not, and a bad day that you did
not skip is worth more than a good day you did.

## 9 — r/studytips
**position beats praise**

if you are building a study system for yourself, put the progress marker where you can see it and
make it about position, not performance.

"4 of 25" tells you something. "good job" tells you nothing. when motivation dips at week two the
question is always whether this is finite and whether you are getting through it.

## 10 — r/personalfinance
*(answer threads only. shape of a good answer:)*

direct answer in the first sentence. then the mechanism, in plain words. then one concrete number
if you have one. stop.

never answer "should i buy X" or "what do i do with my $Nk". those are individual advice. answer
how things work, not what someone should do.

---

## When links become possible

Around 50 comment karma the filters stop being automatic. Then one post a week can carry
euphoriainv.com, and the posts in [REDDIT_QUEUE.md](REDDIT_QUEUE.md) are the ones to use.

Before that, a link is just a removal with extra steps.
