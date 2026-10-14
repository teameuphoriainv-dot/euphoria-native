/**
 * Ledger: a worked compound-growth example that builds one year per tap, then fades. The card solves
 * the first years for the learner, the learner picks the next year's gain, then the card jumps to a
 * far year beside the total that adding a flat amount would reach. The renderer is
 * components/mobile-lesson/parts/growth-ledger-card.tsx.
 *
 * WORKED EXAMPLE, THEN FADE IT (CESE 2017; IES Practice Guide rec. 2, research.json). Years 1 to
 * `workedYears` are solved with every step shown; the next year asks for only its last step; the
 * practice question after the card asks why, with no help.
 *
 * EVERY FIGURE IS COMPUTED HERE (CONSTITUTION 3.1). ledgerRows derives each total and gain from
 * `start` and `ratePercent`; no row value is typed by hand. checkLedger holds the authored strings to
 * it: every money figure in a caption, option or tick must equal a computed gain, total or flat total
 * to the cent, so a retuned rate cannot leave a sentence quoting the old arithmetic.
 *
 * Pure: no React Native imports, so a pin can load it under plain node.
 */
import { CARD_BUDGET } from '../types';

export interface LedgerSpec {
  kind: 'ledger';
  /** At most 42. */
  title: string;
  /** At most 16, required: 'Example numbers' (CONSTITUTION 3.1). */
  tag: string;
  start: number;
  ratePercent: number;
  /** Rows the card solves for the learner (3). */
  workedYears: number;
  /** years.length === workedYears; each at most 90. */
  captions: { start: string; years: string[] };
  /** The faded step: year workedYears + 1. */
  ask: {
    /** At most 90. */
    prompt: string;
    /** Money strings: exactly one equals that year's gain, the rest equal earlier years' gains. */
    options: string[];
    /** At most 90. */
    right: string;
    /** At most 90 each, aligned with the wrong options in authored order. */
    wrong: string[];
  };
  /** At most 24 each. */
  buttons: { next: string; jump: string };
  /** tick: the flat-growth total at `year`, e.g. '$250'. */
  jump: { year: number; caption: string; tick: string };
}

/** The ledger card draws no Atlas; the lesson hides its floating one so it never covers a control. */
export const LEDGER_HIDES_FLOAT = true;

export const LEDGER_TITLE_MAX = CARD_BUDGET.title;
export const LEDGER_TAG_MAX = 16;
export const LEDGER_CAPTION_MAX = 90;
export const LEDGER_BUTTON_MAX = 24;

export type LedgerRow = { year: number; gain: number; total: number };

/**
 * Year 1 to `years`, exact. Each total is start x (1 + r)^year; each gain is that total minus the year
 * before. Display rounds to cents (money), and because each shown total is the shown total before it
 * plus the shown gain (110.25 + 5.51 = 115.76, 115.76 + 5.79 = 121.55 at 5% on 100), the rows add up
 * on screen as well as in fact. checkLedger asserts that for the rows the card shows.
 */
export function ledgerRows(start: number, ratePercent: number, years: number): LedgerRow[] {
  const r = ratePercent / 100;
  const out: LedgerRow[] = [];
  let prev = start;
  for (let year = 1; year <= years; year++) {
    const total = start * (1 + r) ** year;
    out.push({ year, gain: total - prev, total });
    prev = total;
  }
  return out;
}

/** What adding the same flat amount (start x r) every year reaches: start x (1 + r x years). */
export function simpleTotal(start: number, ratePercent: number, years: number): number {
  return start * (1 + (ratePercent / 100) * years);
}

/** Whole cents, the unit every comparison here is made in. */
export const cents = (n: number): number => Math.round(n * 100);

/** '$110.25'. Thousands get commas ('$1,577.50'); never a count-up, never a rounding to dollars. */
export function money(n: number): string {
  const c = cents(n);
  const sign = c < 0 ? '-' : '';
  const abs = Math.abs(c);
  const whole = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${whole}.${String(abs % 100).padStart(2, '0')}`;
}

/** Spoken money for VoiceOver: '110 dollars 25 cents', '5 dollars', '432 dollars 19 cents'. */
export function moneyWords(n: number): string {
  const c = Math.abs(cents(n));
  const d = Math.floor(c / 100);
  const k = c % 100;
  const dollars = `${String(d)} ${d === 1 ? 'dollar' : 'dollars'}`;
  return k === 0 ? dollars : `${dollars} ${String(k)} ${k === 1 ? 'cent' : 'cents'}`;
}

/** Every money figure in a sentence, as numbers ('$5.25' gives 5.25, '$250,000' gives 250000). */
export function moneyIn(text: string): number[] {
  return [...text.matchAll(/\$(\d[\d,]*(?:\.\d+)?)/g)].map((m) => Number(m[1].replace(/,/g, '')));
}

/** The bar scale: the next multiple of 25 at or above `n`, so the longest bar nearly fills its lane. */
export function scaleCeil(n: number): number {
  return Math.max(25, Math.ceil(n / 25) * 25);
}

/** The year the learner works out: the one after the solved rows. */
export const askYear = (spec: LedgerSpec): number => spec.workedYears + 1;

/** Every sentence this card puts on screen, for a deck's say-it-once check. */
export function textOf(spec: LedgerSpec): string[] {
  return [
    spec.title,
    spec.tag,
    spec.captions.start,
    ...spec.captions.years,
    spec.ask.prompt,
    ...spec.ask.options,
    spec.ask.right,
    ...spec.ask.wrong,
    spec.buttons.next,
    spec.buttons.jump,
    spec.jump.caption,
    spec.jump.tick,
  ];
}

const DASH = /[\u2013\u2014]/;

/** Every rule the ledger card relies on. Returns the problems; an empty list is a pass. */
export function checkLedger(spec: LedgerSpec): string[] {
  const bad: string[] = [];
  const over = (s: string, max: number, what: string) => {
    if (s.length > max) bad.push(`${what} over ${String(max)}: "${s.slice(0, 40)}"`);
  };
  if (spec.kind !== 'ledger') bad.push('kind is not ledger');
  over(spec.title, LEDGER_TITLE_MAX, 'title');
  if (!spec.tag.trim()) bad.push('tag is required (made-up numbers are labelled, CONSTITUTION 3.1)');
  over(spec.tag, LEDGER_TAG_MAX, 'tag');
  for (const s of [spec.captions.start, ...spec.captions.years, spec.ask.prompt, spec.ask.right, ...spec.ask.wrong, spec.jump.caption]) {
    over(s, LEDGER_CAPTION_MAX, 'caption');
  }
  over(spec.buttons.next, LEDGER_BUTTON_MAX, 'button');
  over(spec.buttons.jump, LEDGER_BUTTON_MAX, 'button');
  for (const s of textOf(spec)) if (DASH.test(s)) bad.push(`"${s.slice(0, 40)}" has a dash`);
  if (!(spec.start > 0 && spec.ratePercent > 0)) bad.push('start and ratePercent must be positive');
  if (!(Number.isInteger(spec.workedYears) && spec.workedYears >= 1)) bad.push('workedYears must be a whole number from 1');
  if (spec.captions.years.length !== spec.workedYears) bad.push(`${String(spec.captions.years.length)} year captions for ${String(spec.workedYears)} worked years`);
  if (!(spec.jump.year > askYear(spec) + 1)) bad.push('the jump must land past the asked year, with years skipped between');

  const rows = ledgerRows(spec.start, spec.ratePercent, Math.max(spec.jump.year, askYear(spec)));
  const ask = rows[askYear(spec) - 1];
  const earlier = rows.slice(0, spec.workedYears).map((r) => cents(r.gain));

  // The faded step: one option is that year's gain, every other is an earlier year's gain.
  const opts = spec.ask.options.map((o) => moneyIn(o)[0]);
  if (opts.some((v) => v === undefined)) bad.push('every ask option must be a money figure');
  const right = opts.filter((v) => v !== undefined && ask && cents(v) === cents(ask.gain));
  if (right.length !== 1) bad.push(`exactly one ask option must equal year ${String(askYear(spec))}'s gain ${ask ? money(ask.gain) : '?'}`);
  for (const v of opts) {
    if (v === undefined || (ask && cents(v) === cents(ask.gain))) continue;
    if (!earlier.includes(cents(v))) bad.push(`ask option ${money(v)} is not an earlier year's gain`);
  }
  if (spec.ask.wrong.length !== spec.ask.options.length - 1) bad.push('one wrong line per wrong option');
  if (new Set(spec.ask.options).size !== spec.ask.options.length) bad.push('two ask options are the same');

  // The tick is the flat-growth total at the jump year.
  const flat = simpleTotal(spec.start, spec.ratePercent, spec.jump.year);
  const tick = moneyIn(spec.jump.tick);
  if (tick.length !== 1 || cents(tick[0]) !== cents(flat)) bad.push(`tick ${spec.jump.tick} must equal the flat total ${money(flat)}`);

  // Every money figure in the words is one the card computes (to the cent).
  const known = new Set<number>([
    cents(spec.start),
    cents(spec.start * (spec.ratePercent / 100)),
    cents(flat),
    ...rows.slice(0, askYear(spec)).flatMap((r) => [cents(r.gain), cents(r.total)]),
    ...(rows[spec.jump.year - 1] ? [cents(rows[spec.jump.year - 1].total)] : []),
  ]);
  for (const s of [spec.captions.start, ...spec.captions.years, spec.ask.prompt, spec.ask.right, ...spec.ask.wrong, spec.jump.caption]) {
    for (const v of moneyIn(s)) if (!known.has(cents(v))) bad.push(`"${s.slice(0, 40)}" says ${money(v)}, which the ledger never computes`);
    for (const m of s.matchAll(/(\d+(?:\.\d+)?)%/g)) {
      if (Number(m[1]) !== spec.ratePercent) bad.push(`"${s.slice(0, 40)}" says ${m[0]}, not the ${String(spec.ratePercent)}% rate`);
    }
  }

  // The rows add up as shown: each shown total is the shown total before it plus the shown gain.
  let prevShown = cents(spec.start);
  for (const r of rows.slice(0, askYear(spec))) {
    if (prevShown + cents(r.gain) !== cents(r.total)) bad.push(`year ${String(r.year)}: ${money(prevShown / 100)} + ${money(r.gain)} is not ${money(r.total)} as shown`);
    prevShown = cents(r.total);
  }
  return bad;
}
