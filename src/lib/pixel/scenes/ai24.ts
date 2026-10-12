/**
 * Alternative Investments lesson 24: regulation and compliance.
 *
 * The opener is the vault gallery (ai-kit.ts) at a door the rules guard: a columned doorway into a
 * lit inner room, a velvet rope strung across it between gold posts, and the scales of justice in
 * gold over the lintel, because the private funds behind it are open only to investors the rules
 * say may enter (accredited investors, qualified purchasers). The collector steps up holding a pass,
 * and a framed registration certificate with a gold seal hangs on the wall, the filing anyone can
 * look up. Only small layers move: the two pans of the scales rise and settle in turn, the pass
 * glints, the collector blinks and motes drift up in the room beyond. The keepsake is the scales
 * (ai-kit-c.ts, where the advanced capstone finds them again).
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  AI_COLLECTOR_EYE,
  aiCollectorBlink,
  aiCompose,
  aiGallery,
  aiGlintGold,
  aiKeepsake,
  aiMoteGold,
  aiPainting,
  aiPictureLight,
  aiShadow,
} from './ai-kit';
import { AI_COLLECTOR_HAND, aiCollectorRaise } from './ai-kit-a';
import { aiLedgeCover, aiScales } from './ai-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** A doorway: a marble lintel on two fluted columns with gold capitals, a lit gallery room inside. */
const doorway: PixelSprite = {
  id: 'ai24-doorway',
  name: 'ai24-doorway',
  tags: ['scene', 'ai'],
  blurb: "A classical doorway: a marble lintel on two fluted columns, a lit gallery room beyond.",
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'OGGGGGGGOddddddddddddddddddddddOGGGGGGGO',
    '.xxxxxxxddddddddddddddddddddddddxxxxxxx.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDddddddddddddddddddddddddDwxwxXD.',
    '.DwxwxXDOOOOOOOOOOOOOOOOOOOOOOOODwxwxXD.',
    '.DwxwxXDkkkkkkkkkkkkkkkkkkkkkkkkDwxwxXD.',
    'xxxxxxxxXkkkkkkkkkkkkkkkkkkkkkkxxxxxxxxX',
    'DDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDD',
  ],
};

/** aiScales with its pans taken off: they hang on as two layers of their own so they can rise in turn. */
const scalesStand: PixelSprite = {
  id: 'ai24-scales-stand',
  name: 'ai24-scales-stand',
  tags: [],
  rows: aiScales.rows.map((row, y) => (y >= 3 && y <= 8 ? '......Gg......' : row)),
};

/** One pan of the scales on its strings, as cut from aiScales. */
const pan: PixelSprite = { id: 'ai24-pan', name: 'ai24-pan', tags: [], rows: aiScales.rows.slice(3, 9).map((row) => row.slice(0, 5)) };

/** A gold stanchion: ball top, the collar the rope hooks on, a weighted foot. */
const post: PixelSprite = {
  id: 'ai24-post',
  name: 'ai24-post',
  tags: ['scene', 'ai'],
  blurb: "A gold rope stanchion.",
  rows: [
    '.yG.',
    'OGgO',
    '.Gg.',
    '.Gg.',
    '.Gg.',
    '.Gg.',
    '.Gg.',
    '.Gg.',
    '.Gg.',
    '.Gg.',
    '.Gg.',
    'OGgO',
    'OOOO',
  ],
};

/** The red velvet rope, sagging between the two posts. */
const rope: PixelSprite = {
  id: 'ai24-rope',
  name: 'ai24-rope',
  tags: ['scene', 'ai'],
  blurb: "A red velvet rope, sagging.",
  rows: [
    'R......................R',
    'rRR..................RRr',
    '.rrRR..............RRrr.',
    '...rrRRR........RRRrr...',
    '.....rrrRRRRRRRRrrr.....',
    '........rrrrrrrr........',
  ],
};

/** A framed registration certificate: title, lines, a signature and a gold seal. */
const certificate: PixelSprite = {
  id: 'ai24-certificate',
  name: 'ai24-certificate',
  tags: ['scene', 'ai'],
  blurb: "A framed certificate with a title, lines of text, a signature and a gold seal.",
  rows: [
    'OOOOOOOOOOOOOOOOOO',
    'OwwwwwwwwwwwwwwwwO',
    'OwKKKKKKKKKKKKwwwO',
    'OwwwwwwwwwwwwwwwwO',
    'OwxxxxxxxxxxxxxxwO',
    'OwwwwwwwwwwwwwwwwO',
    'OwxxxxxxxxxxxwwwwO',
    'OwwwwwwwwwwwwwwwwO',
    'OwxxxxxxxxwwOGGOwO',
    'OwwwwwwwwwwwGyGGwO',
    'OwPwPPwPwPwwGGGgwO',
    'OwXXXXXXXXwwOGgOwO',
    'OOOOOOOOOOOOOOOOOO',
  ],
};

/** The pass the collector holds up: a white card with an orchid band and a gold star. */
const pass: PixelSprite = {
  id: 'ai24-pass',
  name: 'ai24-pass',
  tags: ['scene', 'ai'],
  blurb: "A white pass card with an orchid band and a gold star.",
  rows: [
    'DDDDDDD',
    'DPPPPPD',
    'DwwwyGD',
    'DxxwGgD',
    'DDDDDDD',
  ],
};

const DOOR = [38, 21] as const;
const SCALES = [51, 6] as const;
const POSTS = [[43, 45], [69, 45]] as const;
const CERT = [6, 9] as const;
const COLLECTOR = [8, 30] as const;
const HAND = [COLLECTOR[0] + AI_COLLECTOR_HAND[0], COLLECTOR[1] + AI_COLLECTOR_HAND[1]] as const;

const base = aiCompose('ai24-opener-base', aiGallery.rows, [
  aiLedgeCover,
  [doorway, DOOR[0], DOOR[1]],
  [aiPictureLight, DOOR[0] + 18, DOOR[1] + 4],
  [aiPainting, DOOR[0] + 15, DOOR[1] + 7],
  [scalesStand, SCALES[0], SCALES[1]],
  [certificate, CERT[0], CERT[1]],
  [aiPictureLight, CERT[0] + 6, CERT[1] - 3],
  [rope, POSTS[0][0] + 3, POSTS[0][1] + 1],
  ...POSTS.map(([x, y]) => [post, x, y] as const),
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollectorRaise, COLLECTOR[0], COLLECTOR[1]],
  [pass, HAND[0] - 3, HAND[1] - 5],
]);

export const ai24Opener: SceneArt = {
  id: 'ai24-opener',
  label: 'A collector holds up a pass at a red velvet rope strung across a columned doorway into a lit inner gallery, gold scales of justice over the door and a framed certificate on the wall.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pan, x: SCALES[0], y: SCALES[1] + 3, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
    { sprite: pan, x: SCALES[0] + 9, y: SCALES[1] + 3, motion: { kind: 'bob', amp: 1, periodMs: 2600, phase: 0.5 } },
    { sprite: aiGlintGold, x: HAND[0] + 1, y: HAND[1] - 8, motion: { kind: 'twinkle', periodMs: 1700, min: 0.35 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiMoteGold, x: DOOR[0] + 12, y: DOOR[1] + 17, motion: { kind: 'rise', amp: 6, periodMs: 3000, phase: 0.2 } },
    { sprite: aiMoteGold, x: DOOR[0] + 29, y: DOOR[1] + 14, motion: { kind: 'rise', amp: 6, periodMs: 3400, phase: 0.7 } },
  ],
};

export const ai24Finish = aiKeepsake(
  'ai24-finish',
  'Gold scales of justice with two level pans floating in a glass display case on a marble plinth, with sparkles around it.',
  aiScales,
);

export const art: LessonArtSet = { opener: ai24Opener, backdrop: aiBackdrop, finish: ai24Finish };
