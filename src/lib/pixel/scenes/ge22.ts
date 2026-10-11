/**
 * Global Economics lesson 22: behavioural economics in policy, in the study at dusk.
 *
 * The student holds up one coin and cannot decide: the thought bubble flips between an ice cream now
 * and the piggy bank for later, the present bias in every one of us. On the desk the choice has
 * already been made for them, kindly: the laptop shows saving switched ON by default, and a coin waits
 * over the piggy bank's slot. A nudge takes no choice away; it changes what happens if you do nothing.
 * Only small layers move: the bubble, the coin's glint, the switch, the coin over the slot and the
 * stars in the window.
 *
 * The keepsake's emblem is a brain with the spark of a second thought.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, GE_STUDENT_HOLD, geBubbleChoice, geCoinSmall, geCompose, geLater, geStar, geStarBig, geStudent } from './ge-kit';
import { geGroundStudy } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** For the thought bubble: an ice cream, the treat now. */
const glyphIceCream: PixelSprite = {
  id: 'ge22-glyph-ice-cream',
  name: 'glyph ice cream',
  tags: ['ge22', 'glyph'],
  blurb: 'A small mark: a mint ice cream in a cone with a cherry.',
  palette: GE_PALETTE,
  rows: [
    '...r...',
    '..NNN..',
    '.NmNNn.',
    '.NNNNn.',
    '.OGGGO.',
    '..OGO..',
    '...O...',
  ],
};

/** For the thought bubble: a piggy bank with a coin going in, the saving for later. */
const glyphPiggy: PixelSprite = {
  id: 'ge22-glyph-piggy',
  name: 'glyph piggy bank',
  tags: ['ge22', 'glyph'],
  blurb: 'A small mark: a pink piggy bank with a gold coin dropping into it.',
  palette: GE_PALETTE,
  rows: [
    '..OyO..',
    '.ffKFf.',
    'fFFFFKF',
    'fFFFFFs',
    '.fFFFf.',
    '.f...f.',
    '.......',
  ],
};

/** On the desk: the laptop, a coin on its screen above where the switch goes, and a pink piggy bank. */
const desk: PixelSprite = {
  id: 'ge22-opener-desk',
  name: 'laptop and piggy bank',
  tags: ['ge22', 'prop'],
  blurb: 'An open laptop with a gold coin on its screen and a big pink piggy bank.',
  palette: GE_PALETTE,
  rows: [
    '..DDDDDDDDDDDDDD..................',
    '..DhhhhhhhhhhhhD..................',
    '..DhhhOOOhhhhhhD..................',
    '..DhhOyGgOhhhhhD..................',
    '..DhhOGOgOhhhhhD.........ffff.....',
    '..DhhhOOOhhhhhhD........fFFFFFf...',
    '..DhhhhhhhhhhhhD.......fFFKKFFFff.',
    '..DhhhhhhhhhhhhD......fFFFFFFFKFFf',
    '..DhhhhhhhhhhhhD......fFFFFFFFFFFs',
    '..DhhhhhhhhhhhhD......fFFFFFFFFFFs',
    '..DDDDDDDDDDDDDD.......fFFFFFFFFf.',
    '.xxxxxxxxxxxxxxxX.......ff...ff...',
    'DDDDDDDDDDDDDDDDDD......II...II...',
  ],
};

/** The laptop's switch, 8x3: green, knob to the right. ON. */
const toggle: PixelSprite = {
  id: 'ge22-opener-switch',
  name: 'switch on',
  tags: ['ge22'],
  blurb: 'A green switch turned on, its white knob to the right.',
  palette: GE_PALETTE,
  rows: [
    '.NNNNzz.',
    'NNNNzzzz',
    '.NNNNzz.',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** Where the student stands, on the floor in front of the desk. The coin is placed from it. */
const STUDENT = { x: 6, y: 33 };
/** The switch sits on the laptop's screen under the coin; the waiting coin hangs over the piggy's slot. */
const SWITCH = { x: 46, y: 38 };
const SLOT_COIN = { x: 65, y: 30 };

const base = geCompose('ge22-opener-base', geGroundStudy, [
  { sprite: desk, x: 41, y: 32 },
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

/** Ice cream now, then the piggy bank: the bubble's dots trail left, down to the student's head. */
const bubble = geBubbleChoice('ge22-opener-bubble', glyphIceCream, glyphPiggy, 'left', 1300);
const coinLater = geLater(geCoinSmall, 'ge22-opener-coin-later', 2, 340);

export const ge22Opener: SceneArt = {
  id: 'ge22-opener',
  label: 'In a study at dusk, a student holds up a coin while a thought bubble flips between an ice cream now and a piggy bank for later, and on the desk a laptop shows saving already switched on.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: bubble, x: 20, y: 12, motion: { kind: 'bob', amp: 1, periodMs: 3000 } },
    { sprite: geCoinSmall, x: STUDENT.x + GE_STUDENT_HOLD.x, y: STUDENT.y + GE_STUDENT_HOLD.y },
    { sprite: toggle, x: SWITCH.x, y: SWITCH.y, motion: { kind: 'twinkle', periodMs: 1800, min: 0.55 } },
    { sprite: coinLater, x: SLOT_COIN.x, y: SLOT_COIN.y, motion: { kind: 'bob', amp: 1, periodMs: 1400 } },
    { sprite: geStarBig, x: 62, y: 6, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 47, y: 7, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 53, y: 9, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 70, y: 8, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Behavioural economics: a brain, with the spark of a second thought flashing over it. */
const emblemBrain: PixelSprite = {
  id: 'ge22-emblem-brain',
  name: 'emblem brain',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A pink brain with a gold spark of a second thought flashing over it.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '................',
    '................',
    '....IIII.III....',
    '..IIFFFFIFFFII..',
    '.IFsFFfFFFFFFFI.',
    '.IsFFfFFFfFFFfI.',
    'IFFFFfFFFfFFFFfI',
    'IFFFfFFFFFfFFFfI',
    'IFFFFFFfFFfFFffI',
    '.IFFFFFfFFFFffI.',
    '..IfffIIfffffI..',
    '...IIII.IIffI...',
    '.........IfI....',
    '.........IfI....',
    '..........I.....',
  ],
  frames: [
    [
      '................',
      '................',
      '................',
      '....IIII.III....',
      '..IIFFFFIFFFII..',
      '.IFsFFfFFFFFFFI.',
      '.IsFFfFFFfFFFfI.',
      'IFFFFfFFFfFFFFfI',
      'IFFFfFFFFFfFFFfI',
      'IFFFFFFfFFfFFffI',
      '.IFFFFFfFFFFffI.',
      '..IfffIIfffffI..',
      '...IIII.IIffI...',
      '.........IfI....',
      '.........IfI....',
      '..........I.....',
    ],
    [
      '............y...',
      '...........yGy..',
      '............y...',
      '....IIII.III....',
      '..IIFFFFIFFFII..',
      '.IFsFFfFFFFFFFI.',
      '.IsFFfFFFfFFFfI.',
      'IFFFFfFFFfFFFFfI',
      'IFFFfFFFFFfFFFfI',
      'IFFFFFFfFFfFFffI',
      '.IFFFFFfFFFFffI.',
      '..IfffIIfffffI..',
      '...IIII.IIffI...',
      '.........IfI....',
      '.........IfI....',
      '..........I.....',
    ],
    [
      '................',
      '................',
      '................',
      '....IIII.III....',
      '..IIFFFFIFFFII..',
      '.IFsFFfFFFFFFFI.',
      '.IsFFfFFFfFFFfI.',
      'IFFFFfFFFfFFFFfI',
      'IFFFfFFFFFfFFFfI',
      'IFFFFFFfFFfFFffI',
      '.IFFFFFfFFFFffI.',
      '..IfffIIfffffI..',
      '...IIII.IIffI...',
      '.........IfI....',
      '.........IfI....',
      '..........I.....',
    ],
    [
      '................',
      '................',
      '................',
      '....IIII.III....',
      '..IIFFFFIFFFII..',
      '.IFsFFfFFFFFFFI.',
      '.IsFFfFFFfFFFfI.',
      'IFFFFfFFFfFFFFfI',
      'IFFFfFFFFFfFFFfI',
      'IFFFFFFfFFfFFffI',
      '.IFFFFFfFFFFffI.',
      '..IfffIIfffffI..',
      '...IIII.IIffI...',
      '.........IfI....',
      '.........IfI....',
      '..........I.....',
    ],
  ],
  frameMs: 600,
};

export const ge22Finish: SceneArt = geKeepsake(
  'ge22-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a pink brain with a gold spark of a second thought flashing over it, with small sparkles around it.',
  emblemBrain,
);

export const art: LessonArtSet = { opener: ge22Opener, backdrop: geBackdrop, finish: ge22Finish };
