/**
 * Global Economics lesson 11: labor markets and employment, at the hiring hall on the quay by day.
 *
 * The port's brick hiring hall, a briefcase on its sign and a clock in its gable, its door open. Two
 * workers in hard hats wait at the door while a job board beside it holds the openings, a card going
 * up and coming down as jobs are posted and filled: labor supply at the door, labor demand on the
 * board, and the wage settles where they meet. The student stands out front holding up a briefcase.
 * Only small layers move: the clock's hands, the job card, the briefcase's glint, a ship at the quay,
 * two clouds, two gulls and glints on the water.
 *
 * The keepsake's emblem is the briefcase.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, GE_STUDENT_HOLD, geCompose, geGull, geLater, geShipFar, geStudent, geTint } from './ge-kit';
import { geCloud, geCloudSmall, geGlintDay, geGroundQuay, geShadow, geStudentBack } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** The hiring hall, 36x36: a brick gable with a clock face, a sign with a briefcase on it, an open door, two windows. */
const hall: PixelSprite = {
  id: 'ge11-opener-hall',
  name: 'hiring hall',
  tags: ['ge11', 'prop'],
  blurb: 'A red brick hall with a clock in its gable, a briefcase sign over an open door and two windows.',
  palette: GE_PALETTE,
  rows: [
    '.................DD.................',
    '...............DDXDDD...............',
    '..............DXXrrDDD..............',
    '............DDXrDDDrrDDD............',
    '...........DXX1DzzzD11DDD...........',
    '.........DDXrrDzzzzzDrr1DDD.........',
    '.......DDXX1rrDzzzzzDrr1rDDDD.......',
    '......DXX11111DzzzzzD111111DDD......',
    '....DDXr1rrrrr1DzzzD1rrrrr1rrDDD....',
    '...DXXrr1rrrrr1rDDDr1rrrrr1rrrDDD...',
    '.DDX1111111111111111111111111111DDD.',
    'sXXrr1rrrrr1rrrrr1rrrrr1rrrrr1rrrDDD',
    'srrrr1rrrrOOOOOOOOOOOOOOOOrrr1rrrrrD',
    's111111111OAAAAAOOOAAAAAAO1111111111',
    'sr1rrrrr1rOAAAAAOAOAAAAAAO1rrrrr1rrr',
    'sr1rrrrr1rOAAAOOOOOOOAAAAO1rrrrr1rrr',
    's111111111OAAAOgGGGgOAAAAO1111111111',
    'srrrr1rrrrOAAAOOOyOOOAAAAOrrr1rrrrr1',
    'srrrr1rrrrOAAAOgggggOAAAAOrrr1rrrrr1',
    's111111111OAAAOOOOOOOAAAAO1111111111',
    'sr1rrrrr1rOOOOOOOOOOOOOOOO1rrrrr1rrr',
    'sr1rrrrr1rrrrr1rrrrr1rrrrr1rrrrr1rrr',
    's11111111111111111111111111111111111',
    'srrrr1rrrrrDDDDDDDDDDDDDDrrrr1rrrrr1',
    'srDDDDDDrrrDKKKKKKKKKkKKDrrrDDDDDDr1',
    's1DzBbbD111DKKKKKKKKKkKKD111DzBbbD11',
    'srDBBbbD1rrDKKKKKKKKKkKKDr1rDBBbbDrr',
    'srDDDDDD1rrDKKKKKKKKKkKKDr1rDDDDDDrr',
    's1DbbhhD111DKKKKKKKKKkKKD111DbbhhD11',
    'srDbbhhDrrrDKKKKKKKKKkKKDrrrDbbhhDr1',
    'srDDDDDDrrrDKKKKKKKKKkKKDrrrDDDDDDr1',
    's1111111111DKKKKKKKKKkKKD11111111111',
    'sr1rrrrr1rrDKKKKKKKKKkKKDr1rrrrr1rrr',
    'sr1rrrrr1rrDKKKKKKKKKkKKDr1rrrrr1rrr',
    's1111111111DKKKKKKKKKkKKD11111111111',
    'DDDDDDDDDDDDuuuuuuuuukuuDDDDDDDDDDDD',
  ],
};

/** The job board, 13x15: cards pinned on cork in a wooden frame, the top right slot left for `card`. */
const board: PixelSprite = {
  id: 'ge11-opener-board',
  name: 'job board',
  tags: ['ge11', 'prop'],
  blurb: 'A wooden board on legs with job cards pinned to its cork.',
  palette: GE_PALETTE,
  rows: [
    'ooooooooooooo',
    'oSSSSSSSSSSSl',
    'oSzRzSzNzSSSl',
    'oSzzzSzzzSSSl',
    'oSzDzSzDzSSSl',
    'oSSSSSSSSSSSl',
    'oSzNzSzBzSzGz',
    'oSzzzSzzzSzzz',
    'oSzDzSzDzSzDz',
    'oSSSSSSSSSSSl',
    'ollllllllllll',
    '..l.......l..',
    '..l.......l..',
    '..l.......l..',
    '.uuu.....uuu.',
  ],
};

/** The clock's hands, 5x5: the minute hand goes round while the hour hand stays at half past seven. */
const hands: PixelSprite = {
  id: 'ge11-opener-hands',
  name: 'clock hands',
  tags: ['ge11', 'animated'],
  blurb: 'Clock hands, the minute hand going round.',
  palette: GE_PALETTE,
  rows: [
    '..K..',
    '..K..',
    '..K..',
    '.K...',
    '.....',
  ],
  frames: [
    [
      '..K..',
      '..K..',
      '..K..',
      '.K...',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..KKK',
      '.K...',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..K..',
      '.KK..',
      '..K..',
    ],
    [
      '.....',
      '.....',
      'KKK..',
      '.K...',
      '.....',
    ],
  ],
  frameMs: 1000,
};

/** One job card, 3x3: pinned up, taken down, and a new one pinned up in its place. */
const card: PixelSprite = {
  id: 'ge11-opener-card',
  name: 'job card',
  tags: ['ge11', 'animated'],
  blurb: 'A paper job card pinned up, taken down, and replaced.',
  palette: GE_PALETTE,
  rows: [
    'zRz',
    'zzz',
    'zDz',
  ],
  frames: [
    [
      'zRz',
      'zzz',
      'zDz',
    ],
    [
      'zRz',
      'zzz',
      'zDz',
    ],
    [
      '...',
      '...',
      '...',
    ],
    [
      'zNz',
      'zzz',
      'zDz',
    ],
    [
      'zNz',
      'zzz',
      'zDz',
    ],
    [
      '...',
      '...',
      '...',
    ],
  ],
  frameMs: 800,
};

/** A briefcase, 5x5, held up in the student's hand, its clasp glinting now and then. */
const briefcase: PixelSprite = {
  id: 'ge11-opener-briefcase',
  name: 'briefcase',
  tags: ['ge11', 'animated'],
  blurb: 'A tan leather briefcase with a gold clasp.',
  palette: GE_PALETTE,
  rows: [
    '.OOO.',
    'OOOOO',
    'OMCCO',
    'OCGUO',
    'OOOOO',
  ],
  frames: [
    [
      '.OOO.',
      'OOOOO',
      'OMCCO',
      'OCGUO',
      'OOOOO',
    ],
    [
      '.OOO.',
      'OOOOO',
      'OMCCO',
      'OCGUO',
      'OOOOO',
    ],
    [
      '.OOO.',
      'OOOOO',
      'OzCCO',
      'OCyUO',
      'OOOOO',
    ],
  ],
  frameMs: 500,
};

/** Two more people looking for work, seen from behind in hard hats: gold with a red jacket, orange with a blue one. */
const workerA = geTint(geStudentBack, 'ge11-opener-worker-a', { E: 'O', q: 'y', P: 'G', p: 'g', Q: 'y', J: '1', N: 'R', n: 'r' });
const workerB = geTint(geStudentBack, 'ge11-opener-worker-b', { E: '1', q: '4', P: '3', p: '2', Q: '4', J: 'h', N: 'B', n: 'b' });

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const HALL = { x: 0, y: 12 };
/** The clock face's centre in the gable, where the hands turn. */
const CLOCK = { x: HALL.x + 15, y: HALL.y + 4 };
const BOARD = { x: 31, y: 41 };
/** The board's empty slot, where `card` goes up and comes down. */
const SLOT = { x: BOARD.x + 10, y: BOARD.y + 2 };
const WORKERS = [{ x: 3, y: 33 }, { x: 15, y: 33 }] as const;
/** Where the student stands. The briefcase and the shadow are placed from it. */
const STUDENT = { x: 44, y: 33 };

const dayShadow = geTint(geShadow, 'ge11-opener-shadow', { Z: 'D' });

const base = geCompose('ge11-opener-base', geGroundQuay, [
  { sprite: hall, x: HALL.x, y: HALL.y },
  { sprite: board, x: BOARD.x, y: BOARD.y },
  ...[...WORKERS, STUDENT].map((p) => ({ sprite: dayShadow, x: p.x + 7, y: p.y + 24 })),
  { sprite: workerA, x: WORKERS[0].x, y: WORKERS[0].y },
  { sprite: workerB, x: WORKERS[1].x, y: WORKERS[1].y },
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

const gullLater = geLater(geGull, 'ge11-opener-gull-later', 1, 520);

export const ge11Opener: SceneArt = {
  id: 'ge11-opener',
  label: 'On a sunny quay, two workers in hard hats wait at the open door of a brick hiring hall with a clock and a briefcase sign, a job board stands beside it, and a student holds up a briefcase.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: hands, x: CLOCK.x, y: CLOCK.y },
    { sprite: card, x: SLOT.x, y: SLOT.y },
    { sprite: briefcase, x: STUDENT.x + GE_STUDENT_HOLD.x, y: STUDENT.y + GE_STUDENT_HOLD.y },
    { sprite: geShipFar, x: 58, y: 30, motion: { kind: 'bob', amp: 1, periodMs: 3600 } },
    { sprite: geCloud, x: 42, y: 3, motion: { kind: 'drift', amp: 4, periodMs: 12000 } },
    { sprite: geCloudSmall, x: 64, y: 11, motion: { kind: 'drift', amp: 3, periodMs: 9500, phase: 0.5 } },
    { sprite: geGull, x: 38, y: 15, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 70, y: 21, motion: { kind: 'drift', amp: 2, periodMs: 8400, phase: 0.4 } },
    { sprite: geGlintDay, x: 62, y: 39 },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** A job: a tan leather briefcase, its gold clasp catching the light. */
const emblemCase: PixelSprite = {
  id: 'ge11-emblem-case',
  name: 'emblem briefcase',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A tan leather briefcase with a gold clasp, a glint passing across it.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '................',
    '.....OOOOOO.....',
    '.....O....O.....',
    '..OOOOOOOOOOOO..',
    '..OMMMMMMMMMMO..',
    '..OMCCCCCCCCUO..',
    '..OMCCCCCCCCUO..',
    '..OOOOOGGOOOOO..',
    '..OCCCCyGCCCUO..',
    '..OCCCCOOCCCUO..',
    '..OCCCCCCCCCUO..',
    '..OCCCCCCCCCUO..',
    '..OUUUUUUUUUUO..',
    '..OOOOOOOOOOOO..',
    '................',
  ],
  frames: [
    [
      '................',
      '................',
      '.....OOOOOO.....',
      '.....O....O.....',
      '..OOOOOOOOOOOO..',
      '..OMMMMMMMMMMO..',
      '..OMCCCCCCCCUO..',
      '..OMCCCCCCCCUO..',
      '..OOOOOGGOOOOO..',
      '..OCCCCyGCCCUO..',
      '..OCCCCOOCCCUO..',
      '..OCCCCCCCCCUO..',
      '..OCCCCCCCCCUO..',
      '..OUUUUUUUUUUO..',
      '..OOOOOOOOOOOO..',
      '................',
    ],
    [
      '................',
      '................',
      '.....OOOOOO.....',
      '.....O....O.....',
      '..OOOOOOOOOOOO..',
      '..OMzMMMMMMMMO..',
      '..OzCCCCCCCCUO..',
      '..OMCCCCCCCCUO..',
      '..OOOOOGGOOOOO..',
      '..OCCCCyGCCCUO..',
      '..OCCCCOOCCCUO..',
      '..OCCCCCCCCCUO..',
      '..OCCCCCCCCCUO..',
      '..OUUUUUUUUUUO..',
      '..OOOOOOOOOOOO..',
      '................',
    ],
    [
      '................',
      '................',
      '.....OOOOOO.....',
      '.....O....O.....',
      '..OOOOOOOOOOOO..',
      '..OMMMMMMMMMMO..',
      '..OMCCCCCCCCUO..',
      '..OMCCCCCCCCUO..',
      '..OOOOOyzOOOOO..',
      '..OCCCCzyCCCUO..',
      '..OCCCCOOCCCUO..',
      '..OCCCCCCCCCUO..',
      '..OCCCCCCCCCUO..',
      '..OUUUUUUUUUUO..',
      '..OOOOOOOOOOOO..',
      '................',
    ],
    [
      '................',
      '................',
      '.....OOOOOO.....',
      '.....O....O.....',
      '..OOOOOOOOOOOO..',
      '..OMMMMMMMMMMO..',
      '..OMCCCCCCCCUO..',
      '..OMCCCCCCCCUO..',
      '..OOOOOGGOOOOO..',
      '..OCCCCyGCCCUO..',
      '..OCCCCOOCCCUO..',
      '..OCCCCCCCCCUO..',
      '..OCCCCCCCCCUO..',
      '..OUUUUUUUUUUO..',
      '..OOOOOOOOOOOO..',
      '................',
    ],
  ],
  frameMs: 600,
};

export const ge11Finish: SceneArt = geKeepsake(
  'ge11-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a tan leather briefcase with a gold clasp, with small sparkles around it.',
  emblemCase,
);

export const art: LessonArtSet = { opener: ge11Opener, backdrop: geBackdrop, finish: ge11Finish };
