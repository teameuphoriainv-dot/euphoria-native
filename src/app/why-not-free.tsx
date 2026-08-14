/**
 * "Why isn't Euphoria free?" — the honest answer, reachable from the gate sheet.
 *
 * Copied in MECHANISM from Astra AI 323575, which carries a "Why isn't Astra AI free?" pill beside
 * its Buy button. It answers the resentment instead of ignoring it, and for a finance app aimed at
 * 18-25s that honesty is a differentiator rather than a weakness.
 *
 * Every claim here is TRUE of this codebase, which is the only reason it can be said (§0.4):
 *   - market data really is metered per call — see api/market+api.ts and its rate limits
 *   - Atlas really does cost per message — api/chat+api.ts proxies a paid model
 *   - there really are no ads and no data sale — there is no ad SDK in the tree, and nothing here
 *     is sold or shared
 *   - "nothing that identifies you personally" is TRUE OF THE CONFIGURATION, not a hope: see
 *     lib/analytics.ts, where session replay and autocapture are both off and the identity sent is
 *     `installId`, never name, handle or email
 * If any of those stops being true, this screen has to change with it. That is not a style note —
 * this app once shipped a card claiming "no analytics" while Unit 17b added a tracking SDK, and
 * the copy was only caught because the claim was written down next to the code that broke it.
 *
 * COPY STATUS, corrected 2026-08-13. This header said "COPY IS UNAPPROVED (§20.2)" outright, and
 * that was already wrong when it was written: §22 C103 records three drafts going to the user and
 * the THIRD REASON's body being chosen VERBATIM — it is quoted in the log. The blanket marker made
 * approved copy look unapproved, which is the direction that gets working words rewritten.
 *
 * Approved: the third reason's body ("No ads, and we never sell your data…"), per C103.
 * Still unapproved: the title, the lead, the first two reasons, and the closing line.
 */
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const REASONS: { title: string; body: string }[] = [
  {
    title: 'Live prices cost money every time you look',
    body: 'Every quote, chart and set of key stats is a metered API call. A user who checks ten tickers a day costs real money whether or not they ever pay us.',
  },
  {
    title: 'Atlas costs money every time you ask',
    body: 'Each question goes to a paid model. Unlimited free answers would mean the heaviest users are funded entirely by nobody.',
  },
  {
    title: 'We do not run ads and we do not sell what you do here',
    body: 'No ads, and we never sell your data. We do measure how the app gets used so we can make it better \u2014 nothing that identifies you personally. Those are the two usual ways a free finance app makes money, and we have given both up.',
  },
];

export default function WhyNotFree() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <Pressable
        style={[styles.close, { backgroundColor: theme.cardElevated }]}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={() => router.back()}>
        <UIcon name="close" size={18} color={theme.textSecondary} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText type="display" style={styles.title}>
          Why isn&apos;t{'\n'}Euphoria free?
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary" style={styles.lead}>
          A fair question, and there is a real answer rather than a marketing one.
        </ThemedText>
        <View style={styles.list}>
          {REASONS.map((r) => (
            <View key={r.title} style={styles.item}>
              <ThemedText type="bodyMedium">{r.title}</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground">
                {r.body}
              </ThemedText>
            </View>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.close2}>
          A subscription is the only other option we could find that does not involve selling you or
          your data. That is the whole reason.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  close: {
    position: 'absolute',
    top: Spacing.six,
    right: Spacing.four,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.six + Spacing.two, paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.two },
  lead: { marginBottom: Spacing.five },
  list: { gap: Spacing.four },
  item: { gap: Spacing.one },
  close2: { marginTop: Spacing.five },
});
