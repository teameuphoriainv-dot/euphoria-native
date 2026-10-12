/**
 * Quantitative Analysis lesson 21, Risk-Neutral Pricing & Measure Theory: two paintings of one world.
 *
 * In a gallery after hours two gilt frames hang side by side. The left painting is P, the real
 * world: tomorrow's prices spread in an orchid bell around a drift of mu, what investors actually
 * expect. The right painting is Q, the risk-neutral world: the same bell, the same spread, slid
 * back until it drifts at r, the risk-free rate. A gold arrow between them is Girsanov's change of
 * measure, and Q is the world prices are computed in. The quant stands between the two, hands on
 * hips, behind the museum's velvet rope. Only small layers move: the picture lights glow, the arrow
 * pulses from P to Q, dust drifts up through the light, the camera's light blinks.
 * Keepsake: Q, the risk-neutral measure.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { qaCompose, qaKeepsake, qaPath, qaRect, qaRoom, qaText } from './qa-kit';
import { qaQuantHandsOnHips } from './qa-kit-b';
import { qaFrameCanvas, qaGiltFrame, qaHump } from './qa-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── the paintings: P and Q ────────────────────────────────────────────────────────────────────── */

const FRAME = { width: 32, height: 26, y: 6 } as const;
const FRAME_X = { p: 4, q: 44 } as const;
const CANVAS = qaFrameCanvas(FRAME.width, FRAME.height);
const HUMP = { x: 1, y: 7, width: 24, height: 11, sd: 3.2 } as const;
/** Where each world's bell is centred: P at the real drift mu, Q slid back to the risk-free r. */
const MEAN = { p: 15, q: 8 } as const;

/** One painting: the world's letter, its drift over the bell's peak, the bell on a price axis. */
function painting(id: string, letter: string, drift: string, mean: number, fill: string, edge: string): PixelSprite {
  return qaCompose(id, CANVAS.width, CANVAS.height, [
    { sprite: qaText(`${id}-letter`, letter, 'w'), x: 2, y: 1 },
    { sprite: qaText(`${id}-drift`, drift, edge), x: HUMP.x + mean - 1, y: 1 },
    { sprite: qaHump(`${id}-bell`, HUMP.width, HUMP.height, { mean, sd: HUMP.sd }, fill, edge), x: HUMP.x, y: HUMP.y },
    { sprite: qaRect(`${id}-axis`, HUMP.width, 1, 'X'), x: HUMP.x, y: HUMP.y + HUMP.height },
  ]);
}

const paintingP = painting('qa21-p', 'P', 'μ', MEAN.p, 'p', 'q');
const paintingQ = painting('qa21-q', 'Q', 'r', MEAN.q, 't', 'T');

/** A brass picture light over each frame: its hood, its arm, and the dim strip of its lamp. */
const pictureLight: PixelSprite = {
  id: 'qa21-picture-light',
  name: 'qa21-picture-light',
  tags: ['scene', 'qa21'],
  rows: ['OGGGGGGGGGGO', '.gggggggggg.', '.....OO.....', '.....OO.....'],
};
const LIGHT_Y = 2;
const lampGlow: PixelSprite = { id: 'qa21-lamp-glow', name: 'qa21-lamp-glow', tags: ['scene', 'qa21'], rows: ['yyyyyyyyyy'] };

/** Girsanov's change of measure, from P to Q: dim in the base, pulsing gold over it. */
const ARROW_ROWS = ['...g..', '...gg.', 'gggggg', '...gg.', '...g..'];
const arrow: PixelSprite = { id: 'qa21-arrow', name: 'qa21-arrow', tags: ['scene', 'qa21'], rows: ARROW_ROWS };
const arrowLit: PixelSprite = { id: 'qa21-arrow-lit', name: 'qa21-arrow-lit', tags: ['scene', 'qa21'], rows: ARROW_ROWS.map((row) => row.replace(/g/g, 'y')) };
const ARROW_AT = { x: 37, y: 17 } as const;

/** The museum's card beside each painting. */
const plaque: PixelSprite = { id: 'qa21-plaque', name: 'qa21-plaque', tags: ['scene', 'qa21'], rows: ['xxxxxx', 'xDDDDx', 'xxxxxx'] };

/* ── the gallery ───────────────────────────────────────────────────────────────────────────────── */

const molding: PixelSprite = { id: 'qa21-molding', name: 'qa21-molding', tags: ['scene', 'qa21'], rows: ['X'.repeat(80), 'D'.repeat(80)] };

/** The velvet rope, sagging between two brass stanchions, lit along its top. */
const ROPE = { from: 4, to: 75, top: 43, sag: 4 } as const;
const ropeAt = (x: number) => Math.round(ROPE.top + ROPE.sag * (1 - ((x - (ROPE.from + ROPE.to) / 2) / ((ROPE.to - ROPE.from) / 2)) ** 2));
const ROPE_POINTS = [...Array(ROPE.to - ROPE.from + 1)].map((_, i) => [ROPE.from + i, ropeAt(ROPE.from + i)] as [number, number]);
const stanchion: PixelSprite = {
  id: 'qa21-stanchion',
  name: 'qa21-stanchion',
  tags: ['scene', 'qa21'],
  rows: ['.yG.', '.GG.', '.Gg.', '.Gg.', '.Gg.', '.Gg.', '.Gg.', '.Gg.', '.Gg.', 'OGgO', 'OOOO'],
};

/** A security camera high in the corner; its light blinks in a layer. */
const camera: PixelSprite = { id: 'qa21-camera', name: 'qa21-camera', tags: ['scene', 'qa21'], rows: ['DDDDD', 'DXXXD', '.DDDD', '...D.'] };

const QUANT_AT = { x: 31, y: 28 } as const;

const base = qaCompose('qa21-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: molding, x: 0, y: 38 },
  { sprite: camera, x: 74, y: 0 },
  ...[FRAME_X.p, FRAME_X.q].map((x) => ({ sprite: pictureLight, x: x + 10, y: LIGHT_Y })),
  { sprite: qaGiltFrame('qa21-frame-p', FRAME.width, FRAME.height, 'K'), x: FRAME_X.p, y: FRAME.y },
  { sprite: qaGiltFrame('qa21-frame-q', FRAME.width, FRAME.height, 'K'), x: FRAME_X.q, y: FRAME.y },
  { sprite: paintingP, x: FRAME_X.p + CANVAS.x, y: FRAME.y + CANVAS.y },
  { sprite: paintingQ, x: FRAME_X.q + CANVAS.x, y: FRAME.y + CANVAS.y },
  { sprite: arrow, x: ARROW_AT.x, y: ARROW_AT.y },
  { sprite: plaque, x: FRAME_X.p + 13, y: FRAME.y + FRAME.height + 1 },
  { sprite: plaque, x: FRAME_X.q + 13, y: FRAME.y + FRAME.height + 1 },
  { sprite: qaPath('qa21-rope', 80, 60, ROPE_POINTS, 'r'), x: 0, y: 0 },
  { sprite: qaPath('qa21-rope-lit', 80, 60, ROPE_POINTS.map(([x, y]) => [x, y - 1] as [number, number]), 'R'), x: 0, y: 0 },
  { sprite: stanchion, x: ROPE.from - 3, y: ROPE.top - 1 },
  { sprite: stanchion, x: ROPE.to - 1, y: ROPE.top - 1 },
  { sprite: qaQuantHandsOnHips, x: QUANT_AT.x, y: QUANT_AT.y },
]);

const mote: PixelSprite = { id: 'qa21-mote', name: 'qa21-mote', tags: ['scene', 'qa21'], rows: ['x'] };

export const qa21Opener: SceneArt = {
  id: 'qa21-opener',
  label: 'In a gallery at night a quant stands between two gilt-framed paintings: P, the real world, a bell of prices around the drift mu, and Q, the same bell slid back to the risk-free rate r, with a gold arrow from P to Q.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lampGlow, x: FRAME_X.p + 11, y: LIGHT_Y + 1, motion: { kind: 'twinkle', periodMs: 2600, min: 0.35 } },
    { sprite: lampGlow, x: FRAME_X.q + 11, y: LIGHT_Y + 1, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.5, min: 0.35 } },
    { sprite: arrowLit, x: ARROW_AT.x, y: ARROW_AT.y, motion: { kind: 'twinkle', periodMs: 1400, min: 0.15 } },
    { sprite: mote, x: FRAME_X.p + 25, y: 34, motion: { kind: 'rise', amp: 7, periodMs: 3400 } },
    { sprite: mote, x: FRAME_X.q + 6, y: 35, motion: { kind: 'rise', amp: 6, periodMs: 3900, phase: 0.5 } },
    { sprite: { id: 'qa21-camera-light', name: 'qa21-camera-light', tags: ['scene', 'qa21'], rows: ['R'] }, x: 75, y: 2, motion: { kind: 'twinkle', periodMs: 1600, min: 0.1 } },
  ],
};

/** Lesson 21's emblem: Q, the risk-neutral measure prices are computed in. */
const emblemQ: PixelSprite = {
  id: 'qa21-emblem-q',
  name: 'qa21-emblem-q',
  tags: ['scene', 'qa21'],
  rows: [
    '............',
    '...OOOOO....',
    '..OOOOOOO...',
    '.OOy...OOy..',
    '.OOy...OOy..',
    '.OOy...OOy..',
    '.OOy.O.OOy..',
    '.OOy..OOOy..',
    '..OOOOOOOy..',
    '...yyyyOOOy.',
    '........OOy.',
    '............',
  ],
};

export const qa21Finish: SceneArt = qaKeepsake(
  'qa21-finish',
  'A gold medallion hanging from a purple ribbon, embossed with the letter Q, for the risk-neutral measure, with small sparkles around it.',
  emblemQ,
);

export const art: LessonArtSet = { opener: qa21Opener, backdrop: qaBackdrop, finish: qa21Finish };
