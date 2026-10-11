/**
 * Alternative Investments lesson 14: carbon credits and environmental markets.
 *
 * The opener is the estate at night on the kit's land (ai-kit-a.ts) split between the two sides of
 * a carbon market: on the right a power station, a cooling tower letting off steam and a banded
 * chimney breathing out a grey cloud marked CO2; on the left a big broadleaf tree by the fence,
 * taking carbon back, with green leaves rising off it, the credits it earns (one credit, one tonne
 * of CO2 avoided or removed). Only small layers move: the CO2 cloud drifts, smoke and steam rise,
 * the leaves rise and the chimney's warning light blinks. The keepsake is a new emblem: a leaf.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiKeepsake } from './ai-kit';
import { AI_LAND_PALETTE, aiComposeLand, aiMoon, aiStar } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A broadleaf tree: a canopy of clumps, dark at night and moonlit along its top, a trunk behind the fence. */
const tree: PixelSprite = {
  id: 'ai14-tree',
  name: 'ai14-tree',
  tags: ['scene', 'ai'],
  blurb: "A big broadleaf tree at night, its canopy of clumps moonlit along the top, on a short trunk.",
  palette: AI_LAND_PALETTE,
  rows: [
    '........................',
    '..........NNNNN.........',
    '........NNNnnnnNN.......',
    '.......NNnnnhhhnnN......',
    '.......Nnnhhhhhhhn......',
    '......NNnhhhhhhhhhN.....',
    '....NNNnnnhhhhhnnnnNN...',
    '...NNnnnhhhhhhnnhhhnnN..',
    '..NNnnnhhhhhnnnhhhhhhnN.',
    '..Nnnhnhhnnnnnnnhhhhhen.',
    '..Nnhhhhnnhhhnhhhhhhhee.',
    '..Nnnnnnnhhhhnhhhnnnnee.',
    '..Nnnhnnhhhhhnhhnnhhhhe.',
    '..Nnhhnhhhhhhnhnnhhhhhe.',
    '.NNnhhnhhhhhhhnnhhhhhheN',
    '.Nnnhnnnnnnnhnnnnnhhhhen',
    '.Nnhhhnnhhhhnnnhhhhhheee',
    '.Nnhhhnhhhhhnhnhhhhheeee',
    '..Nnhnnhhhhnnhhhhhheeee.',
    '...NnnhhhhhOOihhheeeee..',
    '....NnhhhhhOOihheeeee...',
    '......NneeOOOiieeee.....',
    '.......NnOeOOieiee......',
    '...........OOi..........',
    '...........OOi..........',
    '...........OOi..........',
    '...........OOi..........',
    '...........OOi..........',
    '...........OOi..........',
    '.........iiOOiii........',
  ],
};

/** A power station's cooling tower: concrete, narrow a third of the way down, lit on the left. */
const coolingTower: PixelSprite = {
  id: 'ai14-cooling-tower',
  name: 'ai14-cooling-tower',
  tags: ['scene', 'ai'],
  blurb: "A concrete cooling tower, waisted and flared.",
  rows: [
    '...DDDDDDDDDDD...',
    '...DXXXXXXXXXD...',
    '...DwwxxxxXXXD...',
    '....DwxxxXXXD....',
    '....DwxxxXXXD....',
    '....DwxxxXXXD....',
    '....DwxxxXXXD....',
    '....DwxxxXXXD....',
    '....DwxxxXXXD....',
    '....DwxxxXXXD....',
    '....DwxxxXXXD....',
    '....DwxxxXXXD....',
    '...DwwxxxxXXXD...',
    '...DwwxxxxXXXD...',
    '...DwwxxxxXXXD...',
    '...DwwxxxxXXXD...',
    '..DwwwxxxxXXXXD..',
    '..DwwxxxxxXXXXD..',
    '.DwwwxxxxxXXXXXD.',
    '.DwwwxxxxxXXXXXD.',
    'DwwwwxxxxxXXXXXXD',
    'DwwwwxxxxxXXXXXXD',
  ],
};

/** A tall chimney banded red and white at the top, its warning light on the rim. */
const chimney: PixelSprite = {
  id: 'ai14-chimney',
  name: 'ai14-chimney',
  tags: ['scene', 'ai'],
  blurb: "A tall chimney with red and white bands at the top.",
  rows: [
    '..r..',
    'DDDDD',
    'DRRrD',
    'DRRrD',
    'DwwxD',
    'DwwxD',
    'DRRrD',
    'DRRrD',
    'DwwxD',
    'DwwxD',
    ...Array.from({ length: 25 }, () => 'DxxXD'),
  ],
};

/** The turbine hall the tower and chimney serve: a long low building with a row of lit windows. */
const hall: PixelSprite = {
  id: 'ai14-hall',
  name: 'ai14-hall',
  tags: ['scene', 'ai'],
  blurb: "A long low power station building with lit windows and a door.",
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxxxxxxxxD',
    'DXyyXyyXyyXyyXyyXyyXXD',
    'DXGGXGGXGGXGGXGGXGGXXD',
    'DXXXXXXXXXXXXXXXXXXXXD',
    'DXXXXXXXXXXDDDDXXXXXXD',
    'DXXXXXXXXXXDOODXXXXXXD',
    'DDDDDDDDDDDDOODDDDDDDD',
  ],
};

/** The emissions: a grey cloud lettered CO2. */
const co2: PixelSprite = {
  id: 'ai14-co2',
  name: 'ai14-co2',
  tags: ['scene', 'ai'],
  blurb: "A grey cloud of smoke lettered CO2.",
  rows: [
    '........XXXXX........',
    '.......XwwwwwX.......',
    '...XXXXwwwwwwwXXXX...',
    '..XxxDDDxDDDxxxxxxX..',
    '..XxxDxxxDxDxxxxxxxX.',
    '.XxxxDxxxDxDxDDxxxxX.',
    '.XxxxDxxxDxDxxxDxxxX.',
    '..XxxDDDxDDDxxDxxxxX.',
    '..XxxxxxxxxxxDDDxxX..',
    '...XXXXXXXXXX.XXXX...',
  ],
};

const smoke: PixelSprite = { id: 'ai14-smoke', name: 'ai14-smoke', tags: [], rows: ['.X.', 'XxX', '.X.'] };
const steam: PixelSprite = { id: 'ai14-steam', name: 'ai14-steam', tags: [], rows: ['.ww.', 'wwwx', '.xx.'] };
/** A leaf off the tree, rising: a credit earned. */
const credit: PixelSprite = { id: 'ai14-credit', name: 'ai14-credit', tags: [], rows: ['...m', '.NNm', 'NNn.', 'n...'] };
const beacon: PixelSprite = { id: 'ai14-beacon', name: 'ai14-beacon', tags: [], rows: ['R'] };

const leaf: PixelSprite = {
  id: 'ai14-leaf',
  name: 'ai14-leaf',
  tags: ['scene', 'ai'],
  blurb: "Lesson 14: a green leaf, lit along its midrib, on a short stem.",
  palette: AI_LAND_PALETTE,
  rows: [
    '...............e',
    '............eeNe',
    '..........eeNNme',
    '.......eeeNNNmne',
    '......eNNNNNmnne',
    '.....eNNNNNmnnne',
    '....eNNNNNmnnne.',
    '....eNNNNmnnnne.',
    '....eNNNmnnnne..',
    '...eNNNmnnnnne..',
    '...eNNmnnnnne...',
    '...eNmnnnnne....',
    '...emnnneee.....',
    '..neeeee........',
    '.n..............',
    'n...............',
  ],
};

const TREE = [6, 11] as const;
const COOLING = [46, 19] as const;
const CHIMNEY = [73, 5] as const;
const CLOUD = [29, 6] as const;

const base = aiComposeLand('ai14-opener-base', [
  [aiMoon, 3, 2],
  [chimney, CHIMNEY[0], CHIMNEY[1]],
  [hall, 58, 33],
  [coolingTower, COOLING[0], COOLING[1]],
  [tree, TREE[0], TREE[1]],
]);

export const ai14Opener: SceneArt = {
  id: 'ai14-opener',
  label: 'At night a power station chimney breathes out a grey cloud marked CO2 beside a steaming cooling tower, while across the fence a big tree gives off rising green leaves.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: co2, x: CLOUD[0], y: CLOUD[1], motion: { kind: 'drift', amp: 3, periodMs: 6000 } },
    { sprite: smoke, x: CHIMNEY[0] + 1, y: CHIMNEY[1] - 3, motion: { kind: 'rise', amp: 4, periodMs: 2600 } },
    { sprite: steam, x: COOLING[0] + 4, y: COOLING[1] - 4, motion: { kind: 'rise', amp: 6, periodMs: 3200, phase: 0.2 } },
    { sprite: steam, x: COOLING[0] + 9, y: COOLING[1] - 3, motion: { kind: 'rise', amp: 6, periodMs: 3200, phase: 0.7 } },
    { sprite: credit, x: TREE[0] + 6, y: TREE[1] - 2, motion: { kind: 'rise', amp: 6, periodMs: 3400, phase: 0.1 } },
    { sprite: credit, x: TREE[0] + 15, y: TREE[1] - 4, motion: { kind: 'rise', amp: 6, periodMs: 3800, phase: 0.55 } },
    { sprite: credit, x: TREE[0] + 20, y: TREE[1] + 2, motion: { kind: 'rise', amp: 6, periodMs: 3600, phase: 0.85 } },
    { sprite: beacon, x: CHIMNEY[0] + 2, y: CHIMNEY[1], motion: { kind: 'twinkle', periodMs: 1600, min: 0.2 } },
    { sprite: aiStar, x: 22, y: 3, motion: { kind: 'twinkle', periodMs: 2900, min: 0.2 } },
  ],
};

export const ai14Finish = aiKeepsake(
  'ai14-finish',
  'A green leaf on a short stem floating in a glass display case on a marble plinth, with sparkles around it.',
  leaf,
);

export const art: LessonArtSet = { opener: ai14Opener, backdrop: aiBackdrop, finish: ai14Finish };
