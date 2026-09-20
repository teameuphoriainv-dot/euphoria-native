#!/usr/bin/env node
/**
 * Atlas's reactions must exist, must fire, and must be able to fire TWICE.
 *
 * WHY THIS LANE EXISTS. The wrong-answer shake was written, measured against the balance-scale
 * reference, documented, and then never called. A word-boundary search for `shake` across
 * src/app and src/components on 2026-09-14 returned ZERO call sites, so the most emotionally
 * loaded moment in the app was met by a mascot standing perfectly still. Nothing caught it: the
 * prop typechecks, the effect is correct, eslint has no opinion about an unused optional prop,
 * and every parity script asserts the correction BUBBLE renders without ever asking whether the
 * mascot in it moves.
 *
 * That is the exact shape the reduced-motion lane was built for, inverted. That lane asks "is this
 * animation guarded". This one asks "is this animation reachable".
 *
 * THREE INVARIANTS:
 *   1. Every reaction Atlas can perform has at least one live call site. A reaction with none is
 *      dead code wearing the costume of a feature.
 *   2. Every reaction has a paired `*Key` retrigger prop, and the effect DEPENDS on it. A boolean
 *      latches: it answers the first wrong answer and ignores the second. This file already
 *      records that bug twice, for celebrate and for nod, so a third reaction without a key is a
 *      defect the codebase has already paid for.
 *   3. Every reaction effect is reduced-motion guarded. reduced_motion_audit.py checks the file
 *      imports the hook; this checks each reaction actually branches on it.
 *
 * Run:
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/atlas-reactions-regression.mjs
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/atlas-reactions-regression.mjs --selftest
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ATLAS = join(ROOT, 'src', 'components', 'atlas.tsx');

/** The reactions, and the key that re-fires each. `idle` is excluded on purpose: it is a state,
 *  not a reaction, so it has nothing to re-trigger. */
const REACTIONS = [
  { prop: 'celebrate', key: 'celebrateKey' },
  { prop: 'nod', key: 'nodKey' },
  { prop: 'shake', key: 'shakeKey' },
];

/* Comments in this repo quote removed code verbatim and describe the very bugs being pinned, so
   scanning them would make the lane pass on its own documentation. Same trap goal-minutes-pin hit. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => '\n'.repeat((m.match(/\n/g) ?? []).length))
    .split('\n')
    .map((l) => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1'))
    .join('\n');
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(p) ? [p] : [];
  });
}

/* ── DETECTORS ──────────────────────────────────────────────────────────────────────────────── */

/**
 * Does `prop` appear as a JSX attribute on an <Atlas ...> somewhere other than atlas.tsx itself?
 *
 * Matching the <Atlas> ELEMENT rather than the bare word is the whole point: a plain search for
 * "shake" matches `handshake` in lesson-art.tsx six times, which is precisely the kind of false
 * green that would have let the original defect through a sloppier version of this check.
 */
function callSites(prop, files) {
  const attr = new RegExp(`\\b${prop}(?:=\\{|=\\"|[\\s/>])`);
  const found = [];
  for (const { path, src } of files) {
    for (const el of src.matchAll(/<Atlas\b[^>]*\/?>/g)) {
      if (attr.test(el[0])) found.push(path);
    }
  }
  return [...new Set(found)];
}

/** The effect body that owns a reaction, so the two checks below can look inside it. */
function reactionEffect(atlasSrc, prop) {
  const start = atlasSrc.indexOf(`if (!${prop} || reduced) return;`);
  if (start === -1) return null;
  const depsAt = atlasSrc.indexOf('}, [', start);
  if (depsAt === -1) return null;
  const depsEnd = atlasSrc.indexOf(']', depsAt);
  return { body: atlasSrc.slice(start, depsAt), deps: atlasSrc.slice(depsAt + 3, depsEnd + 1) };
}

function checkReachable(reactions, files) {
  return reactions
    .filter((r) => callSites(r.prop, files).length === 0)
    .map((r) => `<Atlas ${r.prop}> has no call site anywhere in the app; the reaction is dead code`);
}

function checkRetriggerable(reactions, atlasSrc) {
  const bad = [];
  for (const r of reactions) {
    const effect = reactionEffect(atlasSrc, r.prop);
    if (!effect) {
      bad.push(`no reduced-motion-guarded effect found for '${r.prop}' in atlas.tsx`);
      continue;
    }
    if (!new RegExp(`\\b${r.key}\\b`).test(effect.deps)) {
      bad.push(`the '${r.prop}' effect does not depend on '${r.key}', so a boolean latch means it fires once and never again`);
    }
  }
  return bad;
}

function checkGuarded(reactions, atlasSrc) {
  return reactions
    .filter((r) => reactionEffect(atlasSrc, r.prop) === null)
    .map((r) => `the '${r.prop}' reaction is not guarded by 'reduced'; every reaction needs a reduced-motion path`);
}

/* ── SELFTEST ───────────────────────────────────────────────────────────────────────────────── */
function selftest() {
  const realFiles = [{ path: 'x.tsx', src: '<Atlas expression="oops" shake shakeKey={n} />' }];
  const handshakeTrap = [{ path: 'lesson-art.tsx', src: 'const a = { handshake, shakeout };' }];

  assert.equal(checkReachable([REACTIONS[2]], realFiles).length, 0, 'selftest: reachability missed a real call site');
  assert.ok(checkReachable([REACTIONS[2]], []).length > 0, 'selftest: reachability passed with no call sites at all');
  assert.ok(
    checkReachable([REACTIONS[2]], handshakeTrap).length > 0,
    'selftest: `handshake` was accepted as a call site for the shake reaction, which is the false green this lane exists to prevent',
  );

  const goodAtlas = 'if (!shake || reduced) return;\n  shakeX.set(1);\n  }, [shake, shakeKey, reduced]);';
  const latchedAtlas = 'if (!shake || reduced) return;\n  shakeX.set(1);\n  }, [shake, reduced]);';
  const unguardedAtlas = 'if (!shake) return;\n  shakeX.set(1);\n  }, [shake, shakeKey]);';

  assert.equal(checkRetriggerable([REACTIONS[2]], goodAtlas).length, 0, 'selftest: retrigger check flagged a keyed effect');
  assert.ok(checkRetriggerable([REACTIONS[2]], latchedAtlas).length > 0, 'selftest: retrigger check missed a boolean latch');
  assert.ok(checkGuarded([REACTIONS[2]], unguardedAtlas).length > 0, 'selftest: guard check missed an unguarded reaction');
  assert.equal(checkGuarded([REACTIONS[2]], goodAtlas).length, 0, 'selftest: guard check flagged a guarded reaction');

  assert.equal(stripComments('// <Atlas shake />\nreal();').includes('Atlas'), false, 'selftest: comments were not stripped');

  console.log('atlas-reactions selftest: every detector goes red on a broken input');
}

if (process.argv.includes('--selftest')) {
  selftest();
  process.exit(0);
}

/* ── THE RUN ────────────────────────────────────────────────────────────────────────────────── */

const atlasSrc = stripComments(readFileSync(ATLAS, 'utf8'));
const files = [...walk(join(ROOT, 'src', 'app')), ...walk(join(ROOT, 'src', 'components'))]
  .filter((p) => p !== ATLAS && !p.endsWith('dev-gallery.tsx'))
  .map((path) => ({ path: path.slice(ROOT.length + 1), src: stripComments(readFileSync(path, 'utf8')) }));

const dead = checkReachable(REACTIONS, files);
assert.deepEqual(dead, [], `a mascot reaction is unreachable:\n  ${dead.join('\n  ')}`);

const latched = checkRetriggerable(REACTIONS, atlasSrc);
assert.deepEqual(latched, [], `a mascot reaction cannot fire twice:\n  ${latched.join('\n  ')}`);

const unguarded = checkGuarded(REACTIONS, atlasSrc);
assert.deepEqual(unguarded, [], `a mascot reaction ignores Reduced Motion:\n  ${unguarded.join('\n  ')}`);

/*
 * THE WRONG-ANSWER REACTION SPECIFICALLY, pinned to the component that owns it.
 *
 * Every surface that can be got wrong routes through <AtlasCorrection>, so that is the one place
 * the reaction has to survive. Pinning it here rather than at the four consumers means a new
 * wrong-answer surface inherits the reaction instead of having to remember it.
 */
const correction = stripComments(readFileSync(join(ROOT, 'src', 'components', 'atlas-correction.tsx'), 'utf8'));
assert.match(
  correction,
  /<Atlas[^>]*\bshake\b/,
  'AtlasCorrection no longer shakes. Every wrong answer in the app runs through this component, so ' +
    'dropping the reaction here silently removes it from lessons, true/false, drag-sort and the number line at once.',
);
assert.match(
  correction,
  /<Atlas[^>]*expression="oops"/,
  'the correction must wear `oops`, the miss face, not `whoa`, the surprise face. Being wrong is not a surprise, ' +
    'and lesson.tsx already uses `oops` for the same event.',
);

const sites = REACTIONS.map((r) => `${r.prop} x${String(callSites(r.prop, files).length)}`).join(', ');
console.log(`atlas-reactions: ${sites}; every reaction keyed, reduced-motion guarded, and reachable.`);
