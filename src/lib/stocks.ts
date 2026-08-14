/**
 * The static price table, and the formatting helpers the whole app shares.
 *
 * Phase 16 (2026-08-13) demoted this from "the market" to "the fallback": `priceOf` now prefers a
 * live mark from `lib/marks.ts` and only falls back here. Names, blurbs and the holdings/watch lists
 * are still real data from this table — only the PRICE is superseded.
 */
import { markOr } from './marks';

export type Stock = {
  sym: string;
  name: string;
  price: string;
  chg: number; // percent, today
  qty?: string; // present if held
  value?: string; // position value if held
  blurb: string;
};

export const STOCKS: Record<string, Stock> = {
  NVDA: { sym: 'NVDA', name: 'NVIDIA', price: '$1,184.00', chg: 3.1, qty: '12 sh', value: '$14,208', blurb: 'Designs the GPUs powering the AI boom — data-center demand is the story.' },
  AAPL: { sym: 'AAPL', name: 'Apple', price: '$228.50', chg: 0.8, qty: '40 sh', value: '$9,140', blurb: 'iPhone maker with a services engine and one of the strongest balance sheets on Earth.' },
  TSLA: { sym: 'TSLA', name: 'Tesla', price: '$244.00', chg: -1.7, qty: '18 sh', value: '$4,392', blurb: 'EV leader whose valuation rides on robotaxi, energy, and autonomy bets.' },
  MSFT: { sym: 'MSFT', name: 'Microsoft', price: '$445.55', chg: 0.4, qty: '9 sh', value: '$4,010', blurb: 'Cloud (Azure) + enterprise software + a front-row seat in AI via OpenAI.' },
  AMZN: { sym: 'AMZN', name: 'Amazon', price: '$201.44', chg: 1.9, blurb: 'E-commerce plus AWS — the cloud arm quietly drives most of the profit.' },
  META: { sym: 'META', name: 'Meta', price: '$612.30', chg: -0.6, blurb: 'Instagram, WhatsApp, and Facebook — an advertising machine funding the metaverse.' },
  GOOGL: { sym: 'GOOGL', name: 'Alphabet', price: '$182.11', chg: 2.4, blurb: 'Search and YouTube ad dominance, with Cloud and Gemini as the growth frontier.' },
};

export const HOLDINGS = ['NVDA', 'AAPL', 'TSLA', 'MSFT'].map((s) => STOCKS[s]);
export const WATCH = ['AMZN', 'META', 'GOOGL'].map((s) => STOCKS[s]);

/** Every ticker, for the buy screen and portfolio maths. */
export const ALL_SYMS = Object.keys(STOCKS);

/**
 * Price as a NUMBER.
 *
 * `price` is authored as a display string (`'$1,184.00'`) and several screens render it directly,
 * so parsing here is cheaper and safer than migrating the shape and every reader with it. The
 * moment live quotes land this is the one function that changes.
 */
/**
 * The app's canonical mark, for EXECUTING a trade and for VALUING the resulting position. Phase 16
 * put a live mark behind it (`lib/marks.ts`); the static table is now the fallback, not the source.
 *
 * Deliberately still SYNCHRONOUS. `valueOf()`, `snapshot()`, the Trade rows, the options spot and
 * cost basis all call this inline, and making it async would push a promise into the money path for
 * no gain — the mark is a cached number by the time anyone reads it.
 *
 * Order is live mark → static table → 0. A ticker that has never been quoted values exactly as it
 * did before Phase 16, so nothing regresses while the cache is cold.
 */
export const priceOf = (sym: string): number =>
  markOr(sym, Number(STOCKS[sym]?.price.replace(/[$,]/g, '')) || 0);

/**
 * Share counts, formatted once for the whole app.
 *
 * Free-stock rewards credit FRACTIONAL shares — $1 of a $1,184 stock is 0.000844594594... which
 * renders as exactly that if you interpolate the raw number. Whole positions must still read as
 * "3", not "3.00".
 */
export const shares = (n: number): string => {
  if (n === 0) return '0';
  if (Number.isInteger(n)) return String(n);
  if (n >= 1) return n.toFixed(2).replace(/\.?0+$/, '');
  // Below one share, two significant figures is the most that carries meaning.
  return n.toPrecision(2).replace(/0+$/, '').replace(/\.$/, '');
};

/** Money, formatted the one way the whole app formats it. */
export const money = (n: number): string =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
