/**
 * Corporate Finance lesson 17, Corporate Bonds & Debt Markets: lend to the company, collect the
 * coupons.
 *
 * Opener: the company's bond certificate framed on the wall: engraved green border, the orchid
 * diamond, the red seal, and a strip of coupons along its foot. A bondholder in a green suit holds
 * out a hand, and the strip pays: its last coupon is clipped out, falls, and lands in his palm as a
 * gold coin. Against the wall at the left leans the lesson's yield ladder, where height is yield: a
 * blue Treasury tag on a low rung with one coin, then a rung higher our own bond's tag (the same
 * green border, orchid diamond and red seal as the certificate, investment grade) with two, and two
 * rungs higher again a cracked red junk tag with three. The step up from the Treasury rung is the
 * credit spread. Only small layers move: the falling coupon, the finance sign lighting, a glint on
 * the seal, a glint on our coins, the junk tag's crack.
 *
 * Keepsake: a bond certificate with its last coupon turned to a coin.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { cfCoin, cfCompose, cfHall, cfPlaque, cfShadowShort, cfSignFinance } from './cf-kit';
import { cfExec, cfRecolor } from './cf-kit-a';
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

/** The bondholder: the other chief recoloured into a green suit and a gold tie, a look of his own. */
const bondholder = cfRecolor(cfExec, 'cf17-bondholder', { B: 'N', b: 'n', r: 'G' }, 'A silver-haired bondholder in a green suit with one arm held out.');

/**
 * The yield ladder's geometry: steel rails 15 wide from the floor up, a rung every 7 pixels. Height
 * is yield, so the rung a bond sits on is its yield: 7 pixels to about 1.3 per cent, which puts
 * Treasuries on the rung at 4, investment grade on the next at about 5.3, and junk two rungs higher
 * at 8, inside the lesson's 7 to 9.
 */
const LADDER = { x: 0, top: 5, w: 15, rungEvery: 7, floor: 56 } as const;
const rungY = (n: number) => LADDER.floor - LADDER.rungEvery * n;
const RUNG = { treasury: 3, ours: 4, junk: 6 } as const;

/** The bond tags, six by five: border colour says who borrowed, the face says how safe. */
const TAG_TREASURY: readonly string[] = ['bbbbbb', 'bwwwwb', 'bwBBwb', 'bwwwwb', 'bbbbbb'];
const TAG_OURS: readonly string[] = ['nnnnnn', 'nwPwwn', 'nPqPrn', 'nwPwwn', 'nnnnnn'];
const TAG_JUNK: readonly string[] = ['rrrrrr', 'rwwkwr', 'rwkwwr', 'rwwkwr', 'rrrrrr'];
/** One coupon coin seen edge on; a stack is this repeated. */
const COIN_EDGE: readonly string[] = ['OyGO', 'OggO'];

/**
 * The ladder with its three bonds on their rungs: each tag on the left of its rung, its coupons
 * stacked on the right, one coin, two, three. Computed, so a tag can only ever sit on a rung.
 */
const ladder: PixelSprite = {
  id: 'cf17-ladder',
  name: 'cf17-ladder',
  tags: ['scene', 'cf17'],
  blurb: 'A steel ladder with a blue, a green and a cracked red bond tag on rising rungs, each with more coins.',
  rows: (() => {
    const h = LADDER.floor - LADDER.top + 1;
    const grid = Array.from({ length: h }, () => Array.from({ length: LADDER.w }, () => '.'));
    const put = (x: number, y: number, ch: string) => {
      const row = grid[y - LADDER.top];
      if (row && x >= 0 && x < LADDER.w) row[x] = ch;
    };
    const stamp = (rows: readonly string[], x: number, y: number) => {
      rows.forEach((row, j) => [...row].forEach((ch, i) => ch !== '.' && put(x + i, y + j, ch)));
    };
    for (let y = LADDER.top; y <= LADDER.floor; y += 1) {
      put(0, y, 'x');
      put(1, y, 'X');
      put(LADDER.w - 2, y, 'x');
      put(LADDER.w - 1, y, 'X');
    }
    [0, 1, LADDER.w - 2, LADDER.w - 1].forEach((x) => put(x, LADDER.floor, 'D'));
    for (let n = 1; rungY(n) > LADDER.top; n += 1) {
      for (let x = 2; x < LADDER.w - 2; x += 1) put(x, rungY(n), 'x');
    }
    const bond = (n: number, tag: readonly string[], coins: number) => {
      stamp(tag, 2, rungY(n) - tag.length);
      for (let c = 0; c < coins; c += 1) stamp(COIN_EDGE, 9, rungY(n) - COIN_EDGE.length * (c + 1));
    };
    bond(RUNG.treasury, TAG_TREASURY, 1);
    bond(RUNG.ours, TAG_OURS, 2);
    bond(RUNG.junk, TAG_JUNK, 3);
    return grid.map((row) => row.join(''));
  })(),
};

const base = cfCompose('cf17-opener-base', cfHall, [
  [certificate, CERT.x, CERT.y],
  [cfPlaque, 66, 6],
  [signFinanceDim, 68, 8],
  [cfShadowShort, 0, 56],
  [ladder, LADDER.x, LADDER.top],
  [cfShadowShort, 68, 56],
  [bondholder, 60, 30],
], 'The still hall: the bond certificate, the finance plaque, the yield ladder, the bondholder.');

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
/** The junk tag's crack, lit red: it flickers, the risk the extra yield pays for. */
const crack: PixelSprite = { id: 'cf17-opener-crack', name: 'cf17-opener-crack', tags: ['scene', 'cf17'], rows: ['.R', 'R.', '.R'] };

export const cf17Opener: SceneArt = {
  id: 'cf17-opener',
  label: 'A framed bond certificate hangs on the wall and its last coupon is clipped and falls as a gold coin into the hand of a bondholder in a green suit, while a yield ladder leans beside it with a blue Treasury tag on a low rung with one coin, our green bond tag a rung higher with two, and a cracked red junk tag near the top with three.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pay, x: LAST.x - 1, y: LAST.y - 1 },
    { sprite: cfSignFinance, x: 68, y: 8, motion: { kind: 'twinkle', periodMs: 3200, min: 0.4 } },
    { sprite: glint, x: 47, y: 16, motion: { kind: 'twinkle', periodMs: 2500, min: 0 } },
    { sprite: glint, x: LADDER.x + 9, y: rungY(RUNG.ours) - 5, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.4, min: 0 } },
    { sprite: crack, x: LADDER.x + 4, y: rungY(RUNG.junk) - 4, motion: { kind: 'twinkle', periodMs: 1900, min: 0 } },
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
