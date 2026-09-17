/**
 * A raw hex may not IMITATE a theme token. Invent a colour or use the token — not a near-miss.
 *
 * WHY THIS EXISTS: on 2026-09-17 an audit counted NINE different "brand purples" shipping in the
 * app at once — #A650E7 (5 uses), #C57FF3 (4), #A855EB (3), #B862ED (2), #A451E6, #BA66EA, #B57BEF,
 * #8028C3, #F472B6. Four of them sat within ΔE 13 of each other: indistinguishable to the eye,
 * completely distinct to the code. The same pattern ran through the neutrals — #14121C appeared 16
 * times as a near-miss of ctaNeutralInk (#17141F), and #F2EFF7 appeared 12 times as a near-miss of
 * ctaNeutral (#F1EFF5). Both clustered in the ATLAS components, the app's most-seen surface.
 *
 * Nothing was broken. Every screen rendered. That is exactly the problem: a brand colour that is
 * secretly nine colours never throws, never fails review, and cannot be changed without a grep —
 * but it is precisely what makes a product read as assembled rather than designed. Change `primary`
 * and eight impostors stay behind.
 *
 * THE RULE: a raw hex within ΔE `TOL` of any theme token must BE that token's value. Further away
 * than that and it is its own colour — allowed, because content art, charts and the pixel sprites
 * legitimately need a full spectrum this palette does not carry.
 *
 * Tokens are PARSED from theme.ts rather than listed here, so adding a token automatically brings
 * its whole neighbourhood under the rule. A hand-kept list would rot on the first new token.
 *
 * Distance is redmean, not naive RGB: it tracks human perception closely enough to separate "same
 * colour, sloppy" from "different colour, deliberate" without pulling in a colour-science package.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Perceptual budget. Below this, two colours are the same colour with a typo between them. */
const TOL = 20;
/** Dev-only surfaces. They exist to show colour, so they are allowed to name it. */
const DEV = new Set(['art-test.tsx', 'perf-hud.tsx', 'dev-gallery.tsx']);
/** Not brand colours. Black is a scrim and a shadow; white is ink on a violet slab. */
const UNIVERSAL = new Set(['#000000', '#FFFFFF']);
/*
 * WEB-PARITY SURFACES — near-misses of a token, and that is CORRECT.
 *
 * The Atlas tutor surfaces (#14121C bubble, #F2EFF7 ink, #1C1C22 border, #A650E7 accent, and more)
 * sit ΔE 3-13 from ctaNeutralInk / ctaNeutral / iconPurple — squarely in the band this pin exists to
 * catch. They are not drift. They are the euphoriainv.com values, and the parity scripts assert the
 * NATIVE source carries these exact literals so the two platforms cannot silently diverge.
 *
 * This was learned the hard way: the first run of this pin collapsed them onto the nearer token and
 * broke THREE parity checks (teaching-slide, lesson-visual-explanation, lesson-design). That is how
 * the list below was earned rather than guessed.
 *
 * It is SCANNED from the check scripts, not typed out here, for the same reason theme-alpha-pin
 * scans its call sites: a hand-kept list rots the first time a parity script pins a new value. Any
 * hex a check script asserts on is canonical BY DEFINITION — that assertion is what makes it so.
 */
const WEB_PARITY = new Set(
  readdirSync('scripts')
    .filter((f) => f.endsWith('.mjs') && f !== 'colour-drift-pin.mjs')
    .flatMap((f) => readFileSync(join('scripts', f), 'utf8').match(/#[0-9A-Fa-f]{6}/g) ?? [])
    .map((h) => h.toUpperCase()),
);
assert.ok(WEB_PARITY.size > 10, `scanned only ${WEB_PARITY.size} canonical hexes from scripts/ — the scan drifted`);

const HEX = /'(#[0-9A-Fa-f]{6})'/g;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.tsx') || e.endsWith('.ts')) out.push(p);
  }
  return out;
}

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function delta(a, b) {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const rm = (r1 + r2) / 2;
  return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2);
}

const theme = readFileSync('src/constants/theme.ts', 'utf8');
const tokens = new Map();
for (const m of theme.matchAll(/^ {4}(\w+):\s*'(#[0-9A-Fa-f]{6})'/gm)) {
  if (!tokens.has(m[2].toUpperCase())) tokens.set(m[2].toUpperCase(), m[1]);
}
assert.ok(tokens.size > 12, `parsed only ${tokens.size} hex tokens from theme.ts — the regex drifted`);

const values = [...tokens.keys()];
const offenders = [];

for (const file of [...walk('src/app'), ...walk('src/components')]) {
  const name = file.split('/').pop();
  if (DEV.has(name)) continue;
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(HEX)) {
    const hex = m[1].toUpperCase();
    if (tokens.has(hex) || UNIVERSAL.has(hex) || WEB_PARITY.has(hex)) continue;
    let near = null;
    for (const v of values) {
      const d = delta(hex, v);
      if (d < TOL && (near === null || d < near.d)) near = { d, v, token: tokens.get(v) };
    }
    if (near) {
      offenders.push(`${file}: ${hex} is ΔE ${near.d.toFixed(1)} from theme.${near.token} (${near.v}) — use the token's value`);
    }
  }
}

assert.deepEqual(
  [...new Set(offenders)], [],
  'these raw hex values imitate a theme token instead of being it, which is how one brand colour ' +
  'silently becomes nine — collapse each onto the token it is copying',
);

console.log(
  `colour-drift-pin: OK — no raw hex sits within ΔE ${TOL} of any of the ${tokens.size} theme tokens.`,
);
