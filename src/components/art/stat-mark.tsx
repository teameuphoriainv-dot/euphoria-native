/**
 * StatMark — one pixel sprite per profile stat.
 *
 * WAS 117 lines of hand-authored SVG. Same reasoning as course-mark.tsx and shop-art.tsx: art that
 * only iOS has is a second catalogue that will drift from the shared one. All five already existed
 * in sprites.ts.
 *
 * NO PIN HERE, unlike course-mark.tsx, and the difference is the point. Course ids are strings that
 * come from curriculum data, so nothing stops one being added with no art — that needs a gate.
 * `StatMarkName` is a UNION, so typing the map as `Record<StatMarkName, PixelSprite>` makes a
 * missing entry a COMPILE error. A pin guarding what the type system already guards is noise.
 *
 * COLOUR BECAME THE SPRITE'S OWN, as in course-mark.tsx. The old signature took a per-stat accent;
 * these five sprites are already distinct and coloured, and the accent still carries through the
 * card's own tint where the caller draws it.
 */
import { bolt, book, coin, flame, newspaper, PixelSpriteView, type PixelSprite } from '@/lib/pixel';

export type StatMarkName = 'streak' | 'lessons' | 'xp' | 'guides' | 'earned';

/** Typed against the union, so adding a stat without art will not compile. */
const MARKS: Record<StatMarkName, PixelSprite> = {
  streak: flame,
  lessons: book,
  xp: bolt,
  guides: newspaper,
  earned: coin,
};

export function StatMark({ name, size = 24 }: { name: StatMarkName; size?: number }) {
  return <PixelSpriteView sprite={MARKS[name]} size={size} />;
}
