type ScrollMeasurement = {
  measuredKey: string;
  activeKey: string;
  offsetY: number;
  windowY: number;
  anchorY?: number;
};

/** Convert a current-chain window measurement to a content offset; stale measurements are inert. */
export function chainScrollTarget({
  measuredKey,
  activeKey,
  offsetY,
  windowY,
  anchorY = 300,
}: ScrollMeasurement): number | null {
  if (measuredKey !== activeKey) return null;
  if (![offsetY, windowY, anchorY].every(Number.isFinite)) return null;
  return Math.max(0, offsetY + windowY - anchorY);
}
