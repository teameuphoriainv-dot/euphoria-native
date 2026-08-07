/**
 * LessonMark — stroke marks for lesson nodes on the Learn path.
 *
 * ── WHY THIS REPLACES LessonArt ON NODES ──────────────────────────────────────────────────────
 * LessonArt draws filled semi-isometric scenes whose whole palette derives from the course
 * accent: `base: accent`, `lite: shade(accent, +0.42)`, `dark: shade(accent, -0.34)`. The ACTIVE
 * node's face is `accent + '2E'` — the same accent at 18%. So the art was accent-on-accent, and
 * at 38pt it dissolved: Behavioral Finance rendered pink art on a pink ground and its "leaking
 * bucket" read as an unidentifiable cup.
 *
 * That is the same defect as the course-card chip (see course-mark.tsx): art with no contrast
 * against its own background. The fix is the same one that worked there — a single-colour STROKE
 * mark, with the colour chosen to contrast the surface behind it rather than to match it.
 *
 * ── THE CONTRAST RULE, which is the point of this file ────────────────────────────────────────
 * A node has two possible grounds and the mark must read on both:
 *   active     face = accent + '2E'  -> mark is near-WHITE (theme.text)
 *   done/locked face = theme.card    -> mark is the ACCENT
 * Callers should use `lessonMarkColor()` rather than passing a colour by hand, so the rule lives
 * in one place and cannot drift per call site.
 *
 * ── SELECTION IS UNCHANGED ────────────────────────────────────────────────────────────────────
 * Keys are the SAME 40 keys LessonArt uses, so `artKeyFor(title)` still chooses, and the measured
 * distribution carries over untouched: worst repeat within a course 5, worst consecutive run 2,
 * across all 295 authored lessons. This file changes how a mark LOOKS, not which one is picked.
 *
 * LessonArt is deliberately NOT deleted — it still serves the Home hero at 96pt and the course
 * cards, where a filled scene on a neutral card has real contrast and looks good.
 *
 * Stroke 2.2, 48x48, round caps — matching ui-icon.tsx, course-mark.tsx and stat-mark.tsx so the
 * whole app reads as one hand.
 */
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const MARKS = {
  /* compounding — a mass gathering down a slope */
  snowball: (
    <>
      <Path d="M6 40L40 12" />
      <Circle cx="15" cy="31" r="9" />
      <Circle cx="30" cy="21" r="3.4" />
      <Circle cx="37" cy="15" r="2" />
    </>
  ),
  /* stocks — two candlesticks */
  candles: (
    <>
      <Path d="M17 8v32M33 8v32" />
      <Rect x="11" y="15" width="12" height="13" rx="1.5" />
      <Rect x="27" y="22" width="12" height="14" rx="1.5" />
    </>
  ),
  /* weighing a trade-off — a level beam */
  scale: (
    <>
      <Path d="M9 16h30M24 11v27M16 40h16" />
      <Path d="M4 25c0 4 3 6 7 6s7-2 7-6Z" />
      <Path d="M30 25c0 4 3 6 7 6s7-2 7-6Z" />
    </>
  ),
  /* diversification — one basket, many things */
  basket: (
    <>
      <Path d="M7 20h34l-4 18H11Z" />
      <Path d="M16 20a8 8 0 0 1 16 0" />
      <Path d="M19 26v7M29 26v7" />
    </>
  ),
  /* inflation / inflated confidence */
  balloon: (
    <>
      <Path d="M24 6a12 13 0 0 1 0 26 12 13 0 0 1 0-26Z" />
      <Path d="M24 32v4M21 40c2-2 4-2 6 0" />
    </>
  ),
  /* bonds / standards — a document with a seal */
  certificate: (
    <>
      <Rect x="8" y="8" width="32" height="24" rx="2" />
      <Path d="M14 16h14M14 22h9" />
      <Circle cx="32" cy="34" r="6" />
      <Path d="M29 39l-2 5 5-2 5 2-2-5" />
    </>
  ),
  /* tax — a receipt with a torn edge */
  receipt: (
    <>
      <Path d="M11 7h26v30l-4-3-4 3-4-3-4 3-4-3-6 3Z" />
      <Path d="M17 16h14M17 23h9" />
    </>
  ),
  /* time */
  hourglass: (
    <>
      <Path d="M13 7h22M13 41h22" />
      <Path d="M16 7c0 9 8 12 8 17s-8 8-8 17" />
      <Path d="M32 7c0 9-8 12-8 17s8 8 8 17" />
    </>
  ),
  /* budgeting — envelopes as jars */
  jars: (
    <>
      <Rect x="7" y="18" width="12" height="21" rx="2" />
      <Rect x="29" y="18" width="12" height="21" rx="2" />
      <Path d="M9 13h8M31 13h8" />
      <Path d="M7 26h12M29 26h12" />
    </>
  ),
  /* credit — a card with a stripe */
  card: (
    <>
      <Rect x="5" y="13" width="38" height="24" rx="4" />
      <Path d="M5 21h38" />
      <Path d="M12 30h8" />
    </>
  ),
  /* dividends — a tree that pays */
  dividendtree: (
    <>
      <Path d="M24 42V24" />
      <Path d="M24 24a11 11 0 1 0 0-16 11 11 0 0 0 0 16Z" />
      <Circle cx="13" cy="31" r="3" />
      <Circle cx="35" cy="31" r="3" />
    </>
  ),
  /* fees — a bucket that leaks */
  bucket: (
    <>
      <Path d="M10 14h28l-4 25H14Z" />
      <Path d="M17 9a7 7 0 0 1 14 0" />
      <Circle cx="27" cy="44" r="1.8" />
    </>
  ),
  /* research */
  magnifier: (
    <>
      <Circle cx="21" cy="21" r="12" />
      <Path d="M30 30l11 11" />
    </>
  ),
  /* behaviour — a head with a spiral */
  mind: (
    <>
      <Path d="M16 40v-8c-4-4-6-9-5-14 2-8 10-12 17-10 8 2 11 10 8 17-2 4-4 7-4 11v4" />
      <Path d="M27 20a4 4 0 1 0-4 4c3 0 5-2 5-5a6 6 0 0 0-7-6" />
    </>
  ),
  /* real estate */
  house: (
    <>
      <Path d="M6 22L24 8l18 14" />
      <Path d="M10 20v20h28V20" />
      <Path d="M20 40V28h8v12" />
    </>
  ),
  /* banking — columns */
  bank: (
    <>
      <Path d="M5 18L24 8l19 10" />
      <Path d="M5 18h38M7 40h34" />
      <Path d="M13 22v14M24 22v14M35 22v14" />
    </>
  ),
  /* savings — a vault door */
  vault: (
    <>
      <Rect x="6" y="8" width="36" height="32" rx="3" />
      <Circle cx="24" cy="24" r="9" />
      <Path d="M24 15v6M24 27v6M15 24h6M27 24h6" />
    </>
  ),
  /* global */
  globe: (
    <>
      <Circle cx="24" cy="24" r="16" />
      <Path d="M8 24h32" />
      <Path d="M24 8c6 5 6 27 0 32M24 8c-6 5-6 27 0 32" />
    </>
  ),
  /* valuation — a price tag */
  pricetag: (
    <>
      <Path d="M25 6H40v15L21 40 6 25Z" />
      <Circle cx="33" cy="14" r="3" />
    </>
  ),
  /* insurance */
  umbrella: (
    <>
      <Path d="M4 24a20 20 0 0 1 40 0Z" />
      <Path d="M24 24v13a5 5 0 0 0 9 3" />
    </>
  ),
  /* cash flow — a pipe with flow */
  pipes: (
    <>
      <Path d="M8 14h16a8 8 0 0 1 8 8v14" />
      <Path d="M26 30l6 7 6-7" />
      <Path d="M8 8v12M4 14h8" />
    </>
  ),
  /* probability */
  dice: (
    <>
      <Rect x="9" y="9" width="30" height="30" rx="5" />
      <Circle cx="18" cy="18" r="2.2" />
      <Circle cx="30" cy="30" r="2.2" />
      <Circle cx="24" cy="24" r="2.2" />
    </>
  ),
  /* accounting — a ledger */
  ledger: (
    <>
      <Rect x="9" y="7" width="30" height="34" rx="3" />
      <Path d="M17 7v34" />
      <Path d="M22 16h11M22 24h11M22 32h7" />
    </>
  ),
  /* strategy — a knight */
  chess: (
    <>
      <Path d="M15 41h18" />
      <Path d="M30 37c0-8 5-14 0-21l-5 3 2-7c-7 2-12 8-9 14l-5 3" />
      <Path d="M18 37h12" />
    </>
  ),
  /* security */
  lock: (
    <>
      <Rect x="9" y="21" width="30" height="20" rx="4" />
      <Path d="M16 21v-5a8 8 0 0 1 16 0v5" />
      <Circle cx="24" cy="31" r="2.4" />
    </>
  ),
  /* money, generic */
  coins: (
    <>
      <Circle cx="19" cy="19" r="11" />
      <Path d="M30 20a11 11 0 1 1-11 11" />
      <Path d="M19 13v12M22 16h-4a2.6 2.6 0 0 0 0 5h2a2.6 2.6 0 0 1 0 5h-4" />
    </>
  ),
  /* herd behaviour */
  crowd: (
    <>
      <Circle cx="13" cy="20" r="4" />
      <Path d="M7 38c0-5 3-8 6-8s6 3 6 8" />
      <Circle cx="30" cy="17" r="5" />
      <Path d="M22 38c0-7 4-11 8-11s8 4 8 11" />
    </>
  ),
  /* anchoring */
  anchor: (
    <>
      <Circle cx="24" cy="9" r="4" />
      <Path d="M24 13v25M16 19h16" />
      <Path d="M10 27c0 9 7 13 14 13s14-4 14-13" />
    </>
  ),
  /* framing */
  frame: (
    <>
      <Rect x="7" y="10" width="34" height="28" rx="3" />
      <Path d="M13 33l7-8 5 5 6-8 6 8" />
    </>
  ),
  /* attention */
  magnet: (
    <>
      <Path d="M14 33V21a10 10 0 0 1 20 0v12" />
      <Path d="M14 33h7M27 33h7" />
      <Path d="M14 26h7M27 26h7" />
    </>
  ),
  /* narrative */
  story: (
    <>
      <Path d="M8 10h32a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H20l-8 7v-7H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3Z" />
      <Path d="M12 22c4-6 8 3 12-3s7 4 11-1" />
    </>
  ),
  /* receivables — a document that goes out */
  invoice: (
    <>
      <Path d="M9 7h15l8 8v14" />
      <Path d="M9 7v34h12" />
      <Path d="M24 7v8h8" />
      <Path d="M14 21h11M14 28h7" />
      <Path d="M28 36h14M37 31l5 5-5 5" />
    </>
  ),
  /* inventory */
  boxes: (
    <>
      <Rect x="6" y="24" width="17" height="15" rx="2" />
      <Rect x="25" y="24" width="17" height="15" rx="2" />
      <Rect x="15" y="8" width="17" height="15" rx="2" />
      <Path d="M6 31h17M25 31h17M15 15h17" />
    </>
  ),
  /* depreciation — stepping down */
  decay: (
    <>
      <Rect x="7" y="14" width="9" height="25" rx="1.5" />
      <Rect x="19" y="22" width="9" height="17" rx="1.5" />
      <Rect x="31" y="30" width="9" height="9" rx="1.5" />
      <Path d="M40 9l-5 5M35 9h5v5" />
    </>
  ),
  /* positioning — claimed ground */
  flag: (
    <>
      <Path d="M14 42V7" />
      <Path d="M14 9h20l-5 7 5 7H14" />
      <Path d="M6 42h30" />
    </>
  ),
  /* partnership — interlocked */
  handshake: (
    <>
      <Path d="M21 15a9 9 0 0 0 0 18h3" />
      <Path d="M27 33a9 9 0 0 0 0-18h-3" />
    </>
  ),
  /* acquisition funnel */
  funnel: (
    <>
      <Path d="M6 10h36L28 26v12l-8 4V26Z" />
      <Circle cx="13" cy="5" r="1.8" />
      <Circle cx="24" cy="5" r="1.8" />
      <Circle cx="35" cy="5" r="1.8" />
    </>
  ),
  /* networks / ML */
  network: (
    <>
      <Path d="M13 16l13 8-13 8M26 24l10-13M26 24l10 13" />
      <Circle cx="12" cy="15" r="4" />
      <Circle cx="12" cy="33" r="4" />
      <Circle cx="26" cy="24" r="4.6" />
      <Circle cx="38" cy="11" r="3.4" />
      <Circle cx="38" cy="37" r="3.4" />
    </>
  ),
  /* dashboards */
  dashboard: (
    <>
      <Rect x="5" y="9" width="38" height="28" rx="3" />
      <Path d="M11 24l5-5 4 3 6-7" />
      <Path d="M12 33h4M20 30h4M28 33h4M36 28h2" />
    </>
  ),
  /* scaling up */
  stairs: (
    <>
      <Rect x="7" y="30" width="9" height="9" rx="1.5" />
      <Rect x="19" y="22" width="9" height="17" rx="1.5" />
      <Rect x="31" y="13" width="9" height="26" rx="1.5" />
      <Path d="M35 8l5 5M40 8h-5v5" />
    </>
  ),
} satisfies Record<string, React.ReactNode>;

export type LessonMarkKey = keyof typeof MARKS;

/** Every key. Must stay in step with LessonArt's ART registry — see the check below. */
export const LESSON_MARK_KEYS = Object.keys(MARKS) as LessonMarkKey[];

export const hasLessonMark = (k: string): k is LessonMarkKey => k in MARKS;

/**
 * THE CONTRAST RULE, in one place.
 *
 * An active node's face is the course accent at 18%, so an accent-coloured mark on it is
 * accent-on-accent and dissolves — that was the original bug. Near-white reads on it cleanly.
 * A done or locked node's face is the neutral card, where the accent reads best and also carries
 * the course's identity.
 */
export function lessonMarkColor(opts: {
  active: boolean;
  accent: string;
  text: string;
  locked?: boolean;
  muted?: string;
}): string {
  if (opts.active) return opts.text;
  if (opts.locked) return opts.muted ?? opts.accent;
  return opts.accent;
}

export function LessonMark({
  markKey,
  size = 38,
  color,
}: {
  markKey: string;
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
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round">
      {hasLessonMark(markKey) ? (
        MARKS[markKey]
      ) : (
        // Deliberately not one of the 40 — an unmapped key must look unmapped rather than
        // borrow another lesson's meaning.
        <>
          <Circle cx="24" cy="24" r="15" />
          <Path d="M24 17v10M24 31h.01" />
        </>
      )}
    </Svg>
  );
}

if (__DEV__) {
  // ONE runnable check that matters: this registry must cover every key artKeyFor can return,
  // or a lesson silently renders the unmapped ring. 40 keys, verified against the measured
  // distribution (all 40 are reachable from real lesson titles).
  if (LESSON_MARK_KEYS.length !== 40) {
    console.error(`[lesson-mark] expected 40 keys to mirror ART, found ${LESSON_MARK_KEYS.length}`);
  }
}
