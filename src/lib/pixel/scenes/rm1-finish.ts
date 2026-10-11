/**
 * Risk Management lesson 1 keepsake: a red and white life ring hung on a rope from a brass hook,
 * with lesson 1's emblem at its heart, a compass star whose four points are the four risks (market
 * red, credit orchid, operational gold, liquidity blue). Drawn for the lesson-complete screen (3pt/px).
 *
 * THE SHAPE IS THE PATHWAY'S, THE EMBLEM IS THE LESSON'S. rmKeepsake (rm-kit.ts) builds the ring,
 * rope, sparkles and spray; only the emblem changes from lesson to lesson, so lessons 2 to 25 each
 * add one emblem to the kit and one line like this.
 */
import { rmEmblemCompass, rmKeepsake } from './rm-kit';
import type { SceneArt } from './types';

export const rm1Finish: SceneArt = rmKeepsake(
  'rm1-finish',
  'A red and white life ring hanging from a rope, with a four-pointed compass star at its center, one point for each type of risk.',
  rmEmblemCompass,
);
