/**
 * Behavioral Finance lesson 23: behavioral economics in everyday life, on the fairground stage.
 *
 * The decoy effect at the popcorn stand. The menu offers a small tub for $3, a medium for $6 and a large
 * for $7: nobody is meant to buy the medium, it is there to make the large look like a steal. System 1
 * took the bait whole: the hare sits inside the giant tub, popcorn flying out of it. The tortoise,
 * behaviorally literate, has the small tub it came for. Anchors, decoys and defaults run the shop, the
 * menu and the negotiation as much as the market. The stage and its lights are bf-kit-a.ts.
 *
 * The keepsake jar holds a gold price tag on a string.
 */
import type { PixelSprite } from '../types';
import { bfHare, bfShadowNarrow, bfShadowWide, bfTortoise } from './bf-kit';
import { bfFairground, bfFairgroundLayers, bfMirror } from './bf-kit-a';
import { BF_TORTOISE_MOUTH, bfStamp } from './bf-kit-b';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The stand's menu under a striped awning: three tub sizes, $3, $6 and $7. */
const menu: PixelSprite = {
  id: 'bf23-menu',
  name: 'bf23-menu',
  tags: ['prop', 'bf23'],
  rows: [
    '.RRwwwRRRwwwRRRwwwRRRwwwRRRwww.',
    'RRRwwwRRRwwwRRRwwwRRRwwwRRRwwwR',
    'RRRwwwRRRwwwRRRwwwRRRwwwRRRwwwR',
    'rr.xx.rr.xx.rr.xx.rr.xx.rr.xx.r',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DwwwwwwwwwwwwwwwwwwwwwwwwwwwwwD',
    'DwwwwwwwwwwwwwwwwwwwwwwyyyyywwD',
    'DwwwwwwwwwwwwwyyywwwwwyyyyyyywD',
    'DwwwwywwwwwwwyyyyywwwwRwRwRwRwD',
    'DwwwRwRwwwwwwRwRwRwwwwRwRwRwRwD',
    'DwwwRwRwwwwwwRwRwRwwwwRwRwRwRwD',
    'DwwwwwwwwwwwwwwwwwwwwwwwwwwwwwD',
    'DwwKwwwwwwwwwKwwwwwwwwwKwwwwwwD',
    'DwKKKwKKKwwwKKKwKKKwwwKKKwKKKwD',
    'DwKwwwwwKwwwKwwwKwwwwwKwwwwwKwD',
    'DwKKKwwKKwwwKKKwKKKwwwKKKwwKwwD',
    'DwwwKwwwKwwwwwKwKwKwwwwwKwwKwwD',
    'DwKKKwKKKwwwKKKwKKKwwwKKKwwKwwD',
    'DwwKwwwwwwwwwKwwwwwwwwwKwwwwwwD',
    'DwwwwwwwwwwwwwwwwwwwwwwwwwwwwwD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '...XD......................XD..',
    '..DDDD....................DDDD.',
  ],
};

/** The large tub, popcorn heaped over the rim, red and white stripes narrowing to the base. */
const giantTub: PixelSprite = {
  id: 'bf23-giant-tub',
  name: 'bf23-giant-tub',
  tags: ['prop', 'bf23'],
  rows: [
    '....w.y.yw.w.......',
    '..ywywyywyywyyw....',
    '.ywyGywyywyGyywyw..',
    'ywyywyyGywyywyywyw.',
    'DDDDDDDDDDDDDDDDDD.',
    'DRRwwwRRRwwwRRRwwD.',
    'DRRwwwRRRwwwRRRwwD.',
    'DRRwwwRRRwwwRRRwwD.',
    'DRRwwwRRRwwwRRRwwD.',
    'DRRwwwRRRwwwRRRwwD.',
    '.DRRwwwRRRwwwRRRD..',
    '.DRRwwwRRRwwwRRRD..',
    '.DRRwwwRRRwwwRRRD..',
    '.DRRwwwRRRwwwRRRD..',
    '.DrrrrrrrrrrrrrrD..',
    '..DDDDDDDDDDDDDD...',
  ],
};

/** The hare's head and ears, cut from the kit hare above the shoulders, blinking as it does. */
const head = (rows: string[]) => rows.slice(0, 16);
const hareHead: PixelSprite = { ...bfHare, id: 'bf23-hare-head', rows: head(bfHare.rows), frames: (bfHare.frames ?? []).map(head) };

/** System 1 sitting in the biggest tub, the decoy's work done, facing the menu. */
const hareInTub = bfStamp(hareHead, 'bf23-hare-in-tub', giantTub, 2, 15);

/** A kernel popping out of the tub. */
const kernel: PixelSprite = {
  id: 'bf23-kernel',
  name: 'bf23-kernel',
  tags: ['prop', 'bf23'],
  rows: [
    '.w.',
    'wyw',
    '.w.',
  ],
};

/** The small tub, the one the tortoise came for. */
const smallTub: PixelSprite = {
  id: 'bf23-small-tub',
  name: 'bf23-small-tub',
  tags: ['prop', 'bf23'],
  rows: [
    '.ywy.',
    'ywyyw',
    'DDDDD',
    'DRwRD',
    'DRwRD',
    'DDDDD',
  ],
};

/** The tortoise with its small tub, come from the other side of the stand. */
const tortoiseSmallTub = bfMirror(
  bfStamp(bfTortoise, 'bf23-tortoise-small-tub-right', smallTub, BF_TORTOISE_MOUTH.x + 1, BF_TORTOISE_MOUTH.y + 1, BF_TORTOISE_MOUTH.dys),
  'bf23-tortoise-small-tub',
);

export const bf23Opener: SceneArt = {
  id: 'bf23-opener',
  label: 'At a night fairground popcorn stand, a menu prices a small tub at $3, a medium at $6 and a large at $7, and a hare sits inside the giant tub as popcorn flies while a calm tortoise carries a small one.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...bfFairgroundLayers,
    { sprite: menu, x: 25, y: 11 },
    { sprite: bfShadowNarrow, x: 3, y: 56 },
    { sprite: bfShadowWide, x: 45, y: 56 },
    { sprite: tortoiseSmallTub, x: 39, y: 40 },
    { sprite: hareInTub, x: 0, y: 25 },
    { sprite: kernel, x: 3, y: 37, motion: { kind: 'rise', amp: 8, periodMs: 1700 } },
    { sprite: kernel, x: 10, y: 36, motion: { kind: 'rise', amp: 9, periodMs: 2100, phase: 0.4 } },
    { sprite: kernel, x: 17, y: 39, motion: { kind: 'rise', amp: 7, periodMs: 1900, phase: 0.75 } },
  ],
};

/** The keepsake emblem: a gold price tag with a dollar sign, hung on a white string. */
const emblemPriceTag: PixelSprite = {
  id: 'bf23-emblem-price-tag',
  name: 'bf23-emblem-price-tag',
  tags: ['emblem', 'bf', 'lesson-23'],
  blurb: "Lesson 23's emblem: everyday anchors and decoys caught as a gold price tag on a string.",
  rows: [
    '................',
    '....ww..........',
    '...w..w.........',
    '..w...w.........',
    '..w..OOOOOOOOOOO',
    '...wOyyyyyyyyyyO',
    '...OyGGGGGOGGGgO',
    '..OyGGGGGOOOGGgO',
    '.OyGOOOGGOGGGGgO',
    'OyGGO.OGGOOOGGgO',
    '.OyGOOOGGGGOGGgO',
    '..OyGGGGGOOOGGgO',
    '...OyGGGGGOGGGgO',
    '....OygggggggggO',
    '.....OOOOOOOOOOO',
    '................',
  ],
};

export const bf23Finish: SceneArt = bfKeepsake(
  'bf23-finish',
  'A corked glass jar with a paper tag, holding a gold price tag with a dollar sign on a white string, with bubbles rising inside and sparkles around it.',
  emblemPriceTag,
);

export const art: LessonArtSet = { opener: bf23Opener, backdrop: bfBackdrop, finish: bf23Finish };
