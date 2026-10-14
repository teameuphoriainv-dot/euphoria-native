#!/usr/bin/env node
/**
 * Native lessons (src/lib/native-lessons): the override, its staleness key, and the copy rules.
 *
 * WHAT IS AT RISK. A native lesson is a whole synced lesson rewritten for the phone and swapped in
 * at the wrapped loader (curriculum/index.ts). `src/lib/curriculum/**` is regenerated wholesale by
 * scripts/sync-curriculum.sh, so the web lesson it replaces can change under it at any sync. The app
 * then falls back to the synced lesson (the fingerprint stops matching), which keeps the learner
 * correct but silently throws the rewrite away. This pin turns that into a failure in `npm run check`
 * that prints the new fingerprint, the same contract overrides.ts has with mobile-deck-audit --stale.
 *
 * WHAT IT CHECKS
 *  - The override: every native lesson is active, the wrapped loader returns exactly its steps and
 *    challenge without deriving a deck, and a changed source falls back to the synced lesson.
 *  - The shape the runner relies on: one keyTermsCards (three parts), practice within the cap, no
 *    step that expands, 4+ challenge questions, xp equal to the source.
 *  - The decks, the phone budgets, the copy rules (no dashes, no advice words, the correct option
 *    never the unique longest, no vocab definition giving its term away), say it once, and every $
 *    and % figure against the lesson's allowlist (CONSTITUTION 3.1), recomputed.
 *  - Every answer explains itself: each quiz and micro check sets `explainWhenRight`, so a right answer
 *    offers its reason behind Why? too (research.json: instant feedback that explains).
 *  - A vocab `ask` (the situation the vocab quiz asks instead of echoing the definition) stays in the
 *    prompt budget and never names a term, or the quiz is a keyword match again.
 *  - The native card modules and story art the lesson needs, and the dispatch lines that render them.
 *
 * `--print-fingerprint` prints each native lesson's wanted and current fingerprint, for re-blessing
 * AFTER a human has re-reviewed the rewrite against the changed web lesson.
 * `--selftest` breaks a copy of the real lesson one way at a time and fails if a detector stays
 * quiet (CONSTITUTION 1.5).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const imported = (rel) => import(pathToFileURL(join(ROOT, rel)).href);

const W = await imported('src/lib/curriculum/index.ts');
const R = await imported('src/lib/curriculum/courseIndex.ts');
const N = await imported('src/lib/native-lessons/index.ts');
const { segmentsOf } = await imported('src/lib/lesson-segments.ts');
const { expandSteps, normalizeStep } = await imported('src/lib/lesson-steps.ts');
const { hasMasteryChallenge } = await imported('src/lib/mastery-challenge-model.ts');
const { isArchetype } = await imported('src/lib/mobile-lesson/archetypes.ts');
const { CARD_BUDGET, DECK_MAX_CARDS } = await imported('src/lib/mobile-lesson/types.ts');

/* Budgets that are not in CARD_BUDGET (lesson-spec.md section 9.1). */
const MAX = { prompt: 130, option: 70, explanation: 180, definition: 180, example: 110, storyCaption: 125,
  toggleCaption: 110, ledgerCaption: 90, chip: 16, label: 16, footer: 90, a11y: 160, button: 24, words: 25 };
const W80 = 80;
const H60 = 60;
const FIGURE = /\$\d+(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?%/g;
const figs = (t) => String(t ?? '').match(FIGURE) ?? [];
const cents = (f) => Math.round(Number(String(f).replace(/[$,%]/g, '')) * 100);
const wordCount = (t) => String(t ?? '').split(/\s+/).filter(Boolean).length;
const money = (n) => `$${n.toFixed(2)}`;
const FORBIDDEN_TYPES = new Set(['stakesCard', 'teachingSlide', 'interactiveGraph', 'multi']);
const NATIVE_KINDS = new Set(['story', 'toggle', 'ledger']);
// Keys whose values are ids or wiring, not words a learner reads.
const NOT_COPY = new Set(['type', 'kind', 'sourceType', 'sourceId', 'artKey', 'frame', 'actor', 'do', 'ghostSprite',
  'id', 'tone', 'archetype', 'accent', 'still', 'derivedFrom']);
const ADVICE = /\b(should|safe|safely|risk-free|get rich|beat the market)\b/i;
const JARGON = /\b(purchasing power|IOU|principal|equity|volatil\w*|portfolio)\b/i;

function ledgerMath(spec) {
  const r = spec.ratePercent / 100;
  const total = (n) => spec.start * (1 + r) ** n;
  const round = (x) => Math.round(x * 100) / 100;
  return { total: (n) => round(total(n)), gain: (n) => round(total(n) - total(n - 1)), simple: (n) => round(spec.start * (1 + r * n)) };
}
const interactives = (lesson) => lesson.steps.filter((s) => s.type === 'mobileDeck')
  .flatMap((d) => d.cards.filter((c) => c.kind === 'interactive').map((c) => c.spec));

/*
 * EVERY FIGURE A LESSON MAY SHOW, per lesson, with its arithmetic. A figure not on the list fails,
 * so a new number cannot reach a learner without someone deciding it is real (with a source) or a
 * labelled example (CONSTITUTION 3.1). Computed figures are recomputed here, not copied.
 */
/* The data module of each native lesson, for the constants its figures are derived from. */
const MODULE_OF = { 'investing-fundamentals:1': 'src/lib/native-lessons/if1.ts' };

const FIGURES = {
  'investing-fundamentals:1': (lesson, mod) => {
    const pct = mod.CPI_12M.pct;
    const later = 10 * (1 + pct / 100);
    const real = new Set([`${String(pct)}%`, '$250,000']); // BLS CPI 12 months; FDIC limit
    const allowed = new Set([...real,
      '$100', '$10', money(later), // the story's bill, its example ticket, the ticket after the real rise
      // 10 tickets at that later price (screen 2's Aug 2026 caption): why the same $100 now buys only 9.
      // It is the same string as challenge 1's wrong option below, and is listed for its own reason.
      money(10 * Number(later.toFixed(2))),
      '$120', '$80', '$0', // Sunny Juice piece after a good / bad year (tiles 12/10 and 8/10), and the floor
      '$5', '$105', '5%', // 5% of $100: the return card, the bond's extra, the flat-growth line
      '$50', '$200', // Leo's amounts in practice
      money(100 - pct), money(100 + pct), // challenge 1's two wrong options, never shown as true
    ]);
    for (const spec of interactives(lesson).filter((s) => s.kind === 'ledger')) {
      const m = ledgerMath(spec);
      for (let n = 0; n <= spec.workedYears + 1; n += 1) allowed.add(money(m.total(n)));
      for (let n = 1; n <= spec.workedYears + 1; n += 1) allowed.add(money(m.gain(n)));
      allowed.add(money(m.total(spec.jump.year)));
      allowed.add(`$${String(m.simple(spec.jump.year))}`);
    }
    return { real, allowed };
  },
};

/** Everything checkable from the lesson data alone. Pure: the selftest feeds it broken copies. */
function checkLessonData(lesson, ctx) {
  const P = [];
  const at = (where, msg) => P.push(`${where}: ${msg}`);
  const over = (where, text, max) => { if (String(text ?? '').length > max) at(where, `${String(text).length} chars > ${String(max)}: "${String(text)}"`); };
  const inside = (p) => p && p.x >= 0 && p.x <= W80 && p.y >= 0 && p.y <= H60;
  /** One screen's worth of words: at most 25 in the title and caption, and no figure twice. */
  const view = (where, read, also = []) => {
    const n = wordCount(read.join(' '));
    if (n > MAX.words) at(where, `${String(n)} words in title and caption, over ${String(MAX.words)}`);
    const seen = new Set();
    for (const f of [...read, ...also].flatMap(figs)) { if (seen.has(f)) at(where, `says ${f} twice on one view`); seen.add(f); }
  };
  const steps = lesson.steps;
  const types = steps.map((s) => s.type);

  // ── Shape
  const vocabSteps = steps.filter((s) => s.type === 'keyTermsCards');
  if (vocabSteps.length !== 1) at('shape', `needs exactly 1 keyTermsCards for the three parts, has ${String(vocabSteps.length)}`);
  if (vocabSteps[0] && vocabSteps[0].terms.length < 3) at('shape', 'the vocab step needs 3 or more terms');
  const challenged = hasMasteryChallenge(lesson.challenge);
  if (!challenged) at('shape', `the challenge needs 4 or more questions, has ${String(lesson.challenge?.length ?? 0)}`);
  const segs = segmentsOf(types, challenged);
  if (segs.map((s) => s.kind).join(',') !== 'learn,vocab,practice') at('shape', `parts are ${segs.map((s) => s.kind).join(',')}, want learn,vocab,practice`);
  const practice = segs.find((s) => s.kind === 'practice');
  if (practice && expandSteps(steps.slice(practice.first - 1)).length > ctx.cap) at('shape', `practice runs over ${String(ctx.cap)} screens`);
  if (expandSteps(steps).length !== steps.length) at('shape', 'a step expands into several screens; progress, resume and DONE count steps');
  if (lesson.xp !== ctx.rawXp) at('shape', `xp ${String(lesson.xp)} differs from the source lesson's ${String(ctx.rawXp)}`);
  steps.forEach((s, i) => {
    if (FORBIDDEN_TYPES.has(s.type)) at(`step ${String(i + 1)}`, `${s.type} is not allowed in a native lesson`);
    else if (s.type !== 'mobileDeck' && normalizeStep(s)?.kind === 'todo') at(`step ${String(i + 1)}`, `${s.type} has no renderer`);
  });

  // ── Copy rules on every learner-facing string
  const strings = [];
  const walk = (v, path) => {
    if (typeof v === 'string') strings.push([path, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${String(i)}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!NOT_COPY.has(k)) walk(x, `${path}.${k}`);
  };
  walk(steps, 'steps');
  walk(lesson.challenge, 'challenge');
  for (const [path, t] of strings) {
    if (/[–—]/.test(t)) at(path, `has an em or en dash: "${t}"`);
    if (ADVICE.test(t)) at(path, `advice word (CONSTITUTION 3.3): "${t}"`);
    if (JARGON.test(t)) at(path, `unexplained jargon: "${t}"`);
    for (const f of figs(t)) if (!ctx.figures.allowed.has(f)) at(path, `${f} is not on this lesson's figure allowlist (CONSTITUTION 3.1)`);
  }

  // ── Questions
  const question = (where, q, explanations) => {
    over(`${where} question`, q.question, MAX.prompt);
    (q.options ?? []).forEach((o, j) => over(`${where} option ${String(j + 1)}`, o, MAX.option));
    if (!(q.correct >= 0 && q.correct < (q.options?.length ?? 0))) at(where, 'correct index is out of range');
    const L = (q.options ?? []).map((o) => o.length);
    const max = Math.max(...L);
    if (L[q.correct] === max && L.filter((x) => x === max).length === 1) at(where, 'the correct option is the unique longest');
    for (const e of explanations) { if (!String(e ?? '').trim()) at(where, 'missing explanation'); over(`${where} explanation`, e, MAX.explanation); }
  };
  steps.forEach((s, i) => {
    const where = `step ${String(i + 1)} (${s.type})`;
    if (s.type === 'quiz') question(where, s, [s.explanation]);
    if (s.type === 'microCheck') question(where, s, [s.explanationCorrect, s.explanationWrong]);
    if ((s.type === 'quiz' || s.type === 'microCheck') && s.explainWhenRight !== true) at(where, 'does not set explainWhenRight, so a right answer never shows its reason');
    if (s.type === 'trueFalse') {
      s.statements.forEach((t, j) => { over(`${where} ${String(j + 1)}`, t.s, MAX.prompt); if (!t.explanation) at(where, `statement ${String(j + 1)} has no reason`); over(`${where} ${String(j + 1)} reason`, t.explanation, MAX.explanation); });
      const yes = s.statements.filter((t) => t.a).length;
      if (s.statements.length % 2 === 0 && yes * 2 !== s.statements.length) at(where, `${String(yes)} of ${String(s.statements.length)} are true; balance them`);
    }
    if (s.type === 'keyTermsCards') {
      const termWords = s.terms.flatMap((t) => t.term.toLowerCase().split(/\s+/));
      for (const t of s.terms) {
        over(`${where} ${t.term}`, t.definition, MAX.definition);
        over(`${where} ${t.term} example`, t.example, MAX.example);
        for (const w of termWords) if (new RegExp(`\\b${w}`, 'i').test(t.definition)) at(`${where} ${t.term}`, `definition contains the term word "${w}", so the vocab quiz is a keyword match`);
        if (t.ask !== undefined) {
          over(`${where} ${t.term} ask`, t.ask, MAX.prompt);
          for (const w of termWords) if (new RegExp(`\\b${w}`, 'i').test(t.ask)) at(`${where} ${t.term}`, `ask contains the term word "${w}", so the vocab quiz is a keyword match`);
        }
      }
    }
  });
  lesson.challenge.forEach((q, i) => question(`challenge ${String(i + 1)}`, q, [q.explanation]));

  // ── Story and toggle cues
  const cues = (where, cast, caption) => {
    for (const c of cast ?? []) {
      if (c.at && !inside(c.at)) at(where, `${c.actor} rests outside the 80 x 60 frame (${String(c.at.x)}, ${String(c.at.y)})`);
      if (!c.at && c.do !== 'ghost' && c.do !== 'exit') at(where, `${c.actor} ${c.do} has no resting point`);
      const numbered = (c.do === 'count' && !c.instant) || (c.do === 'ghost' && c.index != null);
      if (numbered && !c.derivedFrom) at(where, `${c.actor} ${c.do} needs derivedFrom, the caption words its number comes from`);
      if (!c.derivedFrom) continue;
      if (!caption.includes(c.derivedFrom)) at(where, `derivedFrom "${c.derivedFrom}" is not in the caption`);
      const counted = (cast ?? []).find((x) => x.actor === c.actor && x.do === 'count');
      const ghosts = (cast ?? []).filter((x) => x.actor === c.actor && x.do === 'ghost').length;
      const shows = c.do === 'count' ? c.n : counted ? counted.n - ghosts : null;
      const says = Number((c.derivedFrom.match(/\d+/) ?? [NaN])[0]);
      if (shows != null && says !== shows) at(where, `derivedFrom says ${String(says)} but the picture shows ${String(shows)}`);
    }
  };
  const labels = (where, list) => {
    if ((list ?? []).length > 4) at(where, 'more than 4 labels');
    for (const l of list ?? []) { over(`${where} label`, l.text, MAX.label); if (!inside(l.at)) at(where, `label "${l.text}" sits outside the frame`); }
  };

  // ── Decks and cards
  const [course, num] = lesson.key.split(':');
  const idPattern = new RegExp(`^native:${course}:${num}:s\\d+$`);
  const ids = new Set();
  steps.forEach((deck, i) => {
    if (deck.type !== 'mobileDeck') return;
    const where = `step ${String(i + 1)} deck "${deck.label}"`;
    if (deck.sourceType !== 'native') at(where, `sourceType ${String(deck.sourceType)}, want native`);
    if (!idPattern.test(deck.sourceId) || ids.has(deck.sourceId)) at(where, `sourceId ${deck.sourceId} must be a unique native:${lesson.key}:s<n>`);
    ids.add(deck.sourceId);
    over(`${where} title`, deck.title, CARD_BUDGET.title);
    const cards = deck.cards ?? [];
    if (cards.length < 1 || cards.length > DECK_MAX_CARDS) at(where, `${String(cards.length)} cards`);
    if (cards.length === 1 && cards[0].spec?.kind !== 'story') at(where, 'a one-card deck is allowed only for a story');
    if (cards.filter((c) => c.kind === 'interactive').length > 1) at(where, 'more than one interactive');
    const tk = cards.findIndex((c) => c.kind === 'takeaway');
    if (tk >= 0 && tk !== cards.length - 1) at(where, 'the takeaway is not last');
    const texts = new Set();
    const pictures = new Set();
    cards.forEach((card, j) => {
      const cw = `${where} card ${String(j + 1)} (${card.kind})`;
      const text = [card.title, card.term, card.body, card.plain, card.spec?.title].filter(Boolean).join(' ');
      if (!text.trim()) at(cw, 'is empty');
      if (texts.has(text)) at(cw, 'repeats another card'); texts.add(text);
      const sc = card.scene;
      if (sc) {
        if (!isArchetype(sc.archetype)) at(cw, `archetype ${sc.archetype} is not in ARCHETYPES`);
        if (sc.accent !== 'green') at(cw, `accent ${String(sc.accent)}; native lessons use green`);
        for (const p of [`a:${sc.archetype}`, sc.story && `s:${sc.story.artKey}/${sc.story.still}`].filter(Boolean)) { if (pictures.has(p)) at(cw, `repeats the picture ${p}`); pictures.add(p); }
      }
      if (card.kind === 'idea') { over(`${cw} title`, card.title, CARD_BUDGET.title); over(`${cw} body`, card.body, CARD_BUDGET.body); view(cw, [card.title, card.body]); }
      if (card.kind === 'term') { over(`${cw} plain`, card.plain, CARD_BUDGET.plain); view(cw, [card.term, card.plain]); }
      if (card.kind === 'takeaway') { over(`${cw} body`, card.body, CARD_BUDGET.takeaway); view(cw, [card.body]); }
      if (card.kind !== 'interactive') return;
      const spec = card.spec;
      if (!NATIVE_KINDS.has(spec.kind)) { at(cw, `${spec.kind} is not a native-lesson card; extend this pin before using it`); return; }
      over(`${cw} title`, spec.title, CARD_BUDGET.title);
      if (spec.kind === 'story') {
        if (!/\bExample\b/.test(spec.tag ?? '')) at(cw, 'a made-up story needs its Example tag (CONSTITUTION 3.1)');
        over(`${cw} tag`, spec.tag, MAX.label);
        if (spec.beats.length < 3 || spec.beats.length > 6) at(cw, `${String(spec.beats.length)} beats, want 3 to 6`);
        spec.beats.forEach((b, k) => {
          const bw = `${cw} beat ${String(k + 1)}`;
          over(bw, b.caption, MAX.storyCaption); over(`${bw} a11y`, b.a11y, MAX.a11y);
          if (!String(b.a11y ?? '').trim()) at(bw, 'has no VoiceOver line');
          view(bw, [spec.title, b.caption], (b.labels ?? []).map((l) => l.text));
          labels(bw, b.labels); cues(bw, b.cast, b.caption);
        });
      }
      if (spec.kind === 'toggle') {
        over(`${cw} footer`, spec.footer, MAX.footer);
        if (spec.states.length < 2 || spec.states.length > 3) at(cw, `${String(spec.states.length)} states, want 2 or 3`);
        if (new Set(spec.states.map((s) => s.chip)).size !== spec.states.length) at(cw, 'two chips share a label');
        const shown = spec.states.flatMap((s) => [s.caption, ...(s.labels ?? []).map((l) => l.text)]).flatMap(figs);
        if (shown.some((f) => !ctx.figures.real.has(f)) && !/\bExample\b/.test(spec.footer)) at(cw, 'shows a made-up figure but the footer does not say Example (CONSTITUTION 3.1)');
        const base = spec.strip && Number((figs((spec.states[0].labels ?? []).map((l) => l.text).join(' ')).find((f) => f.startsWith('$')) ?? '').slice(1));
        spec.states.forEach((s, k) => {
          const sw = `${cw} state "${s.chip}"`;
          over(`${sw} chip`, s.chip, MAX.chip); over(sw, s.caption, MAX.toggleCaption); over(`${sw} a11y`, s.a11y, MAX.a11y);
          view(sw, [spec.title, s.caption], [spec.footer, ...(s.labels ?? []).map((l) => l.text)]);
          labels(sw, s.labels); cues(sw, s.cast, s.caption);
          if (!s.strip) return;
          if (!spec.strip) { at(sw, 'sets strip heights but the card has no strip'); return; }
          for (const h of [s.strip.h, s.strip.ghostUp, s.strip.ghostDown].filter((x) => x != null)) if (!Number.isInteger(h) || h <= 0) at(sw, `strip height ${String(h)} is not a whole pixel`);
          if (k === 0 && s.strip.h !== spec.strip.restH) at(sw, 'the first state must show the strip at rest');
          const fig = figs((s.labels ?? []).map((l) => l.text).join(' ')).find((f) => f.startsWith('$'));
          if (fig && base && s.strip.h * base !== spec.strip.restH * Number(fig.slice(1))) at(sw, `strip height ${String(s.strip.h)}/${String(spec.strip.restH)} does not match ${fig} against $${String(base)}`);
        });
      }
      if (spec.kind === 'ledger') {
        if (!/\bExample\b/.test(spec.tag ?? '')) at(cw, 'made-up growth needs its Example tag (CONSTITUTION 3.1)');
        over(`${cw} tag`, spec.tag, MAX.label);
        const m = ledgerMath(spec);
        const said = [spec.captions.start, ...spec.captions.years, spec.ask.prompt, spec.ask.right, ...spec.ask.wrong, spec.jump.caption];
        said.forEach((t) => { over(`${cw} caption`, t, MAX.ledgerCaption); view(cw, [spec.title, t]); });
        [spec.buttons.next, spec.buttons.jump, spec.jump.tick].forEach((t) => over(`${cw} button`, t, MAX.button));
        if (spec.captions.years.length !== spec.workedYears) at(cw, 'one caption per worked year');
        const ok = new Set(Array.from({ length: spec.workedYears + 2 }, (_, n) => [m.total(n), n ? m.gain(n) : 0]).flat().concat([m.total(spec.jump.year), m.simple(spec.jump.year), spec.start * spec.ratePercent / 100]).map((x) => Math.round(x * 100)));
        for (const f of [...said, ...spec.ask.options].flatMap(figs)) {
          if (f.endsWith('%') ? Number(f.slice(0, -1)) !== spec.ratePercent : !ok.has(cents(f))) at(cw, `${f} is not a computed gain, total or rate`);
        }
        spec.captions.years.forEach((t, k) => { if (!figs(t).some((f) => cents(f) === Math.round(m.gain(k + 1) * 100))) at(cw, `year ${String(k + 1)}'s caption does not state its gain ${money(m.gain(k + 1))}`); });
        const next = Math.round(m.gain(spec.workedYears + 1) * 100);
        const earlier = new Set(Array.from({ length: spec.workedYears }, (_, k) => Math.round(m.gain(k + 1) * 100)));
        const opts = spec.ask.options.map(cents);
        if (opts.filter((c) => c === next).length !== 1 || opts.some((c) => c !== next && !earlier.has(c))) at(cw, `ask options must be year ${String(spec.workedYears + 1)}'s gain once plus earlier years' gains`);
        if (spec.ask.wrong.length !== spec.ask.options.length - 1) at(cw, 'one wrong line per wrong option');
        if (!figs(spec.ask.right).some((f) => cents(f) === next)) at(cw, 'the right line does not state the answer');
        if (cents(spec.jump.tick) !== Math.round(m.simple(spec.jump.year) * 100)) at(cw, `tick ${spec.jump.tick} is not the flat-growth total ${money(m.simple(spec.jump.year))}`);
      }
    });
  });
  for (const extra of ctx.extra ?? []) extra(lesson, at);
  return P;
}

/* Lesson-specific truths the generic checks cannot know. */
const EXTRA = {
  'investing-fundamentals:1': (mod) => [(lesson, at) => {
    const { pct, from, to } = mod.CPI_12M;
    const tickets = interactives(lesson).find((s) => s.kind === 'toggle' && s.states[0]?.chip === from);
    const label = tickets?.states[1]?.labels?.find((l) => l.id === 'board')?.text;
    const later = 10 * (1 + pct / 100);
    if (tickets?.states[1]?.chip !== to || label !== `${money(later)} each`) at('CPI', `the ${to} ticket label must be ${money(later)} each, derived from CPI_12M`);
    if (Math.floor(100 / later) !== 9) at('CPI', `at ${String(pct)}% the bill buys ${String(Math.floor(100 / later))} tickets, but the lesson says 9`);
    if (!tickets?.states[1]?.caption.includes(`${String(pct)}%`)) at('CPI', 'the second state must name the real rise');
    const c1 = lesson.challenge[0];
    if (!c1.question.includes(`${String(pct)}%`) || !c1.question.includes(from) || !c1.question.includes(to)) at('CPI', 'challenge 1 must state the real rise and its dates');
    for (const v of [money(100 - pct), money(100 + pct)]) if (!c1.options.some((o) => o.includes(v))) at('CPI', `challenge 1 is missing the wrong option ${v}`);
  }],
};

async function contextFor(lesson) {
  const [course, num] = lesson.key.split(':');
  const raw = (await R.loadCourseLessons(course)).find((l) => l.num === Number(num));
  if (!FIGURES[lesson.key] || !MODULE_OF[lesson.key]) throw new Error(`${lesson.key} has no figure allowlist in native-lesson-pin.mjs; every native lesson must declare its figures`);
  const mod = await imported(MODULE_OF[lesson.key]);
  return { rawXp: raw?.xp, cap: W.PRACTICE_SCREEN_CAP, figures: FIGURES[lesson.key](lesson, mod), extra: EXTRA[lesson.key]?.(mod) ?? [] };
}

/* The card modules, the story art, and the dispatch lines the lesson cannot render without. */
async function checkRendering(lesson) {
  const P = [];
  const decks = lesson.steps.filter((s) => s.type === 'mobileDeck');
  // The art first: each part's check takes it, so frame, actor and motion checks run against real sprites.
  const artPath = 'src/lib/pixel/stories/index.ts';
  const stories = existsSync(join(ROOT, artPath)) ? await imported(artPath) : null;
  if (!stories) P.push(`${artPath} is missing: the story art for ${lesson.key} cannot load`);
  const arts = new Map();
  const artKeys = new Set([...interactives(lesson).map((s) => s.artKey), ...decks.flatMap((d) => d.cards.map((c) => c.scene?.story?.artKey))].filter(Boolean));
  for (const key of stories ? artKeys : []) {
    const art = await stories.loadStoryArt(key);
    if (!art) { P.push(`story art "${key}" did not load`); continue; }
    arts.set(key, art);
    for (const spec of interactives(lesson).filter((s) => s.artKey === key)) {
      for (const unit of spec.beats ?? spec.states ?? []) {
        if (!art.frames?.[unit.frame]) P.push(`${spec.title}: frame "${unit.frame}" is not in the ${key} art`);
        for (const c of unit.cast ?? []) for (const id of [c.actor, c.ghostSprite].filter(Boolean)) if (!art.actors?.[id]) P.push(`${spec.title}: actor "${id}" is not in the ${key} art`);
      }
    }
    for (const c of decks.flatMap((d) => d.cards)) if (c.scene?.story?.artKey === key && !art.stills?.[c.scene.story.still]) P.push(`still "${c.scene.story.still}" is not in the ${key} art`);
  }
  const parts = {};
  for (const [kind, rel, fn] of [['story', 'src/lib/mobile-lesson/parts/story.ts', 'checkStory'], ['toggle', 'src/lib/mobile-lesson/parts/toggle.ts', 'checkToggle'], ['ledger', 'src/lib/mobile-lesson/parts/ledger.ts', 'checkLedger']]) {
    if (!existsSync(join(ROOT, rel))) { P.push(`${rel} is missing: the ${kind} cards in ${lesson.key} cannot render`); continue; }
    parts[kind] = await imported(rel);
    if (typeof parts[kind][fn] !== 'function') P.push(`${rel} does not export ${fn}`);
  }
  for (const spec of interactives(lesson)) {
    const fn = { story: parts.story?.checkStory, toggle: parts.toggle?.checkToggle, ledger: parts.ledger?.checkLedger }[spec.kind];
    if (typeof fn !== 'function') continue;
    let out;
    try { out = fn(spec, arts.get(spec.artKey) ?? null); } catch (e) { out = [String(e?.message ?? e)]; }
    const list = Array.isArray(out) ? out : Array.isArray(out?.problems) ? out.problems : out === false ? ['returned false'] : typeof out === 'string' && out ? [out] : [];
    for (const p of list) P.push(`${spec.kind} "${spec.title}": ${String(p)}`);
  }
  for (const spec of interactives(lesson).filter((s) => s.kind === 'ledger')) {
    if (typeof parts.ledger?.ledgerRows !== 'function') continue;
    const m = ledgerMath(spec);
    parts.ledger.ledgerRows(spec.start, spec.ratePercent, spec.workedYears + 1).forEach((row) => {
      if (Math.abs(row.total - spec.start * (1 + spec.ratePercent / 100) ** row.year) > 1e-6 || Math.abs(m.gain(row.year) - Math.round(row.gain * 100) / 100) > 1e-9) P.push(`ledgerRows disagrees with this pin at year ${String(row.year)}`);
    });
  }
  P.push(...dispatchProblems(new Set(interactives(lesson).map((s) => s.kind)), readFileSync(join(ROOT, 'src/components/mobile-lesson/deck-interactives.tsx'), 'utf8'), readFileSync(join(ROOT, 'src/components/mobile-lesson/card-deck.tsx'), 'utf8')));
  return P;
}

/* Without a dispatch line the card renders null and CardDeck keeps Got it locked forever. */
function dispatchProblems(kinds, deckInteractives, cardDeck) {
  const P = [];
  for (const k of kinds) {
    if (!deckInteractives.includes(`spec.kind === '${k}'`)) P.push(`deck-interactives.tsx has no dispatch line for '${k}': the card renders nothing and Got it never unlocks`);
    if (!cardDeck.includes(`k === '${k}'`)) P.push(`card-deck.tsx cardDrawsAtlas has no line for '${k}': the floating Atlas would cover its stage`);
  }
  return P;
}

/* The override, end to end through the real wrapped loader. */
async function checkOverride(key) {
  const P = [];
  const [course, numText] = key.split(':');
  const num = Number(numText);
  const raw = await R.loadCourseLessons(course);
  const status = await N.nativeLessonStatus(key, raw);
  if (status.state !== 'active') {
    P.push(`${key} is ${status.state}: ${status.reason} (wanted ${status.wanted}, actual ${String(status.actual)}). The app is showing the SYNCED lesson. Re-review the rewrite against the changed web lesson, then update source.fingerprint (run with --print-fingerprint).`);
    return { P, native: null };
  }
  const native = await N.loadNativeLesson(key);
  const before = W.deckDerivationCount();
  const wrapped = await W.getMobileLesson(course, num);
  if (JSON.stringify(wrapped?.steps) !== JSON.stringify(native.steps)) P.push(`${key}: the wrapped loader does not return the native steps`);
  if (JSON.stringify(wrapped?.challenge) !== JSON.stringify(native.challenge)) P.push(`${key}: the wrapped loader does not return the native challenge`);
  if (W.deckDerivationCount() !== before) P.push(`${key}: reading the native lesson derived a deck`);
  // Negative control: the same loader, fed a source that changed, must fall back to the synced lesson.
  const edited = raw.map((l) => (l.num === num ? { ...l, title: `${l.title} (edited on web)` } : l));
  const natives = await N.resolveNativeLessons(course, edited);
  const fallback = W.withMobileDecks(edited, course, natives).find((l) => l.num === num);
  if (natives.has(num) || fallback.steps.some((s) => s.sourceType === 'native')) P.push(`${key}: a changed source lesson still renders the native rewrite`);
  if (N.nativeLessonStatusOf(key, { ...native, source: { ...native.source, fingerprint: '00000000' } }, raw).state !== 'stale') P.push(`${key}: a wrong fingerprint is not reported stale`);
  return { P, native };
}

async function selftest() {
  const key = 'investing-fundamentals:1';
  const native = await N.loadNativeLesson(key);
  const ctx = await contextFor(native);
  const clean = checkLessonData(native, ctx);
  if (clean.length) { console.error('native-lesson-pin --selftest: the real lesson is not clean, so mutations prove nothing:\n  ' + clean.join('\n  ')); process.exit(1); }
  const spec = (l, kind, i = 0) => interactives(l).filter((s) => s.kind === kind)[i];
  const step = (l, type, i = 0) => l.steps.filter((s) => s.type === type)[i];
  const cases = [
    ['an em dash', /dash/, (l) => { spec(l, 'story').beats[0].caption += ' — later'; }],
    ['a figure twice in one view', /twice/, (l) => { spec(l, 'toggle').states[0].caption = 'Her $100 buys 10 tickets.'; }],
    ['the correct option the unique longest', /unique longest/, (l) => { step(l, 'microCheck').options[0] = 'Prices went up a lot over the whole year, but her bill stayed the same'; }],
    ['an unlisted figure', /allowlist/, (l) => { step(l, 'quiz').question = step(l, 'quiz').question.replace('$50', '$37'); }],
    ['a definition giving its term away', /term word/, (l) => { step(l, 'keyTermsCards').terms[3].definition = 'The return you get back.'; }],
    ['a one-card deck that is not a story', /one-card/, (l) => { step(l, 'mobileDeck', 1).cards.splice(0, 1); }],
    ['an over-budget caption', /chars >/, (l) => { const b = spec(l, 'story').beats[0]; b.caption = `${b.caption} ${b.caption}`; }],
    ['a missing vocab step', /keyTermsCards/, (l) => { l.steps = l.steps.filter((s) => s.type !== 'keyTermsCards'); }],
    ['a wrong flat-growth tick', /tick/, (l) => { spec(l, 'ledger').jump.tick = '$300'; }],
    ['a count that disagrees with its caption', /derivedFrom says/, (l) => { spec(l, 'story').beats[1].cast.find((c) => c.do === 'count').n = 9; }],
    ['strip heights that disagree with the label', /strip height/, (l) => { spec(l, 'toggle', 1).states[1].strip.h = 13; }],
    ['a made-up figure with no Example footer', /Example/, (l) => { spec(l, 'toggle', 1).footer = 'Company and prices.'; }],
    ['an advice word', /advice/, (l) => { step(l, 'mobileDeck', 5).cards.at(-1).body = 'You should invest it.'; }],
    ['a wrong ledger answer option', /ask options/, (l) => { spec(l, 'ledger').ask.options[2] = '$5.80'; }],
    ['an xp that differs from the source', /xp/, (l) => { l.xp = 35; }],
    ['a derived-style sourceId', /sourceId/, (l) => { step(l, 'mobileDeck').sourceId = 'investing-fundamentals:1:0:abcd1234'; }],
    ['a ticket label not derived from CPI_12M', /CPI/, (l) => { spec(l, 'toggle').states[1].labels[1].text = '$10.40 each'; }],
    ['a quiz whose right answer explains nothing', /explainWhenRight/, (l) => { delete step(l, 'quiz').explainWhenRight; }],
    ['a vocab ask that names its term', /ask contains the term word/, (l) => { step(l, 'keyTermsCards').terms[1].ask = 'Which word fits? Ana bought a stock.'; }],
  ];
  let quiet = 0;
  for (const [name, expect, mutate] of cases) {
    const copy = structuredClone(native);
    mutate(copy);
    const found = checkLessonData(copy, ctx);
    if (!found.some((p) => expect.test(p))) { quiet += 1; console.error(`  QUIET on ${name} (got: ${found.join(' | ') || 'nothing'})`); }
  }
  const raw = await R.loadCourseLessons('investing-fundamentals');
  if (N.nativeLessonStatusOf(key, { ...native, source: { ...native.source, fingerprint: 'deadbeef' } }, raw).state !== 'stale') { quiet += 1; console.error('  QUIET on a wrong fingerprint'); }
  if (dispatchProblems(new Set(['story']), "if (spec.kind === 'toggle')", "k === 'story'").length !== 1) { quiet += 1; console.error('  QUIET on a missing dispatch line'); }
  if (quiet) { console.error(`native-lesson-pin --selftest: ${String(quiet)} detector(s) stayed quiet`); process.exit(1); }
  console.log(`native-lesson-pin --selftest: OK, all ${String(cases.length + 2)} detectors fire`);
}

const args = new Set(process.argv.slice(2));
if (args.has('--selftest')) {
  await selftest();
} else if (args.has('--print-fingerprint')) {
  for (const key of N.nativeLessonKeys()) {
    const s = await N.nativeLessonStatus(key, await R.loadCourseLessons(key.split(':')[0]));
    console.log(`${key}  state ${s.state}  wanted ${s.wanted}  actual ${String(s.actual)}  (${s.reason})`);
  }
} else {
  const problems = [];
  for (const key of N.nativeLessonKeys()) {
    const { P, native } = await checkOverride(key);
    problems.push(...P);
    if (!native) continue;
    problems.push(...checkLessonData(native, await contextFor(native)).map((p) => `${key} ${p}`));
    problems.push(...(await checkRendering(native)).map((p) => `${key} ${p}`));
  }
  if (problems.length) {
    console.error(`native-lesson-pin: ${String(problems.length)} problem(s)\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`native-lesson-pin: OK, ${String(N.nativeLessonKeys().length)} native lesson(s) active, overriding, in budget and rendered`);
}
