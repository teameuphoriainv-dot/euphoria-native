/**
 * Hand-placed parts: a new interactive put on one exact step, built from that lesson's own numbers.
 *
 * WHY THIS EXISTS. `derive.ts` picks the interactive for every graph deck from the step alone, and
 * the only kinds it can build without inventing a figure are the insight stepper, the guess and the
 * reveal. Some lessons author the numbers a live part needs (a dial, a lever, a scene) in a step
 * other than the one being derived, so no step-local rule can find them. This table names the step
 * and hands the builder the whole lesson.
 *
 * WHY THE KEY HAS NO FINGERPRINT, unlike `overrides.ts`. An override is hand-written PROSE, so it
 * must stop matching the moment the authored step changes. A placement writes nothing: its builder
 * reads the authored figures fresh on every load and returns null when they are not there. That
 * null is the staleness check, so the key only needs the position, `course:lesson:stepIndex`.
 *
 * THE RULE FOR A BUILDER. Every number it puts on screen is one the lesson authored, or plain math
 * on those. If the figures it looks for are missing, as they will be after a re-sync that rewrote
 * the lesson, it returns null and the derived deck ships untouched. It never falls back to a
 * default value: a part showing plausible numbers the lesson does not contain is the fabricated-
 * number failure in CONSTITUTION 3.1.
 */
import type { LessonStep } from '@/lib/curriculum';
import { stepIdPosition } from '../stepId';
import { buildDial, textOf as dialText } from './dial';
import { buildLever, textOf as leverText } from './lever';
import { SCENES, sceneBuilder } from './scene';
import { DECK_MAX_CARDS, type MobileCard, type MobileDeck, type MobileInteractive } from '../types';

/** The part kinds a placement may build. */
export type PlacementKind = 'dial' | 'lever' | 'scene';

export type Placement = {
  /** Which part this is, so the audit can count placements by kind. */
  kind: PlacementKind;
  /**
   * Build the part from the step at this position and the lesson's other steps.
   * `text` is every authored sentence the part puts on screen, for the deck's repeat check.
   * Null means the authored figures are not there, and the derived deck is kept.
   */
  build(step: LessonStep, lessonSteps: LessonStep[]): { spec: MobileInteractive; text: string[] } | null;
  /**
   * The derived card the part takes the place of. `idea` is for a scene: its first beat is the idea
   * card's body word for word on 5 of the 5 idea-slot scenes (measured 2026-09-22), so keeping both
   * would say the same sentence twice on one deck (CONSTITUTION 5.1).
   */
  slot: 'interactive' | 'chart' | 'idea';
};

const dial = (step: LessonStep, lessonSteps: LessonStep[]) => {
  const spec = buildDial(step, lessonSteps);
  return spec ? { spec, text: dialText(spec) } : null;
};
const lever = (step: LessonStep, lessonSteps: LessonStep[]) => {
  const spec = buildLever(step, lessonSteps);
  return spec ? { spec, text: leverText(spec) } : null;
};

/*
 * WHERE EACH PART GOES, AND WHY THAT CARD.
 *
 * A deck holds ONE interactive: CardDeck gates Continue on it and every audit counts one per deck.
 * So a part never sits beside another interactive; it takes a card's place.
 *
 * - corporate-finance:6:2, cash-cycle dial over the CHART. The slide is a teaching slide with no
 *   interactive, and the lesson had 0 hands-on steps (scout, 2026-09-22). The bars chart it
 *   replaces draws the same DIO + DSO - DPO the dial computes, and the dial lets the learner move it.
 *   The step's atlas hint says "Press each bar", but a deck carries no atlas field, so that hint is
 *   not shown on this screen either before or after.
 * - personal-finance:14:4, rent dial over the GUESS, not on step 2. Step 2 is the teaching slide
 *   that holds "$1,667", but it has no interactive, so the dial would have to replace its authored
 *   "True Monthly Cost of a $400K Home" chart, which shows costs the dial does not. Step 4's guess blanks the same "5%"
 *   twice ("The ? rule: home value x ? / 12") and restates step 2's term card. buildRent reads the
 *   $1,667 from the whole lesson and needs only the $400K on the placed step, which step 4 names.
 * - alternative-investments:2:4, lever over the GUESS. Its idea card already says "See how
 *   different down payment amounts affect your total return", a direction the guess never acted on.
 * - every scene, over the card its script names (`slot` in scene.ts). Five replace the IDEA card on
 *   a teaching slide with no interactive; investing-fundamentals:20:4 replaces a "Tap through it"
 *   timeline, the weakest derived interactive, with the same insights acted out.
 */
export const PLACEMENTS: Record<string, Placement> = {
  'corporate-finance:6:2': { kind: 'dial', slot: 'chart', build: dial },
  'personal-finance:14:4': { kind: 'dial', slot: 'interactive', build: dial },
  'alternative-investments:2:4': { kind: 'lever', slot: 'interactive', build: lever },
  ...Object.fromEntries(
    Object.entries(SCENES).map(([key, script]): [string, Placement] => [
      key,
      { kind: 'scene', slot: script.slot, build: sceneBuilder(key) },
    ]),
  ),
};

/**
 * Put a placed part into a derived deck, or hand the deck back exactly as it came.
 *
 * Where the part goes, in order:
 *   1. over the card named by `slot` (the interactive on a graph deck, the chart on a slide deck);
 *   2. otherwise into a deck with room, just ahead of the takeaway, because a takeaway after the
 *      evidence is the one ordering rule `mobile-deck-audit.mjs` fails on;
 *   3. otherwise nowhere: a full deck without that slot is returned unchanged, since a fifth card
 *      breaks the four-card cap the rebuild exists for.
 *
 * The SAME deck object comes back whenever nothing is placed, not a copy, so "no placement" is
 * provably identity and `scripts/deck-derive-polish-pin.mjs` checks it over all 721 decks.
 *
 * `table` is a parameter so the pin can exercise a builder that returns null without writing a
 * test entry into the shipped table.
 */
export function applyPlacement(
  deck: MobileDeck,
  sourceId: string,
  lessonSteps: LessonStep[],
  table: Readonly<Record<string, Placement>> = PLACEMENTS,
): MobileDeck {
  const position = stepIdPosition(sourceId);
  const placement = table[position];
  if (!placement) return deck;

  const index = Number(position.split(':')[2]);
  const step = lessonSteps[index];
  if (!step) return deck;

  const built = placement.build(step, lessonSteps);
  if (!built) return deck;

  const card: MobileCard = { kind: 'interactive', spec: built.spec };
  const at = deck.cards.findIndex((c) => c.kind === placement.slot);
  if (at >= 0) {
    const cards = deck.cards.slice();
    cards[at] = card;
    return { ...deck, cards: placement.slot === 'chart' ? cards.map(withoutChartTalk) : cards };
  }
  if (deck.cards.length < DECK_MAX_CARDS) {
    const takeawayAt = deck.cards.findIndex((c) => c.kind === 'takeaway');
    const cards = deck.cards.slice();
    cards.splice(takeawayAt >= 0 ? takeawayAt : cards.length, 0, card);
    return { ...deck, cards };
  }
  return deck;
}

/*
 * THE CHART IS GONE, SO NOTHING MAY STILL TALK ABOUT IT. A scene's `explain` is the step's atlas
 * hint, written for the chart the author drew. corporate-finance:6:2's hint is "Press each bar ...
 * the last bar is whatever is left over", and after the dial took the chart's slot the idea card
 * still said it, pointing at bars that were no longer on screen (found in the 2026-09-22 gate).
 */
const CHART_TALK = /\b(?:bars?|slices?|press each|tap each|the chart|the graph)\b/i;

function withoutChartTalk(card: MobileCard): MobileCard {
  if (!('scene' in card) || !card.scene?.explain || !CHART_TALK.test(card.scene.explain)) return card;
  const { explain: _dropped, ...scene } = card.scene;
  return { ...card, scene } as MobileCard;
}
