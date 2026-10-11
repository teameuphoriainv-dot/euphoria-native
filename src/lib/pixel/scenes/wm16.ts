/**
 * Wealth Management lesson 16 (divorce and financial separation): its opener, the pathway backdrop
 * and its keepsake, as one set loaded on demand.
 *
 * The opener is the house's dining room: slate wallpaper over the kit's panelling, the curtained
 * window (wm-kit-a.ts) at the back, and a long table in a white cloth with a gold cord laid down
 * its middle. The two parents stand at either end. On one side of the cord sits a model house, on
 * the other a money bag: the lesson's hidden gap, a home and a retirement account that look equal
 * on paper but are not, because the account's tax is still owed. So the motion is red coins
 * slipping off the money bag and fading, while the model house's windows keep their light. The
 * candles flicker and a star twinkles in the window. The keepsake carries the balance from
 * wm-kit-a.ts, which this lesson shares with lesson 8, as the plan sets out.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, wmMoneyBag, wmParent, wmStarDot, WM_INKS } from './wm-kit';
import { wmCandle, wmCandleFlame, wmEmblemScales, wmStripes, wmWainscot, wmWindow } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The table's top-left; the cord runs down its middle. */
const TABLE_X = 15;
const TABLE_Y = 38;

/** Where the model house and the money bag stand on the cloth. */
const HOUSE_X = 20;
const HOUSE_Y = 29;
const BAG_X = 50;
const BAG_Y = 28;

/** The cloth's width, and the column of the gold cord that parts it. */
const TABLE_W = 50;
const CORD = 25;

/**
 * The dining table under a white cloth: the top seen from a little above, the cord down its middle,
 * the drape with its folds, the legs. 50x16.
 */
const table: PixelSprite = {
  id: 'wm16-opener-table',
  name: 'wm16-opener-table',
  tags: ['scene', 'wm16'],
  palette: WM_INKS,
  rows: [
    `x${'w'.repeat(CORD - 1)}G${'w'.repeat(TABLE_W - CORD - 2)}X`,
    `${'w'.repeat(CORD)}G${'w'.repeat(TABLE_W - CORD - 2)}x`,
    `${'x'.repeat(CORD)}g${'x'.repeat(TABLE_W - CORD - 2)}X`,
    ...Array.from({ length: 5 }, () =>
      Array.from({ length: TABLE_W }, (_, x) => {
        if (x === CORD) return 'g';
        if (x === TABLE_W - 1) return 'X';
        return x % 7 === 3 ? 'x' : 'w';
      }).join(''),
    ),
    `${'X'.repeat(CORD)}O${'X'.repeat(TABLE_W - CORD - 1)}`,
    ...Array.from({ length: 6 }, () => `..UO${'.'.repeat(TABLE_W - 8)}UO..`),
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

/** The other parent: long auburn hair, a teal suit over a white blouse. 7x13. */
const partner: PixelSprite = {
  id: 'wm16-opener-partner',
  name: 'wm16-opener-partner',
  tags: ['scene', 'wm16'],
  palette: WM_INKS,
  rows: [
    '..Ogg..',
    '.OgggO.',
    '.OSSSO.',
    'OSkSkMO',
    'O.SSM.O',
    'OtTwTtO',
    'tTTwTTt',
    'TTTTTtt',
    'STTTTtM',
    '.tTTtt.',
    '.kk.kk.',
    '.kk.kk.',
    '.KK.KK.',
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
  { sprite: wmMoneyBag, x: BAG_X, y: BAG_Y },
  { sprite: wmCandle, x: 33, y: 32 },
  { sprite: wmCandle, x: 44, y: 32 },
  { sprite: partner, x: 6, y: 41 },
  { sprite: wmParent, x: 67, y: 41 },
]);

/** A coin in red: tax still owed on the account, slipping away. 2x2. */
const taxCoin: PixelSprite = {
  id: 'wm16-opener-tax-coin',
  name: 'wm16-opener-tax-coin',
  tags: ['scene', 'wm16'],
  rows: ['Rr', 'rI'],
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
  label: 'Two parents stand at either end of a dining table parted down the middle by a gold cord, a model house on one side and a money bag on the other, red tax coins slipping away from the bag.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: taxCoin, x: BAG_X + 2, y: BAG_Y - 1, motion: { kind: 'rise', amp: 10, periodMs: 2800, phase: 0 } },
    { sprite: taxCoin, x: BAG_X + 5, y: BAG_Y, motion: { kind: 'rise', amp: 11, periodMs: 2800, phase: 0.5 } },
    { sprite: houseGlow, x: HOUSE_X + 3, y: HOUSE_Y + 5, motion: { kind: 'twinkle', periodMs: 3400, min: 0.3 } },
    { sprite: wmCandleFlame, x: 34, y: 29 },
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
