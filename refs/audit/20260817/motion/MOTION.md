# Per-route motion audit

26 routes. One 9s recording each: entry window 1.0-3.5s, idle window 4.0-9.0s.
All clips re-encoded to CFR 30fps before measurement (VFR inflates the ratio).

## Verdict bands

| verdict | meaning |
|---|---|
| **DEAD** | No burst anywhere. Nothing moves on arrival or at rest. |
| **STATIC** | Animates on entry, then flat. Idle is inert. |
| **OK** | Sustained motion at rest, but longest burst < 400ms — under the structural ceiling. |
| **GOOD** | A burst over 400ms exists: a real payoff beat. |
| **UNREACHABLE** | The harness could not reach or record the route. A tooling defect, **not** a motion finding. |

## Results

`idle px` is the peak pixel count changing at rest — the metric that actually
discriminates. `payoff ms` excludes the entry transition, so it counts only
earned beats, not navigation.

| route | verdict | idle px | idle % | overall % | entry ms | payoff ms |
|---|---|---:|---:|---:|---:|---:|
| `digest-slug` | **STATIC** | 0 | 0.0 | 24.2 | 267 | 233 |
| `why-not-free` | **STATIC** | 0 | 0.0 | 26.7 | 400 | 267 |
| `options` | **STATIC** | 2 | 0.0 | 12.3 | 667 | 233 |
| `chat` | **STATIC** | 5 | 0.0 | 5.2 | 267 | 267 |
| `explore-compound` | **STATIC** | 7 | 0.0 | 12.6 | 400 | 267 |
| `reward` | **STATIC** | 9 | 0.0 | 6.7 | 267 | 267 |
| `auth` | **STATIC** | 12 | 0.0 | 15.6 | 767 | 267 |
| `games` | **STATIC** | 13 | 0.0 | 11.5 | 767 | 267 |
| `widget-tutorial` | **STATIC** | 13 | 0.0 | 14.8 | 333 | 233 |
| `courses` | **STATIC** | 14 | 0.0 | 10.8 | 733 | 233 |
| `home` | **STATIC** | 18 | 0.0 | 6.3 | 333 | 233 |
| `trade` | **STATIC** | 21 | 1.3 | 1.5 | 133 | 133 |
| `digest` | **STATIC** | 22 | 1.3 | 3.0 | 267 | 267 |
| `learn` | **STATIC** | 27 | 1.3 | 3.7 | 267 | 267 |
| `news` | **STATIC** | 39 | 1.4 | 16.8 | 833 | 267 |
| `games-term-match` | **STATIC** | 60 | 4.7 | 6.7 | 333 | 267 |
| `stock-sym` | **STATIC** | 61 | 4.0 | 7.4 | 667 | 0 |
| `settings-account` | **STATIC** | 201 | 0.7 | 9.0 | 567 | 233 |
| `search` | **OK** | 49 | 26.2 | 8.2 | 467 | 267 |
| `league` | **OK** | 277 | 49.0 | 13.8 | 1000 | 233 |
| `friends` | **OK** | 307 | 49.0 | 5.9 | 300 | 233 |
| `you` | **OK** | 361 | 49.7 | 3.7 | 267 | 267 |
| `onboarding` | **OK** | 868 | 58.4 | 13.7 | 600 | 267 |
| `lesson` | **OK** | 1037 | 62.4 | 11.5 | 767 | 267 |
| `welcome` | **OK** | 1219 | 61.7 | 17.0 | 533 | 267 |
| `start` | **OK** | 2107 | 19.5 | 17.8 | 667 | 233 |

## Summary

- **STATIC** — 18
- **OK** — 8

Mean frames-animating across measured routes: **11.0%**.

> Program target is >=15% on a release build. Competitor figures (Duolingo 31.8%, Brilliant 34.7-39.3%) are scroll-inflated and are NOT the target.
