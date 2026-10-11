/**
 * cf-backdrop: the company at dusk. The Corporate Finance course's world, drawn to sit along the
 * bottom of every lesson screen behind the content: a brick works with a sawtooth roof and two
 * banded stacks, the head-office tower (clock, lit boardroom floor, flag), a bank under its
 * pediment, a warehouse with a tower crane, and a conveyor along the street carrying crates past all
 * four. Where the cash is made, decided on, borrowed and stored. Warm where the quant skyline is
 * cool: lit windows, the boardroom and the crane are deep gold, the stack bands ember, the warehouse
 * a slate blue. Only small layers move (crates, smoke, a few windows, the flag, the hook, a beacon).
 * Everything stays under luminance 0.15.
 */
import type { PixelSprite } from '../types';
import { CF_PALETTE } from './cf-kit';
import type { SceneArt } from './types';

const base: PixelSprite = {
  id: 'cf-backdrop-base',
  name: 'cf-backdrop-base',
  tags: [],
  blurb: 'The campus at rest: works, tower, bank, warehouse, crane, street.',
  palette: CF_PALETTE,
  rows: [
    '..........................................D.....................................................................',
    '..........................................D.....................................................................',
    '........................................DDDDDD..................................................................',
    '........................................kkkkk...................................................................',
    '....................................DDDDDDDDDDDDDD..............................................................',
    '....................................DkkkkkkkkkkkkD.................................................O............',
    '.........DDDDD......................DkkkkkkkkkkkkD................................................OO.O..........',
    '..........AAa...................DDDDDDDDDDDDDDDDDDDDD..............................................O............',
    '..........111...................DkkkkkkkkkkkkkkkKKKKD...............................OOOOOOOOOOOOOOOOOOOOOOO.....',
    '..........AAa...................DkkkkkkDDDDDDDkkKKKKD...............................OKOOKOOKOOKOOKOOKOOKOOO.....',
    '..........111...DDDDD...........DkkkkkkDXXKXXDkkKKKKD.....................................D........OO..DDDD.....',
    '..........AAa....AAa............DkkkkkkDXXKKXDkkKKKKD.....................................D........OK..DDDD.....',
    '..........AAa....111............DkkkkkkDXXXXXDkkKKKKD.....................................D........KO..DDDD.....',
    '..........AAa....AAa............DkkkkkkDDDDDDDkkKKKKD.....................................D........OO...........',
    '..........AAa....111............DkkkkkkkkkkkkkkkKKKKD..............................................OK...........',
    '..........AAa....AAa............DkkkkkkkkkkkkkkkKKKKD..............................................KO...........',
    '..........AAa....AAa............DkOOOkOOOkOOOkOkKKKKD..............................................OO...........',
    '..........AAa....AAa............DkOOOkOOOkOOOkOkKKKKD..............................................OK...........',
    '..........AAa....AAa............DkkkkkkkkkkkkkkkKKKKD..............................................KO...........',
    '..........AAa....AAa............DkkkkkkkkkkkkkkkKKKKD..............................................OO...........',
    '..........AAa....AAa............DkKKkKKkKKkKKkKKKKKKD..........DDDDD...............................OK...........',
    '..........AAa....AAa............DkKKkKKkKKkKKkKKKKKKD........DDkkkkkDD.............................KO...........',
    '..........AAa....AAa............DkkkkkkkkkkkkkkkKKKKD......DDkkkkOkkkkDD...........................OO...........',
    '........D.....D.....D.....D.....DkKKkKKkKKkKKkKKKKKKD....DDkkkkkkkkkkkkkDD........DDDDDDDDDDDD.....OK...........',
    '......AAD...AAD...AAD...AAD.....DkKKkKKkKKkKKkKKKKKKD..DDkkkkkkkkkkkkkkkkkDD....DkkkkkkkkkkkkkkD...KO...........',
    '....AAAAO.AAAAO.AAAAO.AAAAO.....DkkkkkkkkkkkkkkkKKKKD..DDDDDDDDDDDDDDDDDDDDD...DkkkkkkkkkkkkkkkkD..OO...KKKKK...',
    '...AAAAADAAAAADAAAAADAAAAAD.....DkKKkKKkKKkKKkKKKKKKD...XXXXXXXXXXXXXXXXXXX...DkkkkkkkkkkkkkkkkkkD.OK...KKKKK...',
    '..aaaaaaaaaaaaaaaaaaaaaaaaaaa...DkKKkKKkKKkKKkKKKKKKD...kXDkkXDkkXDkkXDkkXD..DDDDDDDDDDDDDDDDDDDDDDKO...KKKKK...',
    '..AAAAAAAAAAAAAAAAAAAAAAAAAAa...DkkkkkkkkkkkkkkkKKKKD...kXDkkXDkkXDkkXDkkXD...CcCcCcCcCcCcCcCcCcCc.OOKKKKKKKKKKK',
    '..AAAAAAAAAAAAAAAAAAAAAAAAAAa...DkKKkKKkKKkKKkKKKKKKD...kXDkkXDkkXDkkXDkkXD...CcCcCcCcCcCcCcCcCcCc.OKKKKKKKKKKKK',
    'KKAAaaAAaaAAaaAAaaAAaaAAaaAAa...DkKKkKKkKKkKKkKKKKKKDKK.kXDkkXDkkXDkkXDkkXD...CcDDDDDDDcCDDDDDDDCc.KOKKKKKKKKKKK',
    'KKAAaaAAaaAAaaAAaaAAaaAAaaAAaKKKDkkkkkkkkkkkkkkkKKKKDKK.kXDkkXDkkXDkkXDkkXD...CckkkkkkkcCkkkkkkkCc.OOKKKKKKKKKKK',
    'KKAAaaAAaaAAaaAAaaAAaaAAaaAAaKKKDkKKkKKkKKkKKkKKKKKKDKK.kXDkkXDkkXDkkXDkkXDKK.CcDDDDDDDcCDDDDDDDCc.OKKKKKKKKKKKK',
    'KKAAAAAAAAAADDDDDDDAAAAAAAAAaKKKDkKKkKKkKKkKKkKKKKKKDKK.kXDkkXDkkXDkkXDkkXDKK.CckkkkkkkcCkkkkkkkCc.KOKKKKKKKKKKK',
    'KKAAAAAAAAAAaaaaaaaAAAAAAAAAaKKKDkkkkkKKKKKKKkkkKKKKDKK.kXDkkXDkkXDkkXDkkXDKK.CcDDDDDDDcCDDDDDDDCc.OOKKKKKKKKKKK',
    'KKAAaaAAaaAADDDDDDDAAAaaAAaaaKKKDkkkkkKOOkOOKkkkKKKKDKK.kXDkkXDkkXDkkXDkkXDKK.CckkkkkkkcCkkkkkkkCc.OKKKKKKKKKKKK',
    'KKAAaaAAaaAAaaaaaaaAAAaaAAaaaKKKDkkkkkKOOkOOKkkkKKKKDKKDDDDDDDDDDDDDDDDDDDDDK.CcDDDDDDDcCDDDDDDDCc.KOKKKKKKKKKKK',
    'KKAAAAAAAAAADDDDDDDAAAAAAAAAaKKKDkkkkkKOOkOOKkkkKKKKDKXXXXXXXXXXXXXXXXXXXXXXX.CckkkkkkkcCkkkkkkkCc.OOKKKKKKKKKKK',
    'KKAAAAAAAAAAaaaaaaaAAAAAAAAAaKKKDkkkkkKOOkOOKkkkKKKKDDDDDDDDDDDDDDDDDDDDDDDDDDCcDDDDDDDcCDDDDDDDCc.OOKKKKKKKKKKK',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'KkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKKkKK',
  ],
};

/**
 * Crates on the street conveyor, two pixels a frame. The two crate kinds alternate, so a loop runs
 * sixteen pixels (two crates) or every crate would change kind at the restart. Three of these laid end
 * to end make the belt; 32 is a whole number of loops, so the crates cross the joins unbroken.
 */
const crates: PixelSprite = {
  id: 'cf-backdrop-crates',
  name: 'cf-backdrop-crates',
  tags: [],
  palette: CF_PALETTE,
  rows: [
    'AOOA....aOa.....AOOA....aOa.....',
    'aAAa....aaa.....aAAa....aaa.....',
  ],
  frames: [
    [
      'AOOA....aOa.....AOOA....aOa.....',
      'aAAa....aaa.....aAAa....aaa.....',
    ],
    [
      '..AOOA....aOa.....AOOA....aOa...',
      '..aAAa....aaa.....aAAa....aaa...',
    ],
    [
      '....AOOA....aOa.....AOOA....aOa.',
      '....aAAa....aaa.....aAAa....aaa.',
    ],
    [
      'a.....AOOA....aOa.....AOOA....aO',
      'a.....aAAa....aaa.....aAAa....aa',
    ],
    [
      'aOa.....AOOA....aOa.....AOOA....',
      'aaa.....aAAa....aaa.....aAAa....',
    ],
    [
      '..aOa.....AOOA....aOa.....AOOA..',
      '..aaa.....aAAa....aaa.....aAAa..',
    ],
    [
      '....aOa.....AOOA....aOa.....AOOA',
      '....aaa.....aAAa....aaa.....aAAa',
    ],
    [
      'OA....aOa.....AOOA....aOa.....AO',
      'Aa....aaa.....aAAa....aaa.....aA',
    ],
  ],
  frameMs: 500,
};

const smoke: PixelSprite = {
  id: 'cf-backdrop-smoke',
  name: 'cf-backdrop-smoke',
  tags: [],
  rows: [
    '.DD.',
    'DXXD',
    '.DD.',
  ],
};

const flag: PixelSprite = {
  id: 'cf-backdrop-flag',
  name: 'cf-backdrop-flag',
  tags: [],
  rows: [
    'OOOO',
    'OEEE',
    'OE..',
  ],
  frames: [
    [
      'OOOO',
      'OEEE',
      'OE..',
    ],
    [
      'OOO.',
      'OEEE',
      'OEE.',
    ],
    [
      'OOOO',
      'OEEE',
      'OE.E',
    ],
  ],
  frameMs: 700,
};

const hook: PixelSprite = {
  id: 'cf-backdrop-hook',
  name: 'cf-backdrop-hook',
  tags: [],
  rows: [
    '.D.',
    '.D.',
    '.D.',
    '.D.',
    'OOO',
    'O.O',
    '..O',
  ],
};

const beacon: PixelSprite = {
  id: 'cf-backdrop-beacon',
  name: 'cf-backdrop-beacon',
  tags: [],
  rows: [
    'r',
  ],
  frames: [
    [
      'r',
    ],
    [
      'K',
    ],
  ],
  frameMs: 1600,
};

const litTowerA: PixelSprite = {
  id: 'cf-backdrop-lit-tower-a',
  name: 'cf-backdrop-lit-tower-a',
  tags: [],
  rows: [
    'OO.........',
    'OO.........',
    '...........',
    '......OO...',
    '......OO...',
    '...........',
    '.........OO',
    '.........OO',
    '...........',
    '...OO......',
    '...OO......',
  ],
};

const litTowerB: PixelSprite = {
  id: 'cf-backdrop-lit-tower-b',
  name: 'cf-backdrop-lit-tower-b',
  tags: [],
  rows: [
    'OO......',
    'OO......',
    '........',
    '......OO',
    '......OO',
    '........',
    '...OO...',
    '...OO...',
  ],
};

const litWorks: PixelSprite = {
  id: 'cf-backdrop-lit-works',
  name: 'cf-backdrop-lit-works',
  tags: [],
  rows: [
    'OO..........OO',
    'OO..........OO',
    'OO..........OO',
  ],
};

export const cfBackdrop: SceneArt = {
  id: 'cf-backdrop',
  label: 'A factory with smoking stacks, a head office tower, a bank and a warehouse with a crane at dusk, with crates riding a conveyor along the street.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: crates, x: 8, y: 40 },
    { sprite: crates, x: 40, y: 40 },
    { sprite: crates, x: 72, y: 40 },
    { sprite: smoke, x: 10, y: 3, motion: { kind: 'rise', amp: 5, periodMs: 5200 } },
    { sprite: smoke, x: 17, y: 7, motion: { kind: 'rise', amp: 5, periodMs: 6100, phase: 0.45 } },
    { sprite: flag, x: 43, y: 0 },
    { sprite: hook, x: 89, y: 12, motion: { kind: 'bob', amp: 2, periodMs: 4200 } },
    { sprite: beacon, x: 106, y: 7 },
    { sprite: litTowerA, x: 34, y: 20, motion: { kind: 'twinkle', periodMs: 6400, min: 0.35, phase: 0.1 } },
    { sprite: litTowerB, x: 40, y: 26, motion: { kind: 'twinkle', periodMs: 7600, min: 0.35, phase: 0.6 } },
    { sprite: litWorks, x: 8, y: 30, motion: { kind: 'twinkle', periodMs: 6900, min: 0.4, phase: 0.3 } },
  ],
};
