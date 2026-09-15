/**
 * Atlas — Euphoria's mascot. Near-verbatim RN port of euphoriaweb Atlas.tsx: the pinwheel
 * logo mark with googly eyes at the crown; all acting happens in the pupils. One <Svg> with
 * the logo as an inner <Image>, whites + expression pupils drawn on top at the EXACT web
 * coords. Body spins on tap (eyes stay upright); idle blink; 6 expressions.
 */
import { useIsFocused } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  G,
  Path,
} from 'react-native-svg';

import { AtlasMarkBody } from '@/components/atlas-mark';
import { Duration, Ease, Spring } from '@/shared/motion/tokens';


/**
 * Below this rendered size Atlas holds still. See the note beside `idleMotion` — at 46pt every
 * idle movement he has is sub-pixel, and it was costing measurable React commits to draw nothing.
 */
const IDLE_MOTION_MIN_SIZE = 72;

export type AtlasExpression = 'default' | 'watching' | 'happy' | 'whoa' | 'silly' | 'sad' | 'thinking' | 'proud' | 'oops';

const INK = '#1A1523';

/*
 * RESTING HEAD TILT — the third acting channel, after pupils and brows.
 *
 * Only a handful of expressions get one, and none gets much. This is a Z rotation, so it can
 * express a head cocked to one side and nothing else: `proud` wants a chin lifted and `whoa` a
 * head pulled back, neither of which is a Z rotation, so both stay at 0 rather than being faked
 * with a tilt that means something different.
 *
 * Degrees are small on purpose. The head already carries an idle rock of +/-ROCK_DEG and a
 * reaction lag, and this SUMS with both -- a large resting angle would swamp the motion that
 * makes Atlas look alive and leave it looking broken instead.
 */
const EXPRESSION_TILT: Record<AtlasExpression, number> = {
  default: 0,
  watching: 0,
  happy: 0,
  whoa: 0,      // pulled back, not sideways — not expressible here
  proud: 0,     // chin up, not sideways — not expressible here
  silly: 6,
  sad: 3,
  thinking: -7, // the classic cocked head; the largest of the set because it is the most legible
  oops: -3,
};
/** Head scale inside the 100x104 box. The pinwheel was shrunk to 0.68 to make room for a pear
 *  body underneath; that body is gone, so the mark fills the frame again. Nothing here touches
 *  an expression coordinate — see the <G> transform in the render. */
const HEAD_S = 1;
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);
/** Idle breath depth, as a fraction of height. The Brilliant reference measures ~0.044
 *  (6px of bottom travel on a 136px mascot). 0.022 was half that and read as dead on device. */
const IDLE_SQUASH = 0.038;

/**
 * Idle loop periods, deliberately COPRIME-ish.
 *
 * Breath, sway and head-rock on the same period sync into a single pulse and the mascot reads
 * as one mechanical bob. On different periods they drift in and out of phase, which is what
 * makes an idle look observed rather than looped. Duolingo and Brilliant both do this.
 */
const BREATH_MS = 1600;
const SWAY_MS = 5200;
const ROCK_MS = 3900;

/** Whole-body lean, degrees. Small: this is weight shifting, not a dance. */
const SWAY_DEG = 1.6;
/** Head rock, degrees. Larger than the sway because the head is the lighter mass. */
const ROCK_DEG = 3.4;
/** Saccade amplitude, in viewBox units (~1% of 100). Any larger and the eyes read as shifty. */
const SACCADE_UNITS = 1.1;
/*
 * ARC FLEX — the idle tell for `happy`, which is the one expression that cannot blink.
 *
 * `happy` draws the eyes as upward arcs (^^). Closing an arc reads as nothing, so the blink gate
 * correctly excludes it — which left every `happy` screen with no eye motion at all. Measured
 * 2026-08-18: home, learn, digest and trade sat at 2 idle events because breath alone was
 * carrying them, and those screens render `happy`.
 *
 * A smile is not static on a real face; it settles and re-tightens. Animating the arc's control
 * point does exactly that — the eye-smile deepens and relaxes — and it is semantically right for
 * the expression rather than a motion borrowed from a different one.
 */
const ARC_FLEX_UNITS = 1.6;

/**
 * The idle curiosity beat: how often Atlas looks around, and how far.
 *
 * 12 to 21 SECONDS, which is deliberately much slower than it first wants to be. The beat runs
 * about 1.4s, so at a 6s period Atlas would be turning his head roughly a quarter of the time and
 * would read as distracted rather than attentive. Long enough that it lands as "he is still there"
 * and never as "he is fidgeting".
 *
 * 4.5 DEGREES, which is larger than the idle ROCK_DEG of 3.4 and far smaller than `thinking`'s
 * resting -7. It has to out-read the rock it sums with, or the look is invisible; it must not
 * reach an expression's own tilt, or a neutral Atlas briefly appears to change mood.
 */
const CURIOSITY_MIN_MS = 12_000;
const CURIOSITY_RANGE_MS = 9_000;
const CURIOSITY_DEG = 4.5;

/** How far each ring trails the one before it on a tap spin. Separate masses do not arrive
 *  together; 55ms is enough to read as a ripple and short enough to still feel like one gesture. */
const RING_LAG_MS = 55;

/**
 * How much of the full hop a celebrate plays.
 *
 * The beat's SHAPE — anticipation, launch, land, follow-through — is what makes a reaction read
 * as deliberate rather than as a glitch, so this scales AMPLITUDE only and leaves every duration
 * alone. 1.0 was the original cartoon hop: a 12%-of-size jump with a 13% squash. That is correct
 * for a once-per-lesson payoff and far too loud for something that fires on every option tap,
 * which is where it actually lives. Turn this up for a bigger moment, not the individual numbers.
 */
const CELEBRATE_GAIN = 0.32;

export function Atlas({
  size = 120,
  expression = 'default',
  interactive = true,
  glasses = false,
  celebrate = false,
  celebrateKey = 0,
  celebrateGain = CELEBRATE_GAIN,
  nod = false,
  nodKey = 0,
  shake = false,
  shakeKey = 0,
  entrance,
  idle = false,
  onPress,
  accessibilityLabel = 'Atlas, the Euphoria mascot',
  accessibilityHint,
}: {
  size?: number;
  expression?: AtlasExpression;
  interactive?: boolean;
  glasses?: boolean;
  celebrate?: boolean;
  /** Bump to re-fire the hop. A boolean `celebrate` latches once and never fires again —
   *  which is why re-selecting an onboarding option used to produce no reaction. */
  celebrateKey?: number;
  /** Acknowledging nod — the correct reaction to a single TAP. Drives the head and a
   *  micro-squash only; `jumpY` is never touched, so it has no vertical travel. */
  nod?: boolean;
  /** Bump to re-fire the nod. Same latch problem as `celebrateKey`. */
  nodKey?: number;
  /** The WRONG-ANSWER reaction: a decaying horizontal shake, no vertical travel.
   *
   *  This beat was written, measured and then never called. A word-boundary search for `shake`
   *  across src/app and src/components on 2026-09-14 returned ZERO call sites, so every wrong
   *  answer in the app was met by a mascot standing perfectly still. It is wired up now through
   *  <AtlasCorrection>, which is the one component all four wrong-answer surfaces already share. */
  shake?: boolean;
  /** Bump to re-fire the shake. THE SAME LATCH BUG the two keys above exist to fix, and this
   *  reaction is the one that needs it most: a learner can be wrong twice in a row on the same
   *  mounted question, and a boolean would answer only the first of them. */
  shakeKey?: number;
  /** Amplitude of the celebrate hop, as a fraction of the full cartoon beat. Defaults to the
   *  quiet per-tap reaction. Pass 1 for a once-per-lesson payoff — a global constant made the
   *  option-tap reaction correct and flattened the lesson-complete moment along with it. */
  celebrateGain?: number;
  /** 'bounce' grows in from nothing. 'arrive' drops in OVERSIZED and settles down — the
   *  celebration entry measured off the Duolingo reference, which reads as the character
   *  rushing at you rather than a UI element appearing. */
  entrance?: 'bounce' | 'arrive';
  /** Opt-in idle breath (anchored squash-stretch, top edge pinned). Default OFF: a mascot
   *  should be still until something happens. Reads correctly from ~96px up; below that
   *  it's sub-pixel and just costs a frame callback. */
  idle?: boolean;
  /** Lets a screen make Atlas himself the action without nesting a Pressable around his own
   * interactive Pressable. The mascot reaction still runs first; Reduced Motion suppresses the
   * spin but never suppresses the action. */
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const jumpY = useSharedValue(0);
  /** Breath PHASE (0..1), not a pixel offset — mapped to scale in `breathStyle` below. */
  const breath = useSharedValue(0);
  const shakeX = useSharedValue(0);
  /** Idle PHASES (0..1), mapped to degrees in the styles below. */
  const sway = useSharedValue(0);
  const rock = useSharedValue(0);
  /** Head follow-through, in DEGREES. Kept separate from `rock` so the idle phase and the
   *  reaction never fight over one value's units. They sum in headProps. */
  const headLag = useSharedValue(0);
  // Micro eye darts. Amplitude is deliberately ~1% of the 100-unit viewBox: at a 46px mascot
  // this is sub-pixel-ish and reads as life rather than as the eyes wandering.
  const sacX = useSharedValue(0);
  const sacY = useSharedValue(0);
  const arcFlex = useSharedValue(0);
  /** Extra squash on top of the breath, for anticipation and landing impact. */
  const squash = useSharedValue(0);
  const entranceScale = useSharedValue(entrance === 'bounce' ? 0 : entrance === 'arrive' ? 1.85 : 1);
  const entranceOpacity = useSharedValue(entrance ? 0 : 1);
  const spins = useRef(0);
  /*
   * BLINK IS A SHARED VALUE, NOT REACT STATE.
   *
   * It used to be useState, so every blink fired setBlink(true) then setBlink(false) -- two
   * React commits, each re-rendering the whole tree. Measured 2026-08-21 with five Atlas
   * instances mounted at once: 30 blinks in 6 IDLE seconds producing ~60 of the 97 commits in
   * that window, over a 7,025-fiber tree. That is what starved entrance animations of frames.
   *
   * Both eye states are now always rendered and crossfaded on the UI thread by opacity, so a
   * blink costs zero React work.
   */
  const blinkV = useSharedValue(0);
  /*
   * §4.1: ATLAS ONLY BREATHES ON THE SCREEN YOU ARE LOOKING AT.
   *
   * NEXT_SESSION.md §4.1 recorded ~4-5 React commits per second while completely idle, on every
   * screen, CAUSE UNKNOWN, with two hypotheses fixed in this very file without moving the number.
   * Both were about Atlas's React state, and neither could have worked: all three idle timers write
   * SHARED VALUES (blinkV, sacX/sacY, arcFlex), which live on the UI thread. Real timers, wrong
   * suspect. Atlas has exactly one useState and it is interaction-only.
   *
   * MEASURED with a root <Profiler> plus a store-write log, four marker-verified builds, Home idle
   * and untouched:
   *
   *   Atlas as shipped .................. 7 commits / 1973ms = 3.04/s
   *   Atlas removed entirely ............ 3 commits / 1225ms = 1.63/s
   *   Atlas restored (control) .......... 6 commits / 1741ms = 2.87/s
   *   Atlas RENDERED, 3 timers stopped .. 3 commits / 1189ms = 1.68/s
   *
   * The last two lines are the finding: stopping the timers is worth exactly as much as deleting
   * the component. The store log read `writes: none` in every window, so zustand is not involved at
   * all. A shared-value write is free on its own; what is not free is doing it forever, on FIVE
   * mounted instances, four of which are on screens nobody is looking at.
   *
   * So the gate is focus, not deletion. Atlas keeps every bit of its personality where it can
   * actually be seen, and costs nothing on the four tabs behind you. This is also just the house
   * rule PixelSprite.tsx already states out loud — "no idle loops, so a sprite only moves when
   * something asks it to" — finally applied to the mascot that was exempt from it.
   *
   * The effects already clear their timers on cleanup, so leaving a screen stops them immediately.
   */
  const focused = useIsFocused();

  /*
   * ...AND ONLY WHEN HE IS BIG ENOUGH FOR IT TO BE VISIBLE.
   *
   * The focus gate alone measured NO improvement, and the reason is obvious once measured: Home is
   * the focused screen, so its Atlas kept animating. Focus only ever helps the tabs behind you.
   *
   * Bisecting the three timers individually showed no single one dominates — saccade alone is
   * ~18% — so the cost is not one bad timer, it is the MECHANISM: every withTiming on a shared
   * value that feeds useAnimatedProps on a react-native-svg element costs React commits, because
   * RNSVG cannot natively animate most SVG attributes. The worst of them is real: the happy mouth
   * interpolates a path `d` STRING on every frame, and Home renders expression="happy".
   *
   * Atlas's viewBox is 96 units, so at Home's size={46} the scale is 0.48 and ARC_FLEX_UNITS of
   * smile-flex, a two-unit pupil saccade and a blink are all SUB-PIXEL. The app was paying real
   * commits, forever, for motion no one can see. At the lesson screen's 110-132 the same motion is
   * clearly visible and worth every commit it costs.
   *
   * 72 is where a 96-unit face renders at 0.75 and the smallest of these movements is still about a
   * pixel. Below it Atlas is decoration and holds still; above it he is the subject and behaves.
   */
  const idleMotion = focused && size >= IDLE_MOTION_MIN_SIZE;

  const [spinning, setSpinning] = useState(false);

  // idle blink every 2.8–6.2s (130ms)
  useEffect(() => {
    if (!idleMotion) return;
    if (reduced) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (!alive) return;
        blinkV.set(1);
        // instant on/off, matching the original state flip -- a faded blink reads as a droop
        setTimeout(() => alive && blinkV.set(0), 130);
        loop();
      }, 2800 + Math.random() * 3400);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [reduced, idleMotion, blinkV]);

  /*
   * SACCADES — the micro darts real eyes make constantly. Without them a face reads as a
   * photograph even while the body breathes. Interval is randomised and a fifth of darts are
   * doubles, so no two idle windows produce the same signature; a loop you can SEE looping is
   * worse than no loop.
   */
  useEffect(() => {
    if (!idleMotion) return;
    if (reduced) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const dart = () => {
      const dx = (Math.random() * 2 - 1) * SACCADE_UNITS;
      const dy = (Math.random() * 2 - 1) * SACCADE_UNITS * 0.6;
      sacX.set(withTiming(dx, { duration: 70, easing: Easing.out(Easing.quad) }));
      sacY.set(withTiming(dy, { duration: 70, easing: Easing.out(Easing.quad) }));
      setTimeout(() => {
        if (!alive) return;
        sacX.set(withTiming(0, { duration: 110, easing: Easing.inOut(Easing.quad) }));
        sacY.set(withTiming(0, { duration: 110, easing: Easing.inOut(Easing.quad) }));
      }, 140 + Math.random() * 180);
    };
    const loop = () => {
      t = setTimeout(() => {
        if (!alive) return;
        dart();
        if (Math.random() < 0.2) setTimeout(() => alive && dart(), 260);
        loop();
      }, 900 + Math.random() * 1700);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [reduced, idleMotion, sacX, sacY]);

  // Eye-smile flex. Slower and rarer than a saccade so the two never read as one twitch.
  useEffect(() => {
    if (!idleMotion) return;
    if (reduced) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (!alive) return;
        arcFlex.set(withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }));
        setTimeout(() => {
          if (alive) arcFlex.set(withTiming(0, { duration: 420, easing: Easing.inOut(Easing.quad) }));
        }, 300);
        loop();
      }, 2100 + Math.random() * 2600);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [reduced, idleMotion, arcFlex]);

  // Celebratory hop, built as a real piece of character animation rather than one spring.
  //
  //   anticipation -> launch -> land -> settle
  //
  // The dip before the jump is what sells the weight: without it the mascot teleports upward.
  // The body STRETCHES on the way up and SQUASHES on impact (volume roughly preserved), and the
  // head's rock is fired on the same beats but 70ms late, so it trails the body and overshoots
  // after it stops. That lag is the single biggest reason Duolingo's characters read as alive
  // and ours did not.
  useEffect(() => {
    if (!celebrate || reduced) return;
    const H = size * 0.12 * celebrateGain;
    jumpY.set(withDelay(Duration.fast, withSequence(
      withTiming(H * 0.18, { duration: 110, easing: Easing.out(Easing.quad) }),   // anticipation dip
      withSpring(-H, { stiffness: 260, damping: 13, mass: 1 }),                            // launch
      withSpring(0, { stiffness: 210, damping: 15, mass: 1 }),                             // land
    )));
    squash.set(withDelay(Duration.fast, withSequence(
      withTiming(0.9 * celebrateGain, { duration: 110 }),      // crouch: wide and short
      withTiming(-0.7 * celebrateGain, { duration: 150 }),     // stretch: tall and narrow, in the air
      withTiming(0.75 * celebrateGain, { duration: 90 }),      // impact
      withSpring(0, { stiffness: 190, damping: 12, mass: 1 }),
    )));
    // follow-through: the head is a separate mass, so it arrives late and rings down
    headLag.set(withDelay(Duration.fast + 70, withSequence(
      withTiming(-5 * celebrateGain, { duration: 150 }),
      withSpring(0, { stiffness: 120, damping: 8, mass: 1 }),
    )));
  }, [celebrate, celebrateKey, celebrateGain, reduced, jumpY, squash, headLag, size]);

  // Acknowledging nod — the reaction to a single TAP, and deliberately NOT a quieter hop.
  //
  // A hop answers "something was achieved". A tap only means "I heard you", and firing the
  // celebrate beat on every option tap is what made onboarding read as a mascot bouncing on
  // the spot. Turning CELEBRATE_GAIN down only made it a small bounce; the gesture itself was
  // wrong. This drives the head rotation and a micro-squash and never touches `jumpY`, and
  // `squash` is top-anchored in `breathStyle`, so the nod has NO vertical travel at all.
  //
  // Same beat shape as everything else here — dip, return, ring down — so it still reads as
  // deliberate character rather than a UI tween.
  useEffect(() => {
    if (!nod || reduced) return;
    headLag.set(withSequence(
      withTiming(-7, { duration: 120, easing: Easing.out(Easing.quad) }),
      withSpring(0, { stiffness: 150, damping: 9, mass: 1 }),
    ));
    squash.set(withSequence(
      withTiming(0.3, { duration: 100, easing: Easing.out(Easing.quad) }),
      withSpring(0, { stiffness: 210, damping: 14, mass: 1 }),
    ));
  }, [nod, nodKey, reduced, headLag, squash]);

  // Idle breath — an ANCHORED SQUASH-STRETCH, not a bob. Measured off the Brilliant
  // recordings (refs/videos): the mascot's top edge never moves across 90 frames; only its
  // body volume changes. This used to translate the whole mascot, which is why onboarding
  // read as bouncing. Opt-in via `idle`; note `size` is deliberately NOT a dependency, so
  // a resize can never re-fire the loop.
  useEffect(() => {
    /*
     * `idleMotion` gates these for the same reason it gates the three timers, and these are the
     * bigger prize: breath, sway and rock are withRepeat(..., -1, true) — three INFINITE loops,
     * per instance, forever. `rock` feeds headProps, a useAnimatedProps ROTATION on an SVG group,
     * and react-native-svg cannot animate that natively, so it costs React commits for as long as
     * the app is open. At Home's size={46} the whole excursion is under a pixel.
     *
     * Settling to 0 rather than just returning matters: leaving mid-cycle would freeze Atlas at a
     * random tilt, which reads as broken rather than as calm.
     */
    if (!idle || reduced || !idleMotion) {
      breath.set(withTiming(0, { duration: Duration.base }));
      sway.set(withTiming(0, { duration: Duration.base }));
      rock.set(withTiming(0, { duration: Duration.base }));
      return;
    }
    // withRepeat(..., -1, true) reverses, so the full period is 2x duration.
    breath.set(withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }), -1, true));
    // Weight shifting side to side, and the head rocking on its own slower clock. Both start
    // from a half-phase offset so they are already out of step with the breath on frame one.
    sway.set(withDelay(400, withRepeat(withTiming(1, { duration: SWAY_MS, easing: Easing.inOut(Easing.sin) }), -1, true)));
    rock.set(withDelay(900, withRepeat(withTiming(1, { duration: ROCK_MS, easing: Easing.inOut(Easing.sin) }), -1, true)));
  }, [idle, reduced, idleMotion, breath, sway, rock]);

  // shake on wrong answer (V1 balance-scale reference)
  //
  // `shakeKey` is in the dependency list for the same reason `celebrateKey` and `nodKey` are: a
  // boolean latches after the first fire, so two wrong answers on one mounted question produced a
  // reaction and then silence. Callers that mount fresh per answer can leave the key at 0.
  //
  // A head follow-through rides along, 60ms late. Every other reaction in this file has one, and
  // it is the thing the file's own celebrate note calls "the single biggest reason Duolingo's
  // characters read as alive": the head is a separate mass, so it arrives after the body and rings
  // down. Without it a shake reads as the whole image being dragged sideways.
  useEffect(() => {
    if (!shake || reduced) return;
    shakeX.set(withSequence(
      withTiming(-size * 0.06, { duration: 60 }),
      withTiming(size * 0.06, { duration: 60 }),
      withTiming(-size * 0.05, { duration: 55 }),
      withTiming(size * 0.05, { duration: 55 }),
      withTiming(-size * 0.025, { duration: 50 }),
      withSpring(0, { stiffness: 300, damping: 20, mass: 1 }),
    ));
    headLag.set(withDelay(60, withSequence(
      withTiming(4, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(-3.5, { duration: 110 }),
      withSpring(0, { stiffness: 130, damping: 9, mass: 1 }),
    )));
  }, [shake, shakeKey, reduced, shakeX, headLag, size]);

  /*
   * THE IDLE CURIOSITY BEAT — Atlas looking around when nothing has happened for a while.
   *
   * Everything else in this file reacts to the learner. Blink, saccade and breath keep the face
   * from reading as a photograph, but they are all sub-second twitches: across a long pause Atlas
   * had no gesture with any SHAPE to it, which is what separates "rendered" from "waiting for you".
   * A slow look away, a hold, and a return is the classic mascot idle and costs two shared values
   * this component already owns.
   *
   * ── THE COST, STATED, BECAUSE §4.1 ABOVE IS ABOUT EXACTLY THIS ──────────────────────────────
   * This is a ONE-SHOT on a long timer, not a fourth withRepeat. It fires every 12 to 21 seconds
   * against blink's 2.8 to 6.2 and saccade's 0.9 to 2.6, so it is roughly an order of magnitude
   * cheaper than the timers already measured as acceptable, and it inherits the same `idleMotion`
   * gate: unfocused screens and anything under 72pt run nothing at all.
   *
   * GATED OFF WHEN A CHOREOGRAPHED BEAT OWNS THE SCREEN. `headLag` is shared with celebrate, nod,
   * shake and the entrance, so a curiosity turn landing mid-celebration would fight the payoff it
   * is standing next to. Payoff screens pass `celebrate` or `entrance`, and they opt out here.
   */
  useEffect(() => {
    if (!idle || !idleMotion || reduced) return;
    if (celebrate || shake || entrance) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (!alive) return;
        // Direction alternates at random so the beat never reads as a metronome.
        const deg = (Math.random() < 0.5 ? -1 : 1) * CURIOSITY_DEG;
        headLag.set(withSequence(
          withTiming(deg, { duration: 520, easing: Easing.inOut(Easing.quad) }),
          // The HOLD is the part that reads as attention. Turning and returning in one motion is a
          // twitch; pausing at the far end is a look.
          withTiming(deg, { duration: 400 }),
          withSpring(0, { stiffness: 90, damping: 14, mass: 1 }),
        ));
        loop();
      }, CURIOSITY_MIN_MS + Math.random() * CURIOSITY_RANGE_MS);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [idle, idleMotion, reduced, celebrate, shake, entrance, headLag]);

  // entrance: a calm settle, not an overshoot. One soft spring from a near-final scale plus
  // the fade — Atlas arrives and comes to rest. The old 1.12 -> 0.96 -> 1.0 sequence stacked
  // on top of the idle bob and the celebrate jump, which is what made onboarding feel jumpy.
  useEffect(() => {
    if (!entrance) return;
    if (reduced) { entranceScale.set(1); entranceOpacity.set(1); return; }
    entranceOpacity.set(withTiming(1, { duration: entrance === 'arrive' ? 130 : Duration.fast, easing: Ease.enter }));
    if (entrance === 'arrive') {
      // Overshoot PAST rest on the way down, then spring back: a straight ease to 1 reads as a
      // zoom-out, the undershoot reads as landing.
      entranceScale.set(withSequence(
        withTiming(0.93, { duration: 430, easing: Easing.out(Easing.cubic) }),
        withSpring(1, { stiffness: 190, damping: 12, mass: 1 }),
      ));
    } else {
      entranceScale.set(withSpring(1, { ...Spring.smooth, damping: 24 }));
    }
    // Arrive with weight: a compression on touchdown that rebounds. The scale spring alone
    // just grew the mascot, which is why the arrival read as a fade rather than a landing.
    squash.set(withDelay(entrance === 'arrive' ? 400 : 160, withSequence(
      withTiming(0.85, { duration: 120, easing: Easing.out(Easing.quad) }),
      withSpring(0, { stiffness: 170, damping: 11, mass: 1 }),
    )));
    headLag.set(withDelay(entrance === 'arrive' ? 470 : 230, withSequence(
      withTiming(-4.5, { duration: 140 }),
      withSpring(0, { stiffness: 110, damping: 8, mass: 1 }),
    )));
  }, [entrance, reduced, entranceScale, entranceOpacity, squash, headLag]);

  const spin = () => {
    if (!interactive || reduced) return;
    spins.current += 1;
    setSpinning(true);
    // The whole-mark `rotation` shared value that used to be set here was NEVER READ by any
    // animated style or props. `ringSpin` is what actually turns the rings, and this file's own
    // header states the intent: "Body spins on tap (eyes stay upright)." So every tap started a
    // spring on the UI thread that drove nothing. Removed along with its useSharedValue.
    // rings chase the mark, each one later than the last
    ringSpin.forEach((v, i) =>
      v.set(withDelay(i * RING_LAG_MS, withSpring(spins.current * 360, { stiffness: 52, damping: 12, mass: 1 }))));
    setTimeout(() => setSpinning(false), 900);
  };

  const handlePress = () => {
    spin();
    onPress?.();
  };

  /**
   * Per-ring cascade — the payoff of the vector rebuild.
   *
   * The four rings are separate bodies now, so a tap can run THROUGH the mark instead of
   * rotating it as one rigid plate. Each ring chases the one before it by RING_LAG_MS, which is
   * the same follow-through principle the head already uses: separate masses do not arrive at
   * the same instant. The stagger is what makes it read as a pinwheel catching, rather than an
   * image being rotated.
   */
  /*
   * THE ARRAY IDENTITY MATTERS AS MUCH AS THE CONTENTS.
   *
   * This was `[...ringSpin.map((v) => useAnimatedProps(...))]`, which builds a NEW ARRAY on
   * every render. It is passed straight to <AtlasMarkBody rings={ringProps} />, and
   * AtlasMarkBody is memo()-wrapped -- so its shallow compare saw a different array every time
   * and the memo never once hit. The whole mark re-rendered on every commit: four
   * LinearGradients, a ClipPath, Defs and eight Circles, times however many Atlas instances
   * are mounted (measured: five at once on the lesson screen).
   *
   * Measured 2026-08-21 by walking the fiber tree per commit and attributing SELF time:
   * RNSVGCircle / RNSVGGroup / RNSVGLinearGradient / RNSVGClipPath / RNSVGDefs were all doing
   * real work in 33 of 33 idle commits. Memoising the array is what makes memo() effective.
   */
  const spin0 = useSharedValue(0);
  const spin1 = useSharedValue(0);
  const spin2 = useSharedValue(0);
  const spin3 = useSharedValue(0);
  /*
   * NOT useMemo'd by hand. useSharedValue returns a STABLE reference, so the only thing a manual
   * useMemo bought here was a react-hooks/preserve-manual-memoization ERROR — the React Compiler
   * is on in this project and could not preserve it, which means the component was being SKIPPED
   * for optimisation entirely. Letting the compiler memoise it keeps the array stable (that was
   * §4.1 hypothesis 2's real requirement) and lets it optimise the rest of the component too.
   * This was failing at HEAD, unseen, because `npm run check` runs the 37 pins and never eslint.
   */
  const ringSpin = [spin0, spin1, spin2, spin3];
  const ringProp0 = useAnimatedProps(() => ({ rotation: spin0.get() }));
  const ringProp1 = useAnimatedProps(() => ({ rotation: spin1.get() }));
  const ringProp2 = useAnimatedProps(() => ({ rotation: spin2.get() }));
  const ringProp3 = useAnimatedProps(() => ({ rotation: spin3.get() }));
  const ringProps = useMemo(
    () => [ringProp0, ringProp1, ringProp2, ringProp3],
    [ringProp0, ringProp1, ringProp2, ringProp3],
  );
  // Idle rock, reaction lag AND the expression's resting tilt all SUM here: the head keeps
  // breathing through a celebration instead of snapping to the reaction and back, and a tilted
  // expression still rocks rather than freezing at its angle.
  const headProps = useAnimatedProps(() => ({
    rotation: (rock.get() * 2 - 1) * ROCK_DEG + headLag.get() + EXPRESSION_TILT[expression],
  }));
  const saccadeProps = useAnimatedProps(() => ({ x: sacX.get(), y: sacY.get() }));
  // Blink crossfade, driven entirely on the UI thread so no blink costs a React commit.
  const openEyeProps   = useAnimatedProps(() => ({ opacity: 1 - blinkV.get() }));
  const closedEyeProps = useAnimatedProps(() => ({ opacity: blinkV.get() }));
  // Control point rises => the arc deepens. Same delta on both eyes so they stay a pair.
  const happyLeftProps = useAnimatedProps(() => ({
    d: `M27.3 27.8 Q34.8 ${20.8 - arcFlex.get() * ARC_FLEX_UNITS} 42.3 27.8`,
  }));
  const happyRightProps = useAnimatedProps(() => ({
    d: `M54.4 26.2 Q61.2 ${19.8 - arcFlex.get() * ARC_FLEX_UNITS} 68 26.2`,
  }));

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.get(),
    transform: [
      { translateY: jumpY.get() },
      { translateX: shakeX.get() },
      // lean pivots about the feet, not the centre, so the mascot shifts weight rather than
      // swinging like a pendulum hung from its head
      { translateY: size * 0.52 },
      { rotate: `${(sway.get() * 2 - 1) * SWAY_DEG}deg` },
      { translateY: -size * 0.52 },
      { scale: scale.get() * entranceScale.get() },
    ],
  }));

  // Breath lives on its OWN inner view. wrapStyle's translateY applies in unscaled parent
  // space (M = T·S), so folding the top-pin compensation into it would be wrong by a factor
  // of scale x entranceScale during press, entrance and celebrate. Nested, it is correct by
  // construction — and breath can no longer stack with jumpY, which was the original bug.
  const breathStyle = useAnimatedStyle(() => {
    const b = breath.get();
    // `squash` is signed: positive = crouched (wide + short), negative = stretched (tall + narrow).
    // Volume is roughly preserved by moving x the opposite way, which is what stops a squash
    // from reading as the whole mascot simply getting smaller.
    const q = squash.get();
    const sy = 1 + IDLE_SQUASH * b - q * 0.14;
    const sx = 1 - IDLE_SQUASH * 0.5 * b + q * 0.11; // full 1/sy reads rubbery
    // scaleY about the centre lifts the top edge by H*(sy-1)/2 — translate down by exactly that,
    // so the mascot deforms from the ground rather than floating.
    return { transform: [{ translateY: (size * 1.04 * (sy - 1)) / 2 }, { scaleY: sy }, { scaleX: sx }] };
  });

  const active: AtlasExpression = spinning ? 'whoa' : expression;
  /*
   * BLINK GATE — was `expression === 'default' || expression === 'watching'`, which froze the
   * eyes on six of the nine expressions. Measured 2026-08-17: chat, home, trade, learn and
   * digest showed 5-27 changed pixels across a five-second idle window, i.e. a mascot that
   * never moves, and those screens render `happy`/`thinking`/`proud`/`oops`.
   *
   * Only `happy` is drawn as upward arcs (^^) — closing an arc eye reads as nothing, so it stays
   * excluded. Every other expression uses round pupils and blinks meaningfully.
   */
  const blinkable = !spinning && expression !== 'happy';

  /*
   * BROWS — the second acting channel, added 2026-08-19.
   *
   * The nine expressions were separated ONLY by pupil cx/cy/r. Measured off the dev-gallery
   * render: `silly` and `watching` differ by a pupil x of 39.5 vs 31.8 — about 4pt at the 64pt
   * these ship at — so nine named emotions read as one face. That is not a drawing problem, it
   * is a channel problem: one variable cannot carry nine states.
   *
   * Brows rather than a mouth, deliberately. Atlas has no mouth and adding one is owner-blocked
   * (it reopens lip-sync). Brows are also the stronger channel for emotion in the first place —
   * they carry attitude where a mouth mostly carries valence — and they cost two strokes.
   *
   * The eye whites sit at cy 26-29 with r~13, so anything above y=12 is clear of them. Inner
   * ends are the expressive ones: DOWN reads worried, UP reads sceptical, and asymmetry reads
   * as thinking. `default` draws nothing, so the resting mark is unchanged from the logo.
   */
  const brows = () => {
    if (active === 'default') return null;
    /* 2.4, not 3. At the 46pt Home renders, a 3-unit stroke on a 100-unit viewBox is ~1.4pt of
       solid ink sitting directly on the eye's own outline, and the two merge into a bar. Checked
       on device at 46pt: 2.4 still reads as a brow at the smallest size Atlas ships at, which is
       the size that decides the weight -- anything legible at 46 is legible at 132. */
    const st = { stroke: INK, strokeWidth: 2.4, strokeLinecap: 'round' as const, fill: 'none' };
    switch (active) {
      case 'happy':   return (<><Path d="M25 12 Q34.5 7.5 44 11" {...st} /><Path d="M52 10.5 Q61 6 70 9.5" {...st} /></>);
      case 'proud':   return (<><Path d="M25 11 L44 9.5" {...st} /><Path d="M52 9.5 L71 8" {...st} /></>);
      case 'whoa':    return (<><Path d="M25 9 Q34.5 4 44 8" {...st} /><Path d="M52 7.5 Q61 2.5 70 6.5" {...st} /></>);
      case 'sad':     return (<><Path d="M25 11 Q34.5 15 44 17" {...st} /><Path d="M52 16 Q61 14 70 10" {...st} /></>);
      case 'oops':    return (<><Path d="M25 12 Q34.5 16 44 18" {...st} /><Path d="M52 17 Q61 15 70 11" {...st} /></>);
      /* asymmetric on purpose — one brow up is the universal shorthand for weighing something */
      case 'thinking':return (<><Path d="M25 15 Q34.5 12 44 14" {...st} /><Path d="M52 8 L71 10" {...st} /></>);
      case 'silly':   return (<><Path d="M25 9 L44 12" {...st} /><Path d="M52 14 Q61 9 70 13" {...st} /></>);
      case 'watching':return (<><Path d="M25 13 L44 12" {...st} /><Path d="M52 11.5 L71 10.5" {...st} /></>);
      default:        return null;
    }
  };

  const whiteR = active === 'whoa' ? [14, 12.8] : [13, 11.8];

  /** The closed eyes. Always mounted; opacity decides whether they are visible. */
  const closedEyes = (
    <>
      <Path d="M26 27.5 Q34.8 31.5 43.6 27.5" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M53.2 26 Q61.2 29.6 69.2 26" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
    </>
  );

  const pupils = () => {
    switch (active) {
      case 'happy':
        return (
          <>
            <AnimatedPath animatedProps={happyLeftProps} stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
            <AnimatedPath animatedProps={happyRightProps} stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
          </>
        );
      case 'whoa':
        return (
          <>
            <Circle cx={34.8} cy={26.5} r={4.4} fill={INK} />
            <Circle cx={61.2} cy={25} r={4} fill={INK} />
          </>
        );
      case 'watching':
        return (
          <>
            <Circle cx={31.8} cy={29.5} r={6.6} fill={INK} />
            <Circle cx={29.4} cy={27} r={2} fill="#fff" />
            <Circle cx={58.3} cy={28} r={6} fill={INK} />
            <Circle cx={56} cy={25.8} r={1.8} fill="#fff" />
          </>
        );
      case 'silly':
        return (
          <>
            <Circle cx={39.5} cy={27} r={6.2} fill={INK} />
            <Circle cx={37.2} cy={24.7} r={2} fill="#fff" />
            <Circle cx={57} cy={26.2} r={5.7} fill={INK} />
            <Circle cx={54.9} cy={24.1} r={1.8} fill="#fff" />
          </>
        );
      case 'sad':
        return (
          <>
            <Circle cx={35} cy={31} r={6} fill={INK} />
            <Circle cx={32.8} cy={29.4} r={1.8} fill="#fff" />
            <Circle cx={60} cy={30.5} r={5.6} fill={INK} />
            <Circle cx={57.9} cy={29} r={1.6} fill="#fff" />
            <Path d="M27 24 Q35 22 43 25" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <Path d="M54 24 Q61 22 68 25" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
          </>
        );
      case 'thinking':
        return (
          <>
            <Circle cx={32} cy={22} r={6.6} fill={INK} />
            <Circle cx={29.8} cy={20} r={2.2} fill="#fff" />
            <Circle cx={59} cy={23.5} r={5.8} fill={INK} />
            <Circle cx={57} cy={21.5} r={1.8} fill="#fff" />
            <Path d="M26 20 Q34.8 16.5 42 19.5" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          </>
        );
      case 'proud':
        return (
          <>
            <Circle cx={34.8} cy={22.5} r={6.6} fill={INK} />
            <Circle cx={32.6} cy={20.5} r={2.2} fill="#fff" />
            <Circle cx={61.2} cy={21.2} r={6} fill={INK} />
            <Circle cx={59} cy={19.2} r={2} fill="#fff" />
            <Path d="M24 28.5 Q34.8 33 45.6 28.5" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <Path d="M51.4 27 Q61.2 31.2 71 27" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
          </>
        );
      case 'oops':
        return (
          <>
            <Circle cx={34.8} cy={32} r={6} fill={INK} />
            <Circle cx={32.8} cy={30.2} r={1.8} fill="#fff" />
            <Circle cx={61.2} cy={30.5} r={5.4} fill={INK} />
            <Circle cx={59.3} cy={28.8} r={1.6} fill="#fff" />
            <Path d="M25 19 Q34.8 23 43.5 20" stroke={INK} strokeWidth={2.8} strokeLinecap="round" fill="none" />
            <Path d="M52 19 Q61.2 23 70.5 20" stroke={INK} strokeWidth={2.8} strokeLinecap="round" fill="none" />
          </>
        );
      default:
        return (
          <>
            <Circle cx={36.5} cy={24.8} r={6.6} fill={INK} />
            <Circle cx={34} cy={22.2} r={2.2} fill="#fff" />
            <Circle cx={59.5} cy={23.6} r={6} fill={INK} />
            <Circle cx={57.2} cy={21.4} r={2} fill="#fff" />
          </>
        );
    }
  };

  // The head keeps its ORIGINAL 100x104 coordinate space, scaled down as one unit so every
  // absolute pupil/glasses coord below stays byte-identical to the web original. Body is
  // authored in the outer space beneath it.
  // ponytail: one <G> transform instead of rewriting 9 expressions' coords. Never inline new
  // eye coords here — rescale HEAD_S and the whole face follows.
  const head = (
    <G transform={`translate(${(100 - 100 * HEAD_S) / 2}, 0) scale(${HEAD_S})`}>
      {/* head rock + follow-through on the OUTER group, tap-spin on the inner one, so a spin
          mid-idle does not cancel the rock */}
      <AnimatedG animatedProps={headProps} origin="50, 62">
        <AtlasMarkBody rings={ringProps} />
      </AnimatedG>
      <Circle cx={34.8} cy={26.5} r={whiteR[0]} fill="#fff" stroke={INK} strokeWidth={2.2} />
      <Circle cx={61.2} cy={25} r={whiteR[1]} fill="#fff" stroke={INK} strokeWidth={2.2} />
      <AnimatedG animatedProps={saccadeProps}>
        <AnimatedG animatedProps={openEyeProps}>{pupils()}{brows()}</AnimatedG>
        {blinkable && <AnimatedG animatedProps={closedEyeProps}>{closedEyes}</AnimatedG>}
      </AnimatedG>
      {glasses && (
        <>
          <G stroke="#141019" strokeWidth={4.4} opacity={0.9} fill="none">
            <Circle cx={34.8} cy={26.5} r={15.5} />
            <Circle cx={61.2} cy={25} r={14.3} />
            <Path d="M50.2 25.9 Q48 24.2 46.2 25.6" />
          </G>
          <G stroke="#EDEAF5" strokeWidth={2} fill="none">
            <Circle cx={34.8} cy={26.5} r={15.5} />
            <Circle cx={61.2} cy={25} r={14.3} />
            <Path d="M50.2 25.9 Q48 24.2 46.2 25.6" />
          </G>
        </>
      )}
    </G>
  );

  const svg = (
    <Svg width={size} height={size * 1.04} viewBox="0 0 100 104">
      {head}
    </Svg>
  );

  if (!interactive) {
    return (
      <Animated.View style={wrapStyle}>
        <Animated.View style={breathStyle}>{svg}</Animated.View>
      </Animated.View>
    );
  }

  return (
    <Pressable
      onPressIn={() => scale.set(withSpring(0.92, { stiffness: 420, damping: 32, mass: 1 }))}
      onPressOut={() => scale.set(withSpring(1, { stiffness: 420, damping: 32, mass: 1 }))}
      // Atlas is decorative here — tapping only spins the mascot. Announcing it as an image with a
      // name is right; announcing it as a BUTTON would promise a destination it does not have, and
      // an unnamed button is worse still. The interactive variants elsewhere carry their own label.
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={onPress ? 4 : undefined}
      onPress={handlePress}>
      <Animated.View style={wrapStyle}>
        <Animated.View style={breathStyle}>{svg}</Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/** Atlas arriving on a violet comet trail — celebratory entrances. */
export function AtlasComet({ size = 96 }: { size?: number }) {
  return (
    <Animated.View style={{ width: size * 1.55, height: size * 1.35 }}>
      <Svg viewBox="0 0 150 130" width={size * 1.55} height={size * 1.35} style={{ position: 'absolute' }}>
        <Path d="M6 126 L86 34 L124 68 Z" fill="#B862ED" opacity={0.3} />
        <Circle cx={34} cy={104} r={2.5} fill="#C89CF5" opacity={0.7} />
        <Circle cx={52} cy={88} r={1.8} fill="#B862ED" opacity={0.6} />
      </Svg>
      <Animated.View style={{ position: 'absolute', right: 0, top: 0, transform: [{ rotate: '-14deg' }] }}>
        <Atlas size={size} expression="happy" interactive={false} />
      </Animated.View>
    </Animated.View>
  );
}
