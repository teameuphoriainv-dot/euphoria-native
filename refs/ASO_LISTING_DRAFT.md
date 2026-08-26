# App Store listing — ASO draft

App `6761808087` · "Euphoria: Learn to Invest"

**Nothing here has been applied to the listing.** These are drafts to paste into App Store Connect.
Character counts are verified by `scripts/aso-count.mjs`, which is wired into `npm run check`.

> That sentence used to be a lie. The script it named did not exist, so every count in this file had
> in fact been estimated by eye. Written 25 Aug, when the script was finally built to match the
> claim. A document asserting a verification that never ran is the same failure class as a stale
> constant, and it gets the same treatment.

⚠️ **I have not read what is currently live on the listing.** Everything below is written from the
app's actual features. Before pasting, compare against what is already there — some of it may
already be better, and metadata changes on a rejected submission can be edited freely without
starting a new review.

---

## App Name — limit 30

```
Euphoria: Learn to Invest
```

Unchanged from what you have. It already does the right thing: brand first, then the highest-volume
phrase you can plausibly rank for. Changing it costs you whatever ranking history it has, for no
clear gain.

## Subtitle — limit 30

```
Stock Market Course & Practice
```

The subtitle is indexed for search at nearly the weight of the name, so it should carry keywords
the name does not. This one adds **stock**, **market**, **course**, **practice** — four new terms —
while still describing the app truthfully.

## Keywords field — limit 100

```
investing,money,trading,beginner,portfolio,finance,wealth,budget,simulator,etf,options,teen,401k
```

Three rules applied:

1. **No spaces after commas.** A space costs a character and buys nothing.
2. **No word repeated from the name or subtitle.** Apple already indexes those. Repeating *stock*,
   *learn*, *invest*, *course* or *practice* here would waste roughly a third of the field.
3. **No plurals of words already present.** Apple stems, so *stocks* is redundant next to *stock*.

## Promotional text — limit 170

```
Learn investing in minutes a day. Real lessons, a risk-free practice portfolio, and Atlas, your AI guide. Build a streak, climb the league, finally understand money.
```

Promotional text is **not indexed for search** but sits above the description and can be changed
**without submitting a new build** — the only listing field with that property. Use it for whatever
is current.

## Description — first 3 lines are what people actually read

The hook stays, because it is what a human reads. The sentence immediately after it is new, and it
is there for the machines: see the AEO section below for why an app has to be liftable in one
sentence to be recommended by an answer engine at all.

```
Investing is not complicated. It is just badly explained.

Euphoria is an investing education app for teenagers and complete beginners, aged 13 and up. It teaches how money and markets actually work through short daily lessons and a practice portfolio that uses simulated money, never real money. There is no brokerage account, no deposits, and nothing real to lose.

WHO IT IS FOR
Anyone starting from zero. Students, first-time investors, and anyone who has nodded along to a conversation about index funds and quietly had no idea what one is. No jargon, no lectures, no assumed knowledge.

HOW IT WORKS
Short lessons you can finish in five minutes a day. Build a portfolio with practice money and watch what actually happens to it over time. Ask Atlas, your AI guide, anything a lesson raises that you would feel awkward asking a person.

WHAT MAKES IT DIFFERENT
- Simulated money only. You cannot deposit, withdraw, or lose anything real.
- Built for beginners aged 13 and up, not for active traders.
- An AI guide that answers in plain language, in context, while you learn.
- Twelve full courses, from personal finance through to derivatives.

WHAT YOU WILL LEARN
- How stocks, ETFs and index funds actually work
- What compound growth does over time, and why starting early matters so much
- Options and derivatives, explained without the intimidation
- How to read the market without doom-scrolling it

KEEP THE STREAK
A daily streak, XP, levels and a weekly league against other learners. Your streak, XP and league place are free forever and never expire.

WHAT IT COSTS
Start with a 3-day free trial with everything unlocked. The trial counts days you actually use the app, so nothing is lost if life gets in the way. After that, Euphoria Pro unlocks the full lesson library, guides, unlimited Atlas, the practice portfolio and the market screens.

Euphoria is an education product. It is not a brokerage and not financial advice. No real money is ever involved.
```

---

## AEO — being the app an answer engine names

Traditional ASO optimises for Apple's keyword index. AEO optimises for being **cited inside the
answer** when someone asks ChatGPT, Perplexity, Claude or Google AI Overviews for an app. These are
different problems and the second one is not solved by the keyword field at all.

**What actually decides it, from the research:**

1. **LLMs build app recommendations from two inputs**: what they absorbed in training, and what they
   retrieve from the web in real time. The App Store listing is only one of those, which means
   euphoriainv.com carries as much AEO weight as this page does. Entity consistency across both is
   not optional.
2. **Query fan-out.** A model does not treat "best app to learn investing" as one keyword search. It
   expands the prompt into several inferred interpretations and retrieves against each. You are
   matched against interpretations, not against a phrase.
3. **The decisive one: AI assistants surface only apps they can confidently attribute to a specific
   use case.** Not a category. A use case. "Finance education app" loses to "learn investing as a
   teenager using a simulated portfolio with no real money" every time, because only the second can
   be repeated inside an answer without the model risking being wrong.
4. **Title, subtitle, category and description are the primary classification signals**, and stable
   metadata reduces misclassification. Churning them is itself a cost.

**What changed in the description above, and why:**

| Change | Reason |
|---|---|
| Added one liftable definition sentence, second paragraph | Gives a model a single quotable string carrying category, audience, mechanism and differentiator at once. Without it there was nothing to cite. |
| Stated the audience in prose, "teenagers and complete beginners, aged 13 and up" | The word *teen* previously appeared only in the keyword field, which no LLM reads. Asked for a teen investing app, nothing in the listing said so. Safe to state: `AGE_FLOOR` is 13 and onboarding gates under-13 honestly. |
| Section headers rewritten as the questions people ask | WHO IT IS FOR, HOW IT WORKS, WHAT MAKES IT DIFFERENT map onto the fan-out interpretations of an app-recommendation prompt. Answer-first structure is the core AEO pattern. |
| Differentiators pulled into a discrete list | Each line is independently quotable. A model matching "no real money" or "for beginners" finds a clean string rather than having to infer it from a paragraph. |
| "no real money" stated three separate ways | It is simultaneously the top differentiator, the parent-safety answer, and the App Store compliance point. Worth the repetition here even though rule 1 forbids it on a screen. |

**The two things this file cannot fix, and they matter more than the copy:**

- **Web presence is half the input.** An LLM retrieving in real time reads euphoriainv.com, reviews,
  and any press. If the site does not describe the app in the same terms as this listing, the model
  sees two entities and trusts neither. Aligning the site is a bigger AEO lever than any word here.
- **The app is not on the store.** Nothing here can be cited, retrieved, or recommended until it
  ships. That remains the single biggest lever, exactly as the previous draft said.

---

## The honest ASO caveats

- **Keywords are a guess without data.** I picked these from what the app genuinely does and from
  ordinary search behaviour. I have no volume or difficulty numbers, and I did not have App Store
  Connect open. Treat the keyword field as v1 to iterate on once you can see impressions.
- **The single biggest ASO lever here is not text.** It is that the app has been rejected since
  April and is not on the store at all. Nothing in this file matters until it ships.
- **Screenshots outrank text.** Store shot 3 still shows a losing portfolio (Unit 16, open). That
  one image costs more conversion than any keyword choice on this page.
