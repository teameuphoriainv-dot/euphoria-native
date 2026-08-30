import type { InteractiveGraphStep } from '@/lib/curriculum';

export type ResolvedGraphType =
  | 'exponential' | 'comparison' | 'timeline' | 'pie' | 'bar' | 'balanceSheet'
  | 'gauge' | 'waterfall' | 'meter' | 'scatter' | 'distribution' | 'heatmap'
  | 'multiline' | 'financialChart' | 'funnel' | 'line';

export type GraphPoint = { x: number; y: number };
export type GraphSeries = { label: string; points: GraphPoint[] };
export type GraphBar = { label: string; value: number };
export type GraphSlice = { label: string; value: number };
export type GraphCell = { row: number; column: number; value: number };

export type InteractiveGraphModel = {
  presentation: 'line' | 'bar' | 'pie' | 'heatmap';
  axisStart?: string;
  axisEnd?: string;
  series: GraphSeries[];
  bars: GraphBar[];
  slices: GraphSlice[];
  cells: GraphCell[];
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
};

const finite = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const rate = (value: number) => clamp(finite(value) / 100, -0.95, 0.5);
const years = (value: number) => clamp(Math.round(finite(value, 20)), 1, 100);
const money = (value: number) => clamp(finite(value), 0, 100_000_000);
const rounded = (value: number) => Math.round(Number.isFinite(value) ? value : 0);
const labelKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function resolveGraphType(step: InteractiveGraphStep): ResolvedGraphType {
  const declared = step.graphType as ResolvedGraphType | 'barChart';
  if (declared === 'barChart') return 'bar';
  if (declared in DEFAULT_SLIDERS) return declared as ResolvedGraphType;

  const context = `${step.title} ${step.sectionLabel} ${step.description} ${(step.sliders ?? []).map((slider) => slider.label).join(' ')}`.toLowerCase();
  if (/balance.?sheet|debit|credit|asset|liabilit|equity|accounting.?equation/.test(context)) return 'balanceSheet';
  if (/risk.?score|credit.?score|rating|index|volatility|sharpe|beta|health/.test(context)) return 'gauge';
  if (/cash.?flow|waterfall|revenue.*expense|income.*statement|profit.*loss/.test(context)) return 'waterfall';
  if (/budget|spending|allocat.*target|category|needs.*wants/.test(context)) return 'meter';
  if (/risk.*return|correlation|frontier|efficient|scatter|portfolio.*risk/.test(context)) return 'scatter';
  if (/compound|growth.*over.*time|savings.*grow|power.*of.*time|future.*value/.test(context)) return 'exponential';
  return (step.sliders?.length ?? 0) === 1 ? 'gauge' : 'bar';
}

export function effectiveGraphSliders(step: InteractiveGraphStep): GraphSlider[] {
  return step.sliders?.length ? step.sliders : DEFAULT_SLIDERS[resolveGraphType(step)];
}

export function defaultGraphValues(step: InteractiveGraphStep): number[] {
  return effectiveGraphSliders(step).map((slider) => finite(slider.default));
}

function line(label: string, count: number, valueAt: (index: number) => number): GraphSeries {
  return {
    label,
    points: Array.from({ length: Math.max(2, count) }, (_, index) => ({ x: index, y: rounded(valueAt(index)) })),
  };
}

function comparison(step: InteractiveGraphStep, values: number[]): Pick<InteractiveGraphModel, 'series' | 'axisStart' | 'axisEnd'> {
  const sliders = effectiveGraphSliders(step);
  const keys = sliders.map((slider) => labelKey(slider.label));
  const returnIndex = keys.findIndex((key) => /market return|annual return/.test(key));
  const penaltyIndex = keys.findIndex((key) => /penalty|behavior gap|behaviour gap|behavioral tax/.test(key));
  const yearsIndex = keys.findIndex((key) => /year|time period|time horizon|investment horizon|holding period/.test(key));

  if (returnIndex >= 0 && penaltyIndex >= 0 && yearsIndex >= 0) {
    const marketRate = rate(values[returnIndex]);
    const investorRate = rate(values[returnIndex] - values[penaltyIndex]);
    const duration = years(values[yearsIndex]);
    return {
      series: [
        line('Market return', duration + 1, (year) => 100_000 * Math.pow(1 + marketRate, year)),
        line('Investor return', duration + 1, (year) => 100_000 * Math.pow(1 + investorRate, year)),
      ],
      axisStart: 'Year 0',
      axisEnd: `Year ${String(duration)}`,
    };
  }

  const model = step.comparisonModel;
  if (model?.kind === 'savingsRate') {
    const income = money(values[model.incomeSlider] ?? 0);
    const duration = years(values[model.yearsSlider] ?? 20);
    const annualReturn = rate(model.annualReturn * 100);
    const accumulated = (savingsRate: number, year: number) => {
      const contribution = income * savingsRate;
      return annualReturn === 0
        ? contribution * year
        : contribution * ((Math.pow(1 + annualReturn, year) - 1) / annualReturn);
    };
    return {
      series: [
        line(model.labelA, duration + 1, (year) => accumulated(model.rateA, year)),
        line(model.labelB, duration + 1, (year) => accumulated(model.rateB, year)),
      ],
      axisStart: 'Year 0',
      axisEnd: `Year ${String(duration)}`,
    };
  }

  const stockAllocation = clamp(finite(values[0]) / 100, 0, 1);
  const duration = years(values[1] ?? 20);
  const conservativeRate = Math.min(stockAllocation, 0.4) * 0.10 + (1 - Math.min(stockAllocation, 0.4)) * 0.05;
  const allocationRate = stockAllocation * 0.10 + (1 - stockAllocation) * 0.05;
  return {
    series: [
      line('Your allocation', duration + 1, (year) => 10_000 * Math.pow(1 + allocationRate, year)),
      line('Conservative', duration + 1, (year) => 10_000 * Math.pow(1 + conservativeRate, year)),
    ],
    axisStart: 'Year 0',
    axisEnd: `Year ${String(duration)}`,
  };
}

function exponential(step: InteractiveGraphStep, values: number[]): Pick<InteractiveGraphModel, 'series' | 'axisStart' | 'axisEnd'> {
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
  };
}

function genericTimeline(step: InteractiveGraphStep, values: number[]): Pick<InteractiveGraphModel, 'series' | 'axisStart' | 'axisEnd'> {
  const sliders = effectiveGraphSliders(step);
  const yearSlider = sliders.findIndex((slider) => /year|period|horizon|duration|expiration/i.test(slider.label));
  const duration = yearSlider >= 0 ? years(values[yearSlider]) : 10;
  const strength = Math.max(0.1, Math.abs(finite(values.find((_, index) => index !== yearSlider), 5)));
  return {
    series: [line(step.title, 13, (index) => 100 + index * strength + Math.sin(index * 0.9) * strength * 0.8)],
    axisStart: yearSlider >= 0 ? 'Start' : 'Earlier',
    axisEnd: yearSlider >= 0 ? `Period ${String(duration)}` : 'Later',
  };
}

function accessibility(step: InteractiveGraphStep, values: number[], model: Omit<InteractiveGraphModel, 'accessibilityLabel'>) {
  const controls = effectiveGraphSliders(step).map((slider, index) => `${slider.label}: ${String(values[index])}${slider.unit}`).join(', ');
  const outcomes = model.series.map((series) => `${series.label}: ${String(series.points.at(-1)?.y ?? 0)}`)
    .concat(model.bars.map((bar) => `${bar.label}: ${String(rounded(bar.value))}`))
    .concat(model.slices.map((slice) => `${slice.label}: ${String(rounded(slice.value))}`))
    .join(', ');
  return [step.title, controls, outcomes].filter(Boolean).join('. ');
}

export function buildInteractiveGraphModel(step: InteractiveGraphStep, rawValues: number[]): InteractiveGraphModel {
  const graphType = resolveGraphType(step);
  const sliders = effectiveGraphSliders(step);
  const values = sliders.map((slider, index) => clamp(finite(rawValues[index], slider.default), slider.min, slider.max));
  let base: Omit<InteractiveGraphModel, 'accessibilityLabel'>;

  if (graphType === 'comparison') {
    base = { presentation: 'line', ...comparison(step, values), bars: [], slices: [], cells: [] };
  } else if (graphType === 'exponential') {
    base = { presentation: 'line', ...exponential(step, values), bars: [], slices: [], cells: [] };
  } else if (graphType === 'distribution') {
    const mean = finite(values[0]);
    const sigma = Math.max(0.1, Math.abs(finite(values[1], 10)));
    base = {
      presentation: 'line',
      series: [line('Distribution', 25, (index) => {
        const x = mean - 3 * sigma + index * (6 * sigma / 24);
        return Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2)) * 1000;
      })],
      axisStart: 'Lower', axisEnd: 'Higher', bars: [], slices: [], cells: [],
    };
  } else if (graphType === 'multiline' || graphType === 'financialChart') {
    const drift = finite(values[0], 8) / 100;
    const spread = Math.max(1, Math.abs(finite(values[1], 20))) / 100;
    const labels = graphType === 'financialChart' ? ['Price', 'Short average', 'Long average'] : ['Base case', 'Upper path', 'Lower path'];
    base = {
      presentation: 'line',
      series: labels.map((label, seriesIndex) => line(label, 25, (index) => {
        const trend = 100 * Math.exp(drift * index / 12);
        const wave = Math.sin(index * (0.45 + seriesIndex * 0.08) + seriesIndex) * spread * 45;
        return trend + wave * (seriesIndex === 0 ? 1 : seriesIndex === 1 ? 0.55 : 0.3);
      })),
      axisStart: 'Start', axisEnd: 'End', bars: [], slices: [], cells: [],
    };
  } else if (graphType === 'timeline' || graphType === 'line') {
    base = { presentation: 'line', ...genericTimeline(step, values), bars: [], slices: [], cells: [] };
  } else if (graphType === 'pie') {
    base = {
      presentation: 'pie', series: [], bars: [], cells: [],
      slices: sliders.map((slider, index) => ({ label: slider.label, value: Math.max(0, values[index]) })),
    };
  } else if (graphType === 'heatmap') {
    const shift = finite(values[0]) / 100;
    base = {
      presentation: 'heatmap', series: [], bars: [], slices: [],
      cells: Array.from({ length: 25 }, (_, index) => {
        const row = Math.floor(index / 5);
        const column = index % 5;
        return { row, column, value: clamp(row === column ? 1 : 0.65 - Math.abs(row - column) * 0.22 + shift, -1, 1) };
      }),
    };
  } else {
    const source = sliders.map((slider, index) => ({ label: slider.label, value: values[index] }));
    const bars = graphType === 'funnel'
      ? source.map((bar, index) => ({ ...bar, value: Math.max(0, bar.value) / (index + 1) }))
      : source;
    base = { presentation: 'bar', series: [], bars, slices: [], cells: [] };
  }

  return { ...base, accessibilityLabel: accessibility(step, values, base) };
}
