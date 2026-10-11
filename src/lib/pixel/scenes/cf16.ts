/**
 * Corporate Finance lesson 16, International Corporate Finance: one company, many currencies.
 *
 * Opener: the map room. A world map fills the wall, its cities lit, and a gold coin flies across
 * it from New York to Tokyo: the company earns, borrows and pays in more than one money. Under
 * the map a rates board shows the dollar, the yen and the euro, their arrows flipping up and down
 * (the exchange rate risk), and the CFO gives the globe on its stand a spin. Only small layers
 * move: the flying coin, the city lights, the globe turning, the rate arrows.
 *
 * Keepsake: a desk globe on its gold stand.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfHall, cfShadowShort } from './cf-kit';
import { cfCfoReach } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** The world, 52x22, `#` for land: the Americas, Europe and Africa, Asia, Australia. */
const WORLD: readonly string[] = [
  '................#####...............................',
  '...##########....####.........###############.......',
  '.##############...##...#####.##################.....',
  '.###############....#.#########################.#...',
  '..##############....#.#########################.#...',
  '...############.......######.#################.#....',
  '....##########................###############.......',
  '.....########........#######################........',
  '........####........###########...####.####.........',
  '..........###.......###########....###..##..........',
  '...........#####.....##########....##....#####......',
  '..........#######.....########............#####.....',
  '..........#######.....########......................',
  '...........######......######.#.....................',
  '...........#####........####.............#######....',
  '............####.........##.............#########...',
  '............###.........................#########...',
  '.............##..........................#######....',
  '.............##............................####...#.',
  '..............#.....................................',
  '....................................................',
  '....................................................',
];

/** Cities, in map cells: New York, London, Zurich, Mumbai, Hong Kong, Tokyo, Sao Paulo, Sydney. */
const CITIES: readonly (readonly [number, number])[] = [[14, 5], [20, 4], [24, 5], [35, 9], [42, 7], [48, 4], [15, 13], [47, 16]];
const MAP = { x: 5, y: 6 } as const;

const isLand = (x: number, y: number) => WORLD[y]?.[x] === '#';

/** The map in a gold frame: navy sea, green land lit along its northern coasts, cities dim. */
const worldMap: PixelSprite = {
  id: 'cf16-world-map',
  name: 'cf16-world-map',
  tags: ['scene', 'cf16'],
  blurb: 'A gold-framed world map.',
  palette: CF_PALETTE,
  rows: [
    `.${'O'.repeat(54)}.`,
    `O${'g'.repeat(54)}O`,
    ...WORLD.map((row, y) => {
      const cells = [...row].map((_, x) => {
        if (CITIES.some(([cx, cy]) => cx === x && cy === y)) return 'O';
        if (!isLand(x, y)) return 'C';
        return isLand(x, y - 1) ? 'n' : 'N';
      });
      return `Og${cells.join('')}aO`;
    }),
    `O${'a'.repeat(54)}O`,
    `.${'O'.repeat(54)}.`,
  ],
};

/** The cities lit, half of them in each layer so they come and go in turn. */
const cityLights = (id: string, half: number): PixelSprite => ({
  id,
  name: id,
  tags: ['scene', 'cf16'],
  rows: Array.from({ length: WORLD.length }, (_, y) =>
    Array.from({ length: 52 }, (_, x) => (CITIES.some(([cx, cy], i) => i % 2 === half && cx === x && cy === y) ? 'y' : '.')).join(''),
  ),
});

const ARC = { from: 13, to: 47, w: 37, h: 6, low: 4, high: 0 } as const;

/** One frame of the flight: the coin's top-left at column `x` of the arc's box, on the parabola. */
function flightAt(x: number | null): string[] {
  const grid = Array.from({ length: ARC.h }, () => Array.from({ length: ARC.w }, () => '.'));
  if (x !== null) {
    const t = x / (ARC.w - 2);
    const y = Math.round(ARC.low - 4 * (ARC.low - ARC.high) * t * (1 - t));
    const coin = ['yG', 'Gg'];
    coin.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const line = grid[y + j];
        if (line) line[x + i] = ch;
      });
    });
  }
  return grid.map((row) => row.join(''));
}

/** A coin crossing the map, New York to Tokyo, then a beat before the next. Its still is mid-flight. */
const flight: PixelSprite = {
  id: 'cf16-opener-flight',
  name: 'cf16-opener-flight',
  tags: ['scene', 'cf16'],
  blurb: 'A gold coin flying across the map.',
  rows: flightAt(17),
  frames: [...Array.from({ length: 12 }, (_, i) => flightAt(Math.round((i * (ARC.w - 2)) / 11))), flightAt(null), flightAt(null)],
  frameMs: 200,
};

/** The flight path, dotted on the map. */
const trail: PixelSprite = {
  id: 'cf16-trail',
  name: 'cf16-trail',
  tags: ['scene', 'cf16'],
  rows: Array.from({ length: ARC.h }, (_, y) =>
    Array.from({ length: ARC.w }, (_, x) => {
      if (x % 4 !== 2 || x > ARC.w - 2) return '.';
      const t = x / (ARC.w - 2);
      return Math.round(ARC.low - 4 * (ARC.low - ARC.high) * t * (1 - t)) + 1 === y ? 'X' : '.';
    }).join(''),
  ),
};

/** Three currencies: the dollar in gold, the yen in white, the euro in blue. */
const DOLLAR: readonly string[] = ['..y..', '.yyyy', 'y.y..', '.yyy.', '..y.y', 'yyyy.', '..y..'];
const YEN: readonly string[] = ['w...w', '.w.w.', '..w..', 'wwwww', '..w..', 'wwwww', '..w..'];
const EURO: readonly string[] = ['..BBB', '.B...', 'BBBB.', '.B...', 'BBBB.', '.B...', '..BBB'];

/** The rates board: a gold frame, a dark face, the three symbols with room for an arrow after each; the arrows are a layer. */
const ratesBoard: PixelSprite = {
  id: 'cf16-rates-board',
  name: 'cf16-rates-board',
  tags: ['scene', 'cf16'],
  rows: (() => {
    const grid = Array.from({ length: 11 }, (_, y) =>
      Array.from({ length: 33 }, (_, x): string => {
        if (y === 0 || y === 10 || x === 0 || x === 32) return 'O';
        if (y === 1 || x === 1) return 'g';
        if (y === 9 || x === 31) return 'a';
        return 'K';
      }),
    );
    [DOLLAR, YEN, EURO].forEach((glyph, k) => {
      glyph.forEach((row, j) => {
        [...row].forEach((ch, i) => {
          const line = grid[2 + j];
          if (line && ch !== '.') line[2 + k * 10 + i] = ch;
        });
      });
    });
    return grid.map((row) => row.join(''));
  })(),
};

const ARROW_UP: readonly string[] = ['.N.', 'NNN', 'N.N'];
const ARROW_DOWN: readonly string[] = ['r.r', 'rrr', '.r.'];

/** The three arrows on one strip, `ups` saying which point up this frame. */
function arrowsAt(ups: readonly boolean[]): string[] {
  return [0, 1, 2].map((j) =>
    ups.map((up) => (up ? ARROW_UP : ARROW_DOWN)[j] ?? '...').join('.......'),
  );
}

/** The rates moving: each arrow flips on its own beat. Its still has the dollar up. */
const arrows: PixelSprite = {
  id: 'cf16-opener-arrows',
  name: 'cf16-opener-arrows',
  tags: ['scene', 'cf16'],
  blurb: 'Three rate arrows flipping up and down.',
  rows: arrowsAt([true, false, true]),
  frames: [arrowsAt([true, false, true]), arrowsAt([true, true, false]), arrowsAt([false, true, true]), arrowsAt([true, false, false])],
  frameMs: 1000,
};

const GLOBE = { size: 13, r2: 40, texture: 26, step: 2 } as const;

/** The land as it wraps round the globe, 26 columns for the whole way round. */
const GLOBE_LAND: readonly string[] = [
  '..........................',
  '...###......#####.........',
  '..#####....#######...##...',
  '..######..##########.###..',
  '...#####...#########..##..',
  '....###......######.......',
  '.....##.......####........',
  '.....###......###.....##..',
  '......##.......#.....####.',
  '......##.............####.',
  '.......#..............##..',
  '..........................',
  '..........................',
];

/**
 * The globe turned by `f` steps: the land texture scrolled under a disc, lit on its upper left.
 * Computed, because thirteen hand-drawn turns of a sphere would each bend the coasts differently.
 */
function globeAt(f: number): string[] {
  return Array.from({ length: GLOBE.size }, (_, y) =>
    Array.from({ length: GLOBE.size }, (_, x) => {
      const dx = x - 6;
      const dy = y - 6;
      if (dx * dx + dy * dy > GLOBE.r2) return '.';
      const land = GLOBE_LAND[y]?.[(x + f * GLOBE.step) % GLOBE.texture] === '#';
      const light = dx + dy;
      if (land) return light < -4 ? 'm' : light > 4 ? 'n' : 'N';
      return light < -4 ? 'B' : light > 4 ? 'C' : 'b';
    }).join(''),
  );
}

const globe: PixelSprite = {
  id: 'cf16-opener-globe',
  name: 'cf16-opener-globe',
  tags: ['scene', 'cf16'],
  blurb: 'A globe turning.',
  palette: CF_PALETTE,
  rows: globeAt(0),
  frames: Array.from({ length: GLOBE.texture / GLOBE.step }, (_, f) => globeAt(f)),
  frameMs: 260,
};

/** The globe's gold meridian on its right side, pivots top and bottom, and a walnut tripod. */
const globeStand: PixelSprite = {
  id: 'cf16-globe-stand',
  name: 'cf16-globe-stand',
  tags: ['scene', 'cf16'],
  palette: CF_PALETTE,
  rows: (() => {
    const grid = Array.from({ length: 22 }, () => Array.from({ length: 17 }, () => '.'));
    const put = (x: number, y: number, ch: string) => {
      const line = grid[y];
      if (line && x >= 0 && x < 17) line[x] = ch;
    };
    for (let y = 0; y <= 16; y += 1) {
      for (let x = 8; x < 17; x += 1) {
        const r2 = (x - 8) * (x - 8) + (y - 8) * (y - 8);
        if (r2 >= 52 && r2 <= 66) put(x, y, x > 12 && y > 8 ? 'g' : 'G');
      }
    }
    put(8, 0, 'O');
    put(8, 16, 'O');
    put(8, 17, 'A');
    put(8, 18, 'A');
    [[7, 19], [9, 19], [6, 20], [10, 20]].forEach(([x, y]) => put(x ?? 0, y ?? 0, 'A'));
    [5, 6, 10, 11].forEach((x) => put(x, 21, 'O'));
    return grid.map((row) => row.join(''));
  })(),
};

const base = cfCompose('cf16-opener-base', cfHall, [
  [worldMap, 3, 4],
  [trail, MAP.x + ARC.from, MAP.y],
  [ratesBoard, 3, 32],
  [globeStand, 62, 35],
  [cfShadowShort, 49, 56],
  [cfCfoReach, 46, 30],
], 'The still map room: the world map and its flight path, the rates board, the globe stand, the CFO.');

export const cf16Opener: SceneArt = {
  id: 'cf16-opener',
  label: 'A finance chief spins a globe beside a world map where a gold coin flies from New York to Tokyo, under a board of dollar, yen and euro rates flipping up and down.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: cityLights('cf16-opener-cities-a', 0), x: MAP.x, y: MAP.y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: cityLights('cf16-opener-cities-b', 1), x: MAP.x, y: MAP.y, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.5, min: 0.2 } },
    { sprite: flight, x: MAP.x + ARC.from, y: MAP.y },
    { sprite: arrows, x: 11, y: 36 },
    { sprite: globe, x: 64, y: 37 },
  ],
};

/** Lesson 16's emblem: a desk globe, the Americas facing out, on a gold meridian and stand. */
const EMBLEM_LAND = new Set([
  '4,3', '5,3', '6,3', '3,4', '4,4', '5,4', '6,4', '7,4', '3,5', '4,5', '5,5', '6,5', '4,6', '5,6', '5,7', '6,7',
  '6,8', '6,9', '7,9', '7,10', '7,11', '9,4', '10,4', '9,5', '10,5', '11,5', '10,6', '11,6',
]);

const emblemGlobe: PixelSprite = {
  id: 'cf16-emblem-globe',
  name: 'cf16-emblem-globe',
  tags: [],
  blurb: 'A blue and green desk globe on a gold stand.',
  palette: CF_PALETTE,
  rows: Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      const dx = x - 7;
      const dy = y - 7;
      const r2 = dx * dx + dy * dy;
      if (r2 <= 26) {
        const light = dx + dy;
        if (EMBLEM_LAND.has(`${String(x)},${String(y)}`)) return light < -3 ? 'm' : 'N';
        return light < -4 ? 'B' : light > 4 ? 'C' : 'b';
      }
      if (x >= 7 && r2 >= 36 && r2 <= 48 && y <= 13) return x > 10 && y > 7 ? 'g' : 'G';
      if (x === 7 && (y === 0 || y === 14)) return 'O';
      if (y === 15 && x >= 4 && x <= 10) return x === 4 || x === 10 ? 'O' : 'g';
      return '.';
    }).join(''),
  ),
};

export const cf16Finish = cfKeepsake(
  'cf16-finish',
  'A crystal award on a gold stand with a desk globe inside, and small sparkles around it.',
  emblemGlobe,
);

export const art: LessonArtSet = { opener: cf16Opener, backdrop: cfBackdrop, finish: cf16Finish };
