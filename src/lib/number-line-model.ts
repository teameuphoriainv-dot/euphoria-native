export const NUMBER_LINE_REVEAL_MS = 300;

export type NumberLineSpec = {
  prompt: string;
  min: number;
  max: number;
  target: number;
  tolerance: number;
  /** Production's authored slider uses a one-unit step, even for large ranges. */
  step?: number;
  unit?: string;
  explanation?: string;
  ticks?: number[];
  format?: (n: number) => string;
};

const clamp = (value: number, spec: NumberLineSpec) => Math.max(spec.min, Math.min(spec.max, value));

function snapped(value: number, spec: NumberLineSpec) {
  const step = spec.step ?? 1;
  if (!Number.isFinite(step) || step <= 0) return clamp(value, spec);
  return clamp(spec.min + Math.round((value - spec.min) / step) * step, spec);
}

/** Mirrors the production slider's rounded-midpoint starting position. */
export function initialNumberLineValue(spec: NumberLineSpec) {
  return clamp(Math.round((spec.min + spec.max) / 2), spec);
}

/** Converts a continuous horizontal gesture into the production one-unit stepped value. */
export function numberLineValueAtX(x: number, width: number, spec: NumberLineSpec) {
  if (!Number.isFinite(width) || width <= 0) return initialNumberLineValue(spec);
  const boundedX = Math.max(0, Math.min(width, x));
  const raw = spec.min + (boundedX / width) * (spec.max - spec.min);
  return snapped(raw, spec);
}

/** Submitted values are immutable; unsubmitted changes retain the production step and bounds. */
export function changeNumberLineValue(current: number, next: number, submitted: boolean, spec: NumberLineSpec) {
  return submitted ? current : snapped(next, spec);
}

export function numberLinePassed(value: number, spec: NumberLineSpec) {
  return Math.abs(value - spec.target) <= spec.tolerance;
}

/** Claims intentional horizontal drags without stealing the lesson's vertical ScrollView. */
export function shouldNumberLineClaimGesture(dx: number, dy: number, submitted: boolean) {
  return !submitted && Math.abs(dx) >= 6 && Math.abs(dx) > Math.abs(dy);
}

/** The three visible production states: editable Submit, locked reveal beat, manual Continue. */
export function numberLinePhase(submitted: boolean, revealed: boolean): 'editing' | 'waiting' | 'revealed' {
  if (revealed) return 'revealed';
  return submitted ? 'waiting' : 'editing';
}
