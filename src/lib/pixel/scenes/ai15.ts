/**
 * Alternative Investments lesson 15: music royalties and intellectual property.
 *
 * The opener is the vault gallery (ai-kit.ts) turned listening room: a brass gramophone stands on a
 * marble plinth (the keepsake case's own) between two framed record awards, a gold record and a
 * platinum one, the catalog the lesson prices. The record turns, and out of the horn rise notes and
 * gold coins together, because every play of a song pays its owner a royalty. Only small layers
 * move: the record's sheen goes round, notes and coins rise from the horn and the gold record
 * glints. The keepsake is a new emblem: a black vinyl record with a red label.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiCase, aiCompose, aiGallery, aiGlintGold, aiKeepsake, aiPictureLight } from './ai-kit';
import { aiCoin } from './ai-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** A gramophone: a brass flower horn over a turntable on a wooden cabinet with gold trim and a crank. */
const gramophone: PixelSprite = {
  id: 'ai15-gramophone',
  name: 'ai15-gramophone',
  tags: ['scene', 'ai'],
  blurb: "A gramophone: a brass horn flaring up and left, a record on the turntable, a wooden cabinet.",
  rows: [
    '............................',
    '......OOOOOOOO..............',
    '.....OGGgggggGO.............',
    '....OGgggOOOgggO............',
    '...OGygOOOOOOggGO...........',
    '..OyyyOOkkkkOOgGGO..........',
    '..OyyOkkkkkkOOgGGO..........',
    '..OyOOkkkkkkOOgGGO..........',
    '..OyOOkkkkkkOOgGGO..........',
    '..OyOOkkkkkkOgGGGO..........',
    '..OyOOkkkkOOggGGGO..........',
    '..OyyOOOOOOygGGGGO..........',
    '..OyyyOOOyyyGGGGGO..........',
    '...OyyyyyyyyyGGGGO..........',
    '....OyyyyyyyyyGGGO..........',
    '.....OyyyyyyyyyGGGO.........',
    '......OOOOOOOOOOGGO.........',
    '................OOGO........',
    '..................OGO.......',
    '...................OGg......',
    '....................Gg......',
    '....................Gg......',
    '...........DDDDDD..GGg......',
    '.....DkkkDDDkkkkDDGkkkD.....',
    '...DkkDDkkrrRwRRrrkkDDkkD...',
    '...DkkDDkkrrRRRRrrkkDDkkD...',
    '..OGGGGGGGGGGGGGGGGGGGGGGO..',
    '..OggggggggggggggggggggggO..',
    '..OgOOOOOOOOOOOOOOOOOOOOgODx',
    '..OgOgggggggggggggggggOOgO.x',
    '..OgOOOOOOOOOOOOOOOOOOOOgO..',
    '..OOOOOOOOOOOOOOOOOOOOOOOO..',
  ],
};

/** The keepsake case's marble plinth, gold plaque and all, cut out of aiCase to stand the gramophone on. */
const plinth: PixelSprite = {
  id: 'ai15-plinth',
  name: 'ai15-plinth',
  tags: ['scene', 'ai'],
  blurb: "A marble plinth with gold trim and a gold plaque.",
  rows: aiCase.rows.slice(26, 40).map((row) => row.slice(10, 38)),
};

const goldRecord: PixelSprite = {
  id: 'ai15-gold-record',
  name: 'ai15-gold-record',
  tags: ['scene', 'ai'],
  blurb: "A gold record award: a silver frame, a black mat, a gold disc with a red label, a plaque.",
  rows: [
    'DDDDDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxxxxD',
    'DxKKKKKKKKKKKKKKXD',
    'DxKKKKKOOOOKKKKKXD',
    'DxKKKOOyyyGOOKKKXD',
    'DxKKOyggyGggGOKKXD',
    'DxKKOgyyGGGGgOKKXD',
    'DxKOygyrrrrGgGOKXD',
    'DxKOyyGrKKrGGGOKXD',
    'DxKOyGGrKKrGGGOKXD',
    'DxKOGgGrrrrGgGOKXD',
    'DxKKOgGGGGGGgOKKXD',
    'DxKKOGggGGggGOKKXD',
    'DxKKKOOGGGGOOKKKXD',
    'DxKKKKKOOOOKKKKKXD',
    'DxKKKKKKKKKKKKKKXD',
    'DxKKKKKKKKKKKKKKXD',
    'DxKKKKxxxxxxKKKKXD',
    'DxKKKKKKKKKKKKKKXD',
    'DxXXXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDDDDD',
  ],
};

const platinumRecord: PixelSprite = {
  id: 'ai15-platinum-record',
  name: 'ai15-platinum-record',
  tags: ['scene', 'ai'],
  blurb: "A platinum record award: a silver disc with a blue label in the same frame.",
  rows: [
    'DDDDDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxxxxD',
    'DxKKKKKKKKKKKKKKXD',
    'DxKKKKKXXXXKKKKKXD',
    'DxKKKXXwwwxXXKKKXD',
    'DxKKXwXXwxXXxXKKXD',
    'DxKKXXwwxxxxXXKKXD',
    'DxKXwXwbbbbxXxXKXD',
    'DxKXwwxbKKbxxxXKXD',
    'DxKXwxxbKKbxxxXKXD',
    'DxKXxXxbbbbxXxXKXD',
    'DxKKXXxxxxxxXXKKXD',
    'DxKKXxXXxxXXxXKKXD',
    'DxKKKXXxxxxXXKKKXD',
    'DxKKKKKXXXXKKKKKXD',
    'DxKKKKKKKKKKKKKKXD',
    'DxKKKKKKKKKKKKKKXD',
    'DxKKKKxxxxxxKKKKXD',
    'DxKKKKKKKKKKKKKKXD',
    'DxXXXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDDDDD',
  ],
};

/** The light going round the turning record, a quarter of the way each frame. */
const sheen: PixelSprite = {
  id: 'ai15-sheen',
  name: 'ai15-sheen',
  tags: ['scene', 'ai'],
  blurb: "A glint circling the record on the turntable.",
  rows: ['..................', '..................', '..................'],
  frames: [
    ['......xw..........', '..................', '..................'],
    ['..................', '...............x..', '..................'],
    ['..................', '..................', '..........wx......'],
    ['..................', '..x...............', '..................'],
  ],
  frameMs: 230,
};

const note: PixelSprite = { id: 'ai15-note', name: 'ai15-note', tags: [], rows: ['..w.', '..ww', '..w.', 'www.', 'ww..'] };
const notes: PixelSprite = { id: 'ai15-notes', name: 'ai15-notes', tags: [], rows: ['.wwwww', '.w...w', '.w...w', 'ww..ww', 'ww..ww'] };

/** Wall over the gallery's display ledge: the plinth stands on the floor instead. */
const wall: PixelSprite = { id: 'ai15-wall', name: 'ai15-wall', tags: [], rows: ['a'.repeat(46), 'a'.repeat(46), 'a'.repeat(46)] };

const vinyl: PixelSprite = {
  id: 'ai15-vinyl',
  name: 'ai15-vinyl',
  tags: ['scene', 'ai'],
  blurb: "Lesson 15: a black vinyl record with a red label, its grooves and a sheen across it.",
  rows: [
    '....XXXXXX....',
    '...XkDDDDkX...',
    '..XDkDDDDkxX..',
    '.XDkDkkkkxxxX.',
    'XkkDkkrrkxxkkX',
    'XDDkkRRRRkkDDX',
    'XDDkrRKKRrkDDX',
    'XDDkrRKKRrkDDX',
    'XDDkkRRRRkkDDX',
    'XkkxxkrrkkDkkX',
    '.XxxxkkkkDkDX.',
    '..XxkDDDDkDX..',
    '...XkDDDDkX...',
    '....XXXXXX....',
  ],
};

const GOLD = [5, 11] as const;
const PLATINUM = [57, 11] as const;
const GRAMOPHONE = [26, 14] as const;
/** The horn's mouth, where the notes and coins come out. */
const MOUTH = [GRAMOPHONE[0] + 8, GRAMOPHONE[1] + 7] as const;

const base = aiCompose('ai15-opener-base', aiGallery.rows, [
  [wall, 33, 43],
  [goldRecord, GOLD[0], GOLD[1]],
  [aiPictureLight, GOLD[0] + 6, GOLD[1] - 3],
  [platinumRecord, PLATINUM[0], PLATINUM[1]],
  [aiPictureLight, PLATINUM[0] + 6, PLATINUM[1] - 3],
  [plinth, GRAMOPHONE[0], GRAMOPHONE[1] + 32],
  [gramophone, GRAMOPHONE[0], GRAMOPHONE[1]],
]);

export const ai15Opener: SceneArt = {
  id: 'ai15-opener',
  label: 'A brass gramophone on a marble plinth plays a record between a framed gold record and a platinum one, music notes and gold coins rising together from its horn.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: sheen, x: GRAMOPHONE[0] + 5, y: GRAMOPHONE[1] + 23 },
    { sprite: note, x: MOUTH[0] - 4, y: MOUTH[1] - 8, motion: { kind: 'rise', amp: 6, periodMs: 2600, phase: 0.1 } },
    { sprite: notes, x: MOUTH[0] + 2, y: MOUTH[1] - 11, motion: { kind: 'rise', amp: 6, periodMs: 3000, phase: 0.5 } },
    { sprite: note, x: MOUTH[0] + 10, y: MOUTH[1] - 7, motion: { kind: 'rise', amp: 6, periodMs: 2800, phase: 0.8 } },
    { sprite: aiCoin, x: MOUTH[0] - 1, y: MOUTH[1] - 13, motion: { kind: 'rise', amp: 5, periodMs: 3200, phase: 0.3 } },
    { sprite: aiCoin, x: MOUTH[0] + 9, y: MOUTH[1] - 13, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.75 } },
    { sprite: aiGlintGold, x: GOLD[0] + 4, y: GOLD[1] + 3, motion: { kind: 'twinkle', periodMs: 1800, min: 0.35 } },
  ],
};

export const ai15Finish = aiKeepsake(
  'ai15-finish',
  'A black vinyl record with a red label floating in a glass display case on a marble plinth, with sparkles around it.',
  vinyl,
);

export const art: LessonArtSet = { opener: ai15Opener, backdrop: aiBackdrop, finish: ai15Finish };
