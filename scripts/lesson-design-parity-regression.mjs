#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const lesson = readFileSync('src/app/lesson.tsx', 'utf8');
const tokens = readFileSync('src/constants/lesson-design.ts', 'utf8');
const feedback = readFileSync('src/components/lesson-feedback.tsx', 'utf8');
const prose = readFileSync('src/components/lesson-prose.tsx', 'utf8');
const pressable = readFileSync('src/shared/motion/spring-pressable.tsx', 'utf8');
const warmup = readFileSync('src/components/lesson-warmup.tsx', 'utf8');
const reveal = readFileSync('src/components/tap-reveal.tsx', 'utf8');
const matching = readFileSync('src/components/matching-pairs.tsx', 'utf8');
const atlasSheet = readFileSync('src/components/lesson-atlas-sheet.tsx', 'utf8');
const graph = readFileSync('src/components/interactive-graph.tsx', 'utf8');
const failures = [];

function requires(source, pattern, message) {
  if (!pattern.test(source)) failures.push(message);
}

function forbids(source, pattern, message) {
  if (pattern.test(source)) failures.push(message);
}

console.log('\nCanonical web lesson design parity\n');

for (const [name, value] of Object.entries({
  text: '#F4F4F5',
  mutedForeground: '#6F6F7B',
  background: '#09090B',
  card: '#101014',
  border: '#1C1C22',
  primary: '#A650E7',
  accent: '#BA66EA',
  ctaDepth: '#811CCE',
})) {
  requires(tokens, new RegExp(`${name}: '${value}'`), `lesson token ${name} must remain ${value}`);
}

requires(tokens, /display: \{ fontFamily: Fonts\.black, fontSize: 30, lineHeight: 36, letterSpacing: -0\.75 \}/, 'web lesson h1 must remain DM Sans Black 30/36 with -0.75 tracking');
requires(tokens, /title: \{ fontFamily: Fonts\.black, fontSize: 24, lineHeight: 32 \}/, 'web lesson h2 must remain DM Sans Black 24/32');
requires(tokens, /body: \{ fontFamily: Fonts\.body, fontSize: 16, lineHeight: 26 \}/, 'web lesson body must remain DM Sans 16/26');

requires(lesson, /header: \{ height: 56,[^}]*gap: 12,[^}]*paddingHorizontal: 16/, 'lesson header must remain the web 56/12/16 geometry');
requires(lesson, /close: \{ width: 40, height: 40, borderRadius: 20/, 'Close and Back targets must remain 40px circles');
requires(lesson, /<LessonProgress percent=\{progressPercent\}/, 'header must use the animated gradient progress component');
requires(lesson, /duration: 400/, 'progress must retain the web 400ms transition');
requires(lesson, /styles\.stepLabel[\s\S]*?\{stepLabel\}/, 'header must retain its textual current/total identity');
requires(lesson, /body: \{ flex: 1, paddingHorizontal: 16, paddingTop: 32,/, 'viewer content must retain the web mobile 16px gutter and 32px top rhythm');
requires(lesson, /option: \{ minHeight: 64,[^}]*paddingHorizontal: 20, paddingVertical: 20, borderRadius: 12, borderWidth: 1 \}/, 'quick-check options must retain web geometry');
requires(lesson, /optionText: \{ flex: 1, fontSize: 17, lineHeight: 24 \}/, 'quick-check option text must remain 17px');
requires(lesson, /eliminated: \{ opacity: 0\.3, transform: \[\{ scale: 0\.95 \}\] \}/, 'hint elimination must preserve web opacity and scale');

requires(lesson, /<AmbientBackground starCount=\{40\} \/>/, 'lesson must retain the quiet pre-regression ambient background');
requires(lesson, /import \{ AmbientBackground \}/, 'lesson must import the verified native ambient background');
forbids(lesson, /<LessonBackground/, 'the broken stretched-orb lesson background must not be mounted');
requires(feedback, /const tint = correct \? theme\.success : theme\.destructive/, 'feedback must keep semantic green/red treatment');
requires(prose, /b\.leftVisual \? <LessonVisual visual=\{b\.leftVisual\}/, 'stakes without visual must stay inside its red panel');
requires(prose, /b\.rightVisual \? <LessonVisual visual=\{b\.rightVisual\}/, 'stakes with visual must stay inside its green panel');
requires(pressable, /useReducedMotion\(\)[\s\S]*?scale\.set\(reduced \? 1 : withSpring/, 'lesson tap feedback must honor Reduced Motion');
requires(pressable, /stiffness: 420, damping: 32, mass: 1/, 'lesson press feedback must retain the canonical snappy spring');
requires(warmup, /buildRecallQuiz/, 'lesson warmup must draw from completed-lesson recall');
requires(warmup, /PixelSpriteView sprite=\{flameSprite\} scale=\{9\} play="loop"/, 'lesson warmup must retain the canonical 144px pixel flame');
requires(warmup, /First, a quick check on what you have already covered\./, 'lesson warmup must retain production recall copy');
requires(reveal, /duration: 400[\s\S]*?rotateY/, 'tap-reveal cards must retain the web 400ms Y-axis flip');
requires(reveal, /faces: \{ height: 280 \}/, 'tap-reveal cards must retain the web mobile 280px height');
requires(matching, /cols: \{ flexDirection: 'column'/, 'matching pairs must stack their two columns on phones');
requires(matching, /height: 90,[^}]*borderRadius: 12/, 'matching cells must retain the web 90px/r12 geometry');
requires(atlasSheet, /height: '72%'/, 'Atlas tutor must retain the web mobile 72vh composition');
requires(atlasSheet, /surface: '#14121C'[\s\S]*?border: '#1C1C22'/, 'Atlas tutor must retain its canonical web surface and border');
requires(graph, /COMPOUND_CURVE_MS = 250/, 'compound growth curve must retain the web 250ms tween');

if (failures.length) {
  console.error('FAILED\n');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('PASS — lesson palette, typography, chrome, feedback, motion, and stakes composition match their web contracts.\n');
