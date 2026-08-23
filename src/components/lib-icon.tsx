/**
 * LibIcon — the ONE place library (Hugeicons) glyphs enter the app.
 *
 * ── WHY THIS FILE IS SO SMALL, AND MUST STAY SO ───────────────────────────────────────────
 * This app already has TWO authored icon systems, and neither is being replaced:
 *
 *   icon.tsx  + lib/euphoria-icons.ts   ~112 multicolor SVGs, SHARED WITH THE WEB APP so
 *                                       icons are pixel-identical across platforms.
 *                                       Decorative / illustration moments.
 *   ui-icon.tsx                         24 hand-drawn 24x24 marks, stroke 2.2, single colour.
 *                                       Chrome: tab bar, list rows, inline glyphs. 34 callers.
 *
 * ui-icon.tsx ALREADY provides lock, close, chevronLeft, chevronRight, check, bell, search
 * and arrowRight. Re-exporting any of those from here would let two screens render a
 * DIFFERENT padlock depending on which import the author reached for — a visual-consistency
 * defect that no type-checker would catch and no single screenshot would reveal.
 *
 * So the rule is: LibIcon carries ONLY glyphs ui-icon.tsx does not have.
 * Before adding a name here, grep ui-icon.tsx and lib/euphoria-icons.ts first.
 * If it exists there, use it from there.
 *
 * ── WHY LIBRARY GLYPHS AT ALL ─────────────────────────────────────────────────────────────
 * Nobody is differentiated by a share arrow. Utility chrome is pure cost to hand-author.
 * But identity art is NOT utility chrome and never comes from here — course marks, stat-tile
 * marks, league crests, quest icons and guide covers are authored in the existing style.
 * That is what the reference set actually does. Of the three $450k-750k/mo education apps
 * whose topic-identity screens were verified IN PIXELS (not prose):
 *   Elevate  1395  bespoke flat art + distinct accent colour per skill   screen 111647
 *   Astra AI 2190  system EMOJI in a grey chip                          screen 323574
 *   Nibble    918  system EMOJI                                         screen 132884
 * Two spend nothing, one spends real art budget, ZERO use a generic stroke-icon pack for
 * identity. Hugeicons' own docs concede finance has fewer options than other domains.
 *
 * ── IMPORTS ARE DEEP ON PURPOSE ───────────────────────────────────────────────────────────
 * `from '@hugeicons/core-free-icons'` pulls a barrel that babel already warned exceeds 500KB
 * ("the code generator has deoptimised the styling of .../core-free-icons/dist/cjs/index.js").
 * The subpath export maps `./Add01Icon` -> dist/esm/Add01Icon.js (~350B) with real types at
 * dist/types/Add01Icon.d.ts, so per-glyph imports cost only what they use.
 */
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import Share01Icon from '@hugeicons/core-free-icons/Share01Icon';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';

import { useTheme } from '@/hooks/use-theme';

/**
 * `satisfies`, NEVER `const G: Record<string, IconSvgElement>`.
 *
 * That annotation widens `keyof typeof G` to `string` and defeats the guard entirely. It
 * already happened in ui-icon.tsx, whose own comment claimed the union was "deliberately NOT
 * | string" while the annotation was quietly undoing it — `arrowUp`, `refresh` and `x` all
 * shipped as silent sparkles. A typo must be a compile error, not a fallback glyph.
 */
const GLYPHS = {
  share: Share01Icon,
  plus: Add01Icon,
} satisfies Record<string, IconSvgElement>;

export type LibIconName = keyof typeof GLYPHS;

/** Every name this wrapper renders. The dev grid iterates this to prove each resolves. */
export const LIB_ICON_NAMES = Object.keys(GLYPHS) as LibIconName[];

export type LibIconProps = {
  name: LibIconName;
  size?: number;
  color?: string;
  /**
   * House stroke is 2.2, matching ui-icon.tsx's 24 authored marks. Hugeicons bakes
   * strokeWidth "1.5" into its path data, so WITHOUT this override a library glyph reads
   * visibly thinner than an authored one beside it on the same row. This override is the
   * only reason the two systems can share a screen without looking like two systems.
   */
  strokeWidth?: number;
};

export function LibIcon({
  name,
  size = 24,
  color,
  strokeWidth = 2.2,
}: LibIconProps) {
  /* Defaulted from the THEME, not from Colors.dark. A default-parameter cannot call a hook, and
   * the old default was a near-white — every icon that relied on it would have been invisible on
   * a light page. Callers passing an explicit colour are untouched. */
  const theme = useTheme();
  const tint = color ?? theme.text;
  return (
    <HugeiconsIcon icon={GLYPHS[name]} size={size} color={tint} strokeWidth={strokeWidth} />
  );
}

if (__DEV__) {
  // ONE runnable check: every glyph resolves to real path data.
  // A name mapping to nothing renders an empty <Svg>, which reads as a layout gap rather than
  // a missing icon — invisible in a screenshot until someone counts the marks. That is
  // exactly how four broken icons survived a whole session in ui-icon.tsx.
  for (const n of LIB_ICON_NAMES) {
    const g = GLYPHS[n] as IconSvgElement;
    if (!Array.isArray(g) || g.length === 0) {
      console.error(`[lib-icon] glyph "${n}" resolved to no path data — it renders blank.`);
    }
  }
}
