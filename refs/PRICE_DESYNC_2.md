# LIVE PRICE DESYNC — found 2026-08-23, NOT FIXED, needs an owner decision

Queried from App Store Connect directly. Both problems are about the same screen.

## 1. The USA price the app advertises is not the price Apple will charge
| | |
|---|---|
| App Store `euphoria_pro_yearly`, USA | **$59.99 / year** |
| `onboarding.tsx` PRICING advertises | **$79.99 / year** |

`refs/PRICE_DESYNC.md` records this EXACT mismatch being found on 2026-08-20. What happened next is
the important part: the app's number was raised from $59.99 to $79.99 with written peer-benchmark
reasoning — **and the App Store price was never raised to match.** The fix went one way only, and
`pricing-pin.mjs` cannot see it, because its own header says so: "A store/app mismatch is not
something a local test can see."

Everything derived from that number is also wrong:
- "Works out at **$6.67** a month" — at $59.99 it is **$5.00**
- "SAVE **33%**" — at $59.99 against $9.99/mo it is **50%**

Monthly is fine: ASC $9.99, app $9.99.

## 2. A hardcoded USD price is shown to EVERY territory
ASC carries a proper local price per territory:

| territory | ASC yearly |
|---|---|
| USA | 59.99 |
| GBR | 59.99 |
| CAN | 79.99 |
| AUS | 99.99 |
| IND | 5900 |

`onboarding.tsx` renders the literal string `$79.99` to all of them. A user in India sees "$79.99"
and is charged ₹5,900. This is the §4.2 failure class stated exactly: "The paywall renders those
regardless of what the store returns, so a completely broken purchase path looks perfectly healthy."

## What IS correct
- Both products `READY_TO_SUBMIT` in group `Euphoria Pro` (22020937), ids and periods match
  `purchases.ts`.
- **175 price points and 175 introductory offers** on each product.
- The intro offer is `FREE_TRIAL / THREE_DAYS / x1` — the paywall's "3 days free" is honest.

## The decision, which is the owner's
Misstating a subscription price on the purchase screen is an App Review problem, and this app
already carries an open guideline rejection. Three options:

1. **Raise ASC to $79.99** so the store matches the app's deliberate, documented pricing.
2. **Lower the app to $59.99** and update the derived badge (SAVE 50%) and per-month ($5.00).
   `pricing-pin.mjs` enforces that arithmetic, so it will fail loudly if only one is changed.
3. **Render the REAL StoreKit price** from the RevenueCat package instead of a constant. This is the
   only option that also fixes problem 2, and the only one that cannot drift again. It depends on
   RevenueCat returning packages, which it currently does not.

Not changed on my own initiative: this is money.
