/**
 * Alternative Investments lesson 1 keepsake: a golden key in the pathway's glass case.
 *
 * The case is the pathway's keepsake SHAPE (aiCase in ai-kit.ts: brass cap, glass, velvet cushion,
 * marble plinth, gold plaque) and the key is this lesson's EMBLEM, so lessons 2 to 25 make their
 * keepsake with one aiKeepsake call and their own emblem. The key is lesson 1's because the
 * lesson is the way in: what alternatives are and who gets access. The key floats and bobs, light
 * sweeps the glass in front of it, teal glints turn and motes rise outside the case.
 */
import { aiKeepsake, aiKey } from './ai-kit';

export const ai1Finish = aiKeepsake(
  'ai1-finish',
  'A golden key floating in a glass display case on a marble plinth, with small sparkles around it.',
  aiKey,
);
