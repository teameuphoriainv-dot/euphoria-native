# Paywall status — 2026-08-23. The config is CORRECT. Rewrite of §4.2.

`refs/NEXT_SESSION.md` §4.2 carried this as open: "RevenueCat's offering → package → product mapping
has never been verified end to end against the now-valid products." It has now been verified, from
the live API, and **it is correct**.

## RevenueCat, read from the live offerings endpoint
Queried with the app's own PUBLIC SDK key — no secret key needed for this:
`GET https://api.revenuecat.com/v1/subscribers/<probe>/offerings`, `X-Platform: ios`.

```json
current_offering_id: "default"
packages: [
  { "identifier": "$rc_monthly", "platform_product_identifier": "euphoria_pro_monthly" },
  { "identifier": "$rc_annual",  "platform_product_identifier": "euphoria_pro_yearly"  }
]
```

- A **current** offering exists (`default`) — an offering with no `current` is the usual cause of
  empty packages, and it is not this.
- **Both** products are attached.
- The package identifiers are exactly what `purchases.ts:67` matches on (`$rc_annual` / `$rc_monthly`).
- The product ids match App Store Connect exactly.

## App Store Connect, read from the API
- `euphoria_pro_monthly` and `euphoria_pro_yearly`, both `READY_TO_SUBMIT`, group `Euphoria Pro`.
- **175 price points** and **175 introductory offers** each.
- The intro offer is genuinely `FREE_TRIAL / THREE_DAYS / x1`.
- Yearly raised to $79.99 in all 175 territories on 2026-08-23, so the app and the store now agree.

## So why does `[iap] configured but the current offering has NO packages` fire?
**Because every observation of it has been on the SIMULATOR.**

`getPackages()` returns `offerings.current?.availablePackages`. RevenueCat FILTERS OUT any package
whose underlying StoreKit product cannot be fetched. iOS Simulator cannot fetch App Store products
at all without a local StoreKit configuration file, and this project has none. So on a simulator the
list is empty **no matter how correct the configuration is** — which is exactly the §3.1 failure
class inverted: a correct system producing an alarming-looking signal.

That error has been read all day, including by me, as evidence the paywall is dead. It is not
evidence of anything except that a simulator is a simulator.

## What is STILL genuinely unproven
**No purchase has ever completed, anywhere.** Verified config is not a verified purchase. Until
someone taps buy on a real device with a sandbox account and receives an entitlement, the path is
untested end to end. That is now the ONLY open question on this surface, and it needs a human with
a phone — build 15 is on TestFlight.

## Two cheap ways to settle it
1. **Sandbox purchase on a device.** Build 15, a sandbox Apple ID, tap buy. The error — or the
   entitlement — answers everything.
2. **Add a StoreKit configuration file** so the simulator can fetch products locally. That would
   make this testable without a device and stop the misleading log. Not done: it needs the products
   exported from ASC and a scheme change, and `ios/` is gitignored CNG output.
