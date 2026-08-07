/** Financial Analytics — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx
 * The magnifier appears once (lesson 19); it used to be 16 of 25 nodes. */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. What Is Financial Analytics? — the panel */
  1: (
    <>
      <Rect x="5" y="10" width="38" height="27" rx="3" />
      <Path d="M11 25l5-5 4 3 6-7" />
      <Path d="M12 32h4M20 30h4M28 32h4M36 28h2" />
    </>
  ),
  /* 2. Descriptive Statistics for Finance — the distribution */
  2: (
    <>
      <Path d="M6 38h36" />
      <Path d="M6 38c6 0 8-24 18-24s12 24 18 24" />
      <Path d="M24 38V16" />
    </>
  ),
  /* 3. Probability & Risk Assessment — the die */
  3: (
    <>
      <Rect x="9" y="9" width="30" height="30" rx="5" />
      <Circle cx="18" cy="18" r="2.2" />
      <Circle cx="30" cy="30" r="2.2" />
      <Circle cx="24" cy="24" r="2.2" />
    </>
  ),
  /* 4. Regression Analysis & Forecasting — the fitted line */
  4: (
    <>
      <Path d="M8 38L40 12" />
      <Circle cx="14" cy="33" r="2.2" />
      <Circle cx="21" cy="30" r="2.2" />
      <Circle cx="28" cy="22" r="2.2" />
      <Circle cx="35" cy="19" r="2.2" />
      <Path d="M6 40V8" />
    </>
  ),
  /* 5. Financial Modeling Fundamentals — the grid you build in */
  5: (
    <>
      <Rect x="7" y="9" width="34" height="30" rx="2" />
      <Path d="M7 18h34M7 28h34M18 9v30M30 9v30" />
    </>
  ),
  /* 6. DCF Analysis & Valuation — future cash discounted back */
  6: (
    <>
      <Path d="M40 12l-8 5 3-9" />
      <Path d="M8 34c10 2 22-6 30-19" />
      <Circle cx="10" cy="34" r="4" />
      <Path d="M10 30v8" />
    </>
  ),
  /* 7. Monte Carlo Simulation — many runs, one shape */
  7: (
    <>
      <Path d="M6 38h36" />
      <Path d="M8 34c4-16 10-22 16-22s12 6 16 22" />
      <Path d="M11 36c4-12 8-17 13-17s9 5 13 17" />
      <Path d="M24 38V19" />
    </>
  ),
  /* 8. Data Visualization & Financial Dashboards — small multiples */
  8: (
    <>
      <Rect x="6" y="8" width="16" height="14" rx="2" />
      <Rect x="26" y="8" width="16" height="14" rx="2" />
      <Rect x="6" y="26" width="16" height="14" rx="2" />
      <Rect x="26" y="26" width="16" height="14" rx="2" />
      <Path d="M9 18l4-5 3 3" />
    </>
  ),
  /* 9. Machine Learning in Finance — layers of nodes */
  9: (
    <>
      <Circle cx="10" cy="15" r="3" />
      <Circle cx="10" cy="33" r="3" />
      <Circle cx="24" cy="24" r="4" />
      <Circle cx="38" cy="15" r="3" />
      <Circle cx="38" cy="33" r="3" />
      <Path d="M13 16l8 6M13 32l8-6M27 22l8-6M27 26l8 6" />
    </>
  ),
  /* 10. Financial Analytics Capstone — the flag */
  10: (
    <>
      <Path d="M14 42V7" />
      <Path d="M14 9h20l-5 7 5 7H14" />
      <Path d="M7 42h28" />
    </>
  ),
  /* 11. Time Series Analysis for Finance — value along time */
  11: (
    <>
      <Path d="M6 40V8M6 40h36" />
      <Path d="M9 30c5 4 8-10 13-6s8 12 14-8" />
      <Path d="M14 44v-4M24 44v-4M34 44v-4" />
    </>
  ),
  /* 12. Sentiment Analysis & Alternative Data — language as a signal */
  12: (
    <>
      <Path d="M7 10h34a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H19l-8 7v-7H7a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3Z" />
      <Path d="M12 21l4-4 3 3 5-6 5 5" />
    </>
  ),
  /* 13. Credit Scoring Models — the dial */
  13: (
    <>
      <Path d="M6 33a18 18 0 0 1 36 0" />
      <Path d="M24 33L33 22" />
      <Circle cx="24" cy="33" r="2.6" />
      <Path d="M6 39h36" />
    </>
  ),
  /* 14. Portfolio Analytics & Performance Attribution — the parts of a return */
  14: (
    <>
      <Circle cx="24" cy="24" r="15" />
      <Path d="M24 9v15l13 7" />
      <Path d="M24 24L11 18" />
      <Path d="M24 24l-6 14" />
    </>
  ),
  /* 15. A/B Testing & Experimentation in Finance — two arms, one winner */
  15: (
    <>
      <Path d="M24 8v10" />
      <Path d="M24 18L12 30M24 18l12 12" />
      <Rect x="6" y="30" width="12" height="10" rx="2" />
      <Rect x="30" y="30" width="12" height="10" rx="2" />
      <Path d="M33 35l2 2 4-4" />
    </>
  ),
  /* 16. SQL & Database Queries for Finance — the store you ask */
  16: (
    <>
      <Path d="M10 13c0-3 6-5 14-5s14 2 14 5-6 5-14 5-14-2-14-5Z" />
      <Path d="M10 13v10c0 3 6 5 14 5s14-2 14-5V13" />
      <Path d="M10 23v10c0 3 6 5 14 5s14-2 14-5V23" />
    </>
  ),
  /* 17. Python for Financial Analysis — the script */
  17: (
    <>
      <Rect x="6" y="9" width="36" height="30" rx="3" />
      <Path d="M6 16h36" />
      <Path d="M15 25l-4 4 4 4" />
      <Path d="M25 25l4 4-4 4" />
      <Path d="M32 33h5" />
    </>
  ),
  /* 18. Automated Reporting & Dashboards — it sends itself */
  18: (
    <>
      <Path d="M9 8h16l7 7v13" />
      <Path d="M9 8v30h11" />
      <Path d="M25 8v7h7" />
      <Path d="M14 20h11M14 27h6" />
      <Circle cx="34" cy="34" r="7" />
      <Path d="M34 30v4l3 2" />
    </>
  ),
  /* 19. Anomaly Detection & Fraud Analytics — the only magnifier */
  19: (
    <>
      <Circle cx="21" cy="21" r="12" />
      <Path d="M30 30l11 11" />
      <Path d="M16 21l4 4 6-8" />
    </>
  ),
  /* 20. Real-Time Data Processing & Streaming — a continuous flow */
  20: (
    <>
      <Path d="M6 15h28a6 6 0 0 1 0 12H14a6 6 0 0 0 0 12h28" />
      <Path d="M36 11l5 4-5 4" />
    </>
  ),
  /* 21. Natural Language Processing in Finance — text becoming signal */
  21: (
    <>
      <Path d="M6 12h20v14H12l-6 5Z" />
      <Path d="M10 17h11" />
      <Path d="M30 20h12M30 27h12M30 34h8" />
      <Path d="M26 27l4-4" />
    </>
  ),
  /* 22. Predictive Modeling for Market Trends — the extrapolation */
  22: (
    <>
      <Path d="M6 40V8M6 40h36" />
      <Path d="M9 32l7-6 5 4 6-9" />
      <Path d="M27 21l12-9" strokeDasharray="4 4" />
      <Path d="M33 12h6v6" />
    </>
  ),
  /* 23. Risk Analytics & Stress Testing Models — pressure applied */
  23: (
    <>
      <Rect x="12" y="18" width="24" height="14" rx="2" />
      <Path d="M8 12h32M8 38h32" />
      <Path d="M14 12v6M24 12v6M34 12v6" />
      <Path d="M14 32v6M24 32v6M34 32v6" />
    </>
  ),
  /* 24. Big Data & Cloud Computing in Finance — scale, off-premises */
  24: (
    <>
      <Path d="M14 32a8 8 0 0 1 1-16 11 11 0 0 1 20 3 7 7 0 0 1-1 13Z" />
      <Path d="M18 38v4M24 38v4M30 38v4" />
    </>
  ),
  /* 25. Financial Analytics Advanced Capstone — the cap */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Path d="M40 19v11" />
    </>
  ),
};
