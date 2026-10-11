/**
 * Financial Analytics lesson 6, DCF and valuation: future cash, brought back to today.
 *
 * OPENER. The loading dock, the plant's back door at night. A roller door stands open on the right
 * onto the dark yard, hazard stripes down its jambs, and a conveyor runs in through it: gold crates
 * of future cash ride in from outside and shrink a size at a time as they travel left towards
 * today, where they drop into a bin under a ticking wall clock (the time value of money). Over the
 * belt a screen draws the lesson's chart, the analyst stands at the belt, and the map lights MODEL.
 *
 * KEEPSAKE. The trophy with the DCF bars: each year's cash in gold (what it is worth today) under
 * blue (what discounting takes), a tall terminal bar, and a gold arrow pointing back to today.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the dock ──────────────────────────────────────────────────────────────────────────────── */

/** The open roller door, 29 x 44: hazard jambs, a header, the shutter rolled up under it. */
const door: PixelSprite = (() => {
  const jamb = (y: number) => (Math.floor(y / 2) % 2 === 0 ? 'gg' : 'DD');
  const shutter = ['X', 'D', 'X', 'D', 'x'];
  return {
    id: 'fa6-door',
    name: 'dock door',
    tags: ['scene', 'fa6', 'prop'],
    blurb: 'An open roller door with hazard-striped jambs.',
    rows: [
      'D'.repeat(29),
      `D${'x'.repeat(27)}D`,
      ...Array.from({ length: 42 }, (_, i) => `${jamb(i)}${(shutter[i] ?? '.').repeat(25)}${jamb(i)}`),
    ],
  };
})();

const conveyor: PixelSprite = {
  id: 'fa6-conveyor',
  name: 'conveyor',
  tags: ['scene', 'fa6', 'station'],
  blurb: 'A belt conveyor on legs.',
  rows: [
    'D'.repeat(64),
    'x'.repeat(64),
    Array.from({ length: 64 }, (_, x) => (x % 4 === 0 ? 'D' : 'X')).join(''),
    'D'.repeat(64),
    ...Array.from({ length: 5 }, () => Array.from({ length: 64 }, (_, x) => ['D', 'k', 'D'][(x % 16) - 2] ?? '.').join('')),
  ],
};

/** Today's bin: two small crates already in, a teal trim like every station. */
const bin: PixelSprite = {
  id: 'fa6-bin',
  name: 'present value bin',
  tags: ['scene', 'fa6', 'station'],
  rows: [
    '.OOO.OOO...',
    '.OGO.OGO...',
    '.OOO.OOO...',
    'DDDDDDDDDDD',
    'DxXXXXXXXkD',
    'DxXXXXXXXkD',
    'DTTTTTTTTtD',
    'DxXXXXXXXkD',
    'DxXXXXXXXkD',
    'DDDDDDDDDDD',
    '.DkD...DkD.',
  ],
};

/** A wall clock, its hour hand at three; the minute hand is a layer. */
const clock: PixelSprite = {
  id: 'fa6-clock',
  name: 'clock',
  tags: ['scene', 'fa6', 'prop'],
  rows: [
    '..DDDDD..',
    '.DxxxxxD.',
    'DxxxxxxXD',
    'DxxxxxxXD',
    'DxxxKKKXD',
    'DxxxxxxXD',
    'DxxxxxXXD',
    '.DXXXXXD.',
    '..DDDDD..',
  ],
};

/* Where things stand. */
const MAP = { x: 2, y: 2 } as const;
const BOARD = { x: 20, y: 11 } as const;
const DOOR = { x: 50, y: 4 } as const;
const BELT = { x: 12, y: 40, length: 64 } as const;
const CLOCK = { x: 1, y: 26 } as const;
const ANALYST = { x: 27, y: 33 } as const;

const room = faRoom('fa6-opener-room', [
  // The yard through the door: night sky, the far skyline, then the shadows inside.
  [52, 6, 25, 42, 'Z'],
  [53, 36, 5, 12, 'c'],
  [58, 31, 4, 17, 'c'],
  [62, 39, 6, 9, 'c'],
  [68, 34, 4, 14, 'c'],
  [72, 40, 5, 8, 'c'],
  [14, 50, 64, 1, 'Z'],
  [14, 51, 62, 1, 'Z'],
  [2, 50, 10, 1, 'Z'],
  [30, 57, 14, 2, 'Z'],
]);

const base = faCompose('fa6-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa6-board', 22, 17), BOARD.x, BOARD.y],
  [door, DOOR.x, DOOR.y],
  [clock, CLOCK.x, CLOCK.y],
  [bin, 0, 38],
  [conveyor, BELT.x, BELT.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/** A gold crate `s` pixels square. */
const crate = (s: number) =>
  Array.from({ length: s }, (_, y) => Array.from({ length: s }, (_, x) => {
    if (x === 0 || y === 0 || x === s - 1 || y === s - 1) return 'O';
    if (s > 3 && x === 1 && y === 1) return 'y';
    return s > 3 && x === s - 2 && y === s - 2 ? 'g' : 'G';
  }).join(''));

/**
 * Crates riding the belt to the left, one pixel a frame, each a size smaller for every stretch
 * nearer today: six at the door, three at the bin. A crate enters clipped at the right end and
 * leaves clipped at the left, so `GAP` frames loop without a seam.
 */
const GAP = 14;
const crates: PixelSprite = (() => {
  const L = BELT.length;
  const size = (x: number) => (x >= 48 ? 6 : x >= 32 ? 5 : x >= 16 ? 4 : 3);
  const frames = Array.from({ length: GAP }, (_, f) => {
    const grid = Array.from({ length: 6 }, () => Array.from({ length: L }, () => '.'));
    for (let k = 0; k < (L + 6) / GAP; k++) {
      const left = ((k * GAP - f) % (L + 6) + (L + 6)) % (L + 6) - 6;
      const s = size(Math.max(left, 0));
      crate(s).forEach((row, dy) => [...row].forEach((ch, dx) => {
        const x = left + dx;
        if (x >= 0 && x < L) grid[6 - s + dy][x] = ch;
      }));
    }
    return grid.map((r) => r.join(''));
  });
  return { id: 'fa6-crates', name: 'crates', tags: ['scene', 'fa6'], rows: frames[0], frames, frameMs: 150 };
})();

/** The clock's minute hand going round, 5 x 5 about its centre. */
const minuteHand: PixelSprite = (() => {
  const tips: readonly (readonly [number, number])[][] = [
    [[2, 1], [2, 0]], [[3, 1], [4, 0]], [[3, 2], [4, 2]], [[3, 3], [4, 4]],
    [[2, 3], [2, 4]], [[1, 3], [0, 4]], [[1, 2], [0, 2]], [[1, 1], [0, 0]],
  ];
  const frames = tips.map((hand) => Array.from({ length: 5 }, (_, y) =>
    Array.from({ length: 5 }, (_, x) => ((x === 2 && y === 2) || hand.some(([hx, hy]) => hx === x && hy === y) ? 'r' : '.')).join('')));
  return { id: 'fa6-minute-hand', name: 'minute hand', tags: ['scene', 'fa6'], rows: frames[0], frames, frameMs: 450 };
})();

const star: PixelSprite = { id: 'fa6-star', name: 'star', tags: ['scene', 'fa6'], rows: ['x'] };
const dockLamp: PixelSprite = { id: 'fa6-dock-lamp', name: 'dock lamp', tags: ['scene', 'fa6'], rows: ['.y.', 'yGy'] };

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 6: discounted cash flow. Four years of cash and a tall terminal value, each bar gold for
 * what it is worth today under blue for what discounting takes, the blue share growing with every
 * year out. The bars fill in year by year, then a gold arrow points back to today. It holds, the
 * screen clears.
 */
export const faEmblemDcf: PixelSprite = (() => {
  const full = [
    '.y..............',
    'yyyyyyy.....BBbb',
    '.y..........BBbb',
    '............BBbb',
    '.........Bb.BBbb',
    '......Bb.Bb.BBbb',
    '...Bb.Bb.Bb.yGGg',
    'Bb.Bb.Bb.Bb.yGGg',
    'yG.yG.yG.yG.yGGg',
    'yG.yG.yG.yG.yGGg',
    'yG.yG.yG.yG.yGGg',
  ];
  return {
    ...faDrawnBy('fa-emblem-dcf', full, (x, y, ch) => {
      if (y <= 2 && x <= 7) return 10;
      const bar = Math.min(Math.floor(x / 3), 4);
      return bar * 2 + (ch === 'B' || ch === 'b' ? 1 : 0);
    }, 200),
    name: 'emblem dcf',
    blurb: 'Discounted cash flows and the arrow back to today.',
  };
})();

export const fa6Opener: SceneArt = {
  id: 'fa6-opener',
  label: 'A loading dock at night: gold crates of future cash ride a conveyor in through an open door and shrink as they travel to a bin under a ticking clock, while a screen draws discounted cash flow bars and an analyst watches.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: crates, x: BELT.x, y: BELT.y - 6 },
    // The analyst stands in front of the belt, so the crates pass behind: a still layer over them.
    { sprite: faAnalyst, x: ANALYST.x, y: ANALYST.y },
    { sprite: faEmblemDcf, x: BOARD.x + FA_MONITOR_GLASS.x, y: BOARD.y + FA_MONITOR_GLASS.y },
    { sprite: minuteHand, x: CLOCK.x + 2, y: CLOCK.y + 2 },
    { sprite: dockLamp, x: DOOR.x + 13, y: DOOR.y - 2, motion: { kind: 'twinkle', periodMs: 1300, min: 0.35 } },
    { sprite: star, x: 56, y: 15, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: star, x: 66, y: 20, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.4, min: 0.2 } },
    { sprite: star, x: 73, y: 13, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.7, min: 0.2 } },
    faStageLight('model', MAP.x, MAP.y),
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};

export const fa6Finish: SceneArt = faKeepsake(
  'fa6-finish',
  'A gold terminal trophy on a purple stand, its screen drawing yearly cash flow bars, gold for their worth today under blue for what discounting takes, a tall terminal bar and an arrow back to today, with small sparkles around it.',
  faEmblemDcf,
);

export const art: LessonArtSet = { opener: fa6Opener, backdrop: faBackdrop, finish: fa6Finish };
