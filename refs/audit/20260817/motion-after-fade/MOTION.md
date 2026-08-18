# Per-route motion audit

25 routes. One 9s recording each: entry window 1.0-3.5s, idle window 4.0-9.0s.
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
| `digest-slug` | **STATIC** | 0 | 0.0 | 29.5 | 367 | 233 |
| `widget-tutorial` | **STATIC** | 0 | 0.0 | 16.6 | 367 | 233 |
| `chat` | **STATIC** | 7 | 0.0 | 7.1 | 367 | 267 |
| `options` | **STATIC** | 8 | 0.0 | 14.2 | 1033 | 233 |
| `auth` | **STATIC** | 9 | 0.0 | 13.8 | 1000 | 233 |
| `reward` | **STATIC** | 13 | 0.0 | 6.7 | 367 | 233 |
| `settings-account` | **STATIC** | 15 | 0.0 | 10.1 | 467 | 0 |
| `games` | **STATIC** | 16 | 0.0 | 12.2 | 633 | 267 |
| `explore-compound` | **STATIC** | 16 | 0.0 | 11.5 | 333 | 0 |
| `home` | **STATIC** | 24 | 0.7 | 6.3 | 333 | 233 |
| `trade` | **STATIC** | 25 | 0.7 | 11.2 | 767 | 233 |
| `courses` | **STATIC** | 25 | 0.7 | 8.1 | 500 | 233 |
| `learn` | **STATIC** | 44 | 2.7 | 4.8 | 233 | 233 |
| `news` | **STATIC** | 48 | 1.4 | 16.8 | 867 | 233 |
| `games-term-match` | **STATIC** | 83 | 4.7 | 6.7 | 333 | 267 |
| `digest` | **STATIC** | 195 | 4.7 | 13.4 | 933 | 267 |
| `why-not-free` | **STATIC** | 255 | 1.2 | 9.0 | 367 | 233 |
| `search` | **OK** | 54 | 24.8 | 10.4 | 333 | 233 |
| `league` | **OK** | 313 | 49.7 | 15.2 | 1033 | 267 |
| `friends` | **OK** | 372 | 50.0 | 6.7 | 367 | 233 |
| `onboarding` | **OK** | 555 | 57.7 | 15.6 | 1000 | 233 |
| `you` | **OK** | 666 | 53.7 | 14.5 | 1000 | 233 |
| `welcome` | **OK** | 1033 | 67.8 | 17.0 | 1300 | 233 |
| `lesson` | **OK** | 1049 | 67.8 | 9.3 | 433 | 233 |
| `start` | **OK** | 1225 | 12.1 | 15.9 | 600 | 233 |

## Summary

- **STATIC** — 17
- **OK** — 8

Mean frames-animating across measured routes: **12.1%**.

> Program target is >=15% on a release build. Competitor figures (Duolingo 31.8%, Brilliant 34.7-39.3%) are scroll-inflated and are NOT the target.
