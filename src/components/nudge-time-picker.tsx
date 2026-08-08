/**
 * UNIT 15a — the notification time picker. ONE component, TWO mounts (§15.3b decision 4).
 *
 * Headway `128567` is the reference and the placement is the whole point: it captures the time
 * BEFORE the system permission prompt. The user chooses *when*, so iOS is only asking *whether* —
 * a question that is much easier to say yes to than a cold "Allow notifications?".
 *
 * Mounted in onboarding immediately before the prompt, and again as an editable Settings row so
 * the feature has a findable home rather than living only in a screen you see once.
 */
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/lib/store';

/**
 * 24h hour -> the label iOS itself would show, e.g. 19 -> "7:00 PM".
 * Lifted verbatim out of settings/[section].tsx, which had it as a local const, so the picker and
 * the row it feeds cannot ever disagree about how an hour reads.
 */
export const hourLabel = (h: number) => `${String(((h + 11) % 12) + 1)}:00 ${h < 12 ? 'AM' : 'PM'}`;

export function NudgeTimePicker({ compact = false }: { compact?: boolean }) {
  const nudgeHour = useApp((s) => s.nudgeHour);
  const setNudgeHour = useApp((s) => s.setNudgeHour);

  /*
   * The picker is controlled by an hour, not a Date, because the hour is what actually gets
   * scheduled. Building the Date here rather than storing one avoids persisting a timestamp that
   * would be wrong the next day and would drift across time zones.
   */
  const value = new Date();
  value.setHours(nudgeHour, 0, 0, 0);

  return (
    <View style={compact ? styles.compact : styles.block}>
      {!compact && (
        <ThemedText type="small" themeColor="mutedForeground">
          Atlas will nudge you at {hourLabel(nudgeHour)}.
        </ThemedText>
      )}
      {/*
       * The width is NOT cosmetic. The native compact time picker has an intrinsic width that
       * overflows a settings row's right-hand slot, and it clips rather than shrinking: the first
       * build rendered "7:00 P" with the M off the edge of a 402pt screen. Caught by reading the
       * screenshot — the a11y tree reports the row as present and says nothing about the clipping.
       */}
      <DateTimePicker
        mode="time"
        value={value}
        style={compact ? styles.pickerCompact : undefined}
        onValueChange={(_e, date) => {
          setNudgeHour(date.getHours());
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: Spacing.two, alignItems: 'center' },
  compact: { alignItems: 'flex-end' },
  // Wide enough for "12:00 PM", the longest label, and no wider.
  pickerCompact: { width: 104, height: 34 },
});
