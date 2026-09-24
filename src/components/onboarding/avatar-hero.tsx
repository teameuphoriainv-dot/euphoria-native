/**
 * AvatarHero: a 96pt preview of the character the user picked, drawn above the onboarding avatar grid.
 *
 * Usage (integrator, onboarding.tsx AvatarStep):
 *   const avatarId = useApp((s) => s.avatarId);
 *   // preselect once on mount, so the step never opens looking unanswered
 *   useEffect(() => { if (avatarId !== heroAvatarId(avatarId)) setAvatarId(heroAvatarId(avatarId)); }, []);
 *   <AvatarHero avatarId={avatarId} />
 *   // and the grid's `on` test becomes: a.id === heroAvatarId(avatarId)
 *
 * NEVER ATLAS. The avatar is the user and Atlas is Atlas (CONSTITUTION 5.6, one mascot per screen).
 * The stored default is the atlas id, which is not in the grid, so without heroAvatarId() the step
 * opened with no tile selected and a hero that would have had to draw the mascot a second time
 * under the AtlasStage. heroAvatarId() maps atlas, empty and unknown ids to the first character in
 * the grid, and this component only ever draws a PixelSprite, so there is no code path that can
 * put <Atlas> here. scripts/design-rules-pin is meant to hold that line (see the O4 report).
 *
 * MOTION. A pick crossfades the preview over 120ms (Duration.instant is 100, too close to a cut for
 * a face swap). Opacity only, no scale pop: motion-invariants.mjs bans pop-on-select for the tiles,
 * and a popping hero above a still tile reads as the same defect one row up. Reduce Motion swaps
 * instantly.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ALL_AVATARS, CHARACTER_AVATARS, avatarFor, type Avatar } from '@/lib/avatars';
import { PixelSpriteView } from '@/lib/pixel';

/** Target sprite width from the design. The cast is mixed (measured 2026-09-22: 26 characters are
 *  20 cells wide, 28 marks are 16), and 96 / 20 = 4.8 would put art pixels on fractional points
 *  and blur every edge. heroScale() rounds to a whole points-per-cell instead: characters draw at
 *  5 (100pt), marks at 6 (96pt). */
export const HERO_SIZE = 96;
/** Crossfade length on a pick. */
const SWAP_MS = 120;

/** The first character in the grid: what the step preselects when the stored id is atlas. */
const FIRST_GRID = CHARACTER_AVATARS[0] ?? ALL_AVATARS[0];

/**
 * The grid avatar to show and to mark selected for a stored id. Atlas, empty and unknown ids all
 * resolve to the first grid character, because the atlas id has no tile and an unknown id would
 * otherwise draw an empty hero. Pure, so a pin can check it without rendering.
 */
export function heroAvatarId(stored: string | undefined): string {
  return avatarFor(stored)?.id ?? FIRST_GRID.id;
}

/** Whole points per art cell, nearest to HERO_SIZE. Exported for a pin. */
export function heroScale(a: Avatar): number {
  const cells = Math.max(1, ...a.sprite.rows.map((r) => r.length));
  return Math.max(1, Math.round(HERO_SIZE / cells));
}

/** The avatar the hero draws. Never null and never the atlas id. */
export function heroAvatar(stored: string | undefined): Avatar {
  return avatarFor(stored) ?? FIRST_GRID;
}

export function AvatarHero({ avatarId }: { avatarId: string | undefined }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const a = heroAvatar(avatarId);

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="image"
      // VoiceOver hears the pick once here; the grid tile already says "selected"
      accessibilityLabel={`Your avatar: ${a.label}`}
    >
      <View style={[styles.plate, { backgroundColor: theme.card, borderColor: theme.primary }]}>
        {/* Keyed on the id so a pick mounts a new layer: the old one fades out while the new one
            fades in on top of it. Both layers are absolutely stacked, otherwise the outgoing face
            would sit beside the incoming one for 120ms and shove the grid down. */}
        <Animated.View
          key={a.id}
          style={styles.layer}
          entering={reduced ? undefined : FadeIn.duration(SWAP_MS).easing(Easing.linear)}
          exiting={reduced ? undefined : FadeOut.duration(SWAP_MS).easing(Easing.linear)}
        >
          <PixelSpriteView sprite={a.sprite} scale={heroScale(a)} />
        </Animated.View>
      </View>
      <ThemedText type="smallBold" style={styles.label} numberOfLines={1} maxFontSizeMultiplier={1.4}>
        {a.label}
      </ThemedText>
    </View>
  );
}

// room for the widest rounded case (20 cells x 5 = 100pt) plus a border gap
const PLATE = HERO_SIZE + Spacing.four;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: Spacing.three },
  plate: {
    width: PLATE,
    height: PLATE,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  label: { marginTop: Spacing.two, textAlign: 'center' },
});
