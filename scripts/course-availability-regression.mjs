import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.__DEV__ = false;

const { AVAILABLE_COURSES, AVAILABLE_LESSON_COUNT, COURSES, isCourseAvailable } = await import('../src/lib/curriculum/index.ts');
const { EMPTY_PROFILE, recommendPath } = await import('../src/lib/onboarding-path.ts');

const comingSoon = COURSES.filter((course) => !isCourseAvailable(course.id));
assert.deepEqual(
  comingSoon.map((course) => course.id),
  ['alternative-investments', 'wealth-management'],
  'only the two web-unreleased courses may be coming soon',
);
assert.equal(AVAILABLE_COURSES.length, 10, 'native must expose ten released courses');
assert.equal(AVAILABLE_LESSON_COUNT, 250, 'native must advertise only released lessons');
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
assert.match(store, /version:\s*4/, 'persisted course selections need the v4 migration');
assert.match(store, /if \(isCourseAvailable\(id\)\) set\(\{ activeCourseId: id \}\)/, 'the store must reject unreleased course selection');

for (const path of [
  '../src/app/courses.tsx',
  '../src/app/(tabs)/learn.tsx',
  '../src/app/(tabs)/home.tsx',
]) {
  assert.match(source(path), /isCourseAvailable/, `${path} must render release availability`);
}

console.log('course availability regression: 10 available, 2 coming soon, selection guarded');
