/**
 * Free leaked-password screening for the Supabase Free plan.
 *
 * HIBP's range API receives only the first five SHA-1 characters, never the password or its full
 * hash. The returned suffix set is matched locally. SHA-1 is required by this k-anonymity protocol;
 * it is not being used to store or authenticate passwords.
 */
import * as Crypto from 'expo-crypto';

import { pwnedCountForHash } from './pwned-passwords';

export type PasswordSafety = 'safe' | 'compromised' | 'unavailable';

export async function checkPasswordSafety(password: string): Promise<PasswordSafety> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const controller = new AbortController();
  try {
    const hash = (
      await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA1, password)
    ).toUpperCase();
    timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`,
      {
        headers: { 'Add-Padding': 'true', 'User-Agent': 'Euphoria-Password-Safety' },
        signal: controller.signal,
      },
    );
    if (!response.ok) return 'unavailable';
    return pwnedCountForHash(hash, await response.text()) > 0
      ? 'compromised'
      : 'safe';
  } catch {
    return 'unavailable';
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
