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
import { useMemo, useState, type ReactNode } from 'react';
import { InputAccessoryView, Keyboard, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, FontSize, Radius, Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Atlas } from '@/components/atlas';
import { ATLAS_AVATAR_ID, CHARACTER_AVATARS, MARK_AVATARS, type Avatar } from '@/lib/avatars';
import { PixelSpriteView } from '@/lib/pixel';
import { useShallow } from 'zustand/react/shallow';

import { NAME_MAX, useApp } from '@/lib/store';
import { achievementById, pickAchievementState } from '@/lib/achievements';
import { BANNERS, unlockedBanners } from '@/lib/banners';
import { ProfileBanner } from '@/components/profile-banner';
import { ProfileAvatar } from '@/components/profile-avatar';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP } from '@/shared/motion/tokens';

const PROFILE_AVATAR_KEYBOARD_ACCESSORY_ID = 'profile-avatar-name-keyboard-accessory';

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
  const bannerId = useApp((s) => s.bannerId);
  const setBannerId = useApp((s) => s.setBannerId);
  // `profile.name` is nullable — onboarding can be skipped — so the fallback is the label the
  // rest of the app already uses for an unnamed account rather than an empty banner.
  const name = useApp((s) => s.profile.name ?? 'You');
  const titleId = useApp((s) => s.titleId);
  const setDisplayName = useApp((s) => s.setDisplayName);

  /*
   * The whole store, ONCE, for the achievement predicates — and then narrowed.
   *
   * `unlockedBanners` needs an AchievementState, which is many fields, so useShallow over exactly
   * those is the right shape: the same reasoning that took Home off `useApp((st) => st)`, applied
   * before this screen could acquire the same defect.
   */
  const achState = useApp(useShallow(pickAchievementState));
  const unlocked = useMemo(() => new Set(unlockedBanners(achState).map((b) => b.id)), [achState]);

  /*
   * The name is edited in a LOCAL draft and committed on blur, not on every keystroke.
   *
   * Writing straight to the store per character would persist to AsyncStorage on every letter and
   * re-render every subscriber of profile.name mid-word. The draft also lets the field hold an
   * empty string while you clear it — the store REJECTS empty, so a store-backed input would fight
   * the user's backspace and snap the old name back under their cursor.
   */
  /*
   * Seeded from the RAW value, not from `name`. `name` falls back to the literal "You" for an
   * account that skipped onboarding, and seeding the draft with it meant tapping into the field and
   * tapping straight out fired commitName("You") — which the store accepts, since it is non-empty
   * after trimming. A placeholder would have been silently promoted to a real chosen name.
   * The banner preview still reads `draft || name`, so it keeps showing "You" until you type.
   */
  const [draft, setDraft] = useState(() => useApp.getState().profile.name ?? '');
  const commitName = () => {
    setDisplayName(draft);
    // Re-seat from the store, so the trim/cap/reject rules are visible instead of leaving the
    // field showing something that was never saved.
    setDraft(useApp.getState().profile.name ?? '');
  };

  const earnedTitle = titleId ? achievementById(titleId)?.title ?? '' : '';

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
        {/* A LIVE PREVIEW, first. Every control below changes this exact strip, which is what makes
            the screen a profile editor rather than three unrelated pickers. */}
        <ProfileBanner bannerId={bannerId} name={draft || name} title={earnedTitle}>
          <ProfileAvatar size={56} />
        </ProfileBanner>

        <ThemedText type="label" themeColor="mutedForeground" style={styles.groupLabel}>DISPLAY NAME</ThemedText>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          inputAccessoryViewID={Platform.OS === 'ios' ? PROFILE_AVATAR_KEYBOARD_ACCESSORY_ID : undefined}
          onBlur={commitName}
          onSubmitEditing={commitName}
          returnKeyType="done"
          maxLength={NAME_MAX}
          placeholder="Your name"
          placeholderTextColor={theme.mutedForeground}
          accessibilityLabel="Display name"
          style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
        />
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 4 }}>
          {`${String(draft.length)}/${String(NAME_MAX)}`}
        </ThemedText>

        {Platform.OS === 'ios' ? (
          <InputAccessoryView nativeID={PROFILE_AVATAR_KEYBOARD_ACCESSORY_ID}>
            <View style={[styles.keyboardAccessory, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
              <SpringPressable
                haptic={false}
                accessibilityLabel="Done editing"
                onPress={() => Keyboard.dismiss()}
                style={styles.keyboardDoneButton}>
                <ThemedText type="body" style={{ color: theme.iconLilac }}>
                  Done
                </ThemedText>
              </SpringPressable>
            </View>
          </InputAccessoryView>
        ) : null}

        <ThemedText type="label" themeColor="mutedForeground" style={styles.groupLabel}>BANNER</ThemedText>
        <View style={styles.bannerGrid}>
          {BANNERS.map((b) => {
            const open = unlocked.has(b.id);
            const req = b.requires ? achievementById(b.requires) : null;
            const selected = bannerId === b.id;
            return (
              <View key={b.id} style={styles.bannerCell}>
                <SpringPressable
                  disabled={!open}
                  onPress={() => { setBannerId(b.id); }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: !open }}
                  accessibilityLabel={open ? `Use the ${b.label} banner` : `${b.label} banner, locked. ${req?.hint ?? ''}`}>
                  <View
                    style={[
                      styles.bannerOption,
                      {
                        backgroundColor: theme.card,
                        borderColor: selected ? theme.primary : theme.border,
                        borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                      },
                    ]}>
                    <View style={[styles.bannerSwatch, { backgroundColor: b.band }]}>
                      <PixelSpriteView sprite={b.motif} size={24} canvas="dark" />
                      <ThemedText type="bodyMedium" numberOfLines={1} style={[styles.bannerName, { color: b.ink }]}>
                        {b.label}
                      </ThemedText>
                      <View style={[styles.bannerStatus, { backgroundColor: b.band }]}>
                        <UIcon
                          name={selected ? 'check' : open ? 'sparkle' : 'lock'}
                          size={14}
                          color={b.ink}
                        />
                      </View>
                    </View>
                    <ThemedText
                      type="small"
                      themeColor="mutedForeground"
                      numberOfLines={2}
                      style={styles.bannerMeta}>
                      {selected ? 'Selected' : open ? 'Available' : req?.hint ?? 'Locked'}
                    </ThemedText>
                  </View>
                </SpringPressable>
              </View>
            );
          })}
        </View>


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
  input: {
    fontFamily: Fonts.body,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: FontSize.bodyLg,
  },
  keyboardAccessory: { minHeight: 46, borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: Spacing.three },
  keyboardDoneButton: { minWidth: 64, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  bannerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  bannerCell: { width: '48.5%' },
  bannerOption: { borderRadius: Radius.lg, padding: Spacing.one, minHeight: 92 },
  bannerSwatch: {
    height: 52,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  bannerName: { flex: 1 },
  bannerStatus: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFFFFF33',
  },
  bannerMeta: { minHeight: 30, paddingHorizontal: Spacing.one, paddingTop: Spacing.one },
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
