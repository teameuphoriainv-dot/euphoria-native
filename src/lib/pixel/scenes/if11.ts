/**
 * Investing Fundamentals lesson 11, Reading Stock Charts: learning to read the shape of a price.
 *
 * A new set for the pathway: inside the orchard's potting shed at night, plank walls lit by one
 * lantern, the moon in the window and seedlings on the shelf under it. On an easel stands a
 * chalkboard with a candlestick chart: four red candles stepping down to a gold support line, a
 * hammer that touches it and bounces, and green candles climbing back (the lesson's bullish
 * reversal). The investor points the stick at the bounce. The newest candle is still forming
 * (frames), the flame flickers, a moth circles it, dust rises in the light and the window's stars
 * twinkle.
 *
 * The keepsake's emblem is a red candle and a taller green one beside it.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifFlame,
  ifGlint,
  ifGoldMote,
  ifInvestor,
  ifKeepsake,
  ifLanternPost,
  ifStar,
  ifWateringCan,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifCoinSprout } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── the shed ──────────────────────────────────────────────────────────────────────────────────── */

/** The lantern's glass, in scene pixels: the wall's planks are lit in a pool around it. */
const LIGHT = { x: 9, y: 8 } as const;

/** Plank walls, 80x50: a beam along the top, a dark seam every seventh column, lit near the lantern. */
const wall: PixelSprite = {
  id: 'if11-wall',
  name: 'if11-wall',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: Array.from({ length: 50 }, (_, y) =>
    Array.from({ length: 80 }, (__, x) => {
      if (y === 0) return 'A';
      if (y === 1) return 'a';
      if (y === 2 || y === 49) return 'd';
      if (x % 7 === 6) return 'd';
      // Lit plank by plank, so the pool of light steps across the boards instead of drawing a circle.
      const plank = Math.floor(x / 7) * 7 + 3;
      return Math.hypot(plank - LIGHT.x, (y - LIGHT.y) * 1.2) < 22 ? 'A' : 'a';
    }).join(''),
  ),
};

/** Floorboards, 80x10, running across, with a few end joints. */
const floor: PixelSprite = {
  id: 'if11-floor',
  name: 'if11-floor',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: Array.from({ length: 10 }, (_, y) =>
    Array.from({ length: 80 }, (__, x) => {
      if (y === 0) return 'c';
      if (y % 3 === 0) return 'd';
      return (x * 3 + y * 11) % 29 === 0 ? 'd' : 'e';
    }).join(''),
  ),
};

/** The window, 18x18: two panes over two, the moon in the top left, a tree and the field outside. */
const shedWindow: PixelSprite = {
  id: 'if11-window',
  name: 'if11-window',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hhhhhhhhhhhhhhhhhh',
    'hkkkkkkkhAkkkkkkka',
    'hkkwwkkkhAkkkkkkka',
    'hkwwwxkkhAkkkkkkka',
    'hkwwxxkkhAkkkkkkka',
    'hkkxxkkkhAkkkkkkka',
    'hkkkkkkkhAkkkkkkka',
    'hkkkkkkkhAkkkkkkka',
    'hhhhhhhhhhhhhhhhha',
    'hAAAAAAAhAAAAAAAAa',
    'hkkkkkkkhAkkkkkvka',
    'hkkkkkkkhAkkkkvvva',
    'hkkkkkkkhAkkkvvvva',
    'hvkkkkkkhAkkvvvvva',
    'hvvvkkkkhAkkkvavka',
    'hVVvvvvvhAvvvvavva',
    'hVVVVVVVhAVVVVVVVa',
    'haaaaaaaaaaaaaaaaa',
  ],
};

const sill: PixelSprite = {
  id: 'if11-sill',
  name: 'if11-sill',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: ['hhhhhhhhhhhhhhhhhhhh', '.aaaaaaaaaaaaaaaaaa.'],
};

/** The shelf under the window, 24x4, on two brackets. */
const shelf: PixelSprite = {
  id: 'if11-shelf',
  name: 'if11-shelf',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hhhhhhhhhhhhhhhhhhhhhhhh',
    'aaaaaaaaaaaaaaaaaaaaaaaa',
    '..aa..............aa....',
    '...a...............a....',
  ],
};

/** A clay pot, 7x4: something planted in it stands with its last row behind the rim. */
const pot: PixelSprite = {
  id: 'if11-pot',
  name: 'if11-pot',
  tags: ['scene', 'if'],
  rows: [
    '4333332',
    '.33332.',
    '.33322.',
    '..111..',
  ],
};

/** A seedling for the second pot: two leaves on a stem. */
const seedling: PixelSprite = {
  id: 'if11-seedling',
  name: 'if11-seedling',
  tags: ['scene', 'if'],
  rows: [
    '.mN.Nn.',
    'mNNnNNn',
    '...n...',
    '...n...',
  ],
};

/** The kit's lantern without its post, hung from the beam on a short chain; glass at (1, 3). */
const moth: PixelSprite = {
  id: 'if11-moth',
  name: 'if11-moth',
  tags: ['scene', 'if'],
  rows: ['x.x', '.w.'],
};

const hangingLantern: PixelSprite = {
  ...ifLanternPost,
  id: 'if11-hanging-lantern',
  name: 'if11-hanging-lantern',
  rows: ['..D..', '..D..', ...ifLanternPost.rows.slice(0, 7)],
};

/* ── the chart ─────────────────────────────────────────────────────────────────────────────────── */

const BOARD = { x: 19, y: 8, width: 36, height: 25 } as const;

/** The chalkboard, 36x25, in its frame: lit wood on the top and left, shadow on the bottom and right. */
const board: PixelSprite = {
  id: 'if11-board',
  name: 'if11-board',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: Array.from({ length: BOARD.height }, (_, y) =>
    Array.from({ length: BOARD.width }, (__, x) => {
      if (y === 0 || x === 0) return 'h';
      if (y === BOARD.height - 1 || x === BOARD.width - 1) return 'a';
      return 'v';
    }).join(''),
  ),
};

/**
 * The candles, in scene pixels: centre column, wick top and bottom, body top and bottom. Four red
 * steps down, a green hammer on the support line, three green steps back up. The last one is a layer.
 */
const CANDLES = [
  { x: 23, wick: [11, 16], body: [12, 15], up: false },
  { x: 27, wick: [14, 20], body: [15, 18], up: false },
  { x: 31, wick: [17, 23], body: [18, 21], up: false },
  { x: 35, wick: [20, 27], body: [21, 25], up: false },
  { x: 39, wick: [22, 29], body: [23, 24], up: true },
  { x: 43, wick: [18, 24], body: [19, 23], up: true },
  { x: 47, wick: [14, 20], body: [15, 19], up: true },
] as const;
const SUPPORT_Y = 30;

/** Every still candle and the dashed support line, drawn on one transparent 80x60 sheet. */
const chart: PixelSprite = {
  id: 'if11-chart',
  name: 'if11-chart',
  tags: ['scene', 'if'],
  rows: Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (__, x) => {
      for (const c of CANDLES) {
        const dx = x - c.x;
        if (Math.abs(dx) <= 1 && y >= c.body[0] && y <= c.body[1]) return dx === -1 ? (c.up ? 'm' : 's') : c.up ? 'N' : 'R';
        if (dx === 0 && y >= c.wick[0] && y <= c.wick[1]) return 'x';
      }
      if (y === SUPPORT_Y && x > BOARD.x && x < BOARD.x + BOARD.width - 1 && x % 2 === 0) return 'G';
      return '.';
    }).join(''),
  ),
};

/** The newest candle, 3x8, still forming: its body climbs a row a beat, then holds. At rest it is whole. */
const NEW_CANDLE = { x: 50, y: 10 } as const;
const newCandle = (top: number): string[] =>
  Array.from({ length: 8 }, (_, j) => (j >= top && j <= 6 ? 'mNN' : j === top - 1 || j === 7 ? '.x.' : '...'));
const formingCandle: PixelSprite = {
  id: 'if11-forming-candle',
  name: 'if11-forming-candle',
  tags: ['scene', 'if'],
  rows: newCandle(1),
  frames: [newCandle(5), newCandle(4), newCandle(3), newCandle(2), newCandle(1), newCandle(1), newCandle(1), newCandle(1)],
  frameMs: 280,
};

/** The easel's two front legs and the chalk ledge, on one transparent 80x60 sheet. */
const easel: PixelSprite = {
  id: 'if11-easel',
  name: 'if11-easel',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (__, x) => {
      if (y === 33 && x >= BOARD.x - 1 && x <= BOARD.x + BOARD.width) return 'h';
      if (y === 34 && x >= BOARD.x && x <= BOARD.x + BOARD.width - 1) return 'a';
      if (y === 32 && (x === 46 || x === 47)) return 'w';
      if (y >= 35 && y <= 51) {
        const t = (y - 35) / 16;
        const left = Math.round(23 - 3 * t);
        const right = Math.round(50 + 3 * t);
        if (x === left || x === right) return 'h';
        if (x === left + 1 || x === right + 1) return 'A';
      }
      return '.';
    }).join(''),
  ),
};

/** The pointer: a stick from the investor's hand up to the hammer on the support line, chalk at its tip. */
const INVESTOR = { x: 3, y: 31 } as const;
const POINTER_FROM = { x: INVESTOR.x + IF_INVESTOR_HAND.x + 1, y: INVESTOR.y + IF_INVESTOR_HAND.y } as const;
const POINTER_TO = { x: 37, y: 31 } as const;
const pointer: PixelSprite = (() => {
  const w = POINTER_TO.x - POINTER_FROM.x + 1;
  const h = POINTER_FROM.y - POINTER_TO.y + 1;
  const cells = Array.from({ length: h }, () => new Array<string>(w).fill('.'));
  for (let i = 0; i < w; i += 1) {
    const y = Math.round((h - 1) * (1 - i / (w - 1)));
    const line = cells[y];
    if (line) line[i] = i === w - 1 ? 'w' : 'h';
  }
  return { id: 'if11-pointer', name: 'if11-pointer', tags: ['scene', 'if'], palette: IF_PALETTE, rows: cells.map((l) => l.join('')) };
})();

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const WINDOW = { x: 58, y: 6 } as const;
const SHELF = { x: 56, y: 38 } as const;
const LANTERN = { x: LIGHT.x - 2, y: 3 } as const;
const COIN_POT = { x: 59, y: SHELF.y - 4 } as const;
const LEAF_POT = { x: 69, y: SHELF.y - 4 } as const;

const base = ifCompose('if11-opener-base', 80, 60, [
  { sprite: wall, x: 0, y: 0 },
  { sprite: floor, x: 0, y: 50 },
  { sprite: shedWindow, x: WINDOW.x, y: WINDOW.y },
  { sprite: sill, x: WINDOW.x - 1, y: WINDOW.y + 18 },
  { sprite: shelf, x: SHELF.x, y: SHELF.y },
  { sprite: ifCoinSprout, x: COIN_POT.x, y: COIN_POT.y - 6 },
  { sprite: pot, x: COIN_POT.x, y: COIN_POT.y },
  { sprite: seedling, x: LEAF_POT.x, y: LEAF_POT.y - 3 },
  { sprite: pot, x: LEAF_POT.x, y: LEAF_POT.y },
  { sprite: ifWateringCan, x: 64, y: 43 },
  { sprite: hangingLantern, x: LANTERN.x, y: LANTERN.y },
  { sprite: board, x: BOARD.x, y: BOARD.y },
  { sprite: chart, x: 0, y: 0 },
  // The ledge after the board, so the chalk lying on it sits in front of the frame.
  { sprite: easel, x: 0, y: 0 },
  { sprite: pointer, x: POINTER_FROM.x, y: POINTER_TO.y },
  // The investor last, so the hand closes over the end of the stick.
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if11Opener: SceneArt = {
  id: 'if11-opener',
  label: 'In a lantern-lit potting shed at night, an investor points a stick at a candlestick chart on a chalkboard, where red candles fall to a gold support line, bounce, and green candles climb back up.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: formingCandle, x: NEW_CANDLE.x, y: NEW_CANDLE.y },
    { sprite: ifFlame, x: LANTERN.x + 1, y: LANTERN.y + 5 },
    { sprite: moth, x: LIGHT.x + 4, y: LIGHT.y - 3, motion: { kind: 'drift', amp: 3, periodMs: 1700 } },
    { sprite: ifGoldMote, x: 14, y: 18, motion: { kind: 'rise', amp: 6, periodMs: 3600, phase: 0.2 } },
    { sprite: ifGoldMote, x: 5, y: 24, motion: { kind: 'rise', amp: 5, periodMs: 4200, phase: 0.65 } },
    { sprite: ifGlint, x: COIN_POT.x + 1, y: COIN_POT.y - 2 },
    { sprite: ifStar, x: WINDOW.x + 13, y: WINDOW.y + 3, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: ifStar, x: WINDOW.x + 4, y: WINDOW.y + 11, motion: { kind: 'twinkle', periodMs: 2800, phase: 0.5, min: 0.2 } },
    { sprite: ifFirefly, x: WINDOW.x + 6, y: WINDOW.y + 15, motion: { kind: 'rise', amp: 4, periodMs: 3300, phase: 0.3 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemCandles: PixelSprite = {
  id: 'if-emblem-candles',
  name: 'if-emblem-candles',
  tags: ['scene', 'if'],
  blurb: "Lesson 11: a red candle and a taller green one. The chart turning.",
  rows: [
    '.......x..',
    '..x...mNN.',
    '.sRR..mNN.',
    '.sRR..mNN.',
    '.sRR..mNN.',
    '..x...mNN.',
    '......mNN.',
    '.......x..',
  ],
};

export const if11Finish: SceneArt = ifKeepsake(
  'if11-finish',
  'A golden acorn hanging from an oak twig, with a red candlestick and a taller green one in its purple window and small sparkles around it.',
  emblemCandles,
);

export const art: LessonArtSet = { opener: if11Opener, backdrop: ifBackdrop, finish: if11Finish };
