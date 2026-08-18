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
| `digest-slug` | **STATIC** | 0 | 0.0 | 18.3 | 267 | 0 |
| `trade` | **STATIC** | 27 | 2.0 | 12.6 | 900 | 233 |
| `digest` | **STATIC** | 27 | 2.0 | 14.1 | 933 | 267 |
| `learn` | **STATIC** | 49 | 3.4 | 5.6 | 267 | 233 |
| `why-not-free` | **STATIC** | 57 | 1.9 | 10.9 | 400 | 0 |
| `games-term-match` | **STATIC** | 57 | 7.4 | 5.9 | 300 | 0 |
| `home` | **STATIC** | 79 | 1.3 | 6.3 | 300 | 267 |
| `options` | **STATIC** | 248 | 3.4 | 18.1 | 1267 | 267 |
| `explore-compound` | **STATIC** | 1616 | 2.0 | 11.9 | 367 | 0 |
| `courses` | **STATIC** | 1617 | 6.7 | 8.6 | 300 | 0 |
| `news` | **STATIC** | 2327 | 5.4 | 15.7 | 567 | 0 |
| `settings-account` | **STATIC** | 4502 | 2.0 | 14.5 | 800 | 233 |
| `search` | **OK** | 54 | 23.5 | 5.2 | 233 | 233 |
| `auth` | **OK** | 148 | 54.4 | 14.4 | 600 | 233 |
| `onboarding` | **OK** | 535 | 59.1 | 15.2 | 500 | 233 |
| `friends` | **OK** | 615 | 34.9 | 5.9 | 300 | 233 |
| `chat` | **OK** | 872 | 36.5 | 6.7 | 333 | 0 |
| `start` | **OK** | 1064 | 16.8 | 20.3 | 1167 | 233 |
| `welcome` | **OK** | 1072 | 67.1 | 17.4 | 1333 | 233 |
| `widget-tutorial` | **OK** | 1268 | 51.0 | 12.6 | 867 | 0 |
| `reward` | **OK** | 1324 | 30.2 | 8.1 | 367 | 267 |
| `lesson` | **OK** | 2137 | 37.6 | 11.5 | 367 | 133 |
| `you` | **OK** | 2568 | 36.2 | 17.0 | 1300 | 233 |
| `league` | **OK** | 5711 | 35.6 | 14.8 | 467 | 233 |
| `games` | **OK** | 7990 | 12.1 | 8.1 | 233 | 0 |

## Summary

- **STATIC** — 12
- **OK** — 13

Mean frames-animating across measured routes: **12.0%**.

> Program target is >=15% on a release build. Competitor figures (Duolingo 31.8%, Brilliant 34.7-39.3%) are scroll-inflated and are NOT the target.
