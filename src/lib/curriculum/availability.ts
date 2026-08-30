/**
 * Native release availability for curriculum that is already present in the synced corpus.
 *
 * The web curriculum remains the content source of truth, but shipping authored data and making
 * it selectable are separate decisions. Keep this native-only release gate outside generated
 * files so the next curriculum sync cannot silently expose a course that has not passed release
 * review yet.
 */
// Allowlist, not a two-id denylist: a newly synced thirteenth course must remain unavailable until
// its own release audit passes. This also makes setActiveCourse reject unknown/corrupt ids.
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
]);

export const DEFAULT_AVAILABLE_COURSE_ID = 'investing-fundamentals';

export function isCourseAvailable(courseId: string): boolean {
  return AVAILABLE_IDS.has(courseId);
}

export function courseAvailability(courseId: string): 'available' | 'coming-soon' {
  return isCourseAvailable(courseId) ? 'available' : 'coming-soon';
}
