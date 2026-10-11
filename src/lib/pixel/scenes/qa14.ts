/**
 * Quantitative Analysis lesson 14, Exotic Options & Path-Dependent Derivatives: knocked out in the
 * exchange hall.
 *
 * Between two marble columns hangs the hall's great board, and on it a down-and-out call: the
 * strike K dashed across the top, the barrier B in red below it. The stock's path wanders down
 * and touches the barrier, and the option dies there, KO, however the stock recovers after (the
 * rest of the path is drawn grey: the option no longer sees it). That is what path-dependent
 * means. The quant stands on the checkered marble floor. Only small layers move: the path draws
 * itself to the barrier, the KO flashes, the sconces on the columns flicker.
 * Keepsake: KO, the knock-out.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { qaCompose, qaKeepsake, qaPath, qaQuantStanding, qaRoom, qaScreen, qaText } from './qa-kit';
import { qaBridge } from './qa-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the hall ──────────────────────────────────────────────────────────────────────────────────── */

/** A fluted marble column from the ceiling to the floor: capital, shaft, base. */
const column: PixelSprite = {
  id: 'qa14-column',
  name: 'qa14-column',
  tags: ['scene', 'qa14'],
  blurb: 'A marble column, 12x46: lit flutes on the left of each groove.',
  rows: [
    'DDDDDDDDDDDD',
    'DwwwwwwwwwxD',
    'DDDDDDDDDDDD',
    '.DxwwwwwwxD.',
    '..DDDDDDDD..',
    ...Array.from({ length: 36 }, () => '..DwxXwxXD..'),
    '..DDDDDDDD..',
    '.DxwwwwwwxD.',
    'DDDDDDDDDDDD',
    'DwwwwwwwwwxD',
    'DDDDDDDDDDDD',
  ],
};

/** The hall's chequered marble floor. */
const floor: PixelSprite = {
  id: 'qa14-floor',
  name: 'qa14-floor',
  tags: ['scene', 'qa14'],
  rows: Array.from({ length: 13 }, (_, y) => [...Array(80)].map((_, x) => ((Math.floor(x / 5) + Math.floor(y / 3)) % 2 === 0 ? 'k' : 'K')).join('')),
};

const chain: PixelSprite = {
  id: 'qa14-chain',
  name: 'qa14-chain',
  tags: ['scene', 'qa14'],
  rows: ['X', 'D', 'X', 'D', 'X'],
};

/** A brass sconce on a column, and the glow it throws. */
const sconce: PixelSprite = { id: 'qa14-sconce', name: 'qa14-sconce', tags: ['scene', 'qa14'], rows: ['.y.', 'OGO', '.O.'] };
const glow: PixelSprite = { id: 'qa14-glow', name: 'qa14-glow', tags: ['scene', 'qa14'], rows: ['.y.', 'yWy'] };

/* ── the board: a down-and-out call ────────────────────────────────────────────────────────────── */

const BOARD = { x: 14, y: 5, width: 52, height: 30 } as const;
const STRIKE_Y = 12;
const BARRIER_Y = 25;
const START = [19, 14] as const;
const TOUCH = [50, BARRIER_Y - 1] as const;

const PATH = qaBridge(14, START, TOUCH, { jitter: 1.5, top: 9, bottom: BARRIER_Y - 1 });
/** After the touch the stock recovers, but the option is dead: the rest of the path is grey. */
const AFTER = qaBridge(5, TOUCH, [60, 17], { jitter: 1.2, top: 9, bottom: BARRIER_Y - 1 });

/** The framed layer's box: the whole path, the after-path and the cross at the touch. */
const BOX = { x: START[0] - 1, y: 9, width: 60 - START[0] + 2, height: BARRIER_Y - 9 + 2 } as const;

function pathFrame(count: number, knocked: boolean): string[] {
  const shift = (points: readonly [number, number][]) => points.map(([x, y]) => [x - BOX.x, y - BOX.y] as [number, number]);
  const cells = qaPath('qa14-path', BOX.width, BOX.height, shift(PATH.slice(0, count)), 'w').rows.map((row) => row.split(''));
  if (knocked) {
    const after = qaPath('qa14-after', BOX.width, BOX.height, shift(AFTER), 'X').rows;
    after.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch !== '.' && cells[y][x] === '.') cells[y][x] = ch;
    }));
    const [tx, ty] = [TOUCH[0] - BOX.x, TOUCH[1] - BOX.y + 1];
    for (const [dx, dy] of [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]) cells[ty + dy][tx + dx] = 'R';
  }
  return cells.map((row) => row.join(''));
}

const pathDraw: PixelSprite = {
  id: 'qa14-path',
  name: 'qa14-path',
  tags: ['scene', 'qa14'],
  blurb: "The stock's path drawing itself down to the barrier, where the option is knocked out.",
  rows: pathFrame(PATH.length, true),
  frames: [
    pathFrame(2, false), pathFrame(5, false), pathFrame(8, false), pathFrame(11, false), pathFrame(14, false),
    pathFrame(PATH.length, true), pathFrame(PATH.length, true), pathFrame(PATH.length, true),
  ],
  frameMs: 300,
};

const QUANT_AT = { x: 33, y: 28 } as const;

const base = qaCompose('qa14-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: floor, x: 0, y: 47 },
  { sprite: column, x: 0, y: 0 },
  { sprite: column, x: 68, y: 0 },
  { sprite: chain, x: 20, y: 0 },
  { sprite: chain, x: 59, y: 0 },
  { sprite: qaScreen('qa14-board', BOARD.width, BOARD.height, { surface: 'K' }), x: BOARD.x, y: BOARD.y },
  { sprite: qaPath('qa14-strike', 80, 60, [[17, STRIKE_Y], [62, STRIKE_Y]], 'x', [2, 2]), x: 0, y: 0 },
  { sprite: qaPath('qa14-barrier', 80, 60, [[17, BARRIER_Y], [62, BARRIER_Y]], 'R'), x: 0, y: 0 },
  { sprite: qaText('qa14-k', 'K', 'x'), x: 58, y: STRIKE_Y - 5 },
  { sprite: qaText('qa14-b', 'B', 'R'), x: 18, y: BARRIER_Y - 6 },
  // Today's price, where the path starts.
  { sprite: { id: 'qa14-start', name: 'qa14-start', tags: ['scene', 'qa14'], rows: ['WW', 'WW'] }, x: START[0] - 1, y: START[1] - 1 },
  { sprite: sconce, x: 4, y: 20 },
  { sprite: sconce, x: 73, y: 20 },
  { sprite: qaQuantStanding, x: QUANT_AT.x, y: QUANT_AT.y },
]);

export const qa14Opener: SceneArt = {
  id: 'qa14-opener',
  label: "In a marble exchange hall a quant watches the great board, where a stock's path falls to a red barrier line and the barrier option is knocked out, marked KO, even though the stock recovers after.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pathDraw, x: BOX.x, y: BOX.y },
    { sprite: qaText('qa14-ko', 'KO', 'R'), x: TOUCH[0] - 4, y: BARRIER_Y + 2, motion: { kind: 'twinkle', periodMs: 1200, min: 0.2 } },
    { sprite: glow, x: 4, y: 18, motion: { kind: 'twinkle', periodMs: 1900, min: 0.5 } },
    { sprite: glow, x: 73, y: 18, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.4, min: 0.5 } },
  ],
};

/** Lesson 14's emblem: KO, what the board stamps where the path touches the barrier. */
const emblemKnockOut: PixelSprite = {
  id: 'qa14-emblem-ko',
  name: 'qa14-emblem-ko',
  tags: ['scene', 'qa14'],
  rows: [
    '............',
    '............',
    '.OO.OO.OOOO.',
    '.OOOOy.OOyOO',
    '.OOOy..OOyOO',
    '.OOOOy.OOyOO',
    '.OO.OOyOOOOy',
    '..y..y..yyy.',
    '............',
    '............',
    '............',
    '............',
  ],
};

export const qa14Finish: SceneArt = qaKeepsake(
  'qa14-finish',
  'A gold medallion hanging from a purple ribbon, embossed with the letters KO, for knocked out, with small sparkles around it.',
  emblemKnockOut,
);

export const art: LessonArtSet = { opener: qa14Opener, backdrop: qaBackdrop, finish: qa14Finish };
