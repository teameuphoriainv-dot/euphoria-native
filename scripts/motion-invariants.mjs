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
    why: 'Owner report: "whenever I drag something it moves all over the place". the since-deleted slider-predict '
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
  {
    name: 'springs set their own stiffness',
    why: 'R2 of MOTION_RUBRIC: bounce must be CHOSEN per element, never inherited. '
       + '.springify().damping(n) with no .stiffness() inherits Reanimated default 100 -- that is '
       + 'how tap-reveal ended up at zeta 0.8 and bouncing, which the owner reported.',
    test(file, src) {
      const hits = [];
      for (const line of src.split('\n')) {
        if (line.includes('.springify()') && !line.includes('.stiffness(')) {
          hits.push('springify() inherits Reanimated default stiffness 100');
        }
      }
      return hits;
    },
  },
  {
    name: 'inline spring constants are justified in a comment',
    why: 'R2 again: an inline {stiffness, damping} pair IS a per-element choice, so it has to '
       + 'carry the reason someone chose it. Without that, the next person cannot tell a measured '
       + 'decision from a number that was typed once and copied.',
    /*
     * atlas.tsx is exempt and NAMED rather than pattern-matched: it is the mascot character file,
     * its twelve springs at zeta 0.37-0.58 are deliberate squash-and-stretch measured during the
     * audit, and its file-level docstring explains the acting model they serve. It is also owned
     * by another session right now, so quietly rewriting it would collide.
     */
    test(file, src, raw) {
      if (file.endsWith('atlas.tsx')) return [];
      const lines = raw.split('\n');
      const hits = [];
      lines.forEach((line, i) => {
        if (!/\{\s*stiffness:\s*[\d.]+\s*,\s*damping:/.test(line)) return;
        const ctx = lines.slice(Math.max(0, i - 7), i).join('\n');
        if (!/\/\/|\/\*|^\s*\*/m.test(ctx)) hits.push(`undocumented spring: ${line.trim().slice(0, 54)}`);
      });
      return hits;
    },
  },
  {
    name: 'inline springs set their own mass',
    why: 'Reanimated 4 DEFAULTS mass TO 4, not 1: spring.ts builds its default config from '
       + 'GentleSpringConfig {damping:120, mass:4, stiffness:900}, and Reanimated 3\'s mass-1 '
       + 'default is only still reachable as Reanimated3DefaultSpringConfig. Since '
       + 'zeta = c / (2*sqrt(k*m)), an inline spring that omits mass runs at HALF the damping '
       + 'ratio its author computed. Measured, not assumed: lesson-feedback.tsx went from an '
       + 'intended zeta 0.607 to an actual 0.303, overshoot 9.1% to 36.8% -- 69.9pt of a 190pt '
       + 'throw instead of 17.3pt -- and the device agreed to four decimals, peak 1.36739 against '
       + 'a model 1.36778. Sixteen springs were affected before this rule existed.',
    test(file, src) {
      const hits = [];
      for (const m of src.matchAll(/\{[^{}]*\bstiffness:\s*[\d.]+[^{}]*\}/g)) {
        if (!/\bmass:/.test(m[0])) hits.push(`spring without explicit mass: ${m[0].slice(0, 54)}`);
      }
      return hits;
    },
  },
  {
    name: 'infinite repeats are reduced-motion guarded',
    why: 'withRepeat(..., -1) never stops, which is the clearest vestibular trigger in the app. '
       + 'VERIFIED PASSING when added -- every infinite repeat already sits behind a '
       + 'useReducedMotion check, so this locks in a property rather than filing a todo.',
    test(file, src) {
      if (!/withRepeat\([\s\S]{0,140}?,\s*-1/.test(src)) return [];
      return /useReducedMotion/.test(src) ? [] : ['infinite withRepeat with no reduced-motion guard'];
    },
  },
];

function run(files) {
  const failures = [];
  for (const f of files) {
    const raw = readFileSync(f, 'utf8');
    const src = stripComments(raw);
    for (const inv of INVARIANTS) {
      for (const detail of inv.test(f, src, raw)) failures.push({ file: f, inv: inv.name, detail, why: inv.why });
    }
  }
  return failures;
}

if (process.argv.includes('--selftest')) {
  const ok = (cond, msg) => { if (!cond) { console.error(`selftest FAILED: ${msg}`); process.exit(1); } };
  const probe = (name, body) => {
    const inv = INVARIANTS.find((i) => i.name === name);
    return inv.test('src/components/scratch.tsx', stripComments(body), body);
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
  // Invariants 5-7, added after the first four.
  ok(probe('springs set their own stiffness',
      'layout={LinearTransition.springify().damping(18)}').length,
    'seeded inherited stiffness was not caught');
  ok(!probe('springs set their own stiffness',
      'layout={LinearTransition.springify().damping(26).stiffness(180)}').length,
    'an EXPLICIT stiffness was wrongly flagged');
  ok(probe('inline spring constants are justified in a comment',
      'const a = 1;\nconst b = 2;\nx.set(withSpring(1, { stiffness: 500, damping: 18 }));').length,
    'seeded undocumented spring was not caught');
  ok(!probe('inline spring constants are justified in a comment',
      '// measured: zeta 0.55, a reward chip should pop\nx.set(withSpring(1, { stiffness: 500, damping: 18 }));').length,
    'a DOCUMENTED spring was wrongly flagged');
  ok(probe('inline springs set their own mass',
      'x.set(withSpring(1, { stiffness: 220, damping: 18 }));').length,
    'seeded mass-less spring was not caught');
  ok(!probe('inline springs set their own mass',
      'x.set(withSpring(1, { stiffness: 220, damping: 18, mass: 1 }));').length,
    'an EXPLICIT mass was wrongly flagged');
  ok(probe('infinite repeats are reduced-motion guarded',
      'bob.set(withRepeat(withTiming(1, { duration: 900 }), -1, true));').length,
    'seeded unguarded infinite repeat was not caught');
  ok(!probe('infinite repeats are reduced-motion guarded',
      'const reduced = useReducedMotion();\nbob.set(withRepeat(withTiming(1), -1, true));').length,
    'a GUARDED infinite repeat was wrongly flagged');
  console.log('motion-invariants selftest ok — 8 regressions caught, 8 harmless edits ignored');
  process.exit(0);
}

const failures = run(walk(SRC));
if (failures.length) {
  console.error(`motion-invariants: ${failures.length} regression(s)\n`);
  for (const f of failures) console.error(`  ${f.file}\n    ${f.inv}: ${f.detail}\n    why: ${f.why}\n`);
  process.exit(1);
}
console.log(`motion-invariants ok — ${INVARIANTS.length} invariants across ${walk(SRC).length} files`);
