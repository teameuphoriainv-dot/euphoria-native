/**
 * Any theme colour that is alpha-appended must be HEX in BOTH palettes.
 *
 * This app adds transparency by string concatenation in 88 places: `theme.primary + '30'`. That
 * yields a valid 8-digit hex only when the value is hex. Concatenating onto an `hsl(...)` value
 * gives `hsl(274 76% 61%)30`, which React Native cannot parse — and crucially it does NOT throw.
 * It renders the colour at FULL OPACITY, so a 14% tint wash becomes a solid slab.
 *
 * That is not hypothetical. Light mode's first pass shipped with the free-trial card painted solid
 * violet over its own progress bar, because five light values were hsl. Dark mode was unaffected
 * purely by luck — its values happened to already be hex. The failure is invisible in code review,
 * silent at runtime, and only appears in whichever theme has the wrong value type.
 *
 * The call sites are SCANNED rather than listed here, so adding `theme.foo + '20'` to a component
 * automatically brings `foo` under the rule. A hand-kept list would rot on the first new usage.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
});

// Which theme keys are concatenated with a two-hex-digit alpha anywhere in the app.
const used = new Set();
for (const f of walk('src')) {
  for (const m of readFileSync(f, 'utf8').matchAll(/theme\.([a-zA-Z]+)\s*\+\s*'[0-9A-Fa-f]{2}'/g)) {
    used.add(m[1]);
  }
}
assert.ok(used.size > 0, 'found no alpha-append call sites — the scan regex has drifted');

const src = readFileSync('src/constants/theme.ts', 'utf8');
const body = /export const Colors = \{([\s\S]*?)\n\};/.exec(src)[1];
const li = body.indexOf('light:');
const di = body.indexOf('dark:');
assert.ok(li >= 0 && di >= 0, 'could not locate both palettes in theme.ts');
const [lightBlock, darkBlock] = li < di
  ? [body.slice(li, di), body.slice(di)]
  : [body.slice(li), body.slice(di, li)];

const parse = (t) => Object.fromEntries([...t.matchAll(/^\s{4}(\w+):\s*'([^']*)'/gm)].map((m) => [m[1], m[2]]));
const palettes = { light: parse(lightBlock), dark: parse(darkBlock) };

const bad = [];
for (const [name, pal] of Object.entries(palettes)) {
  assert.ok(Object.keys(pal).length > 20, `parsed only ${Object.keys(pal).length} ${name} keys — regex drifted`);
  for (const key of used) {
    const v = pal[key];
    if (v === undefined) continue;
    if (!/^#[0-9A-Fa-f]{6}$/.test(v)) bad.push(`${name}.${key} = ${v}`);
  }
}

assert.deepEqual(
  bad, [],
  'these are alpha-appended somewhere but are not 6-digit hex, so the alpha is dropped and they ' +
  'render at FULL opacity in that theme',
);

console.log(
  `theme-alpha-pin: OK — ${used.size} alpha-appended keys (${[...used].sort().join(', ')}) are hex in both palettes.`,
);
