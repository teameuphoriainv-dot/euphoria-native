# Security review — 2026-08-13

Research into how AI-assisted ("vibe-coded") apps get breached, turned into findings against **this**
codebase. Three defects were found and fixed in the same pass; the rest is recorded honestly,
including the parts that cannot be closed by writing code.

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

**Residual, stated plainly:** the identity is still an unauthenticated header, so rotation still
mints a fresh budget, and the limiter is still per-isolate. This raises the cost of casual abuse and
bounds accidental runaway. It does **not** stop a determined attacker. See F4.

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

### F4 — No authentication on any API route · MEDIUM · **OPEN, by design for now**

`lib/auth.ts:61` — `currentUserId()` returns `null`; there is no session flow. Every route is
therefore open to anyone who knows the URL, and the rate-limit identity is a header the caller
chooses. This is the root cause of F1's residual risk.

It is honest scaffolding rather than a bug — the module exists so the limiter already asks for a real
identity and falls back, making sign-in a keys-and-wiring change rather than a re-architecture. But
it should not be mistaken for a control that exists.

**Plan:** wire Supabase auth (the web app already runs on the same project, so user ids match), then
move the limiter to a Cloudflare Durable Object keyed on the user id. `_limit.ts:19-22` already
records the three upgrade options and notes any of them is a drop-in for `take()`.

### F5 — Prompt injection into Atlas · LOW-MEDIUM · **OPEN, accepted**

OWASP's #1, and structurally bounded here: Atlas has no tools, so the worst case is words, not
actions. The real exposure is **regulatory rather than technical** — the system prompt is the only
thing stopping a coaxed model from giving individualised investment advice to an 18-25 year old in a
finance app, and a system prompt is not a control boundary.

**Plan:** an output check on the completion before it renders, refusing responses that name a
specific security with a buy/sell verb. Cheap, and it converts a prompt-level hope into a code-level
rule. Not done in this pass — it is copy-adjacent and needs the owner's wording under §0.7.

### F6 — In-memory limiter is per-isolate · MEDIUM · **OPEN, documented**

On EAS Hosting these routes are Cloudflare Workers; `buckets` is per-isolate, so two requests on two
isolates each see a fresh bucket. Already stated in `_limit.ts:11-22`. Same fix as F4.

---

## 4. The plan, in order

| # | action | closes | blocked on |
|---|---|---|---|
| 1 | ~~Validate every value that reaches an upstream URL~~ | F2, F3 | **done** |
| 2 | ~~Daily cost cap on the LLM proxy~~ | F1 | **done** |
| 3 | Output filter on Atlas completions (no named security + buy/sell verb) | F5 | owner's wording (§0.7) |
| 4 | Wire Supabase auth, move limiter identity to the user id | F4 | Supabase keys |
| 5 | Move `take()` to a Durable Object keyed on that identity | F1, F4, F6 | step 4 |
| 6 | Set `GEMINI_API_KEY` quota/billing alerts provider-side | F1 defence-in-depth | Google Cloud console access |

Steps 4 and 5 are the ones that actually close the class. 1–2 raise the cost of abuse; they do not
end it, and this document should not be cited as if they do.

---

## 5. Verification

`scripts/api-validation-regression.mjs` — 33 cases, wired into `npm run check` (now 9 scripts).
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
