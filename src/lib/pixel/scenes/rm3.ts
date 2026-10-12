/**
 * Risk Management lesson 3 opener, Value at Risk Deep Dive: the same storm, two barometers.
 *
 * The London Whale in one room. JPMorgan's desk swapped its VaR model for one that halved the
 * reported risk ($129M became $67M) while not one trade changed. Two barometers in identical brass
 * cases: the swapped-in one stands propped on the chart table, its needle still, only halfway round
 * (half the original's sweep from fair, at change); the original hangs on its hook in the middle of
 * the wall, its needle deep in the red and trembling. The keeper, lifted fist on its rim, is the
 * risk manager putting the honest model back. The storm in the porthole is the one weather both are
 * measuring: the real risk never changed, only the number. Moving: the original's needle, a glint on
 * its hook, the lightning, rain and swell in the porthole.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmChartTable, rmCompose, rmKeepsake, rmLightning, rmRopeCoil, rmWatchRoom } from './rm-kit';
import { type RmPoint, rmGlint, rmKeeperLift, rmMark, rmPortRain, rmPortSwell, rmPorthole } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/**
 * A barometer's dial with no needle, 21x21: brass bezel, the fair (green), change (gold) and storm
 * (red) arc, a label line. The arc sweeps from fair, low on the left, over the top to storm, low
 * on the right; the hub is at (10, 10).
 */
const DIAL = [
  '.......OOOOOOO.......',
  '.....OOyyyyyyyOO.....',
  '....OyyyGGGGGGGgO....',
  '...OyGGOOOOOOOGggO...',
  '..OyGOONGGGGGROOggO..',
  '..OyONNwwwwwwwRROgO..',
  '.OyONwwwwwwwwwwwROgO.',
  '.OyONwwwwwwwwwwwROgO.',
  'OGONwwwwwwwwwwwwwROgO',
  'OGONwwwwwwwwwwwwwROgO',
  'OGONwwwwwwwwwwwwwROgO',
  'OGONwwwwwwwwwwwwwROgO',
  'OGOwwwwwwwwwwwwwwwOgO',
  '.OGOwwwwxxxxxwwwwOgO.',
  '.OgOwwwwwwwwwwwwwOgO.',
  '..OgOwwwwwwwwwwwOgO..',
  '..OggOOwwwwwwwOOggO..',
  '...OgggOOOOOOOgggO...',
  '....OgggggggggggO....',
  '.....OOgggggggOO.....',
  '.......OOOOOOO.......',
];

/** The arc runs from fair at 188 degrees (just under nine o'clock) clockwise to storm at -8. */
const FAIR_DEG = 188;
/** The original model's reading, deep in the storm arc, and the swapped model's: half as far round. */
const TRUE_ALONG = 170;
const SWAPPED_ALONG = TRUE_ALONG / 2;

/**
 * A needle from the hub at `deg` (0 = three o'clock, counter-clockwise), two pixels thick so it reads
 * on a phone, with a short tail.
 */
function needle(deg: number): RmPoint[] {
  const a = (deg * Math.PI) / 180;
  const flat = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a));
  const at = (t: number): RmPoint[] => {
    const x = Math.round(10 + t * Math.cos(a));
    const y = Math.round(10 - t * Math.sin(a));
    return [[x, y, 'K'], flat ? [x, y + 1, 'K'] : [x + 1, y, 'K']];
  };
  return [...at(-1), ...[1, 2, 3, 4, 5, 6].flatMap(at), [10, 10, 'O']];
}

const trueDeg = FAIR_DEG - TRUE_ALONG;

/** The original barometer: its needle deep in the red, trembling either side of its reading. Framed, 21x21. */
const originalBarometer: PixelSprite = {
  id: 'rm3-opener-barometer-original',
  name: 'original barometer',
  tags: ['scene', 'rm3'],
  rows: rmMark(DIAL, needle(trueDeg)),
  frames: [trueDeg, trueDeg + 6, trueDeg, trueDeg - 6].map((d) => rmMark(DIAL, needle(d))),
  frameMs: 300,
};

/** The swapped-in barometer, the same case, its needle still and only halfway round. 21x21. */
const swappedBarometer: PixelSprite = {
  id: 'rm3-opener-barometer-swapped',
  name: 'swapped barometer',
  tags: ['scene', 'rm3'],
  rows: rmMark(DIAL, needle(FAIR_DEG - SWAPPED_ALONG)),
};

/** The brass hook in the middle of the wall and the barometer's hanging ring. 5x5. */
const hook: PixelSprite = {
  id: 'rm3-opener-hook',
  name: 'hook',
  tags: ['scene', 'rm3'],
  rows: [
    '.OGO.',
    '..G..',
    '.OyO.',
    'O...O',
    '.O.O.',
  ],
};

/** The brass foot the swapped barometer stands propped in on the table. 9x2. */
const foot: PixelSprite = {
  id: 'rm3-opener-foot',
  name: 'barometer foot',
  tags: ['scene', 'rm3'],
  rows: [
    '.OGyGGgO.',
    'OOOOOOOOO',
  ],
};

/** Floor shadows under the table and the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm3-opener-floor-shadow',
  name: 'rm3-opener-floor-shadow',
  tags: ['scene', 'rm3'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZZZZZZZZZ......................ZZZZZZZZZZZZZZ.',
    '....ZZZZZZZZZZZZZZZZZZZZ..........................ZZZZZZZZZZ...',
  ],
};

const PORTHOLE = { x: 58, y: 3 };
const TABLE = { x: 2, y: 38 };
const SWAPPED = { x: 4, y: 16 };
const ORIGINAL = { x: 27, y: 14 };
/** The keeper's lifted fist (rmKeeperLift columns 0 to 3, rows 7 to 9) on the original's rim. */
const KEEPER = { x: ORIGINAL.x + 17, y: 23 };

const base = rmCompose('rm3-opener-base', rmWatchRoom(80, 60, 50), [
  [rmPorthole, PORTHOLE.x, PORTHOLE.y],
  [floorShadow, 1, 52],
  [rmChartTable, TABLE.x, TABLE.y],
  [swappedBarometer, SWAPPED.x, SWAPPED.y],
  [foot, SWAPPED.x + 6, SWAPPED.y + 20],
  [hook, ORIGINAL.x + 8, ORIGINAL.y - 5],
  [rmRopeCoil, 63, 51],
]);

export const rm3Opener: SceneArt = {
  id: 'rm3-opener',
  label: 'In the same storm two barometers in identical brass cases disagree: the swapped-in one propped on the chart table points only halfway round, while a lighthouse keeper hangs the original back on its hook with its needle deep in the red, as lightning flashes in a porthole.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: PORTHOLE.x + 6, y: PORTHOLE.y + 3 },
    { sprite: rmPortSwell, x: PORTHOLE.x + 5, y: PORTHOLE.y + 10, motion: { kind: 'drift', amp: 1, periodMs: 3000 } },
    { sprite: rmPortRain, ...PORTHOLE },
    { sprite: originalBarometer, ...ORIGINAL },
    { sprite: rmGlint, x: ORIGINAL.x + 8, y: ORIGINAL.y - 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: rmKeeperLift, ...KEEPER },
  ],
};

/**
 * Lesson 3's emblem: one dial, two readings. A white face marked fair (green) at the left end of its
 * sweep and storm (red) at the right; a bold green needle for the swapped model's reported VaR, only
 * halfway round, and a bold red one for the original's, deep toward storm: same storm, half the
 * number. A half dial, so it reads as a gauge and not a clock; the needles stop short of the marks so
 * each stays its own shape. 16x10, inside the ring.
 */
const emblemTwoNeedles: PixelSprite = (() => {
  const hub = { x: 7.5, y: 9 };
  const cells: string[][] = Array.from({ length: 10 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
    if (y === 9) return 'O';
    const dx = x - hub.x;
    const dy = y - hub.y;
    const d = Math.hypot(dx, dy);
    if (d > 8.4) return '.';
    if (d > 7.5) return 'O';
    if (d > 6.6) return dx < -2 ? 'y' : dx > 2 ? 'g' : 'G';
    const deg = (Math.atan2(-dy, dx) * 180) / Math.PI;
    if (d > 5.2 && deg < 35) return 'R';
    if (d > 5.2 && deg > 145) return 'N';
    return 'w';
  }));
  const hand = (deg: number, ink: string, lit: string) => {
    const a = (deg * Math.PI) / 180;
    const flat = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a));
    [1, 2, 3, 4, 5].forEach((t) => {
      const x = Math.round(hub.x - 0.5 + t * Math.cos(a));
      const y = Math.round(hub.y - 1 - t * Math.sin(a));
      cells[y][x] = t === 5 ? lit : ink;
      if (flat) cells[y + 1][x] = ink;
      else cells[y][x + 1] = ink;
    });
  };
  hand(FAIR_DEG - SWAPPED_ALONG, 'n', 'N');
  hand(trueDeg, 'r', 'R');
  cells[8][7] = 'K';
  cells[8][8] = 'K';
  return { id: 'rm3-emblem-two-needles', name: 'two needles', tags: ['rm', 'emblem', 'lesson 3'], rows: cells.map((r) => r.join('')) };
})();

export const rm3Finish: SceneArt = rmKeepsake(
  'rm3-finish',
  'A red and white life ring hanging from a rope, with a brass half dial at its center holding two needles, a green one pointing only halfway round and a red one pointing deep toward the red storm mark.',
  emblemTwoNeedles,
);

export const art: LessonArtSet = { opener: rm3Opener, backdrop: rmBackdrop, finish: rm3Finish };
