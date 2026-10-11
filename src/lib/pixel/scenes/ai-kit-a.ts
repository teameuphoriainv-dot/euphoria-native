/**
 * Alternative Investments art kit, batch A (lessons 2 to 9): the pieces more than one of those
 * lessons is built from, on top of ai-kit.ts.
 *
 * THE LAND. aiLand is the estate of the backdrop at full tone, the ground of every outdoor opener:
 * a banded night sky, far hills with a moonlit rim, the stand of pines, a meadow with a fence and a
 * gate, and a path from the gate down to the viewer (aiPathEdges says where it runs, so a lesson can
 * keep its fields off it). aiComposeLand stamps parts on it the way aiCompose stamps them on
 * aiGallery. The moon, stars and silo are the backdrop's own pieces redrawn bright. The land's tones
 * (AI_LAND_PALETTE) use letters no ai-kit piece uses, so a flattened part keeps its colours.
 *
 * THE COLLECTOR, OTHER WAYS. aiCollectorRaise is the collector with the magnifier put away and the
 * hand still raised at AI_COLLECTOR_HAND, so a lesson can stamp something else into it. aiFlip turns
 * any piece to face the other way; AI_COLLECTOR_EYE_FLIPPED and AI_COLLECTOR_GLARE_FLIPPED place the
 * blink and the lens glare on a turned collector.
 *
 * NATIVE-OWNED, like everything in scenes/ (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import type { AiPart } from './ai-kit';
import { AI_PALETTE, aiCompose } from './ai-kit';

/**
 * The land's tones. A/C/H/J are the sky's bands, darkest at the top; L and M the far hills and
 * their moonlit rim; e/h pine and its lit side; u/v the meadow and its lit edge and tufts; o the
 * path; j/i a barn's red and its shadow.
 */
export const AI_LAND_PALETTE: Readonly<Record<string, string>> = { A: '#0D1120', C: '#111829', H: '#16213A', J: '#1C2C44', L: '#12222A', M: '#24424C', e: '#12372A', h: '#1F5541', u: '#142A1E', v: '#1E3F2B', o: '#3A3343', j: '#8C2E39', i: '#5C1E27' };

/** The ground for outdoor openers, 80x60. Stamp a lesson's pieces on with aiComposeLand. */
export const aiLand: PixelSprite = {
  id: 'ai-land',
  name: 'ai-land',
  tags: ['scene', 'ai'],
  blurb: "The estate at night, bright: sky, hills, pines, a meadow with a fence and gate, a path. 80x60.",
  palette: { ...AI_PALETTE, ...AI_LAND_PALETTE },
  rows: [
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCxCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCDCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCDCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCDCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCCDCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'HHHHHHHhHHHHHHHHHHhHHHHHHHHHHHHHHDHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'HHHHHHHhHHHHHHHHHHhHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'HHHHHHehhHHHHHHHHehhHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'JJJJJJeehJJJJJJJJeehJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
    'JJJJJeeehhJJJJJJeeehhMJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
    'JhJJJJeehJJJMMMMLeehLLMhMMJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJMMMMMMMMMMJJJJJJJJJJJJ',
    'ehhJJeeeehMMLLLLeeeehLehhLMMMMJJJJJJJJJJJJJJJJJJJJJJJJMMMMLLLLLLLLLLMMMMJJJJJJJJ',
    'eehJeeeeehhLLLLeeeeehheehLLLLLMMMMJJJJJJJJJJJJJJJJMMMMLLLLLLLLLLLLLLLLLLMMMMJJJJ',
    'eehhLeeeehLLLhLLeeeeheeehhLLhLLLLLMMMMJJJJJJJJMMMMLLLLLLLLLLLLLLLLLLLLLLLLLLMMMM',
    'eehLeeeeeehLehheeeeeeheehLLehhLLLLLLLLMMMMMMMMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    'eeeeeeeeeehheeeeeeeeeeeeehLeehLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    'eeeheeeeeeheeeheeeeeeeeeeheeehhLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    'eeeeeeeeeeeheeeeeeeeeeeeehLeehLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeehLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    'eeeehLLkLLLeeeehLLkLeeeeeeeeeehLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    'vkvvvvvkvvvvvkvvvvkvvvvkvvvvkvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
    'ukuuuuukuuuuukuuuukuuuukuuuukuuuuuuuoooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuoooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuoooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuugooooooooguuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuguuuuuguuuuuguuuuuguuuuuguuuuuguuOooooooooOuuguuuuuguuuuuguuuuuguuuuuguuuuuguu',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOooooooooOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'uuOuuuuuOuuuuuOuuuuuOuuuuuOuuuuuOuuOooooooooOuuOuuuuuOuuuuuOuuuuuOuuuuuOuuuuuOuu',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOooooooooOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'uuOuuuuuOuuuuuOuuuuuOuuuuuOuuuuuOuuOooooooooOuuOuuuuuOuuuuuOuuuuuOuuuuuOuuuuuOuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuoooooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuvuuuuuuuuuuuuuuuuuuuuuuuuuuuuooooooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuvuuuuuuuuuuuuuuuuuuuuuuuuuuuuoooooooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuoooooooooooooouuuuuuuuuuuuuuuvuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuoooooooooooooooouuuuuuuuuuuuuvuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuooooooooooooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuvuuuuuuuuuuuuuuuoooooooooooooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuvuuuuuuuuuuuuuuuoooooooooooooooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuoooooooooooooooooooooouuuuuuuuuuuuuuuuuuuuvuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuooooooooooooooooooooooouuuuuuuuuuuuuuuuuuvuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuvuuuuuuoooooooooooooooooooooooouuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuoooooooooooooooooooooooooouuuuvuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuoooooooooooooooooooooooooooouuuuuuuuuuuuuuuuuuuuuuuuuu',
  ],
};

/** aiCompose on aiLand, keeping the land's tones. */
export function aiComposeLand(id: string, parts: readonly AiPart[]): PixelSprite {
  const composed = aiCompose(id, aiLand.rows, parts);
  return { ...composed, palette: { ...composed.palette, ...AI_LAND_PALETTE } };
}

/** The columns the path covers on row `y` of aiLand: the gate's width to row 46, then widening. */
export function aiPathEdges(y: number): readonly [left: number, right: number] {
  if (y < 47) return [36, 43];
  return [Math.round(36 - (y - 46) * 0.75), Math.round(43 + (y - 46) * 0.75)];
}

export const aiMoon: PixelSprite = {
  id: 'ai-moon',
  name: 'ai-moon',
  tags: ['scene', 'ai'],
  blurb: "A crescent moon for the night sky. 9x9.",
  rows: [
    '...xxx...',
    '..xwwx...',
    '.xwwx....',
    'xwwx.....',
    'xwwx.....',
    'xwwx.....',
    '.xwwx....',
    '..xwwx...',
    '...xxx...',
  ],
};

export const aiStar: PixelSprite = {
  id: 'ai-star',
  name: 'ai-star',
  tags: ['scene', 'ai'],
  blurb: "A four-point star; twinkle it.",
  rows: [
    '.x.',
    'xwx',
    '.x.',
  ],
};

export const aiSilo: PixelSprite = {
  id: 'ai-silo',
  name: 'ai-silo',
  tags: ['scene', 'ai'],
  blurb: "The backdrop's grain silo at full tone: a domed steel drum with bands. 6x20.",
  rows: [
    '..xx..',
    '.xwxX.',
    'xwxxXD',
    'DDDDDD',
    'XwxxXD',
    'XwxxXD',
    'XwxxXD',
    'XwxxXD',
    'DDDDDD',
    'XwxxXD',
    'XwxxXD',
    'XwxxXD',
    'XwxxXD',
    'XwxxXD',
    'DDDDDD',
    'XwxxXD',
    'XwxxXD',
    'XwxxXD',
    'XwxxXD',
    'DDDDDD',
  ],
};

/* ── the collector, other ways ───────────────────────────────────────────────────────────────── */

/** 20x28, facing right, like aiCollector. The raised hand is at AI_COLLECTOR_HAND; stamp what it holds just above it. */
export const aiCollectorRaise: PixelSprite = {
  id: 'ai-collector-raise',
  name: 'ai-collector-raise',
  tags: ['scene', 'ai'],
  blurb: "The collector with the magnifier put away, the hand still raised to hold something up.",
  palette: AI_PALETTE,
  rows: [
    '....................',
    '.....kkkkkk.........',
    '....kDDDDkkk........',
    '...kDDkkkkkkk.......',
    '...kDkkkkkkkkk......',
    '...kkkkkkSSSSk......',
    '...kkkkSSSSSSS......',
    '...kkkUSSKSSKS......',
    '...kkkUSSSSSSS......',
    '....kkkSSSSUS.......',
    '.....kkUSSSS...S....',
    '.......UUU....SS....',
    '.....EGGGGGgEPP.....',
    '....EqyGGGgPPPE.....',
    '....EqPPGgPPPpE.....',
    '....EqPPPPPPPpE.....',
    '....EqPPPGPPPpE.....',
    '....EqPPPPPPPpE.....',
    '....EqPPPGPPPpE.....',
    '...EqPPPPPPPPPpE....',
    '...EqPPPPPPPPPpE....',
    '...EqPPPPPPPPPpE....',
    '...EEEEEEEEEEEEE....',
    '.....DXD...DXD......',
    '.....DXD...DXD......',
    '.....DXD...DXD......',
    '.....DXD...DXD......',
    '....OgOO..OgOO......',
  ],
};

/** The raised hand, from the collector's top-left. */
export const AI_COLLECTOR_HAND = [15, 10] as const;
/** Where the blink and lens glare go on a collector turned by aiFlip. */
export const AI_COLLECTOR_EYE_FLIPPED = [7, 7] as const;
export const AI_COLLECTOR_GLARE_FLIPPED = [4, 5] as const;

const mirror = (rows: readonly string[]) => rows.map((row) => [...row].reverse().join(''));

/** A copy of `sprite` facing the other way, frames included. */
export function aiFlip(sprite: PixelSprite, id: string): PixelSprite {
  return { ...sprite, id, name: id, rows: mirror(sprite.rows), frames: sprite.frames?.map(mirror) };
}
