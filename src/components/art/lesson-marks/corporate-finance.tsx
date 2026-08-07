/** Corporate Finance — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx
 *
 * NOTE ON NUMBERING: this course declares lessons 1–5 in the `num:` object form and 6–25 via
 * `L(n, …)`. Both are real lessons and all 25 are keyed here — an earlier extraction that only
 * matched `L(` counted 20 and wrongly flagged courseIndex's totalLessons:25 as a bug. */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. What Is Corporate Finance? — the firm and its capital */
  1: (
    <>
      <Rect x="10" y="10" width="20" height="30" rx="2" />
      <Path d="M15 17h4M22 17h4M15 24h4M22 24h4M15 31h4" />
      <Circle cx="37" cy="30" r="6" />
      <Path d="M37 26v8" />
    </>
  ),
  /* 2. Financial Statements: The Language of Business — three statements */
  2: (
    <>
      <Rect x="6" y="10" width="11" height="28" rx="2" />
      <Rect x="19" y="10" width="11" height="28" rx="2" />
      <Rect x="32" y="10" width="10" height="28" rx="2" />
      <Path d="M9 18h5M22 18h5M35 18h4" />
    </>
  ),
  /* 3. Time Value of Money — a sum, discounted */
  3: (
    <>
      <Circle cx="15" cy="24" r="9" />
      <Path d="M15 19v10M17 21h-3a1.8 1.8 0 0 0 0 3.5h1a1.8 1.8 0 0 1 0 3.5h-3" />
      <Path d="M27 24h10" />
      <Path d="M33 19l5 5-5 5" />
      <Path d="M42 14v20" />
    </>
  ),
  /* 4. Capital Structure: Debt vs. Equity — the two sides of funding */
  4: (
    <>
      <Rect x="7" y="14" width="14" height="26" rx="2" />
      <Path d="M27 40V20l7-8 7 8v20Z" />
      <Path d="M10 22h8M10 30h8" />
    </>
  ),
  /* 5. Valuing a Company — the tag on the firm */
  5: (
    <>
      <Path d="M24 8H40v15L22 40 7 25 24 8Z" />
      <Circle cx="33" cy="15" r="3" />
      <Path d="M14 24h6" />
    </>
  ),
  /* 6. Working Capital Management — short-term cycle */
  6: (
    <>
      <Path d="M38 20a15 15 0 1 0-4 12" />
      <Path d="M38 12v9h-9" />
      <Circle cx="24" cy="24" r="4" />
    </>
  ),
  /* 7. Mergers & Acquisitions — two firms overlap */
  7: (
    <>
      <Circle cx="17" cy="24" r="10" />
      <Circle cx="31" cy="24" r="10" />
      <Path d="M24 17v14" />
    </>
  ),
  /* 8. Dividend Policy & Share Buybacks — cash returned */
  8: (
    <>
      <Rect x="10" y="10" width="18" height="16" rx="2" />
      <Path d="M28 18h8" />
      <Path d="M32 13l5 5-5 5" />
      <Circle cx="16" cy="36" r="4" />
      <Circle cx="28" cy="36" r="4" />
      <Circle cx="40" cy="36" r="4" />
    </>
  ),
  /* 9. Risk Management & Hedging — the offset */
  9: (
    <>
      <Path d="M24 7l14 5v11c0 9-6 15-14 18-8-3-14-9-14-18V12Z" />
      <Path d="M17 24h14" />
    </>
  ),
  /* 10. Corporate Governance & Ethics — the board */
  10: (
    <>
      <Path d="M8 26h32" />
      <Circle cx="13" cy="17" r="3.4" />
      <Circle cx="24" cy="15" r="3.4" />
      <Circle cx="35" cy="17" r="3.4" />
      <Path d="M14 32v7M34 32v7" />
    </>
  ),
  /* 11. Capital Budgeting & Project Evaluation — projects ranked */
  11: (
    <>
      <Path d="M7 40h34" />
      <Rect x="9" y="14" width="8" height="26" rx="1" />
      <Rect x="20" y="22" width="8" height="18" rx="1" />
      <Rect x="31" y="28" width="8" height="12" rx="1" />
      <Path d="M11 9l2 3 3-5" />
    </>
  ),
  /* 12. Cost of Capital & WACC — a weighted blend */
  12: (
    <>
      <Circle cx="24" cy="24" r="15" />
      <Path d="M24 9v15l14 5" />
      <Path d="M24 24L12 33" />
      <Path d="M24 24H9" />
    </>
  ),
  /* 13. Leveraged Buyouts & Private Equity — debt as the lever */
  13: (
    <>
      <Path d="M6 34h28" />
      <Circle cx="13" cy="34" r="3" />
      <Path d="M34 34V16" />
      <Rect x="28" y="8" width="12" height="8" rx="1.5" />
    </>
  ),
  /* 14. IPOs & Going Public — the first bell */
  14: (
    <>
      <Path d="M14 30V20a10 10 0 0 1 20 0v10" />
      <Path d="M10 30h28" />
      <Circle cx="24" cy="35" r="3" />
      <Path d="M24 10V6" />
      <Path d="M38 14l4-4M10 14l-4-4" />
    </>
  ),
  /* 15. Financial Distress & Restructuring — the crack */
  15: (
    <>
      <Rect x="10" y="9" width="28" height="31" rx="2" />
      <Path d="M20 9l6 12-8 6 7 13" />
      <Path d="M14 16h4M30 32h4" />
    </>
  ),
  /* 16. International Corporate Finance — the firm across borders */
  16: (
    <>
      <Circle cx="24" cy="24" r="14" />
      <Path d="M10 24h28M24 10c5 5 5 23 0 28" />
      <Rect x="19" y="19" width="10" height="10" rx="1.5" />
    </>
  ),
  /* 17. Corporate Bonds & Debt Markets — the instrument */
  17: (
    <>
      <Rect x="6" y="13" width="36" height="22" rx="2" />
      <Path d="M12 21h14M12 27h9" />
      <Circle cx="34" cy="24" r="5" />
      <Path d="M34 21v6" />
    </>
  ),
  /* 18. Treasury Management & Cash Flow — money in motion */
  18: (
    <>
      <Path d="M8 14h16a8 8 0 0 1 8 8v13" />
      <Path d="M26 29l6 7 6-7" />
      <Path d="M8 8v12M4 14h8" />
    </>
  ),
  /* 19. ESG & Sustainable Finance — growth with a condition */
  19: (
    <>
      <Path d="M24 42V24" />
      <Path d="M24 24c-8 0-13-5-13-13 8 0 13 5 13 13Z" />
      <Path d="M24 20c7 0 12-5 12-12-7 0-12 5-12 12Z" />
      <Path d="M14 42h20" />
    </>
  ),
  /* 20. Financial Regulation & Compliance — the rulebook, enforced */
  20: (
    <>
      <Rect x="8" y="8" width="21" height="30" rx="2" />
      <Path d="M13 16h11M13 23h7" />
      <Rect x="28" y="26" width="14" height="12" rx="2" />
      <Path d="M32 26v-4a3 3 0 0 1 6 0v4" />
    </>
  ),
  /* 21. Startup Finance & Venture Funding — the raise */
  21: (
    <>
      <Path d="M24 40c-5-5-8-11-8-18C16 13 20 7 24 4c4 3 8 9 8 18 0 7-3 13-8 18Z" />
      <Circle cx="24" cy="18" r="3.4" />
      <Path d="M16 30l-6 8h9M32 30l6 8h-9" />
    </>
  ),
  /* 22. Executive Compensation & Incentives — pay tied to outcome */
  22: (
    <>
      <Circle cx="15" cy="15" r="6" />
      <Path d="M7 34c0-7 4-12 8-12s8 5 8 12" />
      <Path d="M27 30l6-6 4 3 6-9" />
      <Path d="M40 15h4v4" />
    </>
  ),
  /* 23. Corporate Tax Strategy — the slice, planned */
  23: (
    <>
      <Path d="M11 7h22v28l-4-3-4 3-4-3-4 3-6 3Z" />
      <Path d="M17 16h10M17 23h6" />
      <Path d="M36 20l6-6M42 14h-6v6" />
    </>
  ),
  /* 24. Financial Engineering & Structured Products — assembled parts */
  24: (
    <>
      <Rect x="6" y="8" width="11" height="11" rx="2" />
      <Rect x="6" y="29" width="11" height="11" rx="2" />
      <Path d="M17 13h7v22h-7" />
      <Rect x="28" y="18" width="14" height="12" rx="2" />
    </>
  ),
  /* 25. Corporate Finance Advanced Capstone — the cap */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Path d="M40 19v11" />
    </>
  ),
};
