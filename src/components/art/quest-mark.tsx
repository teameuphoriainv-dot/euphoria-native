/**
 * QuestMark — one authored 48×48 mark per quest kind on Home. UNIT 12 deliverable 4.
 *
 * Same system as stat-mark.tsx and course-mark.tsx: stroke-only, single-colour, tinted by the
 * caller. §12's rule is explicit — utility glyphs come from the library, identity art is authored —
 * and the three daily quests are identity: they are the thing the user is asked to do every day.
 *
 * ── THE TEST THAT MATTERS ─────────────────────────────────────────────────────────────────────
 * These render at ~20pt inside a completion ring, far smaller than the 34pt stat marks, so detail
 * dies faster. Each must read at that size AND differ from every mark already in the app:
 *   lesson  open spread   vs stat `lessons` (three OFFSET sheets) and `guides` (one sheet, folded
 *                            corner) — this is two facing pages on a spine, a different silhouette
 *   goal    ring + arc    vs stat `xp` (star) and `earned` (circle with a $ inside) — this circle
 *                            is BROKEN, an open arc, and carries nothing in the middle
 *   trade   two arrows    vs the Investor crest (ONE elbow line with a head) — this is two opposed
 *                            shafts, which reads as exchange rather than as growth
 *
 * NATIVE-ONLY, like its siblings, by the same explicit decision.
 */
import Svg, { Path } from 'react-native-svg';

const MARKS = {
  /** An open spread: two facing pages meeting at a spine. Not a stack, not a single sheet. */
  lesson: (
    <>
      <Path d="M24 15c-4-3-9-4-14-4v25c5 0 10 1 14 4 4-3 9-4 14-4V11c-5 0-10 1-14 4Z" />
      <Path d="M24 15v25" />
    </>
  ),
  /**
   * A flag on a pole — the end of a run, which is exactly what a daily goal is.
   *
   * This WAS a broken ring with a tick at the top, meant to read as "a goal partly travelled". On
   * the rendered contact sheet it read unmistakably as REFRESH/RELOAD, because a circle with a tail
   * is that universal glyph and nothing else. Same class of mistake as stat-mark's coin stack
   * reading as a database, and caught the same way: by looking at the render rather than the source.
   * A flag cannot be misread, and nothing else in the app is one.
   */
  goal: (
    <>
      <Path d="M14 8v33" />
      <Path d="M14 11h20l-5 7 5 7H14Z" />
    </>
  ),
  /** Two opposed shafts, each with a head — an exchange, which is what a paper trade is. */
  trade: (
    <>
      <Path d="M13 19h22" />
      <Path d="M28 12l7 7-7 7" />
      <Path d="M35 33H13" />
      <Path d="M20 26l-7 7 7 7" />
    </>
  ),
} satisfies Record<string, React.ReactNode>;

export type QuestMarkName = keyof typeof MARKS;

export const QUEST_MARK_NAMES = Object.keys(MARKS) as QuestMarkName[];

export function QuestMark({
  name,
  size = 20,
  color,
}: {
  name: QuestMarkName;
  size?: number;
  color: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={color}
      // Heavier than stat-mark's 2.2 because these render at 20pt rather than 34pt; the same
      // relative weight would thin out to nearly nothing.
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round">
      {MARKS[name]}
    </Svg>
  );
}

if (__DEV__) {
  // Same one runnable check as stat-mark.tsx: a name mapping to nothing renders an empty <Svg>,
  // which reads as a spacing bug rather than a missing icon.
  for (const n of QUEST_MARK_NAMES) {
    if (!MARKS[n]) console.error(`[quest-mark] "${n}" resolved to nothing — it renders blank.`);
  }
  if (QUEST_MARK_NAMES.length !== 3) {
    console.error(`[quest-mark] expected 3 marks, one per QuestKind, found ${QUEST_MARK_NAMES.length}`);
  }
}
