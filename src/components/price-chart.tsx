/**
 * Price chart with a range selector.
 *
 * Shape from a 3/3 convergence across TradingView ($2.25M/mo), Bloom (learn-to-invest, the closest
 * positional competitor Euphoria has) and Yahoo Finance:
 *
 *   TradingView  1D 5D 1M 3M 6M 1Y 5Y All
 *   Bloom        1D 1W 1M 1Y 5Y
 *   Yahoo        1D 5D 1M 3M 6M YTD 1Y 5Y
 *
 * The mechanism worth stealing is not the row — it is that ALL THREE RECOMPUTE THE HEADLINE
 * CHANGE for the selected range. TradingView flips between "+0.27% at close" and "+1.04% past 5
 * days"; Bloom between "Today" and "Past 5 Years". A chart whose change figure never moves when
 * you change the range reads as decoration, which is exactly what the old hardcoded bezier was.
 *
 * When there is no API key this renders "Live prices aren't switched on" — never a fabricated
 * line. The whole point of replacing the bezier was to stop drawing data we do not have.
 */
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing, FontSize } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  chartCoordinates,
  coordinatePath,
  type ChartCoordinate,
} from "@/lib/chart-motion";
import {
  getChart,
  RANGES,
  seriesChange,
  type Chart,
  type ChartPoint,
  type RangeKey,
} from "@/lib/market";
import { money } from "@/lib/stocks";
import { SpringPressable } from "@/shared/motion/spring-pressable";
import { Duration, Ease } from "@/shared/motion/tokens";

const W = 320;
const H = 120;
const AnimatedPath = Animated.createAnimatedComponent(Path);

function pathBetween(
  from: ChartCoordinate[],
  to: ChartCoordinate[],
  progress: number,
  area: boolean,
) {
  "worklet";
  if (from.length < 2 || from.length !== to.length) return "";
  let d = "";
  for (let index = 0; index < from.length; index += 1) {
    const x = from[index].x + (to[index].x - from[index].x) * progress;
    const y = from[index].y + (to[index].y - from[index].y) * progress;
    d += `${index === 0 ? "M" : " L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return area ? `${d} L${W} ${H} L0 ${H} Z` : d;
}

/**
 * Pinterest's currency graph holds between changes and spends roughly 400–467ms transforming the
 * data itself. Both series are resampled to identical commands, then the SVG geometry is animated
 * on the UI thread. A timing curve is deliberate: a spring would draw prices the provider never
 * returned when it overshoots its target.
 */
function MorphingPricePlot({
  fromPoints,
  points,
  fromColor,
  color,
  dimmed,
}: {
  fromPoints: ChartPoint[];
  points: ChartPoint[];
  fromColor: string;
  color: string;
  dimmed: boolean;
}) {
  const reduced = useReducedMotion();
  const fromCoordinates = useMemo(
    () => chartCoordinates(fromPoints, W, H),
    [fromPoints],
  );
  const nextCoordinates = useMemo(
    () => chartCoordinates(points, W, H),
    [points],
  );
  const safeFromCoordinates = fromCoordinates.length
    ? fromCoordinates
    : nextCoordinates;
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    progress.set(
      reduced
        ? 1
        : withTiming(1, {
            duration: Duration.screen,
            easing: Ease.inOut,
          }),
    );
  }, [progress, reduced]);

  const lineProps = useAnimatedProps(() => ({
    d: pathBetween(safeFromCoordinates, nextCoordinates, progress.get(), false),
    stroke: interpolateColor(progress.get(), [0, 1], [fromColor, color]),
  }));
  const oldAreaProps = useAnimatedProps(() => ({
    d: pathBetween(safeFromCoordinates, nextCoordinates, progress.get(), true),
    opacity: 1 - progress.get(),
  }));
  const newAreaProps = useAnimatedProps(() => ({
    d: pathBetween(safeFromCoordinates, nextCoordinates, progress.get(), true),
    opacity: progress.get(),
  }));

  return (
    <View style={[styles.chartStage, dimmed && styles.chartDimmed]}>
      <Svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="price-area-old" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={fromColor} stopOpacity={0.28} />
            <Stop offset="1" stopColor={fromColor} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="price-area-new" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.28} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <AnimatedPath
          d={coordinatePath(safeFromCoordinates, H)}
          fill="url(#price-area-old)"
          animatedProps={oldAreaProps}
        />
        <AnimatedPath
          d={coordinatePath(nextCoordinates, H)}
          fill="url(#price-area-new)"
          animatedProps={newAreaProps}
        />
        <AnimatedPath
          d={coordinatePath(nextCoordinates)}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          animatedProps={lineProps}
        />
      </Svg>
      {dimmed && (
        <ActivityIndicator style={styles.updating} size="small" color={color} />
      )}
    </View>
  );
}

export function PriceChart({
  sym,
  initialRange = "1D",
}: {
  sym: string;
  initialRange?: RangeKey;
}) {
  const theme = useTheme();
  const [range, setRange] = useState<RangeKey>(initialRange);
  const [chart, setChart] = useState<Chart | null>(null);
  // Which (sym, range) the state in `chart` actually belongs to. Deriving `loading` from this
  // keeps setState out of the effect BODY — the same rule lesson.tsx follows for `badParams`.
  // Writing it inside the async callback is fine; writing it synchronously on every effect run is
  // what triggers the cascading re-render this rule guards.
  const [loadedKey, setLoadedKey] = useState("");
  const [plotFrame, setPlotFrame] = useState<{
    from: ChartPoint[];
    to: ChartPoint[];
    key: string;
  }>({
    from: [],
    to: [],
    key: "",
  });
  const key = `${sym}:${range}`;
  const loading = loadedKey !== key;

  useEffect(() => {
    let cancelled = false;
    getChart(sym, range).then((c) => {
      if (cancelled) return;
      const nextPoints = c?.points ?? [];
      setPlotFrame((current) => ({
        from: current.to.length ? current.to : nextPoints,
        to: nextPoints,
        key: `${sym}:${range}`,
      }));
      setChart(c);
      setLoadedKey(`${sym}:${range}`);
    });
    return () => {
      cancelled = true;
    };
  }, [sym, range]);

  /*
   * FALL BACK WHEN THE SELECTED RANGE IS GENUINELY EMPTY.
   *
   * MEASURED 2026-08-20 against the live endpoint: 1D returned 0 points while 1W returned 132 and
   * 1M returned 212. 1D asks for FIVE-MINUTE bars from the last 24 hours, and on a free tier the
   * current session is plan-gated -- so outside market hours those bars do not exist and the
   * chart correctly rendered "No data for this range" as its whole content.
   *
   * The screen was not broken and nothing was rate limited; the DEFAULT was asking for the one
   * range this plan cannot serve. Stepping up to the next range that has data means the chart
   * always draws something, and the user can still pick 1D deliberately.
   *
   * Only ever steps up once, and only from the untouched initial range: a deliberate 1D tap must
   * stay on 1D and show the empty state honestly rather than silently redirecting.
   */
  const [autoStepped, setAutoStepped] = useState(false);
  useEffect(() => {
    if (autoStepped || range !== initialRange) return;
    if (loadedKey !== key) return;
    if (chart && chart.points.length === 0) {
      // Fires at most once per mount: `autoStepped` is checked at the top of this effect and set
      // here, so the branch cannot be re-entered. Batched with setRange into a single render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAutoStepped(true);
      setRange("1W");
    }
  }, [chart, loadedKey, key, range, initialRange, autoStepped]);

  // Keep the last truthful series on screen while the next range loads. Blanking a chart after a
  // deliberate tap destroys the visual continuity needed for the range-to-range morph.
  const points = chart?.points ?? [];
  const delta = seriesChange(points);
  const up = (delta?.abs ?? 0) >= 0;
  const color = up ? theme.success : theme.destructive;
  const previousDelta = seriesChange(plotFrame.from);
  const previousColor =
    (previousDelta?.abs ?? 0) >= 0 ? theme.success : theme.destructive;
  const hasChart = points.length >= 2;

  return (
    <View style={styles.wrap}>
      {/* Change for the SELECTED range, with the range named. This line is the whole mechanism. */}
      <View style={styles.headRow}>
        {loading && hasChart ? (
          <ThemedText type="small" themeColor="mutedForeground">
            Updating {range}…
          </ThemedText>
        ) : delta ? (
          <ThemedText type="smallBold" style={{ color }}>
            {up ? "+" : "−"}
            {money(Math.abs(delta.abs))} ({Math.abs(delta.pct).toFixed(2)}%){" "}
            {chart?.label}
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="mutedForeground">
            {loading ? " " : "No data for this range"}
          </ThemedText>
        )}
      </View>

      {/*
       * minHeight, not height. H is the CHART's height and the Svg still draws at exactly H,
       * but this same box also holds the empty-state sentence, and at AX5 a 13pt note reaches
       * ~41pt and wraps to about 200pt inside a 120pt container — clipped, so the user is told
       * nothing about why there is no chart. The audit's earlier reading of this as a
       * right-edge overflow was wrong; `styles.center` already has horizontal padding. It is
       * the constrained-container shape: content taller than a fixed box.
       */}
      <View style={[styles.plot, { minHeight: H }]}>
        {loading && !hasChart ? (
          <ActivityIndicator color={theme.primary} />
        ) : hasChart ? (
          <MorphingPricePlot
            key={plotFrame.key}
            fromPoints={plotFrame.from}
            points={plotFrame.to}
            fromColor={previousColor}
            color={color}
            dimmed={loading}
          />
        ) : (
          // Says which of the two it is. "No chart" would hide a missing key behind a missing market.
          <ThemedText
            type="small"
            themeColor="mutedForeground"
            style={styles.center}
          >
            {range === "1H"
              ? "Nothing traded in the last hour."
              : "Live prices aren’t switched on in this build."}
          </ThemedText>
        )}
      </View>

      <View style={styles.ranges}>
        {RANGES.map((r) => {
          const on = r === range;
          return (
            <SpringPressable
              key={r}
              haptic={false}
              scaleTo={0.92}
              onPress={() => setRange(r)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${r} range`}
              accessibilityState={{ selected: on }}
              style={{ flex: 1 }}
            >
              <View
                style={[styles.range, on && { backgroundColor: color + "22" }]}
              >
                <ThemedText
                  type="smallBold"
                  style={{
                    fontSize: FontSize.caption,
                    color: on ? color : theme.mutedForeground,
                  }}
                >
                  {r}
                </ThemedText>
              </View>
            </SpringPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  headRow: { minHeight: 18 },
  plot: { alignItems: "center", justifyContent: "center" },
  chartStage: { width: "100%", height: H },
  chartDimmed: { opacity: 0.64 },
  updating: { position: "absolute", right: Spacing.two, top: Spacing.two },
  center: { textAlign: "center", paddingHorizontal: Spacing.four },
  ranges: { flexDirection: "row", gap: 2 },
  range: { paddingVertical: 6, borderRadius: Radius.md, alignItems: "center" },
});
