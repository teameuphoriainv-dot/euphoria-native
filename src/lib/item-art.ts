/**
 * THE single item-id → sprite map.
 *
 * WHY THIS FILE EXISTS. Three separate hardcoded maps used to answer the same question:
 *   shop-art.tsx      `BY_ID`      — what to draw on the shop card
 *   profile-avatar.tsx `WEARABLE`  — what Atlas is wearing
 *   you.tsx            a ternary   — `equipped.badge === 'badge_whale' ? whale : ... : undefined`
 *
 * Adding one cosmetic therefore meant editing three places, and missing any of them failed
 * SILENTLY: the item sold fine, equipped fine, and simply drew nothing on whichever surface was
 * forgotten. The ternary in you.tsx is the clearest case — it enumerated exactly two badges, so
 * every badge added after it would have equipped to an invisible profile.
 *
 * One map, three readers, and item-art-pin asserts every cosmetic in the catalogue resolves here.
 * That turns the whole class of bug from silent into a failed gate.
 *
 * RULE ZERO still holds for the contents: the keys are euphoriaweb's own (`shopArt.tsx` keys by
 * item id, then by itemType). Only the ids iOS added are new.
 */
import {
  bolt, bull, bear, crown, diamondRing, frame, frameDiamond, frameFire, frameRainbow,
  gem, graduationCap, heart, lightbulb, monocle, rocket, snowflake, sunglasses,
  theme as themeSprite, themeGold, themeMidnight, themeNeon, topHat, trophy, whale, wizardHat,
  type PixelSprite,
} from '@/lib/pixel';

/** Bespoke art for a specific item. */
export const ITEM_ART: Record<string, PixelSprite> = {
  // ── ported from web, keyed exactly as shopArt.tsx keys them
  avatar_crown: crown,
  avatar_sunglasses: sunglasses,
  avatar_top_hat: topHat,
  avatar_wizard_hat: wizardHat,
  avatar_monocle: monocle,
  avatar_diamond_ring: diamondRing,
  badge_whale: whale,
  badge_rocket: rocket,
  // Six cosmetics BOTH apps drew with one generic mark each. See sprites-additions.ts.
  theme_neon: themeNeon,
  theme_midnight: themeMidnight,
  theme_gold: themeGold,
  frame_fire: frameFire,
  frame_diamond: frameDiamond,
  frame_rainbow: frameRainbow,

  // ── added on iOS (shop-items-extra.ts). Every one reuses a sprite the shared catalogue already
  //    ships — no new art was drawn for these, because none was missing.
  badge_trophy: trophy,
  badge_bull: bull,
  badge_bear: bear,
  badge_gem: gem,
  avatar_graduation_cap: graduationCap,
};

/** The per-itemType fallback, so an item added later is never blank. */
export const TYPE_ART: Record<string, PixelSprite> = {
  double_xp: bolt,
  streak_freeze: snowflake,
  heart_refill: heart,
  hint: lightbulb,
  profile_theme: themeSprite,
  profile_frame: frame,
  profile_badge: rocket,
  avatar_item: crown,
};

/** Art for an item, by id where there is bespoke art and by type otherwise. Never undefined. */
export function artForItem(id: string | undefined, itemType?: string): PixelSprite {
  return (id ? ITEM_ART[id] : undefined) ?? (itemType ? TYPE_ART[itemType] : undefined) ?? bolt;
}
