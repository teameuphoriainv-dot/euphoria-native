import { valueOf } from './portfolio-value';

export type PortfolioPoint = { t: number; v: number };

type SnapshotInput = {
  at?: number;
  cash: number;
  positions: Record<string, number>;
  derivatives: { premium: number }[];
  priceOf: (sym: string) => number;
};

/**
 * Append one mark-to-market observation using the same valuation rule as the headline.
 * The caller decides when a new observation is warranted; this function only owns valuation
 * consistency and the persisted-history bound.
 */
export function appendPortfolioSnapshot(
  history: PortfolioPoint[],
  { at = Date.now(), cash, positions, derivatives, priceOf }: SnapshotInput,
): PortfolioPoint[] {
  const v = valueOf(cash, positions, derivatives, priceOf);
  if (!Number.isFinite(at) || !Number.isFinite(v)) return history;
  return [...history, { t: at, v }].slice(-500);
}

/**
 * Market refreshes matter only while shares are exposed to a mark. Keeping an untouched all-cash
 * account empty preserves the product promise that its chart begins with the first position.
 */
export function appendMarketPortfolioSnapshot(
  history: PortfolioPoint[],
  input: SnapshotInput,
): PortfolioPoint[] {
  const hasMarkedShares = Object.values(input.positions).some((shares) => shares > 0);
  return hasMarkedShares ? appendPortfolioSnapshot(history, input) : history;
}
