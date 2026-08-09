// §9c gap audit — which curriculum concepts have a lesson but no Digest guide.
//
// §9d chose its 35 topics by category thinness and by what an 18-25 reader actually meets. That is
// defensible, but it is not the audit §9c asked for, and C-notes record the audit as never run.
// This is it: join every lesson in every course against the guide map and report what is uncovered.
//
// Reuses check-digest-lessons.mjs's parsing exactly — the guide map regex, the courseIndex switch,
// and the L(num, 'title') lesson shape — so the two scripts cannot disagree about what a lesson is.
// This one is an AUDIT and always exits 0: a gap is a content decision, not a build failure.
//
// Run: node scripts/digest-gap-audit.mjs [--full]      (--full lists every uncovered lesson)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const FULL = process.argv.includes("--full");

// --- guide -> lesson map (same regex as check-digest-lessons.mjs) -------------
const guides = [...read("src/lib/digest-lessons.ts").matchAll(/'([a-z0-9-]+)':\s*\{\s*course:\s*'([a-z-]+)',\s*num:\s*(\d+)\s*\}/g)]
  .map((m) => ({ slug: m[1], course: m[2], num: Number(m[3]) }));

// --- course id -> module file, straight out of the loader switch --------------
const files = Object.fromEntries(
  [...read("src/lib/curriculum/courseIndex.ts").matchAll(/case '([a-z-]+)':\s*\n\s*return \(await import\('\.\/courses\/(\w+)'\)\)/g)]
    .map((m) => [m[1], m[2]]),
);

// --- every lesson in every course --------------------------------------------
const covered = new Set(guides.map((g) => `${g.course}:${g.num}`));
const rows = [];
let totalLessons = 0;

for (const [course, file] of Object.entries(files)) {
  const lessons = [...read(`src/lib/curriculum/courses/${file}.ts`).matchAll(/\bL\((\d+),\s*(['"])(.*?)\2/g)]
    .map((m) => ({ num: Number(m[1]), title: m[3] }));
  // A course can define the same lesson number more than once across sections; dedupe by number.
  const byNum = new Map(lessons.map((l) => [l.num, l.title]));
  const gaps = [...byNum.entries()]
    .filter(([num]) => !covered.has(`${course}:${num}`))
    .map(([num, title]) => ({ num, title }))
    .sort((a, b) => a.num - b.num);
  totalLessons += byNum.size;
  rows.push({ course, lessons: byNum.size, guides: byNum.size - gaps.length, gaps });
}

rows.sort((a, b) => b.guides - a.guides || a.course.localeCompare(b.course));

// --- report -------------------------------------------------------------------
const pct = (n, d) => (d === 0 ? "  —" : `${String(Math.round((n / d) * 100)).padStart(3)}%`);
const pad = Math.max(...rows.map((r) => r.course.length));

console.log("\n  §9c GAP AUDIT — lessons with no Digest guide\n");
console.log(`  ${"course".padEnd(pad)}  lessons  guides  covered`);
console.log(`  ${"-".repeat(pad)}  -------  ------  -------`);
for (const r of rows) {
  console.log(`  ${r.course.padEnd(pad)}  ${String(r.lessons).padStart(7)}  ${String(r.guides).padStart(6)}  ${pct(r.guides, r.lessons)}`);
}
const totalGuides = rows.reduce((n, r) => n + r.guides, 0);
console.log(`  ${"-".repeat(pad)}  -------  ------  -------`);
console.log(`  ${"TOTAL".padEnd(pad)}  ${String(totalLessons).padStart(7)}  ${String(totalGuides).padStart(6)}  ${pct(totalGuides, totalLessons)}`);

const untouched = rows.filter((r) => r.guides === 0);
const partial = rows.filter((r) => r.guides > 0 && r.gaps.length);

console.log(`\n  ${untouched.length} of ${rows.length} courses have NO guide coverage at all:`);
for (const r of untouched) console.log(`    ${r.course.padEnd(pad)}  ${r.lessons} lessons, 0 guides`);

console.log(`\n  Partially covered courses — uncovered lessons:`);
for (const r of partial) {
  console.log(`\n    ${r.course}  (${r.gaps.length} of ${r.lessons} uncovered)`);
  const show = FULL ? r.gaps : r.gaps.slice(0, 8);
  for (const g of show) console.log(`      ${String(g.num).padStart(3)}  ${g.title}`);
  if (!FULL && r.gaps.length > show.length) console.log(`      ... and ${r.gaps.length - show.length} more (--full to list)`);
}

console.log(`\n  ${guides.length} guides map to ${new Set(guides.map((g) => `${g.course}:${g.num}`)).size} distinct lessons.`);
console.log(`  Gap: ${totalLessons - totalGuides} of ${totalLessons} lessons have no guide.\n`);
