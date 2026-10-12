/**
 * Alternative Investments lesson 21: the tax side of alternatives.
 *
 * The opener is the vault gallery (ai-kit.ts) with the lesson's point set out on the ledge: two stacks
 * of gold that started equal. The one under a glass dome stands tall, sheltered the way the right
 * account or structure shelters a return; the one left out in the open is shorter, and its coins
 * keep lifting away, the tax drag the lesson calls the biggest hidden cost in alternatives. A framed
 * tax form with a red percent sign hangs on the wall, and the collector studies the two stacks
 * through the magnifier. Only small layers move: two coins rise off the open stack, the dome glints,
 * the collector blinks, the lens glints and a mote drifts up. The keepsake is the tax form
 * (ai-kit-c.ts, where the advanced capstone finds it again).
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  AI_COLLECTOR_EYE,
  AI_COLLECTOR_GLARE,
  aiCollector,
  aiCollectorBlink,
  aiCompose,
  aiGallery,
  aiGlint,
  aiKeepsake,
  aiLensGlare,
  aiMoteGold,
  aiPictureLight,
  aiShadow,
} from './ai-kit';
import { aiCoin } from './ai-kit-b';
import { aiTaxForm } from './ai-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** A framed tax form: TAX across the top, filled boxes, a signature and a red percent sign. */
const form: PixelSprite = {
  id: 'ai21-form',
  name: 'ai21-form',
  tags: ['scene', 'ai'],
  blurb: "A framed tax form: the word TAX, filled-in boxes, a signature and a big red percent sign.",
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOO',
    'OyGGGGGGGGGGGGGGGGGGGGgO',
    'OGwwwwwwwwwwwwwwwwwwwwgO',
    'OGwKKKwwKwwKwKwwwwwwwwgO',
    'OGwwKwwKwKwKwKwwXXXXXXgO',
    'OGwwKwwKKKwwKwwwwwwwwwgO',
    'OGwwKwwKwKwKwKwwXXXXwwgO',
    'OGwwKwwKwKwKwKwwwwwwwwgO',
    'OGwwwwwwwwwwwwwwwwwwwwgO',
    'OGwXXXXXXXXXXXXXXXXXXwgO',
    'OGwwwwwwwwwwwwwwwwwwwwgO',
    'OGwxxxxxwXXXXXXXXXXXXwgO',
    'OGwwwwwwwXwwwwwwwwwwXwgO',
    'OGwwwwwwwXXXXXXXXXXXXwgO',
    'OGwwwwwwwwwwwwwwwwwwwwgO',
    'OGwxxxxwwXXXXXXXXXXXXwgO',
    'OGwwwwwwwXwwwwwwwwwwXwgO',
    'OGwwwwwwwXXXXXXXXXXXXwgO',
    'OGwwwwwwwwwwwwwwwwwwwwgO',
    'OGwwwwwwwwwwwwwRRwwwRwgO',
    'OGwwwwwwwwwwwwwRRwwRwwgO',
    'OGwwwwwwwwwwwwwwwwRwwwgO',
    'OGwwPPwwwPwwwwwwwRwwwwgO',
    'OGwPwwPPPwPPwwwwRwwRRwgO',
    'OGwXXXXXXXXXwwwRwwwRRwgO',
    'OGwwwwwwwwwwwwwwwwwwwwgO',
    'OGgggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** The sheltered stack: tall, as it started. */
const tallStack: PixelSprite = {
  id: 'ai21-tall-stack',
  name: 'ai21-tall-stack',
  tags: ['scene', 'ai'],
  blurb: "A tall stack of gold coins.",
  rows: [
    '.yyyyyy.',
    'OGGGGGGO',
    'OggggggO',
    'OGGGGGGO',
    'OggggggO',
    'OGGGGGGO',
    'OggggggO',
    'OGGGGGGO',
    'OggggggO',
    'OGGGGGGO',
    'OggggggO',
    'OGGGGGGO',
  ],
};

/** The stack left in the open: shorter, on a gold foot like the dome's. */
const shortStack: PixelSprite = {
  id: 'ai21-short-stack',
  name: 'ai21-short-stack',
  tags: ['scene', 'ai'],
  blurb: "A short stack of gold coins on a gold foot.",
  rows: [
    '..yyyyyy..',
    '.OGGGGGGO.',
    '.OggggggO.',
    '.OGGGGGGO.',
    '.OggggggO.',
    '.OGGGGGGO.',
    '.OggggggO.',
    'OGGGGGGGgO',
  ],
};

/** A glass dome on a gold foot; the stack inside is stamped first and shows through. */
const dome: PixelSprite = {
  id: 'ai21-dome',
  name: 'ai21-dome',
  tags: ['scene', 'ai'],
  blurb: "A glass bell jar with a brass knob on a gold foot.",
  rows: [
    '......GG......',
    '.....OGgO.....',
    '....xxxxxx....',
    '..xx......xx..',
    '.x..........x.',
    '.xw.........x.',
    'x.w..........x',
    'x.w..........x',
    'x.w..........x',
    'x.w..........x',
    'x.w..........x',
    'x.w..........x',
    'x............x',
    'x............x',
    'x............x',
    'x............x',
    'xxxxxxxxxxxxxx',
    'OGGGGGGGGGGGgO',
  ],
};

const FORM = [3, 8] as const;
const DOME = [50, 25] as const;
const OPEN = [66, 35] as const;
const COLLECTOR = [27, 30] as const;

const base = aiCompose('ai21-opener-base', aiGallery.rows, [
  [form, FORM[0], FORM[1]],
  [aiPictureLight, FORM[0] + 9, FORM[1] - 3],
  [tallStack, DOME[0] + 3, DOME[1] + 5],
  [dome, DOME[0], DOME[1]],
  [shortStack, OPEN[0], OPEN[1]],
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollector, COLLECTOR[0], COLLECTOR[1]],
]);

export const ai21Opener: SceneArt = {
  id: 'ai21-opener',
  label: 'A collector studies two stacks of gold coins on a shelf, a tall one sheltered under a glass dome and a short one losing coins into the air, beside a framed tax form with a red percent sign.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aiCoin, x: OPEN[0] + 3, y: OPEN[1] - 5, motion: { kind: 'rise', amp: 7, periodMs: 2600, phase: 0.1 } },
    { sprite: aiCoin, x: OPEN[0] + 6, y: OPEN[1] - 9, motion: { kind: 'rise', amp: 7, periodMs: 3100, phase: 0.6 } },
    { sprite: aiGlint, x: DOME[0] + 1, y: DOME[1] + 2, motion: { kind: 'twinkle', periodMs: 2000, min: 0.3 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiLensGlare, x: COLLECTOR[0] + AI_COLLECTOR_GLARE[0], y: COLLECTOR[1] + AI_COLLECTOR_GLARE[1], motion: { kind: 'twinkle', periodMs: 1500, min: 0.3 } },
    { sprite: aiMoteGold, x: 31, y: 18, motion: { kind: 'rise', amp: 5, periodMs: 3200, phase: 0.4 } },
  ],
};

export const ai21Finish = aiKeepsake(
  'ai21-finish',
  'A tax form with a folded corner and a red percent sign floating in a glass display case on a marble plinth, with sparkles around it.',
  aiTaxForm,
);

export const art: LessonArtSet = { opener: ai21Opener, backdrop: aiBackdrop, finish: ai21Finish };
