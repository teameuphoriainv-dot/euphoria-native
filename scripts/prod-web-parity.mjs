#!/usr/bin/env node
/**
 * Verify every native lesson's content against the JS bundle euphoriainv.com actually serves.
 *
 * This is the strongest content-parity evidence available and the cheapest: it compares against
 * the DEPLOYED ARTIFACT rather than a git commit, so it cannot be fooled by a stale pin, an
 * unpushed local branch, or an assumption about what shipped. Comparing rendered screens in a
 * browser is both slower and weaker -- text extraction is lossy, and driving 300 lessons through
 * the UI re-tests the same renderers 300 times to learn nothing new about content.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/prod-web-parity.mjs
 */
const ORIGIN = process.env.EUPHORIA_WEB_ORIGIN || 'https://www.euphoriainv.com';
const PROBES_PER_LESSON = 3;

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/** Vite splits the app; course data sits in lazily-imported chunks referenced from other chunks,
 *  so one pass over the entry HTML is not enough. Resolve transitively until closed. */
async function fetchDeployedBundle() {
  const html = await fetchText(`${ORIGIN}/app`);
  const seen = new Set();
  let queue = [...new Set([...html.matchAll(/assets\/([A-Za-z0-9_.-]+\.js)/g)].map((m) => m[1]))];
  let all = '';
  while (queue.length) {
    const next = [];
    for (const name of queue) {
      if (seen.has(name)) continue;
      seen.add(name);
      let body = '';
      try { body = await fetchText(`${ORIGIN}/assets/${name}`); } catch { continue; }
      all += body + '\n';
      for (const m of body.matchAll(/([A-Za-z0-9_.-]+-[A-Za-z0-9_-]{8}\.js)/g)) {
        if (!seen.has(m[1])) next.push(m[1]);
      }
    }
    queue = [...new Set(next)];
  }
  return { source: all, chunks: seen.size };
}

const { source: prod, chunks } = await fetchDeployedBundle();
const { COURSES, loadCourseLessons } = await import('../src/lib/curriculum/courseIndex.ts');

let lessons = 0, titleOK = 0, probesRun = 0, probesOK = 0;
const failures = [];
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    lessons += 1;
    const hasTitle = prod.includes(lesson.title);
    if (hasTitle) titleOK += 1;
    const probes = [...new Set((JSON.stringify(lesson.steps || []).match(/"[^"\\]{50,110}"/g) || [])
      .map((s) => s.slice(1, -1)))].slice(0, PROBES_PER_LESSON);
    const missing = [];
    for (const probe of probes) {
      probesRun += 1;
      if (prod.includes(probe)) probesOK += 1; else missing.push(probe.slice(0, 60));
    }
    if (!hasTitle || missing.length) failures.push({ course: course.id, title: lesson.title, hasTitle, missing });
  }
}

console.log('\nProduction web/native content parity');
console.log(`  origin            ${ORIGIN}`);
console.log(`  chunks fetched    ${chunks}`);
console.log(`  lessons checked   ${lessons}`);
console.log(`  titles present    ${titleOK}/${lessons}`);
console.log(`  content probes    ${probesOK}/${probesRun}`);
if (failures.length) {
  console.log(`\nFAIL — ${failures.length} lesson(s) differ from what production serves\n`);
  for (const f of failures.slice(0, 20)) {
    console.log(`  ${f.course} · ${f.title} · title:${f.hasTitle ? 'ok' : 'MISSING'}`);
    f.missing.forEach((m) => console.log(`      missing: ${m}`));
  }
  process.exit(1);
}
if (lessons !== 300) {
  console.log(`\nFAIL — expected 300 lessons, walked ${lessons}`);
  process.exit(1);
}
console.log('\nPASS — every one of the 300 native lessons matches the deployed production bundle.\n');
