# Security review — 2026-08-13

Research into how AI-assisted ("vibe-coded") apps get breached, turned into findings against **this**
codebase. **Eight findings: five closed in this pass, three open and recorded honestly** — including
the parts that cannot be closed by writing code at all.

Scope covered, at the user's direction: the general vibe-coding threat landscape, agent/LLM-specific
risk, the fast top-10 checks, and a Euphoria-specific audit.

---

## 1. What the research actually says

### Vibe-coded code ships broken at a rate worth planning around

- **62%** of AI-built applications ship with critical vulnerabilities ([OX Security][ox]); a Q1-2026
  assessment of 200+ vibe-coded apps found **91.5%** contained at least one vulnerability traceable
  to hallucination or missing security context.
- CVEs directly attributable to AI-generated code went **6 → 15 → 35** across Jan/Feb/Mar 2026
  ([CSA Labs][csa]).
- The failure modes are boringly consistent: injection where input patterns were followed without
  sanitisation, **IDOR and broken access control**, permissive CORS, missing security headers
  ([SecurityWeek][sw], [Georgia Tech][gt]).
- The canonical incident is Moltbook — an AI social network built without hand-written code that
  **exposed 1.5M API tokens and 35,000 email addresses within 72 hours of launch**.

**The lesson that transfers:** none of these are exotic. They are the checks a reviewer would run
anyway. The risk is not that AI writes exotic bugs; it is that it writes ordinary ones confidently,
at volume, with plausible comments over the top.

### The LLM proxy is the part that is new

- **OWASP Top 10 for LLM Apps 2026** (published 2026-08-04) keeps **Prompt Injection at #1** and
  **Sensitive Information Disclosure at #2**. **Excessive Agency jumped 6th → 3rd** "because agents
  finally started doing real damage in production". **Unbounded Consumption** moved up to #7
  ([ReversingLabs][rl], [HackerDNA][hd]).
- **LLMjacking**: active since late 2025, attackers systematically probe for misconfigured proxies to
  resell access to paid LLM services. Stolen LLM credentials sell for **~$30 an account**
  ([Rescana][res]).
- **282 iOS apps were found leaking LLM API credentials in network traffic** ([The Hacker
  News][thn], [NDSS poster][ndss], [arXiv][arx]). The finding that matters most for us:
  > provider-side mitigations like rate limiting alone are insufficient, because **attackers can
  > abuse proxy infrastructure without ever touching the underlying raw API key**.
- **Insufficient rate limiting is the single most common failure**, "particularly when rate limits
  are per-IP rather than per-user, allowing bypass via proxy rotation" — **81% bypass rate** under
  testing ([FlowHunt][fh]).

### Expo-specific

- Anything prefixed `EXPO_PUBLIC_` is **inlined in plain text into the compiled app** and must never
  hold a secret. Non-prefixed variables are reachable only from server routes
  ([Expo docs][expo], [PTKD][ptkd]).
- You cannot hide a runtime secret in a managed app — the bundle is readable. The only real
  mitigation is keeping the key on a server the app calls ([React Native security][rns]).

---

## 2. What this codebase already does right

Verified, not assumed. These are the reasons the audit came back as short as it did.

| control | evidence |
|---|---|
| **No server key reaches the client bundle** | grep for `GEMINI`/`POLYGON`/`ALPHAVANTAGE`/`TRADIER` across `dist/client/.../entry-*.js` → **0 hits**. The only key in the bundle is RevenueCat's `appl_` public SDK key, which is designed to ship. |
| **Secrets are not committed** | `dist/` gitignored with 0 tracked files; `.env*.local`, `*.p8`, `*.pem`, `.secrets/` all ignored; `.env.example` holds placeholders only, 0 real values. |
| **Upstream error bodies are never forwarded** | `chat+api.ts`, `market+api.ts`, `options+api.ts` all log `res.text()` and return a generic code. This is exactly OWASP LLM #2, closed. |
| **Rate limit runs before the upstream call** | `chat+api.ts` guards before the key check and before parsing — the quota is not spent to learn a request was bad. |
| **Rate limit is per-install, not per-IP** | `_limit.ts:99` declines to key on IP on purpose. The research names per-IP as the common failure; this repo avoided it. |
| **Per-request input bounds on the LLM** | `MAX_TURNS 24`, `MAX_CHARS 2000`, `maxOutputTokens 400`. |
| **The limiter's ceiling is documented, not oversold** | `_limit.ts:11-31` states in-memory/per-isolate and that the identity header is unauthenticated. Nothing claims to be a global limiter. |
| **No agency** | Atlas has no tools, no function calling, no filesystem or network reach. OWASP's #3 (Excessive Agency) is structurally absent — the highest-climbing risk of 2026 does not apply here. |

---

## 3. Findings

### F1 — Unbounded LLM consumption on `/api/chat` · HIGH · **FIXED**

`chat+api.ts` guarded a 20-request burst per 5 minutes and nothing else. That is **5,760 completions
per identity per day** — precisely the slow-drain shape the LLMjacking write-ups describe, as opposed
to the hammering a burst limit catches.

Worse, the file's own header carried a live precondition:

> *"Do not add a chat UI against this until the cap exists; an uncapped proxy is an open tab on our
> account."*

`src/app/chat.tsx` (23.6K) shipped anyway. The warning was load-bearing and unmet.

**Fix:** a second window on the same identity — `guard(request, 'chat:day', 200, 24h)`. The stale
header is rewritten and the overtaken precondition recorded rather than deleted.

**Residual, stated plainly:** a *signed-in* caller is now billed against a server-verified subject
that cannot be rotated without the JWT secret (F4). An *anonymous* caller is still billed against a
header they choose, and the limiter is still per-isolate (F6). This raises the cost of casual abuse
and bounds accidental runaway. It does **not** stop a determined attacker.

### F2 — Unvalidated `sym` reaching upstream URLs · MEDIUM-HIGH · **FIXED**

`.toUpperCase()` was standing in for validation across five call sites in `market+api.ts` and two in
`options+api.ts`. Uppercasing narrows an alphabet; it validates nothing. Two concrete consequences:

1. **Path traversal into the provider.** `sym` lands in `/v3/reference/tickers/${sym}` and
   `/v2/aggs/ticker/${sym}/prev`. A crafted value walks out of the intended endpoint and spends our
   Polygon quota wherever the caller likes. The key never leaks — it does not need to. **The quota is
   the asset.**
2. **Query-parameter injection.** `sym` was concatenated unencoded into Alpha Vantage's query string
   (`tickers=${sym}`). An `&` starts a parameter we did not write; a `#` truncates the URL before
   `&apikey=` is appended, turning every call into a silent 401.

**Fix:** `src/app/api/_validate.ts` — an **allowlist** (`/^[A-Z0-9][A-Z0-9.-]{0,11}$/`), not a
denylist, so encoding tricks nobody has thought of fail by default. `expiry` gets a real date check
that also rejects shape-valid impossibilities like `2026-02-31`.

### F3 — Our API key attached to a URL from upstream data · MEDIUM · **FIXED**

`market+api.ts` took `branding.icon_url` out of a Polygon response and did `fetch(\`${src}?apiKey=${key}\`)`.
That URL is not user input, which is exactly what makes it easy to trust by accident — but "not user
input" is not "ours". If a branding record ever points elsewhere, this app hands its Polygon key to
that host. Also a latent bug: a `src` that already carried a query produced two `?`.

**Fix:** `mayCarryKey()` host allowlist (https + polygon.io only, and a lookalike suffix like
`api.polygon.io.evil.com` is refused), plus `withKey()` which uses `URL.searchParams` instead of
string concatenation.

### F4 — No authentication on any API route · MEDIUM · **WIRED, awaiting credentials**

`lib/auth.ts:61` — `currentUserId()` returns `null`; there is no session flow. Every route is
therefore open to anyone who knows the URL, and the rate-limit identity is a header the caller
chooses. This is the root cause of F1's residual risk.

It is honest scaffolding rather than a bug — the module exists so the limiter already asks for a real
identity and falls back, making sign-in a keys-and-wiring change rather than a re-architecture. But
it should not be mistaken for a control that exists.

**Done 2026-08-13.** The subtle part was that fixing this *badly* would have achieved nothing:
`lib/api.ts` sent `currentUserId() ?? installId` inside `X-Euphoria-Install`, a header the caller
picks. Signing in would have bought the same trust as a typed string — same header, same rotation
bypass. Per-user limiting only counts if the server knows the user.

So the client now sends a Supabase access token, and `api/_identity.ts` **verifies its signature
server-side** before anyone is allowed to be somebody. It pins `alg: HS256` (the token gets no vote
on how it is checked), requires `exp`, honours `nbf`, and uses `crypto.subtle.verify` rather than
comparing signature strings. There is deliberately no path that reads claims from an unverified
token — decoding a JWT without checking it is an authentication bypass with extra steps.

Identities are namespaced `u:` for verified and `i:` for self-declared, because without that a
caller who sets their install header to somebody's user id lands in that person's bucket.

**With `SUPABASE_JWT_SECRET` unset — the state today — every request is anonymous and behaviour is
identical to before. It activates the moment the secret lands.** 24 cases pinned in
`scripts/identity-regression.mjs`, including `alg: none`, algorithm confusion, an expired token, a
token with no `exp`, and a tampered payload carrying a previously valid signature.

**Still needed from the owner:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
(client), and `SUPABASE_JWT_SECRET` (server, via `eas env:set`). Then a sign-in UI, which does not
exist yet.

### F5 — Prompt injection into Atlas · LOW-MEDIUM · **FIXED**

OWASP's #1, and structurally bounded here: Atlas has no tools, so the worst case is words, not
actions. The real exposure is **regulatory rather than technical** — the system prompt is the only
thing stopping a coaxed model from giving individualised investment advice to an 18-25 year old in a
finance app, and a system prompt is not a control boundary.

**Done 2026-08-13.** `api/_advice.ts` checks the completion before it is returned. The hard part was
not detection — it was **not breaking the curriculum**. The entire product is about buying things,
and Atlas explaining "when you buy a share of Apple you own a slice of the company" is the product
working; a filter that killed that sentence would be switched off within a week, which is worse than
no filter.

So the discriminator is not the verb. It is a **directive aimed at the reader** ("you should",
"I'd") co-occurring with a **specific security**, in the same sentence. Education describes; advice
instructs. Known finance acronyms are excluded from ticker detection so "you should buy an ETF" and
"you should open an IRA" stay allowed.

23 cases pinned in `scripts/advice-guard-regression.mjs` — 9 refusals and **14 teaching sentences**,
because a false positive here is the more damaging direction.

**Ceiling:** a regex over English. It will miss paraphrase ("that one's a steal right now") and
cannot see intent. It sits *under* the system prompt, not in place of it. A model-graded check is
the upgrade path. The refusal line carries the `COPY IS UNAPPROVED` marker — three alternates go to
the owner under §0.7.

### F7 — No API route checks entitlement · MEDIUM · **BUILT, inert until configured**

Audited 2026-08-13. `atlas` and `options` are paid features in `entitlement.ts`'s `Feature` union,
and **every check is client-side**. Grep for `isPro`/`tier(`/`entitlement` across `src/app/api/`
returns nothing.

So `/api/chat` — the paid Atlas feature, which spends real Gemini tokens — is available to anyone
who knows the URL, regardless of trial state, expiry, or whether they ever paid. `/api/options`
spends Tradier quota the same way. The rate limiter bounds the volume; nothing gates the access.

This is not the same bug as F1. F1 was "one caller can spend too much"; F7 is "a caller who is
entitled to nothing can spend anything at all".

**Built 2026-08-13** in `api/_entitlement.ts`, wired into `/api/chat` and `/api/options` ahead of
the key check — the quota should not be touched to discover the caller was not allowed to touch it.

**It fails OPEN on every uncertain path**, and that is deliberate rather than lazy. `purchases.ts`
already holds this line client-side: a network failure must never revoke a paying member's access.
A wrong deny reads as "I paid and it locked me out", is indistinguishable from a real lapse in the
logs, and is the worst support ticket this product can generate. So no secret, a 5xx, a timeout and
a malformed body all ALLOW; only RevenueCat affirmatively answering "no active entitlement" denies.
**Wrong in the open direction costs tokens. Wrong in the closed direction costs a customer.**

**The rollout is three steps and only one is done:**

1. **Today** — `REVENUECAT_SECRET_KEY` unset, so this is a byte-identical no-op.
2. **Secret set + sign-in shipped** — verified callers checked; a signed-in non-payer cannot spend.
3. **`ATLAS_REQUIRE_AUTH=1`** — anonymous refused. **Only step 3 actually closes F7**, because the
   attack is anonymous: somebody with the URL and no account. Steps 1 and 2 must not be described as
   having closed it, and step 3 must not be flipped before a sign-in UI exists or it refuses the
   entire userbase.

**Known gap, recorded not papered over:** this check does not honour the billing-retry grace from
`lib/billing-retry.ts`, which runs client-side off `customerInfo`. Duplicating that rule here would
be a second copy of a money rule. A member mid card-retry may be refused by the server while the
client still grants access. The fix is to share one rule, not to write a second.

15 cases pinned in `scripts/entitlement-regression.mjs`, with `fetch` stubbed so the gate never
depends on RevenueCat being up.

**Accepted, and worth stating:** the curriculum itself ships inside the bundle, so lesson content
cannot be protected server-side no matter what. Entitlement for *content* is inherently advisory on
a client. Entitlement for *our metered API calls* is not, and that is the half worth closing.

### F8 — Social sign-in identity is never verified · LOW today, HIGH the day auth lands · **DOCUMENTED**

`social-auth.ts` resolves identity on-device and deliberately performs no server exchange.
`credential.user` is taken as the id; **`identityToken` and `nonce` appear nowhere in `src/`** —
verified by grep, 2026-08-13.

**Today this is not a vulnerability.** Nothing server-side trusts that id, there is no account, and
it is a local label on local data. A value with no authority cannot be abused.

**It becomes a full authentication bypass the moment it is sent to a server as an identity**, since
a client can claim any `user` string. That is a live risk precisely because `api/_identity.ts` now
exists and is the natural-looking place to wire it.

**Fix, recorded next to the value rather than only here** (`social-auth.ts` header): pass a `nonce`
into `signInAsync`, send `credential.identityToken` to the server, verify against Apple's JWKS,
check `aud` against the bundle id and that the nonce matches, and only then mint a session.

### F6 — In-memory limiter is per-isolate · MEDIUM · **OPEN, documented**

On EAS Hosting these routes are Cloudflare Workers; `buckets` is per-isolate, so two requests on two
isolates each see a fresh bucket. Already stated in `_limit.ts:11-22`. Same fix as F4.

---

## 4. The plan, in order

| # | action | closes | blocked on |
|---|---|---|---|
| 1 | ~~Validate every value that reaches an upstream URL~~ | F2, F3 | **done** |
| 2 | ~~Daily cost cap on the LLM proxy~~ | F1 | **done** |
| 3 | ~~Output filter on Atlas completions~~ | F5 | **done** — refusal wording still needs §0.7 sign-off |
| 4 | ~~Server-verified identity; limiter prefers it~~ | F4 | **done** — needs Supabase keys to activate |
| 5 | Move `take()` to a Durable Object keyed on that identity | F1, F6 | step 4's keys |
| 5b | Server-side entitlement check on `/api/chat` and `/api/options` | F7 | step 4 + RevenueCat secret key |
| 5c | Verify Apple's `identityToken` + nonce before any server session | F8 | only when sign-in is built |
| 6 | Set `GEMINI_API_KEY` quota/billing alerts provider-side | F1 defence-in-depth | Google Cloud console access |

Step 5 is what remains. Steps 1–4 raise the cost of abuse substantially and close the two findings
that were outright defects — but **an anonymous caller is still billed against a header they choose,
and the limiter is still per-isolate.** Until a shared counter keyed on a verified identity exists,
this document should not be cited as if the class is closed.

---

## 5. Verification

Three regressions, all wired into `npm run check` (now **10 scripts**):

- `api-validation-regression.mjs` — 33 cases on the upstream trust boundary
- `identity-regression.mjs` — 24 cases on token verification
- `advice-guard-regression.mjs` — 23 cases, 9 refused and 14 taught

On the first:
Every refusal case listed in it is a string that **reached an upstream URL before this pass**:
path traversal, encoded traversal, `&`, `#`, `?`, `%`, `/`, CRLF, over-length, leading dot.

It imports the real validators rather than restating the regexes. A second copy of a security
predicate is worse than none — it passes review while disagreeing with the code that runs.

---

[ox]: https://www.ox.security/blog/vibe-coding-security/
[csa]: https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-generated-code-vulnerability-surge-2026/
[sw]: https://www.securityweek.com/vibe-coded-apps-riddled-with-exploitable-security-flaws/
[gt]: https://news.research.gatech.edu/2026/04/13/bad-vibes-ai-generated-code-vulnerable-researchers-warn
[rl]: https://www.reversinglabs.com/blog/owasp-top-10-for-llm-apps-excessive-agency
[hd]: https://hackerdna.com/blog/owasp-llm-top-10
[res]: https://www.rescana.com/post/llmjacking-how-hackers-exploit-misconfigured-proxies-to-steal-access-to-paid-llm-services-like-open
[thn]: https://thehackernews.com/2026/06/282-ios-apps-found-leaking-llm-api-keys.html
[ndss]: https://www.ndss-symposium.org/wp-content/uploads/ndss26-poster-24.pdf
[arx]: https://arxiv.org/html/2606.12212v2
[fh]: https://www.flowhunt.io/blog/llm-api-security-rate-limiting-auth-abuse-prevention/
[expo]: https://docs.expo.dev/router/web/api-routes/
[ptkd]: https://ptkd.com/journal/how-to-hide-api-keys-in-expo-managed
[rns]: https://reactnative.dev/docs/0.78/security
