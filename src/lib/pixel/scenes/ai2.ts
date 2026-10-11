/**
 * Alternative Investments lesson 2: real estate investing.
 *
 * The opener is a rental on the estate at night, on the kit's land (ai-kit-a.ts): a two-storey house
 * with its door at the end of the path, a letting sign in the yard and a second property up on the
 * hill under the moon, because the lesson is owning buildings that pay rent. Only small layers
 * move: windows and the porch light glow, chimney smoke rises, the far house's window flickers,
 * stars twinkle and a firefly drifts up. The keepsake is the kit's house emblem in the glass case.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiHouse, aiKeepsake, aiMoteGold } from './ai-kit';
import { aiComposeLand, aiMoon, aiStar } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

const house: PixelSprite = {
  id: 'ai2-house',
  name: 'ai2-house',
  tags: ['scene', 'ai'],
  blurb: "The rental: an orchid gable roof with a lit attic window, a chimney, four lit windows, a porch door.",
  rows: [
    '....................DDDDD.....',
    '.....................xXD......',
    '..............EE.....xXD......',
    '............EEqpEE...xXD......',
    '..........EEqqPPppEE.xXD......',
    '........EEqqPDDDDPppExXD......',
    '......EEqqPPPDyyDPPPppEE......',
    '....EEqqPPPPPDGGDPPPPPppEE....',
    '..EEqqPPPPPPPDDDDPPPPPPPppEE..',
    'EEqqPPPPPPPPPPPPPPPPPPPPPPppEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    '.DXXXXXXXXXXXXXXXXXXXXXXXXXXD.',
    '.DxxxxxxxxxxxxxxxxxxxxxxxxxXD.',
    '.DxxDDDDDxxxxxxxxxxxxDDDDDxXD.',
    '.DxxDyGyDxxxxxxxxxxxxDyGyDxXD.',
    '.DxxDGGGDxxxxxxxxxxxxDGGGDxXD.',
    '.DxxDyGyDxxxxxxxxxxxxDyGyDxXD.',
    '.DxxDDDDDxxEEEEEEEExxDDDDDxXD.',
    '.DxxxxxxxxxxDDDDDDxxxxxxxxxXD.',
    '.DxxDDDDDxxxDOgOODxyxDDDDDxXD.',
    '.DxxDyGyDxxxDOgOODxxxDyGyDxXD.',
    '.DxxDGGGDxxxDOgOODxxxDGGGDxXD.',
    '.DxxDyGyDxxxDOgOyDxxxDyGyDxXD.',
    '.DxxDDDDDxxxDOgOODxxxDDDDDxXD.',
    '.DxxxxxxxxxxDOgOODxxxxxxxxxXD.',
    '.DxxxxxxxxxxDOgOODxxxxxxxxxXD.',
    'DDDDDDDDDDDXXXXXXXXDDDDDDDDDDD',
  ],
};

const sign: PixelSprite = {
  id: 'ai2-sign',
  name: 'ai2-sign',
  tags: ['scene', 'ai'],
  blurb: "A letting sign hung from a post, a house on the board.",
  palette: { z: '#0F0C14' },
  rows: [
    '.g..........',
    '.OOOOOOOOOOO',
    '.O..X.....X.',
    '.O.DDDDDDDDD',
    '.O.DwwwEwwwD',
    '.O.DwwEPEwwD',
    '.O.DwEPPPEwD',
    '.O.DEPPPPPED',
    '.O.DwxxxxxwD',
    '.O.DwxxOxxwD',
    '.O.DwxxOxxwD',
    '.O.DDDDDDDDD',
    'zOz.........',
  ],
};

const glow: PixelSprite = { id: 'ai2-glow', name: 'ai2-glow', tags: [], rows: ['yyy', 'yyy', 'yyy'] };
const glowSmall: PixelSprite = { id: 'ai2-glow-small', name: 'ai2-glow-small', tags: [], rows: ['yy', 'yy'] };
const porch: PixelSprite = { id: 'ai2-porch', name: 'ai2-porch', tags: [], rows: ['W'] };
const smoke: PixelSprite = { id: 'ai2-smoke', name: 'ai2-smoke', tags: [], rows: ['.x', 'xX', 'X.'] };

/** The rental's corner: its door stands over the gate, at the top of the path. */
const HOUSE = [25, 14] as const;
const FAR_HOUSE = [64, 22] as const;

const base = aiComposeLand('ai2-opener-base', [
  [aiMoon, 66, 3],
  [aiHouse, FAR_HOUSE[0], FAR_HOUSE[1]],
  [house, HOUSE[0], HOUSE[1]],
  [sign, 16, 47],
]);

export const ai2Opener: SceneArt = {
  id: 'ai2-opener',
  label: 'A moonlit rental house with glowing windows and a smoking chimney at the end of a garden path, a letting sign in the yard and another house on the hill.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: glow, x: HOUSE[0] + 5, y: HOUSE[1] + 14, motion: { kind: 'twinkle', periodMs: 3800, min: 0.15 } },
    { sprite: glow, x: HOUSE[0] + 22, y: HOUSE[1] + 20, motion: { kind: 'twinkle', periodMs: 4700, min: 0.15, phase: 0.5 } },
    { sprite: porch, x: HOUSE[0] + 19, y: HOUSE[1] + 19, motion: { kind: 'twinkle', periodMs: 2300, min: 0.4 } },
    { sprite: smoke, x: HOUSE[0] + 21, y: HOUSE[1] - 3, motion: { kind: 'rise', amp: 6, periodMs: 3400 } },
    { sprite: smoke, x: HOUSE[0] + 22, y: HOUSE[1] - 4, motion: { kind: 'rise', amp: 6, periodMs: 3400, phase: 0.5 } },
    { sprite: glowSmall, x: FAR_HOUSE[0] + 3, y: FAR_HOUSE[1] + 7, motion: { kind: 'twinkle', periodMs: 5200, min: 0.3, phase: 0.3 } },
    { sprite: aiStar, x: 10, y: 7, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: aiStar, x: 47, y: 3, motion: { kind: 'twinkle', periodMs: 3100, min: 0.2, phase: 0.6 } },
    { sprite: aiMoteGold, x: 62, y: 52, motion: { kind: 'rise', amp: 4, periodMs: 3600, phase: 0.2 } },
  ],
};

export const ai2Finish = aiKeepsake(
  'ai2-finish',
  'A small house with a lit window and a chimney floating in a glass display case on a marble plinth, with sparkles around it.',
  aiHouse,
);

export const art: LessonArtSet = { opener: ai2Opener, backdrop: aiBackdrop, finish: ai2Finish };
