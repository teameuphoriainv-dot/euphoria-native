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
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View, useWindowDimensions,} from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import type { AtlasExpression } from '@/components/atlas';
import {
  ATLAS_SIZE,
  AtlasStage,
  PAYWALL_MAX_FONT_SCALE,
  PAYWALL_ROOMY_COST,
  type Choice,
  GrowthChart,
  MultiSelectStep,
  PlanCard,
  PlanRevealStep,
  ProgressHeader,
  SingleSelectStep,
  StatementStep,
  StepHeading,
  TrialStep, PremiumBenefits } from '@/components/onboarding-parts';
import { AtlasGuide } from '@/components/onboarding/atlas-guide';
import { AvatarHero, heroAvatarId } from '@/components/onboarding/avatar-hero';
import { DoubleItCheckBar, DoubleItStep, useDoubleIt, type DoubleItEvent } from '@/components/onboarding/double-it-step';
import { PathAssemblyLoader } from '@/components/onboarding/path-assembly-loader';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing, FontSize, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ALL_AVATARS } from '@/lib/avatars';
import { Ev, track } from '@/lib/analytics';
import { TRIAL_DAYS, trialDayNumber, useTier } from '@/lib/entitlement';
import { IAP_DISABLED_REASON, IAP_ENABLED, getPackages, readPlanOffer, type PlanOffer, purchase, restore as restorePurchases, purchaseErrorMessage } from '@/lib/purchases';
import { AVAILABLE_COURSES, AVAILABLE_LESSON_COUNT } from '@/lib/curriculum';
import { estimateWeeks, hasAccount, lessonsPerDay, recommendPathDetailed, type Profile } from '@/lib/onboarding-path';
import { ATLAS_BEATS } from '@/lib/onboarding/double-it';
import { atlasLineFor, stepKeyOf, tryResultOf, type TryResult } from '@/lib/onboarding/atlas-lines';
import { NAME_MAX, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { CHILD_BASE, childDelay, useStepTransition } from '@/shared/motion/step-transition';
import {
  PixelSpriteView, bolt, book, chartDown, chartUp, checkBadge, clock, compass, flame, globe,
  graduationCap, hourglass, lock, question, rocket, seedling, star, trophy, wallet,
  type PixelSprite,
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

/*
 * SEVEN, NOT NINE. These chips mirrored the curriculum one-for-one, which meant they also
 * mirrored the parts of it that are not what a sixteen-year-old opens this app for: "Valuing
 * companies" is corporate finance and "Startups & business" is business strategy — university
 * subjects sitting between Budgeting & debt and Retirement & taxes.
 *
 * The COURSES are untouched. corporate-finance is still reached by riskComfort 'buy' and by the
 * economy goal seed, business-strategy by the same seed, so nothing is orphaned — this removes
 * two ways to ASK for them on a screen aimed at beginners, not the material itself.
 *
 * NOTE for whoever revisits scope: this is the onboarding half of a wider question. Five of the
 * twelve courses (corporate-finance, business-strategy, applied-accounting, quantitative-analysis,
 * financial-analytics) are university/CFA-level and still sit on the Learn rail, in SEED_BY_GOAL
 * and in the "12 available courses" proof-screen claim. Trimming chips does not answer that.
 */
const TOPICS: Choice[] = [
  { key: 'stocks', icon: chartUp, title: 'Stocks & ETFs' },
  { key: 'budgeting', icon: wallet, title: 'Budgeting & debt' },
  { key: 'economy', icon: globe, title: 'The economy' },
  { key: 'psychology', icon: star, title: 'Investing psychology' },
  { key: 'risk', icon: lock, title: 'Risk & hedging' },
  { key: 'crypto', icon: bolt, title: 'Crypto & alternatives' },
  { key: 'retirement', icon: trophy, title: 'Retirement & taxes' },
];

/*
 * ICONS, LIKE EVERY OTHER ROOMY QUESTION.
 *
 * This was the one four-option step with no sprites, so it took the taller card treatment with
 * nothing to put in it: one line of text centred in a box sized for an icon and a subtitle.
 * Measured 252pt of dead screen against 197 on horizon's neighbours, and it read as an
 * afterthought sitting between two screens that did not.
 *
 * Each answer already drives the path (four distinct mappings in candidates()), so the fix is to
 * give the question the same weight as its neighbours, not to shrink it. Sprites chosen for the
 * timeline they describe rather than for decoration: already in the market, a countdown, a thing
 * planted that takes a year, and still reading up.
 */
const HORIZONS: Choice[] = [
  { key: 'now', icon: chartUp, title: "I've already started" },
  { key: 'soon', icon: clock, title: 'In the next few months' },
  // graduationCap, not seedling: RISK already spends seedling on "Wait it out" one screen
  // later, and the same sprite for two different meanings in consecutive questions reads as a
  // mistake. A year out is the horizon with room to study first, which is what this now says.
  { key: 'year', icon: graduationCap, title: 'Within a year' },
  { key: 'unsure', icon: book, title: "I'm not sure yet" },
];

/** Behavioural signal, not a risk score — see the regulatory note in onboarding-path.ts. */
const RISK: Choice[] = [
  { key: 'sell', icon: flame, title: 'Sell, I want out', sub: 'Protect what I have left' },
  { key: 'wait', icon: seedling, title: 'Wait it out', sub: 'Do nothing and hold' },
  { key: 'buy', icon: rocket, title: 'Buy more', sub: "It's on sale" },
];


/*
 * ICONS, CHOSEN AGAINST THE CATALOGUE'S OWN DESCRIPTIONS.
 *
 * This was the only compact list with no sprites while TOPICS carries them at nine options, so
 * five plain rows sat above ~227pt of empty screen. The first pass at picking these concluded
 * "two of the five have no apt sprite" after looking at the fifteen already imported rather than
 * the ~150 that exist — the wrong answer from the wrong sample.
 *
 * Each is matched to the author's written description, not to a guess from the name:
 *
 *   question   "A question mark. Something unknown or being asked."
 *   hourglass  "An hourglass. Time passing and long horizons."
 *   chartDown  "Descending bars. Losses, drawdowns, risk."
 *   compass    "A compass. Direction and having a plan."
 *   checkBadge "A verified badge. Something confirmed correct."
 *
 * Two earlier picks were dropped on the same test: piggyCrack is "savings emptied out", which is
 * already broke rather than afraid of becoming so, and handshake is "deals, agreements, trades",
 * which is a transaction rather than trust. An icon that is nearly right is a small lie told
 * five times down a list.
 */
const BLOCKERS: Choice[] = [
  { key: 'jargon', icon: question, title: 'The jargon is overwhelming' },
  { key: 'time', icon: hourglass, title: "I never find the time" },
  { key: 'fear', icon: chartDown, title: 'I’m scared of losing money' },
  { key: 'start', icon: compass, title: "I don't know where to start" },
  { key: 'trust', icon: checkBadge, title: "I don't know who to trust" },
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
const PROOF: { icon: PixelSprite; title: string; sub: string }[] = [
  { icon: book, title: `${AVAILABLE_LESSON_COUNT} lessons`, sub: `Across ${AVAILABLE_COURSES.length} available courses, from first principles to advanced.` },
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
  { icon: lock, title: 'Every lesson reopens', sub: `${AVAILABLE_COURSES.length} courses, ${AVAILABLE_LESSON_COUNT} lessons, no counter.`, tone: 'solid' as const },
  { icon: star, title: 'Atlas becomes unlimited', sub: 'Ask as much as you like, mid-lesson.', tone: 'soft' as const },
  // A one-liner like the two above it. Without one this row rendered as a bare title against two
  // subtitled siblings, which reads as unfinished rather than as a shorter point.
  { icon: chartUp, title: 'Paper trading and the options desk', sub: 'Trade stocks and options with virtual money.', tone: 'muted' as const },
];

/*
 * One line per node the path-assembly loader lights. The first line used to be "Reading your
 * experience level…", and the recommender never reads it: experience earned 0 of 75,600 picks in
 * scripts/onboarding-loader-answers-pin.mjs (O2 review, 2026-09-22). A status line claiming work
 * the app does not do is the fabricated-claim failure in CONSTITUTION 3.1, so each line now says
 * only what recommendPathDetailed actually does.
 */
const LOADER_LINES = [
  'Reading your answers…',
  'Picking your courses…',
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
  /*
   * DELIBERATELY TOP-PACKED, and not centred like the statement steps.
   *
   * Centring the field in the leftover height was tried: it removes the dead band below, but it
   * floats the input away from the bubble asking for it, and a question and its answer belong
   * together more than a screen belongs to be evenly filled. The space below stays.
   */
  return (
    <View>
      {/*
       * ASKED THROUGH THE BUBBLE, like every other question in this flow.
       *
       * Steps 1-11 ask via <StepHeading speech>, which hangs a bubble off the Atlas stage above
       * and centres it. This step used a bare left-aligned title instead, so the FIRST screen
       * was the one screen that did not look like the app — a design-system break on the very
       * first impression, before the user has any reason to forgive one.
       *
       * The grey subline is gone with it. "It goes on your home screen and your profile. You can
       * change it any time." is a settings tooltip standing in for a welcome, and it was the
       * first sentence the app ever said to anyone. A labelled text field under a question does
       * not need explaining; mutedForeground on screen one just sets the tone at apologetic.
       */}
      {/* Welcome already said hello ("Hi, I'm Atlas!"), so this asks, it does not greet twice. */}
      <StepHeading speech title="What should we call you?" />
      <TextInput
        /* The one step whose control is useless until focused. Without this the first thing the
           app asks anyone to do is tap a box before they can answer it. */
        autoFocus
        value={value}
        onChangeText={onChange}
        placeholder="Your first name"
        placeholderTextColor={theme.mutedForeground}
        maxLength={NAME_MAX}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
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
  /*
   * PRESELECTED. The stored default is the `atlas` id, which is not in the grid (Atlas is the
   * mascot, never the user), so the step opened with nothing selected and looked unanswered.
   * heroAvatarId maps atlas, empty and unknown ids to the first grid character.
   */
  const shown = heroAvatarId(avatarId);
  useEffect(() => {
    if (avatarId !== shown) setAvatarId(shown);
  }, [avatarId, shown, setAvatarId]);
  return (
    <View>
      {/*
       * ASKED THROUGH THE BUBBLE, like every other step that asks for something.
       *
       * This was the last screen still using a bare left-aligned title under a silent Atlas —
       * the same shape step 0 had before it was changed, down to the grey second line explaining
       * where a setting lives. Two screens from the end of the flow is a poor place to stop
       * looking like the app.
       *
       * "You can change it later" stays, and moves INTO the line Atlas says. With 54 avatars on
       * offer the reassurance is doing real work — it is the difference between choosing and
       * deliberating — but it was a mutedForeground aside pointing at Profile, which is a
       * settings breadcrumb rather than a thing a mascot would tell you.
       */}
      <StepHeading speech title="Pick your avatar. You can change it later." />
      {/* A 96pt preview of the pick. The user's own avatar, never Atlas (avatar-hero.tsx). */}
      <View style={styles.avatarHero}>
        <AvatarHero avatarId={shown} />
      </View>
      <View style={styles.avatarGrid}>
        {ALL_AVATARS.map((a) => {
          const on = a.id === shown;
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
  | { kind: 'try' }
  | { kind: 'loader' }
  | { kind: 'reveal' }
  | { kind: 'name' }
  | { kind: 'avatar' }
  | { kind: 'paywall' };

/** The flow. Adding a question is a new entry here — no JSX, no new branch. */
/*
 * TWO QUESTIONS CUT, 2026-09-19. The test was: does the answer change the recommended path?
 *
 * `candidates()` in onboarding-path.ts is the only function that builds a path, and neither of
 * these appears in it. riskComfort carries 3 mappings, blockers 5, horizon 4, goal seeds the
 * spine, topics map directly and experience sets the tier — all six stay. These two did not
 * move the result by a single course.
 *
 *   dailyMinutes — fed the Home goal ring, which already reads `?? 10` in all five call sites
 *                  (store.ts:998/1085, quests.ts:115, lessonsPerDay, estimateWeeks). Settings
 *                  still exposes it, so nothing is lost but the question.
 *
 *   notifyOptIn  — was never a question. It is the iOS permission dialog wearing a question's
 *                  clothes, which is why it needed a load-bearing exception in canContinue AND
 *                  in autoAdvances to work at all.
 *
 * The permission ask did not disappear with the step — it MOVED. It now fires in lesson.tsx on
 * the first lesson finished, which is the first moment "keep your streak alive" refers to
 * something the user has actually done. Removing the step without re-siting the ask would have
 * left notifyOptIn stuck at its EMPTY_PROFILE `false` and killed every push the app sends.
 */
const STEPS: StepDef[] = [
  { kind: 'name' },
  { kind: 'single', field: 'experience', question: 'How much do you already know?', options: LEVELS, face: 'watching' },
  { kind: 'single', field: 'goal', question: 'What brings you to Euphoria?', options: GOALS, face: 'default' },
  { kind: 'multi', field: 'topics', question: 'What do you want to learn about?', options: TOPICS, face: 'happy' },
  // No efficacy multiplier here. The old copy promised "4× faster" with nothing behind it —
  // an unsubstantiated performance claim inside a paid finance funnel. Credit the habit, not a number.
  { kind: 'statement', title: 'The habit is what makes it stick', body: 'chart', face: 'proud', sub: 'Ten minutes a day builds real investing instinct.' },
  /*
   * "Double it": the one hands-on screen, ADDED (owner decision 1, 2026-09-22: every existing
   * screen stays). Right after the chart that says compounding builds, so the learner then makes it
   * happen, and well before REVEAL_INDEX, the account wall (onboarding-try-it-pin --integrated).
   */
  { kind: 'try' },
  { kind: 'single', field: 'horizon', question: 'When do you want to start investing for real?', options: HORIZONS, face: 'watching' },
  { kind: 'single', field: 'riskComfort', question: 'Your portfolio drops 20% in a month. You…', sub: 'There’s no wrong answer. It tells Atlas how to coach you.', options: RISK, face: 'whoa' },
  { kind: 'statement', title: 'Everything you need to start', body: 'proof', face: 'proud' },
  { kind: 'multi', field: 'blockers', question: 'What’s held you back so far?', options: BLOCKERS, face: 'thinking' },
  // The subtitle here used to read "It helps us pace the long-term material", which nothing in the
  // app implements: ageBand is read in exactly one place, the under-13 gate below. A screen that
  // explains itself with a feature that does not exist is the same problem as a dead control.
  { kind: 'single', field: 'ageBand', question: 'How old are you?', sub: 'We ask so the app is age-appropriate.', options: AGES, face: 'default' },
  /*
   * "Where did you hear about us?" WAS HERE AND IS GONE. Removed 2026-09-15.
   *
   * `profile.source` was written on tap, persisted, and read by nothing anywhere in the codebase.
   * The screen fired no analytics event either, so the answer reached no dashboard and no report:
   * it was a tap that cost a new user a screen and bought nobody anything. The field is deleted
   * from Profile in onboarding-path.ts rather than left orphaned.
   *
   * If attribution is wanted later, it needs a reader BEFORE it needs a question — an analytics
   * event or a stored campaign — or it lands back exactly here.
   */
  { kind: 'avatar' },
  { kind: 'loader' },
  { kind: 'reveal' },
  { kind: 'paywall' },
];

const TOTAL = STEPS.length;
const PAYWALL_INDEX = TOTAL - 1;
/*
 * The try step's Atlas (design 1.2 "Double it"): the coin grid, stepper and check bar need the
 * height, and the design measured 64pt as what fits a 667pt SE with the bar open. The paywall no
 * longer mounts the stage at all: its compact AtlasGuide row (COMPACT_GUIDE_HEIGHT 56pt) replaces
 * the 69pt stage, so owner decision 2 adds Atlas's line there while the paywall gets 13pt SHORTER,
 * never taller, at every Dynamic Type size (the row's height is fixed; CONSTITUTION 5.3).
 */
const TRY_ATLAS = 64;

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
  const params = useLocalSearchParams<{ step?: string; firstRun?: string }>();
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
  /*
   * THE TRY STEP'S STATE lives here, not in the step, because its Check bar replaces the pinned
   * footer outside the ScrollView (double-it-step.tsx header). Its events drive the persistent
   * AtlasStage: thinking while the years move, then the verdict face, and a nod on a right answer.
   */
  const [tryPhase, setTryPhase] = useState<DoubleItEvent>('idle');
  /*
   * How Double it went, for horizon's line (owner decision 2026-09-22: Atlas reacts to the previous
   * answer on every screen; horizon used to say a fixed "Quick one about timing" right after it).
   * Kept apart from the live state on purpose: re-entering the try step resets that state (below),
   * and horizon is still fading out when it does, so a line read from the live state would flip to
   * the generic one on the way out. Overwritten by the next resolve, which Continue requires.
   */
  const [tryResult, setTryResult] = useState<TryResult | null>(null);
  const tryCtl = useDoubleIt({
    onEvent: (e) => {
      setTryPhase(e);
      if (e === 'correct' || e === 'revealed') setNodKey((n) => n + 1);
    },
    onResolved: (r) => setTryResult(tryResultOf(r)),
  });
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  /**
   * Freeze how this visit began. `completeOnboarding()` stamps `profile.completedAt` in the loader,
   * before the reveal and paywall. Reading the live value at the final step therefore made every
   * brand-new learner look like a returning upsell visitor and skipped `/auth` entirely.
   */
  /*
   * `firstRun=1` is set by /auth when it returns someone to the paywall mid-flow. Without it this
   * flag reads its own first-run user as a returning visitor: completeOnboarding() stamps
   * completedAt at the loader, two steps before the account wall, so the remount after /auth sees
   * it already set. Every paywall exit then took the returning branch and /start was unreachable.
   */
  const resumingFirstRun = params.firstRun === '1';
  const [enteredWithCompletedOnboarding] = useState(
    () => !resumingFirstRun && Boolean(useApp.getState().profile.completedAt),
  );

  /**
   * Where onboarding hands off when it is finished with someone.
   *
   * ONE function, because there were four exits and three of them disagreed. "Maybe later" and a
   * completed purchase both went straight to '/home', so even a paying new user skipped the guided
   * first action. The rule is the same for all of them: a user who has not done the first run gets
   * it, and everyone else goes to the tabs.
   */
  const leaveOnboarding = () => {
    router.replace(useApp.getState().profile.firstRunDoneAt ? '/(tabs)/home' : ('/start' as never));
  };

  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  /**
   * THE HAND-OFF INTO THE ATLAS TOUR.
   *
   * Arming is not showing. It is fired at the two places onboarding COMPLETES, and the overlay
   * that reads it lives on the tab layout, so the tour cannot collide with anything still ahead of
   * the user here: the account wall, the paywall, and `/start`'s first-lesson offer all sit between
   * this moment and the tabs, and every one of them is a different screen.
   *
   * Arming at completion rather than at the final `router.replace` is deliberate. Someone who kills
   * the app on the paywall is still a learner who finished onboarding, and index.tsx sends them
   * straight to Home on the next launch, where the tour is waiting for them. Pinning it to one exit
   * route would have dropped exactly that person.
   *
   * It can only ever move `unseen` to `armed` (see nextAtlasTourState), so a user who has already
   * been walked around the app and later replays onboarding does not get a second tour.
   */
  const armAtlasTour = useApp((s) => s.armAtlasTour);

  const def = STEPS[renderStep];
  const liveDef = STEPS[step];

  /*
   * EVERY VISIT TO DOUBLE IT STARTS CLEAN. Its state lives up here (see tryCtl) and so survived
   * Back: the sim (wave 2, 2026-09-22) showed Back from horizon and forward again landing on the old
   * amber "Not yet." bar with the stepper locked. Keyed on `step`, not `renderStep`, so the reset
   * lands during the 150ms cross-fade while the try body is not yet drawn, never as a visible jump.
   */
  const tryLive = liveDef?.kind === 'try';
  const resetTry = tryCtl.reset;
  useEffect(() => {
    if (tryLive) resetTry();
  }, [tryLive, resetTry]);

  /*
   * THE RATE CHIPS MUST CLEAR THE CHECK BAR. They mount on the verdict, the same render the bar
   * grows from a Check button into the green panel, so the ScrollView's viewport shrinks by the
   * bar's height just as its content grows by the chips'. Nothing scrolled, and the chips sat with
   * their bottom edge clipped flush against the bar (sim wave 2, 04-tryit-correct: chip 41pt of its
   * 44pt visible, 0pt gap). Scrolling to the end brings the whole chip row up with the content's
   * paddingBottom as clearance on every screen height. Reduce Motion: the same end state, no glide.
   */
  const reducedMotion = useReducedMotion();
  const tryResolved = tryPhase === 'correct' || tryPhase === 'revealed';
  useEffect(() => {
    // `tryLive` as well, not just the phase (review, 2026-09-22). tryPhase stays 'correct' for the
    // rest of onboarding once the step is solved, so with only `tryResolved` in the deps, changing
    // Reduce Motion in Settings mid-flow re-ran this and scrolled whatever screen was up, the
    // paywall included. It only ever means anything while the try step is the live one.
    if (!tryResolved || !tryLive) return;
    // One frame so the chips and the taller bar are laid out before measuring the end.
    const id = requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: !reducedMotion }));
    return () => cancelAnimationFrame(id);
  }, [tryResolved, tryLive, reducedMotion]);

  // Derived, not stored: a store getter returning a fresh array would give zustand an
  // unstable snapshot and loop renders (see you.tsx:43).
  // Detailed picks carry the reason each course was chosen, so the reveal can show its working.
  const picks = useMemo(() => recommendPathDetailed(profile), [profile]);
  const path = useMemo(() => picks.map((x) => x.course), [picks]);
  const perDay = lessonsPerDay(profile.dailyMinutes);
  const weeks = estimateWeeks(profile, path);
  const tierLabel = profile.experience === 'experienced' ? 'advanced' : profile.experience === 'basics' ? 'intermediate' : 'beginner';

  /** Single-select write. Every remaining single-select field is a string, so no coercion. */
  const answer = (field: keyof Profile, value: string) => {
    setProfile({ [field]: value } as Partial<Profile>);
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
    Keyboard.dismiss();
    if (step === REVEAL_INDEX) {
      // last chance to stamp completion if the loader was skipped (reduced motion)
      if (!profile.completedAt) completeOnboarding();
      armAtlasTour();
      /*
       * THE ACCOUNT WALL, and its position is the whole point.
       *
       * Account creation used to be the step AFTER the paywall, which made it the last thing
       * between a new user and the app — and therefore the easiest thing to walk away from. It
       * was also unenforced: the entry redirect only tested `completedAt`, so finishing the flow,
       * never signing up, and relaunching landed you in Home with no account behind you.
       *
       * It now sits between the reveal and the paywall: you answer the questions, you SEE the
       * three-course path you earned, and then you make an account to keep it. Asked for directly
       * — "they have to create an account and stuff before, not after the premium stuff" — and it
       * also puts the ask at the one moment the user has just been shown what they get.
       *
       * `?next=paywall` is what brings them back here rather than dropping them in the app: auth
       * returns to `/onboarding?step=paywall`, a named param that already works in production
       * (see startStep). Callers that do not pass it — the entry gate, the You page — keep their
       * existing destinations untouched.
       *
       * The redirect is not the enforcement. A user who kills the app on the auth screen is
       * caught by the tab-layout gate, which is the thing that actually cannot be walked around.
       */
      if (!hasAccount(profile)) {
        router.replace('/auth?next=paywall' as never);
        return;
      }
      goTo(step + 1);
      return;
    }
    if (step < TOTAL - 1) goTo(step + 1);
    // Someone who arrived here from the You page upsell is mid-app - return them where they came
    // from. Everyone else has just cleared the account wall two steps back, so the paywall is now
    // the LAST step and it hands off to the app rather than to /auth.
    // `canGoBack` guarded, as everywhere else in this file (see the BackChevron handler): a user
    // who reached this screen from /auth got here by REPLACE, so there is nothing beneath it and a
    // bare router.back() is a silent no-op. That is what "no response when we tapped the button"
    // looked like to App Review, and it would strand a user on the last step of onboarding.
    else if (enteredWithCompletedOnboarding && router.canGoBack()) router.back();
    else leaveOnboarding();
  };

  /** Dismissing the first-run offer still has to finish account setup. A returning user who opened
   * the paywall from inside the app goes back to Home instead. */
  /*
   * "Maybe later". It used to send a first-time user to /auth, because /auth was the step after
   * this one and skipping the purchase must never skip the sign-up. The account wall now sits
   * BEFORE the paywall, so anyone standing here has already made an account and sending them back
   * to /auth would ask them to sign in twice — the second time for no reason.
   *
   * Declining to pay is not declining to have an account, so this hands off to the app exactly
   * like the CTA does. The tab gate still refuses anyone who somehow arrived without one.
   */
  const dismissPaywall = () => {
    /*
     * A RETURNING VISITOR GOES BACK, NOT HOME.
     *
     * Nine screens push to this paywall — learn, three points inside a lesson, four chat surfaces,
     * digest, options, stock, you, settings. `router.replace('/home')` threw all of that away, so
     * someone who hit a Pro wall mid-lesson and tapped "Maybe later" lost the lesson. The back
     * chevron on this very screen already returned them correctly, which made the two controls
     * disagree about what leaving means.
     *
     * Same canGoBack guard the rest of this file uses: a bare back() is a silent no-op when /auth
     * reached this screen by replace, and replace('/home') stays as the floor for that case.
     */
    if (enteredWithCompletedOnboarding) {
      if (router.canGoBack()) router.back();
      else router.replace('/home');
      return;
    }
    leaveOnboarding();
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
   *      The banner deep-links to `?step=paywall`, which starts at PAYWALL_INDEX (the last step).
   *      Walking the index back put a returning user one step before it — the middle of a flow they
   *      finished weeks ago. The index is written as a name here on purpose: this comment carried a
   *      hard-coded 14 and went stale the moment a step was removed.
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
  /*
   * A QUESTION YOU CAN SEE IS A QUESTION YOU CAN GO BACK TO.
   *
   * This used to key entirely off `entryStep`, which is correct for the TAIL of the flow and
   * wrong for the questions. Arrive at a question step by any route that is not "I walked here" —
   * a deep link, a notification, a resumed session, the QA harness — and entryStep freezes there,
   * so a learner looking at question five could not reach question four. Reported twice from the
   * simulator, and the honest reading is that the reason it happened does not matter: the arrow
   * was missing on a screen that plainly had somewhere to go.
   *
   * So the questionnaire always steps back, whatever the entry. `step - 1` is always a real step
   * below REVEAL_INDEX, and the answers are persisted, so the previous question renders with its
   * existing choice ready to change.
   *
   * The tail keeps the old rule on purpose. `?step=paywall` is a real entry point (the Unlock
   * Premium banner uses it), and someone who arrives at the paywall that way must not be able to
   * reverse into a questionnaire they already finished.
   */
  const inQuestionnaire = step > 0 && step < REVEAL_INDEX;
  const back = () => {
    if (step > entryStep || inQuestionnaire) {
      goTo(step - 1);
      return;
    }
    if (router.canGoBack()) router.back();
  };
  /** Whether there is anywhere to go back TO. Drives whether a chevron is drawn at all. */
  const hasBack = inQuestionnaire || step > entryStep || router.canGoBack();

  /**
   * Commit-on-tap for single-select steps.
   *
   * Onboarding is 16 steps, 7 of them single-select, and every one of those used to cost two
   * taps: pick, then Continue. That is 8 taps that carry no information — the pick already IS
   * the answer. YNAB (screen 239304, the one Finance onboarding match in ScreensDesign) commits
   * on the card tap with no Continue at all.
   *
   * Two guards, both load-bearing:
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
  const trialDay = useApp(trialDayNumber);

  /*
   * ── THE TRIAL IS APPLE'S NOW, NOT A COUNTER IN AsyncStorage (2.1(b), build 24) ───────────────
   *
   * App Review rejected build 24 with "there was no response when we chose Annual or Monthly and
   * tapped Start my 3-day free trial", and they were describing this screen exactly. Whenever a
   * trial was on offer the CTA's `onPress` was `next`, not `buyPro` — so the plan cards set state
   * nothing read, no purchase sheet could ever open, and `next` at the last step fell through to a
   * `router.back()` that is a no-op after /auth replaces the stack. A dead button on a screen
   * showing prices.
   *
   * Three things changed, and they are one decision:
   *   1. The CTA always buys. A purchase surface that does not purchase is the whole finding.
   *   2. The trial is an Apple INTRODUCTORY OFFER on both products, so StoreKit grants it: the
   *      sheet says "3 days free, then <price>", it survives a reinstall, and someone who already
   *      used it is charged rather than handed a second one. The `activeDays` counter in
   *      entitlement.ts still runs the in-app soft gate; it is no longer what the paywall sells.
   *   3. Every number here is READ FROM StoreKit. `PRICING` was a hardcoded USD pair, so a
   *      reviewer in any other storefront was shown a price Apple would not charge.
   *
   * `offers` is null until the read lands and `offersFailed` records a read that came back with
   * nothing. Between them the CTA can never be live-looking and inert, which is the state that got
   * us rejected: it is either a working Buy button or a disabled one with its reason on screen.
   */
  const [offers, setOffers] = useState<{ annual: PlanOffer | null; monthly: PlanOffer | null } | null>(null);
  const [offersFailed, setOffersFailed] = useState(false);
  /*
   * Bumped by the retry control to re-run the read below. `offersFailed` cannot do that job: it is
   * not in the effect's guard, and adding it there would make the effect re-run the instant it was
   * set, which is a spin rather than a retry.
   */
  const [offerAttempt, setOfferAttempt] = useState(0);
  const retryOffers = () => {
    setOffersFailed(false);
    setOfferAttempt((n) => n + 1);
  };
  useEffect(() => {
    if (step !== PAYWALL_INDEX || !IAP_ENABLED || offers) return;
    let live = true;
    void getPackages().then((pkgs) => {
      if (!live) return;
      // Empty means the offering exists with no products attached, or the SDK could not reach
      // RevenueCat. Both are "cannot sell right now", and both must say so rather than spin.
      if (pkgs.length === 0) {
        setOffersFailed(true);
        return;
      }
      setOffers({ annual: readPlanOffer(pkgs, 'annual'), monthly: readPlanOffer(pkgs, 'monthly') });
    }).catch(() => {
      /*
       * A REJECTION MUST LAND SOMEWHERE, or the CTA spins forever.
       *
       * `getPackages` catches its own `getOfferings` failure, but it calls `configurePurchases()`
       * outside that try, so a throw from the SDK setup rejected this promise instead. With no
       * catch here neither `offers` nor `offersFailed` was ever set, `offersLoading` stayed true,
       * and the reason line is suppressed while it is — a live-looking button that does nothing and
       * explains nothing, which is the 2.1(b) state build 24 was rejected for.
       *
       * `configurePurchases` is now guarded too; this stays as the belt to that braces, because
       * this screen is the one Apple actually reviews.
       */
      if (live) setOffersFailed(true);
    });
    return () => {
      live = false;
    };
  }, [step, offers, offerAttempt]);

  const annualOffer = offers?.annual ?? null;
  const monthlyOffer = offers?.monthly ?? null;
  const selectedOffer = plan === 'annual' ? annualOffer : monthlyOffer;
  /** Only Apple may say a trial is on offer, so this is the single source for every trial word on
   *  the screen — heading, badge, "No payment due now", CTA label and renewal terms alike. */
  const storeTrialDays = isProNow ? null : (selectedOffer?.freeTrialDays ?? null);
  const offersTrial = storeTrialDays !== null;
  /** What the copy should say. Falls back to the entitlement engine's length only for the local
   *  soft gate's own "day X of Y" line, never for anything describing a purchase. */
  const trialLen = storeTrialDays ?? TRIAL_DAYS;
  /** A purchase can only be attempted with a real package in hand. */
  const canBuy = IAP_ENABLED && selectedOffer !== null;
  /** Still waiting on the store, as opposed to having been told there is nothing to sell. */
  const offersLoading = IAP_ENABLED && !offers && !offersFailed;

  const annualPrice = annualOffer?.priceString ?? PRICING.annual;
  const monthlyPrice = monthlyOffer?.priceString ?? PRICING.monthly;
  const selectedPrice = plan === 'annual' ? annualPrice : monthlyPrice;
  const annualPerMonth = annualOffer?.perMonthString ?? PRICING.annualPerMonth;
  /** Derived from the prices Apple will really charge, so the badge cannot outlive a price change
   *  made in App Store Connect. The written-out arithmetic above `PRICING` still governs the
   *  fallback pair. */
  const savingPct = (() => {
    const a = annualOffer?.price;
    const m = monthlyOffer?.price;
    if (!a || !m) return PRICING.savingPct;
    return Math.max(0, Math.round((1 - a / (m * 12)) * 100));
  })();

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
  /*
   * FUNNEL INSTRUMENTATION. See Ev.onboardingStep for why this did not exist.
   *
   * A Set rather than a high-water mark: someone who goes back to change an answer has still only
   * SEEN that step once, and counting the revisit would inflate the earlier step against the later
   * one and invent a drop-off that never happened.
   *
   * Keyed on `step` and not `renderStep`, so it counts the step the user is actually on rather
   * than the one still cross-fading out.
   */
  const stepSeenRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (stepSeenRef.current.has(step)) return;
    stepSeenRef.current.add(step);
    const d = STEPS[step];
    const field = d && 'field' in d ? String(d.field) : undefined;
    track(Ev.onboardingStep, {
      index: step,
      total: TOTAL,
      kind: d?.kind ?? 'unknown',
      ...(field ? { field } : {}),
    });
  }, [step]);

  const paywallSeenRef = useRef(false);
  useEffect(() => {
    if (step !== PAYWALL_INDEX || paywallSeenRef.current) return;
    paywallSeenRef.current = true;
    track(Ev.paywallSeen, { surface: 'onboarding', tier: tierNow, offers_trial: offersTrial, is_pro: isProNow });
    /*
     * The same moment, written down where it survives the process.
     *
     * The ref above is an analytics latch and dies with the app, so it cannot tell the entry
     * redirect on the NEXT launch whether this user was ever shown the offer. Without that, a
     * force-quit here relaunched into Home with the paywall skipped for good.
     *
     * Stamped on ARRIVAL rather than on exit, deliberately: the question this answers is "has this
     * person been shown the offer", and they have been. Stamping on exit would re-present the
     * paywall to someone who force-quits on it repeatedly, which is nagging, not selling.
     */
    if (!useApp.getState().profile.onboardingPaywallSeenAt) {
      setProfile({ onboardingPaywallSeenAt: Date.now() });
    }
  }, [step, tierNow, offersTrial, isProNow, setProfile]);
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
   * BUY. The ONLY thing the paywall CTA does now, trial or no trial.
   *
   * It used to be reachable only once the local trial was spent, which is what left a fresh
   * reviewer tapping a button wired to `next`. Whether the sheet opens on "3 days free, then
   * $79.99" or straight on "$79.99" is Apple's call, made from the introductory offer on the
   * product — not a branch in this file.
   *
   * It buys `selectedOffer.pkg`, the package this screen already read and priced. Nothing is
   * looked up by array position: RevenueCat returns packages in dashboard order, so [0]/[1] would
   * silently swap the plans the day someone reorders them, which is a wrong charge.
   */
  const buyPro = () => {
    if (!IAP_ENABLED) {
      Alert.alert('Euphoria Pro', IAP_DISABLED_REASON);
      return;
    }
    const pkg = selectedOffer?.pkg;
    if (!pkg) {
      // The silent App Store Connect misconfiguration, said out loud rather than shown as a
      // spinner that never resolves.
      Alert.alert('Euphoria Pro', 'That plan is not available from the App Store right now.');
      return;
    }
    setBusy(true);
    void purchase(pkg).then((r) => {
      setBusy(false);
      // Paying is not a reason to skip the guided first action; it was '/home' unconditionally.
      if (r.ok && r.isPro) { if (enteredWithCompletedOnboarding) router.replace('/home'); else leaveOnboarding(); }
      else if (!r.ok && r.kind === 'error') Alert.alert('Purchase failed', purchaseErrorMessage(r.code));
      // 'cancelled' is deliberately silent — backing out of the Apple sheet is not an error.
    });
  };

  /*
   * THE UNDER-13 PICK LIVES HERE, NOT IN THE PERSISTED PROFILE.
   *
   * The AGE FLOOR block above states that "nothing is persisted" when someone answers Under 13.
   * That was not true: the onChange handler called `answer()` before its early return, so
   * `profile.ageBand` was set to 'under-13' and `profile` is inside the store's partialize. The
   * property the comment describes is the whole reason the option is offered rather than omitted,
   * so the code is moved to match the documentation rather than the other way round.
   *
   * Component state, so it is gone on relaunch and never written to disk. The gate still renders
   * from it and the radio still fills, because both read this in preference to the store.
   */
  const [underAgePick, setUnderAgePick] = useState(false);


  /** True only on the age step with the under-13 band chosen — see AGE_FLOOR above. */
  const underAge = liveDef?.kind === 'single' && liveDef.field === 'ageBand' && underAgePick;

  const canContinue = (() => {
    if (underAge) return false;
    if (!liveDef) return true;
    if (liveDef.kind === 'name') return nameDraft.trim().length > 0;
    if (liveDef.kind === 'single') return selected(liveDef.field) !== null;
    if (liveDef.kind === 'multi') return ((profile[liveDef.field] as string[]) ?? []).length > 0;
    return true;
  })();

  /**
   * Is there anything for a Continue button to DO on this step?
   *
   * Single-select steps already commit on the card tap (advanceAfterPick, ~40 lines up), so the
   * button under them was doing nothing a tap had not already done — you pick an option, the
   * screen moves, and a Continue button sits there having never been the thing that moved it.
   * Reported directly: "every time I click the option, it also automatically continues".
   *
   * So the button is drawn only where a tap CANNOT decide the step for you:
   *   name       — free text; nothing to tap
   *   multi      — topics and blockers take several answers, so only you know when you're done
   *   statement  — nothing to pick at all; the button IS the interaction
   *   avatar     — a pick here is cosmetic and never advances (see AvatarStep)
   *   reveal     — the payoff screen, read at your own pace
   *   paywall    — a purchase must always be deliberate
   *
   * The under-13 case keeps the footer (the fine print below renders regardless) but the button
   * goes with every other single step — it was already disabled there, so nothing is lost.
   */
  const autoAdvances = liveDef?.kind === 'single';
  const showAction = !autoAdvances;

  const tryBeat = tryPhase === 'scrub' ? ATLAS_BEATS.idle : ATLAS_BEATS[tryPhase];
  const face: AtlasExpression =
    !def ? 'happy'
      : def.kind === 'try' ? tryBeat.face
      : def.kind === 'reveal' ? 'proud'
        : def.kind === 'paywall' ? 'happy'
          : def.kind === 'loader' ? 'thinking'
            : def.kind === 'name' ? 'happy'
            : def.kind === 'avatar' ? 'happy'
              : def.face;

  const bodyStyle = useAnimatedStyle(() => ({ opacity: bodyOpacity.get() }));

  /*
   * ATLAS'S LINE, computed for every step (atlas-lines.ts, pinned by onboarding-atlas-guide-pin) but
   * DRAWN on three: the try step's verdict, the reveal and the paywall. Owner decision 2
   * (2026-09-22) had him react on every screen; on 2026-09-30 the owner cut that: the reaction
   * bubble stacked over the question bubble read as two text boxes, and the lines carried nothing.
   * The bubble alone (showAtlas={false}) under the AtlasStage, so Atlas is drawn once per screen
   * (CONSTITUTION 5.6). On the try step the line follows the verdict once there is one.
   */
  const guideLine = !def
    ? null
    : def.kind === 'try' && tryPhase !== 'idle' && tryPhase !== 'scrub' && tryBeat.line
      ? tryBeat.line
      : atlasLineFor(stepKeyOf(def), { ...profile, tryResult: tryResult ?? undefined });
  const guide = <AtlasGuide line={guideLine} showAtlas={false} delay={CHILD_BASE} />;

  /*
   * A screen under 720pt has no slack to give. Same threshold StatementStep uses to decide whether
   * it can centre a statement's evidence, reused rather than reinvented so the two cannot drift.
   */
  const { height: windowH, fontScale } = useWindowDimensions();
  const proofTight = windowH < 720;

  /*
   * ── THE PURCHASE SCREEN FITS, OR IT IS BROKEN (CONSTITUTION 5.3) ────────────────────────────
   *
   * Measured on the simulator 2026-09-22, all against the screen as it was BEFORE this change: an
   * iPhone 17 Pro fitted at the default type size with 58pt to spare, put Restore under the home
   * indicator at Extra Large and SCROLLED from XXXL upward (sim wave 2, 05-paywall-*), and a
   * 375x667 SE scrolled at the DEFAULT size with the CTA cut off at the fold (measured here, on a
   * booted SE simulator). Nothing capped the type, and the heading in particular grew until it
   * owned the whole screen at AX5.
   *
   * Two halves, and both are needed. PAYWALL_MAX_FONT_SCALE states how far this screen scales at
   * all. `paywallTight` takes the padding out of the benefit rows, the plan cards and the footer
   * whenever the room is not there: a short phone, or type above the default anywhere. It is keyed
   * on the live fontScale rather than on the device, so a 17 Pro at XXXL compacts exactly like an
   * SE does, which is the case that was scrolling.
   */
  const paywallTight = windowH < 760 || fontScale > 1.05;
  /*
   * ...AND THE OTHER WAY (CONSTITUTION 5.2: grow the components rather than leave slack). A tall
   * phone at the default size fits the regular screen with a band of empty space under the legal
   * links, so once the MEASURED spare covers PAYWALL_ROOMY_COST the rows, cards and section margins
   * each step one token up. Measured rather than keyed on the device, so it can never push the
   * screen into a scroll (5.3): if roomy ever overflows it drops back, and stays back.
   */
  const [paywallRoomyOn, setPaywallRoomyOn] = useState(false);
  const paywallRoomy = paywallRoomyOn && !paywallTight;
  /* `content` is where the footer ENDS, not the scroll content's size: the content container is
     flexGrow 1, so its reported height is never less than the viewport and would hide the slack. */
  const paywallFit = useRef({ viewport: 0, content: 0, blocked: false });
  const fitPaywall = () => {
    const f = paywallFit.current;
    if (renderStep !== PAYWALL_INDEX || paywallTight || f.blocked || !f.viewport || !f.content) return;
    if (paywallRoomyOn) {
      if (f.content > f.viewport + 0.5) {
        f.blocked = true;
        setPaywallRoomyOn(false);
      }
    } else if (f.viewport - f.content >= PAYWALL_ROOMY_COST) setPaywallRoomyOn(true);
  };

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
              value={
                def.field === 'ageBand' && underAgePick ? UNDER_AGE : selected(def.field)
              }
              onChange={(k) => {
                /*
                 * UNDER 13 MUST NOT ADVANCE, AND MUST NOT BE WRITTEN DOWN. Single-select steps
                 * auto-advance on pick, so guarding only `canContinue` left the gate wide open —
                 * the Continue button was disabled while the screen had already moved past it.
                 * Found by tapping it on the simulator; the static pin passed the whole time.
                 *
                 * The return now sits BEFORE `answer()` rather than after it. Below it, the store
                 * never learns the age of a child the app has just refused, which is the property
                 * the AGE FLOOR block promises and the reason the option is on the list at all.
                 */
                if (def.field === 'ageBand' && k === UNDER_AGE) {
                  setUnderAgePick(true);
                  return;
                }
                // Any other band clears the refusal, so re-picking releases the gate.
                if (def.field === 'ageBand') setUnderAgePick(false);
                answer(def.field, k);
                advanceAfterPick();
              }}
            />
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
              /*
               * THE PROOF BLOCK TIGHTENS ON A SHORT SCREEN.
               *
               * Measured on a 375x667 SE: the three cards ran to y=604 against a Continue pinned at
               * y=589, so the last one sat 15pt under the button on a screen that does not scroll.
               * That underlap predates the statement layout work and was confirmed by an A/B on the
               * device producing byte-identical frames, so it is this block's own size rather than
               * anything the centring did.
               *
               * The header and the button are fixed costs, so the ~40pt reclaimed here is what the
               * short screen was short by. The 720pt threshold is the one StatementStep already
               * uses to decide whether it has room to centre, reused rather than reinvented.
               */
              <View style={{ gap: proofTight ? Spacing.two : Spacing.two + 4, marginTop: proofTight ? Spacing.two : Spacing.four }}>
                {PROOF.map((p, i) => (
                  <RiseIn key={p.title} delay={childDelay(i)}>
                    <Card style={styles.proofCard}>
                      <View style={[styles.proofIcon, proofTight && styles.proofIconTight, { backgroundColor: theme.primary + '1F' }]}>
                        <PixelSpriteView sprite={p.icon} size={proofTight ? 18 : 20} />
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
      case 'try':
        return <DoubleItStep ctl={tryCtl} atlas={guide} />;
      case 'loader':
        return (
          <PathAssemblyLoader
            picks={picks}
            lines={LOADER_LINES}
            options={{ riskComfort: RISK, topics: TOPICS, blockers: BLOCKERS, horizon: HORIZONS, goal: GOALS, experience: LEVELS }}
            onDone={() => {
              completeOnboarding();
              // Onboarding is finished HERE, whatever the user does with the paywall next. See
              // armAtlasTour above for why this is the arming point rather than the exit route.
              armAtlasTour();
              goTo(REVEAL_INDEX);
            }}
          />
        );
      case 'reveal':
        return <PlanRevealStep tierLabel={tierLabel} picks={picks} perDay={perDay} weeks={weeks} />;
      default:
        return (
          <View style={styles.paywallBody}>
            {/*
              * NOT StepHeading. Every question step's heading is `display` (32pt) with no ceiling,
              * and on this screen that is what pushed the CTA past the fold: at XXXL it took two
              * lines with the CTA already cut off below, and at AX5 "You're on day 1 of 3" filled
              * the screen on its own (sim wave 2, 05-paywall-AX5-scrolls.png). A purchase headline
              * earns its size from weight, not from points, so it is one step down and capped like
              * everything else here.
              *
              * The trial headline is also shorter: it read "Start your 3-day FREE trial to
              * continue", which is the CTA's own sentence one line below it (CONSTITUTION 5.1).
              * It now states what you get; the button says what to do.
              */}
            <ThemedText
              type="display"
              maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE}
              numberOfLines={2}
              style={[styles.paywallHeading, paywallTight && styles.paywallHeadingTight, paywallRoomy && styles.paywallHeadingRoomy]}>
              {isProNow
                ? "You're on Euphoria Pro"
                : spent
                  ? `Your free ${TRIAL_DAYS} days are up`
                  : offersTrial
                    ? `Your first ${trialLen} days are free`
                    : `You're on day ${trialDay} of ${TRIAL_DAYS}`}
            </ThemedText>
            {/* The body stays top-packed, and the action follows it in the same scroll stack so no
                flex spacer can separate Monthly from the purchase action. */}
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
              <View style={{ marginTop: paywallTight ? Spacing.one : Spacing.three }}>
                {PRO_STEPS.map((s, i) => (
                  <RiseIn key={s.title} delay={childDelay(i)}>
                    <TrialStep icon={s.icon} title={s.title} sub={s.sub} tone={s.tone} last={i === PRO_STEPS.length - 1} />
                  </RiseIn>
                ))}
              </View>
            ) : (
              <RiseIn delay={childDelay(0)} style={{ marginTop: Spacing.one }}>
                <PremiumBenefits tight={paywallTight} roomy={paywallRoomy} />
              </RiseIn>
            )}
            <RiseIn delay={childDelay(TRIAL_STEPS.length)} style={{ marginTop: paywallTight ? 0 : paywallRoomy ? Spacing.three : Spacing.two }}>
              {/* The plan NAME carries the billing period and the price carries the amount you
                  are actually charged. Both cards used to headline a "/mo" figure, so the annual
                  plan read as a second, cheaper monthly plan rather than as a yearly one. */}
              <PlanCard
                selected={plan === 'annual'}
                onPress={() => setPlan('annual')}
                badge={annualOffer?.freeTrialDays ? `${annualOffer.freeTrialDays} DAYS FREE · SAVE ${savingPct}%` : `SAVE ${savingPct}%`}
                title="Annual"
                sub={`Works out at ${annualPerMonth} a month`}
                price={annualPrice}
                unit="per year"
                tight={paywallTight}
                roomy={paywallRoomy}
              />
              <View style={styles.monthlyPlan}>
                {/*
                  * THE SUB STAYS, AND IT BUYS NOTHING TO DROP IT (review, 2026-09-22). It was
                  * taken out to make the no-scroll budget, on the stated grounds that it cost 20pt.
                  * It costs 0. PlanCard's row is `alignItems: 'center'`, so the card is as tall as
                  * its TALLEST column, and that is the price column, not the title column:
                  * price 24 + unit 1 + 18 = 43pt against title 22 + sub 2 + 18 = 42pt. Remove the
                  * sub and the card still measures 43pt (and 55.6 against 54 at the 1.3 cap).
                  * With nothing saved, what is left is CONSTITUTION 5.2, "if sibling rows have a
                  * subtitle, all of them do": Annual carries one, so Monthly carries one.
                  */}
                <PlanCard
                  selected={plan === 'monthly'}
                  onPress={() => setPlan('monthly')}
                  title="Monthly"
                  sub="Billed every month"
                  price={monthlyPrice}
                  unit="per month"
                  tight={paywallTight}
                  roomy={paywallRoomy}
                />
              </View>
            </RiseIn>
          </View>
        );
    }
  };

  const isLoader = liveDef?.kind === 'loader';
  // The tail steps must FILL the scroll viewport rather than sit at its top: both are
  // content-light next to a pinned CTA, so top-packing strands the leftover height as a dead
  // band above the button. The flex chain is opened up only for them; every question step keeps
  // its existing top-packed layout untouched.
  //
  // ── EXTENDED TO THE STATEMENT STEPS, 2026-09-15 ───────────────────────────────────────────
  // The reveal was the only step that ever got this, and the statement steps have exactly the
  // same shape and exactly the same defect. Measured on an iPhone 17 (402x874):
  //
  //   step 4  chart statement   content ended y=585   Continue y=762   ->  177pt of nothing
  //   step 8  proof statement   content ended y=627   Continue y=762   ->  135pt of nothing
  //   step 15 reveal            content ended y=743   Continue y=762   ->   19pt, correct
  //
  // The third line is the proof: this exact flag is the difference between the two outcomes.
  // A question step is deliberately NOT included. Its options are a list you read from the top
  // down, and stretching that list to the bottom of the screen would space the taps apart for no
  // reason. Statements and the reveal are compositions; questions are lists.
  //
  // ── EXTENDED TO THE LOADER, 2026-09-20 ───────────────────────────────────────────────────
  // The loader is the most content-light screen in the flow AND the only one with no footer at
  // all (`isLoader` suppresses it), so top-packing stranded more height here than anywhere else:
  // a ring, a title and one line ending around the halfway mark with nothing below them.
  //
  // It qualifies on the rule already written above. A ring with a status line under it is a
  // composition, not a list — there are no taps to space apart by centring it.
  const fillsViewport = renderStep === REVEAL_INDEX || def?.kind === 'statement' || def?.kind === 'loader';

  const actionFooter = (
    <View
      style={[styles.footer, step === PAYWALL_INDEX && styles.paywallFooter]}
      onLayout={step === PAYWALL_INDEX ? (e) => { const l = e.nativeEvent.layout; paywallFit.current.content = l.y + l.height; fitPaywall(); } : undefined}>
      {step === PAYWALL_INDEX && offersTrial && (
        <View style={[styles.noPay, paywallTight && styles.noPayTight]}>
          <UIcon name="check" size={16} color={theme.primary} />
          <ThemedText type="bodyMedium" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} numberOfLines={1}>No payment due now</ThemedText>
        </View>
      )}
      {showAction && <SlabButton
        label={
          step === REVEAL_INDEX
            ? 'Start learning'
            : step === PAYWALL_INDEX
              ? isProNow
                ? 'Back to learning'
                : offersTrial
                  ? `Start my ${trialLen}-day free trial`
                  : `Get Euphoria Pro · ${selectedPrice}`
              : 'Continue'
        }
        full
        {...(step === PAYWALL_INDEX && !isProNow ? { tone: 'premium' as const } : {})}
        /* Waiting on the store is a LOADING button, never a live one that does nothing. The whole
           rejection was a button that looked ready and was not. */
        loading={busy || (step === PAYWALL_INDEX && !isProNow && offersLoading)}
        disabled={!canContinue || busy || (step === PAYWALL_INDEX && !isProNow && !canBuy)}
        /* One branch, and it buys. The trial is Apple's introductory offer on the product, so
           there is no longer a "start the trial" path that skips the purchase sheet. */
        onPress={
          step === PAYWALL_INDEX
            ? isProNow
              ? () => router.replace('/home')
              : buyPro
            : next
        }
      />}
      {underAge && (
        <ThemedText type="small" themeColor="mutedForeground" style={styles.fine}>
          {`Euphoria is built for ages ${String(AGE_FLOOR)} and up. Come back when you get there. We'll be here.`}
        </ThemedText>
      )}
      {/* A control that explains itself is not a dead control (§0.5). This used to render only for
          a missing key AND only when no trial was on offer, so the two states that actually reached
          App Review — offering loaded empty, and the trial branch — showed nothing at all. */}
      {step === PAYWALL_INDEX && !isProNow && !canBuy && !offersLoading && (
        <>
          <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} style={styles.fine}>
            {IAP_ENABLED
              ? 'Subscriptions are not available from the App Store right now.'
              : IAP_DISABLED_REASON}
          </ThemedText>
          {/*
            * The copy used to end "Please try again in a moment" with nothing on screen that could
            * try again, and nothing behind it that would: the offer read is a one-shot effect keyed
            * on `step`, and the paywall is the last step, so no navigation could re-trigger it. An
            * instruction the app cannot honour is not much better than a dead control — so either
            * the sentence goes or the button arrives, and the button is the one worth having when
            * the failure is usually a flaky network.
            */}
          {IAP_ENABLED ? (
            <SpringPressable haptic={false} onPress={retryOffers} accessibilityRole="button" accessibilityLabel="Try again">
              <ThemedText type="small" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} style={[styles.fine, { color: theme.iconLilac }]}>Try again</ThemedText>
            </SpringPressable>
          ) : null}
        </>
      )}
      {step === PAYWALL_INDEX && (
        <>
          {/* THE RENEWAL TERMS. App Store Review 3.1.2 wants them on the purchase screen, so this
              line is never the thing that gets cut to make room: it is capped like everything else
              and the padding around it gives way instead. */}
          <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} style={styles.fine}>
            {offersTrial ? `${trialLen} days free, then ` : ''}
            {plan === 'annual'
              ? `${annualPrice} per year, billed annually`
              : `${monthlyPrice} per month`}
            . Renews until cancelled. Cancel anytime in the App Store.
          </ThemedText>
          {/*
            * THE 44pt DISMISS, BOUGHT UPWARDS (CONSTITUTION 5.10, measured 2026-09-22 on a booted
            * iPhone 17 Pro via the accessibility frames, not by eye): this row was 766..792, a
            * 26pt target, and 805.7..833.4 at the largest Dynamic Type, 27.7pt. Both are well
            * under the 44pt floor, and the way out of the paywall should not be the hardest thing
            * on it to hit.
            *
            * `hitSlop`, not `minHeight`, and UPWARDS only. Height cannot be bought here: the
            * lowest required element already sits at 857 of 874 at AX5 (sim wave 3,
            * 30-paywall-AX5), so growing this row by 18pt would push the legal links off the
            * screen and break the no-scroll rule (5.3) to satisfy 5.10. Above the row is the
            * renewal-terms line, which is plain text and takes no taps, so 18pt of upward slop
            * collides with nothing. DOWNWARDS would: `legalRowTight` sets paddingTop 0 and each
            * legal link already carries `hitSlop` top 13, and the legal row renders after this,
            * so a tap in the shared band would open Terms instead of dismissing.
            *
            * 26 + 18 = 44 at the default size, 45.7 at AX5. Pinned by scripts/paywall-layout-pin.mjs.
            */}
          <SpringPressable
            haptic={false}
            onPress={dismissPaywall}
            /* NO tight variant here: maybeLaterTight cut paddingTop to 4, and 4 + lineHeight 18 +
               hitSlop 18 is a 40pt target, under the 44pt floor in CONSTITUTION 5.10. The 4pt it
               saved is not needed: measured on the simulator 2026-09-22 the paywall still ends well
               clear of the bottom at Extra Large and at accessibility-medium. */
            style={styles.maybeLater}
            hitSlop={{ top: 18 }}
            accessibilityRole="button"
            accessibilityLabel="Maybe later">
            <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} numberOfLines={1}>Maybe later</ThemedText>
          </SpringPressable>
          {/* THE LINKS' SLOP REACHES DOWN, NEVER UP. They used to carry top 13, and the legal row
              renders after the dismiss, so the lower half of "Maybe later" was Privacy's hit box:
              the owner reported taps on Maybe later opening the privacy policy (2026-09-30). The
              44pt target is bought below the row instead, into the footer's bottom padding. */}
          <View style={[styles.legalRow, paywallTight && styles.legalRowTight]}>
            <SpringPressable
              haptic={false}
              onPress={() => openLegal(LEGAL.terms)}
              style={styles.legalAction}
              hitSlop={{ top: 4, bottom: 22 }}
              accessibilityRole="link"
              accessibilityLabel="Terms">
              <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} numberOfLines={1} style={styles.legalLink}>Terms</ThemedText>
            </SpringPressable>
            <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} style={styles.legalDot}>·</ThemedText>
            <SpringPressable
              haptic={false}
              onPress={() => openLegal(LEGAL.privacy)}
              style={styles.legalAction}
              hitSlop={{ top: 4, bottom: 22 }}
              accessibilityRole="link"
              accessibilityLabel="Privacy">
              <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} numberOfLines={1} style={styles.legalLink}>Privacy</ThemedText>
            </SpringPressable>
            <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} style={styles.legalDot}>·</ThemedText>
            <SpringPressable
              haptic={false}
              onPress={restore}
              style={styles.legalAction}
              hitSlop={{ top: 4, bottom: 22 }}
              accessibilityRole="button"
              accessibilityLabel="Restore purchases">
              <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={PAYWALL_MAX_FONT_SCALE} numberOfLines={1} style={styles.legalLink}>Restore</ThemedText>
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
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.header}>
        <ProgressHeader step={step} total={TOTAL} onBack={hasBack ? back : undefined} />
      </View>

      {renderStep === PAYWALL_INDEX ? (
        <View style={styles.paywallGuide}>
          <AtlasGuide line={guideLine} variant="compact" expression={face} />
        </View>
      ) : (
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
        size={def?.kind === 'try' ? TRY_ATLAS : ATLAS_SIZE}
      />
      )}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, renderStep === PAYWALL_INDEX && styles.paywallContent]}
        onLayout={(e) => { paywallFit.current.viewport = e.nativeEvent.layout.height; fitPaywall(); }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled">
        <Animated.View style={[bodyStyle, fillsViewport && styles.grow]}>
          {/* keyed on renderStep so RiseIn's `entering` re-fires for every step */}
          {/*
            * STALE CONTENT MUST NOT TAKE TAPS.
            *
            * `renderStep` lags `step` by the 150ms cross-fade, so for that window the OUTGOING
            * step is still mounted and still hit-testable — it is only at opacity 0. A second tap
            * landing there ran against a `step` that had already advanced, so advanceAfterPick's
            * `from === stepRef.current` guard compared n+1 to n+1, passed, and called next() a
            * second time. The next question flashed past unanswered.
            *
            * The guard is fine for its own case (two taps BEFORE the advance) and cannot see this
            * one, because by then nothing is stale about the step — only about what is on screen.
            * So the fix belongs here: while what is drawn is not what is current, it takes no
            * input at all.
            */}
          <View
            key={renderStep}
            pointerEvents={renderStep === step ? 'auto' : 'none'}
            style={fillsViewport ? styles.grow : undefined}>
            {/* NO GUIDE BUBBLE AT THE HEAD OF A STEP (owner, 2026-09-30: "the double text boxes
                are annoying and Atlas's lines don't even matter"). A question step used to stack
                Atlas's reaction bubble over the question bubble, two boxes with two tails, and the
                reaction said nothing the learner needed. The line survives only where it carries
                information: the try step's verdict (its own slot), the paywall's compact row, and
                the reveal, where it sits UNDER the body so the beam runs from node 1 into Atlas. */}
            {body()}
            {def?.kind === 'reveal' ? guide : null}
          </View>
        </Animated.View>
        {renderStep === PAYWALL_INDEX && !isLoader ? actionFooter : null}
      </ScrollView>

      {/* the loader drives itself — offering a button there would let users outrun it */}
      {/* The try step's Check bar takes the footer's place: Check, then the verdict, then Continue. */}
      {!isLoader && renderStep !== PAYWALL_INDEX
        ? def?.kind === 'try' ? <DoubleItCheckBar ctl={tryCtl} onContinue={next} /> : actionFooter
        : null}
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Full-bleed. Holds the ambient background so it reaches past the safe-area insets. */
  screen: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  /* paddingBottom: the 9-option topics list ends exactly at the ScrollView's clip, so the last
     visible card rests sliced in half and reads as broken rather than scrollable. Trailing space
     lets the list settle past the fold instead of on it. */
  content: { padding: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.six, flexGrow: 1, justifyContent: 'flex-start' },
  paywallContent: { paddingTop: 0, paddingBottom: 0 },
  paywallGuide: { paddingHorizontal: Spacing.four },
  proofCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  proofIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  proofIconTight: { width: 34, height: 34 },
  /** Opens the flex chain so a child can claim the leftover viewport height. */
  grow: { flexGrow: 1 },
  nameInput: { marginTop: Spacing.four, minHeight: 52, borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.three, fontSize: FontSize.bodyLg, fontFamily: Fonts.body },
  avatarHero: { alignItems: 'center', marginTop: Spacing.three },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.three },
  avatarTile: { width: 62, height: 62, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  /** Content-sized so no flexible spacer can separate Monthly from the purchase action. Spare height
      is spent by growing the components (paywallRoomy), never by spreading gaps (CONSTITUTION 5.2). */
  paywallBody: { gap: Spacing.one, paddingBottom: Spacing.two + Spacing.one },
  /* One step under `display` (32pt) and left-aligned like every other heading in the flow. 26pt
     bold still outweighs everything else on the screen, which is what rule 5.4 asks of it. */
  paywallHeading: { fontSize: FontSize.titleLg, lineHeight: 32, marginTop: Spacing.two },
  paywallHeadingTight: { fontSize: FontSize.titleSm, lineHeight: 27, marginTop: 0 },
  paywallHeadingRoomy: { marginTop: Spacing.three },
  monthlyPlan: { marginTop: Spacing.one },
  noPay: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.one, paddingBottom: Spacing.two },
  fine: { textAlign: "center", fontSize: FontSize.label, lineHeight: 15, paddingTop: Spacing.one, paddingHorizontal: Spacing.two },
  footer: { padding: Spacing.three, paddingTop: Spacing.one },
  /* Padding is what gives way first on a short screen: the words above it are required content
     (renewal terms, legal row), so they are never what gets trimmed to make the screen fit. */
  noPayTight: { paddingBottom: Spacing.one },
  legalRowTight: { paddingTop: 0 },
  paywallFooter: { paddingTop: 0, paddingBottom: Spacing.two },
  maybeLater: { alignItems: "center", paddingTop: Spacing.two },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: Spacing.one },
  legalAction: { minWidth: 44, alignItems: 'center' },
  legalLink: { fontSize: FontSize.label, textDecorationLine: 'underline', opacity: 0.75 },
  legalDot: { fontSize: FontSize.label, opacity: 0.75 },
});
