/**
 * Investing Fundamentals — one distinct mark per lesson, keyed by lesson number.
 *
 * House style, identical to course-mark / stat-mark / lesson-mark: 48×48 viewBox, stroke-only,
 * single colour supplied by the caller, stroke 2.2, round caps. NEVER a fill and never a
 * hardcoded colour — the caller owns contrast (see lessonMarkColor in ../lesson-mark.tsx).
 *
 * Numbers match the real `L(n, '…')` entries in lib/curriculum/courses/investingFundamentals.ts.
 * If a lesson is renamed the mark stays valid; if lessons are REORDERED these keys must move with
 * them, because the map is keyed on number, not title.
 */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. Introduction to Investing — a door you step through */
  1: (
    <>
      <Path d="M12 8h18v32H12Z" />
      <Path d="M30 24h12M36 18l6 6-6 6" />
      <Circle cx="17" cy="24" r="1.6" />
    </>
  ),
  /* 2. Risk vs. Reward — a seesaw, coin against spark */
  2: (
    <>
      <Path d="M7 30l34-8M24 26v12M17 42h14" />
      <Circle cx="10" cy="29" r="4" />
      <Path d="M38 15v6M35 17l3 4 3-4" />
    </>
  ),
  /* 3. The Magic of Compound Interest — mass gathering down a slope */
  3: (
    <>
      <Path d="M6 40L41 11" />
      <Circle cx="15" cy="31" r="9" />
      <Circle cx="30" cy="21" r="3.4" />
      <Circle cx="37" cy="15" r="1.8" />
    </>
  ),
  /* 4. Stocks vs. Bonds — one jagged column, one flat */
  4: (
    <>
      <Path d="M8 40V16l5-6 5 6v24Z" />
      <Path d="M10 28l3-4 3 4" />
      <Rect x="29" y="16" width="11" height="24" rx="1.5" />
      <Path d="M31 24h7M31 31h7" />
    </>
  ),
  /* 5. Diversification — one basket, three unlike things */
  5: (
    <>
      <Path d="M7 21h34l-4 18H11Z" />
      <Circle cx="17" cy="15" r="4" />
      <Rect x="22" y="11" width="7" height="7" rx="1" />
      <Path d="M35 11l4 7h-8Z" />
    </>
  ),
  /* 6. ETFs & Index Funds — one wrapper holding the whole market */
  6: (
    <>
      <Rect x="7" y="9" width="34" height="30" rx="3" />
      <Rect x="12" y="14" width="8" height="8" rx="1" />
      <Rect x="24" y="14" width="8" height="8" rx="1" />
      <Rect x="12" y="26" width="8" height="8" rx="1" />
      <Rect x="24" y="26" width="8" height="8" rx="1" />
    </>
  ),
  /* 7. Mutual Funds & Fund Types — many investors pooled inside one ring */
  7: (
    <>
      <Circle cx="24" cy="24" r="16" />
      <Circle cx="19" cy="20" r="4" />
      <Circle cx="29" cy="21" r="4" />
      <Circle cx="24" cy="30" r="4" />
    </>
  ),
  /* 8. Dollar Cost Averaging — equal amounts at equal intervals */
  8: (
    <>
      <Path d="M7 40h34" />
      <Rect x="9" y="24" width="6" height="16" rx="1" />
      <Rect x="21" y="24" width="6" height="16" rx="1" />
      <Rect x="33" y="24" width="6" height="16" rx="1" />
      <Path d="M12 18v-6M24 18v-6M36 18v-6" />
    </>
  ),
  /* 9. Building Your First Portfolio — bricks becoming a wall */
  9: (
    <>
      <Rect x="7" y="30" width="15" height="9" rx="1" />
      <Rect x="26" y="30" width="15" height="9" rx="1" />
      <Rect x="16" y="19" width="15" height="9" rx="1" />
      <Rect x="16" y="8" width="15" height="9" rx="1" />
    </>
  ),
  /* 10. Investment Account Types — tabbed folders, each a different wrapper */
  10: (
    <>
      <Path d="M6 16h12l3 4h21v20H6Z" />
      <Path d="M11 12h10l2 3" />
      <Path d="M6 28h36" />
    </>
  ),
  /* 11. Reading Stock Charts — candles against an axis */
  11: (
    <>
      <Path d="M8 8v32h32" />
      <Path d="M16 14v20M24 18v18M32 12v22" />
      <Rect x="13" y="20" width="6" height="9" rx="1" />
      <Rect x="29" y="17" width="6" height="9" rx="1" />
    </>
  ),
  /* 12. Understanding Market Orders — a ticket you fill and submit */
  12: (
    <>
      <Rect x="8" y="10" width="32" height="24" rx="3" />
      <Path d="M14 18h12M14 25h8" />
      <Path d="M28 27l4 4 7-8" />
      <Path d="M18 38h12" />
    </>
  ),
  /* 13. Dividends & Dividend Investing — a tree that pays out */
  13: (
    <>
      <Path d="M24 42V26" />
      <Path d="M24 26a11 11 0 1 0 0-17 11 11 0 0 0 0 17Z" />
      <Circle cx="12" cy="33" r="3" />
      <Circle cx="36" cy="33" r="3" />
      <Circle cx="24" cy="38" r="2.4" />
    </>
  ),
  /* 14. Growth vs Value Investing — a sprout beside a price tag */
  14: (
    <>
      <Path d="M13 41V24" />
      <Path d="M13 30c-6 0-9-3-9-9 6 0 9 3 9 9Z" />
      <Path d="M28 12h13v13L30 40l-8-8Z" />
      <Circle cx="36" cy="18" r="2.2" />
    </>
  ),
  /* 15. International Investing — a globe with a route arcing over it */
  15: (
    <>
      <Circle cx="24" cy="27" r="13" />
      <Path d="M11 27h26" />
      <Path d="M24 14c5 4 5 22 0 26" />
      <Path d="M8 14c8-7 24-7 32 0" />
    </>
  ),
  /* 16. Understanding Market Cycles — a wave that returns */
  16: (
    <>
      <Path d="M6 28c5-14 11 12 17 0s11-14 17 0" />
      <Path d="M40 34c-6 5-14 6-20 3" />
      <Path d="M20 33l-4 4 5 3" />
    </>
  ),
  /* 17. Introduction to Options — a right to choose, so the path forks */
  17: (
    <>
      <Path d="M24 42V26" />
      <Path d="M24 26L11 13M24 26l13-13" />
      <Path d="M11 20V13h7M37 20v-7h-7" />
    </>
  ),
  /* 18. Tax-Efficient Investing — the receipt, sheltered */
  18: (
    <>
      <Path d="M10 8h17v22l-4-3-4 3-5-3-4 3Z" />
      <Path d="M15 16h8" />
      <Path d="M33 18l8 3v8c0 6-4 9-8 11-4-2-8-5-8-11v-8Z" />
    </>
  ),
  /* 19. Behavioral Investing Pitfalls — the head walks into a hole */
  19: (
    <>
      <Path d="M14 30v-6c0-7 5-12 11-12s11 5 11 12c0 4-2 6-3 9" />
      <Path d="M6 38c5-4 10-4 12 0 2 4 6 5 10 3" />
      <Path d="M19 24a4 4 0 1 1 4 4" />
    </>
  ),
  /* 20. Evaluating Investment Fees — the bucket with a leak */
  20: (
    <>
      <Path d="M11 15h26l-4 24H15Z" />
      <Path d="M18 10a6 6 0 0 1 12 0" />
      <Circle cx="26" cy="44" r="1.7" />
    </>
  ),
  /* 21. Rebalancing Your Portfolio — the scale, being corrected */
  21: (
    <>
      <Path d="M9 18h30M24 13v25M16 40h16" />
      <Path d="M5 24c0 4 3 6 7 6s7-2 7-6Z" />
      <Path d="M29 24c0 4 3 6 7 6s7-2 7-6Z" />
      <Path d="M31 10l4-4M35 6h-4v4" />
    </>
  ),
  /* 22. Investment Research & Due Diligence — the lens over the filing */
  22: (
    <>
      <Path d="M10 6h16l7 7v11" />
      <Path d="M10 6v36h9" />
      <Path d="M26 6v7h7" />
      <Circle cx="30" cy="31" r="9" />
      <Path d="M36 37l6 6" />
    </>
  ),
  /* 23. The Power of Long-Term Investing — time, and a line that climbs through it */
  23: (
    <>
      <Path d="M13 7h22M13 41h22" />
      <Path d="M16 7c0 9 8 12 8 17s-8 8-8 17" />
      <Path d="M32 7c0 9-8 12-8 17s8 8 8 17" />
      <Path d="M6 34l6-5 5 3" />
    </>
  ),
  /* 24. Paper Trading: Build Your Portfolio — a clipboard, not a brokerage */
  24: (
    <>
      <Rect x="10" y="9" width="28" height="32" rx="3" />
      <Path d="M19 9V6h10v3" />
      <Path d="M16 31l5-6 4 3 6-9" />
      <Path d="M16 37h16" />
    </>
  ),
  /* 25. Paper Trading: Evaluate & Graduate — the cap, earned */
  25: (
    <>
      <Path d="M4 18L24 9l20 9-20 9Z" />
      <Path d="M12 22v10c0 3 6 5 12 5s12-2 12-5V22" />
      <Path d="M40 20v10" />
    </>
  ),
};
