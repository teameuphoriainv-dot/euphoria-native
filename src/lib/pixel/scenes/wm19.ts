/**
 * Wealth Management lesson 19 (international wealth management): its opener, the pathway backdrop
 * and its keepsake, as one set loaded on demand.
 *
 * The opener is the map room at night: tobacco-striped walls, a bookcase (wm-kit-a.ts), a travel
 * trunk plastered with labels, three wall clocks each telling a different hour (one for every time
 * zone the family's money now lives in), and in the middle a great library globe in a brass ring.
 * The father, drawn large from wm-kit-c.ts, sets it turning with one hand while the child points
 * out a country. The lesson's point is that an American family's wealth is taxed and reported
 * wherever it sits in the world, and rises and falls with its currencies. What moves: the globe
 * turns, its oceans and continents sliding past under a fixed highlight; each clock's second hand
 * ticks round, out of step with the others; a glint sits on the ring. The keepsake carries a globe.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, WM_INKS } from './wm-kit';
import { wmBookcase, wmStripes } from './wm-kit-a';
import { wmChildTall, wmParentTall, wmRepose } from './wm-kit-c';
import { wmKeepsake } from './wm1-finish';

/** The ring's top-left; the globe sits 3 in from it, the stand under it. */
const RING_X = 29;
const RING_Y = 21;

/** The clocks' left edges (9 wide), all at one height. */
const CLOCKS = [21, 36, 51] as const;
const CLOCK_Y = 6;

/* ── the room ───────────────────────────────────────────────────────────────────────────────── */

/** A clock face: a pale dial with four hour marks in a grey rim, lit from the upper left. 9x9. */
const DIAL = [
  '..xxxxX..',
  '.xwwxwwX.',
  'xwwwwwwwX',
  'xwwwwwwwX',
  'xxwwKwwxX',
  'xwwwwwwwX',
  'xwwwwwwwX',
  '.XwwxwwX.',
  '..XXXXX..',
];

/** A clock with its minute hand on the hour and its hour hand along `hour`, [x, y] pixels. */
function clock(id: string, hour: readonly (readonly [number, number])[]): PixelSprite {
  const rows = DIAL.map((row) => [...row]);
  for (const [x, y] of [[4, 3], [4, 2], [4, 1], ...hour]) rows[y][x] = 'K';
  return { id, name: id, tags: ['scene', 'wm19'], rows: rows.map((row) => row.join('')) };
}

/** Seven, one and nine o'clock: the same minute in three countries. */
const clockWest = clock('wm19-opener-clock-west', [[3, 5], [2, 6]]);
const clockHome = clock('wm19-opener-clock-home', [[5, 3], [6, 2]]);
const clockEast = clock('wm19-opener-clock-east', [[3, 4], [2, 4]]);

/** A brass name plate under each clock. 5x2. */
const plate: PixelSprite = {
  id: 'wm19-opener-plate',
  name: 'wm19-opener-plate',
  tags: ['scene', 'wm19'],
  rows: ['yGGGg', 'OOOOO'],
};

/** The meridian ring, brass, lit on its upper left, with the axis pins top and bottom. 23x23. */
const ring: PixelSprite = {
  id: 'wm19-opener-ring',
  name: 'wm19-opener-ring',
  tags: ['scene', 'wm19'],
  rows: Array.from({ length: 23 }, (_, y) =>
    Array.from({ length: 23 }, (_, x) => {
      const dx = x - 11;
      const dy = y - 11;
      const d = Math.hypot(dx, dy);
      if (d < 9.5 || d >= 11) return '.';
      const lit = -(dx + dy) / d;
      if (lit > 0.6) return 'y';
      return lit > -0.5 ? 'G' : 'g';
    }).join(''),
  ),
};

/** A turned wooden pedestal on three splayed legs, a brass cup at the top for the ring. 15x14. */
const stand: PixelSprite = {
  id: 'wm19-opener-stand',
  name: 'wm19-opener-stand',
  tags: ['scene', 'wm19'],
  palette: WM_INKS,
  rows: [
    '......yGg......',
    '.....gGGGO.....',
    '......CCU......',
    '......CCU......',
    '.....CCCUU.....',
    '......CCU......',
    '......CCU......',
    '......CCU......',
    '.....CCCUU.....',
    '....CCCCUUU....',
    '...CU..CU..UU..',
    '..CU...CU...UU.',
    '.CU....CU....UU',
    'KK.....KK....KK',
  ],
};

/** A steamer trunk: leather, two straps, a brass band and lock, labels from abroad. 15x10. */
const trunk: PixelSprite = {
  id: 'wm19-opener-trunk',
  name: 'wm19-opener-trunk',
  tags: ['scene', 'wm19'],
  palette: WM_INKS,
  rows: [
    'GOOOOOOOOOOOOOG',
    'OCCCKCCCCCCKCCU',
    'OCRRKCCBBCCKCCU',
    'OCRRKCCBBCCKNNU',
    'GGGGGGGyGGGGGGG',
    'OCCCKCCCCCCKCCU',
    'OCwRKCCCCCCKCCU',
    'OCCCKCCNNNCKCCU',
    'OUUUKUUUUUUKUUU',
    'GOOOOOOOOOOOOOG',
  ],
};

/** A red rug under the globe, a gold line inside its border. 56x8. */
const RUG_W = 56;
const rug: PixelSprite = {
  id: 'wm19-opener-rug',
  name: 'wm19-opener-rug',
  tags: ['scene', 'wm19'],
  rows: [
    '1'.repeat(RUG_W),
    `1${'g'.repeat(RUG_W - 2)}1`,
    ...Array.from({ length: 4 }, () => `1g${'r'.repeat(RUG_W - 4)}g1`),
    `1${'g'.repeat(RUG_W - 2)}1`,
    '1'.repeat(RUG_W),
  ],
};

/** The father's left hand up on the ring, setting the globe turning. 14x23. */
const fatherSpinning = wmRepose(wmParentTall, 'wm19-opener-father-spinning', {
  5: '..CCCCCCU...CC',
  6: '...CCCCU...bU.',
  7: '....CCU...bb..',
  8: '...bwRwb.bb...',
  9: '.BBBwRwBbb....',
  10: 'BBbBBRBBbb....',
  11: 'BBbBBRBBb.....',
  12: 'BBbBBRBBb.....',
  13: 'BBbBBBBBb.....',
  14: 'BBbBBBBBb.....',
  15: 'CCbBBBBBb.....',
}, 0, 3);

/** The child's right arm up, pointing at a country. 12x15. */
const childPointing = wmRepose(wmChildTall, 'wm19-opener-child-pointing', {
  3: 'CC.ggCCCCCgg',
  4: '.TT.CCKCKCU.',
  5: '..TTCCCCCCU.',
  6: '...T.CCCCU..',
  7: '...TtTTTTTt.',
  8: '.....tTTTttt',
  9: '.....tTTTttt',
  10: '.....tTTTtUU',
}, 3, 0);

const base = wmCompose('wm19-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1], ['k', 1]]),
  ...wmStripes(80, 41, 'O', 'U', 7),
  ...wmBands(80, [['K', 1], ['k', 1], ['k', 2], ['K', 1], ['k', 3], ['K', 1], ['k', 3], ['K', 1], ['k', 2]]),
], [
  { sprite: wmBookcase, x: -5, y: 6 },
  { sprite: clockWest, x: CLOCKS[0], y: CLOCK_Y },
  { sprite: clockHome, x: CLOCKS[1], y: CLOCK_Y },
  { sprite: clockEast, x: CLOCKS[2], y: CLOCK_Y },
  ...CLOCKS.map((x) => ({ sprite: plate, x: x + 2, y: CLOCK_Y + 10 })),
  { sprite: rug, x: 12, y: 50 },
  { sprite: ring, x: RING_X, y: RING_Y },
  { sprite: stand, x: RING_X + 4, y: RING_Y + 22 },
  { sprite: trunk, x: 63, y: 47 },
  { sprite: fatherSpinning, x: 19, y: 35 },
  { sprite: childPointing, x: 50, y: 43 },
]);

/* ── the globe ──────────────────────────────────────────────────────────────────────────────── */

/** The world, wrapped round: the Americas, Europe and Africa, Asia, Australia. 32x17. */
const MAP = [
  '................................',
  '...######.......###.#########...',
  '..########.....###############..',
  '...#######....################..',
  '....######....#############.....',
  '.....####......#####.#####......',
  '......##.......####..####.......',
  '.......###.....#####..##........',
  '........####....####............',
  '.........####...###.........#...',
  '.........####....##........###..',
  '..........##.....#........####..',
  '..........#...............###...',
  '..........#.....................',
  '................................',
  '................................',
  '................................',
];

/**
 * The globe's face with the map turned `offset` columns: each pixel looks up the longitude under
 * it (so continents crowd at the edges like a ball's), then takes the shade of the light falling
 * on it from the upper left. The white highlight stays put while the world turns under it. 17x17.
 */
function globeFace(offset: number): string[] {
  return Array.from({ length: 17 }, (_, y) =>
    Array.from({ length: 17 }, (_, x) => {
      const nx = (x - 8) / 8.5;
      const ny = (y - 8) / 8.5;
      const rr = nx * nx + ny * ny;
      if (rr > 1) return '.';
      if (x === 5 && y === 4) return 'w';
      const nz = Math.sqrt(1 - rr);
      const col = Math.floor(offset + (Math.atan2(nx, nz) / Math.PI + 0.5) * 16 + 32) % 32;
      const light = -0.55 * nx - 0.5 * ny + 0.67 * nz;
      const tone = light > 0.75 ? 2 : light > 0.3 ? 1 : 0;
      return MAP[y][col] === '#' ? 'nNm'[tone] : 'EbB'[tone];
    }).join(''),
  );
}

const globe: PixelSprite = {
  id: 'wm19-opener-globe',
  name: 'wm19-opener-globe',
  tags: ['scene', 'wm19'],
  blurb: 'The globe turning in its ring: money that lives in more than one country.',
  rows: globeFace(0),
  frames: Array.from({ length: 16 }, (_, i) => globeFace(30 - 2 * i)),
  frameMs: 200,
};

/** A red second hand ticking round a dial, one eighth of a turn a frame. 9x9. */
const TICKS: readonly (readonly (readonly [number, number])[])[] = [
  [[4, 3], [4, 2]],
  [[5, 3], [6, 2]],
  [[5, 4], [6, 4]],
  [[5, 5], [6, 6]],
  [[4, 5], [4, 6]],
  [[3, 5], [2, 6]],
  [[3, 4], [2, 4]],
  [[3, 3], [2, 2]],
];
const handAt = (tick: readonly (readonly [number, number])[]) => {
  const rows = wmBands(9, [['.', 9]]).map((row) => [...row]);
  for (const [x, y] of tick) rows[y][x] = 'r';
  return rows.map((row) => row.join(''));
};
const secondHand: PixelSprite = {
  id: 'wm19-opener-second-hand',
  name: 'wm19-opener-second-hand',
  tags: ['scene', 'wm19'],
  rows: handAt(TICKS[0]),
  frames: TICKS.map(handAt),
  frameMs: 750,
};

const glint: PixelSprite = {
  id: 'wm19-opener-glint',
  name: 'wm19-opener-glint',
  tags: ['scene', 'wm19'],
  rows: ['W'],
};

export const wm19Opener: SceneArt = {
  id: 'wm19-opener',
  label: 'A father sets a great globe turning in its brass ring while his child points at it, under three wall clocks telling different hours, beside a bookcase and a travel trunk covered in labels.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: globe, x: RING_X + 3, y: RING_Y + 3 },
    { sprite: secondHand, x: CLOCKS[0], y: CLOCK_Y },
    { sprite: wmLater(secondHand, 'wm19-opener-second-hand-home', 3, 750), x: CLOCKS[1], y: CLOCK_Y },
    { sprite: wmLater(secondHand, 'wm19-opener-second-hand-east', 6, 750), x: CLOCKS[2], y: CLOCK_Y },
    { sprite: glint, x: RING_X + 4, y: RING_Y + 4, motion: { kind: 'twinkle', periodMs: 2300, min: 0 } },
  ],
};

/** A desk globe in its meridian arc: the Americas in deep gold on a gold sea. */
const emblemGlobe: PixelSprite = {
  id: 'wm19-emblem-globe',
  name: 'wm19-emblem-globe',
  tags: ['scene', 'wm19'],
  rows: [
    '......OGG....',
    '....yOGGg.G..',
    '...yOOOGgg.G.',
    '..yGOOOGGgg.G',
    '..yGGOOGGgg.G',
    '..GGGGOOGgg.G',
    '..GGGGOOOgg.g',
    '..gGGGGOOgg.g',
    '...gGGGOgg.g.',
    '....gggOO.g..',
    '......Oggg...',
    '......g......',
    '...yGGGGgO...',
  ],
};

export const wm19Finish: SceneArt = wmKeepsake(
  'wm19-finish',
  emblemGlobe,
  'A green crest with a gold rim bearing a globe in its meridian ring, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm19Opener, backdrop: wmBackdrop, finish: wm19Finish };
