/**
 * Wealth Management lesson 9 (working with financial advisors): its opener, the pathway backdrop
 * and its keepsake, as one set loaded on demand.
 *
 * The opener is the house's drawing room: plum wallpaper pinstriped in orchid over the kit's
 * panelling, the curtained window, a marble fireplace with candles and a clock on the mantel, and
 * over it a gilt-framed painting of the house of five pillars. On the rug the advisor and the
 * father shake hands: the lesson's point is choosing a fiduciary, someone bound to stand on the
 * family's side, and paying a fee that does not quietly eat the fortune. What moves: the handshake
 * pumps and rests, the fire crackles, the candles flicker, firelight breathes on the hearth, a star
 * twinkles in the window. The keepsake carries an open hand raised in pledge.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, wmStarDot, WM_INKS } from './wm-kit';
import { wmCandle, wmCandleFlame, wmStripes, wmWainscot, wmWindow } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The fireplace surround's top-left in the scene; the fire, logs and hearth glow are placed from it. */
const HEARTH_X = 47;
const HEARTH_Y = 42;
const FRAME_W = 20;
const FRAME_H = 24;

/** A marble surround: a lintel lit along its top, two pilasters, the dark opening. 24x12. */
const surround: PixelSprite = {
  id: 'wm9-opener-surround',
  name: 'wm9-opener-surround',
  tags: ['scene', 'wm9'],
  rows: [
    'xwwwwwwwwwwwwwwwwwwwwwwX',
    'xwxxxxxxxxxxxxxxxxxxxxxD',
    'xXXXXXXXXXXXXXXXXXXXXXXD',
    ...Array.from({ length: 9 }, () => `xwxX${'K'.repeat(16)}xwXD`),
  ],
};

const mantel: PixelSprite = {
  id: 'wm9-opener-mantel',
  name: 'wm9-opener-mantel',
  tags: ['scene', 'wm9'],
  rows: [`x${'w'.repeat(26)}X`, `D${'X'.repeat(26)}D`],
};

const hearth: PixelSprite = {
  id: 'wm9-opener-hearth',
  name: 'wm9-opener-hearth',
  tags: ['scene', 'wm9'],
  rows: [`${'x'.repeat(29)}X`, 'D'.repeat(30)],
};

/** Two logs on the grate. 12x2. */
const logs: PixelSprite = {
  id: 'wm9-opener-logs',
  name: 'wm9-opener-logs',
  tags: ['scene', 'wm9'],
  palette: WM_INKS,
  rows: ['OUUCUUUCUUO.', '.OOOOOOOOOO.'],
};

/** A gilt bracket clock. 6x7. */
const clock: PixelSprite = {
  id: 'wm9-opener-clock',
  name: 'wm9-opener-clock',
  tags: ['scene', 'wm9'],
  rows: [
    '..yG..',
    '.yGGg.',
    'yGwwGg',
    'Gwkwwg',
    'Gwwkkg',
    'gGwwgO',
    '.OOOO.',
  ],
};

/** One pixel of a gilt frame three deep: lit gold on the top and left, shaded on the bottom and right. */
function frameInk(i: number, j: number): string {
  const edges = [i, j, FRAME_W - 1 - i, FRAME_H - 1 - j];
  const d = Math.min(...edges);
  if (d >= 3) return '.';
  if (d === 2) return 'O';
  const lit = edges.indexOf(d) < 2;
  if (d === 0) return lit ? 'y' : 'O';
  return lit ? 'G' : 'g';
}

/** The painting: the house of five pillars by night. 14x18. */
const painting: PixelSprite = {
  id: 'wm9-opener-painting',
  name: 'wm9-opener-painting',
  tags: ['scene', 'wm9'],
  palette: WM_INKS,
  rows: [
    'KKKKKKKKKKKKKK',
    'KKKKKKKKKKKxKK',
    'KKKKKKxwKKKKKK',
    'KKKKxxwwXXKKKK',
    'KKxxwwwwwwXXKK',
    'KxwwwwwwwwwwXK',
    'KDXXXXXXXXXXDK',
    'KKxXOxXOxXOxXK',
    'KKxXOxXOxXOxXK',
    'KKxXOxXOxXOxXK',
    'KKxXOxXOxXOxXK',
    'KKxXOxXOxXOxXK',
    'KxwwwwwwwwwwXK',
    'xwwwwwwwwwwwwX',
    'hhhhhhhhhhhhhh',
    'hHhhhhhhhhhhHh',
    'hhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhh',
  ],
};

const portrait = wmCompose('wm9-opener-portrait', wmBands(FRAME_W, [['.', FRAME_H]]), [
  { sprite: painting, x: 3, y: 3 },
  {
    sprite: {
      id: 'wm9-opener-portrait-frame',
      name: 'wm9-opener-portrait-frame',
      tags: ['scene', 'wm9'],
      rows: Array.from({ length: FRAME_H }, (_, j) => Array.from({ length: FRAME_W }, (_, i) => frameInk(i, j)).join('')),
    },
    x: 0,
    y: 0,
  },
]);

/** An orchid rug with a gold border. 36x4. */
const rug: PixelSprite = {
  id: 'wm9-opener-rug',
  name: 'wm9-opener-rug',
  tags: ['scene', 'wm9'],
  rows: [
    `g${'G'.repeat(34)}g`,
    `g${Array.from({ length: 34 }, (_, x) => (x % 6 === 2 ? 'p' : 'E')).join('')}g`,
    `g${Array.from({ length: 34 }, (_, x) => (x % 6 === 5 ? 'p' : 'E')).join('')}g`,
    `O${'g'.repeat(34)}O`,
  ],
};

/** The advisor, briefcase set down, the left arm out to shake; the forearm and hand are the handshake layer. 7x13. */
const advisorShaking: PixelSprite = {
  id: 'wm9-opener-advisor-shaking',
  name: 'wm9-opener-advisor-shaking',
  tags: ['scene', 'wm9'],
  palette: WM_INKS,
  rows: [
    '..kkk..',
    '.kkkkk.',
    '.kSSSk.',
    '.SkSkM.',
    '..SSM..',
    '.XwGwX.',
    'XxXGXXD',
    'xXXGXXX',
    'SXXXXD.',
    '.XXXXD.',
    '.kk.kk.',
    '.kk.kk.',
    '.KK.KK.',
  ],
};

/** The father, the right arm out to shake; the forearm and hand are the handshake layer. 8x13. */
const parentShaking: PixelSprite = {
  id: 'wm9-opener-parent-shaking',
  name: 'wm9-opener-parent-shaking',
  tags: ['scene', 'wm9'],
  palette: WM_INKS,
  rows: [
    '...kkk..',
    '..kkkkk.',
    '..kCCCk.',
    '..CkCkU.',
    '...CCU..',
    '..bwRwb.',
    '.bBBRBbb',
    'BBBBRBbb',
    '..BBBBbU',
    '..bBBbb.',
    '..kk.kk.',
    '..kk.kk.',
    '..KK.KK.',
  ],
};

const base = wmCompose('wm9-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1]]),
  ...wmStripes(80, 40, 'k', 'E', 5),
  ...wmWainscot(80),
  ...wmBands(80, [['K', 1], ['O', 2], ['U', 1], ['O', 2]]),
], [
  { sprite: wmWindow, x: 2, y: 7 },
  { sprite: portrait, x: 49, y: 9 },
  { sprite: mantel, x: HEARTH_X - 2, y: HEARTH_Y - 2 },
  { sprite: surround, x: HEARTH_X, y: HEARTH_Y },
  { sprite: logs, x: HEARTH_X + 6, y: HEARTH_Y + 10 },
  { sprite: hearth, x: HEARTH_X - 3, y: HEARTH_Y + 12 },
  { sprite: clock, x: 56, y: 33 },
  { sprite: wmCandle, x: 47, y: 34 },
  { sprite: wmCandle, x: 66, y: 34 },
  { sprite: rug, x: 6, y: 55 },
  { sprite: advisorShaking, x: 21, y: 43 },
  { sprite: parentShaking, x: 33, y: 43 },
]);

/** The clasped hands and forearms between them: level, pumped up, level again, then a rest. 5x2. */
const HANDS_LEVEL = ['.....', 'XSSCB'];
const HANDS_UP = ['.SSC.', 'X...B'];
const handshake: PixelSprite = {
  id: 'wm9-opener-handshake',
  name: 'wm9-opener-handshake',
  tags: ['scene', 'wm9'],
  palette: WM_INKS,
  blurb: 'The advisor and the father shaking hands.',
  rows: HANDS_LEVEL,
  frames: [HANDS_LEVEL, HANDS_UP, HANDS_LEVEL, HANDS_UP, HANDS_LEVEL, HANDS_LEVEL, HANDS_LEVEL, HANDS_LEVEL],
  frameMs: 260,
};

/** The fire on the grate, crackling. 14x7. */
const FIRE_BED = ['23455554555432', '23455555555432', '12344444444321'];
const fire: PixelSprite = {
  id: 'wm9-opener-fire',
  name: 'wm9-opener-fire',
  tags: ['scene', 'wm9'],
  rows: ['....3.....3...', '...343...343..', '..34543.34543.', '.3445543445433', ...FIRE_BED],
  frames: [
    ['....3.....3...', '...343...343..', '..34543.34543.', '.3445543445433', ...FIRE_BED],
    ['..3......3....', '.343....343...', '.34543.34543..', '3445543445543.', ...FIRE_BED],
    ['......3.......', '.3...343...3..', '343.34543.343.', '34543455434543', ...FIRE_BED],
  ],
  frameMs: 180,
};

/** Firelight on the hearth stone. */
const hearthGlow: PixelSprite = {
  id: 'wm9-opener-hearth-glow',
  name: 'wm9-opener-hearth-glow',
  tags: ['scene', 'wm9'],
  rows: ['gGGGGGGGGGGGGGGg'],
};

export const wm9Opener: SceneArt = {
  id: 'wm9-opener',
  label: 'An advisor and a father shake hands in a drawing room before a crackling fire, under a painting of the house of five pillars.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: handshake, x: 28, y: 49 },
    { sprite: fire, x: HEARTH_X + 5, y: HEARTH_Y + 4 },
    { sprite: wmCandleFlame, x: 48, y: 31 },
    { sprite: wmLater(wmCandleFlame, 'wm9-opener-flame-later', 2, 300), x: 67, y: 31 },
    { sprite: hearthGlow, x: HEARTH_X + 4, y: HEARTH_Y + 12, motion: { kind: 'twinkle', periodMs: 1700, min: 0.3 } },
    { sprite: wmStarDot, x: 14, y: 21, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.3, min: 0.2 } },
  ],
};

/**
 * An open right hand raised, palm out: the heraldic hand appaumee, faith and a sworn pledge, which
 * is the fiduciary's duty to the family. Two clasped hands were tried here and do not read at 14x13
 * in one gold; the opener carries the handshake itself.
 */
const emblemPledge: PixelSprite = {
  id: 'wm9-emblem-pledge',
  name: 'wm9-emblem-pledge',
  tags: ['scene', 'wm9'],
  rows: [
    '.....yG.......',
    '..yG.yG.yG....',
    '..yG.yG.yG.yG.',
    '..yG.yG.yG.yG.',
    '..yG.yG.yG.yG.',
    '..yGGyGGyGGyG.',
    'yG.yGGGGGGGGg.',
    'yGGyGGGGGGGGg.',
    '.yGGGGGGGGGgg.',
    '..yGGGGGGGgg..',
    '...gGGGGGgg...',
    '....gGGGgO....',
    '....OOOOOO....',
  ],
};

export const wm9Finish: SceneArt = wmKeepsake(
  'wm9-finish',
  emblemPledge,
  'A green crest with a gold rim bearing an open hand raised in pledge, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm9Opener, backdrop: wmBackdrop, finish: wm9Finish };
