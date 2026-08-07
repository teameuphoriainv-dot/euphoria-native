/**
 * Client for the Atlas chat proxy (`src/app/api/chat+api.ts`).
 *
 * THE ORIGIN PROBLEM: on web a relative `fetch('/api/chat')` resolves against the page, but on
 * native there is no page — a relative URL has nothing to resolve against and the request fails.
 * The API route is served by the Metro dev server in development and by EAS Hosting in
 * production, so the base URL has to be worked out at runtime rather than hardcoded.
 *
 * Resolution order, first hit wins:
 *   1. EXPO_PUBLIC_API_URL — set this to the deployed EAS Hosting origin for production builds.
 *   2. Constants.expoConfig.hostUri — the Metro dev server the app is already talking to, so
 *      development needs no configuration at all.
 *   3. '' — relative, which is correct on web and only on web.
 */
import Constants from 'expo-constants';

import { apiHeaders } from './api';
import { Platform } from 'react-native';

export type ChatTurn = { role: 'user' | 'model'; content: string };

function baseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (Platform.OS === 'web') return '';
  // hostUri looks like '192.168.1.5:8081'. It is undefined in a production build, which is exactly
  // when EXPO_PUBLIC_API_URL must have been set instead.
  const host = Constants.expoConfig?.hostUri;
  return host ? `http://${host}` : '';
}

/** Error codes the route returns. `not_configured` means the server has no API key. */
export class ChatError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = 'ChatError';
  }
}

/**
 * Send the whole thread and get one reply. Non-streaming by design for now — streaming is a
 * separate unit, and shipping a fake "typing" animation over a blocking request would be a lie
 * about what the network is doing.
 */
export async function askAtlas(messages: ChatTurn[], signal?: AbortSignal): Promise<string> {
  const res = await fetch(`${baseUrl()}/api/chat`, {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ messages }),
    signal,
  });

  const data = await res.json().catch(() => null);
  if (res.status === 429) throw new ChatError('rate_limited');
  if (!res.ok) throw new ChatError(data?.error ?? `http_${res.status}`);
  if (typeof data?.text !== 'string') throw new ChatError('empty');
  return data.text;
}

/** What the user sees for each error code. Never surface a raw code. */
export function chatErrorMessage(code: string): string {
  switch (code) {
    case 'not_configured':
      return 'Atlas is not switched on in this build yet.';
    case 'rate_limited':
      return "You're asking faster than I can think. Give me a moment.";
    case 'message_too_long':
      return 'That is a bit long for me. Try trimming it down.';
    case 'too_many_messages':
      return 'This conversation has got long. Start a new one and I will keep up.';
    default:
      return "I could not reach my brain just then. Try me again in a moment.";
  }
}
