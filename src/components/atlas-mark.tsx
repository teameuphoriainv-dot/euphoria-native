/**
 * AtlasMark — the pinwheel, as four INDEPENDENT vector rings.
 *
 * This replaces the raster `atlas-logo.png`. That PNG was the ceiling on every piece of Atlas
 * motion: a bitmap can only be transformed as a whole, so every "animation" was one rigid
 * transform of the entire mark. Four separate <G>s can counter-rotate, splay, recoil and trail.
 *
 * The geometry is MEASURED off the PNG, not eyeballed — see scripts/trace-atlas-logo.py. Ring
 * centres sit on a 21.88 orbit around (51.01, 53.61) at 90 degree spacing with a 82.5 degree
 * pinwheel tilt; each ring is an annulus of band 14.72 centred on radius 15.53. Fitted against
 * the PNG's own alpha mask at IoU 0.951, so the silhouette is the same mark, not a redraw.
 *
 * THE WEAVE. The mark is interlocked, not stacked: each ring passes over one neighbour and
 * under the other. With four rings, painting in z-order 3,2,1,0 satisfies three of the four
 * crossings for free; only "ring3 back over ring0" cannot be expressed by z-order, because the
 * relation is a cycle. That one crossing is fixed by redrawing ring3 clipped to ring0's outer
 * disc. Clipping to the DISC rather than the annulus is deliberate and correct — where ring3
 * crosses ring0's hole it is already visible, so redrawing there is a no-op.
 *
 * Because a circle rotating about its own centre has an unchanged silhouette, that clip stays
 * valid under any per-ring ROTATION. It would need to follow along under translation or scale.
 */
import { memo } from 'react';

import { shade } from '@/lib/course-accents';
import Animated from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

/** The lit and shaded faces average to #C37DE7, which is the PNG's own measured median violet,
 *  so the mark keeps its colour rather than drifting pale. DARK is the brand's #A855EB. These
 *  are the asset's existing tones — no new hue enters the palette. */
const LIT = '#DEA5F5';
const DARK = '#A451E6';
const RIM = '#F1EFF5';

const R_MID = 15.53;
const BAND = 14.72;
const RIM_W = 1.21;
/** Outer edge, needed as the weave clip radius. */
const R_OUT = R_MID + BAND / 2;

/** Ring centres in the 100x104 design space — the same box the old <SvgImage> occupied, so
 *  every expression coordinate above this layer is untouched. Index is the weave order. */
export const RING_CENTRES = [
  { cx: 53.86, cy: 75.3 },
  { cx: 29.32, cy: 56.47 },
  { cx: 48.15, cy: 31.92 },
  { cx: 72.7, cy: 50.76 },
] as const;

/** Per-ring animated transforms, supplied by the caller. `undefined` renders the mark at rest. */
export type RingProps = Record<string, unknown>[] | undefined;

/**
 * TINTING, AND WHY IT COMES WITH AN ID NAMESPACE.
 *
 * The four ring gradients and the weave ClipPath were declared with FIXED ids -- atlasRing0..3
 * and atlasWeave. That is safe while every Atlas on a screen is the same colour, because they
 * all resolve to identical definitions and nobody can tell which one won. The moment two
 * instances want different colours, a fixed id is a collision: `url(#atlasRing0)` names one
 * definition, and every Atlas mounted would render in whichever tint happened to be defined
 * last rather than its own.
 *
 * So the namespace is derived from the tint itself. Two different tints can never share an id,
 * two instances of the SAME tint safely do (they are identical definitions, so sharing is the
 * correct outcome and costs one set of Defs instead of N).
 *
 * The untinted path is byte-for-byte what it always was -- same constants, same bare ids -- so
 * the default Atlas everywhere in the app renders exactly as before.
 */
function palette(tint?: string) {
  if (!tint) return { lit: LIT, dark: DARK, ns: '' };
  /* The house pair is a light stop over a deeper one. Taking the accent as the LIT stop and
     shading it for the DARK keeps that relationship at any hue without needing a second colour
     per course. 0.3 was matched against the default pair's own light-to-dark ratio. */
  return { lit: tint, dark: shade(tint, 0.3), ns: tint.replace(/[^0-9A-Za-z]/g, '') };
}

function Ring({ i, animated, ns = '' }: { i: number; animated?: Record<string, unknown>; ns?: string }) {
  const { cx, cy } = RING_CENTRES[i];
  const body = (
    <>
      {/* BAND is the artwork's FULL extent — the fit was against a mask that already included
          the white outline. So the rim spans the whole band and the violet is inset within it.
          Drawing violet across the full band and adding rim outside made the mark 2*RIM too
          large and shrank every hole. */}
      <Circle cx={cx} cy={cy} r={R_MID} fill="none" stroke={RIM} strokeWidth={BAND} />
      <Circle
        cx={cx}
        cy={cy}
        r={R_MID}
        fill="none"
        stroke={`url(#atlasRing${ns}${i})`}
        strokeWidth={BAND - RIM_W * 2}
      />
    </>
  );
  // origin is the ring's OWN centre, so a rotation spins the ring in place rather than
  // swinging it around the mark
  return animated ? (
    <AnimatedG animatedProps={animated as never} origin={`${cx}, ${cy}`}>{body}</AnimatedG>
  ) : (
    <G origin={`${cx}, ${cy}`}>{body}</G>
  );
}

/** The mark alone, drawn into an existing <Svg>. Caller owns the viewBox. */
function AtlasMarkBodyInner({ rings, tint }: { rings?: RingProps; tint?: string }) {
  const { lit, dark, ns } = palette(tint);
  return (
    <>
      <Defs>
        {RING_CENTRES.map((_, i) => (
          // objectBoundingBox units, so each ring gets its own highlight from one shared
          // definition — a single global gradient would flatten the outer rings
          <LinearGradient key={i} id={`atlasRing${ns}${i}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={lit} />
            <Stop offset="1" stopColor={dark} />
          </LinearGradient>
        ))}
        <ClipPath id={`atlasWeave${ns}`}>
          <Circle cx={RING_CENTRES[0].cx} cy={RING_CENTRES[0].cy} r={R_OUT} />
        </ClipPath>
      </Defs>
      {[3, 2, 1, 0].map((i) => (
        <Ring key={i} i={i} animated={rings?.[i]} ns={ns} />
      ))}
      {/* the one crossing z-order cannot express */}
      <G clipPath={`url(#atlasWeave${ns})`}>
        <Ring i={3} animated={rings?.[3]} ns={ns} />
      </G>
    </>
  );
}

/** Standalone mark, for previews and anywhere the face is not wanted. */
export function AtlasMark({ size = 120, rings, tint }: { size?: number; rings?: RingProps; tint?: string }) {
  return (
    <Svg width={size} height={size * 1.04} viewBox="0 0 100 104">
      <AtlasMarkBody rings={rings} tint={tint} />
    </Svg>
  );
}

/*
 * MEMOISED for the same reason the rest of the SVG set was: many child nodes, primitive props, and
 * previously no memo — the shape that cost AmbientBackground 14,629 Circle renders per scroll.
 * Smaller than the others, so the win is smaller; included because leaving one unmemoised member
 * of a set invites the next person to assume none of them need it.
 */
export const AtlasMarkBody = memo(AtlasMarkBodyInner);
