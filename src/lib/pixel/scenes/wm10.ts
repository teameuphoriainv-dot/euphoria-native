/**
 * Wealth Management lesson 10 (the capstone): its opener, the capstone backdrop and its keepsake,
 * as one set loaded on demand.
 *
 * The opener is the forecourt of the house of five pillars on the night the whole plan comes
 * together, seen as a family occasion rather than lesson 1's view of the house: a long table in an
 * orchid cloth set across the forecourt, the grandmother, the father and the child seated at it side
 * by side, two candles burning on it, and the advisor standing at its end pointing up at the frieze,
 * with fireworks going up either side of the pediment. The lesson's point is integration: earn,
 * save, invest, protect and transfer working as one system, every decision touching every other.
 * So the frieze carries the joining: a gold thread runs through all five marks, earn to transfer,
 * turns down at the end of the frieze and runs back along the architrave beneath them, closing into
 * one ring, and when it closes the five marks shine together. A reader with Reduce Motion sees the
 * ring closed through the marks. What moves: the thread drawing through the marks and closing,
 * three fireworks out of step, the pennant, the lamp, the candles, fireflies, stars.
 *
 * The backdrop is the pathway's estate with every window of the manor lit, as the plan allows the
 * two capstones. The keepsake carries a crown set with five jewels, one for each pillar.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt, SceneLayer } from './types';
import { wmBackdrop } from './wm-backdrop';
import {
  wmBands,
  wmChild,
  wmCompose,
  wmElder,
  wmFirefly,
  wmFlag,
  wmLampFlame,
  wmLampPost,
  wmLater,
  wmMarkEarn,
  wmMarkInvest,
  wmMarkOak,
  wmMarkProtect,
  wmMarkSave,
  wmMarkTransfer,
  wmMirror,
  wmParent,
  wmStar,
  wmStarDot,
  wmTemple,
  WM_INKS,
} from './wm-kit';
import { wmAdvisorPointing, wmCandle, wmCandleFlame, wmTreeline } from './wm-kit-a';
import { wmSkyDots } from './wm-kit-b';
import { wmKeepsake } from './wm1-finish';

/** The temple's top-left in the scene. Every temple position below is offset from it. */
const TX = 10;
const TY = 6;

/** The frieze's left edge and top, where the thread layer is laid. */
const FRIEZE_X = TX + 5;
const FRIEZE_Y = TY + 10;

/** The long table's top-left on the forecourt, and the row its top is drawn on. */
const TABLE_X = 14;
const TABLE_Y = 49;
const TABLE_W = 48;

/** Where the family sit behind the table: the top rows of the kit's figures show above its top. */
const SEATS: readonly { sprite: PixelSprite; x: number; rows: number }[] = [
  { sprite: wmElder, x: 26, rows: 8 },
  { sprite: wmParent, x: 35, rows: 8 },
  { sprite: wmChild, x: 44, rows: 6 },
];

const skyDots = wmSkyDots('wm10-opener-sky-dots', 80, 30, [
  [14, 2, 'D'],
  [31, 2, 'X'],
  [49, 1, 'D'],
  [61, 17, 'X'],
  [78, 21, 'D'],
  [6, 24, 'X'],
  [70, 26, 'X'],
  [29, 14, 'D'],
]);

const trees = wmTreeline('wm10-opener-trees', 80, 12, [
  [40, 40, 3],
  [5, 9, 10],
  [75, 8, 11],
]);

const flagPole: PixelSprite = {
  id: 'wm10-opener-flag-pole',
  name: 'wm10-opener-flag-pole',
  tags: ['scene', 'wm10'],
  rows: ['D', 'x', 'x', 'x', 'x', 'x'],
};

/**
 * The forecourt: gravel spreading from the foot of the steps to the bottom of the frame, the
 * steps' cast shadow (z) along its top row. 80x11.
 */
const forecourt: PixelSprite = {
  id: 'wm10-opener-forecourt',
  name: 'wm10-opener-forecourt',
  tags: ['scene', 'wm10'],
  rows: Array.from({ length: 11 }, (_, j) =>
    Array.from({ length: 80 }, (_, x) => {
      if (x < 9 - j || x > 69 + j) return '.';
      return j === 0 && x >= TX && x <= TX + 58 ? 'z' : 'k';
    }).join(''),
  ),
};

/**
 * One long table in the family's orchid cloth, seen from a little above, so it stands clear of the
 * white steps behind it: the cloth's lit top, its drape with a fold every seven columns, a gold
 * hem, the legs. 48x10.
 */
const table: PixelSprite = {
  id: 'wm10-opener-table',
  name: 'wm10-opener-table',
  tags: ['scene', 'wm10'],
  palette: WM_INKS,
  rows: [
    `q${'Q'.repeat(TABLE_W - 2)}q`,
    `${'q'.repeat(TABLE_W - 1)}P`,
    ...Array.from({ length: 4 }, () =>
      Array.from({ length: TABLE_W }, (_, x) => (x === TABLE_W - 1 ? 'p' : x % 7 === 3 ? 'p' : 'P')).join('')),
    `y${'G'.repeat(TABLE_W - 2)}g`,
    `..UO${'.'.repeat(TABLE_W - 8)}UO..`,
    `..UO${'.'.repeat(TABLE_W - 8)}UO..`,
    `..KK${'.'.repeat(TABLE_W - 8)}KK..`,
  ],
};

/** The advisor standing at the table's end, his arm up toward the frieze. */
const advisorPointingUp = wmMirror(wmAdvisorPointing, 'wm10-opener-advisor-pointing');

const base = wmCompose('wm10-opener-base', wmBands(80, [['K', 42], ['h', 18]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: trees, x: 0, y: 30 },
  { sprite: forecourt, x: 0, y: 49 },
  { sprite: flagPole, x: TX + 29, y: TY - 6 },
  { sprite: wmTemple, x: TX, y: TY },
  { sprite: wmMarkOak, x: TX + 26, y: TY + 3 },
  ...[wmMarkEarn, wmMarkSave, wmMarkInvest, wmMarkProtect, wmMarkTransfer].map((mark, i) => ({ sprite: mark, x: FRIEZE_X + 1 + 10 * i, y: FRIEZE_Y })),
  { sprite: wmLampPost, x: 1, y: 25 },
  ...SEATS.map(({ sprite, x, rows }) => ({
    sprite: { ...sprite, rows: sprite.rows.slice(0, rows) },
    x,
    y: TABLE_Y - rows,
  })),
  { sprite: table, x: TABLE_X, y: TABLE_Y },
  { sprite: wmCandle, x: TABLE_X + 3, y: TABLE_Y - 6 },
  { sprite: wmCandle, x: TABLE_X + 41, y: TABLE_Y - 6 },
  { sprite: advisorPointingUp, x: TABLE_X + TABLE_W + 2, y: 46 },
]);

/* ── the thread through the five marks, closing into one ring ──────────────────────────────── */

const MARKS = [wmMarkEarn, wmMarkSave, wmMarkInvest, wmMarkProtect, wmMarkTransfer];

/** A mark lit from inside: every gold step goes one brighter. */
function litFrom(sprite: PixelSprite): PixelSprite {
  const up: Record<string, string> = { O: 'g', g: 'G', G: 'y', y: 'w' };
  return { ...sprite, rows: sprite.rows.map((row) => [...row].map((ch) => up[ch] ?? ch).join('')) };
}

/**
 * The frieze is 49x7: five 7x5 panels from x 1, 11, 21, 31, 41, the architrave's white band on row
 * 5. The thread runs along row 2, the marks' middle, passing behind them, from the frieze's left
 * edge to its right; turns down the right edge; runs back along the architrave; and climbs the left
 * edge to where it began. `upTo` is how far along that loop it has been drawn, in its own order.
 */
const THREAD_ROW = 2;
const ARCHITRAVE = 5;
const behindMark = (x: number, y: number) => {
  const i = Math.floor((x - 1) / 10);
  const mx = x - 1 - 10 * i;
  return i >= 0 && i < 5 && mx < 7 && y < 5 && MARKS[i].rows[y][mx] !== '.';
};
const LOOP: readonly (readonly [number, number])[] = [
  ...Array.from({ length: 49 }, (_, x) => [x, THREAD_ROW] as const),
  ...Array.from({ length: ARCHITRAVE - THREAD_ROW }, (_, k) => [48, THREAD_ROW + 1 + k] as const),
  ...Array.from({ length: 48 }, (_, k) => [47 - k, ARCHITRAVE] as const),
  ...Array.from({ length: ARCHITRAVE - THREAD_ROW - 1 }, (_, k) => [0, ARCHITRAVE - 1 - k] as const),
];

function threadFrame(upTo: number, marksLit: boolean): string[] {
  const grid = wmBands(49, [['.', 7]]).map((row) => [...row]);
  LOOP.slice(0, upTo).forEach(([x, y]) => {
    if (!behindMark(x, y)) grid[y][x] = y === ARCHITRAVE ? 'G' : 'y';
  });
  if (marksLit) {
    MARKS.forEach((mark, i) => litFrom(mark).rows.forEach((row, j) => [...row].forEach((ch, k) => {
      if (ch !== '.') grid[j][1 + 10 * i + k] = ch;
    })));
  }
  return grid.map((row) => row.join(''));
}

/**
 * The thread reaching the far side of each mark in turn, then turning and closing the ring; the
 * marks shine together while it is closed. The still is the closed ring through the marks.
 */
const THREAD_STOPS = [0, 10, 20, 30, 40, 49, 49 + 3 + 24, LOOP.length];
const closedRing = threadFrame(LOOP.length, false);
const shining = threadFrame(LOOP.length, true);
const thread: PixelSprite = {
  id: 'wm10-opener-thread',
  name: 'wm10-opener-thread',
  tags: ['scene', 'wm10'],
  blurb: 'A gold thread drawn through all five pillar marks and closed into one ring, the marks shining once it closes.',
  rows: closedRing,
  frames: [...THREAD_STOPS.map((upTo) => threadFrame(upTo, false)), shining, shining, shining, closedRing],
  frameMs: 300,
};

/** A burst of eight rays: tips in the light ink (L), the rays in the mid ink (M); Z is the dark ink. 11x11. */
const BLOOM = [
  '.....L.....',
  '.L...M...L.',
  '..M..M..M..',
  '...M...M...',
  '...........',
  'LMM.....MML',
  '...........',
  '...M...M...',
  '..M..M..M..',
  '.L...M...L.',
  '.....L.....',
];

/**
 * A firework: a spark climbs, pops, blooms, droops and fades, then a rest. The still is the pop,
 * so a reader with Reduce Motion still sees a burst, at a fraction of the bloom's rects. 11x11.
 */
function firework(id: string, light: string, mid: string, dark: string, frameMs: number): PixelSprite {
  const ink = (rows: readonly string[]) =>
    rows.map((row) => row.replace(/L/g, light).replace(/M/g, mid).replace(/Z/g, dark));
  const empty = wmBands(11, [['.', 11]]);
  const spark = (y: number) => empty.map((row, j) => {
    if (j === y) return `.....${light}.....`;
    if (j === y + 1) return `.....${dark}.....`;
    return row;
  });
  const pop = [
    '...........',
    '...........',
    '...........',
    '.....L.....',
    '....M.M....',
    '...L.W.L...',
    '....M.M....',
    '.....L.....',
    '...........',
    '...........',
    '...........',
  ];
  const droop = [
    '...........',
    '.....M.....',
    '.M.......M.',
    '...........',
    '...........',
    '...........',
    'M.........M',
    '...........',
    '...........',
    '...........',
    '.M.......M.',
  ];
  const fade = [
    '...........',
    '...........',
    '.....Z.....',
    '.Z.......Z.',
    '...........',
    '...........',
    '...........',
    'Z.........Z',
    '...........',
    '...........',
    '...........',
  ];
  return {
    id,
    name: id,
    tags: ['scene', 'wm10'],
    rows: ink(pop),
    frames: [spark(9), spark(6), spark(4), ink(pop), ink(BLOOM), ink(droop), ink(fade), empty, empty, empty],
    frameMs,
  };
}

const fireworkGold = firework('wm10-opener-firework-gold', 'y', 'G', 'g', 240);
const fireworkOrchid = wmLater(firework('wm10-opener-firework-orchid', 'Q', 'q', 'P', 270), 'wm10-opener-firework-orchid', 4, 270);
const fireworkGreen = wmLater(firework('wm10-opener-firework-green', 'm', 'N', 'n', 300), 'wm10-opener-firework-green', 7, 300);

const candleLater = wmLater(wmCandleFlame, 'wm10-opener-candle-later', 2, 320);

export const wm10Opener: SceneArt = {
  id: 'wm10-opener',
  label: 'On the forecourt of the marble house of five pillars a grandmother, a father and a child sit together at one long candlelit table while their advisor points up at the frieze, where a gold thread runs through all five marks and closes into one ring, as fireworks burst either side of the roof.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: thread, x: FRIEZE_X, y: FRIEZE_Y },
    { sprite: fireworkGold, x: 1, y: 6 },
    { sprite: fireworkOrchid, x: 67, y: 4 },
    { sprite: fireworkGreen, x: 17, y: 0 },
    { sprite: wmFlag, x: TX + 30, y: TY - 6 },
    { sprite: wmLampFlame, x: 2, y: 28 },
    { sprite: wmCandleFlame, x: TABLE_X + 4, y: TABLE_Y - 9 },
    { sprite: candleLater, x: TABLE_X + 42, y: TABLE_Y - 9 },
    { sprite: wmFirefly, x: 9, y: 39, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.2 } },
    { sprite: wmFirefly, x: 70, y: 37, motion: { kind: 'rise', amp: 6, periodMs: 3400, phase: 0.65 } },
    { sprite: wmStar, x: 33, y: 7, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: wmStarDot, x: 57, y: 2, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
  ],
};

/** A manor window lit for the celebration, over a dark pane of the backdrop's manor. 2x3. */
const manorWindow: PixelSprite = {
  id: 'wm10-backdrop-window',
  name: 'wm10-backdrop-window',
  tags: [],
  rows: ['OO', 'OO', 'OO'],
};

/** The panes the pathway backdrop leaves dark: both wings, the upper floor, beside the portico. */
const NEWLY_LIT: readonly (readonly [number, number])[] = [
  [72, 23],
  [82, 23],
  [61, 28],
  [93, 28],
  [61, 33],
  [65, 33],
  [93, 33],
  [97, 33],
  [71, 32],
  [87, 32],
];

const windowLayers: SceneLayer[] = NEWLY_LIT.map(([x, y], i) => ({
  sprite: manorWindow,
  x,
  y,
  motion: { kind: 'twinkle', periodMs: 5200 + 350 * i, min: 0.45, phase: (i * 0.37) % 1 },
}));

/** The pathway backdrop with every window of the manor lit: the house is home tonight. */
export const wm10Backdrop: SceneArt = {
  ...wmBackdrop,
  id: 'wm10-backdrop',
  label: 'A dark country estate at night with every window of the manor lit: an old oak with a swing, the manor house, and an iron fence with lanterns at an open gate.',
  layers: [...windowLayers, ...wmBackdrop.layers],
};

/** A crown of three points set with five jewels, one for each pillar of the plan. */
const emblemCrown: PixelSprite = {
  id: 'wm10-emblem-crown',
  name: 'wm10-emblem-crown',
  tags: ['scene', 'wm10'],
  rows: [
    '......yw......',
    'yw....yG....yg',
    'yG....GG....Gg',
    'yGG...GG...GGg',
    'yGGG.yGGg.GGGg',
    'yGGGGGGGGGGGGg',
    'yGGGGGGGGGGGGg',
    'gOOOOOOOOOOOOO',
    'yGwGrGwwGrGwGg',
    'yGGGGGGGGGGGGg',
    'OOOOOOOOOOOOOO',
  ],
};

export const wm10Finish: SceneArt = wmKeepsake(
  'wm10-finish',
  emblemCrown,
  'A green crest with a gold rim bearing a crown set with five jewels, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm10Opener, backdrop: wm10Backdrop, finish: wm10Finish };
