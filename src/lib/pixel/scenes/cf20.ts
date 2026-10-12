/**
 * Corporate Finance lesson 20, Financial Regulation & Compliance: the rules, and proof they are
 * kept.
 *
 * Opener: the stress test. A steel hydraulic press stands in the hall with a model bank on its bed,
 * and the ram bears down on the bank's roof again and again while the gauge on the frame holds in
 * the green: can it take a crisis? A regulator in teal stands at the press with a clipboard,
 * ticking off the checks, and the CFO waits on the other side under the compliance shield. The
 * white bank between the press's dark jaws is the brightest surface. Only small layers move: the
 * ram, the ticks going down the clipboard, the green beacon on the press, the shield lighting.
 *
 * Keepsake: a blue shield with a white tick.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCfo, cfCompose, cfHall, cfPlaque, cfShadowShort } from './cf-kit';
import { cfExec, cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** The press, in scene pixels: its crown, its two columns, its bed, and the bank's roof row. */
const PRESS = { x: 18, w: 38, crownY: 4, crownH: 6, bedY: 44, bedH: 7, colW: 4, roof: 31 } as const;

/** A steel slab lit along its top and left, shadowed along its right and bottom. */
function steel(id: string, w: number, h: number): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'cf20'],
    rows: Array.from({ length: h }, (_, j) =>
      Array.from({ length: w }, (_, i) => {
        if (j === h - 1 || i === w - 1) return 'D';
        if (j === 0 || i === 0) return 'x';
        return 'X';
      }).join(''),
    ),
  };
}

const crown = steel('cf20-crown', PRESS.w, PRESS.crownH);
const column = steel('cf20-column', PRESS.colW, PRESS.bedY - PRESS.crownY - PRESS.crownH);

/** The bed, its front painted with hazard stripes between two steel bands. */
const bed: PixelSprite = {
  id: 'cf20-bed',
  name: 'cf20-bed',
  tags: ['scene', 'cf20'],
  blurb: 'The press bed with hazard stripes.',
  rows: Array.from({ length: PRESS.bedH }, (_, j) =>
    Array.from({ length: PRESS.w }, (_, i) => {
      if (j === 0) return 'x';
      if (j === PRESS.bedH - 1 || i === PRESS.w - 1) return 'D';
      if (j >= 2 && j <= 4) return (i + j) % 6 < 3 ? 'G' : 'K';
      return i === 0 ? 'x' : 'X';
    }).join(''),
  ),
};

/** The cylinder the ram comes out of, under the crown. */
const cylinder: PixelSprite = {
  id: 'cf20-cylinder',
  name: 'cf20-cylinder',
  tags: ['scene', 'cf20'],
  blurb: 'The press cylinder.',
  rows: ['xwwxxxxxxXXD', 'xwxxxxxxxXXD', 'xwxxxxxxxXXD', 'xwxxxxxxxXXD', 'DxxxxxxxxXDD', '.DDDDDDDDDD.'],
};

/** The model bank on the bed: a flat cornice, four white columns, two steps. */
const bank: PixelSprite = {
  id: 'cf20-bank',
  name: 'cf20-bank',
  tags: ['scene', 'cf20'],
  blurb: 'A white model bank with blue columns.',
  rows: [
    'wwwwwwwwwwwwwwwwwx',
    'BBBBBBBBBBBBBBBBBb',
    '.bbbbbbbbbbbbbbbb.',
    '.bwBbbwBbbwBbbwBb.',
    '.bwBbbwBbbwBbbwBb.',
    '.bwBbbwBbbwBbbwBb.',
    '.bwBbbwBbbwBbbwBb.',
    '.bwBbbwBbbwBbbwBb.',
    '.bwBbbwBbbwBbbwBb.',
    '.BBBBBBBBBBBBBBBb.',
    'wwwwwwwwwwwwwwwwwx',
    'BBBBBBBBBBBBBBBBBb',
    'bbbbbbbbbbbbbbbbbb',
  ],
};

/** A pressure gauge bolted to the right column, its needle resting in the green. */
const gauge: PixelSprite = {
  id: 'cf20-gauge',
  name: 'cf20-gauge',
  tags: ['scene', 'cf20'],
  blurb: 'A round pressure gauge reading in the green.',
  rows: [
    '.DDDDD.',
    'DNNwRRD',
    'DNwwwRD',
    'DwKwwwD',
    'DwwKwwD',
    'DwwwwwD',
    '.DDDDD.',
  ],
};

/** The beacon's housing on the crown; its green lens is a layer. */
const beacon: PixelSprite = { id: 'cf20-beacon', name: 'cf20-beacon', tags: ['scene', 'cf20'], rows: ['.nnn.', 'DDDDD'] };

/** Compliance as a sign: a blue shield with a white tick. */
const signShield: PixelSprite = {
  id: 'cf20-sign-shield',
  name: 'cf20-sign-shield',
  tags: ['scene', 'cf20', 'sign'],
  blurb: 'A blue shield with a white tick.',
  rows: [
    '.BBBBB.',
    'BbbbbWB',
    'BbbbWbB',
    'BWbWbbB',
    'BbWbbbB',
    '.BbbbB.',
    '..BBB..',
  ],
};
const signShieldDim = cfRecolor(signShield, 'cf20-sign-shield-dim', { B: 'b', b: 'C', W: 'x' });

/** The regulator: the other chief recoloured, fair-haired, in a teal suit. */
const regulator = cfRecolor(cfExec, 'cf20-regulator', { x: 'G', B: 'T', b: 't' }, 'A fair-haired regulator in a teal suit with one arm held out.');

/** The clipboard in the regulator's hand: four lines waiting for their ticks. */
const clipboard: PixelSprite = {
  id: 'cf20-clipboard',
  name: 'cf20-clipboard',
  tags: ['scene', 'cf20'],
  blurb: 'A walnut clipboard with a checklist.',
  palette: CF_PALETTE,
  rows: [
    '..xxx..',
    'AAxDxAA',
    'AwwwwwA',
    'AwXXwwa',
    'AwwwwwA',
    'AwXXwwa',
    'AwwwwwA',
    'AwXXwwa',
    'AwwwwwA',
    'aaaaaaa',
  ],
};

const base = cfCompose('cf20-opener-base', cfHall, [
  [cfPlaque, 4, 7],
  [signShieldDim, 6, 9],
  [crown, PRESS.x, PRESS.crownY],
  [beacon, 34, PRESS.crownY - 2],
  [column, PRESS.x + 2, PRESS.crownY + PRESS.crownH],
  [column, PRESS.x + PRESS.w - PRESS.colW - 2, PRESS.crownY + PRESS.crownH],
  [cylinder, 31, PRESS.crownY + PRESS.crownH],
  [gauge, PRESS.x + PRESS.w - 2, 18],
  [bank, 28, PRESS.roof],
  [bed, PRESS.x, PRESS.bedY],
  [cfShadowShort, 5, 57],
  [cfCfo, 2, 31],
  [cfShadowShort, 66, 56],
  [regulator, 60, 30],
  [clipboard, 55, 39],
], 'The still testing room: the shield plaque, the press with its gauge, the model bank on the bed, the CFO, the regulator and her clipboard.');

/**
 * The ram: a polished rod and the platen on its end, resting on the bank's roof. It lifts and comes
 * down again on a bob, so under Reduce Motion it rests where it presses.
 */
const ram: PixelSprite = {
  id: 'cf20-opener-ram',
  name: 'cf20-opener-ram',
  tags: ['scene', 'cf20'],
  blurb: 'The press ram and its platen.',
  rows: [
    ...Array.from({ length: 11 }, () => '........wxXD........'),
    'xxxxxxxxxxxxxxxxxxxD',
    'XXXXXXXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDDDDDDD',
  ],
};

/** A tick, two by two, going down beside each line of the checklist in turn. Its still has all four. */
function ticksAt(count: number): string[] {
  const rows = Array.from({ length: 7 }, () => '..');
  for (let k = 0; k < count; k += 1) {
    rows[2 * k] = '.N';
    rows[2 * k + 1] = 'N.';
  }
  return rows;
}

const ticks: PixelSprite = {
  id: 'cf20-opener-ticks',
  name: 'cf20-opener-ticks',
  tags: ['scene', 'cf20'],
  blurb: 'Ticks going down the checklist.',
  rows: ticksAt(3),
  frames: [ticksAt(0), ticksAt(1), ticksAt(2), ticksAt(3), ticksAt(3)],
  frameMs: 700,
};

const lens: PixelSprite = { id: 'cf20-opener-lens', name: 'cf20-opener-lens', tags: ['scene', 'cf20'], rows: ['NmN'] };

export const cf20Opener: SceneArt = {
  id: 'cf20-opener',
  label: 'In a testing room a steel press bears down on a model bank to see if it holds, while a regulator with a clipboard ticks off the checks and the finance chief waits under a shield sign.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ram, x: 27, y: PRESS.roof - 14, motion: { kind: 'bob', amp: 3, periodMs: 1800 } },
    { sprite: ticks, x: 59, y: 41 },
    { sprite: lens, x: 35, y: PRESS.crownY - 2, motion: { kind: 'twinkle', periodMs: 1600, min: 0.3 } },
    { sprite: signShield, x: 6, y: 9, motion: { kind: 'twinkle', periodMs: 3200, min: 0.4 } },
  ],
};

/** Lesson 20's emblem: a blue shield in a gold rim with a bold white tick. */
const emblemShield: PixelSprite = {
  id: 'cf20-emblem-shield',
  name: 'cf20-emblem-shield',
  tags: [],
  blurb: 'A blue shield in a gold rim with a white tick.',
  rows: [
    '.OOOOOOOOOOOOOO.',
    'OyyyyyyyyyyyyyGO',
    'OyBBBBBBBBBBBbGO',
    'OyBBBBBBBBBBWWgO',
    'OyBBBBBBBBBWWbgO',
    'OyBBBBBBBBWWbbgO',
    'OyBWWBBBBWWbbbgO',
    'OyBWWWBBWWbbbbgO',
    '.OyBWWWWWbbbbgO.',
    '.OyBBWWWbbbbbgO.',
    '..OyBBWbbbbbgO..',
    '..OGyBbbbbbgGO..',
    '...OGybbbbgGO...',
    '....OGGbbgGO....',
    '.....OOGGOO.....',
    '.......OO.......',
  ],
};

export const cf20Finish = cfKeepsake(
  'cf20-finish',
  'A crystal award on a gold stand with a blue shield and a white tick inside, and small sparkles around it.',
  emblemShield,
);

export const art: LessonArtSet = { opener: cf20Opener, backdrop: cfBackdrop, finish: cf20Finish };
