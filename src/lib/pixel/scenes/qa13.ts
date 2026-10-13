/**
 * Quantitative Analysis lesson 13, Fixed Income Analytics: the yield curve in the bond library.
 *
 * A reading room lined with ledgers. The screen over the reading table plots the yield curve, yield
 * (%) up the side against maturity from 1Y to 30Y along the bottom: the normal curve, rising and
 * levelling off because long money usually pays more, is a faint dotted ghost, and over it today's
 * curve in red is inverted, short yields above long ones, so the recession light in the corner is
 * on. Framed on the wall is a bond itself, a certificate with its coupons along the bottom, the cash
 * flows its price is the present value of; on the reading table a brass seesaw tips yield up and
 * price down, the way a bond's price falls when yields rise. The quant stands at the end of the
 * table pointing up at the inversion, the banker's lamp lit. The curves hold still. Only small layers
 * move: the recession light blinks, dust drifts up through the lamplight, the certificate's seal
 * glints.
 * Keepsake: the yield curve on its axes, normal in gold and inverted in white.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_PALETTE, qaCompose, qaKeepsake, qaPath, qaQuantReaching, qaRect, qaRoom, qaScreen, qaText,
} from './qa-kit';
import { qaRandom } from './qa-kit-b';
import { qaFrameCanvas, qaGiltFrame } from './qa-kit-c';
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

/* ── the yield curve, labelled ────────────────────────────────────────────────────────────────── */

const SCREEN = { x: 22, y: 2, width: 44, height: 23 } as const;
/** The chart inside the screen, in scene pixels: the axes' corner, and the plot up and to its right. */
const AXES = { x: SCREEN.x + 7, y: SCREEN.y + 15 } as const;
const PLOT = { x: AXES.x + 1, y: SCREEN.y + 2, width: SCREEN.x + SCREEN.width - 3 - AXES.x, height: AXES.y - SCREEN.y - 2 } as const;

/** A curve's row in the plot at maturity m (0 is 1Y, the plot's last column 30Y), easing toward its long end. */
const curvePoints = (short: number, long: number): [number, number][] =>
  [...Array(PLOT.width)].map((_, m) => [PLOT.x + m, PLOT.y + Math.round(short + (long - short) * (1 - Math.exp(-m / 7)))] as [number, number]);
/** Normal: low at the short end, rising and levelling off. Inverted: high at the short end, falling. */
const NORMAL = curvePoints(11, 3);
const INVERTED = curvePoints(2, 8);

/** The recession light in the plot's top corner: unlit in the base, its glow a layer. */
const LIGHT = { x: PLOT.x + PLOT.width - 3, y: PLOT.y } as const;

/* ── the bond on the wall ──────────────────────────────────────────────────────────────────────── */

const CERT = { x: 0, y: 3, width: 22, height: 24 } as const;
const PAPER = qaFrameCanvas(CERT.width, CERT.height);

/** A coupon: a stub with the gold dot of the payment it is worth. */
const coupon: PixelSprite = { id: 'qa13-coupon', name: 'qa13-coupon', tags: ['scene', 'qa13'], rows: ['XXX', 'X.X', 'XgX', 'X.X', 'XXX'] };

/** The certificate's gold seal, in the paper's pixels. */
const SEAL = { x: 11, y: 7 } as const;

const certificate = qaCompose('qa13-certificate', CERT.width, CERT.height, [
  { sprite: qaGiltFrame('qa13-cert-frame', CERT.width, CERT.height, 'x'), x: 0, y: 0 },
  { sprite: qaText('qa13-bond', 'BOND', 'E'), x: PAPER.x, y: PAPER.y + 1 },
  { sprite: qaRect('qa13-rule', PAPER.width - 2, 1, 'X'), x: PAPER.x + 1, y: PAPER.y + 6 },
  { sprite: qaRect('qa13-line-a', 8, 1, 'X'), x: PAPER.x + 1, y: PAPER.y + 8 },
  { sprite: qaRect('qa13-line-b', 6, 1, 'X'), x: PAPER.x + 1, y: PAPER.y + 10 },
  { sprite: { id: 'qa13-seal', name: 'qa13-seal', tags: ['scene', 'qa13'], rows: ['.gGg.', 'gGyGg', 'GyyyG', 'gGyGg', '.gGg.'] }, x: PAPER.x + SEAL.x, y: PAPER.y + SEAL.y },
  { sprite: qaPath('qa13-perforation', PAPER.width, 1, [[0, 0], [PAPER.width - 1, 0]], 'X', [1, 1]), x: PAPER.x, y: PAPER.y + 12 },
  ...[0, 1, 2, 3].map((i) => ({ sprite: coupon, x: PAPER.x + i * 4, y: PAPER.y + 13 })),
]);

/* ── the reading table ─────────────────────────────────────────────────────────────────────────── */

/** A banker's lamp: the green glass shade on a brass arm. Its foot stands on the table's back edge. */
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

/** The lamp's pool of light on the table top. */
const pool: PixelSprite = {
  id: 'qa13-pool',
  name: 'qa13-pool',
  tags: ['scene', 'qa13'],
  rows: ['yyyyyyyyyyyyyyy', '.yyyyyyyyyyyyy.'],
};

/**
 * The price-yield seesaw, a brass desk toy: a beam on a fulcrum, the yield's percent sign on the end
 * that has gone up and a stack of gold coins, the bond's price, on the end that has gone down.
 */
const seesaw = qaCompose('qa13-seesaw', 17, 13, [
  { sprite: qaPath('qa13-beam-shade', 17, 13, [[0, 10], [16, 5]], 'g'), x: 0, y: 1 },
  { sprite: qaPath('qa13-beam', 17, 13, [[0, 10], [16, 5]], 'G'), x: 0, y: 0 },
  { sprite: qaText('qa13-yield', '%', 'w'), x: 14, y: 0 },
  { sprite: { id: 'qa13-coins', name: 'qa13-coins', tags: ['scene', 'qa13'], rows: ['yGg', 'OOO', 'yGg', 'OOO'] }, x: 0, y: 6 },
  { sprite: { id: 'qa13-fulcrum', name: 'qa13-fulcrum', tags: ['scene', 'qa13'], rows: ['...X...', '..XxD..', '.XxxDD.', 'DDDDDDD'] }, x: 5, y: 9 },
]);

/** The reading table: the kit desk's dress, cut to 36 wide. */
const TABLE = { x: 12, width: 36 } as const;
const table: PixelSprite = {
  id: 'qa13-table',
  name: 'qa13-table',
  tags: ['scene', 'qa13'],
  palette: QA_PALETTE,
  rows: [
    'O' + 'g'.repeat(TABLE.width - 3) + 'O.',
    ...[0, 1].map(() => 'O' + 'G'.repeat(21) + 'g'.repeat(TABLE.width - 24) + 'O.'),
    'Og' + 'G'.repeat(20) + 'g'.repeat(TABLE.width - 24) + 'O.',
    'O'.repeat(TABLE.width - 1) + '.',
    ...[0, 1].map(() => '.Og' + '.'.repeat(TABLE.width - 6) + 'Og.'),
    ...[0, 1].map(() => '.Og' + 'Z'.repeat(TABLE.width - 6) + 'Og.'),
    ...[0, 1, 2, 3, 4].map(() => '.OO' + '.'.repeat(TABLE.width - 6) + 'OO.'),
    '.ZZZ' + '.'.repeat(TABLE.width - 7) + 'ZZZ',
  ],
};

const LAMP_AT = { x: 14, y: 33 } as const;
const SEESAW_AT = { x: 29, y: 28 } as const;
/** The quant stands at the table's end, the raised hand pointing up at the inverted curve. */
const QUANT_AT = { x: TABLE.x + TABLE.width, y: 28 } as const;

const base = qaCompose('qa13-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: certificate, x: CERT.x, y: CERT.y },
  { sprite: bookshelf('qa13-shelf', 14, 44, 31), x: 66, y: 3 },
  { sprite: qaScreen('qa13-screen', SCREEN.width, SCREEN.height, { surface: 'K' }), x: SCREEN.x, y: SCREEN.y },
  { sprite: qaText('qa13-percent', '%', 'x'), x: SCREEN.x + 3, y: PLOT.y },
  { sprite: qaRect('qa13-y-axis', 1, AXES.y - PLOT.y + 1, 'X'), x: AXES.x, y: PLOT.y },
  { sprite: qaRect('qa13-x-axis', PLOT.width + 1, 1, 'X'), x: AXES.x, y: AXES.y },
  { sprite: qaText('qa13-short', '1Y', 'x'), x: AXES.x - 1, y: AXES.y + 1 },
  { sprite: qaText('qa13-long', '30Y', 'x'), x: PLOT.x + PLOT.width - 11, y: AXES.y + 1 },
  { sprite: qaPath('qa13-normal', 80, 60, NORMAL, 'n', [1, 1]), x: 0, y: 0 },
  { sprite: qaPath('qa13-inverted', 80, 60, INVERTED, 'R'), x: 0, y: 0 },
  { sprite: qaRect('qa13-light', 2, 2, 'r'), x: LIGHT.x, y: LIGHT.y },
  { sprite: table, x: TABLE.x, y: 40 },
  { sprite: pool, x: LAMP_AT.x - 1, y: 41 },
  { sprite: bankersLamp, x: LAMP_AT.x, y: LAMP_AT.y },
  { sprite: seesaw, x: SEESAW_AT.x, y: SEESAW_AT.y },
  { sprite: qaQuantReaching, x: QUANT_AT.x, y: QUANT_AT.y },
]);

/** Dust in the lamplight. */
const mote: PixelSprite = { id: 'qa13-mote', name: 'qa13-mote', tags: ['scene', 'qa13'], rows: ['y'] };

export const qa13Opener: SceneArt = {
  id: 'qa13-opener',
  label: "In a library a quant points up at a screen of the yield curve, percent against maturity from 1Y to 30Y, where today's red curve has inverted against the faint normal one and a recession light is on, beside a framed bond certificate with its coupons and a brass seesaw on the reading table tipping yield up and price down.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: { id: 'qa13-light-on', name: 'qa13-light-on', tags: ['scene', 'qa13'], rows: ['RR', 'RW'] }, x: LIGHT.x, y: LIGHT.y, motion: { kind: 'twinkle', periodMs: 1100, min: 0.15 } },
    { sprite: mote, x: LAMP_AT.x + 4, y: 38, motion: { kind: 'rise', amp: 5, periodMs: 2400 } },
    { sprite: mote, x: LAMP_AT.x + 9, y: 39, motion: { kind: 'rise', amp: 4, periodMs: 2000, phase: 0.5 } },
    { sprite: { id: 'qa13-seal-glint', name: 'qa13-seal-glint', tags: ['scene', 'qa13'], rows: ['W'] }, x: CERT.x + PAPER.x + SEAL.x + 2, y: CERT.y + PAPER.y + SEAL.y + 2, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.3, min: 0.1 } },
  ],
};

/**
 * Lesson 13's emblem: the yield curve on its axes, ticks along the maturities. The normal curve is
 * engraved, rising and levelling off; the inverted one falls across it in white.
 */
const emblemYieldCurve: PixelSprite = {
  id: 'qa13-emblem-yield-curve',
  name: 'qa13-emblem-yield-curve',
  tags: ['scene', 'qa13'],
  rows: [
    '............',
    '.O..........',
    '.Oyww.......',
    '.Oy..ww.....',
    '.Oy....OOOO.',
    '.Oy..OOOyyww',
    '.Oy.OOyy....',
    '.OyOOy......',
    '.OOOy.......',
    '.OOOOOOOOOO.',
    '..yOyOyOyOy.',
    '............',
  ],
};

export const qa13Finish: SceneArt = qaKeepsake(
  'qa13-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a yield curve on its axes, a rising normal curve crossed by a falling inverted one in white, with small sparkles around it.',
  emblemYieldCurve,
);

export const art: LessonArtSet = { opener: qa13Opener, backdrop: qaBackdrop, finish: qa13Finish };
