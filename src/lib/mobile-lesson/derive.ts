/**
 * One heavy authored step becomes one deck of three or four cards.
 *
 * THE SHAPE OF A DECK is fixed, and the order is the teaching order:
 *   1. the claim          what this step is actually saying
 *   2. the word           one piece of vocabulary, said plainly (only if the step has any)
 *   3. the doing          the chart worth keeping, or the interactive that replaced a graph
 *   4. the takeaway       the one sentence to leave with
 * A step that cannot fill a slot simply skips it, which is why a deck can be three cards. A step
 * that could fill more does not get a fifth card: the whole point of the rebuild is that a phone
 * screen ends.
 *
 * NOTHING HERE WRITES PROSE. Every string on every card comes out of `compress()`, which only ever
 * picks and trims sentences the curriculum author wrote. See the header of `compress.ts` for why
 * that constraint is absolute rather than stylistic.
 */
import type { AnimatedVisual, InteractiveGraphStep, LessonStep, TeachingSlideStep } from '@/lib/curriculum';
import { visualIsRenderable } from '../lesson-steps';
import { MOBILE_KIT_ACCENTS } from '../pixel/sprites-mobile-kit';
import { compress, compressTitle, sentences } from './compress';
import { interactiveFor } from './interactives';
import { pickDistinctArchetype } from './archetypes';
import { overrideFor } from './overrides';
import { textOf as dialText } from './parts/dial';
import { textOf as leverText } from './parts/lever';
import { textOf as sceneText } from './parts/scene';
import { CARD_BUDGET, DECK_MAX_CARDS, type MobileCard, type MobileDeck, type MobileInteractive, type SceneSpec } from './types';

/** Is this a step the mobile layer takes over? Everything else passes through untouched. */
export function isHeavyStep(step: LessonStep): boolean {
  const t = (step as { type?: string })?.type;
  return t === 'teachingSlide' || t === 'interactiveGraph';
}

/**
 * Overlay marks that say what KIND of card this is.
 *
 * A deck is about one idea, so its cards often resolve to the same archetype: a lesson called "The
 * 50/30/20 Rule" legitimately gives its claim, its vocabulary and its takeaway all the `rulebook`
 * picture. Coherent, but three identical sprites in a four card deck reads as a bug.
 *
 * The overlay is the cheap fix and it is SEMANTIC rather than decorative, which is why it is a
 * fixed map and not a rotation: a new word gets a question mark, a closing line gets a check. The
 * marks are drawn in a reserved 6x6 corner that no archetype occupies, and they are deliberately
 * not accent tinted, so they read the same on every card they appear on.
 */
const CARD_MARK: Partial<Record<MobileCard['kind'], string>> = {
  term: 'question',
  takeaway: 'check',
};

/**
 * A scene, avoiding art already spent elsewhere in the same deck.
 *
 * `used` is mutated as it goes, which is deliberate: the caller builds the cards in order and each
 * one should see what the ones before it took. Before this, 290 of the 721 decks repeated a sprite
 * and 48 showed the same one three times or more.
 */
function scene(
  used: Set<string>,
  explainSource: string | undefined,
  ...text: (string | undefined)[]
): SceneSpec {
  const archetype = pickDistinctArchetype(used, ...text);
  used.add(archetype);
  const spec: SceneSpec = { archetype };
  const explain = explainSource ? compress(explainSource, CARD_BUDGET.verdict) : '';
  return explain ? { ...spec, explain } : spec;
}

/** Stamp the card-kind mark onto a scene. */
function marked(spec: SceneSpec, kind: MobileCard['kind']): SceneSpec {
  const overlay = CARD_MARK[kind];
  return overlay ? { ...spec, overlay } : spec;
}

/**
 * Pull the vocabulary card.
 *
 * ONE term, not four. `teachingSlide` authors up to four highlighted terms and the web shows them
 * all; four definitions on a phone is a glossary, not a lesson. The first authored term is taken
 * because authors lead with the one the step is actually about.
 *
 * `mustReturn` is set so a definition that will not compress comes through long rather than
 * missing. A term card with a word and no meaning is worse than a term card that runs two lines.
 */
function termCard(
  terms: { term: string; definition: string }[] | undefined,
  used: string[],
  art: Set<string>,
): MobileCard | null {
  const first = (terms ?? []).find((t) => t?.term?.trim() && t?.definition?.trim());
  if (!first) return null;
  const plain = compress(first.definition, CARD_BUDGET.plain, { mustReturn: true, avoid: used });
  if (!plain) return null;
  return {
    kind: 'term',
    term: compressTitle(first.term, CARD_BUDGET.title),
    plain,
    /*
     * The TERM first, its definition only as a fallback.
     *
     * Order is the whole fix. A definition names every concept it touches, so matching against term
     * and definition TOGETHER put the wrong picture on the card: "50/30/20 Rule" wore the debt
     * chain because its definition ends "and debt repayment". Dropping the definition outright
     * over-corrected: term names are short and often contain no keyword at all, so 721 cards fell
     * through to the generic fallback and `growth` went from 24% of all art to 46%.
     *
     * `pickArchetype` tries each source in turn, so passing both gives the term priority AND keeps
     * the definition as a second look. Right picture when the term says what it is, a reasonable
     * one when it does not.
     */
    scene: marked(scene(art, undefined, first.term, first.definition), 'term'),
  };
}

/** The closing card. Prefers what the author wrote as a send-off over anything reused. */
function takeawayCard(
  sources: (string | string[] | undefined)[],
  used: string[],
  topic: string,
  art: Set<string>,
): MobileCard | null {
  for (const source of sources) {
    if (!source) continue;
    const body = compress(source, CARD_BUDGET.takeaway, { avoid: used });
    if (body) return { kind: 'takeaway', body, scene: marked(scene(art, undefined, body, topic), 'takeaway') };
  }
  return null;
}

/** Every authored sentence an interactive puts on screen, so the takeaway does not repeat one. */
function interactiveText(spec: MobileInteractive): string[] {
  if (spec.kind === 'timeline') return spec.moments.map((m) => m.label);
  if (spec.kind === 'reveal') return [spec.hidden];
  if (spec.kind === 'grow') return [spec.verdict];
  /*
   * The placed parts. `interactiveFor` does not build these today (applyPlacement puts them in
   * after derivation), so these lines are unreachable now and exist for the day one of them moves
   * into interactiveFor: a silent `[]` then would let the takeaway repeat a sentence the part
   * already shows (CONSTITUTION 5.1), which is the timeline/takeaway duplicate described below.
   * Each part's own textOf is the single list of what it puts on screen.
   */
  if (spec.kind === 'dial') return dialText(spec);
  if (spec.kind === 'lever') return leverText(spec);
  if (spec.kind === 'scene') return sceneText(spec);
  return [];
}

/**
 * The running orders a deck may use, as card kinds in sequence.
 *
 * WHY THIS EXISTS. Every deck used to be built in one fixed order, so across 721 decks there were
 * exactly THREE distinct card sequences and all of them opened `idea, term`. Four cards shown in
 * the same order 721 times is the definition of the boredom this whole rebuild was meant to remove.
 *
 * All of these teach the same material; they differ in where they START, which is the part a
 * learner notices. Leading with the picture suits a step whose diagram IS the argument; leading
 * with the word suits one that cannot be read until the word is known; leading with the claim is
 * the plain version and is still the most common.
 *
 * Anything not named in the chosen order is appended in its natural position rather than dropped,
 * so an order can never silently lose a card the step actually had.
 */
const RUNNING_ORDERS: readonly (readonly MobileCard['kind'][])[] = [
  ['idea', 'term', 'chart', 'takeaway'],
  ['idea', 'term', 'interactive', 'takeaway'],
  ['chart', 'idea', 'term', 'takeaway'],
  ['interactive', 'idea', 'term', 'takeaway'],
  ['term', 'idea', 'chart', 'takeaway'],
  ['idea', 'chart', 'term', 'takeaway'],
  ['idea', 'interactive', 'term', 'takeaway'],
];

/**
 * Put a deck's cards in an order chosen from the step's own id.
 *
 * DETERMINISTIC, not random. The same step produces the same deck on every launch and on every
 * device, which matters because a learner going back a screen must not find the lesson rearranged,
 * and because the audits have to be able to reproduce what they are checking.
 *
 * The id already carries a content fingerprint, so two adjacent steps in one lesson get different
 * orders while one step keeps its order until an author edits it.
 */
function arrange(sourceId: string, cards: (MobileCard | null)[]): MobileCard[] {
  const present = cards.filter((c): c is MobileCard => c !== null);
  if (present.length < 3) return present.slice(0, DECK_MAX_CARDS);

  let h = 0;
  for (let i = 0; i < sourceId.length; i += 1) h = (h * 33 + sourceId.charCodeAt(i)) >>> 0;
  const order = RUNNING_ORDERS[h % RUNNING_ORDERS.length];

  /*
   * THE TAKEAWAY IS ALWAYS LAST, whatever the running order says.
   *
   * It is held out of the shuffle entirely rather than trusted to the order. The first version let
   * it be placed by name and then appended whatever the order had not mentioned, which produced
   * `idea, term, takeaway, chart` on 115 decks: an order that names `interactive` places the
   * takeaway third on a deck that has a chart instead, and the chart lands after it. A card that
   * says "remember this" cannot come before the evidence.
   */
  const takeaway = present.filter((c) => c.kind === 'takeaway');
  const remaining = present.filter((c) => c.kind !== 'takeaway');
  const out: MobileCard[] = [];
  for (const kind of order) {
    if (kind === 'takeaway') continue;
    const at = remaining.findIndex((c) => c.kind === kind);
    if (at >= 0) out.push(...remaining.splice(at, 1));
  }
  // Anything the order did not name keeps its authored position, still ahead of the takeaway.
  out.push(...remaining, ...takeaway);
  return out.slice(0, DECK_MAX_CARDS);
}

function deckFromTeachingSlide(step: TeachingSlideStep, sourceId: string): MobileDeck {
  const used: string[] = [];
  const art = new Set<string>();
  const title = compressTitle(step.title, CARD_BUDGET.title);

  const body = compress(step.paragraphs ?? [], CARD_BUDGET.body);
  if (body) used.push(body);

  const claim: MobileCard | null = body
    ? { kind: 'idea', title, body, scene: scene(art, step.atlas?.hint, step.title, step.diagramDescription) }
    : null;

  const word = termCard(step.highlightedTerms, used, art);
  if (word && word.kind === 'term') used.push(word.plain);

  /**
   * The authored diagram is KEPT. `teachingSlide` carries a real `AnimatedVisual` in 427 of its 432
   * occurrences, and unlike the graph steps these are authored data with authored labels, so there
   * is something to lose by dropping them. `LessonVisual` already renders them with tap-to-explain
   * rows, so this card is the existing component on a card of its own.
   */
  /*
   * The heading comes from the visual's OWN title, never from `diagramDescription`.
   * `diagramDescription` is a note to whoever draws the diagram, not a caption: one of them reads
   * "Two-column comparison: left side shows a ..." and trimming that to card width produced the
   * heading "Two-column comparison: left side shows a".
   *
   * The authored SVG is the fallback, not an afterthought. Handling only `diagramVisual` dropped
   * every slide whose diagram is a raw SVG string, which is the same precedence `normalizeStep`
   * already uses for the web teaching slide.
   */
  const visual = step.diagramVisual as AnimatedVisual | undefined;
  const svg = typeof step.diagramSvg === 'string' && step.diagramSvg.trim() ? step.diagramSvg : undefined;
  const chart: MobileCard | null = visualIsRenderable(visual)
    ? { kind: 'chart', title: compressTitle(visual!.title || step.title, CARD_BUDGET.title), visual: visual! }
    : svg
      ? { kind: 'chart', title: compressTitle(step.title, CARD_BUDGET.title), svg }
      : null;

  // Authored send-offs only, for the reason given on the graph deck's takeaway below.
  const takeaway = takeawayCard([step.atlas?.recap, step.realExample?.explanation], used, step.title, art);

  return {
    type: 'mobileDeck',
    sourceType: 'teachingSlide',
    sourceId,
    label: step.sectionLabel || 'Learn',
    title,
    cards: arrange(sourceId, [claim, word, chart, takeaway]),
  };
}

/**
 * A sentence that tells the learner to work a control the phone does not draw.
 *
 * The graph step's `description` was written for the desktop chart and its sliders, and the deck
 * replaces both. Measured 2026-09-22 through the wrapped loader: 37 of the 289 graph decks opened
 * their idea card on one of these, e.g. investing-fundamentals:3:4 read "Adjust the starting
 * amount, monthly contribution, and annual return to see how your wealth grows exponentially over
 * time." (121 characters, over the 90 budget) above a card with no slider on it. An instruction for
 * a missing control is not a claim, so it is not a candidate for the claim card at all.
 *
 * Matched only at the START of a sentence: "Use the slider" opens an instruction, while "investors
 * who move money in a panic" is a claim that happens to contain the verb.
 */
const CONTROL_INSTRUCTION = /^(adjust|drag|move|slide|toggle|use the slider|watch how|try changing|click)\b/i;

/**
 * A "Compare ..." / "See ..." / "Explore ..." sentence that comes AFTER a control instruction in the
 * same passage is the rest of those directions, not a claim. Dropping only the control sentence let
 * the next direction take the card: measured 2026-09-22, wealth-management:23:4 went from "Adjust
 * your portfolio size..." to "Compare the 4% rule, 5% withdrawal, and 6% withdrawal." and
 * financial-analytics:2:4 to "Compare low-volatility bonds to high-volatility stocks.", both still
 * pointing at a chart the phone does not draw. Only the FOLLOWING sentence is dropped: a passage
 * that OPENS with "Compare ..." or "See how ..." (78 and 62 graph descriptions) is usually the
 * author's one-line summary and stays a candidate, which is why these verbs are not simply added to
 * CONTROL_INSTRUCTION.
 */
const FOLLOW_ON_DIRECTION = /^(compare|see|explore)\b/i;

/** Every authored sentence in `source` except the ones instructing a control the deck dropped. */
function withoutControlInstructions(source: string[]): string[] {
  return source.flatMap((passage) => {
    let afterControl = false;
    return sentences(passage).filter((s) => {
      if (CONTROL_INSTRUCTION.test(s)) {
        afterControl = true;
        return false;
      }
      return !(afterControl && FOLLOW_ON_DIRECTION.test(s));
    });
  });
}

function deckFromInteractiveGraph(step: InteractiveGraphStep, sourceId: string): MobileDeck {
  const used: string[] = [];
  const art = new Set<string>();
  const title = compressTitle(step.title, CARD_BUDGET.title);

  /**
   * The claim comes from `description` before `paragraphs`. On a graph step the description is the
   * sentence explaining what the picture shows, which is the closest thing the step has to a thesis;
   * the paragraphs underneath it are commentary on a chart the phone is not going to draw.
   */
  const body = compress(withoutControlInstructions([step.description ?? '', ...(step.paragraphs ?? [])]), CARD_BUDGET.body);
  if (body) used.push(body);

  const claim: MobileCard | null = body
    ? { kind: 'idea', title, body, scene: scene(art, undefined, step.title, step.description) }
    : null;

  const word = termCard(step.highlightedTerms, used, art);
  if (word && word.kind === 'term') used.push(word.plain);

  const doing: MobileCard = { kind: 'interactive', spec: interactiveFor(step) };
  /*
   * Everything the interactive already says counts as said.
   *
   * Without this the deck shows one sentence twice: the timeline's first moment and the takeaway
   * both compress `insights`, both pick insight zero, and the learner taps forward from a fact to
   * the same fact. Feeding the interactive's own strings into `avoid` is what makes the last card
   * land on something new.
   */
  used.push(...interactiveText(doing.spec));

  /*
   * ONLY a self-contained authored send-off. Never leftover insights.
   *
   * This used to fall back to `insights` after the interactive had taken the good ones, and the
   * result was a closing card built from scraps: "The average bull market lasts 2.7 years" (the
   * author's contrast with bear markets having been used already) and "The last decade alone added
   * $278,000" (added to what?). A three card deck that ends on the interactive is better than a
   * four card deck that ends on a fragment, so when there is no real send-off there is no card.
   */
  const takeaway = takeawayCard([step.realExample?.explanation], used, step.title, art);

  return {
    type: 'mobileDeck',
    sourceType: 'interactiveGraph',
    sourceId,
    label: step.sectionLabel || 'Explore',
    title,
    cards: arrange(sourceId, [claim, word, doing, takeaway]),
  };
}

/**
 * The sprite-kit ramp each course's scenes are drawn in.
 *
 * WHY. `SceneSpec.accent` has existed since the kit shipped and not one deck ever set it: measured
 * 2026-09-22 through the wrapped loader, 0 of the 1,806 scenes on the 721 decks carried an accent,
 * so every scene in all 12 courses rendered in the same default orchid and a behavioural-finance
 * lesson looked identical to a corporate-finance one.
 *
 * HOW EACH WAS CHOSEN. The kit has seven hued ramps (plus neutral) and the courses have twelve web
 * accents in `src/lib/course-accents.ts`, so each course takes the ramp whose base colour is NEAREST
 * IN HUE to its accent, computed rather than eyeballed (hue distance in degrees in the comment).
 * Reuse is forced by 12 into 7; no ramp is invented, because a colour that is not already in
 * `palette.ts` is exactly what the kit was written to keep out.
 *
 * An unknown course gets NO accent rather than a guessed one, so `scripts/deck-derive-polish-pin.mjs`
 * fails the day a new course is synced without being added here.
 */
export const COURSE_SCENE_ACCENT: Readonly<Record<string, string>> = {
  'investing-fundamentals': 'green', // #34D399 vs green 0 deg
  'personal-finance': 'orchid', // #B862ED vs orchid 4 deg
  'global-economics': 'teal', // #22D3EE vs teal 15 deg
  'corporate-finance': 'blue', // #60A5FA vs blue 0 deg
  'business-strategy': 'gold', // #FBBF24 vs gold 5 deg
  'financial-analytics': 'gold', // #FB923C vs gold 11 deg (the kit has no orange ramp)
  'behavioral-finance': 'pink', // #F472B6 vs pink 0 deg
  'applied-accounting': 'blue', // #38BDF8 vs blue 15 deg
  'quantitative-analysis': 'blue', // #818CF8 vs blue 21 deg, orchid 39 deg
  'risk-management': 'red', // #F87171 vs red 0 deg
  'alternative-investments': 'red', // #FB7185 vs red 9 deg, pink 23 deg
  'wealth-management': 'gold', // #F59E0B vs gold 0 deg
};

/** The course's scene ramp, or undefined for a course the table does not know. */
export function sceneAccentFor(sourceId: string): string | undefined {
  const accent = COURSE_SCENE_ACCENT[sourceId.split(':')[0]];
  // A name the kit does not define would silently fall through to orchid in `applyAccent`.
  return accent && MOBILE_KIT_ACCENTS.includes(accent) ? accent : undefined;
}

/**
 * Put the course's ramp on every scene in the deck: each card's scene and the scene inside a reveal
 * or guess interactive. A scene that already names an accent (a hand-written override) keeps it.
 */
function tinted(deck: MobileDeck): MobileDeck {
  const accent = sceneAccentFor(deck.sourceId);
  if (!accent) return deck;
  const tint = (s: SceneSpec): SceneSpec => (s.accent ? s : { ...s, accent });
  const cards = deck.cards.map((card): MobileCard => {
    if (card.kind === 'interactive') {
      const spec = card.spec;
      return spec.kind === 'reveal' || spec.kind === 'guess' ? { ...card, spec: { ...spec, scene: tint(spec.scene) } } : card;
    }
    return 'scene' in card && card.scene ? ({ ...card, scene: tint(card.scene) } as MobileCard) : card;
  });
  return { ...deck, cards };
}

/**
 * Derive the deck for one heavy step, or return null if this step is not one.
 *
 * A hand-written override for this exact step wins outright. `sourceId` carries a content
 * fingerprint, so an override stops matching the moment the web author edits the step it was
 * written for, and the deck silently reverts to derived rather than describing content that has
 * changed underneath it. See `stepId.ts`.
 */
export function deriveDeck(step: LessonStep, sourceId: string): MobileDeck | null {
  const override = overrideFor(sourceId);
  if (override) return tinted({ ...override, sourceId });

  const t = (step as { type?: string })?.type;
  if (t === 'teachingSlide') return tinted(deckFromTeachingSlide(step as TeachingSlideStep, sourceId));
  if (t === 'interactiveGraph') return tinted(deckFromInteractiveGraph(step as InteractiveGraphStep, sourceId));
  return null;
}
