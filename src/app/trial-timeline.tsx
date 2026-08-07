/**
 * Trial timeline — its own full screen, followed by the pricing screen.
 *
 * ── WHY THIS IS A ROUTE AND NOT A BLOCK ───────────────────────────────────────────────────────
 * §6.6.2 said the timeline must never become its own route, and commit 59c27da removed an earlier
 * standalone version. That instruction was VOID once the evidence was checked properly (§22 C9,
 * refined by C20). With four apps verified:
 *   Nibble  918  132921  $450k    its own full screen — X top-right, CTA pinned
 *   Promova 936  138757  $250k    its own full screen, NO price, separate pricing screen next
 *   Headway 891  128586  $850k    its own modal — X, full-width "Start free trial"
 *   Quizlet 874  147530  $2.25M   embedded — it IS the paywall header
 * 3 of 4 give it its own surface. The user reopened the decision on that basis and chose standalone.
 *
 * Shape follows Promova/Headway: three beats, a vertical connector, a trust line, one pinned CTA,
 * and NO PRICE — pricing is the next screen, so this one only has to be understood, not decided on.
 *
 * ── THE DIVERGENCE THAT MATTERS: NO DATE PILL ─────────────────────────────────────────────────
 * 3/3 reference apps put a real date on the reminder beat — Headway "April 21", Nibble "April 30",
 * Quizlet "June 1, 2025" — because their trials are CALENDAR trials: seven days from today, so the
 * end date is arithmetic.
 *
 * Euphoria's trial is DAYS USED (§9.2), deliberately, so that installing and forgetting for a week
 * cannot burn it. The direct consequence is that **there is no computable end date** — a user's day
 * 2 might be tomorrow or next month. Printing a date here would be inventing information, which is
 * exactly what §0.4 forbids. So the beats are labelled by USAGE day and the reminder promises no
 * date. This is a real cost of the days-used model and it is the honest trade.
 *
 * COPY IS UNAPPROVED (§20.3).
 */
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon, type UIconName } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TRIAL_DAYS } from '@/lib/entitlement';

/**
 * Three beats. Headway and Nibble both use unlock -> reminder -> ends, and both label the first
 * beat TODAY rather than "day 1" — the present tense is what makes it read as already granted.
 *
 * The middle beat is DAY 2 by user decision: the references use day 5 of 7, which does not exist in
 * a three-day trial. Its copy deliberately makes no date promise — see the header note.
 */
const BEATS: { label: string; icon: UIconName; tone: 'accent' | 'warn' | 'muted'; body: string }[] = [
  {
    label: 'TODAY',
    icon: 'sparkle',
    tone: 'accent',
    body: 'Everything is open — every lesson, unlimited Atlas, the full options desk.',
  },
  {
    label: 'DAY 2',
    icon: 'bell',
    tone: 'warn',
    body: "We'll remind you before anything is charged.",
  },
  {
    label: `DAY ${TRIAL_DAYS}`,
    icon: 'lock',
    tone: 'muted',
    body: 'Your third day of use is the last one. After that, Pro keeps it open.',
  },
];

export default function TrialTimeline() {
  const theme = useTheme();
  const router = useRouter();

  const toneColor = (t: 'accent' | 'warn' | 'muted') =>
    t === 'accent' ? theme.iconLilac : t === 'warn' ? theme.warning : theme.mutedForeground;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <AmbientBackground starCount={30} />

      {/* X top-right, matching all three standalone references. Dismissible on purpose: this screen
          explains, it does not gate. */}
      <Pressable
        style={[styles.close, { backgroundColor: theme.cardElevated }]}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={() => router.back()}>
        <UIcon name="close" size={18} color={theme.textSecondary} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText type="display" style={styles.title}>
          How your free{'\n'}
          {TRIAL_DAYS} days work
        </ThemedText>

        <View style={styles.beats}>
          {BEATS.map((b, i) => (
            <View key={b.label} style={styles.beatRow}>
              <View style={styles.railCol}>
                {/* Card with a coloured label bar on top, icon beneath — Nibble's structure (§22 C12). */}
                <View style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.card }]}>
                  <View style={[styles.chipLabel, { backgroundColor: toneColor(b.tone) + '26' }]}>
                    <ThemedText type="label" style={{ color: toneColor(b.tone), fontSize: 9 }}>
                      {b.label}
                    </ThemedText>
                  </View>
                  <View style={styles.chipIcon}>
                    <UIcon name={b.icon} size={22} color={toneColor(b.tone)} />
                  </View>
                </View>
                {/* Connector, drawn between beats only — a trailing stub reads as a broken list. */}
                {i < BEATS.length - 1 && (
                  <View style={[styles.connector, { backgroundColor: theme.border }]} />
                )}
              </View>
              <ThemedText type="body" themeColor="textSecondary" style={styles.beatBody}>
                {b.body}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Trust line then one pinned CTA — Promova's footer shape. Still no price: the next screen
          owns that, so this one only has to be understood. */}
      <View style={styles.footer}>
        <ThemedText type="smallBold" style={styles.trust}>
          No card needed now
        </ThemedText>
        <ThemedText type="small" themeColor="mutedForeground" style={styles.trust}>
          Cancel any time. Nothing is charged without asking you first.
        </ThemedText>
        <GradientButton label="See Euphoria Pro" full onPress={() => router.push('/onboarding?step=paywall')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  close: {
    position: 'absolute',
    top: Spacing.six,
    right: Spacing.four,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.six + Spacing.two, paddingBottom: Spacing.four },
  title: { marginBottom: Spacing.five },
  beats: { gap: 0 },
  beatRow: { flexDirection: 'row', gap: Spacing.three },
  railCol: { alignItems: 'center' },
  chip: { width: 58, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  chipLabel: { paddingVertical: 3, alignItems: 'center' },
  chipIcon: { height: 40, alignItems: 'center', justifyContent: 'center' },
  connector: { width: 2, flex: 1, minHeight: Spacing.four },
  beatBody: { flex: 1, paddingTop: Spacing.one, paddingBottom: Spacing.five },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four, gap: Spacing.one },
  trust: { textAlign: 'center' },
});
