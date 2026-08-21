# LAUNCH BLOCKER — the app's paywall and App Store Connect disagree on the annual price

Found 2026-08-20 by capturing the live paywall on device and comparing it with the
configured products.

| | Monthly | Annual | Annual per month | Badge |
|---|---|---|---|---|
| **App UI** (`onboarding.tsx:72-77`) | $9.99 | **$79.99** | $6.67 | "SAVE 33%" |
| **App Store Connect** (`euphoria_pro_yearly`, 6761810312) | $9.99 | **$59.99** | $5.00 | would be 50% |

Monthly agrees. **Annual does not.** The paywall tells the user $79.99/yr; StoreKit
would charge $59.99. Verified on device — the live paywall reads:

> `3 DAYS FREE · SAVE 33%, Annual, Works out at $6.67 a month, $79.99, per year`
> `3 days free, then $79.99 per year, billed annually.`

## Why this matters beyond the money

Misstating a subscription price on the purchase screen is an App Review problem in
its own right, and this app is **already** sitting on an open 2.1(a) rejection. Do
not resubmit with the two numbers disagreeing.

## Which number is right — the codebase's, not mine

`onboarding.tsx:54-70` records a deliberate decision, dated 2026-08-07, taken from
**five real captured competitor paywalls** (§22 C29/C31):

- monthly $9.99 is mid-pack: above Quizlet $7.99, below Bloom $15, far below Astra AI $24
- annual **RAISED from $59.99 to $79.99**: at $59.99 the annual was $5.00/month-equivalent
  against a **peer median near $7.90**, roughly 37% under — "money left on the table"
- $79.99 is $6.67/mo, deliberately below the median because Bloom's $15 buys a real
  brokerage and Euphoria's buys paper trading

Three files depend on $79.99: `onboarding.tsx`, `dismissal-offer-sheet.tsx:20`,
`trial-reward-sheet.tsx:23` — the latter two say "C31 locks annual at $79.99".

### My competitor research today was worse, and reached the opposite answer

Earlier this session I recommended $59.99 from a web search of Blossom, Bloom,
Duolingo and Brilliant, and told the owner that $79.99 "was too high". That was
wrong on the evidence:

- I anchored on Blossom's $59.99 as "the true comparable". The codebase comment
  anticipates exactly this mistake: *"compared us against the single most expensive
  comparable rather than the set"* — same error, opposite direction.
- I used secondhand review-site figures. C29/C31 used five paywalls captured
  firsthand, and included app-store learning comparables (Quizlet, Astra AI) that my
  search never surfaced.

**Treat $79.99 as the intended price.** The likely fix is one field in App Store
Connect, not a three-file code change.

## NOT CHANGED, deliberately

The owner approved "$9.99 / $59.99" earlier today — but that approval rested on my
research, which I now know to be the weaker of the two analyses. Price is a
commercial decision with documented reasoning on the other side, so I have not
touched it. **This is the first thing to settle in the morning.**

## Knock-on: the review screenshot is on hold

`euphoria_pro_monthly` still has no App Review screenshot (verified: the Review
Information section is fully expanded in the DOM, shows an empty "Choose File", and
carries no image element). I captured the live paywall to upload for it — and then
did not upload it, because **it shows $79.99 while the configured product is
$59.99**. Sending App Review a screenshot that contradicts the product price would
make things worse. Upload it once the prices agree.

Capture is at `/tmp/paywall_review.png` if the resolution goes the $79.99 way.
