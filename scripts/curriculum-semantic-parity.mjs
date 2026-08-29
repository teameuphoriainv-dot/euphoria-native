#!/usr/bin/env node
/**
 * Evaluate the web and native curriculum modules and prove that every authored value is identical.
 *
 * The sync script necessarily rewrites import paths and adds native-only type annotations, so a
 * byte comparison of the TypeScript source cannot answer the actual product question: are the
 * course metadata, lessons, challenges, steps, nested objects, optional properties, and array order
 * exactly the same at runtime? deepStrictEqual can, and intentionally distinguishes a missing
 * property from a property whose value is undefined.
 *
 * Run with Node's TypeScript resolver hook:
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/curriculum-semantic-parity.mjs
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/curriculum-semantic-parity.mjs /path/to/web
 */
import { deepStrictEqual } from 'node:assert';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const nativeRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = resolve(process.argv[2] ?? join(homedir(), 'euphoriaweb-current'));
const webIndexPath = join(webRoot, 'src/features/pathway/courseIndex.ts');
const nativeIndexPath = join(nativeRoot, 'src/lib/curriculum/courseIndex.ts');

if (!existsSync(webIndexPath)) {
  console.error(`Web curriculum entry point not found: ${webIndexPath}`);
  process.exit(1);
}

const [web, native] = await Promise.all([
  import(pathToFileURL(webIndexPath).href),
  import(pathToFileURL(nativeIndexPath).href),
]);

try {
  deepStrictEqual(native.COURSES, web.COURSES);
} catch (error) {
  console.error('Course metadata or ordering differs between web and native.');
  throw error;
}

const corpusWeb = createHash('sha256');
const corpusNative = createHash('sha256');
let lessonTotal = 0;
let stepTotal = 0;
let challengeTotal = 0;

console.log('\nCurriculum semantic parity\n');

for (const course of web.COURSES) {
  const [webLessons, nativeLessons] = await Promise.all([
    web.loadCourseLessons(course.id),
    native.loadCourseLessons(course.id),
  ]);

  try {
    deepStrictEqual(nativeLessons, webLessons);
  } catch (error) {
    console.error(`Runtime lesson data differs for course: ${course.id}`);
    throw error;
  }

  const webJson = JSON.stringify([course, webLessons]);
  const nativeJson = JSON.stringify([course, nativeLessons]);
  const courseHash = createHash('sha256').update(webJson).digest('hex').slice(0, 12);
  corpusWeb.update(webJson);
  corpusNative.update(nativeJson);

  const steps = webLessons.reduce((sum, lesson) => sum + lesson.steps.length, 0);
  const challenges = webLessons.reduce((sum, lesson) => sum + lesson.challenge.length, 0);
  lessonTotal += webLessons.length;
  stepTotal += steps;
  challengeTotal += challenges;

  console.log(
    `  ${course.id.padEnd(24)} ${String(webLessons.length).padStart(2)} lessons  ` +
      `${String(steps).padStart(4)} steps  ${String(challenges).padStart(3)} challenges  ${courseHash}`,
  );
}

const webHash = corpusWeb.digest('hex');
const nativeHash = corpusNative.digest('hex');
deepStrictEqual(nativeHash, webHash);

console.log('');
console.log(`PASS — ${web.COURSES.length} courses / ${lessonTotal} lessons / ${stepTotal} steps / ${challengeTotal} challenges`);
console.log('Every runtime value and array order is deepStrictEqual between web and native.');
console.log(`SHA-256: ${webHash}`);
