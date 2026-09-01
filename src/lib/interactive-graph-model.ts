import type { ExplorableStepData, InteractiveGraphStep } from '@/lib/curriculum';

export type InteractiveGraphInput = InteractiveGraphStep | ExplorableStepData;

export type ResolvedGraphType =
  | 'exponential' | 'comparison' | 'timeline' | 'pie' | 'bar' | 'balanceSheet'
  | 'gauge' | 'waterfall' | 'meter' | 'scatter' | 'distribution' | 'heatmap'
  | 'multiline' | 'financialChart' | 'funnel' | 'line'
  | 'compoundGrowthLab' | 'inflationEroder' | 'portfolioMixer';

export type GraphPoint = { x: number; y: number };
export type GraphSeries = { label: string; points: GraphPoint[] };
export type GraphBar = { label: string; value: number; start?: number; end?: number; max?: number };
export type GraphSlice = { label: string; value: number };
export type GraphCell = { row: number; column: number; value: number };
export type GraphMarker = { x: number; label: string; value?: number };
export type GraphCandle = { x: number; open: number; high: number; low: number; close: number };

export type InflationEroderModel = {
  kind: 'inflationEroder';
  bill: number;
  totalTickets: number;
  purchasingPower: number;
  survivors: number;
  marginalFraction: number;
  lostPercent: number;
  revealReady: boolean;
  halfLost: boolean;
};

export type CompoundGrowthModel = {
  kind: 'compoundGrowthLab';
  startingAmount: number;
  annualReturn: number;
  years: number;
  monthly: number;
  mountAnnualReturn: number;
  mountYears: number;
  mountMonthly: number;
  endValue: number;
  contributed: number;
  growthPortion: number;
  ghostEnd: number;
  domainMax: number;
  crossoverYear?: number;
  tenYearDelta: number;
  doubleMonthlyDelta: number;
  hotterReturnDelta: number;
};

export type PortfolioCrashModel = {
  id: 'gfc' | 'dotcom' | 'infl22';
  label: string;
  blurb: string;
  yours: number;
  allStock: number;
  yoursRecoveryYears: number;
  allStockRecoveryYears: number;
};

export type PortfolioMixerModel = {
  kind: 'portfolioMixer';
  principal: number;
  years: number;
  stocks: number;
  bonds: number;
  cash: number;
  medianEnd: number;
  bestEnd: number;
  worstEnd: number;
  riskPercent: number;
  riskLabel: 'Low' | 'Moderate' | 'High' | 'Very high';
  crash?: PortfolioCrashModel;
};

export type InteractiveGraphModel = {
  /** Keep the authored graph family. A graph's semantics cannot survive a four-type bottleneck. */
  presentation: ResolvedGraphType;
  axisStart?: string;
  axisEnd?: string;
  series: GraphSeries[];
  bars: GraphBar[];
  slices: GraphSlice[];
  cells: GraphCell[];
  labels: string[];
  markers: GraphMarker[];
  candles: GraphCandle[];
  range?: { xMin: number; xMax: number; yMin: number; yMax: number };
  summary?: { label: string; value: number; unit?: string; detail?: string };
  explorable?: CompoundGrowthModel | InflationEroderModel | PortfolioMixerModel;
  accessibilityLabel: string;
};

export type GraphSlider = NonNullable<InteractiveGraphStep['sliders']>[number];

const DEFAULT_SLIDERS: Record<ResolvedGraphType, GraphSlider[]> = {
  exponential: [
    { label: 'Annual Return', min: 1, max: 15, default: 8, unit: '%' },
    { label: 'Years', min: 5, max: 40, default: 20, unit: ' years' },
  ],
  comparison: [
    { label: 'Allocation', min: 0, max: 100, default: 60, unit: '%' },
    { label: 'Time Horizon', min: 5, max: 40, default: 20, unit: ' years' },
  ],
  timeline: [
    { label: 'Year', min: 2000, max: 2030, default: 2020, unit: '' },
    { label: 'Intensity', min: 1, max: 10, default: 5, unit: '/10' },
  ],
  pie: [
    { label: 'Category A', min: 0, max: 100, default: 60, unit: '%' },
    { label: 'Category B', min: 0, max: 100, default: 40, unit: '%' },
  ],
  bar: [
    { label: 'Value A', min: 0, max: 100, default: 50, unit: '%' },
    { label: 'Value B', min: 0, max: 100, default: 30, unit: '%' },
  ],
  balanceSheet: [
    { label: 'Assets', min: 0, max: 500000, default: 100000, unit: '$' },
    { label: 'Liabilities', min: 0, max: 500000, default: 40000, unit: '$' },
  ],
  gauge: [{ label: 'Score', min: 0, max: 100, default: 50, unit: '' }],
  waterfall: [
    { label: 'Revenue', min: 0, max: 100000, default: 50000, unit: '$' },
    { label: 'Expenses', min: 0, max: 100000, default: 30000, unit: '$' },
  ],
  meter: [
    { label: 'Category A', min: 0, max: 100, default: 50, unit: '%' },
    { label: 'Category B', min: 0, max: 100, default: 30, unit: '%' },
  ],
  scatter: [
    { label: 'Risk', min: 0, max: 100, default: 50, unit: '%' },
    { label: 'Return', min: 0, max: 30, default: 10, unit: '%' },
  ],
  distribution: [
    { label: 'Mean', min: -5, max: 15, default: 8, unit: '%' },
    { label: 'Standard deviation', min: 1, max: 50, default: 20, unit: '%' },
  ],
  heatmap: [{ label: 'Correlation Shift', min: -50, max: 50, default: 0, unit: '%' }],
  multiline: [
    { label: 'Drift', min: 0, max: 20, default: 8, unit: '%' },
    { label: 'Volatility', min: 5, max: 60, default: 25, unit: '%' },
  ],
  financialChart: [
    { label: 'Short MA Period', min: 5, max: 50, default: 20, unit: ' days' },
    { label: 'Long MA Period', min: 20, max: 200, default: 50, unit: ' days' },
  ],
  funnel: [
    { label: 'Initial screen', min: 10, max: 100, default: 80, unit: '%' },
    { label: 'Final selection', min: 1, max: 50, default: 20, unit: '%' },
  ],
  line: [
    { label: 'Annual Return', min: 0, max: 20, default: 8, unit: '%' },
    { label: 'Years', min: 1, max: 40, default: 20, unit: ' years' },
  ],
  compoundGrowthLab: [],
  inflationEroder: [],
  portfolioMixer: [],
};

const finite = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const rate = (value: number) => clamp(finite(value) / 100, -0.95, 0.5);
const years = (value: number) => clamp(Math.round(finite(value, 20)), 1, 100);
const money = (value: number) => clamp(finite(value), 0, 100_000_000);
const rounded = (value: number, places = 0) => {
  if (!Number.isFinite(value)) return 0;
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
};
const labelKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const isExplorable = (step: InteractiveGraphInput): step is ExplorableStepData => step.type === 'explorable';
const param = (step: ExplorableStepData, key: string, fallback: number) => finite(step.params?.[key], fallback);

export function resolveGraphType(step: InteractiveGraphInput): ResolvedGraphType {
  if (isExplorable(step)) {
    if (step.widget === 'compoundGrowthLab' || step.widget === 'inflationEroder' || step.widget === 'portfolioMixer') return step.widget;
    return 'bar';
  }
  const declared = step.graphType as ResolvedGraphType | 'barChart';
  if (declared === 'barChart') return 'bar';
  if (declared in DEFAULT_SLIDERS) return declared as ResolvedGraphType;

  const context = `${step.title} ${step.sectionLabel} ${step.description} ${(step.sliders ?? []).map((slider) => slider.label).join(' ')}`.toLowerCase();
  if (/balance.?sheet|debit|credit|asset|liabilit|equity|t.?account|accounting.?equation|journal.?entr/.test(context)) return 'balanceSheet';
  if (/ratio|margin|compan|industr|sector|benchmark|percentag|profitab|return on|roe|roa|eps|p\/e|multiple|valuation/.test(context)) return 'bar';
  if (/risk.?score|credit.?score|rating|index|volatility|sharpe|beta|health/.test(context)) return 'gauge';
  if (/cash.?flow|waterfall|breakdown|revenue.*expense|income.*statement|p&l|profit.*loss/.test(context)) return 'waterfall';
  if (/budget|spending|allocat.*target|category|50.?30.?20|needs.*wants/.test(context)) return 'meter';
  if (/risk.*return|correlation|frontier|efficient|scatter|portfolio.*risk/.test(context)) return 'scatter';
  if (/compound|growth.*over.*time|savings.*grow|power.*of.*time|future.*value/.test(context)) return 'exponential';
  return (step.sliders?.length ?? 0) === 1 ? 'gauge' : 'bar';
}

export function effectiveGraphSliders(step: InteractiveGraphInput): GraphSlider[] {
  if (isExplorable(step)) {
    if (step.widget === 'compoundGrowthLab') {
      const authoredYears = param(step, 'years', 20);
      return [
        { label: 'Annual return', min: 0, max: 12, default: param(step, 'annualReturn', 7), unit: '%' },
        { label: 'Years', min: 1, max: Math.max(50, authoredYears), default: authoredYears, unit: ' yrs' },
        { label: 'Monthly contribution', min: 0, max: 1000, default: param(step, 'monthlyContribution', 100), unit: '$/mo' },
      ];
    }
    if (step.widget === 'inflationEroder') {
      return [
        { label: 'Inflation rate', min: 0, max: 12, default: param(step, 'inflation', 3), unit: '%' },
        { label: 'Years', min: 1, max: 40, default: param(step, 'years', 10), unit: ' yrs' },
      ];
    }
    if (step.widget === 'portfolioMixer') {
      return [
        { label: 'Stocks', min: 0, max: 100, default: 60, unit: '%' },
        { label: 'Stocks + bonds', min: 0, max: 100, default: 90, unit: '%' },
      ];
    }
    return [];
  }
  return step.sliders?.length ? step.sliders : DEFAULT_SLIDERS[resolveGraphType(step)];
}

export function defaultGraphValues(step: InteractiveGraphInput): number[] {
  return effectiveGraphSliders(step).map((slider) => finite(slider.default));
}

function line(label: string, count: number, valueAt: (index: number) => number, xAt: (index: number) => number = (index) => index): GraphSeries {
  return {
    label,
    points: Array.from({ length: Math.max(2, count) }, (_, index) => ({ x: xAt(index), y: rounded(valueAt(index)) })),
  };
}

function comparison(step: InteractiveGraphStep, values: number[]): Pick<InteractiveGraphModel, 'series' | 'axisStart' | 'axisEnd' | 'summary'> {
  const sliders = effectiveGraphSliders(step);
  const keys = sliders.map((slider) => labelKey(slider.label));
  const returnIndex = keys.findIndex((key) => /market return|annual return/.test(key));
  const penaltyIndex = keys.findIndex((key) => /penalty|behavior gap|behaviour gap|behavioral tax/.test(key));
  const yearsIndex = keys.findIndex((key) => /year|time period|time horizon|investment horizon|holding period/.test(key));
  let duration: number;
  let series: GraphSeries[];

  if (returnIndex >= 0 && penaltyIndex >= 0 && yearsIndex >= 0) {
    const marketRate = rate(values[returnIndex]);
    const investorRate = rate(values[returnIndex] - values[penaltyIndex]);
    duration = years(values[yearsIndex]);
    series = [
      line('Market return', duration + 1, (year) => 100_000 * Math.pow(1 + marketRate, year)),
      line('Investor return', duration + 1, (year) => 100_000 * Math.pow(1 + investorRate, year)),
    ];
  } else if (step.comparisonModel?.kind === 'savingsRate') {
    const model = step.comparisonModel;
    const income = money(values[model.incomeSlider] ?? 0);
    duration = years(values[model.yearsSlider] ?? 20);
    const annualReturn = rate(model.annualReturn * 100);
    const accumulated = (savingsRate: number, year: number) => {
      const contribution = income * savingsRate;
      return annualReturn === 0
        ? contribution * year
        : contribution * ((Math.pow(1 + annualReturn, year) - 1) / annualReturn);
    };
    series = [
      line(model.labelA, duration + 1, (year) => accumulated(model.rateA, year)),
      line(model.labelB, duration + 1, (year) => accumulated(model.rateB, year)),
    ];
  } else {
    const stockAllocation = clamp(finite(values[0]) / 100, 0, 1);
    duration = years(values[1] ?? 20);
    const conservativeStocks = Math.min(stockAllocation, 0.4);
    const conservativeRate = conservativeStocks * 0.10 + (1 - conservativeStocks) * 0.05;
    const allocationRate = stockAllocation * 0.10 + (1 - stockAllocation) * 0.05;
    series = [
      line('Your allocation', duration + 1, (year) => 10_000 * Math.pow(1 + allocationRate, year)),
      line('Conservative', duration + 1, (year) => 10_000 * Math.pow(1 + conservativeRate, year)),
    ];
  }

  return {
    series,
    axisStart: 'Year 0',
    axisEnd: `Year ${String(duration)}`,
    summary: { label: 'Ending difference', value: Math.abs((series[0].points.at(-1)?.y ?? 0) - (series[1].points.at(-1)?.y ?? 0)), unit: '$' },
  };
}

function exponential(step: InteractiveGraphStep, values: number[]): Pick<InteractiveGraphModel, 'series' | 'axisStart' | 'axisEnd' | 'summary'> {
  const three = effectiveGraphSliders(step).length >= 3;
  const principal = three ? money(values[0]) : 1_000;
  const monthly = three ? money(values[1]) : 0;
  const annualRate = rate(three ? values[2] : values[0]);
  const duration = three ? 40 : years(values[1]);
  const valueAt = (year: number) => {
    const monthlyRate = annualRate / 12;
    const months = year * 12;
    return principal * Math.pow(1 + annualRate, year)
      + (monthlyRate === 0 ? monthly * months : monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
  };
  return {
    series: [line('Projected value', duration + 1, valueAt)],
    axisStart: 'Year 0',
    axisEnd: `Year ${String(duration)}`,
    summary: { label: 'Final value', value: rounded(valueAt(duration)), unit: '$' },
  };
}

function timeline(step: InteractiveGraphStep, values: number[]): Pick<InteractiveGraphModel, 'series' | 'axisStart' | 'axisEnd' | 'markers' | 'range' | 'summary'> {
  const sliders = effectiveGraphSliders(step);
  const domain = sliders[0];
  const selected = values[0];
  const intensity = values[1] ?? 5;
  const maxIntensity = sliders[1]?.max ?? 10;
  const span = Math.max(domain.max - domain.min, 1);
  const count = Math.min(201, Math.max(13, Math.round(span) + 1));
  const peak = clamp(intensity / Math.max(maxIntensity, 1), 0, 1) * 100;
  const series = line(step.title, count, (index) => {
    const x = domain.min + index / (count - 1) * span;
    return peak * Math.exp(-0.3 * Math.abs(x - selected));
  }, (index) => domain.min + index / (count - 1) * span);
  return {
    series: [series],
    axisStart: `${domain.min}${domain.unit}`,
    axisEnd: `${domain.max}${domain.unit}`,
    markers: [{ x: selected, label: `${rounded(selected, 2)}${domain.unit}`, value: peak }],
    range: { xMin: domain.min, xMax: domain.max, yMin: 0, yMax: 100 },
    summary: { label: domain.label, value: selected, unit: domain.unit },
  };
}

function distribution(values: number[]): Pick<InteractiveGraphModel, 'series' | 'axisStart' | 'axisEnd' | 'markers' | 'range' | 'summary'> {
  const mean = finite(values[0]);
  const sigma = Math.max(1, Math.abs(finite(values[1], 10)));
  const xMin = mean - 4 * sigma;
  const xMax = mean + 4 * sigma;
  const count = 101;
  const density = (x: number) => (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2));
  const maxDensity = density(mean);
  const curve = line('Return distribution', count, (index) => density(xMin + index / (count - 1) * (xMax - xMin)) / maxDensity * 100, (index) => xMin + index / (count - 1) * (xMax - xMin));
  const valueAtRisk = mean - 1.645 * sigma;
  return {
    series: [curve],
    axisStart: 'Losses',
    axisEnd: 'Gains',
    markers: [
      { x: valueAtRisk, label: 'VaR 95%', value: valueAtRisk },
      { x: mean, label: `μ=${rounded(mean, 1)}%`, value: mean },
    ],
    range: { xMin, xMax, yMin: 0, yMax: 100 },
    summary: { label: '95% value at risk', value: rounded(valueAtRisk, 1), unit: '%' },
  };
}

function heatmap(step: InteractiveGraphStep, values: number[]): Pick<InteractiveGraphModel, 'cells' | 'labels'> {
  const sliders = effectiveGraphSliders(step);
  const labels = sliders.length >= 2
    ? sliders.map((slider) => slider.label)
    : ['Stocks', 'Bonds', 'Gold', 'Real Estate', 'Commodities'];
  const n = labels.length;
  const shift = finite(values[0]) / 100;
  const seed = [
    [1, -0.2, 0.05, 0.5, 0.3],
    [-0.2, 1, 0.25, 0.1, -0.1],
    [0.05, 0.25, 1, 0.05, 0.35],
    [0.5, 0.1, 0.05, 1, 0.2],
    [0.3, -0.1, 0.35, 0.2, 1],
  ];
  return {
    labels,
    cells: Array.from({ length: n * n }, (_, index) => {
      const row = Math.floor(index / n);
      const column = index % n;
      const base = seed[row]?.[column] ?? (row === column ? 1 : 0.1);
      return { row, column, value: rounded(clamp(row === column ? 1 : base + shift, -1, 1), 2) };
    }),
  };
}

function multiline(values: number[]): Pick<InteractiveGraphModel, 'series' | 'axisStart' | 'axisEnd' | 'summary'> {
  const drift = finite(values[0], 8) / 100;
  const volatility = Math.max(1, Math.abs(finite(values[1], 20))) / 100;
  const duration = clamp(finite(values[2], 10), 1, 50);
  const count = Math.min(241, Math.max(13, Math.round(duration * 12) + 1));
  const dt = duration / (count - 1);
  const seeds = [0.3, -0.8, 1.2, -0.3, 0.9, -1.1, 0.5, -0.6, 1.5, -0.2, 0.7, -1.3];
  const paths = seeds.map((seed, pathIndex) => {
    let price = 100;
    return line(`Path ${String(pathIndex + 1)}`, count, (index) => {
      if (index === 0) return 100;
      const z = seed * Math.sin(index * 0.7 + pathIndex * 2.1)
        + seeds[(pathIndex + index) % seeds.length] * Math.cos(index * 1.3 + pathIndex);
      price *= Math.exp((drift - volatility * volatility / 2) * dt + volatility * Math.sqrt(dt) * z);
      return Math.max(price, 0.01);
    }, (index) => index * dt);
  });
  const expected = line('Expected path', count, (index) => 100 * Math.exp(drift * index * dt), (index) => index * dt);
  const meanFinal = paths.reduce((sum, series) => sum + (series.points.at(-1)?.y ?? 0), 0) / paths.length;
  return {
    series: [...paths, expected],
    axisStart: 'Year 0',
    axisEnd: `Year ${rounded(duration, 1)}`,
    summary: { label: 'Mean final value (E[S])', value: rounded(meanFinal), unit: '$' },
  };
}

function generatedPrices(count: number, startPrice: number, annualReturn: number, annualVolatility: number, initialSeed: number) {
  let seed = initialSeed;
  const random = () => {
    seed = seed * 16807 % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(random(), 1e-9))) * Math.cos(2 * Math.PI * random());
  const dt = 1 / 252;
  let price = startPrice;
  return Array.from({ length: count }, (_, x): GraphCandle => {
    const open = price;
    const intraVol = annualVolatility * Math.sqrt(dt) * 0.6;
    const middleA = open * (1 + intraVol * normal());
    const middleB = open * (1 + intraVol * normal());
    const close = price * Math.exp((annualReturn - 0.5 * annualVolatility * annualVolatility) * dt + annualVolatility * Math.sqrt(dt) * normal());
    const high = Math.max(open, close, middleA, middleB) * (1 + Math.abs(normal()) * 0.003);
    const low = Math.min(open, close, middleA, middleB) * (1 - Math.abs(normal()) * 0.003);
    price = close;
    return { x, open: rounded(open, 2), high: rounded(high, 2), low: rounded(low, 2), close: rounded(close, 2) };
  });
}

function movingAverage(candles: GraphCandle[], period: number, exponentialAverage: boolean): GraphSeries {
  const safePeriod = clamp(Math.round(period), 2, Math.max(2, candles.length));
  let ema: number | undefined;
  const points: GraphPoint[] = [];
  candles.forEach((candle, index) => {
    if (index < safePeriod - 1) return;
    if (exponentialAverage) {
      if (ema === undefined) {
        ema = candles.slice(index - safePeriod + 1, index + 1).reduce((sum, item) => sum + item.close, 0) / safePeriod;
      } else {
        const multiplier = 2 / (safePeriod + 1);
        ema = candle.close * multiplier + ema * (1 - multiplier);
      }
      points.push({ x: candle.x, y: rounded(ema, 2) });
    } else {
      const average = candles.slice(index - safePeriod + 1, index + 1).reduce((sum, item) => sum + item.close, 0) / safePeriod;
      points.push({ x: candle.x, y: rounded(average, 2) });
    }
  });
  return { label: `${exponentialAverage ? 'EMA' : 'SMA'} ${String(safePeriod)}`, points };
}

function financial(step: InteractiveGraphStep, values: number[]): Pick<InteractiveGraphModel, 'series' | 'candles' | 'axisStart' | 'axisEnd' | 'summary'> {
  const preset = step.chartPreset ?? 'candlestick-basic';
  const settings = preset === 'sma-vs-ema'
    ? { count: 120, start: 100, annualReturn: 0.05, volatility: 0.30, seed: 77 }
    : preset === 'candlestick-basic'
      ? { count: 60, start: 175, annualReturn: 0.10, volatility: 0.20, seed: 99 }
      : { count: 200, start: 150, annualReturn: 0.12, volatility: 0.22, seed: 42 };
  const candles = generatedPrices(settings.count, settings.start, settings.annualReturn, settings.volatility, settings.seed);
  const shortPeriod = values[0] ?? 20;
  const longPeriod = values[1] ?? 50;
  const priceSeries = { label: 'Price', points: candles.map((candle) => ({ x: candle.x, y: candle.close })) };
  const series = preset === 'sma-vs-ema'
    ? [priceSeries, movingAverage(candles, shortPeriod, false), movingAverage(candles, shortPeriod, true)]
    : [priceSeries, movingAverage(candles, shortPeriod, false), movingAverage(candles, longPeriod, false)];
  return {
    series,
    candles,
    axisStart: 'Earlier',
    axisEnd: 'Latest',
    summary: { label: 'Latest close', value: candles.at(-1)?.close ?? 0, unit: '$', detail: preset },
  };
}

function genericLine(step: InteractiveGraphStep, values: number[]): Pick<InteractiveGraphModel, 'series' | 'axisStart' | 'axisEnd' | 'summary'> {
  const sliders = effectiveGraphSliders(step);
  const keys = sliders.map((slider) => labelKey(slider.label));
  const durationIndex = keys.findIndex((key) => /year|period|horizon|duration/.test(key));
  const rateIndex = keys.findIndex((key) => /growth|return|rate|yield/.test(key));
  const duration = durationIndex >= 0 ? years(values[durationIndex]) : 10;
  const growth = rate(rateIndex >= 0 ? values[rateIndex] : values[1] ?? 5);
  const startIndex = keys.findIndex((key) => /amount|price|value|cost/.test(key));
  const start = Math.max(1, finite(values[startIndex >= 0 ? startIndex : 0], 100));
  const series = line(step.title, duration + 1, (index) => start * Math.pow(1 + growth, index));
  return {
    series: [series],
    axisStart: 'Start',
    axisEnd: `Year ${String(duration)}`,
    summary: { label: 'Ending value', value: series.points.at(-1)?.y ?? 0, unit: sliders[startIndex >= 0 ? startIndex : 0]?.unit },
  };
}

const PORTFOLIO_ASSETS = {
  stocks: { mean: 0.10, volatility: 0.17 },
  bonds: { mean: 0.05, volatility: 0.06 },
  cash: { mean: 0.02, volatility: 0.01 },
} as const;
const STOCK_BOND_CORRELATION = 0.1;
const Z_80 = 1.2816;
const PORTFOLIO_CRASHES = [
  { id: 'gfc', label: '2008 crash', blurb: 'Global financial crisis', stocks: -0.37, bonds: 0.052, cash: 0.018 },
  { id: 'dotcom', label: 'Dot-com bust', blurb: '2000 to 2002, cumulative', stocks: -0.43, bonds: 0.23, cash: 0.08 },
  { id: 'infl22', label: '2022 inflation shock', blurb: 'Stocks AND bonds fell', stocks: -0.181, bonds: -0.13, cash: 0.015 },
] as const;

function compoundFutureValue(principal: number, annualReturnPct: number, duration: number, monthly: number) {
  const annualRate = annualReturnPct / 100;
  const monthlyRate = annualRate / 12;
  const months = duration * 12;
  const principalGrowth = principal * Math.pow(1 + annualRate, duration);
  const contributionGrowth = monthlyRate > 0
    ? monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : monthly * months;
  return principalGrowth + contributionGrowth;
}

function niceCeil(value: number) {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((candidate) => normalized <= candidate) ?? 10;
  return step * magnitude;
}

function compoundGrowthLab(step: ExplorableStepData, values: number[]): Pick<InteractiveGraphModel, 'series' | 'range' | 'axisStart' | 'axisEnd' | 'markers' | 'summary' | 'explorable'> {
  const startingAmount = Math.max(1, money(param(step, 'startingAmount', 1_000)));
  const mountAnnualReturn = clamp(param(step, 'annualReturn', 7), 0, 12);
  const mountYears = Math.max(1, Math.round(param(step, 'years', 20)));
  const mountMonthly = clamp(param(step, 'monthlyContribution', 100), 0, 1_000);
  const annualReturn = clamp(finite(values[0], mountAnnualReturn), 0, 12);
  const duration = Math.max(1, Math.round(finite(values[1], mountYears)));
  const monthly = clamp(finite(values[2], mountMonthly), 0, 1_000);
  const points = Array.from({ length: duration + 1 }, (_, year) => ({
    year,
    contributed: rounded(startingAmount + monthly * 12 * year),
    total: rounded(compoundFutureValue(startingAmount, annualReturn, year, monthly)),
    ghost: rounded(compoundFutureValue(startingAmount, mountAnnualReturn, year, mountMonthly)),
  }));
  const last = points.at(-1);
  const endValue = last?.total ?? startingAmount;
  const contributed = last?.contributed ?? startingAmount;
  const ghostEnd = last?.ghost ?? startingAmount;
  // Match the web renderer's fixed return headroom: changing the return bends the curve instead of
  // causing a misleading auto-rescale. Years and deposits still expand the domain deliberately.
  const domainMax = niceCeil(Math.max(compoundFutureValue(startingAmount, 12, duration, monthly), ghostEnd));
  const crossoverYear = points.find((point) => point.year > 0 && point.total - point.contributed > point.contributed)?.year;
  const base = compoundFutureValue(startingAmount, mountAnnualReturn, mountYears, mountMonthly);
  const series: GraphSeries[] = [
    { label: 'Total', points: points.map((point) => ({ x: point.year, y: point.total })) },
    { label: 'Contributed', points: points.map((point) => ({ x: point.year, y: point.contributed })) },
    { label: 'Where you started', points: points.map((point) => ({ x: point.year, y: point.ghost })) },
  ];
  return {
    series,
    range: { xMin: 0, xMax: duration, yMin: 0, yMax: domainMax },
    axisStart: '0y',
    axisEnd: `${String(duration)}y`,
    markers: crossoverYear === undefined ? [] : [{ x: crossoverYear, label: 'Growth takes over' }],
    summary: { label: 'Ending value', value: endValue, unit: '$', detail: `You put in $${String(contributed)} · growth made $${String(Math.max(endValue - contributed, 0))}` },
    explorable: {
      kind: 'compoundGrowthLab',
      startingAmount,
      annualReturn,
      years: duration,
      monthly,
      mountAnnualReturn,
      mountYears,
      mountMonthly,
      endValue,
      contributed,
      growthPortion: Math.max(endValue - contributed, 0),
      ghostEnd,
      domainMax,
      ...(crossoverYear === undefined ? {} : { crossoverYear }),
      tenYearDelta: compoundFutureValue(startingAmount, mountAnnualReturn, mountYears + 10, mountMonthly) - base,
      doubleMonthlyDelta: compoundFutureValue(startingAmount, mountAnnualReturn, mountYears, mountMonthly * 2) - base,
      hotterReturnDelta: compoundFutureValue(startingAmount, mountAnnualReturn + 2, mountYears, mountMonthly) - base,
    },
  };
}

function inflationEroder(step: ExplorableStepData, values: number[]): Pick<InteractiveGraphModel, 'bars' | 'summary' | 'explorable'> {
  const bill = Math.max(0.01, money(param(step, 'billAmount', 100)));
  const inflation = clamp(finite(values[0], param(step, 'inflation', 3)), 0, 12);
  const duration = clamp(Math.round(finite(values[1], param(step, 'years', 10))), 1, 40);
  const totalTickets = 8;
  const purchasingPower = bill / Math.pow(1 + inflation / 100, duration);
  const ticketsExact = purchasingPower / (bill / totalTickets);
  const survivors = Math.min(totalTickets, Math.floor(ticketsExact));
  const marginalFraction = clamp(ticketsExact - survivors, 0, 1);
  const lostFraction = clamp(1 - purchasingPower / bill, 0, 1);
  const lostPercent = Math.round(lostFraction * 100);
  return {
    bars: Array.from({ length: totalTickets }, (_, index) => ({
      label: `Ticket ${String(index + 1)}`,
      value: index < survivors ? 1 : index === survivors ? marginalFraction : 0,
      max: 1,
    })),
    summary: { label: `${String(survivors)} of ${String(totalTickets)} tickets left`, value: rounded(purchasingPower, 2), unit: '$', detail: `-${String(lostPercent)}% purchasing power` },
    explorable: {
      kind: 'inflationEroder',
      bill,
      totalTickets,
      purchasingPower,
      survivors,
      marginalFraction,
      lostPercent,
      revealReady: duration >= 28 && lostFraction >= 0.2,
      halfLost: lostFraction >= 0.5,
    },
  };
}

function recoveryYears(drawdown: number, mean: number) {
  return drawdown >= 0 ? 0 : Math.log(1 / (1 + drawdown)) / Math.log(1 + Math.max(mean, 0.005));
}

function portfolioMixer(step: ExplorableStepData, values: number[], crashIndex: number): Pick<InteractiveGraphModel, 'series' | 'slices' | 'range' | 'axisStart' | 'axisEnd' | 'summary' | 'explorable'> {
  const principal = Math.max(1, money(param(step, 'startingAmount', 10_000)));
  const duration = years(param(step, 'years', 30));
  const stocks = clamp(Math.round(finite(values[0], 60)), 0, 100);
  const secondBoundary = clamp(Math.round(finite(values[1], 90)), stocks, 100);
  const bonds = secondBoundary - stocks;
  const cash = 100 - secondBoundary;
  const stockWeight = stocks / 100;
  const bondWeight = bonds / 100;
  const cashWeight = cash / 100;
  const mean = stockWeight * PORTFOLIO_ASSETS.stocks.mean
    + bondWeight * PORTFOLIO_ASSETS.bonds.mean
    + cashWeight * PORTFOLIO_ASSETS.cash.mean;
  const variance = (stockWeight * PORTFOLIO_ASSETS.stocks.volatility) ** 2
    + (bondWeight * PORTFOLIO_ASSETS.bonds.volatility) ** 2
    + (cashWeight * PORTFOLIO_ASSETS.cash.volatility) ** 2
    + 2 * stockWeight * bondWeight * STOCK_BOND_CORRELATION
      * PORTFOLIO_ASSETS.stocks.volatility * PORTFOLIO_ASSETS.bonds.volatility;
  const sigma = Math.sqrt(variance);
  const drift = mean - 0.5 * sigma * sigma;
  const projection = (spreadDirection: -1 | 0 | 1) => line(
    spreadDirection === 0 ? 'Likely value' : spreadDirection > 0 ? '90th percentile' : '10th percentile',
    duration + 1,
    (year) => principal * Math.exp(drift * year + spreadDirection * Z_80 * sigma * Math.sqrt(year)),
  );
  const median = projection(0);
  const best = projection(1);
  const worst = projection(-1);
  const medianEnd = median.points.at(-1)?.y ?? principal;
  const bestEnd = best.points.at(-1)?.y ?? principal;
  const worstEnd = worst.points.at(-1)?.y ?? principal;
  const riskPercent = Math.min(100, Math.round(sigma / 0.18 * 90));
  const riskLabel: PortfolioMixerModel['riskLabel'] = riskPercent < 25 ? 'Low' : riskPercent < 55 ? 'Moderate' : riskPercent < 80 ? 'High' : 'Very high';
  const event = PORTFOLIO_CRASHES[crashIndex];
  const crash = event ? (() => {
    const yours = stockWeight * event.stocks + bondWeight * event.bonds + cashWeight * event.cash;
    return {
      id: event.id,
      label: event.label,
      blurb: event.blurb,
      yours,
      allStock: event.stocks,
      yoursRecoveryYears: recoveryYears(yours, mean),
      allStockRecoveryYears: recoveryYears(event.stocks, PORTFOLIO_ASSETS.stocks.mean),
    };
  })() : undefined;
  return {
    series: [median, best, worst],
    slices: [
      { label: 'Stocks', value: stocks },
      { label: 'Bonds', value: bonds },
      { label: 'Cash', value: cash },
    ],
    range: { xMin: 0, xMax: duration, yMin: 0, yMax: bestEnd * 1.06 },
    axisStart: 'Year 0',
    axisEnd: `Year ${String(duration)}`,
    summary: { label: `Likely value in ${String(duration)} years`, value: medianEnd, unit: '$', detail: `${riskLabel} risk` },
    explorable: {
      kind: 'portfolioMixer',
      principal,
      years: duration,
      stocks,
      bonds,
      cash,
      medianEnd,
      bestEnd,
      worstEnd,
      riskPercent,
      riskLabel,
      ...(crash ? { crash } : {}),
    },
  };
}

function accessibility(step: InteractiveGraphInput, values: number[], model: Omit<InteractiveGraphModel, 'accessibilityLabel'>) {
  const controls = effectiveGraphSliders(step).map((slider, index) => `${slider.label}: ${String(values[index])}${slider.unit}`).join(', ');
  const outcomes = model.series.slice(0, 3).map((series) => `${series.label}: ${String(rounded(series.points.at(-1)?.y ?? 0))}`)
    .concat(model.bars.map((bar) => `${bar.label}: ${String(rounded(bar.value))}`))
    .concat(model.slices.map((slice) => `${slice.label}: ${String(rounded(slice.value))}`))
    .concat(model.summary ? [`${model.summary.label}: ${String(model.summary.value)}${model.summary.unit ?? ''}`] : [])
    .join(', ');
  return [step.title, `${model.presentation} chart`, controls, outcomes].filter(Boolean).join('. ');
}

export function buildInteractiveGraphModel(step: InteractiveGraphInput, rawValues: number[]): InteractiveGraphModel {
  const presentation = resolveGraphType(step);
  const sliders = effectiveGraphSliders(step);
  const values = sliders.map((slider, index) => clamp(finite(rawValues[index], slider.default), slider.min, slider.max));
  const base: Omit<InteractiveGraphModel, 'accessibilityLabel'> = {
    presentation,
    series: [], bars: [], slices: [], cells: [], labels: [], markers: [], candles: [],
  };

  if (isExplorable(step)) {
    if (presentation === 'compoundGrowthLab') Object.assign(base, compoundGrowthLab(step, values));
    else if (presentation === 'inflationEroder') Object.assign(base, inflationEroder(step, values));
    else if (presentation === 'portfolioMixer') Object.assign(base, portfolioMixer(step, values, Math.round(finite(rawValues[2], -1))));
    return { ...base, accessibilityLabel: accessibility(step, values, base) };
  }

  if (presentation === 'comparison') Object.assign(base, comparison(step, values));
  else if (presentation === 'exponential') Object.assign(base, exponential(step, values));
  else if (presentation === 'timeline') Object.assign(base, timeline(step, values));
  else if (presentation === 'distribution') Object.assign(base, distribution(values));
  else if (presentation === 'heatmap') Object.assign(base, heatmap(step, values));
  else if (presentation === 'multiline') Object.assign(base, multiline(values));
  else if (presentation === 'financialChart') Object.assign(base, financial(step, values));
  else if (presentation === 'line') Object.assign(base, genericLine(step, values));
  else if (presentation === 'pie') {
    const slices = sliders.map((slider, index) => ({ label: slider.label, value: Math.max(0, values[index]) }));
    const total = Math.max(1, slices.reduce((sum, slice) => sum + slice.value, 0));
    const weights = [0.7, 0.8, 0.2, 0.5, 0.6, 0.4];
    const riskScore = slices.reduce((sum, slice, index) => sum + slice.value / total * (weights[index] ?? 0.5) * 100, 0);
    base.slices = slices;
    base.summary = { label: 'Projected annual volatility', value: rounded(riskScore * 0.25, 1), unit: '%', detail: `Risk ${String(rounded(riskScore))}` };
  } else if (presentation === 'balanceSheet') {
    const assets = values[0] ?? 0;
    const liabilities = values[1] ?? 0;
    const equity = Math.max(assets - liabilities, 0);
    base.bars = [
      { label: 'Assets', value: assets },
      { label: 'Liabilities', value: liabilities },
      { label: 'Equity', value: equity },
    ];
    base.summary = { label: 'Books balanced', value: assets - liabilities - equity, unit: '$' };
  } else if (presentation === 'gauge') {
    const slider = sliders[0];
    base.bars = [{ label: slider.label, value: values[0], start: slider.min, end: slider.max, max: slider.max }];
    base.range = { xMin: slider.min, xMax: slider.max, yMin: 0, yMax: 1 };
    base.summary = { label: slider.label, value: values[0], unit: slider.unit };
  } else if (presentation === 'waterfall') {
    let running = 0;
    base.bars = sliders.map((slider, index) => {
      const key = labelKey(slider.label);
      const negative = /expense|cost|loss|tax|fee|outflow|liabilit|debt|withdraw/.test(key);
      const delta = index === 0 || !negative ? values[index] : -Math.abs(values[index]);
      const start = running;
      running += delta;
      return { label: slider.label, value: delta, start, end: running };
    });
    base.bars.push({ label: 'Net', value: running, start: 0, end: running });
    base.summary = { label: 'Net', value: running, unit: sliders[0]?.unit };
  } else if (presentation === 'meter') {
    base.bars = sliders.map((slider, index) => ({ label: slider.label, value: values[index], max: slider.max }));
    base.summary = { label: 'Total', value: values.reduce((sum, value) => sum + value, 0), unit: sliders[0]?.unit };
  } else if (presentation === 'scatter') {
    const horizontal = sliders[0];
    const vertical = sliders[1] ?? horizontal;
    base.series = [{ label: `${horizontal.label} / ${vertical.label}`, points: [{ x: values[0], y: values[1] ?? values[0] }] }];
    base.labels = [horizontal.label, vertical.label];
    base.range = { xMin: horizontal.min, xMax: horizontal.max, yMin: vertical.min, yMax: vertical.max };
    base.summary = { label: 'Selected point', value: values[1] ?? values[0], unit: vertical.unit, detail: `${values[0]}${horizontal.unit}` };
  } else if (presentation === 'funnel') {
    const isDueDiligence = /due diligence|initial screen|commitment/i.test(`${step.title} ${step.description}`);
    if (isDueDiligence) {
      const sharpe = values[0] ?? 1.5;
      const drawdown = values[1] ?? 20;
      const operational = clamp(Math.round(25 - drawdown / 6), 10, 24);
      const final = clamp(Math.round(sharpe * 4), 1, operational);
      base.bars = [
        { label: 'Initial screen', value: 100, max: 100 },
        { label: 'Preliminary review', value: 50, max: 100 },
        { label: 'Detailed analysis', value: 25, max: 100 },
        { label: 'Operational review', value: operational, max: 100 },
        { label: 'Commitment', value: final, max: 100 },
      ];
    } else {
      let previous = 100;
      base.bars = sliders.map((slider, index) => {
        const normalized = clamp((values[index] - slider.min) / Math.max(slider.max - slider.min, 1) * 100, 0, 100);
        previous = Math.min(previous, normalized);
        return { label: slider.label, value: previous, max: 100 };
      });
    }
    base.summary = { label: 'Final conversion', value: base.bars.at(-1)?.value ?? 0, unit: '%' };
  } else {
    base.bars = sliders.map((slider, index) => ({ label: slider.label, value: values[index], max: Math.max(slider.max, values[index]) }));
  }

  return { ...base, accessibilityLabel: accessibility(step, values, base) };
}
