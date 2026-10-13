/**
 * Personal Finance lesson 2, Budgeting Basics: payday split three ways.
 *
 * Close in on the kitchen table, the 50/30/20 rule laid out on it: three big envelopes lettered
 * NEEDS, WANTS and SAVE, their stacks of bills five, three and two high, each label the colour of its
 * slice in the pie chart pinned on the wall above them. Only the figure's hand is in the picture,
 * reaching down from above the frame to pay itself first, a bill let go into the SAVE envelope.
 * Moving: the bill, a glint on the SAVE label, a sparkle by the pie's gold slice, the pin's gleam.
 */
import type { PixelSprite } from '../types';
import { pfCompose, pfSparkle } from './pf-kit';
import { pfText } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** The cast's skin, the colours pf-kit.ts gives pfSaver (the hand needs only these three). */
const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
};

/**
 * The close-up's ground: the kitchen wall, then the table seen near, its back edge on row 46, the
 * top in two boards to row 51, the lit lip and the front cropped below.
 */
function tableCloseUp(): string[] {
  return Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y < 46) return 'k';
      if (y === 46) return 'O';
      if (y <= 48) return (x * 7 + y) % 19 === 0 ? 'G' : 'g';
      if (y === 49) return 'O';
      if (y <= 51) return (x * 5 + y) % 23 === 0 ? 'g' : 'G';
      if (y === 52) return 'y';
      if (y === 53) return 'O';
      return y === 57 ? 'O' : 'g';
    }).join(''),
  );
}

/**
 * The pie chart on the wall, on a pinned sheet: needs half (orchid, the left), wants 30 (pink, from
 * twelve o'clock round to 108 degrees), savings 20 (gold, on to six o'clock), each slice edged in its
 * own deep tone. The pin's head is at column 10, row 0.
 */
const PIE = { cx: 10, cy: 11, r: 8.4 };
const SLICE = { wants: ['F', 'f'], savings: ['G', 'g'], needs: ['P', 'E'] } as const;
function sliceAt(x: number, y: number): keyof typeof SLICE | null {
  const dx = x - PIE.cx;
  const dy = y - PIE.cy;
  if (dx * dx + dy * dy > PIE.r * PIE.r) return null;
  const turn = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  if (turn < 108) return 'wants';
  if (turn < 180) return 'savings';
  return 'needs';
}
function piePoster(): PixelSprite {
  const W = 21;
  const H = 23;
  return {
    id: 'pf2-pie-poster',
    name: 'pie poster',
    tags: ['scene', 'pf'],
    rows: Array.from({ length: H }, (_, y) =>
      Array.from({ length: W }, (_, x) => {
        if (y === 0) return x === 10 ? 'R' : '.';
        if (y === 1) return x === 10 ? 'r' : 'x';
        if (y === H - 1) return x === 0 ? 'x' : 'X';
        if (x === 0) return 'x';
        if (x === W - 1) return 'X';
        const slice = sliceAt(x, y);
        if (!slice) return 'w';
        const [body, edge] = SLICE[slice];
        const rim = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([i, j]) => sliceAt(x + i, y + j) !== slice);
        return rim ? edge : body;
      }).join(''),
    ),
  };
}

/** The pin's gleam, for a twinkle over its head. */
const pinGleam: PixelSprite = {
  id: 'pf2-pin-gleam',
  name: 'pin gleam',
  tags: ['scene', 'pf'],
  rows: ['.s.', 's.s'],
};

/**
 * A big budget envelope, 23 wide: `bills` bills standing out of it (each three rows, a lit edge, its
 * face and a shadow), the flap's V across its front, and a label band (rows 6 to 12 of the envelope)
 * in its slice's deep tone, the word stamped on it after.
 */
const ENV_W = 23;
const BILL = ['nNNNNNNNNNNNNNNNNNn', 'nNmNNNNNmmmNNNNNmNn', 'nnnnnnnnnnnnnnnnnnn'];
function envelope(id: string, bills: number, band: string): PixelSprite {
  const flap = (r: number) =>
    'D' +
    Array.from({ length: ENV_W - 2 }, (_, i) => {
      const d = Math.abs(i + 1 - 11);
      return d === 10 - 2 * r || d === 9 - 2 * r ? 'x' : 'w';
    }).join('') +
    'D';
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: [
      ...Array.from({ length: bills * 3 }, (_, i) => `..${BILL[i % 3]}..`),
      ...Array.from({ length: 6 }, (_, r) => flap(r)),
      ...Array.from({ length: 7 }, () => `D${band.repeat(ENV_W - 2)}D`),
      'D'.repeat(ENV_W),
    ],
  };
}

/** Each envelope's shadow on the table, cast to the right by the morning light. */
const envShadow: PixelSprite = {
  id: 'pf2-envelope-shadow',
  name: 'envelope shadow',
  tags: ['scene', 'pf'],
  rows: ['.' + 'O'.repeat(ENV_W)],
};

/**
 * The figure's arm, reaching down from above the frame: the blue sleeve, a white cuff, and the hand
 * seen from the back, knuckles down, pinching a bill whose top sits under the fingertips (columns 2
 * to 8, row 21). Only the hand and sleeve are in view.
 */
const arm: PixelSprite = {
  id: 'pf2-arm',
  name: 'arm',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bBBBBBBBb.',
    '.bwwwwwwwb.',
    '.bxxxxxxxb.',
    '..UMMCCCU..',
    '.UMMCCCCCU.',
    'UMCCCCCCCCU',
    'UCCCCCCCCCU',
    'UCUCCUCCUCU',
    '.UCCUCCUCU.',
    '..UUUUUUU..',
  ],
};

/** The bill let go over the SAVE envelope: held, falling onto its stack (the sprite's foot), slipping in, a glint, a new bill. */
const B0 = ['nNNNNNNNNNn', 'nNmNNmNNmNn', 'nnnnnnnnnnn'];
const NONE = '...........';
const billAt = (row: number) => Array.from({ length: 10 }, (_, i) => (i >= row && i < row + 3 ? B0[i - row] : NONE));
const billDrop: PixelSprite = {
  id: 'pf2-bill-drop',
  name: 'bill drop',
  tags: ['scene', 'pf'],
  rows: billAt(0),
  frames: [
    billAt(0),
    billAt(0),
    billAt(0),
    billAt(2),
    billAt(4),
    billAt(6),
    billAt(7),
    [...Array.from({ length: 8 }, () => NONE), B0[0], B0[1]],
    [...Array.from({ length: 9 }, () => NONE), B0[0]],
    [...Array.from({ length: 7 }, () => NONE), '.....y.....', '....yWy....', '.....y.....'],
    [...Array.from({ length: 8 }, () => NONE), '.....w.....', NONE],
    Array.from({ length: 10 }, () => NONE),
  ],
  frameMs: 170,
};

/** A glint on the SAVE envelope's gold label. */
const glint: PixelSprite = {
  id: 'pf2-glint',
  name: 'glint',
  tags: ['scene', 'pf'],
  rows: ['.y.', 'yWy', '.y.'],
};

/** Lesson 2's emblem: the 50/30/20 pie, each slice edged in its own deep tone. */
const emblemBudget: PixelSprite = {
  id: 'pf2-emblem-budget',
  name: 'pf2-emblem-budget',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '...Eff...',
    '.EEPFFff.',
    '.EPPFFFf.',
    'EPPPFFFFf',
    'EPPPPFFFf',
    'EPPPPGGGf',
    '.EPPPGGg.',
    '.EEPPGgg.',
    '...EEg...',
  ],
};

/** Where the three envelopes stand: their tops, so each one's foot is on row 50. */
const NEEDS = { x: 2, y: 22 };
const WANTS = { x: 28, y: 28 };
const SAVE = { x: 54, y: 31 };

// Order is depth: the poster on the wall, the envelopes' shadows, the envelopes on the table and their
// words, then the arm reaching down over everything.
const base = pfCompose('pf2-opener-base', 80, 60, tableCloseUp(), [
  [piePoster(), 29, 1],
  [envShadow, NEEDS.x, 51],
  [envShadow, WANTS.x, 51],
  [envShadow, SAVE.x, 51],
  [envelope('pf2-envelope-needs', 5, 'P'), NEEDS.x, NEEDS.y],
  [envelope('pf2-envelope-wants', 3, 'F'), WANTS.x, WANTS.y],
  [envelope('pf2-envelope-save', 2, 'G'), SAVE.x, SAVE.y],
  [pfText('pf2-needs', 'NEEDS', 'K'), NEEDS.x + 2, NEEDS.y + 15 + 7],
  [pfText('pf2-wants', 'WANTS', 'K'), WANTS.x + 2, WANTS.y + 9 + 7],
  [pfText('pf2-save', 'SAVE', 'K'), SAVE.x + 4, SAVE.y + 6 + 7],
  [arm, 59, 0],
]);

export const pf2Opener: SceneArt = {
  id: 'pf2-opener',
  label: 'Close up on a kitchen table, three envelopes marked NEEDS, WANTS and SAVE hold stacks of five, three and two bills under a pie chart split fifty, thirty and twenty, and a hand reaches down to drop one more bill into SAVE.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The bill hangs from the fingertips (arm at 59,0; their foot at columns 2 to 8, row 20) and falls
    // onto the top of the SAVE stack (envelope at 54,31; its stack's top on row 31).
    { sprite: billDrop, x: 59, y: 21 },
    { sprite: glint, x: 71, y: 43, motion: { kind: 'twinkle', periodMs: 1900, min: 0.3 } },
    { sprite: pinGleam, x: 38, y: 0, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    // A glint turns by the pie's gold slice, the share that is paid first.
    { sprite: pfSparkle, x: 47, y: 15, motion: { kind: 'twinkle', periodMs: 2300, min: 0.35, phase: 0.4 } },
  ],
};

export const pf2Finish = pfKeepsake(
  'pf2-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a pie chart split into needs, wants and savings, with small sparkles around it.',
  emblemBudget,
);

export const art: LessonArtSet = { opener: pf2Opener, backdrop: pfBackdrop, finish: pf2Finish };
