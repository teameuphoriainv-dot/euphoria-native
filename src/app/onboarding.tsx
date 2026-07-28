/**
 * Onboarding — a real funnel: ask, personalize, then charge.
 *
 * Every screen is ONE idea (a question, an assertion, or the payoff) rendered by a shared
 * archetype from onboarding-parts. That uniform sparseness is deliberate: the previous flow
 * had five poster screens and one dense paywall, which is why the paywall read as "overdone".
 *
 * Answers are written to the persisted zustand profile on every tap — the old flow kept goal
 * and level in useState and threw both away on unmount.
 *
 * Atlas lives in a persistent <AtlasStage> above the step switch so it never remounts.
 */
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import type { AtlasExpression } from '@/components/atlas';
import {
  ATLAS_SIZE,
  AtlasStage,
  type Choice,
  GrowthChart,
  LoaderStep,
  MultiSelectStep,
  PlanCard,
  PlanRevealStep,
  ProgressHeader,
  SingleSelectStep,
  Stars,
  StatementStep,
  StepHeading,
  TrialStep,
} from '@/components/onboarding-parts';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { estimateWeeks, lessonsPerDay, recommendPath, type Profile } from '@/lib/onboarding-path';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { CHILD_BASE, childDelay, useStepTransition } from '@/shared/motion/step-transition';

const GOALS: Choice[] = [
  { key: 'wealth', icon: 'wallet', title: 'Grow my wealth', sub: 'Build long-term investing habits' },
  { key: 'learn', icon: 'gradCap', title: 'Learn how investing works', sub: 'Start from the fundamentals' },
  { key: 'trade', icon: 'bolt', title: 'Trade with confidence', sub: 'Practice without real risk' },
  { key: 'economy', icon: 'globe', title: 'Understand the economy', sub: 'Make sense of money & markets' },
];

const LEVELS: Choice[] = [
  { key: 'beginner', icon: 'seedling', title: 'Total beginner', sub: "I'm starting from zero" },
  { key: 'basics', icon: 'bookOpen', title: 'I know the basics', sub: 'Stocks, saving, a little more' },
  { key: 'experienced', icon: 'rocket', title: "I'm experienced", sub: 'I want to sharpen my edge' },
];

const TOPICS: Choice[] = [
  { key: 'stocks', icon: 'trade', title: 'Stocks & ETFs' },
  { key: 'budgeting', icon: 'wallet', title: 'Budgeting & debt' },
  { key: 'economy', icon: 'globe', title: 'The economy' },
  { key: 'valuation', icon: 'search', title: 'Valuing companies' },
  { key: 'psychology', icon: 'sparkle', title: 'Investing psychology' },
  { key: 'risk', icon: 'lock', title: 'Risk & hedging' },
  { key: 'crypto', icon: 'bolt', title: 'Crypto & alternatives' },
  { key: 'retirement', icon: 'trophy', title: 'Retirement & taxes' },
  { key: 'business', icon: 'rocket', title: 'Startups & business' },
];

const HORIZONS: Choice[] = [
  { key: 'now', title: "I've already started" },
  { key: 'soon', title: 'In the next few months' },
  { key: 'year', title: 'Within a year' },
  { key: 'unsure', title: "I'm not sure yet" },
];

/** Behavioural signal, not a risk score — see the regulatory note in onboarding-path.ts. */
const RISK: Choice[] = [
  { key: 'sell', icon: 'flame', title: 'Sell — I want out', sub: 'Protect what I have left' },
  { key: 'wait', icon: 'seedling', title: 'Wait it out', sub: 'Do nothing and hold' },
  { key: 'buy', icon: 'rocket', title: 'Buy more', sub: "It's on sale" },
];

const DAILY: Choice[] = [
  { key: '5', icon: 'flame', title: '5 minutes', sub: 'One lesson a day' },
  { key: '10', icon: 'bolt', title: '10 minutes', sub: 'Two lessons a day' },
  { key: '20', icon: 'rocket', title: '20 minutes', sub: 'Four lessons a day' },
];

const BLOCKERS: Choice[] = [
  { key: 'jargon', title: 'The jargon is overwhelming' },
  { key: 'time', title: "I never find the time" },
  { key: 'fear', title: 'I’m scared of losing money' },
  { key: 'start', title: "I don't know where to start" },
  { key: 'trust', title: "I don't know who to trust" },
];

const AGES: Choice[] = [
  { key: '18-24', title: '18–24' },
  { key: '25-34', title: '25–34' },
  { key: '35-44', title: '35–44' },
  { key: '45+', title: '45 or older' },
];

const SOURCES: Choice[] = [
  { key: 'tiktok', title: 'TikTok' },
  { key: 'instagram', title: 'Instagram' },
  { key: 'youtube', title: 'YouTube' },
  { key: 'friend', title: 'Friend or family' },
  { key: 'appstore', title: 'App Store' },
  { key: 'other', title: 'Somewhere else' },
];

const NOTIFY: Choice[] = [
  { key: 'yes', icon: 'bell', title: 'Yes, keep me on streak', sub: 'One nudge a day, no spam' },
  { key: 'no', title: 'Not right now' },
];

const TESTIMONIALS = [
  { quote: '"I finally understand how the market actually works. Atlas makes it click."', name: 'Maya R. · new investor' },
  { quote: '"The paper trading is addictive. I learned more in a week than in a year of videos."', name: 'Devin K.' },
  { quote: '"Feels like a game, but I\'m actually building real skills."', name: 'Priya S.' },
];

const TRIAL_STEPS = [
  { icon: 'lock', title: 'Today', sub: 'Unlock every lesson, Atlas AI coaching 24/7, and advanced paper trading.', tone: 'solid' as const },
  { icon: 'bell', title: 'In 5 days — Reminder', sub: "We'll remind you your trial is ending, if you've allowed notifications.", tone: 'soft' as const },
  { icon: 'wallet', title: 'In 7 days — Billing starts', tone: 'muted' as const },
];

const LOADER_LINES = [
  'Reading your experience level…',
  'Matching courses to your goal…',
  'Sequencing your path…',
];

type StepDef =
  | { kind: 'single'; field: keyof Profile; question: string; sub?: string; options: Choice[]; face: AtlasExpression }
  | { kind: 'multi'; field: keyof Profile; question: string; sub?: string; options: Choice[]; face: AtlasExpression }
  | { kind: 'statement'; title: string; sub?: string; body?: 'chart' | 'social'; face: AtlasExpression }
  | { kind: 'loader' }
  | { kind: 'reveal' }
  | { kind: 'paywall' };

/** The flow. Adding a question is a new entry here — no JSX, no new branch. */
const STEPS: StepDef[] = [
  { kind: 'single', field: 'experience', question: 'How much do you already know?', options: LEVELS, face: 'watching' },
  { kind: 'single', field: 'goal', question: 'What brings you to Euphoria?', options: GOALS, face: 'default' },
  { kind: 'multi', field: 'topics', question: 'What do you want to learn about?', options: TOPICS, face: 'happy' },
  { kind: 'statement', title: 'Practice daily and you’ll grow 4× faster', body: 'chart', face: 'proud', sub: 'Ten minutes a day builds real investing instinct.' },
  { kind: 'single', field: 'horizon', question: 'When do you want to start investing for real?', options: HORIZONS, face: 'watching' },
  { kind: 'single', field: 'riskComfort', question: 'Your portfolio drops 20% in a month. You…', sub: 'There’s no wrong answer — it tells Atlas how to coach you.', options: RISK, face: 'whoa' },
  { kind: 'single', field: 'dailyMinutes', question: 'How much time can you give it?', options: DAILY, face: 'happy' },
  { kind: 'statement', title: 'Join 50,000+ new investors', body: 'social', face: 'proud' },
  { kind: 'multi', field: 'blockers', question: 'What’s held you back so far?', options: BLOCKERS, face: 'thinking' },
  { kind: 'single', field: 'ageBand', question: 'How old are you?', sub: 'It helps us pace the long-term material.', options: AGES, face: 'default' },
  { kind: 'single', field: 'source', question: 'Where did you hear about us?', options: SOURCES, face: 'default' },
  { kind: 'single', field: 'notifyOptIn', question: 'Want a daily nudge?', options: NOTIFY, face: 'happy' },
  { kind: 'loader' },
  { kind: 'reveal' },
  { kind: 'paywall' },
];

const TOTAL = STEPS.length;
const PAYWALL_INDEX = TOTAL - 1;
const REVEAL_INDEX = TOTAL - 2;

export default function Onboarding() {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const { step, renderStep, bodyOpacity, atlasT, goTo } = useStepTransition(0, scrollRef);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');

  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const completeOnboarding = useApp((s) => s.completeOnboarding);

  const def = STEPS[renderStep];
  const liveDef = STEPS[step];

  // Derived, not stored: a store getter returning a fresh array would give zustand an
  // unstable snapshot and loop renders (see you.tsx:43).
  const path = useMemo(() => recommendPath(profile), [profile]);
  const perDay = lessonsPerDay(profile.dailyMinutes);
  const weeks = estimateWeeks(profile, path);
  const tierLabel = profile.experience === 'experienced' ? 'advanced' : profile.experience === 'basics' ? 'intermediate' : 'beginner';

  /** Single-select write. Two fields aren't strings, so they're coerced here. */
  const answer = (field: keyof Profile, value: string) => {
    if (field === 'dailyMinutes') setProfile({ dailyMinutes: Number.parseInt(value, 10) });
    else if (field === 'notifyOptIn') setProfile({ notifyOptIn: value === 'yes' });
    else setProfile({ [field]: value } as Partial<Profile>);
    setCelebrateKey((n) => n + 1);
  };

  const toggle = (field: keyof Profile, value: string) => {
    const current = (profile[field] as string[]) ?? [];
    setProfile({ [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] } as Partial<Profile>);
    setCelebrateKey((n) => n + 1);
  };

  const selected = (field: keyof Profile): string | null => {
    const v = profile[field];
    if (v === null || v === undefined) return null;
    if (typeof v === 'boolean') return v ? 'yes' : 'no';
    return String(v);
  };

  const next = () => {
    if (step === REVEAL_INDEX) {
      // last chance to stamp completion if the loader was skipped (reduced motion)
      if (!profile.completedAt) completeOnboarding();
      goTo(step + 1);
      return;
    }
    if (step < TOTAL - 1) goTo(step + 1);
    else router.replace('/auth');
  };
  const back = () => (step > 0 ? goTo(step - 1) : undefined);

  const canContinue = (() => {
    if (!liveDef) return true;
    if (liveDef.kind === 'single') return selected(liveDef.field) !== null;
    if (liveDef.kind === 'multi') return ((profile[liveDef.field] as string[]) ?? []).length > 0;
    return true;
  })();

  const face: AtlasExpression =
    !def ? 'happy'
      : def.kind === 'reveal' ? 'proud'
        : def.kind === 'paywall' ? 'happy'
          : def.kind === 'loader' ? 'thinking'
            : def.face;

  const bodyStyle = useAnimatedStyle(() => ({ opacity: bodyOpacity.get() }));

  const body = () => {
    if (!def) return null;
    switch (def.kind) {
      case 'single':
        return (
          <SingleSelectStep
            question={def.question}
            sub={def.sub}
            options={def.options}
            value={selected(def.field)}
            onChange={(k) => answer(def.field, k)}
          />
        );
      case 'multi':
        return (
          <MultiSelectStep
            question={def.question}
            sub={def.sub}
            options={def.options}
            values={(profile[def.field] as string[]) ?? []}
            onToggle={(k) => toggle(def.field, k)}
          />
        );
      case 'statement':
        return (
          <StatementStep title={def.title} sub={def.sub}>
            {def.body === 'chart' ? <GrowthChart delay={CHILD_BASE} /> : null}
            {def.body === 'social' ? (
              <>
                <View style={styles.ratingRow}>
                  <Stars />
                  <ThemedText type="smallBold" themeColor="mutedForeground">4.9 · App Store</ThemedText>
                </View>
                <View style={{ gap: Spacing.two + 4, marginTop: Spacing.three }}>
                  {TESTIMONIALS.map((t, i) => (
                    <RiseIn key={t.name} delay={childDelay(i)}>
                      <Card>
                        <ThemedText type="bodyMedium" style={{ lineHeight: 22 }}>{t.quote}</ThemedText>
                        <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: Spacing.one }}>{t.name}</ThemedText>
                      </Card>
                    </RiseIn>
                  ))}
                </View>
              </>
            ) : null}
          </StatementStep>
        );
      case 'loader':
        return (
          <LoaderStep
            lines={LOADER_LINES}
            onDone={() => {
              completeOnboarding();
              goTo(REVEAL_INDEX);
            }}
          />
        );
      case 'reveal':
        return <PlanRevealStep tierLabel={tierLabel} courses={path} perDay={perDay} weeks={weeks} />;
      default:
        return (
          <>
            <StepHeading title={'Start your 7-day FREE trial to continue'} />
            <View style={{ marginTop: Spacing.four }}>
              {TRIAL_STEPS.map((s, i) => (
                <RiseIn key={s.title} delay={childDelay(i)}>
                  <TrialStep icon={s.icon} title={s.title} sub={s.sub} tone={s.tone} last={i === TRIAL_STEPS.length - 1} />
                </RiseIn>
              ))}
            </View>
            <RiseIn delay={childDelay(TRIAL_STEPS.length)}>
              <PlanCard
                selected={plan === 'annual'}
                onPress={() => setPlan('annual')}
                badge="7 DAYS FREE"
                title="Start free & save 50%"
                sub="$59.99 billed annually"
                price="$4.99/mo"
              />
              <PlanCard selected={plan === 'monthly'} onPress={() => setPlan('monthly')} title="Monthly" price="$9.99/mo" />
              <View style={styles.noPay}>
                <UIcon name="check" size={16} color={theme.primary} />
                <ThemedText type="bodyMedium">No payment due now</ThemedText>
              </View>
              <ThemedText type="small" themeColor="mutedForeground" style={styles.fine}>
                7 days free, then {plan === 'annual' ? '$59.99 per year, billed annually' : '$9.99 per month'}. Plan auto-renews
                unless you cancel. Cancel anytime in the App Store.
              </ThemedText>
              {/* Plain text, not links: no Terms/Privacy/Restore destinations are wired yet, and a
                  tappable control that silently does nothing is worse than a label. */}
              <ThemedText type="small" themeColor="mutedForeground" style={styles.legal}>Terms · Privacy · Restore</ThemedText>
            </RiseIn>
          </>
        );
    }
  };

  const isLoader = liveDef?.kind === 'loader';

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground />
      <View style={styles.header}>
        <ProgressHeader step={step} total={TOTAL} onBack={back} />
      </View>

      <AtlasStage
        t={atlasT}
        expression={face}
        // only the question steps react with a hop; zeroing elsewhere makes the paywall's
        // smaller `size` safe (size is a dependency of Atlas's celebrate effect)
        celebrateKey={renderStep < REVEAL_INDEX ? celebrateKey : 0}
        size={renderStep === PAYWALL_INDEX ? 56 : ATLAS_SIZE}
      />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={bodyStyle}>
          {/* keyed on renderStep so RiseIn's `entering` re-fires for every step */}
          <View key={renderStep}>{body()}</View>
        </Animated.View>
      </ScrollView>

      {/* the loader drives itself — offering a button there would let users outrun it */}
      {!isLoader && (
        <View style={styles.footer}>
          <GradientButton
            label={step === REVEAL_INDEX ? 'Start learning' : step === PAYWALL_INDEX ? 'Start my 7-day free trial' : 'Continue'}
            full
            disabled={!canContinue}
            onPress={next}
          />
          {step === PAYWALL_INDEX && (
            <SpringPressable haptic={false} onPress={() => router.replace('/home')} style={styles.maybeLater}>
              <ThemedText type="small" themeColor="mutedForeground">Maybe later</ThemedText>
            </SpringPressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  content: { padding: Spacing.four, paddingTop: Spacing.three, flexGrow: 1, justifyContent: 'flex-start' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two },
  noPay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.one, marginTop: Spacing.three },
  fine: { textAlign: 'center', fontSize: 11, lineHeight: 15, marginTop: Spacing.three },
  legal: { textAlign: 'center', fontSize: 11, marginTop: Spacing.two, opacity: 0.75 },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
  maybeLater: { alignItems: 'center', paddingTop: Spacing.three },
});
