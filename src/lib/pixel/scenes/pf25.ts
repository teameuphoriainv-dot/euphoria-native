/**
 * Personal Finance lesson 25, Personal Finance Capstone: from the first paycheck to financial freedom.
 *
 * Back where the pathway began, the kitchen table under the green lamp, and the four pillars of
 * lesson 1 are on it again: the pay envelope, the wallet, the piggy bank, the sprout in its pot. On
 * the wall the first job's diploma now hangs beside a picture of the gold tree it grew into. The
 * figure throws both arms up, the key to their own house in one hand; outside the window fireworks
 * go up over the roofs, and the cat is awake for it. The street behind every lesson lights all its
 * windows for this one. Moving: the fireworks, the key's glint, the sprout, the lamp, the cat's tail.
 */
import type { PixelSprite } from '../types';
import {
  pfCompose,
  pfCurtain,
  pfDiploma,
  pfKitchen,
  pfLampGlow,
  pfLampPool,
  pfLater,
  pfPayEnvelope,
  pfPendantLamp,
  pfPiggyBank,
  pfPot,
  pfSparkle,
  pfSprout,
  pfTable,
  pfWallet,
} from './pf-kit';
import { pfCatSit, pfWindowNight } from './pf-kit-a';
import { pfKeepsakeGold } from './pf-kit-b';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  j: '#6B3A1F',
  H: '#43291A',
};

/**
 * The figure cheering, both arms flung up: the hands are columns 1 to 3 and 20 to 22 of rows 0 and
 * 1, the head starts on row 4, and the body is pfSaver's from row 15 (stand it at pfSaver's y - 4).
 */
const saverCheer: PixelSprite = {
  id: 'pf25-saver-cheer',
  name: 'saver cheering',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.MCM................MCM.',
    '.UCU................UCU.',
    '.bBb................bBb.',
    '.bBb................bBb.',
    '.bBb.....HHHHHH.....bBb.',
    '.bBb....HjjjjjjH....bBb.',
    '.bBb...HjjjjjjjjH...bBb.',
    '..bBb.HjjjjjjjjjjH.bBb..',
    '..bBb.HjjMCCjjjjjH.bBb..',
    '..bBb.HjCCCCCCCCjH.bBb..',
    '..bBb.HCCKCCCCKCCH.bBb..',
    '..bBb.HMCCCCCCCCUH.bBb..',
    '...bBb.MCCCUUCCCU.bBb...',
    '....bBb.UCCCCCCU.bBb....',
    '.....bBB..UUUU..BBb.....',
    '......bBBBBBBBBBBb......',
    '......bBBBwBBwBBBb......',
    '.....bBBBBwBBwBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
    '.....bBBBBBBBBBBBBb.....',
  ],
};

/** The house key, held up by its bow (the hand is stamped over the bow), its blade toothed. */
const houseKey: PixelSprite = {
  id: 'pf25-house-key',
  name: 'house key',
  tags: ['scene', 'pf'],
  rows: [
    '..y..',
    '..Gy.',
    '..G..',
    '..Gy.',
    '..G..',
    '.OGO.',
    'OGyGO',
    'Og.gO',
    '.OOO.',
  ],
};

/** The gold tree the sprout became, framed like the diploma beside it. */
const treePicture: PixelSprite = {
  id: 'pf25-tree-picture',
  name: 'tree picture',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOO',
    'OgggggggggO',
    'Og3nNNNn3gO',
    'OgnNyNGNngO',
    'OgnGNNNyngO',
    'Og3nnOnn3gO',
    'OgnnnOnnngO',
    'OgggggggggO',
    'OOOOOOOOOOO',
  ],
};

/** A firework going up over the roofs: a rising spark, a burst, its embers fading. A LAYER only. */
function firework(id: string, bright: string, dim: string): PixelSprite {
  const blank = ['.....', '.....', '.....', '.....'];
  const frames = [
    ['.....', '.....', '.....', '..x..'],
    ['.....', '.....', '..x..', '.....'],
    ['.....', '..y..', '.....', '.....'],
    ['..y..', '.yWy.', '..y..', '.....'],
    [`${bright}.${bright}.${bright}`, `.${bright}W${bright}.`, `${bright}.${bright}.${bright}`, '.....'],
    [`${dim}...${dim}`, `..${dim}..`, `${dim}...${dim}`, `..${dim}..`],
    blank,
    blank,
  ];
  return { id, name: id, tags: ['scene', 'pf'], rows: frames[4], frames, frameMs: 210 };
}
const fireworkPink = firework('pf25-firework-pink', 'F', 'f');
const fireworkTeal = pfLater(firework('pf25-firework-teal', 'T', 't'), 'pf25-firework-teal-later', 4, 230);

/** Lesson 25's emblem: the key to the house, its bow a little house with a window, its blade toothed. */
const emblemHouseKey: PixelSprite = {
  id: 'pf25-emblem-house-key',
  name: 'pf25-emblem-house-key',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '...WG.........',
    '..yGGg........',
    '.yGGGGg.......',
    'yGGGGGGg......',
    '.yGGGGg.......',
    '.yG..GgyyyyyyG',
    '.yG..GgGGGGGGg',
    '.yGGGGg..Gg.Gg',
    '.gggggg..gg.gg',
  ],
};

// Order is depth: the window and its curtains, the pictures, the lamp, the key (the hand grips it,
// so the figure is stamped over its bow), the figure, the table over its lower half, the pillars.
const base = pfCompose('pf25-opener-base', 80, 60, pfKitchen.rows, [
  [pfWindowNight, 3, 5],
  [pfCurtain, 2, 4],
  [pfCurtain, 26, 4],
  [pfDiploma, 56, 7],
  [treePicture, 68, 6],
  [pfPendantLamp, 37, 0],
  [houseKey, 49, 1],
  [saverCheer, 30, 8],
  [pfTable(72, 12), 4, 36],
  [pfLampPool, 31, 37],
  [pfPayEnvelope, 6, 30],
  [pfWallet, 19, 30],
  [pfPiggyBank, 53, 28],
  [pfPot, 69, 31],
]);

export const pf25Opener: SceneArt = {
  id: 'pf25-opener',
  label: 'Back at the kitchen table at night, a person throws both arms up holding the key to their house, with the pay envelope, the wallet, the piggy bank and the sprout all on the table, a diploma and a picture of a golden tree on the wall, fireworks outside the window and the cat sitting up on the rug.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The fireworks go up in the window's two panes (window at 3,5; glass from column 3, rows 2 to 5
    // and 7 to 10), the sprout sways in its pot as on lesson 1, the key glints in the raised hand.
    { sprite: fireworkPink, x: 8, y: 7 },
    { sprite: fireworkTeal, x: 17, y: 12 },
    { sprite: pfSprout, x: 69, y: 26 },
    { sprite: pfCatSit, x: 14, y: 46 },
    { sprite: pfSparkle, x: 49, y: 0, motion: { kind: 'twinkle', periodMs: 1600, min: 0.35 } },
    { sprite: pfLampGlow, x: 38, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
  ],
};

export const pf25Finish = pfKeepsakeGold(
  'pf25-finish',
  'A gold house-shaped key fob with a gold roof, on a key ring with a brass key, its window showing a golden house key whose bow is a little house, with small sparkles around it.',
  emblemHouseKey,
);

/* ── the street, every window lit ─────────────────────────────────────────────────────────────── */

/** A window glow block, w x h of deep gold, for a window the pathway backdrop leaves dark. */
type Lit = readonly [x: number, y: number, w: number, h: number];
function litWindows(id: string, ox: number, oy: number, width: number, height: number, windows: readonly Lit[]): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) =>
        windows.some(([wx, wy, w, h]) => x + ox >= wx && x + ox < wx + w && y + oy >= wy && y + oy < wy + h) ? 'O' : '.',
      ).join(''),
    ),
  };
}

/** Every window pf-backdrop.ts leaves dark (in its own coordinates): house A, the walk-up, the store, house C. */
const HOUSE_A: readonly Lit[] = [[6, 22, 3, 2], [3, 27, 3, 3], [3, 31, 4, 3]];
const WALKUP: readonly Lit[] = [
  [26, 16, 2, 3], [34, 16, 2, 3], [38, 16, 2, 3],
  [26, 22, 2, 3], [30, 22, 2, 3], [34, 22, 2, 3],
  [30, 28, 2, 3], [34, 28, 2, 3], [38, 28, 2, 3],
];
const STORE_AND_C: readonly Lit[] = [[58, 23, 3, 3], [77, 27, 3, 3]];

/** A firework over the street, kept as dim as the rest of the backdrop. A LAYER only. */
function quietFirework(id: string, ink: string): PixelSprite {
  const blank = ['.......', '.......', '.......', '.......', '.......'];
  const frames = [
    ['.......', '.......', '.......', '.......', '...E...'],
    ['.......', '.......', '...E...', '.......', '.......'],
    ['.......', '...O...', '..OpO..', '...O...', '.......'],
    [`.${ink}.${ink}.${ink}.`, '..O.O..', `.${ink}.p.${ink}.`, '..O.O..', `.${ink}.${ink}.${ink}.`],
    [`${ink}..${ink}..${ink}`, '.......', `${ink}.....${ink}`, '.......', `${ink}..${ink}..${ink}`],
    ['E.....E', '.......', '.......', '.......', 'E.....E'],
    blank,
    blank,
    blank,
  ];
  return { id, name: id, tags: ['scene', 'pf'], rows: frames[3], frames, frameMs: 260 };
}

export const pf25Backdrop: SceneArt = {
  ...pfBackdrop,
  id: 'pf25-backdrop',
  label: 'The quiet neighborhood street at night with every window lit and fireworks over the rooftops, the corner store, the little bank and the glowing street lamps.',
  layers: [
    ...pfBackdrop.layers,
    { sprite: litWindows('pf25-lit-house-a', 3, 22, 6, 12, HOUSE_A), x: 3, y: 22, motion: { kind: 'twinkle', periodMs: 6600, min: 0.45, phase: 0.15 } },
    { sprite: litWindows('pf25-lit-walkup', 26, 16, 14, 15, WALKUP), x: 26, y: 16, motion: { kind: 'twinkle', periodMs: 7400, min: 0.45, phase: 0.55 } },
    { sprite: litWindows('pf25-lit-store-c', 58, 23, 22, 7, STORE_AND_C), x: 58, y: 23, motion: { kind: 'twinkle', periodMs: 6900, min: 0.45, phase: 0.85 } },
    { sprite: quietFirework('pf25-street-firework-a', 'f'), x: 54, y: 2 },
    { sprite: pfLater(quietFirework('pf25-street-firework-b', 'p'), 'pf25-street-firework-b-later', 5, 280), x: 86, y: 4 },
  ],
};

export const art: LessonArtSet = { opener: pf25Opener, backdrop: pf25Backdrop, finish: pf25Finish };
