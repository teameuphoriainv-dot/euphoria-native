/**
 * Scene: an authored idea acted out as a short Atlas clip, one beat at a time, captioned in the
 * lesson's own words.
 *
 * WHY THIS EXISTS. The Euphoria web recording (research 2026-09-22, lessons/sheet_01..02.png) shows
 * the Diversification lesson's "The principle" slide as a wall of about 1,000 characters, and the
 * mobile deck derived from slides like it is an idea card holding one compressed sentence. The
 * Brilliant recording shows what replaces a wall: a picture that plays once on arrival (their
 * Hilbert curve draws for about 1.9s, then stops) and a stepper whose beats each change one thing,
 * with the words outside the picture. This file is the data half of that: a table of beat scripts
 * and a pure builder. The renderer is components/mobile-lesson/parts/scene-card.tsx.
 *
 * THE RULE FOR A SCRIPT, and why each part of it is here:
 *   - EVERY CAPTION IS AUTHORED TEXT, WORD FOR WORD. `buildScene` returns null unless each caption
 *     appears verbatim in the step's authored text. A scene cannot put a sentence on screen the
 *     lesson does not contain, so a re-sync that rewrites the step removes the card instead of
 *     leaving it captioning a lesson that no longer says that (CONSTITUTION 3.1, and the null is
 *     the staleness check parts/placements.ts relies on).
 *   - GUARDS are extra phrases that pin the script to this exact step's content. A caption can
 *     survive a rewrite by coincidence (a short one like "Inflation is rising prices." could turn
 *     up in a different step); three distinctive phrases together cannot.
 *   - NO MAGNITUDE IS DRAWN AS SIZE. Scaling a 16x16 sprite on both axes makes its area grow with
 *     the square of the number, so a "2x" drawn as scale reads as 4x. Numbers stay in the caption.
 *     The only counts drawn are `stack` and `count` copies, and their `n` must be plain math on
 *     text in the same caption (`derivedFrom`): "double" gives 2, "$10,063" over "$1,000" gives
 *     floor(10.063) = 10, floor because the web pictograph never rounds a unit up.
 *   - ATLAS IS IN THE CLIP, AND ONLY HIS FACE ACTS. The owner ruled (2026-09-22) that lesson
 *     clickthroughs are short clips with Atlas. Each beat names his expression (`atlas`); he never
 *     speaks, because a speech bubble would be a sentence the lesson did not write. He nods on each
 *     beat and hops once on a last beat whose mood is happy or proud; the hop is the only overshoot
 *     in the clip (AGENTS.md: overshoot is for characters and rewards, never data).
 *
 * ONE MASCOT PER SCREEN (CONSTITUTION 5.6, PINNED). lesson.tsx draws the floating Ask-Atlas button
 * on every step. While a scene card is the active card that is a second Atlas, so the integrator
 * hides the floating button then, the same contract as the clip kit's CLIP_DRAWS_ATLAS
 * (components/mobile-lesson/clickthrough/pixel-stage.tsx). `SCENE_DRAWS_ATLAS` names this file in
 * that condition.
 *
 * NAME. `SceneSpec` is already the pixel-art scene in ../types.ts (archetype, accent, overlay) and
 * has no `kind`, so the part spec is `ScenePartSpec` to keep the MobileInteractive union
 * discriminated.
 */
import type { LessonStep } from '@/lib/curriculum';
import type { PixelSprite } from '../../pixel/types';
import { SPRITE_CATALOGUE } from '../../pixel/catalogue';
import { SPRITES_BY_ID } from '../../pixel/sprites';
import { SCENE_PROPS } from '../../pixel/sprites-additions';
import { composeScene, MOBILE_KIT, MOBILE_KIT_ACCENTS } from '../../pixel/sprites-mobile-kit';

/** A scene card mounts Atlas, so the lesson's floating Atlas must hide while it is the active card. */
export const SCENE_DRAWS_ATLAS = true;

/**
 * Who is on stage. `px:<id>` is a catalogue sprite with the `lesson` slot; `kit:<archetype>[:<accent>]`
 * is a mobile-kit archetype recoloured through composeScene; `add:<id>` is a scene-only prop from
 * sprites-additions.ts SCENE_PROPS (art the catalogue does not have).
 *
 * NAMESPACED BECAUSE FOUR IDS COLLIDE. `shield` and `target` exist in both sprites.ts and the kit,
 * `anchor` and `crowd` in both sprites-lesson.ts and the kit (research inv.mjs, 2026-09-22). A bare
 * "shield" would silently pick whichever table was checked first.
 */
export type SceneActorKey = `px:${string}` | `kit:${string}` | `add:${string}`;

/** Where an actor stands. Thirds across, three heights, plus two off-stage marks for slides. */
export type SceneMark =
  | 'left'
  | 'center'
  | 'right'
  | `${'left' | 'center' | 'right'}-${'high' | 'low'}`
  | 'off-left'
  | 'off-right';

/**
 * What an actor does in a beat.
 *   enter  rise in at `to` (default center)      exit   fade out where it stands
 *   slide  move from `from` (default where it is) to `to`
 *   play   show at `to` and run the sprite's frames once
 *   stack  `n` copies drop onto a pile at `to`     count  `n` small copies stamp into a grid at `to`
 * There is no `grow` or `shrink`: see "NO MAGNITUDE IS DRAWN AS SIZE" above.
 */
export type SceneVerb = 'enter' | 'exit' | 'slide' | 'play' | 'stack' | 'count';

export interface SceneCue {
  actor: SceneActorKey;
  do: SceneVerb;
  to?: SceneMark;
  from?: SceneMark;
  /** Copies for `stack` and `count`. Must be plain math on `derivedFrom`. */
  n?: number;
  /** The caption text `n` comes from. Every entry must appear in the beat's caption. */
  derivedFrom?: string[];
  /** Start offset inside the beat, so two cues on one beat can land one after the other. */
  atMs?: number;
}

/**
 * Atlas's face on a beat. The same names as AtlasExpression in components/atlas.tsx, restated here
 * because this file must load under plain node for the pins, and atlas.tsx pulls in React Native.
 * scene-card.tsx passes it straight to <Atlas>, so tsc fails if the two lists ever drift apart.
 */
export const SCENE_ATLAS_MOODS = ['default', 'watching', 'happy', 'whoa', 'silly', 'sad', 'thinking', 'proud', 'oops'] as const;
export type SceneAtlasMood = (typeof SCENE_ATLAS_MOODS)[number];

export interface SceneBeat {
  /** Authored text, verbatim. Shown under the stage, never inside it. */
  caption: string;
  cast: SceneCue[];
  /** Atlas's expression while this beat plays. Chosen to match what the caption says, not decoration. */
  atlas: SceneAtlasMood;
}

export interface SceneScript {
  /** Phrases that must all be in the step's authored text, or the scene is not built. */
  guards: string[];
  /** Which derived card this scene takes the place of (Placement.slot in placements.ts). */
  slot: 'idea' | 'interactive';
  /** 3 to 6. Fewer is not a scene, more is the wall of text again in instalments. */
  beats: SceneBeat[];
}

/**
 * The deck interactive this part renders as. `course` picks the stage's floor band colour
 * (courseAccent); it is absent only when a caller built the scene without a placement key.
 */
export type ScenePartSpec = { kind: 'scene'; prompt: string; beats: SceneBeat[]; course?: string };

/** The one fixed line the card adds. Everything else on the card is the lesson's own text. */
export const SCENE_PROMPT = 'Watch the idea play out';

export const MIN_BEATS = 3;
export const MAX_BEATS = 6;
/** One caption must fit three lines at 393pt, the same ceiling the research verifier used. */
export const CAPTION_MAX_CHARS = 125;
/**
 * Reading time per caption character during autoplay (the clip kit's timing.ts reads this too, so a
 * scene and a clip never disagree about how fast a teen reads).
 *
 * WHY THE HOLD IS NOT JUST THE MOTION. The captions run 26 to 122 characters. Held only for its
 * motion, a 122-character caption would be gone before a teen finished reading it, and autoplay
 * would be skimming the lesson for them. 50ms a character is roughly 240 words a minute.
 */
export const READ_MS_PER_CHAR = 50;

/*
 * MOTION. The first tempo was measured off the Brilliant recording (research2/brilliant-lessons.md
 * M2, M3, M7; frames in research2/frames/timing/): 280ms entrances, 400ms slides, beats capped at
 * 1.5s. On device that read as a flicker: most beats were over in one to three seconds and a teen
 * saw a prop arrive rather than watched it act. Owner ruling 2026-09-24: the learn-part visuals
 * run longer and animate more. So every value below is roughly twice the measured one, the cue
 * offsets authored in SCENES are stretched by CUE_DELAY_SCALE instead of being rewritten one by
 * one, and a `play` sprite runs its frames PLAY_FRAME_SCALE slower. The ratios between them are
 * the measured ones, so the clip keeps Brilliant's rhythm at a calmer tempo. Literals, not imports
 * from shared/motion/tokens.ts, because the pins load this file under plain node where Reanimated
 * cannot.
 *   ACTOR_ENTER_MS 600  one element arriving, with room to rise and settle onto its mark.
 *   ACTOR_SLIDE_MS 1000 a move across the stage; the eye can follow it the whole way.
 *   ACTOR_EXIT_MS  260  leaving. Still the quickest motion on stage: an exit is not the news.
 *   CAPTION_OUT/GAP/IN  200 / 150 / 450: the words swap the way their screens do, exit, a beat of
 *                       empty, then fade in (M7, next.jpg f4-f8). Without the gap the old and new
 *                       sentence overlap for a frame and read as one garbled line.
 *   COPY_STAGGER_MS 200 one copy of a pile or tally after another, slow enough to count along.
 *   BEAT_MOTION_MAX_MS 3500  equal to the clip kit's BEAT_MAX_MS (part-scene-pin asserts it). Past
 *                       this a beat stops being a picture the learner drives and becomes a video
 *                       they wait on; Next is disabled for the whole of it.
 */
export const ACTOR_ENTER_MS = 600;
export const ACTOR_SLIDE_MS = 1000;
export const ACTOR_EXIT_MS = 260;
export const CAPTION_OUT_MS = 200;
export const CAPTION_GAP_MS = 150;
export const CAPTION_IN_MS = 450;
export const COPY_STAGGER_MS = 200;
export const BEAT_MOTION_MAX_MS = 3500;
/** Authored `atMs` offsets were written against the first tempo; stretch them with the rest. */
export const CUE_DELAY_SCALE = 2;
/** A `play` sprite runs each frame this many times its authored length, so the action reads. */
export const PLAY_FRAME_SCALE = 2;
/**
 * After a beat's cues land, the props they moved give one small swell (up to ACCENT_SCALE and back
 * over ACCENT_MS) so the eye goes to what just changed. Each half is a monotonic timing, never a
 * spring: a prop is not a character, so it gets no overshoot (AGENTS.md).
 */
export const ACCENT_MS = 700;
export const ACCENT_SCALE = 1.08;
/** A sprite's frames default to 120ms each (pixel/types.ts `frameMs`). */
const DEFAULT_FRAME_MS = 120;

/**
 * THE AUTHORED SCRIPTS, keyed `course:lesson:stepIndex` like PLACEMENTS (`lesson` is the lesson's
 * `num`, as stepId writes it).
 *
 * Captions and guards are verbatim from the raw corpus; part-scene-pin re-checks every one on every
 * run. Where a caption would repeat a line a sibling card already shows, a different sentence was
 * picked: investing-fundamentals:3:2's takeaway already says "Nobody changed the return." and
 * personal-finance:20:2's says "judge an account by its rate minus inflation", so neither appears
 * here (CONSTITUTION 5.1, say a thing once).
 *
 * HOW THE 2026-09-22 ADDITIONS WERE PICKED. Owner ruling: hand-picked, not auto-rollout. Each is a
 * teaching slide whose derived deck has an `idea` card (so the slot exists), in a lesson with at
 * most three hands-on steps (slider, dragSort, buildIt, progressiveCalc, calculator, explorable,
 * decisionTree) and most with none, teaching an idea a teen has heard of and usually gets wrong:
 * marginal tax brackets, loss aversion, network effects, the 25x freedom number, bubbles, debt vs
 * equity, anchoring, good vs bad debt. Lessons the design's stage/predict/build/place cards claim
 * were skipped, because a deck holds one interactive.
 */
export const SCENES: Record<string, SceneScript> = {
  /* investingFundamentals.ts:782-796, "How Compound Interest Works". */
  'investing-fundamentals:3:2': {
    slot: 'idea',
    guards: ['earning returns on your returns', 'doubles every 9 years', 'it is the mechanism'],
    beats: [
      {
        caption: 'Compound interest means earning returns on your returns.',
        atlas: 'watching',
        cast: [{ actor: 'px:coin', do: 'play', to: 'center' }],
      },
      {
        caption: 'That is exponential growth: slow at first, then steep.',
        atlas: 'whoa',
        cast: [
          { actor: 'px:coin', do: 'slide', to: 'left-low' },
          { actor: 'kit:compound:green', do: 'play', to: 'right', atMs: 300 },
        ],
      },
      {
        caption: 'The Rule of 72 estimates doubling time, divide 72 by your return.',
        atlas: 'thinking',
        cast: [
          { actor: 'px:coin', do: 'exit' },
          { actor: 'kit:compound:green', do: 'exit' },
          { actor: 'px:hourglass', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'px:calculator', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'At 8% money doubles every 9 years, at 10% every 7.2 years, at 12% every 6 years.',
        atlas: 'happy',
        cast: [
          { actor: 'px:calculator', do: 'exit' },
          { actor: 'px:stack-cash', do: 'stack', to: 'right', n: 2, derivedFrom: ['doubles'], atMs: 200 },
        ],
      },
      {
        caption: 'Waiting is not passive here, it is the mechanism.',
        atlas: 'proud',
        cast: [
          { actor: 'px:hourglass', do: 'exit' },
          { actor: 'px:stack-cash', do: 'exit' },
          { actor: 'kit:patience:green', do: 'play', to: 'center', atMs: 200 },
        ],
      },
    ],
  },

  /* investingFundamentals.ts:1257-1271, "Don't Put All Your Eggs in One Basket". */
  'investing-fundamentals:5:2': {
    slot: 'idea',
    guards: ['one failure cannot sink you', 'move opposite', 'strangest thing in the world'],
    beats: [
      {
        caption:
          'Diversification means spreading your money across different assets, sectors, and countries so one failure cannot sink you.',
        atlas: 'watching',
        cast: [
          { actor: 'kit:concentrate:green', do: 'enter', to: 'left' },
          { actor: 'kit:spread:green', do: 'play', to: 'right', atMs: 500 },
        ],
      },
      {
        caption:
          'It works because of correlation: positively correlated assets move together, negatively correlated ones move opposite.',
        atlas: 'thinking',
        cast: [
          { actor: 'kit:concentrate:green', do: 'exit' },
          { actor: 'kit:spread:green', do: 'exit' },
          { actor: 'px:chart-up', do: 'slide', from: 'left', to: 'left-high', atMs: 200 },
          { actor: 'px:chart-down', do: 'slide', from: 'right', to: 'right-low', atMs: 200 },
        ],
      },
      {
        caption: 'Mix low or negative correlation assets, so when one falls, others hold steady and smooth your returns.',
        atlas: 'happy',
        cast: [{ actor: 'px:shield', do: 'enter', to: 'center' }],
      },
      {
        caption: 'And it is free, which is why it is the strangest thing in the world that anyone skips it.',
        atlas: 'silly',
        cast: [
          { actor: 'px:chart-up', do: 'exit' },
          { actor: 'px:chart-down', do: 'exit' },
          { actor: 'px:shield', do: 'exit' },
          { actor: 'kit:spread:green', do: 'play', to: 'center', atMs: 200 },
        ],
      },
    ],
  },

  /* personalFinance.ts:4690-4708, inflation. */
  'personal-finance:20:2': {
    slot: 'idea',
    guards: ['Inflation is rising prices.', '72/3=24', '$41 worth of goods'],
    beats: [
      {
        caption: 'Inflation is rising prices.',
        atlas: 'watching',
        cast: [
          { actor: 'px:cart', do: 'enter', to: 'left' },
          { actor: 'px:inflation', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'At 3%, prices double in 24 years (Rule of 72: 72/3=24), so a 22-year-old needs double income by 46.',
        atlas: 'whoa',
        cast: [
          { actor: 'px:inflation', do: 'exit' },
          { actor: 'px:cart', do: 'stack', n: 2, derivedFrom: ['double'] },
          { actor: 'px:hourglass', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'The one thing to keep: money that sits still shrinks, and nothing on your bank statement warns you.',
        atlas: 'sad',
        cast: [
          { actor: 'px:cart', do: 'exit' },
          { actor: 'px:hourglass', do: 'exit' },
          { actor: 'kit:leak:orchid', do: 'play', to: 'center', atMs: 200 },
        ],
      },
      {
        /*
         * The bill stands still while the bucket leaks again: the balance does not change, what it
         * buys does. "$41" is never drawn as a smaller bill, per the no-magnitude rule.
         */
        caption: '$100 today buys $41 worth of goods in 30 years while the balance never changes.',
        atlas: 'oops',
        cast: [
          { actor: 'kit:leak:orchid', do: 'play', to: 'right' },
          { actor: 'px:bill', do: 'enter', to: 'left', atMs: 300 },
        ],
      },
    ],
  },

  /*
   * investingFundamentals.ts:5520-5529, "How Fees Compound Against You". Replaces a two-line
   * timeline interactive; the 92% fact that timeline carried is also on step 2 of the same lesson,
   * so nothing is lost from the lesson.
   */
  'investing-fundamentals:20:4': {
    slot: 'interactive',
    guards: ['compound growth you lose', '$10,063 over 30 years', '$208,000 over 30 years'],
    beats: [
      {
        caption:
          "The reason fees are so devastating isn't the fee itself, it's the compound growth you lose on the money that went to fees.",
        atlas: 'thinking',
        cast: [{ actor: 'kit:fee:green', do: 'play', to: 'center' }],
      },
      {
        caption: "When you pay $1,000 in fees this year, you don't just lose $1,000.",
        atlas: 'watching',
        cast: [
          { actor: 'kit:fee:green', do: 'exit' },
          { actor: 'px:coin', do: 'enter', to: 'center', atMs: 200 },
        ],
      },
      {
        /*
         * The coin stays and the growth it would have made plays beside it. The research had the
         * coin slide off stage in beat 2, which part-scene-pin caught leaving that beat's stage
         * empty (2026-09-22).
         */
        caption: 'You lose the $1,000 plus everything that $1,000 would have earned over the next 20-30 years.',
        atlas: 'sad',
        cast: [
          { actor: 'px:coin', do: 'slide', to: 'left' },
          { actor: 'kit:compound:red', do: 'play', to: 'right', atMs: 300 },
        ],
      },
      {
        caption: 'At 8% growth, a single $1,000 fee today costs you $10,063 over 30 years.',
        atlas: 'whoa',
        cast: [
          { actor: 'kit:compound:red', do: 'exit' },
          { actor: 'px:coin', do: 'count', to: 'center', n: 10, derivedFrom: ['$10,063', '$1,000'], atMs: 200 },
        ],
      },
      {
        caption: 'A 1% annual fee on $100,000 costs $208,000 over 30 years, not $30,000.',
        atlas: 'oops',
        cast: [
          { actor: 'px:coin', do: 'exit' },
          { actor: 'px:receipt', do: 'enter', to: 'center', atMs: 200 },
        ],
      },
    ],
  },

  /* corporateFinance.ts:2135-2136, hedging. The lesson has no hands-on step at all. */
  'corporate-finance:9:2': {
    slot: 'idea',
    guards: ['spotting and reducing financial dangers', 'lock in a future price', 'fixed for floating'],
    beats: [
      {
        caption: 'Risk management means spotting and reducing financial dangers.',
        atlas: 'watching',
        cast: [{ actor: 'kit:target:blue', do: 'play', to: 'center' }],
      },
      {
        caption: 'Derivatives are contracts whose value comes from an underlying asset.',
        atlas: 'thinking',
        cast: [
          { actor: 'kit:target:blue', do: 'exit' },
          { actor: 'kit:rulebook:blue', do: 'enter', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'Forwards and futures lock in a future price.',
        atlas: 'happy',
        cast: [
          { actor: 'kit:rulebook:blue', do: 'exit' },
          { actor: 'px:calendar', do: 'enter', to: 'center', atMs: 200 },
          { actor: 'px:lock', do: 'slide', from: 'off-left', to: 'left', atMs: 500 },
        ],
      },
      {
        caption: 'Options give the right, not the duty, to buy or sell.',
        atlas: 'thinking',
        cast: [
          { actor: 'px:calendar', do: 'exit' },
          { actor: 'px:lock', do: 'exit' },
          { actor: 'kit:fork:blue', do: 'play', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'Swaps trade one cash flow for another, like fixed for floating.',
        atlas: 'proud',
        cast: [
          { actor: 'kit:fork:blue', do: 'exit' },
          { actor: 'kit:cycle:blue', do: 'play', to: 'center', atMs: 200 },
        ],
      },
    ],
  },

  /*
   * financialAnalytics.ts:5127-5128, Value at Risk. The lesson has no hands-on step. The research
   * first drew beat 4 as a count of 3; nothing authored says 3, so it is three different sprites
   * falling together instead.
   */
  'financial-analytics:23:2': {
    slot: 'idea',
    guards: ['worst loss expected at a set confidence', '$25M ES', 'LTCM $4.6 billion'],
    beats: [
      {
        caption: 'Value at Risk, or VaR, is the worst loss expected at a set confidence.',
        atlas: 'watching',
        cast: [{ actor: 'kit:threshold:gold', do: 'play', to: 'center' }],
      },
      {
        caption:
          'A 1-day 95% VaR of $10 million ignores the worst 5%, or 1%: the real loss could be $11 million or $500 million.',
        atlas: 'whoa',
        cast: [
          { actor: 'kit:threshold:gold', do: 'slide', to: 'left' },
          { actor: 'px:crack', do: 'enter', to: 'right-low', atMs: 400 },
        ],
      },
      {
        caption: 'Expected Shortfall averages the losses in that tail: a $10M VaR might pair with a $25M ES.',
        atlas: 'thinking',
        cast: [
          { actor: 'kit:threshold:gold', do: 'exit' },
          { actor: 'px:crack', do: 'exit' },
          { actor: 'px:calculator', do: 'enter', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'In crises correlations jump toward 1.0, so everything falls together, costing LTCM $4.6 billion in 1998.',
        atlas: 'sad',
        cast: [
          { actor: 'px:calculator', do: 'exit' },
          { actor: 'px:chart-down', do: 'slide', from: 'left-high', to: 'left-low', atMs: 200 },
          { actor: 'px:house', do: 'slide', from: 'center-high', to: 'center-low', atMs: 200 },
          { actor: 'px:bank', do: 'slide', from: 'right-high', to: 'right-low', atMs: 200 },
        ],
      },
    ],
  },

  /*
   * personalFinance.ts, "Taxes 101: How Tax Brackets Actually Work". The aha most teens get wrong
   * (that a raise can lower take-home pay). The takeaway card already says "A raise moves only the
   * new dollars ...", so the last beat is the sentence after it instead.
   */
  'personal-finance:7:2': {
    slot: 'idea',
    guards: ['Brackets are marginal', 'a 12.1% effective rate', 'earning more takes home less'],
    beats: [
      {
        caption: 'Brackets are marginal: each rate applies only to income inside its range, not all your income.',
        atlas: 'thinking',
        cast: [{ actor: 'kit:threshold:orchid', do: 'play', to: 'center' }],
      },
      {
        caption: 'Earn $50,000: 10% on $11,600 ($1,160), 12% on $35,550 ($4,266), 22% on $2,850 ($627) = $6,053',
        atlas: 'watching',
        cast: [
          { actor: 'kit:threshold:orchid', do: 'exit' },
          { actor: 'px:paycheck', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'px:tax-form', do: 'slide', from: 'off-right', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'a 12.1% effective rate, not 22%.',
        atlas: 'whoa',
        cast: [
          { actor: 'px:tax-form', do: 'exit' },
          { actor: 'px:paycheck', do: 'slide', to: 'left-low' },
          { actor: 'px:scales', do: 'enter', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'There is no income where earning more takes home less.',
        atlas: 'proud',
        cast: [
          { actor: 'px:scales', do: 'exit' },
          { actor: 'px:paycheck', do: 'slide', to: 'left' },
          { actor: 'px:chart-up', do: 'enter', to: 'right', atMs: 300 },
        ],
      },
    ],
  },

  /*
   * behavioralFinance.ts, "Endowment Effect & Loss Aversion". The lesson has no hands-on step.
   * The authored sentence is "Richard Thaler documented the endowment effect in 1980: people want
   * ...", 131 characters, over the ceiling, so it is split at its colon across two beats. The first
   * version kept only the second half, which opened the clip on a lowercase "people want ..." and
   * never named the effect the scene is about (the term card naming it comes after the scene).
   */
  'behavioral-finance:19:2': {
    slot: 'idea',
    guards: ['endowment effect in 1980', 'losses hurt 2-2.5x', 'own what you happen to have'],
    beats: [
      {
        caption: 'Richard Thaler documented the endowment effect in 1980',
        atlas: 'watching',
        cast: [{ actor: 'add:mug', do: 'enter', to: 'center' }],
      },
      {
        caption: 'people want much more to sell something they own than they would pay to buy it.',
        atlas: 'thinking',
        cast: [{ actor: 'add:mug', do: 'play', to: 'center' }],
      },
      {
        caption: 'In experiments by Kahneman, Knetsch, and Thaler, the ask-to-pay ratio is 2-3x.',
        atlas: 'whoa',
        cast: [
          { actor: 'add:mug', do: 'slide', to: 'left' },
          { actor: 'px:scale-tip', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'The cause is loss aversion: losses hurt 2-2.5x more than equal gains feel good.',
        atlas: 'sad',
        cast: [
          { actor: 'add:mug', do: 'exit' },
          { actor: 'px:scale-tip', do: 'slide', to: 'left' },
          { actor: 'px:chart-down', do: 'enter', to: 'right', atMs: 300 },
        ],
      },
      {
        caption:
          'Selling feels like a loss, so you hold losers too long, demand silly prices for winners, and own what you happen to have.',
        atlas: 'oops',
        cast: [
          { actor: 'px:scale-tip', do: 'exit' },
          { actor: 'px:chart-down', do: 'exit' },
          { actor: 'kit:anchor:pink', do: 'play', to: 'center', atMs: 200 },
        ],
      },
    ],
  },

  /* businessStrategy.ts, "Platform Business Models". The lesson has no hands-on step. */
  'business-strategy:20:2': {
    slot: 'idea',
    guards: ['connect two sides and take a cut', 'Uber needed riders and drivers', 'Rivals only win by being different'],
    beats: [
      {
        caption: "Platforms don't build the product, they connect two sides and take a cut.",
        atlas: 'watching',
        cast: [
          { actor: 'px:phone', do: 'enter', to: 'left' },
          { actor: 'px:car', do: 'enter', to: 'right', atMs: 200 },
          { actor: 'px:handshake', do: 'enter', to: 'center', atMs: 500 },
        ],
      },
      {
        caption: 'Chicken and egg: Uber needed riders and drivers.',
        atlas: 'thinking',
        cast: [
          { actor: 'px:handshake', do: 'exit' },
          { actor: 'px:question', do: 'enter', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'Each new user attracts more of the other side, so one winner takes most',
        atlas: 'whoa',
        cast: [
          { actor: 'px:question', do: 'exit' },
          { actor: 'px:phone', do: 'exit' },
          { actor: 'px:car', do: 'exit' },
          { actor: 'px:magnet', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'kit:crowd:gold', do: 'play', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'Rivals only win by being different: Reddit, LinkedIn, TikTok.',
        atlas: 'proud',
        cast: [
          { actor: 'px:magnet', do: 'exit' },
          { actor: 'kit:crowd:gold', do: 'slide', to: 'left' },
          { actor: 'px:lightbulb', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
    ],
  },

  /* personalFinance.ts, "Financial Independence & Early Retirement: Annual Expenses x 25". */
  'personal-finance:23:2': {
    slot: 'idea',
    guards: ['Trinity Study', 'expenses × 25 = your number', 'two things at once'],
    beats: [
      {
        caption: 'The 4% rule (Trinity Study): withdraw 4% yearly over 30 years.',
        atlas: 'thinking',
        cast: [
          { actor: 'px:vault', do: 'enter', to: 'center' },
          { actor: 'px:calendar', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'So expenses × 25 = your number: $40K, $1M; $60K, $1.5M; $80K, $2M.',
        atlas: 'watching',
        cast: [
          { actor: 'px:calendar', do: 'exit' },
          { actor: 'px:vault', do: 'slide', to: 'left' },
          { actor: 'px:calculator', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'Saving 50% of $50K beats saving 10% of $150K.',
        atlas: 'whoa',
        cast: [
          { actor: 'px:vault', do: 'exit' },
          { actor: 'px:calculator', do: 'exit' },
          { actor: 'px:piggy-bank', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'px:stopwatch', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'Cut $1,000 of annual spending and you do two things at once',
        atlas: 'thinking',
        cast: [
          { actor: 'px:piggy-bank', do: 'exit' },
          { actor: 'px:stopwatch', do: 'exit' },
          { actor: 'px:wallet', do: 'play', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'you lower the target by $25,000 and you invest $1,000 more every year.',
        atlas: 'proud',
        cast: [
          { actor: 'px:wallet', do: 'slide', to: 'left' },
          { actor: 'px:target', do: 'enter', to: 'center', atMs: 300 },
          { actor: 'px:seedling', do: 'enter', to: 'right', atMs: 500 },
        ],
      },
    ],
  },

  /* globalEconomics.ts, "Economic Bubbles & Financial Crises". One hands-on step in the lesson. */
  'global-economics:21:2': {
    slot: 'idea',
    guards: ['tulips 1637', "Hyman Minsky's cycle", 'owing more than the house was worth'],
    beats: [
      {
        caption: 'Every bubble repeats: tulips 1637, South Sea 1720, railroads 1840s, 1929 crash, dot-com 2000, housing 2008.',
        atlas: 'thinking',
        cast: [{ actor: 'kit:cycle:teal', do: 'play', to: 'center' }],
      },
      {
        caption: "Hyman Minsky's cycle: opportunity, boom, euphoria, panic.",
        atlas: 'watching',
        cast: [
          { actor: 'kit:cycle:teal', do: 'exit' },
          { actor: 'px:lightbulb', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'px:chart-up', do: 'enter', to: 'center', atMs: 500 },
          { actor: 'px:rocket', do: 'enter', to: 'right-high', atMs: 800 },
        ],
      },
      {
        caption: 'Each time people say this time is different: 1999 tech, 2006 housing, 2021 meme stocks.',
        atlas: 'oops',
        cast: [
          { actor: 'px:lightbulb', do: 'exit' },
          { actor: 'px:chart-up', do: 'exit' },
          { actor: 'px:rocket', do: 'slide', to: 'center-high', atMs: 200 },
          { actor: 'px:chat', do: 'enter', to: 'left-low', atMs: 400 },
        ],
      },
      {
        caption: 'Leverage means borrowing to invest.',
        atlas: 'thinking',
        cast: [
          { actor: 'px:rocket', do: 'exit' },
          { actor: 'px:chat', do: 'exit' },
          { actor: 'kit:debt:teal', do: 'play', to: 'center', atMs: 200 },
        ],
      },
      {
        caption:
          'In 2008, banks lent 100% of home values, so a 20% drop left owners owing more than the house was worth.',
        atlas: 'sad',
        cast: [
          { actor: 'kit:debt:teal', do: 'slide', to: 'left' },
          { actor: 'px:house', do: 'slide', from: 'right-high', to: 'right-low', atMs: 300 },
          { actor: 'px:crack', do: 'enter', to: 'center-low', atMs: 700 },
        ],
      },
    ],
  },

  /* corporateFinance.ts, "Capital Structure: Debt vs. Equity". The lesson has no hands-on step. */
  'corporate-finance:4:4': {
    slot: 'idea',
    guards: ['Debt is the cheaper option.', 'is called dilution', 'the 5% is still due when sales collapse'],
    beats: [
      {
        caption: 'Debt is the cheaper option.',
        atlas: 'happy',
        cast: [{ actor: 'kit:debt:blue', do: 'play', to: 'center' }],
      },
      {
        caption: 'Lenders charge less than shareholders expect to earn, and interest payments are tax deductible',
        atlas: 'watching',
        cast: [
          { actor: 'kit:debt:blue', do: 'slide', to: 'left' },
          { actor: 'px:tax-form', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'The catch: interest is due even in a bad year, and missing payments can mean bankruptcy.',
        atlas: 'whoa',
        cast: [
          { actor: 'px:tax-form', do: 'exit' },
          { actor: 'px:calendar', do: 'enter', to: 'right', atMs: 200 },
          { actor: 'px:crack', do: 'enter', to: 'center-low', atMs: 600 },
        ],
      },
      {
        caption: "Issuing new shares, which shrinks everyone's slice, is called dilution.",
        atlas: 'thinking',
        cast: [
          { actor: 'kit:debt:blue', do: 'exit' },
          { actor: 'px:calendar', do: 'exit' },
          { actor: 'px:crack', do: 'exit' },
          { actor: 'px:certificate', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'px:pie-slice', do: 'play', to: 'right', atMs: 400 },
        ],
      },
      /*
       * No fifth beat. The first version ended on "the 5% is still due when sales collapse, and
       * the 15% is not", but this scene is the deck's FIRST card and nothing in it had said what
       * 5% and 15% are: the chart and the takeaway that introduce them come after it. Those two
       * figures on screen with no referent were numbers the learner could not read.
       */
    ],
  },

  /* behavioralFinance.ts, "Behavioral Economics in Everyday Life". No hands-on step. */
  'behavioral-finance:23:2': {
    slot: 'idea',
    guards: ['the first price you see sets what feels normal', 'J.C. Penney scrapped fake sales', 'naming the first number'],
    beats: [
      {
        caption: 'Anchoring means the first price you see sets what feels normal.',
        atlas: 'thinking',
        cast: [{ actor: 'kit:anchor:pink', do: 'play', to: 'center' }],
      },
      {
        caption: 'A crossed out $999 makes $499 feel like a bargain.',
        atlas: 'whoa',
        cast: [
          { actor: 'kit:anchor:pink', do: 'exit' },
          { actor: 'add:tag-slashed', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'add:price-tag', do: 'enter', to: 'right', atMs: 600 },
        ],
      },
      {
        caption: 'J.C. Penney scrapped fake sales in 2012 and lost 25% of revenue.',
        atlas: 'oops',
        cast: [
          { actor: 'add:tag-slashed', do: 'exit' },
          { actor: 'add:price-tag', do: 'slide', to: 'left' },
          { actor: 'px:chart-down', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'Menus use it too: a $95 steak makes $35 salmon look fair, and a $200 wine makes $60 seem cheap.',
        atlas: 'silly',
        cast: [
          { actor: 'add:price-tag', do: 'exit' },
          { actor: 'px:chart-down', do: 'exit' },
          { actor: 'px:food', do: 'play', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'In pay talks, naming the first number gives a 15-20% edge',
        atlas: 'proud',
        cast: [
          { actor: 'px:food', do: 'exit' },
          { actor: 'px:handshake', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'px:paycheck', do: 'enter', to: 'right', atMs: 500 },
        ],
      },
    ],
  },

  /* personalFinance.ts, "Managing Debt Wisely: Good Debt vs. Bad Debt". */
  'personal-finance:6:2': {
    slot: 'idea',
    guards: ['Good debt buys assets', 'Payday loans hit 400% APR', 'grows faster than the interest eats'],
    beats: [
      {
        caption: 'Good debt buys assets that gain value or earn income: a mortgage, a student loan, a business loan.',
        atlas: 'happy',
        cast: [
          { actor: 'px:house', do: 'enter', to: 'left' },
          { actor: 'px:graduation-cap', do: 'enter', to: 'center', atMs: 300 },
          { actor: 'px:briefcase', do: 'enter', to: 'right', atMs: 600 },
        ],
      },
      {
        caption: 'Bad debt buys things that lose value',
        atlas: 'oops',
        cast: [
          { actor: 'px:house', do: 'exit' },
          { actor: 'px:graduation-cap', do: 'exit' },
          { actor: 'px:briefcase', do: 'exit' },
          { actor: 'px:credit-card', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'px:car', do: 'enter', to: 'right', atMs: 500 },
        ],
      },
      {
        caption: 'Payday loans hit 400% APR.',
        atlas: 'whoa',
        cast: [
          { actor: 'px:credit-card', do: 'exit' },
          { actor: 'px:car', do: 'exit' },
          { actor: 'kit:debt:red', do: 'play', to: 'center', atMs: 200 },
        ],
      },
      /*
       * "It is whether the thing you bought grows faster than the interest eats." was a beat here
       * and read as a dangling "It" after "Payday loans hit 400% APR.": its subject is the sentence
       * before it, 'The test is never "is debt bad".', which is this deck's takeaway card, so it
       * cannot be joined on without saying that line twice (CONSTITUTION 5.1). The house and the
       * dinner below show the same test.
       */
      {
        caption: 'A house at 6% can win. A dinner at 22% never does',
        atlas: 'proud',
        cast: [
          { actor: 'kit:debt:red', do: 'exit' },
          { actor: 'px:house', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'px:food', do: 'enter', to: 'right', atMs: 500 },
        ],
      },
    ],
  },
};

/* ── SPRITES ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * The sprite an actor key names, or null.
 *
 * Null, never a stand-in, for an unknown id, a catalogue sprite without the `lesson` slot, an
 * unknown archetype, or an accent the kit does not have. composeScene quietly falls back to orchid
 * for a bad accent, which is right for a derived deck and wrong here: a hand-authored scene with a
 * typo'd accent should fail the pin, not ship purple.
 */
export function resolveActorSprite(key: string): PixelSprite | null {
  const [ns, id, accent, ...rest] = key.split(':');
  if (!id || rest.length) return null;
  if (ns === 'px') {
    if (accent !== undefined) return null;
    const sprite = SPRITES_BY_ID[id];
    return sprite && SPRITE_CATALOGUE[id]?.slots.includes('lesson') ? sprite : null;
  }
  if (ns === 'kit') {
    if (!MOBILE_KIT[id]) return null;
    if (accent !== undefined && !MOBILE_KIT_ACCENTS.includes(accent)) return null;
    return composeScene({ archetype: id, accent });
  }
  if (ns === 'add') {
    if (accent !== undefined) return null;
    return Object.prototype.hasOwnProperty.call(SCENE_PROPS, id) ? SCENE_PROPS[id] : null;
  }
  return null;
}

/* ── TIMING ──────────────────────────────────────────────────────────────────────────────────── */

/** When a cue starts inside its beat: the authored offset at the current tempo. */
export function cueDelayMs(cue: SceneCue): number {
  return (cue.atMs ?? 0) * CUE_DELAY_SCALE;
}

/** One frame of a `play` cue's sprite, slowed by PLAY_FRAME_SCALE. */
export function playFrameMs(sprite: PixelSprite | undefined | null): number {
  return (sprite?.frameMs ?? DEFAULT_FRAME_MS) * PLAY_FRAME_SCALE;
}

/** How long one cue moves, from its own start. `play` runs every frame of the sprite once. */
export function cueMotionMs(cue: SceneCue): number {
  switch (cue.do) {
    case 'exit':
      return ACTOR_EXIT_MS;
    case 'slide':
      return ACTOR_SLIDE_MS;
    case 'stack':
    case 'count':
      return Math.max(0, (cue.n ?? 1) - 1) * COPY_STAGGER_MS + ACTOR_ENTER_MS;
    case 'play': {
      const sprite = resolveActorSprite(cue.actor);
      const frames = sprite?.frames?.length ?? 0;
      return Math.max(ACTOR_ENTER_MS, frames * playFrameMs(sprite));
    }
    default:
      return ACTOR_ENTER_MS;
  }
}

/**
 * How long a beat's picture keeps moving: the latest cue end. The card disables Next for this long
 * (Brilliant greys ▶ while a Koch step sweeps, timing/koch.jpg row 2) and the clip clock holds the
 * beat for this plus a gap, or the caption's reading time, whichever is longer.
 */
export function sceneMotionMs(beat: SceneBeat): number {
  return beat.cast.reduce((m, c) => Math.max(m, cueDelayMs(c) + cueMotionMs(c)), 0);
}

/**
 * How Atlas reacts on beat `k` of `total`: a nod on every beat, and one celebrate hop on the last
 * beat only when his face there is happy or proud. A hop under a sad caption ("owing more than the
 * house was worth") would cheer the bad news.
 */
export function sceneReaction(beat: SceneBeat, k: number, total: number): 'nod' | 'celebrate' {
  return k >= total - 1 && (beat.atlas === 'proud' || beat.atlas === 'happy') ? 'celebrate' : 'nod';
}

/* ── STAGE STATE ─────────────────────────────────────────────────────────────────────────────── */

/** Where every actor is once a beat has finished. */
export type ActorState = {
  actor: SceneActorKey;
  visible: boolean;
  mark: SceneMark;
  /** 1 for a single sprite; `n` after a stack or count. */
  copies: number;
  layout: 'single' | 'stack' | 'count';
};

/** Every actor any beat names, in order of first appearance. The renderer mounts these once. */
export function castOf(beats: SceneBeat[]): SceneActorKey[] {
  const seen: SceneActorKey[] = [];
  for (const b of beats) for (const c of b.cast) if (!seen.includes(c.actor)) seen.push(c.actor);
  return seen;
}

/**
 * The stage after beat `k`, folded from beat 0. Pure.
 *
 * WHY A FOLD AND NOT "UNDO THE LAST BEAT". Stepping back and reduced motion both need a still
 * picture of an arbitrary beat. Replaying from the start is the only version that cannot drift: an
 * undo would have to know what every verb overwrote, and one missed field (a stack's copy count)
 * leaves a ghost sprite on screen after Back.
 */
export function stageAt(beats: SceneBeat[], k: number): Record<string, ActorState> {
  const state: Record<string, ActorState> = {};
  for (const actor of castOf(beats)) {
    state[actor] = { actor, visible: false, mark: 'center', copies: 1, layout: 'single' };
  }
  const last = Math.min(k, beats.length - 1);
  for (let j = 0; j <= last; j++) {
    for (const cue of beats[j].cast) {
      const s = state[cue.actor];
      if (cue.do === 'exit') {
        s.visible = false;
        continue;
      }
      if (cue.to) s.mark = cue.to;
      else if (!s.visible && cue.do !== 'stack' && cue.do !== 'count') s.mark = 'center';
      s.visible = true;
      if (cue.do === 'stack' || cue.do === 'count') {
        s.copies = cue.n ?? 1;
        s.layout = cue.do;
      } else if (cue.do === 'enter' || cue.do === 'play') {
        s.copies = 1;
        s.layout = 'single';
      }
      // An actor that slid off stage has left it, so it is not a visible actor any more.
      if (s.mark === 'off-left' || s.mark === 'off-right') s.visible = false;
    }
  }
  return state;
}

/**
 * Stage coordinates of a mark, as fractions of the ACTING AREA (the stage above Atlas's floor).
 * Off-stage marks sit outside 0..1.
 */
export function markPoint(mark: SceneMark): { x: number; y: number } {
  if (mark === 'off-left') return { x: -0.25, y: 0.5 };
  if (mark === 'off-right') return { x: 1.25, y: 0.5 };
  const [col, row] = mark.split('-');
  const x = col === 'left' ? 0.2 : col === 'right' ? 0.8 : 0.5;
  const y = row === 'high' ? 0.3 : row === 'low' ? 0.7 : 0.5;
  return { x, y };
}

/* ── STAGE GEOMETRY ──────────────────────────────────────────────────────────────────────────── */

/*
 * Pure, here and not in scene-card.tsx, so part-scene-pin can check under node that Atlas never
 * overlaps a prop at the stage widths phones actually give this card.
 *
 * THE WIDTHS. lesson.tsx's body gutter (16pt and a 1pt border each side), the card's own 16pt
 * gutter and the player's 1pt border take 68pt: the stage is 307pt on a 375pt iPhone SE, 325 on a
 * 393pt phone, 362 on a 430pt one. The first version measured its Atlas clearance at 343 (the SE
 * screen minus one gutter), called it "they meet, they do not overlap", and at the real 307 a
 * fixed 52pt Atlas sat 7pt into the bottom of any right-low prop.
 */
/** 4pt per art pixel on a 16px sprite. A multiple of 16, so every art edge lands on a whole point. */
export const SPRITE_PT = 64;
/** A `count` shows up to ten copies; at 64pt ten would not fit the stage, at 32pt five per row do. */
export const COUNT_PT = 32;
const COUNT_PER_ROW = 5;
const COUNT_GAP = 6;
/** How far each copy in a `stack` sits from the one below, so a pile reads as more than one thing. */
const STACK_STEP = { x: 18, y: -14 };
/** Height over width. */
export const SCENE_STAGE_ASPECT = 11 / 16;
/** Atlas's floor band at the bottom of the stage; props act in the area above it. */
export const SCENE_FLOOR_PT = 32;
/** Under atlas.tsx IDLE_MOTION_MIN_SIZE (72), so he holds still between beats: no idle loop. */
const SCENE_ATLAS_MAX_PT = 52;
/** Below this he reads as a smudge beside 64pt props; no supported phone gets near it. */
const SCENE_ATLAS_MIN_PT = 40;
export const SCENE_ATLAS_INSET = { right: 12, bottom: 4 };

export type SceneStage = { w: number; h: number; area: { w: number; h: number }; atlasPt: number };

/**
 * The stage for a measured width: height in whole 4pt cells (so the floor's rim lands on a pixel
 * edge), the acting area above the floor, and Atlas's size. Atlas is as big as SCENE_ATLAS_MAX_PT
 * allows while his head stays at or below the bottom of a right-low prop, the lowest prop in his
 * column: 48pt at 307, 52pt from 325 up.
 */
export function sceneStage(w: number): SceneStage {
  const h = Math.floor((w * SCENE_STAGE_ASPECT) / 4) * 4;
  const area = { w, h: Math.max(0, h - SCENE_FLOOR_PT) };
  const lowPropBottom = markPoint('right-low').y * area.h + SPRITE_PT / 2;
  const room = Math.floor(h - SCENE_ATLAS_INSET.bottom - lowPropBottom);
  const atlasPt = Math.max(SCENE_ATLAS_MIN_PT, Math.min(SCENE_ATLAS_MAX_PT, room));
  return { w, h, area, atlasPt };
}

/** Top-left of each copy an actor draws, relative to its mark's point. */
export function copyOffsets(state: ActorState): { x: number; y: number }[] {
  if (state.layout === 'count') {
    const rows = Math.ceil(state.copies / COUNT_PER_ROW);
    const perRow = Math.min(state.copies, COUNT_PER_ROW);
    const w = perRow * COUNT_PT + (perRow - 1) * COUNT_GAP;
    const h = rows * COUNT_PT + (rows - 1) * COUNT_GAP;
    return Array.from({ length: state.copies }, (_, i) => ({
      x: -w / 2 + (i % COUNT_PER_ROW) * (COUNT_PT + COUNT_GAP),
      y: -h / 2 + Math.floor(i / COUNT_PER_ROW) * (COUNT_PT + COUNT_GAP),
    }));
  }
  const extra = state.layout === 'stack' ? state.copies - 1 : 0;
  // Centre the whole pile on the mark, not its first copy, so a stack of two stays inside its third.
  const cx = -(extra * STACK_STEP.x) / 2 - SPRITE_PT / 2;
  const cy = -(extra * STACK_STEP.y) / 2 - SPRITE_PT / 2;
  return Array.from({ length: state.layout === 'stack' ? state.copies : 1 }, (_, i) => ({
    x: cx + i * STACK_STEP.x,
    y: cy + i * STACK_STEP.y,
  }));
}

/* ── BUILDING ────────────────────────────────────────────────────────────────────────────────── */

/**
 * Every authored sentence on a step that a caption or guard may quote: title, description,
 * paragraphs, insights, Atlas's hint and recap, and the real-example explanation. The same list the
 * research verifier searched, so the pin and the builder agree on what "authored" means.
 */
export function stepText(step: LessonStep): string {
  const s = step as {
    title?: string;
    description?: string;
    paragraphs?: string[];
    insights?: string[];
    atlas?: { hint?: string; recap?: string };
    realExample?: { explanation?: string };
  };
  return [
    s.title,
    s.description,
    ...(Array.isArray(s.paragraphs) ? s.paragraphs : []),
    ...(Array.isArray(s.insights) ? s.insights : []),
    s.atlas?.hint,
    s.atlas?.recap,
    s.realExample?.explanation,
  ]
    .filter((t): t is string => typeof t === 'string' && t.length > 0)
    .join('\n');
}

/** True when every guard and every caption of `script` is in the step's authored text. */
export function scriptMatches(script: SceneScript, step: LessonStep): boolean {
  const text = stepText(step);
  if (!text) return false;
  return script.guards.every((g) => text.includes(g)) && script.beats.every((b) => text.includes(b.caption));
}

/**
 * Build the scene for a step, or return null.
 *
 * `key` is the placement position (`course:lesson:stepIndex`). Without one, the step must match
 * exactly one script by its guards and captions, which is how the pin and any caller that has the
 * step but not its position can still build it. Null when:
 *   - there is no script for the key, or zero or several scripts match;
 *   - any guard or any caption is absent from the step's authored text (a re-sync rewrote it);
 *   - the script has fewer than 3 or more than 6 beats.
 * Never a partial scene: dropping the beats whose caption vanished would teach half an idea as if
 * it were the whole one.
 *
 * `lessonSteps` is accepted for the placement contract (parts/placements.ts) and unused: every
 * caption a scene shows is on its own step.
 */
export function buildScene(step: LessonStep, _lessonSteps?: LessonStep[], key?: string): ScenePartSpec | null {
  let script: SceneScript | undefined;
  let course: string | undefined;
  if (key !== undefined) {
    script = SCENES[key];
    course = key.split(':')[0];
  } else {
    const hits = Object.entries(SCENES).filter(([, s]) => scriptMatches(s, step));
    if (hits.length === 1) {
      script = hits[0][1];
      course = hits[0][0].split(':')[0];
    }
  }
  if (!script) return null;
  if (script.beats.length < MIN_BEATS || script.beats.length > MAX_BEATS) return null;
  if (!scriptMatches(script, step)) return null;
  return { kind: 'scene', prompt: SCENE_PROMPT, beats: script.beats, course };
}

/**
 * The builder for one PLACEMENTS entry. Integration writes
 * `PLACEMENTS[key] = { kind: 'scene', slot, build: sceneBuilder(key) }`.
 */
export function sceneBuilder(key: string) {
  return (step: LessonStep, lessonSteps: LessonStep[]) => {
    const spec = buildScene(step, lessonSteps, key);
    return spec ? { spec, text: textOf(spec) } : null;
  };
}

/** Every sentence this card puts on screen, for the deck's say-it-once check. */
export function textOf(spec: ScenePartSpec): string[] {
  return [spec.prompt, ...spec.beats.map((b) => b.caption)];
}
