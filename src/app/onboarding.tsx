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
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
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
import { COURSES } from '@/lib/curriculum/courseIndex';
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

/**
 * What this screen claims must be TRUE and checkable, so the numbers are derived from the
 * shipped curriculum rather than typed in. This slot previously held three invented
 * testimonials ("Maya R.", "Devin K.", "Priya S.") and a "4.9 · App Store" rating for an app
 * with no App Store presence.
 *
 * Do not put testimonials or a star rating back here unless they are real and attributable:
 *   - App Store Review 2.3.1 (no misleading metadata) and 3.1.2.
 *   - FTC Rule on Consumer Reviews and Testimonials, 16 CFR Part 465 (2024), which makes
 *     fabricated reviews and testimonials a civil-penalty offence.
 * Real reviews can be surfaced post-launch via SKStoreReviewController / App Store Connect.
 */
const TOTAL_LESSONS = COURSES.reduce((n, c) => n + c.totalLessons, 0);

const PROOF: { icon: string; title: string; sub: string }[] = [
  { icon: 'bookOpen', title: `${TOTAL_LESSONS} lessons`, sub: `Across ${COURSES.length} courses, from first principles to advanced.` },
  { icon: 'trade', title: 'Practice without risk', sub: 'Paper trading uses simulated money, never your own.' },
  { icon: 'sparkle', title: 'Atlas explains anything', sub: 'Ask mid-lesson and get it in plain English.' },
];

/** Kept to one line each. At two lines the timeline alone ran ~200pt, which pushed "No payment
 *  due now" and the renewal terms off the bottom of the screen. */
const TRIAL_STEPS = [
  { icon: 'lock', title: 'Today', sub: 'Every lesson, Atlas coaching, and paper trading.', tone: 'solid' as const },
  { icon: 'bell', title: 'In 5 days — Reminder', sub: "We'll remind you before it ends.", tone: 'soft' as const },
  { icon: 'wallet', title: 'In 7 days — Billing starts', tone: 'muted' as const },
];

const LOADER_LINES = [
  'Reading your experience level…',
  'Matching courses to your goal…',
  'Sequencing your path…',
];

/**
 * ⚠️ SET THESE BEFORE SUBMITTING TO THE APP STORE.
 * App Store Review 3.1.2 requires an auto-renewing subscription's purchase screen to link a
 * reachable Terms of Use (EULA) and Privacy Policy. Placeholder hosts below — swap for the
 * real ones. `assertLegalConfigured` red-flags them in dev so they can't ship unnoticed.
 */
const LEGAL = {
  terms: 'https://euphoria.app/terms',
  privacy: 'https://euphoria.app/privacy',
};
const LEGAL_PLACEHOLDER_HOST = 'euphoria.app';

function openLegal(url: string) {
  if (__DEV__ && url.includes(LEGAL_PLACEHOLDER_HOST)) {
    console.warn(`[legal] ${url} is still the placeholder host — set LEGAL in onboarding.tsx before submission.`);
  }
  // openURL rejects when no handler exists; swallow so a bad URL can never crash the paywall.
  Linking.openURL(url).catch(() => {});
}

type StepDef =
  | { kind: 'single'; field: keyof Profile; question: string; sub?: string; options: Choice[]; face: AtlasExpression }
  | { kind: 'multi'; field: keyof Profile; question: string; sub?: string; options: Choice[]; face: AtlasExpression }
  | { kind: 'statement'; title: string; sub?: string; body?: 'chart' | 'proof'; face: AtlasExpression }
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
  { kind: 'statement', title: 'Everything you need to start', body: 'proof', face: 'proud' },
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
  // dev-only: ?step=<n> opens straight at a step for visual QA, same pattern as lesson.tsx.
  // Without it the only way to look at the paywall is to tap through the whole flow, which is
  // slow enough that it stops getting checked.
  const params = useLocalSearchParams<{ step?: string }>();
  const startStep = __DEV__ && params.step ? Math.min(Math.max(0, Number(params.step) || 0), TOTAL - 1) : 0;
  const { step, renderStep, bodyOpacity, atlasT, goTo } = useStepTransition(startStep, scrollRef);
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

  /** Apple requires a Restore control on any screen selling a subscription. No purchase SDK is
   *  installed yet (the CTA above routes to /auth, it does not buy), so this states that plainly
   *  instead of no-opping. Swap the body for RevenueCat's restorePurchases() when IAP lands. */
  const restore = () => {
    Alert.alert('Restore purchases', 'Purchases are not enabled in this build yet. Once subscriptions are live, this will restore any prior purchase tied to your Apple ID.');
  };

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
            {def.body === 'proof' ? (
              <View style={{ gap: Spacing.two + 4, marginTop: Spacing.four }}>
                {PROOF.map((p, i) => (
                  <RiseIn key={p.title} delay={childDelay(i)}>
                    <Card style={styles.proofCard}>
                      <View style={[styles.proofIcon, { backgroundColor: theme.primary + '1F' }]}>
                        <UIcon name={p.icon} size={20} color={theme.iconLilac} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="heading" style={{ fontSize: 16 }}>{p.title}</ThemedText>
                        <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2, lineHeight: 18 }}>{p.sub}</ThemedText>
                      </View>
                    </Card>
                  </RiseIn>
                ))}
              </View>
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
            {/* This screen is content-bound, not space-bound: every point of padding added here
                pushes "No payment due now" off the bottom. The decongestion comes from the
                one-line TRIAL_STEPS copy and from moving the renewal terms into the pinned
                footer, NOT from more air. */}
            <View style={{ marginTop: Spacing.four }}>
              {TRIAL_STEPS.map((s, i) => (
                <RiseIn key={s.title} delay={childDelay(i)}>
                  <TrialStep icon={s.icon} title={s.title} sub={s.sub} tone={s.tone} last={i === TRIAL_STEPS.length - 1} />
                </RiseIn>
              ))}
            </View>
            <RiseIn delay={childDelay(TRIAL_STEPS.length)} style={{ marginTop: Spacing.three }}>
              {/* The plan NAME carries the billing period and the price carries the amount you
                  are actually charged. Both cards used to headline a "/mo" figure, so the annual
                  plan read as a second, cheaper monthly plan rather than as a yearly one. */}
              <PlanCard
                selected={plan === 'annual'}
                onPress={() => setPlan('annual')}
                badge="7 DAYS FREE · SAVE 50%"
                title="Annual"
                sub="Works out at $4.99 a month"
                price="$59.99"
                unit="per year"
              />
              <PlanCard
                selected={plan === 'monthly'}
                onPress={() => setPlan('monthly')}
                title="Monthly"
                sub="Billed every month"
                price="$9.99"
                unit="per month"
              />
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
          {/* Reassurance sits with the CTA it reassures about. In the scrolling body it was the
              first thing clipped whenever the plan cards grew. */}
          {step === PAYWALL_INDEX && (
            <View style={styles.noPay}>
              <UIcon name="check" size={16} color={theme.primary} />
              <ThemedText type="bodyMedium">No payment due now</ThemedText>
            </View>
          )}
          <GradientButton
            label={step === REVEAL_INDEX ? 'Start learning' : step === PAYWALL_INDEX ? 'Start my 7-day free trial' : 'Continue'}
            full
            disabled={!canContinue}
            onPress={next}
          />
          {step === PAYWALL_INDEX && (
            <>
              {/* Renewal terms belong in the pinned footer for the same reason the links do:
                  as the last child of the scrolling body they sat below the fold, and App Store
                  Review 3.1.2 wants the price and renewal terms ON the purchase screen. */}
              <ThemedText type="small" themeColor="mutedForeground" style={styles.fine}>
                7 days free, then {plan === 'annual' ? '$59.99 per year, billed annually' : '$9.99 per month'}. Renews
                until cancelled. Cancel anytime in the App Store.
              </ThemedText>
              <SpringPressable haptic={false} onPress={() => router.replace('/home')} style={styles.maybeLater}>
                <ThemedText type="small" themeColor="mutedForeground">Maybe later</ThemedText>
              </SpringPressable>
              {/* In the pinned footer, NOT the ScrollView: these were previously the last child
                  of the scrolling body and sat below the fold, so the links Apple requires were
                  invisible unless the user happened to scroll. */}
              <View style={styles.legalRow}>
                <SpringPressable haptic={false} onPress={() => openLegal(LEGAL.terms)} hitSlop={8}>
                  <ThemedText type="small" themeColor="mutedForeground" style={styles.legalLink}>Terms</ThemedText>
                </SpringPressable>
                <ThemedText type="small" themeColor="mutedForeground" style={styles.legalDot}>·</ThemedText>
                <SpringPressable haptic={false} onPress={() => openLegal(LEGAL.privacy)} hitSlop={8}>
                  <ThemedText type="small" themeColor="mutedForeground" style={styles.legalLink}>Privacy</ThemedText>
                </SpringPressable>
                <ThemedText type="small" themeColor="mutedForeground" style={styles.legalDot}>·</ThemedText>
                <SpringPressable haptic={false} onPress={restore} hitSlop={8}>
                  <ThemedText type="small" themeColor="mutedForeground" style={styles.legalLink}>Restore</ThemedText>
                </SpringPressable>
              </View>
            </>
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
  proofCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  proofIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  noPay: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.one, paddingBottom: Spacing.two },
  fine: { textAlign: "center", fontSize: 11, lineHeight: 15, paddingTop: Spacing.two, paddingHorizontal: Spacing.two },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
  maybeLater: { alignItems: "center", paddingTop: Spacing.two },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: Spacing.two },
  legalLink: { fontSize: 11, textDecorationLine: 'underline', opacity: 0.75 },
  legalDot: { fontSize: 11, opacity: 0.75 },
});
