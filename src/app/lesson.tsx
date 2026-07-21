/**
 * Lesson viewer — the learn loop (design mockups 3–4 + Brilliant recording): intro →
 * teach → predict-then-reveal quiz → interactive reveal → celebration. Full-screen stack
 * route; Learn's START node pushes here. Mock lesson content until Phase 3 wires courses.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Confetti } from '@/components/confetti';
import { MultiSelect, type MultiSpec } from '@/components/multi-select';
import { MatchingPairs, type MatchSpec } from '@/components/matching-pairs';
import { BeforeAfterSlider, type BeforeAfterSpec } from '@/components/before-after-slider';
import { OrderSteps, type OrderSpec } from '@/components/order-steps';
import { NumberLine, type NumberLineSpec } from '@/components/number-line';
import { SliderPredict, type SliderSpec } from '@/components/slider-predict';
import { SortBuckets, type SortSpec } from '@/components/sort-buckets';
import { TapReveal, type RevealSpec } from '@/components/tap-reveal';
import { TileBuilder, type TileSpec } from '@/components/tile-builder';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RewardPop } from '@/shared/motion/reward-pop';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const STEPS = ['intro', 'teach', 'slider', 'build', 'sort', 'multi', 'line', 'match', 'order', 'compare', 'cards', 'quiz', 'reveal', 'done'] as const;
const CARDS: RevealSpec = {
  title: 'Flip to learn four key terms.',
  cards: [
    { term: 'Bull market', def: 'A stretch of rising prices and optimism.' },
    { term: 'Bear market', def: 'A 20%+ fall, when pessimism sets in.' },
    { term: 'Dividend', def: 'A slice of profits paid to shareholders.' },
    { term: 'Diversification', def: 'Spreading money across assets to cut risk.' },
  ],
};
const SORT: SortSpec = {
  title: 'Sort each expense: need, want, or save?',
  categories: ['Needs', 'Wants', 'Save'],
  items: [
    { label: 'Rent', correct: 'Needs' },
    { label: 'Netflix subscription', correct: 'Wants' },
    { label: 'Groceries', correct: 'Needs' },
    { label: 'New sneakers', correct: 'Wants' },
    { label: 'Emergency fund', correct: 'Save' },
  ],
};
const MULTI: MultiSpec = {
  title: 'Which of these are assets? Select all that apply.',
  hint: 'Assets put money in your pocket — pick every one.',
  options: [
    { label: 'A rental property you own', correct: true },
    { label: 'Credit-card debt', correct: false },
    { label: 'Dividend-paying stocks', correct: true },
    { label: 'A car loan', correct: false },
    { label: 'A high-yield savings account', correct: true },
  ],
};
const NUMLINE: NumberLineSpec = {
  prompt: 'Stocks have historically returned about 10% a year. Tap the line to place that rate.',
  min: 0,
  max: 20,
  target: 10,
  tolerance: 1.5,
  ticks: [0, 5, 10, 15, 20],
  format: (n) => `${Math.round(n)}%`,
};
const MATCH: MatchSpec = {
  title: 'Match each term to its meaning.',
  pairs: [
    { left: 'Dividend', right: 'A share of profits paid to owners' },
    { left: 'Liquidity', right: 'How fast an asset converts to cash' },
    { left: 'Volatility', right: 'How much a price swings' },
    { left: 'Compounding', right: 'Earning returns on past returns' },
  ],
};
const ORDER: OrderSpec = {
  title: 'Order these from lowest to highest risk.',
  hint: 'Tap two rows to swap them.',
  items: ['Savings account', 'Government bonds', 'Index funds', 'Individual stocks'],
};
const money = (n: number) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const SLIDER: SliderSpec = {
  prompt: 'Invest $100/month at 8% a year. Drag to guess its value after 30 years.',
  max: 220000,
  answer: 150030,
  format: money,
};
const BEFOREAFTER: BeforeAfterSpec = {
  prompt: 'Watch $10,000 lose value to 3% inflation. Slide 20 years forward.',
  beforeLabel: 'Today',
  afterLabel: 'In 20 years',
  beforeValue: 10000,
  afterValue: 5537,
  caption: 'Same $10,000 — inflation quietly halved what it buys.',
  format: money,
};
const OPTIONS = ["Yes — you break even", "No — you're still down", "No — you're slightly up"];
const CORRECT = 1;
const PAYCHECK: TileSpec = {
  title: 'Split a $3,000 paycheck with the 50/30/20 rule.',
  slots: [
    { label: 'Needs · 50%', correct: '$1,500' },
    { label: 'Wants · 30%', correct: '$900' },
    { label: 'Save · 20%', correct: '$600' },
  ],
  tray: ['$1,500', '$900', '$600', '$1,000', '$300'],
};

export default function Lesson() {
  const theme = useTheme();
  // dev-only: ?step=<name> jumps straight to a step for visual QA (ignored in production)
  const params = useLocalSearchParams<{ step?: string }>();
  const startAt = __DEV__ && params.step ? STEPS.indexOf(params.step as (typeof STEPS)[number]) : -1;
  const [step, setStep] = useState(startAt >= 0 ? startAt : 0);
  const [pick, setPick] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [buildSolved, setBuildSolved] = useState(false);
  const [sliderTouched, setSliderTouched] = useState(false);
  const [sortSolved, setSortSolved] = useState(false);
  const [cardsSolved, setCardsSolved] = useState(false);
  const [multiSolved, setMultiSolved] = useState(false);
  const [lineSolved, setLineSolved] = useState(false);
  const [matchSolved, setMatchSolved] = useState(false);
  const [orderSolved, setOrderSolved] = useState(false);
  const [compareSolved, setCompareSolved] = useState(false);
  const kind = STEPS[step];

  const next = () => {
    if ((kind === 'quiz' || kind === 'slider') && !checked) {
      if (kind === 'slider' ? sliderTouched : pick !== null) setChecked(true);
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      setChecked(false);
    } else {
      router.back();
    }
  };

  const ctaLabel = (kind === 'quiz' || kind === 'slider') && !checked ? 'Check' : kind === 'done' ? 'Collect +50 XP' : 'Continue';
  const ctaDisabled = (kind === 'quiz' && !checked && pick === null) || (kind === 'build' && !buildSolved) || (kind === 'slider' && !checked && !sliderTouched) || (kind === 'sort' && !sortSolved) || (kind === 'cards' && !cardsSolved) || (kind === 'multi' && !multiSolved) || (kind === 'line' && !lineSolved) || (kind === 'match' && !matchSolved) || (kind === 'order' && !orderSolved) || (kind === 'compare' && !compareSolved);

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />

      {/* Header: close + progress */}
      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.close}>
          <UIcon name="close" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <View style={[styles.track, { backgroundColor: theme.muted }]}>
          <View style={[styles.fill, { backgroundColor: theme.primary, width: `${((step + 1) / STEPS.length) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.body}>
        {kind === 'intro' && (
          <Animated.View key="intro" entering={FadeIn} style={styles.centered}>
            <Atlas size={110} expression="happy" />
            <ThemedText type="label" style={{ color: theme.iconLilac, marginTop: Spacing.four }}>Foundations · Lesson 9</ThemedText>
            <ThemedText type="display" style={styles.title}>What is a stock?</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>A two-minute idea that changes how you see every company you know.</ThemedText>
          </Animated.View>
        )}

        {kind === 'teach' && (
          <Animated.View key="teach" entering={FadeInDown} exiting={FadeOut} style={{ flex: 1, justifyContent: 'center' }}>
            <ThemedText type="title" style={{ marginBottom: Spacing.three }}>A stock is a slice of a company.</ThemedText>
            <Card elevated style={{ gap: Spacing.three }}>
              <View style={styles.teachRow}>
                <View style={[styles.dot, { backgroundColor: theme.primary + '22' }]}><ThemedText type="heading" style={{ color: theme.iconLilac }}>1</ThemedText></View>
                <ThemedText type="body" style={{ flex: 1 }}>Buy one share and you own a tiny piece of the business — profits, growth, and all.</ThemedText>
              </View>
              <View style={styles.teachRow}>
                <View style={[styles.dot, { backgroundColor: theme.primary + '22' }]}><ThemedText type="heading" style={{ color: theme.iconLilac }}>2</ThemedText></View>
                <ThemedText type="body" style={{ flex: 1 }}>The price moves as people disagree on what that slice is worth.</ThemedText>
              </View>
            </Card>
          </Animated.View>
        )}

        {kind === 'slider' && (
          <Animated.View key="slider" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <SliderPredict spec={SLIDER} revealed={checked} onTouched={() => setSliderTouched(true)} />
          </Animated.View>
        )}

        {kind === 'build' && (
          <Animated.View key="build" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <TileBuilder spec={PAYCHECK} onSolvedChange={setBuildSolved} />
          </Animated.View>
        )}

        {kind === 'sort' && (
          <Animated.View key="sort" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <SortBuckets spec={SORT} onSolvedChange={setSortSolved} />
          </Animated.View>
        )}

        {kind === 'multi' && (
          <Animated.View key="multi" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <MultiSelect spec={MULTI} onSolvedChange={setMultiSolved} />
          </Animated.View>
        )}

        {kind === 'line' && (
          <Animated.View key="line" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <NumberLine spec={NUMLINE} onSolvedChange={setLineSolved} />
          </Animated.View>
        )}

        {kind === 'match' && (
          <Animated.View key="match" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <MatchingPairs spec={MATCH} onSolvedChange={setMatchSolved} />
          </Animated.View>
        )}

        {kind === 'order' && (
          <Animated.View key="order" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <OrderSteps spec={ORDER} onSolvedChange={setOrderSolved} />
          </Animated.View>
        )}

        {kind === 'compare' && (
          <Animated.View key="compare" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <BeforeAfterSlider spec={BEFOREAFTER} onSolvedChange={setCompareSolved} />
          </Animated.View>
        )}

        {kind === 'cards' && (
          <Animated.View key="cards" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <TapReveal spec={CARDS} onSolvedChange={setCardsSolved} />
          </Animated.View>
        )}

        {kind === 'quiz' && (
          <Animated.View key="quiz" entering={FadeInDown} style={{ flex: 1 }}>
            <View style={styles.quizHead}>
              <Atlas size={56} expression={checked ? (pick === CORRECT ? 'happy' : 'oops') : 'default'} shake={checked && pick !== CORRECT} interactive={false} />
              <ThemedText type="title" style={{ flex: 1, fontSize: 21 }}>A stock falls 20%, then rises 20%. Are you back to even?</ThemedText>
            </View>
            <View style={{ gap: Spacing.two + 4, marginTop: Spacing.four }}>
              {OPTIONS.map((o, i) => {
                const isPick = pick === i;
                const showRight = checked && i === CORRECT;
                const showWrong = checked && isPick && i !== CORRECT;
                const border = showRight ? theme.success : showWrong ? theme.warning : isPick ? theme.primary : theme.border;
                return (
                  <SpringPressable key={o} disabled={checked} haptic={!checked} onPress={() => setPick(i)}>
                    <View style={[styles.option, { borderColor: border, borderWidth: isPick || showRight ? 2 : StyleSheet.hairlineWidth, backgroundColor: isPick && !checked ? theme.primary + '14' : theme.card }]}>
                      <ThemedText type="bodyMedium" style={{ flex: 1 }}>{o}</ThemedText>
                      {showRight && <UIcon name="check" size={20} color={theme.success} strokeWidth={3} />}
                    </View>
                  </SpringPressable>
                );
              })}
            </View>
            {checked && (
              <Animated.View entering={FadeIn} style={[styles.explain, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '38' }]}>
                <ThemedText type="smallBold" style={{ color: theme.iconLilac, marginBottom: 2 }}>{pick === CORRECT ? 'Exactly.' : 'Not quite.'}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">$100 → down 20% → $80 → up 20% → $96. A drop needs a bigger gain to recover.</ThemedText>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {kind === 'reveal' && (
          <Animated.View key="reveal" entering={FadeInDown} style={{ flex: 1, justifyContent: 'center' }}>
            <ThemedText type="title" style={{ marginBottom: 4 }}>Why time beats timing</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={{ marginBottom: Spacing.four }}>$100/month at 8% a year, left alone for 30 years:</ThemedText>
            <Card elevated>
              <View style={styles.revealRow}>
                <ThemedText type="display" style={{ fontSize: 32, color: theme.iconLilac }}>$150,030</ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.success }}>vs $36,000 in</ThemedText>
              </View>
              <Svg width="100%" height={110} viewBox="0 0 320 110" preserveAspectRatio="none" style={{ marginTop: Spacing.two }}>
                <Defs><SvgGradient id="rv" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={theme.primary} stopOpacity={0.35} /><Stop offset="1" stopColor={theme.primary} stopOpacity={0.02} /></SvgGradient></Defs>
                <Path d="M0 100 C120 96 190 78 245 48 C280 30 305 16 320 8 L320 110 L0 110 Z" fill="url(#rv)" />
                <Path d="M0 100 C120 96 190 78 245 48 C280 30 305 16 320 8" stroke={theme.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" />
                <Path d="M0 100 L320 78" stroke={theme.mutedForeground} strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
              </Svg>
            </Card>
          </Animated.View>
        )}

        {kind === 'done' && (
          <Animated.View key="done" entering={FadeIn} style={styles.centered}>
            <Confetti />
            <Atlas size={120} expression="proud" celebrate entrance="bounce" />
            <ThemedText type="display" style={styles.title}>Lesson complete!</ThemedText>
            <RewardPop delay={280}>
              <View style={[styles.xpChip, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
                <UIcon name="sparkle" size={18} color={theme.iconLilac} />
                <NumberRollup value={50} prefix="+" suffix=" XP" duration={700} type="heading" style={{ color: theme.iconLilac, fontSize: 18 }} />
              </View>
            </RewardPop>
            <ThemedText type="body" themeColor="mutedForeground" style={[styles.center, { marginTop: Spacing.three }]}>Streak extended to 13 days. Atlas is proud of you.</ThemedText>
          </Animated.View>
        )}
      </View>

      <View style={styles.footer}>
        <GradientButton label={ctaLabel} full disabled={ctaDisabled} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 8, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 8 },
  body: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', marginTop: Spacing.three },
  center: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.two },
  teachRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  dot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  quizHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  option: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: Radius.lg },
  explain: { marginTop: Spacing.four, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: 1 },
  revealRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill, borderWidth: 1, marginTop: Spacing.three },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
});
