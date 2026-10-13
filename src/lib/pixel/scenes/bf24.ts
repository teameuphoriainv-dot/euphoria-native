/**
 * Behavioral Finance lesson 24: market anomalies and their behavioral explanations, on the fairground stage.
 *
 * Patterns that should not exist, played as hook-a-duck. Most of the ducks bobbing round the pond are
 * shiny gold, the glamour stocks everyone wants, and System 1 has grabbed one and holds it up high. The
 * tortoise, one grey duck already riding on its shell, fishes from behind the pond and lands another
 * plain grey duck nobody wanted, and that is the kind with the prize rosette under it: the value
 * premium, paid for by the crowd's overreaction and collected by tilting toward the plain ones, not by
 * one lucky pick. Anomalies with a behavioral root like this one tend to survive being discovered. The
 * stage and its lights are bf-kit-a.ts.
 *
 * The keepsake jar holds the plain grey duck wearing its gold prize rosette.
 */
import type { PixelSprite } from '../types';
import { bfShadowNarrow, bfSparkle, bfTortoise } from './bf-kit';
import { bfFairground, bfFairgroundLayers, bfMirror } from './bf-kit-a';
import { bfRecolor, bfStamp } from './bf-kit-b';
import { BF_HARE_FIST, bfHareRaise, bfHeadroom } from './bf-kit-c';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** A shiny gold duck, the kind everyone reaches for; it faces right. */
const goldDuck: PixelSprite = {
  id: 'bf24-gold-duck',
  name: 'bf24-gold-duck',
  tags: ['prop', 'bf24'],
  rows: [
    '....OOO..',
    '...OyGGO.',
    '...OGKG33',
    'O..OGGGO.',
    'OyOOGGGO.',
    'OyyyyGGGO',
    'OGGGGGGgO',
    '.OggggggO',
    '..OOOOOO.',
  ],
};

/** The same duck in plain grey: unloved, cheap, overlooked. */
const greyDuck = bfRecolor(goldDuck, 'bf24-grey-duck', { O: 'D', y: 'w', G: 'x', g: 'X' });

/** The prize mark a hook-a-duck duck carries underneath: a gold rosette with two tails. */
const rosette: PixelSprite = {
  id: 'bf24-rosette',
  name: 'bf24-rosette',
  tags: ['prop', 'bf24'],
  rows: [
    '.yGg.',
    'yGGGg',
    '.gGg.',
    '.G.g.',
    'G...g',
  ],
};

/** The grey duck on the line, its prize rosette hanging under it so the two bob together. */
const greyPrizeDuck = bfStamp(greyDuck, 'bf24-grey-prize-duck', rosette, 2, 9);

/** The game's pond: a strip of water over a pink and white striped trough. */
const pond: PixelSprite = {
  id: 'bf24-pond',
  name: 'bf24-pond',
  tags: ['prop', 'bf24'],
  rows: [
    '.DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
    'DBBwwBBBBBBBwwBBBBBBBwwBBBBBBBwwBBBBBBBwwBBBBBBBwwBBBBBD',
    'DbbbbbbBbbbbbbbbBbbbbbbbbBbbbbbbbbBbbbbbbbbBbbbbbbbbBbbD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwD',
    'DFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwD',
    'DFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwD',
    'DFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwD',
    'DFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwwwFFFFwwD',
    'DffffffffffffffffffffffffffffffffffffffffffffffffffffffD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** The tortoise's rod, from its mouth up to the tip the line hangs from. */
const rod: PixelSprite = {
  id: 'bf24-rod',
  name: 'bf24-rod',
  tags: ['prop', 'bf24'],
  rows: [
    '............g',
    '...........g.',
    '..........g..',
    '.........g...',
    '........g....',
    '.......g.....',
    '......g......',
    '.....g.......',
    '....g........',
    '...g.........',
    '..g..........',
    '.XX..........',
    'OX...........',
  ],
};

const line: PixelSprite = {
  id: 'bf24-line',
  name: 'bf24-line',
  tags: ['prop', 'bf24'],
  rows: ['w', 'w', 'w', 'w', 'w'],
};

/** System 1 holding a gold duck up high, the shiny kind; it faces the pond. */
const hareGlamour = bfMirror(
  bfStamp(bfHeadroom(bfHareRaise, 'bf24-hare-raise-tall', 4), 'bf24-hare-glamour-right', goldDuck, BF_HARE_FIST.x - 4, BF_HARE_FIST.y - 1),
  'bf24-hare-glamour',
);

const goldDuckLeft = bfMirror(goldDuck, 'bf24-gold-duck-left');

export const bf24Opener: SceneArt = {
  id: 'bf24-opener',
  label: 'At a night fairground hook-a-duck game, a hare holds up a shiny gold duck while a calm tortoise, one plain grey duck already riding on its shell, lifts another grey duck out of the pond with a sparkling gold prize rosette hanging under it.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...bfFairgroundLayers,
    { sprite: bfTortoise, x: 0, y: 31 },
    { sprite: rod, x: 36, y: 25 },
    { sprite: line, x: 48, y: 26 },
    { sprite: greyDuck, x: 7, y: 24 },
    { sprite: greyPrizeDuck, x: 44, y: 31, motion: { kind: 'bob', amp: 1, periodMs: 900 } },
    { sprite: bfSparkle, x: 45, y: 38, motion: { kind: 'twinkle', periodMs: 1500, min: 0.4 } },
    { sprite: pond, x: 12, y: 45 },
    { sprite: goldDuck, x: 12, y: 39, motion: { kind: 'drift', amp: 2, periodMs: 2600 } },
    { sprite: goldDuckLeft, x: 36, y: 39, motion: { kind: 'drift', amp: 1, periodMs: 3100, phase: 0.4 } },
    { sprite: goldDuck, x: 53, y: 39, motion: { kind: 'drift', amp: 1, periodMs: 2800, phase: 0.7 } },
    { sprite: bfShadowNarrow, x: 58, y: 56 },
    { sprite: hareGlamour, x: 53, y: 25 },
  ],
};

/** The keepsake emblem: the plain grey duck nobody wanted, wearing the gold prize rosette. */
const emblemPrizeDuck: PixelSprite = {
  id: 'bf24-emblem-prize-duck',
  name: 'bf24-emblem-prize-duck',
  tags: ['prop', 'bf24'],
  rows: [
    '..........DDD...',
    '.........DwxxD..',
    '.........DxKxD33',
    '.........DxxxD3.',
    'D.........DxD...',
    'DwD......DxxD...',
    'DwwDDDDDDxxxxD..',
    'DwwwwxxxxxxxxxD.',
    'DxwwxxxxxxxxxXD.',
    'DxxxxxxxxxxxxXD.',
    '.DXxxxxxxxxxXXD.',
    '..DDDDyGgDDDDD..',
    '.....yGGGg......',
    '......gGg.......',
    '......G.g.......',
    '.....G...g......',
  ],
};

export const bf24Finish: SceneArt = bfKeepsake(
  'bf24-finish',
  'A corked glass jar with a paper tag, holding a plain grey duck with a gold prize rosette hanging under it, with bubbles rising inside and sparkles around it.',
  emblemPrizeDuck,
);

export const art: LessonArtSet = { opener: bf24Opener, backdrop: bfBackdrop, finish: bf24Finish };
