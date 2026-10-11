/**
 * Global Economics lesson 6: international trade and globalization, on the quay by day.
 *
 * A container ship lies at the quay while the crane swings our goods (emerald) aboard, a second
 * ship comes in over the horizon carrying another country's (red and cream), and the two countries'
 * flags fly side by side at the end of the quay: each makes what it is best at and trades for the
 * rest, so both come out richer. Only small layers move: the crane's load and its warning light,
 * the inbound ship, the two flags, two clouds, two gulls and glints on the water.
 *
 * The keepsake's emblem is a container ship riding the waves.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import {
  GE_CRANE_TIP,
  GE_PALETTE,
  geBeacon,
  geCompose,
  geCrane,
  geFlag,
  geGull,
  geLater,
  geMirror,
  geShip,
  geShipFar,
  geTint,
} from './ge-kit';
import { geCloud, geCloudSmall, geFlagRed, geGlintDay, geGroundQuay } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** The crane's load, 8x7: a cable from the trolley, the spreader, and one emerald container. */
const load: PixelSprite = {
  id: 'ge6-opener-load',
  name: 'crane load',
  tags: ['ge6', 'trade'],
  blurb: 'An emerald shipping container hanging from a crane cable.',
  palette: GE_PALETTE,
  rows: [
    '...X....',
    '...X....',
    '...X....',
    '...X....',
    '.DDDDDD.',
    'nnnnnnnJ',
    'nJnJnJnJ',
  ],
};

/** The other country's ship, inbound, its containers in red and cream. */
const inbound = geMirror(geTint(geShipFar, 'ge6-opener-inbound-tint', { b: 'r', t: 'A', G: 'r', n: 'A' }), 'ge6-opener-inbound');

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const CRANE = { x: 0, y: 26 };

const base = geCompose('ge6-opener-base', geGroundQuay, [
  { sprite: geShip, x: 22, y: 29 },
  { sprite: geCrane, x: CRANE.x, y: CRANE.y },
]);

const flagLater = geLater(geFlagRed, 'ge6-opener-flag-red-later', 1, 340);
const gullLater = geLater(geGull, 'ge6-opener-gull-later', 1, 520);

export const ge6Opener: SceneArt = {
  id: 'ge6-opener',
  label: 'On a sunny quay a crane loads green containers onto a cargo ship while a second ship sails in with red ones, and an emerald flag and a red flag fly side by side at the end of the quay.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: load, x: 16, y: 36, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
    { sprite: geBeacon, x: CRANE.x + GE_CRANE_TIP.x, y: CRANE.y + GE_CRANE_TIP.y },
    { sprite: inbound, x: 36, y: 22, motion: { kind: 'drift', amp: 3, periodMs: 9000 } },
    { sprite: geFlag, x: 66, y: 36 },
    { sprite: flagLater, x: 73, y: 36 },
    { sprite: geCloud, x: 44, y: 4, motion: { kind: 'drift', amp: 4, periodMs: 12000 } },
    { sprite: geCloudSmall, x: 8, y: 10, motion: { kind: 'drift', amp: 3, periodMs: 9500, phase: 0.5 } },
    { sprite: geGull, x: 30, y: 15, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 58, y: 13, motion: { kind: 'drift', amp: 2, periodMs: 8400, phase: 0.4 } },
    { sprite: geGlintDay, x: 64, y: 31 },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Trade: a container ship, bow to the right, riding waves that roll under it. */
const emblemShip: PixelSprite = {
  id: 'ge6-emblem-ship',
  name: 'emblem container ship',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A container ship stacked with red, blue, teal and green containers, riding the waves.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '................',
    '................',
    '................',
    '..DDD...........',
    '..D1D...........',
    '.DDDDD.rrbbttnn.',
    '.DxKxD.rrbbttnn.',
    '.DxxxD.bbnnrrtt.',
    '.DxKxD.bbnnrrtt.',
    'DDDDDDDDDDDDDDD.',
    '.DkkkkkkkkkkkD..',
    '..D111111111D...',
    '...DDDDDDDDD....',
    'B...BB....BB...B',
    '.BBB..BBBB..BBB.',
  ],
  frames: [
    [
      '................',
      '................',
      '................',
      '................',
      '..DDD...........',
      '..D1D...........',
      '.DDDDD.rrbbttnn.',
      '.DxKxD.rrbbttnn.',
      '.DxxxD.bbnnrrtt.',
      '.DxKxD.bbnnrrtt.',
      'DDDDDDDDDDDDDDD.',
      '.DkkkkkkkkkkkD..',
      '..D111111111D...',
      '...DDDDDDDDD....',
      'B...BB....BB...B',
      '.BBB..BBBB..BBB.',
    ],
    [
      '................',
      '................',
      '................',
      '................',
      '..DDD...........',
      '..D1D...........',
      '.DDDDD.rrbbttnn.',
      '.DxKxD.rrbbttnn.',
      '.DxxxD.bbnnrrtt.',
      '.DxKxD.bbnnrrtt.',
      'DDDDDDDDDDDDDDD.',
      '.DkkkkkkkkkkkD..',
      '..D111111111D...',
      '...DDDDDDDDD....',
      '..BB....BB....BB',
      'BB..BBBB..BBBB..',
    ],
  ],
  frameMs: 700,
};

export const ge6Finish: SceneArt = geKeepsake(
  'ge6-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a container ship stacked with colourful containers riding the waves, with small sparkles around it.',
  emblemShip,
);

export const art: LessonArtSet = { opener: ge6Opener, backdrop: geBackdrop, finish: ge6Finish };
