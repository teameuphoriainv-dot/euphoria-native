/**
 * Corporate Finance lesson 25, the Advanced Capstone: every decision at once, from the head of the
 * table.
 *
 * Opener: lesson 1's hall come full circle. All three doors stand open on their light (green
 * through invest, blue through finance, gold through return), every sign above them is lit, and
 * the CFO now sits at the centre of the long board table, framed in the finance doorway. Along the
 * table stand the small crystal awards of the lessons behind him, and in front of him this one,
 * in gold. The three lit doorways are the brightest surfaces. Only small layers move: the three
 * signs and the three transoms lighting in turn, light rising in the two side doorways, a glint
 * on the gold award.
 *
 * Backdrop: the pathway's own, with no new base: more of the tower, the works and the warehouse
 * lit up for the night, and a gold beacon on the head-office mast.
 *
 * Keepsake: the pathway's award in gold glass, a laurel wreath and a white star inside.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfHall, cfPlaque, cfSignFinance, cfSignInvest, cfSignReturn } from './cf-kit';
import { cfRecolor } from './cf-kit-a';
import { cfBoardTable, cfDirector } from './cf-kit-b';
import { cfSignFinanceDim, cfSignInvestDim, cfSignReturnDim } from './cf-kit-c';
import type { LessonArtSet, SceneArt, SceneLayer } from './types';

/** The three doorways, left to right, with the tones of the light beyond each and its transom. */
const DOORS = [
  { x: 2, sign: cfSignInvest, dim: cfSignInvestDim, top: 'm', mid: 'N', floor: 'n', transom: 'n', lit: ['NNNNNNNNNN', 'NmmmmmmmmN'] },
  { x: 32, sign: cfSignFinance, dim: cfSignFinanceDim, top: 'B', mid: 'b', floor: 'C', transom: 'b', lit: ['BBBBBBBBBB', 'BBwwwwwwBB'] },
  { x: 62, sign: cfSignReturn, dim: cfSignReturnDim, top: 'y', mid: 'G', floor: 'g', transom: 'g', lit: ['GGGGGGGGGG', 'GGyyyyyyGG'] },
] as const;
const DOOR = { y: 15, w: 16, h: 27 } as const;

/**
 * An open doorway in lesson 1's gold frame: the transom, and below it the lit room beyond, bright
 * at the top and darker toward its floor, with the walnut door swung in against the far jamb.
 */
function doorway(id: string, top: string, mid: string, floor: string, transom: string): PixelSprite {
  const room = (j: number) => {
    const tone = j < 13 ? top : j < 21 ? mid : floor;
    return Array.from({ length: 10 }, (_, i) => (j > 6 && i === 7 ? 'A' : j > 6 && i > 7 ? 'a' : tone)).join('');
  };
  return {
    id,
    name: id,
    tags: ['scene', 'cf25'],
    blurb: 'An open doorway in a gold frame, lit from beyond.',
    palette: CF_PALETTE,
    rows: Array.from({ length: DOOR.h }, (_, j) => {
      if (j === 0) return 'O'.repeat(DOOR.w);
      if (j === 1) return `.${'g'.repeat(DOOR.w - 2)}.`;
      if (j === 2 || j === 5) return `.O${'a'.repeat(DOOR.w - 4)}O.`;
      return `.Oa${j < 5 ? transom.repeat(10) : room(j)}aO.`;
    }),
  };
}

/** The CFO seated at the table: the director's pose in the CFO's orchid suit, gold tie and hair. */
const cfoSeated = cfRecolor(cfDirector, 'cf25-cfo-seated', { X: 'D', D: 'E', B: 'P', b: 'p', r: 'G' }, 'The CFO seated at the board table.');

/** One of the small crystal awards the earlier lessons gave: blue glass on a gold foot. */
const award: PixelSprite = { id: 'cf25-award', name: 'cf25-award', tags: ['scene', 'cf25'], palette: CF_PALETTE, rows: ['Bwb', 'BCb', 'Bbb', 'OGO'] };

/** This lesson's award, in gold, set on the table in front of the CFO. */
const awardGold: PixelSprite = { id: 'cf25-award-gold', name: 'cf25-award-gold', tags: ['scene', 'cf25'], rows: ['.yyG.', 'yWyGg', 'yyGGg', 'yGGgg', 'OOOOO', 'OyGgO'] };

const AWARDS_AT: readonly number[] = [2, 7, 12, 17, 22, 27, 50, 55, 60, 65, 70, 75];
const table = cfBoardTable('cf25-table', 80);

const base = cfCompose('cf25-opener-base', cfHall, [
  ...DOORS.flatMap((d, i): [PixelSprite, number, number][] => [
    [doorway(`cf25-doorway-${String(i)}`, d.top, d.mid, d.floor, d.transom), d.x, DOOR.y],
    [cfPlaque, d.x + 2, 4],
    [d.dim, d.x + 4, 6],
  ]),
  [cfoSeated, 34, 29],
  [table, 0, 44],
  ...AWARDS_AT.map((x): [PixelSprite, number, number] => [award, x, 40]),
  [awardGold, 37, 38],
], 'The still hall: three open doorways lit green, blue and gold under their plaques, the CFO at the centre of the board table, the awards along it.');

/** A mote of light drifting up through a doorway. */
const mote: PixelSprite = { id: 'cf25-opener-mote', name: 'cf25-opener-mote', tags: ['scene', 'cf25'], rows: ['w', 'w'] };
const glint: PixelSprite = { id: 'cf25-opener-glint', name: 'cf25-opener-glint', tags: ['scene', 'cf25'], rows: ['.w.', 'wWw', '.w.'] };

export const cf25Opener: SceneArt = {
  id: 'cf25-opener',
  label: 'In the head office hall all three doors stand open on green, blue and gold light under their lit signs, and the finance chief sits at the centre of the long board table behind a gold award.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...DOORS.flatMap((d, i): SceneLayer[] => [
      {
        sprite: { id: `cf25-opener-transom-${String(i)}`, name: `cf25-opener-transom-${String(i)}`, tags: ['scene', 'cf25'], rows: [...d.lit] },
        x: d.x + 3,
        y: DOOR.y + 3,
        motion: { kind: 'twinkle', periodMs: 3000, phase: i / 3, min: 0.35 },
      },
      { sprite: d.sign, x: d.x + 4, y: 6, motion: { kind: 'twinkle', periodMs: 3000, phase: i / 3 + 0.15, min: 0.4 } },
    ]),
    { sprite: mote, x: DOORS[0].x + 6, y: 30, motion: { kind: 'rise', amp: 8, periodMs: 2600 } },
    { sprite: mote, x: DOORS[2].x + 5, y: 31, motion: { kind: 'rise', amp: 8, periodMs: 2900, phase: 0.5 } },
    { sprite: glint, x: 37, y: 37, motion: { kind: 'twinkle', periodMs: 2200, min: 0 } },
  ],
};

/** More of the tower's windows lit than on any other evening: the 2x2 windows lesson 1 left dark. */
const litTowerC: PixelSprite = {
  id: 'cf25-backdrop-lit-tower-c',
  name: 'cf25-backdrop-lit-tower-c',
  tags: [],
  rows: [
    '...OO.....OO',
    '...OO.....OO',
    '............',
    'OO..........',
    'OO..........',
    '............',
    '...OO.......',
    '...OO.......',
    '............',
    'OO....OO....',
    'OO....OO....',
    '............',
    'OO....OO....',
    'OO....OO....',
  ],
};

/** The rest of the works' windows. */
const litWorksB: PixelSprite = { id: 'cf25-backdrop-lit-works-b', name: 'cf25-backdrop-lit-works-b', tags: [], rows: ['OO......OO..OO......OO', 'OO......OO..OO......OO'] };

/** Two strips of the warehouse's long windows. */
const litWarehouse: PixelSprite = {
  id: 'cf25-backdrop-lit-warehouse',
  name: 'cf25-backdrop-lit-warehouse',
  tags: [],
  rows: ['OOOOOOO.........', '................', '................', '................', '.........OOOOOOO'],
};

/** A gold beacon on the tip of the head-office mast, deep gold so it stays quiet behind text. */
const beaconGold: PixelSprite = { id: 'cf25-backdrop-beacon-gold', name: 'cf25-backdrop-beacon-gold', tags: [], rows: ['O'], frames: [['O'], ['D']], frameMs: 1300 };

export const cf25Backdrop: SceneArt = {
  ...cfBackdrop,
  id: 'cf25-backdrop',
  label: 'The factory, head office tower, bank and warehouse at dusk with more windows lit than ever and a gold beacon shining on the tower mast, crates riding the conveyor along the street.',
  layers: [
    ...cfBackdrop.layers,
    { sprite: litTowerC, x: 34, y: 20, motion: { kind: 'twinkle', periodMs: 7000, min: 0.35, phase: 0.8 } },
    { sprite: litWorksB, x: 4, y: 30, motion: { kind: 'twinkle', periodMs: 6300, min: 0.4, phase: 0.55 } },
    { sprite: litWarehouse, x: 80, y: 31, motion: { kind: 'twinkle', periodMs: 8100, min: 0.35, phase: 0.2 } },
    { sprite: beaconGold, x: 42, y: 0 },
  ],
};

/** Lesson 25's emblem: a green laurel wreath tied with an orchid ribbon round a white star. */
const emblemWreath: PixelSprite = {
  id: 'cf25-emblem-wreath',
  name: 'cf25-emblem-wreath',
  tags: [],
  blurb: 'A green laurel wreath tied with an orchid ribbon round a white star.',
  rows: [
    '................',
    '..mN........mN..',
    '..Nn........Nn..',
    '.mN....WW....mN.',
    '.Nn...WWWW...Nn.',
    'mN..WWWWwwww..mN',
    'Nn...WWWwww...Nn',
    'mN....WWww....mN',
    'Nn...WW..ww...Nn',
    '.mN.WW....ww.mN.',
    '.Nn..........Nn.',
    '..mN........mN..',
    '..Nn........Nn..',
    '....mN.PP.mN....',
    '....NnPqpPNn....',
    '......p..p......',
  ],
};

/**
 * The capstone keepsake: the pathway's award with its glass turned to gold. The block keeps its
 * shape; its two glass tones become amber and its blue rim gold, and the glint, sparkles and motes
 * that were edged in blue are edged in gold, so nothing on it is the other lessons' blue.
 */
const plain = cfKeepsake(
  'cf25-finish',
  'A gold glass award on a gold stand with a green laurel wreath round a white star inside, and small gold sparkles around it.',
  emblemWreath,
);
const golden = new Map<PixelSprite, PixelSprite>();
const toGold = (sprite: PixelSprite): PixelSprite => {
  const had = golden.get(sprite);
  if (had) return had;
  const made = cfRecolor(sprite, `${sprite.id}-gold`, { B: 'y' });
  golden.set(sprite, made);
  return made;
};
const goldBlock = cfRecolor(plain.base, 'cf25-finish-block', { B: 'y', b: 'g' });

export const cf25Finish: SceneArt = {
  ...plain,
  base: { ...goldBlock, palette: { ...goldBlock.palette, c: '#4A3412', C: '#6E5020' } },
  layers: plain.layers.map((layer) => (layer.sprite === emblemWreath ? layer : { ...layer, sprite: toGold(layer.sprite) })),
};

export const art: LessonArtSet = { opener: cf25Opener, backdrop: cf25Backdrop, finish: cf25Finish };
