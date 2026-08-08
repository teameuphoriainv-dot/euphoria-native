/**
 * Euphoria design tokens — ported verbatim from euphoriaweb-current/src/index.css.
 * The app is dark-first (brand is celestial/observatory). `Colors.dark` is the primary
 * palette; `Colors.light` mirrors the web `:root` for completeness. Both share the same
 * keys so `ThemeColor` stays a valid `keyof`.
 */
import { Platform } from 'react-native';

export const Colors = {
  dark: {
    // surfaces (muted = euphoriaweb's #A79DB5 lavender-grey — legible on dark)
    text: 'hsl(240 5% 96%)',
    textSecondary: '#C3BAD0',
    mutedForeground: '#A79DB5',
    /**
     * SURFACE RAMP — four deliberate tiers, ~5 lightness points apart.
     *
     * These used to be seven tokens crammed between L4.3% and L15%, with two EXACT
     * collisions (backgroundSelected == border at 13%, input == muted at 15%). `card` sat
     * 2.7 points above `background`, which is the mechanical reason cards read as bordered
     * regions rather than raised objects on every screen in the app — a 2.7-point step is
     * below the threshold at which a surface change reads as elevation at all.
     *
     * Tokens that now share a value do so because they share a TIER, not by accident:
     * a card and an inline element sit at the same height; an input and a raised card sit
     * at the same height. Keep it that way — if a new token needs its own value, it needs
     * its own tier, and the ramp gets a fifth step rather than a crowded gap.
     *
     *   tier 0  background   4%   the screen itself
     *   tier 1  card         9%   default raised surface
     *   tier 2  elevated    14%   above a card: inputs, raised cards, fills
     *   tier 3  selected    19%   active/selected state, must beat tier 2 clearly
     *   line    border      22%   a LINE, not a surface — must exceed what it outlines
     */
    background: '#09090D',
    backgroundElement: 'hsl(240 10% 9%)',
    backgroundSelected: 'hsl(240 10% 19%)',
    card: 'hsl(240 10% 9%)',
    cardElevated: 'hsl(240 10% 14%)',
    border: 'hsl(240 10% 22%)',
    input: 'hsl(240 10% 14%)',
    muted: 'hsl(240 10% 14%)',
    // brand (HEX so `color + '22'` alpha suffixes are valid 8-digit hex)
    primary: '#A855EB',
    primaryForeground: '#FFFFFF',
    accent: '#B57BEF',
    success: '#22C55E',
    warning: '#F5B33F',
    /**
     * The streak flame. Identity, not a semantic state, so it is the same in both palettes for the
     * same reason iconGold is. Was hardcoded as #F97316 in FOURTEEN places across You, Home, Digest
     * and Lesson — the streak is the app's central habit signal and its colour could not be changed
     * without a grep. Found by UNIT 13's consistency pass.
     */
    streak: '#F97316',
    destructive: '#EF4444',
    // Violet/gold accents used by CHROME. This does NOT mirror the icon library: the most
    // common fills in EUPHORIA_ICONS are amber, emerald, mint, sky and indigo, and violet is
    // only the 6th. The old "matches EUPHORIA_ICONS fills" comment here is probably where the
    // belief that the app is violet-only came from — content art is full-spectrum by design.
    iconViolet: '#BB83F1',
    iconPurple: '#A451E6',
    iconLilac: '#C89CF5',
    iconGold: '#FBBF24',
    // gradient stops
    gradientFrom: 'hsl(274 76% 61%)',
    gradientTo: 'hsl(278 76% 66%)',
  },
  light: {
    text: 'hsl(240 10% 10%)',
    textSecondary: 'hsl(240 4% 40%)',
    mutedForeground: 'hsl(240 4% 46%)',
    background: 'hsl(0 0% 98%)',
    backgroundElement: 'hsl(240 5% 95%)',
    backgroundSelected: 'hsl(240 5% 90%)',
    card: 'hsl(0 0% 100%)',
    cardElevated: 'hsl(0 0% 100%)',
    border: 'hsl(240 6% 90%)',
    input: 'hsl(240 6% 90%)',
    muted: 'hsl(240 5% 95%)',
    primary: 'hsl(274 76% 61%)',
    primaryForeground: 'hsl(0 0% 100%)',
    accent: 'hsl(278 76% 66%)',
    success: 'hsl(142 71% 45%)',
    warning: 'hsl(45 93% 58%)',
    streak: '#F97316',
    destructive: 'hsl(0 84% 60%)',
    iconViolet: '#BB83F1',
    iconPurple: '#A451E6',
    iconLilac: '#C89CF5',
    iconGold: '#FBBF24',
    gradientFrom: 'hsl(274 76% 61%)',
    gradientTo: 'hsl(278 76% 66%)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Font families — loaded via useFonts in the root layout (see _layout.tsx). */
export const Fonts = {
  /** Nunito — rounded, friendly display/headings (matches design mockups) */
  display: 'Nunito_800ExtraBold',
  heading: 'Nunito_700Bold',
  /** EB Garamond — serif reserved for marketing/landing moments */
  serif: 'EBGaramond_700Bold',
  /** DM Sans — UI + body */
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }) as string,
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/**
 * The corner ramp. UNIT 13 item 1 extended the low end with the values ALREADY SHIPPING rather than
 * rounding them onto a tidier scale — rounding 5 to 6 or 7 to 8 would have changed pixels on
 * surfaces that were tuned by eye, and a consistency pass that silently restyles the app is a worse
 * outcome than the inconsistency it replaced.
 *
 * NOT every radius belongs here. A `borderRadius` that is exactly half of a stated width is
 * GEOMETRY, not design: it has to track the size, and freezing it to a token would break the circle
 * the moment the size changed. 23 such sites were deliberately left raw.
 */
/**
 * The type scale, UNIT 13 item 1.
 *
 * `themed-text.tsx` owns nine semantic VARIANTS (display/title/heading/body/small/label/code). This
 * is the flat size ramp those variants and their overrides draw from, so a size can be changed in
 * one place instead of grepped for across 117 call sites.
 *
 * Values are the ones ALREADY SHIPPING. As with Radius, nothing was rounded onto a tidier scale —
 * that would have restyled type that was set by eye, which is a worse outcome than the
 * inconsistency it replaces.
 *
 * A ramp this wide (21 steps) is itself the finding: 117 overrides against a 9-variant scale means
 * callers were routinely escaping it. Naming them does not fix that, it makes it visible.
 */
export const FontSize = {
  micro: 9,
  tiny: 10,
  label: 11,
  caption: 12,
  small: 13,
  smallPlus: 14,
  bodySm: 15,
  body: 16,
  bodyLg: 17,
  subhead: 18,
  heading: 19,
  headingLg: 20,
  headingXl: 21,
  titleSm: 22,
  title: 24,
  titleLg: 26,
  displaySm: 28,
  display: 30,
  displayMd: 32,
  displayLg: 34,
  hero: 40,
  heroXl: 56,
} as const;

export const Radius = {
  hairline: 2,
  track: 3,
  chipSm: 5,
  chip: 6,
  chipLg: 7,
  sm: 8,
  thumb: 10,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** CTA gradient — light violet → deep violet (matches design mockups). */
export const BrandGradient = ['#A78BFA', '#7C3AED'] as const;

export const BottomTabInset = Platform.select({ ios: 84, android: 68 }) ?? 68;
export const MaxContentWidth = 640;
