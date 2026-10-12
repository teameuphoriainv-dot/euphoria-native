/**
 * Quantitative Analysis lesson 23, Bayesian Methods in Finance: by the fire.
 *
 * A study late at night, the fire lit. Over the mantel hangs the lesson's picture: Bayes' rule as
 * three curves over theta, the unknown. A wide grey hump is the prior, what the quant believed
 * before; a blue hump is the likelihood, what the data say; and the posterior, tall and narrow in
 * gold, sits between them, nearer the data, surer than either. Every new observation narrows it a
 * little more. The quant sits in a red armchair facing the fire, a mug on the side table, updating.
 * Only small layers move: the fire flickers, sparks and steam rise, the candle flame trembles, the
 * mantel clock ticks, the posterior's peak glows.
 * Keepsake: theta, the unknown a Bayesian keeps updating.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_PALETTE, qaClockFace, qaClockTick, qaCompose, qaKeepsake, qaMug, qaPath, qaQuantSeated, qaRect, qaRoom, qaSteam, qaText,
} from './qa-kit';
import { qaBellPoints, qaFrameCanvas, qaGiltFrame, qaHump } from './qa-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── the painting over the mantel: prior, likelihood, posterior ────────────────────────────────── */

const FRAME = { x: 9, y: 2, width: 32, height: 22 } as const;
const CANVAS = qaFrameCanvas(FRAME.width, FRAME.height);
const CURVES = { width: CANVAS.width, height: 11 } as const;
const PRIOR = { mean: 10, sd: 6, peak: 4 } as const;
const LIKELIHOOD = { mean: 19, sd: 2.8, peak: 7 } as const;
const POSTERIOR = { mean: 16, sd: 2, peak: 10 } as const;

const bayes = qaCompose('qa23-bayes', CANVAS.width, CANVAS.height, [
  { sprite: qaPath('qa23-prior', CURVES.width, CURVES.height, qaBellPoints(CURVES.width, CURVES.height, PRIOR), 'x'), x: 0, y: 0 },
  { sprite: qaHump('qa23-posterior', CURVES.width, CURVES.height, POSTERIOR, 'G', 'y'), x: 0, y: 0 },
  { sprite: qaPath('qa23-likelihood', CURVES.width, CURVES.height, qaBellPoints(CURVES.width, CURVES.height, LIKELIHOOD), 'B'), x: 0, y: 0 },
  { sprite: qaRect('qa23-axis', CURVES.width, 1, 'X'), x: 0, y: CURVES.height - 1 },
  { sprite: qaText('qa23-theta', 'θ', 'w'), x: POSTERIOR.mean - 1, y: CURVES.height },
]);

/* ── the fireplace ─────────────────────────────────────────────────────────────────────────────── */

const SURROUND = { x: 7, y: 27, width: 38, height: 19 } as const;
const OPENING = { x: 14, y: 30, width: 24 } as const;

/** The stone surround: lit on the left edge of each pillar, shaded on the right, dark under the lintel. */
const surround: PixelSprite = {
  id: 'qa23-surround',
  name: 'qa23-surround',
  tags: ['scene', 'qa23'],
  palette: QA_PALETTE,
  rows: [...Array(SURROUND.height)].map((_, j) => [...Array(SURROUND.width)].map((_, i) => {
    const [x, y] = [SURROUND.x + i, SURROUND.y + j];
    const inOpening = x >= OPENING.x && x < OPENING.x + OPENING.width;
    if (inOpening && y >= OPENING.y) return x >= 17 && x <= 34 && y >= 36 ? '1' : 'Z';
    if (inOpening && y === OPENING.y - 1) return 'D';
    if (x === SURROUND.x || x === OPENING.x + OPENING.width) return 'x';
    if (x === OPENING.x - 1 || x === SURROUND.x + SURROUND.width - 1) return 'D';
    return 'X';
  }).join('')),
};
const mantel: PixelSprite = { id: 'qa23-mantel', name: 'qa23-mantel', tags: ['scene', 'qa23'], rows: ['x'.repeat(46), 'X'.repeat(46), 'D'.repeat(46)] };
const hearth: PixelSprite = { id: 'qa23-hearth', name: 'qa23-hearth', tags: ['scene', 'qa23'], rows: ['x'.repeat(46), 'X'.repeat(46), 'D'.repeat(46)] };

/** Two logs on the grate. */
const logs: PixelSprite = {
  id: 'qa23-logs',
  name: 'qa23-logs',
  tags: ['scene', 'qa23'],
  rows: ['..gOOOOOOg..gOOOOg..', '.gOOOOOOOOggOOOOOOg.', 'DDDDDDDDDDDDDDDDDDDD'],
};

/** The fire: each column a flame of its own height, white-hot at the root, red at the tip. */
const FIRE = { width: 16, height: 9 } as const;
function flames(heights: readonly number[]): string[] {
  return [...Array(FIRE.height)].map((_, y) => heights.map((h, x) => {
    const d = FIRE.height - 1 - y;
    if (d >= h) return '.';
    if (d === h - 1) return h >= 3 ? '2' : '3';
    const f = d / h;
    if (f < 0.3 && x >= 4 && x <= 11) return '5';
    return f < 0.55 ? '4' : '3';
  }).join(''));
}
const FLAMES = [
  [1, 2, 4, 3, 5, 7, 6, 4, 6, 8, 6, 4, 5, 3, 2, 1],
  [2, 3, 3, 5, 6, 5, 8, 6, 5, 6, 7, 5, 3, 4, 1, 1],
  [1, 2, 5, 6, 4, 6, 7, 8, 7, 5, 5, 6, 4, 2, 2, 1],
] as const;
const fire: PixelSprite = {
  id: 'qa23-fire',
  name: 'qa23-fire',
  tags: ['scene', 'qa23'],
  blurb: 'The fire, flickering through three shapes.',
  rows: flames(FLAMES[0]),
  frames: FLAMES.map(flames),
  frameMs: 260,
};

const spark: PixelSprite = { id: 'qa23-spark', name: 'qa23-spark', tags: ['scene', 'qa23'], rows: ['y', 'G'] };

/** A candle in its holder at the mantel's end; the flame trembles in a layer. */
const candle: PixelSprite = { id: 'qa23-candle', name: 'qa23-candle', tags: ['scene', 'qa23'], rows: ['.w.', '.w.', '.x.', 'gGg', '.O.', 'OOO'] };
const candleFlame: PixelSprite = { id: 'qa23-candle-flame', name: 'qa23-candle-flame', tags: ['scene', 'qa23'], rows: ['y', 'G'] };

/* ── the armchair, the quant in it, the side table ─────────────────────────────────────────────── */

/** A wingback armchair in red leather seen from behind: tufted back, rolled arms, a skirt, short legs. */
const BACK = (button?: readonly number[]) => '...IR' + [...Array(14)].map((_, i) => (button?.includes(i + 5) ? 'I' : 'r')).join('') + 'II...';
const WITH_ARMS = (left: string, right: string) => left + 'IR' + 'r'.repeat(14) + 'II' + right;
const armchair: PixelSprite = {
  id: 'qa23-armchair',
  name: 'qa23-armchair',
  tags: ['scene', 'qa23'],
  palette: QA_PALETTE,
  rows: [
    '....' + 'I'.repeat(16) + '....',
    '...I' + 'R'.repeat(15) + 'II...',
    BACK(), BACK(), BACK([8, 15]), BACK(), BACK(), BACK(), BACK([11]), BACK(), BACK(), BACK(),
    'III' + BACK([8, 15]).slice(3, 21) + 'III',
    WITH_ARMS('IRR', 'RRI'),
    ...Array.from({ length: 7 }, () => WITH_ARMS('Irr', 'rrI')),
    'III' + BACK().slice(3, 21) + 'III',
    'I'.repeat(24),
    ...Array.from({ length: 3 }, () => 'I' + 'r'.repeat(22) + 'I'),
    'I'.repeat(24),
    '.OO' + '.'.repeat(18) + 'OO.',
    '.OO' + '.'.repeat(18) + 'OO.',
    '.' + 'Z'.repeat(22) + '.',
  ],
};
const CHAIR = { x: 51, y: 27 } as const;
/** The quant's head over the chair's back: the seated quant's head and neck, the chair covers the rest. */
const head: PixelSprite = { ...qaQuantSeated, id: 'qa23-head', name: 'qa23-head', rows: qaQuantSeated.rows.slice(0, 7) };
/** The quant's elbow and hand, resting on the chair's left arm. */
const elbow: PixelSprite = { id: 'qa23-elbow', name: 'qa23-elbow', tags: ['scene', 'qa23'], rows: ['.EPPE', 'EPPss'] };

const sideTable: PixelSprite = {
  id: 'qa23-side-table',
  name: 'qa23-side-table',
  tags: ['scene', 'qa23'],
  rows: ['OggggggO', 'OOOOOOOO', '...OO...', '...OO...', '...OO...', '...OO...', '...OO...', '..OOOO..', '.OOOOOO.'],
};
const TABLE = { x: 42, y: 39 } as const;

/** The rug before the fire: an oval in deep orchid with a lighter rim. */
const RUG = { cx: 30, cy: 54, rx: 26, ry: 4 } as const;
const rug: PixelSprite = {
  id: 'qa23-rug',
  name: 'qa23-rug',
  tags: ['scene', 'qa23'],
  rows: [...Array(RUG.ry * 2 + 1)].map((_, j) => [...Array(80)].map((_, x) => {
    const d = ((x - RUG.cx) / RUG.rx) ** 2 + ((j - RUG.ry) / (RUG.ry + 0.5)) ** 2;
    return d > 1 ? '.' : d > 0.72 ? 'p' : 'E';
  }).join('')),
};

/** The study's wallpaper: a quiet stripe. */
const wallpaper: PixelSprite = {
  id: 'qa23-wallpaper',
  name: 'qa23-wallpaper',
  tags: ['scene', 'qa23'],
  rows: Array.from({ length: 46 }, () => [...Array(80)].map((_, x) => (x % 5 === 2 ? 'K' : '.')).join('')),
};

const CLOCK_AT = { x: 42, y: 16 } as const;

const base = qaCompose('qa23-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: wallpaper, x: 0, y: 0 },
  { sprite: qaGiltFrame('qa23-frame', FRAME.width, FRAME.height, 'K'), x: FRAME.x, y: FRAME.y },
  { sprite: bayes, x: FRAME.x + CANVAS.x, y: FRAME.y + CANVAS.y },
  { sprite: surround, x: SURROUND.x, y: SURROUND.y },
  { sprite: mantel, x: 4, y: 24 },
  { sprite: hearth, x: 4, y: 46 },
  { sprite: logs, x: 16, y: 43 },
  { sprite: candle, x: 6, y: 18 },
  { sprite: qaClockFace, x: CLOCK_AT.x, y: CLOCK_AT.y },
  { sprite: rug, x: 0, y: RUG.cy - RUG.ry },
  { sprite: sideTable, x: TABLE.x, y: TABLE.y },
  { sprite: qaMug, x: TABLE.x + 1, y: TABLE.y - 5 },
  { sprite: head, x: CHAIR.x + 5, y: CHAIR.y - 7 },
  { sprite: armchair, x: CHAIR.x, y: CHAIR.y },
  { sprite: elbow, x: CHAIR.x - 1, y: CHAIR.y + 11 },
]);

export const qa23Opener: SceneArt = {
  id: 'qa23-opener',
  label: "By the fire in a study at night a quant sits in a red armchair under a painting of Bayes' rule: a wide grey prior, a blue likelihood, and the tall narrow gold posterior between them, over theta.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: fire, x: 18, y: 34 },
    { sprite: spark, x: 24, y: 33, motion: { kind: 'rise', amp: 6, periodMs: 1700 } },
    { sprite: spark, x: 29, y: 32, motion: { kind: 'rise', amp: 5, periodMs: 2300, phase: 0.5 } },
    { sprite: qaSteam, x: TABLE.x + 2, y: TABLE.y - 9, motion: { kind: 'rise', amp: 3, periodMs: 1900 } },
    { sprite: candleFlame, x: 7, y: 16, motion: { kind: 'twinkle', periodMs: 700, min: 0.5 } },
    { sprite: qaClockTick, x: CLOCK_AT.x + 1, y: CLOCK_AT.y + 1 },
    { sprite: { id: 'qa23-peak', name: 'qa23-peak', tags: ['scene', 'qa23'], rows: ['W'] }, x: FRAME.x + CANVAS.x + POSTERIOR.mean, y: FRAME.y + CANVAS.y + CURVES.height - POSTERIOR.peak, motion: { kind: 'twinkle', periodMs: 1500, min: 0.2 } },
  ],
};

/** Lesson 23's emblem: theta, the unknown parameter a Bayesian keeps updating. */
const emblemTheta: PixelSprite = {
  id: 'qa23-emblem-theta',
  name: 'qa23-emblem-theta',
  tags: ['scene', 'qa23'],
  rows: [
    '............',
    '...OOOOO....',
    '..OOyyyOO...',
    '.OOy...yOOy.',
    '.OOy...yOOy.',
    '.OOOOOOOOOy.',
    '.OOyyyyyOOy.',
    '.OOy....OOy.',
    '..OOy..OOy..',
    '...OOOOOy...',
    '....yyyy....',
    '............',
  ],
};

export const qa23Finish: SceneArt = qaKeepsake(
  'qa23-finish',
  'A gold medallion hanging from a purple ribbon, embossed with the Greek letter theta, with small sparkles around it.',
  emblemTheta,
);

export const art: LessonArtSet = { opener: qa23Opener, backdrop: qaBackdrop, finish: qa23Finish };
