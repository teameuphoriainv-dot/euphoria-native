/**
 * Wealth Management lesson 25 (the advanced capstone, the pathway's last lesson): its opener, the
 * capstone backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is the house of five pillars at daybreak. Lesson 1 met it at night and lesson 10 sat
 * the family at a table on its forecourt; here the sky over it pales from night to rose, the sun is
 * coming up over the trees on the left (the light every piece in the kit has always been drawn
 * from), and the family stands on the forecourt drawn large from wm-kit-c.ts. The lesson's point is
 * the complete action plan and its annual review, so the father and the advisor hold the year's
 * blueprint open between them, the house of five pillars drawn on it in white lines, while the
 * grandmother and the heir, waving at us, stand beside them. The frieze's five marks are lit
 * together and stay lit, and the star in the pediment glows over them: the plan complete. What
 * moves: a band of morning light sweeping across the blueprint, then a gold seal setting on its
 * corner (the year's review signed off), the star's glow, the sun's rays, the pennant, the child's
 * waving hand, two birds crossing the dawn.
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
const CHILD_X = 13;
const CHILD_Y = 43;

/** The father and the advisor, and the blueprint they hold open between them. */
const FATHER_X = 24;
const ADVISOR_X = 55;
const CAST_Y = 35;
const PLAN_X = FATHER_X + 13;
const PLAN_Y = CAST_Y + 4;

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

/** The father holding the blueprint's left roll out at his side. 13x23. */
const fatherHolding = wmRepose(wmParentTall, 'wm25-opener-father-holding', {
  11: 'BBbBBRBBbbbCU',
  12: 'BBbBBRBBb....',
  13: 'BBbBBBBBb....',
  14: 'BBbBBBBBb....',
  15: 'CCbBBBBBb....',
}, 0, 2);

/** The advisor holding the blueprint's right roll, his briefcase in the other hand. 16x23. */
const advisorHolding = wmRepose(wmAdvisorTall, 'wm25-opener-advisor-holding', {
  11: 'SMxxDXXGXXDDD...',
  12: '....DXXGXXDDD...',
  13: '....DXXXXXDDD...',
  14: '....DXXXXXDDD...',
  15: '....DXXXXXDMM...',
}, 2, 0);

/**
 * The year's blueprint held open: a blue sheet between two rolls, the house of five pillars drawn
 * on it in white (the pediment, the entablature, five columns, the base). 18x13.
 */
const PLAN_SHEET = [
  'bbbbbbbbbbbbbb',
  'bbbbbbwwbbbbbb',
  'bbbbwwbbwwbbbb',
  'bbwwbbbbbbwwbb',
  'bwwwwwwwwwwwwb',
  'bbbwbwbwbwbwbb',
  'bbbwbwbwbwbwbb',
  'bbbwbwbwbwbwbb',
  'bwwwwwwwwwwwwb',
  'bbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbb',
];
const blueprint: PixelSprite = {
  id: 'wm25-opener-blueprint',
  name: 'wm25-opener-blueprint',
  tags: ['scene', 'wm25'],
  rows: [
    `xX${'.'.repeat(14)}xX`,
    ...PLAN_SHEET.map((row) => `Bb${row}Bb`),
    `xX${'.'.repeat(14)}xX`,
  ],
};

/** The frieze's five marks, lit together and steady: no order to them now, the plan runs as one. */
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

const base = wmCompose('wm25-opener-base', wmBands(80, [['K', 7], ['k', 7], ['E', 7], ['p', 6], ['I', 6], ['f', 5], ['h', 22]]), [
  { sprite: sun, x: 1, y: 28 },
  { sprite: trees, x: 0, y: 31 },
  { sprite: forecourt, x: 0, y: TY + 43 },
  { sprite: flagPole, x: TX + 29, y: TY - 6 },
  { sprite: wmTemple, x: TX, y: TY },
  { sprite: litFrom(markStar), x: TX + 26, y: TY + 3 },
  ...MARKS.map((mark, i) => ({ sprite: litFrom(mark), x: TX + 6 + 10 * i, y: TY + 10 })),
  { sprite: wmElderTall, x: 1, y: 36 },
  { sprite: childWaving, x: CHILD_X, y: CHILD_Y },
  { sprite: fatherHolding, x: FATHER_X, y: CAST_Y },
  { sprite: advisorHolding, x: ADVISOR_X, y: CAST_Y },
  { sprite: blueprint, x: PLAN_X, y: PLAN_Y },
]);

/* ── the year's review: light sweeps the plan, then the seal sets ─────────────────────────────── */

/** The review over the sheet, 14x11 between the rolls: a two-column band of morning light, or the seal. */
const SWEEP_STOPS = [0, 2, 4, 6, 8, 10, 12];
function reviewFrame(band: number | null, sealed: boolean): string[] {
  const grid = wmBands(14, [['.', 11]]).map((row) => [...row]);
  if (band !== null) {
    PLAN_SHEET.forEach((row, j) => [...row].forEach((ch, i) => {
      if (i === band || i === band + 1) grid[j][i] = ch === 'w' ? 'W' : 'B';
    }));
  }
  if (sealed) {
    grid[8][10] = 'y';
    grid[8][11] = 'G';
    grid[9][10] = 'G';
    grid[9][11] = 'g';
    grid[8][12] = 'w';
  }
  return grid.map((row) => row.join(''));
}
const review: PixelSprite = {
  id: 'wm25-opener-review',
  name: 'wm25-opener-review',
  tags: ['scene', 'wm25'],
  blurb: 'Morning light sweeping across the year\'s blueprint, then a gold seal setting on its corner: the annual review signed off.',
  rows: reviewFrame(null, true),
  frames: [
    ...SWEEP_STOPS.map((x) => reviewFrame(x, false)),
    reviewFrame(null, false),
    reviewFrame(null, true),
    reviewFrame(null, true),
    reviewFrame(null, true),
    reviewFrame(null, true),
  ],
  frameMs: 260,
};

/** The pediment star's glow: its rays, laid round the lit star, breathing. 9x7. */
const starGlow: PixelSprite = {
  id: 'wm25-opener-star-glow',
  name: 'wm25-opener-star-glow',
  tags: ['scene', 'wm25'],
  rows: ['....w....', '.........', 'w.......w', '.........', '.........', '.........', '.w.....w.'],
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
  label: 'At sunrise in front of the marble house of five pillars, its five marks and the star above them lit, a father and the advisor hold the year\'s blueprint of the house open between them while a grandmother and a waving child stand beside them on the forecourt.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: review, x: PLAN_X + 2, y: PLAN_Y + 1 },
    { sprite: starGlow, x: TX + 25, y: TY + 2, motion: { kind: 'twinkle', periodMs: 2400, min: 0.2 } },
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
