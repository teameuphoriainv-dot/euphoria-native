/**
 * "Double it": the one hands-on screen in onboarding, before the account wall.
 *
 * WHY THIS EXISTS. Every onboarding screen before this one is a question or a statement, so a new
 * learner signs up without having done a single thing the app teaches. Brilliant's onboarding puts
 * a real, graded interaction before signup (research2/brilliant-onboarding.md), and design.md 1.2
 * specifies this one: $1,000 as a stack of coins, a years stepper, and a dashed "$2,000" outline the
 * coins grow into. The idea taught is the rule of 72, which the lessons already teach in the same
 * words ("divide 72 by your return", investingFundamentals.ts:783), so onboarding promises nothing
 * the course does not then deliver.
 *
 * THE NUMBERS (CONSTITUTION 3.1). Nothing here is a market figure. Every value on screen is plain
 * arithmetic on a rate the learner picked from CHIPS, and the sub-line says in words that the rate
 * is "an example rate, not a promise" (CONSTITUTION 3.3: teach the mechanism, never advise).
 *
 * WHY 6, 4 AND 3 AND NOT 8. The screen grades the first WHOLE year where the stack reaches $2,000,
 * and the verdict says "72 / r". Those two only agree when the compounded crossing lands exactly on
 * 72 / r. For 6, 4 and 3 it does (1.06^12 = 2.012, 1.04^18 = 2.026, 1.03^24 = 2.033, each with the
 * year before under 2). For 8 it does NOT: 1.08^9 = 1.999, so the coins would still be one short
 * of the outline in the very year the verdict names, and the screen would contradict itself.
 * doublingYear() is therefore computed by compounding, never written as 72 / r, and
 * scripts/onboarding-try-it-pin.mjs checks the two agree for every chip (and fails when 8 is added).
 *
 * Pure module: no React, no runtime imports, so `node --import ./scripts/ts-resolve-hooks.mjs` can
 * load it in the pin. NOTHING here is persisted: this is not a Profile question, it writes no XP
 * (no ledger exists before signup) and it changes no recommendation.
 */

/** The example rates, first one is the graded one. Percent a year, whole numbers. */
export const CHIPS = [6, 4, 3] as const;
export type Rate = (typeof CHIPS)[number];

/** Where the stack starts, and what "doubled" means. */
export const START = 1000;
export const TARGET = START * 2;
/** One coin on screen is this many dollars. The count of marks IS the magnitude (an isotype). */
export const COIN_VALUE = 100;
/** Coins per row. 10 x 20pt + 9 x 4pt gaps = 236pt, which fits the 320pt-wide SE with gutters. */
export const GRID_COLUMNS = 10;
/** How many cells the dashed "$2,000" outline covers: 20 coins, the first two rows. */
export const GHOST_CELLS = TARGET / COIN_VALUE;

/** The rule's constant, as the lessons write it ("divide 72 by your return"). */
export const RULE = 72;

/** Value after `years` of yearly compounding at `rate` percent. Unrounded. */
export function value(rate: number, years: number): number {
  return START * Math.pow(1 + rate / 100, years);
}

/**
 * The first whole year the stack reaches TARGET, found by compounding.
 *
 * Deliberately NOT `RULE / rate`: the rule is an approximation, and the screen grades what the
 * coins actually do. The pin holds the two equal for every chip; if they ever disagree, the chip
 * is wrong, not this function.
 */
export function doublingYear(rate: number): number {
  if (!(rate > 0)) throw new Error(`doublingYear needs a positive rate, got ${String(rate)}`);
  let y = 0;
  while (value(rate, y) < TARGET) y += 1;
  return y;
}

/** The rule of 72's estimate, as the verdict writes it. */
export function ruleOf72(rate: number): number {
  return RULE / rate;
}

/**
 * The stepper's ceiling: twice the doubling year (24, 36, 48). Past that the stack would outgrow
 * five rows and push the stepper under the pinned button on a 667pt SE (design.md 1.2 layout).
 */
export function maxYears(rate: number): number {
  return 2 * doublingYear(rate);
}

/**
 * Whole coins for a value. FLOOR, never round: at 6% after 11 years the stack is $1,898, and
 * rounding would draw 19 coins, which reads as more than it is. A coin is drawn only once the
 * money for it exists, so the outline fills in exactly the graded year.
 */
export function coinsAt(rate: number, years: number): number {
  return Math.floor(value(rate, years) / COIN_VALUE);
}

/** The most coins the grid will ever hold at this rate, for a grid height that never jumps. */
export function maxCoins(rate: number): number {
  return coinsAt(rate, maxYears(rate));
}

/**
 * Dollars with thousands commas and no cents: 2012.19 -> "$2,012".
 *
 * Written out rather than toLocaleString, because Node's and Hermes' Intl builds are not guaranteed
 * to agree and the pin compares these strings byte for byte (same reason as parts/dial.ts).
 */
export function dollars(n: number): string {
  const r = Math.round(Math.abs(n));
  return `${n < 0 ? '-' : ''}$${String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

const yearsWord = (y: number): string => (y === 1 ? '1 year' : `${String(y)} years`);

// ─── Copy. No em dashes (CONSTITUTION 4, em-dash-prose-pin). Teen voice, short lines. ─────────

export const TITLE = `How long until ${dollars(START)} doubles?`;

/** The sub-line. Says "not a promise" on every rate, not only the first (CONSTITUTION 3.1/3.3). */
export function subLine(rate: number): string {
  return `At ${String(rate)}% a year, an example rate, not a promise.`;
}

/** The readout above the stack. Snaps; it never counts up (same rule as parts/dial-card.tsx). */
export function readout(rate: number, years: number): string {
  if (years === 0) return `${dollars(START)} today`;
  return `${dollars(START)} → ${dollars(value(rate, years))} after ${yearsWord(years)}`;
}

/** What VoiceOver hears on the stepper, value first. */
export function stepperValueText(rate: number, years: number): string {
  return `${yearsWord(years)}, ${dollars(value(rate, years))}`;
}

export const CHECK_LABEL = 'Check';
export const TRY_AGAIN_LABEL = 'Try again';
export const CONTINUE_LABEL = 'Continue';
export const WHY_LABEL = 'Why?';
export const ANOTHER_RATE_LABEL = 'Try another rate';

/**
 * The amber line. It points at the picture instead of giving the number away: design.md 1.2 and
 * brilliant-onboarding.md 4, there is no "See answer" on the first miss.
 */
export const MISS_TITLE = 'Not yet.';
export const MISS_LINE = 'Watch where the coins fill the dashed outline.';

/** The green line. The year is computed, the "72 / r" is computed, and the pin holds them equal. */
export function correctLine(rate: number): string {
  const d = doublingYear(rate);
  return `${yearsWord(d)}. That's the rule of 72: 72 ÷ ${String(rate)} = ${String(ruleOf72(rate))}.`;
}

/** Second miss: the answer, said plainly, so nobody is trapped on a screen before signup. */
export function revealLine(rate: number): string {
  return `It's ${correctLine(rate)}`;
}

/** Once solved, other chips show only the math: the verdict updates live as the rate changes. */
export function exploreLine(rate: number): string {
  return `At ${String(rate)}%: 72 ÷ ${String(rate)} = ${yearsWord(doublingYear(rate))} to double.`;
}

export const WHY_LINE = 'Divide 72 by the rate to get the years to double.';

// ─── State. A reducer so the grading rule is testable without rendering. ─────────────────────

/**
 *   idle      answering. Check is live once the years have been moved.
 *   miss      first wrong Check: amber bar, Try again.
 *   correct   right on the FIRST try, or right after a Try again.
 *   revealed  second wrong Check: stepper snapped to the answer, green bar, nobody trapped.
 */
export type Phase = 'idle' | 'miss' | 'correct' | 'revealed';

export type DoubleItState = {
  rate: number;
  years: number;
  phase: Phase;
  /** Wrong Checks so far. Only the first Check counts as "first try" (owner decision 4). */
  misses: number;
  /** Years moved since the last Check or Try again. Check is disabled until it is. */
  touched: boolean;
  /** True only when the very first Check was right. Frozen once set. */
  firstTry: boolean | null;
};

export function initialState(): DoubleItState {
  return { rate: CHIPS[0], years: 0, phase: 'idle', misses: 0, touched: false, firstTry: null };
}

export type DoubleItAction =
  | { type: 'setYears'; years: number }
  | { type: 'check' }
  | { type: 'tryAgain' }
  | { type: 'pickRate'; rate: number };

/** Whether the phase is final: the learner can Continue, and other rates unlock. */
export function isResolved(phase: Phase): boolean {
  return phase === 'correct' || phase === 'revealed';
}

export function reduce(state: DoubleItState, action: DoubleItAction): DoubleItState {
  switch (action.type) {
    case 'setYears': {
      // While the amber bar is up the stepper is locked: the answer being graded must be the one
      // the bar is talking about. Try again unlocks it.
      if (state.phase === 'miss') return state;
      const years = Math.max(0, Math.min(maxYears(state.rate), Math.round(action.years)));
      if (years === state.years) return state;
      return { ...state, years, touched: true };
    }
    case 'check': {
      if (state.phase !== 'idle' || !state.touched) return state;
      const right = state.years === doublingYear(state.rate);
      const firstTry = state.firstTry ?? (right && state.misses === 0);
      if (right) return { ...state, phase: 'correct', touched: false, firstTry };
      if (state.misses === 0) return { ...state, phase: 'miss', misses: 1, touched: false, firstTry: false };
      // Second miss: snap to the answer. The coins then sit exactly on the outline under the bar.
      return {
        ...state,
        phase: 'revealed',
        misses: state.misses + 1,
        years: doublingYear(state.rate),
        touched: false,
        firstTry: false,
      };
    }
    case 'tryAgain':
      return state.phase === 'miss' ? { ...state, phase: 'idle' } : state;
    case 'pickRate': {
      // Other rates are a reward for solving, not a way around the graded one.
      if (!isResolved(state.phase)) return state;
      if (!(CHIPS as readonly number[]).includes(action.rate) || action.rate === state.rate) return state;
      return { ...state, rate: action.rate, years: 0, touched: false };
    }
  }
}

/** The line the bar shows for a state, or null while answering (the bar is a Check button then). */
export function barLine(state: DoubleItState): string | null {
  if (state.phase === 'miss') return MISS_LINE;
  if (state.phase === 'idle') return null;
  if (state.rate !== CHIPS[0]) return exploreLine(state.rate);
  return state.phase === 'revealed' ? revealLine(state.rate) : correctLine(state.rate);
}

/** The bar's short bold title, said before its line. Null while answering. */
export function barTitle(state: DoubleItState): string | null {
  if (state.phase === 'idle') return null;
  if (state.phase === 'miss') return MISS_TITLE;
  if (state.rate !== CHIPS[0]) return 'Rule of 72';
  return state.phase === 'revealed' ? 'Here it is.' : 'You got it.';
}

// ─── Atlas. The slot is the integrator's; these are defaults it can use inside the step. ─────

/** Faces are AtlasExpression names (src/components/atlas.tsx), kept as strings so this stays pure. */
export type AtlasBeat = { face: 'thinking' | 'watching' | 'happy' | 'proud'; line: string | null };

/**
 * What Atlas does inside the step. `idle.line` is null on purpose: the line that opens this screen
 * reacts to the learner's previous answer (owner decision 2), and only the integrator knows it.
 * None of these repeat the bar's words (CONSTITUTION 5.1, say a thing once). No `celebrate`: the
 * hop is reserved for the reveal (design.md 1.2).
 */
export const ATLAS_BEATS: Record<Phase, AtlasBeat> = {
  idle: { face: 'thinking', line: null },
  miss: { face: 'watching', line: 'Close. Give it one more go.' },
  correct: { face: 'happy', line: 'Nice. That trick works on any rate.' },
  revealed: { face: 'proud', line: 'Now you know the trick.' },
};
