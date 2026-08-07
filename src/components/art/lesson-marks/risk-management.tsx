/** Risk Management — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx
 * The scale appears once (lesson 1); it used to be 9 of 25 nodes. */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. What Is Risk? — the only scale */
  1: (
    <>
      <Path d="M9 17h30M24 12v26M16 41h16" />
      <Path d="M4 23c0 5 4 8 9 8s9-3 9-8Z" />
      <Path d="M26 23c0 5 4 8 9 8s9-3 9-8Z" />
    </>
  ),
  /* 2. Measuring & Managing Market Risk — the swing, measured */
  2: (
    <>
      <Path d="M6 40V8M6 40h36" />
      <Path d="M9 26c5-12 8 14 13 2s8-14 14 4" />
      <Path d="M6 26h36" strokeDasharray="4 4" />
    </>
  ),
  /* 3. Value at Risk Deep Dive — the tail you cut at */
  3: (
    <>
      <Path d="M6 38h36" />
      <Path d="M6 38c7 0 9-22 18-22s11 22 18 22" />
      <Path d="M14 38V22" />
      <Path d="M11 42v-4" />
    </>
  ),
  /* 4. Credit Risk & Default Probability — the card that may not pay */
  4: (
    <>
      <Rect x="6" y="14" width="36" height="22" rx="4" />
      <Path d="M6 22h36" />
      <Path d="M13 30h7" />
      <Path d="M30 27l8 8M38 27l-8 8" />
    </>
  ),
  /* 5. Operational & Liquidity Risk — the pipe that can block */
  5: (
    <>
      <Path d="M8 14h14a8 8 0 0 1 8 8v16" />
      <Path d="M24 32l6 7 6-7" />
      <Path d="M14 10v8M10 14h8" />
      <Path d="M36 14l6-6" />
    </>
  ),
  /* 6. Options & Hedging Strategies — the offsetting position */
  6: (
    <>
      <Path d="M24 40V24" />
      <Path d="M24 24L11 11M24 24l13-13" />
      <Path d="M11 18v-7h7M37 18v-7h-7" />
      <Path d="M14 40h20" />
    </>
  ),
  /* 7. Fixed Income Risk & Duration — the lever arm of time */
  7: (
    <>
      <Path d="M6 32h30" />
      <Circle cx="14" cy="32" r="3" />
      <Path d="M36 32V18" />
      <Rect x="31" y="10" width="10" height="8" rx="1.5" />
      <Path d="M6 38h36" />
    </>
  ),
  /* 8. Enterprise Risk Management — risk across the whole org */
  8: (
    <>
      <Circle cx="24" cy="11" r="5" />
      <Path d="M24 16v6M11 28v-6h26v6" />
      <Path d="M11 28l4 3-4 3-4-3Z" />
      <Path d="M37 28l4 3-4 3-4-3Z" />
      <Path d="M24 28l4 3-4 3-4-3Z" />
    </>
  ),
  /* 9. Regulatory Frameworks & Basel III — the rulebook, locked */
  9: (
    <>
      <Rect x="8" y="8" width="22" height="30" rx="2" />
      <Path d="M13 16h12M13 23h8" />
      <Rect x="28" y="26" width="14" height="12" rx="2" />
      <Path d="M32 26v-4a3 3 0 0 1 6 0v4" />
    </>
  ),
  /* 10. Risk Management Capstone — the flag */
  10: (
    <>
      <Path d="M14 42V7" />
      <Path d="M14 9h20l-5 7 5 7H14" />
      <Path d="M7 42h28" />
    </>
  ),
  /* 11. Tail Risk & Black Swan Events — the rare bird */
  11: (
    <>
      <Path d="M10 34c0-9 7-15 15-15 6 0 10 3 12 8" />
      <Path d="M25 19V9c5 0 8 3 8 7" />
      <Path d="M10 34c8 5 20 5 27-2" />
      <Circle cx="27" cy="13" r="1.4" />
    </>
  ),
  /* 12. Counterparty Risk & Collateral Management — who is on the other side */
  12: (
    <>
      <Circle cx="13" cy="18" r="6" />
      <Circle cx="35" cy="18" r="6" />
      <Path d="M19 18h10" />
      <Rect x="17" y="30" width="14" height="10" rx="2" />
      <Path d="M13 24v6M35 24v6" />
    </>
  ),
  /* 13. Currency Risk & FX Hedging — two currencies, one exposure */
  13: (
    <>
      <Circle cx="16" cy="17" r="9" />
      <Path d="M16 12v10M18 14h-3a1.8 1.8 0 0 0 0 3.5h1a1.8 1.8 0 0 1 0 3.5h-3" />
      <Path d="M27 33a12 12 0 0 1 15-9" />
      <Path d="M39 20l4 4-4 4" />
    </>
  ),
  /* 14. Interest Rate Risk Management — the curve that moves under you */
  14: (
    <>
      <Path d="M6 40V8M6 40h36" />
      <Path d="M9 34c8 0 14-6 18-16" />
      <Path d="M9 28c8 0 15-5 20-13" strokeDasharray="4 3" />
      <Path d="M33 15l6-4" />
    </>
  ),
  /* 15. Insurance & Risk Transfer — cover, handed over */
  15: (
    <>
      <Path d="M6 22a18 18 0 0 1 36 0Z" />
      <Path d="M24 22v11a4 4 0 0 0 8 3" />
      <Path d="M12 34l-4 4M8 38h5" />
    </>
  ),
  /* 16. Cyber Risk & Technology Threats — the breach */
  16: (
    <>
      <Rect x="8" y="14" width="32" height="20" rx="3" />
      <Path d="M18 40h12M24 34v6" />
      <Path d="M18 20l4 4-4 4" />
      <Path d="M28 28h6" />
    </>
  ),
  /* 17. Climate Risk & ESG Risk Factors — the exposed world */
  17: (
    <>
      <Circle cx="24" cy="22" r="13" />
      <Path d="M11 22h26" />
      <Path d="M24 9c5 4 5 22 0 26" />
      <Path d="M8 40c5-4 10-4 16 0s11 4 16 0" />
    </>
  ),
  /* 18. Model Risk & Validation — the model, questioned */
  18: (
    <>
      <Rect x="7" y="10" width="26" height="26" rx="2" />
      <Path d="M7 19h26M16 10v26" />
      <Circle cx="36" cy="34" r="7" />
      <Path d="M36 30v4M36 37h.01" />
    </>
  ),
  /* 19. Scenario Analysis & War Gaming — branching futures */
  19: (
    <>
      <Circle cx="9" cy="24" r="4" />
      <Path d="M13 24h8" />
      <Path d="M21 24L34 12M21 24l13 12M21 24h13" />
      <Circle cx="38" cy="10" r="3" />
      <Circle cx="38" cy="24" r="3" />
      <Circle cx="38" cy="38" r="3" />
    </>
  ),
  /* 20. Portfolio Risk Decomposition — the whole split into sources */
  20: (
    <>
      <Circle cx="24" cy="24" r="15" />
      <Path d="M24 9v15L37 31" />
      <Path d="M24 24L9 24" />
      <Path d="M24 24l-8 13" />
    </>
  ),
  /* 21. Systemic Risk & Contagion — one falls, all fall */
  21: (
    <>
      <Rect x="7" y="14" width="7" height="20" rx="1.5" />
      <Rect x="18" y="14" width="7" height="20" rx="1.5" transform="rotate(12 21.5 24)" />
      <Rect x="29" y="14" width="7" height="20" rx="1.5" transform="rotate(24 32.5 24)" />
      <Path d="M6 40h36" />
    </>
  ),
  /* 22. Behavioral Risk: Human Factors — the person in the system */
  22: (
    <>
      <Circle cx="18" cy="15" r="6" />
      <Path d="M8 38c0-8 5-13 10-13s10 5 10 13" />
      <Path d="M33 20l7 7M40 20l-7 7" />
      <Circle cx="36" cy="36" r="5" />
    </>
  ),
  /* 23. Quantitative Risk Modeling — risk as arithmetic */
  23: (
    <>
      <Rect x="8" y="8" width="32" height="32" rx="3" />
      <Path d="M14 17h8M18 13v8" />
      <Path d="M26 17h8" />
      <Path d="M14 30h8M26 27h8M26 33h8" />
    </>
  ),
  /* 24. Risk Governance & Board Oversight — the table that decides */
  24: (
    <>
      <Path d="M8 24h32" />
      <Circle cx="13" cy="16" r="3.4" />
      <Circle cx="24" cy="14" r="3.4" />
      <Circle cx="35" cy="16" r="3.4" />
      <Path d="M14 30v8M34 30v8M24 24v14" />
    </>
  ),
  /* 25. Risk Management Advanced Capstone — the cap */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Path d="M40 19v11" />
    </>
  ),
};
