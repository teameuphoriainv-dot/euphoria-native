/**
 * Alternative Investments lesson 1 opener: the endowment's vault gallery, beyond stocks and bonds.
 *
 * Composed from the kit (ai-kit.ts) on its gallery ground: a round vault door, the endowment's
 * allocation chart over it (more than 80% in alternatives, the lesson's Yale figure) and a wall of
 * six lit niches, one per category the lesson names (real estate, private equity, hedge funds,
 * commodities, crypto, collectibles), studied by the collector through a magnifier. Only small
 * layers move: the vault wheel turns, the coin spins, the long and short arrows pump, the gold
 * glints, the collector blinks, and motes drift up through the lamplight.
 */
import {
  AI_COLLECTOR_EYE,
  AI_COLLECTOR_GLARE,
  aiAllocationChart,
  aiCollector,
  aiCollectorBlink,
  aiCompose,
  aiCryptoCoin,
  aiFactory,
  aiGallery,
  aiGlintGold,
  aiGoldBars,
  aiHouse,
  aiLensGlare,
  aiLongShort,
  aiMoteGold,
  aiNiche,
  aiPainting,
  aiPictureLight,
  aiShadow,
  aiVaultDoor,
  aiVaultWheel,
} from './ai-kit';
import type { SceneArt } from './types';

/** Top-left of the six niches: real estate, private equity, hedge funds; commodities, crypto, collectibles. */
const NICHE = [[34, 9], [49, 9], [64, 9], [34, 27], [49, 27], [64, 27]] as const;
/** A 12x12 emblem stands one pixel in and three down from its niche's corner. */
const at = (n: number) => [NICHE[n][0] + 1, NICHE[n][1] + 3] as const;

const DOOR = [-2, 20] as const;
const COLLECTOR = [14, 30] as const;

const base = aiCompose('ai1-opener-base', aiGallery.rows, [
  [aiAllocationChart, 5, 7],
  [aiVaultDoor, DOOR[0], DOOR[1]],
  ...NICHE.map(([x, y]) => [aiNiche, x, y] as const),
  ...NICHE.slice(0, 3).map(([x, y]) => [aiPictureLight, x + 4, y - 3] as const),
  [aiHouse, ...at(0)],
  [aiFactory, ...at(1)],
  [aiGoldBars, ...at(3)],
  [aiPainting, ...at(5)],
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollector, COLLECTOR[0], COLLECTOR[1]],
]);

export const ai1Opener: SceneArt = {
  id: 'ai1-opener',
  label: 'A collector with a magnifying glass studies a vault gallery of six lit niches holding a house, a factory, up and down arrows, gold bars, a crypto coin and a painting, beside a round vault door.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aiVaultWheel, x: DOOR[0] + 9, y: DOOR[1] + 9 },
    { sprite: aiLongShort, x: at(2)[0], y: at(2)[1] },
    { sprite: aiCryptoCoin, x: at(4)[0], y: at(4)[1] },
    { sprite: aiGlintGold, x: at(3)[0] + 1, y: at(3)[1] + 1, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiLensGlare, x: COLLECTOR[0] + AI_COLLECTOR_GLARE[0], y: COLLECTOR[1] + AI_COLLECTOR_GLARE[1], motion: { kind: 'twinkle', periodMs: 1500, min: 0.3 } },
    { sprite: aiMoteGold, x: 44, y: 22, motion: { kind: 'rise', amp: 5, periodMs: 2600, phase: 0.2 } },
    { sprite: aiMoteGold, x: 73, y: 21, motion: { kind: 'rise', amp: 5, periodMs: 3100, phase: 0.65 } },
  ],
};
