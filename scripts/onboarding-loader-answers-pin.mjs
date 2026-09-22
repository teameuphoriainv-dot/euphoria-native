/**
 * ONBOARDING LOADER ANSWERS PIN — the path-assembly loader shows the answer that earned each slot.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/onboarding-loader-answers-pin.mjs
 *
 * WHY. The loader lights three course nodes with the learner's OWN answer sprites. That is only
 * honest if every pick knows which answer earned it. Two ways it silently lies:
 *
 *  1. A pick with no `source` has no sprite to show, so the loader would either draw nothing under
 *     a node or fall back to some generic icon, and the "your answers built this" beat becomes
 *     decoration.
 *  2. A pick that CLAIMS a source the learner never gave. `candidates()` defaults a missing goal to
 *     'learn', so tagging those seeds `source: 'goal'` would show a sprite for an answer nobody
 *     tapped. The empty-profile check below exists for that case.
 *
 * THE OPTION LISTS ARE READ OUT OF onboarding.tsx, not retyped here, so a sprite lookup that stops
 * resolving (a renamed key, a dropped icon) fails here instead of rendering an empty socket.
 *
 * Paths are checked against the WRAPPED loader's AVAILABLE_COURSES (src/lib/curriculum/index.ts),
 * which is what the app ships, not the raw course index.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.__DEV__ = false; // onboarding-path.ts runs its own dev assertions at import time

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);
const read = (path) => readFileSync(join(ROOT, path), 'utf8');

const { EMPTY_PROFILE, recommendPathDetailed, pickOption } = await imported('src/lib/onboarding-path.ts');
const { AVAILABLE_COURSES } = await imported('src/lib/curriculum/index.ts');

const onboarding = read('src/app/onboarding.tsx');

/** Pull `{ key, icon }` out of a named Choice[] literal in onboarding.tsx. */
function options(name) {
  const block = onboarding.match(new RegExp(`const ${name}: Choice\\[\\] = \\[([\\s\\S]*?)\\n\\];`));
  assert.ok(block, `${name} not found in onboarding.tsx — was it renamed or removed?`);
  const rows = block[1].split('\n').filter((l) => /key:\s*'/.test(l));
  const out = rows.map((l) => ({ key: /key:\s*'([^']+)'/.exec(l)[1], icon: /icon:\s*\w+/.test(l) ? 'sprite' : undefined }));
  assert.ok(out.length > 0, `${name} has no options`);
  return out;
}

/* The six answer fields a pick can cite, mapped to the list whose sprite the loader draws. */
const LISTS = {
  experience: options('LEVELS'),
  goal: options('GOALS'),
  topics: options('TOPICS'),
  horizon: options('HORIZONS'),
  riskComfort: options('RISK'),
  blockers: options('BLOCKERS'),
};
const keys = (f) => LISTS[f].map((o) => o.key);

/** Did this profile actually answer `field` with `answer`? */
function answered(profile, field, answer) {
  const v = profile[field];
  if (answer === null || answer === undefined) return false; // a null answer is a skip, never an answer
  return Array.isArray(v) ? v.includes(answer) : v === answer;
}

const available = new Set(AVAILABLE_COURSES.map((c) => c.id));
const failures = [];
const bySource = {};
let profiles = 0;
let picks = 0;

/*
 * Every combination of the single-select answers INCLUDING SKIPPED (null), crossed with no chip,
 * each chip alone and every chip, for both multi-selects.
 *
 * WHY SKIPPED IS IN THE CROSS. With only fully-answered profiles and the empty profile, a pad that
 * claimed `source: 'experience'` for a learner who never answered experience passed: the empty
 * profile fills from the 'learn' seed before the tier pad is reached, and answered profiles never
 * reach it either. Partial profiles are the only ones that do, so they are enumerated here.
 *
 * Rules: a pick that cites a source must cite an answer this profile gave, with a sprite. A pick
 * with no source is only allowed when the profile left something unanswered (the skipped-goal seed
 * and the pads); a fully answered profile must source every pick.
 */
const multi = (f) => [[], ...keys(f).map((k) => [k]), keys(f)];
const single = (f) => [null, ...keys(f)];
let skipped = 0;
for (const experience of single('experience'))
  for (const goal of single('goal'))
    for (const riskComfort of single('riskComfort'))
      for (const horizon of single('horizon'))
        for (const topics of multi('topics'))
          for (const blockers of multi('blockers')) {
            const profile = { ...EMPTY_PROFILE, experience, goal, riskComfort, horizon, topics, blockers };
            const complete = experience !== null && goal !== null && riskComfort !== null && horizon !== null;
            profiles++;
            const path = recommendPathDetailed(profile);
            if (path.length !== 3) failures.push(`${JSON.stringify(profile)}: ${path.length} picks, want 3`);
            for (const pick of path) {
              picks++;
              const tag = `${pick.course.id} for ${JSON.stringify({ experience, goal, riskComfort, horizon, topics, blockers })}`;
              if (!available.has(pick.course.id)) failures.push(`${tag}: course not in the wrapped loader's AVAILABLE_COURSES`);
              if (!pick.source) {
                if (pick.answer !== null) failures.push(`${tag}: answer '${pick.answer}' with no source`);
                if (complete) failures.push(`${tag}: no source, so the loader has no answer sprite to light this node with`);
                else skipped++;
                continue;
              }
              bySource[pick.source] = (bySource[pick.source] ?? 0) + 1;
              if (!(pick.source in LISTS)) failures.push(`${tag}: source '${pick.source}' is not an answer field`);
              else if (!answered(profile, pick.source, pick.answer)) failures.push(`${tag}: cites ${pick.source}='${pick.answer}', which this profile never answered`);
              else if (!pickOption(pick, LISTS)?.icon) failures.push(`${tag}: ${pick.source}='${pick.answer}' resolves to no sprite in onboarding.tsx`);
            }
          }

/* A profile that answered nothing must not claim any answer (goal defaults to 'learn' internally). */
for (const pick of recommendPathDetailed(EMPTY_PROFILE)) {
  if (pick.source !== null || pick.answer !== null) {
    failures.push(`empty profile: ${pick.course.id} claims ${pick.source}='${pick.answer}', an answer nobody gave`);
  }
}

/*
 * The loader itself: one sprite per pick, looked up through pickOption (not a second hand-rolled
 * lookup), reduced motion honoured, no spring on the sprite/node geometry, and one announcement.
 */
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const LOADER = 'src/components/onboarding/path-assembly-loader.tsx';
if (!existsSync(join(ROOT, LOADER))) failures.push(`loader: ${LOADER} does not exist`);
const loader = existsSync(join(ROOT, LOADER)) ? strip(read(LOADER)) : '';
if (!/picks\.map\(/.test(loader)) failures.push('loader: does not render one column per pick (no picks.map)');
if (!/<PickColumn[\s\S]*?pick=\{pick\}/.test(loader)) failures.push('loader: picks.map does not hand each pick to its column');
if (!/<PixelSpriteView[\s\S]*?sprite=\{sprite\}/.test(loader)) failures.push('loader: the column does not draw the answer sprite');
if (!/pickOption\(pick, options\)/.test(loader)) failures.push('loader: sprite not resolved through pickOption');
if (!/useReducedMotion\(\)/.test(loader)) failures.push('loader: no useReducedMotion');
if (/withSpring/.test(loader)) failures.push('loader: withSpring on loader geometry (data motion must be monotonic)');
if ((loader.match(/announceForAccessibility\(/g) ?? []).length !== 1) failures.push('loader: expected exactly one announceForAccessibility');
if (/<Atlas[\s/>]/.test(loader)) failures.push('loader: renders <Atlas>; the stage above already does (one mascot per screen)');
if (/#[0-9A-Fa-f]{3,8}\b/.test(loader)) failures.push('loader: hex literal; colour must come from the theme or courseAccent');

if (failures.length) {
  console.error(`[onboarding-loader-answers-pin] FAIL — ${failures.length} problem(s):`);
  for (const f of failures.slice(0, 20)) console.error('  ' + f);
  if (failures.length > 20) console.error(`  … and ${failures.length - 20} more`);
  process.exit(1);
}
console.log(
  `[onboarding-loader-answers-pin] ok — ${profiles} profiles (skipped answers included), ${picks} picks, every sourced one cites an answer ` +
    `the learner gave and resolves to a sprite; ${skipped} unsourced picks, all on profiles with a skipped answer (${Object.entries(bySource).map(([k, v]) => `${k} ${v}`).join(', ')})`,
);
