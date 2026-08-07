/**
 * CourseMark — one authored 48×48 mark per curriculum course.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────────────────────────
 * The course cards used to render EUPHORIA_ICONS inside a tinted square, and it read as unfinished
 * for two measurable reasons:
 *
 *   1. The chip was `courseAccent + '24'` — 14% alpha over a 9%-lightness card. A vivid
 *      #34D399 emerald composited to rgb(25,48,43): muddy, ~17 per channel away from the card
 *      it sat on. Nominally branded, perceptually grey.
 *   2. The icons carry NO per-course colour. `stocks`, `finance`, `global` and `data` are all
 *      #818CF8; `write`, `measure` and `lesson-shield` are all #6EE7B7. So the accent wash was
 *      doing the differentiation work the ART should do — which is why the chip could not simply
 *      be deleted.
 *
 * These marks fix the cause. Each is a distinct SILHOUETTE, stroke-only, single-colour, and tinted
 * by `courseAccent(id)` — so colour and shape both differentiate, and no wash is needed behind
 * them. That is Elevate's mechanism (screen 111647, verified in pixels): one mark plus one accent
 * colour per topic, sitting directly on the ground with no chip.
 *
 * ── DELIBERATE WEB DIVERGENCE — READ THIS ─────────────────────────────────────────────────────
 * `components/icon.tsx` exists so icons are PIXEL-IDENTICAL with ~/euphoriaweb-current. These marks
 * are NATIVE-ONLY by explicit user decision, so course identity now differs between web and native.
 * That is accepted, not accidental.
 *
 * The risk this creates, stated plainly: nothing syncs these. If someone later adds a course to the
 * web repo, native gets the dev-warning fallback below rather than a mark. If the web course art is
 * redesigned, the two platforms drift silently. Porting these to
 * euphoriaweb-current/src/features/pathway/ is owed work, not optional polish.
 *
 * ── RULES FOR ADDING ONE ──────────────────────────────────────────────────────────────────────
 * 48×48 viewBox · stroke 2.2 to match ui-icon.tsx · NO gradients and NO hardcoded colour, because
 * courseAccent supplies it · round caps and joins · keep it to 2–4 paths, since detail collapses
 * at the 40pt render size · and the only test that matters: at 40pt, no two marks may read as the
 * same silhouette. That is what the dev grid is for. Four icons once shipped as identical sparkles
 * because nobody looked at them side by side.
 */
import Svg, { Circle, Path } from 'react-native-svg';

import { COURSE_ACCENTS, courseAccent } from '@/lib/course-accents';

/**
 * `satisfies`, never a `Record<string, ...>` ANNOTATION — that widens the key type to `string` and
 * collapses the union, which is how ui-icon.tsx shipped four broken glyphs.
 */
const MARKS = {
  /** Growth from a base — a seedling, leaves at deliberately uneven heights so it reads organic. */
  'investing-fundamentals': (
    <>
      <Path d="M24 42V23" />
      <Path d="M24 32c-7 0-11-4-11-11 7 0 11 4 11 11Z" />
      <Path d="M24 27c7 0 11-4 11-11-7 0-11 4-11 11Z" />
    </>
  ),
  /** A wallet with its clasp — the everyday object, not an abstract coin. */
  'personal-finance': (
    <>
      <Path d="M7 21c0-3 2-5 5-5h24c3 0 5 2 5 5v13c0 3-2 5-5 5H12c-3 0-5-2-5-5Z" />
      <Path d="M30 27h11" />
      <Circle cx="30" cy="27" r="2.6" />
    </>
  ),
  /** A globe whose equator is drawn as a price line — economics, not geography. */
  'global-economics': (
    <>
      <Circle cx="24" cy="24" r="16" />
      <Path d="M9 25l7-5 6 7 8-9 9 6" />
      <Path d="M24 8c6 5 6 27 0 32" />
    </>
  ),
  /** A tapering stack pierced by one upward arrow — capital structure with a direction. */
  'corporate-finance': (
    <>
      <Path d="M10 35h28M14 27h20M18 19h12" />
      <Path d="M24 42V9" />
      <Path d="M19 14l5-5 5 5" />
    </>
  ),
  /** A knight, reduced. The only mark in the set with a diagonal head, so it never reads as another. */
  'business-strategy': (
    <>
      <Path d="M17 40h18" />
      <Path d="M31 36c0-8 4-14-1-21l-5 3 2-7c-7 2-11 8-8 14l-4 3" />
      <Path d="M20 36h11" />
    </>
  ),
  /** A magnifier over a candlestick — looking AT the data, which is the discipline. */
  'financial-analytics': (
    <>
      <Circle cx="21" cy="21" r="12" />
      <Path d="M30 30l10 10" />
      <Path d="M21 13v16" />
      <Path d="M17 18h8v8h-8Z" />
    </>
  ),
  /** A head with an off-centre pendulum — the bias, mid-swing, not resting. */
  'behavioral-finance': (
    <>
      <Path d="M16 40v-8c-4-4-6-9-5-14 2-8 10-12 17-10 8 2 11 10 8 17-2 4-4 7-4 11v4" />
      <Path d="M24 15l4 11" />
      <Circle cx="28" cy="27" r="2.8" />
    </>
  ),
  /** A balance scale, deliberately LEVEL — accounting's whole claim in one stroke. */
  'applied-accounting': (
    <>
      <Path d="M10 17h28" />
      <Path d="M24 12v25M16 40h16" />
      <Path d="M6 26c0 4 3 6 7 6s7-2 7-6Z" />
      <Path d="M28 26c0 4 3 6 7 6s7-2 7-6Z" />
    </>
  ),
  /** A scatter with a fitted line — the only mark built from discrete dots. */
  'quantitative-analysis': (
    <>
      <Path d="M9 36L39 14" />
      <Circle cx="14" cy="32" r="2.4" />
      <Circle cx="21" cy="30" r="2.4" />
      <Circle cx="28" cy="21" r="2.4" />
      <Circle cx="35" cy="19" r="2.4" />
    </>
  ),
  /** A shield with a notch taken out of one corner — protection that admits a gap. */
  'risk-management': (
    <>
      <Path d="M24 7l15 5v12c0 9-7 15-15 18-8-3-15-9-15-18V12Z" />
      <Path d="M31 9l8 8" />
    </>
  ),
  /** A key whose bit is notched like a chart step — access to something not publicly listed. */
  'alternative-investments': (
    <>
      <Circle cx="16" cy="16" r="8" />
      <Path d="M22 22l17 17" />
      <Path d="M31 31l-4 4M36 36l-3 3" />
    </>
  ),
  /** A tree whose canopy is a coin — the compounding metaphor, made one object. */
  'wealth-management': (
    <>
      <Circle cx="24" cy="17" r="11" />
      <Circle cx="24" cy="17" r="5" />
      <Path d="M24 42V28" />
      <Path d="M24 33l-6-5M24 31l7-5" />
    </>
  ),
} satisfies Record<string, React.ReactNode>;

export type CourseMarkId = keyof typeof MARKS;

/** Every authored mark. The dev grid iterates this to prove no two share a silhouette. */
export const COURSE_MARK_IDS = Object.keys(MARKS) as CourseMarkId[];

/**
 * True when an authored mark exists for this course id.
 *
 * Course ids arrive from `curriculum/courseIndex.ts`, which is AUTO-SYNCED FROM THE WEB REPO — so
 * TypeScript cannot vouch for them here, exactly as with `asEuphoriaIcon`. A new course added on
 * the web side reaches this file as an unknown string.
 */
export const hasCourseMark = (id: string): id is CourseMarkId => id in MARKS;

export function CourseMark({
  id,
  size = 40,
  color,
}: {
  id: string;
  size?: number;
  /** Defaults to the course's own accent, which is the entire point of these being single-colour. */
  color?: string;
}) {
  if (__DEV__ && !hasCourseMark(id)) {
    console.error(
      `[course-mark] no authored mark for course "${id}" — rendering the fallback ring. ` +
        `A course was probably added in the web repo; author a mark here to match.`,
    );
  }

  const stroke = color ?? courseAccent(id);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={stroke}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round">
      {hasCourseMark(id) ? (
        MARKS[id]
      ) : (
        // A plain ring, deliberately NOT one of the twelve. An unknown course must look unknown
        // rather than borrowing another course's identity.
        <>
          <Circle cx="24" cy="24" r="15" />
          <Path d="M24 17v10M24 31h.01" />
        </>
      )}
    </Svg>
  );
}

if (__DEV__) {
  // ONE runnable check: every course that has an accent must have a mark, and vice versa. A course
  // present in COURSE_ACCENTS but missing here renders the fallback ring in production, which reads
  // as a broken card rather than a missing asset.
  for (const id of Object.keys(COURSE_ACCENTS)) {
    if (!hasCourseMark(id)) console.error(`[course-mark] "${id}" has an accent but no mark`);
  }
  for (const id of COURSE_MARK_IDS) {
    if (!(id in COURSE_ACCENTS)) console.error(`[course-mark] "${id}" has a mark but no accent`);
  }
}
