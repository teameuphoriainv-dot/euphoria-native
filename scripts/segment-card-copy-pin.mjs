#!/usr/bin/env node
// ============================================================================
// SEGMENT CARD COPY PIN (P4) — the part-finish card must never look like a finished lesson.
//
//   node scripts/segment-card-copy-pin.mjs --selftest
//   node scripts/segment-card-copy-pin.mjs --copy-only
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/segment-card-copy-pin.mjs
//
// WHY THIS EXISTS. A lesson now pays out two or three times instead of once, and there are two
// ways that quietly ruins something:
//
//   1. DRIVE.PY STOPS EARLY. scripts/anim/drive.py:590 decides a lesson is over the moment the
//      visible labels contain any of 'lesson complete', 'xp earned', 'you earned', 'well done' or
//      '+30 xp'. A part card carrying one of those would make every automated sweep stop at part 1
//      and report a PASS for a lesson it never finished. The list is READ OUT OF drive.py here
//      rather than copied, so a sixth phrase added there is enforced here the same day.
//
//   2. '+30 XP' IS A PHRASE, NOT A NUMBER. The fifth string is a rendered XP chip. With the owner's
//      2/1/3 weights the largest non-final share in the corpus is 25, so the chip cannot say it.
//      With equal thirds a 60 XP two-part lesson pays Learn 30 and the card renders '+30 XP', which
//      is both a false "lesson done" signal to drive.py and a bigger number than the real ending.
//      So this pin does not check the weights, it checks the SHARES the corpus actually produces.
//
// HOW THE COPY IS CHECKED. By RUNNING the PURE region of segment-finish-card.tsx, not by regex over
// its JSX. A template like `${verb} done` passes any pattern match and still assembles a banned
// phrase at runtime, and that is exactly the shape this has to catch.
//
// FLAGS.
//   --selftest   fixtures only: proves both lanes go red, and that clean input is ignored.
//   --copy-only  source + copy lanes, no corpus. For running before W1's src/lib/lesson-segments.ts
//                lands; the corpus lane needs segmentsOf and segmentXpShares from it.
// ============================================================================
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const CARD = 'src/components/segment-finish-card.tsx';
const BAR = 'src/components/lesson-segment-bar.tsx';
const RING = 'src/components/segment-ring.tsx';
const DRIVE = 'scripts/anim/drive.py';

const source = (p) => readFileSync(join(ROOT, p), 'utf8');
/* Comments are stripped before any source scan: this file's subject is written out in the card's
   own comments ("never 'well done'"), and a note recording the defect must not trip the lane that
   prevents it. */
const strip = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/[^\n]*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

const SELFTEST = process.argv.includes('--selftest');
const COPY_ONLY = process.argv.includes('--copy-only');

/* ── the banned phrases, read out of drive.py ─────────────────────────────────────────────── */

function doneStrings() {
  const py = source(DRIVE);
  const m = /if any\(k in text for k in \(([^)]*)\)\)/.exec(py);
  if (!m) {
    throw new Error(
      `${DRIVE}: could not find the lesson-done heuristic (if any(k in text for k in (...))). ` +
        'It was renamed or moved, and this pin can no longer tell which phrases end a sweep. ' +
        'Point the regex at the new site rather than hardcoding the list here.',
    );
  }
  const found = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1].toLowerCase());
  if (found.length < 5) {
    throw new Error(`${DRIVE}: parsed only ${String(found.length)} done-strings, expected at least 5`);
  }
  return found;
}

/* ── lane 1: no banned phrase in any string the card can render ───────────────────────────── */

/** U+2014 em dash and U+2013 en dash. CONSTITUTION 4: never in user-facing prose. */
const DASHES = /[–—]/;

/**
 * @param {{ what: string, text: string }[]} strings every string the card can put on screen
 * @param {string[]} banned the phrases drive.py stops on
 * @returns {string[]} one message per violation
 */
function copyFailures(strings, banned) {
  const out = [];
  for (const { what, text } of strings) {
    const low = String(text).toLowerCase();
    for (const b of banned) {
      if (low.includes(b)) {
        out.push(
          `${what} renders "${String(text)}", which contains drive.py's done-string "${b}". ` +
            'Every automated sweep would stop at this part and report the lesson passed.',
        );
      }
    }
    if (DASHES.test(String(text))) out.push(`${what} renders an em or en dash: "${String(text)}"`);
  }
  return out;
}

/* ── lane 2: no non-final XP share may reach 30 ───────────────────────────────────────────── */

/**
 * @param {{ key: string, share: number }[]} shares every non-final part share in the corpus
 * @returns {string[]} one message per violation
 */
function shareFailures(shares) {
  const out = [];
  for (const { key, share } of shares) {
    if (share >= 30) {
      out.push(
        `${key} pays a non-final part ${String(share)} XP, so its card renders "+${String(share)} XP". ` +
          "At 30 that is drive.py's '+30 xp' done-string, and above 30 a part out-pays the ending.",
      );
    }
    if (share < 5) out.push(`${key} pays a non-final part ${String(share)} XP, which is below the 5 XP floor`);
  }
  return out;
}

/* ── self-test ─────────────────────────────────────────────────────────────────────────────── */

if (SELFTEST) {
  const banned = doneStrings();
  const fails = [];
  const must = (cond, msg) => { if (!cond) fails.push(msg); };

  // (a) the design's own break test: "Well done" in the heading.
  must(
    copyFailures([{ what: 'heading', text: 'Well done, part 1 of 3' }], banned).length === 1,
    'copy lane did not catch a heading containing "Well done"',
  );
  // and the other four, so the lane is not accidentally matching one phrase only.
  for (const b of banned) {
    must(copyFailures([{ what: 'x', text: `a ${b} b` }], banned).length === 1, `copy lane missed "${b}"`);
  }
  must(copyFailures([{ what: 'x', text: 'Part 1 of 3 finished — nice' }], banned).length === 1,
    'copy lane did not catch an em dash');
  must(copyFailures([{ what: 'x', text: 'Part 1 of 3 finished' }], banned).length === 0,
    'copy lane flagged clean copy');

  // (b) the design's other break test: equal thirds put 30 on a 60 XP two-part Learn.
  must(shareFailures([{ key: 'fixture:1', share: 30 }]).length === 1, 'share lane did not catch a 30 XP part');
  must(shareFailures([{ key: 'fixture:1', share: 35 }]).length === 1, 'share lane did not catch a 35 XP part');
  must(shareFailures([{ key: 'fixture:1', share: 4 }]).length === 1, 'share lane did not catch a sub-floor part');
  must(shareFailures([{ key: 'fixture:1', share: 25 }]).length === 0, 'share lane flagged a legal 25 XP part');

  if (fails.length) {
    console.error('segment-card-copy-pin --selftest FAILED:');
    for (const f of fails) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`segment-card-copy-pin selftest ok — both lanes go red (${String(banned.length)} done-strings read from drive.py)`);
  process.exit(0);
}

/* ── the real run ──────────────────────────────────────────────────────────────────────────── */

const banned = doneStrings();
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

const cardRaw = source(CARD);
const card = strip(cardRaw);

/* 1. Run the card's copy. */
const m = /\/\/ PURE:BEGIN[^\n]*\n([\s\S]*?)\/\/ PURE:END/.exec(cardRaw);
if (!m) {
  console.error(`segment-card-copy-pin: ${CARD} has no PURE:BEGIN/PURE:END region, so its copy cannot be run.`);
  process.exit(1);
}
const js = stripTypeScriptTypes(m[1].replace(/\}\s+as const;/g, '};'));
const copy = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

const KINDS = ['learn', 'vocab', 'practice'];
const NEXTS = [...KINDS, 'challenge'];
const rendered = [
  { what: 'KEEP_GOING', text: copy.KEEP_GOING },
  { what: 'DONE_FOR_NOW', text: copy.DONE_FOR_NOW },
];
for (const count of [2, 3]) {
  for (let i = 0; i < count - 1; i += 1) {
    rendered.push({ what: `partHeading(${String(i)}, ${String(count)})`, text: copy.partHeading(i, count) });
  }
}
for (const n of NEXTS) rendered.push({ what: `nextLine('${n}')`, text: copy.nextLine(n) });
/* Every multiple of 5 a share can be, plus the ends. The corpus lane below narrows this to the
   shares that actually occur; this one proves the FORMATTER is safe across the whole range. */
for (let xp = 5; xp <= 29; xp += 5) rendered.push({ what: `xpChipLabel(${String(xp)})`, text: copy.xpChipLabel(xp) });
for (const d of [1, 2, 7, 30, 100, 365]) rendered.push({ what: `streakChipLabel(${String(d)})`, text: copy.streakChipLabel(d) });
for (const n of NEXTS) {
  for (const adv of [true, false]) {
    rendered.push({
      what: `cardAnnouncement(0, 3, '${n}', 25, ${String(adv)})`,
      text: copy.cardAnnouncement(0, 3, n, 25, adv, 4),
    });
  }
}

/* 1b. A ZERO share must not render a chip at all.
      The store dedupes on (id, kind), which is the anti-farm rule, so a part that is opened again
      through the `?part=` deep link (design 4.11) or raised again after a remount is credited 0.
      "+0 XP" on the one screen whose job is to report a payout reads as a broken chip. Both the
      chip and the spoken announcement have to drop it, so both are asserted. */
check(copy.showsXp(25) === true && copy.showsXp(5) === true,
  `${CARD}: showsXp() hides a real share, so a paid part would report nothing`);
for (const z of [0, -5]) {
  check(copy.showsXp(z) === false, `${CARD}: showsXp(${String(z)}) is true, so the card renders "+${String(z)} XP"`);
  check(!copy.cardAnnouncement(0, 3, 'vocab', z, false, 0).includes('XP'),
    `${CARD}: cardAnnouncement speaks an XP chip for a ${String(z)} XP credit`);
}
check(/showsXp\(xp\) \?/.test(card) && /showsXp\(xp\) \|\| streakAdvanced/.test(card),
  `${CARD} renders the XP chip unconditionally, so an already-credited part shows "+0 XP"`);
check(rendered.every((r) => typeof r.text === 'string' && r.text.length > 0),
  'the PURE region produced an empty or non-string label; a table is missing a key');
failures.push(...copyFailures(rendered, banned));

/* 2. The banned phrases must not appear anywhere in the card's source either, so a literal added
      straight into the JSX outside the PURE region is caught too. */
for (const b of banned) {
  check(!card.toLowerCase().includes(b), `${CARD} contains drive.py's done-string "${b}" outside the PURE copy`);
}

/* 3. The card is the SMALL moment. Reusing the lesson-complete stack would spend the ending on a
      part, and 'lesson-complete' is the event the motion audits read as a finished lesson. */
check(/event="mastery-increase"/.test(card), `${CARD} no longer uses SemanticMotion event="mastery-increase"`);
check(!/lesson-complete/.test(card), `${CARD} uses the 'lesson-complete' motion event, which means a FINISHED lesson`);
for (const banned2 of ['Confetti', 'CelebrationWipe', 'CelebrationRays', 'LessonComplete']) {
  check(!new RegExp(`\\b${banned2}\\b`).test(card), `${CARD} pulls in ${banned2}: the part card must stay smaller than DONE`);
}
check(!/withSpring/.test(card), `${CARD} springs: overshoot is reserved for the character and for earned rewards (AGENTS.md)`);

/* 4. Both choices are real choices: two buttons, both at the 44pt floor (CONSTITUTION 5.10). */
check(/label=\{KEEP_GOING\}/.test(card), `${CARD} no longer labels its primary button with KEEP_GOING`);
check(/label=\{DONE_FOR_NOW\}/.test(card), `${CARD} no longer offers the quiet "Done for now" way out`);
check(/minHeight: TARGET/.test(card) && /const TARGET = 44/.test(cardRaw), `${CARD} lost the 44pt floor on its quiet button`);

/* 5. Colour from the theme. design-rules-pin caps hex literals across src/app and src/components
      as a ratchet and had ONE of headroom when these three files were written, so all three carry
      zero. Checked here as well because a ratchet only says the total, never which file moved. */
for (const f of [CARD, BAR, RING]) {
  const hex = strip(source(f)).match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
  check(hex.length === 0, `${f} hardcodes ${String(hex.length)} hex colour(s) (${hex.join(', ')}); use a theme token`);
}

/* 6. The bar draws its OWN track backgrounds. Prevents it being dropped inside lesson.tsx's
      `styles.track`, whose translucent background would fill the gaps between the parts and make
      an empty part indistinguishable from the gap beside it. */
const bar = strip(source(BAR));
check(/backgroundColor: track/.test(bar), `${BAR} no longer paints its own per-part track`);
/* 6b. THE UNFILLED TRACK MUST NOT BE A THEME TOKEN.
      lesson.tsx's header is dark chrome in BOTH palettes and never consults the theme: a
      `<BlurView tint="dark">`, a `rgba(7,3,15,0.7)` tint, a `rgba(139,92,246,0.1)` bottom border
      and its own grey step-label literal. `theme.border` there is a dark grey in the dark palette
      but a NEAR-WHITE in the light one, which over that header carries about four times the
      relative luminance of the `theme.primary` fill beside it (0.78 against 0.18). With Light Mode
      on, an EMPTY part would then read brighter than a finished one and the bar would say the
      opposite of the truth.
      (No hex literals in this comment on purpose: design-rules-pin's ratchet counts raw file
      bytes and does not strip comments, and colour-drift-pin treats any hex inside scripts/ as a
      canonical value. Naming a colour here would move both.)
      The RING is exempt and takes `track` from its caller: both of its call sites are themed
      surfaces where `theme.border` is right. */
check(/const TRACK_EMPTY = 'rgba\(/.test(bar),
  `${BAR}'s unfilled track is no longer a theme-independent literal`);
check(!/track=\{theme\./.test(bar),
  `${BAR} paints its unfilled track from a theme token. The lesson header is dark in both ` +
    'palettes, so in Light Mode the empty parts would out-shine the filled ones.');
/* The import alone is not the guard. An earlier draft of this check matched `useReducedMotion`
   anywhere in the file, so replacing `const reduced = useReducedMotion()` with `const reduced =
   false` left the lane green while every bar animated under the setting. Both the CALL and the
   branch that uses it are required. */
check(/const reduced = useReducedMotion\(\)/.test(bar), `${BAR} no longer reads useReducedMotion`);
check(/reduced \? pct : withTiming/.test(bar), `${BAR} animates a width with no Reduced Motion outcome`);

/* 7. The ring takes whole arcs, never a lesson. Two surfaces draw it (learn.tsx and home.tsx) and a
      ring that computed its own progress would let them disagree about what a filled arc means. */
const ring = strip(source(RING));
check(/filled: number/.test(ring), `${RING} no longer takes `+'`filled`'+` as a count of whole arcs`);
check(!/lesson-segments|useApp|curriculum/.test(ring), `${RING} imports lesson state; it must stay a drawing`);

/* ── corpus lane: the real shares ──────────────────────────────────────────────────────────── */

let sharesChecked = 0;
if (!COPY_ONLY) {
  let segmentsOf;
  let segmentXpShares;
  try {
    ({ segmentsOf, segmentXpShares } = await import(pathToFileURL(join(ROOT, 'src/lib/lesson-segments.ts')).href));
  } catch (e) {
    console.error(
      'segment-card-copy-pin: src/lib/lesson-segments.ts (W1) did not load, so the XP shares the ' +
        'cards will actually render cannot be measured. Run with --copy-only until it lands, and ' +
        'never treat a --copy-only pass as this pin being green.',
    );
    console.error(`  ${e.message}`);
    process.exit(1);
  }

  const { COURSES, loadCourseLessons } = await import(pathToFileURL(join(ROOT, 'src/lib/curriculum/index.ts')).href);
  const { expandSteps } = await import(pathToFileURL(join(ROOT, 'src/lib/lesson-steps.ts')).href);
  const { hasMasteryChallenge } = await import(pathToFileURL(join(ROOT, 'src/lib/mastery-challenge-model.ts')).href);

  const nonFinal = [];
  for (const c of COURSES) {
    for (const l of await loadCourseLessons(c.id)) {
      const types = expandSteps(l.steps).map((s) => s.type);
      const segs = segmentsOf(types, hasMasteryChallenge(l.challenge));
      const shares = segmentXpShares(l.xp, segs.map((s) => s.kind));
      check(
        shares.length === segs.length && shares.reduce((a, b) => a + b, 0) === l.xp,
        `${c.id}:${String(l.num)} shares ${JSON.stringify(shares)} do not sum to its ${String(l.xp)} XP`,
      );
      for (let i = 0; i < shares.length - 1; i += 1) nonFinal.push({ key: `${c.id}:${String(l.num)}`, share: shares[i] });
    }
  }
  sharesChecked = nonFinal.length;
  check(sharesChecked > 0, 'no non-final parts found in the corpus, so this lane measured nothing');
  failures.push(...shareFailures(nonFinal));
  /* Every non-final share also has to survive the FORMATTER, which is the thing drive.py reads. */
  failures.push(...copyFailures(
    [...new Set(nonFinal.map((s) => s.share))].map((s) => ({ what: `xpChipLabel(${String(s)})`, text: copy.xpChipLabel(s) })),
    banned,
  ));
}

if (failures.length) {
  console.error(`segment-card-copy-pin: ${String(failures.length)} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  `segment-card-copy-pin ok — ${String(rendered.length)} rendered strings clear of ${String(banned.length)} drive.py done-strings, ` +
    (COPY_ONLY ? 'corpus shares SKIPPED (--copy-only)' : `${String(sharesChecked)} non-final shares all under 30`),
);
