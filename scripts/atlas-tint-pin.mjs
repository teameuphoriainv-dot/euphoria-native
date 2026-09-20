#!/usr/bin/env node
/**
 * ATLAS TINT — the SVG id collision guard.
 *
 * Atlas's four ring gradients and its weave ClipPath were declared with FIXED ids (atlasRing0..3,
 * atlasWeave). That is harmless while every Atlas on a screen is the same colour: all instances
 * resolve to identical definitions and nobody can tell which one won. It becomes a real bug the
 * moment two instances want DIFFERENT tints -- `url(#atlasRing0)` names one definition, so every
 * Atlas mounted renders in whichever tint was defined last rather than its own.
 *
 * That failure is silent and looks like a colour bug, not an id bug, so it guards itself here.
 * The namespace is derived from the tint, which means two different tints can never share an id
 * and two instances of the SAME tint safely do.
 *
 * --selftest seeds each violation and asserts it is caught, because a lane that cannot go red
 * proves nothing by being green.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SRC = 'src/components/atlas-mark.tsx';

function check(src) {
  const bad = [];
  // every id that is referenced by url(#...) must carry the namespace
  if (/id=\{?`?atlasRing\$\{i\}`?\}?/.test(src) || /id="atlasRing\d"/.test(src)) {
    bad.push('ring gradient id is not namespaced by tint');
  }
  if (/id="atlasWeave"/.test(src)) bad.push('weave ClipPath id is not namespaced by tint');
  if (/url\(#atlasRing\$\{i\}\)/.test(src)) bad.push('ring stroke references a non-namespaced gradient id');
  if (/url\(#atlasWeave\)/.test(src)) bad.push('clipPath references a non-namespaced id');
  // the namespace must actually derive from the tint, not be a constant
  if (!/ns:\s*tint\.replace/.test(src)) bad.push('namespace is not derived from the tint value');
  // the untinted path must keep the house constants, or every existing Atlas shifts colour
  if (!/if \(!tint\) return \{ lit: LIT, dark: DARK, ns: '' \}/.test(src)) {
    bad.push('untinted path no longer returns the house LIT/DARK constants');
  }
  return bad;
}

if (process.argv.includes('--selftest')) {
  const ok = (c, m) => { if (!c) { console.error(`selftest FAILED: ${m}`); process.exit(1); } };
  const good = readFileSync(SRC, 'utf8');
  ok(check(good).length === 0, 'the real file was flagged');
  ok(check(good.replace(/id=\{`atlasRing\$\{ns\}\$\{i\}`\}/, 'id={`atlasRing${i}`}')).length > 0,
    'a non-namespaced gradient id was NOT caught');
  ok(check(good.replace(/id=\{`atlasWeave\$\{ns\}`\}/, 'id="atlasWeave"')).length > 0,
    'a non-namespaced ClipPath id was NOT caught');
  ok(check(good.replace(/ns: tint\.replace\([^)]*\)/, "ns: 'x'")).length > 0,
    'a constant namespace was NOT caught');
  ok(check(good.replace("if (!tint) return { lit: LIT, dark: DARK, ns: '' }", "if (!tint) return { lit: '#fff', dark: '#000', ns: '' }")).length > 0,
    'a changed untinted palette was NOT caught');
  console.log('atlas-tint-pin selftest ok — 4 regressions caught, 1 clean file ignored');
  process.exit(0);
}

const bad = check(readFileSync(SRC, 'utf8'));
assert.deepEqual(bad, [], `atlas tint: ${bad.join('; ')}`);
console.log('atlas-tint-pin ok — ring and weave ids are namespaced by tint');
