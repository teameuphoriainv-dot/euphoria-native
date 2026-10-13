/**
 * Financial Analytics lesson 17, Python: the notebook where the analysis is written and run.
 *
 * OPENER. The coding corner. The wall screen is a notebook: a first cell importing pandas and
 * NumPy, a second, active cell (green bar) typing itself out line by line (load the prices, take
 * the returns, run the backtest), then its output drawing underneath: the backtest's equity curve
 * against a red dashed risk limit, a loss floor set for the strategy, which its one drawdown comes
 * down to touch. A python, the language's namesake, lies along the screen's top edge in two humps,
 * blue with a gold belly and dark blotches down its back, its wedge head raised at the right and
 * flicking a forked tongue. The colleague works at her desk on a laptop wearing a blue and gold
 * sticker, a panda plush beside her for pandas, and the map lights ANALYZE.
 *
 * KEEPSAKE. The trophy with a python: a blue snake with a gold belly draws itself from the tail,
 * up over one curve to its raised head, and flicks a forked tongue.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faPipelineMap } from './fa-kit';
import { faDesk, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAtDesk, faBlank, faRowsOf, faTrace, FA_CAST_COLLEAGUE } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the notebook ──────────────────────────────────────────────────────────────────────────── */

/** Tokens as coloured runs: keywords orchid, names white, calls teal, strings gold, numbers green. */
const tokens = (grid: string[][], x0: number, y: number, line: string) => [...line].forEach((ch, x) => { if (ch !== '.') grid[y][x0 + x] = ch; });

/**
 * The page on the screen's glass, 38 x 28: cell 1 (its prompt and two import lines), cell 2's box
 * with the green bar of the active cell (its code is typed by a layer), and the output's prompt
 * and axes (its chart is drawn by a layer).
 */
const page: PixelSprite = (() => {
  const grid = faBlank(38, 28);
  for (let y = 0; y < 6; y++) for (let x = 4; x < 38; x++) grid[y][x] = 'k';
  for (let y = 7; y < 14; y++) {
    grid[y][4] = 'N';
    for (let x = 5; x < 38; x++) grid[y][x] = 'k';
  }
  for (const y of [1, 8]) for (let x = 0; x < 3; x++) grid[y][x] = 'B';
  for (let x = 0; x < 3; x++) grid[16][x] = 'r';
  tokens(grid, 6, 1, 'qqqqqq.wwwwww.qq.ww');
  tokens(grid, 6, 3, 'qqqqqq.wwwww.qq.ww');
  for (let y = 15; y < 26; y++) grid[y][6] = 'x';
  for (let x = 6; x < 38; x++) grid[25][x] = 'x';
  return { id: 'fa17-page', name: 'notebook page', tags: ['scene', 'fa17'], rows: faRowsOf(grid) };
})();

/** Cell 2's code, three lines, typed two characters a beat. */
const CODE = ['ww.x.TTTTTTTTTTT.yyyyyy', 'w.x.ww.TTTTTTTTTT', 'www.x.w.TTTTTTTT.NNN'] as const;
const TYPED = Math.ceil(CODE.join('').length / 2);
const PLOT_W = 31;
const HOLD = 8;

const typing: PixelSprite = (() => {
  const grid = faBlank(24, 5);
  const step = new Map<string, number>();
  let i = 0;
  CODE.forEach((line, k) => [...line].forEach((ch, x) => {
    if (ch !== '.') { grid[k * 2][x] = ch; step.set(`${String(x)},${String(k * 2)}`, Math.floor(i / 2)); }
    i += 1;
  }));
  return faDrawnBy('fa17-typing', faRowsOf(grid), (x, y) => step.get(`${String(x)},${String(y)}`) ?? 0, 150, Math.ceil(PLOT_W / 2) + HOLD);
})();

/**
 * The output, once the code has run: a backtest's equity curve (blue) climbing, with one drawdown
 * that comes down to touch the red dashed risk limit (the loss floor the strategy must stay above),
 * drawn left to right on the same beat.
 */
const output: PixelSprite = (() => {
  const grid = faBlank(PLOT_W, 10);
  for (let x = 0; x < PLOT_W; x += 2) grid[8][x] = 'r';
  const knots = [[0, 7], [5, 5], [9, 6], [13, 8], [16, 5], [21, 3], [25, 4], [30, 0]] as const;
  const ys = Array.from({ length: PLOT_W }, (_, x) => {
    const k = knots.findIndex(([kx]) => kx >= x);
    if (k <= 0) return knots[0][1];
    const [[x0, y0], [x1, y1]] = [knots[k - 1], knots[k]];
    return Math.round(y0 + ((y1 - y0) * (x - x0)) / (x1 - x0));
  });
  for (const [x, y] of faTrace(ys)) grid[y][x] = 'B';
  return faDrawnBy('fa17-output', faRowsOf(grid), (x) => TYPED + Math.floor(x / 2), 150, HOLD);
})();

/**
 * The python lying along the screen's top edge, 34 x 7, its belly on the bezel: a thin tail tip at
 * the left, two humps, then the neck lifting to a wedge head with a white eye at the right. The
 * body is two pixels thick, blue back over gold belly, with a dark blotch every fourth pixel.
 * BACK is the top row of the body at each column, tail first.
 */
const BACK = [6, 6, 5, 5, 4, 3, 3, 2, 2, 2, 3, 4, 5, 5, 5, 5, 4, 3, 2, 2, 2, 3, 4, 5, 5, 4, 3] as const;
const HEAD = ['.BBBB..', 'BBwKBB.', 'BBBBBBB', 'GGGGGg.'] as const;
const python: PixelSprite = (() => {
  const g = faBlank(34, 7);
  BACK.forEach((y, x) => {
    g[y][x] = x >= 4 && x % 4 === 0 ? 'b' : 'B';
    if (x >= 2) g[y + 1][x] = 'G';
  });
  HEAD.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') g[j][BACK.length + i] = ch; }));
  return { id: 'fa17-python', name: 'python', tags: ['scene', 'fa17', 'character'], rows: faRowsOf(g) };
})();
/** Where the forked tongue leaves the snout, on the python. */
const SNOUT = { x: BACK.length + 7, y: 1 } as const;
/** The tongue flicking out of the snout, forked at its tip, and back in. */
const tongue: PixelSprite = {
  id: 'fa17-tongue',
  name: 'tongue',
  tags: ['scene', 'fa17'],
  rows: ['..R', 'RR.', '..R'],
  frames: [['...', '...', '...'], ['...', 'R..', '...'], ['..R', 'RR.', '..R'], ['..R', 'RR.', '..R'], ['...', 'R..', '...'], ['...', '...', '...']],
  frameMs: 200,
};

/** The colleague's laptop, lid to us, wearing a blue and gold sticker; its base hides her hands. */
const laptop: PixelSprite = {
  id: 'fa17-laptop',
  name: 'laptop',
  tags: ['scene', 'fa17', 'prop'],
  rows: ['DDDDDDDDDD', 'DxXXXXXXkD', 'DxXbbXXXkD', 'DxXXggXXkD', 'DxXXXXXXkD', 'DDDDDDDDDD'],
};

/** A panda plush, for pandas. */
const panda: PixelSprite = {
  id: 'fa17-panda',
  name: 'panda',
  tags: ['scene', 'fa17', 'prop'],
  rows: ['DD...DD', 'DwwwwwD', 'wDDwDDw', 'wwwKwww', '.wwwww.', 'DwwwwwD', '.DwwwD.'],
};

/* Where things stand. */
const MAP = { x: 47, y: 1 } as const;
const NOTEBOOK = { x: 2, y: 7 } as const;
const GLASS = { x: NOTEBOOK.x + FA_MONITOR_GLASS.x, y: NOTEBOOK.y + FA_MONITOR_GLASS.y } as const;
const PYTHON = { x: 6, y: 0 } as const;
const DESK = { x: 49, y: 41 } as const;
const COLLEAGUE = { x: 57, y: 25 } as const;

const room = faRoom('fa17-opener-room', [
  [DESK.x + 2, 50, 28, 1, 'Z'],
  [4, 49, 40, 1, 'Z'],
]);

const base = faCompose('fa17-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa17-notebook', 44, 34), NOTEBOOK.x, NOTEBOOK.y],
  [page, GLASS.x, GLASS.y],
  [python, PYTHON.x, PYTHON.y],
  [faDesk('fa17-desk', 30), DESK.x, DESK.y],
  [faAtDesk('fa17-colleague', FA_CAST_COLLEAGUE), COLLEAGUE.x, COLLEAGUE.y],
  [laptop, COLLEAGUE.x + 1, DESK.y - 4],
  [panda, 70, DESK.y - 6],
]);

const cursor: PixelSprite = { id: 'fa17-cursor', name: 'cursor', tags: ['scene', 'fa17'], rows: ['w'] };
/** The sticker catching the screen's light: bright steps over the dim ones on the lid. */
const sticker: PixelSprite = { id: 'fa17-sticker', name: 'sticker', tags: ['scene', 'fa17'], rows: ['BB.', '.yG'] };

export const fa17Opener: SceneArt = {
  id: 'fa17-opener',
  label: 'A coding corner in the data works: a wall screen shows a Python notebook typing out code and drawing a blue equity curve against a red dashed risk line, a python lies along the top of the screen flicking its forked tongue, and a colleague works on a laptop beside a panda plush.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: typing, x: GLASS.x + 7, y: GLASS.y + 8 },
    { sprite: output, x: GLASS.x + 7, y: GLASS.y + 15 },
    { sprite: cursor, x: GLASS.x + 7 + CODE[2].length + 1, y: GLASS.y + 12, motion: { kind: 'twinkle', periodMs: 900, min: 0 } },
    { sprite: tongue, x: PYTHON.x + SNOUT.x, y: PYTHON.y + SNOUT.y },
    { sprite: sticker, x: COLLEAGUE.x + 4, y: DESK.y - 2, motion: { kind: 'twinkle', periodMs: 2200, min: 0.5 } },
    faStageLight('analyze', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 17: Python. A python: its blue back and gold belly draw themselves from the tail at the
 * bottom left, up over one curve and down, then up the neck to a wedge head with a white eye; the
 * forked red tongue flicks in and out while it holds, then the screen clears.
 */
export const faEmblemPython: PixelSprite = (() => {
  const full = [
    '................',
    '........BBBB....',
    '.......BBwKBB...',
    '.......BBBBBBB.R',
    '........GGGGgRR.',
    '...BbB..BBG....R',
    '..BBGBB.BG......',
    '.BBG.GBbBG......',
    '.BG...GGG.......',
    'BBG.............',
    'BG..............',
  ];
  const drawn = faDrawnBy('fa-emblem-python', full, (x) => Math.floor(x / 2), 260, 5);
  const frames = drawn.frames ?? [drawn.rows];
  // The tongue flicks in and out while it holds.
  for (const f of [9, 11]) frames[f] = frames[f].map((row) => row.replace(/R/g, '.'));
  return { ...drawn, name: 'emblem python', blurb: 'A blue python with a gold belly, its head raised, flicking a forked tongue.', frames };
})();

export const fa17Finish: SceneArt = faKeepsake(
  'fa17-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a blue python with a gold belly that curves up from its tail to a raised head flicking a forked red tongue, with small sparkles around it.',
  faEmblemPython,
);

export const art: LessonArtSet = { opener: fa17Opener, backdrop: faBackdrop, finish: fa17Finish };
