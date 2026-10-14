#!/usr/bin/env node
/**
 * The stakes card is RETIRED and its art is KEPT.
 *
 * Until 2026-09-30 this pin held the "Why This Matters" screen to its web contract: 300 stakes
 * scenes, two panels, a six second dwell. The owner, on that screen in a first lesson: "so
 * confusing for someone's first lesson, this step doesn't even add any value, drop it", and then
 * "use the visuals for other stuff". So the contract is now the reverse, in three parts:
 *
 *   1. no `stakesCard` reaches any consumer of the loader (it is in RETIRED_STEP_TYPES);
 *   2. every stakes card that carried a visual handed it to the teaching slide after it
 *      (`stakesVisual`), measured at 298 of 300 when the fold was written;
 *   3. on the phone, each of those slides' decks shows that visual as a chart card, after the
 *      slide's own chart and before the takeaway, and never over the deck cap.
 *
 * The raw counts come from the authored course modules, not from the loader, so the pin can see
 * what the loader removed.
 */
import assert from 'node:assert/strict';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { loadCourseLessons as loadNative, withMobileDecks } from '../src/lib/curriculum/index.ts';
import { DECK_MAX_CARDS } from '../src/lib/mobile-lesson/types.ts';
/*
 * NATIVE LESSONS (src/lib/native-lessons, owner 2026-10-12) replace a whole synced lesson in the app
 * and do not carry its stakes visual. For those keys part 3 is checked on the derived fallback (the
 * deck the app shows if the rewrite goes stale), so the census still covers every synced lesson.
 */
import { nativeLessonKeys } from '../src/lib/native-lessons/index.ts';

const NATIVE_KEYS = new Set(nativeLessonKeys());

const MODULES = {
  'investing-fundamentals': 'investingFundamentals',
  'personal-finance': 'personalFinance',
  'global-economics': 'globalEconomics',
  'corporate-finance': 'corporateFinance',
  'business-strategy': 'businessStrategy',
  'financial-analytics': 'financialAnalytics',
  'behavioral-finance': 'behavioralFinance',
  'applied-accounting': 'appliedAccounting',
  'quantitative-analysis': 'quantitativeAnalysis',
  'risk-management': 'riskManagement',
  'alternative-investments': 'alternativeInvestments',
  'wealth-management': 'wealthManagement',
};

let authored = 0;
let authoredWithVisual = 0;
let reached = 0;
let folded = 0;
let decksWithStakesChart = 0;
const problems = [];

for (const course of COURSES) {
  const raw = (await import(`../src/lib/curriculum/courses/${MODULES[course.id]}.ts`)).default;
  const rawVisuals = new Map();
  for (const lesson of raw) {
    for (const step of lesson.steps) {
      if (step.type !== 'stakesCard') continue;
      authored += 1;
      const visual = step.withVisual ?? step.withoutVisual;
      if (visual) {
        authoredWithVisual += 1;
        rawVisuals.set(lesson.num, visual);
      }
    }
  }

  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of lesson.steps) {
      if (step.type === 'stakesCard') { reached += 1; problems.push(`${course.id} lesson ${lesson.num}: a stakesCard reached the loader output`); }
    }
    const visual = rawVisuals.get(lesson.num);
    if (!visual) continue;
    const slide = lesson.steps.find((s) => s.type === 'teachingSlide' && s.stakesVisual);
    if (!slide) { problems.push(`${course.id} lesson ${lesson.num}: the stakes visual was not folded onto a teaching slide`); continue; }
    if (slide.stakesVisual !== visual) problems.push(`${course.id} lesson ${lesson.num}: the folded visual is not the authored one`);
    folded += 1;
  }

  const derivedOnly = withMobileDecks(await loadCourseLessons(course.id), course.id);
  for (const shown of await loadNative(course.id)) {
    const lesson = NATIVE_KEYS.has(`${course.id}:${String(shown.num)}`) ? derivedOnly.find((l) => l.num === shown.num) : shown;
    const visual = rawVisuals.get(lesson.num);
    if (!visual) continue;
    const deck = lesson.steps.find((s) => s.type === 'mobileDeck' && s.sourceType === 'teachingSlide' && s.cards.some((c) => c.kind === 'chart' && c.visual === visual));
    if (!deck) { problems.push(`${course.id} lesson ${lesson.num}: no deck shows the stakes visual`); continue; }
    decksWithStakesChart += 1;
    if (deck.cards.length > DECK_MAX_CARDS) problems.push(`${course.id} lesson ${lesson.num}: deck has ${deck.cards.length} cards, over ${DECK_MAX_CARDS}`);
    const charts = deck.cards.map((c, i) => [c, i]).filter(([c]) => c.kind === 'chart');
    const stakesAt = charts.find(([c]) => c.visual === visual)[1];
    const ownChart = charts.find(([c]) => c.visual !== visual);
    if (ownChart && ownChart[1] > stakesAt) problems.push(`${course.id} lesson ${lesson.num}: the stakes chart comes before the slide's own chart`);
    const takeawayAt = deck.cards.findIndex((c) => c.kind === 'takeaway');
    if (takeawayAt >= 0 && takeawayAt < stakesAt) problems.push(`${course.id} lesson ${lesson.num}: the stakes chart comes after the takeaway`);
  }
}

assert.equal(authored, 300, `expected 300 authored stakes cards, found ${String(authored)}; the corpus changed`);
assert.equal(reached, 0, 'stakesCard is retired and must not reach the loader output');
assert.equal(folded, authoredWithVisual, `${String(authoredWithVisual)} authored visuals, ${String(folded)} folded`);
assert.equal(decksWithStakesChart, authoredWithVisual, `${String(authoredWithVisual)} folded visuals, ${String(decksWithStakesChart)} shown as a chart card`);
assert.deepEqual(problems, [], `stakes fold broke its contract:\n  ${problems.join('\n  ')}`);
console.log(`stakes-card-parity-regression: OK. ${String(authored)} authored stakes cards retired, ${String(folded)} visuals folded onto the next teaching slide and shown as a chart card on the phone.`);
