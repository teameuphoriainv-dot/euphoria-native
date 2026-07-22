/**
 * Digest article reader — opened from a Digest post row. Serif headline + category/read-time
 * meta + clean reading column (Brilliant editorial style). Full markdown bodies land later;
 * for now the excerpt leads and a "practice in the app" CTA closes, per the Digest promise.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { BottomTabInset, Fonts, Radius, Spacing } from '@/constants/theme';
import { CATEGORY_ICON, DIGEST_POSTS } from '@/lib/digest-content';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export default function DigestArticle() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const post = DIGEST_POSTS.find((p) => p.slug === slug);

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

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={30} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SpringPressable haptic={false} onPress={() => router.back()} style={styles.back}>
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
          <ThemedText type="small" themeColor="mutedForeground">Digest</ThemedText>
        </SpringPressable>

        <RiseIn>
          <View style={[styles.heroBubble, { backgroundColor: theme.primary + '1A' }]}>
            <Icon name={CATEGORY_ICON[post.category]} size={40} />
          </View>
          <View style={styles.metaRow}>
            <ThemedText type="label" style={{ color: theme.iconLilac }}>{post.category}</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">{post.readMinutes} min read</ThemedText>
          </View>
          <ThemedText style={styles.headline}>{post.title}</ThemedText>
        </RiseIn>

        <RiseIn delay={90}>
          <ThemedText type="body" style={styles.lead}>{post.excerpt}</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.body}>
            This guide is part of Euphoria&apos;s {post.category} track. The full breakdown walks through
            the numbers step by step — then you put it into practice with an interactive lesson, so the
            idea actually sticks.
          </ThemedText>
        </RiseIn>

        <RiseIn delay={160}>
          <GradientButton label="Practice this in a lesson" onPress={() => router.push('/lesson')} style={{ marginTop: Spacing.four }} />
        </RiseIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: Spacing.three },
  heroBubble: { width: 64, height: 64, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  headline: { fontFamily: Fonts.serif, fontSize: 30, lineHeight: 37, color: '#F3EEFA' },
  lead: { fontSize: 18, lineHeight: 27, marginTop: Spacing.three },
  body: { marginTop: Spacing.three, lineHeight: 23 },
});
