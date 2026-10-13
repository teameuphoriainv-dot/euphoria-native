/**
 * Risk Management lesson 25 opener, the advanced capstone: the top of the climb, inside the lantern
 * room itself, where the five pillars of integrated risk management are one light. The great lens
 * fills the room, and its prism rings are tinted in five bands, one for each pillar and each carrying
 * a piece of its own lesson: lesson 20's pie on the green (portfolio risk), lesson 21's dominoes on
 * the red (systemic risk), lesson 22's rose-tinted spectacles on the pink (behavioural risk), lesson
 * 23's die on the blue (quantitative rigour) and lesson 24's chart of the board over its three lines
 * on the orchid (governance). Between them the bullseye burns white, and one white beam goes out each
 * way through the storm on the glass toward a ship coming home: the disciplines are managed together
 * because in a crisis they arrive together. The keeper polishes the lens. Moving: the beams, the
 * bullseye's glow, glints on the brass, lightning, rain on the panes, the ship and the swell. The
 * backdrop is the stormy capstone variant and the keepsake ring is gold.
 */
import type { PixelSprite } from '../types';
import { rmCompose, rmLightning, rmShip, rmStamp } from './rm-kit';
import { rmFlip, rmGlint, rmKeeperReach, rmPlot, rmPortSwell } from './rm-kit-a';
import { rmBackdropStorm, rmBeam, rmFill, rmKeepsakeGold, rmLensGlow } from './rm-kit-b';
import type { RmSpan } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The glazing bars, two pixels each, lit on the left: the room is round, so the side panes are narrow. */
const BARS = [0, 13, 26, 52, 65, 78];

/** The storm outside the glass: a cloud deck, the horizon, the sea's streaks. */
const WEATHER: readonly RmSpan[] = [
  [0, 79, 5, 'K'], [0, 79, 6, 'K'], [0, 44, 7, 'K'], [50, 79, 7, 'K'], [0, 30, 8, 'K'], [58, 79, 8, 'K'],
  [8, 26, 9, 'k'], [2, 30, 10, 'k'], [0, 16, 11, 'k'], [54, 72, 10, 'k'], [50, 77, 11, 'k'], [60, 79, 12, 'k'],
  [4, 14, 15, 'k'], [62, 75, 16, 'k'], [0, 8, 18, 'k'], [68, 79, 19, 'k'],
  [56, 62, 33, 'u'], [68, 76, 35, 'U'], [3, 9, 34, 'u'], [14, 20, 37, 'u'], [58, 64, 39, 'u'], [70, 77, 40, 'u'], [6, 11, 40, 'u'],
  [60, 66, 43, 'u'], [2, 7, 44, 'u'],
];

/** Dome, glazing, sill, the parapet's inner wall and the deck, with the storm in every pane. */
const ground = rmFill(
  Array.from({ length: 60 }, (_, y) => {
    if (y < 3) return 'K'.repeat(80);
    if (y === 3) return 'D'.repeat(80);
    if (y === 4 || y === 46 || y === 49) return 'X'.repeat(80);
    if (y < 46) return (y < 31 ? 'v' : y === 31 ? 'u' : y < 36 ? 'V' : 'v').repeat(80);
    if (y < 49) return 'k'.repeat(80);
    return (y === 54 || y === 58 ? 'D' : 'K').repeat(80);
  }),
  [
    ...WEATHER,
    [0, 79, 22, 'X'], [0, 79, 23, 'D'],
    ...BARS.flatMap((x): RmSpan[] => Array.from({ length: 41 }, (_, i): RmSpan[] => [[x, x, 5 + i, 'X'], [x + 1, x + 1, 5 + i, 'D']]).flat()),
  ],
);

/* ── the great lens ──────────────────────────────────────────────────────────────────────────── */

/** The lens's size, and where it stands: its bullseye's centre is at (13, 18) inside it. */
const LENS = { x: 27, y: 4, w: 26, h: 42 };

/**
 * The five bands, top to bottom in the order the lessons ran, each a run of rows with its two tones
 * striped like prism ridges: portfolio green, systemic red, then the bullseye's belt, then behavioural
 * pink, quantitative blue and governance orchid.
 */
const BANDS = [
  { top: 1, bottom: 5, lit: 'm', base: 'N' },
  { top: 7, bottom: 11, lit: 's', base: 'R' },
  { top: 24, bottom: 28, lit: 'F', base: 'f' },
  { top: 30, bottom: 34, lit: 'B', base: 'b' },
  { top: 36, bottom: 40, lit: 'q', base: 'P' },
] as const;

/** The brass rows: the caps, and the bars between the bands and round the belt. */
const RING_BARS = [0, 6, 12, 23, 29, 35, 41];

/**
 * One row of the great lens: a brass frame, two posts dividing it into a middle panel and narrow
 * side panels, a glare running down the left, each band's two tones striped across it, and in the
 * belt's middle panel the bullseye, white-hot, with the gold of the lamp's own light round it.
 */
function lensRow(r: number): string {
  const hw = r === 0 || r === LENS.h - 1 ? 10 : r === 1 || r === LENS.h - 2 ? 11.5 : 13;
  const band = BANDS.find((b) => r >= b.top && r <= b.bottom);
  return Array.from({ length: LENS.w }, (_, x) => {
    const dx = x + 0.5 - 13;
    if (Math.abs(dx) > hw) return '.';
    if (Math.abs(dx) > hw - 1 || RING_BARS.includes(r) || x === 7 || x === 18) return 'O';
    if (!band && x > 7 && x < 18) {
      const d = Math.hypot(dx, r + 0.5 - 18);
      return d < 2.3 ? 'W' : d < 3.5 ? 'w' : d < 4.6 ? 'y' : 'G';
    }
    if (x === 3) return 'w';
    if (!band) return r % 2 === 0 ? 'y' : 'G';
    return r % 2 === 0 ? band.lit : band.base;
  }).join('');
}

/** Lesson 20's pie: white, with its biggest slice, the red, pulled out to the right. 5x5. */
const PIE = ['.wRR.', 'wwRRR', 'wwwRR', 'wwww.', '.ww..'];
/** Lesson 21's dominoes: one white tile already down on its side, the next still standing. 9x5. */
const DOMINOES = ['......www', '......wKw', 'wwXww.XXX', 'wKXKw.wKw', 'wwXww.www'];
/** Lesson 22's rose-tinted spectacles: gold rims, pink glass, a bridge. 9x4. */
const SPECTACLES = ['.yyy.yyy.', 'yssyyyssy', 'yssy.yssy', '.yyy.yyy.'];
/** Lesson 23's die, red with white pips, showing three, its far side in shade. 5x5. */
const DIE = ['sRRRr', 'RwRRr', 'RRwRr', 'RRRwr', 'rrrrr'];
/** Lesson 24's chart: the board's gold box over a bar to the three lines of defence. 9x5. */
const CHART = ['...yyy...', '....y....', '.yyyyyyy.', '.y..y..y.', 'ww.ww.ww.'];

/** A design as a sprite, so rmStamp can lay it into the lens. */
const piece = (id: string, rows: string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'rm25'], rows });

/** Each band's piece at its place in the middle panel, which runs from x 8 to 17. */
const PIECES: readonly (readonly [PixelSprite, number, number])[] = [
  [piece('rm25-opener-pie', PIE), 10, 1],
  [piece('rm25-opener-dominoes', DOMINOES), 9, 7],
  [piece('rm25-opener-spectacles', SPECTACLES), 9, 25],
  [piece('rm25-opener-die', DIE), 10, 30],
  [piece('rm25-opener-chart', CHART), 9, 36],
];

/** The great lens, brass-framed, its five bands and their pieces round the bullseye. 26x42. */
const lens: PixelSprite = {
  id: 'rm25-opener-lens',
  name: 'great lens',
  tags: ['scene', 'rm25'],
  rows: PIECES.reduce((rows, [p, x, y]) => rmStamp(rows, p, x, y), Array.from({ length: LENS.h }, (_, r) => lensRow(r))),
};

/** The cast-iron pedestal the lens turns on, down to the deck. 14x3. */
const pedestal: PixelSprite = {
  id: 'rm25-opener-pedestal',
  name: 'pedestal',
  tags: ['scene', 'rm25'],
  rows: [
    '...DXXXXXXD...',
    '..DXXXXXXXXD..',
    'DDDDDDDDDDDDDD',
  ],
};

/** The polishing cloth in the keeper's hand. 3x3. */
const cloth: PixelSprite = { id: 'rm25-opener-cloth', name: 'cloth', tags: ['scene', 'rm25'], rows: ['ww.', 'wwx', '.xw'] };

/** Rain on the panes, three frames: the right-hand panes (24x36) and the left-hand panes over the keeper (24x17). */
const DROPS: readonly (readonly [number, number])[][] = [
  [[3, 2], [15, 5], [8, 11], [20, 15], [4, 21], [13, 27], [21, 31], [9, 33]],
  [[11, 1], [5, 8], [18, 9], [2, 16], [14, 19], [7, 25], [19, 28], [12, 34]],
  [[7, 4], [20, 3], [12, 13], [3, 12], [17, 22], [10, 29], [4, 30], [22, 24]],
];
const dropFrame = (w: number, h: number, frame: readonly (readonly [number, number])[]) =>
  rmPlot(w, h, frame.flatMap(([x, y]) => [[x, y, 'X'], [x - 1, y + 1, 'x']] as const));
const rainRight: PixelSprite = {
  id: 'rm25-opener-rain-right',
  name: 'rain on the panes',
  tags: ['scene', 'rm25'],
  rows: dropFrame(24, 36, DROPS[0]),
  frames: DROPS.map((frame) => dropFrame(24, 36, frame)),
  frameMs: 160,
};
const rainLeft: PixelSprite = {
  id: 'rm25-opener-rain-left',
  name: 'rain on the panes',
  tags: ['scene', 'rm25'],
  rows: dropFrame(24, 17, DROPS[1]),
  frames: [DROPS[1], DROPS[2], DROPS[0]].map((frame) => dropFrame(24, 17, frame)),
  frameMs: 170,
};

const base = rmCompose('rm25-opener-base', ground, [
  [lens, LENS.x, LENS.y],
  [pedestal, LENS.x + 6, LENS.y + LENS.h],
]);

export const rm25Opener: SceneArt = {
  id: 'rm25-opener',
  label: 'At the top of the lighthouse, the keeper polishes the great lens, its rings tinted in five colored bands that each carry a small pie, dominoes, rose-tinted spectacles, a die or a chart, around a white-hot center whose single beam shines out both ways into a storm toward a ship coming home.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: 56, y: 7 },
    { sprite: rainLeft, x: 2, y: 5 },
    { sprite: rainRight, x: 54, y: 5 },
    { sprite: rmShip, x: 67, y: 24, motion: { kind: 'bob', amp: 1, periodMs: 2400 } },
    { sprite: rmPortSwell, x: 55, y: 34, motion: { kind: 'drift', amp: 1, periodMs: 3000 } },
    { sprite: rmPortSwell, x: 68, y: 37, motion: { kind: 'drift', amp: 1, periodMs: 3400, phase: 0.5 } },
    { sprite: rmBeam('rm25-opener-beam-left', 26, 0.45), x: 1, y: 7, motion: { kind: 'twinkle', periodMs: 3200, min: 0.25 } },
    { sprite: rmFlip(rmBeam('rm25-opener-beam-right-source', 27, 0.4), 'rm25-opener-beam-right'), x: 53, y: 7, motion: { kind: 'twinkle', periodMs: 3200, min: 0.25, phase: 0.5 } },
    { sprite: rmLensGlow, x: LENS.x + 10, y: LENS.y + 16, motion: { kind: 'twinkle', periodMs: 1800, min: 0.3 } },
    { sprite: rmGlint, x: LENS.x + 15, y: LENS.y - 1, motion: { kind: 'twinkle', periodMs: 2300, min: 0.1 } },
    { sprite: rmGlint, x: LENS.x + LENS.w - 2, y: LENS.y + 26, motion: { kind: 'twinkle', periodMs: 2700, min: 0.1, phase: 0.5 } },
    { sprite: rmFlip(rmKeeperReach, 'rm25-opener-keeper'), x: 10, y: 22 },
    { sprite: cloth, x: 26, y: 34 },
  ],
};

/**
 * The emblem's five points, clockwise from the top, each lit on its left and shaded on its right:
 * the lens's five bands in the same order, so the star is the opener's light in small.
 */
const POINTS = [['N', 'n'], ['R', 'r'], ['F', 'f'], ['B', 'b'], ['P', 'p']] as const;

/** The star's outline: ten corners, outer points and the inner notches between them. */
const STAR = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  const radius = i % 2 === 0 ? 7.6 : 3.4;
  return [7.5 + radius * Math.cos(a), 8 + radius * Math.sin(a)] as const;
});

/** Whether (px, py) falls inside the star: an even-odd crossing count against its edges. */
function inStar(px: number, py: number): boolean {
  let inside = false;
  for (let i = 0, j = STAR.length - 1; i < STAR.length; j = i++) {
    const [xi, yi] = STAR[i];
    const [xj, yj] = STAR[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Lesson 25's emblem: a five-pointed star, one point for each pillar of the capstone in its band's
 * colour from the opener's lens (portfolio green, systemic red, behavioural pink, quantitative blue,
 * governance orchid), white where they meet, as the bands meet in the bullseye. 15x15.
 */
const emblemStar: PixelSprite = {
  id: 'rm25-emblem-star',
  name: 'five pillars',
  tags: ['rm', 'emblem', 'lesson 25'],
  rows: Array.from({ length: 15 }, (_, y) =>
    Array.from({ length: 15 }, (_, x) => {
      const px = x + 0.5;
      const py = y + 0.5;
      if (!inStar(px, py)) return '.';
      if (Math.hypot(px - 7.5, py - 8) < 1.7) return 'W';
      const angle = ((Math.atan2(px - 7.5, 8 - py) * 180) / Math.PI + 360) % 360;
      const k = Math.round(angle / 72) % 5;
      const offset = ((angle - k * 72 + 540) % 360) - 180;
      return POINTS[k][offset < 0 ? 0 : 1];
    }).join(''),
  ),
};

export const rm25Finish: SceneArt = rmKeepsakeGold(
  'rm25-finish',
  'A gold and white life ring hanging from a rope, with a five-pointed star at its center, its points green, red, pink, blue and orchid like the bands of the lighthouse lens, white where they meet.',
  emblemStar,
);

export const art: LessonArtSet = { opener: rm25Opener, backdrop: rmBackdropStorm, finish: rm25Finish };
