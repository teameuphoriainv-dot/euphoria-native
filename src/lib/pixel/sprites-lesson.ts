/**
 * LESSON METAPHORS THE SHARED CATALOGUE DOES NOT HAVE.
 *
 * lesson-mark.tsx keys 40 metaphors off lesson titles. 33 of them already exist in sprites.ts —
 * scales, hourglass, receipt, vault, globe and the rest — and reusing those was the whole point.
 * These seven had no equivalent, so they are drawn rather than approximated: forcing `magnifier`
 * onto a bar chart or `dice` onto a question mark would make different lessons wear the same
 * picture, which is precisely the problem the old system had.
 *
 * WHY THEY ARE NOT IN sprites.ts: that file is a byte-for-byte copy of euphoriaweb's, and web has
 * no lesson-art system at all (verified against origin/master — 86 sprites, no lessonArt). These
 * are iOS-original, so they live apart and can be contributed upstream later without a re-sync
 * eating them.
 *
 * House rules: 16x16, shared palette only, outlined with the deep ramp (D/O/E/I) and never with K.
 * Every one is CENTRED in its canvas — authoring left-aligned and padding right leaves a sprite a
 * pixel off centre, which is invisible in source and obvious the moment two sit side by side.
 */
import type { PixelSprite } from './types';

export const magnifier: PixelSprite = {
  id: 'magnifier',
  name: 'Magnifier',
  tags: ['analysis', 'research', 'detail'],
  blurb: 'Looking closer. Analysis and due diligence.',
  rows: [
    '................',
    '.....DDDDD......',
    '...DDBBBBBDD....',
    '..DBBwwwwwBBD...',
    '..DBwwwwwwwBD...',
    '.DBwwwwwwwwwBD..',
    '.DBwwwwwwwwwBD..',
    '..DBwwwwwwwBD...',
    '..DBBwwwwwBBD...',
    '...DDBBBBBDD....',
    '.....DDgDD......',
    '.......gOg......',
    '........gOg.....',
    '.........gOg....',
    '..........gg....',
    '................',
  ],
};

export const pricetag: PixelSprite = {
  id: 'price-tag',
  name: 'Price tag',
  tags: ['price', 'cost', 'value'],
  blurb: 'What a thing costs.',
  rows: [
    '................',
    '................',
    '.....OOOOOO.....',
    '....OGyyyyGO....',
    '...OGyKKyyyGO...',
    '...OGyKKyyyGO...',
    '...OGyyyyyyGO...',
    '...OGyyyyyyGO...',
    '...OGyyyyyyGO...',
    '...OGyyyyyyGO...',
    '....OGyyyyGO....',
    '.....OGyyGO.....',
    '......OGGO......',
    '.......OO.......',
    '................',
    '................',
  ],
};

export const dice: PixelSprite = {
  id: 'dice',
  name: 'Dice',
  tags: ['chance', 'probability', 'risk'],
  blurb: 'Odds, chance, and the difference between them.',
  rows: [
    '................',
    '................',
    '................',
    '...DDDDDDDDDD...',
    '...DwwwwwwwwD...',
    '...DwKwwwwKwD...',
    '...DwwwwwwwwD...',
    '...DwwwwKwwwD...',
    '...DwwwwwwwwD...',
    '...DwKwwwwKwD...',
    '...DwwwwwwwwD...',
    '...DDDDDDDDDD...',
    '................',
    '................',
    '................',
    '................',
  ],
};

export const crowd: PixelSprite = {
  id: 'crowd',
  name: 'Crowd',
  tags: ['market', 'participants', 'herd'],
  blurb: 'Everyone else in the market.',
  rows: [
    '................',
    '...EE....EE.....',
    '..EqqE..EqqE....',
    '..EqqE..EqqE....',
    '...EE....EE.....',
    '..EPPPE.EPPPE...',
    '.EPPPPPEPPPPPE..',
    '.EPPPPPEPPPPPE..',
    '.....EE....EE...',
    '....EqqE..EqqE..',
    '....EqqE..EqqE..',
    '.....EE....EE...',
    '....EPPPE.EPPPE.',
    '...EPPPPPEPPPPP.',
    '................',
    '................',
  ],
};

export const anchor: PixelSprite = {
  id: 'anchor',
  name: 'Anchor',
  tags: ['anchoring', 'reference', 'bias'],
  blurb: 'A number you cannot stop comparing to.',
  rows: [
    '................',
    '.......DD.......',
    '......DwwD......',
    '.......DD.......',
    '....DDDDDDDD....',
    '.......Dw.......',
    '.......Dw.......',
    '.D.....Dw.....D.',
    '.Dw....Dw....wD.',
    '.Dw....Dw....wD.',
    '..Dw...Dw...wD..',
    '...Dww.Dw.wwD...',
    '....DwwwwwwD....',
    '......DDDD......',
    '................',
    '................',
  ],
};

export const funnel: PixelSprite = {
  id: 'funnel',
  name: 'Funnel',
  tags: ['filter', 'narrow', 'screen'],
  blurb: 'Narrowing many options to a few.',
  rows: [
    '................',
    '................',
    '.DDDDDDDDDDDDDD.',
    '.DTTTTTTTTTTTTD.',
    '..DTTTTTTTTTTD..',
    '...DTTTTTTTTD...',
    '....DTTTTTTD....',
    '.....DTTTTD.....',
    '......DTTD......',
    '.......DTD......',
    '.......DTD......',
    '.......DTD......',
    '........t.......',
    '........t.......',
    '................',
    '................',
  ],
};

export const network: PixelSprite = {
  id: 'network',
  name: 'Network',
  tags: ['connections', 'systems', 'contagion'],
  blurb: 'Things joined to other things.',
  rows: [
    '................',
    '................',
    '................',
    '..EPE.....EPE...',
    '..EPE.....EPE...',
    '....pp...pp.....',
    '......ppp.......',
    '.....EPPPE......',
    '.....EPPPE......',
    '......ppp.......',
    '....pp...pp.....',
    '..EPE.....EPE...',
    '..EPE.....EPE...',
    '................',
    '................',
    '................',
  ],
};
