/**
 * Wealth Management lesson 16 (divorce and financial separation): its opener, the pathway backdrop
 * and its keepsake, as one set loaded on demand.
 *
 * The opener is the house's dining room: slate wallpaper over the kit's panelling, the curtained
 * window (wm-kit-a.ts) at the back, and a long table whose white cloth is cut in two, the halves
 * pulled apart over a strip of bare wood with a bold gold rope laid down it and hanging off the
 * front. The two parents stand at the far ends with their backs to the table, each turned away from
 * the other: the father on the right in his blue suit, the other parent on the left with long
 * auburn hair and a rose suit, colours the heir never wears. On one half of the cloth sits a model
 * of the family home; on the other, a padlocked steel box with eight gold coins behind its glass,
 * the retirement account. The lesson's hidden gap is that the two look equal on paper but the
 * account's tax is still owed, so three of its eight coins (about the 37% of a $500K 401(k) the
 * lesson shows going to tax) are red, and their glow pulses where they sit: the share is fixed,
 * owed once at withdrawal, never a leak. The model house's windows keep their light, the candles
 * flicker and a star twinkles in the window. The keepsake carries the balance from wm-kit-a.ts.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, wmStarDot, WM_INKS } from './wm-kit';
import { wmCandle, wmCandleFlame, wmEmblemScales, wmStripes, wmWainscot, wmWindow } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The table's top-left; the parting runs down its middle. */
const TABLE_X = 15;
const TABLE_Y = 38;

/** Where the model house and the account box stand on the two halves of the cloth. */
const HOUSE_X = 20;
const HOUSE_Y = 29;
const BOX_X = 49;
const BOX_Y = 26;

/** The cloth's width, the first column of the bare strip that parts it, and the strip's width. */
const TABLE_W = 50;
const PART = 22;
const PART_W = 6;

/** The rope's two columns, row by row: the light strand moves across, so it reads as a twist. */
const ROPE = ['yG', 'Gg', 'gG', 'Gy'];

/**
 * One row of the table: the left cloth, the bare strip with the rope down its middle, the right
 * cloth. `cloth` gives a cloth cell by column, `strip` the strip's two outer cells either side.
 */
function tableRow(j: number, cloth: (x: number) => string, strip: readonly [string, string]): string {
  return Array.from({ length: TABLE_W }, (_, x) => {
    if (x < PART || x >= PART + PART_W) return cloth(x);
    const k = x - PART;
    if (k === 0 || k === PART_W - 1) return strip[0];
    if (k === 1 || k === PART_W - 2) return strip[1];
    return ROPE[j % ROPE.length][k - 2];
  }).join('');
}

/** A cloth fold every seven columns, the cut edges either side of the strip shadowed. */
const drape = (x: number) => {
  if (x === TABLE_W - 1 || x === PART - 1) return 'X';
  if (x === PART + PART_W) return 'x';
  return x % 7 === 3 ? 'x' : 'w';
};

/**
 * The dining table: two halves of a white cloth seen from a little above, parted by a strip of
 * bare wood with the gold rope down it and over the front edge to a tassel, the drape with its
 * folds, the legs. 50x16.
 */
const table: PixelSprite = {
  id: 'wm16-opener-table',
  name: 'wm16-opener-table',
  tags: ['scene', 'wm16'],
  palette: WM_INKS,
  rows: [
    tableRow(0, (x) => (x === 0 ? 'x' : x === TABLE_W - 1 ? 'X' : 'w'), ['O', 'U']),
    tableRow(1, (x) => (x === TABLE_W - 1 ? 'x' : 'w'), ['O', 'U']),
    tableRow(2, (x) => (x === TABLE_W - 1 ? 'X' : 'x'), ['O', 'U']),
    ...Array.from({ length: 5 }, (_, j) => tableRow(3 + j, drape, ['K', 'O'])),
    tableRow(8, () => 'X', ['K', 'O']),
    `..UO${'.'.repeat(PART - 4)}..yG..${'.'.repeat(TABLE_W - PART - PART_W - 4)}UO..`,
    `..UO${'.'.repeat(PART - 4)}..gO..${'.'.repeat(TABLE_W - PART - PART_W - 4)}UO..`,
    ...Array.from({ length: 4 }, () => `..UO${'.'.repeat(TABLE_W - 8)}UO..`),
    `..KK${'.'.repeat(TABLE_W - 8)}KK..`,
  ],
};

/** A model of the family home: a red roof, white walls, lit windows, the door. 11x9. */
const modelHouse: PixelSprite = {
  id: 'wm16-opener-model-house',
  name: 'wm16-opener-model-house',
  tags: ['scene', 'wm16'],
  rows: [
    '....RRr....',
    '...RRRrr...',
    '..RRRRrrr..',
    '.RRRRRrrrr.',
    'rrrrrrrrrrr',
    '.wwGGwwGGx.',
    '.wwGGwwGGx.',
    '.wwwwOOwwx.',
    'XXXXXOOXXXX',
  ],
};

/**
 * The retirement account: a steel box with a gold padlock on its lid and eight gold coins behind
 * its glass, the three still owed in tax drawn red. 12x12.
 */
const accountBox: PixelSprite = {
  id: 'wm16-opener-account-box',
  name: 'wm16-opener-account-box',
  tags: ['scene', 'wm16'],
  rows: [
    '....DXXD....',
    '....X..X....',
    'xwwwyGGgwwwX',
    'xXXXGkGgXXXD',
    'xKKKgggOKKkD',
    'xKyGsRsRsRkD',
    'xKGgRrRrRrkD',
    'xKKKKKKKKKkD',
    'xKyGyGyGyGkD',
    'xKGgGgGgGgkD',
    'xKKKKKKKKKkD',
    'XkkkkkkkkkkD',
  ],
};

/** The father in profile, turned to our right, away from the table: blue suit, red tie. 7x13. */
const fatherTurned: PixelSprite = {
  id: 'wm16-opener-father-turned',
  name: 'wm16-opener-father-turned',
  tags: ['scene', 'wm16'],
  palette: WM_INKS,
  rows: [
    '..kkk..',
    '.kkkkk.',
    '.kkkCC.',
    '.kkCkCC',
    '..CCCU.',
    '...CU..',
    '..bBwR.',
    '.bBBBR.',
    '.bBBBb.',
    '.bBCBb.',
    '..bBb..',
    '..kk...',
    '..KKK..',
  ],
};

/**
 * The other parent in profile, turned to our left, away from the table: long auburn hair, a rose
 * suit over a white blouse. Neither colour is the heir's teal or sandy gold. 7x13.
 */
const partnerTurned: PixelSprite = {
  id: 'wm16-opener-partner-turned',
  name: 'wm16-opener-partner-turned',
  tags: ['scene', 'wm16'],
  palette: WM_INKS,
  rows: [
    '..2221.',
    '.222221',
    '.SS2221',
    'SkSS221',
    '.SSM221',
    '..SM21.',
    '.wFFF1.',
    '.wFFFf.',
    '.FFFFf.',
    '.FSFFf.',
    '..FFf..',
    '...kk..',
    '..KKk..',
  ],
};

const base = wmCompose('wm16-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1]]),
  ...wmStripes(80, 37, 'D', 'k', 8),
  ...wmWainscot(80),
  ...wmBands(80, [['K', 1], ['O', 2], ['U', 1], ['O', 2], ['U', 1], ['O', 2]]),
], [
  { sprite: wmWindow, x: 30, y: 6 },
  { sprite: table, x: TABLE_X, y: TABLE_Y },
  { sprite: modelHouse, x: HOUSE_X, y: HOUSE_Y },
  { sprite: accountBox, x: BOX_X, y: BOX_Y },
  { sprite: wmCandle, x: 32, y: 32 },
  { sprite: wmCandle, x: 44, y: 32 },
  { sprite: partnerTurned, x: 5, y: 41 },
  { sprite: fatherTurned, x: 68, y: 41 },
]);

/** The three owed coins lit up, laid over them: they pulse where they sit and never move. 6x2. */
const owedGlow: PixelSprite = {
  id: 'wm16-opener-owed-glow',
  name: 'wm16-opener-owed-glow',
  tags: ['scene', 'wm16'],
  blurb: 'The tax still owed on the account: three of its eight coins, glowing red in place.',
  rows: ['WsWsWs', 'sRsRsR'],
};

/** Lamplight brightening in the model house's two windows. */
const houseGlow: PixelSprite = {
  id: 'wm16-opener-house-glow',
  name: 'wm16-opener-house-glow',
  tags: ['scene', 'wm16'],
  rows: ['y...y'],
};

const flameLater = wmLater(wmCandleFlame, 'wm16-opener-flame-later', 2, 320);

export const wm16Opener: SceneArt = {
  id: 'wm16-opener',
  label: 'Two parents stand at the far ends of a dining table, turned away from each other, its white cloth parted down the middle by a gold rope, with a model house on one half and on the other a padlocked box of eight coins, three of them glowing red for the tax still owed.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: owedGlow, x: BOX_X + 4, y: BOX_Y + 5, motion: { kind: 'twinkle', periodMs: 2600, min: 0.1 } },
    { sprite: houseGlow, x: HOUSE_X + 3, y: HOUSE_Y + 5, motion: { kind: 'twinkle', periodMs: 3400, min: 0.3 } },
    { sprite: wmCandleFlame, x: 33, y: 29 },
    { sprite: flameLater, x: 45, y: 29 },
    { sprite: wmStarDot, x: 36, y: 9, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.3, min: 0.2 } },
  ],
};

export const wm16Finish: SceneArt = wmKeepsake(
  'wm16-finish',
  wmEmblemScales,
  'A green crest with a gold rim bearing a balance, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm16Opener, backdrop: wmBackdrop, finish: wm16Finish };
