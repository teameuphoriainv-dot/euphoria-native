/**
 * Quantitative Analysis lesson 15, Credit Derivatives & CDS Pricing: 2008 in the bank's vault.
 *
 * Beside the round vault door and the wall of safe-deposit boxes, a tall screen slices a CDO into
 * its tranches: AAA senior on top (gold), BBB mezzanine (orchid), the equity tranche at the bottom
 * (teal). Defaults fill it from the bottom up in red, the names of the tranches they flood kept in
 * white: the equity is wiped out first, then the losses climb into the mezzanine. A
 * small screen over the boxes shows the CDS spread, flat for years and then spiking in the crisis.
 * The quant watches with hands on hips. Only small layers move: the losses rise, the alarm beacon
 * flashes, the spread's peak glints, a keyhole catches the light.
 * Keepsake: a shield, credit protection.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { qaCompose, qaKeepsake, qaPath, qaRoom, qaScreen, qaText } from './qa-kit';
import { qaQuantHandsOnHips } from './qa-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the vault door ────────────────────────────────────────────────────────────────────────────── */

const DOOR = { x: 14, y: 21, radius: 12 } as const;

/**
 * The round vault door, face on: a dark steel edge, a lit rim (bright to the upper left), a groove,
 * the face with a ring of bolt heads, and a brass hub with three spokes.
 */
function vaultDoor(): PixelSprite {
  const size = DOOR.radius * 2 + 1;
  const rows = [...Array(size)].map((_, y) => [...Array(size)].map((_, x) => {
    const dx = x - DOOR.radius;
    const dy = y - DOOR.radius;
    const d = Math.sqrt(dx * dx + dy * dy);
    const lit = dx + dy < 0;
    if (d > DOOR.radius + 0.4) return '.';
    if (d > DOOR.radius - 0.8) return 'D';
    if (d > DOOR.radius - 2.6) return lit ? 'x' : 'X';
    if (d > DOOR.radius - 3.6) return 'D';
    // Eight bolt heads round the face.
    const angle = Math.atan2(dy, dx);
    const bolt = Math.abs(d - (DOOR.radius - 5.2)) < 0.9 && Math.abs(((angle / (Math.PI / 4)) % 1 + 1) % 1 - 0.5) > 0.38;
    if (bolt) return 'D';
    if (d < 2.6) return d < 1.2 ? 'G' : 'O';
    // Three spokes from the hub, at 90, 210 and 330 degrees.
    const spoke = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6].some((a) => {
      const along = dx * Math.cos(a) + dy * Math.sin(a);
      const across = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a));
      return along > 0 && along < 7.5 && across < 0.9;
    });
    if (spoke) return 'O';
    return lit && d < DOOR.radius - 5 ? 'x' : 'X';
  }).join(''));
  return { id: 'qa15-vault-door', name: 'qa15-vault-door', tags: ['scene', 'qa15'], rows };
}

/** Gold bars stacked on the floor by the door. */
const goldBars: PixelSprite = {
  id: 'qa15-gold-bars',
  name: 'qa15-gold-bars',
  tags: ['scene', 'qa15'],
  rows: [
    '......yGGg......',
    '......OggO......',
    '...yGGg.yGGg....',
    '...OggO.OggO....',
    'yGGg.yGGg.yGGg..',
    'OggO.OggO.OggO..',
  ],
};

/** The alarm beacon over the door, unlit; its flash is a layer. */
const beacon: PixelSprite = { id: 'qa15-beacon', name: 'qa15-beacon', tags: ['scene', 'qa15'], rows: ['.rr.', 'rrrr', 'DDDD'] };
const beaconFlash: PixelSprite = { id: 'qa15-beacon-flash', name: 'qa15-beacon-flash', tags: ['scene', 'qa15'], rows: ['.RR.', 'RWWR'] };

/* ── the safe-deposit boxes ────────────────────────────────────────────────────────────────────── */

const BOXES = { x: 57, y: 19, width: 22, height: 27 } as const;
const boxes: PixelSprite = {
  id: 'qa15-boxes',
  name: 'qa15-boxes',
  tags: ['scene', 'qa15'],
  blurb: 'A wall of safe-deposit boxes, each with its keyhole.',
  rows: Array.from({ length: BOXES.height }, (_, y) => [...Array(BOXES.width)].map((_, x) => {
    if (y % 5 === 0 || x % 7 === 0) return 'D';
    return x % 7 === 5 && y % 5 === 2 ? 'O' : 'X';
  }).join('')),
};

/* ── the tranches ──────────────────────────────────────────────────────────────────────────────── */

const SCREEN = { x: 30, y: 3, width: 24, height: 25 } as const;
const STACK = { x: 34, y: 6, width: 16, height: 19 } as const;
/** Each tranche: its first row in the stack, its rows, and its lit, body and shade tones. */
const TRANCHES = [[0, 7, 'y', 'G', 'g'], [7, 6, 'q', 'P', 'p'], [13, 6, 'T', 'T', 't']] as const;

function tranche(id: string, height: number, lit: string, body: string, shade: string): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'qa15'],
    rows: Array.from({ length: height }, (_, r) => (r === 0 ? lit.repeat(STACK.width - 1) + shade : lit + body.repeat(STACK.width - 2) + shade)),
  };
}

/** The tranches' names, in the stack's pixels: [text, x, y, ink]. */
const LABELS = [['AAA', 3, 1, 'O'], ['BBB', 3, 8, 'E'], ['EQ', 5, 14, 't']] as const;
/** Every pixel of those names, so the rising losses can keep them readable (white) as they cover them. */
const LABEL_INK = new Set(LABELS.flatMap(([text, x, y]) => qaText('qa15-label-ink', text, '#').rows.flatMap((row, j) =>
  [...row].flatMap((ch, i) => (ch === '#' ? [`${String(x + i)},${String(y + j)}`] : [])))));

/**
 * The losses, `rows` deep from the bottom of the stack: red hatching under a pale water line, with the
 * names of the tranches they cover redrawn in white on top. A fill rising through the stack over the
 * tranches it has eaten, not a fourth band.
 */
function losses(rows: number): string[] {
  return Array.from({ length: STACK.height }, (_, y) => [...Array(STACK.width)].map((_, x) => {
    if (y < STACK.height - rows) return '.';
    if (LABEL_INK.has(`${String(x)},${String(y)}`)) return 'w';
    if (y === STACK.height - rows) return 's';
    return (x + y) % 3 === 0 ? 'r' : 'R';
  }).join(''));
}

/** At rest the losses have taken the equity and most of the mezzanine; the loop shows them rising there. */
const lossRise: PixelSprite = {
  id: 'qa15-losses',
  name: 'qa15-losses',
  tags: ['scene', 'qa15'],
  blurb: 'Defaults filling the tranches from the bottom: the equity first, then the mezzanine.',
  rows: losses(11),
  frames: [0, 2, 4, 6, 8, 10, 11, 11, 0].map(losses),
  frameMs: 450,
};

/* ── the CDS spread ────────────────────────────────────────────────────────────────────────────── */

const CDS = { x: 57, y: 2, width: 22, height: 15 } as const;
const PEAK = [74, 4] as const;
const spread = qaPath('qa15-spread', 80, 60, [[60, 13], [66, 13], [69, 12], [71, 11], [73, 5], PEAK, [75, 7], [76, 9]], 'R');

const QUANT_AT = { x: 33, y: 28 } as const;

const base = qaCompose('qa15-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: vaultDoor(), x: DOOR.x - DOOR.radius, y: DOOR.y - DOOR.radius },
  { sprite: beacon, x: DOOR.x - 2, y: 3 },
  { sprite: goldBars, x: 4, y: 41 },
  { sprite: boxes, x: BOXES.x, y: BOXES.y },
  { sprite: qaScreen('qa15-cds-screen', CDS.width, CDS.height, { surface: 'K' }), x: CDS.x, y: CDS.y },
  { sprite: qaText('qa15-cds', 'CDS', 'x'), x: 60, y: 5 },
  { sprite: spread, x: 0, y: 0 },
  { sprite: qaScreen('qa15-screen', SCREEN.width, SCREEN.height, { surface: 'K' }), x: SCREEN.x, y: SCREEN.y },
  ...TRANCHES.map(([top, height, lit, body, shade], i) => ({ sprite: tranche(`qa15-tranche-${String(i)}`, height, lit, body, shade), x: STACK.x, y: STACK.y + top })),
  ...LABELS.map(([text, x, y, ink]) => ({ sprite: qaText(`qa15-label-${text}`, text, ink), x: STACK.x + x, y: STACK.y + y })),
  { sprite: qaQuantHandsOnHips, x: QUANT_AT.x, y: QUANT_AT.y },
]);

export const qa15Opener: SceneArt = {
  id: 'qa15-opener',
  label: 'In a bank vault beside a round vault door and safe-deposit boxes, a quant with hands on hips watches losses rise in red through the tranches of a CDO, wiping out the equity first, while a credit default swap spread spikes on a small screen.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lossRise, x: STACK.x, y: STACK.y },
    { sprite: beaconFlash, x: DOOR.x - 2, y: 3, motion: { kind: 'twinkle', periodMs: 900, min: 0 } },
    { sprite: { id: 'qa15-peak', name: 'qa15-peak', tags: ['scene', 'qa15'], rows: ['W'] }, x: PEAK[0], y: PEAK[1], motion: { kind: 'twinkle', periodMs: 1300, min: 0.2 } },
    { sprite: { id: 'qa15-glint', name: 'qa15-glint', tags: ['scene', 'qa15'], rows: ['y'] }, x: BOXES.x + 12, y: BOXES.y + 7, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.3, min: 0 } },
  ],
};

/** Lesson 15's emblem: a shield, the protection a credit default swap buys. */
const emblemShield: PixelSprite = {
  id: 'qa15-emblem-shield',
  name: 'qa15-emblem-shield',
  tags: ['scene', 'qa15'],
  rows: [
    '............',
    '.OOOOOOOOOO.',
    '.OOOOOyOOOOy',
    '.OOOOOyOOOOy',
    '.OOOOOyOOOOy',
    '.OOOOOyOOOOy',
    '..OOOOyOOOy.',
    '..OOOOyOOOy.',
    '...OOOyOOy..',
    '....OOyOy...',
    '.....OOy....',
    '......y.....',
  ],
};

export const qa15Finish: SceneArt = qaKeepsake(
  'qa15-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a shield, with small sparkles around it.',
  emblemShield,
);

export const art: LessonArtSet = { opener: qa15Opener, backdrop: qaBackdrop, finish: qa15Finish };
