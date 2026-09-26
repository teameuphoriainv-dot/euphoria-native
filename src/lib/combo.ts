/**
 * In-lesson combo, as pure functions over a first-try log keyed by screen index (so Back and
 * forward can never count a question twice). Only a first-try-correct choice extends a run; a
 * first-try miss breaks it, and a retry that then succeeds never scores (owner decision 4). A
 * hinted answer is not logged at all, so it neither extends nor breaks the run.
 */
export type FirstTryLog = Record<number, boolean>;

const graded = (log: FirstTryLog) => Object.keys(log).map(Number).sort((a, b) => a - b);

/** The run ending at `idx` (0 if `idx` was not a first-try correct). */
export function comboAt(log: FirstTryLog, idx: number): number {
  let n = 0;
  for (const k of graded(log).filter((k) => k <= idx).reverse()) {
    if (!log[k]) break;
    n++;
  }
  return n;
}

export function bestCombo(log: FirstTryLog): number {
  let best = 0;
  let run = 0;
  for (const k of graded(log)) {
    run = log[k] ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

/** Share of graded questions right first try; null when nothing was graded. */
export function accuracy(log: FirstTryLog): number | null {
  const v = Object.values(log);
  return v.length ? v.filter(Boolean).length / v.length : null;
}

/** Every graded question right first try, with at least 3 graded (a 1-question "perfect" is noise). */
export const isPerfect = (log: FirstTryLog) => {
  const v = Object.values(log);
  return v.length >= 3 && v.every(Boolean);
};

/** Combo shows from 3 in a row. */
export const COMBO_MIN = 3;

/** The chime climbs with the run: +6% per step from 3, capped at 1.30. */
export const comboRate = (n: number) => Math.min(1 + 0.06 * (n - COMBO_MIN), 1.3);
