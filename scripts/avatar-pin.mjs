/**
 * Every avatar must be pickable, unique, and resolvable.
 *
 * Three silent failures, all of which show as a hole where a player's face should be:
 *   - a duplicate id means `find()` returns one of them and the other tile is unselectable
 *   - an id in the store that no longer exists in the catalogue resolves to null, which the
 *     renderers treat as "wearing Atlas" — so a removed avatar silently reverts everyone on it
 *   - the default must stay ATLAS, because defaulting to a sprite would reskin every existing
 *     profile in the app on update rather than on a choice
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const avatars = readFileSync('src/lib/avatars.ts', 'utf8');
const chars = readFileSync('src/lib/pixel/sprites-characters.ts', 'utf8');

const castIds = [...chars.matchAll(/\{ id: '([a-z-]+)', label: '[^']*', sprite: \w+ \}/g)].map((m) => m[1]);
assert.ok(castIds.length >= 20, `parsed only ${castIds.length} characters — the CHARACTERS regex has drifted`);

const markIds = [...(/export const MARK_AVATARS: Avatar\[\] = \[([\s\S]*?)\n\];/.exec(avatars)?.[1] ?? '')
  .matchAll(/\{ id: '([a-z-]+)'/g)].map((m) => m[1]);
assert.ok(markIds.length > 0, 'parsed no MARK_AVATARS — the regex has drifted');

const all = [...castIds, ...markIds, 'atlas'];
const dupes = [...new Set(all.filter((v, i) => all.indexOf(v) !== i))];
assert.deepEqual(dupes, [], 'duplicate avatar ids — one of each pair is unselectable');

assert.ok(
  /export const DEFAULT_AVATAR_ID = ATLAS_AVATAR_ID;/.test(avatars),
  'the default avatar is no longer Atlas — every existing profile would be reskinned on update ' +
  'rather than by a choice',
);

// Every character sprite must actually exist as an export, or the picker renders a blank tile.
for (const id of castIds) {
  const varName = 'char' + id.replace('char-', '').replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
  assert.ok(
    chars.includes(`export const ${varName}: PixelSprite`),
    `character ${id} has no exported sprite (${varName})`,
  );
}

console.log(
  `avatar-pin: OK — ${castIds.length} characters + ${markIds.length} marks + Atlas, ids unique, ` +
  'default is Atlas.',
);
