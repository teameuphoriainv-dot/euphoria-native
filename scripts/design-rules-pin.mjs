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

/*
 * The onboarding avatar step's 96pt hero (2026-09-22). The stored default avatar is the `atlas` id,
 * which is not in the grid, so a hero that drew whatever was stored would have put a second Atlas
 * under the AtlasStage on the one screen about the USER's picture. It must resolve through
 * avatarFor() to the first grid character and never draw the mascot. (Block proposed by the O4
 * builder; watched failing with the fallback changed to {id:'atlas'} and with an <Atlas> render.)
 */
const hero = strip(readFileSync(new URL('../src/components/onboarding/avatar-hero.tsx', import.meta.url), 'utf8'))
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
assert.ok(!/<Atlas[\s/>]/.test(hero), 'avatar-hero renders <Atlas>: the avatar is the user, Atlas is Atlas');
assert.ok(!/from '@\/components\/atlas'/.test(hero), 'avatar-hero imports the Atlas mascot');
assert.match(hero, /avatarFor\(stored\)\s*\?\?\s*FIRST_GRID/, 'heroAvatar no longer falls back to a grid character for the atlas id');
assert.match(hero, /FIRST_GRID\s*=\s*CHARACTER_AVATARS\[0\]/, 'the hero fallback is no longer the first grid character');

/*
 * Onboarding: Atlas guides every screen (owner decision 2, 2026-09-22) and is still drawn ONCE.
 * The guide bubble sits under the persistent AtlasStage with showAtlas={false}; the paywall swaps
 * the stage for the compact row, which draws the only Atlas there. A guide with its own Atlas under
 * the stage, or the stage kept on the paywall beside the compact row, is two mascots on one screen.
 */
const ob = strip(readFileSync(new URL('../src/app/onboarding.tsx', import.meta.url), 'utf8'));
assert.match(ob, /const guide = <AtlasGuide line=\{guideLine\} showAtlas=\{false\}/,
  'onboarding: the per-step guide must be the bubble alone (showAtlas={false}) under the AtlasStage');
const paywallBranch = /renderStep === PAYWALL_INDEX \? \(([\s\S]*?)\) : \(\s*<AtlasStage/.exec(ob)?.[1] ?? '';
assert.match(paywallBranch, /<AtlasGuide[^>]*variant="compact"/,
  'onboarding: the paywall must show the compact guide where the AtlasStage was');
assert.ok(!/<Atlas(?:Stage)?[\s/>]/.test(paywallBranch),
  'onboarding: the paywall draws another Atlas beside the compact guide, which already draws him');
assert.match(ob, /def\.kind !== 'try' && def\.kind !== 'paywall' && def\.kind !== 'reveal' \? guide : null/,
  'onboarding: the guide no longer heads every ordinary step');
assert.match(ob, /case 'try':\s*return <DoubleItStep ctl=\{tryCtl\} atlas=\{guide\}/, 'onboarding: the try step lost its guide slot');
assert.match(ob, /def\?\.kind === 'reveal' \? guide : null/, 'onboarding: the reveal lost its guide');

/*
 * RULE 6 again, in the LESSON: the deck card and the floating Ask-Atlas button (S2 + K0 reviews,
 * 2026-09-22). The scene part (src/lib/mobile-lesson/parts/scene.ts) and every Atlas clip
 * (src/components/mobile-lesson/clickthrough/pixel-stage.tsx) mount their own <Atlas> inside the
 * card, and lesson.tsx floats LessonAtlasButton, which is an <Atlas> too, over the step. Without
 * the hand-off every scene deck and every clip deck showed two mascots at once.
 *
 * The hand-off is two halves and this pin holds BOTH, because either half alone is silent:
 *   1. cardDrawsAtlas must actually READ the two flags. A version that returned a hardcoded true
 *      (or listed the kinds and ignored the flags) would pass a regex for the kind names while
 *      turning either file's flag into a lie. So the function is run here with the flags flipped.
 *   2. lesson.tsx must take the report and hide its float (`!deckAtlas`) and hand it to the deck.
 */
const deckSrc = readFileSync(new URL('../src/components/mobile-lesson/card-deck.tsx', import.meta.url), 'utf8');
const drawsSig = /export function cardDrawsAtlas\([^)]*\)[^{]*\{([\s\S]*?)\n\}/.exec(deckSrc);
assert.ok(drawsSig, 'cardDrawsAtlas is gone from card-deck.tsx, so nothing decides which card owns the mascot');
// Built with new Function on purpose: the point of this pin is to RUN the real cardDrawsAtlas with
// the flags flipped, not to pattern-match its text, which is what a hardcoded true would satisfy.
const drawsAtlas = new Function('SCENE_DRAWS_ATLAS', 'CLIP_DRAWS_ATLAS', `return (card) => {${drawsSig[1]}\n};`);
const sceneCard = { kind: 'interactive', spec: { kind: 'scene' } };
const clipCard = { kind: 'interactive', spec: { kind: 'stage' } };
const plainCard = { kind: 'idea' };
assert.equal(drawsAtlas(true, true)(sceneCard), true, 'a scene card must report that it draws Atlas');
assert.equal(drawsAtlas(true, true)(clipCard), true, 'an Atlas clip card must report that it draws Atlas');
assert.equal(drawsAtlas(true, true)(plainCard), false, 'a plain idea card must not claim the mascot and steal the float');
assert.equal(drawsAtlas(false, true)(sceneCard), false, 'cardDrawsAtlas IGNORES SCENE_DRAWS_ATLAS: scene.ts could drop its Atlas and the lesson would still hide its own');
assert.equal(drawsAtlas(true, false)(clipCard), false, 'cardDrawsAtlas IGNORES CLIP_DRAWS_ATLAS: pixel-stage.tsx could drop its Atlas and the lesson would still hide its own');
// The flags as they stand today. Both files DO draw an Atlas, so both must be true or the lesson
// is told the card is empty and shows the second mascot again.
const sceneFlag = /export const SCENE_DRAWS_ATLAS = (true|false)/.exec(
  readFileSync(new URL('../src/lib/mobile-lesson/parts/scene.ts', import.meta.url), 'utf8'));
const clipFlag = /export const CLIP_DRAWS_ATLAS = (true|false)/.exec(
  readFileSync(new URL('../src/components/mobile-lesson/clickthrough/pixel-stage.tsx', import.meta.url), 'utf8'));
assert.equal(sceneFlag?.[1], 'true', 'SCENE_DRAWS_ATLAS is not true, but scene-card.tsx still mounts <Atlas>');
assert.equal(clipFlag?.[1], 'true', 'CLIP_DRAWS_ATLAS is not true, but pixel-stage.tsx still mounts <Atlas>');
const lessonSrc = strip(readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8'))
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
assert.match(lessonSrc, /onAtlasCard=\{setDeckAtlas\}/, 'lesson.tsx never asks the deck which card owns the mascot');
assert.match(lessonSrc, /atlasContext && !deckAtlas/, 'lesson.tsx floats Ask-Atlas without checking deckAtlas, so a scene or clip card shows two Atlases');
/*
 * RULE 6, generalised (owner, 2026-09-28): the slider showed THREE Atlases (its prompt, the wrong-
 * answer correction, the float). Per-kind exemptions kept missing new step kinds, so every <Atlas>
 * inside the lesson body now claims presence and the float hides; a tap on that Atlas opens the
 * same tutor. These three links are the whole mechanism.
 */
const atlasSrc = readFileSync(new URL('../src/components/atlas.tsx', import.meta.url), 'utf8');
assert.match(atlasSrc, /useLayoutEffect\(\(\) => presence\?\.claim\(\)/, 'atlas.tsx no longer claims lesson presence, so the float draws a second mascot beside it');
assert.match(lessonSrc, /<LessonAtlasPresenceProvider[\s\S]*?styles\.body[\s\S]*?<\/LessonAtlasPresenceProvider>/, 'lesson.tsx no longer wraps the step body in LessonAtlasPresenceProvider');
assert.match(lessonSrc, /!contentAtlas/, 'the lesson float ignores an Atlas drawn by the step itself');

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
/*
 * LOWERED 2026-09-22 to 99: welcome.tsx's smooth SVG beam and its three violet literals
 * (#A855EB twice, #C89CF5) became the stepped PixelBeam in theme tokens. Measured 99 after the
 * batch, the lowest it can be set without failing today.
 */
/*
 * RAISED 2026-09-28 to 101 for src/components/correct-confetti.tsx. The owner asked for "the
 * confetti thing from webapp" on a right answer, and the web burst's colours are fixed literals
 * (fireSmallConfetti: #22c55e, #3b82f6, #b862ed), not theme tokens. The blue and the violet have
 * no token here; matching the web burst is the point, so they stay literal and commented at the
 * site. The green equals theme.success but stays with its two siblings as one palette.
 */
/*
 * RAISED 2026-09-28 to 105 for src/components/digest-chart.tsx. The Digest now renders the web's
 * data charts, and the web's four series colours (#AE4EFE #0BA3B1 #BE8802 #4D7FFF) were solved AS
 * A SET by its palette validator for colour-blind separation and contrast. Swapping any one for a
 * nearby app token would break the separation the set exists for, so they stay literal, in fixed
 * order, commented at the site as a parity contract with the web chart.
 */
const HEX_CEILING = 105;
assert.ok(
  hex <= HEX_CEILING,
  `${String(hex)} hardcoded hex literals outside the art files, ceiling is ${String(HEX_CEILING)}. ` +
    'Use a theme token, or if the colour is deliberate decoration that must match in both themes, ' +
    'comment why at the site and raise the ceiling in the same commit.',
);

console.log(
  `design-rules-pin ok — one mascot per screen (deck cards hand the float back), ${String(entries.length)} Pro benefits all subtitled, ` +
    `${String(hex)}/${String(HEX_CEILING)} hex literals`,
);
