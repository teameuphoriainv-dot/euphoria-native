/**
 * design-rules-pin — guards the three design rules a script can actually verify.
 *
 * refs/DESIGN_RULES.md holds the full set. Most of it is judgement and is deliberately NOT pinned:
 * a rule a script cannot check is worse than no rule if it is enforced by a check that always
 * passes. Each assertion below exists because that exact defect reached a real device.
 *
 * Run: node scripts/design-rules-pin.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[^\n]*\/\/[^\n]*$/gm, '');

/* ── RULE 6: one mascot per screen ────────────────────────────────────────────────────────────
 * ProfileAvatar rendered <Atlas> whenever nothing was chosen, and avatarFor() returns null for the
 * atlas id BY DESIGN, so that was every user who had never opened Profile -> Avatar and banner.
 * Home already draws Atlas beside the greeting, so the header showed the same mascot twice and the
 * user had no picture of their own. Reported from a device as "two Atlas's and no avatar picture".
 */
const avatar = strip(readFileSync(new URL('../src/components/profile-avatar.tsx', import.meta.url), 'utf8'));
assert.ok(
  !/<Atlas[\s/>]/.test(avatar),
  'profile-avatar.tsx renders <Atlas> again. The profile circle is the USER; falling back to the ' +
    'mascot puts two Atlases in the Home header for anyone who has not picked an avatar.',
);
assert.match(avatar, /CHARACTER_AVATARS/, 'profile-avatar.tsx no longer falls back to a character sprite');

/* ── RULE 2: no half-finished rows ────────────────────────────────────────────────────────────
 * Two of the three Pro benefits carried a one-line sub and the third carried none, so it rendered
 * as a bare title against two subtitled siblings and read as unfinished.
 */
const onboarding = readFileSync(new URL('../src/app/onboarding.tsx', import.meta.url), 'utf8');
const proSteps = /const PRO_STEPS[^=]*=\s*\[([\s\S]*?)\n\];/.exec(onboarding);
assert.ok(proSteps, 'PRO_STEPS not found in onboarding.tsx — this pin has drifted from the code');
const entries = proSteps[1].split('\n').filter((l) => l.trim().startsWith('{ icon:'));
assert.ok(entries.length >= 2, `expected at least 2 PRO_STEPS entries, found ${String(entries.length)}`);
for (const e of entries) {
  assert.match(
    e,
    /sub:/,
    `a PRO_STEPS row has no sub, so it renders as an unfinished row beside its siblings: ${e.trim().slice(0, 70)}`,
  );
}

/* ── RULE 8: colour comes from the theme, as a RATCHET ────────────────────────────────────────
 * Not a ban. Chosen decoration that must look identical in both themes is legitimate: banner bands,
 * the Money 2048 tile ramp, Atlas's own palette. The count may only go DOWN without a deliberate
 * edit here, so colour cannot drift out of the theme one literal at a time.
 */
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(f) ? [p] : [];
});
const ART = /banners|sprites|palette|pixel\//;
// These lesson-only surfaces mirror measured canonical web values and are independently pinned by
// lesson-design-parity-regression.mjs. Counting those deliberate source values as global palette
// drift makes the two checks contradict each other.
const CANONICAL_LESSON_DESIGN = new Set([
  'src/app/lesson.tsx',
  'src/components/interactive-graph.tsx',
  'src/components/lesson-atlas-sheet.tsx',
  'src/components/lesson-background.tsx',
  'src/components/lesson-feedback.tsx',
  'src/components/lesson-warmup.tsx',
  'src/components/ui/card.tsx',
]);
// These surfaces use deliberate lesson-game art colors that are part of parity contracts.
// If these are changed, either revert in both themes together or move to shared tokens in the same commit.
const DELIBERATE_PARITY_SURFACES = new Set([
  'src/app/games/money-2048.tsx',
  'src/app/(tabs)/learn.tsx',
  'src/components/atlas-conversation.tsx',
  'src/components/atlas-intro.tsx',
  'src/components/teaching-slide.tsx',
  'src/components/atlas-mark.tsx',
]);
let hex = 0;
for (const f of [...walk('src/app'), ...walk('src/components')]) {
  if (ART.test(f) || CANONICAL_LESSON_DESIGN.has(f) || DELIBERATE_PARITY_SURFACES.has(f)) continue;
  hex += (readFileSync(f, 'utf8').match(/#[0-9A-Fa-f]{6}\b/g) ?? []).length;
}
/*
 * Measured 2026-09-01 at 91. Lower this when literals are removed; raising it needs a reason.
 *
 * RAISED 2026-09-20 to 101 for src/components/path-node.tsx. The node's palette is deliberately
 * theme-INDEPENDENT: a raised green button is the same green in light and dark, the way a
 * physical object does not change colour with the room. Routing it through theme tokens would
 * make the one element on the path that must look identical everywhere the one element that
 * does not. These eleven literals also REPLACE copies that lived in learn.tsx, which now imports
 * them -- so the count rose while the duplication fell, which is the trade this pin cannot see.
 */
const HEX_CEILING = 101;
assert.ok(
  hex <= HEX_CEILING,
  `${String(hex)} hardcoded hex literals outside the art files, ceiling is ${String(HEX_CEILING)}. ` +
    'Use a theme token, or if the colour is deliberate decoration that must match in both themes, ' +
    'comment why at the site and raise the ceiling in the same commit.',
);

console.log(
  `design-rules-pin ok — one mascot per screen, ${String(entries.length)} Pro benefits all subtitled, ` +
    `${String(hex)}/${String(HEX_CEILING)} hex literals`,
);
