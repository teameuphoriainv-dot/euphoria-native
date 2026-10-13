/**
 * Quantitative Analysis lesson 24, Quantum Computing & the Future of Quant Finance: the quantum lab.
 *
 * From the ceiling hangs the gold chandelier of a dilution refrigerator: stage under stage of gilded
 * plates, rods and coiled coax, each colder than the one above, down to the chip at the bottom
 * where the qubits live, a hair above absolute zero. On the wall screen, one qubit on its Bloch
 * sphere: 0 at the north pole, 1 at the south, and its state arrow tipped between them, in
 * superposition, turning. The finance is on the console below it: a teal cable runs from the chip
 * across the floor to the control electronics, whose display prices an option the quant way, a fan
 * of simulated price paths, beside QAE in teal, the quantum amplitude estimation that needs far fewer
 * of them. The quant reaches up to the Bloch sphere. Only small layers move: the state arrow
 * precesses, a microwave pulse runs down the coax, the chip glows, frost glints on the cold stages,
 * the control lights blink, QAE glows.
 * Keepsake: psi, the wavefunction.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import type { QaStamp } from './qa-kit';
import {
  QA_PALETTE, QA_REACH_HAND, qaCompose, qaKeepsake, qaPath, qaQuantReaching, qaRect, qaRoom, qaScreen, qaText,
} from './qa-kit';
import { qaBridge } from './qa-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the dilution refrigerator ─────────────────────────────────────────────────────────────────── */

const CX = 22;
/** The stages from the top: [y, half width]. Each is colder than the one above. */
const STAGES: readonly (readonly [number, number])[] = [[3, 14], [11, 12], [18, 10], [24, 8], [29, 6], [33, 4]];

/** A gold plate: lit top, gilded body, a dark rim underneath. */
function plate(id: string, half: number): PixelSprite {
  const w = half * 2 + 1;
  return { id, name: id, tags: ['scene', 'qa24'], rows: ['O' + 'y'.repeat(w - 2) + 'O', 'O' + 'G'.repeat(w - 2) + 'O', 'O'.repeat(w)] };
}

/** Between two stages: two gold rods, two silver coax lines, and a blue coil between them. */
function gap(i: number): QaStamp[] {
  const [top, half] = [STAGES[i][0] + 3, STAGES[i + 1][1]];
  const height = STAGES[i + 1][0] - top;
  const stamps: QaStamp[] = [
    { sprite: qaRect(`qa24-rod-l-${String(i)}`, 1, height, 'G'), x: CX - half + 1, y: top },
    { sprite: qaRect(`qa24-rod-l-shade-${String(i)}`, 1, height, 'g'), x: CX - half + 2, y: top },
    { sprite: qaRect(`qa24-rod-r-${String(i)}`, 1, height, 'G'), x: CX + half - 2, y: top },
    { sprite: qaRect(`qa24-rod-r-shade-${String(i)}`, 1, height, 'g'), x: CX + half - 1, y: top },
  ];
  if (half > 5) {
    stamps.push(
      { sprite: qaRect(`qa24-coax-l-${String(i)}`, 1, height, 'X'), x: CX - 3, y: top },
      { sprite: qaRect(`qa24-coax-r-${String(i)}`, 1, height, 'X'), x: CX + 3, y: top },
      { sprite: qaPath(`qa24-coil-${String(i)}`, 3, height, [...Array(height)].map((_, r) => [[1, 2, 1, 0][r % 4], r] as [number, number]), 'B'), x: CX - 1, y: top },
    );
  }
  return stamps;
}

/** The chip package under the mixing chamber, where the qubits sit. */
const chip: PixelSprite = { id: 'qa24-chip', name: 'qa24-chip', tags: ['scene', 'qa24'], rows: ['...O...', '.DDDDD.', 'DDtttDD', 'DDtttDD', '.DDDDD.'] };
const CHIP_Y = STAGES[5][0] + 3;
const chipGlow: PixelSprite = { id: 'qa24-chip-glow', name: 'qa24-chip-glow', tags: ['scene', 'qa24'], rows: ['TTT', 'TTT'] };

const fridge: QaStamp[] = [
  { sprite: { id: 'qa24-mount', name: 'qa24-mount', tags: ['scene', 'qa24'], rows: ['D'.repeat(37), 'X'.repeat(37)] }, x: CX - 18, y: 0 },
  { sprite: qaRect('qa24-hanger-l', 1, 1, 'D'), x: CX - 9, y: 2 },
  { sprite: qaRect('qa24-hanger-r', 1, 1, 'D'), x: CX + 9, y: 2 },
  ...STAGES.slice(0, -1).flatMap((_, i) => gap(i)),
  ...STAGES.map(([y, half], i) => ({ sprite: plate(`qa24-plate-${String(i)}`, half), x: CX - half, y })),
  { sprite: chip, x: CX - 3, y: CHIP_Y },
];

/** A microwave pulse running down the coax to the qubits. */
const PULSE = { x: CX + 3, y: 6, height: 26 } as const;
const pulseFrame = (k: number) => [...Array(PULSE.height)].map((_, r) => (r === k * 3 ? 'W' : r === k * 3 - 1 ? 'B' : '.'));
const pulse: PixelSprite = {
  id: 'qa24-pulse',
  name: 'qa24-pulse',
  tags: ['scene', 'qa24'],
  rows: pulseFrame(0),
  frames: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(pulseFrame),
  frameMs: 160,
};

const frost: PixelSprite = { id: 'qa24-frost', name: 'qa24-frost', tags: ['scene', 'qa24'], rows: ['.B.', 'BWB', '.B.'] };

/* ── the Bloch sphere ──────────────────────────────────────────────────────────────────────────── */

const SCREEN = { x: 49, y: 3, width: 28, height: 24 } as const;
const SPHERE = { x: 63, y: 15, r: 8, tilt: 0.31 } as const;

/** The sphere's outline, its equator (dashed, seen at a slant) and the axis from 0 to 1. */
const ring = [...Array(61)].map((_, i) => {
  const t = (i / 60) * 2 * Math.PI;
  return [Math.round(SPHERE.x + SPHERE.r * Math.cos(t)), Math.round(SPHERE.y + SPHERE.r * Math.sin(t))] as [number, number];
});
const ellipse = (height: number, rx: number) => [...Array(41)].map((_, i) => {
  const t = (i / 40) * 2 * Math.PI;
  return [Math.round(SPHERE.x + rx * Math.cos(t)), Math.round(SPHERE.y + height + rx * SPHERE.tilt * Math.sin(t))] as [number, number];
});

/** The state's cone: the arrow's tip at 45 degrees from the north pole, going round. */
const CONE = { lift: -SPHERE.r * Math.SQRT1_2, rx: SPHERE.r * Math.SQRT1_2 } as const;
const ARROW_BOX = { x: SPHERE.x - 7, y: SPHERE.y - 9, width: 15, height: 10 } as const;
function arrowFrame(deg: number): string[] {
  const t = (deg * Math.PI) / 180;
  const tip: [number, number] = [
    Math.round(SPHERE.x + CONE.rx * Math.cos(t)) - ARROW_BOX.x,
    Math.round(SPHERE.y + CONE.lift + CONE.rx * SPHERE.tilt * Math.sin(t)) - ARROW_BOX.y,
  ];
  const cells = qaPath('qa24-arrow-line', ARROW_BOX.width, ARROW_BOX.height, [[SPHERE.x - ARROW_BOX.x, SPHERE.y - ARROW_BOX.y], tip], 'y').rows.map((row) => row.split(''));
  cells[tip[1]][tip[0]] = 'W';
  return cells.map((row) => row.join(''));
}
const stateArrow: PixelSprite = {
  id: 'qa24-state',
  name: 'qa24-state',
  tags: ['scene', 'qa24'],
  blurb: "The qubit's state arrow, tipped between 0 and 1, precessing round the axis.",
  rows: arrowFrame(0),
  frames: [0, 60, 120, 180, 240, 300].map(arrowFrame),
  frameMs: 330,
};

const sphere: PixelSprite[] = [
  qaPath('qa24-cone', 80, 60, ellipse(Math.round(CONE.lift), Math.round(CONE.rx)), 'D', [1, 1]),
  qaPath('qa24-equator', 80, 60, ellipse(0, SPHERE.r), 'X', [1, 1]),
  qaPath('qa24-axis', 80, 60, [[SPHERE.x, SPHERE.y - SPHERE.r], [SPHERE.x, SPHERE.y + SPHERE.r]], 'X', [1, 1]),
  qaPath('qa24-ring', 80, 60, ring, 'x'),
];

/* ── the control electronics ───────────────────────────────────────────────────────────────────── */

const CABINET = { x: 54, y: 28, width: 24 } as const;
/** The control electronics, with the pricing display in their top half (its surface 18x7 at (3, 3)). */
const cabinet: PixelSprite = {
  id: 'qa24-cabinet',
  name: 'qa24-cabinet',
  tags: ['scene', 'qa24'],
  palette: QA_PALETTE,
  rows: [
    'D'.repeat(CABINET.width),
    'D' + 'x'.repeat(CABINET.width - 3) + 'XD',
    'DxD' + 'D'.repeat(CABINET.width - 6) + 'DXD',
    ...Array.from({ length: 7 }, () => 'DxD' + 'K'.repeat(CABINET.width - 6) + 'DXD'),
    'DxD' + 'D'.repeat(CABINET.width - 6) + 'DXD',
    'D' + 'X'.repeat(CABINET.width - 2) + 'D',
    'Dx' + 'K'.repeat(CABINET.width - 4) + 'XD',
    'Dx' + 'Kk'.repeat((CABINET.width - 6) / 2) + 'KK' + 'XD',
    'Dx' + 'K'.repeat(CABINET.width - 4) + 'XD',
    'D' + 'X'.repeat(CABINET.width - 2) + 'D',
    'Dx' + 'KD'.repeat((CABINET.width - 6) / 2) + 'KK' + 'XD',
    'D'.repeat(CABINET.width),
    '.' + 'Z'.repeat(CABINET.width),
  ],
};
const DISPLAY = { x: CABINET.x + 3, y: CABINET.y + 3, width: CABINET.width - 6, height: 7 } as const;

/** The display: Monte Carlo price paths fanning out from today's price, and QAE beside them. */
const FAN_FROM = [DISPLAY.x, DISPLAY.y + 3] as const;
const FAN = [['N', 0, 61], ['x', 2, 17], ['y', 3, 5], ['x', 4, 23], ['R', 6, 41]] as const;
const fan = FAN.map(([ch, row, seed]) => qaPath(`qa24-path-${ch}-${String(row)}`, 80, 60, qaBridge(seed, FAN_FROM, [DISPLAY.x + 5, DISPLAY.y + row], { step: 1, jitter: 0.6, top: DISPLAY.y, bottom: DISPLAY.y + 6 }), ch));
const QAE_AT = { x: DISPLAY.x + 7, y: DISPLAY.y + 1 } as const;

/** The cable from the chip, down to the floor and along it to the console. */
const cable = qaPath('qa24-cable', 80, 60, [[CX + 4, 38], [CX + 6, 41], [CX + 8, 44], [CX + 10, 47], [CABINET.x - 2, 47], [CABINET.x, 45]], 't');

const LEDS = [3, 5, 7, 9, 11, 13, 15, 17, 19] as const;
const ledFrame = (shift: number) => [[...Array(CABINET.width)].map((_, x) => {
  const i = LEDS.indexOf(x as (typeof LEDS)[number]);
  return i < 0 ? '.' : ['N', 'B', 'N', 'R', 'B', 'N', 'y'][(i + shift) % 7];
}).join('')];
const leds: PixelSprite = { id: 'qa24-leds', name: 'qa24-leds', tags: ['scene', 'qa24'], rows: ledFrame(0), frames: [0, 2, 4, 6].map(ledFrame), frameMs: 480 };
const LED_ROW = 13;

/** The keep-clear stripe painted on the floor round the fridge. */
const stripe: PixelSprite = {
  id: 'qa24-stripe',
  name: 'qa24-stripe',
  tags: ['scene', 'qa24'],
  rows: [[...Array(30)].map((_, x) => (Math.floor(x / 2) % 2 === 0 ? 'G' : 'k')).join('')],
};

const HAND = { x: 50, y: 23 } as const;
const QUANT_AT = { x: HAND.x - QA_REACH_HAND.x, y: HAND.y - QA_REACH_HAND.y } as const;

const base = qaCompose('qa24-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  ...fridge,
  { sprite: qaScreen('qa24-screen', SCREEN.width, SCREEN.height, { surface: 'K' }), x: SCREEN.x, y: SCREEN.y },
  ...sphere.map((sprite) => ({ sprite, x: 0, y: 0 })),
  { sprite: { id: 'qa24-pole-n', name: 'qa24-pole-n', tags: ['scene', 'qa24'], rows: ['w'] }, x: SPHERE.x, y: SPHERE.y - SPHERE.r },
  { sprite: { id: 'qa24-pole-s', name: 'qa24-pole-s', tags: ['scene', 'qa24'], rows: ['w'] }, x: SPHERE.x, y: SPHERE.y + SPHERE.r },
  { sprite: qaText('qa24-zero', '0', 'w'), x: SPHERE.x + 5, y: SCREEN.y + 2 },
  { sprite: qaText('qa24-one', '1', 'w'), x: SPHERE.x + 7, y: SPHERE.y + SPHERE.r - 3 },
  { sprite: cabinet, x: CABINET.x, y: CABINET.y },
  ...fan.map((sprite) => ({ sprite, x: 0, y: 0 })),
  { sprite: qaText('qa24-qae', 'QAE', 't'), x: QAE_AT.x, y: QAE_AT.y },
  { sprite: stripe, x: CX - 15, y: 49 },
  { sprite: cable, x: 0, y: 0 },
  { sprite: qaQuantReaching, x: QUANT_AT.x, y: QUANT_AT.y },
]);

export const qa24Opener: SceneArt = {
  id: 'qa24-opener',
  label: "In a quantum lab a quant reaches up to a screen showing a qubit on its Bloch sphere, the state arrow turning between 0 and 1, beside the gold chandelier of a dilution refrigerator, whose chip feeds a teal cable to a console pricing an option from a fan of simulated paths with QAE, quantum amplitude estimation.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: stateArrow, x: ARROW_BOX.x, y: ARROW_BOX.y },
    { sprite: pulse, x: PULSE.x, y: PULSE.y },
    { sprite: chipGlow, x: CX - 1, y: CHIP_Y + 2, motion: { kind: 'twinkle', periodMs: 1300, min: 0.3 } },
    { sprite: frost, x: CX - 11, y: 21, motion: { kind: 'twinkle', periodMs: 2100, min: 0.1 } },
    { sprite: frost, x: CX + 7, y: 27, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.1 } },
    { sprite: leds, x: CABINET.x, y: CABINET.y + LED_ROW },
    { sprite: qaText('qa24-qae-lit', 'QAE', 'T'), x: QAE_AT.x, y: QAE_AT.y, motion: { kind: 'twinkle', periodMs: 1600, min: 0.2 } },
  ],
};

/** Lesson 24's emblem: psi, the wavefunction a qubit's state is written in. */
const emblemPsi: PixelSprite = {
  id: 'qa24-emblem-psi',
  name: 'qa24-emblem-psi',
  tags: ['scene', 'qa24'],
  rows: [
    '............',
    '.OO..OO..OO.',
    '.OOy.OOy.OO.',
    '.OOy.OOy.OO.',
    '.OOy.OOy.OO.',
    '..OOyOOyOO..',
    '...OOOOOO...',
    '.....OOy....',
    '.....OOy....',
    '.....OOy....',
    '....OOOOy...',
    '............',
  ],
};

export const qa24Finish: SceneArt = qaKeepsake(
  'qa24-finish',
  'A gold medallion hanging from a purple ribbon, embossed with the Greek letter psi, with small sparkles around it.',
  emblemPsi,
);

export const art: LessonArtSet = { opener: qa24Opener, backdrop: qaBackdrop, finish: qa24Finish };
