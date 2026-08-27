/**
 * You — the profile hub, built around the league tier you hold.
 *
 * Rewritten to lead with the league because a named tier you are climbing is the retention loop
 * both reference apps are built on, and because the previous version was a settings screen with
 * an avatar on top.
 *
 * IT ALSO USED TO LIE. `84 + lessons` inflated the lesson count by 84 lessons the user had never
 * done, `Rank: '#3'` was hardcoded, and so was the name. Every number on this page now traces to
 * real store state: xp, streak, completedLessons, level() and levelProgress(). If you add a stat
 * here and cannot point at the field behind it, it does not belong on the page.
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ITEM_ART } from '@/lib/item-art';
import { achievementById, isEarned, type AchievementState } from '@/lib/achievements';
import { useApp } from '@/lib/store';

import { AmbientBackground } from '@/components/ambient-background';
import { ProfileAvatar } from '@/components/profile-avatar';
import { PixelSpriteView, lock, seedling, trophy } from '@/lib/pixel';
import { StatMark, type StatMarkName } from '@/components/art/stat-mark';
import { LeagueCrest } from '@/components/league-crest';
import { ThemedText } from '@/components/themed-text';
import { UIcon, type UIconName } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TRIAL_DAYS, trialDayNumber, useTier } from '@/lib/entitlement';
import { TIERS, tierProgress } from '@/lib/league';
import { money } from '@/lib/stocks';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP } from '@/shared/motion/tokens';

/**
 * ONE GLYPH WAS DOING TWELVE JOBS, and that is why this screen read as templated.
 *
 * `sparkle` was the icon for Games, Ask Atlas, Euphoria Pro, the trial plan, lesson milestones,
 * Digest, chat, and three onboarding rows — twelve unrelated concepts sharing the single most
 * template-default mark there is. C2 set the rule for the opposite mistake (two padlocks for one
 * idea); this is the same failure inverted, and it is worse, because an icon that means everything
 * means nothing and the eye stops reading it.
 *
 * Reassigned from the existing 24-mark `ui-icon` set — no new glyph, per C2's grep-before-adding
 * rule: Games -> `target`, Ask Atlas -> `chat` (it IS a chat), Euphoria Pro -> `trophy`, which is
 * already what the plan card uses for pro, so the two surfaces now agree.
 *
 * Rows carry an EXPLICIT route. They used to derive one from the label via
 * `label.toLowerCase().split(' ')[0]`, which turned "Euphoria Pro" into `euphoria` - not a key in
 * settings/[section].tsx's TITLES - so the app's only upsell dead-ended on a screen reading
 * "Settings settings are coming soon". Deriving navigation from display copy means renaming a
 * label silently moves where it goes.
 *
 * `?step=paywall` is matched by NAME in onboarding.tsx, not by index, and is the one step param
 * that works outside dev.
 */
type Row = { icon: UIconName; label: string; accent?: boolean; route: string };

/**
 * TWO GROUPS, NOT ONE LIST.
 *
 * Reported 2026-08-22 (N11): "Tab is scope-confused: right now it reads like Settings (account,
 * notifications, plan status, preferences, log out) but also holds Friends and Games, which are
 * gamified/social features and feel out of place here."
 *
 * He is describing a real thing: this was ONE undifferentiated list of seven, so Friends sat in the
 * same visual container as Notifications and the eye had no way to tell a place-you-go from a
 * setting-you-change. Splitting them costs nothing and says what the tab is: your stuff first, then
 * the machinery.
 *
 * The web app resolves the same tension by promoting Games and Shop to top-level tabs and having no
 * You tab at all. The owner chose to fix these individually rather than restructure navigation, so
 * this groups rather than moves — and N12 is answered on Home instead, where there is now room.
 */
const PLAY_ROWS: Row[] = [
  /*
   * "I do not see a profile pathway anywhere."
   *
   * The editor was reachable ONLY by tapping the avatar image at the top of this screen — no
   * chevron, no label, nothing that reads as a control. Combined with Home's greeting tap, that
   * made the whole chain two invisible hops: invisible greeting -> /you, invisible avatar ->
   * /avatar. The avatar tap stays as a shortcut; this row is the part you can actually find.
   */
  { icon: 'sparkle', label: 'Avatar & banner', route: '/avatar' },
  { icon: 'trophy', label: 'Achievements', route: '/achievements' },
  { icon: 'you', label: 'Friends', route: '/friends' },
  { icon: 'target', label: 'Games', route: '/games' },
  { icon: 'chat', label: 'Ask Atlas', route: '/chat' },
];

const SETTINGS_ROWS: Row[] = [
  { icon: 'you', label: 'Account', route: '/settings/account' },
  { icon: 'bell', label: 'Notifications', route: '/settings/notifications' },
  { icon: 'trophy', label: 'Euphoria Pro', accent: true, route: '/onboarding?step=paywall' },
  { icon: 'settings', label: 'Preferences', route: '/settings/preferences' },
];

/** Counters that change need fixed-width digits, or the number jitters sideways as it climbs. */
/** Profile theme tints, keyed by item id. Values are the theme's own name on web. */
const THEME_TINT: Record<string, string> = {
  theme_neon: '#22D3EE',
  theme_midnight: '#3B82F6',
  theme_gold: '#F0A72B',
};

const NUM = { fontVariant: ['tabular-nums' as const] };

export default function You() {
  const theme = useTheme();
  const router = useRouter();
  const xp = useApp((s) => s.xp);
  const streak = useApp((s) => s.streak);
  const bestStreak = useApp((s) => s.bestStreak ?? 0);
  const level = useApp((s) => s.level());
  // ponytail: levelProgress() returns a fresh object → unstable zustand snapshot → infinite render
  // loop. Read it non-reactively; the selected `xp` above already re-renders on change.
  const lp = useApp.getState().levelProgress();

  /* Equipped cosmetics (N21). Read here rather than inside the card so the card stays presentational. */
  const equipped = useApp((s) => s.equipped);
  /* The title only renders while it is still EARNED. Reading the predicate rather than trusting
   * the stored id means a reset, or a threshold that moves, cannot leave a stale claim on screen. */
  const titleId = useApp((s) => s.titleId);
  const titleAch = achievementById(titleId);
  const titleState: AchievementState = {
    xp: useApp((x) => x.xp),
    bestStreak: useApp((x) => x.bestStreak),
    completedLessons: useApp((x) => x.completedLessons),
    readPosts: useApp((x) => x.readPosts),
    inventory: useApp((x) => x.inventory),
    positions: useApp((x) => x.positions),
    derivativeTrades: useApp((x) => x.derivativeTrades),
    coins: useApp((x) => x.coins),
    following: useApp((x) => x.following),
    followers: useApp((x) => x.followers),
    watchlist: useApp((x) => x.watchlist),
  };
  const wornTitle = titleAch && isEarned(titleAch, titleState) ? titleAch.title : null;
  /* Was a ternary enumerating exactly two badges, so any badge added later equipped to an
   * invisible profile. Shared map now — see src/lib/item-art.ts. */
  const badgeSprite = equipped.badge ? ITEM_ART[equipped.badge] : undefined;
  const cardTint = equipped.theme ? (THEME_TINT[equipped.theme] ?? undefined) : undefined;
  const lessons = useApp((s) => s.completedLessons.length);
  const guides = useApp((s) => s.readPosts.length);
  // Was in the store and invisible on every screen until now.
  const rewardsEarned = useApp((s) => s.rewardsEarned);
  // Plan status. 5/5 of the reference set puts account state in this surface, so it leads the page.
  const planTier = useTier();
  const trialDay = useApp(trialDayNumber);
  const atlasLeft = useApp((st) => st.atlasLeft());
  /*
   * Safe to show again: §22 C26 resolved the split. store.derivativesLeft() and
   * entitled('options') now agree, because the three-contract cap was reframed as a DATA limit
   * that binds Pro equally rather than a trial restriction. options.tsx gates on access, so a
   * trial user genuinely has these.
   */
  const optionsLeft = useApp((st) => st.derivativesLeft());
  const name = useApp((s) => s.profile.name);
  const handle = useApp((s) => s.profile.handle);

  const { tier, next, progress, xpToNext } = tierProgress(xp);
  const fresh = xp === 0 && lessons === 0 && streak === 0;

  // Accent = that icon's own dominant fill from EUPHORIA_ICONS. Four different hues is what stops
  // the grid reading as one tile repeated, which is what the uniform violet chip used to do.
  /**
   * Five tiles, each with a DESTINATION. They were four INERT tiles — a stat you cannot act on is a
   * dead end, and `rewardsEarned` sat in the store invisible on every screen.
   *
   * Marks come from art/stat-mark.tsx, not EUPHORIA_ICONS, because that registry was doing double
   * duty here: `crown` is amber-and-gold multicolour drawn for a league moment and `post` is a
   * generic document, so the grid read as four unrelated illustrations instead of one set.
   */
  const STATS: { icon: StatMarkName; label: string; value: string; accent: string; route: string }[] = [
    /*
      * BEST BESIDE CURRENT. Audit finding (FINDINGS.md, YOU, 2/2): Impulse 142130 shows CURRENT
      * STREAK and BEST STREAK side by side, and Euphoria showed only current. A personal best is the
      * one number that survives a broken streak, which makes it the reason to start again rather
      * than only the record of having stopped.
      *
      * Suppressed while they are equal — on a rising streak "best 5" beside "5" is noise, and it
      * would read as a second stat rather than a record. It appears exactly when it means something:
      * after a break, when the current number is lower than the one to beat.
      */
    {
      icon: 'streak',
      label: bestStreak > streak ? `Day streak · best ${String(bestStreak)}` : 'Day streak',
      value: String(streak),
      accent: theme.streak,
      route: '/(tabs)/learn',
    },
    { icon: 'lessons', label: 'Lessons', value: String(lessons), accent: '#BB83F1', route: '/(tabs)/learn' },
    { icon: 'xp', label: 'XP', value: xp.toLocaleString(), accent: '#FBBF24', route: '/league' },
    { icon: 'guides', label: 'Guides read', value: String(guides), accent: '#38BDF8', route: '/(tabs)/digest' },
    { icon: 'earned', label: 'Earned', value: money(rewardsEarned), accent: '#34D399', route: '/(tabs)/trade' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={45} />

      {/*
        * A WAY OUT. Reported by the owner: "after I click my profile I can't get out of it."
        *
        * This screen had NO router.back() anywhere. The Stack runs headerShown:false, so the only
        * exits were the iOS edge-swipe — undiscoverable, and unreliable when a ScrollView is under
        * the finger — or the Log out button, which is not a way back, it is a way out of the
        * account. A dead end.
        *
        * It was survivable while /you was reachable from one easily-missed greeting tap. Putting a
        * profile button on all five tabs turned a rarely-visited dead end into a ONE-TAP TRAP, so
        * this is a defect my own navigation change promoted, not one I merely found.
        *
        * I hit it myself while testing and worked around it with an edge-swipe instead of
        * recognising it. Working around your own product is the signal, not the fix.
        *
        * Matches avatar.tsx: chevron, top-left, 22pt with hitSlop 10 for a ~52pt target.
        */}
      <View style={styles.backRow}>
        <SpringPressable
          haptic={false}
          scaleTo={0.85}
          onPress={() => { router.back(); }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/*
          * IDENTITY LEADS THE PAGE. Moved here from third, and it is an evidence correction.
          *
          * ScreensDesign, counted in pixels across the four profile screens pulled for this tab:
          * Duolingo `112804`, TradingView `185370`, Elevate `111769`, Quizlet `147612` — **4/4
          * open with WHO YOU ARE**, and TradingView is the exact shape used here: an identity card
          * carrying the plan badge, then the subscription card directly beneath it. Euphoria had
          * the person in third place, under the plan card and the league hero, so the screen
          * introduced an offer before it introduced a user.
          *
          * The docblock's "5/5 puts account state in this surface" is still true and unchanged —
          * that was about the surface, never about the order.
          *
          * Name and handle come from sign-up; both fall back rather than inventing anything.
          */}
        <RiseIn>
          {/* An equipped profile theme tints the identity card — the one surface on iOS that is
              recognisably "your profile". THEME_TINT is keyed by the item's own metadata value. */}
          <Card style={styles.identity} tint={cardTint}>
            {/* Atlas wearing whatever is equipped (N21). See profile-avatar.tsx for why the
                hats go on the mascot rather than on an invented player character. */}
            {/* Tapping your own face is where every game puts this, so it is where it goes. */}
            <SpringPressable
              haptic={false}
              scaleTo={0.93}
              onPress={() => router.push('/avatar')}
              accessibilityRole="button"
              accessibilityLabel="Change your avatar">
              <ProfileAvatar size={62} />
            </SpringPressable>
            <View style={{ flex: 1 }}>
              {/* Name and plan on ONE line, which is TradingView `185370` exactly: `juliascreens`
                  with an `ESSENTIAL` chip beside it. The badge is what makes an identity card also
                  answer "what am I paying for" at a glance; the card below owns the detail. */}
              <View style={styles.identityTop}>
                {/*
                  * AX5 CLIPPED THIS TO "Y..". Captured on device. The row pits a flexShrink
                  * name against the plan chip, and the chip's label was uncapped too — at
                  * 3.12x "FREE TRIAL" alone claimed most of the row, so the identity this card
                  * exists to state was the thing that got dropped.
                  *
                  * Both sides are capped: the name loosely enough to stay prominent, the chip
                  * tightly because it is compact status chrome, not content. Two lines let the
                  * name wrap rather than vanish.
                  */}
                <ThemedText type="bodyMedium" maxFontSizeMultiplier={1.6} numberOfLines={2} style={{ flexShrink: 1 }}>
                  {name ?? 'Your profile'}
                </ThemedText>
                {/* An equipped badge sits with the plan chip: both are status, both are compact,
                    and putting the badge anywhere else would give it a row of its own for one glyph. */}
                {badgeSprite ? <PixelSpriteView sprite={badgeSprite} size={18} /> : null}
                <View
                  style={[
                    styles.planChip,
                    {
                      backgroundColor: (planTier === 'pro' ? theme.iconGold : theme.primary) + '24',
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    maxFontSizeMultiplier={1.4}
                    style={{ fontSize: FontSize.tiny, color: planTier === 'pro' ? theme.iconGold : theme.iconLilac }}
                  >
                    {planTier === 'pro' ? 'PRO' : planTier === 'expired' ? 'FREE' : 'FREE TRIAL'}
                  </ThemedText>
                </View>
              </View>
              {/* The worn TITLE sits directly under the name, which is where a title goes. It is
                  rendered from the achievement rather than from stored copy, so a title you no
                  longer qualify for simply stops appearing instead of persisting a claim. */}
              {wornTitle ? (
                <View style={[styles.titleChip, { borderColor: theme.primary + '55', backgroundColor: theme.primary + '18' }]}>
                  {/* iconLilac, NOT primary. Measured 4.08:1 for primary on this chip's own
                      composited background — below the 4.5 AA minimum, and 11pt semibold does not
                      qualify as large text. digest.tsx already found and fixed exactly this
                      (its comment records primary at 4.49 vs iconLilac at 8.29); the fix simply
                      never reached this chip. */}
                  <ThemedText type="label" style={{ color: theme.iconLilac }}>{wornTitle}</ThemedText>
                </View>
              ) : null}
              <ThemedText type="small" themeColor="mutedForeground" style={NUM}>
                {handle ? `@${handle} · ` : ''}Level {level}
              </ThemedText>
              {/*
                * NO SECOND PROGRESS BAR HERE, and this is measured rather than aesthetic.
                * A level spans XP_PER_LEVEL = 500. The first league tier, Saver -> Investor,
                * spans minXp 0 -> 500. So for the whole of tier 1 the level bar and the league
                * bar in the hero above are the IDENTICAL measurement — both read "390 XP to …"
                * at xp 110 — stacked about 40pt apart with no visual distinction. They only
                * diverge at tier 3, whose span is 1000.
                *
                * The hero owns the bar because the page's headline is the tier. Level stays as a
                * number, which is the part the bar was not already saying.
                */}
              <ThemedText type="small" themeColor="mutedForeground" style={NUM}>
                {xp.toLocaleString()} XP total · {lp.toNext.toLocaleString()} to level {level + 1}
              </ThemedText>
            </View>
          </Card>
        </RiseIn>

        {/*
          * PLAN STATUS. Leads the page because account state is 5/5 convergence across
          * Elevate / Praktika / Meetup / Kling / Loora, and because nothing on this screen used
          * to say what the user had or what was left.
          *
          * `trialDayNumber` NOT `trialDaysLeft` — on the third active day daysLeft is 0 while the
          * trial is still live, and "0 days left" on a usable day reads as already expired.
          */}
        <RiseIn delay={60}>
          <Card style={styles.plan} tint={planTier === 'pro' ? theme.iconGold : theme.primary}>
            <View style={styles.planTop}>
              {/* `seedling` for a trial, not `sparkle` — see the ROWS note above. A trial is a
                  thing that GROWS into something, which is the one metaphor in the set that is
                  actually about a beginning. */}
              <PixelSpriteView
                sprite={planTier === 'pro' ? trophy : planTier === 'expired' ? lock : seedling}
                size={20}
              />
              <ThemedText type="bodyMedium">
                {planTier === 'pro' ? 'Euphoria Pro' : planTier === 'expired' ? 'Free' : 'Free trial'}
              </ThemedText>
              <View style={{ flex: 1 }} />
              {planTier === 'trial' && (
                <ThemedText type="smallBold" style={[NUM, { color: theme.iconLilac }]}>
                  Day {trialDay} of {TRIAL_DAYS}
                </ThemedText>
              )}
            </View>
            {/*
              * The trial's position in its own span, as a PROGRESS OBJECT rather than a number the
              * reader has to hold. Elevate and Duolingo both render progress this way (3/3 in the
              * profile pull), and it is what makes the trial state prominent instead of a caption.
              * Hidden for pro and expired — neither is a span with a position in it.
              */}
            {planTier === 'trial' && (
              <ProgressBar value={Math.min(1, trialDay / TRIAL_DAYS)} height={6} />
            )}

            {planTier === 'expired' ? (
              <ThemedText type="small" themeColor="mutedForeground" style={NUM}>
                Your free days are up. Pro reopens every lesson and Atlas.
              </ThemedText>
            ) : (
              /*
               * WHY THIS IS THREE COLUMNS AND NOT ONE SENTENCE.
               *
               * It read `Every lesson open · ${atlasLeft} Atlas · ${optionsLeft} options contracts
               * left` — three different KINDS of fact (a boolean, a remaining count, a remaining
               * count) middot-joined as though they were one list, so the eye could not tell where
               * a value ended and the next label began.
               *
               * Counted across Duolingo `112804`, Elevate `111769`, TradingView `185370` and
               * Quizlet `147612`: **4/4 render every stat as its own labelled unit — value on top,
               * small grey caption beneath — and 0/4 join stats with middots.** Duolingo's
               * "Overview" cards are the exact shape. This screen's own stat grid below already
               * speaks that language, so the plan card was the only thing on the page that did not.
               *
               * Options keeps a number for BOTH tiers on purpose: C26 established the 3-contract
               * cap is a DATA limit that binds Pro equally, not a trial restriction, so printing
               * "unlimited" there would be false.
               */
              <View style={styles.grants}>
                {(planTier === 'pro'
                  ? ([
                      { label: 'Lessons', value: 'All open' },
                      { label: 'Atlas', value: 'Unlimited' },
                      { label: 'Options', value: `${optionsLeft} left` },
                    ] as const)
                  : ([
                      { label: 'Lessons', value: 'All open' },
                      { label: 'Atlas', value: `${atlasLeft} left` },
                      { label: 'Options', value: `${optionsLeft} left` },
                    ] as const)
                ).map((g, i, arr) => (
                  // The last cell right-aligns so its text ends ON the card's right padding rather
                  // than starting there and trailing off.
                  <View key={g.label} style={[styles.grant, i === arr.length - 1 && styles.grantLast]}>
                    <ThemedText type="bodyMedium" style={NUM}>{g.value}</ThemedText>
                    <ThemedText type="label" themeColor="mutedForeground">{g.label}</ThemedText>
                  </View>
                ))}
              </View>
            )}
            {planTier !== 'pro' && (
              <SpringPressable
                scaleTo={0.97}
                onPress={() => router.push('/onboarding?step=paywall')}
                accessibilityRole="button"
                accessibilityLabel="See Euphoria Pro">
                {/* Unit 4 replaces this route with the contextual gate sheet. Until then it goes
                    where every other upsell in the app already goes, rather than nowhere. */}
                <View style={[styles.planCta, { borderColor: theme.primary }]}>
                  <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>
                    See Euphoria Pro
                  </ThemedText>
                </View>
              </SpringPressable>
            )}
          </Card>
        </RiseIn>

        {/* League hero — the page's headline is the tier, not the person */}
        <RiseIn>
          {/* The crest is the tap target, so the Leaderboard row could go. */}
          <SpringPressable haptic={false} onPress={() => router.push('/league')}>
          <Card style={styles.hero} elevated tint={tier.color}>
            <LeagueCrest tier={tier} size={104} />
            <ThemedText type="label" themeColor="mutedForeground" style={styles.heroKicker}>
              YOUR LEAGUE
            </ThemedText>
            <ThemedText type="title" style={[styles.heroTitle, { color: tier.color }]}>{tier.name}</ThemedText>
            <View style={styles.heroBar}>
              <ProgressBar value={progress} height={9} />
            </View>
            <ThemedText type="small" themeColor="mutedForeground" style={NUM}>
              {next ? `${xpToNext.toLocaleString()} XP to ${next.name}` : 'Top tier reached'}
            </ThemedText>
          </Card>
          </SpringPressable>
        </RiseIn>

        {/* Stats. Real values only. */}
        <View style={styles.grid}>
          {STATS.map((s, i) => (
            <RiseIn key={s.label} delay={100 + Math.min(i * 40, STAGGER_CAP)} style={styles.gridHalf}>
              <SpringPressable
                scaleTo={0.96}
                onPress={() => router.push(s.route as Parameters<typeof router.push>[0])}
                accessibilityRole="button"
                accessibilityLabel={`${s.label}, ${s.value}`}>
                <Card style={styles.statTile} tint={s.accent}>
                {/* No chip behind it: these glyphs are already multicolour, and a uniform tinted
                    square behind each one is what made a gold crown and an orange flame look the
                    same. Brilliant places icons directly on the card for this reason. */}
                  <StatMark name={s.icon} size={34} />
                <View>
                  <ThemedText type="heading" style={[{ fontSize: FontSize.headingLg }, NUM]}>{s.value}</ThemedText>
                  <ThemedText type="small" themeColor="mutedForeground">{s.label}</ThemedText>
                  </View>
                </Card>
              </SpringPressable>
            </RiseIn>
          ))}
        </View>

        {fresh && (
          <RiseIn delay={260}>
            <ThemedText type="small" themeColor="mutedForeground" style={styles.emptyNote}>
              Finish your first lesson to start climbing.
            </ThemedText>
          </RiseIn>
        )}

        {/* The ladder. Replaces the old certificate row, whose done/not-done was hardcoded and
            tied to no achievement. These are earned. */}
        <RiseIn delay={280}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>
            League ladder
          </ThemedText>
          <Card>
            <View style={styles.ladder}>
              {TIERS.map((t, i) => (
                <RiseIn key={t.name} delay={300 + Math.min(i * 45, STAGGER_CAP)}>
                  {/* Tappable, and each rung STATES ITS THRESHOLD. A locked crest that does not
                      say what unlocks it is decoration; Duolingo's leaderboard gate names its own
                      condition ("Finish 7 lessons to start competing"), which is the pattern. */}
                  <SpringPressable
                    scaleTo={0.92}
                    haptic={false}
                    onPress={() => router.push('/league')}
                    accessibilityRole="button"
                    accessibilityLabel={
                      xp >= t.minXp
                        ? `${t.name}, reached`
                        : `${t.name}, needs ${t.minXp.toLocaleString()} XP`
                    }>
                    <View style={styles.rung}>
                      <LeagueCrest tier={t} size={38} locked={xp < t.minXp} />
                      <ThemedText
                        type="small"
                        themeColor={xp >= t.minXp ? 'text' : 'mutedForeground'}
                        numberOfLines={1}
                        style={styles.rungLabel}>
                        {t.name.split(' ')[0]}
                      </ThemedText>
                      <ThemedText
                        type="label"
                        themeColor={xp >= t.minXp ? 'textSecondary' : 'mutedForeground'}
                        numberOfLines={1}
                        style={styles.rungXp}>
                        {t.minXp === 0 ? 'START' : `${t.minXp / 1000 >= 1 ? `${t.minXp / 1000}k` : t.minXp}`}
                      </ThemedText>
                    </View>
                  </SpringPressable>
                </RiseIn>
              ))}
            </View>
          </Card>
        </RiseIn>


        {/* PLACES YOU GO, then the machinery. See the ROWS note above for why they are separated. */}
        <RiseIn delay={380}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>PLAY &amp; PEOPLE</ThemedText>
          <Card padded={false}>
            {PLAY_ROWS.map((s, i) => (
              <SpringPressable key={s.label} haptic={false} onPress={() => router.push(s.route as never)}>
                <View style={[styles.settingRow, i < PLAY_ROWS.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <UIcon name={s.icon} size={20} color={s.accent ? theme.iconLilac : theme.mutedForeground} />
                  <ThemedText type="bodyMedium" style={{ flex: 1, color: s.accent ? theme.iconLilac : theme.text }}>{s.label}</ThemedText>
                  <UIcon name="arrowRight" size={16} color={theme.mutedForeground} />
                </View>
              </SpringPressable>
            ))}
          </Card>
        </RiseIn>

        <RiseIn delay={420}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>SETTINGS</ThemedText>
          <Card padded={false}>
            {SETTINGS_ROWS.map((s, i) => (
              <SpringPressable key={s.label} haptic={false} onPress={() => router.push(s.route as never)}>
                <View style={[styles.settingRow, i < SETTINGS_ROWS.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <UIcon name={s.icon} size={20} color={s.accent ? theme.iconLilac : theme.mutedForeground} />
                  <ThemedText type="bodyMedium" style={{ flex: 1, color: s.accent ? theme.iconLilac : theme.text }}>{s.label}</ThemedText>
                  <UIcon name="arrowRight" size={16} color={theme.mutedForeground} />
                </View>
              </SpringPressable>
            ))}
          </Card>
        </RiseIn>

        <SpringPressable haptic={false} onPress={() => { void useApp.getState().signOut().finally(() => router.replace('/auth' as never)); }} style={styles.logout}>
          <ThemedText type="bodyMedium" style={{ color: theme.destructive }}>Log out</ThemedText>
        </SpringPressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleChip: {
    alignSelf: 'flex-start',
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  backRow: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.one },
  safe: { flex: 1 },
  // A single vertical rhythm for the column. The identity card and the plan card had NO margin
  // between them at all — identity carried a marginTop and plan carried nothing — so two 16pt-padded
  // cards rendered flush and read as one block. Reported 2026-08-22: "Top half is too compressed:
  // profile, free trial days left, league, and rank are all crammed together". `gap` spaces every
  // direct child of the scroller equally, so a card added later cannot reintroduce the same gap.
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  hero: { alignItems: 'center', paddingVertical: Spacing.four },
  heroKicker: { marginTop: Spacing.two, letterSpacing: 1.2 },
  heroTitle: { fontSize: FontSize.titleLg, marginTop: 2 },
  heroBar: { alignSelf: 'stretch', marginTop: Spacing.three, marginBottom: Spacing.two },
  // gap 20 not 16: Atlas renders at 62pt here and the tighter gutter let the mascot touch the name.
  // marginTop drops to 8 because `content` now owns the between-card rhythm; this only sets the
  // distance from the safe-area edge to the first card.
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three + Spacing.one, marginTop: Spacing.two },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 6, marginBottom: 4 },
  identityTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 2 },
  planChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  // 8 -> 16. This card stacks four things (title row, progress bar, grant row, CTA) and at 8pt the
  // CTA sat directly under the grant captions — the "'Free Trial' button right under" in the report.
  plan: { gap: Spacing.three },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 2 },
  // Equal thirds so the three captions sit on one baseline grid. `gap` rather than dividers:
  // TradingView's stat row (185370) separates by space alone, and a rule between three items in a
  // card that already has a border is one line too many.
  /*
   * SPACE-BETWEEN, NOT THREE EQUAL FLEX COLUMNS. With `flex: 1` each cell took a third of the row
   * and its text was left-aligned inside it, so "All open" filled its column while "0 left" and
   * "2 left" left ragged gaps — and the row visibly stopped short of the card's right edge with
   * dead space after OPTIONS.
   *
   * The header directly above already spans edge to edge ("Free trial" … "Day 1 of 3"). Sizing the
   * cells to their content and spacing between them makes this row do the same, so the first stat
   * lines up under "Free trial" and the last under the day counter. The alignment is the point:
   * these two rows are the same width and now look it.
   */
  grants: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  grant: { gap: 1 },
  grantLast: { alignItems: 'flex-end' },
  planCta: { borderWidth: 1, borderRadius: Radius.pill, paddingVertical: Spacing.one + 2, alignItems: 'center' },
  rungXp: { marginTop: 2, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  gridHalf: { width: '47%', flexGrow: 1 },
  statTile: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2 },
  emptyNote: { textAlign: 'center', marginTop: Spacing.three },
  sectionLabel: { marginTop: Spacing.two, marginBottom: Spacing.two },
  // seven rungs have to fit 402pt without horizontal scroll: space-between rather than a fixed gap
  ladder: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, alignItems: 'flex-start' },
  rung: { alignItems: 'center', gap: 4, width: 47 },
  rungLabel: { fontSize: FontSize.tiny },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three },
  logout: { alignItems: 'center', paddingVertical: Spacing.four },
});
