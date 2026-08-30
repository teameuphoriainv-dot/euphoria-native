#!/usr/bin/env node
// ============================================================================
// Pins the API trust boundary.
//
//   node scripts/api-validation-regression.mjs
//
// WHY. Every value checked here ends up inside an upstream URL that carries one
// of our paid keys. The failure is silent by construction: a crafted `sym` does
// not error, it returns a 200 full of somebody else's data bought with our quota,
// and a `#` in a symbol does not throw, it just makes every call a 401 forever.
//
// Neither shows up on a screen, which is why this is a script and not a manual
// check. C113: a green gate means the things it checks are fine.
//
// Imports the REAL validators rather than restating the regexes — a second copy
// of a security predicate is worse than none, because it passes review while
// disagreeing with the code that runs.
// ============================================================================

import { isoDate, mayCarryKey, symbol, withKey } from '../src/lib/server/validate.ts';

const fail = [];
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
};

console.log('\nAPI trust boundary\n');
console.log(' symbol() — accepts real tickers');
check('AAPL', symbol('AAPL'), 'AAPL');
check('lowercase is normalised', symbol('aapl'), 'AAPL');
check('whitespace is trimmed', symbol('  msft '), 'MSFT');
check('BRK.B (dot)', symbol('BRK.B'), 'BRK.B');
check('RDS-A (hyphen)', symbol('RDS-A'), 'RDS-A');

console.log('\n symbol() — refuses everything else');
// Each of these reached an upstream URL before this validator existed.
check('path traversal', symbol('../../v1/marketstatus/now'), null);
check('encoded traversal', symbol('..%2F..%2Fv1'), null);
check('query injection (&)', symbol('AAPL&function=TIME_SERIES'), null);
check('fragment truncation (#)', symbol('AAPL#'), null);
check('early query (?)', symbol('AAPL?apiKey=theirs'), null);
check('percent encoding', symbol('AAPL%20'), null);
check('slash', symbol('AAPL/prev'), null);
check('space', symbol('A APL'), null);
check('empty', symbol(''), null);
check('null', symbol(null), null);
check('undefined', symbol(undefined), null);
check('over 12 chars', symbol('ABCDEFGHIJKLM'), null);
check('leading dot', symbol('.AAPL'), null);
check('CRLF injection', symbol('AAPL\r\nX-Evil: 1'), null);

console.log('\n isoDate()');
check('valid', isoDate('2026-08-21'), '2026-08-21');
check('rejects impossible day', isoDate('2026-02-31'), null);
check('rejects wrong shape', isoDate('21-08-2026'), null);
check('rejects injection', isoDate('2026-08-21&greeks=false'), null);
check('rejects empty', isoDate(''), null);

console.log('\n mayCarryKey() — where our key may be sent');
check('polygon api', mayCarryKey('https://api.polygon.io/logo.png'), true);
check('polygon www', mayCarryKey('https://www.polygon.io/a.png'), true);
check('REFUSES a stranger', mayCarryKey('https://evil.example.com/a.png'), false);
check('REFUSES lookalike suffix', mayCarryKey('https://api.polygon.io.evil.com/a.png'), false);
check('REFUSES plain http', mayCarryKey('http://api.polygon.io/a.png'), false);
check('REFUSES garbage', mayCarryKey('not a url'), false);
check('REFUSES empty', mayCarryKey(''), false);

console.log('\n withKey() — one query string, not two');
check(
  'appends to a bare url',
  withKey('https://api.polygon.io/a.png', 'K'),
  'https://api.polygon.io/a.png?apiKey=K',
);
check(
  'appends to a url that already has a query',
  withKey('https://api.polygon.io/a.png?v=2', 'K'),
  'https://api.polygon.io/a.png?v=2&apiKey=K',
);

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix src/lib/server/validate.ts. Do NOT relax a case to make this pass.\n');
  process.exit(1);
}

console.log('\nPASS — nothing reaches an upstream URL without being what it claims to be.\n');
