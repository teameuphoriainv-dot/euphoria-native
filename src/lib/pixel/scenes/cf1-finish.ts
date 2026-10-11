/**
 * Corporate Finance keepsake: a crystal deal award on a gold stand, the pathway's one shape, with the
 * lesson's emblem set in the glass. Deal teams get a lucite block like this when a deal closes; here
 * a lesson is the deal. Drawn 2026-10-10 for the lesson-complete screen (3pt/px).
 *
 * Base = the block and its stand. The emblem is a still layer at EMBLEM_AT, so lessons 2 to 25 call
 * cfKeepsake with their own 16x16 kit emblem and keep everything else. Over the emblem a glint
 * sweeps the glass and pauses; crystal glints twinkle around it and motes of light rise.
 */
import type { PixelSprite } from '../types';
import { CF_PALETTE, cfEmblemSignpost, cfLater } from './cf-kit';
import type { SceneArt, SceneLayer } from './types';

const block: PixelSprite = {
  id: 'cf-finish-block',
  name: 'cf-finish-block',
  tags: [],
  palette: CF_PALETTE,
  rows: [
    '................................................',
    '................................................',
    '..............BBBBBBBBBBBBBBBBBBBB..............',
    '.............BwwwwwwwwwwwwwwwwwwwwB.............',
    '............BwCCCCCCCCCCCCCCCCCCCCwb............',
    '............BwccccccCCccccccccccccCb............',
    '............BwcccccCCcccccccccccccCb............',
    '............BwccccCCccccccccccccccCb............',
    '............BwcccCCcccccccccccccccCb............',
    '............BwccCCccccccccccccccccCb............',
    '............BwcCCcccccccccccccccccCb............',
    '............BwCCccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwccccccccccccccccccccCb............',
    '............BwCCCCCCCCCCCCCCCCCCCCCb............',
    '............Bbbbbbbbbbbbbbbbbbbbbbbb............',
    '.............bbbbbbbbbbbbbbbbbbbbbb.............',
    '.............OOOOOOOOOOOOOOOOOOOOOO.............',
    '............OyyyyyyyyyyyyyyyyyyyyyyO............',
    '...........OOGGGGGGGGGGGGGGGGGGGGGGOO...........',
    '..........OyyyyyyyyyyyyyyyyyyyyyyyyyyO..........',
    '..........OGGGGGOOOOOOOOOOOOOOOOGGGGgO..........',
    '..........OGGGGGOKgggKggggKgggKOGGGGgO..........',
    '..........OGGGGGOKKKKKKKKKKKKKKOGGGGgO..........',
    '..........OgGGGGOOOOOOOOOOOOOOOOGGGggO..........',
    '..........OggggggggggggggggggggggggggO..........',
    '.........OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO.........',
    '............ZZZZZZZZZZZZZZZZZZZZZZZZ............',
    '................................................',
  ],
};

/**
 * One bright band crossing the glass, then a rest. Computed, not drawn: it is a straight diagonal,
 * and eighteen typed frames of mostly empty glass is how a row gets miscounted. Its still is clear
 * glass, so Reduce Motion shows no glint.
 */
const GLASS = { x: 14, y: 5, size: 20 } as const;

function glintAt(band: number): string[] {
  return Array.from({ length: GLASS.size }, (_, y) =>
    Array.from({ length: GLASS.size }, (_, x) => {
      const d = x + y - band;
      if (d === 0 || d === 1) return 'w';
      if (d === -1 || d === 2) return 'B';
      return '.';
    }).join(''),
  );
}

const clear = glintAt(-9);
const glint: PixelSprite = {
  id: 'cf-finish-glint',
  name: 'cf-finish-glint',
  tags: [],
  rows: clear,
  frames: [...[1, 8, 15, 22, 29, 36].map(glintAt), ...Array.from({ length: 12 }, () => clear)],
  frameMs: 130,
};

const sparkX: PixelSprite = {
  id: 'cf-finish-spark-x',
  name: 'cf-finish-spark-x',
  tags: [],
  rows: [
    'B...B',
    '.w.w.',
    '..W..',
    '.w.w.',
    'B...B',
  ],
  frames: [
    [
      'B...B',
      '.w.w.',
      '..W..',
      '.w.w.',
      'B...B',
    ],
    [
      '.....',
      '.B.B.',
      '..w..',
      '.B.B.',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..B..',
      '.....',
      '.....',
    ],
    [
      '.....',
      '.B.B.',
      '..w..',
      '.B.B.',
      '.....',
    ],
  ],
  frameMs: 360,
};

const sparkSmall: PixelSprite = {
  id: 'cf-finish-spark-small',
  name: 'cf-finish-spark-small',
  tags: [],
  rows: [
    'B.B',
    '.W.',
    'B.B',
  ],
  frames: [
    [
      'B.B',
      '.W.',
      'B.B',
    ],
    [
      '...',
      '.w.',
      '...',
    ],
  ],
  frameMs: 540,
};

const mote: PixelSprite = {
  id: 'cf-finish-mote',
  name: 'cf-finish-mote',
  tags: [],
  rows: [
    'w',
    'B',
  ],
};

const sparkXLater = cfLater(sparkX, 'cf-finish-spark-x-later', 2, 400);
const sparkSmallLater = cfLater(sparkSmall, 'cf-finish-spark-small-later', 1, 630);

/** Where a 16x16 emblem sits: centred in the glass, with two pixels of clear glass all round. */
const EMBLEM_AT = { x: 16, y: 7 } as const;
const EMBLEM_SIZE = 16;

/**
 * The pathway keepsake with `emblem` set in the glass. An emblem of any other size would hang off
 * the glass or sit off centre without failing a check, so it throws here instead.
 */
export function cfKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  const tall = emblem.rows.length;
  const wide = emblem.rows[0]?.length ?? 0;
  if (tall !== EMBLEM_SIZE || wide !== EMBLEM_SIZE) {
    throw new Error(`cfKeepsake ${id}: emblem ${emblem.id} is ${String(wide)}x${String(tall)}, the glass takes ${String(EMBLEM_SIZE)}x${String(EMBLEM_SIZE)}`);
  }
  const layers: SceneLayer[] = [
    { sprite: emblem, x: EMBLEM_AT.x, y: EMBLEM_AT.y },
    { sprite: glint, x: GLASS.x, y: GLASS.y },
    { sprite: sparkX, x: 3, y: 6, motion: { kind: 'twinkle', periodMs: 1800, min: 0.4 } },
    { sprite: sparkXLater, x: 40, y: 19, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.5, min: 0.4 } },
    { sprite: sparkSmall, x: 41, y: 4, motion: { kind: 'twinkle', periodMs: 1500, phase: 0.25, min: 0.35 } },
    { sprite: sparkSmallLater, x: 6, y: 25, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.7, min: 0.35 } },
    { sprite: mote, x: 9, y: 16, motion: { kind: 'rise', amp: 5, periodMs: 2400, phase: 0.1 } },
    { sprite: mote, x: 39, y: 12, motion: { kind: 'rise', amp: 5, periodMs: 2700, phase: 0.6 } },
    { sprite: mote, x: 41, y: 30, motion: { kind: 'rise', amp: 4, periodMs: 2100, phase: 0.35 } },
  ];
  return { id, label, width: 48, height: 40, base: block, layers };
}

export const cf1Finish = cfKeepsake(
  'cf1-finish',
  'A crystal award on a gold stand with a signpost inside pointing three ways, and small sparkles around it.',
  cfEmblemSignpost,
);
