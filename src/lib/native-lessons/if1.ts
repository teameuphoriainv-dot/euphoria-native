/**
 * Investing Fundamentals lesson 1, "Introduction to Investing", rewritten for the phone ("Maya's $100").
 *
 * OWNER DECISION, 2026-10-12 (Sriyan). This lesson is rewritten IN THE APP ONLY: it replaces the synced
 * lesson inside the native app, and the website keeps its own lesson (courseIndex.ts, the raw loader,
 * is untouched). The brief, in his words lightly cleaned: the lessons must "just make sense: no
 * shortcuts, no complex analogies, no confusing terms", be "straight to the point in visuals and
 * explanations", "speak SIMPLY", use research-backed teaching strategies, and pull facts from
 * reputable sources. So: one character (Maya) and one made-up company (Sunny Juice) carry every idea;
 * each word is shown in a picture, then named, then used; questions come only after teaching; every
 * made-up number is visibly tagged as an example (CONSTITUTION 3.1); nothing says what to do with money
 * (3.3); no em dashes (section 4). Build spec: scratchpad if1/lesson-spec.md (2026-10-13).
 *
 * SOURCES. Only these facts appear in the lesson, each also cited beside the string that uses it:
 *  - SEC, "Saving and Investing: A Roadmap To Your Financial Security" (SEC Pub. 009, 06/2011): what
 *    investing is, the two ways money grows, saving vs investing, buying power ("half a loaf"), the
 *    risk of losing some or all, compounding and its 5% example rate.
 *    https://www.investor.gov/sites/investorgov/files/2019-02/Saving-and-Investing.pdf
 *  - Federal Reserve FAQ, inflation is "the increase in the prices of goods and services over time"
 *    (page updated 2025-08-22). https://www.federalreserve.gov/faqs/economy_14419.htm
 *  - U.S. Bureau of Labor Statistics, CPI news release, August 2026 data, released 2026-09-11: all items
 *    up 3.4 percent over 12 months. Archived copy of that release (the rolling cpi.nr0.htm page moves
 *    to newer data each month): https://www.bls.gov/news.release/archives/cpi_09112026.htm
 *  - FDIC, "Understanding Deposit Insurance": $250,000 per depositor, per insured bank, per ownership
 *    category; investments not covered (page updated 2024-04-01).
 *    https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance
 *  - FINRA, "Stocks": owning a stock is owning shares of a company; prices can go down.
 *    https://www.finra.org/investors/investing/investment-products/stocks
 *  - SEC investor.gov, "Bonds": a bond is a loan to a government or company, repaid with interest;
 *    the borrower may fail to pay.
 *    https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds
 *
 * HOW IT REACHES THE APP. src/lib/native-lessons/index.ts swaps this in at the wrapped loader
 * (curriculum/index.ts) only while `source.fingerprint` matches the raw synced lesson. If the web
 * lesson changes, the app falls back to the synced lesson and scripts/native-lesson-pin.mjs fails,
 * printing the new fingerprint, so the rewrite is re-reviewed rather than left describing a lesson
 * that moved underneath it.
 *
 * REVIEW ROUND 2 (2026-10-13): a clarity read as a 13 year old, a fact check against the sources and a
 * walk on the iPhone 17 simulator. Plainer words (one word per idea: "worth", never also "value"),
 * the real 3.4% presented as a US average applied to an example ticket, the FDIC limit scoped to
 * insured banks, return defined as a gain or a loss, self-contained challenge questions, and the
 * vocab quiz asking about situations (`ask`) instead of echoing each definition.
 *
 * REVIEW ROUND 3 (2026-10-13): the tickets caption shows that 10 tickets now cost more than $100; saving
 * means a bank and "protected" is scoped; "One way" / "Another way" instead of an unexplained "Way 1";
 * why a lender gets extra; return and compound growth defined in the ledger's word, "gain", with "if the
 * percent stays the same"; inflation asked about most prices, not one snack; bond repayment is promised,
 * not certain; and challenge 2 tests what owning versus lending does, not the labels.
 *
 * Scene coordinates are scene pixels on the 80 x 60 story canvas, top-left anchors, tuned against the
 * art in src/lib/pixel/stories/if1-story.ts. Pure data: no React Native imports, so the pin loads it
 * under node.
 */
import type { ChallengeQuestion, LessonStep } from '../curriculum/types';
import type { MobileDeck } from '../mobile-lesson/types';
import type { NativeChoiceStep, NativeLesson, NativeVocabStep } from './types';

/*
 * THE ONE REAL INFLATION FIGURE. Every price label, the Aug 2026 caption, the chips and challenge
 * question 1 are derived from this, so a refresh is a one-line edit the pin re-checks.
 * Source: U.S. Bureau of Labor Statistics, CPI news release, August 2026 data, released 2026-09-11:
 * "Over the last 12 months, the all items index increased 3.4 percent before seasonal adjustment."
 * Cited at the archived release (fetched 2026-10-13, same sentence), because the rolling page
 * https://www.bls.gov/news.release/cpi.nr0.htm switches to September data on 2026-10-14.
 * It is the ALL ITEMS average (the same release puts movie admission at 2.6%). So the lesson's ticket is
 * an EXAMPLE ticket whose price is set to rise by that average ("The ticket price rose 3.4%, like US
 * prices on average"), and the footer says which part is the example and which part is real
 * (an example on a real rate, CONSTITUTION 3.1).
 * RE-CHECK: the Aug 2026 figure stays true as a dated fact. Moving to a newer month is optional and is a
 * CPI_12M edit only (pct, from, to, url). The story says "only 9" with no rate, which stays true for
 * any 12-month rise above 0% and up to 11.1%.
 */
export const CPI_12M = { pct: 3.4, from: 'Aug 2025', to: 'Aug 2026', url: 'https://www.bls.gov/news.release/archives/cpi_09112026.htm' } as const;

/** Example ticket price (made up, labelled in the footer). */
const TICKET = 10;
const ticketLater = (TICKET * (1 + CPI_12M.pct / 100)).toFixed(2); // '10.34'
/** 10 tickets at the shown later price, so the caption's sum adds up with the board label. */
const tenLater = (10 * Number(ticketLater)).toFixed(2); // '103.40'
const ART = 'if1';
const deckId = (screen: number) => `native:investing-fundamentals:1:s${String(screen)}`;

/* ── Screen 1: the story ─────────────────────────────────────────────────────────────────────── */
// The story is made up and tagged "Example story" on every beat (CONSTITUTION 3.1). The idea that the same
// money buys less when prices rise: SEC, "Saving and Investing" (buying power, "half a loaf"),
// https://www.investor.gov/sites/investorgov/files/2019-02/Saving-and-Investing.pdf
const s1: MobileDeck = {
  type: 'mobileDeck',
  sourceType: 'native',
  sourceId: deckId(1),
  label: 'A story',
  title: "Maya's birthday money",
  cards: [
    {
      kind: 'interactive',
      spec: {
        kind: 'story',
        title: "Maya's birthday money",
        artKey: ART,
        tag: 'Example story',
        autoplay: false,
        beats: [
          {
            frame: 'room',
            caption: 'Maya gets a $100 bill for her birthday. She puts it in her desk drawer to save it for later.',
            a11y: 'Maya walks in holding a 100 dollar bill, drops it into her desk drawer and closes it.',
            // She walks in holding the bill (her hand is 11px right of her x), so the money the whole
            // lesson is about is on screen from the first beat. It shows in the open drawer for about
            // half a second before the drawer closes over it.
            cast: [
              { actor: 'drawer', do: 'slide', instant: true, at: { x: 52, y: 38 } },
              { actor: 'maya', do: 'enter', walk: true, from: { x: -14, y: 26 }, at: { x: 33, y: 26 }, ms: 900 },
              { actor: 'bill', do: 'slide', walk: true, from: { x: -3, y: 35 }, at: { x: 44, y: 35 }, ms: 900 },
              { actor: 'drawer', do: 'slide', at: { x: 52, y: 41 }, atMs: 900, ms: 250 },
              { actor: 'bill', do: 'slide', from: { x: 44, y: 35 }, at: { x: 54, y: 40 }, atMs: 1150, ms: 400 },
              { actor: 'bill', do: 'exit', atMs: 2000, ms: 150 },
              { actor: 'drawer', do: 'slide', at: { x: 52, y: 38 }, atMs: 2000, ms: 250 },
            ],
          },
          {
            frame: 'booth',
            caption: "Let's say a movie ticket costs $10. Her $100 could buy 10 tickets.",
            a11y: 'At a movie ticket window, 10 tickets appear on the shelf in two rows of 5.',
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 10, y: 26 } },
              { actor: 'ticket', do: 'count', n: 10, perRow: 5, gap: 1, at: { x: 38, y: 37 }, derivedFrom: '10 tickets' },
            ],
          },
          {
            frame: 'room',
            caption: 'A whole year goes by. The bill in the drawer still says $100.',
            a11y: 'Calendar pages flip by. The drawer opens and the bill is still inside.',
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 33, y: 26 } },
              { actor: 'drawer', do: 'slide', instant: true, at: { x: 52, y: 38 } },
              { actor: 'calendar', do: 'play', at: { x: 36, y: 12 }, times: 2 },
              { actor: 'drawer', do: 'slide', at: { x: 52, y: 41 }, atMs: 1300, ms: 250 },
              { actor: 'bill', do: 'enter', at: { x: 54, y: 40 }, atMs: 1550, ms: 200 },
              { actor: 'glint', do: 'play', at: { x: 60, y: 39 }, atMs: 1750 },
            ],
          },
          {
            frame: 'booth',
            // "Some change left": 9 tickets at the example $10.34 cost $93.06, so the picture's 1 grey ticket
            // of 10 is whole tickets, not a 10% loss (buying power fell 3.3%).
            caption: 'But ticket prices went up a little. Now her $100 buys only 9 tickets, with some change left.',
            a11y: 'An up arrow sticks to the price board. One of the 10 tickets turns into a grey outline, leaving 9.',
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 10, y: 26 } },
              { actor: 'ticket', do: 'count', instant: true, n: 10, perRow: 5, gap: 1, at: { x: 38, y: 37 } },
              { actor: 'sticker', do: 'stamp', at: { x: 53, y: 18 } },
              { actor: 'ticket', do: 'ghost', index: 9, ghostSprite: 'ticket-ghost', atMs: 700, ms: 400, derivedFrom: 'only 9 tickets' },
            ],
          },
          {
            frame: 'orchard',
            caption: "Her $100 didn't shrink. It just buys less. Could her money grow instead?",
            a11y: 'Maya walks out to a small sprout in the orchard under the moon.',
            cast: [
              { actor: 'maya', do: 'enter', walk: true, from: { x: -14, y: 26 }, at: { x: 15, y: 26 }, ms: 1200 },
              { actor: 'glint', do: 'play', at: { x: 32, y: 41 }, atMs: 1300 },
            ],
          },
        ],
      },
    },
  ],
};

/* ── Screen 2: why it buys less ──────────────────────────────────────────────────────────────── */
const s2: MobileDeck = {
  type: 'mobileDeck',
  sourceType: 'native',
  sourceId: deckId(2),
  label: 'Prices',
  title: 'Why the same money buys less',
  cards: [
    {
      kind: 'interactive',
      spec: {
        kind: 'toggle',
        title: 'One year apart',
        artKey: ART,
        // Ticket price: example. The rise: BLS all-items average (CPI_12M above). "Example" stays a word
        // of its own here: native-lesson-pin requires it on a footer whose view shows a made-up figure.
        footer: 'Example ticket price. The price rise is the real US average (Bureau of Labor Statistics).',
        states: [
          {
            chip: CPI_12M.from,
            frame: 'booth',
            caption: 'At first, her money buys 10 tickets.',
            a11y: 'A 100 dollar bill. Tickets cost 10 dollars each. All 10 tickets are lit.',
            labels: [
              { id: 'bill', text: '$100', at: { x: 23, y: 29 }, tone: 'accent' },
              { id: 'board', text: `$${String(TICKET)} each`, at: { x: 46, y: 18 }, tone: 'ink' },
            ],
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 10, y: 26 } },
              { actor: 'bill', do: 'slide', instant: true, at: { x: 20, y: 36 } },
              { actor: 'ticket', do: 'count', instant: true, n: 10, perRow: 5, gap: 1, at: { x: 38, y: 37 }, derivedFrom: '10 tickets' },
            ],
          },
          {
            chip: CPI_12M.to,
            frame: 'booth',
            // The real figure is the all-items average, applied to the example ticket (see CPI_12M). The
            // caption shows the step a beginner needs: 10 tickets now cost more than $100, which is why ONE
            // ticket greys. It is whole tickets, not a tenth of her money (the % anchored to dollars).
            caption: `The ticket price rose ${String(CPI_12M.pct)}%, like US prices on average. Now 10 tickets cost $${tenLater}. She can buy only 9.`,
            a11y: 'The same 100 dollar bill. Tickets cost 10 dollars 34 cents each. 9 tickets are lit and the 10th is a grey outline.',
            labels: [
              { id: 'bill', text: '$100', at: { x: 23, y: 29 }, tone: 'accent' },
              { id: 'board', text: `$${ticketLater} each`, at: { x: 46, y: 18 }, tone: 'ink' },
            ],
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 10, y: 26 } },
              { actor: 'bill', do: 'slide', instant: true, at: { x: 20, y: 36 } },
              { actor: 'ticket', do: 'count', instant: true, n: 10, perRow: 5, gap: 1, at: { x: 38, y: 37 } },
              { actor: 'ticket', do: 'ghost', index: 9, ghostSprite: 'ticket-ghost', atMs: 400, ms: 400, derivedFrom: 'only 9' },
            ],
          },
        ],
      },
    },
    {
      kind: 'term',
      term: 'Inflation',
      // Federal Reserve FAQ: "the increase in the prices of goods and services over time."
      // https://www.federalreserve.gov/faqs/economy_14419.htm
      plain: 'Prices going up over time. You have the same amount of money, but it buys less.',
      scene: { archetype: 'gap', accent: 'green', explain: 'The bill never changed. The price did.', story: { artKey: ART, still: 'booth-up' } },
    },
  ],
};

/* ── Screen 3: quick check (why) ─────────────────────────────────────────────────────────────── */
const s3: NativeChoiceStep = {
  type: 'microCheck',
  question: "Maya's bill still says $100. Why does it buy fewer tickets now?",
  options: ['Prices went up, but her bill stayed the same', 'Some of her money was taken away', 'Old bills are worth less than brand new bills', 'She has to pay a fee for keeping cash'],
  correct: 0,
  explanationCorrect: 'Right. Nothing left the drawer. Prices rose, so the same bill buys less.',
  explanationWrong: 'Not quite. The bill never changed. Prices went up, so it buys fewer tickets.',
  explainWhenRight: true,
};

/* ── Screen 4: way 1, own a piece ────────────────────────────────────────────────────────────── */
// SEC roadmap: investing is "giving your money to a company or enterprise, hoping that it will be
// successful and pay you back with even more money". FINRA "Stocks": "you buy ownership shares in a
// company"; prices "can go down, sometimes quite dramatically". SEC roadmap: risk of "losing a portion or
// all of your initial investment" (supports "could even drop to $0").
// https://www.investor.gov/sites/investorgov/files/2019-02/Saving-and-Investing.pdf
// https://www.finra.org/investors/investing/investment-products/stocks
const OWN_STRIP = { at: { x: 18, y: 58 }, count: 10, mine: 0, tileW: 5, gap: 1, restH: 10 } as const;
const s4: MobileDeck = {
  type: 'mobileDeck',
  sourceType: 'native',
  sourceId: deckId(4),
  label: 'Owning',
  title: 'One way: own a piece',
  cards: [
    {
      kind: 'idea',
      title: "Can Maya's money grow?",
      // "something, like a company": lending to a government (screen 11, the Bond card) is investing too,
      // and the SEC roadmap lists bonds, stocks, funds, real estate and commodities as investments.
      body: 'Yes, by investing: putting money into something, like a company, hoping to get more back.',
      scene: { archetype: 'growth', accent: 'green', explain: 'There are two common ways: own a piece of a company, or lend your money.', story: { artKey: ART, still: 'orchard-sprout' } },
    },
    {
      kind: 'interactive',
      spec: {
        kind: 'toggle',
        // "One way", not "Way 1": the line that says there are two ways is the picture's VoiceOver label,
        // so a sighted learner never reads it.
        title: 'One way: own a piece of a company',
        artKey: ART,
        footer: 'Example company and prices.',
        strip: OWN_STRIP,
        states: [
          {
            chip: 'Buy a piece',
            frame: 'stand',
            caption: 'Sunny Juice is a small company, split into 10 equal pieces. Maya buys 1 piece.',
            a11y: 'The Sunny Juice stand. Below it, 10 equal tiles. Maya owns one tile, worth 100 dollars.',
            strip: { h: 10 },
            labels: [{ id: 'piece', text: 'Her piece: $100', at: { x: 18, y: 40 }, tone: 'accent' }],
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 2, y: 26 } },
              { actor: 'coin-100', do: 'slide', from: { x: 14, y: 37 }, at: { x: 18, y: 49 }, ms: 400 },
              { actor: 'coin-100', do: 'exit', atMs: 400, ms: 150 },
            ],
          },
          {
            chip: 'Good year',
            frame: 'stand',
            // "Worth" in plain terms: what someone would pay for it.
            caption: 'Sunny Juice sells lots of juice and earns more. Now people would pay more for a piece.',
            a11y: "Customers at the stand. Every tile is taller. Maya's piece is worth 120 dollars.",
            strip: { h: 12 },
            labels: [{ id: 'piece', text: 'Her piece: $120', at: { x: 18, y: 38 }, tone: 'accent' }],
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 2, y: 26 } },
              { actor: 'customer-a', do: 'enter', walk: true, from: { x: 82, y: 27 }, at: { x: 58, y: 27 }, ms: 600 },
              { actor: 'customer-b', do: 'enter', walk: true, from: { x: 90, y: 26 }, at: { x: 66, y: 26 }, atMs: 150, ms: 600 },
            ],
          },
          {
            chip: 'Bad year',
            frame: 'stand-rain',
            caption: 'Rain means few sales. People would pay less for a piece. It could even drop to $0.',
            a11y: "Rain at the stand and no customers. Every tile is shorter. Maya's piece is worth 80 dollars.",
            strip: { h: 8 },
            labels: [{ id: 'piece', text: 'Her piece: $80', at: { x: 18, y: 42 }, tone: 'warn' }],
            cast: [{ actor: 'maya', do: 'slide', instant: true, at: { x: 2, y: 26 } }],
          },
        ],
      },
    },
    {
      kind: 'term',
      term: 'Stock',
      // Not "with the company": the market as a whole moves a stock too (FINRA "Stocks"; SEC roadmap p.13).
      plain: "A small piece of a company that you own. What it's worth can go up or down.",
      scene: { archetype: 'split', accent: 'green', explain: 'People also call a piece of a company a share. It means the same thing.', story: { artKey: ART, still: 'stand-piece' } },
    },
  ],
};

/* ── Screen 5: way 2, lend it ────────────────────────────────────────────────────────────────── */
// SEC investor.gov "Bonds": "you are lending to the issuer, which may be a government, municipality, or
// corporation ... promises to pay you a specified rate of interest ... and to repay the principal";
// credit risk: "may fail to timely make interest or principal payments".
// https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds
const s5: MobileDeck = {
  type: 'mobileDeck',
  sourceType: 'native',
  sourceId: deckId(5),
  label: 'Lending',
  title: 'Another way: lend it',
  cards: [
    {
      kind: 'interactive',
      spec: {
        kind: 'toggle',
        title: 'Another way: lend your money',
        artKey: ART,
        footer: 'Example company and numbers.',
        states: [
          {
            chip: 'Lend it',
            frame: 'stand',
            // "Instead": lending is the other way to invest the same $100, not a second $100.
            caption: 'Instead, Maya lends Sunny Juice her money for 2 years, so it can buy a new blender.',
            a11y: 'Maya hands her 100 dollars to the stand keeper. A blender box lands on the counter.',
            labels: [{ id: 'loan', text: '$100 loan', at: { x: 26, y: 40 }, tone: 'accent' }],
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 10, y: 26 } },
              { actor: 'coin-100', do: 'slide', from: { x: 22, y: 37 }, at: { x: 46, y: 33 }, ms: 400 },
              { actor: 'blender', do: 'stamp', at: { x: 56, y: 30 }, atMs: 450 },
            ],
          },
          {
            chip: 'Get paid',
            frame: 'stand',
            // Says WHY she gets extra (for the use of her money: research.json misconceptions, interest is
            // money paid for using someone else's money) and keeps "same every year" for screen 6.
            caption: 'For using her money, Sunny Juice pays the same extra every year, good or bad. Then it pays her back.',
            a11y: "Two small coins, 5 dollars each year, then her 100 dollars, all back at Maya's feet.",
            labels: [
              { id: 'extra', text: '+$5 a year', at: { x: 4, y: 49 }, tone: 'ink' },
              { id: 'loan', text: '$100 back', at: { x: 29, y: 49 }, tone: 'accent' },
            ],
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 10, y: 26 } },
              { actor: 'blender', do: 'stamp', instant: true, at: { x: 56, y: 30 } },
              { actor: 'coin-5', do: 'slide', from: { x: 46, y: 34 }, at: { x: 8, y: 44 }, ms: 500 },
              { actor: 'coin-5b', do: 'slide', from: { x: 46, y: 34 }, at: { x: 13, y: 44 }, atMs: 700, ms: 500 },
              { actor: 'coin-100', do: 'slide', from: { x: 46, y: 33 }, at: { x: 28, y: 43 }, atMs: 1400, ms: 500 },
            ],
          },
          {
            chip: 'If it fails',
            frame: 'stand-closed',
            caption: 'The risk: if Sunny Juice runs out of money, it might not pay her back.',
            a11y: 'The stand is boarded up. Her 100 dollars is a grey outline marked at risk.',
            labels: [{ id: 'loan', text: '$100 at risk', at: { x: 34, y: 26 }, tone: 'warn' }],
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 10, y: 26 } },
              { actor: 'coin-100', do: 'ghost', at: { x: 46, y: 33 }, ghostSprite: 'coin-100-ghost', ms: 400 },
            ],
          },
        ],
      },
    },
    {
      kind: 'term',
      term: 'Bond',
      plain: 'A loan you give to a company or a government. They promise to pay it back on a set date, plus extra.',
      scene: { archetype: 'debt', accent: 'green', explain: 'The extra Sunny Juice pays Maya for using her money is called interest.', story: { artKey: ART, still: 'stand-lend' } },
    },
  ],
};

/* ── Screen 6: quick check (owner or lender) ─────────────────────────────────────────────────── */
const s6: NativeChoiceStep = {
  type: 'microCheck',
  // "Make her money grow", not "get her more money": an owner's piece is WORTH more (screen 4), it is not
  // paid out as cash, so the question and its feedback teach the same thing.
  question: "Sunny Juice has its best year ever. Which way would make Maya's money grow more?",
  options: ['Owning a piece', 'Lending it money', 'Both the same'],
  correct: 0,
  explanationCorrect: "Yes. When the company does well, an owner's piece is worth more. A lender gets the same either way.",
  explanationWrong: "A lender gets the same in any year. An owner's piece is worth more when the company does well.",
  explainWhenRight: true,
};

/* ── Screen 7: growth on growth ──────────────────────────────────────────────────────────────── */
// SEC roadmap, "Small Savings Add Up to Big Money": "With compound interest, you earn interest on the money
// you save and on the interest that money earns." 5% is the SEC's own example rate; here it is labelled
// "Example numbers" and every figure is computed by ledger.ts (100 x 1.05^n).
const s7: MobileDeck = {
  type: 'mobileDeck',
  sourceType: 'native',
  sourceId: deckId(7),
  label: 'Growth',
  title: 'Growth on growth',
  cards: [
    {
      kind: 'term',
      term: 'Return',
      // A gain OR a loss (the lesson's last idea is that investing can lose), and the sum is an Example (3.1).
      // "Compared with", not "on top of": a loss cannot sit on top of anything. No "or 5%": one idea per
      // card. The ledger's year 1 caption ties 5% to $5 on the next card.
      plain: 'How much you gain or lose, compared with what you put in. Example: if $100 grows to $105, your return is $5.',
      scene: { archetype: 'income', accent: 'green', explain: 'Percent means out of every 100. So 5% is 5 cents of every dollar.', story: { artKey: ART, still: 'coin-plus' } },
    },
    {
      kind: 'interactive',
      spec: {
        kind: 'ledger',
        title: "Watch Maya's money grow",
        tag: 'Example numbers',
        start: 100,
        ratePercent: 5,
        workedYears: 3,
        captions: {
          // Says what happens to each gain (no account or drawer holds this money, so "never takes it out"
          // asked: out of what?). This is what makes it differ from the loan's flat +$5 on screen 5.
          start: "Let's say her money grows 5% a year, and each gain is added to her total.",
          years: [
            "Year 1: she gains 5% of what she started with. That's $5.",
            "Year 2: 5% of her new, bigger total. That's $5.25, a bit more.",
            "Year 3: 5% of an even bigger total. That's $5.51. The gain keeps growing.",
          ],
        },
        ask: {
          prompt: "Your turn. Year 4's gain is 5% of her year 3 total. Which one is it?",
          options: ['$5.00', '$5.51', '$5.79'],
          right: 'Yes, about $5.79. A bigger total makes a bigger gain.',
          wrong: ["That was year 1's gain. Her total is bigger now, so the gain is too.", "That was year 3's gain. Her total grew since then, so the gain grows too."],
        },
        buttons: { next: 'Next year', jump: 'Jump to year 30' },
        // The straight-line misconception, tied to something already understood: the loan's flat extra.
        jump: { year: 30, caption: 'Year 30. The same $5 every year, like her loan paid, would only reach the dashed line.', tick: '$250' },
      },
    },
    {
      kind: 'term',
      term: 'Compound growth',
      // The same definition the vocab part teaches, so the learner meets one meaning, not two. It uses the
      // ledger's word ("gain"), and "if the percent stays the same" keeps it true: compounding at a rate
      // that changes, or turns negative, can gain less next year (FINRA "Stocks": prices can go down).
      plain: 'When the money you gained starts growing too. If the percent stays the same, you gain more each year.',
      scene: { archetype: 'compound', accent: 'green', explain: 'If the percent stays the same, the longer it grows, the faster it grows.', story: { artKey: ART, still: 'stacks' } },
    },
  ],
};

/* ── Screen 8: the catch ─────────────────────────────────────────────────────────────────────── */
// FDIC, "Understanding Deposit Insurance": "$250,000 per depositor, per FDIC-insured bank, for each account
// ownership category"; it "does not cover non-deposit investment products" (stocks, bonds, funds).
// Page updated 2024-04-01. https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance
// SEC roadmap, saving vs investing: savings are "paid a low wage"; investing has "a greater chance of
// losing your money" and "the opportunity to earn more money"; investments are "not federally insured.
// You could lose your principal" (p.10). Coverage is for FDIC-insured banks only, so the footer says so.
const s8: MobileDeck = {
  type: 'mobileDeck',
  sourceType: 'native',
  sourceId: deckId(8),
  label: 'Saving vs investing',
  title: 'Saving or investing',
  cards: [
    {
      kind: 'interactive',
      spec: {
        kind: 'toggle',
        title: 'Saving or investing?',
        artKey: ART,
        // "Pays back": the plainest true word for what the FDIC does when an insured bank closes. The limit
        // and "at insured banks" scope the caption's "protected".
        footer: 'The FDIC, a US government agency, pays back savings up to $250,000 at insured banks.',
        states: [
          {
            chip: 'Saving',
            frame: 'bank',
            // One idea plus the inflation tie-back. "Runs out of money" is screen 5's own phrase (a bank
            // "failing" was never explained). "Saving" now means a bank, said in the caption's first words.
            // The small coin and the "Grows slowly" label carry the little extra the bank pays.
            caption: 'In a bank, her money is protected even if the bank runs out of money. It may grow slower than prices rise.',
            a11y: "A small stone bank. Maya's coin goes into the vault, a shield appears over the door, and one small coin slowly appears beside it.",
            labels: [
              { id: 'shield', text: 'Protected', at: { x: 50, y: 17 }, tone: 'ink' },
              { id: 'slow', text: 'Grows slowly', at: { x: 46, y: 47 }, tone: 'muted' },
            ],
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 6, y: 26 } },
              { actor: 'coin-100', do: 'slide', from: { x: 18, y: 37 }, at: { x: 44, y: 38 }, ms: 400 },
              { actor: 'coin-100', do: 'exit', atMs: 400, ms: 150 },
              { actor: 'shield', do: 'stamp', at: { x: 41, y: 15 }, atMs: 600 },
              { actor: 'coin-5', do: 'enter', at: { x: 56, y: 42 }, atMs: 1000, ms: 1200 },
            ],
          },
          {
            chip: 'Investing',
            frame: 'stand',
            // Not "nothing protects an investment" (broker-failure cover exists): nobody covers a loss in
            // what it is worth. Said in Maya's world, in the positive, with no "worth less"/"worthless"
            // misreading and no undefined noun "investment". The dashed tile outlines were cut as unreadable.
            caption: 'If her piece of Sunny Juice ends up worth less than she paid, nobody pays her back the difference.',
            a11y: "Maya's coin, her piece of Sunny Juice, by the stand, with an up arrow marked can grow more and a down arrow marked can lose.",
            labels: [
              { id: 'up', text: 'Can grow more', at: { x: 31, y: 43 }, tone: 'ink' },
              { id: 'down', text: 'Can lose', at: { x: 31, y: 51 }, tone: 'warn' },
            ],
            cast: [
              { actor: 'maya', do: 'slide', instant: true, at: { x: 2, y: 26 } },
              { actor: 'coin-100', do: 'slide', instant: true, at: { x: 18, y: 46 } },
              { actor: 'arrow-up', do: 'stamp', at: { x: 25, y: 44 }, atMs: 200 },
              { actor: 'arrow-down', do: 'stamp', at: { x: 25, y: 51 }, atMs: 700 },
            ],
          },
        ],
      },
    },
    {
      kind: 'takeaway',
      // "Some or all": screen 4 says a piece could drop to $0 (SEC roadmap: "lose some or all of your money").
      body: 'Money left sitting buys less as prices rise. Investing can grow it, or lose some or all.',
      scene: { archetype: 'tradeoff', accent: 'green', story: { artKey: ART, still: 'orchard-moon' } },
    },
  ],
};

/* ── Screen 9: vocab (VocabConversation) ─────────────────────────────────────────────────────── */
// With 5 terms VocabConversation asks indices [1, 4, 3, 0]: Stock, Compound growth, Return, Inflation.
// Bond is the one not quizzed here; it is drilled on screens 6, 11 and 13 and in the challenge.
// `ask` (VocabTerm.ask): the quiz describes a new situation instead of repeating the definition the
// learner read seconds earlier, so it tests the idea, not matching a phrase (research: retrieval).
// Return no longer says "extra ... back", which also described a bond (one of its quiz options).
const s9: NativeVocabStep = {
  type: 'keyTermsCards',
  terms: [
    // Inflation's ask is about MOST prices: the Federal Reserve FAQ says inflation "cannot be measured by an
    // increase in the cost of one product or service"; it is "a general increase in the overall price level".
    { term: 'Inflation', definition: 'Prices going up over time, so the same money buys less.', example: "Example: Maya's $100 bought 10 tickets. A year later, it bought 9.", sentence: "Maya's bill never changed. Prices did.", ask: 'Which word fits? Most things at the store cost more this year than last year.' },
    { term: 'Stock', definition: "A small piece of a company that you own. What it's worth can go up or down.", example: "Example: Maya's piece of Sunny Juice was worth $120 after a good year.", sentence: 'Owners gain when the company does well and lose when it does badly.', ask: 'Which word fits? Ana owns 1 of 20 equal pieces of a bike shop.' },
    // "They promise": repayment is promised, not certain (SEC "Bonds": the issuer "may fail to timely make
    // interest or principal payments"; screen 5's "If it fails" state).
    { term: 'Bond', definition: 'A loan you give to a company or a government. They promise to pay it back on a set date, plus extra.', example: 'Example: Maya lent Sunny Juice money, got $5 extra each year, then got it all back.', sentence: 'A lender is promised the money back, plus extra.' },
    { term: 'Return', definition: 'How much money you gain or lose, compared with what you put in.', example: 'Example: $100 that grows to $105 has a $5 return.', sentence: 'Return is the gain or loss, not the money you started with.', ask: 'Which word fits? Ana put money in, and now she has more. The extra she gained is her...' },
    // Compound growth's ask names the mechanism (gains left in grow too), so Return, "the money you gain",
    // is no longer a defensible answer to it.
    { term: 'Compound growth', definition: 'When the money you gained starts growing too. If the percent stays the same, you gain more each year.', example: "Example: Maya's money gained $5.00, then $5.25, then $5.51.", sentence: 'The gain grows because the total it comes from keeps growing.', ask: 'Which word fits? Ben leaves his gains in. Now those gains grow too, so each year he gets a bit more.' },
  ],
};

/* ── Practice (screens 10 to 13) ─────────────────────────────────────────────────────────────── */
// Native `quiz` shows `explanation` for right AND wrong answers (lesson-steps.ts passes no
// optionFeedback), so each explanation is written to read as the reason either way. `explainWhenRight`
// (NativeChoiceStep) offers it behind Why? after a right answer too, on these and on screens 3 and 6.
const s10: NativeChoiceStep = {
  type: 'quiz',
  question: 'Leo keeps $50 in a shoebox for a year while prices go up. What changes?',
  options: ['It buys less than before', "There's less money in the box", 'It buys exactly the same', 'It grows a little on its own'],
  correct: 0,
  explanation: 'The box still holds the same money. Prices rose, so it buys less stuff.',
  explainWhenRight: true,
};
const s11: NativeChoiceStep = {
  type: 'quiz',
  question: 'Leo lends his city $200 to help build a park. What does he expect?',
  options: ['His money back later, plus extra', 'A piece of the park he can sell', 'Extra money only if the park is popular', 'Nothing, since lending is a gift'],
  correct: 0,
  explanation: "Lending means you're promised your money back on a set date, plus extra. That's a bond.",
  explainWhenRight: true,
};
const s12: NativeChoiceStep = {
  type: 'quiz',
  question: "In the example, Maya's gain went $5.00, then $5.25, then $5.51. Why did it grow?",
  options: ['5% of a bigger total is bigger', 'The 5% went up a little each year', 'She added more money every year', 'Rising prices made her money grow'],
  correct: 0,
  explanation: 'It was 5% every year, but of a bigger total each time, so the gain grew.',
  explainWhenRight: true,
};
const s13: LessonStep = {
  type: 'trueFalse',
  statements: [
    { s: 'A stock can end up worth less, even worth $0.', a: true, explanation: 'If the company does badly, your piece is worth less. It can even be worth nothing.' },
    { s: 'Buying a bond makes you part owner of a company.', a: false, explanation: 'A bond is a loan you give. Owning a piece of a company is a stock.' },
    { s: 'Money in a bank account always keeps up with rising prices.', a: false, explanation: 'Savings can grow slower than prices rise. Then the same money buys less.' },
    // "Protected" is scoped the way the FDIC page scopes it: insured deposits at an insured bank, when the
    // bank closes. Not protected from rising prices (statement 3).
    { s: 'Investing can grow more than saving, but it can also lose money.', a: true, explanation: 'Savings at an insured bank grow slowly but are protected if the bank runs out of money. Investing can grow more, but nothing protects it from losses.' },
  ],
};

/* ── Mastery challenge: 5 written, the first 4 asked; all 5 feed IF2 to IF5 warmup recall ───── */
const challenge: ChallengeQuestion[] = [
  {
    question: `US prices rose ${String(CPI_12M.pct)}% from ${CPI_12M.from} to ${CPI_12M.to} (government price data). What did that do to $100 kept in a drawer?`,
    // The two figures are the wrong answers (100 - 3.4 and 100 + 3.4), never shown as true.
    options: ['It bought less than before', `It shrank to $${(100 - CPI_12M.pct).toFixed(2)}`, `It grew to $${(100 + CPI_12M.pct).toFixed(2)}`, 'Nothing, cash always buys the same'],
    correct: 0,
    explanation: "The bill stayed the same, but prices rose, so it bought less. That's inflation.",
  },
  {
    // Tests what owning versus lending DOES to you, not which label goes with which idea. No story names:
    // IF2 to IF5 warmups recall this question out of context.
    question: 'A small company has a bad year, but it still pays its bills. Who still gets exactly what they were promised?',
    options: ['Someone who lent it money (a bond)', 'Someone who owns a piece (a stock)', 'Both get what they were promised', 'Neither gets anything back'],
    correct: 0,
    explanation: 'A lender was promised their money back plus extra, good year or bad. An owner was promised nothing, and their piece may be worth less now.',
  },
  {
    // "Today" fixes the day they are compared; with equal years of growth the answer would be "the same".
    question: 'Example: Ana and Ben each started with $100 that grows 5% a year. Ana started 10 years before Ben. Who has more today?',
    options: ['Ana', 'Ben', 'They have the same'],
    correct: 0,
    // In compound growth's own words (screen 7), not "each year's gain earns more gain".
    explanation: 'Ana. Her money has grown for 10 more years, and the money she gained keeps growing too.',
  },
  {
    question: 'Which is true about investing, compared with saving in a bank?',
    options: ['It can grow more, or lose money', "It's protected just like bank savings", 'It always grows more if you wait', "It's guaranteed to beat saving"],
    correct: 0,
    explanation: 'Investing can grow more than saving, but it can lose money, and nothing protects you from that loss.',
  },
  {
    question: 'What does a lender usually get for lending money?',
    options: ['Their money back, plus extra', 'A piece of the company to keep', 'Whatever money the company earns', 'Nothing until the company is sold'],
    correct: 0,
    explanation: 'The borrower promises to pay the loan back on a set date, plus extra. Lending to a company or government this way is a bond.',
  },
];

export const lesson: NativeLesson = {
  key: 'investing-fundamentals:1',
  // The raw courseIndex lesson this replaces. If the web lesson changes, the fingerprint stops matching, the
  // app falls back to the synced lesson and native-lesson-pin fails printing the new value.
  source: { fingerprint: '56c725c5', title: 'Introduction to Investing', reviewedAt: '2026-10-13' },
  num: 1,
  title: 'Introduction to Investing',
  xp: 30,
  steps: [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13],
  challenge,
};
