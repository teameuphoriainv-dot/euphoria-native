/**
 * Alternative Investments lesson 8: infrastructure and farmland.
 *
 * The opener is the estate at night as the lesson's two real assets, on the kit's land (ai-kit-a.ts).
 * Farmland on the left: a red barn, the silo and crop rows with a tractor working them. Infrastructure
 * down the middle: the path through the gate becomes a toll road, crossed at the fence line by a
 * toll gantry whose lit sign shows the toll with an up arrow (the lesson's concession, whose tolls
 * rise with inflation), with a lit toll booth beside it and a car driving up the road toward it. A
 * small turbine stands still on the far ridge. Only small layers move: the car drives off, a coin
 * rises off the booth (toll revenue), the gantry's warning light blinks, the tractor drives along the
 * rows and two stars twinkle. The keepsake is a toll barrier's striped arm held over a wheat sheaf.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiKeepsake } from './ai-kit';
import { AI_LAND_PALETTE, aiComposeLand, aiMoon, aiSilo, aiStar } from './ai-kit-a';
import { aiCoin } from './ai-kit-b';
import type { LessonArtSet, SceneArt } from './types';

const ridgeTurbine: PixelSprite = {
  id: 'ai8-ridge-turbine',
  name: 'ai8-ridge-turbine',
  tags: ['scene', 'ai'],
  blurb: "A small wind turbine, still, on the far ridge.",
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

/** The toll road's centre line: gold dashes down the path, longer as they come nearer. */
const roadLine: PixelSprite = {
  id: 'ai8-road-line',
  name: 'ai8-road-line',
  tags: ['scene', 'ai'],
  blurb: "Dashed gold centre line down the toll road.",
  rows: [
    'yy', '..', '..', 'yy', 'yy', '..', '..', '..', 'yy', 'yy', 'yy',
    '..', '..', '..', 'yy', 'yy', 'yy', 'yy', '..', '..', '..',
  ],
};

/**
 * The toll gantry over the road at the fence line: two steel posts, a beam, and hanging from it a lit
 * sign with a dollar sign and a green up arrow, the toll rising with inflation.
 */
const gantry: PixelSprite = {
  id: 'ai8-gantry',
  name: 'ai8-gantry',
  tags: ['scene', 'ai'],
  blurb: "A toll gantry spanning the road: steel posts, a beam and a lit sign showing a dollar sign and an up arrow.",
  rows: [
    'DDDDDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxxxXD',
    'DXXXXXXXXXXXXXXXXD',
    'DxDDDDDDDDDDDDDDXD',
    'DxDKKyKKKKNKKKDDXD',
    'DxDKyyyKKNNNKKDDXD',
    'DxDKyKKKNNNNNKDDXD',
    'DxDKyyyKKKNKKKDDXD',
    'DxDKKKyKKKNKKKDDXD',
    'DxDKyyyKKKNKKKDDXD',
    'DxDKKyKKKKKKKKDDXD',
    'DxDDDDDDDDDDDDDDXD',
    ...Array.from({ length: 7 }, () => 'DxD............DXD'),
    'DDD............DDD',
  ],
};

/** A lit toll booth beside the road: a red band under the roof, a big lit window, a door. */
const booth: PixelSprite = {
  id: 'ai8-booth',
  name: 'ai8-booth',
  tags: ['scene', 'ai'],
  blurb: "A small toll booth with a flat roof, a red band and a lit window.",
  rows: [
    'DDDDDDDDDDD',
    'DxxxxxxxxXD',
    'DRRRRRRRRrD',
    'DDDDDDDDDDD',
    '.DwxxxxxXD.',
    '.DwDDDDDXD.',
    '.DwDyyGDXD.',
    '.DwDyGGDXD.',
    '.DwDDDDDXD.',
    '.DwxxxxxXD.',
    '.DwxDDxxXD.',
    '.DwxDODxXD.',
    '.DDDDDDDDD.',
  ],
};

/** A car seen from behind as it drives up the road: rear window, red tail lights, wheels. */
const car: PixelSprite = {
  id: 'ai8-car',
  name: 'ai8-car',
  tags: ['scene', 'ai'],
  blurb: "A blue car from behind, tail lights lit.",
  rows: [
    '..DDDD..',
    '.DxxxXD.',
    'DBBBBBBD',
    'DRBBBBRD',
    'DbbbbbbD',
    '.KK..KK.',
  ],
};

const beacon: PixelSprite = { id: 'ai8-beacon', name: 'ai8-beacon', tags: [], rows: ['R'] };

/** The keepsake: a toll barrier, its red and white arm held out over a sheaf of wheat. 16x16. */
const tollBoom: PixelSprite = {
  id: 'ai8-toll-boom',
  name: 'ai8-toll-boom',
  tags: ['scene', 'ai'],
  blurb: "Lesson 8: a toll barrier's red and white striped arm held out over a wheat sheaf, infrastructure over farmland.",
  rows: [
    '.DDDD...........',
    'DwRRXD..........',
    'DwRRXDDDDDDDDDDD',
    'DwxxXRRwwRRwwRRD',
    'DwxxXRRwwRRwwRRD',
    'DwxxXRRwwRRwwRRD',
    'DwxxXDDDDDDDDDDD',
    'DwxxXD.y..y..y..',
    'DwxxXDyGyyGyyGy.',
    'DwxxXDGgGGgGGgG.',
    'DwxxXD.GgGgGgG..',
    'DwxxXD.OOOOOOO..',
    'DwxxXD..GgGgG...',
    'DwxxXD.GgGgGgG..',
    'DDDDDDGgGg.gGgG.',
    'DXXXXD..........',
  ],
};

/** The toll road at the fence line: the gantry's posts stand either side of the gate. */
const GANTRY = [31, 27] as const;
const BOOTH = [50, 34] as const;
const CAR = [36, 50] as const;

const base = aiComposeLand('ai8-opener-base', [
  [aiMoon, 6, 3],
  [ridgeTurbine, 72, 22],
  [barn, 2, 26],
  [aiSilo, 17, 19],
  [roadLine, 39, 39],
  [gantry, GANTRY[0], GANTRY[1]],
  [booth, BOOTH[0], BOOTH[1]],
  [crops, 0, 48],
]);

export const ai8Opener: SceneArt = {
  id: 'ai8-opener',
  label: 'Farmland at night with a red barn, a silo and a tractor driving along the crop rows, beside a toll road where a car drives up to a lit toll gantry whose sign shows a dollar sign and an up arrow, next to a lit toll booth.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: car, x: CAR[0], y: CAR[1], motion: { kind: 'rise', amp: 7, periodMs: 4200 } },
    { sprite: beacon, x: GANTRY[0] + 9, y: GANTRY[1] - 1, motion: { kind: 'twinkle', periodMs: 1600, min: 0.15 } },
    { sprite: aiCoin, x: BOOTH[0] + 4, y: BOOTH[1] - 5, motion: { kind: 'rise', amp: 5, periodMs: 2800, phase: 0.3 } },
    { sprite: tractor, x: 14, y: 48, motion: { kind: 'drift', amp: 5, periodMs: 7000 } },
    { sprite: aiStar, x: 24, y: 8, motion: { kind: 'twinkle', periodMs: 2700, min: 0.2 } },
    { sprite: aiStar, x: 66, y: 6, motion: { kind: 'twinkle', periodMs: 3200, min: 0.2, phase: 0.5 } },
  ],
};

export const ai8Finish = aiKeepsake(
  'ai8-finish',
  'A toll barrier with a red and white striped arm held out over a wheat sheaf, floating in a glass display case on a marble plinth, with sparkles around it.',
  tollBoom,
);

export const art: LessonArtSet = { opener: ai8Opener, backdrop: aiBackdrop, finish: ai8Finish };
