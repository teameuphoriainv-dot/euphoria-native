/**
 * Personal Finance lesson 19, Identity Theft & Financial Security: don't take the bait.
 *
 * A new set, the home office late at night, a blind half down over the window. A fishing line drops
 * from the top of the picture with an email on the hook, phishing, the biggest door the lesson's
 * fraud comes through, and it dangles over the laptop. The figure holds a shield out between them,
 * steel with a gold padlock: the freeze, the passwords, the second factor. On the wall the lesson's
 * defence checklist, all four boxes ticked; the cat sits on the desk watching the hook.
 * Moving: the hook, the code arriving on the phone, a glint on the shield, the coffee's steam, a star,
 * the cat's tail.
 */
import type { PixelSprite } from '../types';
import { pfCompose, pfKitchen, pfSparkle, pfTable } from './pf-kit';
import { pfCatSit, pfMug, pfSaverReachLeft, pfSteam, pfWindowNight } from './pf-kit-a';
import { pfStar } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** A roller blind pulled half down the window's upper pane, slatted, with a ring on its cord. */
const blind: PixelSprite = {
  id: 'pf19-blind',
  name: 'blind',
  tags: ['scene', 'pf'],
  rows: [
    'XXXXXXXXXXXXXXXXXXXXXX',
    'xxxxxxxxxxxxxxxxxxxxxx',
    'XXXXXXXXXXXXXXXXXXXXXX',
    'DDDDDDDDDDDxDDDDDDDDDD',
    '...........x..........',
    '..........xKx.........',
    '...........x..........',
  ],
};

/** A thin crescent for the pane below the blind. */
const crescent: PixelSprite = {
  id: 'pf19-crescent',
  name: 'crescent',
  tags: ['scene', 'pf'],
  rows: [
    '.ww.',
    'wx..',
    'wx..',
    '.ww.',
  ],
};

/**
 * The phisher's line from the top edge (so its sway never shows a gap) to a steel hook, an email
 * hung on the hook as bait: a white envelope with its flap, and a red alert dot on its corner.
 */
const PHISH_LINE = Array.from({ length: 3 }, () => '....x....');
const phishHook: PixelSprite = {
  id: 'pf19-phish-hook',
  name: 'phish hook',
  tags: ['scene', 'pf'],
  rows: [
    ...PHISH_LINE,
    '...xXx...',
    '....x....',
    '.x..x....',
    '.xx.x....',
    '..xxw....',
    '.xwwwwwR.',
    'xwxwwwxRR',
    'xwwxwxwwX',
    'xwwwxwwwX',
    '.XXXXXXX.',
  ],
};

/** The shield held out: a steel rim lit on its left, an orchid field, a gold padlock with its keyhole. */
const shield: PixelSprite = {
  id: 'pf19-shield',
  name: 'shield',
  tags: ['scene', 'pf'],
  rows: [
    'XXXXXXXXXXX',
    'XwwwwwwwwxX',
    'XwPPPPPPPxX',
    'XwPPyyyPPxX',
    'XwPyPPPyPxX',
    'XwPGGGGGPxX',
    'XwPGGKGGPxX',
    'XwPGgKgGPxX',
    '.XwPgggPxX.',
    '.XwPPPPPxX.',
    '..XwPPPxX..',
    '...XwPxX...',
    '....XXX....',
  ],
};

/** The laptop the hook is after: a password field of dots and a green tick for the second factor. */
const laptop: PixelSprite = {
  id: 'pf19-laptop',
  name: 'laptop',
  tags: ['scene', 'pf'],
  rows: [
    '.DDDDDDDDDDDD.',
    '.DbbbbbbbbbbD.',
    '.DbwwwwwwwwbD.',
    '.DbwKwKwKwwbD.',
    '.DbwwwwwwwwbD.',
    '.DbbbbbbbbbbD.',
    '.DbbbbbbNbbbD.',
    '.DbbNbbNbbbbD.',
    '.DbbbNNbbbbbD.',
    '.DDDDDDDDDDDD.',
    'xxxxxxxxxxxxxX',
    'XXXXXXXXXXXXXX',
  ],
};

/** The six-digit code arriving on the phone, for a twinkle (the phone's screen under it is dark). */
const phoneCode: PixelSprite = {
  id: 'pf19-phone-code',
  name: 'phone code',
  tags: ['scene', 'pf'],
  rows: [
    'www',
  ],
};

/** A phone face up, its screen showing the six-digit code a second factor sends. */
const phone: PixelSprite = {
  id: 'pf19-phone',
  name: 'phone',
  tags: ['scene', 'pf'],
  rows: [
    'DDDDD',
    'DbbbD',
    'DbbbD',
    'DbbbD',
    'DbbbD',
    'DDDDD',
  ],
};

/** The lesson's defence checklist pinned to the wall: four lines, four green ticks. */
const checklist: PixelSprite = {
  id: 'pf19-checklist',
  name: 'checklist',
  tags: ['scene', 'pf'],
  rows: [
    '.....R.......',
    'xwwwwrwwwwwwX',
    'xwwwwwwwwwwwX',
    'xwwwNwXXXXXwX',
    'xwNwNwwwwwwwX',
    'xwwNwwXXXwwwX',
    'xwwwwwwwwwwwX',
    'xwwwNwXXXXwwX',
    'xwNwNwwwwwwwX',
    'xwwNwwXXXXXwX',
    'xwwwwwwwwwwwX',
    'xwwwNwXXwwwwX',
    'xwNwNwwwwwwwX',
    'xwwNwwXXXXwwX',
    'xwwwwwwwwwwwX',
    'xxxxxxxxxxxxX',
  ],
};

/** Lesson 19's emblem: a padlock, a steel shackle over a gold body with its keyhole. */
const emblemPadlock: PixelSprite = {
  id: 'pf19-emblem-padlock',
  name: 'pf19-emblem-padlock',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '....wwwwx.....',
    '...wx...xX....',
    '...wx...xX....',
    '..OyyyyyyyO...',
    '..OyGGGGGgO...',
    '..OyGGKGGgO...',
    '..OyGGKGGgO...',
    '..OyGGGGGgO...',
    '..OOOOOOOOO...',
  ],
};

// Order is depth: the window and its blind, the checklist, the figure, the desk over its lower half,
// then the things on the desk, the shield last, held in front of the laptop's top edge.
const base = pfCompose('pf19-opener-base', 80, 60, pfKitchen.rows, [
  [pfWindowNight, 3, 4],
  [blind, 5, 6],
  [crescent, 18, 11],
  [checklist, 64, 7],
  [pfSaverReachLeft, 36, 12],
  [pfTable(66, 12), 7, 36],
  [pfMug, 11, 32],
  [phone, 21, 33],
  [laptop, 30, 26],
  [shield, 32, 15],
]);

export const pf19Opener: SceneArt = {
  id: 'pf19-opener',
  label: 'Late at night in a home office, a fishing hook baited with an email dangles over a laptop, and a person holds out a shield with a padlock on it between the hook and the screen, with a checklist of four ticks on the wall and the cat on the desk watching.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The hook hangs from the top edge, its bait just clear of the shield (figure at 36,12; hand at
    // column 1, row 10; the shield's top on row 15).
    { sprite: phishHook, x: 33, y: 0, motion: { kind: 'drift', amp: 2, periodMs: 3600 } },
    { sprite: pfCatSit, x: 60, y: 27 },
    { sprite: phoneCode, x: 22, y: 35, motion: { kind: 'twinkle', periodMs: 2800, min: 0.2 } },
    { sprite: pfSparkle, x: 28, y: 14, motion: { kind: 'twinkle', periodMs: 1800, min: 0.35, phase: 0.3 } },
    { sprite: pfSteam, x: 12, y: 26, motion: { kind: 'rise', amp: 3, periodMs: 2400 } },
    { sprite: pfStar, x: 9, y: 13, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: pfStar, x: 24, y: 12, motion: { kind: 'twinkle', periodMs: 3100, min: 0.2, phase: 0.5 } },
  ],
};

export const pf19Finish = pfKeepsake(
  'pf19-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a gold padlock with a steel shackle, with small sparkles around it.',
  emblemPadlock,
);

export const art: LessonArtSet = { opener: pf19Opener, backdrop: pfBackdrop, finish: pf19Finish };
