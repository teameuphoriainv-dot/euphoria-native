/**
 * Quantitative Analysis lesson 8, Statistical Arbitrage: the pair and its spread, side by side.
 *
 * Two wall screens, because the trade is a pair, and both run over the same fifteen days. The left
 * one shows two prices that have tracked each other for years, red and blue, wiggling a few pixels
 * apart, until on the last four days they drift apart: the red leg rich, the blue leg cheap. The right
 * one is those same days as one line, the spread (the gap between the two, less its usual size), round
 * its long-run mean μ (gold, dashed) between the bands at two standard deviations: it wanders inside
 * them while the pair tracks, and climbs out past the upper band as the lines part, the signal to
 * sell the rich leg, buy the cheap one and wait for the spread to come back. The quant stands
 * between the screens pointing up at the breakout; on the credenza a red can and a blue can are the
 * pair the lesson trades. The data holds still. Only small layers move: the two prices' newest ticks
 * and the breakout glow, the signal light blinks, the open can fizzes, a leaf sways.
 * Keepsake: a wave swinging between two dotted bands, the spread's mean reversion.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { QA_PALETTE, qaCompose, qaKeepsake, qaPath, qaQuantReaching, qaRoom, qaScreen, qaText } from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

const LEFT = { x: 2, y: 2, width: 35, height: 26 } as const;
const RIGHT = { x: 43, y: 2, width: 35, height: 26 } as const;

/** Both screens plot the same days: one every 2 pixels from the screen's fifth column. */
const dayX = (screen: { x: number }, day: number) => screen.x + 4 + day * 2;

/* ── the pair ──────────────────────────────────────────────────────────────────────────────────── */

/**
 * The moves both prices share for eleven days, the red leg's own small wiggle round them, and how far
 * the blue leg's wiggle strays from the red's: that stray is the spread, and it keeps coming back.
 */
const COMMON = [16, 15, 16, 14, 13, 14, 12, 13, 14, 13, 12] as const;
const WIGGLE_A = [0, 0, -1, 0, 1, 1, 0, -1, -1, 0, 0] as const;
const STRAY = [0, 1, 2, 1, -1, -2, -1, 1, 2, 1, 0] as const;
/** Then four days apart: the red leg runs up (rich), the blue one down (cheap). */
const SPLIT_A = [-1, -2, -2, -3] as const;
const SPLIT_B = [1, 1, 2, 2] as const;
/** How far below the red line the blue one usually runs. */
const USUAL_GAP = 4;
const LAST = COMMON[COMMON.length - 1];

const PRICE_A = [...COMMON.map((y, d) => y + WIGGLE_A[d]), ...SPLIT_A.map((dy) => LAST + dy)];
const PRICE_B = [...COMMON.map((y, d) => y + USUAL_GAP + WIGGLE_A[d] + STRAY[d]), ...SPLIT_B.map((dy) => LAST + USUAL_GAP + dy)];
const DAYS = PRICE_A.length;
const pricePoints = (rows: readonly number[]) => rows.map((y, d) => [dayX(LEFT, d), y] as [number, number]);
const priceA = qaPath('qa8-price-a', 80, 60, pricePoints(PRICE_A), 'R');
const priceB = qaPath('qa8-price-b', 80, 60, pricePoints(PRICE_B), 'B');

/** The two prices' newest ticks, on the last day, in one still column (they glow, never move). */
const TICK_TOP = PRICE_A[DAYS - 1];
const ticks: PixelSprite = {
  id: 'qa8-ticks',
  name: 'qa8-ticks',
  tags: ['scene', 'qa8'],
  rows: [...Array(PRICE_B[DAYS - 1] - TICK_TOP + 1)].map((_, r) => (r === 0 || r === PRICE_B[DAYS - 1] - TICK_TOP ? 'W' : '.')),
};

/* ── the spread: the same days, the gap between the two less its usual size ────────────────────── */

const MEAN = 15;
const BAND = 5;
const SCALE = 2;
const SPREAD = PRICE_B.map((b, d) => b - PRICE_A[d] - USUAL_GAP);
const SPREAD_POINTS = SPREAD.map((s, d) => [dayX(RIGHT, d), MEAN - Math.round(s * SCALE)] as [number, number]);
const BREAKOUT = SPREAD_POINTS[DAYS - 1];

const across = (id: string, y: number, ch: string, dash: readonly [number, number]) =>
  qaPath(id, 80, 60, [[RIGHT.x + 3, y], [RIGHT.x + RIGHT.width - 3, y]], ch, dash);

/* ── the room ──────────────────────────────────────────────────────────────────────────────────── */

/** A low credenza under the left screen: a lit top, two doors with brass pulls. */
const credenza: PixelSprite = {
  id: 'qa8-credenza',
  name: 'qa8-credenza',
  tags: ['scene', 'qa8'],
  palette: QA_PALETTE,
  rows: [
    'gggggggggggggggggggggggg',
    'OOOOOOOOOOOOOOOOOOOOOOOO',
    'ODkkkkkkkkkDDkkkkkkkkkDO',
    'ODkkkkkkkkkDDkkkkkkkkkDO',
    'ODkkkkkkkyyDDyykkkkkkkDO',
    'ODkkkkkkkkkDDkkkkkkkkkDO',
    'ODkkkkkkkkkDDkkkkkkkkkDO',
    'OOOOOOOOOOOOOOOOOOOOOOOO',
    '.DD..................DD.',
    '.ZZZZZZZZZZZZZZZZZZZZZZ.',
  ],
};

/** The pair the lesson trades: a red can and a blue can, lit from the left, a label band round each. */
const redCan: PixelSprite = { id: 'qa8-can-red', name: 'qa8-can-red', tags: ['scene', 'qa8'], rows: ['.xX.', 'sRRr', 'sRRr', 'wwwx', 'sRRr', 'sRRr', '.rr.'] };
const blueCan: PixelSprite = { id: 'qa8-can-blue', name: 'qa8-can-blue', tags: ['scene', 'qa8'], rows: ['.xX.', 'BBBb', 'BBBb', 'wwwx', 'BBBb', 'BBBb', '.bb.'] };
const fizz: PixelSprite = { id: 'qa8-fizz', name: 'qa8-fizz', tags: ['scene', 'qa8'], rows: ['w', '.', 'x'] };

const plant: PixelSprite = {
  id: 'qa8-plant',
  name: 'qa8-plant',
  tags: ['scene', 'qa8'],
  blurb: 'A potted palm on the floor under the right screen.',
  palette: QA_PALETTE,
  rows: [
    '.mN.....Nm.',
    'mNNn...nNNm',
    '.nNNn.nNNn.',
    '...nNnNn...',
    '.mNnnNnnNm.',
    'mNn..n..nNm',
    '.....n.....',
    '..OOOOOOO..',
    '..OGGGGgO..',
    '...OGGgO...',
    '...OGGgO...',
    '...OOOOO...',
    '..ZZZZZZZ..',
  ],
};
const leaf: PixelSprite = { id: 'qa8-leaf', name: 'qa8-leaf', tags: ['scene', 'qa8'], rows: ['.m', 'mN'] };

/** The quant stands between the screens, the raised hand pointing up at the right one. */
const QUANT_AT = { x: 31, y: 28 } as const;
const CREDENZA_AT = { x: 3, y: 38 } as const;
const PLANT_AT = { x: 66, y: 35 } as const;

const base = qaCompose('qa8-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaScreen('qa8-left', LEFT.width, LEFT.height, { surface: 'K' }), x: LEFT.x, y: LEFT.y },
  { sprite: qaScreen('qa8-right', RIGHT.width, RIGHT.height, { surface: 'K' }), x: RIGHT.x, y: RIGHT.y },
  { sprite: priceB, x: 0, y: 0 },
  { sprite: priceA, x: 0, y: 0 },
  { sprite: across('qa8-upper', MEAN - BAND, 'r', [1, 1]), x: 0, y: 0 },
  { sprite: across('qa8-lower', MEAN + BAND, 'n', [1, 1]), x: 0, y: 0 },
  { sprite: across('qa8-mean', MEAN, 'y', [2, 1]), x: 0, y: 0 },
  { sprite: qaPath('qa8-spread', 80, 60, SPREAD_POINTS, 'w'), x: 0, y: 0 },
  { sprite: qaText('qa8-mu', 'μ', 'y'), x: RIGHT.x + 28, y: MEAN },
  { sprite: qaText('qa8-plus', '+2σ', 'R'), x: RIGHT.x + 3, y: MEAN - BAND - 6 },
  { sprite: qaText('qa8-minus', '-2σ', 'N'), x: RIGHT.x + 3, y: MEAN + BAND + 1 },
  { sprite: credenza, x: CREDENZA_AT.x, y: CREDENZA_AT.y },
  { sprite: redCan, x: CREDENZA_AT.x + 6, y: CREDENZA_AT.y - 7 },
  { sprite: blueCan, x: CREDENZA_AT.x + 12, y: CREDENZA_AT.y - 7 },
  { sprite: plant, x: PLANT_AT.x, y: PLANT_AT.y },
  { sprite: qaQuantReaching, x: QUANT_AT.x, y: QUANT_AT.y },
]);

export const qa8Opener: SceneArt = {
  id: 'qa8-opener',
  label: 'A quant stands between two wall screens pointing up at the right one: the left shows a red and a blue price moving together until they drift apart, and the right shows their spread wandering around a gold mean between two bands until it breaks out past the upper band, as a red can and a blue can stand on a credenza.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ticks, x: dayX(LEFT, DAYS - 1), y: TICK_TOP, motion: { kind: 'twinkle', periodMs: 1100, min: 0.3 } },
    { sprite: { id: 'qa8-breakout', name: 'qa8-breakout', tags: ['scene', 'qa8'], rows: ['WW', 'WW'] }, x: BREAKOUT[0] - 1, y: BREAKOUT[1] - 1, motion: { kind: 'twinkle', periodMs: 900, phase: 0.4, min: 0.25 } },
    { sprite: { id: 'qa8-signal', name: 'qa8-signal', tags: ['scene', 'qa8'], rows: ['R'] }, x: RIGHT.x + RIGHT.width - 4, y: RIGHT.y + RIGHT.height - 2, motion: { kind: 'twinkle', periodMs: 1300, min: 0.1 } },
    { sprite: fizz, x: CREDENZA_AT.x + 7, y: CREDENZA_AT.y - 11, motion: { kind: 'rise', amp: 3, periodMs: 1600 } },
    { sprite: leaf, x: PLANT_AT.x + 1, y: PLANT_AT.y - 2, motion: { kind: 'bob', amp: 1, periodMs: 2400 } },
  ],
};

/**
 * Lesson 8's emblem: the spread's mean reversion in small. Between two dotted white bands a bold wave
 * rises to the upper band, swings down to the lower one and turns back, as the right screen's spread
 * does once the trade is on.
 */
const emblemReversion: PixelSprite = {
  id: 'qa8-emblem-reversion',
  name: 'qa8-emblem-reversion',
  tags: ['scene', 'qa8'],
  rows: [
    '............',
    '.w.w.w.w.w..',
    '..OOOy......',
    '.OOyOOy.....',
    'OOy..OOy....',
    'Oy....OOy...',
    '.......OOy.O',
    '........OOOO',
    '.........OOy',
    '..........y.',
    '.w.w.w.w.w..',
    '............',
  ],
};

export const qa8Finish: SceneArt = qaKeepsake(
  'qa8-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a wave swinging between two dotted bands, with small sparkles around it.',
  emblemReversion,
);

export const art: LessonArtSet = { opener: qa8Opener, backdrop: qaBackdrop, finish: qa8Finish };
