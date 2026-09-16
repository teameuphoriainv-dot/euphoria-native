import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.__DEV__ = false;

const { AVAILABLE_COURSES, AVAILABLE_LESSON_COUNT, COURSES, isCourseAvailable } = await import('../src/lib/curriculum/index.ts');
const { EMPTY_PROFILE, recommendPath } = await import('../src/lib/onboarding-path.ts');

const comingSoon = COURSES.filter((course) => !isCourseAvailable(course.id));
assert.deepEqual(comingSoon, [], 'all twelve authored native courses must be available');
assert.equal(AVAILABLE_COURSES.length, 12, 'native must expose all twelve authored courses');
assert.equal(AVAILABLE_LESSON_COUNT, 300, 'native must advertise all authored lessons');
assert.equal(isCourseAvailable('not-a-course'), false, 'unknown course ids must fail closed');

const profiles = [
  EMPTY_PROFILE,
  { ...EMPTY_PROFILE, goal: 'wealth' },
  { ...EMPTY_PROFILE, topics: ['crypto', 'retirement'], experience: 'experienced' },
];
for (const profile of profiles) {
  const path = recommendPath(profile);
  assert.equal(path.length, 3, 'onboarding must still produce a three-course path');
  assert.ok(path.every((course) => isCourseAvailable(course.id)), 'onboarding must not activate a coming-soon course');
}

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const store = source('../src/lib/store.ts');
/*
 * The persisted version must come from the migration module's exported constant, never a literal:
 * a hard-coded number here and a different one there is how a migration silently stops running.
 * It is the LATEST constant, since versions only ever go up — v6 added the paywall-seen backfill.
 * Both migration functions must still be applied, and in that order (see the ordering note in
 * onboarding-replay-migration.ts: v6 keys off a completedAt that v5 may have nulled).
 */
assert.match(store, /version:\s*PAYWALL_SEEN_BACKFILL_STORE_VERSION/,
  'the store must persist the latest migration version, taken from the shared constant');
const replayAt = store.indexOf('replayOnboardingOnUpgrade(next, from)');
const backfillAt = store.indexOf('backfillPaywallSeen(next, from)');
assert.ok(replayAt > 0, 'the v5 onboarding replay migration is no longer applied');
assert.ok(backfillAt > 0, 'the v6 paywall-seen backfill is no longer applied');
assert.ok(replayAt < backfillAt,
  'the backfill must run AFTER the replay, or an install being sent back through the whole flow '
  + 'gets stamped as having already seen the paywall and skips it');
assert.match(store, /if \(isCourseAvailable\(id\)\) set\(\{ activeCourseId: id \}\)/, 'the store must reject unreleased course selection');

for (const path of [
  '../src/app/courses.tsx',
  '../src/app/(tabs)/learn.tsx',
  '../src/app/(tabs)/home.tsx',
]) {
  assert.match(source(path), /isCourseAvailable/, `${path} must render release availability`);
}

console.log('course availability regression: 12 available, 300 lessons, unknown selection guarded');
