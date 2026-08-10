# States this run did NOT capture

Deep links reach a route's DEFAULT state only. These need a seeded store and are missing here —
listed so the gap is explicit. A route with no screenshot is an uncaptured state, not a
non-existent one (trap #6).

- every EMPTY state (needs an empty store; §1.7 requires capturing baseline first)
- every LOADING and ERROR state
- the GATE SHEET and the 17d dismissal offer (need an expired trial: 4 distinct activeDays)
- the billing-issue banner (needs `billingIssue: true` seeded)
- the streak commitment ask (needs `streakGoal: null` AND `streak >= 1`)
- paywall / plan picker (reached through onboarding?step=paywall)
- reward card reveal (needs pendingRewards)
