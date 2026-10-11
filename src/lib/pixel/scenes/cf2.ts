/**
 * Corporate Finance lesson 2, Financial Statements: the records room, where the company is read.
 *
 * Opener: the hall turned into a records room. Ledgers fill a bookcase at each side, the three
 * statements are pinned on the wall between them (income: profit bars; balance sheet: two columns
 * that total the same; cash flow: cash in above the line, cash out below), and on the desk lies the
 * open ledger with a magnifier gliding over it. The ledger's left page closes on a green profit,
 * the right on a red total: profitable on paper, short of cash. The ledger's pages are the
 * brightest broad surface. Only small layers move: the magnifier, the red total, the statements'
 * headers lighting in turn, the lamp's bulb.
 *
 * Keepsake: a statement under a magnifier that has found a red figure.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfHall } from './cf-kit';
import { cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A walnut bookcase of ledgers, four shelves, standing on the baseboard. */
const bookcase: PixelSprite = {
  id: 'cf2-bookcase',
  name: 'cf2-bookcase',
  tags: ['scene', 'cf2'],
  blurb: 'A walnut bookcase of leather ledgers with gold bands.',
  palette: CF_PALETTE,
  rows: [
    'OOOOOOOOOOO',
    'OAAAAAAAAaO',
    'OaaaaaaaaaO',
    'OAKKKKKKKaO',
    'OAnnKKIKKaO',
    'OAnnbbIKKaO',
    'OAGGbbIrraO',
    'OAnnGGIrraO',
    'OAnnbbIGGaO',
    'OAnnbbIrraO',
    'OAAAAAAAAaO',
    'OAKKKKKKKaO',
    'OArKKttKKaO',
    'OArppttnKaO',
    'OArppGGnnaO',
    'OAGppttnnaO',
    'OArGGttGGaO',
    'OArppttnnaO',
    'OAAAAAAAAaO',
    'OAKKKKKKKaO',
    'OAKKbbKKIaO',
    'OAnKbbrrIaO',
    'OAnKGGrrIaO',
    'OAnGbbGGIaO',
    'OAnnbbrrGaO',
    'OAnnbbrrIaO',
    'OAAAAAAAAaO',
    'OAKKKKKKKaO',
    'OAIIKKKnKaO',
    'OAIIttKnnaO',
    'OAGGttpnnaO',
    'OAIIGGpGGaO',
    'OAIIttpnnaO',
    'OAIIttpnnaO',
    'OAAAAAAAAaO',
    'OAAAAAAAAaO',
    'OaaaaaaaaaO',
    'OOOOOOOOOOO',
  ],
};

/** The same bookcase with its spines shuffled, so the two sides are not a mirror. */
const bookcaseRight = cfRecolor(bookcase, 'cf2-bookcase-right', { n: 'b', b: 'n', r: 'I', I: 'r', t: 'p', p: 't' });

/** Income statement: lines, then profit bars rising. Header rows 2 and 3. */
const sheetIncome: PixelSprite = {
  id: 'cf2-sheet-income',
  name: 'cf2-sheet-income',
  tags: ['scene', 'cf2'],
  blurb: 'A pinned income statement with green profit bars.',
  rows: [
    '.....OyO.....',
    'DDDDDDODDDDDD',
    'DNNNNNNNNNNND',
    'DnnnnnnnnnnnD',
    'DwwwwwwwwwwxD',
    'DwXXXXXwwXXxD',
    'DwwwwwwwwwwxD',
    'DwXXXXwwwXXxD',
    'DwwwwwwwwwwxD',
    'DwwwwwwwwNwxD',
    'DwwwwwwNwNwxD',
    'DwwwwNwNwNwxD',
    'DwwNwNwNwNwxD',
    'DwXXXXXXXXXxD',
    'DxxxxxxxxxxxD',
    'DDDDDDDDDDDDD',
  ],
};

/** Balance sheet: two columns that close on the same double-ruled total. */
const sheetBalance: PixelSprite = {
  id: 'cf2-sheet-balance',
  name: 'cf2-sheet-balance',
  tags: ['scene', 'cf2'],
  blurb: 'A pinned balance sheet: two columns with equal totals.',
  rows: [
    '.....OyO.....',
    'DDDDDDODDDDDD',
    'DBBBBBBBBBBBD',
    'DbbbbbbbbbbbD',
    'DwwwwwXwwwwxD',
    'DwXXXwXwXXXxD',
    'DwwwwwXwwwwxD',
    'DwXXwwXwXXwxD',
    'DwwwwwXwwwwxD',
    'DwXXXwXwXXwxD',
    'DwwwwwXwwwwxD',
    'DwBBBwXwBBBxD',
    'DwwwwwXwwwwxD',
    'DwBBBwXwBBBxD',
    'DxxxxxxxxxxxD',
    'DDDDDDDDDDDDD',
  ],
};

/** Cash flow statement: cash in above the line, cash out below it. */
const sheetCash: PixelSprite = {
  id: 'cf2-sheet-cash',
  name: 'cf2-sheet-cash',
  tags: ['scene', 'cf2'],
  blurb: 'A pinned cash flow statement: green bars up, a red bar down.',
  rows: [
    '.....OyO.....',
    'DDDDDDODDDDDD',
    'DGGGGGGGGGGGD',
    'DgggggggggggD',
    'DwwwwwwwwwwxD',
    'DwNNwwwwwwwxD',
    'DwNNwwwwNNwxD',
    'DwNNwwwwNNwxD',
    'DwXXXXXXXXXxD',
    'DwwwwwrrwwwxD',
    'DwwwwwrrwwwxD',
    'DwwwwwrrwwwxD',
    'DwwwwwwwwwwxD',
    'DwXXXwwXXXwxD',
    'DxxxxxxxxxxxD',
    'DDDDDDDDDDDDD',
  ],
};

/** The desk across the bottom: a walnut top with a leather inlay, a brass edge, a drawer front. */
const desk: PixelSprite = {
  id: 'cf2-desk',
  name: 'cf2-desk',
  tags: ['scene', 'cf2'],
  palette: CF_PALETTE,
  rows: [
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaOGGOaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaOGGOaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  ],
};

/**
 * The open ledger, read from above: two ruled pages over a maroon cover. The left page closes on a
 * green total (the profit); the right on a red one (the receivables nobody has paid).
 */
const ledger: PixelSprite = {
  id: 'cf2-ledger',
  name: 'cf2-ledger',
  tags: ['scene', 'cf2'],
  blurb: 'An open ledger: a green total on the left page, a red one on the right.',
  rows: [
    '.DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
    'DwwwwwwwwwwwwwwwwwwwxXXxwwwwwwwwwwwwwwwwwwwD',
    'DwXXXXXXXXwwXXXXXwwwxXXxwXXXXXXwwwXXXXXXwwwD',
    'DwwwwwwwwwwwwwwwwwwwxXXxwwwwwwwwwwwwwwwwwwwD',
    'DwXXXXXXXXXwwXXXXwwwxXXxwXXXXXwwwXXXXXXXwwwD',
    'DwwwwwwwwwwwwwwwwwwwxXXxwwwwwwwwwwwwwwwwwwwD',
    'DwXXXXXXwwwXXXXXXwwwxXXxwXXXXXXXXwwXXXXXwwwD',
    'DwwwwwwwwwwwwwwwwwwwxXXxwwwwwwwwwwwwwwwwwwwD',
    'DwXXXXXwwwXXXXXXXwwwxXXxwXXXXXXXXXwwXXXXwwwD',
    'DwwwwwwwwwwwwwwwwwwwxXXxwwwwwwwwwwwwwwwwwwwD',
    'DwwwwwwwwwwwNNNNNNwwxXXxwwwwwwwwwwwrrrrrrwwD',
    'DxxxxxxxxxxxxxxxxxxxxXXxxxxxxxxxxxxxxxxxxxxD',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    '.OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO.',
  ],
};

/** A banker's lamp: green glass shade, brass stem and foot. */
const lamp: PixelSprite = {
  id: 'cf2-lamp',
  name: 'cf2-lamp',
  tags: ['scene', 'cf2'],
  blurb: 'A green-shaded brass desk lamp.',
  rows: [
    '...nnnnn...',
    '.nNNmmNNNn.',
    'nNmmNNNNNNn',
    'nnnnnnnnnnn',
    '.OyyyyyyyO.',
    '.....G.....',
    '.....G.....',
    '.....g.....',
    '.....G.....',
    '....OGO....',
    '..OGGGGGO..',
    '.OOOOOOOOO.',
  ],
};

/** An ink pot with a quill standing in it. */
const inkwell: PixelSprite = {
  id: 'cf2-inkwell',
  name: 'cf2-inkwell',
  tags: ['scene', 'cf2'],
  blurb: 'A quill in a pot of ink.',
  rows: [
    '......w',
    '.....wx',
    '....wx.',
    '...wx..',
    '..wx...',
    '..x....',
    '.DXXD..',
    'DXKKXD.',
    'DKKKKD.',
    '.DDDD..',
  ],
};

const base = cfCompose('cf2-opener-base', cfHall, [
  [bookcase, 0, 4],
  [bookcaseRight, 69, 4],
  [sheetIncome, 14, 7],
  [sheetBalance, 33, 7],
  [sheetCash, 52, 7],
  [desk, 0, 41],
  [ledger, 18, 41],
  [lamp, 60, 30],
  [inkwell, 7, 33],
], 'The still records room: two bookcases of ledgers, three pinned statements, the desk and its open ledger.');

/** The magnifier: a gold ring over clear glass with a glint, an ebony handle down to the right. */
const magnifier: PixelSprite = {
  id: 'cf2-opener-magnifier',
  name: 'cf2-opener-magnifier',
  tags: ['scene', 'cf2'],
  blurb: 'A gold magnifying glass.',
  rows: [
    '...OOOOO....',
    '..OGGyyGO...',
    '.OG..BwwGO..',
    'OG....BwGO..',
    'OG.......GO.',
    'OG.......GO.',
    'Og.......gO.',
    '.Og.....gO..',
    '..OggggOXD..',
    '...OOOOOXXD.',
    '.........XXD',
    '..........XD',
  ],
};

/** The red total, brightening: the early warning the magnifier is looking for. */
const warning: PixelSprite = {
  id: 'cf2-opener-warning',
  name: 'cf2-opener-warning',
  tags: ['scene', 'cf2'],
  rows: [
    'RRRRRR',
  ],
};

const glowIncome: PixelSprite = { id: 'cf2-opener-glow-income', name: 'cf2-opener-glow-income', tags: ['scene', 'cf2'], rows: ['mmmmmmmmmmm'] };
const glowBalance: PixelSprite = { id: 'cf2-opener-glow-balance', name: 'cf2-opener-glow-balance', tags: ['scene', 'cf2'], rows: ['wwwwwwwwwww'] };
const glowCash: PixelSprite = { id: 'cf2-opener-glow-cash', name: 'cf2-opener-glow-cash', tags: ['scene', 'cf2'], rows: ['yyyyyyyyyyy'] };

/** The lamp's bulb under the shade, glowing brighter and softer. */
const bulb: PixelSprite = {
  id: 'cf2-opener-bulb',
  name: 'cf2-opener-bulb',
  tags: ['scene', 'cf2'],
  rows: [
    'wwwwwww',
  ],
};

export const cf2Opener: SceneArt = {
  id: 'cf2-opener',
  label: 'A big open ledger on a desk with a magnifying glass sliding over its figures, under three pinned statements: income, balance sheet and cash flow.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: glowIncome, x: 15, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.3 } },
    { sprite: glowBalance, x: 34, y: 9, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.33, min: 0.3 } },
    { sprite: glowCash, x: 53, y: 9, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.66, min: 0.3 } },
    { sprite: bulb, x: 62, y: 34, motion: { kind: 'twinkle', periodMs: 4200, min: 0.3 } },
    { sprite: warning, x: 53, y: 51, motion: { kind: 'twinkle', periodMs: 1600, min: 0.2 } },
    { sprite: magnifier, x: 47, y: 39, motion: { kind: 'drift', amp: 5, periodMs: 5600 } },
  ],
};

/** Lesson 2's emblem: a statement under a magnifier that has found a red figure. */
const emblemSheet: PixelSprite = {
  id: 'cf2-emblem-sheet',
  name: 'cf2-emblem-sheet',
  tags: [],
  rows: [
    'DDDDDDDDDDD',
    'DNNNNNNNNND',
    'DwwwwwwwwxD',
    'DwXXXXwXXxD',
    'DwwwwwwwwxD',
    'DwXXXwXXXxD',
    'DwwwwwwwwxD',
    'DwXXXXwXXxD',
    'DwwwwwwwwxD',
    'DwXXwwXXXxD',
    'DwwwwwwwwxD',
    'DxxxxxxxxxD',
    'DDDDDDDDDDD',
  ],
};

const emblemLens: PixelSprite = {
  id: 'cf2-emblem-lens',
  name: 'cf2-emblem-lens',
  tags: [],
  rows: [
    '..OOOO....',
    '.OyyGGO...',
    'OyB...GO..',
    'OG.....O..',
    'OG.rrr.O..',
    'Og.....O..',
    '.OggggOX..',
    '..OOOOXDX.',
    '.......XDX',
    '........XD',
  ],
};

const blank16: PixelSprite = { id: 'cf2-emblem-ground', name: 'cf2-emblem-ground', tags: [], rows: Array.from({ length: 16 }, () => '.'.repeat(16)) };

const emblemLedger = cfCompose('cf2-emblem-ledger', blank16, [
  [emblemSheet, 0, 0],
  [emblemLens, 6, 6],
], 'A statement under a magnifying glass that has found a red figure.');

export const cf2Finish = cfKeepsake(
  'cf2-finish',
  'A crystal award on a gold stand with a statement under a magnifying glass inside, and small sparkles around it.',
  emblemLedger,
);

export const art: LessonArtSet = { opener: cf2Opener, backdrop: cfBackdrop, finish: cf2Finish };
