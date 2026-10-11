/**
 * Alternative Investments lesson 8: infrastructure and farmland.
 *
 * The opener is the estate at night as real assets, on the kit's land (ai-kit-a.ts): a wind turbine
 * near the fence with a big rotor, a second far off on the hill turning the kit's own blades and a
 * third still on the far ridge, beside a red barn, the silo and crop rows with a tractor working
 * them. Only small layers move: both rotors turn, the near turbine's warning light blinks, the
 * tractor drives along the rows and two stars twinkle. The keepsake is the kit's turbine blades set
 * on a short tower, so it reads as a turbine in the glass case.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiKeepsake, aiTurbineBlades } from './ai-kit';
import { AI_LAND_PALETTE, aiComposeLand, aiMoon, aiSilo, aiStar } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

const rotor: PixelSprite = {
  id: 'ai8-rotor',
  name: 'ai8-rotor',
  tags: ['scene', 'ai'],
  blurb: "The near turbine's rotor: three long blades round the hub at (13, 13), a third of a turn in three frames.",
  rows: [
    '...........................',
    '.............w.............',
    '.............w.............',
    '.............w.............',
    '.............w.............',
    '.............w.............',
    '.............wx............',
    '.............wx............',
    '.............wx............',
    '.............wx............',
    '.............wx............',
    '.............wx............',
    '.............X.............',
    '..........xxXwX............',
    '.........xxw.X.w...........',
    '.......xxww...xxww.........',
    '......xwww......xwww.......',
    '......ww.........xxww......',
    '....ww.............x.www...',
    '...w...................w...',
    '...........................',
    '...........................',
    '...........................',
    '...........................',
    '...........................',
    '...........................',
    '...........................',
  ],
  frames: [
    [
      '...........................',
      '.............w.............',
      '.............w.............',
      '.............w.............',
      '.............w.............',
      '.............w.............',
      '.............wx............',
      '.............wx............',
      '.............wx............',
      '.............wx............',
      '.............wx............',
      '.............wx............',
      '.............X.............',
      '..........xxXwX............',
      '.........xxw.X.w...........',
      '.......xxww...xxww.........',
      '......xwww......xwww.......',
      '......ww.........xxww......',
      '....ww.............x.www...',
      '...w...................w...',
      '...........................',
      '...........................',
      '...........................',
      '...........................',
      '...........................',
      '...........................',
      '...........................',
    ],
    [
      '...........................',
      '...........................',
      '...........................',
      '...........................',
      '....................ww.....',
      '...................ww......',
      '..................ww.......',
      '..................w........',
      '.................wxx.......',
      '................wwx........',
      '...............wwx.........',
      '.wwww.xxxxx...wwx..........',
      '.....wwwwwwx.X.x...........',
      '...........wXwX............',
      '.............X.............',
      '.............xw............',
      '.............xw............',
      '.............xww...........',
      '..............xw...........',
      '..............xw...........',
      '..............xxw..........',
      '................w..........',
      '................w..........',
      '.................w.........',
      '.................w.........',
      '...........................',
      '...........................',
    ],
    [
      '...........................',
      '...........................',
      '...........................',
      '...........................',
      '.....ww....................',
      '......ww...................',
      '.......ww..................',
      '........wxx................',
      '.........wx................',
      '.........wwx...............',
      '..........wwx..............',
      '...........ww.........wwww.',
      '.............X..wwwwww.....',
      '............XwXwxxxxxx.....',
      '.............X.xx..........',
      '...........xw..............',
      '...........xw..............',
      '..........xww..............',
      '..........xw...............',
      '..........xw...............',
      '.........xww...............',
      '..........w................',
      '..........w................',
      '.........w.................',
      '.........w.................',
      '...........................',
      '...........................',
    ],
  ],
  frameMs: 300,
};

const tower: PixelSprite = {
  id: 'ai8-tower',
  name: 'ai8-tower',
  tags: ['scene', 'ai'],
  blurb: "The near turbine tower, tapering, moonlit on its left.",
  rows: [
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    'wxX.',
    'wxX.',
    'wxX.',
    'wxX.',
    'wxX.',
    'wxXD',
    'wxXD',
    'wxXD',
    'wxXD',
    'wxXD',
    'wxXD',
    'wxXD',
    'wxXD',
  ],
};

const farTower: PixelSprite = {
  id: 'ai8-far-tower',
  name: 'ai8-far-tower',
  tags: ['scene', 'ai'],
  blurb: "The far turbine's tower, for the kit's blades.",
  rows: [
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    '.xX.',
    'wxX.',
    'wxX.',
    'wxXD',
    'wxXD',
    'wxXD',
  ],
};

const ridgeTurbine: PixelSprite = {
  id: 'ai8-ridge-turbine',
  name: 'ai8-ridge-turbine',
  tags: ['scene', 'ai'],
  blurb: "A third turbine, small and still, on the far ridge.",
  rows: [
    '...x...',
    '...x...',
    '...x...',
    '...X...',
    '..x.x..',
    '.x.X.x.',
    'x..X..x',
    '...X...',
    '...X...',
    '..DDD..',
  ],
};

const barn: PixelSprite = {
  id: 'ai8-barn',
  name: 'ai8-barn',
  tags: ['scene', 'ai'],
  blurb: "The backdrop's barn at full tone: red, white trim, a hayloft, crossed doors.",
  palette: AI_LAND_PALETTE,
  rows: [
    '....DDDDDDD....',
    '...DjjjjjjjD...',
    '..DjjjjjjjjjD..',
    '.DjjjjjwjjjjjD.',
    'DjjjjjwKwjjjjjD',
    'DjjjjjwKwjjjjjD',
    'DwwwwwwwwwwwwwD',
    'DjjjjjjjjjjjjjD',
    'DjjwwwwwwwwwjjD',
    'DjjwwwiiiwwwjjD',
    'DjjwiiwwwiiwjjD',
    'DjjwwwiiiwwwjjD',
    'DiiwwwwwwwwwiiD',
  ],
};

const crops: PixelSprite = {
  id: 'ai8-crops',
  name: 'ai8-crops',
  tags: ['scene', 'ai'],
  blurb: "Crop rows across the foreground, nearer rows wider, the path left clear.",
  palette: AI_LAND_PALETTE,
  rows: [
    'NnnNnnNnnNnnNnnNnnNnnNnnNnnNnnNnnNn...........nnNnnNnnNnnNnnNnnNnnNnnNnnNnnNnnNn',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu............uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'NnnnNnnnNnnnNnnnNnnnNnnnNnnnNnnnN..............nNnnnNnnnNnnnNnnnNnnnNnnnNnnnNnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn................nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu.................uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'nnNnnnnNnnnnNnnnnNnnnnNnnnnNnnn..................nnnNnnnnNnnnnNnnnnNnnnnNnnnnNnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn....................nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuu......................uuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'NnnnnnNnnnnnNnnnnnNnnnnnNnnnn.......................nnNnnnnnNnnnnnNnnnnnNnnnnnNn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnn........................nnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnn..........................nnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'uuuuuuuuuuuuuuuuuuuuuuuuuu............................uuuuuuuuuuuuuuuuuuuuuuuuuu',
  ],
};

const tractor: PixelSprite = {
  id: 'ai8-tractor',
  name: 'ai8-tractor',
  tags: ['scene', 'ai'],
  blurb: "A green tractor with its headlamp on, big wheel behind.",
  rows: [
    '..DDDD......',
    '..DBwD......',
    '..DBBD..D...',
    '.nnnnnnnnnn.',
    'nNNNNNNNNNNy',
    'nNNnnnnnnnNn',
    'DDDD....DD..',
    'DXKXD..DKXD.',
    'DKKKD...DD..',
    '.DDD........',
  ],
};

const beacon: PixelSprite = { id: 'ai8-beacon', name: 'ai8-beacon', tags: [], rows: ['R'] };

/** Turbine blades on a short tower stub, for the keepsake: blades in front, tower behind. */
const STUB = [
  ...Array.from({ length: 8 }, () => '.'.repeat(15)),
  ...Array.from({ length: 7 }, () => '.......XD......'),
  '.....DDDDD.....',
];
const onStub = (blades: readonly string[]) =>
  STUB.map((stub, y) => [...stub].map((ch, x) => blades[y]?.[x] ?? '.').map((b, x) => (b === '.' ? stub[x] : b)).join(''));
const turbine: PixelSprite = {
  ...aiTurbineBlades,
  id: 'ai8-turbine',
  name: 'ai8-turbine',
  rows: onStub(aiTurbineBlades.rows),
  frames: aiTurbineBlades.frames?.map(onStub),
};

/** The near rotor's hub (the rotor's own hub is at its 13, 13) and the far one's (the kit blades', at 7, 7). */
const HUB = [56, 15] as const;
const FAR_HUB = [34, 20] as const;

const base = aiComposeLand('ai8-opener-base', [
  [aiMoon, 6, 3],
  [farTower, FAR_HUB[0] - 1, FAR_HUB[1] + 2],
  [ridgeTurbine, 72, 22],
  [barn, 2, 26],
  [aiSilo, 17, 19],
  [tower, HUB[0] - 1, HUB[1] + 2],
  [crops, 0, 48],
]);

export const ai8Opener: SceneArt = {
  id: 'ai8-opener',
  label: 'Farmland at night with a big turning wind turbine and two more on the hills, a red barn and a silo, and a tractor driving along the crop rows.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rotor, x: HUB[0] - 13, y: HUB[1] - 13 },
    { sprite: aiTurbineBlades, x: FAR_HUB[0] - 7, y: FAR_HUB[1] - 7 },
    { sprite: beacon, x: HUB[0] + 1, y: HUB[1] - 2, motion: { kind: 'twinkle', periodMs: 1600, min: 0.15 } },
    { sprite: tractor, x: 14, y: 48, motion: { kind: 'drift', amp: 5, periodMs: 7000 } },
    { sprite: aiStar, x: 24, y: 8, motion: { kind: 'twinkle', periodMs: 2700, min: 0.2 } },
    { sprite: aiStar, x: 74, y: 6, motion: { kind: 'twinkle', periodMs: 3200, min: 0.2, phase: 0.5 } },
  ],
};

export const ai8Finish = aiKeepsake(
  'ai8-finish',
  'A small wind turbine with turning blades floating in a glass display case on a marble plinth, with sparkles around it.',
  turbine,
);

export const art: LessonArtSet = { opener: ai8Opener, backdrop: aiBackdrop, finish: ai8Finish };
