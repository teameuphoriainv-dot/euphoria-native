# CARRYOVER — paste this whole file into a fresh session

Written **2026-08-13**, replacing the 2026-08-11 file. Everything here was VERIFIED in this repo, on
the simulator, or against a live endpoint on the date given. **Where this contradicts anything older,
including §22 entries written before today, this wins.**

Continue work on **`~/euphoria-native`** — Euphoria, Expo SDK 57 / expo-router / RN finance education
for 18-25s, mascot **Atlas**. Content source of truth is `~/euphoriaweb-current`.

**`README.md` is now a real reference (531 lines) and is accurate as of this commit.** Read it before
§22. It carries the architecture, the deploy sequence, the gate, and the traps.

**HEAD `d13b879`. 386 commits, 25 of them today. Tree clean, all pushed. §22 runs C1→C123.**

---

## THE HEADLINE: THE APP IS LIVE END TO END FOR THE FIRST TIME

| feature | state |
|---|---|
| **Atlas** | ✅ answering in production AND verified on device in the chat screen |
| **quote / chart / stats / search** | ✅ NVDA 225.30, real 1M series |
| **news** | ✅ — **via the Polygon fallback**, not Alpha Vantage |
| **options** expirations + chains | ✅ TSLA, with greeks |
| **movers** | ⛔ `501 plan_required` — needs a paid Polygon plan |

Four keys are set on EAS production and in `.env.local`: `GEMINI_API_KEY`, `ALPHAVANTAGE_API_KEY`,
`POLYGON_API_KEY`, `MARKETDATA_TOKEN`.

---

## THE FIVE FACTS THAT KEEP GETTING RE-DERIVED WRONG. Do not re-litigate.

1. **`~/euphoria-native` IS THE PRODUCT.** `~/euphoriamobile` is a Capacitor app, abandoned 04-09.
2. **Bundle id `com.euphoriainv.euphoria`.** `android.package` deliberately stays `com.euphoria.native`.
3. **App Group `group.com.euphoriainv.euphoria`** in `app.json`, `src/lib/widget.ts`, `targets/widget/index.swift`.
4. **`eas env:set` DOES NOT EXIST** on eas-cli 21.7.1. It is **`env:create`**. The previous carryover
   said the opposite and cost a deploy cycle. `env:exec` takes the environment **POSITIONALLY**.
5. **The Gemini key is `AQ.…` 53 chars, NOT `AIza…` 39.** Every shape check in this repo would have
   rejected a working credential. **Do not add an `AIza` gate.**

---

## DEPLOYING. Four steps, and three of them are load-bearing.

```bash
npx eas env:create --name X --value "<v>" --environment production \
    --visibility sensitive --scope project --non-interactive
npx eas env:exec production "npx expo export --platform web"   # POSITIONAL env. NOT optional.
npx eas deploy --prod --environment production --non-interactive
curl -s "https://euphoria-native.expo.app/api/...&_cb=$(date +%s)"   # cache-buster, always
```

**Step 2 is the one everybody skips.** The built bundle does a *runtime* `process.env` lookup, which
makes it look as though export cannot matter — but the export is what tells EAS Hosting which
variables the deployment needs. §22 C119 reasoned from that and got it **wrong**; C120 corrects it.

**Step 4 needs the cache-buster.** EAS Hosting **edge-caches GET API routes** (`cache-status: EAS`).
Without one you read the *previous* deployment's answer. This faked two failures in a row today —
including an options route that was live the whole time while returning a cached `503` (C122).
`/api/chat` never showed it because POST is not cached.

---

## THE LESSON OF THE DAY, and it happened THREE TIMES

**A refusal WE caused must never be reported as a failure THEY caused.**

| what actually happened | what it was reported as | now |
|---|---|---|
| `gemini-2.5-flash` retired, 404 | `502 upstream` → "Atlas is broken" | `model_unavailable`, logged as CONFIG |
| Alpha Vantage throttle: `200 {"Information":…}` | `{"articles":[]}` → "no news today" | logged: `alphavantage refused` |
| Polygon plan limit, 403 | `502 upstream` → "Polygon is down" | `501 plan_required`, logged PLAN LIMIT |

Each one sends the next person to check the key, the network and a status page. All three are fine.

Two more that faked failures in the other direction:

- **Thinking tokens ate the answer.** Gemini 3.x counts thinking against `maxOutputTokens`: measured
  **346 of 386 tokens were thought**, so Atlas replied mid-sentence with `finishReason: "STOP"` and a
  plausible body. Only `thinkingConfig: { thinkingBudget: 0 }` fixes it — `thinkingLevel: "low"` still
  burned 318. It was also ~17× the cost on the one feature with a real per-message cost.
- **marketdata.app serves AAPL without a token and nothing else.** I tested one ticker, wrote
  "no account needed", and TSLA returned `401`. Testing a second ticker is what caught it.

---

## OPERATIONAL TRAPS

- **`gh auth` REVERTS between pushes.** Run `gh auth switch --user teameuphoriainv-dot` **before
  every push** or you get a bare "Repository not found".
- **LogBox eats taps.** Its error bar sits at **y≈795–811pt**, over some dismiss controls and the
  lesson-intro `Continue`. `sim.sh` reports a successful tap and nothing happens — it absorbed **52
  consecutive taps** today. Dismiss it first. **The accessibility tree tells you what EXISTS, never
  what a tap will DO.**
- **A MultiSelect row's centre is not its checkbox** (it is on the left), and **it will not advance
  on a wrong answer** — an automated driver needs the answer key from `curriculum/courses/*.ts`.
- **`apiBase()` resolves to Metro's `hostUri` in dev**, so the simulator talks to the LOCAL server.
  Verifying anything server-side on device needs the key in `.env.local` too. `eas.json` already sets
  `EXPO_PUBLIC_API_URL` for preview/production builds.
- **Metro does not rate-limit** — it re-evaluates route modules per request. Verify limits against an
  exported bundle, never `:8081`.
- **The simulator shuts itself down unprompted.** `xcrun simctl list devices` before theorising.
- **A checker can fail on its own doc comment.** Happened twice: `privacy-claim-pin` matched the
  prose naming `<PostHogProvider autocapture>`, and the chat config pin matched the comment
  explaining why not to use `thinkingLevel`. Strip comments before scanning source.

---

## WHAT SHIPPED TODAY (25 commits, C114→C123)

**Security — 8 findings, 5 closed** (`refs/SECURITY_REVIEW.md` has the research and sources):

- `_validate.ts` — allowlist for everything reaching an upstream URL. `.toUpperCase()` was standing
  in for validation across 7 call sites; a crafted `sym` walked out of the intended Polygon endpoint.
- `_identity.ts` — server-verified JWT. Pins `alg: HS256`, requires `exp`, `crypto.subtle.verify`,
  **no path reads claims from an unverified token**. Inert until `SUPABASE_JWT_SECRET`.
- `_entitlement.ts` — F7. **Fails OPEN on every uncertain path**, deliberately: a wrong deny locks
  out a payer. Inert until `REVENUECAT_SECRET_KEY`.
- `_advice.ts` — refuses individualised investment advice. Keys on a **directive + a named security**,
  never on the word "buy", because the curriculum is about buying things.
- `privacy-claim-pin` — the six facts behind `why-not-free.tsx`.

**Unit 17 is COMPLETE.** 17c built and device-verified; 17d's bypass closed (C115→C117) — four
surfaces rendered the trial-expired state and only `GateSheet` carried the offer, so tapping Start on
Home dismissed without ever asking. Also fixed a **double-count**: `paywall_dismissed` fired on both
dismissals, inflating exactly the users the offer reached.

**Refactor.** `store.ts` 822 → **780**. Six rule modules now, each dependency-free so its regression
imports the *real* rule: `cost-basis`, `portfolio-value`, `billing-retry`, `day-keys`,
`trial-reward`, `dismissal-offer`, plus `api/_chain.ts`.

**Options moved off Tradier to marketdata.app** — Tradier's signup demands SSN and employment details
for read-only data.

---

## THE GATE

```bash
npx tsc --noEmit                       # clean
npm run check                          # 15 scripts, all PASS
npx expo lint 2>&1 | grep problems     # 48 (3 errors, 45 warnings) — C66 baseline
python3 scripts/certify.py             # ALL ROUTES PASS 3a
node scripts/a11y-audit.mjs            # 1 known false positive (SpringPressable docstring)
./scripts/sim.sh screen                # then LOOK AT THE REAL SCREEN
```

**C113 still governs:** a green gate means the things it checks are fine. It does not mean the number
on the screen is true. **A checker that has never failed has not been tested** — every regression
added today was verified against the break it exists to catch.

---

## OPEN WORK

**Needs credentials (all built and inert):**
- **PostHog** — no account. `ANALYTICS_ENABLED` shape-checks `phc_`, so every 17b/17d/17f event is a
  no-op. Five phases of instrumentation record nothing.
- **Supabase** — `EXPO_PUBLIC_SUPABASE_URL`, `_ANON_KEY`, `SUPABASE_JWT_SECRET`. Activates F4/F6.
- **RevenueCat SECRET key** (not the `appl_` public one) — activates F7.

**Needs a decision or money:**
- `movers` needs a paid Polygon plan.
- **F8** — social sign-in is unverified on-device. `identityToken` and `nonce` appear nowhere in
  `src/`. Harmless today; **a full auth bypass the day it is wired to a server**, and
  `api/_identity.ts` is the plausible-looking place someone will wire it.
- **F6** — the limiter is per-isolate. A Durable Object keyed on the verified identity closes it.
- Cached error responses: a `429`/`503` could be served to everyone until the TTL expires. The
  success path is identical for all users so caching it is free; the error path wants `no-store`.

**Product:**
- **17 captured screens unaudited** — `digest`, `chat`, `options`, `stock` next. **Blocked:
  ScreensDesign Pro has lapsed**, and AGENTS.md makes it mandatory for design work.
- **Live market data has never been seen IN THE APP.** Endpoints verified by curl only; the Trade tab
  and stock screens have not been opened against real prices. That is a different claim (C109).
- `lib/stocks.ts` is still a hardcoded mock table — the paper portfolio does not use live prices.
  **If you make valuation live, make EXECUTION live in the same commit** or every position percentage
  becomes fiction.
- `lib/people.ts` is fabricated and says so.
- **Unit 14** — the final consolidated review, deliberately last. There is more surface now: six API
  modules, five new regressions, a provider swap.

**Apple, unchanged:** Paid Applications Agreement unsigned (no IAP can transact), EU trader status
missing, App Privacy inaccurate, 2.1b reply awaiting approval. Account Holder only.

---

## HOW TO WORK

1. **LOOK AT THE SCREEN**, and for anything computing money, **get a second reader** (C113).
2. **Verify by reading the BODY**, with a cache-buster. A successful deploy proves nothing; a curl
   without `_cb` proves less.
3. **ScreensDesign is MANDATORY for design work** — read the SCREEN, never the flow description.
   Report hit rate across ≥4 apps. Currently unavailable; label HIG-only work as such.
4. **ASK VIA `AskUserQuestion`, and end every turn with one.** Evidence in the option descriptions.
5. **§0.7: never invent product copy.** Draft options and let the user choose. Three
   `COPY IS UNAPPROVED` markers remain: `settings/[section].tsx`, `gate-sheet.tsx`, `notifications.ts`.
6. **Never mention session cost or context percentage.**
7. The user is authenticated in App Store Connect, RevenueCat, Google Cloud and Massive via Claude in
   Chrome. **Secret-reveal controls do not respond to synthetic clicks** — four sites tried today,
   none worked. Ask the user to reveal and paste. **Do not create accounts or enter passwords.**
