/**
 * Keep the plan cards and purchase action in one compact scroll flow.
 *
 * A flex-growing paywall body consumed the spare viewport height and left a large dead band
 * between Monthly and the CTA. The footer already follows the body in the same ScrollView, so
 * neither side may grow or use a spacer to distribute unused height between those controls.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/app/onboarding.tsx', import.meta.url), 'utf8');
const styles = src.match(/const styles = StyleSheet\.create\(\{([\s\S]*?)\n\}\);/);
assert.ok(styles, 'onboarding StyleSheet not found');

const paywallBody = styles[1].match(/paywallBody:\s*\{([^}]*)\}/);
assert.ok(paywallBody, 'paywallBody style not found');
assert.doesNotMatch(
  paywallBody[1],
  /\b(?:flex|flexGrow|flexBasis|justifyContent)\b/,
  'paywallBody must stay content-sized; flexible layout recreates the gap above the CTA',
);

assert.match(
  src,
  /<Animated\.View[\s\S]*?\{renderStep === PAYWALL_INDEX && !isLoader \? actionFooter : null\}[\s\S]*?<\/ScrollView>/,
  'the paywall action must directly follow the body inside the same ScrollView',
);

console.log('PASS - paywall body is content-sized and the CTA directly follows it.');
