/**
 * ge-backdrop: the world's harbor at night, for the Global Economics course, drawn to sit along the
 * bottom of every lesson screen behind the content. Kit cranes stand on a quay at the left over
 * stacked containers, a container ship rides at its mooring in the middle, and a lighthouse keeps
 * the breakwater at the right, all tinted to night tones (GE_NIGHT) in front of a far shore of low
 * hills and a town. What moves is what moves in a port at night: the ship rides the swell, smoke
 * leaves its funnel, the crane lights blink in turn, the lighthouse sweeps, lights shiver on the
 * water and ripples drift. Every colour stays under luminance 0.15, so the text in front always wins.
 */
import type { PixelSprite } from '../types';
import {
  GE_CRANE_TIP,
  GE_NIGHT,
  GE_PALETTE,
  GE_SHIP_FUNNEL,
  geBeacon,
  geBeam,
  geCompose,
  geContainer,
  geCrane,
  geLater,
  geLighthouse,
  geShip,
  geSmoke,
  geStar,
  geTint,
} from './ge-kit';
import type { SceneArt } from './types';

const ground: PixelSprite = {
  id: 'ge-backdrop-ground',
  name: 'harbor at night',
  tags: ['scene', 'ge'],
  blurb: 'Far hills and a town, the quay, the breakwater and the dark water.',
  palette: GE_PALETTE,
  rows: [
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '....................................................................YYYYY.............YYYY......................',
    '............................................................YYYY....KKKKK.......YYYY..KKKK......................',
    '............................................................KKKKYYY.KKKKK.YYY...KKKK..KKKKYYY...................',
    '............................................................KKKKKKK.KKKKK.KKK...KKKKKKKKKKKKK...................',
    '................................KKKKKKKK.............KKKKKKKKKKKKKK.KKKKK.KKKKKKKKKKKKKKKKKKK...........KKKKKKKK',
    '........KKKKKKKKK........KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    '...KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKDDKKKKKKKDDKKKKKKKDDKKKKKKKDDKKKKKKKDDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkDDDDDDDDDDDDDDDDDDDD',
    'kkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkDYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaakkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaakkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKaacccccccccccccccccccaaaaaaaaaaaaaaaaaaaaKKKKKKKKKKKKKKKKKKKKK',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaccccccccccccccccccccccaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaacccccccccccccccccaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaccccccccccccccccaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaccccccccccccccccccaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaacccccccccccccccccccccaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  ],
};

const crane = geTint(geCrane, 'ge-backdrop-crane', GE_NIGHT);
/** A container in a night colour: v red, h blue, i teal, j gold, e green. */
const box = (paint: string) => geTint(geContainer, `ge-backdrop-box-${paint}`, { r: paint });

const base = geCompose('ge-backdrop-base', ground, [
  { sprite: crane, x: 2, y: 10 },
  { sprite: crane, x: 27, y: 10 },
  { sprite: box('h'), x: 14, y: 24 },
  { sprite: box('v'), x: 14, y: 27 },
  { sprite: box('i'), x: 22, y: 27 },
  { sprite: box('j'), x: 39, y: 24 },
  { sprite: box('e'), x: 39, y: 27 },
  { sprite: box('v'), x: 0, y: 27 },
  { sprite: geTint(geLighthouse, 'ge-backdrop-lighthouse', GE_NIGHT), x: 95, y: 12 },
]);

/** At night the ship's dark bridge windows are the lit ones. */
const ship = geTint(geShip, 'ge-backdrop-ship', { ...GE_NIGHT, K: 'O' });
const SHIP = { x: 51, y: 20 };
const smoke = geTint(geSmoke, 'ge-backdrop-smoke', { x: 'D', X: 'D' });
const star = geTint(geStar, 'ge-backdrop-star', { z: 'D' });
/** The second crane blinks on the first one's off beat. */
const beaconLater = geLater(geBeacon, 'ge-backdrop-beacon-later', 1, 900);

/** Lamplight broken up by the swell, under the lighthouse and under the ship's bridge. */
const glimmer: PixelSprite = {
  id: 'ge-backdrop-glimmer',
  name: 'glimmer',
  tags: [],
  palette: GE_PALETTE,
  rows: [
    'O',
    '.',
    'j',
    'O',
    '.',
    'j',
  ],
};
const ripple: PixelSprite = {
  id: 'ge-backdrop-ripple',
  name: 'ripple',
  tags: [],
  palette: GE_PALETTE,
  rows: [
    'dd.ddd',
  ],
};
const townLight: PixelSprite = {
  id: 'ge-backdrop-town-light',
  name: 'town light',
  tags: [],
  rows: [
    'O',
  ],
};

export const geBackdrop: SceneArt = {
  id: 'ge-backdrop',
  label: 'A harbor at night with cranes, stacked containers, a moored cargo ship and a lighthouse sweeping its beam over dark water.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: ship, x: SHIP.x, y: SHIP.y, motion: { kind: 'bob', amp: 1, periodMs: 4800 } },
    { sprite: smoke, x: SHIP.x + GE_SHIP_FUNNEL.x, y: SHIP.y + GE_SHIP_FUNNEL.y - 3, motion: { kind: 'rise', amp: 6, periodMs: 5200 } },
    { sprite: smoke, x: SHIP.x + GE_SHIP_FUNNEL.x + 1, y: SHIP.y + GE_SHIP_FUNNEL.y - 5, motion: { kind: 'rise', amp: 6, periodMs: 5200, phase: 0.5 } },
    { sprite: geBeam, x: 92, y: 14 },
    { sprite: geBeacon, x: 2 + GE_CRANE_TIP.x, y: 10 + GE_CRANE_TIP.y },
    { sprite: beaconLater, x: 27 + GE_CRANE_TIP.x, y: 10 + GE_CRANE_TIP.y },
    { sprite: glimmer, x: 99, y: 37, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: glimmer, x: 56, y: 36, motion: { kind: 'twinkle', periodMs: 3400, phase: 0.5, min: 0.3 } },
    { sprite: ripple, x: 18, y: 39, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: ripple, x: 72, y: 39, motion: { kind: 'drift', amp: 4, periodMs: 9000, phase: 0.4 } },
    { sprite: star, x: 12, y: 3, motion: { kind: 'twinkle', periodMs: 5200, min: 0.3, phase: 0.2 } },
    { sprite: star, x: 47, y: 6, motion: { kind: 'twinkle', periodMs: 6100, min: 0.3, phase: 0.7 } },
    { sprite: star, x: 80, y: 2, motion: { kind: 'twinkle', periodMs: 4700, min: 0.3, phase: 0.4 } },
    { sprite: townLight, x: 69, y: 20, motion: { kind: 'twinkle', periodMs: 6400, min: 0.35, phase: 0.1 } },
    { sprite: townLight, x: 87, y: 19, motion: { kind: 'twinkle', periodMs: 5600, min: 0.35, phase: 0.6 } },
  ],
};
