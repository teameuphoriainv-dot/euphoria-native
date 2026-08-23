/**
 * N1 / N23 — no em dashes in user-facing prose.
 *
 * The cofounder flagged this twice: N1 "Em dash after the coach on the first screen — decide if
 * we're keeping it; reads a little rough", then N23 widened it to "Em dashes throughout the app
 * flagged as feeling rough/off — needs a broader copy pass". The first instance was, exactly,
 * welcome.tsx: "I'll be your personal investing coach — one calm lesson at a time."
 *
 * WHAT THIS DELIBERATELY DOES NOT FLAG, because a pin that fires on correct typography gets
 * disabled within a week and then protects nothing:
 *   - `'—'` as an EMPTY-VALUE placeholder ("Lesson 3 of —"). That is the standard convention for
 *     a value that has not loaded, and there is no prose to read rough.
 *   - EN dashes in numeric ranges: 13–17, +50–100, $4.10 – $4.85. Correct, and a different
 *     character entirely (U+2013, not U+2014).
 *   - console.* diagnostics. A developer reads those; a user never does.
 *   - dev-gallery.tsx, which is an internal screen.
 *   - comments of any kind, including trailing ones.
 *
 * The rule is therefore narrow and specific: an EM dash with a word character either side is
 * prose, and prose is the thing being complained about.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKIP_FILES = new Set(['dev-gallery.tsx']);

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.tsx?$/.test(f) && !SKIP_FILES.has(f) ? [p] : [];
  });
}

/** Strips block comments, whole-line comments AND trailing ones, without eating `https://`. */
function decomment(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
    .split('\n')
    .map((l) => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1'))
    .join('\n');
}

const offenders = [];
for (const file of walk('src')) {
  decomment(readFileSync(file, 'utf8'))
    .split('\n')
    .forEach((line, i) => {
      if (/console\.(log|warn|error|info)/.test(line)) return;
      if (/\w[^\S\n]*—[^\S\n]*\w/.test(line)) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
    });
}

if (offenders.length) {
  console.error(`em-dash-prose-pin: ${offenders.length} em dash(es) in user-facing prose.`);
  console.error('N1/N23: rewrite the sentence — a full stop or a "·" separator, not a swap to a comma.');
  offenders.forEach((o) => console.error('  ' + o));
  process.exit(1);
}
console.log('em-dash-prose-pin: OK — no em dashes in user-facing prose.');
