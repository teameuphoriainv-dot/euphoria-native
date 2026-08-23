/**
 * Every cosmetic in the shop must have art, and every reader must use the MERGED catalogue.
 *
 * Three silent failures this guards, all of which sell the user something and then quietly fail to
 * deliver it:
 *
 *   A COSMETIC WITH NO ART. Buying and equipping both succeed; the item simply draws nothing on
 *   whichever surface forgot it. This used to be near-certain, because three files kept three
 *   private copies of the id->sprite map and you.tsx's copy was a ternary enumerating exactly two
 *   badges — every badge added after it would have equipped to an invisible profile.
 *
 *   A READER ON THE WRONG LIST. shop-items.ts is the web's table verbatim and knows nothing about
 *   the items iOS added. If the store looks purchases up there, a new item is visible in the shop
 *   and silently unbuyable; if the shop renders from there, a buyable item is invisible.
 *
 *   A DUPLICATE ID. `find` returns the first match, so the second item is dead weight that renders
 *   in the grid and resolves to someone else's price.
 *
 * Parsed as TEXT rather than imported: these modules pull in '@/lib/pixel', an alias Node cannot
 * resolve. The parse is asserted to have found something, so a regex that silently stops matching
 * fails the pin instead of passing it vacuously.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const items = [
  ...readFileSync('src/lib/shop-items.ts', 'utf8').matchAll(/id: '([a-z_0-9]+)'[^\n]*itemType: '([a-z_]+)'/g),
  ...readFileSync('src/lib/shop-items-extra.ts', 'utf8').matchAll(/id: '([a-z_0-9]+)'[^\n]*itemType: '([a-z_]+)'/g),
].map((m) => ({ id: m[1], itemType: m[2] }));

assert.ok(items.length >= 21, `parsed only ${items.length} shop items — the item regex has drifted`);

// ── ids must be unique across the merged catalogue
const seen = new Set();
for (const it of items) {
  assert.ok(!seen.has(it.id), `duplicate shop item id "${it.id}" — find() would return only the first`);
  seen.add(it.id);
}

// ── every cosmetic must have BESPOKE art; a type fallback would draw every badge identically
const art = readFileSync('src/lib/item-art.ts', 'utf8');
const keys = new Set([...art.matchAll(/^\s{2}([a-z_0-9]+):\s*[a-zA-Z]/gm)].map((m) => m[1]));
assert.ok(keys.size >= 14, `parsed only ${keys.size} art entries — the ITEM_ART regex has drifted`);

const COSMETIC = new Set(['avatar_item', 'profile_badge', 'profile_frame', 'profile_theme']);
const missing = items.filter((i) => COSMETIC.has(i.itemType) && !keys.has(i.id));
assert.deepEqual(
  missing.map((m) => m.id), [],
  'cosmetics with no entry in ITEM_ART — they will sell, equip, and draw nothing',
);

// ── the readers must be on the merged list
const store = readFileSync('src/lib/store.ts', 'utf8');
assert.ok(
  /allItemById as itemById \} from '\.\/shop-items-extra'/.test(store),
  "store.ts must look purchases up in the MERGED catalogue — shop-items.ts's own itemById cannot " +
  'see the items iOS added, so buying one would silently no-op',
);
const shop = readFileSync('src/app/shop.tsx', 'utf8');
assert.ok(
  /ALL_SHOP_ITEMS as SHOP_ITEMS \} from '@\/lib\/shop-items-extra'/.test(shop),
  'shop.tsx must render the MERGED catalogue, or the added items are buyable but never shown',
);

// ── the ported table stays verbatim: nothing may be appended to it
const ported = readFileSync('src/lib/shop-items.ts', 'utf8');
assert.equal(
  [...ported.matchAll(/id: '([a-z_0-9]+)'[^\n]*itemType:/g)].length, 21,
  'shop-items.ts is the web table verbatim and must stay at 21 items — add to shop-items-extra.ts, ' +
  'or the next re-sync from web silently deletes the additions',
);

console.log(
  `shop-catalogue-pin: OK — ${items.length} items, ids unique, every cosmetic has art, ` +
  'both readers on the merged list, ported table still 21.',
);
