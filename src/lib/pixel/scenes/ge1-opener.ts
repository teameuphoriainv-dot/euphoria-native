/**
 * Global Economics lesson 1 opener: what economics is, at a fork in the road with one coin.
 *
 * Twilight over the harbor. A student holds up their only coin at a signpost pointing to college
 * (cap) and work (briefcase) while the thought bubble flips between them: scarcity is one coin and
 * two wants, opportunity cost is the road it does not buy. The ground is drawn here; the signpost,
 * glyphs and student are kit sprites composed onto it. Only small layers move: the bubble, the
 * coin's glint, the outbound ship, the shimmer on the water, two gulls, stars and far-coast lights.
 */
import type { PixelSprite } from '../types';
import {
  GE_PALETTE,
  GE_STUDENT_HOLD,
  geBubbleChoice,
  geCoinSmall,
  geCompose,
  geGlyphCap,
  geGlyphCase,
  geGull,
  geLater,
  geMirror,
  geShimmer,
  geShipFar,
  geSignWith,
  geStar,
  geStarBig,
  geStudent,
  geTint,
} from './ge-kit';
import type { SceneArt } from './types';

const ground: PixelSprite = {
  id: 'ge1-opener-ground',
  name: 'ge1-opener-ground',
  tags: ['scene', 'ge1'],
  blurb: "Twilight sky, a far coast, the harbor water, a meadow, the road forking and the cast shadows.",
  palette: GE_PALETTE,
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk0000000000000kkkkkkkkkkkkkkkkk',
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '00000666666666666666600000000000000000000000000000000000000000000000000000000000',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666EEEEEEEEEEEEEEEEEEE666666666666666EEEEEEEEEEEEEEEE6666',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEIIIIIIIIIIIIIEEEEEEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIIIIIIIIIIEEEEEEEEEEEEEEEEEEEEE',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIII222222222222222222222IIIIIIIIIIIIIIIIIIIII22222222222222222IIIIIIIII',
    '22222222222222222222222222222222222222222222222222222222222222222222kk22kkkkkkkk',
    '3333333333222222222222222222222222223333333333333333322222222233kkkkkkkkkkkkkkkk',
    '3333333333333333333333333333333333333333333333333333333333kkkkkkkkkkkkkkkkkkkkkk',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'ccccccccccccccccccccccccccccccccccccccccccccIIIIIIIIIIIIIccccccccccccccccccccccc',
    'cccddddddddddccccccccccccccccccccccccccc22222222222ccccccccccccccccccccccccccccc',
    'ccccccccccccccccccccddddddddddddccccccccccccccccccccccccccccccccccccccccccdddddd',
    'ccccccccccccccccccccccccccccccccccccIIIIIIIIIcdddddddccccccccccccccccccccccccccc',
    'ccccccccddddddddcccccccccccccccccccccccccc222222cccccccccccccccccccccccccccccccc',
    'ccccccccccccccccccccccccccccccddddddddcccccccccccccccccccccccccccccccccccccccccc',
    'ccdddddcccccccccccccccccccccccccccccccccccccccccccccccdddddddccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '77777777787877777777777777778777777777777777777777787777777777777777777777777777',
    '77777777777777777777777777787877777777777777777777878777777777777777777777777777',
    'ooooo777777777777777777777777777777777777777777777777777777777777777777777oooooo',
    'llllloooooooo777777777777777777777777777777777777777777777777777oooooooooollllll',
    'lllllllllllllooooooooo77777777777777777777777777777777oooooooooollllllllllllllll',
    '777llllllllllllllllllloooooooo77777777777777oooooooooollllllllllllllllllllll7777',
    '777777777lllllllllllllllllllllooooollloZZZZZlllllllllllllllllllllll8l77777777777',
    '777777777777777llll8lllllllllllllllllZZZZZllllllllllllllllllll777787877777777777',
    '777777777777777777878lllllllllllllllllllllllllllllllllll777777777777777777777877',
    '77777777777777777777777777lllllllllllllllllllllll7777777777777777777777777778787',
    '7777778777777777777777777777olllllllllllllllllu777777777777777777777777777777777',
    '777778787777777777777777777olllllllllllllllllllu77777777777778777777777777777777',
    '777777777777777777777777777ollllllllllllllllllllu7777777777787877777777777777777',
    '77777777777777777777777777olllllllllllllllllllllu7777777777777777777777777777777',
    '99999999999999999999999999ollllllllllllllllllllllu999999999999999999999999999999',
    '9999999999999998999999999ollllllllllllllllllllllllu99999999999999999999989999999',
    '9999999999999989899999999ollllllllllllllllllllllllu99999999999999999999898999999',
    '999999999999999999999999ollllllllllllllllllllllllllu9999999999999999999999999999',
    '999999999999999999999999olllllllllllllllllllllllllllu99ZZZZZZZZZ9999999999999999',
  ],
};

/** Where the student stands. The coin is placed from it, so moving the student moves the coin. */
const STUDENT = { x: 49, y: 35 };

const base = geCompose('ge1-opener-base', ground, [
  { sprite: geSignWith('ge1-opener-sign', geGlyphCap, geGlyphCase), x: 24, y: 21 },
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

/** College, then work, then college: the two wants the one coin cannot both buy. */
const bubble = geBubbleChoice('ge1-opener-bubble', geGlyphCap, geGlyphCase, 'left');
/** Outbound, heading off the left edge of the map. */
const ship = geMirror(geShipFar, 'ge1-opener-ship');
const gullLater = geLater(geGull, 'ge1-opener-gull-later', 1, 520);
/** The far coast's lights: a warm window, not a star. */
const coastLight = geTint(geStar, 'ge1-opener-coast-light', { z: 'G' });

export const ge1Opener: SceneArt = {
  id: 'ge1-opener',
  label: 'At dusk by a harbor, a student holds up their only coin at a signpost, one board pointing to college and the other to work, while a cargo ship heads out to sea behind them.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: bubble, x: 52, y: 13, motion: { kind: 'bob', amp: 1, periodMs: 3000 } },
    { sprite: geCoinSmall, x: STUDENT.x + GE_STUDENT_HOLD.x, y: STUDENT.y + GE_STUDENT_HOLD.y },
    { sprite: ship, x: 1, y: 24, motion: { kind: 'bob', amp: 1, periodMs: 3600, phase: 0.3 } },
    { sprite: geShimmer, x: 38, y: 32 },
    { sprite: geGull, x: 10, y: 12, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 19, y: 17, motion: { kind: 'drift', amp: 2, periodMs: 8200, phase: 0.5 } },
    { sprite: geStarBig, x: 17, y: 6, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 6, y: 3, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 33, y: 2, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 47, y: 7, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
    { sprite: geStar, x: 70, y: 4, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.55, min: 0.2 } },
    { sprite: geStar, x: 76, y: 11, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.85, min: 0.25 } },
    { sprite: coastLight, x: 67, y: 30, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.1, min: 0.35 } },
    { sprite: coastLight, x: 76, y: 29, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.6, min: 0.35 } },
  ],
};
