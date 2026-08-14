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

## 2.2 PostHog — set and proven at the key level, NOT proven end to end

**Project 557266, US Cloud.** `EXPO_PUBLIC_POSTHOG_KEY=phc_pgnjFMRUXJfgurWUo98gHd95gX2MLWZy3eCQcp2Qyg58`
— a **public write-only client key**; PostHog labels it *"Safe to use in public apps"*. Set in
`.env.local` and on EAS production (`plaintext` visibility).

**What IS proven:** the key matches the app's own `/^phc_[A-Za-z0-9]{20,}$/` gate; a direct
`POST /i/v0/e/` returned `{"status":"Ok"}` and the event appears in the dashboard; Metro exports the
variable (`env: export … EXPO_PUBLIC_POSTHOG_KEY …`); `posthog-react-native@4.62.0` is installed.

**What is NOT proven:** that the APP sends anything. No app-originated event has reached the
dashboard. **Do not record this as working until one does.**

**One false lead already eliminated, so do not repeat it.** `day_return` appeared to be broken. It is
not — `_layout.tsx` fires it only when `activeDays.length > 0 && !activeDays.includes(today)`, and
the store read `['seed-0', '2026-08-13']`, i.e. today was already recorded. **The event correctly
did not fire.** Cleared by reading the persisted store, not by guessing.

**How to settle it in one run:** `analytics.ts` now logs at every step — module load, each `track()`,
each successful capture, and both failure paths, which used to be `.catch(() => null)` and
`.catch(() => {})`. Launch, trigger any event, and read:

```bash
xcrun simctl spawn $EUPHORIA_UDID log show --last 2m \
  --predicate 'processImagePath CONTAINS "euphoria"' | grep -oE "\[analytics\][^\"]{0,140}"
```

Absent lines mean `track()` was never called (check the trigger's condition first). A
`DISABLED, dropping` warning means the key did not reach the bundle — `npx expo start --clear`,
because `EXPO_PUBLIC_` values are inlined at bundle time. A load or capture error now names itself.

**Easiest event to force:** seed an expired trial (`./scripts/seed-trial.sh 4 false`) and open a
locked lesson from the **Learn tab** — the gate sheet fires `paywall_seen` on becoming visible.

**Also worth knowing:** PostHog RN **batches**. `flushAnalytics()` runs on backgrounding, so a single
event may sit queued rather than send immediately.

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
1. **PostHog — key is SET; prove the app actually sends.** See §2.3 for the exact command and the
   one false lead already ruled out. Until an app-originated event lands, treat Unit 17's premise
   (*"nothing in this unit can be judged until 17b lands"*) as still unmet.
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
- **Live market data has never been seen IN THE APP.** Endpoints verified by curl only. The Trade tab
  and stock screens have not been opened against real prices. **That is a different claim** — C109.
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
trader status not provided (DSA — removal from the EU store), App Privacy inaccurate (analytics was
added and must be declared), 2.1b reply in `refs/APPLE_2.1b_REPLY_DRAFT.md` awaiting approval.
**Never accept an agreement on someone else's behalf.**

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
