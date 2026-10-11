/**
 * Behavioral Finance lesson 14: status quo bias and inertia, inside the investor's head.
 *
 * Built on bfMindRoom. Through the left eye the money sits in cash on a flat grey line, safe and going
 * nowhere; through the right, Save More Tomorrow, green bars climbing a step a year. In the room System
 * 1 has sunk into the default: the hare slumps in an armchair so long unmoved that a cobweb runs from
 * its ear to the chair, eyes heavy, dozing off, while a snail overtakes it on the floor. The tortoise
 * walks in with the wake-up call, a ringing alarm clock: audit the defaults.
 *
 * The keepsake jar holds a snail.
 */
import type { PixelSprite } from '../types';
import {
  bfConsoleLights,
  bfLater,
  bfMindRoom,
  bfShadowNarrow,
  bfShadowWide,
  bfStar,
  bfStarBig,
  bfTortoise,
} from './bf-kit';
import { bfMirror } from './bf-kit-a';
import { bfStamp } from './bf-kit-b';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The left eye: cash parked on a flat line, safe and going nowhere. */
const flatLine: PixelSprite = {
  id: 'bf14-opener-flat',
  name: 'bf14-opener-flat',
  tags: ['scene', 'bf14'],
  rows: [
    'XXXXXXXXXXXXXXXXXXXXw',
  ],
};

/** The right eye: Save More Tomorrow, savings climbing a step at a time, an arrow over the last. */
const stairs: PixelSprite = {
  id: 'bf14-opener-stairs',
  name: 'bf14-opener-stairs',
  tags: ['scene', 'bf14'],
  rows: [
    '................m..',
    '...............mmm.',
    '...................',
    '...............mmm.',
    '...............NNN.',
    '..........mmm..NNN.',
    '..........NNN..NNN.',
    '.....mmm..NNN..NNN.',
    '.....NNN..NNN..NNN.',
    'mmm..NNN..NNN..NNN.',
    'NNN..NNN..NNN..NNN.',
    'NNN..NNN..NNN..NNN.',
  ],
};

const awake = [
  '......DD.........DD......',
  '.....DxwD.......DwxX.....',
  '.....DxFD.......DFxDX....',
  '.....DxFwD.....DwFxD.X...',
  '......DxFD.....DFxD...X..',
  '......DxFwD...DwFxD...X..',
  '.......DxFD...DFxD.....X.',
  '.......DxwD...DwxD.....X.',
  '......DDxxDDDDDxxDD....X.',
  'xxExEDXxxxxxxxxxxxXDEEE..',
  'xExqDXxxxxxxxxxxxxxXDPpE.',
  'ExPPDXxXXXxxxxxXXXxXDPPpE',
  'xqxPDXxWKWxxxxxWKWxXDPPpE',
  'EqPPDXxxxxxxxxxxxxxXDPPpE',
  'EqPPDXxxxxxxFxxxxxxXDPPpE',
  'EqPPPDXxxxxXXXxxxxXDPPPpE',
  'EqPPPPDDXxxxxxxxXDDPPPPpE',
  'EDwwDDXxxwwwwwwwxxXDDwwDE',
  'EqqPpExxwwwwwwwwwxxEqPPpE',
  'EqPPpExxwwwwwwwwwxxEqPPpE',
  'EqPPpExxxwwwwwwwxxxEqPPpE',
  'EqPPpEXXxxxxxxxxxXXEqPPpE',
  'EqPPpE.............EqPPpE',
  'EqPPpEEEEEEEEEEEEEEEqPPpE',
  'EqPPpqqqqqqqqqqqqqqqpPPpE',
  'EpPPpDwwwDPPPPPDwwwDpPPpE',
  'EppppDDDDDpppppDDDDDppppp',
  '.EEEEEEEEEEEEEEEEEEEEEEE.',
  '..EE.................EE..',
  '..EE.................EE..',
];
const dozing = awake.map((row, y) => (y === 12 ? row.replace(/WKW/g, 'DDD') : row));

/** System 1 in the default: slumped in an armchair, a cobweb from ear to chair, eyes drooping shut. */
const hareArmchair: PixelSprite = {
  id: 'bf14-hare-armchair',
  name: 'bf14-hare-armchair',
  tags: ['character', 'bf14', 'system-1'],
  rows: awake,
  frames: [awake, awake, dozing],
  frameMs: 900,
};

/** A snail crossing the floor, still faster than the hare. */
const snail: PixelSprite = {
  id: 'bf14-snail',
  name: 'bf14-snail',
  tags: ['prop', 'bf14'],
  rows: [
    '........D.D',
    '..EEEE..n.n',
    '.EFFFFE.n.n',
    'EFfEEfFEnmn',
    'EFfFEfFEmmn',
    'EFffffFEmmn',
    '.EEEEEEnmmn',
    'nmmmmmmmmmn',
    '.nnnnnnnnn.',
  ],
};

/** The wake-up call in the tortoise's mouth: an alarm clock, bells hammering. */
const clockStill: PixelSprite = {
  id: 'bf14-clock',
  name: 'bf14-clock',
  tags: ['prop', 'bf14'],
  rows: [
    '...DDD...',
    'OO.D.D.OO',
    'OyO...OyO',
    '.OO111OO.',
    '.1RwwwR1.',
    '1RwwKwwR1',
    '1RwwKwwR1',
    '1RwwwKwR1',
    '.1RwwwR1.',
    '..11111..',
    '.1.....1.',
  ],
};

const clockRinging: PixelSprite = {
  ...clockStill,
  id: 'bf14-clock-ringing',
  rows: [
    'OO.DDD.OO',
    'OyOD.DOyO',
    '.O.....O.',
    '...111...',
    '.1RwwwR1.',
    '1RwwKwwR1',
    '1RwwKwwR1',
    '1RwwwKwR1',
    '.1RwwwR1.',
    '..11111..',
    '.1.....1.',
  ],
};

/** The clock rides the head's dip, hammering on the second frame; then the tortoise turns to face left. */
const tortoiseClock = bfMirror(
  bfStamp(
    bfStamp(bfTortoise, 'bf14-tortoise-clock-a', clockStill, 31, 6, [0, null]),
    'bf14-tortoise-clock-b',
    clockRinging,
    31,
    6,
    [null, 1],
  ),
  'bf14-tortoise-clock',
);

const ring: PixelSprite = {
  id: 'bf14-ring',
  name: 'bf14-ring',
  tags: ['prop', 'bf14'],
  blurb: "Ring marks either side of the alarm clock's bells.",
  rows: [
    'y.........y',
    '.y.......y.',
    '...........',
    'y.........y',
  ],
};

const consoleLightsLater = bfLater(bfConsoleLights, 'bf14-opener-console-lights-later', 2, 640);

export const bf14Opener: SceneArt = {
  id: 'bf14-opener',
  label: "Inside an investor's head, a hare dozes in an armchair with a cobweb on its ear while a snail crawls past and the eyes show flat cash beside climbing savings, and a calm tortoise walks in with a ringing alarm clock.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: bfStarBig, x: 26, y: 16, motion: { kind: 'twinkle', periodMs: 2700, min: 0.3 } },
    { sprite: bfStar, x: 15, y: 19, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.3, min: 0.2 } },
    { sprite: flatLine, x: 12, y: 24 },
    { sprite: stairs, x: 50, y: 16 },
    { sprite: bfConsoleLights, x: 46, y: 34 },
    { sprite: consoleLightsLater, x: 69, y: 34 },
    { sprite: bfShadowNarrow, x: 3, y: 55 },
    { sprite: bfShadowWide, x: 41, y: 54 },
    { sprite: hareArmchair, x: 1, y: 26 },
    { sprite: snail, x: 28, y: 47, motion: { kind: 'drift', amp: 2, periodMs: 6000 } },
    { sprite: tortoiseClock, x: 38, y: 39 },
    { sprite: ring, x: 37, y: 43, motion: { kind: 'twinkle', periodMs: 600, min: 0.1 } },
  ],
};

const emblemSnail: PixelSprite = {
  id: 'bf14-emblem-snail',
  name: 'bf14-emblem-snail',
  tags: ['emblem', 'bf', 'lesson-14'],
  blurb: "Lesson 14's emblem: inertia caught as a snail, spiral shell and all.",
  rows: [
    '.............D..D',
    '....EEEEE....n..n',
    '..EEFFFFFEE..n..n',
    '.EFFfffffFFE.n..n',
    '.EFfFEEEfFFE.nmmn',
    'EFfFEFFFEfFFEnmmn',
    'EFfFEFEFEfFFEmmmn',
    'EFfFFEEFfFFFEmmmn',
    'EFFffffFFFFEmmmmn',
    '.EFFFFFFFFEEmmmmn',
    '..EEEEEEEEEmmmmmn',
    'nmmmmmmmmmmmmmmn.',
    '.nnnnnnnnnnnnnn..',
  ],
};

export const bf14Finish: SceneArt = bfKeepsake(
  'bf14-finish',
  'A corked glass jar with a paper tag, holding a little snail with a pink spiral shell, with bubbles rising inside and sparkles around it.',
  emblemSnail,
);

export const art: LessonArtSet = { opener: bf14Opener, backdrop: bfBackdrop, finish: bf14Finish };
