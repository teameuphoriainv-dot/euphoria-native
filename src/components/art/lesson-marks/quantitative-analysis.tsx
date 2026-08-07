/** Quantitative Analysis — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx
 * The die appears once (lesson 2); it used to be 10 of 25 nodes. */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. What Is Quantitative Finance? — arithmetic on markets */
  1: (
    <>
      <Rect x="7" y="7" width="34" height="34" rx="3" />
      <Path d="M14 16h8M18 12v8" />
      <Path d="M26 16h8" />
      <Path d="M14 30h8M26 27h8M26 33h8" />
    </>
  ),
  /* 2. Probability & Expected Value — the only die */
  2: (
    <>
      <Rect x="9" y="9" width="30" height="30" rx="5" />
      <Circle cx="18" cy="18" r="2.2" />
      <Circle cx="30" cy="30" r="2.2" />
      <Circle cx="24" cy="24" r="2.2" />
    </>
  ),
  /* 3. Time Series Analysis — value along time */
  3: (
    <>
      <Path d="M6 40V8M6 40h36" />
      <Path d="M9 30c5 4 8-10 13-6s8 12 14-8" />
      <Path d="M14 44v-4M24 44v-4M34 44v-4" />
    </>
  ),
  /* 4. Portfolio Optimization & Markowitz — the efficient frontier */
  4: (
    <>
      <Path d="M7 40V8M7 40h35" />
      <Path d="M11 36c14 0 22-8 26-24" />
      <Circle cx="21" cy="30" r="2" />
      <Circle cx="30" cy="22" r="2" />
      <Circle cx="16" cy="24" r="2" />
    </>
  ),
  /* 5. Derivatives Pricing & Black-Scholes — the formula's payoff kink */
  5: (
    <>
      <Path d="M6 40V8M6 40h36" />
      <Path d="M9 32h14l14-18" />
      <Path d="M23 32v8" strokeDasharray="3 3" />
      <Circle cx="23" cy="32" r="2.4" />
    </>
  ),
  /* 6. Monte Carlo Methods in Finance — many paths */
  6: (
    <>
      <Path d="M6 24c6-10 10 8 16 0s10-12 16 4" />
      <Path d="M6 32c6-8 10 6 16 0s10-10 16 2" />
      <Path d="M6 16c6-8 10 6 16 0s10-8 16 2" />
      <Path d="M6 40h36" />
    </>
  ),
  /* 7. Factor Models & Alpha Generation — signals combining */
  7: (
    <>
      <Circle cx="10" cy="12" r="3" />
      <Circle cx="10" cy="24" r="3" />
      <Circle cx="10" cy="36" r="3" />
      <Circle cx="32" cy="24" r="6" />
      <Path d="M13 13l14 9M13 24h13M13 35l14-9" />
    </>
  ),
  /* 8. Statistical Arbitrage — two prices converging */
  8: (
    <>
      <Path d="M6 14c8 6 20 8 36 10" />
      <Path d="M6 34c8-6 20-8 36-10" />
      <Circle cx="42" cy="24" r="2.6" />
      <Path d="M6 40V8" />
    </>
  ),
  /* 9. Algorithmic Trading Systems — the rule that executes */
  9: (
    <>
      <Rect x="7" y="9" width="20" height="14" rx="2" />
      <Path d="M12 16h10" />
      <Path d="M27 16h6a4 4 0 0 1 4 4v8" />
      <Path d="M31 28l6 7 6-7" />
      <Path d="M7 34h16" />
    </>
  ),
  /* 10. Quantitative Analysis Foundations Checkpoint — the flag */
  10: (
    <>
      <Path d="M14 42V7" />
      <Path d="M14 9h20l-5 7 5 7H14" />
      <Path d="M7 42h28" />
    </>
  ),
  /* 11. Stochastic Calculus Foundations — an infinitesimal step */
  11: (
    <>
      <Path d="M6 38c8-4 6-22 14-24s10 14 18 8" />
      <Path d="M20 12h8M24 8v8" />
      <Path d="M6 42h36" />
    </>
  ),
  /* 12. Volatility Modeling & GARCH — clustered swings */
  12: (
    <>
      <Path d="M6 24h6l3-9 3 18 3-14 3 10 3-6" />
      <Path d="M30 24h12" />
      <Path d="M6 40h36" />
      <Path d="M36 18l6 6-6 6" />
    </>
  ),
  /* 13. Fixed Income Analytics — the coupon stream */
  13: (
    <>
      <Rect x="7" y="12" width="26" height="18" rx="2" />
      <Path d="M12 20h16" />
      <Path d="M14 34v6M22 34v6M30 34v6M38 34v6" />
      <Path d="M7 34h34" />
    </>
  ),
  /* 14. Exotic Options & Path-Dependent Derivatives — the route matters */
  14: (
    <>
      <Path d="M6 36c6-4 4-16 12-18s10 10 16 4" />
      <Circle cx="6" cy="36" r="2.4" />
      <Circle cx="34" cy="22" r="2.4" />
      <Path d="M38 14l4 4-4 4" />
      <Path d="M18 18v-6" />
    </>
  ),
  /* 15. Credit Derivatives & CDS Pricing — protection, priced */
  15: (
    <>
      <Path d="M24 8l13 4v11c0 8-6 13-13 15-7-2-13-7-13-15V12Z" />
      <Path d="M24 20v8M27 22h-4a2.2 2.2 0 0 0 0 4h1a2.2 2.2 0 0 1 0 4h-4" />
    </>
  ),
  /* 16. Interest Rate Models — the term structure */
  16: (
    <>
      <Path d="M6 40V8M6 40h36" />
      <Path d="M9 34c9 0 15-7 18-18" />
      <Path d="M30 14h10" />
      <Path d="M14 44v-4M24 44v-4M34 44v-4" />
    </>
  ),
  /* 17. Machine Learning for Quant Trading — layers that learn */
  17: (
    <>
      <Circle cx="10" cy="15" r="3" />
      <Circle cx="10" cy="33" r="3" />
      <Circle cx="24" cy="24" r="4" />
      <Circle cx="38" cy="15" r="3" />
      <Circle cx="38" cy="33" r="3" />
      <Path d="M13 16l8 6M13 32l8-6M27 22l8-6M27 26l8 6" />
    </>
  ),
  /* 18. High-Frequency Trading & Market Microstructure — speed */
  18: (
    <>
      <Circle cx="24" cy="26" r="14" />
      <Path d="M24 26V17" />
      <Path d="M24 26l6 4" />
      <Path d="M19 6h10M24 6v6" />
      <Path d="M38 12l3-3" />
    </>
  ),
  /* 19. Backtesting & Strategy Validation — replaying the past */
  19: (
    <>
      <Path d="M6 40V8M6 40h36" />
      <Path d="M10 32l7-7 5 5 8-13" />
      <Path d="M14 16a12 12 0 1 1 0 8" strokeDasharray="3 3" />
      <Path d="M11 12v5h5" />
    </>
  ),
  /* 20. Execution Algorithms & Transaction Costs — slippage */
  20: (
    <>
      <Path d="M8 16h26a5 5 0 0 1 0 10H16a5 5 0 0 0 0 10h22" />
      <Path d="M34 32l5 4-5 4" />
      <Circle cx="42" cy="16" r="2.4" />
    </>
  ),
  /* 21. Risk-Neutral Pricing & Measure Theory — the reweighted world */
  21: (
    <>
      <Path d="M9 18h30M24 13v25M16 41h16" />
      <Path d="M4 24c0 5 4 8 9 8s9-3 9-8Z" />
      <Path d="M26 24c0 5 4 8 9 8s9-3 9-8Z" />
      <Path d="M20 8h8" />
    </>
  ),
  /* 22. Copulas & Dependency Modeling — how tails move together */
  22: (
    <>
      <Circle cx="17" cy="24" r="10" />
      <Circle cx="31" cy="24" r="10" />
      <Path d="M24 16v16" strokeDasharray="3 3" />
    </>
  ),
  /* 23. Bayesian Methods in Finance — belief, updated */
  23: (
    <>
      <Path d="M6 38h36" />
      <Path d="M6 38c7 0 8-20 14-20s7 20 14 20" strokeDasharray="4 3" />
      <Path d="M10 38c6 0 9-26 16-26s8 26 14 26" />
      <Path d="M30 10l4-4" />
    </>
  ),
  /* 24. Quantum Computing & Future of Quant Finance — superposed states */
  24: (
    <>
      <Circle cx="24" cy="24" r="4" />
      <Path d="M24 8c9 0 16 7 16 16s-7 16-16 16" />
      <Path d="M24 8c-9 0-16 7-16 16s7 16 16 16" />
      <Path d="M8 16c8-5 24-5 32 0M8 32c8 5 24 5 32 0" />
    </>
  ),
  /* 25. Quantitative Analysis Advanced Capstone — the cap */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Path d="M40 19v11" />
    </>
  ),
};
