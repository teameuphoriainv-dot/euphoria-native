/**
 * No soft glow anywhere in the app.
 *
 * From the cofounder design doc, twice: "we can't have the same type of gradient behind it
 * because it looks extremely vibe-coded" and "they can't have the vibe-coded glow behind them."
 *
 * A "glow" here is a coloured blurred halo. The canonical web lesson deliberately uses two
 * neutral black elevation shadows: `shadow-sm` on lesson cards and `0 25px 50px -12px #000` on
 * the Atlas tutor. Those are depth, not a coloured glow, and are narrowly allowlisted below.
 *
 * Everywhere else the invariant stays exact: no non-zero shadowRadius in src.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
});

const bad = [];
const canonicalWebDepth = new Set([
  'src/components/lesson-atlas-sheet.tsx',
  'src/components/ui/card.tsx',
]);
for (const file of walk('src')) {
  // Comments in this repo quote the removed code verbatim, so stripping them is required or the
  // pin fails on its own documentation. That exact trap already bit goal-minutes-pin once.
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
    .split('\n').map((l) => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).join('\n');
  src.split('\n').forEach((line, i) => {
    const m = line.match(/shadowRadius:\s*([0-9.]+)/);
    if (m && Number(m[1]) > 0) {
      const neutralLessonDepth = canonicalWebDepth.has(file) && src.includes("shadowColor: '#000000'");
      if (!neutralLessonDepth) bad.push(`${file}:${i + 1}: shadowRadius ${m[1]} — ${line.trim().slice(0, 80)}`);
    }
  });
}

if (bad.length) {
  console.error(`no-glow-pin: ${bad.length} blurred shadow(s). The design direction is hard-cut.`);
  console.error('Use a solid shadow at radius 0 with an offset, the way SlabButton and the Home hero do.');
  bad.forEach((b) => console.error('  ' + b));
  process.exit(1);
}
console.log('no-glow-pin: OK — no coloured blurred glows; canonical neutral lesson depth retained.');
