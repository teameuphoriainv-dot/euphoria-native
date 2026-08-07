/** Alternative Investments — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. Beyond Stocks & Bonds — stepping outside the two */
  1: (
    <>
      <Rect x="6" y="18" width="10" height="20" rx="1.5" />
      <Rect x="19" y="18" width="10" height="20" rx="1.5" />
      <Path d="M33 28h9" />
      <Path d="M37 23l5 5-5 5" />
    </>
  ),
  /* 2. Real Estate Investing — property */
  2: (
    <>
      <Path d="M6 22l18-13 18 13" />
      <Path d="M10 20v20h28V20" />
      <Path d="M19 40V29h10v11" />
    </>
  ),
  /* 3. Cryptocurrency & Digital Assets — a coin of circuitry */
  3: (
    <>
      <Circle cx="24" cy="24" r="14" />
      <Path d="M24 10v28M17 17h14M17 31h14" />
      <Path d="M10 24h28" />
    </>
  ),
  /* 4. Commodities & Futures Trading — raw goods, dated */
  4: (
    <>
      <Rect x="7" y="24" width="16" height="14" rx="2" />
      <Rect x="26" y="24" width="15" height="14" rx="2" />
      <Path d="M7 31h16M26 31h15" />
      <Circle cx="24" cy="12" r="6" />
      <Path d="M24 9v3l2 2" />
    </>
  ),
  /* 5. Private Equity & Venture Capital — the closed door */
  5: (
    <>
      <Path d="M12 8h20v32H12Z" />
      <Circle cx="27" cy="24" r="2.2" />
      <Path d="M36 20v8" />
      <Path d="M40 16v16" />
    </>
  ),
  /* 6. Hedge Fund Strategies — long one side, short the other */
  6: (
    <>
      <Path d="M6 34l12-12 6 6" />
      <Path d="M42 14L30 26l-6-6" />
      <Path d="M6 28v6h6M42 20v-6h-6" />
    </>
  ),
  /* 7. Collectibles, Art & Alternative Assets — the framed piece */
  7: (
    <>
      <Rect x="7" y="9" width="34" height="26" rx="3" />
      <Path d="M13 30l7-8 5 5 6-8 6 11" />
      <Circle cx="18" cy="17" r="2.4" />
      <Path d="M18 35v5M30 35v5" />
    </>
  ),
  /* 8. Infrastructure & Farmland Investing — the long-lived asset */
  8: (
    <>
      <Path d="M6 34h36" />
      <Path d="M12 34V20l12-8 12 8v14" />
      <Path d="M12 26h24" />
      <Path d="M9 40c5-3 10-3 15 0s10 3 15 0" />
    </>
  ),
  /* 9. Portfolio Integration & Alternative Allocation — the slice added */
  9: (
    <>
      <Circle cx="24" cy="24" r="15" />
      <Path d="M24 9v15l14 6" />
      <Path d="M24 24L10 20" />
      <Path d="M24 24v15" strokeDasharray="3 3" />
    </>
  ),
  /* 10. Alternative Investments Capstone — the flag */
  10: (
    <>
      <Path d="M14 42V7" />
      <Path d="M14 9h20l-5 7 5 7H14" />
      <Path d="M7 42h28" />
    </>
  ),
  /* 11. Real Estate Investment Trusts (REITs) — property, securitised */
  11: (
    <>
      <Path d="M8 24l10-8 10 8v16H8Z" />
      <Path d="M15 40V32h6v8" />
      <Rect x="30" y="14" width="12" height="16" rx="2" />
      <Path d="M33 20h6M33 25h6" />
    </>
  ),
  /* 12. Distressed Debt Investing — value in the broken */
  12: (
    <>
      <Rect x="9" y="12" width="30" height="22" rx="2" />
      <Path d="M20 12l5 9-7 5 6 8" />
      <Path d="M13 40h22" />
    </>
  ),
  /* 13. DeFi & Tokenized Assets — value without a bank */
  13: (
    <>
      <Circle cx="24" cy="24" r="5" />
      <Circle cx="11" cy="13" r="3.4" />
      <Circle cx="37" cy="13" r="3.4" />
      <Circle cx="11" cy="35" r="3.4" />
      <Circle cx="37" cy="35" r="3.4" />
      <Path d="M14 16l6 5M34 16l-6 5M14 32l6-5M34 32l-6-5" />
    </>
  ),
  /* 14. Carbon Credits & Environmental Markets — a leaf, priced */
  14: (
    <>
      <Path d="M12 38c0-14 8-22 22-24 2 12-6 22-22 24Z" />
      <Path d="M12 38c6-8 12-13 22-16" />
      <Path d="M36 8h6v6" />
    </>
  ),
  /* 15. Music Royalties & Intellectual Property — a stream from a work */
  15: (
    <>
      <Path d="M18 34V12l16-4v22" />
      <Circle cx="14" cy="34" r="4" />
      <Circle cx="30" cy="30" r="4" />
      <Path d="M18 18l16-4" />
    </>
  ),
  /* 16. SPACs & Blank Check Companies — a cheque with nothing on it */
  16: (
    <>
      <Rect x="6" y="14" width="36" height="20" rx="3" />
      <Path d="M12 22h10" />
      <Path d="M12 28h24" strokeDasharray="3 3" />
      <Path d="M30 20h6" />
    </>
  ),
  /* 17. Emerging Market Alternatives — off the beaten index */
  17: (
    <>
      <Circle cx="24" cy="24" r="14" />
      <Path d="M10 24h28" />
      <Path d="M24 10c5 5 5 23 0 28" />
      <Path d="M38 38l6 6M44 38v6h-6" />
    </>
  ),
  /* 18. Fund of Funds & Multi-Strategy — funds inside a fund */
  18: (
    <>
      <Rect x="6" y="9" width="36" height="30" rx="3" />
      <Circle cx="17" cy="20" r="4.4" />
      <Circle cx="31" cy="20" r="4.4" />
      <Circle cx="24" cy="31" r="4.4" />
    </>
  ),
  /* 19. Due Diligence for Alternatives — the lens on the private deal */
  19: (
    <>
      <Path d="M9 8h15l7 7v9" />
      <Path d="M9 8v32h9" />
      <Path d="M24 8v7h7" />
      <Circle cx="31" cy="31" r="9" />
      <Path d="M37 37l6 6" />
    </>
  ),
  /* 20. Liquidity & Lock-Up Considerations — you cannot get out yet */
  20: (
    <>
      <Rect x="10" y="22" width="28" height="18" rx="4" />
      <Path d="M17 22v-5a7 7 0 0 1 14 0v5" />
      <Path d="M24 29v5" />
      <Path d="M40 10l4-4" />
    </>
  ),
  /* 21. Tax Implications of Alternative Investments — the receipt, complicated */
  21: (
    <>
      <Path d="M10 7h20v28l-4-3-4 3-4-3-8 3Z" />
      <Path d="M15 16h10M15 23h6" />
      <Path d="M34 18l8 4v8c0 5-4 8-8 10" />
    </>
  ),
  /* 22. Alternative Data & Analytics — signal from odd sources */
  22: (
    <>
      <Path d="M6 38h36" />
      <Path d="M9 32V22M17 32V14M25 32v-6M33 32V18" />
      <Circle cx="9" cy="19" r="2.2" />
      <Circle cx="17" cy="11" r="2.2" />
      <Circle cx="25" cy="23" r="2.2" />
      <Circle cx="33" cy="15" r="2.2" />
    </>
  ),
  /* 23. Structuring Alternative Investment Vehicles — the wrapper assembled */
  23: (
    <>
      <Rect x="17" y="6" width="14" height="10" rx="2" />
      <Path d="M24 16v6M12 28v-6h24v6" />
      <Rect x="5" y="28" width="14" height="10" rx="2" />
      <Rect x="29" y="28" width="14" height="10" rx="2" />
    </>
  ),
  /* 24. Regulation & Compliance in Alternatives — the private rulebook */
  24: (
    <>
      <Rect x="9" y="8" width="20" height="30" rx="2" />
      <Path d="M14 16h10M14 23h6" />
      <Path d="M35 22l-4 4 4 4 4-4Z" />
      <Path d="M35 34v6" />
    </>
  ),
  /* 25. Alternative Investments Advanced Capstone — the cap */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Path d="M40 19v11" />
    </>
  ),
};
