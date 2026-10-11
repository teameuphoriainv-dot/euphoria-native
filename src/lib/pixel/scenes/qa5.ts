/**
 * Quantitative Analysis lesson 5, Derivatives Pricing & Black-Scholes: the options floor.
 *
 * The exchange's display wall carries a call option's picture: its payoff at expiry, the hockey
 * stick (flat at nothing up to the strike K, then rising one for one with the stock, in green), and
 * its Black-Scholes value before expiry (gold, a smooth curve above the stick). A CALL / PUT tape
 * crawls along the top. The quant watches from a trading pod, the backs of two pod monitors and a
 * dealer turret in front. Only small layers move: the tape crawls, the gold curve sinks onto the
 * stick as time to expiry runs out (theta), the turret's line lights blink, the strike pulses.
 * Keepsake: the hockey stick.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { qaCompose, qaDesk, qaKeepsake, qaPath, qaQuantSeated, qaRect, qaRoom, qaScreen, qaText } from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

/* ── the tape ──────────────────────────────────────────────────────────────────────────────────── */

const TAPE = { x: 2, y: 1, width: 76, height: 9 } as const;
const TAPE_TEXT = { x: TAPE.x + 2, y: TAPE.y + 2, width: TAPE.width - 4 } as const;

/** CALL in green, PUT in red, a 32-pixel repeat: names, not quotes, so the tape shows no prices.
 * Dim tones, so the tape never out-shines the chart under it. */
const CALL = qaText('qa5-call', 'CALL', 'n').rows;
const PUT = qaText('qa5-put', 'PUT', 'r').rows;
const REPEAT = CALL.map((row, r) => `${row}...${PUT[r]}...`);

function tape(shift: number): string[] {
  return REPEAT.map((row) => row.repeat(4).slice(shift, shift + TAPE_TEXT.width));
}

const tapeCrawl: PixelSprite = {
  id: 'qa5-tape',
  name: 'qa5-tape',
  tags: ['scene', 'qa5'],
  blurb: 'The tape crawling left, two pixels a frame.',
  rows: tape(0),
  frames: [...Array(16)].map((_, i) => tape(i * 2)),
  frameMs: 180,
};

/* ── the call on the display wall ──────────────────────────────────────────────────────────────── */

const WALL = { x: 2, y: 11, width: 76, height: 27 } as const;
const AXIS_Y = 32;
const AXIS_X = 10;
const STRIKE = 36;

/** The payoff at expiry, max(S - K, 0), in display pixels: one row up for every pixel past K. */
const payoffAt = (s: number) => (s <= STRIKE ? AXIS_Y : AXIS_Y - (s - STRIKE));

const PAYOFF_END = STRIKE + 18;
const payoff = qaPath('qa5-payoff', 80, 60, [[AXIS_X + 1, AXIS_Y], [STRIKE, AXIS_Y], [PAYOFF_END, AXIS_Y - 18]], 'N');
const axes = qaPath('qa5-axes', 80, 60, [[AXIS_X, 14], [AXIS_X, AXIS_Y], [70, AXIS_Y]], 'X');
const strikeLine = qaPath('qa5-strike', 80, 60, [[STRIKE, 19], [STRIKE, AXIS_Y - 1]], 'X', [1, 1]);

/** The value curve's box: wide enough for the whole curve, inside a framed layer's 1024 pixels. */
const CURVE = { x: 17, y: 13, width: PAYOFF_END - 17 + 1, height: AXIS_Y - 13 } as const;

/**
 * The Black-Scholes value as payoff plus time value, the time value a bell round the strike that
 * shrinks with `left`, the share of time to expiry remaining. Only the part above the payoff is
 * drawn; where they meet, the stick shows.
 */
function valueCurve(left: number): string[] {
  const points: [number, number][] = [];
  for (let s = CURVE.x; s < CURVE.x + CURVE.width; s += 1) {
    const timeValue = 4.5 * left * Math.exp(-(((s - STRIKE) / 12) ** 2));
    const y = Math.round(payoffAt(s) - timeValue);
    if (y < payoffAt(s)) points.push([s - CURVE.x, y - CURVE.y]);
  }
  return qaPath('qa5-curve', CURVE.width, CURVE.height, points, 'y').rows;
}

const theta: PixelSprite = {
  id: 'qa5-theta',
  name: 'qa5-theta',
  tags: ['scene', 'qa5'],
  blurb: 'The value curve sinking onto the payoff as expiry nears.',
  rows: valueCurve(1),
  frames: [valueCurve(1), valueCurve(0.7), valueCurve(0.45), valueCurve(0.22)],
  frameMs: 650,
};

/* ── the pod ───────────────────────────────────────────────────────────────────────────────────── */

const monitorBack: PixelSprite = {
  id: 'qa5-monitor-back',
  name: 'qa5-monitor-back',
  tags: ['scene', 'qa5'],
  blurb: "A pod monitor seen from behind: its plastic back, the mount, the stand. Foot on the desk's back edge row.",
  rows: [
    'DDDDDDDDDDDDD',
    'DkkkkDDDkkkkD',
    'DkkkkkkkkkkkD',
    'DDDDDDDDDDDDD',
    '.....DXD.....',
    '...DDDXDDD...',
  ],
};

const turret: PixelSprite = {
  id: 'qa5-turret',
  name: 'qa5-turret',
  tags: ['scene', 'qa5'],
  blurb: "A dealer turret: a sloped panel of line keys with a handset on its cradle.",
  rows: [
    '..DDDDDDDDDD',
    '.DXxXxXxXxXD',
    'DXDKDKDKDKXD',
    'DXXXXXXXXXXD',
    'DDDDDDDDDDDD',
  ],
};

const turretLights: PixelSprite = {
  id: 'qa5-turret-lights',
  name: 'qa5-turret-lights',
  tags: ['scene', 'qa5'],
  blurb: "The turret's line lights, on and off as calls come in.",
  rows: ['N.n.R.N'],
  frames: [['N.n.R.N'], ['n.N.n.n'], ['N.N.n.R'], ['n.n.N.n']],
  frameMs: 480,
};

const base = qaCompose('qa5-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaScreen('qa5-tape-frame', TAPE.width, TAPE.height, { surface: 'K' }), x: TAPE.x, y: TAPE.y },
  { sprite: qaScreen('qa5-wall', WALL.width, WALL.height, { surface: 'K' }), x: WALL.x, y: WALL.y },
  { sprite: axes, x: 0, y: 0 },
  { sprite: strikeLine, x: 0, y: 0 },
  { sprite: payoff, x: 0, y: 0 },
  { sprite: qaText('qa5-k', 'K', 'x'), x: STRIKE - 1, y: 13 },
  { sprite: qaText('qa5-c', 'C', 'y'), x: 5, y: 14 },
  { sprite: qaText('qa5-s', 'S', 'x'), x: 72, y: 26 },
  { sprite: qaDesk, x: 11, y: 40 },
  { sprite: monitorBack, x: 17, y: 34 },
  { sprite: monitorBack, x: 32, y: 34 },
  { sprite: turret, x: 46, y: 36 },
  { sprite: qaQuantSeated, x: 56, y: 19 },
]);

export const qa5Opener: SceneArt = {
  id: 'qa5-opener',
  label: 'On an options trading floor a quant watches a display wall showing a call option payoff shaped like a hockey stick, with its Black-Scholes value curve above it, under a crawling ticker tape.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: tapeCrawl, x: TAPE_TEXT.x, y: TAPE_TEXT.y },
    { sprite: theta, x: CURVE.x, y: CURVE.y },
    { sprite: turretLights, x: 49, y: 38 },
    { sprite: qaRect('qa5-strike-pulse', 1, 1, 'm'), x: STRIKE, y: AXIS_Y, motion: { kind: 'twinkle', periodMs: 1400, min: 0.3 } },
  ],
};

/** Lesson 5's emblem: the call's payoff on its axes, a hockey stick: flat to the strike, then up. The axes
 * keep it a chart; on its own the stick reads as a tick. */
const emblemHockeyStick: PixelSprite = {
  id: 'qa5-emblem-hockey-stick',
  name: 'qa5-emblem-hockey-stick',
  tags: ['scene', 'qa5'],
  rows: [
    '............',
    '.O........O.',
    '.Oy......OOy',
    '.Oy.....OOy.',
    '.Oy....OOy..',
    '.Oy...OOy...',
    '.Oy..OOy....',
    '.OOOOOOy....',
    '.OOOOOy.....',
    '.Oyyyyy.....',
    '.OOOOOOOOOO.',
    '..yyyyyyyyy.',
  ],
};

export const qa5Finish: SceneArt = qaKeepsake(
  'qa5-finish',
  'A gold medallion hanging from a purple ribbon, embossed with the hockey stick shape of an option payoff, with small sparkles around it.',
  emblemHockeyStick,
);

export const art: LessonArtSet = { opener: qa5Opener, backdrop: qaBackdrop, finish: qa5Finish };
