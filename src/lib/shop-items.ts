/**
 * THE EUPHORIUM CATALOGUE — ported verbatim from the web app.
 *
 * RULE ZERO. Source: `euphoriaweb@origin/master:src/features/shop/data/shopItems.ts`, read
 * 2026-08-23. Every id, name, description, price, category, rarity and metadata value below is the
 * web's, unchanged. Nothing here was invented, and nothing should be: a second price list is a
 * second source of truth, and the curriculum re-sync exists because that already happened once.
 *
 * If a price changes on web, change it HERE and nowhere else. `scripts/shop-catalogue-pin.mjs`
 * asserts the shape and the totals so a careless edit cannot quietly reprice the economy.
 *
 * WHAT IOS DOES NOT HAVE YET, stated so nobody ships an inert card:
 *   - `heart_refill` needs a hearts/lives system      (being built alongside this)
 *   - `hint`         needs a lesson hint mechanic     (being built alongside this)
 *   - `avatar_item`  needs an equippable avatar       (being built alongside this)
 *   - `profile_*`    needs profile customisation      (being built alongside this)
 * `double_xp` and `streak_freeze` map onto XP and streaks, which already exist.
 */

export type ShopCategory = 'power-up' | 'avatar' | 'profile';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  /** Art key. `shop-art.tsx` resolves id first, then itemType, so a new item always draws SOMETHING. */
  icon: string;
  price: number;
  category: ShopCategory;
  itemType: string;
  rarity: Rarity;
  metadata: Record<string, string | number>;
};

export const SHOP_ITEMS: ShopItem[] = [
  // ── POWER-UPS ───────────────────────────────────────────────────────────────
  { id: 'double_xp_1hr', name: 'Double XP (1 Hour)', description: 'All XP earned is doubled for the next 60 minutes. Stack your learning sessions!', icon: 'lightning', price: 200, category: 'power-up', itemType: 'double_xp', rarity: 'uncommon', metadata: { duration_minutes: 60 } },
  { id: 'double_xp_3hr', name: 'Double XP (3 Hours)', description: 'Triple the value! 3 full hours of double XP. Perfect for marathon sessions.', icon: 'flame', price: 450, category: 'power-up', itemType: 'double_xp', rarity: 'rare', metadata: { duration_minutes: 180 } },
  { id: 'streak_freeze_1', name: 'Streak Freeze', description: 'Protects your streak for one missed day. Insurance for busy days!', icon: 'ice', price: 150, category: 'power-up', itemType: 'streak_freeze', rarity: 'common', metadata: { uses: 1 } },
  { id: 'streak_freeze_3', name: 'Streak Freeze Pack (3)', description: 'Three streak freezes at a discount. Peace of mind for the whole week.', icon: 'ice', price: 400, category: 'power-up', itemType: 'streak_freeze', rarity: 'uncommon', metadata: { uses: 3 } },
  { id: 'heart_refill', name: 'Heart Refill', description: 'Instantly restore all 5 hearts. Get back in the game!', icon: 'heart', price: 100, category: 'power-up', itemType: 'heart_refill', rarity: 'common', metadata: { hearts: 5 } },
  { id: 'hint_pack_3', name: 'Hint Pack (3)', description: 'Reveals the correct answer on tough questions. Use wisely!', icon: 'sparkle', price: 120, category: 'power-up', itemType: 'hint', rarity: 'common', metadata: { uses: 3 } },
  { id: 'hint_pack_10', name: 'Hint Pack (10)', description: 'Ten hints for serious learners. Big savings over singles!', icon: 'research', price: 350, category: 'power-up', itemType: 'hint', rarity: 'uncommon', metadata: { uses: 10 } },

  // ── AVATAR ITEMS ────────────────────────────────────────────────────────────
  { id: 'avatar_crown', name: 'Golden Crown', description: "Show everyone you're royalty. A shining crown for your avatar.", icon: 'crown', price: 500, category: 'avatar', itemType: 'avatar_item', rarity: 'rare', metadata: { slot: 'hat' } },
  { id: 'avatar_sunglasses', name: 'Cool Shades', description: 'Stylish sunglasses for the coolest investor in town.', icon: 'star-burst', price: 250, category: 'avatar', itemType: 'avatar_item', rarity: 'uncommon', metadata: { slot: 'accessory' } },
  { id: 'avatar_top_hat', name: 'Wall Street Top Hat', description: 'A distinguished top hat befitting a financial mogul.', icon: 'streak-crown', price: 400, category: 'avatar', itemType: 'avatar_item', rarity: 'rare', metadata: { slot: 'hat' } },
  { id: 'avatar_wizard_hat', name: 'Market Wizard Hat', description: 'Channel your inner market wizard with this mystical hat.', icon: 'orb', price: 600, category: 'avatar', itemType: 'avatar_item', rarity: 'epic', metadata: { slot: 'hat' } },
  { id: 'avatar_monocle', name: "Investor's Monocle", description: 'See the fine print. A refined accessory for serious analysts.', icon: 'research', price: 300, category: 'avatar', itemType: 'avatar_item', rarity: 'uncommon', metadata: { slot: 'accessory' } },
  { id: 'avatar_diamond_ring', name: 'Diamond Hands Ring', description: 'For those who never sell. A diamond ring of conviction.', icon: 'xp-diamond', price: 800, category: 'avatar', itemType: 'avatar_item', rarity: 'epic', metadata: { slot: 'accessory' } },

  // ── PROFILE ─────────────────────────────────────────────────────────────────
  { id: 'theme_neon', name: 'Neon Glow Theme', description: 'A vibrant neon theme that makes your profile pop with electric colors.', icon: 'rainbow', price: 350, category: 'profile', itemType: 'profile_theme', rarity: 'rare', metadata: { theme: 'neon' } },
  { id: 'theme_midnight', name: 'Midnight Blue Theme', description: 'Sleek and professional. A deep blue theme for serious traders.', icon: 'moon', price: 300, category: 'profile', itemType: 'profile_theme', rarity: 'uncommon', metadata: { theme: 'midnight' } },
  { id: 'theme_gold', name: 'Golden Hour Theme', description: 'Warm gold tones for the distinguished investor.', icon: 'sparkles', price: 500, category: 'profile', itemType: 'profile_theme', rarity: 'rare', metadata: { theme: 'gold' } },
  { id: 'frame_fire', name: 'Fire Frame', description: "A blazing frame around your avatar. You're on fire!", icon: 'flame', price: 400, category: 'profile', itemType: 'profile_frame', rarity: 'rare', metadata: { frame: 'fire' } },
  { id: 'frame_diamond', name: 'Diamond Frame', description: 'The ultimate prestige frame. Diamond-encrusted profile border.', icon: 'diamond', price: 1000, category: 'profile', itemType: 'profile_frame', rarity: 'legendary', metadata: { frame: 'diamond' } },
  { id: 'frame_rainbow', name: 'Rainbow Frame', description: 'A colorful rainbow frame that celebrates your achievements.', icon: 'rainbow', price: 350, category: 'profile', itemType: 'profile_frame', rarity: 'uncommon', metadata: { frame: 'rainbow' } },
  { id: 'badge_whale', name: 'Whale Badge', description: 'Display the whale badge on your profile. Big money energy.', icon: 'whale', price: 750, category: 'profile', itemType: 'profile_badge', rarity: 'epic', metadata: { badge: 'whale' } },
  { id: 'badge_rocket', name: 'Rocket Badge', description: 'To the moon! Display the rocket badge on your profile.', icon: 'rocket', price: 300, category: 'profile', itemType: 'profile_badge', rarity: 'uncommon', metadata: { badge: 'rocket' } },
];

/** Tabs, in the web's order, with the web's labels and descriptions. */
export const SHOP_CATEGORIES: { id: ShopCategory; label: string; description: string }[] = [
  { id: 'power-up', label: 'Power-Ups', description: 'Boost your progress' },
  { id: 'avatar', label: 'Avatar Items', description: 'Customize your look' },
  { id: 'profile', label: 'Profile', description: 'Stand out from the crowd' },
];

/**
 * AWARD RATES, read off the web Shop's own "How to earn Euphorium" panel rather than guessed.
 * Ranges are inclusive; the lesson award scales with the lesson's XP so a longer lesson pays more.
 */
export const EARN = {
  lessonMin: 50,
  lessonMax: 100,
  dailyStreak: 25,
  gameWinMin: 10,
  gameWinMax: 50,
  dailyChallenge: 30,
} as const;

export const itemById = (id: string): ShopItem | undefined => SHOP_ITEMS.find((i) => i.id === id);
