/**
 * Alternative Investments art kit, batch C (lessons 18 to 25): the pieces more than one of those
 * lessons is built from, on top of ai-kit.ts, ai-kit-a.ts and ai-kit-b.ts.
 *
 * THE ADVANCED DOMAINS. Lessons 19 to 24 each teach one layer every serious decision passes
 * through: due diligence (the magnifier), liquidity (the padlock), tax (the form), data (the
 * satellite), structure (the distribution waterfall) and regulation (the scales). Each emblem is
 * its lesson's keepsake, and the advanced capstone (lesson 25) brings all six back together, so
 * they live here. They are at most 14x14, so six of them fit round one opener.
 *
 * aiLedgeCover paints teal wall over the gallery's display ledge, for a scene where a piece
 * stands on the floor in front of the wall instead of on the ledge.
 *
 * NATIVE-OWNED, like everything in scenes/ (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import type { AiPart } from './ai-kit';

/** Lesson 18 onwards: wall over the gallery's ledge (cols 33 to 78, rows 43 to 45). Stamp it first. */
export const aiLedgeCover: AiPart = [
  { id: 'ai-ledge-cover', name: 'ai-ledge-cover', tags: [], rows: ['a'.repeat(46), 'a'.repeat(46), 'a'.repeat(46)] },
  33,
  43,
];

export const aiMagnifier: PixelSprite = {
  id: 'ai-magnifier',
  name: 'ai-magnifier',
  tags: ['scene', 'ai'],
  blurb: "Lesson 19: a magnifying glass with a gold rim and an orchid handle, a red flag in its glass.",
  rows: [
    '...OOOOO......',
    '.OOGGGGGOO....',
    '.OGGwxxGGO....',
    'OGGWxDRRGGO...',
    'OGwxxDRRxGO...',
    'OGxxxDxxxGO...',
    'OGxxxDxxxGO...',
    'OGGxxDxxGGO...',
    '.OGGxxxGGOO...',
    '.OOGGGGGOOyO..',
    '...OOOOO.OGgO.',
    '..........EPPE',
    '...........EPE',
    '............EE',
  ],
};

export const aiPadlock: PixelSprite = {
  id: 'ai-padlock',
  name: 'ai-padlock',
  tags: ['scene', 'ai'],
  blurb: "Lesson 20: a gold padlock, shut, a steel shackle and a keyhole.",
  rows: [
    '....DDDDDD....',
    '...DxwwwxXD...',
    '..DxXDDDDxXD..',
    '..DxD....DXD..',
    '..DwD....DXD..',
    '..DxD....DXD..',
    'OOOOOOOOOOOOOO',
    'OyyyyyyyyyyyGO',
    'OyGGGGKKGGGGgO',
    'OyGGGKKKKGGGgO',
    'OyGGGGKKGGGGgO',
    'OyGGGGKKGGGGgO',
    'OGgggggggggggO',
    'OOOOOOOOOOOOOO',
  ],
};

export const aiTaxForm: PixelSprite = {
  id: 'ai-tax-form',
  name: 'ai-tax-form',
  tags: ['scene', 'ai'],
  blurb: "Lesson 21: a tax form with a folded corner, its lines filled in and a red percent sign.",
  rows: [
    'DDDDDDDDDD....',
    'DwwwwwwwwDD...',
    'DwEEEEEwwDxD..',
    'DwwwwwwwwDxxD.',
    'DwxxxxxxwDDDDD',
    'DwwwwwwwwwwwwD',
    'DwxxxxxxxxwwwD',
    'DwwwwwwwwwwwwD',
    'DwxxxxwRRwwRwD',
    'DwwwwwwRRwRwwD',
    'DwxxxxwwwRwwwD',
    'DwwwwwwwRwRRwD',
    'DwwwwwwRwwRRwD',
    'DDDDDDDDDDDDDD',
  ],
};

export const aiSatellite: PixelSprite = {
  id: 'ai-satellite',
  name: 'ai-satellite',
  tags: ['scene', 'ai'],
  blurb: "Lesson 22: a satellite, a gold body between two blue solar panels, its dish turned to the ground.",
  rows: [
    '......yy......',
    '......OO......',
    '.....OOOO.....',
    'DDDD.OyGO.DDDD',
    'DBbD.OGGO.DbBD',
    'DbBDXOGGOXDBbD',
    'DBbD.OGgO.DbBD',
    'DbBD.OggO.DBbD',
    'DDDD.OOOO.DDDD',
    '......OO......',
    '.....DwwD.....',
    '....DwwwxD....',
    '.....DDDD.....',
  ],
};

export const aiFountain: PixelSprite = {
  id: 'ai-fountain',
  name: 'ai-fountain',
  tags: ['scene', 'ai'],
  blurb: "Lesson 23: the distribution waterfall, gold spilling from basin to basin down a three-tier fountain.",
  rows: [
    '......yy......',
    '....OyyyyO....',
    '.....OggO.....',
    '...y..Og..y...',
    '...y..Og..y...',
    '..OyyyyyyyyO..',
    '...OggggggO...',
    '.y....Og....y.',
    '.y....Og....y.',
    'OyyyyyyyyyyyyO',
    '.OGGGGGGGGGgO.',
    '..OOOOOOOOOO..',
    '.....OGgO.....',
    '....OOOOOO....',
  ],
};

export const aiScales: PixelSprite = {
  id: 'ai-scales',
  name: 'ai-scales',
  tags: ['scene', 'ai'],
  blurb: "Lesson 24: the scales of justice in gold, two pans hanging level from a beam.",
  rows: [
    '......OO......',
    '......yG......',
    'OyyyyyyGGGGGgO',
    '..O...Gg...O..',
    '.O.O..Gg..O.O.',
    'O...O.Gg.O...O',
    'OyyyO.Gg.OyyyO',
    '.OgO..Gg..OgO.',
    '..O...Gg...O..',
    '......Gg......',
    '......Gg......',
    '....OGGggO....',
    '...OyyyGGgO...',
    '...OOOOOOOO...',
  ],
};
