/**
 * Wealth Management lesson 8 (advanced tax optimisation): its opener, the pathway backdrop and its
 * keepsake, as one set loaded on demand.
 *
 * The opener is the house's library: the kit's bookcases at either end under a brass chandelier,
 * and between them a bare dark wall, so nothing on the table or the board is lost against the
 * shelves' gold knobs. On an easel stands the lesson's hook in chalk: effective tax rates as three
 * bars over three chalk figures, Buffett's short and gold, an average worker's in chalk, his
 * secretary's tall and red, at the lesson's 17%, 22% and 35%. Those bars are data, so they hold
 * still. The advisor points past them to a pedestal table where the lesson's main tool is at work:
 * a gold stack of gains wears a red tax tag, and beside it a stack of losing coins, marked with a
 * red down arrow, is sold off a coin at a time until the losses have cancelled the gain and the tag
 * is gone (tax-loss harvesting). The chandelier's candles flicker. The keepsake carries a per cent
 * sign with an arrow falling beside it: the effective rate brought down.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, WM_INKS } from './wm-kit';
import { wmAdvisorPointing, wmBookcase, wmCandleFlame } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The chalkboard's top-left in the scene; the chalk is placed from it. */
const BOARD_X = 17;
const BOARD_Y = 13;
const BOARD_W = 24;
const BOARD_H = 20;
const CHANDELIER_X = 33;

/** The harvest's box on the pedestal table: its bottom row sits on the table top. */
const TABLE_X = 50;
const TABLE_Y = 49;
const HARVEST_W = 14;
const HARVEST_H = 14;

/** Floorboards under a shadow line. 80x14. */
const floor = Array.from({ length: 14 }, (_, j) => {
  if (j === 0) return 'K'.repeat(80);
  return j % 4 === 1 ? 'U'.repeat(80) : 'O'.repeat(80);
});

/** A green chalkboard in a wooden frame lit along its top and left. 24x20. */
const board: PixelSprite = {
  id: 'wm8-opener-board',
  name: 'wm8-opener-board',
  tags: ['scene', 'wm8'],
  palette: WM_INKS,
  rows: Array.from({ length: BOARD_H }, (_, j) =>
    Array.from({ length: BOARD_W }, (_, i) => {
      if (j === 0 || i === 0) return 'C';
      if (j === BOARD_H - 1 || i === BOARD_W - 1) return 'O';
      if (j === 1 || i === 1 || j === BOARD_H - 2 || i === BOARD_W - 2) return 'U';
      return 'h';
    }).join(''),
  ),
};

/**
 * The lesson's hook in chalk, 20x16 inside the frame: a per cent sign for a heading, and three
 * effective-rate bars on one baseline, each over a chalk figure: Buffett's 17% short and gold, the
 * average worker's 22% in chalk, the secretary's 35% tall and red (6, 8 and 12 rows).
 */
const chalk: PixelSprite = {
  id: 'wm8-opener-chalk',
  name: 'wm8-opener-chalk',
  tags: ['scene', 'wm8'],
  rows: [
    'xx..x...............',
    'xx.x............sRr.',
    '..x.............RRr.',
    '.x.xx...........RRr.',
    'x..xx...........RRr.',
    '............xxX.RRr.',
    '............xwX.RRr.',
    '........yyg.xwX.RRr.',
    '........yGg.xwX.RRr.',
    '........yGg.xwX.RRr.',
    '........yGg.xwX.RRr.',
    '........yGg.xwX.RRr.',
    '........yGg.xwX.RRr.',
    '......xxxxxxxxxxxxxx',
    '.........w...w...w..',
    '........www.www.www.',
  ],
};

/** One of the easel's two posts, running behind the board to the floor. 2x34. */
const easelPost: PixelSprite = {
  id: 'wm8-opener-easel-post',
  name: 'wm8-opener-easel-post',
  tags: ['scene', 'wm8'],
  palette: WM_INKS,
  rows: Array.from({ length: 34 }, () => 'UO'),
};

/** The chalk ledge under the board, a stick of chalk on it. 24x2. */
const ledge: PixelSprite = {
  id: 'wm8-opener-ledge',
  name: 'wm8-opener-ledge',
  tags: ['scene', 'wm8'],
  palette: WM_INKS,
  rows: ['CCCCCCCCCCCCCCCwwCCCCCCU', `${'O'.repeat(23)}K`],
};

/** A pedestal table for the harvest, its top level with the advisor's hand. 14x11. */
const pedestalTable: PixelSprite = {
  id: 'wm8-opener-pedestal-table',
  name: 'wm8-opener-pedestal-table',
  tags: ['scene', 'wm8'],
  palette: WM_INKS,
  rows: [
    'CCCCCCCCCCCCCU',
    'UUUUUUUUUUUUUO',
    '.KKKKKKKKKKKK.',
    '......UOK.....',
    '......UOK.....',
    '......UOK.....',
    '......UOK.....',
    '......UOK.....',
    '.....UUOKK....',
    '...UUOOOOKKK..',
    '..UO.......OK.',
  ],
};

/** A brass chandelier on a chain from the ceiling, four candles on its ring. 15x11. */
const chandelier: PixelSprite = {
  id: 'wm8-opener-chandelier',
  name: 'wm8-opener-chandelier',
  tags: ['scene', 'wm8'],
  rows: [
    '.......O.......',
    '.......O.......',
    '.......O.......',
    '.......O.......',
    '.k...k.O.k...k.',
    '.w...w.O.w...w.',
    '.x...x.g.x...x.',
    'yGg.yGgGyGg.yGg',
    '.gGGGGGGGGGGGg.',
    '......gGg......',
    '.......O.......',
  ],
};

const base = wmCompose('wm8-opener-base', [...wmBands(80, [['K', 2], ['D', 1], ['k', 43]]), ...floor], [
  { sprite: wmBookcase, x: 0, y: 7 },
  { sprite: wmBookcase, x: 64, y: 7 },
  { sprite: chandelier, x: CHANDELIER_X, y: 0 },
  { sprite: easelPost, x: BOARD_X + 3, y: BOARD_Y - 1 },
  { sprite: easelPost, x: BOARD_X + BOARD_W - 5, y: BOARD_Y - 1 },
  { sprite: board, x: BOARD_X, y: BOARD_Y },
  { sprite: chalk, x: BOARD_X + 2, y: BOARD_Y + 2 },
  { sprite: ledge, x: BOARD_X, y: BOARD_Y + BOARD_H },
  { sprite: wmAdvisorPointing, x: 39, y: 43 },
  { sprite: pedestalTable, x: TABLE_X, y: TABLE_Y },
]);

/* ── the harvest: a taxed gain, and losses sold to cancel it ──────────────────────────────────── */

/** A stack of `n` coins in the kit's look (wm2.ts): a top face, then a face and an edge a coin. 7 wide, 2n + 1 tall. */
function stack(n: number, top: string, face: string, edge: string): string[] {
  if (n === 0) return [];
  const lower = Array.from({ length: n - 1 }, () => [edge, face]).flat();
  return [top, face, ...lower, 'OOOOOOO'];
}
/** The gains in gold; the losses in dull pewter, worth less than they cost. */
const GAIN = (n: number) => stack(n, '.yyGGg.', 'yGGGGGg', 'OgggggO');
const LOSS_TOP = ['.xxXX..', 'xXXXXXD'];
const LOSS = (n: number) => stack(n, LOSS_TOP[0], LOSS_TOP[1], 'kDDDDDk');

/** The red tax tag on the gain stack's face, a white eyelet at its corner: bright, dimmed, or gone. 4x3. */
const TAG: Record<'bright' | 'dim' | 'gone', string[]> = {
  bright: ['wRRr', 'RRRr', 'rrrI'],
  dim: ['xrrI', 'rrrI', 'IIIE'],
  gone: ['....', '....', '....'],
};

/** The red arrow pointing down over the losing stack. 6x5. */
const DOWN = ['..Rr..', '..Rr..', 'RRRRRr', '.RRRr.', '..Rr..'];

/**
 * One moment of the harvest in its 14x14 box: the gain stack (five coins) wearing its tag on the
 * left, the losing stack with `loss` coins under its red arrow on the right, its top coin lifted
 * off when `selling`, and a glint on the gain once the last loss is gone.
 */
function harvestAt(loss: number, tag: keyof typeof TAG, selling = false): string[] {
  const grid = Array.from({ length: HARVEST_H }, () => Array.from({ length: HARVEST_W }, () => '.'));
  const put = (rows: string[], x: number, top: number) =>
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch !== '.') grid[top + j][x + i] = ch;
    }));
  const onTable = (rows: string[], x: number) => put(rows, x, HARVEST_H - rows.length);
  onTable(GAIN(5), 0);
  put(TAG[tag], 2, 6);
  const resting = selling ? loss - 1 : loss;
  onTable(LOSS(resting), 7);
  if (selling) put(LOSS_TOP, 7, HARVEST_H - (2 * resting + 1) - 4);
  if (loss > 0) put(DOWN, 7, 0);
  if (loss === 0) put(['W'], 2, 3);
  return grid.map((row) => row.join(''));
}

/**
 * Sold a coin at a time: the losing stack lifts its top coin and loses it, three times, and the tax
 * tag on the gain dims with each sale until it is gone; a held beat, then the loop starts again.
 * The still is the first sale under way: the tag still on, a losing coin lifting off.
 */
const harvest: PixelSprite = {
  id: 'wm8-opener-harvest',
  name: 'wm8-opener-harvest',
  tags: ['scene', 'wm8'],
  blurb: 'Losing coins sold one at a time until the red tax tag on a stack of gains is gone.',
  rows: harvestAt(3, 'bright', true),
  frames: [
    harvestAt(3, 'bright'),
    harvestAt(3, 'bright'),
    harvestAt(3, 'bright', true),
    harvestAt(2, 'dim'),
    harvestAt(2, 'dim', true),
    harvestAt(1, 'dim'),
    harvestAt(1, 'dim', true),
    harvestAt(0, 'gone'),
    harvestAt(0, 'gone'),
    harvestAt(0, 'gone'),
  ],
  frameMs: 600,
};

export const wm8Opener: SceneArt = {
  id: 'wm8-opener',
  label: 'In a library a chalkboard compares effective tax rates, a short gold bar for Buffett beside a tall red bar for his secretary, as the advisor points to a gold stack of gains wearing a red tax tag and a losing stack he sells off to cancel it.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: harvest, x: TABLE_X, y: TABLE_Y - HARVEST_H },
    { sprite: wmCandleFlame, x: CHANDELIER_X + 1, y: 1 },
    { sprite: wmLater(wmCandleFlame, 'wm8-opener-flame-2', 1, 300), x: CHANDELIER_X + 5, y: 1 },
    { sprite: wmLater(wmCandleFlame, 'wm8-opener-flame-3', 2, 260), x: CHANDELIER_X + 9, y: 1 },
    { sprite: wmLater(wmCandleFlame, 'wm8-opener-flame-4', 3, 320), x: CHANDELIER_X + 13, y: 1 },
  ],
};

/** A per cent sign with an arrow falling beside it: the effective rate brought down. */
const emblemRateDown: PixelSprite = {
  id: 'wm8-emblem-rate-down',
  name: 'wm8-emblem-rate-down',
  tags: ['scene', 'wm8'],
  rows: [
    '.yG...yG..yG..',
    'yWGg..yG..yG..',
    'GGgg.yG...yG..',
    '.gg..yG...yG..',
    '....yG....yG..',
    '....yG....yG..',
    '...yG.....yG..',
    '...yG.....yG..',
    '..yG......yG..',
    '..yG.yG.yGGGGg',
    '.yG.yWGg.yGGg.',
    '.yG.GGgg..Gg..',
    'yG...gg.......',
  ],
};

export const wm8Finish: SceneArt = wmKeepsake(
  'wm8-finish',
  emblemRateDown,
  'A green crest with a gold rim bearing a per cent sign with an arrow falling beside it, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm8Opener, backdrop: wmBackdrop, finish: wm8Finish };
