# Euphoria

A finance-education iOS app for 18–25s. Twelve courses, three hundred lessons, a paper-trading desk,
a daily digest, and **Atlas** — the mascot who asks the onboarding questions and answers the ones you
ask back.

The teaching model is a learning app's, not a brokerage's: a streak, a daily goal, quests, a league,
and a pathway that unlocks as you go. That is deliberate — see [Peer group](#peer-group) below.

> **Status: pre-release.** Not on the App Store. A 2.1b rejection is open and the reply draft is
> awaiting approval; the Paid Applications Agreement is unsigned, so no in-app purchase can
> transact. See [Known blockers](#known-blockers).

---

## Contents

- [Stack](#stack) · [Layout](#layout) · [Getting started](#getting-started)
- [The gate](#the-gate) — how this repo decides a change is safe
- [Driving the simulator](#driving-the-simulator)
- [Where the reasoning lives](#where-the-reasoning-lives)
- [Product facts](#product-facts) · [Known blockers](#known-blockers)
- [Changelog](CHANGELOG.md) — all 365 commits

---

## Stack

| | |
|---|---|
| Runtime | Expo SDK `~57.0.7`, React Native `0.86.0`, React `19.2.3` |
| Routing | `expo-router` `~57.0.7` — file-based, 33 route files under `src/app` |
| Language | TypeScript `~6.0.3`, strict |
| State | `zustand` `^5.0.14`, persisted to `AsyncStorage` under `euphoria-app-state` |
| Motion | `react-native-reanimated` `4.5.0` |
| Billing | `react-native-purchases` `^10.7.0` (RevenueCat) |
| Analytics | `posthog-react-native` `^4.62.0` — funnel only, no autocapture, no session replay |
| Drawing | `react-native-svg` `15.15.4` — Atlas is SVG, not an image |

Identifiers, which have been re-derived wrong more than once and are settled:

- **Bundle id `com.euphoriainv.euphoria`** on iOS.
- **App Group `group.com.euphoriainv.euphoria`** — in `app.json`, `src/lib/widget.ts`, and
  `targets/widget/index.swift`. All three must agree or the widget reads nothing.
- `android.package` stays `com.euphoria.native` on purpose. Google Play is a separate listing.

## Layout

```
src/
  app/          33 routes. expo-router file-based; (tabs) is the signed-in shell
  components/   48 components. gate-sheet, trial-reward-sheet, atlas, lesson-*
  lib/          31 modules. store, entitlement, purchases, analytics, cost-basis, curriculum/
  constants/    theme tokens — Spacing, Radius, FontSize. Never hardcode a number these own
  hooks/        useTheme and friends
  shared/       motion primitives (SpringPressable, NumberRollup, RewardPop)
scripts/        the gate, the simulator driver, curriculum sync
refs/           MASTER_PLAN.md, CARRYOVER.md, audit findings, store assets
targets/widget/ the iOS widget, Swift
```

### Modules worth knowing before you edit

| file | why it matters |
|---|---|
| `lib/entitlement.ts` | The **single** authority on trial/expired/pro. `tier()` orders pro first, so a payer never sees a countdown. |
| `lib/cost-basis.ts` | The **one** copy of the holdings math. Keep it erasable-syntax-only — a regression imports it under Node, which strips types rather than compiling them. |
| `lib/trial-reward.ts` | Same pattern, for the 17c offer gate. Dependency-free so it can be tested. |
| `lib/store.ts` | 822 lines, over the 800 threshold. Splitting it is open work. |
| `lib/stocks.ts` | A hardcoded mock price table. **Prices never move**, which bounds what the Trade tab can teach. |

## Getting started

```bash
npm install
npx expo start          # Metro on 8081
npx expo run:ios        # build and install a dev client
```

`.env.local` is gitignored and holds the RevenueCat iOS key and the Google iOS OAuth client id.
Both are **public client identifiers** that ship in the binary — they are not secrets. Server-side
keys are set on EAS, never here:

```bash
eas env:set production --name GEMINI_API_KEY --value <v> --visibility secret --non-interactive
```

`eas env:create` is deprecated on eas-cli 21.7.1. Use `eas env:set`.

## The gate

Nothing merges without these. Run them in this order:

```bash
npx tsc --noEmit                       # must be clean
npm run check                          # 8 regression + pinning scripts, all must PASS
npx expo lint 2>&1 | grep problems     # 48 problems (3 errors, 45 warnings) is the accepted baseline
python3 scripts/certify.py             # every route renders
node scripts/a11y-audit.mjs            # 1 "unlabelled" is a known docstring false positive
./scripts/sim.sh screen                # then LOOK AT THE REAL SCREEN
```

### What `npm run check` pins, and why each exists

| script | the failure it prevents |
|---|---|
| `cost-basis-regression` | average cost surviving partial sells, grants and legacy state |
| `portfolio-snapshot-regression` | the chart and the headline valuing the same portfolio differently |
| `billing-retry-regression` | hard-walling a member whose card is mid-retry — turning a recoverable decline into a real churn |
| `lesson-preview-coverage` | lesson-intro previews silently disappearing (186 of 300 by design) |
| `unit-names-coverage` | course ids drifting so unit headers stop rendering (60 names, 12 courses) |
| `check-digest-lessons` | digest guides pointing at lessons that no longer exist |
| `trial-reward-regression` | the 17c offer firing to a payer, after expiry, or twice per install |
| `privacy-claim-pin` | `why-not-free.tsx` making a claim the code no longer honours |

**The rule this repo learned the hard way (§22 C113):** a green gate means the things it checks are
fine. It does not mean the number on the screen is true. Four green runs once sat over a Trade tab
rendering `+300.0%` on a position that had not moved. **For anything computing a number a user reads
as their own money, get a second reader.**

## Driving the simulator

`scripts/sim.sh` answers in **text**, not screenshots, because reading images costs real money and a
session of them costs a lot.

```bash
export EUPHORIA_UDID=<udid>            # "Euphoria QA"; otherwise the first booted sim is used
./scripts/sim.sh screen                # the accessibility tree as "label @ x,y", in POINTS
./scripts/sim.sh tapon "Start"         # tap by label, no coordinates
./scripts/sim.sh state '{isPro}'       # the persisted zustand store, as JSON
./scripts/sim.sh open "onboarding?step=paywall"
./scripts/seed-trial.sh 4 false        # expired trial;  0 true = pro
./scripts/capture-screens.sh           # re-shoot all 31 routes
```

**The tree does not model overlays.** LogBox's error bar sits at y≈795pt, directly over some dismiss
controls: `sim.sh` will report tapping a button that is physically covered and nothing will happen.
When a tap "works" but nothing changes, take one screenshot before theorising.

The simulator also shuts itself down unprompted. Run `xcrun simctl list devices` before diagnosing a
crash.

## Where the reasoning lives

This repo keeps its decisions, not just its code. In order of authority:

1. **`refs/MASTER_PLAN.md` §22 — the corrections log, `C1`…`C115`.** Every entry records something
   that was got wrong and what is true instead. Commit messages cite these by number. **A commit
   body wins over the reconstruction where they disagree.**
2. **`CARRYOVER.md`** — the session handoff. Written to be pasted whole into a fresh session.
   Verify it against the repo before trusting a count; it has claimed a §22 range that did not exist
   more than once.
3. **`AGENTS.md`** — the rules for working here, chiefly that ScreensDesign is mandatory for design
   work and that you read the **screen**, never the flow description.
4. **`CHANGELOG.md`** — all 365 commits, generated from `git log`.

### House rules that are not negotiable

- **§0.4 — never show a number the app cannot back.** No invented prices, no percentages without a
  product behind them, no "offer ends soon" without a timer.
- **§0.5 — no dead controls.** A button that cannot do its job is disabled with a reason, not
  hopeful.
- **§0.7 — never invent product copy.** Draft options, let the owner choose.
- **§16a** — discount framing may not appear in any App Store asset.

## Product facts

| | |
|---|---|
| Trial | **3 days** (`TRIAL_DAYS`). Never typed as a literal — this screen once advertised 7 while the engine granted 3. |
| Pricing | **$9.99/mo**, **$79.99/yr** = $6.67/mo, 33% off. Deliberately under the ~$7.90 peer median. |
| Curriculum | 12 courses × 25 lessons = **300 lessons**, 60 unit names, 35 digest guides |
| Screen | 402 × 874 pt |
| Retention | Unit 17 — funnel telemetry, the trial reward offer (17c), the dismissal offer (17d), billing-retry protection (17e) |

### Peer group

Measured against ScreensDesign's dataset, Euphoria's design-mechanism competitors are **learning
apps — Duolingo, Babbel, Quizlet** — not brokerages, despite the App Store category. Of the top ten
apps at $500k/mo+ in the comparator pull, nine were Education and one was Finance. Compare screens
against those, not against Robinhood.

Zogo, Stash, Greenlight and NGPF are **not in the dataset**. Say "no strong match" rather than
substituting something off-topic.

## Known blockers

None of these can be closed by writing code.

| blocker | effect |
|---|---|
| **Paid Applications Agreement unsigned** | No IAP can transact. The offering has no packages. |
| **Four API keys absent** (`GEMINI`, `POLYGON`, `ALPHAVANTAGE`, `TRADIER`) | `/api/market` returns `503 not_configured`. Atlas, quotes and options are reachable but dead. |
| **No PostHog account** | `ANALYTICS_ENABLED` shape-checks `phc_`, so every 17b/17d/17f event is a no-op. Five phases of instrumentation record nothing. |
| **ScreensDesign Pro lapsed** | `search_apps` returns "An active Pro subscription is required". Design work has no evidence source. |
| **EU trader status not provided** | DSA — apps get removed from the EU store. |
| **App Privacy inaccurate** | Analytics was added and must be declared. |
| **2.1b reply unsent** | `refs/APPLE_2.1b_REPLY_DRAFT.md` awaits approval. Nothing sends without it. |

The Account Holder is the only person who can clear the agreement and status items. **Never accept
an agreement on someone else's behalf.**

## Open work

- **17c is not device-verified.** The sheet is built, gated and pinned by regression, but has not
  been rendered on a simulator — reaching it needs a lesson driven to completion through a
  correctness-gated MultiSelect.
- **The trial reward offer is unreachable from Home.** Four surfaces render the trial-expired state
  and only `GateSheet` carries the dismissal offer; `lesson.tsx` and `chat.tsx` have their own hard
  walls. See §22 C115.
- 17 captured screens remain unaudited — `digest`, `chat`, `options`, `stock` next by priority.
- `lib/people.ts` is fabricated and says so; the league races invented rivals.
- Auth runs real OAuth but creates no account — `currentUserId()` returns null.
- `store.ts` is over the 800-line threshold.

---

Private repository. © Euphoria.
