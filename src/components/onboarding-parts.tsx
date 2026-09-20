/**
 * Onboarding building blocks — matches the design mockups: progress header with back
 * chevron, option cards with icon bubble + radio, growth chart, star rating.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Atlas, type AtlasExpression } from '@/components/atlas';
import { LessonArt } from '@/components/lesson-art';
import { AtlasSpeech } from '@/components/atlas-speech';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PremiumText, usePremiumRamp } from '@/components/ui/premium';
import { courseAccent } from '@/lib/course-accents';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { childDelay } from '@/shared/motion/step-transition';
import { Duration, Ease, Spring } from '@/shared/motion/tokens';
import { PixelSpriteView, type PixelSprite } from '@/lib/pixel';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ATLAS_SIZE = 96;
/** Exit travel. The stage is sized to contain it: Android clips children that fall outside
 *  the parent box regardless of overflow:'visible', so the mascot must never leave it. */
export const ATLAS_RISE = 28;
export const ATLAS_STAGE_H = Math.round(ATLAS_SIZE * 1.04) + ATLAS_RISE;

/**
 * The mascot's fixed home for the whole onboarding flow. Mounts ONCE — it must never
 * remount, or the entrance animation re-fires on every step, which was the original
 * "Atlas bounces up and down" bug. `t` drives exit (1->0) and entry (0->1) along one path,
 * so the mascot rises away and descends back in without any extra state.
 */
export function AtlasStage({
  t,
  expression,
  celebrateKey,
  nodKey = 0,
  size = ATLAS_SIZE,
}: {
  t: SharedValue<number>;
  expression: AtlasExpression;
  celebrateKey: number;
  /** Per-tap acknowledgement. Separate from `celebrateKey` on purpose: a tap gets a nod, and
   *  the hop is reserved for the one moment that earns it. */
  nodKey?: number;
  /** Per-step override. Safe to vary ONLY because callers zero `celebrateKey` on the steps
   *  that resize — `size` is a dependency of Atlas's celebrate effect, so changing it while
   *  a celebrate is armed would re-fire the hop. */
  size?: number;
}) {
  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      // Reaches full opacity at p=0.625, so it is solid for most of the entry and gone
      // early on the exit.
      opacity: Math.min(1, Math.max(0, p * 1.6)),
      // NO translateY. The step transition used to move the mascot vertically by ATLAS_RISE on
      // EVERY step, which is the same gesture the celebrate hop uses to mean "you earned this"
      // — and the routine version fired ~20x more often, so the reward stopped reading as one.
      //
      // Vertical translation is now reserved for earned moments (see
      // refs/ATLAS_REACTION_MAP.md §0). Everything else deforms, rotates or fades. The scale
      // range is widened 0.88->0.86 to keep the transition legible without it.
      transform: [{ scale: 0.86 + 0.14 * p }],
    };
  });
  return (
    // rise headroom scales with the mascot, so a small mascot doesn't reserve a big gap
    <View style={[styles.atlasStage, { height: Math.round(size * 1.04) + Math.round((ATLAS_RISE * size) / ATLAS_SIZE) }]} pointerEvents="box-none">
      <Animated.View style={style}>
        {/* idle breath is sub-pixel below ~96px — not worth the frame callback there */}
        <Atlas
          size={size}
          expression={expression}
          idle={size >= ATLAS_SIZE}
          celebrate={celebrateKey > 0}
          celebrateKey={celebrateKey}
          // Full cartoon beat. Atlas's default gain is the timid per-tap value, which was only
          // ever right because the hop used to fire on taps. The one celebrate left in the flow
          // is the finished plan, so it should land at full size.
          celebrateGain={1}
          nod={nodKey > 0}
          nodKey={nodKey}
        />
      </Animated.View>
    </View>
  );
}

/** One row of the trial timeline (Cal AI paywall pattern): an icon rail on the left with a
 *  gradient spine connecting the dots, title + optional caption on the right. */
export function TrialStep({
  icon,
  title,
  sub,
  tone,
  last = false,
}: {
  icon: PixelSprite;
  title: string;
  sub?: string;
  tone: 'solid' | 'soft' | 'muted';
  last?: boolean;
}) {
  const theme = useTheme();
  /*
   * THE THREE DOTS WALK THE WEB'S RAMP: purple, then pink, then orange, top to bottom, the same
   * progression euphoriainv.com uses across its upgrade surfaces. The third was theme.muted, a
   * flat dark grey, so the last benefit read as disabled rather than as the end of a sequence.
   *
   * HEX STOPS ONLY, deliberately. The rail below appends alpha with `dotBg + '22'`, and appending
   * to an hsl() string produces an unparseable colour that React Native renders at FULL opacity
   * with no error. theme.primary, premiumFrom and premiumTo are hex; gradientFrom is hsl and is
   * therefore NOT used here.
   */
  const dotBg = tone === 'solid' ? theme.primary : tone === 'soft' ? theme.premiumFrom : theme.premiumTo;
  return (
    <View style={styles.tlRow}>
      <View style={styles.tlRail}>
        <View style={[styles.tlDot, { backgroundColor: dotBg }]}>
          <PixelSpriteView sprite={icon} size={22} />
        </View>
        {!last && (
          <LinearGradient colors={[dotBg, dotBg + '22']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.tlBar} />
        )}
      </View>
      <View style={styles.tlBody}>
        <ThemedText type="heading" style={{ fontSize: FontSize.subhead, lineHeight: 24 }}>{title}</ThemedText>
        {sub ? <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 3, lineHeight: 19 }}>{sub}</ThemedText> : null}
      </View>
    </View>
  );
}

/** Selectable pricing tier. The highlighted tier carries a badge tab across its top edge. */
/**
 * The five differences between Free and Premium, taken VERBATIM from the owner's own web
 * pricing page (design doc refs 4 and 5) so the two surfaces cannot drift apart.
 *
 * `free` is what the free tier actually gets, and it matches the web's Basic card word for word
 * ("First lessons, games, and paper trading") rather than being talked up. Overstating the free
 * tier here would make the chart argue against the upgrade; understating it is a false claim on a
 * purchase screen, which is an App Review problem on an app that already carries an open 2.1(a).
 */
const PREMIUM_BENEFITS: readonly { label: string; free: boolean }[] = [
  { label: '12 courses, 300 lessons available now', free: false },
  { label: 'Coaching by Atlas', free: false },
  { label: 'AI market simulations', free: false },
  { label: 'Unlimited paper trading', free: false },
  { label: 'Games, streaks & leaderboards', free: true },
];

/**
 * <PremiumBenefits> — "Subscription screen needs a features list — right now it's just an image;
 * users can't tell what premium actually includes" (notes, N17) and "a chart that we've built
 * that outlines the differences between the non-Premium version and the Premium version"
 * (prompt, P6). Two reporters, one screen.
 *
 * The web renders this as a wide table with one Premium column. On a 393pt phone a full
 * side-by-side table would wrap every label to three lines, so the columns are compressed to two
 * narrow marks and the label carries the row. The INFORMATION is identical; the shape is not, and
 * that is a platform reason rather than a deviation.
 *
 * ADDED beside the trial timeline, not instead of it. That timeline is documented as set from
 * five captured competitor paywalls (C29/C31) — deleting measured work to satisfy a styling note
 * would be trading evidence for a preference.
 */
export function PremiumBenefits() {
  const theme = useTheme();
  return (
    <View style={pb.wrap}>
      <View style={pb.row}>
        <ThemedText type="label" themeColor="mutedForeground" style={pb.label}>BENEFITS</ThemedText>
        <ThemedText type="label" themeColor="mutedForeground" style={pb.col}>FREE</ThemedText>
        {/* The one place the premium ramp is allowed to speak as a word rather than a mark, and
            the web fills that word with the ramp rather than painting it a flat stop. */}
        <PremiumText type="label" style={pb.col}>PRO</PremiumText>
      </View>
      {PREMIUM_BENEFITS.map((b, i) => (
        <View
          key={b.label}
          style={[pb.row, i > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border } : null]}>
          <ThemedText type="small" maxFontSizeMultiplier={1.4} numberOfLines={2} style={pb.label}>{b.label}</ThemedText>
          <View style={pb.col}>
            {b.free
              ? <UIcon name="check" size={13} color={theme.mutedForeground} />
              : <View style={[pb.dash, { backgroundColor: theme.border }]} />}
          </View>
          <View style={pb.col}>
            {/* THREE STOPS, not two. The reference's check circles run violet at the top-left
                through magenta to orange at the bottom-right; dropping gradientFrom left them
                pink-to-orange, which is the same family as the web and visibly not the same mark. */}
            <LinearGradient
              colors={[theme.gradientFrom, theme.premiumFrom, theme.premiumTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={pb.tick}>
              <UIcon name="check" size={11} color="#fff" />
            </LinearGradient>
          </View>
        </View>
      ))}
    </View>
  );
}

const pb = StyleSheet.create({
  wrap: { marginTop: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, gap: Spacing.two },
  label: { flex: 1 },
  col: { width: 48, alignItems: 'center' },
  // a dash, not a cross: the free tier is missing this, it has not failed at it
  dash: { width: 11, height: 2, borderRadius: 1 },
  tick: { width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

/**
 * The plan card's frame: the premium ramp when chosen, an ordinary hairline when not.
 *
 * Split out rather than branched inline because a gradient border in React Native is a gradient
 * RECTANGLE with the content inset on top of it, so selected and unselected are two different
 * element trees, not two values of one prop. Wrapping that choice here keeps PlanCard's body a
 * single block instead of a duplicated one.
 *
 * `topSquared` exists because a badge sits flush on top of the card and the ramp must not round
 * away from underneath it.
 */
function PremiumBorderOrPlain({
  selected,
  radius,
  topSquared,
  style,
  children,
}: {
  selected: boolean;
  radius: number;
  topSquared: boolean;
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const ramp = usePremiumRamp();
  if (!selected) return <View style={style}>{children}</View>;
  return (
    <LinearGradient
      colors={ramp}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        padding: 1.5,
        borderRadius: radius,
        borderTopLeftRadius: topSquared ? 0 : radius,
        borderTopRightRadius: topSquared ? 0 : radius,
      }}>
      <View style={style}>{children}</View>
    </LinearGradient>
  );
}

export function PlanCard({
  selected,
  onPress,
  badge,
  title,
  sub,
  price,
  unit,
}: {
  selected: boolean;
  onPress: () => void;
  badge?: string;
  title: string;
  sub?: string;
  price: string;
  /** Billing period shown under the amount, e.g. "per year". */
  unit?: string;
}) {
  const theme = useTheme();
  return (
    <SpringPressable onPress={onPress} style={{ marginTop: Spacing.two }}>
      {badge ? (
        /*
         * THE WEB'S RAMP, not a flat fill. euphoriainv.com runs purple to pink to orange across
         * every upgrade surface, and this badge sits directly above the plan it is selling, so a
         * flat theme.primary here read as a different product to the gradient CTA below it. The
         * three stops are the palette's own gradientFrom / premiumFrom / premiumTo; no new colour
         * is introduced. The gradient IS the background, so it carries the badge's radii itself.
         */
        <LinearGradient
          colors={[theme.gradientFrom, theme.premiumFrom, theme.premiumTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.planBadge}>
          <ThemedText type="smallBold" style={{ color: '#fff', fontSize: FontSize.label, lineHeight: 15, letterSpacing: 0.8 }}>{badge}</ThemedText>
        </LinearGradient>
      ) : null}
      {/*
        * THE SELECTED CARD IS EDGED IN THE RAMP, matching euphoriainv.com's Premium price card,
        * where the chosen plan is the only one with a gradient border and the other two are plain
        * dark. It was a flat 1.5pt theme.primary, which made the selected plan read as "the violet
        * one" while the badge directly above it and the CTA directly below were both the ramp.
        * Unselected keeps its hairline border exactly as before.
        */}
      <PremiumBorderOrPlain
        selected={selected}
        radius={Radius.lg}
        topSquared={Boolean(badge)}
        style={[
          styles.plan,
          {
            /*
             * OPAQUE WHEN SELECTED. This was `theme.primary + '14'`, an 8%-alpha violet, which was
             * correct while the border was a flat stroke and became a defect the moment the frame
             * became a gradient: the ramp behind it showed straight through and the card rendered
             * as a FULL gradient fill instead of a gradient-edged dark card. Caught on device --
             * it also dropped "Works out at $6.67 a month" onto orange at unreadable contrast.
             * The web reference is explicit: gradient border, dark interior.
             */
            backgroundColor: theme.card,
            borderColor: selected ? 'transparent' : theme.border,
            borderWidth: selected ? 0 : StyleSheet.hairlineWidth,
            borderTopLeftRadius: badge ? 0 : Radius.lg,
            borderTopRightRadius: badge ? 0 : Radius.lg,
          },
        ]}>
        <View style={[styles.planRadio, { borderColor: selected ? theme.primary : theme.border, backgroundColor: selected ? theme.primary : 'transparent' }]}>
          {selected ? <UIcon name="check" size={12} color="#fff" /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="heading" style={{ fontSize: FontSize.bodyLg, lineHeight: 22 }}>{title}</ThemedText>
          {sub ? <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>{sub}</ThemedText> : null}
        </View>
        {/* price stacked over its billing period: the amount is what you are charged, the unit
            says how often, so annual and monthly are never both reading as "/mo" */}
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="heading" style={{ fontSize: FontSize.subhead, lineHeight: 24 }}>{price}</ThemedText>
          {unit ? <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 1 }}>{unit}</ThemedText> : null}
        </View>
      </PremiumBorderOrPlain>
    </SpringPressable>
  );
}

export function BackChevron({ onPress }: { onPress?: () => void }) {
  const theme = useTheme();
  /*
   * NO onPress => NO CONTROL, just the space one would occupy.
   *
   * Reported 2026-08-22: "Back arrow doesn't work on the 'How much do you already know?' screen.
   * (Also: do we even need a back button here?)" That screen is step 0, where onboarding's `back`
   * returned undefined — but this still rendered a full SpringPressable that highlighted on touch
   * and announced itself to VoiceOver as the button "Back". A control that looks live, feels live,
   * answers to a screen reader and does nothing is worse than no control; the reporter read it as
   * broken rather than absent, which is precisely right.
   *
   * The placeholder keeps the progress segments in the same place, so hiding the chevron does not
   * shift the header on the screens that have no way back.
   */
  if (!onPress) return <View style={styles.chevron} />;
  // The chevron is a bare SVG path, so without a role and label VoiceOver announces "button" and
  // nothing else — the one control that gets a user OUT of onboarding was unnamed.
  return (
    <SpringPressable
      haptic={false}
      onPress={onPress}
      style={styles.chevron}
      scaleTo={0.85}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Back">
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path d="M14.5 5 8 12l6.5 7" stroke={theme.mutedForeground} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </SpringPressable>
  );
}

function Segment({ fill, color, track }: { fill: number; color: string; track: string }) {
  const reduced = useReducedMotion();
  const w = useSharedValue(reduced ? fill : 0);
  useEffect(() => {
    w.set(reduced ? fill : withSpring(fill, Spring.gentle));
  }, [fill, reduced, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.get() * 100}%` }));
  return (
    <View style={[styles.seg, { backgroundColor: track }]}>
      <Animated.View style={[styles.segFill, { backgroundColor: color }, style]} />
    </View>
  );
}

export function ProgressHeader({ step, total, onBack }: { step: number; total: number; onBack?: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.progressRow}>
      <BackChevron onPress={onBack} />
      {/*
        * ONE BAR, NOT THREE.
        *
        * It used to be three segments each filled by `((step+1)/total)*3 - i`, so the whole bar
        * was really one value cut into thirds. That reads as three chapters the flow does not
        * have — nothing in onboarding is grouped in threes — and it makes a single step look
        * like a third of the journey on the screen where it lands at a boundary.
        *
        * One continuous fill of (step+1)/total: at 14 steps every screen is ~7.1% and the bar
        * says exactly what it means. The two gaps are gone with the segments, so the bar also
        * gets the full width back.
        */}
      <View style={styles.segRow}>
        <Segment fill={Math.max(0, Math.min(1, (step + 1) / total))} color={theme.primary} track={theme.muted} />
      </View>
    </View>
  );
}

/**
 * MULTI-SELECT INDICATOR.
 *
 * The multi steps rendered the same RadioDot as the single ones, so a screen that said "Pick as
 * many as you like" showed nine radio buttons under it. A circle is the platform's word for
 * mutually exclusive, and people stop after one pick when they see one — which quietly thinned
 * `topics`, the one answer where the learner names the subject directly.
 *
 * A square that fills and takes a tick is the other half of that vocabulary.
 */
function CheckBox({ selected }: { selected: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.checkBox,
        {
          borderColor: selected ? theme.primary : theme.border,
          backgroundColor: selected ? theme.primary : 'transparent',
          borderWidth: selected ? 0 : 1.5,
        },
      ]}>
      {selected ? <UIcon name="check" size={14} color={theme.background} /> : null}
    </View>
  );
}

export function RadioDot({ selected }: { selected: boolean }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const fill = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    fill.set(reduced ? (selected ? 1 : 0) : withSpring(selected ? 1 : 0, Spring.bouncy));
  }, [selected, reduced, fill]);
  const inner = useAnimatedProps(() => ({ r: 5.5 * fill.get() }));
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} stroke={selected ? theme.primary : theme.border} strokeWidth={2} fill="none" />
      <AnimatedCircle cx={12} cy={12} fill={theme.primary} animatedProps={inner} />
    </Svg>
  );
}

export function OptionCard({
  icon,
  title,
  sub,
  selected,
  onPress,
  compact = false,
  roomy = false,
  multi = false,
}: {
  /** Omit for text-only choices (attribution, age band) — the icon bubble is then dropped. */
  icon?: PixelSprite;
  title: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
  /** Tighter row for long lists, where a full icon+subtitle card would swamp the screen. */
  compact?: boolean;
  /** Multi-select: draw a checkbox, because a radio dot tells the user to pick only one. */
  multi?: boolean;
  /*
   * Taller row for SHORT lists. Measured on this iPhone 17 Pro (402x874) from real captures:
   *
   *   3 options (experience)   content ends y=553  ->  321pt dead   (37% of the screen)
   *   4 options (horizon)      content ends y=579  ->  295pt dead
   *   5 options (blockers)     content ends y=796  ->   78pt dead
   *   9 options (topics)       content ends y=796  ->   78pt dead
   *
   * The last two are the binding constraint and must not grow — 78pt is one card's worth of
   * slack. So this is gated on COUNT, never applied globally: the screens that are already full
   * stay exactly as they are, and only the ones with a third of the viewport empty get taller.
   */
  roomy?: boolean;
}) {
  const theme = useTheme();
  /*
   * NO SCALE POP ON SELECT. This used to run
   *   withSequence(withSpring(1.035, Spring.bouncy), withSpring(1, Spring.smooth))
   * so tapping an option grew it to 1.035 -- and Spring.bouncy is zeta 0.72, which overshoots a
   * further ~4% -- reaching roughly 1.076 before shrinking back to 1. Grow-then-shrink on every
   * tap is what the owner described as "click something and it becomes huge and becomes small",
   * and it was REDUNDANT: `fill` and the border already animate to show selection, so the scale
   * carried no information the row was not already conveying.
   *
   * The press itself still has feedback -- SpringPressable scales to 0.97 under the finger,
   * which is a 3% inward move bound to the touch rather than an outward pop after it.
   */
  return (
    <SpringPressable onPress={onPress} style={{ marginBottom: Spacing.two + 4 }}>
      <Animated.View
        style={[
          styles.option,
          compact && styles.optionSm,
          roomy && styles.optionLg,
          {
            backgroundColor: selected ? theme.primary + '14' : theme.card,
            borderColor: selected ? theme.primary : theme.border,
            borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
          },
        ]}>
        {icon ? (
          <View style={[styles.bubble, compact && styles.bubbleSm, roomy && styles.bubbleLg, { backgroundColor: theme.primary + '1F' }]}>
            <PixelSpriteView sprite={icon} size={compact ? 18 : roomy ? 40 : 22} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <ThemedText
            type="heading"
            style={roomy
              ? { fontSize: FontSize.subhead, lineHeight: 24 }
              : { fontSize: FontSize.body, lineHeight: 21 }}>{title}</ThemedText>
          {sub && !compact ? (
            /*
             * NOT mutedForeground, and this is the one sub in the file that earns the exception.
             *
             * mutedForeground is not a contrast failure — measured 7.05:1 on the card, which
             * clears WCAG AAA. The problem is register. `text` runs 16.57:1, muted runs 7.05,
             * and muted is used 382 times across 76 files, so the app's DEFAULT voice is its
             * secondary one and nothing ever reads as spoken at full volume.
             *
             * On an option card the sub is not metadata about the choice, it IS the choice:
             * "Total beginner" is a label, "I'm starting from zero" is the sentence a user
             * recognises themselves in. Putting the recognisable half in the aside voice while
             * the generic half gets the confident one is exactly backwards.
             *
             * 0.78 rather than a new token: it lands between the two existing values instead of
             * adding a third colour to a system that already has 382 call sites for this one.
             */
            <ThemedText type="small" style={roomy
              ? { marginTop: 3, opacity: 0.78, fontSize: FontSize.bodySm, lineHeight: 20 }
              : { marginTop: 2, opacity: 0.78 }}>{sub}</ThemedText>
          ) : null}
        </View>
        {multi ? <CheckBox selected={selected} /> : <RadioDot selected={selected} />}
      </Animated.View>
    </SpringPressable>
  );
}

/*
 * THE CURVES, AS FRACTIONS OF THE PLOT BOX.
 *
 * They used to be literal coordinates inside a fixed `viewBox="0 0 300 150"` with `height={150}`,
 * which is what pinned this chart to a 150pt band no matter how much room the screen had. Measured
 * on an iPhone 17 (402x874) on 2026-09-15: the plot ran y 371 to 544 and then 177pt of nothing sat
 * between the legend and Continue. The chart WAS the screen and it was the smaller half of it.
 *
 * Expressed as fractions, the same shape draws at any size the layout hands it. The numbers are the
 * originals divided by 300 and 150, so the curve is the one that shipped, not a redraw.
 */
const CURVE = {
  /** The x-axis, and the two gridlines above it. */
  axis: 0.9867,
  grid: [0.6667, 0.3467],
  /** Occasional practice: a shallow, nearly flat climb. */
  without: 'M {0.0267 0.9333} C {0.3667 0.88} {0.7 0.8267} {0.9733 0.7467}',
  /** Daily practice: the S-curve, two cubic segments. */
  with: 'M {0.0267 0.9467} C {0.3 0.92} {0.5 0.72} {0.6667 0.44} C {0.7733 0.2667} {0.8733 0.1467} {0.96 0.0933}',
  /** Where the end dot lands, which is the terminus of the `with` curve. */
  dot: [0.96, 0.0933],
} as const;

/**
 * The plot's height bounds.
 *
 * MIN is exactly the height this chart used to be, so the smallest device can never come out of
 * this change worse than it went in: on an iPhone SE the plot holds at 150 and the ScrollView the
 * step already lives in takes care of the overflow.
 *
 * MAX stops the other end. `flexGrow` with no ceiling would hand the chart every spare point on a
 * tall device, and a 500pt growth curve stops reading as a chart and starts reading as wallpaper.
 * 300 keeps it the biggest thing on the screen without letting it become the only thing.
 */
const CHART_MIN_H = 150;
const CHART_MAX_H = 300;

/** Window height at or above which a statement step centres its evidence. See StatementStep. */
const STATEMENT_CENTRE_MIN_H = 720;

/** Substitutes the fractional pairs in a template with real coordinates for this box. */
function scalePath(template: string, w: number, h: number): string {
  return template.replace(/\{([\d.]+) ([\d.]+)\}/g, (_m, fx: string, fy: string) =>
    `${(Number(fx) * w).toFixed(1)} ${(Number(fy) * h).toFixed(1)}`);
}

/** Daily practice vs occasional practice growth curves — both DRAW ON left→right. */
export function GrowthChart({ delay = 0 }: { delay?: number }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  /*
   * MEASURED, not assumed. The plot fills whatever the flex chain leaves it, so its size is only
   * known after layout. Until then there is nothing to draw: rendering at a guessed size and then
   * re-rendering at the real one would run the whole draw-on animation twice, which reads as a
   * glitch rather than as a chart being drawn.
   */
  const [box, setBox] = useState({ w: 0, h: 0 });
  const measured = box.w > 0 && box.h > 0;
  /*
   * The dash sweep has to be at least as long as the path it hides, and the path is now as long as
   * the box makes it. A constant would under-reach on a tall device and leave the curve partly
   * drawn at rest. The perimeter is a cheap over-estimate that is always safe.
   */
  const len = (box.w + box.h) * 2;
  const withCurve = useSharedValue(0);
  const withoutCurve = useSharedValue(0);
  const dot = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (!measured) return;
    if (reduced) {
      // The instant path: both curves fully drawn, the dot already landed. Reduced Motion asks for
      // no movement, not for less chart.
      withCurve.set(0);
      withoutCurve.set(0);
      dot.set(1);
      return;
    }
    withCurve.set(len);
    withoutCurve.set(len);
    dot.set(0);
    // `delay` lets the caller line the draw-on up with the step's stagger instead of
    // racing it. Draw durations stay chart-specific; only the easing is tokenised.
    withoutCurve.set(withDelay(delay + Duration.fast, withTiming(0, { duration: 700, easing: Ease.outCubic })));
    withCurve.set(withDelay(delay + Duration.slow, withTiming(0, { duration: 1000, easing: Ease.outCubic })));
    dot.set(withDelay(delay + 1250, withTiming(1, { duration: Duration.base, easing: Ease.enter })));
  }, [reduced, delay, measured, len, withCurve, withoutCurve, dot]);

  const withProps = useAnimatedProps(() => ({ strokeDashoffset: withCurve.get() }));
  const withoutProps = useAnimatedProps(() => ({ strokeDashoffset: withoutCurve.get() }));
  const dotProps = useAnimatedProps(() => ({ opacity: dot.get(), r: 5 * dot.get() }));

  return (
    <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: FontSize.label, lineHeight: 15 }}>Skill</ThemedText>
      {/* The plot claims the leftover height between the two axis labels. The viewBox is set to the
          MEASURED point size, so one user unit is one point in both directions and every stroke
          width below means what it says at any chart height. */}
      <View
        style={styles.chartPlot}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setBox((b) => (Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1 ? b : { w: width, h: height }));
        }}>
        {measured ? (
          <Svg width={box.w} height={box.h} viewBox={`0 0 ${String(box.w)} ${String(box.h)}`}>
            <Line x1={0} y1={CURVE.axis * box.h} x2={box.w} y2={CURVE.axis * box.h} stroke={theme.border} strokeWidth={1} />
            {CURVE.grid.map((g) => (
              <Line key={g} x1={0} y1={g * box.h} x2={box.w} y2={g * box.h} stroke={theme.border} strokeWidth={0.5} />
            ))}
            {/* without practice — shallow dashed (note: dashArray is used for the draw sweep, not visual dashes) */}
            <AnimatedPath d={scalePath(CURVE.without, box.w, box.h)} stroke={theme.mutedForeground} strokeWidth={2} fill="none" strokeLinecap="round" strokeDasharray={len} animatedProps={withoutProps} opacity={0.6} />
            {/* with Euphoria — S-curve draws on */}
            <AnimatedPath d={scalePath(CURVE.with, box.w, box.h)} stroke={theme.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={len} animatedProps={withProps} />
            <AnimatedCircle cx={CURVE.dot[0] * box.w} cy={CURVE.dot[1] * box.h} fill={theme.primary} animatedProps={dotProps} />
          </Svg>
        ) : null}
      </View>
      {/*
        * "Time" BELONGS TO THE AXIS, not to the legend.
        *
        * Reported 2026-08-23: "the x-axis 'time' label needs to move — it's currently under the
        * words and looks weird. It should be on the right side of the axis instead."
        *
        * Right, and the cause was ORDERING, not alignment. This sat AFTER `chartLabels`, so the
        * two-line legend ("Ten minutes a day" / "Now and then") came between the label and
        * the axis it describes. `alignSelf: flex-end` was already putting it on the right — the
        * horizontal position was never the problem.
        *
        * It now sits immediately under the axis at its right end, where an x-axis label goes, and
        * the legend follows beneath both.
        *
        * NOTE: the audit files this under "first lesson". It is actually onboarding step 3,
        * `The habit is what makes it stick` (onboarding.tsx). Same screen, different place than
        * reported — worth knowing before hunting for it in the lesson runner.
        */}
      <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: FontSize.label, lineHeight: 15, alignSelf: 'flex-end' }}>Time</ThemedText>
      <View style={styles.chartLabels}>
        {/* iconLilac, not primary. This is 13px semibold, which is NOT "large text" under WCAG,
            so it needs 4.5:1 - and primary measures 4.48:1 on `card`. iconLilac is the palette's
            violet meant for text on dark and measures 8.26:1. The chart stroke and dot above stay
            primary: they are graphical, judged at 3:1, and pass. Same call as digest.tsx. */}
        {/*
          * THE CURVES LABEL THE HABIT, NOT THE PRODUCT.
          *
          * They read "With Euphoria" / "Without daily practice", and the gap between them is
          * roughly 4x. That is the SAME claim the copy on this step was rewritten to remove —
          * see the note on the statement entry in onboarding.tsx: "The old copy promised
          * '4x faster' with nothing behind it — an unsubstantiated performance claim inside a
          * paid finance funnel." The text went; the graph that drew it louder stayed.
          *
          * A chart asserts a magnitude the reader absorbs without arguing, so an unlabelled
          * 4x gap attributed to a named product is the stronger version of the claim, not a
          * softer one. Same exposure the PROOF block already guards against: App Store 2.3.1
          * (no misleading metadata) and FTC 16 CFR Part 465 (2024).
          *
          * Relabelled to compare PRACTICE FREQUENCIES. Compounding from consistent practice is
          * a general property of learning, not a performance figure for this app, and it is
          * what the headline above already says. Identical curves, identical motivation, and
          * nothing asserted that cannot be stood behind.
          */}
        <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>Ten minutes a day</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground">Now and then</ThemedText>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Step archetypes. Every onboarding screen is one of these, so density and
 * rhythm stay identical across the flow — one idea per screen, big heading,
 * generous spacing. This consistency is the fix for "the paywall looks overdone":
 * the paywall isn't too rich, the rest were too thin.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * `icon` is a SPRITE, not a UIcon name. These are content marks — a wallet beside "Grow my
 * wealth", a seedling beside "Total beginner" — on the first screens anyone sees, and they were
 * the last vector art in a flow the rest of the app no longer matches. Typing it as PixelSprite
 * rather than a string key means a choice added without art will not compile.
 */
export type Choice = { key: string; title: string; sub?: string; icon?: PixelSprite };

/**
 * `speech` puts the line in Atlas's mouth instead of setting it as a page title.
 *
 * WHY: screen audit (`refs/audit/20260810/FINDINGS.md`, ONBOARDING), 4/4 of the apps checked frame
 * their onboarding quiz as a CONVERSATION with a character — Duolingo with Duo (uniqueness 8), Speak
 * with its AI tutor (9), Learna the same (8), Solid Starts with named experts (9). This flow already
 * had the character and the reactions: every STEPS entry carries a `face`, so Atlas is `watching`
 * for the experience question and `whoa` for the 20%-drop one. He reacted per question and never
 * asked one. The gap was framing, not assets.
 *
 * ONLY QUESTIONS, NOT STATEMENTS. A statement step carries a chart or a proof block beneath it;
 * those are the app telling you something, and a speech bubble with a chart hanging off it is a
 * different, worse idea. `speech` is opt-in and the statement path does not pass it.
 *
 * The bubble types at 26ms/char, so a 40-character question takes about a second before it can be
 * read. That is a real cost on a ten-question flow, taken deliberately because it is the mechanism
 * the comparators converge on — and `useReducedMotion` renders it instantly for anyone who has
 * asked the OS for less movement.
 */
export function StepHeading({ title, sub, speech }: { title: string; sub?: string; speech?: boolean }) {
  return (
    <View style={[styles.stepHead, speech && styles.stepHeadSpeech]}>
      {speech ? (
        <AtlasSpeech text={title} tail="top" tailAlign="center" maxWidth={352} textStyle={styles.stepQSpeech} />
      ) : (
        <ThemedText type="display" style={styles.stepQ}>{title}</ThemedText>
      )}
      {sub ? (
        /*
         * CENTRED UNDER A BUBBLE, LEFT-ALIGNED WITHOUT ONE.
         *
         * The sub was always full-width left-aligned while `speech` centres the bubble above it,
         * so on every conversational step the reassurance sat visually adrift — the right words
         * belonging to nobody. Reported on riskComfort, where the line ("There's no wrong
         * answer") is doing the most work of any sub in the flow and looked the most abandoned.
         *
         * Alignment, not a new element: under a bubble this is Atlas still talking, so it tracks
         * him. The statement steps keep the left-aligned display heading and its left sub.
         */
        <ThemedText
          type="body"
          themeColor="mutedForeground"
          style={[styles.stepSub, speech && styles.stepSubSpeech]}>{sub}</ThemedText>
      ) : null}
    </View>
  );
}

export function SingleSelectStep({
  question,
  sub,
  options,
  value,
  onChange,
  compact,
}: {
  question: string;
  sub?: string;
  options: Choice[];
  value: string | null;
  onChange: (key: string) => void;
  compact?: boolean;
}) {
  return (
    <>
      <StepHeading title={question} sub={sub} speech />
      <View style={styles.stepOptions}>
        {options.map((o, i) => (
          <RiseIn key={o.key} delay={childDelay(i)}>
            <OptionCard
              icon={o.icon}
              title={o.title}
              sub={o.sub}
              compact={compact ?? options.length > 4}
              roomy={options.length <= 4}
              selected={value === o.key}
              onPress={() => onChange(o.key)}
            />
          </RiseIn>
        ))}
      </View>
    </>
  );
}

export function MultiSelectStep({
  question,
  sub,
  options,
  values,
  onToggle,
}: {
  question: string;
  sub?: string;
  options: Choice[];
  values: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <>
      {/* No default sub. "Pick as many as you like." sat OUTSIDE the bubble in mutedForeground,
          belonging to neither Atlas nor the options, and the checkbox now says it without words. */}
      <StepHeading title={question} sub={sub} speech />
      <View style={styles.stepOptions}>
        {options.map((o, i) => (
          <RiseIn key={o.key} delay={childDelay(i)}>
            <OptionCard
              icon={o.icon}
              title={o.title}
              sub={o.sub}
              multi
              compact={options.length > 4}
              selected={values.includes(o.key)}
              onPress={() => onToggle(o.key)}
            />
          </RiseIn>
        ))}
      </View>
    </>
  );
}

/**
 * A screen that asserts rather than asks — the beats that break up the questions.
 *
 * ── IT USES ITS HEIGHT NOW ──────────────────────────────────────────────────────────────────
 * This was a bare fragment, so it top-packed inside a ScrollView whose content container is
 * `justifyContent: flex-start` and stranded everything left over at the bottom. Measured on an
 * iPhone 17 (402x874) on 2026-09-15, both statement screens in the flow had a hole in them:
 *
 *   step 4  "The habit is what makes it stick"   legend ended y=585, Continue began y=762  -> 177pt
 *   step 8  "Everything you need to start"       last card ended y=627, Continue at y=762  -> 135pt
 *
 * For comparison, the reveal step ends at y=743 against the same y=762 button, because it is the
 * one step onboarding.tsx marks `fillsViewport`. The mechanism already existed and had simply
 * never been extended to the statement archetype. It is now, in both places.
 *
 * THE HEADING STAYS PUT and only the BODY grows. A statement is a headline with evidence under it,
 * so pushing the headline down to centre the whole block would cost the screen its anchor. The
 * body claims the leftover height instead:
 *   - a child that can grow (the chart) fills it and becomes the hero of the screen
 *   - a child that cannot (the three proof cards) is centred in it, which splits the old hole
 *     evenly above and below rather than dumping all of it at the bottom
 * One rule, two correct outcomes, and no spacer anywhere.
 */
export function StatementStep({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  /*
   * The height threshold for centring, and it is a measurement rather than a taste.
   *
   * The proof block is the tallest thing a statement carries: three cards at roughly 280pt, under
   * a two-line headline, under the 99pt Atlas stage, over a 62pt pinned button. On a 667pt SE that
   * already adds up to more than the viewport, so there is no slack and centring can only push the
   * last card under the button. On the 874pt iPhone 17 there was 135pt spare, which is the hole
   * this whole change is about.
   *
   * 720 sits between the two with room either side: every modern iPhone except the SE class clears
   * it, and the SE class keeps the top-packed layout that has always fitted it.
   */
  const { height } = useWindowDimensions();
  const roomToCentre = height >= STATEMENT_CENTRE_MIN_H;
  return (
    <View style={styles.statementBody}>
      <StepHeading title={title} sub={sub} />
      {children ? (
        <View style={[styles.statementContent, roomToCentre && styles.statementCentre]}>{children}</View>
      ) : null}
    </View>
  );
}

/**
 * "Building your plan" — a determinate ring plus rotating status lines. Determinate on
 * purpose: an indeterminate spinner reads as "loading", while a filling ring reads as
 * work being done on your behalf, which is the point of the beat.
 */
export function LoaderStep({ lines, onDone }: { lines: string[]; onDone: () => void }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const p = useSharedValue(0);
  const [i, setI] = useState(0);
  const R = 46;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    if (reduced) {
      p.set(1);
      onDone();
      return;
    }
    const total = Duration.count * 3; // 2700ms — long enough to feel considered, not stalled
    p.set(withTiming(1, { duration: total, easing: Ease.inOut }));
    const per = total / lines.length;
    const tick = setInterval(() => setI((n) => Math.min(n + 1, lines.length - 1)), per);
    const finish = setTimeout(onDone, total + Duration.base);
    return () => {
      clearInterval(tick);
      clearTimeout(finish);
    };
    // mount-only: re-running would restart the plan build mid-flight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ring = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - p.get()) }));

  return (
    <View style={styles.loaderWrap}>
      <Svg width={R * 2 + 12} height={R * 2 + 12} viewBox={`0 0 ${R * 2 + 12} ${R * 2 + 12}`}>
        <Circle cx={R + 6} cy={R + 6} r={R} stroke={theme.muted} strokeWidth={6} fill="none" />
        <AnimatedCircle
          cx={R + 6}
          cy={R + 6}
          r={R}
          stroke={theme.primary}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          animatedProps={ring}
          // start the sweep at 12 o'clock rather than 3
          transform={`rotate(-90 ${R + 6} ${R + 6})`}
        />
      </Svg>
      <ThemedText type="display" style={styles.loaderTitle}>Building your plan</ThemedText>
      <ThemedText type="body" themeColor="mutedForeground" style={styles.loaderLine}>{lines[i]}</ThemedText>
    </View>
  );
}

/** The payoff: the answers become a named, ordered path of REAL courses. */
export function PlanRevealStep({
  tierLabel,
  picks,
  perDay,
  weeks,
}: {
  tierLabel: string;
  /** Each course PLUS the answer that earned it its slot — see recommendPathDetailed. */
  picks: { course: { id: string; title: string; totalLessons: number }; reason: string }[];
  perDay: number;
  weeks: number;
}) {
  const theme = useTheme();
  const totalLessons = picks.reduce((n, x) => n + x.course.totalLessons, 0);
  return (
    // Spread across the leftover viewport height instead of packing to the top — the stats used
    // to sit directly under the last course card with a dead band beneath them.
    <View style={styles.planBody}>
      {/* "a advanced track" — tierLabel is data, so the article has to agree with it. */}
      <StepHeading
        title="Your path is ready"
        sub={`Tuned for ${/^[aeiou]/i.test(tierLabel) ? 'an' : 'a'} ${tierLabel} track, ${perDay} lesson${perDay === 1 ? '' : 's'} a day.`}
      />
      {/*
        * PROMOTED from the bottom of the screen.
        *
        * ScreensDesign, "plan is ready" screens at $550k-$1M/mo (Praktika 121966, BetterMe
        * 125522, BitePal 178415, Astra 323504): 3 of 4 make the forward projection the visual
        * centrepiece, and 4 of 4 put a block reflecting the user's own answers near the TOP.
        * None of them ends on the outcome in bare digits.
        *
        * This screen already had the right content in the wrong order: the course catalogue led,
        * and the commitment the user is actually agreeing to - how much, how long - was two loose
        * numerals under a hairline at the very bottom. Same numbers, given the weight they earn.
        */}
      <View style={[styles.planSummary, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.planStat}>
          <NumberRollup value={totalLessons} type="display" style={{ color: theme.primary }} />
          <ThemedText type="small" themeColor="mutedForeground">lessons</ThemedText>
        </View>
        <View style={[styles.planDivider, { backgroundColor: theme.border }]} />
        <View style={styles.planStat}>
          <NumberRollup value={weeks} type="display" style={{ color: theme.primary }} />
          <ThemedText type="small" themeColor="mutedForeground">weeks</ThemedText>
        </View>
      </View>
      <View style={{ marginTop: Spacing.three }}>
        {picks.map(({ course: c, reason }, i) => {
          // Every course now carries its OWN identity. The app already ships `courseAccent`
          // (12 distinct hues) and `LessonArt` (a per-course gradient mark) — Home uses both for
          // its hero — but this screen rendered all three rows in the same `theme.card` grey and
          // differentiated them with nothing but a small numbered circle. That is what made the
          // payoff screen read as bland: the moment the path is revealed, the path looked
          // generic.
          //
          // Hierarchy is explicit rather than incidental: course 1 is the one actually starting,
          // so it takes the tinted card, the larger mark, and the `description` that was already
          // being passed into this component and thrown away.
          // Plain View, not RewardPop. Three cards popping in on a stagger read as parts
          // arriving separately rather than a plan being revealed. RewardPop is the EARNED
          // gesture — same reasoning that cut Atlas's vertical travel from 28pt to 2.0pt:
          // spend the reward motion on rewards or it stops meaning anything. The step already
          // crossfades in as a unit via bodyOpacity, so the rows need no entrance of their own.
          const accent = courseAccent(c.id);
          const lead = i === 0;
          return (
            <View key={c.id} style={{ marginBottom: Spacing.two }}>
              <View
                style={[
                  styles.planRow,
                  lead && styles.planRowLead,
                  {
                    backgroundColor: lead ? `${accent}14` : theme.card,
                    borderColor: lead ? `${accent}59` : theme.border,
                  },
                ]}>
                <LessonArt courseId={c.id} title={c.title} index={0} size={lead ? 58 : 40} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="label" style={{ color: accent, marginBottom: 2 }}>
                    {lead ? 'START HERE' : `${c.totalLessons} LESSONS`}
                  </ThemedText>
                  <ThemedText type="heading" style={{ fontSize: lead ? 18 : 16, lineHeight: lead ? 23 : 21 }}>
                    {c.title}
                  </ThemedText>
                  {/* The reason is the whole point: it is drawn from the user's OWN answers, so
                      the path stops looking like three courses that fell out of the sky. Shown
                      on every row, not just the lead — the ranking is only legible if each
                      slot explains itself. */}
                  {/* Lifted from `small` to `body`. This is the user's OWN answer quoted back,
                      which is the 4/4 pattern across the pulled references - it was the strongest
                      content on the screen rendered in its smallest type. */}
                  <ThemedText
                    type="body"
                    themeColor="mutedForeground"
                    style={{ marginTop: 3, fontSize: FontSize.smallPlus, lineHeight: 19 }}
                    numberOfLines={2}>
                    {reason}
                  </ThemedText>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function Stars({ count = 5 }: { count?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Svg key={i} width={18} height={18} viewBox="0 0 24 24">
          <Path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8z" fill="#FBBF24" />
        </Svg>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // flex-end parks the mascot at the bottom so its whole -ATLAS_RISE exit stays in bounds.
  atlasStage: { height: ATLAS_STAGE_H, alignItems: 'center', justifyContent: 'flex-end' },
  // trial timeline — the rail column is fixed-width so every title starts on the same x
  tlRow: { flexDirection: "row", gap: Spacing.two + 2 },
  tlRail: { width: 38, alignItems: 'center' },
  tlDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  tlBar: { width: 3, flex: 1, borderRadius: Radius.hairline, marginTop: 2, minHeight: 14 },
  tlBody: { flex: 1, paddingBottom: Spacing.three },
  plan: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.three + 4, borderRadius: Radius.lg },
  // sits flush on the card's top edge, which squares off its top corners
  planBadge: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 5, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  planRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  chevron: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  segRow: { flex: 1, flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 7, borderRadius: Radius.chipLg, overflow: 'hidden' },
  segFill: { height: 7, borderRadius: Radius.chipLg },
  track: { flex: 1, height: 6, borderRadius: Radius.chip, overflow: 'hidden' },
  fill: { height: 6, borderRadius: Radius.chip },
  option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.three, borderRadius: Radius.lg },
  optionSm: { paddingVertical: Spacing.two, gap: Spacing.two },
  bubble: { width: 46, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  bubbleSm: { width: 34, height: 34 },
  checkBox: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  /*
   * HEIGHT FROM CONTENT, NOT FROM AIR.
   *
   * The first pass at this bought height with padding alone: +14pt a side around a 56pt bubble
   * holding a 28pt sprite. The cards filled the screen and measured correctly — 321pt of dead
   * space down to 226 — and looked inflated, because roughly two thirds of each card was empty.
   * A 28pt icon centred in a 56pt bubble also reads as an empty plate, and the slack inside the
   * bubble is what made the gap to the text look wide.
   *
   * So the padding comes back down (30 -> 22) and the difference is paid for by content: the
   * sprite fills its bubble (28 -> 40 in 60), the title steps body -> subhead, the sub steps
   * small -> bodySm. Slightly shorter cards than the inflated pass, with the content share up
   * from ~48% to ~58% of the card.
   */
  optionLg: { paddingVertical: Spacing.three + 6 },
  bubbleLg: { width: 60, height: 60 },
  // one idea per screen: the heading owns the top of the viewport, options sit well below it
  stepHead: { marginTop: Spacing.two },
  // Centred: the bubble hangs from Atlas, who is centred in the persistent stage above.
  stepHeadSpeech: { alignItems: 'center' },
  // 18pt, not the bubble's default 15. Still well below `display`, which is the trade the
  // conversational framing costs — a question Atlas asks is a line of dialogue, not a headline.
  stepQSpeech: { fontSize: FontSize.subhead, lineHeight: 25 },
  stepQ: { textAlign: 'left', lineHeight: 34 },
  stepSub: { marginTop: Spacing.two, lineHeight: 21 },
  stepSubSpeech: { textAlign: 'center', paddingHorizontal: Spacing.two },
  stepOptions: { marginTop: Spacing.four },
  loaderWrap: { alignItems: 'center', paddingTop: Spacing.four },
  loaderTitle: { marginTop: Spacing.four, textAlign: 'center' },
  loaderLine: { marginTop: Spacing.two, textAlign: 'center' },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  /** Course 1 only: a real border (not a hairline) so the accent tint reads as deliberate. */
  planRowLead: { borderWidth: 1, alignItems: 'flex-start' },
  /** Heading / course list / stats, spread across whatever height is left over. */
  planBody: { flexGrow: 1, justifyContent: 'space-between', gap: Spacing.two, paddingBottom: Spacing.two },
  /** Opens the flex chain from the step down to its body. Paired with `fillsViewport` in
   *  onboarding.tsx, which is what gives this height to claim in the first place. */
  statementBody: { flexGrow: 1 },
  /** The evidence under the headline. `center` is the fallback for content that cannot grow;
   *  anything with its own flexGrow (the chart) fills this instead and centring becomes moot.
   *
   *  NO paddingBottom HERE. The step's ScrollView already pads its content container, and adding a
   *  second one pushed the last proof card past the pinned Continue on an iPhone SE. See
   *  `statementCentre` for why the centring itself is conditional. */
  statementContent: { flexGrow: 1, flexShrink: 1, marginTop: Spacing.three },
  /**
   * CENTRING IS ONLY SAFE WHEN THERE IS SLACK TO CENTRE IN.
   *
   * Flexbox `center` has no safe variant in React Native: when the content is TALLER than the box,
   * it overflows equally in both directions instead of pinning to the start, and the half that
   * goes up is the half you cannot scroll back to.
   *
   * The short screen has no slack to give. Measured on an iPhone SE (375x667) on 2026-09-15, the
   * proof step's three cards already run to y=604 against a Continue pinned at y=589 with NO
   * centring at all: an A/B on the device against the pre-change layout produced byte-identical
   * frames, so that underlap is a pre-existing defect of that screen and not something centring
   * introduced. What matters here is that centring must not be allowed to make it worse.
   *
   * So a statement centres its evidence only where there is room, and top-packs everywhere else,
   * which is exactly the layout the small screen had before and measured identically after. The
   * tall screen gets the balance; the short screen is left precisely as it was found.
   */
  statementCentre: { justifyContent: 'center' },
  planSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.four,
    marginTop: Spacing.three, paddingVertical: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  planStat: { alignItems: 'center' },
  planDivider: { width: StyleSheet.hairlineWidth, height: 34 },
  /*
   * THE CHART IS NOW THE HERO OF ITS SCREEN, not a band inside it.
   *
   * `flexGrow` is what claims the 177pt that used to sit empty between the legend and Continue on
   * an iPhone 17. `flexShrink` is its other half and matters more on a small device: on an SE the
   * card gives height back rather than pushing the legend off the bottom, and the step's own
   * ScrollView takes whatever is still over.
   *
   * `maxHeight` is the ceiling, and it is on the CARD rather than the plot so the two axis labels
   * and the legend are inside the bound. Beyond it the parent's `justifyContent: center` takes
   * over and the extra space splits evenly above and below, which is a balanced screen rather
   * than a bottom-heavy one.
   */
  chartCard: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.one,
    flexGrow: 1, flexShrink: 1, maxHeight: CHART_MAX_H + 96 },
  /** The plot itself: everything the card has left after Skill, Time and the legend. */
  chartPlot: { flexGrow: 1, flexShrink: 1, minHeight: CHART_MIN_H, maxHeight: CHART_MAX_H },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
});
