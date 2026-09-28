/**
 * Per-category hue for the Digest's category tiles and iOS guide panels.
 *
 * HISTORY. This used to recolour the web's synced SVG hero and figure art at render time, by
 * rotating the hue of every stop in its violet ramp. On 2026-09-28 the owner removed that art:
 * synced guides carry real photos now, which are never tinted. What survives is the one colour
 * per category that the tiles and the pixel-sprite panels are washed in, kept as the same ramps
 * so the category colours the owner has already seen do not change.
 *
 * 'Money basics', 'Research' and 'Product' are deliberately absent: they keep the brand violet
 * (theme.primary). Product is the app talking about itself; Research has no hue left that is not
 * already one of the ramps below.
 */

/** Five-stop ramps, darkest first; index 2 is the tint. Hues come from COURSE_ACCENTS. */
/*
 * Keyed by plain string, not DigestCategory. iOS adds its own categories in digest-extra.ts, and
 * that module imports the pixel catalogue — narrowing this to a union that lives in digest-extra
 * would make hero-tint depend on it and close an import cycle. The categories are data either way.
 */
const CATEGORY_RAMPS: Partial<Record<string, readonly string[]>> = {
  // risk / alternative-investments rose, H351
  Credit: ['#B62137', '#ED3A54', '#EB556B', '#F59CA9', '#FBD5DB'],
  // global-economics cyan, H188
  Markets: ['#21A2B6', '#3AD5ED', '#55D7EB', '#9CE9F5', '#D5F6FB'],
  // business-strategy amber, H43
  Strategy: ['#B68C21', '#EDBB3A', '#EBC155', '#F5DC9C', '#FBF0D5'],
  // investing-fundamentals green, H158
  Investing: ['#21B680', '#3AEDAC', '#55EBB4', '#9CF5D5', '#D5FBED'],
  // 'Money basics' intentionally omitted -> keeps personal-finance violet.

  // ── categories added on iOS (digest-extra.ts). Hues chosen to sit clear of the four above, so
  //    no two category bands read as the same colour when the library is scrolled.
  // warm orange, H25 — money coming IN, deliberately warmer than Strategy's amber
  Earning: ['#B65221', '#ED7A3A', '#EB8A55', '#F5BE9C', '#FBE4D5'],
  // blue, H215 — the one cool hue not already spoken for by Markets' cyan
  Housing: ['#215BB6', '#3A82ED', '#5590EB', '#9CC0F5', '#D5E5FB'],
  // magenta, H320 — an alarm hue that is NOT Credit's rose, so a fraud guide never reads as debt
  'Staying safe': ['#B62194', '#ED3AC4', '#EB55CB', '#F59CE2', '#FBD5F1'],
  // yellow-green, H80 — far enough from Investing's H158 emerald to never be mistaken for it
  Insurance: ['#7CB621', '#A8ED3A', '#B0EB55', '#D3F59C', '#EDFBD5'],
  /*
   * DESATURATED SLATE, and deliberately the only unsaturated ramp in the set. Every other hue is
   * spoken for, and rather than squeeze a seventh colour between two existing ones this category
   * opts out: a car or a wedding is the considered, expensive decision, and a grey-blue band reads
   * as exactly that beside six bright ones.
   */
  'Big purchases': ['#3F4A5C', '#5D6E8A', '#7286A6', '#A9B7C9', '#D8DFE8'],
};

/**
 * A category's counterpart of `theme.primary`: each ramp's index 2 is the old violet stop #A855EB
 * with only the hue moved, so a tinted wash sits at the same lightness in every category.
 *
 * Returns undefined for the untinted categories; callers fall back to theme.primary.
 */
export function heroTint(category: string): string | undefined {
  return CATEGORY_RAMPS[category]?.[2];
}
