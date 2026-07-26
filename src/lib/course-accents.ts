/**
 * Per-course accent color — ported verbatim from
 * euphoriaweb-current/src/features/pathway/components/courseAccents.ts so the rail,
 * lesson nodes and progress bars read identically on web and native.
 * Keys are the real course ids from '@/lib/curriculum'.
 */
export const COURSE_ACCENTS: Record<string, string> = {
  'investing-fundamentals': '#34D399',
  'personal-finance': '#B862ED',
  'global-economics': '#22D3EE',
  'corporate-finance': '#60A5FA',
  'business-strategy': '#FBBF24',
  'financial-analytics': '#FB923C',
  'behavioral-finance': '#F472B6',
  'applied-accounting': '#38BDF8',
  'quantitative-analysis': '#818CF8',
  'risk-management': '#F87171',
  'alternative-investments': '#FB7185',
  'wealth-management': '#F59E0B',
};

export function courseAccent(courseId: string): string {
  return COURSE_ACCENTS[courseId] ?? '#B862ED';
}
