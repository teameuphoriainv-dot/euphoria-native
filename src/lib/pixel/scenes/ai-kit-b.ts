/**
 * Alternative Investments art kit, batch B (lessons 10 to 17): the pieces more than one lesson is
 * built from, on top of ai-kit.ts and ai-kit-a.ts.
 *
 * THE CAPSTONE CASE. aiCaseGold is the pathway's glass case gilded: the steel frame turned gold, the
 * glass tinted amber and a small crown on the cap. aiKeepsakeGold drops an emblem into it with the
 * same layers as aiKeepsake, so a capstone's keepsake is still one call (lesson 10 here, and the
 * advanced capstone, lesson 25, can use it the same way).
 *
 * THE VAULT ROOM. aiVaultRoom is the inside of the vault, the third indoor set after the gallery
 * and the auction room: a wall of safe deposit boxes with gold knobs over a steel skirting and the
 * gallery's gold floor trim, so the two rooms read as one building. Stamp pieces on with aiCompose.
 *
 * aiCoin is the small gold coin that rises off whatever pays its owner (rent, royalties).
 *
 * NATIVE-OWNED, like everything in scenes/ (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import { AI_PALETTE, aiCase, aiKeepsake } from './ai-kit';
import type { SceneArt } from './types';

/** l and Y: the gold case's amber glass and its warmer cone of light. Dark, so an emblem still reads in front. */
export const AI_GOLD_PALETTE: Readonly<Record<string, string>> = { l: '#1E180C', Y: '#2E2510' };

/** The glass rows of aiCase, gilded: steel frame to gold, teal tint to amber, grey reflections to deep gold. */
const GILD: Readonly<Record<string, string>> = { x: 'y', X: 'g', Z: 'l', V: 'Y', D: 'O', w: 'y' };
const gild = (row: string) => [...row].map((ch) => GILD[ch] ?? ch).join('');
/** A crown on the cap: three points over a band with a ruby, set on the cap's own knob. */
const CROWN: Readonly<Record<number, string>> = {
  0: '.....................y.yy.y.....................',
  1: '.....................GGRRGG.....................',
};

export const aiCaseGold: PixelSprite = {
  ...aiCase,
  id: 'ai-case-gold',
  name: 'ai-case-gold',
  blurb: "The capstone keepsake's shape: aiCase with a gold frame, amber glass and a crown on the cap.",
  palette: { ...AI_PALETTE, ...AI_GOLD_PALETTE },
  rows: aiCase.rows.map((row, y) => CROWN[y] ?? (y >= 5 && y <= 25 ? gild(row) : row)),
};

/** aiKeepsake in the gold case: the same emblem bob, sheen, glints and motes. */
export function aiKeepsakeGold(id: string, label: string, emblem: PixelSprite): SceneArt {
  return { ...aiKeepsake(id, label, emblem), base: aiCaseGold };
}

export const aiCoin: PixelSprite = {
  id: 'ai-coin',
  name: 'ai-coin',
  tags: ['scene', 'ai'],
  blurb: "A small gold coin; set it rising off whatever pays out.",
  rows: [
    '.OO.',
    'OyGO',
    'OGgO',
    '.OO.',
  ],
};

/** The ground for scenes inside the vault, 80x60: safe deposit boxes from row 7 to 42, the floor from 46. */
export const aiVaultRoom: PixelSprite = {
  id: 'ai-vault-room',
  name: 'ai-vault-room',
  tags: ['scene', 'ai'],
  blurb: "Inside the vault: a wall of safe deposit boxes with gold knobs, a steel skirting, a dark floor. 80x60.",
  palette: AI_PALETTE,
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDD',
    'kDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDD',
    'kDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDD',
    'kDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDD',
    'kDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDD',
    'kDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDD',
    'kDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDD',
    'kDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDD',
    'kDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDD',
    'DDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDD',
    'GDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDD',
    'DDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDD',
    'DDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDD',
    'DDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDD',
    'GDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDDGDDDDkDDDD',
    'DDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDD',
    'DDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDDDDDDDkDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDD',
    'kDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDD',
    'kDDDDDDDDDGDDDDDDDDDkDDDDDDDDDGDDDDDDDDDkDDDDDDDDDGDDDDDDDDDkDDDDDDDDDGDDDDDDDDD',
    'kDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDD',
    'kDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDD',
    'DDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDD',
    'GDDDDDDDDDkDDDDDDDDDGDDDDDDDDDkDDDDDDDDDGDDDDDDDDDkDDDDDDDDDGDDDDDDDDDkDDDDDDDDD',
    'DDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDD',
    'DDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDDDDDDDDDDDDkDDDDDDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};
