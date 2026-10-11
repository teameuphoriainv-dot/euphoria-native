/**
 * Business Strategy lesson 3 opener: red ocean, blue ocean, seen from our harbour.
 *
 * Built on bsHarbour. To the left the water runs red: rival ships with red sails jostle, cannon
 * smoke drifts up and shark fins circle, the crowded market every competitor fights over. To the
 * right the sea is open, dark blue and empty under the moon, and our one ship with the purple sail
 * heads out into it alone. The moon and its road on the water are the brightest marks; the red
 * sails pop against the dark headland. Moving: the ships ride the swell out of step, our pennant
 * flies, the fins circle, smoke rises, a cannon flashes, the lighthouse and the jetty lamp burn,
 * the moonlight glints and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsEmber, bsMoved, bsStar } from './bs-kit';
import { bsHarbour, bsMirrored } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const redWater: PixelSprite = {
  id: 'bs3-red-water',
  name: 'red-water',
  tags: [],
  blurb: 'The left of the bay run red and choppy: the harbour sea recoloured, stopping short of the jetty and the lamp post.',
  palette: { Y: '#4A1220' },
  rows: [
    '111111111111111111111111111111...........',
    'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY..........',
    'YYYYYYYYYYYY11YYYYYYYY1111YYYYYY.........',
    'YYY1111YYYYYYYYYYYYYYYYYYYYYYYYYY........',
    'YYYYYYYYYYYYYYYYYYYYYYYY11YYYYYYYY.......',
    'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY......',
    'YYYYYYYrrrYYYYYYYYYYYYYYYYYYYYYYYYYY.....',
    'YYYYYYYYYY11111YYYY11YYYYYYYYYYYYYYY.....',
    'YYYYYYYYYYYYYYYYYYYYYYYYYYYrrYYYY111.....',
    'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY.....',
    'Y11..YYYYYYYYYrrrYYYYYYYYYYYYYYYYYYY.....',
    'YYY..YYYYYYYYYYYYYYYYYYY11YYYYYYYYY......',
    'YY1..111YYYYYYYYYYYYYYYYYYYYYYYYYYY......',
    'YYY..YYYY11YYYYYYYYYYYYYYY111111YY.......',
    'YYY..YYYYYYYYYYYYYYYYYYYYYYYYYYYYY.......',
    'YYY..rrYYYYYYYYYYYYYYYYYYYYYYYYYYYY......',
    'YYY..YYYYYYYYYYYY11YYYYYYYrrYYYYYYY......',
    'YYY..YYYYYYYYY1111111YYYYYYYYYYYYYYY.....',
    'YYY..YYYYYY111YYYYYYYYYYYYYYYYYYYYYYY....',
    'YYY..YYYYYYYYYYYYYYYYY11Y..YYYYYYYYY11...',
    'Yrr..YYYYYYYYYYYYYYYYYYY..r.YYY111YYYYY..',
    'YY....YYYYYYYYYYYYYYYYYY....YYYYYYYYYYYY.',
  ],
};

const shipRival: PixelSprite = {
  id: 'bs3-ship-rival',
  name: 'ship-rival',
  tags: [],
  blurb: 'A rival ship under a red sail, facing right; the hull is the bottom three rows.',
  rows: [
    '......D......',
    '......Dr1....',
    '..OOOOOOOOO..',
    '..sRRRRRRRr..',
    '..sRRRRRRRr..',
    '..sRRRRRRRr..',
    '...sRRRRRr...',
    '......D......',
    'O.....D.....O',
    'OgggggggggggO',
    '.OgggggggggO.',
    '..OOOOOOOOO..',
  ],
};

const shipRivalLeft = bsMirrored(shipRival, 'bs3-ship-rival-left');

const shipOursRows = [
  '........D........',
  '........DPPq.....',
  '...OOOOOOOOOOO...',
  '...qPPPPPPPPPp...',
  '...qPPPGyGPPPp...',
  '...qPPPGGGPPPp...',
  '...qPPPPGPPPPp...',
  '...qPPPGGGPPPp...',
  '....qPPPPPPPp....',
  '........D........',
  'O.......D.......y',
  'OGGGGGGGGGGGGGGyG',
  '.OgggggggggggggO.',
  '..OOOOOOOOOOOOO..',
];

const shipOurs: PixelSprite = {
  id: 'bs3-ship-ours',
  name: 'ship-ours',
  tags: [],
  blurb: 'Our ship: a purple sail with the gold rook, the house pennant flying from the mast.',
  rows: shipOursRows,
  frames: [
    shipOursRows,
    bsMoved(shipOursRows, {
      1: '........DPPPq....',
    }),
    shipOursRows,
    bsMoved(shipOursRows, {
      1: '........DPq......',
    }),
  ],
  frameMs: 480,
};

const fin: PixelSprite = {
  id: 'bs3-fin',
  name: 'fin',
  tags: [],
  blurb: 'A shark fin cutting the red water.',
  rows: [
    '..X.',
    '.XX.',
    'XXXD',
  ],
};

const smoke: PixelSprite = {
  id: 'bs3-smoke',
  name: 'smoke',
  tags: [],
  blurb: 'A puff of cannon smoke, for a rise layer.',
  rows: [
    '.x.',
    'xXx',
  ],
};

const lamp: PixelSprite = {
  id: 'bs3-lamp',
  name: 'lamp',
  tags: [],
  blurb: 'The lighthouse lamp, for the lamp room at (4, 3).',
  rows: [
    'yy',
    'GG',
  ],
};

const lanternRows = [
  'DDDD',
  'D43D',
  'D34D',
  '.DD.',
];

const lantern: PixelSprite = {
  id: 'bs3-lantern',
  name: 'lantern',
  tags: [],
  blurb: 'The jetty lamp on its post, flickering.',
  rows: lanternRows,
  frames: [
    lanternRows,
    bsMoved(lanternRows, {
      1: 'D34D',
      2: 'D43D',
    }),
    bsMoved(lanternRows, {
      1: 'D44D',
      2: 'D33D',
    }),
  ],
  frameMs: 430,
};

export const bs3Opener: SceneArt = {
  id: 'bs3-opener',
  label: 'Rival ships with red sails crowd a red sea full of shark fins, while one ship with a purple sail heads alone into calm blue water under the moon.',
  width: 80,
  height: 60,
  base: bsHarbour,
  layers: [
    { sprite: redWater, x: 0, y: 27 },
    { sprite: bsStar, x: 30, y: 4, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: bsStar, x: 45, y: 9, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.2 } },
    { sprite: bsStar, x: 76, y: 3, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.8, min: 0.2 } },
    { sprite: lamp, x: 4, y: 3, motion: { kind: 'twinkle', periodMs: 1600, min: 0.3 } },
    { sprite: smoke, x: 12, y: 18, motion: { kind: 'rise', amp: 5, periodMs: 2400 } },
    { sprite: smoke, x: 26, y: 19, motion: { kind: 'rise', amp: 4, periodMs: 2900, phase: 0.45 } },
    { sprite: shipRival, x: 0, y: 21, motion: { kind: 'bob', amp: 1, periodMs: 1700 } },
    { sprite: shipRivalLeft, x: 8, y: 26, motion: { kind: 'bob', amp: 1, periodMs: 1900, phase: 0.4 } },
    { sprite: shipRival, x: 16, y: 20, motion: { kind: 'bob', amp: 1, periodMs: 2100, phase: 0.7 } },
    { sprite: shipRivalLeft, x: 22, y: 28, motion: { kind: 'bob', amp: 1, periodMs: 2300, phase: 0.2 } },
    { sprite: bsEmber, x: 15, y: 31, motion: { kind: 'twinkle', periodMs: 900, phase: 0.3, min: 0.1 } },
    { sprite: fin, x: 5, y: 42, motion: { kind: 'drift', amp: 3, periodMs: 3600 } },
    { sprite: fin, x: 19, y: 45, motion: { kind: 'drift', amp: 3, periodMs: 4200, phase: 0.5 } },
    { sprite: bsStar, x: 63, y: 33, motion: { kind: 'twinkle', periodMs: 1500, phase: 0.2, min: 0.2 } },
    { sprite: bsStar, x: 61, y: 41, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.7, min: 0.2 } },
    { sprite: shipOurs, x: 52, y: 24, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
    { sprite: lantern, x: 2, y: 33 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs3-emblem-ocean',
  name: 'emblem-ocean',
  tags: [],
  blurb: 'Lesson 3 emblem, 16x16: our purple sail leaving red water for blue.',
  rows: [
    '.......D........',
    '.......DPq......',
    '..OOOOOOOOOOO...',
    '..qPPPPPPPPPp...',
    '..qPPPGyGPPPp...',
    '..qPPPGGGPPPp...',
    '..qPPPPGPPPPp...',
    '..qPPPGGGPPPp...',
    '...qPPPPPPPp....',
    '.......D........',
    'O......D......y.',
    'OGGGGGGGGGGGGyG.',
    '.OgggggggggggO..',
    'rrRrrbbBbbbbBbbb',
    'rRrrbbbbbBbbbbbb',
    '.rrrbbbbbbbbbbb.',
  ],
};

export const bs3Finish: SceneArt = bsKeepsake(
  'bs3-finish',
  'A purple house banner on a gold rod, its roundel showing a ship with a purple sail leaving red water for blue.',
  emblem,
);

export const art: LessonArtSet = { opener: bs3Opener, backdrop: bsBackdrop, finish: bs3Finish };
