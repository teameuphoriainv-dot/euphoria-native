/**
 * Mock market data for the Trade screen + stock detail. Single source of truth so the
 * Trade rows and the stock/[sym] reader stay in sync. Wire to live quotes in Phase 16.
 */
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
