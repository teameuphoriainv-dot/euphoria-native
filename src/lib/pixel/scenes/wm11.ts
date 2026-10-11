/**
 * Wealth Management lesson 11 (asset location and tax-efficient portfolios): its opener, the
 * pathway backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is the advisor's office: claret wallpaper over the kit's panelling, a long-case clock,
 * candles on two wall shelves, and over the table a gilt-framed map of the estate stuck with three
 * pins, blue, purple and green. On the table stand three chests in the same three colours: the
 * taxable account, the tax-deferred one and the tax-free one. The lesson is where each asset lives,
 * so the motion is the placing: the gold coin of a tax-efficient fund drops into the blue chest, the
 * silver bar of the bonds into the purple, the green sprout of the fastest grower into the green,
 * each chest's pin lighting on the map as it is filled, and all three shining once every asset is
 * home. The advisor points the way. The clock's pendulum swings (location pays over decades) and
 * the candles flicker. The keepsake carries a map pin.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, WM_INKS } from './wm-kit';
import { wmAdvisorPointing, wmCandle, wmCandleFlame, wmStripes, wmWainscot } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The map's top-left in the scene; its pins are placed from the parchment inside the frame. */
const MAP_X = 31;
const MAP_Y = 6;
const PARCHMENT_X = MAP_X + 3;
const PARCHMENT_Y = MAP_Y + 3;

/** The three chests stand on the table this far down, 14 apart from this left edge. */
const CHEST_X = 29;
const CHEST_Y = 35;

const CLOCK_X = 2;
const CLOCK_Y = 21;

/** The estate in ink on parchment: woods, the river, the lane to the house. 28x16. */
const PARCHMENT = [
  'SSSSSSSSSSSSSSSSSSSSSSBbSSSS',
  'SSnNSSSSSSSSSSSSSSSSSSBbSSSS',
  'SnNNnSSSSSSSSSSSSSSSSBbSSSSS',
  'SSnnSSSSSSSSSSSSSSSSBbSSSSSS',
  'SSSSSSSSSSSSSSSSSSSBbSSSSSSS',
  'SSSSSSSSSSSSSSSSSSBbSSSSnNSS',
  'SSSSSSSSSUUUSSSSSBbSSSSnNNnS',
  'SSSSSSSUUSSSUSSSBbSSSSSSnnSS',
  'SSSSSUUSSSSSwwSBbSSSSSSSSSSS',
  'SSSUUSSSSSSSXXBbSSSSSSSSSSSS',
  'SSUSSSSSSSSSSBbSSSSSSSSSSSSS',
  'SSSSSSSSSSSSBbSSSSSSSSnNSSSS',
  'SnNSSSSSSSSBbSSSSSSSSnNNnSSS',
  'nNNnSSSSSSBbSSSSSSSSSSnnSSSS',
  'SnnSSSSSSBbSSSSSSSSSSSSSSSSS',
  'SSSSSSSSBbSSSSSSSSSSSSSSSSSS',
];

/** The map in a gilt frame lit from the upper left. 34x22. */
const map: PixelSprite = {
  id: 'wm11-opener-map',
  name: 'wm11-opener-map',
  tags: ['scene', 'wm11'],
  palette: WM_INKS,
  rows: [
    'O'.repeat(34),
    `O${'y'.repeat(32)}O`,
    `Oy${'O'.repeat(30)}gO`,
    ...PARCHMENT.map((row) => `OyO${row}OgO`),
    `Oy${'O'.repeat(30)}gO`,
    `O${'g'.repeat(32)}O`,
    'O'.repeat(34),
  ],
};

/** The pins, by the chest they stand for: head inks and where the head sits on the parchment. */
const PINS: readonly { head: readonly [string, string]; at: readonly [number, number] }[] = [
  { head: ['Bb', 'bb'], at: [3, 6] },
  { head: ['qP', 'Pp'], at: [14, 11] },
  { head: ['mN', 'Nn'], at: [24, 2] },
];

const pinSprites: PixelSprite[] = PINS.map(({ head }, i) => ({
  id: `wm11-opener-pin-${String(i)}`,
  name: `wm11-opener-pin-${String(i)}`,
  tags: ['scene', 'wm11'],
  rows: [head[0], head[1], 'k.'],
}));

/**
 * A chest with its lid thrown back: the lid's edge and dark underside, the open mouth, a gold rim
 * and base band, a lock plate. `light` and `dark` are its colour. 12x9.
 */
function chest(id: string, light: string, dark: string): PixelSprite {
  const rows = [
    '.ZAAAAAAAAZ.',
    '.ZKKKKKKKKZ.',
    'ZKKKKKKKKKKZ',
    'yGGGGGGGGGGg',
    'AAAAAyGAAAAZ',
    'AZZZZGgZZZZZ',
    'AZZZZgOZZZZZ',
    'yGGGGGGGGGGg',
    'OOOOOOOOOOOO',
  ];
  return { id, name: id, tags: ['scene', 'wm11'], rows: rows.map((row) => row.replace(/A/g, light).replace(/Z/g, dark)) };
}

/** A library table seen from the front: a lit top, the apron, two legs. 46x12. */
const table: PixelSprite = {
  id: 'wm11-opener-table',
  name: 'wm11-opener-table',
  tags: ['scene', 'wm11'],
  palette: WM_INKS,
  rows: [
    `${'C'.repeat(45)}U`,
    `${'U'.repeat(45)}O`,
    'O'.repeat(46),
    'K'.repeat(46),
    ...Array.from({ length: 7 }, () => `.UO${'.'.repeat(40)}UO.`),
    `.KK${'.'.repeat(40)}KK.`,
  ],
};

/** A long-case clock: bonnet, white dial, a glazed trunk for the pendulum (a layer), plinth. 9x35. */
const clock: PixelSprite = {
  id: 'wm11-opener-clock',
  name: 'wm11-opener-clock',
  tags: ['scene', 'wm11'],
  palette: WM_INKS,
  rows: [
    '...yGg...',
    '..OCCUO..',
    '.OCCCCUO.',
    'OCCUUUUUO',
    'OCxwwwxUO',
    'OCwwkwwUO',
    'OCwwkkwUO',
    'OCxwwwxUO',
    'OCUUUUUUO',
    'OOOOOOOOO',
    '.OCUUUUO.',
    ...Array.from({ length: 14 }, () => '.OCKKKKO.'),
    '.OCUUUUO.',
    '.OCUUUUO.',
    'OOOOOOOOO',
    'OCUUUUUUO',
    'OCUOOOUUO',
    'OCUOOOUUO',
    'OCUUUUUUO',
    'OCUUUUUUO',
    'OOOOOOOOO',
    'KK.....KK',
  ],
};

/** A small wall shelf on a corbel, for a candle. 6x4. */
const shelf: PixelSprite = {
  id: 'wm11-opener-shelf',
  name: 'wm11-opener-shelf',
  tags: ['scene', 'wm11'],
  palette: WM_INKS,
  rows: ['CCCCCU', 'UUUUUO', '..UO..', '...O..'],
};

const base = wmCompose('wm11-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1], ['k', 1]]),
  ...wmStripes(80, 34, 'I', 'E', 7),
  ...wmWainscot(80),
  ...wmBands(80, [['K', 1], ['O', 3], ['U', 1], ['O', 3], ['U', 1], ['O', 2]]),
], [
  { sprite: map, x: MAP_X, y: MAP_Y },
  ...pinSprites.map((sprite, i) => ({ sprite, x: PARCHMENT_X + PINS[i].at[0], y: PARCHMENT_Y + PINS[i].at[1] })),
  { sprite: clock, x: CLOCK_X, y: CLOCK_Y },
  { sprite: shelf, x: 23, y: 22 },
  { sprite: wmCandle, x: 24, y: 16 },
  { sprite: shelf, x: 68, y: 22 },
  { sprite: wmCandle, x: 69, y: 16 },
  { sprite: table, x: 27, y: 44 },
  { sprite: chest('wm11-opener-chest-taxable', 'B', 'b'), x: CHEST_X, y: CHEST_Y },
  { sprite: chest('wm11-opener-chest-deferred', 'P', 'p'), x: CHEST_X + 14, y: CHEST_Y },
  { sprite: chest('wm11-opener-chest-free', 'N', 'n'), x: CHEST_X + 28, y: CHEST_Y },
  { sprite: wmAdvisorPointing, x: 13, y: 43 },
]);

/* ── the placing: tokens drop into their chests while the matching pin lights ─────────────────── */

/** The tokens and where each hangs over its chest, in the tokens layer's own pixels. */
const TOKENS: readonly { rows: readonly string[]; x: number }[] = [
  { rows: ['.yG.', 'yGGg', 'GGgg', '.gg.'], x: 4 },
  { rows: ['.wwx.', 'wxxxX', 'XXXXD'], x: 17 },
  { rows: ['Nm.mN', '.NnN.', '..n..', '..n..'], x: 31 },
];

/** A token's top in each stage of its drop: hanging, falling, sinking past the rim. */
const DROP: Readonly<Record<string, number>> = { hang: 1, fall: 4, sink: 7 };

type Stage = 'hang' | 'fall' | 'sink' | 'in' | 'gone';

/**
 * One frame of the tokens layer, 40x10, from (CHEST_X, CHEST_Y - 7). The layer stops at the chests'
 * mouths, so a sinking token is cut off at the gold rim as if it had gone inside. A token that
 * has just gone `in` leaves a sparkle at the mouth.
 */
function tokensFrame(stages: readonly Stage[]): string[] {
  const grid = wmBands(40, [['.', 10]]).map((row) => [...row]);
  const put = (x: number, y: number, ink: string) => {
    if (y >= 0 && y < 10 && x >= 0 && x < 40) grid[y][x] = ink;
  };
  stages.forEach((stage, i) => {
    if (stage === 'in') {
      put(14 * i + 5, 6, 'W');
      put(14 * i + 3, 8, 'y');
      put(14 * i + 8, 8, 'y');
      return;
    }
    if (stage === 'gone') return;
    const token = TOKENS[i];
    token.rows.forEach((row, j) => {
      [...row].forEach((ch, k) => {
        if (ch !== '.') put(token.x + k, DROP[stage] + j, ch);
      });
    });
  });
  return grid.map((row) => row.join(''));
}

const PLACING: readonly (readonly Stage[])[] = [
  ['hang', 'hang', 'hang'],
  ['fall', 'hang', 'hang'],
  ['sink', 'hang', 'hang'],
  ['in', 'hang', 'hang'],
  ['gone', 'fall', 'hang'],
  ['gone', 'sink', 'hang'],
  ['gone', 'in', 'hang'],
  ['gone', 'gone', 'fall'],
  ['gone', 'gone', 'sink'],
  ['gone', 'gone', 'in'],
  ['gone', 'gone', 'gone'],
  ['gone', 'gone', 'gone'],
];

/** Which pins shine in each frame of PLACING: the chest being filled, then all three. */
const SHINING: readonly (readonly number[])[] = [[], [0], [0], [0], [1], [1], [1], [2], [2], [2], [0, 1, 2], [0, 1, 2]];

const PLACING_MS = 450;

const tokens: PixelSprite = {
  id: 'wm11-opener-tokens',
  name: 'wm11-opener-tokens',
  tags: ['scene', 'wm11'],
  blurb: 'A coin, a silver bar and a sprout dropping one at a time into the chest each belongs in.',
  rows: tokensFrame(PLACING[0]),
  frames: PLACING.map(tokensFrame),
  frameMs: PLACING_MS,
};

/** The pins' layer covers the three heads from here, with a pixel of halo all round. 25x13. */
const PINS_LAYER_X = PARCHMENT_X + 2;
const PINS_LAYER_Y = PARCHMENT_Y + 1;
const HALO = ['.y..', 'yWw.', '.wWy', '..y.'];

function pinsFrame(lit: readonly number[]): string[] {
  const grid = wmBands(25, [['.', 13]]).map((row) => [...row]);
  for (const i of lit) {
    const [px, py] = PINS[i].at;
    HALO.forEach((row, j) => {
      [...row].forEach((ch, k) => {
        if (ch !== '.') grid[PARCHMENT_Y + py - PINS_LAYER_Y - 1 + j][PARCHMENT_X + px - PINS_LAYER_X - 1 + k] = ch;
      });
    });
  }
  return grid.map((row) => row.join(''));
}

/** Kept in step with the tokens: same frame count, same pace, both starting at mount. */
const pinGlow: PixelSprite = {
  id: 'wm11-opener-pin-glow',
  name: 'wm11-opener-pin-glow',
  tags: ['scene', 'wm11'],
  rows: pinsFrame([]),
  frames: SHINING.map(pinsFrame),
  frameMs: PLACING_MS,
};

/** The clock's pendulum leaning -1, 0 or 1 pixel at the bob. 4x14. */
function pendulumAt(lean: number): string[] {
  const at = (col: number, ink: string) => `${'.'.repeat(col)}${ink}${'.'.repeat(4 - col - ink.length)}`;
  return [
    ...Array.from({ length: 6 }, () => at(1, 'g')),
    ...Array.from({ length: 5 }, () => at(1 + lean, 'g')),
    at(1 + lean, 'yG'),
    at(1 + lean, 'Gg'),
    '....',
  ];
}

const pendulum: PixelSprite = {
  id: 'wm11-opener-pendulum',
  name: 'wm11-opener-pendulum',
  tags: ['scene', 'wm11'],
  rows: pendulumAt(0),
  frames: [pendulumAt(0), pendulumAt(1), pendulumAt(0), pendulumAt(-1)],
  frameMs: 500,
};

const flameLater = wmLater(wmCandleFlame, 'wm11-opener-flame-later', 2, 330);

export const wm11Opener: SceneArt = {
  id: 'wm11-opener',
  label: 'An advisor points at three chests on a table, blue, purple and green, as a coin, a silver bar and a green sprout each drop into their own chest beneath a wall map with three matching pins.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: tokens, x: CHEST_X, y: CHEST_Y - 7 },
    { sprite: pinGlow, x: PINS_LAYER_X, y: PINS_LAYER_Y },
    { sprite: pendulum, x: CLOCK_X + 3, y: CLOCK_Y + 11 },
    { sprite: wmCandleFlame, x: 25, y: 13 },
    { sprite: flameLater, x: 70, y: 13 },
  ],
};

/** A map pin: where each asset belongs. */
const emblemPin: PixelSprite = {
  id: 'wm11-emblem-pin',
  name: 'wm11-emblem-pin',
  tags: ['scene', 'wm11'],
  rows: [
    '....yyGGgg....',
    '...yyGGGGGg...',
    '..yGGGGGGGGg..',
    '..yGGGOOGGGg..',
    '..yGGOwwOGGg..',
    '..yGGOwwOGgg..',
    '..yGGGOOGGgg..',
    '...yGGGGGGg...',
    '....GGGGGg....',
    '.....GGgg.....',
    '......Gg......',
    '......gO......',
    '....OOOOOO....',
  ],
};

export const wm11Finish: SceneArt = wmKeepsake(
  'wm11-finish',
  emblemPin,
  'A green crest with a gold rim bearing a map pin, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm11Opener, backdrop: wmBackdrop, finish: wm11Finish };
