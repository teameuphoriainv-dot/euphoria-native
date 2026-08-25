/**
 * Where our own API routes live.
 *
 * On web a relative `/api/x` resolves against the page; on native there is no page, so a relative
 * URL has nothing to resolve against and the request fails. Extracted here the moment a SECOND
 * proxy needed it (chat, then market) — two copies of this would drift the day production origin
 * handling changes.
 *
 * Resolution order:
 *   1. EXPO_PUBLIC_API_URL   — set to the deployed EAS Hosting origin for production builds
 *   2. Constants.expoConfig.hostUri — the Metro dev server the app is already talking to, so
 *      development needs no configuration at all
 *   3. '' — relative, correct on web and only on web (web only)
 *   4. DEFAULT_API_ORIGIN — the deployed origin, compiled in, so a native build can never end up
 *      with nowhere to send a request
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { currentAccessToken, currentUserId } from './auth';
import { useApp } from './store';

/**
 * The deployed API origin, COMPILED IN.
 *
 * WHY THIS IS NOT LEFT TO THE ENVIRONMENT ALONE. `EXPO_PUBLIC_API_URL` is inlined at BUNDLE time,
 * and this app has two ways of producing a bundle. `eas build` reads `eas.json`, where the value is
 * set under both build profiles, so a BUILD has always had it. `eas update` does not read that
 * block at all: it takes its variables from `--environment`, which is a flag a human has to
 * remember on every publish. Miss it once and the OTA that lands on top of a perfectly good build
 * has no origin.
 *
 * WHAT THAT LOOKED LIKE. `apiBase()` returned `''`, every `/api/market` call threw
 * `no_api_origin` before its fetch, `safe()` in `lib/market.ts` turned each one into `null`, and
 * `priceOf` fell through to the static table in `stocks.ts` — so the Trade tab rendered NVDA at
 * $1,184.00 against a real $208.48, with no logos, on a build whose own binary was configured
 * correctly. Atlas and the options chain died in the same instant and for the same reason.
 *
 * WHY A CONSTANT IS SAFE HERE AND A PLACEHOLDER WOULD NOT BE. §"Why the key is absent rather than a
 * placeholder" in DEPLOY.md argues against a plausible-looking WRONG url, because that fails as a
 * network error and sends you debugging connectivity. This is not a stand-in for the origin, it IS
 * the origin — the same string `eas.json` already hardcodes in two places, and a public hostname
 * rather than a secret. `scripts/api-origin-pin.mjs` fails the build if the three ever disagree.
 *
 * The environment still WINS when it is set, so a preview deployment or a local override behaves
 * exactly as before. This only replaces the case that used to be `''`, which was never a working
 * configuration on native — only a silent one.
 */
const DEFAULT_API_ORIGIN = 'https://euphoria-native.expo.app';

export function apiBase(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (Platform.OS === 'web') return '';
  const host = Constants.expoConfig?.hostUri;
  return host ? `http://${host}` : DEFAULT_API_ORIGIN;
}

/**
 * True when this build has nowhere to send a request.
 *
 * THIS IS THE C98 FAILURE, MADE LOUD. On native, `hostUri` exists only while Metro is attached, so
 * a production or TestFlight build with no `EXPO_PUBLIC_API_URL` resolves its base to `''` and
 * every fetch goes to a relative path with nothing to resolve against. Atlas, market data and
 * options all die at once — and NONE of it reproduces in development, because development always
 * has Metro. The bug is invisible in exactly the environment it is written in.
 *
 * Surfacing it as its own code means a misconfigured build says "misconfigured" instead of
 * impersonating a network outage, and the check is cheap enough to run on every call.
 */
export function apiOriginMissing(): boolean {
  return Platform.OS !== 'web' && apiBase() === '';
}

/** Thrown with the route's error code, never a raw upstream body. */
export class ApiError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = 'ApiError';
  }
}

/**
 * Headers every request carries.
 *
 * `X-Euphoria-Install` is the rate-limit identity. Read on EACH call rather than captured at
 * module load: persist rehydration is async, so a module-load read would send an empty id on the
 * first request of a cold start and silently bucket that call as `anon`.
 */
export function apiHeaders(extra?: Record<string, string>): Record<string, string> {
  // A signed-in user id when one exists, otherwise the install id. This is the ONLY place the
  // two identities meet, so turning auth on does not touch any route.
  const id = currentUserId() ?? useApp.getState().installId;
  /*
   * The bearer token is what makes signing in MEAN anything to the server.
   *
   * `X-Euphoria-Install` is a header the caller picks, so on its own a user id in it is an
   * assertion, not a fact — the server cannot tell it from a string somebody typed. The token
   * carries a signature `api/_identity.ts` verifies, and only a verified subject gets its own
   * rate-limit namespace. Sent only when a real session exists; there is no placeholder.
   */
  const token = currentAccessToken();
  return {
    'X-Euphoria-Install': id,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  // Fail before the fetch, not after it. A relative URL on native does not produce a clean error
  // — it produces something that reads like the user's connection is down, which sends everyone
  // hunting the wrong problem.
  if (apiOriginMissing()) throw new ApiError('no_api_origin');
  const res = await fetch(`${apiBase()}${path}`, { headers: apiHeaders() });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // 429 is mapped from the STATUS, not the body: an edge proxy can shed load with its own
    // 429 that carries no JSON at all, and that is still "slow down", not "unknown failure".
    if (res.status === 429) throw new ApiError('rate_limited');
    throw new ApiError(data?.error ?? `http_${res.status}`);
  }
  return data as T;
}
