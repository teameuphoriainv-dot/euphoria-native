/**
 * Shop items ADDED ON iOS, and the merged catalogue everything should read.
 *
 * WHY A SECOND FILE. shop-items.ts opens by stating that every id, name, description, price,
 * category, rarity and metadata value in it is the web's table verbatim. That property is the
 * point: re-copying it when the web Shop changes is a mechanical operation that cannot go wrong.
 * Appending to it would forfeit that, and the next re-sync would silently delete these.
 *
 * WHAT THESE ARE, AND WHAT THEY ARE NOT. Every one of them is either a QUANTITY VARIANT of a
 * mechanic that already exists, or a cosmetic drawn with a sprite the shared catalogue already
 * ships. Nothing here needed new store code and nothing here needed new art:
 *
 *   buyItem is entirely metadata-driven — it reads `duration_minutes` and `uses` off the item — so
 *   a 24-hour Double XP and a seven-pack of freezes are new products, not new features.
 *
 *   The four badges and the graduate cap reuse trophy / bull / bear / gem / graduationCap, all
 *   already in sprites.ts. Drawing new ones would have been a second library by another name,
 *   which is the exact mistake shop-art.tsx's own header records.
 *
 * PRICING is anchored to the ported table rather than invented. The web's own ladder is
 * 150 -> 400 for 1 -> 3 freezes and 200 -> 450 for 1h -> 3h Double XP: roughly a 10-15% discount
 * per unit as the pack grows. The bulk items here keep that curve rather than undercutting it, so
 * the two halves of the shop cannot read as having been priced by different people.
 *
 * These are also now worth buying, which they would not have been a day ago: the league pays a
 * weekly bar and a one-off tier bonus, so there is finally income to spend.
 */
import { SHOP_ITEMS, type ShopItem } from './shop-items';

export const EXTRA_SHOP_ITEMS: ShopItem[] = [
  // ── power-ups: quantity variants, zero new store code
  { id: 'double_xp_24hr', name: 'Double XP (24 Hours)', description: 'A full day of doubled XP. For the week you decide to actually go for it.', icon: 'lightning', price: 1200, category: 'power-up', itemType: 'double_xp', rarity: 'epic', metadata: { duration_minutes: 1440 } },
  { id: 'streak_freeze_7', name: 'Streak Freeze Week (7)', description: 'Seven freezes. Enough cover for a holiday without losing the streak you built.', icon: 'ice', price: 800, category: 'power-up', itemType: 'streak_freeze', rarity: 'rare', metadata: { uses: 7 } },
  { id: 'hint_pack_25', name: 'Hint Vault (25)', description: 'Twenty-five hints. Stop rationing them and just learn the material.', icon: 'lightbulb', price: 900, category: 'power-up', itemType: 'hint', rarity: 'rare', metadata: { uses: 25 } },

  // ── profile badges: art already in the catalogue
  { id: 'badge_bull', name: 'Bull Badge', description: "Optimist, on the record. Wear it and be held to it.", icon: 'bull', price: 450, category: 'profile', itemType: 'profile_badge', rarity: 'uncommon', metadata: { badge: 'bull' } },
  { id: 'badge_bear', name: 'Bear Badge', description: 'Someone has to ask the awkward question about the valuation.', icon: 'bear', price: 450, category: 'profile', itemType: 'profile_badge', rarity: 'uncommon', metadata: { badge: 'bear' } },
  { id: 'badge_trophy', name: 'Trophy Badge', description: 'For finishing what you started. Rarer than it sounds.', icon: 'trophy', price: 600, category: 'profile', itemType: 'profile_badge', rarity: 'rare', metadata: { badge: 'trophy' } },
  { id: 'badge_gem', name: 'Gem Badge', description: 'The quiet flex. No explanation offered.', icon: 'gem', price: 900, category: 'profile', itemType: 'profile_badge', rarity: 'epic', metadata: { badge: 'gem' } },

  // ── avatar
  { id: 'avatar_graduation_cap', name: 'Graduate Cap', description: 'You did the reading. Atlas wears the proof.', icon: 'graduation', price: 350, category: 'avatar', itemType: 'avatar_item', rarity: 'uncommon', metadata: { slot: 'hat' } },
];

/**
 * THE catalogue. Every reader — the shop screen and the store's purchase lookup — must use this
 * rather than SHOP_ITEMS, or an item is visible but unbuyable (or buyable but invisible).
 * shop-catalogue-pin asserts exactly that.
 */
export const ALL_SHOP_ITEMS: ShopItem[] = [...SHOP_ITEMS, ...EXTRA_SHOP_ITEMS];

export const allItemById = (id: string): ShopItem | undefined =>
  ALL_SHOP_ITEMS.find((i) => i.id === id);
