/**
 * NativeWind 4 + Tailwind 3 config. NEW SURFACES ONLY (decision 6) — the ~50 existing
 * StyleSheet files are NOT migrating.
 *
 * WHY THE COLORS ARE DUPLICATED HERE: Tailwind's config is read by the Tailwind CLI at build
 * time, which cannot import a .ts module. So these values are a HAND COPY of the ramp in
 * src/constants/theme.ts, and that is the one real cost of adopting NativeWind here.
 *
 * The names below deliberately mirror theme.ts key-for-key (`card`, `cardElevated`,
 * `backgroundSelected`, `mutedForeground`) rather than inventing shorter aliases, so a
 * divergence between the two files is visible by grep instead of requiring a lookup table.
 *
 * IF YOU CHANGE A COLOR IN theme.ts, CHANGE IT HERE IN THE SAME COMMIT.
 *
 * Pin note: NativeWind 4.2.6's peer range is `tailwindcss: >3.3.0`, which 4.x ALSO satisfies.
 * Tailwind must stay on ^3 — a v4 config compiles to nothing and every className silently
 * no-ops, which looks exactly like "the styles just aren't applying yet".
 */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // SURFACE RAMP — tiers ~5 lightness points apart. See the long comment in theme.ts
        // for why tokens that share a value share a TIER rather than colliding by accident.
        background: '#09090D', //          tier 0  the screen itself
        card: 'hsl(240 10% 9%)', //        tier 1  default raised surface
        backgroundElement: 'hsl(240 10% 9%)', // tier 1  inline element
        cardElevated: 'hsl(240 10% 14%)', //     tier 2  inputs, raised cards, fills
        input: 'hsl(240 10% 14%)', //            tier 2
        muted: 'hsl(240 10% 14%)', //            tier 2
        backgroundSelected: 'hsl(240 10% 19%)', // tier 3 active/selected, must beat tier 2
        border: 'hsl(240 10% 22%)', //     line   must exceed what it outlines

        // TYPE. There is no `foreground` token in this app — it is `text`. Naming it `fg`
        // here would reintroduce the same confusion from the other direction.
        text: 'hsl(240 5% 96%)',
        textSecondary: '#C3BAD0',
        mutedForeground: '#A79DB5',

        // BRAND. Hex, not hsl(), because the codebase appends alpha as `color + '22'`,
        // which is only valid on 8-digit hex.
        primary: '#A855EB',
        primaryForeground: '#FFFFFF',
        accent: '#B57BEF',
        success: '#22C55E',
        warning: '#F5B33F',
        destructive: '#EF4444',

        // Chrome accents. NOT the content-art palette — lesson art is full-spectrum by
        // design and amber/emerald/mint/sky/indigo all outrank violet in it.
        iconViolet: '#BB83F1',
        iconPurple: '#A451E6',
        iconLilac: '#C89CF5',
        iconGold: '#FBBF24',
      },
    },
  },
};
