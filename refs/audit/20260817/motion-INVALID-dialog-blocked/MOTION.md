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
| `friends` | **STATIC** | 3 | 0.0 | 3.0 | 267 | 0 |
| `reward` | **STATIC** | 3 | 0.0 | 3.0 | 267 | 0 |
| `stock-sym` | **STATIC** | 3 | 0.0 | 3.0 | 267 | 0 |
| `digest` | **STATIC** | 4 | 0.0 | 4.5 | 300 | 100 |
| `lesson` | **STATIC** | 4 | 0.0 | 3.0 | 267 | 0 |
| `search` | **STATIC** | 4 | 0.0 | 3.0 | 267 | 0 |
| `games-term-match` | **STATIC** | 4 | 0.0 | 3.3 | 233 | 67 |
| `settings-account` | **STATIC** | 4 | 0.0 | 4.1 | 300 | 67 |
| `auth` | **STATIC** | 5 | 0.0 | 2.6 | 233 | 0 |
| `trade` | **STATIC** | 5 | 0.0 | 3.0 | 267 | 0 |
| `you` | **STATIC** | 5 | 0.0 | 5.9 | 533 | 0 |
| `courses` | **STATIC** | 5 | 0.0 | 2.6 | 233 | 0 |
| `league` | **STATIC** | 5 | 0.0 | 5.2 | 467 | 0 |
| `chat` | **STATIC** | 5 | 0.0 | 3.0 | 267 | 0 |
| `news` | **STATIC** | 5 | 0.0 | 3.0 | 267 | 0 |
| `options` | **STATIC** | 5 | 0.0 | 6.7 | 533 | 67 |
| `explore-compound` | **STATIC** | 5 | 0.0 | 2.6 | 233 | 0 |
| `onboarding` | **STATIC** | 6 | 0.0 | 6.0 | 533 | 0 |
| `games` | **STATIC** | 6 | 0.0 | 6.4 | 467 | 100 |
| `start` | **STATIC** | 7 | 0.0 | 3.0 | 267 | 0 |
| `home` | **STATIC** | 7 | 0.0 | 2.6 | 233 | 0 |
| `digest-slug` | **STATIC** | 66 | 0.7 | 2.6 | 233 | 0 |
| `welcome` | **STATIC** | 107 | 0.7 | 6.3 | 500 | 67 |
| `learn` | **STATIC** | 209 | 0.7 | 6.0 | 533 | 0 |
| `widget-tutorial` | **STATIC** | 25323 | 6.0 | 5.6 | 267 | 233 |
| `why-not-free` | **STATIC** | 37476 | 6.0 | 5.2 | 267 | 200 |

## Summary

- **STATIC** — 26

Mean frames-animating across measured routes: **4.0%**.

> Program target is >=15% on a release build. Competitor figures (Duolingo 31.8%, Brilliant 34.7-39.3%) are scroll-inflated and are NOT the target.
