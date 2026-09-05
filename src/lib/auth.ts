/**
 * Supabase auth.
 *
 * WHY IT EXISTS NOW: the rate limiter keys on a per-install id (`store.installId`). That is the
 * right identity for a signed-out app and the wrong one once accounts exist — one person on a
 * phone and a tablet would get two budgets, and a reinstall would mint a fresh one. Rather than
 * leave that as a rewrite touching every route, the limiter asks THIS module for an identity first
 * and falls back to the install id.
 *
 * WHEN AUTH IS NOT CONFIGURED: `AUTH_ENABLED` is false without both Supabase public values, so
 * `currentUserId()` returns null and every caller uses the install id. No client is constructed,
 * no network call is made, and the auth screen falls back to local-profile behavior.
 *
 * The web app (~/euphoriaweb-current) already runs on this same Supabase project, so user ids can
 * be the same across clients even while progress and wallet state remain device-local on iOS.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { checkPasswordSafety } from './password-safety';

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
type AuthUserListener = (userId: string | null) => void;
const authUserListeners = new Set<AuthUserListener>();
let autoRefreshBound = false;

function adoptSession(next: { user?: { id?: string }; access_token?: string } | null): void {
  const previousUserId = session?.userId ?? null;
  session =
    next?.user?.id && next.access_token
      ? { userId: next.user.id, accessToken: next.access_token }
      : null;
  const userId = session?.userId ?? null;
  if (userId !== previousUserId) authUserListeners.forEach((listener) => listener(userId));
}

/** Keep account-scoped SDKs aligned with Supabase without importing them into the auth layer. */
export function onAuthUserChange(listener: AuthUserListener): () => void {
  authUserListeners.add(listener);
  listener(session?.userId ?? null);
  return () => authUserListeners.delete(listener);
}

/** Null while auth is off. Constructed lazily so an unconfigured build pays nothing. */
export function supabase(): SupabaseClient | null {
  if (!AUTH_ENABLED) return null;
  if (!client) {
    client = createClient(URL!, ANON_KEY!, {
      auth: {
        // React Native has no browser localStorage. Without this adapter supabase-js persists to
        // memory only, so a successful sign-in silently disappears after a force-quit.
        storage: AsyncStorage,
        // There is no browser URL to read a session out of in a native app, and leaving this on
        // makes supabase-js reach for `window` on startup.
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    if (Platform.OS !== 'web' && !autoRefreshBound) {
      autoRefreshBound = true;
      AppState.addEventListener('change', (state) => {
        if (state === 'active') client?.auth.startAutoRefresh();
        else client?.auth.stopAutoRefresh();
      });
      if (AppState.currentState === 'active') client.auth.startAutoRefresh();
    }
    // Subscribe BEFORE the first read, so a sign-in that lands mid-startup is not missed.
    client.auth.onAuthStateChange((_event, s) => {
      adoptSession(s);
    });
    void client.auth.getSession().then(({ data }) => {
      adoptSession(data.session);
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
export const PASSWORD_MIN = 8;

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
  if (m.includes('password') && /\b(?:6|8)\b/.test(m)) {
    return `Passwords need at least ${String(PASSWORD_MIN)} characters.`;
  }
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
  const safety = await checkPasswordSafety(password);
  if (safety === 'compromised') {
    return {
      ok: false,
      message: 'That password appears in known data breaches. Choose a unique password instead.',
    };
  }
  if (safety === 'unavailable') {
    return {
      ok: false,
      message: 'We could not verify that password safely. Check your connection and try again.',
    };
  }
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
 * device and handed back a signed id token; Supabase verifies it directly. Authentication itself
 * therefore needs only the bundle ID. The server-side Apple key used by apple-auth-token is a
 * separate account-deletion concern: it exchanges the native authorization code and later revokes
 * the resulting refresh token.
 */
export async function signInWithIdToken(
  provider: 'apple' | 'google',
  token: string,
  accessToken?: string | null,
): Promise<AuthResult> {
  const sb = supabase();
  if (!sb) return OFF;
  /*
   * ACCESS TOKEN IS APPLE-ONLY ON PURPOSE.
   *
   * Supabase's documented Google call passes the id token and nothing else. Sending an access token
   * alongside it makes GoTrue validate the id token's `at_hash` against it — and getTokens() returns
   * a FRESH access token, not the one the hash was computed from, so a correct sign-in fails a hash
   * it was never going to match. Apple's flow is unaffected and keeps the parameter.
   */
  const { error } = await sb.auth.signInWithIdToken({
    provider,
    token,
    ...(accessToken && provider !== 'google' ? { access_token: accessToken } : {}),
  });
  if (error) return { ok: false, message: authMessage(error.message) };
  return { ok: true, needsConfirmation: false };
}

/**
 * Exchange Apple's short-lived authorization code on the server and retain only an encrypted
 * refresh token. This is deliberately separate from signInWithIdToken(): Supabase verifies the
 * identity token for authentication, while Apple's /auth/token exchange exists solely so account
 * deletion can later revoke the user's Apple authorization automatically.
 *
 * Failure does not undo a valid sign-in. Until the server's Sign in with Apple key is configured,
 * deletion still removes the Euphoria account and the UI provides Apple's manual revocation path.
 */
export async function registerAppleAuthorizationCode(
  authorizationCode: string,
): Promise<boolean> {
  const sb = supabase();
  if (!sb || !session || !authorizationCode) return false;
  const { data, error } = await sb.functions.invoke('apple-auth-token', {
    body: { action: 'exchange', authorizationCode },
  });
  if (error) {
    if (__DEV__) console.warn('[auth] Apple revocation token registration failed');
    return false;
  }
  return data?.stored === true;
}

/** End the server session. Local profile state is the caller's business, not this module's. */
export async function signOutServer(): Promise<void> {
  await supabase()?.auth.signOut();
  adoptSession(null);
}

/**
 * Delete the signed-in user's SERVER account, for App Store Guideline 5.1.1(v).
 *
 * WHY AN RPC. A client cannot delete from `auth.users`; that needs elevated privilege, and the
 * service_role key must never ship inside an app. The standard shape is a SECURITY DEFINER
 * function that deletes `auth.uid()` and nothing else, so a caller can only ever remove
 * themselves.
 *
 * CREATED AND VERIFIED 26 Aug on project iviuktnksjymnuxifakt. Proven against the live API in
 * five steps: sign in 200, an ANON caller refused 401 by the revoke, the authenticated user's own
 * delete 204, the old token then 403, and a re-sign-in 400 because the row is genuinely gone.
 * The statement, kept here so it survives a project rebuild:
 *
 *   create or replace function public.delete_own_account() returns void
 *     language plpgsql security definer set search_path = pg_catalog
 *     as $$ begin delete from auth.users where id = auth.uid(); end; $$;
 *   revoke all on function public.delete_own_account() from public, anon;
 *   grant execute on function public.delete_own_account() to authenticated;
 *
 * RETURNS A RESULT RATHER THAN THROWING, and the caller deletes local data either way. A user who
 * asked to be forgotten must not be left with their progress intact because a network call failed
 * — but they also must not be told the server copy is gone when it is not. `ok: false` means
 * exactly that, and the screen says so.
 *
 * `ok: true` when there is no session: there is no server account to delete, so there is nothing
 * to fail at. That is the honest answer for a device-local profile, not a papered-over error.
 */
export async function deleteServerAccount(options?: { revokeApple?: boolean }): Promise<{
  ok: boolean;
  message?: string;
  appleRevoked?: boolean;
}> {
  const sb = supabase();
  if (!sb || !session) return { ok: true };
  let appleRevoked: boolean | undefined;
  if (options?.revokeApple) {
    const { data, error } = await sb.functions.invoke('apple-auth-token', {
      body: { action: 'revoke' },
    });
    appleRevoked = !error && data?.revoked === true;
  }
  const { error } = await sb.rpc('delete_own_account');
  if (error) {
    // The server copy may still exist, but this device must not keep a refreshable session after
    // the local profile is erased. Local scope avoids claiming that the failed deletion revoked
    // sessions on other devices; the error message still tells the user to retry server deletion.
    await sb.auth.signOut({ scope: 'local' });
    adoptSession(null);
    // The function exists on the current project. This branch remains for a project rebuilt or
    // restored without it, where saying WHICH failure occurred is the difference between a user
    // retrying and a user assuming their data is gone when it is not.
    const missing = /function .*delete_own_account.* does not exist|PGRST202/i.test(error.message);
    return {
      ok: false,
      appleRevoked,
      message: missing
        ? 'Your account on our servers could not be removed yet. Your data on this device has been deleted.'
        : 'Your account on our servers could not be reached. Your data on this device has been deleted.',
    };
  }
  // The RPC has already destroyed the server identity. Clear the persisted native session without
  // making a second server request against a user that no longer exists.
  await sb.auth.signOut({ scope: 'local' });
  adoptSession(null);
  return { ok: true, appleRevoked };
}
