/**
 * Server-verified caller identity.
 *
 * The leading underscore keeps expo-router from treating this as a route.
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
 * With `SUPABASE_JWT_SECRET` unset — which is the state today — every request is anonymous and
 * behaviour is identical to before this file existed. It activates the moment the secret lands.
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
export async function verifiedSubject(
  token: string,
  secret: string,
  now: number = Date.now(),
): Promise<string | null> {
  if (!token || !secret) return null;

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
  if (header.alg !== 'HS256') return null;

  const sig = b64url(s);
  const payloadBytes = b64url(p);
  if (!sig || !payloadBytes) return null;

  const enc = new TextEncoder();
  let ok: boolean;
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    // subtle.verify is constant-time. Never compare signature strings with ===.
    ok = await crypto.subtle.verify('HMAC', key, sig as BufferSource, enc.encode(`${h}.${p}`));
  } catch {
    return null;
  }
  if (!ok) return null;

  // Only NOW is it safe to believe anything in the payload.
  let claims: { sub?: unknown; exp?: unknown; nbf?: unknown };
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
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;
  const token = bearer(request);
  return token ? verifiedSubject(token, secret, now) : null;
}
