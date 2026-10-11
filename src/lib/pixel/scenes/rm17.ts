/**
 * Risk Management lesson 17 opener, Climate Risk & ESG Risk Factors: the only dawn in the course, and
 * a red one. Down at the foot of the lighthouse the sea has come over the steps; the keeper stands in
 * it and points at the tide gauge, whose red line is already under water. That is physical risk. Out
 * on the horizon is the other kind, transition risk: wind turbines turning beside a dark oil rig that
 * nobody will light again, a stranded asset. Moving: the turbine blades, gulls, the swell lapping the
 * flood, the sun on the water.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmGull, rmKeepsake, rmLater, rmSwell } from './rm-kit';
import { rmGlint, rmKeeperRaise, rmPlot, rmPortSwell } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { rmFill, rmTower } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The dawn: navy overhead through orchid, rose and ember to orange at the horizon, the sun half up. */
const sky: readonly [number, string][] = [[4, 'v'], [8, 'V'], [12, 'E'], [16, 'I'], [20, 'f'], [23, '2'], [26, '3'], [28, '4']];
const ground = rmFill(
  Array.from({ length: 60 }, (_, y) => (y < 28 ? (sky.find(([end]) => y < end) ?? sky[0])[1] : y === 28 ? '1' : y < 37 ? 'V' : 'v').repeat(80)),
  [
    [30, 52, 9, 'E'], [0, 14, 10, 'V'], [44, 60, 13, 'f'], [4, 22, 14, 'f'], [36, 56, 17, '2'], [0, 10, 18, 'f'],
    [24, 40, 21, '3'], [46, 56, 22, '2'],
    [12, 16, 23, '4'], [10, 18, 24, '4'], [9, 19, 25, '4'], [8, 20, 26, '4'], [8, 20, 27, '5'],
    [12, 16, 24, '5'], [11, 17, 25, '5'], [10, 18, 26, '5'],
    [11, 17, 30, '4'], [10, 18, 32, '3'], [12, 16, 34, '4'], [9, 19, 36, '2'], [11, 17, 38, '3'],
    [10, 18, 41, '2'], [12, 16, 44, '3'], [11, 15, 48, '2'],
    [26, 32, 31, 'u'], [30, 38, 35, 'u'], [22, 28, 39, 'u'], [2, 7, 43, 'u'], [20, 27, 47, 'u'],
    [4, 10, 52, 'u'], [24, 31, 56, 'u'],
  ],
);

/** A dark rig on the horizon, unlit: a stranded asset. 8x9. */
const rig: PixelSprite = {
  id: 'rm17-opener-rig',
  name: 'oil rig',
  tags: ['scene', 'rm17'],
  rows: [
    '...K....',
    '..KDK...',
    '..KDK...',
    '.K.D.K..',
    '.KKKKK..',
    'KKKKKKKK',
    'K.K..K.K',
    'K.K..K.K',
    'K.K..K.K',
  ],
};

/** A turbine's mast from its hub down to the sea, `h` pixels. */
const mast = (id: string, h: number): PixelSprite => ({
  id,
  name: 'turbine mast',
  tags: ['scene', 'rm17'],
  rows: [...Array.from({ length: h - 1 }, () => 'X'), 'D'],
});

/** One frame of a rotor: three blades at 120 degrees from the hub at (3, 3), turned `deg`. */
function rotorFrame(deg: number): string[] {
  const pts: RmPoint[] = [[3, 3, 'X']];
  for (const a of [deg, deg + 120, deg + 240]) {
    const r = (a * Math.PI) / 180;
    for (let k = 1; k <= 3; k++) pts.push([Math.round(3 + Math.cos(r) * k), Math.round(3 - Math.sin(r) * k), 'w']);
  }
  return rmPlot(7, 7, pts);
}

/** A rotor turning a twelfth of a turn a frame. Framed, 7x7. */
const rotor: PixelSprite = {
  id: 'rm17-opener-rotor',
  name: 'rotor',
  tags: ['scene', 'rm17'],
  rows: rotorFrame(90),
  frames: [rotorFrame(90), rotorFrame(60), rotorFrame(30), rotorFrame(0)],
  frameMs: 240,
};

/** The lighthouse door at the tower's foot, its sill under the flood. 7x10. */
const door: PixelSprite = {
  id: 'rm17-opener-door',
  name: 'door',
  tags: ['scene', 'rm17'],
  rows: [
    '.DDDDD.',
    'DkkkkkD',
    'DkkkkkD',
    'DkkkkkD',
    'DkkkGkD',
    'DkkkkkD',
    'DkkkkkD',
    'DkkkkkD',
    'DkkkkkD',
    'DDDDDDD',
  ],
};

/** The steps and rocks round the tower's foot. 36x8. */
const foot: PixelSprite = {
  id: 'rm17-opener-foot',
  name: 'steps and rocks',
  tags: ['scene', 'rm17'],
  rows: [
    '..........xxxxxxxxxxxxxxx...........',
    '..........XXXXXXXXXXXXXXX...........',
    '.....DDD.xxxxxxxxxxxxxxxxx..DDDD....',
    '...DDXXDDXXXXXXXXXXXXXXXXXDDXXXDD...',
    '..DXXXDDDDDDDDDDDDDDDDDDDDDDDDXXDD..',
    '.DDDDDKKKDDDKKDDDDKKKDDDDKKKDDDDDDD.',
    'DKKDDDDDKKKDDDDKKKDDDDDKKKDDDDKKKDDD',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};

/** The flood: the sea standing over the quay, a foam line where it meets the steps and the tower. 40x15. */
const flood: PixelSprite = {
  id: 'rm17-opener-flood',
  name: 'flood',
  tags: ['scene', 'rm17'],
  palette: RM_PALETTE,
  rows: rmFill(
    Array.from({ length: 15 }, (_, y) => (y === 0 ? 'U' : y < 5 ? 'V' : 'v').repeat(40)),
    [[3, 6, 0, 'w'], [15, 18, 0, 'w'], [29, 33, 0, 'w'], [8, 13, 3, 'u'], [24, 30, 6, 'u'], [2, 7, 10, 'u'], [18, 25, 12, 'u']],
  ),
};

/**
 * The tide gauge: a white staff marked every two rows. Above the flood it is bright; below it the
 * staff is drawn through the water, darker, and its red line is under. 3x44.
 */
const gauge: PixelSprite = {
  id: 'rm17-opener-gauge',
  name: 'tide gauge',
  tags: ['scene', 'rm17'],
  rows: [
    'DDD',
    ...Array.from({ length: 28 }, (_, y) => (y % 2 === 0 ? 'Kww' : 'www')),
    ...Array.from({ length: 15 }, (_, y) => (y === 2 || y === 3 ? 'rrr' : y % 2 === 0 ? 'DXX' : 'XXX')),
  ],
};

const base = rmCompose('rm17-opener-base', ground, [
  [rig, 0, 20],
  [mast('rm17-opener-mast-a', 11), 24, 18],
  [mast('rm17-opener-mast-b', 10), 30, 19],
  [mast('rm17-opener-mast-c', 9), 36, 20],
  [rmTower('rm17-opener-tower', 22, 46, 7), 58, 0],
  [door, 68, 36],
  [foot, 44, 42],
  [rmKeeperRaise, 46, 18],
  [flood, 40, 45],
  [gauge, 40, 16],
]);

export const rm17Opener: SceneArt = {
  id: 'rm17-opener',
  label: 'At a red dawn, floodwater covers the steps of a lighthouse as the keeper points at a tide gauge whose red line is already under water, while wind turbines turn on the horizon beside a dark, abandoned oil rig.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rotor, x: 21, y: 15 },
    { sprite: rmLater(rotor, 'rm17-opener-rotor-b', 1, 260), x: 27, y: 16 },
    { sprite: rmLater(rotor, 'rm17-opener-rotor-c', 2, 220), x: 33, y: 17 },
    { sprite: rmGull, x: 44, y: 5, motion: { kind: 'drift', amp: 3, periodMs: 6600 } },
    { sprite: rmLater(rmGull, 'rm17-opener-gull-later', 2, 240), x: 52, y: 10, motion: { kind: 'drift', amp: 2, periodMs: 5400, phase: 0.5 } },
    { sprite: rmGlint, x: 13, y: 33, motion: { kind: 'twinkle', periodMs: 2000, min: 0.2 } },
    { sprite: rmSwell, x: 2, y: 49, motion: { kind: 'drift', amp: 2, periodMs: 4200 } },
    { sprite: rmPortSwell, x: 44, y: 44, motion: { kind: 'drift', amp: 1, periodMs: 3000 } },
  ],
};

/** Lesson 17's emblem: a wind turbine standing in a high sea. 15x16. */
const emblemTurbine: PixelSprite = {
  id: 'rm17-emblem-turbine',
  name: 'wind turbine',
  tags: ['rm', 'emblem', 'lesson 17'],
  palette: RM_PALETTE,
  rows: [
    '.......w.......',
    '.......w.......',
    '.......w.......',
    '.......w.......',
    '.......W.......',
    '.....wwxww.....',
    '...ww..x..ww...',
    '..w....x....w..',
    '.......x.......',
    '.......x.......',
    '......xXx......',
    '......xXx......',
    '.UUuuUxXxUuuUU.',
    '.uBBwUUBUUwBBu.',
    '..uUUuuuuuUUu..',
    '...uuuuuuuuu...',
  ],
};

export const rm17Finish: SceneArt = rmKeepsake(
  'rm17-finish',
  'A red and white life ring hanging from a rope, with a wind turbine at its center standing in a high sea.',
  emblemTurbine,
);

export const art: LessonArtSet = { opener: rm17Opener, backdrop: rmBackdrop, finish: rm17Finish };
