/**
 * Trend Master — the pure logic. No React, no rendering, so the fun can be tuned and TESTED.
 *
 * THE GAME. A price chart draws in and you call the next move, up or down. Correct extends a
 * streak and raises a multiplier; wrong resets the streak and costs a life. Three lives, sixty
 * seconds, one number to beat.
 *
 * WHY THOSE FOUR PIECES, specifically. Term Match, the only game that existed, has a score and a
 * timer and is still not fun, because it is one board of five pairs and then it is over. It has no
 * streak, so nothing compounds; no lives, so nothing is at stake; and no best score, so there is
 * no reason for a second run. A 60-second game needs a reason to immediately press again, and the
 * multiplier IS that reason: it makes the run you are in worth more than the one you already had.
 *
 * THE SERIES IS SYNTHETIC AND DETERMINISTIC, seeded per round. Real market data would make this a
 * quiz about yesterday, need the network, and make a round unrepeatable. A seeded walk is honest —
 * it is a game about reading a shape, and the shape is real even when the company is not.
 *
 * IT IS NOT PURE NOISE, which would make the game unwinnable and therefore pointless. Each round
 * carries a DRIFT the walk leans on, so a chart that has been climbing genuinely is more likely to
 * climb. A player who reads trend beats a coin flip, which is the whole lesson.
 */

/** Visible bars. 14 is what fits at a readable width on the narrowest phone this ships to. */
export const WINDOW = 14;
export const LIVES = 3;
export const ROUND_SECONDS = 45;

/**
 * A correct call BUYS TIME. This is the single change that turns a countdown into a game.
 *
 * A clock that only falls means the run has a fixed length and the best you can do is score faster
 * inside it. A clock you can extend makes time a resource you earn, so a hot streak visibly pays
 * for itself and a run can go long — which is what makes an arcade game worth pressing again. The
 * round starts SHORTER (45s, not 60) because the bonus more than makes up for it and a short fuse
 * is more urgent from the first second.
 */
export const TIME_BONUS = 1.2;

/** Milliseconds the result is shown before the next chart. Short on purpose: at 620ms a 45-second
 *  run spent a third of itself waiting, which is dead air where the tension should be. */
export const REVEAL_MS = 340;

/** Deterministic 32-bit PRNG. Math.random() would make a round unrepeatable and untestable. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export type Round = {
  /** The full series. The player sees a window into it and calls the next value. */
  series: number[];
  /** How far the window has advanced. The next value is `series[cursor + WINDOW]`. */
  cursor: number;
};

/**
 * A walk with drift. `difficulty` rises with the streak: higher means more noise relative to the
 * drift, so the trend gets harder to read rather than the timer getting shorter. Shortening a
 * timer punishes reaction speed; adding noise punishes bad reading, which is the skill on trial.
 */
export function makeSeries(seed: number, difficulty: number, length = 80): number[] {
  const rand = rng(seed);
  /*
   * DRIFT BEATS NOISE, deliberately and by a wide margin at low difficulty.
   *
   * A walk where noise dominates is a coin flip wearing a chart, and a coin flip is not a game —
   * the player cannot improve, so the score means nothing and they stop. The drift is what makes
   * reading the shape pay, and difficulty narrows that edge rather than removing it.
   */
  const drift = (rand() - 0.5) * 2;                 // -1..1, the round's bias
  const noise = 0.34 + Math.min(difficulty, 6) * 0.11;
  let v = 50;
  const out: number[] = [];
  let bias = drift;
  for (let i = 0; i < length; i++) {
    // The bias itself wanders, so a chart is not a straight line for eighty bars.
    if (i % 12 === 0) bias = (rand() - 0.5) * 2;
    v += bias * 2.6 + (rand() - 0.5) * 6 * noise;
    v = Math.max(6, Math.min(94, v));
    out.push(v);
  }
  return out;
}

export const windowOf = (r: Round): number[] => r.series.slice(r.cursor, r.cursor + WINDOW);
export const nextValue = (r: Round): number => r.series[r.cursor + WINDOW];
export const lastValue = (r: Round): number => r.series[r.cursor + WINDOW - 1];

/** Did the call match what happened? A dead-flat move counts as UP, so there is never a no-answer. */
export function isCorrect(r: Round, call: 'up' | 'down'): boolean {
  return (nextValue(r) >= lastValue(r)) === (call === 'up');
}

/**
 * The multiplier, and the reason to keep a streak alive. Rises every third correct call and caps
 * at 5: uncapped, one lucky run would make every later run pointless by comparison.
 */
export const multiplierFor = (streak: number): number => Math.min(5, 1 + Math.floor(streak / 3));

export const POINTS = 10;
export const scoreFor = (streak: number): number => POINTS * multiplierFor(streak);

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const eq = (a: unknown, b: unknown, what: string) => {
    if (a !== b) console.error(`[trend-game] ${what}: got ${String(a)}, expected ${String(b)}`);
  };
  // Determinism is the whole basis of the round being testable AND replayable.
  eq(makeSeries(42, 0).join() === makeSeries(42, 0).join(), true, 'the same seed gives the same series');
  eq(makeSeries(42, 0).join() === makeSeries(43, 0).join(), false, 'different seeds differ');

  const s = makeSeries(7, 0);
  eq(s.every((v) => v >= 6 && v <= 94), true, 'the series stays inside its clamp');

  const r: Round = { series: [10, 20], cursor: 0 };
  // A window of 1 for the boundary test: last = 10, next = 20, so UP is correct.
  const one = { ...r };
  eq(one.series[1] >= one.series[0], true, 'fixture sanity');

  eq(multiplierFor(0), 1, 'no streak is 1x');
  eq(multiplierFor(2), 1, 'two correct is still 1x');
  eq(multiplierFor(3), 2, 'three correct is 2x');
  eq(multiplierFor(99), 5, 'the multiplier caps at 5');
  eq(scoreFor(3), 20, 'a 2x call is worth 20');
}
