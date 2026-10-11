/**
 * Corporate Finance lesson 10, Corporate Governance & Ethics: the board that watches the managers.
 *
 * Opener: the boardroom. Five directors sit in high-backed chairs behind the long board table, the
 * chair of the board in the middle under the company seal, and the CFO stands at the end of the
 * table presenting his report: management answers to the board, and the board answers to the
 * shareholders. The directors vote on it, hands going up one after another. Only small layers
 * move: three voting hands, the two pendant lamps, a glint on the seal.
 *
 * Keepsake: a gavel striking its block.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfHall, cfShadowShort } from './cf-kit';
import { cfCfoReach, cfRecolor } from './cf-kit-a';
import { cfBoardTable, cfChairBack, cfDirector } from './cf-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The rest of the board, recoloured from the one director. */
const directorAuburn = cfRecolor(cfDirector, 'cf10-director-auburn', { h: '1', X: '3', B: 'x', b: 'X' }, 'A director with auburn hair in a grey suit.');
const chairOfBoard = cfRecolor(cfDirector, 'cf10-chair-of-board', { h: 'x', X: 'w', B: 'X', b: 'D', r: 'G' }, 'The silver-haired chair of the board in charcoal.');
const directorBurgundy = cfRecolor(cfDirector, 'cf10-director-burgundy', { h: 'G', X: 'y', B: 'I', b: '1', r: 'x' }, 'A blonde director in a burgundy suit.');
const directorBrown = cfRecolor(cfDirector, 'cf10-director-brown', { h: 'A', X: 'g' }, 'A brown-haired director in a blue suit.');

/** The company seal over the chair: a gold ring round the orchid diamond. */
const seal: PixelSprite = {
  id: 'cf10-seal',
  name: 'cf10-seal',
  tags: ['scene', 'cf10'],
  blurb: 'A gold medallion with an orchid diamond.',
  rows: [
    '....OOOOO....',
    '..OOyyyGGOO..',
    '.OyyOOOOOGgO.',
    '.OyOKKKKKOgO.',
    'OyOKKKPKKKOgO',
    'OyOKKPqPKKOgO',
    'OGOKPqPPpKOgO',
    'OGOKKPPpKKOgO',
    'OGOKKKpKKKOgO',
    '.OGOKKKKKOgO.',
    '.OgGOOOOOggO.',
    '..OOgggggOO..',
    '....OOOOO....',
  ],
};

/** A brass pendant lamp on a cord. Its lit bulb is a layer. */
const pendant: PixelSprite = {
  id: 'cf10-pendant',
  name: 'cf10-pendant',
  tags: ['scene', 'cf10'],
  blurb: 'A brass pendant lamp.',
  rows: [
    '..O..',
    '..O..',
    '..O..',
    '..O..',
    '..O..',
    '.OyO.',
    'OyGGO',
    'OGggO',
  ],
};

/** The finial on the chair of the board's taller chair. */
const crest: PixelSprite = { id: 'cf10-crest', name: 'cf10-crest', tags: ['scene', 'cf10'], rows: ['.y.', 'yGg', '.O.'] };

/** The report in the CFO's hand. */
const report: PixelSprite = { id: 'cf10-report', name: 'cf10-report', tags: ['scene', 'cf10'], rows: ['wwwx', 'wXXx', 'wwwx', 'wXXx'] };

const chairBack = cfChairBack('cf10-chair-back', 19);
const chairBackTall = cfChairBack('cf10-chair-back-tall', 23);
const table = cfBoardTable('cf10-table', 61);

const base = cfCompose('cf10-opener-base', cfHall, [
  [seal, 44, 4],
  [pendant, 24, 4],
  [pendant, 72, 4],
  [chairBack, 20, 25],
  [chairBack, 32, 25],
  [chairBackTall, 44, 21],
  [crest, 49, 18],
  [chairBack, 56, 25],
  [chairBack, 68, 25],
  [directorAuburn, 21, 29],
  [cfDirector, 33, 29],
  [chairOfBoard, 45, 29],
  [directorBurgundy, 57, 29],
  [directorBrown, 69, 29],
  [table, 19, 44],
  [cfShadowShort, 3, 57],
  [cfCfoReach, 0, 31],
  [report, 15, 40],
], 'The still boardroom: the seal, two lamps, five directors in their chairs, the table, the CFO with his report.');

/**
 * A director's arm raised to vote, sleeve in the suit's two tones, up on the frames in `up` of
 * eight. Its still is up, so under Reduce Motion the board has voted.
 */
function voteArm(id: string, lit: string, shade: string, up: readonly number[]): PixelSprite {
  const arm = ['SS', 'SM', 'ww', ...Array.from({ length: 7 }, () => `${lit}${shade}`)];
  const down = arm.map(() => '..');
  return {
    id,
    name: id,
    tags: ['scene', 'cf10'],
    blurb: 'A director raising a hand to vote.',
    palette: CF_PALETTE,
    rows: arm,
    frames: Array.from({ length: 8 }, (_, f) => (up.includes(f) ? arm : down)),
    frameMs: 450,
  };
}

const armAuburn = voteArm('cf10-opener-vote-auburn', 'x', 'X', [1, 2, 3, 4, 5]);
const armBlue = voteArm('cf10-opener-vote-blue', 'B', 'b', [2, 3, 4, 5]);
const armBurgundy = voteArm('cf10-opener-vote-burgundy', 'I', '1', [3, 4, 5]);

const bulb: PixelSprite = { id: 'cf10-opener-bulb', name: 'cf10-opener-bulb', tags: ['scene', 'cf10'], rows: ['yWy', '.y.'] };
const glint: PixelSprite = { id: 'cf10-opener-glint', name: 'cf10-opener-glint', tags: ['scene', 'cf10'], rows: ['.w.', 'wWw', '.w.'] };

export const cf10Opener: SceneArt = {
  id: 'cf10-opener',
  label: 'A board of five directors sits at a long table under the company seal, raising their hands one by one to vote, while the finance chief stands at the end presenting his report.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: armAuburn, x: 19, y: 31 },
    { sprite: armBlue, x: 43, y: 31 },
    { sprite: armBurgundy, x: 67, y: 31 },
    { sprite: bulb, x: 25, y: 12, motion: { kind: 'twinkle', periodMs: 2600, min: 0.4 } },
    { sprite: bulb, x: 73, y: 12, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.5, min: 0.4 } },
    { sprite: glint, x: 45, y: 5, motion: { kind: 'twinkle', periodMs: 3400, phase: 0.2, min: 0 } },
  ],
};

/** Lesson 10's emblem: a gavel coming down on its block. */
const emblemGavel: PixelSprite = {
  id: 'cf10-emblem-gavel',
  name: 'cf10-emblem-gavel',
  tags: [],
  blurb: 'A gold gavel striking a walnut block.',
  palette: CF_PALETTE,
  rows: [
    '................',
    '.......O........',
    '......OOO.......',
    '.....OyGOO......',
    '....OyGgO.......',
    '...OyGgO........',
    '..OyGgOG........',
    '.OOGgOOgG.......',
    '..OOO..OgG......',
    '...O....OgG.....',
    'w.....w..OgG....',
    '..........OgG...',
    '.OOOOOO....OgG..',
    'OyyGGGgO....Og..',
    'OAAAAAaO........',
    'OOOOOOOO........',
  ],
};

export const cf10Finish = cfKeepsake(
  'cf10-finish',
  'A crystal award on a gold stand with a gavel striking its block inside, and small sparkles around it.',
  emblemGavel,
);

export const art: LessonArtSet = { opener: cf10Opener, backdrop: cfBackdrop, finish: cf10Finish };
