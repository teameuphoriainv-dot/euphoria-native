/**
 * Behavioral Finance lesson 22: debiasing techniques and cognitive tools, inside the head.
 *
 * Built on bfMindRoom, and a rematch of lesson 1. The market is crashing again (one eye watches the
 * fall; the other has zoomed out and sees the same fall as a dip at the end of a long climb) and the
 * amygdala's siren is going. System 1 runs for the sell button as before, but this time the button sits
 * under a glass dome with a padlock on it: a pre-commitment, the rule written before the storm. The
 * hare presses at the glass, sweating, a "!" lifting off it. The tortoise gets out another tool from the
 * kit, a magnifying glass, and looks closely: base rates, the decision journal, the case against.
 *
 * The keepsake jar holds the magnifying glass, a green check in its lens.
 */
import type { PixelSprite } from '../types';
import {
  bfConsoleLights,
  bfHareSlam,
  bfLater,
  bfMindRoom,
  bfPanic,
  bfShadowNarrow,
  bfShadowWide,
  bfSiren,
  bfStar,
  bfTortoise,
} from './bf-kit';
import { bfMirror } from './bf-kit-a';
import { BF_TORTOISE_MOUTH, bfStamp } from './bf-kit-b';
import { bfHeadroom } from './bf-kit-c';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The left eye: the crash, close up. */
const crash: PixelSprite = {
  id: 'bf22-opener-crash',
  name: 'bf22-opener-crash',
  tags: ['scene', 'bf22'],
  rows: [
    'RR..................',
    '..R.RR..............',
    '...R..R.............',
    '.......RR...........',
    '.........R..R.......',
    '..........RR.R......',
    '..............R.....',
    '...............R....',
    '................R...',
    '................R...',
    '.................RR.',
    '...................R',
  ],
};

/** The right eye, zoomed out: the same fall is the small red dip at the end of a long climb. */
const zoomedOut: PixelSprite = {
  id: 'bf22-opener-zoomed-out',
  name: 'bf22-opener-zoomed-out',
  tags: ['scene', 'bf22'],
  rows: [
    '...................N..',
    '..................N.R.',
    '.................N...R',
    '...............NN.....',
    '.............NN.......',
    '..........N.N.........',
    '.........N.N..........',
    '.......NN.............',
    '.....N.N..............',
    '....N.N...............',
    '..NN..................',
    'NN....................',
  ],
};

/** The pre-commitment: the sell button under a glass dome, padlocked shut. */
const lockedButton: PixelSprite = {
  id: 'bf22-locked-button',
  name: 'bf22-locked-button',
  tags: ['prop', 'bf22'],
  rows: [
    '....xxxxxxxx....',
    '..xx........xx..',
    '.x.W..........x.',
    '.xW...........x.',
    'x.W............x',
    'x....111111....x',
    'x...1sRRRRr1.W.x',
    'x..1sRRRRRRr1W.x',
    'x..1RRRRRRrr1..x',
    'x..DXXXXXXXXD..x',
    'x..DxwXXXXxXD..x',
    'x..DDDXDDXDDD..x',
    'x....OOOOOO....x',
    'x....OyGGGO....x',
    'x....OGGKGO....x',
    'XXXXXOGGGgOXXXXX',
    'DDDDDOOOOOODDDDD',
  ],
};

const reach = (bfHareSlam.frames ?? [bfHareSlam.rows])[2];
/** The same reach with the sweat drop fallen a little further. */
const reachDrip = reach.map((row, y) => {
  if (y === 7 || y === 8) return row.slice(0, 2) + '.' + row.slice(3);
  if (y === 9) return row.slice(0, 2) + 'B' + row.slice(3);
  if (y === 10) return row.slice(0, 2) + 'b' + row.slice(3);
  return row;
});

/** System 1 at the glass, paw flat on it, sweating; it faces the dome. */
const hareLockedOut = bfMirror(
  { ...bfHareSlam, id: 'bf22-hare-locked-out-right', rows: reach, frames: [reach, reachDrip], frameMs: 480 },
  'bf22-hare-locked-out',
);

/** A magnifying glass, the handle in the tortoise's mouth, the lens up in front of its face. */
const magnifier: PixelSprite = {
  id: 'bf22-magnifier',
  name: 'bf22-magnifier',
  tags: ['prop', 'bf22'],
  rows: [
    '.....OOOOO..',
    '....OQQQWWO.',
    '...OQQQQQWWO',
    '...OQQQQQQWO',
    '...OQQQQQQQO',
    '...OQQQQQQQO',
    '...gOQQQQQO.',
    '..gO.OOOOO..',
    '.gO.........',
    'gO..........',
  ],
};

/** The tortoise, given headroom so the lens can rise past its head; its handle meets the mouth. */
const tortoiseLooking = bfStamp(
  bfHeadroom(bfTortoise, 'bf22-tortoise-tall', 3),
  'bf22-tortoise-looking',
  magnifier,
  BF_TORTOISE_MOUTH.x + 2,
  BF_TORTOISE_MOUTH.y + 3 - 9,
  BF_TORTOISE_MOUTH.dys,
);

const consoleLightsLater = bfLater(bfConsoleLights, 'bf22-opener-console-lights-later', 3, 490);

export const bf22Opener: SceneArt = {
  id: 'bf22-opener',
  label: "Inside an investor's head during a crash, a sweating hare presses at a glass dome padlocked over the sell button while the siren flashes, and a calm tortoise looks closely through a magnifying glass.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: crash, x: 12, y: 15 },
    { sprite: zoomedOut, x: 48, y: 15 },
    { sprite: bfStar, x: 28, y: 25, motion: { kind: 'twinkle', periodMs: 2000, min: 0.2 } },
    { sprite: bfSiren, x: 33, y: 8 },
    { sprite: bfConsoleLights, x: 24, y: 34 },
    { sprite: consoleLightsLater, x: 34, y: 34 },
    { sprite: bfShadowWide, x: 1, y: 56 },
    { sprite: bfShadowNarrow, x: 58, y: 54 },
    { sprite: lockedButton, x: 44, y: 40 },
    { sprite: tortoiseLooking, x: 0, y: 37 },
    { sprite: hareLockedOut, x: 53, y: 27, motion: { kind: 'drift', amp: 1, periodMs: 520 } },
    { sprite: bfPanic, x: 58, y: 30, motion: { kind: 'rise', amp: 3, periodMs: 1400 } },
  ],
};

/** The keepsake emblem: a magnifying glass, gold rimmed, a green check in its lens. */
const emblemMagnifier: PixelSprite = {
  id: 'bf22-emblem-magnifier',
  name: 'bf22-emblem-magnifier',
  tags: ['emblem', 'bf', 'lesson-22'],
  blurb: "Lesson 22's emblem: the debiasing toolkit caught as a magnifying glass with a check in its lens.",
  rows: [
    '.....OOOO.......',
    '...OOGGGGOO.....',
    '..OGGGGGGGGO....',
    '.OGGWWQQQQGgO...',
    '.OGWQQQQQQQgO...',
    'OGGWQQQQQnQggO..',
    'OGGQQQQQnQQggO..',
    'OGGQQnQnQQQggO..',
    'OGGQQQnQQQQggO..',
    '.OGQQQQQQQQgO...',
    '.OGGQQQQQQggOO..',
    '..OggggggggOgO..',
    '...OOggggOOgggO.',
    '.....OOOO.OgggO.',
    '...........OgggO',
    '............OggO',
    '.............OO.',
  ],
};

export const bf22Finish: SceneArt = bfKeepsake(
  'bf22-finish',
  'A corked glass jar with a paper tag, holding a gold rimmed magnifying glass with a green check in its lens, with bubbles rising inside and sparkles around it.',
  emblemMagnifier,
);

export const art: LessonArtSet = { opener: bf22Opener, backdrop: bfBackdrop, finish: bf22Finish };
