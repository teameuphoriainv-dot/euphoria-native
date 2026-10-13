/**
 * Personal Finance lesson 14, Renting vs. Buying a Home: two front doors, one key.
 *
 * A new set, the street at nightfall: on the left a grey rented block under a flat cornice, its teal
 * door signed RENT; on the right a teal house under a gable, its orchid door signed BUY. Between them,
 * behind a planter of flowers, the figure holds up a key, the decision the lesson's 5% rule weighs. The
 * cat sits on the pavement in front of the planter, midway between the doors, taking neither side.
 * Moving: a glint on the key, both porch lamps, a moth at one of them, two stars, the cat's tail.
 */
import type { PixelSprite } from '../types';
import { pfCompose, pfSparkle } from './pf-kit';
import { pfCatSit } from './pf-kit-a';
import { pfMoon, pfSaverRaise, pfStar, pfText } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/**
 * The street: sky over the left block's flat cornice and the right house's gable, grey clapboard on
 * the left, teal on the right, the pavement in slabs, the kerb and the road.
 */
function street(): string[] {
  return Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y >= 57) return y === 57 ? 'X' : 'K';
      if (y >= 47) return x % 12 === 0 ? 'K' : 'D';
      const sky = y < 2 ? 'E' : 'p';
      if (x < 40) {
        if (y < 4) return sky;
        if (y === 4) return 'X';
        if (y === 5) return 'D';
        if (y === 6) return 'K';
        return (y - 7) % 3 === 2 ? 'K' : 'D';
      }
      const half = Math.abs(x - 60);
      if (y < 7) {
        if (half > y * 3 + 2) return sky;
        if (half >= y * 3) return 'X';
        return y % 2 ? 'K' : 'k';
      }
      if (y === 7) return 'X';
      return (y - 8) % 3 === 2 ? 'K' : 't';
    }).join(''),
  );
}

/** A panelled front door 16x28 (pf6's, shorter), recoloured by `paint`: casing, panels, mail slot, knob. */
const DOOR = [
  'DDDDDDDDDDDDDDDD',
  'DXXXXXXXXXXXXXXD',
  'DXEEEEEEEEEEEEXD',
  'DXEppppppppppEXD',
  'DXEpEEEEEEEEpEXD',
  'DXEpEqPPPPPEpEXD',
  'DXEpEPPPPPPEpEXD',
  'DXEpEPPPPPPEpEXD',
  'DXEpEPPPPPPEpEXD',
  'DXEpEEEEEEEEpEXD',
  'DXEppppppppppEXD',
  'DXEppOOOOOOppEXD',
  'DXEppOKKKKOppEXD',
  'DXEppOGGGGOppEXD',
  'DXEppppppppppEXD',
  'DXEpppppppyGpEXD',
  'DXEppppppppOpEXD',
  'DXEppppppppppEXD',
  'DXEpEEEEEEEEpEXD',
  'DXEpEqPPPPPEpEXD',
  'DXEpEPPPPPPEpEXD',
  'DXEpEPPPPPPEpEXD',
  'DXEpEPPPPPPEpEXD',
  'DXEpEPPPPPPEpEXD',
  'DXEpEEEEEEEEpEXD',
  'DXEppppppppppEXD',
  'DXEEEEEEEEEEEEXD',
  'DDDDDDDDDDDDDDDD',
];
function door(id: string, paint: Record<string, string>): PixelSprite {
  return { id, name: id, tags: ['scene', 'pf'], rows: DOOR.map((row) => row.replace(/[EpPq]/g, (ch) => paint[ch] ?? ch)) };
}

/** A board hung from two hooks under the eaves, `body` with a lit top and left edge; its word is stamped on it. */
function signBoard(id: string, lit: string, body: string, shade: string): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: [
      '..X.............X..',
      '..X.............X..',
      lit.repeat(18) + shade,
      ...Array.from({ length: 7 }, () => lit + body.repeat(17) + shade),
      shade.repeat(19),
    ],
  };
}

/** A porch lamp on the wall, and its halo for a twinkle. */
const sconce: PixelSprite = {
  id: 'pf14-sconce',
  name: 'sconce',
  tags: ['scene', 'pf'],
  rows: [
    '.GyG.',
    'GyWyG',
    '.GyG.',
    '..O..',
    '.OOO.',
  ],
};

const sconceHalo: PixelSprite = {
  id: 'pf14-sconce-halo',
  name: 'sconce halo',
  tags: ['scene', 'pf'],
  rows: [
    '..g.g..',
    '.g...g.',
    'g.....g',
    '.g...g.',
    '..g.g..',
  ],
};

/** A moth fluttering at the lamp. */
const moth: PixelSprite = {
  id: 'pf14-moth',
  name: 'moth',
  tags: ['scene', 'pf'],
  rows: ['x.x', '.w.'],
  frames: [
    ['x.x', '.w.'],
    ['...', 'xwx'],
  ],
  frameMs: 450,
};

/** The key held up: blade pointing to the sky, the bow in the fist (the fist covers its last two rows). */
const key: PixelSprite = {
  id: 'pf14-key',
  name: 'key',
  tags: ['scene', 'pf'],
  rows: [
    '..y..',
    '..GG.',
    '..G..',
    '..GG.',
    '..G..',
    '.OGO.',
    'OGyGO',
    'G.K.g',
    'OGGgO',
  ],
};

/** A wooden planter along the pavement, flowers over its leaves. */
const planter: PixelSprite = {
  id: 'pf14-planter',
  name: 'planter',
  tags: ['scene', 'pf'],
  rows: [
    '..R....F....y....P....R....F....',
    '.RyR..FyF..yGy..PyP..RyR..FyF...',
    '..R....F....y....P....R....F....',
    'nNNnnNNnnNNnnNNnnNNnnNNnnNNnnNNn',
    'nNnnnNnnnNnnnNnnnNnnnNnnnNnnnNnn',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGO',
    'OggggggggggggggggggggggggggggggO',
    'OgOOOOOOOOOOOOOOOOOOOOOOOOOOOOgO',
    'OggggggggggggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/**
 * Lesson 14's emblem: the two homes side by side, each with its own roof line: the rented block under
 * a flat cornice with its teal door, and the bought house under a gable with its orchid door.
 */
const emblemDoors: PixelSprite = {
  id: 'pf14-emblem-doors',
  name: 'pf14-emblem-doors',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    'xxxxxx....xX..',
    'XXXXXX...xxXX.',
    'XtTTtX..xxxXXX',
    'XtTTtX..XpPPpX',
    'XtttyX..XpppyX',
    'XtTTtX..XpPPpX',
    'XtTTtX..XpPPpX',
    'XttttX..XppppX',
    'xxxxxx..xxxxxx',
  ],
};

// Order is depth: doors and signs on the facades, the figure behind the planter, the key in its fist.
const base = pfCompose('pf14-opener-base', 80, 60, street(), [
  [pfMoon, 75, 0],
  [door('pf14-door-rent', { E: 'K', p: 't', P: 'T', q: 'm' }), 3, 18],
  [door('pf14-door-buy', {}), 61, 18],
  [signBoard('pf14-sign-rent', 'B', 'b', 'b'), 1, 5],
  [pfText('pf14-rent', 'RENT', 'w'), 3, 9],
  [signBoard('pf14-sign-buy', 'y', 'G', 'g'), 59, 7],
  [pfText('pf14-buy', 'BUY', 'K'), 63, 11],
  [sconce, 21, 23],
  [sconce, 54, 23],
  [{ id: 'pf14-step-rent', name: 'step', tags: ['scene', 'pf'], rows: ['x'.repeat(18)] }, 2, 46],
  [{ id: 'pf14-step-buy', name: 'step', tags: ['scene', 'pf'], rows: ['x'.repeat(18)] }, 60, 46],
  [key, 46, 7],
  [pfSaverRaise, 30, 12],
  [planter, 24, 36],
]);

export const pf14Opener: SceneArt = {
  id: 'pf14-opener',
  label: 'On a street at nightfall, a person holds up a key between two front doors, a teal one signed rent on a grey block and an orchid one signed buy on a house with a gabled roof, behind a planter of flowers, with the cat sitting in front of the planter between them.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pfSparkle, x: 49, y: 2, motion: { kind: 'twinkle', periodMs: 1700, min: 0.35 } },
    { sprite: sconceHalo, x: 20, y: 22, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: sconceHalo, x: 53, y: 22, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3, phase: 0.5 } },
    { sprite: moth, x: 57, y: 20, motion: { kind: 'drift', amp: 2, periodMs: 1800 } },
    { sprite: pfStar, x: 30, y: 1, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: pfStar, x: 46, y: 2, motion: { kind: 'twinkle', periodMs: 3100, min: 0.2, phase: 0.5 } },
    // The cat sits on the pavement in front of the planter, midway between the two doors.
    { sprite: pfCatSit, x: 34, y: 40 },
  ],
};

export const pf14Finish = pfKeepsake(
  'pf14-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing two homes side by side, a flat-topped block with a teal door and a gabled house with an orchid door, with small sparkles around it.',
  emblemDoors,
);

export const art: LessonArtSet = { opener: pf14Opener, backdrop: pfBackdrop, finish: pf14Finish };
