/**
 * Business Strategy lesson 14 opener: the chain that brings the goods in, and the storm that breaks it.
 *
 * Built on bsHarbour. On the jetty a timber crane with a winch wheel lifts a crate off our supply ship,
 * moored alongside under its orchid sail, and stacks it with the rest; a second ship under teal sail
 * makes for the harbour, the second source; and out at sea a squall rolls across the moon, lightning
 * and rain, the disruption a second source is there to cover. The sail and the moon are the brightest
 * marks; the squall is a grey step over the dark sky. Moving: the crate rises and lowers, both ships
 * ride the swell out of step, the squall drifts, lightning strikes, rain falls, the lighthouse and the
 * jetty lantern burn and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsStar } from './bs-kit';
import { bsHarbour } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const crane: PixelSprite = {
  id: 'bs14-crane',
  name: 'crane',
  tags: [],
  blurb: 'A timber crane with a winch wheel, its foot on the jetty (bottom row). The rope hangs from the pulley at (x + 15, y + 1).',
  rows: [
    '.........xxxxxDD',
    '...Oxxxxx...OODD',
    '...gO.....OOOO..',
    '...gO...OOOO....',
    '...gO.OOOO......',
    '...OOOOO........',
    '.OOgOO..........',
    'XD.gO...........',
    'DD.gO...........',
    'DD.gO...........',
    '...gO...........',
    '...gO...........',
    '...gO...........',
    '...gO...........',
    '...gO...........',
    '...gO...........',
    '...gO...........',
    '...gO...OO......',
    '...gO.gO..Og....',
    '...gO.Og..gO....',
    '...gOO..DD..O...',
    '...gOO..DD..O...',
    '...gO.Og..gO....',
    '...gO.gO..Og....',
    '...gO...OO......',
    '..OOOOOOOOOOOO..',
  ],
};

const CRATE = ['OOOOO', 'OgGgO', 'OGgGO', 'OOOOO'];

/** The rope paid out `length` rows with the crate on its hook, in one 5x18 frame. */
function loadAt(length: number): string[] {
  return Array.from({ length: 18 }, (_, y) => (y < length ? '..x..' : y === length ? '..D..' : (CRATE[y - length - 1] ?? '.....')));
}

const loadRows = loadAt(4);

const load: PixelSprite = {
  id: 'bs14-load',
  name: 'load',
  tags: [],
  blurb: "The crane's rope with a crate on the hook: the crate lowers into the ship and comes back up.",
  rows: loadRows,
  frames: [4, 7, 10, 13, 13, 10, 7, 4].map(loadAt),
  frameMs: 480,
};

const crates: PixelSprite = {
  id: 'bs14-crates',
  name: 'crates',
  tags: [],
  blurb: 'Crates stacked on the jetty, standing on their bottom row.',
  rows: [
    '...OOOOO...',
    '...OgGgO...',
    '...OGgGO...',
    '...OOOOO...',
    'OOOOO.OOOOO',
    'OgGgO.OgGgO',
    'OGgGO.OGgGO',
    'OOOOO.OOOOO',
  ],
};

const shipOurs: PixelSprite = {
  id: 'bs14-ship-ours',
  name: 'ship-ours',
  tags: [],
  blurb: 'Our supply ship under its orchid sail, moored with its stern at the jetty; the open deck at the stern (x + 1..5) is where the crate comes and goes.',
  rows: [
    '...........y......',
    '...........D......',
    '......EEEEEDEEEEE.',
    '.......qPPPDPPPE..',
    '......qPPPPDPPPPE.',
    '......qPPPPDPPPPE.',
    '......qPPPPDPPPPE.',
    '......qGGGGDGGGGE.',
    '......qPPPPDPPPPE.',
    '......qPPPPDPPPPE.',
    '......qPPPPDPPPPE.',
    '......qPPPPDPPPPE.',
    '......EEEEEDEEEEE.',
    'O..........D.....O',
    'O..........D....O.',
    'OOOOOOOOOOOOOOOOOO',
    '.ggggOgggOgggOggg.',
    '..OOOOOOOOOOOOOO..',
    '...gggggggggggg...',
    '....OOOOOOOOOO....',
    '.....bbbbbbbb.....',
  ],
};

const shipTeal: PixelSprite = {
  id: 'bs14-ship-teal',
  name: 'ship-teal',
  tags: [],
  blurb: 'The second supplier, a ship under teal sail making for the harbour.',
  rows: [
    '......D.......',
    '......D.......',
    '..ttttDtttt...',
    '..mTTTDTTTt...',
    '..mTTTDTTTt...',
    '..mTTTDTTTt...',
    '..mTTTDTTTt...',
    '..mTTTDTTTt...',
    '..ttttDtttt...',
    '......D......O',
    'OOOOOOOOOOOOOO',
    '.gggggggggggg.',
    '..OOOOOOOOOO..',
    '....bbbbbb....',
  ],
};

const storm: PixelSprite = {
  id: 'bs14-storm',
  name: 'storm',
  tags: [],
  blurb: 'A squall cloud lit along its top by the moon it is crossing.',
  rows: [
    '......xxxx............',
    '...xxxDDDDxx..xxxx....',
    '..xDDDDDDDDDxxDDDDx...',
    '.xDDDDDDDDDDDDDDDDDx..',
    'xDDDDDDDDDDDDDDDDDDDx.',
    'kDDDDDDDDDDDDDDDDDDDDk',
    '.kkDDDDkkkDDDDDkkDDkk.',
    '...kkkk...kkkkk..kk...',
  ],
};

const boltRows = [
  '.y.',
  '.Wy',
  'yW.',
  'W..',
  '.y.',
  '..y',
  '.yW',
  'yW.',
  'W..',
  '.y.',
  '..y',
  '..W',
];

const boltDark = boltRows.map((row) => row.replace(/./g, '.'));

const bolt: PixelSprite = {
  id: 'bs14-bolt',
  name: 'bolt',
  tags: [],
  blurb: 'Lightning from the squall down to the sea: two quick strikes, then dark a while.',
  rows: boltRows,
  frames: [boltRows, boltDark, boltRows, ...Array.from({ length: 9 }, () => boltDark)],
  frameMs: 160,
};

const rainRows = [
  'b...b...b.',
  '..B...B...',
  '.b...b...b',
  '...B...B..',
  'b...b...b.',
  '..B...B...',
];

/** The rain moved `by` columns along, wrapping round, so it falls slant. */
const rainShifted = (by: number) => rainRows.map((row) => row.slice(-by) + row.slice(0, -by));

const rain: PixelSprite = {
  id: 'bs14-rain',
  name: 'rain',
  tags: [],
  blurb: 'Rain falling slant under the squall.',
  rows: rainRows,
  frames: [rainRows, rainShifted(1), rainShifted(2), rainShifted(3)],
  frameMs: 240,
};

const beacon: PixelSprite = {
  id: 'bs14-beacon',
  name: 'beacon',
  tags: [],
  blurb: "The lighthouse lamp, for a twinkle layer over the lamp room.",
  rows: [
    'yy',
    'GG',
  ],
};

const lantern: PixelSprite = {
  id: 'bs14-lantern',
  name: 'lantern',
  tags: [],
  blurb: "The lantern on the jetty's lamp post.",
  rows: [
    '.O.',
    'OyO',
    'OGO',
    'OOO',
  ],
};

export const bs14Opener: SceneArt = {
  id: 'bs14-opener',
  label: 'At a night harbour a crane lifts crates off a supply ship onto the jetty while a second ship sails in, and out at sea a storm breaks across the moon.',
  width: 80,
  height: 60,
  base: bsHarbour,
  layers: [
    { sprite: bsStar, x: 30, y: 4, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: bsStar, x: 45, y: 9, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.2 } },
    { sprite: bsStar, x: 76, y: 3, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.8, min: 0.2 } },
    { sprite: beacon, x: 4, y: 3, motion: { kind: 'twinkle', periodMs: 1600, min: 0.3 } },
    { sprite: storm, x: 57, y: 8, motion: { kind: 'drift', amp: 2, periodMs: 7000 } },
    { sprite: rain, x: 62, y: 16 },
    { sprite: bolt, x: 72, y: 16 },
    { sprite: shipTeal, x: 50, y: 27, motion: { kind: 'bob', amp: 1, periodMs: 2300, phase: 0.4 } },
    { sprite: shipOurs, x: 31, y: 29, motion: { kind: 'bob', amp: 1, periodMs: 2700 } },
    { sprite: crane, x: 18, y: 26 },
    { sprite: load, x: 31, y: 27 },
    { sprite: crates, x: 6, y: 43 },
    { sprite: lantern, x: 2, y: 33, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.3, min: 0.5 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs14-emblem-chain',
  name: 'emblem-chain',
  tags: [],
  blurb: 'Lesson 14 emblem, 16x16: two gold chain links locked together.',
  rows: [
    '...........OOOO.',
    '..........OyyyyO',
    '.........Oyy..GO',
    '........Oyy...GO',
    '.......Oyy...GGO',
    '.......yy...GGO.',
    '.......yO..GGO..',
    '....OyyOyOGGO...',
    '...OyyOyOGGO....',
    '..Oyy..OG.......',
    '.Oyy...GG.......',
    'Oyy...GGO.......',
    'Oy...GGO........',
    'Oy..GGO.........',
    'OyGGGO..........',
    '.OOOO...........',
  ],
};

export const bs14Finish: SceneArt = bsKeepsake(
  'bs14-finish',
  'A purple house banner on a gold rod, its roundel showing two gold chain links locked together.',
  emblem,
);

export const art: LessonArtSet = { opener: bs14Opener, backdrop: bsBackdrop, finish: bs14Finish };
