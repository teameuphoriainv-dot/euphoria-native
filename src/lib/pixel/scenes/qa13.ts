/**
 * Quantitative Analysis lesson 13, Fixed Income Analytics: the yield curve in the bond library.
 *
 * A reading room lined with ledgers. The screen over the reading table plots the yield curve,
 * yield against maturity from one year to thirty, and keeps changing its shape: the normal curve
 * (green, rising: long money pays more), flattening (gold), then inverted (red, short yields above
 * long ones), when the recession light in its corner comes on, and back. The quant reads under a
 * green banker's lamp. Only small layers move: the curve bends through its shapes, dust drifts up
 * through the lamplight, the tea steams.
 * Keepsake: the percent sign of a yield.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_PALETTE, qaCompose, qaDesk, qaKeepsake, qaMug, qaPath, qaPlotArea, qaQuantSeated, qaRoom, qaScreen, qaSteam,
} from './qa-kit';
import { qaRandom } from './qa-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the shelves ───────────────────────────────────────────────────────────────────────────────── */

/** Ledger spines in the room's deep tones, a bright one now and then. */
const SPINES = ['p', 't', 'b', 'r', 'n', 'E', 'O', 'X', 'g', 'P', 'T', 'q'] as const;

/**
 * A tall bookshelf standing on the floor: a deep-gold case, a shelf every 8 rows, and on each shelf
 * a run of ledgers of mixed widths and heights against the dark back.
 */
function bookshelf(id: string, width: number, height: number, seed: number): PixelSprite {
  const rand = qaRandom(seed);
  const rows = Array.from({ length: height }, (_, y) => ('O' + (y === 0 ? 'O' : 'K').repeat(width - 2) + 'O').split(''));
  for (let board = 8; board < height; board += 8) rows[board].fill('O');
  rows[height - 1].fill('O');
  for (let top = 1; top < height - 1; top += 8) {
    const floor = Math.min(top + 6, height - 2);
    let x = 1;
    while (x < width - 1) {
      const w = rand() < 0.3 ? 2 : 1;
      const h = 4 + Math.floor(rand() * 3);
      const ch = SPINES[Math.floor(rand() * SPINES.length)];
      for (let dx = 0; dx < w && x + dx < width - 1; dx += 1) {
        for (let y = floor; y > floor - h && y > top; y -= 1) rows[y][x + dx] = ch;
      }
      x += w;
      if (rand() < 0.15) x += 1;
    }
  }
  return { id, name: id, tags: ['scene', 'qa13'], palette: QA_PALETTE, rows: rows.map((row) => row.join('')) };
}

/* ── the yield curve ───────────────────────────────────────────────────────────────────────────── */

const SCREEN = { x: 16, y: 2, width: 48, height: 19 } as const;
const PLOT = qaPlotArea(SCREEN.width, SCREEN.height);
const CURVE = { x: SCREEN.x + PLOT.x, y: SCREEN.y + PLOT.y, width: PLOT.width, height: PLOT.height } as const;

/**
 * The curve at `shape`: 1 is normal (rising, levelling off), 0 flat, -1 inverted. Coloured by its
 * shape; when it is inverted, the recession light in the top corner is on.
 */
function curveFrame(shape: number): string[] {
  const flat = 7;
  const yAt = (m: number) => {
    const bend = 1 - Math.exp(-m / 10);
    const target = shape >= 0 ? 11 - 8 * bend : 4 + 7 * bend;
    return Math.round(flat + Math.abs(shape) * (target - flat));
  };
  const points: [number, number][] = [];
  for (let m = 0; m < CURVE.width; m += 3) points.push([m, yAt(m)]);
  points.push([CURVE.width - 1, yAt(CURVE.width - 1)]);
  const ch = shape > 0.25 ? 'N' : shape < -0.25 ? 'R' : 'y';
  const rows = qaPath('qa13-curve', CURVE.width, CURVE.height, points, ch).rows.map((row) => row.split(''));
  if (shape <= -0.5) {
    for (const [x, y] of [[CURVE.width - 3, 0], [CURVE.width - 2, 0], [CURVE.width - 3, 1], [CURVE.width - 2, 1]]) rows[y][x] = 'R';
  }
  return rows.map((row) => row.join(''));
}

const SHAPES = [1, 0.5, 0, -0.5, -1, -0.5, 0, 0.5] as const;
const curve: PixelSprite = {
  id: 'qa13-curve',
  name: 'qa13-curve',
  tags: ['scene', 'qa13'],
  blurb: 'The yield curve bending from normal through flat to inverted and back; the recession light comes on when it inverts.',
  rows: curveFrame(1),
  frames: SHAPES.map(curveFrame),
  frameMs: 420,
};

/* ── the reading table ─────────────────────────────────────────────────────────────────────────── */

/** A banker's lamp: the green glass shade on a brass arm. Its foot stands on the desk's back edge. */
const bankersLamp: PixelSprite = {
  id: 'qa13-bankers-lamp',
  name: 'qa13-bankers-lamp',
  tags: ['scene', 'qa13'],
  blurb: "A banker's lamp: a long green glass shade, lit along its top, on a brass stem and foot.",
  rows: [
    '..nnnnnnnnn..',
    '.nmmNNNNNNNn.',
    'nmNNNNNNNNNNn',
    'nnnnnnnnnnnnn',
    '.yyyyyyyyyyy.',
    '......Gg.....',
    '......Gg.....',
    '....OGGGgO...',
  ],
};

/** The lamp's pool of light on the desk top. */
const pool: PixelSprite = {
  id: 'qa13-pool',
  name: 'qa13-pool',
  tags: ['scene', 'qa13'],
  rows: ['yyyyyyyyyyyyyyy', '.yyyyyyyyyyyyy.'],
};

/** A stack of ledgers on the desk, spines out. */
const ledgers: PixelSprite = {
  id: 'qa13-ledgers',
  name: 'qa13-ledgers',
  tags: ['scene', 'qa13'],
  rows: ['.OOOOOOOO.', '.OyGGGGgO.', 'EEEEEEEEE.', 'EqPPPPPpE.', 'tttttttttt', 'tTTTTTTTTt'],
};

const LAMP_AT = { x: 15, y: 33 } as const;

const base = qaCompose('qa13-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: bookshelf('qa13-shelf-left', 14, 44, 13), x: 0, y: 3 },
  { sprite: bookshelf('qa13-shelf-right', 14, 44, 31), x: 66, y: 3 },
  { sprite: qaScreen('qa13-screen', SCREEN.width, SCREEN.height, { axes: true }), x: SCREEN.x, y: SCREEN.y },
  { sprite: qaDesk, x: 11, y: 40 },
  { sprite: pool, x: LAMP_AT.x - 1, y: 41 },
  { sprite: bankersLamp, x: LAMP_AT.x, y: LAMP_AT.y },
  { sprite: ledgers, x: 54, y: 34 },
  { sprite: qaMug, x: 46, y: 34 },
  { sprite: qaQuantSeated, x: 33, y: 19 },
]);

/** Dust in the lamplight. */
const mote: PixelSprite = { id: 'qa13-mote', name: 'qa13-mote', tags: ['scene', 'qa13'], rows: ['y'] };

export const qa13Opener: SceneArt = {
  id: 'qa13-opener',
  label: "In a library lined with ledgers, a quant reads under a green banker's lamp below a screen where the yield curve bends from normal to flat to inverted, lighting a red recession warning, and back.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: curve, x: CURVE.x, y: CURVE.y },
    { sprite: mote, x: LAMP_AT.x + 4, y: 38, motion: { kind: 'rise', amp: 5, periodMs: 2400 } },
    { sprite: mote, x: LAMP_AT.x + 9, y: 39, motion: { kind: 'rise', amp: 4, periodMs: 2000, phase: 0.5 } },
    { sprite: qaSteam, x: 47, y: 30, motion: { kind: 'rise', amp: 3, periodMs: 1800 } },
  ],
};

/** Lesson 13's emblem: the percent sign of a yield. */
const emblemPercent: PixelSprite = {
  id: 'qa13-emblem-percent',
  name: 'qa13-emblem-percent',
  tags: ['scene', 'qa13'],
  rows: [
    '............',
    '.OOO.....OO.',
    '.O.Oy...OOy.',
    '.OOOy..OOy..',
    '..yyy.OOy...',
    '.....OOy....',
    '....OOy.....',
    '...OOy.OOO..',
    '..OOy..O.Oy.',
    '.OOy...OOOy.',
    '.Oy.....yyy.',
    '............',
  ],
};

export const qa13Finish: SceneArt = qaKeepsake(
  'qa13-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a percent sign, with small sparkles around it.',
  emblemPercent,
);

export const art: LessonArtSet = { opener: qa13Opener, backdrop: qaBackdrop, finish: qa13Finish };
