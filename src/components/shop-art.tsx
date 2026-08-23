/**
 * Shop item art — the REAL Euphoria pixel sprites, not stand-ins.
 *
 * The mapping itself moved to src/lib/item-art.ts, because three files were keeping three copies
 * of it and forgetting one drew nothing at all. This is now just the shop's renderer.
 *
 * This file replaced a set of hand-drawn geometric SVGs written before the pixel system was ported.
 * They were fine and they were WRONG: they were iOS-only art that the web did not have, which is a
 * second library by another name.
 */
import { artForItem } from '@/lib/item-art';
import { PixelSpriteView } from '@/lib/pixel/PixelSprite';

export function ShopArt({ id, itemType, size = 52 }: { id?: string; itemType: string; size?: number }) {
  return <PixelSpriteView sprite={artForItem(id, itemType)} size={size} />;
}
