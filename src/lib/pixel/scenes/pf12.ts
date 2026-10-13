/**
 * Personal Finance lesson 12, The Psychology of Spending: two voices, and the rule that settles them.
 *
 * A new set, a store aisle: shelves of bright boxes, a SALE sign hung over them, a deal tag. The
 * figure stands behind an empty cart holding up an hourglass, the lesson's 24-hour rule, while two
 * thoughts take turns over its head: a red ! (the emotional brain, buy it now) and a blue ? (the
 * rational one, do I need this). Moving: the two thoughts in turn, the hourglass's sand, the sign's
 * bulbs, a glint by the deal tag.
 */
import type { PixelSprite } from '../types';
import { pfCompose, pfSparkle } from './pf-kit';
import { pfBlock, pfSaverHold } from './pf-kit-a';
import { pfText } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** Box colours along a shelf, light top then body, repeating; each box is 4 wide with a gap. */
const BOXES = [['R', 'r'], ['B', 'b'], ['G', 'g'], ['N', 'n'], ['F', 'f'], ['q', 'P'], ['T', 't']] as const;

/** A store shelf unit `width` wide: an upright at each end and four shelves of boxes, 9 rows apart. */
function shelfUnit(id: string, width: number, start: number): PixelSprite {
  const rows: string[] = [];
  for (let shelf = 0; shelf < 4; shelf++) {
    for (let r = 0; r < 9; r++) {
      rows.push(
        Array.from({ length: width }, (_, x) => {
          if (x === 0 || x === width - 1) return 'D';
          if (r === 7) return 'x';
          if (r === 8) return 'D';
          const slot = Math.floor((x - 1) / 5);
          const inBox = (x - 1) % 5 < 4;
          const tall = 2 + ((slot + shelf + start) % 3);
          if (!inBox || r < 7 - tall - 2) return 'K';
          const [top, body] = BOXES[(slot * 3 + shelf * 2 + start) % BOXES.length];
          return r === 7 - tall - 2 ? top : body;
        }).join(''),
      );
    }
  }
  return { id, name: id, tags: ['scene', 'pf'], rows };
}

/** The SALE sign: a red board hung on two cords, bulbs along its top and bottom edges; the word is stamped on it. */
const saleSign: PixelSprite = {
  id: 'pf12-sale-sign',
  name: 'sale sign',
  tags: ['scene', 'pf'],
  rows: [
    '...X.............X...',
    '...X.............X...',
    'rrrrrrrrrrrrrrrrrrrrr',
    'rGrrGrrGrrGrrGrrGrrGr',
    'rRRRRRRRRRRRRRRRRRRRr',
    'rRRRRRRRRRRRRRRRRRRRr',
    'rRRRRRRRRRRRRRRRRRRRr',
    'rRRRRRRRRRRRRRRRRRRRr',
    'rRRRRRRRRRRRRRRRRRRRr',
    'rRRRRRRRRRRRRRRRRRRRr',
    'rRRRRRRRRRRRRRRRRRRRr',
    'rGrrGrrGrrGrrGrrGrrGr',
    'rrrrrrrrrrrrrrrrrrrrr',
  ],
};

/** The sign's bulbs lit, for a twinkle over the gold dots on its edges. */
const signBulbs: PixelSprite = {
  id: 'pf12-sign-bulbs',
  name: 'sign bulbs',
  tags: ['scene', 'pf'],
  rows: [
    '.y..y..y..y..y..y..y.',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
    '.y..y..y..y..y..y..y.',
  ],
};

/** A gold starburst deal tag with a red percent sign, stuck on the right-hand shelf. */
const dealTag: PixelSprite = {
  id: 'pf12-deal-tag',
  name: 'deal tag',
  tags: ['scene', 'pf'],
  rows: [
    '....G....',
    '.G.GGG.G.',
    '..GyyyG..',
    '.GyRyRyG.',
    'GGyyRyyGG',
    '.GyRyRyG.',
    '..GyyyG..',
    '.G.GGG.G.',
    '....G....',
  ],
};

/** The cart, seen from the front: the red handle behind, a wire basket on a solid grey panel, the frame and wheels. */
const cart: PixelSprite = {
  id: 'pf12-cart',
  name: 'cart',
  tags: ['scene', 'pf'],
  rows: [
    'rRRRRRRRRRRRRRRRRRRRRRRRRRRRRr',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxX',
    'xXDxDDDxDDDxDDDxDDDxDDDxDDDxDX',
    'xXDxDDDxDDDxDDDxDDDxDDDxDDDxDX',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxX',
    '.xXDxDDDxDDDxDDDxDDDxDDDxDDxX.',
    '.xXDxDDDxDDDxDDDxDDDxDDDxDDxX.',
    '.xxxxxxxxxxxxxxxxxxxxxxxxxxxX.',
    '..xXxDDDxDDDxDDDxDDDxDDDxDxX..',
    '..xXxDDDxDDDxDDDxDDDxDDDxDxX..',
    '..xxxxxxxxxxxxxxxxxxxxxxxxxX..',
    '...XXXXXXXXXXXXXXXXXXXXXXXX...',
    '...X......................X...',
    '...X......................X...',
    '..DDD....................DDD..',
    '..DxD....................DxD..',
    '...D......................D...',
  ],
};

/**
 * The hourglass, held up at the chest: pale glass outlined in ink so it stands off the blue sweater,
 * gold sand running from the top bulb to the bottom, then over again. Each bulb is given as 5-wide
 * rows of sand; `.` is empty glass.
 */
const HG_TOP = 'OOOOOOOOO';
const HG_CAP = '.gGGGGGg.';
const glass = (sand: string) => sand.replace(/\./g, 'w');
function hourglassFrame(top: readonly string[], stream: boolean, bottom: readonly string[]): string[] {
  const fall = stream ? 'G' : 'w';
  return [
    HG_TOP,
    HG_CAP,
    `.K${glass(top[0])}K.`,
    `.K${glass(top[1])}K.`,
    `..K${glass(top[2].slice(1, 4))}K..`,
    `...K${fall}K...`,
    `..Kw${fall}wK..`,
    `.Kww${fall}wwK.`,
    `.K${glass(bottom[0])}K.`,
    `.K${glass(bottom[1])}K.`,
    HG_CAP,
    HG_TOP,
  ];
}
const hourglass: PixelSprite = {
  id: 'pf12-hourglass',
  name: 'hourglass',
  tags: ['scene', 'pf'],
  rows: hourglassFrame(['yyyyy', 'GGGGG', '.GGG.'], true, ['.....', '..G..']),
  frames: [
    hourglassFrame(['yyyyy', 'GGGGG', '.GGG.'], true, ['.....', '..G..']),
    hourglassFrame(['.....', 'yGGGy', '.GGG.'], true, ['.....', '.GGG.']),
    hourglassFrame(['.....', '.....', '.yGy.'], true, ['..G..', 'GGGGG']),
    hourglassFrame(['.....', '.....', '.....'], false, ['.yGy.', 'GGGGG']),
  ],
  frameMs: 700,
};

/** The impulse: a thought bubble with a red !, its trail of puffs running down-right to the head. */
const thoughtBang: PixelSprite = {
  id: 'pf12-thought-bang',
  name: 'thought, buy now',
  tags: ['scene', 'pf'],
  rows: [
    '..XXXXXXX....',
    '.XwwwRRwwX...',
    'XwwwwRRwwwX..',
    'XwwwwRRwwwX..',
    'XwwwwRRwwwX..',
    'XwwwwwwwwwX..',
    'XwwwwRRwwwX..',
    '.XwwwwwwwX...',
    '..XXXXXXX....',
    '.........XX..',
    '.........XwX.',
    '..........XX.',
    '............X',
  ],
};

/** The second thought: a blue ?, its trail running down-left to the head. */
const thoughtAsk: PixelSprite = {
  id: 'pf12-thought-ask',
  name: 'thought, do I need it',
  tags: ['scene', 'pf'],
  rows: [
    '....XXXXXXX..',
    '...XwwbbbwwX.',
    '..XwwbwwwbwwX',
    '..XwwwwwwbwwX',
    '..XwwwwbbwwwX',
    '..XwwwwbwwwwX',
    '..XwwwwwwwwwX',
    '...XwwwbwwwX.',
    '....XXXXXXX..',
    '..XX.........',
    '.XwX.........',
    '.XX..........',
    'X............',
  ],
};

/** Lesson 12's emblem: the hourglass, sand running. */
const emblemHourglass: PixelSprite = {
  id: 'pf12-emblem-hourglass',
  name: 'pf12-emblem-hourglass',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    'OOOOOOOOO',
    '.xyyyyyx.',
    '.xGGGGGx.',
    '..xGGGx..',
    '...xGx...',
    '..xwGwx..',
    '.xwwGwwx.',
    '.xGGGGGx.',
    'OOOOOOOOO',
  ],
};

// Order is depth: shelves on the back wall, the figure behind the cart, the cart over its lower half.
const base = pfCompose('pf12-opener-base', 80, 60, 'k', [
  [pfBlock('pf12-skirting', 80, 1, 'X'), 0, 45],
  [pfBlock('pf12-skirting-shade', 80, 1, 'D'), 0, 46],
  [pfBlock('pf12-floor', 80, 13, 'K'), 0, 47],
  [pfBlock('pf12-floor-shine', 80, 1, 'D'), 0, 50],
  [shelfUnit('pf12-shelf-left', 26, 0), 0, 10],
  [shelfUnit('pf12-shelf-right', 26, 2), 54, 10],
  [saleSign, 1, 0],
  [pfText('pf12-sale', 'SALE', 'w'), 4, 5],
  [dealTag, 66, 19],
  [pfSaverHold, 32, 14],
  [cart, 25, 36],
]);

export const pf12Opener: SceneArt = {
  id: 'pf12-opener',
  label: 'In a store aisle under a red sale sign, a person stands behind an empty shopping cart holding up an hourglass, while a red exclamation mark and a blue question mark take turns in thought bubbles over their head.',
  width: 80,
  height: 60,
  base,
  layers: [
    // Held at its waist in both hands (figure at 32,14; hands at columns 4 and 11, rows 14 and 15).
    { sprite: hourglass, x: 35, y: 24 },
    { sprite: thoughtBang, x: 23, y: 1, motion: { kind: 'twinkle', periodMs: 2600, min: 0.12 } },
    { sprite: thoughtAsk, x: 44, y: 1, motion: { kind: 'twinkle', periodMs: 2600, min: 0.12, phase: 0.5 } },
    { sprite: signBulbs, x: 1, y: 3, motion: { kind: 'twinkle', periodMs: 900, min: 0.3 } },
    { sprite: pfSparkle, x: 70, y: 14, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
  ],
};

export const pf12Finish = pfKeepsake(
  'pf12-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing an hourglass with its sand running, with small sparkles around it.',
  emblemHourglass,
);

export const art: LessonArtSet = { opener: pf12Opener, backdrop: pfBackdrop, finish: pf12Finish };
