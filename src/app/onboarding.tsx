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
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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
  TrialStep, PremiumBenefits } from '@/components/onboarding-parts';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ALL_AVATARS } from '@/lib/avatars';
import { Ev, track } from '@/lib/analytics';
import { TRIAL_DAYS, trialDayNumber, useTier, useTrialStarted } from '@/lib/entitlement';
import { IAP_DISABLED_REASON, IAP_ENABLED, findPackage, getPackages, purchase, restore as restorePurchases, purchaseErrorMessage } from '@/lib/purchases';
import { COURSES } from '@/lib/curriculum/courseIndex';
import { applyDailyNudge } from '@/lib/notifications';
import { NudgeTimePicker } from '@/components/nudge-time-picker';
import { estimateWeeks, lessonsPerDay, recommendPathDetailed, type Profile } from '@/lib/onboarding-path';
import { NAME_MAX, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { CHILD_BASE, childDelay, useStepTransition } from '@/shared/motion/step-transition';
import {
  PixelSpriteView, bolt, book, chartUp, clock, flame, globe, graduationCap, lock, magnifier, rocket,
  seedling, star, trophy, wallet, type PixelSprite,
} from '@/lib/pixel';

/**
 * PRICING — one place, with the arithmetic written out so a later edit cannot quietly break the
 * badge. Set 2026-08-07 from five real captured competitor paywalls (§22 C29/C31).
 *
 *   monthly $9.99   unchanged. Already MID-PACK: above Quizlet $7.99, below Bloom $15, far below
 *                   Astra AI $24. §9.10's "we are half of Bloom" compared us against the single
 *                   most expensive comparable rather than the set.
 *   annual  $79.99  RAISED from $59.99. At $59.99 the annual was $5.00/month-equivalent against a
 *                   peer median near $7.90 — roughly 37% under, which was money left on the table.
 *                   $79.99 is $6.67/mo, deliberately BELOW the median because Bloom's $15 buys a
 *                   real brokerage and ours buys paper trading.
 *
 *   saving  9.99 * 12 = 119.88 ; 79.99 / 119.88 = 0.667 -> 33% off. Was "SAVE 50%" at $59.99.
 *
 * The trial length is interpolated from TRIAL_DAYS, never typed as a literal: this screen said
 * "7 days free" while the entitlement engine grants THREE, so the paywall was promising more than
 * the app delivers. Deriving it means that cannot drift again.
 */
const PRICING = {
  monthly: '$9.99',
  annual: '$79.99',
  annualPerMonth: '$6.67',
  savingPct: 33,
} as const;


const GOALS: Choice[] = [
  { key: 'wealth', icon: wallet, title: 'Grow my wealth', sub: 'Build long-term investing habits' },
  { key: 'learn', icon: graduationCap, title: 'Learn how investing works', sub: 'Start from the fundamentals' },
  { key: 'trade', icon: bolt, title: 'Trade with confidence', sub: 'Practice without real risk' },
  { key: 'economy', icon: globe, title: 'Understand the economy', sub: 'Make sense of money & markets' },
];

const LEVELS: Choice[] = [
  { key: 'beginner', icon: seedling, title: 'Total beginner', sub: "I'm starting from zero" },
  { key: 'basics', icon: book, title: 'I know the basics', sub: 'Stocks, saving, a little more' },
  { key: 'experienced', icon: rocket, title: "I'm experienced", sub: 'I want to sharpen my edge' },
];

const TOPICS: Choice[] = [
  { key: 'stocks', icon: chartUp, title: 'Stocks & ETFs' },
  { key: 'budgeting', icon: wallet, title: 'Budgeting & debt' },
  { key: 'economy', icon: globe, title: 'The economy' },
  { key: 'valuation', icon: magnifier, title: 'Valuing companies' },
  { key: 'psychology', icon: star, title: 'Investing psychology' },
  { key: 'risk', icon: lock, title: 'Risk & hedging' },
  { key: 'crypto', icon: bolt, title: 'Crypto & alternatives' },
  { key: 'retirement', icon: trophy, title: 'Retirement & taxes' },
  { key: 'business', icon: rocket, title: 'Startups & business' },
];

const HORIZONS: Choice[] = [
  { key: 'now', title: "I've already started" },
  { key: 'soon', title: 'In the next few months' },
  { key: 'year', title: 'Within a year' },
  { key: 'unsure', title: "I'm not sure yet" },
];

/** Behavioural signal, not a risk score — see the regulatory note in onboarding-path.ts. */
const RISK: Choice[] = [
  { key: 'sell', icon: flame, title: 'Sell, I want out', sub: 'Protect what I have left' },
  { key: 'wait', icon: seedling, title: 'Wait it out', sub: 'Do nothing and hold' },
  { key: 'buy', icon: rocket, title: 'Buy more', sub: "It's on sale" },
];

const DAILY: Choice[] = [
  { key: '5', icon: flame, title: '5 minutes', sub: 'One lesson a day' },
  { key: '10', icon: bolt, title: '10 minutes', sub: 'Two lessons a day' },
  { key: '20', icon: rocket, title: '20 minutes', sub: 'Four lessons a day' },
];

const BLOCKERS: Choice[] = [
  { key: 'jargon', title: 'The jargon is overwhelming' },
  { key: 'time', title: "I never find the time" },
  { key: 'fear', title: 'I’m scared of losing money' },
  { key: 'start', title: "I don't know where to start" },
  { key: 'trust', title: "I don't know who to trust" },
];

/**
 * AGE BANDS. Opened DOWN to 13, 2026-08-23.
 *
 * Audit: "Expand the age range — it currently starts at 18." Euphoria's own marketing calls it
 * "Financial Literacy & Investing for Students" and the web app ships a Classes tab with teacher
 * class codes, so a floor of 18 excluded the audience the product is named for.
 *
 * THIRTEEN, NOT LOWER, and that is a compliance line rather than a preference. COPPA attaches
 * below 13: an under-13 account needs verifiable parental consent, a different data-collection
 * posture and App Store kids-category handling. That is a build, not a picker option, so offering
 * a "under 13" band here would be writing a cheque the app cannot cash.
 *
 * 45+ already covered "older", so only the bottom needed opening.
 *
 * The en dashes below are NUMERIC RANGES and stay — see the em-dash pass, which deliberately left
 * these alone. An en dash between two numbers is correct typography, not the roughness reported.
 */
/**
 * THE AGE FLOOR (N3), and why "Under 13" is on the list rather than absent.
 *
 * COPPA turns on ACTUAL KNOWLEDGE: an operator may not knowingly collect personal information
 * from a child under 13. Euphoria's onboarding collects a name, an age band, goals and an
 * experience level, so the floor has to be real.
 *
 * The tempting version is to simply start the list at 13–17 and call the floor implied. That is
 * not a gate — it is a list with no way to answer honestly, and it teaches a 12-year-old to pick
 * 13–17 to get past it. Offering the option and stopping on it is the version that actually
 * knows, which is the version the rule is about.
 *
 * It is NOT a dead end. Nothing is persisted and back still works, so a mis-tap costs one tap to
 * undo. A permanent lockout would punish a slip on a five-option list.
 */
export const AGE_FLOOR = 13;
const UNDER_AGE = 'under-13';

const AGES: Choice[] = [
  { key: UNDER_AGE, title: `Under ${String(AGE_FLOOR)}` },
  { key: '13-17', title: '13–17' },
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
  { key: 'yes', icon: clock, title: 'Yes, keep me on streak', sub: 'One nudge a day, no spam' },
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

const PROOF: { icon: PixelSprite; title: string; sub: string }[] = [
  { icon: book, title: `${TOTAL_LESSONS} lessons`, sub: `Across ${COURSES.length} courses, from first principles to advanced.` },
  { icon: chartUp, title: 'Practice without risk', sub: 'Paper trading uses simulated money, never your own.' },
  { icon: star, title: 'Atlas explains anything', sub: 'Ask mid-lesson and get it in plain English.' },
];

/** Kept to one line each. At two lines the timeline alone ran ~200pt, which pushed "No payment
 *  due now" and the renewal terms off the bottom of the screen.
 *
 *  ── THE NUMBERS WERE WRONG AND SHIPPED THAT WAY ─────────────────────────────────────────────
 *  These beats read "In 5 days — Reminder" and "In 7 days — Billing starts": the reference apps'
 *  7-day shape (Nibble TODAY/DAY 5/DAY 7, Promova Today/In 5 days/In 7 days) copied literally into
 *  a THREE-day trial. So this screen promised billing in 7 days while the badge beneath it said
 *  "3 DAYS FREE" and the engine granted 3. C31 fixed the badge and the renewal terms and missed
 *  these, the heading and the CTA — four contradictions on one screen. Now every one derives.
 *
 *  ── "Day N", NOT "In N days" ────────────────────────────────────────────────────────────────
 *  The trial is measured in DAYS USED, not calendar days (§9.2), so "in 3 days" would be a second
 *  lie: someone who opens the app twice a week reaches day 3 a fortnight from now. "Day 2" and
 *  "Day 3" are the same framing `trialDayNumber` already puts on You and Settings ("Day 3 of 3"),
 *  so all three surfaces now count the same way.
 *
 *  C22 records 3/3 convergence on stating the reminder relative to the END with a real date pill.
 *  Euphoria deliberately has NO date here: a days-used trial has no computable end date (C32), and
 *  inventing one would be §0.4 applied to a promise.
 *
 *  The reminder beat is TRIAL_DAYS - 1 per C13 decision 3. At TRIAL_DAYS < 3 it would collapse into
 *  "Today" and this array needs revisiting rather than deriving.
 */
const TRIAL_STEPS: { icon: PixelSprite; title: string; sub?: string; tone: 'solid' | 'soft' | 'muted' }[] = [
  { icon: lock, title: 'Today', sub: 'Every lesson, Atlas coaching, and paper trading.', tone: 'solid' as const },
  { icon: clock, title: `Day ${TRIAL_DAYS - 1} · Reminder`, sub: "We'll remind you before anything is charged.", tone: 'soft' as const },
  { icon: wallet, title: `Day ${TRIAL_DAYS} · Billing starts`, tone: 'muted' as const },
];

/**
 * What Pro REOPENS, shown instead of the trial timeline once the three days are spent.
 *
 * Not a generic benefits list: each line names something the hard wall actually closed, in the same
 * order the gate sheet's one-liner names them ("Every lesson, unlimited Atlas, the full options
 * desk"). A spent user has just been refused by one of these, so the list is a description of their
 * last five minutes rather than marketing.
 */
const PRO_STEPS: { icon: PixelSprite; title: string; sub?: string; tone: 'solid' | 'soft' | 'muted' }[] = [
  { icon: lock, title: 'Every lesson reopens', sub: 'All 12 courses, 300 lessons, no counter.', tone: 'solid' as const },
  { icon: star, title: 'Atlas becomes unlimited', sub: 'Ask as much as you like, mid-lesson.', tone: 'soft' as const },
  // A one-liner like the two above it. Without one this row rendered as a bare title against two
  // subtitled siblings, which reads as unfinished rather than as a shorter point.
  { icon: chartUp, title: 'Paper trading and the options desk', sub: 'Trade stocks and options with virtual money.', tone: 'muted' as const },
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

/**
 * NAME STEP. Home renders `Hey there, {name}` from profile.name, and onboarding never asked for a
 * name, so that greeting fell back to a bare "Hey there" for everyone. profile.name was only ever
 * written by auth.tsx at sign-in, and only when that field happened to be filled in.
 *
 * A LOCAL DRAFT DRIVES THE INPUT, and the store gets the trimmed value on every keystroke.
 * setDisplayName trims and caps at NAME_MAX, so binding the input straight to the store would eat
 * the space the moment you typed it and make "Anna Maria" impossible. avatar.tsx solves the same
 * problem the same way.
 */
function NameStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const theme = useTheme();
  return (
    <View>
      <ThemedText type="title" maxFontSizeMultiplier={2} style={{ fontSize: FontSize.titleSm }}>
        What should we call you?
      </ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={2} style={{ marginTop: 4 }}>
        It goes on your home screen and your profile. You can change it any time.
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Your first name"
        placeholderTextColor={theme.mutedForeground}
        maxLength={NAME_MAX}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        accessibilityLabel="Your name"
        style={[styles.nameInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
      />
    </View>
  );
}

/**
 * AVATAR STEP. src/app/avatar.tsx has existed the whole time and is reachable ONLY from Profile
 * to "Avatar & banner", so every new user finished onboarding as the default Atlas and most never
 * found out they could change it. Choosing a face is the cheapest personalisation in the app and
 * it belongs where the rest of the personalisation already happens.
 *
 * NO NEW ART AND NO NEW STATE. These are the same ALL_AVATARS the profile screen offers, drawn
 * with the same PixelSpriteView, writing the same `avatarId`. It never blocks Continue because
 * avatarId already defaults to Atlas, so skipping this step lands exactly where the flow landed
 * before it existed.
 */
function AvatarStep() {
  const theme = useTheme();
  const avatarId = useApp((s) => s.avatarId);
  const setAvatarId = useApp((s) => s.setAvatarId);
  return (
    <View>
      <ThemedText type="title" maxFontSizeMultiplier={2} style={{ fontSize: FontSize.titleSm }}>
        Pick your avatar
      </ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={2} style={{ marginTop: 4 }}>
        This is you around the app. You can change it any time from your profile.
      </ThemedText>
      <View style={styles.avatarGrid}>
        {ALL_AVATARS.map((a) => {
          const on = a.id === avatarId;
          return (
            <SpringPressable
              key={a.id}
              haptic={false}
              scaleTo={0.92}
              onPress={() => { setAvatarId(a.id); }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={a.label}>
              <View
                style={[
                  styles.avatarTile,
                  {
                    backgroundColor: theme.card,
                    borderColor: on ? theme.primary : theme.border,
                    borderWidth: on ? 2 : StyleSheet.hairlineWidth,
                  },
                ]}>
                <PixelSpriteView sprite={a.sprite} size={40} />
              </View>
            </SpringPressable>
          );
        })}
      </View>
    </View>
  );
}

type StepDef =
  | { kind: 'single'; field: keyof Profile; question: string; sub?: string; options: Choice[]; face: AtlasExpression }
  | { kind: 'multi'; field: keyof Profile; question: string; sub?: string; options: Choice[]; face: AtlasExpression }
  | { kind: 'statement'; title: string; sub?: string; body?: 'chart' | 'proof'; face: AtlasExpression }
  | { kind: 'loader' }
  | { kind: 'reveal' }
  | { kind: 'name' }
  | { kind: 'avatar' }
  | { kind: 'paywall' };

/** The flow. Adding a question is a new entry here — no JSX, no new branch. */
const STEPS: StepDef[] = [
  { kind: 'name' },
  { kind: 'single', field: 'experience', question: 'How much do you already know?', options: LEVELS, face: 'watching' },
  { kind: 'single', field: 'goal', question: 'What brings you to Euphoria?', options: GOALS, face: 'default' },
  { kind: 'multi', field: 'topics', question: 'What do you want to learn about?', options: TOPICS, face: 'happy' },
  // No efficacy multiplier here. The old copy promised "4× faster" with nothing behind it —
  // an unsubstantiated performance claim inside a paid finance funnel. Credit the habit, not a number.
  { kind: 'statement', title: 'The habit is what makes it stick', body: 'chart', face: 'proud', sub: 'Ten minutes a day builds real investing instinct.' },
  { kind: 'single', field: 'horizon', question: 'When do you want to start investing for real?', options: HORIZONS, face: 'watching' },
  { kind: 'single', field: 'riskComfort', question: 'Your portfolio drops 20% in a month. You…', sub: 'There’s no wrong answer. It tells Atlas how to coach you.', options: RISK, face: 'whoa' },
  { kind: 'single', field: 'dailyMinutes', question: 'How much time can you give it?', options: DAILY, face: 'happy' },
  { kind: 'statement', title: 'Everything you need to start', body: 'proof', face: 'proud' },
  { kind: 'multi', field: 'blockers', question: 'What’s held you back so far?', options: BLOCKERS, face: 'thinking' },
  { kind: 'single', field: 'ageBand', question: 'How old are you?', sub: 'It helps us pace the long-term material.', options: AGES, face: 'default' },
  { kind: 'single', field: 'source', question: 'Where did you hear about us?', options: SOURCES, face: 'default' },
  { kind: 'single', field: 'notifyOptIn', question: 'Want a daily nudge?', options: NOTIFY, face: 'happy' },
  { kind: 'avatar' },
  { kind: 'loader' },
  { kind: 'reveal' },
  { kind: 'paywall' },
];

const TOTAL = STEPS.length;
const PAYWALL_INDEX = TOTAL - 1;
const PAYWALL_ATLAS = 52;

const REVEAL_INDEX = TOTAL - 2;

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
  const { step, renderStep, bodyOpacity, atlasT, goTo } = useStepTransition(startStep, scrollRef, TOTAL);
  // A tap is an acknowledgement, not an achievement — see AtlasStage below for why these are
  // two different keys.
  /* Draft lives here, not in NameStep, because canContinue has to read it to gate the button. */
  const [nameDraft, setNameDraft] = useState(() => useApp.getState().profile.name ?? '');
  const onNameChange = (v: string) => {
    setNameDraft(v);
    useApp.getState().setDisplayName(v);
  };
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
  /**
   * BACK MEANS "UNDO MY LAST STEP", NOT "DECREMENT THE INDEX".
   *
   * Two reports on 2026-08-22, one function:
   *
   *   N2 "Back arrow doesn't work on the 'How much do you already know?' screen."
   *      That screen is step 0. `step > 0` was false, so this returned undefined while
   *      BackChevron still drew a live-looking button. Dead control, fixed there.
   *
   *   N4 "tapping the free trial banner takes you to the subscription screen; hitting back from
   *      there sends you to onboarding instead of back to Home."
   *      The banner deep-links to `?step=paywall`, which starts at PAYWALL_INDEX (14). Walking the
   *      index back put a returning user on step 13 — the middle of a flow they finished weeks ago.
   *
   * The index alone cannot tell those apart; where the user ENTERED can. Steps above the entry
   * point are this screen's own history and are walked back one at a time. At the entry point there
   * is nothing of ours left to undo, so back belongs to whoever pushed us — Home, the reward sheet
   * or the You upsell.
   *
   * FROZEN WITH useState, NOT useRef. The point has always been that a re-render cannot move the
   * boundary, and a state initialiser freezes it just as hard — while a ref does not: reading
   * `.current` during render is what React's own rule forbids, because a ref is not render-safe in
   * general even when, as here, nothing ever writes to it. `hasBack` reads this on every render to
   * decide whether a chevron is drawn at all, so it has to be a render-safe value.
   */
  const [entryStep] = useState(startStep);
  const back = () => {
    if (step > entryStep) {
      goTo(step - 1);
      return;
    }
    if (router.canGoBack()) router.back();
  };
  /** Whether there is anywhere to go back TO. Drives whether a chevron is drawn at all. */
  const hasBack = step > entryStep || router.canGoBack();

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

  /*
   * ── THE TWO PAYWALLS ON ONE SCREEN (Unit 5) ─────────────────────────────────────────────────
   *
   * A FRESH user is being offered the 3-day trial, which is device-local and free. There is nothing
   * to buy, so the CTA correctly just proceeds — that was right before this unit and still is.
   *
   * An EXPIRED user reaching here from the gate sheet is a completely different person, and until
   * now they got the same screen. Measured on device: someone with activeDays:4 was shown "Start
   * your 3-day FREE trial to continue" and "No payment due now", and tapping the CTA dropped them
   * on Home with isPro still false and nothing purchased. The gate sheet's "See Euphoria Pro" led
   * to a dead end — §0.5's "single largest dead control in the app", and completing the hard wall
   * is what made it reachable.
   *
   * So `spent` branches the whole purchase surface: heading, timeline, badge, reassurance line,
   * CTA, and the renewal terms. Offering a free trial to someone who has used it is not just a
   * dead control, it is a false statement about what they are getting.
   */
  const tierNow = useTier();
  const spent = tierNow === 'expired';
  /**
   * EXTENDED 2026-08-22. The paragraph above fixed the EXPIRED user; two more people fell through
   * the same hole, and both were reported by cofounders on the same day:
   *
   *   N15 "tapping the arrow next to the trial banner says 'Start your free trial to continue'
   *        even when already enrolled."
   *   N14 "the post-lesson 'open the present' reward offers 'Start your free trial' even to users
   *        who are already on the free trial."
   *
   * They are ONE bug. Both surfaces `router.push('/onboarding?step=paywall')`, and this screen only
   * asked `spent`. `tier()` answers 'trial' for activeDays 0 THROUGH TRIAL_DAYS, so a person on day
   * 2 of 3 was indistinguishable from a person who had never opened the app — and the CTA they got
   * was `next`, which does not even purchase. It advanced onboarding.
   *
   * A FOURTH case, not reported and worse: `tier === 'pro'` also yields spent === false, so a
   * PAYING SUBSCRIBER reaching this screen was told to start a free trial. entitlement.ts:95 warns
   * about exactly this — "a paying user must never see a trial countdown. That specific bug is what
   * generates 'I already paid' support mail and refund requests."
   *
   * So the question this screen must ask is not "is the trial spent" but "may I offer a trial at
   * all", which is true for exactly one person: a non-Pro user whose trial clock has not started.
   */
  const isProNow = tierNow === 'pro';
  const trialRunning = useTrialStarted();
  const trialDay = useApp(trialDayNumber);
  const offersTrial = tierNow === 'trial' && !trialRunning;

  /*
   * PAYWALL_SEEN. This screen carried NO analytics at all — it was the one paid surface in the app
   * that reported nothing.
   *
   * MEASURED IN POSTHOG 2026-08-24. Every engagement event has fired in production
   * (first_lesson_completed, day_return, first_action_started/skipped, trial_reward_*), and every
   * monetisation event had fired ZERO times: paywall_seen, paywall_dismissed, special_offer_*,
   * trial_started, paid. gate-sheet.tsx does fire paywall_seen for the four in-app walls, but the
   * onboarding paywall is the one every new user reaches, and it was silent.
   *
   * Without this event the funnel has no denominator, and the two failures that matter are
   * indistinguishable: "nobody reaches the paywall" and "everybody reaches it and nobody buys"
   * need opposite fixes. `paid` already fires from purchases.ts on the transition to Pro, so this
   * completes the pair.
   *
   * Fired from an effect on arrival, never during render, and latched by a ref so that re-renders
   * from `busy`, plan selection or the trial banner cannot inflate the count. `surface`
   * distinguishes it from the gate-sheet walls, which share the event name deliberately: one
   * paywall_seen across all surfaces is the number you want, broken down by surface when you ask.
   */
  const paywallSeenRef = useRef(false);
  useEffect(() => {
    if (step !== PAYWALL_INDEX || paywallSeenRef.current) return;
    paywallSeenRef.current = true;
    track(Ev.paywallSeen, { surface: 'onboarding', tier: tierNow, offers_trial: offersTrial, is_pro: isProNow });
  }, [step, tierNow, offersTrial, isProNow]);
  const [busy, setBusy] = useState(false);

  /** Apple requires a Restore control on any screen selling a subscription — independent of
   *  convergence (2/5 in the Unit 5 pull, 2/2 on captured price screens). Reports what it FOUND,
   *  because "restored" and "nothing to restore" are very different things to be told. */
  const restore = () => {
    if (!IAP_ENABLED) {
      Alert.alert('Restore purchases', `${IAP_DISABLED_REASON} Once subscriptions are live, this will restore any prior purchase tied to your Apple ID.`);
      return;
    }
    setBusy(true);
    void restorePurchases().then((r) => {
      setBusy(false);
      if (r.ok && r.isPro) Alert.alert('Welcome back', 'Your Euphoria Pro subscription is active again.');
      else if (r.ok) Alert.alert('Nothing to restore', 'No previous Euphoria Pro purchase was found on this Apple ID.');
      else if (r.kind !== 'cancelled') Alert.alert('Restore failed', r.kind === 'not-configured' ? IAP_DISABLED_REASON : purchaseErrorMessage(r.code));
    });
  };

  /**
   * BUY. Only reachable when the trial is spent, because that is the only time money is the answer.
   *
   * Picks the package matching the selected plan card by its product identifier rather than by
   * position: RevenueCat returns packages in dashboard order, and keying on [0]/[1] would silently
   * swap the plans the day someone reorders them.
   */
  const buyPro = () => {
    if (!IAP_ENABLED) {
      Alert.alert('Euphoria Pro', IAP_DISABLED_REASON);
      return;
    }
    setBusy(true);
    void getPackages().then(async (pkgs) => {
      // Store-independent lookup — see findPackage. Keying on the App Store product id found
      // nothing against the Test Store and the honest error path fired, which is how this was found.
      const pkg = findPackage(pkgs, plan === 'annual' ? 'annual' : 'monthly');
      if (!pkg) {
        setBusy(false);
        // The silent App Store Connect misconfiguration, said out loud rather than shown as a
        // spinner that never resolves.
        Alert.alert('Euphoria Pro', 'That plan is not available from the App Store right now.');
        return;
      }
      const r = await purchase(pkg);
      setBusy(false);
      if (r.ok && r.isPro) router.replace('/home');
      else if (!r.ok && r.kind === 'error') Alert.alert('Purchase failed', purchaseErrorMessage(r.code));
      // 'cancelled' is deliberately silent — backing out of the Apple sheet is not an error.
    });
  };

  /** True only on the age step with the under-13 band chosen — see AGE_FLOOR above. */
  const underAge = liveDef?.kind === 'single' && liveDef.field === 'ageBand' && profile.ageBand === UNDER_AGE;

  const canContinue = (() => {
    if (underAge) return false;
    if (!liveDef) return true;
    if (liveDef.kind === 'name') return nameDraft.trim().length > 0;
    if (liveDef.kind === 'single') return selected(liveDef.field) !== null;
    if (liveDef.kind === 'multi') return ((profile[liveDef.field] as string[]) ?? []).length > 0;
    return true;
  })();

  const face: AtlasExpression =
    !def ? 'happy'
      : def.kind === 'reveal' ? 'proud'
        : def.kind === 'paywall' ? 'happy'
          : def.kind === 'loader' ? 'thinking'
            : def.kind === 'name' ? 'happy'
            : def.kind === 'avatar' ? 'happy'
              : def.face;

  const bodyStyle = useAnimatedStyle(() => ({ opacity: bodyOpacity.get() }));

  const body = () => {
    if (!def) return null;
    switch (def.kind) {
      case 'single':
        return (
          <>
            <SingleSelectStep
              question={def.question}
              sub={def.sub}
              options={def.options}
              value={selected(def.field)}
              onChange={(k) => {
                answer(def.field, k);
                /*
                 * UNDER 13 MUST NOT ADVANCE. Single-select steps auto-advance on pick, so guarding
                 * only `canContinue` left the gate wide open — the Continue button was disabled
                 * while the screen had already moved past it. Found by tapping it on the
                 * simulator; the static pin passed the whole time, which is exactly why the pin
                 * now asserts this line too.
                 */
                if (def.field === 'ageBand' && k === UNDER_AGE) return;
                // notifyOptIn opens the iOS permission dialog — do not advance behind it.
                if (def.field !== 'notifyOptIn') advanceAfterPick();
              }}
            />
            {/*
              UNIT 15a. The time picker sits BEFORE the yes/no, and the placement IS the mechanism
              (Headway `128567`): once someone has chosen when they want to be nudged, iOS's prompt
              is only asking whether — a far easier question than a cold "Allow notifications?".
              Answering here also means the hour is already in the store when answer() fires, so
              applyDailyNudge schedules against the user's choice on the very first call.
            */}
            {def.field === 'notifyOptIn' && <NudgeTimePicker />}
          </>
        );
      case 'name':
        return <NameStep value={nameDraft} onChange={onNameChange} />;
      case 'avatar':
        return <AvatarStep />;
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
                        <PixelSpriteView sprite={p.icon} size={20} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="heading" style={{ fontSize: FontSize.body }}>{p.title}</ThemedText>
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
            <StepHeading
              title={
                isProNow
                  ? "You're on Euphoria Pro"
                  : spent
                    ? `Your free ${TRIAL_DAYS} days are up`
                    : offersTrial
                      ? `Start your ${TRIAL_DAYS}-day FREE trial to continue`
                      : `You're on day ${trialDay} of ${TRIAL_DAYS}`
              }
            />
            {/* The body stays top-packed, and the action follows it in the same scroll stack so no
                flex spacer can separate Monthly from the CTA. */}
            {/* The timeline is about a trial. Showing "Today / Day 2 / Day 3" to someone whose
                three days are gone describes something that cannot happen to them, so a spent user
                gets what Pro reopens instead — the gate sheet's one-line promise, expanded. */}
            {/*
              * THE CHART TAKES THE TIMELINE'S PLACE. Owner's call 2026-08-22 after seeing three
              * layouts captured side by side on the simulator.
              *
              * The trial timeline (Today / Day 2 — Reminder / Day 3 — Billing starts) was set from
              * five captured competitor paywalls, so this is not a free swap. What it cost and why
              * it is still safe:
              *   - The BILLING DISCLOSURE is not lost. The footer already states it in full: "3
              *     days free, then <annual> per year, billed annually. Renews until cancelled.
              *     Cancel anytime in the App Store." That sentence, not the timeline, is what
              *     App Review reads.
              *   - What IS lost is the "We'll remind you before anything is charged" trust beat.
              *     That is a conversion cost, not a compliance one, and it is worth watching: if
              *     trial starts drop after this ships, this line is the first suspect.
              *
              * `spent` users never saw the trial timeline anyway — they get PRO_STEPS — so they
              * keep their existing screen unchanged.
              */}
            {spent ? (
              <View style={{ marginTop: Spacing.three }}>
                {PRO_STEPS.map((s, i) => (
                  <RiseIn key={s.title} delay={childDelay(i)}>
                    <TrialStep icon={s.icon} title={s.title} sub={s.sub} tone={s.tone} last={i === PRO_STEPS.length - 1} />
                  </RiseIn>
                ))}
              </View>
            ) : (
              <RiseIn delay={childDelay(0)} style={{ marginTop: Spacing.one }}>
                <PremiumBenefits />
              </RiseIn>
            )}
            <RiseIn delay={childDelay(TRIAL_STEPS.length)} style={{ marginTop: Spacing.two }}>
              {/* The plan NAME carries the billing period and the price carries the amount you
                  are actually charged. Both cards used to headline a "/mo" figure, so the annual
                  plan read as a second, cheaper monthly plan rather than as a yearly one. */}
              <PlanCard
                selected={plan === 'annual'}
                onPress={() => setPlan('annual')}
                badge={offersTrial ? `${TRIAL_DAYS} DAYS FREE · SAVE ${PRICING.savingPct}%` : `SAVE ${PRICING.savingPct}%`}
                title="Annual"
                sub={`Works out at ${PRICING.annualPerMonth} a month`}
                price={PRICING.annual}
                unit="per year"
              />
              <PlanCard
                selected={plan === 'monthly'}
                onPress={() => setPlan('monthly')}
                title="Monthly"
                sub="Billed every month"
                price={PRICING.monthly}
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
  const fillsViewport = renderStep === REVEAL_INDEX;

  const actionFooter = (
    <View style={[styles.footer, step === PAYWALL_INDEX && styles.paywallFooter]}>
      {step === PAYWALL_INDEX && offersTrial && (
        <View style={styles.noPay}>
          <UIcon name="check" size={16} color={theme.primary} />
          <ThemedText type="bodyMedium">No payment due now</ThemedText>
        </View>
      )}
      <SlabButton
        label={
          step === REVEAL_INDEX
            ? 'Start learning'
            : step === PAYWALL_INDEX
              ? isProNow
                ? 'Back to learning'
                : offersTrial
                  ? `Start my ${TRIAL_DAYS}-day free trial`
                  : `Get Euphoria Pro · ${plan === 'annual' ? PRICING.annual : PRICING.monthly}`
              : 'Continue'
        }
        full
        {...(step === PAYWALL_INDEX && !isProNow ? { tone: 'premium' as const } : {})}
        loading={busy}
        disabled={!canContinue || busy}
        onPress={
          step === PAYWALL_INDEX
            ? isProNow
              ? () => router.replace('/home')
              : offersTrial
                ? next
                : buyPro
            : next
        }
      />
      {underAge && (
        <ThemedText type="small" themeColor="mutedForeground" style={styles.fine}>
          {`Euphoria is built for ages ${String(AGE_FLOOR)} and up. Come back when you get there. We'll be here.`}
        </ThemedText>
      )}
      {step === PAYWALL_INDEX && !offersTrial && !isProNow && !IAP_ENABLED && (
        <ThemedText type="small" themeColor="mutedForeground" style={styles.fine}>
          {IAP_DISABLED_REASON}
        </ThemedText>
      )}
      {step === PAYWALL_INDEX && (
        <>
          <ThemedText type="small" themeColor="mutedForeground" style={styles.fine}>
            {offersTrial ? `${TRIAL_DAYS} days free, then ` : ''}
            {plan === 'annual'
              ? `${PRICING.annual} per year, billed annually`
              : `${PRICING.monthly} per month`}
            . Renews until cancelled. Cancel anytime in the App Store.
          </ThemedText>
          <SpringPressable
            haptic={false}
            onPress={() => router.replace('/home')}
            style={styles.maybeLater}
            accessibilityRole="button"
            accessibilityLabel="Maybe later">
            <ThemedText type="small" themeColor="mutedForeground">Maybe later</ThemedText>
          </SpringPressable>
          <View style={styles.legalRow}>
            <SpringPressable
              haptic={false}
              onPress={() => openLegal(LEGAL.terms)}
              style={styles.legalAction}
              hitSlop={{ top: 13, bottom: 13 }}
              accessibilityRole="link"
              accessibilityLabel="Terms">
              <ThemedText type="small" themeColor="mutedForeground" style={styles.legalLink}>Terms</ThemedText>
            </SpringPressable>
            <ThemedText type="small" themeColor="mutedForeground" style={styles.legalDot}>·</ThemedText>
            <SpringPressable
              haptic={false}
              onPress={() => openLegal(LEGAL.privacy)}
              style={styles.legalAction}
              hitSlop={{ top: 13, bottom: 13 }}
              accessibilityRole="link"
              accessibilityLabel="Privacy">
              <ThemedText type="small" themeColor="mutedForeground" style={styles.legalLink}>Privacy</ThemedText>
            </SpringPressable>
            <ThemedText type="small" themeColor="mutedForeground" style={styles.legalDot}>·</ThemedText>
            <SpringPressable
              haptic={false}
              onPress={restore}
              style={styles.legalAction}
              hitSlop={{ top: 13, bottom: 13 }}
              accessibilityRole="button"
              accessibilityLabel="Restore purchases">
              <ThemedText type="small" themeColor="mutedForeground" style={styles.legalLink}>Restore</ThemedText>
            </SpringPressable>
          </View>
        </>
      )}
    </View>
  );

  return (
    // AmbientBackground is absoluteFill, so it can only ever paint its PARENT. Nested inside
    // the SafeAreaView it was clipped to the inset box, which left the home-indicator band at
    // the bottom bare — the "white space" under the paywall footer. A full-bleed wrapper with
    // a TRANSPARENT SafeAreaView inside keeps every existing layout rule intact while letting
    // the gradient and stars run to the physical edges of the screen.
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <AmbientBackground />
      <SafeAreaView style={styles.safe} edges={renderStep === PAYWALL_INDEX ? ['top'] : undefined}>
      <View style={styles.header}>
        <ProgressHeader step={step} total={TOTAL} onBack={hasBack ? back : undefined} />
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
        size={renderStep === PAYWALL_INDEX ? PAYWALL_ATLAS : ATLAS_SIZE}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, renderStep === PAYWALL_INDEX && styles.paywallContent]}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[bodyStyle, fillsViewport && styles.grow]}>
          {/* keyed on renderStep so RiseIn's `entering` re-fires for every step */}
          <View key={renderStep} style={fillsViewport ? styles.grow : undefined}>{body()}</View>
        </Animated.View>
        {renderStep === PAYWALL_INDEX && !isLoader ? actionFooter : null}
      </ScrollView>

      {/* the loader drives itself — offering a button there would let users outrun it */}
      {!isLoader && renderStep !== PAYWALL_INDEX ? actionFooter : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Full-bleed. Holds the ambient background so it reaches past the safe-area insets. */
  screen: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  content: { padding: Spacing.four, paddingTop: Spacing.two, flexGrow: 1, justifyContent: 'flex-start' },
  paywallContent: { paddingTop: 0, paddingBottom: 0 },
  proofCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  proofIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  /** Opens the flex chain so a child can claim the leftover viewport height. */
  grow: { flexGrow: 1 },
  nameInput: { marginTop: Spacing.four, minHeight: 52, borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.three, fontSize: FontSize.bodyLg },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.three },
  avatarTile: { width: 62, height: 62, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  /** Content-sized so no flexible spacer can separate Monthly from the purchase action. */
  paywallBody: { gap: Spacing.one, paddingBottom: Spacing.two },
  noPay: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.one, paddingBottom: Spacing.two },
  fine: { textAlign: "center", fontSize: FontSize.label, lineHeight: 15, paddingTop: Spacing.one, paddingHorizontal: Spacing.two },
  footer: { padding: Spacing.three, paddingTop: Spacing.one },
  paywallFooter: { paddingTop: 0, paddingBottom: Spacing.two },
  maybeLater: { alignItems: "center", paddingTop: Spacing.two },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: Spacing.one },
  legalAction: { minWidth: 44, alignItems: 'center' },
  legalLink: { fontSize: FontSize.label, textDecorationLine: 'underline', opacity: 0.75 },
  legalDot: { fontSize: FontSize.label, opacity: 0.75 },
});
