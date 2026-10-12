/**
 * Behavioral Finance lesson 20: social media and modern market psychology, on the fairground stage.
 *
 * The midway's new attraction is a phone as tall as the big top, showing one viral post: a stock chart
 * gone vertical, a heart, the likes piling up, hearts rising off it into the night. System 1 is right
 * there in front of it, phone held high, filming the hype (FOMO, the echo chamber, the cascade). The
 * tortoise brings the 48-hour rule: a stopwatch held in its mouth, the hand ticking round. See the post,
 * wait it out, read the filings, then decide. The stage and its lights are bf-kit-a.ts.
 *
 * The keepsake jar holds a phone with a heart on its screen.
 */
import type { PixelSprite } from '../types';
import { bfShadowNarrow, bfShadowWide, bfStar, bfTortoise } from './bf-kit';
import { bfFairground, bfFairgroundLayers, bfMirror } from './bf-kit-a';
import { BF_TORTOISE_MOUTH, bfStamp } from './bf-kit-b';
import { BF_HARE_FIST, bfHareRaise, bfHeadroom, bfHeart } from './bf-kit-c';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The viral post on a phone the size of a tent: who posted, the chart gone vertical, the likes. */
const giantPhone: PixelSprite = {
  id: 'bf20-giant-phone',
  name: 'bf20-giant-phone',
  tags: ['prop', 'bf20'],
  rows: [
    '.DDDDDDDDDDDDDDDDDD.',
    'DXXXXXXXXXXXXXXXXXXD',
    'DXXXXXXXDDDDXXXXXXXD',
    'DXwwwwwwwwwwwwwwwwXD',
    'DXwFFwxxxxxxwwwwwwXD',
    'DXwFFwwwwwwwwwwwwwXD',
    'DXwwwwwwwwwwwwwwwwXD',
    'DXkkkkkkkkkkkkkkkkXD',
    'DXkkkkkkkkkkkkkkNkXD',
    'DXkkkkkkkkkkkkkNmkXD',
    'DXkkkkkkkkkkkkkNkkXD',
    'DXkkkkkkkkkkkkNkkkXD',
    'DXkkkkkkkkkkkkNkkkXD',
    'DXkkkkkkkkkkkNkkkkXD',
    'DXkkkkkkkkkkkNkkkkXD',
    'DXkkkkkkkkkkNkkkkkXD',
    'DXkkkkNNkkNNNkkkkkXD',
    'DXkNNkkNNkkkkkkkkkXD',
    'DXkkkkkkkkkkkkkkkkXD',
    'DXwwwwwwwwwwwwwwwwXD',
    'DXwFwFwwxxxxxwwwwwXD',
    'DXwFFFwwwwwwwwwwwwXD',
    'DXwwFwwwwwwwwwwwwwXD',
    'DXwwwwwwwwwwwwwwwwXD',
    'DXwxxxxxxxxxxxwwwwXD',
    'DXwwwwwwwwwwwwwwwwXD',
    'DXwxxxxxxxxwwwwwwwXD',
    'DXwwwwwwwwwwwwwwwwXD',
    'DXXXXXXXXXXXXXXXXXXD',
    'DXXXXXXXwwwwXXXXXXXD',
    'DXXXXXXXXXXXXXXXXXXD',
    '.DDDDDDDDDDDDDDDDDD.',
  ],
};

/** The hare's own phone, the same heart on its screen, held up to film the big one. */
const phone: PixelSprite = {
  id: 'bf20-phone',
  name: 'bf20-phone',
  tags: ['prop', 'bf20'],
  rows: [
    '.DDDDD.',
    'DBBBBBD',
    'DBFBFBD',
    'DBFFFBD',
    'DBBFBBD',
    'DBBBBBD',
    'DBBBBBD',
    'DbbbbbD',
    'DDDDDDD',
  ],
};

/** System 1 filming the hype, phone held high; it faces the giant screen. */
const hareFilming = bfMirror(
  bfStamp(bfHeadroom(bfHareRaise, 'bf20-hare-raise-tall', 4), 'bf20-hare-filming-right', phone, BF_HARE_FIST.x - 2, BF_HARE_FIST.y - 5),
  'bf20-hare-filming',
);

/** The 48-hour rule: a stopwatch hung from the tortoise's mouth by its crown, the hand going round. */
const stopwatch: PixelSprite = {
  id: 'bf20-stopwatch',
  name: 'bf20-stopwatch',
  tags: ['prop', 'bf20'],
  rows: [
    '...DxD...',
    '..DDDDD..',
    '.DXXXXXD.',
    'DXwwwwwXD',
    'DwwwwwwwD',
    'DwwwKwwwD',
    'DwwwwwwwD',
    'DXwwwwwXD',
    '.DXXXXXD.',
    '..DDDDD..',
  ],
};

const handUp: PixelSprite = { id: 'bf20-hand-up', name: 'bf20-hand-up', tags: ['prop', 'bf20'], rows: ['R', 'R'] };
const handAcross: PixelSprite = { id: 'bf20-hand-across', name: 'bf20-hand-across', tags: ['prop', 'bf20'], rows: ['RR'] };

const walk = bfTortoise.frames ?? [bfTortoise.rows];
const tortoiseFour: PixelSprite = { ...bfTortoise, id: 'bf20-tortoise-four', frames: [walk[0], walk[1], walk[0], walk[1]] };

/** The watch's top-left, so its crown sits where the kit clipboard's clip does. */
const watch = { x: BF_TORTOISE_MOUTH.x - 1, y: BF_TORTOISE_MOUTH.y };
const tortoiseWaiting = [
  { prop: handUp, dx: 4, dy: 3, dys: [0, null, null, null] },
  { prop: handAcross, dx: 5, dy: 5, dys: [null, 1, null, null] },
  { prop: handUp, dx: 4, dy: 6, dys: [null, null, 0, null] },
  { prop: handAcross, dx: 2, dy: 5, dys: [null, null, null, 1] },
].reduce(
  (sprite, hand, i) => bfStamp(sprite, `bf20-tortoise-waiting-${String(i)}`, hand.prop, watch.x + hand.dx, watch.y + hand.dy, hand.dys),
  bfStamp(tortoiseFour, 'bf20-tortoise-watch', stopwatch, watch.x, watch.y, [0, 1, 0, 1]),
);

/** The big top's stars sit where the giant phone stands; one star moves out into clear sky. */
const stage = bfFairgroundLayers.filter((layer) => !layer.sprite.id.startsWith('bf-star'));

export const bf20Opener: SceneArt = {
  id: 'bf20-opener',
  label: 'At a night fairground, a phone as tall as a tent shows a viral post with hearts rising off it, while a hare films it on its own phone and a calm tortoise holds a ticking stopwatch.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...stage,
    { sprite: bfStar, x: 27, y: 17, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: bfShadowNarrow, x: 33, y: 46 },
    { sprite: giantPhone, x: 33, y: 14 },
    { sprite: bfHeart, x: 47, y: 12, motion: { kind: 'rise', amp: 8, periodMs: 2400 } },
    { sprite: bfHeart, x: 40, y: 9, motion: { kind: 'rise', amp: 7, periodMs: 2800, phase: 0.45 } },
    { sprite: bfHeart, x: 52, y: 17, motion: { kind: 'rise', amp: 9, periodMs: 2600, phase: 0.75 } },
    { sprite: bfShadowWide, x: 0, y: 56 },
    { sprite: bfShadowNarrow, x: 56, y: 56 },
    { sprite: tortoiseWaiting, x: 0, y: 41 },
    { sprite: hareFilming, x: 53, y: 25 },
  ],
};

/** The keepsake emblem: a phone, a big heart on its screen beating, a red badge on its corner. */
const emblemPhone: PixelSprite = {
  id: 'bf20-emblem-phone',
  name: 'bf20-emblem-phone',
  tags: ['emblem', 'bf', 'lesson-20'],
  blurb: "Lesson 20's emblem: social media caught as a phone with a beating heart on its screen.",
  rows: [
    '..DDDDDDDDD.11.',
    '.DXXXXXXXXX1RR1',
    '.DXbbbbbbbX1RR1',
    '.DXbbbbbbbXD11.',
    '.DXbFFbFFbXD...',
    '.DXFWFFFFFXD...',
    '.DXFFFFFFFXD...',
    '.DXbFFFFFbXD...',
    '.DXbbFFFbbXD...',
    '.DXbbbFbbbXD...',
    '.DXbbbbbbbXD...',
    '.DXbbbbbbbXD...',
    '.DXbBBBBBbXD...',
    '.DXbbbbbbbXD...',
    '.DXXXXXXXXXD...',
    '.DXXXwwwXXXD...',
    '..DDDDDDDDD....',
  ],
  frames: [
    [
      '..DDDDDDDDD.11.',
      '.DXXXXXXXXX1RR1',
      '.DXbbbbbbbX1RR1',
      '.DXbbbbbbbXD11.',
      '.DXbFFbFFbXD...',
      '.DXFWFFFFFXD...',
      '.DXFFFFFFFXD...',
      '.DXbFFFFFbXD...',
      '.DXbbFFFbbXD...',
      '.DXbbbFbbbXD...',
      '.DXbbbbbbbXD...',
      '.DXbbbbbbbXD...',
      '.DXbBBBBBbXD...',
      '.DXbbbbbbbXD...',
      '.DXXXXXXXXXD...',
      '.DXXXwwwXXXD...',
      '..DDDDDDDDD....',
    ],
    [
      '..DDDDDDDDD.11.',
      '.DXXXXXXXXX1RR1',
      '.DXbbbbbbbX1RR1',
      '.DXbbbbbbbXD11.',
      '.DXbbbbbbbXD...',
      '.DXbbFbFbbXD...',
      '.DXbFWFFFbXD...',
      '.DXbFFFFFbXD...',
      '.DXbbFFFbbXD...',
      '.DXbbbFbbbXD...',
      '.DXbbbbbbbXD...',
      '.DXbbbbbbbXD...',
      '.DXbBBBBBbXD...',
      '.DXbbbbbbbXD...',
      '.DXXXXXXXXXD...',
      '.DXXXwwwXXXD...',
      '..DDDDDDDDD....',
    ],
  ],
  frameMs: 450,
};

export const bf20Finish: SceneArt = bfKeepsake(
  'bf20-finish',
  'A corked glass jar with a paper tag, holding a phone with a pink heart beating on its screen and a red badge on its corner, with bubbles rising inside and sparkles around it.',
  emblemPhone,
);

export const art: LessonArtSet = { opener: bf20Opener, backdrop: bfBackdrop, finish: bf20Finish };
