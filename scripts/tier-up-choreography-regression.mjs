import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/tier-up-sheet.tsx', import.meta.url), 'utf8');
const includes = (needle, message) => assert.ok(source.includes(needle), message);

includes('const COPY_DELAY = 160;', 'tier meaning must follow the crest');
includes('const REWARD_DELAY = 340;', 'the payout must follow the tier meaning');
includes('const CTA_DELAY = 520;', 'the action must arrive after the reward is understood');
includes('function StageReveal', 'supporting content must share one restrained reveal primitive');
includes('if (reduced)', 'tier-up choreography must collapse under Reduced Motion');
includes('withSpring(1, Spring.reward)', 'the crest remains the only expressive spring');
assert.equal((source.match(/<StageReveal/g) ?? []).length, 3, 'copy, reward, and CTA are the three staged beats');
assert.ok(!source.includes('withRepeat('), 'a tier-up sheet must settle instead of looping');

console.log('tier-up choreography regression passed');
