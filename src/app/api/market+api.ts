/**
 * Market data proxy — Polygon.io.
 *
 * Same reason as `chat+api.ts`: the key must never reach the bundle. It also means the client
 * cannot be rate-limited into someone else's quota, and one place decides how a timeframe maps to
 * an aggregate window.
 *
 * The web app (`euphoriaweb-current/supabase/functions/polygon-market-data`) already proxies these
 * exact endpoints against the same `POLYGON_API_KEY`; this is the Expo-native equivalent so the
 * app does not need a Supabase dependency for read-only market data.
 *
 * Actions:
 *   ?action=search&q=apple        -> every matching US ticker (this is what makes "search the NYSE" real)
 *   ?action=quote&sym=AAPL        -> last close, previous close, change
 *   ?action=chart&sym=AAPL&range=1M
 *   ?action=news&sym=AAPL         -> recent articles for a ticker
 *
 * Without POLYGON_API_KEY every action answers 503 `not_configured`. The client treats that as
 * "no live data" and falls back to the static table — it must NEVER dress static numbers up as
 * live quotes.
 */

import { guard } from './_limit';
import { mayCarryKey, symbol, withKey } from './_validate';

const BASE = 'https://api.polygon.io';

/**
 * Timeframe -> aggregate window.
 *
 * All three reference apps (TradingView $2.25M, Bloom, Yahoo Finance) put a horizontal range row
 * under the chart, and all three recompute the change figure for the selected range. The bar size
 * has to scale with the window or a 5Y request asks for ~1800 daily bars to draw 300 pixels.
 *
 * NOTE ON 1H: none of the three exposes a one-hour RANGE — Yahoo's shortest is 24H, and its
 * "1 hour" is a bar INTERVAL. It is included because it was asked for, and because minute
 * aggregates make it cheap, but outside market hours it returns almost nothing. The client says so
 * rather than drawing an empty box.
 */
const RANGES = {
  '1H': { mult: 1, span: 'minute', days: 1 / 24, label: 'past hour' },
  '1D': { mult: 5, span: 'minute', days: 1, label: 'today' },
  '1W': { mult: 30, span: 'minute', days: 7, label: 'past week' },
  // Robinhood's published intervals (robinhood.com/support/articles/using-the-charts):
  // 1D -> 5-10min, 1W -> 10-30min, 1M -> 1 HOUR. Ours had 1M on daily bars, which draws ~22
  // points for a month and reads as blocky next to the smooth 1W.
  '1M': { mult: 1, span: 'hour', days: 30, label: 'past month' },
  '3M': { mult: 1, span: 'day', days: 90, label: 'past 3 months' },
  YTD: { mult: 1, span: 'day', days: 0, label: 'year to date' },
  '1Y': { mult: 1, span: 'day', days: 365, label: 'past year' },
  '5Y': { mult: 1, span: 'week', days: 365 * 5, label: 'past 5 years' },
} as const;

export type RangeKey = keyof typeof RANGES;

/** ms since epoch for the start of the window. YTD is Jan 1 of the current year, not N days back. */
function fromMs(range: RangeKey): number {
  const now = Date.now();
  if (range === 'YTD') return new Date(new Date(now).getFullYear(), 0, 1).getTime();
  return now - RANGES[range].days * 86_400_000;
}

/*
 * OUTBOUND PACING — what it can and cannot do.
 *
 * The 429 below was already CLASSIFIED correctly, but nothing ever stopped us causing it. A cold
 * stock screen costs quote + stats + chart + news; fired together that is four calls in one tick
 * against a five-per-minute ceiling, so the last ones fail and the user sees "missing data" for a
 * stock that exists. Measured 2026-08-17: five tickers in a row returned 200, the next ten
 * returned 429, and after a 65s wait NVDA/AAPL/SPY resolved fine. Nothing was missing — we simply
 * asked too fast.
 *
 * HONEST LIMIT: no client-side code turns 5/min into more than 5/min. This does two things only —
 * stops us racing ourselves, and converts one transient 429 into a slower success instead of a
 * hard failure. The ceiling is real and only a paid plan removes it.
 *
 * ponytail: module-scoped chain, single process. On a serverless isolate this paces the calls
 * WITHIN one request (the burst that actually causes the 429) and cannot pace across concurrent
 * isolates. That is the 80% case; a shared limiter needs a store, and needs the traffic to justify it.
 */
/*
 * LOGO BYTE CACHE — the only thing that actually removes the 429s.
 *
 * MEASURED 2026-08-20, seven Mag-7 rows against the live endpoint: AAPL 200 (28,756B png),
 * NVDA 200 (11,296B jpeg), TSLA 404, and MSFT/AMZN/META/GOOG all 429 at ~1.7s each. The pacer
 * above already stops us racing ourselves and it is honest that nothing turns 5/min into more
 * than 5/min. So the fix is not to ask faster or slower -- it is to STOP ASKING.
 *
 * Before this, the only caching was a `Cache-Control: max-age=86400` header, which delegates the
 * whole problem to whichever client happens to be asking. A cold app start with an empty image
 * cache mounts every row at once and pays full price again.
 *
 * NEGATIVE ENTRIES MATTER MORE THAN POSITIVE ONES. TSLA has no branding record at Polygon and
 * never will, yet every mount spent a rate-limit slot to be told 404 again -- quota burned on a
 * guaranteed negative, which is what starves the tickers that DO have art. A 404 is cached here
 * exactly like a hit.
 *
 * IN-FLIGHT DEDUPE: seven rows mount in the same tick, so seven identical requests would each
 * miss an empty cache and each hit upstream. Sharing one promise per symbol collapses that burst
 * to one call, which is the burst that caused the 429 in the first place.
 *
 * MEASURED LIMIT -- READ THIS BEFORE TRUSTING THE CACHE. 2026-08-20, against the Expo dev
 * server: AAPL returned 200 twice, then 429 on five consecutive calls a minute later. With a
 * 24h in-memory entry it should have been an instant hit forever. It was not, so THIS PROCESS
 * RE-EVALUATES THE ROUTE MODULE PER REQUEST and the Map is empty every time. Production runs on
 * Workers isolates, which are equally short-lived and share nothing.
 *
 * So this layer is a genuine win only where a process survives several requests, and it is NOT
 * the fix for a cold start -- that needs bytes that never require a network call at all, i.e.
 * bundled assets. Kept because it is cheap, correct, and strictly better than nothing; do not
 * quote it as having solved the 429s, because it has not been shown to.
 *
 * ponytail: module-scoped Map, single process, no eviction beyond TTL. Logos change about never
 * and the universe is a few hundred tickers, so bounded growth is fine. A shared store needs
 * traffic to justify it.
 */
type LogoHit = { body: Uint8Array; type: string } | { miss: true };
const LOGO_TTL_MS = 86_400_000;
const logoCache = new Map<string, { at: number; val: LogoHit }>();
const logoInflight = new Map<string, Promise<LogoHit>>();

function logoCached(sym: string): LogoHit | undefined {
  const e = logoCache.get(sym);
  if (!e) return undefined;
  if (Date.now() - e.at > LOGO_TTL_MS) {
    logoCache.delete(sym);
    return undefined;
  }
  return e.val;
}

function logoStore(sym: string, val: LogoHit) {
  logoCache.set(sym, { at: Date.now(), val });
  return val;
}

/**
 * Serve a cached logo result, positive or negative. Builds its own Response rather than calling
 * `fresh()`, which is scoped inside the request handler and not visible at module level.
 */
function logoResponse(val: LogoHit) {
  if ('miss' in val) {
    return new Response(JSON.stringify({ error: 'no_logo' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  return new Response(new Uint8Array(val.body), {
    headers: { 'Content-Type': val.type, 'Cache-Control': 'public, max-age=86400' },
  });
}

const MIN_GAP_MS = 250;
let chain: Promise<unknown> = Promise.resolve();
let lastAt = 0;

function paced<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const wait = Math.max(0, lastAt + MIN_GAP_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastAt = Date.now();
    return fn();
  });
  // Keep the chain alive after a rejection, or one failure stalls every later call.
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function poly(path: string, key: string) {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}apiKey=${key}`;
  let res = await paced(() => fetch(url));
  if (res.status === 429) {
    // One retry, then give up and let the caller surface `rate_limited` honestly. Retrying
    // harder on a per-minute quota just spends the next minute's budget too.
    await new Promise((r) => setTimeout(r, 1500));
    res = await paced(() => fetch(url));
  }
  if (!res.ok) {
    // Polygon echoes the key back in some error payloads. Log, never forward.
    const body = (await res.text()).slice(0, 300);
    /*
     * 403 IS OUR PLAN, NOT THEIR OUTAGE.
     *
     * Measured 2026-08-13: the free tier answers `/v2/snapshot/.../gainers` with
     * `403 NOT_AUTHORIZED — "You are not entitled to this data."` The key is valid and every other
     * action on it works; this one endpoint simply is not included.
     *
     * Reported as a generic `502 upstream` that reads as "Polygon is down", which sends the next
     * person to check the key and the network — neither of which is wrong. Third time today the
     * same shape has bitten: a retired Gemini model as a 502, an Alpha Vantage throttle as an empty
     * array, and now a plan limit as an outage. **A refusal we caused must not be reported as a
     * failure they caused.**
     */
    if (res.status === 403) {
      console.error('[market] PLAN LIMIT, not an outage:', path.split('?')[0], body);
      throw new Error('plan_required');
    }
    /*
     * FOURTH TIME, and the same shape as the three above. Polygon's free tier allows **5 requests
     * per minute** — measured 2026-08-14, ten calls in a row returned 200 200 200 200 200 then five
     * 429s with "You've exceeded the maximum requests per minute". We were turning that into a
     * generic `502 upstream`, so the app told the user something had BROKEN when the truth is that
     * we asked too often, and the client had no way to tell the two apart and back off.
     *
     * 5/minute is also why the response cache added alongside this matters more than it looks: a
     * single stock screen costs quote + stats + chart + news, so uncached that is roughly ONE USER
     * PER MINUTE for the entire app. Cached, origin traffic is bounded by distinct URLs instead.
     */
    if (res.status === 429) {
      console.error('[market] RATE LIMITED by upstream, not an outage:', path.split('?')[0]);
      throw new Error('rate_limited');
    }
    console.error('[market] upstream', res.status, body);
    throw new Error(`upstream_${res.status}`);
  }
  return res.json();
}

export async function GET(request: Request) {
  /*
   * CACHE POLICY, made explicit. This route previously sent NO Cache-Control at all, which left
   * every response — including refusals — on EAS Hosting's default GET caching, whose TTL nobody
   * had ever read (§9.2). A cached `501 plan_required` or a cached `502` serves an outage to every
   * user until it expires, long after the upstream recovered; §4 records exactly that happening
   * when a live options route served a stale 503 for an hour.
   *
   * Successes are safe to cache: this data is delayed by construction (`quote` and `stats` are
   * built from Polygon's PREVIOUS-day aggregate), so 15 minutes is not meaningfully staler than
   * fresh. Errors are never cached.
   */
  const cached = (body: unknown) =>
    Response.json(body, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' },
    });
  const fresh = (body: unknown, status: number) =>
    Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? '';

  // Gated BEFORE the key check, so an unconfigured build still cannot be used as a free load
  // generator. (An older note here said search "bursts on every keystroke" — it does not:
  // `app/search.tsx` debounces 250ms and guards out-of-order responses.)
  /*
   * BUDGETS SIZED AGAINST THE UPSTREAM, not against a round number.
   *
   * Security review 2026-08-14: these were 120/min general, 60/min search, 200/min logo — while
   * POLYGON'S ENTIRE FREE TIER IS 5 REQUESTS PER MINUTE, shared across every user of the app (see
   * `poly()` above, measured). Our own ceiling was twenty-four times the upstream's total capacity,
   * so a caller could exhaust the quota for everybody while staying comfortably inside what we
   * explicitly allowed. Varying `sym` defeats the response cache, so each request is a fresh
   * origin call.
   *
   * WHAT THESE NUMBERS CAN AND CANNOT DO. They bound one identity. They CANNOT protect a shared
   * upstream quota, because an attacker rotating `x-euphoria-install` gets a fresh bucket every
   * time (see `_limit.ts`) — that needs a shared counter, which needs a credential this app does
   * not yet have. What they do is stop an honest client from self-inflicting: a retry loop, a stuck
   * effect, a user hammering refresh.
   *
   * Sized from real use rather than guessed. One stock screen costs four calls (quote, stats, chart,
   * news). Search is debounced 250ms client-side with out-of-order guarding (`app/search.tsx`), so
   * active typing is a handful a minute, not one per keystroke. Logos are cached for 24 hours.
   */
  const gate = await (action === 'search'
    ? guard(request, 'market:search', 20, 60_000)
    : action === 'logo'
      ? guard(request, 'market:logo', 60, 60_000)
      : guard(request, 'market', 30, 60_000));
  if (gate) return gate;

  const key = process.env.POLYGON_API_KEY;
  const av = process.env.ALPHAVANTAGE_API_KEY;

  /*
   * THE KEY CHECK MOVED, AND THAT IS THE POINT.
   *
   * It used to sit here and refuse EVERY action without `POLYGON_API_KEY` — including `news`, which
   * is the one action with a second, independent provider. Alpha Vantage can serve news alone, and
   * it is the PREFERRED source because it is the only one carrying a sentiment score. So an install
   * holding an Alpha Vantage key and no Polygon key got a 503 without the route ever looking at the
   * provider it prefers: a working path made unreachable by a guard one line too early.
   *
   * `news` is therefore dispatched FIRST, below, and the Polygon refusal sits after it.
   */

  try {
    if (action === 'news') {
      const sym = symbol(url.searchParams.get('sym'));

      /*
       * ALPHA VANTAGE FIRST, POLYGON AS FALLBACK.
       *
       * Alpha Vantage NEWS_SENTIMENT is what the web app already uses
       * (euphoriaweb-current/supabase/functions/fetch-economic-news, line 100) and it returns
       * something Polygon does not: a SENTIMENT SCORE per article. For an app teaching people to
       * read markets, "this story is bearish on NVDA" is the teachable part — a headline alone is
       * just a headline.
       *
       * Its free tier is 25 requests/day, which is why the web app caches for six hours. That is
       * also why Polygon backs it up: Polygon news rides the key we already have and is not
       * day-capped, so the feed degrades to headlines rather than to nothing.
       */
      if (av) {
        try {
          const q = sym
            ? `function=NEWS_SENTIMENT&tickers=${sym}&limit=12`
            : 'function=NEWS_SENTIMENT&topics=economy_macro,finance&limit=12';
          const r = await fetch(`https://www.alphavantage.co/query?${q}&apikey=${av}`);
          const j = await r.json();
          const feed = (j?.feed ?? []) as Record<string, unknown>[];
          /*
           * SAY WHY, instead of falling through in silence.
           *
           * Alpha Vantage answers `200 { "Information": "..." }` for a throttled or premium-gated
           * call — never an error status. This branch treated that as "no news" and dropped to
           * Polygon, so a REFUSAL and a genuinely quiet news day produced the identical empty array.
           * Measured 2026-08-13: the same key returns 50 articles from a laptop and nothing from the
           * deployed Worker, and there was no way to tell throttling from absence without this line.
           * AV rate-limits by IP as well as by key, and Workers egress from shared addresses.
           */
          if (feed.length === 0) {
            const why = j?.Information ?? j?.Note ?? j?.['Error Message'];
            if (why) console.error('[market] alphavantage refused:', String(why).slice(0, 200));
          }
          if (feed.length > 0) {
            return cached({
              articles: feed.map((a) => ({
                id: String(a.url),
                title: a.title,
                publisher: a.source,
                url: a.url,
                // Alpha Vantage stamps time as YYYYMMDDTHHMMSS, which `new Date()` cannot parse.
                published: String(a.time_published ?? '').replace(
                  /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/,
                  '$1-$2-$3T$4:$5:$6Z',
                ),
                sentiment: Number(a.overall_sentiment_score) || 0,
                sentimentLabel: String(a.overall_sentiment_label ?? ''),
                // Alpha Vantage sends `banner_image: ""` for a good share of the feed. Normalise
                // the empty string to undefined here so no consumer has to know that quirk, and
                // so `a.image ? ...` is a truthful test rather than a truthy-empty trap.
                image: String(a.banner_image ?? '').trim() || undefined,
              })),
            });
          }
        } catch (e) {
          // Day-cap or outage: fall through to Polygon rather than failing the screen.
          console.error('[market] alphavantage failed, falling back', e);
        }
      }

      // Alpha Vantage was tried and gave nothing. Without a Polygon key there is no second
      // provider to fall back TO, so answer an empty feed rather than calling `poly` with an
      // undefined key — which would 401 upstream and surface as a generic failure the screen
      // cannot explain. An empty list is a state the UI already renders honestly.
      if (!key) return cached({ articles: [] });

      const d = await poly(`/v2/reference/news?${sym ? `ticker=${sym}&` : ''}order=desc&limit=12`, key);
      return cached({
        articles: (d.results ?? []).map((a: Record<string, unknown>) => ({
          id: a.id,
          title: a.title,
          publisher: (a.publisher as { name?: string } | undefined)?.name ?? '',
          url: a.article_url,
          published: a.published_utc,
          image: String(a.image_url ?? '').trim() || undefined,
        })),
      });
    }

    // Polygon backs every remaining action. `news` is handled ABOVE precisely because it has a
    // second provider and must stay reachable on an Alpha Vantage key alone; everything below
    // genuinely cannot run without Polygon, so it refuses here rather than at six call sites.
    if (!key) return fresh({ error: 'not_configured' }, 503);

    if (action === 'search') {
      const q = (url.searchParams.get('q') ?? '').trim();
      if (q.length < 1) return cached({ results: [] });
      const d = await poly(
        `/v3/reference/tickers?search=${encodeURIComponent(q)}&market=stocks&active=true&limit=20`,
        key,
      );
      return cached({
        results: (d.results ?? []).map((r: Record<string, unknown>) => ({
          sym: r.ticker,
          name: r.name,
          exchange: r.primary_exchange ?? '',
        })),
      });
    }

    if (action === 'quote') {
      const sym = symbol(url.searchParams.get('sym'));
      if (!sym) return fresh({ error: 'sym_required' }, 400);
      const d = await poly(`/v2/aggs/ticker/${sym}/prev?adjusted=true`, key);
      const bar = d.results?.[0];
      if (!bar) return fresh({ error: 'no_data' }, 404);
      const change = bar.c - bar.o;
      /*
       * `asOf` EXISTS BECAUSE A STALE PRICE LOOKED EXACTLY LIKE A LIVE ONE.
       *
       * This endpoint reads `/prev`, the previous session's aggregate, and used to return only
       * price and change -- discarding `bar.t`, the one field that says WHEN. Nothing downstream
       * could tell a quote from this morning apart from one three weeks old, so the UI had no way
       * to caveat it even if it wanted to. Measured on the sibling chart endpoint the same day: a
       * span that claimed "past month" was serving bars 22 days old, and nothing anywhere said so.
       *
       * Note `change` is the prior session's OPEN-to-CLOSE move, not previous-close-to-close. That
       * is a defensible definition of "that day's change" but it is not the one a day-over-day
       * ticker implies, so it is written down here rather than left to be rediscovered.
       */
      return cached({
        sym,
        price: bar.c,
        change,
        changePct: bar.o ? (change / bar.o) * 100 : 0,
        asOf: bar.t ?? null,
      });
    }

    if (action === 'chart') {
      const sym = symbol(url.searchParams.get('sym'));
      const range = (url.searchParams.get('range') ?? '1M') as RangeKey;
      if (!sym) return fresh({ error: 'sym_required' }, 400);
      if (!RANGES[range]) return fresh({ error: 'bad_range' }, 400);
      const { mult, span, label } = RANGES[range];
      /*
       * SORT DESC, THEN REVERSE — because truncation has to lose the OLDEST bars, not the newest.
       *
       * MEASURED 2026-08-20 with `sort=asc`: the 1M chart, which draws HOURLY bars, asked for the
       * 30 days ending now and came back with 95 bars running 2026-07-21 to 2026-07-29 -- the
       * first eight days of the window and nothing after. Its most recent point was 22 DAYS OLD
       * while the header said "past month". The same call on other spans was fine: 1D (5-minute)
       * ended 2026-08-19 23:59, 1Y (daily) ended 2026-08-19. So the data is current and only this
       * span was truncated.
       *
       * The response is capped somewhere upstream and `next_url` was never followed, so with
       * ascending order the cut fell on the recent end. Descending means the cut falls on the
       * distant end instead: a chart missing its oldest week is barely visible, whereas one
       * missing its last three weeks is simply wrong, and wrong while claiming otherwise.
       *
       * Reversed back to ascending before returning, because every consumer draws left-to-right.
       */
      const from = Math.floor(fromMs(range));
      const d = await poly(
        `/v2/aggs/ticker/${sym}/range/${mult}/${span}/${from}/${Date.now()}?adjusted=true&sort=desc&limit=5000`,
        key,
      );

      /*
       * FOLLOW next_url, BUT ONLY FAR ENOUGH TO COVER THE RANGE.
       *
       * Sorting descending fixed the freshness bug -- the newest bars now always arrive -- but the
       * response is still capped upstream, so 1M came back with about nine days of hourly bars
       * under a "past month" label. The rest is on `next_url`, which nothing was following.
       *
       * WHAT THE CAP ACTUALLY IS, measured 2026-08-20 rather than assumed. The obvious theory was
       * a result-count limit, which coarser bars would sidestep. They do not:
       *
       *   1 x hour   125 points   9.5 day span
       *   2 x hour    70 points   9.5 day span
       *   4 x hour    39 points   9.5 day span
       *
       * Identical coverage at a third of the points, so the ceiling is a TIME WINDOW of roughly
       * 9.5 days of intraday aggregate per request, not a row count. Pagination is the only thing
       * that extends it, at about 8.5 days per extra call.
       *
       * WHY THE CAP STAYS AT 2. Raising it was measured too: at 5 the loop stopped early on its
       * own coverage check at 28.6 days and 336 points, so THREE pages is all the range can use.
       * That buys 26.5 -> 28.6 days for one more request. A stock screen already spends a chart
       * plus a quote, so a fourth chart call makes ONE screen view consume the entire
       * five-per-minute budget -- and that budget is shared with the logo and marks calls this
       * app depends on. Two extra pages is where the curve stops being worth it.
       *
       * Daily bars would cover the full month in a single call, and 1M used to use them. It was
       * moved to hourly deliberately (see RANGES) because ~21 points draws a chunky line. That
       * trade is still the right one; this comment exists so the next person does not re-derive
       * it from scratch.
       *
       * Best-effort by design: any failure breaks the loop and returns what we already have,
       * because a partial chart drawn from real bars beats an error page.
       */
      const MAX_PAGES = 1;
      const bars = [...((d.results ?? []) as { t: number; c: number }[])];
      let next = d.next_url as string | undefined;
      for (let page = 0; page < MAX_PAGES; page++) {
        if (!next) break;
        // Oldest bar so far. Descending order means the tail is the far end of the window.
        if ((bars[bars.length - 1]?.t ?? Infinity) <= from) break;
        if (!mayCarryKey(next)) {
          console.error('[market] refused to key a non-Polygon next_url');
          break;
        }
        try {
          const r = await paced(() => fetch(withKey(next as string, key)));
          if (!r.ok) break;
          const nd = (await r.json()) as { results?: { t: number; c: number }[]; next_url?: string };
          if (!nd.results?.length) break;
          bars.push(...nd.results);
          next = nd.next_url;
        } catch {
          break;
        }
      }

      const points: { t: number; c: number }[] = bars
        .filter((b) => b.t >= from)
        .map((b) => ({ t: b.t, c: b.c }))
        .reverse();
      return cached({ sym, range, label, points });
    }

    if (action === 'logo') {
      /*
       * Company branding. Polygon's ticker-details response carries `branding.icon_url` and
       * `logo_url`, but those asset URLs THEMSELVES require the key appended — which is exactly
       * why this cannot be done from the client. The proxy fetches the image and re-serves the
       * bytes, so the key never leaves the server and the app gets a plain cacheable URL.
       */
      const sym = symbol(url.searchParams.get('sym'));
      if (!sym) return fresh({ error: 'sym_required' }, 400);

      const hit = logoCached(sym);
      if (hit) return logoResponse(hit);
      const flying = logoInflight.get(sym);
      if (flying) return logoResponse(await flying);

      const work = (async (): Promise<LogoHit> => {
      const d = await poly(`/v3/reference/tickers/${sym}`, key);
      const brand = (d.results?.branding ?? {}) as { icon_url?: string; logo_url?: string };
      const src = brand.icon_url ?? brand.logo_url;
      if (!src) return { miss: true };

      /*
       * The URL came out of an upstream response, not from the caller — which is exactly what makes
       * it easy to trust by accident. It is still a URL from somewhere else, and the next line
       * staples our Polygon key to it. Allowlist the host before that happens: if a branding record
       * ever points elsewhere, we decline instead of paying a stranger's server a credential.
       */
      if (!mayCarryKey(src)) {
        console.error('[market] refused to key a non-Polygon logo host', src.slice(0, 120));
        return { miss: true };
      }
      const img = await fetch(withKey(src, key));
      /*
       * A FAILED IMAGE FETCH IS NOT THE SAME AS "NO LOGO", AND CONFLATING THEM IS A REAL BUG.
       *
       * This read `if (!img.ok) return no_logo` -- so a 429 on the ASSET fetch reported the
       * company as having no branding at all. MEASURED 2026-08-20: TSLA returned 404 no_logo on
       * one pass and 200 with 13,615 bytes of art on a later pass. Nothing about TSLA changed
       * between them; the first pass was rate-limited and mislabelled. An earlier note in this
       * audit called TSLA "a genuine coverage gap" on the strength of that 404. It was not.
       *
       * It matters more now that outcomes are cached: a transient 429 stored as a miss would
       * blank a real logo for the whole TTL, which is exactly the failure the cache exists to
       * prevent. So separate them -- 429 and 5xx throw and stay uncached, and only a genuine
       * 404/410 from the asset host counts as "this company has no art".
       */
      if (img.status === 429 || img.status >= 500) {
        console.error('[market] logo asset fetch transient', sym, img.status);
        throw new Error('rate_limited');
      }
      if (!img.ok) return { miss: true };

      /*
       * TRANSCODE WEBP, BECAUSE iOS CANNOT DECODE IT AND FAILS SILENTLY.
       *
       * Measured on device 2026-08-19, same endpoint, same screen:
       *   NVDA -> image/jpeg 400x400  -> renders
       *   AAPL -> image/webp 800x800  -> renders as the lettered badge
       *
       * Polygon re-serves whatever asset the company uploaded, so the format varies per ticker
       * and nothing about the ticker predicts it. React Native's <Image> decodes WebP on Android
       * (Fresco) but NOT on iOS, so the fetch succeeds, the decode fails, `onLoad` never fires,
       * and TickerLogo correctly leaves the badge up. Nothing logs, because nothing errored --
       * the component is doing exactly what it was designed to do with bytes it cannot read.
       * That is why this looked like "no logo for AAPL" rather than a format bug.
       *
       * Fixing it here rather than in the client is deliberate: `expo-image` would also decode
       * WebP, but it is a NATIVE module, so it costs a dev-client rebuild and only fixes iOS.
       * `sharp` is already a dependency and the proxy already has the bytes in hand, so one
       * transcode fixes iOS, Android and web at once with no app rebuild.
       *
       * Everything else passes through untouched -- JPEG and PNG already decode everywhere, and
       * re-encoding them would cost CPU to produce a worse image.
       */
      const upstreamType = img.headers.get('Content-Type') ?? 'image/png';
      /*
       * Read the body ONCE, before branching. `arrayBuffer()` consumes the stream, so a
       * transcode that reads it and then throws would leave the fallback re-serving an
       * already-drained body -- an empty 200, which is worse than the WebP it replaced.
       */
      const raw = Buffer.from(await img.arrayBuffer());

      if (/webp|avif/i.test(upstreamType)) {
        try {
          const sharp = (await import('sharp')).default;
          const png = await sharp(raw).png().toBuffer();
          return { body: new Uint8Array(png), type: 'image/png' };
        } catch (e) {
          // A transcode failure must not become a broken image. Fall through to the raw bytes:
          // Android still decodes them, and iOS keeps the lettered badge it already had.
          console.error('[market] logo transcode failed', sym, String(e).slice(0, 120));
        }
      }

      return { body: new Uint8Array(raw), type: upstreamType };
      })();

      logoInflight.set(sym, work);
      try {
        // Cache the OUTCOME, hit or miss. A 404 that is not remembered costs a rate-limit slot
        // on every future mount to be told the same thing.
        return logoResponse(logoStore(sym, await work));
      } catch (e) {
        // An upstream 429 or outage must NOT be cached -- that would turn one transient failure
        // into a day of lettered badges. Surface it and let the next mount try again.
        throw e;
      } finally {
        logoInflight.delete(sym);
      }
    }

    if (action === 'marks') {
      /*
       * EVERY PRICE IN ONE CALL — the only shape that fits a 5/min ceiling.
       *
       * MEASURED 2026-08-20: `setMark` is called only from getQuote, and getQuote only from
       * stock/[sym].tsx, so trade.tsx fetches NOTHING. On a fresh install every price on that
       * screen falls through markOr() to the hardcoded table in stocks.ts. AAPL is listed there
       * at $228.50 while the live previous close measured $316.83 -- a 38.7% error -- so a
       * 40-share position rendered $9,140 against a real $12,673. marks.ts already states the
       * principle this violates: "a stale price makes every position percentage derived from it
       * fiction".
       *
       * Per-symbol quotes cannot fix it: the tab shows about seven tickers and the free tier
       * allows five requests a minute, which is the same burst that produced the logo 429 storm.
       * Grouped daily bars return the whole US market's previous close in ONE request, so the
       * cost is independent of how many tickers the screen shows.
       *
       * `date` is resolved by walking back from today until a session returns rows -- weekends
       * and holidays return an empty results array rather than an error, and treating that as
       * "no prices" would blank the app every Sunday.
       */
      /*
       * FILTERED SERVER-SIDE. The grouped response carries the whole market -- measured 12,548
       * tickers -- which is a quarter of a megabyte of JSON to hand a phone so it can read seven
       * numbers out of it. `syms` costs the same ONE upstream call and returns only what was
       * asked for. Unfiltered stays available because it is genuinely useful from a script.
       */
      const want = (url.searchParams.get('syms') ?? '')
        .split(',')
        .map((x) => symbol(x))
        .filter((x): x is string => !!x);
      const out: Record<string, number> = {};
      const chg: Record<string, number> = {};
      /*
       * THE WALK STARTS AT YESTERDAY, AND THAT IS MEASURED, NOT ASSUMED.
       *
       * Starting at TODAY was tried on 2026-08-20 at 23:24 UTC, hours after the US close, on the
       * theory that today's session would already be published. It is not, on this tier:
       * `?date=2026-08-20` returned `plan_required` while `?date=2026-08-19` returned rows. Worse,
       * `poly()` throws on a non-OK response, so beginning at 0 made the whole endpoint answer
       * 501 instead of falling through -- a live regression, caught only because it was tested.
       *
       * So back=1 is correct here AND cheaper: on this plan a back=0 probe is a guaranteed wasted
       * request against a five-per-minute ceiling, every single time.
       *
       * EVERY DAY IS INDIVIDUALLY FALLIBLE, which is the part that has to keep working unattended.
       * A weekend returns an empty array, a holiday returns an empty array, and a plan-gated or
       * flaky day THROWS. None of those should end the walk -- only a rate limit should, because
       * continuing then just spends the next minute's budget to be refused six more times.
       *
       * `?date=` overrides the walk, for checking a specific session without guessing.
       */
      const forced = url.searchParams.get('date');
      for (let back = 1; back <= 6; back++) {
        const d = forced ?? new Date(Date.now() - back * 86_400_000).toISOString().slice(0, 10);
        let g: { results?: { T?: string; c?: number; o?: number }[] };
        try {
          g = await poly(`/v2/aggs/grouped/locale/us/market/stocks/${d}?adjusted=true`, key);
        } catch (e) {
          // A rate limit is terminal; anything else is just a day we cannot use.
          if (String(e).includes('rate_limited')) throw e;
          if (forced) return fresh({ error: 'no_data_for_date', date: forced }, 404);
          continue;
        }
        const rows = (g.results ?? []) as { T?: string; c?: number; o?: number }[];
        if (!rows.length) continue;
        const keep = want.length ? new Set(want) : null;
        /*
         * CLOSE **AND** CHANGE. The first version kept only `c`, so the Trade tab could show a
         * live price beside a hardcoded percentage -- worse than showing neither, because the two
         * would disagree with each other on screen. `o` is already in the same row, and
         * close-minus-open is exactly how `action=quote` defines change, so the two surfaces
         * cannot drift apart.
         */
        for (const r of rows) {
          if (!r.T || typeof r.c !== 'number' || r.c <= 0) continue;
          if (keep && !keep.has(r.T)) continue;
          out[r.T] = r.c;
          if (typeof r.o === 'number' && r.o > 0) chg[r.T] = ((r.c - r.o) / r.o) * 100;
        }
        return cached({ date: d, count: Object.keys(out).length, marks: out, changes: chg });
      }
      if (forced) return fresh({ error: 'no_data_for_date', date: forced }, 404);
      // Five consecutive empty sessions is not a weekend, it is an outage. Say so rather than
      // returning an empty marks map that reads as "every price is zero".
      return fresh({ error: 'no_session' }, 503);
    }

    if (action === 'movers') {
      /*
       * Daily winners and losers. Investing.com runs "Most Active" and "Daily Winners & Losers"
       * with a Winners/Losers toggle directly on its markets surface (2/4 of the reference set
       * carry movers). Polygon serves both from one snapshot family, so one action covers it.
       */
      const dir = url.searchParams.get('dir') === 'losers' ? 'losers' : 'gainers';
      const d = await poly(`/v2/snapshot/locale/us/markets/stocks/${dir}`, key);
      const raw = (d.tickers ?? []) as Record<string, unknown>[];
      return cached({
        dir,
        movers: raw.slice(0, 12).map((t) => {
          const day = (t.day ?? {}) as { c?: number };
          return {
            sym: String(t.ticker ?? ''),
            price: Number(day.c) || 0,
            changePct: Number(t.todaysChangePerc) || 0,
          };
        }),
      });
    }

    if (action === 'stats') {
      /*
       * Key statistics — 3/4 of the reference set carry this block.
       *   Bloom:          52 Week High / Low, Dividend Yield, Today's Volume, Avg Daily Volume
       *   Investing.com:  Previous Close, Open, Day's Range, 52wk Range, 1-Year Change
       *   Yahoo Finance:  the same family under the chart
       *
       * Two calls, because they answer different questions: `prev` gives yesterday's actual OHLCV
       * (day range, volume, previous close) and the daily series gives the 52-week envelope. Both
       * are REAL aggregates — nothing here is derived from a model.
       */
      const sym = symbol(url.searchParams.get('sym'));
      if (!sym) return fresh({ error: 'sym_required' }, 400);

      const yearAgo = Date.now() - 365 * 86_400_000;
      const [prev, year] = await Promise.all([
        poly(`/v2/aggs/ticker/${sym}/prev?adjusted=true`, key),
        poly(
          `/v2/aggs/ticker/${sym}/range/1/day/${Math.floor(yearAgo)}/${Date.now()}?adjusted=true&sort=asc&limit=400`,
          key,
        ),
      ]);

      const b = prev.results?.[0];
      const bars = (year.results ?? []) as { h: number; l: number; c: number; v: number }[];
      if (!b && bars.length === 0) return fresh({ error: 'no_data' }, 404);

      const highs = bars.map((x) => x.h).filter(Number.isFinite);
      const lows = bars.map((x) => x.l).filter(Number.isFinite);
      const vols = bars.map((x) => x.v).filter(Number.isFinite);

      return cached({
        sym,
        previousClose: b?.c ?? null,
        open: b?.o ?? null,
        dayLow: b?.l ?? null,
        dayHigh: b?.h ?? null,
        volume: b?.v ?? null,
        weekLow52: lows.length ? Math.min(...lows) : null,
        weekHigh52: highs.length ? Math.max(...highs) : null,
        avgVolume: vols.length ? vols.reduce((a, c) => a + c, 0) / vols.length : null,
        // Over the window we actually have, which may be short for a recent listing. Named
        // `yearChangePct` but computed from the first bar returned, not an assumed 365 days.
        yearChangePct:
          bars.length > 1 && bars[0].c ? ((bars[bars.length - 1].c - bars[0].c) / bars[0].c) * 100 : null,
      });
    }


    return fresh({ error: 'bad_action' }, 400);
  } catch (e) {
    /*
     * A plan limit is a 501, not a 502. The client can then say "this needs a paid data plan"
     * instead of "something went wrong", and — more to the point — the next person reading logs is
     * not sent hunting an outage that never happened.
     */
    if (e instanceof Error && e.message === 'plan_required') {
      return fresh({ error: 'plan_required' }, 501);
    }
    /*
     * A throttle is a 429, not a 502, for the same reason. `Retry-After` is included because the
     * upstream window is a MINUTE and a client that backs off blindly either hammers a limit it
     * cannot see or waits far longer than it needs to.
     */
    if (e instanceof Error && e.message === 'rate_limited') {
      return Response.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } },
      );
    }
    console.error('[market] failed', e);
    return fresh({ error: 'upstream' }, 502);
  }
}
