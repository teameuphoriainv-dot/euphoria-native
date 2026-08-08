# EUPHORIA — MASTER EXECUTION PLAN v2
### The complete, self-contained brief for a cold session. Zero prior context assumed.

**Written:** 2026-08-07 · **Supersedes:** `snuggly-weaving-hummingbird.md` (Unit 1 of which is DONE and committed as `61f61ba`)
**Repo:** `~/euphoria-native` · **Remote:** `teameuphoriainv-dot/euphoria-native` (private) · **Branch:** `main`
**Device:** iOS Simulator **"Euphoria QA"** · UDID **`61F7E882-C226-4E97-9918-9BFF536B9A90`** · iOS 26.5

---

# §00. THE LAUNCH PROMPT

**Paste this into a fresh terminal session. Nothing else is needed.**

> Read `~/euphoria-native/refs/MASTER_PLAN.md` end to end before you touch a single file. It is the
> complete brief: standing rules, the simulator connection, the full tool and MCP inventory with
> exact invocation syntax, the repo map, thirty-one traps that each cost real debugging time, the
> locked decisions, the banked research, the gate, and fourteen units of work with per-unit
> ScreensDesign call sheets.
>
> Then run **§7 THE GATE** cold to establish your baseline, confirm the **Euphoria QA** simulator is
> booted and the app is running per **§1**, and start at the first unit in **§8** that is not marked
> DONE. Execute units strictly in order. Run the gate after every unit. Commit after every green
> gate. Push at the milestones named in §12.
>
> **Read §22 CORRECTIONS LOG before you trust §3 (the repo map), §10 (the icon decision) or any
> file path in this document.** Later sessions verified parts of this brief against the actual
> codebase and found real drift — including two icon systems §3.2 omits entirely, and a §2d
> instruction that names a path already occupied by a live component.
>
> Non-negotiable, and stated by the user in writing more than once:
> **Never mention context percentage or session cost.** We measure in quality only.
> **Use the ScreensDesign MCP before every design decision** — §14 gives you the exact calls.
> **Rate limiting is mandatory on anything that spends quota.**
>
> Do not ask me to re-approve the plan. It is approved. Work.

**If the user instead says "continue" with no context, that prompt is what they mean.**

---

# §0. STANDING RULES — these override your defaults

These are not style preferences. Every one was paid for with a real failure in a previous session.

## 0.1 Measure in quality only. Never raise cost or context.

**The user has said this in writing, more than once, verbatim:**

> *"in this prompt, you should mention that you should always ignore the context percentage and the
> cost of the session. We do not want to ever bring that up. We only measure stuff in terms of
> quality."*

This repo emits `COST CRITICAL` and `SCOPE WARNING` hook lines on many tool calls. They are
**informational noise**. Concretely:

- Do **not** mention them in your response.
- Do **not** apologise for them.
- Do **not** let one change what you do next.
- Do **not** trim a verification step, a ScreensDesign pull, a device measurement, or a review pass
  to "save a call".
- Do **not** summarise your work with a cost or efficiency framing.

There is also a `~/.claude/CLAUDE.md` COST directive telling you to minimise calls. **The user's
direct, repeated, in-writing instruction for this project overrides it.** If you find yourself
reasoning about whether a verification is "worth the call", you have already made the wrong trade.

The expensive thing in this repo is **a wrong answer shipped confidently**, never a tool call. The
proof is a list of real incidents, each caused by reaching for a cheap proxy instead of the real
artifact:

| the cheap proxy that was used | what it actually cost |
|---|---|
| a flow *description* instead of the screen | a whole paywall split was built, shipped, then reverted |
| a gap in *pagination* read as absence | correct, working code was reverted |
| an accessibility *anchor* read as a bounding box | reported "32pt of clearance" over a **36pt overlap** |
| a colour *threshold* applied over a gradient | "starfield renders: 98.2%" — it was measuring the background |
| a raw *grep count* of `fontSize` overrides | reported 32 "defects"; the real number was 1 |
| a *dev-server* curl loop instead of the built bundle | a rate limiter that reported 25/25 passes when it worked perfectly |

**Read the screen. Pull the neighbours. Crop the band. Compute the ratio. Run the built bundle.
Then speak.**

## 0.2 ScreensDesign MCP is mandatory

Before **every** design audit, every design question, and every design change. Not "when unsure",
not "for big redesigns only". Every one. This is recorded in `AGENTS.md`, which `CLAUDE.md` imports,
so it loads automatically in every session in this repo.

§2.1 documents the tools. §14 is a **copy-pasteable call sheet with the exact call for every unit**.
There is no excuse for guessing.

Using it *properly* means all seven of these:

1. **Read the SCREEN, never only the flow or app description.** `screen_detail` with
   `include_image: true`. Summaries are lossy and are sometimes flatly wrong.
2. **Use `neighbor_count`.** The screen immediately before or after almost always carries the
   mechanism. The Astra AI gate modal in §9 is only comprehensible with its neighbours: position
   130 is the screen the user was actually trying to use, 131 is the gate, 132 is the plan picker.
3. **Never infer absence from a paginated pull.** See trap #6.
4. **Count convergence across ≥4 apps and report the hit rate** (4/4, 3/6). A 1/4 pattern is not
   evidence — either exclude it and say so, or justify it on other grounds and label that clearly.
5. **State transferability.** Most of the dataset is not finance education. Say which *mechanism*
   transfers and why, or mark it UNVERIFIED.
6. **`search_screens` is BROKEN** — it returns a pydantic `extra_forbidden` error on `app_id`. The
   error payload leaks the matched app ids; feed those to `app_screens`, or route via `search_apps`
   with `detected_patterns`.
7. **A pattern that cannot differentiate is decoration.** Lesson node-type icons hit 4/6 in the
   reference set and were still removed, because every lesson in this curriculum is the same kind,
   so the badge rendered an identical glyph on every single node. Convergence is necessary, not
   sufficient.

## 0.3 Nothing is "verified" without a number

A measured before → after from a named command. "Looks better" is not a result. "Row 6 moved from
`bottom=796` to `bottom=692`, clearing a CTA whose top is at `760`" is a result.

Acceptable evidence: `idb ui describe-all` frames · `./scripts/sim.sh screen` label counts ·
`./scripts/sim.sh state '<jq>'` values · curl status codes · `tsc` output · lint problem counts ·
`certify.py` verdicts · byte sizes from `wc -c`.

Not acceptable: "should work" · "I've made it cleaner" · "this looks much better now" · a green
`tsc` presented as proof the app runs (see trap #2).

## 0.4 Never present modelled, stale, or static data as live

This is the spine of the app's integrity and it is **already enforced in nine places**. Read them
before writing any data-facing code, and match the pattern:

| file | what it does when the data is not real |
|---|---|
| `src/lib/market.ts` | returns `null` without a key; sets `isLiveUnavailable()` |
| `src/components/price-chart.tsx` | renders "Live prices aren't switched on in this build" |
| `src/components/key-stats.tsx` | returns `null` — the whole block vanishes rather than showing dashes |
| `src/components/movers.tsx` | hides rather than rendering an empty market |
| `src/app/news.tsx` | says so rather than rendering placeholder headlines |
| `src/components/ticker-logo.tsx` | keeps a lettered badge as the permanent floor |
| `src/app/options.tsx` | labels Black-Scholes rows **"modelled"**, never "quote" |
| `src/components/portfolio-chart.tsx` | refuses to back-test; only plots snapshots that were actually taken |
| `src/app/api/*+api.ts` | answer `503 not_configured`; never invent a payload |

The app has already deleted an invented `$104,237.55` portfolio and a hardcoded bezier curve posing
as a real chart. **Do not reintroduce that class of thing under any framing.**

## 0.5 No dead controls

A button that writes nothing does not ship. If a control cannot do its job yet, either remove it or
state plainly *on screen* why it is limited. Three precedents already set in this codebase:

- Thumbs up/down on Atlas replies were **cut at 3/5 convergence** because there is no telemetry
  endpoint to receive the vote.
- Bloom's "Share +50" was **not copied** because there is no soft currency and no share destination.
- The options preview cap **states its own cause** on screen — *"Live options pricing needs an
  options data provider we haven't connected yet"* — rather than being invented scarcity.

**This rule has one specific consequence for Unit 10:** the paywall currently cannot transact
(`onboarding.tsx` shows an `Alert` admitting it). Shipping a trial expiry that pushes users at a
paywall that cannot take money would be the single largest dead control in the app. Unit 12 (IAP)
is therefore **not optional** if Unit 10 ships. They go together or neither goes.

## 0.6 If a number does not move, revert

Do not keep a change and rename the goal. If the Learn tab redesign was supposed to get from 5
visible nodes to ≥10 and it got to 6, that is a failed unit, not a "partial improvement".

## 0.7 Stop and ask on taste, build everything else

Ask about: copy, pricing, naming, offer content, visual direction, anything the user will read as
"the product's voice". Build without asking: architecture, data flow, verification, refactors,
anything measurable.

## 0.8 One unit per cycle, done properly

The user will say "keep going". Take it literally — and keep the full gate on every cycle. The gate
is what makes "keep going" safe.

## 0.9 Own what you break

If lint warnings rise from 47 to 48 after your change, you caused it — find it and fix it before
moving on. This has already happened four times in this project and was fixed four times. The most
recent: a `require()` added with a comment claiming an import cycle that **did not exist**
(`stocks.ts` imports nothing). Verify the justification, not just the symptom.

---

# §1. CONNECTING TO THE iOS "EUPHORIA QA" SIMULATOR

**This section is mandatory before any UI work. Device verification is not optional** — a green
`tsc`, a green lint, and a green `certify.py` have all three coexisted with a completely blank app
(trap #2) and with a control that could not be tapped at all (traps #1, #4, #17).

## 1.1 The device

```
Name : Euphoria QA
UDID : 61F7E882-C226-4E97-9918-9BFF536B9A90
iOS  : 26.5
Bundle id : com.euphoria.native
```

**Export this in every shell you use. Without it, `sim.sh` picks the first booted simulator, and
there is a second one ("iPhone 17") booted on this machine that does NOT have the app installed.**

```bash
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90
```

## 1.2 Bring-up sequence — run this at session start, in order

```bash
cd ~/euphoria-native
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90

# 1. Is the device there at all?
xcrun simctl list devices | grep -i "Euphoria QA"
#    Expect: Euphoria QA (61F7E882-...) (Booted)
#    If it says (Shutdown):
xcrun simctl boot "$EUPHORIA_UDID"

# 2. Is the toolchain healthy? (checks idb, simctl, the bundle, the store file)
./scripts/sim.sh doctor

# 3. Is Metro up? It runs on :8082 in this project, NOT the default :8081.
lsof -ti:8082 || npx expo start --port 8082

# 4. Is the app actually attached to Metro? Deep-link the dev client at it:
xcrun simctl openurl "$EUPHORIA_UDID" \
  "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082"

# 5. Prove it renders. This is the real check.
./scripts/sim.sh screen | head -20
#    Expect real labels: "Ask Atlas", "Hey there", a course title, weekday letters M T W T F S S.
#    A short or empty tree means the app is blank — go to §1.5 RECOVERY.

# 6. Prove the store is alive and persisted.
./scripts/sim.sh state '.installId'
#    Expect a string like "eu_ip96xeozvifmsiy6sdb". `null` -> see trap #3.
```

## 1.3 `scripts/sim.sh` — the full command surface

This script exists specifically so you answer questions with **text and numbers instead of
screenshots**. Not to save money — because text produces measurements and a screenshot produces an
impression.

```bash
./scripts/sim.sh doctor              # verify the toolchain end to end
./scripts/sim.sh devices             # list booted simulators
./scripts/sim.sh screen              # the a11y tree, as "label @ x,y" in POINTS
./scripts/sim.sh tap <x> <y>         # tap a point
./scripts/sim.sh tapon "<text>"      # tap BY LABEL — substring match, smallest frame wins
./scripts/sim.sh state [jq-filter]   # the persisted zustand store, as JSON
./scripts/sim.sh open <path>         # deep link, e.g. open "onboarding?step=0"
./scripts/sim.sh motion "<text>" [s] # tap it, then MEASURE whether the mascot translated
./scripts/sim.sh shot <file.png>     # screenshot to disk (reading it still costs)
```

**Internals worth knowing:** coordinates come back in **points**, which is exactly what `idb ui tap`
consumes — there is no retina division anywhere in the file. Device selection is
`EUPHORIA_UDID` first, else the first booted simulator.

## 1.4 Raw measurement — when an anchor is not enough

`sim.sh screen` gives you an **anchor point**, not a box. For any question about overlap, clearance,
or layout collision you need real frames:

```bash
~/.idb-venv/bin/idb ui describe-all --udid "$EUPHORIA_UDID"
```

Then compare `y .. y+height` ranges, not centres. **This is trap #1 and it is the single most
expensive measurement error made on this project.** See §4.

## 1.5 Recovery — when the app is blank or wedged

A blank app after an edit is almost always a wedged Fast Refresh bundle, **not** your code. Diagnose
before you rewrite anything:

```bash
# What did the runtime actually say?
xcrun simctl spawn "$EUPHORIA_UDID" log show --last 3m \
  --predicate 'processImagePath CONTAINS "euphoria"' | grep -iE "ReferenceError|TypeError|Unable to resolve"

# Recover: terminate and re-attach. Do NOT start rewriting files.
xcrun simctl terminate "$EUPHORIA_UDID" com.euphoria.native
xcrun simctl openurl "$EUPHORIA_UDID" \
  "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082"
```

**This exact situation has already happened once:** the device log reported
`ReferenceError: Property 'StrikeRow' doesn't exist` while `grep` found **zero** references to
`StrikeRow` anywhere in the repo. The file was already correct. The bundle was stale. Terminating
and re-opening fixed it in one step.

## 1.6 Driving lessons automatically

```bash
python3 scripts/solve-lesson.py "$EUPHORIA_UDID" [rounds]
```

Drives a lesson through its gated steps off the a11y tree. **Its answer key is incomplete** — it
stalls with `"no actionable element three times"`. When it stalls, answer that one question
manually with `sim.sh tapon`, then re-run it. Known unkeyed questions in
`investing-fundamentals:1`: the Maya inflation questions, the fill-in-the-blank (answer:
`inflation`), the $10,400 five-year question, the compound-order puzzle, the multi-select, and the
asset-matching step.

## 1.7 Baseline state — do not wipe without capturing

Persisted state blocks first-run verification: `completedLessons` already has entries, so you cannot
see the true first-run experience without a wipe. A baseline is preserved at
`refs/BASELINE_STORE.json` (xp 30 · streak 1 · minutesToday 5). **Capture again before any wipe:**

```bash
./scripts/sim.sh state '.' > refs/BASELINE_STORE_$(date +%Y%m%d).json
```

To wipe for a genuine first-run test:
```bash
xcrun simctl terminate "$EUPHORIA_UDID" com.euphoria.native
# then in-app: the reset() action, or delete the app and re-install from Metro
```

**Unit 10 (the trial) needs first-run testing specifically** — you cannot verify a 3-day trial
without controlling day one. §9.7 gives you a way to do it without waiting three days.

---

# §2. COMPLETE TOOL INVENTORY

Everything below is **actually installed and available in this session**. Names, versions and
invocation syntax are verified, not remembered.

## 2.1 ScreensDesign MCP — the design authority

**Mandatory before every design decision (§0.2).** Server name: `screensdesign`. Research-only —
it does not generate or render images, it returns recorded screens from real shipping apps.

### The tools

| tool | what it is for | the parameters that matter |
|---|---|---|
| `mcp__screensdesign__search_apps` | find apps by name, category, revenue, downloads, or **product mechanics** | `smart_search` (semantic, describe a *mechanic* not a ranking), `category`, `min_revenue`/`max_revenue` (USD/month), `min_downloads`, `detected_patterns`, `excluded_patterns`, `sort`, `limit`, `offset` |
| `mcp__screensdesign__app_screens` | browse recorded screens for **up to 10 apps at once** | `app_ids` (array, max 10), `query` (narrows to a visible UI concept), `limit` (server caps at 50), `offset` |
| `mcp__screensdesign__screen_detail` | **THE IMPORTANT ONE.** View up to 10 screens with images and adjacent screens | `screen_ids` (array, max 10), `include_image: true`, **`neighbor_count: 1..3`** |
| `mcp__screensdesign__app_detail` | product, performance, developer, media and flow info for up to 10 apps | `app_ids`, `include_store_screens`, `include_videos` |
| `mcp__screensdesign__search_flows` | complete user journeys | `query`, `paywall_type`, `category`, `min_revenue`, `flow_id` |
| `mcp__screensdesign__find_similar_screens` | visual neighbours of a screen you already have | screen id |
| `mcp__screensdesign__similar_apps` | competitive set expansion | app id |
| `mcp__screensdesign__search_store_screens` | **App Store creative**, not recorded screens | use when an app is not in the recorded dataset |
| `mcp__screensdesign__search_developers` | publisher research | |
| `mcp__screensdesign__list_collections` / `get_collection` | saved research collections | |
| `mcp__screensdesign__describe_screensdesign_mcp` | server self-description | |
| `mcp__screensdesign__get_screensdesign_skill` | local skill compatibility check | call **once per conversation** if the skill is loaded |

### `detected_patterns` — the full enum, and it is a goldmine

These filter to apps whose **latest recorded replay** contains the pattern. For paywall and
onboarding work these are far more precise than `smart_search`:

```
HasQuiz · HasTimer · HasVideo · HasAppleBadges · ShowsStarRating · HasDiscountOffer
HasLifetimeOffer · HasPressMentions · HasTrialTimeline · HasATTWarmupScreen
HasFeatureCarousel · HasMascotCharacter · RequestsHealthData · HasUserTestimonials
SpecialOfferPaywall · HasBeforeAfterScreen · HasFeatureHighlights · HasFreeTrialSwitcher
ShowsPricePerWeekDay · HasRatingWarmupScreen · HasSignToCommitScreen
HasReviewsTestimonials · HasReinforcementScreens · HasBuildingYourPlanScreen
HasFeatureComparisonTable · HasPrivacyDedicatedScreen · HasSignUpDuringOnboarding
HasNotificationWarmupScreen · HasHowDidYouHearAboutUsScreen · HasPostSubscriptionWelcomeScreen
```

### `paywall_type` — the exact enum for `search_flows`

```
"Free Trial - Hard Paywall"        <- what Euphoria is becoming (Unit 10)
"No Free Trial - Hard Paywall"
"Free Trial - Soft Paywall"
"No Paywall Free Trial - Soft Paywall"
"No Free Trial - Soft Paywall"
"No Paywall"                        <- what Euphoria is today
```

### KNOWN FAILURES — read before you call

1. **`search_screens` is broken.** Pydantic `extra_forbidden` on `app_id`. The error payload leaks
   matched app ids — harvest those and feed them to `app_screens`.
2. **Large results overflow the tool-result limit and get written to a file instead.** This happens
   constantly with `search_flows` and multi-app `app_screens`. The error tells you the path. **Do
   not retry with a smaller limit — parse the file:**
   ```bash
   F=/path/from/the/error/message.txt
   jq -r '.results[] | "\(.id) | \(.description[0:200])"' "$F"
   ```
   `screens[].description` is an **object**, not a string — `jq` will error with
   `object cannot be matched, as it is not a string`. Use python:
   ```bash
   python3 -c "
   import json,sys,re
   d=json.load(open('$F'))
   for s in d['screens']:
       desc=s.get('description')
       txt=desc.get('exhaustive_description','') if isinstance(desc,dict) else str(desc)
       print(f\"[{s['app_id']}] id={s['id']} pos={s.get('position')} :: {re.sub(r'\s+',' ',txt)[:250]}\")
   "
   ```
3. **Screen `description` objects carry more than prose.** The useful keys are
   `exhaustive_description`, `screen_type`, `funnel_stage`, `primary_user_goal`, and
   **`visible_text`** — an array of every string on the screen. `visible_text` is the single best
   field for copy research and it is easy to miss.
4. **Never infer absence from pagination** (trap #6).

### Apps confirmed NOT in the recorded dataset

**Coinbase** (`search_apps app_name="Coinbase"` → `total: 0`), **Robinhood** (→ `total: 0`),
**Zogo, Stash, Greenlight, NGPF**. For any of these use `search_store_screens` and label the result
as **App Store creative, not a recorded screen**. Do not substitute a different app and call it
Coinbase — that has been attempted and it is how §0.1's failure table gets longer.

## 2.2 The iOS device toolchain

| tool | path / invocation | role |
|---|---|---|
| `simctl` | `xcrun simctl` | boot, terminate, openurl, log show, list devices |
| `idb` | `~/.idb-venv/bin/idb` | `ui describe-all` (raw frames), `ui tap`, `ui swipe` |
| `sim.sh` | `./scripts/sim.sh` | the wrapper you should use 95% of the time (§1.3) |
| `certify.py` | `python3 scripts/certify.py` | static half of a11y criterion 3a across 18 ranked routes; **exits 1 on regression** |
| `solve-lesson.py` | `python3 scripts/solve-lesson.py <UDID> [rounds]` | drive a lesson through gated steps |
| `motion_energy.py`, `measure.py` | `scripts/` | competitor frame analysis |
| `sync-digest.sh` | `./scripts/sync-digest.sh` | regenerate digest content from the web repo |

**`idb ui swipe` without `--duration` is a tap, not a scroll.** Use `--duration 0.4`.

## 2.3 Graphics, animation and icons — installed and verified

| package | version | role |
|---|---|---|
| `react-native-svg` | **15.15.4** | **THE runtime.** `Svg, Path, Circle, Rect, G, Defs, LinearGradient, Stop, SvgXml`. Every hand-drawn mark in this app uses it. |
| `svgo` | **4.0.2** | SVG optimiser, already a dependency. `npx svgo -i in.svg -o out.svg`. **Mandatory before inlining any new hero** — `digest-heroes.ts` is already 113KB. |
| `rive-react-native` | **9.8.5** | interactive vector animation with **state machines**; `src/components/atlas-rive.tsx` already wires it |
| `rivemcp` | **1.8.3** | Rive MCP server, already a dependency |
| `react-native-reanimated` | **4.5.0** | all motion; see `src/shared/motion/` |
| `expo-image` / RN `Image` | — | raster; `ticker-logo.tsx` cross-fades a real logo over a lettered badge floor |
| `ecc:fal-ai-media` skill | — | AI image generation via fal.ai. **Requires a fal key.** Skip cleanly and say so if absent. |

### DO NOT ADD LOTTIE

Rive is installed and is strictly better for this app. Rive state machines let Atlas's expression be
driven by **live app state** — `thinking` while the chat streams, `proud` on a reward — which a
Lottie file cannot do without swapping whole animation files at runtime. Adding Lottie means **two
animation runtimes for one job**: duplicate native binary weight and two divergent ways to express
the same motion. If the user asks again, restate this once, then follow their call.

## 2.4 Component library and icon set — VERIFIED VERSIONS, decision in §10

Every version below was checked against the npm registry on **2026-08-07**:

| package | latest | last published | note |
|---|---|---|---|
| `nativewind` | **4.2.6** | 2026-07-08 | approved for NEW surfaces only (decision 6) |
| `tailwindcss` | **4.3.3** | 2026-08-06 | NativeWind 4.x pairs with Tailwind 3.x — **pin carefully, see §10.2** |
| `@gluestack-ui/core` | **5.0.15** | 2026-06-25 | v5 supports NativeWind v5 / Tailwind v4, Expo Router first |
| `@rn-primitives/portal` | **1.5.2** | 2026-07-02 | the unstyled primitives React Native Reusables builds on |
| `@hugeicons/react-native` | **1.0.15** | 2026-06-24 | 46,000+ icons, 7 styles incl. **Duotone** and **Bulk** |
| `@hugeicons/core-free-icons` | **4.2.3** | 2026-07-21 | the free icon payload |
| `react-native-nano-icons` | **0.2.1** | 2026-07-22 | Software Mansion; high-performance icon rendering |
| `iconoir-react-native` | **7.11.1** | 2026-06-18 | 1,300+ icons on a 24×24 grid |
| `lucide-react-native` | **1.30.0** | 2026-08-07 | the safest generic line set |
| `phosphor-react-native` | **3.0.6** | 2026-04-23 | 6 weights incl. duotone |
| `react-native-purchases` | **10.7.0** | 2026-08-06 | **RevenueCat — the IAP SDK for Unit 12** |

## 2.5 Review tooling — for Unit 14

| tool | invocation | weight |
|---|---|---|
| `ecc:security-review` | skill | **highest** — weight it on `_limit.ts`, `auth.ts`, `entitlement.ts`, and all API routes |
| `ecc:code-review` | skill | full diff |
| `coderabbit:code-review` | skill / `coderabbit:code-reviewer` agent | full diff, second opinion |
| `ecc:council` | skill | independent opinions on named questions |
| `ecc:silent-failure-hunter` | agent | swallowed errors, bad fallbacks — **highly relevant**, this codebase has many `safe()`-style catches |
| `ecc:type-design-analyzer` | agent | invariant expression; relevant after the `UIcon` incident (trap #19) |
| `ecc:agent-evaluator` | agent | quality scorecard |
| `ecc:react-reviewer` | agent | hooks, render performance, server/client boundaries |
| `ecc:typescript-reviewer` | agent | type safety, async correctness |
| `ecc:a11y-architect` | agent | WCAG 2.2 — pairs with `certify.py` |
| `ecc:performance-optimizer` | agent | bundle size; relevant to the 113KB hero file |

**Do not launch these mid-unit.** Decision 8 is one consolidated pass at the end (Unit 14).

## 2.6 Web research tools

| tool | when to use it |
|---|---|
| `WebSearch` | current package versions, framework changes, pricing, anything after the knowledge cutoff |
| `WebFetch` | read one known URL |
| `mcp__firecrawl__firecrawl_search` | better structured web search with content extraction |
| `mcp__firecrawl__firecrawl_scrape` | retrieve one page as clean markdown |
| `mcp__firecrawl__firecrawl_map` | enumerate URLs under a site (e.g. all Expo SDK 57 doc pages) |
| `mcp__firecrawl__firecrawl_extract` | structured extraction against a schema |
| `mcp__firecrawl__firecrawl_developer_search` | developer-focused search |

**Expo docs must be read at the versioned URL:** `https://docs.expo.dev/versions/v57.0.0/`.
`AGENTS.md` says this in its first line. Expo has changed; the unversioned docs will mislead you.

## 2.7 Browser automation

| tool set | when |
|---|---|
| `mcp__claude-in-chrome__*` | driving a real Chrome tab; `tabs_context_mcp` **first**, always |
| `mcp__plugin_ecc_chrome-devtools__*` | performance traces, console, network, Lighthouse |

Relevant here only for the **web app** (`~/euphoriaweb-current`) and for reading competitor sites.
Not needed for the native app.

## 2.8 Expo / EAS plugin skills

| skill | use |
|---|---|
| `expo:eas-hosting` | API routes, `web.output: "server"`, deploy. **Already applied** — `app.json` is correct. |
| `expo:eas-workflows` | CI YAML if deploys get automated |
| `mcp__plugin_expo_expo__*` | Expo MCP (needs auth) |
| `mcp__plugin_vercel_vercel__*` | Vercel MCP — not used; the API routes deploy to EAS Hosting |

**Verify a production build of the API routes like this** — and note that this is the ONLY way to
verify rate limiting (trap #20):

```bash
npx expo export -p web          # bundles the 3 API routes into dist/
npx expo serve --port 8090      # serves dist/ with persistent module state
```

## 2.9 Shell and data tools

`git` · `gh` (see trap #14) · `jq` · `python3` · `node` · `npx` · `curl` · `rg` (ripgrep, aliased
behind `grep` by the rtk hook) · `md5` · `lsof` · `pkill`

**The `rtk` hook rewrites many shell commands.** It mangles `grep` output into a `path:line:col`
form and truncates. When you need exact text, prefer the `Read` tool or `python3` over `grep`.

---

# §3. REPO MAP

**Primary working directory:** `~/euphoria-native`

Expo **SDK 57.0.7** · React Native **0.86.0** · React **19.2.3** · Reanimated **4.5.0** ·
expo-router **57.0.7** · `experiments.typedRoutes: true` · `experiments.reactCompiler: true` ·
`web.output: "server"` (required for API routes; it was `"static"` and had to be changed).

**Content source of truth:** `~/euphoriaweb-current` — Vite/React + Supabase, **35 edge functions**
including `polygon-market-data`, `fetch-economic-news`, `execute-trade`, `fill-pending-orders`,
`process-settlements`, `competition-trade`, `ai-lesson-assistant`, `ask-pluto`, `stripe-*`, `lti-*`.
The native app shares this Supabase project — which is why `src/lib/auth.ts` targets it.

## 3.1 Routes — they live in `src/app/`, NOT a root `app/`

```
src/app/
  _layout.tsx
  index.tsx                cold-start router; waits on hasHydrated before navigating
  (tabs)/
    _layout.tsx            tab bar config
    home.tsx               greeting, habit pills, next-lesson hero, course rail
    learn.tsx              course pathway, node pitch 100, milestone every 5th
    trade.tsx              portfolio, chart, actions, positions, watchlist, movers
    digest.tsx             today card, category chips, guide list
    you.tsx                league hero, profile card, 4 stat tiles, ladder, settings rows
  api/
    _limit.ts              RATE LIMITER — underscore keeps expo-router off it
    chat+api.ts            Gemini proxy, non-streaming
    market+api.ts          Polygon proxy: search|quote|chart|stats|movers|logo|news
    options+api.ts         Tradier sandbox proxy: expirations|chain
  digest/[slug].tsx        paginated article reader
  stock/[sym].tsx          quote, chart, key stats, follow, news, buy/sell
  settings/[section].tsx   account | notifications | preferences
  lesson.tsx               intro -> steps -> celebration -> streak
  onboarding.tsx           ~20 steps ending in a paywall
  chat.tsx  reward.tsx  options.tsx  news.tsx  search.tsx
  courses.tsx  league.tsx  friends.tsx  games.tsx  auth.tsx  welcome.tsx  start.tsx
  explore/  games/  stock/  digest/  settings/
```

## 3.2 Components

```
atlas.tsx (22K)            9 expressions: default watching happy whoa silly sad thinking proud oops
atlas-speech.tsx           typewriter speech bubble, CHAR_MS 26
atlas-rive.tsx             Rive runtime wiring
lesson-art.tsx (32K)       per-lesson hand-drawn SVG scenes
league-crest.tsx           7 tier crests
ui-icon.tsx                24x24 line icons, stroke 2.2 — NARROW UNION, see trap #19. 34 callers.
icon.tsx                   ⚠️ EUPHORIA_ICONS renderer. ~112 MULTICOLOR SVGs via SvgXml, backed by
                           lib/euphoria-icons.ts and SHARED WITH ~/euphoriaweb-current so icons are
                           pixel-identical across platforms. 4 callers. Its docblock states a house
                           rule: "No emoji, no lucide, no template defaults." DO NOT overwrite this
                           file — §2d used to name its path. See §22 C1.
lib-icon.tsx               Hugeicons wrapper, LibIcon/LibIconName. ONLY the glyphs ui-icon.tsx
                           lacks (share, plus). Grep the other two registries before adding. §22 C2.
ambient-background.tsx     seeded-PRNG starfield (stable across resizes)
price-chart.tsx            8 ranges, change recomputes per range
portfolio-chart.tsx        Robinhood ranges 1D 1W 1M 3M 1Y ALL, flat-aware height
key-stats.tsx  movers.tsx  ticker-logo.tsx  ask-atlas.tsx
multi-select.tsx  order-steps.tsx  matching-pairs.tsx  number-line.tsx
tap-reveal.tsx  tile-builder.tsx        <- the 6 gated lesson step kinds
confetti.tsx  celebration-burst.tsx  streak-ignite.tsx  lesson-feedback.tsx
onboarding-parts.tsx  tab-bar.tsx
ui/button.tsx (GradientButton)  ui/card.tsx (Card)  ui/progress-bar.tsx
```

## 3.3 Library

```
euphoria-icons.ts  EUPHORIA_ICONS — 107 multicolor SVG strings. Uses `satisfies` (NOT a
                   Record<> annotation) so EuphoriaIconName is a real union and a typo is a
                   compile error. getIconSvg() falls back to the 'fallback' key, so a bad name
                   renders a PLAUSIBLE WRONG GLYPH rather than throwing. Curriculum course icons
                   arrive from the auto-synced web repo as `string` and go through
                   asEuphoriaIcon(), which logs in __DEV__ — a web-side rename silently changes
                   which glyph this app draws, and that is the only warning you get.
store.ts           zustand + persist(AsyncStorage, key "euphoria-app-state")
api.ts             apiBase() origin resolution + ApiError + apiHeaders + apiGet
auth.ts            Supabase scaffolding, AUTH_ENABLED false without keys
market.ts          Polygon client — RANGES, seriesChange, toPath, getChain, getStats, getMovers
options.ts         Black-Scholes + CONTRACT_SIZE 100 + strikesAround + __DEV__ self-check
atlas-chat.ts      chat client + chatErrorMessage
stocks.ts          7 seeded tickers, priceOf, money, shares, ALL_SYMS — imports NOTHING
curriculum/        12 course modules, 5,341 authored steps, lazy-imported (~1MB each)
digest-content.ts  AUTO-SYNCED, DO NOT EDIT — 25 DigestPost records
digest-heroes.ts   113KB of inline SVG hero covers
digest-bodies.ts   markdown bodies keyed by slug
digest-lessons.ts  lessonForGuide(slug) -> { course, num }, 31 entries for 25 guides
hero-tint.ts       documented hue-rotation per category
lesson-steps.ts    normalizeStep() maps 24 authored types -> components; gates()
onboarding-path.ts Profile, EMPTY_PROFILE, recommendPath, lessonsPerDay, MINUTES_PER_LESSON
notifications.ts   applyDailyNudge() — returns what the OS ACTUALLY scheduled; NUDGE_HOUR 19
league.ts          TIERS, tierProgress
course-accents.ts  courseAccent(id)
people.ts          SEED_FOLLOWERS
```

## 3.4 Motion — `src/shared/motion/`

`rise-in.tsx` (entrance) · `reward-pop.tsx` (**earned moments only**) · `spring-pressable.tsx`
(press feedback; `haptic` and `scaleTo` props) · `number-rollup.tsx` (counting) · `tokens.ts`
(`Duration`).

**Reward motion is reserved for earned moments.** This is settled. It is why Atlas's vertical travel
went from 28pt to 2.0pt outside rewards, and why the plan-reveal stagger was removed. Spend it on
rewards or it stops meaning anything.

## 3.5 Design tokens — `src/constants/theme.ts` (128 lines)

**The dark surface ramp is SETTLED. Never invent a hex.**

```
background          #09090D            tier 0  the screen itself
card                hsl(240 10% 9%)    tier 1  default raised surface
backgroundElement   hsl(240 10% 9%)    tier 1  inline element
cardElevated        hsl(240 10% 14%)   tier 2  inputs, raised cards, fills
input / muted       hsl(240 10% 14%)   tier 2  (same tier, deliberately same value)
backgroundSelected  hsl(240 10% 19%)   tier 3  active/selected, must beat tier 2
border              hsl(240 10% 22%)   line    must exceed what it outlines
primary #A855EB · primaryForeground #FFFFFF · accent #B57BEF
success #22C55E · destructive #EF4444 · warning #F5B33F
iconViolet #BB83F1 · iconPurple #A451E6 · iconLilac #C89CF5 · iconGold #FBBF24
gradientFrom hsl(274 76% 61%) · gradientTo hsl(278 76% 66%)
text hsl(240 5% 96%) · textSecondary #C3BAD0 · mutedForeground #A79DB5
Spacing.one..six · Radius.sm/md/lg/pill · BottomTabInset · Fonts
BrandGradient ['#A78BFA','#7C3AED'] · MaxContentWidth 640
```

> **CORRECTED 2026-08-07 (§22 C3).** This block previously said `background` was
> `hsl(240 10% 4%)` (it is **`#09090D`**) and put `backgroundElement` at tier 2 (it is **tier 1**;
> tier 2 is `cardElevated`/`input`/`muted`). `backgroundSelected` was missing entirely. Read
> `src/constants/theme.ts` if you need certainty — it carries the reasoning per tier.

**There is no `theme.foreground`. It is `theme.text`.** This has been typo'd before and caught by
`tsc`. Course accents live in `COURSE_ACCENTS`; category tints are documented hue-rotations in
`hero-tint.ts`.

## 3.6 Typography — `src/components/themed-text.tsx`

**The prop is `type`, NOT `variant`** (§22 C4): `<ThemedText type="small">`.

```
display    32/40  Fonts.display
title      26/32  Fonts.display
heading    19/25  Fonts.heading
body       16/23  Fonts.body
bodyMedium 16/23  Fonts.medium
small      13/18  Fonts.body
smallBold  13/18  Fonts.semibold
label      11/14  Fonts.semibold  letterSpacing .6  textTransform UPPERCASE
code       13     Fonts.mono
```

> **`label` IS AN UPPERCASE EYEBROW TOKEN.** It exists for "YOUR PATH", "DEVELOPER",
> "TODAY · CREDIT". Using it for conversational text renders **SHOUTING CAPS AT 11PT**. This shipped
> once on the Atlas chat screen: starter prompts read `WHAT IS COMPOUND INTEREST, SIMPLY?` and the
> disclaimer was a two-line block of caps. **Body copy uses `body` or `small`.**

## 3.7 Store shape — `src/lib/store.ts`

**Persisted fields:** `signedIn xp streak completedLessons minutesToday lastActiveDay activeCourseId
readPosts dailyPick profile weeklyXp weekStart lastGameDay following followers isPro atlasAsked cash
positions valueHistory derivativeTrades derivatives pendingRewards rewardsEarned watchlist
installId`

**Not persisted (deliberate):** `hasHydrated` — it describes *this run's* load status. Persisting it
would restore `true` before hydration finished and reintroduce a routing race.

**Derived getters:** `level levelProgress minutesDoneToday dailyGoalMinutes streakIfCompletedToday
weeklyXpNow friendIds canAccessLesson freeLessonsLeft atlasLeft derivativesLeft portfolioValue`

**Actions:** `completeLesson addXp markPostRead setDailyPick awardGameXp buy sell openDerivative
claimReward spendAtlasMessage setPro toggleWatch follow unfollow setProfile completeOnboarding
signIn signOut setActiveCourse setHasHydrated reset`

**Constants:** `FREE_LESSON_LIMIT=5 · FREE_ATLAS_MESSAGES=10 · PRO_DERIVATIVE_PREVIEW=3 ·
STARTING_CASH=10_000 · REWARD_CARDS_PER_LESSON=3 · XP_LESSON=50 · XP_GUIDE=25 · XP_GAME=20 ·
XP_DAILY_GOAL=50 · XP_PER_LEVEL=500 · MINUTES_PER_LESSON`

> **`store.ts:10`, verbatim:** *"Anything added to state must ALSO be added to `partialize` at the
> bottom, or it silently won't survive a restart."*

**`reset()` membership is a deliberate decision, not a default.** Progress resets. Two things do not:

- **`isPro`** — resetting progress must never revoke a purchase.
- **`installId`** — resetting progress must never mint a fresh identity and thereby reset the rate
  limit.

**Unit 10 adds a third:** the trial clock. See §9.3 — if `reset()` restarted the trial, the trial
would be a button, not a limit.

**There is currently NO first-open date, NO active-day list, and NO trial state.** Unit 10 adds
them. `dayKey()` and `weekKey()` helpers already exist and must be reused.

---

# §4. TRAPS — thirty-one of them, each paid for with real debugging time

| # | trap | the rule that follows |
|---|---|---|
| 1 | **An a11y anchor is a POINT, not a BOX.** Comparing row-centre to button-centre reported "32pt clear"; real frames showed **36pt of overlap**. | Always `idb ui describe-all` and compare `y .. y+height` ranges. |
| 2 | **A green `tsc` does not mean the running app is green.** A blank screen persisted after the file was already correct — Fast Refresh had wedged on an intermediate edit. | Check the device log for `ReferenceError`. Recover with `simctl terminate` + re-open the dev-client URL. §1.5. |
| 3 | **`sim.sh state` returns `null` when the store grows.** AsyncStorage inlines small values in `manifest.json` and spills large ones to a file named `md5(key)`. Reads exactly like broken persistence; it is not. | Already fixed in `sim.sh`. If it regresses: `.../RCTAsyncLocalStorage_V1/$(printf 'euphoria-app-state' \| md5 -q)`. |
| 4 | **`idb ui tap` cannot actuate a React Native `Switch`**, even dead-centre on its measured frame. | Make the whole row pressable: `accessibilityRole="switch"` + `accessibilityState={{checked}}` on the row, and hide the `Switch` from the a11y tree so VoiceOver does not announce twice. |
| 5 | **A raw regex count is not a defect count.** A grep for `pro\|premium\|subscri\|entitle\|paid\|tier\|plan` in `store.ts` returned 3 hits — all false positives ("tier" = league tier, "paid" = game bonus). | Inspect every hit before reporting a number. |
| 6 | **Never infer absence from a paginated pull.** `app_screens` returned positions 12, 14, 15, 18 — position 13 existed and was simply on another page. That misreading caused correct work to be reverted. | Use `neighbor_count` on a screen you already have. A missing position number is pagination, not evidence. |
| 7 | **zsh does not word-split unquoted variables**, and `--include=*.tsx` gets glob-mangled. | Quote it: `--include="*.tsx"`. Use `read -r A X Y <<< "$R"`. |
| 8 | **`git commit -m` with multi-line quoted text breaks in this shell.** | `git commit -F -` with a quoted heredoc. |
| 9 | **A JSX comment inside a ternary creates a second child and breaks the build.** Made twice. | Put rationale in a `//` comment above the `return`, never inside `{cond ? ( ... )}`. |
| 10 | **`idb ui swipe` without `--duration` is a tap, not a scroll.** | `--duration 0.4`. |
| 11 | **`Date.now()` during render is impure.** `react-hooks/purity` is an ERROR in this config. | Capture once into state, or anchor to data — `portfolio-chart.tsx` anchors its window to the newest snapshot. |
| 12 | **setState synchronously in an effect BODY is a lint ERROR.** Inside the async callback is fine. | Derive the flag instead: keep a `loadedKey` and compute `loading = loadedKey !== key`. |
| 13 | **`paddingBottom` on a scroll container does NOT lift overflowing content** — it only extends scrollable space beneath it. | To move content up, shrink the content. This is why `OrderSteps` needed density, not padding. |
| 14 | **`gh` defaults to `s-k-28`, which CANNOT see the private repo.** | `gh auth switch --user teameuphoriainv-dot` before any push. Shell may need `CLAUDE_CONFIG_DIR=~/.claude-account2`. |
| 15 | **`sim.sh open "onboarding?step=N"` only works from a COLD route.** `startStep` feeds `useStepTransition` as an *initial* value; deep-linking to a route you are already on does not remount it. | Navigate by tapping. |
| 16 | **Persisted state blocks first-run verification.** `completedLessons` already has entries. | Baseline at `refs/BASELINE_STORE.json` (xp 30 · streak 1 · minutesToday 5). Capture again before any wipe. |
| 17 | **A step that ships its own CTA collides with the pinned footer.** MultiSelect's "Check answer" sat with **exactly half its height** under the footer's Continue, which paints last and ate the taps. Both render as `SpringPressable`, not `GradientButton`, so grepping for the button component finds **zero**. | `OWN_CTA_STEPS = new Set(['multi','line'])` in `lesson.tsx`; the footer yields while a step owns its action. **Any new self-validating step joins that set.** |
| 18 | **The floating blue gear is the Expo dev-client button.** It does not ship. | Do not "fix" it. |
| 19 | **`Record<string, X>` as an ANNOTATION destroys a narrow key union.** `ui-icon.tsx` had `const P: Record<string, React.ReactNode> = {...}`, which widened `UIconName = keyof typeof P` to `string`. The file's own comment said *"deliberately NOT `\| string`"* — the annotation defeated the guard. **Four icons shipped as silent sparkles**: the chat close button, the send button, and three starter rows. | Use `} satisfies Record<string, React.ReactNode>`. Keep the union narrow. New glyph? Author it in `ui-icon.tsx`. |
| 20 | **The in-memory rate limiter DOES NOT LIMIT against the Metro dev server, and that is not a bug.** 25 POSTs to `:8082` all passed; the same 25 against the exported bundle gave exactly 20 then `429`. The dev server re-evaluates the route module per request to pick up edits, re-creating `buckets` empty every time. | **Verify rate limiting only via `npx expo export -p web` + `npx expo serve`.** A dev-server run looks exactly like a broken limiter. |
| 21 | **ScreensDesign results routinely exceed the tool-result limit** and are written to a file instead. | Parse the file with `jq`/`python3` — §2.1. Do not retry with a smaller `limit` and lose coverage. |
| 22 | **`screens[].description` is an OBJECT, not a string.** `jq '.description[0:200]'` errors with `object cannot be matched, as it is not a string`. | Reach for `.description.exhaustive_description`, and do not miss **`.description.visible_text`** — the array of every string on the screen. |
| 23 | **`portfolioValue()` once ignored open option contracts**, producing a phantom `-$781.06` loss the moment a user opened a position. | Any new asset class must be added to `portfolioValue()` in the same commit that lets a user hold it. |
| 24 | **"No trades yet" showed while holding 3 AAPL.** The condition keyed on `ret === 0`, and buying at market leaves return *exactly* zero. | Empty states key on **activity**, never on a computed value that can legitimately be zero. |
| 25 | **`valueHistory` snapshots written before a formula change carry the old formula.** The chart shows a historical dip that no longer reflects how value is computed. | **Deliberately not rewritten.** Restating stored history to match a later formula would make the chart a claim about the past that the past never made. Leave it; document it. |
| 26 | **The rtk hook rewrites and truncates `grep`.** Output arrives as mangled `path:line:col` fragments. | For exact text use `Read` or `python3`, not `grep`. |
| 27 | **A `require()` "to break an import cycle" needs the cycle verified.** One was added to `lib/api.ts` with that justification. There was no cycle — `stocks.ts` imports nothing. It cost a lint warning. | Trace the import graph before justifying a workaround with it. |
| 28 | **zsh globs `?` in an unquoted URL.** `curl http://x/api/market?action=movers` fails with `no matches found`. | Quote every URL containing `?` or `&`. |
| 29 | **Python heredoc anchors must be grepped from the real file first.** Two `assert ... in s` failures came from anchor strings that did not match actual file content. | Read or grep the exact text immediately before writing the replacement. |
| 30 | **Two booted simulators exist on this machine.** "iPhone 17" is booted and does NOT have the app. Without `EUPHORIA_UDID`, `sim.sh` may pick it. | `export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90` in every shell. |
| 31 | **A device-clock trial is trivially bypassed** — change the date, or delete and reinstall. | Ship it anyway as a *courtesy* trial, but **never describe it as enforcement**, and put the real entitlement behind RevenueCat/StoreKit (Unit 12). §9.8. |

---

# §5. DECISIONS LOCKED WITH THE USER

Twenty questions asked across five rounds and answered. **Settled — do not relitigate.** Surface a
concern once if the data contradicts one, then follow the decision.

| # | question | answer | note |
|---|---|---|---|
| 1 | Runtime | **Work now, continuously, locally** | Not a cloud routine. A cloud agent cannot reach the simulator, `sim.sh`, ScreensDesign MCP, or `.env.local`. Every real bug found so far came from device measurement. |
| 2 | Tab count | **Decide from research, report the hit rate** | User dislikes "only five tabs" but wants data to decide. |
| 3 | Rate-limit identity | **Device-scoped NOW + Supabase scaffolding behind a flag** | Both, explicitly. **DONE — Unit 1.** |
| 4 | Article source of truth | **`~/euphoriaweb-current`, synced** | `digest-content.ts` says AUTO-SYNCED / DO NOT EDIT. |
| 5 | Article topics | **All three streams** | curriculum gaps + market literacy + 18–25 life-stage. |
| 6 | Styling | **NativeWind on NEW surfaces only** | Do NOT migrate the ~50 existing `StyleSheet` files. |
| 7 | Graphics | **Hand-authored SVG system + generated hero art** | Generated only where style drift is tolerable. |
| 8 | Review gating | **One consolidated pass at the end** | Unit 14. |
| 9 | You tab purpose | **Motivation + conversion, AND identity/stats** | |
| 10 | Home | **Quests AND path AND richer hero** | All three. |
| 11 | Learn | **Full Promova-style redesign** | Upgraded from audit-only. |
| 12 | Trade news | **Horizontal image gallery preferred** | Research confirms. |
| 13 | Git | **Commit per verified unit, push at milestones** | |
| 14 | Article shape | **Match existing exactly, AFTER research** | |
| 15 | Reference apps | Duolingo, Bloom, Investing.com, Brilliant, the $250k–750k cohort | |
| 16 | Time budget | **Do not cut scope** | |
| 17 | **Trial model** | **3 days, then hard gate on lessons and Pro content** | New. §9. |
| 18 | **Component library** | **Find one with good topic icons (e.g. "investing fundamentals")** | New. §10. |
| 19 | **Completeness** | **"This app is complete today"** | Interpreted in §8.0. |
| 20 | **Cost/context** | **Never mentioned. Quality only.** | §0.1. |
| 21 | **App vs web** | **THE APP LEADS. More content, more features, deeper tooling; the web site is the shopfront.** | New, 2026-08-08. See C56 — this has an ongoing cost and every future feature now needs an explicit app-or-both decision. |

---

# §6. BANKED RESEARCH — do not re-pull any of this

## 6.1 Duolingo — app `862`

**$48,000,000/mo · 5,000,000 downloads/mo · 4.7★ · Education.**
Onboarding: **13 steps**, 5 quiz questions, 3 reinforcement screens, 1 paywall, notification warm-up
present, no social proof.

Dataset-flagged distinctives:
- **Conversational onboarding quiz** — the entire quiz is a chat with the mascot (uniqueness **8**).
- **Interactive widget setup guide** (uniqueness **9**) — a dedicated animated tutorial for a
  system-level feature; the dataset itself notes this "highlights its strategic importance for
  retention."
- **Streak commitment goal-setting** (uniqueness **7**) — the app asks the user to *proactively
  commit* to a multi-day streak goal, framing daily use as a personal challenge from the start.
- MotionPolish: "several unique and polished animations for character interactions, loading states,
  and tutorials."

**Gating screens found (new this round):**
- `112782` pos 137 — Leaderboards placeholder: three greyed avatars with placeholder bars, and the
  line **"Finish 7 lessons to start competing on Leaderboards!"** A locked feature that states its
  own unlock condition, in place, without a paywall.
- `112781` pos 136 — the same gate as a card with a stylised three-tier leaderboard mockup.
- `112810` pos 165 — "2025 Badges" grid where **March through December each render a lock icon**.
  Locked future content shown as a grid of locks, not hidden.
- `112707` pos 62 — **feature comparison table** contrasting SUPER and MAX across "Unlimited
  Hearts", "No ads", "Personalized Practice".
- `112733` pos 88 — subscription management with a **"Manage Features"** section that toggles
  *Unlimited Hearts* and *Super App Icon* — the plan page does real work, it is not just a receipt.

## 6.2 Coinbase and Robinhood — NOT IN THE DATASET

`search_apps app_name="Coinbase"` → **`total: 0`**. Same for Robinhood.
Do **not** substitute another app and call it Coinbase. Use `search_store_screens` for App Store
creative and label it as store creative, not recorded screens.

Robinhood's options layout was therefore specced from **Robinhood's own published support docs**:
*"calls and puts organized side-by-side, and strike prices in the middle"*, plus a "focused view"
toggled by tapping a heading. Robinhood ranges are **1D 1W 1M 3M 1Y ALL — no 1H, no YTD** (both of
those are Euphoria's own additions). Robinhood intervals: 1D → 5–10 min, 1W → 10–30 min,
**1M → 1 hour** (not daily — this was corrected once already).

## 6.3 Bloom — app `2004` — the closest positional competitor

"Bloom: Learn to Invest", Contour Labs. 4.8★, 50,000 downloads/mo, **230 recorded screens**,
`latest_app_video_id: 2079`. **ScreensDesign has NO revenue estimate (0 for every month of 2026).**
External reporting: **~$3.5M ARR ≈ $291k/mo**, **$15/mo or $120/yr**, ~2M users, $4.4M raised.
Treat the external figure as a signal, not verified — but it places Bloom inside the $250k–750k/mo
cohort.

> **PRICING FINDING, directly actionable:** Bloom charges **$15/mo · $120/yr** for financial literacy
> modules **plus** fractional investing — essentially Euphoria's Learn + Trade bundle. Euphoria asks
> **$9.99/mo · $59.99/yr**, roughly **half**. Revisit before IAP ships (Unit 12).

**Bloom's onboarding, 10 steps, 0–115s:** ATT prompt → value proposition → welcome with **press
mentions (Forbes, Fox Business, Yahoo Finance)** → auto-scrolling **feature carousel** → **social
proof** (1M+ users, 4.7★, testimonials from UC Berkeley / Harvard students) → phone-number signup +
SMS code → **"How did you hear about us?"** → name/email/DOB → custom notification + biometric
warm-up → "You're in!"

**Main flows (usable with `search_flows` by id):**

| id | flow | time |
|---|---|---|
| 53302 | Exploring Stocks — dashboard → ETF → chart → timeframes → **chart-type toggle** | 150–193s |
| 53303 | Using AI Chat — ask about a specific stock | 193–215s |
| 53307 | Subscribing to Plan | 353–363s |
| 53304 | Taking a Lesson & Quiz | 406–532s |
| 53305 | Creating a Portfolio — "playlists", named, curated | 580–663s |
| 53308 | **Claiming a Reward — scratch card → free stock** | 858–920s |
| 53306 | Inviting a Friend — contacts → pre-populated SMS | 1227–1282s |

**Reward loop frames (53308), already mined:**
- `156271` @860.5s — *"Woohoo! You passed & earned 3 free stocks!"*, "Questions completed 5/5",
  "Oinks earned 123", button **"Claim Free Stocks"**
- `156274` @878.9s — *"NOW SCRATCH THE CARDS!"*, stack of face-down cards, hand-on-question-mark
- `156275` @885.3s — reveal: confetti, tilted card, *"CONGRATS! YOU GOT SHIFT4 PAYMENTS"*, FOUR, **$1.00**
- `156277` @894.8s — banner: *"Oinks are rewarded only when sharing to your friends or social media"*
- `156278` @902.5s — *"SCRATCH THE NEXT CARD"* · `156279` @906s — SHOP **$0.50** · `156281` @915.3s — UPST **$1.00**
- Onboarding claim `156127`: *"Bloom users earn around $6 per month from learning and playing."*

**Bloom's LOCKING mechanics (new this round — directly relevant to Unit 10):**
- `156253` pos 136 — a list of **educational financial terms that are currently LOCKED**, rendered
  as three vertical cards on a deep purple background with a currency counter showing `16`.
  Locked content is **shown, titled, and counted** — not hidden.
- `156247` / `156248` pos 130/131 — the **DICTIONARY** header carries a
  **"Practice with flashcards" button WITH A LOCK ICON**, plus `0/240 earned today`. The gate lives
  **on the control itself**, in place, not on a separate screen.
- `156282` pos 165 — a **locked wallet icon with a coin and a live countdown reading
  `1d 23h 59m 19s to expire`**. A time-limited unlock with a visible clock.
- `156322` pos 205 — **"Daily Trivia Streak"** with a three-day tracker where **Day 1 is completed
  and Days 2 and 3 are locked**. A three-day arc rendered as a progress object.
- `156245` pos 128 / `156287` pos 170 — lesson-node modals over the winding path: title, difficulty
  (`EASY`), coin reward (`150 coins`), `Start` button.

**Bloom's Discover tab (`156152`):** search bar + segmented **Stocks | Portfolios | Community**;
**"Markets are up today"** with S&P 500 +0.99% and NASDAQ cards; "Earning calendar" link;
**"Trending stocks"** with fire icons; "Auto-invest with top investors" (Warren Buffett portrait);
"Get personalized stock picks".

**Stock categories (`156223`):** Top 25, Technology, Shopping & Retail, Food & Drink, ETFs, Dividend
Stocks, Media & Telecom, Finance & Banking, Transportation, Healthcare — each with logos and a count
badge.

**Key statistics (`156167`):** 52 Week High $613.23 / 52 Week Low $481.80 / Dividend Yield 1.19% /
Today's Volume 86.22M / Avg Daily Volume 80.93M, plus "Top holdings" for ETFs.

**Auto-Portfolios (`156224`, `156236`):** Nancy Pelosi +31.00% / 5806 investors; Bill Ackman +18.00%
/ 3831; Ray Dalio +11.00% / 460. Detail shows Yearly avg / Last year / **Trade delay 14 Days** and
"Current stocks (11)" with % allocations.

**Bloom mechanics DELIBERATELY NOT COPIED, and why:**
- **Auto-Portfolios** (Pelosi/Ackman/Dalio with investor counts) — needs real 13F holdings data and
  implies tracking politicians' trades. A large claim with no source behind it.
- **Playlists with public usernames, emoji reactions, "REACT FOR OINKS"** — requires a social graph
  and a soft currency, neither of which exists. Both would be dead controls on day one.
- **"Bloom users earn around $6 per month"** — a revenue promise Euphoria cannot make.

## 6.4 The cohort — $250k–750k/mo, Education + Finance

`search_apps category=[Education, Finance] min_revenue=250000 max_revenue=750000` → **71 apps**.

Top of band: Praktika `1816` $750k · Bloomberg `1580` $750k · Elevate `1395` $750k · PlantIn `998`
$750k · HelloTalk `990` $750k · Waking Up `900` $700k · Gauth `39` $600k · Astra AI `2190` $550k ·
Lingvano `820` $550k · Kahoot `1544` $550k · Busuu `981` $550k · Zutobi `105` $550k · flowkey `939`
$500k · ELSA `1394` $500k · Investing.com `1171` $450k · Nibble `918` $450k · Deepstash `422` $450k ·
CNBC `212` $450k · LangLearn `2027` $400k · Mondly `1388` $350k · EWA `849` $350k · YNAB `344` $350k ·
Yuno `415` $350k · Solvely `826` $350k.

Above band: Quizlet `874` **$2.25M** · TradingView `858` $2.25M · Kling `1699` $2.25M ·
Meetup `107` $1.75M · Invoice2go `727` $1M · Loora `1134` $1M · Epic `921` $800k.
Also useful: Promova `936` $250k · Airlearn `1682` $250k · Ling `1149` $250k · Micro Learning `1766`
$250k · BoldVoice `467` $250k · Plantaria `1263` $250k · RiseGuide `2467` $250k ·
Speech Blubs `59` $450k · Yahoo Finance `1542` · Answer.AI `1089` $75k.

**Shape of the cohort, worth confronting:** of the 30 highest earners in the band, roughly **20 are
Education and exactly ONE is Finance** (Investing.com). Euphoria sits in the gap between them — that
is either the opportunity or the reason nobody is there. Resolve it before adding tabs (Unit 9).

## 6.5 Convergence already counted — DO NOT REDO

**AI tutor chat** (Praktika 1816, Astra 2190, Promova 936, Answer.AI 1089, Solvely 826):
mascot in the thread **5/5** · action-naming input placeholder **5/5** · header carries CONTEXT not a
title **4/5** · suggested follow-up chips **3/5** (3/3 among text tutors) · feedback controls **3/5**
(cut — no telemetry) · usage meter in-thread + upgrade **3/5** · explicit thinking state **2/5** ·
AI disclaimer **1/5** (shipped anyway on domain-risk grounds, labelled as such).

**Settings** (Elevate 1395, Praktika 1816, Meetup 107, Kling 1699, Loora 1134):
plan/account status in settings **5/5** · help + legal **5/5** · a preference that tunes the CORE
LOOP **3/5** · notifications with a stated reminder time **3/5** · restore purchases **3/5** ·
sign out at the bottom **3/5**.

**Charts** (TradingView 858, Bloom 2004, Yahoo 1542): timeframe row under the chart **3/3**, and
**all three recompute the headline change for the selected range** — that is the mechanism, not the
row.

**Trade** (Bloom, Investing.com, TradingView, Yahoo): Follow/watchlist beside Buy **3/4** ·
key statistics block **3/4** · movers **2/4** · category browse **1/4**.

**Digest** (Deepstash 422, Nibble 918, Bloomberg 1580): category organisation **3/3** ·
saved/library surface **3/3** · search on the feed 2/3 · streak + weekly strip 2/3 · reading-time
estimate 2/3 · continue-where-you-left-off 2/3 · featured hero 2/3.

**Options chain: NO STRONG MATCH.** Robinhood returns `total: 0`. Investing.com's "Contracts" tab is
a **futures month table**; TradingView's is an options **search list**. Neither is a chain. Specced
from Robinhood's support docs instead — see §6.2.

## 6.6 NEW — paywall, trial and gating research (pulled 2026-08-07)

This is the evidence base for **Unit 10**. Read §9 for the resulting spec.

### 6.6.1 The two-stage gate — Astra AI `2190`, screens 130 → 131 → 132

**This is the single most important reference in this document.** Pulled with
`screen_detail screen_ids=[323575] include_image=true neighbor_count=2`.

| pos | id | what it is |
|---|---|---|
| 130 | `323574` | **"Choose a subject"** — the real, functional screen the user was using. Search field, list of subject cards (Math, Physics, Chemistry, Computer Science, English, German, Spanish), "Add your subject". |
| **131** | **`323575`** | **THE GATE.** A modal sheet rises over that same screen, **which is blurred behind it**. Gradient border. Yellow four-point star above the sheet. Headline **"Upgrade to"** / **"learn faster"** with the second line in yellow. Sub-line: **"You've reached the limit of free."** Then a 🔒 lock glyph + **"Unlock 1000x more daily usage"**. One large blue **"Buy"** button. Below it, a pill: **"❤️ Why isn't Astra AI free?"** An `X` dismisses it. |
| 132 | `323576` | **THE PLAN PICKER.** "Get better grades and learn 2x faster" / "Everything you need to pass exams". Yearly/Monthly toggle with a **"Save 58%"** badge. Two plan cards — Plus $24/mo, Sigma $80/mo with "8000X MORE USAGE". "See all benefits" expander. "Ask parent to pay". Terms + Privacy. Social proof: **4.87** with five gold stars and laurels. |

**The four mechanisms that transfer, and why:**

1. **The gate is a MODAL over the blurred screen you were already using — not a route change.**
   The user keeps their place. They can see what they were reaching for. Dismissing returns them
   exactly where they were. Compare Euphoria today, which pushes to `/onboarding?step=paywall` and
   loses context entirely.
2. **The gate does not ask for money. It asks for intent.** One sentence stating the limit, one line
   stating what unlocking buys, one button. Pricing lives on the NEXT screen. This keeps the
   interruption small and the decision cheap.
3. **The gate names the limit in plain language:** *"You've reached the limit of free."* Not "Upgrade
   to Pro", not "Premium feature". It says what happened.
4. **"Why isn't Astra AI free?"** — a secondary link that *answers the resentment* rather than
   ignoring it. This is unusually honest for a paywall and it fits Euphoria's voice precisely.

### 6.6.2 The trial timeline — convergence 5/5 among trial apps

| app | id | screen | what it shows |
|---|---|---|---|
| Quizlet `874` | `147530` pos 7 | paywall header | dark header with a **timeline: "Free 7-day trial"**, start today, named end date, over a white body with plans |
| Quizlet `874` | `147608` pos 85 | paywall | dark-blue header explaining the trial terms with a **"Today" → "June 4, 2025"** timeline visual |
| Nibble `918` | `132921` pos 47 | "Free trial guide" modal | vertical timeline, three steps: **TODAY 🔒** / **DAY 5 🔔** / **DAY 7 ⭐**, each with copy: no payment now, a reminder before it ends, then billing |
| Promova `936` | `138757` pos 38 | paywall | **"Claim your free trial"**, vertical timeline: **Today** (unlocks lessons, ad-free practice, unlimited AI role-play) / **In 5 days** (reminder before the trial ends) / end |
| Zutobi `105` | flow `68560` | "Free Trial Paywall" | *"a hard paywall offering a 3-day free trial that converts to a weekly subscription. It includes benefits, social proof, and a trial timeline."* |
| Plantaria `1263` | flow `68000` | "Subscription Paywall" | *"a hard paywall presents a 3-day free trial (then weekly) and a lifetime purchase option, gating access to the rest of the app."* |

**Hit rate: 5/5 of the trial-offering apps put a timeline on or immediately before the paywall.**

> **CRITICAL RECONCILIATION.** Euphoria previously built a **standalone** trial-timeline screen and
> the user **rejected it outright** — git commit `59c27da`, *"Remove the standalone trial-timeline
> screen — user rejected it outright"*.
>
> **The research does not contradict that decision. It refines it.** In every one of the five
> references above, the timeline is a **component inside the paywall** (Quizlet: it IS the header;
> Promova: it is the body above the CTA) or a **dismissible explainer modal** (Nibble). **Not one of
> them is a full-screen step on the main path.**
>
> **Therefore: the trial timeline ships as a block inside the paywall. It never becomes its own
> route.** If you find yourself creating `src/app/trial-timeline.tsx`, stop — you are rebuilding the
> thing that was rejected.

### 6.6.3 Locked content, shown in place — convergence 4/4

| app | id | mechanic |
|---|---|---|
| Astra AI `2190` | `323529` pos 85 | numbered study path where **modules 3–6 render padlock icons**; titles still visible ("Arithmetic Series and Sigma…", "Quadra…") |
| Bloom `2004` | `156253` pos 136 | **locked financial terms** as three titled cards, with a currency counter |
| Bloom `2004` | `156247` pos 130 | **"Practice with flashcards" button carries a lock icon** — the gate is on the control |
| Duolingo `862` | `112810` pos 165 | **badge grid where 10 of 12 months are locks** |
| Duolingo `862` | `112782` pos 137 | greyed leaderboard + **"Finish 7 lessons to start competing"** — the lock states its own unlock condition |

**4/4 apps show locked content rather than hiding it, and 5/5 of those keep the item's title
visible.** The mechanism that transfers: **a lock is a promise, not a wall.** Hiding content makes
the app look small; locking it makes the app look larger than what you have paid for.

### 6.6.4 Countdown to expiry — Bloom `156282`

A **locked wallet icon with a coin** over a **live countdown: `1d 23h 59m 19s to expire`**. Bloom
renders time-limited access as a visible, ticking object. Directly applicable to "you have 2 days of
your trial left".

### 6.6.5 Usage-limit copy actually shipped by these apps

From `visible_text`, verbatim, for copy calibration:

- Astra AI: **"You've reached the limit of free."** · **"Unlock 1000x more daily usage"** ·
  **"Why isn't Astra AI free?"** · **"Improve grades or get a full refund"** ·
  **"Support free access to underprivileged students"**
- Astra AI in-chat: reached the limit for creating quizzes, *"suggesting an upgrade to continue"* —
  the limit is announced **inside the feature**, in the thread, not as an interstitial.
- Duolingo: **"Finish 7 lessons to start competing on Leaderboards!"**
- Quizlet: **"Annual + 7-day free trial"**, `$35.99/year`, **"Best Value"**, Monthly `$7.99/month`

---

# §7. THE GATE — run after EVERY unit, no exceptions

```bash
cd ~/euphoria-native
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90

npx tsc --noEmit                          # REQUIRED: "TypeScript: No errors found"
npx expo lint 2>&1 | grep problems        # REQUIRED: "50 problems (3 errors, 47 warnings)"
python3 scripts/certify.py | tail -2      # REQUIRED: "ALL ROUTES PASS 3a"
./scripts/sim.sh screen                   # READ THE REAL SCREEN
./scripts/sim.sh state '.'                # CHECK THE REAL STORE
```

**The 3 lint errors are pre-existing and are NOT yours to inherit blame for. A 4th IS.**
The three are `games/term-match.tsx:71`, `atlas-speech.tsx:34`, `number-rollup.tsx:29` — all
`react-hooks/set-state-in-effect`. **Baseline warnings: 47.**

If either number rises, **you caused it**. Find it with:
```bash
npx expo lint 2>&1 | grep -A4 "src/path/you/touched"
```
Fix it before moving on. Five self-inflicted lint problems have been found and fixed this way
already; the most recent was a `require()` justified by an import cycle that did not exist.

**When the unit touched an API route, the gate gains a fourth step:**
```bash
npx expo export -p web && (npx expo serve --port 8090 &) && sleep 6
# then the relevant curl assertions — see §8 Unit 1f for the shape
pkill -f "expo serve"
```

**Device check is not optional.** `tsc` green + lint green + certify green has coexisted with a
completely blank app (trap #2) and with a control that could not be tapped (traps #1, #4, #17).

---

# §8. THE UNITS

## §8.0 What "complete today" means

The user said: *"we need to make sure this app is complete today."* Read honestly, that cannot mean
"every unit below finished in one sitting" — Unit 9 alone is 35 authored articles. It means:
**there must be no incomplete-feeling surface left.** Every screen either does its job or says
plainly why it cannot (§0.4, §0.5).

**So the order below is dependency-ordered, then value-ordered.** Units 2–5 are the paywall spine
and unblock everything else. If time runs out, the app must be left at a **unit boundary with a
green gate and a commit** — never mid-unit. A half-migrated Learn tab is worse than an untouched one.

**Dependency graph:**
```
Unit 2 (components + icons) ─┬─> Unit 6 (You)   ─┐
                             ├─> Unit 7 (Learn) ─┤
                             ├─> Unit 8 (Home)  ─┼─> Unit 13 (revamp sweep) ─> Unit 14 (review)
                             └─> Unit 9 (Digest)─┤
Unit 3 (entitlement+trial) ──┬─> Unit 4 (gate)  ─┤
                             └─> Unit 5 (IAP)   ─┘
Unit 12 (graphics) ──────────────> Unit 9 (hero covers)
Unit 15 (widgets) is INDEPENDENT of all of the above, but 15b is native and slow — start it early if it is wanted at all.
```

---

## UNIT 1 — Rate limiting + Supabase auth scaffolding ✅ **DONE**

Committed as **`61f61ba`**, pushed. Do not redo. Summary so the next session knows what exists:

- `src/app/api/_limit.ts` — fixed-window counters keyed `${identity}:${scope}`, swept on write,
  `take()` / `limited()` / `identify()` / `budgetFor()` / `guard()`, plus a `__DEV__` self-check.
- Budgets applied at the TOP of all three handlers, before the key check and before any upstream
  call: chat 20/5min · market:search 60/min · market 120/min · market:logo 200/min · options 30/min ·
  **anon ÷3**.
- `store.installId` — persisted, excluded from `reset()`.
- `lib/api.ts` `apiHeaders()` sends `X-Euphoria-Install: currentUserId() ?? installId`.
- `lib/auth.ts` — Supabase scaffolding, `AUTH_ENABLED` false without both env vars, no client built.
- Client 429 handling: `ApiError('rate_limited')` mapped from **status**, `isRateLimited()` kept
  separate from `isLiveUnavailable()`, Atlas says *"You're asking faster than I can think. Give me a
  moment."*
- `.env.example` documents all six env vars with the EXPO_PUBLIC_ reasoning.

**Verified against the exported bundle:** 20 pass then 429 · `Retry-After: 300` · second identity
unaffected · anon gets exactly 6 · scopes independent. **Trap #20 was discovered here.**

---

## UNIT 2 — Component library + icon system foundation ✅ **DONE**

NativeWind 4.2.6 + Tailwind 3.4.19 pinned, Hugeicons behind `lib-icon.tsx`. Bundle +52 KB.
**Read §22 C1–C8 before touching icons** — this unit found three icon systems, not one.

**Why first:** every surface unit below (6, 7, 8, 9) needs these. Installing them mid-redesign means
half the app uses one system and half uses another.

### 2a — Research (before installing anything)

```
mcp__screensdesign__app_screens
  app_ids=["862","2004","936","1395","2190","918"]
  query="course category icons, subject tiles with illustrations, topic cards with symbols, learning path node art"
  limit=20
```
Then `screen_detail` `include_image:true` `neighbor_count:1` on the three most icon-dense results.

**The question you are answering:** do the $250k+ apps use a **generic icon set** for topic
identity, or **bespoke art**? Count it across ≥4 apps and report the hit rate. Known data points to
start from: Astra AI's "Choose a subject" (`323574`) renders **a distinct coloured icon per subject**
(Math, Physics, Chemistry, Computer Science, English, German, Spanish). Bloom's stock categories
(`156223`) render **real company logos plus a count badge**. Duolingo uses **bespoke character art**
throughout.

### 2b — The decision, and the tension you must resolve

The user asked for *"a good component library where it's going to have good components for stuff
like the investing fundamentals icon for the learn section."*

**There is a real tension here and you must not paper over it.** The existing plan says
*"no generic icon set — the hand-drawn art is the single most distinctive thing in this app."* Both
things are true. **Resolve it by splitting the job**, which is what §10 specifies in full:

- **Utility glyphs** (chevrons, close, search, bell, lock, check, share, plus) → **a library**.
  There is no differentiation in a chevron and hand-authoring 30 of them is waste.
- **Topic and course identity** (Investing Fundamentals, Behavioral Finance, Risk Management) →
  **bespoke, in the existing style**. This is where the app's character lives and where a stock icon
  pack makes it look like every other template.
- **The bridge:** pick a library whose **duotone/bulk** style sits close enough to the existing
  hand-drawn look that the two can share a screen without clashing.

Read **§10** for the full comparison, the recommendation, and the exact install commands.

### 2c — Install

```bash
cd ~/euphoria-native
npx expo install nativewind tailwindcss
npx expo install @hugeicons/react-native @hugeicons/core-free-icons
```

**`tailwind.config.js` must map `theme.ts`'s ramp** so tokens do not fork into two sources of truth:

```js
// tailwind.config.js — the ONLY acceptable shape. Values copied from src/constants/theme.ts.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'hsl(240 10% 4%)',
        card: 'hsl(240 10% 9%)',
        elevated: 'hsl(240 10% 14%)',
        border: 'hsl(240 10% 22%)',
        primary: '#A855EB',
        iconLilac: '#C89CF5',
        destructive: '#EF4444',
        warning: '#F5B33F',
        fg: 'hsl(240 5% 96%)',
        fgSecondary: '#C3BAD0',
        fgMuted: '#A79DB5',
      },
    },
  },
};
```

**Do NOT touch the ~50 existing `StyleSheet` files** (decision 6). NativeWind is for new surfaces.

### 2d — the library-glyph wrapper — ⚠️ **NOT** `src/components/icon.tsx`

> **CORRECTED 2026-08-07 (§22 C1). `src/components/icon.tsx` IS A LIVE COMPONENT** — the
> EUPHORIA_ICONS renderer, ~112 multicolor SVGs shared with the web app, 4 callers. Following
> this heading literally destroyed it once; it was restored from HEAD. **The wrapper that shipped
> is `src/components/lib-icon.tsx`** (`LibIcon` / `LibIconName`), and it holds ONLY the glyphs
> `ui-icon.tsx` lacks — `share` and `plus`. Read §22 C1 and C2 before touching any of the three
> icon systems.

Wrap the library so **no screen imports `@hugeicons/*` directly**. One wrapper means one place to
swap the library, one place to enforce sizing, and one place to keep the union narrow.

```tsx
// The union stays NARROW, exactly as ui-icon.tsx learned the hard way (trap #19).
// Use `satisfies`, never a Record<string,...> annotation.
const GLYPHS = { chevronLeft: ..., lock: ..., ... } satisfies Record<string, IconSvgObject>;
export type GlyphName = keyof typeof GLYPHS;
```

**`ui-icon.tsx` stays.** It holds the 24 hand-authored marks already in use. The new wrapper is
additive. Do not migrate existing call sites — that is churn with no measurable outcome (§0.6).

### 2e — Verification

```bash
npx tsc --noEmit
# Prove NativeWind actually compiles a class on device, not just that it installed:
# render one throwaway <View className="bg-primary h-10" /> on a dev-only screen, screenshot it,
# confirm the colour is #A855EB, then delete it. A config that silently no-ops is the failure mode.
```
Report the **bundle size delta**: `npx expo export -p web` before and after, `du -sh dist`.
If the icon package adds more than ~400KB to the bundle, switch to per-icon imports and say so.

**GATE. Commit:** `feat(ui): NativeWind + icon system foundation`

---

## UNIT 3 — Entitlement engine + the 3-day trial ✅ **DONE**

`src/lib/entitlement.ts` + `store.activeDays`. See §22 C13 for the four decisions taken with the
user, and C14 for the one finding that changed the API.

**Read §9 in full before writing any code.** This unit implements §9.1–§9.4.

### 3a — What exists today

- `isPro: boolean` in the store, persisted, **excluded from `reset()`**.
- `canAccessLesson()` and `freeLessonsLeft()` gate on `FREE_LESSON_LIMIT = 5`.
- `atlasLeft()` gates on `FREE_ATLAS_MESSAGES = 10`.
- `derivativesLeft()` gates on `PRO_DERIVATIVE_PREVIEW = 3`.
- **No time dimension at all.** No first-open date, no active-day list, no trial state.
- `dayKey()` and `weekKey()` helpers exist and must be reused.

### 3b — What to add (full spec in §9.3)

New persisted state: **`activeDays: string[]`** — distinct `dayKey()` values, appended on each
day's first meaningful action, capped at the trial length + 1 so it cannot grow forever.

New derived getters: `trialDaysUsed()` · `trialDaysLeft()` · `trialExpired()` · `entitled(feature)`.

**All of it goes in a new `src/lib/entitlement.ts`**, not scattered through the store. One module
answers "can this user do this?" so Unit 4's gate has exactly one thing to ask.

### 3c — `reset()` membership — the third exclusion

`activeDays` **must be excluded from `reset()`**, for the same reason `isPro` and `installId` are.
If resetting progress restarted the trial, the trial would be a button. Comment it explicitly next
to the existing two.

### 3d — Verification

You cannot wait three days. §9.7 gives you a `__DEV__`-only time-travel helper that seeds
`activeDays` with back-dated keys. Verify all four states on device and report the store JSON for
each: **day 1 / day 3 / day 4 expired / Pro**.

**GATE. Commit:** `feat(entitlement): 3-day trial clock and a single entitlement authority`

---

## UNIT 4 — The gate sheet + paywall redesign ✅ **DONE** (C37 · C39 · C52 · C53 · C54)

> **READ §22 C37–C40 FIRST. The status below and C35/C36 above it are BOTH OUT OF DATE.**
> The gate sheet **works** — it fires on the Learn node, it is an overlay, and dismiss keeps the
> user's place (C37). It is wired into Learn, the lesson route, Atlas and guide bodies. What is
> genuinely still owed: **trade/portfolio/watchlist and quotes/news** (C39), and the **paywall body
> redesign** — §9.6's plan cards and the trial-timeline block are still not built (C31 said so and
> it is still true).

`gate-sheet.tsx`, `trial-timeline.tsx`, `why-not-free.tsx` exist and are wired into `learn.tsx`.
**Still owed:** device verification (the overlay-not-a-route test), the PAYWALL BODY redesign in
`onboarding.tsx` (plan cards + `Save 50%` badge), and routing the OTHER gated surfaces — Atlas,
options, digest bodies — through the sheet. §4b's rule is that zero screens push to
`/onboarding?step=paywall` directly; several still do.

> **BLOCKED ON MCP QUOTA (user decision).** §0.2 makes ScreensDesign mandatory before design work,
> and the data budget is exhausted. Do not start until quota returns; then run the §14.2 call sheet
> AND finish the trial-timeline count to ≥4 apps (§22 C9).
>
> **Two decisions overrule the text below — read §22 C13 first.** The timeline ships as its own
> full-screen step, NOT a block inside the paywall. And every surface locks on expiry, not just
> lessons.

**Implements §9.5 and §9.6.** This is the highest-visibility unit in the run.

### 4a — Research (mandatory, even though §6.6 is banked)

```
mcp__screensdesign__screen_detail
  screen_ids=[323575, 323576, 132921, 138757, 147530]
  include_image=true
  neighbor_count=1
```
Look at them. §6.6 describes them; the images will tell you about spacing, weight and hierarchy that
prose cannot.

Then, for a fresh convergence count on how the *dismissal* is handled:
```
mcp__screensdesign__search_apps
  detected_patterns=["SpecialOfferPaywall"]
  category=["Education","Finance"]
  min_revenue=250000
  limit=12
```

### 4b — Build

- `src/components/gate-sheet.tsx` — the modal over the blurred current screen (§9.5).
- Rewrite the paywall body to carry the **trial timeline as a block**, never as a route (§6.6.2).
- Every gated control routes through the sheet. **Zero screens push to `/onboarding?step=paywall`
  directly any more.**

### 4c — Verification

`./scripts/sim.sh screen` with the trial expired: confirm the sheet's labels are present, confirm
the underlying screen's labels are **still in the tree** (proving it is an overlay, not a route
change), and confirm the dismiss control is tappable via `sim.sh tapon`.

**GATE. Commit:** `feat(paywall): contextual gate sheet + trial timeline in the paywall`

---

## UNIT 5 — In-app purchase (RevenueCat) 🔶 **APPLE BLOCK CLEARED — ASC access obtained 2026-08-08** (C46 · C49 · C76)

**Without this, Unit 4 is the largest dead control in the app (§0.5).** They ship together.

`react-native-purchases` **10.7.0**. Full spec in **§9.8**, including the honest statement of what
cannot be verified without App Store Connect products and a sandbox tester.

**If the user cannot supply App Store Connect access today:** build the whole integration behind
`IAP_ENABLED = !!process.env.EXPO_PUBLIC_REVENUECAT_KEY`, ship the paywall showing real copy with
the purchase button **disabled and labelled with its own reason**, exactly like the options preview
cap does. Then say plainly in the report that purchases are not live and what is needed.

**GATE. Commit:** `feat(iap): RevenueCat entitlement wiring behind a flag`

---

## UNIT 6 — You tab redesign ✅ **DONE**

Plan status card, five tappable stat tiles, tappable ladder with thresholds, duplicate progress bar
removed. See §22 C19 and C26 for the options contradiction this unit exposed and resolved.

### 6a — Research

```
mcp__screensdesign__app_screens
  app_ids=["862","2004","1395","39","1134"]
  query="profile tab, stats, achievements, streak, subscription status, settings, rewards"
  limit=10
```
Then `screen_detail` `include_image:true` `neighbor_count:1` on the three most relevant.
**Count convergence across ≥4 apps. Report the hit rate in the commit body.**

Banked and reusable: **plan/account status in settings 5/5**. Gauth's profile carries `Gauth PLUS` +
renewal date, `Q&A history`, `Reminder`, `Feedback`, `Share with friends`. Bloom's carries an Oinks
balance, a public username, a reactions toggle, and created/saved portfolios. Duolingo's
`112733` shows a plan page that does **real work** — it toggles Unlimited Hearts and the Super app
icon — rather than being a receipt.

### 6b — What is wrong today, measured off the device

`src/app/(tabs)/you.tsx`:
1. League crest hero — "YOUR LEAGUE / Saver", progress bar, "390 XP to Investor"
2. "Your profile / Level 1" card with a **second progress bar** — two bars stacked, measuring
   different things, with no visual distinction
3. **Four inert stat tiles** — 1 Day streak · 2 Lessons · 110 XP · 0 Guides read.
   **None are tappable. None lead anywhere.**
4. LEAGUE LADDER strip — 7 tiers, not tappable, no thresholds shown
5. `ROWS` list — Friends, Games, Ask Atlas, Account, Notifications, Euphoria Pro, Preferences

**Defects:** nothing states plan status (5/5 convergence says it belongs at the top); nothing
converts; `rewardsEarned` exists in the store and is **invisible**; the tiles are dead ends; the
icons are the generic marks the user called out in a screenshot.

### 6c — Build

- **Plan card at the top.** Free / Trial (with days left) / Pro — driven by `entitlement.ts` from
  Unit 3. Shows `freeLessonsLeft()`, `atlasLeft()`, `derivativesLeft()`. Upgrade CTA opens the
  **gate sheet** from Unit 4, not the onboarding route.
- **Five tappable stat tiles**, each with a bespoke mark from Unit 12:

  | tile | value | destination |
  |---|---|---|
  | Day streak | `streak` | `/(tabs)/learn` |
  | Lessons | `completedLessons.length` | `/(tabs)/learn` |
  | XP | `xp` | `/league` |
  | Guides read | `readPosts.length` | `/(tabs)/digest` |
  | **Earned** | `money(rewardsEarned)` | `/(tabs)/trade` |

- **League ladder tiers become tappable**, each explaining its XP threshold from `TIERS`.
- Resolve the two-progress-bar collision: one is league progress, one is level progress. Either
  differentiate them clearly or merge them.

### 6d — Verification

`./scripts/sim.sh screen` before and after. **Report the tappable-element count before → after**
(count lines without `[DISABLED]` carrying `accessibilityRole="button"`). Screenshot both.

**GATE. Commit:** `feat(you): plan status, five tappable stats, bespoke marks`

---

## UNIT 7 — Learn tab: Promova-style density + course identity + locks ✅ **DONE** (C47)

### 7a — Research

```
mcp__screensdesign__app_screens
  app_ids=["936","862","2190"]
  query="learning path, lesson nodes, unit sections, progress trail, locked nodes, course header"
  limit=14
```
Banked: Promova shows **~14 nodes** with smaller nodes and inline titles. Astra AI `323529` shows
**locked modules 3–6 with padlocks and their titles still visible**. The handoff is explicit that
this is *"a different screen, not a spacing change."*

**Current state:** node pitch **100**, **5 lessons visible**, amber milestone badge every 5th node,
rail clears the tab bar by 118pt.

### 7b — Build

- Smaller nodes with inline titles. **Target ≥10 nodes visible.**
- **Course identity icon per course** — this is the "investing fundamentals icon" the user asked
  for. Twelve courses need twelve marks: `alternativeInvestments, appliedAccounting,
  behavioralFinance, businessStrategy, corporateFinance, financialAnalytics, globalEconomics,
  investingFundamentals, personalFinance, quantitativeAnalysis, riskManagement, wealthManagement`.
  See §10.4 for how to author these.
- **Locked nodes render locks with titles still visible** (4/4 convergence, §6.6.3), and tapping one
  opens the gate sheet.
- Preserve: milestone markers, the course header with % complete, `courseAccent` colours, and the
  measured 118pt tab-bar clearance.

### 7c — Verification

Count nodes in the viewport from the a11y tree, **before → after**. Report the number. If it did not
reach 10, §0.6 applies.

**GATE. Commit:** `feat(learn): denser path, course marks, locked nodes`

---

## UNIT 8 — Home: Duolingo mechanics ✅ **DONE** (C48)

### 8a — Research

```
mcp__screensdesign__app_screens app_id="862"
  query="home path, daily quests, streak goal, hearts, league, chest, daily goal" limit=14
```
Plus Bloom `2004` home (`156317`, `156322`). Banked: Duolingo's engine is daily quests feeding the
streak, plus **streak commitment** (uniqueness 7) and an **animated widget tutorial** (uniqueness 9).
Bloom `156322` shows a **three-day trivia streak tracker where days 2 and 3 are locked** — a
three-day arc rendered as a progress object, which is directly reusable for the trial.

### 8b — Build

**`src/lib/quests.ts`** — pure derivation, day-keyed with the existing `dayKey()`:

| quest | source | done when |
|---|---|---|
| Finish a lesson | `completedLessons` | count grew today |
| Read a guide | `readPosts` | count grew today |
| Make a trade | `valueHistory` | a snapshot exists today |
| Hit your goal | `minutesDoneToday()` vs `dailyGoalMinutes()` | met |

Pick 2–3 per day **deterministically from the day key** so they do not reshuffle on every render.

**Reward:** completing all of the day's quests grants a reward card — reuse `pendingRewards` and
`claimReward()`. That mechanic is already built and device-verified (MSFT $1.48 → 0.0033217371787678147
shares, exact). This gives the reward system a second source beyond lesson completion.

**Streak commitment:** ask once to commit to 3 / 7 / 14 days. Persist `streakGoal` (**add to
`partialize`**). Home shows progress toward the committed target, not just the raw streak.

**Trial banner:** while the trial is live, Home carries a compact strip — *"Day 2 of 3"* with the
three-day tracker shape from Bloom `156322`. On expiry it becomes the upgrade entry point.

### 8c — Verification

Complete a quest on device; verify `pendingRewards` grows and the reward screen presents.

**GATE. Commit:** `feat(home): daily quests, streak commitment, trial strip`

---

## UNIT 9 — Digest: manual review of all 25 + ~35 new guides ⚠️ **CONTENT PHASE CLOSED** (C57 — 35 guides ship clean; §9c's gap audit still never run)

**The largest unit. Budget accordingly.** Full manifest in §11.

### 9a — Research

```
mcp__screensdesign__app_screens app_ids=["422","918","1580","862"]
  query="article list, content feed, reading progress, categories, saved, daily" limit=10
```
Banked: category organisation **3/3**; saved/library **3/3**; Deepstash shows "48 ideas | 16 mins";
Bloomberg shows "5 min read" and a category label above a bold headline.

### 9b — Manual review of all 25 (the user asked for this explicitly, twice)

Source of truth: `~/euphoriaweb-current/src/features/digest/content/posts/`.
For **each** of the 25 guides in §11.0, read the body and record:

1. **Does the excerpt state a surprise?** (§11.0 has four exemplars.) If not, rewrite it.
2. **Is there a `lessonForGuide` mapping**, and does it point at a lesson that exists?
   **31 entries for 25 guides — find the orphans.**
3. **Does the `hero` key resolve** in `DIGEST_HEROES`?
4. **Is `readMinutes` honest** against word count at ~200 wpm?
5. **Is there a worked example with real numbers**, in the Maya/Marcos pattern the lessons use?
6. **Does the Bottom Line actually conclude**, or just restate the intro?

Write **`refs/DIGEST_REVIEW.md`**: one row per guide — `slug · excerpt-surprise? · lesson-map? ·
hero-resolves? · readMinutes-honest? · worked-example? · verdict · action`. Then apply the fixes.

### 9c — Gap audit

Map the 25 against the 12 curriculum courses in `src/lib/curriculum/courses/`. Find every concept
with a lesson but no guide. Known thin categories: **Credit (3)** and **Strategy (4)** against
Money basics (7).

### 9d — Write the 35 new guides

Full manifest in §11. Every guide ships: `slug` · `title` · `excerpt` (**must state a surprise**) ·
`category` (one of the five existing) · `date` · `readMinutes` (honest) · `hero` (new SVG, Unit 12) ·
body in the existing section rhythm (hero → lead → Key Takeaways → explanation → worked example →
The Bottom Line) · **and** a `lessonForGuide` entry pointing at a lesson that exists.

### 9e — Sync

```bash
cd ~/euphoria-native && ./scripts/sync-digest.sh
```
Regenerates `digest-content.ts`, `digest-bodies.ts`, `digest-heroes.ts` — all marked AUTO-SYNCED /
DO NOT EDIT. **Never hand-edit the native copies.**

### 9f — Gating

Free/trial users see all titles and excerpts; bodies beyond the free allowance render the gate sheet
over a blurred first screen of the article (§9.5). **Titles stay visible** — 5/5 convergence
(§6.6.3).

### 9g — Verification

Digest renders ~60 guides; every category chip filters correctly; the "X of Y read" counter is right;
**every guide's CTA resolves to a real lesson** (walk a sample of 10 on device).

**GATE. Commit:** `content(digest): review all 25, add 35 guides across three streams`

---

## UNIT 10 — Trade news gallery ✅ **DONE** (C64)

### 10a — Research
```
mcp__screensdesign__app_screens app_ids=["1580","1171"]
  query="news feed with images, hero card, related news, market news" limit=8
```
Banked: Bloomberg leads with a hero image + headline; rows are `SOURCE · time-ago` then a bold
headline. Investing.com scopes "Related News" to your holdings — the more useful variant.

### 10b — Build
Horizontal image cards below the News/Options/Search action row in `src/app/(tabs)/trade.tsx`, fed by
`getNews()`. **Falls back to text rows with no key — never placeholder headlines.** Reuse the Alpha
Vantage sentiment badge already built in `news.tsx` (colour by `sentiment`, hidden when absent
because Polygon articles carry none).

**GATE. Commit:** `feat(trade): news gallery`

---

## UNIT 11 — Tab structure decision ✅ **DONE** (C30 · C50 — closed at 8 of 8, still five tabs)

Count tab structures across Duolingo `862`, Bloom `2004`, Gauth `39`, Elevate `1395`,
Investing.com `1171`, Nibble `918`, Praktika `1816`, Quizlet `874`. **Report the hit rate.**

Known data points: **Gauth ships TWO tabs (Home, Profile) at $600k/mo.** Bloom ships five
(Home / Discover / Learn / Games / Profile). Duolingo ships five. Investing.com ships five
(Markets / News / Ideas / Watchlist / More).

Then decide: add a **sixth tab (Rewards/Games)** — where the reward loop and league ladder would
finally live — or **densify Home** instead. **Decide from the count, not from taste.** If the data
argues for fewer tabs, say so plainly even though the user asked for more, then let them choose.

**Commit:** `feat(nav): <decision>` with the hit rate in the body.

---

## UNIT 12 — Graphics system ✅ **DONE** (C64)

Done: 12 course marks, 5 stat-tile marks, **300 per-lesson marks** (§22 C16), 40 stroke lesson marks.
**Still owed:** the 7 league crests refined, quest icons for Unit 8, and ~35 guide hero covers for
Unit 9 (authored in the web repo then synced, per decision 4).

Create `src/components/art/` and extend the existing hand-drawn style (`atlas.tsx`, `lesson-art.tsx`,
`league-crest.tsx`, `hero-tint.ts`).

**Deliverables:**
1. **5 stat-tile marks** for You — streak, lessons, XP, guides read, earned
2. **12 course marks** for Learn — one per curriculum course (§7b)
3. **7 league crests** refined (Saver, Investor, Analyst, Strategist, Portfolio, Partner, Magnate)
4. **Quest icons** for Home — one per quest kind
5. **~35 guide hero covers** for Unit 9, authored in `~/euphoriaweb-current/.../heroes.ts`, then
   synced. **Run every one through `npx svgo` before inlining** — `digest-heroes.ts` is already 113KB.
6. Generated hero art via `ecc:fal-ai-media` **only** for large one-off moments; **skip cleanly if
   there is no fal key** and say so rather than leaving a gap.

**Rule: no generic icon set for identity.** See §10. Utility glyphs come from the library; identity
art is authored.

**Testing tints:** do NOT test a hue-rotation on the **Credit** category — `#EC4899` pink is
pre-existing art there and the test passes for the wrong reason. Use **Markets → cyan (H188)**; no
cyan exists in the violet art, so the test can actually fail.

**Commit:** `feat(art): SVG mark system for stats, courses, crests, quests, covers`

---

## UNIT 13 — Full revamp sweep ✅ **DONE** (C65 · C67 · C68 · C69 · C71) — item 6's manual a11y pass still owed

The user asked for a **full revamp**. Units 6–12 redesign individual surfaces; this unit makes them
one app again.

1. **Consistency pass.** Walk all 18 ranked routes from `certify.py`. For each: does it use the
   token ramp, the type scale, and the same card radius? Record deviations in a table with
   `file:line`, then fix.
2. **Every empty state.** Each must either do something or say why it cannot (§0.4). Enumerate them
   from the a11y tree with an empty store.
3. **Every loading state.** No spinner without a shape behind it.
4. **Every error state.** No raw error codes reach a user (`chatErrorMessage` is the pattern).
5. **Dead-control audit.** Grep every `onPress` in `src/app/` and `src/components/`, and confirm each
   one writes state, navigates, or calls an API. **Inspect every hit — trap #5.** Report the count.
6. **a11y.** `python3 scripts/certify.py` must stay green; then a manual pass with
   `ecc:a11y-architect` on the new surfaces.
7. **Bundle.** `npx expo export -p web && du -sh dist` before → after. Report the delta.

**Commit:** `chore(revamp): consistency, empty/loading/error states, dead-control audit`

---

## UNIT 15 — Widgets + the notification system ✅ **DONE** (C58 · C60 · C63) — 15a-15e shipped; only the springboard RENDER is unverified, blocked by C63

**Researched 2026-08-08. Not started.** Read this whole unit before writing any code: the
headline risk is native, not visual, and one stated goal is not achievable as stated.

### 15.0 — THE CORRECTION THAT HAS TO COME FIRST

The ask was "well animated, Duolingo vibes". **iOS home screen widgets do not animate.**
WidgetKit renders a static SwiftUI timeline; there is no Rive, no Reanimated, no loop, and
`rive-react-native` cannot run in a widget extension. Duolingo's widget is a flame and a
number, and it does not move either.

**What IS animated in every reference is the TUTORIAL, not the widget.** That is where the
animation budget belongs, and it is in-app, so Reanimated and the existing motion system
apply normally. Anyone planning a moving widget is planning something iOS will not render.

### 15.1 — Research, in pixels

**Widgets. Only 2 apps in the set ship a widget flow, which is BELOW §0.2's >= 4 threshold.
Do not quote a hit rate as though it were convergent.** Headway (`891`) has no widget at
all; it invests in notifications instead. Report it as "2 of 2 that have one", never "2/2".

| pattern | Duolingo `862` | Elevate `1395` |
|---|---|---|
| promo screen: widget preview + `ADD WIDGET` + `NOT NOW` | `112661` | `111696` |
| a step-by-step visual tutorial of the iOS gesture | `112662`, `112663` (2 steps) | `111697`-`111699` (3 steps, with dots) |
| the widget shown is the **STREAK** | flame + `1` | flame + `4` + "Nice job!" |
| an opt-out always offered | `NOT NOW` | `Not now` |
| asked **more than once**, with a different pitch each time | 3 times | 2 widgets, 2 flows |

**Duolingo asks three times and never repeats its argument**, which is the mechanism worth
copying:
- `112661` **emotional**, in onboarding: Duo says *"I'll cheer you on from your home screen!"*
- `112677` **statistical**, later: *"Learners with our widget are 60% more likely to keep
  their streak for a month!"*
- `112739` **transactional**, later still: *"Add the Duolingo widget to your home screen to
  earn an XP Boost."*

Elevate instead ships **two different widgets** (`Streak`, `Words of the Day`) each with its
own 3-step tutorial, and its tutorial art is a realistic iOS jiggle-mode mockup rather than
a stylised one.

**Notifications, and Headway `891` is the reference.** The mechanism Euphoria lacks:

- `128567` a **warm-up that captures the TIME** ("21 days may be a great start to build a
  habit", with a scroll picker on 11:00 PM) shown BEFORE the system prompt `128568`. The
  user chooses when, then iOS asks whether.
- `128564` streak commitment with **named** tiers, 7 Promising / 14 Determined / 30
  Impressive / 50 Unstoppable. Already shipped on Home in Unit 8 (C48/C25).
- `128620`, `128657` a streak modal: flame, `1-day streak`, seven day-dots, and the rule
  stated plainly: *"Finish 3 key points every day to extend your streak. Miss a day and it
  resets to 0."*
- `128565` a stat with a **cited footnote**: `+40% habit`, *"Based on internal research,
  2025"*. If Euphoria ever quotes a retention number it needs a source line like this, or
  it is an invented figure and §0.4 applies.

### 15.2 — What already exists, so nothing gets rebuilt

- `src/lib/notifications.ts` — `applyDailyNudge()` returns what the OS **actually**
  scheduled; `NUDGE_HOUR = 19`, **hardcoded and never asked for**. That is the gap Headway
  `128567` fills.
- C45's trial reminder: armed from a module-scope store subscription, keyed on `days:isPro`,
  verified against SpringBoard's `UserNotificationsServer` log rather than a read-back.
- **No widget of any kind.** No extension, no App Group, no shared container.

### 15.3 — The real blocker, and it is native

An iOS widget is a **separate WidgetKit extension target written in SwiftUI**. Three
consequences, all of which cost time before a single pixel is designed:

1. **`/ios` is gitignored and regenerated by `prebuild`** (CARRYOVER). A hand-added target
   is destroyed on the next prebuild. The extension must be added by an **Expo config
   plugin** (`app.json` -> plugins) that recreates the target every time, or the repo must
   stop regenerating `/ios`. **Decide this before starting.**
2. **Data crosses a process boundary via an App Group.** The widget cannot read zustand or
   AsyncStorage. The RN side must write streak/XP/day-count into a shared
   `UserDefaults(suiteName:)` container, and the widget reads that. Add the App Group
   capability in the plugin, not by hand in Xcode.
3. **A widget needs a real build to test.** Fast Refresh does not apply. Expect a full
   `expo run:ios` per iteration, and check `strings` on the built binary the way C46 did for
   RevenueCat.

### 15.3b — DECISIONS TAKEN WITH THE USER, 2026-08-08

**1. Full widget push, 15b through 15e in order.** Not the JS-only start. The native unknown
is accepted deliberately, so **15b is a go/no-go gate**: if the config plugin's target does
not survive `npx expo prebuild --clean`, stop and re-decide rather than hand-patching
`/ios`, which is gitignored and will be regenerated.

**2. The statistical ask STAYS. My "we cannot say that" was too strict and was corrected.**
§0.4 forbids presenting absent or modelled data **as if it were measured**; it does not
forbid a sourced claim. Headway `128565` shows the correct frame: `+40% habit` with
*"Based on internal research, 2025"* printed under it. **The footnote is the mechanism.**

Permitted, in preference order:
- **Mechanism, no number** — *"A streak you can see is a streak you keep."* Nothing to
  defend, and it may well outperform a borrowed statistic
- **Attributed** — *"Duolingo found learners with a widget were 60% more likely to keep a
  month-long streak."* True, citable, and the attribution must be VISIBLE, not a footnote in
  a doc. Cost: it names a competitor inside our onboarding
- **Our own number** — only once telemetry exists. This is the single genuinely blocked one,
  because there is no backend

**Forbidden:** a bare number with no source line, because the reader will assume it is ours.
That is the $104,237.55 phantom portfolio in a different costume.

**3. FOUR widgets, and they ROTATE.** Both references ship a streak only; Euphoria ships a
set and cycles them. Divergence is deliberate (decision 21, the app leads).

| widget | source | note |
|---|---|---|
| Streak | `streak` | what both references ship; always true, never needs network |
| Today's Digest guide | `pickToday()` | already deterministic per day, so widget and app agree WITHOUT talking to each other |
| Next lesson | course + num + title | deep links straight into the lesson route |
| Portfolio value | `portfolioValue()` | **see the caveat below** |

> **The portfolio widget needs a staleness line and it is not optional.** This is paper
> trading, not live market data, so §0.4 is satisfiable — but iOS decides widget refresh
> timing, not us, so the number can be hours old with nothing on screen admitting it. It
> must carry an "as of" stamp, and it must never be presented as a live market value. The
> repo has already deleted one invented portfolio figure; a stale one on the home screen is
> the same defect with worse reach.

**4. The notification time picker goes in BOTH places.** Once in onboarding immediately
before the system prompt (Headway `128567`'s placement, which is what makes the prompt
convertible), and again as an editable row in Settings. One shared component, two mounts.
The Settings row is also what gives the feature a findable home.

**5. IF THE PLUGIN FAILS: commit `ios/` and stop regenerating it.** Decided in advance so
15b's gate has an answer rather than a discussion. Accepted costs, stated before the fact:
`ios/` enters version control, Expo SDK upgrades stop being clean, and prebuild-set values
become ours to maintain — CARRYOVER notes `CADisableMinimumFrameDurationOnPhone` is one of
them, so 120Hz uncapping must be pinned in `app.json` or it is silently lost. **This is hard
to reverse; try the plugin properly first.**

**6. ONE widget entry, cycling content.** Not four gallery entries. A single "Euphoria"
widget whose content rotates across streak, today's guide, next lesson and portfolio on
iOS's refresh schedule. The user gets variety without a gallery full of our name and without
a configuration surface. Two consequences to design around:

- **The user cannot choose what they see**, so every rotation state must be worth showing on
  its own. A widget that surfaces the portfolio to someone who has never traded is a bad
  frame; gate each state on having data rather than rotating blindly.
- **iOS owns the refresh clock**, so rotation is a timeline of entries handed to WidgetKit
  in advance, not a timer we run. Build the day's entries in one pass.

### 15.4 — Build order

**15a. Notification time picker.** Smallest, entirely JS, no native work. Add a warm-up
before the permission prompt that captures the hour, replacing the hardcoded `NUDGE_HOUR`.
Verify against the SpringBoard log per C45, including the positive control.

**15b. The widget extension, empty. GO/NO-GO GATE (see 15.3b decision 1).** Config plugin + App Group + a widget that renders a
hardcoded flame and number. Ship nothing user-facing. This step exists to prove the plugin
survives a prebuild, and it is where the schedule risk actually lives.

**15c. Real data through the App Group.** Write `streak`, `xp`, `dayKey` on every store
change that touches them; widget reads and renders. Verify by changing the streak in-app and
watching the home screen update.

**15d. The three-ask promo flow.** In-app, animated, Reanimated. Duolingo's shape: emotional
in onboarding, statistical later, transactional later still, `NOT NOW` always present. **Do
not invent the statistic** (§0.4) — either measure it or use the transactional and emotional
asks only.

**15e. The tutorial.** Elevate's 3 steps with pagination dots, animated in-app. This is the
only place the "well animated" goal can actually land.

### 15.5 — Verification

- Widget renders on the springboard with real streak data, screenshot read, not inferred
- `strings` on the built app confirms the extension is in the binary
- A prebuild is run and the target survives it. **This is the test that matters**
- Notification: OS log shows the request at the user-chosen hour, plus a negative control
- `sim.sh screen` on the promo and tutorial screens; `NOT NOW` is reachable at >= 44pt

**GATE. Commit:** `feat(widget): streak widget, App Group data, and the three-ask flow`

---

## UNIT 16 — App Store listing assets

**Added 2026-08-08 at the user's request, with `https://developer.apple.com/app-store/asset-best-practices/`
as the source. Runs AFTER units 10/12/13 and IMMEDIATELY BEFORE Unit 17** — the listing must
reflect the finished UI, and reshooting it before 13's revamp sweep is wasted work.

**Why this is a unit and not a chore.** It is the only surface upstream of everything else in the
funnel. Churn cannot happen to a user who never installs, and Unit 17's entire funnel starts here.
It is also the one place Euphoria can measure conversion **without any SDK at all** — see 16c.

### 16a — Apple's stated rules, from the source page (not remembered — fetched 2026-08-08)

| asset | hard numbers |
|---|---|
| screenshots | **up to 10** on the product page, **only 3 appear in search results** |
| app previews | **up to 3**, autoplay **muted**, and they **repeat** |
| icon | must be legible at *every* size; Apple points to Icon Composer for layered/Liquid Glass |
| in-app events | landscape **16:9** card + portrait **9:16** detail, both required |

**Content rules that constrain the design:**
- Lead with the strongest benefit; sequence the shots as **one cohesive story**, not a feature list
- **Do not** spend a whole asset on accolades or a call to action
- Keep the focal point **centred** — assets get clipped differently per device
- Previews must **loop seamlessly**, work **silently first**, and avoid quick cuts (accessibility)
- The **poster frame** is a real design job: it is what people see before the video plays

**Prohibited, and two of these bite us directly:**
- **No pricing or discounts in assets.** So Unit 17's `-44%` framing CANNOT appear in a screenshot
- **No Apple recognitions** (Editor's Choice, Design Award badges) and **no unverified claims**
- No other-platform logos, no URLs, no copyright symbols
- **Every asset must meet a 4+ age rating**, whatever the app's own rating is

### 16b — Research

Zogo, Stash, Greenlight and NGPF are **not in the recorded dataset** (§2.1). Use
`search_store_screens` for their App Store creative and **label it as store creative, not a recorded
screen**. Count convergence across ≥4 (§0.2) on: how many shots are text-overlay vs raw UI, whether
the mascot appears in shot 1, and whether the first shot states the category or the benefit.

### 16c — Build, and the measurement that needs no SDK

Icon → 10 screenshots → 1–3 previews, in that order. **The first three screenshots carry the whole
search-result impression** and should survive being seen alone.

**Then turn on Apple's Product Page Optimization.** It A/B tests listing assets and reports which
converts, entirely inside App Store Connect, **with zero code in the app**. This is the one honest
number available before Unit 17's telemetry lands, and it satisfies §0.6.

### 16d — Verification

- App Store Connect's **preview tool** used before publishing — the page is checked as rendered
- The first 3 shots read correctly **in isolation**, at search-result size
- Each preview watched **muted** start to finish and confirmed to loop with no visible jump
- A PPO test is **running**, with a stated baseline conversion number

**GATE. Commit:** `feat(store): listing assets built to Apple's spec, with a PPO test running`

---

## UNIT 17 — Retention, churn and monetization

**Added 2026-08-08 at the user's request: *"think about churn, retention rate… making sure we are
the best app and best money that we make."* Runs after Unit 16, immediately before Unit 14.**

**The hard wall stays** (C28, reaffirmed again here). This unit attacks churn everywhere *except*
the wall.

### 17a — RESEARCH: DONE 2026-08-08. Do not re-pull it.

250 screens across **5 apps** — Duolingo `862`, Headway `891`, Elevate `1395`, Bloom `2004`,
Astra AI `2190` — queried for cancel/winback/retention. Hit rates reported honestly per §0.2:

| pattern | hit rate | evidence |
|---|---|---|
| **Cancellation is surfaced INSIDE the app, never hidden** | **5/5** | Duolingo `112837` Settings→Manage · Headway `128705` "You need to cancel your subscription before deleting your account" · Elevate `111787` help top-question · Bloom `156332` **featured** help article · Astra `323688` AI support canned prompt |
| "Cancel anytime" as trust copy **on the paywall** | **3/5** | Duolingo `112738` "Cancel anytime in the App Store" · Headway `128588` "2 taps to start, super easy to cancel" · Elevate `111687` "Cancel anytime" |
| Purchasable **streak protection** | **2/5** — below threshold | Duolingo `112735` "A Streak Freeze protects your streak for a day. You have 2 of 2 equipped." · Bloom `156314` "Buy for 200" |
| Rating prompt fired at a **high** moment, tagged `retention` | **2/5** | Bloom `156282` · Astra `323561` |
| Trial→annual upgrade **framed as a reward** | **1/5** — NOT convergence | Headway `128596`→`128597`, shown twice (pos 53 **and** 112) |

**THE MECHANISM WORTH COPYING, and it is 1/5 so it ships as a bet, not as evidence.**
Headway's flow is named in the dataset: **`Unlock Post-Subscription Offer`, flow `54941`, 11
seconds** (240s→251s). Verified in pixels, not from the description:

1. `128596` — **day 1 of the trial**, on the home feed, a gamified treasure-chest modal:
   *"First reward earned! This chest honors your commitment to grow."* → **`Unlock reward`**
2. `128597` — the "reward" is an **upsell**: *"Turn your trial into a lifetime discount"*,
   `-44% FOREVER · SAVE $40.00/Y`, `$89.99` struck through → **`$49.99/year`**, and the reassurance
   line *"$49.99 instead of $89.99, forever"*
3. `128598` — straight to App Store checkout: *"Your upgrade will start now. You'll receive a refund
   for the remainder of your current subscription"*

**Why it matters for a hard wall:** it converts the trial to **annual before the user ever reaches a
churn decision**, and an annual subscriber cannot churn monthly. It is the highest-leverage thing
in this entire pull.

**Duolingo does the same trick at the opposite end.** `112831` — Manage Subscription is **not a
receipt**: under "Current Plan / Next billing date" sits **"Offers for you"** with `UPGRADE TO
ANNUAL` and `UPGRADE TO SUPER FAMILY`. The screen a user opens *in order to cancel* is an upsell
surface. **1/5**, but it costs almost nothing to copy.

**NEGATIVE FINDING, and it changes the scope the user picked.** Across 250 screens in 5 apps there
is **no "before you go" cancel-interception save offer**. That is not pagination (trap #6) — there
is a **structural** reason: on iOS, cancellation happens in Settings / the App Store, **outside the
app**, so an app cannot intercept it. **A cancel-flow save offer is not buildable on iOS.** What IS
buildable is everything before it (17c, 17d) and the involuntary half (17e).

### 17b — Telemetry, and the promise it breaks

**Decision taken with the user 2026-08-08: FULL TRACKING.** Money-only measurement was offered and
declined; the user wants the in-app drop-off funnel.

- **`src/app/why-not-free.tsx` must be rewritten.** It currently states *"There is no ad SDK and no
  analytics in this app."* That becomes false. **This is copy, so §0.7 applies — bring the new
  wording back to the user, do not invent it.** The honest shape is roughly "we measure how the app
  is used; we never sell it", and the no-ads / no-data-sale half stays true and stays a real
  differentiator.
- Funnel to instrument, because this is the map that money-only data can never draw:
  `install → first lesson → day 2 return → day 3 → paywall seen → paywall dismissed → paid`
- Pair it with RevenueCat's subscription cohorts (trial→paid, churn, renewal) once C49's Apple
  block clears, and with App Store Connect's free retention cohorts.

**Nothing else in this unit can be judged by §0.6 until 17b lands. Build it first.**

### 17c — The reward offer (17a's headline mechanism)

Headway's chest, in Euphoria's voice, with Atlas rather than a treasure chest. Fires **during** the
3-day trial, not at its end. Converts monthly→annual at a real discount. **Annual is locked at
$79.99 (C31)** — the discount must come off that, and the discounted price is what recurs, which is
the whole point of "forever".

### 17d — The dismissal offer / second paywall (C24)

`SpecialOfferPaywall` = **9 apps** in the banked set, and the mechanism is a **second paywall on
dismissal of the first**. Researched in §6.6, **never built** — verified: no `specialOffer` /
`winback` surface exists anywhere in `src/`. This is the highest-convergence unbuilt lever we own.

### 17e — Involuntary churn

20–40% of subscription churn is **failed payments, not intent**. RevenueCat exposes billing-retry
and grace-period state; the app must **not** slam the hard wall on a user mid-retry — that converts
a recoverable card decline into a real loss. Plus: **surface subscription management in-app**
(5/5 convergence, 17a) and copy Duolingo `112831` by putting the annual upgrade **on that screen**.

### 17f — Activation and time-to-value

Retention is decided long before the wall: if the app has not visibly worked by day 1, day 3's
paywall is a formality. Banked and directly applicable: Duolingo's **streak commitment goal-setting**
(§6.1, uniqueness 7) and Astra `323517` Focus Mode — an activation-stage ask with `Maybe later`
always present, the same shape as the widget ask.

### 17g — Pricing and packaging

$9.99/mo and $79.99/yr stay (C31). What is open: introductory pricing, annual-vs-monthly framing
(C44's four-paywall plan-card convergence is banked and applies), and whether 3 days is right.
**Remember 16a: none of this discount framing may appear in an App Store asset.**

### 17h — Verification

- 17b's funnel produces **real numbers** for each step, read off the dashboard, not inferred
- The reward offer and the dismissal offer both reachable on device, `sim.sh screen`, CTA ≥ 44pt
- A user in billing-retry is **verifiably not** hard-walled (seed the state, assert the gate)
- `why-not-free.tsx` reads true against what the app actually does — checked line by line
- Baseline captured **before** each change, per §0.6

**GATE. Commit:** `feat(retention): telemetry, the trial reward offer, and the dismissal paywall`

---

## UNIT 14 — Consolidated review pass

Per decision 8, run at the very end.

- **`ecc:security-review`** — weight it on `_limit.ts`, `auth.ts`, `entitlement.ts`, the IAP wiring,
  and all four API routes. **This is where a real vulnerability can live.**
- **`ecc:code-review`** over the full diff.
- **`coderabbit:code-review`** as a second opinion.
- **`ecc:silent-failure-hunter`** — this codebase has many `safe()`-style catches by design; confirm
  each one is deliberate and none swallow something a user needed to know.
- **`ecc:council`** on three specific questions:
  (a) is the in-memory limiter's stated ceiling honest, and is the sweep correct?
  (b) does the tab-count data actually support the Unit 11 decision?
  (c) **is the 3-day trial honestly described everywhere it appears, given it is device-clock based
  and trivially bypassed?**

Fix every CRITICAL and HIGH. Log everything else to `refs/WORKORDER_ATLAS_TABS.md` with a verdict.

**Commit:** `chore: security + code review fixes`

---

# §9. THE PAYWALL AND THE 3-DAY TRIAL — full specification

Evidence base: **§6.6**. Implemented by **Units 3, 4 and 5**.

## 9.1 What the user asked for, verbatim

> *"we need to have paywall-gated stuff. For example, if they have already used the app for 3 days,
> that's our 3-day free trial. After that, they should just have to see something like, 'They can't
> unlock the paywall stuff anymore. They can't unlock the lessons or stuff like that. They have to
> buy it.'"*

Three requirements, unpacked:
1. A **3-day free trial measured in days used**, not a purchase-linked StoreKit trial.
2. On expiry, **lessons and Pro content lock**.
3. The user is **told**, clearly, that they must buy to continue.

## 9.2 The reading that matters: "used the app for 3 days"

Two possible readings, and they behave very differently:

| reading | rule | what happens to a user who installs and forgets for a week |
|---|---|---|
| **(a) calendar** | 3 days since first open | trial gone, having used nothing. Feels like theft. |
| **(b) days used** ✅ | 3 **distinct days on which they did something** | still has all 3 days waiting. |

**Ship (b).** It matches the user's words exactly ("used the app for 3 days"), it cannot be burned by
inactivity, and it is the version that survives an App Review conversation about fairness. Document
(a) as the rejected alternative so nobody re-opens it.

**"Did something" must be a real action**, not app launch — otherwise a mis-tap on the icon burns a
day. Define it as any of: completed a lesson step, read a guide, sent an Atlas message, or placed a
trade. That is exactly the set of actions that already write to the store.

## 9.3 State (Unit 3)

### Store additions — `src/lib/store.ts`

```ts
  /**
   * Distinct day keys on which the user did something real (a lesson step, a guide, an Atlas
   * message, a trade). NOT app launches — a mis-tap on the icon must not burn a trial day.
   *
   * DELIBERATELY EXCLUDED FROM `reset()`, for the same reason `isPro` and `installId` are: if
   * resetting progress restarted the trial, the trial would be a button rather than a limit.
   *
   * Capped at TRIAL_DAYS + 1 entries — once it is over, the exact count stops mattering and an
   * uncapped array would grow for the life of the install.
   */
  activeDays: string[];
```

Add to `partialize` (**`store.ts:10` is explicit about this**). Add to the type. Initial value `[]`.

### Marking a day

One action, called from the four places that already write:

```ts
  /** Idempotent. Call at the top of completeLesson, markPostRead, spendAtlasMessage, buy/sell. */
  markActiveDay: () =>
    set((s) => {
      const k = dayKey();
      if (s.activeDays.includes(k)) return s;              // idempotent — same day, no growth
      return { activeDays: [...s.activeDays, k].slice(-(TRIAL_DAYS + 1)) };
    }),
```

### `src/lib/entitlement.ts` — the single authority

**Everything that asks "can this user do this?" asks this module and nothing else.** One place to
read means Unit 4's gate has exactly one question to ask, and Unit 5 can flip the whole app to a
real receipt by changing one function.

```ts
export const TRIAL_DAYS = 3;

/** Free (before any use) | Trial (days 1-3) | Expired (day 4+, not paid) | Pro (paid). */
export type Tier = 'trial' | 'expired' | 'pro';

/** What a gate is protecting. Each maps to a copy string in §9.6. */
export type Feature = 'lesson' | 'guide' | 'atlas' | 'options' | 'quest-reward';

export function trialDaysUsed(s: AppState): number;   // s.activeDays.length
export function trialDaysLeft(s: AppState): number;   // max(0, TRIAL_DAYS - used), 0 when expired
export function tier(s: AppState): Tier;              // pro > expired > trial
export function entitled(s: AppState, f: Feature): boolean;
```

**`tier()` order matters:** `isPro` wins over everything. A paying user must never see a trial
countdown — that is the bug that generates refund requests.

### The interaction with the EXISTING limits

Euphoria already has `FREE_LESSON_LIMIT = 5`, `FREE_ATLAS_MESSAGES = 10`,
`PRO_DERIVATIVE_PREVIEW = 3`. **Do not delete them and do not stack them confusingly.** The rule:

> **During the trial, the count limits apply. After the trial, nothing applies — it is all Pro.**

So a trial user gets 5 lessons *and* 3 days, whichever runs out first. That is honest, it is simple
to say in one sentence, and it means the gate copy only ever has to explain one reason at a time.
**`entitled()` returns false with a `reason` so the gate can say which limit was hit.**

## 9.4 What actually locks

| surface | trial | expired | note |
|---|---|---|---|
| Lessons | first 5 free | **locked** | the user named this explicitly |
| Lesson list / path | fully visible | **visible with locks** | 4/4 convergence, §6.6.3 — never hide |
| Digest titles + excerpts | visible | **visible** | the excerpt is the marketing |
| Digest bodies | free | **locked past the first screen** | blur + gate sheet |
| Atlas chat | 10 messages | **locked** | already metered |
| Options | 3 preview trades | **locked** | already metered |
| Paper trading (buy/sell equities) | free | **free** | see below |
| Portfolio, watchlist, news, quotes | free | **free** | see below |
| Streak, XP, league | free | **free** | never gate the retention loop |

**Why trading and market data stay free, and this is a recommendation not a decision:** they are the
habit. Bloom, the direct competitor, gates *lessons and features* and keeps the market surface open,
because a locked market screen gives a lapsed user no reason to open the app again. **Flag this to
the user** — if they want trading gated too, it is a one-line change in `entitled()`.

## 9.5 The gate sheet — `src/components/gate-sheet.tsx` (Unit 4)

**Modelled directly on Astra AI `323575` (§6.6.1).** The mechanism, not the pixels.

```
┌──────────────────────────────────────────┐
│  (the screen the user was ALREADY on,    │  <- still mounted, still in the a11y tree
│   rendered normally, then BLURRED)       │     BlurView or an opacity+scale scrim
│                                          │
│         ✦  (Atlas, `whoa` expression)    │  <- our mascot, not a generic star (5/5: mascot in-thread)
│  ┌────────────────────────────────────┐  │
│  │  ✕                                 │  │
│  │                                    │  │
│  │  Your free 3 days                  │  │  <- `title` token, 26/32
│  │  are up                            │  │     second line in `primary` #A855EB
│  │                                    │  │
│  │  You've read 4 guides and finished │  │  <- `body`. STATE WHAT THEY DID. This is
│  │  2 lessons. Euphoria Pro keeps     │  │     the one place their own numbers make
│  │  them coming.                      │  │     the ask feel earned rather than abrupt.
│  │                                    │  │
│  │  🔒 Every lesson, unlimited Atlas, │  │  <- ONE line on what unlocking buys
│  │     the full options desk          │  │
│  │                                    │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │      See Euphoria Pro        │  │  │  <- GradientButton. Opens the plan picker.
│  │  └──────────────────────────────┘  │  │     NOT a price. Intent, not money (§6.6.1).
│  │                                    │  │
│  │      Why isn't Euphoria free?      │  │  <- the Astra AI move. Answers resentment.
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Hard rules for this component:**

1. **It is a MODAL over the current route. It is never a navigation.** The underlying screen stays
   mounted. Verify this on device: after the sheet opens, `./scripts/sim.sh screen` must still show
   the underlying screen's labels. If they are gone, you built a route and it is wrong.
2. **It does not show a price.** Pricing lives one tap deeper, exactly as Astra AI does it
   (`323575` → `323576`). This keeps the interruption cheap.
3. **It states what happened**, using their real numbers from the store. Never
   *"Upgrade to Pro"* with no cause.
4. **It is dismissible**, and dismissing returns them to what they were doing. A gate that cannot be
   closed is a trap and will draw one-star reviews.
5. **The 🔒 line is one line.** Astra AI uses exactly one. A benefits list belongs on the plan
   screen.
6. **"Why isn't Euphoria free?"** opens a short, honest sheet: market data costs money per call, the
   AI tutor costs money per message, and there are no ads. This is a real differentiator for a
   finance-education app aimed at 18–25s and it fits the app's existing voice.
7. **Copy is UNAPPROVED.** The structure is evidence-backed; the exact words are not. Ship it, mark
   it, and flag it in the report for the user's sign-off (§0.7).

**The blur:** `expo-blur` is likely already available via Expo SDK 57 — check before adding
anything. If `BlurView` is not viable over the existing gradients, fall back to a scrim of
`background` at 88% opacity plus a 0.98 scale on the content. **Do not add a new native module for
this.**

## 9.6 The paywall body (Unit 4)

The existing `onboarding.tsx` paywall step is the base. Three changes:

**1. The trial timeline becomes a block inside it.** 5/5 convergence (§6.6.2), and it resolves the
earlier rejection: the user rejected a *standalone screen*, and every reference app puts the
timeline *inside* the paywall. Shape it like Nibble `132921`:

```
  TODAY      🔒   Full access to every lesson and Atlas
  DAY 2      🔔   We'll remind you before anything is charged
  DAY 3      ⭐   Your trial ends — keep going for $X
```

**2. Real plan cards.** Yearly with a `Save X%` badge is 4/5 across the trial cohort (Quizlet
`147531`, Astra `323576`, Duolingo `112708`, RiseGuide `72247`). Euphoria's current $9.99/mo ·
$59.99/yr is a **50% saving** — say so on the badge.

**3. Social proof only if it is true.** Bloom shows press mentions and university testimonials;
Astra shows `4.87★`. **Euphoria has no ratings and no press.** Do not invent them. Ship the paywall
without social proof and note the gap — this is §0.4 applied to marketing copy.

## 9.7 Verifying a 3-day trial without waiting 3 days

```ts
// src/lib/entitlement.ts — DEV ONLY. Guarded so it cannot ship.
if (__DEV__) {
  // Seed activeDays with back-dated keys so every trial state is reachable in one session.
  // Exposed on globalThis rather than a UI control: a debug button is a dead control (§0.5).
  (globalThis as any).__euphoriaTrialDays = (n: number) => {
    const days = Array.from({ length: n }, (_, i) => dayKeyOffset(-(n - 1 - i)));
    useApp.setState({ activeDays: days });
  };
}
```

Then, from the device:
```bash
./scripts/sim.sh state '.activeDays'          # observe
# drive the four states and capture the store for each:
#   0 days  -> fresh
#   1 day   -> "2 days left"
#   3 days  -> "last day"
#   4 days  -> EXPIRED, gate sheet on every locked control
#   isPro   -> no countdown anywhere
```

**Report all five store snapshots in the commit body.** A trial that was only ever tested in one
state is not tested.

**Also verify the boundary explicitly:** with exactly 3 entries the user is still IN the trial (day
3 is a trial day). Expiry begins at the **4th distinct day**. An off-by-one here charges people a day
early and is exactly the kind of bug that produces refunds.

## 9.8 In-app purchase (Unit 5) — and the honest ceiling

`react-native-purchases` **10.7.0** (RevenueCat). Why RevenueCat over raw StoreKit: it handles
receipt validation, cross-platform entitlements, restore, and subscription state changes — all of
which are where a hand-rolled StoreKit integration leaks revenue and generates support load.

```bash
npx expo install react-native-purchases
```

**Wiring:**
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in `.env.example`. **`EXPO_PUBLIC_` is correct** — the RevenueCat
  SDK key is a public client key, like the Supabase anon key and unlike `GEMINI_API_KEY`.
- `IAP_ENABLED = !!process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY`.
- `setPro(true)` becomes driven by RevenueCat's entitlement state, not a local toggle. Keep the local
  `isPro` as the cached read so the app works offline; refresh it on `customerInfo` updates.
- **"Restore purchases" is 3/5 convergence in settings** and is an **App Store review requirement**
  for a subscription app. Ship it in the You tab's plan card.

**What CANNOT be verified today, and must be said plainly rather than implied:**

| requirement | why it blocks | what to do |
|---|---|---|
| App Store Connect products (`euphoria_pro_monthly`, `euphoria_pro_yearly`) | RevenueCat reads offerings from ASC | ask the user; build behind the flag |
| A sandbox tester account | purchases cannot be exercised on a simulator without one | ask the user |
| **StoreKit purchases do not work in the iOS Simulator** without a local `.storekit` configuration file | the QA device is a simulator | add a `Configuration.storekit` file for local testing, and say clearly that this validates the **UI flow only**, not real billing |

**Until those exist:** the purchase button renders **disabled with its own reason on screen**, in the
exact pattern the options preview cap already uses — *"Purchases aren't switched on in this build
yet."* That is honest, it is consistent with §0.4/§0.5, and it is not a dead control because it
explains itself.

## 9.9 The honest ceiling of a device-clock trial — say this, do not hide it

**Trap #31.** `activeDays` lives in AsyncStorage on the device and is keyed off the device clock.
Therefore:

- Deleting and reinstalling the app **resets the trial**.
- Changing the device date **can add trial days** (though not remove used ones, since the set only
  grows).
- There is no server check.

**This is acceptable for launch and must never be described as enforcement.** It is a *courtesy*
trial: it shapes the honest majority's experience and it costs nothing. The real entitlement lives in
RevenueCat once Unit 5 lands, because a paid subscription is validated against Apple's receipt, not
against `activeDays`.

**The upgrade path**, in increasing order of effort — and the same shape as the rate limiter's stated
ceiling in `_limit.ts`, deliberately:
1. **RevenueCat anonymous app-user-id** — survives reinstall on the same Apple ID.
2. **Supabase row keyed on `installId`** — `lib/auth.ts` already scaffolds this; the trial start date
   moves server-side.
3. **Full account auth** — trial follows the person, not the device.

**Write this ceiling into the docblock of `entitlement.ts`**, exactly as `_limit.ts` does. A future
session must not "discover" the bypass and treat it as a defect.

## 9.10 Pricing — flag before shipping

Bloom charges **$15/mo · $120/yr** for financial literacy modules **plus** fractional investing —
essentially Euphoria's Learn + Trade bundle. Euphoria asks **$9.99/mo · $59.99/yr**, roughly **half**.

Euphoria's trial is **3 days**; the cohort runs 3 days (Zutobi, Plantaria, RiseGuide) to 7 days
(Quizlet, Nibble). 3 days is defensible and is at the aggressive end.

**Raise this once with the user before Unit 5 ships, then follow their call (§0.7).** Do not change
a price unilaterally.

---

# §10. COMPONENT LIBRARY AND ICON SYSTEM

The user asked for *"a good component library where it's going to have good components for stuff like
the investing fundamentals icon for the learn section."* This section answers it with verified
versions and a decision.

## 10.1 The candidates, verified against npm on 2026-08-07

### Component libraries

| library | latest | philosophy | verdict for Euphoria |
|---|---|---|---|
| **React Native Reusables** (`@rn-primitives/*` **1.5.2**) | shadcn/ui for RN. Copy-paste components on unstyled primitives, NativeWind v4. CLI scaffolding, blocks for auth and onboarding. | **You own the code.** Nothing to fight when it does not match the design. | ✅ **RECOMMENDED** |
| **gluestack-ui** (`@gluestack-ui/core` **5.0.15**) | Successor to NativeBase. Modular, unstyled, accessible, Tailwind-styled. v5 targets **NativeWind v5 / Tailwind v4**, Expo Router first. Docs confirm Expo SDK 54 optimisation. | Excellent, but its v5 line pairs with **Tailwind v4**, and this app is on **NativeWind 4.2.6 / Tailwind 3.x**. Adopting it means a Tailwind major bump mid-run. | ⚠️ strong, wrong timing |
| **Tamagui** | compiler-optimised, best cross-platform theming | A whole second styling system beside `StyleSheet` and NativeWind. Three is too many. | ❌ |
| **React Native Paper / Elements** | Material / classic | Material language actively fights this app's look. | ❌ |

### Icon sets

| set | package | count | styles | note |
|---|---|---|---|---|
| **Hugeicons** | `@hugeicons/react-native` **1.0.15** + `@hugeicons/core-free-icons` **4.2.3** | 46,000+ free (54,000+ pro) | Stroke, Two-Tone, Solid, **Bulk**, **Duotone**, Rounded, Sharp | Largest by a distance. **Duotone and Bulk are the styles that sit closest to this app's hand-drawn look.** |
| Phosphor | `phosphor-react-native` **3.0.6** | ~9,000 | 6 weights incl. duotone | Excellent, smaller, very consistent |
| Iconoir | `iconoir-react-native` **7.11.1** | 1,300+ | 24×24, one style | Clean, MIT, but stroke-only |
| Lucide | `lucide-react-native` **1.30.0** | ~1,500 | stroke | The safest, plainest choice; closest to `ui-icon.tsx`'s existing 2.2 stroke |
| Nano Icons | `react-native-nano-icons` **0.2.1** | — | — | Software Mansion; optimised for **render performance**, worth benchmarking if icon count on the Learn path becomes a frame-rate problem |

## 10.2 The Tailwind version trap — read before installing

`nativewind@4.2.6` pairs with **Tailwind 3.x**. `npm view tailwindcss version` returns **4.3.3**,
which is a **major** ahead. A bare `npx expo install tailwindcss` may resolve to v4 and produce a
config NativeWind 4 cannot read — and the failure mode is silent: classes compile to nothing and
every `className` is simply ignored.

**Pin it, and prove it works:**
```bash
npx expo install nativewind
npm install --save-dev "tailwindcss@^3"
npx tailwindcss --help >/dev/null && echo "tailwind cli ok"
```
Then run the **on-device colour check in Unit 2e**. A NativeWind config that silently no-ops looks
exactly like "the styles just aren't applying yet".

## 10.3 THE DECISION

> **Components:** **React Native Reusables** patterns (`@rn-primitives/*`), copied in, on
> **NativeWind 4.2.6 + Tailwind 3.x**, **new surfaces only**.
> **Utility glyphs:** **Hugeicons** free set, **Duotone** style, behind the `src/components/icon.tsx`
> wrapper from Unit 2d.
> **Identity art (courses, stat tiles, crests, quests, guide heroes):** **hand-authored SVG**, in the
> existing `lesson-art.tsx` / `league-crest.tsx` style.

**Three reasons, in order:**

1. **Hugeicons' own documentation admits the gap.** Its comparison page states that *some niche
   categories such as finance have fewer options than Material Symbols*. That is exactly Euphoria's
   domain. **A generic set cannot draw "Behavioral Finance" or "Quantitative Analysis" — the two
   things the Learn tab most needs.** So a library alone cannot satisfy the user's request; it can
   only satisfy half of it.
2. **The hand-drawn art is the single most distinctive thing in this app**, and there is already
   54KB of it (`lesson-art.tsx` 32KB + `atlas.tsx` 22KB) establishing the style. Replacing course
   identity with a stock pack would make it look like every template.
3. **Nobody is differentiated by a chevron.** Hand-authoring utility glyphs is pure cost. Hugeicons
   Duotone gives 46,000 of them in a style that can share a screen with the authored art.

**If the user pushes back and wants everything from a library:** say once that course identity is
where the app's character lives, then follow their call (§0.7). If they do, use **Hugeicons Bulk**
for course marks — it is the closest available style to the existing art — and accept that twelve
courses will not have twelve distinct finance concepts available.

## 10.4 The twelve course marks — the concrete deliverable

This is what the user meant by "the investing fundamentals icon for the learn section". Author each
in `src/components/art/course-mark.tsx`, 48×48, single `Path` where possible, tinted by
`courseAccent(id)` so one component serves all twelve:

| course id | the mark |
|---|---|
| `investingFundamentals` | a seedling breaking a rising line — growth from a base |
| `personalFinance` | a wallet with one coin above it |
| `behavioralFinance` | a head silhouette with an off-centre pendulum inside |
| `riskManagement` | a shield with a notch cut from one corner |
| `corporateFinance` | three stacked bars with an arrow threading them |
| `globalEconomics` | a globe with one latitude line drawn as a chart |
| `quantitativeAnalysis` | a scatter of four dots with a fitted line |
| `financialAnalytics` | a magnifier over a candlestick |
| `appliedAccounting` | a balance scale, deliberately level |
| `businessStrategy` | a chess knight reduced to three strokes |
| `wealthManagement` | a tree whose canopy is a coin |
| `alternativeInvestments` | a key with a chart notch cut into the bit |

**Rules:** stroke **2.2** to match `ui-icon.tsx`; 48×48 viewBox; no gradients (`courseAccent` supplies
colour); run every one through `npx svgo` before inlining.

**Verification:** render all twelve in a dev-only grid, screenshot once, and confirm **no two read as
the same silhouette at 48pt**. That is the only test that matters for an icon set — trap #19's
lesson was that four icons rendered as the same sparkle and nobody noticed for a whole session.

---

# §11. ARTICLE MANIFEST — the 35 new Digest guides

## 11.0 The existing 25 — complete inventory

| slug | category | hero key |
|---|---|---|
| how-credit-cards-work | Credit | cover-credit-card |
| good-debt-vs-bad-debt | Credit | cover-debt-balance |
| how-credit-scores-work | Credit | cover-credit-score |
| what-moves-a-stock-price | Markets | cover-price-gap |
| bull-vs-bear-markets | Markets | cover-bull-bear |
| how-to-read-a-stock-quote | Markets | cover-quote-card |
| how-the-stock-market-works | Markets | cover-exchange |
| inflation-explained | Markets | cover-inflation |
| market-crashes-what-history-teaches | Markets | cover-crash-recovery |
| investment-fees-explained | Strategy | cover-fee-drag |
| what-is-diversification | Strategy | cover-diversify |
| what-is-risk-tolerance | Strategy | cover-risk-dial |
| dollar-cost-averaging-explained | Strategy | cover-dca |
| target-date-funds-explained | Investing | cover-glide-path |
| what-is-an-etf | Investing | cover-etf |
| roth-ira-explained-for-beginners | Investing | cover-roth |
| stocks-vs-bonds-explained | Investing | cover-stocks-bonds |
| build-your-first-investment-portfolio | Investing | cover-portfolio |
| how-tax-brackets-work | Money basics | cover-brackets |
| employer-401k-match | Money basics | cover-401k-match |
| capital-gains-tax-basics | Money basics | cover-tax-slice |
| first-paycheck-guide | Money basics | cover-paycheck |
| budgeting-50-30-20-rule | Money basics | cover-budget-split |
| emergency-fund-how-much | Money basics | cover-emergency-buffer |
| what-is-compound-interest | Money basics | cover-compound |

**Distribution:** Money basics 7 · Markets 6 · Investing 5 · Strategy 4 · **Credit 3**.
`readMinutes` runs 2–5. `lessonForGuide` holds **31 entries for 25 guides** — audit for orphans.

**`DigestPost` shape:**
```ts
{ slug: string; title: string; excerpt: string;
  category: "Credit" | "Markets" | "Strategy" | "Investing" | "Money basics";
  date: "YYYY-MM-DD"; readMinutes: number; hero: string /* key into DIGEST_HEROES */ }
```

**The voice to preserve — every excerpt states a SURPRISE:**
- *"Pay in full and the card is free. Carry a balance and it is one of the most expensive loans you can get."*
- *"Good news sinks stocks all the time. Price does not track results, it tracks surprise."*
- *"One percent a year sounds like a rounding error. Over thirty years it can take a quarter of everything you built."*
- *"A raise cannot push your whole income into a higher rate. Only the dollars above the line move."*

This is the strongest thing about the existing set. **Every new guide must do it.**

## 11.1 Stream A — curriculum gaps (15)

| slug | title | cat | hero | the surprise the excerpt must land |
|---|---|---|---|---|
| `loss-aversion-explained` | Why Losing Hurts Twice as Much | Strategy | cover-loss-scale | A loss feels about twice as strong as an equal gain — which is why people sell winners and hold losers. |
| `anchoring-bias-investing` | The First Number You Hear Wins | Strategy | cover-anchor | The price you bought at is irrelevant to what a stock does next, but your brain will not let it go. |
| `recency-bias-markets` | Why Last Year Feels Like Forever | Strategy | cover-recency | The most recent twelve months feel like the permanent state of the world. They almost never are. |
| `confirmation-bias-portfolio` | You Are Only Reading the Good News | Strategy | cover-confirm | Once you own something you start reading only the news that agrees with you. |
| `position-sizing-basics` | How Much of One Thing Is Too Much | Strategy | cover-position-size | Being right about a stock and wrong about the size can still ruin you. |
| `correlation-explained` | When Everything Falls Together | Strategy | cover-correlation | Diversification stops working exactly when you need it — in a crash, correlations go to one. |
| `sequence-of-returns-risk` | Why the Order of Returns Matters | Investing | cover-sequence | Two portfolios with the same average return can end decades apart, purely on the order. |
| `reading-a-balance-sheet` | What a Balance Sheet Actually Says | Markets | cover-balance-sheet | Assets minus liabilities is the whole idea. Everything else is detail. |
| `free-cash-flow-explained` | Profit Is an Opinion, Cash Is a Fact | Markets | cover-cash-flow | A company can report a profit and still run out of money. |
| `what-the-fed-actually-does` | What the Fed Actually Does | Markets | cover-fed | The Fed sets one overnight rate. Everything else is the world reacting to it. |
| `why-rates-move-everything` | Why One Rate Moves Everything | Markets | cover-rates | Raise the risk-free rate and every other asset has to re-justify itself. |
| `how-inflation-is-measured` | How Inflation Is Actually Measured | Money basics | cover-cpi-basket | It is a basket someone chose. Your personal inflation rate is not the headline number. |
| `what-an-average-hides` | What an Average Hides | Money basics | cover-average | "Average return of 8%" can mean a smooth 8% or +40% then −25%. They are not the same life. |
| `percentiles-explained` | Why Percentiles Beat Averages | Money basics | cover-percentile | The median household and the average household are different households. |
| `risk-vs-volatility` | Risk Is Not the Same as Volatility | Strategy | cover-risk-vol | Volatility is how much it moves. Risk is the chance you never get it back. |

## 11.2 Stream B — market literacy (10)

| slug | title | cat | hero | the surprise |
|---|---|---|---|---|
| `how-to-read-an-earnings-report` | How to Read an Earnings Report | Markets | cover-earnings | The number that moves the stock is rarely the profit — it is the guidance. |
| `what-a-dividend-actually-is` | What a Dividend Actually Is | Investing | cover-dividend | The stock price drops by roughly the dividend on the day it is paid. It is not free money. |
| `what-an-etf-actually-holds` | What Your ETF Actually Holds | Investing | cover-etf-holdings | Three "diversified" funds can hold the same six companies. |
| `why-bonds-move-opposite-rates` | Why Bonds Fall When Rates Rise | Investing | cover-bond-seesaw | Your 3% bond is worth less the moment someone can buy a 5% one. |
| `what-a-stock-split-does` | What a Stock Split Actually Does | Markets | cover-split | Nothing. You own more slices of the same pizza. |
| `what-the-market-is-down-means` | What "The Market Is Down" Measures | Markets | cover-index-weight | The S&P is cap-weighted — a handful of companies can drag the whole number. |
| `premarket-vs-after-hours` | Pre-Market and After-Hours, Explained | Markets | cover-hours | Thin volume means one order can move the price. That gap often closes by 10am. |
| `market-cap-tiers-explained` | Large, Mid, Small Cap — What Changes | Investing | cover-cap-tiers | Cap size predicts volatility far better than it predicts returns. |
| `what-volume-tells-you` | What Trading Volume Tells You | Markets | cover-volume | A price move on no volume is a rumour. On heavy volume it is a decision. |
| `what-an-index-actually-is` | What an Index Actually Is | Markets | cover-index | Someone picks the members and the weights. An index is an opinion with a rulebook. |

## 11.3 Stream C — 18–25 life-stage (10)

| slug | title | cat | hero | the surprise |
|---|---|---|---|---|
| `your-first-credit-card` | Choosing Your First Credit Card | Credit | cover-first-card | The rewards rate is the least important number on the page. |
| `what-a-lease-actually-costs` | What Your First Apartment Really Costs | Money basics | cover-lease | Rent is usually about two-thirds of what living there costs. |
| `student-loans-repayment-clock` | Student Loans and the Repayment Clock | Credit | cover-loan-clock | Interest often starts before your first payment does. |
| `enrolling-in-your-first-401k` | Enrolling in Your First 401(k) | Money basics | cover-enroll | The default contribution rate is set to be easy, not to be enough. |
| `health-insurance-basics` | Health Insurance, Decoded | Money basics | cover-insurance | A low premium with a high deductible is a bet on not getting sick. |
| `what-builds-a-credit-score` | What Actually Builds a Credit Score | Credit | cover-score-mix | Paying on time and using little of your limit is most of it. The rest is noise. |
| `buying-your-first-car` | Buying Your First Car | Money basics | cover-first-car | The monthly payment is the wrong number to negotiate. |
| `splitting-rent-fairly` | How to Split Rent Fairly | Money basics | cover-split-rent | Equal shares of an unequal apartment is how roommates fall out. |
| `freelance-1099-taxes` | Freelance Income and the Tax Surprise | Money basics | cover-1099 | Nobody withholds anything. The bill arrives all at once. |
| `emergency-fund-on-a-small-income` | An Emergency Fund on a Small Income | Money basics | cover-small-fund | Three months of expenses is the goal. One month is the thing that changes your life. |

**Resulting distribution after all 60:**
Money basics 19 · Markets 15 · Strategy 11 · Investing 10 · **Credit 6**.
Credit remains thinnest — **flag it for a future batch rather than padding now.**

## 11.4 Writing rules for every guide

1. **The excerpt states a surprise.** If it merely describes the topic, rewrite it.
2. **A worked example with real numbers and a named person**, matching the lesson voice — the
   established characters are **Maya, 19, lifeguards in Sacramento** and **Marcos, 22, dental tech in
   Fresno**. Reuse them; do not invent a third unless the scenario genuinely needs one.
3. `readMinutes` honest at **~200 wpm**. Compute it, do not guess it.
4. A `lessonForGuide` entry **pointing at a lesson that exists** — the CTA says "Practice this in a
   lesson" and must not dead-end.
5. Hero SVG authored in the existing style and **run through `npx svgo`**.
6. **American spelling** — match the existing corpus.
7. Section rhythm: hero → lead → **Key Takeaways** → explanation → worked example → **The Bottom
   Line**. The Bottom Line must *conclude*, not restate the intro.

---

# §12. GIT

```bash
CLAUDE_CONFIG_DIR=~/.claude-account2 gh auth switch --user teameuphoriainv-dot   # s-k-28 CANNOT see the private repo
cd ~/euphoria-native && git status --porcelain
```

**Convention in this repo:** commits land directly on `main` with descriptive, multi-paragraph
messages. Recent history: `61f61ba` (Unit 1), `6b090d3`, `81cda65`, `5ef9b7a`, `bda99b8`, `4d85b7e`.

**Commit per verified unit, after its gate passes. Push after Units 2, 5, 7, 9, 11, 14.**

**Multi-line messages via heredoc — `-m` with newlines breaks in this shell (trap #8):**
```bash
git commit -F - <<'EOF'
feat(you): plan status, five tappable stats, bespoke marks

Plan card at top — 5/5 convergence across Elevate/Praktika/Meetup/Kling/Loora.
Four inert tiles -> five tappable, each with a destination.
rewardsEarned surfaced for the first time (was in the store, invisible).
Tappable elements on the tab: 9 -> 21.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

**Every commit body must carry the numbers** that justified the change — hit rates from
ScreensDesign, before → after measurements from the device. A commit message with no number in it is
a commit whose gate was probably not run (§0.3).

---

# §13. OPEN ITEMS — non-blocking, but track them

## 13.1 Keys not yet supplied

Every surface already degrades honestly without them — verified on device:

| key | unlocks | current behaviour without it |
|---|---|---|
| `POLYGON_API_KEY` | search, quotes, charts, key stats, movers, logos, news fallback | screens say "Live prices aren't switched on in this build"; blocks hide |
| `TRADIER_TOKEN` | real options chain with greeks | falls back to labelled Black-Scholes rows |
| `ALPHAVANTAGE_API_KEY` | news + per-article sentiment | falls back to Polygon news, then to "No stories right now" |
| `GEMINI_API_KEY` | Atlas chat | "Atlas is not switched on in this build yet." |
| `EXPO_PUBLIC_SUPABASE_URL` + `_ANON_KEY` | real accounts | `AUTH_ENABLED === false`, no client built |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | purchases (Unit 5) | purchase button disabled with its reason on screen |
| fal key | generated hero art | skip generated art entirely and say so |

## 13.2 Carried-over honest status

1. **The `line` (number-line) stacked-CTA fix is unverified on device.** It is symmetrical to the
   `multi` fix, which *was* verified ("Exactly — that's the full set."), but a number-line step was
   never reached in testing. `OWN_CTA_STEPS = new Set(['multi','line'])` in `lesson.tsx`.
2. **`valueHistory` pre-fix snapshots carry the old formula** (trap #25). Deliberately not rewritten.
3. **OrderSteps at ≥5 items now clears the CTA by +68pt**, but the underlying pattern — a step's own
   control competing with a pinned footer — must be audited whenever a new step type is added
   (trap #17).
4. **The paywall cannot transact.** `onboarding.tsx:341–345` shows an `Alert` admitting it. The
   entitlement layer (`isPro`) is real and gates lessons, Atlas and options — but nothing can be
   bought. **Unit 5 closes this, and Unit 4 must not ship without it (§0.5).**
5. **Pricing:** Bloom charges $15/mo · $120/yr for a comparable bundle; Euphoria asks $9.99/$59.99.
6. **The rate limiter is per-isolate, not global**, and its identity header is unauthenticated.
   Stated honestly in `_limit.ts`. Upgrade path named there.

---

# §14. SCREENSDESIGN CALL SHEET — every call, copy-pasteable

**§0.2 makes this mandatory. There is no excuse for guessing when the exact call is written below.**

## 14.1 Before you start — one-time

```
mcp__screensdesign__describe_screensdesign_mcp        # server self-description
mcp__screensdesign__get_screensdesign_skill           # ONCE per conversation, if the skill is loaded
```

## 14.2 Per unit

**Unit 2 — components and icons**
```
mcp__screensdesign__app_screens
  app_ids=["862","2004","936","1395","2190","918"]
  query="course category icons, subject tiles with illustrations, topic cards with symbols, learning path node art"
  limit=20
```
then `screen_detail include_image=true neighbor_count=1` on the 3 most icon-dense.

**Unit 4 — the gate sheet and paywall**
```
mcp__screensdesign__screen_detail
  screen_ids=[323575, 323576, 132921, 138757, 147530]
  include_image=true
  neighbor_count=1
```
```
mcp__screensdesign__search_apps
  detected_patterns=["SpecialOfferPaywall"]
  category=["Education","Finance"]  min_revenue=250000  limit=12
```
```
mcp__screensdesign__search_flows
  paywall_type="Free Trial - Hard Paywall"
  category=["Education","Finance"]  min_revenue=250000
  query="trial ended, must subscribe to continue"  limit=20
```

**Unit 5 — IAP and restore**
```
mcp__screensdesign__app_screens
  app_ids=["874","1395","39","1134","862"]
  query="manage subscription, restore purchases, renewal date, cancel plan, current plan status"
  limit=12
```

**Unit 6 — You tab**
```
mcp__screensdesign__app_screens
  app_ids=["862","2004","1395","39","1134"]
  query="profile tab, stats, achievements, streak, subscription status, settings, rewards"
  limit=10
```

**Unit 7 — Learn tab**
```
mcp__screensdesign__app_screens
  app_ids=["936","862","2190"]
  query="learning path, lesson nodes, unit sections, progress trail, locked nodes, course header"
  limit=14
```

**Unit 8 — Home**
```
mcp__screensdesign__app_screens app_id="862"
  query="home path, daily quests, streak goal, hearts, league, chest, daily goal" limit=14
```

**Unit 9 — Digest**
```
mcp__screensdesign__app_screens app_ids=["422","918","1580","862"]
  query="article list, content feed, reading progress, categories, saved, daily" limit=10
```

**Unit 10 — Trade news**
```
mcp__screensdesign__app_screens app_ids=["1580","1171"]
  query="news feed with images, hero card, related news, market news" limit=8
```

**Unit 11 — Tab structure**
```
mcp__screensdesign__app_screens
  app_ids=["862","2004","39","1395","1171","918","1816","874"]
  query="bottom tab bar navigation" limit=16
```

**Unit 13 — revamp sweep**
```
mcp__screensdesign__app_screens
  app_ids=["862","2004","1395","874"]
  query="empty state, loading skeleton, error state, no results" limit=16
```

## 14.3 App id reference

```
862  Duolingo        $48M/mo    2004 Bloom          ~$291k/mo (external)
874  Quizlet         $2.25M     858  TradingView    $2.25M
1580 Bloomberg       $750k      1395 Elevate        $750k
1816 Praktika        $750k      900  Waking Up      $700k
39   Gauth           $600k      2190 Astra AI       $550k
105  Zutobi          $550k      820  Lingvano       $550k
1171 Investing.com   $450k      918  Nibble         $450k
422  Deepstash       $450k      212  CNBC           $450k
344  YNAB            $350k      936  Promova        $250k
1134 Loora           $1M        1263 Plantaria      $250k
2467 RiseGuide       $250k      1542 Yahoo Finance  —
```

**NOT in the dataset:** Coinbase, Robinhood, Zogo, Stash, Greenlight, NGPF.
Use `search_store_screens` and label the result **App Store creative**.

---

# §15. THE FIRST FIFTEEN MINUTES OF A NEW SESSION

```bash
# 1. Environment
cd ~/euphoria-native
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90

# 2. Where are we?
git log --oneline -5
git status --porcelain | head -20

# 3. Is the device alive? (§1.2)
xcrun simctl list devices | grep -i "Euphoria QA"
./scripts/sim.sh doctor
lsof -ti:8082 || npx expo start --port 8082

# 4. Baseline the gate BEFORE touching anything (§7)
npx tsc --noEmit
npx expo lint 2>&1 | grep problems        # note the numbers; 3 errors / 47 warnings is baseline
python3 scripts/certify.py | tail -2
./scripts/sim.sh screen | head -20
./scripts/sim.sh state '.installId, .isPro, .activeDays'

# 5. Find the first unit in §8 not marked DONE. Start there.
```

**Then, and only then, write code.**

---

# §16. THE ONE-PARAGRAPH VERSION

Euphoria is an Expo SDK 57 finance-education app with a mascot called Atlas, aimed at 18–25 year
olds, competing with Bloom (~$291k/mo) and positioned in a cohort where Education apps earn well and
almost no Finance app does. It has real paper trading, a real options chain, a real AI tutor behind a
rate-limited proxy, 5,341 authored curriculum steps and 25 published guides. **It cannot currently
take money, and it has no time-based trial** — those are Units 3, 4 and 5 and they are the spine of
this run. Everything else is design work on five tabs, thirty-five new articles, and an icon system.
The rules that matter: read the real screen before designing, measure the real device before
claiming, never present modelled data as live, never ship a button that does nothing, and never
mention what any of it cost.

---

# §17. IMPLEMENTATION APPENDIX — write these files, roughly as written

This appendix exists so the next session does not have to re-derive design decisions that were
already made. **These are starting points with the reasoning attached, not gospel.** If the codebase
disagrees with something here, the codebase wins — but say which and why.

## 17.1 `src/lib/entitlement.ts` (Unit 3)

```ts
/**
 * The single authority on "can this user do this?".
 *
 * WHY IT IS ITS OWN MODULE: before this file, the answer was spread across three store getters
 * (`canAccessLesson`, `atlasLeft`, `derivativesLeft`) with three different shapes and no shared
 * notion of WHY something was refused. The gate sheet (`components/gate-sheet.tsx`) needs one
 * question with one answer that carries a reason, or every caller invents its own copy.
 *
 * ── THE CEILING, STATED HONESTLY ────────────────────────────────────────────────────────────
 * The trial clock is DEVICE-LOCAL. `activeDays` lives in AsyncStorage and is keyed off the device
 * clock, so deleting and reinstalling resets it, and moving the date forward can add days. There is
 * no server check.
 *
 * That is deliberate and acceptable for launch, and it must NEVER be described as enforcement
 * anywhere in the app or in a commit message. It is a COURTESY trial: it shapes the honest
 * majority's experience at zero cost. The real entitlement is `isPro`, which RevenueCat drives from
 * an Apple-validated receipt.
 *
 * Upgrade path, increasing effort — same shape as the limiter's ceiling in api/_limit.ts:
 *   1. RevenueCat anonymous app-user-id  — survives reinstall on the same Apple ID
 *   2. Supabase row keyed on installId   — lib/auth.ts already scaffolds this
 *   3. Full account auth                 — the trial follows the person, not the device
 */
import { dayKey, useApp, type AppState } from './store';

/** Three distinct days of real use. See MASTER_PLAN §9.2 for why "days used", not "days elapsed". */
export const TRIAL_DAYS = 3;

export type Tier = 'trial' | 'expired' | 'pro';

/** Everything a gate can protect. Each maps to one copy string — see §20. */
export type Feature = 'lesson' | 'guide' | 'atlas' | 'options';

/** Why a feature was refused. The gate sheet renders different copy per reason. */
export type Refusal =
  | { ok: true }
  | { ok: false; reason: 'trial-expired' }
  | { ok: false; reason: 'count-limit'; used: number; limit: number };

export const trialDaysUsed = (s: AppState) => s.activeDays.length;

/** 0 once expired. Never negative — a "-1 days left" has shipped in other apps and looks broken. */
export const trialDaysLeft = (s: AppState) => Math.max(0, TRIAL_DAYS - s.activeDays.length);

/**
 * `isPro` wins over everything.
 *
 * ORDER MATTERS: a paying user must never see a trial countdown. That specific bug is what
 * generates "I already paid" support mail and refund requests.
 */
export function tier(s: AppState): Tier {
  if (s.isPro) return 'pro';
  return s.activeDays.length > TRIAL_DAYS ? 'expired' : 'trial';
}

/**
 * The one question.
 *
 * During the trial the existing COUNT limits still apply (5 lessons, 10 Atlas messages, 3 options
 * previews) — so a trial user runs out of whichever comes first. After the trial, nothing applies:
 * it is all Pro. That keeps the gate copy to ONE reason at a time, which is the whole point of
 * returning a Refusal rather than a boolean.
 */
export function entitled(s: AppState, f: Feature): Refusal {
  if (s.isPro) return { ok: true };
  if (tier(s) === 'expired') return { ok: false, reason: 'trial-expired' };

  switch (f) {
    case 'lesson': {
      const used = s.completedLessons.length;
      return used < FREE_LESSON_LIMIT
        ? { ok: true }
        : { ok: false, reason: 'count-limit', used, limit: FREE_LESSON_LIMIT };
    }
    case 'atlas': {
      const used = s.atlasAsked;
      return used < FREE_ATLAS_MESSAGES
        ? { ok: true }
        : { ok: false, reason: 'count-limit', used, limit: FREE_ATLAS_MESSAGES };
    }
    case 'options': {
      const used = s.derivativeTrades;
      return used < PRO_DERIVATIVE_PREVIEW
        ? { ok: true }
        : { ok: false, reason: 'count-limit', used, limit: PRO_DERIVATIVE_PREVIEW };
    }
    case 'guide':
      // Guides have never been count-limited and gating them mid-trial would be a new restriction
      // the user did not ask for. Only the trial expiry closes them.
      return { ok: true };
  }
}

/** Hook form, so screens do not each reach into the store shape. */
export const useEntitlement = (f: Feature) => useApp((s) => entitled(s, f));
export const useTier = () => useApp(tier);
export const useTrialDaysLeft = () => useApp(trialDaysLeft);

if (__DEV__) {
  // ONE runnable check on the money path. A trial that never expires looks identical to a working
  // one until the fourth day, by which point it has shipped.
  const base = { isPro: false, completedLessons: [], atlasAsked: 0, derivativeTrades: 0 } as AppState;
  const at = (n: number) => ({ ...base, activeDays: Array.from({ length: n }, (_, i) => `d${i}`) });

  if (tier(at(0)) !== 'trial') console.error('[entitlement] day 0 should be trial');
  if (tier(at(3)) !== 'trial') console.error('[entitlement] DAY 3 IS STILL A TRIAL DAY');
  if (tier(at(4)) !== 'expired') console.error('[entitlement] day 4 should be expired');
  if (tier({ ...at(9), isPro: true }) !== 'pro') console.error('[entitlement] isPro must win');
  if (trialDaysLeft(at(9)) !== 0) console.error('[entitlement] daysLeft must never go negative');
  if (entitled(at(4), 'guide').ok) console.error('[entitlement] expiry must close guides too');

  // Time travel for device verification (§9.7). globalThis, not a UI control — a debug button
  // visible to a user is a dead control (§0.5).
  (globalThis as any).__euphoriaTrialDays = (n: number) =>
    useApp.setState({ activeDays: Array.from({ length: n }, (_, i) => `seed-${i}`) });
}
```

**The boundary assertion is the important one.** `tier(at(3)) === 'trial'` encodes that **day three
is still a trial day** and expiry begins on the fourth distinct day. Off by one here charges people a
day early.

## 17.2 `src/components/gate-sheet.tsx` (Unit 4)

```tsx
/**
 * The contextual gate. Modelled on Astra AI screen 323575 — see MASTER_PLAN §6.6.1.
 *
 * THE MECHANISM, and why it is not a navigation:
 * the screen the user was already on stays MOUNTED and BLURRED behind this sheet. They keep their
 * place, they can see what they were reaching for, and dismissing returns them exactly where they
 * were. Euphoria's previous behaviour — pushing to /onboarding?step=paywall — threw that context
 * away and made the ask feel like a punishment for tapping.
 *
 * VERIFY THIS ON DEVICE: with the sheet open, `./scripts/sim.sh screen` must STILL list the
 * underlying screen's labels. If they are gone you have built a route, and it is wrong.
 *
 * WHAT THIS SHEET DELIBERATELY DOES NOT DO:
 *  - it does not show a price (that is one tap deeper, exactly as Astra AI does it)
 *  - it does not list benefits (one line only; the list belongs on the plan screen)
 *  - it cannot be made non-dismissible (a gate you cannot close is a trap and draws 1-star reviews)
 *
 * COPY IS UNAPPROVED. The structure is evidence-backed at 5/5; the exact words are not signed off.
 */
```

**Props:** `{ feature: Feature; refusal: Refusal; visible: boolean; onDismiss: () => void }`.

**Body copy is chosen from the refusal, never hardcoded at the call site** — that is the entire
reason `entitled()` returns a reason. See §20 for the deck.

**The personalised line** — *"You've read 4 guides and finished 2 lessons"* — reads `readPosts.length`
and `completedLessons.length`. **If both are zero, drop the sentence entirely.** "You've read 0
guides" is worse than saying nothing, and this is exactly the class of bug that trap #24 describes:
a count that can legitimately be zero must not drive a message that assumes it is not.

## 17.3 `src/lib/quests.ts` (Unit 8)

```ts
/**
 * Daily quests — PURE DERIVATION, no new persisted state beyond what the store already writes.
 *
 * WHY DERIVED: a quest table stored in AsyncStorage would need migration, would drift from the
 * actions that actually satisfy it, and would be a second source of truth about "did you do a
 * lesson today". Everything below is computed from fields the store already keeps.
 *
 * WHY DETERMINISTIC: picking quests with Math.random() reshuffles them on every render, which is
 * both a purity violation (trap #11 territory) and a UX bug — the user watches their goals change
 * while looking at them. The day key seeds the pick, so the set is stable for the whole day and
 * changes at midnight without any scheduled work.
 */
import { dayKey } from './store';

export type QuestKind = 'lesson' | 'guide' | 'trade' | 'goal';

export type Quest = { kind: QuestKind; title: string; done: boolean };

const ALL: QuestKind[] = ['lesson', 'guide', 'trade', 'goal'];

/** Stable per-day index from the day key. No Date.now() in render — see trap #11. */
function seedFor(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** 2-3 quests, stable for the whole day, derived from state the store already writes. */
export function questsForToday(s: AppState): Quest[] { /* ... */ }

/** All of today's quests complete -> one reward card. Reuses pendingRewards + claimReward(). */
export const questsComplete = (q: Quest[]) => q.length > 0 && q.every((x) => x.done);
```

**The reward hook-up matters:** completing the day's quests should push into `pendingRewards` and be
claimed through the existing `claimReward()`. That mechanic is already built and device-verified end
to end — a real reward produced `MSFT $1.48 → 0.0033217371787678147 shares`, exact. **Do not build a
second reward path.**

## 17.4 The `markActiveDay` call sites (Unit 3)

Four places, and only four. Each already writes to the store, so there is no new lifecycle to manage:

| file | function | why it counts as "used the app" |
|---|---|---|
| `src/lib/store.ts` | `completeLesson` | the core loop |
| `src/lib/store.ts` | `markPostRead` | reading a guide is real use |
| `src/lib/store.ts` | `spendAtlasMessage` | asking the tutor is real use |
| `src/lib/store.ts` | `buy` / `sell` | placing a trade is real use |

**Deliberately NOT a call site:** app launch, tab switches, opening a screen, or `setHasHydrated`.
A mis-tap on the home-screen icon must not burn a trial day (§9.2).

---

# §18. VERIFICATION COOKBOOK — copy-paste per unit

## 18.1 Count tappable elements on the current screen

```bash
./scripts/sim.sh screen | grep -v "\[DISABLED\]" | wc -l
```
Run before and after a redesign. **This is the number Unit 6 must report.**

## 18.2 Measure real frames for an overlap question (trap #1)

```bash
~/.idb-venv/bin/idb ui describe-all --udid "$EUPHORIA_UDID" \
  | python3 -c "
import json,sys
for e in json.load(sys.stdin):
    f=e.get('frame') or {}
    if e.get('AXLabel'):
        print(f\"{e['AXLabel'][:44]:46} y={f.get('y',0):7.1f} h={f.get('height',0):6.1f} bottom={f.get('y',0)+f.get('height',0):7.1f}\")
"
```
Compare `bottom` of the upper element against `y` of the lower one. **Never compare centres.**

## 18.3 Verify a rate limit (trap #20 — ONLY against the built bundle)

```bash
npx expo export -p web >/dev/null 2>&1
(npx expo serve --port 8090 > /tmp/serve.log 2>&1 &)
for i in $(seq 1 20); do sleep 1; curl -s -o /dev/null --max-time 3 "http://localhost:8090/api/market?action=movers" && break; done

for i in $(seq 1 25); do
  curl -s -o /dev/null -w "%{http_code} " --max-time 10 -X POST "http://localhost:8090/api/chat" \
    -H 'Content-Type: application/json' -H 'X-Euphoria-Install: test-abc' \
    -d '{"messages":[{"role":"user","content":"hi"}]}'
done; echo
pkill -f "expo serve"
```
**Expect twenty non-429s, then 429s.** Anything else and the limiter is not working — but check you
are on `:8090`, not `:8082`, before concluding anything.

## 18.4 Drive the four trial states (Unit 3)

```bash
for n in 0 1 3 4; do
  echo "--- activeDays=$n ---"
  # seed via the __DEV__ helper, then read back what the store actually holds
  ./scripts/sim.sh state '.activeDays, .isPro'
  ./scripts/sim.sh screen | head -8
done
```
**Report all four, plus the `isPro: true` case.** Five snapshots or the trial is not tested.

## 18.5 Dead-control audit (Unit 13)

```bash
grep -rn "onPress" src/app src/components --include="*.tsx" | wc -l   # the denominator
grep -rn "onPress={() => {}}\|onPress={undefined}" src --include="*.tsx"
```
**Then inspect every hit by hand — trap #5.** A regex count is not a defect count. Report both the
raw count and the verified count, and say which is which.

## 18.6 Bundle size delta

```bash
npx expo export -p web >/dev/null 2>&1 && du -sh dist
```
Before and after any dependency addition. **Report the delta in the commit body.**

## 18.7 Confirm a modal is an overlay, not a route (Unit 4)

```bash
./scripts/sim.sh screen > /tmp/before.txt
./scripts/sim.sh tapon "<the gated control>"
./scripts/sim.sh screen > /tmp/after.txt
comm -12 <(sort /tmp/before.txt) <(sort /tmp/after.txt) | wc -l
```
**A healthy overlay keeps most of the underlying labels.** Near-zero overlap means you navigated.

---

# §19. TROUBLESHOOTING — symptom to cause

| symptom | first thing to check | the usual cause |
|---|---|---|
| App is blank, `tsc` is green | device log for `ReferenceError` | wedged Fast Refresh bundle — trap #2, §1.5 |
| `sim.sh state` returns `null` | store size | AsyncStorage spilled to `md5(key)` — trap #3 |
| `sim.sh` acts on the wrong device | `echo $EUPHORIA_UDID` | two simulators booted — trap #30 |
| A tap does nothing | `idb ui describe-all` frames | anchor vs box, or a pinned footer eating it — traps #1, #17 |
| A `Switch` will not toggle | — | `idb` cannot actuate RN `Switch` — trap #4 |
| Rate limiter never limits | which port? | `:8082` is the dev server — trap #20 |
| `className` does nothing | `tailwindcss` major version | NativeWind 4 needs Tailwind 3 — §10.2 |
| An icon renders as a sparkle | `ui-icon.tsx` typing | `Record<string,...>` annotation widened the union — trap #19 |
| ScreensDesign returns an error about size | the error message | result written to a file; parse it — trap #21, §2.1 |
| `jq` errors "object cannot be matched" | — | `.description` is an object — trap #22 |
| `curl` says "no matches found" | quoting | zsh globbed the `?` — trap #28 |
| `git push` rejected / repo not found | `gh auth status` | wrong account — trap #14 |
| Lint warnings went 47 → 48 | your diff | you caused it — §0.9, §7 |
| A python heredoc `assert` fails | the anchor string | it does not match the file — trap #29 |

---

# §20. COPY DECK — unapproved, evidence-shaped

**Everything here is UNAPPROVED.** The structure is backed by 4/5 and 5/5 convergence; the words are
not signed off. Ship them, mark them, and put them in front of the user (§0.7).

## 20.1 The gate sheet

| refusal | headline | body |
|---|---|---|
| `trial-expired` | **Your free 3 days are up** | *"You've read {g} guides and finished {l} lessons. Euphoria Pro keeps them coming."* (drop the sentence entirely if both are 0) |
| `count-limit` · lesson | **That's 5 lessons** | *"The free run is five. Pro opens all twelve courses."* |
| `count-limit` · atlas | **Atlas needs a break** | *"You've used your 10 free questions. Pro makes them unlimited."* |
| `count-limit` · options | **That's your third preview** | *"Options previews are capped at three on free. Pro opens the desk."* |

**Shared lines:** 🔒 *"Every lesson, unlimited Atlas, the full options desk"* · CTA **"See Euphoria
Pro"** · secondary **"Why isn't Euphoria free?"**

## 20.2 "Why isn't Euphoria free?"

> *"Market data costs us money every time you pull a quote. Atlas costs money every time you ask it
> something. We don't run ads and we don't sell what you do here, so the only other option is a
> subscription. That's the whole reason."*

Modelled on Astra AI's *"Why isn't Astra AI free?"* (`323575`). It answers the resentment instead of
ignoring it, and for a finance app aimed at 18–25s that honesty is a differentiator, not a weakness.

## 20.3 The trial timeline block (inside the paywall, never its own route — §6.6.2)

```
TODAY   🔓   Everything unlocked — every lesson, unlimited Atlas
DAY 2   🔔   We'll remind you before anything is charged
DAY 3   ⭐   Your trial ends. Keep going for $9.99/mo or $59.99/yr
```

## 20.4 Locked-content labels (in place, titles always visible — §6.6.3 4/4)

- Learn path locked node: the lesson title stays, plus a lock glyph. **No "Pro" badge** — the lock
  says it.
- Digest locked body: *"The rest of this guide is part of Euphoria Pro."*
- Duolingo's move, worth copying where it applies: a lock that **states its own unlock condition**
  (*"Finish 7 lessons to start competing on Leaderboards!"*). Where a gate is a progress gate rather
  than a paywall, say the condition — do not show a paywall for something money cannot buy.

## 20.5 Words to avoid

**"Premium"** (says nothing) · **"Unlock your potential"** (says nothing) · **"Limited time"** when
it is not · **"Join thousands"** — Euphoria has no verified user count and inventing one is §0.4
applied to marketing.

---

# §21. WHAT THIS DOCUMENT DOES NOT COVER

Stated so a session does not assume silence means "already handled":

1. **Android.** Everything here is iOS-simulator-verified. Android has never been run.
2. **Real device testing.** Simulator only. StoreKit and push both behave differently on hardware.
3. **App Store submission.** No screenshots, no description, no privacy nutrition labels, no
   subscription metadata in App Store Connect.
4. **Analytics.** There is no telemetry anywhere. This is why the Atlas feedback controls were cut
   at 3/5 convergence (§0.5) — nothing exists to receive an event.
5. **Push notifications beyond the local daily nudge.** `notifications.ts` schedules a local
   reminder at `NUDGE_HOUR 19` and honestly reports what the OS actually accepted. There is no
   remote push.
6. **The web app** (`~/euphoriaweb-current`). It is the content source of truth and shares the
   Supabase project, but no work here touches it except `sync-digest.sh`.
7. **Localisation.** English only, American spelling.
8. **Offline behaviour** beyond what AsyncStorage gives for free.

**Do not invent status for any of these.** If asked, say they are untouched.

---

# §22. CORRECTIONS LOG — verified against the codebase, newest first

**Read this before trusting §3, §10, or any file path in this document.** Every entry below was
found by checking the actual repo, and each one contradicts something stated earlier in this brief.
Where they conflict, **this section wins** — it was written with the files open.

## From Unit 2 (2026-08-07)

### C1. §3.2's repo map OMITS TWO ICON SYSTEMS. This nearly destroyed a live component.

`§2d` says *"create `src/components/icon.tsx` — the single entry point"*. **That path was already
occupied.** Writing to it clobbered a real, in-use component, caught only because `tsc` then failed
in four files. The app has **three** icon systems now, and all three are legitimate:

| file | what it is | callers | union |
|---|---|---|---|
| `src/components/icon.tsx` + `src/lib/euphoria-icons.ts` | ~112 **multicolor** SVGs, **shared with `~/euphoriaweb-current` so icons are pixel-identical across platforms**. Decorative / illustration moments. | 4 | `name: string` — **WIDE, no guard** |
| `src/components/ui-icon.tsx` | 24 hand-drawn 24×24 marks, **stroke 2.2**, single colour. Chrome: tab bar, list rows, inline glyphs. | **34** | narrow, via `satisfies` |
| `src/components/lib-icon.tsx` | **NEW in Unit 2.** Hugeicons wrapper, `LibIcon` / `LibIconName`. | 0 yet | narrow, via `satisfies` |

`icon.tsx`'s own docblock states a house rule this brief did not know about:
**"No emoji, no lucide, no template defaults."**

### C2. `ui-icon.tsx` ALREADY HAD 8 of the 9 utility glyphs §2b wanted from a library.

Present before Unit 2: `lock` `close` `chevronLeft` `chevronRight` `check` `bell` `search`
`arrowRight`. Genuinely missing: **only `share` and `plus`.**

**Therefore `lib-icon.tsx` deliberately contains exactly those two.** Re-exporting a glyph that
`ui-icon.tsx` already has would let two screens render a *different padlock* depending on which
import the author reached for — a visual-consistency defect no type-checker catches and no single
screenshot reveals.

> **RULE, and it is load-bearing: before adding a name to `lib-icon.tsx`, grep `ui-icon.tsx` and
> `lib/euphoria-icons.ts`. If it exists there, use it from there.**

Hugeicons was kept by explicit user decision after this was surfaced, on the grounds that 46k
glyphs are available for later units. Cost is honest and measured — see C6.

### C3. §3.5's token values are WRONG in two places. Read `src/constants/theme.ts`, never §3.5.

| token | §3.5 claims | actual |
|---|---|---|
| `background` | `hsl(240 10% 4%)` | **`#09090D`** |
| `backgroundElement` | tier 2 (14%) | **`hsl(240 10% 9%)` — tier 1** |
| tier 2 (14%) | — | is `cardElevated` / `input` / `muted` |
| `backgroundSelected` | **omitted entirely** | `hsl(240 10% 19%)` — tier 3, active/selected |
| `success` | "(green)" | `#22C55E` |

Also absent from §3.5: `accent #B57BEF`, `primaryForeground`, `iconViolet #BB83F1`,
`iconPurple #A451E6`, `iconGold #FBBF24`, `gradientFrom/To`, `BrandGradient`, `MaxContentWidth 640`.
`§2c`'s `tailwind.config.js` sketch reproduced the two errors above; **the committed config does not.**

### C4. §3.6 names the type scale but not the prop. `ThemedText` takes `type`, NOT `variant`.

`type?: 'display' | 'title' | 'heading' | 'body' | 'bodyMedium' | 'small' | 'smallBold' | 'label' | 'code'`

### C5. §2a's research conclusion inverts when you look at the PIXELS instead of the prose.

`exhaustive_description` says "each containing an icon" for both Astra AI `323574` and Nibble
`132884`. **Both are system EMOJI** — 📐 Math, 🪐 Physics, 🧪 Chemistry, 💻 CS, 🇬🇧🇩🇪🇪🇸 languages in a
grey chip. Nibble's own neighbour `132885` admits it in prose: *"represented by an **emoji**"*.

Verified in pixels, of three $450k–750k/mo education apps:

| app | topic identity | |
|---|---|---|
| Elevate `1395` `111647` | bespoke flat art, **distinct accent colour per skill**, each paired with a mini data-viz motif | real art budget |
| Astra AI `2190` `323574` | system emoji in a grey chip | spends nothing |
| Nibble `918` `132884` | system emoji | spends nothing |

**ZERO use a generic stroke-icon pack for identity.** The market is bifurcated into
bespoke-or-emoji and the middle is empty. §10.3's split decision therefore holds, but for a
sharper reason than §10 gives. Elevate is the strongest transfer: brain-training "skills" are
abstract domains with no obvious object to draw — structurally identical to *Behavioral Finance*
and *Quantitative Analysis*. Its mechanism (**one mark + one accent colour per topic**) is exactly
`courseAccent(id)` tinting a 48×48 path per §10.4.

One divergence, chosen deliberately: Elevate's marks are **filled flat shapes**, not 2.2px strokes.
§10.4's stroke 2.2 is kept anyway — internal consistency with `ui-icon.tsx`'s 24 existing marks
beats matching Elevate.

### C6. Measured costs of the Unit 2 install. Disk is NOT bundle.

- `node_modules/@hugeicons/core-free-icons` = **125 MB on disk** — install footprint only.
- Bundle: `npx expo export -p web` **23,280 KB → 23,332 KB = +52 KB**, covering NativeWind's
  runtime, the compiled CSS, and 2 Hugeicons glyphs. Well under §2e's 400 KB threshold.
- **The barrel is the trap, and it is real.** Babel warned on install: *"the code generator has
  deoptimised the styling of .../core-free-icons/dist/cjs/index.js as it exceeds the max of
  500KB"*. `lib-icon.tsx` therefore imports **per-glyph subpaths**
  (`@hugeicons/core-free-icons/Add01Icon` → `dist/esm/Add01Icon.js`, ~350 B, real types at
  `dist/types/Add01Icon.d.ts`). **Never import from the package root.**

### C7. NativeWind needed a `babel.config.js` THAT DID NOT EXIST, and a cache-clear restart.

Expo SDK 57 ships no babel config by default. Unit 2 created one solely for NativeWind's two hooks
(`jsxImportSource: 'nativewind'` + the `nativewind/babel` preset). `metro.config.js` was **edited,
not replaced** — the pre-existing `.riv` `assetExts` push is preserved and `withNativeWind` wraps
last so it sees it.

**A babel or metro config change is NOT picked up by Fast Refresh.** After either, you must:
```bash
lsof -ti:8082 | xargs kill -9; npx expo start --port 8082 --clear
xcrun simctl terminate "$EUPHORIA_UDID" com.euphoria.native
xcrun simctl openurl "$EUPHORIA_UDID" \
  "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082"
```
Note `expo start` **buffers its output when stdout is not a TTY** — an empty log does not mean it
failed. Check `lsof -ti:8082` instead.

### C8. Tailwind pin confirmed necessary. NativeWind's peer range does not protect you.

`nativewind@4.2.6` declares `peerDependencies: { "tailwindcss": ">3.3.0" }` — which **`4.3.3`
also satisfies**. A bare `npx expo install tailwindcss` can therefore resolve a v4 that NativeWind 4
cannot read, and the failure is silent: classes compile to nothing. Installed and verified:
`tailwindcss@3.4.19`.

**The only proof that any of this works is a measured pixel**, per §0.3. Unit 2's:

| class | measured on device | expected |
|---|---|---|
| `bg-primary` | **(168, 85, 235)** | `#A855EB` — exact |
| `bg-cardElevated` | (32, 32, 39) | (33,33,40) — ±1, hsl→rgb rounding |
| `bg-card` | (21, 21, 25) | (21,21,26) — ±1 |

## New traps, continuing §4's numbering

| # | trap | the rule that follows |
|---|---|---|
| 32 | **`Write` to an existing path silently clobbers it.** §2d's instruction named `src/components/icon.tsx`, which was a live component with 4 callers; the overwrite was caught only because `tsc` failed afterwards. A tool result reading *"has been updated successfully"* rather than *"File created successfully"* is the tell — **and it arrives after the damage.** | **Before `Write`, confirm the path is free** (`ls`, or `git log -- <path>`). Recover with `git checkout HEAD -- <path>`. Treat any file path in this brief as unverified until checked — §3's map is incomplete, see C1. |
| 33 | **A regex count is not a name list** (this is trap #5 in another costume). Grepping `plus` in `euphoria-icons.ts` returned 16 hits and `x` returned 111 — every one a substring false positive. Both glyphs were absent. | Enumerate the actual **keys** (`grep -oE "^\s{2}'?[a-zA-Z][a-zA-Z0-9-]*'?:"`), then read the list. |
| 34 | **`sim.sh tapon` will tap a coordinate that is OFF THE SCREEN.** The a11y tree reports elements inside a `ScrollView` at their CONTENT coordinate, so a row scrolled below the fold is listed at e.g. `y=933` on an **874pt** screen. `idb ui tap` accepts it, taps nothing, and returns success. A Digest row was twice concluded "unpressable" on this basis; `describe-all` then showed the pressable was a perfectly good `Button 370x91, enabled=True`, and tapping its real on-screen centre navigated first time. | **Guard added to `sim.sh` — it now REFUSES and tells you to scroll.** If you hit this elsewhere: compare the resolved `y` against the 874pt screen height before believing any "nothing happened" result. |
---

## From the Unit 4 research pass (2026-08-07) — §6.6.2 IS WRONG ABOUT ITS OWN EVIDENCE

### C9. The trial timeline is NOT "a component inside the paywall" in the apps §6.6.2 cites.

§6.6.2 states, and builds a hard instruction on:

> *"In every one of the five references above, the timeline is a **component inside the paywall**
> ... or a **dismissible explainer modal**. **Not one of them is a full-screen step on the main
> path.**"* → *"If you find yourself creating `src/app/trial-timeline.tsx`, stop."*

**Both screens checked in PIXELS contradict that.**

| screen | §6.6.2 called it | what the image shows |
|---|---|---|
| Nibble `132921` | *"'Free trial guide' modal"* | A **FULL SCREEN** — white ground, `X` top-right, `Continue` pinned to the bottom edge. Position 47, between account creation (46) and *another* full screen (`132922`: goat mascot, "We'll remind you 2 days before your free trial ends", an `April 30` pill). On the main path. |
| Promova `138757` | *"paywall, vertical timeline"* | A **FULL SCREEN whose entire body IS the timeline**, CTA `START FREE TRIAL`, **and no price anywhere**. Position 38. Followed at 39 by `138758`, a **SEPARATE full-screen paywall** carrying the pricing: *"Try 7 days for free / then US$0.27 per day / billed yearly at US$99.99"*, `SEE OTHER PLANS`, `Restore Purchases`. |

So the verified pattern is **standalone timeline screen → separate pricing screen**, which is precisely
the shape commit `59c27da` removed.

**What to do with that.** The user rejected a standalone trial-timeline screen outright, and that
decision stands — it is a product call and it does not need evidence. But the plan must stop
claiming the reference apps support embedding, **because they do not**. State it honestly instead:

> Euphoria embeds the timeline in the paywall **by user decision**, diverging from the reference
> apps, which ship it as its own screen. The divergence is deliberate, not evidence-led.

**CONVERGENCE COUNT INCOMPLETE — do not quote a hit rate yet.** Population is real: 30 apps in
Education + Finance ≥ $250k/mo carry `HasTrialTimeline`. Only **2 of them were verified in pixels**
(both standalone), which is below §0.2's ≥4 threshold. The ScreensDesign data budget was exhausted
mid-pass — *"You have flown through your data budget"* — so finish this before Unit 4 ships:
sample Quizlet `874`, Zutobi `105`, Busuu `981`, Headway `891` and report a real hit rate.

### C10. §9.5's gate-sheet mockup differs from Astra AI `323575` in four ways that affect the build.

The ASCII sketch in §9.5 is a centred card. The screen is not.

1. **It is a BOTTOM SHEET**, anchored to the bottom edge, occupying roughly the lower half. The top
   ~48% stays visible blurred content. §9.5's centred-card layout is wrong.
2. **The blur is a real heavy blur, not a scrim.** Text behind is illegible while layout stays
   readable. Note also that the rows visible behind the sheet (French, Biology, Geography) are
   *different* from `323574`'s — the user had scrolled, and the gate rose over wherever they were.
   This is what "keeps their place" actually means.
3. **The star STRADDLES the sheet's top edge**, half above and half on it, deliberately breaking
   the rectangle. §9.5 places it "above the sheet".
4. **The type ratio is about 3:1**, not the near-equal weighting the sketch implies — headline
   ~56pt against a ~17pt grey sub-line. And the CTA is the single word **`Buy`**.
   The 🔒 is a literal **emoji**, consistent with Astra AI's emoji-forward habit (see C5).
   `X` sits top-right inside a circular grey chip; *"❤️ Why isn't Astra AI free?"* is a grey pill,
   bottom-centre.

### C11. Plan-picker mechanics worth copying, from `323576` and `323577`.

- **The Yearly/Monthly toggle lives INSIDE the plan card**, top-right — not as a page-level control.
  In the captured frame `Monthly` is the selected pill even though `Yearly · Save 58%` sits beside it.
- **"See all benefits" expands INLINE.** `323577` is the same screen with the list open — 11 rows
  with green checks, including *"Improve grades or get a full refund"* and *"Support free access to
  underprivileged students"*. It is **not** a separate screen, so do not build one.
- `Ask parent to pay` appears under the expensive tier only.
- **`Restore Purchases` is present** on Promova's pricing screen `138758`, supporting the 3/5
  convergence already recorded and the App Store requirement for Unit 5.

### C12. Implementable structure for the timeline block (both verified apps).

- **Nibble:** each step is a rounded-square card with a **coloured label bar across its top**
  (`TODAY` orange, `DAY 5` purple, `DAY 7` orange) and a flat outline icon beneath; a thin vertical
  connector joins the cards; copy sits to the right. Icons: open padlock, bell, star.
- **Promova:** a **3D rendered** icon (padlock, bell, clock) in a rounded white square, same vertical
  connector, title + description to the right, then a centred trust block —
  **"Cancel anytime / No hidden fees"** — directly above a black full-width CTA.
- Both put the unlock at *Today*, the reminder at *day 5 of 7*, and the charge at the end. Euphoria's
  trial is 3 days, so the reminder beat has to compress — there is no day 5. Decide whether day 2 is
  the reminder or whether a 3-day trial simply has no reminder beat, and say which.

---

## From Unit 3 (2026-08-07)

### C13. Four decisions taken with the user. These OVERRULE §9.4 and §6.6.2.

| # | Decision | What it overrules |
|---|---|---|
| 1 | **On expiry EVERYTHING locks** except the streak / XP / league loop. Paper trading, portfolio, watchlist, quotes, news and guide bodies close alongside lessons, Atlas and options. | §9.4 recommended keeping trading and market data free, on the Bloom precedent. **Rejected.** |
| 2 | **The trial timeline ships as its OWN full-screen step**, followed by a separate pricing screen — the Promova `138757`→`138758` / Nibble `132921`→`132922` shape. Reopened after C9 showed the plan's evidence claim was false; the user will judge it on device. | §6.6.2's *"never becomes its own route"* and its warning against creating `trial-timeline.tsx`. **That instruction is VOID.** |
| 3 | **The middle beat is DAY 2 — "We'll remind you before anything is charged."** The reference apps use day 5 of 7, which does not exist in a 3-day trial. | Nothing; this closes the gap flagged in C12. |
| 4 | **Unit 4 waits for MCP quota.** Unit 3 went first because it needs no design research. | Nothing. |

> **Decision 3 carries an obligation.** That sentence is only honest if a notification actually
> fires. `notifications.ts` already schedules a local nudge and reports what the OS **actually
> accepted** — wire the day-2 reminder through it and verify the accepted result. Do not ship the
> copy on the strength of an intention. If the OS declines, the copy changes, not the claim.

> **Decision 1 has a consequence to design for, not argue with.** An expired user has nothing left
> to open. The gate sheet's dismiss path and the streak/XP loop are therefore the only re-entry
> points in the whole app, so both must stay genuinely reachable — a non-dismissible gate would
> strand the user completely.

### C14. `trialDaysLeft` alone is NOT safe to display. Found by measuring, not reasoning.

On the third active day the device reported `tier=trial` with `daysLeft=0`. Both correct — expiry
begins on the **fourth** distinct day — but a banner reading **"0 days left" on a day the user can
still fully use** reads as already expired. That is the shape of bug that produces "I paid and it
still says my trial ended".

`entitlement.ts` therefore also exports **`trialDayNumber()`** — 1-based, clamped to `TRIAL_DAYS`.
**Use it for display: "Day 3 of 3", never "0 days left."** Exact wording is Unit 4's call.

### C15. What Unit 3 shipped, and how it was verified.

`store.activeDays: string[]` — persisted, in `partialize`, **excluded from `reset()`** as the third
deliberate exclusion beside `isPro` and `installId`. Appended by a shared `withToday()` helper from
exactly five actions: `completeLesson`, `markPostRead`, `spendAtlasMessage`, `buy`, `sell`.
**App launch is deliberately NOT a call site** — a mis-tap on the icon must not burn a trial day.
Capped at `TRIAL_DAYS + 1`.

All five states driven on device via a temporary `devtrial` route (since deleted), reading the
persisted store back each time:

| seeded | tier | daysLeft | features | store |
|---|---|---|---|---|
| 0 | trial | 3 | all 6 OPEN | `[]` |
| 1 | trial | 2 | all 6 OPEN | `["seed-0"]` |
| **3** | **trial** | **0** | all 6 OPEN | 3 entries |
| 4 | expired | 0 | **all 6 `LOCKED:trial-expired`** | 4 entries |
| 1 + `isPro` | **pro** | 2 | all 6 OPEN | `isPro=true` |

The boundary row is the one that matters: **day 3 is still a trial day.** 14 `__DEV__` assertions
cover it and ran clean on device — `[entitlement]` error lines: 0.

**Housekeeping:** the QA install still holds a leftover `activeDays: ["seed-0"]` from that seeding.
Inert while `isPro` is true, because `tier()` returns 'pro' regardless — but **a future session that
flips `isPro` false to test the trial will start at day 1, not day 0.** Clear it first. Pre-seed
baseline: `refs/BASELINE_STORE_20260807.json`.

---

## From the per-lesson art work (2026-08-07)

### C16. 300 authored lesson marks. Unit 12's art system, pulled forward and finished.

The user asked three times for "the icon for every single lesson", so this was built in full rather
than scaled down. Three separate defects were found and fixed on the way, in this order:

**(a) Variety.** `artKeyFor` matched at COURSE granularity, so Behavioral Finance drew one `mind`
glyph on 24 of 25 nodes, sixteen consecutively. Fixed with 14 new ART scenes (26 → 40) and a
150-pattern concept tier above the broad nets. Measured: worst repeat 24 → 5, worst run 16 → 2.

**(b) Quality.** The art then still looked bad, and the cause was contrast, not variety.
`LessonArt` derives its whole palette from the course accent (`base: accent`,
`lite: shade(+0.42)`, `dark: shade(-0.34)`) while an ACTIVE node's face is `accent + '2E'` — the
same accent at 18%. Pink art on a pink ground. `components/art/lesson-mark.tsx` replaced the filled
scenes on nodes with 40 stroke marks, and `lessonMarkColor()` owns the contrast rule in one place:
near-white on the active node, accent on the neutral ones. **This is the same defect as the
course-card chip. Colour art to contrast the surface behind it, never to match it.**

**(c) Uniqueness.** A regex table is a preference order, not an assignment, so it can reduce
collisions but never eliminate them. `components/art/lesson-marks/` is a per-lesson map keyed
`courseId:num` — 12 files, 25 marks each, **300 total** — so uniqueness holds by construction.

**Verified:** 300/300 authored · keys 1..25 contiguous in all 12 files · **zero within-course
duplicate geometries** · 270 globally distinct. The 30 overlaps are deliberate: the checkpoint flag
(lesson 10) and the graduation cap (lesson 25) are shared across courses, because they mark the same
KIND of moment and §4's own note records that 3 of 6 reference paths punctuate with a consistent
reward marker. Courses never render side by side.

**The fallback stays on purpose.** `LessonNodeMark` prefers the authored mark and falls back to the
40-key regex mark, so an unmapped lesson degrades to something good rather than to a blank node, and
the `__DEV__` check reports coverage out loud rather than letting a partial set look finished.

**`LessonArt` is NOT deleted.** It still serves the Home hero at 96pt, the course cards and
onboarding, where a filled scene sits on a NEUTRAL card and has real contrast.

**Keyed on number, not title** — renaming a lesson keeps its mark, but RESEQUENCING the curriculum
moves marks with the number. If lessons are reordered upstream, these maps must be reordered too.

### C17. The curriculum has 300 lessons, not 295. There is no `courseIndex` bug.

An earlier extraction reported 295 and flagged `totalLessons: 25` for corporateFinance as wrong.
**That was my error.** The regex only matched the `L(n, '…')` form; corporateFinance declares its
first five lessons in the `num:` object form. All 12 courses have 25 lessons and `courseIndex` is
correct. Any script counting lessons must match BOTH forms.

### C18. Two self-inflicted traps worth remembering.

- I wrote `require('react-native-svg')` inside a component. That is **trap #27** exactly — a require
  justified by an import cycle that does not exist. Replaced with a top-level import.
- My own uniqueness checker reported a false duplicate because its geometry signature captured
  `d=` and circle attributes but **not `<Rect>` coordinates or `transform=`**. Two `<Rect>`-only
  marks looked identical to it. **Trap #33 again, in the verification rather than the code:** a
  check that only looks at part of the artifact will pass or fail for the wrong reason.

### C19. TWO AUTHORITIES DISAGREE ABOUT OPTIONS. Resolve in Unit 4 before the gate ships.

Found while building the You tab's plan card, which tried to show all three remaining counts:

| source | says |
|---|---|
| `store.derivativesLeft()` | **0 for anyone not Pro** — its own comment: *"zero-because-locked, not zero-because-spent. The screen distinguishes the two."* Options are a Pro feature. |
| `entitlement.entitled(s,'options')` | allows **`PRO_DERIVATIVE_PREVIEW` = 3** during the trial |
| §9.4's table | *"Options · trial: 3 preview trades · expired: locked"* |

So the plan and the new entitlement engine say three previews; the shipped store getter and
`options.tsx` say Pro-only. **This is exactly the split-authority problem Unit 3 existed to remove,
and I reintroduced it by writing `entitled()` from §9.4 without reconciling the getter.**

The You tab now shows only lessons and Atlas — the two counts both authorities agree on — rather
than printing a number that contradicts another screen. That is a stopgap, not a fix.

**Unit 4 must pick one, and one of the two has to change:**
- If options ARE trial-previewable, `derivativesLeft()` must stop hard-returning 0 for non-Pro, and
  `options.tsx`'s locked copy has to change with it.
- If options are Pro-only, `entitled()` needs a `'pro-only'` refusal reason so the gate sheet can
  say *"Options are part of Pro"* rather than misreporting a spent allowance.

Do not ship the gate sheet until this is one answer.

---

## From the Unit 4 research pass, completed (2026-08-07, after quota returned)

### C20. Trial-timeline convergence is now 4/4. This REFINES C9 — do not read C9 alone.

C9 was written from 2 apps and overstated the case. With 4 pixel- or description-verified:

| app | rev/mo | where the timeline lives | beats |
|---|---|---|---|
| Nibble `918` `132921` | $450k | **its own full screen** — "Free trial guide", `X` top-right, `Continue` pinned | TODAY 🔒 / DAY 5 🔔 / DAY 7 ⭐ |
| Promova `936` `138757` | $250k | **its own full screen**, CTA `START FREE TRIAL`, **no price** → separate pricing screen `138758` | Today / In 5 days / In 7 days |
| **Headway `891` `128586`** | **$850k** | **its own modal** — "Free trial guide", `X`, full-width `Start free trial` | TODAY / DAY 5 / DAY 7, lock + bell + star |
| **Quizlet `874` `147530`** | **$2.25M** | **EMBEDDED — it IS the paywall header**, and embedded again in the plan picker `147531` | Today / June 4 2025 |

**So: 4/4 ship a timeline. 3/4 give it its own surface; 1/4 embeds it.** §6.6.2's claim that it is
*always* "a component inside the paywall" is still wrong — but Quizlet is a genuine embedded case, so
the plan was not inventing it. C9's "the reference apps do NOT embed" was too strong; **the user's
standalone-screen decision is now better supported at 3/4, not contradicted at 2/2.**

Note the plan's own §2.1 enum: Headway and Quizlet both record as **"Free Trial - Soft Paywall"**,
and Quizlet's carries an explicit skip — *"Continue using free Quizlet"*. The two highest earners
here are SOFT. Euphoria is going hard after 3 days; that is a defensible choice but it is not the
pattern at the top of this band, and it should be a decision rather than an assumption.

### C21. Headway's full conversion sequence — the most complete reference in the set.

Five screens, positions 37→44, worth copying wholesale rather than in pieces:

1. `128581` **hype** — "You've got this! One more step to claim your **free premium trial**"
2. `128582` **Commitment pact** (uniqueness **9**) — handshake icon, *"I want to learn one new idea
   or fact every day by learning 7 summaries per week…"* / *"I commit to my goals."* /
   *"Tap to commit. Committing to goals boosts motivation."* with a **fingerprint button**
3. `128586` **the timeline** (see C20)
4. `128587` **reminder confirmation** — *"We'll send a reminder 2 days before your free trial ends"*
   with a concrete **date pill: `April 21`**
5. `128588` **the price** — *"Try 7 days for free / then $7.49 per month / (billed yearly at
   $89.99)"* · `View other plans` · "Secured with App Store" · CTA `Start free trial` with subtext
   **"2 taps to start, super easy to cancel"** · Terms · Privacy · **Restore Purchase**

### C22. The reminder beat is expressed RELATIVE TO THE END, with a real date. 3/3.

- Headway `128587` — "a reminder **2 days before** your free trial ends" + `April 21`
- Nibble `132922` — "We'll remind you **2 days before** your free trial ends" + `April 30`
- Quizlet `147531` — "**June 1, 2025**: Trial reminder" against a June 4 end = 3 days before

None of them say "day 5". They say *"N days before it ends"* and then **show the date**. That
matters for Euphoria's 3-day trial: the user's chosen copy — *"We'll remind you before anything is
charged"* — is compatible, and it gets stronger with a computed date pill beside it. `notifications.ts`
already reports what the OS actually accepted, so the date can be real rather than promised.

### C23. Restore Purchases confirmed on 2/2 price screens (Headway `128588`, Promova `138758`).

Reinforces the 3/5 settings convergence already recorded and the App Store requirement for Unit 5.

### C24. `SpecialOfferPaywall` band = 9 apps. The mechanism is a SECOND paywall on dismissal.

- **EWA `849`** — *"After dismissing the first paywall, the app immediately presents special offers
  with prominent discounts and a **countdown timer**"*
- **Night Sky `1822`** — *"Dynamic Discount Paywall: the price dynamically changes from a high annual
  price to a much lower weekly price after the user interacts with the plan selector"* (uniqueness 7)
- **Impulse `1375`** ($1M/mo) — **Post-Subscription Welcome Screen**, *"listing the premium features
  they have just unlocked"*
- Paywall counts: Nibble 2 · Headway 2 · Falou 2 · EWA 1 · Impulse 1 · Jumpspeak 1 · Night Sky 1 ·
  HelloTalk 0 · SmartyMe 0. **3 of 9 ship two paywalls**, the second being the dismissal offer.

**Euphoria has no second offer and no discount to give.** Do not invent urgency (§20.5). Recorded as
available headroom, not a requirement.

### C25. For Unit 8, from the same pull — Headway's streak mechanics.

- `128564` **"Commit to growing with Headway"** — 7-day *Promising* / 14-day *Determined* / 30-day
  *Impressive* / 50-day *Unstoppable*. **Named tiers, not bare numbers**, with a mascot line
  *"Going the extra mile always pays off."* Directly answers §8b's streak-commitment step.
- `128567` — **"DAY 21 · 21 days may be a great start to build a habit"** with an inline time picker
  for the reminder, ahead of the system prompt.
- `128620` — states the rule plainly: *"Finish 3 key points every day to extend your streak.
  **Miss a day — and it resets to 0.**"*

### C26. C19 RESOLVED. Options are open during the trial, because the 3-cap is a DATA limit.

The user's call was "options previewable during the trial are fine", and the research agrees — but
it reframes the question rather than just answering it.

**The evidence.** Every trial timeline in the reference set states what a trial grants, and 4/4 say
FULL access, not metered previews:

| app | "Today" says |
|---|---|
| Headway `128586` | *"No payment now, just **full access to the Premium experience**"* |
| Promova `138757` | *"**Unlock all lessons**, practice without ads and get unlimited AI role-play"* |
| Quizlet `147531` | *"Today: **Get instant access**"* |
| Nibble `132921` | *"No payment now. Start daily microlearning lessons and quizzes"* |

**The reframe that actually resolved it.** `PRO_DERIVATIVE_PREVIEW = 3` is **not a monetisation
tier**. It is a DATA limit — there is no options provider connected, which is why `options.tsx`
already says *"More arrives with a full options data plan"* and why **even a Pro user gets only
three**. So the cap binds everyone WITH ACCESS equally, and access is the only thing gated:

| tier | options |
|---|---|
| trial | **open**, capped at 3 — the same 3 a Pro user gets, because 3 is all the app can honestly offer |
| expired | locked — the wall, which now reads "Pro **reopens** 3 preview contracts" |
| pro | open, capped at 3 |

**What changed.** `store.derivativesLeft()` no longer hard-returns 0 for non-Pro; it returns 0 only
once the trial is spent. `options.tsx` gates on ACCESS via `useTier()` rather than on `isPro`, which
had been locking out precisely the users the trial exists to convert. `TRIAL_DAYS` moved to
`store.ts` beside `activeDays` and is re-exported from `entitlement.ts`, so expiry has **one**
definition — store cannot import entitlement without a genuine cycle, unlike trap #27's imaginary
one.

**Verified on device:** a trial user sees `3 lessons · 9 Atlas · 2 options contracts left` on You and
reaches the chain reading `2 of 3 preview contracts left`; an expired user gets the wall. Both
surfaces now report the same number, which is what C19 was about.

**A larger question this exposes, not yet decided.** If 4/4 reference trials mean full access, then
§9.3's metered trial — 5 lessons and 10 Atlas messages *during* the trial — is off-pattern too. The
count limits arguably belong to a FREE tier that exists before or instead of the trial, not inside
it. That is a product decision, not a bug, and it is untouched. Raise it before Unit 5 prices
anything.

---

## Decisions taken 2026-08-07 (round 2)

### C27. Trial model: full content access, Atlas stays capped.

The answer given was "#1 and #2", which as written are contradictory (unmetered vs metered). The
reading being implemented, and it should be corrected if wrong:

- **Content is UNMETERED during the trial** — every lesson, every guide, options. This is what 4/4
  references mean by a trial (§22 C26) and it means a trial user actually sees the product.
- **Atlas keeps its cap.** It is the one feature with a real per-message cost to us; lessons and
  guides are already-authored content that costs nothing incremental to serve. Metering the
  genuinely expensive thing and opening the rest is the coherent half of each answer.
- `FREE_LESSON_LIMIT` therefore stops binding during the trial. store.ts calls it "THE OFFER", so
  this is a real change to the offer, not a tweak.
- After expiry the hard wall applies to everything (C13 decision 1, reaffirmed below).

### C28. Hard wall REAFFIRMED, with the counter-evidence on the record.

Kept, after being shown that the two highest earners in the band ship SOFT paywalls with a visible
skip — Headway $850k and Quizlet $2.25M, whose paywall carries *"Continue using free Quizlet"*.
Euphoria goes hard after three days anyway. The gate sheet stays always-dismissible so users are
never trapped, and the streak/XP loop plus the day-2 notification are the only re-entry paths.

### C29. Pricing: KEEP $9.99 / $59.99. Recommendation from five real paywalls.

Prices read off actual captured paywalls rather than marketing pages:

| app | rev/mo | monthly | yearly | yearly ÷ 12 |
|---|---|---|---|---|
| Quizlet `147531` | $2.25M | $7.99 | $35.99 | **$3.00** |
| Headway `128588` | $850k | — | $89.99 | **$7.50** |
| Promova `138758` | $250k | — | $99.99 | **$8.33** |
| Astra AI `323576` | $550k | $24 (Plus) | — | — |
| Bloom (external est.) | ~$291k | $15 | $120 | **$10.00** |
| **Euphoria** | — | **$9.99** | **$59.99** | **$5.00** |

**Euphoria's monthly is already mid-pack** — above Quizlet, below Bloom, far below Astra AI. So the
"we are half of Bloom" framing in §9.10 is misleading: it compares against the single most expensive
comparable rather than the set.

**The decisive argument against matching Bloom:** Bloom's $15 buys **real fractional investing** —
actual money, a real brokerage. Euphoria's buys **paper trading**. Charging Bloom's price for a
simulator invites the comparison Euphoria loses. Keep $9.99.

**One genuine finding to revisit later, not now:** the ANNUAL is where Euphoria is actually cheap.
At $59.99 it is $5.00/month-equivalent against a peer median near $7.90 — roughly 37% under. If
pricing is ever revisited, raise the annual toward ~$89.99 (Headway's exact equivalent) and leave
the monthly alone. That was offered and not chosen, so it stays a note.

### C30. Tab count: the data says FIVE. It does not support a sixth.

Instruction was to run the count and follow it even if it disagrees with taste. ScreensDesign quota
ran out mid-pass, so this is **5 of the 8 named apps, not 8** — stated as a limit, not padded:

| app | rev/mo | tabs |
|---|---|---|
| Gauth `39` | $600k | **2** (Home, Profile) |
| Quizlet `874` | $2.25M | **4** (Home, Create, Your library, Free Trial) — from `147535` |
| Bloom `2004` | ~$291k | **5** (Home, Discover, Learn, Games, Profile) |
| Duolingo `862` | $48M | **5** |
| Investing.com `1171` | $450k | **5** (Markets, News, Ideas, Watchlist, More) |

**Five is modal at 3/5. NOT ONE app in the sample ships six.** The range runs 2–5, and the highest
earner in the sample by a wide margin (Quizlet, $2.25M) ships four.

**So the data does not support adding a sixth tab, and saying so is the instruction.** The reward
loop and league ladder need a home, but the evidence points at densifying Home (Unit 8 is already
doing exactly that) rather than adding navigation. Euphoria already ships five.

Finish the count to 8 apps (Elevate `1395`, Nibble `918`, Praktika `1816`) when quota returns before
treating this as closed.

### C31. Pricing CHANGED: $9.99/mo unchanged, annual $59.99 → $79.99. And a real bug fixed.

Acting on C29's parked finding, at the user's instruction to pick whatever is best.

| | was | now | why |
|---|---|---|---|
| monthly | $9.99 | **$9.99** | already mid-pack: above Quizlet $7.99, below Bloom $15, far below Astra AI $24 |
| annual | $59.99 | **$79.99** | $59.99 was $5.00/month-equivalent against a peer median near $7.90 — ~37% under |
| per-month equiv | $5.00 | **$6.67** | deliberately BELOW the median: Bloom's $15 buys a real brokerage, ours buys paper trading |
| badge | SAVE 50% | **SAVE 33%** | 9.99 × 12 = 119.88 ; 79.99 / 119.88 = 0.667 |

**A REAL BUG FOUND AND FIXED IN THE SAME PLACE.** The paywall badge and the App Store renewal
terms both read **"7 days free"** while the entitlement engine grants **THREE**. The purchase screen
was promising more than the app delivers — the kind of mismatch App Store Review 3.1.2 exists to
catch, and a refund request waiting to happen.

Both now interpolate `TRIAL_DAYS` from `lib/entitlement.ts` rather than carrying a literal, so the
two cannot drift again. Prices live in a single module-scope `PRICING` const in `onboarding.tsx`
with the saving arithmetic written out beside it.

Still owed here: §9.6's plan-card redesign and the trial-timeline block inside the paywall body are
NOT done — only the numbers and the trial length changed.

### C32. Unit 7 density: geometry changed, count COMPUTED not yet measured.

§7c's target is ≥10 nodes in a viewport, up from ~6, and §0.6 says revert if the number does not
move. The arithmetic, written into `learn.tsx` so a later edit cannot miss by one node:

Trail viewport ≈ **460pt** — ~852pt screen, less ~300pt of course rail + course header, less ~90pt
of tab bar.

| | GAP | NODE | nodes in 460pt | edge gap |
|---|---|---|---|---|
| was | 100 | 66 | 460/100 = **4.6** | 34pt |
| now | **46** | **36** | 460/46 = **10.0** | 10pt |

A 46pt pitch is impossible at a 66pt node — they would overlap — so the node had to shrink with it.
That is §7b's point that this is *"a different screen, not a spacing change"*: Promova fits ~14 with
small nodes and inline titles, not by tightening gaps around large ones. `AMP` 66 → 58 so the
serpentine swings less far off centre, widening the narrowest title gutter; titles stay at two lines
of 13pt (34pt), which fits inside a 46pt pitch. `LIP` 6 → 4, and the mark and lock sizes scale down
with the node.

**NOT YET MEASURED ON DEVICE.** The static `BlurView` import added in the gate-sheet commit means
`learn.tsx` cannot run on the OLD dev client, and the replacement is still compiling. The count above
is derived from the layout constants, not read off an a11y tree. §7c is not satisfied until
`sim.sh screen` confirms it — if the real number is under 10, §0.6 applies and this reverts.

### C33. Unit 7's density target is NOT achievable as a spacing change. Attempt reverted.

§7b/§7c asked for ≥10 visible nodes. Two attempts, both measured on device, both reverted:

| GAP | NODE | visible | outcome |
|---|---|---|---|
| 100 | 66 | ~6 | the original |
| 46 | 36 | 8 | short of target |
| **36** | **28** | **11** | **target met, screen BROKEN** |
| 58 | 48 | 6 | clean, but no better than the original with smaller nodes |

At GAP 36 the count was hit and the screen was destroyed: two-line titles collided with each other
AND ran under the nodes, the milestone badge sat half off its node, 28pt is below the 44pt HIG touch
minimum, and the serpentine read as a scatter. **I optimised the proxy and broke the artifact — the
exact §0.1 failure — and never checked title bounding boxes against each other, which is trap #1
verbatim: an a11y anchor is a POINT, not a BOX.**

**The binding constraints, measured:** band ~367pt (trail y=452, tab bar y=819); a two-line title at
13pt is ~34pt so pitch must exceed it; a tap target must be ≥44pt. Pitch ~58 is the floor →
367/58 ≈ 6–7 nodes. **The original already achieves that, with larger and more comfortable nodes.**

So per §0.6 the geometry is reverted to GAP 100 / NODE 66 rather than kept with the goal renamed.

**What Unit 7 would actually need:** a different layout MODEL. Promova fits ~14 because it is a LIST
with inline titles; this is a serpentine with titles in a side gutter, which spends horizontal space
on the curve and squeezes titles into a narrow column. Either shorten titles to one line, move them
under the nodes, or drop the serpentine. That is a redesign, not a constant.

**KEPT from the attempt** (both real, both verified): the render-loop fix, and locked nodes now
announcing "Finish the lesson before this one to unlock it" instead of being silent dead controls.

### C34. The density problem is the HEADER, not the pitch. C33's diagnosis was incomplete.

Measured with the trail scrolled to top: **the first node sits at y=575** and the tab bar at y=819.
That leaves a **244pt** band, not the ~367pt C33 assumed — so at pitch 100 only **THREE** nodes fit,
not the ~6 the file's comment has always claimed.

C33's earlier y=452 reading was taken mid-scroll, which made the band look larger than it is. The
band is what it is because the course rail plus the course header consume ~575pt — **roughly 70% of
the screen before a single lesson appears.**

**So Unit 7 was aiming at the wrong constant.** Tightening pitch fights for scraps inside a 244pt
window; the win is upstream — collapse or shrink the rail and header. That is where ≥10 nodes could
actually come from, and it does not require touching node size or touch targets at all.

### C35. UNRESOLVED: the gate sheet did not open, and the test may be at fault.

Expired user (`isPro:false`, `activeDays:4`) tapping the active node produced **zero** gate labels.
The 11 underlying Learn labels were unchanged, so nothing navigated and nothing opened.

**Two candidate causes, not yet distinguished:**
1. `sim.sh tapon "START"` matched the TITLE LABEL, which is a separate a11y element beside the node
   and is not the pressable. The tap may never have reached the node.
2. The handler genuinely did not fire, or `entitled()` returned ok.

The overlay mechanism itself is therefore **still unverified** — the "11 underlying labels present"
result proves only that nothing navigated, which is also what a no-op looks like. Next step: tap the
node by measured COORDINATE from `idb ui describe-all` rather than by label, and confirm
`entitled(getState(),'lesson')` refuses at `activeDays:4` on device.

### C36. CONFIRMED BUG: the gate sheet never opens. Not a test artifact. Unit 4 does not work.

C35 wondered whether the failed tap was the test's fault. It was not.

Measured properly with `idb ui describe-all`: the active node's real frame is **84×84 at (206,442)** —
the wide 130×36 element beside it is the title text, which is what `sim.sh tapon` had been matching.
Tapped dead centre at **(248,484)** with `isPro:false, activeDays:4` (so `tier()` must return
'expired'):

- **zero gate labels appeared**
- **11 underlying Learn labels unchanged** → it did not navigate either

So the tap produced **no effect whatsoever**. Both branches of the handler are unreachable, which
means the press is not arriving at all rather than `entitled()` answering wrongly.

**RULED OUT — do not re-check.** `PulseHalo` (`src/components/pulse-halo.tsx:24`) already sets
`pointerEvents="none"`. My halo hypothesis was wrong.

**Remaining candidates, in the order worth testing:**
1. **The node's absolute container.** Each node is
   `<View style={{ position:'absolute', top:n.y, left:n.x-n.size/2, width:n.size, height:n.size+LIP }}>`
   inside the trail container. On RN, an absolutely-positioned child whose parent lacks an explicit
   height — or which extends past it — can render visibly while receiving no touches. **Verify the
   trail container's height covers `trailHeight` and that nothing clips it.**
2. **A later sibling painting over the trail.** Trap #17's real shape: MultiSelect's own CTA sat
   under the footer's Continue, which painted last and ate the taps, and grepping for the button
   component found nothing. Enumerate what renders AFTER the node map — the Atlas mascot sits right
   beside the active node in the screenshot and is a candidate.
3. **`SpringPressable` itself.** Confirm it forwards `onPress` when `scaleTo` is set; every other
   call site in the app passes it, but none of those are inside an absolute container.

**The cheap decisive test:** put a `console.log` at the top of the node's `onPress` and tap by
coordinate again. If it never logs, the touch is not arriving (1 or 2). If it logs, the bug is in
`entitled()` or `setGate`, not the touch path. That one line separates the two halves and neither
guess above is needed.

**Unit 4 is NOT working and must not be described as built.** The components render, the copy is
right, the static gate is clean — and the mechanism has never once fired on device.

---

## From the Unit 4 / C27 session (2026-08-07, round 3)

### C37. **C36 IS WRONG. The gate sheet fires.** Do not spend another session on its "touch path".

C36 concluded *"the press is not arriving at all"* and named three candidates to test. All three are
moot. Measured with the decisive test C36 itself specified — a readout at the top of the node's
`onPress`, then a tap by coordinate from `idb ui describe-all`:

| what was measured | result |
|---|---|
| active node's real frame | `Button 84×84 at (206.3, 460)`, centre **(248,502)**, `enabled=True` |
| tap dead centre, `isPro:false activeDays:4` | handler **RAN** — reported `ok=false r=trial-expired` |
| the gate sheet | **OPENED**, all 8 of its labels present |
| dismiss | restored **74** underlying Learn labels at the same scroll position |
| the debug state living in `Learn`'s `useState` | **survived** the open/close cycle |

That last row is the real proof of §9.5's mechanism and it is better than the label count: if Learn
had unmounted, the state would have reset. **It did not. The user genuinely keeps their place.**

**The actual cause of the original failure is recorded in C32 and nobody connected it:** the old dev
client had no `expo-blur`, so `<BlurView>` inside the sheet was an unresolved native component and
the sheet rendered **nothing**. That produces exactly what C35/C36 observed — a press that arrives
and a screen that does not change. The locally rebuilt dev client contains `expo-blur`, and the
sheet has worked ever since.

> **The lesson, and it is §0.1's lesson again:** C36 reasoned from "no visible effect" to "no touch",
> skipping the one cheap instrument that distinguishes them. Two sessions were spent on a touch path
> that was never broken.

### C38. The sheet is an RN `Modal`, so §9.5's label-count check CAN NEVER PASS. Method corrected.

`gate-sheet.tsx:118` wraps everything in `<Modal transparent>`. On iOS that presents a separate view
controller, so with the sheet open `sim.sh screen` reports **9 labels, not 74** — the presenting
screen leaves the a11y tree. §9.5 rule 1, §17.2's docblock and §18.7 all demand the opposite.

**`Modal` is KEPT, by user decision, and the CHECK is what changes.** Reasons, in order:
1. It is correct iOS dialog semantics — VoiceOver is focus-trapped in the sheet, which is what a
   modal dialog is supposed to do. An in-screen overlay would let a screen reader wander into the
   blurred background and would need `accessibilityViewIsModal` hand-rolled to undo that.
2. It escapes the tab bar for free. An in-screen sheet would be painted over at the bottom — trap
   #17's exact shape, and the sheet's secondary CTA already ends only 32pt from the screen edge.
3. The label count was a **proxy** for "is this a route change". Two better artifacts exist and both
   were captured: the screenshot shows the blurred Learn screen behind the sheet, and Learn's own
   `useState` survives the cycle.

> **Replace the check.** "Underlying labels still present" is void for this component. Verify instead
> that (a) a screenshot shows the previous screen behind the blur, and (b) state owned by the
> underlying screen survives open→dismiss. Update §18.7 accordingly.

### C39. THE HARD WALL HAD HOLES. Two were verified open on device and are now closed.

C13 decision 1 locks everything on expiry except streak/XP/league. It had only ever been built for
lessons and options. Measured with `isPro:false, activeDays:4`:

| surface | before | now |
|---|---|---|
| Lessons (node tap) | gate sheet ✅ | unchanged |
| Lesson route (deep link) | locked wall ✅ | copy corrected by C27, **plus an escape — see below** |
| Options | wired via `useTier` (C26) ✅ | unchanged |
| **Atlas** | **OPEN** — offered *"9 questions left"*, starters, live composer | **closed surface**, no composer |
| **Guide bodies** | **OPEN** — read a whole article end to end | cover + card 1 free, sheet on card 2 |
| **Trade / portfolio / watchlist** | **OPEN** | **STILL OPEN** |
| **Quotes / news** | **OPEN** | **STILL OPEN** |

The cause of the Atlas hole is worth naming because it is a pattern: **`store.atlasLeft()` knows
nothing about the trial clock.** Any getter that answers "how much is left" will happily answer for a
user who is entitled to nothing. Expiry has to be asked separately, which is why `chat.tsx` now
carries an `expired` flag distinct from `exhausted`.

**A defect found by LOOKING AT THE SCREENSHOT, not by any green number:** `lesson.tsx`'s locked state
shipped with only *"See Euphoria Pro"* and no way out, so an expired user arriving by cold deep link
was stranded on a wall. C13's own consequence note says a non-dismissible gate "would strand the user
completely". Added *"Back to the pathway"*, h=44 exactly. The `router.canGoBack()` branch is verified;
the `replace()` fallback is **not**, because a dev client always occupies the stack root and a true
no-back-stack cold link cannot be constructed here. Said plainly rather than implied.

### C40. C13 decision 1 REFINED for market surfaces: lock the control, keep the data.

C13 as written closes quotes and news too. Taken back to the user with the evidence, the decision is
now: **the portfolio, positions, quotes and news stay READABLE, and Buy/Sell/Trade carry a lock that
opens the sheet.** This is Bloom `156247`'s mechanism, verified in pixels this session.

Convergence, counted across `156247`, `156253`, `323529` plus the two banked Duolingo screens:

| pattern | hit rate |
|---|---|
| the locked item's title/identity stays visible | **5/5** |
| a lock glyph on the item **or its control** | **5/5** |
| body/detail obscured rather than removed | 2/5 |
| an explicit textual `LOCKED` badge | **1/5 — NOT convergent** |

So no `LOCKED` badge was added anywhere; the glyph carries it, which is what §20.4 already said.
The reason this refinement is right rather than merely softer: with everything locked, an expired
user has no reason to reopen the app, and C13 leaves them only two re-entry paths. A readable market
surface is a third.

Bloom's neighbour `156248` adds a detail worth reusing in Unit 8: a black card reading
*"Unlock at least 5 terms to start practicing! You can find terms in lessons, or throughout the
Bloom app."* — a gate that **states its own unlock condition**, exactly Duolingo's move. Where a gate
is a progress gate, say the condition; never show a paywall for something money cannot buy.

### C41. C27 IS BUILT. `FREE_LESSON_LIMIT` no longer exists.

Deleted, along with `store.canAccessLesson` and `store.freeLessonsLeft`. Lessons and guides are
unmetered during the trial; `atlas` and `options` keep their caps and neither is a trial restriction.
`lesson.tsx` now reads `useTier()` from the entitlement module — deliberately NOT an inlined
`!isPro && days > TRIAL_DAYS`, because rewriting the expiry rule inside a screen is the C19
split-authority defect Unit 3 existed to remove.

Three display strings that printed a number which no longer exists were corrected: the lesson wall,
You's plan card (*"Every lesson open · 9 Atlas · 2 options contracts left"*), and Settings' Remaining
row. Settings' Status row also stopped calling a live trial *"Free"* — three tiers exist and it was
reading a boolean.

Five states driven on device via the new **`scripts/seed-trial.sh <days> <isPro>`**, which patches the
persisted store and relaunches. It replaces the `devtrial` route C15 had to delete — a debug screen a
user can reach is a dead control, a script outside the bundle cannot ship.

| seeded | store | displayed |
|---|---|---|
| 0 | `{isPro:false,days:0}` | Free trial · Day 1 of 3 |
| 1 | `{isPro:false,days:1}` | Free trial · Day 1 of 3 |
| **3** | `{isPro:false,days:3}` | **Free trial · Day 3 of 3** — still a trial day |
| 4 | `{isPro:false,days:4}` | Free / "Your free days are up" |
| 1 + `isPro` | `{isPro:true,days:1}` | **Euphoria Pro**, no countdown anywhere |

**The proof that matters:** a trial user **six lessons deep** — past the old wall of five — tapped the
seventh node and reached *"BEHAVIORAL FINANCE · LESSON 7 / Prospect Theory & Decision Making /
20 steps · 30 XP"*. Under the old rule that was the locked screen.

### C42. Two environment facts that contradict §1 and §7.

- **Metro runs on 8081, not the 8082 §1.2 documents.** `expo run:ios` chose it. Every reattach in
  this session used `...?url=http%3A%2F%2F127.0.0.1%3A8081`.
- **The QA device reports 402×874 points, not 852.** Any band arithmetic — Unit 7's especially —
  must use 874 and a 34pt bottom safe-area inset.
- `zsh` does not word-split an unquoted variable, so `for spec in "0 false"; do set -- $spec` silently
  passes nothing. **Trap #7, hit again.** Use `printf '%s\n' ... | while read -r A B`.

### C43. The paywall contradicted itself FOUR times about the trial length. C31's fix was 2 of 6.

Measured on device, all visible in ONE frame:

| copy | said | source |
|---|---|---|
| heading | *"Start your **7-day** FREE trial to continue"* | hardcoded |
| timeline beat 2 | *"In **5 days** — Reminder"* | hardcoded |
| timeline beat 3 | *"In **7 days** — Billing starts"* | hardcoded |
| badge | *"**3 DAYS FREE** · SAVE 33%"* | derived ✅ |
| CTA | *"Start my **7-day** free trial"* | hardcoded |
| renewal terms | *"**3 days** free, then $79.99 per year…"* | derived ✅ |

C31 identified exactly this class — *"the paywall was promising more than the app delivers, the kind
of mismatch App Store Review 3.1.2 exists to catch"* — fixed the badge and the renewal terms, and
left four. **Every one now interpolates `TRIAL_DAYS`.**

The two timeline beats were **the reference apps' 7-day shape transplanted literally**: Nibble's
TODAY/DAY 5/DAY 7 and Promova's Today/In 5 days/In 7 days, dropped into a three-day trial where day
5 does not exist. C13 decision 3 settled the middle beat as **DAY 2** during Unit 3 and it was never
implemented on this screen.

**"Day 2" / "Day 3", never "In 2 days".** The trial counts DAYS USED (§9.2), so a calendar phrasing
is a second lie — someone who opens the app twice a week reaches day 3 a fortnight from now. "Day N"
is also what `trialDayNumber` already puts on You and Settings ("Day 3 of 3"), so three surfaces now
count identically. **No date pill**, deliberately: C22's 3/3 date convergence is all calendar trials
and C32 says ours has no computable end date. Inventing one is §0.4 applied to a promise.

### C44. Plan-card convergence from four real pricing screens, and it settles §9.6 vs C13 #2.

`screen_detail` with images on `323576` (Astra AI), `128588` (Headway), `138758` (Promova),
`147531` (Quizlet):

| pattern | hit rate |
|---|---|
| price stated as one *"trial then $X"* sentence | **4/4** |
| one default plan pushed, other plans one tap away | **3/4** |
| a cancel-reassurance line near the CTA | **3/4** |
| the CTA names the **trial**, not the purchase | **3/4** |
| visible plan **cards** on the screen | **2/4 — not convergent** |
| **the timeline embedded on the pricing screen** | **1/4** (Quizlet only) |

**§9.6 says the timeline "becomes a block inside" the paywall; C13 decision 2 voided that; the
evidence backs standalone at 3/4.** Resolved by user decision: **it stays EMBEDDED**, following
Quizlet — the highest earner in the whole sample at $2.25M, which embeds it in the plan picker *and*
carries one in its paywall header. `src/app/trial-timeline.tsx` (166 lines) was **deleted**: it was
orphaned with zero inbound references, so C13 decision 2 had never actually been live, and a
duplicate nothing reached would only drift from the real one.

Worth noting for Unit 5: the paywall body already HAD plan cards and the timeline block. C31's
*"§9.6's plan-card redesign and the trial-timeline block are NOT done"* is **out of date** — both
exist and render well. What was wrong was the numbers, not the structure.

### C45. The day-2 reminder now fires, and it is verified against iOS rather than against our own code.

C13 decision 3's obligation — *"Do not ship the copy on the strength of an intention"* — was unmet
for the whole of Units 3 and 4. `notifications.ts` held a daily 19:00 nudge and nothing else.

**What it schedules against.** A days-used trial has no computable end date, so there is no deadline
to count back from. But the **day-2 transition is exactly computable** — `activeDays.length` reaching
`TRIAL_DAYS - 1` — so the reminder hangs off the transition and warns that the next day of use is the
last. Armed by a module-scope store subscription (the store must not do async side effects, and the
five actions that mark a day should not each have to remember this exists); `_layout.tsx` imports the
module for its side effect beside `global.css`.

**Verified from SpringBoard's `UserNotificationsServer` log, not from our own read-back:**

| state | armed | OS evidence |
|---|---|---|
| day 2, non-Pro | **YES** | `UNNotificationRequest identifier: euphoria-trial-reminder`, `UNTimeIntervalNotificationTrigger repeats: NO, timeInterval: 74892` → 19:00:00 next day, exact, correctly skipping a 19:00 already past |
| day 4, expired | no | 0 registrations |
| day 2 + `isPro` | no | 0 registrations |
| day 2, non-Pro again | **YES** | registers again |

**That last row is the method, not a formality.** A zero can mean "correctly declined" or "nothing is
running", and reporting the first without excluding the second is §0.1's failure mode exactly. The
positive control is what makes the two zeros mean anything.

**Two bugs in my own first version, both caught by re-reading it rather than by a test:** the guard
keyed on the day count alone, so buying Pro *while on day 2* left the reminder scheduled — the "I
already paid" class `tier()` exists to prevent; and it branched three ways over whether cancelling
was needed and left one path where it was not. Now keyed on `days:isPro`, with one unconditional
`applyTrialReminder(arm)` call that cancels first either way.

> **A verification trick worth reusing.** RN `console.log` under Hermes goes to Metro's socket, NOT
> the iOS syslog, so `log show | grep '[notif]'` finds nothing. But **iOS logs the notification
> request itself** — `xcrun simctl spawn "$UDID" log show --last 3m | grep "identifier: euphoria-"`
> returns the OS's own record including the trigger type, `repeats`, and `timeInterval`. That is
> stronger evidence than anything the app can report about itself.

### C46. Unit 5 built. The expired paywall was a DEAD END, and completing the wall exposed it.

Measured before the fix: an expired user (`activeDays:4`, `isPro:false`) arriving from the gate
sheet's *"See Euphoria Pro"* was shown **"Start your 3-day FREE trial to continue"** and **"No payment
due now"**, and tapping the CTA **dropped them on Home with `isPro` still false and nothing
purchased.** §0.5 named this in advance — *"the single largest dead control in the app"* — and closing
the hard wall (C39/C40) is what made it reachable. It was also simply false: offering a free trial to
someone who has spent it.

**The paywall now branches on `spent`, and all six things move together** — changing only the button
would leave the screen contradicting itself the way C43 describes:

| | trial user | spent user |
|---|---|---|
| heading | *Start your 3-day FREE trial to continue* | *Your free 3 days are up* |
| timeline | `TRIAL_STEPS` (Today / Day 2 / Day 3) | `PRO_STEPS` — what the wall actually closed |
| badge | `3 DAYS FREE · SAVE 33%` | `SAVE 33%` |
| reassurance | *No payment due now* | *Cancel anytime in the App Store* |
| CTA | *Start my 3-day free trial* → proceeds | *Get Euphoria Pro — $79.99* → **purchases** |
| fine print | *3 days free, then $79.99…* | *$79.99 per year, billed annually…* |

**`src/lib/purchases.ts` is the only writer of `isPro`-for-money.** `store.isPro` stays what the app
reads and `tier()` stays the only authority, so the entitlement engine did not change shape to accept
real money. That was the whole point of building it as one authority in Unit 3.

> **THE OFFLINE RULE — a correctness rule, not a nicety.** `isPro` is written ONLY from a *successful*
> `customerInfo` read. A network failure must never flip it false: that revokes a paying member the
> moment their train enters a tunnel, and it is indistinguishable in the logs from a real lapse.

Two subtleties worth keeping: the purchase picks its package by **product identifier**, never by array
position, because RevenueCat returns packages in dashboard order and `[0]/[1]` would silently swap the
plans the day someone reorders them; and `userCancelled` is handled **silently**, because backing out
of the Apple sheet is not an error and *"Something went wrong"* shown to someone who changed their
mind is its own defect.

**Subscription-management convergence** (§14.2's Unit 5 call, 60 screens across Loora `1134`, Elevate
`1395`, Gauth `39`, Duolingo `862`, Quizlet `874`; overflowed the tool limit per trap #21 and was
parsed from the file per trap #22):

| pattern | hit rate |
|---|---|
| plan name shown as account status | **5/5** (already shipped in Unit 6) |
| a **Manage subscription** entry | **3/5** → built, Pro members only |
| renewal date stated | 2/5 |
| *"Cancel on App Store"* named explicitly | 2/5 |
| a Restore control | 2/5 |
| an already-subscribed guard | 1/5 |

Restore ships **on App Store requirement grounds, labelled as such** per §0.2 rule 4 rather than
dressed up as convergence. Quizlet `147614` names its action *"Cancel on App Store"* and hands off
instead of pretending to cancel in-app; ours does the same, because an app cannot cancel an Apple
subscription itself.

**WHAT IS NOT VERIFIED, and must not be described as working.** Without
`EXPO_PUBLIC_REVENUECAT_IOS_KEY`, App Store Connect products and a sandbox tester, **none** of these
has been exercised: an offering loading, a purchase completing, the entitlement unlocking, or a
restore finding a real receipt. The purchase control renders disabled with its reason on screen.
`Configuration.storekit` is committed and validates the **UI flow only, never real billing** — and it
still needs selecting in the Xcode scheme, a manual step.

Confirmed en route: **RevenueCat really is linked into the dev client** — 1,119 RevenueCat strings in
`euphorianative.debug.dylib`, against expo-blur's 19. No rebuild needed. `strings <app>/<binary> |
grep -c RevenueCat` is a cheap way to answer "is this native module actually in the build".

### C47. UNIT 7 TARGET MET — but only by changing the layout MODEL. The serpentine is gone.

Three attempts now prove ≥10 nodes is unreachable in a serpentine: C33's two, plus one this session
made **with the header already fixed**, which was C34's hypothesis and still failed. The reason is
structural rather than a constant — a serpentine spends horizontal space on the curve and squeezes
titles into a 130pt side gutter, so the pitch must clear a 36pt two-line title AND a ≥44pt tap target
at once. Those fight, and the loser is the artifact.

**The measured band, replacing every earlier figure.** Taken at TRUE scroll top (three swipes down
first — C33's whole failure was a mid-scroll reading):

| | C33 said | C34 said | **MEASURED** |
|---|---|---|---|
| screen | 852 | 852 | **402 × 874** |
| first node | — | 575 | **342** |
| tab bar top | 819 | 819 | **799** |
| band | 367 | 244 | **457** |
| nodes visible | 6 | 3 | **5** |

**Step 1 — the header (C34's correct instinct).** The course rail was `y=160..310`, **150pt of an
874pt screen**. Replaced with 44pt chips: first node `342 → 212`, band `457 → 587`, nodes **5 → 6**.
Chip scroll-into-view uses each chip's REAL x captured on layout, because chips are as wide as their
title and a computed offset would be a magic number wrong for eleven of the twelve.

**Step 2 — the GAP 58 / NODE 48 attempt, built and thrown away.** The count hit 10 and the screen got
worse: "Complete" was buried under the active node's halo, Atlas overlapped the ring, 48pt nodes
rendered the authored marks as scribbles, and the serpentine read as a scatter.

> **My own collision check reported ZERO because it filtered to `h==36` two-line titles and never
> looked at the 15pt sub-lines.** A check that inspects part of the artifact passes for the wrong
> reason — trap #33, in the verification rather than the code. **The user caught it from a
> screenshot.** §0.1 exactly: I optimised the proxy and broke the artifact.

**Step 3 — Promova's model, and it did NOT abandon the path. It STRAIGHTENED it.** Measured off
`138799` in pixels: one thin vertical connector at the left edge through every node centre, ~24pt
status circles ON that line, a single-line title to the right, a small type glyph at the far right,
~43pt pitch, **fourteen rows visible**.

> **THE INSIGHT THAT DISSOLVES THE PROBLEM: the circle is not the tap target — THE ROW IS.** A 24pt
> circle costs nothing in reachability when the pressable is 370×56. C33's bind was that the node had
> to be both the visual mark and the 44pt target simultaneously. A row has to be neither.

Euphoria's numbers, measured after: `ROW 56` (12pt above HIG), first row y=212, **10 rows above the
tab bar**, 0 row-box collisions, and *"Building a Rational Investment Framework"* renders **in full** —
the 130pt gutter was the only reason it ever truncated.

**An unexpected win, and the best thing about the change:** the 300 authored per-lesson marks (C16)
are **legible for the first time**. They used to sit inside a 66pt circle whose face was the course
accent at 18% — accent art on an accent ground, which C16(b) already had to patch once by switching
to stroke marks. At 24pt on a neutral row edge each one reads distinctly. Also **46 a11y labels
against the serpentine's 74** for the same content.

**Reverting is one command:** the serpentine is intact at `1a971e0`, the list is `685cfce`.

### C48. UNIT 8 COMPLETE. Home's hero was the same defect as Learn's rail.

**Measured:** the next-lesson hero ran `y=480..1200` of an 874pt screen — about **36% of the viewport
for ONE lesson**, 96pt of it pure art. "YOUR PATH" was cut off and the Trade/Digest quick actions sat
entirely below the fold, present in the a11y tree at `y=828` and invisible without scrolling. The
file's own comment already recorded *"0/6 a single hero card dominating the screen"* from a six-app
pull, and it had drifted back to dominating anyway. Art moved beside the text, title `display →
heading`: hero ends at **y=357**, and YOUR PATH is above the fold.

**Quests — the 3/3 mechanic Home did not have.** ScreensDesign, Duolingo `862` + Bloom `2004` + banked
Promova `138812`:

| pattern | hit rate |
|---|---|
| a daily quest set where EVERY quest shows x/y progress | **3/3** |
| quests stated as a COUNT goal, never vague encouragement | **2/2** |
| a refresh countdown (Duolingo "12 HOURS", Bloom "17h 56m") | **2/2** |
| locked FUTURE quests shown rather than hidden | **2/2** |
| an escalating per-day reward (Bloom 10/20/30/40 Oinks) | 1/3 — **not** convergent, not copied |

`lib/quests.ts` is **pure derivation, zero new persisted state.** The pick is seeded by the day key so
it is stable all day and rolls at midnight with no scheduled work — `Math.random()` would reshuffle on
every render, both a purity violation (trap #11) and a UX bug where the user watches goals change
while looking at them.

> **There is deliberately NO "read a guide" quest**, which §17.3 proposed. `markPostRead` appends a
> slug and stamps `lastActiveDay` with no day-scoped counter, so there is no honest way to ask "did
> you read one TODAY". A quest that cannot tell whether you completed it is worse than one fewer.

**Streak commitment, 2/2, appears exactly once.** Headway `128564`'s NAMED tiers (C25) — 7 Promising /
14 Determined / 30 Impressive / 50 Unstoppable. **The names are the mechanism:** a number is a target,
a name is an identity, so the progress line reads *"Determined · 2 of 14 days"* and never "2/14".
Gated on `streak >= 1`, because asking for a fourteen-day promise before the first lesson is asking
for one the user cannot mean. `streakGoal === null` is what makes it one-time — null and 0 are
different values on purpose.

**Trial strip** — Bloom `156322`'s three-day tracker, the arc as a progress OBJECT. Uses
`trialDayNumber` not `trialDaysLeft` (C14), and is hidden for Pro.

**Verified `streakGoal` survives a terminate + relaunch.** `store.ts:10` says anything new must reach
`partialize` or it silently will not persist; that is the check that proves it rather than trusting
the diff.

**Still open on Home:** the course rail is clipped by the tab bar (unchanged, not fixed), and
`questsComplete()` exists with **no caller** — the quest-completion reward is not wired into
`pendingRewards` yet, which §8b asks for.

---

## From the RevenueCat / Unit 11 session (2026-08-08, round 2)

### C49. The App Store configuration is blocked by Apple AGAIN, and there is NO partial path.

The carryover said to check that App Store Connect's maintenance banner was gone, because "that is
what blocked this, not us". **It is not gone. A NEW window opened this morning.** Read off
`developer.apple.com/system-status` (unauthenticated, so no login needed to answer the question):

| service | state |
|---|---|
| **App Store Connect** | **Maintenance In Progress — Today, 7:30 AM, ongoing, ALL users affected** |
| App Store Connect API | Maintenance In Progress, same window |
| **App Store - Sandbox** | Maintenance In Progress, same window |
| App Store Connect — App Processing / App Upload / TestFlight / Analytics / Sales and Trends | all in the same window |
| App Store - In-App Purchases | Resolved Outage (yesterday 11:00–12:45) |

**The important new fact, and it kills the "do it partially" idea.** I opened
`app.revenuecat.com/projects/875fc097/new-app/app_store` and read the actual form rather than
assuming what it wants. It requires THREE things, not two:

1. App name — required
2. App Bundle ID — required
3. **In-app purchase key configuration — REQUIRED**, and its own help text says:
   *"When using Purchases v5.x+ (i.e., StoreKit 2), transactions will fail to be recorded without
   this key being set. This can result in users not accessing the purchases they are entitled to."*

That key is a `.p8` issued by **App Store Connect** (Users and Access → Integrations → In-App
Purchase). Euphoria uses `react-native-purchases`, i.e. StoreKit 2, so the warning applies to us
exactly. **There is therefore no half-configuration worth creating today** — a configuration without
the key is documented to lose transactions, which is worse than the Test Store we already have.

> **AND DO NOT SWAP THE KEY EARLY EVEN IF A CONFIG APPEARS.** Putting an `appl_` key into
> `.env.local` before `euphoria_pro_monthly` / `euphoria_pro_yearly` exist in ASC would make the
> offering resolve empty, and the paywall would render its purchase control DISABLED. That trades a
> **verified-working** Test Store money path for a broken one. Step 4 of the carryover is gated on
> step 3, not merely sequenced after it.

**What WAS done, because it needed no Apple involvement:** the stray `lifetime` package is deleted
from the `default` offering. It is now exactly `$rc_monthly` (`monthly`) + `$rc_annual` (`yearly`).
The delete control is not unlabelled after all — it carries `aria-label="delete package"` and lives
inside each package card in the offering's **Edit** view, which is why the previous session could not
find it by looking. Verified in the code first: `findPackage` only ever matches
`$rc_monthly|monthly|euphoria_pro_monthly` or `$rc_annual|annual|yearly|euphoria_pro_yearly`, so
nothing could ever have selected it.

**Verified on device, by LOOKING, not by a count:** seeded `activeDays:4 isPro:false`, opened
`onboarding?step=paywall`, and read the screenshot. The spent-user branch renders correctly with
**two** plans — `SAVE 33% / Annual / $79.99 / works out at $6.67 a month` and `Monthly / $9.99` —
CTA `Get Euphoria Pro — $79.99`. Removing the package broke nothing.

**Left deliberately:** the `lifetime` PRODUCT still exists in the catalog and is still attached to
the `pro` entitlement, so `pro` reads "3 products". It is inert — `findPackage` reads offering
packages, not the product catalog — and all three are Test Store products that real App Store
products will supersede. Flagged rather than deleted, because deleting a product is irreversible and
was not the ask.

> **A behaviour worth knowing before someone calls it a bug.** `isPro` cannot be seeded to `true` and
> made to stick. `purchases.ts:122-124` (`adoptCustomerInfo`) syncs `isPro` from every successful
> `customerInfo` read, and the Test Store customer holds no active `pro` entitlement, so each launch
> writes it back to `false`. **That is the offline rule working, not a defect** — but it means
> `seed-trial.sh <n> true` is only good until the next RevenueCat read.

### C50. C30 CLOSED. The tab count is finished at 8 of 8, and it still says five.

C30 stopped at 5 of 8 apps and asked for Elevate `1395`, Nibble `918`, Praktika `1816`. Done, and
**counted in the pixels** via `screen_detail` with `include_image: true` rather than from the
`exhaustive_description` — which is C5's lesson and the house rule in AGENTS.md.

| app | rev/mo | tabs | the tabs |
|---|---|---|---|
| Gauth `39` | $600k | **2** | Home, Profile |
| Quizlet `874` | $2.25M | **4** | Home, Create, Your library, Free Trial |
| Nibble `918` | $450k | **4** | For you, Explore, Library, Settings |
| Praktika `1816` | $750k | **4** | Lessons, Practice, Progress, Profile |
| Bloom `2004` | ~$291k | **5** | Home, Discover, Learn, Games, Profile |
| Duolingo `862` | $48M | **5** | — |
| Investing.com `1171` | $450k | **5** | Markets, News, Ideas, Watchlist, More |
| Elevate `1395` | $750k | **5** | Today, Performance, Games, Notifications, Profile |

**FIVE is modal at 4/8 (50%). Four is 3/8. Two is 1/8. ZERO of 8 ship six. The range is 2–5.**

The three new apps did not move the answer, they hardened it: C30 called five modal at 3/5 from a
partial sample, and the full sample agrees at 4/8 while adding two more fours. Note the two highest
earners in the set — Duolingo $48M at five and Quizlet $2.25M at four — straddle the mode, so there
is no "the biggest app does X" argument available in either direction.

**Euphoria already ships exactly five**, verified both ways: `(tabs)/_layout.tsx:8-12` declares
`home | learn | trade | digest | you`, and the tab bar screenshot shows those five and only those
five. **So Unit 11 closes with NO CODE CHANGE**, which is the honest outcome of a count that was run
to be followed. The reward loop and league ladder stay on Home (Unit 8 densified it for exactly this
reason) rather than earning a sixth tab.

---

## From the Unit 4 trade-gating session (2026-08-08, round 3)

### C51. TRAP #30 IS INVERTED, AND THE WRONG SIM IS THE ONE THAT COST C35/C36 TWO SESSIONS.

Trap #30 says *"'iPhone 17' is booted and does NOT have the app"*. **It does have the app.** What it
has is worse than nothing: a **stale dev client**, and it is the exact binary C37 blames for two
wasted sessions.

Measured with `stat` and `strings` on the installed bundles:

| sim | built | `RevenueCat` strings | `ExpoBlur` strings | verdict |
|---|---|---|---|---|
| **Euphoria QA** `61F7E882` | **Aug 7** | **1073** | **11** | ✅ the only correct device |
| iPhone 17 `F448825D` | Aug 3 | **0** | **0** | ❌ stale — no blur, no RevenueCat |

C37 established that the gate sheet rendered nothing because the old dev client had no `expo-blur`,
so `<BlurView>` was an unresolved native component. **`F448825D` is that client**, still installed,
still booted by default, and `CARRYOVER.md:119` names it as *the* dev client. Anyone following the
carryover instead of §1.1 reproduces C35/C36 exactly.

Also: at session start **`61F7E882` was Shutdown and `F448825D` was the only booted sim**, so
`sim.sh`'s "first booted simulator" fallback would have picked the stale one silently. §1.1's
`export EUPHORIA_UDID=...` is not paranoia, it is the only thing standing between you and this.

> **Cheap check worth keeping, from C46:** `strings <app>/euphorianative.debug.dylib | grep -c
> RevenueCat` answers "is this native module actually in this build" in one command. Run it on the
> dev client before believing anything about blur, purchases, or a native module generally.

### C52. C40's CONTROL HALF WAS INVERTED. A greyed CTA reads "broken", not "costs money".

C40 settled *"lock the control, keep the data"* from a count run on **education** apps. Re-run on
**finance** apps — the actual transfer target for the Trade surface — the data half holds and the
control half is backwards.

Four apps ≥$250k/mo, every one read in pixels via `screen_detail` `include_image:true`:

| app | the locked control | how it renders |
|---|---|---|
| Bloom `156236` | `Invest` on an auto-portfolio | **solid blue, full width, white padlock** |
| Investing.com `211206` | `Upgrade to Pro` | **full orange gradient**, padlock inline |
| Investing.com `211090` | `Unlock` on 2 of 8 signal cells | filled cell, blue padlock |
| Seeking Alpha `285915` | `Subscribe` under a faded section | **full orange fill**, padlock above |

| pattern | hit rate |
|---|---|
| the locked control keeps **full visual weight** | **4/4** |
| the asset's identity and price stay fully readable | **4/4** |
| a padlock sits **on the control itself** | 3/4 |
| gated *body* faded/blurred rather than removed | 3/4 |
| the gate names the **specific** thing (`ratings on INDU`) | 3/4 |
| **a price on the in-place gate** | **0/4 — never** |
| **the surface replaced by a paywall route** | **0/4 — never** |

Euphoria shipped `Buy` as a hairline outline pill with a grey padlock — **0/4**. Fixed in `540b65e`.
The reasoning matters more than the count: a greyed control is the same visual language as
"unavailable" and "error", so it tells a *false* story. Full fill plus a padlock says "this works,
it costs money", which is both true and the only version that converts.

**Two mechanisms worth stealing later, both new to this brief:**
1. **Partial gating inside one data grid** — Investing.com `211090` gates the 5-min and 15-min
   signals and leaves 30-min through Monthly live. Free users get the shape of the feature. Directly
   applicable to the options desk.
2. **Seeking Alpha marks what is still FREE** — `285874` puts an orange `Free` chip on the News tab
   while Ratings is gated. Euphoria's hint line says the same thing in prose
   (*"Prices and stats stay open"*); a chip is cheaper to read.

> **Method note.** `app_screens` across 5 apps overflowed the tool limit (trap #21) and
> `description` was an object (trap #22) — both traps hit on the first call, both already documented,
> and parsing the file cost one `python3` heredoc. The traps list paid for itself this session.

### C53. §4b's "zero direct pushes" is WRONG AS WRITTEN. 13 of the 16 are correct.

§4b says *"Every gated control routes through the sheet. Zero screens push to
`/onboarding?step=paywall` directly any more."* Taken literally that is a bad instruction, and a
session that follows it will break working design. There are **16** references; **13 should stay**:

| kind | n | verdict |
|---|---|---|
| the sheet's own `onSeePro` — `learn.tsx:338`, `digest/[slug].tsx:253`, `stock/[sym].tsx:326` | 3 | **correct.** The sheet *is* the gate; its CTA going to where the price lives is the intended second step, and matches Seeking Alpha `285875` (`Try It Now` → paywall) and Astra AI `323575` (`Buy` → plan picker). |
| voluntary upsells — `you.tsx:62`, `you.tsx:269`, `settings/[section].tsx:174`, `home.tsx:253` | 4 | **correct.** Nothing was refused; the user chose to go and look. C46's spent-user paywall is *reached* this way. |
| full-screen walls with an exit — `lesson.tsx:160`, `chat.tsx:178`, `options.tsx:258` | 3 | **correct**, decided in C39. The user is already on a dedicated refusal surface. |
| comments | 3 | — |
| **an inline refusal that discards context** — `chat.tsx:365` | **1** | ❌ **the only real violation.** |

**Restate the rule as:** *a control that REFUSES an action in place must open the sheet; a control
the user taps to go LOOK at Pro may route.* The test is whether the user was refused, not whether
the destination is the paywall.

**The violation, and why it survived review.** `chat.tsx`'s exhausted card carried the comment
*"The refusal lives IN the thread … rather than throwing the user out to a paywall screen
mid-question"*, and its only button pushed to `/onboarding?step=paywall`. **The sentence was true of
the card and false of the control.** This is C43's shape — a surface disagreeing with itself — and a
grep for the route finds the line while a reader of the comment concludes it is already handled.

**Nothing new had to be written to fix it.** `Feature` already listed `'atlas'`; `entitled()`
already had the `atlas` count-limit branch; `gate-sheet.tsx` already held *"Atlas needs a break"* /
*"You've used your 10 free questions. Pro makes them unlimited."* **All three were unreachable
because no call site ever passed `feature="atlas"`.** Worth a standing check: when a feature enum
gains a member, grep for a call site that passes it, or the engine and the copy both rot unused.

**A state worth keeping in the toolkit.** Verifying this needs *trial ACTIVE and allowance spent* —
`activeDays:1 isPro:false atlasAsked:10` — which is the only way to separate `count-limit` from
`trial-expired`. `seed-trial.sh` cannot express it (it takes days and isPro only); patch
`state.atlasAsked` in the same spilled-store file the script already targets, then terminate and
relaunch. Measured: 15 labels → tap → 9 (Modal) → dismiss → 15, thread intact. Fixed in `e253473`.

### C54. Two Unit 4 loose ends CLOSED AS "leave it", with the reasons, so they stay closed.

Both were examined and both are correct as they stand. Recorded because each looks like an
oversight, and a future session that "fixes" either will make the app worse.

**(a) `chat.tsx:219` / `chat.tsx:341` must NOT be converted to the gate sheet. It would render a
blank sheet.** These are the pre-refusal warning banners — they fire at `left <= WARN_AT` (3), i.e.
`atlasAsked` of 7–9. At that point `entitled(s,'atlas')` is `capped(7, 10)` which returns
**`{ ok: true }`**, and both `headlineFor()` and `bodyFor()` open with `if (refusal.ok) return ''`.
The sheet would present with no headline and no body.

> **The general rule this exposes: `GateSheet` is for a REFUSAL, not for a warning.** `Refusal`
> deliberately carries exactly one reason (`gate-sheet.tsx:49` — *"One reason at a time"*), and
> "you have 3 left" is not a reason to refuse anything. A warning is an advert the user may accept;
> C53's rule already permits it to route.

**(b) `Follow` / `toggleWatch` at `stock/[sym].tsx:157` stays OPEN for an expired user**, even
though Investing.com `211206` gates its own `Add to Watchlist` with a padlock.

C13 decision 1 would close it — it is a write, not market data, so C40's "keep the data readable"
does not cover it. It is left open on **C40's own stated reasoning**, which is the stronger argument:

> *"with everything locked, an expired user has no reason to reopen the app, and C13 leaves them
> only two re-entry paths. A readable market surface is a third."*

Following a stock **manufactures** a reason to come back — it is the one control on the surface that
does. Locking it would delete the re-entry path that justified keeping the surface readable in the
first place, which makes the refinement argue against itself. The divergence from Investing.com is
deliberate; it is a retention hook, not a premium feature.


### C55. THE DIGEST TAP "BUG" WAS THE TEST, NOT THE APP. Trap #34 is the general form.

Reported as open at the end of the redesign: tapping a Digest row did not navigate, twice, by
label and by coordinate. It was investigated first thing afterwards because it looked like the
highest-severity thing on the board, being the primary path into all 32 articles.

**There is no defect.** `describe-all` shows every row as `Button`, `enabled=True`,
`370 x 91` — 91pt against a 44pt HIG minimum. Tapping the first row at its real on-screen
centre (`201, 545`) navigated immediately: **50 labels to 6**, landing on the article cover.

The failing taps were at **`y=933` and `y=1432` on an 874pt screen.** Both rows were scrolled
below the fold, and the a11y tree lists off-screen `ScrollView` content at its content
coordinate. `idb ui tap` accepts an out-of-bounds point, does nothing, and exits 0.

> **This is C36 in a new costume, and I nearly repeated it exactly.** C36 reasoned from "no
> visible effect" to "the press is not arriving" and burned two sessions on a touch path that
> was never broken. The only thing that prevented a repeat here was running `describe-all`
> BEFORE forming a theory, which is precisely what C37 says to do.

**`sim.sh tapon` now refuses an off-screen target** and prints the swipe command instead of
silently tapping nothing. Verified both ways: an on-screen label taps normally, and
`tapon "Target-Date Funds"` at `y=1432` refuses with the reason.

### C56. DECISION 21: THE APP LEADS. Recorded because it has a standing cost.

Asked and answered: the app should carry more than the web site, broadly, not only in Digest.
The web site becomes the shopfront and the app is the product.

Already true as of today: **32 Digest guides in the app against 25 on the web**, via
`content/posts-app/` which `content/index.ts` does not glob.

**The cost, stated so nobody is surprised by it later.** Every future feature now needs an
explicit app-or-both decision, and there is no default. That is a real ongoing tax on planning,
and it is the reason this is a locked decision in §5 rather than an implementation detail. Two
things it does NOT license:

- **Forking code.** The Digest divergence works because content is authored once, in the web
  repo, with one hero composer, one linter and one sync. Divergence by adding a second
  implementation of the same thing is how the two repos rot apart.
- **Letting the web site break.** It stays a working shopfront. "The app leads" is about where
  new work lands, not about neglecting what exists.

### C57. UNIT 9 SCOPE CUT: **10 app-only guides, not 35.** §9d's manifest is superseded.

§9d and §11 specify ~35 new guides. **Ten shipped and the unit's content phase is closed at
ten, by decision.** A future session should not read §11 and conclude 25 are missing.

| | |
|---|---|
| library | **35 posts: 25 shared with the web, 10 app-only** |
| categories | Credit 6 · Strategy 7 · Investing 7 · Markets 7 · Money basics 8 |
| covers | 10 bespoke, **0 hero collisions across all 35** |
| lint | all 10 app-only guides clean |

**Formats, and one thing worth noticing.** The first seven were `myth`, `number`,
`head2head` and `case` — every format EXCEPT `explainer`, which is the default and the one
the ten good web guides use. That was an accident of writing the interesting shapes first,
not a decision, and it went unnoticed until the formats were counted at the end. The last
batch corrected it with two explainers. **When a format registry exists, count coverage
across it before declaring a content batch done**; the linter checks each post against its
own format and cannot see that a whole format is unused.

**Still genuinely open in Unit 9**, and unchanged by the cut:

- **The 15 cohort-B rewrites.** `refs/DIGEST_REVIEW.md` lists them. They end on a
  "Why this matters for you" house ad instead of a conclusion, and they are the reason
  `new-digest.mjs lint` still reports 20 errors. Prose is good; the fix is structural.
- **§9c's gap audit** was never run. The 35 were never mapped against the 12 curriculum
  courses to find concepts with a lesson and no guide, which is what §9d meant by choosing
  topics. The ten written were chosen by category thinness and by what an 18-25 reader
  actually meets, which is defensible but is not the audit the plan asked for.
- **§9f gating.** Free/trial users see all titles; bodies beyond the allowance should render
  the gate sheet over a blurred first screen. C39 records guide bodies as closed at card 2,
  so this is likely already done and merely unverified against 35 guides.

## From the Unit 15b / retention-planning session (2026-08-08, round 4)

### C58. UNIT 15b PASSED. The plugin route works, and `ios/` stays disposable.

**The go/no-go gate in 15.3b decision 1 is answered: `@bacons/apple-targets` v5.0.0 survives
`npx expo prebuild --clean`.** Decision 5 (commit `ios/`) is NOT invoked and should stay
un-invoked. Measured, in order:

| check | result |
|---|---|
| `productType` count in `project.pbxproj` | **2** — `.application` + **`.app-extension`** |
| `EuphoriaWidget` references in the pbxproj | **18** |
| App Group | `group.com.euphoria.native` on **both** sides — app entitlements + `ios/.targets/EuphoriaWidget/generated.entitlements` |
| `xcodebuild -scheme EuphoriaWidget` | `** BUILD SUCCEEDED **`, **0** diagnostics on `index.swift` |
| installed bundle | `PlugIns/EuphoriaWidget.appex/EuphoriaWidget`, 57.2K |
| appex `NSExtensionPointIdentifier` | `com.apple.widgetkit-extension` |
| `CADisableMinimumFrameDurationOnPhone` | survived the regeneration — and is now **pinned in `app.json`** rather than left to the prebuild template |

**Setup, so it is not re-derived:** `targets/widget/expo-target.config.js` (a `ConfigFunction`
that mirrors `config.ios.entitlements['com.apple.security.application-groups']`, so the group is
declared **once** in `app.json`) + `targets/widget/index.swift`. Colours are duplicated from
`theme.ts` into the target config because a Swift target cannot import TS.

**A SourceKit diagnostic said `'main' attribute cannot be used in a module that contains
top-level code`. It is a FALSE POSITIVE** — the editor analyses `targets/widget/index.swift`
with no target context and falls back to script mode. The compiler disagrees, and the compiler
is the authority. Do not "fix" it.

### C59. THE A11Y TREE OMITTED A WHOLE ROW. C55's lesson, one rung worse.

`describe-all` on the iOS widget gallery listed `Contacts @ 201,470` then `Files @ 201,614` —
a **144pt gap where the spacing is 72pt**. The screenshot shows the missing row plainly:
**`euphoria-native`, with the app icon**, at `y=542`. The tree returned **no label at all** for it.

C55 said the tree lists off-screen content at the wrong coordinate. This is worse: **the tree can
omit an on-screen, tappable row entirely.** The gap in the arithmetic was the only clue, and
`grep -i euphoria` over the tree returned nothing. **Read the screen.** A tap at the derived
`201,542` worked first time.

### C60. TWO WIDGET DEFECTS, MINE, OPEN FOR 15c.

1. **The gallery says `euphoria-native`, not "Euphoria".** iOS labels the gallery row and header
   with the **app's** display name, not the widget's `CFBundleDisplayName` — which is correctly
   "Euphoria" and shows only as the widget's own title. Fix is `expo.name` in `app.json`, which
   also changes the springboard icon label.
2. **The widget background is wrong.** `$widgetBackground: #09090D` was declared, but the view
   uses `.containerBackground(Color("brandPrimary").opacity(0.14))` — a **translucent** tint, so
   it picked up the light system tray and rendered pale lavender instead of the dark brand.
   `textSecondary #C3BAD0` on that is a contrast failure. Use the opaque widget background.

### C61. DECISIONS TAKEN WITH THE USER, and one reverses a shipped promise.

Prompted by *"think about churn, retention rate… this needs to change my life."*

1. **The hard wall STAYS** (C28 holds, third time). Churn is attacked everywhere else.
2. **FULL TRACKING.** Money-only measurement (RevenueCat + App Store Connect cohorts) was offered
   with the promise kept, and **declined**. The user wants the in-app drop-off funnel.
   **Consequence, stated before the fact: `src/app/why-not-free.tsx` becomes false.** It ships
   today saying *"There is no ad SDK and no analytics in this app."* That is a user-facing promise
   on a screen written to explain the pricing, and it must be rewritten. **The wording is copy, so
   §0.7 applies — ask, do not invent.** The no-ads / no-data-sale half stays true.
3. **App Store assets are their own unit (16), run immediately before retention (17)**, both after
   10/12/13 and before Unit 14.
4. **Research pulled immediately** rather than at unit time — banked in §17a, do not re-pull.

### C62. THE CANCEL-FLOW SAVE OFFER IS NOT BUILDABLE ON iOS. Scope corrected before it was built.

The user's scope selection included "cancel flow". Across **250 screens in 5 apps** there is no
"before you go" interception offer, and this is **not** trap #6 pagination — there is a structural
reason: **iOS cancellation happens in Settings / the App Store, outside the app**, so no app can
intercept it. The four highest-revenue apps in the set all instead make cancellation *easy and
findable inside the app* (**5/5**, §17a).

**What survives of that scope item:** the involuntary half (grace period, billing retry — real,
buildable, and 20–40% of churn), and the two offers that fire *before* any cancellation decision
(§17c the trial reward, §17d the dismissal paywall).

### C63. THE WIDGET RENDER IS BLOCKED BY THE SIMULATOR, NOT BY OUR CODE. Stop chasing it.

15c's data path is **fully verified**. Its *render* is not, and the blocker is environmental.
A future session must not read "render unverified" and start rewriting the widget.

**What IS proven, each by a number or a log line:**

| claim | evidence |
|---|---|
| App Group write works | `group.com.euphoria.native.plist` on disk = `streak 3, xp 160, dayKey "2026-08-08"`, matching the store exactly |
| values are INTEGERS, not stringified | `plutil -p` shows `=> 3`, not `=> "3"`; `ExtensionStorage.set` routes numbers to `setInt` |
| the reload call reaches iOS | `euphorianative[...] [com.apple.chrono:widget] reloadAllTimelines() - reloaded all timelines` |
| iOS knows the widget exists | `chronod: ... extensionBundleIdentifier=com.euphoria.native.widget, kind=all` |
| the SwiftUI view renders | **already screenshotted on the FIRST build** — flame + `5` + "day streak", 2 family dots |

**What is blocked:** the widget gallery returns an **empty list for EVERY app** — Calendar, Maps,
Batteries, all of them, not only ours. `chronod` logs `Loaded cached widget metadata: []`, and
separately `Ignoring restricted or unknown extension com.euphoria.native`.

**Four remedies tried, in order, all failed:** app reinstall · `launchctl stop com.apple.SpringBoard`
· full `simctl shutdown`/`boot` · `launchctl kickstart -k system/com.apple.chronod`.

**The decisive fact: the gallery worked on the first build and stopped working after the second.**
The code changed between them in ways that cannot affect Apple's own widgets. A device-wide index
that loses Calendar is a simulator fault.

**Do not** erase the simulator to fix this without first capturing state per §1.7 — the baseline
store, the trial day-count and the seeded progress all live there, and C51 already cost two
sessions to a wrong-simulator problem.

### C64. UNIT 12 CLOSED. Two of its three open items were already done; only the quest icons were real.

§12 listed three things still owed. Checked each against the repo rather than trusting the header:

| owed | actual state |
|---|---|
| **7 league crests refined** | **Already authored.** `league-crest.tsx` is 434 lines with all seven cases — Saver, Investor, Analyst, Strategist, **Portfolio Manager**, Partner, Magnate — each carrying its own design rationale. Nothing further was done to them, and the marker should not have implied otherwise. |
| **~35 guide hero covers** | **Superseded by C57.** The scope cut to 10 app-only guides shipped 10 bespoke covers with **0 hero collisions across all 35**. |
| **Quest icons** | **Genuinely missing. Built here.** |

**`src/components/art/quest-mark.tsx`** — three authored 48×48 stroke marks, one per `QuestKind`,
matching `stat-mark.tsx`'s system exactly. Wired into Home's quest ring: an undone quest shows its
mark, a done one still flips to the check on a filled ring, so the completion affordance that
already worked is untouched.

**The goal mark was WRONG on its first render, and the repo's own precedent caught it.** It began as
a broken ring with a tick — "a goal partly travelled" — and on a `sharp` contact sheet it read
unmistakably as **REFRESH/RELOAD**, because a circle with a tail is that universal glyph and nothing
else. That is precisely the failure `stat-mark.tsx` documents for its coin stack reading as a
database. It is now a **flag on a pole**, which cannot be misread and collides with nothing.

**Two verification notes worth keeping:**
- Home rotates **two of three** quests by day key (documented in `quests.ts`; `goal` is always
  shown). So the device can never display all three marks at once, and `trade` was unverifiable
  there. Added to `dev-gallery.tsx` — but that section lands at content **y=6743**, far off-screen,
  and trap #34 forbids tapping or trusting an off-screen coordinate.
- The thing that actually verified all three was **`sharp` rendering the SVG headlessly**, per the
  carryover's note. Milliseconds, no scrolling, and it is what exposed the refresh-glyph defect.

### C65. UNIT 13 PART ONE: the audits are DONE and produced numbers. Items 1-4 are the real work.

§13 has seven items. Three are now answered with measurements rather than impressions.

**Item 5 — dead-control audit. 177 `onPress` sites in `src/app` + `src/components`. ZERO dead.**
Classified: 61 navigate, 37 call a passed handler, 26 write state, 22 call a function, 31 needed
manual inspection (trap #5). Of those 31, most were type or prop declarations rather than controls.
**Four looked dead by grep and are not** — every one pairs its guard with real feedback:

| site | guard | why it is not dead |
|---|---|---|
| `options.tsx:113` | `data && onPick(side)` | `accessibilityState.disabled`, and the label becomes "No call at $X" |
| `options.tsx:387` | `pick && chosen && open(...)` | `disabled={!canTrade}`, label flips to "No previews left", and a line states the reason |
| `stock/[sym].tsx:290` | `canSell && sell(...)` | `disabled` state, `opacity 0.4`, label "Sell unavailable, you hold none" |
| `onboarding.tsx:688` | handler swaps on `spent` | carries its own comment citing §0.5 |

This is exactly why trap #5 says inspect every hit: a grep would have reported four false positives.

**Item 7 — bundle. `npx expo export -p web` → `dist` is 24M.** A true before/after was not captured,
because the measurement was taken after this session's changes. **24M is the baseline for future
units**, and it should be quoted as that rather than as a delta.

**Item 1 — consistency pass, MEASURED, partially fixed.** Excluding comments, dev-only routes and
authored art:

| deviation | count |
|---|---|
| un-tokenised hex colours | **23 unique, 50 occurrences** |
| raw `borderRadius` | **45**, across 19 distinct values including 1, 2, 3, 999 |
| raw `fontSize` | **126**, across 22 distinct values |

**Most of the 50 colours are inside art and animation components** (`atlas.tsx`, `streak-ignite.tsx`,
`lesson-art.tsx`, `league-crest.tsx`, `celebration-burst.tsx`), where a literal palette is as
legitimate as it is in `/art/`. **One was a genuine defect and is fixed:** `#F97316`, the streak
flame, was hardcoded in **fourteen** places across You, Home, Digest and Lesson. The streak is the
app's central habit signal and its colour could not be changed without a grep. It is now
`theme.streak`, in both palettes, and zero literals remain in those four files.

**Item 6 — `certify.py` stays green (ALL ROUTES PASS 3a).** The manual `ecc:a11y-architect` pass was
NOT run: it is a subagent, and this session is under a standing instruction not to launch agents
unless asked. It remains owed.

**STILL OPEN, and they are the bulk of the unit: items 2, 3 and 4** — every empty state, every
loading state, every error state. Item 2 in particular needs an EMPTY STORE to enumerate, and §1.7
forbids wiping the device without capturing baseline state first.

### C66. LINT BASELINE MOVED: 47 warnings → **45**. Quote the new number.

§7's gate says `expo lint` must read `50 problems (3 errors, 47 warnings)`. After UNIT 13's radius
tokenisation it reads **48 problems (3 errors, 45 warnings)**. Two warnings were REMOVED, not
suppressed — they went with the raw numeric literals the sweep replaced.

**The gate's rule is unchanged and still the important one: if the number RISES, you caused it.**
The floor is now 45.

### C67. THE RADIUS SWEEP, and the 23 sites deliberately left alone.

45 raw `borderRadius` values split cleanly in two, and only one half should ever be tokenised:

- **22 design radii → now `Radius.*`.** The ramp gained `hairline 2, track 3, chipSm 5, chip 6,
  chipLg 7, thumb 10` — the values ALREADY SHIPPING, not a tidier scale. Rounding 5 to 6 or 7 to 8
  would have restyled surfaces that were tuned by eye, and a consistency pass that silently changes
  pixels is a worse outcome than the inconsistency it replaced.
- **23 geometry radii → deliberately RAW.** A `borderRadius` that is exactly half a stated width is
  not design, it is a circle. Freezing it to a token breaks the moment the size changes. Detected by
  looking for a `width`/`height`/`size` of exactly `2 × radius` in the surrounding style block.

**This is the part of "tokenise everything" that had to be argued with rather than obeyed**, and it
is recorded so a later pass does not "finish the job" by tokenising the other 23.

### C68. THE TYPE SWEEP — and the ramp's width is itself the finding.

117 raw `fontSize` values across 46 files now draw from **`FontSize`** in `theme.ts`. Values are the
ones already shipping; nothing was rounded, for the same reason C67 gives.

**The scale needed 21 steps to cover 117 overrides against a 9-variant type system.** That ratio is
the real result: callers were routinely escaping `themed-text.tsx` rather than extending it. Naming
the sizes does not fix that — it makes it visible and changeable in one file. A future pass that
wants a genuinely tight scale now has the data to collapse steps deliberately, which is a decision
about pixels and therefore one to take with the user.

**Verified as a no-op:** the Home screenshot after the sweep is pixel-identical to the one before
it. For a pure tokenisation that is the only verification worth having — `tsc` passing proves the
names resolve, not that the type still sets the same way.

### C69. UNIT 13 ITEM 2 — every empty state checked against a REAL empty store. Zero blank screens.

Captured to `refs/BASELINE_STORE_20260808_pre_unit13.json` per §1.7, emptied, walked, restored.
`profile.completedAt` was deliberately KEPT so the app lands on the tabs rather than in onboarding —
the state that matters is "onboarded but has done nothing", not "never opened the app".

| route | labels | empty behaviour |
|---|---|---|
| home | 46 | real starting state — `0` streak, "10 min to keep your streak" |
| learn | 47 | "0% complete · 25 lessons" per course |
| digest | 54 | "0 of 35 read", today's pick still resolves |
| you | 43 | "Level 1", "0 XP total · 500 to level 2", "Day 1 of 3" |
| trade | 37 | `$10,000.00` starting cash; positions section correctly absent |
| courses | 9 | full course list |
| league | 48 | "Saver", "Top 3 advance · 1 day left" |
| friends | 43 | **the exemplar** — "No friends yet. Follow someone below, and it becomes a friendship when they follow you back." |
| games | 16 | full game list |

**No blank screen, no bare spinner, no section rendering an empty box.** `friends` is the pattern the
others should be measured against: it states the emptiness AND offers the action that resolves it.

### C70. TRAP: restoring a captured store needs the MANIFEST, not just the spill file.

Two restore attempts failed silently and the app kept showing the emptied state. The cause is the
mechanism `sim.sh state` already documents from the READ side, and it bites just as hard on write:

**AsyncStorage inlines small values in `manifest.json` and spills large ones to a file named
`md5(key)`.** The full store spills; the EMPTIED store was small enough to inline. So:

1. Copying the capture over the spill file did nothing — the stale **inline** value won.
2. Copying it *while the app was running* was also wrong: terminating flushed in-memory state back
   over the file.

**The order that works: terminate → write BOTH the manifest inline value and the spill file →
launch.** Verified: `streak 3, xp 210, 2 lessons, cash 5666.94` came back exactly.

### C71. UNIT 13 ITEMS 3 AND 4 — three bare spinners fixed, one raw SDK error caught.

**Item 3 — loading states.** Nine `ActivityIndicator` sites. Six already had a shape behind them:
two inside `GradientButton` (the button IS the shape), one inside a `Card` (`movers`), one inside a
fixed-height plot (`price-chart`), one in-place where table rows land (`options`), one inside an
explicit empty container (`learn`). **Three were bare spinners on otherwise blank screens** —
`news`, `search` and `lesson` — and now render `components/skeleton.tsx`, which reserves the real
geometry so the layout does not jump when data lands.

**The §0.4 line is written into that file**, because a loading skeleton and a fake-content
placeholder are visually identical and are not the same thing: a skeleton is legitimate only while a
fetch is genuinely in flight, never as a stand-in for data that is absent or unconfigured. That case
gets an empty state with words in it (C69's `friends`), which is why `news-gallery.tsx` renders
nothing at all when there is no API key.

Verified by forcing the loading branch and screenshotting: title bar, the 220pt card, two text lines
at 80% and 65%. The transient real load was too fast to catch, which is the point of forcing it.

**Item 4 — error states. ONE genuine defect, and `tsc` found three more sites than grep did.**
`onboarding.tsx` ran `Alert.alert('Purchase failed', r.message)` where `r.message` was **whatever
RevenueCat threw** — SDK text written for a developer reading a console, shown to someone who has
just tried to pay. `restore()` had the same leak, surfaced in two places.

`PurchaseResult` now carries a `code`, never a message; the SDK string is logged in `__DEV__` only;
and **`purchaseErrorMessage(code)`** maps the real RevenueCat codes to Euphoria's voice, deliberately
mirroring `chatErrorMessage` because §13 item 4 names that as the pattern and two ways of phrasing a
failure is how an app starts sounding like two apps. Every message says whether money moved.

**Changing the type was what found the rest.** Grep found one consumer; making `message` not exist
made the compiler point at four.

**Still owed in §13: item 6's manual `ecc:a11y-architect` pass.** `certify.py` stays green, but the
agent pass was not run — this session is under a standing instruction not to launch agents unless
asked.

### C72. UNIT 16b RESEARCH — DONE. Store creative, 24 screenshots across 15 apps.

Pulled via `search_store_screens` (Finance + Education, min revenue $100k/mo). These are **App Store
listing creatives, not recorded in-app screens** — label them that way, per §2.1.

| pattern | hit rate | evidence |
|---|---|---|
| **ONE phone mockup, headline ABOVE it** | **13/15** | YNAB `50628` · EveryDollar `78785` · Nibble `71404` · Headway `68455` · SmartyMe `74727` · Seeking Alpha `39545` · GrowMe `74694` · Deepstash `72010` · Imprint `77299` · Bloomberg `56431` · Justin Guitar `77846` · Settlemate `75171` |
| **Solid saturated brand background, never a photo** | **13/15** | deep blue, purple, olive, forest green, cream, charcoal |
| **A TIME PROMISE in the hero headline** | **6/15** | Headway "15-min book summaries" · SmartyMe "Learn in 10 Minutes a Day" · GrowMe "15-Min Book Summaries" · Wiser "Learn more, faster" · Justin Guitar "10 minutes a day. Real progress." · Kalam "See Immediate Results / in the first 7 days" |
| social-proof badge in the hero | **2/15 — NOT convergent** | Settlemate `75171` "4.9 Stars From 62k+ users" · Mindvalley `34887` |
| headline is a BENEFIT, not a feature | ~10/15 | YNAB "Never worry about money again" · Imprint "Replace Scrolling With Microlearning" · Settlemate "Companies Owe You Money" |

**Two things worth acting on.**

**The time promise transfers directly and Euphoria already owns one.** Home ships the line
*"10 min to keep your streak"*. Six of fifteen competitors lead with exactly that shape, and it is
the single most copyable pattern in the set for an app whose whole model is a daily habit.

**Mindvalley `34887` ships an "APP OF THE DAY" laurel — which Apple's own asset rules FORBID.**
§16a records the prohibition on Apple-designated recognitions verbatim from
`developer.apple.com/app-store/asset-best-practices/`. A competitor doing it is not permission; it
is a competitor with a rejection waiting. **Do not copy it**, and do not copy Settlemate's star
badge either until Euphoria has ratings of its own — an unverified claim is the same rule.

**Layout decided by the data:** one phone, headline above, solid `#09090D`-family background, no
photography, no badges. That is 13/15 and it needs no further research.

### C73. UNIT 16c — first three store shots BUILT, and two defects in them are stated not hidden.

`refs/store/store-1..3.png`, **1290 × 2796** (Apple's 6.9-inch requirement), built from real device
captures with `sharp`. Layout follows C72's 13/15 pattern exactly: one phone, headline above, solid
saturated brand background, no photography, no badges. Copy is the time-promise direction, decided
with the user:

| # | role | headline | screen |
|---|---|---|---|
| 1 | hook | **"Ten minutes a day. / Real money sense."** | Home |
| 2 | daily loop | **"A lesson a day, / and a streak to keep it."** | Learn |
| 3 | differentiator | **"Practice investing. / Risk nothing."** | Trade |

**DEFECT 1 — shot 3 shows a LOSING portfolio.** The seeded device state renders
`−$777.78 (7.78%) all time` in red, directly under the words "Practice investing. Risk nothing."
A paper-trading app whose store listing leads with a loss is arguing against itself. **This is not
fixable by inventing a gain** (§0.4) — the honest options are to seed a different but REAL device
state, or to choose a Trade screen that does not foreground the all-time figure. **It is a decision
about how a finance app markets returns, so it belongs with the user, not with a script.**

**DEFECT 2 — the headline is NOT in the brand font.** `fc-list` reports zero Nunito faces, so
librsvg fell back to a system sans. It reads acceptably but it is not Euphoria's type. Fixing it
means installing the Nunito face the app bundles before rendering, and it must be fixed before these
ship — a listing set in the wrong typeface is the first thing a designer will notice.

**Also worth noting for later:** shot 2 shows a mostly-locked course list, which is truthful for a
trial user but reads as "everything is paywalled" in a 380px search thumbnail. Worth reconsidering
against the same screen with more lessons unlocked.

### C74. UNIT 16c — SEVEN store shots, reproducible, brand font fixed. One decision still open.

`scripts/store-shots.mjs` regenerates the whole set from device captures in one command. The first
three were rendered from a throwaway `node -e`, which is fine once and useless the moment copy or a
screen changes.

**C73 defect 2 is FIXED and the script proves it itself.** librsvg resolves fonts through
fontconfig, and `fc-list` had no Nunito, so headlines silently fell back to a system sans — the
dangerous kind of defect, because it looked close enough to ship. The script now writes a **scoped**
fontconfig pointing at the Nunito the app already bundles in `node_modules`, and prints
`font: Nunito visible to fontconfig (16 faces)` on every run. **Nothing is installed into
`~/Library/Fonts`** — a screenshot script has no business changing the machine it runs on.

**A third defect was caught by looking at the contact sheet.** `dev-league.png` had captured the
LESSON screen, so shot 7 put "Climb the league" over a duplicate of shot 4. The deep link had failed
and the capture was taken anyway. **The fix in method: verify the screen with `sim.sh screen` BEFORE
capturing, not after** — the second attempt confirmed "Saver · Top 3 advance · 1 day left" first.

**Seven, not ten, deliberately.** Apple permits up to ten and does not reward padding.

| # | headline | screen |
|---|---|---|
| 1 | Ten minutes a day. / Real money sense. | Home |
| 2 | A lesson a day, / and a streak to keep it. | Learn |
| 3 | Practice investing. / Risk nothing. | Trade |
| 4 | Short lessons that / actually explain why. | Lesson |
| 5 | One idea a day. / Read it in two minutes. | Digest |
| 6 | Watch it add up. / XP, streaks, levels. | You |
| 7 | Climb the league. / Nobody learns alone. | League |

**STILL OPEN — C73 defect 1.** Shot 3 renders `−$777.78 (7.78%) all time` in red beneath "Risk
nothing." Unresolved by design: it is a decision about how a finance app depicts returns, and §0.4
forbids the obvious shortcut of inventing a gain.

### C75. THE LEAGUE SCREEN WAS NEVER REDESIGNED — and I put it in a store screenshot anyway.

The user pointed at League and said so. They were right, and the worse half is mine: I featured the
**least-designed surface in the app** as App Store shot 7 without noticing it had never been through
a unit. Units 6–12 redesigned Home, Learn, You, Digest, Trade and the art system. **League was never
in scope and nothing caught that** — §13's consistency pass measured tokens, not whether a screen
had been designed at all.

**ScreensDesign was out of data budget for this**, so per §0.2 rule 7 the redesign is specced from
the app's own language and Apple HIG, and labelled as such rather than bending §6.1's banked
material — which covers Duolingo's leaderboard GATE (`112782`), not its row design.

| defect | fix |
|---|---|
| the one piece of authored art on the screen rendered at **30pt**, smaller than the avatars below it | `LeagueCrest` at **84pt** as the subject, with the tier name in title type and a time pill under it |
| rows were rank + initial-disc + name + number — a **table** | each row carries an XP bar **relative to the leader**, so the gap is visible. A league's information IS the gap; right-aligned figures hide it |
| nine saturated discs (orange, cyan, pink, yellow…) read as a borrowed default avatar palette | the person's colour becomes a **ring** on a brand-tinted chip. Identity kept, `lib/people` untouched because Friends shares it |
| all of the top three shared one amber | 1 gold · 2 silver · 3 amber |

**Guard worth keeping:** `leader` is `Math.max(1, ...)`. A zero would make every bar `NaN%`, which
React Native renders as **full width** — every player would appear tied with the leader, and it
would look like a design choice rather than a bug.

**The general lesson, which is bigger than this screen:** a revamp scoped by UNIT misses any surface
no unit named. Before Unit 14, every route in `certify.py`'s list of 18 should be checked for
*whether it was ever designed*, not just whether it uses the tokens.

### C76. THE IAP FLAG WAS TRUE FOR A PLACEHOLDER KEY. C49's block is cleared; this was under it.

The user obtained App Store Connect access, clearing C49. Checking the wiring before using it found
a defect that C49's block had been hiding.

`.env.local` holds `EXPO_PUBLIC_REVENUECAT_IOS_KEY` set to a **32-character `test_…` placeholder**.
The flag was:

```ts
export const IAP_ENABLED = KEY.length > 0;   // TRUE for a placeholder
```

So the app believed purchases were live, ran `Purchases.configure()` with a bogus key, and rendered
a **live-looking Buy button whose only possible outcome was failure**. Unit 4's whole gate sits
behind that button.

**A placeholder that satisfies a presence check is worse than an empty string**, because an empty
string degrades honestly — §0.5's disabled-with-a-reason path, which this codebase already builds.
The flag now validates SHAPE: RevenueCat iOS SDK keys are public and always begin `appl_`.

**What is still needed, and only the user can supply it:**

| # | in App Store Connect | why |
|---|---|---|
| 1 | Users and Access → Integrations → **In-App Purchase** → generate key, download the **`.p8`** | RevenueCat cannot validate receipts without it. **Downloadable ONCE** |
| 2 | **Issuer ID** and **Key ID** from that same page | RevenueCat's form requires both alongside the `.p8` |
| 3 | Two products: **Monthly $9.99**, **Annual $79.99** | C31's locked prices |
| 4 | A **Sandbox tester** account | A purchase cannot be verified without one, and §9.8 says so |
| 5 | The `appl_…` **public SDK key** from RevenueCat → `.env.local` | This is what flips `IAP_ENABLED` |

**Never paste the `.p8` contents into a chat.** It belongs in `.env.local` / RevenueCat's uploader;
`.env.local` is already gitignored.

