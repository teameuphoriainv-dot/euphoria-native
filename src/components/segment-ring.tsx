/**
 * <SegmentRing> — the "how much of this lesson is done" ring that wraps a path node face and the
 * Home continue pill (design section 5, owner decision: ONE node per lesson with a ring that fills
 * per part, NOT three nodes).
 *
 * WHY A RING AND NOT THREE NODES. The owner's decision. Three nodes would have tripled the path's
 * length, moved every `doneFlags.indexOf(false)` index that learn.tsx pins, and made "lesson 7 of
 * 25" mean nothing. A ring adds part progress without moving a single node.
 *
 * WHY THIS FILE DRAWS NOTHING ELSE. It takes `filled` as a NUMBER OF WHOLE ARCS and no lesson
 * state, so learn.tsx and home.tsx cannot disagree about what a filled arc means, and this file
 * never imports the store, the curriculum or the segment module. W5 owns both call sites.
 *
 * NO ANIMATION LIVES HERE. `filled` is a prop, so the caller decides whether a newly earned arc
 * appears instantly (the path, on mount) or is handed over by a trail celebration (W5). Putting a
 * fill animation here would have replayed it on every scroll remount of the path, which is the
 * defect the 25-node list makes expensive: a ring re-animating under the thumb reads as progress
 * being re-earned.
 */
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

/**
 * The gap between arcs, in degrees.
 *
 * Prevents: two touching arcs reading as one continuous ring, which would make a half-done lesson
 * look finished. Degrees rather than points so one constant holds at every call size.
 *
 * MEASURED at the path's size 44 / stroke 4, where the stroke centre radius is 20 and the
 * circumference is 125.7pt: 10 degrees is a 3.5pt gap and leaves each of three arcs 38.4pt. A
 * 3 degree gap at the same size is 1.0pt, which is a quarter of the 4pt stroke and reads as an
 * anti-aliasing artefact rather than as a cut.
 */
const GAP_DEG = 10;

export function SegmentRing({
  size,
  segments,
  filled,
  accent,
  track,
  stroke = 4,
}: {
  /** Outer diameter in points. The stroke is drawn INSIDE this box, so it never clips. */
  size: number;
  /** How many arcs the ring is cut into. 2 or 3 in this app; 1 draws a plain ring. */
  segments: number;
  /** How many arcs are painted in `accent`, counted from the top, clockwise. */
  filled: number;
  /** Painted arcs. The course accent at both call sites. */
  accent: string;
  /** Unpainted arcs. `theme.border` at both call sites. */
  track: string;
  stroke?: number;
}) {
  const n = Math.max(1, Math.floor(segments));
  const done = Math.max(0, Math.min(n, Math.floor(filled)));
  /* Radius is measured to the CENTRE of the stroke. Using size/2 would hang half the stroke
     outside the box and let the node face's own border clip it on the path. */
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const step = 360 / n;
  /* A single arc has no neighbour to be told apart from, so it keeps the whole circle. */
  const gap = n === 1 ? 0 : GAP_DEG;
  const sweep = step - gap;

  return (
    /* Decorative. The ring repeats what the node's own accessibility label already says ("Part 2
       of 3 next", W5), and CONSTITUTION 5.1 is "say a thing once": a second announcement here
       would make VoiceOver read the same fact twice on every node of a 25-node path. */
    <View
      style={{ width: size, height: size }}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size}>
        {/* -90 puts arc 0 at the top. Without it every ring would start at 3 o'clock, so a
            half-done 2-part ring would paint the RIGHT half and read as a direction rather than
            as an amount. */}
        <G rotation={-90} origin={`${String(size / 2)}, ${String(size / 2)}`}>
          {Array.from({ length: n }, (_, i) => {
            const startLen = ((i * step + gap / 2) / 360) * circ;
            const arcLen = (sweep / 360) * circ;
            return (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={i < done ? accent : track}
                strokeWidth={stroke}
                fill="none"
                /* Butt caps, not round. A round cap adds stroke/2 of paint at EACH end, so at the
                   path's 4pt stroke every arc grows 4pt while the gap between two of them loses
                   the same 4pt. The measured gap at size 44 is 3.5pt, so round caps would close it
                   entirely and the arcs would touch again. */
                strokeLinecap="butt"
                strokeDasharray={[arcLen, circ - arcLen]}
                /* Negative offset advances the dash ALONG the path, so the painted run begins at
                   `startLen`. A positive offset walks it backwards and lands arc 0 near the end
                   of the circle. */
                strokeDashoffset={-startLen}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}
