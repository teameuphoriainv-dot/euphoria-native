/**
 * The Atlas app tour: the overlay.
 *
 * Presentation only. Every beat, the ordering and the decision to run at all live in
 * src/lib/atlas-tour.ts, which is pure so a script can check the copy against the real screens.
 *
 * ── IT REUSES ATLAS'S EXISTING COACH MARK, IT DOES NOT INVENT A SECOND ONE ────────────────────
 * atlas-intro.tsx already ends on one: a dark shade, a ring around the thing being taught, Atlas
 * beside a speech bubble, and one pill to dismiss it. That is the app's established language for
 * "Atlas is pointing at something", so this is the same four parts, generalised to point at any
 * rectangle and walked across five beats. Same <Atlas>, same <AtlasSpeech>, same SpringPressable
 * pill. No new mascot presentation enters the app.
 *
 * ── WHY THE SPOTLIGHT IS FOUR RECTANGLES AND NOT A MASK ──────────────────────────────────────
 * A cut-out needs either an SVG mask or a shadow spread, and the second is forbidden here
 * (no-glow-pin bans a non-zero shadowRadius anywhere in src). Four dimming views around the hole
 * give a real hole with plain layout, no SVG in the hot path, and nothing for the pin to catch.
 *
 * ── WHERE THE RECTANGLE COMES FROM ───────────────────────────────────────────────────────────
 * Two sources, and only one of them measures anything:
 *   tab     pure geometry. The tab bar is five `flex: 1` children in a row (tab-bar.tsx), so slot
 *           i is exactly [i*W/5, (i+1)*W/5]. Nothing to measure, nothing to keep in sync, and no
 *           ref plumbing into a component this file is not allowed to touch.
 *   anchor  a real element that registered itself via <TourAnchor>, measured in WINDOW coordinates
 *           so it can be compared against a full-screen overlay.
 *
 * THE OVERLAY SWALLOWS TOUCHES while it is up. A coach mark you can tap through desynchronises
 * from the screen behind it on the first stray tap; the tour drives its own navigation instead.
 */
import { router, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Atlas } from '@/components/atlas';
import { AtlasSpeech } from '@/components/atlas-speech';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  ATLAS_TOUR_BEATS,
  ATLAS_TOUR_TABS,
  atlasTourTabIndex,
  isAtlasTourPathname,
  isLastAtlasTourBeat,
  shouldShowAtlasTour,
} from '@/lib/atlas-tour';
import { useApp } from '@/lib/store';
import { SpringPressable } from '@/shared/motion/spring-pressable';

type Rect = { x: number; y: number; width: number; height: number };

/*
 * ── THE ANCHOR REGISTRY ──────────────────────────────────────────────────────────────────────
 *
 * Module scope rather than a React context, deliberately. A context provider would have to wrap
 * the tab navigator and every anchor write would re-render that whole subtree, which on Home means
 * the twenty-odd pixel sprites the file's own docblock spent a pass removing churn from. This is
 * read through useSyncExternalStore by exactly one component, the overlay, and only while the tour
 * is on screen.
 *
 * `measurers` exists because onLayout fires once, during Home's entrance animation, and the beat
 * that uses the rectangle is read four beats later. The overlay re-measures when it gets there.
 */
const anchorRects = new Map<string, Rect>();
const anchorMeasurers = new Map<string, () => void>();
const anchorListeners = new Set<() => void>();

function notifyAnchors() {
  for (const listener of anchorListeners) listener();
}

function subscribeAnchors(listener: () => void) {
  anchorListeners.add(listener);
  return () => {
    anchorListeners.delete(listener);
  };
}

function readAnchor(id: string | null): Rect | null {
  return id === null ? null : anchorRects.get(id) ?? null;
}

/**
 * Wrap the one element a beat needs to point at.
 *
 * `collapsable={false}` is required, not cosmetic: without it Android flattens a plain View with
 * no styling out of the native hierarchy and `measureInWindow` then reports zeroes.
 */
export function TourAnchor({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<View>(null);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return;
      const previous = anchorRects.get(id);
      if (previous && previous.x === x && previous.y === y && previous.width === width && previous.height === height) return;
      anchorRects.set(id, { x, y, width, height });
      notifyAnchors();
    });
  }, [id]);

  useEffect(() => {
    anchorMeasurers.set(id, measure);
    return () => {
      anchorMeasurers.delete(id);
      anchorRects.delete(id);
      notifyAnchors();
    };
  }, [id, measure]);

  return (
    <View ref={ref} collapsable={false} onLayout={measure}>
      {children}
    </View>
  );
}

/**
 * The tab bar's slot rectangle, derived rather than measured.
 *
 * The heights mirror tab-bar.tsx exactly: paddingTop 10, a 28pt glyph, a 4pt gap and a label of
 * about 14pt, over a bottom pad of max(inset, 10). The ring deliberately stops above that bottom
 * pad so it hugs the glyph and its label instead of enclosing the home-indicator band.
 */
const TAB_BAR_CONTENT_HEIGHT = 56;
const TAB_BAR_MIN_BOTTOM_PAD = 10;

function tabSlotRect(index: number, windowWidth: number, windowHeight: number, bottomInset: number): Rect {
  const slot = windowWidth / ATLAS_TOUR_TABS.length;
  const bottomPad = Math.max(bottomInset, TAB_BAR_MIN_BOTTOM_PAD);
  return {
    x: index * slot,
    y: windowHeight - bottomPad - TAB_BAR_CONTENT_HEIGHT,
    width: slot,
    height: TAB_BAR_CONTENT_HEIGHT,
  };
}

/** Pads a rectangle so the ring sits off the thing rather than on top of its edge. */
function inflate(rect: Rect, by: number): Rect {
  return { x: rect.x - by, y: rect.y - by, width: rect.width + by * 2, height: rect.height + by * 2 };
}

export function AtlasTour() {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const hasHydrated = useApp((s) => s.hasHydrated);
  const atlasTour = useApp((s) => s.atlasTour);
  const onboardingCompletedAt = useApp((s) => s.profile.completedAt);
  const markAtlasTourSeen = useApp((s) => s.markAtlasTourSeen);

  /*
   * ON A TAB, OR DORMANT. This layout stays mounted under anything pushed above it, so without
   * this the tour would be alive while the user is inside a lesson and its navigate effect would
   * drag them back out. The flag stays `armed` while it waits, so nothing is lost: the tour simply
   * starts the next time they are standing on a tab.
   */
  const onATab = isAtlasTourPathname(usePathname());
  const visible = onATab && shouldShowAtlasTour({ hasHydrated, atlasTour, onboardingCompletedAt });

  const [index, setIndex] = useState(0);
  /*
   * ATLAS ACKNOWLEDGES EVERY STEP. `nodKey` bumps on each advance, which is exactly the gesture
   * onboarding uses for the same event: a nod means "I heard you" where the hop means "you earned
   * that". Firing the hop on a Next tap is the mistake onboarding-parts records having made.
   *
   * `skipKey` is bumped by a tap on the speech block and drops the rest of the typewriter. Before
   * it, the Next button was live from the first frame while the line took up to 2.9 seconds to
   * finish, so the fastest thing a reader could do was skip past a sentence they never saw.
   */
  const [nodKey, setNodKey] = useState(0);
  const [skipKey, setSkipKey] = useState(0);
  const beat = ATLAS_TOUR_BEATS[index] ?? ATLAS_TOUR_BEATS[0];
  const anchorId = beat.highlight.kind === 'anchor' ? beat.highlight.anchor : null;

  const anchorRect = useSyncExternalStore(
    subscribeAnchors,
    () => readAnchor(anchorId),
    () => null,
  );

  /*
   * THE APP IS ACTUALLY ON THE SCREEN BEING DESCRIBED. A tour that narrates a tab from behind a
   * static screenshot is a slideshow; navigating means every word is checkable against what is
   * underneath it. `navigate` rather than `push`, so five beats do not leave five entries on the
   * stack for the back gesture to walk out of.
   */
  useEffect(() => {
    if (!visible) return;
    router.navigate(beat.route as never);
  }, [visible, beat.route]);

  /*
   * Re-measure the anchor when its beat arrives. Home registers the card during its entrance
   * animation, and the rectangle is not read until four beats later, by which time the user may
   * also have changed text size or rotated the device. Two attempts: one on the next frame, one
   * after the tab transition has settled.
   */
  useEffect(() => {
    if (!visible || anchorId === null) return;
    const measure = () => anchorMeasurers.get(anchorId)?.();
    const frame = requestAnimationFrame(measure);
    const settled = setTimeout(measure, 360);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settled);
    };
  }, [visible, anchorId, windowWidth, windowHeight]);

  if (!visible) return null;

  const last = isLastAtlasTourBeat(index);
  const target =
    beat.highlight.kind === 'tab'
      ? tabSlotRect(atlasTourTabIndex(beat), windowWidth, windowHeight, insets.bottom)
      : anchorRect;
  /* No rectangle means the anchor has not reported yet. The beat still reads correctly on its own
     wording, so the tour dims the screen and carries on rather than stalling on a missing measure. */
  const hole = target ? inflate(target, beat.highlight.kind === 'tab' ? 2 : 6) : null;
  const holeRadius = beat.highlight.kind === 'tab' ? Radius.md : Radius.lg;

  /* Atlas stands on the far side of the thing he is pointing at. Anything in the bottom half of
     the screen (every tab beat) puts him above it; anything higher puts him below. */
  const above = hole ? hole.y > windowHeight * 0.55 : true;
  const blockPosition = !hole
    ? { left: Spacing.three, right: Spacing.three, bottom: insets.bottom + Spacing.five }
    : above
      ? { left: Spacing.three, right: Spacing.three, bottom: windowHeight - hole.y + Spacing.three }
      : { left: Spacing.three, right: Spacing.three, top: hole.y + hole.height + Spacing.three };

  const finish = () => {
    markAtlasTourSeen();
    router.navigate('/(tabs)/home');
  };

  const advance = () => {
    if (last) {
      finish();
      return;
    }
    setIndex((n) => n + 1);
    setNodKey((n) => n + 1);
    // The next beat starts typing from nothing, so the skip has to be re-armed per line.
    setSkipKey(0);
  };

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      {/* The shade, as four pieces around the hole. Absent a hole they collapse to one full cover. */}
      {hole ? (
        <>
          <View pointerEvents="none" style={[styles.shade, { left: 0, right: 0, top: 0, height: Math.max(0, hole.y) }]} />
          <View pointerEvents="none" style={[styles.shade, { left: 0, right: 0, top: hole.y + hole.height, bottom: 0 }]} />
          <View pointerEvents="none" style={[styles.shade, { left: 0, width: Math.max(0, hole.x), top: hole.y, height: hole.height }]} />
          <View pointerEvents="none" style={[styles.shade, { left: hole.x + hole.width, right: 0, top: hole.y, height: hole.height }]} />
          <View
            pointerEvents="none"
            style={[
              styles.ring,
              { left: hole.x, top: hole.y, width: hole.width, height: hole.height, borderRadius: holeRadius, borderColor: theme.primary },
            ]}
          />
        </>
      ) : (
        <View pointerEvents="none" style={[styles.shade, StyleSheet.absoluteFill]} />
      )}

      <Animated.View
        key={beat.id}
        entering={reduced ? FadeIn.duration(1) : FadeIn.duration(220)}
        style={[styles.block, blockPosition]}>
        {/* The landing beat is the one moment in the tour that has been EARNED, so it gets the
            hop. Every other beat gets the nod above and nothing more. celebrateGain is well under
            lesson-complete's 1: finishing a walkthrough is a smaller thing than finishing a
            lesson, and the two should not read as equals. */}
        <Atlas
          size={64}
          expression={beat.face}
          interactive={false}
          idle={!reduced}
          nod={nodKey > 0}
          nodKey={nodKey}
          celebrate={last}
          celebrateKey={last ? 1 : 0}
          celebrateGain={0.5}
        />
        {/*
          * TAP THE LINE TO SEE ALL OF IT. scaleTo 1 because a shrinking speech bubble would read
          * as a button, and this is not one: the feedback is the sentence completing.
          *
          * `accessible={false}` is load-bearing. AtlasSpeech already carries the FULL string as
          * the label on its visible copy, and atlas-speech.tsx records that a second element in
          * the tree here is what made VoiceOver read every line twice. Under VoiceOver there is
          * nothing to skip anyway: the label is the whole line from the first frame.
          */}
        <SpringPressable
          haptic={false}
          scaleTo={1}
          accessible={false}
          onPress={() => setSkipKey((n) => n + 1)}
          style={styles.bubble}>
          <AtlasSpeech text={beat.line} tail="top" tailAlign="center" maxWidth={320} delay={reduced ? 0 : 120} skipKey={skipKey} />
        </SpringPressable>

        <View style={styles.controls}>
          <SpringPressable
            haptic={false}
            onPress={finish}
            style={styles.skip}
            hitSlop={{ top: 13, bottom: 13, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Skip the tour">
            <ThemedText type="smallBold" themeColor="mutedForeground">Skip</ThemedText>
          </SpringPressable>

          {/* Progress, as dots rather than "3 of 5". Five beats is short enough that a fraction is
              more reading than the thing it describes. */}
          <View style={styles.dots} accessible accessibilityRole="text" accessibilityLabel={`Step ${String(index + 1)} of ${String(ATLAS_TOUR_BEATS.length)}`}>
            {ATLAS_TOUR_BEATS.map((b, i) => (
              <View
                key={b.id}
                style={[
                  styles.dot,
                  i === index && styles.dotCurrent,
                  { backgroundColor: i <= index ? theme.primary : theme.border },
                ]}
              />
            ))}
          </View>

          <SpringPressable
            onPress={advance}
            scaleTo={0.96}
            style={[styles.next, { backgroundColor: theme.primary }]}
            accessibilityRole="button"
            accessibilityLabel={last ? 'Finish the tour' : 'Next'}>
            <ThemedText type="smallBold" style={{ color: theme.primaryForeground }}>{last ? 'Got it' : 'Next'}</ThemedText>
          </SpringPressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Covers the whole tab layout, tab bar included, and takes every touch. zIndex/elevation match
     atlas-intro's overlay so the two can never fight over the top of the screen. */
  overlay: { position: 'absolute', inset: 0, zIndex: 100, elevation: 100 },
  shade: { position: 'absolute', backgroundColor: 'rgba(8,7,13,0.86)' },
  ring: { position: 'absolute', borderWidth: 2 },
  block: { position: 'absolute', alignItems: 'center', gap: Spacing.two },
  bubble: { alignItems: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: Spacing.two },
  /* 44pt, which is Apple's floor. Skip is the control a user in a hurry aims at, so it is the last
     one that should be hard to hit. */
  skip: { minWidth: 64, minHeight: 44, alignItems: 'flex-start', justifyContent: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  dot: { width: 6, height: 6, borderRadius: Radius.pill },
  dotCurrent: { width: 18 },
  next: { minWidth: 64, minHeight: 44, paddingHorizontal: Spacing.four, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
