/** Behavioral Finance — one distinct mark per lesson. Conventions: see ./investing-fundamentals.tsx
 *
 * This is the course that made the problem visible: it used to render the same `mind` glyph on 24
 * of its 25 nodes, sixteen of them consecutive. Every mark below must stay recognisably DIFFERENT
 * at 36pt — a head silhouette is used exactly once (lesson 1), never as a default. */
import { Circle, Path, Rect } from 'react-native-svg';

export const M: Record<number, React.ReactNode> = {
  /* 1. Your Brain vs. Your Money — the only head in the course */
  1: (
    <>
      <Path d="M15 40v-8c-4-4-6-9-5-14 2-8 10-12 17-10 8 2 11 10 8 17-2 4-4 7-4 11v4" />
      <Path d="M27 20a4 4 0 1 0-4 4c3 0 5-2 5-5a6 6 0 0 0-7-6" />
    </>
  ),
  /* 2. Cognitive Biases That Destroy Wealth — the leak */
  2: (
    <>
      <Path d="M11 15h26l-4 24H15Z" />
      <Path d="M18 10a6 6 0 0 1 12 0" />
      <Circle cx="26" cy="44" r="1.7" />
    </>
  ),
  /* 3. Emotional Cycles of Investing — euphoria to despair and back */
  3: (
    <>
      <Path d="M5 30c6-18 11 14 17 0s10-16 16 2" />
      <Circle cx="13" cy="14" r="2.2" />
      <Circle cx="35" cy="36" r="2.2" />
      <Path d="M6 40h36" />
    </>
  ),
  /* 4. Herd Behavior & Social Proof — the many, going one way */
  4: (
    <>
      <Circle cx="12" cy="19" r="4" />
      <Path d="M6 38c0-5 3-8 6-8s6 3 6 8" />
      <Circle cx="27" cy="16" r="5" />
      <Path d="M19 38c0-7 4-11 8-11s8 4 8 11" />
      <Path d="M38 22h6M41 19l3 3-3 3" />
    </>
  ),
  /* 5. Overconfidence & Illusion of Control — inflated, tethered by nothing */
  5: (
    <>
      <Path d="M24 6a12 13 0 0 1 0 26 12 13 0 0 1 0-26Z" />
      <Path d="M24 32v5" />
      <Path d="M19 42c2-3 4-3 5 0M29 42c-2-3-4-3-5 0" />
    </>
  ),
  /* 6. Mental Accounting & Framing Effects — same money, different boxes */
  6: (
    <>
      <Rect x="6" y="16" width="11" height="20" rx="2" />
      <Rect x="19" y="16" width="11" height="20" rx="2" />
      <Rect x="32" y="16" width="10" height="20" rx="2" />
      <Path d="M8 11h7M21 11h7M34 11h6" />
    </>
  ),
  /* 7. Prospect Theory & Decision Making — a loss weighs more than the gain */
  7: (
    <>
      <Path d="M8 20h32M24 15v23M17 40h14" />
      <Path d="M3 26c0 5 4 8 9 8s9-3 9-8Z" />
      <Path d="M29 24c0 3 3 5 6 5s6-2 6-5Z" />
    </>
  ),
  /* 8. Nudge Theory & Choice Architecture — the path, shaped */
  8: (
    <>
      <Path d="M6 12h36L28 27v11l-8 4V27Z" />
      <Path d="M24 6v-2" />
      <Path d="M17 8l7-4 7 4" />
    </>
  ),
  /* 9. Building a Rational Investment Framework — steps you climb on purpose */
  9: (
    <>
      <Rect x="6" y="31" width="10" height="9" rx="1.5" />
      <Rect x="19" y="22" width="10" height="18" rx="1.5" />
      <Rect x="32" y="13" width="10" height="27" rx="1.5" />
      <Path d="M36 8l4-4M40 4h-4v4" />
    </>
  ),
  /* 10. Behavioral Finance Capstone — the discipline, kept */
  10: (
    <>
      <Rect x="7" y="9" width="34" height="30" rx="3" />
      <Circle cx="24" cy="24" r="8" />
      <Path d="M24 16v5M24 27v5M16 24h5M27 24h5" />
    </>
  ),
  /* 11. Anchoring Bias & Price Perception — the first number holds you */
  11: (
    <>
      <Circle cx="24" cy="9" r="4" />
      <Path d="M24 13v25M16 19h16" />
      <Path d="M10 27c0 9 7 13 14 13s14-4 14-13" />
    </>
  ),
  /* 12. Sunk Cost Fallacy in Investing — value already gone, still carried */
  12: (
    <>
      <Rect x="7" y="13" width="9" height="26" rx="1.5" />
      <Rect x="19" y="22" width="9" height="17" rx="1.5" />
      <Rect x="31" y="30" width="9" height="9" rx="1.5" />
      <Path d="M40 8l-5 5M35 8h5v5" />
    </>
  ),
  /* 13. Regret Aversion & Decision Paralysis — frozen mid-choice */
  13: (
    <>
      <Path d="M24 40V26" />
      <Path d="M24 26L12 14M24 26l12-12" />
      <Path d="M12 21v-7h7M36 21v-7h-7" />
      <Circle cx="24" cy="34" r="3" />
    </>
  ),
  /* 14. Status Quo Bias & Inertia — nothing moves */
  14: (
    <>
      <Rect x="9" y="22" width="30" height="18" rx="4" />
      <Path d="M16 22v-5a8 8 0 0 1 16 0v5" />
      <Path d="M24 29v5" />
    </>
  ),
  /* 15. Narrative Fallacy & Storytelling in Markets — a tale, not data */
  15: (
    <>
      <Path d="M7 10h34a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H19l-8 7v-7H7a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3Z" />
      <Path d="M11 22c4-6 8 3 12-3s7 4 11-1" />
    </>
  ),
  /* 16. Attention Bias & Media Influence — what pulls the eye */
  16: (
    <>
      <Path d="M14 33V21a10 10 0 0 1 20 0v12" />
      <Path d="M14 33h7M27 33h7" />
      <Path d="M14 26h7M27 26h7" />
    </>
  ),
  /* 17. Disposition Effect: Selling Winners Too Early — cut the gain, keep the loss */
  17: (
    <>
      <Path d="M7 40h34" />
      <Path d="M12 34V18" />
      <Path d="M24 34V10" />
      <Path d="M36 34V26" />
      <Path d="M19 14l10-6M19 8l10 6" />
    </>
  ),
  /* 18. Gambler's Fallacy & Hot Hand Bias — the die has no memory */
  18: (
    <>
      <Rect x="9" y="9" width="30" height="30" rx="5" />
      <Circle cx="18" cy="18" r="2.2" />
      <Circle cx="30" cy="18" r="2.2" />
      <Circle cx="18" cy="30" r="2.2" />
      <Circle cx="30" cy="30" r="2.2" />
    </>
  ),
  /* 19. Endowment Effect & Loss Aversion — worth more once it is yours */
  19: (
    <>
      <Path d="M12 24h24v16H12Z" />
      <Path d="M8 24l16-13 16 13" />
      <Path d="M20 40V31h8v9" />
      <Path d="M40 14l4-4M44 10h-4v4" />
    </>
  ),
  /* 20. Social Media & Modern Market Psychology — the feed as a network */
  20: (
    <>
      <Path d="M13 16l12 8-12 8M25 24l11-13M25 24l11 13" />
      <Circle cx="12" cy="15" r="4" />
      <Circle cx="12" cy="33" r="4" />
      <Circle cx="25" cy="24" r="4.6" />
      <Circle cx="38" cy="11" r="3.2" />
      <Circle cx="38" cy="37" r="3.2" />
    </>
  ),
  /* 21. Behavioral Portfolio Theory — buckets by goal, not by asset */
  21: (
    <>
      <Path d="M7 21h34l-4 18H11Z" />
      <Path d="M16 21a8 8 0 0 1 16 0" />
      <Path d="M18 27v7M24 27v7M30 27v7" />
    </>
  ),
  /* 22. Debiasing Techniques & Cognitive Tools — a checklist against yourself */
  22: (
    <>
      <Rect x="10" y="8" width="28" height="33" rx="3" />
      <Path d="M15 17l3 3 5-5" />
      <Path d="M15 27l3 3 5-5" />
      <Path d="M27 19h7M27 29h7" />
    </>
  ),
  /* 23. Behavioral Economics in Everyday Life — the ordinary basket */
  23: (
    <>
      <Path d="M7 15h5l4 18h20l4-13H14" />
      <Circle cx="19" cy="39" r="3" />
      <Circle cx="33" cy="39" r="3" />
    </>
  ),
  /* 24. Market Anomalies & Behavioral Explanations — the outlier off the line */
  24: (
    <>
      <Path d="M7 38L38 14" />
      <Circle cx="13" cy="34" r="2.2" />
      <Circle cx="21" cy="29" r="2.2" />
      <Circle cx="29" cy="23" r="2.2" />
      <Circle cx="16" cy="12" r="3.4" />
      <Path d="M16 7v-3" />
    </>
  ),
  /* 25. Behavioral Finance Advanced Capstone — mastery over the impulse */
  25: (
    <>
      <Path d="M5 17L24 9l19 8-19 8Z" />
      <Path d="M12 21v9c0 3 5 5 12 5s12-2 12-5v-9" />
      <Path d="M40 19v11" />
    </>
  ),
};
