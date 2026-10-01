/**
 * StreakIgnite — the app's first EARNED moment: "Atlas catches fire".
 *
 * WHY THIS EXISTS. Duration.earned (3200ms) is Duolingo's measured streak-ignite length. Before it,
 * the longest payoff anywhere in the app was 267ms: over before the user registered it started.
 *
 * REBUILT THREE TIMES on 2026-09-23. The audit rebuild (motion-audits/euphoria-native-2026-09-23.html)
 * fixed the curves but kept two actors: a flame that burst and an Atlas beside it that reacted.
 * Owner verdict: "it's just two objects (Atlas and a flame) trying to connect to each other."
 * Round 3 made the flame his child but sat it on his head like a candle (~25% base overlap).
 * Round 4 widened it, but it was still ONE flat cone: review read it as a party hat, measured the
 * hero at ~34% of the screen width, and the ember at ~18pt read as a spark. Round 5 (this one)
 * redraws the fire as a multi-tongue body that wraps his head and upper rings, grows him to
 * 240pt, and throws a 30pt-wide flame, not a dot.
 *
 * Round 6 (owner: "there's issues with the flame, make it aesthetic") redraws the three tongues as
 * a low, wide crown that WRAPS his head instead of standing on it. Measured against his head ring:
 * the round-5 outline was 51pt wider than the head where the hole clip cuts it (y 23), so a flat,
 * rim-stroked horizontal edge showed beside each temple. Now every layer is inside the head's
 * silhouette at that line (outline 30.7..65.3 units vs the head's 27.1..69.2), so the fire has no
 * visible cut: its flanks rise from behind his temples and the tip sits 49 units over his head
 * (was 57), a crown of fire rather than a candle on top.
 *
 * NOW THERE IS ONE ACTOR AND ONE SILHOUETTE. The flame is Atlas's CROWN, a child of the same
 * HeroUnit view that carries his jump, squash and turn, so the two cannot separate. The LIT
 * crown is drawn in his OWN design units, rooted behind his head: three soft tongues with round
 * tips, the flanks swelling out from behind his temples and curling back in, with a gold middle and a white-hot core stacked inside.
 * The middle and core flicker on their own periods over one still outline (a second crossfading
 * outline ghosted a doubled edge and was removed), so the fire lives without its edge shimmering:
 * he is burning, not wearing a hat. Every effect is CAUSED by his body:
 *
 *   ENTER      0–280     the hero fades/scales in about his feet. The crown is a grey tuft (UNLIT)
 *                        standing clear above his head, so the thing that will ignite is visible.
 *   NOTICE     +280      milestones only: the crown breathes once; every later beat shifts +280.
 *   CROUCH     280–500   squash about the feet, easing into the hold -- loading a spring. The
 *                        crown dips 80ms late: drag, like hair.
 *   HITSTOP    500–580   he holds the crouch but keeps pressing into it (2% more squash,
 *                        linear), so no two frames match. Atlas is `still`, so no blink can land
 *                        in it. With the crouch's soft tail that is ~130ms of loaded pose.
 *   LAUNCH     580–1272  push-off (whoosh + Medium haptic), stretch, rise 52pt and fall, while a
 *                        flat 2D cos-scale turn eases to edge-on, HANGS there at the jump apex,
 *                        then comes round at a CONSTANT ~0.86deg/ms (~29deg a frame at 30fps), so
 *                        the back half has in-betweens instead of a single mirrored flash.
 *   IGNITE     ~852      on the one UI frame he is a sliver (rot >= 88deg), the crown turns LIT,
 *                        the face cuts watching -> whoa, and the crown swells. Hidden by the turn.
 *   LAND       1272      the fall's OWN completion callback is the impact frame: face -> proud,
 *                        land squash + kickback, crown eruption, bloom, and one frame later on JS
 *                        the confetti (from the crown), the numeral roll, the Success haptic and
 *                        the bright confirmation sound. A UI-thread spark burst covers the impact
 *                        frame itself until then.
 *   RESOLVE    1800+     label and week fade in. Their space is reserved from frame 0: no reflow.
 *   EMBER      2160      a ~38pt-wide LIT flame tears off the centre tongue (the crown eases to 80%
 *                        across the rise's first frames, so the loss reads without a pop),
 *                        rises, eases over the apex (~680ms flight), drops into today's dot, squashes
 *                        onto it and puffs out, with a drop sound
 *                        and a Light haptic; today's mini Atlas springs in where it lands.
 *
 * Overshoot (Spring.reward) lives ONLY on the hero, the numeral and the dot's Atlas -- the
 * expressive character and the earned reward, which is where AGENTS.md allows it. Label and week
 * use eased, critically damped entrances. Two hard rules from earlier builds are kept: no real
 * rotateY (it blanked sibling views on iOS), and no per-frame Skia colour (it dropped frames) --
 * UNLIT/LIT are two static drawings and the swap is an opacity cut hidden by the edge-on frame.
 *
 * SOUND is three CC0 Kenney clips through the app's one helper (src/lib/sfx.ts), each on a beat
 * that already has a haptic: launch = whoosh + Medium, land = confirmation_004 + Success, ember =
 * glass tink + Light. sfx.ts sets `playsInSilentMode: false` + `mixWithOthers`, so the ring/silent
 * switch mutes them and the user's music keeps playing. The players are warmed at mount, so the
 * first play (580ms in) does not wait on a decode.
 *
 * Reduced motion renders the resolved composition (proud, lit, today's number, week with today
 * done) behind a single 150ms opacity fade, with the landing's haptic and sound. `finishKey`
 * snaps to that composition at any time.
 */
import * as Haptics from '@/lib/haptics';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { PIConfetti, type PIConfettiMethods } from 'react-native-fast-confetti';
import Animated, {
  cancelAnimation,
  FadeInDown,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { Atlas } from '@/components/atlas';
import { RING_CENTRES, RIM, RIM_W } from '@/components/atlas-mark';
import { ThemedText } from '@/components/themed-text';
import { STREAK_DOT, WeekStreak } from '@/components/week-streak';
import { Colors, Fonts, FontSize } from '@/constants/theme';
import { playSfx, warmSfx } from '@/lib/sfx';
import { Duration, Ease, Spring, STAGGER_GAP } from '@/shared/motion/tokens';

/** Milestone days get the earned tier: a NOTICE beat, a bigger crown, more flakes. They used to
 *  get a DOUBLE turn too; 720deg inside one jump was ~2deg/ms, which strobed at 30fps. */
const MILESTONES = new Set([7, 30, 100, 365]);
const NOTICE_MS = 280;

/** The crouch. 220ms on Ease.inOut: its tail is soft enough that the last ~50ms plus the 100ms
 *  hitstop read as ONE held pose of ~150ms. Round 3 decelerated 300ms on Ease.out, which settled
 *  at ~150ms and then held identical frames for ~270ms: a dead hold, not an anticipation. */
const CROUCH_MS = 220;
/** The turn, in four legs. `in` eases to 80deg (edge-on is 90), `hang` crawls 80 -> 100 across
 *  the jump's apex, `spin` runs 100 -> 330 LINEAR (230deg / 267ms = 0.86deg/ms, so ~6 frames of
 *  the back view at 30fps instead of one), and `settle` eases 330 -> 360 onto the landing. The
 *  settle is outCubic, whose start velocity (3 x 30deg / 105ms) matches the spin's: no kink. */
const TURN = { in: 240, hang: 80, spin: 267, settle: 105 } as const;
const RISE = TURN.in + TURN.hang; // 320: the apex IS the edge-on hang
const FALL = TURN.spin + TURN.settle; // 372: the turn completes on the landing frame
const JUMP_PT = 52;

/** Beat start times (ms from mount) on a REGULAR day. Milestones add NOTICE_MS to every beat
 *  from `crouch` on. Named so a re-time reads as moving a beat, not a constant. */
const BEAT = { crouch: 280, hitstop: 500, launch: 580, resolve: 1800, ember: 2160, end: 3000 } as const;
/** The hitstop. Round 6 held 100ms after the Ease.inOut crouch had already flattened, and the
 *  review counted 7 identical frames (~230ms) at 30fps against a 120-180ms target. Now it is 80ms
 *  and not frozen: he keeps PRESSING into the floor (a further 2% squash, linear) so every frame
 *  differs a little, and the crouch's ~50ms soft tail plus this reads as one ~130ms loaded pose. */
const HITSTOP_MS = BEAT.launch - BEAT.hitstop;

/** The turn's edge-on trigger. With the 80->100 linear hang (0.25deg/ms, ~4deg a frame) the first
 *  frame past 88 is at most ~92, so |cos| <= 0.07: the swap happens while he is a sliver. */
const IGNITE_DEG = 88;

/* HeroUnit geometry (local coordinates), all derived from Atlas's own drawing so it cannot drift
   from the mark: his viewBox is 100 x 104 units and his TOP ring (the head, eyes on it) is
   RING_CENTRES[2] with outer radius 22.89 (atlas-mark R_OUT). His rings span x 6.4..95.6, so at
   240pt they are ~214pt wide: ~53% of a 402pt screen, the band Duolingo's hero sits in. At 200 the
   review measured ~34% and the payoff read as an icon under a big empty gap. */
const ATLAS_PT = 240;
const U = ATLAS_PT / 100; // pt per Atlas design unit
const ATLAS_H = Math.round(ATLAS_PT * 1.04); // 250: his SVG's REAL height, so his feet never poke into the numeral
const HEAD = RING_CENTRES[2];
const HEAD_R = 22.89;
/** The crown's drawing box in ATLAS units (the same space as his rings), so every tongue is placed
 *  against the ring it rises from rather than eyeballed in a separate viewBox. */
const CB = { x: -8, y: -48, w: 116, h: 112 } as const;
const CROWN_VB = `${String(CB.x)} ${String(CB.y)} ${String(CB.w)} ${String(CB.h)}`;
/** The tallest tongue's tip, in Atlas units (see OUTER). */
const FIRE_TIP_Y = -38.2;
/** ...and its height above his head's centre. */
const TIP_UNITS = HEAD.cy - FIRE_TIP_Y;
const TIP_ABOVE_HEAD = TIP_UNITS * U; // ~168pt at scale 1
const HERO_W = ATLAS_PT + 32; // 272
const FACES_X = (HERO_W - ATLAS_PT) / 2; // 16
/** Room above his face box for the milestone crown's tip (1.12x) at the top of its flicker (1.05x). */
const ATLAS_TOP = Math.ceil(TIP_ABOVE_HEAD * 1.12 * 1.05 - HEAD.cy * U) + 2; // ~133
const HERO_H = ATLAS_TOP + ATLAS_H;
/** The crown's transform origin is his head's centre: it scales and flickers about the head, so
 *  it grows OUT of him in every direction. */
const CROWN_X = FACES_X + HEAD.cx * U;
const CROWN_Y = ATLAS_TOP + HEAD.cy * U;
const CROWN_ORIGIN = [(HEAD.cx - CB.x) * U, (HEAD.cy - CB.y) * U, 0];
const HEAD_TOP_Y = CROWN_Y - HEAD_R * U; // the top of his head
/** The fire's visible centre above his head: where the bloom, the sparks and the confetti come
 *  from. Anything born lower would read as coming out of his skull. */
const CROWN_MID_Y = Math.round((HEAD_TOP_Y + CROWN_Y - TIP_ABOVE_HEAD) / 2);
const BLOOM_PT = 400;
/** The ember is the app's flame drawing at 76pt. Its body is half the box wide, so in flight it
 *  is ~38pt wide by ~57pt tall, and ~34pt wide as it settles: clearly a flame, the size of the
 *  34pt dot it lands in. Round 4 drew it at 30pt inside a glow (~18pt of spark); round 7 at 60pt
 *  shrinking to 0.8 read as ~20pt. No glow: the design doc bans the soft halo, the shape carries it. */
const EMBER_PT = 76;
/** The flight is two legs split at the arc's apex (~this far along the cubic): a decelerating
 *  rise that eases over the top, then an ease-in-out drop, so the eye can follow it (~680ms). */
const EMBER_APEX = 0.18;
/** Where it tears off: the upper middle of the centre tongue, in Atlas units, at scale 1. At
 *  its 0.7 tear-off size the ember covers the tongue's top half, so it leaves FROM the fire. */
const EMBER_FROM = { x: 48, y: -20 } as const;
/** How far sideways the ember's path swings to clear Atlas's body before dropping to the week. */
const EMBER_CLEAR = ATLAS_PT / 2 + 48;
/** UI-thread spark burst on the impact frame. PIConfetti's restart() is a JS call and lands 1-2
 *  frames late; these are driven by one shared value set inside the fall's completion worklet, so
 *  the first debris is on screen on the landing frame itself and the confetti takes over after. */
const SPARKS = 18;
const SPARK_PT = 9;
const SPARK_REACH = ATLAS_PT * 0.62;
/** The crown starts as a banked grey tuft and dips on the crouch before it ignites. At 0.66 its
 *  tip stands ~10 units (24pt) clear of his head; at the 0.56 dip it still shows ~5 units. */
const CROWN_REST = 0.66;
const CROWN_DIP = 0.56;

/* UNLIT: the app's own two-tone flame (EUPHORIA_ICONS 'flame', 48 viewBox) as a single banked
   tuft, scaled so its tip is 50 units above his head's centre and its belly (r 12 -> 25 units)
   sits hidden behind his head. */
const FLAME_BODY = 'M24 4c-4 10-12 14-12 24a12 12 0 0024 0c0-10-8-14-12-24z';
const FLAME_CORE = 'M24 20c-2 5-6 7-6 13a6 6 0 0012 0c0-6-4-8-6-13z';
const TUFT_K = 50 / 24;
const TUFT_T = `translate(${String(HEAD.cx - 24 * TUFT_K)} ${String(HEAD.cy - 28 * TUFT_K)}) scale(${String(TUFT_K)})`;
/* LIT: three soft tongues in Atlas units -- a centre over the crown of his head and two flanks
   that curl out from behind his temples -- drawn as ONE silhouette with the same light rim
   Atlas's rings wear, so the fire reads as part of his drawing rather than a sticker behind him.
   HOLE_CLIP_Y cuts the fire off above the highest ring hole so it can never show through a hole.
   Owner review (2026-09-23): the previous five spiky quadratic tongues read jagged, a second
   crossfading silhouette (OUTER_B) ghosted a doubled edge, and fire filled his ring holes.
   Round 6: each flank's outer edge now bends back IN to meet his head's outline at y ~19 (the
   head's rim runs x 29.2 / 67.1 there) and every base corner sits inside his head disc, so where
   the clip cuts the fire the cut is hidden behind him. Round 5's flanks still spread 21.4..72.7
   at the clip line, which drew a flat, rim-stroked ledge beside each temple. Symmetric about his
   head's centre (x 48) so the crown sits on him, not beside him.
   Round 7 (owner: "make it aesthetic"): round 6 still read as horns. Its flanks were flat-topped
   wedges ending in needle tips, the gold middle had two points jutting out of the orange, and the
   core was a hard spike. Now every tip is a small ROUND cap (the curve's tangent is continuous
   through it, so no corner), each flank's outer edge is one long S that swells from his temple
   and curls IN toward the centre, and the middle is an inset of the outer (~5 units in on every
   side, lobes inside the flanks) so it can never poke out, even at the flicker's 1.05 peak. The
   core is a rounded teardrop. Checked by rendering the three paths over his head ring. */
const OUTER =
  'M33 30C31 26 30 22 31 19C21 15 13 8 14 -2C15 -12 21 -19 28.5 -22.5C30 -23.2 31.3 -22 30.8 -20.3C29.5 -15 30.5 -9 33 -5C32 -18 40 -31 46.2 -37.2C46.9 -37.9 47.5 -38.2 48 -38.2C48.5 -38.2 49.1 -37.9 49.8 -37.2C56 -31 64 -18 63 -5C65.5 -9 66.5 -15 65.2 -20.3C64.7 -22 66 -23.2 67.5 -22.5C75 -19 81 -12 82 -2C83 8 75 15 65 19C66 22 65 26 63 30Z';
const MIDDLE =
  'M37 30C35 26 34 22 35 18C27 14 20 9 20.5 1C21 -7 24 -12 28 -14C29.3 -14.6 30.4 -13.6 30.1 -12C29.7 -8 32 -3 35.5 1C35.5 -11 41 -21 46.3 -27.1C47 -27.8 47.5 -28.1 48 -28.1C48.5 -28.1 49 -27.8 49.7 -27.1C55 -21 60.5 -11 60.5 1C64 -3 66.3 -8 65.9 -12C65.6 -13.6 66.7 -14.6 68 -14C72 -12 75 -7 75.5 1C76 9 69 14 61 18C62 22 61 26 59 30Z';
/* Round 8 (review: "the core reads as a wick"): the core was a 12-unit-wide spike up to y -4, a
   candle wick in the flame. It is now a soft, wide, round-shouldered heart that sits LOW: top at
   y -5, so it fills only the lower ~45% of the centre tongue's visible height (-38..23), ~22 units
   across at its widest and inside the middle's notches (35.5 / 60.5 at y 1) on every side. */
const CORE = 'M40 30C37 22 37 12 39.5 4C41.5 -2 44.5 -5 48 -5C51.5 -5 54.5 -2 56.5 4C59 12 59 22 56 30Z';
/** Every ring hole starts below this line (the head's hole spans 23.8-40.1 units; the upper rings'
 *  holes start at 42.6 and 48.3), while above it his head ring is solid across the fire's base. */
const HOLE_CLIP_Y = 23;
/** Atlas's own rim colour and width (atlas-mark RIM / RIM_W), so the fire is outlined like him. */
/* UNLIT must read as a grey ember crown on the dark background, not vanish into it: `border` sat
   at ~1.5:1. mutedForeground at 65% alpha composites to ~4:1, its 85% core lighter on top. */
const UNLIT = { body: `${Colors.dark.mutedForeground}A6`, core: `${Colors.dark.mutedForeground}D9` };
const LIT = { body: Colors.dark.streak, core: Colors.dark.warning };
const FIRE = { outer: Colors.dark.streak, middle: Colors.dark.iconGold, core: Colors.dark.primaryForeground };

/** The ember, and anywhere else a single flame is needed. */
function Flame({ colors, size }: { colors: { body: string; core: string }; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path d={FLAME_BODY} fill={colors.body} />
      <Path d={FLAME_CORE} fill={colors.core} />
    </Svg>
  );
}

/** One static layer of the crown, in the crown's Atlas-unit box. Only its parent view animates:
 *  no path or colour changes per frame. */
function CrownLayer({ children }: { children: ReactNode }) {
  return (
    <Svg width="100%" height="100%" viewBox={CROWN_VB}>
      <Defs>
        <ClipPath id="above-holes">
          <Rect x={CB.x} y={CB.y} width={CB.w} height={HOLE_CLIP_Y - CB.y} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#above-holes)">{children}</G>
    </Svg>
  );
}

type Pt = { x: number; y: number };

/** One square of the impact burst. Radiates from the crown's centre over the upper ~290deg (none
 *  straight down into his face), with a little gravity, and fades over the back half. Hidden at
 *  burst 0, so it costs nothing until the landing frame. */
function Spark({ i, burst }: { i: number; burst: SharedValue<number> }) {
  const a = -Math.PI / 2 + (i / (SPARKS - 1) - 0.5) * Math.PI * 1.6;
  const reach = SPARK_REACH * (0.6 + 0.4 * (((i * 7) % 5) / 4));
  const style = useAnimatedStyle(() => {
    const b = burst.get();
    return {
      opacity: b <= 0 ? 0 : b < 0.55 ? 1 : 1 - (b - 0.55) / 0.45,
      transform: [
        { translateX: Math.cos(a) * reach * b },
        { translateY: Math.sin(a) * reach * b + 40 * b * b },
        { rotate: `${String(i * 37 + b * 220)}deg` },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.spark, { backgroundColor: i % 2 ? LIT.core : LIT.body }, style]}
    />
  );
}

export function StreakIgnite({
  days,
  onDone,
  finishKey,
}: {
  /** The streak the user just reached — the number the moment resolves to. */
  days: number;
  onDone?: () => void;
  /** Bump to snap to the final composition at once (Continue pressed mid-sequence). */
  finishKey?: number;
}) {
  const reduced = useReducedMotion();
  const milestone = MILESTONES.has(days);
  const n = milestone ? NOTICE_MS : 0;
  const crownFinal = milestone ? 1.12 : 1;


  // Reduced motion's only motion: one opacity fade of the whole composition.
  const wrapO = useSharedValue(reduced ? 0 : 1);
  // HeroUnit: enter, crouch/stretch/land (sx, sy), jump (ty), landing kickback, turn, send nod.
  const heroO = useSharedValue(reduced ? 1 : 0);
  const heroS = useSharedValue(reduced ? 1 : 0.94);
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);
  const ty = useSharedValue(0);
  const kick = useSharedValue(0);
  const rot = useSharedValue(0);
  // Crown: its own lagged layer on top of the inherited hero transform.
  const lit = useSharedValue(reduced ? 1 : 0);
  const flameS = useSharedValue(reduced ? crownFinal : CROWN_REST);
  const flameSy = useSharedValue(1);
  const fired = useSharedValue(reduced ? 1 : 0);
  // Fire life: the gold middle's and the white core's height, on their own periods so the two
  // never line up and the fire never repeats a visible cycle. Reduced
  // motion leaves them at rest: a still, fully lit crown.
  const flickM = useSharedValue(1);
  const flickC = useSharedValue(1);
  // Three pre-mounted still faces, cut by opacity on the UI thread.
  const faceWatch = useSharedValue(reduced ? 0 : 1);
  const faceWhoa = useSharedValue(0);
  const faceProud = useSharedValue(reduced ? 1 : 0);
  // Bloom behind the crown.
  const bloomO = useSharedValue(0);
  const bloomS = useSharedValue(0.6);
  // Impact sparks: 0 = hidden, runs 0 -> 1 from the landing frame.
  const burst = useSharedValue(0);
  // Numeral, label, week.
  const countO = useSharedValue(reduced ? 1 : 0);
  const countS = useSharedValue(1);
  const labelO = useSharedValue(reduced ? 1 : 0);
  const labelY = useSharedValue(reduced ? 0 : 8);
  const weekO = useSharedValue(reduced ? 1 : 0);
  const weekY = useSharedValue(reduced ? 0 : 8);
  // The ember: progress along ONE cubic path [x0,y0 .. x3,y3] in wrap coordinates, plus the
  // puff it makes as it drops into the dot.
  const emP = useSharedValue(0);
  const emPath = useSharedValue([0, 0, 0, 0, 0, 0, 0, 0]);
  const emO = useSharedValue(0);
  const emPuff = useSharedValue(0);
  // Landing squash: 0 = in flight, 1 = flattened onto the dot.
  const emSq = useSharedValue(0);

  const [shown, setShown] = useState(reduced ? days : Math.max(0, days - 1));
  const [todayLit, setTodayLit] = useState(reduced);
  const [crown, setCrown] = useState<Pt>({ x: 0, y: 0 });
  const confetti = useRef<PIConfettiMethods>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const doneRef = useRef(false);
  // Measured once at mount. Every child has a fixed size from frame 0, so these never go stale.
  const heroAt = useRef<Pt>({ x: 0, y: 0 });
  const weekAt = useRef({ x: 0, y: 0, h: 0 });
  const rowAt = useRef({ x: 0, y: 0, w: 0 });

  const todayIdx = (new Date().getDay() + 6) % 7;

  const callDone = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone?.();
  };

  const startFlicker = () => {
    'worklet';
    flickM.set(withRepeat(withSequence(
      withTiming(1.05, { duration: Duration.exit, easing: Ease.inOut }),
      withTiming(0.97, { duration: Duration.base, easing: Ease.inOut }),
    ), -1));
    flickC.set(withRepeat(withSequence(
      withTiming(1.06, { duration: Duration.exit, easing: Ease.inOut }),
      withTiming(0.97, { duration: Duration.base, easing: Ease.inOut }),
    ), -1));
  };

  // Decode the three clips now, ~580ms before the first one is due. sfx.ts owns the audio session
  // (silent switch respected, mixes with the user's music).
  useEffect(() => {
    warmSfx(['whoosh', 'ignite', 'ember']);
  }, []);

  // IGNITE: the transformation is hidden by the turn. All of it in ONE UI frame, no timing, no
  // JS round-trip, so nothing can land late at partial width. `fired` makes it fire exactly once.
  useAnimatedReaction(
    () => rot.get(),
    (r) => {
      if (fired.get() === 0 && r >= IGNITE_DEG) {
        fired.set(1);
        lit.set(1);
        faceWatch.set(0);
        faceWhoa.set(1);
        flameS.set(withSpring(crownFinal, Spring.reward));
        startFlicker();
      }
    },
    [crownFinal],
  );

  useEffect(() => {
    doneRef.current = false;
    if (reduced) {
      wrapO.set(withTiming(1, { duration: Duration.fast, easing: Ease.out }));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSfx('ignite');
      timers.current = [setTimeout(callDone, Duration.fast)];
      return () => timers.current.forEach(clearTimeout);
    }

    const t = {
      crouch: BEAT.crouch + n,
      hitstop: BEAT.hitstop + n,
      launch: BEAT.launch + n,
      resolve: BEAT.resolve + n,
      ember: BEAT.ember + n,
      end: milestone ? Duration.earned : BEAT.end,
    };

    // ENTER: the hero is the first and only visible actor. Numeral shows yesterday, dimmed.
    heroO.set(withTiming(1, { duration: Duration.base, easing: Ease.enter }));
    heroS.set(withTiming(1, { duration: Duration.base, easing: Ease.enter }));
    countO.set(withTiming(0.5, { duration: Duration.base, easing: Ease.enter }));

    // NOTICE (milestones): the crown alone breathes once. No face change, no translation.
    if (milestone) {
      flameSy.set(withDelay(BEAT.crouch, withSequence(
        withTiming(1.04, { duration: Duration.fast, easing: Ease.inOut }),
        withTiming(1, { duration: Duration.fast, easing: Ease.inOut }),
      )));
    }

    // CROUCH -> HITSTOP (a slow press, never a frozen frame) -> STRETCH -> back to rest exactly on the landing frame.
    sx.set(withDelay(t.crouch, withSequence(
      withTiming(1.08, { duration: CROUCH_MS, easing: Ease.inOut }),
      withTiming(1.1, { duration: HITSTOP_MS, easing: Easing.linear }),
      withTiming(0.92, { duration: Duration.fast, easing: Ease.out }),
      withTiming(1, { duration: RISE + FALL - Duration.fast, easing: Ease.inOut }),
    )));
    sy.set(withDelay(t.crouch, withSequence(
      withTiming(0.88, { duration: CROUCH_MS, easing: Ease.inOut }),
      withTiming(0.86, { duration: HITSTOP_MS, easing: Easing.linear }),
      withTiming(1.12, { duration: Duration.fast, easing: Ease.out }),
      withTiming(1, { duration: RISE + FALL - Duration.fast, easing: Ease.inOut }),
    )));
    // Drag: the crown follows the body down 80ms late, and is still by the hitstop.
    flameS.set(withDelay(t.crouch + 80, withTiming(CROWN_DIP, { duration: CROUCH_MS - 80, easing: Ease.inOut })));

    // LAND: everything the impact causes, run from the fall's own completion on the UI thread, so
    // the payoff sits on the exact frame his feet return to the baseline.
    const onLandJS = () => {
      confetti.current?.restart();
      setShown(days);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSfx('ignite');
    };
    const onLandUI = () => {
      'worklet';
      faceWhoa.set(0);
      faceProud.set(1);
      sx.set(withSequence(withTiming(1.1, { duration: 90, easing: Ease.out }), withSpring(1, Spring.reward)));
      sy.set(withSequence(withTiming(0.9, { duration: 90, easing: Ease.out }), withSpring(1, Spring.reward)));
      kick.set(withSequence(withTiming(4, { duration: 90, easing: Ease.out }), withSpring(0, Spring.reward)));
      // Kickback pushes Atlas down while the crown erupts up, 80ms behind (drag again). The
      // ambient flicker follows on from the eruption's own rest rather than cutting its tail.
      flameSy.set(withDelay(80, withSequence(
        withTiming(1.22, { duration: Duration.instant, easing: Ease.out }),
        withSpring(1, Spring.reward),
        withRepeat(withSequence(
          withTiming(1.035, { duration: Duration.pulse, easing: Ease.inOut }),
          withTiming(1, { duration: Duration.pulse, easing: Ease.inOut }),
        ), -1),
      )));
      // Bloom: only ever visible from the landing frame on, where cos(rot) = 1.
      bloomO.set(withSequence(
        withTiming(1, { duration: Duration.instant, easing: Ease.out }),
        withTiming(0, { duration: Duration.count, easing: Ease.out }),
      ));
      bloomS.set(withTiming(1.3, { duration: Duration.instant + Duration.count, easing: Ease.out }));
      // Debris on THIS frame, not 1-2 frames later when the JS confetti restart lands.
      burst.set(withTiming(1, { duration: Duration.slow + Duration.fast, easing: Ease.out }));
      // Numeral: secondary action 60ms after the primary, at the same place.
      countO.set(withDelay(60, withTiming(1, { duration: Duration.instant, easing: Ease.out })));
      countS.set(withDelay(60, withSequence(
        withTiming(1.18, { duration: Duration.instant, easing: Ease.out }),
        withSpring(1, Spring.reward),
      )));
      scheduleOnRN(onLandJS);
    };

    // Ease.out on the rise front-loads the climb, so he floats near the apex while the turn hangs.
    ty.set(withDelay(t.launch, withSequence(
      withTiming(-JUMP_PT, { duration: RISE, easing: Ease.out }),
      withTiming(0, { duration: FALL, easing: Ease.exitCurve }, (finished) => {
        'worklet';
        if (finished) onLandUI();
      }),
    )));

    // The turn: ease into edge-on, HANG across it at the apex, come round at a constant rate and
    // settle onto the landing. See TURN for why the back half is linear.
    rot.set(withDelay(t.launch, withSequence(
      withTiming(80, { duration: TURN.in, easing: Ease.outCubic }),
      withTiming(100, { duration: TURN.hang, easing: Easing.linear }),
      withTiming(330, { duration: TURN.spin, easing: Easing.linear }),
      withTiming(360, { duration: TURN.settle, easing: Ease.outCubic }),
    )));

    // RESOLVE: laid out since frame 0, so only opacity and <= 8pt of translateY change.
    labelO.set(withDelay(t.resolve, withTiming(1, { duration: Duration.base, easing: Ease.enter })));
    labelY.set(withDelay(t.resolve, withTiming(0, { duration: Duration.base, easing: Ease.enter })));
    weekO.set(withDelay(t.resolve + STAGGER_GAP, withTiming(1, { duration: Duration.base, easing: Ease.enter })));
    weekY.set(withDelay(t.resolve + STAGGER_GAP, withTiming(0, { duration: Duration.base, easing: Ease.enter })));

    // EMBER: the same LIT drawing tears off the crown on ONE arc and becomes today's dot.
    const onEmberArrive = () => {
      setTodayLit(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSfx('ember');
    };
    const sendEmber = () => {
      const h = heroAt.current;
      const w = weekAt.current;
      const r = rowAt.current;
      if (!h.y || !w.y || !r.w) {
        setTodayLit(true);
        return;
      }
      // From the middle of the centre tongue (the crown has settled at crownFinal about his
      // head's centre), so the piece visibly leaves the fire rather than appearing beside it.
      const cx = h.x + CROWN_X;
      const from = {
        x: cx + (EMBER_FROM.x - HEAD.cx) * U * crownFinal,
        y: h.y + CROWN_Y + (EMBER_FROM.y - HEAD.cy) * U * crownFinal,
      };
      // The dot is the bottom slot of its cell (day label above it), so aim from the week's
      // bottom edge rather than the row's top.
      const to = {
        x: w.x + r.x + ((todayIdx + 0.5) * r.w) / 7,
        y: w.y + w.h - (STREAK_DOT + 6) / 2,
      };
      // One cubic: up out of the crown, swing wide of his body on today's side, then drop into
      // the dot. Control y's go (above start, below start, target) so the path has exactly ONE
      // vertical direction change; control x's sit EMBER_CLEAR out, which keeps the ember outside
      // his silhouette even when today's dot is straight below him.
      const side = to.x >= cx ? 1 : -1;
      const wide = side > 0 ? Math.max(cx + EMBER_CLEAR, to.x) : Math.min(cx - EMBER_CLEAR, to.x);
      emPath.set([
        from.x, from.y,
        cx + side * EMBER_CLEAR, from.y - 96,
        wide, h.y + ATLAS_TOP + ATLAS_PT / 2,
        to.x, to.y,
      ]);
      emP.set(0);
      emPuff.set(0);
      emSq.set(0);
      emO.set(1);
      // The crown visibly loses the piece: it eases down to 80% over the rise's first frames and
      // regrows, and Atlas nods it on its way. outCubic, not Ease.out: Ease.out's ~6x start slope
      // put most of the dip on ONE frame, which read as a pop rather than a tear-off.
      flameS.set(withSequence(
        withTiming(crownFinal * 0.8, { duration: Duration.instant, easing: Ease.outCubic }),
        withSpring(crownFinal, Spring.snappy),
      ));
      heroS.set(withSequence(
        withTiming(0.97, { duration: Duration.instant, easing: Ease.outCubic }),
        withSpring(1, Spring.snappy),
      ));
      // Up out of the crown and over the apex, then drop into the dot: 280 + 400 = 680ms, slow
      // enough to follow by eye. The rise is outCubic over Duration.base, not Ease.out over 180:
      // Ease.out covered ~half the rise in the first frame (a teleport at 60fps) and then crawled
      // ~270ms at the top (a stall). outCubic spreads the climb over ~8 visible frames and its
      // shorter tail, meeting Ease.inOut's slow start, is a brief ease over the top, not a hold.
      emP.set(withSequence(
        withTiming(EMBER_APEX, { duration: Duration.base, easing: Ease.outCubic }),
        withTiming(1, { duration: Duration.slow, easing: Ease.inOut }, (finished) => {
          'worklet';
          if (!finished) return;
          // Contact: the dot lights on this frame, the flame squashes flat onto it, then puffs out
          // wide as it fades, so the dot visibly RECEIVES it rather than the ember just vanishing.
          scheduleOnRN(onEmberArrive);
          emSq.set(withSequence(
            withTiming(1, { duration: Duration.instant, easing: Ease.out }),
            withTiming(0, { duration: Duration.fast, easing: Ease.out }),
          ));
          emPuff.set(withDelay(Duration.instant, withTiming(1, { duration: Duration.fast, easing: Ease.out })));
          emO.set(withDelay(Duration.instant, withTiming(0, { duration: Duration.fast, easing: Ease.out })));
        }),
      ));
    };

    timers.current = [
      setTimeout(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        playSfx('whoosh');
      }, t.launch),
      setTimeout(sendEmber, t.ember),
      setTimeout(callDone, t.end),
    ];
    return () => timers.current.forEach(clearTimeout);
    // Shared values are stable refs; the timeline runs once per mount / new streak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, days]);

  // INTERRUPT: Continue pressed mid-sequence snaps to the exact final composition in one frame.
  // The React half (number, today's dot) is derived during render so it lands in the same commit;
  // the UI-thread half (cancel + snap every shared value) runs in the effect below.
  const [seenFinishKey, setSeenFinishKey] = useState(finishKey);
  if (finishKey !== seenFinishKey) {
    setSeenFinishKey(finishKey);
    setShown(days);
    setTodayLit(true);
  }
  const firstFinishKey = useRef(finishKey);
  useEffect(() => {
    if (finishKey === firstFinishKey.current) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!reduced) {
      [rot, sx, sy, ty, kick, heroO, heroS, flameS, flameSy, lit, flickM, flickC, faceWatch, faceWhoa, faceProud,
        bloomO, bloomS, burst, countO, countS, labelO, labelY, weekO, weekY, emP, emO, emPuff, emSq,
      ].forEach(cancelAnimation);
      fired.set(1);
      rot.set(0);
      sx.set(1);
      sy.set(1);
      ty.set(0);
      kick.set(0);
      heroO.set(1);
      heroS.set(1);
      lit.set(1);
      flameS.set(crownFinal);
      flameSy.set(1);
      faceWatch.set(0);
      faceWhoa.set(0);
      faceProud.set(1);
      bloomO.set(0);
      burst.set(0);
      countO.set(1);
      countS.set(1);
      labelO.set(1);
      labelY.set(0);
      weekO.set(1);
      weekY.set(0);
      emO.set(0);
      emSq.set(0);
      // The final composition is a living fire, not a frozen one.
      startFlicker();
    }
    callDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishKey]);

  const wrapStyle = useAnimatedStyle(() => ({ opacity: wrapO.get() }));
  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroO.get(),
    // A flat turn: rotating about the vertical axis is, to the eye, horizontal scale following
    // cos(angle). A real rotateY with perspective blanked sibling views on iOS for whole frames.
    // Everything inside -- crown, bloom, faces -- inherits it, so they turn as one body.
    transform: [
      { translateY: ty.get() + kick.get() },
      { scale: heroS.get() },
      { scaleX: sx.get() * Math.cos((rot.get() * Math.PI) / 180) },
      { scaleY: sy.get() },
    ],
  }));
  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameS.get() }, { scaleY: flameSy.get() }],
  }));
  const litStyle = useAnimatedStyle(() => ({ opacity: lit.get() }));
  const unlitStyle = useAnimatedStyle(() => ({ opacity: 1 - lit.get() }));
  const middleStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: flickM.get() }, { scaleX: 2 - flickM.get() }],
  }));
  const coreStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: flickC.get() }] }));
  const watchStyle = useAnimatedStyle(() => ({ opacity: faceWatch.get() }));
  const whoaStyle = useAnimatedStyle(() => ({ opacity: faceWhoa.get() }));
  const proudStyle = useAnimatedStyle(() => ({ opacity: faceProud.get() }));
  const bloomStyle = useAnimatedStyle(() => ({
    opacity: bloomO.get(),
    transform: [{ scale: bloomS.get() }],
  }));
  const countStyle = useAnimatedStyle(() => ({
    opacity: countO.get(),
    transform: [{ scale: countS.get() }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelO.get(),
    transform: [{ translateY: labelY.get() }],
  }));
  const weekStyle = useAnimatedStyle(() => ({
    opacity: weekO.get(),
    transform: [{ translateY: weekY.get() }],
  }));
  const emberStyle = useAnimatedStyle(() => {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = emPath.get();
    const p = emP.get();
    const q = 1 - p;
    const b0 = q * q * q;
    const b1 = 3 * q * q * p;
    const b2 = 3 * q * p * p;
    const b3 = p * p * p;
    // Velocity along the cubic, for the lean: a flame in flight trails its tip behind it.
    const vx = 3 * (q * q * (x1 - x0) + 2 * q * p * (x2 - x1) + p * p * (x3 - x2));
    const vy = 3 * (q * q * (y1 - y0) + 2 * q * p * (y2 - y1) + p * p * (y3 - y2));
    const lean = (-vx / (Math.hypot(vx, vy) + 1)) * 30;
    // Tears off at 0.7 (it was part of the crown a frame ago), reaches full size by the apex, then
    // settles only to 0.9 (~34pt wide, the dot's size) so it stays a flame the whole way down.
    const grow = p < EMBER_APEX ? 0.7 + (0.3 * p) / EMBER_APEX : 1 - (0.1 * (p - EMBER_APEX)) / (1 - EMBER_APEX);
    // Landing: squash wide and short about the flame's base, then the puff spreads it as it fades.
    const sq = emSq.get();
    const puff = 1 + 0.6 * emPuff.get();
    const emSy = grow * (1 - 0.35 * sq) * puff;
    return {
      opacity: emO.get(),
      transform: [
        { translateX: b0 * x0 + b1 * x1 + b2 * x2 + b3 * x3 - EMBER_PT / 2 },
        // Keep the base (y 40 of 48, 1/3 of the box below centre) planted in the dot as it squashes.
        { translateY: b0 * y0 + b1 * y1 + b2 * y2 + b3 * y3 - EMBER_PT / 2 + (EMBER_PT / 3) * (grow * puff - emSy) },
        { rotate: `${String(lean * (1 - sq))}deg` },
        { scaleX: grow * (1 + 0.35 * sq) * puff },
        { scaleY: emSy },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.wrap, wrapStyle]}
      accessibilityRole="text"
      accessibilityLabel={`${String(days)} day streak reached`}>
      {/* HeroUnit: the ONLY actor. Crown, bloom and faces are its children, so they share one
          transform and cannot separate. There is no sibling Atlas or flame anywhere. */}
      <Animated.View
        style={[styles.hero, heroStyle]}
        onLayout={(e) => {
          const { x, y } = e.nativeEvent.layout;
          heroAt.current = { x, y };
          setCrown({ x: x + CROWN_X, y: y + CROWN_MID_Y });
        }}>
        {!reduced && (
          <Animated.View pointerEvents="none" style={[styles.bloom, bloomStyle]}>
            <Canvas style={styles.fill}>
              <Circle cx={BLOOM_PT / 2} cy={BLOOM_PT / 2} r={BLOOM_PT / 2}>
                <RadialGradient
                  c={vec(BLOOM_PT / 2, BLOOM_PT / 2)}
                  r={BLOOM_PT / 2}
                  colors={[`${LIT.body}A6`, `${LIT.body}33`, `${LIT.body}00`]}
                  positions={[0, 0.55, 1]}
                />
              </Circle>
            </Canvas>
          </Animated.View>
        )}
        {/* Behind his head and upper rings: every root is hidden by his body, so what shows is
            fire climbing his rims and rising off his head -- one burning silhouette. */}
        <Animated.View style={[styles.crown, crownStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, unlitStyle]}>
            <CrownLayer>
              <G transform={TUFT_T}>
                <Path d={FLAME_BODY} fill={UNLIT.body} />
                <Path d={FLAME_CORE} fill={UNLIT.core} />
              </G>
            </CrownLayer>
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, litStyle]}>
            <CrownLayer><Path d={OUTER} fill={FIRE.outer} stroke={RIM} strokeWidth={RIM_W} strokeLinejoin="round" /></CrownLayer>
            <Animated.View style={[styles.layer, middleStyle]}>
              <CrownLayer><Path d={MIDDLE} fill={FIRE.middle} /></CrownLayer>
            </Animated.View>
            <Animated.View style={[styles.layer, coreStyle]}>
              <CrownLayer><Path d={CORE} fill={FIRE.core} /></CrownLayer>
            </Animated.View>
          </Animated.View>
        </Animated.View>
        <View style={styles.faces}>
          <Animated.View style={[StyleSheet.absoluteFill, watchStyle]}>
            <Atlas size={ATLAS_PT} expression="watching" interactive={false} still accessibilityLabel="" />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, whoaStyle]}>
            <Atlas size={ATLAS_PT} expression="whoa" interactive={false} still accessibilityLabel="" />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, proudStyle]}>
            <Atlas size={ATLAS_PT} expression="proud" interactive={false} still accessibilityLabel="" />
          </Animated.View>
        </View>
        {!reduced && (
          <View pointerEvents="none" style={styles.sparks}>
            {Array.from({ length: SPARKS }, (_, i) => <Spark key={i} i={i} burst={burst} />)}
          </View>
        )}
      </Animated.View>

      {/* A plinth under his feet, outside HeroUnit so it never turns. */}
      <Animated.View style={[styles.countBox, countStyle]}>
        {/* Capped so the numeral stays inside the bloom; uncapped it reaches ~125pt at AX5. */}
        {/*
          * A PLAIN NUMERAL, KEYED ON THE VALUE (owner, 2026-10-01: the streak "looks off or cut").
          * NumberFlow clipped the DM Sans Black "2" inside its measured digit slot, cutting the
          * right edge and the foot, even with the family fixed in AppNumberFlow. The tick from
          * yesterday's count to today's is now the new numeral dropping into place, drawn at its
          * own full width. Reduce Motion swaps it with no movement.
          */}
        <Animated.View key={shown} entering={reduced ? undefined : FadeInDown.duration(Duration.slow).easing(Ease.out.factory())}>
          <ThemedText style={styles.count} maxFontSizeMultiplier={1.2} accessibilityLabel={`${String(shown)} day streak`}>
            {String(shown)}
          </ThemedText>
        </Animated.View>
      </Animated.View>

      {/* Label and week are laid out from frame 0 at opacity 0, so nothing re-centres later. */}
      <Animated.View style={labelStyle}>
        <ThemedText type="title" style={styles.label}>day streak</ThemedText>
      </Animated.View>
      <Animated.View
        style={[styles.week, weekStyle]}
        onLayout={(e) => {
          const { x, y, height } = e.nativeEvent.layout;
          weekAt.current = { x, y, h: height };
        }}>
        <WeekStreak
          todayIdx={todayIdx}
          onRowLayout={(x, y, w) => { rowAt.current = { x, y, w }; }}
          isDone={(i) => i <= todayIdx && todayIdx - i < days && (i < todayIdx || todayLit)}
        />
      </Animated.View>

      {!reduced && (
        <>
          {/* Keyed by tier: fast-confetti sizes its sprite and transform arrays once, so a flake count
              that changes on a live instance throws "transforms and sprites arrays must have the same
              length" (seen when `days` changed under fast refresh). A new count is a new instance. */}
          <PIConfetti key={milestone ? 'milestone' : 'day'} ref={confetti} autoplay={false} fadeOutOnEnd containerStyle={StyleSheet.absoluteFill}>
            <PIConfetti.Origin
              blastPosition={crown}
              count={milestone ? 110 : 70}
              initialSpeed={1.35}
              speedVariation={{ min: 0.35, max: 1 }}
              colors={[FIRE.outer, FIRE.middle, LIT.core, FIRE.core]}>
              <PIConfetti.Flake size={10} />
            </PIConfetti.Origin>
          </PIConfetti>
          <Animated.View pointerEvents="none" style={[styles.ember, emberStyle]}>
            <Flame colors={LIT} size={EMBER_PT} />
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Fills its screen so the confetti has room to fall. Every child has a fixed size from frame 0,
  // so the column's height never changes after mount and the centring never shifts.
  wrap: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  hero: { width: HERO_W, height: HERO_H, transformOrigin: 'bottom', overflow: 'visible' },
  fill: { width: '100%', height: '100%' },
  bloom: {
    position: 'absolute',
    left: CROWN_X - BLOOM_PT / 2,
    top: CROWN_MID_Y - BLOOM_PT / 2,
    width: BLOOM_PT,
    height: BLOOM_PT,
  },
  crown: {
    position: 'absolute',
    left: FACES_X + CB.x * U,
    top: ATLAS_TOP + CB.y * U,
    width: CB.w * U,
    height: CB.h * U,
    transformOrigin: CROWN_ORIGIN,
  },
  // Inner fire layers flicker about the same point as the crown: his head's centre.
  layer: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, transformOrigin: CROWN_ORIGIN },
  faces: { position: 'absolute', left: FACES_X, top: ATLAS_TOP, width: ATLAS_PT, height: ATLAS_H },
  // A real 8pt gap, not a tuck: the land squash, the 4pt kickback and the numeral's own 1.18 pop
  // all happen here, and the round-3 -4pt tuck let his bottom ring cut into the digits.
  countBox: { marginTop: 8 },
  // lineHeight gives each rolling digit slot headroom: NumberFlow fades the top/bottom edge of every
  // slot, and with no lineHeight the slot was barely taller than the 800-weight glyph, so the fade
  // cut into the digit itself (owner: "the numbers are cut off"). The fade now lands in empty space.
  // DM Sans Black by FAMILY: the custom family ignores fontWeight, and a width measured in one face
  // but drawn in another clipped the second digit ("20" -> "2" and half a "0").
  count: { fontFamily: Fonts.black, fontSize: FontSize.hero, lineHeight: Math.round(FontSize.hero * 1.35), color: Colors.dark.streak },
  label: { color: Colors.dark.streak, marginTop: 4 },
  week: { alignSelf: 'stretch', marginTop: 20, paddingHorizontal: 8 },
  ember: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: EMBER_PT,
    height: EMBER_PT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // A zero-size anchor at the crown's centre; each spark offsets from it by transform only.
  sparks: { position: 'absolute', left: CROWN_X, top: CROWN_MID_Y, width: 0, height: 0, overflow: 'visible' },
  spark: {
    position: 'absolute',
    left: -SPARK_PT / 2,
    top: -SPARK_PT / 2,
    width: SPARK_PT,
    height: SPARK_PT,
    borderRadius: 1.5,
  },
});
