/**
 * Global Economics lesson 1 keepsake: a postage stamp for the pathway, with the lesson's emblem in
 * its window, drawn for the lesson-complete screen (3pt/px).
 *
 * THE SHAPE IS THE PATHWAY'S, THE EMBLEM IS THE LESSON'S. Perforated cream paper, an emerald frame
 * and a night-blue window make every Global Economics keepsake; the 16x16 kit emblem in the window
 * (lesson 1: the signpost whose arrows light in turn) is all that changes, via geKeepsake. The stamp
 * is the still base; the emblem floats a pixel without touching the frame, and sparkles and motes move.
 */
import type { PixelSprite } from '../types';
import { GE_EMBLEM_SIZE, GE_PALETTE, geEmblemFork, geLater, geSparkle } from './ge-kit';
import type { SceneArt } from './types';

const stamp: PixelSprite = {
  id: 'ge-keepsake-stamp',
  name: 'stamp',
  tags: ['scene', 'ge'],
  blurb: 'The pathway stamp: perforated cream paper, an emerald frame, a night-blue window and a line of print.',
  palette: GE_PALETTE,
  rows: [
    '................................................',
    '................................................',
    '................................................',
    '.........OO..OO..OO..OO..OO..OO..OO..OO.........',
    '........OOAOOAAOOAAOOAAOOAAOOAAOOAAOOAOO........',
    '........OAAAAAAAAAAAAAAAAAAAAAAAAAAAAASO........',
    '.........OAAAAAAAAAAAAAAAAAAAAAAAAAAAAO.........',
    '.........OAAJJJJJJJJJJJJJJJJJJJJJJJJAAO.........',
    '........OAAAJNNNNNNNNNNNNNNNNNNNNNNJAASO........',
    '........OAAAJNnnnnnnnnnnnnnnnnnnnnnJAASO........',
    '.........OAAJNnJJJJJJJJJJJJJJJJJJnnJAAO.........',
    '.........OAAJNnJcccccccccccccccccnnJAAO.........',
    '........OAAAJNnJccccccccccdccccccnnJAASO........',
    '........OAAAJNnJccxccccccccccccccnnJAASO........',
    '.........OAAJNnJcccccccccccccccccnnJAAO.........',
    '.........OAAJNnJcccccccccccccxcccnnJAAO.........',
    '........OAAAJNnJcccccccccccccccccnnJAASO........',
    '........OAAAJNnJcccccccccccccccccnnJAASO........',
    '.........OAAJNnJcccccccccccccccccnnJAAO.........',
    '.........OAAJNnJcccccccccccccccccnnJAAO.........',
    '........OAAAJNnJcccccccccccccccccnnJAASO........',
    '........OAAAJNnJcccccccccccccccccnnJAASO........',
    '.........OAAJNnJcccccccccccccccccnnJAAO.........',
    '.........OAAJNnJcccccccccccccccccnnJAAO.........',
    '........OAAAJNnJcccccccccccccccccnnJAASO........',
    '........OAAAJNnJcccccccccccccccccnnJAASO........',
    '.........OAAJNnJaaaaaaaaaaaaaaaaannJAAO.........',
    '.........OAAJNnJdddddddddddddddddnnJAAO.........',
    '........OAAAJNnJdddddddddddddddddnnJAASO........',
    '........OAAAJNnnnnnnnnnnnnnnnnnnnnnJAASO........',
    '.........OAAJNnnbbnnnnnnnnnnnnnnnnnJAAO.........',
    '.........OAAJNnbNBbnnmmmmmmmmmnnnnnJAAO.........',
    '........OAAAJNnbBNbnnnnnnnnnnnnnnnnJAASO........',
    '........OAAAJNnnbbnnnJJJJJJnnnnnnnnJAASO........',
    '.........OAAJNnnnnnnnnnnnnnnnnnnnnnJAAO.........',
    '.........OAAJNnnnnnnnnnnnnnnnnnnnnnJAAO.........',
    '........OAAAJJJJJJJJJJJJJJJJJJJJJJJJAASO........',
    '........OAAAAAAAAAAAAAAAAAAAAAAAAAAAAASO........',
    '.........OAAAAAAAAAAAAAAAAAAAAAAAAAAAAO.........',
    '.........OSOOSSOOSSOOSSOOSSOOSSOOSSOOSO.........',
    '.........OO..OO..OO..OO..OO..OO..OO..OO.........',
    '................................................',
    '................................................',
    '................................................',
  ],
};

/** Top-left of the 16x16 emblem in the stamp's window, in scene pixels. */
export const GE_KEEPSAKE_EMBLEM = { x: 16, y: 12 } as const;

const moteMint: PixelSprite = {
  id: 'ge-keepsake-mote-mint',
  name: 'mote-mint',
  tags: [],
  rows: [
    'm',
    'N',
  ],
};

const moteGold: PixelSprite = {
  id: 'ge-keepsake-mote-gold',
  name: 'mote-gold',
  tags: [],
  rows: [
    'y',
    'G',
  ],
};

const sparkleLater = geLater(geSparkle, 'ge-keepsake-sparkle-later', 2, 410);

/**
 * The pathway keepsake with `emblem` in the window. Every lesson's stamp shares the shape and the
 * moving bits, so only the emblem and the VoiceOver label change from lesson to lesson.
 */
export function geKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  // A wrong-size emblem would sit off-centre in the window with no error, so it refuses instead.
  if (emblem.rows.length !== GE_EMBLEM_SIZE || emblem.rows[0].length !== GE_EMBLEM_SIZE) {
    throw new Error(`${id}: emblem ${emblem.id} must be ${GE_EMBLEM_SIZE}x${GE_EMBLEM_SIZE}`);
  }
  return {
    id,
    label,
    width: 48,
    height: 44,
    base: stamp,
    layers: [
      { sprite: emblem, x: GE_KEEPSAKE_EMBLEM.x, y: GE_KEEPSAKE_EMBLEM.y, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
      { sprite: geSparkle, x: 1, y: 8, motion: { kind: 'twinkle', periodMs: 1700, min: 0.45 } },
      { sprite: sparkleLater, x: 42, y: 29, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.5, min: 0.45 } },
      { sprite: moteMint, x: 4, y: 26, motion: { kind: 'rise', amp: 5, periodMs: 2300, phase: 0.1 } },
      { sprite: moteGold, x: 43, y: 16, motion: { kind: 'rise', amp: 5, periodMs: 2700, phase: 0.6 } },
      { sprite: moteMint, x: 42, y: 40, motion: { kind: 'rise', amp: 4, periodMs: 2000, phase: 0.35 } },
    ],
  };
}

export const ge1Finish: SceneArt = geKeepsake(
  'ge1-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a signpost with one arrow pointing left and one pointing right, with small sparkles around it.',
  geEmblemFork,
);
