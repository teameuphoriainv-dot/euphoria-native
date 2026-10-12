/**
 * Alternative Investments lesson 25: the advanced capstone, every domain brought together.
 *
 * Lesson 10's capstone stood outside the vault as its door swung open. This one is inside it. The
 * collector stands in the round doorway with the light of the gallery pouring in behind, holding
 * the key up, and round the doorway six safe deposit drawers stand open, each holding one of the
 * advanced lessons' emblems (ai-kit-c.ts): the magnifier of due diligence, the padlock of lock-ups,
 * the tax form, the satellite of alternative data, the fountain of the distribution waterfall and
 * the scales of regulation, the layers the lesson says every real decision passes through at once.
 * Only small layers move: the key and the drawers glint, the light on the floor breathes, motes
 * rise from it and the collector blinks. The keepsake is the pathway's last: a gold medal embossed
 * with the key, on orchid ribbons, in the gilded capstone case (ai-kit-b.ts).
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { AI_COLLECTOR_EYE, aiCollectorBlink, aiCompose, aiGlint, aiGlintGold, aiLater, aiMoteGold, aiShadow } from './ai-kit';
import { AI_COLLECTOR_HAND, aiCollectorRaise } from './ai-kit-a';
import { AI_GOLD_PALETTE, aiKeepsakeGold, aiVaultRoom } from './ai-kit-b';
import { aiFountain, aiMagnifier, aiPadlock, aiSatellite, aiScales, aiTaxForm } from './ai-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** The vault's round doorway: a steel ring set with gold studs, full of the light beyond. */
const doorway: PixelSprite = {
  id: 'ai25-doorway',
  name: 'ai25-doorway',
  tags: ['scene', 'ai'],
  blurb: "A round vault doorway: a thick steel ring with gold studs round a disc of white and gold light.",
  rows: [
    '...........DDDD...........',
    '........DDDxxxxDDD........',
    '......DDGxxxxxxxxGDD......',
    '.....DxxxggggggggxxxD.....',
    '....DxxgggGGGGGGgggxxD....',
    '...DxxggGGGGGGGGGGggxxD...',
    '..DxxggGGGyyyyyyGGGggxxD..',
    '..DxggGGGyyyyyyyyGGGggxD..',
    '.DGxgGGGyyyyyyyyyyGGGgxGD.',
    '.DxggGGyyyywwwwyyyyGGggxD.',
    '.DxgGGyyyywwwwwwyyyyGGgxD.',
    'DxxgGGyyywwwwwwwwyyyGGgxxD',
    'DxxgGGyyywwwwwwwwyyyGGgxxD',
    'DxxgGGyyywwwwwwwwyyyGGgxxD',
    'DxxgGGyyywwwwwwwwyyyGGgxxD',
    '.DxgGGyyyywwwwwwyyyyGGgxD.',
    '.DxggGGyyyywwwwyyyyGGggxD.',
    '.DGxgGGGyyyyyyyyyyGGGgxGD.',
    '..DxggGGGyyyyyyyyGGGggxD..',
    '..DxxggGGGyyyyyyGGGggxxD..',
    '...DxxggGGGGGGGGGGggxxD...',
    '....DxxgggGGGGGGgggxxD....',
    '.....DxxxggggggggxxxD.....',
    '......DDGxxxxxxxxGDD......',
    '........DDDxxxxDDD........',
    '...........DDDD...........',
  ],
};

/** An open safe deposit drawer: a gold rim round a dark inside, room for a 14x14 emblem at (+1, +1). */
const drawer: PixelSprite = {
  id: 'ai25-drawer',
  name: 'ai25-drawer',
  tags: ['scene', 'ai'],
  blurb: "An open safe deposit drawer with a gold rim and a dark inside.",
  rows: [
    'OGGGGGGGGGGGGGGO',
    'Gkkkkkkkkkkkkkkg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'GKKKKKKKKKKKKKKg',
    'OggggggggggggggO',
  ],
};

/** The doorway's light lying on the floor, widening toward the viewer. */
const pool: PixelSprite = {
  id: 'ai25-pool',
  name: 'ai25-pool',
  tags: ['scene', 'ai'],
  blurb: "Gold light lying on the vault floor.",
  rows: [
    '........llYYYOOOggggggggOOOYYYll........',
    '.......llYYYOOOOggggggggOOOOYYYll.......',
    '......llYYYOOOOOggggggggOOOOOYYYll......',
    '.....llYYYYOOOOggggggggggOOOOYYYYll.....',
    '....llYYYYOOOOOOOOOOOOOOOOOOOOYYYYll....',
    '..lllYYYYOOOOOOOOOOOOOOOOOOOOOOYYYYlll..',
    '.lllYYYYOOOOOOOOOOOOOOOOOOOOOOOOYYYYlll.',
    'lllYYYYYOOOOOOOOOOOOOOOOOOOOOOOOYYYYYlll',
  ],
};

/** The brightest part of the pool, breathing over it. */
const shimmer: PixelSprite = { id: 'ai25-shimmer', name: 'ai25-shimmer', tags: [], rows: ['G'.repeat(14), '.' + 'G'.repeat(12) + '.'] };

/** The key held up: lesson 1's key with a white gem set in its bow. */
const key: PixelSprite = {
  id: 'ai25-key',
  name: 'ai25-key',
  tags: ['scene', 'ai'],
  blurb: "A small golden key with a white gem in its bow, held upright.",
  rows: [
    '.OOOO.',
    'OyyGGO',
    'OyWWgO',
    'OGWWgO',
    'OGggGO',
    '.OGgO.',
    '..Gg..',
    '..GgOO',
    '..GgGO',
    '..GgOO',
    '..Gg..',
    '..OO..',
  ],
};

const medal: PixelSprite = {
  id: 'ai25-medal',
  name: 'ai25-medal',
  tags: ['scene', 'ai'],
  blurb: "Lesson 25: a gold medal embossed with the pathway's key, hung on two orchid ribbons.",
  rows: [
    '....OOOOOO....',
    '..OOyyyGGGOO..',
    '.OyyGOOOOGGgO.',
    '.OyGGOyGOGGgO.',
    'OyGGGOGGOGGGgO',
    'OyGGGOOOOGGGgO',
    'OGGGGGOOGGGGgO',
    'OGGGGGOOGGGGgO',
    'OGGGGGOOOOGGgO',
    'OGGGGGOOGGGGgO',
    '.OGGGGOOOOGgO.',
    '..OggggggggO..',
    '..EPOOOOOOPE..',
    '..EPPE..EPPE..',
    '..EPPE..EPPE..',
    '..EE.E..E.EE..',
  ],
};

/** The six drawers in an arch round the doorway, lesson 19's at the bottom left round to lesson 24's. */
const DRAWERS = [
  [4, 27, aiMagnifier],
  [4, 9, aiPadlock],
  [23, 6, aiTaxForm],
  [41, 6, aiSatellite],
  [60, 9, aiFountain],
  [60, 27, aiScales],
] as const;
const DOORWAY = [27, 21] as const;
const POOL = [20, 50] as const;
const COLLECTOR = [30, 30] as const;
/** The key's shaft stands on the raised hand. */
const KEY = [COLLECTOR[0] + AI_COLLECTOR_HAND[0] - 2, COLLECTOR[1] + AI_COLLECTOR_HAND[1] - 12] as const;

const composed = aiCompose('ai25-opener-base', aiVaultRoom.rows, [
  [doorway, DOORWAY[0], DOORWAY[1]],
  ...DRAWERS.map(([x, y]) => [drawer, x, y] as const),
  ...DRAWERS.map(([x, y, emblem]) => [emblem, x + 1, y + 1 + (14 - emblem.rows.length)] as const),
  [pool, POOL[0], POOL[1]],
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollectorRaise, COLLECTOR[0], COLLECTOR[1]],
  [key, KEY[0], KEY[1]],
]);
const base: PixelSprite = { ...composed, palette: { ...composed.palette, ...AI_GOLD_PALETTE } };

export const ai25Opener: SceneArt = {
  id: 'ai25-opener',
  label: 'Inside the vault, a collector holds a golden key up in a round doorway full of light, six open drawers round it holding a magnifier, a padlock, a tax form, a satellite, a fountain and scales.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aiGlintGold, x: KEY[0] - 2, y: KEY[1] - 2, motion: { kind: 'twinkle', periodMs: 1600, min: 0.35 } },
    { sprite: shimmer, x: POOL[0] + 13, y: POOL[1] + 1, motion: { kind: 'twinkle', periodMs: 2400, min: 0.2 } },
    { sprite: aiGlint, x: 20, y: 5, motion: { kind: 'twinkle', periodMs: 2100, min: 0.4 } },
    { sprite: aiLater(aiGlintGold, 'ai25-glint-later', 2, 380), x: 56, y: 23, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.5, min: 0.4 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiMoteGold, x: 24, y: 47, motion: { kind: 'rise', amp: 6, periodMs: 2800, phase: 0.1 } },
    { sprite: aiMoteGold, x: 55, y: 46, motion: { kind: 'rise', amp: 6, periodMs: 3300, phase: 0.55 } },
    { sprite: aiMoteGold, x: 51, y: 25, motion: { kind: 'rise', amp: 4, periodMs: 3000, phase: 0.8 } },
  ],
};

export const ai25Finish = aiKeepsakeGold(
  'ai25-finish',
  'A gold medal embossed with a key, hung on two orchid ribbons, floating in a gilded glass case with a crown on top, with sparkles around it.',
  medal,
);

export const art: LessonArtSet = { opener: ai25Opener, backdrop: aiBackdrop, finish: ai25Finish };
