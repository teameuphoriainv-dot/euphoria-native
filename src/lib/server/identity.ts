/**
 * Server-verified caller identity.
 *
 * This module lives outside `src/app` so Expo Router never treats it as a route.
 *
 * ── THE PROBLEM THIS EXISTS TO FIX ──────────────────────────────────────────────────────────
 * `_limit.ts` keys its buckets on `X-Euphoria-Install`, a header the caller chooses, and says so
 * honestly. `lib/api.ts:63` sends `currentUserId() ?? installId` in that header — so even once
 * sign-in works, a signed-in user id arrives as an ASSERTION rather than a fact. The server cannot
 * tell a real user id from a string somebody typed, which means turning auth on would have bought
 * exactly nothing: same header, same trust, same rotation bypass.
 *
 * The 2026 research is unambiguous that this is the failure that matters — insufficient rate
 * limiting is the most common finding, "particularly when limits are per-IP rather than per-user",
 * with an 81% bypass rate. Per-user only counts if the server knows the user.
 *
 * So: the client sends a Supabase access token in `Authorization: Bearer …`, and this module
 * verifies the signature before anyone is allowed to be somebody.
 *
 * ── FAILS CLOSED, ALWAYS ────────────────────────────────────────────────────────────────────
 * Every failure path returns null and the caller falls back to the unauthenticated install-id
 * budget. There is deliberately NO path that reads claims out of an unverified token. Decoding a
 * JWT without checking its signature is not a lesser version of authentication, it is an
 * authentication bypass with extra steps, and it is one of the exact patterns the vibe-coding
 * research lists under broken access control.
 *
 * ES256 sessions verify against the configured project's JWKS and need no shared secret. The
 * legacy HS256 path still requires `SUPABASE_JWT_SECRET`; when it is absent, HS256 fails closed.
 */

/** Base64url → bytes. JWTs are base64url, which is not what atob expects. */
function b64url(input: string): Uint8Array | null {
  try {
    const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
    const bin = atob(input.replace(/-/g, '+').replace(/_/g, '/') + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

const decoder = new TextDecoder();

/**
 * The verified `sub` claim, or null.
 *
 * @param token   the raw JWT
 * @param secret  the project's JWT secret
 * @param now     injectable for the regression; defaults to wall clock
 */
/*
 * ES256 VERIFICATION, VIA THE PROJECT'S JWKS.
 *
 * MEASURED 26 Aug: this project signs user sessions with ES256, not HS256. A real token's header
 * is {"alg":"ES256","kid":"c53394cc-...","typ":"JWT"} and the JWKS endpoint serves the matching
 * EC P-256 key. The HS256 pin below would have rejected every one of them.
 *
 * THAT FAILURE WOULD HAVE BEEN SILENT, which is why this is here rather than a note. `verifiedUserId`
 * returns null on a rejected token and `apiHeaders` falls back to the install id, so signing in
 * would have appeared to work while the server quietly ignored every session. Same class as the
 * OTA that served a static price table.
 *
 * The issuer is taken from CONFIGURATION, never from the token's own `iss`, which an attacker
 * controls. A token claiming an issuer we did not configure is refused below.
 */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');

/** Cached briefly: keys rotate rarely, and a fetch per request would put the auth provider on the
 *  critical path of every authenticated call. */
let jwksCache: { at: number; keys: Record<string, CryptoKey> } | null = null;
const JWKS_TTL_MS = 10 * 60 * 1000;

async function jwksKey(kid: string, now: number): Promise<CryptoKey | null> {
  if (!SUPABASE_URL) return null;
  if (!jwksCache || now - jwksCache.at > JWKS_TTL_MS) {
    try {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
      if (!r.ok) return null;
      const body = (await r.json()) as { keys?: JsonWebKey[] };
      const keys: Record<string, CryptoKey> = {};
      for (const jwk of body.keys ?? []) {
        // Import ONLY signing keys on the curve we accept. A JWKS is fetched over the network, so
        // it is input: nothing here trusts a `kty` or `crv` we did not ask for.
        if (jwk.kty !== 'EC' || jwk.crv !== 'P-256' || (jwk.use && jwk.use !== 'sig')) continue;
        const id = (jwk as { kid?: string }).kid;
        if (!id) continue;
        try {
          keys[id] = await crypto.subtle.importKey(
            'jwk',
            jwk,
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['verify'],
          );
        } catch {
          // A malformed key in the set must not take the whole set down.
        }
      }
      jwksCache = { at: now, keys };
    } catch {
      return null;
    }
  }
  return jwksCache.keys[kid] ?? null;
}

export async function verifiedSubject(
  token: string,
  secret: string,
  now: number = Date.now(),
): Promise<string | null> {
  /*
   * A SECRET IS NO LONGER REQUIRED UP FRONT, because ES256 does not use one.
   *
   * This line used to read `if (!token || !secret) return null`, which refused every ES256 token
   * before the algorithm branch could look at it. The HS256 path still demands a secret, at the
   * point where it actually needs one. Found by testing against a real token rather than assuming
   * the implementation was right: the crypto verified fine in isolation and this guard was
   * swallowing it two lines earlier.
   */
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;

  const headerBytes = b64url(h);
  if (!headerBytes) return null;
  let header: { alg?: unknown; typ?: unknown };
  try {
    header = JSON.parse(decoder.decode(headerBytes));
  } catch {
    return null;
  }

  /*
   * PIN THE ALGORITHM. `alg: "none"` is the oldest JWT attack there is, and swapping HS256 for an
   * asymmetric alg is the second oldest — both work against code that reads `alg` from the token
   * and does what it says. The token does not get a vote on how it is checked.
   */
  const alg = header.alg;
  if (alg !== 'HS256' && alg !== 'ES256') return null;

  const sig = b64url(s);
  const payloadBytes = b64url(p);
  if (!sig || !payloadBytes) return null;

  const enc = new TextEncoder();
  const signed = enc.encode(`${h}.${p}`);
  let ok: boolean;
  try {
    if (alg === 'ES256') {
      /*
       * The `kid` selects WHICH published key, and nothing else. It cannot select a weaker
       * algorithm: `alg` was pinned to one of two values above, and this branch only ever imports
       * an EC P-256 verify key. An unknown kid fails closed.
       */
      const kid = (header as { kid?: unknown }).kid;
      if (typeof kid !== 'string' || !kid) return null;
      const key = await jwksKey(kid, now);
      if (!key) return null;
      ok = await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        key,
        sig as BufferSource,
        signed,
      );
    } else {
      // HS256, the legacy shared-secret path. Kept because a project configured the old way still
      // works, and because removing a verification path you have not proven is unused is careless.
      if (!secret) return null;
      const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify'],
      );
      // subtle.verify is constant-time. Never compare signature strings with ===.
      ok = await crypto.subtle.verify('HMAC', key, sig as BufferSource, signed);
    }
  } catch {
    return null;
  }
  if (!ok) return null;

  // Only NOW is it safe to believe anything in the payload.
  let claims: { sub?: unknown; exp?: unknown; nbf?: unknown; aud?: unknown; iss?: unknown };
  try {
    claims = JSON.parse(decoder.decode(payloadBytes));
  } catch {
    return null;
  }

  const secs = Math.floor(now / 1000);
  // A token with no expiry is not a session, it is a permanent credential in a header. Require it.
  if (typeof claims.exp !== 'number' || claims.exp <= secs) return null;
  if (typeof claims.nbf === 'number' && claims.nbf > secs) return null;
  if (typeof claims.sub !== 'string' || !claims.sub) return null;
  /*
   * `aud` PINNED, added 2026-08-14 before this code goes live with a real secret.
   *
   * Signature verification proves a token was signed with the project's JWT secret. It does NOT
   * prove the token was minted for THIS purpose. Supabase signs several kinds of token with that
   * same secret, so without an audience check any of them carrying a `sub` would be accepted here
   * as a logged-in user.
   *
   * Moot today — the anon and service_role keys carry `role`, not `sub`, so they already fail the
   * line above — which is precisely why it is worth adding now rather than after something changes
   * upstream and the failure is silent. Supabase issues user sessions with `aud: "authenticated"`.
   */
  if (claims.aud !== undefined && claims.aud !== 'authenticated') return null;
  /*
   * `iss` PINNED to the CONFIGURED project, added with ES256 support.
   *
   * A JWKS is fetched from a URL. If that URL ever came from the token, an attacker could publish
   * their own keys and mint tokens this code would happily verify. SUPABASE_URL is configuration,
   * and this line refuses any token that does not claim to come from it.
   */
  const iss = (claims as { iss?: unknown }).iss;
  if (SUPABASE_URL && iss !== undefined && iss !== `${SUPABASE_URL}/auth/v1`) return null;

  // Bound it for the same reason `identify()` bounds the header: the identity becomes a map key.
  return claims.sub.length <= 64 ? claims.sub : null;
}

/** Pull the bearer token out of a request, or null. */
export function bearer(request: Request): string | null {
  const raw = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!raw) return null;
  const m = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return m ? m[1].trim() : null;
}

/**
 * The verified user id for this request, or null when the caller is anonymous.
 *
 * Reads the secret at call time rather than module load so a deployment that sets it does not need
 * an isolate recycle to start honouring it.
 */
export async function verifiedUserId(request: Request, now?: number): Promise<string | null> {
  const token = bearer(request);
  return token ? verifiedSubject(token, process.env.SUPABASE_JWT_SECRET ?? '', now) : null;
}
