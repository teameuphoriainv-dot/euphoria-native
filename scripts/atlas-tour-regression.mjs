#!/usr/bin/env node
/**
 * The Atlas app tour, checked against the app it describes.
 *
 * Five things can go wrong with a walkthrough, and four of them are invisible on a developer's
 * simulator because the developer has already seen it:
 *
 *   1. IT RUNS TWICE. A once-per-install beat that re-fires is the single most annoying defect a
 *      first-run flow can have, and it only shows up on a device that has been through onboarding.
 *   2. IT RUNS FOR SOMEONE WHO IS NOT NEW. This app is live on the App Store, so a flag defaulting
 *      the wrong way plays a new-user walkthrough to every existing member on the next update.
 *   3. SKIPPING DOES NOT STICK. Skip is a decision, not a deferral.
 *   4. A BEAT POINTS AT A ROUTE THAT IS NOT THERE. The tour navigates, so a stale route string is a
 *      dead beat rather than a compile error.
 *   5. THE COPY DRIFTS. Atlas is the app's voice: a line that outgrows its bubble, or shrinks to a
 *      fragment, stops teaching.
 *
 * Runs against the REAL module, never a reimplementation of it:
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/atlas-tour-regression.mjs
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/atlas-tour-regression.mjs --selftest
 *
 * --selftest proves each detector below can go red, by running it against a deliberately broken
 * input. A checker nobody has watched fail is a checker nobody knows works.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_APP = join(ROOT, 'src', 'app');

const {
  ATLAS_TOUR_BEATS,
  ATLAS_TOUR_DEFAULT,
  ATLAS_TOUR_FIELD,
  ATLAS_TOUR_LINE_MAX,
  ATLAS_TOUR_LINE_MIN,
  ATLAS_TOUR_TABS,
  atlasTourBeatAt,
  atlasTourTabIndex,
  isAtlasTourPathname,
  isLastAtlasTourBeat,
  nextAtlasTourState,
  shouldShowAtlasTour,
} = await import('../src/lib/atlas-tour.ts');

/* ── DETECTORS ────────────────────────────────────────────────────────────────────────────────
 * Each is a pure function of its input and returns a list of complaints, so --selftest can feed
 * each one a broken input and assert it complains. Nothing here reads a file: the file reading
 * happens once, at the bottom, and is handed in.
 */

/** A route string like '/(tabs)/home' must resolve to a real file under src/app. */
function routeFile(route) {
  const relative = route.replace(/^\//, '');
  for (const candidate of [`${relative}.tsx`, `${relative}.ts`, join(relative, 'index.tsx')]) {
    const path = join(SRC_APP, candidate);
    if (existsSync(path)) return path;
  }
  return null;
}

function checkRoutes(beats) {
  return beats.filter((b) => routeFile(b.route) === null).map((b) => `beat '${b.id}' routes to ${b.route}, which has no file under src/app/`);
}

function checkCopy(beats) {
  const bad = [];
  for (const b of beats) {
    const line = b.line;
    if (line.length < ATLAS_TOUR_LINE_MIN) bad.push(`beat '${b.id}' is ${String(line.length)} chars, under the ${String(ATLAS_TOUR_LINE_MIN)} floor`);
    if (line.length > ATLAS_TOUR_LINE_MAX) bad.push(`beat '${b.id}' is ${String(line.length)} chars, over the ${String(ATLAS_TOUR_LINE_MAX)} ceiling`);
    // Global copy rule for this user, and em-dash-prose-pin only scans src/**, so a beat is the
    // one place a dash could slip past both checks if the copy ever moved to a data file.
    if (/[–—]/.test(line)) bad.push(`beat '${b.id}' contains an em or en dash`);
    if (!/[.!?]$/.test(line.trim())) bad.push(`beat '${b.id}' does not end in a full stop; Atlas speaks in sentences`);
  }
  return bad;
}

/**
 * NOTHING MAY CLAIM OTHER PEOPLE ARE REAL.
 *
 * src/lib/people.ts states it in its own header: every person in the app is fabricated, and the
 * league screen tells the user so. A tour line about rivals or friends would contradict the one
 * screen that is honest about it, in Atlas's voice, on a live build.
 */
const SOCIAL_CLAIMS = ['rival', 'friend', 'leaderboard', 'other learners', 'compete', 'beat them', 'people'];
function checkNoSocialClaims(beats) {
  const bad = [];
  for (const b of beats) {
    const line = b.line.toLowerCase();
    for (const word of SOCIAL_CLAIMS) {
      if (line.includes(word)) bad.push(`beat '${b.id}' mentions '${word}'; every person in the app is fabricated (see src/lib/people.ts)`);
    }
  }
  return bad;
}

/** The tab list here must be the tab list the navigator declares, in the same order. */
function checkTabsMatchLayout(tabs, layoutSource) {
  const declared = [...layoutSource.matchAll(/<Tabs\.Screen\s+name="([a-z]+)"/g)].map((m) => m[1]);
  if (declared.length === 0) return ['no <Tabs.Screen> found in (tabs)/_layout.tsx; this check has drifted from the code'];
  if (declared.join(',') !== tabs.join(',')) {
    return [`ATLAS_TOUR_TABS is [${tabs.join(', ')}] but the navigator declares [${declared.join(', ')}]; the tab-bar spotlight is derived from the index and would point at the wrong slot`];
  }
  return [];
}

/** The overlay has to be mounted somewhere, and onboarding has to arm it. */
function checkWiring({ layout, onboarding, home, store }) {
  const bad = [];
  if (!/<AtlasTour\s*\/>/.test(layout)) bad.push('(tabs)/_layout.tsx does not render <AtlasTour />; the tour can never appear');
  if (!/armAtlasTour\(\)/.test(onboarding)) bad.push('onboarding.tsx never calls armAtlasTour(); the tour would never fire for a new user');
  if (!/TourAnchor/.test(home)) bad.push('home.tsx does not anchor the next-lesson card; the last beat would have nothing to spotlight');
  if (!new RegExp(`${ATLAS_TOUR_FIELD}:\\s*s\\.${ATLAS_TOUR_FIELD}`).test(store)) {
    bad.push(`store.ts does not persist '${ATLAS_TOUR_FIELD}' in partialize; the tour would replay after every app restart`);
  }
  return bad;
}

/* ── SELFTEST ─────────────────────────────────────────────────────────────────────────────────
 * Every detector, fed something broken, must complain. */
function selftest() {
  const ok = ATLAS_TOUR_BEATS[0];

  assert.ok(checkRoutes([{ ...ok, id: 'x', route: '/(tabs)/not-a-real-tab' }]).length > 0, 'selftest: route checker missed a missing route');
  assert.equal(checkRoutes([ok]).length, 0, 'selftest: route checker flagged a real route');

  assert.ok(checkCopy([{ ...ok, id: 'x', line: 'Too short.' }]).length > 0, 'selftest: copy checker missed a short line');
  assert.ok(checkCopy([{ ...ok, id: 'x', line: `${'a'.repeat(ATLAS_TOUR_LINE_MAX + 1)}.` }]).length > 0, 'selftest: copy checker missed a long line');
  assert.ok(checkCopy([{ ...ok, id: 'x', line: 'This line is long enough to clear the floor, and it uses an em — dash.' }]).length > 0, 'selftest: copy checker missed an em dash');
  assert.ok(checkCopy([{ ...ok, id: 'x', line: 'This line is long enough to clear the floor but stops without a stop' }]).length > 0, 'selftest: copy checker missed a missing full stop');
  assert.equal(checkCopy(ATLAS_TOUR_BEATS).length, 0, 'selftest: copy checker flagged the shipped copy');

  assert.ok(
    checkNoSocialClaims([{ ...ok, id: 'x', line: 'Race your friends up the leaderboard and see how you place this week.' }]).length > 0,
    'selftest: social checker missed a fabricated-people claim',
  );
  assert.equal(checkNoSocialClaims(ATLAS_TOUR_BEATS).length, 0, 'selftest: social checker flagged the shipped copy');

  assert.ok(checkTabsMatchLayout(['home'], '<Tabs.Screen name="home" /><Tabs.Screen name="learn" />').length > 0, 'selftest: tab checker missed a mismatch');
  assert.ok(checkTabsMatchLayout(['home'], 'no tabs here').length > 0, 'selftest: tab checker missed an empty layout');
  assert.equal(checkTabsMatchLayout(['home', 'learn'], '<Tabs.Screen name="home" /><Tabs.Screen name="learn" />').length, 0, 'selftest: tab checker flagged a match');

  assert.equal(isAtlasTourPathname('/lesson'), false, 'selftest: pathname guard let a pushed screen through');
  assert.equal(isAtlasTourPathname('/home'), true, 'selftest: pathname guard rejected a real tab');

  const wired = { layout: '<AtlasTour />', onboarding: 'armAtlasTour()', home: 'TourAnchor', store: `${ATLAS_TOUR_FIELD}: s.${ATLAS_TOUR_FIELD}` };
  assert.equal(checkWiring(wired).length, 0, 'selftest: wiring checker flagged a wired app');
  for (const key of Object.keys(wired)) {
    assert.ok(checkWiring({ ...wired, [key]: '' }).length > 0, `selftest: wiring checker missed an unwired ${key}`);
  }

  console.log('atlas-tour selftest: every detector goes red on a broken input');
}

if (process.argv.includes('--selftest')) {
  selftest();
  process.exit(0);
}

/* ── THE GATE: exactly once, for a new user, and never again ──────────────────────────────── */

const FRESH = { hasHydrated: true, atlasTour: 'armed', onboardingCompletedAt: 1_777_777_777_777 };

assert.equal(shouldShowAtlasTour(FRESH), true, 'a learner who just finished onboarding must get the tour');
assert.equal(
  shouldShowAtlasTour({ ...FRESH, hasHydrated: false }),
  false,
  'deciding before persist rehydrates reads the INITIAL state, not the stored one, and would flash the tour at a returning user',
);
assert.equal(
  shouldShowAtlasTour({ ...FRESH, atlasTour: 'unseen' }),
  false,
  'every install already on the App Store rehydrates with no atlasTour key, which lands on unseen; those users must never be toured',
);
assert.equal(shouldShowAtlasTour({ ...FRESH, atlasTour: 'seen' }), false, 'the tour must never fire twice');
assert.equal(
  shouldShowAtlasTour({ ...FRESH, onboardingCompletedAt: null }),
  false,
  'nothing but finishing onboarding may open this door',
);
assert.equal(ATLAS_TOUR_DEFAULT, 'unseen', 'the default must be the state that shows nothing');

/* The transition table, which is the only thing allowed to move the flag. */
assert.equal(nextAtlasTourState('unseen', 'arm'), 'armed', 'finishing onboarding arms the tour');
assert.equal(nextAtlasTourState('armed', 'arm'), 'armed', 'arming twice is idempotent');
assert.equal(nextAtlasTourState('seen', 'arm'), 'seen', 'replaying onboarding must not replay a tour the user already finished');
assert.equal(nextAtlasTourState('armed', 'seen'), 'seen', 'finishing the tour marks it seen');
assert.equal(nextAtlasTourState('armed', 'seen'), nextAtlasTourState('armed', 'seen'), 'the transition is pure');

/* SKIPPING MARKS IT SEEN. Skip and finish are the same event on purpose: a walkthrough the user
   dismissed and then gets again on the next launch is worse than one they never skipped. */
const afterSkip = nextAtlasTourState('armed', 'seen');
assert.equal(afterSkip, 'seen', 'skipping must mark the tour seen');
assert.equal(
  shouldShowAtlasTour({ ...FRESH, atlasTour: afterSkip }),
  false,
  'a skipped tour must stay skipped, including across a restart, which is why the flag is persisted',
);

/* ── THE BEATS ────────────────────────────────────────────────────────────────────────────── */

assert.ok(ATLAS_TOUR_BEATS.length >= 4 && ATLAS_TOUR_BEATS.length <= 5, `the tour is meant to be quick: expected 4 to 5 beats, found ${String(ATLAS_TOUR_BEATS.length)}`);
assert.equal(new Set(ATLAS_TOUR_BEATS.map((b) => b.id)).size, ATLAS_TOUR_BEATS.length, 'beat ids must be unique; the overlay keys its transition on them');

const routeProblems = checkRoutes(ATLAS_TOUR_BEATS);
assert.deepEqual(routeProblems, [], `a beat points at a route that does not exist:\n  ${routeProblems.join('\n  ')}`);

const copyProblems = checkCopy(ATLAS_TOUR_BEATS);
assert.deepEqual(copyProblems, [], `tour copy is out of bounds:\n  ${copyProblems.join('\n  ')}`);

const socialProblems = checkNoSocialClaims(ATLAS_TOUR_BEATS);
assert.deepEqual(socialProblems, [], `the tour claims something about other people:\n  ${socialProblems.join('\n  ')}`);

for (const beat of ATLAS_TOUR_BEATS) {
  assert.ok(ATLAS_TOUR_TABS.includes(beat.tab), `beat '${beat.id}' names tab '${beat.tab}', which is not a tab`);
  assert.ok(atlasTourTabIndex(beat) >= 0, `beat '${beat.id}' has no tab slot to spotlight`);
  assert.ok(
    beat.highlight.kind === 'tab' || typeof beat.highlight.anchor === 'string',
    `beat '${beat.id}' highlights nothing; every beat must either spotlight its tab or a measured anchor`,
  );
}

/* THE LANDING. A tour that ends on whatever tab it walked to last is a dead end, so the last beat
   must put the user back on Home and point at something specific there. */
const lastBeat = ATLAS_TOUR_BEATS[ATLAS_TOUR_BEATS.length - 1];
assert.equal(lastBeat.tab, 'home', 'the tour must end on Home, not on whichever tab it reached last');
assert.equal(lastBeat.highlight.kind, 'anchor', 'the last beat must spotlight a real element, so "tap it" has something to tap');
assert.ok(isLastAtlasTourBeat(ATLAS_TOUR_BEATS.length - 1), 'isLastAtlasTourBeat must recognise the final index');
assert.ok(!isLastAtlasTourBeat(0), 'the first beat is not the last one');
assert.equal(atlasTourBeatAt(ATLAS_TOUR_BEATS.length), null, 'walking past the end must return null rather than undefined-shaped data');
assert.equal(atlasTourBeatAt(0), ATLAS_TOUR_BEATS[0], 'atlasTourBeatAt must return the beat at the index');

/* THE TOUR NEVER YANKS ANYONE OUT OF A SCREEN THEY OPENED. The tab layout stays mounted under a
   pushed route, so the overlay has to know it is not the thing on screen. */
for (const tab of ATLAS_TOUR_TABS) {
  assert.equal(isAtlasTourPathname(`/${tab}`), true, `the tour must run on /${tab}`);
  assert.equal(isAtlasTourPathname(`/(tabs)/${tab}`), true, `the tour must run on the grouped spelling /(tabs)/${tab}`);
}
for (const pushed of ['/lesson', '/chat', '/you', '/courses', '/digest/some-guide', '/games/term-match', '/onboarding', '/start']) {
  assert.equal(isAtlasTourPathname(pushed), false, `${pushed} is not a tab; the tour must stay dormant there rather than navigate away from it`);
}

/* ── THE WIRING ───────────────────────────────────────────────────────────────────────────── */

const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const layout = read('src', 'app', '(tabs)', '_layout.tsx');

const tabProblems = checkTabsMatchLayout([...ATLAS_TOUR_TABS], layout);
assert.deepEqual(tabProblems, [], tabProblems.join('\n  '));

const wiringProblems = checkWiring({
  layout,
  onboarding: read('src', 'app', 'onboarding.tsx'),
  home: read('src', 'app', '(tabs)', 'home.tsx'),
  store: read('src', 'lib', 'store.ts'),
});
assert.deepEqual(wiringProblems, [], `the tour is not wired up:\n  ${wiringProblems.join('\n  ')}`);

console.log(
  `atlas-tour: ${String(ATLAS_TOUR_BEATS.length)} beats (${ATLAS_TOUR_BEATS.map((b) => b.id).join(' -> ')}), ` +
    'every route real, copy in bounds, no claims about fabricated people, ' +
    'shows once for an armed learner and never for anyone else, skip marks it seen.',
);
