// Verifies the Digest guide -> lesson map in src/lib/digest-lessons.ts.
//
// That map is a join between two GENERATED things: slugs come from digest-content.ts
// (./scripts/sync-digest.sh) and course/num point into src/lib/curriculum/courses/**
// (./scripts/sync-curriculum.sh). Either sync can move a lesson out from under it, and the
// failure is silent: the reader's closing CTA just opens the wrong lesson, or none.
//
// Run: node scripts/check-digest-lessons.mjs      (exits non-zero on any problem)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const problems = [];

// --- the map ---------------------------------------------------------------
const mapSrc = read("src/lib/digest-lessons.ts");
const guides = [...mapSrc.matchAll(/'([a-z0-9-]+)':\s*\{\s*course:\s*'([a-z-]+)',\s*num:\s*(\d+)\s*\}/g)]
  .map((m) => ({ slug: m[1], course: m[2], num: Number(m[3]) }));

if (!guides.length) problems.push("digest-lessons.ts: parsed zero guide entries. Did the map's shape change?");

// --- every guide slug must be a real post ----------------------------------
const posts = [...read("src/lib/digest-content.ts").matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
for (const g of guides) {
  if (!posts.includes(g.slug)) problems.push(`"${g.slug}" is not a post in digest-content.ts`);
}

// --- every post should have a CTA target ------------------------------------
for (const slug of posts) {
  if (!guides.some((g) => g.slug === slug)) problems.push(`post "${slug}" has no lesson mapping, so its CTA falls back to the demo lesson`);
}

// --- course id -> module file, straight out of the loader switch -------------
const files = Object.fromEntries(
  [...read("src/lib/curriculum/courseIndex.ts").matchAll(/case '([a-z-]+)':\s*\n\s*return \(await import\('\.\/courses\/(\w+)'\)\)/g)]
    .map((m) => [m[1], m[2]]),
);

// --- every course/num must resolve to a real lesson -------------------------
const lessonCache = {};
for (const g of guides) {
  const file = files[g.course];
  if (!file) {
    problems.push(`"${g.slug}" points at course "${g.course}", which courseIndex.ts cannot load`);
    continue;
  }
  if (!lessonCache[file]) {
    lessonCache[file] = new Set(
      [...read(`src/lib/curriculum/courses/${file}.ts`).matchAll(/\bL\((\d+),\s*['"]/g)].map((m) => Number(m[1])),
    );
  }
  if (!lessonCache[file].has(g.num)) {
    problems.push(`"${g.slug}" points at ${g.course} lesson ${g.num}, which does not exist in ${file}.ts`);
  }
}

// --- report ------------------------------------------------------------------
if (problems.length) {
  console.error("\n  DIGEST LESSON MAP FAILED\n  ------------------------");
  for (const p of problems) console.error("  * " + p);
  console.error("");
  process.exit(1);
}

const courses = [...new Set(guides.map((g) => g.course))];
const dupes = guides.length - new Set(guides.map((g) => `${g.course}:${g.num}`)).size;
console.log(`digest lesson map OK`);
console.log(`  ${guides.length} guides -> ${guides.length - dupes} distinct lessons across ${courses.length} courses`);
console.log(`  ${courses.join(", ")}`);
