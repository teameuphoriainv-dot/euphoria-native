# Active task queue

Ordered by owner instruction 2026-08-20. Worked top-down, not in parallel.

| # | task | status |
|---|---|---|
| 1 | **Sweep remaining surfaces** — search, options, games, settings, reward. | ✅ done — all real surfaces render; both apparent failures were bad probes of mine (a non-route, and deep-linking from a pushed screen) |
| 2 | **Shrink the 300KB marks payload** | ✅ done — measured and DECIDED AGAINST restructuring: merge 241KB (20%), parallel arrays 216KB (28%), gzip 131KB (56%). Compression wins and costs no schema change; production is Cloudflare-fronted so the 300KB is a dev artifact. Rationale recorded in market+api.ts |
| 3 | **Profile render performance** — `get_react_renders` / `start_profiling`. The class of problem behind the reported drag stutter. | ⏳ in progress |

**Not doing:** consolidate-and-stop (owner: "never do #1").

---

## Overnight queue (self-paced loop, 2026-08-20 → morning)

| # | task | status |
|---|---|---|
| 4 | **Make the nav check unskippable** — `record_transition()` refuses to film unless the trigger provably navigated. | ✅ done |
| 5 | **Memoisation sweep** | ✅ done — only 2 clean candidates remain (`AtlasMarkBody`, `CelebrationRays`, both small). The rest take arrays/objects where shallow compare cannot help. |
| 6 | **Measure the memo wins** | ✅ done — A/B on the Learn screen (profiler works there; only lessons break it). Pre-memo 256 commits / 1029ms → memoised 114 / 732ms. **−55% commits, −29% duration**, and −55 to −61% on every SVG component. |
| 7 | **Profile home and digest** — the two surfaces not yet profiled. | ⬜ next |
| 8 | **Understand CssInterop.View** — 27,956 commits in the lesson flow, second-largest self cost. | ⬜ |

## Method in force
1. Runtime first — network log and console before reading source.
2. Navigation verified by label diff before trusting any capture — now enforced by `record_transition`.
3. Confounds tested before anything is called a defect.
4. Device work batched into single launches.
5. Ship on verified-safe; never claim verified-faster without the measurement.
