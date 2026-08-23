/**
 * Atlas chat.
 *
 * Shape taken from a 5-app ScreensDesign pull (Praktika 1816, Astra AI 2190, Promova 936,
 * Answer.AI 1089, Solvely 826) — see refs/WORKORDER_ATLAS_TABS.md for the hit rates. What was
 * adopted and why:
 *
 *   - mascot in the thread (5/5)              Atlas already exists, so this is free
 *   - action-naming input placeholder (5/5)   "Ask Atlas..." not "Type a message"
 *   - header carries CONTEXT (4/5)            the lesson you came from, not a generic title
 *   - suggested follow-up chips (3/5)         kills the blank page; every reference text tutor has them
 *   - usage meter in-thread + upgrade (3/5)   Answer.AI and Astra refuse INSIDE the thread rather
 *                                             than bouncing you to a paywall, which is far less rude
 *   - explicit thinking state (2/5)           Atlas has a `thinking` expression already
 *
 * NOT adopted: thumbs/copy/regen controls (3/5) — there is no telemetry to receive the vote, and a
 * button that files a rating into nothing is exactly the dead control this app is trying to remove.
 *
 * The A.I. disclaimer is 1/5 in the references, which is not convergence. It ships anyway because
 * this is a FINANCE app and the domain risk is different from homework help. Justified by domain,
 * not by the reference set.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { DismissalOfferSheet } from '@/components/dismissal-offer-sheet';
import { GateSheet } from '@/components/gate-sheet';
import { Ev, track } from '@/lib/analytics';
import { dismissalOfferAvailable } from '@/lib/dismissal-offer';
import { IAP_ENABLED } from '@/lib/purchases';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { askAtlas, chatErrorMessage, ChatError, type ChatTurn } from '@/lib/atlas-chat';
import { FREE_ATLAS_MESSAGES, useApp } from '@/lib/store';
import { entitled, TRIAL_DAYS, useTier, type Refusal } from '@/lib/entitlement';

/** Openers for the empty state. Finance-specific and deliberately concrete — "Ask me anything"
 *  produces nothing, a real question produces a real conversation. */
const STARTERS = [
  'What is compound interest, simply?',
  'Why do stock prices move?',
  'How much should I keep in an emergency fund?',
];

/** Shown under a reply so the thread always offers a next move. Generic on purpose: they have to
 *  make sense after ANY answer, since we do not generate them per-response yet. */
const FOLLOW_UPS = ['Explain it simpler', 'Give me an example'];

/**
 * Questions remaining at which we start SAYING SO.
 *
 * Answer.AI runs a persistent "You're running out of lightning! Add more to solve a problem"
 * banner with a "+ Add" well before zero. That is the converting move and the reason to copy it:
 * hitting an invisible wall mid-thought reads as the app breaking, and a user who feels cheated
 * does not subscribe. Warned scarcity is an offer; unwarned scarcity is a bug.
 */
const WARN_AT = 3;

export default function ChatScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ topic?: string }>();
  const topic = params.topic ?? '';

  const isPro = useApp((s) => s.isPro);
  const left = useApp((s) => s.atlasLeft());
  const spend = useApp((s) => s.spendAtlasMessage);

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /*
   * Declared with the other state, ABOVE the `if (expired)` early return below — the same hook-order
   * trap `stock/[sym].tsx` already records. `entitled()` is read at press time from `getState()`
   * rather than subscribed, because the sheet needs the reason as it was at the moment of refusal.
   */
  const [gate, setGate] = useState<Refusal | null>(null);
  /** 17d. Raised when the expired-Atlas wall is dismissed and a better ask is still unspent. */
  const [offer, setOffer] = useState(false);

  /**
   * 17d on the wall (§22 C115). Makes the second ask once, then gets out of the way. Stamped on the
   * way in, because the user has already chosen to leave — there is no navigation race here.
   */
  function leaveWall() {
    const s = useApp.getState();
    if (dismissalOfferAvailable({ iapEnabled: IAP_ENABLED, isPro: s.isPro, specialOfferSeenAt: s.specialOfferSeenAt, lessonsDone: s.completedLessons.length })) {
      s.markSpecialOfferSeen();
      track(Ev.specialOfferSeen, { feature: 'atlas' });
      setOffer(true);
      return;
    }
    router.back();
  }
  const scroller = useRef<ScrollView>(null);

  const exhausted = !isPro && left <= 0;
  /*
   * EXPIRY IS NOT THE SAME EVENT AS THE COUNT LIMIT, and conflating them was a measured hole:
   * `store.atlasLeft()` knows nothing about the trial clock, so an EXPIRED user opened this screen
   * and was offered "9 questions left" with a live composer. Verified on device before this fix.
   * C13 decision 1 closes every feature on expiry except the streak/XP/league loop.
   *
   * Kept as a SEPARATE flag rather than folded into `atlasLeft()`: "questions left" is an allowance
   * and expiry is a closed door. One value meaning both would make the header pill lie.
   */
  const expired = useTier() === 'expired';

  /** One path for every request so send and "Ask again" cannot drift apart. `next` is the whole
   *  thread to send, ending in a user turn. */
  const run = useCallback(
    async (next: ChatTurn[]) => {
      setTurns(next);
      setError(null);
      setPending(true);
      // Spend on SEND, not on success. A failed request still cost us an upstream call, and
      // refunding on error would make the allowance farmable by forcing failures.
      spend();

      try {
        const reply = await askAtlas(next);
        setTurns([...next, { role: 'model', content: reply }]);
      } catch (e) {
        setError(chatErrorMessage(e instanceof ChatError ? e.code : 'unknown'));
      } finally {
        setPending(false);
      }
    },
    [spend],
  );

  const send = useCallback(
    (text: string) => {
      const body = text.trim();
      if (!body || pending || exhausted) return;
      setDraft('');
      run([...turns, { role: 'user', content: body }]);
    },
    [turns, pending, exhausted, run],
  );

  /**
   * Re-ask the last question. Gauth ($600k/mo) keeps "Ask again" on every answer — an AI reply is
   * a draw, not a fact, and the cheapest fix for a bad one is another draw. Drops the last model
   * turn and re-sends the thread, which now ends on the original user turn.
   *
   * It costs an allowance because it costs an upstream call. Free regeneration would be the one
   * hole in the limit.
   */
  const regenerate = useCallback(() => {
    if (pending || exhausted) return;
    const last = turns[turns.length - 1];
    if (last?.role !== 'model') return;
    run(turns.slice(0, -1));
  }, [turns, pending, exhausted, run]);

  /*
   * EXPIRED: the whole feature is closed, so the thread, the starter prompts and the composer all
   * go. Leaving a composer the user can type into but never send from would be the largest dead
   * control on the screen (§0.5), and leaving the "N questions left" pill would advertise an
   * allowance they cannot spend — which is exactly what shipped before this.
   *
   * Its own return rather than a branch inside the main tree: an expired user needs a title, the
   * reason, and two ways out. Rebuilding the close button is a smaller and safer diff than
   * restructuring a 200-line JSX tree around a conditional.
   *
   * The headline is WORD-FOR-WORD the gate sheet's and the lesson wall's. Three surfaces refusing
   * for the same reason should not invent three sentences for it.
   */
  if (expired) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AmbientBackground starCount={24} />
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close chat">
            <UIcon name="close" size={22} color={theme.mutedForeground} />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText type="bodyMedium">Atlas</ThemedText>
          </View>
        </View>
        <View style={styles.expired}>
          <Atlas size={110} expression="watching" interactive={false} idle />
          <ThemedText type="title" style={styles.expiredTitle}>Your free {TRIAL_DAYS} days are up.</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.expiredSub}>
            Euphoria Pro makes Atlas unlimited — every question, no counter.
          </ThemedText>
        </View>
        <View style={styles.expiredFooter}>
          <SlabButton label="See Euphoria Pro" full onPress={() => router.push('/onboarding?step=paywall')} />
          <Pressable
            onPress={leaveWall}
            style={styles.expiredOut}
            accessibilityRole="button"
            accessibilityLabel="Not now">
            <ThemedText type="small" themeColor="mutedForeground">Not now</ThemedText>
          </Pressable>
        </View>

        {/* 17d, per §22 C115. This wall is one of the two that never mounted GateSheet, so it let
            the user go without the second ask. Same rule, same sheet, one more door closed. */}
        <DismissalOfferSheet
          visible={offer}
          feature="atlas"
          onAccept={() => {
            setOffer(false);
            router.push('/onboarding?step=paywall');
          }}
          onDismiss={() => {
            setOffer(false);
            router.back();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AmbientBackground starCount={24} />

      {/* Header carries the CONTEXT you arrived with — 4/5 of the references do this rather than
          showing a bare screen title. */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close chat"
        >
          <UIcon name="close" size={22} color={theme.mutedForeground} />
        </Pressable>
        <View style={styles.headerText}>
          <ThemedText type="bodyMedium">Atlas</ThemedText>
          {!!topic && (
            <ThemedText type="label" themeColor="mutedForeground" numberOfLines={1}>
              {topic}
            </ThemedText>
          )}
        </View>
        {/* "10/10" told the user nothing — a bare ratio reads as a score, not an allowance. Below
            the warn threshold it becomes a Pro CTA, which is where Answer.AI puts its "+ Add". */}
        {!isPro && !expired &&
          (left <= WARN_AT ? (
            <Pressable
              onPress={() => router.push('/onboarding?step=paywall')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${left} questions left. Go Pro for unlimited.`}
            >
              <View style={[styles.warnPill, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
                <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{left} left</ThemedText>
              </View>
            </Pressable>
          ) : (
            <ThemedText type="small" themeColor="mutedForeground" accessibilityLabel={`${left} questions left`}>
              {left} left
            </ThemedText>
          ))}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          ref={scroller}
          style={styles.flex}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {turns.length === 0 && (
            <View style={styles.empty}>
              <View style={styles.emptyHead}>
                <Atlas size={104} expression="happy" interactive={false} idle />
                <ThemedText type="title" style={styles.emptyTitle}>Hi, I&apos;m Atlas.</ThemedText>
                <ThemedText type="body" themeColor="mutedForeground" style={styles.emptyLine}>
                  Ask me anything about money. I&apos;ll keep it short.
                </ThemedText>
              </View>

              {/* Full-width question rows, not centred pills. Answer.AI's welcome (screen 184765)
                  offers whole questions you can send as-is — a starter has to read as the thing
                  you were about to type, which centred 11pt caps did not. */}
              <View style={styles.starters}>
                {STARTERS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => send(s)}
                    style={[styles.starter, { backgroundColor: theme.card, borderColor: theme.border }]}
                    accessibilityRole="button"
                    accessibilityLabel={s}
                  >
                    <ThemedText type="body" style={styles.starterText}>{s}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {turns.map((t, i) =>
            t.role === 'user' ? (
              <Animated.View key={i} entering={FadeIn} style={styles.userRow}>
                <View style={[styles.userBubble, { backgroundColor: theme.primary }]}>
                  <ThemedText type="body" style={styles.userText}>{t.content}</ThemedText>
                </View>
              </Animated.View>
            ) : (
              <Animated.View key={i} entering={FadeIn} style={styles.atlasRow}>
                <Atlas size={30} interactive={false} />
                <View style={[styles.atlasBubble, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <ThemedText type="body">{t.content}</ThemedText>
                </View>
              </Animated.View>
            ),
          )}

          {pending && (
            <View style={styles.atlasRow} accessibilityLabel="Atlas is thinking">
              <Atlas size={30} expression="thinking" interactive={false} />
              <View style={[styles.atlasBubble, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <ThemedText type="body" themeColor="mutedForeground">Thinking…</ThemedText>
              </View>
            </View>
          )}

          {!!error && (
            <View style={styles.atlasRow}>
              <Atlas size={30} expression="oops" interactive={false} />
              <View style={[styles.atlasBubble, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <ThemedText type="body" themeColor="mutedForeground">{error}</ThemedText>
              </View>
            </View>
          )}

          {/* Follow-ups appear only after a real reply, never next to an error or a pending turn. */}
          {!pending && !error && turns.length > 0 && turns[turns.length - 1].role === 'model' && !exhausted && (
            <View style={styles.followRow}>
              {FOLLOW_UPS.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => send(f)}
                  style={[styles.chip, styles.chipInline, { backgroundColor: theme.card, borderColor: theme.border }]}
                  accessibilityRole="button"
                  accessibilityLabel={f}
                >
                  <ThemedText type="small">{f}</ThemedText>
                </Pressable>
              ))}
              {/* "Ask again" — verbatim from Gauth, which keeps it on every answer. */}
              <Pressable
                onPress={regenerate}
                style={[styles.chip, styles.chipInline, styles.chipIcon, { backgroundColor: theme.card, borderColor: theme.border }]}
                accessibilityRole="button"
                accessibilityLabel="Ask again"
              >
                <ThemedText type="small" themeColor="mutedForeground">Ask again</ThemedText>
              </Pressable>
            </View>
          )}

          {/* Warned scarcity, before the wall. Answer.AI shows this as a banner AND keeps a count
              in the header — both, not either. Only after a real reply, so it never greets you. */}
          {!isPro && !exhausted && left <= WARN_AT && !pending && turns.length > 0 && (
            <Pressable
              onPress={() => router.push('/onboarding?step=paywall')}
              style={[styles.warnBanner, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '3A' }]}
              accessibilityRole="button"
              accessibilityLabel={`${left} free questions left. Go Pro for unlimited.`}
            >
              <UIcon name="sparkle" size={16} color={theme.iconLilac} />
              <ThemedText type="small" style={{ flex: 1, color: theme.iconLilac }}>
                {left === 1 ? '1 free question left' : `${left} free questions left`} — go Pro for unlimited.
              </ThemedText>
              <UIcon name="arrowRight" size={15} color={theme.iconLilac} />
            </Pressable>
          )}

          {/* The refusal lives IN the thread, the way Answer.AI and Astra AI do it, rather than
              throwing the user out to a paywall screen mid-question.

              THE CARD DID THAT; THE BUTTON DID NOT. `See Pro` pushed straight to
              /onboarding?step=paywall, so the sentence above was true of the card and false of the
              only control on it — the thread was still thrown away on the one tap that mattered.
              Same shape as C43's paywall disagreeing with itself in one frame.

              It now opens the gate sheet, which is what §4b asks of every gated control and what
              `gate-sheet.tsx:7` was written for. Note the sheet ALREADY had Atlas copy — "Atlas
              needs a break" / "You've used your 10 free questions" — and `entitled()` already had
              the `atlas` count-limit branch. Both were unreachable: nothing in the app passed
              feature="atlas". The engine and the words were built and never connected. */}
          {exhausted && (
            <View style={[styles.limit, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <ThemedText type="bodyMedium">You&apos;ve used your {FREE_ATLAS_MESSAGES} free questions.</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground" style={styles.limitSub}>
                Go Pro to keep going — every lesson unlocked too.
              </ThemedText>
              <SlabButton
                label="See Pro"
                full
                onPress={() => setGate(entitled(useApp.getState(), 'atlas'))}
              />
            </View>
          )}
        </ScrollView>

        <View style={[styles.composer, { borderTopColor: theme.border }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={exhausted ? 'Free questions used up' : 'Ask Atlas…'}
            placeholderTextColor={theme.mutedForeground}
            editable={!exhausted}
            multiline
            style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
            accessibilityLabel="Message Atlas"
            onSubmitEditing={() => send(draft)}
          />
          <Pressable
            onPress={() => send(draft)}
            disabled={!draft.trim() || pending || exhausted}
            hitSlop={10}
            style={[styles.sendBtn, { backgroundColor: theme.primary, opacity: !draft.trim() || pending || exhausted ? 0.4 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !draft.trim() || pending || exhausted }}
          >
            <UIcon name="arrowRight" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <ThemedText type="small" themeColor="mutedForeground" style={styles.disclaimer}>
          Atlas is AI. General concepts, not personal advice.
        </ThemedText>
      </KeyboardAvoidingView>

      {/* Sibling of the KeyboardAvoidingView, not a child of the ScrollView: the thread stays
          mounted underneath, so dismissing returns the user to their own conversation rather than
          to the top of a remounted one. Same placement as stock/[sym].tsx. */}
      {gate && (
        <GateSheet
          feature="atlas"
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
  flex: { flex: 1 },
  // The expired surface. Mirrors lesson.tsx's locked state so the two read as one refusal.
  expired: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four, gap: Spacing.three },
  expiredTitle: { textAlign: 'center' },
  expiredSub: { textAlign: 'center' },
  expiredFooter: { padding: Spacing.four, paddingTop: Spacing.two },
  // 44pt on its own, not via hitSlop — with the feature closed this is the only way back.
  expiredOut: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.four, marginTop: Spacing.two },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: { flex: 1 },
  // flexGrow lets the empty state claim the whole viewport instead of hugging the top and
  // leaving a dead band above the composer, while a real thread still scrolls normally.
  thread: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', gap: Spacing.five },
  emptyHead: { alignItems: 'center', gap: Spacing.two },
  emptyTitle: { fontSize: FontSize.title, textAlign: 'center' },
  emptyLine: { textAlign: 'center', maxWidth: 290 },
  starters: { gap: Spacing.two },
  starter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  starterText: { flex: 1 },
  warnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  warnPill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: 3,
    paddingHorizontal: Spacing.two,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  chipInline: { alignSelf: 'flex-start' },
  chipIcon: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  followRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginLeft: 38 },
  userRow: { alignItems: 'flex-end' },
  userBubble: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  userText: { color: '#FFFFFF' },
  atlasRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  atlasBubble: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  limit: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  limitSub: { marginBottom: Spacing.two },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    fontSize: FontSize.bodySm,
    lineHeight: 21,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { textAlign: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
});
