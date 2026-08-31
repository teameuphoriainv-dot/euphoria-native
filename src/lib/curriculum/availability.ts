/**
 * Native release availability for curriculum that is already present in the synced corpus.
 *
 * The web curriculum remains the content source of truth. Every currently authored course is
 * available in native; this native-only allowlist stays outside generated files so unknown ids
 * and any future, not-yet-reviewed course still fail closed.
 */
// Allowlist, not a blanket `true`: a newly synced thirteenth course must remain unavailable until
// it is intentionally added. This also makes setActiveCourse reject unknown/corrupt ids.
const AVAILABLE_IDS = new Set([
  'investing-fundamentals',
  'personal-finance',
  'global-economics',
  'corporate-finance',
  'business-strategy',
  'financial-analytics',
  'behavioral-finance',
  'applied-accounting',
  'quantitative-analysis',
  'risk-management',
  'alternative-investments',
  'wealth-management',
]);

export const DEFAULT_AVAILABLE_COURSE_ID = 'investing-fundamentals';

export function isCourseAvailable(courseId: string): boolean {
  return AVAILABLE_IDS.has(courseId);
}

export function courseAvailability(courseId: string): 'available' | 'coming-soon' {
  return isCourseAvailable(courseId) ? 'available' : 'coming-soon';
}
