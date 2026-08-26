# The backend: what it is, how fast it is, and whether to move it

Written 26 August 2026. The carryover asked for all of it: record what is known, measure
it properly, lay out what moving off EAS Hosting would involve, and only then conclude.
The conclusion is at the bottom, after the evidence, deliberately.

---

## What it is

Three API routes and six shared helpers, served by EAS Hosting from `src/app/api`,
with `web.output: server` in `app.json`.

| Route | Lines | Upstreams |
|---|---|---|
| `market+api.ts` | 879 | Polygon, Alpha Vantage, CBOE |
| `options+api.ts` | 324 | CBOE, marketdata.app, Tradier |
| `chat+api.ts` | 277 | Google Generative Language (Gemini) |

Helpers: `_advice`, `_chain`, `_entitlement`, `_identity`, `_limit`, `_validate`.

Seven upstream hosts in total: `api.polygon.io`, `www.alphavantage.co`, `cdn.cboe.com`,
`api.marketdata.app`, `sandbox.tradier.com`, `generativelanguage.googleapis.com`,
`api.revenuecat.com`.

## How fast it is

Measured against production on 26 Aug, three samples per endpoint, median reported.

| Endpoint | Bytes | p50 | max |
|---|---|---|---|
| `market?action=marks` | 305,713 | **116 ms** | 124 ms |
| `market?action=quote` | 109 | **66 ms** | 66 ms |
| `market?action=chart` | 6,447 | **84 ms** | 505 ms |
| `market?action=news` | 7,245 | **68 ms** | 323 ms |
| `market?action=search` | 437 | **71 ms** | 188 ms |
| `market?action=logo` | 11,296 | **74 ms** | 80 ms |
| `options?action=expirations` | 134 | **293 ms** | 294 ms |

Read those numbers before forming an opinion: **305 KB is served in 116 ms.** Every
route except the options chain answers in under 90 ms at the median, which is faster
than the network latency of the phone calling it. The maxima (505 ms, 323 ms) are cache
misses, not a systemic ceiling. Options is the slowest because it chains three providers
in sequence, CBOE then marketdata then Tradier, and that is its own design, not the
platform's.

### One thing found while measuring

Requests carrying a `Python-urllib` User-Agent get **403**, while `curl` and an
app-shaped UA get **200** on the identical URL. That is edge bot filtering, not
application code: `_limit.ts` refuses with **429**, never 403. Harmless for the app,
but it will silently break any monitoring or synthetic check that uses a default
client UA, and it would have been reported as a broken endpoint by anyone probing it
with a script.

## What moving would involve

Lower than expected, because of how the routes were written.

**Portable already:**
- Handlers are Web standard: `export async function GET(request: Request)` returning
  `Response.json(...)` or `new Response(...)`. That is the same contract Cloudflare
  Workers, Vercel Functions, Deno Deploy and Bun all accept.
- **No Node-only APIs anywhere in `src/app/api`.** No `node:` imports, no `fs`, no
  `__dirname`, no `process.cwd`. Nothing pins these handlers to a Node runtime.
- Secrets are plain environment variables, portable to any host.

**The one genuine piece of work:**
- Rate limiting is a per-isolate `Map` (`_limit.ts:70`), and the file already says so:
  it "inherits the concurrency gap" because each isolate counts separately. Moving hosts
  does not create that problem and does not fix it. It needs a shared store, an HTTP-
  reachable KV or Redis, and that is the same job on any platform.

**What is NOT known and should not be guessed:** EAS Hosting's pricing tiers, request
quotas and bandwidth limits at this app's volume. Nothing in this repo reveals them and
they were not checked against the dashboard. A cost-driven migration argument cannot be
made from anything measured here.

---

## Conclusion

**There is no performance reason to move off EAS Hosting.** Every endpoint the app calls
on a normal screen answers in well under 100 ms at the median, carrying payloads up to
305 KB. The carryover's note that "the market endpoint answers in normal time and is not
the source of the lag" is now measured across all seven endpoints rather than one.

Two things ARE worth doing, and neither requires changing host:

1. **The 305 KB marks payload.** It is fast to serve and still 305 KB of JSON parsed on
   a phone. Slimming it, or fetching only held and watched symbols, is a client-side win
   available today. See `refs/PERF_FINDINGS_20260826.md`.
2. **The shared rate-limit store.** The per-isolate Map is a real gap, documented in the
   code, and it is the only piece of this backend that is genuinely unfinished.

If a migration is ever wanted for reasons other than speed, the routes themselves are
close to free to move. The work is the rate limiter and the deployment plumbing, not the
handlers.
