/**
 * Financial Analytics lesson 3, probability and risk: what the tails hold.
 *
 * OPENER. The risk desk, a wide-shot of the control room: a big monitor on a stand over a console
 * draws the lesson's comparison. A dim dotted normal curve goes in first, then the fat-tailed one
 * rises through it, taller in the middle and thicker in the tails; the loss tail turns red and a
 * white dashed line drops at the 95% value at risk. A red alarm on the monitor blinks, a die on
 * the desk tumbles and lands while another rests, and a black swan poster (Taleb's bet on fat
 * tails) hangs over the analyst. The map lights ANALYZE.
 *
 * KEEPSAKE. The trophy with a pair of dice, white and red, their pips landing one by one.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faDie, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDesk, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── props ─────────────────────────────────────────────────────────────────────────────────── */

const stand: PixelSprite = {
  id: 'fa3-stand',
  name: 'monitor stand',
  tags: ['scene', 'fa3', 'prop'],
  rows: ['..DxXkD..', '..DxXkD..', '..DxXkD..', '..DxXkD..', '..DxXkD..', '..DxXkD..', '.DDDDDDD.', 'DxxxxxxkD'],
};

const beacon: PixelSprite = {
  id: 'fa3-beacon',
  name: 'alarm beacon',
  tags: ['scene', 'fa3', 'prop'],
  rows: ['..DD..', '.DRRD.', 'DRsRrD', 'DRRRrD', 'DDDDDD'],
};

/** Taleb's bet: a black swan on the water, framed on the wall. */
const swanPoster: PixelSprite = {
  id: 'fa3-swan-poster',
  name: 'black swan poster',
  tags: ['scene', 'fa3', 'prop'],
  blurb: 'A framed black swan: the rare event a fat tail warns of.',
  rows: [
    '.DDDDDDDDDDDD.',
    'DxxxxxxxxxKKRD',
    'DxxxxxxxxKKxxD',
    'DxxxxxxxxKxxxD',
    'DxxxxxxxxxKxxD',
    'DxxxxxxxxxKxxD',
    'DxKKxxxxxKKxxD',
    'DxKKKKKKKKKxxD',
    'DxxKKKKKKKxxxD',
    'DbbbbbbbbbbbbD',
    '.DDDDDDDDDDDD.',
  ],
};

/* Where things stand. */
const MAP = { x: 2, y: 3 } as const;
const MONITOR = { x: 36, y: 5 } as const;
const GLASS = { x: MONITOR.x + FA_MONITOR_GLASS.x, y: MONITOR.y + FA_MONITOR_GLASS.y } as const;
const DESK = { x: 31, y: 41 } as const;
const ANALYST = { x: 14, y: 33 } as const;
const BEACON = { x: 54, y: 0 } as const;

const room = faRoom('fa3-opener-room', [
  [33, 50, 47, 1, 'Z'],
  [33, 51, 45, 1, 'Z'],
  [17, 57, 14, 2, 'Z'],
]);

const base = faCompose('fa3-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [swanPoster, 8, 15],
  [faMonitor('fa3-monitor', 42, 28), MONITOR.x, MONITOR.y],
  [beacon, BEACON.x, BEACON.y],
  [stand, MONITOR.x + 17, 33],
  [faDesk('fa3-desk', 48), DESK.x, DESK.y],
  [faDie, 40, 34],
  [faAnalyst, ANALYST.x, ANALYST.y],
]);

/* ── the monitor's chart ───────────────────────────────────────────────────────────────────── */

/** Heights above the axis by distance from the centre: fat-tailed (peak and tails) vs normal. */
const FAT = [17, 14, 10, 7, 5, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 1];
const NORMAL = [13, 12, 11, 9, 7, 5, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const AXIS = 21;
/** The 95% value at risk: everything left of this column is the loss tail. */
const VAR_X = 9;

/**
 * Axis first, then the normal curve dotted in from the left, then the fat-tailed curve rising
 * through it, then its loss tail turning red, then the VaR line. 36 x 22, the monitor's glass.
 */
const tailChart: PixelSprite = (() => {
  const full = Array.from({ length: AXIS + 1 }, (_, y) =>
    Array.from({ length: 36 }, (_, x) => {
      const ring = Math.floor(Math.abs(x - 17.5));
      const top = AXIS - FAT[ring];
      if (y === AXIS) return 'X';
      if (NORMAL[ring] > 0 && y === AXIS - NORMAL[ring]) return 'x';
      if (x === VAR_X && y >= 3 && y % 2 === 1) return 'w';
      if (y < top) return '.';
      if (x < VAR_X) return y === top ? 'R' : 'r';
      return y === top ? 'm' : 'T';
    }).join(''));
  return faDrawnBy('fa3-tail-chart', full, (x, y, ch) => {
    if (ch === 'X') return 0;
    if (ch === 'x') return 1 + Math.floor(x / 12);
    if (ch === 'R' || ch === 'r') return 7;
    if (ch === 'w') return 8;
    return 4 + Math.floor((AXIS - 1 - y) / 6);
  }, 260, 4);
})();

/* ── small moving bits ─────────────────────────────────────────────────────────────────────── */

const PIPS: Record<number, readonly (readonly [number, number])[]> = {
  1: [[3, 3]],
  2: [[2, 2], [4, 4]],
  3: [[2, 2], [3, 3], [4, 4]],
  4: [[2, 2], [4, 2], [2, 4], [4, 4]],
  5: [[2, 2], [4, 2], [3, 3], [2, 4], [4, 4]],
  6: [[2, 2], [4, 2], [2, 3], [4, 3], [2, 4], [4, 4]],
};
/** fa-kit's die showing face `n`. */
const face = (n: number) =>
  faDie.rows.map((row, y) => [...row].map((ch, x) => (PIPS[n].some(([px, py]) => px === x && py === y) ? 'K' : ch === 'K' ? 'w' : ch)).join(''));

/** A die tumbling through its faces, then settling on a five for a beat. */
const rollingDie: PixelSprite = {
  id: 'fa3-rolling-die',
  name: 'rolling die',
  tags: ['scene', 'fa3'],
  rows: face(5),
  frames: [3, 6, 1, 4, 2, 5, 5, 5, 5, 5].map(face),
  frameMs: 180,
};

const beaconFlash: PixelSprite = { id: 'fa3-beacon-flash', name: 'beacon flash', tags: ['scene', 'fa3'], rows: ['.ss.', 'ssss'] };
const beaconRays: PixelSprite = { id: 'fa3-beacon-rays', name: 'beacon rays', tags: ['scene', 'fa3'], rows: ['R........R', '.R......R.'] };

export const fa3Opener: SceneArt = {
  id: 'fa3-opener',
  label: 'A risk desk in the data works: a big monitor draws a fat tailed curve over a normal one, its loss tail red past a dashed value at risk line, under a blinking alarm, with dice on the desk and a black swan poster on the wall.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: tailChart, x: GLASS.x, y: GLASS.y },
    { sprite: beaconFlash, x: BEACON.x + 1, y: BEACON.y + 2, motion: { kind: 'twinkle', periodMs: 900, min: 0.1 } },
    { sprite: beaconRays, x: BEACON.x - 2, y: BEACON.y + 1, motion: { kind: 'twinkle', periodMs: 900, phase: 0.5, min: 0 } },
    { sprite: rollingDie, x: 66, y: 34 },
    faStageLight('analyze', MAP.x, MAP.y),
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 3: probability. A pair of dice mid-roll, a white one landing low and a red one tumbling
 * above it. Each die appears blank, then its pips land one at a time; it holds, the screen clears.
 */
export const faEmblemDice: PixelSprite = (() => {
  const full = [
    '.........rrrrr..',
    '........rRRRRRr.',
    '........rRwRRRr.',
    '........rRRwRRr.',
    '.DDDDD..rRRRwRr.',
    'DwwwwxD.rRRRRRr.',
    'DwKwKxD..rrrrr..',
    'DwwKwxD.........',
    'DwKwKxD.........',
    'DxxxxxD.........',
    '.DDDDD..........',
  ];
  // Pips in reading order, per die: the white one's are ink (K), the red one's are white.
  const white: string[] = [];
  const red: string[] = [];
  full.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === 'K') white.push(`${String(x)},${String(y)}`);
    if (ch === 'w' && x >= 8) red.push(`${String(x)},${String(y)}`);
  }));
  return {
    ...faDrawnBy('fa-emblem-dice', full, (x, y) => {
      const at = `${String(x)},${String(y)}`;
      if (x < 8) return white.indexOf(at) + 1;
      return red.includes(at) ? 7 + red.indexOf(at) : 6;
    }, 300),
    name: 'emblem dice',
    blurb: 'A pair of dice mid-roll.',
  };
})();

export const fa3Finish: SceneArt = faKeepsake(
  'fa3-finish',
  'A gold terminal trophy on a purple stand, its screen showing a white die and a red die mid-roll, their pips landing one by one, with small sparkles around it.',
  faEmblemDice,
);

export const art: LessonArtSet = { opener: fa3Opener, backdrop: faBackdrop, finish: fa3Finish };
