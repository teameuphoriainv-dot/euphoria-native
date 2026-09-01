#!/usr/bin/env node
/** An async measurement from an old option chain must never scroll the new chain. */
import assert from 'node:assert/strict';
import { chainScrollTarget } from '../src/lib/options-scroll.ts';

assert.equal(
  chainScrollTarget({ measuredKey: 'NVDA:2026-09-18', activeKey: 'AAPL:2026-09-18', offsetY: 640, windowY: 420 }),
  null,
  'stale symbol measurements must be discarded',
);
assert.equal(
  chainScrollTarget({ measuredKey: 'AAPL:2026-09-18', activeKey: 'AAPL:2026-09-25', offsetY: 640, windowY: 420 }),
  null,
  'stale expiry measurements must be discarded',
);
assert.equal(
  chainScrollTarget({ measuredKey: 'AAPL:2026-09-25', activeKey: 'AAPL:2026-09-25', offsetY: 0, windowY: 820 }),
  520,
);
assert.equal(
  chainScrollTarget({ measuredKey: 'AAPL:2026-09-25', activeKey: 'AAPL:2026-09-25', offsetY: 100, windowY: 120 }),
  0,
  'the target is clamped to the top',
);
assert.equal(
  chainScrollTarget({ measuredKey: 'AAPL:2026-09-25', activeKey: 'AAPL:2026-09-25', offsetY: 0, windowY: Number.NaN }),
  null,
);

console.log('options scroll ok — stale symbol/expiry measurements fail closed');
