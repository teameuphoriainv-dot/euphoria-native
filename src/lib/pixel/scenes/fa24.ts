/**
 * Financial Analytics lesson 24, big data and the cloud: more data than any one machine can hold.
 *
 * OPENER. The server hall, at the COLLECT end. The feeds come in on the right through an intake
 * board of four windows, the lesson's four sources, each drawn as itself: a market price line, a
 * satellite, a social post (a chat bubble), an IoT sensor sending its signal. Each window drops its
 * data down a stub into the cable tray, and the tray carries all four, packets in each source's
 * colour, left into four tall racks whose lights blink to their own rhythms: the processing. Data
 * rises off the racks' tops into the glowing cloud sign above them, the cloud everything runs on,
 * and the sign shows what the racks make there: a risk dial, the upload arrow, and an alpha signal
 * (a gold alpha beside a green arrow up). The analyst, seen from behind and half the height of a
 * rack, watches the feeds pour in. The map lights COLLECT.
 *
 * KEEPSAKE. The trophy with the cloud: a tiny rack lands, a blue cloud with a white up arrow in it
 * gathers over it, and data climbs from the rack into the cloud as chevrons pointing up; the arrow
 * flashes as each arrives.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faFalling, faPipelineMap } from './fa-kit';
import { faKeepsake, faRoom, faStageLight } from './fa-kit-a';
import { faAnalystBack, faBlank, faPacketsLeft, faRowsOf } from './fa-kit-b';
import { faRiser } from './fa-kit-r';
import type { FaPatch } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the racks ─────────────────────────────────────────────────────────────────────────────── */

/**
 * A server rack, 10 x 28: a lit cap, eight units (a lit lip, a face of two drive bays and two light
 * sockets at LEDS, a rule), feet on the bottom row.
 */
const UNIT = ['DxXXXXXXkD', 'DxXkXXKKkD', 'DDDDDDDDDD'] as const;
const rack: PixelSprite = {
  id: 'fa24-rack',
  name: 'rack',
  tags: ['scene', 'fa24', 'station'],
  rows: ['DDDDDDDDDD', 'DxwxxxxXkD', 'DDDDDDDDDD', ...Array.from({ length: 8 }, () => UNIT).flat(), '.DkD..DkD.'],
};
const LEDS = { x: 6, y: 4 } as const;
const RACKS = [4, 15, 26, 37] as const;
const RACK_Y = 21;

/** One rack's lights, two per unit, each on its own rhythm (seeded so no two racks blink alike). */
function rackLights(id: string, seed: number): PixelSprite {
  const inks = ['N', 'N', 'B', 'y'];
  const frames = Array.from({ length: 6 }, (_, f) => Array.from({ length: 22 }, (_, r) => {
    if (r % 3) return '..';
    const unit = r / 3;
    return [0, 1].map((c) => ((unit * 7 + c * 13 + f * 5 + seed * 11) % 9 < 5 ? inks[(unit + c + seed) % inks.length] : '.')).join('');
  }));
  return { id, name: 'rack lights', tags: ['scene', 'fa24'], rows: frames[0], frames, frameMs: 300 };
}

/* ── the cloud ─────────────────────────────────────────────────────────────────────────────── */

/**
 * The cloud sign, 40 x 15: the outline of a cloud (four round bumps on a flat base) with an upload
 * arrow inside, as neon tube. The base keeps it in dim blue; the same outline lit bright glows
 * over it.
 */
const cloudSign = (ink: string, id: string): PixelSprite => {
  const bumps = [[9, 9.5, 4.5], [17, 6.5, 6.5], [26, 7, 5.5], [33, 9.5, 4.5]] as const;
  const inside = (x: number, y: number) =>
    x >= 0 && x < 40 && y >= 0 && y <= 13 && ((y >= 10 && x >= 6 && x <= 36) || bumps.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r));
  const g = faBlank(40, 15);
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 40; x++) {
      if (inside(x, y) && (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1))) g[y][x] = ink;
    }
  }
  ['..#..', '.###.', '#####', '..#..', '..#..', '..#..'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') g[4 + j][19 + i] = ink; }));
  return { id, name: id, tags: ['scene', 'fa24'], rows: faRowsOf(g) };
};

/**
 * What the racks make in the cloud, in neon inside the sign either side of the arrow: a risk dial
 * (its arc green to gold to red, the needle at gold) and an alpha signal (a gold alpha and a green
 * arrow up). Placed from the sign's top-left corner.
 */
const outputs: PixelSprite = (() => {
  const g = faBlank(30, 6);
  const paint = (x0: number, y0: number, rows: readonly string[]) => rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') g[y0 + j][x0 + i] = ch; }));
  paint(0, 1, ['..yyy..', '.N...R.', 'N.....R', 'N..w..R', '...w...']);
  paint(19, 1, ['.yy.y', 'y..y.', 'y..y.', '.yy.y']);
  paint(25, 0, ['.N.', 'NNN', '.N.', '.N.', '.N.']);
  return { id: 'fa24-outputs', name: 'cloud outputs', tags: ['scene', 'fa24'], rows: faRowsOf(g) };
})();
const OUTPUTS_AT = { x: 8, y: 6 } as const;

/** A mote of data rising off a rack into the cloud. Give it a `rise`. */
const mote = (ink: string): PixelSprite => ({ id: `fa24-mote-${ink}`, name: 'mote', tags: ['scene', 'fa24'], rows: [ink] });

/* ── the intake ────────────────────────────────────────────────────────────────────────────── */

/**
 * The four sources, 7 x 5 each, in the colour their packets carry: a market feed (a green price
 * line over its axis), a satellite (blue panels, a gold body, its antenna), a social post (a white
 * chat bubble, three dots of typing) and an IoT sensor (a gold node sending rings of signal).
 */
const SOURCES = [
  { ink: 'N', icon: ['.....Nn', '..N.N..', '.N.N...', 'N......', 'xxxxxxx'] },
  { ink: 'B', icon: ['.......', 'BBBGBBB', 'bbbGbbb', '...x...', '..x.x..'] },
  { ink: 'w', icon: ['.wwwww.', 'ww.w.ww', 'wwwwwww', '.wwwww.', '.w.....'] },
  { ink: 'y', icon: ['.x...x.', 'x.x.x.x', 'x.xyx.x', 'x.x.x.x', '.x...x.'] },
] as const;

/** The intake board, 33 x 8: four dark windows with a source in each, dividers between them. */
const BOARD_W = 1 + SOURCES.length * 8;
const board: PixelSprite = (() => {
  const g = faBlank(BOARD_W, 8);
  for (let x = 0; x < BOARD_W; x++) { g[0][x] = 'D'; g[1][x] = x === 0 || x === BOARD_W - 1 ? 'D' : x < 3 ? 'w' : 'x'; g[7][x] = 'D'; }
  SOURCES.forEach(({ icon }, k) => {
    const x0 = 1 + k * 8;
    for (let y = 2; y < 7; y++) {
      g[y][x0 - 1] = 'D';
      for (let i = 0; i < 7; i++) g[y][x0 + i] = icon[y - 2][i] === '.' ? 'K' : icon[y - 2][i];
    }
  });
  for (let y = 2; y < 7; y++) g[y][BOARD_W - 1] = 'D';
  return { id: 'fa24-board', name: 'intake board', tags: ['scene', 'fa24', 'prop'], rows: faRowsOf(g) };
})();
/** Where window k's stub drops from the board into the tray: its channel column on the board. */
const stubX = (k: number) => 1 + k * 8 + 3;

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

/* Where things stand. */
const MAP = { x: 46, y: 1 } as const;
const CLOUD = { x: 4, y: 1 } as const;
const BOARD = { x: 46, y: 12 } as const;
const FEED = { x: 47, y: 24, length: 33 } as const;
const STUB_Y = BOARD.y + 8;
const STUB_H = FEED.y + 2 - STUB_Y;
const ANALYST = { x: 60, y: 33 } as const;

/** The hall's floor: tile seams every ten pixels, the racks' shadow, the analyst's. */
const floor: FaPatch[] = [
  [0, 54, 80, 1, 'Z'],
  ...Array.from({ length: 8 }, (_, k): FaPatch => [9 + k * 10, 50, 1, 10, 'Z']),
  [RACKS[0], 50, 43, 1, 'Z'],
  [RACKS[0] + 1, 51, 41, 1, 'Z'],
  [ANALYST.x + 1, 57, 10, 1, 'Z'],
];
const room = faRoom('fa24-opener-room', floor);

/** Where each stub opens into the tray's channel. */
const mouth: PixelSprite = { id: 'fa24-mouth', name: 'mouth', tags: ['scene', 'fa24', 'prop'], rows: ['K'] };

const base = faCompose('fa24-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [cloudSign('b', 'fa24-cloud'), CLOUD.x, CLOUD.y],
  [outputs, CLOUD.x + OUTPUTS_AT.x, CLOUD.y + OUTPUTS_AT.y],
  ...SOURCES.map((_, k) => [faRiser(`fa24-stub-${String(k)}`, STUB_H + 1, 99), BOARD.x + stubX(k) - 2, STUB_Y] as const),
  [faConduit('fa24-feed', FEED.length, 8), FEED.x, FEED.y],
  ...SOURCES.map((_, k) => [mouth, BOARD.x + stubX(k), FEED.y + 1] as const),
  [board, BOARD.x, BOARD.y],
  ...RACKS.map((x) => [rack, x, RACK_Y] as const),
  [faAnalystBack, ANALYST.x, ANALYST.y],
]);

/** Each source's data dropping down its stub into the tray, a drop at a time, out of step. */
const drops = SOURCES.map(({ ink }, k) => faFalling(`fa24-drop-${String(k)}`, 1, STUB_H, [[0, (k * 3) % STUB_H, ink]], 210 + k * 30));

export const fa24Opener: SceneArt = {
  id: 'fa24-opener',
  label: 'A server hall in the data plant: market prices, satellite images, social posts and sensor signals drop from an intake board into a cable tray that carries them into four tall blinking racks, data rises off the racks into a glowing cloud sign that shows a risk dial, an upload arrow and an alpha signal, and the analyst, seen from behind, watches the feeds pour in.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: cloudSign('B', 'fa24-cloud-glow'), x: CLOUD.x, y: CLOUD.y, motion: { kind: 'twinkle', periodMs: 2400, min: 0.35 } },
    ...RACKS.map((x, k) => ({ sprite: rackLights(`fa24-lights-${String(k)}`, k), x: x + LEDS.x, y: RACK_Y + LEDS.y })),
    ...RACKS.flatMap((x, k) => [
      { sprite: mote(['B', 'T', 'w', 'B'][k]), x: x + 3, y: RACK_Y - 2, motion: { kind: 'rise' as const, amp: 5, periodMs: 1700 + k * 190, phase: k * 0.23 } },
      { sprite: mote(['w', 'B', 'B', 'T'][k]), x: x + 6, y: RACK_Y - 3, motion: { kind: 'rise' as const, amp: 4, periodMs: 2100 + k * 170, phase: 0.5 + k * 0.17 } },
    ]),
    ...drops.map((sprite, k) => ({ sprite, x: BOARD.x + stubX(k), y: STUB_Y })),
    { sprite: faPacketsLeft('fa24-sources', FEED.length - 2, SOURCES.map(({ ink }) => ink), 6, 150), x: FEED.x + 1, y: FEED.y + 2 },
    faStageLight('collect', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 24: big data and the cloud. A tiny server rack lands at the bottom, its lights on; a blue
 * cloud gathers over it with a white up arrow inside, the opener's upload arrow; then data climbs
 * out of the rack as two bold teal chevrons pointing up, rises a pixel into the cloud's underside,
 * and is gone, the arrow flashing as it lands; twice, then it holds and the screen clears. At rest
 * it shows the rack, the cloud and both chevrons on their way up, so the held frame reads as an
 * upload and never as rain.
 */
export const faEmblemCloud: PixelSprite = (() => {
  const CLOUD_ROWS = [
    '.........www....',
    '...www..wBwBw...',
    '..wBBBwwBwwwBw..',
    '.wBBBBBBwwwwwBw.',
    'wBBBBBBBBBwBBBBx',
    '.xxxxxxxxxxxxxx.',
  ] as const;
  /** The arrow's pixels in the cloud, which flash bright when data lands. */
  const ARROW = new Set(['10,1', '9,2', '10,2', '11,2', '8,3', '9,3', '10,3', '11,3', '12,3', '10,4']);
  const RACK_ROWS = ['..xxxxxxxxxxxx..', '..XNXBXNXBXNXB..'] as const;
  const CHEVRON = ['..T..', '.TTT.', 'TT.TT'] as const;
  const LANES = [2, 9] as const;
  const picture = (chevronTop: number | null, flash: boolean) => {
    const g = faBlank(16, 11);
    CLOUD_ROWS.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') g[y][x] = flash && ARROW.has(`${String(x)},${String(y)}`) ? 'W' : ch; }));
    RACK_ROWS.forEach((row, j) => [...row].forEach((ch, x) => { if (ch !== '.') g[9 + j][x] = ch; }));
    if (chevronTop !== null) for (const lane of LANES) CHEVRON.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') g[chevronTop + j][lane + i] = ch; }));
    return faRowsOf(g);
  };
  const empty = faRowsOf(faBlank(16, 11));
  const rackOnly = empty.map((row, y) => (y >= 9 ? RACK_ROWS[y - 9] : row));
  const RISING = 6;
  const ENTERING = 5;
  const frames = [
    rackOnly,
    picture(null, false),
    picture(RISING, false),
    picture(ENTERING, false),
    picture(null, true),
    picture(RISING, false),
    picture(ENTERING, false),
    picture(null, true),
    picture(RISING, false),
    empty,
  ];
  return { id: 'fa-emblem-cloud', name: 'emblem cloud', tags: ['scene', 'fa', 'emblem'], blurb: 'A rack sending data up into a cloud with an up arrow.', rows: picture(RISING, false), frames, frameMs: 340 };
})();

export const fa24Finish: SceneArt = faKeepsake(
  'fa24-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a tiny server rack sending teal chevrons pointing up into a blue cloud with a white up arrow that flashes as they arrive, with small sparkles around it.',
  faEmblemCloud,
);

export const art: LessonArtSet = { opener: fa24Opener, backdrop: faBackdrop, finish: fa24Finish };
