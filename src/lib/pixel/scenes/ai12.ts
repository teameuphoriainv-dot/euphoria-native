/**
 * Alternative Investments lesson 12: distressed debt.
 *
 * The opener is the vault gallery (ai-kit.ts) with the lesson's bargain hung on the wall: a framed bond
 * certificate cracked from top to bottom, the paper of a company in trouble, with a red sale tag on
 * the ledge under it marked 35, the cents on the dollar a distressed buyer pays. A small chart on
 * the left shows recovery by seniority, the top of the stack paid first, and the collector checks
 * the crack through the magnifier for what the bond will recover. Only small layers move: a gold
 * glint runs down the crack, the price flashes, the collector blinks, the lens glints and motes
 * rise. The keepsake is a new emblem: a bond certificate broken in two.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  AI_COLLECTOR_EYE,
  AI_COLLECTOR_GLARE,
  aiCollector,
  aiCollectorBlink,
  aiCompose,
  aiGallery,
  aiKeepsake,
  aiLensGlare,
  aiMoteGold,
  aiPictureLight,
  aiShadow,
} from './ai-kit';
import type { LessonArtSet, SceneArt } from './types';

const certificate: PixelSprite = {
  id: 'ai12-certificate',
  name: 'ai12-certificate',
  tags: ['scene', 'ai'],
  blurb: "A framed bond certificate, BOND across the top, a red seal, cracked from top to bottom.",
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OyGGGGGGGGGGGGGGGGGGGGGGGGGGGGgO',
    'OGwwwwwwwwwwwwwwKxwwwwwwwwwwwwgO',
    'OGwBbBbBbBbBbBbBKBbBbBbBbBbBBwgO',
    'OGwbwwwwwwwwwwwKxwwwwwwwwwwwbwgO',
    'OGwBwwwwbbwwbbbKbwwbwbbwwwwwBwgO',
    'OGwbwwwwbwbwbwbKbbwbwbwbwwwwbwgO',
    'OGwBwwwwbbwwbwbKbwbbwbwbwwwwBwgO',
    'OGwbwwwwbwbwbwbKbwwbwbwbwwwwbwgO',
    'OGwBwwwwbbwwbbbKbwwbwbbwwwwwBwgO',
    'OGwbwwwwwwwwwwKxwwwwwwwwwwwwbwgO',
    'OGwBwwwwwwwwwwKxwwwwwwwwwwwwBwgO',
    'OGwbwwXXXXwXXXXKXXXXwXXXXwwwbwgO',
    'OGwBwwwwwwwwwwKxwwwwwwrRrwwwBwgO',
    'OGwbwwXXXXwXXKXwXXXXwrRsRrwwbwgO',
    'OGwBwwwwwwwwwKxwwwwwwRssRRwwBwgO',
    'OGwbwwXXXXwXKXXwXwwwwrRRRrwwbwgO',
    'OGwBwwwwwwwwwKxwwwwwwwrRrwwwBwgO',
    'OGwbwwwwwwwwKxwwwwwwwrwwwrwwbwgO',
    'OGwBwwwwwwwwKxwwwwwwwwwwwwwwBwgO',
    'OGwbbBbBbBbKbBbBbBbBbBbBbBbBbwgO',
    'OGwwwwwwwwwKxwwwwwwwwwwwwwwwwwgO',
    'OGgggggggggggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** The crack's pixels, top to bottom, from the glint's corner (the certificate's column 11, row 2). */
const CRACK = [[5, 0], [5, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [3, 8], [3, 9], [4, 10], [3, 11], [2, 12], [2, 13], [1, 14], [2, 15], [1, 16], [1, 17], [0, 18], [0, 19]] as const;
const crackStep = new Map(CRACK.map(([x, y], i) => [y * 6 + x, i]));

/**
 * One frame of the glint: a bright head on the crack's pixel `head` and a dimmer tail on the next.
 * Built rather than drawn, as aiCaseSheen is: ten hand-copied 6x20 frames are where a pixel slips.
 */
const glintAt = (head: number) =>
  Array.from({ length: 20 }, (_, y) =>
    Array.from({ length: 6 }, (_, x) => {
      const step = crackStep.get(y * 6 + x);
      return step === head ? 'y' : step === head + 1 ? 'G' : '.';
    }).join(''),
  );

/** A gold glint running down the crack, two pixels a frame, then a rest. The still is the bare crack. */
const crackGlint: PixelSprite = {
  id: 'ai12-crack-glint',
  name: 'ai12-crack-glint',
  tags: ['scene', 'ai'],
  blurb: "A glint of gold walking down the certificate's crack.",
  rows: glintAt(-2),
  frames: [
    ...Array.from({ length: CRACK.length / 2 }, (_, k) => glintAt(k * 2)),
    ...Array.from({ length: 4 }, () => glintAt(-2)),
  ],
  frameMs: 170,
};

/** The sale tag on the ledge: 35, the price in cents on the dollar. */
const tag: PixelSprite = {
  id: 'ai12-tag',
  name: 'ai12-tag',
  tags: ['scene', 'ai'],
  blurb: "A red price tag reading 35, propped on the ledge.",
  rows: [
    '..rrrrrrrrrr',
    '.rRRwwwRwwwr',
    'rRKRRRwRwRRr',
    'rRRRRwwRwwwr',
    'rRRRRRwRRRwr',
    '.rRRwwwRwwwr',
    '..rrrrrrrrrr',
  ],
};

/** The price on the tag, flashing over its still. */
const price: PixelSprite = {
  id: 'ai12-price',
  name: 'ai12-price',
  tags: [],
  rows: [
    'WWW.WWW',
    '..W.W..',
    '.WW.WWW',
    '..W...W',
    'WWW.WWW',
  ],
};

/** Recovery by seniority: the senior bars tall and green, falling through gold to a stub of red equity. */
const seniority: PixelSprite = {
  id: 'ai12-seniority',
  name: 'ai12-seniority',
  tags: ['scene', 'ai'],
  blurb: "A framed bar chart stepping down: senior debt recovers most, equity least.",
  rows: [
    'OOOOOOOOOOOOOOOOO',
    'OyGGGGGGGGGGGGGgO',
    'OGkkkkkkkkkkkkkgO',
    'OGkNNkkkkkkkkkkgO',
    'OGkNNkkkkkkkkkkgO',
    'OGkNNkmmkkkkkkkgO',
    'OGkNNkmmkkkkkkkgO',
    'OGkNNkmmkGGkkkkgO',
    'OGkNNkmmkGGkkkkgO',
    'OGkNNkmmkGGkRRkgO',
    'OGkNNkmmkGGkRRkgO',
    'OGggggggggggggggO',
    'OOOOOOOOOOOOOOOOO',
  ],
};

const brokenBond: PixelSprite = {
  id: 'ai12-broken-bond',
  name: 'ai12-broken-bond',
  tags: ['scene', 'ai'],
  blurb: "Lesson 12: a bond certificate broken in two along a jagged crack, the right half dropped.",
  rows: [
    '................',
    'DDDDDDDD........',
    'Dwwwwwwx.DDDDDDD',
    'DwBBbBb..wwwwwwD',
    'Dwbwwwx.bBbBbBwD',
    'DwBwXXXX.wwwwbwD',
    'Dwbwwwwx.XXXwBwD',
    'DwBwXXX..wwwwbwD',
    'Dwbwwx..XrRrwBwD',
    'DwBwwx.wwRsRwbwD',
    'Dwbwwwx.wrRrwBwD',
    'DwBBbBb.wwwwwbwD',
    'Dwwwwx..bBbBbBwD',
    'DDDDDD.wwwwwwwwD',
    '.......DDDDDDDDD',
    '................',
  ],
};

const CERT = [38, 11] as const;
const TAG = [62, 36] as const;
const COLLECTOR = [14, 30] as const;

const base = aiCompose('ai12-opener-base', aiGallery.rows, [
  [seniority, 8, 10],
  [certificate, CERT[0], CERT[1]],
  [aiPictureLight, CERT[0] + 13, CERT[1] - 3],
  [tag, TAG[0], TAG[1]],
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollector, COLLECTOR[0], COLLECTOR[1]],
]);

export const ai12Opener: SceneArt = {
  id: 'ai12-opener',
  label: 'A collector studies a framed bond certificate cracked from top to bottom through a magnifier, a red price tag reading 35 on the ledge below and a chart of recovery by seniority on the wall.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: crackGlint, x: CERT[0] + 11, y: CERT[1] + 2 },
    { sprite: price, x: TAG[0] + 4, y: TAG[1] + 1, motion: { kind: 'twinkle', periodMs: 1500, min: 0.25 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiLensGlare, x: COLLECTOR[0] + AI_COLLECTOR_GLARE[0], y: COLLECTOR[1] + AI_COLLECTOR_GLARE[1], motion: { kind: 'twinkle', periodMs: 1500, min: 0.3 } },
    { sprite: aiMoteGold, x: 33, y: 24, motion: { kind: 'rise', amp: 5, periodMs: 2700, phase: 0.2 } },
    { sprite: aiMoteGold, x: 74, y: 22, motion: { kind: 'rise', amp: 5, periodMs: 3200, phase: 0.65 } },
  ],
};

export const ai12Finish = aiKeepsake(
  'ai12-finish',
  'A bond certificate broken in two along a jagged crack floating in a glass display case on a marble plinth, with sparkles around it.',
  brokenBond,
);

export const art: LessonArtSet = { opener: ai12Opener, backdrop: aiBackdrop, finish: ai12Finish };
