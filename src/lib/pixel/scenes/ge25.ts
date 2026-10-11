/**
 * Global Economics lesson 25, the advanced capstone: the whole bay at dawn, and the world rising.
 *
 * Lesson 10's bay at the other end of the day. Over the harbor mouth the world comes up like the sun,
 * turning in its own light; bunting in the colours of six countries hangs across the sky either side
 * of it, ships sail out across the bay both ways, and on the promenade the student holds up their
 * diploma with the sun's path on the water behind them. Every model in the pathway, from one coin and
 * two wants to the whole system at once, meets here. Only small layers move: the world, the bunting,
 * the ships, the sun on the water, the breakwater lights, the factory's smoke and two gulls.
 *
 * The keepsake's emblem is the pathway's own turning globe, which the plan keeps for the checkpoint
 * and the capstone.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import {
  GE_PALETTE,
  GE_STUDENT_HOLD,
  geBeacon,
  geCompose,
  geEmblemGlobe,
  geGull,
  geLater,
  geMirror,
  geShimmer,
  geShipFar,
  geSmoke,
  geStudent,
} from './ge-kit';
import { GE_BAY_LIGHTS, geGlobeTurning, geGroundBay } from './ge-kit-b';
import { geTintRows } from './ge-kit-c';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * geGroundBay at dawn: every band of the sky a step brighter and warmer, from night blue at the top
 * to amber on the horizon, and the glints in the water one step brighter too. The headlands, the
 * balustrade and the paving keep their colours.
 */
const bayDawn = geTintRows(geGroundBay, 'ge25-opener-bay', [
  { from: 0, to: 27, map: { K: 'h', k: 'd', '0': '6', '6': 'E', E: 'I', I: '2', '2': '3', '3': '4' } },
  { from: 28, to: 43, map: { '2': '3', '3': '4', '4': '5' } },
]);

/** The risen world's light, 24x24: a pale ring round the globe and a broken amber one outside it. */
const halo: PixelSprite = {
  id: 'ge25-opener-halo',
  name: 'sunrise halo',
  tags: ['ge25', 'prop'],
  blurb: 'Two rings of dawn light round an empty middle.',
  palette: GE_PALETTE,
  rows: [
    '...........4......4...........',
    '...........5......5...........',
    '............333333.......4....',
    '.....4...33........33...4.....',
    '......5.3............3.5......',
    '.......3..............3.......',
    '......3................3......',
    '.....3..................3.....',
    '.....3..................3.....',
    '4445......................544.',
    '....3....................3....',
    '....3....................3....',
    '....3....................3....',
    '....3....................3....',
    '....3....................3....',
    '....3....................3....',
    '.445......................5444',
    '.....3..................3.....',
    '.....3..................3.....',
    '......3................3......',
    '.......3..............3.......',
    '......5.3............3.5......',
    '.....4...33........33...4.....',
    '....4.......333333............',
    '...........5......5...........',
    '...........4......4...........',
    '...........4......4...........',
    '..................4...........',
  ],
};

/** Bunting, 28x8: pennants in six countries' colours on a line sagging from the top left corner. */
const swagLeft: PixelSprite = {
  id: 'ge25-opener-swag-left',
  name: 'bunting',
  tags: ['ge25'],
  blurb: 'A line of small pennants in emerald, red, gold, blue, orchid and teal.',
  palette: GE_PALETTE,
  rows: [
    'x..........................x',
    'xx........................xx',
    '..xx....................xx..',
    '..NNnx................xx....',
    '...Nn.xxxx........xxxxTTt...',
    '...n..RRr.xxxxxxxxPPp..Tt...',
    '.......Rr.yyG.BBb..Pp..t....',
    '.......r...yG..Bb..p........',
  ],
};

/** The same bunting from the top right corner. Pennants hang straight down, so mirroring is safe. */
const swagRight: PixelSprite = {
  id: 'ge25-opener-swag-right',
  name: 'bunting',
  tags: ['ge25'],
  blurb: 'A line of small pennants in emerald, red, gold, blue, orchid and teal.',
  palette: GE_PALETTE,
  rows: [
    'x..........................x',
    'xx........................xx',
    '..xx....................xx..',
    '....xx................xnNN..',
    '...tTTxxxx........xxxx.nN...',
    '...tT..pPPxxxxxxxx.rRR..n...',
    '....t..pP..bBB.Gyy.rR.......',
    '........p..bB..Gy...r.......',
  ],
};

/** A diploma held up, 5x5: a rolled scroll tied with a red ribbon. */
const diploma: PixelSprite = {
  id: 'ge25-opener-diploma',
  name: 'diploma',
  tags: ['ge25'],
  blurb: 'A rolled white diploma tied with a red ribbon.',
  palette: GE_PALETTE,
  rows: [
    '...Az',
    '..zzx',
    '.rrx.',
    'zzx..',
    'Ax...',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** The world rises over the harbor mouth, its centre on (40, 13), inside the halo. */
const GLOBE = { x: 30, y: 3 };
/** Where the student stands, on the promenade in the sun's path. The diploma is placed from it. */
const STUDENT = { x: 32, y: 32 };

const base = geCompose('ge25-opener-base', bayDawn, [
  { sprite: halo, x: 25, y: 0 },
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

const globe = geGlobeTurning('ge25-opener-globe', 20, 16, 260);
/** Coming the other way, bow to the left. */
const westbound = geMirror(geShipFar, 'ge25-opener-westbound');
const shimmerLater = geLater(geShimmer, 'ge25-opener-shimmer-later', 1, 520);
const gullLater = geLater(geGull, 'ge25-opener-gull-later', 1, 520);
/** The two breakwater lights blink in turn, not together. */
const beaconLater = geLater(geBeacon, 'ge25-opener-beacon-later', 1, 900);

export const ge25Opener: SceneArt = {
  id: 'ge25-opener',
  label: 'At dawn on a harbor promenade, a student holds up a diploma while the world rises like the sun over the harbor mouth, bunting in six colours hangs across the sky and ships sail out across the bay.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: globe, x: GLOBE.x, y: GLOBE.y },
    { sprite: swagLeft, x: 0, y: 0, motion: { kind: 'bob', amp: 1, periodMs: 3200 } },
    { sprite: swagRight, x: 52, y: 0, motion: { kind: 'bob', amp: 1, periodMs: 3600, phase: 0.5 } },
    { sprite: geShipFar, x: 2, y: 31, motion: { kind: 'drift', amp: 2, periodMs: 9000 } },
    { sprite: westbound, x: 56, y: 33, motion: { kind: 'drift', amp: 2, periodMs: 10400, phase: 0.5 } },
    { sprite: geShimmer, x: 22, y: 39 },
    { sprite: shimmerLater, x: 49, y: 40 },
    { sprite: diploma, x: STUDENT.x + GE_STUDENT_HOLD.x, y: STUDENT.y + GE_STUDENT_HOLD.y },
    { sprite: geBeacon, x: GE_BAY_LIGHTS[0].x, y: GE_BAY_LIGHTS[0].y },
    { sprite: beaconLater, x: GE_BAY_LIGHTS[1].x, y: GE_BAY_LIGHTS[1].y },
    { sprite: geSmoke, x: 58, y: 12, motion: { kind: 'rise', amp: 4, periodMs: 2600 } },
    { sprite: geGull, x: 18, y: 13, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 57, y: 10, motion: { kind: 'drift', amp: 2, periodMs: 8200, phase: 0.4 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

export const ge25Finish: SceneArt = geKeepsake(
  'ge25-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a blue globe with green continents turning, with small sparkles around it.',
  geEmblemGlobe,
);

export const art: LessonArtSet = { opener: ge25Opener, backdrop: geBackdrop, finish: ge25Finish };
