/**
 * Quantitative Analysis lesson 23, Bayesian Methods in Finance: by the fire.
 *
 * A study late at night, the fire lit. Over the mantel hangs the lesson's picture, wide enough to read:
 * Bayes' rule as three curves over theta, the unknown. On the left a low, wide grey hump is the prior,
 * what the quant believed before; on the right a blue hump is the likelihood, what the data say; and
 * between them, nearer the data and surer than either, stands the posterior, tall and narrow in gold.
 * The curves are true to the rule: the posterior's mean is the precision-weighted mix of the other
 * two, its spread narrower than both, its height as a density in proportion. The quant sits in a red
 * armchair beside the fireplace, a mug on the side table, updating. Only small layers move: the fire
 * flickers, sparks and steam rise, the wall clock ticks, the posterior's peak glows.
 * Keepsake: a low, wide hump and a tall, narrow one on one baseline, the prior and the posterior.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_PALETTE, qaClockFace, qaClockTick, qaCompose, qaKeepsake, qaMug, qaPath, qaQuantSeated, qaRect, qaRoom, qaSteam, qaText,
} from './qa-kit';
import { qaBellPoints, qaFrameCanvas, qaGiltFrame, qaHump } from './qa-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── the painting over the mantel: prior, likelihood, posterior ────────────────────────────────── */

const FRAME = { x: 3, y: 1, width: 48, height: 23 } as const;
const CANVAS = qaFrameCanvas(FRAME.width, FRAME.height);
const CURVES = { width: CANVAS.width, height: 12 } as const;

/**
 * Prior and likelihood as normal curves over theta; the posterior follows from them: its precision is
 * the sum of theirs, its mean their precision-weighted mean. Heights are densities (peak in proportion
 * to 1 / sd), scaled so the posterior fills the curves' height.
 */
const PRIOR_N = { mean: 7, sd: 5 } as const;
const LIKELIHOOD_N = { mean: 35, sd: 3.5 } as const;
const PRECISION = 1 / PRIOR_N.sd ** 2 + 1 / LIKELIHOOD_N.sd ** 2;
const POSTERIOR_N = {
  mean: (PRIOR_N.mean / PRIOR_N.sd ** 2 + LIKELIHOOD_N.mean / LIKELIHOOD_N.sd ** 2) / PRECISION,
  sd: 1 / Math.sqrt(PRECISION),
} as const;
const TOP = CURVES.height - 1;
const withPeak = (n: { mean: number; sd: number }) => ({ mean: n.mean, sd: n.sd, peak: (TOP * POSTERIOR_N.sd) / n.sd });
const PRIOR = withPeak(PRIOR_N);
const LIKELIHOOD = withPeak(LIKELIHOOD_N);
const POSTERIOR = { ...withPeak(POSTERIOR_N), mean: Math.round(POSTERIOR_N.mean) };

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

/* ── the armchair, the quant in it, the side table ─────────────────────────────────────────────── */

/**
 * A wingback armchair in red leather seen from behind, sized to the quant and no bigger: tufted back,
 * rolled arms, a skirt, short legs.
 */
const BACK = (button?: readonly number[]) => '...IR' + [...Array(8)].map((_, i) => (button?.includes(i + 5) ? 'I' : 'r')).join('') + 'II...';
const WITH_ARMS = (left: string, right: string) => left + 'IR' + 'r'.repeat(8) + 'II' + right;
const armchair: PixelSprite = {
  id: 'qa23-armchair',
  name: 'qa23-armchair',
  tags: ['scene', 'qa23'],
  palette: QA_PALETTE,
  rows: [
    '....' + 'I'.repeat(10) + '....',
    '...I' + 'R'.repeat(9) + 'II...',
    BACK(), BACK([7, 11]), BACK(), BACK(), BACK([9]), BACK(), BACK(),
    'III' + BACK([7, 11]).slice(3, 15) + 'III',
    WITH_ARMS('IRR', 'RRI'),
    ...Array.from({ length: 4 }, () => WITH_ARMS('Irr', 'rrI')),
    'III' + BACK().slice(3, 15) + 'III',
    'I'.repeat(18),
    ...Array.from({ length: 2 }, () => 'I' + 'r'.repeat(16) + 'I'),
    'I'.repeat(18),
    '.OO' + '.'.repeat(12) + 'OO.',
    '.OO' + '.'.repeat(12) + 'OO.',
    '.' + 'Z'.repeat(16) + '.',
  ],
};
const CHAIR = { x: 56, y: 33 } as const;
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
const TABLE = { x: 46, y: 39 } as const;

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

const CLOCK_AT = { x: 61, y: 9 } as const;

const base = qaCompose('qa23-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: wallpaper, x: 0, y: 0 },
  { sprite: qaGiltFrame('qa23-frame', FRAME.width, FRAME.height, 'K'), x: FRAME.x, y: FRAME.y },
  { sprite: bayes, x: FRAME.x + CANVAS.x, y: FRAME.y + CANVAS.y },
  { sprite: surround, x: SURROUND.x, y: SURROUND.y },
  { sprite: mantel, x: 4, y: 24 },
  { sprite: hearth, x: 4, y: 46 },
  { sprite: logs, x: 16, y: 43 },
  { sprite: qaClockFace, x: CLOCK_AT.x, y: CLOCK_AT.y },
  { sprite: rug, x: 0, y: RUG.cy - RUG.ry },
  { sprite: sideTable, x: TABLE.x, y: TABLE.y },
  { sprite: qaMug, x: TABLE.x + 1, y: TABLE.y - 5 },
  { sprite: head, x: CHAIR.x + 2, y: CHAIR.y - 7 },
  { sprite: armchair, x: CHAIR.x, y: CHAIR.y },
  { sprite: elbow, x: CHAIR.x - 1, y: CHAIR.y + 8 },
]);

export const qa23Opener: SceneArt = {
  id: 'qa23-opener',
  label: "In a study at night a quant sits in a red armchair beside the fireplace, below a wide painting of Bayes' rule over the mantel: a low wide grey prior on the left, a blue likelihood on the right and the tall narrow gold posterior between them, over theta.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: fire, x: 18, y: 34 },
    { sprite: spark, x: 24, y: 33, motion: { kind: 'rise', amp: 6, periodMs: 1700 } },
    { sprite: spark, x: 29, y: 32, motion: { kind: 'rise', amp: 5, periodMs: 2300, phase: 0.5 } },
    { sprite: qaSteam, x: TABLE.x + 2, y: TABLE.y - 9, motion: { kind: 'rise', amp: 3, periodMs: 1900 } },
    { sprite: qaClockTick, x: CLOCK_AT.x + 1, y: CLOCK_AT.y + 1 },
    { sprite: { id: 'qa23-peak', name: 'qa23-peak', tags: ['scene', 'qa23'], rows: ['W'] }, x: FRAME.x + CANVAS.x + POSTERIOR.mean, y: FRAME.y + CANVAS.y + CURVES.height - POSTERIOR.peak, motion: { kind: 'twinkle', periodMs: 1500, min: 0.2 } },
  ],
};

/**
 * Lesson 23's emblem: Bayesian updating in small. On one baseline a low, wide hump in white (the
 * prior) and, nearer one side, a tall, narrow engraved one (the posterior, surer after the data).
 */
const emblemUpdate: PixelSprite = {
  id: 'qa23-emblem-update',
  name: 'qa23-emblem-update',
  tags: ['scene', 'qa23'],
  rows: [
    '............',
    '.......OO...',
    '.......OOy..',
    '......OOOy..',
    '......OOOOy.',
    '......OOOOy.',
    '..www.OOOOy.',
    '.w...wOOOOOy',
    'w.....OOOOOO',
    'w.....OOOOOw',
    'OOOOOOOOOOOO',
    '.yyyyyyyyyy.',
  ],
};

export const qa23Finish: SceneArt = qaKeepsake(
  'qa23-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a low wide hump and a tall narrow hump on one baseline, the prior and the posterior, with small sparkles around it.',
  emblemUpdate,
);

export const art: LessonArtSet = { opener: qa23Opener, backdrop: qaBackdrop, finish: qa23Finish };
