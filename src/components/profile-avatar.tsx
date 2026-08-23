/**
 * <ProfileAvatar> — Atlas, wearing what you have equipped.
 *
 * N21's avatar and profile items (14 of the 21) had no mechanic on iOS at all: there is no user
 * avatar here, because Atlas is a MASCOT rather than a customisable player character. Rather than
 * invent a second character to hang hats on, the hats go on Atlas. That is a deliberate deviation
 * from the web, which dresses a separate avatar — written down per RULE ZERO rather than left for
 * the next reader to wonder about.
 *
 * Slots come from the items' own metadata, so nothing here hardcodes which item is a hat:
 *   hat        -> crown, top hat, wizard hat        (sits above the head)
 *   accessory  -> sunglasses, monocle, diamond ring (sits over the face)
 *   frame      -> a ring around the whole avatar
 *
 * Sprites are the shared catalogue's. No new art.
 */
import { View } from 'react-native';

import { Atlas } from '@/components/atlas';
import { PixelSpriteView } from '@/lib/pixel';
import { ITEM_ART } from '@/lib/item-art';
import { useApp } from '@/lib/store';

/* The wearables map lived here as a third copy of the same id -> sprite table. It is now shared:
 * `equipped.hat` and `equipped.accessory` only ever hold ids equipItem wrote from an item's own
 * slot metadata, so reading the full catalogue map cannot put a badge on Atlas's head. */
/** Frame colours, keyed by the item's `frame` metadata value. */
const FRAME_TINT: Record<string, string> = {
  fire: '#F97316',
  diamond: '#60A5FA',
  rainbow: '#F472B6',
};

export function ProfileAvatar({ size = 62 }: { size?: number }) {
  const equipped = useApp((s) => s.equipped);

  const hat = equipped.hat ? ITEM_ART[equipped.hat] : undefined;
  const accessory = equipped.accessory ? ITEM_ART[equipped.accessory] : undefined;
  const frameKey = equipped.frame?.replace('frame_', '');
  const frameTint = frameKey ? FRAME_TINT[frameKey] : undefined;

  // The frame is drawn as a ring OUTSIDE the mascot, so equipping one never crops Atlas.
  const pad = frameTint ? 5 : 0;
  const box = size + pad * 2;

  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      {frameTint ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', left: 0, top: 0, width: box, height: box,
            borderRadius: box / 2, borderWidth: 2.5, borderColor: frameTint,
          }}
        />
      ) : null}
      <Atlas size={size} expression="happy" interactive={false} idle />
      {/* A hat sits ON the head, so it overhangs the top of the mascot's box rather than inside it. */}
      {hat ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: -size * 0.16, alignSelf: 'center' }}>
          <PixelSpriteView sprite={hat} size={size * 0.52} />
        </View>
      ) : null}
      {accessory ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: size * 0.30, alignSelf: 'center' }}>
          <PixelSpriteView sprite={accessory} size={size * 0.46} />
        </View>
      ) : null}
    </View>
  );
}
