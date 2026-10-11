/**
 * Quantitative Analysis lesson 11, Stochastic Calculus Foundations: a night lecture on random paths.
 *
 * Seen from the back of an empty lecture hall: two big chalkboards up front. The left one carries
 * the lesson's equation, geometric Brownian motion, dS = μS dt + σS dW (the drift in gold chalk,
 * the noise in orchid), and under it a drop of water where a grain of pollen jitters, the random
 * walk Brown first saw. The right one draws the equation out: three Brownian paths leaving one
 * point, drifting up (green), flat (white) and down (red), inside the dashed cone that holds 99.7%
 * of paths and widens with the square root of time. The quant sits alone in the middle row. Only
 * small layers move: the pollen dances, the paths' tips jitter, the clock ticks, chalk dust rises.
 * Keepsake: the integral sign.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  qaChalkboard, qaClockFace, qaClockTick, qaCompose, qaKeepsake, qaPath, qaQuantSeated, qaRect, qaRoom, qaText,
} from './qa-kit';
import type { QaStamp } from './qa-kit';
import { qaBridge } from './qa-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the boards ────────────────────────────────────────────────────────────────────────────────── */

const BOARD = { width: 34, height: 30, y: 2 } as const;
const LEFT_X = 2;
const RIGHT_X = 44;
/** The right board's slate, 30x24, in scene pixels. */
const SLATE = { x: RIGHT_X + 2, y: BOARD.y + 2, width: BOARD.width - 4, height: BOARD.height - 6 } as const;

/** dS = μS dt + σS dW in two chalked lines: the drift term in gold, the noise term in orchid. */
const equation: QaStamp[] = [
  { sprite: qaText('qa11-ds', 'dS=', 'w'), x: 6, y: 7 },
  { sprite: qaText('qa11-drift', 'μSdt', 'y'), x: 18, y: 7 },
  { sprite: qaText('qa11-plus', '+', 'w'), x: 8, y: 14 },
  { sprite: qaText('qa11-noise', 'σSdW', 'Q'), x: 12, y: 14 },
];

/** The drop under the microscope, a chalk ring, and the dW it stands for. */
const DROP = { x: 12, y: 23 } as const;
const ring = qaPath('qa11-drop', 9, 7, [[2, 0], [6, 0], [8, 2], [8, 4], [6, 6], [2, 6], [0, 4], [0, 2], [2, 0]], 'x');

/** A grain of pollen on its random walk inside the drop. */
const WALK = [[0, 0], [1, -1], [-1, 1], [2, 0], [0, 2], [-2, -1], [1, 1], [-1, -2]] as const;
function grain(dx: number, dy: number): string[] {
  return [...Array(5)].map((_, y) => [...Array(5)].map((_, x) => (x === 2 + dx && y === 2 + dy ? 'w' : '.')).join(''));
}
const pollen: PixelSprite = {
  id: 'qa11-pollen',
  name: 'qa11-pollen',
  tags: ['scene', 'qa11'],
  blurb: 'A grain of pollen jittering in the drop: Brownian motion as Brown saw it.',
  rows: grain(0, 0),
  frames: WALK.map(([dx, dy]) => grain(dx, dy)),
  frameMs: 210,
};

/** Where every path starts, and where the three end (just short of the slate's edge, for the tips). */
const START = [SLATE.x + 1, 15] as const;
const END_X = SLATE.x + SLATE.width - 3;
const ENDS = [['N', 8, 31], ['w', 15, 7], ['R', 22, 53]] as const;
const paths: QaStamp[] = ENDS.map(([ch, y, seed]) => ({
  sprite: qaPath(`qa11-path-${ch}`, 80, 60, qaBridge(seed, START, [END_X, y], { jitter: 1.4, top: 5, bottom: 26 }), ch),
  x: 0,
  y: 0,
}));

/** The 99.7% cone: three sigma either side of the start, widening with the square root of time. */
const coneEdge = (sign: number) => [0, 2, 5, 9, 14, 20, 27, 29].map((dx) => [START[0] + dx, Math.round(START[1] + sign * 10 * Math.sqrt(dx / 29))] as [number, number]);
const cone: QaStamp[] = [1, -1].map((sign) => ({ sprite: qaPath(`qa11-cone-${String(sign)}`, 80, 60, coneEdge(sign), 'x', [1, 1]), x: 0, y: 0 }));

/** Each path's next step, one pixel past its end, jittering up and down. */
const TIPS_Y = ENDS[0][1] - 1;
function tipsFrame(shifts: readonly number[]): string[] {
  const rows = Array.from({ length: ENDS[2][1] - ENDS[0][1] + 3 }, () => '.');
  ENDS.forEach(([ch, y], i) => {
    rows[y + shifts[i] - TIPS_Y] = ch;
  });
  return rows;
}
const tips: PixelSprite = {
  id: 'qa11-tips',
  name: 'qa11-tips',
  tags: ['scene', 'qa11'],
  rows: tipsFrame([0, 0, 0]),
  frames: [[0, 0, 0], [-1, 1, 0], [1, 0, -1], [0, -1, 1]].map(tipsFrame),
  frameMs: 330,
};

/* ── the hall ──────────────────────────────────────────────────────────────────────────────────── */

/** A wooden seat back seen from behind: lit along its top and left edge. */
function seatBack(id: string, width: number, height: number): PixelSprite {
  const rows = ['.' + 'g'.repeat(width - 2) + '.'];
  for (let r = 1; r < height - 1; r += 1) rows.push('g' + 'O'.repeat(width - 1));
  rows.push('D'.repeat(width));
  return { id, name: id, tags: ['scene', 'qa11'], rows };
}

/** Three tiers of seats, the far one smallest: [top, width, height, first x, pitch]. */
const TIERS = [[36, 12, 4, -3, 13], [44, 14, 6, 1, 16], [53, 16, 7, -8, 18]] as const;
const seats: QaStamp[] = TIERS.flatMap(([y, width, height, first, pitch], t) => {
  const sprite = seatBack(`qa11-seat-${String(t)}`, width, height);
  return [...Array(8)].map((_, i) => ({ sprite, x: first + i * pitch, y }));
});

/** The quant in the middle seat of the middle row: head and shoulders over the seat back. */
const quantInSeat: PixelSprite = { ...qaQuantSeated, id: 'qa11-quant', name: 'qa11-quant', rows: qaQuantSeated.rows.slice(0, 11) };

const base = qaCompose('qa11-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaChalkboard('qa11-board-left', BOARD.width, BOARD.height), x: LEFT_X, y: BOARD.y },
  { sprite: qaChalkboard('qa11-board-right', BOARD.width, BOARD.height), x: RIGHT_X, y: BOARD.y },
  ...equation,
  { sprite: qaPath('qa11-underline', 27, 1, [[0, 0], [26, 0]], 'x'), x: 6, y: 20 },
  { sprite: ring, x: DROP.x - 4, y: DROP.y - 3 },
  { sprite: qaText('qa11-dw', 'dW', 'x'), x: 23, y: 21 },
  ...cone,
  ...paths,
  // Today's price, where every path leaves from.
  { sprite: qaRect('qa11-start', 2, 2, 'W'), x: START[0] - 1, y: START[1] - 1 },
  { sprite: qaClockFace, x: 36, y: 4 },
  // The front of the hall, then the tiers.
  { sprite: qaRect('qa11-front', 80, 1, 'D'), x: 0, y: 33 },
  { sprite: qaRect('qa11-floor', 80, 26, 'K'), x: 0, y: 34 },
  ...seats.slice(0, 8),
  { sprite: quantInSeat, x: 33, y: 33 },
  ...seats.slice(8),
]);

export const qa11Opener: SceneArt = {
  id: 'qa11-opener',
  label: 'From the back of an empty lecture hall, a quant studies two chalkboards: one with the equation of geometric Brownian motion, the other with three random paths spreading inside a widening cone.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pollen, x: DROP.x - 2, y: DROP.y - 2 },
    { sprite: tips, x: END_X + 1, y: TIPS_Y },
    { sprite: qaClockTick, x: 37, y: 5 },
    { sprite: { id: 'qa11-dust', name: 'qa11-dust', tags: ['scene', 'qa11'], rows: ['x'] }, x: 9, y: 29, motion: { kind: 'rise', amp: 3, periodMs: 1600 } },
  ],
};

/** Lesson 11's emblem: the integral sign, the calculus of the lesson's name. */
const emblemIntegral: PixelSprite = {
  id: 'qa11-emblem-integral',
  name: 'qa11-emblem-integral',
  tags: ['scene', 'qa11'],
  rows: [
    '............',
    '.......OOO..',
    '......OOyyOy',
    '......OOy...',
    '.....OOy....',
    '.....OOy....',
    '.....OOy....',
    '.....OOy....',
    '....OOy.....',
    '.O..OOy.....',
    '..OOOy......',
    '...yy.......',
  ],
};

export const qa11Finish: SceneArt = qaKeepsake(
  'qa11-finish',
  'A gold medallion hanging from a purple ribbon, embossed with an integral sign, with small sparkles around it.',
  emblemIntegral,
);

export const art: LessonArtSet = { opener: qa11Opener, backdrop: qaBackdrop, finish: qa11Finish };
