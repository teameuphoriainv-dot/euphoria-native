/**
 * Quantitative Analysis lesson 16, Interest Rate Models: mean reversion in the boardroom.
 *
 * Down a long boardroom table, the far wall's screen runs a short-rate model: rates that start high
 * (blue), low (teal) and level (orchid) are all pulled back toward the long-run rate θ, the gold
 * dashed line, and wander round it after (Vasicek's mean reversion). Framed on the side wall, a
 * trinomial tree, the lattice Hull-White prices on. The quant stands at the head of the table with a
 * laser pointer on θ. Only small layers move: the laser dot runs along θ, the rates' newest values
 * glow, the tree lights up a step at a time, the plant's top leaf sways.
 * Keepsake: an anchor, the long-run rate that pulls everything back.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { QA_PALETTE, QA_REACH_HAND, qaCompose, qaKeepsake, qaPath, qaQuantReaching, qaRoom, qaScreen, qaText } from './qa-kit';
import type { QaStamp } from './qa-kit';
import { qaRandom } from './qa-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the screen: rates pulled back to θ ────────────────────────────────────────────────────────── */

const SCREEN = { x: 18, y: 2, width: 44, height: 24 } as const;
const THETA = 13;
const PATH_X = { from: SCREEN.x + 3, to: SCREEN.x + SCREEN.width - 6 } as const;

/** A Vasicek path: each step a quarter of the way back to θ, plus a seeded shock. */
function vasicek(seed: number, start: number): [number, number][] {
  const rand = qaRandom(seed);
  const points: [number, number][] = [];
  let r = start;
  for (let x = PATH_X.from; x <= PATH_X.to; x += 2) {
    points.push([x, Math.round(r)]);
    r += 0.25 * (THETA - r) + (rand() - 0.5) * 2;
  }
  return points;
}

const PATHS = [['B', 5, 7], ['T', 22, 11], ['q', THETA, 29]] as const;
const rates: QaStamp[] = PATHS.map(([ch, start, seed]) => ({
  sprite: qaPath(`qa16-rate-${ch}`, 80, 60, vasicek(seed, start), ch),
  x: 0,
  y: 0,
}));

/** Each rate's newest value, one step past its line: held still (it glows rather than flickers). */
const TIP_X = PATH_X.to + 2;
const lastY = PATHS.map(([, start, seed]) => vasicek(seed, start).at(-1)?.[1] ?? THETA);
const TIP_TOP = Math.min(...lastY);
function tipColumn(): string[] {
  const rows = Array.from({ length: Math.max(...lastY) - TIP_TOP + 1 }, () => '.');
  PATHS.forEach(([ch], i) => {
    rows[lastY[i] - TIP_TOP] = ch;
  });
  return rows;
}
const tips: PixelSprite = { id: 'qa16-tips', name: 'qa16-tips', tags: ['scene', 'qa16'], rows: tipColumn() };

const laser: PixelSprite = { id: 'qa16-laser', name: 'qa16-laser', tags: ['scene', 'qa16'], rows: ['.R.', 'RWR', '.R.'] };

/* ── the trinomial tree, framed on the side wall ───────────────────────────────────────────────── */

const PRINT = { x: 2, y: 5, width: 14, height: 17 } as const;
const TREE = { x: PRINT.x + 2, y: PRINT.y + 2, width: 10, height: 13 } as const;
const LEVELS = [[[0, 6]], [[4, 3], [4, 6], [4, 9]], [[9, 0], [9, 3], [9, 6], [9, 9], [9, 12]]] as const;

const treeEdges = qaCompose('qa16-tree-edges', TREE.width, TREE.height, LEVELS.slice(0, 2).flatMap((level, l) =>
  level.flatMap(([x, y], i) => [-3, 0, 3].map((dy) => {
    const child = LEVELS[l + 1].find(([cx, cy]) => cx > x && cy === y + dy) ?? LEVELS[l + 1][i];
    return { sprite: qaPath(`qa16-edge-${String(l)}-${String(i)}-${String(dy)}`, TREE.width, TREE.height, [[x, y], [child[0], child[1]]], 'X'), x: 0, y: 0 };
  }))));

/** The tree's nodes, one level lit gold a frame: the lattice rolling forward in time. */
function treeNodes(lit: number): string[] {
  const rows = Array.from({ length: TREE.height }, () => new Array<string>(TREE.width).fill('.'));
  LEVELS.forEach((level, l) => level.forEach(([x, y]) => {
    rows[y][x] = l === lit ? 'y' : 'w';
  }));
  return rows.map((row) => row.join(''));
}
const nodes: PixelSprite = {
  id: 'qa16-nodes',
  name: 'qa16-nodes',
  tags: ['scene', 'qa16'],
  rows: treeNodes(0),
  frames: [0, 1, 2, -1].map(treeNodes),
  frameMs: 520,
};

const print: PixelSprite = {
  id: 'qa16-print',
  name: 'qa16-print',
  tags: ['scene', 'qa16'],
  rows: [
    'O'.repeat(PRINT.width),
    'O' + 'g'.repeat(PRINT.width - 2) + 'O',
    ...Array.from({ length: PRINT.height - 4 }, () => 'Og' + 'K'.repeat(PRINT.width - 4) + 'OO'),
    'O'.repeat(PRINT.width),
    'O'.repeat(PRINT.width),
  ],
};

/* ── the table, the chairs, the plant ──────────────────────────────────────────────────────────── */

const TABLE = { top: 30, bottom: 50, farLeft: 31, farRight: 48, nearLeft: 14, nearRight: 65 } as const;

/** The boardroom table running away from us: dark polished wood, the screen's glow on its far end. */
const table: PixelSprite = {
  id: 'qa16-table',
  name: 'qa16-table',
  tags: ['scene', 'qa16'],
  palette: QA_PALETTE,
  rows: Array.from({ length: TABLE.bottom - TABLE.top + 1 }, (_, r) => {
    const t = r / (TABLE.bottom - TABLE.top);
    const left = Math.round(TABLE.farLeft + t * (TABLE.nearLeft - TABLE.farLeft));
    const right = Math.round(TABLE.farRight + t * (TABLE.nearRight - TABLE.farRight));
    const glow = Math.round((right - left) / 6);
    return [...Array(80)].map((_, x) => {
      if (x < left || x > right) return '.';
      if (r === 0 || x === left || x === right) return 'D';
      return Math.abs(x - 40) <= glow && r < 10 ? 'g' : 'O';
    }).join('');
  }),
};

/** The table's near end: its edge, two legs and their shadow on the floor. */
const tableEnd: PixelSprite = {
  id: 'qa16-table-end',
  name: 'qa16-table-end',
  tags: ['scene', 'qa16'],
  palette: QA_PALETTE,
  rows: [
    'D'.repeat(TABLE.nearRight - TABLE.nearLeft + 1),
    'K'.repeat(TABLE.nearRight - TABLE.nearLeft + 1),
    ...Array.from({ length: 5 }, () => '.DK' + '.'.repeat(TABLE.nearRight - TABLE.nearLeft - 5) + 'DK.'),
    '.ZZZ' + '.'.repeat(TABLE.nearRight - TABLE.nearLeft - 7) + 'ZZZ.',
  ],
};

/** A high-backed leather chair seen from the table's end: lit along its top and left. */
function chair(id: string, width: number, height: number): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'qa16'],
    rows: ['.' + 'X'.repeat(width - 2) + '.', ...Array.from({ length: height - 2 }, () => 'X' + 'D'.repeat(width - 2) + 'K'), 'K'.repeat(width)],
  };
}

/** Three chairs down each side, bigger as they come nearer: [x on the left, top, width, height]. */
const CHAIRS = [[27, 27, 4, 6], [18, 33, 6, 9], [5, 41, 9, 13]] as const;
const chairs: QaStamp[] = CHAIRS.flatMap(([x, y, width, height], i) => {
  const sprite = chair(`qa16-chair-${String(i)}`, width, height);
  return [{ sprite, x, y }, { sprite, x: 79 - x - width + 1, y }];
});

const plant: PixelSprite = {
  id: 'qa16-plant',
  name: 'qa16-plant',
  tags: ['scene', 'qa16'],
  blurb: 'A fiddle-leaf fig in a brass pot.',
  palette: QA_PALETTE,
  rows: [
    '....mN.....',
    '...mNNn....',
    '..mNNn.mN..',
    '...nn.mNNn.',
    '.mN.n.NNn..',
    'mNNnn..n...',
    '.NNn.n.mN..',
    '..n..nmNNn.',
    '.....nNNn..',
    '.....n.n...',
    '.....n.....',
    '...OOOOOO..',
    '...OyGGgO..',
    '...OGGGgO..',
    '....OGgO...',
    '....OOOO...',
    '...ZZZZZZ..',
  ],
};
const leaf: PixelSprite = { id: 'qa16-leaf', name: 'qa16-leaf', tags: ['scene', 'qa16'], rows: ['.m', 'mN', 'N.'] };

const QUANT_AT = { x: 31, y: 30 } as const;
const HAND = { x: QUANT_AT.x + QA_REACH_HAND.x, y: QUANT_AT.y + QA_REACH_HAND.y } as const;

const base = qaCompose('qa16-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: print, x: PRINT.x, y: PRINT.y },
  { sprite: treeEdges, x: TREE.x, y: TREE.y },
  { sprite: plant, x: 68, y: 30 },
  { sprite: qaScreen('qa16-screen', SCREEN.width, SCREEN.height, { surface: 'K' }), x: SCREEN.x, y: SCREEN.y },
  { sprite: qaPath('qa16-theta-line', 80, 60, [[PATH_X.from, THETA], [PATH_X.to + 2, THETA]], 'y', [2, 2]), x: 0, y: 0 },
  ...rates,
  { sprite: qaText('qa16-theta', 'θ', 'y'), x: SCREEN.x + SCREEN.width - 6, y: THETA - 7 },
  { sprite: table, x: 0, y: TABLE.top },
  { sprite: tableEnd, x: TABLE.nearLeft, y: TABLE.bottom + 1 },
  ...chairs,
  { sprite: qaQuantReaching, x: QUANT_AT.x, y: QUANT_AT.y },
  // The laser pointer in the raised hand.
  { sprite: { id: 'qa16-pointer', name: 'qa16-pointer', tags: ['scene', 'qa16'], rows: ['D', 'X'] }, x: HAND.x, y: HAND.y - 2 },
]);

export const qa16Opener: SceneArt = {
  id: 'qa16-opener',
  label: 'At the head of a long boardroom table, a quant points a laser at a screen where interest rates starting high, low and level are all pulled back to a gold long-run line and wander around it, beside a framed trinomial tree.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: laser, x: 39, y: THETA - 1, motion: { kind: 'drift', amp: 7, periodMs: 3200 } },
    { sprite: tips, x: TIP_X, y: TIP_TOP, motion: { kind: 'twinkle', periodMs: 1200, min: 0.3 } },
    { sprite: nodes, x: TREE.x, y: TREE.y },
    { sprite: leaf, x: 69, y: 28, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
  ],
};

/** Lesson 16's emblem: an anchor, the long-run rate every path is pulled back to. */
const emblemAnchor: PixelSprite = {
  id: 'qa16-emblem-anchor',
  name: 'qa16-emblem-anchor',
  tags: ['scene', 'qa16'],
  rows: [
    '............',
    '.....OO.....',
    '....O..Oy...',
    '.....OOy....',
    '...OOOOOOy..',
    '.....OOy....',
    '.....OOy....',
    '.....OOy....',
    '.O...OOy..O.',
    '.OO..OOy.OOy',
    '..OOOOOOOOy.',
    '...yyyyyyy..',
  ],
};

export const qa16Finish: SceneArt = qaKeepsake(
  'qa16-finish',
  'A gold medallion hanging from a purple ribbon, embossed with an anchor, with small sparkles around it.',
  emblemAnchor,
);

export const art: LessonArtSet = { opener: qa16Opener, backdrop: qaBackdrop, finish: qa16Finish };
