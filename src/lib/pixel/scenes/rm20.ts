/**
 * Risk Management lesson 20 opener, Portfolio Risk Decomposition: the ship is the portfolio, and here
 * it is cut open from deck to keel to show what it carries. Four holds, one for each source of risk:
 * the market's in red, the sector's in orchid, the style factor's in green, what is left to single
 * names in blue, each as wide as its share of the total. One hold carries two fifths of everything,
 * and from the rowboat alongside, the keeper points at it. Moving: the pennants, the stern lantern,
 * the rowboat on the swell, a gull, the stars.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { rmCompose, rmGull, rmKeepsake, rmSwell } from './rm-kit';
import { rmKeeperReach, rmMark, rmPortSwell, rmStar } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { rmFill } from './rm-kit-b';
import type { RmSpan } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** Points along a straight line, end to end: a stay or a bowsprit. */
function line(x0: number, y0: number, x1: number, y1: number, ch: string): RmPoint[] {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  return Array.from({ length: n + 1 }, (_, i): RmPoint => [Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), ch]);
}

/** The hull's sides, row by row from under the rail (y 33) to the keel (y 47): left and right edges. */
const HULL: readonly (readonly [number, number])[] = [
  [5, 55], [5, 55], [6, 55], [6, 55], [6, 54], [7, 54], [7, 54], [7, 54],
  [7, 53], [7, 53], [8, 53], [8, 52], [9, 51], [11, 49], [14, 46],
];

/**
 * The four holds, left to right, each as wide as its share of the ship's risk: idiosyncratic 20%,
 * style 15%, sector 25%, market 40%. Start x, end x, crate face, crate seam.
 */
const HOLDS: readonly (readonly [number, number, string, string])[] = [
  [9, 16, 'B', 'b'],
  [18, 23, 'N', 'n'],
  [25, 34, 'P', 'p'],
  [36, 51, 'R', 'r'],
];

/** Crates stacked in three tiers, the seams staggered like brickwork. */
function cargo(): RmPoint[] {
  const points: RmPoint[] = [];
  for (const [x0, x1, face, seam] of HOLDS) {
    for (let y = 34; y <= 44; y++) {
      for (let x = x0; x <= x1; x++) {
        const tier = Math.floor((y - 34) / 4);
        const shift = tier === 1 ? 2 : 0;
        const edge = (y - 34) % 4 === 3 || (x - x0 + shift) % 4 === 3;
        points.push([x, y, edge ? seam : face]);
      }
    }
  }
  return points;
}

/** A crescent moon, the bite taken from its right. */
function moon(): RmPoint[] {
  const points: RmPoint[] = [];
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const d = (x - 4) ** 2 + (y - 4) ** 2;
      if (d <= 16.5 && (x - 6.2) ** 2 + (y - 3) ** 2 > 13) points.push([66 + x, 3 + y, d <= 9 ? 'w' : 'y']);
    }
  }
  return points;
}

const STARS: readonly RmPoint[] = [[4, 12, 'x'], [12, 3, 'x'], [28, 6, 'x'], [47, 2, 'x'], [58, 9, 'x'], [63, 23, 'x'], [76, 17, 'x'], [72, 30, 'x'], [31, 26, 'x'], [10, 19, 'x']];

/** The four sails furled on their yards: left x, right x, row. */
const SAILS: readonly (readonly [number, number, number])[] = [[16, 24, 13], [14, 26, 20], [35, 45, 11], [33, 47, 18]];

const SPANS: readonly RmSpan[] = [
  // sea streaks
  [60, 66, 40, 'u'], [0, 4, 42, 'u'], [68, 75, 44, 'U'], [56, 60, 49, 'u'], [2, 8, 51, 'u'], [24, 31, 53, 'u'], [40, 47, 56, 'u'], [12, 17, 58, 'u'],
  // the hull, filled from under the rail to the keel
  ...HULL.map(([l, r], i): RmSpan => [l, r, 33 + i, 'O']),
  [6, 54, 33, 'g'],
  // the forecastle and the stern castle with its lit cabin windows
  [5, 11, 30, 'G'], [5, 11, 31, 'O'],
  [46, 56, 27, 'G'], [46, 56, 28, 'O'], [46, 56, 29, 'O'], [46, 56, 30, 'O'], [46, 56, 31, 'O'],
  [48, 48, 29, 'y'], [51, 51, 29, 'y'], [54, 54, 29, 'y'],
  // the rail, lit
  [5, 55, 32, 'G'], [5, 5, 32, 'y'],
  // yards, each a pixel wider than the sail furled along its top
  ...SAILS.map(([l, r, y]): RmSpan => [l, r, y, 'w']),
  ...SAILS.map(([l, r, y]): RmSpan => [l - 1, r + 1, y + 1, 'g']),
  // the cutaway: lit edges round the holds
  [8, 52, 45, 'g'],
];

const rigging: RmPoint[] = [
  ...line(20, 10, 0, 27, 'D'),
  ...line(40, 8, 21, 22, 'D'),
  ...line(40, 8, 56, 26, 'D'),
];

const masts: RmPoint[] = [
  ...Array.from({ length: 23 }, (_, i): RmPoint => [20, 9 + i, 'g']),
  ...Array.from({ length: 25 }, (_, i): RmPoint => [40, 7 + i, 'g']),
  ...line(4, 30, 0, 27, 'g'),
];

/** The sails' bunching: every second pixel of a furled sail in shade. */
const furl: RmPoint[] = SAILS.flatMap(([l, r, y]) =>
  Array.from({ length: r - l + 1 }, (_, i): RmPoint => [l + i, y, 'x']).filter(([x]) => x % 2 === 1),
);

const cutEdges: RmPoint[] = [
  ...Array.from({ length: 12 }, (_, i): RmPoint => [8, 34 + i, 'g']),
  ...Array.from({ length: 12 }, (_, i): RmPoint => [52, 34 + i, 'g']),
  ...[17, 24, 35].flatMap((x) => Array.from({ length: 11 }, (_, i): RmPoint => [x, 34 + i, 'g'])),
];

const night = Array.from({ length: 60 }, (_, y) => (y < 37 ? 'v' : y === 37 ? 'u' : y < 44 ? 'V' : 'v').repeat(80));
const withRigging = rmMark(rmMark(night, [...STARS, ...moon()]), rigging);
const ground = rmMark(rmFill(rmMark(withRigging, masts), SPANS), [...furl, ...cargo(), ...cutEdges]);

/** The keeper from the waist up, as the rowboat's side hides the rest. 18x20. */
const keeperInBoat: PixelSprite = { ...rmKeeperReach, id: 'rm20-opener-keeper', name: 'keeper in a rowboat', rows: rmKeeperReach.rows.slice(0, 20) };

/** The rowboat: white strakes, a blue stripe. Lay it at the keeper's y + 19. 22x4. */
const rowboat: PixelSprite = {
  id: 'rm20-opener-rowboat',
  name: 'rowboat',
  tags: ['scene', 'rm20'],
  rows: [
    'wwwwwwwwwwwwwwwwwwwwwx',
    '.XbbbbbbbbbbbbbbbbbbX.',
    '..XxxxxxxxxxxxxxxxxX..',
    '...XXXXXXXXXXXXXXXX...',
  ],
};

/** A masthead pennant streaming out to the right. Framed, 5x3. */
const pennant = (id: string, lit: string, shade: string): PixelSprite => ({
  id,
  name: 'pennant',
  tags: ['scene', 'rm20'],
  rows: [`${lit}${lit}${shade}..`, `${lit}${lit}${lit}${lit}${shade}`, `${lit}${shade}...`],
  frames: [
    [`${lit}${lit}${shade}..`, `${lit}${lit}${lit}${lit}${shade}`, `${lit}${shade}...`],
    [`${lit}${lit}${lit}${shade}.`, `${lit}${lit}${lit}${shade}.`, `${lit}${shade}...`],
    [`${lit}${shade}...`, `${lit}${lit}${lit}${lit}${shade}`, `${lit}${lit}${shade}..`],
  ],
  frameMs: 320,
});

/** The stern lantern, lit; give it a `twinkle`. */
const sternLight: PixelSprite = { id: 'rm20-opener-stern-light', name: 'stern light', tags: ['scene', 'rm20'], rows: ['y', 'O'] };

const bob = { kind: 'bob', amp: 1, periodMs: 2800 } as const;

export const rm20Opener: SceneArt = {
  id: 'rm20-opener',
  label: 'On a starry night, a lighthouse keeper in a rowboat points at a ship cut open to show four cargo holds in four colors, the red hold by far the largest.',
  width: 80,
  height: 60,
  base: rmCompose('rm20-opener-base', ground, []),
  layers: [
    { sprite: rmStar, x: 9, y: 7, motion: { kind: 'twinkle', periodMs: 3600, min: 0.2 } },
    { sprite: rmStar, x: 33, y: 3, motion: { kind: 'twinkle', periodMs: 4300, min: 0.2, phase: 0.5 } },
    { sprite: rmStar, x: 60, y: 15, motion: { kind: 'twinkle', periodMs: 3900, min: 0.2, phase: 0.3 } },
    { sprite: pennant('rm20-opener-pennant-fore', 'G', 'g'), x: 21, y: 9 },
    { sprite: { ...pennant('rm20-opener-pennant-main', 'R', 'r'), frameMs: 280 }, x: 41, y: 7 },
    { sprite: sternLight, x: 57, y: 25, motion: { kind: 'twinkle', periodMs: 2600, min: 0.4 } },
    { sprite: rmGull, x: 62, y: 18, motion: { kind: 'drift', amp: 3, periodMs: 6000 } },
    { sprite: rmSwell, x: 2, y: 45, motion: { kind: 'drift', amp: 2, periodMs: 4200 } },
    { sprite: rmSwell, x: 24, y: 46, motion: { kind: 'drift', amp: 2, periodMs: 3800, phase: 0.5 } },
    { sprite: keeperInBoat, x: 58, y: 28, motion: bob },
    { sprite: rowboat, x: 57, y: 47, motion: bob },
    { sprite: rmPortSwell, x: 62, y: 52, motion: { kind: 'drift', amp: 1, periodMs: 3000, phase: 0.3 } },
  ],
};

/** Lesson 20's emblem: risk as a pie in four slices, the biggest pulled out in red. 16x16. */
const emblemPie: PixelSprite = {
  id: 'rm20-emblem-pie',
  name: 'risk pie',
  tags: ['rm', 'emblem', 'lesson 20'],
  rows: Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      const polar = (cx: number, cy: number) => {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        return { d: Math.hypot(dx, dy), a: ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360 };
      };
      const red = polar(8.9, 7.5);
      if (red.d <= 6.4 && red.a < 144) return red.d > 5.3 ? 'r' : 'R';
      const rest = polar(7.5, 8);
      if (rest.d > 6.4 || rest.a < 147) return '.';
      const [lit, shade] = rest.a < 237 ? ['P', 'p'] : rest.a < 309 ? ['B', 'b'] : ['N', 'n'];
      return rest.d > 5.3 ? shade : lit;
    }).join(''),
  ),
};

export const rm20Finish: SceneArt = rmKeepsake(
  'rm20-finish',
  'A red and white life ring hanging from a rope, with a pie chart at its center cut in four, its biggest red slice pulled out.',
  emblemPie,
);

export const art: LessonArtSet = { opener: rm20Opener, backdrop: rmBackdrop, finish: rm20Finish };
