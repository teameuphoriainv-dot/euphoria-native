/**
 * Scroll-linked reveal, used SELECTIVELY (owner decision: Home's lower sections only, not every list).
 *
 * Content below the fold used to be mounted -- and its RiseIn played -- while off screen, so by the
 * time you scrolled to it, it just sat there. <RevealScrollView> shares its scroll position and
 * viewport height; a <Reveal> inside it rises in ONCE, the first time its top crosses 90% of the
 * viewport, then never animates again (scrolling back up does not replay it). Anything already on
 * screen at mount reveals immediately. Reduced Motion: no reveal, content is simply there.
 *
 * A <Reveal> must be a DIRECT child of the RevealScrollView's content: it measures its own layout
 * y, which is only a scroll offset when its parent is the scroll content itself.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { type LayoutChangeEvent, type ScrollViewProps, type StyleProp, type ViewStyle, useWindowDimensions } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Duration, Ease } from './tokens';

const REVEAL_LINE = 0.9;
const RISE = 14;

type Ctx = { scrollY: SharedValue<number>; viewportH: number } | null;
const RevealContext = createContext<Ctx>(null);

export function RevealScrollView({
  children,
  scrollY: external,
  ...rest
}: ScrollViewProps & { children: ReactNode; /** Optional: share scroll position with siblings (e.g. CompactTitle). */ scrollY?: SharedValue<number> }) {
  const own = useSharedValue(0);
  const scrollY = external ?? own;
  const { height } = useWindowDimensions();
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });
  return (
    <RevealContext.Provider value={{ scrollY, viewportH: height }}>
      <Animated.ScrollView {...rest} onScroll={onScroll} scrollEventThrottle={16}>
        {children}
      </Animated.ScrollView>
    </RevealContext.Provider>
  );
}

export function Reveal({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const ctx = useContext(RevealContext);
  const reduced = useReducedMotion();
  const [top, setTop] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const p = useSharedValue(reduced || !ctx ? 1 : 0);

  const onLayout = (e: LayoutChangeEvent) => {
    if (top === null) setTop(e.nativeEvent.layout.y);
  };

  useAnimatedReaction(
    () => (ctx && top !== null ? ctx.scrollY.get() + ctx.viewportH * REVEAL_LINE >= top : false),
    (visible, was) => {
      if (visible && !was && !shown) {
        p.set(withTiming(1, { duration: Duration.base, easing: Ease.enter }));
        scheduleOnRN(setShown, true);
      }
    },
    [top, shown],
  );

  const animated = useAnimatedStyle(() => ({
    opacity: p.get(),
    transform: [{ translateY: (1 - p.get()) * RISE }],
  }));

  return (
    <Animated.View onLayout={onLayout} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}
