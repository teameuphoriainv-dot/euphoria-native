// Extract the CORRECT ANSWER for every interactive lesson step.
//
// WHY THIS EXISTS. The lesson driver cannot advance past an interactive step by poking at it:
// `Continue` is gated on `onSolvedChange(true)`, so the driver must answer CORRECTLY, not merely
// interact. Guessing does not scale to 300 lessons, and a driver that silently fails to advance
// looks exactly like a driver that finished.
//
// The answers already exist in the curriculum source, so they are read rather than guessed.
//
// HOW, and why not a regex. The course files are ~5.6k lines of nested literals; a regex over
// that is the kind of thing that appears to work and quietly drops the hard cases. They are also
// PURE DATA: helper calls plus object literals, importing nothing but types. So the imports are
// stripped, the helpers are supplied as plain constructors, and the module is EVALUATED. That
// gives the real structure instead of an approximation of it.
//
// No TS runtime is installed (no tsx/esbuild/ts-node/swc, all checked), which is why the type
// annotations are stripped textually rather than compiled away.
//
//   node scripts/anim/lesson-answers.mjs [courseFile] [--json]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/lib/curriculum/courses';

/** Every `export const NAME =` in helpers.ts — the authoritative helper list. */
const HELPERS = [...readFileSync('src/lib/curriculum/helpers.ts', 'utf8')
  .matchAll(/^export const ([A-Za-z0-9_]+)\s*=/gm)].map((m) => m[1]);

// Steps whose answer the driver actually needs. Everything else is prose it can tap through.
const H = {
  q:  (question, options, correct) => ({ kind: 'quiz', options, correct }),
  // The native renderer grades micro-checks exactly like a single-choice quiz. Keep the
  // authored options/correct index; the generic helper shim discarded both and left the
  // recorder stuck on every microCheck despite all answer data being present in the course.
  microCheck: (_question, options, correct) => ({ kind: 'quiz', options, correct }),
  explorable: (widget, title, _prompt, insight, params, check) => ({
    kind: 'explorable', widget, title, insight, params: params ?? {}, check,
  }),
  fb: (sentence, options, correct) => ({ kind: 'fillBlank', options, correct }),
  vi: (_d, question, options, correct) => ({ kind: 'visual', options, correct }),
  ds: (prompt, items) => ({ kind: 'dragSort', order: items }),
  sl: (question, min, max, correct, unit) => ({ kind: 'slider', question, min, max, correct, unit }),
  tf: (statements) => ({ kind: 'trueFalse', statements: statements.map((s) => ({ text: s.s, a: s.a })) }),
  m:  (title, pairs) => ({ kind: 'match', pairs }),
  tr: (title, cards) => ({ kind: 'tapReveal', count: cards.length }),
  // The Atlas vocabulary conversation generates its own quiz from these cards at render
  // time (`Which term means: <definition>`), so the beats are not authored steps and the
  // option matcher could never see them. Keep term + every reading-level definition.
  // A teaching slide's highlighted terms render as inline popover buttons. iOS surfaces a
  // nested <Text> link by its TEXT CONTENT and discards the child's accessibilityLabel, so
  // the authored `, tap for definition` suffix never reaches the tree -- the driver has to
  // match the authored term itself.
  teachingSlide: (_sectionLabel, _title, _paragraphs, terms) => ({
    kind: 'teachingSlide',
    terms: (terms || []).map((t) => t?.term).filter(Boolean),
  }),
  keyTermsCards: (cards) => ({
    kind: 'vocabTerms',
    terms: (cards || []).map((card) => ({
      term: card.term,
      definitions: typeof card.definition === 'string'
        ? [card.definition]
        : Object.values(card.definition || {}).filter((d) => typeof d === 'string'),
    })),
  }),
  sc: (_situation, choices) => ({
    kind: 'scenario',
    options: choices.map((choice) => choice.label),
    correct: choices.findIndex((choice) => choice.correct),
  }),
  calculator: (_title, _formula, blanks) => ({ kind: 'calculator', blanks }),
  decisionTree: (_scenario, decisions) => ({
    kind: 'decisionTree',
    decisions: decisions.map((decision) => ({
      prompt: decision.prompt,
      options: decision.options.map((option) => option.label),
      correct: decision.options.findIndex((option) => option.correct),
    })),
  }),
  bi: (t, i, slots) => ({ kind: 'buildIt', slots: slots.map((s) => ({ options: s.options, correct: s.correct })) }),
  cq: (question, options, correct) => ({ kind: 'challenge', options, correct }),
  L:  (num, title, xp, steps, challenge) => ({ num, title, xp, steps, challenge }),
};

function evalCourse(path) {
  let src = readFileSync(path, 'utf8')
    .replace(/^import[\s\S]*?;$/gm, '')            // drop imports (incl. multiline)
    .replace(/^export\s+default\s+/gm, 'const __default = ')  // `export default` -> a binding
    .replace(/^export\s+/gm, '')                   // no module system in the sandbox
    .replace(/:\s*PathwayLesson\[\]/g, '')         // strip the only type annotations present
    .replace(/:\s*AnimatedVisual/g, '')
    .replace(/\bas\s+const\b/g, '')                // TS assertions are not valid JS
    .replace(/\bas\s+[A-Z][A-Za-z0-9_<>\[\]]*/g, '');
  // Helper names come from helpers.ts's EXPORTS, never from scanning the course text. Scanning
  // matched words inside prose strings -- "in case", "class", "default" -- and emitted
  // `const case = ...`, so all 12 files died on a syntax error that had nothing to do with them.
  // The exporting module is the authority on what a helper is.
  const shims = HELPERS.filter((n) => !(n in H))
    .map((n) => `const ${n} = (...a) => ({ kind: ${JSON.stringify(n)}, _a: a });`).join('\n');
  const decl = Object.keys(H).map((k) => `const ${k} = __H.${k};`).join('\n');
  const exported = (src.match(/const\s+([A-Za-z0-9_]+)\s*=\s*\[/) || [])[1];
  if (!exported) throw new Error(`no lesson array found in ${path}`);
  const fn = new Function('__H', `${shims}\n${decl}\n${src}\nreturn ${exported};`);
  return fn(H);
}

/** An explorable may carry an embedded micro-check as its sixth argument. That check renders as a
 *  real, gating question below the widget, but it lived only on `step.check`, where the driver's
 *  content matcher -- which keys on `step.options` -- could never see it. Every such screen
 *  therefore reported `no-match` and stalled the lesson. Emit the check as its own quiz step so
 *  the existing index-free matcher finds it with no solver changes. */
function expandExplorableChecks(lessons) {
  let added = 0;
  for (const lesson of lessons) {
    const expanded = [];
    for (const step of lesson.steps || []) {
      expanded.push(step);
      const check = step.kind === 'explorable' ? step.check : null;
      if (check && Array.isArray(check.options) && check.correct !== undefined) {
        expanded.push({ kind: 'quiz', question: check.question, options: check.options, correct: check.correct });
        added += 1;
      }
    }
    lesson.steps = expanded;
  }
  return added;
}

function summarise(lessons) {
  const need = new Set(['quiz', 'fillBlank', 'visual', 'dragSort', 'slider', 'trueFalse', 'match',
    'tapReveal', 'scenario', 'buildIt', 'calculator', 'decisionTree']);
  let interactive = 0, answered = 0;
  for (const l of lessons) for (const s of l.steps || []) {
    if (!need.has(s.kind)) continue;
    interactive++;
    if (s.correct !== undefined || s.order || s.answers || s.pairs || s.slots || s.count
        || s.blanks || s.decisions) answered++;
  }
  return { lessons: lessons.length, interactive, answered };
}

const files = process.argv[2] && !process.argv[2].startsWith('--')
  ? [process.argv[2]] : readdirSync(DIR).filter((f) => f.endsWith('.ts')).map((f) => join(DIR, f));
const out = {};
let ok = 0, bad = 0, totalEmbedded = 0;
for (const f of files) {
  const name = f.split('/').pop().replace('.ts', '');
  try {
    const lessons = evalCourse(f);
    const embedded = expandExplorableChecks(lessons);
    totalEmbedded += embedded;
    out[name] = lessons;
    const s = summarise(lessons);
    console.log(`  ok    ${name.padEnd(24)} ${String(s.lessons).padStart(3)} lessons · ${String(s.interactive).padStart(4)} interactive · ${s.answered} answerable`);
    ok++;
  } catch (e) {
    console.log(`  FAIL  ${name.padEnd(24)} ${String(e.message).slice(0, 90)}`);
    bad++;
  }
}
console.log(`\n${ok} parsed, ${bad} failed`);
if (process.argv.includes('--json')) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync('/tmp/lesson-answers.json', JSON.stringify(out));
  console.log('wrote /tmp/lesson-answers.json');
}
