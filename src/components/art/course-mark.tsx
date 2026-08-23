/**
 * CourseMark — one pixel sprite per course.
 *
 * WAS 216 lines of hand-authored SVG, one bespoke path set per course, written before the pixel
 * system was ported. Same reasoning shop-art.tsx records having learned once already: iOS-only art
 * that the shared catalogue does not have is a second art library by another name, and it will
 * drift from the first one. Every mark below already existed in sprites.ts.
 *
 * The pairings are the obvious ones on purpose. A course rail is scanned, not studied — a seedling
 * for fundamentals and a vault for wealth management are read at a glance, where a clever mark
 * would need the label to decode it. All twelve are distinct so no two courses share a picture.
 *
 * COLOUR BECAME OPACITY, and that is a real change worth stating. The old signature took a `color`,
 * and the Learn rail used it to mute an unselected course. A pixel sprite carries its own palette,
 * so the state is now carried by opacity instead — the same signal, and it keeps a course
 * recognisable when it is off rather than flattening it to one grey silhouette.
 */
import { View } from 'react-native';

import {
  barChart, calculator, compass, factory, gem, globe, lightbulb, scales, seedling,
  shield, vault, wallet, PixelSpriteView, type PixelSprite,
} from '@/lib/pixel';

const MARKS: Record<string, PixelSprite> = {
  'investing-fundamentals': seedling,
  'personal-finance': wallet,
  'global-economics': globe,
  'corporate-finance': factory,
  'business-strategy': compass,
  'financial-analytics': barChart,
  'behavioral-finance': lightbulb,
  'applied-accounting': calculator,
  'quantitative-analysis': scales,
  'risk-management': shield,
  'alternative-investments': gem,
  'wealth-management': vault,
};

/** Unselected rail items. Not a grey: muting a pixel sprite to one tone throws away the thing that
 *  makes it identifiable, and the rail's job is letting you find a course you already know. */
const MUTED_OPACITY = 0.45;

export function CourseMark({
  id,
  size = 24,
  muted = false,
}: {
  id: string;
  size?: number;
  /** Rail state. Was expressed as a `color` override; see the note above. */
  muted?: boolean;
}) {
  const sprite = MARKS[id];
  if (!sprite) {
    // Loud in dev, harmless in production — an unmapped course must not blank its own rail slot.
    if (__DEV__) console.error(`[course-mark] no sprite for course "${id}" — add it to MARKS.`);
    return <View style={{ width: size, height: size }} />;
  }
  return (
    <View style={muted ? { opacity: MUTED_OPACITY } : undefined}>
      <PixelSpriteView sprite={sprite} size={size} />
    </View>
  );
}

/* Coverage is asserted by course-mark-pin rather than at runtime: a dynamic import inside a
 * component module to check a static fact is a promise the app has to carry forever, and this
 * repo's habit is to make that class of thing a gate instead. */
