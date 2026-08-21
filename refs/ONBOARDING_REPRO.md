# Reproducing Apple's 2.1(a) bug #1 — three attempts, NOT reproduced

> "The app became unresponsive during onboarding process."
> — App Review, Apr 9 2026, iPhone 17 Pro Max / iOS 26.4, build 1.0.0(6)

Apple's screenshot shows the onboarding header reading **"6/5"** over a blank
body with a dead Continue button — an index past the end of `STEPS`.

## Attempt 1 — RETRACTED, two false positives

Reported "BLANK BODY at step 4" and "WEDGED at steps 7-9". Both false. Screenshots
showed a fully-rendered lesson ("Why this matters", two comparison cards) and a
lesson quiz with an option already selected.

Two independent defects in the driver:

1. **It left onboarding and never noticed.** This profile has `completedAt` set, so
   onboarding's final step runs `router.back()` (onboarding.tsx:369) rather than
   routing to `/auth`. That lands on Home, where the loop tapped a course card and
   spent the rest of the run inside a lesson.
2. **Point-space bounds against content-space frames.** The blank test filtered a11y
   nodes to `120 < y < 760`. Accessibility frames for scrolled content are
   CONTENT-space — established earlier in this audit when rail cards read x=16..1600
   on a 402pt screen. On tall content every node fell outside the window, so a
   screen showing two full text cards was declared blank.

## Attempt 2 — 25 steps, no blank, gate stopped it early

Membership test required `Continue` to be present. A multi-select step with nothing
chosen does not expose Continue, so the walk halted on a real onboarding screen
("Pick as many as you like."). The negative result stands for the 25 steps actually
walked — the gate only ended the walk early, it did not manufacture a finding.

## Attempt 3 — 14 steps, then killed by a hot reload that was not mine

Ended on a React Native redbox: "Object is not a function", `home.tsx (93:14)`.
The call stack settles it:

```
Refresh.performReactRefresh, setUpReactRefresh.js:39:46
performReactRefresh, react-refresh-runtime.development.js:254:33
renderer.scheduleRefresh, backend.js:11094:37
```

That is **Fast Refresh**, which does not exist in a production build, so it cannot
be Apple's bug. `home.tsx:89-93` is ordinary correct `react-native-svg`
(`Svg`/`Circle`/`Path`). The trigger was the parallel session, which committed
`796fdf1 refs: the SVG memoisation is now verified FASTER` during the run —
swapping a memoised SVG component's identity under Fast Refresh throws exactly
this.

## OPERATIONAL FINDING — device runs are contaminated by the parallel session

Metro hot-reloads into the running app. While the other session edits app code,
**no device measurement here is trustworthy**, and the failure is not quiet: it
arrives as a redbox that a naive driver would happily classify as a crash.

Any future device work must either (a) confirm the working tree is quiet first, or
(b) treat a redbox whose stack contains `performReactRefresh` as contamination
rather than as a finding.

## Net result

**NOT REPRODUCED** across ~39 onboarding step-taps, every one double-tapped inside
the 150ms `EXIT` window specifically to strand `goTo`'s `busy` guard.

This is a weak negative, not a clearance. The reviewed build is four months old and
this profile has `completedAt` set, so the walk exercises the returning-user exit
path rather than the first-run path Apple saw.

**What actually closes the risk is the fix, not the repro:** `clampStep` (commit
`ad8c98e`) makes an out-of-range step index unreachable regardless of caller, and
`scripts/step-clamp-regression.mjs` asserts the exact 6-of-5 case. The blank screen
Apple photographed can no longer be produced by any call into `goTo`.
