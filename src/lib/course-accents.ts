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

/** Multiply a hex colour toward black. `amount` 0 leaves it alone, 1 is black. */
export function shade(hex: string, amount: number): string {
  const v = hex.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(v)) return hex;
  const f = 1 - amount;
  const ch = (o: number) =>
    Math.round(Number.parseInt(v.slice(o, o + 2), 16) * f)
      .toString(16)
      .padStart(2, '0');
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

/**
 * THE HERO FILL: the course accent deepened enough to carry WHITE TEXT.
 *
 * The accents above are Tailwind-400 pastels chosen as tints, borders and eyebrows on a dark card.
 * Used raw as a solid block they fail contrast for every one of the twelve -- white on the amber
 * `#FBBF24` is 1.67:1. Measured 2026-09-02 across all twelve against WCAG AA (4.5:1): at 35%
 * darkening three courses still fail; at 45% the worst is 5.11:1 and none fail; at 55% the worst
 * is 6.91:1.
 *
 * So the block runs from 55% deep to 45% lifted -- a saturated slab with a little light in one
 * corner, the way Oink's course card reads -- and BOTH ends are inside the passing range, so a
 * gradient cannot smuggle a failing stop in at one edge. These two numbers are the contrast
 * guarantee; do not loosen them without re-measuring, and course-hero-contrast-pin.mjs re-measures
 * them on every check so a future accent edit cannot silently break it.
 */
export const HERO_DEEP = 0.55;
export const HERO_LIFT = 0.45;
export function courseHeroFill(courseId: string): [string, string] {
  const a = courseAccent(courseId);
  return [shade(a, HERO_DEEP), shade(a, HERO_LIFT)];
}
