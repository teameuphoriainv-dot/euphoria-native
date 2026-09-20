/**
 * Euphoria design tokens — ported verbatim from euphoriaweb-current/src/index.css.
 * The app is dark-first (brand is celestial/observatory). `Colors.dark` is the primary
 * palette; `Colors.light` mirrors the web `:root` for completeness. Both share the same
 * keys so `ThemeColor` stays a valid `keyof`.
 */
import { Platform } from 'react-native';

/*
 * ALPHA-APPEND INVARIANT — read before changing any value below.
 *
 * 88 call sites in this app add transparency by string concatenation: `theme.primary + '30'`.
 * That produces a valid 8-digit hex ONLY if the value is hex. An `hsl(...)` value concatenated
 * with '30' is `hsl(274 76% 61%)30`, which React Native cannot parse — and it does not throw, it
 * renders the colour at FULL opacity. A 14% tint wash becomes a solid slab.
 *
 * That is exactly what light mode shipped as on the first pass: the free-trial card's tint painted
 * over its own progress bar. Five keys were involved; dark mode was unaffected only because its
 * values happened to already be hex.
 *
 * So: any key that is alpha-appended anywhere MUST be hex in BOTH palettes. theme-alpha-pin
 * enforces it by scanning the call sites rather than trusting a list kept here by hand.
 */
export const Colors = {
  dark: {
    /*
     * surfaces. muted was euphoriaweb's #A79DB5 lavender-grey at 7.05:1 on `card`.
     *
     * That is not a contrast failure — it clears WCAG AAA. The problem is that it is used 382
     * times across 76 files, so it is the app's DEFAULT register rather than its secondary one.
     * `text` runs 16.57:1; when more than half the copy sits at 7, nothing reads as spoken at
     * full volume and the whole app sounds tentative.
     *
     * #C6BFD2 is 10.22:1 — the same lavender family, clearly lifted, and still unmistakably
     * below `text`, so hierarchy survives. One token, every screen.
     */
    text: 'hsl(240 5% 96%)',
    textSecondary: '#C3BAD0',
    mutedForeground: '#C6BFD2',
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
    border: '#32323E',
    input: 'hsl(240 10% 14%)',
    muted: 'hsl(240 10% 14%)',
    // brand (HEX so `color + '22'` alpha suffixes are valid 8-digit hex)
    primary: '#A148E9',
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
    /**
     * CTA SLAB — the hard-cut block beneath a primary button.
     *
     * Added 2026-08-22 from the cofounder design doc: "I like a deep purple, brilliant, styled
     * button that's super defined and hard cut" and "they can't have the vibe-coded glow behind
     * them". The old GradientButton drew a violet->orchid LinearGradient over a 16px-radius box
     * and hung a shadowRadius:16 / shadowOpacity:.5 halo off it. That halo is the thing being
     * rejected. A slab is the opposite: a solid offset shape with ZERO blur, so the edge stays
     * hard at any scale.
     *
     * ctaDepth is the same hue as `primary` (274) at L36% rather than L61% — dark enough to read
     * as the side of a solid object, not as a shadow.
     */
    /**
     * PREMIUM COLOURWAY — pink -> orange, and it is NOT the brand violet.
     *
     * Lifted 2026-08-22 from the owner's own web pricing page (design doc refs 4 and 5): the
     * `Premium` wordmark, the Premium column's border, its check marks and the "Go Premium" CTA
     * all run this ramp, while everything non-Premium stays violet. That contrast IS the signal —
     * "We have special Premium colors... We will want these colors to be represented here and
     * throughout all Premium branding across the entire platform."
     *
     * Reserved for Premium surfaces. Using it on an ordinary CTA spends the one colour that means
     * "this is the paid thing" on something that isn't.
     */
    premiumFrom: '#E0409B',
    premiumTo: '#F5842B',
    ctaDepth: '#6516A2',
    ctaNeutral: '#F1EFF5',
    ctaNeutralDepth: '#BFB6CE',
    ctaNeutralInk: '#17141F',
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
    mutedForeground: '#71717A',
    background: '#FAFAFA',
    backgroundElement: 'hsl(240 5% 95%)',
    backgroundSelected: 'hsl(240 5% 90%)',
    card: 'hsl(0 0% 100%)',
    cardElevated: 'hsl(0 0% 100%)',
    border: '#E4E4E7',
    input: 'hsl(240 6% 90%)',
    muted: 'hsl(240 5% 95%)',
    primary: '#A349E6',
    primaryForeground: 'hsl(0 0% 100%)',
    accent: 'hsl(278 76% 66%)',
    success: '#21C45D',
    warning: '#F8C630',
    streak: '#F97316',
    destructive: '#EF4343',
    premiumFrom: '#E0409B',
    premiumTo: '#F5842B',
    ctaDepth: 'hsl(274 76% 36%)',
    ctaNeutral: 'hsl(0 0% 100%)',
    ctaNeutralDepth: 'hsl(240 6% 80%)',
    ctaNeutralInk: 'hsl(240 10% 10%)',
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
  /*
   * DM SANS THROUGHOUT, matching euphoriainv.com.
   *
   * These were Nunito, a rounded friendly face chosen against early mockups, and that put native
   * and web in two different typefaces for every heading in the product. The web loads exactly two
   * families: Tailwind maps BOTH `sans` and `heading` to DM Sans, and EB Garamond is `display`,
   * landing-page only by house rule and never on a control.
   *
   * Traced on the web app 2026-09-02 while looking for the "premium button font": there isn't one.
   * The pricing CTAs set no font-family at all and simply inherit DM Sans. What reads as a distinct
   * typeface there is weight (700 on a small pill), a full-round pill, and the 3D lip pressing 3px
   * on active -- all three of which native already has. So aligning the family costs nothing and
   * removes the one real divergence.
   *
   * Weights map to the web's own usage: font-black (900) for display, font-bold (700) for heading.
   */
  display: 'DMSans_900Black',
  heading: 'DMSans_700Bold',
  /** EB Garamond — serif reserved for marketing/landing moments */
  serif: 'EBGaramond_700Bold',
  /** DM Sans — UI + body */
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  black: 'DMSans_900Black',
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
  displayLg: 34,
  hero: 40,
  // REMOVED, 2026-08-18: displayMd (32) and heroXl (56) had ZERO references by any path —
  // no `FontSize.x`, no `ThemedText type="x"` (neither name is a ThemedText variant), no
  // raw use. Verified before deleting rather than trusting the audit, because the same lane
  // once reported `hero` as dead and streak-ignite.tsx now depends on it.
  //
  // The nine remaining 1pt-apart steps between 13 and 22 are NOT touched here. Merging them
  // changes rendered sizes across the app, which is a visual-design decision and belongs to
  // the owner, not to an audit loop deleting things it can prove nobody uses.
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
