#!/usr/bin/env node
/**
 * Pins the in-lesson combo rules (src/lib/combo.ts). A retry never scores (owner decision 4), so
 * the combo must break on a first-try miss even if the retry lands; Back/forward re-grading the
 * same screen must not double count; the chime rate is capped; "perfect" needs 3+ graded.
 */
import assert from 'node:assert/strict';

const { comboAt, bestCombo, accuracy, isPerfect, comboRate } = await import('../src/lib/combo.ts');

assert.equal(comboAt({ 0: true, 1: true, 2: true }, 2), 3, 'three first-try corrects = 3 in a row');
assert.equal(comboAt({ 0: true, 1: false, 2: true }, 2), 1, 'a first-try miss breaks the run');
assert.equal(comboAt({ 0: true, 1: true, 2: false }, 2), 0, 'a miss at idx means no combo there');
assert.equal(comboAt({ 0: true, 2: true, 5: true }, 5), 3, 'ungraded screens between do not break it');
assert.equal(bestCombo({ 0: true, 1: true, 2: false, 3: true, 4: true, 5: true }), 3);
assert.equal(accuracy({}), null, 'nothing graded = no accuracy');
assert.equal(accuracy({ 0: true, 1: false }), 0.5);
assert.equal(isPerfect({ 0: true, 1: true }), false, 'perfect needs at least 3 graded');
assert.equal(isPerfect({ 0: true, 1: true, 2: true }), true);
assert.equal(comboRate(3), 1);
assert.equal(comboRate(50), 1.3, 'chime rate is capped');
console.log('combo-pin: ok');
