/**
 * Risk Management lesson 10 opener, the capstone: the CRO's dashboard. The first nine lessons each
 * gave the keeper one instrument; here they hang together on one board and are read at once. The
 * barometer is VaR (lessons 1 to 3), its needle up between the green and the red, short of the
 * limit. The harbour wall is CET1 capital (lesson 9), built in its four courses and standing far
 * above the sea. The load under its AAA tag rides its gold chain, the credit book (lesson 4). The
 * hourglass is liquidity (lesson 5), and its top bulb has nearly run out under a red lamp. Three read
 * safe and one does not, the picture the lesson warns about: SVB passed its capital tests in the week
 * its cash ran out. The keeper points at the one in the red while the storm works at the porthole.
 * Nothing on the board moves its reading; what moves is the lamps, the trickle of sand, the storm and
 * a glint on the brass. The backdrop is the stormy capstone variant and the keepsake ring is gold.
 */
import type { PixelSprite } from '../types';
import { RM_PALETTE, rmCompose, rmLightning, rmStamp, rmWatchRoom } from './rm-kit';
import { rmGlint, rmKeeperReach, rmMark, rmPortRain, rmPortSwell, rmPorthole } from './rm-kit-a';
import { rmBackdropStorm, rmFill, rmKeepsakeGold } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the board ───────────────────────────────────────────────────────────────────────────────── */

/** Where the instrument board hangs, and its four cells' top-left corners, in scene pixels. */
const BOARD = { x: 1, y: 4, w: 56, h: 42 };
const COL = [BOARD.x + 2, BOARD.x + 28];
const ROW = [BOARD.y + 2, BOARD.y + 22];

/**
 * The instrument board: a dark slate panel in an iron frame, lit along its top and left edges, split
 * into four cells, one for each instrument. 56x42.
 */
const board: PixelSprite = {
  id: 'rm10-opener-board',
  name: 'instrument board',
  tags: ['scene', 'rm10'],
  rows: Array.from({ length: BOARD.h }, (_, y) =>
    Array.from({ length: BOARD.w }, (_, x) => {
      if (y === 0 || x === 0 || y === BOARD.h - 1 || x === BOARD.w - 1) return 'D';
      if (y === 1 || x === 1) return 'X';
      if (y === BOARD.h - 2 || x === BOARD.w - 2) return 'k';
      if (x === 27 || y === 21) return 'D';
      return 'K';
    }).join(''),
  ),
};

/* ── VaR: the barometer ──────────────────────────────────────────────────────────────────────── */

/**
 * The barometer of lessons 1 to 3 as a round brass dial `n` pixels across (odd): a rim, a bezel lit
 * from the top left, a dark ring inside it, then the arc's two ends, fair green from 205 degrees down
 * to 140 and storm red from 55 round to -25, with the white face open between them (a gold change zone
 * there ran into the brass), and a still needle at `deg` (0 is three o'clock, counter-clockwise), two
 * pixels thick so it reads on a phone.
 */
function dial(id: string, n: number, deg: number): PixelSprite {
  const c = (n - 1) / 2;
  const cells: string[][] = Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => {
      const dx = x - c;
      const dy = c - y;
      const d = Math.hypot(dx, dy);
      if (d > c + 0.5) return '.';
      if (d > c - 0.5) return 'O';
      if (d > c - 1.5) return dx - dy < -c ? 'y' : dx - dy > c ? 'g' : 'G';
      if (d > c - 2.2) return 'O';
      const a = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      if (d > c - 3.3 && a > 140 && a <= 205) return 'N';
      if (d > c - 3.3 && (a <= 55 || a >= 335)) return 'R';
      return 'w';
    }),
  );
  const t = (deg * Math.PI) / 180;
  const flat = Math.abs(Math.cos(t)) > Math.abs(Math.sin(t));
  for (let r = -1; r <= c - 3.4; r++) {
    const x = Math.round(c + r * Math.cos(t));
    const y = Math.round(c - r * Math.sin(t));
    cells[y][x] = 'K';
    if (flat) cells[y + 1][x] = 'K';
    else cells[y][x + 1] = 'K';
  }
  cells[c][c] = 'O';
  return { id, name: id, tags: ['scene', 'rm10'], rows: cells.map((row) => row.join('')) };
}

/** VaR at 80 percent of its limit: the needle four fifths of the way round from fair to the red. 17x17. */
const varDial = dial('rm10-opener-var-dial', 17, 205 - 0.8 * 150);

/* ── CET1: the harbour wall ──────────────────────────────────────────────────────────────────── */

/** One course of the wall, six blocks wide: a joint in its darker step at `joint`. */
const course = (y0: number, y1: number, face: string, joint: number, seam: string): [number, number, number, string][] =>
  Array.from({ length: y1 - y0 + 1 }, (_, i): [number, number, number, string][] => [[7, 12, y0 + i, face], [joint, joint, y0 + i, seam]]).flat();

/**
 * Lesson 9's harbour wall in section, framed like a gauge: its four courses stacked from the grey
 * CET1 footing up through the teal and blue buffers to the orchid surcharge, the open sea on the
 * right breaking a long way below its top, the flat harbour behind it on the left. 19x17.
 */
const wallGauge: PixelSprite = {
  id: 'rm10-opener-wall-gauge',
  name: 'harbour wall gauge',
  tags: ['scene', 'rm10'],
  palette: RM_PALETTE,
  rows: rmFill(
    Array.from({ length: 17 }, (_, y) => (y === 0 || y === 16 ? 'D'.repeat(19) : `D${'v'.repeat(17)}D`)),
    [
      [3, 3, 3, 'x'], [15, 15, 2, 'x'], [16, 16, 6, 'x'],
      ...course(2, 3, 'P', 10, 'p'), [7, 12, 2, 'q'],
      ...course(4, 5, 'B', 8, 'b'),
      ...course(6, 8, 'T', 11, 't'),
      ...course(9, 15, 'X', 9, 'D'), [7, 12, 9, 'x'],
      [13, 17, 10, 'w'], [13, 13, 9, 'w'], [13, 17, 11, 'U'], [13, 17, 12, 'u'], [13, 17, 13, 'V'], [13, 17, 14, 'V'], [13, 17, 15, 'V'],
      [1, 6, 12, 'u'], [1, 6, 13, 'V'], [1, 6, 14, 'V'], [1, 6, 15, 'V'],
    ],
  ),
};

/* ── credit: the AAA load ────────────────────────────────────────────────────────────────────── */

/** 3x5 capital A for the rating tag, as lesson 4 draws it; `#` is ink. */
const LETTER_A = ['.#.', '#.#', '###', '#.#', '#.#'];

/** Lesson 4's AAA tag: three green letters on a dark plate. 13x7. */
const aaaTag: PixelSprite = {
  id: 'rm10-opener-aaa-tag',
  name: 'AAA tag',
  tags: ['scene', 'rm10'],
  rows: [
    '.DDDDDDDDDDD.',
    ...LETTER_A.map((row) => {
      const ink = [...row].map((ch) => (ch === '#' ? 'N' : 'K')).join('');
      return `D${ink}K${ink}K${ink}D`;
    }),
    '.DDDDDDDDDDD.',
  ],
};

/** Lesson 4's stout gold chain, and the crate it holds up on its lifting ring. 11x11. */
const aaaLoad: PixelSprite = {
  id: 'rm10-opener-aaa-load',
  name: 'AAA load',
  tags: ['scene', 'rm10'],
  rows: [
    '....GyG....',
    '....G.G....',
    '....GgG....',
    '.....O.....',
    '....DxD....',
    'DDDDDDDDDDD',
    'DxxxxxxxxxD',
    'DXXXXXXXXXD',
    'DDDDDDDDDDD',
    'DXXXXXXXXXD',
    'DDDDDDDDDDD',
  ],
};

/* ── liquidity: the hourglass ────────────────────────────────────────────────────────────────── */

/** Lesson 5's hourglass, larger: brass caps and posts, the top bulb all but empty, the sand piled below. 13x17. */
const HOURGLASS = [
  'OgggggggggggO',
  'OOOOOOOOOOOOO',
  'Ox.........xO',
  'O.x.......x.O',
  'O..x.....x..O',
  'O...x...x...O',
  'O....xyx....O',
  'O.....x.....O',
  'O.....x.....O',
  'O....x.x....O',
  'O...x...x...O',
  'O..x..y..x..O',
  'O.x..yyy..x.O',
  'Ox..yyGyy..xO',
  'OxyyyGyGyyyxO',
  'OOOOOOOOOOOOO',
  'OgggggggggggO',
];

/** The last grains falling through the neck. Framed: the sand is the hourglass's own works, not its reading. */
const hourglass: PixelSprite = {
  id: 'rm10-opener-hourglass',
  name: 'hourglass',
  tags: ['scene', 'rm10'],
  rows: rmMark(HOURGLASS, [[6, 8, 'y']]),
  frames: [
    rmMark(HOURGLASS, [[6, 8, 'y']]),
    rmMark(HOURGLASS, [[6, 9, 'y']]),
    rmMark(HOURGLASS, [[6, 10, 'y']]),
    HOURGLASS,
  ],
  frameMs: 420,
};

/* ── the lamps ───────────────────────────────────────────────────────────────────────────────── */

/** A status lamp in its brass socket, lit green; give it a slow `twinkle`. 4x4. */
const greenLamp: PixelSprite = { id: 'rm10-opener-lamp-green', name: 'green lamp', tags: ['scene', 'rm10'], rows: ['.OO.', 'OmNO', 'ONnO', '.OO.'] };

/** The same lamp lit red, for the one reading out of bounds. 4x4. */
const redLamp: PixelSprite = { id: 'rm10-opener-lamp-red', name: 'red lamp', tags: ['scene', 'rm10'], rows: ['.OO.', 'OsRO', 'ORrO', '.OO.'] };

/** The red lamp's glow, a ring round it; give it a quick `twinkle` and the lamp flashes. 8x8. */
const redGlow: PixelSprite = {
  id: 'rm10-opener-lamp-glow',
  name: 'red glow',
  tags: ['scene', 'rm10'],
  rows: ['..rRRr..', '.r....r.', 'r......r', 'R......R', 'R......R', 'r......r', '.r....r.', '..rRRr..'],
};

/** Floor shadow under the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm10-opener-floor-shadow',
  name: 'rm10-opener-floor-shadow',
  tags: ['scene', 'rm10'],
  palette: RM_PALETTE,
  rows: rmFill(['.'.repeat(20), '.'.repeat(20)], [[1, 18, 0, 'Z'], [3, 16, 1, 'Z']]),
};

const PORTHOLE = { x: 59, y: 3 };
const VAR = { x: COL[0] + 2, y: ROW[0] + 1 };
const WALL = { x: COL[1] + 1, y: ROW[0] + 1 };
const AAA = { x: COL[0] + 4, y: ROW[1] };
const SAND = { x: COL[1] + 5, y: ROW[1] };
const LAMP = { left: COL[0] + 20, right: COL[1] + 21 };

const base = rmCompose('rm10-opener-base', rmWatchRoom(80, 60, 50), [
  [rmPorthole, PORTHOLE.x, PORTHOLE.y],
  [board, BOARD.x, BOARD.y],
  [varDial, VAR.x, VAR.y],
  [wallGauge, WALL.x, WALL.y],
  [aaaTag, AAA.x, AAA.y],
  [aaaLoad, AAA.x + 1, AAA.y + 7],
  [floorShadow, 58, 52],
  [rmKeeperReach, 60, 24],
]);

export const rm10Opener: SceneArt = {
  id: 'rm10-opener',
  label: 'A lighthouse keeper points at a board of four instruments read together, a barometer needle short of the red, a harbor wall standing far above the sea, a load on a gold chain under an AAA tag and an hourglass nearly run out under a red lamp, as a storm flashes in a porthole.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: PORTHOLE.x + 6, y: PORTHOLE.y + 3 },
    { sprite: rmPortSwell, x: PORTHOLE.x + 5, y: PORTHOLE.y + 10, motion: { kind: 'drift', amp: 1, periodMs: 3000 } },
    { sprite: rmPortRain, ...PORTHOLE },
    { sprite: hourglass, ...SAND },
    { sprite: greenLamp, x: LAMP.left, y: ROW[0] + 1, motion: { kind: 'twinkle', periodMs: 3400, min: 0.75 } },
    { sprite: greenLamp, x: LAMP.right, y: ROW[0] + 1, motion: { kind: 'twinkle', periodMs: 3800, min: 0.75, phase: 0.4 } },
    { sprite: greenLamp, x: LAMP.left, y: ROW[1] + 1, motion: { kind: 'twinkle', periodMs: 3600, min: 0.75, phase: 0.7 } },
    { sprite: redLamp, x: LAMP.right, y: ROW[1] + 1 },
    { sprite: redGlow, x: LAMP.right - 2, y: ROW[1] - 1, motion: { kind: 'twinkle', periodMs: 900, min: 0 } },
    { sprite: rmGlint, x: VAR.x + 3, y: VAR.y + 2, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
  ],
};

/* ── the keepsake ────────────────────────────────────────────────────────────────────────────── */

/**
 * A half gauge `n` pixels across (odd) for the emblem: a steel rim lit on the left, its zone band
 * (green, gold, red) round the white face, and a still two-pixel needle from the hub at the middle of
 * the base, at `deg` (0 points right, 90 straight up). A half gauge, so it reads as an instrument and
 * not as a clock or an eye. `n` + 1 over 2, plus one, rows tall.
 */
function halfGauge(id: string, n: number, deg: number): PixelSprite {
  const c = (n - 1) / 2;
  const h = (n + 1) / 2 + 1;
  const hub = h - 2;
  const cells: string[][] = Array.from({ length: h }, (_, y) =>
    Array.from({ length: n }, (_, x) => {
      if (y === h - 1) return 'X';
      const dx = x - c;
      const dy = hub - y;
      const d = Math.hypot(dx, dy);
      if (d > c + 0.5) return '.';
      if (d > c - 0.5) return dx < -1 ? 'w' : dx > 1 ? 'X' : 'x';
      const a = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (d > c - 1.6) return a > 120 ? 'N' : a > 60 ? 'G' : 'R';
      return 'w';
    }),
  );
  const t = (deg * Math.PI) / 180;
  const flat = Math.abs(Math.cos(t)) > Math.abs(Math.sin(t));
  for (let r = 0; r <= c - 1.4; r++) {
    const x = Math.round(c + r * Math.cos(t));
    const y = Math.round(hub - r * Math.sin(t));
    cells[y][x] = 'K';
    if (flat) cells[y - 1][x] = 'K';
    else cells[y][x + 1] = 'K';
  }
  cells[hub][c] = 'D';
  return { id, name: id, tags: ['rm', 'emblem', 'lesson 10'], rows: cells.map((row) => row.join('')) };
}

/** A status lamp for the emblem in a steel socket, lit `lit` with a `hi` highlight. 4x3. */
const emblemLamp = (id: string, lit: string, hi: string): PixelSprite => ({
  id,
  name: id,
  tags: ['rm', 'emblem', 'lesson 10'],
  rows: ['XXXX', `X${hi}${lit}X`, `X${lit}${lit}X`],
});

/**
 * Lesson 10's emblem: the dashboard in small, as the opener's board reads it. A steel gauge with its
 * needle swung into the red over a row of status lamps, two green and one red: most readings fine and
 * one not, the lesson's warning. Steel, so it stands off the gold ring. 15x13.
 */
const DASH: readonly (readonly [PixelSprite, number, number])[] = [
  [halfGauge('rm10-emblem-gauge', 15, 28), 0, 0],
  [emblemLamp('rm10-emblem-lamp-a', 'N', 'm'), 1, 10],
  [emblemLamp('rm10-emblem-lamp-b', 'N', 'm'), 6, 10],
  [emblemLamp('rm10-emblem-lamp-c', 'R', 's'), 11, 10],
];
const emblemDashboard: PixelSprite = {
  id: 'rm10-emblem-dashboard',
  name: 'dashboard',
  tags: ['rm', 'emblem', 'lesson 10'],
  rows: DASH.reduce((rows, [sprite, x, y]) => rmStamp(rows, sprite, x, y), Array.from({ length: 13 }, () => '.'.repeat(15))),
};

export const rm10Finish: SceneArt = rmKeepsakeGold(
  'rm10-finish',
  'A gold and white life ring hanging from a rope, with a dashboard gauge at its center, its needle swung into the red over a row of two green lamps and one red lamp.',
  emblemDashboard,
);

export const art: LessonArtSet = { opener: rm10Opener, backdrop: rmBackdropStorm, finish: rm10Finish };
