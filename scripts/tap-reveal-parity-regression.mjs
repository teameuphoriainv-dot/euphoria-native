import assert from 'node:assert/strict';
import fs from 'node:fs';

const component = fs.readFileSync(new URL('../src/components/tap-reveal.tsx', import.meta.url), 'utf8');
const lesson = fs.readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8');

// THE FLIP STAYS BANNED (decided 2026-09-22, plan item A4). This pin and a rotateY card flip landed
// together in e25ed9c, so it was red from its first commit and nobody saw, because no npm script
// runs it. The commit message is about the parity harness and never mentions the flip; c499b09
// records a 3D flip as "considered and REJECTED by the owner"; the web reveal it mirrors
// (euphoriaweb StepRenderer) swaps content with opacity + y:8 and never rotates. So the component
// was wrong, not this line: the flip was removed and this assertion is unchanged.
assert.doesNotMatch(component, /CARD_TINTS|rotateY|Tap to flip|✦ TAP TO REVEAL/, 'native-only flip styling must not replace the canonical reveal');
// Reduced motion must still REVEAL. The answer is the content, not decoration: every animated face
// has to jump to its end state instead of skipping the change. Two guards, one per face.
assert.equal((component.match(/useReducedMotion\(\)/g) || []).length, 2, 'both the card faces and the revealed content must read useReducedMotion');
assert.match(component, /if \(reduced\) t\.set\(isOpen \? 1 : 0\)/, 'reduced motion must still switch faces, just without interpolating');
// Literal OR its EXACT token equivalent. A pin that greps for a number fails a correct
// refactor and passes a broken one that keeps the digits — which is what happened on
// 2026-09-20 when a sweep moved these onto tokens.ts. The alternative is not "match
// anything": each alternation names ONE token, so swapping in a different duration still
// fails, which is how the 500 -> Duration.screen (460) regression was caught.
assert.match(component, /duration:\s*(?:280|Duration\.base)/, 'revealed content must use the canonical 280ms entrance');
assert.match(component, /translateY/, 'revealed content must rise eight points while fading in');
assert.match(component, /Tap to reveal/, 'closed cards must use canonical copy');
assert.match(component, /minHeight: 210/, 'cards must use canonical phone minimum height');
assert.match(component, /fontSize: 36/, 'authored stats must retain canonical hierarchy');
assert.match(component, /onComplete: \(correct: boolean\) => void/, 'tap reveal must own the canonical Continue action');
assert.match(lesson, /'progressiveCalc', 'calc', 'reveal'/, 'tap reveal must own its CTA instead of stacking the fixed footer');

console.log('tap reveal parity ok');
