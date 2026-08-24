/**
 * Entry points into Atlas chat.
 *
 * One component, six placements. The alternative — a bespoke button per screen — is how you end up
 * with six slightly different Atlas affordances that drift apart, and it is six places to fix when
 * the route changes.
 *
 * Deliberately NOT a floating action button. This app measures tab-bar clearance carefully (the
 * Home rail was moved 801 -> 701 to clear it by 118pt), and a FAB would sit on top of content on
 * every tab. The header slot is empty on all five tabs and collides with nothing.
 *
 * `topic` is the CONTEXT the chat header shows. 4/5 of the ScreensDesign reference apps put the
 * subject you arrived from in the chat header rather than a generic title — Astra AI shows
 * 'Ask / Computer Science', Answer.AI shows the lesson name. Passing it here is what makes that
 * possible, so pass it wherever the screen knows what the user is looking at.
 */
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** The only place the chat route is constructed. Home drives this directly because it already has
 *  an Atlas in its greeting — a second Atlas button beside the first would be absurd. */
export function openAtlasChat(topic?: string) {
  router.push(topic ? `/chat?topic=${encodeURIComponent(topic)}` : '/chat');
}

const open = openAtlasChat;

/** Compact circular Atlas, for a screen header. */
export function AskAtlasButton({ topic }: { topic?: string }) {
  const theme = useTheme();
  return (
    <SpringPressable
      haptic={false}
      onPress={() => { open(topic); }}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={topic ? `Ask Atlas about ${topic}` : 'Ask Atlas'}
    >
      <View style={[styles.round, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Atlas size={26} interactive={false} />
      </View>
    </SpringPressable>
  );
}

/**
 * Full-width row, for the end of a lesson or an article — the moment a question is most likely.
 * Gauth ($600k/mo) puts its escalation exactly here, at the point the user might still be stuck,
 * rather than leaving them to go hunting for help.
 */
export function AskAtlasRow({ topic, label }: { topic?: string; label?: string }) {
  const theme = useTheme();
  return (
    <SpringPressable
      haptic={false}
      onPress={() => open(topic)}
      accessibilityRole="button"
      accessibilityLabel={label ?? (topic ? `Ask Atlas about ${topic}` : 'Ask Atlas')}
    >
      <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Atlas size={34} expression="watching" interactive={false} />
        <View style={styles.rowText}>
          <ThemedText type="bodyMedium">{label ?? 'Still not clear?'}</ThemedText>
          <ThemedText type="label" themeColor="mutedForeground" numberOfLines={1}>
            Ask Atlas about {topic ?? 'this'}
          </ThemedText>
        </View>
        <UIcon name="arrowRight" size={17} color={theme.iconLilac} />
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  round: {
    // 40pt drawn, but the press target is widened by hitSlop at the call site below: this button
    // sits in three tab headers directly beside the 44pt ProfileButton, and the app's own standard
    // (profile-button.tsx) is the 44pt HIG minimum. Growing the circle would change the design;
    // hitSlop 4 makes the TARGET 48pt without moving a pixel.
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  rowText: { flex: 1, gap: 2 },
});
