/**
 * Onboarding — 6-step flow from the design mockups:
 * goal → level → momentum (4× chart) → social proof → path ready → paywall.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { GrowthChart, OptionCard, ProgressHeader, Stars } from '@/components/onboarding-parts';
import { UIcon } from '@/components/ui-icon';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const GOALS = [
  { key: 'wealth', icon: 'wallet', title: 'Grow my wealth', sub: 'Build long-term investing habits' },
  { key: 'learn', icon: 'gradCap', title: 'Learn how investing works', sub: 'Start from the fundamentals' },
  { key: 'trade', icon: 'bolt', title: 'Trade with confidence', sub: 'Practice without real risk' },
  { key: 'economy', icon: 'globe', title: 'Understand the economy', sub: 'Make sense of money & markets' },
];

const LEVELS = [
  { key: 'beginner', icon: 'seedling', title: 'Total beginner', sub: "I'm starting from zero" },
  { key: 'basics', icon: 'bookOpen', title: 'I know the basics', sub: 'Stocks, saving, a little more' },
  { key: 'experienced', icon: 'rocket', title: "I'm experienced", sub: 'I want to sharpen my edge' },
];

const TESTIMONIALS = [
  { quote: '"I finally understand how the market actually works. Atlas makes it click."', name: 'Maya R. · new investor' },
  { quote: '"The paper trading is addictive. I learned more in a week than in a year of videos."', name: 'Devin K.' },
  { quote: '"Feels like a game, but I\'m actually building real skills."', name: 'Priya S.' },
];

const PRO_PERKS = ['Unlimited lessons & quizzes', 'Atlas AI coach, 24/7', 'Advanced paper trading & analytics', 'Streak protection & rewards'];

const TOTAL = 6;

export default function Onboarding() {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const next = () => (step < TOTAL - 1 ? setStep(step + 1) : router.replace('/home'));
  const back = () => (step > 0 ? setStep(step - 1) : undefined);
  const canContinue = step === 0 ? goal !== null : step === 1 ? level !== null : true;

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground />
      <View style={styles.header}>
        <ProgressHeader step={step} total={TOTAL} onBack={back} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <RiseIn key="s0">
            <View style={styles.centered}>
              <Atlas size={64} entrance="bounce" celebrate={goal !== null} expression={goal !== null ? 'happy' : 'default'} />
            </View>
            <ThemedText type="display" style={styles.q}>What brings you to Euphoria?</ThemedText>
            <View style={styles.options}>
              {GOALS.map((g, i) => (
                <RiseIn key={g.key} delay={140 + i * 70}>
                  <OptionCard icon={g.icon} title={g.title} sub={g.sub} selected={goal === g.key} onPress={() => setGoal(g.key)} />
                </RiseIn>
              ))}
            </View>
          </RiseIn>
        )}

        {step === 1 && (
          <RiseIn key="s1">
            <View style={styles.centered}>
              <Atlas size={64} entrance="bounce" celebrate={level !== null} expression={level !== null ? 'happy' : 'watching'} />
            </View>
            <ThemedText type="display" style={styles.q}>How much do you already know?</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>Atlas will tune every lesson to your level.</ThemedText>
            <View style={styles.options}>
              {LEVELS.map((l, i) => (
                <RiseIn key={l.key} delay={140 + i * 70}>
                  <OptionCard icon={l.icon} title={l.title} sub={l.sub} selected={level === l.key} onPress={() => setLevel(l.key)} />
                </RiseIn>
              ))}
            </View>
          </RiseIn>
        )}

        {step === 2 && (
          <RiseIn key="s2">
            <View style={styles.centered}>
              <Atlas size={78} expression="happy" entrance="bounce" />
              <ThemedText type="display" style={[styles.q, styles.center]}>
                Practice daily and{'\n'}you'll{' '}
                <ThemedText type="display" style={{ color: theme.primary }}>grow 4× faster</ThemedText>
              </ThemedText>
            </View>
            <View style={{ marginTop: Spacing.four }}>
              <GrowthChart />
            </View>
            <ThemedText type="body" themeColor="mutedForeground" style={[styles.sub, styles.center, { marginTop: Spacing.three }]}>
              Just 10 minutes a day builds real investing instinct — Atlas keeps you on streak.
            </ThemedText>
          </RiseIn>
        )}

        {step === 3 && (
          <RiseIn key="s3">
            <ThemedText type="display" style={styles.q}>
              Join <ThemedText type="display" style={{ color: theme.primary }}>50,000+</ThemedText>{'\n'}new investors
            </ThemedText>
            <View style={styles.ratingRow}>
              <Stars />
              <ThemedText type="smallBold" themeColor="mutedForeground">4.9 · App Store</ThemedText>
            </View>
            <View style={{ gap: Spacing.two + 4, marginTop: Spacing.three }}>
              {TESTIMONIALS.map((t, i) => (
                <RiseIn key={t.name} delay={100 + i * 80}>
                  <Card>
                    <ThemedText type="bodyMedium" style={{ lineHeight: 22 }}>{t.quote}</ThemedText>
                    <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: Spacing.one }}>{t.name}</ThemedText>
                  </Card>
                </RiseIn>
              ))}
            </View>
          </RiseIn>
        )}

        {step === 4 && (
          <RiseIn key="s4">
            <View style={styles.centered}>
              <Atlas size={112} expression="proud" entrance="bounce" celebrate />
              <ThemedText type="display" style={[styles.q, styles.center]}>Your path is ready!</ThemedText>
              <ThemedText type="body" themeColor="mutedForeground" style={[styles.sub, styles.center]}>
                Personalized for a curious {level === 'experienced' ? 'trader' : 'beginner'} who wants to {goal === 'trade' ? 'trade with confidence' : 'grow wealth'}.
              </ThemedText>
            </View>
            <View style={{ marginTop: Spacing.four }}>
              {['Foundations — how markets work', 'Risk & psychology', 'Trading with confidence'].map((item, i) => (
                <RiseIn key={item} delay={200 + i * 110}>
                  <View style={styles.pathRow}>
                    <View style={[styles.numDot, { backgroundColor: i === 0 ? theme.primary : theme.muted }]}>
                      <ThemedText type="smallBold" style={{ color: i === 0 ? '#fff' : theme.mutedForeground }}>{i + 1}</ThemedText>
                    </View>
                    <ThemedText type="bodyMedium">{item}</ThemedText>
                  </View>
                  {i < 2 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                </RiseIn>
              ))}
            </View>
            <View style={[styles.targetChip, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '44' }]}>
              <UIcon name="target" size={22} color={theme.iconLilac} />
              <ThemedText type="smallBold" style={{ flex: 1 }}>Reach your first $10k paper portfolio by Aug 30</ThemedText>
            </View>
          </RiseIn>
        )}

        {step === 5 && (
          <RiseIn key="s5">
            <View style={styles.centered}>
              <Atlas size={100} entrance="bounce" expression="happy" />
              <ThemedText type="display" style={[styles.q, styles.center]}>
                Unlock <ThemedText type="display" style={{ color: theme.primary }}>Euphoria Pro</ThemedText>
              </ThemedText>
            </View>
            <View style={{ marginTop: Spacing.four }}>
              {PRO_PERKS.map((perk, i) => (
                <RiseIn key={perk} delay={180 + i * 90}>
                  <View style={styles.pathRow}>
                    <Svg width={24} height={24} viewBox="0 0 24 24">
                      <Circle cx={12} cy={12} r={11} fill={theme.primary + '2A'} />
                      <Path d="M7.5 12.5l3 3 6-6.5" stroke={theme.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                    <ThemedText type="bodyMedium">{perk}</ThemedText>
                  </View>
                  {i < PRO_PERKS.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                </RiseIn>
              ))}
            </View>
            <ThemedText type="small" themeColor="mutedForeground" style={[styles.center, { marginTop: Spacing.three }]}>
              7 days free, then $59.99/yr ($4.99/mo). Cancel anytime.
            </ThemedText>
          </RiseIn>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={step === 4 ? 'Start learning' : step === 5 ? 'Start my 7-day free trial' : 'Continue'}
          full
          disabled={!canContinue}
          onPress={next}
        />
        {step === 5 && (
          <SpringPressable haptic={false} onPress={() => router.replace('/home')} style={styles.maybeLater}>
            <ThemedText type="small" themeColor="mutedForeground">Maybe later</ThemedText>
          </SpringPressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  content: { padding: Spacing.four, paddingTop: Spacing.three, flexGrow: 1, justifyContent: 'center' },
  q: { marginTop: Spacing.three },
  sub: { marginTop: Spacing.one },
  options: { marginTop: Spacing.four },
  centered: { alignItems: 'center' },
  center: { textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two },
  pathRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, paddingVertical: Spacing.two + 4 },
  numDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 40 },
  targetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 4,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.four,
  },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
  maybeLater: { alignItems: 'center', paddingTop: Spacing.three },
});
