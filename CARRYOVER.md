# CARRYOVER — paste this whole file into a fresh session

Written **2026-08-13**, replacing the 2026-08-11 file. Everything here was VERIFIED in this repo, on
the simulator, or against a live endpoint on the date given. **Where this contradicts anything older,
including §22 entries written before today, this wins.**

Continue work on **`~/euphoria-native`** — Euphoria, Expo SDK 57 / expo-router / React Native finance
education for 18-25s, mascot **Atlas**. Content source of truth is `~/euphoriaweb-current`.

> **`README.md` is now a real 531-line reference and is accurate as of this commit.** Read it before
> §22. It carries the architecture, the deploy sequence, the gate, the house rules and the traps.
> This file is the *session* handoff; the README is the *project* reference. Do not duplicate.

**HEAD `f155515`. 389 commits, 28 of them today. Tree clean, everything pushed to
`teameuphoriainv-dot/euphoria-native`. §22 runs C1→C123.**

---

# 0. START HERE — the first hour, in order

Everything below is either **blocked on the owner** or **ready to run**. Do the ready ones first;
they need nobody.

## 0.1 READY NOW — no credentials needed

| # | task | why it is first | done when |
|---|---|---|---|
| 1 | ~~Prove PostHog sends from the app~~ ✅ **DONE 2026-08-13** (§2.2) | App-originated events reach project 557266, confirmed at the network layer AND in the dashboard. Unit 17's premise is now MET. It also surfaced two real bugs — a `day_return` double-count and a `flushAnalytics` that was never wired — both fixed. | — |
| 2 | **See live market data IN THE APP** (§9.3) | Endpoints were verified by curl only. C109: a working endpoint and a working screen are different claims, and today proved that twice. | Trade tab and a stock screen render real prices on device |
| 3 | **Audit the 17 captured screens** — `digest`, `chat`, `options`, `stock` | ⚠️ **BLOCKED** on ScreensDesign Pro. If still lapsed, either restore it or do HIG-only work and **label it as such** (AGENTS.md rule 7). | findings written to `refs/audit/` |
| 4 | **Unit 14** — the final consolidated review | Deliberately last, and there is materially more surface now: 6 API modules, 6 new regressions, a provider swap, an auth path. | security review + full-diff review + CodeRabbit, all clean |

## 0.2 BLOCKED ON THE OWNER — one action each, then I can finish it

| # | needs | exact action | then |
|---|---|---|---|
| 5 | **Supabase** | Sign in at `supabase.com/dashboard` **with GitHub** (the page says *LAST USED: Continue with GitHub*). Copy project URL, `anon` key, and JWT secret from Settings → API. | activates `_identity.ts`; closes F4, and F6 with a Durable Object |
| 6 | **RevenueCat secret** | `app.revenuecat.com/projects/320845df/api-keys` → **"New secret API key"**. **None exists — it must be created**, which is a persistent credential on live billing, so it is the owner's call, not mine. | activates `_entitlement.ts`; F7 step 2 |
| 7 | **Polygon paid plan** *(optional)* | Only `movers` needs it. Everything else works on free. | `movers` stops answering `501 plan_required` |
| 8 | **Apple** (§9.4) | Paid Applications Agreement, EU trader status, App Privacy, 2.1b reply. **Account Holder only.** | IAP can transact at all |

## 0.3 DECISIONS WAITING, not work

- **F8** — wire Apple's `identityToken` + `nonce` before any server session (§9.2). Harmless today,
  a full auth bypass the day someone skips it.
- **`ATLAS_REQUIRE_AUTH=1`** — the only step that actually closes F7. **Do not flip it before a
  sign-in UI exists** or it refuses the entire userbase.
- **Cached error responses** — `Cache-Control: no-store` on error paths (§9.2).
- **Three `COPY IS UNAPPROVED` markers** — `settings/[section].tsx`, `gate-sheet.tsx`,
  `notifications.ts`. §0.7: draft options, let the owner choose.

# 1. THE HEADLINE

## The app is live end to end for the first time in its history.

Before today, every server-dependent feature returned `503 not_configured`. Atlas had never answered
a single question. As of this commit:

| feature | state | how it was verified |
|---|---|---|
| **Atlas chat** | ✅ LIVE | production `POST /api/chat` → 200; **and** driven on the simulator, real question, real reply rendered in the speech bubble |
| **quote** | ✅ LIVE | NVDA `225.30`, change `+0.245`, `+0.109%` |
| **chart** | ✅ LIVE | 1M series, real points |
| **stats** | ✅ LIVE | prev close, open, day low/high, volume, 52-week |
| **search** | ✅ LIVE | `nvid` → NVDA, NVDQ … |
| **news** | ✅ LIVE | **via the Polygon FALLBACK, not Alpha Vantage** — see §5.2 |
| **options expirations** | ✅ LIVE | TSLA — the symbol that `401`'d before the token |
| **options chain** | ✅ LIVE | TSLA contracts with bid/ask/mid/IV/delta/OI |
| **movers** | ⛔ `501 plan_required` | Polygon free tier excludes it — honest refusal, not a bug |

**Atlas's actual first answer on device**, which is worth reading because it shows the system prompt
working line by line:

> *"Think of it as interest earning its own interest. When you save money, you earn interest on your
> original deposit. Over time, you also earn interest on the interest you already made. Your money
> starts growing faster and faster, like a snowball rolling down a hill. **Does that make sense so
> far?**"*

Short sentences. Second person. No markdown, no emoji. One idea at a time, then it checks whether it
landed — which is literally what `SYSTEM` instructs.

---

# 2. CREDENTIALS: WHAT IS SET, WHAT IS NOT, AND EXACTLY WHAT EACH UNBLOCKS

## 2.1 Set and working

Four on EAS production (`--visibility sensitive --scope project`) **and** in gitignored `.env.local`,
because dev builds talk to the LOCAL Metro server (see §6.4):

| variable | unblocks | notes |
|---|---|---|
| `GEMINI_API_KEY` | Atlas | **Shape is `AQ.…` 53 chars, NOT `AIza…` 39.** See §4.1 |
| `POLYGON_API_KEY` | quote, chart, stats, search, logo, news-fallback | free tier; excludes `movers` |
| `ALPHAVANTAGE_API_KEY` | news *with sentiment scores* | works locally, **throttled on the Worker** — §5.2 |
| `MARKETDATA_TOKEN` | options chains for every symbol | without it, **AAPL only** — §5.3 |
| `EXPO_PUBLIC_POSTHOG_KEY` | analytics | **key proven, app delivery UNVERIFIED — §2.2** |

Two public client identifiers in `.env.local` only (they ship in the binary by design):
`EXPO_PUBLIC_REVENUECAT_IOS_KEY` (`appl_…`), `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.

## 2.2 PostHog — PROVEN END TO END, 2026-08-13

**Project 557266, US Cloud.** `EXPO_PUBLIC_POSTHOG_KEY=phc_pgnjFMRUXJfgurWUo98gHd95gX2MLWZy3eCQcp2Qyg58`
— a **public write-only client key**; PostHog labels it *"Safe to use in public apps"*. Set in
`.env.local` and on EAS production (`plaintext` visibility).

**App-originated events reach the dashboard.** Verified twice over, in this order:

1. **Network layer, on device.** `us-assets.i.posthog.com` (client constructing), then
   `https://us.i.posthog.com/batch/`, and the CFNetwork summary for that same connection id reads
   `response_status=200 … finished successfully`. Native, so it does not depend on JS console
   plumbing at all.
2. **Dashboard.** `day_return` rows with `library: posthog-react-native`. That column is the proof of
   origin — the earlier `carryover_verification` row has an EMPTY library because it was the raw
   curl. **Read the library column before believing an event came from the app.**

Person id is PostHog's own (`019ffe72-…`); our `install_id` rides as a property, not the distinct id.

### The `[analytics]` log-grep recipe was BLIND. Do not use it.

The previous carryover said to settle this by grepping the device log for `[analytics]`. **That test
cannot fail informatively.** RN forwards `console.log` to Metro over the websocket, NOT to os_log —
measured: 1146 native log lines from the app process, zero `[analytics]` lines, **while the event was
sending successfully**. Absent lines prove nothing. Use the network layer instead:

```bash
xcrun simctl spawn $EUPHORIA_UDID log show --last 3m \
  --predicate 'processImagePath CONTAINS "euphoria"' | grep -i posthog
```

A `us.i.posthog.com/batch` line is a real send. Cross-reference its `[Cnn]` connection id against the
`CFNetwork:Summary` line to get the status code. This is the same lesson as §5.1 in a new costume: a
checker that reports nothing is not the same as a system doing nothing.

### The `day_return` "false lead" note was stale, and was hiding a real bug

The old note recorded `activeDays` as `['seed-0','2026-08-13']` and concluded the event *correctly*
did not fire. The store actually read `['seed-0','seed-1','seed-2','seed-3']` — **today absent** — so
it did fire, and firing is what proved the pipeline.

Worse, it fired on **every launch**. `activeDays` is written by real USE (`withToday`'s call sites),
never by launching, so between opening the app and doing anything in it the old predicate stayed
true indefinitely. The dashboard showed one `day_return` for every single `Application Opened`.
Retention would have read as engagement — the same shape as the `paywall_dismissed` double-count in
§7.2. **Fixed:** `shouldCountReturn()` in `lib/day-keys.ts` plus a persisted `lastReturnDay` stamp,
pinned by six cases in `scripts/day-keys-regression.mjs`, one of which fails on the old predicate.

### `flushAnalytics` had ZERO call sites

The old §2.2 said "`flushAnalytics()` runs on backgrounding". **Nothing called it.** It was written,
exported, and never wired, and RN's `AppState` was not imported anywhere in `src` (every `AppState`
match is the Zustand store's own type — a name collision that hides the absence from a grep). So
every event of a short session was lost: two launches fired `day_return` and neither reached PostHog,
because PostHog's batch timer had not elapsed before the process died. Now wired in `_layout.tsx`,
and `Application Backgrounded` appears in the dashboard for the first time as a result.

**Verifying a change to any of this needs an app REBUILD, not a deploy** — see §11. And note that
PostHog only initialises on the first `track()`, so on a launch where nothing fires, a queued event
stays queued. Background the app (`xcrun simctl launch $EUPHORIA_UDID com.apple.Preferences`) to
force a flush.

**Easiest event to force:** seed an expired trial (`./scripts/seed-trial.sh 4 false`) and open a
locked lesson from the **Learn tab** — the gate sheet fires `paywall_seen` on becoming visible.

## 2.3 NOT set — everything below is BUILT, PINNED BY REGRESSION, AND INERT

Each of these is finished code waiting on one credential. None needs engineering.

### `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_JWT_SECRET`
The first two are public (anon key is protected by row-level security); **the JWT secret is
server-side only.** Together they activate `src/app/api/_identity.ts`, which verifies a caller's
token server-side. Until then `currentUserId()` returns null, every caller is anonymous, and the
rate-limit identity is a header the caller chooses. **The web app already runs on the same Supabase
project, so the user ids will match its 35 edge functions.** Closes F4; combined with a Durable
Object, F6.

### `REVENUECAT_SECRET_KEY` — server-side entitlement
**This is a different credential from the `appl_` public SDK key already in `.env.local`.** It
activates `src/app/api/_entitlement.ts`, which asks RevenueCat whether a verified subject actually
pays. Until it is set, `decide()` returns `{allow: true, reason: 'not-enforced'}` and the check is a
byte-identical no-op. Closes half of F7 — see §7.3 for why only step 3 closes it fully.

---

# 3. THE FIVE FACTS THAT KEEP GETTING RE-DERIVED WRONG. Do not re-litigate.

1. **`~/euphoria-native` IS THE PRODUCT.** `~/euphoriamobile` is a Capacitor app, submitted
   2026-04-08, rejected 04-09, abandoned.
2. **Bundle id `com.euphoriainv.euphoria`.** `android.package` deliberately stays
   `com.euphoria.native` — Google Play is a separate listing nobody has audited.
3. **App Group `group.com.euphoriainv.euphoria`** must match in `app.json`, `src/lib/widget.ts` and
   `targets/widget/index.swift`. Disagree and the widget reads nothing, silently.
4. **`eas env:set` DOES NOT EXIST** on eas-cli 21.7.1 — it is **`env:create`**. The previous
   carryover asserted the exact opposite and it cost a deploy cycle today. `eas env --help` lists:
   `env:create`, `env:delete`, `env:exec`, `env:get`, `env:list`, `env:pull`, `env:push`,
   `env:update`. **`env:exec` takes the environment POSITIONALLY** — `--environment production` is
   rejected with `Nonexistent flag`.
5. **The Gemini key is `AQ.…` 53 chars, NOT `AIza…` 39.** Every shape check in this repo — including
   one written earlier the same day — would have rejected a working credential. Verified live:
   `GET /v1beta/models` → 200, 37 models. **Do not add an `AIza` gate.**

---

# 4. DEPLOYING — four steps, three of them load-bearing

```bash
# 1. create (env:create, NOT env:set)
npx eas env:create --name X --value "<v>" --environment production \
    --visibility sensitive --scope project --non-interactive

# 2. export UNDER the environment. POSITIONAL. NOT OPTIONAL.
npx eas env:exec production "npx expo export --platform web"

# 3. deploy and promote
npx eas deploy --prod --environment production --non-interactive

# 4. verify by reading the BODY, with a cache-buster
curl -s "https://euphoria-native.expo.app/api/...&_cb=$(date +%s)"
```

**Step 2 is the one everybody skips.** The built server bundle contains `process.env.GEMINI_API_KEY`
as a *runtime* lookup, which makes it look as though the export cannot possibly matter. §22 C119
reasoned exactly that and **was wrong** — the export is what tells EAS Hosting which variables the
deployment needs, so a value absent at export time is absent from the Worker regardless of what the
code does at runtime. C120 records the correction. Three deploys were lost to that inference.

**Step 4 needs the cache-buster.** EAS Hosting **edge-caches GET API routes** (`cache-status: EAS`).
Without `_cb` you read the *previous deployment's* answer. This faked two failures today, including
an options route that was live and correct for an hour while serving a cached `503`. `/api/chat`
never showed the problem **because POST is not cached** — which is the whole reason the Gemini work
looked clean while the market work looked broken.

**A deploy that succeeds proves nothing about env. A curl without `_cb` proves less.**

---

# 5. THE LESSON THE DAY KEPT TEACHING

## 5.1 A refusal WE caused must never be reported as a failure THEY caused

Three separate times, in one session:

| what actually happened | what it was reported as | fixed to |
|---|---|---|
| `gemini-2.5-flash` **retired** — 404, *"no longer available to new users"*, while still LISTED in `/v1beta/models` | `502 upstream` → reads as "Atlas is broken" | `model_unavailable`, logged as a **CONFIG** error naming the model |
| Alpha Vantage **throttle** — `200 {"Information": "…"}`, never an error status | `{"articles":[]}` → reads as "no news today" | logged: `[market] alphavantage refused: …` |
| Polygon **plan limit** — `403 NOT_AUTHORIZED, "You are not entitled to this data"` | `502 upstream` → reads as "Polygon is down" | `501 plan_required`, logged **PLAN LIMIT, not an outage** |

Every one of these sends the next person to check the key, the network and the provider's status
page. All three are fine. **Listed is not usable; 200 is not success; a valid key is not an
entitlement.**

## 5.2 The Polygon fallback saved news, silently

Alpha Vantage is still throttled on the Worker's shared egress IP — same key returns 50 articles from
a laptop and nothing from the deployment, minutes apart, **with a cache-buster**, so it is not
staleness. AV rate-limits by IP as well as by key.

News works anyway, because Polygon backs it up. **How we know:** the article `id` is a Polygon hash,
not an Alpha Vantage url. The two-provider design written into that route long before today did
exactly its job and nobody would have noticed without reading the ids.

## 5.3 Two failures that faked the opposite direction

**Thinking tokens ate Atlas's answer.** Gemini 3.x counts thinking against `maxOutputTokens`.
Measured on one request: `promptTokenCount 10 · thoughtsTokenCount 346 · candidatesTokenCount 30 ·
total 386`. **346 of the 400-token budget was thought**, so replies were cut mid-sentence — while
`finishReason` said `"STOP"` and the body looked perfectly fine. Nothing announces it; you must read
`usageMetadata`. It was also ~17× the tokens on the one feature with a real per-message cost, quietly
undoing the daily cap added hours earlier. **`thinkingLevel: "low"` is NOT enough — measured, still
318.** Only `thinkingConfig: { thinkingBudget: 0 }` stops it.

**marketdata.app serves AAPL without a token and nothing else.** I called it unauthenticated, got a
full chain, and wrote "needs no account at all". AAPL is their demo symbol; TSLA answers
`401 {"s":"error","errmsg":"Invalid token header. No credentials provided."}`. **Testing one ticker
and generalising is how that got written down; testing a second is how it got caught.**

---

# 6. OPERATIONAL TRAPS

## 6.1 `gh auth` reverts between pushes
The active account returns to `s-k-28`, which cannot see the repo, and fails with a bare
`Repository not found`. Run **`gh auth switch --user teameuphoriainv-dot` before every push.**

## 6.2 LogBox eats taps — the accessibility tree does not model overlays
The dev build's error bar sits at **y≈795–811pt**, directly over some dismiss controls and the
lesson-intro `Continue`. `idb ui describe-all` lists the button, `sim.sh tapon` reports tapping it,
and **nothing happens** — it absorbed **52 consecutive taps** today, in the session immediately after
the trap was first written down. Dismiss LogBox first (`./scripts/sim.sh tap 387 810`).

**The tree tells you what EXISTS, never what a tap will DO.**

## 6.3 Driving a lesson to completion
- **A MultiSelect row's centre is not its checkbox** — the toggle is on the left; the centre of a
  three-line row is dead space or the "answer" marker.
- **MultiSelect will not advance on a wrong answer**, so brute force cycles forever. An automated
  driver needs the answer key out of `src/lib/curriculum/courses/*.ts` (`a: true` entries).
- Only a **screenshot** revealed both: the app was marking the missed answer in green while the
  driver looped on a row it believed it had selected.

## 6.4 Dev builds talk to LOCAL Metro, not production
`apiBase()` resolves `EXPO_PUBLIC_API_URL` → `Constants.expoConfig.hostUri` → `''`. In a dev build
there is no `EXPO_PUBLIC_API_URL`, so it uses Metro. **Verifying anything server-side on device
requires the key in `.env.local` as well as on EAS.** `eas.json` already sets
`EXPO_PUBLIC_API_URL=https://euphoria-native.expo.app` for the preview and production profiles, so
real builds are fine.

## 6.5 Metro does not rate-limit
It re-evaluates route modules per request to pick up edits, recreating `_limit.ts`'s buckets empty
every time. **Verify limits against an exported bundle, never `:8081`.** A dev run looks exactly like
a broken limiter.

## 6.6 A checker can fail on its own doc comment — twice today
`privacy-claim-pin` matched the prose in `analytics.ts` that *warns* about `<PostHogProvider
autocapture>`. The chat config pin matched the comment explaining why **not** to use `thinkingLevel`.
**Strip comments before scanning source.**

## 6.7 Secret-reveal controls ignore synthetic clicks
Tried on four sites today — Google AI Studio, Google Cloud Console, and Massive twice. The click
registers, the value stays masked, and `clipboard.writeText()` needs a *trusted* user gesture that an
extension cannot produce. **Ask the user to reveal and paste.** Do not keep retrying, and do not try
to route around it with injected JavaScript — that is blocked by policy, correctly.

## 6.8 The simulator shuts itself down unprompted
Run `xcrun simctl list devices` before theorising about a crash. `EUPHORIA_UDID` for "Euphoria QA" is
`61F7E882-C226-4E97-9918-9BFF536B9A90`.

---

# 7. WHAT SHIPPED TODAY — 26 commits, C114→C123

## 7.1 Security: 8 findings, 5 closed
Full research, sources and the remaining plan: **`refs/SECURITY_REVIEW.md`**.

| new module | what it does |
|---|---|
| `api/_validate.ts` | **Allowlist**, not denylist, for everything reaching an upstream URL. `.toUpperCase()` was standing in for validation at 7 call sites; a crafted `sym` walked out of the intended Polygon endpoint on our paid key. Also `mayCarryKey()` — our key was being stapled to a URL taken from an upstream response. |
| `api/_identity.ts` | Server-verified JWT. Pins `alg: HS256` (the token gets no vote on how it is checked), requires `exp`, honours `nbf`, uses `crypto.subtle.verify`. **No code path reads claims from an unverified token.** Fails closed. |
| `api/_entitlement.ts` | F7. **Fails OPEN on every uncertain path**, deliberately — see §7.3. |
| `api/_advice.ts` | Refuses individualised investment advice. Keys on a **directive + a named security in the same sentence**, never on the word "buy" — the entire curriculum is about buying things. |
| `privacy-claim-pin` | The six facts behind `why-not-free.tsx`, including autocapture which was off *by omission* and would have silently become true if anyone mounted a Provider. |

## 7.2 Unit 17 is COMPLETE
- **17c built and device-verified** — the trial reward offer. Fires on the **first lesson finished
  inside the trial**, because the approved copy says *"That's your first lesson done"* and §0.4
  requires that be true when it renders. Headway's evidence is day-1-on-home, and the deviation is
  deliberate and documented. **The evidence is 1/5 — a bet, not convergence.**
- **17d's bypass closed (C115 → C117).** Four surfaces render the trial-expired state and only
  `GateSheet` carried the offer, so tapping **Start on Home** — the path the home screen pushes
  hardest — hit `lesson.tsx`'s hard wall and dismissed **without ever making the second ask**.
  Verified on device before and after. The hard wall is **not** replaced (C28 keeps it); it now asks
  before it lets go.
- **A double-count nobody would have seen:** `paywall_dismissed` fired on *both* dismissals, so every
  user who saw the offer counted twice — inflating exactly the users the offer reached, making it
  look like it drove the dismissals it was actually intercepting.
- The regression is **structural**: it asserts every dismissible wall both calls the rule and renders
  the sheet, because C115 was a *coverage* bug and a unit test on the predicate would have passed
  throughout.

## 7.3 F7 — and why only step 3 closes it
`_entitlement.ts` allows on: no secret, 5xx, timeout, malformed body, 404-then-unknown. It denies
**only** when RevenueCat affirmatively says "no active entitlement". That is deliberate:
`purchases.ts` already holds the line that a network failure must never revoke a paying member's
access, and a wrong deny is indistinguishable from a real lapse in the logs. **Wrong in the open
direction costs tokens; wrong in the closed direction costs a customer.**

Rollout, and **only one step is done**:
1. **Today** — `REVENUECAT_SECRET_KEY` unset → byte-identical no-op.
2. Secret set + sign-in shipped → verified callers checked; a signed-in non-payer cannot spend.
3. **`ATLAS_REQUIRE_AUTH=1`** → anonymous refused. **Only this closes F7**, because the attack is
   anonymous. **Do not flip it before a sign-in UI exists** or it refuses the entire userbase.

**Known gap, recorded not papered over:** this check does not honour the billing-retry grace from
`lib/billing-retry.ts`, which runs client-side. Duplicating it would be a second copy of a money
rule. A member mid card-retry may be refused by the server while the client grants access. **The fix
is to share one rule, not write a second.**

## 7.4 Refactor: `store.ts` 822 → 780, and regressions that stopped grading their own work
Six rule modules, each dependency-free so its regression imports the **real** rule:

`cost-basis` · `portfolio-value` · `billing-retry` · `day-keys` · `trial-reward` · `dismissal-offer`
· plus `api/_chain.ts`.

The two worst offenders: `portfolio-snapshot-regression` held a **third** copy of the valuation
formula (`store.ts` had it twice, with a comment admitting *"Same rule now lives in both"*, and those
two had **already diverged once** — the headline counted open contracts, the chart did not, and the
Trade tab showed a permanent phantom loss). `billing-retry-regression` **said so in its own header**:
*"re-implements the rule rather than importing it."*

## 7.5 Options moved off Tradier to marketdata.app
Tradier's signup walks into a **brokerage** flow demanding SSN and employment details for read-only
chain data. `TRADIER_TOKEN` was never set, so the desk answered 503 and fell back to a Black-Scholes
model with no market behind it. marketdata.app returns a superset — bid, ask, mid, last, iv, delta,
gamma, theta, vega, openInterest, volume, dte, inTheMoney. **Tradier is kept as a real fallback**,
active only if the token ever exists.

The transpose is in `api/_chain.ts` because marketdata.app answers **columnar** — parallel arrays
keyed by name. **Rename a column and it produces zeros, not an error**, and a chain of contracts with
bid 0 and delta 0 renders perfectly while every quote is a lie. 19 cases pinned, one of which proves
the failure is silent.

---

# 8. THE GATE

```bash
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90   # "Euphoria QA", every shell
npx tsc --noEmit                       # clean
npm run check                          # 15 scripts, all PASS
npx expo lint 2>&1 | grep problems     # 48 (3 errors, 45 warnings) — the C66 baseline
python3 scripts/certify.py             # ALL ROUTES PASS 3a
node scripts/a11y-audit.mjs            # 1 known false positive (SpringPressable docstring)
./scripts/sim.sh screen                # then LOOK AT THE REAL SCREEN
```

**C113 still governs:** a green gate means the things it checks are fine. **It does not mean the
number on the screen is true.** Four green runs once sat over a Trade tab rendering `+300.0%` on a
position that had not moved.

**A checker that has never failed has not been tested.** Every regression added today was verified
against the break it exists to catch — and two of them caught real bugs that way: a truthiness check
reading epoch 0 as "unseen", and a `<` that lost the last granted day of the trial.

---

# 9. OPEN WORK, in priority order

## 9.1 Needs credentials only — all code is done and pinned
1. ~~**PostHog**~~ ✅ **DONE 2026-08-13.** App-originated events land in project 557266 — see §2.2 for
   the evidence and for the two bugs it surfaced. Unit 17's premise (*"nothing in this unit can be
   judged until 17b lands"*) is **MET**; the five instrumented phases can now be read.
2. **Supabase** → URL + anon key (public) + `SUPABASE_JWT_SECRET` (secret). Activates F4/F6.
   **The account EXISTS** — the sign-in page shows *"LAST USED: Continue with GitHub"*, so sign in
   with GitHub rather than email.
3. **RevenueCat SECRET key** → activates F7 step 2. **NOTE: none exists.** Verified in the dashboard
   — project Euphoria `320845df` shows *"No secret API keys"*. One must be CREATED, not fetched, and
   that is a persistent credential on live billing, so it is the owner's call.

## 9.2 Needs a decision or money
- **`movers`** needs a paid Polygon plan. Currently an honest `501 plan_required`.
- **F8 — social sign-in is unverified.** `social-auth.ts` resolves identity **on-device**;
  `identityToken` and `nonce` appear **nowhere** in `src/`. **Harmless today** — nothing server-side
  trusts it, so it is a value with no authority. **It becomes a full authentication bypass the moment
  it is sent to a server as an identity**, because a client can claim any `user` string. The warning
  is written into `social-auth.ts` next to the value rather than only in a document, because
  `api/_identity.ts` now exists and is exactly the plausible place someone will wire it. **Correct
  path:** pass a `nonce` into `signInAsync`, send `credential.identityToken`, verify against Apple's
  JWKS, check `aud` against the bundle id and that the nonce matches, *then* mint a session.
- **F6** — the limiter is per-isolate on Workers. A Durable Object keyed on the verified identity
  closes it; `_limit.ts:19-22` lists three drop-in options for `take()`.
- **Cached error responses** — a `429`/`503` could be served to everyone until the TTL expires. The
  success path is identical for all users so caching it is free performance; the **error** path wants
  `Cache-Control: no-store`. Needs the TTL confirmed from the EAS dashboard, which nobody has read.

## 9.3 Product
- **17 captured screens unaudited** — `digest`, `chat`, `options`, `stock` next by priority.
  **BLOCKED: ScreensDesign Pro has lapsed** (`search_apps` → *"An active Pro subscription is
  required"*), and AGENTS.md makes it mandatory for design work. Label any HIG-only work as such.
- ✅ **Live market data HAS now been seen in the app** (2026-08-14). Trade tab, stock screen and the
  options chain all driven on device against real data. What it cost to learn: C109 was right twice
  — the $1,184-vs-$225.30 contradiction and the "% today" badge showing yesterday were both
  invisible to curl and to a green gate.
  **Options is LIVE and the marketdata.app swap works in the app**, not just in curl: NVDA, 85 call
  strikes $50–$400 across 8 real expiries (`08-14 … 09-11`), near-the-money pricing credible
  (`$207.50 call, $1,720, IV 63%, Δ0.95`). Header reads `NVIDIA at $225.30 · 3 of 3 preview contracts
  left` — spot live, and the preview allowance correctly restored by the v2 unwind. Requires Pro:
  `./scripts/seed-trial.sh 1 true`.
  🟡 **But the chain OPENS AT $50, 4.5× from spot** — the user's first screen is deep-ITM calls at
  $17,710 against $6,448 of cash, and $1.00 puts at Δ-0.00. Near-the-money sits at row ~55 of 85.
  Phase 16 made this newly RELEVANT rather than newly broken: at the old static $1,184 spot, no
  strike was near the money and the chain never spanned it. Anchoring the initial scroll is DESIGN
  work — ScreensDesign is mandatory and lapsed. Smaller: the IV column renders provider noise as
  fact at the wings (`IV 0%` and `IV 617%` on adjacent rows).
  **Digest has NO live-market surface** — it is curriculum content from `sync-digest.sh`. Renders
  correctly (35 guides, categories reconcile 6+7+7+8+7), but C109 never applied to it. Do not put it
  on a market-data checklist again.
- ✅ **PHASE 16 LANDED 2026-08-13 — `priceOf` is live-backed.** Found by opening the app (C109, again):
  `stock/[sym].tsx` rendered headline **`$1,184.00`** (mock) directly above **previous close
  `$225.30`** (live) — a +425% move that never happened, on one screen. **Four green gate runs sat
  over it**, because §8 checks the code, not the number. The Polygon key we set today is what armed
  it; the code comment had predicted exactly that.
  **The fix is the one the code named:** a live mark cache (`lib/marks.ts`) sits BEHIND `priceOf`,
  which stays synchronous, so execution and valuation moved together and **no call site changed** —
  `valueOf()`, `snapshot()`, cost basis, the Trade rows and the options spot all followed for free.
  Verified on device: headline `$225.30`, position `3 shares → $676.05`. 20 cases in
  `scripts/marks-regression.mjs` pin that a zero, negative, NaN, string or Infinity can never become
  a price, and that a refused quote leaves the previous mark standing.
  ✅ **The migration is written** — persist `version: 1`, `clearStaticPricing()` in `cost-basis.ts`.
  A basis booked before Phase 16 was paid in static dollars and would have shown an ~81% loss on a
  position that never moved. It is **CLEARED, NOT RESCALED**, because `cost-basis.ts` had already
  settled this exact question — *"A PARTIAL BASIS IS WORSE THAN NO BASIS… stays ABSENT until the
  position is closed and rebuilt from a known price."* Rescaling preserves a percentage that was
  itself fiction. Absent makes `hasUnknownBasis` true, the Trade row renders no percentage, and the
  copy already shipped there becomes literally true. **`valueHistory` goes too** — that was the first
  draft's miss, and leaving it would have drawn a 29% cliff on the chart the moment one live-priced
  snapshot landed. Positions and cash are untouched: the user keeps every share, only the claim about
  what they paid is withdrawn. Verified on device from a reset v0 store: `costBasis {}`,
  `valueHistory []`, positions and cash intact, and the `+$3.28 (0.03%) all time` row gone rather
  than recomputed.
  ✅ **v2 UNWINDS pre-Phase-16 derivatives.** They held STATIC strikes — a seeded NVDA call struck at
  `$1,302.00` against a `$225.30` spot. Not a phantom computation: `portfolio-value.ts:42` values
  contracts at the stored `premium`, never against spot, so `$781.06` was simply what was paid.
  **Shares survived v1 but contracts do not survive v2, and the asymmetry is the point** — a share
  count means the same thing in any denomination, whereas a contract's DEFINING parameter is a
  static-dollar strike, so it is unsalvageable rather than merely mispriced. Reversed, not repriced:
  contract deleted, premium returned to cash, `derivativeTrades` restored. The refund is
  **NET-NEUTRAL, not a grant** — cash was always real dollars, only PRICES were fictional. Leaving
  the cash spent would be a takeaway; clearing contracts without the counter would silently consume
  part of a lifetime allowance of 3. **Verified on device, arithmetically:** before
  `5666.94 + 676.05 + 1.48 + 1.00 + 781.06 = 7126.53`, after `6448.00 + 676.05 + 1.48 + 1.00 =
  7126.53`. **The total moved by zero.**
  **v2, not folded into v1**, because v1 had already run on the dev install — a migration that
  changes meaning after it has run leaves a store in a state no version describes.
  ✅ **The "% today" badge is GONE, and that was a correctness fix.** Two "today" figures disagreed
  5× (`+0.1%` vs `+$1.23 (0.55%)`), which read like a rounding bug and was not. The badge rendered
  `live.changePct`, and `api/market+api.ts` builds a quote from **`/v2/aggs/ticker/{sym}/prev` — the
  PREVIOUS trading day's bar**, `(bar.c - bar.o) / bar.o`. A figure labelled "today" described
  YESTERDAY. `PriceChart` already shows the change for the selected range computed from the points it
  draws, so it cannot disagree with the line on screen. One change figure, anchored to visible
  evidence.
  ⚠️ **READ THIS BEFORE CALLING THE MARK "LIVE":** `price` from that same endpoint is `bar.c`, the
  **previous close**. The Phase 16 mark is therefore END-OF-DAY on Polygon's free tier — a real
  market price, but not an intraday one. Everything in this file that says "live" means *from the
  market*, not *to the second*. A real-time feed is a paid plan, same as `movers`.
- **Driving the sim: `sim.sh open` raises an iOS "Open in euphoria-native?" CONFIRM DIALOG**
  (`sim.sh:128` says so). Until you `tapon "Open"`, that modal swallows EVERY tap anywhere on
  screen — which reads exactly like the §6.2 LogBox trap and is not it. Deep link, confirm, then
  drive. Separately, y≈795–811 IS still LogBox-obstructed: taps at y=102 landed while y=802 did not.
- **`lib/stocks.ts` is still a hardcoded mock table.** The paper portfolio does not use live prices.
  **If you make valuation live, make EXECUTION live in the same commit**, or every position
  percentage silently becomes fiction.
- **`lib/people.ts` is fabricated** and says so — the league races invented rivals.
- **Three `COPY IS UNAPPROVED` markers remain:** `settings/[section].tsx`, `gate-sheet.tsx`,
  `notifications.ts`.
- **Unit 14** — the final consolidated review, deliberately last. There is materially more surface
  now: six API modules, five new regressions, a provider swap.

## 9.4 Apple — unchanged, Account Holder only
Paid Applications Agreement **unsigned** (no IAP can transact; the offering has no packages), EU
trader status not provided (DSA — removal from the EU store), 2.1b reply in
`refs/APPLE_2.1b_REPLY_DRAFT.md` awaiting approval.
**Never accept an agreement on someone else's behalf.**

### App Privacy — the declaration, inventoried 2026-08-14

It was listed here as "inaccurate, analytics was added and must be declared" with no statement of
WHAT. This is the audit, so the form can be filled in without re-deriving it. Read from the code,
not from memory.

**Data collected**
| Apple category | What, exactly | Linked to identity? | Purpose |
|---|---|---|---|
| Identifiers → User ID | `install_id` — client-minted `eu_` + `Math.random()` + `Date.now()` (`store.ts`). **NOT** IDFA, IDFV or any hardware id. | Pseudonymous; no account exists to link to | Analytics |
| Usage Data → Product Interaction | 14 events: `install`, `first_lesson_completed`, `day_return`, `paywall_seen`, `paywall_dismissed`, `special_offer_seen/accepted/dismissed`, `trial_reward_accepted/dismissed`, `first_action_started/skipped`, `trial_started`, `paid`. Properties are `day_number`, `course`, `lesson`, `feature`, `kind`, `reason`. | Pseudonymous | Analytics |
| **User Content** | **The user's Atlas messages are sent to Google Gemini.** This is the one most likely to be missed — it is not analytics, it is user-generated content leaving the device to a third party. | Not stored by us; no identifier is sent with it | App Functionality |
| Purchases | Handled by RevenueCat | Per RevenueCat | App Functionality |

**Third parties that receive anything:** `us.i.posthog.com` (analytics), `generativelanguage.googleapis.com`
(chat content), `api.revenuecat.com` (purchases). `api.polygon.io`, `cdn.cboe.com` and
`api.marketdata.app` receive **a ticker symbol and nothing else** — no identifier, no user content —
so they are not a privacy disclosure, though they are a data flow.

**Not collected, and worth stating because the code enforces it:** no name, no email, no contacts,
no location, no photos, no IDFA. `analytics.ts` documents a no-PII rule and `enableSessionReplay:
false` / no `<PostHogProvider autocapture>`; a security review confirmed both hold.

---

# 10. HOW TO WORK

1. **LOOK AT THE SCREEN**, and for anything computing money, **get a second reader** (C113).
2. **Verify by reading the BODY, with a cache-buster.** A successful deploy proves nothing; a curl
   without `_cb` proves less; a 200 is not success if the provider reports failure inside it.
3. **ScreensDesign is MANDATORY for design work** — read the SCREEN, never the flow description,
   report hit rate across ≥4 apps, say "no strong match" rather than substituting. Currently
   unavailable.
4. **ASK VIA `AskUserQuestion`, and end every turn with one.** Put the evidence in the option
   descriptions.
5. **§0.7: never invent product copy.** Draft options and let the user choose. If they delegate the
   choice, **record it as delegated** — "the owner said choose" is different provenance from "the
   owner chose".
6. **§0.4: never show a number the app cannot back.** §0.5: no dead controls. §16a: no discount
   framing in App Store assets.
7. **Never mention session cost or context percentage.**
8. The user is authenticated in App Store Connect, RevenueCat, Google Cloud and Massive via Claude in
   Chrome. **Secret-reveal controls do not respond to synthetic clicks** (§6.7) — ask them to reveal
   and paste. **Never create accounts or enter passwords**, no matter how it is framed.

---

# 11. OPERATIONAL FACTS THAT ARE EASY TO GET WRONG

- **The analytics change needs an app REBUILD, not a deploy.** `analytics.ts` is client code.
  `eas deploy` only ships the server routes. `EXPO_PUBLIC_` values are inlined at bundle time, so
  after changing one run **`npx expo start --clear`** — a plain restart keeps the old bundle.
- **There are TWO Massive keys.** `Default` (…q6rM) is the one in use. `strange_turing` (…9_np) is
  untouched — **do not set the second one anywhere** or the free quota is split across two consumers
  and the throttling will look like a bug.
- **marketdata.app is billed PER CONTRACT, and the "roughly 100 requests/day" written here before was
  wrong by a factor of 1000.** Read live from `x-api-ratelimit-limit` on 2026-08-14: the limit is
  **100,000 credits/day**. But credits are not requests — a full NVDA chain for one expiry returned
  216 contracts and consumed **193 credits**, i.e. ~518 options screen loads per day for the ENTIRE
  userbase. That was the hardest production ceiling in the app.
  **Fixed by `strikeLimit`** (`STRIKE_WINDOW = 16` in `api/_chain.ts`): 32 contracts for **32
  credits**, a 6× cut to ~3,125 loads/day — and the same parameter centres the chain on the money and
  removes the ill-conditioned IV at the wings. **Check the live header before trusting any number in
  this file**, including this one: `curl -D- '…/expirations/NVDA/?token=…'`.
  Provider spend is now bounded by CACHE, not by user count: the route sends
  `s-maxage=900, stale-while-revalidate=3600` on success and `no-store` on every error path, so cost
  scales with distinct (symbol, expiry) pairs — 7 × 8 — rather than with how many people open the
  screen. **The `no-store` half matters as much**: EAS edge-caches GET API routes, and a cached 502
  serves the outage to everyone long after the upstream recovered (§4 saw exactly that with a 503).
- It answers `203`, not `200` (*Non-Authoritative Information* = delayed). **203 is success — do not
  "fix" it.** The route treats any `2xx` as OK and separately checks `s !== 'ok'` in the body.
- **No production or TestFlight build has EVER been made with these keys.** Everything verified so
  far is either the deployed Worker (curl) or a dev build talking to local Metro. A real build is an
  untested path — `eas.json` sets `EXPO_PUBLIC_API_URL` for preview/production, which is the piece
  that makes it work at all, and that has never been exercised.
- **Config inventory as of this commit:** EAS production holds 5 (`GEMINI_API_KEY`,
  `POLYGON_API_KEY`, `ALPHAVANTAGE_API_KEY`, `MARKETDATA_TOKEN`, `EXPO_PUBLIC_POSTHOG_KEY`).
  `.env.local` holds those 5 plus `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. `eas.json` carries `EXPO_PUBLIC_API_URL` on preview and
  production only.
- **Alpha Vantage is throttled on the Worker's shared egress IP** and there is no free fix. Polygon
  backs news up and currently serves it. If news ever goes empty again, check which provider answered
  by looking at the article `id`: a **url** is Alpha Vantage, a **hex hash** is Polygon.
