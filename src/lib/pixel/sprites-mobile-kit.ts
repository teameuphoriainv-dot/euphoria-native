/**
 * THE MOBILE CARD KIT: 24 concept archetypes, not 24 pictures.
 *
 * WHY THIS IS NOT MORE sprites-lesson.ts. That file draws NOUNS: a magnifier, a funnel, an anchor.
 * One sprite, one thing, and when a lesson needs a thing that is not in the list you draw another.
 * The deck rebuild cannot work that way. Every dense authored step becomes three or four illustrated
 * cards, so the picture count goes up by roughly 4x against a corpus of 300 lessons, and drawing a
 * bespoke noun for each is not a system, it is a backlog.
 *
 * So these are IDEAS, and the ideas were counted rather than guessed. Across the corpus the same
 * two dozen shapes keep recurring: something grows, something compounds, something is split,
 * something leaks, two things are compared, a line is crossed. An archetype is drawn so that
 * recolouring it (`accent`) and stamping a 6x6 mark on it (`overlay`) makes it read as a specific
 * thing without redrawing it. `growth` in gold with a `cash` mark is savings; the same art in
 * red with a `down` mark is a drawdown. That is the whole design.
 *
 * ── HOUSE RULES, from src/lib/pixel/index.ts and restated in sprites-lesson.ts ──────────────────
 *  - 16x16. Every row EXACTLY 16 characters, every sprite EXACTLY 16 rows.
 *  - Shared palette characters only (palette.ts). `.` is transparent.
 *  - NEVER outline with K. #1A1523 on the #0A090F canvas is invisible, so a sprite whose structure
 *    is K linework disappears. Outline with the deep ramp: O gold, E orchid, D neutral, I pink,
 *    and `1` for the fire/red ramp. K and k are INTERIOR detail only.
 *  - Centred in the canvas. Authoring left-aligned and padding the right looks fine in source and
 *    is obviously wrong the moment two sit side by side.
 *  - Silhouette first. If the shape does not read as a black blob, shading will not save it.
 *
 * ── THE ACCENT SLOT ────────────────────────────────────────────────────────────────────────────
 * Every archetype is drawn on the ORCHID ramp, and those four characters are the accent slot:
 *
 *     E  deep   (the outline tone)      P  base   (the body)
 *     p  shadow (the shaded side)       q  light  (the lit edge and highlights)
 *
 * `applyAccent` substitutes all four onto another hue ramp in one pass. Any OTHER palette character
 * in a sprite is deliberate and does not move: the red bite in `fee` stays red whatever the
 * accent is, because a fee is not a brand colour, and the neutral D scaffolding (axes, posts,
 * ground) stays neutral so the accent reads as the SUBJECT rather than as a theme.
 *
 * WHAT DID NOT WORK: an earlier pass gave each archetype its own "natural" hue (gold coins, green
 * growth, red loss) and exposed `accent` as an override. Two problems. Recolouring gold coins to
 * green means substituting O/g/G/y, recolouring a green curve means substituting n/N/m, so the
 * substitution table had to be per-sprite and every new sprite was a new table to get wrong. And
 * the default palette drifted: nine sprites ended up gold, and a deck of four cards was four gold
 * pictures. One slot, one table, one default is the version that survives new art.
 *
 * ── THE OVERLAY CORNER ─────────────────────────────────────────────────────────────────────────
 * The TOP-LEFT 6x6 (x 0..5, y 0..5) is reserved and is transparent in every archetype and in every
 * frame of every archetype. `applyOverlay` stamps a 6x6 mark there, so a mark can never cover the
 * subject. Top-left specifically, and not any other corner, because finance art rises to the RIGHT:
 * bars, curves and stacks all leave their top-left empty anyway, so the reservation costs almost no
 * drawing room. The bottom-left version of this cost a redraw of six archetypes before that was
 * obvious.
 *
 * Marks are NOT accented. An `up` mark is green and a `down` mark is red in every scene, because
 * their job is to say which way this one points, and a mark that changes colour with the subject
 * cannot do that.
 *
 * ── ANIMATION ──────────────────────────────────────────────────────────────────────────────────
 * Frames are DERIVED from the still wherever the motion allows it, using the helpers below. A
 * miscounted row is the one bug this format has, and a derived frame cannot change geometry, so it
 * cannot introduce that bug. Hand-written frames are reserved for motion no helper can express
 * (a beam tipping, a chart changing shape), and there are only three of those.
 */
import type { SceneSpec } from '@/lib/mobile-lesson/types';

import type { PixelSprite } from './types';

/* ── HELPERS ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * Palette substitution. Lighting-only frames and the accent system both run through this, which is
 * the same trick sprites.ts uses for the bolt and the heart: a substitution cannot move a pixel,
 * so it cannot break a sprite.
 */
const shade = (rows: string[], swap: Record<string, string>): string[] =>
  rows.map((row) => [...row].map((ch) => swap[ch] ?? ch).join(''));

/** Replaces whole rows by index, for motion confined to part of the canvas. */
const rowsWith = (rows: string[], overrides: Record<number, string>): string[] =>
  rows.map((row, i) => overrides[i] ?? row);

/**
 * Composites a small block onto a canvas at (x, y). `.` in the block leaves the canvas alone, and
 * anything falling outside is clipped, so a stamped element can move off the edge without the
 * caller checking bounds. This is how the overlay lands in its corner AND how every travelling
 * element (a falling coin, a climbing marker, a dart) is animated: one helper, both jobs.
 */
const stamp = (rows: string[], art: string[], x: number, y: number): string[] => {
  const out = rows.map((r) => [...r]);
  art.forEach((line, dy) => {
    const ty = y + dy;
    if (ty < 0 || ty >= out.length) return;
    [...line].forEach((ch, dx) => {
      const tx = x + dx;
      if (ch === '.' || tx < 0 || tx >= out[ty].length) return;
      out[ty][tx] = ch;
    });
  });
  return out.map((r) => r.join(''));
};

/**
 * Reveals a shape a step at a time. `mask` is the same geometry as `rows`; a digit marks which step
 * that pixel belongs to, and `.` means always visible. Cells belonging to a later step are erased.
 *
 * This is the workhorse for anything that GROWS, and it is why this file is a third the size it
 * would be with hand-written frames: one extra 16x16 block buys five frames of a bar chart
 * building, a donut filling or a stream pouring, and every frame is geometrically identical to the
 * still by construction.
 */
const grow = (rows: string[], mask: string[], upTo: number): string[] =>
  rows.map((row, y) => [...row].map((ch, x) => {
    const m = mask[y][x];
    return m >= '1' && m <= '9' && Number(m) > upTo ? '.' : ch;
  }).join(''));

/** The inverse: erases a shape a step at a time, for anything that DRAINS. */
const erase = (rows: string[], mask: string[], upTo: number): string[] =>
  rows.map((row, y) => [...row].map((ch, x) => {
    const m = mask[y][x];
    return m >= '1' && m <= '9' && Number(m) <= upTo ? '.' : ch;
  }).join(''));

/**
 * Lights one masked group and dims the rest, for a chase around a ring or a highlight jumping
 * between branches. Only masked cells change, so unmasked structure is untouched.
 */
const highlight = (rows: string[], mask: string[], lit: number, on = 'q', off = 'p'): string[] =>
  rows.map((row, y) => [...row].map((ch, x) => {
    const m = mask[y][x];
    if (m < '1' || m > '9') return ch;
    return Number(m) === lit ? on : off;
  }).join(''));

/** Repaints one masked group, for the fee bite eating its way into a bar. */
const paint = (rows: string[], mask: string[], upTo: number, ch: string): string[] =>
  rows.map((row, y) => [...row].map((c, x) => {
    const m = mask[y][x];
    return m >= '1' && m <= '9' && Number(m) <= upTo ? ch : c;
  }).join(''));

const EMPTY = '................';
const blank = (n: number) => Array.from({ length: n }, () => EMPTY);

/* ── THE ACCENT TABLE ────────────────────────────────────────────────────────────────────────── */

/**
 * Where each accent slot character lands on another ramp: [deep, shadow, base, light].
 *
 * Every target set is DISJOINT from the source set {E, p, P, q}, which is what makes a single-pass
 * substitution correct. If a future accent reused one of those four characters the pass would have
 * to become simultaneous rather than per-character, so `pin:pixel-kit` asserts the disjointness
 * rather than leaving it as a comment nobody reads.
 *
 * Green, teal and blue have no deep step in palette.ts, so their deep and shadow steps are the same
 * character. That flattens the outline by one value and it is the honest trade: inventing a colour
 * would put a hue in the sprites that is in no design token, which is exactly what palette.ts was
 * written to prevent. #0E7A5F, #0F766E and #2563C4 all still hold a silhouette against #0A090F,
 * which is the property that actually matters.
 */
const ACCENTS: Record<string, [string, string, string, string]> = {
  orchid: ['E', 'p', 'P', 'q'],
  gold: ['O', 'g', 'G', 'y'],
  green: ['n', 'n', 'N', 'm'],
  red: ['1', 'r', 'R', 's'],
  teal: ['t', 't', 'T', 'm'],
  pink: ['I', 'f', 'F', 's'],
  blue: ['b', 'b', 'B', 'w'],
  neutral: ['D', 'X', 'x', 'w'],
};

/** The four characters an archetype must draw itself in to be recolourable. */
export const ACCENT_SLOT = ['E', 'p', 'P', 'q'] as const;

/** The accent names a `SceneSpec` may use. Anything else falls through to orchid. */
export const MOBILE_KIT_ACCENTS = Object.keys(ACCENTS);

const applyAccent = (rows: string[], accent?: string): string[] => {
  const ramp = accent ? ACCENTS[accent] : undefined;
  if (!ramp || accent === 'orchid') return rows;
  return shade(rows, { E: ramp[0], p: ramp[1], P: ramp[2], q: ramp[3] });
};

/* ── THE OVERLAY MARKS ───────────────────────────────────────────────────────────────────────── */

/**
 * 6x6, stamped into x 0..5 / y 0..5. Deliberately NOT on the accent ramp, so a mark says the same
 * thing on every scene. Each is drawn in the hue its meaning already owns across the app: green is
 * the positive accent and red the negative one in AnimatedVisuals, gold is money and streaks, D is
 * the neutral UI tone.
 *
 * K appears inside the clock, the lock and the coin and nowhere else. It is INTERIOR in all three
 * (a hand, a keyhole, an engraved mark), fully enclosed by opaque pixels, which is the only use
 * palette.ts allows. The pin checks that rather than trusting this paragraph.
 */
const OVERLAYS: Record<string, string[]> = {
  up: ['..nn..', '.nNNn.', 'nNmmNn', 'nnNNnn', '..NN..', '..nn..'],
  down: ['..11..', '..RR..', '11RR11', '1RssR1', '.1RR1.', '..11..'],
  warn: ['...O..', '..OGO.', '..OGO.', '.OGGGO', '.OOOOO', '......'],
  check: ['......', '....nN', '...nNm', 'n..Nm.', '.nNm..', '..n...'],
  cross: ['1R..R1', '.1RR1.', '..RR..', '.1RR1.', '1R..R1', '......'],
  clock: ['..DD..', '.DwwD.', 'DwWwwD', 'DwKwwD', '.DwwD.', '..DD..'],
  lock: ['..DD..', '.D..D.', 'DDDDDD', 'DxxxxD', 'DxxKxD', 'DDDDDD'],
  star: ['..O...', '.OGO..', 'OGyGO.', '.OGO..', '..O...', '......'],
  cash: ['..OO..', '.OGGO.', 'OGyKGO', 'OGKyGO', '.OGGO.', '..OO..'],
  percent: ['xx..D.', 'xx.D..', '..D...', '.D..xx', 'D...xx', '......'],
  question: ['.EPPE.', 'EP..PE', '...PE.', '..PE..', '......', '..PE..'],
  spark: ['..1...', '1.3.1.', '.343..', '13531.', '.343..', '..1...'],
};

/** The overlay ids a `SceneSpec` may use. */
export const MOBILE_KIT_OVERLAYS = Object.keys(OVERLAYS);

/** The reserved corner, in the one place both the compositor and the pin can read it from. */
export const OVERLAY_REGION = { x: 0, y: 0, w: 6, h: 6 } as const;

const applyOverlay = (rows: string[], overlay?: string): string[] => {
  const art = overlay ? OVERLAYS[overlay] : undefined;
  return art ? stamp(rows, art, OVERLAY_REGION.x, OVERLAY_REGION.y) : rows;
};

/* ── THE ARCHETYPES ──────────────────────────────────────────────────────────────────────────── */

const a = (
  id: string,
  name: string,
  tags: string[],
  blurb: string,
  rows: string[],
  anim?: { frameMs: number; frames: string[][] },
): PixelSprite => ({ id, name, tags, blurb, rows, ...anim });

/* 1. GROWTH OVER TIME. Five bars and nothing else: an axis, and money getting taller. The bars
 *    build left to right, which is the only animation in the kit that needed no persuading -- a
 *    chart drawing itself is what a chart looks like when it is being explained. */
const GROWTH_ROWS = [
  ...blank(4),
  '.............qq.',
  '.............PP.',
  '..........qq.PP.',
  '..........PP.PP.',
  '.......qq.PP.PP.',
  '.......PP.PP.PP.',
  '....qq.PP.PP.PP.',
  '....PP.PP.PP.PP.',
  '.qq.PP.PP.PP.PP.',
  '.PP.PP.PP.PP.PP.',
  '.PP.PP.PP.PP.PP.',
  '.EEEEEEEEEEEEEE.',
];
const GROWTH_MASK = [
  ...blank(4),
  '.............55.',
  '.............55.',
  '..........44.55.',
  '..........44.55.',
  '.......33.44.55.',
  '.......33.44.55.',
  '....22.33.44.55.',
  '....22.33.44.55.',
  '.11.22.33.44.55.',
  '.11.22.33.44.55.',
  '.11.22.33.44.55.',
  '................',
];
export const mkGrowthCurve = a(
  'growth', 'Growth over time', ['growth', 'compounding', 'returns', 'chart'],
  'Money getting taller, period by period.',
  GROWTH_ROWS,
  { frameMs: 160, frames: [1, 2, 3, 4, 5].map((n) => grow(GROWTH_ROWS, GROWTH_MASK, n)) },
);

/* 2. COMPOUNDING, and the contract is what caught this. The first version was a stack of coins
 *    building one equal disc at a time, which is ADDITION drawn convincingly. archetypes.ts asks
 *    for "returns earning returns, growth that accelerates rather than adding", and a stack of
 *    identical coins says the opposite of that no matter how well it is shaded. So it is an
 *    exponential curve with the area filled: flat enough at the left to look like nothing is
 *    happening, which is the part of compounding people give up during.
 *
 *    It is deliberately NOT the same picture as `growth`. Growth is discrete bars, one per period,
 *    rising steadily. Compound is one continuous curve whose SLOPE changes. Side by side on two
 *    cards of the same deck those read as different claims, which is the entire job. */
const COMPOUND_ROWS = [
  ...blank(3),
  '..............q.',
  '..............P.',
  '.............qP.',
  '.............PP.',
  '............qPP.',
  '............PPP.',
  '...........qPPP.',
  '..........qPPPP.',
  '.........qPPPPP.',
  '.......qqPPPPPP.',
  '....qqqPPPPPPPP.',
  '.qqqPPPPPPPPPPP.',
  '.EEEEEEEEEEEEEE.',
];
const COMPOUND_MASK = [
  ...blank(3),
  '..............5.',
  '..............5.',
  '.............55.',
  '.............55.',
  '............455.',
  '............455.',
  '...........4455.',
  '..........44455.',
  '.........344455.',
  '.......33344455.',
  '....22233344455.',
  '.111222333444455',
  '................',
];
export const mkCompound = a(
  'compound', 'Compounding', ['compounding', 'exponential', 'snowball', 'reinvest'],
  'Returns that earn returns of their own.',
  COMPOUND_ROWS,
  { frameMs: 160, frames: [1, 2, 3, 4, 5].map((n) => grow(COMPOUND_ROWS, COMPOUND_MASK, n)) },
);

/* 3. A TRADEOFF. The beam genuinely tips, and this is one of the three sprites whose frames are
 *    written out rather than derived: no substitution or row swap can rotate a bar, and faking it
 *    by lighting one pan brighter read as "this one is selected", not as "this one is heavier". */
const SCALE_LEVEL = [
  ...blank(5),
  '.......qq.......',
  '.PPPPPPPPPPPPPP.',
  '..E....DD....E..',
  '.EqqE..DD..EqqE.',
  '.EEEE..DD..EEEE.',
  '.......DD.......',
  '.......DD.......',
  '.......DD.......',
  '.......DD.......',
  '....EEEEEEEE....',
  '...EEEEEEEEEE...',
];
const SCALE_LEFT = [
  ...blank(5),
  '.......qq.......',
  '.....PPPPPPPPPP.',
  '.PPPP..DD..EqqE.',
  '..E....DD..EEEE.',
  '.EqqE..DD.......',
  '.EEEE..DD.......',
  '.......DD.......',
  '.......DD.......',
  '.......DD.......',
  '....EEEEEEEE....',
  '...EEEEEEEEEE...',
];
const SCALE_RIGHT = [
  ...blank(5),
  '.......qq.......',
  '.PPPPPPPPPP.....',
  '.EqqE..DD..PPPP.',
  '.EEEE..DD....E..',
  '.......DD..EqqE.',
  '.......DD..EEEE.',
  '.......DD.......',
  '.......DD.......',
  '.......DD.......',
  '....EEEEEEEE....',
  '...EEEEEEEEEE...',
];
export const mkBalanceScale = a(
  'tradeoff', 'A tradeoff', ['tradeoff', 'balance', 'compare', 'risk'],
  'Two things weighed against each other.',
  SCALE_LEVEL,
  { frameMs: 240, frames: [SCALE_LEVEL, SCALE_LEFT, SCALE_LEVEL, SCALE_RIGHT] },
);

/* 4. A SPLIT. One whole in four parts, drawn on the four steps of the accent ramp rather than in
 *    four different hues, so an allocation stays one idea instead of becoming a colour key. */
const RING_ROWS = [
  ...blank(6),
  '......qqPP......',
  '....qqqqPPPP....',
  '...qqqqqPPPPP...',
  '...qq......PP...',
  '...qq......PP...',
  '...EE......pp...',
  '...EE......pp...',
  '...EEEEEppppp...',
  '....EEEEpppp....',
  '......EEpp......',
];
const RING_MASK = [
  ...blank(6),
  '......1122......',
  '....11112222....',
  '...1111122222...',
  '...11......22...',
  '...11......22...',
  '...44......33...',
  '...44......33...',
  '...4444433333...',
  '....44443333....',
  '......4433......',
];
export const mkAllocationRing = a(
  'split', 'A split', ['allocation', 'split', 'portfolio', 'percentage'],
  'One whole, divided into parts.',
  RING_ROWS,
  { frameMs: 200, frames: [1, 2, 3, 4].map((n) => grow(RING_ROWS, RING_MASK, n)) },
);

/* 5. A CYCLE. Same ring geometry as the split on purpose -- a cycle IS a closed loop -- but the
 *    frames chase a lit segment round it instead of building it, which is the whole difference
 *    between "these are the parts" and "this comes back around". */
const CYCLE_ROWS = [
  ...blank(6),
  '......PPPP......',
  '....PPPPPPPP....',
  '...PPPPPPPPPP...',
  '...PP......PP...',
  '...PP......PP...',
  '...PP......PP...',
  '...PP......PP...',
  '...PPPPPPPPPP...',
  '....PPPPPPPP....',
  '......PPPP......',
];
const CYCLE_MASK = [
  ...blank(6),
  '......4411......',
  '....44441111....',
  '...4444411111...',
  '...44......11...',
  '...44......11...',
  '...33......22...',
  '...33......22...',
  '...3333322222...',
  '....33332222....',
  '......3322......',
];
export const mkCycleLoop = a(
  'cycle', 'A cycle', ['cycle', 'loop', 'recurring', 'repeat'],
  'It comes back around.',
  CYCLE_ROWS,
  { frameMs: 140, frames: [1, 2, 3, 4].map((n) => highlight(CYCLE_ROWS, CYCLE_MASK, n, 'q', 'P')) },
);

/* 6. A LEAK. The bucket loses a drop, the water line falls, and the next drop starts. Four frames
 *    because three read as a dripping tap and five read as rain. */
const LEAK_BASE = [
  ...blank(6),
  '..EEEEEEEEEEEE..',
  '..EqqqqqqqqqqE..',
  '..EPPPPPPPPPPE..',
  '..EPPPPPPPPPPE..',
  '..EPPPPPPPPPPE..',
  '..EPPPPPPPPPPE..',
  '..EPPPPPPPPPPE..',
  '..EEEEE..EEEEE..',
  '.......PP.......',
  '................',
];
const LEAK_LOW = rowsWith(LEAK_BASE, {
  7: '..E..........E..',
  8: '..EqqqqqqqqqqE..',
});
export const mkLeakBucket = a(
  'leak', 'A leak', ['leak', 'loss', 'drain', 'erosion'],
  'Value going out of the bottom.',
  LEAK_BASE,
  {
    frameMs: 200,
    frames: [
      LEAK_BASE,
      rowsWith(LEAK_BASE, { 14: '................', 15: '.......PP.......' }),
      rowsWith(LEAK_LOW, { 14: '................', 15: '................' }),
      rowsWith(LEAK_LOW, { 14: '.......PP.......', 15: '................' }),
    ],
  },
);

/* 7. PROTECTION. A shield that takes the hit. The spark arrives from outside the frame and is gone
 *    by the last frame; the rim flashing on impact is what makes it read as ABSORBED rather than
 *    as something landing on top of the shield. */
const SHIELD_ROWS = [
  ...blank(6),
  '...EEEEEEEEEE...',
  '...EqqqqqqqqE...',
  '...EqPPPPPPqE...',
  '...EqPPPPPPqE...',
  '...EqPPPPPPqE...',
  '....EPPPPPPE....',
  '....EPPPPPPE....',
  '.....EPPPPE.....',
  '......EPPE......',
  '.......EE.......',
];
const SPARK_SMALL = ['3', '4'];
export const mkShieldGuard = a(
  'shield', 'Protection', ['insurance', 'protection', 'shield', 'safety'],
  'Something takes the hit for you.',
  SHIELD_ROWS,
  {
    frameMs: 160,
    frames: [
      stamp(SHIELD_ROWS, SPARK_SMALL, 13, 1),
      stamp(SHIELD_ROWS, SPARK_SMALL, 12, 4),
      shade(SHIELD_ROWS, { q: 'w' }),
      stamp(SHIELD_ROWS, SPARK_SMALL, 14, 2),
    ],
  },
);

/* 8. A GAP. Two columns and the distance between their tops, ticked off like a ruler. The ticks
 *    march down over three frames because a static dashed line reads as a border. */
const GAP_ROWS = [
  ...blank(6),
  '..PPPPP..xxxxx..',
  '..PPPPP....x....',
  '..PPPPP.........',
  '..PPPPP....x....',
  '..PPPPP.........',
  '..PPPPP..ppppp..',
  '..PPPPP..ppppp..',
  '..PPPPP..ppppp..',
  '..PPPPP..ppppp..',
  '..PPPPP..ppppp..',
];
const GAP_TICK = '..PPPPP....x....';
const GAP_BARE = '..PPPPP.........';
export const mkGapBars = a(
  'gap', 'A gap', ['gap', 'difference', 'shortfall', 'compare'],
  'The distance between where you are and where you meant to be.',
  GAP_ROWS,
  {
    frameMs: 220,
    frames: [
      GAP_ROWS,
      rowsWith(GAP_ROWS, { 7: GAP_BARE, 8: GAP_TICK, 9: GAP_BARE, 10: GAP_TICK }),
      rowsWith(GAP_ROWS, { 7: GAP_TICK, 8: GAP_TICK, 9: GAP_TICK, 10: GAP_TICK }),
    ],
  },
);

/* 9. A THRESHOLD. A marker climbing a track and crossing a dashed line, which flashes as it goes
 *    over. The line is drawn in neutral x rather than on the accent ramp: the threshold is a fact
 *    about the world, not the subject of the picture. */
const THRESH_BG = [
  ...blank(8),
  '.x.x.x.x.x.x.x..',
  '.......DD.......',
  '.......DD.......',
  '.......DD.......',
  '.......DD.......',
  '.......DD.......',
  '.......DD.......',
  '.......DD.......',
];
const THRESH_MARK = ['EqqE', 'EPPE', 'EEEE'];
const THRESH_LIT = rowsWith(THRESH_BG, { 8: '.q.q.q.q.q.q.q..' });
const THRESH_ROWS = stamp(THRESH_BG, THRESH_MARK, 6, 7);
export const mkThresholdLine = a(
  'threshold', 'A threshold', ['threshold', 'trigger', 'bracket', 'limit'],
  'The point where the rule changes.',
  THRESH_ROWS,
  {
    frameMs: 180,
    frames: [
      stamp(THRESH_BG, THRESH_MARK, 6, 13),
      stamp(THRESH_BG, THRESH_MARK, 6, 10),
      THRESH_ROWS,
      stamp(THRESH_LIT, THRESH_MARK, 6, 5),
    ],
  },
);

/* 10. A QUEUE. Three figures and a window. They advance one column a frame, which is the cheapest
 *     motion in the kit and the one that reads most immediately as TIME PASSING rather than as a
 *     diagram of a queue. */
const PERSON = ['.q.', 'EPE', '.P.', 'E.E'];
const QUEUE_BG = [
  ...blank(7),
  '.............EE.',
  '.............Eq.',
  '.............Eq.',
  '.............Eq.',
  '.............EE.',
  '.DDDDDDDDDDDDDD.',
  ...blank(3),
];
const queueAt = (offset: number) =>
  [1, 5, 9].reduce((acc, x) => stamp(acc, PERSON, x + offset, 8), QUEUE_BG);
export const mkQueueLine = a(
  'sequence', 'A queue', ['queue', 'order', 'sequence', 'waiting'],
  'Your turn comes when the ones in front are done.',
  queueAt(0),
  { frameMs: 200, frames: [queueAt(0), queueAt(1), queueAt(2), queueAt(0)] },
);

/* 11. DIVERSIFICATION. One source, three destinations, and the streams fill in from the top so the
 *     eye follows the split rather than being shown its result. */
const SPREAD_ROWS = [
  ...blank(2),
  '......EPPE......',
  '......PqqP......',
  '......EPPE......',
  '......pppp......',
  '.....p.pp.p.....',
  '....p..pp..p....',
  '...p...pp...p...',
  '..p....pp....p..',
  '.p.....pp.....p.',
  '.p.....pp.....p.',
  'EEEE..EEEE..EEEE',
  'EqqE..EqqE..EqqE',
  'EPPE..EPPE..EPPE',
  'EEEE..EEEE..EEEE',
];
const SPREAD_MASK = [
  ...blank(5),
  '......1111......',
  '.....2.22.2.....',
  '....2..22..2....',
  '...3...33...3...',
  '..3....33....3..',
  '.4.....44.....4.',
  '.4.....44.....4.',
  '................',
  '.55....55....55.',
  '.55....55....55.',
  '................',
];
export const mkSpreadSeeds = a(
  'spread', 'Spreading it out', ['diversification', 'spread', 'allocation', 'baskets'],
  'Not all of it in one place.',
  SPREAD_ROWS,
  { frameMs: 150, frames: [1, 2, 3, 4, 5].map((n) => grow(SPREAD_ROWS, SPREAD_MASK, n)) },
);

/* 12. CONCENTRATION. One pillar under a slab that is much wider than it is. The slab rocks a
 *     column left and right rather than the pillar bending, because a bending pillar reads as
 *     flexible and the point is that it is not. */
const PILLAR_ROWS = [
  ...blank(6),
  '..EEEEEEEEEEEE..',
  '..EqqqqqqqqqqE..',
  '..EPPPPPPPPPPE..',
  '..EEEEEEEEEEEE..',
  '.......pp.......',
  '.......pp.......',
  '.......pp.......',
  '.......pp.......',
  '....DDDDDDDD....',
  '...DDDDDDDDDD...',
];
const pillarLean = (dx: -1 | 0 | 1) => {
  if (dx === 0) return PILLAR_ROWS;
  const pad = dx < 0 ? ['.', '...'] : ['...', '.'];
  return rowsWith(PILLAR_ROWS, {
    6: `${pad[0]}EEEEEEEEEEEE${pad[1]}`,
    7: `${pad[0]}EqqqqqqqqqqE${pad[1]}`,
    8: `${pad[0]}EPPPPPPPPPPE${pad[1]}`,
    9: `${pad[0]}EEEEEEEEEEEE${pad[1]}`,
  });
};
export const mkSinglePillar = a(
  'concentrate', 'One point of failure', ['concentration', 'risk', 'single', 'fragile'],
  'Everything resting on one thing.',
  PILLAR_ROWS,
  { frameMs: 220, frames: [pillarLean(0), pillarLean(1), pillarLean(0), pillarLean(-1)] },
);

/* 13. DEBT. A weight on a chain. The weight swings and the chain does not, which is deliberate:
 *     the chain is the OBLIGATION and it is the fixed thing in the picture. */
const DEBT_ROWS = [
  ...blank(5),
  '.......XX.......',
  '.......xx.......',
  '.......XX.......',
  '.......xx.......',
  '.......XX.......',
  '.......xx.......',
  '....EEEEEEEE....',
  '...EqqqqqqqqE...',
  '...EPPPPPPPPE...',
  '...EPPPPPPPPE...',
  '...EEEEEEEEEE...',
];
const debtSwing = (dx: -1 | 0 | 1) => {
  if (dx === 0) return DEBT_ROWS;
  const [l, r] = dx < 0 ? [2, 4] : [4, 2];
  const pad = (n: number) => '.'.repeat(n);
  return rowsWith(DEBT_ROWS, {
    11: `${pad(l + 1)}EEEEEEEE${pad(r + 1)}`,
    12: `${pad(l)}EqqqqqqqqE${pad(r)}`,
    13: `${pad(l)}EPPPPPPPPE${pad(r)}`,
    14: `${pad(l)}EPPPPPPPPE${pad(r)}`,
    15: `${pad(l)}EEEEEEEEEE${pad(r)}`,
  });
};
export const mkDebtChain = a(
  'debt', 'An obligation', ['debt', 'loan', 'obligation', 'burden'],
  'Something you are carrying until it is paid.',
  DEBT_ROWS,
  { frameMs: 260, frames: [debtSwing(0), debtSwing(1), debtSwing(0), debtSwing(-1)] },
);

/* 14. INCOME ARRIVING. A coin falls into a jar and the level goes up by one row. The coin is gold
 *     and NOT on the accent ramp, so income stays money-coloured whatever the card is tinted. */
const JAR_ROWS = [
  ...blank(8),
  '...EEEEEEEEEE...',
  '...E........E...',
  '...E........E...',
  '...E........E...',
  '...E........E...',
  '...EPPPPPPPPE...',
  '...EPPPPPPPPE...',
  '...EEEEEEEEEE...',
];
const FALLING_COIN = ['yy', 'GG'];
export const mkIncomeDrop = a(
  'income', 'Income arriving', ['income', 'deposit', 'paycheck', 'saving'],
  'Money turning up and staying there.',
  JAR_ROWS,
  {
    frameMs: 170,
    frames: [
      stamp(JAR_ROWS, FALLING_COIN, 7, 1),
      stamp(JAR_ROWS, FALLING_COIN, 7, 5),
      stamp(JAR_ROWS, FALLING_COIN, 7, 9),
      rowsWith(JAR_ROWS, { 12: '...EPPPPPPPPE...' }),
    ],
  },
);

/* 15. A DECISION. One path, two ways up. The frames alternate which branch is lit with a neutral
 *     beat between them, so it reads as a question rather than as an answer. */
const FORK_ROWS = [
  ...blank(6),
  '..qq........qq..',
  '..PP........PP..',
  '...PP......PP...',
  '....PP....PP....',
  '.....PP..PP.....',
  '......PPPP......',
  '.......PP.......',
  '.......PP.......',
  '.......PP.......',
  '.......PP.......',
];
const FORK_MASK = [
  ...blank(6),
  '..11........22..',
  '..11........22..',
  '...11......22...',
  '....11....22....',
  '.....11..22.....',
  ...blank(5),
];
export const mkForkPath = a(
  'fork', 'A decision', ['decision', 'choice', 'fork', 'options'],
  'Two ways to go from the same place.',
  FORK_ROWS,
  {
    frameMs: 260,
    frames: [0, 1, 0, 2].map((n) => highlight(FORK_ROWS, FORK_MASK, n, 'q', 'P')),
  },
);

/* 16. VOLATILITY. Candles, and the second of the three hand-written sets. Swapping which candle is
 *     lit was the cheap version and it read as a chart being HOVERED. The bars have to actually
 *     change height or the idea is not in the picture at all. */
const VOL_A = [
  ...blank(6),
  '....D........PP.',
  '....PP....D..PP.',
  '.D..PP....PP.PP.',
  '.D..PP.D..PP.PP.',
  '.PP.PP.D..PP.D..',
  '.PP.D..PP.PP....',
  '.PP....PP.D.....',
  '.PP....PP.......',
  '.D.....PP.......',
  '.DDDDDDDDDDDDDD.',
];
const VOL_B = rowsWith(VOL_A, {
  8: '.PP.PP....PP.PP.',
  9: '.PP.PP.D..PP.PP.',
  12: '.D.....PP.D.....',
  13: '.......PP.......',
  14: '.......PP.......',
});
const VOL_C = rowsWith(VOL_A, {
  6: '....D...........',
  7: '....PP....D.....',
  10: '.PP.PP.D..PP.PP.',
  11: '.PP.D..PP.PP.PP.',
  12: '.PP....PP.D..D..',
});
export const mkVolatilityWave = a(
  'swing', 'Swings', ['volatility', 'risk', 'swings', 'market'],
  'The same asset, on a good day and a bad one.',
  VOL_A,
  { frameMs: 200, frames: [VOL_A, VOL_B, VOL_C, VOL_B] },
);

/* 17. PATIENCE. The top bulb drains a band at a time and the bottom gains one. Drawn as a real
 *     hourglass rather than a clock face because a clock says WHAT TIME and this has to say HOW
 *     LONG, which is a different sentence. */
const GLASS_ROWS = [
  ...blank(6),
  '..EEEEEEEEEEEE..',
  '..EqqqqqqqqqqE..',
  '...EqqqqqqqqE...',
  '....EqqqqqqE....',
  '.....EqqqqE.....',
  '.......qq.......',
  '.....E....E.....',
  '....E.PPPP.E....',
  '...EPPPPPPPPE...',
  '..EEEEEEEEEEEE..',
];
const GLASS_MASK = [
  ...blank(7),
  '...1111111111...',
  '....22222222....',
  '.....333333.....',
  '......4444......',
  ...blank(5),
];
const glassAt = (n: number) => {
  const drained = erase(GLASS_ROWS, GLASS_MASK, n);
  return n >= 3 ? rowsWith(drained, { 12: '.....EPPPPE.....' }) : drained;
};
export const mkPatienceGlass = a(
  'patience', 'Time passing', ['patience', 'time', 'horizon', 'waiting'],
  'The slow part, which is most of it.',
  GLASS_ROWS,
  { frameMs: 220, frames: [glassAt(1), glassAt(2), glassAt(3), glassAt(4)] },
);

/* 18. A FEE. A bar of value with a bite taken out of the top right corner, a step at a time. The
 *     bite is painted in RED and not erased: a fee does not make value disappear, it moves it to
 *     someone else, and showing the missing piece is the only way a still frame can say that. */
const FEE_ROWS = [
  ...blank(6),
  '...qqqqqqqqqq...',
  '...PPPPPPPPPP...',
  '...PPPPPPPPPP...',
  '...PPPPPPPPPP...',
  '...PPPPPPPPPP...',
  '...PPPPPPPPPP...',
  '...PPPPPPPPPP...',
  '...PPPPPPPPPP...',
  '...PPPPPPPPPP...',
  '...EEEEEEEEEE...',
];
const FEE_MASK = [
  ...blank(6),
  '........11111...',
  '.........2222...',
  '..........333...',
  '...........44...',
  ...blank(6),
];
export const mkFeeBite = a(
  'fee', 'A fee', ['fee', 'cost', 'expense', 'drag'],
  'A small slice, taken every time.',
  FEE_ROWS,
  { frameMs: 200, frames: [0, 1, 2, 3, 4].map((n) => paint(FEE_ROWS, FEE_MASK, n, 'r')) },
);

/* 19. THE MARKET. Six figures in two ranks. They bob out of step with each other, which is what
 *     makes a crowd read as a crowd; bobbing them together makes it read as a chorus line.
 *
 *     THE RANKS NEED FOUR ROWS OF CLEARANCE, not the two the first version gave them. A figure is
 *     four rows tall, so ranks at 6 and 10 overlap the moment the back one bobs to 7: its legs and
 *     the front rank's heads land on the same row and the frame renders as a band of noise rather
 *     than as people. Ranks at 6/7 and 11/12 never touch at any phase. The back rank cannot go
 *     higher to buy the room, because at y5 the leftmost figure would be standing in the reserved
 *     overlay corner. */
const CROWD_BG = [
  ...blank(15),
  '.DDDDDDDDDDDDDD.',
];
const crowdAt = (back: number, front: number) => {
  const withBack = [0, 5, 10].reduce((acc, x) => stamp(acc, PERSON, x, back), CROWD_BG);
  return [2, 7, 12].reduce((acc, x) => stamp(acc, PERSON, x, front), withBack);
};
export const mkMarketCrowd = a(
  'crowd', 'The market', ['market', 'crowd', 'herd', 'participants'],
  'Everyone else, deciding at the same time.',
  crowdAt(6, 11),
  { frameMs: 240, frames: [crowdAt(6, 11), crowdAt(7, 11), crowdAt(7, 12), crowdAt(6, 12)] },
);

/* 20. SCALE. A fixed small square and one that grows past it. Both start the same size in frame
 *     one, which is the only way the growth reads as a COMPARISON rather than as an animation. */
const SCALE_ROWS = [
  ...blank(6),
  '......qqqqqqqqq.',
  '......PPPPPPPPP.',
  '......PPPPPPPPP.',
  '......PPPPPPPPP.',
  '......PPPPPPPPP.',
  '......PPPPPPPPP.',
  '.qqqq.PPPPPPPPP.',
  '.PPPP.PPPPPPPPP.',
  '.PPPP.PPPPPPPPP.',
  '.EEEE.EEEEEEEEE.',
];
const SCALE_MASK = [
  ...blank(6),
  '......444444444.',
  '......444444444.',
  '......333333333.',
  '......333333333.',
  '......222222222.',
  '......222222222.',
  ...blank(4),
];
export const mkScaleCompare = a(
  'scale', 'Scale', ['scale', 'magnitude', 'size', 'compare'],
  'How much bigger one number is than another.',
  SCALE_ROWS,
  { frameMs: 190, frames: [1, 2, 3, 4].map((n) => grow(SCALE_ROWS, SCALE_MASK, n)) },
);

/* 21. AN ANCHOR. A post with a tag hanging off it. The tag is the number you saw first and cannot
 *     stop comparing to; the post is neutral D because the anchor is not the subject, it is the
 *     thing the subject keeps getting measured against. */
const ANCHOR_ROWS = [
  ...blank(6),
  '.......qq.......',
  '..EEEEEqq.......',
  '..EPPPEqq.......',
  '..EPPPEqq.......',
  '..EEEEEqq.......',
  '.......pp.......',
  '.......pp.......',
  '.......pp.......',
  '....DDDDDDDD....',
  '...DDDDDDDDDD...',
];
const ANCHOR_LOW = rowsWith(ANCHOR_ROWS, {
  7: '.......qq.......',
  8: '..EEEEEqq.......',
  9: '..EPPPEqq.......',
  10: '..EPPPEqq.......',
  11: '..EEEEEpp.......',
});
export const mkAnchorWeight = a(
  'anchor', 'An anchor', ['anchoring', 'reference', 'bias', 'price'],
  'The first number you saw, still hanging around.',
  ANCHOR_ROWS,
  { frameMs: 260, frames: [ANCHOR_ROWS, ANCHOR_LOW, ANCHOR_ROWS] },
);

/* SPARE, NOT ON THE CONTRACT. Two outcomes from one choice: both arms drawn from the same origin,
 *  extending together column group by column group, so the picture says the gap WIDENS with time
 *  rather than showing a finished fan the learner has to interpret.
 *
 *  archetypes.ts has no id for it, and MOBILE_KIT must match that list exactly or the pin fails,
 *  so it is exported and NOT registered. It stays because a hand-written deck in overrides.ts can
 *  still name the sprite directly, and because redrawing art is the expensive part. It is pinned
 *  with the rest: unchecked art in a checked file is how a broken sprite survives. */
const BRANCH_ROWS = [
  ...blank(5),
  '............qqq.',
  '.........qqq....',
  '.......qq.......',
  '.....qq.........',
  '...qq...........',
  '.qq.............',
  '...pp...........',
  '.....pp.........',
  '.......pp.......',
  '.........ppp....',
  '............ppp.',
];
const BRANCH_MASK = [
  ...blank(5),
  '............555.',
  '.........444....',
  '.......33.......',
  '.....23.........',
  '...22...........',
  '.11.............',
  '...22...........',
  '.....23.........',
  '.......33.......',
  '.........444....',
  '............555.',
];
export const mkMirrorBranch = a(
  'mirror-branch', 'Two outcomes', ['compounding', 'regret', 'divergence', 'outcomes'],
  'The same decision, run forward both ways.',
  BRANCH_ROWS,
  { frameMs: 150, frames: [1, 2, 3, 4, 5].map((n) => grow(BRANCH_ROWS, BRANCH_MASK, n)) },
);

/* 23. LIQUIDITY. A tap over a pool. The stream builds downward, so a paused frame shows a tap that
 *     has not reached the pool yet, which is what illiquid looks like. */
const FLOW_ROWS = [
  ...blank(6),
  '.......EEEEEEE..',
  '.......EPPPPPE..',
  '.......E..EEEE..',
  '........qq......',
  '........qq......',
  '........qq......',
  '........qq......',
  '..qqqqqqqqqqqq..',
  '.PPPPPPPPPPPPPP.',
  '.EEEEEEEEEEEEEE.',
];
const FLOW_MASK = [
  ...blank(9),
  '........11......',
  '........22......',
  '........33......',
  '........44......',
  ...blank(3),
];
export const mkLiquidFlow = a(
  'liquidity', 'Liquidity', ['liquidity', 'cash', 'access', 'flow'],
  'How fast you can actually get at it.',
  FLOW_ROWS,
  { frameMs: 140, frames: [1, 2, 3, 4].map((n) => grow(FLOW_ROWS, FLOW_MASK, n)) },
);

/* 24. HITTING THE TARGET. The dart comes in over three frames and the bullseye flashes on the
 *     fourth. The rings are on the accent ramp and the centre is red on every accent, because the
 *     centre has to stay findable when the card is tinted green or gold. */
const TARGET_ROWS = [
  ...blank(6),
  '......PPPP......',
  '....PPPPPPPP....',
  '...PPP....PPP...',
  '...PP.qqqq.PP...',
  '...PP.qRRq.PP...',
  '...PP.qRRq.PP...',
  '...PP.qqqq.PP...',
  '...PPP....PPP...',
  '....PPPPPPPP....',
  '......PPPP......',
];
const DART = ['..w', '.w.', 'W..'];
export const mkTargetHit = a(
  'target', 'Hitting the target', ['goal', 'target', 'hit', 'plan'],
  'The number you were aiming at.',
  TARGET_ROWS,
  {
    frameMs: 150,
    frames: [
      stamp(TARGET_ROWS, DART, 12, 0),
      stamp(TARGET_ROWS, DART, 11, 2),
      stamp(TARGET_ROWS, DART, 10, 4),
      shade(TARGET_ROWS, { R: 's' }),
    ],
  },
);

/* 24. A RULE THAT HOLDS. A document with ruled lines and a seal coming down on it. The page is on
 *     the accent ramp and not in neutral white, because a tax rule, a contract and a regulation are
 *     the same picture in three tints and that is exactly what the accent slot is for.
 *
 *     The seal is gold and stays gold whatever the accent: it is the thing that makes the rule
 *     binding, so a seal that changed colour with the page would read as decoration.
 *
 *     THE SEAL LANDS INSIDE THE MARGIN (x 8..10), not at the corner where a real stamp would sit.
 *     At the corner it overwrote the border column, and for the two frames the seal was on the page
 *     the document lost its right edge and read as a rendering fault rather than as a stamp. */
const DOC_ROWS = [
  ...blank(6),
  '...EEEEEEEEEE...',
  '...EqqqqqqqqE...',
  '...EqPPPPPPqE...',
  '...EqqqqqqqqE...',
  '...EqPPPPPPqE...',
  '...EqqqqqqqqE...',
  '...EqPPPPqqqE...',
  '...EqqqqqqqqE...',
  '...EqqqqqqqqE...',
  '...EEEEEEEEEE...',
];
const SEAL = ['OGO', 'GyG', 'OGO'];
const RULEBOOK_ROWS = stamp(DOC_ROWS, SEAL, 8, 11);
export const mkRulebook = a(
  'rulebook', 'A rule that holds', ['rule', 'tax', 'regulation', 'contract', 'policy'],
  'A constraint that applies whether you like it or not.',
  RULEBOOK_ROWS,
  {
    frameMs: 160,
    frames: [
      stamp(DOC_ROWS, SEAL, 8, 2),
      // ...and then straight to the page INTERIOR. The obvious in-between at y6 puts the seal
      // across the document's top border, which erases the border for that frame and reads as a
      // rendering fault rather than as a stamp descending. Same failure as the corner placement
      // above, found the same way: by looking at the frames instead of at the row counts.
      stamp(DOC_ROWS, SEAL, 8, 8),
      RULEBOOK_ROWS,
      shade(RULEBOOK_ROWS, { G: 'y', O: 'G' }),
    ],
  },
);

/* ── THE REGISTRY AND THE COMPOSITOR ─────────────────────────────────────────────────────────── */

/**
 * Every archetype, keyed by the EXACT id a `SceneSpec.archetype` names.
 *
 * THE KEYS ARE THE CONTRACT, and they come from `src/lib/mobile-lesson/archetypes.ts`. They are not
 * descriptive art names. `composeScene` does `MOBILE_KIT[spec.archetype]` and returns null when it
 * misses, and `PixelScene` renders null on a null sprite, so a key that does not match what
 * `pickArchetype()` returns is a hole in every card rather than an error anybody sees.
 *
 * That is not hypothetical: this map first shipped keyed by art names ('growth-curve'), while the
 * deriver was asking for concepts ('growth'). All 1,681 scenes in the product resolved to nothing,
 * and both halves looked correct in isolation. `scripts/mobile-deck-audit.mjs` now checks every
 * scene a deck asks for against the ids in this object, which is the check that catches it.
 *
 * The descriptive names live on each sprite's `name` field and in the `mk*` export names, where
 * they belong.
 */
export const MOBILE_KIT: Record<string, PixelSprite> = {
  growth: mkGrowthCurve,
  compound: mkCompound,
  tradeoff: mkBalanceScale,
  split: mkAllocationRing,
  cycle: mkCycleLoop,
  leak: mkLeakBucket,
  shield: mkShieldGuard,
  gap: mkGapBars,
  threshold: mkThresholdLine,
  sequence: mkQueueLine,
  spread: mkSpreadSeeds,
  concentrate: mkSinglePillar,
  debt: mkDebtChain,
  income: mkIncomeDrop,
  fork: mkForkPath,
  swing: mkVolatilityWave,
  patience: mkPatienceGlass,
  fee: mkFeeBite,
  crowd: mkMarketCrowd,
  scale: mkScaleCompare,
  anchor: mkAnchorWeight,
  liquidity: mkLiquidFlow,
  target: mkTargetHit,
  /*
   * `rulebook` now has art of its own and no longer borrows the threshold line.
   *
   * It was aliased to `threshold` because it is picked for every tax, regulation, contract and
   * policy lesson, 89 scenes, and leaving it unmapped would blank all of them. That was an honest
   * stand-in, not a random one, but it was still 89 scenes wearing another archetype's picture.
   * The accent special case in derive.ts that was keeping them visually apart from the real
   * threshold scenes can now go: a document with a seal is already not a dashed line.
   */
  rulebook: mkRulebook,
};

/** The archetype ids a `SceneSpec` may name. */
/**
 * The same 24 sprites as a list, mirroring PIXEL_SPRITES / SPRITES_BY_ID in sprites.ts.
 *
 * WHY `MOBILE_KIT` IS STILL THE KEYED OBJECT AND THE ARRAY GOT A DIFFERENT NAME. The brief asked
 * for `MOBILE_KIT: PixelSprite[]` plus a by-id map. Doing that literally breaks a consumer that
 * already exists: `scripts/mobile-deck-audit.mjs` builds its known-id set from
 * `Object.keys(kit.MOBILE_KIT)`, which on an array is "0".."23", so every scene in the product
 * would be reported as having no art. The capability asked for is here under both names; flipping
 * which one is called MOBILE_KIT is a one-line change on both sides and should happen in the same
 * commit as that audit line, not before it.
 */
export const MOBILE_KIT_SPRITES: PixelSprite[] = Object.values(MOBILE_KIT);

/** The by-id lookup, under the name the contract names it. Same object, not a copy. */
export const MOBILE_KIT_BY_ID: Record<string, PixelSprite> = MOBILE_KIT;

/** The archetype ids a `SceneSpec` may name. Asserted equal to ARCHETYPES by the pin. */
export const MOBILE_KIT_ARCHETYPES = Object.keys(MOBILE_KIT);

/**
 * Drawn art that no archetype id maps to. Exported so a hand-written deck can name it, and listed
 * here so the pin still runs every geometry check over it: unchecked art inside a checked file is
 * how a broken sprite survives a green build.
 */
export const MOBILE_KIT_SPARES: PixelSprite[] = [mkMirrorBranch];

/**
 * The variant cache.
 *
 * IDENTITY IS THE POINT, not the arithmetic. PixelSpriteView memoises on `a.sprite === b.sprite`
 * and compile.ts caches its mesh in a WeakMap keyed by the sprite OBJECT, so returning a freshly
 * built sprite each render would defeat both: every card would re-mesh its art on every parent
 * render, which is the exact defect the renderer's own docstring records measuring at mean 29
 * rects a sprite across twenty sprites on Home. Substituting four characters is cheap; being a
 * new object is not.
 */
const variants = new Map<string, PixelSprite>();

/**
 * Turns a scene spec into a renderable sprite: the named archetype, recoloured onto the accent
 * ramp, with the overlay mark stamped into the reserved top-left corner.
 *
 * Returns null for an archetype this kit does not have, which is how the rest of the pixel system
 * degrades: the caller renders nothing rather than substituting a wrong picture. An unknown
 * `accent` or `overlay` is NOT null, it is ignored, because a scene whose art is right and whose
 * tint is missing is still a usable card and a scene with no art at all is not.
 */
export function composeScene(spec: SceneSpec): PixelSprite | null {
  const base = MOBILE_KIT[spec.archetype];
  if (!base) return null;

  const accent = spec.accent && ACCENTS[spec.accent] ? spec.accent : 'orchid';
  const overlay = spec.overlay && OVERLAYS[spec.overlay] ? spec.overlay : '';
  if (accent === 'orchid' && !overlay) return base;

  const key = `${spec.archetype}|${accent}|${overlay}`;
  const hit = variants.get(key);
  if (hit) return hit;

  const dress = (rows: string[]) => applyOverlay(applyAccent(rows, accent), overlay);
  const built: PixelSprite = {
    ...base,
    id: `${base.id}:${accent}${overlay ? `:${overlay}` : ''}`,
    rows: dress(base.rows),
    ...(base.frames ? { frames: base.frames.map(dress) } : {}),
  };
  variants.set(key, built);
  return built;
}
