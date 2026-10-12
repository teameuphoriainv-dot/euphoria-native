/**
 * Corporate Finance lesson 12, Cost of Capital & WACC: the blended price of the company's money,
 * and the hurdle every project has to clear.
 *
 * Opener: a high-jump hurdle on the hall floor whose two uprights are gauges on one rate scale, five
 * pixels to two percentage points. The left upright is filled orchid to 11.2 per cent, what the
 * shareholders charge (the cost of equity from CAPM); the right is filled blue to 4.5, what the
 * lenders charge after tax. The crossbar is pegged between them at the weighted average, 60 per cent
 * of 11.2 plus 40 per cent of 4.5, which is 8.52: nearer the equity mark because equity is most of
 * the money, and striped orchid to blue three to two for the same reason. Projects take turns at it
 * from behind the bar. One returning 11 per cent hops clear and lands in front; the next, returning
 * 6, clips the bar and drops back. Two more wait their turn. Only small layers move: the hop, glints
 * on the two gauges and the bar, the lamps.
 *
 * Keepsake: a sprouting project arcing over a hurdle striped orchid and blue, three to two.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { cfCompose, cfHall, cfSconce, cfShadowShort, cfSignInvest } from './cf-kit';
import type { LessonArtSet, SceneArt } from './types';

/** The lesson's worked example: what each source of money costs, and how much of the money is equity. */
const RATES = { equity: 11.2, debt: 4.5, equityWeight: 0.6 } as const;
const WACC = RATES.equityWeight * RATES.equity + (1 - RATES.equityWeight) * RATES.debt;
/** The two projects' returns: one clears the bar, one does not. */
const RETURNS = { clears: 11, fails: 6 } as const;

/** The row the hurdle stands on, and the rate scale both uprights share. Heights count up from FLOOR. */
const FLOOR = 56;
const PX_PER_POINT = 2.5;
const height = (rate: number) => Math.round(rate * PX_PER_POINT);

/** The hurdle's left foot sits at x; two six-wide gauge posts either side of a fifteen-wide bar, 12 points tall. */
const HURDLE = { x: 39, post: 6, bar: 15, tube: 30, barRows: 3 } as const;
const HURDLE_W = HURDLE.post * 2 + HURDLE.bar + 2;
const HURDLE_H = HURDLE.tube + 3;
const HURDLE_Y = FLOOR - HURDLE_H + 1;
/** Scene x of the bar's first column, and the scene row of its top edge. */
const BAR = { x: HURDLE.x + 1 + HURDLE.post, y: FLOOR - height(WACC) } as const;

/** Fill keys for a gauge, lit column first: the level's top row, then the column below it. */
const GAUGE = {
  equity: { top: 'QQQq', fill: 'qPPp' },
  debt: { top: 'wBBB', fill: 'BBBb' },
  glass: 'Dkkk',
} as const;

/**
 * The hurdle: two gold gauge posts ticked every two points, the left filled orchid to the cost of
 * equity and the right blue to the after-tax cost of debt, and between them the crossbar at the
 * weighted average, striped three orchid to two blue. Computed from the rates, so the bar cannot
 * drift off the blend and the fills cannot drift off the scale.
 */
const hurdle: PixelSprite = {
  id: 'cf12-hurdle',
  name: 'cf12-hurdle',
  tags: ['scene', 'cf12'],
  blurb: 'A gold hurdle whose posts are gauges, filled orchid high and blue low, with a striped bar between.',
  rows: (() => {
    const grid = Array.from({ length: HURDLE_H }, () => Array.from({ length: HURDLE_W }, () => '.'));
    const put = (x: number, y: number, ch: string) => {
      const row = grid[y - HURDLE_Y];
      if (row && x - HURDLE.x >= 0 && x - HURDLE.x < HURDLE_W) row[x - HURDLE.x] = ch;
    };
    const post = (left: number, level: number, keys: { top: string; fill: string }) => {
      const topY = FLOOR - HURDLE.tube;
      [...'.OOOO.'].forEach((ch, i) => ch !== '.' && put(left + i, topY - 2, ch));
      [...'OyyGgO'].forEach((ch, i) => put(left + i, topY - 1, ch));
      for (let y = topY; y < FLOOR; y += 1) {
        const filled = y >= FLOOR - level;
        const face = !filled ? GAUGE.glass : y === FLOOR - level ? keys.top : keys.fill;
        put(left, y, 'G');
        [...face].forEach((ch, i) => put(left + 1 + i, y, ch));
        put(left + HURDLE.post - 1, y, 'g');
      }
      for (let i = -1; i <= HURDLE.post; i += 1) put(left + i, FLOOR, 'O');
    };
    const leftPost = HURDLE.x + 1;
    const rightPost = BAR.x + HURDLE.bar;
    post(leftPost, height(RATES.equity), GAUGE.equity);
    post(rightPost, height(RATES.debt), GAUGE.debt);
    for (let h = 2 * PX_PER_POINT; h <= HURDLE.tube; h += 2 * PX_PER_POINT) {
      put(HURDLE.x, FLOOR - h, 'O');
      put(HURDLE.x + HURDLE_W - 1, FLOOR - h, 'O');
    }
    for (let i = 0; i < HURDLE.bar; i += 1) {
      const orchid = i % 5 < 3;
      for (let j = 0; j < HURDLE.barRows; j += 1) {
        const lit = j < HURDLE.barRows - 1;
        put(BAR.x + i, BAR.y + j, orchid ? (lit ? 'P' : 'p') : lit ? 'B' : 'b');
      }
    }
    put(BAR.x, BAR.y + HURDLE.barRows, 'O');
    put(BAR.x + HURDLE.bar - 1, BAR.y + HURDLE.barRows, 'O');
    return grid.map((row) => row.join(''));
  })(),
};

/** Is the hurdle solid at this scene pixel? A project behind the bar is hidden wherever it is. */
function hurdleAt(x: number, y: number): boolean {
  const ch = hurdle.rows[y - HURDLE_Y]?.[x - HURDLE.x];
  return ch !== undefined && ch !== '.';
}

const base = cfCompose('cf12-opener-base', cfHall, [
  [cfSconce, 16, 10],
  [cfSconce, 72, 10],
  [cfShadowShort, 37, 56],
  [cfShadowShort, 58, 56],
  [cfSignInvest, 20, 46],
  [cfSignInvest, 30, 46],
  [hurdle, HURDLE.x, HURDLE_Y],
], 'The still hall: two lamps, the gauge hurdle, two projects waiting their turn.');

/** The hop's box in the scene, and where a project waits behind the bar and lands in front of it. */
const HOP = { x: 48, y: 21, w: 15, h: 38 } as const;
const WAIT = { x: 50, y: 46 } as const;
const LAND = { x: 52, y: 51 } as const;
/** A project's top row when its pot's foot stands `rate` points up the scale. */
const topAt = (rate: number) => FLOOR - height(rate) - (cfSignInvest.rows.length - 1);

type Mark = readonly [x: number, y: number, ch: string];
const SPARK: readonly Mark[] = [[53, 32, 'W'], [51, 33, 'w'], [55, 33, 'w']];
const DUST: readonly Mark[] = [[50, 57, 'x'], [60, 57, 'x'], [51, 58, 'X'], [59, 58, 'X']];

/**
 * One frame of the hop: the project with its top-left at scene (x, y), hidden by the hurdle where it
 * is `behind` it, plus any marks; or no project at all.
 */
function hopFrame(at: readonly [x: number, y: number] | null, behind: boolean, marks: readonly Mark[] = []): string[] {
  const grid = Array.from({ length: HOP.h }, () => Array.from({ length: HOP.w }, () => '.'));
  const put = (x: number, y: number, ch: string) => {
    const row = grid[y - HOP.y];
    if (row && x - HOP.x >= 0 && x - HOP.x < HOP.w) row[x - HOP.x] = ch;
  };
  if (at) {
    const [ax, ay] = at;
    cfSignInvest.rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch === '.' || (behind && hurdleAt(ax + i, ay + j))) return;
        put(ax + i, ay + j, ch);
      });
    });
  }
  marks.forEach(([x, y, ch]) => put(x, y, ch));
  return grid.map((row) => row.join(''));
}

/** The 11 per cent project at the top of its hop, pot clear above the bar: the hop's still. */
const apex = hopFrame([WAIT.x + 1, topAt(RETURNS.clears)], false);
const clipped = topAt(RETURNS.fails);

/**
 * Two projects in turn, each from behind the bar. The first rises behind it, peaks with its pot at
 * its 11 per cent on the scale, well clear of the bar, comes down in front of it and lands. The
 * second peaks with its pot at 6 per cent, under the bar it is hidden behind: its leaves clip the
 * bar and it drops back to where it stood. Every rise and every fall runs one way.
 */
const hop: PixelSprite = {
  id: 'cf12-opener-hop',
  name: 'cf12-opener-hop',
  tags: ['scene', 'cf12'],
  blurb: 'A potted sprout hopping the bar, then another falling short of it.',
  rows: apex,
  frames: [
    hopFrame([WAIT.x, WAIT.y], true),
    hopFrame([WAIT.x, WAIT.y], true),
    hopFrame([WAIT.x, 40], true),
    hopFrame([WAIT.x + 1, 33], true),
    hopFrame([WAIT.x + 1, 27], false),
    hopFrame([WAIT.x + 1, 23], false),
    apex,
    hopFrame([WAIT.x + 1, 23], false),
    hopFrame([LAND.x, 28], false),
    hopFrame([LAND.x, 35], false),
    hopFrame([LAND.x, 43], false),
    hopFrame([LAND.x, LAND.y], false, DUST),
    hopFrame([LAND.x, LAND.y], false),
    hopFrame([LAND.x, LAND.y], false),
    hopFrame(null, false),
    hopFrame([WAIT.x, WAIT.y], true),
    hopFrame([WAIT.x, WAIT.y], true),
    hopFrame([WAIT.x, 42], true),
    hopFrame([WAIT.x, 38], true),
    hopFrame([WAIT.x, clipped + 1], true),
    hopFrame([WAIT.x, clipped], true, SPARK),
    hopFrame([WAIT.x, clipped + 1], true),
    hopFrame([WAIT.x, 39], true),
    hopFrame([WAIT.x, 43], true),
    hopFrame([WAIT.x, WAIT.y], true),
    hopFrame([WAIT.x, WAIT.y], true),
    hopFrame(null, false),
  ],
  frameMs: 170,
};

const glint: PixelSprite = { id: 'cf12-opener-glint', name: 'cf12-opener-glint', tags: ['scene', 'cf12'], rows: ['.w.', 'wWw', '.w.'] };
const tubeGlint: PixelSprite = { id: 'cf12-opener-tube-glint', name: 'cf12-opener-tube-glint', tags: ['scene', 'cf12'], rows: ['W', 'w'] };
const lampGlow: PixelSprite = { id: 'cf12-opener-lamp', name: 'cf12-opener-lamp', tags: ['scene', 'cf12'], rows: ['.yyy.', 'yyyyG'] };

export const cf12Opener: SceneArt = {
  id: 'cf12-opener',
  label: 'A hurdle stands on the floor with two gauge posts, the left filled orchid high for the cost of equity and the right filled blue low for the cost of debt, and its striped bar set between them; one sprouting project hops clear over the bar while the next falls short and drops back, and two more wait their turn.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: hop, x: HOP.x, y: HOP.y },
    { sprite: glint, x: BAR.x - 1, y: BAR.y - 1, motion: { kind: 'twinkle', periodMs: 2300, min: 0 } },
    { sprite: tubeGlint, x: HURDLE.x + 2, y: FLOOR - height(RATES.equity) + 2, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.2, min: 0.2 } },
    { sprite: tubeGlint, x: BAR.x + HURDLE.bar + 1, y: FLOOR - height(RATES.debt) + 2, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.7, min: 0.2 } },
    { sprite: lampGlow, x: 16, y: 10, motion: { kind: 'twinkle', periodMs: 3100, min: 0.5 } },
    { sprite: lampGlow, x: 72, y: 10, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.5 } },
  ],
};

/** Lesson 12's emblem: a sprouting project arcing over a hurdle striped orchid and blue, three to two like the mix. */
const emblemHurdle: PixelSprite = {
  id: 'cf12-emblem-hurdle',
  name: 'cf12-emblem-hurdle',
  tags: [],
  blurb: 'A potted sprout leaping a gold hurdle with an orchid and blue bar striped three to two.',
  rows: [
    '................',
    '......m.N.......',
    '......mNN.......',
    '.......n........',
    '.....OgggO......',
    '......OOO.......',
    '...y........y...',
    '................',
    '.y............y.',
    'OOO..........OOO',
    'GGgPPPBBPPPBBGGg',
    'GGgpppbbpppbbGGg',
    'GGg..........GGg',
    'GGg..........GGg',
    'GGg..........GGg',
    'OOOOO......OOOOO',
  ],
};

export const cf12Finish = cfKeepsake(
  'cf12-finish',
  'A crystal award on a gold stand with a sprouting project leaping a hurdle whose bar is striped orchid and blue inside, and small sparkles around it.',
  emblemHurdle,
);

export const art: LessonArtSet = { opener: cf12Opener, backdrop: cfBackdrop, finish: cf12Finish };
