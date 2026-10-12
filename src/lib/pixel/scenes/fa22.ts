/**
 * Financial Analytics lesson 22, predictive modeling: several models, one forecast, many checks.
 *
 * OPENER. The model bench, at the MODEL station. Four small screens are the lesson's four kinds of
 * model, each drawn as itself: a random forest (two little trees), gradient boosting (steps that
 * each improve on the last), a neural network (a lattice of nodes) and a linear model (one straight
 * line). Each casts its vote in turn on the lamp under its screen, three up and one down, and their
 * outputs stream as one ensemble, four colours in one pipe, into the big forecast screen: the price
 * so far in blue, a dashed line for today, then the forecast in gold dots drawing itself on with
 * its widening band. Under the pipe the DECIDE slot issues the trade. The colleague ticks off the
 * validation checks on her clipboard and the analyst points at the forecast. The map lights MODEL.
 *
 * KEEPSAKE. The trophy with a forecast: a green price line, a dashed white line for today, and a
 * gold dashed line climbing on past it.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faDecisionCard, faLamp, faOutputSlot, faPipelineMap, FA_OUTPUT_LAMP } from './fa-kit';
import { faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAnalystPoint, faBlank, faColleague, faRowsOf, faTrace, FA_CLIPBOARD } from './fa-kit-b';
import { faPacketsRight, faTicks } from './fa-kit-c';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the models ────────────────────────────────────────────────────────────────────────────── */

/**
 * The four models, each a 9 x 6 picture on its screen's glass, with where its screen hangs and
 * its vote (three up, one down: the ensemble still says up).
 */
const MODELS = [
  {
    id: 'forest',
    x: 2,
    y: 3,
    vote: 'N',
    glyph: ['.........', '..N......', '.NNN...N.', 'NNNNN.NNN', '..O...NNN', '..O....O.'],
  },
  {
    id: 'boosting',
    x: 17,
    y: 3,
    vote: 'N',
    glyph: ['.......qq', '.......qq', '....qq.qq', '....qq.qq', '.qq.qq.qq', '.qq.qq.qq'],
  },
  {
    id: 'neural',
    x: 2,
    y: 16,
    vote: 'R',
    glyph: ['B...B....', '.b.b.b...', 'B...B...B', '.b.b.b.b.', 'B...B....', '.........'],
  },
  {
    id: 'linear',
    x: 17,
    y: 16,
    vote: 'N',
    glyph: ['.......TT', '.....TT..', '...TT....', '.TT......', 'T........', '.........'],
  },
] as const;
const MODEL_SCREEN = { w: 15, h: 12 } as const;
/** Each screen's vote lamp sits in its bottom bezel, 2 x 1. */
const LAMP = { x: 10, y: 10 } as const;
const lampSocket: PixelSprite = { id: 'fa22-lamp-socket', name: 'lamp socket', tags: ['scene', 'fa22', 'prop'], rows: ['KK'] };

/** A model's picture, as a sprite for its screen's glass. */
const modelGlyph = (id: string, rows: readonly string[]): PixelSprite => ({ id: `fa22-${id}`, name: id, tags: ['scene', 'fa22'], rows: [...rows] });

/** The votes landing one model at a time, holding, then clearing for the next run. */
const VOTES = { x: MODELS[0].x + LAMP.x, y: MODELS[0].y + LAMP.y } as const;
const votes: PixelSprite = (() => {
  const at = (n: number) => {
    const g = faBlank(17, 14);
    MODELS.slice(0, n).forEach(({ x, y, vote }) => { g[y - MODELS[0].y][x - MODELS[0].x] = vote; g[y - MODELS[0].y][x - MODELS[0].x + 1] = vote; });
    return faRowsOf(g);
  };
  const frames = [at(0), at(1), at(2), at(3), at(4), at(4), at(4), at(4)];
  return { id: 'fa22-votes', name: 'votes', tags: ['scene', 'fa22'], rows: at(4), frames, frameMs: 420 };
})();

/* ── the forecast ──────────────────────────────────────────────────────────────────────────── */

/** The forecast screen's glass, 28 x 18: axes, the price so far in blue, a dashed line for today. */
const TODAY = 16;
const chart: PixelSprite = (() => {
  const g = faBlank(28, 18);
  for (let y = 0; y < 17; y++) g[y][0] = 'X';
  for (let x = 0; x < 28; x++) g[17][x] = 'X';
  for (const [x, y] of faTrace([13, 12, 13, 11, 12, 10, 11, 9, 10, 10, 8, 9, 7, 8, 7])) g[y][1 + x] = 'B';
  for (let y = 0; y < 17; y += 2) g[y][TODAY] = 'w';
  return { id: 'fa22-chart', name: 'forecast chart', tags: ['scene', 'fa22'], rows: faRowsOf(g) };
})();

/**
 * The forecast drawing itself past today, a dot every other column: the expected path in gold,
 * and a band either side of it, dim gold, that widens the further ahead it looks.
 */
const forecast: PixelSprite = (() => {
  const g = faBlank(28, 18);
  const centre = [7, 6, 6, 5, 5, 4];
  const spread = [1, 1, 2, 2, 3, 3];
  centre.forEach((c, k) => {
    const x = TODAY + 1 + k * 2;
    g[c][x] = 'y';
    g[c - spread[k]][x] = 'g';
    g[c + spread[k]][x] = 'g';
  });
  return faDrawnBy('fa22-forecast', faRowsOf(g), (x) => Math.floor((x - TODAY - 1) / 2), 380, 6);
})();

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

/* Where things stand. */
const MAP = { x: 46, y: 1 } as const;
const PIPE = { x: 32, y: 13, length: 12 } as const;
const SCREEN = { x: 44, y: 9, w: 34, h: 24 } as const;
const GLASS = { x: SCREEN.x + FA_MONITOR_GLASS.x, y: SCREEN.y + FA_MONITOR_GLASS.y } as const;
const OUTPUT = { x: 34, y: 30 } as const;
const COLLEAGUE = { x: 4, y: 31 } as const;
const ANALYST = { x: 60, y: 33 } as const;

const room = faRoom('fa22-opener-room', [
  [OUTPUT.x + 1, 50, 9, 1, 'Z'],
  [COLLEAGUE.x + 2, 57, 10, 1, 'Z'],
  [ANALYST.x + 6, 57, 10, 1, 'Z'],
]);

const base = faCompose('fa22-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  ...MODELS.flatMap(({ id, x, y, glyph }) => [
    [faMonitor(`fa22-${id}-screen`, MODEL_SCREEN.w, MODEL_SCREEN.h), x, y] as const,
    [modelGlyph(id, glyph), x + FA_MONITOR_GLASS.x, y + FA_MONITOR_GLASS.y] as const,
    [lampSocket, x + LAMP.x, y + LAMP.y] as const,
  ]),
  [faConduit('fa22-pipe', PIPE.length, 6), PIPE.x, PIPE.y],
  [faMonitor('fa22-forecast-screen', SCREEN.w, SCREEN.h), SCREEN.x, SCREEN.y],
  [chart, GLASS.x, GLASS.y],
  [faOutputSlot, OUTPUT.x, OUTPUT.y],
  [faColleague, COLLEAGUE.x, COLLEAGUE.y],
  [faAnalystPoint, ANALYST.x, ANALYST.y],
]);

export const fa22Opener: SceneArt = {
  id: 'fa22-opener',
  label: 'A model bench in the data plant: four small screens, a forest of trees, boosting steps, a neural net and a straight line, cast their votes and stream them as one into a forecast screen where a gold dotted forecast and its widening band draw on past today, while the colleague ticks off checks and the analyst points at the prediction.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: votes, x: VOTES.x, y: VOTES.y },
    { sprite: faPacketsRight('fa22-ensemble', PIPE.length - 2, ['N', 'q', 'B', 'T'], 4, 160), x: PIPE.x + 1, y: PIPE.y + 2 },
    { sprite: forecast, x: GLASS.x, y: GLASS.y },
    { sprite: faDecisionCard, x: OUTPUT.x + 1, y: OUTPUT.y - 9, motion: { kind: 'rise', amp: 3, periodMs: 2600 } },
    { sprite: faLamp, x: OUTPUT.x + FA_OUTPUT_LAMP.x, y: OUTPUT.y + FA_OUTPUT_LAMP.y, motion: { kind: 'twinkle', periodMs: 1400, min: 0.3 } },
    { sprite: faTicks, x: COLLEAGUE.x + FA_CLIPBOARD.x, y: COLLEAGUE.y + FA_CLIPBOARD.y },
    faStageLight('model', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 22: predictive modeling. A forecast: a green price line draws itself up to a dashed white
 * line for today, then a gold dashed line climbs on past it to a point that flashes while it
 * holds, and the screen clears.
 */
export const faEmblemForecast: PixelSprite = (() => {
  const full = [
    '.........w....yy',
    '.............yG.',
    '.........w.y.G..',
    '..........yG....',
    '........NwG.....',
    '.......Nn.......',
    '.....NNn.w......',
    '.NN.Nnn.........',
    'NnnNn....w......',
    'n..n............',
    '.........w......',
  ];
  const step = (x: number, _y: number, ch: string) => {
    if (ch === 'w') return 3;
    if (x <= 8) return Math.floor(x / 3);
    return x <= 11 ? 4 : x <= 14 ? 5 : 6;
  };
  const drawn = faDrawnBy('fa-emblem-forecast', full, step, 300, 5);
  const frames = drawn.frames ?? [drawn.rows];
  // The forecast's point catches the light while it holds.
  for (const f of [8, 10]) frames[f] = frames[f].map((row, y) => (y === 0 ? row.replace('yy', 'ww') : row));
  return { ...drawn, name: 'emblem forecast', blurb: 'A price line, a line for today and a dashed forecast climbing past it.', frames };
})();

export const fa22Finish: SceneArt = faKeepsake(
  'fa22-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a green price line up to a dashed white line for today, then a gold dashed forecast climbing on past it, with small sparkles around it.',
  faEmblemForecast,
);

export const art: LessonArtSet = { opener: fa22Opener, backdrop: faBackdrop, finish: fa22Finish };
