#!/usr/bin/env node
/**
 * EVERY <TextInput> MUST SET A fontFamily.
 *
 * React Native's TextInput does NOT inherit type. Unlike a <Text>, which this codebase routes
 * through ThemedText and its type scale, an input with no `fontFamily` in its style silently
 * renders in the platform face -- SF Pro on iOS. Nothing errors, nothing warns, and it looks
 * plausible, which is why it survived every screenshot review until one was pulled side by side
 * with a heading.
 *
 * Found 2026-09-02 from a screenshot of the sign-up form: "Your name" and "Email" were SF Pro
 * while every label around them was DM Sans. THIRTEEN inputs across nine files, and seven of them
 * set no family at all. Onboarding's name step, the whole auth form, search, digest search,
 * avatar, friends, and chat were all off-brand.
 *
 * This is the same failure shape as the button-label bug fixed the same day (a font that was never
 * applied rather than one applied wrongly), and both were invisible in the diff. A static check is
 * the only thing that catches the NEXT one, because the next one will also look fine.
 *
 * The rule is narrow on purpose: presence of a `fontFamily` key in the style object a TextInput
 * actually references. It does not police WHICH family -- calc-blanks may legitimately want mono
 * back for digit alignment, and that is a design call, not a defect.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('../src', import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (entry.endsWith('.tsx')) out.push(p);
  }
  return out;
}

/** The style object a `styles.NAME` reference points at, with brace matching so nested objects
 *  (shadowOffset, transform) do not end the scan early. */
function styleBody(src, name) {
  const m = new RegExp(`^\\s*${name}:\\s*\\{`, 'm').exec(src);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  let depth = 0;
  for (let i = start; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') {
      depth -= 1;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return null;
}

const offenders = [];
let checked = 0;

for (const file of walk(SRC)) {
  const src = readFileSync(file, 'utf8');
  // `<TextInput` as an ELEMENT. `useRef<TextInput>(null)` is a TYPE ARGUMENT, not a render, and
  // the naive pattern matched it -- two false positives on auth.tsx on this pin's first run. In
  // JSX the `<` is preceded by whitespace or a bracket; in a type argument it follows an
  // identifier, so the lookbehind separates them without needing to parse TypeScript.
  const re = /(?<![A-Za-z0-9_])<TextInput[\s>]/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    checked += 1;
    const seg = src.slice(m.index, m.index + 2000);
    const close = seg.indexOf('/>');
    const props = close > 0 ? seg.slice(0, close) : seg;
    const rel = file.slice(SRC.length + 1);

    if (/fontFamily/.test(props)) continue; // set inline on the element

    const ref = /style=\{\[?\s*styles\.([A-Za-z0-9_]+)/.exec(props);
    if (!ref) {
      offenders.push(`${rel}: a TextInput has no style reference and no inline fontFamily`);
      continue;
    }
    const body = styleBody(src, ref[1]);
    if (!body) {
      offenders.push(`${rel}: styles.${ref[1]} referenced by a TextInput but not found`);
      continue;
    }
    if (!/fontFamily/.test(body)) {
      offenders.push(`${rel}: styles.${ref[1]} sets no fontFamily, so this input renders in the SYSTEM font`);
    }
  }
}

assert.equal(
  offenders.length,
  0,
  `TextInput without a fontFamily (renders SF Pro, not the brand face):\n  ${offenders.join('\n  ')}`,
);

console.log(`PASS — all ${String(checked)} TextInputs set a fontFamily; none falls back to the system face`);
