/**
 * Financial Analytics lesson 3, probability and risk: what the tails hold.
 *
 * OPENER. The risk desk, a wide-shot of the control room: a big monitor on a stand over a console
 * draws the lesson's comparison, Normal against Fat-Tailed, two curves of the same area. The normal
 * goes in first as a gold dotted line, then the fat-tailed one rises through it in teal: a taller
 * peak, thinner shoulders where the gold dots stand clear above it, and tails that keep running
 * long after the normal has reached zero. The far loss tail turns red and a white dashed line
 * drops at the 95% value at risk, with 5% of the fat curve beyond it, all of it where the normal
 * says nothing can happen: VaR says nothing about the losses past it. A black swan sits out in that
 * tail. A red alarm on the monitor blinks, a die on the desk tumbles and lands while another rests,
 * and a black swan poster (Taleb's bet on fat tails) hangs over the analyst. The map lights ANALYZE.
 *
 * KEEPSAKE. The trophy with a black swan on dark water, the rare loss a fat tail warns of.
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

/**
 * Taleb's bet: a black swan on the water, framed on the wall. Drawn as a silhouette that reads at a
 * glance: head and red beak to the left, the neck in its curve, the body with its raised feathers.
 */
const swanPoster: PixelSprite = {
  id: 'fa3-swan-poster',
  name: 'black swan poster',
  tags: ['scene', 'fa3', 'prop'],
  blurb: 'A framed black swan: the rare event a fat tail warns of.',
  rows: [
    '.DDDDDDDDDDDD.',
    'DxxxxxxxxxxxxD',
    'DxxxKKKxxxxxxD',
    'DxRRKKKxxxxxxD',
    'DxxxxxKxxxxxxD',
    'DxxxxxKxxxxxxD',
    'DxxxxKKxxKxKxD',
    'DxxxKKKKKKKKKD',
    'DxxxxKKKKKKKxD',
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

/**
 * Heights above the axis by distance from the centre, each ring two columns: fat-tailed against
 * normal, with the same area under each (130 and 132 pixels). The fat curve is 6 higher at the
 * peak, 3 to 5 lower on the shoulders, and still running in the tails after the normal is zero.
 */
const FAT = [18, 12, 7, 4, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1];
const NORMAL = [12, 12, 11, 9, 7, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const AXIS = 21;
/** The 95% value at risk: left of this column lie 7 of the fat curve's 130 pixels, 5.4%. */
const VAR_X = 6;
/** The black swan out in the far tail: a dark body on the red, a glint for its head. */
const SWAN_IN_TAIL: Record<string, string> = { '0,20': 'K', '1,20': 'K', '0,19': 'w' };

/**
 * Axis first, then the normal curve dotted in gold from the left (a dot on every other ring, drawn
 * over the fat curve wherever they cross), then the fat-tailed curve rising through it, then its
 * loss tail turning red with the swan in it, then the VaR line. The finished comparison holds for
 * twice as long as it took to draw. 36 x 22, the monitor's glass.
 */
const tailChart: PixelSprite = (() => {
  const full = Array.from({ length: AXIS + 1 }, (_, y) =>
    Array.from({ length: 36 }, (_, x) => {
      const ring = Math.floor(Math.abs(x - 17.5));
      const top = AXIS - FAT[ring];
      if (y === AXIS) return 'X';
      if (NORMAL[ring] > 0 && ring % 2 === 0 && y === AXIS - NORMAL[ring]) return 'y';
      if (x === VAR_X && y >= 3 && y % 2 === 1) return 'w';
      const swan = SWAN_IN_TAIL[`${String(x)},${String(y)}`];
      if (swan) return swan;
      if (y < top) return '.';
      if (x < VAR_X) return y === top ? 'R' : 'r';
      return y === top ? 'm' : 'T';
    }).join(''));
  return faDrawnBy('fa3-tail-chart', full, (x, y, ch) => {
    if (ch === 'X') return 0;
    if (ch === 'y') return 1 + Math.floor(x / 12);
    if (ch === 'R' || ch === 'r' || ch === 'K' || (ch === 'w' && x < VAR_X)) return 7;
    if (ch === 'w') return 8;
    return 4 + Math.floor((AXIS - 1 - y) / 6);
  }, 260, 8);
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
  label: 'A risk desk in the data works: a big monitor compares a gold dotted normal curve with a teal fat tailed one that is taller in the middle and runs on in the tails after the normal reaches zero, its far loss tail red past a dashed value at risk line, under a blinking alarm, with dice on the desk and a black swan poster on the wall.',
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
 * LESSON 3: probability and risk. A black swan on dark water, the rare loss a fat tail warns of and a
 * normal curve says will not come. Moonlight rims its head, neck and back in white so the dark bird
 * holds its shape on the dark glass; the beak is red. The water draws in, the swan rises out of it
 * body first, then neck and head, the beak and raised feathers last; it holds, the screen clears.
 */
export const faEmblemSwan: PixelSprite = (() => {
  const full = [
    '....ww..........',
    '...wkkw.........',
    '.RRwkkD.........',
    '....wkkD........',
    '.....wkkD.......',
    '.....wkkD...w.w.',
    '....wkkkwwwwkwkw',
    '...wkkkkkkkkkkkD',
    '....DkkkkkkkkkD.',
    '.bBBbbbbbbBBbbb.',
    '..b..bbbb..bb...',
  ];
  return {
    ...faDrawnBy('fa-emblem-swan', full, (x, y, ch) => {
      if (y >= 9) return 1;
      if (ch === 'R' || (y === 5 && x > 10)) return 5;
      if (y >= 6) return 2;
      if (y >= 3) return 3;
      return 4;
    }, 300, 4),
    name: 'emblem black swan',
    blurb: 'A black swan on dark water.',
  };
})();

export const fa3Finish: SceneArt = faKeepsake(
  'fa3-finish',
  'A gold terminal trophy on a purple stand, its screen showing a black swan with a red beak on dark water, rimmed in white moonlight, with small sparkles around it.',
  faEmblemSwan,
);

export const art: LessonArtSet = { opener: fa3Opener, backdrop: faBackdrop, finish: fa3Finish };
