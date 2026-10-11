/**
 * Investing Fundamentals lesson 1 keepsake: the pathway's golden acorn, with a sprout coming up out
 * of a coin in its window. Drawn 2026-10-10 for the lesson-complete screen (3pt/px).
 *
 * THE SHAPE IS THE PATHWAY'S, THE EMBLEM IS THE LESSON'S. Every Investing Fundamentals keepsake is
 * the same acorn locket on the same oak sprig (great oaks, small acorns: the course in one object);
 * only the emblem in the enamel window changes. ifKeepsake (if-kit.ts) builds the scene: the sprig is
 * the still base, the acorn and the emblem are two layers on one bob so the emblem stays seated, and
 * sparkles and motes move around them. A later lesson draws a 10x8 emblem and calls it the same way.
 */
import { ifEmblemSprout, ifKeepsake } from './if-kit';
import type { SceneArt } from './types';

export const if1Finish: SceneArt = ifKeepsake(
  'if1-finish',
  'A golden acorn hanging from an oak twig, with a sprout growing out of a coin in its purple window and small sparkles around it.',
  ifEmblemSprout,
);
