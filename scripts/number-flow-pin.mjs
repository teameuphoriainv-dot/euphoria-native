// number-flow-pin: every rolling number goes through AppNumberFlow.
//
// NumberFlow imported directly clipped digits twice (owner screenshots, 2026-09-24): cut off on the
// right when no fontFamily was given (it measured the system font, drew DM Sans), and cut off
// top/bottom when no lineHeight gave its edge fade room. src/shared/motion/app-number-flow.tsx fixes
// both for every caller, so this pin fails if anything bypasses it, or if the wrapper loses either fix.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';
const WRAPPER = join('src', 'shared', 'motion', 'app-number-flow.tsx');
const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(name) && p !== WRAPPER) {
      if (/from ['"]number-flow-react-native['"]/.test(readFileSync(p, 'utf8'))) {
        problems.push(`${p}: imports number-flow-react-native directly — use AppNumberFlow from @/shared/motion/app-number-flow`);
      }
    }
  }
}
walk(ROOT);

const wrapper = readFileSync(WRAPPER, 'utf8');
if (!/fontFamily:/.test(wrapper)) problems.push(`${WRAPPER}: no longer forces a fontFamily (digits clip on the right)`);
if (!/lineHeight/.test(wrapper) || !/MIN_LINE_RATIO/.test(wrapper)) problems.push(`${WRAPPER}: no longer forces lineHeight headroom (digits clip top/bottom)`);

if (problems.length) {
  console.error(`FAIL number-flow-pin, ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log('number-flow-pin ok — every rolling number goes through AppNumberFlow (font + line-height fixed)');
