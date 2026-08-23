# The rebuilt web lesson engine — reference for iOS
Captured live 2026-08-23 from `euphoriainv.com/app`, **Personal Finance → "Why Personal Finance
Matters"**, released by the cofounder in `euphoriaweb@ac648e8f` hours earlier.

Same lesson title as iOS. Almost nothing else is the same.

## Head-to-head

| | web (rebuilt) | iOS (current) |
|---|---|---|
| steps | **15** | **27** |
| card meta | "6 min · Beginner" | "Lesson 1 of 25 · 30 XP" |
| Atlas | **a conversational tutor that drives the lesson** | decoration on the intro screen only |
| in-lesson nav | `✕` close **and `‹` back** | `✕` close only |
| audio | speaker toggle, browser speech synthesis (free per utterance) | none |
| progress | top bar for the lesson **plus a sub-bar for the current phase** | one top bar |
| per screen | ONE idea, ONE button | a step body plus a pinned Continue |

## The conversational frame
Every screen is: Atlas avatar (left) → speech bubble (right) → **one** action button beneath it.
The button's LABEL is the next action, never a generic "Continue":

> "Right, let's get the vocabulary down. There are 6 terms in this lesson. I'll teach you each one
> first, then I'll test you on them."  → **`Teach me →`**

Then, per term, the bubble becomes a three-part card and the button becomes `Next →`:

> **Personal Finance**
> The holistic management of your money: earning, spending, saving, investing, and protecting your
> financial future.
> *Creating a budget, building an emergency fund, and starting a retirement account are all personal
> finance activities.*

**term / definition / italic example.** The sub-progress bar above the bubble tracks 1..6 through the
terms, so the learner can see the phase ending.

## What transfers to iOS, and why
1. **Atlas as the narrator, not the mascot.** iOS already has a full Atlas with nine expressions and
   an `AtlasSpeech` bubble — it uses them for one line on the intro and then hides them. The web
   spends the same asset across the whole lesson.
2. **Teach-then-quiz vocabulary.** iOS has `keyTermsCards` and shows the terms as a flat
   "YOU'LL LEARN: Asset · Return · Inflation" line on the intro. The web teaches each one and then
   tests it. Same content, ordered as instruction.
3. **Name the button after the action.** `Teach me` / `Next` beats `Continue` on every screen.
4. **A back control inside the lesson.** iOS can only leave; it cannot step back.
5. **27 → ~15.** The cofounder's commit says lesson 1 of Investing Fundamentals was rebuilt "as ten
   steps the learner acts on". Personal Finance 1 came out at 15. iOS's 27 is the un-rebuilt corpus
   and is the most likely source of **N5** ("the $1,000 emergency question shows up more than once").

## Do NOT rebuild the iOS corpus by hand
Per the owner, 2026-08-22: wait for the cofounder to finish, then re-sync the curriculum. There is
already a `fix/resync-curriculum` branch on euphoria-native. Copying content across by hand would
create a third version of every lesson.

## Also worth knowing
His commit fixed grading bugs that were **silent in production**, and iOS may share the logic:
- `fillBlank` compared a SHUFFLED display index against the AUTHORED correct index — a wrong answer
  was marked correct **and recorded as passed**.
- A comparison graph read slider 0 as a stock-allocation percent while lesson 1 fed it dollars, so
  the slider did nothing between $30k and $150k.
- All 198 slider steps printed the same hardcoded paragraph regardless of the question.

UNVERIFIED on iOS. Worth checking during the re-sync rather than assuming.
