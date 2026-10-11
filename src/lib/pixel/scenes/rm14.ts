/**
 * Risk Management lesson 14 opener, Interest Rate Risk Management: an interest rate swap as a trade
 * in the watch room. The keeper holds out an iron anchor, fixed, and the mate from across the harbour
 * holds out a red and white float that rides whatever the water does, floating: pay fixed, receive
 * floating. The chart on the wall is why, rates from 2021 to 2023, the short end climbing from almost
 * nothing. Moving: the float bobbing on the mate's palm, the lantern, the ship and the swell under a
 * calm moon, the stars.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLantern, rmShip, rmWatchRoom } from './rm-kit';
import { rmCalmWindow, rmFlip, rmKeeperReach, rmStar, rmSwellCalm } from './rm-kit-a';
import { rmMateReach } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The fixed side: an iron anchor hung by its ring from the keeper's hand. 9x11. */
const anchor: PixelSprite = {
  id: 'rm14-opener-anchor',
  name: 'anchor',
  tags: ['scene', 'rm14'],
  rows: [
    '...xXx...',
    '...X.X...',
    '...xXx...',
    '.DxxXxxD.',
    '....X....',
    '....X....',
    '....X....',
    'x...X...x',
    'Xx..X..xX',
    '.XxxXxxX.',
    '..DXXXD..',
  ],
};

/** The floating side: a red and white float with its little mast, sat on the mate's palm; give it a `bob`. 5x7. */
const float: PixelSprite = {
  id: 'rm14-opener-float',
  name: 'float',
  tags: ['scene', 'rm14'],
  rows: [
    '..D..',
    '..D..',
    '.RRR.',
    'RsRRr',
    'wwwwx',
    'wwwwx',
    '.xxx.',
  ],
};

/** The rates chart: one-year and ten-year yields, 2021 in blue against 2023 in red. 15x14. */
const ratesChart: PixelSprite = {
  id: 'rm14-opener-rates-chart',
  name: 'rates chart',
  tags: ['scene', 'rm14'],
  rows: [
    '.......RR......',
    '.wwwwwwrrwwwwx.',
    '.wwwwwwwwwwwwx.',
    '.wwwRRwwwwwwwx.',
    '.wwwRRwwwwwwwx.',
    '.wwwRRwwwwRRwx.',
    '.wwwRRwwwwRRwx.',
    '.wwwRRwwwwRRwx.',
    '.wwwRRwwwwRRwx.',
    '.wwwRRwwBBRRwx.',
    '.wwwRRwwBBRRwx.',
    '.wBBRRwwBBRRwx.',
    '.KKKKKKKKKKKKx.',
    '.xxxxxxxxxxxxx.',
  ],
};

/** The lantern's wall bracket. 5x3. */
const bracket: PixelSprite = {
  id: 'rm14-opener-bracket',
  name: 'bracket',
  tags: ['scene', 'rm14'],
  rows: [
    'DDDDD',
    'D..D.',
    '...D.',
  ],
};

/** Floor shadows under the keeper and the mate. */
const floorShadow: PixelSprite = {
  id: 'rm14-opener-floor-shadow',
  name: 'rm14-opener-floor-shadow',
  tags: ['scene', 'rm14'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZ................ZZZZZZZZZZZZZZZZ',
    '....ZZZZZZZZZZZZ....................ZZZZZZZZZZZZ..',
  ],
};

const base = rmCompose('rm14-opener-base', rmWatchRoom(80, 60, 50), [
  [rmCalmWindow, 18, 4],
  [ratesChart, 64, 7],
  [bracket, 3, 13],
  [floorShadow, 13, 52],
]);

export const rm14Opener: SceneArt = {
  id: 'rm14-opener',
  label: 'In the watch room, the lighthouse keeper holds out an iron anchor to a bearded mate in an orchid oilskin, who holds out a bobbing red and white float in trade, under a chart of interest rates rising.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 26, y: 8, motion: { kind: 'twinkle', periodMs: 3600, min: 0.2 } },
    { sprite: rmStar, x: 41, y: 11, motion: { kind: 'twinkle', periodMs: 4300, min: 0.2, phase: 0.5 } },
    { sprite: rmShip, x: 28, y: 14, motion: { kind: 'bob', amp: 1, periodMs: 3200 } },
    { sprite: rmSwellCalm, x: 22, y: 26, motion: { kind: 'drift', amp: 2, periodMs: 5400 } },
    { sprite: rmLantern, x: 3, y: 16 },
    { sprite: rmFlip(rmKeeperReach, 'rm14-opener-keeper'), x: 14, y: 24 },
    { sprite: anchor, x: 26, y: 37 },
    { sprite: rmMateReach, x: 48, y: 24 },
    { sprite: float, x: 47, y: 31, motion: { kind: 'bob', amp: 1, periodMs: 1800 } },
  ],
};

/** Lesson 14's emblem: a swap, a straight gold arrow one way and a wavy blue one back. 16x12. */
const emblemSwap: PixelSprite = {
  id: 'rm14-emblem-swap',
  name: 'fixed for floating',
  tags: ['rm', 'emblem', 'lesson 14'],
  rows: [
    '............O...',
    '............GO..',
    '.yyyyyyyyyyyGGO.',
    '.GGGGGGGGGGGGGO.',
    '............GO..',
    '............O...',
    '...B............',
    '..BB.BB....BB...',
    '.BBBBbbB..BbbB..',
    '.BBBb..bBBb..bBB',
    '..BB....bb....bb',
    '...B............',
  ],
};

export const rm14Finish: SceneArt = rmKeepsake(
  'rm14-finish',
  'A red and white life ring hanging from a rope, with two arrows at its center, a straight gold one pointing one way and a wavy blue one pointing back.',
  emblemSwap,
);

export const art: LessonArtSet = { opener: rm14Opener, backdrop: rmBackdrop, finish: rm14Finish };
