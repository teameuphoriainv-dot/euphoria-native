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
import { useMemo } from 'react';
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
import { useApp } from '@/lib/store';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Local day number. Rotates the pick through the library so there is something new each day
 *  without needing an editorial schedule, and it stays put for the whole day. */
const dayNumber = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86_400_000);

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
          <Hero post={post} size={38} />
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
  const readPosts = useApp((s) => s.readPosts);
  const today = DIGEST_POSTS[dayNumber() % DIGEST_POSTS.length];

  // unread first so catch-up always leads with something to do
  const catchUp = useMemo(
    () =>
      DIGEST_POSTS.filter((p) => p.slug !== today.slug).sort(
        (a, b) => Number(readPosts.includes(a.slug)) - Number(readPosts.includes(b.slug)),
      ),
    [today.slug, readPosts],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={40} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <ThemedText type="title" style={{ fontSize: 22 }}>
            Digest
          </ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
            One idea a day — read it, then practice it.
          </ThemedText>
        </RiseIn>

        <RiseIn delay={70}>
          <TodayCard post={today} read={readPosts.includes(today.slug)} />
        </RiseIn>

        <RiseIn delay={130}>
          <View style={styles.sectionHead}>
            <ThemedText type="label" themeColor="mutedForeground">
              Catch up
            </ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">
              {readPosts.length} of {DIGEST_POSTS.length} read
            </ThemedText>
          </View>
        </RiseIn>

        <View style={styles.list}>
          {catchUp.map((p, i) => (
            <RiseIn key={p.slug} delay={170 + i * 35}>
              <CatchUpRow post={p} read={readPosts.includes(p.slug)} />
            </RiseIn>
          ))}
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
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.four },
  list: { marginTop: Spacing.two, gap: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.one + 2 },
  thumb: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  tick: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
