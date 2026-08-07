/** Wealth Management — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx
 * The vault appears once (lesson 1); it used to be 10 of 25 nodes. */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. Building & Preserving Wealth — the only vault */
  1: (
    <>
      <Rect x="6" y="8" width="36" height="32" rx="3" />
      <Circle cx="24" cy="24" r="9" />
      <Path d="M24 15v6M24 27v6M15 24h6M27 24h6" />
    </>
  ),
  /* 2. Tax-Advantaged Investing — growth under shelter */
  2: (
    <>
      <Path d="M6 20a18 18 0 0 1 36 0Z" />
      <Path d="M24 20v10" />
      <Path d="M24 42V32" />
      <Path d="M24 34c-5 0-8-3-8-8 5 0 8 3 8 8Z" />
    </>
  ),
  /* 3. Retirement Planning & Withdrawal Strategies — the vessel emptying */
  3: (
    <>
      <Path d="M13 7h22M13 41h22" />
      <Path d="M16 7c0 9 8 12 8 17s-8 8-8 17" />
      <Path d="M32 7c0 9-8 12-8 17s8 8 8 17" />
      <Path d="M24 34v5" />
    </>
  ),
  /* 4. Estate Planning & Trusts — the sealed instrument */
  4: (
    <>
      <Path d="M11 6h26v28H11Z" />
      <Path d="M17 14h14M17 21h9" />
      <Circle cx="30" cy="36" r="6" />
      <Path d="M27 41l-2 5 5-2 5 2-2-5" />
    </>
  ),
  /* 5. Insurance as a Wealth Tool — cover as an asset */
  5: (
    <>
      <Path d="M5 22a19 19 0 0 1 38 0Z" />
      <Path d="M24 22v11a4 4 0 0 0 8 3" />
      <Circle cx="12" cy="34" r="3" />
    </>
  ),
  /* 6. Charitable Giving & Philanthropy — value passed on */
  6: (
    <>
      <Path d="M8 34c4-6 9-7 13-4" />
      <Path d="M21 30c3-8 11-11 16-7 4 4 3 11-3 14-4 2-9 2-13 0" />
      <Path d="M29 12c5 0 8 3 8 8-5 0-8-3-8-8Z" />
    </>
  ),
  /* 7. Family Wealth & Multi-Generational Planning — three generations */
  7: (
    <>
      <Circle cx="12" cy="14" r="5" />
      <Circle cx="24" cy="14" r="5" />
      <Circle cx="36" cy="16" r="3.6" />
      <Path d="M6 32c0-6 3-9 6-9s6 3 6 9" />
      <Path d="M18 32c0-6 3-9 6-9s6 3 6 9" />
      <Path d="M31 32c0-4 2-7 5-7s5 3 5 7" />
    </>
  ),
  /* 8. Advanced Tax Optimization — the slice, minimised */
  8: (
    <>
      <Circle cx="24" cy="24" r="15" />
      <Path d="M24 9v15l9 12" />
      <Path d="M24 24L10 20" />
      <Path d="M32 6l4 4-4 4" />
    </>
  ),
  /* 9. Working with Financial Advisors — two parties, one plan */
  9: (
    <>
      <Path d="M21 15a9 9 0 0 0 0 18h3" />
      <Path d="M27 33a9 9 0 0 0 0-18h-3" />
      <Path d="M14 41h20" />
    </>
  ),
  /* 10. Wealth Management Capstone — the flag */
  10: (
    <>
      <Path d="M14 42V7" />
      <Path d="M14 9h20l-5 7 5 7H14" />
      <Path d="M7 42h28" />
    </>
  ),
  /* 11. Asset Location & Tax-Efficient Portfolios — right asset, right wrapper */
  11: (
    <>
      <Rect x="6" y="12" width="16" height="12" rx="2" />
      <Rect x="26" y="12" width="16" height="12" rx="2" />
      <Rect x="16" y="30" width="16" height="12" rx="2" />
      <Path d="M14 24v6h20v-6" />
    </>
  ),
  /* 12. Social Security & Government Benefits — the public pillar */
  12: (
    <>
      <Path d="M7 19L24 10l17 9" />
      <Path d="M7 19h34M10 39h28" />
      <Path d="M15 23v12M24 23v12M33 23v12" />
    </>
  ),
  /* 13. Health Care Planning & HSAs — cover for the body */
  13: (
    <>
      <Path d="M24 8l14 5v11c0 9-6 15-14 18-8-3-14-9-14-18V13Z" />
      <Path d="M24 18v12M18 24h12" />
    </>
  ),
  /* 14. Real Estate in Wealth Management — property as a holding */
  14: (
    <>
      <Path d="M6 22l18-13 18 13" />
      <Path d="M10 20v20h28V20" />
      <Path d="M19 40V29h10v11" />
      <Circle cx="35" cy="14" r="2.4" />
    </>
  ),
  /* 15. Business Owner Wealth Strategies — the enterprise as the asset */
  15: (
    <>
      <Rect x="9" y="12" width="18" height="28" rx="2" />
      <Path d="M13 19h4M20 19h4M13 26h4M20 26h4" />
      <Path d="M27 24h12v16H27" />
      <Path d="M32 31h3" />
    </>
  ),
  /* 16. Divorce & Financial Separation — one estate, split */
  16: (
    <>
      <Path d="M24 6v36" strokeDasharray="4 4" />
      <Path d="M6 18h12v14H6Z" />
      <Path d="M30 18h12v14H30Z" />
      <Path d="M12 14v4M36 14v4" />
    </>
  ),
  /* 17. Behavioral Wealth Management — the client's own instincts */
  17: (
    <>
      <Path d="M15 40v-8c-4-4-6-9-5-14 2-8 10-12 17-10 8 2 11 10 8 17-2 4-4 7-4 11v4" />
      <Path d="M22 22v8M25 24h-3a1.8 1.8 0 0 0 0 3.5h1a1.8 1.8 0 0 1 0 3.5h-3" />
    </>
  ),
  /* 18. Alternative Investments for HNW Clients — the private door */
  18: (
    <>
      <Circle cx="16" cy="16" r="8" />
      <Path d="M22 22l17 17" />
      <Path d="M31 31l-4 4M36 36l-3 3" />
    </>
  ),
  /* 19. International Wealth Management — assets across borders */
  19: (
    <>
      <Circle cx="24" cy="24" r="14" />
      <Path d="M10 24h28" />
      <Path d="M24 10c5 5 5 23 0 28M24 10c-5 5-5 23 0 28" />
      <Path d="M6 8h6M9 5v6" />
    </>
  ),
  /* 20. Concentrated Stock Positions — one holding, too large */
  20: (
    <>
      <Path d="M7 40h34" />
      <Rect x="10" y="30" width="7" height="10" rx="1" />
      <Rect x="21" y="8" width="9" height="32" rx="1.5" />
      <Rect x="34" y="33" width="7" height="7" rx="1" />
    </>
  ),
  /* 21. Wealth Transfer Techniques — value moving down a generation */
  21: (
    <>
      <Circle cx="24" cy="10" r="5" />
      <Path d="M24 17v14" />
      <Path d="M18 25l6 6 6-6" />
      <Path d="M12 40h24" />
    </>
  ),
  /* 22. Impact Investing & Values-Based Portfolios — return with a condition */
  22: (
    <>
      <Path d="M24 42V26" />
      <Path d="M24 26c-8 0-13-5-13-13 8 0 13 5 13 13Z" />
      <Circle cx="33" cy="17" r="6" />
      <Path d="M33 13v8" />
    </>
  ),
  /* 23. Retirement Income Strategies — a steady draw */
  23: (
    <>
      <Path d="M8 12h14a6 6 0 0 1 6 6v8" />
      <Path d="M22 26l6 7 6-7" />
      <Path d="M12 38h24" />
      <Path d="M18 42h12" />
    </>
  ),
  /* 24. Technology & Robo-Advisors in Wealth Management — advice, automated */
  24: (
    <>
      <Rect x="11" y="16" width="26" height="20" rx="4" />
      <Circle cx="19" cy="25" r="2.2" />
      <Circle cx="29" cy="25" r="2.2" />
      <Path d="M19 31h10" />
      <Path d="M24 16v-5M20 8h8" />
    </>
  ),
  /* 25. Wealth Management Advanced Capstone — the cap */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Path d="M40 19v11" />
    </>
  ),
};
