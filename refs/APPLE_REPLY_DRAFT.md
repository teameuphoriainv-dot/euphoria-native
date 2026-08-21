# DRAFT reply to App Review — guideline 2.1(b), Information Needed

**NOT SENT.** Review and send from the Resolution Center yourself.
Submission `4a0a0bdf-0f8e-48d4-ad1f-7a5bb925a171`.

Apple's four questions, answered from the code. Every claim below is checkable:
`src/lib/purchases.ts`, `src/app/api/_entitlement.ts`, and the subscription
configuration in App Store Connect.

---

Hello,

Thank you for the review. Answers to your questions about our business model:

**1. Who are the users that will use the paid subscriptions in the app?**

Euphoria is a financial-literacy learning app for individual consumers who want
to learn how investing works. Subscribers are ordinary retail users learning at
their own pace — there is no enterprise, institutional, education-institution or
B2B tier, and no sponsored or employer-provided access. Anyone who subscribes
does so for themselves, directly in the app.

**2. Where can users purchase the subscriptions that can be accessed in the app?**

Only inside the app, and only through In-App Purchase. There is no website
checkout, no other storefront, and no other platform on which a Euphoria
subscription can be bought. The two products are:

- `euphoria_pro_monthly` — Euphoria Pro Monthly, 1 month, $9.99
- `euphoria_pro_yearly` — Euphoria Pro Yearly, 1 year, $59.99

Both are auto-renewable subscriptions in the "Euphoria Pro" subscription group,
purchased through StoreKit.

**3. What specific types of previously purchased subscriptions can a user access
in the app?**

None from anywhere else. The only subscription a user can hold is one of the two
In-App Purchase products above. The Restore Purchases control on our paywall
restores exactly those, tied to the user's Apple ID, and nothing else.

**4. What paid content, subscriptions, or features are unlocked within the app
that do not use In-App Purchase?**

None. Every paid feature in Euphoria is unlocked solely by an active In-App
Purchase subscription. There is no promo-code path, no external activation, no
account-linking that confers paid access, and no content unlocked by any payment
made outside the App Store.

The app also offers a free tier and a 3-day free trial. Both are free, device-local,
and involve no payment of any kind.

Please let us know if you need any further detail.

---

## Notes for you before sending

- **Verify claim 4 before you send it.** It is the load-bearing sentence and the
  one Apple actually cares about. Our `npm run check` suite includes
  `entitlement-regression.mjs` and `dismissal-offer-regression.mjs`, which pass,
  but I have not exhaustively audited every entitlement path for a non-IAP grant.
- Do not send this until the **Paid Apps Agreement** is active, and consider
  resolving the two 2.1(a) bugs first — 2.1(a) is the actual rejection, and
  answering 2.1(b) alone will not clear it.
