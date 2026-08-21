# Active task queue

Ordered by owner instruction 2026-08-20. Worked top-down, not in parallel.

| # | task | status |
|---|---|---|
| 1 | **Sweep remaining surfaces** — search, options, games, settings, reward. Navigate verified, then read network + console. | ⏳ in progress |
| 2 | **Shrink the 300KB marks payload** — gzip at the proxy, or return only surfaceable tickers. Measure both first. | ⬜ queued |
| 3 | **Profile render performance** — `get_react_renders` / `start_profiling`. The class of problem behind the reported drag stutter. | ⬜ queued |

**Not doing:** consolidate-and-stop (owner: "never do #1").

## Method in force
1. Runtime first — network log and console before reading source.
2. Navigation verified by label diff before trusting any capture.
3. Confounds tested before anything is called a defect.
4. Device work batched into single launches.
