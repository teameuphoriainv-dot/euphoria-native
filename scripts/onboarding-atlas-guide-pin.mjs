#!/usr/bin/env node
// ============================================================================
// ONBOARDING ATLAS GUIDE PIN: Atlas has a line on every onboarding screen, and every line is safe.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/onboarding-atlas-guide-pin.mjs
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/onboarding-atlas-guide-pin.mjs --selftest
//
// WHY THIS EXISTS. Owner decision 2 (2026-09-22) puts one Atlas line on EVERY onboarding screen,
// reacting to the answer before it. Those lines are copy a script can check, and each failure
// below is one that would reach a real phone unnoticed:
//
//   1. A step added to STEPS in src/app/onboarding.tsx without a line: atlasLineFor returns null
//      and that screen goes quiet, which is the exact gap the decision exists to close. Keys are
//      read from the STEPS SOURCE, not from atlas-lines' own list, so the list cannot vouch for
//      itself. `try` (the new Double it screen) and `paywall` are required even before the
//      integration lands.
//   2. A line over ATLAS_LINE_MAX (70) wraps on an SE; the paywall line over COMPACT_LINE_MAX (44)
//      would be cut off by the compact guide's two-line cap.
//   3. An em or en dash (CONSTITUTION 4), a digit (a number in the mascot's mouth is how a
//      fabricated figure gets in, CONSTITUTION 3.1), "you should", the word "buy", or anything the
//      real advice guard (src/lib/server/advice.ts) flags (CONSTITUTION 3.3). The riskComfort
//      answer literally is "Buy more", so the reaction to it is where "buy" would slip in.
//   4. A reactive line that says the same thing for different answers, or falls through to its
//      generic line for an answer that exists. Answer values are read from the choice arrays in
//      onboarding.tsx, so a new option added there without a reaction fails here.
//   5. The component: Reduce Motion guarded, no spring on the bubble, no hex colour, never the
//      user's avatar, and the compact variant capped so Dynamic Type cannot grow the paywall.
//   6. horizon reacts to how "Double it" went (owner decision 2026-09-22; the sim showed a fixed
//      "Quick one about timing. Any answer works." after a learner had just solved or been shown
//      the rule of 72). The lib reacting is not enough: onboarding.tsx must FEED it the result
//      (CONSTITUTION 6.2, changing the consumer is not providing the value), so the screen source
//      is checked for the wiring too.
//
// --selftest feeds deliberately broken line functions through the same checks and requires each
// defect to be caught, so the checks are proven able to fail on every run.
// ============================================================================
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);
const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');

const lines = await imported('src/lib/onboarding/atlas-lines.ts');
const { isAdvice } = await imported('src/lib/server/advice.ts');

// ── read the flow from source ──────────────────────────────────────────────────────────────────
const onboarding = strip(read('src/app/onboarding.tsx'));
const stepsBlock = /const STEPS\s*:\s*StepDef\[\]\s*=\s*\[([\s\S]*?)\n\];/.exec(onboarding);
if (!stepsBlock) {
  console.error('FAIL: STEPS not found in src/app/onboarding.tsx; this pin has drifted from the code');
  process.exit(1);
}
/** Same rule as stepKeyOf(): question -> field, statement -> body, anything else -> kind. */
const stepKeysFromSource = stepsBlock[1]
  .split(/\n\s*\{\s*kind:/)
  .slice(1)
  .map((entry) => {
    const kind = /^\s*'([^']+)'/.exec(entry)?.[1];
    const field = /field:\s*'([^']+)'/.exec(entry)?.[1];
    const body = /body:\s*'([^']+)'/.exec(entry)?.[1];
    return lines.stepKeyOf({ kind, field, body });
  });

/** Option keys of a `const NAME: Choice[] = [...]` array in onboarding.tsx. */
const choiceKeys = (name) => {
  const m = new RegExp(`const ${name}\\s*:\\s*Choice\\[\\]\\s*=\\s*\\[([\\s\\S]*?)\\n\\];`).exec(onboarding);
  if (!m) throw new Error(`choice array ${name} not found in onboarding.tsx; this pin has drifted`);
  return [...m[1].matchAll(/key:\s*'([^']+)'/g)].map((x) => x[1]);
};
const ANSWERS = {
  experience: choiceKeys('LEVELS'),
  goal: choiceKeys('GOALS'),
  horizon: choiceKeys('HORIZONS'),
  riskComfort: choiceKeys('RISK'),
  topics: choiceKeys('TOPICS'),
  blockers: choiceKeys('BLOCKERS'),
};

// ── the checks, as a function so --selftest can run them on broken input ───────────────────────
function audit({ atlasLineFor, REACTS_TO, ATLAS_LINE_MAX, COMPACT_LINE_MAX }, requiredKeys) {
  const failures = [];
  const fail = (msg) => failures.push(msg);
  if (REACTS_TO.horizon !== 'tryResult') fail('horizon does not react to the Double it result (REACTS_TO.horizon)');

  const LONG_NAME = 'Maximilianooooooo'; // 17 chars, under NAME_MAX (18), one word
  const values = (field) => {
    if (field === 'name') return ['Sam', LONG_NAME, 'Mary Jane', '   '];
    if (field === 'topics') return [[], ANSWERS.topics.slice(0, 1), ANSWERS.topics.slice(0, 3), ANSWERS.topics];
    if (field === 'blockers') return [...ANSWERS.blockers.map((b) => [b]), ANSWERS.blockers.slice(0, 2)];
    if (field === 'tryResult') return [...lines.TRY_RESULTS];
    return ANSWERS[field];
  };
  const full = {
    name: LONG_NAME, experience: ANSWERS.experience[0], goal: ANSWERS.goal[0], topics: ANSWERS.topics,
    horizon: ANSWERS.horizon[0], riskComfort: ANSWERS.riskComfort[0], blockers: ANSWERS.blockers,
    tryResult: lines.TRY_RESULTS[0],
  };

  const checkLine = (key, text, ctx) => {
    const where = `${key} (${ctx})`;
    if (typeof text !== 'string' || !text.trim()) return fail(`${where}: no line, so Atlas says nothing on this screen`);
    if (text.length > ATLAS_LINE_MAX) fail(`${where}: ${String(text.length)} chars > ${String(ATLAS_LINE_MAX)}: "${text}"`);
    if (key === 'paywall' && text.length > COMPACT_LINE_MAX) {
      fail(`${where}: paywall line is ${String(text.length)} chars > COMPACT_LINE_MAX ${String(COMPACT_LINE_MAX)}; the compact guide would cut it off`);
    }
    if (/[—–]/.test(text)) fail(`${where}: em or en dash in user-facing prose: "${text}"`);
    if (/\d/.test(text)) fail(`${where}: a digit in Atlas's mouth; derive numbers, never type them: "${text}"`);
    if (/you should/i.test(text)) fail(`${where}: "you should" is advice voice: "${text}"`);
    if (/\bbuy/i.test(text)) fail(`${where}: says "buy": "${text}"`);
    if (isAdvice(text)) fail(`${where}: the advice guard flags this line: "${text}"`);
    // The path's CONTENT is decided by recommendPathDetailed (onboarding-path.ts), where riskComfort,
    // topics, blockers and horizon all outrank goal. A line saying what the path "starts with" or is
    // "built around" is a claim that ranking does not keep: "a path that starts with how it all
    // works" was shown to a learn-goal user whose path led with behavioral finance.
    if (/\bpath (that|with|built|full)\b|\bstarts with\b|\bbuilt around\b/i.test(text)) {
      fail(`${where}: describes what the path contains; only recommendPath knows that: "${text}"`);
    }
    // Where a screen sits in STEPS is the integrator's call (owner decision 1 only says `try` comes
    // before the reveal). A line that names its neighbour ("before we build your path") goes false
    // the moment the screen is placed after the loader.
    if (/\bbefore we\b|\bnext screen\b|\bafter this\b/i.test(text)) {
      fail(`${where}: names its position in the flow, which STEPS can change: "${text}"`);
    }
  };

  let checked = 0;
  for (const key of requiredKeys) {
    for (const [ctx, p] of [['empty profile', {}], ['full profile', full]]) {
      checkLine(key, atlasLineFor(key, p), ctx);
      checked++;
    }
    const field = REACTS_TO[key];
    if (!field) continue;
    const generic = atlasLineFor(key, {});
    const seen = new Map();
    for (const v of values(field)) {
      const text = atlasLineFor(key, { [field]: v });
      checkLine(key, text, `${field}=${JSON.stringify(v)}`);
      checked++;
      const blank = field === 'name' ? !String(v).trim() : Array.isArray(v) ? v.length === 0 : false;
      if (!blank && text === generic) {
        fail(`${key}: ${field}=${JSON.stringify(v)} falls through to the generic line, so Atlas ignores that answer`);
      }
      // Two blockers at once get one "heard all of it" line by design, so only single picks must differ.
      const multiBlocker = field === 'blockers' && v.length > 1;
      if (!blank && !multiBlocker) seen.set(JSON.stringify(v), text);
    }
    const distinct = new Set(seen.values());
    if (distinct.size !== seen.size) {
      fail(`${key}: ${String(seen.size)} different ${field} answers produce only ${String(distinct.size)} distinct lines`);
    }
  }
  return { failures, checked };
}

// ── the screen feeds horizon its input ─────────────────────────────────────────────────────────
function auditWiring(src) {
  const code = strip(src);
  const failures = [];
  if (!/atlasLineFor\(\s*stepKeyOf\(def\),\s*\{[^}]*\btryResult\b/.test(code)) {
    failures.push('onboarding.tsx: atlasLineFor is not given tryResult, so horizon always says its generic line');
  }
  if (!/onResolved:[\s\S]{0,200}?setTryResult\(tryResultOf\(/.test(code)) {
    failures.push('onboarding.tsx: tryResult is not set from useDoubleIt onResolved via tryResultOf');
  }
  return failures;
}

// ── component source ───────────────────────────────────────────────────────────────────────────
function auditComponent(src) {
  const failures = [];
  const code = strip(src);
  if (!/useReducedMotion\(\)/.test(code)) failures.push('atlas-guide.tsx: no useReducedMotion guard on the entry animation');
  if (!/if \(reduced\)\s*\{\s*enter\.set\(1\)/.test(code)) failures.push('atlas-guide.tsx: Reduce Motion does not land the bubble at its final state');
  if (/withSpring/.test(code)) failures.push('atlas-guide.tsx: withSpring on the bubble; text arriving is not a reward, overshoot is for Atlas');
  if (/#[0-9a-fA-F]{3,8}\b/.test(code)) failures.push('atlas-guide.tsx: hardcoded hex colour; colour comes from the theme');
  if (/ProfileAvatar|avatarFor|CHARACTER_AVATARS|ALL_AVATARS/.test(code)) failures.push('atlas-guide.tsx: renders an avatar beside Atlas; one mascot per screen');
  const compactText = /<ThemedText[^>]*numberOfLines=\{2\}[^>]*maxFontSizeMultiplier=\{1\.3\}/.exec(code);
  if (!compactText) failures.push('atlas-guide.tsx: compact text is not capped at 2 lines and a 1.3 font multiplier, so Dynamic Type can grow the paywall');
  if (!/height:\s*COMPACT_GUIDE_HEIGHT/.test(code)) failures.push('atlas-guide.tsx: compact row height is not fixed');
  return failures;
}

// ── selftest: every check must be able to fail ─────────────────────────────────────────────────
if (process.argv.includes('--selftest')) {
  const base = { ...lines };
  const broken = [
    ['missing line', (k, p) => (k === 'try' ? null : lines.atlasLineFor(k, p))],
    ['too long', (k, p) => (k === 'goal' ? 'x'.repeat(71) : lines.atlasLineFor(k, p))],
    ['paywall too long for compact', (k, p) => (k === 'paywall' ? 'Your path is ready and here is everything Pro adds.' : lines.atlasLineFor(k, p))],
    ['em dash', (k, p) => (k === 'name' ? 'Hi — I am Atlas.' : lines.atlasLineFor(k, p))],
    ['digit', (k, p) => (k === 'loader' ? 'Most people double their money in 12 years.' : lines.atlasLineFor(k, p))],
    ['buy', (k, p) => (k === 'proof' && p.riskComfort === 'buy' ? 'Buying the dip, nice.' : lines.atlasLineFor(k, p))],
    ['you should', (k, p) => (k === 'blockers' ? 'You should be honest here.' : lines.atlasLineFor(k, p))],
    ['advice', (k, p) => (k === 'avatar' ? 'I recommend you load up on NVDA.' : lines.atlasLineFor(k, p))],
    ['not reactive', (k, p) => (k === 'topics' ? 'Pick as many as you like.' : lines.atlasLineFor(k, p))],
    ['claims path content', (k, p) => (k === 'reveal' && p.goal === 'learn' ? 'Here it is. A path that starts with how it all works.' : lines.atlasLineFor(k, p))],
    ['names its position', (k, p) => (k === 'try' ? 'Your turn. Play with this before we build your path.' : lines.atlasLineFor(k, p))],
    ['two answers one line', (k, p) => (k === 'goal' && p.experience === 'basics' ? lines.atlasLineFor('goal', { experience: 'beginner' }) : lines.atlasLineFor(k, p))],
    ['horizon ignores Double it', (k, p) => (k === 'horizon' ? 'Quick one about timing. Any answer works.' : lines.atlasLineFor(k, p))],
  ];
  let missed = 0;
  for (const [name, fn] of broken) {
    const { failures } = audit({ ...base, atlasLineFor: fn }, lines.ATLAS_STEP_KEYS);
    if (failures.length === 0) { console.error(`SELFTEST MISSED: "${name}" was not caught`); missed++; }
  }
  const good = read('src/components/onboarding/atlas-guide.tsx');
  const compBroken = [
    ['no reduced motion', good.replace(/useReducedMotion\(\)/g, 'false')],
    ['spring', good.replace('withTiming(1,', 'withSpring(1,')],
    ['hex', good.replace('theme.card', "'#ffffff'")],
    ['uncapped', good.replace('maxFontSizeMultiplier={1.3}', '')],
    ['avatar', good.replace('<Atlas\n', '<ProfileAvatar />\n          <Atlas\n')],
  ];
  const ob = read('src/app/onboarding.tsx');
  const obBroken = ob.replace(', tryResult: tryResult ?? undefined }', ' }');
  if (obBroken === ob) { console.error('SELFTEST DRIFT: wiring mutation did not apply to onboarding.tsx'); missed++; }
  else if (auditWiring(obBroken).length === 0) { console.error('SELFTEST MISSED: onboarding.tsx not feeding tryResult was not caught'); missed++; }
  if (auditWiring(ob).length) { console.error('SELFTEST: the real onboarding.tsx fails the wiring check'); missed++; }
  for (const [name, src] of compBroken) {
    if (src === good) { console.error(`SELFTEST DRIFT: mutation "${name}" did not apply to atlas-guide.tsx`); missed++; continue; }
    if (auditComponent(src).length === 0) { console.error(`SELFTEST MISSED: component "${name}" was not caught`); missed++; }
  }
  if (missed) process.exit(1);
  console.log(`PASS (selftest) - ${String(broken.length + compBroken.length + 1)} planted defects, all caught.`);
  process.exit(0);
}

// ── run ────────────────────────────────────────────────────────────────────────────────────────
const failures = [];
const required = [...new Set([...stepKeysFromSource, 'try', 'paywall'])];
for (const k of required) {
  if (!lines.ATLAS_STEP_KEYS.includes(k)) failures.push(`step key "${k}" is in STEPS but not in ATLAS_STEP_KEYS`);
}
const { failures: lineFailures, checked } = audit(lines, required);
failures.push(
  ...lineFailures,
  ...auditComponent(read('src/components/onboarding/atlas-guide.tsx')),
  ...auditWiring(read('src/app/onboarding.tsx')),
);

if (failures.length) {
  console.error(`FAIL - ${String(failures.length)} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
const reactive = required.filter((k) => lines.REACTS_TO[k]).length;
console.log(
  `PASS - ${String(required.length)} step keys (${String(stepKeysFromSource.length)} from STEPS + try/paywall), ` +
    `${String(checked)} lines checked, ${String(reactive)} reactive steps each distinct per answer.`,
);
