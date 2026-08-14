/**
 * Input validation at the trust boundary for the API routes.
 *
 * The leading underscore keeps expo-router from treating this as a route.
 *
 * WHY THIS EXISTS. Every route here interpolates caller-supplied values into an upstream URL that
 * carries OUR paid key. `.toUpperCase()` was doing duty as validation, and uppercasing is not
 * validation — it narrows the alphabet and nothing else. Two concrete consequences, both real
 * before this file:
 *
 *   1. PATH TRAVERSAL INTO THE PROVIDER. `sym` lands in `/v3/reference/tickers/${sym}` and
 *      `/v2/aggs/ticker/${sym}/prev`. A `sym` of `..%2F..%2Fv1%2Fmarketstatus%2Fnow` walks out of
 *      the intended endpoint and spends our Polygon quota on whatever the attacker picks. The key
 *      never leaks — it does not have to. The quota is the asset.
 *   2. QUERY-PARAMETER INJECTION. `sym` is concatenated unencoded into Alpha Vantage's query
 *      string. An `&` starts a new parameter; a `#` truncates the URL before `&apikey=` is
 *      appended, turning every call into a silent 401.
 *
 * This is OWASP LLM 2026 #7 (Unbounded Consumption) and CWE-88 wearing a stock ticker as a hat.
 *
 * THE RULE: nothing reaches an upstream URL without passing through here first.
 */

/**
 * Real tickers are short, uppercase alphanumerics with at most a dot or hyphen — `BRK.B`,
 * `RDS-A`. Twelve characters is comfortably above the longest listed symbol.
 *
 * ALLOWLIST, NOT DENYLIST. A denylist of `../` and `&` and `#` and `?` and `%` is a list somebody
 * has to keep complete forever; this says what a ticker IS and refuses everything else, so an
 * encoding trick nobody has thought of yet fails by default.
 */
const SYMBOL = /^[A-Z0-9][A-Z0-9.-]{0,11}$/;

/** Validated ticker, or null. Callers MUST 400 on null rather than passing the raw value on. */
export function symbol(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim().toUpperCase();
  return SYMBOL.test(s) ? s : null;
}

/** Option expiries are dates. Same reasoning: state the shape, refuse the rest. */
export function isoDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  // A shape-valid string can still be an impossible date. `2026-02-31` matches the regex and is
  // not a day, and the upstream answer to a nonsense date is an error we paid for.
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : s;
}

/**
 * Hosts we will attach our API key to.
 *
 * The logo route fetches a URL that came back INSIDE an upstream response and appends
 * `?apiKey=<ours>`. That URL is not user input, which is exactly why it is easy to trust by
 * accident — but "not user input" is not "ours". If a branding record ever carries a URL pointing
 * somewhere else, this app hands its Polygon key to that host, and the 2026 LLMjacking write-ups
 * are full of proxies that leaked a credential precisely because a redirect or a data field was
 * assumed safe. One allowlist check costs nothing and closes it.
 */
const KEYED_HOSTS = new Set(['api.polygon.io', 'polygon.io', 'www.polygon.io']);

/** True when `url` is somewhere we may send our key. Anything unparseable is false. */
export function mayCarryKey(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && KEYED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Append a query parameter without caring whether the URL already has a query string.
 *
 * `${src}?apiKey=${key}` produced a second `?` whenever `src` already carried one, which upstream
 * reads as part of the previous parameter's value. Correct on the URLs seen so far; wrong the first
 * time a branding URL arrives with a CDN cache-buster on it.
 */
export function withKey(url: string, key: string): string {
  const u = new URL(url);
  u.searchParams.set('apiKey', key);
  return u.toString();
}
