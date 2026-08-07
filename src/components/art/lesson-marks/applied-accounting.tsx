/** Applied Accounting — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx
 * A ledger appears once (lesson 1); it used to be 19 of 25 nodes. */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. The Language of Accounting — the only ledger */
  1: (
    <>
      <Rect x="9" y="7" width="30" height="34" rx="3" />
      <Path d="M17 7v34" />
      <Path d="M22 16h11M22 24h11M22 32h7" />
    </>
  ),
  /* 2. Financial Ratios: X-Raying a Company — one number over another */
  2: (
    <>
      <Circle cx="24" cy="24" r="16" />
      <Path d="M13 24h22" />
      <Circle cx="24" cy="16" r="2.4" />
      <Circle cx="24" cy="32" r="2.4" />
    </>
  ),
  /* 3. The Income Statement Deep Dive — revenue down to profit */
  3: (
    <>
      <Path d="M8 10h32" />
      <Path d="M12 18h24" />
      <Path d="M16 26h16" />
      <Path d="M20 34h8" />
      <Path d="M24 38v4" />
    </>
  ),
  /* 4. The Balance Sheet Decoded — two sides that must match */
  4: (
    <>
      <Path d="M9 16h30M24 11v27M16 41h16" />
      <Path d="M4 22c0 5 4 8 9 8s9-3 9-8Z" />
      <Path d="M26 22c0 5 4 8 9 8s9-3 9-8Z" />
    </>
  ),
  /* 5. Cash Flow Statement Mastery — money moving through */
  5: (
    <>
      <Path d="M8 13h16a8 8 0 0 1 8 8v14" />
      <Path d="M26 29l6 7 6-7" />
      <Path d="M8 7v12M4 13h8" />
    </>
  ),
  /* 6. Journal Entries & Double-Entry Bookkeeping — every entry, twice */
  6: (
    <>
      <Rect x="6" y="10" width="16" height="28" rx="2" />
      <Rect x="26" y="10" width="16" height="28" rx="2" />
      <Path d="M10 19h8M10 26h6M30 19h8M30 26h6" />
    </>
  ),
  /* 7. Cost Accounting & Break-Even Analysis — where the lines meet */
  7: (
    <>
      <Path d="M8 8v32h32" />
      <Path d="M12 34L38 12" />
      <Path d="M12 20h26" />
      <Circle cx="27" cy="20" r="2.6" />
    </>
  ),
  /* 8. Auditing & Internal Controls — checked and sealed */
  8: (
    <>
      <Path d="M11 7h18l8 8v26H11Z" />
      <Path d="M29 7v8h8" />
      <Path d="M16 27l4 4 8-9" />
    </>
  ),
  /* 9. Forensic Accounting & Fraud Detection — the lens over the books */
  9: (
    <>
      <Rect x="7" y="9" width="20" height="26" rx="2" />
      <Path d="M12 17h10M12 24h6" />
      <Circle cx="31" cy="30" r="9" />
      <Path d="M37 36l6 6" />
    </>
  ),
  /* 10. Applied Accounting Foundations Checkpoint — the mark reached */
  10: (
    <>
      <Path d="M14 42V7" />
      <Path d="M14 9h20l-5 7 5 7H14" />
      <Path d="M7 42h28" />
    </>
  ),
  /* 11. Revenue Recognition & Accrual Accounting — earned before paid */
  11: (
    <>
      <Path d="M9 7h16l8 8v14" />
      <Path d="M9 7v34h12" />
      <Path d="M25 7v8h8" />
      <Path d="M27 36h15M37 31l5 5-5 5" />
    </>
  ),
  /* 12. Inventory Accounting Methods — what sits on the shelf */
  12: (
    <>
      <Rect x="6" y="24" width="17" height="15" rx="2" />
      <Rect x="25" y="24" width="17" height="15" rx="2" />
      <Rect x="15" y="8" width="17" height="15" rx="2" />
      <Path d="M6 31h17M25 31h17M15 15h17" />
    </>
  ),
  /* 13. Depreciation & Asset Management — value stepping down */
  13: (
    <>
      <Rect x="7" y="13" width="9" height="26" rx="1.5" />
      <Rect x="19" y="22" width="9" height="17" rx="1.5" />
      <Rect x="31" y="30" width="9" height="9" rx="1.5" />
      <Path d="M40 8l-5 5M35 8h5v5" />
    </>
  ),
  /* 14. Accounts Receivable & Payable Management — owed both ways */
  14: (
    <>
      <Path d="M8 17h22M24 11l6 6-6 6" />
      <Path d="M40 31H18M24 25l-6 6 6 6" />
    </>
  ),
  /* 15. Payroll Accounting & Employee Benefits — people on the books */
  15: (
    <>
      <Circle cx="15" cy="15" r="5" />
      <Path d="M7 33c0-6 4-10 8-10s8 4 8 10" />
      <Rect x="27" y="18" width="15" height="20" rx="2" />
      <Path d="M31 25h7M31 31h4" />
    </>
  ),
  /* 16. Tax Accounting Fundamentals — the receipt */
  16: (
    <>
      <Path d="M11 7h26v30l-4-3-4 3-4-3-4 3-4-3-6 3Z" />
      <Path d="M17 16h14M17 23h9" />
    </>
  ),
  /* 17. Budgeting & Variance Analysis — plan against actual */
  17: (
    <>
      <Path d="M7 40h34" />
      <Rect x="10" y="20" width="7" height="20" rx="1" />
      <Rect x="21" y="14" width="7" height="26" rx="1" />
      <Rect x="32" y="26" width="7" height="14" rx="1" />
      <Path d="M8 24h36" />
    </>
  ),
  /* 18. Consolidation & Group Accounting — many entities, one report */
  18: (
    <>
      <Rect x="6" y="8" width="12" height="10" rx="2" />
      <Rect x="30" y="8" width="12" height="10" rx="2" />
      <Path d="M12 18v6h24v-6" />
      <Rect x="15" y="28" width="18" height="13" rx="2" />
      <Path d="M24 24v4" />
    </>
  ),
  /* 19. International Accounting Standards (IFRS vs GAAP) — two rulebooks */
  19: (
    <>
      <Rect x="5" y="11" width="16" height="26" rx="2" />
      <Rect x="27" y="11" width="16" height="26" rx="2" />
      <Path d="M21 24h6" />
      <Path d="M9 19h8M31 19h8" />
    </>
  ),
  /* 20. Nonprofit & Government Accounting — the public purse */
  20: (
    <>
      <Path d="M7 19L24 10l17 9" />
      <Path d="M7 19h34M10 39h28" />
      <Path d="M15 23v12M24 23v12M33 23v12" />
    </>
  ),
  /* 21. Managerial Accounting & Decision Making — numbers that choose */
  21: (
    <>
      <Path d="M16 41h17" />
      <Path d="M30 37c0-8 5-14 0-21l-5 3 2-7c-7 2-12 8-9 14l-5 3" />
      <Path d="M18 37h12" />
    </>
  ),
  /* 22. Advanced Financial Statement Analysis — the panel of readouts */
  22: (
    <>
      <Rect x="5" y="10" width="38" height="27" rx="3" />
      <Path d="M11 25l5-5 4 3 6-7" />
      <Path d="M12 32h4M20 30h4M28 32h4M36 28h2" />
    </>
  ),
  /* 23. Accounting Information Systems — the books, wired */
  23: (
    <>
      <Circle cx="24" cy="24" r="5" />
      <Circle cx="11" cy="12" r="3.4" />
      <Circle cx="37" cy="12" r="3.4" />
      <Circle cx="24" cy="39" r="3.4" />
      <Path d="M14 15l6 6M34 15l-6 6M24 29v6" />
    </>
  ),
  /* 24. Ethics & Professional Standards in Accounting — the seal you can lose */
  24: (
    <>
      <Path d="M24 7l15 5v12c0 9-7 15-15 18-8-3-15-9-15-18V12Z" />
      <Path d="M18 24l4 4 9-9" />
    </>
  ),
  /* 25. Applied Accounting Advanced Capstone — the cap */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Path d="M40 19v11" />
    </>
  ),
};
