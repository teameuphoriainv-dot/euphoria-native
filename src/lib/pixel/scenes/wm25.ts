/**
 * Wealth Management lesson 25 (the advanced capstone, the pathway's last lesson): its opener, the
 * capstone backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is the house of five pillars at daybreak. Lesson 1 met it at night and lesson 10 lit it
 * with fireworks; here the sky over it pales from night to rose, the sun is coming up over the trees
 * on the left (the light every piece in the kit has always been drawn from), and the whole family
 * stands on the forecourt drawn large from wm-kit-c.ts: the grandmother, the father, the heir waving
 * at us, the advisor with his briefcase. The lesson's point is the five pillars run as one system, so
 * the marks light up in the order the lesson teaches them (earn, save, invest, protect, transfer),
 * stay lit together, and then the star in the pediment blazes: the plan complete. A reader with
 * Reduce Motion sees every mark and the star lit. What moves: the marks and the star, the sun's rays,
 * the pennant, the child's waving hand, two birds crossing the dawn.
 *
 * The backdrop is lesson 10's, the estate with every manor window lit, as the plan allows the two
 * capstones. The keepsake carries a five-pointed star, the pathway's last crest.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import {
  wmBands,
  wmCompose,
  wmFlag,
  wmMarkEarn,
  wmMarkInvest,
  wmMarkProtect,
  wmMarkSave,
  wmMarkTransfer,
  wmTemple,
  WM_INKS,
} from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmAdvisorTall, wmChildTall, wmElderTall, wmParentTall, wmRepose } from './wm-kit-c';
import { wm10Backdrop } from './wm10';
import { wmKeepsake } from './wm1-finish';

/** The temple's top-left in the scene. Every temple position below is offset from it. */
const TX = 11;
const TY = 6;

/** Where the child stands; the waving hand is placed from it. */
const CHILD_X = 40;
const CHILD_Y = 43;

/** The sun, coming up behind the trees on the left: a pale hot core in an amber rim. 11x11. */
const sun: PixelSprite = {
  id: 'wm25-opener-sun',
  name: 'wm25-opener-sun',
  tags: ['scene', 'wm25'],
  rows: Array.from({ length: 11 }, (_, y) =>
    Array.from({ length: 11 }, (_, x) => {
      const d = Math.hypot(x - 5, y - 5);
      if (d > 5.5) return '.';
      return d > 4.3 ? '4' : '5';
    }).join(''),
  ),
};

const trees = wmTreeline('wm25-opener-trees', 80, 8, [[40, 40, 2], [3, 9, 6], [22, 7, 4], [58, 8, 4], [76, 9, 7]]);

const flagPole: PixelSprite = {
  id: 'wm25-opener-flag-pole',
  name: 'wm25-opener-flag-pole',
  tags: ['scene', 'wm25'],
  rows: ['D', 'x', 'x', 'x', 'x', 'x'],
};

/** Gravel spreading from the foot of the steps to the bottom of the frame, their shadow along the top. 80x11. */
const forecourt: PixelSprite = {
  id: 'wm25-opener-forecourt',
  name: 'wm25-opener-forecourt',
  tags: ['scene', 'wm25'],
  rows: Array.from({ length: 11 }, (_, j) =>
    Array.from({ length: 80 }, (_, x) => {
      if (x < TX - 1 - j || x > TX + 59 + j) return '.';
      return j === 0 && x >= TX && x <= TX + 58 ? 'z' : 'k';
    }).join(''),
  ),
};

/** The heir with the right arm up to wave; the hand itself is a layer. 11x15. */
const childWaving = wmRepose(wmChildTall, 'wm25-opener-child-waving', {
  2: 'T..gGgggggg',
  3: 'T.ggCCCCCgg',
  4: 'T..CCKCKCU.',
  5: 'TT.CCCCCCU.',
  6: '.T..CCCCU..',
  7: '.TTtTTTTTt.',
  8: '....tTTTttt',
  9: '....tTTTttt',
  10: '....tTTTtUU',
}, 2, 0);

const base = wmCompose('wm25-opener-base', wmBands(80, [['K', 7], ['k', 7], ['E', 7], ['p', 6], ['I', 6], ['f', 5], ['h', 22]]), [
  { sprite: sun, x: 1, y: 28 },
  { sprite: trees, x: 0, y: 31 },
  { sprite: forecourt, x: 0, y: TY + 43 },
  { sprite: flagPole, x: TX + 29, y: TY - 6 },
  { sprite: wmTemple, x: TX, y: TY },
  { sprite: wmElderTall, x: 13, y: 36 },
  { sprite: wmParentTall, x: 27, y: 35 },
  { sprite: childWaving, x: CHILD_X, y: CHILD_Y },
  { sprite: wmAdvisorTall, x: 53, y: 35 },
]);

/* ── the marks lighting up, one system ──────────────────────────────────────────────────────── */

/** A mark lit from inside: every gold step goes one brighter. */
function litFrom(sprite: PixelSprite): PixelSprite {
  const up: Record<string, string> = { O: 'g', g: 'G', G: 'y', y: 'w' };
  return { ...sprite, rows: sprite.rows.map((row) => [...row].map((ch) => up[ch] ?? ch).join('')) };
}

/** A small gold star for the tympanum, in place of lesson 1's oak: the plan complete. 7x5. */
const markStar: PixelSprite = {
  id: 'wm25-opener-mark-star',
  name: 'wm25-opener-mark-star',
  tags: ['scene', 'wm25'],
  rows: ['...y...', '..yGg..', 'yGGGGGg', '.gGGGg.', '.g...g.'],
};

const MARKS = [wmMarkEarn, wmMarkSave, wmMarkInvest, wmMarkProtect, wmMarkTransfer];

/**
 * The tympanum and the frieze, 49x12, laid from the frieze's left edge and the star's top: the
 * first `lit` marks lit and the rest plain, the star plain, lit or blazing. The base leaves the
 * panels bare, so the marks live only in this layer and no still copy shows under a frame.
 */
function frieze(lit: number, star: 0 | 1 | 2): string[] {
  const starred = star === 0 ? markStar : star === 1 ? litFrom(markStar) : litFrom(litFrom(markStar));
  return wmCompose('wm25-opener-marks', wmBands(49, [['.', 12]]), [
    { sprite: starred, x: 21, y: 0 },
    ...MARKS.map((mark, i) => ({ sprite: i < lit ? litFrom(mark) : mark, x: 1 + 10 * i, y: 7 })),
  ]).rows;
}

const marks: PixelSprite = {
  id: 'wm25-opener-marks',
  name: 'wm25-opener-marks',
  tags: ['scene', 'wm25'],
  blurb: 'The five pillar marks lighting in the lesson\'s order and staying lit, then the star above them blazing.',
  rows: frieze(5, 1),
  frames: [frieze(0, 0), frieze(1, 0), frieze(2, 0), frieze(3, 0), frieze(4, 0), frieze(5, 0), frieze(5, 1), frieze(5, 2), frieze(5, 1), frieze(5, 2), frieze(5, 1)],
  frameMs: 420,
};

/** Rays off the rising sun, a short ring of them over the clear sky left of the house. 15x10. */
const rays: PixelSprite = {
  id: 'wm25-opener-rays',
  name: 'wm25-opener-rays',
  tags: ['scene', 'wm25'],
  rows: [
    '......4........',
    '......5........',
    '...............',
    '4...........4..',
    '.5.........5...',
    '...............',
    '...............',
    '...............',
    '.............54',
    '...............',
  ],
};

/** The heir's hand, waving from side to side above the raised arm. 3x2. */
const wave: PixelSprite = {
  id: 'wm25-opener-wave',
  name: 'wm25-opener-wave',
  tags: ['scene', 'wm25'],
  palette: WM_INKS,
  rows: ['CC.', 'CU.'],
  frames: [['CC.', 'CU.'], ['.CC', '.CU']],
  frameMs: 320,
};

const bird: PixelSprite = {
  id: 'wm25-opener-bird',
  name: 'wm25-opener-bird',
  tags: ['scene', 'wm25'],
  rows: ['K.K', '.K.'],
};

export const wm25Opener: SceneArt = {
  id: 'wm25-opener',
  label: 'At sunrise the marble house of five pillars lights its five marks one by one and then the star above them, as a grandmother, a father, a waving child and their advisor stand together on the forecourt.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: marks, x: TX + 5, y: TY + 3 },
    { sprite: rays, x: 0, y: 23, motion: { kind: 'twinkle', periodMs: 2800, min: 0.3 } },
    { sprite: wmFlag, x: TX + 30, y: TY - 6 },
    { sprite: wave, x: CHILD_X - 1, y: CHILD_Y },
    { sprite: bird, x: 62, y: 16, motion: { kind: 'drift', amp: 2, periodMs: 3000 } },
    { sprite: bird, x: 70, y: 19, motion: { kind: 'drift', amp: 2, periodMs: 3400, phase: 0.5 } },
  ],
};

/** A five-pointed star: the five pillars as one, the plan complete. */
const emblemStar: PixelSprite = {
  id: 'wm25-emblem-star',
  name: 'wm25-emblem-star',
  tags: ['scene', 'wm25'],
  rows: [
    '......y......',
    '.....yGg.....',
    '.....yGg.....',
    '....yGwGg....',
    'yyyyGGGGGgggg',
    '.yGGGGGGGGgg.',
    '..yGGGGGGGg..',
    '...yGGGGGg...',
    '...yGGgGGg...',
    '..yGGg.GGgg..',
    '..yGg...Ggg..',
    '.yGg.....Ggg.',
    '.gO.......gO.',
  ],
};

export const wm25Finish: SceneArt = wmKeepsake(
  'wm25-finish',
  emblemStar,
  'A green crest with a gold rim bearing a five-pointed star, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm25Opener, backdrop: wm10Backdrop, finish: wm25Finish };
