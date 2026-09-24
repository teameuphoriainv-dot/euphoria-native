/**
 * NumberFlow, with the two clipping bugs fixed at the source. Import this, never
 * 'number-flow-react-native' directly (scripts/number-flow-pin.mjs fails the check if you do).
 *
 * 1. CUT OFF ON THE RIGHT ("20" drawn as "2" + half a "0"). NumberFlow sizes each digit slot from
 *    a measurement of the style it is given. With no fontFamily it measured the system font while
 *    the app draws DM Sans, and `fontWeight` is ignored by the custom family, so the heavy digits
 *    that were drawn were wider than the ones measured. A fontFamily is always set here, and
 *    fontWeight is dropped: weight is chosen by family (Fonts.black etc.), as everywhere else.
 * 2. CUT OFF TOP AND BOTTOM. NumberFlow fades the top/bottom edge of every digit slot; with no
 *    lineHeight the slot was barely taller than the glyph and the fade ate the digit. lineHeight
 *    is forced to at least 1.3x the font size so the fade lands in empty space.
 */
import { NumberFlow } from 'number-flow-react-native';
import type { ComponentProps } from 'react';
import { StyleSheet, type TextStyle } from 'react-native';

import { Fonts } from '@/constants/theme';

type Props = ComponentProps<typeof NumberFlow>;

const MIN_LINE_RATIO = 1.3;

export function AppNumberFlow({ style, ...rest }: Props) {
  const flat: TextStyle = StyleSheet.flatten(style) ?? {};
  const { fontWeight: _ignored, ...s } = flat;
  const fontSize = s.fontSize ?? 16;
  const lineHeight = Math.max(s.lineHeight ?? 0, Math.round(fontSize * MIN_LINE_RATIO));
  return <NumberFlow {...rest} style={{ ...s, fontFamily: s.fontFamily ?? Fonts.semibold, fontSize, lineHeight }} />;
}
