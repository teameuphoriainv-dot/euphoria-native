/**
 * Wealth Management lesson 2 (tax-advantaged investing): its opener, the pathway backdrop and its
 * keepsake, as one set loaded on demand.
 *
 * The opener is the advisor's study at night, furnished from the kits (wm-kit.ts, wm-kit-a.ts):
 * green striped wallpaper over panelling, a curtained window onto the moonlit estate, a bookcase,
 * and a partners' desk carrying the lesson's two accounts. On the right a stack of coins stands
 * under a glass dome, sheltered from tax; on the left an open stack is not. The advisor points to
 * the dome, a banker's lamp lights the desk, and the year's money bag waits on the floor. What
 * moves: the sheltered stack grows a coin at a time and starts again, coins lift off the open
 * stack and fade (the tax drag), the lamp breathes, the dome's glass glints, a star twinkles in the
 * window. The keepsake carries a nest egg.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCoinMote, wmCompose, wmMoneyBag, wmStarDot, WM_INKS } from './wm-kit';
import { wmAdvisorPointing, wmBookcase, wmStripes, wmWainscot, wmWindow } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The dome's top-left in the scene. The growing stack and the glint are placed from it. */
const DOME_X = 50;
const DOME_Y = 20;

/** A stack of `n` coins (n >= 2), drawn like the kit's wmCoinStack: 7 wide, 2n + 1 tall. */
function coinStack(n: number): string[] {
  const middle = Array.from({ length: n - 2 }, () => ['yGGGGGg', 'OgggggO']).flat();
  return ['.yyGGg.', 'yGGGGgg', 'OgggggO', ...middle, 'yGGGGGg', 'OOOOOOO'];
}

/** A partners' desk seen from the front: three drawers a pedestal, a panelled modesty board between. 52x17. */
const PEDESTAL = ['UOOOOOOOOOOOOK', 'UOOOOOGGOOOOOK', 'UOOOOOOOOOOOOK', 'KKKKKKKKKKKKKK'];
const MODESTY = [
  'UOOOOOOOOOOOOOOOOOOK',
  'UOOOOOOOOGGOOOOOOOOK',
  'UOOOOOOOOOOOOOOOOOOK',
  'KKKKKKKKKKKKKKKKKKKK',
  'OOOOOOOOOOOOOOOOOOOO',
  'OKKKKKKKKKKKKKKKKKKO',
  'OKOOOOOOOOOOOOOOOOUO',
  'OKOOOOOOOOOOOOOOOOUO',
  'OKOOOOOOOOOOOOOOOOUO',
  'OKUUUUUUUUUUUUUUUUUO',
  'OOOOOOOOOOOOOOOOOOOO',
  'KKKKKKKKKKKKKKKKKKKK',
];
const desk: PixelSprite = {
  id: 'wm2-opener-desk',
  name: 'wm2-opener-desk',
  tags: ['scene', 'wm2'],
  palette: WM_INKS,
  rows: [
    `${'C'.repeat(51)}U`,
    `${'U'.repeat(51)}O`,
    `.${'K'.repeat(50)}.`,
    ...MODESTY.map((mid, i) => `..${PEDESTAL[i % 4]}${mid}${PEDESTAL[i % 4]}..`),
    `..${'U'.repeat(48)}..`,
    `..OK${'.'.repeat(10)}OK${'.'.repeat(20)}OK${'.'.repeat(10)}OK..`,
  ],
};

/** A banker's lamp: green glass shade, brass rim and stem. 9x7. */
const lamp: PixelSprite = {
  id: 'wm2-opener-lamp',
  name: 'wm2-opener-lamp',
  tags: ['scene', 'wm2'],
  rows: [
    '..nNNNn..',
    '.nNmmNNn.',
    'nNNNNNNnn',
    'gOOOOOOOg',
    '....G....',
    '....G....',
    '..yGGGg..',
  ],
};

/** A bell jar on a gilt plinth: only its outline is drawn, so the wallpaper shows through the glass. 13x21. */
const dome: PixelSprite = {
  id: 'wm2-opener-dome',
  name: 'wm2-opener-dome',
  tags: ['scene', 'wm2'],
  rows: [
    '.....xwx.....',
    '......x......',
    '....xxxxX....',
    '..xx.....XX..',
    '.x.........X.',
    '.x.........X.',
    ...Array.from({ length: 12 }, () => 'x...........X'),
    'xxxxxxxxxxxxX',
    'yGGGGGGGGGGGg',
    'OgggggggggggO',
  ],
};

/** The open account: three coins, out on the desk. */
const openStack: PixelSprite = {
  id: 'wm2-opener-open-stack',
  name: 'wm2-opener-open-stack',
  tags: ['scene', 'wm2'],
  rows: coinStack(3),
};

const base = wmCompose('wm2-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1], ['k', 1]]),
  ...wmStripes(80, 40, 'h', 'H', 6),
  ...wmWainscot(80),
  ...wmBands(80, [['K', 1], ['O', 2], ['U', 1], ['O', 1]]),
], [
  { sprite: wmWindow, x: 2, y: 6 },
  { sprite: wmBookcase, x: 65, y: 16 },
  { sprite: wmAdvisorPointing, x: 36, y: 31 },
  { sprite: desk, x: 12, y: 41 },
  { sprite: lamp, x: 14, y: 34 },
  { sprite: openStack, x: 25, y: 34 },
  { sprite: dome, x: DOME_X, y: DOME_Y },
  { sprite: wmMoneyBag, x: 2, y: 50 },
]);

/** The sheltered account inside the dome: two coins up to seven, a coin a frame, a rest, again. 7x15. */
const GROWN_H = 15;
const grownTo = (n: number) => [...wmBands(7, [['.', GROWN_H - (2 * n + 1)]]), ...coinStack(n)];
const growingStack: PixelSprite = {
  id: 'wm2-opener-growing-stack',
  name: 'wm2-opener-growing-stack',
  tags: ['scene', 'wm2'],
  blurb: 'The sheltered stack growing a coin at a time under its glass dome.',
  rows: grownTo(7),
  frames: [2, 3, 4, 5, 6, 7, 7, 7].map(grownTo),
  frameMs: 520,
};

/** Light under the lamp's shade, breathing. */
const lampGlow: PixelSprite = {
  id: 'wm2-opener-lamp-glow',
  name: 'wm2-opener-lamp-glow',
  tags: ['scene', 'wm2'],
  rows: ['GyWyG'],
};

/** A glint down the lit side of the dome's glass. */
const domeGlint: PixelSprite = {
  id: 'wm2-opener-dome-glint',
  name: 'wm2-opener-dome-glint',
  tags: ['scene', 'wm2'],
  rows: ['w', 'w', 'x'],
};

export const wm2Opener: SceneArt = {
  id: 'wm2-opener',
  label: 'In a lamplit study an advisor points to a stack of coins growing under a glass dome on the desk, while coins drift away from the open stack beside it.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: growingStack, x: DOME_X + 3, y: DOME_Y + 3 },
    { sprite: wmCoinMote, x: 26, y: 31, motion: { kind: 'rise', amp: 9, periodMs: 2600, phase: 0.1 } },
    { sprite: wmCoinMote, x: 29, y: 32, motion: { kind: 'rise', amp: 8, periodMs: 2600, phase: 0.6 } },
    { sprite: lampGlow, x: 16, y: 37, motion: { kind: 'twinkle', periodMs: 3000, min: 0.45 } },
    { sprite: domeGlint, x: DOME_X + 2, y: DOME_Y + 6, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: wmStarDot, x: 14, y: 20, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
  ],
};

/** A golden nest egg in a woven nest: money set aside to grow untaxed. */
const emblemNestEgg: PixelSprite = {
  id: 'wm2-emblem-nest-egg',
  name: 'wm2-emblem-nest-egg',
  tags: ['scene', 'wm2'],
  rows: [
    '.....yyGg.....',
    '....yyGGGg....',
    '...ywGGGGGg...',
    '...yGGGGGGg...',
    '..yGGGGGGGGg..',
    '..yGGGGGGGgg..',
    '..GGGGGGGGgg..',
    'y.gGGGGGGggg.g',
    'GyOgggggggOOgO',
    'gGgyGgGyGgGgOO',
    '.gGgGgGgGgGgO.',
    '..OgOgOgOgOO..',
    '...OOOOOOOO...',
  ],
};

export const wm2Finish: SceneArt = wmKeepsake(
  'wm2-finish',
  emblemNestEgg,
  'A green crest with a gold rim bearing a golden egg in a woven nest, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm2Opener, backdrop: wmBackdrop, finish: wm2Finish };
