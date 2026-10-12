/**
 * Alternative Investments lesson 14: carbon credits and environmental markets.
 *
 * The opener is the estate at night on the kit's land (ai-kit-a.ts) split between the two sides of
 * a carbon market, the path between them. On the right the emitter: a banded chimney just past the
 * path breathing grey smoke up into the cloud marked CO2 right over it, a turbine hall, and further
 * off a cooling tower letting off steam. On the left a big broadleaf tree, the side that takes carbon
 * back. Between them the trade itself: a carbon credit (a certificate with a leaf and 1t, one credit
 * per tonne of CO2 avoided or removed) and a gold coin swing past each other, the credit toward the
 * station while the cash goes to the tree. Only small layers move: the cloud drifts, smoke and steam
 * rise, the credit and the coin trade places, the chimney's warning light blinks and a star
 * twinkles. The keepsake is that credit: the certificate with a gold seal.
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
    ...Array.from({ length: 18 }, () => 'DxxXD'),
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

/** Smoke off the chimney rim: two round grey puffs that rise into the cloud. */
const puffBig: PixelSprite = { id: 'ai14-puff-big', name: 'ai14-puff-big', tags: [], rows: ['.xxx.', 'xxxxX', 'xxxXX', '.XXX.'] };
const puffSmall: PixelSprite = { id: 'ai14-puff-small', name: 'ai14-puff-small', tags: [], rows: ['.xx.', 'xxxX', '.XX.'] };
const steam: PixelSprite = { id: 'ai14-steam', name: 'ai14-steam', tags: [], rows: ['.ww.', 'wwwx', '.xx.'] };
const beacon: PixelSprite = { id: 'ai14-beacon', name: 'ai14-beacon', tags: [], rows: ['R'] };

/** A carbon credit: a certificate in a green border with a leaf and 1t, one tonne of CO2. */
const credit: PixelSprite = {
  id: 'ai14-credit',
  name: 'ai14-credit',
  tags: ['scene', 'ai'],
  blurb: "A small carbon credit certificate: a green border, a leaf and 1t.",
  rows: [
    'nnnnnnnnnnnnn',
    'nwwNNwwkwwkwn',
    'nwNNNwkkwkkkn',
    'nNNNnwwkwwkwn',
    'nNNnwwwkwwkwn',
    'nnwwwwwkwwkkn',
    'nnnnnnnnnnnnn',
  ],
};

/** The cash the emitter pays for it. */
const coin: PixelSprite = { id: 'ai14-coin', name: 'ai14-coin', tags: [], rows: ['.OOOO.', 'OyyyGO', 'OyGGgO', 'OGGGgO', 'OGgggO', '.OOOO.'] };

const certificate: PixelSprite = {
  id: 'ai14-certificate',
  name: 'ai14-certificate',
  tags: ['scene', 'ai'],
  blurb: "Lesson 14: a carbon credit, a certificate with a leaf and 1t (one tonne of CO2) under a gold seal on green ribbons.",
  rows: [
    '.nnnnnnnnnnnnnn.',
    'nwwwwwwwwwwwwwwn',
    'nwwwNNwwkkwkkwwn',
    'nwwNNNwkkkwkkwwn',
    'nwNNmNwwkkwkkkwn',
    'nNNmNnwwkkwkkwwn',
    'nNmNnwwwkkwkkwwn',
    'nmNnwwwwkkwkkwwn',
    'nnwwwwwwkkwwkkwn',
    'nwwwwwwwwwwOOOwn',
    'nwxxxxxxwwOyGGOn',
    '.nnnnnnnnnOGyGO.',
    '..........OGGgO.',
    '...........OOO..',
    '...........N.N..',
    '..........N...N.',
  ],
};

const TREE = [6, 11] as const;
/** The chimney stands just past the path, its cloud right over it; the cooling tower further off, its steam clear of the cloud. */
const CHIMNEY = [46, 12] as const;
const CLOUD = [38, 0] as const;
const COOLING = [62, 19] as const;
/** The credit and the coin swing about the same point over the path, half a cycle apart. */
const TRADE = [30, 20] as const;

const base = aiComposeLand('ai14-opener-base', [
  [aiMoon, 3, 2],
  [hall, 49, 33],
  [chimney, CHIMNEY[0], CHIMNEY[1]],
  [coolingTower, COOLING[0], COOLING[1]],
  [tree, TREE[0], TREE[1]],
]);

export const ai14Opener: SceneArt = {
  id: 'ai14-opener',
  label: 'At night a power station chimney puffs grey smoke up into a cloud marked CO2, beside a cooling tower letting off steam, while a carbon credit certificate marked 1t and a gold coin trade places between the station and a big tree on the other side of the path.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: puffBig, x: CHIMNEY[0], y: CHIMNEY[1] - 4, motion: { kind: 'rise', amp: 5, periodMs: 2600 } },
    { sprite: puffSmall, x: CHIMNEY[0] + 1, y: CHIMNEY[1] - 3, motion: { kind: 'rise', amp: 6, periodMs: 2600, phase: 0.5 } },
    { sprite: co2, x: CLOUD[0], y: CLOUD[1], motion: { kind: 'drift', amp: 2, periodMs: 6000 } },
    { sprite: steam, x: COOLING[0] + 5, y: COOLING[1] - 4, motion: { kind: 'rise', amp: 6, periodMs: 3200, phase: 0.2 } },
    { sprite: steam, x: COOLING[0] + 9, y: COOLING[1] - 3, motion: { kind: 'rise', amp: 6, periodMs: 3200, phase: 0.7 } },
    { sprite: credit, x: TRADE[0], y: TRADE[1], motion: { kind: 'drift', amp: 12, periodMs: 6400 } },
    { sprite: coin, x: TRADE[0] + 4, y: TRADE[1] + 9, motion: { kind: 'drift', amp: 12, periodMs: 6400, phase: 0.5 } },
    { sprite: beacon, x: CHIMNEY[0] + 2, y: CHIMNEY[1], motion: { kind: 'twinkle', periodMs: 1600, min: 0.2 } },
    { sprite: aiStar, x: 24, y: 4, motion: { kind: 'twinkle', periodMs: 2900, min: 0.2 } },
  ],
};

export const ai14Finish = aiKeepsake(
  'ai14-finish',
  'A carbon credit certificate with a green leaf, the mark 1t and a gold seal on green ribbons, floating in a glass display case on a marble plinth, with sparkles around it.',
  certificate,
);

export const art: LessonArtSet = { opener: ai14Opener, backdrop: aiBackdrop, finish: ai14Finish };
