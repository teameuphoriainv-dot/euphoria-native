/**
 * Quantitative Analysis lesson 7, Factor Models & Alpha Generation: over the quant's shoulder.
 *
 * A close-up, the quant's head big in the foreground. The screen breaks a fund's 18% return into a
 * waterfall: market beta (the big orchid bar), then value (teal) and momentum (blue) stacked on it,
 * then the thin gold slice that is left, the true alpha, under a magnifier; the hollow last bar is
 * the total. A side screen spins a double helix whose rungs are the factors' colours (the DNA of
 * returns). Only small layers move: the magnifier hovers over the alpha, the alpha glints, the helix
 * turns, the cursor blinks, steam rises from the mug.
 * Keepsake: an alpha.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_PALETTE, qaBlip, qaCompose, qaKeepsake, qaKeyboard, qaMouse, qaMug, qaPath, qaRoom, qaScreen, qaSparkleSmall,
  qaSteam, qaText,
} from './qa-kit';
import type { QaStamp } from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

/* ── the waterfall ─────────────────────────────────────────────────────────────────────────────── */

const SCREEN = { x: 2, y: 2, width: 58, height: 40 } as const;
const BASELINE = 30;
const BAR_W = 7;

/** A bar, lit on its left column and shaded on its right, like everything in the room. */
function bar(id: string, height: number, lit: string, body: string, shade: string): PixelSprite {
  const row = lit + body.repeat(BAR_W - 2) + shade;
  return { id, name: id, tags: ['scene', 'qa7'], rows: Array.from({ length: height }, () => row) };
}

/** 18% in screen pixels at 4 to 3: beta 10% (13), value 3% (4), momentum 3% (4), alpha 2% (3). */
const STEPS: [string, number, string, string, string][] = [
  ['beta', 13, 'q', 'P', 'p'],
  ['value', 4, 'T', 'T', 't'],
  ['momentum', 4, 'B', 'B', 'b'],
  ['alpha', 3, 'y', 'G', 'g'],
];
const BAR_X = (i: number) => 7 + i * (BAR_W + 3);

const bars: QaStamp[] = [];
let top = BASELINE;
STEPS.forEach(([name, height, lit, body, shade], i) => {
  top -= height;
  bars.push({ sprite: bar(`qa7-bar-${name}`, height, lit, body, shade), x: BAR_X(i), y: top + 1 });
  // The waterfall's step: a dashed line from this bar's top across to the next bar.
  bars.push({ sprite: qaPath(`qa7-step-${name}`, 3, 1, [[0, 0], [2, 0]], 'X', [1, 1]), x: BAR_X(i) + BAR_W, y: top + 1 });
});
const TOTAL_TOP = top + 1;
const ALPHA = { x: BAR_X(3), y: TOTAL_TOP } as const;

/** The total: a hollow bar, the whole 18%. */
const total: PixelSprite = {
  id: 'qa7-bar-total',
  name: 'qa7-bar-total',
  tags: ['scene', 'qa7'],
  rows: Array.from({ length: BASELINE - TOTAL_TOP + 1 }, (_, r) => (r === 0 ? 'wwwwwww' : 'wXXXXXx')),
};

const labels: QaStamp[] = [
  { sprite: qaText('qa7-label-beta', 'β', 'q'), x: BAR_X(0) + 2, y: BASELINE + 2 },
  { sprite: qaText('qa7-label-value', 'V', 'T'), x: BAR_X(1) + 2, y: BASELINE + 2 },
  { sprite: qaText('qa7-label-momentum', 'M', 'B'), x: BAR_X(2) + 1, y: BASELINE + 2 },
  { sprite: qaText('qa7-label-alpha', 'α', 'y'), x: BAR_X(3) + 2, y: BASELINE + 2 },
  { sprite: qaText('qa7-label-total', '18%', 'w'), x: BAR_X(4) - 2, y: BASELINE + 2 },
];

/** The magnifier hovering over the alpha: a software zoom lens, its glass showing the slice big. */
const magnifier: PixelSprite = {
  id: 'qa7-magnifier',
  name: 'qa7-magnifier',
  tags: ['scene', 'qa7'],
  blurb: 'A zoom lens over the alpha slice, the slice enlarged in its glass with an alpha on it.',
  rows: [
    '...XXXXX......',
    '..XyyyyyX.....',
    '.XyGGGGGyX....',
    'XyGGOGOGGgX...',
    'XyGOGOGGGgX...',
    'XyGOGOGGGgX...',
    'XyGGOGOGGgX...',
    '.XyGGGGGggX...',
    '..XggggggX....',
    '...XXXXXXDD...',
    '.........DXD..',
    '..........DXD.',
    '...........DXD',
    '............DD',
  ],
};

/* ── the helix ─────────────────────────────────────────────────────────────────────────────────── */

const HELIX = { width: 11, height: 22 } as const;
const RUNG_COLOURS = ['P', 'T', 'B', 'G'];

/**
 * A double helix seen side on: two strands a half turn apart, a rung every third row in the
 * factors' colours. `phase` turns it a quarter turn at a time.
 */
function helix(phase: number): string[] {
  const rows: string[] = [];
  for (let y = 0; y < HELIX.height; y += 1) {
    const cells = new Array<string>(HELIX.width).fill('.');
    const angle = ((y + phase * 3) / 12) * Math.PI * 2;
    const a = Math.round(5 + 4 * Math.sin(angle));
    const b = Math.round(5 - 4 * Math.sin(angle));
    if (y % 3 === 0) {
      const colour = RUNG_COLOURS[Math.floor(y / 3) % RUNG_COLOURS.length];
      for (let x = Math.min(a, b) + 1; x < Math.max(a, b); x += 1) cells[x] = colour;
    }
    // The strand in front is lit, the one behind it dim.
    const front = Math.cos(angle) >= 0;
    cells[a] = front ? 'w' : 'X';
    cells[b] = front ? 'X' : 'w';
    rows.push(cells.join(''));
  }
  return rows;
}

const helixTurning: PixelSprite = {
  id: 'qa7-helix',
  name: 'qa7-helix',
  tags: ['scene', 'qa7'],
  blurb: 'The factor helix turning.',
  rows: helix(0),
  frames: [helix(0), helix(1), helix(2), helix(3)],
  frameMs: 300,
};

/* ── the close-up quant and the desk ───────────────────────────────────────────────────────────── */

/** The quant's head and shoulders seen from just behind, twice the size of the standing figure. */
const quantClose: PixelSprite = {
  id: 'qa7-quant-close',
  name: 'qa7-quant-close',
  tags: ['scene', 'qa7'],
  blurb: "The quant's head and shoulders from just behind, cropped by the frame: ears, a crew neck.",
  rows: [
    '........DDDDDDDD........',
    '......DDppppEEEEDD......',
    '.....DpppEEppEEEEED.....',
    '....DppEEEEpEEEEEEED....',
    '....DpEEEEEEEEpEEEEED...',
    '...DpEEEEpEEEEEEEEEED...',
    '...DpEEEEEEEEEEEEEEED...',
    '...DEEEEEEEEEEEEEEEED...',
    '..sDEEEEEEEEEEEEEEEEDs..',
    '..sDEEEEEEEEEEEEEEEEDs..',
    '...DEEEEEEEEEEEEEEEED...',
    '....DEEEEEEEEEEEEEED....',
    '.....DDEEEEEEEEEEDD.....',
    '.......DDssssssDD.......',
    '........DssssssD........',
    '....EEEEDssssssDEEEE....',
    '..EEPPPPPDssssDPPPPPEE..',
    '.EPqqPPPPPEDDEPPPPPPPpE.',
    'EPqqPPPPPPPPPPPPPPPPPPpE',
    'EPqPPPPPPPPPPPPPPPPPPPpE',
    'EPqPPPPPPPPPPPPPPPPPPPpE',
  ],
};

const deskTop: PixelSprite = {
  id: 'qa7-desk-top',
  name: 'qa7-desk-top',
  tags: ['scene', 'qa7'],
  blurb: 'The near edge of the desk, cropped by the frame.',
  palette: QA_PALETTE,
  rows: [
    'g'.repeat(80),
    ...Array.from({ length: 8 }, () => 'G'.repeat(60) + 'g'.repeat(20)),
    'O'.repeat(80),
    'Z'.repeat(80),
    'Z'.repeat(80),
  ],
};

const base = qaCompose('qa7-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaScreen('qa7-screen', SCREEN.width, SCREEN.height, { surface: 'K' }), x: SCREEN.x, y: SCREEN.y },
  { sprite: qaPath('qa7-axis', 46, 1, [[0, 0], [45, 0]], 'X'), x: 6, y: BASELINE + 1 },
  ...bars,
  { sprite: total, x: BAR_X(4), y: TOTAL_TOP },
  ...labels,
  { sprite: qaScreen('qa7-side-screen', 15, 28, { surface: 'K' }), x: 63, y: 4 },
  { sprite: { id: 'qa7-side-stand', name: 'qa7-side-stand', tags: ['scene', 'qa7'], rows: ['..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', 'DXXXXXD'] }, x: 67, y: 32 },
  { sprite: { id: 'qa7-arm', name: 'qa7-arm', tags: ['scene', 'qa7'], rows: ['..DXD..', '..DXD..', '..DXD..', '..DXD..', '..DXD..', 'DXXXXXD'] }, x: 27, y: 42 },
  { sprite: deskTop, x: 0, y: 48 },
  { sprite: qaKeyboard, x: 14, y: 49 },
  { sprite: qaMouse, x: 31, y: 49 },
  { sprite: qaMug, x: 4, y: 43 },
  { sprite: quantClose, x: 46, y: 39 },
]);

export const qa7Opener: SceneArt = {
  id: 'qa7-opener',
  label: "Over a quant's shoulder, a screen breaks an 18 percent return into bars for market beta, value and momentum, with a magnifier over the thin gold slice of alpha, beside a turning helix of factors.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: magnifier, x: ALPHA.x - 2, y: ALPHA.y - 4, motion: { kind: 'bob', amp: 1, periodMs: 1800 } },
    { sprite: qaSparkleSmall, x: ALPHA.x - 1, y: ALPHA.y - 3, motion: { kind: 'twinkle', periodMs: 1500, phase: 0.4, min: 0.3 } },
    { sprite: helixTurning, x: 65, y: 7 },
    { sprite: qaBlip, x: 55, y: 6, motion: { kind: 'twinkle', periodMs: 1000, min: 0.15 } },
    { sprite: qaSteam, x: 5, y: 39, motion: { kind: 'rise', amp: 3, periodMs: 1900 } },
  ],
};

/** Lesson 7's emblem: an alpha, the return left when every factor is taken out. */
const emblemAlpha: PixelSprite = {
  id: 'qa7-emblem-alpha',
  name: 'qa7-emblem-alpha',
  tags: ['scene', 'qa7'],
  rows: [
    '............',
    '............',
    '..OOOO...OO.',
    '.OOyyOO.OOy.',
    'OOy...OOOy..',
    'OOy....OOy..',
    'OOy....OOy..',
    'OOy...OOOy..',
    '.OOyyOOyOOy.',
    '..OOOOy..OOy',
    '...yyyy...y.',
    '............',
  ],
};

export const qa7Finish: SceneArt = qaKeepsake(
  'qa7-finish',
  'A gold medallion hanging from a purple ribbon, embossed with the Greek letter alpha, with small sparkles around it.',
  emblemAlpha,
);

export const art: LessonArtSet = { opener: qa7Opener, backdrop: qaBackdrop, finish: qa7Finish };
