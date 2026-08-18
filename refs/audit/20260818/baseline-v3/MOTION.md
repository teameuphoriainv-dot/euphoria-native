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
| **CONTAMINATED** | Navigation, a dialog or a refresh landed inside the idle window. No number is reported — a plausible wrong one is worse than none. |
| **REACTIVE** | Still at rest, but answers a tap with a beat of 400ms or more. A reading screen that holds still and then responds is correct, not dead. |

## Results

`idle px` is the peak pixel count changing at rest — the metric that actually
discriminates. `payoff ms` excludes the entry transition, so it counts only
earned beats, not navigation.

`act ms` is the longest burst after tapping the primary CTA — the half the idle
columns cannot see. A route can be STATIC at rest and still animate well on touch.

| route | verdict | idle px | idle % | overall % | entry ms | payoff ms | act ms |
|---|---|---:|---:|---:|---:|---:|---:|
| `digest` | **CONTAMINATED** | 0 | 0.0 | 7.7 | 1333 | 100 | 533 |
| `options` | **CONTAMINATED** | 0 | 0.0 | 6.8 | 1233 | 267 | 0 |
| `why-not-free` | **CONTAMINATED** | 0 | 0.0 | 4.1 | 400 | 167 | — |
| `digest-slug` | **STATIC** | 0 | 0.0 | 9.0 | 233 | 0 | — |
| `news` | **STATIC** | 3163 | 1.5 | 7.4 | 1033 | 0 | — |
| `settings-account` | **REACTIVE** | 16 | 0.0 | 3.6 | 667 | 0 | 600 |
| `trade` | **REACTIVE** | 20 | 0.0 | 7.3 | 1333 | 0 | 833 |
| `stock-sym` | **OK** | 46 | 3.1 | 4.4 | 700 | 0 | 900 |
| `search` | **OK** | 51 | 25.9 | 2.4 | 267 | 267 | — |
| `learn` | **OK** | 78 | 2.7 | 1.7 | 267 | 100 | — |
| `home` | **OK** | 108 | 16.3 | 3.3 | 333 | 100 | 0 |
| `games-term-match` | **OK** | 112 | 9.0 | 2.4 | 300 | 0 | — |
| `courses` | **OK** | 249 | 3.1 | 3.3 | 300 | 267 | — |
| `league` | **OK** | 468 | 36.5 | 6.2 | 600 | 0 | — |
| `widget-tutorial` | **OK** | 560 | 86.4 | 3.2 | 700 | 0 | 400 |
| `friends` | **OK** | 600 | 34.7 | 2.7 | 367 | 0 | — |
| `chat` | **OK** | 941 | 36.7 | 2.9 | 367 | 0 | 300 |
| `you` | **OK** | 1097 | 36.7 | 7.6 | 1300 | 100 | 0 |
| `reward` | **OK** | 1275 | 32.6 | 2.1 | 267 | 267 | 100 |
| `welcome` | **OK** | 1877 | 39.7 | 8.5 | 533 | 267 | 867 |
| `lesson` | **OK** | 2039 | 37.2 | 4.7 | 333 | 133 | 200 |
| `auth` | **OK** | 2676 | 38.6 | 6.2 | 667 | 0 | 400 |
| `games` | **OK** | 3829 | 4.0 | 6.4 | 433 | 300 | — |
| `explore-compound` | **OK** | 3878 | 2.1 | 6.4 | 867 | 0 | — |
| `onboarding` | **OK** | 5119 | 38.2 | 5.9 | 533 | 233 | 1133 |
| `start` | **OK** | 5255 | 14.4 | 5.6 | 267 | 0 | 1067 |

## Summary

- **CONTAMINATED** — 3
- **STATIC** — 2
- **OK** — 19
- **REACTIVE** — 2

Mean frames-animating across measured routes: **5.1%**.

> Program target is >=15% on a release build. Competitor figures (Duolingo 31.8%, Brilliant 34.7-39.3%) are scroll-inflated and are NOT the target.
