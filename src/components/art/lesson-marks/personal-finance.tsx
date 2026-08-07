/** Personal Finance — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. Why Personal Finance Matters — a life held in one hand */
  1: (
    <>
      <Path d="M6 32c4-6 10-6 14-2" />
      <Path d="M20 30c4-9 12-12 18-8 5 4 4 12-3 16-5 3-11 3-15 0" />
      <Path d="M29 22v10M32 25h-4a2.4 2.4 0 0 0 0 5h1a2.4 2.4 0 0 1 0 5h-4" />
    </>
  ),
  /* 2. Budgeting Basics — the plan, split */
  2: (
    <>
      <Circle cx="24" cy="24" r="16" />
      <Path d="M24 8v16l14 7" />
      <Path d="M24 24L10 31" />
    </>
  ),
  /* 3. Tracking Your Spending — every outflow, logged */
  3: (
    <>
      <Rect x="9" y="7" width="30" height="34" rx="3" />
      <Path d="M15 15h12M15 22h18M15 29h9" />
      <Circle cx="31" cy="32" r="5" />
      <Path d="M31 30v4" />
    </>
  ),
  /* 4. Building an Emergency Fund — a reserve behind glass */
  4: (
    <>
      <Path d="M9 14h30v25H9Z" />
      <Path d="M9 14l15-7 15 7" />
      <Path d="M18 39V27h12v12" />
      <Path d="M22 33h4" />
    </>
  ),
  /* 5. Understanding Credit Scores — a dial with a needle */
  5: (
    <>
      <Path d="M6 34a18 18 0 0 1 36 0" />
      <Path d="M24 34L34 20" />
      <Circle cx="24" cy="34" r="2.6" />
      <Path d="M9 27l3 1M39 27l-3 1M24 15v3" />
    </>
  ),
  /* 6. Managing Debt Wisely — the balance coming down */
  6: (
    <>
      <Rect x="8" y="12" width="32" height="20" rx="3" />
      <Path d="M8 19h32" />
      <Path d="M14 40l6-5 6 3 8-7" />
      <Path d="M34 31h5v5" />
    </>
  ),
  /* 7. Taxes 101 — the slice taken */
  7: (
    <>
      <Circle cx="24" cy="24" r="15" />
      <Path d="M24 9v15l13 7" />
      <Path d="M24 24L11 17" />
      <Path d="M31 6l3 3-3 3" />
    </>
  ),
  /* 8. Insurance Essentials — cover over a household */
  8: (
    <>
      <Path d="M5 22a19 19 0 0 1 38 0Z" />
      <Path d="M24 22v9" />
      <Path d="M16 40V31h16v9Z" />
      <Path d="M16 31l8-5 8 5" />
    </>
  ),
  /* 9. Smart Saving & Banking — the institution, and a coin going in */
  9: (
    <>
      <Path d="M6 20L24 10l18 10" />
      <Path d="M6 20h36M9 40h30" />
      <Path d="M14 24v12M24 24v12M34 24v12" />
      <Circle cx="24" cy="6" r="3" />
    </>
  ),
  /* 10. Building Long-Term Wealth — layers laid over years */
  10: (
    <>
      <Rect x="7" y="32" width="34" height="8" rx="1.5" />
      <Rect x="11" y="23" width="26" height="8" rx="1.5" />
      <Rect x="15" y="14" width="18" height="8" rx="1.5" />
      <Path d="M24 11V6M21 8l3-3 3 3" />
    </>
  ),
  /* 11. Negotiating Your Salary & Income — two sides, one number */
  11: (
    <>
      <Path d="M18 16a9 9 0 0 0 0 17h3" />
      <Path d="M30 33a9 9 0 0 0 0-17h-3" />
      <Path d="M24 8v5M20 10l4-4 4 4" />
      <Path d="M14 41h20" />
    </>
  ),
  /* 12. The Psychology of Spending — the impulse, inside the head */
  12: (
    <>
      <Path d="M15 40v-8c-4-4-6-9-5-14 2-8 10-12 17-10 8 2 11 10 8 17-2 4-4 7-4 11v4" />
      <Path d="M19 24h10l-1.5 8h-7Z" />
      <Path d="M22 24a2.5 2.5 0 0 1 5 0" />
    </>
  ),
  /* 13. Student Loans & Education Financing — the cap, and the clock on it */
  13: (
    <>
      <Path d="M5 17L22 9l17 8-17 8Z" />
      <Path d="M12 21v8c0 3 5 4 10 4" />
      <Circle cx="34" cy="33" r="8" />
      <Path d="M34 29v4l3 2" />
    </>
  ),
  /* 14. Renting vs. Buying a Home — one key, two doors */
  14: (
    <>
      <Path d="M6 22l9-8 9 8v18H6Z" />
      <Path d="M26 22l8-8 8 8v18H26Z" />
      <Circle cx="15" cy="30" r="2.4" />
      <Path d="M34 28v8" />
    </>
  ),
  /* 15. Introduction to Investing for Personal Finance — the first seed */
  15: (
    <>
      <Path d="M24 42V25" />
      <Path d="M24 32c-7 0-11-4-11-11 7 0 11 4 11 11Z" />
      <Path d="M24 28c6 0 10-4 10-10-6 0-10 4-10 10Z" />
      <Path d="M14 42h20" />
    </>
  ),
  /* 16. Retirement Accounts Deep Dive — time in a vessel */
  16: (
    <>
      <Path d="M13 7h22M13 41h22" />
      <Path d="M16 7c0 9 8 12 8 17s-8 8-8 17" />
      <Path d="M32 7c0 9-8 12-8 17s8 8 8 17" />
      <Circle cx="24" cy="34" r="2.2" />
    </>
  ),
  /* 17. Side Hustles & Multiple Income Streams — several inflows, one pool */
  17: (
    <>
      <Path d="M10 8v10a6 6 0 0 0 6 6h16" />
      <Path d="M24 8v6a6 6 0 0 0 6 6h2" />
      <Path d="M38 8v16" />
      <Path d="M10 30h28l-3 11H13Z" />
    </>
  ),
  /* 18. Financial Planning for Life Events — a marked timeline */
  18: (
    <>
      <Path d="M6 30h36" />
      <Circle cx="14" cy="30" r="3" />
      <Circle cx="26" cy="30" r="3" />
      <Circle cx="38" cy="30" r="3" />
      <Path d="M14 24v-6M26 24v-9M38 24v-5" />
    </>
  ),
  /* 19. Identity Theft & Financial Security — the person, locked */
  19: (
    <>
      <Circle cx="20" cy="16" r="7" />
      <Path d="M8 40c0-8 5-13 12-13 2 0 4 .4 6 1" />
      <Rect x="27" y="27" width="15" height="12" rx="2.5" />
      <Path d="M31 27v-4a3.5 3.5 0 0 1 7 0v4" />
    </>
  ),
  /* 20. Understanding Inflation & Purchasing Power — the same money, buying less */
  20: (
    <>
      <Circle cx="15" cy="20" r="9" />
      <Path d="M15 15v10M17.5 17h-4a2 2 0 0 0 0 4h1a2 2 0 0 1 0 4h-4" />
      <Path d="M29 24h13l-2 15H31Z" />
      <Path d="M33 20a3 3 0 0 1 6 0" />
    </>
  ),
  /* 21. Estate Planning Basics — the document, sealed */
  21: (
    <>
      <Path d="M11 6h26v28H11Z" />
      <Path d="M17 14h14M17 21h9" />
      <Circle cx="30" cy="36" r="6" />
      <Path d="M27 41l-2 5 5-2 5 2-2-5" />
    </>
  ),
  /* 22. Charitable Giving & Tax Benefits — a hand giving, a leaf returning */
  22: (
    <>
      <Path d="M8 34c4-6 9-7 13-4" />
      <Path d="M21 30c3-8 11-11 16-7 4 4 3 11-3 14-4 2-9 2-13 0" />
      <Path d="M30 12c5 0 8 3 8 8-5 0-8-3-8-8Z" />
    </>
  ),
  /* 23. Financial Independence & Early Retirement — the line crosses out */
  23: (
    <>
      <Path d="M7 40V8" />
      <Path d="M7 40h34" />
      <Path d="M10 33l8-6 6 4 10-16" />
      <Path d="M34 15h6v6" />
      <Circle cx="34" cy="15" r="2" />
    </>
  ),
  /* 24. Teaching Kids About Money — a smaller hand learning */
  24: (
    <>
      <Circle cx="17" cy="15" r="6" />
      <Path d="M7 40c0-8 4-13 10-13s10 5 10 13" />
      <Circle cx="35" cy="27" r="8" />
      <Path d="M35 23v8M37 25h-3a1.8 1.8 0 0 0 0 3.5h1a1.8 1.8 0 0 1 0 3.5h-3" />
    </>
  ),
  /* 25. Personal Finance Capstone — everything, in the safe */
  25: (
    <>
      <Rect x="6" y="8" width="36" height="32" rx="3" />
      <Circle cx="24" cy="24" r="9" />
      <Path d="M24 15v6M24 27v6M15 24h6M27 24h6" />
      <Path d="M35 34l3 3" />
    </>
  ),
};
