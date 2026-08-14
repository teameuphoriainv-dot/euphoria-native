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

async function poly(path: string, key: string) {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}apiKey=${key}`;
  const res = await fetch(url);
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

  // Per-action budgets: search bursts on every keystroke, logos are many-per-screen but cached a
  // day, everything else is a cheap read. Gated BEFORE the key check so an unconfigured build
  // still cannot be used as a free load generator.
  const gate = await (action === 'search'
    ? guard(request, 'market:search', 60, 60_000)
    : action === 'logo'
      ? guard(request, 'market:logo', 200, 60_000)
      : guard(request, 'market', 120, 60_000));
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
      return cached({
        sym,
        price: bar.c,
        change,
        changePct: bar.o ? (change / bar.o) * 100 : 0,
      });
    }

    if (action === 'chart') {
      const sym = symbol(url.searchParams.get('sym'));
      const range = (url.searchParams.get('range') ?? '1M') as RangeKey;
      if (!sym) return fresh({ error: 'sym_required' }, 400);
      if (!RANGES[range]) return fresh({ error: 'bad_range' }, 400);
      const { mult, span, label } = RANGES[range];
      const d = await poly(
        `/v2/aggs/ticker/${sym}/range/${mult}/${span}/${Math.floor(fromMs(range))}/${Date.now()}?adjusted=true&sort=asc&limit=5000`,
        key,
      );
      const points: { t: number; c: number }[] = (d.results ?? []).map((b: { t: number; c: number }) => ({ t: b.t, c: b.c }));
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
      const d = await poly(`/v3/reference/tickers/${sym}`, key);
      const brand = (d.results?.branding ?? {}) as { icon_url?: string; logo_url?: string };
      const src = brand.icon_url ?? brand.logo_url;
      if (!src) return fresh({ error: 'no_logo' }, 404);

      /*
       * The URL came out of an upstream response, not from the caller — which is exactly what makes
       * it easy to trust by accident. It is still a URL from somewhere else, and the next line
       * staples our Polygon key to it. Allowlist the host before that happens: if a branding record
       * ever points elsewhere, we decline instead of paying a stranger's server a credential.
       */
      if (!mayCarryKey(src)) {
        console.error('[market] refused to key a non-Polygon logo host', src.slice(0, 120));
        return fresh({ error: 'no_logo' }, 404);
      }
      const img = await fetch(withKey(src, key));
      if (!img.ok) return fresh({ error: 'no_logo' }, 404);
      return new Response(img.body, {
        headers: {
          'Content-Type': img.headers.get('Content-Type') ?? 'image/png',
          // Logos change about never. A day of caching keeps this off the rate limit.
          'Cache-Control': 'public, max-age=86400',
        },
      });
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
