/**
 * Financial Analytics lesson 25, the advanced capstone: every layer of the platform working as one.
 *
 * OPENER. The plant's gala night, built symmetrical where lesson 10 ran left to right. The whole
 * line is lit around a stage: COLLECT and CLEAN on the left (data falls down the chute into the
 * hopper, bubbles through the tank), the big ANALYZE screen in the middle building this lesson's
 * crown, and on the right MODEL's dial swinging and DECIDE's slot issuing a card. The map chases all
 * five stages. On a stage striped in the five stage colours, a light running along it, the analyst
 * raises the trophy, its little screen setting its own five jewels, while the colleague and the
 * client stand either side applauding and fireworks burst under the ceiling in the stages' colours.
 *
 * BACKDROP. The capstone night (fa-kit-b faBackdropCapstone): every window lit, every packet gold.
 *
 * KEEPSAKE. The trophy with the capstone's crown: a gold crown whose band is set with five jewels,
 * one per stage in pipeline order (blue, teal, green, orchid, gold), set one by one.
 */
import {
  faBubble,
  faCompose,
  faDecisionCard,
  faFilterTank,
  faGaugeNeedle,
  faHopper,
  faLamp,
  faMapChase,
  faMeter,
  faOutlierDrip,
  faOutputSlot,
  faPipelineMap,
  faRawBits,
  FA_FILTER_DRIP,
  FA_HOPPER_COUNTER,
  FA_MAP_LIGHTS,
  FA_OUTPUT_LAMP,
} from './fa-kit';
import { faDial, faDrawnBy, faKeepsake, faMonitor, faRoom, FA_DIAL_NEEDLE, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAnalystCheer, faBackdropCapstone, faBlank, faChute, faRowsOf, FA_CAST_CLIENT, FA_CAST_COLLEAGUE, FA_CHEER_SCREEN } from './fa-kit-b';
import { faFigure, faHead, faWorn } from './fa-kit-c';
import type { FaCast } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the keepsake's emblem (it also fills the big screen) ──────────────────────────────────── */

/** Which beat each jewel is set on, in pipeline order. */
const JEWEL_STEP: Readonly<Record<string, number>> = { B: 4, T: 5, N: 6, q: 7, y: 8 };

/**
 * LESSON 25: the capstone. A gold crown: its dark band lands first with five empty sockets, the
 * crown rises from the band to its three points, then the jewels are set one by one in pipeline
 * order (collect blue, clean teal, analyze green, model orchid, decide gold), the pearls on the
 * points catch the light, every jewel flashes at once, and the screen clears.
 */
export const faEmblemCrown: PixelSprite = (() => {
  const full = [
    '.w.....ww.....w.',
    '.y.....yG.....g.',
    '.yG...yGGg...Gg.',
    '.yGG.yGGGGg.GGg.',
    '.yGGGGGGGGGGGGg.',
    '.yGGGGGGGGGGGGg.',
    'OOOOOOOOOOOOOOOO',
    'OBBOTTONNOqqOyyO',
    'OBBOTTONNOqqOyyO',
    'OOOOOOOOOOOOOOOO',
    '.gggggggggggggg.',
  ];
  const step = (_x: number, y: number, ch: string) => {
    if (y >= 6) return ch === 'O' || y === 10 ? 0 : JEWEL_STEP[ch] ?? 0;
    if (ch === 'w') return 9;
    return y >= 4 ? 1 : y >= 2 ? 2 : 3;
  };
  const drawn = faDrawnBy('fa-emblem-crown', full, step, 300, 5);
  const frames = drawn.frames ?? [drawn.rows];
  // Every jewel flashes at once on one beat of the hold.
  frames[12] = frames[12].map((row, y) => (y === 7 || y === 8 ? row.replace(/[BTNqy]/g, 'w') : row));
  return { ...drawn, name: 'emblem crown', blurb: 'A gold crown set with five jewels, one per stage.', frames };
})();

/* ── the team ──────────────────────────────────────────────────────────────────────────────── */

/**
 * A figure applauding: the cast's head over a body with both arms brought in to the chest; the
 * hands are a layer (faClap), so they can meet. Drawn in the analyst's letters for the analyst or
 * the client, or the colleague's blazer for her.
 */
const CLAP_BODY = [
  '..TTtwwttv..',
  '.TTtPwwPttv.',
  '.TTttPPtttv.',
  '.TTttwwtttv.',
  '.TTttwwtttv.',
  '.TTtttttttv.',
  '.TTtttttttv.',
  '..Tttttttv..',
  '..Tttttttv..',
  '..Tttttttv..',
  '..DDDDDDkk..',
  '..DDD..Dkk..',
  '..DDD..Dkk..',
  '.OOOO..OOOO.',
] as const;
const BLAZER_BODY = [
  '..PPpwwppE..',
  '.qPPpwwpppE.',
  '.qPPppwpppE.',
  '.qPPpppppE..',
  '.qPPpppppE..',
  '.qPPpppppE..',
  '..PPppppE...',
  '..PPppppE...',
  '..PPppppE...',
  '..PPppppE...',
  '..DDDDDDkk..',
  '..DDD..Dkk..',
  '..DDD..Dkk..',
  '.EEEE..EEEE.',
] as const;

function applauding(id: string, cast: FaCast): PixelSprite {
  const body = cast === FA_CAST_COLLEAGUE ? [...BLAZER_BODY] : faWorn(CLAP_BODY, cast);
  return faFigure(id, cast, [...faHead(cast), ...body], 'A figure, front on, applauding.');
}

/**
 * The hands clapping, 8 x 3 over the chest (at CLAP_AT under the head): apart at the sides, then
 * together with two white marks, twice, then a rest. `by` starts the cycle elsewhere so two people
 * never clap in step.
 */
function clap(id: string, cast: FaCast, by: number): PixelSprite {
  const [lit, shade] = cast === FA_CAST_COLLEAGUE ? ['A', 'C'] : ['S', 'M'];
  const apart = ['........', `${lit}......${shade}`, '........'];
  const together = ['..w..w..', `...${lit}${shade}...`, '........'];
  const frames = [apart, together, apart, together, apart, apart];
  return { id, name: 'clap', tags: ['scene', 'fa25'], palette: { ...cast.palette }, rows: together, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs: 170 };
}
/** Where the clapping hands go: from the row under the head, two in from the side. */
const CLAP_AT = { x: 2, y: 1 } as const;

/* ── the celebration ───────────────────────────────────────────────────────────────────────── */

/**
 * The stage, 44 x 4: a lit top, a stripe in the five stage colours in pipeline order, its front
 * and its foot.
 */
const STRIPE = `${'B'.repeat(8)}${'T'.repeat(8)}${'N'.repeat(9)}${'q'.repeat(8)}${'y'.repeat(8)}`;
const stage: PixelSprite = {
  id: 'fa25-stage',
  name: 'stage',
  tags: ['scene', 'fa25', 'prop'],
  rows: [`Dxw${'x'.repeat(38)}XkD`, `D${STRIPE}kD`, `Dx${'X'.repeat(40)}kD`, 'D'.repeat(44)],
};

/** A white light running along the stage's stripe, then a rest before it runs again. */
const stripeRun: PixelSprite = (() => {
  const at = (p: number) => [Array.from({ length: STRIPE.length }, (_, x) => (x >= p && x < p + 3 ? 'w' : '.')).join('')];
  const frames = Array.from({ length: 14 }, (_, k) => at(k * 3));
  for (let k = 0; k < 6; k++) frames.push(at(99));
  return { id: 'fa25-stripe-run', name: 'stripe run', tags: ['scene', 'fa25'], rows: at(99), frames, frameMs: 110 };
})();

/**
 * A firework, 9 x 9: a white spark, a small cross, a ring, a wider sparser ring fading to the
 * ink's dark step, then a pause. `by` starts it elsewhere in its cycle.
 */
function firework(id: string, ink: string, dark: string, by: number): PixelSprite {
  const shot = (pixels: readonly (readonly [number, number, string])[]) => {
    const g = faBlank(9, 9);
    for (const [x, y, ch] of pixels) g[y][x] = ch;
    return faRowsOf(g);
  };
  const ring = (r: number, ch: string) => [[4, 4 - r, ch], [4 - r, 4, ch], [4 + r, 4, ch], [4, 4 + r, ch], [4 - r + 1, 4 - r + 1, ch], [4 + r - 1, 4 - r + 1, ch], [4 - r + 1, 4 + r - 1, ch], [4 + r - 1, 4 + r - 1, ch]] as const;
  const frames = [
    shot([[4, 4, 'w']]),
    shot([[4, 4, 'w'], [4, 3, ink], [3, 4, ink], [5, 4, ink], [4, 5, ink]]),
    shot(ring(2, ink)),
    shot(ring(3, ink)),
    shot(ring(4, dark)),
    shot([]),
    shot([]),
    shot([]),
  ];
  return { id, name: 'firework', tags: ['scene', 'fa25'], rows: frames[3], frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs: 170 };
}

/** The held trophy's little screen setting its own jewels, then its gold bar, then clearing. */
const trophyScreen: PixelSprite = {
  id: 'fa25-trophy-screen',
  name: 'trophy screen',
  tags: ['scene', 'fa25'],
  rows: ['BTNq', 'yyyy'],
  frames: [
    ['KKKK', 'KKKK'],
    ['BKKK', 'KKKK'],
    ['BTKK', 'KKKK'],
    ['BTNK', 'KKKK'],
    ['BTNq', 'KKKK'],
    ['BTNq', 'yyyy'],
    ['BTNq', 'wwww'],
    ['BTNq', 'yyyy'],
    ['BTNq', 'yyyy'],
    ['KKKK', 'KKKK'],
  ],
  frameMs: 300,
};

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

/* Where everything stands, left to right in pipeline order, the stage in the middle. */
const MAP = { x: 24, y: 1 } as const;
const CHUTE = { x: 4, y: 0 } as const;
const HOPPER = { x: 1, y: 22 } as const;
const FILTER = { x: 14, y: 21 } as const;
const SCREEN = { x: 28, y: 8, w: 24, h: 17 } as const;
const DIAL = { x: 56, y: 12 } as const;
const OUTPUT = { x: 68, y: 30 } as const;
const STAGE = { x: 18, y: 56 } as const;
const ANALYST = { x: 33, y: 25 } as const;
const COLLEAGUE = { x: 21, y: 30 } as const;
const CLIENT = { x: 48, y: 32 } as const;

const room = faRoom('fa25-opener-room', [
  [HOPPER.x + 1, 50, 22, 1, 'Z'],
  [OUTPUT.x + 1, 50, 9, 1, 'Z'],
]);

const base = faCompose('fa25-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faChute('fa25-chute', 16), CHUTE.x, CHUTE.y],
  [faHopper, HOPPER.x, HOPPER.y],
  [faFilterTank, FILTER.x, FILTER.y],
  [faMonitor('fa25-screen', SCREEN.w, SCREEN.h), SCREEN.x, SCREEN.y],
  [faDial, DIAL.x, DIAL.y],
  [faOutputSlot, OUTPUT.x, OUTPUT.y],
  [stage, STAGE.x, STAGE.y],
  [applauding('fa25-colleague', FA_CAST_COLLEAGUE), COLLEAGUE.x, COLLEAGUE.y],
  [applauding('fa25-client', FA_CAST_CLIENT), CLIENT.x, CLIENT.y],
  [faAnalystCheer, ANALYST.x, ANALYST.y],
]);

export const fa25Opener: SceneArt = {
  id: 'fa25-opener',
  label: 'The data plant on its biggest night: every station runs, the map lights all five stages, the big screen builds a jewelled crown and fireworks burst in the stage colours, while the analyst stands on a striped stage raising the gold trophy and the colleague and the client applaud on either side.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: firework('fa25-firework-blue', 'B', 'b', 0), x: 12, y: 1 },
    { sprite: firework('fa25-firework-teal', 'T', 't', 3), x: 15, y: 11 },
    { sprite: firework('fa25-firework-orchid', 'q', 'p', 5), x: 57, y: 1 },
    { sprite: firework('fa25-firework-gold', 'y', 'G', 2), x: 69, y: 6 },
    { sprite: faRawBits, x: CHUTE.x + 1, y: 16 },
    { sprite: faMeter, x: HOPPER.x + FA_HOPPER_COUNTER.x, y: HOPPER.y + FA_HOPPER_COUNTER.y },
    { sprite: faBubble, x: FILTER.x + 3, y: FILTER.y + 14, motion: { kind: 'rise', amp: 6, periodMs: 1800 } },
    { sprite: faBubble, x: FILTER.x + 6, y: FILTER.y + 15, motion: { kind: 'rise', amp: 6, periodMs: 2300, phase: 0.5 } },
    { sprite: faOutlierDrip, x: FILTER.x + FA_FILTER_DRIP.x, y: FILTER.y + FA_FILTER_DRIP.y },
    { sprite: faEmblemCrown, x: SCREEN.x + FA_MONITOR_GLASS.x + 1, y: SCREEN.y + FA_MONITOR_GLASS.y },
    { sprite: faGaugeNeedle, x: DIAL.x + FA_DIAL_NEEDLE.x, y: DIAL.y + FA_DIAL_NEEDLE.y },
    { sprite: faDecisionCard, x: OUTPUT.x + 1, y: OUTPUT.y - 9, motion: { kind: 'rise', amp: 5, periodMs: 2880 } },
    { sprite: faLamp, x: OUTPUT.x + FA_OUTPUT_LAMP.x, y: OUTPUT.y + FA_OUTPUT_LAMP.y, motion: { kind: 'twinkle', periodMs: 1440, min: 0.3 } },
    { sprite: faMapChase, x: MAP.x + FA_MAP_LIGHTS.x, y: MAP.y + FA_MAP_LIGHTS.y },
    { sprite: stripeRun, x: STAGE.x + 1, y: STAGE.y + 1 },
    { sprite: trophyScreen, x: ANALYST.x + FA_CHEER_SCREEN.x, y: ANALYST.y + FA_CHEER_SCREEN.y },
    { sprite: clap('fa25-clap-colleague', FA_CAST_COLLEAGUE, 0), x: COLLEAGUE.x + CLAP_AT.x, y: COLLEAGUE.y + faHead(FA_CAST_COLLEAGUE).length + CLAP_AT.y },
    { sprite: clap('fa25-clap-client', FA_CAST_CLIENT, 1), x: CLIENT.x + CLAP_AT.x, y: CLIENT.y + faHead(FA_CAST_CLIENT).length + CLAP_AT.y },
  ],
};

export const fa25Finish: SceneArt = faKeepsake(
  'fa25-finish',
  'A gold terminal trophy on a purple stand, its screen building a gold crown whose band is set with five jewels in blue, teal, green, purple and gold, one for each stage, with small sparkles around it.',
  faEmblemCrown,
);

export const art: LessonArtSet = { opener: fa25Opener, backdrop: faBackdropCapstone, finish: fa25Finish };
