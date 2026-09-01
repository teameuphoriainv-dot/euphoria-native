export type MatchingPairsEscape = {
  message: string;
  cta: 'Skip';
  passed: false;
};

const TWO_MISS_ESCAPE: MatchingPairsEscape = Object.freeze({
  message: 'Tricky one. Keep going, or move on and come back to it.',
  cta: 'Skip',
  passed: false,
});

/** Count one completed wrong term/definition selection. */
export function nextMatchingWrongAttempts(current: number): number {
  return current + 1;
}

/** Production web exposes this escape after two misses, but never over the success state. */
export function matchingPairsEscape(
  wrongAttempts: number,
  matchedCount: number,
  totalPairs: number,
): MatchingPairsEscape | null {
  return wrongAttempts >= 2 && matchedCount < totalPairs ? TWO_MISS_ESCAPE : null;
}
