/** Business Strategy — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx
 * The knight appears once (lesson 1); it used to be 20 of 25 nodes. */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. What Is Business Strategy? — the only knight */
  1: (
    <>
      <Path d="M15 41h18" />
      <Path d="M30 37c0-8 5-14 0-21l-5 3 2-7c-7 2-12 8-9 14l-5 3" />
      <Path d="M18 37h12" />
    </>
  ),
  /* 2. Business Models & Revenue Strategies — how value converts to cash */
  2: (
    <>
      <Rect x="6" y="12" width="14" height="11" rx="2" />
      <Rect x="6" y="27" width="14" height="11" rx="2" />
      <Path d="M20 18h8v14h-8" />
      <Circle cx="36" cy="25" r="7" />
      <Path d="M36 21v8" />
    </>
  ),
  /* 3. Competitive Analysis & Market Positioning — where you stand vs them */
  3: (
    <>
      <Path d="M7 40V8M7 40h34" />
      <Path d="M7 24h34M24 8v32" />
      <Circle cx="32" cy="16" r="3.4" />
      <Circle cx="15" cy="32" r="2.4" />
    </>
  ),
  /* 4. Startup Fundraising & Venture Capital — runway being filled */
  4: (
    <>
      <Path d="M8 10v10a6 6 0 0 0 6 6h10" />
      <Path d="M24 26h14l-3 13H27Z" />
      <Circle cx="8" cy="6" r="3" />
      <Path d="M31 32v4" />
    </>
  ),
  /* 5. Go-to-Market Strategy — the flag planted */
  5: (
    <>
      <Path d="M14 42V7" />
      <Path d="M14 9h20l-5 7 5 7H14" />
      <Path d="M7 42h28" />
    </>
  ),
  /* 6. Scaling a Business — steps up */
  6: (
    <>
      <Rect x="6" y="31" width="10" height="9" rx="1.5" />
      <Rect x="19" y="22" width="10" height="18" rx="1.5" />
      <Rect x="32" y="13" width="10" height="27" rx="1.5" />
      <Path d="M36 8l4-4M40 4h-4v4" />
    </>
  ),
  /* 7. Mergers, Acquisitions & Corporate Strategy — two become one */
  7: (
    <>
      <Circle cx="16" cy="24" r="10" />
      <Circle cx="32" cy="24" r="10" />
      <Path d="M24 17v14" />
    </>
  ),
  /* 8. Innovation & Disruption — the new line breaks the old */
  8: (
    <>
      <Path d="M6 32h14" />
      <Path d="M28 32h14" />
      <Path d="M20 40l8-32" />
      <Circle cx="24" cy="24" r="2.4" />
    </>
  ),
  /* 9. Leadership & Organizational Design — the reporting tree */
  9: (
    <>
      <Circle cx="24" cy="10" r="5" />
      <Path d="M24 15v7M11 30v-8h26v8" />
      <Circle cx="11" cy="35" r="5" />
      <Circle cx="37" cy="35" r="5" />
    </>
  ),
  /* 10. Strategic Planning Capstone — the plan, filed */
  10: (
    <>
      <Rect x="8" y="8" width="32" height="32" rx="3" />
      <Path d="M14 18h20M14 25h14M14 32h9" />
      <Circle cx="33" cy="31" r="4" />
    </>
  ),
  /* 11. Customer Acquisition & Retention — many in, fewer through */
  11: (
    <>
      <Path d="M6 12h36L28 27v11l-8 4V27Z" />
      <Circle cx="13" cy="6" r="1.8" />
      <Circle cx="24" cy="6" r="1.8" />
      <Circle cx="35" cy="6" r="1.8" />
    </>
  ),
  /* 12. Pricing Strategy & Revenue Optimization — the tag */
  12: (
    <>
      <Path d="M25 6H40v15L21 40 6 25Z" />
      <Circle cx="33" cy="14" r="3" />
    </>
  ),
  /* 13. Brand Building & Market Perception — the mark people recognise */
  13: (
    <>
      <Circle cx="24" cy="24" r="15" />
      <Path d="M24 13l3.5 7.5L35 22l-5.5 5 1.5 8-7-4-7 4 1.5-8L13 22l7.5-1.5Z" />
    </>
  ),
  /* 14. Supply Chain Strategy — goods moving in sequence */
  14: (
    <>
      <Rect x="5" y="20" width="11" height="11" rx="2" />
      <Rect x="19" y="20" width="11" height="11" rx="2" />
      <Rect x="33" y="20" width="10" height="11" rx="2" />
      <Path d="M16 25.5h3M30 25.5h3" />
      <Path d="M8 38h32" />
    </>
  ),
  /* 15. Digital Transformation — the old becomes connected */
  15: (
    <>
      <Rect x="6" y="14" width="14" height="20" rx="2" />
      <Path d="M20 24h6" />
      <Circle cx="34" cy="24" r="5" />
      <Circle cx="34" cy="10" r="3" />
      <Circle cx="34" cy="38" r="3" />
      <Path d="M34 13v6M34 29v6" />
    </>
  ),
  /* 16. Data-Driven Decision Making — the panel that decides */
  16: (
    <>
      <Rect x="5" y="10" width="38" height="27" rx="3" />
      <Path d="M11 25l5-5 4 3 6-7" />
      <Path d="M12 32h4M20 30h4M28 32h4M36 28h2" />
    </>
  ),
  /* 17. Strategic Partnerships & Alliances — interlocked */
  17: (
    <>
      <Path d="M21 15a9 9 0 0 0 0 18h3" />
      <Path d="M27 33a9 9 0 0 0 0-18h-3" />
    </>
  ),
  /* 18. Crisis Management & Business Continuity — cover held up */
  18: (
    <>
      <Path d="M5 24a19 19 0 0 1 38 0Z" />
      <Path d="M24 24v13a5 5 0 0 0 9 3" />
    </>
  ),
  /* 19. Global Expansion Strategy — outward from one point */
  19: (
    <>
      <Circle cx="24" cy="24" r="14" />
      <Path d="M10 24h28M24 10c5 5 5 23 0 28" />
      <Path d="M38 10l6-6M44 4h-6v6" />
    </>
  ),
  /* 20. Platform Business Models — the layer others build on */
  20: (
    <>
      <Path d="M6 30h36" />
      <Rect x="10" y="18" width="9" height="10" rx="1.5" />
      <Rect x="22" y="14" width="9" height="14" rx="1.5" />
      <Rect x="34" y="21" width="7" height="7" rx="1.5" />
      <Path d="M10 36h28" />
    </>
  ),
  /* 21. Sustainability & Corporate Social Responsibility — growth that keeps */
  21: (
    <>
      <Path d="M24 42V24" />
      <Path d="M24 24c-8 0-13-5-13-13 8 0 13 5 13 13Z" />
      <Path d="M24 20c7 0 12-5 12-12-7 0-12 5-12 12Z" />
    </>
  ),
  /* 22. Talent Strategy & Human Capital — people as the asset */
  22: (
    <>
      <Circle cx="14" cy="16" r="5" />
      <Path d="M6 34c0-6 4-10 8-10s8 4 8 10" />
      <Circle cx="33" cy="16" r="5" />
      <Path d="M25 34c0-6 4-10 8-10s8 4 8 10" />
      <Path d="M6 40h36" />
    </>
  ),
  /* 23. Product Strategy & Portfolio Management — a set, chosen */
  23: (
    <>
      <Path d="M7 21h34l-4 18H11Z" />
      <Path d="M16 21a8 8 0 0 1 16 0" />
      <Path d="M18 27v7M24 27v7M30 27v7" />
    </>
  ),
  /* 24. Strategic Finance for Business Leaders — the numbers behind the plan */
  24: (
    <>
      <Rect x="8" y="8" width="32" height="32" rx="3" />
      <Path d="M16 8v32" />
      <Path d="M21 17h13M21 24h13M21 31h8" />
    </>
  ),
  /* 25. Business Strategy Advanced Capstone — the cap */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Path d="M40 19v11" />
    </>
  ),
};
