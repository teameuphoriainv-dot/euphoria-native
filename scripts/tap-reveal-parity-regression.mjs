import assert from 'node:assert/strict';
import fs from 'node:fs';

const component = fs.readFileSync(new URL('../src/components/tap-reveal.tsx', import.meta.url), 'utf8');
const lesson = fs.readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8');

assert.doesNotMatch(component, /CARD_TINTS|rotateY|Tap to flip|✦ TAP TO REVEAL/, 'native-only flip styling must not replace the canonical reveal');
assert.match(component, /duration: 280/, 'revealed content must use the canonical 280ms entrance');
assert.match(component, /translateY/, 'revealed content must rise eight points while fading in');
assert.match(component, /Tap to reveal/, 'closed cards must use canonical copy');
assert.match(component, /minHeight: 210/, 'cards must use canonical phone minimum height');
assert.match(component, /fontSize: 36/, 'authored stats must retain canonical hierarchy');
assert.match(component, /onComplete: \(correct: boolean\) => void/, 'tap reveal must own the canonical Continue action');
assert.match(lesson, /'progressiveCalc', 'calc', 'reveal'/, 'tap reveal must own its CTA instead of stacking the fixed footer');

console.log('tap reveal parity ok');
