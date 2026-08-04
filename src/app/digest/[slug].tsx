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
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { lessonForGuide } from '@/lib/digest-lessons';
import { Atlas } from '@/components/atlas';
import { CelebrationRays } from '@/components/celebration-burst';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RewardPop } from '@/shared/motion/reward-pop';
import { heroSvg } from '@/lib/digest-heroes';
import { useApp } from '@/lib/store';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** A card holds a run of blocks, headings included. Headings do NOT start a new card. */
type Card = { blocks: Block[] };

/**
 * Vertical cost of a block in words-equivalent.
 *
 * Calibrated against the real layout rather than guessed: body is 16.5/26 in a ~370pt column,
 * about 7.5 words a line, so one word is roughly 3.5pt. A heading with its margins is ~55pt, a
 * figure panel with its margin ~222pt.
 */
const WORD_PT = 3.5;
const COST = (b: Block) => {
  if (b.kind === 'h2') return 55 / WORD_PT;
  if (b.kind === 'image') return 222 / WORD_PT;
  if (b.kind === 'bullet') return b.items.reduce((n, i) => n + i.split(/\s+/).length, 0) + b.items.length * 4;
  if (b.kind === 'quote') return b.text.split(/\s+/).length + 10;
  return b.text.split(/\s+/).length + 16 / WORD_PT;
};

/**
 * One screen's worth of content.
 *
 * The earlier version started a new card at every `## `, which is why cards sat half empty however
 * the budget was tuned: most sections are only ~110 words and the section boundary, not the
 * budget, decided the break. Blocks now flow continuously and a heading is just another block, so
 * two or three short sections share one screen the way Brilliant packs a concept.
 *
 * ~640pt of content height at 3.5pt per word is about 180 words-equivalent.
 */
const BUDGET = 196;

function toCards(markdown: string): Card[] {
  const blocks = parseBlocks(markdown);
  const out: Card[] = [];
  let cur: Block[] = [];
  let spent = 0;

  for (let n = 0; n < blocks.length; n++) {
    const b = blocks[n];
    const c = COST(b);
    // Allow a modest overshoot instead of breaking early. Breaking the moment a block would cross
    // the budget leaves cards at ~75% of a screen; letting the last block run a little over packs
    // them close to full, and the card scrolls if it does spill.
    const orphanHeading = b.kind === 'h2' && spent + c + COST(blocks[n + 1] ?? b) > BUDGET * 1.12;
    if (cur.length && (spent + c > BUDGET * 1.12 || orphanHeading)) {
      out.push({ blocks: cur });
      cur = [];
      spent = 0;
    }
    cur.push(b);
    spent += c;
  }
  if (cur.length) out.push({ blocks: cur });
  return out;
}

/** Every figure in the corpus is authored on a 320x200 viewBox. Sizing the cover panel to that
 *  exact ratio makes the art full-bleed instead of letterboxed: it used to draw at 168x105 inside
 *  a 200pt panel, so most of the cover was empty tint. */
const FIGURE_RATIO = 320 / 200;

/**
 * The payoff for finishing a guide.
 *
 * Reaching the last card awards 25 XP and now advances the streak, and until this existed the
 * app marked both by swapping a button. The state changed and the reader was given nothing to
 * feel, which is the same failure as a value updating on screen with no transition.
 *
 * DELIBERATELY QUIETER THAN A LESSON. lesson.tsx earns its wipe, confetti, oversized arrival and
 * four staggered pops — that is a full lesson's payoff. A two-minute read that out-celebrated it
 * would flatten the difference between them. So: rays and a small proud Atlas, no confetti, no
 * wipe, and the celebrate amplitude left at the quiet default rather than lesson's gain of 1.
 */
function ReadReward({ streak }: { streak: number }) {
  const theme = useTheme();
  return (
    <View style={styles.reward}>
      <CelebrationRays size={230} delay={90} />
      <Atlas size={72} expression="proud" celebrate entrance="arrive" interactive={false} />
      <RewardPop delay={520}>
        <ThemedText type="heading" style={{ fontSize: 19, marginTop: Spacing.two }}>
          Guide finished
        </ThemedText>
      </RewardPop>
      <View style={styles.rewardChips}>
        <RewardPop delay={700}>
          <View style={[styles.rewardChip, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
            <UIcon name="sparkle" size={16} color={theme.iconLilac} />
            <NumberRollup
              value={25}
              prefix="+"
              suffix=" XP"
              duration={620}
              type="heading"
              style={{ color: theme.iconLilac, fontSize: 16 }}
            />
          </View>
        </RewardPop>
        <RewardPop delay={840}>
          <View style={[styles.rewardChip, { backgroundColor: '#F9731618', borderColor: '#F9731640' }]}>
            <UIcon name="flame" size={16} color="#F97316" />
            <NumberRollup
              value={streak}
              suffix=" day streak"
              duration={620}
              type="heading"
              style={{ color: '#F97316', fontSize: 16 }}
            />
          </View>
        </RewardPop>
      </View>
    </View>
  );
}

export default function DigestArticle() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const coverH = Math.round((width - Spacing.three * 2) / FIGURE_RATIO);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const post = DIGEST_POSTS.find((p) => p.slug === slug);
  const markPostRead = useApp((s) => s.markPostRead);
  // a getter returning a NUMBER is a safe selector; one that builds an array is not. This previews
  // the streak the read is about to produce, because the reward renders before the write lands.
  const streakAfter = useApp((s) => s.streakIfCompletedToday());
  // Captured once, before markPostRead runs. Re-reading pays nothing — markPostRead is idempotent —
  // so celebrating a re-read would promise XP the store never mints.
  const [firstRead] = useState(() => !useApp.getState().readPosts.includes(slug ?? ''));

  const lesson = post ? lessonForGuide(post.slug) : undefined;
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
  const xml = heroSvg(post.hero);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={30} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.close}>
          <UIcon name="close" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        {/* segmented rather than one continuous track: Brilliant's pattern, and it also tells you
            how many screens are left instead of just how far along you are */}
        <View style={styles.track}>
          {Array.from({ length: total }, (_, n) => (
            <View
              key={n}
              style={[styles.seg, { backgroundColor: n <= i ? theme.primary : theme.muted }]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        key={i}
        contentContainerStyle={[styles.content, i === 0 && styles.contentCover]}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(120)}>
          {i === 0 ? (
            <RiseIn>
              {xml ? (
                <View style={[styles.cover, { height: coverH, backgroundColor: theme.primary + '14' }]}>
                  <SvgXml xml={xml} width="100%" height={coverH} />
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
              <Blocks blocks={card?.blocks ?? []} />
              {last && firstRead ? <ReadReward streak={streakAfter} /> : null}
            </RiseIn>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {last ? (
          <GradientButton
            label="Practice this in a lesson"
            full
            onPress={() =>
              lesson
                ? router.push({ pathname: '/lesson', params: { course: lesson.course, num: String(lesson.num) } })
                : router.push('/lesson')
            }
          />
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
  reward: { alignItems: 'center', marginTop: Spacing.four + Spacing.two, paddingBottom: Spacing.two },
  rewardChips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.one + 2, marginTop: Spacing.three },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  close: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, flexDirection: 'row', gap: 4, height: 6 },
  seg: { flex: 1, height: '100%', borderRadius: Radius.pill },
  // flexGrow + centring is what removes the dead space: a short section sits centred in the card
  // instead of hugging the top with a screen of black beneath it. Long sections still scroll.
  content: { flexGrow: 1, justifyContent: 'flex-start', padding: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.four },
  // The cover is the one card that is always short by design, so it is the one card that should
  // centre. Content cards stay top-aligned: centring those made half-empty sections read as
  // blocks floating in a void.
  contentCover: { justifyContent: 'center' },
  cover: { borderRadius: Radius.lg, overflow: 'hidden', justifyContent: 'center', marginBottom: Spacing.four },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  headline: { fontSize: 28, lineHeight: 35 },
  lead: { fontFamily: Fonts.medium, fontSize: 17, lineHeight: 26, marginTop: Spacing.three },
  cardTitle: { fontSize: 24, lineHeight: 31, marginTop: 8, marginBottom: Spacing.two },
  takeaways: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.three, marginTop: Spacing.two },
  footer: { padding: Spacing.three, paddingTop: Spacing.two },
  done: { alignItems: 'center', paddingTop: Spacing.three },
});
