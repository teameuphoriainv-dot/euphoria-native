/**
 * Alternative Investments lesson 19: due diligence for alternatives.
 *
 * The opener is a close-up, the one time the pathway leans in: the collector's own magnifier over a
 * fund's papers on a dark desk under a green banker's lamp. Outside the lens the page looks fine, a
 * letterhead, neat lines, a return chart that climbs in a perfectly straight line and a checklist
 * being ticked off. Inside the lens a red flag stands planted in the page, because the lesson is
 * that every major fraud left red flags that checking would have found (Madoff's returns were
 * too smooth to be real). Only small layers move: the flag ripples, a tick is drawn in the box,
 * the lamp's bulb glows, the rim glints and dust drifts up in the lamplight. The keepsake is the
 * magnifier itself, red flag and all (ai-kit-c.ts, where the advanced capstone finds it again).
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiCompose, aiKeepsake, aiMoteGold } from './ai-kit';
import { aiMagnifier } from './ai-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** The close-up's ground: gallery wall, the desk's gold-inlaid far edge, the dark desk top. */
const desk: readonly string[] = [
  ...Array.from({ length: 20 }, () => 'a'.repeat(80)),
  'g'.repeat(80),
  'O'.repeat(80),
  ...Array.from({ length: 38 }, () => 'k'.repeat(80)),
];

/** The lamp's warm wash on the wall round its shade. */
const wash: PixelSprite = {
  id: 'ai19-wash',
  name: 'ai19-wash',
  tags: [],
  rows: [
    '............................',
    '............................',
    '............d...............',
    '......ddddddddddddd.........',
    '....ddddddddddddddddd.......',
    '..ddddddddddddddddddddd.....',
    '.ddddddddddddddddddddddd....',
    'ddddddddddddddddddddddddd...',
    'dddddddddddddddddddddddddd..',
    'dddddddddddddddddddddddddd..',
    'dddddddddddddddddddddddddd..',
    'ddddddddddddddddddddddddddd.',
    'dddddddddddddddddddddddddd..',
    'dddddddddddddddddddddddddd..',
    'dddddddddddddddddddddddddd..',
    'ddddddddddddddddddddddddd...',
    '.ddddddddddddddddddddddd....',
    '..ddddddddddddddddddddd.....',
    '....ddddddddddddddddd.......',
    '......ddddddddddddd.........',
  ],
};

/** A green banker's lamp: glass shade, brass trim, the bulb's glow under it, a brass stem and foot. */
const lamp: PixelSprite = {
  id: 'ai19-lamp',
  name: 'ai19-lamp',
  tags: ['scene', 'ai'],
  blurb: "A banker's desk lamp with a green glass shade and a brass stem.",
  rows: [
    '....nnnnnnnnnnnn....',
    '..nnNNNmmNNNNNNNnn..',
    '.nNNNNmmNNNNNNNNNNn.',
    'nNNNNmmNNNNNNNNNNNNn',
    'nnnnnnnnnnnnnnnnnnnn',
    '.OGGGGGGGGGGGGGGGGO.',
    '...GGGGGGGGGGGGGG...',
    '.........Og.........',
    '.........Og.........',
    '.........Og.........',
    '.........Og.........',
    '.........Og.........',
    '.........Og.........',
    '.......OOGgOO.......',
    '....OyGGGGGGGgO.....',
    '...OGGGGGGGGGGGO....',
    '...OOOOOOOOOOOOO....',
  ],
};

/** The bulb's light under the shade, brightening and settling. */
const glow: PixelSprite = { id: 'ai19-glow', name: 'ai19-glow', tags: [], rows: ['y'.repeat(14)] };

/** The sheet underneath, showing at the top and the right of the page on top. */
const under: PixelSprite = {
  id: 'ai19-under',
  name: 'ai19-under',
  tags: [],
  rows: Array.from({ length: 36 }, (_, y) => (y === 0 ? 'X' : 'x').repeat(50) + 'X'),
};

/** The fund's page: letterhead, lines of text, a return chart that is a ruler-straight line, a checkbox. */
const page: PixelSprite = {
  id: 'ai19-page',
  name: 'ai19-page',
  tags: ['scene', 'ai'],
  blurb: "A fund's report page: letterhead, text, a chart climbing in a perfectly straight line, a checklist box.",
  rows: [
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwGwwEEEEEEEEEEEEEEEEwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwGyGwPPPPPPPPPPPPPPPPwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwGwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwxxxxxxxxxxxwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXXXXXXXXXXXXXXXXXXXwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXXXXXXXXXXXXXXXXwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXXXXXXXXXXXXXXXXXXwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXXXXXXXXXXXXXwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwwwwwwwwwwwwwwwnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwwwwwwwwwwwwwnnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwwwwwwwwwwwnnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwwwwwwwwwwnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwwwwwwwwnnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwwwwwwnnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwwwwwnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwwwnnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwnnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXnwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXXXXXXXXXXXXXXXXXwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXXXwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXwXwXXXXXXXXXXXXXwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwXXXwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
  ],
};

/** The magnifier's lens: gold rim, and the page seen big through the glass, a flag pole planted in it. */
const lens: PixelSprite = {
  id: 'ai19-lens',
  name: 'ai19-lens',
  tags: ['scene', 'ai'],
  blurb: "A big round lens with a gold rim, magnifying the page under it, a flag pole planted in the paper.",
  rows: [
    '..........OOOOOOO..........',
    '........OOGGGGGGGOO........',
    '......OOGGGGGGGGGGGOO......',
    '.....OGGGyyyyxyyyyGGGO.....',
    '....OGGyyxxxwwwxxxyyGGO....',
    '...OGGyxxXXXXXXXXXxxyGGO...',
    '..OGGyxxXXXXXXXXXXXxxgGGO..',
    '..OGyxxwwwwwwwwwwwwwxxgGO..',
    '.OGGyxwwwwwwwwwwwwwwwxgGGO.',
    '.OGyxwwwwwwDXwwwwwwwwwxgGO.',
    'OGGyxwwwwwwDXwwwwwwwwwxgGGO',
    'OGGyxwwwwwwDXwwwwwwwwwxgGGO',
    'OGGywwwwwwwDXwwwwwwwwwwgGGO',
    'OGGxwwwwwwwDXwwwwwwwwwwxGGO',
    'OGGywwwwwwwDXwwwwwwwwwwgGGO',
    'OGGyxwwwwwwDXwwwwwwwwwxgGGO',
    'OGGyxwwwwwwDXwwwwwwwwwxgGGO',
    '.OGyxwwwwwwDXwwwwwwwwwxgGO.',
    '.OGGyxwwwwwDXwwwwwwwwxgGGO.',
    '..OGyxxXXXwDXwwXXXXXxxgGO..',
    '..OGGyxxXXwDXwwXXXXxxgGGO..',
    '...OGGgxxwDDDDwwwwxxgGGO...',
    '....OGGggxxxwwwxxxggGGO....',
    '.....OGGGggggxggggGGGO.....',
    '......OOGGGGGGGGGGGOO......',
    '........OOGGGGGGGOO........',
    '..........OOOOOOO..........',
  ],
};

/** The magnifier's handle running off the rim, gripped by the collector's hand in an orchid sleeve. */
const hand: PixelSprite = {
  id: 'ai19-hand',
  name: 'ai19-hand',
  tags: ['scene', 'ai'],
  blurb: "The collector's hand gripping the magnifier's gold handle, a gold cuff on the orchid sleeve.",
  rows: [
    '..................................',
    '..................................',
    '......O...........................',
    '.....GyO..........................',
    '....OGGGO.........................',
    '.....OggGO........................',
    '......OggGOUUUU...................',
    '.......OgUSSSSSU..................',
    '........OSSSSSSU..................',
    '........USUSSSSU.yG...............',
    '........UUSUSSSUyGpE..............',
    '........USUSUSSyGPppE.............',
    '........UUSUSSyGPPPppE............',
    '.........UUUUyGPPPPPppE...........',
    '............yGPPPPPPPppE..........',
    '...........yGPPPPPPPPPppE.........',
    '...........GqqPPPPPPPPPppE........',
  ],
};

/** The red flag on the pole, rippling. */
const flag: PixelSprite = {
  id: 'ai19-flag',
  name: 'ai19-flag',
  tags: ['scene', 'ai'],
  blurb: "A red flag rippling.",
  rows: [
    'sRrRRRRR',
    'RRrRRRRR',
    'RRrRRRRR',
    'RRrRRRRR',
    'RRrRRRRR',
    'rrrrrrrr',
  ],
  frames: [
    [
      'sRrRRRRR',
      'RRrRRRRR',
      'RRrRRRRR',
      'RRrRRRRR',
      'RRrRRRRR',
      'rrrrrrrr',
    ],
    [
      'sRRRrRRR',
      'RRRRrRRR',
      'RRRRrRRR',
      'RRRRrRRR',
      'RRRRrRRR',
      'rrrrrrrr',
    ],
    [
      'sRRRRRrR',
      'RRRRRRrR',
      'RRRRRRrR',
      'RRRRRRrR',
      'RRRRRRrR',
      'rrrrrrrr',
    ],
  ],
  frameMs: 280,
};

/** A green tick drawn in the checklist box, held, then gone. */
const tick: PixelSprite = {
  id: 'ai19-tick',
  name: 'ai19-tick',
  tags: ['scene', 'ai'],
  blurb: "A green tick being drawn into a box.",
  rows: [
    '.....',
    '.....',
    '.....',
    '.....',
  ],
  frames: [
    [
      '.....',
      '.....',
      '.....',
      '.....',
    ],
    [
      '.....',
      '.....',
      'n....',
      '.n...',
    ],
    [
      '.....',
      '.....',
      'n.n..',
      '.n...',
    ],
    [
      '....n',
      '...n.',
      'n.n..',
      '.n...',
    ],
    [
      '....n',
      '...n.',
      'n.n..',
      '.n...',
    ],
    [
      '....n',
      '...n.',
      'n.n..',
      '.n...',
    ],
    [
      '....n',
      '...n.',
      'n.n..',
      '.n...',
    ],
    [
      '....n',
      '...n.',
      'n.n..',
      '.n...',
    ],
    [
      '....n',
      '...n.',
      'n.n..',
      '.n...',
    ],
    [
      '.....',
      '.....',
      '.....',
      '.....',
    ],
  ],
  frameMs: 260,
};

/** A glint crossing the rim's top-left. */
const glare: PixelSprite = { id: 'ai19-glare', name: 'ai19-glare', tags: [], rows: ['..W', '.W.', 'W..'] };

const LAMP = [2, 7] as const;
const PAGE = [9, 27] as const;
const LENS = [29, 24] as const;

const base = aiCompose('ai19-opener-base', desk, [
  [wash, 0, 0],
  [lamp, LAMP[0], LAMP[1]],
  [under, PAGE[0] + 6, PAGE[1] - 3],
  [page, PAGE[0], PAGE[1]],
  [lens, LENS[0], LENS[1]],
  [hand, LENS[0] + 17, LENS[1] + 19],
]);

export const ai19Opener: SceneArt = {
  id: 'ai19-opener',
  label: "A close-up of a magnifying glass held over a fund's papers on a desk under a green lamp, a red flag planted in the page inside the lens while a checklist is ticked beside it.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flag, x: LENS[0] + 13, y: LENS[1] + 9 },
    { sprite: tick, x: PAGE[0] + 3, y: PAGE[1] + 27 },
    { sprite: glow, x: LAMP[0] + 3, y: LAMP[1] + 6, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: glare, x: LENS[0] + 4, y: LENS[1] + 4, motion: { kind: 'twinkle', periodMs: 1700, min: 0.2 } },
    { sprite: aiMoteGold, x: 7, y: 17, motion: { kind: 'rise', amp: 6, periodMs: 3000, phase: 0.15 } },
    { sprite: aiMoteGold, x: 18, y: 15, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.6 } },
  ],
};

export const ai19Finish = aiKeepsake(
  'ai19-finish',
  'A magnifying glass with a gold rim and a small red flag in its glass, floating in a glass display case on a marble plinth, with sparkles around it.',
  aiMagnifier,
);

export const art: LessonArtSet = { opener: ai19Opener, backdrop: aiBackdrop, finish: ai19Finish };
