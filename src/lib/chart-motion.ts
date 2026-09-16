import type { ChartPoint } from "@/lib/market";

export type ChartCoordinate = { x: number; y: number };

/**
 * Turn every market range into the same SVG command structure so one real series can morph into
 * another. Sampling is linear along the provider's ordered bars; it changes only the drawing
 * density, never the first/last value or the change figure shown to the user.
 */
export function chartCoordinates(
  points: ChartPoint[],
  width: number,
  height: number,
  samples = 64,
  pad = 2,
): ChartCoordinate[] {
  if (points.length < 2 || samples < 2) return [];

  const sampled = Array.from({ length: samples }, (_, index) => {
    const position = (index / (samples - 1)) * (points.length - 1);
    const left = Math.floor(position);
    const right = Math.min(points.length - 1, Math.ceil(position));
    const mix = position - left;
    return points[left].c + (points[right].c - points[left].c) * mix;
  });

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const span = max - min;
  const innerHeight = height - pad * 2;

  return sampled.map((value, index) => ({
    x: (index / (samples - 1)) * width,
    y:
      span === 0
        ? height / 2
        : pad + innerHeight - ((value - min) / span) * innerHeight,
  }));
}

export function coordinatePath(
  points: ChartCoordinate[],
  height?: number,
): string {
  if (points.length < 2) return "";
  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
  return height === undefined
    ? line
    : `${line} L${points[points.length - 1].x.toFixed(2)} ${height} L0 ${height} Z`;
}
