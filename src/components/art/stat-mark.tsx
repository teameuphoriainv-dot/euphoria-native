/**
 * StatMark — one authored 48×48 mark per stat tile on the You tab.
 *
 * Same system as course-mark.tsx and the same reasoning: stroke-only, single-colour, tinted by the
 * caller so the tile's accent lives IN the art rather than in a wash behind it. See course-mark.tsx
 * for the measured reason the tinted-chip approach was abandoned.
 *
 * These replace EUPHORIA_ICONS on the stat tiles, where the registry was doing double duty: `crown`
 * is amber-and-gold multicolour built for a league moment, and `post` is a generic document. Neither
 * was drawn to sit in a 2×2 grid beside three siblings, so the four tiles read as four unrelated
 * illustrations rather than one set.
 *
 * ── THE TEST THAT MATTERS ─────────────────────────────────────────────────────────────────────
 * At 34pt, in a 2×2 grid, no two may read as the same silhouette — and none may collide with the
 * twelve in course-mark.tsx either, since both appear in the same app. Checked deliberately:
 *   streak  flame          vs course art: nothing else is a flame
 *   lessons stacked pages  vs `open-book` in EUPHORIA_ICONS — this is a STACK, offset, not a spread
 *   xp      ascending rays vs `quantitative-analysis` scatter — rays converge, dots do not
 *   guides  folded page    vs lessons — one sheet with a turned corner, not three
 *   earned  coin stack     vs `wealth-management` coin canopy — three ellipses, not concentric rings
 *
 * NATIVE-ONLY, like course-mark.tsx, by the same explicit decision. Porting to
 * ~/euphoriaweb-current is owed work.
 */
// Path only — all five marks are stroke geometry. Adding Circle back means a mark is using it.
import Svg, { Path } from 'react-native-svg';

const MARKS = {
  /** A flame with an inner core — two curves, so it still reads at 34pt where detail dies. */
  streak: (
    <>
      <Path d="M24 6c-5 11-13 15-13 25a13 13 0 0 0 26 0c0-10-8-14-13-25Z" />
      <Path d="M24 24c-2 5-5 7-5 11a5 5 0 0 0 10 0c0-4-3-6-5-11Z" />
    </>
  ),
  /** Three offset sheets — a STACK you have worked through, not a book you are reading. */
  lessons: (
    <>
      <Path d="M11 17h18a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V20a3 3 0 0 1 3-3Z" />
      <Path d="M15 12h17a4 4 0 0 1 4 4" />
      <Path d="M19 7h16a5 5 0 0 1 5 5v16" />
    </>
  ),
  /**
   * A single clean star. The inner tick this used to carry read as a stray tail at 34pt — noise,
   * not detail. Distinct from `quantitative-analysis` (scattered dots) and from EUPHORIA_ICONS
   * `star-burst`, which is filled rather than stroked.
   */
  xp: <Path d="M24 8l5 11 11 2-8 8 2 12-10-6-10 6 2-12-8-8 11-2Z" />,
  /** One sheet with a turned corner and two text rules — a guide, singular, and clearly read. */
  guides: (
    <>
      <Path d="M12 7h16l9 9v25a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3Z" />
      <Path d="M28 7v9h9" />
      <Path d="M16 27h14M16 34h9" />
    </>
  ),
  /**
   * A coin with a dollar sign.
   *
   * This was three stacked ellipses — "coins seen edge-on" — and on device it read unmistakably as
   * a DATABASE, because that silhouette is the universal DB glyph. Caught by looking at the
   * rendered grid rather than at the source, which is the only way that class of mistake surfaces.
   *
   * A circle plus a $ cannot be misread, and it stays distinct from `wealth-management`'s
   * concentric coin-canopy, which has a trunk and no glyph inside.
   */
  earned: (
    <>
      <Path d="M24 9a15 15 0 1 0 0 30 15 15 0 0 0 0-30Z" />
      <Path d="M24 15v18" />
      <Path d="M29 20h-6a3.4 3.4 0 0 0 0 7h2a3.4 3.4 0 0 1 0 7h-6" />
    </>
  ),
} satisfies Record<string, React.ReactNode>;

export type StatMarkName = keyof typeof MARKS;

/** Every authored stat mark. The dev grid iterates this to prove each resolves and differs. */
export const STAT_MARK_NAMES = Object.keys(MARKS) as StatMarkName[];

export function StatMark({
  name,
  size = 34,
  color,
}: {
  name: StatMarkName;
  size?: number;
  /** The tile's accent. Required in practice — a stat mark with no colour is the old grey problem. */
  color: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round">
      {MARKS[name]}
    </Svg>
  );
}

if (__DEV__) {
  // ONE runnable check: every mark resolves to real children. A name mapping to nothing renders an
  // empty <Svg>, which reads as a spacing bug rather than a missing icon — the exact failure mode
  // that let four broken glyphs survive a whole session in ui-icon.tsx.
  for (const n of STAT_MARK_NAMES) {
    if (!MARKS[n]) console.error(`[stat-mark] "${n}" resolved to nothing — it renders blank.`);
  }
  if (STAT_MARK_NAMES.length !== 5) {
    console.error(`[stat-mark] expected 5 marks for the You grid, found ${STAT_MARK_NAMES.length}`);
  }
}
