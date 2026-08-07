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

/** Null while auth is off. Constructed lazily so an unconfigured build pays nothing. */
export function supabase(): SupabaseClient | null {
  if (!AUTH_ENABLED) return null;
  client ??= createClient(URL!, ANON_KEY!, {
    auth: {
      // There is no browser URL to read a session out of in a native app, and leaving this on
      // makes supabase-js reach for `window` on startup.
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
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
  return null; // No session flow is wired yet. Replaced by a session read when sign-in lands.
}
