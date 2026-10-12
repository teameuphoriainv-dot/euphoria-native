/**
 * Wealth Management lesson 9 (working with financial advisors): its opener, the pathway backdrop
 * and its keepsake, as one set loaded on demand.
 *
 * The opener is the house's drawing room: plum wallpaper pinstriped in orchid over the kit's
 * panelling, the curtained window, a marble fireplace with candles and a clock on the mantel, and
 * over it a gilt-framed painting of the house of five pillars. The lesson is who is on your side
 * and what it costs, so the advisor stands AT the father's side, not across a deal from him, and
 * points to the lesson's own chart on a marble table: two coin stacks that start level, a low-fee
 * stack nearest the family and a high-fee stack, with a fee jar at the end. What moves: each tick
 * of the mantel clock is a year; both stacks gain a coin, but every other year the high-fee
 * stack's coin is skimmed off into the jar, so the low-fee stack ends visibly taller. The stacks
 * only ever step up (the skim is a separate coin in flight, never a coin taken off a stack), and
 * the loop starts again after a held rest. The fire crackles, the candles flicker, firelight
 * breathes on the hearth, a star twinkles in the window. The keepsake carries a coin with a bite
 * taken out of it: the fee that quietly eats a fortune.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, wmParent, wmStarDot, WM_INKS } from './wm-kit';
import { wmCandle, wmCandleFlame, wmStripes, wmWainscot, wmWindow } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The fireplace surround's top-left in the scene; the fire, logs and hearth glow are placed from it. */
const HEARTH_X = 47;
const HEARTH_Y = 42;
const FRAME_W = 20;
const FRAME_H = 24;

/** A marble surround: a lintel lit along its top, two pilasters, the dark opening. 24x12. */
const surround: PixelSprite = {
  id: 'wm9-opener-surround',
  name: 'wm9-opener-surround',
  tags: ['scene', 'wm9'],
  rows: [
    'xwwwwwwwwwwwwwwwwwwwwwwX',
    'xwxxxxxxxxxxxxxxxxxxxxxD',
    'xXXXXXXXXXXXXXXXXXXXXXXD',
    ...Array.from({ length: 9 }, () => `xwxX${'K'.repeat(16)}xwXD`),
  ],
};

const mantel: PixelSprite = {
  id: 'wm9-opener-mantel',
  name: 'wm9-opener-mantel',
  tags: ['scene', 'wm9'],
  rows: [`x${'w'.repeat(26)}X`, `D${'X'.repeat(26)}D`],
};

const hearth: PixelSprite = {
  id: 'wm9-opener-hearth',
  name: 'wm9-opener-hearth',
  tags: ['scene', 'wm9'],
  rows: [`${'x'.repeat(29)}X`, 'D'.repeat(30)],
};

/** Two logs on the grate. 12x2. */
const logs: PixelSprite = {
  id: 'wm9-opener-logs',
  name: 'wm9-opener-logs',
  tags: ['scene', 'wm9'],
  palette: WM_INKS,
  rows: ['OUUCUUUCUUO.', '.OOOOOOOOOO.'],
};

/** A gilt bracket clock. 6x7. */
const clock: PixelSprite = {
  id: 'wm9-opener-clock',
  name: 'wm9-opener-clock',
  tags: ['scene', 'wm9'],
  rows: [
    '..yG..',
    '.yGGg.',
    'yGwwGg',
    'Gwkwwg',
    'Gwwkkg',
    'gGwwgO',
    '.OOOO.',
  ],
};

/** One pixel of a gilt frame three deep: lit gold on the top and left, shaded on the bottom and right. */
function frameInk(i: number, j: number): string {
  const edges = [i, j, FRAME_W - 1 - i, FRAME_H - 1 - j];
  const d = Math.min(...edges);
  if (d >= 3) return '.';
  if (d === 2) return 'O';
  const lit = edges.indexOf(d) < 2;
  if (d === 0) return lit ? 'y' : 'O';
  return lit ? 'G' : 'g';
}

/** The painting: the house of five pillars by night, five two-pixel columns across its width. 14x18. */
const painting: PixelSprite = {
  id: 'wm9-opener-painting',
  name: 'wm9-opener-painting',
  tags: ['scene', 'wm9'],
  palette: WM_INKS,
  rows: [
    'KKKKKKKKKKKKKK',
    'KKKKKKKKKKKxKK',
    'KKKKKKxwKKKKKK',
    'KKKKxxwwXXKKKK',
    'KKxxwwwwwwXXKK',
    'xxwwwwwwwwwwXX',
    'DXXXXXXXXXXXXD',
    'xXOxXOxXOxXOxX',
    'xXOxXOxXOxXOxX',
    'xXOxXOxXOxXOxX',
    'xXOxXOxXOxXOxX',
    'xXOxXOxXOxXOxX',
    'xwwwwwwwwwwwwX',
    'DXXXXXXXXXXXXD',
    'hhhhhhhhhhhhhh',
    'hHhhhhhhhhhhHh',
    'hhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhh',
  ],
};

const portrait = wmCompose('wm9-opener-portrait', wmBands(FRAME_W, [['.', FRAME_H]]), [
  { sprite: painting, x: 3, y: 3 },
  {
    sprite: {
      id: 'wm9-opener-portrait-frame',
      name: 'wm9-opener-portrait-frame',
      tags: ['scene', 'wm9'],
      rows: Array.from({ length: FRAME_H }, (_, j) => Array.from({ length: FRAME_W }, (_, i) => frameInk(i, j)).join('')),
    },
    x: 0,
    y: 0,
  },
]);

/** An orchid rug with a gold border. 40x4. */
const rug: PixelSprite = {
  id: 'wm9-opener-rug',
  name: 'wm9-opener-rug',
  tags: ['scene', 'wm9'],
  rows: [
    `g${'G'.repeat(38)}g`,
    `g${Array.from({ length: 38 }, (_, x) => (x % 6 === 2 ? 'p' : 'E')).join('')}g`,
    `g${Array.from({ length: 38 }, (_, x) => (x % 6 === 5 ? 'p' : 'E')).join('')}g`,
    `O${'g'.repeat(38)}O`,
  ],
};

/**
 * The advisor without the briefcase, beside the father, the right arm raised to point up and to our
 * left at the stacks. Drawn rather than mirrored, so the light still falls from the upper left. 12x13.
 */
const advisorPointingLeft: PixelSprite = {
  id: 'wm9-opener-advisor-pointing',
  name: 'wm9-opener-advisor-pointing',
  tags: ['scene', 'wm9'],
  palette: WM_INKS,
  rows: [
    '.......kkk..',
    '......kkkkk.',
    '......kSSSk.',
    '......SkSkM.',
    'SS.....SSM..',
    '.XX...XwGwX.',
    '...XXXxXGXXD',
    '......XXGXXD',
    '......XXXXDM',
    '......XXXXD.',
    '......kk.kk.',
    '......kk.kk.',
    '......KK.KK.',
  ],
};

/** A low marble-topped table on gilt legs, for the stacks. 22x9. */
const table: PixelSprite = {
  id: 'wm9-opener-table',
  name: 'wm9-opener-table',
  tags: ['scene', 'wm9'],
  rows: [
    `x${'w'.repeat(20)}X`,
    `D${'X'.repeat(20)}D`,
    '.yGg............yGg..',
    '..Gg.............Gg..',
    '..Gg.............Gg..',
    '..Gg.............Gg..',
    '..Gg.............Gg..',
    '.yGgg...........yGgg.',
    '.OOOO...........OOOO.',
  ].map((row) => row.padEnd(22, '.')),
};

/** The table's top-left; the stacks stand on it. Each stack's coins sit on the row above its top. */
const TABLE_X = 1;
const TABLE_Y = 47;
const CLOCK_X = 56;
const CLOCK_Y = 33;

const base = wmCompose('wm9-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1]]),
  ...wmStripes(80, 40, 'k', 'E', 5),
  ...wmWainscot(80),
  ...wmBands(80, [['K', 1], ['O', 2], ['U', 1], ['O', 2]]),
], [
  { sprite: wmWindow, x: 2, y: 7 },
  { sprite: portrait, x: 49, y: 9 },
  { sprite: mantel, x: HEARTH_X - 2, y: HEARTH_Y - 2 },
  { sprite: surround, x: HEARTH_X, y: HEARTH_Y },
  { sprite: logs, x: HEARTH_X + 6, y: HEARTH_Y + 10 },
  { sprite: hearth, x: HEARTH_X - 3, y: HEARTH_Y + 12 },
  { sprite: clock, x: CLOCK_X, y: CLOCK_Y },
  { sprite: wmCandle, x: 47, y: 34 },
  { sprite: wmCandle, x: 66, y: 34 },
  { sprite: rug, x: 1, y: 55 },
  { sprite: table, x: TABLE_X, y: TABLE_Y },
  { sprite: advisorPointingLeft, x: 23, y: 42 },
  { sprite: wmParent, x: 35, y: 42 },
]);

/* ── the fee chart: two stacks and a jar on the table, timed to the clock ──────────────────────── */

/** A stack of `n` coins in the kit's coin-stack look (wm2.ts), top face first. 7 wide, 2n + 1 tall. */
function coinStack(n: number): string[] {
  const lower = Array.from({ length: n - 1 }, () => ['OgggggO', 'yGGGGGg']).flat();
  return ['.yyGGg.', 'yGGGGgg', ...lower, 'OOOOOOO'];
}

/** The fee jar: glass lit on its left shoulder, dark inside, its coins heaped from the bottom one a row. 6x8. */
function feeJar(coins: number): string[] {
  const body = Array.from({ length: 4 }, (_, j) => (3 - j < coins ? 'xyGGgX' : 'xKKKKX'));
  return ['.xwwX.', '.XKKX.', 'xwKKKX', ...body, 'DXXXXD'];
}

/** Where things stand in the chart's 22x14 box: the jar, the high-fee stack, the low-fee stack. */
const CHART_W = 22;
const CHART_H = 14;
const JAR_AT = 0;
const HIGH_AT = 7;
const LOW_AT = 15;

/**
 * One moment of the chart: `low` and `high` coins in the two stacks, `jar` coins in the fee jar, and
 * the skimmed coin's top-left at `fly` if one is in the air. Every piece stands on the chart's
 * bottom row, which sits on the table top.
 */
function chartAt(low: number, high: number, jar: number, fly: readonly [number, number] | null = null): string[] {
  const grid = Array.from({ length: CHART_H }, () => Array.from({ length: CHART_W }, () => '.'));
  const stand = (rows: string[], x: number) =>
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch !== '.') grid[CHART_H - rows.length + j][x + i] = ch;
    }));
  stand(feeJar(jar), JAR_AT);
  stand(coinStack(high), HIGH_AT);
  stand(coinStack(low), LOW_AT);
  if (fly) {
    const [x, y] = fly;
    [grid[y][x], grid[y][x + 1], grid[y + 1][x], grid[y + 1][x + 1]] = ['y', 'G', 'G', 'g'];
  }
  return grid.map((row) => row.join(''));
}

/**
 * Twelve beats, one clock tick a year: both stacks rise, then the high-fee stack's next coin is
 * skimmed into the jar instead of landing, twice, and the end is held before the loop starts again.
 * The still is that end: the low-fee stack taller, two coins in the jar.
 */
const BEATS: readonly string[][] = [
  chartAt(2, 2, 0),
  chartAt(3, 3, 0),
  chartAt(4, 3, 0, [HIGH_AT + 2, 4]),
  chartAt(4, 3, 0, [2, 2]),
  chartAt(4, 3, 1),
  chartAt(5, 4, 1),
  chartAt(6, 4, 1, [HIGH_AT + 2, 2]),
  chartAt(6, 4, 1, [2, 1]),
  chartAt(6, 4, 2),
  chartAt(6, 4, 2),
  chartAt(6, 4, 2),
  chartAt(6, 4, 2),
];
const BEAT_MS = 560;

const feeChart: PixelSprite = {
  id: 'wm9-opener-fee-chart',
  name: 'wm9-opener-fee-chart',
  tags: ['scene', 'wm9'],
  blurb: 'Two coin stacks growing a year at a time, the high-fee one losing every other year\'s coin to a fee jar.',
  rows: chartAt(6, 4, 2),
  frames: [...BEATS],
  frameMs: BEAT_MS,
};

/** The clock's face with its hand at a quarter: up, right, down or left. Laid over the face. 4x4. */
const FACE = ['.ww.', 'wwww', 'wwww', '.ww.'];
const HAND: Record<string, readonly (readonly [number, number])[]> = {
  up: [[1, 1], [1, 0]],
  right: [[1, 1], [2, 1], [3, 1]],
  down: [[1, 1], [1, 2], [1, 3]],
  left: [[1, 1], [0, 1]],
};
function faceAt(at: keyof typeof HAND): string[] {
  const grid = FACE.map((row) => [...row]);
  for (const [x, y] of HAND[at]) grid[y][x] = 'k';
  return grid.map((row) => row.join(''));
}

/** The hand ticking a quarter each year, on the chart's beats. */
const clockHand: PixelSprite = {
  id: 'wm9-opener-clock-hand',
  name: 'wm9-opener-clock-hand',
  tags: ['scene', 'wm9'],
  rows: faceAt('up'),
  frames: (['up', 'right', 'down', 'down', 'down', 'left', 'up', 'up', 'up', 'up', 'up', 'up'] as const).map(faceAt),
  frameMs: BEAT_MS,
};

/** The fire on the grate, crackling. 14x7. */
const FIRE_BED = ['23455554555432', '23455555555432', '12344444444321'];
const fire: PixelSprite = {
  id: 'wm9-opener-fire',
  name: 'wm9-opener-fire',
  tags: ['scene', 'wm9'],
  rows: ['....3.....3...', '...343...343..', '..34543.34543.', '.3445543445433', ...FIRE_BED],
  frames: [
    ['....3.....3...', '...343...343..', '..34543.34543.', '.3445543445433', ...FIRE_BED],
    ['..3......3....', '.343....343...', '.34543.34543..', '3445543445543.', ...FIRE_BED],
    ['......3.......', '.3...343...3..', '343.34543.343.', '34543455434543', ...FIRE_BED],
  ],
  frameMs: 180,
};

/** Firelight on the hearth stone. */
const hearthGlow: PixelSprite = {
  id: 'wm9-opener-hearth-glow',
  name: 'wm9-opener-hearth-glow',
  tags: ['scene', 'wm9'],
  rows: ['gGGGGGGGGGGGGGGg'],
};

export const wm9Opener: SceneArt = {
  id: 'wm9-opener',
  label: 'In the drawing room the advisor stands at the father\'s side, pointing to two coin stacks on a marble table: the low-fee stack has grown taller, while coins skimmed from the high-fee stack sit in a fee jar.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: feeChart, x: TABLE_X, y: TABLE_Y - CHART_H },
    { sprite: clockHand, x: CLOCK_X + 1, y: CLOCK_Y + 2 },
    { sprite: fire, x: HEARTH_X + 5, y: HEARTH_Y + 4 },
    { sprite: wmCandleFlame, x: 48, y: 31 },
    { sprite: wmLater(wmCandleFlame, 'wm9-opener-flame-later', 2, 300), x: 67, y: 31 },
    { sprite: hearthGlow, x: HEARTH_X + 4, y: HEARTH_Y + 12, motion: { kind: 'twinkle', periodMs: 1700, min: 0.3 } },
    { sprite: wmStarDot, x: 14, y: 21, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.3, min: 0.2 } },
  ],
};

/**
 * A coin with a bite taken out of its top right: the fee that eats a fortune, which is the cost the
 * lesson measures (0.25% against 2% on $500K over 30 years). Lit from the upper left, the kit's
 * coin stroke down its face, a white glint.
 */
const emblemBitten: PixelSprite = {
  id: 'wm9-emblem-bitten-coin',
  name: 'wm9-emblem-bitten-coin',
  tags: ['scene', 'wm9'],
  rows: [
    '.....yyO......',
    '...yyGGGO.....',
    '..yGwGGGOO....',
    '.yGwGGGGGGO...',
    '.yGGGGyOGGO...',
    '.yGGGGGOGGGOO.',
    '.yGGGGGOGGGgO.',
    '.yGGGGGOGGGgO.',
    '.yGGGGGGGGggO.',
    '..yggGGGGggO..',
    '...OOggggOO...',
    '.....OOOO.....',
  ],
};

export const wm9Finish: SceneArt = wmKeepsake(
  'wm9-finish',
  emblemBitten,
  'A green crest with a gold rim bearing a gold coin with a bite taken out of it, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm9Opener, backdrop: wmBackdrop, finish: wm9Finish };
