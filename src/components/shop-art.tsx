/**
 * Shop item art — the REAL Euphoria pixel sprites, not stand-ins.
 *
 * RULE ZERO. The mapping below is `euphoriaweb:src/features/shop/shopArt.tsx`'s own: keyed by item
 * id first, then by itemType, so a new item always draws something. Same sprites, same keys, one
 * catalogue — see src/lib/pixel/PixelSprite.tsx for why the art itself was copied rather than
 * redrawn.
 *
 * This file replaced a set of hand-drawn geometric SVGs written before the pixel system was ported.
 * They were fine and they were WRONG: they were iOS-only art that the web did not have, which is a
 * second library by another name.
 */
import {
  bolt, crown, diamondRing, frame, frameDiamond, frameFire, frameRainbow, heart,
  lightbulb, monocle, rocket, snowflake, sunglasses, theme as themeSprite,
  themeGold, themeMidnight, themeNeon, topHat, whale, wizardHat,
  type PixelSprite,
} from '@/lib/pixel';
import { PixelSpriteView } from '@/lib/pixel/PixelSprite';

/** Bespoke art for a specific item, exactly as the web keys it. */
const BY_ID: Record<string, PixelSprite> = {
  avatar_crown: crown,
  avatar_sunglasses: sunglasses,
  avatar_top_hat: topHat,
  avatar_wizard_hat: wizardHat,
  avatar_monocle: monocle,
  avatar_diamond_ring: diamondRing,
  badge_whale: whale,
  badge_rocket: rocket,
  // Six cosmetics that BOTH apps drew with one generic mark each. See sprites-additions.ts.
  theme_neon: themeNeon,
  theme_midnight: themeMidnight,
  theme_gold: themeGold,
  frame_fire: frameFire,
  frame_diamond: frameDiamond,
  frame_rainbow: frameRainbow,
};

/** The per-itemType fallback, so an item added later is never blank. */
const BY_TYPE: Record<string, PixelSprite> = {
  double_xp: bolt,
  streak_freeze: snowflake,
  heart_refill: heart,
  hint: lightbulb,
  profile_theme: themeSprite,
  profile_frame: frame,
  profile_badge: rocket,
  avatar_item: crown,
};

export function ShopArt({ id, itemType, size = 52 }: { id?: string; itemType: string; size?: number }) {
  const sprite = (id ? BY_ID[id] : undefined) ?? BY_TYPE[itemType] ?? bolt;
  return <PixelSpriteView sprite={sprite} size={size} />;
}
