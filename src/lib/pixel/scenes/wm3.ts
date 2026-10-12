/**
 * Wealth Management lesson 3 (retirement planning and withdrawal strategies): its opener, the
 * pathway backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is the house's moonlit terrace: a marble balustrade over the night garden, and on it
 * the grandmother, retired, in a red wing chair. Beside her a tree in a marble urn grows gold
 * coins, the portfolio; under it her basket takes the year's income, and an hourglass runs on a
 * side table. The lesson's 4% rule is the picture: take a little fruit each year and the tree
 * keeps bearing. What moves: one coin drops from the tree into her basket and the next one hangs
 * ready, two new coins ripen in the leaves, the sand runs, fireflies rise over the garden, stars
 * twinkle. The keepsake carries the same picture in small, so it stands for this lesson and no
 * other: a leafy bough hung with coins drops one into the wicker basket below, and the next one
 * ripens in its place.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import {
  wmBands,
  wmCompose,
  wmFirefly,
  wmHourglass,
  wmStar,
  wmStarDot,
  WM_INKS,
} from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The coin tree's crown, its top-left in the scene. The drop and the ripening coins are placed from it. */
const CROWN_X = 6;
const CROWN_Y = 7;

/** Fixed faint stars. */
const skyDots: PixelSprite = {
  id: 'wm3-opener-sky-dots',
  name: 'wm3-opener-sky-dots',
  tags: ['scene', 'wm3'],
  rows: [
    '................................................................................',
    '.....D..........................................X...............................',
    '...........................................................................X....',
    '..................................D.............................................',
    '........................................................X.......................',
    '................................................................................',
    '.......................................D........................................',
    '................................................................................',
    '.............................................................D..................',
    '..........................................X................................D....',
    '................................................................................',
    '.....................................................X..........................',
    '................................................................................',
    '.......................................................................X........',
    '................................................................................',
    '.............................................D..................................',
  ],
};

/** A waxing crescent. 9x8. */
const moon: PixelSprite = {
  id: 'wm3-opener-moon',
  name: 'wm3-opener-moon',
  tags: ['scene', 'wm3'],
  rows: [
    '...xwwx..',
    '..xwwx...',
    '.xwwx....',
    '.xww.....',
    '.xww.....',
    '.xwwx....',
    '..xwwx...',
    '...xwwx..',
  ],
};

/** The night garden beyond the terrace: a hedge, and tree crowns rising over the balustrade. */
const garden = wmTreeline('wm3-opener-garden', 80, 18, [
  [40, 60, 9],
  [5, 6, 13],
  [16, 5, 10],
  [30, 7, 15],
  [44, 5, 11],
  [57, 8, 16],
  [69, 5, 12],
  [77, 6, 14],
]);

/** The marble balustrade: a moonlit rail over turned balusters, the garden showing between them. 80x10. */
const BALUSTER = ['.xD..', '.xD..', 'xxDD.', '.xD..', '.xD..'];
const balustrade: PixelSprite = {
  id: 'wm3-opener-balustrade',
  name: 'wm3-opener-balustrade',
  tags: ['scene', 'wm3'],
  rows: [
    'x'.repeat(80),
    'X'.repeat(80),
    'D'.repeat(80),
    ...BALUSTER.map((unit) => Array.from({ length: 80 }, (_, x) => unit[x % unit.length]).join('')),
    'X'.repeat(80),
    'D'.repeat(80),
  ],
};

/** The terrace floor: slate flags in three courses, staggered joints. 80x14. */
const flags = Array.from({ length: 14 }, (_, j) => {
  if (j === 0) return 'K'.repeat(80);
  if (j === 4 || j === 9) return 'k'.repeat(80);
  const shift = j < 4 ? 0 : j < 9 ? 8 : 4;
  return Array.from({ length: 80 }, (_, x) => ((x + shift) % 16 === 0 ? 'k' : 'D')).join('');
});

/** The coin tree's crown: clumped leaves lit from the upper left, gold coins hanging in them. 30x22. */
const crown: PixelSprite = {
  id: 'wm3-opener-crown',
  name: 'wm3-opener-crown',
  tags: ['scene', 'wm3'],
  palette: WM_INKS,
  rows: [
    '..........hhhhhhh.............',
    '.......hhhnnnHHHHhhh..........',
    '.....hhnnnnnHHHHHHHHhh........',
    '....hnnnnnHHHyGHHHHHHHh.......',
    '...hnnnnHHHHHGgHHHHHHHHh......',
    '..hnnnnHHHHHHHHHHHnnnHHHh.....',
    '..hnnHHHyGHHHHHHHnnnnnHHHh....',
    '.hnnHHHHGgHHHHHHHHnnnHHyGHh...',
    '.hnHHHHHHHHHHnnnHHHHHHHGgHHh..',
    'hHHHHHHHHHHHnnnnnHHHHHHHHHHHh.',
    'hHHHyGHHHHHHHnnnHHHHHHHHHHHHh.',
    'hHHHGgHHHHHHHHHHHHHHyGHHHHHhh.',
    'hHHHHHHHHHHHHHHHHHHHGgHHHHHhh.',
    'hhHHHHHHHHyGHHHHHHHHHHHHHHhhh.',
    '.hHHHHHHHHGgHHHHHHHHHHyGHhhhh.',
    '.hhHHHHyGHHHHHHHHHHHHHGgHhhhh.',
    '..hhHHHGgHHHHHHyGHHHHHhhhhhh..',
    '...hhHHHHHHHHHHGgHHHHhhhhhhh..',
    '....hhhHHHHHHHHHHHHhhhhhhhhh..',
    '......hhhhHHHHHHHHhhhhhhhh....',
    '.........hhhhhXDDkhhhhhh......',
    '............hhXDDkhhh.........',
  ],
};

const trunk: PixelSprite = {
  id: 'wm3-opener-trunk',
  name: 'wm3-opener-trunk',
  tags: ['scene', 'wm3'],
  rows: Array.from({ length: 17 }, () => 'XDDk'),
};

/** A marble urn for the coin tree. 13x9. */
const urn: PixelSprite = {
  id: 'wm3-opener-urn',
  name: 'wm3-opener-urn',
  tags: ['scene', 'wm3'],
  rows: [
    'xwwwwwwwwwwwX',
    '.DXXXXXXXXXD.',
    '..xwwxxxxXX..',
    '..xwxxxxxXX..',
    '...xxxxxXX...',
    '....DxxXD....',
    '.....xXD.....',
    '....xwxXX....',
    '...DDDDDDD...',
  ],
};

/** A wicker basket with this year's coins heaped in it. 7x5. */
const basket: PixelSprite = {
  id: 'wm3-opener-basket',
  name: 'wm3-opener-basket',
  tags: ['scene', 'wm3'],
  palette: WM_INKS,
  rows: [
    '.yGgyG.',
    'UCCCCCU',
    'OUCUCUO',
    '.OUCUO.',
    '..OOO..',
  ],
};

/** The grandmother in a red wing chair, her hands in her lap. 13x15. */
const elderInChair: PixelSprite = {
  id: 'wm3-opener-elder-in-chair',
  name: 'wm3-opener-elder-in-chair',
  tags: ['scene', 'wm3'],
  palette: WM_INKS,
  rows: [
    '...IrrrrrI...',
    '..IrRxwxrrrI.',
    '.IrRxwwwxrrrI',
    'IrRrxCCCxrrrI',
    'IrRrxkCkxrrrI',
    'IrRrrCCUrrrrI',
    'IrRrpPPPprrrI',
    'IrRpPqPPpprrI',
    'RRRpPPPPpprRR',
    'RrrPPPPPPprrI',
    'IrrCPPPPPUrrI',
    'IIIIIIIIIIIII',
    'I.I.k...k.I.I',
    'O..KK...KK..O',
    'O...........O',
  ],
};

/** A marble-topped side table on a gilt stem, for the hourglass. 9x7. */
const sideTable: PixelSprite = {
  id: 'wm3-opener-side-table',
  name: 'wm3-opener-side-table',
  tags: ['scene', 'wm3'],
  rows: [
    'xwwwwwwwX',
    'DXXXXXXXD',
    '...gGg...',
    '....G....',
    '....G....',
    '...yGg...',
    '..OOOOO..',
  ],
};

const base = wmCompose('wm3-opener-base', [...wmBands(80, [['K', 46]]), ...flags], [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: moon, x: 66, y: 4 },
  { sprite: garden, x: 0, y: 28 },
  { sprite: balustrade, x: 0, y: 36 },
  { sprite: crown, x: CROWN_X, y: CROWN_Y },
  { sprite: trunk, x: 20, y: 29 },
  { sprite: urn, x: 15, y: 46 },
  { sprite: basket, x: 28, y: 50 },
  { sprite: elderInChair, x: 37, y: 40 },
  { sprite: sideTable, x: 54, y: 48 },
]);

/** Rows down from the crown's foot at which the falling coin is drawn: it gathers speed. */
const DROP = [0, 1, 3, 6, 10, 15, 21];
const DROP_H = 23;
function coinAt(dy: number | null): string[] {
  return Array.from({ length: DROP_H }, (_, j) => {
    if (j === dy) return 'yG';
    if (dy !== null && j === dy + 1) return 'Gg';
    return '..';
  });
}

/** This year's withdrawal: a coin falls from the tree into the basket, then the next one hangs ready. 2x23. */
const fallingCoin: PixelSprite = {
  id: 'wm3-opener-falling-coin',
  name: 'wm3-opener-falling-coin',
  tags: ['scene', 'wm3'],
  blurb: 'A coin dropping from the coin tree into the grandmother\'s basket.',
  rows: coinAt(0),
  frames: [...DROP.map(coinAt), coinAt(null), coinAt(null), coinAt(0), coinAt(0)],
  frameMs: 170,
};

/** A new coin ripening in the leaves. */
const ripeCoin: PixelSprite = {
  id: 'wm3-opener-ripe-coin',
  name: 'wm3-opener-ripe-coin',
  tags: ['scene', 'wm3'],
  rows: ['yG', 'Gg'],
};

export const wm3Opener: SceneArt = {
  id: 'wm3-opener',
  label: 'A grandmother rests in a wing chair on a moonlit terrace beside a tree that grows gold coins, one dropping into her basket, while an hourglass runs on a side table.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: fallingCoin, x: 30, y: 27 },
    { sprite: wmHourglass, x: 55, y: 38 },
    { sprite: ripeCoin, x: CROWN_X + 17, y: CROWN_Y + 5, motion: { kind: 'twinkle', periodMs: 3600, min: 0 } },
    { sprite: ripeCoin, x: CROWN_X + 25, y: CROWN_Y + 10, motion: { kind: 'twinkle', periodMs: 4200, phase: 0.5, min: 0 } },
    { sprite: wmFirefly, x: 62, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.2 } },
    { sprite: wmFirefly, x: 47, y: 31, motion: { kind: 'rise', amp: 4, periodMs: 2600, phase: 0.7 } },
    { sprite: wmStar, x: 44, y: 3, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: wmStarDot, x: 58, y: 9, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.5, min: 0.2 } },
  ],
};

/**
 * The keepsake's bough: leaves in the laurel's greens over a wooden branch, a ripe pair of coins
 * hanging together from it, and the opener's wicker basket heaped with coins at the foot. The coin
 * on the left is the motion. The pair hangs as one bunch, never as two dots over the basket, so
 * the bough cannot read as a face.
 */
const BOUGH = [
  '..mN...mNN..mN',
  '.mNNn.mNNNnmNN',
  'mNNNNnNNNNNNNN',
  'CCCCCCCCCCCCCU',
  'UUUUUUUUOUUOUO',
  '.......yWGyWG.',
  '.......GGgGGg.',
  '........g..g..',
  '..............',
  '...yGyGgyGg...',
  '..UCCCCCCCCU..',
  '..OUCUCUCUCO..',
  '...OOOOOOOO...',
];

/** The bough with the left coin's top at row `dy` (hanging on its stem at 5), or none; `landed` glints the heap. */
function boughAt(dy: number | null, landed = false): string[] {
  return BOUGH.map((row, j) => {
    const cells = [...row];
    if (dy === 5 && j === 4) cells[3] = 'O';
    if (dy !== null && j === dy) [cells[3], cells[4]] = ['y', 'G'];
    if (dy !== null && j === dy + 1) [cells[3], cells[4]] = ['G', 'g'];
    if (landed && j === 9) [cells[4], cells[5]] = ['W', 'y'];
    return cells.join('');
  });
}

/** Take the fruit, keep the tree: the coin ripens, falls into the basket, and the next one comes. 14x13. */
const emblemBough: PixelSprite = {
  id: 'wm3-emblem-bough',
  name: 'wm3-emblem-bough',
  tags: ['scene', 'wm3'],
  palette: WM_INKS,
  rows: boughAt(7),
  frames: [boughAt(5), boughAt(5), boughAt(6), boughAt(7), boughAt(null, true), boughAt(null), boughAt(null)],
  frameMs: 380,
};

export const wm3Finish: SceneArt = wmKeepsake(
  'wm3-finish',
  emblemBough,
  'A green crest with a gold rim bearing a leafy bough hung with gold coins, one dropping into a wicker basket of coins below, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm3Opener, backdrop: wmBackdrop, finish: wm3Finish };
