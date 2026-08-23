/**
 * Every iOS-written guide must have a body, a hero, and a category with art.
 *
 * Each of these fails SILENTLY and looks like a layout bug rather than missing content:
 *   - a post with no body opens a reader with nothing in it
 *   - a post whose hero key resolves to neither a sprite nor synced SVG renders an empty cover
 *   - a category with no entry in CATEGORY_ART draws a blank tile in the picker grid
 *
 * It also guards the thing that makes this file exist at all: digest-content.ts is auto-synced and
 * carries a DO-NOT-EDIT banner, so a guide added THERE would be erased by the next sync-digest.sh.
 * The count assertion below fails if anyone appends to the synced list instead.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const extra = readFileSync('src/lib/digest-extra.ts', 'utf8');
const digestScreen = readFileSync('src/app/(tabs)/digest.tsx', 'utf8');

const slugs = [...extra.matchAll(/^\s{4}slug: '([a-z0-9-]+)',/gm)].map((m) => m[1]);
assert.ok(slugs.length > 0, 'parsed no EXTRA_POSTS slugs — the regex has drifted');

const bodies = new Set([...extra.matchAll(/^\s{2}'([a-z0-9-]+)': `/gm)].map((m) => m[1]));
assert.deepEqual(
  slugs.filter((s) => !bodies.has(s)), [],
  'guides with no body in EXTRA_BODIES — the reader opens empty',
);

const heroes = [...extra.matchAll(/^\s{4}hero: '([a-z0-9-]+)',/gm)].map((m) => m[1]);
const heroArt = new Set([...extra.matchAll(/^\s{2}'(px-[a-z0-9-]+)':/gm)].map((m) => m[1]));
assert.deepEqual(
  heroes.filter((h) => h.startsWith('px-') && !heroArt.has(h)), [],
  'px- hero keys with no sprite in EXTRA_HERO_ART — the cover renders empty',
);

// Categories used by the new guides must all have a tile mark.
const cats = [...new Set([...extra.matchAll(/^\s{4}category: '([^']+)',/gm)].map((m) => m[1]))];
const artBlock = /const CATEGORY_ART: Record<AnyDigestCategory, PixelSprite> = \{([\s\S]*?)\n\};/.exec(digestScreen);
assert.ok(artBlock, 'could not find CATEGORY_ART in digest.tsx');
const arted = new Set([...artBlock[1].matchAll(/^\s{2}'?([A-Za-z ]+?)'?:\s*\w+,/gm)].map((m) => m[1].trim()));
assert.deepEqual(
  cats.filter((c) => !arted.has(c)), [],
  'categories with no mark in CATEGORY_ART — the picker draws a blank tile',
);

// Slugs must not collide with the synced catalogue: find() returns the first, so the second is dead.
const synced = new Set([...readFileSync('src/lib/digest-content.ts', 'utf8')
  .matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1]));
assert.ok(synced.size >= 30, `parsed only ${synced.size} synced slugs — the regex has drifted`);
assert.deepEqual(
  slugs.filter((s) => synced.has(s)), [],
  'an iOS guide reuses a synced slug — find() would only ever return one of them',
);

console.log(
  `digest-extra-pin: OK — ${slugs.length} iOS guides across ${cats.length} categories, ` +
  `all with bodies, heroes and tile art, none colliding with the ${synced.size} synced guides.`,
);
