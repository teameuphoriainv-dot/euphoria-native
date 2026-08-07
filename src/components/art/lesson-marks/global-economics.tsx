/** Global Economics — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx
 * A globe appears exactly ONCE here (lesson 6), never as the course default. */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. What Is Economics? — scarcity and choice, weighed */
  1: (
    <>
      <Path d="M9 17h30M24 12v26M16 41h16" />
      <Path d="M4 23c0 5 4 8 9 8s9-3 9-8Z" />
      <Path d="M26 23c0 5 4 8 9 8s9-3 9-8Z" />
    </>
  ),
  /* 2. Supply and Demand — two lines crossing */
  2: (
    <>
      <Path d="M8 8v32h32" />
      <Path d="M12 14L38 34" />
      <Path d="M12 34L38 14" />
      <Circle cx="25" cy="24" r="2.6" />
    </>
  ),
  /* 3. The Federal Reserve & Monetary Policy — the institution and its lever */
  3: (
    <>
      <Path d="M7 19L23 10l16 9" />
      <Path d="M7 19h32M10 38h26" />
      <Path d="M14 23v11M23 23v11M32 23v11" />
      <Path d="M40 30v-8l4 4Z" />
    </>
  ),
  /* 4. GDP: Measuring the Economy — the total, on a gauge */
  4: (
    <>
      <Path d="M6 33a18 18 0 0 1 36 0" />
      <Path d="M24 33L35 21" />
      <Circle cx="24" cy="33" r="2.6" />
      <Path d="M6 39h36" />
    </>
  ),
  /* 5. Inflation & Deflation — one rising, one falling */
  5: (
    <>
      <Path d="M15 8a9 10 0 0 1 0 20 9 10 0 0 1 0-20Z" />
      <Path d="M15 28v6" />
      <Path d="M33 40a7 8 0 0 0 0-15 7 8 0 0 0 0 15Z" />
      <Path d="M33 25v-6" />
    </>
  ),
  /* 6. International Trade & Globalization — the only globe in the course */
  6: (
    <>
      <Circle cx="24" cy="24" r="16" />
      <Path d="M8 24h32" />
      <Path d="M24 8c6 5 6 27 0 32M24 8c-6 5-6 27 0 32" />
    </>
  ),
  /* 7. Fiscal Policy & Government Spending — the state's ledger */
  7: (
    <>
      <Path d="M8 18L24 9l16 9" />
      <Path d="M11 18v20h26V18" />
      <Path d="M17 26h14M17 32h9" />
    </>
  ),
  /* 8. Currency Markets & Exchange Rates — two currencies swapping */
  8: (
    <>
      <Circle cx="16" cy="16" r="9" />
      <Circle cx="32" cy="32" r="9" />
      <Path d="M16 11v10M18 13h-3a1.8 1.8 0 0 0 0 3.5h1a1.8 1.8 0 0 1 0 3.5h-3" />
      <Path d="M28 32h8M32 28v8" />
    </>
  ),
  /* 9. Emerging Markets & Economic Development — climbing from a low base */
  9: (
    <>
      <Path d="M6 40h36" />
      <Path d="M9 36V30M18 36V23M27 36V16M36 36V9" />
      <Path d="M9 30l27-21" />
    </>
  ),
  /* 10. Global Economics Foundations Checkpoint — the flag at the mark */
  10: (
    <>
      <Path d="M14 42V7" />
      <Path d="M14 9h20l-5 7 5 7H14" />
      <Path d="M7 42h28" />
    </>
  ),
  /* 11. Labor Markets & Employment — people and work */
  11: (
    <>
      <Circle cx="15" cy="15" r="5" />
      <Path d="M7 33c0-6 4-10 8-10s8 4 8 10" />
      <Rect x="26" y="20" width="16" height="12" rx="2" />
      <Path d="M31 20v-3h6v3" />
    </>
  ),
  /* 12. Income Inequality & Wealth Distribution — an uneven curve */
  12: (
    <>
      <Path d="M7 40V8M7 40h34" />
      <Path d="M7 40C22 39 32 31 40 10" />
      <Path d="M7 40L40 10" />
    </>
  ),
  /* 13. Economic Indicators & Leading Signals — the panel of readouts */
  13: (
    <>
      <Rect x="5" y="10" width="38" height="27" rx="3" />
      <Path d="M11 25l5-5 4 3 6-7" />
      <Path d="M12 32h4M20 30h4M28 32h4M36 28h2" />
    </>
  ),
  /* 14. Central Banks Around the World — many institutions, one system */
  14: (
    <>
      <Path d="M5 17l9-5 9 5" />
      <Path d="M7 17v14h14V17" />
      <Path d="M25 26l7-4 7 4" />
      <Path d="M27 26v11h10V26" />
      <Path d="M5 41h38" />
    </>
  ),
  /* 15. Trade Wars & Tariffs — a barrier at the border */
  15: (
    <>
      <Path d="M24 6v36" />
      <Path d="M8 14h11M8 24h11M8 34h11" />
      <Path d="M29 19h11M29 29h11" />
      <Path d="M20 10l8 6-8 6" />
    </>
  ),
  /* 16. Economic Sanctions & Geopolitics — access denied */
  16: (
    <>
      <Circle cx="24" cy="24" r="16" />
      <Path d="M13 13l22 22" />
      <Path d="M24 8v8M24 32v8" />
    </>
  ),
  /* 17. Commodity Markets & Natural Resources — raw goods in crates */
  17: (
    <>
      <Rect x="6" y="24" width="17" height="15" rx="2" />
      <Rect x="25" y="24" width="17" height="15" rx="2" />
      <Rect x="15" y="8" width="17" height="15" rx="2" />
      <Path d="M6 31h17M25 31h17M15 15h17" />
    </>
  ),
  /* 18. The Economics of Climate Change — the cost of a warming world */
  18: (
    <>
      <Path d="M24 42V22" />
      <Path d="M24 22a10 10 0 1 0 0-15 10 10 0 0 0 0 15Z" />
      <Path d="M13 31l11-6M35 31l-11-6" />
      <Path d="M6 40c4-3 8-3 12 0" />
    </>
  ),
  /* 19. Digital Economy & Platform Economics — value in the connections */
  19: (
    <>
      <Circle cx="24" cy="24" r="5" />
      <Circle cx="11" cy="12" r="3.4" />
      <Circle cx="37" cy="12" r="3.4" />
      <Circle cx="11" cy="36" r="3.4" />
      <Circle cx="37" cy="36" r="3.4" />
      <Path d="M14 15l6 6M34 15l-6 6M14 33l6-6M34 33l-6-6" />
    </>
  ),
  /* 20. Debt, Deficits & Sovereign Risk — the pile and the shortfall */
  20: (
    <>
      <Rect x="7" y="26" width="34" height="7" rx="1.5" />
      <Rect x="11" y="18" width="26" height="7" rx="1.5" />
      <Rect x="15" y="10" width="18" height="7" rx="1.5" />
      <Path d="M14 39l6 4 6-6 8 5" />
    </>
  ),
  /* 21. Economic Bubbles & Financial Crises — it pops */
  21: (
    <>
      <Path d="M22 8a11 12 0 0 1 0 24 11 12 0 0 1 0-24Z" />
      <Path d="M33 12l6-5M36 20h7M33 30l5 4" />
      <Path d="M22 32v6" />
    </>
  ),
  /* 22. Behavioral Economics in Policy — the nudge, official */
  22: (
    <>
      <Path d="M7 12h34L28 27v11l-8 4V27Z" />
      <Path d="M20 6h8" />
      <Circle cx="24" cy="3" r="1.6" />
    </>
  ),
  /* 23. The Future of Money: CBDCs & Digital Currency — a coin made of circuitry */
  23: (
    <>
      <Circle cx="24" cy="24" r="14" />
      <Path d="M24 10v28M17 17h14M17 31h14" />
      <Path d="M10 24h28" />
    </>
  ),
  /* 24. Development Economics & Poverty — a step up from the base */
  24: (
    <>
      <Path d="M6 40h36" />
      <Rect x="8" y="32" width="9" height="8" rx="1.5" />
      <Rect x="20" y="24" width="9" height="16" rx="1.5" />
      <Rect x="32" y="14" width="9" height="26" rx="1.5" />
      <Path d="M12 26c6-9 16-14 24-14" />
    </>
  ),
  /* 25. Global Economics Advanced Capstone — the world, mastered */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Circle cx="24" cy="17" r="2" />
    </>
  ),
};
