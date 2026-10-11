/**
 * Wealth Management lesson 1 keepsake, and the pathway's keepsake SHAPE: a heraldic crest. A green
 * heater shield with a two-pixel gold rim lit from the upper left, laurel sprigs behind it, an
 * orchid banner across its point. The shield, laurel and banner are one still base shared by every
 * lesson; the EMBLEM is a layer centred in the field, so lessons 2 to 25 swap only the emblem
 * (a 14x13 kit sprite, wm-kit.ts) through wmKeepsake. Lesson 1 carries the house of five pillars.
 * What moves: a glint runs up the lit rim and along the top, two twinkles flash out of step, gold
 * coins rise either side. For the lesson-complete screen at 3pt per pixel.
 */
import type { PixelSprite } from '../types';
import type { SceneArt } from './types';
import {
  wmBands,
  wmCoinMote,
  wmCompose,
  wmEmblemPillars,
  wmLater,
  wmMirror,
  wmTwinkle,
  WM_INKS,
} from './wm-kit';

/** The shield, 26x30. Its field is H with a lighter n corner where the light falls. */
const shield: PixelSprite = {
  id: 'wm-crest-shield',
  name: 'wm-crest-shield',
  tags: [],
  palette: WM_INKS,
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OyyyyyyyyyyyyyyyyyyygggggO',
    'OyGGGGGGGGGGGGGGGGGGgggggO',
    'OyGOOOOOOOOOOOOOOOOOOOOggO',
    'OyGOnnnnnnnHHHHHHHHHHHOggO',
    'OyGOnnnnnnHHHHHHHHHHHHOggO',
    'OyGOnnnnnHHHHHHHHHHHHHOggO',
    'OyGOnnnnHHHHHHHHHHHHHHOggO',
    'OyGOnnnHHHHHHHHHHHHHHHOggO',
    'OyGOnnHHHHHHHHHHHHHHHHOggO',
    'OyGOnHHHHHHHHHHHHHHHHHOggO',
    'OyGOHHHHHHHHHHHHHHHHHHOggO',
    'OyGOHHHHHHHHHHHHHHHHHHOggO',
    'OyGOHHHHHHHHHHHHHHHHHHOggO',
    'OyGOHHHHHHHHHHHHHHHHHHOggO',
    'OyGOHHHHHHHHHHHHHHHHHHOggO',
    'OyGOHHHHHHHHHHHHHHHHHHOggO',
    'OyGOHHHHHHHHHHHHHHHHHHOggO',
    'OyGOHHHHHHHHHHHHHHHHHHOggO',
    '.OyGOHHHHHHHHHHHHHHHHOggO.',
    '.OyGOHHHHHHHHHHHHHHHHOggO.',
    '..OyGOHHHHHHHHHHHHHHOggO..',
    '...OyGOHHHHHHHHHHHHOggO...',
    '....OyGOHHHHHHHHHHOggO....',
    '.....OGgOHHHHHHHHOggO.....',
    '......OGgOHHHHHHOggO......',
    '........OggOHHOggO........',
    '.........OggOOggO.........',
    '...........OggO...........',
    '............OO............',
  ],
};

/** A laurel sprig for the shield's left side; the right one is its mirror. 11x28. */
const laurel: PixelSprite = {
  id: 'wm-crest-laurel',
  name: 'wm-crest-laurel',
  tags: [],
  rows: [
    '......mN...',
    '......n....',
    '..m...n....',
    '..NN.n.....',
    '...Nnn.m...',
    '.....nNN...',
    '....nnN....',
    '.m..n......',
    '.NN.n......',
    '..Nnn.m....',
    '...n.NN....',
    '...nnN.....',
    'm..n.......',
    'NN.n.......',
    '.Nnn...m...',
    '...n..NN...',
    '....nnN....',
    '..m.n......',
    '..NNn......',
    '...Nnn...m.',
    '.....n..NN.',
    '......nnN..',
    '....m.n....',
    '....NN.n...',
    '.....Nnn...',
    '........n..',
    '.........n.',
    '..........n',
  ],
};

/** The banner: a front band over two notched tails folded behind it. 42x9. */
const banner: PixelSprite = {
  id: 'wm-crest-banner',
  name: 'wm-crest-banner',
  tags: [],
  rows: [
    '......EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE......',
    '......EqqqqqqqqqqqqqqqqqqqqqqqqqqqqE......',
    'EEEEE.EPPPPPPPPPPPPPPPPPPPPPPPPPPPPE.EEEEE',
    'EppppEEPPPPPPPPPPPPPPPPPPPPPPPPPPPPEEppppE',
    '.EpppEEPPPPPPPPPPPPPPPPPPPPPPPPPPPPEEpppE.',
    '..EppEEppppppppppppppppppppppppppppEEppE..',
    '.EpppE.EEEEEEEEEEEEEEEEEEEEEEEEEEEE.EpppE.',
    'EppEpE..............................EpEppE',
    'EE..EE..............................EE..EE',
  ],
};

/** The crest's still base, shared by every lesson's keepsake. Laurel first, so the shield covers its stems. */
const crest = wmCompose('wm-crest', wmBands(48, [['.', 40]]), [
  { sprite: laurel, x: 1, y: 6 },
  { sprite: wmMirror(laurel, 'wm-crest-laurel-right'), x: 36, y: 6 },
  { sprite: shield, x: 11, y: 2 },
  { sprite: banner, x: 3, y: 29 },
]);

/** Where the glint is, frame by frame: up the lit left rim, then along the top. */
const GLINT_PATH: readonly (readonly [number, number])[] = [
  ...[18, 16, 14, 12, 10, 8, 6, 4, 2].map((y) => [1, y] as const),
  ...[3, 5, 7, 9, 11, 13, 15, 17, 19, 21].map((x) => [x, 1] as const),
];

/** The shield's box with a two-pixel glint at x, y trailing along the rim it is running on. */
function glintAt(x: number, y: number): string[] {
  const rows = wmBands(26, [['.', 30]]).map((row) => [...row]);
  rows[y][x] = 'W';
  if (y === 1) rows[y][x - 1] = 'w';
  else rows[y + 1][x] = 'w';
  return rows.map((row) => row.join(''));
}

const unlitShield = wmBands(26, [['.', 30]]);

/** A glint running up the lit rim and along the top of the shield, then a rest. Laid over the shield. */
const rimGlint: PixelSprite = {
  id: 'wm-crest-rim-glint',
  name: 'wm-crest-rim-glint',
  tags: [],
  rows: unlitShield,
  frames: [...GLINT_PATH.map(([x, y]) => glintAt(x, y)), ...Array.from({ length: 8 }, () => unlitShield)],
  frameMs: 120,
};

const twinkleLater = wmLater(wmTwinkle, 'wm-crest-twinkle-later', 2, 410);

/** The largest emblem the field takes, and where its box sits in the scene. */
const EMBLEM_W = 14;
const EMBLEM_H = 13;
const EMBLEM_CENTRE_X = 24;
const EMBLEM_TOP = 9;

/**
 * A lesson's keepsake: the crest with `emblem` centred in its field. A kit emblem larger than
 * 14x13 would cover the rim, so it throws at load rather than ship a crest with a broken edge.
 */
export function wmKeepsake(id: string, emblem: PixelSprite, label: string): SceneArt {
  const w = emblem.rows[0]?.length ?? 0;
  const h = emblem.rows.length;
  if (w > EMBLEM_W || h > EMBLEM_H) {
    throw new Error(`wmKeepsake ${id}: emblem ${emblem.id} is ${w}x${h}, the crest field takes ${EMBLEM_W}x${EMBLEM_H}`);
  }
  return {
    id,
    label,
    width: 48,
    height: 40,
    base: crest,
    layers: [
      { sprite: emblem, x: Math.round(EMBLEM_CENTRE_X - w / 2), y: EMBLEM_TOP + Math.floor((EMBLEM_H - h) / 2) },
      { sprite: rimGlint, x: 11, y: 2 },
      { sprite: wmTwinkle, x: 2, y: 1, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
      { sprite: twinkleLater, x: 41, y: 10, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.5, min: 0.4 } },
      { sprite: wmCoinMote, x: 5, y: 24, motion: { kind: 'rise', amp: 6, periodMs: 2400, phase: 0.1 } },
      { sprite: wmCoinMote, x: 41, y: 22, motion: { kind: 'rise', amp: 5, periodMs: 2800, phase: 0.6 } },
      { sprite: wmCoinMote, x: 44, y: 31, motion: { kind: 'rise', amp: 4, periodMs: 2000, phase: 0.35 } },
    ],
  };
}

export const wm1Finish: SceneArt = wmKeepsake(
  'wm1-finish',
  wmEmblemPillars,
  'A green crest with a gold rim bearing a house of five pillars, framed by laurel over a purple banner, with sparkles around it.',
);
