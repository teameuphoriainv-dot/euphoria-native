# Goldie evidence — 2026-08-31

Status: **current-Release draft, not submission-final**

The five English 6.9-inch screenshots were regenerated after the hook/raw-SVG renderer change from
the Release simulator app at
`/tmp/euphoria-goldie-derived-current-20260831/Build/Products/Release-iphonesimulator/euphorianative.app`.
The Release build, `goldie doctor`, and `goldie all` completed successfully. All outputs passed
Goldie's capture, framing, and verification stages and a human visual review.

| asset | pixels | SHA-256 | visual review |
|---|---:|---|---|
| `01-explain.png` | 1320×2868 | `890a5a54e727e9d9a4f8fa71dee11b915e65fed2d4628c28d090086052c7df7f` | pass |
| `02-home.png` | 1320×2868 | `4e210093a079ab21c23b6acae244de04b17005d20b80a0d91a310f6fb00ba279` | pass |
| `03-path.png` | 1320×2868 | `449185033314f7a21dc0c8104550a0e72d059edd5477d0cf179bfa28634db2cf` | pass |
| `04-paper-trade.png` | 1320×2868 | `450ebdbc9b5fecb22c062c35862841a1409686d5e6efd1ffae30bdce7be0f90d` | pass; `Aug 28 · 3 days ago` is date-consistent; recheck at source freeze |
| `05-atlas.png` | 1320×2868 | `61c46c981d1300683b350c78408f5b97723c9fbbaff6e582d2ba7da6b0f25411` | pass |

The draft is not final App Store evidence. Any later user-facing source change invalidates the
build-to-image relationship. After source freeze, rebuild Release, rerun all five flows, recompute
the hashes, repeat the visual review, and confirm App Store Connect ordering and device coverage.
