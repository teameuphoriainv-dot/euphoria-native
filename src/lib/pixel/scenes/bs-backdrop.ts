/**
 * bs-backdrop: the Business Strategy realm at night, drawn to sit along the bottom of every lesson
 * screen behind the content. The house castle stands in its moat (the advantage the pathway keeps
 * coming back to): a conical keep under the house pennant, towers with lit slits, house banners either
 * side of a lit gate, the drawbridge down. A rival's fort flies red on the left hill and a camp of
 * newcomers keeps a fire on the right. Windows and their reflections twinkle, ripples slide, flags
 * snap, torches gutter, embers rise, a cloud drifts past the moon. Everything stays under luminance
 * 0.15; the moving bits come from bs-kit so a later variant can reuse them.
 */
import type { PixelSprite } from '../types';
import {
  bsLater,
  bsNightEmber,
  bsNightFire,
  bsNightPennant,
  bsNightPennantRival,
  bsNightRipple,
  bsNightStar,
  bsNightTorch,
} from './bs-kit';
import type { SceneArt } from './types';

const base: PixelSprite = {
  id: 'bs-backdrop-base',
  name: 'realm at night',
  tags: [],
  rows: [
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '...............DDD.....................................DD.......................................................',
    '..............DXDDD...................................DpED......................................................',
    '..............XDDK...................................DppEED.....................................................',
    '..............XDK...................................DpppEEED....................................................',
    '...............XK..................................DppppEEEED...................................................',
    '..................................................DpppppEEEEED..................................................',
    '.................................................DppppppEEEEEED.................................................',
    '................................................DDDDDDDDDDDDDDDD................................................',
    '................................................DkkkkkkkkkkkkkKD................................................',
    '..............................DD.DD.DD..........DkkkKKkkkKKkkkKD..........DD.DD.DD..............................',
    '..............................DDDDDDDD..........DkkkKKkkkKKkkkKD..........DDDDDDDD..............................',
    '..............................DkkkkkKD..........DkkkkkkkkkkkkkKD..........DkkkkkKD..............................',
    '..............................DkkKkkKD..........DkkkkkkkkkkkkkKD..........DkkKkkKD..............................',
    '..............................DkkKkkKD..........DkkkkkkkkkkkkkKD..........DkkKkkKD..............................',
    '..............................DkkkkkKD..........DkkkkkkkkkkkkkKD..........DkkkkkKD..............................',
    '..............................DkkkkkKDDD.DD.DD.DDD.DD.DD.DD.DD.DDD.DD.DD.DDkkkkkKD......k.k.....................',
    '..............................DkkkkkKDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDkkkkkKD......kkk.....................',
    '...........D.D.D.D............DkkKkkKDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKDkkKkkKDKKKKKKkkk.........KKKKKKK.....',
    '...........DDDDDDD.......k....DkkKkkKDkkkkkkkppEkkkkkkkkkkkkkkkkppEkkkkkkkDkkKkkKDKKKKKKkkkKKKKKKKKKKKKKKKKKK...',
    '...........DkkkkKD......kkk.KKDkkkkkKDkkkKkkkppEkkkkkkkkkkkkkkkkppEkkKkkkkDkkkkkKDKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
    'K.......KKKDkKkkKD......kkkKKKDkkkkkKDkkkKkkkpOEkkkkkkkkkkkkkkkkpOEkkKkkkkDkkkkkKDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKDkkkkKDKKKKKKkkkKKKDkkkkkKDkkKKKkkppEkkkkkDDDDDDkkkkkppEkkkkkkkDkkkkkKDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKDkkkkKDKKKKKKKKKKKKDkkkkkKDkkkkkkkppEkkkkDOOOOOODkkkkppEkkkkkkkDkkkkkKDKKKKKKKKDKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKDkkkkKDKKKKKKKKKKKKDkkKkkKDkkkkkkkpEEkkkkDODOODODkkkkpEEkkkkkkkDkkKkkKDKKKKKKKDtDKKKKKKKKKDKKKKKKKKKK',
    'KKKKKKKKKKKDDDDDDDKKKKKKKKKKKKDkkKkkKDkkkkkkkEkEkkkkDODOODODkkkkEkEkkkKKKkDkkKkkKDKKKKKKDttnDKKKKKKKDtDKKKKKKKKK',
    'KKKKKKKKDDDkkkkkkkDDDKKKKKKKKKDkkkkkKDkkkkkkkkkKKKkkDODOODODkkkkkkkkkkkkkkDkkkkkKDKKKKKDttnnnDKKKKKDttnDKKKKKKKK',
    'KKKKKKDDkkkkkkkkkkkkkDDKKKKKKKDkkkkkKDkkkkkkkkkkkkkkDODOODODkkkkkkkkkkkkkkDkkkkkKDKKDDDttKKnnnDDDDDtKKnnDDKKKKKK',
    'KKKKDDkkkkkkkkkkkkkkkkkDDKKKKKDkkkkkKDkkkkkkkkkkkkkkDODOODODkkkkkkkkkkkkkkDkkkkkKDDDkkkkkkkkkkkkkkkkkkkkkkDDKKKK',
    'KKKDkkkkkkkkkkkkkkkkkkkkkDKKKKDkkkkkKDkkkkkKKKkkkkkkDODOODODkkkkkkKKKkkkkkDkkkkkKDkkkkkkkkkkkkkkkkkkkkkkkkkkDKKK',
    'KKDkkkkkkkkkkkkkkkkkkkkkkkDKKKDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkDKK',
    'KDkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDK',
    'DkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkOO1OO1OOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkKKKKKKKKKKKKkkkkkKKKKKKKKKKKKKKKKOO1OO1OOKKKKKKKKKKKKKKKkkkkkKKKKKKKKKKKKKKkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkKKKKKKKKKKKKkkkkkKKKKKKKKKKKKKKKKOO1OO1OOKKKKKKKKKKKKKKKkkkkkKKKKKKKKKKKKKKkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkKnKnKKnKKKKKkkkkkKKKKKKKKKKKKKKKKOO1OO1OOKKKKKKKKKKKKKKKkkkkkKKKKKKKKnKnKKnkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkKnKnKKnKKKKKKKKKKKKKKKKKKKKKKKKKKOO1OO1OOKKKKKKKKKKKKKKKKKKKKKKKKKKKKnKnKKnkkkkkkkkkkkkkkkkkk',
    'DDDDDDDDDDDDDDDDDDDDnDnDDnDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDnDnDDnDDDDDDDDDDDDDDDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  ],
};

const winKeep: PixelSprite = {
  id: 'bs-backdrop-win-keep',
  name: 'win-keep',
  tags: [],
  blurb: 'The two keep windows, lit.',
  rows: [
    'OO....OO',
    'OO....OO',
  ],
};

const winWest: PixelSprite = {
  id: 'bs-backdrop-win-west',
  name: 'win-west',
  tags: [],
  blurb: 'Two lit arrow slits in the west tower.',
  rows: [
    'O',
    'O',
    '.',
    '.',
    '.',
    '.',
    '.',
    '.',
    '.',
    '.',
    '.',
    'O',
    'O',
  ],
};

const winEast: PixelSprite = {
  id: 'bs-backdrop-win-east',
  name: 'win-east',
  tags: [],
  blurb: 'Two lit arrow slits in the east tower.',
  rows: [
    'O',
    'O',
    '.',
    '.',
    '.',
    'O',
    'O',
  ],
};

const winWall: PixelSprite = {
  id: 'bs-backdrop-win-wall',
  name: 'win-wall',
  tags: [],
  blurb: 'The lit windows either end of the curtain wall.',
  rows: [
    'O...........................O',
    'O...........................O',
  ],
};

const glowWater: PixelSprite = {
  id: 'bs-backdrop-glow-water',
  name: 'glow-water',
  tags: [],
  blurb: 'The tower lights again, broken up on the water.',
  rows: [
    'OO..........................................OO',
    '.O..........................................O.',
  ],
};

const haze: PixelSprite = {
  id: 'bs-backdrop-haze',
  name: 'haze',
  tags: [],
  blurb: 'A cloud that drifts across the moon.',
  rows: [
    '...kkkkk......',
    '.kkkkkkkkkkkk.',
    'kkkkkkkkkkkkkk',
    '.KKKKKKKKKKKK.',
  ],
};

const pennantWest = bsLater(bsNightPennant, 'bs-backdrop-pennant-west', 1, 680);
const pennantEast = bsLater(bsNightPennant, 'bs-backdrop-pennant-east', 3, 560);
const torchEast = bsLater(bsNightTorch, 'bs-backdrop-torch-east', 2, 530);
const rippleEast = bsLater(bsNightRipple, 'bs-backdrop-ripple-east', 2, 610);

export const bsBackdrop: SceneArt = {
  id: 'bs-backdrop',
  label: 'A castle at night standing in its moat, with a rival fort on one hill and a small camp of newcomers around a fire on the other.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: haze, x: 4, y: 6, motion: { kind: 'drift', amp: 4, periodMs: 9000 } },
    { sprite: bsNightPennant, x: 55, y: 0 },
    { sprite: pennantWest, x: 31, y: 8 },
    { sprite: pennantEast, x: 75, y: 8 },
    { sprite: bsNightPennantRival, x: 14, y: 16 },
    { sprite: winKeep, x: 52, y: 12, motion: { kind: 'twinkle', periodMs: 6400, min: 0.35, phase: 0.1 } },
    { sprite: winWest, x: 33, y: 15, motion: { kind: 'twinkle', periodMs: 7000, min: 0.3, phase: 0.5 } },
    { sprite: winEast, x: 77, y: 15, motion: { kind: 'twinkle', periodMs: 5800, min: 0.3, phase: 0.8 } },
    { sprite: winWall, x: 41, y: 22, motion: { kind: 'twinkle', periodMs: 7600, min: 0.35, phase: 0.3 } },
    { sprite: glowWater, x: 33, y: 38, motion: { kind: 'twinkle', periodMs: 3400, min: 0.2, phase: 0.6 } },
    { sprite: bsNightTorch, x: 50, y: 26 },
    { sprite: torchEast, x: 61, y: 26 },
    { sprite: bsNightFire, x: 93, y: 25 },
    { sprite: bsNightEmber, x: 95, y: 22, motion: { kind: 'rise', amp: 6, periodMs: 2600 } },
    { sprite: bsNightEmber, x: 94, y: 23, motion: { kind: 'rise', amp: 5, periodMs: 3100, phase: 0.5 } },
    { sprite: bsNightRipple, x: 22, y: 38 },
    { sprite: rippleEast, x: 66, y: 37 },
    { sprite: bsNightStar, x: 6, y: 3, motion: { kind: 'twinkle', periodMs: 5200, min: 0.3, phase: 0.2 } },
    { sprite: bsNightStar, x: 44, y: 3, motion: { kind: 'twinkle', periodMs: 6100, min: 0.3, phase: 0.7 } },
    { sprite: bsNightStar, x: 96, y: 6, motion: { kind: 'twinkle', periodMs: 4700, min: 0.3, phase: 0.4 } },
  ],
};
