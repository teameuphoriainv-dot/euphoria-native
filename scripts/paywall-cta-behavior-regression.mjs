import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Exercise the actual JSX handler expression, not a duplicate routing rule or a
// regular expression that can accidentally match comments/unrelated controls.
function handlerExpression(source) {
  const file = ts.createSourceFile('onboarding.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const matches = [];
  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(file) === 'SlabButton') {
      const attrs = node.attributes.properties.filter(ts.isJsxAttribute);
      const label = attrs.find(a => a.name.getText(file) === 'label');
      if (label?.initializer?.getText(file).includes('Start my')) {
        const press = attrs.find(a => a.name.getText(file) === 'onPress');
        assert.ok(press?.initializer && ts.isJsxExpression(press.initializer));
        matches.push(press.initializer.expression.getText(file));
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  assert.equal(matches.length, 1, 'Exactly one subscription CTA must be located');
  return matches[0];
}

function exercise(expression, { atPaywall, isProNow, offersTrial }) {
  const calls = [];
  const context = {
    step: atPaywall ? 14 : 3, PAYWALL_INDEX: 14, isProNow, offersTrial,
    next: () => calls.push('next'),
    buyPro: () => calls.push('purchase'),
    router: { replace: route => calls.push(`route:${route}`) },
  };
  runInNewContext(`(${expression})()`, context, { timeout: 1000 });
  return calls;
}

const current = handlerExpression(readFileSync(new URL('../src/app/onboarding.tsx', import.meta.url), 'utf8'));
let count = 0;
for (const atPaywall of [false, true]) {
  for (const isProNow of [false, true]) {
    for (const offersTrial of [false, true]) {
      const expected = !atPaywall ? 'next' : isProNow ? 'route:/home' : 'purchase';
      assert.deepEqual(exercise(current, { atPaywall, isProNow, offersTrial }), [expected]);
      count++;
    }
  }
}

// Negative control: the exact source commit used for rejected production build 24.
// This must demonstrate the bug, so this check cannot pass by merely finding a CTA.
const rejected = handlerExpression(execFileSync('git', ['show', '79b3490b9c388a323272e01f312677cd7d90322d:src/app/onboarding.tsx'], {
  cwd: new URL('..', import.meta.url), encoding: 'utf8',
}));
assert.deepEqual(exercise(rejected, { atPaywall: true, isProNow: false, offersTrial: true }), ['next']);
assert.notDeepEqual(exercise(rejected, { atPaywall: true, isProNow: false, offersTrial: true }), ['purchase']);
console.log(`PASS: ${count} actual CTA routing cases; rejected build 24 reproduced as a negative control.`);
