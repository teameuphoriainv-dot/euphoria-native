#!/usr/bin/env node
/**
 * Supabase auth sessions must persist in React Native.
 *
 * `persistSession: true` is not enough on native: without an explicit storage adapter, supabase-js
 * cannot use browser localStorage and falls back to an in-memory store. That makes sign-in look
 * successful until the first force-quit, then the session silently disappears.
 */
import { readFileSync } from 'node:fs';

const fail = (msg) => {
  console.error(`[auth-session-storage-pin] ${msg}`);
  process.exit(1);
};

export const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

function matching(src, openAt, open = '{', close = '}') {
  let depth = 0;
  let quote = null;
  for (let i = openAt; i < src.length; i += 1) {
    const ch = src[i];
    const prev = src[i - 1];
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function createClientCall(code) {
  const start = code.indexOf('createClient(');
  if (start === -1) return '';
  const open = code.indexOf('(', start);
  const close = matching(code, open, '(', ')');
  return close === -1 ? '' : code.slice(open + 1, close);
}

function objectForKey(src, key) {
  const m = new RegExp(`\\b${key}\\s*:`).exec(src);
  if (!m) return '';
  const open = src.indexOf('{', m.index);
  if (open === -1) return '';
  const close = matching(src, open);
  return close === -1 ? '' : src.slice(open + 1, close);
}

export function findings(src) {
  const code = stripComments(src);
  const call = createClientCall(code);
  const auth = objectForKey(call, 'auth');
  return {
    importsAsyncStorage: /import\s+AsyncStorage\s+from\s+['"]@react-native-async-storage\/async-storage['"]/.test(code),
    storageInAuth: /\bstorage\s*:\s*AsyncStorage\b/.test(auth),
    persistSession: /\bpersistSession\s*:\s*true\b/.test(auth),
    autoRefreshToken: /\bautoRefreshToken\s*:\s*true\b/.test(auth),
    detectSessionInUrl: /\bdetectSessionInUrl\s*:\s*false\b/.test(auth),
  };
}

function assertPinned(src) {
  const f = findings(src);
  if (!f.importsAsyncStorage) fail('src/lib/auth.ts must import AsyncStorage for the Supabase auth store.');
  if (!f.storageInAuth) fail('createClient(...).auth must pass storage: AsyncStorage, or native sessions die on app quit.');
  if (!f.persistSession) fail('createClient(...).auth must keep persistSession: true.');
  if (!f.autoRefreshToken) fail('createClient(...).auth must keep autoRefreshToken: true.');
  if (!f.detectSessionInUrl) fail('createClient(...).auth must keep detectSessionInUrl: false on native.');
}

function selftest() {
  const good = `
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import { createClient } from '@supabase/supabase-js';
    createClient(URL!, KEY!, { auth: {
      storage: AsyncStorage,
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    } });
  `;
  const ok = findings(good);
  if (!Object.values(ok).every(Boolean)) throw new Error('selftest: good fixture did not pass');

  const cases = [
    ['missing import', good.replace(/import AsyncStorage.*\n/, '')],
    ['missing storage', good.replace(/\n\s*storage: AsyncStorage,/, '')],
    ['storage only in a comment', good.replace(/\n\s*storage: AsyncStorage,/, '\n      // storage: AsyncStorage,')],
    ['storage outside auth', good.replace(/\n\s*storage: AsyncStorage,/, '').replace('{ auth:', '{ storage: AsyncStorage, auth:')],
    ['no persistence', good.replace('persistSession: true', 'persistSession: false')],
    ['no refresh', good.replace('autoRefreshToken: true', 'autoRefreshToken: false')],
    ['url detection on', good.replace('detectSessionInUrl: false', 'detectSessionInUrl: true')],
  ];
  for (const [label, src] of cases) {
    const f = findings(src);
    if (Object.values(f).every(Boolean)) throw new Error(`selftest: ${label} would slip through`);
  }
}

selftest();
assertPinned(readFileSync('src/lib/auth.ts', 'utf8'));
console.log('[auth-session-storage-pin] ok');
