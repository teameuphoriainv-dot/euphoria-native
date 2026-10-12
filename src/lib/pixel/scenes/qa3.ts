/**
 * Quantitative Analysis lesson 3, Time Series Analysis: dawn at the desk after a night on the data.
 *
 * One big screen carries the classic decomposition, four panels stacked: the observed price series
 * (white, jagged) with its 12-pixel moving average (gold) through it, the trend (green), the seasonal
 * cycle (pale orchid) and the residual noise (red). The panels add up: every column of the price is
 * the trend plus the season plus the residual below it, one pixel to one unit. The wall clock and a
 * window going gold over the skyline say what the lesson is about: values in time. The data holds
 * still; a dotted time cursor sweeps all four panels, the series' live tick blinks, the clock's
 * minute hand turns, steam rises from the morning coffee, the morning star fades in and out.
 * Keepsake: a jagged price line and its smooth moving average.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_PALETTE, qaBlip, qaClockFace, qaClockTick, qaCompose, qaDesk, qaKeepsake, qaKeyboard, qaMouse, qaMug, qaPapers,
  qaPath, qaQuantSeated, qaRoom, qaScreen, qaStar, qaSteam,
} from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

/** The window at dawn: the kit window's frame, a sky going from night orchid to gold, the city below. */
const dawnWindow: PixelSprite = {
  id: 'qa3-dawn-window',
  name: 'qa3-dawn-window',
  tags: ['scene', 'qa3'],
  blurb: "The kit window's frame at dawn: orchid sky, a gold horizon, the sun coming up behind the towers.",
  rows: [
    '.DDDDDDDDDDDDDDDDDD.',
    '.DEEEEEEEEDEEEEEEED.',
    '.DEEEEEEEEDEEEEEEED.',
    '.DEEEEEEEEDEEEEEEED.',
    '.DppppppppDpppppppD.',
    '.DppppppppDpppppppD.',
    '.DppppppppDpppppppD.',
    '.DPPPPPPPPDPPPPPPPD.',
    '.DPPPPPPPPDPPPPPPPD.',
    '.DFFFFFFFFDFFFFFFFD.',
    '.DDDDDDDDDDDDDDDDDD.',
    '.DFFFFFFFFDFFFFFFFD.',
    '.DGGGGGGGGDGGGGGGGD.',
    '.DGGGGGGGGDGGyyyyGD.',
    '.DyyyyyyyyDyyyyyyyD.',
    '.DKKyyyKKyDyKKKyyKD.',
    '.DKKyyyKKKDKKKKKyKD.',
    '.DKKKyKKKKDKKyKKKKD.',
    '.DKKKKKKyKDKKKKKyKD.',
    '.DDDDDDDDDDDDDDDDDD.',
    'xxxxxxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDDDDDD',
  ],
};

const plant: PixelSprite = {
  id: 'qa3-plant',
  name: 'qa3-plant',
  tags: ['scene', 'qa3'],
  blurb: 'A potted plant on the floor.',
  palette: QA_PALETTE,
  rows: [
    '...mN..N...',
    '..mNN.NNn..',
    '.mNNnNNnn..',
    'mNNnNNNnnN.',
    '.NnnNNnNnnn',
    '..nNnnNnn..',
    '...nnnnn...',
    '..OOOOOOO..',
    '..OGGGGgO..',
    '...OGGgO...',
    '...OGGgO...',
    '...OOOOO...',
    '..ZZZZZZZ..',
  ],
};

/* ── the decomposition: four panels on one screen ──────────────────────────────────────────────── */

const SCREEN = { x: 3, y: 2, width: 46, height: 34 } as const;
/** Every panel runs 40 pixels wide from here. */
const PANEL_X = SCREEN.x + 3;

const trend = qaPath('qa3-trend', 40, 4, [[0, 3], [39, 0]], 'N');
const axis = (id: string) => qaPath(id, 40, 1, [[0, 0], [39, 0]], 'B');
const centre = (id: string) => qaPath(id, 40, 1, [[0, 0], [39, 0]], 'B', [1, 1]);

/** The row the trend line takes in each column of its panel. */
const TREND_ROW = [...Array(40)].map((_, x) => trend.rows.findIndex((row) => row[x] === 'N'));

/** One cycle of the seasonal wave, 12 pixels long, as rows down from the panel's top. */
const CYCLE = [2, 1, 0, 0, 0, 1, 2, 3, 4, 4, 4, 3];

/** The residual: a spike every other pixel, up (negative) or down from the panel's middle row. */
const NOISE = [1, -1, 0, 2, -1, 0, 1, -2, 0, 1, -1, 1, 0, -1, 2, 0, -1, 1, 0, 1] as const;
const residualAt = (x: number) => (x % 2 === 0 ? NOISE[x / 2] : 0);

/**
 * The observed price, built from the panels under it: in every column its row is the trend's row
 * plus the season's row plus the residual, one pixel to one unit in all four panels. So the screen
 * adds up, and the price carries the very cycle it is split into. It stays inside its 9 rows.
 */
const OBSERVED = [...Array(40)].map((_, x) => TREND_ROW[x] + CYCLE[x % 12] + residualAt(x));
const observed = qaPath('qa3-observed', 40, 9, OBSERVED.map((row, x) => [x, row] as const), 'w');

/**
 * The gold line is the price's 12-pixel moving average: it starts once twelve prices are in, and as
 * long as the seasonal cycle it averages the season away, leaving the trend's rise, a little late.
 */
const movingAverage = qaPath('qa3-moving-average', 40, 9, OBSERVED.slice(11).map((_, i) => {
  const x = i + 11;
  const mean = OBSERVED.slice(x - 11, x + 1).reduce((sum, row) => sum + row, 0) / 12;
  return [x, Math.round(mean)] as const;
}), 'y');

const seasonalWave: PixelSprite = {
  id: 'qa3-seasonal',
  name: 'qa3-seasonal',
  tags: ['scene', 'qa3'],
  blurb: 'The seasonal cycle, three and a third turns across the panel.',
  rows: [0, 1, 2, 3, 4].map((r) => [...Array(40)].map((_, x) => (CYCLE[x % 12] === r ? 'Q' : '.')).join('')),
};

const residualNoise: PixelSprite = {
  id: 'qa3-residual',
  name: 'qa3-residual',
  tags: ['scene', 'qa3'],
  blurb: 'The residual: what is left of the price once trend and season are taken out.',
  rows: [0, 1, 2, 3, 4].map((r) => [...Array(40)].map((_, x) => {
    const v = residualAt(x);
    return v !== 0 && r >= Math.min(2, 2 + v) && r <= Math.max(2, 2 + v) ? 'R' : '.';
  }).join('')),
};

/** A dotted time cursor through all four panels (rows 5 to 32), read top to bottom at any moment. */
const timeCursor: PixelSprite = {
  id: 'qa3-time-cursor',
  name: 'qa3-time-cursor',
  tags: ['scene', 'qa3'],
  blurb: 'A dotted time cursor sweeping the four panels together.',
  rows: [...Array(28)].map((_, i) => (i % 2 === 0 ? 'x' : '.')),
};

const stand: PixelSprite = {
  id: 'qa3-stand',
  name: 'qa3-stand',
  tags: ['scene', 'qa3'],
  rows: ['....DXD....', '....DXD....', '....DXD....', 'DXXXXXXXXXD'],
};

const base = qaCompose('qa3-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: dawnWindow, x: 60, y: 3 },
  { sprite: qaClockFace, x: 51, y: 5 },
  { sprite: plant, x: 0, y: 42 },
  { sprite: qaDesk, x: 11, y: 40 },
  { sprite: stand, x: 20, y: 36 },
  { sprite: qaScreen('qa3-screen', SCREEN.width, SCREEN.height), x: SCREEN.x, y: SCREEN.y },
  { sprite: movingAverage, x: PANEL_X, y: 5 },
  { sprite: observed, x: PANEL_X, y: 5 },
  { sprite: axis('qa3-axis-observed'), x: PANEL_X, y: 14 },
  { sprite: trend, x: PANEL_X, y: 16 },
  { sprite: axis('qa3-axis-trend'), x: PANEL_X, y: 20 },
  { sprite: centre('qa3-centre-seasonal'), x: PANEL_X, y: 24 },
  { sprite: seasonalWave, x: PANEL_X, y: 22 },
  { sprite: centre('qa3-centre-residual'), x: PANEL_X, y: 30 },
  { sprite: residualNoise, x: PANEL_X, y: 28 },
  { sprite: qaKeyboard, x: 18, y: 40 },
  { sprite: qaMouse, x: 35, y: 40 },
  { sprite: qaMug, x: 43, y: 34 },
  { sprite: qaPapers, x: 61, y: 34 },
  { sprite: qaQuantSeated, x: 49, y: 19 },
]);

export const qa3Opener: SceneArt = {
  id: 'qa3-opener',
  label: 'At dawn a quant studies a big screen that splits a price series and its moving average into a rising trend, a seasonal wave and noise that add back up to the price, a cursor sweeping all four panels, beside a wall clock and a window going gold over the city.',
  width: 80,
  height: 60,
  base,
  layers: [
    // Centred on the panels and swinging 19 either way, so it covers columns 1 to 39 of each.
    { sprite: timeCursor, x: PANEL_X + 20, y: 5, motion: { kind: 'drift', amp: 19, periodMs: 7000 } },
    { sprite: qaBlip, x: PANEL_X + 39, y: 5 + OBSERVED[39], motion: { kind: 'twinkle', periodMs: 1000, min: 0.2 } },
    { sprite: qaClockTick, x: 52, y: 6 },
    { sprite: qaSteam, x: 44, y: 30, motion: { kind: 'rise', amp: 3, periodMs: 1800 } },
    { sprite: qaStar, x: 65, y: 5, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.4, min: 0.15 } },
  ],
};

/**
 * Lesson 3's emblem: the opener's top panel in small. A jagged price line climbs, raised in deep gold
 * with its shadow under it, and its moving average runs smooth and white beneath, a pixel clear of it
 * all the way, so the two lines never merge in single-colour gold.
 */
const emblemPriceAverage: PixelSprite = {
  id: 'qa3-emblem-price-average',
  name: 'qa3-emblem-price-average',
  tags: ['scene', 'qa3'],
  rows: [
    '............',
    '.........O..',
    '......O.O.O.',
    '......OOOg.g',
    '..O..O.Ogg..',
    '..OO.Og.g..w',
    '.O.gO.g..ww.',
    '.Og..g.ww...',
    '..g...w.....',
    '....ww......',
    '..ww........',
    '.w..........',
  ],
};

export const qa3Finish: SceneArt = qaKeepsake(
  'qa3-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a jagged price line above its smooth moving average, with small sparkles around it.',
  emblemPriceAverage,
);

export const art: LessonArtSet = { opener: qa3Opener, backdrop: qaBackdrop, finish: qa3Finish };
