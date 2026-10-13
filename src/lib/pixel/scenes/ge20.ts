/**
 * Global Economics lesson 20: debt, deficits and sovereign risk, in a park on a summer day.
 *
 * The lesson's test of a debt is not its size but how it grows against the economy that carries it:
 * when growth (g) beats the interest rate (r) the debt shrinks as a share of the economy on its own,
 * and when r beats g it compounds. So a brass balance on a stone plinth weighs the state's bonds, on
 * a pan whose plate reads r, against a little economy of homes, wheat, a factory and a tower, on a pan
 * whose plate reads g, and both keep growing. First the economy grows faster than the bonds pile up
 * and the balance leans its way under a white cloud; then the bonds pile up faster than the economy
 * grows, the balance tips back toward them and a storm cloud gathers and rains on the debt; then the
 * scale starts again. The beam only moves because loads are added. Only small layers move: the beam,
 * its two pans and their loads, the weather over the bonds, two clouds and two gulls.
 *
 * The keepsake's emblem is a pile of bonds with a red warning light blinking over it.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCompose, geGull, geLater, geStamp } from './ge-kit';
import { geCloud, geCloudSmall } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * A park on a summer day, 80x60: blue sky with the sun up on the right, a paler band toward a line of
 * round trees (their foot on rows 33 and 34), a lawn mown in bands from row 35 and a gravel path
 * widening from the plinth's foot toward us between flowers.
 */
const park: PixelSprite = {
  id: 'ge20-opener-park',
  name: 'park in summer',
  tags: ['ge20', 'ground'],
  blurb: 'A blue summer sky with the sun, a line of round trees, a striped lawn, flowers and a gravel path.',
  palette: GE_PALETTE,
  rows: [
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbyyybbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbyyyyybbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbyyyyyyGbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbyyyyyyGbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbyyyyyGGbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbyyGGGbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbGGGbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBtttBBBBBBBBBBBBBtttBBBBBBBBBBBBBBtttBBBBBBBBBBBBBtttBBBBBBBBBBBBBtttBB',
    'BBtttBBBnnnttttBBBBBBBBBnnnttttBBBtttBBBBnnnttttBBBBBBBBBnnnttttBBBtttBBBnnntttt',
    'nnnttttnnnnnttttBBtttBBnnnnnttttnnnttttBnnnnnttttBBtttBBnnnnnttttnnnttttnnnnnttt',
    'nnnntttnnnnnntttnnnttttnnnnnnttnnnnnttttnnnnnntttnnnttttnnnnnnttnnnnntttnnnnnntt',
    'nnnnntnnnnnnnntnnnnnttnnnnnnnntnnnnnnttnnnnnnnntnnnnnttnnnnnnnntnnnnnntnnnnnnnnt',
    'nnnnnnNnnnnnnnnnnnnnntNnnnnnnnnnnnnnnntNnnnnnnnnnnnnnntNnnnnnnnnnnnnnnnNnnnnnnnn',
    'nnnnnnNNnnnnnnnnnnnnnnNNnnnnnnNnnnnnnnnNNnnnnnnnnnnnnnnNNnnnnnnNnnnnnnnNNnnnnnnn',
    'nnnnnnnNNnnnnnNnnnnnnnnNNnnnnnNNnnnnnnnnNNnnnnnNnnnnnnnnNNnnnnnNNnnnnnnnNNnnnnnn',
    'NnnnnnnNNNnnnnNNnnnnnnnNNNnnnnnNNnnnnnnnNNNnnnnNNnnnnnnnNNNnnnnnNNnnnnnnNNNnnnnn',
    'JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
    'JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
    'tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
    'tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
    'tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
    'tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
    'ttttttttRyttttttttttttttttttttttttttAAAASAAAttttttttRytttttttttttttttttttttttttt',
    'ttttttttNttttttttttttttttttRytttttttAAASAAAAttttttttNtttttttttttttRytttttttttttt',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnNnnnnnnnAAASAAAAAAnnnnnnnnnnnnnnnnnnnnnNnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnRynnnnnnnnnnnnnnnnnnnAASAAAAAASnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnNnnnnnnnnnnnnnnnnnnnAASAAAAAASAAnnnnnnnnnnnnnnnnnnnnnnnnnnRynnnnnn',
    'ttttttttttttttttttttttttttttttttttASAAAAAASAAAttttttttttRyttttttttttttttNttttttt',
    'tttttRytttttttttttttRytttttttttttASAAAAAASAAAAAtttttttttNttttttttttttttttttttttt',
    'tttttNttttttttttttttNttttttttttttSAAAAAASAAAAAAtttttttttttttttRytttttttttttttttt',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnSAAAAAASAAAAAASAnnnnnnnnnnnnnnNnnnnnnnnnnnnnnnnn',
  ],
};

/** The balance's post and plinth, 15x15: a brass post up to the pivot, a stone plinth with a gold plaque. */
const plinth: PixelSprite = {
  id: 'ge20-opener-plinth',
  name: 'balance post and plinth',
  tags: ['ge20', 'prop'],
  blurb: 'The brass post of a big balance on a stone plinth with a gold plaque.',
  palette: GE_PALETTE,
  rows: [
    '......yOg......',
    '......yOg......',
    '......yOg......',
    '......yOg......',
    '......yOg......',
    '......yOg......',
    '......yOg......',
    '..OOOOOOOOOOO..',
    '.OyGGGGGGGGGgO.',
    '.xxxxxxxxxxxxx.',
    'xxxxxxxxxxxxxxX',
    'XXXXXOyGOXXXXXX',
    'XXXXXOOOOXXXXXX',
    'XXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDD',
  ],
};

/* ── the balance, built frame by frame from its parts ───────────────────────────────────────── */

/** The beam pivots here, on the top of the post. */
const PIVOT = { x: 40, y: 38 } as const;
/** Half the beam's length, and how far each end moves for one step of tilt. */
const HALF = 24;
const STEP = 3;

/**
 * One row per frame: bundles of bonds, how far the economy has grown (1 to 6 pieces) and the tilt
 * (+ leans to the economy, - to the debt). For five frames g beats r: the economy adds a piece every
 * frame, the bonds a bundle every other one. For the last five r beats g: the bonds add a bundle every
 * frame and the economy grows only once more. The beam tilts toward whichever load is bigger.
 */
const STEPS: readonly (readonly [bonds: number, economy: number, tilt: number])[] = [
  [1, 1, 0], [1, 2, 1], [2, 3, 1], [2, 4, 2], [3, 5, 2],
  [4, 5, 1], [5, 5, 0], [6, 6, -1], [7, 6, -2], [7, 6, -2],
];
/** The still is frame 4: g has won, the economy outweighs a debt that is not small. */
const STILL = 4;
const FRAME_MS = 650;

const blank = (w: number, h: number): string[] => Array.from({ length: h }, () => '.'.repeat(w));
/** The top row of the beam at its left (-1) or right (+1) end, in scene pixels. */
const endY = (tilt: number, side: -1 | 1): number => PIVOT.y + Math.round(STEP * tilt * side);

/** The beam, 49x15, its hub over the pivot at (24, 7): lit gold on the near half, shaded beyond. */
function beamAt(tilt: number): string[] {
  let rows = blank(2 * HALF + 1, 15);
  for (let dx = -HALF; dx <= HALF; dx += 1) {
    rows = geStamp(rows, [dx < 0 ? 'y' : 'G', 'O'], HALF + dx, 7 + Math.round((STEP * tilt * dx) / HALF));
  }
  return geStamp(rows, ['.OOO.', 'OyGgO', 'OGGgO', '.OOO.'], HALF - 2, 5);
}

/** One bundle of bonds, white paper tied with a red band. */
const BOND = ['zzzzzrrzzzzz', 'xxxxx11xxxxX'];
/** The plate under the bond pan: r, the interest rate on the debt. */
const PLATE_R = ['.rrrrrrr.', 'rRRRRRRRr', 'rRRzRzzRr', 'rRRzzRRRr', 'rRRzRRRRr', 'rRRzRRRRr', 'rRRRRRRRr', '.rrrrrrr.'];
/** The plate under the economy pan: g, the economy's growth. */
const PLATE_G = ['.nnnnnnn.', 'nNNzzzzNn', 'nNzNNNzNn', 'nNzNNNzNn', 'nNNzzzzNn', 'nNNNNNzNn', 'nNNzzzNNn', '.nnnnnnn.'];
const HOUSE = ['...rr...', '..rrrr..', '.rrrrrr.', 'rrrrrrrr', '.AAAAAS.', '.ABBAAS.', '.ABBAOS.', '.AAAAOS.'];
const WHEAT = ['y.y.y', 'yGyGy', 'GyGyG', '.GGG.', '..G..', '.GGG.', 'GG.GG'];
const FACTORY = ['.......XX', '.......Xx', '.......Xx', '.x.x.x.Xx', 'xxxxxxxxX', 'xBxBxBxXX', 'xxxxxxxXX', 'xxxOOxxXX', 'xxxOOxxXX'];
const TOWER = ['.XXXX.', '.xbxb.', '.xxxx.', '.xbxb.', '.xxxx.', '.xbxb.', '.xxxx.', '.xbxb.', '.xxxx.', '.XXXX.'];
const CRANE = ['GGGGGGG', '..G...X', '..G...X', '..G..XX', '..G....', '..G....', '..G....', '.GGG...'];

/** A pan of bonds, 14x24: up to seven bundles on a brass platform, the r plate under it. */
function bondPan(bundles: number): string[] {
  let rows = blank(14, 24);
  for (let i = 0; i < bundles; i += 1) rows = geStamp(rows, BOND, i % 2 ? 1 : 2, 14 - 2 * (i + 1));
  rows = geStamp(rows, ['OyGGGGGGGGGGgO', '.OOOOOOOOOOOO.'], 0, 14);
  return geStamp(rows, PLATE_R, 2, 16);
}

/** A pan of economy, 23x22: homes and wheat first, then a factory, a second home, a tower, more wheat and a crane. */
function economyPan(pieces: number): string[] {
  let rows = blank(23, 22);
  const at = (art: readonly string[], x: number, bottom: number) => { rows = geStamp(rows, art, x, bottom - art.length + 1); };
  if (pieces >= 6) at(CRANE, 0, 8);
  if (pieces >= 4) at(TOWER, 8, 9);
  if (pieces >= 3) at(HOUSE, 13, 9);
  if (pieces >= 2) at(FACTORY, 13, 11);
  at(HOUSE, 5, 11);
  at(WHEAT, 0, 11);
  if (pieces >= 5) at(WHEAT, 18, 11);
  rows = geStamp(rows, ['OyGGGGGGGGGGGGGGGGGGGgO', '.OOOOOOOOOOOOOOOOOOOOO.'], 0, 12);
  return geStamp(rows, PLATE_G, 7, 14);
}

/**
 * A pan's layer covers its whole travel, so the pan rides inside it: `pan` drawn with its plate's
 * foot on the beam end at that frame's tilt. `top` is where the layer starts, at the pan's highest.
 */
function riding(pan: (n: number) => string[], load: number, tilt: number, side: -1 | 1, top: number, height: number): string[] {
  const art = pan(load);
  return geStamp(blank(art[0].length, height), art, 0, endY(tilt, side) - art.length - top);
}

/** The weather over the bonds, 20x12: fair while g beats r; a grey cloud, then a storm raining on the debt, while r beats g. */
const FAIR = ['....zzzz.....', '..zzzzzzzz.zz', 'zzzzzzzzzzzzz', '.xxxxxxxxxxx.'];
const GREY = ['....xxxx.....', '..xxxxxxxx.xx', 'xxxxxxxxxxxxx', '.XXXXXXXXXXX.'];
const STORM = ['...XXXXXX......', '.XXXXXXXXXXX.XX', 'XXXXXXXXXXXXXXX', 'XDDDDDDDDDDDDDX', '.DDDDDDDDDDDDD.'];
function weatherAt(frame: number): string[] {
  if (frame < 5) return geStamp(blank(20, 12), FAIR, 4, 1);
  if (frame < 7) return geStamp(blank(20, 12), GREY, 3, 1);
  let rows = geStamp(blank(20, 12), STORM, 2, 0);
  for (let i = 0; i < 5; i += 1) {
    for (let k = 0; k < 2; k += 1) rows = geStamp(rows, ['x'], 4 + 3 * i, 6 + ((frame + i) % 3) + 2 * k);
  }
  return rows;
}

const BOND_TOP = endY(2, -1) - 24;
const ECONOMY_TOP = endY(-2, 1) - 22;
const TRAVEL = 4 * STEP;

function framed(id: string, name: string, blurb: string, frames: string[][]): PixelSprite {
  return { id, name, tags: ['ge20', 'animated'], blurb, palette: GE_PALETTE, rows: frames[STILL], frames, frameMs: FRAME_MS };
}

const beam = framed('ge20-opener-beam', 'balance beam', 'A brass balance beam tipping one way, then the other.',
  STEPS.map(([, , tilt]) => beamAt(tilt)));
const bonds = framed('ge20-opener-bonds', 'pan of bonds', 'A pile of white bonds tied with red bands growing on a brass pan marked r.',
  STEPS.map(([n, , tilt]) => riding(bondPan, n, tilt, -1, BOND_TOP, 24 + TRAVEL)));
const economy = framed('ge20-opener-economy', 'pan of economy', 'Homes, wheat, a factory, a tower and a crane growing on a brass pan marked g.',
  STEPS.map(([, pieces, tilt]) => riding(economyPan, pieces, tilt, 1, ECONOMY_TOP, 22 + TRAVEL)));
const weather = framed('ge20-opener-weather', 'weather over the debt', 'A white cloud that turns grey, then into a storm raining on the bonds.',
  STEPS.map((_, i) => weatherAt(i)));

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const base = geCompose('ge20-opener-base', park, [{ sprite: plinth, x: PIVOT.x - 7, y: PIVOT.y + 2 }]);

const gullLater = geLater(geGull, 'ge20-opener-gull-later', 1, 520);

export const ge20Opener: SceneArt = {
  id: 'ge20-opener',
  label: 'In a sunny park a brass balance weighs a pile of government bonds marked r against a little economy of homes, wheat and a factory marked g; while the economy grows faster the balance leans its way under a white cloud, and when the bonds pile up faster it tips back toward them and a storm cloud rains on the bonds.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: weather, x: 7, y: 2 },
    { sprite: beam, x: PIVOT.x - HALF, y: PIVOT.y - 7 },
    { sprite: bonds, x: PIVOT.x - HALF - 6, y: BOND_TOP },
    { sprite: economy, x: PIVOT.x + HALF - 11, y: ECONOMY_TOP },
    { sprite: geCloud, x: 30, y: 4, motion: { kind: 'drift', amp: 3, periodMs: 14000, phase: 0.3 } },
    { sprite: geCloudSmall, x: 50, y: 9, motion: { kind: 'drift', amp: 2, periodMs: 11000, phase: 0.6 } },
    { sprite: geGull, x: 34, y: 14, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 46, y: 19, motion: { kind: 'drift', amp: 2, periodMs: 8200, phase: 0.5 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Sovereign risk: a pile of government bonds with a red warning light blinking over it. */
const emblemDebt: PixelSprite = {
  id: 'ge20-emblem-debt',
  name: 'emblem debt',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A leaning pile of white bonds tied with red bands, a red warning light blinking over it.',
  palette: GE_PALETTE,
  rows: [
    '............r...',
    '...........rRr..',
    '...........RzR..',
    '..........rRzRr.',
    '...DzzzzrrRRRRR.',
    '...DxxxX1rRRzRRr',
    '....DDDDDrrrrrrr',
    '.DzzzzrrzzzD....',
    '.DxxxX11xxXD....',
    '..DDDDDDDDD.....',
    '..DzzzzrrzzzD...',
    '..DxxxX11xxXD...',
    '...DDDDDDDDD....',
    '.DzzzzrrzzzD....',
    '.DxxxX11xxXD....',
    '..DDDDDDDDD.....',
  ],
  frames: [
    [
      '............r...',
      '...........rRr..',
      '...........RzR..',
      '..........rRzRr.',
      '...DzzzzrrRRRRR.',
      '...DxxxX1rRRzRRr',
      '....DDDDDrrrrrrr',
      '.DzzzzrrzzzD....',
      '.DxxxX11xxXD....',
      '..DDDDDDDDD.....',
      '..DzzzzrrzzzD...',
      '..DxxxX11xxXD...',
      '...DDDDDDDDD....',
      '.DzzzzrrzzzD....',
      '.DxxxX11xxXD....',
      '..DDDDDDDDD.....',
    ],
    [
      '............1...',
      '...........121..',
      '...........2s2..',
      '..........12s21.',
      '...Dzzzzrr22222.',
      '...DxxxX1122s221',
      '....DDDDD1111111',
      '.DzzzzrrzzzD....',
      '.DxxxX11xxXD....',
      '..DDDDDDDDD.....',
      '..DzzzzrrzzzD...',
      '..DxxxX11xxXD...',
      '...DDDDDDDDD....',
      '.DzzzzrrzzzD....',
      '.DxxxX11xxXD....',
      '..DDDDDDDDD.....',
    ],
  ],
  frameMs: 700,
};

export const ge20Finish: SceneArt = geKeepsake(
  'ge20-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a leaning pile of white bonds tied with red bands and a red warning light blinking over it, with small sparkles around it.',
  emblemDebt,
);

export const art: LessonArtSet = { opener: ge20Opener, backdrop: geBackdrop, finish: ge20Finish };
