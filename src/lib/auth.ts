/**
 * Supabase auth — SCAFFOLDING ONLY, OFF BY DEFAULT.
 *
 * WHY IT EXISTS NOW: the rate limiter keys on a per-install id (`store.installId`). That is the
 * right identity for a signed-out app and the wrong one the moment accounts exist — one person on
 * a phone and a tablet would get two budgets, and a reinstall would mint a fresh one. Rather than
 * leave that as a future rewrite touching every route, the limiter already asks THIS module for an
 * identity first and falls back to the install id. Turning real auth on is then a keys change plus
 * wiring `signIn`, not a re-architecture.
 *
 * WHAT IT DOES TODAY: nothing. `AUTH_ENABLED` is false without `EXPO_PUBLIC_SUPABASE_URL`, so
 * `currentUserId()` returns null and every caller uses the install id. No client is constructed,
 * no network call is made, and there is no sign-in UI. This is deliberately NOT a dead control —
 * nothing in the app renders a button that depends on it.
 *
 * The web app (~/euphoriaweb-current) already runs on this same Supabase project, so when the keys
 * land the user ids are the same ones its 35 edge functions already use.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Both halves are required. A URL without a key would construct a client that fails every call,
 * which reads as "auth is broken" rather than "auth is not configured".
 *
 * The `EXPO_PUBLIC_` prefix is correct HERE and nowhere else in this repo: the anon key is
 * designed to ship to clients and is protected by row-level security, unlike GEMINI_API_KEY or
 * POLYGON_API_KEY, which stay server-side in the API routes.
 */
export const AUTH_ENABLED = !!(URL && ANON_KEY);

let client: SupabaseClient | null = null;

/**
 * The live session, mirrored into module state so it can be read SYNCHRONOUSLY.
 *
 * supabase-js only exposes `getSession()`, which is async. `apiHeaders()` runs on every outbound
 * request and cannot await — so instead of awaiting per call, we subscribe once and keep the two
 * fields we need. `onAuthStateChange` fires on sign-in, sign-out AND token refresh, so the mirror
 * cannot go stale behind a rotated token.
 */
let session: { userId: string; accessToken: string } | null = null;

/** Null while auth is off. Constructed lazily so an unconfigured build pays nothing. */
export function supabase(): SupabaseClient | null {
  if (!AUTH_ENABLED) return null;
  if (!client) {
    client = createClient(URL!, ANON_KEY!, {
      auth: {
        // There is no browser URL to read a session out of in a native app, and leaving this on
        // makes supabase-js reach for `window` on startup.
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    // Subscribe BEFORE the first read, so a sign-in that lands mid-startup is not missed.
    client.auth.onAuthStateChange((_event, s) => {
      session =
        s?.user?.id && s.access_token ? { userId: s.user.id, accessToken: s.access_token } : null;
    });
    void client.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s?.user?.id && s.access_token) session = { userId: s.user.id, accessToken: s.access_token };
    });
  }
  return client;
}

/**
 * The signed-in user id, or null.
 *
 * SYNCHRONOUS on purpose: the only caller today is the rate-limit identity, which runs on every
 * request and must not await. supabase-js keeps the decoded session in memory after rehydration,
 * so this reads a field rather than making a call. Before rehydration completes it returns null
 * and the caller falls back to the install id — a slightly narrower identity for the first
 * request of a cold start, never a wider one.
 */
export function currentUserId(): string | null {
  if (!AUTH_ENABLED) return null;
  supabase(); // Ensures the subscription exists; cheap after the first call.
  return session?.userId ?? null;
}

/**
 * The access token to prove that id to our own API, or null.
 *
 * WHY THIS MATTERS MORE THAN `currentUserId()`. Before this existed, `apiHeaders()` sent the user
 * id in `X-Euphoria-Install` — a header the caller chooses. The server had no way to tell a real
 * user id from a typed one, so signing in bought exactly nothing: same header, same trust, same
 * rotation bypass. The token is the difference between asserting an identity and proving one.
 * `api/_identity.ts` verifies its signature server-side and ignores anything that fails.
 */
export function currentAccessToken(): string | null {
  if (!AUTH_ENABLED) return null;
  supabase();
  return session?.accessToken ?? null;
}

/* ── EMAIL AND PASSWORD ────────────────────────────────────────────────────────────────────────
 *
 * Everything above this line existed to READ a session. Nothing could create one, which is why
 * `/auth` shipped with a name/handle/email form that wrote a LOCAL profile and no password field
 * at all. These are the missing half.
 *
 * ONE SHAPE FOR EVERY OUTCOME. Each function returns `AuthResult` rather than throwing, because
 * every caller is a screen that must render something either way, and a screen that has to
 * try/catch to know whether to show a spinner or a sentence gets it wrong eventually.
 */

/** Supabase's own floor. Stated here so the UI can refuse before a round trip rather than after. */
export const PASSWORD_MIN = 6;

export type AuthResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; message: string };

/**
 * A sentence a person can act on, from an error only a developer can read.
 *
 * NEVER SURFACE A RAW MESSAGE. Supabase returns strings like "Invalid login credentials" and
 * "AuthApiError: User already registered", which are accurate and useless: the first does not say
 * which half was wrong, and the second reads as a crash. The same rule `chatErrorMessage` and
 * `retryMessage` already follow in this codebase.
 *
 * Matched on substrings rather than codes because supabase-js does not expose a stable code for
 * most of these, and an unmatched error still lands on a truthful default.
 */
function authMessage(raw: string | undefined): string {
  const m = (raw ?? '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password do not match.';
  if (m.includes('already registered') || m.includes('already exists'))
    return 'That email already has an account. Try signing in instead.';
  if (m.includes('email not confirmed'))
    return 'Confirm your email address first. Check your inbox for the link.';
  if (m.includes('password') && m.includes('6')) return `Passwords need at least ${String(PASSWORD_MIN)} characters.`;
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Too many attempts just now. Wait a moment and try again.';
  if (m.includes('network') || m.includes('fetch')) return 'Could not reach the server. Check your connection.';
  return 'That did not work. Try again in a moment.';
}

/** Auth is configured but unreachable is a different failure from auth being switched off. */
const OFF: AuthResult = { ok: false, message: 'Accounts are not switched on in this build yet.' };

/**
 * Create an account.
 *
 * `needsConfirmation` is the whole reason this returns a shape rather than a boolean. The project
 * has "Confirm email" ON, so a successful sign-up returns a user with NO session: the caller must
 * say "check your inbox" rather than routing onward as though the user were signed in. Reading
 * `data.session` is how you tell, and getting it wrong strands someone on a screen that thinks
 * they are logged in.
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const sb = supabase();
  if (!sb) return OFF;
  const { data, error } = await sb.auth.signUp({ email: email.trim(), password });
  if (error) return { ok: false, message: authMessage(error.message) };
  return { ok: true, needsConfirmation: data.session === null };
}

/** Sign in to an existing account. A session here always means a session. */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const sb = supabase();
  if (!sb) return OFF;
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { ok: false, message: authMessage(error.message) };
  return { ok: true, needsConfirmation: false };
}

/**
 * Send a reset link.
 *
 * DELIBERATELY REPORTS SUCCESS EVEN WHEN THE ADDRESS IS UNKNOWN, which is why there is no "no
 * account found" branch. Telling a stranger which addresses have accounts turns this form into an
 * account-enumeration oracle. Supabase behaves the same way; this comment exists so nobody
 * "fixes" it later.
 */
export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const sb = supabase();
  if (!sb) return OFF;
  const { error } = await sb.auth.resetPasswordForEmail(email.trim());
  if (error) return { ok: false, message: authMessage(error.message) };
  return { ok: true, needsConfirmation: false };
}

/**
 * Sign in with an Apple or Google identity token from the native sheet.
 *
 * NATIVE, NOT OAUTH. `expo-apple-authentication` and Google Sign-In already completed the flow on
 * device and handed back a signed id token; Supabase verifies it directly. That is why the Apple
 * provider needs only the BUNDLE ID in its Client IDs field and no private key: the key and the
 * six-month secret rotation belong to the web OAuth path this app never takes.
 */
export async function signInWithIdToken(
  provider: 'apple' | 'google',
  token: string,
): Promise<AuthResult> {
  const sb = supabase();
  if (!sb) return OFF;
  const { error } = await sb.auth.signInWithIdToken({ provider, token });
  if (error) return { ok: false, message: authMessage(error.message) };
  return { ok: true, needsConfirmation: false };
}

/** End the server session. Local profile state is the caller's business, not this module's. */
export async function signOutServer(): Promise<void> {
  await supabase()?.auth.signOut();
  session = null;
}
