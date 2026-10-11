/**
 * Global Economics lesson 10, the foundations checkpoint: everything connects, on the bay at dusk.
 *
 * The whole bay from the promenade, and on it a monument: the world turning in a brass ring, the
 * flags of six countries flying either side of it, ships crossing the bay both ways, and on the far
 * shore the places the pathway has been so far (the bank, the capitol, the factory, the tower).
 * Supply and demand, the Fed, inflation, currencies, trade and the budget are one system, and this is
 * all of it at once. Only small layers move: the globe, the six flags, the two ships, the factory's
 * smoke, the tower's light, a gull and the first stars.
 *
 * The keepsake's emblem is the pathway's own turning globe, which the plan keeps for the checkpoint
 * and the capstone.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import {
  GE_PALETTE,
  geBeacon,
  geCompose,
  geEmblemGlobe,
  geFlag,
  geGull,
  geLater,
  geMirror,
  geShipFar,
  geSmoke,
  geStar,
  geStarBig,
} from './ge-kit';
import { geFlagBlue, geFlagRed } from './ge-kit-a';
import { geFlagGold, geFlagOrchid, geFlagTeal, geGlobeTurning, geGroundBay } from './ge-kit-b';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** The monument without its globe, 30x44: a brass meridian ring on a stepped stone pedestal. */
const monument: PixelSprite = {
  id: 'ge10-opener-monument',
  name: 'globe monument',
  tags: ['ge10', 'prop'],
  blurb: 'A brass meridian ring and its axis on a stepped stone pedestal with a gold plaque.',
  palette: GE_PALETTE,
  rows: [
    '..............OO..............',
    '..........OOOOOyOOOO..........',
    '........OOGGGGGGGGGGOO........',
    '.........G..........GgOO......',
    '......................gOO.....',
    '.......................gOO....',
    '........................gOO...',
    '.........................gO...',
    '..........................gO..',
    '..........................gO..',
    '...........................gO.',
    '...........................gO.',
    '...........................gO.',
    '...........................gO.',
    '...........................gO.',
    '...........................gO.',
    '...........................gO.',
    '...........................gO.',
    '...........................gO.',
    '...........................gO.',
    '..........................gO..',
    '..........................gO..',
    '.........................gO...',
    '........................gOO...',
    '.......................gOO....',
    '......................gOO.....',
    '.........G..........GgOO......',
    '........OOGGGGGGGGGGOO........',
    '..........OOOOGgOOOO..........',
    '.............OGgO.............',
    '.............OGgO.............',
    '.............OGgO.............',
    '.........xxxxxxxxxxxx.........',
    '.........XXXXXXXXXXXD.........',
    '..........xXXXXXXXXD..........',
    '..........xXXOOOOXXD..........',
    '..........xXXOyGOXXD..........',
    '..........xXXOOOOXXD..........',
    '..........xXXXXXXXXD..........',
    '......xxxxxxxxxxxxxxxxxx......',
    '......XXXXXXXXXXXXXXXXXD......',
    '......XXXXXXXXXXXXXXXXXD......',
    '......DDDDDDDDDDDDDDDDDD......',
    '.....kkkkkkkkkkkkkkkkkkkk.....',
  ],
};

/** A flagpole below its flag, 3x9, on a small stone foot: the flag layer carries the top ten rows. */
const pole: PixelSprite = {
  id: 'ge10-opener-pole',
  name: 'flagpole',
  tags: ['ge10', 'prop'],
  blurb: 'The lower part of a flagpole on a small stone foot.',
  palette: GE_PALETTE,
  rows: [
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    'DDD',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const MONUMENT = { x: 25, y: 16 };
/** The globe turns in the ring, which the monument leaves open 3 pixels in from its corner. */
const GLOBE = { x: MONUMENT.x + 3, y: MONUMENT.y + 3 };
/** Each flag's pole, three either side of the monument; the flags fly from FLAG_TOP down. */
const POLES = [3, 11, 19, 56, 64, 72] as const;
const FLAG_TOP = 37;

const base = geCompose('ge10-opener-base', geGroundBay, [
  { sprite: monument, x: MONUMENT.x, y: MONUMENT.y },
  ...POLES.map((x) => ({ sprite: pole, x: x - 1, y: FLAG_TOP + 10 })),
]);

const globe = geGlobeTurning('ge10-opener-globe', 24, 16, 260);
/** Six countries, each flag a beat apart from its neighbour so the row never waves in step. */
const flags = [geFlag, geFlagRed, geFlagGold, geFlagBlue, geFlagOrchid, geFlagTeal].map((flag, i) =>
  geLater(flag, `ge10-opener-flag-${String(i)}`, i % 3, 300 + 20 * i),
);
/** Coming the other way, bow to the left. */
const westbound = geMirror(geShipFar, 'ge10-opener-westbound');
const gullLater = geLater(geGull, 'ge10-opener-gull-later', 1, 520);

export const ge10Opener: SceneArt = {
  id: 'ge10-opener',
  label: 'At dusk on a harbor promenade, a giant globe turns in its brass ring on a stone pedestal while the flags of six countries fly on either side and cargo ships cross the bay both ways.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: globe, x: GLOBE.x, y: GLOBE.y },
    { sprite: geShipFar, x: 2, y: 28, motion: { kind: 'drift', amp: 2, periodMs: 9000 } },
    { sprite: westbound, x: 56, y: 29, motion: { kind: 'drift', amp: 2, periodMs: 10400, phase: 0.5 } },
    ...flags.map((sprite, i) => ({ sprite, x: POLES[i], y: FLAG_TOP })),
    { sprite: geSmoke, x: 58, y: 12, motion: { kind: 'rise', amp: 4, periodMs: 2600 } },
    { sprite: geBeacon, x: 75, y: 9 },
    { sprite: geGull, x: 8, y: 10, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 62, y: 6, motion: { kind: 'drift', amp: 2, periodMs: 8200, phase: 0.4 } },
    { sprite: geStarBig, x: 40, y: 3, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 24, y: 2, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 12, y: 5, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 53, y: 1, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
    { sprite: geStar, x: 72, y: 3, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.55, min: 0.2 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

export const ge10Finish: SceneArt = geKeepsake(
  'ge10-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a blue globe with green continents turning, with small sparkles around it.',
  geEmblemGlobe,
);

export const art: LessonArtSet = { opener: ge10Opener, backdrop: geBackdrop, finish: ge10Finish };
