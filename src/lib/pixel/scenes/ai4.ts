/**
 * Alternative Investments lesson 4: commodities and futures.
 *
 * The opener is the estate's working land at night, on the kit's land (ai-kit-a.ts), holding three
 * of the lesson's four sectors: energy (a big oil pump near the fence, the kit's own pump far off
 * on the hill), agriculture (a wheat field and a grain silo) and metals (the kit's gold bars on a
 * crate). Only small layers move: both pumps nod out of step, the wheat heads sway, the gold glints
 * and two stars twinkle. The keepsake is the kit's gold bars in the glass case.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiGlintGold, aiGoldBars, aiKeepsake, aiPumpJack } from './ai-kit';
import { aiComposeLand, aiMoon, aiSilo, aiStar } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

const pump: PixelSprite = {
  id: 'ai4-pump',
  name: 'ai4-pump',
  tags: ['scene', 'ai'],
  blurb: "The near oil pump: horse head over the well, A-frame, walking beam, crank and counterweight turning.",
  rows: [
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '.........................xxx..',
    '..............DwD..xxxxxxXXX..',
    'OGGG.........xDDDxxXXXXXX.X...',
    'GyGG...xxxxxxXXXXXX......X....',
    'GGGgxxxXXXXXX.XxX......xXX....',
    'GGGgXXX......Xx..X.....XXX....',
    '.GGg.........Xx..X.....XXX....',
    '..Og........Xx....X.....D.....',
    '..x.........Xx....X.....D.....',
    '.DDD........DDDDDDD...........',
    'DXXXD......Xx......X.DDDDDDD..',
    'DDDDD......Xx......X.DXXXXXD..',
    'DDDDD.....Xx........XDXXXXXD..',
    'DDDDD.....Xx........XDDDDDDD..',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
  frames: [
    [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '.........................xxx..',
      '..............DwD..xxxxxxXXX..',
      'OGGG.........xDDDxxXXXXXX.X...',
      'GyGG...xxxxxxXXXXXX......X....',
      'GGGgxxxXXXXXX.XxX......xXX....',
      'GGGgXXX......Xx..X.....XXX....',
      '.GGg.........Xx..X.....XXX....',
      '..Og........Xx....X.....D.....',
      '..x.........Xx....X.....D.....',
      '.DDD........DDDDDDD...........',
      'DXXXD......Xx......X.DDDDDDD..',
      'DDDDD......Xx......X.DXXXXXD..',
      'DDDDD.....Xx........XDXXXXXD..',
      'DDDDD.....Xx........XDDDDDDD..',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    ],
    [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      'OGGG..........................',
      'GyGG..........DwD.............',
      'GGGgxxxxxxxxxxDDDxxxxxxxxxxx..',
      'GGGgXXXXXXXXXXXXXXXXXXXXXXXX..',
      '.GGg..........XxX..........X..',
      '..Og.........Xx..X.........X..',
      '..x..........Xx..X.........X..',
      '..x.........Xx....X.......xXX.',
      '..x.........Xx....X.....DDXXX.',
      '.DDD........DDDDDDD.......XXX.',
      'DXXXD......Xx......X.DDDDDDD..',
      'DDDDD......Xx......X.DXXXXXD..',
      'DDDDD.....Xx........XDXXXXXD..',
      'DDDDD.....Xx........XDDDDDDD..',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    ],
    [
      '..............................',
      '..............................',
      'OGGG..........................',
      'GyGG..........................',
      'GGGgxxx.......................',
      'GGGgXXXxxxxxx.DwD.............',
      '.GGg...XXXXXXxDDDxx...........',
      '..Og.........XXXXXXxxxxxx.....',
      '..x...........XxX..XXXXXXxxx..',
      '..x..........Xx..X.......XXX..',
      '..x..........Xx..X........X...',
      '..x.........Xx....X.......X...',
      '..x.........Xx....X.....DX....',
      '.DDD........DDDDDDD.....DX....',
      'DXXXD......Xx......X.DDxXXDD..',
      'DDDDD......Xx......X.DXXXXXD..',
      'DDDDD.....Xx........XDXXXXXD..',
      'DDDDD.....Xx........XDDDDDDD..',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    ],
    [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      'OGGG..........................',
      'GyGG..........DwD.............',
      'GGGgxxxxxxxxxxDDDxxxxxxxxxxx..',
      'GGGgXXXXXXXXXXXXXXXXXXXXXXXX..',
      '.GGg..........XxX.........X...',
      '..Og.........Xx..X.......X....',
      '..x..........Xx..X.....XX.....',
      '..x.........Xx....X.xXX.......',
      '..x.........Xx....X.XXXDD.....',
      '.DDD........DDDDDDD.XXX.......',
      'DXXXD......Xx......X.DDDDDDD..',
      'DDDDD......Xx......X.DXXXXXD..',
      'DDDDD.....Xx........XDXXXXXD..',
      'DDDDD.....Xx........XDDDDDDD..',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    ],
  ],
  frameMs: 380,
};

const stalks: PixelSprite = {
  id: 'ai4-stalks',
  name: 'ai4-stalks',
  tags: ['scene', 'ai'],
  blurb: "The wheat field's stalks, kept off the path; their heads are a layer.",
  rows: [
    '..................................',
    '..................................',
    '..................................',
    'OgOgOgOgOgOgOgOgOgOgOgOgOgOgOgOg..',
    'OgOgOgOgOgOgOgOgOgOgOgOgOgOgOgO...',
    'OgOgOgOgOgOgOgOgOgOgOgOgOgOgOgO...',
    'OgOgOgOgOgOgOgOgOgOgOgOgOgOgOg....',
    'OgOgOgOgOgOgOgOgOgOgOgOgOgOgO.....',
    'OgOgOgOgOgOgOgOgOgOgOgOgOgOg......',
    'OgOgOgOgOgOgOgOgOgOgOgOgOgOg......',
    'OgOgOgOgOgOgOgOgOgOgOgOgOgO.......',
    'OgOgOgOgOgOgOgOgOgOgOgOgOg........',
    'OgOgOgOgOgOgOgOgOgOgOgOgO.........',
  ],
};

const heads: PixelSprite = {
  id: 'ai4-heads',
  name: 'ai4-heads',
  tags: ['scene', 'ai'],
  blurb: "The wheat heads, swaying over the stalks.",
  rows: [
    'y.....y.....y.....y.....y.....y...',
    'Ggy.y.Ggy.y.Ggy.y.Ggy.y.Ggy.y.Gg..',
    'G.GgGgG.GgGgG.GgGgG.GgGgG.GgGgG...',
    '..G.G...G.G...G.G...G.G...G.G.....',
  ],
};

const crate: PixelSprite = {
  id: 'ai4-crate',
  name: 'ai4-crate',
  tags: ['scene', 'ai'],
  blurb: "A slatted crate for the gold bars, with its shadow.",
  palette: { z: '#0F0C14' },
  rows: [
    'OOOOOOOOOOOOOO',
    'OggggggggggggO',
    'OOOOOOOOOOOOOO',
    'OggggggggggggO',
    'OOOOOOOOOOOOOO',
    '.zzzzzzzzzzzz.',
  ],
};

const PUMP = [47, 21] as const;
/** The kit's pump, far off on the hill, so the near one reads as near. */
const FAR_PUMP = [28, 21] as const;
/** The gold bars stand on the crate; their 12x12 has three empty rows on top. */
const GOLD = [58, 40] as const;

const base = aiComposeLand('ai4-opener-base', [
  [aiMoon, 7, 4],
  [aiSilo, 22, 18],
  [stalks, 0, 47],
  [crate, GOLD[0] - 1, GOLD[1] + 12],
  [aiGoldBars, GOLD[0], GOLD[1]],
]);

export const ai4Opener: SceneArt = {
  id: 'ai4-opener',
  label: 'Farmland at night with two nodding oil pumps, a grain silo by a swaying wheat field, and gold bars stacked on a crate.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aiPumpJack, x: FAR_PUMP[0], y: FAR_PUMP[1] },
    { sprite: pump, x: PUMP[0], y: PUMP[1] },
    { sprite: heads, x: 1, y: 47, motion: { kind: 'drift', amp: 1, periodMs: 2600 } },
    { sprite: aiGlintGold, x: GOLD[0] + 2, y: GOLD[1] + 3, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
    { sprite: aiStar, x: 46, y: 6, motion: { kind: 'twinkle', periodMs: 2800, min: 0.2 } },
    { sprite: aiStar, x: 71, y: 12, motion: { kind: 'twinkle', periodMs: 3300, min: 0.2, phase: 0.55 } },
  ],
};

export const ai4Finish = aiKeepsake(
  'ai4-finish',
  'Three stacked gold bars floating in a glass display case on a marble plinth, with sparkles around them.',
  aiGoldBars,
);

export const art: LessonArtSet = { opener: ai4Opener, backdrop: aiBackdrop, finish: ai4Finish };
