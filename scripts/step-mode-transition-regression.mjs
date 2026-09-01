#!/usr/bin/env node
import { strictEqual, match } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const { shouldAnnouncePractice } = await import(pathToFileURL(join(ROOT, 'src/lib/step-mode-transition.ts')).href);

strictEqual(shouldAnnouncePractice({ type: 'teachingSlide' }, { type: 'microCheck' }), true);
strictEqual(shouldAnnouncePractice({ type: 'interactiveGraph' }, { type: 'quiz' }), true);
strictEqual(shouldAnnouncePractice({ type: 'microCheck' }, { type: 'quiz' }), false);
strictEqual(shouldAnnouncePractice({ type: 'quiz' }, { type: 'teachingSlide' }), false);
strictEqual(shouldAnnouncePractice(undefined, { type: 'quiz' }), false);

const component = await readFile(join(ROOT, 'src/components/step-mode-transition.tsx'), 'utf8');
const runner = await readFile(join(ROOT, 'src/app/lesson.tsx'), 'utf8');
match(component, /2200/, 'practice transition must keep the web 2.2 second beat');
match(component, /expression="silly"/, 'practice transition lost Atlas silly expression');
match(component, /Now quiz yourself/, 'practice transition copy drifted');
match(component, /-320/, 'practice transition lost the full spin-in');
match(component, /accessibilityLabel="Skip to the question"/, 'practice transition is not skippable');
match(runner, /shouldAnnouncePractice\(steps\[idx - 1\], steps\[idx\]\)/, 'runner does not detect the reading-to-practice edge');
match(runner, /<StepModeTransition visible=\{announcePractice\}/, 'runner does not render the transition above the arriving question');

console.log('step mode transition regression: PASS — web reading→practice choreography');
