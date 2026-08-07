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
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { applyDailyNudge } from '@/lib/notifications';
import { estimateWeeks, lessonsPerDay, recommendPathDetailed, type Profile } from '@/lib/onboarding-path';
import { LessonArt } from '@/components/lesson-art';
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
 * reachable Terms of Use (EULA) and Privacy Policy. These are the live pages the web app already
 * serves (euphoriaweb src/pages/Terms.tsx and Privacy.tsx, routed at App.tsx:200-201).
 *
 * VERIFIED BY LOADING THE PAGES, not by status code. euphoriaweb's vercel.json rewrites every
 * non-asset path to index.html, so that host returns 200 for routes that do not exist - a bogus
 * path returns 200 too. A 200 proves nothing here. Re-check by reading the rendered title.
 * The apex redirects to www; both resolve.
 */
const LEGAL = {
  terms: 'https://euphoriainv.com/terms',
  privacy: 'https://euphoriainv.com/privacy',
};
/** Hosts that must never ship, kept as a regression tripwire: euphoria.app is a domain we do not
 *  own and it reached the paywall unnoticed. */
const LEGAL_PLACEHOLDER_HOSTS = ['euphoria.app', 'example.com', 'localhost'];

// Fires at MODULE LOAD in dev, not on tap. The previous check only ran inside openLegal, so it
// needed someone to walk about fifteen taps into onboarding and press the link before it said
// anything - which is exactly how the placeholder survived this long. A guard you have to walk
// to is not a guard.
if (__DEV__) {
  for (const [key, url] of Object.entries(LEGAL)) {
    if (LEGAL_PLACEHOLDER_HOSTS.some((h) => url.includes(h))) {
      console.error(`[legal] LEGAL.${key} is still a placeholder (${url}). App Store 3.1.2 will reject this.`);
    }
  }
}

function openLegal(url: string) {
  // openURL rejects when no handler exists; swallow so a bad URL can never crash the paywall.
  Linking.openURL(url).catch(() => {});
}

type StepDef =
  | { kind: 'single'; field: keyof Profile; question: string; sub?: string; options: Choice[]; face: AtlasExpression }
  | { kind: 'multi'; field: keyof Profile; question: string; sub?: string; options: Choice[]; face: AtlasExpression }
  | { kind: 'statement'; title: string; sub?: string; body?: 'chart' | 'proof' | 'trial'; face: AtlasExpression }
  | { kind: 'loader' }
  | { kind: 'reveal' }
  | { kind: 'paywall' };

/** The flow. Adding a question is a new entry here — no JSX, no new branch. */
const STEPS: StepDef[] = [
  { kind: 'single', field: 'experience', question: 'How much do you already know?', options: LEVELS, face: 'watching' },
  { kind: 'single', field: 'goal', question: 'What brings you to Euphoria?', options: GOALS, face: 'default' },
  { kind: 'multi', field: 'topics', question: 'What do you want to learn about?', options: TOPICS, face: 'happy' },
  // No efficacy multiplier here. The old copy promised "4× faster" with nothing behind it —
  // an unsubstantiated performance claim inside a paid finance funnel. Credit the habit, not a number.
  { kind: 'statement', title: 'The habit is what makes it stick', body: 'chart', face: 'proud', sub: 'Ten minutes a day builds real investing instinct.' },
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
  /* The trial timeline used to sit ON the paywall, above both plan cards. Together they
     overran the viewport and the Monthly card was clipped by the pinned footer. Facetune
     ($11M/mo) shows the timeline BEFORE prices as its own step rather than stacked with them,
     and ScreensDesign flags that as a distinctive element. Splitting lets both breathe.
     TITLE IS DRAFT COPY — a new step needs a headline; review it. */
  { kind: 'statement', title: 'How your free trial works', body: 'trial', face: 'happy' },
  { kind: 'paywall' },
];

const TOTAL = STEPS.length;
/* Located by KIND, not by offset. These were TOTAL-1 and TOTAL-2, so inserting the trial step
   below would have silently pointed REVEAL_INDEX at the wrong screen — the reveal celebration
   would have fired on the trial timeline and the completion stamp with it. */
const PAYWALL_INDEX = STEPS.findIndex((s) => s.kind === 'paywall');
const REVEAL_INDEX = STEPS.findIndex((s) => s.kind === 'reveal');
/* The trial step fills the viewport so its three rows distribute instead of packing to the
   top. Same findIndex pattern as the two above. */
const TRIAL_INDEX = STEPS.findIndex((s) => s.kind === 'statement' && s.body === 'trial');

export default function Onboarding() {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  // ?step=<n> opens straight at a step for visual QA and is DEV ONLY: without that gate it would
  // double as a way to skip onboarding entirely.
  //
  // `?step=paywall` is the one exception and works in production, because the You page's upsell
  // row has to be able to reach the paywall. It is named rather than numeric on purpose - linking
  // by index would silently point somewhere else the moment a step is inserted, and outside dev a
  // rejected param falls back to step 0, which would drop a returning user into the whole flow.
  const params = useLocalSearchParams<{ step?: string }>();
  const wantsPaywall = params.step === 'paywall';
  const startStep =
    params.step && (__DEV__ || wantsPaywall)
      ? Math.min(Math.max(0, wantsPaywall ? PAYWALL_INDEX : Number(params.step) || 0), TOTAL - 1)
      : 0;
  const { step, renderStep, bodyOpacity, atlasT, goTo } = useStepTransition(startStep, scrollRef);
  // A tap is an acknowledgement, not an achievement — see AtlasStage below for why these are
  // two different keys.
  const [nodKey, setNodKey] = useState(0);
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');

  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const completeOnboarding = useApp((s) => s.completeOnboarding);

  const def = STEPS[renderStep];
  const liveDef = STEPS[step];

  // Derived, not stored: a store getter returning a fresh array would give zustand an
  // unstable snapshot and loop renders (see you.tsx:43).
  // Detailed picks carry the reason each course was chosen, so the reveal can show its working.
  const picks = useMemo(() => recommendPathDetailed(profile), [profile]);
  const path = useMemo(() => picks.map((x) => x.course), [picks]);
  const perDay = lessonsPerDay(profile.dailyMinutes);
  const weeks = estimateWeeks(profile, path);
  const tierLabel = profile.experience === 'experienced' ? 'advanced' : profile.experience === 'basics' ? 'intermediate' : 'beginner';

  /** Single-select write. Two fields aren't strings, so they're coerced here. */
  const answer = (field: keyof Profile, value: string) => {
    if (field === 'dailyMinutes') setProfile({ dailyMinutes: Number.parseInt(value, 10) });
    else if (field === 'notifyOptIn') {
      const want = value === 'yes';
      // Optimistic so the radio fills immediately, then corrected to whatever iOS actually
      // granted. Storing the tap alone is how this screen used to promise a nudge that no
      // code anywhere scheduled.
      setProfile({ notifyOptIn: want });
      void applyDailyNudge(want).then((scheduled) => {
        if (scheduled !== want) setProfile({ notifyOptIn: scheduled });
      });
    }
    else setProfile({ [field]: value } as Partial<Profile>);
    setNodKey((n) => n + 1);
  };

  const toggle = (field: keyof Profile, value: string) => {
    const current = (profile[field] as string[]) ?? [];
    setProfile({ [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] } as Partial<Profile>);
    setNodKey((n) => n + 1);
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
    // A first-time user finishes onboarding by creating an account. Someone who arrived here from
    // the You page upsell already HAS one, so sending them to /auth would be nonsense - return
    // them where they came from instead.
    else if (profile.completedAt) router.back();
    else router.replace('/auth');
  };
  const back = () => (step > 0 ? goTo(step - 1) : undefined);

  /**
   * Commit-on-tap for single-select steps.
   *
   * Onboarding is 15 steps, 8 of them single-select, and every one of those used to cost two
   * taps: pick, then Continue. That is 8 taps that carry no information — the pick already IS
   * the answer. YNAB (screen 239304, the one Finance onboarding match in ScreensDesign) commits
   * on the card tap with no Continue at all.
   *
   * Two guards, both load-bearing:
   *  - `notifyOptIn` is excluded by the caller. Its answer() opens the iOS permission dialog,
   *    and advancing the screen behind a system modal is disorienting.
   *  - the step is re-checked after the delay. Continue is still on screen, so a user who taps
   *    an option and then Continue inside the window would otherwise advance twice.
   *
   * 260ms is long enough for the option's selected state to render — advancing instantly reads
   * as "my tap skipped the question" rather than "my tap answered it".
   */
  const stepRef = useRef(step);
  // In an effect, not during render: assigning a ref in the render body is a lint error and,
  // under concurrent rendering, a render that gets thrown away would still have mutated it.
  // The 260ms timeout below always fires after commit, so the effect has run by then.
  useEffect(() => { stepRef.current = step; }, [step]);
  const advanceAfterPick = () => {
    const from = step;
    setTimeout(() => {
      if (stepRef.current === from) next();
    }, 260);
  };

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
            onChange={(k) => {
              answer(def.field, k);
              // notifyOptIn opens the iOS permission dialog — do not advance behind it.
              if (def.field !== 'notifyOptIn') advanceAfterPick();
            }}
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
          <StatementStep title={def.title} sub={def.sub} fill={def.body === 'trial'}>
            {def.body === 'chart' ? <GrowthChart delay={CHILD_BASE} /> : null}
            {def.body === 'trial' ? (
              <View style={{ marginTop: Spacing.four }}>
                {TRIAL_STEPS.map((t, i) => (
                  <TrialStep key={t.title} icon={t.icon} title={t.title} sub={t.sub} tone={t.tone} last={i === TRIAL_STEPS.length - 1} />
                ))}
                <View style={[styles.trialPrice, { borderTopColor: theme.border }]}>
                  <ThemedText type="bodyMedium" style={{ textAlign: 'center' }}>
                    7 days free, then {plan === 'annual' ? '$59.99 per year' : '$9.99 per month'}
                  </ThemedText>
                  <ThemedText type="small" themeColor="mutedForeground" style={{ textAlign: 'center', marginTop: 3 }}>
                    Cancel anytime in the App Store
                  </ThemedText>
                </View>
              </View>
            ) : null}
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
        return <PlanRevealStep tierLabel={tierLabel} picks={picks} perDay={perDay} weeks={weeks} />;
      default:
        return (
          <View style={styles.paywallBody}>
            <StepHeading title={'Start your 7-day FREE trial to continue'} />
            {picks[0] ? (
              <View style={styles.paywallHero}>
                <LessonArt courseId={picks[0].course.id} title={picks[0].course.title} index={0} size={132} />
              </View>
            ) : null}
            {/* Space is DISTRIBUTED here, never added as fixed padding. The three blocks are
                spread across whatever height is left over, so a tall phone breathes and a small
                one simply stops spreading and scrolls — the previous flex-start packed
                everything to the top and left the slack stranded at the bottom. Hardcoding that
                slack as padding is what would push "No payment due now" off an SE. */}
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
          </View>
        );
    }
  };

  const isLoader = liveDef?.kind === 'loader';
  // The two tail steps must FILL the scroll viewport rather than sit at its top: both are
  // content-light next to a pinned CTA, so top-packing strands the leftover height as a dead
  // band above the button. The flex chain is opened up only for them; every question step keeps
  // its existing top-packed layout untouched.
  const fillsViewport = renderStep === PAYWALL_INDEX || renderStep === REVEAL_INDEX || renderStep === TRIAL_INDEX;

  return (
    // AmbientBackground is absoluteFill, so it can only ever paint its PARENT. Nested inside
    // the SafeAreaView it was clipped to the inset box, which left the home-indicator band at
    // the bottom bare — the "white space" under the paywall footer. A full-bleed wrapper with
    // a TRANSPARENT SafeAreaView inside keeps every existing layout rule intact while letting
    // the gradient and stars run to the physical edges of the screen.
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <AmbientBackground />
      <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ProgressHeader step={step} total={TOTAL} onBack={back} />
      </View>

      <AtlasStage
        t={atlasT}
        expression={face}
        // The hop is reserved for the ONE moment that earns it: the finished plan. It used to
        // fire on every option tap while the reveal got nothing, which is the reaction map
        // exactly inverted — the loudest beat on the cheapest action.
        //
        // Still zero everywhere else, which also keeps the paywall's smaller `size` safe
        // (size is a dependency of Atlas's celebrate effect).
        celebrateKey={renderStep === REVEAL_INDEX ? 1 : 0}
        nodKey={renderStep < REVEAL_INDEX ? nodKey : 0}
        size={renderStep === PAYWALL_INDEX ? 56 : ATLAS_SIZE}
      />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[bodyStyle, fillsViewport && styles.grow]}>
          {/* keyed on renderStep so RiseIn's `entering` re-fires for every step */}
          <View key={renderStep} style={fillsViewport ? styles.grow : undefined}>{body()}</View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  /** Full-bleed. Holds the ambient background so it reaches past the safe-area insets. */
  screen: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  /* The price on the timeline screen, as Facetune (112333, $11M/mo) does: it states
     "7-day free trial, then $77.99/year" under its timeline rather than deferring the number
     to the plan picker. Naming the charge on the screen that explains the charge is the point
     of the pattern - and it fills the band this screen had left over. */
  trialPrice: { marginTop: Spacing.four, paddingTop: Spacing.four, borderTopWidth: StyleSheet.hairlineWidth },
  content: { padding: Spacing.four, paddingTop: Spacing.three, flexGrow: 1, justifyContent: 'flex-start' },
  proofCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  proofIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  /** Opens the flex chain so a child can claim the leftover viewport height. */
  grow: { flexGrow: 1 },
  /** Heading / trial timeline / plan cards, spread across the leftover height. */
  /* The plans screen needs a VISUAL, not more distribution. Facetune's plans screen (112334,
     $11M/mo, the neighbour of the timeline screen) carries a full-bleed hero photograph above
     its two cards. Ours had a headline and two cards floating in nothing, which is why
     space-between punched a hole and flex-start merely moved it. This is the lead course's own
     art — it shows what the subscription is FOR — and it restores the three-block composition
     space-between was written for. */
  paywallHero: { alignItems: 'center' },
  paywallBody: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: Spacing.two },
  noPay: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.one, paddingBottom: Spacing.two },
  fine: { textAlign: "center", fontSize: 11, lineHeight: 15, paddingTop: Spacing.two, paddingHorizontal: Spacing.two },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
  maybeLater: { alignItems: "center", paddingTop: Spacing.two },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: Spacing.two },
  legalLink: { fontSize: 11, textDecorationLine: 'underline', opacity: 0.75 },
  legalDot: { fontSize: 11, opacity: 0.75 },
});
