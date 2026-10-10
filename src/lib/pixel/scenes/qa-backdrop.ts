/**
 * qa-backdrop: the quant world at night. A financial-district skyline for the Quantitative
 * Analysis course, drawn to sit along the bottom of every lesson screen behind the content.
 * Far towers are hazy K masses with a 1px E roofline and a few distant lit windows, near towers
 * are k boxes seen from a corner (D roof rim and edges, a 3px K shadow face with unit-band dots),
 * windows are holes with a few lit ones twinkling, a small ticker screen crawls on tower 3, and a
 * faint 1px data polyline ticks along the street. Everything stays under luminance 0.15.
 */
import type { PixelSprite } from '../types';
import type { SceneArt } from './types';

const base: PixelSprite = {
  id: 'qa-backdrop-base',
  name: 'skyline at night',
  tags: [],
  rows: [
    '................................................................................................................',
    '................................................................................................................',
    '.......................................................................DDD......................................',
    '......................................................................DXXD......................................',
    '......................................................................DXDD......................................',
    '......................................................................DDKD......................................',
    '.......................................................................DD................D......................',
    '.....................D...................................................................D......................',
    '.....................D..................................................................DDD.....................',
    '....................DDD..................................................................D......................',
    '.....................D.................................................................DDDDD....................',
    '..................DDDDDDD..............................................................Dk.kKD...................',
    '..................Dk.k.kKD..................................EEE........................DkkkKD...................',
    '..................Dk.k.kKD............................D.....KKK......................DDDDDDDDD..................',
    '..................Dk.k.kKD....E......................DkD....KKKEE....................Dk.k.kKKKD.................',
    '..................DkkkkkKD....K......................DkD....KKKKK..DDDDD....EEEEE....DkkkkkKkKD.................',
    '..............DDDDDDDDDDDDDDDEKE....................DDDDD...KKKKK.DkkkKD....KKKKK....Dk.k.kKKKD....EEE..........',
    '..............DkkkkkkkkkkkKKKDKK....................Dk.kKD..KKKKKEDkkkKD....KKKKK....DkkkkkKkKD....KKK..........',
    '..............Dk.k.k.k.k.kKkKDKKE..........EEEEE....DkkkKD..KKKKKKDDDDDD....KKKKKDDDDDDDDDDDDDDDEEEKKKEEEE......',
    '...........EEEDk.k.k.k.k.kKKKDKKK..........KKKKK..DDDDDDDDD.KKKKKK.D..D.....KEKKKDkkkkkkkkkkkKKKDKKKKKKKKK......',
    '...........KKKDk.k.k.k.k.kKkKDKKKEE........KKKKKEEDk.k.kKKKDKEKKKK.D..D.....KKKKKDk.k.k.k.k.kKkKDKKKKKKKKK......',
    '.........EEKKKDk.k.k.k.k.kKKKDKKKKK........KKKKKKKDkkkkkKkKDKKKKDDDDDDDDDDDDDKKKKDk.k.k.k.k.kKKKDKKEKKKKKK......',
    '.........KKKKKDk.k.k.k.k.kKkKDKKKKKEDDD....KKKKKKKDk.k.kKKKDKKKKDkkkkkkkkkKKKDKKKDk.k.k.k.k.kKkKDKKKKKKKKK......',
    '.........KKKKKDk.k.k.k.k.kKKKDKKKKKKDkKD...KKKKDDDDDDDDDDDDDDKKKDk.k.k.k.kKkKDKKKDk.k.k.k.k.kKKKDKKKKKKEKK......',
    '.........KEKKKDk.k.k.k.k.kKkKDKKDDDDDDDDDDDDDKKDk.kk.kk.kkKkKDKKDkkkkkkkkkKKKDKKKDk.k.k.k.k.kKkKDKKKKKKKKK.DDD..',
    '.........KKKKKDk.k.k.k.k.kKKKDKKDkkkkkkkkkKKKDKDkkkkkkkkkkKKKDKKDkkkkkkkkkKKKDKEKDk.k.k.k.k.kKKKDKKKKKKKKK.DkKD.',
    'DDDDDDDDDDDKKKDk.k.k.k.k.kKkKDKKDk.kk.kk.kKkKDKDkkkkkkkkkkKKKDKKDk.k.kOk.kKkKDKKKDk.k.k.k.k.kKkKDKDDDDDDDDDDDDD.',
    'DkkkkkkkKKKDKKDk.k.k.k.k.kKKKDEKDkkkkkkkkkKKKDEDk.kk.kk.kkKkKDEKDkkkkkkkkkKKKDKKKDk.k.k.k.k.kKKKDKDkkkkkkkkkKKKD',
    'Dk.k.k.kKkKDKKDk.k.k.k.k.kKkKDKKDkDDDDDDDkKKKDKDkkkkkkkkkkKKKDKKDkkkkkkkkkKKKDKKKDk.k.k.k.k.kKkKDKDk.kk.kk.kKkKD',
    'DkkkkkkkKKKDKKDk.k.k.k.k.kKKKDKKDkKKKKKKKkKkKDKDkkkkkkkkkkKKKDKKDk.k.k.k.kKkKDKKKDk.k.k.k.k.kKKKDKDkkkkkkkkkKKKD',
    'DkkkkkkkKKKDKKDk.k.k.k.k.kKkKDKKDkKKKKKKKkKKKDKDk.kkOkk.kkKkKDKKDkkkkkkkkkKKKDKKKDk.k.k.k.k.kKkKDEDkkkkkkkkkKKKD',
    'Dk.k.k.kKkKDKEDk.k.k.k.k.kKKKDKKDkKKKKKKKkKKKDKDkkkkkkkkkkKKKDKKDkkkkkkkkkKKKDEKKDk.k.k.k.k.kKKKDKDk.kkOkk.kKkKD',
    'DkkkkkkkKKKDKKDk.k.k.k.k.kKkKDKKDkDDDDDDDkKkKDKDkkkkkkkkkkKKKDKKDkOk.k.k.kKkKDKKKDk.k.k.k.k.kKkKDKDkkkkkkkkkKKKD',
    'DkkkkkkkKKKDKKDk.k.k.k.k.kKKKDKEDkkkkkkkkkKKKDEDk.kk.kkOkkKkKDKEDkkkkkkkkkKKKDKKKDk.k.k.k.k.kKKKDKDkkkkkkkkkKKKD',
    'Dk.kOk.kKkKDKKDk.k.k.k.k.kKkKDKKDkkkkkkkkkKKKDKDkkkkkkkkkkKKKDKKDkkkkkkkkkKKKDKKKDk.k.k.k.k.kKkKDKDk.kk.kk.kKkKD',
    'DkkkkkkkKKKDKKDk.k.k.k.k.kKKKDKKDk.kk.kkOkKkKDKDkkkkkkkkkkKKKDKKDk.k.k.k.kKkKDKKKDk.k.k.k.k.kKKKDKDkkkkkkkkkKKKD',
    'DkkkkkkkKKKDKKDkkkkkkkkkkkKKKDKKDkkkkkkkkkKKKDKDk.kk.kk.kkKkKDKKDkkkkkkkkkKKKDKKKDkkkkkkkkkkkKKKDKDkkkkkkkkkKKKD',
    'Dk.k.k.kKkKDKKDkkkkkkkkkkkKKKDKKDkkkkkkkkkKKKDKDkkkkkkkkkkKKKDKKDkkkkkkkkkKKKDKKKDkkkkkkkkkkkKKKDKDkkkkkkkkkKKKD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKtKKKKKKKKKKKKtKKKKKKKKKKKKtKKKKKKKKKKKKtKKKKKKKKKKKKtKKKKKKKKKKKKtKKKKKKKKKKKtKKKKKKKKKKKKKtKKKKKKKKKKKtKKK',
    'EEEEEEEEEEEEKEEEEEEEEEEEEKKEEEEEEEEEEKEEEEEEEEEEEEEKKEEEEEEEEEEKEEEEEEEEEEEEEKEEEEEEEEEEEKEEEEEEEEEEEEKKEEEEEEEE',
    'KKKKKKKKKKKKEKKKKKKKKKKKKEEKKKKKKKKKKEKKKKKKKKKKKKKEEKKKKKKKKKKEKKKKKKKKKKKKKEKKKKKKKKKKKEKKKKKKKKKKKKEEKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};
const Lwin_n1: PixelSprite = {
  id: 'win-n1',
  name: 'win-n1',
  tags: [],
  rows: [
    'O',
    '.',
    '.',
    '.',
    '.',
    '.',
    'p',
  ],
};
const Lwin_n2: PixelSprite = {
  id: 'win-n2',
  name: 'win-n2',
  tags: [],
  rows: [
    'O......',
    '.......',
    '.......',
    '......t',
    '.......',
    '.......',
    '.......',
    '....O..',
    '.......',
    '.......',
    '.......',
    '..O...O',
    '.......',
    '.......',
    '.......',
    '.......',
    '......O',
  ],
};
const Lwin_n2b: PixelSprite = {
  id: 'win-n2b',
  name: 'win-n2b',
  tags: [],
  rows: [
    '....O....',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '........t',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    'O........',
  ],
};
const Lwin_n3: PixelSprite = {
  id: 'win-n3',
  name: 'win-n3',
  tags: [],
  rows: [
    '...O',
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
    'O...',
  ],
};
const Lwin_n4: PixelSprite = {
  id: 'win-n4',
  name: 'win-n4',
  tags: [],
  rows: [
    '...O...',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '......t',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    'O......',
  ],
};
const Lwin_n5: PixelSprite = {
  id: 'win-n5',
  name: 'win-n5',
  tags: [],
  rows: [
    '....O',
    '.....',
    '.....',
    't....',
  ],
};
const Lwin_n6: PixelSprite = {
  id: 'win-n6',
  name: 'win-n6',
  tags: [],
  rows: [
    'O.....O',
    '.......',
    '.......',
    '.......',
    '....t..',
    '.......',
    '.......',
    '..O....',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '......O',
    '.......',
    '..p....',
  ],
};
const Lwin_n6b: PixelSprite = {
  id: 'win-n6b',
  name: 'win-n6b',
  tags: [],
  rows: [
    '......O',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    'O......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '..t....',
  ],
};
const Lwin_n7: PixelSprite = {
  id: 'win-n7',
  name: 'win-n7',
  tags: [],
  rows: [
    '...O',
    '....',
    '....',
    '....',
    '....',
    '....',
    'O...',
  ],
};
const Lticker: PixelSprite = {
  id: 'ticker',
  name: 'ticker',
  tags: [],
  rows: [
    'KKtKKKt',
    'KtKtKtK',
    'tKKKtKK',
  ],
  frameMs: 1200,
  frames: [
    [
      'KKtKKKt',
      'KtKtKtK',
      'tKKKtKK',
    ],
    [
      'KtKKKtK',
      'tKtKtKt',
      'KKKtKKK',
    ],
    [
      'tKKKtKK',
      'KtKtKtK',
      'KKtKKKt',
    ],
    [
      'KKKtKKK',
      'tKtKtKt',
      'KtKKKtK',
    ],
  ],
};
const Lbeacon_n2: PixelSprite = {
  id: 'beacon-n2',
  name: 'beacon-n2',
  tags: [],
  rows: [
    'r',
  ],
  frameMs: 1600,
  frames: [
    [
      'r',
    ],
    [
      'K',
    ],
  ],
};
const Lbeacon_n6: PixelSprite = {
  id: 'beacon-n6',
  name: 'beacon-n6',
  tags: [],
  rows: [
    'r',
  ],
  frameMs: 1600,
  frames: [
    [
      'K',
    ],
    [
      'r',
    ],
  ],
};
const Lstar_a: PixelSprite = {
  id: 'star-a',
  name: 'star-a',
  tags: [],
  rows: [
    'D',
  ],
};
const Lstar_b: PixelSprite = {
  id: 'star-b',
  name: 'star-b',
  tags: [],
  rows: [
    'D',
  ],
};
const Lstar_c: PixelSprite = {
  id: 'star-c',
  name: 'star-c',
  tags: [],
  rows: [
    'D',
  ],
};
const Lhaze_a: PixelSprite = {
  id: 'haze-a',
  name: 'haze-a',
  tags: [],
  rows: [
    '....kkkkkkkk.....kkkkkk....',
    '.kkkkkkkkkkkkkkkkkkkkkkkkk.',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkk',
    '.KKKKKKKKKKKKKKKKKKKKKKKKK.',
  ],
};
const Lhaze_b: PixelSprite = {
  id: 'haze-b',
  name: 'haze-b',
  tags: [],
  rows: [
    '...kkkkkk.....',
    '.kkkkkkkkkkkk.',
    'kkkkkkkkkkkkkk',
    '.KKKKKKKKKKKK.',
  ],
};
const Lrise_a: PixelSprite = {
  id: 'rise-a',
  name: 'rise-a',
  tags: [],
  rows: [
    't',
    'n',
  ],
};
const Lrise_b: PixelSprite = {
  id: 'rise-b',
  name: 'rise-b',
  tags: [],
  rows: [
    'p',
    'E',
  ],
};
const Lrise_c: PixelSprite = {
  id: 'rise-c',
  name: 'rise-c',
  tags: [],
  rows: [
    't',
    'n',
  ],
};
const Lpulse_a: PixelSprite = {
  id: 'pulse-a',
  name: 'pulse-a',
  tags: [],
  rows: [
    '........................',
    't.......................',
    '........................',
  ],
  frameMs: 500,
  frames: [
    [
      '........................',
      't.......................',
      '........................',
    ],
    [
      '.n......................',
      '..nt....................',
      '........................',
    ],
    [
      '........................',
      '....nnt.................',
      '........................',
    ],
    [
      '........................',
      '.......n.t..............',
      '........n...............',
    ],
    [
      '........................',
      '..........nnt...........',
      '........................',
    ],
    [
      '..............n.........',
      '.............n.t........',
      '........................',
    ],
    [
      '........................',
      '................nnt.....',
      '........................',
    ],
    [
      '........................',
      '...................nn...',
      '.....................t..',
    ],
  ],
};
const Lpulse_b: PixelSprite = {
  id: 'pulse-b',
  name: 'pulse-b',
  tags: [],
  rows: [
    't.......................',
    '........................',
    '........................',
  ],
  frameMs: 500,
  frames: [
    [
      't.......................',
      '........................',
      '........................',
    ],
    [
      '........................',
      '.nnt....................',
      '........................',
    ],
    [
      '........................',
      '....nnt.................',
      '........................',
    ],
    [
      '........................',
      '.........t..............',
      '.......nn...............',
    ],
    [
      '........................',
      '..........nnt...........',
      '........................',
    ],
    [
      '.............n..........',
      '..............nt........',
      '........................',
    ],
    [
      '........................',
      '................nnt.....',
      '........................',
    ],
    [
      '........................',
      '....................nt..',
      '...................n....',
    ],
  ],
};
const Lpulse_c: PixelSprite = {
  id: 'pulse-c',
  name: 'pulse-c',
  tags: [],
  rows: [
    '........................',
    't.......................',
    '........................',
  ],
  frameMs: 500,
  frames: [
    [
      '........................',
      't.......................',
      '........................',
    ],
    [
      '........................',
      '.nnt....................',
      '........................',
    ],
    [
      '........................',
      '....n.t.................',
      '.....n..................',
    ],
    [
      '........................',
      '.......nnt..............',
      '........................',
    ],
    [
      '............t...........',
      '..........nn............',
      '........................',
    ],
    [
      '........................',
      '.............nnt........',
      '........................',
    ],
    [
      '........................',
      '................nn......',
      '..................t.....',
    ],
    [
      '........................',
      '....................nt..',
      '...................n....',
    ],
  ],
};
export const qaBackdrop: SceneArt = {
  id: 'qa-backdrop',
  label: 'A dark city skyline at night with a few lit windows and a faint stream of market data along the ground.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: Lwin_n1, x: 6, y: 28, motion: { kind: 'twinkle', periodMs: 6000, min: 0.4, phase: 0.2 } },
    { sprite: Lwin_n2, x: 16, y: 18, motion: { kind: 'twinkle', periodMs: 6400, min: 0.35, phase: 0.1 } },
    { sprite: Lwin_n2b, x: 16, y: 12, motion: { kind: 'twinkle', periodMs: 7800, min: 0.3, phase: 0.6 } },
    { sprite: Lwin_n3, x: 34, y: 26, motion: { kind: 'twinkle', periodMs: 6900, min: 0.35, phase: 0.9 } },
    { sprite: Lwin_n4, x: 49, y: 20, motion: { kind: 'twinkle', periodMs: 5600, min: 0.35, phase: 0.3 } },
    { sprite: Lwin_n5, x: 68, y: 32, motion: { kind: 'twinkle', periodMs: 7400, min: 0.35, phase: 0.55 } },
    { sprite: Lwin_n6, x: 85, y: 20, motion: { kind: 'twinkle', periodMs: 7000, min: 0.35, phase: 0.8 } },
    { sprite: Lwin_n6b, x: 83, y: 16, motion: { kind: 'twinkle', periodMs: 8000, min: 0.3, phase: 0.45 } },
    { sprite: Lwin_n7, x: 100, y: 28, motion: { kind: 'twinkle', periodMs: 6800, min: 0.4, phase: 0.7 } },
    { sprite: Lticker, x: 34, y: 29 },
    { sprite: Lbeacon_n2, x: 21, y: 6 },
    { sprite: Lbeacon_n6, x: 89, y: 5 },
    { sprite: Lstar_a, x: 12, y: 4, motion: { kind: 'twinkle', periodMs: 5200, min: 0.3, phase: 0.2 } },
    { sprite: Lstar_b, x: 41, y: 6, motion: { kind: 'twinkle', periodMs: 6100, min: 0.3, phase: 0.7 } },
    { sprite: Lstar_c, x: 98, y: 3, motion: { kind: 'twinkle', periodMs: 4700, min: 0.3, phase: 0.4 } },
    { sprite: Lhaze_a, x: 33, y: 9, motion: { kind: 'drift', amp: 4, periodMs: 8000, phase: 0.0 } },
    { sprite: Lhaze_b, x: 96, y: 10, motion: { kind: 'drift', amp: 2, periodMs: 7000, phase: 0.5 } },
    { sprite: Lrise_a, x: 46, y: 33, motion: { kind: 'rise', amp: 7, periodMs: 6000, phase: 0.0 } },
    { sprite: Lrise_b, x: 79, y: 34, motion: { kind: 'rise', amp: 6, periodMs: 7200, phase: 0.5 } },
    { sprite: Lrise_c, x: 12, y: 33, motion: { kind: 'rise', amp: 6, periodMs: 6600, phase: 0.25 } },
    { sprite: Lpulse_a, x: 4, y: 40 },
    { sprite: Lpulse_b, x: 44, y: 40 },
    { sprite: Lpulse_c, x: 84, y: 40 },
  ],
};
