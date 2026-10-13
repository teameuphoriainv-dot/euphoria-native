/**
 * Personal Finance lesson 18, Financial Planning for Life Events: save for the big moments before they come.
 *
 * A new set, the nursery, ready before the baby is: an empty crib with a teddy waiting in it and a
 * mobile turning over it, star-sprigged wallpaper, and on the wall the life events so far, framed:
 * the wedding's two rings and the house. On the dresser stands the college fund the lesson starts at
 * birth, a tall jar in a mortarboard with 529 on its label, and the figure reaches up to feed it.
 * Moving: the coin, the mobile, the night-light, a glint on the mortarboard, the cat's z.
 */
import type { PixelSprite } from '../types';
import { pfCat, pfCoinDrop, pfCompose, pfKitchen, pfSparkle, pfZzz } from './pf-kit';
import { pfSaverRaise, pfText } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** The kitchen's room with a nursery's wallpaper: a sprig of a star every ten columns, rows offset. */
function nurseryRoom(): string[] {
  return pfKitchen.rows.map((row, y) =>
    [...row].map((ch, x) => (y < 45 && y % 8 === 3 && (x + (y % 16 === 3 ? 0 : 5)) % 10 === 4 ? 'D' : ch)).join(''),
  );
}

/**
 * The wedding in a gilt frame: two rings clearly linked, a gold band and a white-gold one with its
 * stone catching the light, the gold passing over the white at the top and under it at the bottom.
 */
const ringsPicture: PixelSprite = {
  id: 'pf18-rings-picture',
  name: 'rings picture',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOOO',
    'OgggggggggggO',
    'OgEEEEEEEEEgO',
    'OgEyyGEWEEEgO',
    'OgyEEEGwxEEgO',
    'OgGEEwGEExEgO',
    'OgGEExGEExEgO',
    'OgEGGxEEExEgO',
    'OgEEEExxxEEgO',
    'OgggggggggggO',
    'OOOOOOOOOOOOO',
  ],
};

/** The house they bought, in the same frame: blue sky, a red roof, a lit window, the lawn. */
const housePicture: PixelSprite = {
  id: 'pf18-house-picture',
  name: 'house picture',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOOO',
    'OgggggggggggO',
    'OgBBBBrBBBBgO',
    'OgBBBrrrBBBgO',
    'OgBBrrrrrBBgO',
    'OgBrrrrrrrBgO',
    'OgBBwwwwwBBgO',
    'OgBBwDOywBBgO',
    'OgnnwwOwwnngO',
    'OgggggggggggO',
    'OOOOOOOOOOOOO',
  ],
};

/** A chest of drawers at any width, three tiers of two drawers with gold knobs, on short feet. */
function dresser(width: number): PixelSprite {
  const half = (width - 3) / 2;
  const tier = (face: string, knob: boolean) => {
    const drawer = knob ? face.repeat(half / 2 - 0.5) + 'y' + face.repeat(half / 2 - 0.5) : face.repeat(half);
    return 'O' + drawer + 'O' + drawer + 'O';
  };
  const drawerTier = [tier('G', false), tier('g', true), tier('g', false), 'O'.repeat(width)];
  return {
    id: `pf18-dresser-${String(width)}`,
    name: 'dresser',
    tags: ['scene', 'pf'],
    rows: [
      '.' + 'O'.repeat(width - 2) + '.',
      'O' + 'g'.repeat(width - 2) + 'O',
      'O' + 'G'.repeat(width - 2) + 'O',
      'O'.repeat(width),
      ...drawerTier,
      ...drawerTier,
      ...drawerTier,
      'OO' + '.'.repeat(width - 4) + 'OO',
    ],
  };
}

/**
 * The college fund: a tall jar of coins wearing a mortarboard, the slot in the board at columns 7
 * and 8 of row 1, a white label (columns 1 to 13, rows 8 to 14) for the plan's number, and the
 * mortarboard's gold tassel hanging down its left side.
 */
const collegeJar: PixelSprite = {
  id: 'pf18-college-jar',
  name: 'college jar',
  tags: ['scene', 'pf'],
  rows: [
    '....EEEEEEE....',
    '..EEPPPKKPPPE..',
    'EEqPPPPPPPPPPEE',
    '.yEEEEEEEEEEEE.',
    '.y..EpppppE....',
    '.G.xxxxxxxxX...',
    'xgwGyGgGyGgGgX.',
    'xwGgGyGgGgGyGgX',
    'xwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwX',
    'xGgGyGgGgGyGgGX',
    '.xxxxxxxxxxxXX.',
  ],
};

/** A baby's bottle of milk, its teat up. */
const bottle: PixelSprite = {
  id: 'pf18-bottle',
  name: 'bottle',
  tags: ['scene', 'pf'],
  rows: [
    '..y..',
    '.yGy.',
    'BBBBb',
    'xwwwX',
    'xwxwX',
    'xwwwX',
    'xwxwX',
    'xwwwX',
    '.xxX.',
  ],
};

/** The teddy that waits in the crib, sat on the blanket behind the slats. */
const teddy: PixelSprite = {
  id: 'pf18-teddy',
  name: 'teddy',
  tags: ['scene', 'pf'],
  rows: [
    '.O.....O.',
    'OgOOOOOgO',
    '.OGGGGGO.',
    '.OGKgKgO.',
    '.OgyKygO.',
    '..OgggO..',
    'OgOGggOgO',
    '.OgyyygO.',
    'OgO...OgO',
  ],
};

/** The crib's mattress under a lavender blanket, seen between the slats. */
const blanket: PixelSprite = {
  id: 'pf18-blanket',
  name: 'blanket',
  tags: ['scene', 'pf'],
  rows: [
    'qqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
  ],
};

/**
 * A white crib, 33 wide: corner posts with finials, a top rail, slats every third column with even
 * gaps (the blanket and the teddy show between them), a bottom rail and panel, and legs to the floor.
 */
function crib(): PixelSprite {
  const W = 33;
  return {
    id: 'pf18-crib',
    name: 'crib',
    tags: ['scene', 'pf'],
    rows: Array.from({ length: 23 }, (_, y) =>
      Array.from({ length: W }, (_, x) => {
        const post = x <= 1 || x >= W - 2;
        const postCh = x === 0 || x === W - 2 ? 'w' : 'X';
        if (y <= 1) return post ? postCh : '.';
        if (y === 2 || y === 14) return x === W - 1 ? 'X' : 'w';
        if (y === 3 || y === 15) return post ? postCh : 'x';
        if (y <= 13) return post ? postCh : x % 3 === 1 ? 'x' : '.';
        if (y === 16) return post ? postCh : 'X';
        if (y <= 21) return post ? postCh : '.';
        return post ? 'X' : '.';
      }).join(''),
    ),
  };
}

/**
 * The mobile, hung from the ceiling on a cord: a bar with a moon, a star and a heart. It sways as a
 * whole (the cord runs to the scene's top edge, so the swing never shows a gap) and the star glints.
 */
const MOBILE_CORD = Array.from({ length: 17 }, () => '.......x.......');
const MOBILE_REST = [
  ...MOBILE_CORD,
  '.wwwwwwwwwwwww.',
  '..x....x....x..',
  '..x....x....x..',
  '.yy....y...RxR.',
  '.y....yGy..RRR.',
  '.yy....y....R..',
];
const MOBILE_GLINT = [
  ...MOBILE_CORD,
  '.wwwwwwwwwwwww.',
  '..x....x....x..',
  '..x...wxw...x..',
  '.yy...wyw..RxR.',
  '.y...yyWyy.RRR.',
  '.yy...wyw...R..',
];
const mobile: PixelSprite = {
  id: 'pf18-mobile',
  name: 'mobile',
  tags: ['scene', 'pf'],
  rows: MOBILE_REST,
  frames: [MOBILE_REST, MOBILE_REST, MOBILE_GLINT],
  frameMs: 700,
};

/** A star night-light plugged in by the skirting, and its halo for a slow twinkle. */
const nightLight: PixelSprite = {
  id: 'pf18-night-light',
  name: 'night light',
  tags: ['scene', 'pf'],
  rows: [
    '.y.',
    'yWy',
    'DyD',
  ],
};
const nightGlow: PixelSprite = {
  id: 'pf18-night-glow',
  name: 'night glow',
  tags: ['scene', 'pf'],
  rows: [
    '..g..',
    '.....',
    'g...g',
  ],
};

/** Lesson 18's emblem: the pram the plan is for, a blue hood and body on two wheels, its handle up. */
const emblemPram: PixelSprite = {
  id: 'pf18-emblem-pram',
  name: 'pf18-emblem-pram',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '.bbbb........w',
    'bBBBBb......w.',
    'bBBBBBb....w..',
    'bBBBBBBwwwwww.',
    'bBBBBBBBBBBBb.',
    '.bBBBBBBBBBb..',
    '..bbbbbbbbb...',
    '..xXx...xXx...',
    '..XxX...XxX...',
  ],
};

// Order is depth: the pictures, the figure, the dresser over its lower half, the jar on the dresser
// in front of its arm, then the crib with the blanket and the teddy stamped first, under the slats.
const base = pfCompose('pf18-opener-base', 80, 60, nurseryRoom(), [
  [ringsPicture, 3, 1],
  [housePicture, 18, 1],
  [pfSaverRaise, 8, 12],
  [dresser(37), 3, 36],
  [collegeJar, 19, 21],
  [pfText('pf18-plan-number', '529', 'E'), 21, 30],
  [bottle, 34, 29],
  [nightLight, 41, 38],
  [blanket, 47, 41],
  [teddy, 57, 34],
  [crib(), 45, 30],
  [pfCat, 40, 51],
]);

export const pf18Opener: SceneArt = {
  id: 'pf18-opener',
  label: 'In a nursery made ready for a baby, a person drops a coin into a tall jar labelled 529 that wears a graduation cap, beside an empty crib with a teddy bear and a turning mobile, with wedding rings and a house framed on the wall and the cat asleep under the crib.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The coin hangs from the raised hand (figure at 8,12; hand at columns 17 to 19, rows 2 and 3)
    // over the slot in the mortarboard (jar at 19,21; slot at columns 7 and 8 of row 1).
    { sprite: pfCoinDrop, x: 25, y: 15 },
    { sprite: mobile, x: 54, y: 0, motion: { kind: 'drift', amp: 1, periodMs: 4200 } },
    { sprite: nightGlow, x: 40, y: 36, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: pfSparkle, x: 33, y: 19, motion: { kind: 'twinkle', periodMs: 1900, min: 0.35, phase: 0.4 } },
    { sprite: pfZzz, x: 40, y: 45, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf18Finish = pfKeepsake(
  'pf18-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a blue baby pram, with small sparkles around it.',
  emblemPram,
);

export const art: LessonArtSet = { opener: pf18Opener, backdrop: pfBackdrop, finish: pf18Finish };
