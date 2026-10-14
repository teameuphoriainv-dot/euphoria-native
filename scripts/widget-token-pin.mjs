/**
 * The widget's colours must BE theme tokens, and the RIGHT ones.
 *
 * WHY THIS EXISTS: targets/widget/expo-target.config.js cannot import TypeScript, so its palette
 * is hand-copied from src/constants/theme.ts. The old file carried a comment saying exactly that
 * — "theme.ts tokens, duplicated here because the target cannot import TS" — and two of the seven
 * values were not theme tokens at all:
 *
 *   brandPrimary / $accent  #A855EB, which appears ZERO times in theme.ts. The widget rendered a
 *                           brand violet the app has never used.
 *   brandFlame              #F5B33F, which IS in theme.ts — as `warning`. Every streak flame in
 *                           the app is drawn in `streak` (#F97316). The single most important
 *                           colour in a streak widget was the warning colour, and it looked
 *                           entirely plausible.
 *
 * THAT SECOND ONE IS WHY THIS PIN CHECKS A MAPPING AND NOT MEMBERSHIP. A rule that only asked
 * "does this hex appear somewhere in theme.ts" would have passed brandFlame forever. Each widget
 * colour is pinned to the NAME of the token it is supposed to mirror, so using a real token in
 * the wrong role still fails.
 *
 * Adding a colour to the widget config without adding it here fails too — otherwise the next
 * value drifts in unnoticed, which is the whole failure mode being prevented.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** widget colour key -> the theme.dark token it must equal. */
const MIRRORS = {
  $widgetBackground: 'background',
  $accent: 'primary',
  brandBackground: 'background',
  brandPrimary: 'primary',
  brandFlame: 'streak',
  textPrimary: 'primaryForeground',
  textSecondary: 'textSecondary',
};

// theme.ts is TypeScript; parse the dark palette rather than importing it.
const theme = readFileSync('src/constants/theme.ts', 'utf8');
const darkStart = theme.indexOf('dark: {');
const lightStart = theme.indexOf('light: {');
assert.ok(darkStart > 0 && lightStart > darkStart, 'could not locate the dark palette — theme.ts was restructured');
const darkBlock = theme.slice(darkStart, lightStart);

const dark = {};
for (const m of darkBlock.matchAll(/^\s*(\w+):\s*'([^']+)'/gm)) dark[m[1]] = m[2].toUpperCase();
assert.ok(Object.keys(dark).length > 15, `parsed only ${Object.keys(dark).length} dark tokens — the regex drifted`);

const widget = require('../targets/widget/expo-target.config.js')({
  ios: { entitlements: { 'com.apple.security.application-groups': ['group.com.euphoriainv.euphoria'] } },
});

const problems = [];

for (const [key, value] of Object.entries(widget.colors)) {
  const token = MIRRORS[key];
  if (!token) {
    problems.push(`${key} is not pinned — add it to MIRRORS with the theme token it mirrors`);
    continue;
  }
  const expected = dark[token];
  if (!expected) { problems.push(`${key} mirrors theme.dark.${token}, which does not exist`); continue; }
  if (value.toUpperCase() !== expected) {
    const alsoIn = Object.entries(dark).filter(([, v]) => v === value.toUpperCase()).map(([k]) => k);
    problems.push(
      `${key} is ${value} but theme.dark.${token} is ${expected}` +
      (alsoIn.length ? ` — ${value} is theme.dark.${alsoIn.join('/')}, which is a DIFFERENT role` : ' — and that value is not a theme token at all'),
    );
  }
}
for (const key of Object.keys(MIRRORS)) {
  if (!(key in widget.colors)) problems.push(`${key} is pinned but missing from the widget config`);
}

// The plugin defaults widgets to iOS 18, which silently excludes every iOS 17 user.
assert.equal(widget.deploymentTarget, '17.0',
  'widget deploymentTarget must be pinned to 17.0 — the plugin default is 18.0, which stops iOS 17 users adding the widget at all');

assert.deepEqual(problems, [], 'widget colours have drifted from theme.ts');
console.log(`widget-token-pin: OK — ${Object.keys(widget.colors).length} widget colours mirror their theme.dark tokens, deploymentTarget 17.0.`);
