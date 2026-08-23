/**
 * Per-category hue rotation for digest hero + figure art.
 *
 * WHY THIS EXISTS AT RENDER TIME, NOT IN THE ART:
 * digest-heroes.ts is auto-synced from the web repo and carries a DO-NOT-EDIT
 * banner, so recolouring the 54 SVGs in place would be wiped by the next
 * ./scripts/sync-digest.sh. Rotating hue here keeps the fix durable and lets
 * web and native diverge on palette without forking the artwork.
 *
 * WHY HUE-ONLY:
 * every stop below preserves the *exact* lightness and saturation of the violet
 * it replaces — only H moves. The illustrations' internal contrast structure is
 * therefore untouched, which is what makes them readable at 320x200. Taking the
 * accent's own saturation instead blew out the darkest stop (#5B21B6 -> #CD0A0A,
 * a pure alarm red as the dominant base fill).
 *
 * 'Money basics' is deliberately absent: it keeps the brand violet, leaving
 * ~20% of content-band art brand-hued. That is the Brilliant benchmark (20.2%),
 * not an oversight. See refs/MOTION_RESEARCH_V3.md §D2.
 */
import { heroSvg } from './digest-heroes';

/** The violet ramp every synced illustration is built from, darkest first. */
const VIOLET_RAMP = ['#5B21B6', '#7C3AED', '#A855EB', '#C89CF5', '#E7D5FB'] as const;

/** Hue-rotated ramps, index-aligned to VIOLET_RAMP. Hues come from COURSE_ACCENTS. */
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

const RAMP_RE = new RegExp(VIOLET_RAMP.join('|'), 'gi');

/** key + category -> tinted svg. Synced art is static, so this never invalidates. */
const cache = new Map<string, string | undefined>();

export function tintedHero(key: string, category: string): string | undefined {
  const cacheKey = `${category}\0${key}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const xml = heroSvg(key);
  const ramp = CATEGORY_RAMPS[category];
  let out = xml;

  if (xml && ramp) {
    // Single pass with alternation, so a substituted stop can never be re-matched.
    out = xml.replace(RAMP_RE, (hit) => {
      const i = VIOLET_RAMP.indexOf(hit.toUpperCase() as (typeof VIOLET_RAMP)[number]);
      return i === -1 ? hit : ramp[i];
    });
  }

  cache.set(cacheKey, out);
  return out;
}

/**
 * The hue-rotated equivalent of `theme.primary` for a category.
 *
 * theme.primary is #A855EB, which is VIOLET_RAMP[2] exactly — so the panel wash behind a
 * tinted illustration has a precise counterpart in every category ramp and nothing is invented.
 * Without this the art recolours but its ground does not, leaving a cyan illustration sitting
 * on a violet wash: measured at 37.4% violet in the Markets content band, over the ≤35% target.
 *
 * Returns undefined for 'Money basics' (deliberately untinted) — callers keep theme.primary.
 */
export function heroTint(category: string): string | undefined {
  return CATEGORY_RAMPS[category]?.[2];
}
