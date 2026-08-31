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
assert.match(store, /version:\s*ONBOARDING_REPLAY_STORE_VERSION/, 'the store must use the replay-safe v5 migration');
assert.match(store, /if \(isCourseAvailable\(id\)\) set\(\{ activeCourseId: id \}\)/, 'the store must reject unreleased course selection');

for (const path of [
  '../src/app/courses.tsx',
  '../src/app/(tabs)/learn.tsx',
  '../src/app/(tabs)/home.tsx',
]) {
  assert.match(source(path), /isCourseAvailable/, `${path} must render release availability`);
}

console.log('course availability regression: 12 available, 300 lessons, unknown selection guarded');
