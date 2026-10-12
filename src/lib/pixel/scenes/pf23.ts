/**
 * Personal Finance lesson 23, Financial Independence & Early Retirement: work becomes optional.
 *
 * The garden at golden hour, years on. The young tree of lesson 16 is grown now, a broad crown on a
 * thick trunk, and it bears gold: coins hang among the leaves, and one drops into the basket below,
 * the yearly four percent the lesson lives on while the tree keeps growing. A hammock is slung from
 * the trunk to a post and the figure naps in it, feet crossed, the work optional; the cat sits up
 * under it watching the coin fall. Moving: the coin, the figure's z, the sun, a bird, the cat's tail.
 */
import type { PixelSprite } from '../types';
import { pfBird, pfCompose, pfZzz } from './pf-kit';
import { pfCatSit } from './pf-kit-a';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  j: '#6B3A1F',
  H: '#43291A',
};

const SKY = ['E', 'E', 'E', 'E', 'p', 'p', 'p', 'p', 'p', 'p', 'f', 'f', 'f', 'f', 'f', 'f', 'f', '3', '3', '3', '3', '3', '3', '3', '3', '4', '4', '4', '4', '4', '4', '4'];

/**
 * The garden at golden hour: the sky with the sun low in it at (57, 24), far purple hills, and the
 * lawn from about row 41, darker toward us, flecked.
 */
function goldenGarden(): string[] {
  return Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      const lawn = 41 + Math.round(1.5 * Math.sin(x / 13 + 1));
      if (y >= lawn) {
        if (y >= 52) return (x * 3 + y * 7) % 17 === 0 ? 'n' : 'k';
        return (x * 5 + y * 3) % 17 === 0 ? 'N' : 'n';
      }
      const hill = 35 + Math.round(2 * Math.sin(x / 9));
      if (y >= hill) return y === hill ? 'p' : 'E';
      const sun = (x - 57) ** 2 + (y - 24) ** 2;
      if (sun <= 12) return '5';
      if (sun <= 26) return '4';
      return SKY[Math.min(y, SKY.length - 1)];
    }).join(''),
  );
}

/** Where the gold hangs in the crown, as the tree's own columns and rows. */
const COINS = [[9, 9], [18, 4], [27, 7], [34, 14], [13, 17], [23, 13], [29, 20], [19, 22]] as const;
const LUMPS = [[10, 9, 8], [20, 6, 9], [30, 9, 8], [8, 17, 7], [20, 15, 9], [33, 17, 7], [14, 22, 6], [27, 22, 6]] as const;

/**
 * Lesson 16's young tree grown on: a broad lumpy crown lit from the upper left, gold coins in it, on
 * a trunk six wide that flares into roots. The trunk's right edge is column 20; the foot is row 49.
 */
function bigTree(): PixelSprite {
  const W = 42;
  const H = 50;
  const lumpAt = (x: number, y: number) => {
    let best: { lump: (typeof LUMPS)[number]; depth: number } | undefined;
    for (const lump of LUMPS) {
      const depth = lump[2] - Math.hypot(x - lump[0], y - lump[1]);
      if (depth >= 0 && (!best || depth > best.depth)) best = { lump, depth };
    }
    return best;
  };
  const inCrown = (x: number, y: number) => x >= 0 && x < W && y >= -9 && lumpAt(x, y) !== undefined;
  const trunk = (x: number, y: number): string | undefined => {
    if (y < 20) return undefined;
    const flare = y >= 46 ? y - 45 : 0;
    const left = 15 - flare;
    const right = 20 + flare;
    if (x < left || x > right) return undefined;
    if (x === left || x === right || y === H - 1) return 'O';
    if (x === left + 1) return 'G';
    return (x + y * 2) % 7 === 0 ? 'O' : 'g';
  };
  return {
    id: 'pf23-big-tree',
    name: 'big tree',
    tags: ['scene', 'pf'],
    rows: Array.from({ length: H }, (_, y) =>
      Array.from({ length: W }, (_, x) => {
        const coin = COINS.find(([cx, cy]) => x >= cx && x <= cx + 1 && y >= cy && y <= cy + 1);
        if (coin) return x === coin[0] ? (y === coin[1] ? 'y' : 'G') : y === coin[1] ? 'G' : 'g';
        const hit = lumpAt(x, y);
        if (hit) {
          const edge = !inCrown(x - 1, y) || !inCrown(x + 1, y) || !inCrown(x, y - 1) || !inCrown(x, y + 1);
          if (edge) return 'n';
          const [lx, ly, r] = hit.lump;
          const s = (x - lx + (y - ly)) / r;
          if (s < -0.6 && hit.depth < 2) return 'm';
          return s > 0.35 ? 'n' : 'N';
        }
        return trunk(x, y) ?? '.';
      }).join(''),
    ),
  };
}

/** The post the hammock's far end is tied to. */
const post: PixelSprite = {
  id: 'pf23-post',
  name: 'post',
  tags: ['scene', 'pf'],
  rows: [
    'OO',
    ...Array.from({ length: 22 }, () => 'Gg'),
    'OO',
  ],
};

/**
 * The hammock with the figure napping in it, 50 wide: ropes from the trunk (column 1, row 2) and the
 * post (column 49, row 2) to a striped cloth that sags six rows; on it the figure lies with its head
 * on the left end, its sweater and trousers along the sag and its socked feet crossed up at the right.
 */
const HEAD = [
  '..HHHH..',
  '.HjjjjC.',
  'HjjjCCCM',
  'HjjCUUCC',
  '.HjCCCCU',
  '..UUUU..',
];
function hammock(): PixelSprite {
  const W = 50;
  const H = 18;
  const top = (x: number) => 7 + Math.round(6 * (1 - ((x - 25) / 20) ** 2));
  const rope = new Set(['1,2', '2,3', '3,4', '4,5', '4,6', '5,7', '49,2', '48,3', '47,4', '46,5', '46,6', '45,7']);
  return {
    id: 'pf23-hammock',
    name: 'hammock',
    tags: ['scene', 'pf'],
    palette: SKIN,
    rows: Array.from({ length: H }, (_, y) =>
      Array.from({ length: W }, (_, x) => {
        if (rope.has(`${String(x)},${String(y)}`)) return 'x';
        const head = HEAD[y - 3]?.[x - 5];
        if (head && head !== '.') return head;
        if (x >= 5 && x <= 45) {
          const t = top(x);
          const stripe = Math.floor(x / 3) % 2 === 0;
          if (y === t) return stripe ? 'w' : 'q';
          if (y === t + 1) return stripe ? 'x' : 'P';
          if (y === t + 2) return 'p';
          if (x >= 11 && x <= 26 && y >= t - 3 && y < t) return y === t - 3 ? 'B' : x === 19 && y === t - 2 ? 'C' : 'b';
          if (x >= 27 && x <= 39 && y >= t - 2 && y < t) return y === t - 2 ? 'X' : 'D';
          if (x >= 40 && x <= 43 && y >= t - 5 && y < t) {
            if (y === t - 5) return x === 40 || x === 42 ? 'w' : '.';
            return x === 40 || x === 42 ? 'w' : x === 41 ? 'x' : '.';
          }
        }
        return '.';
      }).join(''),
    ),
  };
}

/** A wicker basket on the lawn, heaped with the coins the tree has dropped. */
const basket: PixelSprite = {
  id: 'pf23-basket',
  name: 'basket',
  tags: ['scene', 'pf'],
  rows: [
    '...yG.yG.....',
    '.yGGgyGgGyG..',
    'yGgGGgGGgGgG.',
    'OOOOOOOOOOOOO',
    'OgGgGgGgGgGgO',
    '.OgGgGgGgGgO.',
    '.OGgGgGgGgGO.',
    '..OOOOOOOOO..',
  ],
};

/**
 * A coin let go by the tree: hanging, falling past the trunk, landing in the basket's heap with a
 * glint, then hanging again. A LAYER only.
 */
const DROP_H = 32;
const EMPTY = '....';
const COIN = ['.OO.', 'OyGO', 'OGgO', '.OO.'];
function coinAt(row: number): string[] {
  return Array.from({ length: DROP_H }, (_, i) => (i >= row && i < row + 4 ? COIN[i - row] : EMPTY));
}
const coinDrop: PixelSprite = {
  id: 'pf23-coin-drop',
  name: 'coin drop',
  tags: ['scene', 'pf'],
  rows: coinAt(0),
  frames: [
    coinAt(0),
    coinAt(0),
    coinAt(0),
    coinAt(0),
    coinAt(2),
    coinAt(6),
    coinAt(11),
    coinAt(17),
    coinAt(24),
    coinAt(28),
    [...Array.from({ length: DROP_H - 3 }, () => EMPTY), '.y..', 'yWy.', '.y..'],
    [...Array.from({ length: DROP_H - 2 }, () => EMPTY), '.w..', EMPTY],
    Array.from({ length: DROP_H }, () => EMPTY),
  ],
  frameMs: 150,
};

/** The sun's glow over the hills, for a slow twinkle. */
const sunGlow: PixelSprite = {
  id: 'pf23-sun-glow',
  name: 'sun glow',
  tags: ['scene', 'pf'],
  rows: [
    '....5.5....',
    '.5.......5.',
    '...........',
    '5.........5',
    '...........',
    '.5.......5.',
    '....5.5....',
  ],
};

/** Lesson 23's emblem: the grown tree, a round crown with gold coins in it, on its trunk. */
const emblemGoldTree: PixelSprite = {
  id: 'pf23-emblem-gold-tree',
  name: 'pf23-emblem-gold-tree',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '....nNNNNn....',
    '..nNmNNyGNn...',
    '.nNmNNNGgNNn..',
    'nNyGNNNNNNyGn.',
    'nNGgNNNNNNGgn.',
    '.nNNNNyGNNNn..',
    '..nnnnGgnnn...',
    '......Og......',
    '....OOggOO....',
  ],
};

// Order is depth: the tree, the post, the hammock slung between them, the basket on the lawn.
const base = pfCompose('pf23-opener-base', 80, 60, goldenGarden(), [
  [bigTree(), 0, 1],
  [post, 70, 28],
  [hammock(), 20, 28],
  [basket, 1, 48],
]);

export const pf23Opener: SceneArt = {
  id: 'pf23-opener',
  label: 'In a garden at golden hour, a big tree hung with gold coins drops one into a basket below, while a person naps in a hammock slung from its trunk to a post, feet crossed, and the cat sits under the hammock watching.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The coin hangs in the crown's lower left and lands on the basket's heap (basket at 1,48).
    { sprite: coinDrop, x: 4, y: 17 },
    { sprite: pfZzz, x: 31, y: 25, motion: { kind: 'rise', amp: 4, periodMs: 3000, phase: 0.2 } },
    { sprite: pfCatSit, x: 40, y: 46 },
    { sprite: sunGlow, x: 52, y: 18, motion: { kind: 'twinkle', periodMs: 3200, min: 0.3 } },
    { sprite: pfBird, x: 66, y: 9, motion: { kind: 'drift', amp: 3, periodMs: 5600 } },
  ],
};

export const pf23Finish = pfKeepsake(
  'pf23-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a round green tree hung with gold coins, with small sparkles around it.',
  emblemGoldTree,
);

export const art: LessonArtSet = { opener: pf23Opener, backdrop: pfBackdrop, finish: pf23Finish };
