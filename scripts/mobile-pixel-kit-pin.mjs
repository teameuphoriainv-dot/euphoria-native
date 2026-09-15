#!/usr/bin/env node
/**
 * MOBILE PIXEL KIT PIN: the house rules for src/lib/pixel/sprites-mobile-kit.ts, enforced.
 *
 * WHY A LANE AND NOT A REVIEW. Every rule below is stated in prose in index.ts, palette.ts and
 * sprites-lesson.ts, twice in the case of the K one, and they keep being broken anyway. That is not
 * carelessness, it is that all four failures are INVISIBLE in a diff:
 *
 *   a 15-character row      compiles into a sprite one pixel narrower and nobody sees it in ASCII
 *   an outline drawn in K   looks correct in source and renders as nothing on the #0A090F canvas
 *   a sprite off centre     looks fine alone and is obvious only once two sit side by side
 *   a frame with a spare row throws at RUNTIME, on a card, in a lesson, on a device
 *
 * The kit is 24 archetypes multiplied by 8 accents and 12 overlay marks, so nobody is eyeballing
 * the product of that. This does.
 *
 * A LANE THAT UNDER-REPORTS IS WORSE THAN ONE THAT OVER-REPORTS, which this repo has already paid
 * for twice (lesson-art-pin parsed two keys instead of forty and passed vacuously;
 * reduced_motion_audit reported a clean zero on a file that had a defect). So --selftest seeds each
 * detector with a shape it MUST catch and a shape it MUST ignore. A green run means something only
 * because the self-test proves the lane can go red.
 *
 *   node scripts/mobile-pixel-kit-pin.mjs [--selftest]
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

/*
 * The kit and the compiler are TypeScript. Registering the repo's own resolve hook here, rather
 * than demanding `node --import ./scripts/ts-resolve-hooks.mjs`, keeps the command in the file
 * header identical to the command in package.json: a pin nobody can run from memory gets run by
 * CI only, and then only until it is first inconvenient.
 */
register(pathToFileURL(new URL('./ts-resolve-impl.mjs', import.meta.url).pathname).href);

const SIZE = 16;
const CORNER = 6; // the reserved overlay square, x 0..5 / y 0..5

/* ── DETECTORS ───────────────────────────────────────────────────────────────────────────────── */

const isInk = (ch) => ch !== '.';

/** Legal characters, read from palette.ts rather than restated, so the two cannot drift. */
let LEGAL = null;

const DETECTORS = [
  {
    name: 'exactly 16 rows',
    why: 'Width and height are DERIVED from rows (types.ts), so a missing row silently makes a '
       + 'shorter sprite rather than an error, and it renders squashed beside correct art.',
    test: (s) => (s.rows.length === SIZE ? [] : [`${s.rows.length} rows, expected ${SIZE}`]),
  },
  {
    name: 'every row is exactly 16 characters',
    why: 'compile.ts throws on this at RUNTIME, which means on a card, in a lesson, on a device. '
       + 'A miscounted row is the one bug this format has.',
    test: (s) => s.rows.flatMap((r, y) => (r.length === SIZE ? [] : [`row ${y} is ${r.length} chars`])),
  },
  {
    name: 'only shared palette characters',
    why: 'A character with no palette entry throws in compile.ts. A character from the WRONG ramp '
       + 'does not throw, it just puts a colour in the art that is in no design token.',
    test: (s) => {
      const bad = new Set();
      for (const row of s.rows) for (const ch of row) if (!LEGAL.has(ch)) bad.add(ch);
      return bad.size ? [`characters with no palette entry: ${[...bad].join(', ')}`] : [];
    },
  },
  {
    name: 'no K in an outline position',
    why: 'palette.ts: "#1A1523 on the #0A090F canvas is invisible, so any sprite whose structure is '
       + 'thin linework disappears". K and k are INTERIOR detail only. The rule is stated twice in '
       + 'the repo because people keep breaking it. An "outline position" is a K touching '
       + 'transparency or the canvas edge, which is exactly where it would have to hold a '
       + 'silhouette and cannot.',
    test: (s) => {
      const hits = [];
      s.rows.forEach((row, y) => {
        [...row].forEach((ch, x) => {
          if (ch !== 'K' && ch !== 'k') return;
          const n = [[0, -1], [0, 1], [-1, 0], [1, 0]].map(([dx, dy]) => {
            const ny = y + dy, nx = x + dx;
            if (ny < 0 || ny >= s.rows.length || nx < 0 || nx >= row.length) return '.';
            return s.rows[ny][nx];
          });
          if (n.some((c) => c === '.')) hits.push(`${ch} at ${x},${y} touches transparency or the edge`);
        });
      });
      return hits;
    },
  },
  {
    name: 'centred in the canvas',
    why: 'sprites-lesson.ts: "authoring left-aligned and padding the right leaves a sprite a pixel '
       + 'off centre, which is invisible in source and obvious the moment two sit side by side". A '
       + 'deck shows three or four of these in a column, which is the arrangement that exposes it.',
    test: (s) => {
      let min = Infinity, max = -Infinity;
      s.rows.forEach((row) => [...row].forEach((ch, x) => {
        if (!isInk(ch)) return;
        if (x < min) min = x;
        if (x > max) max = x;
      }));
      if (max < 0) return ['sprite is entirely transparent'];
      const left = min, right = (s.rows[0].length - 1) - max;
      return Math.abs(left - right) > 1
        ? [`${left} blank columns left, ${right} right (bounding box ${min}..${max})`]
        : [];
    },
  },
  {
    name: 'the overlay corner is reserved',
    why: 'applyOverlay stamps a 6x6 mark at x 0..5 / y 0..5. If an archetype draws there, the mark '
       + 'lands ON the subject, and the whole reason one piece of art serves a dozen lessons is '
       + 'that it can be marked without being redrawn.',
    test: (s) => {
      const hits = [];
      for (let y = 0; y < CORNER && y < s.rows.length; y++) {
        for (let x = 0; x < CORNER && x < s.rows[y].length; x++) {
          if (isInk(s.rows[y][x])) hits.push(`ink at ${x},${y} inside the reserved corner`);
        }
      }
      return hits.slice(0, 3);
    },
  },
  {
    name: 'frames match the still',
    why: 'types.ts requires it and compileFrames throws when it is false, at runtime. A derived '
       + 'frame cannot break this; a hand-written one is where it comes from, and three archetypes '
       + 'are hand written because no helper can tip a beam.',
    test: (s) => {
      if (!s.frames) return [];
      const h = s.rows.length, w = s.rows[0].length;
      return s.frames.flatMap((f, i) => {
        if (f.length !== h) return [`frame ${i} has ${f.length} rows, expected ${h}`];
        const badRow = f.findIndex((r) => r.length !== w);
        return badRow >= 0 ? [`frame ${i} row ${badRow} is ${f[badRow].length} chars, expected ${w}`] : [];
      });
    },
  },
  {
    name: 'animation is present and readable',
    why: 'These cards are the whole illustration on a phone screen, so every archetype animates. '
       + 'Under three frames reads as a blink and over six is a loop nobody follows; PixelSprite '
       + 'defaults frameMs to 120, and the band 120-260 is what the existing catalogue uses.',
    test: (s) => {
      const hits = [];
      const n = s.frames?.length ?? 0;
      if (n < 3 || n > 6) hits.push(`${n} frames, expected 3 to 6`);
      const ms = s.frameMs ?? 120;
      if (ms < 120 || ms > 260) hits.push(`frameMs ${ms} outside 120-260`);
      return hits;
    },
  },
  {
    name: 'drawn on the accent slot',
    why: 'An archetype that uses none of E/p/P/q cannot be recoloured, so it is a picture rather '
       + 'than an archetype and the variant system silently does nothing for it.',
    test: (s) => (s.rows.some((r) => /[EpPq]/.test(r)) ? [] : ['uses none of E, p, P, q']),
  },
];

/* Detectors that still hold once an overlay has been stamped into the corner. Centring and the
 * reserved corner deliberately do NOT: the mark IS ink in the corner and IS off centre, by design. */
const COMPOSED_CHECKS = new Set([
  'exactly 16 rows',
  'every row is exactly 16 characters',
  'only shared palette characters',
  'no K in an outline position',
  'frames match the still',
]);

const probe = (name, sprite) => DETECTORS.find((d) => d.name === name).test(sprite);

/* ── SELF-TEST ───────────────────────────────────────────────────────────────────────────────── */

const BLANK = '.'.repeat(SIZE);
const BODY = '...PPPPPPPPPP...';
const FOOT = '...EEEEEEEEEE...';
const GOOD = {
  id: 'fixture-good',
  rows: [...Array.from({ length: 6 }, () => BLANK), ...Array.from({ length: 9 }, () => BODY), FOOT],
  frames: null,
  frameMs: 160,
};
GOOD.frames = [GOOD.rows, GOOD.rows, GOOD.rows];
const mutate = (over) => ({ ...GOOD, ...over });
const swapRow = (i, row) => GOOD.rows.map((r, y) => (y === i ? row : r));

function selftest() {
  const ok = (cond, msg) => { if (!cond) { console.error(`selftest FAILED: ${msg}`); process.exit(1); } };
  let caught = 0, ignored = 0;
  const red = (name, sprite, msg) => { ok(probe(name, sprite).length, msg); caught++; };
  const green = (name, sprite, msg) => { ok(!probe(name, sprite).length, msg); ignored++; };

  red('exactly 16 rows', mutate({ rows: GOOD.rows.slice(1) }), 'a 15-row sprite was not caught');
  green('exactly 16 rows', GOOD, 'a correct 16-row sprite was wrongly flagged');

  red('every row is exactly 16 characters', mutate({ rows: swapRow(10, '...PPPPPPPPP...') }),
    'a 15-character row was not caught');
  green('every row is exactly 16 characters', GOOD, 'correct rows were wrongly flagged');

  red('only shared palette characters', mutate({ rows: swapRow(10, '...PPPPZPPPPP...') }),
    'a character with no palette entry was not caught');
  green('only shared palette characters', GOOD, 'legal palette characters were wrongly flagged');

  // The rule that keeps getting broken: K holding a silhouette against the dark canvas.
  red('no K in an outline position', mutate({ rows: swapRow(6, '...KKKKKKKKKK...') }),
    'an outline drawn in K was not caught');
  // ...and the use palette.ts explicitly allows: K enclosed by opaque pixels, as interior detail.
  green('no K in an outline position', mutate({ rows: swapRow(10, '...PPPPKPPPPP...') }),
    'an ENCLOSED K, which is the one legal use, was wrongly flagged');

  red('centred in the canvas', mutate({ rows: swapRow(10, 'PPPPPPPPPP......') }),
    'a sprite biased six columns to the left was not caught');
  green('centred in the canvas', GOOD, 'a centred sprite was wrongly flagged');
  // One column of asymmetry is unavoidable on an even canvas with an odd-width subject.
  green('centred in the canvas', mutate({ rows: swapRow(10, '...PPPPPPPPPPP..') }),
    'a one-column offset, which an odd-width subject forces, was wrongly flagged');

  red('the overlay corner is reserved', mutate({ rows: swapRow(2, '..PP........PP..') }),
    'ink inside the reserved corner was not caught');
  green('the overlay corner is reserved', mutate({ rows: swapRow(2, '........PP......') }),
    'ink OUTSIDE the corner but in the top rows was wrongly flagged');

  red('frames match the still', mutate({ frames: [GOOD.rows, GOOD.rows.slice(1)] }),
    'a frame with a missing row was not caught');
  red('frames match the still', mutate({ frames: [GOOD.rows, swapRow(4, '...PPPPP...')] }),
    'a frame with a short row was not caught');
  green('frames match the still', GOOD, 'matching frames were wrongly flagged');

  red('animation is present and readable', mutate({ frames: [GOOD.rows, GOOD.rows] }),
    'a two-frame animation was not caught');
  red('animation is present and readable', mutate({ frameMs: 60 }), 'a 60ms frame time was not caught');
  green('animation is present and readable', GOOD, 'a 3-frame 160ms animation was wrongly flagged');

  red('drawn on the accent slot', mutate({ rows: GOOD.rows.map((r) => r.replace(/[EPpq]/g, 'G')) }),
    'a sprite with no accent-slot character was not caught');
  green('drawn on the accent slot', GOOD, 'a sprite drawn on the accent ramp was wrongly flagged');

  console.log(`mobile-pixel-kit selftest ok: ${caught} seeded defects caught, ${ignored} correct shapes ignored`);
}

/* ── THE RUN ─────────────────────────────────────────────────────────────────────────────────── */

/** Detectors that must also hold on every FRAME, not only on the still. */
const FRAME_CHECKS = [
  'exactly 16 rows',
  'every row is exactly 16 characters',
  'only shared palette characters',
  'no K in an outline position',
  'the overlay corner is reserved',
];

async function run() {
  const kit = await import('../src/lib/pixel/sprites-mobile-kit.ts');
  const { compileSprite, compileFrames } = await import('../src/lib/pixel/compile.ts');

  const {
    MOBILE_KIT, MOBILE_KIT_BY_ID, MOBILE_KIT_SPRITES, MOBILE_KIT_SPARES,
    MOBILE_KIT_ACCENTS, MOBILE_KIT_OVERLAYS, ACCENT_SLOT, OVERLAY_REGION, composeScene,
  } = kit;

  const ids = Object.keys(MOBILE_KIT);
  assert.equal(OVERLAY_REGION.w, CORNER, 'the reserved corner moved and this pin still checks the old one');
  assert.equal(OVERLAY_REGION.h, CORNER, 'the reserved corner moved and this pin still checks the old one');

  /*
   * THE CONTRACT, BOTH DIRECTIONS. This is the assertion the whole file is here for.
   *
   * The art and the code that chooses the art are written separately, so the only thing joining
   * them is the id. That came apart once already: the kit shipped 24 correct animated sprites under
   * ids like `mk-growth-curve` while the deriver asked for `growth`, every scene in the product
   * resolved to nothing, and BOTH HALVES LOOKED CORRECT IN ISOLATION. composeScene returns null on
   * a miss and PixelScene renders null on a null sprite, which is the right failure mode and a
   * completely silent one.
   *
   * Set equality, not containment. A missing id blanks every card that asks for it; an extra id is
   * art nobody can reach, which is the same defect pointing the other way and is how a kit silently
   * accumulates orphans. Spares are the ONE sanctioned exception and they live in a named list, not
   * in the registry, so an orphan has to be declared rather than merely tolerated.
   */
  const { ARCHETYPES } = await import('../src/lib/mobile-lesson/archetypes.ts');
  const contract = new Set(ARCHETYPES);
  const have = new Set(ids);
  assert.deepEqual(
    [...contract].filter((k) => !have.has(k)), [],
    'archetypes.ts names these and the kit has no sprite for them, so every card asking for one '
    + 'renders nothing at all',
  );
  assert.deepEqual(
    [...have].filter((k) => !contract.has(k)), [],
    'the kit registers these and archetypes.ts does not name them, so no deriver can ever reach '
    + 'them. Drawn art with no id belongs in MOBILE_KIT_SPARES, not in the registry',
  );

  /*
   * AND THE ROUND TRIP, which set equality alone does not give you.
   *
   * Comparing key sets proves the two LISTS agree. It does not prove the lookup WORKS: a registry
   * entry whose value is undefined still contributes its key to Object.keys, so `growth: undefined`
   * passes set equality and blanks every growth card. Nor does it survive a deleted definition,
   * which is how this file lost two sprites to a concurrent write while their references stayed
   * behind. This drives the exact call PixelScene makes, for every id the deriver can emit, and is
   * the assertion that goes red for BOTH failures.
   */
  const unresolved = ARCHETYPES.filter((id) => !composeScene({ archetype: id }));
  assert.deepEqual(
    unresolved, [],
    'these archetypes do not resolve through composeScene, so PixelScene renders nothing for every '
    + 'card that asks for one. A key can be present and still resolve to nothing',
  );

  /* The two shapes of the same table must not drift apart. */
  assert.equal(MOBILE_KIT_BY_ID, MOBILE_KIT, 'MOBILE_KIT_BY_ID must BE the registry, not a copy of it');
  assert.deepEqual(
    MOBILE_KIT_SPRITES.length, ids.length,
    'MOBILE_KIT_SPRITES and the registry disagree on how many sprites there are',
  );

  /*
   * THE CONSUMER THAT WOULD BREAK SILENTLY. mobile-deck-audit.mjs builds its known-id set from
   * Object.keys(kit.MOBILE_KIT). That is correct while MOBILE_KIT is the keyed object and becomes
   * "0".."23" the moment anyone makes it the array, at which point that audit reports every scene
   * in the product as having no art. Renaming is fine; renaming without the other half is not, so
   * the two are pinned together rather than left to be noticed.
   */
  const auditSrc = readFileSync(new URL('./mobile-deck-audit.mjs', import.meta.url), 'utf8');
  if (/Object\.keys\(\s*kit\.MOBILE_KIT\s*(?:\?\?|\))/.test(auditSrc)) {
    assert.ok(
      !Array.isArray(MOBILE_KIT),
      'MOBILE_KIT is now an array, but mobile-deck-audit.mjs still does Object.keys(kit.MOBILE_KIT), '
      + 'which would give it "0".."23" and make it report every scene in the product as missing art. '
      + 'Point that line at MOBILE_KIT_BY_ID in the same commit.',
    );
  }

  const failures = [];
  const note = (where, d, detail) => failures.push({ where, name: d.name, detail, why: d.why });

  /* 1. Every archetype, every detector, on the still and on every frame. Spares are checked with
   *    the rest: art that is exported but unregistered is still art, and unchecked art inside a
   *    checked file is exactly how a broken sprite survives a green build. */
  let frames = 0;
  const everySprite = [
    ...Object.entries(MOBILE_KIT),
    ...MOBILE_KIT_SPARES.map((s) => [`${s.id} (spare)`, s]),
  ];
  for (const [id, sprite] of everySprite) {
    for (const d of DETECTORS) for (const detail of d.test(sprite)) note(id, d, detail);
    for (const [i, f] of (sprite.frames ?? []).entries()) {
      frames++;
      for (const name of FRAME_CHECKS) {
        const d = DETECTORS.find((x) => x.name === name);
        for (const detail of d.test({ id, rows: f })) note(`${id} frame ${i}`, d, detail);
      }
    }
  }

  /* 2. The compiler is the last word. It is what actually runs on the device, and it validates
   *    things this pin does not (per-frame row counts against the still, unknown characters against
   *    a sprite's OWN palette override). Both canvases, because light mode is a second palette. */
  for (const [id, sprite] of Object.entries(MOBILE_KIT)) {
    for (const canvas of ['dark', 'light']) {
      try {
        compileSprite(sprite, canvas);
        compileFrames(sprite, canvas);
      } catch (err) {
        failures.push({ where: id, name: 'compileSprite', detail: `${canvas}: ${err.message}`, why: 'the renderer cannot draw it' });
      }
    }
  }

  /* 3. The accent table. A single-pass substitution is only correct while every target set is
   *    disjoint from the source set; if a future accent reused P the pass would have to become
   *    simultaneous, and the failure would be a sprite that is quietly the wrong two colours. */
  const slot = new Set(ACCENT_SLOT);
  for (const accent of MOBILE_KIT_ACCENTS) {
    if (accent === 'orchid') continue;
    const sample = composeScene({ archetype: ids[0], accent });
    const chars = new Set([...sample.rows.join('')].filter((c) => c !== '.'));
    const leaked = [...chars].filter((c) => slot.has(c));
    assert.deepEqual(
      leaked, [],
      `accent "${accent}" leaves ${leaked.join(', ')} from the accent slot in the art, so its ramp `
      + 'overlaps the source set and the substitution is no longer a single pass',
    );
  }

  /* 4. The overlay marks, at their own 6x6 geometry. */
  for (const overlay of MOBILE_KIT_OVERLAYS) {
    const composed = composeScene({ archetype: ids[0], overlay });
    assert.ok(composed, `overlay "${overlay}" produced no sprite`);
  }

  /* 5. THE CROSS PRODUCT, which is the reason this file exists. Nobody is eyeballing 24 x 8 x 12
   *    and the whole promise of the kit is that any cell of that grid is renderable. */
  let composedCount = 0;
  for (const archetype of ids) {
    for (const accent of MOBILE_KIT_ACCENTS) {
      for (const overlay of MOBILE_KIT_OVERLAYS) {
        const s = composeScene({ archetype, accent, overlay });
        composedCount++;
        const where = `${archetype}/${accent}/${overlay}`;
        for (const name of COMPOSED_CHECKS) {
          const d = DETECTORS.find((x) => x.name === name);
          for (const detail of d.test(s)) note(where, d, detail);
          for (const f of s.frames ?? []) {
            for (const detail of d.test({ id: s.id, rows: f })) note(`${where} frame`, d, detail);
          }
        }
        try {
          compileSprite(s, 'dark');
          compileFrames(s, 'dark');
        } catch (err) {
          failures.push({ where, name: 'compileSprite', detail: err.message, why: 'the renderer cannot draw it' });
        }
      }
    }
  }

  /* 6. Degradation. The rest of the pixel system renders nothing rather than the wrong picture. */
  assert.equal(composeScene({ archetype: 'no-such-archetype' }), null,
    'an unknown archetype must return null so the card renders nothing, not a wrong picture');
  assert.ok(composeScene({ archetype: ids[0], accent: 'chartreuse' }),
    'an unknown ACCENT must still return art: a card with the right picture and the wrong tint is usable');
  assert.ok(composeScene({ archetype: ids[0], overlay: 'nonsense' }),
    'an unknown OVERLAY must still return art, for the same reason');
  assert.equal(composeScene({ archetype: ids[0] }), MOBILE_KIT[ids[0]],
    'an unaccented, unmarked scene must be the archetype object itself, or every card allocates a copy');
  assert.equal(
    composeScene({ archetype: ids[0], accent: 'gold', overlay: 'up' }),
    composeScene({ archetype: ids[0], accent: 'gold', overlay: 'up' }),
    'the same spec must return the SAME object: PixelSpriteView memoises on identity and compile.ts '
    + 'caches its mesh in a WeakMap keyed by it, so a fresh object per render defeats both',
  );

  if (failures.length) {
    console.error(`mobile-pixel-kit-pin: ${failures.length} violation(s)\n`);
    for (const f of failures.slice(0, 40)) {
      console.error(`  ${f.where}\n    ${f.name}: ${f.detail}\n    why: ${f.why}\n`);
    }
    if (failures.length > 40) console.error(`  ...and ${failures.length - 40} more`);
    process.exit(1);
  }

  console.log(
    `mobile-pixel-kit-pin: OK. ${ids.length} archetypes matching archetypes.ts exactly, `
    + `${MOBILE_KIT_SPARES.length} spare(s), both canvases, ${frames} frames, `
    + `${DETECTORS.length} detectors, ${composedCount} accent/overlay variants compiled.`,
  );
}

const palette = await import('../src/lib/pixel/palette.ts');
LEGAL = new Set([...Object.keys(palette.EUPHORIA_PIXEL_PALETTE), palette.TRANSPARENT]);

if (process.argv.includes('--selftest')) {
  selftest();
} else {
  await run();
}
