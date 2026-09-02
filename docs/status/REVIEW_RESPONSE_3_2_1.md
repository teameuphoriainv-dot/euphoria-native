# Prepared response — Guideline 3.2.1(viii)

Draft reply for App Review's Resolution Center **if** a reviewer questions whether Euphoria falls
under *"apps used for financial trading, investing, or money management should be submitted by the
financial institution performing such services and must have necessary licensing."*

This has **not** happened. Build 24 cleared the automated 3.1.2 gate and is with a human reviewer;
this exists so a reply takes minutes rather than a scramble.

Everything below is verifiable inside the app. Do not soften it and do not add claims — every
sentence here can be checked by the reviewer in under two minutes, which is the whole point.

---

## The reply

> Thank you for the review.
>
> Euphoria does not perform financial services and does not require licensing, because no
> financial transaction of any kind occurs in the app.
>
> **There is no real money anywhere in Euphoria.** The app contains no brokerage account, no
> deposits, no withdrawals, no funding mechanism, no securities transactions, and nothing
> redeemable for money or goods. There is no path — in the app, on our website, or through any
> partner — by which a user can convert anything in Euphoria into money, or money into anything
> in Euphoria. The only payment in the app is the Euphoria Pro subscription, purchased through
> Apple In-App Purchase, which unlocks educational content.
>
> **The portfolio is a simulator.** Every account begins with $10,000 of virtual cash that we
> issue and that cannot be topped up, cashed out, or transferred. Market data is used to make the
> simulation realistic for teaching purposes only. The Trade tab states this on screen, above the
> fold: *"You have $10,000 in practice cash and no positions yet. Nothing here is real money."*
> The tab's own subtitle reads *"Build a practice portfolio. Risk nothing."*
>
> **Atlas does not give investment advice.** It explains concepts. The disclosure
> *"Atlas uses Google Gemini. General concepts, not personal advice"* is displayed on the Atlas
> screen. Beyond the system prompt, a server-side output guard refuses individualised
> recommendations before they reach a user: a response is refused when a directive aimed at the
> reader co-occurs with a specific security. That guard runs on our server, not on the device, so
> it cannot be bypassed by a modified client.
>
> **The product is educational.** Twelve courses of 25 lessons each, 300 lessons total, aimed at
> beginners aged 13 and up. It is listed in Education, rated 12+. Lesson content teaches how
> markets, budgeting and accounting work; it does not recommend securities or strategies to buy.
>
> To confirm any of the above, sign in with the review credentials and open the Trade tab: the
> practice-cash disclosure is visible immediately, and no deposit, withdrawal or funding control
> exists anywhere in the interface.
>
> We are happy to answer any further questions.

---

## Where each claim is verifiable

| Claim | Where the reviewer sees it |
|---|---|
| Simulated money only | Trade tab: *"You have $10,000 in practice cash… Nothing here is real money."* |
| Not a brokerage | Trade tab subtitle: *"Build a practice portfolio. Risk nothing."* |
| No advice from Atlas | Atlas screen footer: *"General concepts, not personal advice."* |
| Educational framing | Trade tab: *"Teaching examples drawn from your own portfolio. Never financial advice."* |
| No real-money path | No deposit, withdrawal, funding or cash-out control exists in any screen |
| Only payment is IAP | Paywall, Apple In-App Purchase, $9.99/mo or $79.99/yr |

## The guard, described accurately

`src/lib/server/advice.ts` is an **output** guard, not a prompt instruction. It runs server-side in
the chat API route, so a modified client cannot skip it.

Its discriminator is deliberate and worth stating correctly if asked: it does **not** block the
word "buy" — the entire curriculum is about buying things, and Atlas explaining *"when you buy a
share of Apple you own a slice of the company"* is the product working. A response is refused only
when a **directive aimed at the reader** ("you should", "I'd") co-occurs with a **specific
security**. Education describes; advice instructs. Both halves must be present.

If asked about its limits, say so plainly: it is a regex over English, it will miss paraphrases,
and it is defence-in-depth *under* the system prompt rather than a replacement for it. Overstating
a guard to a reviewer is worse than describing its ceiling honestly.

## What not to say

- Do not claim any licence, registration or regulatory status. Euphoria has none and needs none,
  and implying otherwise is a far worse problem than the guideline question.
- Do not describe the paper-trading desk as "investing" or "trading" without the word *simulated*
  or *practice* attached.
- Do not promise features or changes that are not already shipped in the reviewed build.
