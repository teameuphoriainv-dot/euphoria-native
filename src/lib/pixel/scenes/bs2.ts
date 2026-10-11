/**
 * Business Strategy lesson 2 opener: a business model weighed on the war table.
 *
 * The war room seen the other way round from lesson 1: the strategist works from the left, raking
 * coins across the felt toward a gold balance where a customer's lifetime value (a heap of coins)
 * outweighs what it cost to win them (one coin). On the wall, the revenue chart stacks up the way
 * subscriptions do: every month keeps last month's band and adds a new one on top. The parchment
 * is the brightest broad surface; the gold balance sits on the dark wall and green felt so it reads.
 * Moving: the newest band arrives, the heavy pan dips, the strategist rakes and blinks, the torch
 * flickers, embers rise, a coin glints and two stars twinkle in the window.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsEmber, bsMoved, bsScroll, bsStar, bsStrategist, bsTorch, bsWarRoom, bsWarTable } from './bs-kit';
import { bsCoinStacks, bsMirrored } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const revenueRows = [
  'O......................',
  'O......................',
  'O......................',
  'O......................',
  'O.............TTT.TTT..',
  'O.............ttt.ttt..',
  'O.............ttt.ttt..',
  'O.........BBB.BBB.BBB..',
  'O.........bbb.bbb.bbb..',
  'O.........bbb.bbb.bbb..',
  'O.....NNN.NNN.NNN.NNN..',
  'O.....nnn.nnn.nnn.nnn..',
  'O.....nnn.nnn.nnn.nnn..',
  'O.PPP.PPP.PPP.PPP.PPP..',
  'O.ppp.ppp.ppp.ppp.ppp..',
  'O.ppp.ppp.ppp.ppp.ppp..',
  'OOOOOOOOOOOOOOOOOOOOOOO',
];

const revenueB = bsMoved(revenueRows, {
  1: 'O.................FFF..',
  2: 'O.................fff..',
  3: 'O.................fff..',
});

const revenue: PixelSprite = {
  id: 'bs2-revenue',
  name: 'revenue',
  tags: [],
  blurb: 'Recurring revenue as a layer cake, for the scroll: each month keeps every earlier band and adds one. The newest band arrives, then holds.',
  rows: revenueRows,
  frames: [
    revenueRows,
    revenueB,
    revenueB,
    revenueB,
  ],
  frameMs: 650,
};

const balanceRows = [
  '.............y.............',
  '............yGg.....GGGGG..',
  '............OGO.GGGGOOOOO..',
  '...........GGGGGOOOO..X....',
  '.......GGGGOOOOO.....X.X...',
  '..GGGGGOOOOOGgO.....X...X..',
  '..OOOOO....OGgO.....X...X..',
  '....X......OGgO....X.....X.',
  '...X.X.....OGgO...X..yGg..X',
  '..X.y.X....OGgO...OOOOOOOOO',
  '..XyGgX....OGgO....OgGGGgO.',
  '.XyGyGgX...OGgO.....OOOOO..',
  'XyGgyGygX..OGgO............',
  'OOOOOOOOO..OGgO............',
  '.OgGGGgO...OGgO............',
  '..OOOOO...OGGGGgO..........',
  '.........OGGGGGGgO.........',
  '........OOOOOOOOOOO........',
];

const balance: PixelSprite = {
  id: 'bs2-balance',
  name: 'balance',
  tags: [],
  blurb: 'A gold balance standing on the felt: the heap of coins on the left pan outweighs the single coin on the right. The heavy pan dips as if another coin landed.',
  rows: balanceRows,
  frames: [
    balanceRows,
    [
      '.............y.......GGGO..',
      '............yGg...GGGOOO...',
      '............OGOGGGOOO.X....',
      '............GGGOOO...X.X...',
      '.........GGGOOO.....X...X..',
      '......GGGOOOGgO.....X...X..',
      '...GGGOOO..OGgO....X.....X.',
      '..GOOO.....OGgO...X..yGg..X',
      '..O.X......OGgO...OOOOOOOOO',
      '...X.X.....OGgO....OgGGGgO.',
      '..X.y.X....OGgO.....OOOOO..',
      '..XyGgX....OGgO............',
      '.XyGyGgX...OGgO............',
      'XyGgyGygX..OGgO............',
      'OOOOOOOOO..OGgO............',
      '.OgGGGgO..OGGGGgO..........',
      '..OOOOO..OGGGGGGgO.........',
      '........OOOOOOOOOOO........',
    ],
    balanceRows,
    balanceRows,
  ],
  frameMs: 650,
};

const strategistLeft = bsMirrored(bsStrategist, 'bs2-strategist-left');

export const bs2Opener: SceneArt = {
  id: 'bs2-opener',
  label: 'A strategist rakes coins across a war table toward a gold balance, where a heap of coins outweighs a single coin, under a chart of revenue stacking up month after month.',
  width: 80,
  height: 60,
  base: bsWarRoom,
  layers: [
    { sprite: bsScroll, x: 37, y: 1 },
    { sprite: revenue, x: 41, y: 6 },
    { sprite: bsTorch, x: 29, y: 7 },
    { sprite: bsEmber, x: 30, y: 5, motion: { kind: 'rise', amp: 4, periodMs: 1500 } },
    { sprite: bsEmber, x: 31, y: 6, motion: { kind: 'rise', amp: 5, periodMs: 2100, phase: 0.5 } },
    { sprite: bsStar, x: 74, y: 7, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: bsStar, x: 76, y: 11, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.6, min: 0.2 } },
    { sprite: bsWarTable, x: 9, y: 37 },
    { sprite: bsCoinStacks, x: 25, y: 40 },
    { sprite: balance, x: 38, y: 27 },
    { sprite: bsStar, x: 43, y: 37, motion: { kind: 'twinkle', periodMs: 1300, phase: 0.3, min: 0.15 } },
    { sprite: strategistLeft, x: 6, y: 17 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs2-emblem-balance',
  name: 'emblem-balance',
  tags: [],
  blurb: 'Lesson 2 emblem, 16x16: a gold balance tipped by a heap of coins against one.',
  rows: [
    '................',
    '.......yy....GG.',
    '.......GG.GGGOO.',
    '......GGGGOOO...',
    '...GGGOOOO..X...',
    '.GGOOO.Gg.XX.XX.',
    '.OOX...GgX..yG.X',
    '..X.X..GgOOOOOOO',
    '.X.y.X.Gg.gGGGg.',
    '.XyGgX.Gg.......',
    'XyGyGgXGg.......',
    'OOOOOOOGg.......',
    '.gGGGg.Gg.......',
    '.....OGGgO......',
    '....OOOOOOO.....',
    '................',
  ],
};

export const bs2Finish: SceneArt = bsKeepsake(
  'bs2-finish',
  'A purple house banner on a gold rod, its roundel showing a gold balance tipped down by a heap of coins.',
  emblem,
);

export const art: LessonArtSet = { opener: bs2Opener, backdrop: bsBackdrop, finish: bs2Finish };
