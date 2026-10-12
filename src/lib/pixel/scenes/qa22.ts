/**
 * Quantitative Analysis lesson 22, Copulas & Dependency Modeling: Sklar's theorem off the plotter.
 *
 * A wide plotter in the print room is running off the lesson on one sheet. In the middle, the
 * joint distribution of two assets' returns: a cloud of points along the diagonal. Along the top,
 * the first asset's own distribution; down the right, the second's. Sklar's theorem says the
 * cloud is exactly those two marginals tied together by a copula, and the copula decides the
 * corners: in the bottom left, where both assets crash on the same day, the points bunch up in red.
 * That is tail dependence, the thing the Gaussian copula left out in 2008. The quant stands by the
 * machine to watch it print. Only small layers move: the print head runs along its rail, the
 * crash corner pulses, the plotter's lights blink, the clock ticks.
 * Keepsake: two interlinked rings, the bond a copula ties.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  qaBin, qaClockFace, qaClockTick, qaCompose, qaKeepsake, qaQuantStanding, qaRect, qaRoom,
} from './qa-kit';
import { qaRandom } from './qa-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the sheet: a joint distribution with its two marginals ────────────────────────────────────── */

const PAPER = { x: 12, y: 12, width: 44, height: 34 } as const;
/** The scatter's box on the sheet, and its centre and spread in pixels. */
const BOX = { x: 5, y: 10, width: 26, height: 20 } as const;
const SPREAD = { x: 5.4, y: 4.4 } as const;

/**
 * Seeded draws from a t-copula (correlation 0.8, three degrees of freedom): a common random scale
 * pushes both returns out together, so the corners fill in a way a Gaussian cloud never would.
 */
function draws(count: number): [number, number][] {
  const rand = qaRandom(22);
  const normal = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
  return [...Array(count)].map(() => {
    const [a, b] = [normal(), normal()];
    const chi = [normal(), normal(), normal()].reduce((s, z) => s + z * z, 0);
    const scale = Math.sqrt(3 / Math.max(chi, 0.2));
    return [a * scale, (0.8 * a + Math.sqrt(1 - 0.8 ** 2) * b) * scale];
  });
}

const POINTS = (() => {
  const seen = new Set<string>();
  const out: [number, number, boolean][] = [];
  for (const [u, v] of draws(130)) {
    const x = Math.round(BOX.width / 2 + u * SPREAD.x);
    const y = Math.round(BOX.height / 2 - v * SPREAD.y);
    if (x < 0 || x >= BOX.width || y < 0 || y >= BOX.height || seen.has(`${String(x)},${String(y)}`)) continue;
    seen.add(`${String(x)},${String(y)}`);
    out.push([x, y, u < -1 && v < -1]);
  }
  return out;
})();

const cloud = (id: string, pick: (crash: boolean) => string): PixelSprite => ({
  id,
  name: id,
  tags: ['scene', 'qa22'],
  rows: [...Array(BOX.height)].map((_, y) => [...Array(BOX.width)].map((_, x) => {
    const point = POINTS.find(([px, py]) => px === x && py === y);
    return point ? pick(point[2]) : '.';
  }).join('')),
});

/** Each asset on its own: a histogram of the cloud's columns along the top, of its rows down the right. */
const marginal = (count: number, size: number) => [...Array(count)].map((_, i) => {
  const z = (i - (count - 1) / 2) / (count / 5);
  return Math.max(1, Math.round(size * Math.exp(-0.5 * z * z)));
});
const TOP_BARS = marginal(9, 7);
const SIDE_BARS = marginal(7, 7);

const topHistogram = qaCompose('qa22-top', BOX.width, 7, TOP_BARS.map((h, i) => ({
  sprite: qaRect(`qa22-top-${String(i)}`, 2, h, 'p'), x: i * 3, y: 7 - h,
})));
const sideHistogram = qaCompose('qa22-side', 7, BOX.height, SIDE_BARS.map((w, i) => ({
  sprite: qaRect(`qa22-side-${String(i)}`, w, 2, 'p'), x: 0, y: i * 3,
})));

const sheet = qaCompose('qa22-sheet', PAPER.width, PAPER.height, [
  { sprite: qaRect('qa22-paper', PAPER.width, PAPER.height - 2, 'x'), x: 0, y: 0 },
  // The sheet curls towards us at the bottom: a lit lip, then its shadowed underside.
  { sprite: qaRect('qa22-curl-lit', PAPER.width - 2, 1, 'w'), x: 1, y: PAPER.height - 2 },
  { sprite: qaRect('qa22-curl-shade', PAPER.width - 4, 1, 'X'), x: 2, y: PAPER.height - 1 },
  { sprite: topHistogram, x: BOX.x, y: BOX.y - 8 },
  { sprite: sideHistogram, x: BOX.x + BOX.width + 2, y: BOX.y },
  { sprite: qaRect('qa22-axis-y', 1, BOX.height + 1, 'D'), x: BOX.x - 1, y: BOX.y },
  { sprite: qaRect('qa22-axis-x', BOX.width + 1, 1, 'D'), x: BOX.x - 1, y: BOX.y + BOX.height },
  { sprite: cloud('qa22-cloud', (crash) => (crash ? 'r' : 'b')), x: BOX.x, y: BOX.y },
]);

/** The crash corner, pulsing: the same points, brighter. */
const crashGlow = cloud('qa22-crash-glow', (crash) => (crash ? 'R' : '.'));

/* ── the plotter ───────────────────────────────────────────────────────────────────────────────── */

const PLOTTER = { x: 8, y: 5, width: 56 } as const;
const plotter: PixelSprite = {
  id: 'qa22-plotter',
  name: 'qa22-plotter',
  tags: ['scene', 'qa22'],
  blurb: 'A wide-format plotter: its lit top, the rail the head runs on, the slot the sheet comes out of, a control panel on the left end.',
  rows: [
    'D'.repeat(PLOTTER.width),
    'D' + 'X'.repeat(PLOTTER.width - 2) + 'D',
    'DwwX' + 'x'.repeat(PLOTTER.width - 5) + 'D',
    'DynX' + 'X'.repeat(PLOTTER.width - 7) + 'bX' + 'D',
    'D'.repeat(PLOTTER.width),
    'D' + 'K'.repeat(PLOTTER.width - 2) + 'D',
    'D'.repeat(PLOTTER.width),
  ],
};
const LEG_XS = [PLOTTER.x + 2, PLOTTER.x + PLOTTER.width - 4] as const;
const leg: PixelSprite = {
  id: 'qa22-leg',
  name: 'qa22-leg',
  tags: ['scene', 'qa22'],
  rows: [...Array.from({ length: 34 }, () => '.XD.'), 'DDDD', 'K..K'],
};

/** The print head, its light blinking as it lays down ink. It rides the rail in a drift layer. */
const head: PixelSprite = {
  id: 'qa22-head',
  name: 'qa22-head',
  tags: ['scene', 'qa22'],
  rows: ['DDDDDD', 'DwXXXD', 'DXNXXD', 'DDDDDD', '..DD..'],
  frames: [
    ['DDDDDD', 'DwXXXD', 'DXNXXD', 'DDDDDD', '..DD..'],
    ['DDDDDD', 'DwXXXD', 'DXnXXD', 'DDDDDD', '..DD..'],
  ],
  frameMs: 450,
};
const HEAD_AT = { x: PLOTTER.x + 25, y: PLOTTER.y + 1 } as const;

const QUANT_AT = { x: 65, y: 29 } as const;
const CLOCK_AT = { x: 69, y: 9 } as const;

const base = qaCompose('qa22-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaClockFace, x: CLOCK_AT.x, y: CLOCK_AT.y },
  ...LEG_XS.map((x) => ({ sprite: leg, x, y: PLOTTER.y + 7 })),
  { sprite: plotter, x: PLOTTER.x, y: PLOTTER.y },
  { sprite: sheet, x: PAPER.x, y: PAPER.y },
  { sprite: qaBin, x: 0, y: 48 },
  { sprite: qaQuantStanding, x: QUANT_AT.x, y: QUANT_AT.y },
]);

export const qa22Opener: SceneArt = {
  id: 'qa22-opener',
  label: "A quant watches a wide plotter print a joint distribution: a cloud of points along the diagonal with each asset's own distribution along the top and down the side, and a red cluster in the corner where both crash together.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: head, x: HEAD_AT.x, y: HEAD_AT.y, motion: { kind: 'drift', amp: 12, periodMs: 3200 } },
    { sprite: crashGlow, x: PAPER.x + BOX.x, y: PAPER.y + BOX.y, motion: { kind: 'twinkle', periodMs: 1300, min: 0.1 } },
    { sprite: qaClockTick, x: CLOCK_AT.x + 1, y: CLOCK_AT.y + 1 },
    { sprite: { id: 'qa22-ready', name: 'qa22-ready', tags: ['scene', 'qa22'], rows: ['N'] }, x: PLOTTER.x + 2, y: PLOTTER.y + 3, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.3, min: 0.2 } },
    { sprite: { id: 'qa22-feed', name: 'qa22-feed', tags: ['scene', 'qa22'], rows: ['B'] }, x: PLOTTER.x + PLOTTER.width - 3, y: PLOTTER.y + 3, motion: { kind: 'twinkle', periodMs: 1100, phase: 0.7, min: 0.2 } },
  ],
};

/** Lesson 22's emblem: two interlinked rings, the tie between two variables that a copula is. */
const emblemRings: PixelSprite = {
  id: 'qa22-emblem-rings',
  name: 'qa22-emblem-rings',
  tags: ['scene', 'qa22'],
  rows: [
    '............',
    '............',
    '..OOOO......',
    '.OOOOOOy....',
    '.OOy.OOy....',
    '.OOy.OOOOO..',
    '.OOOOOOOOOOy',
    '..OOOOOyyOOy',
    '.....OOy.OOy',
    '.....OOOOOOy',
    '......OOOOy.',
    '.......yyy..',
  ],
};

export const qa22Finish: SceneArt = qaKeepsake(
  'qa22-finish',
  'A gold medallion hanging from a purple ribbon, embossed with two interlinked rings, with small sparkles around it.',
  emblemRings,
);

export const art: LessonArtSet = { opener: qa22Opener, backdrop: qaBackdrop, finish: qa22Finish };
