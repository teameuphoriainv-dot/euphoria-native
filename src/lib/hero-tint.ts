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
import type { DigestCategory } from './digest-content';
import { heroSvg } from './digest-heroes';

/** The violet ramp every synced illustration is built from, darkest first. */
const VIOLET_RAMP = ['#5B21B6', '#7C3AED', '#A855EB', '#C89CF5', '#E7D5FB'] as const;

/** Hue-rotated ramps, index-aligned to VIOLET_RAMP. Hues come from COURSE_ACCENTS. */
const CATEGORY_RAMPS: Partial<Record<DigestCategory, readonly string[]>> = {
  // risk / alternative-investments rose, H351
  Credit: ['#B62137', '#ED3A54', '#EB556B', '#F59CA9', '#FBD5DB'],
  // global-economics cyan, H188
  Markets: ['#21A2B6', '#3AD5ED', '#55D7EB', '#9CE9F5', '#D5F6FB'],
  // business-strategy amber, H43
  Strategy: ['#B68C21', '#EDBB3A', '#EBC155', '#F5DC9C', '#FBF0D5'],
  // investing-fundamentals green, H158
  Investing: ['#21B680', '#3AEDAC', '#55EBB4', '#9CF5D5', '#D5FBED'],
  // 'Money basics' intentionally omitted -> keeps personal-finance violet.
};

const RAMP_RE = new RegExp(VIOLET_RAMP.join('|'), 'gi');

/** key + category -> tinted svg. Synced art is static, so this never invalidates. */
const cache = new Map<string, string | undefined>();

export function tintedHero(key: string, category: DigestCategory): string | undefined {
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
export function heroTint(category: DigestCategory): string | undefined {
  return CATEGORY_RAMPS[category]?.[2];
}
