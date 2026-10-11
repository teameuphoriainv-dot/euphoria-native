/**
 * Global Economics lesson 19: the digital economy and platform economics, on the quay at night.
 *
 * The quay after dark, every window in the town across the water lit. The student holds up a phone,
 * and above them a network keeps growing: two users joined to the platform at its centre, then four,
 * six and eight, and the more who join the more links there are between them. That is the network
 * effect, which makes the biggest platform bigger. Only small layers move: the network, the phone's
 * screen and its signal, the mast's red light, the lamp, the town's lights on the water and the stars.
 *
 * The quay is lesson 2's by day, taken into the night band by band with geTintRows.
 *
 * The keepsake's emblem is a platform at the centre of its users, a pulse running out along the links.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, GE_STUDENT_HOLD, geBeacon, geCompose, geStar, geStarBig, geStudent } from './ge-kit';
import { geGroundQuay, geLampGlow } from './ge-kit-a';
import { geTintRows } from './ge-kit-c';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * geGroundQuay after dark, band by band: night over the hills with the last indigo low down, the far
 * town's houses in shadow with every window lit, the water darker toward the quay, and the quay's
 * stone a step darker with its painted line dimmed.
 */
const quayNight = geTintRows(geGroundQuay, 'ge19-opener-quay', [
  { from: 0, to: 8, map: { b: 'K' } },
  { from: 9, to: 20, map: { b: 'k', B: '0' } },
  { from: 21, to: 28, map: { B: '0', t: 'i', n: 'e', z: 'D', r: 'v', K: 'G' } },
  { from: 29, to: 30, map: { b: 'c', B: 'd' } },
  { from: 31, to: 42, map: { d: 'c', b: 'd', c: 'a' } },
  { from: 43, to: 59, map: { x: 'X', X: 'D', D: 'k', G: 'O' } },
]);

/** A phone mast on the far hill and a lamp on the quay with its light on the stone. */
const props: PixelSprite = {
  id: 'ge19-opener-props',
  name: 'mast and lamp',
  tags: ['ge19', 'prop'],
  blurb: 'A lattice phone mast on a hill and an iron lamp post with a pool of light under it.',
  palette: GE_PALETTE,
  rows: [
    '......X..........',
    '......X..........',
    '.....DXD.........',
    '.....DXD.........',
    '.....DXD.........',
    '......X..........',
    '......X..........',
    '.....DXD.........',
    '.....DXD.........',
    '.....DDD.........',
    '.....DXD.........',
    '....D.X.D........',
    '....D.X.D........',
    '....D.X.D........',
    '....D.X.D........',
    '.................',
    '.................',
    '.................',
    '.................',
    '.................',
    '.................',
    '.......OOO.......',
    '......OyyyO......',
    '.......OgO.......',
    '........D........',
    '........D........',
    '........D........',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '........Dk.......',
    '...XXXXXDkXXXX...',
    '.XXXXXXXDkXXXXXX.',
    'XXXXXXXDDDXXXXXXX',
    '.XXXXXXkkkXXXXXX.',
    '...XXXXXXXXXXX...',
  ],
};

/**
 * The network, 32x22: the platform's tile at the centre and its users round it. Users join two at a
 * time and the links between them multiply, then the whole web holds before it starts again. At rest
 * it shows all eight users.
 */
const network: PixelSprite = {
  id: 'ge19-opener-network',
  name: 'network of users',
  tags: ['ge19', 'animated'],
  blurb: 'A web of users joined to one platform, growing from two users to eight.',
  palette: GE_PALETTE,
  rows: [
    '.........MM..................MM.',
    '.........MC..........MM......MC.',
    '........GGGGtttt.....MC....tmmmm',
    '........GGGG....ttttBBBBttt.mmmm',
    '........t...n.......BBBB......t.',
    '.......t....n.......n.........t.',
    '......t......n.....n..........t.',
    '..MM.t........PPPP.n.........t..',
    '..MCt........PqqqqP..........t..',
    '.NNNNnnnnn...PqzzqP.........MM..',
    '.NNNN.....nnnPqzzqPnnnn.....MC..',
    '....t........PqqqqP....nnnnRRRR.',
    '....t.........pppp.........RRRR.',
    '....t............n...........t..',
    '.....t...........n...........t..',
    '.....t...........n...........t..',
    '.....t...........n...........t..',
    '.....MM..........MM.........MM..',
    '.....MC..........MC.........MC..',
    '....TTTTttttttttPPPPtttttttyyyy.',
    '....TTTT........PPPP.......yyyy.',
    '................................',
  ],
  frames: [
    [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '..MM..........PPPP..............',
      '..MC.........PqqqqP.............',
      '.NNNNnnnnn...PqzzqP.........MM..',
      '.NNNN.....nnnPqzzqPnnnn.....MC..',
      '.............PqqqqP....nnnnRRRR.',
      '..............pppp.........RRRR.',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
    [
      '.........MM.....................',
      '.........MC..........MM.........',
      '........GGGGtttt.....MC.........',
      '........GGGG....ttttBBBB........',
      '........t...n.......BBBB........',
      '.......t....n.......n...........',
      '......t......n.....n............',
      '..MM.t........PPPP.n............',
      '..MCt........PqqqqP.............',
      '.NNNNnnnnn...PqzzqP.........MM..',
      '.NNNN.....nnnPqzzqPnnnn.....MC..',
      '.............PqqqqP....nnnnRRRR.',
      '..............pppp.........RRRR.',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
    [
      '.........MM.....................',
      '.........MC..........MM.........',
      '........GGGGtttt.....MC.........',
      '........GGGG....ttttBBBB........',
      '........t...n.......BBBB........',
      '.......t....n.......n...........',
      '......t......n.....n............',
      '..MM.t........PPPP.n............',
      '..MCt........PqqqqP.............',
      '.NNNNnnnnn...PqzzqP.........MM..',
      '.NNNN.....nnnPqzzqPnnnn.....MC..',
      '....t........PqqqqP....nnnnRRRR.',
      '....t.........pppp.........RRRR.',
      '....t............n..............',
      '.....t...........n..............',
      '.....t...........n..............',
      '.....t...........n..............',
      '.....MM..........MM.............',
      '.....MC..........MC.............',
      '....TTTTttttttttPPPP............',
      '....TTTT........PPPP............',
      '................................',
    ],
    [
      '.........MM..................MM.',
      '.........MC..........MM......MC.',
      '........GGGGtttt.....MC....tmmmm',
      '........GGGG....ttttBBBBttt.mmmm',
      '........t...n.......BBBB......t.',
      '.......t....n.......n.........t.',
      '......t......n.....n..........t.',
      '..MM.t........PPPP.n.........t..',
      '..MCt........PqqqqP..........t..',
      '.NNNNnnnnn...PqzzqP.........MM..',
      '.NNNN.....nnnPqzzqPnnnn.....MC..',
      '....t........PqqqqP....nnnnRRRR.',
      '....t.........pppp.........RRRR.',
      '....t............n...........t..',
      '.....t...........n...........t..',
      '.....t...........n...........t..',
      '.....t...........n...........t..',
      '.....MM..........MM.........MM..',
      '.....MC..........MC.........MC..',
      '....TTTTttttttttPPPPtttttttyyyy.',
      '....TTTT........PPPP.......yyyy.',
      '................................',
    ],
    [
      '.........MM..................MM.',
      '.........MC..........MM......MC.',
      '........GGGGtttt.....MC....tmmmm',
      '........GGGG....ttttBBBBttt.mmmm',
      '........t...n.......BBBB......t.',
      '.......t....n.......n.........t.',
      '......t......n.....n..........t.',
      '..MM.t........PPPP.n.........t..',
      '..MCt........PqqqqP..........t..',
      '.NNNNnnnnn...PqzzqP.........MM..',
      '.NNNN.....nnnPqzzqPnnnn.....MC..',
      '....t........PqqqqP....nnnnRRRR.',
      '....t.........pppp.........RRRR.',
      '....t............n...........t..',
      '.....t...........n...........t..',
      '.....t...........n...........t..',
      '.....t...........n...........t..',
      '.....MM..........MM.........MM..',
      '.....MC..........MC.........MC..',
      '....TTTTttttttttPPPPtttttttyyyy.',
      '....TTTT........PPPP.......yyyy.',
      '................................',
    ],
    [
      '.........MM..................MM.',
      '.........MC..........MM......MC.',
      '........GGGGtttt.....MC....tmmmm',
      '........GGGG....ttttBBBBttt.mmmm',
      '........t...n.......BBBB......t.',
      '.......t....n.......n.........t.',
      '......t......n.....n..........t.',
      '..MM.t........PPPP.n.........t..',
      '..MCt........PqqqqP..........t..',
      '.NNNNnnnnn...PqzzqP.........MM..',
      '.NNNN.....nnnPqzzqPnnnn.....MC..',
      '....t........PqqqqP....nnnnRRRR.',
      '....t.........pppp.........RRRR.',
      '....t............n...........t..',
      '.....t...........n...........t..',
      '.....t...........n...........t..',
      '.....t...........n...........t..',
      '.....MM..........MM.........MM..',
      '.....MC..........MC.........MC..',
      '....TTTTttttttttPPPPtttttttyyyy.',
      '....TTTT........PPPP.......yyyy.',
      '................................',
    ],
  ],
  frameMs: 650,
};

/** The phone in the student's raised hand, 5x5, its screen flickering with messages. */
const phone: PixelSprite = {
  id: 'ge19-opener-phone',
  name: 'phone',
  tags: ['ge19', 'animated'],
  blurb: 'A small phone held up, its screen glowing.',
  palette: GE_PALETTE,
  rows: [
    '.DDD.',
    '.DND.',
    '.DND.',
    '.DND.',
    '.DDD.',
  ],
  frames: [
    [
      '.DDD.',
      '.DND.',
      '.DND.',
      '.DND.',
      '.DDD.',
    ],
    [
      '.DDD.',
      '.DzD.',
      '.DmD.',
      '.DmD.',
      '.DDD.',
    ],
  ],
  frameMs: 700,
};

/** One ring of the phone's signal, for a `rise` toward the network. */
const signal: PixelSprite = {
  id: 'ge19-opener-signal',
  name: 'signal',
  tags: ['ge19'],
  blurb: 'An arc of signal rising from a phone.',
  palette: GE_PALETTE,
  rows: [
    '.NNN.',
    'N...N',
  ],
};

/** A lit window's reflection on the water. */
const reflection: PixelSprite = {
  id: 'ge19-opener-reflection',
  name: 'reflection',
  tags: ['ge19'],
  blurb: 'The reflection of a lit window, a short gold streak on dark water.',
  palette: GE_PALETTE,
  rows: [
    'g',
    'O',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** Where the student stands. The phone, the signal and the network are placed from it. */
const STUDENT = { x: 30, y: 33 };
/** The phone's screen is the middle column of the 5x5 it is held in. */
const PHONE = { x: STUDENT.x + GE_STUDENT_HOLD.x, y: STUDENT.y + GE_STUDENT_HOLD.y };
/** The network floats above the phone, its platform tile straight over the screen. */
const NETWORK = { x: PHONE.x + 2 - 16, y: 2 };
/** The town's lit windows on row 24, each mirrored on the water below. */
const WINDOWS = [57, 61, 66, 70] as const;

const base = geCompose('ge19-opener-base', quayNight, [
  { sprite: props, x: 7, y: 9 },
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

export const ge19Opener: SceneArt = {
  id: 'ge19-opener',
  label: 'At night on a harbor quay below a town with every window lit, a student holds up a glowing phone while above them a network of users joined to one platform keeps growing.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: network, x: NETWORK.x, y: NETWORK.y },
    { sprite: phone, x: PHONE.x, y: PHONE.y },
    { sprite: signal, x: PHONE.x, y: PHONE.y - 5, motion: { kind: 'rise', amp: 6, periodMs: 2000 } },
    { sprite: signal, x: PHONE.x, y: PHONE.y - 5, motion: { kind: 'rise', amp: 6, periodMs: 2000, phase: 0.5 } },
    { sprite: geBeacon, x: 13, y: 8 },
    { sprite: geLampGlow, x: 14, y: 31, motion: { kind: 'twinkle', periodMs: 2800, min: 0.45 } },
    ...WINDOWS.map((x, i) => ({ sprite: reflection, x, y: 31 + (i % 2), motion: { kind: 'twinkle' as const, periodMs: 1900 + 300 * i, phase: 0.25 * i, min: 0.2 } })),
    { sprite: geStarBig, x: 62, y: 5, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 5, y: 3, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 53, y: 2, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 74, y: 9, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
    { sprite: geStar, x: 7, y: 13, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.55, min: 0.2 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Platforms: one platform at the centre of its users, a pulse running out along two links at a time. */
const emblemNetwork: PixelSprite = {
  id: 'ge19-emblem-network',
  name: 'emblem network',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'An orchid platform tile linked to six users, the links lighting up in turn.',
  palette: GE_PALETTE,
  rows: [
    '..z..........z..',
    '.zzz........zzz.',
    '.zzz........zzz.',
    '....N......NN...',
    '.....N....NN....',
    '.....NPPPPN.....',
    '.....PqqqqP.....',
    '.z...Pqzzqp...z.',
    'zzzNNPqzzqpNNzzz',
    'zzz..PqqqqP..zzz',
    '.....Npppp......',
    '.....NN...N.....',
    '....NN.....N....',
    '...zN......Nz...',
    '..zzz......zzz..',
    '..zzz......zzz..',
  ],
  frames: [
    [
      '..z..........z..',
      '.zzz........zzz.',
      '.zzz........zzz.',
      '....N......NN...',
      '.....N....NN....',
      '.....NPPPPN.....',
      '.....PqqqqP.....',
      '.z...Pqzzqp...z.',
      'zzzNNPqzzqpNNzzz',
      'zzz..PqqqqP..zzz',
      '.....Npppp......',
      '.....NN...N.....',
      '....NN.....N....',
      '...zN......Nz...',
      '..zzz......zzz..',
      '..zzz......zzz..',
    ],
    [
      '..z..........x..',
      '.zzz........xxx.',
      '.zzz........xxx.',
      '....N......nn...',
      '.....N....nn....',
      '.....NPPPPn.....',
      '.....PqqqqP.....',
      '.x...Pqzzqp...x.',
      'xxxnnPqzzqpnnxxx',
      'xxx..PqqqqP..xxx',
      '.....npppp......',
      '.....nn...N.....',
      '....nn.....N....',
      '...xn......Nz...',
      '..xxx......zzz..',
      '..xxx......zzz..',
    ],
    [
      '..x..........z..',
      '.xxx........zzz.',
      '.xxx........zzz.',
      '....n......NN...',
      '.....n....NN....',
      '.....nPPPPN.....',
      '.....PqqqqP.....',
      '.x...Pqzzqp...x.',
      'xxxnnPqzzqpnnxxx',
      'xxx..PqqqqP..xxx',
      '.....Npppp......',
      '.....NN...n.....',
      '....NN.....n....',
      '...zN......nx...',
      '..zzz......xxx..',
      '..zzz......xxx..',
    ],
    [
      '..x..........x..',
      '.xxx........xxx.',
      '.xxx........xxx.',
      '....n......nn...',
      '.....n....nn....',
      '.....nPPPPn.....',
      '.....PqqqqP.....',
      '.z...Pqzzqp...z.',
      'zzzNNPqzzqpNNzzz',
      'zzz..PqqqqP..zzz',
      '.....npppp......',
      '.....nn...n.....',
      '....nn.....n....',
      '...xn......nx...',
      '..xxx......xxx..',
      '..xxx......xxx..',
    ],
  ],
  frameMs: 520,
};

export const ge19Finish: SceneArt = geKeepsake(
  'ge19-finish',
  'A postage stamp with perforated edges and an emerald frame, showing an orchid platform tile at the centre of six users, the links between them lighting up in turn, with small sparkles around it.',
  emblemNetwork,
);

export const art: LessonArtSet = { opener: ge19Opener, backdrop: geBackdrop, finish: ge19Finish };
