/**
 * Behavioral Finance lesson 25: the advanced capstone, the end of the fable told one last way.
 *
 * Lesson 10 ended at the finish line with the hare asleep. This one is the prize-giving after it, on
 * the fairground lit up for the night (the wheel glowing gold, fireworks, confetti coming down): a
 * winners' podium, the tortoise on the gold step holding the winner's cup, and the hare awake now,
 * up on the silver step beside it, cheering and patting its shell. System 1 is still in the picture, it
 * always will be; the system you use for life puts System 2 on the top step. The lit wheel, fireworks,
 * confetti and backdrop are bf-kit-b.ts, made for both capstones.
 *
 * The keepsake is the capstone jar again, made this lesson's: a gold cap with a star on top, a medal
 * where the tag hangs, and inside it an anchor, a pyramid, a mug and a die from lessons 11 to 24.
 */
import type { PixelSprite } from '../types';
import { bfLater, bfTortoise } from './bf-kit';
import { bfFairground, bfFairgroundLayers } from './bf-kit-a';
import {
  bfBackdropLit,
  bfConfetti,
  bfFairWheelLit,
  bfFirework,
  bfHareGesture,
  BF_TORTOISE_MOUTH,
  bfRecolor,
  bfStamp,
} from './bf-kit-b';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The stage, lit: the wheel glows and the stars give way to fireworks. */
const stage = bfFairgroundLayers
  .filter((layer) => !layer.sprite.id.startsWith('bf-star'))
  .map((layer) => (layer.sprite.id === 'bf-fair-wheel' ? { ...layer, sprite: bfFairWheelLit } : layer));

const fireworkPink = bfLater(
  bfRecolor(bfFirework, 'bf25-firework-pink-base', { y: 'F', G: 'q', O: 'f' }),
  'bf25-firework-pink',
  3,
  340,
);

/** The winners' podium: silver 2, gold 1, bronze 3. */
const podium: PixelSprite = {
  id: 'bf25-podium',
  name: 'bf25-podium',
  tags: ['prop', 'bf25'],
  rows: [
    '....................DDDDDDDDDDDDDDDDDDDDDDDD..................',
    '....................DyyyyyyyyyyyyyyyyyyyyyyD..................',
    '....................DGGGGGGGGGGGGGGGGGGGGGgD..................',
    '....................DGGGGGGGGGOOGGGGGGGGGGgD..................',
    'DDDDDDDDDDDDDDDDDDDDDGGGGGGGGOOOGGGGGGGGGGgD..................',
    'DwwwwwwwwwwwwwwwwwwDDGGGGGGGGGOOGGGGGGGGGGgD..................',
    'DxxxxxxxxxxxxxxxxxXDDGGGGGGGGGOOGGGGGGGGGGgDDDDDDDDDDDDDDDDDDD',
    'DxxxxxxDDDDxxxxxxxXDDGGGGGGGGGOOGGGGGGGGGGgDD4444444444444444D',
    'DxxxxxxxxxDDxxxxxxXDDGGGGGGGGGOOGGGGGGGGGGgDD3333333333333332D',
    'DxxxxxxxxxDDxxxxxxXDDGGGGGGGGOOOOGGGGGGGGGgDD3333311113333332D',
    'DxxxxxxxDDDxxxxxxxXDDGGGGGGGGGGGGGGGGGGGGGgDD3333333311333332D',
    'DxxxxxxDDxxxxxxxxxXDDGGGGGGGGGGGGGGGGGGGGGgDD3333333113333332D',
    'DxxxxxxDDxxxxxxxxxXDDGGGGGGGGGGGGGGGGGGGGGgDD3333333311333332D',
    'DxxxxxxDDDDDxxxxxxXDDGGGGGGGGGGGGGGGGGGGGGgDD3333333311333332D',
    'DxxxxxxxxxxxxxxxxxXDDGGGGGGGGGGGGGGGGGGGGGgDD3333333311333332D',
    'DxxxxxxxxxxxxxxxxxXDDGGGGGGGGGGGGGGGGGGGGGgDD3333311113333332D',
    'DXXXXXXXXXXXXXXXXXXDDggggggggggggggggggggggDD2222222222222222D',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** The winner's cup, held by one handle in the tortoise's mouth. */
const trophy: PixelSprite = {
  id: 'bf25-trophy',
  name: 'bf25-trophy',
  tags: ['prop', 'bf25'],
  rows: [
    '..OOOOOOO..',
    'OOOWyyGgOOO',
    'O.OyyGGgO.O',
    'O.OyGGGgO.O',
    '.OOyGGGgOO.',
    '...OGGgO...',
    '....OGO....',
    '....OgO....',
    '...OOOOO...',
    '..OyGGGgO..',
    '..OOOOOOO..',
  ],
};

const tortoiseChampion = bfStamp(bfTortoise, 'bf25-tortoise-champion', trophy, BF_TORTOISE_MOUTH.x + 2, BF_TORTOISE_MOUTH.y - 1, BF_TORTOISE_MOUTH.dys);

export const bf25Opener: SceneArt = {
  id: 'bf25-opener',
  label: 'At a night fairground lit up with fireworks and confetti, a calm tortoise holding a gold cup stands on the top step of a winners podium while the hare, awake now, cheers beside it on the second step.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...stage,
    { sprite: bfFirework, x: 5, y: 1 },
    { sprite: fireworkPink, x: 62, y: 0 },
    { sprite: bfConfetti, x: 27, y: 4 },
    { sprite: podium, x: 4, y: 38 },
    { sprite: tortoiseChampion, x: 25, y: 21 },
    { sprite: bfHareGesture, x: 3, y: 14 },
  ],
};

/** The capstone emblem: an anchor, a pyramid, a mug and a die from later jars, kept together. */
const emblemKeepsakes: PixelSprite = {
  id: 'bf25-emblem-keepsakes',
  name: 'bf25-emblem-keepsakes',
  tags: ['emblem', 'bf', 'lesson-25'],
  blurb: "Lesson 25's emblem: the jar that keeps them all, an anchor, a pyramid, a mug and a die.",
  rows: [
    '..GGG...........',
    '..G.G...........',
    '..GGG.......F...',
    'GGGGGGG....FFF..',
    '...G.......GGG..',
    '...G......GGGGG.',
    'G..G..G...NNNNN.',
    'GG.G.GG..BBBBBBB',
    '.GGGGG...BBBBBBB',
    '................',
    '................',
    '................',
    '..........11111.',
    'EEEEEEE..1WWRRR1',
    'EPWPWPEEE1WWRRR1',
    'EPWWWPE.E1RRRRR1',
    'EPPWPPEEE1RRRWW1',
    'EpPPPpE..1RRRWW1',
    '.EEEEE....11111.',
    '................',
  ],
};

/** The capstone jar's gold cap, laid over the cork, a star for a knob. */
const goldCap: PixelSprite = {
  id: 'bf25-gold-cap',
  name: 'bf25-gold-cap',
  tags: ['keepsake', 'bf25'],
  rows: [
    '.....yy.....',
    '....yWWy....',
    '.OOOOOOOOOO.',
    'OWyyyyyyyGgO',
    'OyGGGGGGGGgO',
    '.OyGGGGGGgO.',
    '.OGGGGGGggO.',
    '.OOOOOOOOOO.',
  ],
};

/** A gold medal on its ribbon, hung on the jar's string where the paper tag goes, swaying. */
const jarMedal: PixelSprite = {
  id: 'bf25-jar-medal',
  name: 'bf25-jar-medal',
  tags: ['keepsake', 'bf25'],
  rows: [
    'O.........',
    '.OO.......',
    '...OO.....',
    '....OBRB..',
    '....BRBR..',
    '.....RBR..',
    '....OOOOO.',
    '...OyyGGgO',
    '...OyGWGgO',
    '...OGWWWgO',
    '...OGGWggO',
    '....OgggO.',
    '.....OOO..',
  ],
  frames: [
    [
      'O.........',
      '.OO.......',
      '...OO.....',
      '....OBRB..',
      '....BRBR..',
      '.....RBR..',
      '....OOOOO.',
      '...OyyGGgO',
      '...OyGWGgO',
      '...OGWWWgO',
      '...OGGWggO',
      '....OgggO.',
      '.....OOO..',
    ],
    [
      'O.........',
      'O.........',
      '.O........',
      '..OBRB....',
      '..BRBR....',
      '...RBR....',
      '..OOOOO...',
      '.OyyGGgO..',
      '.OyGWGgO..',
      '.OGWWWgO..',
      '.OGGWggO..',
      '..OgggO...',
      '...OOO....',
    ],
  ],
  frameMs: 900,
};

const jar = bfKeepsake(
  'bf25-finish',
  'A glass jar with a gold cap and a gold medal on its string, holding an anchor, a little layered pyramid, a mug with a heart and a red die from earlier lessons, with bubbles rising and sparkles around it.',
  emblemKeepsakes,
);

/** The pathway jar, made the capstone's: the medal replaces the paper tag, the gold cap goes on. */
export const bf25Finish: SceneArt = {
  ...jar,
  layers: [
    { sprite: goldCap, x: 18, y: 0 },
    { sprite: jarMedal, x: 32, y: 10 },
    ...jar.layers.filter((layer) => layer.sprite.id !== 'bf-keepsake-tag'),
  ],
};

export const art: LessonArtSet = { opener: bf25Opener, backdrop: bfBackdropLit, finish: bf25Finish };
