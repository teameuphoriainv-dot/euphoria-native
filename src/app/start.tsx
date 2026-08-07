/**
 * The guided first action.
 *
 * Onboarding used to end with `router.replace('/(tabs)/home')`, which dropped someone who had just
 * answered fourteen questions onto a screen showing a zero streak, zero XP, an empty week strip
 * and a portfolio that is not theirs. Nothing told them what to do next.
 *
 * Neither reference ends that way. Duolingo ends onboarding INSIDE your first lesson with Duo
 * coaching you through it; Brilliant ends in a real interactive problem. Neither ships a passive
 * feature carousel, because people swipe past those without reading them.
 *
 * WHY A GUIDE AND NOT A LESSON. lesson.tsx renders hardcoded STEPS demo content: every lesson in
 * every course opens "FOUNDATIONS - LESSON 9 - What is a stock?", verified on device. Handing a new
 * user that, seconds after promising a personalised path, would be the worst possible first
 * impression. Digest guides are real authored content, the reader works, and reaching the last
 * card awards XP which lights up the tier bar and puts them on the league board. It is currently
 * the only surface where a first action pays off correctly.
 *
 * That is a workaround for a defect, not a preference. MOVE THIS TO A LESSON once the player
 * renders real curriculum, which is what Duolingo actually does.
 */
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { AtlasSpeech } from '@/components/atlas-speech';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { pickToday } from '@/lib/digest-pick';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export default function Start() {
  const readPosts = useApp((s) => s.readPosts);
  const dailyPick = useApp((s) => s.dailyPick);
  const setProfile = useApp((s) => s.setProfile);
  const setDailyPick = useApp((s) => s.setDailyPick);

  const { day, post } = pickToday(readPosts, dailyPick);

  /** Both paths stamp. Skipping is a decision, not a deferral: without stamping here the screen
   *  would greet the user again on every single sign-in. */
  const done = () => setProfile({ firstRunDoneAt: Date.now() });

  const begin = () => {
    done();
    // Pin the pick so the Digest tab shows the same guide they were just handed.
    setDailyPick(day, post.slug);
    router.replace(`/digest/${post.slug}` as never);
  };

  const later = () => {
    done();
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />
      <View style={styles.content}>
        <RiseIn>
          <View style={styles.head}>
            <Atlas size={92} expression="happy" interactive={false} entrance="bounce" />
          </View>
        </RiseIn>

        <RiseIn delay={120}>
          <View style={styles.bubble}>
            <AtlasSpeech
              text="Your plan is ready. Let's start with one idea, then I'll show you around."
              delay={260}
              tail="top"
            />
          </View>
        </RiseIn>

        <RiseIn delay={320}>
          <Card style={styles.card} elevated>
            <ThemedText type="label" themeColor="mutedForeground">
              TODAY · {post.category.toUpperCase()}
            </ThemedText>
            <ThemedText type="title" style={styles.title}>{post.title}</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.excerpt}>
              {post.excerpt}
            </ThemedText>
            <ThemedText type="small" themeColor="mutedForeground" style={styles.mins}>
              {post.readMinutes} min read
            </ThemedText>
          </Card>
        </RiseIn>
      </View>

      <View style={styles.footer}>
        <RiseIn delay={420}>
          <GradientButton label="Read today's guide" full onPress={begin} />
          <SpringPressable haptic={false} onPress={later} style={styles.later}>
            <ThemedText type="bodyMedium" themeColor="mutedForeground">Maybe later</ThemedText>
          </SpringPressable>
        </RiseIn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.four, gap: Spacing.two },
  head: { alignItems: 'center' },
  bubble: { alignItems: 'center', marginTop: Spacing.three, marginBottom: Spacing.three },
  card: { gap: 6 },
  title: { fontSize: 22, marginTop: 2 },
  excerpt: { lineHeight: 22 },
  mins: { marginTop: Spacing.two },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  later: { alignItems: 'center', paddingVertical: Spacing.three },
});
