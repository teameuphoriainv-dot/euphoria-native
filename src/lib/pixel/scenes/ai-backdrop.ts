/**
 * ai-backdrop: the estate's land at night, for the Alternative Investments course, drawn to sit
 * along the bottom of every lesson screen behind the content. Far hills are K under a k ridge, a
 * stand of pines on the left catches the moon on its tips, a wind turbine turns over the manor house, a
 * maroon barn and a silo stand by the fields, and an oil pump nods on the right; the turbine and
 * pump are the kit's own, dimmed by aiDim. A few manor windows glow and fireflies drift over the
 * fence line. Everything stays under luminance 0.15.
 */
import type { PixelSprite } from '../types';
import { aiDim, aiPumpJack, aiTurbineBlades } from './ai-kit';
import type { SceneArt } from './types';

const base: PixelSprite = {
  id: 'ai-backdrop-base',
  name: 'estate at night',
  tags: [],
  // e/h are pine (shadow, moonlit tip) and j the barn's red, all far under the 0.15 ceiling.
  palette: { e: '#0F2A22', h: '#1C4A3A', j: '#4E1F27' },
  rows: [
    '................................................................................................................',
    '................................................................................................................',
    '....................................................................................................D...........',
    '...................................................................................................D............',
    '..................................................................................................DX............',
    '..................................................................................................DX............',
    '..................................................................................................DXX...........',
    '...................................................................................................DXXXD........',
    '....................................................................................................DDD.........',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '...............................DDD..............................................................................',
    '...............................DDD..............................................................................',
    '................................D...............................................................................',
    '................................D...............................................................................',
    '................................D...............................................................................',
    '.............h..................D...............................................................................',
    '....h........e..................D..................DD.............DD............................................',
    '....e.......hee........h........D..................DD......D......DD......................X.....................',
    '...hee.....eehee.......e........D................KKDDKKKKKKDKKKKKKDDKK...................XXX....................',
    '..eehee.....eee...h...hee.......D...............KKKKKKKKKKDKDKKKKKKKKKK..................DDD....................',
    '...eee...h.eeeee..e..eehee......DDkkkkkkkkk....KKKKKKKKKKDKKKDKKKKKKKKKK........KKKKK....DkD................kkkk',
    'e.eeeee..eeheeeeehee..eee..h....DDKKKKKKKKKkkkDDDDDDDDDDDDDDDDDDDDDDDDDDD......KjjjjjK...DkD.............kkkKKKK',
    'eeheeeeeheeeeheeeeheeeeeee.e..kkDDKKKKKKKKKKKKkDkkkkkkkkDkkkkkDkkkkkkkkD......KjjjjjjjKkkDkDkkkkkkkkkkkkkKKKKKKK',
    'eeeeheeeeheeeeee.eeeeheeeeheekKKDDKKKKKKKKKKKKKDkKKkKKkkDkKkKkDkkKKkKKkD.....KjjjjjjjjjKKDkDKKKKKKKKKKKKKKKKKKKK',
    'eeeeeeekeeeeeeeeeeeeeeeheeeheeKKDDKKKKKKKKKKKKKDkKKkKKkkDkKkKkDkkKKkKKkD.....DjjjDDDjjjDKDkDKKKKKKKKKKKKKKKKKKKK',
    'eeeeeeeeeeeeeeeeheeeeeeeeeeeeKKKDDKKKKKKKKKKKKKDkkkkkkkkDkkkkkDkkkkkkkkD.....DjjjDkDjjjDKDkDKKKKKKKKKKKKKKKKKKKK',
    'eeeeeeeheeheeeeeeeheeeeeeeeeeeKKDDKKKKKKKKKKKKKDkKKkKKkkDkkKkkDkkKKkKKkDk....DjjjDDDjjjDKDkDKKKKKKKKKKKKKKKKKKKK',
    'eheeeeeeeeeeeeeeeeeeeeeeeheeeeeKDDKKKKKKKKKKKKKDkKKkKKkkDkKKKkDkkKKkKKkDKkkkkDjjDkDkDjjDKDkDKKKKKKKKKKKKKKKKKKKK',
    'eeeeeeeeeeeeKKKeeeeeheDDDDDDDDDDDDDKKKKKKKKKKKDDkkkkkkkkDkKKKkDkkkkkkkkDKKKKKDjjDDkDDjjDKDkDKKKKKKKKKKKKDDDDDDDD',
    'eeeeKKeeeeeeeKeeeeDDDDkkkkkkkkkkDDkDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDKKKKDjjDkDkDjjDDDkDDDDDDDDDDDDDkkkkkkkk',
    'eeeeeeeeeeeeeeDDDDkkkkkkkkkkkkkkDDkkkkkkkkkkkkkkkkkkkkkkkkDDDDKKKKKKKKKKKKKKKDDDDDDDDDDDkDDDkkkkkkkkkkkkkkkkkkkk',
    'DDDeeeheeeDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDDDDKKKKKKKKDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkDDDDDDDDkkkkDkkkkkDkkkkkDkkkkkDkkkkkDkkkkkDkkkkkDkkkkkDkkkkkDkkkDDDDDDDDDkkkkkDkkkkkDkkkkkDkkkkkDkkkkkDkkkkkDk',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'KKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDK',
    'KKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDKKKKKDK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};
const Lturbine = aiDim(aiTurbineBlades, 'ai-backdrop-turbine');
const Lpump = aiDim(aiPumpJack, 'ai-backdrop-pump');
const Lwin: PixelSprite = { id: 'ai-backdrop-win', name: 'ai-backdrop-win', tags: [], rows: ['OO'] };
const LwinSmall: PixelSprite = { id: 'ai-backdrop-win-small', name: 'ai-backdrop-win-small', tags: [], rows: ['O'] };
const Lfirefly: PixelSprite = { id: 'ai-backdrop-firefly', name: 'ai-backdrop-firefly', tags: [], rows: ['O'] };
const LfireflyGreen: PixelSprite = { id: 'ai-backdrop-firefly-green', name: 'ai-backdrop-firefly-green', tags: [], rows: ['n'] };
const Lstar: PixelSprite = { id: 'ai-backdrop-star', name: 'ai-backdrop-star', tags: [], rows: ['D'] };
const Lsmoke: PixelSprite = { id: 'ai-backdrop-smoke', name: 'ai-backdrop-smoke', tags: [], rows: ['.k', 'kk', 'k.'] };
const Lmist: PixelSprite = {
  id: 'ai-backdrop-mist',
  name: 'ai-backdrop-mist',
  tags: [],
  rows: [
    '.....kkkkkkk.......kkkkk.....',
    '.kkkkkkkkkkkkkkkkkkkkkkkkkkk.',
  ],
};

export const aiBackdrop: SceneArt = {
  id: 'ai-backdrop',
  label: 'Farmland at night with a forest, a turning wind turbine, a manor house with lit windows, a barn and a nodding oil pump.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: Lturbine, x: 25, y: 5 },
    { sprite: Lpump, x: 93, y: 24 },
    { sprite: Lwin, x: 49, y: 25, motion: { kind: 'twinkle', periodMs: 6200, min: 0.35, phase: 0.1 } },
    { sprite: Lwin, x: 65, y: 28, motion: { kind: 'twinkle', periodMs: 7400, min: 0.3, phase: 0.6 } },
    { sprite: LwinSmall, x: 58, y: 25, motion: { kind: 'twinkle', periodMs: 5600, min: 0.35, phase: 0.35 } },
    { sprite: Lsmoke, x: 51, y: 14, motion: { kind: 'rise', amp: 6, periodMs: 6400, phase: 0.2 } },
    { sprite: Lmist, x: 10, y: 30, motion: { kind: 'drift', amp: 4, periodMs: 9000 } },
    { sprite: Lfirefly, x: 20, y: 38, motion: { kind: 'rise', amp: 4, periodMs: 5200, phase: 0.1 } },
    { sprite: LfireflyGreen, x: 41, y: 40, motion: { kind: 'rise', amp: 5, periodMs: 6100, phase: 0.55 } },
    { sprite: Lfirefly, x: 74, y: 39, motion: { kind: 'rise', amp: 4, periodMs: 5700, phase: 0.8 } },
    { sprite: LfireflyGreen, x: 88, y: 41, motion: { kind: 'rise', amp: 5, periodMs: 6600, phase: 0.3 } },
    { sprite: Lstar, x: 14, y: 4, motion: { kind: 'twinkle', periodMs: 5000, min: 0.3, phase: 0.2 } },
    { sprite: Lstar, x: 47, y: 7, motion: { kind: 'twinkle', periodMs: 6300, min: 0.3, phase: 0.7 } },
    { sprite: Lstar, x: 83, y: 3, motion: { kind: 'twinkle', periodMs: 5600, min: 0.3, phase: 0.45 } },
  ],
};
