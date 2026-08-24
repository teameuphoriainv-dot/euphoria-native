/**
 * <ProfileBanner> — the strip behind your avatar on the profile screen.
 *
 * A flat band with one catalogue sprite repeated faintly across it. No new art and no gradient:
 * both are deliberate (see banners.ts), and the flat band is what keeps the standing "no
 * vibe-coded glow" rule true here without anyone having to remember it.
 *
 * THE MOTIFS ARE DECORATION, so they are `pointerEvents="none"` and sit at low opacity behind the
 * content. Their positions come from the INDEX, not from random: a re-render must not reshuffle the
 * wallpaper while someone is looking at it, which is the same purity rule ambient-background.tsx
 * learned the hard way when a resize reshuffled its entire starfield.
 */
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { PixelSpriteView } from '@/lib/pixel';
import { bannerById } from '@/lib/banners';

/** How many motifs march across the band. 7 fills a 340pt strip without becoming a texture. */
const MOTIFS = 7;

export function ProfileBanner({
  bannerId,
  name,
  title,
  height = 96,
  children,
}: {
  bannerId: string;
  name: string;
  /** The earned word worn under the name, or empty. */
  title?: string;
  height?: number;
  /** The avatar, drawn over the band. */
  children?: React.ReactNode;
}) {
  const b = bannerById(bannerId);

  return (
    <View style={[styles.wrap, { backgroundColor: b.band, height }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.motifs}>
          {Array.from({ length: MOTIFS }, (_, i) => (
            <PixelSpriteView
              key={i}
              sprite={b.motif}
              size={i % 2 === 0 ? 26 : 18}
              // Alternating drop keeps the row from reading as a ruler. Derived from the index, so
              // it is identical on every render.
              canvas="dark"
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {children}
        <View style={{ flex: 1 }}>
          <ThemedText type="title" numberOfLines={1} style={{ fontSize: FontSize.headingLg, color: b.ink }}>
            {name}
          </ThemedText>
          {title ? (
            <ThemedText type="label" numberOfLines={1} style={{ color: b.ink, opacity: 0.75 }}>
              {title.toUpperCase()}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: Radius.lg, overflow: 'hidden', justifyContent: 'center' },
  motifs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // Faint on purpose: this is wallpaper. Any louder and it competes with the name it sits behind,
    // which is the one thing on the banner that has to be readable.
    opacity: 0.14,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four },
});
