#!/usr/bin/env node
// ============================================================================
// LESSON COMPLETE PIN: the done screen is ONE Atlas moment out of the path node, on design M6's
// timeline, with Reduce Motion landing on the end state.
//
//   node scripts/lesson-complete-pin.mjs              all checks, including lesson.tsx wiring
//   node scripts/lesson-complete-pin.mjs --unit-only  component checks only (before integration)
//   node scripts/lesson-complete-pin.mjs --selftest   prove each check can go red
//
// WHY THIS EXISTS. lesson.tsx's done block stacked CelebrationWipe + Confetti + CelebrationRays +
// an Atlas entrance + three RewardPops + a speech bubble. Owner decision 5 replaces all of it with
// src/components/lesson-complete.tsx. Each check is a way that replacement quietly regresses:
//
//   1. TIMELINE. The beats are design M6's numbers, in order. Read by RUNNING the PURE region of the
//      component (types stripped by Node), not by regex, so a reorder or a typo is a number that
//      fails rather than a pattern that happens to still match.
//   2. RING. 8 sparkles, whole points, on the ring, symmetric, none on the vertical axis (one there
//      sits on the beam and one on Atlas's crown).
//   3. ONE MOMENT. The component imports none of the old effect stack, draws exactly one <Atlas>,
//      and uses the path node and the pixel beam.
//   4. MOTION. Exactly one spring, it is Spring.bouncy, and it drives Atlas's rise: overshoot is
//      reserved for the character (AGENTS.md). No withRepeat. No hardcoded hex (design rule 8).
//   5. REDUCED MOTION = END STATE. Every shared value starts at its end value under the setting and
//      is set to it in the `if (reduced)` branch; node and chips derive from `reduced` directly.
//   6. NOTHING LOST. XP, euphorium and streak all reach a NumberRollup; the title is unchanged.
//   7. LIFECYCLE. Every beat timer is cleared on unmount (Continue can be tapped mid-sequence).
//   8. VOICEOVER. The stage is one stop labelled with the lesson title; the sparkles are hidden.
//   9. INTEGRATION. lesson.tsx's DONE block renders <LessonComplete> and none of Confetti,
//      CelebrationRays, CelebrationWipe or RewardPop. Fails until the integrator swaps it in; that is
//      intended, and --unit-only skips only this block.
// ============================================================================
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const COMPONENT = 'src/components/lesson-complete.tsx';
const LESSON = 'src/app/lesson.tsx';
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
// Comments are stripped before any source scan: the component's header NAMES Confetti, RewardPop
// and the rest in order to explain their removal, and must not trip the scan it is explaining.
const strip = (t) => t
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/[^\n]*$/gm, '')
  .replace(/([^:'"`])\/\/[^\n]*$/gm, '$1');

const DESIGN = { node: 0, beam: 400, atlasFrom: 500, atlasTo: 1000, title: 1100, sparkles: 1300, chips: 1700, line: 1900 };
const OLD_STACK = ['Confetti', 'CelebrationRays', 'CelebrationWipe', 'RewardPop'];

async function pure(src) {
  const m = /\/\/ PURE:BEGIN[^\n]*\n([\s\S]*?)\/\/ PURE:END/.exec(src);
  if (!m) throw new Error('PURE:BEGIN/PURE:END region not found');
  const js = stripTypeScriptTypes(m[1].replace(/\}\s+as const;/g, '};'));
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}

async function checkComponent(raw) {
  const f = [];
  const check = (ok, msg) => { if (!ok) f.push(msg); };

  // 1-2. numbers, by running the code
  let mod;
  try { mod = await pure(raw); } catch (e) { return [`pure region did not run: ${e.message}`]; }
  const B = mod.COMPLETE_BEATS ?? {};
  for (const [k, v] of Object.entries(DESIGN)) check(B[k] === v, `COMPLETE_BEATS.${k} is ${String(B[k])}, design M6 says ${String(v)}`);
  const order = Object.keys(DESIGN).map((k) => B[k]);
  check(order.every((v, i) => i === 0 || v > order[i - 1]), `beats are not strictly ascending in design order: ${order.join(', ')}`);
  check(mod.ATLAS_RISE === 32, `ATLAS_RISE is ${String(mod.ATLAS_RISE)}, design M6 says Atlas rises 32pt`);
  const R = 84;
  const ring = typeof mod.sparkleRing === 'function' ? mod.sparkleRing(8, R) : [];
  check(ring.length === 8, `sparkleRing(8) returned ${String(ring.length)} points`);
  check(ring.every((p) => Number.isInteger(p.x) && Number.isInteger(p.y)), 'a sparkle sits on a half point');
  check(ring.every((p) => Math.abs(Math.hypot(p.x, p.y) - R) <= 1), 'a sparkle is off the ring');
  check(new Set(ring.map((p) => `${p.x},${p.y}`)).size === ring.length, 'two sparkles share a position');
  check(ring.every((p) => p.x !== 0), 'a sparkle sits on the vertical axis (on the beam or on Atlas\'s crown)');
  const sx = ring.reduce((a, p) => a + p.x, 0);
  const sy = ring.reduce((a, p) => a + p.y, 0);
  check(Math.abs(sx) <= 2 && Math.abs(sy) <= 2, `the ring is lopsided: centroid ${String(sx)},${String(sy)}`);

  // 3. one moment
  const src = strip(raw);
  for (const name of OLD_STACK) check(!new RegExp(`\\b${name}\\b`).test(src), `lesson-complete.tsx uses ${name}, part of the stack M6 replaces`);
  check(/from '@\/components\/path-node'/.test(src) && /<PathNode\b/.test(src), 'lesson-complete.tsx does not render the lesson\'s PathNode');
  check(/from '@\/components\/pixel-beam'/.test(src) && /<PixelBeam\b/.test(src), 'lesson-complete.tsx does not render the PixelBeam');
  const atlases = (src.match(/<Atlas[\s/>]/g) ?? []).length;
  check(atlases === 1, `lesson-complete.tsx draws <Atlas> ${String(atlases)} times; one mascot per screen`);

  // 4. motion + colour
  const springs = [...src.matchAll(/withSpring\(([^)]*\))/g)].map((m) => m[1]);
  check(springs.length === 1, `expected exactly one withSpring (Atlas's rise), found ${String(springs.length)}`);
  check(springs.every((s) => /Spring\.bouncy/.test(s)), `a spring is not Spring.bouncy: ${springs.join(' | ')}`);
  check(/rise\.set\(\s*withDelay\([^;]*withSpring/.test(src), 'the one spring does not drive Atlas\'s rise');
  check(!/withRepeat/.test(src), 'lesson-complete.tsx loops an animation');
  const hex = src.match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
  check(hex.length === 0, `hardcoded hex in lesson-complete.tsx: ${hex.join(', ')}`);
  for (const k of ['beam', 'atlasFrom', 'title', 'sparkles', 'chips', 'line']) {
    check(new RegExp(`COMPLETE_BEATS\\.${k}\\b`).test(src), `COMPLETE_BEATS.${k} is declared but nothing on screen runs on it`);
  }

  // 5. reduced motion = end state
  check(/useReducedMotion\(\)/.test(src), 'no useReducedMotion in lesson-complete.tsx');
  const shared = [...src.matchAll(/const (\w+) = useSharedValue\(([^)]*)\)/g)];
  check(shared.length >= 4, `expected the rise/atlas/title/ring/chips shared values, found ${String(shared.length)}`);
  const branch = /if \(reduced\) \{([\s\S]*?)return;\s*\}/.exec(src)?.[1] ?? '';
  check(branch.length > 0, 'no `if (reduced) { ... return; }` branch in the choreography effect');
  for (const [, name, init] of shared) {
    const end = /reduced \? ([^:]+) :/.exec(init)?.[1]?.trim();
    check(end !== undefined, `${name} does not start at its end value under Reduce Motion`);
    check(new RegExp(`${name}\\.set\\(${end ?? '__'}\\)`).test(branch), `the reduced branch does not set ${name} to its end value ${String(end)}`);
  }
  check(/nodeState[^=]*=\s*reduced \|\|/.test(src), 'the node is not `done` from the first frame under Reduce Motion');
  check(/chipsLive\s*=\s*reduced \|\|/.test(src), 'the chips are not live from the first frame under Reduce Motion');

  // 6. nothing lost
  for (const v of ['xp', 'coins', 'streakDays']) check(new RegExp(`<NumberRollup value=\\{${v}\\}`).test(src), `${v} no longer reaches a NumberRollup chip`);
  check(/Lesson complete!/.test(src), 'the "Lesson complete!" title is gone');
  check(/<AtlasSpeech\b/.test(src), 'Atlas\'s closing line is gone');

  // 7. lifecycle: every beat timer is cleared on unmount. Without it, tapping Continue inside the
  //    first 1.7s unmounts the screen and the pending setNodeLit/setChipsTimer fire on a dead
  //    component (a React warning today, a state write into the next screen's tree if it is reused).
  const timers = [...src.matchAll(/const (\w+) = setTimeout\(/g)].map((m) => m[1]);
  check(timers.length >= 1, 'no beat timers found; this pin has drifted from the code');
  for (const t of timers) check(new RegExp(`clearTimeout\\(${t}\\)`).test(src), `timer ${t} is never cleared on unmount`);
  check(!/setInterval\(/.test(src), 'lesson-complete.tsx starts an interval');

  // 8. VoiceOver: the stage is one labelled stop that names the lesson, and the sparkles are hidden.
  //    PathNode drops its label when it has no onPress, so without the stage label the lesson's
  //    name is announced nowhere on the screen that celebrates it.
  check(/accessibilityLabel=\{`\$\{lessonTitle\}, complete`\}/.test(src.match(/<View style=\{styles\.stage\}[^>]*>/)?.[0] ?? ''),
    'the stage is not one VoiceOver stop labelled with the lesson title');
  check(/importantForAccessibility="no-hide-descendants"[^>]*>\s*\{points\.map/.test(src), 'the sparkle layer is not hidden from VoiceOver');
  return f;
}

function checkIntegration(lessonRaw) {
  const f = [];
  const src = strip(lessonRaw);
  const start = src.search(/idx === DONE && \(/);
  if (start < 0) return ['lesson.tsx: no `idx === DONE && (` block found; this pin has drifted from the code'];
  const end = src.indexOf('idx === STREAK', start);
  const block = src.slice(start, end < 0 ? undefined : end);
  if (!/<LessonComplete\b/.test(block)) f.push('lesson.tsx DONE block does not render <LessonComplete>');
  for (const name of OLD_STACK) if (new RegExp(`<${name}\\b`).test(block)) f.push(`lesson.tsx DONE block still renders <${name}>`);
  return f;
}

const component = read(COMPONENT);

if (process.argv.includes('--selftest')) {
  // Each mutation is one real regression shape; each must be caught, and the clean file must pass.
  const mutations = {
    'beat moved': (s) => s.replace('beam: 400,', 'beam: 450,'),
    'beats reordered': (s) => s.replace('title: 1100,', 'title: 1800,'),
    'rise changed': (s) => s.replace('ATLAS_RISE = 32', 'ATLAS_RISE = 48'),
    'sparkle on axis': (s) => s.replace('(i + 0.5) / n', 'i / n'),
    'confetti back': (s) => s.replace("import { Atlas }", "import { Confetti } from '@/components/confetti';\nimport { Atlas }"),
    'second Atlas': (s) => s.replace('<Atlas size={ATLAS}', '<Atlas size={40} /><Atlas size={ATLAS}'),
    'chip springs': (s) => s.replace('chipsIn.set(withDelay(COMPLETE_BEATS.chips, withTiming(1, enter)))', 'chipsIn.set(withDelay(COMPLETE_BEATS.chips, withSpring(1, Spring.reward)))'),
    'atlas spring swapped': (s) => s.replace('withSpring(0, Spring.bouncy)', 'withSpring(0, Spring.reward)'),
    'hex literal': (s) => s.replace('color={i % 2 === 0 ? theme.iconGold : accent}', "color={i % 2 === 0 ? '#FFD700' : accent}"),
    'reduced branch drops a value': (s) => s.replace('      ring.set(1);\n', ''),
    'reduced start mid-motion': (s) => s.replace('useSharedValue(reduced ? 0 : ATLAS_RISE)', 'useSharedValue(ATLAS_RISE)'),
    'node not done under reduced': (s) => s.replace("reduced || nodeLit ? 'done'", "nodeLit ? 'done'"),
    'streak chip lost': (s) => s.replace('<NumberRollup value={streakDays}', '<NumberRollup value={0}'),
    'beat unused': (s) => s.replace('COMPLETE_BEATS.sparkles', '1300'),
    'timer not cleared': (s) => s.replace('      clearTimeout(tChips);\n', ''),
    'stage label lost': (s) => s.replace('accessible accessibilityRole="image" accessibilityLabel={`${lessonTitle}, complete`}', 'accessible accessibilityRole="image"'),
    'sparkles exposed': (s) => s.replace('pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">', 'pointerEvents="none">'),
  };
  const bad = [];
  const clean = await checkComponent(component);
  if (clean.length) bad.push(`clean component fails: ${clean.join('; ')}`);
  for (const [name, mutate] of Object.entries(mutations)) {
    const mutated = mutate(component);
    if (mutated === component) { bad.push(`mutation "${name}" no longer applies; update the selftest`); continue; }
    if ((await checkComponent(mutated)).length === 0) bad.push(`mutation "${name}" was NOT caught`);
  }
  const doneOld = 'x {challengeStage === \'none\' && idx === DONE && (<View><Confetti /><Atlas /></View>)} {idx === STREAK}';
  const doneNew = 'x {challengeStage === \'none\' && idx === DONE && (<ScrollView><LessonComplete xp={xp} /></ScrollView>)} {idx === STREAK}';
  if (checkIntegration(doneOld).length === 0) bad.push('integration: an old done block with <Confetti> was NOT caught');
  if (checkIntegration(doneNew).length !== 0) bad.push(`integration: a wired done block fails: ${checkIntegration(doneNew).join('; ')}`);
  if (bad.length) {
    console.error(`lesson-complete-pin --selftest FAILED:\n  - ${bad.join('\n  - ')}`);
    process.exit(1);
  }
  console.log(`lesson-complete-pin --selftest ok: ${String(Object.keys(mutations).length)} component mutations and 1 integration mutation caught, clean file passes`);
  process.exit(0);
}

const failures = await checkComponent(component);
if (!process.argv.includes('--unit-only')) failures.push(...checkIntegration(read(LESSON)));
if (failures.length) {
  console.error(`lesson-complete-pin FAILED (${String(failures.length)}):\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log(`lesson-complete-pin ok: M6 timeline, 8-sparkle ring, one Atlas, one spring, reduced = end state${process.argv.includes('--unit-only') ? ' (integration skipped)' : ', wired into lesson.tsx'}`);
