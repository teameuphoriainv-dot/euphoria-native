/**
 * Digest article reader — paginated by section rather than one long scroll.
 *
 * The article's `## ` headings already divide it into one idea each, so each heading becomes a
 * card: hero and lead first, then Key Takeaways, the explanation, the worked example, The Bottom
 * Line. Same header/footer rhythm as lesson.tsx (close + progress track at the top, one CTA at the
 * bottom) so reading and doing a lesson feel like the same app.
 *
 * Reaching the last card is what marks the guide read. Mounting used to be enough, which meant
 * opening a guide for one second ticked it as read on the Digest tab.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { Blocks, parseBlocks, type Block } from '@/components/digest-body';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { bodyFor } from '@/lib/digest-bodies';
import { DIGEST_POSTS } from '@/lib/digest-content';
import { heroSvg } from '@/lib/digest-heroes';
import { useApp } from '@/lib/store';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

type Card = { title: string | null; blocks: Block[] };

/** One card per `## ` section; anything before the first heading is the opening card. */
function toCards(markdown: string): Card[] {
  const cards: Card[] = [{ title: null, blocks: [] }];
  for (const b of parseBlocks(markdown)) {
    if (b.kind === 'h2') cards.push({ title: b.text, blocks: [] });
    else cards[cards.length - 1].blocks.push(b);
  }
  return cards.filter((c) => c.title !== null || c.blocks.length > 0);
}

export default function DigestArticle() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const post = DIGEST_POSTS.find((p) => p.slug === slug);
  const markPostRead = useApp((s) => s.markPostRead);

  const cards = useMemo(() => (post ? toCards(bodyFor(post.slug) ?? '') : []), [post]);
  const [i, setI] = useState(0);
  const total = cards.length + 1; // +1 for the cover
  const last = i === total - 1;

  // reaching the end is what counts as read, not opening the screen
  useEffect(() => {
    if (post && last) markPostRead(post.slug);
  }, [post, last, markPostRead]);

  if (!post) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ThemedText type="heading">Article not found</ThemedText>
        <SpringPressable onPress={() => router.back()} style={{ marginTop: Spacing.three }}>
          <ThemedText type="bodyMedium" style={{ color: theme.iconLilac }}>Back to Digest</ThemedText>
        </SpringPressable>
      </SafeAreaView>
    );
  }

  const card = i > 0 ? cards[i - 1] : null;
  const isTakeaways = !!card?.title && /^key takeaways$/i.test(card.title);
  const xml = heroSvg(post.hero);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={30} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.close}>
          <UIcon name="close" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <View style={[styles.track, { backgroundColor: theme.muted }]}>
          <View style={[styles.fill, { backgroundColor: theme.primary, width: `${((i + 1) / total) * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        key={i}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(120)}>
          {i === 0 ? (
            <RiseIn>
              {xml ? (
                <View style={[styles.cover, { backgroundColor: theme.primary + '14' }]}>
                  <SvgXml xml={xml} width={168} height={168} />
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <ThemedText type="label" style={{ color: theme.iconLilac }}>{post.category}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">{post.readMinutes} min read</ThemedText>
              </View>
              <ThemedText type="title" style={styles.headline}>{post.title}</ThemedText>
              <ThemedText type="body" style={styles.lead}>{post.excerpt}</ThemedText>
            </RiseIn>
          ) : (
            <RiseIn>
              <ThemedText type="label" themeColor="mutedForeground">
                {i} of {total - 1}
              </ThemedText>
              {card?.title ? (
                <ThemedText type="title" style={styles.cardTitle}>{card.title}</ThemedText>
              ) : null}
              <View
                style={
                  isTakeaways
                    ? [styles.takeaways, { borderColor: theme.primary + '3D', backgroundColor: theme.primary + '12' }]
                    : undefined
                }>
                <Blocks blocks={card?.blocks ?? []} />
              </View>
            </RiseIn>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {last ? (
          <GradientButton label="Practice this in a lesson" full onPress={() => router.push('/lesson')} />
        ) : (
          <GradientButton label={i === 0 ? 'Start reading' : 'Continue'} full onPress={() => setI(i + 1)} />
        )}
        {last ? (
          <SpringPressable haptic={false} onPress={() => router.back()} style={styles.done}>
            <ThemedText type="small" themeColor="mutedForeground">Back to Digest</ThemedText>
          </SpringPressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  close: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  // flexGrow + centring is what removes the dead space: a short section sits centred in the card
  // instead of hugging the top with a screen of black beneath it. Long sections still scroll.
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.three, paddingVertical: Spacing.four },
  cover: { height: 200, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.four },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  headline: { fontFamily: Fonts.readBold, fontSize: 34, lineHeight: 41 },
  lead: { fontFamily: Fonts.read, fontSize: 20, lineHeight: 31, marginTop: Spacing.three },
  cardTitle: { fontFamily: Fonts.readBold, fontSize: 29, lineHeight: 36, marginTop: 8, marginBottom: Spacing.two },
  takeaways: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.three, marginTop: Spacing.two },
  footer: { padding: Spacing.three, paddingTop: Spacing.two },
  done: { alignItems: 'center', paddingTop: Spacing.three },
});
