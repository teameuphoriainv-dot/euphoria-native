/**
 * The avatar picker.
 *
 * Games let you choose a face before they let you buy one, and Euphoria let you do neither: your
 * mark in the league standings was the first letter of your name in a circle. This is that screen.
 *
 * A GRID, NOT A LIST, and the difference matters here. You are choosing between pictures, so the
 * pictures have to be comparable at a glance — a list forces a scroll and a serial comparison for
 * a decision that is entirely visual. Four across is what fits a 28-item set on one screen at a
 * size where the sprites still read.
 *
 * SELECTION IS IMMEDIATE. No Save button, no confirm. The choice is free, reversible and visible
 * everywhere the moment it is made, so a commit step would be ceremony around nothing.
 */
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Atlas } from '@/components/atlas';
import { ATLAS_AVATAR_ID, CHARACTER_AVATARS, MARK_AVATARS, type Avatar } from '@/lib/avatars';
import { PixelSpriteView } from '@/lib/pixel';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP } from '@/shared/motion/tokens';

/** One cell. Extracted so the two groups are provably the same control, not two lookalikes. */
function Tile({
  label,
  on,
  onPress,
  delay,
  children,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  delay: number;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.cell}>
      <RiseIn delay={delay}>
        <SpringPressable
          onPress={onPress}
          accessibilityRole="radio"
          accessibilityState={{ selected: on }}
          accessibilityLabel={label}>
          <View
            style={[
              styles.tile,
              {
                backgroundColor: on ? theme.primary + '22' : theme.card,
                borderColor: on ? theme.primary : theme.border,
                borderWidth: on ? 2 : StyleSheet.hairlineWidth,
              },
            ]}>
            {children}
          </View>
        </SpringPressable>
        <ThemedText
          type="small"
          numberOfLines={1}
          style={{ textAlign: 'center', marginTop: 6, color: on ? theme.text : theme.mutedForeground }}>
          {label}
        </ThemedText>
      </RiseIn>
    </View>
  );
}

export default function AvatarPicker() {
  const theme = useTheme();
  const avatarId = useApp((s) => s.avatarId);
  const setAvatarId = useApp((s) => s.setAvatarId);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={25} glow={false} />

      <View style={styles.header}>
        <SpringPressable
          haptic={false}
          scaleTo={0.85}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemedText type="display" style={{ fontSize: FontSize.titleSm }}>Your avatar</ThemedText>
        <ThemedText type="body" themeColor="mutedForeground" style={{ marginTop: 4 }}>
          Pick the character that shows up on your profile and in the league.
        </ThemedText>

        <ThemedText type="label" themeColor="mutedForeground" style={styles.groupLabel}>CHARACTERS</ThemedText>
        <View style={styles.grid}>
          {/* Atlas first, and pickable. He is the default and the brand; a picker that lets you
              leave him but not come back would be a one-way door. He renders as the mascot rather
              than a sprite because the standing decision is that Atlas stays vector. */}
          <Tile
            label="Atlas"
            on={avatarId === ATLAS_AVATAR_ID}
            onPress={() => setAvatarId(ATLAS_AVATAR_ID)}
            delay={0}>
            <Atlas size={40} expression="happy" interactive={false} />
          </Tile>

          {CHARACTER_AVATARS.map((a: Avatar, i: number) => (
            <Tile
              key={a.id}
              label={a.label}
              on={a.id === avatarId}
              onPress={() => setAvatarId(a.id)}
              delay={Math.min((i + 1) * 18, STAGGER_CAP)}>
              <PixelSpriteView sprite={a.sprite} size={40} />
            </Tile>
          ))}
        </View>

        <ThemedText type="label" themeColor="mutedForeground" style={styles.groupLabel}>MARKS</ThemedText>
        <View style={styles.grid}>
          {MARK_AVATARS.map((a: Avatar, i: number) => (
            <Tile
              key={a.id}
              label={a.label}
              on={a.id === avatarId}
              onPress={() => setAvatarId(a.id)}
              delay={Math.min(i * 14, STAGGER_CAP)}>
              <PixelSpriteView sprite={a.sprite} size={38} />
            </Tile>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.one },
  scroll: { paddingHorizontal: Spacing.three, paddingBottom: BottomTabInset + Spacing.six },
  groupLabel: { marginTop: Spacing.four },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.two },
  /** Four across. 25% each with the gap taken as padding, so the wrap cannot round into three. */
  cell: { width: '25%', paddingHorizontal: Spacing.one, marginBottom: Spacing.three },
  tile: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
  },
});
