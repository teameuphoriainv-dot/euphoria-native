/**
 * Scene: an authored idea acted out in pixel art, one beat at a time, captioned in the lesson's
 * own words.
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
 *   - NO ATLAS IN THE SCENE. The research design cast the vector Atlas as an actor, but
 *     lesson.tsx already draws the floating LessonAtlasButton on every step and
 *     scripts/atlas-lesson-parity-regression.mjs pins it there; a second Atlas inside the card
 *     breaks CONSTITUTION 5.6 (one mascot per screen, PINNED). Which of the two Atlases gives way
 *     is Sriyan's call, so until he makes it the cast is sprites only and Atlas stays where he is.
 *
 * NAME. `SceneSpec` is already the pixel-art scene in ../types.ts (archetype, accent, overlay) and
 * has no `kind`, so the part spec is `ScenePartSpec` to keep the MobileInteractive union
 * discriminated when integration adds it.
 */
import type { LessonStep } from '@/lib/curriculum';
import type { PixelSprite } from '../../pixel/types';
import { SPRITE_CATALOGUE } from '../../pixel/catalogue';
import { SPRITES_BY_ID } from '../../pixel/sprites';
import { composeScene, MOBILE_KIT, MOBILE_KIT_ACCENTS } from '../../pixel/sprites-mobile-kit';

/**
 * Who is on stage. `px:<id>` is a catalogue sprite with the `lesson` slot; `kit:<archetype>[:<accent>]`
 * is a mobile-kit archetype recoloured through composeScene.
 *
 * NAMESPACED BECAUSE FOUR IDS COLLIDE. `shield` and `target` exist in both sprites.ts and the kit,
 * `anchor` and `crowd` in both sprites-lesson.ts and the kit (research inv.mjs, 2026-09-22). A bare
 * "shield" would silently pick whichever table was checked first.
 */
export type SceneActorKey = `px:${string}` | `kit:${string}`;

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
 *   enter  fade in at `to` (default center)      exit   fade out where it stands
 *   slide  move from `from` (default where it is) to `to`
 *   play   show at `to` and run the sprite's frames once
 *   stack  `n` copies piled at `to`                count  `n` small copies in a grid at `to`
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

export interface SceneBeat {
  /** Authored text, verbatim. Shown under the stage, never inside it. */
  caption: string;
  cast: SceneCue[];
  /** How long the motion needs, 1500-3000ms. The on-screen hold is `dwellMs`, which also counts reading time. */
  durationMs: number;
}

export interface SceneScript {
  /** Phrases that must all be in the step's authored text, or the scene is not built. */
  guards: string[];
  /**
   * Which derived card this scene takes the place of. `idea` is the animated version of the idea
   * card; Placement.slot in placements.ts does not have 'idea' yet, and adding it is integration's
   * job (it owns that file).
   */
  slot: 'idea' | 'interactive';
  /** 3 to 6. Fewer is not a scene, more is the wall of text again in instalments. */
  beats: SceneBeat[];
}

/** The deck interactive this part renders as. */
export type ScenePartSpec = { kind: 'scene'; prompt: string; beats: SceneBeat[] };

/** The one fixed line the card adds. Everything else on the card is the lesson's own text. */
export const SCENE_PROMPT = 'Watch the idea play out';

export const BEAT_MIN_MS = 1500;
export const BEAT_MAX_MS = 3000;
export const MIN_BEATS = 3;
export const MAX_BEATS = 6;
/** One caption must fit three lines at 393pt, the same ceiling the research verifier used. */
export const CAPTION_MAX_CHARS = 125;
/** Time between copies appearing in a `stack` or `count`, so the eye can follow the tally. */
export const COPY_STAGGER_MS = 160;
/**
 * Reading time per caption character during autoplay.
 *
 * WHY THE HOLD IS NOT JUST `durationMs`. The six researched captions run 27 to 122 characters. At
 * a 3000ms cap the 122-character diversification caption would be gone before a teen finished
 * reading it, and autoplay would be skimming the lesson for them. 50ms a character is roughly
 * 240 words a minute, a comfortable silent-reading pace. Whether a beat may hold past 3s is an
 * open question for Sriyan in the research report; this is the reading-safe answer until he rules.
 */
export const READ_MS_PER_CHAR = 50;

/** How long autoplay holds a beat before moving on: the motion, or the reading, whichever is longer. */
export function dwellMs(beat: SceneBeat): number {
  return Math.max(beat.durationMs, READ_MS_PER_CHAR * beat.caption.length);
}

/**
 * THE AUTHORED SCRIPTS, keyed `course:lesson:stepIndex` like PLACEMENTS.
 *
 * Captions and guards are verbatim from the raw corpus (research verify-scenes.mjs, 2026-09-22,
 * exit 0 on all six). Where a caption repeats a line a sibling card already shows, the research
 * picked a different sentence: investing-fundamentals:3:2's takeaway already says "Nobody changed
 * the return." and personal-finance:20:2's says "judge an account by its rate minus inflation",
 * so neither appears here (CONSTITUTION 5.1, say a thing once).
 */
export const SCENES: Record<string, SceneScript> = {
  /* investingFundamentals.ts:782-796, "How Compound Interest Works". */
  'investing-fundamentals:3:2': {
    slot: 'idea',
    guards: ['earning returns on your returns', 'doubles every 9 years', 'it is the mechanism'],
    beats: [
      {
        caption: 'Compound interest means earning returns on your returns.',
        durationMs: 1800,
        cast: [{ actor: 'px:coin', do: 'play', to: 'center' }],
      },
      {
        caption: 'That is exponential growth: slow at first, then steep.',
        durationMs: 2400,
        cast: [
          { actor: 'px:coin', do: 'slide', to: 'left-low' },
          { actor: 'kit:compound:green', do: 'play', to: 'right', atMs: 300 },
        ],
      },
      {
        caption: 'The Rule of 72 estimates doubling time, divide 72 by your return.',
        durationMs: 2000,
        cast: [
          { actor: 'px:coin', do: 'exit' },
          { actor: 'kit:compound:green', do: 'exit' },
          { actor: 'px:hourglass', do: 'enter', to: 'left', atMs: 200 },
          { actor: 'px:calculator', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'At 8% money doubles every 9 years, at 10% every 7.2 years, at 12% every 6 years.',
        durationMs: 2200,
        cast: [
          { actor: 'px:calculator', do: 'exit' },
          { actor: 'px:stack-cash', do: 'stack', to: 'right', n: 2, derivedFrom: ['doubles'], atMs: 200 },
        ],
      },
      {
        caption: 'Waiting is not passive here, it is the mechanism.',
        durationMs: 2400,
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
        durationMs: 2600,
        cast: [
          { actor: 'kit:concentrate:green', do: 'enter', to: 'left' },
          { actor: 'kit:spread:green', do: 'play', to: 'right', atMs: 700 },
        ],
      },
      {
        caption:
          'It works because of correlation: positively correlated assets move together, negatively correlated ones move opposite.',
        durationMs: 2200,
        cast: [
          { actor: 'kit:concentrate:green', do: 'exit' },
          { actor: 'kit:spread:green', do: 'exit' },
          { actor: 'px:chart-up', do: 'slide', from: 'left', to: 'left-high', atMs: 200 },
          { actor: 'px:chart-down', do: 'slide', from: 'right', to: 'right-low', atMs: 200 },
        ],
      },
      {
        caption: 'Mix low or negative correlation assets, so when one falls, others hold steady and smooth your returns.',
        durationMs: 2000,
        cast: [{ actor: 'px:shield', do: 'enter', to: 'center' }],
      },
      {
        caption: 'And it is free, which is why it is the strangest thing in the world that anyone skips it.',
        durationMs: 2000,
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
        durationMs: 1800,
        cast: [
          { actor: 'px:cart', do: 'enter', to: 'left' },
          { actor: 'px:inflation', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'At 3%, prices double in 24 years (Rule of 72: 72/3=24), so a 22-year-old needs double income by 46.',
        durationMs: 2200,
        cast: [
          { actor: 'px:inflation', do: 'exit' },
          { actor: 'px:cart', do: 'stack', n: 2, derivedFrom: ['double'] },
          { actor: 'px:hourglass', do: 'enter', to: 'right', atMs: 400 },
        ],
      },
      {
        caption: 'The one thing to keep: money that sits still shrinks, and nothing on your bank statement warns you.',
        durationMs: 2400,
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
        durationMs: 2400,
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
        durationMs: 2400,
        cast: [{ actor: 'kit:fee:green', do: 'play', to: 'center' }],
      },
      {
        caption: "When you pay $1,000 in fees this year, you don't just lose $1,000.",
        durationMs: 2000,
        cast: [
          { actor: 'kit:fee:green', do: 'exit' },
          { actor: 'px:coin', do: 'enter', to: 'center', atMs: 300 },
        ],
      },
      {
        /*
         * The coin stays and the growth it would have made plays beside it. The research had the
         * coin slide off stage in beat 2, which part-scene-pin caught leaving that beat's stage
         * empty (2026-09-22).
         */
        caption: 'You lose the $1,000 plus everything that $1,000 would have earned over the next 20-30 years.',
        durationMs: 2400,
        cast: [
          { actor: 'px:coin', do: 'slide', to: 'left' },
          { actor: 'kit:compound:red', do: 'play', to: 'right', atMs: 300 },
        ],
      },
      {
        caption: 'At 8% growth, a single $1,000 fee today costs you $10,063 over 30 years.',
        durationMs: 2600,
        cast: [
          { actor: 'kit:compound:red', do: 'exit' },
          { actor: 'px:coin', do: 'count', to: 'center', n: 10, derivedFrom: ['$10,063', '$1,000'], atMs: 200 },
        ],
      },
      {
        caption: 'A 1% annual fee on $100,000 costs $208,000 over 30 years, not $30,000.',
        durationMs: 2000,
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
        durationMs: 2000,
        cast: [{ actor: 'kit:target:blue', do: 'play', to: 'center' }],
      },
      {
        caption: 'Derivatives are contracts whose value comes from an underlying asset.',
        durationMs: 2000,
        cast: [
          { actor: 'kit:target:blue', do: 'exit' },
          { actor: 'kit:rulebook:blue', do: 'enter', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'Forwards and futures lock in a future price.',
        durationMs: 2000,
        cast: [
          { actor: 'kit:rulebook:blue', do: 'exit' },
          { actor: 'px:calendar', do: 'enter', to: 'center', atMs: 200 },
          { actor: 'px:lock', do: 'slide', from: 'off-left', to: 'left', atMs: 600 },
        ],
      },
      {
        caption: 'Options give the right, not the duty, to buy or sell.',
        durationMs: 2200,
        cast: [
          { actor: 'px:calendar', do: 'exit' },
          { actor: 'px:lock', do: 'exit' },
          { actor: 'kit:fork:blue', do: 'play', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'Swaps trade one cash flow for another, like fixed for floating.',
        durationMs: 2200,
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
        durationMs: 2000,
        cast: [{ actor: 'kit:threshold:gold', do: 'play', to: 'center' }],
      },
      {
        caption:
          'A 1-day 95% VaR of $10 million ignores the worst 5%, or 1%: the real loss could be $11 million or $500 million.',
        durationMs: 2200,
        cast: [
          { actor: 'kit:threshold:gold', do: 'slide', to: 'left' },
          { actor: 'px:crack', do: 'enter', to: 'right-low', atMs: 400 },
        ],
      },
      {
        caption: 'Expected Shortfall averages the losses in that tail: a $10M VaR might pair with a $25M ES.',
        durationMs: 2000,
        cast: [
          { actor: 'kit:threshold:gold', do: 'exit' },
          { actor: 'px:crack', do: 'exit' },
          { actor: 'px:calculator', do: 'enter', to: 'center', atMs: 200 },
        ],
      },
      {
        caption: 'In crises correlations jump toward 1.0, so everything falls together, costing LTCM $4.6 billion in 1998.',
        durationMs: 2400,
        cast: [
          { actor: 'px:calculator', do: 'exit' },
          { actor: 'px:chart-down', do: 'slide', from: 'left-high', to: 'left-low', atMs: 200 },
          { actor: 'px:house', do: 'slide', from: 'center-high', to: 'center-low', atMs: 200 },
          { actor: 'px:bank', do: 'slide', from: 'right-high', to: 'right-low', atMs: 200 },
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
  return null;
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

/** Stage coordinates of a mark, as fractions of width and height. Off-stage marks sit outside 0..1. */
export function markPoint(mark: SceneMark): { x: number; y: number } {
  if (mark === 'off-left') return { x: -0.25, y: 0.5 };
  if (mark === 'off-right') return { x: 1.25, y: 0.5 };
  const [col, row] = mark.split('-');
  const x = col === 'left' ? 0.2 : col === 'right' ? 0.8 : 0.5;
  const y = row === 'high' ? 0.3 : row === 'low' ? 0.7 : 0.5;
  return { x, y };
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
  if (key !== undefined) {
    script = SCENES[key];
  } else {
    const hits = Object.values(SCENES).filter((s) => scriptMatches(s, step));
    script = hits.length === 1 ? hits[0] : undefined;
  }
  if (!script) return null;
  if (script.beats.length < MIN_BEATS || script.beats.length > MAX_BEATS) return null;
  if (!scriptMatches(script, step)) return null;
  return { kind: 'scene', prompt: SCENE_PROMPT, beats: script.beats };
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
