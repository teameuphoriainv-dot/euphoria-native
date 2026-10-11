/**
 * Corporate Finance lesson 17, Corporate Bonds & Debt Markets: lend to the company, collect the
 * coupons.
 *
 * Opener: the company's bond certificate framed on the wall: engraved green border, the orchid
 * diamond, the red seal, and a strip of coupons along its foot. The CFO presents it; at the other
 * side an investor holds out a hand, and coupon by coupon the strip pays: one is clipped out,
 * falls, and lands in his palm as a gold coin. The finance plaque and a lamp sit either side.
 * Only small layers move: the falling coupon, the finance sign lighting, a glint on the seal, the
 * lamp.
 *
 * Keepsake: a bond certificate with its last coupon turned to a coin.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { cfCoin, cfCompose, cfHall, cfPlaque, cfSconce, cfShadowShort, cfSignFinance } from './cf-kit';
import { cfCfoReach, cfExec, cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

const PAPER = { w: 37, coupons: 6 } as const;

/** One coupon's face, five wide: paper, the gold of the interest it pays, paper. */
const COUPON: readonly string[] = ['wwwww', 'wyGgw', 'wwwww', 'wwwww'];

/**
 * The certificate in its frame, 41x25: an engraved green border, a title bar, the orchid diamond
 * between lines of text, the red seal, then a fold and six coupons divided by perforations.
 */
const certificate: PixelSprite = {
  id: 'cf17-certificate',
  name: 'cf17-certificate',
  tags: ['scene', 'cf17'],
  blurb: 'A framed bond certificate with coupons along its foot.',
  rows: (() => {
    const inner: string[] = [
      'w'.repeat(33),
      `${'w'.repeat(9)}${'n'.repeat(15)}${'w'.repeat(9)}`,
      'w'.repeat(33),
      `w${'X'.repeat(10)}${'w'.repeat(5)}P${'w'.repeat(5)}${'X'.repeat(10)}w`,
      `${'w'.repeat(15)}PqP${'w'.repeat(15)}`,
      `w${'X'.repeat(10)}${'w'.repeat(3)}PqPPp${'w'.repeat(3)}${'X'.repeat(10)}w`,
      `${'w'.repeat(15)}PPp${'w'.repeat(15)}`,
      `w${'X'.repeat(10)}${'w'.repeat(5)}p${'w'.repeat(5)}${'X'.repeat(10)}w`,
      `${'w'.repeat(25)}wrRrw${'w'.repeat(3)}`,
      `w${'X'.repeat(20)}${'w'.repeat(4)}rRRRr${'w'.repeat(3)}`,
      `${'w'.repeat(25)}rRRrr${'w'.repeat(3)}`,
      `w${'X'.repeat(14)}${'w'.repeat(10)}wrrrw${'w'.repeat(3)}`,
    ];
    const coupons = COUPON.map((face) => `x${Array.from({ length: PAPER.coupons }, () => face).join('x')}x`);
    const paper: string[] = [
      'w'.repeat(PAPER.w),
      `w${'n'.repeat(PAPER.w - 2)}w`,
      ...inner.map((row) => `wn${row}nw`),
      `w${'n'.repeat(PAPER.w - 2)}w`,
      'x'.repeat(PAPER.w),
      ...coupons,
      'w'.repeat(PAPER.w),
    ];
    return [
      `.${'O'.repeat(PAPER.w + 2)}.`,
      `O${'g'.repeat(PAPER.w + 2)}O`,
      ...paper.map((row) => `Og${row}aO`),
      `O${'a'.repeat(PAPER.w + 2)}O`,
      `.${'O'.repeat(PAPER.w + 2)}.`,
    ];
  })(),
};

const CERT = { x: 17, y: 4 } as const;
/** The last coupon, where the next payment comes from: its top-left in the scene. */
const LAST = { x: CERT.x + 2 + 1 + 6 * (PAPER.coupons - 1), y: CERT.y + 2 + 16 } as const;

/** The finance sign dimmed, for the base; the lit sign above it is a layer. */
const signFinanceDim = cfRecolor(cfSignFinance, 'cf17-sign-finance-dim', { B: 'b' });

const base = cfCompose('cf17-opener-base', cfHall, [
  [certificate, CERT.x, CERT.y],
  [cfPlaque, 66, 6],
  [signFinanceDim, 68, 8],
  [cfSconce, 6, 20],
  [cfShadowShort, 3, 56],
  [cfCfoReach, 0, 30],
  [cfShadowShort, 68, 56],
  [cfExec, 60, 30],
], 'The still hall: the bond certificate, the finance plaque, a lamp, the CFO and the investor.');

const DROP = { w: 14, h: 25 } as const;

/**
 * One frame of a payment, in a box whose (1, 1) is the last coupon: the coupon's slot cut out (a
 * dark hole) and `piece` at (x, y), or nothing at all, which shows the strip whole.
 */
function payAt(piece: readonly string[] | null, x: number, y: number, hole: boolean): string[] {
  const grid = Array.from({ length: DROP.h }, () => Array.from({ length: DROP.w }, () => '.'));
  const stamp = (rows: readonly string[], sx: number, sy: number) => {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const line = grid[sy + j];
        if (line && ch !== '.') line[sx + i] = ch;
      });
    });
  };
  if (hole) stamp(COUPON.map(() => 'kkkkk'), 1, 1);
  if (piece) stamp(piece, x, y);
  return grid.map((row) => row.join(''));
}

/**
 * A coupon clipped: the slot goes dark, the coupon drops, turns into a coin on the way down and
 * lands in the investor's hand, which closes over it; then the strip is whole for the next one.
 * Its still is the whole strip.
 */
const pay: PixelSprite = {
  id: 'cf17-opener-pay',
  name: 'cf17-opener-pay',
  tags: ['scene', 'cf17'],
  blurb: 'A coupon dropping off the bond and turning into a coin.',
  rows: payAt(null, 0, 0, false),
  frames: [
    payAt(null, 0, 0, false),
    payAt(null, 0, 0, false),
    payAt(COUPON, 2, 5, true),
    payAt(COUPON, 3, 9, true),
    payAt(cfCoin.rows, 5, 13, true),
    payAt(cfCoin.rows, 7, 16, true),
    payAt(cfCoin.rows, 9, 19, true),
    payAt(cfCoin.rows, 10, 20, true),
    payAt(null, 0, 0, true),
  ],
  frameMs: 280,
};

const glint: PixelSprite = { id: 'cf17-opener-glint', name: 'cf17-opener-glint', tags: ['scene', 'cf17'], rows: ['.w.', 'wWw', '.w.'] };
const lampGlow: PixelSprite = { id: 'cf17-opener-lamp', name: 'cf17-opener-lamp', tags: ['scene', 'cf17'], rows: ['.yyy.', 'yyyyG'] };

export const cf17Opener: SceneArt = {
  id: 'cf17-opener',
  label: 'A framed bond certificate hangs on the wall, and one by one its coupons are clipped and fall as gold coins into the hand of an investor, while the finance chief presents it.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pay, x: LAST.x - 1, y: LAST.y - 1 },
    { sprite: cfSignFinance, x: 68, y: 8, motion: { kind: 'twinkle', periodMs: 3200, min: 0.4 } },
    { sprite: glint, x: 47, y: 16, motion: { kind: 'twinkle', periodMs: 2500, min: 0 } },
    { sprite: lampGlow, x: 6, y: 20, motion: { kind: 'twinkle', periodMs: 2900, min: 0.5 } },
  ],
};

/** Lesson 17's emblem: a bond certificate, its seal, its coupons, and the last coupon a coin. */
const emblemBond: PixelSprite = {
  id: 'cf17-emblem-bond',
  name: 'cf17-emblem-bond',
  tags: [],
  blurb: 'A bond certificate with a red seal, three coupons and a gold coin.',
  rows: [
    'wwwwwwwwwwwwwww.',
    'wnnnnnnnnnnnnnw.',
    'wnwwwwwwwwwwwnw.',
    'wnwwnnnnnnnwwnw.',
    'wnwwwwwwwwwwwnw.',
    'wnwXXXXXwwwwwnw.',
    'wnwwwwwwwwwwwnw.',
    'wnwXXXXwwrRrwnw.',
    'wnwwwwwwwRRrwnw.',
    'wnwXXXwwwrrrwnw.',
    'wnnnnnnnnnnnnnw.',
    'xxxxxxxxxxxxxxx.',
    'wwwxwwwxwwwx.OO.',
    'wGwxwGwxwGwxOyGO',
    'wwwxwwwxwwwxOGgO',
    'xxxxxxxxxxxx.OO.',
  ],
};

export const cf17Finish = cfKeepsake(
  'cf17-finish',
  'A crystal award on a gold stand with a bond certificate inside, its last coupon turned into a gold coin, and small sparkles around it.',
  emblemBond,
);

export const art: LessonArtSet = { opener: cf17Opener, backdrop: cfBackdrop, finish: cf17Finish };
