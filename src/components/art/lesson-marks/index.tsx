/**
 * Per-lesson marks — a DISTINCT icon for every lesson in the curriculum.
 *
 * ── WHY THIS EXISTS ALONGSIDE ../lesson-mark.tsx ──────────────────────────────────────────────
 * `lesson-mark.tsx` holds 40 marks chosen by `artKeyFor(title)`, a regex table. That fixed the
 * worst repetition (a course showing one glyph on 24 of 25 nodes) but it CANNOT guarantee
 * uniqueness: regexes are a preference order, not an assignment, so up to 5 lessons in a course
 * still shared a mark.
 *
 * This map assigns a mark per `courseId:num`, so uniqueness holds BY CONSTRUCTION. Adding a
 * course is one import plus one line in BY_COURSE.
 *
 * ── LOOKUP ORDER, and why the fallback stays ──────────────────────────────────────────────────
 *   1. an authored per-lesson mark, if this course/number has one
 *   2. otherwise the 40-key regex mark, which is always defined
 * The fallback is deliberate: a course whose file is not written yet degrades to a good-enough
 * mark rather than to a blank node. `coverage()` reports the gap honestly instead of hiding it.
 *
 * ── KEYED ON NUMBER, NOT TITLE ────────────────────────────────────────────────────────────────
 * Renaming a lesson keeps its mark. REORDERING lessons moves marks with the number, so if the
 * curriculum is resequenced these maps must be resequenced too. That is the tradeoff for not
 * depending on title text, which the auto-synced curriculum can change under us.
 */
import Svg from 'react-native-svg';

import { LessonMark, lessonMarkColor } from '../lesson-mark';
import { M as alternativeInvestments } from './alternative-investments';
import { M as appliedAccounting } from './applied-accounting';
import { M as behavioralFinance } from './behavioral-finance';
import { M as businessStrategy } from './business-strategy';
import { M as corporateFinance } from './corporate-finance';
import { M as financialAnalytics } from './financial-analytics';
import { M as globalEconomics } from './global-economics';
import { M as investingFundamentals } from './investing-fundamentals';
import { M as personalFinance } from './personal-finance';
import { M as quantitativeAnalysis } from './quantitative-analysis';
import { M as riskManagement } from './risk-management';
import { M as wealthManagement } from './wealth-management';

/** Course ids are the real ids from lib/curriculum (kebab-case), not the camelCase filenames. */
const BY_COURSE: Record<string, Record<number, React.ReactNode>> = {
  'investing-fundamentals': investingFundamentals,
  'personal-finance': personalFinance,
  'global-economics': globalEconomics,
  'corporate-finance': corporateFinance,
  'business-strategy': businessStrategy,
  'financial-analytics': financialAnalytics,
  'behavioral-finance': behavioralFinance,
  'applied-accounting': appliedAccounting,
  'quantitative-analysis': quantitativeAnalysis,
  'risk-management': riskManagement,
  'alternative-investments': alternativeInvestments,
  'wealth-management': wealthManagement,
};

export function hasLessonMarkFor(courseId: string, num: number): boolean {
  return Boolean(BY_COURSE[courseId]?.[num]);
}

/** How many lessons in a course have an authored mark. Used by the dev check and the gallery. */
export function coverage(courseId: string): number {
  return Object.keys(BY_COURSE[courseId] ?? {}).length;
}

export const COVERED_COURSES = Object.keys(BY_COURSE);

/**
 * The node renderer. Prefers the authored per-lesson mark, falls back to the regex mark.
 *
 * `color` is not defaulted on purpose — an active node's face is the course accent at 18%, so a
 * mark tinted with that same accent dissolves. Callers pass `lessonMarkColor(...)`, which owns
 * that rule. Re-exported here so a call site needs one import, not two.
 */
export function LessonNodeMark({
  courseId,
  num,
  fallbackKey,
  size = 38,
  color,
}: {
  courseId: string;
  num: number;
  /** From artKeyFor(title) — used when this lesson has no authored mark yet. */
  fallbackKey: string;
  size?: number;
  color: string;
}) {
  const authored = BY_COURSE[courseId]?.[num];
  if (!authored) return <LessonMark markKey={fallbackKey} size={size} color={color} />;

  // Same Svg envelope as LessonMark so authored and fallback marks are visually interchangeable:
  // identical viewBox, stroke weight and caps. A mismatch here would make the two tiers
  // distinguishable on the same path, which defeats the point.
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round">
      {authored}
    </Svg>
  );
}

export { lessonMarkColor };

if (__DEV__) {
  // ONE runnable check: report coverage honestly. 12 courses x 25 lessons = 300. Anything short of
  // that is a real gap, and silence here would let a half-finished set look finished.
  const total = COVERED_COURSES.reduce((n, c) => n + coverage(c), 0);
  if (total < 300) {
    console.warn(
      `[lesson-marks] ${total}/300 lessons have an authored mark ` +
        `(${COVERED_COURSES.length}/12 courses). The rest fall back to the 40-key regex marks.`,
    );
  }
  // A course file with the wrong key range is worse than a missing one — it silently shifts marks.
  for (const c of COVERED_COURSES) {
    const keys = Object.keys(BY_COURSE[c]).map(Number).sort((a, b) => a - b);
    const expected = Array.from({ length: keys.length }, (_, i) => i + 1);
    if (keys.some((k, i) => k !== expected[i])) {
      console.error(`[lesson-marks] "${c}" keys are not 1..n contiguous: ${keys.join(',')}`);
    }
  }
}
