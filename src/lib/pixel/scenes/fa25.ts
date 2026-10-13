/**
 * Financial Analytics lesson 25, the advanced capstone: every layer of the platform working as one.
 *
 * OPENER. The plant's gala night, built around the lesson's own diagram: one integrated analytics
 * platform and the five modules it joins up. Five wall screens each show a module the way an
 * earlier lesson drew it: STATISTICS as lesson 11's decomposition (a jagged series over its trend
 * and its wave), ML/AI as lesson 22's forecast (the price, today's line, a cone that widens), RISK
 * as lesson 23's histogram (teal bars, the dashed VaR line, the red tail), NLP as lesson 21's
 * filing (a page of tagged words and a red arrow down) and BIG DATA as lesson 24's cloud with its
 * upload arrow. A cable runs from each, starting at a light in the module's colour, into the hub in
 * the middle, the integrated analytics: a steel box holding a gold ring with a white core, a light
 * in each module's colour where its cable docks. Data travels down each cable in turn while the
 * hub's core pulses. Under
 * it, on a stage striped in the pathway's five colours with a light running along it, the analyst
 * raises the trophy, the colleague and the client applaud either side, and fireworks burst in the
 * corners. Lesson 1's pipeline map gives way to the platform's own hub here.
 *
 * BACKDROP. The capstone night (fa-kit-b faBackdropCapstone): every window lit, every packet gold.
 *
 * KEEPSAKE. The trophy with the hub: a gold hub node and five spokes out to five nodes, one per
 * module, lighting one at a time; then the hub flashes with all five lit.
 */
import { faCompose } from './fa-kit';
import { faKeepsake, faMonitor, faRoom, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAnalystCheer, faBackdropCapstone, faBlank, faLine, faRowsOf, FA_CAST_CLIENT, FA_CAST_COLLEAGUE, FA_CHEER_SCREEN } from './fa-kit-b';
import { faFigure, faHead, faWorn } from './fa-kit-c';
import type { FaCast } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the modules ───────────────────────────────────────────────────────────────────────────── */

/**
 * The five modules, each a 12 x 7 picture for a wall screen's glass, drawn the way its lesson drew
 * it, and where its screen hangs. `port` is where its cable leaves the screen, `dock` where the
 * cable meets the hub.
 */
interface FaModule {
  id: string;
  /** The module's colour: the light at its cable's ends, and its node on the keepsake. */
  ink: string;
  picture: readonly string[];
  at: { x: number; y: number };
  port: readonly [number, number];
  dock: readonly [number, number];
}
const MODULES: readonly FaModule[] = [
  {
    id: 'statistics',
    ink: 'w',
    picture: ['...w.....w..', '.ww.w.w.w.ww', 'w.....w.....', '.......yyyyy', 'yyyyyyy.....', '.TT....TT...', 'T..TT.T..TT.'],
    at: { x: 1, y: 2 },
    port: [19, 8],
    dock: [33, 16],
  },
  {
    id: 'ml',
    ink: 'T',
    picture: ['.......w...g', '..........g.', '.......wgg.y', '....B.B.y.y.', '..BB.B.wgg..', 'BB........g.', '.......w...g'],
    at: { x: 1, y: 17 },
    port: [19, 23],
    dock: [33, 21],
  },
  {
    id: 'risk',
    ink: 'R',
    picture: ['....w.......', '........Tt..', '....w.TtTt..', '.....TtTtTt.', '....wTtTtTtT', 'RrRrTtTtTtTt', 'xxxxxxxxxxxx'],
    at: { x: 61, y: 2 },
    port: [60, 8],
    dock: [46, 16],
  },
  {
    id: 'nlp',
    ink: 'q',
    picture: ['wwwwwwwx....', 'wXXwRRwx.RR.', 'wwwwwwwx.RR.', 'wNNwXXwx.RR.', 'wwwwwwwxRRRR', 'wXXXwGGx.RR.', 'xxxxxxxx....'],
    at: { x: 61, y: 17 },
    port: [60, 23],
    dock: [46, 21],
  },
  {
    id: 'big-data',
    ink: 'B',
    picture: ['.....BBB....', '..BBB...B...', '.B...w...BB.', 'B...www....B', 'B..wwwww...B', '.B...w....B.', '..BBBBBBBBB.'],
    at: { x: 31, y: 0 },
    port: [39, 13],
    dock: [39, 13],
  },
];
const MODULE_W = 18;
const MODULE_H = 13;

/** A module's picture as a sprite for its screen's glass. */
const modulePicture = (m: FaModule): PixelSprite => ({ id: `fa25-module-${m.id}`, name: m.id, tags: ['scene', 'fa25'], rows: [...m.picture] });

/* ── the hub ───────────────────────────────────────────────────────────────────────────────── */

const HUB = { x: 34, y: 14 } as const;
/**
 * The hub, 12 x 11: a steel box lit from the top left holding a gold ring, lit on its upper left,
 * round a dark centre whose white core is the pulsing layer (HUB_CORE); where each module's cable
 * docks, a light in that module's colour sits in the box's edge. The integrated analytics.
 */
const hub: PixelSprite = (() => {
  const g = faBlank(12, 11);
  for (let y = 0; y < 11; y++) {
    for (let x = 0; x < 12; x++) {
      const edge = y === 0 || y === 10 || x === 0 || x === 11;
      const corner = (y === 0 || y === 10) && (x === 0 || x === 11);
      if (corner) continue;
      if (edge) { g[y][x] = 'D'; continue; }
      g[y][x] = x === 1 || y === 1 ? 'x' : x === 10 || y === 9 ? 'k' : 'X';
      const r = Math.hypot(x - 5.5, y - 5);
      if (r <= 4.1) g[y][x] = r <= 2 ? 'K' : r > 3.3 ? 'O' : x + y < 10 ? 'y' : x + y > 12 ? 'g' : 'G';
    }
  }
  for (const m of MODULES) {
    const [dx, dy] = m.dock;
    const x = Math.min(11, Math.max(0, dx - HUB.x));
    const y = Math.min(10, Math.max(0, dy - HUB.y));
    g[m.id === 'big-data' ? 0 : y][m.id === 'big-data' ? 5 : x] = m.ink;
    if (m.id === 'big-data') g[0][6] = m.ink;
  }
  return { id: 'fa25-hub', name: 'hub', tags: ['scene', 'fa25', 'station'], rows: faRowsOf(g) };
})();
const HUB_CORE = { x: 5, y: 4 } as const;
const hubCore: PixelSprite = { id: 'fa25-hub-core', name: 'hub core', tags: ['scene', 'fa25'], rows: ['ww', 'ww'] };

/** The cables, one pixel wide, from each screen's port (a light in the module's colour) to its dock. */
const cables: PixelSprite = (() => {
  const g = faBlank(80, 60);
  for (const m of MODULES) {
    for (const [x, y] of faLine(m.port[0], m.port[1], m.dock[0], m.dock[1])) g[y][x] = 'X';
    if (m.id !== 'big-data') g[m.port[1]][m.port[0]] = m.ink;
  }
  g[MODULES[4].port[1]][MODULES[4].port[0] + 1] = 'X';
  return { id: 'fa25-cables', name: 'cables', tags: ['scene', 'fa25', 'prop'], rows: faRowsOf(g) };
})();

/**
 * Data running down one module's cable to the hub: a white pulse two pixels apart a beat, then a
 * rest. Each cable's turn comes `turn` beats after the last one's, so the five feed the hub one
 * after another, the way the keepsake's spokes light.
 */
const CYCLE = 20;
function cablePulse(m: FaModule, turn: number): { sprite: PixelSprite; x: number; y: number } {
  const path = faLine(m.port[0], m.port[1], m.dock[0], m.dock[1]);
  const xs = path.map(([x]) => x);
  const ys = path.map(([, y]) => y);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  const w = Math.max(...xs) - x0 + (m.id === 'big-data' ? 2 : 1);
  const h = Math.max(...ys) - y0 + 1;
  const steps = path.filter((_, i) => i % 2 === 0 || i === path.length - 1);
  const frames = Array.from({ length: CYCLE }, (_, f) => {
    const g = faBlank(w, h);
    const k = (f - turn * 4 + CYCLE) % CYCLE;
    const at = steps[k];
    if (k < steps.length && at) {
      g[at[1] - y0][at[0] - x0] = 'w';
      if (m.id === 'big-data') g[at[1] - y0][at[0] - x0 + 1] = 'w';
    }
    return faRowsOf(g);
  });
  return { sprite: { id: `fa25-pulse-${m.id}`, name: 'cable pulse', tags: ['scene', 'fa25'], rows: frames[0], frames, frameMs: 150 }, x: x0, y: y0 };
}

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

/** The held trophy's little screen lighting up in the pathway's colours, then its gold bar, then clearing. */
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

/* Where the cast and the stage stand: the stage in the middle, the analyst under the hub. */
const STAGE = { x: 18, y: 56 } as const;
const ANALYST = { x: 33, y: 25 } as const;
const COLLEAGUE = { x: 21, y: 30 } as const;
const CLIENT = { x: 48, y: 32 } as const;

const room = faRoom('fa25-opener-room', [
  [STAGE.x - 2, 58, 48, 2, 'Z'],
]);

const base = faCompose('fa25-opener-base', room, [
  [cables, 0, 0],
  ...MODULES.flatMap((m) => [
    [faMonitor(`fa25-screen-${m.id}`, MODULE_W, MODULE_H), m.at.x, m.at.y] as const,
    [modulePicture(m), m.at.x + FA_MONITOR_GLASS.x, m.at.y + FA_MONITOR_GLASS.y] as const,
  ]),
  [hub, HUB.x, HUB.y],
  [stage, STAGE.x, STAGE.y],
  [applauding('fa25-colleague', FA_CAST_COLLEAGUE), COLLEAGUE.x, COLLEAGUE.y],
  [applauding('fa25-client', FA_CAST_CLIENT), CLIENT.x, CLIENT.y],
  [faAnalystCheer, ANALYST.x, ANALYST.y],
]);

export const fa25Opener: SceneArt = {
  id: 'fa25-opener',
  label: 'The data plant on its biggest night: five module screens showing a split time series, a forecast cone, a returns histogram with its red tail, a tagged filing page and an upload cloud send their data along cables into one glowing hub, fireworks burst in the corners, and on a striped stage the analyst raises the gold trophy while the colleague and the client applaud.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: firework('fa25-firework-blue', 'B', 'b', 0), x: 20, y: 0 },
    { sprite: firework('fa25-firework-teal', 'T', 't', 3), x: 4, y: 32 },
    { sprite: firework('fa25-firework-orchid', 'q', 'p', 5), x: 51, y: 0 },
    { sprite: firework('fa25-firework-gold', 'y', 'G', 2), x: 67, y: 32 },
    ...MODULES.map((m, k) => cablePulse(m, k)),
    { sprite: hubCore, x: HUB.x + HUB_CORE.x, y: HUB.y + HUB_CORE.y, motion: { kind: 'twinkle', periodMs: 1500, min: 0.2 } },
    { sprite: stripeRun, x: STAGE.x + 1, y: STAGE.y + 1 },
    { sprite: trophyScreen, x: ANALYST.x + FA_CHEER_SCREEN.x, y: ANALYST.y + FA_CHEER_SCREEN.y },
    { sprite: clap('fa25-clap-colleague', FA_CAST_COLLEAGUE, 0), x: COLLEAGUE.x + CLAP_AT.x, y: COLLEAGUE.y + faHead(FA_CAST_COLLEAGUE).length + CLAP_AT.y },
    { sprite: clap('fa25-clap-client', FA_CAST_CLIENT, 1), x: CLIENT.x + CLAP_AT.x, y: CLIENT.y + faHead(FA_CAST_CLIENT).length + CLAP_AT.y },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 25: the capstone. The platform as a hub: a gold hub node in the middle and five spokes out
 * to five nodes, one per module (big data blue at the top, statistics white and risk red either
 * side, ML teal and NLP orchid below). The hub lands, then each spoke and its node light in turn,
 * bright while it is the one feeding the hub; then all five hold lit and the hub flashes white;
 * the screen clears.
 */
const SPOKES = [
  { ink: 'B', node: [[7, 0], [8, 0], [7, 1], [8, 1]], spoke: [[7, 2], [8, 2], [7, 3], [8, 3]] },
  { ink: 'w', node: [[1, 3], [2, 3], [1, 4], [2, 4]], spoke: [[3, 4], [4, 4], [4, 5]] },
  { ink: 'R', node: [[13, 3], [14, 3], [13, 4], [14, 4]], spoke: [[12, 4], [11, 4], [11, 5]] },
  { ink: 'T', node: [[3, 9], [4, 9], [3, 10], [4, 10]], spoke: [[4, 8], [5, 8]] },
  { ink: 'q', node: [[11, 9], [12, 9], [11, 10], [12, 10]], spoke: [[11, 8], [10, 8]] },
] as const;
/** The hub, 6 x 4 in the middle, lit on its upper left. */
const HUB_ROWS = ['.yyyG.', 'yyGGGg', 'yGGGgg', '.Gggg.'] as const;
const HUB_PIXELS = HUB_ROWS.flatMap((row, j) => [...row].flatMap((ch, i) => (ch === '.' ? [] : [[5 + i, 4 + j, ch] as const])));
export const faEmblemHub: PixelSprite = (() => {
  const picture = (lit: readonly number[], active: number | null, flash: boolean) => {
    const g = faBlank(16, 11);
    for (const [x, y, ch] of HUB_PIXELS) g[y][x] = flash ? 'W' : ch;
    SPOKES.forEach(({ ink, node, spoke }, k) => {
      if (!lit.includes(k)) return;
      for (const [x, y] of spoke) g[y][x] = k === active ? 'W' : 'x';
      for (const [x, y] of node) g[y][x] = ink;
    });
    return faRowsOf(g);
  };
  const all = [0, 1, 2, 3, 4];
  const frames = [
    picture([], null, false),
    ...all.map((k) => picture(all.slice(0, k + 1), k, false)),
    picture(all, null, true),
    picture(all, null, false),
    picture(all, null, true),
    picture(all, null, false),
    faRowsOf(faBlank(16, 11)),
  ];
  return { id: 'fa-emblem-hub', name: 'emblem hub', tags: ['scene', 'fa', 'emblem'], blurb: 'A gold hub with five spokes out to five module nodes.', rows: picture(all, null, false), frames, frameMs: 360 };
})();

export const fa25Finish: SceneArt = faKeepsake(
  'fa25-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a gold hub with five spokes out to five coloured nodes that light up one at a time, then the hub flashing white with all five lit, with small sparkles around it.',
  faEmblemHub,
);

export const art: LessonArtSet = { opener: fa25Opener, backdrop: faBackdropCapstone, finish: fa25Finish };
