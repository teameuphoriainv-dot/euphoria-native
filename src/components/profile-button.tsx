/**
 * <ProfileButton> — your avatar, top-right, on every tab. The way into /you.
 *
 * ── WHY THIS EXISTS ────────────────────────────────────────────────────────────────────────────
 * The owner: "I do not see a profile pathway anywhere."
 *
 * He was right, and home.tsx had already written down exactly why. `/you` was reachable from
 * precisely ONE place — tapping the "Hey there" greeting on Home — and that file states the
 * ceiling in its own comment: "this puts profile on HOME only. The web app keeps it reachable from
 * every screen via the hamburger. A persistent header entry on all five tabs is the fuller version
 * and is not done here." This is that fuller version. The greeting tap stays; it is now a shortcut
 * rather than the only door.
 *
 * ── WHY NOT A SIXTH TAB ────────────────────────────────────────────────────────────────────────
 * Because that was already tried and deliberately reversed, and (tabs)/_layout.tsx records it: the
 * cofounder asked for Games to LEAVE the You tab and be "a bigger, more visible part of the app",
 * the web reference has no You tab either, and five slots is the practical maximum before iOS adds
 * a More overflow and the labels truncate — which they already did once at accessibility sizes.
 * Profile is the thing you VISIT, not the thing you do. So it gets a persistent affordance, not a
 * tab slot.
 *
 * ── WHY THE AVATAR AND NOT AN ICON ─────────────────────────────────────────────────────────────
 * A generic person glyph would have done the navigation job. The avatar does that AND pays off the
 * picker: you can now choose a character, a title and an earned banner, and until now none of them
 * appeared anywhere you would look. A cosmetic you cannot see is a cosmetic nobody works for.
 *
 * The ring is `border`, one hairline, so it reads as a control on a busy header without adding
 * chrome. No glow, no gradient — the standing rule.
 */
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ProfileAvatar } from '@/components/profile-avatar';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/**
 * 36pt of avatar inside a 44pt target. 44 is Apple's minimum touch size and this sits in a corner
 * next to a scroll view, which is exactly where an undersized target gets missed.
 */
const AVATAR = 36;
const TARGET = 44;

export function ProfileButton() {
  const theme = useTheme();

  return (
    <SpringPressable
      haptic={false}
      scaleTo={0.92}
      onPress={() => { router.push('/you'); }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Your profile"
      style={styles.target}>
      <View style={[styles.ring, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <ProfileAvatar size={AVATAR} />
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  target: { width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center' },
  ring: {
    width: AVATAR + 4,
    height: AVATAR + 4,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
