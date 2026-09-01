import assert from 'node:assert/strict';
import fs from 'node:fs';

const component = fs.readFileSync(new URL('../src/components/calc-blanks.tsx', import.meta.url), 'utf8');
const lesson = fs.readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8');

assert.match(component, /onComplete: \(correct: boolean\) => void/, 'calculator must report the web completion result');
assert.match(component, /placeholder="0"/, 'calculator inputs must use the web numeric placeholder');
assert.match(component, /editable=\{!checked\}/, 'calculator inputs must lock after Check Answers');
assert.match(component, /Check Answers/, 'calculator must use the canonical web CTA copy');
assert.match(component, /All values correct!/, 'calculator must show the canonical success summary');
assert.match(component, /of \$\{spec\.blanks\.length\} correct/, 'calculator must show the canonical partial-score summary');
assert.match(component, /setTimeout\(\(\) => onComplete\(allCorrect\), 1400\)/, 'calculator must match the web completion delay');
assert.match(lesson, /norm\?\.kind === 'calc'/, 'calculator must be treated as self-advancing');
assert.match(lesson, /'progressiveCalc', 'calc'/, 'calculator must own its CTA instead of stacking the lesson footer');

console.log('calculator parity ok');
