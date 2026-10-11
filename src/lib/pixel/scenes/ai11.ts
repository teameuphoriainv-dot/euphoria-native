/**
 * Alternative Investments lesson 11: real estate investment trusts.
 *
 * The opener is the estate at night on the kit's land (ai-kit-a.ts) with a street of the buildings a
 * REIT owns, one per sector the lesson names: a brick apartment block with a water tank, a shop with
 * a striped awning at the end of the path, a glass office tower and a low data centre. A gold coin
 * rises off every roof, because a REIT must pay out most of its income (the lesson's 90% rule) and
 * the owner of one share is paid by all of them. Only small layers move: the coins rise, an
 * apartment window turns on and off, the tower's beacon and the data centre's lights blink and a
 * star twinkles. The keepsake is a new emblem: the apartment block.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiKeepsake } from './ai-kit';
import { AI_LAND_PALETTE, aiComposeLand, aiMoon, aiStar } from './ai-kit-a';
import { aiCoin } from './ai-kit-b';
import type { LessonArtSet, SceneArt } from './types';

const apartments: PixelSprite = {
  id: 'ai11-apartments',
  name: 'ai11-apartments',
  tags: ['scene', 'ai'],
  blurb: "A brick apartment block: a water tank on the roof, a stone cornice, five floors of windows, a lobby.",
  palette: AI_LAND_PALETTE,
  rows: [
    '.................OOO.....',
    '................OgggO....',
    '...............OgGGGgO...',
    '...............OgggggO...',
    '...............OOOOOOO...',
    '................D...D....',
    'xxxxxxxxxxxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDDDDDDDDDDD',
    'ijyyyjjjKKKjjjyyyjjjyyyji',
    'ijGGGjjjKKKjjjGGGjjjGGGji',
    'ijGGGjjjKKKjjjGGGjjjGGGji',
    'ijxxxjjjxxxjjjxxxjjjxxxji',
    'ijKKKjjjyyyjjjyyyjjjKKKji',
    'ijKKKjjjGGGjjjGGGjjjKKKji',
    'ijKKKjjjGGGjjjGGGjjjKKKji',
    'ijxxxjjjxxxjjjxxxjjjxxxji',
    'ijyyyjjjyyyjjjKKKjjjyyyji',
    'ijGGGjjjGGGjjjKKKjjjGGGji',
    'ijGGGjjjGGGjjjKKKjjjGGGji',
    'ijxxxjjjxxxjjjxxxjjjxxxji',
    'ijyyyjjjKKKjjjKKKjjjyyyji',
    'ijGGGjjjKKKjjjKKKjjjGGGji',
    'ijGGGjjjKKKjjjKKKjjjGGGji',
    'ijxxxjjjxxxjjjxxxjjjxxxji',
    'ijKKKjjjyyyjjjyyyjjjyyyji',
    'ijKKKjjjGGGjjjGGGjjjGGGji',
    'ijKKKjjjGGGjjjGGGjjjGGGji',
    'ijxxxjjjxxxjjjxxxjjjxxxji',
    'ixxxxxxxxxxxxxxxxxxxxxxxi',
    'ijyyyyjjjDDDDDDDjjjyyyyji',
    'ijGGGGjjjDOOgOODjjjGGGGji',
    'ijGGGGjjjDOOgOODjjjGGGGji',
    'iiiiiiiiiDOOgOODiiiiiiiii',
  ],
};

const shop: PixelSprite = {
  id: 'ai11-shop',
  name: 'ai11-shop',
  tags: ['scene', 'ai'],
  blurb: "A shop with an orchid and white awning, lit windows and a door on the path.",
  rows: [
    'DDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxD',
    'DXXXXXXXXXXXXD',
    'PPwwPPwwPPwwPP',
    'ppxxppxxppxxpp',
    'DyyyyDOODyyyyD',
    'DGGGGDOgDGGGGD',
    'DGGGGDOgDGGGGD',
    'DGGGGDOgDGGGGD',
    'DDDDDDOgDDDDDD',
  ],
};

const tower: PixelSprite = {
  id: 'ai11-tower',
  name: 'ai11-tower',
  tags: ['scene', 'ai'],
  blurb: "A glass office tower: an aerial, a setback, blue glass between dark floor bands, a few lit offices.",
  rows: [
    '......r......',
    '......D......',
    '......D......',
    '.....DXD.....',
    '...DDDDDDD...',
    '...DbbDbbD...',
    '...DbBDbbD...',
    'DDDDDDDDDDDDD',
    'DbbDyyDbbDbbD',
    'DbbDGGDbbDbbD',
    'DDDDDDDDDDDDD',
    'DBbDbbDbbDbbD',
    'DbBDbbDbbDbbD',
    'DDDDDDDDDDDDD',
    'DbbDbBDbbDyyD',
    'DbbDBbDbbDGGD',
    'DDDDDDDDDDDDD',
    'DyyDbbDbBDbbD',
    'DGGDbbDBbDbbD',
    'DDDDDDDDDDDDD',
    'DbbDbbDbbDbBD',
    'DbbDbbDbbDBbD',
    'DDDDDDDDDDDDD',
    'DbbDyyDbbDbbD',
    'DbbDGGDbbDbbD',
    'DDDDDDDDDDDDD',
    'DbBDbbDyyDbbD',
    'DBbDbbDGGDbbD',
    'DDDDDDDDDDDDD',
    'DbbDbbDbbDyyD',
    'DbbDbbDbbDGGD',
    'DDDDDDDDDDDDD',
    'DyyyyDODyyyyD',
    'DGGGGDODGGGGD',
    'DDDDDDDDDDDDD',
  ],
};

const dataCentre: PixelSprite = {
  id: 'ai11-data-centre',
  name: 'ai11-data-centre',
  tags: ['scene', 'ai'],
  blurb: "A low data centre: cooling units on the roof, vents, a row of status lights, a door.",
  rows: [
    '.DDDD....DDDD...',
    '.DXXD....DXXD...',
    'DDDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxxD',
    'DXXXXXXXXXXXXXXD',
    'DXkkkkXXXXkkkkXD',
    'DXXXXXXXXXXXXXXD',
    'DXkkkkXXXXkkkkXD',
    'DXXXXXXXXXXXXXXD',
    'DXnXnXnXXXDDDXXD',
    'DXXXXXXXXXDkDXXD',
    'DDDDDDDDDDDkDDDD',
  ],
};

const window_: PixelSprite = { id: 'ai11-window', name: 'ai11-window', tags: [], rows: ['yyy', 'GGG', 'GGG'] };
const beacon: PixelSprite = { id: 'ai11-beacon', name: 'ai11-beacon', tags: [], rows: ['R'] };
const leds: PixelSprite = { id: 'ai11-leds', name: 'ai11-leds', tags: [], rows: ['N.N.N'] };

const apartmentBlock: PixelSprite = {
  id: 'ai11-apartment-block',
  name: 'ai11-apartment-block',
  tags: ['scene', 'ai'],
  blurb: "Lesson 11: a brick apartment block with a water tank, lit windows and a door.",
  palette: AI_LAND_PALETTE,
  rows: [
    '.........OOO..',
    '........OgggO.',
    '........OOOOO.',
    '........D...D.',
    'xxxxxxxxxxxxxx',
    'ijyyjjyyjjKKji',
    'ijGGjjGGjjKKji',
    'ijjjjjjjjjjjji',
    'ijKKjjyyjjyyji',
    'ijKKjjGGjjGGji',
    'ijjjjjjjjjjjji',
    'ijyyjjKKjjyyji',
    'ijGGjjKKjjGGji',
    'ixxxxxxxxxxxxi',
    'ijjjjDOODjjjji',
    'iiiiiDOODiiiii',
  ],
};

const APARTMENTS = [5, 8] as const;
const SHOP = [33, 31] as const;
const TOWER = [50, 6] as const;
const DATA = [64, 29] as const;

const base = aiComposeLand('ai11-opener-base', [
  [aiMoon, 36, 6],
  [apartments, APARTMENTS[0], APARTMENTS[1]],
  [shop, SHOP[0], SHOP[1]],
  [tower, TOWER[0], TOWER[1]],
  [dataCentre, DATA[0], DATA[1]],
]);

export const ai11Opener: SceneArt = {
  id: 'ai11-opener',
  label: 'A street of buildings on a moonlit estate, an apartment block, a shop, a glass office tower and a data centre, with a gold coin rising off every roof.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aiCoin, x: APARTMENTS[0] + 5, y: APARTMENTS[1] + 1, motion: { kind: 'rise', amp: 6, periodMs: 3000, phase: 0.1 } },
    { sprite: aiCoin, x: SHOP[0] + 9, y: SHOP[1] - 5, motion: { kind: 'rise', amp: 6, periodMs: 3300, phase: 0.6 } },
    { sprite: aiCoin, x: TOWER[0] + 10, y: TOWER[1] + 2, motion: { kind: 'rise', amp: 5, periodMs: 2800, phase: 0.35 } },
    { sprite: aiCoin, x: DATA[0] + 6, y: DATA[1] - 5, motion: { kind: 'rise', amp: 6, periodMs: 3600, phase: 0.85 } },
    { sprite: window_, x: APARTMENTS[0] + 2, y: APARTMENTS[1] + 12, motion: { kind: 'twinkle', periodMs: 4200, min: 0.1 } },
    { sprite: beacon, x: TOWER[0] + 6, y: TOWER[1], motion: { kind: 'twinkle', periodMs: 1600, min: 0.2 } },
    { sprite: leds, x: DATA[0] + 2, y: DATA[1] + 9, motion: { kind: 'twinkle', periodMs: 1200, min: 0.3, phase: 0.5 } },
    { sprite: aiStar, x: 8, y: 3, motion: { kind: 'twinkle', periodMs: 2700, min: 0.2 } },
    { sprite: aiStar, x: 70, y: 9, motion: { kind: 'twinkle', periodMs: 3200, min: 0.2, phase: 0.6 } },
  ],
};

export const ai11Finish = aiKeepsake(
  'ai11-finish',
  'A brick apartment block with a water tank and lit windows floating in a glass display case on a marble plinth, with sparkles around it.',
  apartmentBlock,
);

export const art: LessonArtSet = { opener: ai11Opener, backdrop: aiBackdrop, finish: ai11Finish };
