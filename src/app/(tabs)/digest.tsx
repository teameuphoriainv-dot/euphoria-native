/**
 * Digest — the app's daily read, rebuilt against refs/BRILLIANT_VISUAL_ANALYSIS.md.
 *
 * Three things changed from the first version, all of them for the same reason: the screen claimed
 * a daily ritual it did not actually have.
 *
 *  1. TODAY COMPLETES. Reading today's guide used to swap the card for the next unread one, so
 *     finishing never felt like finishing. It now rests on a "done for today" state. That state is
 *     DERIVED from `dailyPick` + `readPosts` — no new persisted field, nothing to add to partialize.
 *  2. IT IS A LIBRARY, NOT A QUEUE. Category chips (Brilliant's top-of-screen pattern) replace the
 *     "Next up 5 + See all" accordion. DIGEST_CATEGORIES already existed and had never been used.
 *  3. THE ART IS BIG ENOUGH TO READ. The old rows showed a flat category mark at 26px because the
 *     real hero illustrations "collapse into noise" small. Brilliant's answer to that is a bigger
 *     slot, not a simpler glyph — so the rows became illustrated cards carrying the actual hero.
 *
 * Type matches the other tabs (title @22 + the shared ThemedText scale). The serif that used to
 * live here came over with the web page and was the only serif in the app.
 */
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasButton } from '@/components/ask-atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { DIGEST_CATEGORIES, DIGEST_POSTS, type DigestPost } from '@/lib/digest-content';
import { pickToday } from '@/lib/digest-pick';
import { heroTint, tintedHero } from '@/lib/hero-tint';
import { dayKey, useApp } from '@/lib/store';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const ALL = 'All';

function Hero({ post, size }: { post: DigestPost; size: number }) {
  const xml = tintedHero(post.hero, post.category);
  if (!xml) return null;
  // default preserveAspectRatio letterboxes inside the box, so the illustration never distorts
  return <SvgXml xml={xml} width={size} height={size} />;
}

/** Today's guide, before it has been read. Brilliant's big-hero treatment. */
function TodayCard({ post }: { post: DigestPost }) {
  const theme = useTheme();
  return (
    <SpringPressable onPress={() => router.push(`/digest/${post.slug}`)}>
      <Card style={styles.today} tint={theme.primary} elevated>
        <View style={[styles.heroPanel, { backgroundColor: (heroTint(post.category) ?? theme.primary) + '14' }]}>
          <Hero post={post} size={132} />
        </View>

        <View style={styles.metaRow}>
          <ThemedText type="label" style={{ color: theme.iconLilac }}>
            Today · {post.category}
          </ThemedText>
          <ThemedText type="small" themeColor="mutedForeground">
            {post.readMinutes} min read
          </ThemedText>
        </View>

        <ThemedText type="heading" style={styles.todayTitle}>
          {post.title}
        </ThemedText>
        <ThemedText type="body" themeColor="mutedForeground" style={styles.todayExcerpt}>
          {post.excerpt}
        </ThemedText>

        <View style={styles.cta}>
          {/* iconLilac, not primary: this is 13px semibold, which is NOT "large text" under
              WCAG, and primary on a card measures 4.49 against a 4.5 threshold. iconLilac is
              the palette's violet meant for text on dark and measures 8.29 on the same card. */}
          <UIcon name="arrowRight" size={17} color={theme.iconLilac} />
          <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>
            Read today’s guide
          </ThemedText>
        </View>
      </Card>
    </SpringPressable>
  );
}

/**
 * The beat the tab never had. Duolingo ends a day on a rest state, not on the next thing — so this
 * says the day is closed, shows what the read bought, and points at tomorrow. The library below
 * stays fully readable: this frames the habit, it does not gate the content.
 */
function DoneCard({ post, streak }: { post: DigestPost; streak: number }) {
  const theme = useTheme();
  return (
    <Card style={styles.today} tint={theme.success} elevated>
      <View style={styles.doneHead}>
        <View style={[styles.doneCheck, { backgroundColor: theme.success }]}>
          <UIcon name="check" size={20} color="#fff" strokeWidth={3} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="heading" style={{ fontSize: 19 }}>
            Done for today
          </ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
            New guide tomorrow
          </ThemedText>
        </View>
      </View>

      <View style={styles.doneChips}>
        {/* A celebration that announces "0 day streak" is not a celebration. Guides only started
            advancing the streak this session, so anyone whose last read predates that legitimately
            sits at 0 — show them the XP and say nothing about a streak they do not have. */}
        {streak > 0 ? (
          <View style={[styles.chipStat, { backgroundColor: '#F9731618', borderColor: '#F9731640' }]}>
            <UIcon name="flame" size={16} color="#F97316" />
            <ThemedText type="smallBold" style={{ color: '#F97316' }}>
              {streak} day streak
            </ThemedText>
          </View>
        ) : null}
        <View style={[styles.chipStat, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
          <UIcon name="sparkle" size={16} color={theme.iconLilac} />
          <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>
            +25 XP
          </ThemedText>
        </View>
      </View>

      <SpringPressable haptic={false} onPress={() => router.push(`/digest/${post.slug}`)}>
        <View style={[styles.doneRead, { borderColor: theme.border }]}>
          <Hero post={post} size={40} />
          <ThemedText type="bodyMedium" style={{ flex: 1, lineHeight: 20 }} numberOfLines={2}>
            {post.title}
          </ThemedText>
          <UIcon name="chevronRight" size={16} color={theme.mutedForeground} />
        </View>
      </SpringPressable>
    </Card>
  );
}

/** Brilliant's unit card: rich illustration on the LEFT, title beside it, at a size that reads. */
function GuideCard({ post, read }: { post: DigestPost; read: boolean }) {
  const theme = useTheme();
  return (
    <SpringPressable onPress={() => router.push(`/digest/${post.slug}`)} scaleTo={0.97}>
      <Card style={styles.guide}>
        <View style={[styles.guideArt, { backgroundColor: (heroTint(post.category) ?? theme.primary) + '12' }]}>
          <Hero post={post} size={62} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="bodyMedium" themeColor={read ? 'mutedForeground' : undefined} style={{ lineHeight: 20 }}>
            {post.title}
          </ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 3 }}>
            {post.category} · {post.readMinutes} min
          </ThemedText>
        </View>
        <View
          style={[
            styles.tick,
            { borderColor: read ? theme.primary : theme.border, backgroundColor: read ? theme.primary : 'transparent' },
          ]}>
          {read && <UIcon name="check" size={11} color="#fff" />}
        </View>
      </Card>
    </SpringPressable>
  );
}

export default function Digest() {
  const theme = useTheme();
  const readPosts = useApp((s) => s.readPosts);
  const dailyPick = useApp((s) => s.dailyPick);
  const setDailyPick = useApp((s) => s.setDailyPick);
  // a stored NUMBER is a safe selector; a getter that builds an array is not
  const streak = useApp((s) => s.streak);

  const { day, post: today } = useMemo(() => pickToday(readPosts, dailyPick), [readPosts, dailyPick]);

  // pin the choice so the rest of the day keeps offering the same guide
  useEffect(() => {
    if (dailyPick?.day !== day || dailyPick.slug !== today.slug) setDailyPick(day, today.slug);
  }, [day, today.slug, dailyPick, setDailyPick]);

  // Today is done only when the guide pinned to TODAY has been read. Reading a catch-up guide is
  // not the ritual, and yesterday's pin must not close today.
  const doneToday = dailyPick?.day === dayKey() && readPosts.includes(dailyPick.slug);

  const [filter, setFilter] = useState<string>(ALL);
  // On first paint the list staggers in behind the header and hero, so it starts late on purpose.
  // A filter TAP is a different event: the user acted and wants to see the list answer, so the
  // cascade starts immediately and only the per-item offset remains. Same animation, different
  // lead-in, because the two moments mean different things.
  const [touched, setTouched] = useState(false);
  const cascadeBase = touched ? 0 : 190;

  const library = useMemo(
    () =>
      DIGEST_POSTS.filter((p) => p.slug !== today.slug && (filter === ALL || p.category === filter))
        // unread first, so the list always leads with something to do
        .sort((a, b) => Number(readPosts.includes(a.slug)) - Number(readPosts.includes(b.slug))),
    [today.slug, readPosts, filter],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={40} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={{ fontSize: 22 }}>
                Digest
              </ThemedText>
              <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
                One idea a day. Read it, then practice it.
              </ThemedText>
            </View>
            <AskAtlasButton topic="Digest" />
          </View>
        </RiseIn>

        <RiseIn delay={70}>
          {doneToday ? <DoneCard post={today} streak={streak} /> : <TodayCard post={today} />}
        </RiseIn>

        <RiseIn delay={130}>
          <View style={styles.sectionHead}>
            <ThemedText type="label" themeColor="mutedForeground">
              All guides
            </ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">
              {readPosts.length} of {DIGEST_POSTS.length} read
            </ThemedText>
          </View>
        </RiseIn>

        {/* Brilliant's category chips. Horizontal scroll because six chips never fit a phone width. */}
        <RiseIn delay={160}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            style={styles.chipScroll}>
            {[ALL, ...DIGEST_CATEGORIES].map((c) => {
              const active = filter === c;
              return (
                <SpringPressable
                  key={c}
                  scaleTo={0.94}
                  onPress={() => {
                    setFilter(c);
                    setTouched(true);
                  }}>
                  <View
                    style={[
                      styles.chip,
                      {
                        borderColor: active ? theme.primary : theme.border,
                        backgroundColor: active ? theme.primary + '1A' : 'transparent',
                      },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: active ? theme.iconLilac : theme.mutedForeground }}>
                      {c}
                    </ThemedText>
                  </View>
                </SpringPressable>
              );
            })}
          </ScrollView>
        </RiseIn>

        {/* keyed by filter so EVERY card remounts and the whole list cascades on a chip tap.
            Without this key, cards surviving the filter keep their React key, never remount, and
            never replay RiseIn — so the list changed instantly with no feedback at all and only
            newly-matching cards animated. Half a list animating is worse than none. */}
        <View key={filter} style={styles.list}>
          {library.map((p, i) => (
            <RiseIn key={p.slug} delay={cascadeBase + i * 30}>
              <GuideCard post={p} read={readPosts.includes(p.slug)} />
            </RiseIn>
          ))}
          {library.length === 0 ? (
            <ThemedText type="small" themeColor="mutedForeground" style={styles.empty}>
              Nothing else in {filter} yet.
            </ThemedText>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  today: { marginTop: Spacing.three, padding: Spacing.three },
  heroPanel: {
    height: 150,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todayTitle: { fontSize: 20, lineHeight: 26, marginTop: 6 },
  todayExcerpt: { marginTop: Spacing.one, lineHeight: 21 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: Spacing.three },

  doneHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2 },
  doneCheck: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  doneChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one + 2, marginTop: Spacing.three },
  chipStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  doneRead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingTop: Spacing.two + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.four },
  chipScroll: { marginTop: Spacing.two },
  chipRow: { gap: Spacing.one + 2, paddingRight: Spacing.three },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1.5 },

  list: { marginTop: Spacing.two + 2, gap: Spacing.two },
  guide: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two },
  guideArt: { width: 74, height: 74, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  tick: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', paddingVertical: Spacing.four },
});
