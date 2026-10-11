/**
 * Quantitative Analysis lesson 3, Time Series Analysis: dawn at the desk after a night on the data.
 *
 * One big screen carries the classic decomposition, four panels stacked: the observed price series
 * (white, jagged) with its moving average (gold) through it, the trend (green), the seasonal cycle
 * (pale orchid) and the residual noise (red). The wall clock and a window going gold over the
 * skyline say what the lesson is about: values in time. Only small layers move: the seasonal wave
 * rolls on, the residual noise flickers, the series' live tick blinks, the clock's minute hand
 * turns, steam rises from the morning coffee, the morning star fades in and out.
 * Keepsake: a wave.
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

const movingAverage = qaPath('qa3-moving-average', 40, 9, [
  [0, 6], [8, 5], [16, 4], [24, 3], [32, 2], [39, 1],
], 'y');
const observed = qaPath('qa3-observed', 40, 9, [
  [0, 7], [2, 5], [3, 6], [5, 3], [7, 5], [8, 4], [10, 6], [12, 3], [13, 4], [15, 2], [17, 5], [18, 4], [20, 6],
  [22, 2], [23, 3], [25, 1], [27, 4], [28, 3], [30, 1], [31, 2], [33, 0], [35, 3], [36, 1], [38, 0], [39, 1],
], 'w');
const trend = qaPath('qa3-trend', 40, 4, [[0, 3], [39, 0]], 'N');
const axis = (id: string) => qaPath(id, 40, 1, [[0, 0], [39, 0]], 'B');
const centre = (id: string) => qaPath(id, 40, 1, [[0, 0], [39, 0]], 'B', [1, 1]);

/** One cycle of the seasonal wave, 12 pixels long, as rows down from the panel's top. */
const CYCLE = [2, 1, 0, 0, 0, 1, 2, 3, 4, 4, 4, 3];

function seasonal(shift: number): string[] {
  return [0, 1, 2, 3, 4].map((r) => [...Array(40)].map((_, x) => (CYCLE[(x + shift) % 12] === r ? 'Q' : '.')).join(''));
}

/** The residual: a spike every other pixel, up (negative) or down from the panel's middle row. */
function residual(spikes: readonly number[]): string[] {
  return [0, 1, 2, 3, 4].map((r) => [...Array(40)].map((_, x) => {
    const v = x % 2 === 0 ? spikes[x / 2] : 0;
    const top = Math.min(2, 2 + v);
    const bottom = Math.max(2, 2 + v);
    return v !== 0 && r >= top && r <= bottom ? 'R' : '.';
  }).join(''));
}

const NOISE = [
  [1, -1, 0, 2, -1, 0, 1, -2, 0, 1, -1, 1, 0, -1, 2, 0, -1, 1, 0, -2],
  [-1, 0, 2, -1, 1, -1, 0, 1, -2, 0, 1, -1, 2, 0, -1, 1, -2, 0, 1, 0],
  [0, 2, -1, 1, 0, -2, 1, 0, -1, 2, 0, -1, 1, -1, 0, -2, 1, -1, 0, 1],
] as const;

const seasonalWave: PixelSprite = {
  id: 'qa3-seasonal',
  name: 'qa3-seasonal',
  tags: ['scene', 'qa3'],
  blurb: 'The seasonal cycle rolling on, a quarter cycle a frame.',
  rows: seasonal(0),
  frames: [seasonal(0), seasonal(3), seasonal(6), seasonal(9)],
  frameMs: 450,
};

const residualNoise: PixelSprite = {
  id: 'qa3-residual',
  name: 'qa3-residual',
  tags: ['scene', 'qa3'],
  blurb: "The residual: noise that never repeats, so it flickers.",
  rows: residual(NOISE[0]),
  frames: NOISE.map(residual),
  frameMs: 260,
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
  { sprite: centre('qa3-centre-residual'), x: PANEL_X, y: 30 },
  { sprite: qaKeyboard, x: 18, y: 40 },
  { sprite: qaMouse, x: 35, y: 40 },
  { sprite: qaMug, x: 43, y: 34 },
  { sprite: qaPapers, x: 61, y: 34 },
  { sprite: qaQuantSeated, x: 49, y: 19 },
]);

export const qa3Opener: SceneArt = {
  id: 'qa3-opener',
  label: 'At dawn a quant studies a big screen that splits a price series into trend, a seasonal wave and noise, beside a wall clock and a window going gold over the city.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: seasonalWave, x: PANEL_X, y: 22 },
    { sprite: residualNoise, x: PANEL_X, y: 28 },
    { sprite: qaBlip, x: PANEL_X + 39, y: 5, motion: { kind: 'twinkle', periodMs: 1000, min: 0.2 } },
    { sprite: qaClockTick, x: 52, y: 6 },
    { sprite: qaSteam, x: 44, y: 30, motion: { kind: 'rise', amp: 3, periodMs: 1800 } },
    { sprite: qaStar, x: 65, y: 5, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.4, min: 0.15 } },
  ],
};

/** Lesson 3's emblem: one period of a wave, drawn bold so it reads at keepsake size. */
const emblemWave: PixelSprite = {
  id: 'qa3-emblem-wave',
  name: 'qa3-emblem-wave',
  tags: ['scene', 'qa3'],
  rows: [
    '............',
    '............',
    '............',
    '..OOO.......',
    '.OOOOO......',
    'OOyyyOO.....',
    'Oy...yOO...O',
    'y.....yOOOOO',
    '.......yOOOy',
    '........yyy.',
    '............',
    '............',
  ],
};

export const qa3Finish: SceneArt = qaKeepsake(
  'qa3-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a wave, with small sparkles around it.',
  emblemWave,
);

export const art: LessonArtSet = { opener: qa3Opener, backdrop: qaBackdrop, finish: qa3Finish };
