/**
 * Corporate Finance lesson 7, Mergers & Acquisitions: two companies, one handshake, one company.
 *
 * Opener: two doors at either side of the hall, ours in walnut under the orchid diamond, theirs
 * painted blue under the blue ring. Between them our CFO and the other company's chief shake on
 * the deal, and on the board above them the two logos slide together and lock into one. The two
 * figures and the board are the centre of the picture; the doors frame it. Only small layers
 * move: the handshake, the merging logos, both transoms, two glints of synergy over the hands.
 *
 * Keepsake: a handshake, an orchid sleeve and a blue one.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfDoor, cfHall, cfPlaque, cfShadowShort } from './cf-kit';
import { cfCfoReach, cfExec, cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** The other company's door: the kit door painted in the glass blues. */
const doorBlue = cfRecolor(cfDoor, 'cf7-door-blue', { A: 'C', a: 'c' }, 'A panelled blue door with a brass knob.');

/** Our logo, an orchid diamond. */
const logoOurs: readonly string[] = [
  '..P..',
  '.PqP.',
  'PqPPp',
  '.PPp.',
  '..p..',
];

/** Their logo, a blue ring. */
const logoTheirs: readonly string[] = [
  '.BBB.',
  'BbbbB',
  'Bb.bB',
  'BbbbB',
  '.BBB.',
];

/** The two made one: the diamond set inside the ring. */
const logoMerged: readonly string[] = [
  '..BBB..',
  '.B...B.',
  'B..P..B',
  'B.PqP.B',
  'B..p..B',
  '.B...B.',
  '..BBB..',
];

const sparkle: readonly string[] = [
  '.y.',
  'ywy',
  '.y.',
];

const asSprite = (id: string, rows: readonly string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'cf7'], rows: [...rows] });

const MERGE = { w: 23, h: 7 } as const;

/** One frame of the board: `parts` stamped onto the empty face. Computed so each frame is the last nudged along. */
function mergeFrame(parts: readonly (readonly [readonly string[], number, number])[]): string[] {
  const grid = Array.from({ length: MERGE.h }, () => Array.from({ length: MERGE.w }, () => '.'));
  for (const [rows, x, y] of parts) {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const line = grid[y + j];
        if (line && ch !== '.' && x + i >= 0 && x + i < MERGE.w) line[x + i] = ch;
      });
    });
  }
  return grid.map((row) => row.join(''));
}

const merged = mergeFrame([[logoMerged, 8, 0]]);

/** The logos slide in from the ends, lock, flash and hold. Its still is the merged logo. */
const merge: PixelSprite = {
  id: 'cf7-opener-merge',
  name: 'cf7-opener-merge',
  tags: ['scene', 'cf7'],
  blurb: 'An orchid diamond and a blue ring sliding together into one logo.',
  rows: merged,
  frames: [
    mergeFrame([[logoOurs, 1, 1], [logoTheirs, 17, 1]]),
    mergeFrame([[logoOurs, 4, 1], [logoTheirs, 14, 1]]),
    mergeFrame([[logoOurs, 7, 1], [logoTheirs, 11, 1]]),
    mergeFrame([[logoMerged, 8, 0], [sparkle, 3, 2], [sparkle, 17, 2]]),
    mergeFrame([[logoMerged, 8, 0], [sparkle, 1, 0], [sparkle, 19, 4]]),
    merged,
    merged,
  ],
  frameMs: 600,
};

/** The deal board over the hall: a wide gold frame with a dark face for the merge. */
const board: PixelSprite = {
  id: 'cf7-board',
  name: 'cf7-board',
  tags: ['scene', 'cf7'],
  rows: [
    `.${'O'.repeat(25)}.`,
    `O${'g'.repeat(25)}O`,
    ...Array.from({ length: 7 }, () => `Og${'K'.repeat(23)}aO`),
    `O${'a'.repeat(25)}O`,
    `.${'O'.repeat(25)}.`,
  ],
};

/** The pixels under the two hands, so the hands can be a moving layer of their own. */
const handGap: PixelSprite = {
  id: 'cf7-hand-gap',
  name: 'cf7-hand-gap',
  tags: ['scene', 'cf7'],
  palette: CF_PALETTE,
  rows: [
    'ZZ',
    'kk',
  ],
};

const base = cfCompose('cf7-opener-base', cfHall, [
  [cfPlaque, 4, 3],
  [asSprite('cf7-logo-ours', logoOurs), 7, 6],
  [cfPlaque, 64, 3],
  [asSprite('cf7-logo-theirs', logoTheirs), 67, 6],
  [board, 27, 4],
  [cfDoor, 3, 15],
  [doorBlue, 63, 15],
  [cfShadowShort, 26, 56],
  [cfShadowShort, 47, 56],
  [cfCfoReach, 23, 30],
  [cfExec, 39, 30],
  [handGap, 39, 43],
], 'The still hall: our door and theirs under their logos, the deal board, the two chiefs.');

/** The clasped hands pumping once: up, level, down, level. Its still is level. */
const clasp: PixelSprite = {
  id: 'cf7-opener-clasp',
  name: 'cf7-opener-clasp',
  tags: ['scene', 'cf7'],
  blurb: 'Two hands clasped, shaking.',
  palette: CF_PALETTE,
  rows: ['..', 'SS', 'SM', '..'],
  frames: [
    ['SS', 'SM', '..', '..'],
    ['..', 'SS', 'SM', '..'],
    ['..', '..', 'SS', 'SM'],
    ['..', 'SS', 'SM', '..'],
  ],
  frameMs: 240,
};

const glowOurs: PixelSprite = { id: 'cf7-opener-glow-ours', name: 'cf7-opener-glow-ours', tags: ['scene', 'cf7'], rows: ['PPPPPPPP', 'PqqqqqqP'] };
const glowTheirs: PixelSprite = { id: 'cf7-opener-glow-theirs', name: 'cf7-opener-glow-theirs', tags: ['scene', 'cf7'], rows: ['BBBBBBBB', 'BwwwwwwB'] };

export const cf7Opener: SceneArt = {
  id: 'cf7-opener',
  label: 'Two company chiefs shake hands between their two doors while the two logos on the board above them slide together and merge into one.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: merge, x: 29, y: 6 },
    { sprite: glowOurs, x: 6, y: 18, motion: { kind: 'twinkle', periodMs: 2800, min: 0.35 } },
    { sprite: glowTheirs, x: 66, y: 18, motion: { kind: 'twinkle', periodMs: 2800, phase: 0.5, min: 0.35 } },
    { sprite: clasp, x: 39, y: 42 },
    { sprite: asSprite('cf7-opener-synergy-a', sparkle), x: 34, y: 37, motion: { kind: 'twinkle', periodMs: 1500, min: 0.1 } },
    { sprite: asSprite('cf7-opener-synergy-b', sparkle), x: 43, y: 36, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.5, min: 0.1 } },
  ],
};

/** Lesson 7's emblem: a handshake, our orchid sleeve meeting their blue one. */
const emblemHandshake: PixelSprite = {
  id: 'cf7-emblem-handshake',
  name: 'cf7-emblem-handshake',
  tags: [],
  blurb: 'Two hands clasped, an orchid sleeve and a blue one.',
  palette: CF_PALETTE,
  rows: [
    '................',
    '.......y........',
    '......ywy.......',
    '.......y........',
    'EE............DD',
    'PPE..........DBb',
    'PPPw.SSSSS..wBbb',
    'PPPwSSSSMSSSwBbb',
    'PPPwSSMSSMSSwBbb',
    'ppPwSSSMSSMSwBbb',
    'pppwSSSSSSSSwbbb',
    'pppw.MSSSSM.wbbb',
    'ppE...MMMM...Dbb',
    'EE............DD',
    '................',
    '................',
  ],
};

export const cf7Finish = cfKeepsake(
  'cf7-finish',
  'A crystal award on a gold stand with two hands shaking on a deal inside, and small sparkles around it.',
  emblemHandshake,
);

export const art: LessonArtSet = { opener: cf7Opener, backdrop: cfBackdrop, finish: cf7Finish };
