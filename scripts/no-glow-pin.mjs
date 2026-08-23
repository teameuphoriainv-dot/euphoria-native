/**
 * No soft glow anywhere in the app.
 *
 * From the cofounder design doc, twice: "we can't have the same type of gradient behind it
 * because it looks extremely vibe-coded" and "they can't have the vibe-coded glow behind them."
 *
 * A "glow" in React Native is precisely `shadowRadius > 0` — a blurred halo, usually in the
 * element's own hue. Two shipped instances had it: the CTA (shadowRadius 16 in the gradient's end
 * colour) and the Home hero card (shadowRadius 30 in the course accent). Both are gone; the app's
 * depth language is now a hard-cut slab, which is a shadow at radius ZERO.
 *
 * So the invariant is exact and mechanical: no non-zero shadowRadius in src. Depth is still
 * available — offset a solid shadow — it just may not be blurred.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
});

const bad = [];
for (const file of walk('src')) {
  // Comments in this repo quote the removed code verbatim, so stripping them is required or the
  // pin fails on its own documentation. That exact trap already bit goal-minutes-pin once.
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
    .split('\n').map((l) => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).join('\n');
  src.split('\n').forEach((line, i) => {
    const m = line.match(/shadowRadius:\s*([0-9.]+)/);
    if (m && Number(m[1]) > 0) bad.push(`${file}:${i + 1}: shadowRadius ${m[1]} — ${line.trim().slice(0, 80)}`);
  });
}

if (bad.length) {
  console.error(`no-glow-pin: ${bad.length} blurred shadow(s). The design direction is hard-cut.`);
  console.error('Use a solid shadow at radius 0 with an offset, the way SlabButton and the Home hero do.');
  bad.forEach((b) => console.error('  ' + b));
  process.exit(1);
}
console.log('no-glow-pin: OK — zero blurred shadows.');
