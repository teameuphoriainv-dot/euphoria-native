/**
 * <PathNode> — the raised, pressable node the learning path is built from.
 *
 * WHY THIS EXISTS. The node was written inline inside learn.tsx, which is the only reason Home
 * could not use it. Audited side by side, Learn has a focal point and Home does not: Learn gives
 * you one lit green node that plainly means "start here", while Home rendered the same courses
 * as three flat rows of identical geometry with every counter reading zero. Home was a worse
 * copy of Learn. Extracting the node is what lets Home speak Learn's language instead of
 * inventing a second one — and a second visual language is exactly the drift this codebase has
 * spent its regression lanes stamping out everywhere else.
 *
 * ANATOMY — the raise is three flat layers, not a blur:
 *   lip        a darker plate of the same shape, offset DOWN by NODE_LIP. This is the side wall.
 *   face       the lit top plate.
 *   highlight  a 15%-white strip inset at the top of the face — the specular hit that tells the
 *              eye the surface is convex rather than a circle with a border.
 * The shell's shadow is deliberately `shadowRadius: 0`. A blurred shadow reads as a soft UI
 * sticker; a hard offset shadow reads as a physical object sitting on a surface, which is the
 * whole point of the shape and what makes it look pressable before anything moves.
 *
 * The press itself is SpringPressable, so the node inherits Spring.press and its haptic rather
 * than carrying a second press implementation.
 */
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius } from '@/constants/theme';
import { shade } from '@/lib/course-accents';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/**
 * EXPORTED so learn.tsx can import them rather than keeping its own copies. learn.tsx still
 * renders its own markup for now — it is pinned by several regression lanes and migrating the
 * render is a separate, testable step — but sharing the CONSTANTS means the two screens cannot
 * drift apart on colour or depth in the meantime, which is the failure mode that produced two
 * visual languages in the first place.
 */
export const NODE_CURRENT_COLOR = '#22C55E';
export const NODE_LOCKED_COLOR = '#17141F';
export const NODE_UPCOMING_COLOR = '#17141F';
export const NODE_CHALLENGE_COLOR = '#F59E0B';
/** Side-wall height. 4pt at a 56pt node; scaled with size so a big node does not look pasted on. */
export const NODE_LIP = 4;
/** The glyph ink. Named once rather than repeated: the check and the play triangle are the same
 *  white, and design-rules-pin counts every hex literal in the file. */
const GLYPH_INK = '#FFFFFF';

export type PathNodeState = 'current' | 'done' | 'upcoming' | 'locked';

/**
 * The play triangle, as a CSS-border triangle rather than an SVG: ui-icon.tsx has no `play`
 * glyph, and this shape is three border widths. Exported so the node and Home's continue bar
 * draw the SAME triangle -- a second hand-rolled one would drift on proportion the first time
 * either is tweaked.
 */
export function PlayGlyph({ scale = 1, color = GLYPH_INK }: { scale?: number; color?: string }) {
  return (
    <View
      style={{
        width: 0,
        height: 0,
        marginLeft: 4 * scale,
        borderTopWidth: 10 * scale,
        borderBottomWidth: 10 * scale,
        borderLeftWidth: 17 * scale,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: color,
      }}
    />
  );
}

function faceColor(state: PathNodeState, doneColor: string) {
  if (state === 'locked') return NODE_LOCKED_COLOR;
  if (state === 'current') return NODE_CURRENT_COLOR;
  if (state === 'done') return doneColor;
  return NODE_UPCOMING_COLOR;
}

export function PathNode({
  state,
  size = 56,
  doneColor = NODE_CURRENT_COLOR,
  label,
  onPress,
  disabled,
  accessibilityLabel,
  style,
}: {
  state: PathNodeState;
  size?: number;
  /** Face colour when complete — the course accent, so a finished node wears its subject. */
  doneColor?: string;
  /** Rendered instead of the state glyph. Used for a numbered upcoming node. */
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}) {
  const locked = state === 'locked';
  const face = faceColor(state, doneColor);
  /* 0.45 darker is the side wall. Locked drops to near-black instead: a locked node should read
   * as unlit, and shading an already-dark face produces no visible wall at all. */
  const lip = locked ? '#09090D' : shade(face, 0.45);
  /* The raise scales with the node so a 96pt launchpad node is not wearing a 56pt node's 4pt
   * wall, which reads as flat at that size. */
  const rise = Math.max(NODE_LIP, Math.round((size / 56) * NODE_LIP));
  const glyphScale = size / 56;

  const body = (
    <View style={[styles.shell, { shadowOffset: { width: 0, height: rise + 1 } }]}>
        <View style={[styles.lip, { width: size, height: size, top: locked ? 3 : rise, backgroundColor: lip }]} />
        <View style={[styles.face, { width: size, height: size, backgroundColor: face }]}>
          {/*
            * NOT ON A LOCKED NODE. The strip is 15% white — on a saturated face it blends into a
            * lighter shade of that colour and reads as gloss on a raised button. The locked face
            * is near-black, so there is no colour to blend with and the same strip renders as a
            * separate grey pill inside the circle. Reported from the Learn trail as "why is there
            * a curved rectangle on the top of the circle".
            *
            * The locked node also loses its lip to the background (a black side wall on a black
            * page), so the strip ends up the only thing drawn on it. Suppressing it is the honest
            * state as well as the tidier one: gloss says "raised, press me", and locked is inert.
            */}
          {locked ? null : (
            <View
              pointerEvents="none"
              style={[styles.highlight, { top: 4 * glyphScale, left: 9 * glyphScale, right: 9 * glyphScale, height: 7 * glyphScale }]}
            />
          )}
          {label !== undefined ? (
            <ThemedText type="bodyMedium" style={styles.numeral}>{label}</ThemedText>
          ) : state === 'done' ? (
            <UIcon name="check" size={Math.round(24 * glyphScale)} color="#FFFFFF" strokeWidth={3.25} />
          ) : state === 'current' ? (
            <PlayGlyph scale={glyphScale} />
          ) : (
            <UIcon name="lock" size={Math.round(19 * glyphScale)} color="#777381" />
          )}
        </View>
    </View>
  );

  /*
   * NO onPress => NO SpringPressable. Home's hero card is itself the button ("the card is the
   * button" — see home.tsx), so wrapping the node in a second pressable there would nest two
   * touchables: both would scale on the same tap, compounding to roughly 0.91 * 0.95, and the
   * inner one would swallow presses that belong to the card. Decoration renders as decoration.
   */
  if (!onPress) return <View style={style}>{body}</View>;

  return (
    <SpringPressable
      haptic={!locked}
      scaleTo={0.91}
      onPress={onPress}
      disabled={disabled ?? locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled ?? locked }}
      accessibilityLabel={accessibilityLabel}
      style={style}>
      {body}
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.36,
    /* Deliberately 0. See the anatomy note above — a blurred shadow kills the physicality. */
    shadowRadius: 0,
    elevation: 4,
  },
  lip: { position: 'absolute', left: 0, borderRadius: Radius.pill },
  face: { alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill },
  highlight: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.pill },
  numeral: { color: '#F4F4F5' },
});
