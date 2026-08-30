/** Return the HIBP breach count for a full SHA-1 hash from a range response. */
export function pwnedCountForHash(hash: string, response: string): number {
  const suffix = hash.toUpperCase().slice(5);
  for (const row of response.split(/\r?\n/)) {
    const [candidate, countText] = row.trim().split(':');
    if (candidate === suffix) {
      const count = Number(countText);
      return Number.isSafeInteger(count) && count > 0 ? count : 0;
    }
  }
  return 0;
}
