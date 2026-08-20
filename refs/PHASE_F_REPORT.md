# Phase F — stock logos and delayed market data

Worked 2026-08-20, source-and-API only (a second session held the simulator). Every number here
was measured against the running dev server, not assumed. Where a claim was made and later
disproved, the retraction is kept rather than edited away.

---

## 0. The headline

Three separate things were wrong, and the reported symptom pointed cleanly at only one of them:

1. **Rate limiting** — real, and the cause of "only NVDA has a logo". Confirmed for 4 of 7.
2. **A 429 mislabelled as "no logo"** — a pre-existing bug that made rate limiting look like
   missing data, and which produced a false finding in this very audit.
3. **A chart 22 days stale under a "past month" header** — caused by our own query, not the plan.

All three are fixed. A fourth, `movers` being plan-gated, is reported and not fixed.

---

## 1. TASK 1 — diagnosis

The hypothesis on entry was Polygon's free tier at 5 requests/minute: seven logo rows mount at
once, NVDA wins, the rest are rate-limited and fall back to the lettered badge.

**Measured, seven Mag-7 rows against `/api/market?action=logo`:**

| symbol | status | bytes | content-type | time |
|---|---|---|---|---|
| AAPL | 200 | 28,756 | image/png | 0.29s |
| NVDA | 200 | 11,296 | image/jpeg | 0.11s |
| TSLA | 404 | 19 | application/json | 0.11s |
| MSFT | 429 | 24 | application/json | 1.81s |
| AMZN | 429 | 24 | application/json | 1.70s |
| META | 429 | 24 | application/json | 1.73s |
| GOOG | 429 | 24 | application/json | 1.71s |

**The hypothesis held for 4 of 7, not 7 of 7.** AAPL and NVDA already worked — the earlier
WebP→PNG transcode had fixed them. The 429 is Polygon's, not our own guard: `market+api.ts:141`
logs `RATE LIMITED by upstream, not an outage`, and the local guard allows 60/min while this test
made 7 calls.

## 2. The bug the diagnosis uncovered

`if (!img.ok) return no_logo` conflated **a 429 on the asset fetch** with **the company having no
branding**. TSLA returned `404 no_logo` on one pass and `200` with **13,405 bytes of art** on a
later pass; nothing about TSLA changed between them except the quota.

> **RETRACTED.** An earlier note in this audit called TSLA "a genuine coverage gap" on the strength
> of that 404. It was not a coverage gap. It was a mislabelled rate limit. The final manifest
> records **92 symbols, 92 `ok`, 0 `no_art`** — not one symbol tried lacks branding.

Fixed: 429 and 5xx throw and stay uncached; only a real 404/410 counts as "no art". This matters
more once results are cached, because a transient failure stored as a miss would blank a real logo
for the whole TTL.

## 3. An approach of mine that the measurement overturned

A server-side byte cache was built first — positive entries, negative entries, in-flight dedupe.
Then it was tested:

> AAPL returned 200 twice, then **429 on five consecutive calls a minute later**. With a 24-hour
> in-memory entry that is impossible.

**The route module is re-evaluated per request, so the Map is empty every time.** Workers isolates
in production are equally short-lived. The cache is kept — it is cheap and correct where a process
survives several requests — but the code now states that it is **not demonstrated to fix cold
starts**, and it is not quoted as having solved the 429s.

The only thing that removes a cold-start network call is bytes already on disk.

## 4. TASK 2 — the durable fix

`scripts/fetch-logos.mjs` writes `assets/logos/<SYM>.png` plus a generated static require map
(Metro cannot require a computed path).

- **`--via-proxy`** fetches through the running dev server, so the script **never touches a
  credential** and gets the same transcoded bytes the app would.
- **Resumable**: skips what is on disk, so an interrupted run costs no quota.
- **Separates transient from permanent**: a 429 is never recorded; only a real 404/410 is. Its
  `--selftest` asserts that six ways, because collapsing those two is exactly the bug in §2.
- `scripts/fetch-logos-all.sh` loops until nothing is deferred, with a cooldown and a pass cap.

**Result: 92 logos bundled, 1.50MB.**

### Two mistakes made while doing it

**Pacing ran at double the limit.** `--via-proxy` makes ONE request that costs TWO Polygon calls
internally, but the gap was 13s for both modes — about 9.2 calls/min against a 5/min ceiling. A
67-symbol pass wrote **zero**. It had hidden on a 24-symbol batch where 12 of 24 still got
through. Gap is now per-mode: 26s via proxy, 13s direct.

**The background launch killed its own worker.** `nohup … &` inside a completing Bash call gets
the node child reaped while the bash wrapper survives, producing instant empty passes — wrapper
alive in `pgrep`, node absent. Isolating it proved fetcher (52s/2 symbols), command (52s) and
wrapper (53s) were all correct; only the launch was wrong.

### Bundle size

These are badges drawn at 44pt (56pt at most), so 168px covers @3x. Polygon re-serves whatever the
company uploaded — NVDA arrived at 62,996 bytes. Capped at 192px on the long edge, `fit: inside`,
`withoutEnlargement`:

| stage | size |
|---|---|
| first 33 files, unresized | 1.66MB |
| after resize | 0.50MB (**70% smaller**) |
| all 92, 45 unresized | 3.29MB |
| after re-normalising | **1.50MB** (**54% smaller**) |

### The ceiling on bundling, stated plainly

`TickerLogo` also renders in `search.tsx` and `movers.tsx`, which surface **arbitrary** tickers.
Bundling can never cover that universe. Those keep the proxy path, and the lettered badge remains
the floor under both. Bundling is a large improvement to the common case, not a complete solution.

## 5. TASK 4 — delayed market data

**The answer is "you already have it", with one exception that was our own fault.**

`quote` reads `/v2/aggs/ticker/{sym}/prev` — the previous session's aggregate. Measured freshness
by decoding the returned timestamps:

| range | bar span | last bar | stale |
|---|---|---|---|
| `1D` | 5-minute | 2026-08-19 23:59 | **0 days** |
| `1Y` | daily | 2026-08-19 | **1 day** |
| `1M` | **hourly** | 2026-07-29 19:00 | **22.1 days** |

So the plan is fine and the data is current. The 1M call asked for the 30 days ending now and got
95 bars covering 2026-07-21 to 2026-07-29 — the **first eight days of the window and nothing
after**. Results starting exactly at the range start is truncation, and the query used `sort=asc`,
so **the cut fell on the recent end**. `next_url` was never followed.

**Fixed in two steps, each re-measured with the identical call:**

| version | points | last bar | stale | span covered |
|---|---|---|---|---|
| baseline `sort=asc` | 95 | 2026-07-29 | 22.10d | 8.0d |
| `sort=desc` + reverse | 125 | 2026-08-19 | 0.94d | ~9d |
| **+ `next_url` follow** | **302** | 2026-08-19 | **0.95d** | **26.5d** |

The follow is capped at 2 extra pages and stops early once the oldest bar reaches the window
start, so a chart costs at most three calls — spending a chart's whole budget on backfill is what
starves the logo and quote calls sharing the same ceiling.

### `quote` discarded the one field that says "when"

`/prev` returns the bar timestamp and the handler dropped it, returning only
`{sym, price, change, changePct}`. **Nothing downstream could tell a live price from a three-week-
old one**, so the UI had no way to caveat it even if it wanted to. `asOf` added; measured
`2026-08-19 20:00 UTC`, 1.08 days old.

Also documented, not changed: `change` is the prior session's **open-to-close** move, not
previous-close-to-close. Defensible as "that day's change", but not what a day-over-day ticker
implies, so it is written down rather than left to be rediscovered.

## 6. Found and NOT fixed — `movers` is plan-gated

`action=movers` returns **HTTP 501 `{"error":"plan_required"}`**. The Polygon snapshot endpoint is
not on this tier.

`movers.tsx:47` reads `if (!loading && (data?.length ?? 0) === 0) return null;` — so on 501 the
component renders **nothing**. It does not crash and does not error. **A whole section of the
Trade tab is silently absent**, and nothing anywhere surfaces that. This is a dashboard/plan
decision, not a code fix, which is why it is reported rather than worked around.

It also removes the obvious licence-clean way to enumerate tickers by volume, which is why the
bundled set was chosen as a large-cap list rather than derived from live volume.

## 7. Open items

- **`next_url` beyond 2 pages.** 1M now covers 26.5 days of a 30-day window. Closing the last few
  days costs more calls against a 5/min ceiling; the cap was chosen deliberately.
- **Surfacing `asOf` in the UI.** The field exists; nothing displays it yet.
- **Coverage beyond 92.** Search and movers remain proxy-dependent by nature.
- **Trade tab News card.** The plan flags the News/Options/Search tri-card as redundant against
  the MARKET NEWS feed directly below it. Not started.
- **Nothing here was seen rendering.** All of this was verified by HTTP status, byte counts and
  decoded timestamps. The bundled logos have NOT been observed on a device, because the simulator
  was held by another session. That verification is outstanding and should not be assumed.
