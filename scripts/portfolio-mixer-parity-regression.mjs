import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/components/interactive-graph.tsx', import.meta.url), 'utf8');

for (const color of ['#A451E6', '#2DD4BF', '#10B981', '#EF4444', '#64748B']) {
  assert.match(source, new RegExp(color), `portfolio mixer must use canonical ${color}`);
}
assert.match(source, /function portfolioDollar/, 'portfolio values need the canonical one-decimal compact format');
assert.match(source, /segmentWidth > 62/, 'allocation labels must disappear before they collide');
assert.match(source, /← drag the dividers →/, 'the untouched allocation bar must carry the canonical drag hint');
assert.match(source, /accessibilityLabel="Clear"/, 'an active crash must expose the canonical Clear chip');
assert.match(source, /portfolioAxisLabel/, 'portfolio chart must include dollar axis labels');
assert.match(source, /portfolioInsight/, 'revealed portfolio insight must overlay the hero stage');

console.log('portfolio mixer parity ok');
