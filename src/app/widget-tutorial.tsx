/**
 * UNIT 15e — the widget tutorial.
 *
 * This screen exists because iOS gives no API to place a widget. Duolingo and Elevate both ship one
 * for the same reason, and it is the ONLY place Unit 15's "well animated" goal can actually land:
 * WidgetKit renders a static SwiftUI timeline, so the widget itself cannot move (§15.0). The
 * animation budget belongs here.
 *
 * Elevate `111697`-`111699` is the reference: 3 steps with pagination dots. The steps below are the
 * real iOS 26 gesture sequence, performed and verified on the simulator rather than recalled.
 */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { childDelay } from '@/shared/motion/step-transition';

const STEPS = [
  {
    title: 'Touch and hold',
    body: 'Press an empty part of your home screen and hold until the icons start to wiggle.',
  },
  {
    title: 'Tap Edit, then Add Widget',
    body: 'Edit is in the top-left corner. The menu that opens has Add Widget at the top.',
  },
  {
    title: 'Search Euphoria',
    body: 'Pick a size — small fits the streak, medium adds your XP — then tap Add Widget.',
  },
];

export default function WidgetTutorial() {
  const theme = useTheme();
  const router = useRouter();
  const { xp } = useLocalSearchParams<{ xp?: string }>();
  const [step, setStep] = useState(0);

  const widgetAdded = useApp((s) => s.widgetAdded);
  const markWidgetAdded = useApp((s) => s.markWidgetAdded);
  const addXp = useApp((s) => s.addXp);

  const last = step === STEPS.length - 1;

  function finish() {
    /*
     * The `widgetAdded` guard is what makes the XP award idempotent. Without it, re-opening the
     * tutorial from Settings would pay out again every time — the same class of bug as awarding XP
     * on a CTA tap rather than on completion.
     */
    if (!widgetAdded) {
      markWidgetAdded();
      const bonus = Number(xp ?? 0);
      if (Number.isFinite(bonus) && bonus > 0) addXp(bonus);
    }
    router.back();
  }

  const current = STEPS[step];
  if (!current) return null;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Add the widget', headerBackTitle: 'Back' }} />

      {/* Keyed on `step` so the entering animation re-runs per step rather than only on mount. */}
      <View style={styles.stage} key={step}>
        <RiseIn>
          <Atlas size={104} expression={last ? 'proud' : 'thinking'} interactive={false} idle />
        </RiseIn>

        <RiseIn delay={childDelay(0)}>
          <ThemedText type="title" style={styles.title}>
            {current.title}
          </ThemedText>
        </RiseIn>

        <RiseIn delay={childDelay(1)}>
          <ThemedText type="body" themeColor="textSecondary" style={styles.body}>
            {current.body}
          </ThemedText>
        </RiseIn>
      </View>

      {/* Pagination dots — Elevate ships them and they are what tells the user this is short. */}
      <View style={styles.dots} accessibilityLabel={`Step ${String(step + 1)} of ${String(STEPS.length)}`}>
        {STEPS.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              { backgroundColor: i === step ? theme.primary : theme.border },
              i === step && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <SlabButton
          label={last ? 'Done' : 'Next'}
          full
          onPress={() => {
            if (last) finish();
            else setStep((n) => n + 1);
          }}
        />
        <Pressable
          style={styles.skip}
          accessibilityRole="button"
          accessibilityLabel={step === 0 ? 'Not now' : 'Back'}
          onPress={() => {
            if (step === 0) router.back();
            else setStep((n) => n - 1);
          }}>
          <ThemedText type="small" themeColor="mutedForeground">
            {step === 0 ? 'Not now' : 'Back'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: Spacing.four, paddingBottom: Spacing.five },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 300 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.two, marginBottom: Spacing.four },
  dot: { width: 8, height: 8, borderRadius: Radius.sm },
  dotActive: { width: 22 },
  actions: { gap: Spacing.two },
  // 44pt, same floor as the promo sheet's Not now.
  skip: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.four },
});
