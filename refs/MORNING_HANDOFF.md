# Overnight session — what actually changed, and what did not

2026-08-20 evening → 2026-08-21 06:10. Read this instead of 115 commit messages.

---

## The one thing that mattered most

**Switching from reading source to reading the running app.** Every significant find below came
from the network log, the console, the profiler or a screenshot — not from the code. Four bugs had
passed `tsc`, `npm run check` AND the accessibility tree while the screen was visibly wrong.

---

## Shipped and measured

| change | measured effect |
|---|---|
| `AmbientBackground` memoised | scroll: **131 React commits → 0** (14,629 `Circle` renders eliminated) |
| `UIcon`, `LessonArt`, `LeagueCrest` memoised | Learn screen: **256 → 114 commits (−55%)**, 1029ms → 732ms |
| News images lazy-loaded | one Trade visit: **831 KB → 10.6 KB** of images; page weight 1.18MB → 348KB |
| `NumberRollup` off per-frame state | **~70% fewer renders** (54 → 13 for XP, 54 → 17 for money) |
| Course loader cached + deduped | 20 navigations: **20 fetches → 2** of a 664KB module |
| Logo bundle resized + palette-encoded | **3.48MB → 0.79MB (−77%)**, 203 logos |
| Marks payload rounded | **464KB → 300KB**, and no longer refetched per mount |

## Correctness bugs fixed (all found on device)

- **The watchlist was never live.** It rendered the hardcoded string, so NVDA showed **$1,184.00
  against a real $217.56**. Positions above it were correct, so half the screen was live and half
  was fiction.
- **The portfolio total came from a hardcoded table.** A 12-share NVDA position rendered $14,208
  where the market said $2,611.
- **Bundled logos rendered as solid colour blocks** — a static `require()` carries an intrinsic
  size that `absoluteFill` did not constrain, so every mark was a zoomed centre-crop.
- **The 1M chart defaulted to a range this plan cannot serve**, so it showed "No data for this
  range" as its entire content. Also fixed a 22-day staleness caused by `sort=asc` truncation.
- **The same ticker showed two different prices** depending on navigation, because `/prev` and the
  grouped endpoint sit a session apart and `getQuote` wrote through `setMark`.
- **A rate-limited logo fetch was reported as "this company has no logo."**
- **`movers` fired a guaranteed-501 on every Trade tab mount.**
- **Search was duplicated** on the Trade tab — header button and tile, same destination.

## Guarded

`npm run check` gained two lanes and now runs **10 motion invariants** plus a market-pricing lane,
each with a `--selftest` asserting it catches seeded regressions AND ignores harmless edits. The
memoisations above are protected by name, because deleting a `memo()` reads as tidying in a diff.

`capture.record_transition()` now refuses to film unless the trigger provably navigated —
**three false findings tonight came from capturing the wrong screen.**

---

## NOT fixed, and why

**1. `CssInterop.View` — the largest single win available, one line, needs your dev server.**
NativeWind wraps EVERY JSX element in the app (27,956 commits, ~5,871ms self time in the lesson
flow) for a feature with **zero usage** — no `className` anywhere in `src/`. The fix keeps
NativeWind available via a per-file pragma. I applied it, measured, saw no change because Metro
caches transforms, and **reverted rather than ship something I could not verify**. To finish:
`expo start --clear`, then profile 8s idle on Home and compare `CssInterop.View` per commit against
the 136 baseline.

**2. Memory: ~85MB retained across 50 navigations.** Real, and my own profiler was ruled out
(retention was *higher* without it). Attributed by bisect: **You 0.75MB/nav, Digest 0.64, Learn
0.36, Trade 0.27** — the data-heavy screen is the cleanest. An ablation showed removing eight SVG
crests cut retention **46%**. Still unproven: whether this is dev-build retention, which cannot be
tested because a release build has no Metro connection.

**3. The app re-renders ~8×/second while idle** on every screen. Ruled out: countdowns, scroll
handlers, `setInterval`, listeners. Cause unknown, and left unknown.

**4. Eight `set-state-in-effect` lint errors.** Each read individually; none is a cascading
render. Not rewritten, because churn in effects is how subtle bugs arrive. `npm run lint` stays
red on them — downgrading the rule is your call.

**5. The IAP blocker may be misdiagnosed.** `Configuration.storekit` exists with exactly the two
product ids the app wants, and no scheme references it. The existing report blames the dashboard;
that is not established for the simulator symptom.

---

## Standing caveat

Every device measurement here is a **single run** with GC and h264 compression outside my control.
Orderings and large ratios are solid; individual figures are approximate. Where I could not
establish a cause I have written "unknown" rather than the most plausible story — three times
tonight the plausible story was wrong.
