/**
 * Investing Fundamentals lesson 1 opener: the first night in the orchard, where cash stops sitting
 * in a drawer and gets planted.
 *
 * Built from the kit (if-kit.ts): the investor waters a new sprout at the head of a tilled row, and
 * down the row each tree is taller than the last (5, 13, 21 and 34 pixels) and carries more coins
 * (none, none, two, six), which is the lesson's point about time doing most of the work, read left
 * to right. The moon and the lantern light everything from the left. Only small layers move: water
 * falls, coins glint, the flame flickers, stars twinkle and fireflies drift up.
 */
import {
  IF_INVESTOR_HAND,
  ifBed,
  ifCompose,
  ifFirefly,
  ifFlame,
  ifGlint,
  ifInvestor,
  ifLanternPost,
  ifLater,
  ifMoneyTree,
  ifSapling,
  ifSprout,
  ifStage,
  ifStar,
  ifStarBig,
  ifWater,
  ifWateringCan,
  ifYoungTree,
} from './if-kit';
import type { SceneArt } from './types';

/** The investor stands at the head of the row; the can hangs from the hand, its rose over the sprout. */
const INVESTOR = { x: 9, y: 25 } as const;
const CAN = { x: INVESTOR.x + IF_INVESTOR_HAND.x - 1, y: INVESTOR.y + IF_INVESTOR_HAND.y } as const;

const base = ifCompose('if1-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifBed, x: 24, y: 47 },
  { sprite: ifLanternPost, x: 2, y: 24 },
  { sprite: ifMoneyTree, x: 56, y: 14 },
  { sprite: ifYoungTree, x: 45, y: 27 },
  { sprite: ifSapling, x: 37, y: 35 },
  { sprite: ifSprout, x: 30, y: 43 },
  // The can before the investor, so the hand closes over the handle instead of under it.
  { sprite: ifWateringCan, x: CAN.x, y: CAN.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

const glintLater = ifLater(ifGlint, 'if1-opener-glint-later', 2, 290);
const glintLatest = ifLater(ifGlint, 'if1-opener-glint-latest', 4, 330);

export const if1Opener: SceneArt = {
  id: 'if1-opener',
  label: 'At night in an orchard, an investor waters a new sprout at the start of a row of trees that grow taller from left to right, the tallest one hung with gold coins, under a full moon.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ifWater, x: CAN.x + 11, y: CAN.y + 3 },
    { sprite: ifFlame, x: 3, y: 27 },
    { sprite: ifGlint, x: 70, y: 17 },
    { sprite: glintLater, x: 65, y: 27 },
    { sprite: glintLatest, x: 59, y: 30 },
    { sprite: glintLater, x: 53, y: 30 },
    { sprite: ifStarBig, x: 30, y: 5, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 41, y: 2, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 47, y: 12, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 23, y: 16, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.2, min: 0.25 } },
    { sprite: ifStar, x: 66, y: 5, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.55, min: 0.2 } },
    { sprite: ifFirefly, x: 7, y: 44, motion: { kind: 'rise', amp: 5, periodMs: 3400, phase: 0.1 } },
    { sprite: ifFirefly, x: 42, y: 31, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.5 } },
    { sprite: ifFirefly, x: 27, y: 52, motion: { kind: 'rise', amp: 5, periodMs: 3700, phase: 0.8 } },
    { sprite: ifFirefly, x: 54, y: 42, motion: { kind: 'rise', amp: 4, periodMs: 3000, phase: 0.3 } },
  ],
};
