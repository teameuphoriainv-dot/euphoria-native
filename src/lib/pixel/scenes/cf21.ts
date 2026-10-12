/**
 * Corporate Finance lesson 21, Startup Finance & Venture Funding: many bets, and the one that pays
 * for all the rest.
 *
 * Opener: the one opener in this batch set out under the night sky, a launch field outside town.
 * Four little rockets were set up on their pads: one has toppled into the grass, one sputters and
 * smokes, one has lost its nose cone, and one blasts off into the stars. A founder in a green
 * hoodie (the CFO, back in the garage days) and the venture investor who backed them watch from the
 * edge of the field: in venture capital most bets fail and one carries the fund. The flame and the
 * rising rocket are the brightest things in a dark picture. Only small layers move: the rocket and
 * its flame, two stars, the sputtering spark, two puffs of smoke.
 *
 * Keepsake: a rocket lifting off on its flame.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCfo, cfCompose, cfShadowShort } from './cf-kit';
import { cfExec, cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** Stars in the base, dim and bright; two more twinkle as layers. */
const STARS_DIM: readonly (readonly [number, number])[] = [
  [3, 15], [14, 3], [22, 17], [36, 6], [44, 19], [52, 4], [58, 13], [66, 24], [75, 5], [40, 28], [11, 26], [62, 30],
];
const STARS_BRIGHT: readonly (readonly [number, number])[] = [[26, 9], [47, 11], [73, 18], [17, 21], [55, 26]];
const starAt = (x: number, y: number, list: readonly (readonly [number, number])[]) => list.some(([sx, sy]) => sx === x && sy === y);
/** The low hills along the horizon, where the field begins. */
const hillTop = (x: number) => 38 + Math.round(1.5 * Math.sin(x / 9) + Math.sin(x / 4));

/** Night: navy deepening to the top, a faint orchid glow along the hills, the dark field. */
const field: PixelSprite = {
  id: 'cf21-field',
  name: 'cf21-field',
  tags: ['scene', 'cf21'],
  blurb: 'A starry night sky over low hills and a dark field.',
  palette: CF_PALETTE,
  rows: Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y >= hillTop(x)) return y >= 50 ? 'K' : 'k';
      if (starAt(x, y, STARS_BRIGHT)) return 'w';
      if (starAt(x, y, STARS_DIM)) return 'x';
      return y < 22 ? 'c' : y < 35 ? 'C' : 'E';
    }).join(''),
  ),
};

/** A crescent moon. */
const moon: PixelSprite = {
  id: 'cf21-moon',
  name: 'cf21-moon',
  tags: ['scene', 'cf21'],
  blurb: 'A pale crescent moon.',
  rows: ['..wwx.', '.wwx..', 'wwx...', 'wwx...', 'wwx...', '.wwx..', '..wwx.'],
};

/** A little rocket: red nose cone, white body with a blue porthole, orchid fins, a dark nozzle. */
const ROCKET: readonly string[] = [
  '...R...',
  '..RRr..',
  '.RRRrr.',
  '.wwwxX.',
  '.wBBxX.',
  '.wBWxX.',
  '.wwwxX.',
  '.wwwxX.',
  'PwwwxXp',
  'PPwwxpp',
  'P.DDD.p',
];

const rocket: PixelSprite = { id: 'cf21-rocket', name: 'cf21-rocket', tags: ['scene', 'cf21'], blurb: 'A small rocket on its pad.', rows: [...ROCKET] };

/** The rocket toppled in the grass: turned a quarter clockwise, nose to the right, lit side up. */
const toppled: PixelSprite = {
  id: 'cf21-rocket-toppled',
  name: 'cf21-rocket-toppled',
  tags: ['scene', 'cf21'],
  blurb: 'A small rocket lying on its side.',
  rows: Array.from({ length: 7 }, (_, i) => Array.from({ length: ROCKET.length }, (_, j) => ROCKET[ROCKET.length - 1 - j]?.[i] ?? '.').join('')),
};

/** The rocket that lost its nose: the body standing open-topped, the cone in the grass beside it. */
const noseless: PixelSprite = { id: 'cf21-rocket-noseless', name: 'cf21-rocket-noseless', tags: ['scene', 'cf21'], rows: ROCKET.slice(3) };
const cone: PixelSprite = { id: 'cf21-cone', name: 'cf21-cone', tags: ['scene', 'cf21'], rows: ['.RR.', 'RRrr'] };

/** A launch pad: a steel plate on a dark footing. */
const pad: PixelSprite = { id: 'cf21-pad', name: 'cf21-pad', tags: ['scene', 'cf21'], rows: ['xxxxxxxxx', 'XXXXXXXXD', '.DDDDDDD.'] };

/** The smoke the launch left round the pad. */
const launchSmoke: PixelSprite = {
  id: 'cf21-launch-smoke',
  name: 'cf21-launch-smoke',
  tags: ['scene', 'cf21'],
  blurb: 'Smoke billowing round a launch pad.',
  rows: [
    '.....xx.......xx.....',
    '...xxxXx....xxxXX....',
    '.xxxXXXXx..xxXXXXXx..',
    'xxXXXXXXXXxXXXXXXXXXD',
    '.DDXXXXXDDDDDXXXXDDD.',
  ],
};

/** The founder: the CFO in a green hoodie, from before there was a company to be CFO of. */
const founder = cfRecolor(cfCfo, 'cf21-founder', { P: 'N', p: 'n', q: 'm', E: 'n', w: 'N', G: 'N', g: 'n' }, 'The CFO as a young founder in a green hoodie, arms folded.');

const base = cfCompose('cf21-opener-base', field, [
  [moon, 7, 4],
  [toppled, 2, 49],
  [pad, 13, 48],
  [rocket, 14, 37],
  [launchSmoke, 19, 45],
  [pad, 25, 48],
  [pad, 37, 48],
  [noseless, 38, 40],
  [cone, 45, 52],
  [cfShadowShort, 51, 56],
  [founder, 48, 30],
  [cfShadowShort, 66, 56],
  [cfExec, 62, 30],
], 'The still launch field: the moon and stars, a toppled rocket, a cold one, the smoking empty pad, a noseless one, the founder and the investor.');

/** The flame under the rocket, flickering through the fire ramp. */
const FLAMES: readonly (readonly string[])[] = [
  ['..454..', '..343..', '...3...', '...2...', '.......', '.......'],
  ['..454..', '.34543.', '..333..', '...3...', '...2...', '.......'],
  ['..454..', '..343..', '..232..', '...2...', '...1...', '.......'],
];

/** The rocket that flies: body and flame, rising off its pad and fading into the sky, over again. */
const flyer: PixelSprite = {
  id: 'cf21-opener-flyer',
  name: 'cf21-opener-flyer',
  tags: ['scene', 'cf21'],
  blurb: 'A rocket lifting off on its flame.',
  rows: [...ROCKET, ...(FLAMES[0] ?? [])],
  frames: FLAMES.map((flame) => [...ROCKET, ...flame]),
  frameMs: 120,
};

/** The cold rocket's spark, catching and dying at the nozzle. */
const spark: PixelSprite = {
  id: 'cf21-opener-spark',
  name: 'cf21-opener-spark',
  tags: ['scene', 'cf21'],
  blurb: 'A spark sputtering at a nozzle.',
  rows: ['...', '...'],
  frames: [
    ['...', '...'],
    ['.4.', '...'],
    ['3.3', '.2.'],
    ['...', '...'],
    ['...', '...'],
    ['.3.', '...'],
  ],
  frameMs: 260,
};

const puff: PixelSprite = { id: 'cf21-opener-puff', name: 'cf21-opener-puff', tags: ['scene', 'cf21'], rows: ['.x.', 'xXx', '.X.'] };
const star: PixelSprite = { id: 'cf21-opener-star', name: 'cf21-opener-star', tags: ['scene', 'cf21'], rows: ['.w.', 'wWw', '.w.'] };

export const cf21Opener: SceneArt = {
  id: 'cf21-opener',
  label: 'On a launch field at night four small rockets were set up: one has toppled, one sputters, one has lost its nose, and one blasts off into the stars, while a young founder and an investor watch.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flyer, x: 26, y: 31, motion: { kind: 'rise', amp: 22, periodMs: 3400 } },
    { sprite: spark, x: 16, y: 47 },
    { sprite: puff, x: 1, y: 47, motion: { kind: 'rise', amp: 6, periodMs: 3000 } },
    { sprite: puff, x: 11, y: 42, motion: { kind: 'rise', amp: 5, periodMs: 2600, phase: 0.5 } },
    { sprite: star, x: 20, y: 7, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: star, x: 69, y: 9, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.5, min: 0.2 } },
  ],
};

/** Lesson 21's emblem: a rocket, red nose, blue porthole, orchid fins, lifting off on its flame. */
const emblemRocket: PixelSprite = {
  id: 'cf21-emblem-rocket',
  name: 'cf21-emblem-rocket',
  tags: [],
  blurb: 'A white rocket with a red nose and orchid fins lifting off on its flame.',
  rows: [
    '.......Rr.......',
    '......RRRr......',
    '.....RRRRrr.....',
    '.....wwwwxX.....',
    '.....wwBBxX.....',
    '.....wBWBxX.....',
    '.....wwBBxX.....',
    '.....wwwwxX.....',
    '....PwwwwxXp....',
    '...PPwwwwxXpp...',
    '..PPPwwwwxXppp..',
    '..PP.DDDDDD.pp..',
    '......4554......',
    '......3443......',
    '.......33.......',
    '.......2........',
  ],
};

export const cf21Finish = cfKeepsake(
  'cf21-finish',
  'A crystal award on a gold stand with a rocket lifting off on its flame inside, and small sparkles around it.',
  emblemRocket,
);

export const art: LessonArtSet = { opener: cf21Opener, backdrop: cfBackdrop, finish: cf21Finish };
