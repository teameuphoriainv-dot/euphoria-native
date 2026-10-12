/**
 * Risk Management lesson 25 opener, the advanced capstone: the top of the climb, inside the lantern
 * room itself. Lesson 10 stood the keeper out on the gallery to watch; this one is the light. The great
 * lens fills the room, prism rings above and below a bullseye burning white, every ring bending its
 * share of the lamp into one beam: integrated risk management, many disciplines and one light. The
 * keeper polishes it while the storm beats on the glass all round, and the beams go out both ways to a
 * ship coming home. Moving: the beams, the lens, lightning, rain on the panes, the ship and the swell.
 * The backdrop is the stormy capstone variant and the keepsake ring is gold.
 */
import type { PixelSprite } from '../types';
import { rmCompose, rmLightning, rmShip } from './rm-kit';
import { rmFlip, rmKeeperReach, rmPlot, rmPortSwell } from './rm-kit-a';
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
];

/** Dome, glazing, sill, the parapet's inner wall and the deck, with the storm in every pane. */
const ground = rmFill(
  Array.from({ length: 60 }, (_, y) => {
    if (y < 3) return 'K'.repeat(80);
    if (y === 3) return 'D'.repeat(80);
    if (y === 4 || y === 42 || y === 49) return 'X'.repeat(80);
    if (y < 42) return (y < 31 ? 'v' : y === 31 ? 'u' : y < 36 ? 'V' : 'v').repeat(80);
    if (y < 49) return 'k'.repeat(80);
    return (y === 54 || y === 58 ? 'D' : 'K').repeat(80);
  }),
  [
    ...WEATHER,
    [0, 79, 22, 'X'], [0, 79, 23, 'D'],
    ...BARS.flatMap((x): RmSpan[] => Array.from({ length: 37 }, (_, i): RmSpan[] => [[x, x, 5 + i, 'X'], [x + 1, x + 1, 5 + i, 'D']]).flat()),
  ],
);

/**
 * One row of the great lens: a brass frame, prism rings striped lit and gold above and below the
 * belt, a glare running down the glass, and in the belt's middle panel the bullseye, white-hot.
 */
function lensRow(r: number): string {
  const hw = r <= 1 || r >= 33 ? 9 : r <= 3 || r >= 31 ? 10.5 : 12;
  return Array.from({ length: 24 }, (_, x) => {
    const dx = x + 0.5 - 12;
    if (Math.abs(dx) > hw) return '.';
    if (Math.abs(dx) > hw - 1 || r === 0 || r === 34 || r === 10 || r === 25) return 'O';
    if (r === 1 || r === 33) return dx < 0 ? 'y' : 'G';
    if (x === 6 || x === 17) return 'O';
    if (r > 10 && r < 25 && x > 6 && x < 17) {
      const d = Math.hypot(dx, r + 0.5 - 17.5);
      return d < 2.2 ? 'W' : d < 3.6 ? 'w' : d < 4.8 ? 'y' : 'G';
    }
    if (x === 3) return 'w';
    return r % 2 === 0 ? 'y' : 'G';
  }).join('');
}

/** The great lens, brass-framed, its bullseye at (12, 17.5). 24x35. */
const lens: PixelSprite = {
  id: 'rm25-opener-lens',
  name: 'great lens',
  tags: ['scene', 'rm25'],
  rows: Array.from({ length: 35 }, (_, r) => lensRow(r)),
};

/** The cast-iron pedestal the lens turns on. 14x7. */
const pedestal: PixelSprite = {
  id: 'rm25-opener-pedestal',
  name: 'pedestal',
  tags: ['scene', 'rm25'],
  rows: [
    '..DXXXXXXXXD..',
    '...DXXXXXXD...',
    '....DXXXXD....',
    '....DXXXXD....',
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
  [lens, 28, 7],
  [pedestal, 33, 42],
]);

export const rm25Opener: SceneArt = {
  id: 'rm25-opener',
  label: 'At the top of the lighthouse, the keeper polishes the great golden lens as its beams shine out through the glass into a storm on both sides, toward a ship coming home.',
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
    { sprite: rmBeam('rm25-opener-beam-left', 27, 0.6), x: 1, y: 4, motion: { kind: 'twinkle', periodMs: 3200, min: 0.25 } },
    { sprite: rmFlip(rmBeam('rm25-opener-beam-right-source', 28, 0.4), 'rm25-opener-beam-right'), x: 52, y: 9, motion: { kind: 'twinkle', periodMs: 3200, min: 0.25, phase: 0.5 } },
    { sprite: rmLensGlow, x: 37, y: 23, motion: { kind: 'twinkle', periodMs: 1800, min: 0.3 } },
    { sprite: rmFlip(rmKeeperReach, 'rm25-opener-keeper'), x: 11, y: 22 },
    { sprite: cloth, x: 27, y: 34 },
  ],
};

/** The emblem's five points, clockwise from the top, each lit on its left and shaded on its right. */
const POINTS = [['R', 'r'], ['B', 'b'], ['N', 'n'], ['P', 'p'], ['G', 'g']] as const;

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
 * Lesson 25's emblem: a five-pointed star, one point for each pillar of the capstone (portfolio,
 * systemic, behavioural, quantitative, governance), white where they meet. 15x15.
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
  'A gold and white life ring hanging from a rope, with a five-pointed star at its center, each point a different color for the five parts of integrated risk management.',
  emblemStar,
);

export const art: LessonArtSet = { opener: rm25Opener, backdrop: rmBackdropStorm, finish: rm25Finish };
