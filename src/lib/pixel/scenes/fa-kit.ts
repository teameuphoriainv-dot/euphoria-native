/**
 * fa-kit: the Financial Analytics art kit. Every scene in the pathway is built from these parts.
 *
 * THE WORLD. Financial analytics is a pipeline: collect data, clean it, analyze it, model it,
 * decide (lesson 1's diagram, and its recap: every one of the next 24 lessons drops into one of
 * those five boxes). So the pathway's world is a data works at night, a plant where raw numbers go
 * in one end and decisions come out the other. Each box is a machine here: the hopper collects,
 * the filter tank cleans, the analyzer screen analyzes, its gauge models, the output slot decides.
 * Data changes colour as it moves down the line, blue raw, teal clean, green insight, gold
 * decision, and every part below keeps that order.
 *
 * HOW A LESSON USES IT. faCompose stamps stations and props into one still base (drawn once, the
 * way the pilot's base is), and the small animated bits go on top as layers. The keepsake is one
 * shape, faTrophy, with an empty screen; a lesson drops its own emblem into FA_TROPHY's slot.
 *
 * Light comes from the left on every part, like every other figure in the app: lit edges on the
 * left (x, y, T), shadow on the right (k, g, t). Outlines use the deep steps (D, O, E), never K,
 * which disappears on the canvas. Kit tones never reuse a shared palette letter, so stamping one
 * part can never recolour another.
 */
import type { PixelSprite } from '../types';
import type { SceneLayer } from './types';

/* ── tones ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * The data works at night: navy steel instead of the purple ink k/K, so this pathway's rooms and
 * skyline read as a plant and not as the quant's desk. Every one is under the backdrop's 0.15
 * luminance ceiling, so the same tones can sit behind lesson text.
 */
export const FA_STEEL: Record<string, string> = {
  a: '#20253A', // steel: walls, silo bodies
  c: '#151827', // steel in shadow: floor, the far side of a silo
  e: '#323A57', // steel catching light: trims, rims, lit edges
  Z: '#0E1019', // cast shadow on the floor, a step between c and the page
};

/** The analyst's skin, hair and the shadow side of the teal sweater. Not UI colours. */
const ANALYST_TONES: Record<string, string> = {
  S: '#C08552',
  M: '#9A6638',
  j: '#A0683C',
  h: '#7A4A2A',
  H: '#4E2E1C',
  v: '#0A4F49',
};

/* ── helpers ───────────────────────────────────────────────────────────────────────────────── */

/** A kit part placed in a room: the sprite and its top-left corner, in scene pixels. */
export type FaStamp = readonly [sprite: PixelSprite, x: number, y: number];

/**
 * Stamps kit parts onto a room, back to front, and returns ONE still sprite.
 *
 * WHY ONE BASE AND NOT A LAYER PER PROP. Each layer is its own View and is meshed on its own, so
 * a dozen props as a dozen layers would cost a dozen Views and never merge across their edges.
 * Stamped into the base they mesh together and are drawn once, which is what the base is for.
 * Only parts with `frames` or a motion belong in layers. A stamp that leaves the room, or two
 * parts that mean different colours by the same letter, throw here instead of drawing wrong.
 */
export function faCompose(id: string, room: PixelSprite, stamps: readonly FaStamp[]): PixelSprite {
  const rows = room.rows.map((row) => row.split(''));
  const palette: Record<string, string> = { ...(room.palette ?? {}) };
  for (const [sprite, x, y] of stamps) {
    for (const [ch, hex] of Object.entries(sprite.palette ?? {})) {
      if (palette[ch] && palette[ch] !== hex) throw new Error(`${id}: ${sprite.id} redefines "${ch}"`);
      palette[ch] = hex;
    }
    sprite.rows.forEach((row, dy) => {
      [...row].forEach((ch, dx) => {
        if (ch === '.') return;
        const line = rows[y + dy];
        if (!line || x + dx < 0 || x + dx >= line.length) throw new Error(`${id}: ${sprite.id} at ${String(x)},${String(y)} leaves the room`);
        line[x + dx] = ch;
      });
    });
  }
  return { id, name: id, tags: ['scene', 'fa'], blurb: room.blurb, palette, rows: rows.map((r) => r.join('')) };
}

/**
 * The same framed sprite starting elsewhere in its cycle, at its own speed. Frames tick from mount
 * with no offset, so two layers sharing one sprite would flash in step; a `phase` only offsets the
 * layer's transform, never its frames.
 */
export function faLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/**
 * Frames for a chart that draws itself. Each frame keeps only the bottom `h` rows of each column
 * band, so bars rise from their base and never fall: data geometry moves one way (AGENTS.md).
 */
function rising(full: readonly string[], bands: readonly (readonly [number, number])[], heights: readonly (readonly number[])[]): string[][] {
  const h = full.length;
  return heights.map((hs) => full.map((row, y) => [...row].map((ch, x) => {
    const band = bands.findIndex(([from, to]) => x >= from && x <= to);
    return band >= 0 && y >= h - (hs[band] ?? 0) ? ch : '.';
  }).join('')));
}

/**
 * A chart that draws itself, as a framed sprite: `full` is the finished picture, `bands` the
 * column ranges that grow as one bar, `heights` each frame's bar heights in rows from the bottom.
 * End on a blank frame so the loop reads as the screen clearing, not the chart falling.
 */
export function faDrawnChart(id: string, full: readonly string[], bands: readonly (readonly [number, number])[], heights: readonly (readonly number[])[], frameMs: number): PixelSprite {
  return { id, name: id, tags: ['scene', 'fa'], rows: [...full], frames: rising(full, bands, heights), frameMs };
}

/**
 * Bits falling down a `w` x `h` column, one pixel a frame, `h` frames to a seamless loop. Each drop
 * is [column, starting row, colour]; stagger the starting rows so they never fall as a block.
 */
export function faFalling(id: string, w: number, h: number, drops: readonly (readonly [x: number, start: number, ch: string])[], frameMs: number): PixelSprite {
  const frames = Array.from({ length: h }, (_, f) => Array.from({ length: h }, (_, y) => {
    let row = '';
    for (let x = 0; x < w; x++) row += drops.find(([dx, start]) => dx === x && (start + f) % h === y)?.[2] ?? '.';
    return row;
  }));
  return { id, name: id, tags: ['scene', 'fa'], rows: frames[0], frames, frameMs };
}

/**
 * Data packets along a pipe, `length` pixels, a two-pixel packet every `gap`, one pixel a frame so
 * `gap` frames loop without a seam. A packet takes the colour of the stretch it is in, so data
 * visibly changes as it passes each station: zones are [run pixel it ends before, colour].
 */
export function faPacketRun(id: string, length: number, zones: readonly (readonly [until: number, ch: string])[], gap = 6, frameMs = 170): PixelSprite {
  const colourAt = (x: number) => (zones.find(([until]) => x < until) ?? zones[zones.length - 1])[1];
  const frames = Array.from({ length: gap }, (_, f) => {
    let row = '';
    for (let x = 0; x < length; x++) row += (((x - f) % gap) + gap) % gap < 2 ? colourAt(x) : '.';
    return [row];
  });
  return { id, name: id, tags: ['scene', 'fa'], rows: frames[0], frames, frameMs };
}

/* ── the analyst ───────────────────────────────────────────────────────────────────────────── */

/**
 * The pathway's analyst, standing, holding a tablet. Round glasses, a teal sweater, an orchid
 * lanyard and badge. The tablet glass (6x2 at FA_ANALYST_TABLET) is left dark for a layer.
 */
export const faAnalyst: PixelSprite = {
  id: 'fa-analyst',
  name: 'analyst',
  tags: ['scene', 'fa', 'character'],
  blurb: 'The analyst, front on, tablet in both hands.',
  palette: ANALYST_TONES,
  rows: [
    '...jhhhhH...',
    '..jjhhhhhH..',
    '.HjhhhhhhhH.',
    '.HhhSSSShhH.',
    '.HhSSSSSSMH.',
    '.HDwDSDwDMH.',
    '.HSSSSSSSMH.',
    '.HSSSkkSSMH.',
    '..HSSSSSMH..',
    '.....SM.....',
    '..TTtwwttv..',
    '.TTtPwwPttv.',
    '.TTttPPtttv.',
    '.TTttwwtttv.',
    '.TTttwwtttv.',
    '.TDDDDDDDDv.',
    '.SDKKKKKKDS.',
    '.SDKKKKKKDS.',
    '..DDDDDDDD..',
    '..Tttttttv..',
    '..DDDDDDkk..',
    '..DDD..Dkk..',
    '..DDD..Dkk..',
    '.OOOO..OOOO.',
  ],
};
export const FA_ANALYST_TABLET = { x: 3, y: 16 } as const;

/* ── the five stations ─────────────────────────────────────────────────────────────────────── */

/**
 * COLLECT. An intake hopper on a cabinet: data pours into the open mouth (row 1) from above, and
 * the counter window (6x3 at FA_HOPPER_COUNTER) is left dark for a meter layer.
 */
export const faHopper: PixelSprite = {
  id: 'fa-hopper',
  name: 'hopper',
  tags: ['scene', 'fa', 'station'],
  blurb: 'Collect: an intake funnel on a cabinet with a counter window and a hatch.',
  rows: [
    'DDDDDDDDDDDD',
    'DKKKKKKKKKKD',
    'DxwxxxxxxxXD',
    'DDDDDDDDDDDD',
    '.DxXXXXXXkD.',
    '..DxXXXXkD..',
    '...DxXXkD...',
    '....DxkD....',
    '....DXkD....',
    'DDDDDDDDDDDD',
    'DxXXXXXXXXkD',
    'DxDDDDDDDDkD',
    'DxDKKKKKKDkD',
    'DxDKKKKKKDkD',
    'DxDKKKKKKDkD',
    'DxDDDDDDDDkD',
    'DxXXXXXXXXkD',
    'DTTTTTTTTTtD',
    'DxXXXXXXXXkD',
    'DxDDDDDDDDkD',
    'DxDXXXXXXDkD',
    'DxDXXXDDXDkD',
    'DxDXXXXXXDkD',
    'DxDDDDDDDDkD',
    'DxXXXXXXXXkD',
    'DDDDDDDDDDDD',
    '.DkD....DkD.',
  ],
};
export const FA_HOPPER_COUNTER = { x: 3, y: 12 } as const;

/**
 * CLEAN. A glass tank of teal liquid on a cabinet. Bubbles rise through rows 8 to 15 (columns 2
 * to 8); below, a nozzle (row 19) drips outliers into a red-flecked bin (row 23).
 */
export const faFilterTank: PixelSprite = {
  id: 'fa-filter-tank',
  name: 'filter tank',
  tags: ['scene', 'fa', 'station'],
  blurb: 'Clean: a glass tank of teal liquid with an outlier drain and bin below.',
  rows: [
    '...DDDD...',
    '..DxXXkD..',
    '.DDDDDDDD.',
    'DxwxxxxXkD',
    'DDDDDDDDDD',
    'DxKKKKKKKD',
    'DxKKKKKKKD',
    'DwTTTTTTTD',
    'DTtttttttD',
    'DTtttttttD',
    'DTtttttttD',
    'DTtttttttD',
    'DTtttttttD',
    'DTtttttttD',
    'DTtttttttD',
    'DTtttttttD',
    'DDDDDDDDDD',
    'DxXXXXXXkD',
    'DxKKKKKKkD',
    'DxKKXXKKkD',
    'DxKKKKKKkD',
    'DxKKKKKKkD',
    'DxKKKKKKkD',
    'DxKrRrrKkD',
    'DxKDDDDKkD',
    'DxXXXXXXkD',
    'DDDDDDDDDD',
    '.DkD..DkD.',
  ],
};
export const FA_FILTER_DRIP = { x: 4, y: 20 } as const;

/**
 * ANALYZE and MODEL. The tall cabinet: a dark terminal screen with a faint grid (glass 18x13 at
 * FA_ANALYZER_GLASS, the emblem goes 1px in from its top-left), a row of five LED sockets, a
 * keypad, and the model's gauge on the right (face 8x8, needle layer at FA_ANALYZER_NEEDLE).
 */
export const faAnalyzer: PixelSprite = {
  id: 'fa-analyzer',
  name: 'analyzer',
  tags: ['scene', 'fa', 'station'],
  blurb: 'Analyze and model: a terminal screen over a keypad, LEDs and a round gauge.',
  rows: [
    '.DDDDDDDDDDDDDDDDDDDDDD.',
    'DxwxxxxxxxxxxxxxxxxxxXkD',
    'DxXXXXXXXXXXXXXXXXXXXXkD',
    'DxDDDDDDDDDDDDDDDDDDDDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDkKkKkKkKkKkKkKkKkKDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDkKkKkKkKkKkKkKkKkKDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDkKkKkKkKkKkKkKkKkKDkD',
    'DxDKKKKKKKKKKKKKKKKKKDkD',
    'DxDDDDDDDDDDDDDDDDDDDDkD',
    'DxXXXXXXXXXXXXXXXXXXXXkD',
    'DxXXXXXXXXXXXXXDDDDXXXkD',
    'DxXkXkXkXkXkXXDwwxxDXXkD',
    'DxXXXXXXXXXXXDwxxxxxDXkD',
    'DxXDDDDDDDXXXDxxxxxxDXkD',
    'DxXDxDxDxDXXXDxxxxxXDXkD',
    'DxXDDDDDDDXXXDxxxxXXDXkD',
    'DxXDxDxDxDXXXXDXXXXDXXkD',
    'DxXDDDDDDDXXXXXDDDDXXXkD',
    'DxXXXXXXXXXXXXXXXXXXXXkD',
    'DTTTTTTTTTTTTTTTTTTTTTtD',
    'DxXXXXXXXXXXXXXXXXXXXXkD',
    'DxXXKKKKKKKKKKKKKKKKXXkD',
    'DxXXXXXXXXXXXXXXXXXXXXkD',
    'DxXXKKKKKKKKKKKKKKKKXXkD',
    'DxXXXXXXXXXXXXXXXXXXXXkD',
    'DxXXKKKKKKKKKKKKKKKKXXkD',
    'DxXXXXXXXXXXXXXXXXXXXXkD',
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    '.DkD................DkD.',
  ],
};
export const FA_ANALYZER_GLASS = { x: 3, y: 4, w: 18, h: 13 } as const;
export const FA_ANALYZER_LEDS = { x: 3, y: 20 } as const;
export const FA_ANALYZER_NEEDLE = { x: 14, y: 21 } as const;

/**
 * DECIDE. A printer with a slot on top (a decision rises out of it), a lamp socket at
 * FA_OUTPUT_LAMP, and a tray of finished decisions at the front.
 */
export const faOutputSlot: PixelSprite = {
  id: 'fa-output-slot',
  name: 'output slot',
  tags: ['scene', 'fa', 'station'],
  blurb: 'Decide: a printer that issues decisions, with a lamp and a tray of cards.',
  rows: [
    '.DDDDDDDD.',
    'DxwxxxxxkD',
    'DxKKKKKKkD',
    'DxXXXXXXkD',
    'DxXXXXXXkD',
    'DxXDDDXXkD',
    'DxXDkDXXkD',
    'DxXDDDXXkD',
    'DxXXXXXXkD',
    'DTTTTTTTtD',
    'DxXXXXXXkD',
    'DxDDDDDDkD',
    'DxDwwwxDkD',
    'DxDxxxxDkD',
    'DxDDDDDDkD',
    'DxXXXXXXkD',
    'DxXXXXXXkD',
    'DDDDDDDDDD',
    '.DkD..DkD.',
  ],
};
export const FA_OUTPUT_LAMP = { x: 4, y: 6 } as const;

/**
 * A floor conduit, `length` long: glass channel on row 2 for faPacketRun, flanges every
 * `flangeEvery` pixels reaching one row past each edge so it reads as bolted, not drawn.
 */
export function faConduit(id: string, length: number, flangeEvery = 10): PixelSprite {
  const flange = (x: number) => x === 0 || x === length - 1 || x % flangeEvery === flangeEvery - 1;
  const row = (atFlange: string, between: string) =>
    Array.from({ length }, (_, x) => (flange(x) ? atFlange : between)).join('');
  return {
    id,
    name: id,
    tags: ['scene', 'fa', 'prop'],
    blurb: 'A glass-channel conduit carrying data between stations.',
    rows: [row('D', '.'), row('x', 'D'), row('X', 'K'), row('X', 'D'), row('D', '.')],
  };
}

/* ── wall props ────────────────────────────────────────────────────────────────────────────── */

/**
 * The pipeline map: five stage boxes joined left to right (collect, clean, analyze, model,
 * decide). The box interiors (2x1 each, at FA_MAP_LIGHTS) are left dark for a light layer, so a
 * lesson can light the box its topic lives in (faMapLight) or chase all five (faMapChase).
 */
export const faPipelineMap: PixelSprite = {
  id: 'fa-pipeline-map',
  name: 'pipeline map',
  tags: ['scene', 'fa', 'prop'],
  blurb: 'A wall sign of the five-box analytics pipeline.',
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD',
    'DKXXXXKKXXXXKKXXXXKKXXXXKKXXXXKD',
    'DKXkkXDDXkkXDDXkkXDDXkkXDDXkkXKD',
    'DKXXXXKKXXXXKKXXXXKKXXXXKKXXXXKD',
    'DKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};
export const FA_MAP_LIGHTS = { x: 3, y: 3 } as const;

/** The five stages in pipeline order, and the colour each one glows. */
export const FA_STAGES = ['collect', 'clean', 'analyze', 'model', 'decide'] as const;
export type FaStage = (typeof FA_STAGES)[number];
const STAGE_INK: Record<FaStage, string> = { collect: 'B', clean: 'T', analyze: 'N', model: 'q', decide: 'y' };

const mapRow = (lit: readonly FaStage[]) => {
  let row = '';
  for (let x = 0; x < 26; x++) {
    const stage = FA_STAGES[Math.floor(x / 6)];
    row += x % 6 < 2 && lit.includes(stage) ? STAGE_INK[stage] : '.';
  }
  return [row];
};

/** One lit box on the pipeline map, for a lesson that lives in one stage. Give it a twinkle. */
export function faMapLight(stage: FaStage): PixelSprite {
  return { id: `fa-map-light-${stage}`, name: `map light ${stage}`, tags: ['scene', 'fa'], rows: mapRow([stage]) };
}

/** The map lighting each stage in turn, then the whole pipeline at once: lesson 1's overview. */
export const faMapChase: PixelSprite = {
  id: 'fa-map-chase',
  name: 'map chase',
  tags: ['scene', 'fa'],
  blurb: 'The pipeline map lighting collect, clean, analyze, model, decide, then all five.',
  rows: mapRow([...FA_STAGES]),
  frames: [
    mapRow(['collect']),
    mapRow(['clean']),
    mapRow(['analyze']),
    mapRow(['model']),
    mapRow(['decide']),
    mapRow([...FA_STAGES]),
    mapRow([...FA_STAGES]),
    mapRow([]),
  ],
  frameMs: 420,
};

/** Gut feeling, ruled out: a die under a no sign. Lesson 1's stakes, and the dice of lesson 3 and 7. */
export const faNoDiceSign: PixelSprite = {
  id: 'fa-no-dice-sign',
  name: 'no dice sign',
  tags: ['scene', 'fa', 'prop'],
  blurb: 'A die under a red no sign: decisions here are not left to chance.',
  rows: [
    '.....RRRRR.....',
    '...RRRRRRRRR...',
    '..RRRxxxxxRRR..',
    '.RRRRxxxxxxRRr.',
    '.RRxRRDDDDDxrr.',
    'RRxxDRRwwwDxxrr',
    'RRxxDwRRKxDxxrr',
    'RRxxDwwRRxDxxrr',
    'RRxxDwKwRRDxxrr',
    'RRxxDwxxxRRxxrr',
    '.RRxDDDDDDRRrr.',
    '.RRRxxxxxxxRRr.',
    '..RRrxxxxxrrr..',
    '...rrrrrrrrr...',
    '.....rrrrr.....',
  ],
};

/** A die on its own, five face up: gut feeling, probability, Monte Carlo. */
export const faDie: PixelSprite = {
  id: 'fa-die',
  name: 'die',
  tags: ['scene', 'fa', 'prop'],
  rows: [
    'DDDDDDD',
    'DwwwwxD',
    'DwKwKxD',
    'DwwKwxD',
    'DwKwKxD',
    'DxxxxxD',
    'DDDDDDD',
  ],
};

/* ── small moving bits ─────────────────────────────────────────────────────────────────────── */

/** Raw records pouring from a chute into the hopper mouth, 4x6. */
export const faRawBits = faFalling('fa-raw-bits', 4, 6, [[0, 0, 'B'], [2, 2, 'y'], [1, 4, 'w'], [3, 1, 'B'], [2, 5, 'T']], 150);

/** The hopper's counter filling as records arrive, then clearing: 6x3. */
export const faMeter: PixelSprite = (() => {
  const frames = Array.from({ length: 8 }, (_, f) => {
    const n = Math.min(f, 6);
    return [0, 1, 2].map((y) => {
      let row = '';
      for (let x = 0; x < 6; x++) row += x < n && y >= 2 - Math.floor(x / 2) ? (y === 2 - Math.floor(x / 2) ? 'B' : 'b') : '.';
      return row;
    });
  });
  return { id: 'fa-meter', name: 'meter', tags: ['scene', 'fa'], blurb: 'A counter filling with records.', rows: frames[6], frames, frameMs: 300 };
})();

/** A bubble for the filter tank. Give it a `rise`. */
export const faBubble: PixelSprite = { id: 'fa-bubble', name: 'bubble', tags: ['scene', 'fa'], rows: ['m'] };

/** An outlier dripping out of the filter's nozzle into the bin, 1x3, with a pause between drops. */
export const faOutlierDrip: PixelSprite = {
  id: 'fa-outlier-drip',
  name: 'outlier drip',
  tags: ['scene', 'fa'],
  rows: ['R', '.', '.'],
  frames: [['R', '.', '.'], ['.', 'R', '.'], ['.', '.', 'R'], ['.', '.', '.'], ['.', '.', '.'], ['.', '.', '.']],
  frameMs: 200,
};

/** The model's gauge needle swinging across the dial, 6x4, pivot at the bottom centre. */
export const faGaugeNeedle: PixelSprite = {
  id: 'fa-gauge-needle',
  name: 'gauge needle',
  tags: ['scene', 'fa'],
  rows: ['...r..', '...r..', '...r..', '...K..'],
  frames: [
    ['......', '.r....', '..r...', '...K..'],
    ['..r...', '..r...', '...r..', '...K..'],
    ['...r..', '...r..', '...r..', '...K..'],
    ['....r.', '....r.', '...r..', '...K..'],
    ['......', '.....r', '....r.', '...K..'],
    ['....r.', '....r.', '...r..', '...K..'],
    ['...r..', '...r..', '...r..', '...K..'],
    ['..r...', '..r...', '...r..', '...K..'],
  ],
  frameMs: 380,
};

/** Five LEDs on the analyzer deck running a chase, 9x1 over the sockets. */
export const faLedChase: PixelSprite = {
  id: 'fa-led-chase',
  name: 'led chase',
  tags: ['scene', 'fa'],
  rows: ['N.N.N.N.N'],
  frames: [['N.n......'], ['..N.n....'], ['....N.n..'], ['......N.n'], ['n.......N'], ['N.N.N.N.N']],
  frameMs: 260,
};

/** One lamp pixel. Give it a twinkle. */
export const faLamp: PixelSprite = { id: 'fa-lamp', name: 'lamp', tags: ['scene', 'fa'], rows: ['N'] };

/** A decision, issued: a card with a green up arrow, 7x9. Give it a `rise` out of the slot. */
export const faDecisionCard: PixelSprite = {
  id: 'fa-decision-card',
  name: 'decision card',
  tags: ['scene', 'fa'],
  blurb: 'A decision card with a green up arrow.',
  rows: [
    '.DDDDD.',
    'DwwNwxD',
    'DwNNNxD',
    'DNNNNND',
    'DwwNwxD',
    'DwwNwxD',
    'DwwNwxD',
    'DxxxxxD',
    '.DDDDD.',
  ],
};

/** The analyst's tablet drawing a small rising line, 6x2. */
export const faTabletLine: PixelSprite = (() => {
  const full = ['...nNN', 'NNn...'];
  const frames = [1, 2, 3, 4, 5, 6, 6, 6].map((n) => full.map((row) => [...row].map((ch, x) => (x < n ? ch : '.')).join('')));
  return { id: 'fa-tablet-line', name: 'tablet line', tags: ['scene', 'fa'], rows: full, frames, frameMs: 340 };
})();

/* ── emblems ───────────────────────────────────────────────────────────────────────────────── */

/**
 * Every emblem is FA_EMBLEM.w x FA_EMBLEM.h, drawn on dark glass, so one emblem fits both the
 * analyzer's screen in an opener and the trophy's screen in a keepsake.
 */
export const FA_EMBLEM = { w: 16, h: 11 } as const;

/**
 * LESSON 1: what financial analytics is. Three bars of what happened, in the pipeline's colours
 * (blue raw, teal clean, green insight), and a gold arrow for what to do. It draws itself: the
 * bars rise in turn, the arrow shoots up, the tip catches the light, it holds, the screen clears.
 */
export const faEmblemAnalytics: PixelSprite = (() => {
  const full = [
    '.............y..',
    '............yGG.',
    '...........yGGGg',
    '............yGg.',
    '............yGg.',
    '........NNn.yGg.',
    '........NNn.yGg.',
    '....TTt.NNn.yGg.',
    '....TTt.NNn.yGg.',
    'BBb.TTt.NNn.yGg.',
    'BBb.TTt.NNn.yGg.',
  ];
  const chart = faDrawnChart('fa-emblem-analytics', full, [[0, 2], [4, 6], [8, 10], [11, 15]], [
    [1, 1, 1, 1],
    [2, 2, 1, 1],
    [2, 4, 3, 2],
    [2, 4, 6, 5],
    [2, 4, 6, 11],
    [2, 4, 6, 11],
    [2, 4, 6, 11],
    [2, 4, 6, 11],
    [0, 0, 0, 0],
  ], 320);
  const frames = chart.frames ?? [chart.rows];
  // The tip catches the light on the beat after the arrow lands.
  frames[5] = frames[5].map((row, y) => (y === 0 ? row.replace('y', 'w') : y === 1 ? row.replace('yGG', 'ywG') : row));
  return { ...chart, name: 'emblem analytics', tags: ['scene', 'fa', 'emblem'], blurb: 'Bars of what happened and an arrow for what to do.', frames };
})();

/* ── the keepsake shape ────────────────────────────────────────────────────────────────────── */

/**
 * THE PATHWAY KEEPSAKE: a gold terminal on an orchid plinth, a trophy for analysts. The screen is
 * left empty (dark glass, faint grid) and every lesson fills it with its own emblem at
 * FA_TROPHY.emblem, so all 25 keepsakes are one family that differ only in what is on the screen.
 * 48x40, drawn for the lesson-complete screen at 3 points a pixel.
 */
export const faTrophy: PixelSprite = {
  id: 'fa-trophy',
  name: 'trophy',
  tags: ['scene', 'fa', 'keepsake'],
  blurb: 'A gold terminal trophy on an orchid plinth, its screen left for an emblem.',
  rows: [
    '................................................',
    '................................................',
    '...........OOOOOOOOOOOOOOOOOOOOOOOOOO...........',
    '..........OyyyyyyyyyyyyyyyyyyyyyyyyyGO..........',
    '..........OyGGGGGGGGGGGGGGGGGGGGGGGGgO..........',
    '..........OyGgggggggggggggggggggggyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgkKkKkKkKkKkKkKkKkKkKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgkKkKkKkKkKkKkKkKkKkKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgKKKKKKKKKKKKKKKKKKKKyGgO..........',
    '..........OyGgyyyyyyyyyyyyyyyyyyyyyGgO..........',
    '..........OGggggggggggggggggggggOggggO..........',
    '...........OOOOOOOOOOOOOOOOOOOOOOOOOO...........',
    '.....................OOOOOO.....................',
    '.....................OyGGgO.....................',
    '.....................OyGGgO.....................',
    '.....................OyGGgO.....................',
    '................OOOOOOOOOOOOOOOO................',
    '...............OyyyyyyyyyyyyyyyGO...............',
    '...............OggggggggggggggggO...............',
    '................EqPPPPPPPPPPPPpE................',
    '................EqPPOOOOOOOOPPpE................',
    '................EqPPOyGGGGgOPPpE................',
    '................EqPPOOOOOOOOPPpE................',
    '................EqPPPPPPPPPPPPpE................',
    '................EqPPPPPPPPPPPPpE................',
    '..............EqqqqqqqqqqqqqqqqqqE..............',
    '..............EppppppppppppppppppE..............',
    '..............EEEEEEEEEEEEEEEEEEEE..............',
    '................................................',
    '................................................',
  ],
};

/** Where things sit on faTrophy: the emblem slot (1px inside the 20x13 glass) and the power LED. */
export const FA_TROPHY = { width: 48, height: 40, emblem: { x: 16, y: 7 }, led: { x: 32, y: 20 } } as const;

/** A crossed twinkle, 5x5, opening and closing. */
export const faTwinkle: PixelSprite = {
  id: 'fa-twinkle',
  name: 'twinkle',
  tags: ['scene', 'fa'],
  rows: ['y...y', '.w.w.', '..W..', '.w.w.', 'y...y'],
  frames: [
    ['y...y', '.w.w.', '..W..', '.w.w.', 'y...y'],
    ['.....', '.y.y.', '..W..', '.y.y.', '.....'],
    ['.....', '.....', '..w..', '.....', '.....'],
    ['.....', '.....', '.....', '.....', '.....'],
    ['.....', '.....', '..y..', '.....', '.....'],
    ['.....', '.y.y.', '..w..', '.y.y.', '.....'],
  ],
  frameMs: 300,
};

/** The small one, 3x3. */
export const faTwinkleSmall: PixelSprite = {
  id: 'fa-twinkle-small',
  name: 'twinkle small',
  tags: ['scene', 'fa'],
  rows: ['y.y', '.W.', 'y.y'],
  frames: [['y.y', '.W.', 'y.y'], ['...', '.w.', '...'], ['...', '...', '...'], ['...', '.y.', '...']],
  frameMs: 420,
};

/** Data motes, one pixel each, for `rise`. */
export const faMoteTeal: PixelSprite = { id: 'fa-mote-teal', name: 'mote teal', tags: ['scene', 'fa'], rows: ['T'] };
export const faMoteGold: PixelSprite = { id: 'fa-mote-gold', name: 'mote gold', tags: ['scene', 'fa'], rows: ['y'] };

/** A sheen running along the trophy's top bezel, then resting: 24x1 over row 3. */
export const faBezelGlint: PixelSprite = (() => {
  const at = (x: number) => [Array.from({ length: 24 }, (_, i) => (i >= x && i < x + 3 ? 'w' : '.')).join('')];
  const frames = [0, 3, 6, 9, 12, 15, 18, 21].map(at);
  for (let i = 0; i < 8; i++) frames.push(at(99));
  return { id: 'fa-bezel-glint', name: 'bezel glint', tags: ['scene', 'fa'], rows: at(99), frames, frameMs: 110 };
})();

/**
 * Everything on a keepsake except the emblem: the sheen, the power LED, twinkles and rising motes.
 * A lesson's finish is faTrophy + its emblem layer at FA_TROPHY.emblem + these.
 */
export const faKeepsakeDressing: readonly SceneLayer[] = [
  { sprite: faBezelGlint, x: 12, y: 3 },
  { sprite: faLamp, x: FA_TROPHY.led.x, y: FA_TROPHY.led.y, motion: { kind: 'twinkle', periodMs: 1400, min: 0.35 } },
  { sprite: faTwinkle, x: 3, y: 7, motion: { kind: 'twinkle', periodMs: 1700, min: 0.5 } },
  { sprite: faLater(faTwinkle, 'fa-twinkle-later', 3, 340), x: 40, y: 13, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.5, min: 0.5 } },
  { sprite: faTwinkleSmall, x: 41, y: 3, motion: { kind: 'twinkle', periodMs: 1300, phase: 0.3, min: 0.4 } },
  { sprite: faLater(faTwinkleSmall, 'fa-twinkle-small-later', 2, 470), x: 5, y: 24, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.7, min: 0.4 } },
  { sprite: faMoteTeal, x: 11, y: 33, motion: { kind: 'rise', amp: 6, periodMs: 2300, phase: 0.1 } },
  { sprite: faMoteGold, x: 36, y: 30, motion: { kind: 'rise', amp: 6, periodMs: 2600, phase: 0.55 } },
  { sprite: faMoteTeal, x: 38, y: 36, motion: { kind: 'rise', amp: 5, periodMs: 2000, phase: 0.3 } },
];
