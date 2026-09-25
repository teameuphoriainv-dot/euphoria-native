/**
 * League — the weekly leaderboard.
 *
 * TWO DIFFERENT NUMBERS, ON PURPOSE. The header tier comes from LIFETIME xp, because a tier is
 * earned and kept. The standings rank on WEEKLY xp, because a rank is defended and reset. Do not
 * "fix" one to match the other: making standings lifetime-based means whoever studied hardest a
 * year ago outranks everyone permanently and nobody can ever catch up, which is the opposite of
 * what a weekly league is for.
 *
 * The tier name and crest come from src/lib/league.ts so this screen and the You tab can never
 * disagree. They previously did: You said "Saver" while this said "Diamond League".
 *
 * The field comes from src/lib/people.ts, which is FABRICATED and shared with the friends
 * directory so the two features cannot invent contradictory populations. Nothing user-facing may
 * describe those people as real.
 */
import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { LeagueCrest } from '@/components/league-crest';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { tierForXp } from '@/lib/league';
import { PixelSpriteView, bolt, coin as coinSprite, star } from '@/lib/pixel';
import { ITEM_ART } from '@/lib/item-art';
import { avatarFor } from '@/lib/avatars';
import { labelFor } from '@/lib/league-week';
import { daysLeft, PROMOTE } from '@/lib/league-standings';
import { PEOPLE } from '@/lib/people';
import { useApp } from '@/lib/store';
import { Spring, STAGGER_CAP } from '@/shared/motion/tokens';

const DEMOTE = 7; // rank 8+ (index >= 7) demote

function commas(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


function Zone({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.zone}>
      <View style={[styles.zoneLine, { backgroundColor: color }]} />
      <ThemedText type="label" style={{ color }}>{label}</ThemedText>
      <View style={[styles.zoneLine, { backgroundColor: color }]} />
    </View>
  );
}

/** The League/Friends underline slides between tabs (Spring.smooth, no overshoot -- navigation). */
function TabIndicator({ index, width, color }: { index: number; width: number; color: string }) {
  const reduced = useReducedMotion();
  const x = useSharedValue(index * width);
  useEffect(() => {
    x.set(reduced ? index * width : withSpring(index * width, Spring.smooth));
  }, [index, width, reduced, x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  if (!width) return null;
  return <Animated.View pointerEvents="none" style={[styles.tabIndicator, { width, backgroundColor: color }, style]} />;
}

export default function League() {
  const [tabsW, setTabsW] = useState(0);
  const theme = useTheme();
  const xp = useApp((s) => s.xp);
  const weekly = useApp((s) => s.weeklyXpNow());
  // Resolved on Home, shown here. Null until a week has actually finished — which is not the same
  // as never having played, so it must not render an empty "you finished #0" state.
  const lastWeek = useApp((s) => s.lastWeekOutcome);
  const tier = tierForXp(xp);
  // Standings use WEEKLY xp; the header tier above uses lifetime. See the note at the top.
  const [tab, setTab] = useState<'league' | 'friends'>('league');
  // NOT useApp((s) => s.friendIds()): that getter builds a fresh array per call, so zustand sees a
  // new snapshot every render and loops until "Maximum update depth exceeded". Select the stored
  // arrays, which are reference-stable, and derive. Same trap documented at you.tsx and store.ts.
  const following = useApp((s) => s.following);
  const followers = useApp((s) => s.followers);
  const friendIds = useMemo(() => following.filter((id) => followers.includes(id)), [following, followers]);
  // Duolingo splits the same board into Leagues and Friends. Friends ranks only mutual follows,
  // so promotion and demotion zones are hidden there: you cannot be relegated out of your own
  // friend group, and drawing the lines would imply otherwise.
  const field = tab === 'friends' ? PEOPLE.filter((p) => friendIds.includes(p.id)) : PEOPLE;
  /*
   * YOUR mark in the standings is the badge you EQUIPPED, which is the first place the shop shows
   * up outside the shop. Buying the whale and then seeing it beside your name in the league is the
   * whole point of a cosmetic; falling back to `star` keeps the row filled before you own one.
   */
  const chosen = avatarFor(useApp((st) => st.avatarId));
  const equippedBadge = useApp((st) => st.equipped.badge);
  // Your CHOSEN avatar first, then a badge you bought, then a default. Atlas is `null` here and
  // falls through to the badge, because the mascot at 22pt in a 36pt ring is unreadable.
  const myAvatar = chosen?.sprite ?? (equippedBadge ? ITEM_ART[equippedBadge] : undefined) ?? star;
  const players = [
    ...field.map((p) => ({ name: p.name, xp: p.weeklyXp, color: p.color, avatar: p.avatar, me: false })),
    { name: 'You', xp: weekly, color: '#A451E6', avatar: myAvatar, me: true },
  ].sort((a, b) => b.xp - a.xp);
  const zoned = tab === 'league';
  // Never zero: a divide-by-zero here would make every bar NaN% wide, which React Native renders
  // as full width — every player would look tied with the leader.
  const leader = Math.max(1, ...players.map((p) => p.xp));
  const medal = (i: number) =>
    i === 0 ? theme.iconGold : i === 1 ? theme.textSecondary : i === 2 ? theme.warning : theme.mutedForeground;

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.back} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
      </View>

      {/*
        The crest is the SUBJECT now. It was rendered at 30pt beside the title, which made the one
        piece of authored art on this screen smaller than the avatars beneath it — the screen read
        as a generic ranked list that happened to have a badge, rather than as a place you are
        trying to climb out of.
      */}
      <RiseIn>
        <View style={styles.crestBlock}>
          <LeagueCrest tier={tier} size={84} />
          {/*
            * NOT reproduced on device, and the reason is worth recording: this account sits in
            * "Saver", which is short enough to fit at AX5, so a device check here returns a
            * FALSE PASS. The tier list runs to "Unstoppable" and "Impressive" — at 3.12x a 24pt
            * title is ~75pt, so "Unstoppable" needs roughly 410pt against the ~350pt this block
            * actually has. The defect is in the data the user has not reached yet.
            *
            * Unlike the header and lesson card this is a full-width vertical block, so it needs
            * no layout change; capping the growth and allowing a second line is enough.
            */}
          <ThemedText type="title" maxFontSizeMultiplier={2} style={{ fontSize: FontSize.title }} numberOfLines={2}>{tier.name}</ThemedText>
          <View style={[styles.timePill, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <PixelSpriteView sprite={bolt} size={14} />
            <ThemedText type="small" themeColor="textSecondary">Top {PROMOTE} advance · {daysLeft()}</ThemedText>
          </View>
          {/*
            COPY: owner SELECTED this option; the wording is mine — delegated, not owner-authored
            (§0.7). The standings come from `lib/people.ts`, which is fabricated and whose header
            forbids presenting its names as real people. Promotion and demotion against invented
            rivals, with nothing saying so, is the same claim the friends note was making.
          */}
          <ThemedText type="small" themeColor="mutedForeground" style={styles.practiceNote}>
            A practice league. Real rivals arrive when accounts do.
          </ThemedText>
        </View>
      </RiseIn>

      {/*
        * LAST WEEK'S RESULT. Until this existed the promotion zone was decoration: the line was
        * drawn, the week ended, and the app never once said what happened. A ladder you can climb
        * but are never told you climbed is not a ladder.
        */}
      {lastWeek && (
        <RiseIn delay={40}>
          <View style={[styles.lastWeek, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText type="label" themeColor="mutedForeground">LAST WEEK</ThemedText>
              <ThemedText type="bodyMedium">
                {`${commas(lastWeek.xp)} XP · ${labelFor(lastWeek.result)}`}
              </ThemedText>
            </View>
            {lastWeek.coins > 0 && (
              <View style={styles.lastWeekPay}>
                <PixelSpriteView sprite={coinSprite} size={15} />
                <ThemedText type="smallBold" style={{ color: theme.iconGold }}>
                  {`+${String(lastWeek.coins)}`}
                </ThemedText>
              </View>
            )}
          </View>
        </RiseIn>
      )}

      <View style={styles.tabs} onLayout={(e) => setTabsW(e.nativeEvent.layout.width)}>
        <TabIndicator index={tab === 'league' ? 0 : 1} width={Math.max(0, tabsW - Spacing.three * 2) / 2} color={theme.primary} />
        {(['league', 'friends'] as const).map((t) => (
          <SpringPressable key={t} haptic={false} onPress={() => setTab(t)} style={{ flex: 1 }}>
            <View style={[styles.tab, { borderBottomColor: 'transparent' }]}>
              <ThemedText type="smallBold" themeColor={tab === t ? 'text' : 'mutedForeground'}>
                {t === 'league' ? 'League' : 'Friends'}
              </ThemedText>
            </View>
          </SpringPressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'friends' && friendIds.length === 0 && (
          <ThemedText type="small" themeColor="mutedForeground" style={styles.friendsEmpty}>
            No friends yet. Follow practice profiles here. Mutual friends arrive when real accounts do.
          </ThemedText>
        )}
        {/* Keyed by tab so a League/Friends switch re-cascades every row -- rows present in both
            lists (you) used to stay put while the rest changed, so the switch read as nothing. */}
        {players.map((p, i) => (
          <View key={`${tab}:${p.name}`}>
            {/*
              * The BOUNDARY is correct — PROMOTE is 3, this renders before index 3, so the rule
              * falls between rank 3 and rank 4 and the top three above it advance, matching the
              * "Top 3 advance" pill exactly. Verified against the code, not assumed.
              *
              * THE LABEL IS WHAT IS AMBIGUOUS. "Promotion zone" is a noun phrase naming a REGION,
              * drawn as a divider between two regions with nothing saying which one it means. A
              * green rule reading PROMOTION ZONE sitting directly above rank 4 reads just as easily
              * as "the zone starts here", which is exactly inverted, and a user cannot check it
              * against anything on this screen.
              *
              * Fixed by TINTING the rows the label refers to rather than by rewording it: the
              * grouping then survives without anyone having to parse a divider, and it needs no new
              * copy (§0.7). Same trick the demotion end gets, in the opposite colour.
              */}
            {zoned && i === PROMOTE && <Zone label="Promotion zone" color={theme.success} />}
            {zoned && i === DEMOTE && <Zone label="Demotion zone" color={theme.destructive} />}
            <RiseIn delay={Math.min(i * 40, STAGGER_CAP)}>
              <View
                style={[
                  styles.row,
                  {
                    // `me` still wins: knowing where YOU are beats knowing which band a row is in.
                    backgroundColor: p.me ? theme.primary + '22' : theme.card,
                    borderColor: p.me
                      ? theme.primary
                      : zoned && i < PROMOTE
                        ? theme.success + '55'
                        : zoned && i >= DEMOTE
                          ? theme.destructive + '55'
                          : theme.border,
                    borderWidth: p.me ? 1.5 : zoned && (i < PROMOTE || i >= DEMOTE) ? 1 : StyleSheet.hairlineWidth,
                  },
                ]}>
                <ThemedText
                  type="heading"
                  style={{ width: 24, fontSize: FontSize.body, fontVariant: ['tabular-nums'], color: medal(i) }}>
                  {i + 1}
                </ThemedText>
                {/*
                  The person's colour stays a RING, and their mark inside it is now a sprite rather
                  than the first letter of an invented name. Nine lettered circles read as a
                  contacts list, which is the one thing on this screen that did not look like the
                  rest of the app. The ring still carries their colour, so the row is identifiable
                  twice over.
                */}
                <View style={[styles.avatar, { backgroundColor: theme.cardElevated, borderColor: p.color }]}>
                  <PixelSpriteView sprite={p.avatar} size={22} />
                </View>
                <View style={styles.who}>
                  <ThemedText type="bodyMedium" numberOfLines={1}>{p.me ? 'You' : p.name}</ThemedText>
                  {/*
                    Relative to the LEADER, so the list reads as a race rather than a table of
                    numbers. This is the whole point of a league: the gap is the information, and
                    a column of right-aligned figures hides it.
                  */}
                  <View style={[styles.track, { backgroundColor: theme.muted }]}>
                    <View
                      style={[
                        styles.fill,
                        { backgroundColor: p.me ? theme.primary : theme.iconViolet, width: `${Math.max(4, Math.round((p.xp / leader) * 100))}%` },
                      ]}
                    />
                  </View>
                </View>
                <ThemedText
                  type="smallBold"
                  style={{ fontVariant: ['tabular-nums'], color: p.me ? theme.text : theme.textSecondary }}>
                  {commas(p.xp)}
                </ThemedText>
              </View>
            </RiseIn>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Starts inside `tabs`' horizontal padding, so it lines up under the tab labels.
  tabIndicator: { position: 'absolute', left: Spacing.three, bottom: 0, height: 2, borderRadius: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.two + 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2, borderRadius: Radius.lg },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  practiceNote: { marginTop: Spacing.two, textAlign: 'center' },
  crestBlock: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.one, paddingBottom: Spacing.three },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth },
  who: { flex: 1, gap: 5 },
  track: { height: 4, borderRadius: Radius.hairline, overflow: 'hidden' },
  fill: { height: 4, borderRadius: Radius.hairline },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.three, marginTop: Spacing.two },
  tab: { alignItems: 'center', paddingVertical: Spacing.two, borderBottomWidth: 2 },
  friendsEmpty: { textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  lastWeek: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  lastWeekPay: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  zone: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  zoneLine: { flex: 1, height: 1 },
});
