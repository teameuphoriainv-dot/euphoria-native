#!/usr/bin/env node
/**
 * MOTION INVARIANTS — the regression floor for the animation audit.
 *
 * `npm run check` runs sixteen regression scripts and, before this, not one of them looked at
 * motion. Every fix from the animation audit could therefore be undone by the next person to
 * touch a component, silently, with a green build. This guards the specific defects that were
 * found, measured and fixed -- not motion in general.
 *
 * WHAT THIS IS NOT: it is not a visual regression check. Comparing rendered frames needs a
 * simulator and a stable capture path, and this repo already learned that h264 ghosting looks
 * exactly like jank. This is the half that can be enforced from source alone, deterministically,
 * in CI, with no device. The visual half remains open work.
 *
 * A LANE THAT UNDER-REPORTS IS WORSE THAN ONE THAT OVER-REPORTS, so --selftest seeds each
 * violation into a scratch copy and asserts it is CAUGHT, then asserts a harmless edit is
 * IGNORED. A green run means something only because the self-test proves the lane can go red.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src';

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

/* Comments explain the fixes; scanning them would flag the very notes that record the defect. */
function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/*
 * Deliberate, per-element, documented overshoots. R2 of MOTION_RUBRIC requires that a bounce be
 * CHOSEN for a specific element rather than inherited from a library default -- these were each
 * measured and kept, so they are named here rather than silently matched by a loose pattern.
 *   atlas.tsx       12 springs at zeta 0.37-0.58, mascot squash-and-stretch
 *   streak-ignite   1.5 -> 0.94 -> 1.04 -> 1, the Duolingo-modelled earned moment
 *   reward-pop      Spring.reward, zeta 0.55, a reward chip should pop
 *   league-crest    a repeating glint, not a scale
 */
const POP_ALLOWED = ['atlas.tsx', 'streak-ignite.tsx', 'reward-pop.tsx', 'league-crest.tsx'];

const INVARIANTS = [
  {
    name: 'no scale-pop on ordinary interaction',
    why: 'Owner report: "click something and it becomes huge and becomes small". onboarding-parts '
       + 'grew a selected option to 1.035 and Spring.bouncy (zeta 0.72) overshot to about 1.076.',
    test(file, src) {
      if (POP_ALLOWED.some((a) => file.endsWith(a))) return [];
      const hits = [];
      // withSequence(...) whose first step springs or times UP past rest
      for (const m of src.matchAll(/withSequence\(\s*with(?:Spring|Timing)\(\s*(1\.\d+)/g)) {
        hits.push(`grows to ${m[1]} before settling`);
      }
      return hits;
    },
  },
  {
    name: 'no per-frame runOnJS inside a gesture',
    why: 'Owner report: "whenever I drag something it moves all over the place". slider-predict '
       + 'called runOnJS twice per frame, about 120 JS round-trips a second, each re-rendering.',
    test(file, src) {
      const hits = [];
      for (const m of src.matchAll(/\.on(?:Update|Change)\(\s*\(?[^)]*\)?\s*=>\s*\{([\s\S]*?)\n\s{4,6}\}\)/g)) {
        const body = m[1];
        for (const r of body.matchAll(/runOnJS\((\w+)\)/g)) {
          /*
           * Gated emission is the fix: only fire when the value has moved past a threshold.
           * NOTE THE CHARACTER CLASS. This was [^)]* and could not cross the closing paren
           * inside `Math.abs(f - last.value)`, so the very shape the fix uses was reported as a
           * violation. The self-test caught it before the lane ever ran -- which is the entire
           * argument for making a lane prove it can go green as well as red.
           */
          const gated = /if\s*\([\s\S]*?(?:Math\.abs|>=|<=)[\s\S]*?\)\s*\{[\s\S]*?runOnJS/.test(body);
          if (!gated) hits.push(`ungated runOnJS(${r[1]}) per frame`);
        }
      }
      return hits;
    },
  },
  {
    name: 'nothing enters by growing from zero',
    why: 'R4 of MOTION_RUBRIC: across 238 reference transitions the smallest starting footprint '
       + 'is 9.2% of screen width. ZoomIn starts at scale 0, which rasterises text near-zero and '
       + 'resamples it up -- the reported "messes up the pixels".',
    test(file, src) {
      return [...src.matchAll(/entering=\{\s*ZoomIn/g)].map(() => 'ZoomIn entering (scale 0)');
    },
  },
  {
    name: 'index-multiplied entrance delays are capped',
    why: 'digest staggered 34 cards at i*30 with no cap, so the last card waited 1180ms and sat '
       + 'BLANK below the fold. STAGGER_CAP (360) exists for exactly this.',
    test(file, src) {
      const hits = [];
      for (const m of src.matchAll(/delay=\{([^}]*\bi\s*\*\s*(?:\d+|STAGGER_GAP)[^}]*)\}/g)) {
        const expr = m[1];
        if (!/Math\.min|STAGGER_CAP/.test(expr)) hits.push(`uncapped stagger: ${expr.trim()}`);
      }
      return hits;
    },
  },
];

function run(files) {
  const failures = [];
  for (const f of files) {
    const src = stripComments(readFileSync(f, 'utf8'));
    for (const inv of INVARIANTS) {
      for (const detail of inv.test(f, src)) failures.push({ file: f, inv: inv.name, detail, why: inv.why });
    }
  }
  return failures;
}

if (process.argv.includes('--selftest')) {
  const ok = (cond, msg) => { if (!cond) { console.error(`selftest FAILED: ${msg}`); process.exit(1); } };
  const probe = (name, body) => {
    const inv = INVARIANTS.find((i) => i.name === name);
    return inv.test('src/components/scratch.tsx', stripComments(body));
  };
  // Each seeded regression must be CAUGHT.
  ok(probe('no scale-pop on ordinary interaction',
      'pop.set(withSequence(withSpring(1.035, Spring.bouncy), withSpring(1, Spring.smooth)));').length,
    'seeded scale pop was not caught');
  ok(probe('no per-frame runOnJS inside a gesture',
      '.onUpdate((e) => {\n      const f = 1;\n      runOnJS(setGuess)(f);\n    })').length,
    'seeded ungated runOnJS was not caught');
  ok(probe('nothing enters by growing from zero',
      '<Animated.View entering={ZoomIn.springify().damping(16)}>').length,
    'seeded ZoomIn was not caught');
  ok(probe('index-multiplied entrance delays are capped',
      '<RiseIn delay={base + i * 30}>').length,
    'seeded uncapped stagger was not caught');
  // Harmless edits must be IGNORED, or the lane cries wolf and gets switched off.
  ok(!probe('no scale-pop on ordinary interaction',
      'const s = { transform: [{ scale: 1.035 }] };').length,
    'a STATIC scale was wrongly flagged as a pop');
  ok(!probe('no per-frame runOnJS inside a gesture',
      '.onUpdate((e) => {\n      if (Math.abs(f - last.value) >= STEP) {\n        runOnJS(setGuess)(f);\n      }\n    })').length,
    'a GATED runOnJS was wrongly flagged');
  ok(!probe('index-multiplied entrance delays are capped',
      '<RiseIn delay={Math.min(i * 60, STAGGER_CAP)}>').length,
    'a CAPPED stagger was wrongly flagged');
  ok(!probe('nothing enters by growing from zero',
      '<Animated.View entering={FadeInDown.delay(60)}>').length,
    'FadeInDown was wrongly flagged as ZoomIn');
  console.log('motion-invariants selftest ok — 4 regressions caught, 4 harmless edits ignored');
  process.exit(0);
}

const failures = run(walk(SRC));
if (failures.length) {
  console.error(`motion-invariants: ${failures.length} regression(s)\n`);
  for (const f of failures) console.error(`  ${f.file}\n    ${f.inv}: ${f.detail}\n    why: ${f.why}\n`);
  process.exit(1);
}
console.log(`motion-invariants ok — ${INVARIANTS.length} invariants across ${walk(SRC).length} files`);
