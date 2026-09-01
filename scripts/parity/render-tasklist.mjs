#!/usr/bin/env node
// Renders docs/status/LESSONS_PARITY_VISUAL_TASKLIST.md from the parity manifest.
// The ledger is generated, never hand-edited, so it cannot drift from real evidence again.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '../..');
const manifest = JSON.parse(readFileSync(resolve(REPO, 'artifacts/lesson-parity/manifest.json'), 'utf8'));
const OUT = resolve(REPO, 'docs/status/LESSONS_PARITY_VISUAL_TASKLIST.md');

const GLYPH = { pending: '⚪', running: '🟡', accepted: '🟢', failed: '🔴' };
const LANES = [
  ['native', 'Native iOS'],
  ['webLive', 'Live Chrome'],
  ['audit', 'Adjudication'],
];

const bar = (done, total, width = 28) => {
  const filled = total ? Math.round((done / total) * width) : 0;
  return `\`${'█'.repeat(filled)}${'░'.repeat(width - filled)}\` ${done}/${total} (${total ? ((done / total) * 100).toFixed(1) : '0.0'}%)`;
};

const s = manifest.summary;
const out = [];
out.push('# Euphoria Native — 300 Lesson Parity Task List');
out.push('');
out.push(`> **Generated** from \`artifacts/lesson-parity/manifest.json\` at ${manifest.generatedAt}.`);
out.push('> Do not hand-edit. Regenerate with `node scripts/parity/render-tasklist.mjs`.');
out.push('');
out.push('## Corpus (authoritative)');
out.push('');
out.push('| Metric | Count |');
out.push('|---|---:|');
out.push(`| Courses | ${s.courses} |`);
out.push(`| Lessons | ${s.lessons} |`);
out.push(`| Authored steps | ${s.authoredSteps} |`);
out.push(`| Expanded lesson screens | ${s.expandedScreens} |`);
out.push(`| Mastery-challenge screens | ${s.challengeHappyPathScreens} |`);
out.push(`| **Total happy-path screens** | **${s.totalHappyPathScreens}** |`);
out.push('');

out.push('## Lane progress');
out.push('');
for (const [key, label] of LANES) {
  const c = manifest.coverage[key];
  out.push(`- **${label}** ${bar(c.accepted, s.lessons)} — ${c.failed} failed, ${c.pending} pending`);
}
out.push('');
out.push('A lesson is **verified** only when all three lanes are 🟢. Live Chrome evidence is');
out.push('operator-attested by design: the harness refuses local renders as live-web coverage.');
out.push('');

const failures = manifest.failureReasons || {};
if (Object.keys(failures).length) {
  out.push('## Open failure reasons');
  out.push('');
  out.push('| Reason | Count |');
  out.push('|---|---:|');
  for (const [r, n] of Object.entries(failures).sort((a, b) => b[1] - a[1])) out.push(`| \`${r}\` | ${n} |`);
  out.push('');
}

out.push('## Device-fit lane (typography, layout, friction)');
out.push('');
out.push('The parity harness proves *behavioral* parity. It does not prove the screen **fits**.');
out.push('These audits cover that and must be green before submission:');
out.push('');
out.push('| Check | Command | Covers |');
out.push('|---|---|---|');
out.push('| Type scale | `python3 scripts/type_audit.py` | font sizes, line height, truncation |');
out.push('| Dynamic Type | `python3 scripts/dynamic_type_audit.py` | accessibility text sizes, overflow |');
out.push('| Contrast | `python3 scripts/contrast_audit.py` | WCAG contrast on both themes |');
out.push('| Touch targets | `python3 scripts/touch_audit.py` | ≥44pt hit areas, friction |');
out.push('| Interactive states | `python3 scripts/states_audit.py` | pressed/disabled/focus states |');
out.push('| Reduced motion | `python3 scripts/reduced_motion_audit.py` | motion-off parity |');
out.push('| Locale | `python3 scripts/locale_audit.py` | string expansion overflow |');
out.push('| A11y | `node scripts/a11y-audit.mjs` | VoiceOver order and labels |');
out.push('');

const byCourse = new Map();
for (const l of manifest.lessons) {
  if (!byCourse.has(l.courseId)) byCourse.set(l.courseId, []);
  byCourse.get(l.courseId).push(l);
}

out.push('## Course rollup');
out.push('');
out.push('| Course | Lessons | Screens | Native | Web | Audit |');
out.push('|---|---:|---:|---:|---:|---:|');
for (const [courseId, rows] of byCourse) {
  const screens = rows.reduce((a, r) => a + r.expandedScreens, 0);
  const n = (lane) => rows.filter((r) => r.lanes[lane].status === 'accepted').length;
  out.push(`| ${courseId} | ${rows.length} | ${screens} | ${n('native')}/${rows.length} | ${n('webLive')}/${rows.length} | ${n('audit')}/${rows.length} |`);
}
out.push('');

out.push('## Per-lesson ledger');
out.push('');
out.push('Columns: **N**ative · **W**eb-live · **A**udit. ⚪ pending · 🟡 running · 🟢 accepted · 🔴 failed');
out.push('');
for (const [courseId, rows] of byCourse) {
  out.push(`### ${courseId}`);
  out.push('');
  out.push('| # | Lesson | Screens | N | W | A | Open issues |');
  out.push('|---:|---|---:|:-:|:-:|:-:|---|');
  for (const l of rows) {
    const g = (lane) => GLYPH[l.lanes[lane].status] ?? '⚪';
    const issues = LANES.flatMap(([k]) => l.lanes[k].failureReasons || []);
    out.push(`| ${l.lessonNumber} | ${l.title} | ${l.expandedScreens} | ${g('native')} | ${g('webLive')} | ${g('audit')} | ${issues.length ? issues.map((i) => `\`${i}\``).join(', ') : '—'} |`);
  }
  out.push('');
}

out.push('## Acceptance rule');
out.push('');
out.push('- Every lesson row shows 🟢 in all three lanes.');
out.push('- Every device-fit audit above exits clean.');
out.push('- `npm run precheck` and `npm run check` both green.');
out.push('- No failure reason remains in the table above.');
out.push('');

writeFileSync(OUT, out.join('\n'));
console.log(`wrote ${OUT}`);
console.log(`lanes: native ${manifest.coverage.native.accepted}/${s.lessons}, webLive ${manifest.coverage.webLive.accepted}/${s.lessons}, audit ${manifest.coverage.audit.accepted}/${s.lessons}`);
