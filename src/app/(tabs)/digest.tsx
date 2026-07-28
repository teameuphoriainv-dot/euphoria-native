/**
 * Digest — the app's daily read. Deliberately NOT the web Digest: euphoriaweb's DigestHome is a
 * browsable library (serif hero, "All guides" + category filter, featured post, post grid) because
 * it exists to be found by search. In the app the same content serves the habit the rest of the
 * product is built around — a streak and a daily minutes goal — so this surfaces exactly one guide
 * for today and treats everything else as catch-up. Browsing the whole library stays on the web.
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
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { DIGEST_POSTS, type DigestPost } from '@/lib/digest-content';
import { heroSvg } from '@/lib/digest-heroes';
import { dayKey, useApp } from '@/lib/store';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Fallback only, for when every guide has been read: rotate by day so the tab still offers
 *  something rather than going blank. */
const dayNumber = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86_400_000);

/**
 * Today's guide: the newest one not yet read, pinned to the day it was chosen on.
 *
 * This replaced `DIGEST_POSTS[dayNumber() % DIGEST_POSTS.length]`, which had three problems — a
 * newly published guide could wait 20 days to surface, adding one shifted the modulo so every
 * future day's pick changed, and it happily offered something already read while unread guides
 * sat in the list. Pinning matters because the choice depends on read state: without it, finishing
 * today's guide would immediately swap the card for a different one.
 */
function pickToday(readPosts: string[], pinned: { day: string; slug: string } | null) {
  const day = dayKey();
  if (pinned?.day === day) {
    const still = DIGEST_POSTS.find((p) => p.slug === pinned.slug);
    if (still) return { day, post: still };
  }
  // DIGEST_POSTS is newest-first, so the first unread is the freshest unread
  const unread = DIGEST_POSTS.find((p) => !readPosts.includes(p.slug));
  return { day, post: unread ?? DIGEST_POSTS[dayNumber() % DIGEST_POSTS.length] };
}

/** Category marks for the catch-up thumbnails. The full illustrations are scenes — at 38px their
 *  detail collapses into noise and their light shapes read as blobs, so the small slot gets a
 *  single bold shape instead and the illustration is kept for the cover, where it has room. */
const CATEGORY_MARK: Record<string, string> = {
  'Money basics': 'mark-money',
  Investing: 'mark-investing',
  Markets: 'mark-markets',
  Credit: 'mark-credit',
  Strategy: 'mark-strategy',
};

function Mark({ category, size }: { category: string; size: number }) {
  const xml = heroSvg(CATEGORY_MARK[category] ?? '');
  if (!xml) return null;
  return <SvgXml xml={xml} width={size} height={size} />;
}

function Hero({ post, size }: { post: DigestPost; size: number }) {
  const xml = heroSvg(post.hero);
  if (!xml) return null;
  // default preserveAspectRatio letterboxes inside the box, so the illustration never distorts
  return <SvgXml xml={xml} width={size} height={size} />;
}

function TodayCard({ post, read }: { post: DigestPost; read: boolean }) {
  const theme = useTheme();
  return (
    <SpringPressable onPress={() => router.push(`/digest/${post.slug}`)}>
      <Card style={styles.today} tint={theme.primary} elevated>
        <View style={[styles.heroPanel, { backgroundColor: theme.primary + '14' }]}>
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
          <UIcon name={read ? 'check' : 'arrowRight'} size={17} color={theme.primary} />
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            {read ? 'Read again' : 'Read today’s guide'}
          </ThemedText>
        </View>
      </Card>
    </SpringPressable>
  );
}

function CatchUpRow({ post, read }: { post: DigestPost; read: boolean }) {
  const theme = useTheme();
  return (
    <SpringPressable onPress={() => router.push(`/digest/${post.slug}`)}>
      <View style={styles.row}>
        <View style={[styles.thumb, { backgroundColor: theme.primary + '12' }]}>
          <Mark category={post.category} size={26} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="bodyMedium" themeColor={read ? 'mutedForeground' : undefined} style={{ lineHeight: 20 }}>
            {post.title}
          </ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
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
      </View>
    </SpringPressable>
  );
}

export default function Digest() {
  const theme = useTheme();
  const readPosts = useApp((s) => s.readPosts);
  const dailyPick = useApp((s) => s.dailyPick);
  const setDailyPick = useApp((s) => s.setDailyPick);

  const { day, post: today } = useMemo(() => pickToday(readPosts, dailyPick), [readPosts, dailyPick]);

  // pin the choice so the rest of the day keeps offering the same guide
  useEffect(() => {
    if (dailyPick?.day !== day || dailyPick.slug !== today.slug) setDailyPick(day, today.slug);
  }, [day, today.slug, dailyPick, setDailyPick]);

  const [showAll, setShowAll] = useState(false);

  // unread first so catch-up always leads with something to do
  const catchUp = useMemo(
    () =>
      DIGEST_POSTS.filter((p) => p.slug !== today.slug).sort(
        (a, b) => Number(readPosts.includes(a.slug)) - Number(readPosts.includes(b.slug)),
      ),
    [today.slug, readPosts],
  );

  // catch-up is a queue, not the library: a short list of what is next, with the rest behind a tap
  const QUEUE = 5;
  const shown = showAll ? catchUp : catchUp.slice(0, QUEUE);
  const hidden = catchUp.length - shown.length;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={40} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <ThemedText type="title" style={{ fontSize: 22 }}>
            Digest
          </ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
            One idea a day. Read it, then practice it.
          </ThemedText>
        </RiseIn>

        <RiseIn delay={70}>
          <TodayCard post={today} read={readPosts.includes(today.slug)} />
        </RiseIn>

        <RiseIn delay={130}>
          <View style={styles.sectionHead}>
            <ThemedText type="label" themeColor="mutedForeground">
              {showAll ? 'All guides' : 'Next up'}
            </ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">
              {readPosts.length} of {DIGEST_POSTS.length} read
            </ThemedText>
          </View>
        </RiseIn>

        <View style={styles.list}>
          {shown.map((p, i) => (
            <RiseIn key={p.slug} delay={170 + i * 35}>
              <CatchUpRow post={p} read={readPosts.includes(p.slug)} />
            </RiseIn>
          ))}
        </View>

        {hidden > 0 || showAll ? (
          <SpringPressable haptic={false} onPress={() => setShowAll(!showAll)} style={styles.seeAll}>
            <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>
              {showAll ? 'Show less' : `See all ${DIGEST_POSTS.length} guides`}
            </ThemedText>
            <UIcon name={showAll ? 'chevronLeft' : 'chevronRight'} size={15} color={theme.iconLilac} />
          </SpringPressable>
        ) : null}
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
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.four },
  list: { marginTop: Spacing.two, gap: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.one + 2 },
  thumb: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  seeAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.three },
  tick: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
