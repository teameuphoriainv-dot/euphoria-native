/**
 * Digest article reader — paginated by section rather than one long scroll.
 *
 * The article's `## ` headings already divide it into one idea each, so each heading becomes a
 * card: photo, title and excerpt first, then Key points, the explanation with its charts and stat
 * rows, The Bottom Line, and the Sources list last (the web article page's order). Same header/footer rhythm as lesson.tsx (close + progress track at the top, one CTA at the
 * bottom) so reading and doing a lesson feel like the same app.
 *
 * Reaching the last card is what marks the guide read. Mounting used to be enough, which meant
 * opening a guide for one second ticked it as read on the Digest tab.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { GateSheet } from '@/components/gate-sheet';
import { AskAtlasRow } from '@/components/ask-atlas';
import { Blocks, parseBlocks, type Block } from '@/components/digest-body';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Fonts, Radius, Spacing, FontSize } from '@/constants/theme';
// The MERGED lookup: iOS-added guides live in digest-extra.ts, and the synced articleFor cannot see them.
import type { DigestArticle as Article } from '@/lib/digest-bodies';
import { allArticleFor, EXTRA_HERO_ART, findDigestPost } from '@/lib/digest-extra';
import { photoFor } from '@/lib/digest-photos';
import { PixelSpriteView } from '@/lib/pixel';
import { lessonForGuide } from '@/lib/digest-lessons';
import { ReadReward } from "@/components/read-reward";
import { heroTint } from '@/lib/hero-tint';
import { useApp } from '@/lib/store';
import { entitled, type Refusal } from '@/lib/entitlement';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { STAGGER_GAP } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** One safe exit for every way out of an article, mirroring lesson.tsx's exitLesson.
 *  A bare `router.back()` throws "The action 'GO_BACK' was not handled by any navigator" whenever
 *  there is no history to pop -- which is exactly the notification deep link, the most common way
 *  this screen is opened. All three exits (the X, "Back to Digest", and the end-of-article done
 *  button) went straight to router.back() and stranded the reader on that error. */
function exitDigest() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)/digest');
}

/** A card holds a run of blocks, headings included. Headings do NOT start a new card. */
type Card = { blocks: Block[] };

/**
 * Vertical cost of a block in words-equivalent.
 *
 * Calibrated against the real layout rather than guessed: body is 18/29 in a ~358pt column,
 * about 7.5 words a line, so one word is roughly 3.5pt. A heading with its margins is ~55pt.
 * A chart panel (title, note, legend, a 186pt plot, axis, the numbers toggle, source) measures
 * about 380pt; a stat row about 64pt each.
 */
const WORD_PT = 3.5;
const words = (s: string) => s.split(/\s+/).length;
const COST = (b: Block): number => {
  switch (b.kind) {
    case 'h2':
      return 55 / WORD_PT;
    case 'h3':
      return 40 / WORD_PT;
    case 'chart':
      return 380 / WORD_PT;
    case 'stats':
      return (b.items.length * 64 + 24) / WORD_PT;
    case 'callout':
      return words(b.title) + words(b.text) + 60 / WORD_PT;
    case 'bullet':
    case 'keypoints':
      return b.items.reduce((n, i) => n + words(i), 0) + b.items.length * 4 + (b.kind === 'keypoints' ? 60 / WORD_PT : 0);
    case 'sources':
      return (b.items.length * 44 + 60) / WORD_PT;
    case 'quote':
      return words(b.text) + 10;
    default:
      return words(b.text) + 16 / WORD_PT;
  }
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

/*
 * Key points open the article and Sources close it, as on the web article page. They are spliced
 * in as blocks rather than pinned to the cover or the footer so they paginate like everything
 * else: the cover stays a cover, and a nine-source list cannot push the last card off screen.
 */
function toCards(article: Article): Card[] {
  const blocks: Block[] = [
    ...(article.keyPoints?.length ? [{ kind: 'keypoints' as const, items: article.keyPoints }] : []),
    ...parseBlocks(article.body),
    ...(article.sources?.length ? [{ kind: 'sources' as const, items: article.sources }] : []),
  ];
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

/** The cover panel's shape. 16:10 is the web card's photo aspect (PostCard aspect-[16/10]) and was
 *  the SVG covers' 320x200 before that, so the masthead's height does not change with the art. */
const FIGURE_RATIO = 16 / 10;

export default function DigestArticle() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const coverH = Math.round((width - Spacing.three * 2) / FIGURE_RATIO);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const post = findDigestPost(slug);
  const markPostRead = useApp((s) => s.markPostRead);
  // a getter returning a NUMBER is a safe selector; one that builds an array is not. This previews
  // the streak the read is about to produce, because the reward renders before the write lands.
  const streakAfter = useApp((s) => s.streakIfCompletedToday());
  // Captured once, before markPostRead runs. Re-reading pays nothing — markPostRead is idempotent —
  // so celebrating a re-read would promise XP the store never mints.
  const [firstRead] = useState(() => !useApp.getState().readPosts.includes(post?.slug ?? ''));

  const lesson = post ? lessonForGuide(post.slug) : undefined;
  const article = useMemo(() => (post ? allArticleFor(post.slug) : undefined), [post]);
  const cards = useMemo(() => (article ? toCards(article) : []), [article]);
  const [i, setI] = useState(0);
  const total = cards.length + 1; // +1 for the cover
  const last = i === total - 1;

  /*
   * THE BODY GATE (§9.4, §9f). Verified open before this: an expired user read a whole guide end to
   * end, because this screen asked nothing about entitlement.
   *
   * WHAT STAYS FREE, and it is deliberately not zero: the cover (i=0 — hero, category, read time,
   * title, excerpt) AND the first body card (i=1). §9f says the sheet rises "over a blurred first
   * screen of the article", so the reader gets a real taste rather than a wall where the body should
   * start. That is also the mechanism 5/5 of the references use — a lock is a promise, and a promise
   * needs something behind it. Gating at the cover would show an expired user nothing they had not
   * already read on the Digest list.
   *
   * Read NON-REACTIVELY at tap time: `entitled()` returns a fresh object, so subscribing through a
   * selector loops until React throws "Maximum update depth exceeded" (it took down Learn once).
   */
  const [gate, setGate] = useState<Refusal | null>(null);
  const FREE_CARDS = 1;
  const advance = () => {
    if (i >= FREE_CARDS) {
      const refusal = entitled(useApp.getState(), 'guide');
      if (!refusal.ok) {
        setGate(refusal);
        return;
      }
    }
    setI(i + 1);
  };

  // reaching the end is what counts as read, not opening the screen
  useEffect(() => {
    if (post && last) markPostRead(post.slug);
  }, [post, last, markPostRead]);

  if (!post) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ThemedText type="heading">Article not found</ThemedText>
        <SpringPressable onPress={() => exitDigest()} style={{ marginTop: Spacing.three }}>
          <ThemedText type="bodyMedium" style={{ color: theme.iconLilac }}>Back to Digest</ThemedText>
        </SpringPressable>
      </SafeAreaView>
    );
  }

  const card = i > 0 ? cards[i - 1] : null;
  const heroSprite = post.hero ? EXTRA_HERO_ART[post.hero] : undefined;
  const photo = photoFor(post.slug);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={30} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => exitDigest()} style={styles.close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
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
            /*
             * THE COVER LEADS, THE TEXT FOLLOWS. These four were one RiseIn, so the hero art,
             * category, headline and lead all arrived on the same frame -- measured at 0.07s
             * with 147,044 changed pixels, the whole masthead landing at once. Every other
             * surface in this app staggers its siblings (STAGGER_GAP), and an article masthead
             * is exactly where that reads best: the art establishes the subject, then the words
             * arrive to name it.
             *
             * The cover keeps delay 0 so nothing feels slower to start than it did before.
             */
            <>
              {/* A synced guide leads with its photo, credited underneath exactly as the web
                  captions it. A `px-` hero is an iOS-written guide with no photo: its sprite sits
                  centred rather than stretched, since a 16x16 sprite blown to full cover width
                  would be four enormous squares. See digest-extra.ts. */}
              {photo ? (
                <RiseIn>
                  <View style={styles.coverWrap}>
                    <Image
                      source={photo.source}
                      resizeMode="cover"
                      accessible={Boolean(photo.alt)}
                      accessibilityRole="image"
                      accessibilityLabel={photo.alt}
                      style={[styles.cover, styles.coverPhoto, { height: coverH, backgroundColor: theme.card }]}
                    />
                    <ThemedText type="small" themeColor="mutedForeground" style={styles.credit}>
                      {photo.credit}
                    </ThemedText>
                  </View>
                </RiseIn>
              ) : heroSprite ? (
                <RiseIn>
                  <View style={[styles.cover, { height: coverH, backgroundColor: (heroTint(post.category) ?? theme.primary) + '14', alignItems: 'center', justifyContent: 'center' }]}>
                    <PixelSpriteView sprite={heroSprite} size={Math.round(coverH * 0.5)} />
                  </View>
                </RiseIn>
              ) : null}
              <RiseIn delay={STAGGER_GAP}>
                <View style={styles.metaRow}>
                  <ThemedText type="label" style={{ color: theme.iconLilac }}>{post.category}</ThemedText>
                  <ThemedText type="small" themeColor="mutedForeground">{post.readMinutes} min read</ThemedText>
                </View>
              </RiseIn>
              <RiseIn delay={STAGGER_GAP * 2}>
                <ThemedText type="title" maxFontSizeMultiplier={1.6} style={styles.headline}>{post.title}</ThemedText>
              </RiseIn>
              <RiseIn delay={STAGGER_GAP * 3}>
                <ThemedText type="body" style={styles.lead}>{post.excerpt}</ThemedText>
              </RiseIn>
            </>
          ) : (
            <RiseIn>
              <Blocks blocks={card?.blocks ?? []} charts={article?.charts} />
              {last && firstRead ? <ReadReward streak={streakAfter} /> : null}
            </RiseIn>
          )}
        </Animated.View>

        {/* Placed at the END OF THE CONTENT, not in the fixed footer. Gauth ($600k/mo) puts its
            "Still feeling stuck?" escalation inline right after the answer, at the moment the
            reader knows whether they followed it — a fixed footer competes with the primary CTA
            and asks before they can possibly know. */}
        {last ? <AskAtlasRow topic={post.title} /> : null}
      </ScrollView>

      <View style={styles.footer}>
        {last ? (
          <SlabButton
            // Unmapped guides used to fall back to a bare push('/lesson'), which worked only while
            // the player ignored its params and rendered a demo. It reads them now, so a paramless
            // push dead-ends on "That lesson isn't available" — send them to the pathway instead,
            // and don't promise a specific lesson we haven't got.
            label={lesson ? 'Practice this in a lesson' : 'Keep learning'}
            full
            onPress={() =>
              lesson
                ? router.push({ pathname: '/lesson', params: { course: lesson.course, num: String(lesson.num) } })
                : router.push('/learn')
            }
          />
        ) : (
          <SlabButton label={i === 0 ? 'Start reading' : 'Continue'} full onPress={advance} />
        )}
        {last ? (
          <SpringPressable haptic={false} onPress={() => exitDigest()} style={styles.done}>
            <ThemedText type="small" themeColor="mutedForeground">Back to Digest</ThemedText>
          </SpringPressable>
        ) : null}
      </View>

      {/* Inside the screen, so the article stays mounted and the reader keeps their place. */}
      {gate && (
        <GateSheet
          feature="guide"
          refusal={gate}
          visible
          onDismiss={() => setGate(null)}
          onSeePro={() => {
            setGate(null);
            router.push('/onboarding?step=paywall');
          }}
          onWhyNotFree={() => {
            setGate(null);
            router.push('/why-not-free');
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  // the caption carries the gap below a photo cover instead of the photo itself
  coverWrap: { marginBottom: Spacing.four },
  coverPhoto: { width: '100%', marginBottom: 0 },
  credit: { marginTop: Spacing.one + 2 },
  /* gap + flexWrap added: at AX5 both labels grow until they touch, and space-between alone
     cannot separate them once they fill the row — the frame read "CREDIT2 min read" with no
     space at all. Wrapping lets the read-time drop to its own line rather than collide. */
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginBottom: 6 },
  headline: { fontSize: FontSize.displaySm, lineHeight: 35 },
  lead: { fontFamily: Fonts.medium, fontSize: FontSize.bodyLg, lineHeight: 26, marginTop: Spacing.three },
  cardTitle: { fontSize: FontSize.title, lineHeight: 31, marginTop: 8, marginBottom: Spacing.two },
  takeaways: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.three, marginTop: Spacing.two },
  footer: { padding: Spacing.three, paddingTop: Spacing.two },
  done: { alignItems: 'center', paddingTop: Spacing.three },
});
