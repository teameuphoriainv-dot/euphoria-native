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
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/curriculum-semantic-parity.mjs --ref origin/master
 */
import { deepStrictEqual } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const nativeRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
let webRef = '';
if (args[0] === '--ref') {
  if (!args[1]) throw new Error('--ref requires a git ref');
  webRef = args.splice(0, 2)[1];
}

const webRoot = resolve(args[0] ?? join(homedir(), 'euphoriaweb-current'));
let sourceRoot = webRoot;

if (webRef) {
  const sourceSnapshot = mkdtempSync(join(tmpdir(), 'euphoria-web-curriculum-'));
  process.once('exit', () => rmSync(sourceSnapshot, { recursive: true, force: true }));
  const archive = execFileSync('git', ['-C', webRoot, 'archive', webRef, 'src/features/pathway'], {
    maxBuffer: 64 * 1024 * 1024,
  });
  execFileSync('tar', ['-x', '-C', sourceSnapshot], {
    input: archive,
    maxBuffer: 64 * 1024 * 1024,
  });
  sourceRoot = sourceSnapshot;
}

const webIndexPath = join(sourceRoot, 'src/features/pathway/courseIndex.ts');
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
console.log(`  source: ${webRoot}${webRef ? `@${webRef}` : ' (working tree)'}\n`);

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
