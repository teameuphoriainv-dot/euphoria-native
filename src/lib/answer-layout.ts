/**
 * Answer layout and check-bar grading, as pure functions.
 *
 * Pure on purpose: scripts/check-bar-pin.mjs runs these under plain Node against the WRAPPED loader
 * (src/lib/curriculum/index.ts), and src/components/lesson-check-bar.tsx only draws what they return.
 * lesson.tsx is already over 1,400 lines, so the rules live here and the integrator passes results in.
 *
 * Three things live here:
 *   1. pickAnswerLayout: row / 2x2 grid / stack, from the options the learner will actually see.
 *   2. The check flow: pick, Check, first miss is amber with Try again, and a reducer for it.
 *   3. firstTryCounts: only the first attempt earns XP and mastery.
 */

// ─── 1. Layout by answer length ──────────────────────────────────────────────

export type AnswerLayout = 'row' | 'grid' | 'stack';

/** A row holds up to 3 tiles, each option at most this many characters. */
export const ROW_MAX_OPTIONS = 3;
export const ROW_MAX_CHARS = 12;
/** A 2x2 grid is exactly 4 options, each at most this many characters. */
export const GRID_OPTIONS = 4;
export const GRID_MAX_CHARS = 14;
/**
 * Above this Dynamic Type scale, short options still go in the stack.
 *
 * Prevents: at the accessibility text sizes a 14-character option in a half-width tile wraps to
 * three lines or truncates, and a truncated "$1,200,000" reads as a different number. The stack
 * gives every option the full width. This threshold is a design choice, not a measurement.
 */
export const TILE_MAX_FONT_SCALE = 1.35;

/** Characters as a reader counts them: code points, trimmed, so "$1,200" is 6 and an emoji is 1. */
const chars = (s: string): number => Array.from(s.trim()).length;

/**
 * Which answer layout a choice step gets.
 *
 * Pass the options AFTER the wrapped loader has shortened them (what lesson.tsx renders), not the
 * raw authored strings, or the layout is chosen for text the learner never sees.
 *
 * Prevents: four one-number answers ('9', '6', '12', '15') stacked as four full-width bars, which
 * spends a whole screen on four characters and pushes the question's own text up out of view.
 */
export function pickAnswerLayout(options: readonly string[], fontScale = 1): AnswerLayout {
  const n = options.length;
  if (n === 0 || fontScale > TILE_MAX_FONT_SCALE) return 'stack';
  // An empty option is a corpus defect; a tile would render it as a blank square that looks tappable
  // for no reason. The stack at least shows the row for what it is.
  if (options.some((o) => chars(o) === 0)) return 'stack';
  const longest = Math.max(...options.map(chars));
  if (n <= ROW_MAX_OPTIONS && n >= 2 && longest <= ROW_MAX_CHARS) return 'row';
  if (n === GRID_OPTIONS && longest <= GRID_MAX_CHARS) return 'grid';
  return 'stack';
}

// ─── 2. The check flow ───────────────────────────────────────────────────────

/**
 * What the verdict bar is saying.
 *   - correct: right answer (first try or not; XP is a separate question, see firstTryCounts).
 *   - retry:   first miss. Amber, with Try again and See answer.
 *   - answer:  the right answer is shown, after See answer or a second miss.
 */
export type Verdict = 'correct' | 'retry' | 'answer';

/**
 * The theme token each verdict paints with. Token NAMES, not hex, so the component resolves them
 * from LessonColors and the pin can read the mapping under Node.
 *
 * Prevents: a first miss in `destructive` red. Red on a first try reads as "you failed" before the
 * learner has had the second go the bar is offering them, which is the opposite of what Try again
 * says. Amber is `LessonColors.warning`, which already exists (lesson-design.ts).
 */
export const VERDICT_TONE: Readonly<Record<Verdict, 'success' | 'warning'>> = {
  correct: 'success',
  retry: 'warning',
  answer: 'warning',
};

/** Short, teen-voice lines. No em dashes (em-dash-prose-pin). */
export const VERDICT_TITLE: Readonly<Record<Verdict, string>> = {
  correct: 'Correct',
  retry: 'Not quite. One more try.',
  answer: 'Here is the answer',
};

/** A miss earns ONE Try again. The second miss shows the answer instead of a third guess. */
export const MAX_TRIES = 2;

/** Motion, from Brilliant's graded frames (research2/frames/brilliant/hi/correct_01.jpg). */
export const BAR_IN_MS = 180;
export const XP_AFTER_MS = 450;

export type CheckState = {
  /** The option the learner has selected and not yet checked, or null. */
  pick: number | null;
  /** One entry per Check press, true when that attempt was correct. */
  attempts: boolean[];
  /** Options greyed out by Try again. Rendered with lesson.tsx's existing `styles.eliminated`. */
  eliminated: number[];
  /** Null while the question is open; the bar is up whenever this is set. */
  verdict: Verdict | null;
  /** The last option checked, so the option list can paint it amber or green. */
  checkedPick: number | null;
};

export const initialCheckState: CheckState = {
  pick: null,
  attempts: [],
  eliminated: [],
  verdict: null,
  checkedPick: null,
};

export type CheckAction =
  | { type: 'pick'; index: number }
  | { type: 'check'; correctByOption: readonly boolean[] }
  | { type: 'tryAgain' }
  | { type: 'seeAnswer' };

/**
 * The check flow as a reducer. The integrator holds this in lesson.tsx with useReducer.
 *
 * Every branch that cannot apply returns the SAME state object, so a double tap on Check or a stale
 * Try again is a no-op rather than a second attempt counted against the learner.
 */
export function checkReducer(state: CheckState, action: CheckAction): CheckState {
  switch (action.type) {
    case 'pick': {
      // Prevents: re-picking an eliminated option, or changing the answer under a showing verdict.
      if (state.verdict !== null || state.eliminated.includes(action.index)) return state;
      if (state.pick === action.index) return state;
      return { ...state, pick: action.index };
    }
    case 'check': {
      if (state.verdict !== null || state.pick === null) return state;
      const correct = action.correctByOption[state.pick] === true;
      const attempts = [...state.attempts, correct];
      const verdict: Verdict = correct ? 'correct' : attempts.length >= MAX_TRIES ? 'answer' : 'retry';
      return { ...state, attempts, verdict, checkedPick: state.pick };
    }
    case 'tryAgain': {
      // Prevents: a Try again from a correct or revealed bar re-opening a question that is settled.
      if (state.verdict !== 'retry' || state.checkedPick === null) return state;
      return {
        ...state,
        pick: null,
        verdict: null,
        eliminated: state.eliminated.includes(state.checkedPick)
          ? state.eliminated
          : [...state.eliminated, state.checkedPick],
        checkedPick: null,
      };
    }
    case 'seeAnswer': {
      if (state.verdict !== 'retry') return state;
      return { ...state, verdict: 'answer' };
    }
  }
}

// ─── 3. Scoring ──────────────────────────────────────────────────────────────

/**
 * True only when the FIRST attempt was correct. This is the only thing that earns XP or mastery.
 *
 * Prevents: Try again turning every question into a free pass. With one retry on a four-option
 * question, a learner who guesses gets it "right" half the time on the second go; counting that
 * would put guesses into mastery (the same defect as the boilerplate-marked wrong answers found in
 * the 2026-07-25 content audit, where assessments were free to pass).
 */
export function firstTryCounts(attempts: readonly boolean[]): boolean {
  return attempts.length > 0 && attempts[0] === true;
}
