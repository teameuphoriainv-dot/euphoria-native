/**
 * The mobile lesson shape.
 *
 * WHY THIS EXISTS. The corpus is authored for a desktop browser. Measured across all 12 courses:
 * `interactiveGraph` runs to a median of 2,557 characters and `teachingSlide` to 1,636, and between
 * them those two types hold essentially all the prose in the product (721 steps out of 4,050). A
 * phone viewport holds roughly 1,000 characters, so the median graph step is two and a half
 * screenfuls of reading before you reach the chart that was the point of it.
 *
 * The fix is not a smaller font. On mobile the app teaches a genuinely simpler version of the same
 * lesson: one idea per card, one short sentence per idea, and a picture doing the work that a
 * paragraph was doing on the web.
 *
 * WHAT A DECK IS. One heavy authored step becomes ONE `mobileDeck` step holding three or four
 * cards, NOT three or four separate lesson steps. That distinction is load-bearing. Lesson length,
 * the progress bar, the step counter in the dev preview and saved progress all key off
 * `lesson.steps.length`, so expanding one step into four would silently move every learner's saved
 * position. `expandSteps()` already made this exact call for progressiveCalc, which "intentionally
 * stays as ONE outer screen ... instead of distorting lesson progress". Same reasoning, same shape.
 */
import type { AnimatedVisual } from '@/lib/curriculum';
import type { Contribution } from './grow-math';
import type { DialSpec } from './parts/dial';
import type { LeverSpec } from './parts/lever';
import type { ScenePartSpec } from './parts/scene';
import type { BuildSpec, PredictSpec } from './clickthrough/types';
import type { StageClipSpec } from './clickthrough/stage';
import type { PlaceBuilt } from './clickthrough/place';
import type { StorySpec } from './parts/story';
import type { ToggleSpec } from './parts/toggle';
import type { LedgerSpec } from './parts/ledger';

/**
 * A pixel scene on a card.
 *
 * `archetype` names a sprite in the mobile kit. `accent` recolours it and `overlay` stamps a small
 * second sprite onto it, which is how one piece of art serves a dozen lessons while still looking
 * like it was drawn for each of them. Both are optional: an archetype on its own is a valid scene.
 */
export interface SceneSpec {
  archetype: string;
  accent?: string;
  overlay?: string;
  /** Scenes respond to touch. This is the sentence Atlas says when the art is pressed. */
  explain?: string;
  /**
   * A still from a native lesson's story art (src/lib/pixel/stories), drawn instead of the
   * archetype when it loads. `archetype` stays required and is the fallback if the art fails or the
   * still is missing, so a card can never lose its picture to a bad story module.
   */
  story?: { artKey: string; still: string };
}

/**
 * The interactive pieces that replace the desktop graphs.
 *
 * All 289 `interactiveGraph` steps carry `chartData: []` -- not one of them has an authored data
 * point. Every chart on the web is generated from the `graphType` string plus slider defaults, so
 * replacing them on mobile discards no authored data whatsoever. What it discards is the slider,
 * which is a mouse affordance, and 282 of the 289 steps had one.
 *
 * `graphType` concentrates hard, which is why five kinds cover 96% of the corpus:
 *   comparison 199, timeline 38, exponential 20, pie 10, bar 7, everything else 15.
 */
/*
 * THREE KINDS, AND THE REASON THERE ARE NOT MORE.
 *
 * The first draft of this union also had `weigh` (a balance the learner tips), `split` (tappable
 * pie slices) and `rank` (comparable bars), one for each of the graphType values in the corpus.
 * All three were removed unbuilt, because there is nothing to put in them: `chartData` is empty on
 * all 289 graph steps, so a pie has no slices and a bar chart has no bars anywhere in the data.
 * Building them would have meant inventing the magnitudes, which is the one thing this layer must
 * never do. The 10 pie steps and 7 bar steps get the insight stepper like everything else, and
 * their authored sentences are intact.
 *
 * Leaving the kinds declared but unreachable would have been worse than removing them: a type that
 * describes a capability the product does not have is a claim, and the next person to read it would
 * reasonably believe a pie card exists somewhere.
 */
/*
 * How many graph steps land on each kind is printed by `scripts/mobile-deck-audit.mjs`. It used to
 * be written here as "256 of the 289", which stopped being true the day `guess` was added and kept
 * being read as current. Counts in a comment go stale; the audit does not.
 */
export type MobileInteractive =
  /**
   * The authored insights, one beat at a time.
   * Named `timeline` because the beats are ordered, not because the content is chronological.
   */
  | { kind: 'timeline'; prompt: string; moments: { label: string; detail: string; sprite?: string }[] }
  /**
   * Compound growth the learner steps through, wherever the sliders are unambiguous: a money
   * amount and a rate of RETURN (see `isRate` in interactives.ts). The value on screen is
   * `growValue` in grow-math.ts.
   */
  | {
      kind: 'grow';
      prompt: string;
      startLabel: string;
      /** The authored label of the rate slider, kept so graph-interactive-truth-pin.mjs can deny-list it. */
      rateLabel: string;
      start: number;
      ratePercent: number;
      /**
       * How `start` is paid in, read from the money label. 'monthly' and 'yearly' compound as a
       * stream of deposits; before this field all ten such cards were compounded as one deposit.
       */
      contribution: Contribution;
      maxYears: number;
      verdict: string;
    }
  /** Press to uncover the point. The fallback when a step has no usable insight. */
  | { kind: 'reveal'; prompt: string; hidden: string; scene: SceneSpec }
  /**
   * Guess the figure. The learner picks the missing number out of an authored sentence, then sees
   * the sentence in full.
   *
   * 90% of graph steps have an insight that leads with a figure, which is what makes this possible
   * without inventing anything. The SENTENCE and the REAL figure are both the author's. The two
   * wrong options are arithmetic variants of the real one, they are never presented as true, and
   * the authored sentence is shown in full immediately afterwards.
   */
  | {
      kind: 'guess';
      prompt: string;
      /** The authored sentence with the figure replaced by a blank. */
      masked: string;
      /** The figure exactly as the author wrote it. */
      answer: string;
      /** The answer plus two arithmetic variants, in a fixed order. */
      options: string[];
      /** The authored sentence, whole. */
      full: string;
      scene: SceneSpec;
    }
  /*
   * THE HAND-PLACED PARTS. None of these is ever produced by `deriveDeck`: each is put on one named
   * step by `applyPlacement` (parts/placements.ts), which the wrapped loader calls after deriving.
   * Each has a dispatch line in `DeckInteractive` (deck-interactives.tsx); without it the card
   * renders bare, which is the failure the THREE KINDS note above describes.
   *
   * The scene part is `ScenePartSpec`, NOT the `SceneSpec` at the top of this file: that one is the
   * pixel art on a card and has no `kind`, so putting it here would break the discriminated union
   * (every `spec.kind` narrowing in the renderer and the audits would stop compiling).
   */
  | DialSpec
  | LeverSpec
  | ScenePartSpec
  /*
   * THE ATLAS CLIPS (clickthrough/*). Same hand-placed contract as the parts above. Stage and Place
   * are their builders' superset types (a pictograph carries its sprite and unit key in `mark`),
   * because the kit's bare StageSpec/PlaceSpec have no field for them and a pictograph without its
   * unit key shows marks with no real number behind them.
   */
  | StageClipSpec
  | PredictSpec
  | BuildSpec
  | PlaceBuilt
  /*
   * THE NATIVE-LESSON CARDS (parts/story.ts, parts/toggle.ts, parts/ledger.ts). Never derived and
   * never placed: they appear only in hand-written native lessons (src/lib/native-lessons), which the
   * wrapped loader swaps in whole. Same dispatch contract as above: a line in DeckInteractive, and a
   * line in cardDrawsAtlas so the floating Atlas never covers their stage or controls.
   */
  | StorySpec
  | ToggleSpec
  | LedgerSpec;

/**
 * One card in a deck.
 *
 * Every text field on every kind is held to a hard character budget by
 * `scripts/mobile-card-budget-pin.mjs`. A card that cannot be cut to fit is a card that should have
 * been two cards.
 */
export type MobileCard =
  /** The teach card. One idea, one sentence, one picture. */
  | { kind: 'idea'; title: string; body: string; scene: SceneSpec }
  /** One piece of vocabulary, said plainly. Replaces the web's 4-term highlight block. */
  | { kind: 'term'; term: string; plain: string; scene: SceneSpec }
  /** The replacement for a desktop graph. */
  | { kind: 'interactive'; spec: MobileInteractive }
  /**
   * An authored diagram worth keeping, shown full width.
   *
   * EXACTLY ONE of `visual` and `svg` is set. 427 of the 432 teaching slides carry an
   * `AnimatedVisual`, which renders with tap-to-explain rows; a handful instead carry a raw
   * authored SVG string and nothing else. An early version of this layer handled only the first
   * kind and silently dropped the second, which `scripts/raw-svg-parity-regression.mjs` caught by
   * counting 6 rendered against 11 authored.
   */
  | { kind: 'chart'; title: string; visual?: AnimatedVisual; svg?: string }
  /** The one thing to remember, said last. */
  | { kind: 'takeaway'; body: string; scene: SceneSpec };

/**
 * A deck: what one heavy authored step becomes on a phone.
 *
 * `sourceType` and `sourceId` are kept so the render audit, the budget pin and the override table
 * can all trace a card back to the authored step it came from.
 */
export interface MobileDeck {
  type: 'mobileDeck';
  /**
   * 'native' for a deck written by hand inside a native lesson (src/lib/native-lessons). Its
   * `sourceId` is `native:<course>:<num>:s<screen>`, which never parses as the `course:lesson:index`
   * position stepIdPosition and applyPlacement read, so no derived-deck consumer can misread it.
   */
  sourceType: 'teachingSlide' | 'interactiveGraph' | 'native';
  sourceId: string;
  label: string;
  title: string;
  cards: MobileCard[];
}

/** Character budgets. Set from the ~92% cut agreed for mobile, and enforced by a pin. */
export const CARD_BUDGET = {
  /** A card title. Long enough for a real idea, short enough for one line at 393pt. */
  title: 42,
  /** The body of an idea card. Roughly one short sentence. */
  body: 90,
  /**
   * A vocabulary word said plainly.
   *
   * Higher than the body budget ON PURPOSE. A definition has to stay whole to stay true, and at 80
   * the compressor rejected 430 of the 721 authored definitions and fell back to printing them in
   * full anyway, which made the budget a number that described nothing. 110 is about three lines on
   * a 393pt screen, still a tenth of what the web slide carried, and it is a budget the content can
   * actually meet.
   */
  plain: 110,
  /** The closing line. */
  takeaway: 90,
  /** A prompt above an interactive. */
  prompt: 60,
  /** Supporting detail inside an interactive. */
  detail: 70,
  /** The line an interactive shows once the learner has worked it. */
  verdict: 90,
} as const;

/**
 * Cards per deck. Four at most was the whole point of the rebuild; FIVE since 2026-09-30, and only
 * because the retired `stakesCard` step's visual now rides on the teaching deck that follows it
 * as a second chart card (courseIndex.ts, withStakesFolded). Measured before the change: 147 of
 * the 300 decks that inherit one were already at four cards. One swipe more in a deck is far
 * lighter than the full-screen comparison with a six second dwell it replaces.
 *
 * The floor is TWO, not three, even though the corpus currently produces none.
 *
 * Three steps in quantitative-analysis did derive two-card decks until the chart card learned to
 * carry an authored raw SVG as well as an AnimatedVisual, which gave all three a third card. The
 * floor stays at two because it is a floor: a step with no diagram and no authored send-off
 * genuinely contains two cards worth of material, and padding it to three would mean inventing a
 * card. An invented card is exactly what this layer refuses to do.
 */
export const DECK_MIN_CARDS = 2;
export const DECK_MAX_CARDS = 5;
